"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-3: 模型-系统协同设计实现高性价比解码</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Step-3 is Large yet Affordable: Model-system Co-design for Cost-effective Decoding
作者: StepFun Inc.
原文链接: arXiv:2507.19427v1 [cs.LG]
发布日期: 2025 年 7 月 25 日
精译日期: 2026 年 5 月 18 日</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>大型语言模型(LLM)在解码阶段面临硬件效率低下的问题,尤其是在长上下文推理任务中。本文介绍 Step-3,一个 3210 亿参数的视觉语言模型(VLM),采用硬件感知的模型-系统协同设计,以最小化解码成本为优化目标。Step-3 在两个关键维度上进行了创新:(1)一种新颖的多矩阵分解注意力(MFA, Multi-Matrix Factorization Attention)机制,在保持高注意力表达能力的同时,显著降低了 KV 缓存大小和计算量;(2)注意力-前馈网络解耦(AFD, Attention-FFN Disaggregation),一种将注意力层和前馈网络(FFN)层解耦为专用子系统的分布式推理系统。</p>
<p>这种协同设计实现了前所未有的成本效率:与 DeepSeek-V3(DSv3)和 Qwen3 MoE 235B 等模型相比,Step-3 显著降低了理论解码成本,且上下文越长优势越大。Step-3 在激活 380 亿参数 per token(多于 DSv3 和 Qwen3 MoE 235B)的情况下实现了低成本,这表明硬件对齐的注意力算术强度、MoE 稀疏度和 AFD 对成本效益至关重要。</p>
<p>我们在对 DSv3 有利的场景下进行了正面比较。我们在 Hopper GPU 上的实现在 50ms TPOT SLA 下实现了每 GPU 最高 4039 tokens/s 的解码吞吐量(4K 上下文,FP8,无 MTP)。这高于 DSv3 在相同设置下的 2324 tokens/s,为 LLM 解码设定了新的帕累托前沿。</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>本文介绍 Step-3 的模型-系统协同设计,专门针对测试时扩展范式,主要优化目标是最小化解码成本。Step-3 共有 3210 亿总参数,每个文本 token 激活 380 亿参数。我们将证明,尽管 Step-3 属于数百亿参数级别且激活参数略多于 DSv3 等代表性开源权重模型,但通过模型-系统协同设计,我们实现了显著更低的解码成本。</p>
<p>我们专注于优化解码,原因如下:</p>
<ol>
<li>与训练和预填充(prefill)相比,解码的每 token 成本最高(因为 MFU 低)。</li>
<li>对于推理模型,更长的思考链带来更高的智能水平,因此降低解码成本可以在固定预算下转化为更高的智能。</li>
<li>更快更便宜的解码也能加速 RL 训练。</li>
<li>优化空间很大,因此更具技术趣味性。</li>
</ol>
<p>最近出现了多个大型开源权重模型。其中一些在传统 Transformer 基础上探索了新颖的架构变革。创新集中在 Transformer 的两个主要组件上:有新的注意力设计来减少推理时的 KV 缓存开销,也有混合专家(MoE)结构来增强 FFN 同时限制计算需求的增长。</p>
<p>我们也一直在进行模型架构探索,例如从 2023 年底开始的 MoE 模型开发(Step-2 [20])和 2024 年底发布的 MFA [7]。在此过程中,观察近期开源模型,我们识别出两个常见的次优实践:</p>
<ul>
<li>对于注意力,一些模型过度强调减少 KV 缓存大小,以过度的计算负载为代价。这使得模型在更便宜但更弱的硬件上运行时的成本效益降低。同时,它限制了其他加速技术(如量化和投机解码)的空间。</li>
<li>对于 FFN,一些模型过度追求更稀疏的架构,而不考虑是否适合当今的硬件。这要么损害硬件效率,要么在无法获得成本优势的情况下降低模型性能。</li>
</ul>
<p>我们希望激发更多关于上述趋势的讨论和反思,因此报告我们的最新进展 Step-3 及其设计背后的分析和原理。结果是令人鼓舞的——在图 1 中,我们展示了 Step-3 和近期模型的最佳理论解码成本。对于每个模型,我们基于 AFD(第 3 节)搜索最佳部署策略,并考虑 H800、H20、A800 或昇腾 910B 的任意组合。Step-3 大幅提升了激活参数与解码成本的帕累托前沿。虽然图中未显示,但它的优势随着上下文变长而继续扩大。</p>
<p>我们的工作基于部署预填充-解码(PD)解耦 [18, 31] 的前期工作。有了它,我们可以只专注于优化解码,而不用担心对预填充的影响。读者将看到部署 AFD 的类似好处,即它如何让我们分而治之地处理注意力和 FFN 设计。这导致了一个架构,其两个部分都更具成本效益。我们实现了推理系统并展示了 Step-3 确实比其他数百亿参数模型实现了更低的解码成本。</p>
<p>以下是我们的核心发现摘要:</p>
<ul>
<li><strong>解码成本超越参数数量</strong>:总参数数量或激活参数数量都不是解码成本的良好指标。例如,Qwen-3 MoE 235B 的总参数比 DSv3 少 65%、激活参数少 40%,但理论解码成本(在 H20 上,其最佳硬件)仅比 DSv3(在 H800 上,DSv3 的最佳硬件)低 10%。Step-3 的总参数介于两者之间且激活参数最高,却实现了比两者低约 40% 的解码成本。</li>
<li><strong>注意力设计主导解码成本</strong>:通过 AFD,我们将注意力和 FFN 的成本分析解耦,因为可以分别以最具成本效益的方式运行它们。然后很明显,注意力设计对解码成本的影响大于(总或激活)参数数量。</li>
<li><strong>KV 缓存大小不是影响注意力成本的唯一因素</strong>:我们发现某些注意力设计对于低成本硬件平台需要过多的计算(算术强度过高)。更重要的是,我们是第一个证明这个问题确实影响最终解码成本,从而为 Step-3 实现显著成本节约留下很大空间。</li>
<li><strong>MoE 需要硬件感知设计</strong>:MoE 稀疏度必须联合考虑硬件的计算能力、内存带宽和网络带宽。过度稀疏的模型在纸面上可能有较小的激活参数,但在当今硬件上运行效率低下。</li>
<li><strong>解码加速,细节决定成败</strong>:线性注意力、量化和 MTP 都是加速解码的有前景的方向。然而,一些看似细微的设计点可能会消除解码中的大部分收益。</li>
<li><strong>AFD 部署</strong>:我们相信它是优于现有解决方案的解码系统设计,原因如下独特优势:<ul>
<li>促进分而治之的模型设计。</li>
<li>易于扩展注意力实例以处理动态上下文长度。</li>
<li>始终保持 FFN 的理想批大小以实现高 MFU,与注意力无关。</li>
<li>通过完美平衡的流水线重叠通信开销。</li>
<li>相比 DeepEP [30] 降低规模要求,获得更好的可靠性和更少的 EP 不平衡。</li>
<li>允许使用异构硬件以进一步降低解码成本。</li>
</ul>
</li>
</ul>
<blockquote>
<p><strong>译者思考：设计动机</strong></p>
<p>Step-3 的出发点是&quot;解码阶段的成本焦虑&quot;。在测试时扩展(test-time scaling)范式下,模型通过生成更长的推理链来提升能力,但这直接转化为更高的推理成本。DeepSeek-R1 的推理链可能长达数万 token,Qwen3 的长思考模式也遵循同样的逻辑。阶跃星辰团队识别出一个关键矛盾:模型能力的提升路径(更长思考)与商业可行性(成本控制)之间存在张力。</p>
<p>传统上,模型架构设计和推理系统优化是两个分离的领域。架构团队设计模型时考虑的是训练效率和模型能力,系统团队部署时再做工程优化。Step-3 的核心洞察是:只有当架构设计和系统部署被联合考虑时,才能实现真正的成本优化。这就是为什么他们提出了 AFD——不是单纯的系统优化技巧,而是一种重新思考模型架构设计的方法论。</p>
<p>作者对行业趋势的批评也值得关注。MLA(如 DSv3 所用)过度压缩 KV 缓存,代价是注意力计算中的高算术强度,在低带宽硬件上表现糟糕。而某些 MoE 设计过度追求稀疏度,忽视了网络带宽瓶颈。Step-3 试图在两个维度上都找到&quot;甜点&quot;。</p>
</blockquote>
<hr>
<h2 id="2-step-3-mxkp">2 Step-3 模型卡片</h2>
<p>在深入模型-系统协同设计细节之前,我们简要描述 Step-3。</p>
<p>Step-3 基于 Transformer 架构 [24],每个 Transformer 块包含一个注意力模块和一个前馈网络(FFN)。对于注意力机制,我们引入了多矩阵分解注意力(MFA) [7],它在 Query-Key(QK)电路 [5] 中利用低秩矩阵分解。这种设计在最小化 KV 缓存开销的同时,实现了注意力头数量和维度的参数高效扩展。对于 FFN,我们采用受 DeepSeekMoE 启发的共享专家设计,引入了混合专家(MoE)层。</p>
<p>我们的配置包括 61 个 Transformer 层,隐藏维度为 7168。对于 MFA,我们配置 64 个 Query 头,它们共享 1 个 Key 头和 1 个 Value 头,所有头的维度均为 256。Query 维度先从 7168 降维到 2048 的低秩,经过归一化,然后升维到 64×256。MoE 层应用于除前 4 层和最后一层外的所有 FFN。在此配置下,Step-3 的 LLM 部分包含 3160 亿参数,每个 token 激活 380 亿参数。另有 50 亿参数的视觉Encoder ,本文不讨论,因为它与解码无关。</p>
<p>未来我们将发布更多 Step-3 模型方面的细节。</p>
<p><strong>表 1: Step-3 模型卡片</strong></p>
<table>
<thead>
<tr>
<th>参数</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>层数</td>
<td>61</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>7168</td>
</tr>
<tr>
<td>注意力机制</td>
<td>MFA</td>
</tr>
<tr>
<td>低秩 Query 维度</td>
<td>2048</td>
</tr>
<tr>
<td>Query 头数</td>
<td>64</td>
</tr>
<tr>
<td>头维度</td>
<td>256</td>
</tr>
<tr>
<td>共享专家数</td>
<td>1</td>
</tr>
<tr>
<td>MoE 层配置</td>
<td>除前 4 层和最后一层外的所有层</td>
</tr>
<tr>
<td>总参数(LLM)</td>
<td>3160 亿</td>
</tr>
<tr>
<td>每 token 激活参数</td>
<td>380 亿</td>
</tr>
<tr>
<td>总参数(VLM)</td>
<td>3210 亿</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者思考：架构细节</strong></p>
<p>模型卡片揭示了几个关键设计选择:</p>
<p><strong>MFA 注意力</strong>:64 个 Query 头共享 1 个 KV 头,这是 GQA(Grouped Query Attention)思想的延伸,但加入了低秩分解。Query 先降维(7168→2048)再升维(2048→16384)的设计意味着注意力计算在低维空间进行,减少了 KV 缓存(因为 KV 头数少)和注意力计算的 FLOPs(因为 QK 计算在低秩空间)。但升维操作本身引入了额外的计算,这是一个需要权衡的点。</p>
<p><strong>MoE 配置</strong>:61 层中 56 层使用 MoE,稀疏度约为 0.08(3 个专家从 48 个中选择,加上 1 个共享专家:(3+1)/48 ≈ 0.083)。这个稀疏度高于 DSv3 的 8/256 = 0.031,意味着 Step-3 在每个 token 上激活了相对更多的专家参数。这与作者批评&quot;过度稀疏&quot;的立场一致——Step-3 选择了更保守的稀疏度以确保硬件效率。</p>
<p><strong>视觉Encoder 独立</strong>:50 亿参数的视觉Encoder 与解码无关,说明本文的核心贡献确实是围绕文本解码的成本优化。视觉Encoder 只在预填充阶段参与(将图像转换为文本 token),不影响自回归解码。</p>
</blockquote>
<hr>
<h2 id="3-afd-fbstlxt">3 AFD 分布式推理系统</h2>
<h3 id="3-1-afd-sjdj">3.1 AFD 设计动机</h3>
<p>在深入 AFD 设计之前,我们简要介绍为什么需要 AFD。注意力和 FFN 在解码阶段展现出根本不同的计算特性:</p>
<ul>
<li><strong>注意力</strong>:主要受限于内存带宽,因为需要频繁访问 KV 缓存。计算量随上下文长度线性增长。</li>
<li><strong>FFN</strong>:主要受限于计算能力,因为涉及大规模矩阵乘法。计算量与上下文长度无关。</li>
</ul>
<p>传统上,两者在同一 GPU 上运行,导致资源利用率不均衡。AFD 的核心思想是将它们解耦:</p>
<ul>
<li><strong>注意力实例</strong>:部署在内存带宽大的硬件上,专门处理注意力计算和 KV 缓存管理。</li>
<li><strong>FFN 实例</strong>:部署在计算能力强的硬件上,专门处理前馈网络计算。</li>
</ul>
<p>为了实现最佳整体性能,两侧的延迟必须精确匹配;任何不平衡都会导致流水线停顿或资源利用不足。因此,必须联合编排 A/F 和通信阶段的性能。</p>
<p>我们总结 AFD 的设计目标如下,稍后将详细讨论:</p>
<ul>
<li><strong>性能目标</strong>:通过 3 阶段流水线实现 50ms 每输出 token 时间(TPOT,即 20 tokens/s),A/F/通信分别分配到 16.6ms。这里的时间是跨所有模型层累计的。</li>
<li><strong>流水线优化</strong>:资源分配和性能调优,实现完美的 A/F/通信多阶段流水线,隐藏通信延迟。</li>
<li><strong>A/F 独立设计</strong>:通过 AFD,我们可以独立分析注意力和 FFN 的运行特性。这种分离不仅使每个子系统得到最优优化,还允许对模型本身进行灵活的架构修改。</li>
<li><strong>硬件选择</strong>:基于运行特性为注意力和 FFN 子系统独立选择硬件。</li>
</ul>
<blockquote>
<p><strong>译者思考：设计动机</strong></p>
<p>AFD 的核心洞察可以用一句话概括:&quot;不要让 FFN 等待注意力,也不要让注意力拖累 FFN&quot;。在传统部署中,Attention 和 FFN 在同一张 GPU 上交替执行。当上下文变长时,Attention 的 KV 缓存访问成为瓶颈,FFN 的计算能力被闲置;当批大小很小时,FFN 无法达到高 MFU,计算资源被浪费。</p>
<p>AFD 的解耦意味着:</p>
<ol>
<li>注意力侧可以独立扩展——上下文长了就加注意力 GPU,不影响 FFN 的批大小。</li>
<li>FFN 侧可以始终保持大批处理——无论注意力侧怎么变,FFN 都能积累足够的 batch size 达到计算饱和。</li>
<li>硬件选型更灵活——可以给注意力配 H20(高内存带宽),给 FFN 配 H800(高算力),实现异构部署。</li>
</ol>
<p>50ms TPOT = 20 tokens/s 是一个严格的服务等级目标(SLA)。对于聊天机器人等实时应用,超过 100ms 的延迟用户就能感知到卡顿。Step-3 的目标是将每 token 的端到端延迟控制在 50ms 以内,这需要将 61 层 Transformer 的 A→F→通信三段流水线每段控制在 16.6ms 以内。</p>
</blockquote>
<h3 id="3-2-yxggzdbj">3.2 与相关工作的比较</h3>
<p><strong>DeepSeek EP</strong>:DeepSeek-V3 [4] 引入了大专家并行(EP)架构以提高服务效率。虽然 EP 也通过将专家权重分布到多个设备来促进批大小放大,但我们认为与 AFD 相比,这种方法存在根本性局限:</p>
<ul>
<li><strong>部署规模</strong>:AFD 的一个关键优势是能在较小的部署规模下高效运行。如前所述,DSv3 需要 320 个 GPU 构成一个解码实例,而 Step-3 仅使用 32 个 GPU(第 7.3 节)。如果部署规模显著扩大,网络拥塞会成为关键问题 [29],导致延迟增加且不可预测。这种增加的延迟会严重影响服务系统满足推理 SLA 的能力。</li>
<li><strong>上下文长度效率</strong>:长上下文处理对 EP 的注意力层造成不成比例的负担,导致 FFN 因固定的专家-节点分配而利用不足。AFD 通过解耦的注意力与 FFN 扩展解决了这个问题。我们将在第 4 节给出不同上下文长度的定量结果。</li>
<li><strong>负载不平衡问题</strong>:EP 存在众所周知的工作负载不平衡问题 [13, 14]。DeepSeek-V3 通过复制专家来缓解这个问题,可以临时平衡每个 GPU 的工作负载。但这种方法会产生额外的内存开销,且对动态工作负载变化不灵活,特别是当数据分布显著变化时。另一方面,AFD 可以轻松利用混合 TP-EP 策略,在计算效率、通信流量和负载平衡之间取得平衡。</li>
<li><strong>异构硬件约束</strong>:AFD 实现更灵活的硬件部署,因为注意力和 FFN 实例可以映射到针对其各自计算和内存需求定制的异构硬件,而 EP 强制同质硬件部署,限制了专业化收益。</li>
<li><strong>性能建模</strong>:我们的分析框架利用注意力和 FFN 的架构解耦。这种分离由于其不同的计算特性而提供了方法论上的清晰度,能够在显著缩小理论预测与实测之间差距的同时,更准确地建模性能上限。相反,纯 EP 架构缺乏这种分而治之的清晰度,在建耦合子系统时存在固有的分析模糊性。</li>
</ul>
<p>需要特别说明的是,AFD 不是 EP 的替代品,而是互补方法。事实上,Step-3 可以与 TP-EP 策略结合以获得更好的性能和成本效益。上述分析针对的是不使用 AFD 的纯 EP 架构,这是现有服务系统的常见做法 [4, 33]。</p>
<p><strong>Megascale-Infer</strong>:据我们所知,Megascale-Infer [32] 是第一个构建利用 AFD 思想的解耦服务系统的工作。然而,它专注于高吞吐量,而非同时提供实现低延迟目标(即 50ms TPOT)的实用实现。事实上,根据 [32] 的报告,Megascale-Infer 的每 token 延迟为 150ms,远高于我们的结果。如此高的延迟不适用于聊天机器人等实时应用。此外,Step-3 的核心在于模型-系统协同设计,我们使用 AFD 思想来设计 Step-3 的注意力层和 FFN 层架构,而 Megascale-Infer 主要只关注系统级优化。我们相信协同设计带来了更多机会来充分挖掘硬件能力。</p>
<hr>
<h2 id="4-llm-jmcbfx">4 LLM 解码成本分析</h2>
<p>基于 AFD 使注意力和 FFN 部分能够接近硬件极限运行的重要假设,我们现在深入每个模型的理论成本。我们将 Step-3 与近期发布的多个模型进行比较,包括 DSv3 [4]、Kimi K2 [17]、Qwen3-235B-A22B [8](简称 Qwen3-MoE)、Qwen3-32B [25]、Llama 4 Maverick [15]、MiniMax M1 [16](MM M1)、ERNIE 4.5 [22] 和 Pangu Pro MoE [21]。</p>
<h3 id="4-1-ll-flo-ps-hncfw">4.1 理论 FLOPs 和内存访问</h3>
<p>我们首先检查解码每个 token 所需的总体内存访问和计算操作。</p>
<p>鉴于各种量化方法直接影响内存访问和浮点计算类型,我们为每个模型选择了广泛使用的量化版本:</p>
<ul>
<li><strong>MLA 家族</strong>:DSv3 的官方实现对注意力使用 BF16,其他部分使用 FP8。但考虑到开源社区中存在 MLA 的 FP8 量化版本,我们对整个模型采用 FP8 量化。同样的量化应用于 Kimi K2。</li>
<li><strong>GQA 家族</strong>:Qwen3 的官方发布包括完整的 FP8 量化,我们将采用。对于其他模型如 ERNIE 4.5 和 Pangu Pro MoE,为了与 Qwen3 对齐,我们也使用相同的量化。鉴于我们对 GQA 模型的经验,我们相信模型精度损失的风险很低。</li>
<li><strong>混合模型</strong>:Llama 4 Maverick 和 MiniMax M1 的官方量化较为保守,尤其是注意力部分。由于混合注意力模型的量化对我们来说在很大程度上仍是未知领域,我们主要遵循官方设置,即对完整注意力层使用 BF16 KV,因为它们对长上下文任务至关重要。我们对 MiniMax M1 的 Lightning Attention 状态使用 FP32,与其官方设置相同。我们对 Llama 4 Maverick 的分块 GQA 注意力使用 FP8(再次基于我们对 GQA 的经验)。对于所有其他部分,我们采用与其他评估模型相同的激进 FP8 量化,以实现公平比较。</li>
<li><strong>Step-3</strong>:我们已成功将 Step-3 量化为完整的 FP8 模型且不损失模型精度。因此我们使用完整的 FP8 量化,与 MLA 和 GQA 家族对齐。</li>
</ul>
<p>如果硬件不支持 FP8 量化,我们假设使用 INT8 权重和 INT8 KV 缓存代替 FP8,因此内存访问保持不变。计算将在 BF16 或 FP16 中进行。</p>
<p>结果列于表 2 和表 3。基于 AFD 的假设,我们将模型成本分为三部分:注意力(不含线性投影)、注意力前后的线性投影,以及 FFN。</p>
<p>对于第一部分,我们同时考虑 KV 缓存大小和计算,因为它们随批大小和上下文长度线性增长。</p>
<p>对于注意力前后的线性投影,我们假设在有足够批处理的情况下可以达到计算受限性能。在这种情况下,权重的内存访问被摊销,成本将由 FLOPs 决定。有一个例外:MLA 和 MFA 的 q/k/v_proj 可能无法在 H800 的计算受限区域运行,因为这些部分对 TP 不友好,且可能没有足够大的批大小。这意味着我们略微低估了 MLA 和 MFA 在 H800 上的成本。然而,这是总成本中相对较小的部分且特定于 H800,为简化起见我们省略。</p>
<p>对于 FFN,我们只关注激活的计算量,因为使用 AFD 对于不太稀疏的 MoE,总能积累足够的批大小使 FFN 达到高 MFU 并摊销权重的内存访问。关于 MoE 稀疏度的更多细节在第 5 节讨论。在最坏情况下,像 DSv3、Kimi K2 和 Llama 4 Maverick 这样过度稀疏的模型在 H800 上的实际 FFN 成本可能翻倍甚至三倍。为简化起见,我们暂时忽略这一点并给它们一个优惠。</p>
<p>我们还省略了嵌入表和最终输出线性层,因为它们在这些模型中消耗的内存访问和计算相对较小(&lt;5%),且在不同模型之间差异不大。</p>
<p><strong>表 2: 8K 上下文长度下每解码 token 的理论计算和内存访问</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>KV/State 内存访问(bytes)</th>
<th>注意力计算(不含线性)(FLOPs)</th>
<th>注意力前后线性(FLOPs)</th>
<th>FFN 计算(FLOPs)</th>
</tr>
</thead>
<tbody><tr>
<td>DSv3</td>
<td>2.88×10^8</td>
<td>1.47×10^11</td>
<td>2.28×10^10</td>
<td>4.84×10^10</td>
</tr>
<tr>
<td>Kimi K2</td>
<td>2.88×10^8</td>
<td>7.37×10^10</td>
<td>1.23×10^10</td>
<td>4.84×10^10</td>
</tr>
<tr>
<td>Qwen3 MoE</td>
<td>7.89×10^8</td>
<td>2.52×10^10</td>
<td>1.34×10^10</td>
<td>2.84×10^10</td>
</tr>
<tr>
<td>Qwen3 32B</td>
<td>1.07×10^9</td>
<td>1.72×10^10</td>
<td>1.21×10^10</td>
<td>5.03×10^10</td>
</tr>
<tr>
<td>Llama 4 M</td>
<td>1.01×10^9</td>
<td>8.05×10^9</td>
<td>6.04×10^9</td>
<td>2.42×10^10</td>
</tr>
<tr>
<td>MM M1</td>
<td>9.23×10^8</td>
<td>3.42×10^9</td>
<td>3.75×10^10</td>
<td>5.44×10^10</td>
</tr>
<tr>
<td>ERNIE 4.5</td>
<td>9.06×10^8</td>
<td>1.45×10^10</td>
<td>1.63×10^10</td>
<td>7.61×10^10</td>
</tr>
<tr>
<td>Pangu Pro</td>
<td>8.05×10^8</td>
<td>8.05×10^9</td>
<td>6.04×10^9</td>
<td>2.38×10^10</td>
</tr>
<tr>
<td>Step-3</td>
<td>2.56×10^8</td>
<td>3.27×10^10</td>
<td>2.07×10^10</td>
<td>5.33×10^10</td>
</tr>
</tbody></table>
<p><strong>表 3: 32K 上下文长度下每解码 token 的理论计算和内存访问</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>KV/State 内存访问(bytes)</th>
<th>注意力计算(不含线性)(FLOPs)</th>
<th>注意力前后线性(FLOPs)</th>
<th>FFN 计算(FLOPs)</th>
</tr>
</thead>
<tbody><tr>
<td>DSv3</td>
<td>1.15×10^9</td>
<td>5.89×10^11</td>
<td>2.28×10^10</td>
<td>4.84×10^10</td>
</tr>
<tr>
<td>Kimi K2</td>
<td>1.15×10^9</td>
<td>2.95×10^11</td>
<td>1.23×10^10</td>
<td>4.84×10^10</td>
</tr>
<tr>
<td>Qwen3 MoE</td>
<td>3.15×10^9</td>
<td>1.01×10^11</td>
<td>1.34×10^10</td>
<td>2.84×10^10</td>
</tr>
<tr>
<td>Qwen3 32B</td>
<td>4.29×10^9</td>
<td>6.87×10^10</td>
<td>1.21×10^10</td>
<td>5.03×10^10</td>
</tr>
<tr>
<td>Llama 4 M</td>
<td>2.21×10^9</td>
<td>1.41×10^10</td>
<td>6.04×10^9</td>
<td>2.42×10^10</td>
</tr>
<tr>
<td>MM M1</td>
<td>1.93×10^9</td>
<td>1.15×10^10</td>
<td>3.75×10^10</td>
<td>5.44×10^10</td>
</tr>
<tr>
<td>ERNIE 4.5</td>
<td>3.62×10^9</td>
<td>5.80×10^10</td>
<td>1.63×10^10</td>
<td>7.61×10^10</td>
</tr>
<tr>
<td>Pangu Pro</td>
<td>3.22×10^9</td>
<td>3.22×10^10</td>
<td>6.04×10^9</td>
<td>2.38×10^10</td>
</tr>
<tr>
<td>Step-3</td>
<td>1.02×10^9</td>
<td>1.31×10^11</td>
<td>2.07×10^10</td>
<td>5.33×10^10</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者思考：数据与实验</strong></p>
<p>表 2 和表 3 的数据非常有意思。在 8K 上下文下,Step-3 的 KV 内存访问(2.56×10^8 bytes)仅比 DSv3 的 MLA(2.88×10^8)低约 10%,但在 32K 上下文下优势扩大到约 11%。然而,Step-3 的注意力核心计算(FLOPs)显著低于 DSv3:8K 时 3.27×10^10 vs 1.47×10^11(约 1/4.5),32K 时 1.31×10^11 vs 5.89×10^11(约 1/4.5)。</p>
<p>这说明 MFA 的设计权衡是:小幅减少 KV 缓存(通过共享 KV 头),大幅削减注意力计算(通过低秩分解)。而 DSv3 的 MLA 则是大幅削减 KV 缓存(通过低秩 KV 压缩),但保留了较高的注意力计算量。</p>
<p>另一个有趣的对比是 Qwen3 32B:它的 KV 内存访问最高(1.07×10^9 at 8K),因为它是稠密模型,没有稀疏化。但它的注意力核心计算却最低(1.72×10^10),因为它使用标准的 GQA。这说明&quot;KV 小&quot;和&quot;计算少&quot;是两个独立的维度,Step-3 试图在两者之间找到平衡。</p>
<p>FFN 计算量方面,Step-3(5.33×10^10)与 DSv3(4.84×10^10)和 Qwen3 32B(5.03×10^10)处于同一量级,但 Step-3 的激活参数(38B)多于 Qwen3 32B(32B)。这是因为 Step-3 的 MoE 稀疏度更低(激活更多专家),计算量因此更大。</p>
</blockquote>
<h3 id="4-2-ymyjdlljmcb">4.2 以美元计的理论解码成本</h3>
<p>接下来,我们计算各模型在不同加速器上的理论解码成本。表 4 展示了加速器规格及其在公有云上的估计价格。</p>
<p>假设在理想情况下加速器持续以其峰值 FLOPs 和最大内存带宽运行,我们推导出浮点运算的单位成本(UFLOP)和内存访问的单位成本(Ubyte),如表 5 所示。</p>
<p><strong>表 4: 加速器规格对比</strong></p>
<table>
<thead>
<tr>
<th>加速器</th>
<th>每小时每卡价格(USD)</th>
<th>BF16/FP16 FLOPs</th>
<th>FP8 FLOPs</th>
<th>内存带宽(B/s)</th>
<th>计算-带宽比(roofline)</th>
</tr>
</thead>
<tbody><tr>
<td>NVIDIA H800</td>
<td>2</td>
<td>9.89×10^14</td>
<td>1.98×10^15</td>
<td>3.35×10^12</td>
<td>591</td>
</tr>
<tr>
<td>NVIDIA H20</td>
<td>0.8</td>
<td>1.48×10^14</td>
<td>2.96×10^14</td>
<td>4.00×10^12</td>
<td>74</td>
</tr>
<tr>
<td>NVIDIA A800</td>
<td>0.75</td>
<td>3.12×10^14</td>
<td>N/A</td>
<td>2.00×10^12</td>
<td>156</td>
</tr>
<tr>
<td>昇腾 910B</td>
<td>0.67*</td>
<td>2.80×10^14</td>
<td>N/A</td>
<td>1.60×10^12</td>
<td>175</td>
</tr>
</tbody></table>
<p>*我们没有公开可获得的 910B 定价。我们根据其 FLOPs 和 A800 的价格按比例估算。据我们所知,910B 有多个版本。我们展示的是我们知道的最弱(也 presumably 最便宜的)版本。</p>
<p><strong>表 5: 不同加速器满负载运行整月的单位成本</strong></p>
<table>
<thead>
<tr>
<th>加速器</th>
<th>每 FLOP 成本</th>
<th>每字节内存访问成本</th>
</tr>
</thead>
<tbody><tr>
<td>H800</td>
<td>2.80×10^-19</td>
<td>1.66×10^-16</td>
</tr>
<tr>
<td>H20</td>
<td>7.51×10^-19</td>
<td>5.56×10^-17</td>
</tr>
<tr>
<td>A800</td>
<td>6.68×10^-19</td>
<td>1.04×10^-16</td>
</tr>
<tr>
<td>910B</td>
<td>6.65×10^-19</td>
<td>1.16×10^-16</td>
</tr>
</tbody></table>
<p>注意力部分的公式为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Cost</mtext><mtext>Attn</mtext></msub><mo>=</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mtext>FLOP</mtext><mtext>Attn</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>FLOP</mtext></msub><mo separator="true">,</mo><msub><mtext>Byte</mtext><mtext>KV</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>byte</mtext></msub><mo stretchy="false">)</mo><mo>+</mo><msub><mtext>FLOP</mtext><mtext>Linear</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>FLOP</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Cost}_{\\text{Attn}} = \\max(\\text{FLOP}_{\\text{Attn}} \\times U_{\\text{FLOP}}, \\text{Byte}_{\\text{KV}} \\times U_{\\text{byte}}) + \\text{FLOP}_{\\text{Linear}} \\times U_{\\text{FLOP}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Cost</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Attn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">FLOP</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Attn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9275em;vertical-align:-0.2441em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FLOP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Byte</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2342em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KV</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">byte</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOP</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Linear</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FLOP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>假设使用 AFD 可以将 FFN 保持在计算受限区域,FFN 部分的理论成本就是计算成本:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Cost</mtext><mtext>FFN</mtext></msub><mo>=</mo><msub><mtext>FLOP</mtext><mtext>FFN</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>FLOP</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Cost}_{\\text{FFN}} = \\text{FLOP}_{\\text{FFN}} \\times U_{\\text{FLOP}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Cost</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOP</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FLOP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>结合注意力和 FFN 部分,我们得到表 6。</p>
<p><strong>表 6: 各模型在各硬件上的理论解码成本分析(USD)</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">注意力成本/1M tokens(8K)</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
<th align="center">注意力成本/1M tokens(32K)</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
<th align="center">FFN 成本/1M tokens</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td></td>
<td align="center">H800</td>
<td align="center">H20</td>
<td align="center">A800</td>
<td align="center">910B</td>
<td align="center">H800</td>
<td align="center">H20</td>
<td align="center">A800</td>
<td align="center">910B</td>
<td align="center">H800</td>
<td align="center">H20</td>
<td align="center">A800</td>
<td align="center">910B</td>
</tr>
<tr>
<td>DSv3</td>
<td align="center">0.054</td>
<td align="center">0.128</td>
<td align="center">0.114</td>
<td align="center">0.113</td>
<td align="center">0.197</td>
<td align="center">0.460</td>
<td align="center">0.409</td>
<td align="center">0.407</td>
<td align="center">0.014</td>
<td align="center">0.036</td>
<td align="center">0.032</td>
<td align="center">0.032</td>
</tr>
<tr>
<td>Kimi K2</td>
<td align="center">0.051</td>
<td align="center">0.065</td>
<td align="center">0.057</td>
<td align="center">0.057</td>
<td align="center">0.194</td>
<td align="center">0.231</td>
<td align="center">0.205</td>
<td align="center">0.204</td>
<td align="center">0.014</td>
<td align="center">0.036</td>
<td align="center">0.032</td>
<td align="center">0.032</td>
</tr>
<tr>
<td>Qwen3 MoE</td>
<td align="center">0.135</td>
<td align="center">0.054</td>
<td align="center">0.091</td>
<td align="center">0.101</td>
<td align="center">0.527</td>
<td align="center">0.185</td>
<td align="center">0.338</td>
<td align="center">0.376</td>
<td align="center">0.008</td>
<td align="center">0.021</td>
<td align="center">0.019</td>
<td align="center">0.019</td>
</tr>
<tr>
<td>Qwen3 32B</td>
<td align="center">0.181</td>
<td align="center">0.069</td>
<td align="center">0.120</td>
<td align="center">0.133</td>
<td align="center">0.716</td>
<td align="center">0.248</td>
<td align="center">0.455</td>
<td align="center">0.508</td>
<td align="center">0.014</td>
<td align="center">0.038</td>
<td align="center">0.034</td>
<td align="center">0.033</td>
</tr>
<tr>
<td>Llama 4 M</td>
<td align="center">0.169</td>
<td align="center">0.060</td>
<td align="center">0.109</td>
<td align="center">0.121</td>
<td align="center">0.369</td>
<td align="center">0.128</td>
<td align="center">0.235</td>
<td align="center">0.262</td>
<td align="center">0.007</td>
<td align="center">0.018</td>
<td align="center">0.016</td>
<td align="center">0.016</td>
</tr>
<tr>
<td>MM M1</td>
<td align="center">0.164</td>
<td align="center">0.079</td>
<td align="center">0.121</td>
<td align="center">0.132</td>
<td align="center">0.330</td>
<td align="center">0.135</td>
<td align="center">0.226</td>
<td align="center">0.249</td>
<td align="center">0.015</td>
<td align="center">0.041</td>
<td align="center">0.036</td>
<td align="center">0.036</td>
</tr>
<tr>
<td>ERNIE 4.5</td>
<td align="center">0.155</td>
<td align="center">0.063</td>
<td align="center">0.105</td>
<td align="center">0.116</td>
<td align="center">0.606</td>
<td align="center">0.214</td>
<td align="center">0.388</td>
<td align="center">0.432</td>
<td align="center">0.021</td>
<td align="center">0.057</td>
<td align="center">0.051</td>
<td align="center">0.051</td>
</tr>
<tr>
<td>Pangu Pro</td>
<td align="center">0.135</td>
<td align="center">0.049</td>
<td align="center">0.088</td>
<td align="center">0.098</td>
<td align="center">0.536</td>
<td align="center">0.183</td>
<td align="center">0.340</td>
<td align="center">0.379</td>
<td align="center">0.007</td>
<td align="center">0.018</td>
<td align="center">0.016</td>
<td align="center">0.016</td>
</tr>
<tr>
<td>Step-3</td>
<td align="center">0.048</td>
<td align="center">0.040</td>
<td align="center">0.040</td>
<td align="center">0.043</td>
<td align="center">0.176</td>
<td align="center">0.114</td>
<td align="center">0.120</td>
<td align="center">0.133</td>
<td align="center">0.015</td>
<td align="center">0.040</td>
<td align="center">0.036</td>
<td align="center">0.035</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者思考：数据与实验</strong></p>
<p>表 6 是本文最核心的定量结果。几个关键观察:</p>
<p><strong>观察 1:Step-3 的解码成本最低</strong>。在 8K 上下文下,Step-3 使用 AFD(H800+H20)的成本为每百万 token 0.055 美元,低于 DSv3(使用 EP+H800)的 0.068 和 Qwen3 MoE(使用 AFD+H800+H20)的 0.062。在 32K 上下文下优势更大:Step-3 为 0.129,显著低于 DSv3 的 0.211 和 Qwen3 MoE 的 0.193。</p>
<p><strong>观察 2:总参数和激活参数不是解码成本的良好指标</strong>。Qwen3 32B 的总参数远少于 DSv3 和 Step-3,激活参数也略少。然而,Qwen3 32B 的解码成本是所有模型中最高的。这说明&quot;小模型&quot;不等于&quot;低成本&quot;,稠密模型在长上下文下的 KV 缓存开销会迅速淹没参数数量的优势。</p>
<p><strong>观察 3:注意力成本主导总解码成本</strong>。在 8K 上下文下,注意力已经显著比 FFN 更贵。随着上下文变长,差距迅速扩大,因为 FFN 的成本与上下文长度无关。这意味着注意力设计比激活参数数量更重要。</p>
<p><strong>观察 4:硬件友好性</strong>。DSv3 的 MLA 对 H800 以外的硬件非常不友好,在比 H800 弱的硬件上成本增加数倍。GQA 模型如 Qwen3 对 H20 以外的硬件不友好,因为 KV 缓存太大。相比之下,Step-3 的 MFA 更具硬件友好性,在较弱硬件上的成本差异最小。</p>
<p>一个细节:Step-3 在 H800 上的注意力成本(0.048 at 8K)已经非常接近其在 H20 上的成本(0.040)。这说明 MFA 的算术强度与 H800 的 roofline(591)和 H20 的 roofline(74)都有较好的匹配,不像 MLA 只在 H800 上高效。</p>
</blockquote>
<h3 id="4-3-jmmxsjxz">4.3 揭秘模型设计选择</h3>
<p>本节讨论社区中正在进行的模型设计趋势,特别关注解码阶段。</p>
<p><strong>线性注意力与混合模型</strong>:线性注意力是一个有前景的方向,但在长上下文任务中仍面临挑战。一个实用的变通方案是&quot;混合模型&quot;,它由两种类型的注意力层组成:大多数是线性注意力,其余是传统的完整注意力。例如,MM M1 使用 70 层线性注意力和 10 层 GQA 完整注意力的混合架构,与 Qwen3 等全 GQA 模型相比,KV 增长随上下文长度显著更慢。Llama 4 Maverick 的设计类似,只是层数不同。</p>
<p>然而,这种混合模型对推理系统有两个额外的挑战。</p>
<p>第一,虽然完整注意力层的数量似乎很少,但它们可能毁掉使用线性注意力节省 KV 缓存的初衷。MM M1 和 Llama 4 Maverick 的完整注意力部分(基于官方量化方案)的 KV 缓存体积单独就超过了 Step-3 整个模型的 KV 缓存。无论其余线性注意力层节省多少,无论上下文多长,总内存访问都会大于 Step-3,如图 3 所示。</p>
<p>第二,每层花费的时间会严重不平衡——在长上下文运行时,完整 GQA 层消耗的时间远多于线性注意力层。对于单节点推理部署这可能不是问题,但对于分布式推理部署(尤其是 AFD)试图构建流水线隐藏通信时间时,层时间的不平衡会造成显著的流水线气泡。</p>
<p>我们呼吁对推理系统更友好的混合模型设计。应该仔细设计完整注意力部分,使其不毁掉线性注意力的成本节省。同时,尽量让每一层都是混合的,使每层的时间平衡,而不是有几层特别慢的层限制分布式流水线的潜力。</p>
<p><strong>&quot;硬件优化设计&quot;——为了训练还是解码?</strong>:为给定硬件优化模型设计不是新概念。本文中,我们包含 Pangu Pro MoE,一个声称专门优化华为自研加速器 910B 的模型。</p>
<p>然而,在我们的分析中,Pangu Pro MoE 在 910B 上的解码成本并不低——理论上远大于 Step-3(图 4)。记住,Pangu Pro MoE 只有 165 亿激活参数,不到 Step-3 的一半!显然,Pangu Pro MoE 在 910B 上的解码成本效益根本不高。</p>
<p>公平地说,Pangu Pro MoE 的主要关注点不是解码成本,而是训练。我们还展示了基于理论 FLOPs 假设 100% MFU 的每百万 token 训练成本粗略估计。我们看到,Pangu Pro MoE 的训练确实比 Step-3 便宜 50% 以上,反映了激活参数的差异。</p>
<p>教训是,在模型-系统协同设计期间要明确目标。训练和推理可能截然不同。训练成本主要与激活参数数量挂钩,而降低解码成本需要额外的模型-系统协同设计。</p>
<blockquote>
<p><strong>译者思考：局限与风险</strong></p>
<p>作者对混合线性注意力模型的批评非常尖锐但合理。MM M1 的 10 层完整 GQA 确实是一个&quot;阿喀琉斯之踵&quot;——无论你其他 70 层多么高效,这 10 层的 KV 缓存决定了内存访问的下限。这提醒我们:系统设计的整体效率受限于最慢的环节。</p>
<p>关于 Pangu Pro MoE 的分析也揭示了一个常见的陷阱:为特定硬件&quot;优化&quot;训练不等于优化推理。910B 的 roofline(175)与 H800(591)差异巨大,一个为 910B 训练优化的模型(低激活参数)可能在解码时因为 KV 缓存和网络带宽问题而表现不佳。这再次印证了 Step-3 的论点:解码优化需要独立的协同设计思维。</p>
<p>不过,我也注意到作者的分析假设了 100% MFU 和完美的通信隐藏,这在现实中很难达到。DSv3 使用 DeepEP 时实测网卡吞吐量只有 40GB/s 而非理论 50GB/s,这会导致 25% 的效率损失。Step-3 自己的 AFD 系统是否能真正达到理论值,还需要更多第三方验证。</p>
</blockquote>
<hr>
<h2 id="5-mx-xtxtsj">5 模型-系统协同设计</h2>
<h3 id="5-1-zylssqdyyjpp">5.1 注意力算术强度与硬件匹配</h3>
<p>细心的读者可能已经注意到,在表 2 和表 3 中,Step-3 的 MFA 相比 DSv3 的 MLA 在 KV 内存访问量上仅减少了约 10%。然而,在表 6 中,Step-3 的注意力成本在许多情况下减少了一半或更多。为什么?这源于 MFA 的设计。</p>
<p>如先前工作 [26, 27] 所指出的,每种注意力设计都有一个称为算术强度的固有属性。它是每从内存访问一字节 KV 所需的算术操作数之比。不同的批大小或上下文长度不会改变算术强度。</p>
<p>注意力算术强度与硬件&quot;计算-带宽比&quot;(或称 roofline,见表 4)的匹配程度越好,在该硬件上实现高效率的可能性越大。否则,可能会出现严重的瓶颈,要么是计算受限,要么是内存受限。</p>
<p>Step-3 的 MFA 设计中,其算术强度为 128(假设 KV 为 8 位量化)。这比 DSv3 的 MLA(算术强度为 512)更接近 A800(roofline 为 156)和 910B(roofline 为 175)。在 H20(roofline 为 74)上,Step-3 的差距相比 Qwen3 MoE(算术强度为 32)也不算太大。</p>
<p>为更好说明,我们在图 5 中展示了上述模型和硬件。我们展示了每种模型的计算和内存访问如何随上下文长度从 8K 增长到 32K。相应地,我们还根据各硬件的计算-带宽比绘制了斜线。</p>
<p>在图 5 中,也很清楚 Step-3 的 MFA 同时实现了低计算和低内存访问。即,其所需计算是 DSv3 的 1/4,所需内存访问是 Qwen3 的 1/3。这使 Step-3 即使在 roofline 与 Step-3 匹配不佳的加速器上也能保持低成本。</p>
<p>Step-3 的 MFA 实现了更均衡的算术强度和低开销,而没有偷工减料。事实上,其注意力有效秩 [7] 为 16384,与 DSv3 的 MLA 相同,大于 Qwen3 MoE 的 8192。</p>
<p>Step-3 选择略低于大多数硬件 roofline 的算术强度,为未来的优化(如量化和 MTP)留出空间,如下所述。</p>
<h3 id="5-2-tl-lhy-mtp">5.2 讨论:量化与 MTP</h3>
<p><strong>量化</strong>:所有模型都可以采用比我们假设的更激进的量化策略。一个特别值得注意的量化方法是低位存储高位计算,例如以 4 位存储 KV 但以 8 位执行注意力计算。这实际上将每种注意力设计的算术强度翻倍。这种变化对不同注意力设计有不同含义。我们仍以 DSv3、Qwen3 和 Step-3 为例:</p>
<ul>
<li><strong>对 DSv3 的影响</strong>:因为 DSv3 的算术强度已经接近于 H800 的 roofline 且远高于其他硬件,这种量化方案不会提高效率。</li>
<li><strong>对 Qwen3 的影响</strong>:这可能使 GQA 家族模型接近或超越 H20 的 roofline。它可以在所列的所有硬件上受益。</li>
<li><strong>对 Step-3 的影响</strong>:这可能使算术强度超过 A800 和 910B 的 roofline,但差距不大。应该有适度的性能提升。它在 H800 上(roofline 更高)可能受益很大。</li>
</ul>
<p>对于使用相同格式进行 KV 存储和注意力计算的量化方案(假设硬件有原生支持),我们预计这些不会显著改变不同模型的总体趋势。</p>
<p>关于混合模型如 MM M1,许多人(包括我们自己)可能想知道激进的 KV 量化是否可行。然而,鉴于只有 8 层完整注意力且它们可能对量化 KV 更敏感,我们在本文中采用更保守的方法——使用官方设置。我们期待这一话题的更深入研究。</p>
<p><strong>多 Token 预测(MTP)</strong>:MTP 和&quot;低位存储、高位计算&quot;量化方案对算术强度有类似影响——将其翻倍(甚至相乘)。因此,与前面的讨论类似,DSv3 是最不友好的 MTP 模型。GQA 和 MFA(Step-3)模型可以利用 MTP 在各种硬件上提升吞吐量。</p>
<p>然而,MTP 的影响是全局的——启用 MTP 也改变了 FFN 的计算负载。在 AFD 假设下,FFN 总能获得足够的批处理以高 MFU 运行(见下一节),MTP 实际上可能增加额外成本。MTP 在预测额外 token 时不是 100% 准确,但 FFN 的成本总是增加,无论预测准确性如何。在决定是否启用 MTP 时必须非常谨慎。</p>
<p><strong>总结</strong>:Step-3 的 MFA 设计及其算术强度允许应用进一步的 KV 量化或启用 MTP 来获得比表 6 中结果更大的成本节省。原则上,Qwen3 和其他基于 GQA 的模型可以从类似机制中受益。然而,由于其 MLA 的高算术强度,DSv3 在大批量、高吞吐量场景中可能不会从进一步的 KV 存储量化或启用 MTP 中看到实质性收益。</p>
<blockquote>
<p><strong>译者思考：设计动机</strong></p>
<p>算术强度(arithmetic intensity)是 roofline 模型的核心概念,它等于每字节内存访问所需的浮点运算数。一个设计的算术强度如果远低于硬件 roofline,意味着硬件算力被浪费(内存瓶颈);如果远高于 roofline,意味着内存带宽被浪费(计算瓶颈)。最佳匹配是两者接近。</p>
<p>Step-3 的算术强度为 128,位于各硬件 roofline 的中间地带:H800(591)远高于它(意味着 H800 上 MFA 是内存受限的,但 H800 内存带宽很大所以总体成本低),H20(74)略低于它(意味着 H20 上接近计算受限),A800(156)和 910B(175)略高于它(计算受限但差距不大)。</p>
<p>DSv3 的 MLA 算术强度 512 太高了——在 H800 上刚好匹配,但在 H20(74)、A800(156)和 910B(175)上严重计算受限,导致这些硬件上效率暴跌。Qwen3 的 GQA 算术强度 32 太低了——在所有硬件上都是内存受限的,但由于 GQA 的 KV 缓存太大,即使内存受限总成本也很高。</p>
<p>Step-3 选择 128 是一个精妙的平衡:它低于 A800/910B 的 roofline,留下了量化/MTP 的优化空间(可以将算术强度提升到 256,仍然不超过 A800/910B 的 roofline)。而如果一开始就选 256,量化后变成 512 就会像 DSv3 一样在低端硬件上崩溃。</p>
<p>MTP 的讨论也很有工程深度。MTP 不只是&quot;免费加速&quot;——它增加了 FFN 的计算量(因为每个 token 位置要预测多个未来 token),而 FFN 在 AFD 下已经以高 MFU 运行。所以 MTP 的收益需要与额外 FFN 成本相权衡。这解释了为什么 Step-3 的实验中不使用 MTP——在当前的优化状态下,FFN 已经是计算瓶颈,再加 MTP 可能反而降低吞吐量。</p>
</blockquote>
<h3 id="5-3-ffn-g-mfu-dpdxyq">5.3 FFN 高 MFU 的批大小要求</h3>
<p>接下来我们讨论前馈网络(FFN)的成本。FFN 计算的大部分涉及矩阵乘法,很小一部分用于激活函数。大多数内存访问用于模型权重,很小一部分用于输入和输出隐藏特征。为简化起见,我们重点关注矩阵乘法和模型权重访问。</p>
<p>对于 FFN 计算中的矩阵乘法,浮点运算数(FLOPs)为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>FLOPs</mtext><mo>=</mo><mn>2</mn><mo>×</mo><msub><mi>N</mi><mtext>token</mtext></msub><mo>×</mo><msub><mi>W</mi><mtext>FFN</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{FLOPs} = 2 \\times N_{\\text{token}} \\times W_{\\text{FFN}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">FLOPs</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">token</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mtext>token</mtext></msub></mrow><annotation encoding="application/x-tex">N_{\\text{token}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">token</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示批处理 FFN 计算中处理的 token 数量。在解码中,它等于进入 FFN 的批大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span>(无 MTP)。<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mtext>FFN</mtext></msub></mrow><annotation encoding="application/x-tex">W_{\\text{FFN}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示 FFN 中的模型权重数量。</p>
<p>显然,计算-内存访问比(假设 8 位权重存储)为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msub><mi>N</mi><mtext>token</mtext></msub></mrow><annotation encoding="application/x-tex">2 \\times N_{\\text{token}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">token</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,或 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>B</mi></mrow><annotation encoding="application/x-tex">2 \\times B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span>。</p>
<p>在 roofline 模型中,为了实现良好的 MFU,计算-内存访问比至少应匹配硬件的 roofline,如表 4 所示。对应的理想批大小,记为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>B</mi><mtext>dense</mtext></msub></mrow><annotation encoding="application/x-tex">B_{\\text{dense}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,至少应为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mtext>FLOPs</mtext><mrow><mn>2</mn><mo>×</mo><msub><mi>B</mi><mtext>dense</mtext></msub></mrow></mfrac><mo>≥</mo><mtext>Bandwidth</mtext></mrow><annotation encoding="application/x-tex">\\frac{\\text{FLOPs}}{2 \\times B_{\\text{dense}}} \\geq \\text{Bandwidth}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.1963em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOPs</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span></span></span></span></span><p>使用激活所有专家的批大小时,MoE 增加了内存访问与计算之间的比例。</p>
<p>我们定义 MoE 的稀疏度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span>。例如:</p>
<ul>
<li>如果从 8 个中选择 2 个专家,则 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo>=</mo><mn>1</mn><mi mathvariant="normal">/</mi><mn>4</mn></mrow><annotation encoding="application/x-tex">S = 1/4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/4</span></span></span></span>。</li>
<li>如果从 256 个中选择 8 个专家加上 1 个共享专家,则 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo>=</mo><mn>9</mn><mi mathvariant="normal">/</mi><mn>256</mn></mrow><annotation encoding="application/x-tex">S = 9/256</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">9/256</span></span></span></span>。</li>
</ul>
<p>对于 MoE 模型,高 MFU 的理想批大小为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>B</mi><mtext>MoE</mtext></msub><mo>=</mo><mfrac><msub><mi>B</mi><mtext>dense</mtext></msub><mi>S</mi></mfrac></mrow><annotation encoding="application/x-tex">B_{\\text{MoE}} = \\frac{B_{\\text{dense}}}{S}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0463em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这比稠密模型大几倍到几十倍。结合上述方程,我们得到:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mtext>FLOPs</mtext><msub><mi>B</mi><mtext>MoE</mtext></msub></mfrac><mo>≥</mo><mn>2</mn><mo>×</mo><mi>S</mi><mo>×</mo><mtext>Bandwidth</mtext></mrow><annotation encoding="application/x-tex">\\frac{\\text{FLOPs}}{B_{\\text{MoE}}} \\geq 2 \\times S \\times \\text{Bandwidth}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.1963em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOPs</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span></span></span></span></span><h3 id="5-4-zy-moe-xsd-vs-yj">5.4 最优 MoE 稀疏度 vs 硬件</h3>
<p>对于当代数百亿参数和长序列推理的模型,单机内存容量往往无法支持适当的批大小,需要分布式部署。无论使用 EP 部署 [30] 还是本文的 AFD,运行 FFN 计算的硬件需要通过网络接收输入隐藏特征(维度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span>)并通过网络传回 FFN 计算结果。假设 8 位精度分发和 16 位精度合并,且批大小满足高 MFU 要求,总传输量为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mn>3</mn><mo>×</mo><mi>H</mi><mo>×</mo><msub><mi>B</mi><mtext>MoE</mtext></msub></mrow><annotation encoding="application/x-tex">3 \\times H \\times B_{\\text{MoE}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>使用 AFD 和理想的三阶段流水线以及 50ms 的 TPOT 目标,我们需要将网络通信时间控制在 50ms/3 = 16.6ms 以内。我们记网络带宽为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Net</mtext></mrow><annotation encoding="application/x-tex">\\text{Net}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">Net</span></span></span></span></span>(与内存带宽 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Bandwidth</mtext></mrow><annotation encoding="application/x-tex">\\text{Bandwidth}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span></span></span></span> 区分),得到:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mn>3</mn><mo>×</mo><mi>H</mi><mo>×</mo><msub><mi>B</mi><mtext>MoE</mtext></msub></mrow><mrow><mtext>Net</mtext><mo>×</mo><mi>L</mi></mrow></mfrac><mo>≤</mo><mn>16.6</mn><mtext>ms</mtext></mrow><annotation encoding="application/x-tex">\\frac{3 \\times H \\times B_{\\text{MoE}}}{\\text{Net} \\times L} \\leq 16.6\\text{ms}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Net</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">L</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">16.6</span><span class="mord text"><span class="mord">ms</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 是模型层数。代入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>B</mi><mtext>MoE</mtext></msub></mrow><annotation encoding="application/x-tex">B_{\\text{MoE}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的表达式,我们得到:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mi>H</mi><mo>×</mo><mtext>FLOPs</mtext><mo>×</mo><mi>L</mi></mrow><mrow><mtext>Net</mtext><mo>×</mo><mi>S</mi><mo>×</mo><mtext>Bandwidth</mtext></mrow></mfrac><mo>≤</mo><mn>16.6</mn><mtext>ms</mtext><mo>×</mo><mfrac><mn>2</mn><mn>3</mn></mfrac><mo>=</mo><mn>11.1</mn><mtext>ms</mtext></mrow><annotation encoding="application/x-tex">\\frac{H \\times \\text{FLOPs} \\times L}{\\text{Net} \\times S \\times \\text{Bandwidth}} \\leq 16.6\\text{ms} \\times \\frac{2}{3} = 11.1\\text{ms}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Net</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">FLOPs</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16.6</span><span class="mord text"><span class="mord">ms</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">3</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">11.1</span><span class="mord text"><span class="mord">ms</span></span></span></span></span></span><p>我们可以推导出硬件可接受的&quot;最优 MoE 稀疏度&quot;,指硬件在实现理想 MFU 同时完美隐藏网络通信的情况下能支持的最稀疏 MoE 配置:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>S</mi><mo>≥</mo><mfrac><mrow><mi>H</mi><mo>×</mo><mtext>FLOPs</mtext><mo>×</mo><mi>L</mi></mrow><mrow><mtext>Net</mtext><mo>×</mo><mtext>Bandwidth</mtext><mo>×</mo><mn>11.1</mn><mtext>ms</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">S \\geq \\frac{H \\times \\text{FLOPs} \\times L}{\\text{Net} \\times \\text{Bandwidth} \\times 11.1\\text{ms}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8193em;vertical-align:-0.136em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Net</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">11.1</span><span class="mord text"><span class="mord">ms</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">FLOPs</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>接下来,我们以 Step-3 的 MoE 架构为例。其隐藏特征大小为 7168,层数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 为 61。这些数字与 DSv3 相同。我们代入各加速器的硬件参数。我们假设 H800 和 H20 使用 400Gbps × 8 网卡,而 A800 和 910B 使用 200Gbps × 8 网卡。</p>
<p><strong>表 7: 不同硬件平台实现良好 MFU 的最小 MoE 稀疏度</strong></p>
<table>
<thead>
<tr>
<th>加速器</th>
<th align="center">H800</th>
<th align="center">H20</th>
<th align="center">A800</th>
<th align="center">910B</th>
</tr>
</thead>
<tbody><tr>
<td>最小 S</td>
<td align="center">0.058</td>
<td align="center">0.007</td>
<td align="center">0.031</td>
<td align="center">0.034</td>
</tr>
</tbody></table>
<p>很明显,最优 MoE 稀疏度在不同硬件平台之间差异显著。H20 可以容纳最稀疏的 MoE 配置,因为其计算能力较低而内存带宽较高,允许它以较小的批大小实现高 MFU,更好地容忍 MoE 稀疏度。H800 对非常稀疏的 MoE 最不友好。然而,H800 的单位 FLOP 成本最低(表 5)。</p>
<p>为确保 Step-3 能利用 H800 等高 roofline 硬件,我们确保 Step-3 的稀疏度不低于 0.058。相比之下,DSv3 例如需要 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>256</mn><mo>+</mo><mn>1</mn><mo stretchy="false">)</mo><mo>×</mo><mn>0.058</mn><mo>−</mo><mn>1</mn><mo>=</mo><mn>14</mn></mrow><annotation encoding="application/x-tex">(256 + 1) \\times 0.058 - 1 = 14</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">256</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">0.058</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">14</span></span></span></span> 个 MoE 专家被激活才能在 H800 上实现良好的 MFU,远大于官方的 8 个激活专家。换句话说,如果 DSv3 激活更多专家,解码成本可能不会上升太多。这意味着它可能将额外的模型性能留在了桌面上。</p>
<p>更糟的是,不理想的硬件效率可能夸大这个问题。例如,在 H800 平台上使用 DeepEP [30] 时,实测平均每网卡吞吐量为 40GB/s 而非 50GB/s,这可能导致最优稀疏度增加 25%,例如 H800 上为 0.073。考虑到所有这些,Step-3 选择了约 0.08 的稀疏度(包括共享专家)。</p>
<p>更稀疏的 Llama 4 Maverick 和 Kimi K2 在 H800 上运行时,离高 MFU 区域会更远。</p>
<p>需要澄清,第 4 节的所有理论成本分析都通过假设所有网络通信都可以被重叠且所有 FFN 都能在高 MFU 状态下运行而忽略了网络瓶颈。本节讨论的网络瓶颈和 MoE 稀疏度问题将进一步增加 DSv3、Kimi K2 和 Llama 4 Maverick 等过度稀疏模型的实际成本。</p>
<blockquote>
<p><strong>译者思考：架构细节</strong></p>
<p>这一节的数学推导是本文的工程精华。让我用更直观的方式解释:</p>
<p><strong>核心矛盾</strong>:MoE 越稀疏(激活参数越少),每个 token 需要路由到更多的 GPU(EP 通信量增加),同时需要更大的批大小才能让每个专家达到高 MFU。但批大小受限于单机内存和网络带宽。</p>
<p><strong>公式推导</strong>:作者从三个约束出发——(1)FFN 计算要在 16.6ms 内完成,(2)FFN 要达到计算受限(MFU 高),(3)网络通信要在 16.6ms 内完成且被计算隐藏。联立这三个约束得到最小稀疏度 S 的公式。</p>
<p><strong>关键数字</strong>:</p>
<ul>
<li>H800 的最小 S = 0.058:这意味着在 H800 上,如果稀疏度低于 0.058(即激活专家占比 &lt;5.8%),就无法同时满足延迟和 MFU 要求。</li>
<li>DSv3 的实际稀疏度:8/(256+1) ≈ 0.031,远低于 H800 的 0.058。这意味着 DSv3 在 H800 上要么延迟超标,要么 MFU 很低。</li>
<li>Step-3 的稀疏度:4/48 ≈ 0.083(3 个路由专家+1 个共享专家),高于 H800 的 0.058 阈值,因此可以在 H800 上高效运行。</li>
</ul>
<p><strong>&quot;给对手优惠&quot;</strong>:作者多次提到&quot;给对手优惠&quot;(give them a favor)。这是一种学术诚实——在理论分析中故意忽略对竞争对手不利的因素(如 DSv3 的实际 EP 效率损失),即使如此 Step-3 仍然胜出。这让结论更有说服力。</p>
</blockquote>
<h3 id="5-5-tl-gdxsdbtfa">5.5 讨论:过度稀疏的变通方案</h3>
<p>上述关于稀疏度 S 的分析基于 AFD 的部署理念——使用刚好足够的 FFN 实例并积累大批大小以实现高 MFU。在相对较小的 TP 或 EP 部署中,每个 FFN 实例上的 MoE 稀疏度 S 与整个模型相同。例如,两台运行 DSv3 的 8-in-256 且 EP=2(以服务器计)的 FFN 实例意味着每个实例运行 4-in-128。每个服务器的 S 保持不变。</p>
<p>然而,有一些变通方案可以增加 S,以缓解网络瓶颈,但代价是其他方面。</p>
<p><strong>变通方案 1:大 EP</strong>。当 EP(以服务器计)足够大,特别是超过 K(激活专家数)时,每个 FFN(或 EP)服务器所需的网络流量减少。这就是 DSv3 官方部署使用超过 10 台服务器作为巨型 EP 部署的情况。</p>
<p><strong>变通方案 2:MoE 路由限制</strong>。将 token 路由限制到相邻专家也可以使每个本地模型部分不像整个模型那样稀疏。</p>
<p>DSv3 同时采用两种方法来缓解其在 H800 平台上的过度稀疏问题。Kimi K2 在变通方案 1 上跟随 DSv3,但取消了变通方案 2。这可能使其网络瓶颈比 DSv3 更严重。</p>
<p>我们必须注意,两种方法都有代价:</p>
<ol>
<li>变通方案 1 更容易受到专家不平衡问题的影响,降低实际效率。</li>
<li>变通方案 2 对模型的表达能力产生不利影响。对模型性能的影响尚未得到充分研究。</li>
</ol>
<p>Step-3 的设计避免了这种稀疏度问题,允许它在 AFD 期间使用小 TP、EP 或 TP+EP 混合方法。这最小化了专家不平衡的性能影响,且不需要任何路由限制。</p>
<hr>
<h2 id="6-fqjyjzc">6 非旗舰硬件支持</h2>
<p>通过 AFD,注意力和 FFN 组件都可以分别轻松扩展。这为利用非旗舰硬件处理注意力部分、FFN 部分或两者创造了更多机会。</p>
<p>例如,Step-3 在 H800 上运行的 MFA 工作负载是内存带宽受限的。它可以用四张 L20 替代,在 L20 上 MFA 仍然是内存带宽受限的。L20 的内存带宽超过 H800 的 25%,因此理论上,每张 L20 上 25% 的批大小,四张 L20 可以以 DP 方式运行得与一张 H800 一样快。得益于 AFD,我们不需要担心 FFN 部分——在讨论注意力部分时它可以保持不变。对于网络通信,L20 服务器需要 H800 服务器 25% 的带宽,即 4 × 200Gbps vs 8 × 400Gbps。这也容易满足。</p>
<p>主要限制是,对于注意力服务器和 FFN 服务器,较弱的硬件仍必须满足 AFD 三阶段或四阶段流水线的延迟要求以满足 SLA。</p>
<p>例如,三阶段流水线要求注意力和 FFN 计算都在 272μs × 61 层 = 16.6ms 内完成。我们以 L20 为例说明。</p>
<p><strong>注意力</strong>:我们将内存访问需求视为满足延迟要求的必要条件。一张 L20 可以在 272μs 内访问 864 GB/s × 272μs = 235 MB。线性部分需要总共 67 MB 的内存访问。因此,KV 缓存不能超过 235 - 67 = 168 MB。每个 token 的 KV 为 512 bytes,总推理上下文长度不能超过约 328K tokens。这意味着如果平均上下文长度为 8K tokens,将批大小保持在 41 以下就足够了。单个请求的最大上下文长度可达 328K,这仍然合理。当然,硬件不能总是以其峰值内存带宽运行,且我们省略了 GPU 间通信开销。但我们认为 L20 总体上能够运行 Step-3 的注意力部分。</p>
<p>然而,使用更弱的加速器如 L4(内存带宽 300 GB/s)将花费 272μs 时间框架的大部分来访问线性部分的 67 MB。因此,L4 不太可能用于 Step-3 的注意力。我们推荐至少与 L20 同等强大的加速器。</p>
<p>鉴于 Step-3 的 MFA 具有最小的 KV 体积和适中的算术强度,对于较弱硬件,它比其他类似规模的近期模型更具硬件友好性。</p>
<p><strong>FFN</strong>:与注意力类似,每个 FFN 层必须在 272μs 内完成。计算和内存访问都必须在此时间框架内完成。计算随批大小扩展,我们的目标是最大化批大小以将 FFN 推入计算受限(高 MFU)区域。为方便起见,我们假设适当的批大小将 FFN 推入计算受限区域,仅使用 50% 的内存带宽。实际场景可能有所不同,但我们以此为例。</p>
<p>对于 L20,这意味着它可以支持 FFN 最高达 864 GB/s × 50% × 272μs = 117 MB。对于 Step-3 的 61 层,总计 7.1 GB。每台服务器有 8 张 L20,可以容纳 56.8 GB 的 FFN 权重。对于 Step-3 的规模(约 300 GB FFN 权重),我们需要 6 台 L20 服务器,或 48 张卡,以 EP 方式运行以满足性能要求。我们认为这个数字是合理的,特别是因为它比 DSv3 的部署规模小得多。</p>
<p>再次考虑更弱的卡 L4,其内存带宽仅为 L20 的三分之一。这意味着我们需要 144 张卡来满足 Step-3 的 FFN 延迟要求。在这个规模下,我们开始担心其他问题,如专家不平衡、稳定性等。</p>
<p>这里的主要影响因素是 FFN 参数的总数。总参数越大,对弱硬件越不友好。Step-3 在 L20 卡级别上取得了良好的平衡。</p>
<p><strong>总结</strong>:对于数百亿参数的模型,建议使用至少 L20 或更强的卡。更强的卡减少了所需的 FFN 服务器数量,有利于系统可靠性和 MoE 负载平衡。</p>
<hr>
<h2 id="7-sxyjg">7 实现与结果</h2>
<h3 id="7-1-xtgzlyyh">7.1 系统工作流与优化</h3>
<p>我们在本节描述 AFD 系统的实现细节。如图 6 所示,AFD 架构由两个主要组件组成:</p>
<ol>
<li><strong>注意力实例</strong>:负责计算注意力模块、管理 KV 缓存、执行 MoE 模块中的非专家计算操作(如路由器)。对于 Step-3,我们采用本地 DP 注意力机制,其中每个 GPU 处理一批独立数据。</li>
<li><strong>FFN 实例</strong>:直接处理纯 MoE 计算和 TP 或 EP 所需的多 GPU 通信。由于 FFN 可以以 TP-only、EP-only 或混合 TP+EP 方式部署,FFN 实例被设计为灵活的,可以相应配置。我们以 TP-only FFN 为例,其中所有 MoE 专家的权重以张量并行方式分片。当 FFN 实例从注意力实例接收数据时,它首先执行 all-gather 操作以从 TP 区域收集数据。计算后,它执行 reduce-scatter 操作以聚合并将结果分散回原始 GPU,然后将 token 传输回注意力实例。</li>
</ol>
<p>系统可以配置为同时支持多个注意力和 FFN 实例。在通信期间,注意力实例将 FP8 token(从上游归一化后的 BF16 激活量化)广播给 FFN 实例;反之,FFN 实例向注意力实例返回 BF16 输出以保留高精度的残差。对于 Step-3,由于 FFN 实例以混合 EP+TP 方式跨多台机器,注意力实例引入了一个归约模块来组合来自多个 FFN 节点的部分 EP 结果。此外,注意力实例还需要传输一些小元数据,如专家分布和 FP8 张量缩放因子,给 FFN。专家分布随后用于分发 token 并形成组织化的输入以进行高效的专家计算。元数据通常比隐藏状态小得多,因此可以以可忽略的额外开销传输。</p>
<p>我们的 AFD 系统设计简单,允许轻松集成不同模型和服务框架。例如,我们的注意力实例基于 vLLM [12] 开发,改动最小,而 FFN 实例仅基于轻量级 C++ 通信库(将在第 7.2 节介绍)和简单的 PyTorch 接口实现,没有特殊依赖。</p>
<p><strong>多阶段流水线</strong>:Step-3 采用多阶段流水线来隐藏通信开销,从而最大化整体吞吐量。图 7 展示了多阶段流水线中的数据流。从注意力实例开始,系统接收三个输入样本(D1, D2, D3)。这些样本被顺序处理,然后通过网络传输到 FFN 实例进行计算。通过仔细的工作负载编排,每个计算阶段的计算时间被设计为几乎相同,实现高效流水线并最小化空闲时间。通信拓扑支持 GPU 之间的直接 RDMA,允许数据以最小延迟并行流式传输,这可以很容易地被计算隐藏。注意,图中为简单起见区分了 A→F 和 F→A 通信路径。然而,它们代表两个独立的通信,不竞争网络带宽,允许它们在实际中并发执行。当(D1, D2, D3)顺序返回注意力实例时,系统可以以流式方式开始处理下一层,记为图 7 中的(D1&#39;, D2&#39;, D3&#39;)。这种设计允许系统在保持低延迟的同时实现高吞吐量,因为关键路径不会延迟每个样本的处理。</p>
<p><strong>其他实现细节</strong>:我们将嵌入层和 LM head 层与注意力实例放在一起,因为它们产生的计算开销很小。我们为关键路径中的大多数内核开发了定制的内核优化,如 FP8 GEMM 和 Flash Attention。对于单节点内 TP 或 EP 的 NVLink 通信,我们利用 NVLS API 实现 all-gather 和 reduce-scatter 操作,不仅能饱和 NVLink 带宽,还能显著减少 GPU SM 使用(特别是我们的 all-gather 操作是 SM-free 的)。低 SM 使用率对于高效的通信-计算重叠至关重要,正如先前工作 [2, 28] 所揭示的。</p>
<h3 id="7-2-step-mesh-afd-txk">7.2 StepMesh:AFD 通信库</h3>
<p>AFD 对通信库提出了严格的性能挑战。对于 3 阶段流水线,AFD 要求在所有注意力和 FFN 实例之间完成 FP8 token、缩放因子、专家分布和 BF16 激活的传输,时间限制在 272μs(第 6 节)。现有通信库难以持续满足这一要求。此外,NCCL 和 DeepEP 等当前库引入了额外的 GPU SM 使用专用于通信,固有地损害了注意力和 FFN 的计算速度。AFD 还引入了一种新颖的通信模式,与现有集合操作不同且支持不佳。虽然可以使用 ncclSend/ncclRecv 等变通方案,但它们不可避免地牺牲性能。</p>
<p>为解决这些挑战,我们开发了 StepMesh,一个基于 GPUDirect RDMA 的 AFD 专用通信库,提供超低延迟、零 SM 使用和灵活通信。</p>
<p><strong>为 AFD 流水线定制的通信工作流</strong>:图 8 展示了 StepMesh 的设计选择,以最优对齐 AFD 流水线阶段。</p>
<ol>
<li><strong>异步 API 和专用线程</strong>:StepMesh 提供异步 API,并利用独立的线程进行网络接收和发送。每个线程的 CPU 延迟经过精心设计以满足严格的延迟要求,确保顺畅高效的数据流。</li>
<li><strong>基于 CPU 的操作执行</strong>:为避免与计算线程争夺 GPU SM 资源,StepMesh 在 CPU 上执行所有通信操作——如 RDMA PostSend。它利用 NUMA 感知的 CPU 核心绑定来最小化处理抖动并确保稳定性能。然而,我们仍然观察到某些源自 GPU API 的抖动,如 GPU 内核同步 API(cudaEventSync)。在未来迭代中,我们计划探索 IBGDA [9] 以消除 CPU 上的 GPU 内核同步,从而进一步降低通信延迟。</li>
<li><strong>预注册张量以实现高效通信</strong>:StepMesh 支持 GPU 张量的直接内存传输,无需序列化/反序列化或内存拷贝。StepMesh 要求用户在发起通信之前注册张量,通过唯一的张量键标识。这个注册过程是灵活的,可以移除一些耗时的操作。例如,FFN 不需要拼接来自不同注意力实例的张量。相反,这些张量可以直接从已预注册的连续 GPU 内存中切片,简化通信过程并提高效率。</li>
</ol>
<p><strong>支持异构加速器</strong>:图 9 展示了 StepMesh 框架,设计为高度可扩展,能够集成新型加速器。该框架将加速器视为后端,并建立了一组对 AFD 通信至关重要的后端接口。这些接口涵盖了内存分配和流同步等基本功能。通过遵循这些定义良好的接口,新加速器可以轻松集成到 StepMesh 框架中。这种简化的面向未来的集成过程允许快速采用新兴硬件技术,确保系统保持在性能和效率的前沿。StepMesh 支持异构加速器之间的无缝通信,促进不同类型硬件可以有效协作的环境。这种能力对于构建利用混合加速器以实现最佳性能和资源利用的成本效益 AFD 系统至关重要。</p>
<p><strong>与网络的协同进化</strong>:我们的 AFD 系统运行在 Rail-Optimized RoCE 网络上。针对在 RoCE 上部署 AFD 实现了以下优化:</p>
<ol>
<li><strong>拓扑感知部署</strong>:注意力和 FFN 实例战略性地连接到相同的架顶(ToR)交换机。这种部署确保任何注意力和 FFN 实例之间的通信经历统一的网络延迟,产生平衡的通信成本并缓解掉队问题——某些节点落后于其他节点,造成瓶颈。</li>
<li><strong>仅 PFC 传输</strong>:我们禁用拥塞控制,仅依赖 ToR-NIC 优先级流控(PFC)。PFC 维护无损网络环境,这对 AFD 流水线的高性能和低延迟要求至关重要。</li>
<li><strong>NIC 端口间流量平衡</strong>:在我们的网络中,每个 GPU 通过两个配置为链路聚合的 NIC 端口连接到网络。为充分利用可用带宽,对于每个通信对(例如注意力和 FFN 实例之间),我们建立两个 RDMA 队列对并分配给各自的端口。这种设置有效平衡了两个端口的流量,优化数据传输效率并确保组合带宽被有效利用。</li>
</ol>
<p>StepMesh 基于 [10] 开发,我们也将其作为开源项目提供。感兴趣的开发者可以通过访问 <a href="https://github.com/stepfun-ai/StepMesh">https://github.com/stepfun-ai/StepMesh</a> 来访问、贡献和使用该库。</p>
<blockquote>
<p><strong>译者思考：架构细节</strong></p>
<p>StepMesh 是 AFD 系统的通信引擎,其设计有几个值得注意的技术选择:</p>
<p><strong>CPU 端 RDMA</strong>:与 NCCL(在 GPU SM 上运行通信内核)不同,StepMesh 的 RDMA PostSend/PollCQ 完全在 CPU 上执行。这释放了 GPU SM 用于计算,对于 AFD 的流水线隐藏至关重要——如果通信占用了 SM,计算就被挤占了,流水线阶段时间就会拉长。</p>
<p><strong>预注册张量</strong>:避免了通信时的内存拷贝和拼接开销。这是一个工程上的细节优化,但对于 272μs 的严苛延迟预算,每微秒都很重要。</p>
<p><strong>仅 PFC 无拥塞控制</strong>:在 RoCE 网络中,PFC(Priority Flow Control)是一种链路层流量控制,可以防止网络丢包但可能导致 head-of-line blocking。StepMesh 选择完全依赖 PFC 而禁用更高层的拥塞控制,这是一种为了低延迟而牺牲网络公平性的设计——适合 AFD 这种封闭、可控的数据中心环境,但不适合共享网络。</p>
<p><strong>开源承诺</strong>:StepMesh 已开源,地址为 <a href="https://github.com/stepfun-ai/StepMesh%E3%80%82%E8%BF%99%E4%BD%BF%E5%BE%97%E7%AC%AC%E4%B8%89%E6%96%B9%E5%8F%AF%E4%BB%A5%E5%A4%8D%E7%8E%B0%E5%92%8C%E9%AA%8C%E8%AF%81">https://github.com/stepfun-ai/StepMesh。这使得第三方可以复现和验证</a> AFD 系统的性能,增强了结果的可信度。</p>
</blockquote>
<h3 id="7-3-xnjg">7.3 性能结果</h3>
<p><strong>端到端性能</strong>:我们将 Step-3 与 DSv3 进行比较,因为 DSv3 提出了最具代表性的分布式推理解决方案。其官方博客报告在 H800 上持续平均解码吞吐量为 1850 tokens/GPU/s(TGS),平均上下文长度为 4989。更高的峰值性能在 [3] 的性能分析中报告,在 H800 上 4096 上下文长度下达到 2324 TGS。两个数字都是在 20 tokens/s 解码 SLA 下获得的。</p>
<p>为进行直接比较,我们也在最新的 Hopper GPU 上测试 Step-3 的解码,平均上下文长度为 4096。GEMM 以 FP8 精度运行。在遵守 20 tokens/s 解码 SLA 的同时,Step-3 长期平均达到 3910 TGS,峰值分钟达到 4039 TGS(FP8 注意力),比 DSv3 高约 74%。我们在表 8 中总结了结果。我们承认,通过更多量化、内核优化或更好的 Hopper GPU,DSv3 仍有进一步提升的空间。然而,我们相信在相同优化水平和硬件下,Step-3 仍然能比 DSv3 实现显著更高的吞吐量。</p>
<p>我们仍在处理一些实现细节以减少抖动,将平均吞吐量拉近峰值吞吐量。这些数字是在没有 MTP 的情况下获得的。如第 5.2 节所述,Step-3 可以在 H20 以外的加速器上从 MTP 中显著受益。粗略估计有 50%(或更长上下文的更多)提升,因为注意力效率可以随着 MTP 翻倍而 FFN 保持不变(MFU 在没有 MTP 的情况下已经很高)。</p>
<p>对于上述 4K 上下文长度情况,我们使用 &quot;2A2F&quot; 部署,即两个注意力实例加两个 FFN 实例,共 32 张 GPU。总批大小为 6144,分为三个 2048 的微批以填充 3 阶段流水线。对于不同的平均上下文长度,我们可以简单地扩展注意力实例。例如,对于 8K 平均上下文长度,我们可以使用 &quot;4A2F&quot; 并保持相同的总批大小 6144。每个组件的延迟和 MFU 以及总网络流量将保持不变,因此 SLA 仍然满足,总吞吐量保持不变。峰值 TGS 将降至约 4039 × (2+2)/(4+2) = 2693。读者可以外推更长上下文的部署方案和性能数字,例如 &quot;16A2F&quot; 用于平均 32K 上下文长度,达到 898 TGS 等。</p>
<p>注意,上述场景是 Step-3 相比使用 EP 部署的 DSv3 成本节省优势最小的场景。Step-3 的优势将随着上下文变长和在比 H800 更便宜的硬件上而扩大(第 4 节)。</p>
<p><strong>表 8: 在 20 tokens/s 解码 SLA 下与 DSv3 报告数字的性能对比</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>平均上下文长度</th>
<th>Hopper GPU 数</th>
<th>峰值 TGS</th>
</tr>
</thead>
<tbody><tr>
<td>DSv3-blog [1]</td>
<td>4989</td>
<td>144</td>
<td>1850</td>
</tr>
<tr>
<td>DSv3-profile [3]</td>
<td>4096</td>
<td>128</td>
<td>2324</td>
</tr>
<tr>
<td>Step-3 (BF16 注意力)</td>
<td>4096</td>
<td>40 (3A2F)</td>
<td>3321</td>
</tr>
<tr>
<td>Step-3 (FP8 注意力)</td>
<td>4096</td>
<td>32 (2A2F)</td>
<td>4039</td>
</tr>
<tr>
<td>Step-3 (FP8 注意力)</td>
<td>8192</td>
<td>48 (4A2F)</td>
<td>2643</td>
</tr>
</tbody></table>
<p><strong>消融实验:注意力量化</strong>:我们之前对 Step-3 的结果是使用 FP8 注意力。我们还测试了 BF16 注意力以了解量化的收益。由于注意力成本增加,我们使用 &quot;3A2F&quot;,总批大小为 6048,接近之前的 6144。每个注意力实例然后处理每个微批 6048/3/3 = 672 个样本。如表 8 所示,结果为 3321 TGS,比 FP8 注意力低约 18%。但它仍然大幅超越 DSv3。</p>
<p><strong>消融实验:MFA</strong>:为了进一步了解性能收益,我们对 Step-3、DSv3 和 Qwen3-235B 的注意力层进行了消融研究。它们代表三种不同的注意力设计——MFA、MLA 和 GQA。由于我们只测试注意力层,该数字也指示了真实 AFD 部署中注意力实例的性能。如表 9 所示,MFA-Step3 实现了最低的延迟,其次是 MLA-DSv3 和 GQA-Qwen3。性能差距在 H20 和 A800 上扩大,表明 MFA 在低端加速器上更高效。此外,差距在更长的上下文长度上更大,这与我们在第 5 节的分析一致。</p>
<p><strong>表 9: MFA/MLA/GQA 性能对比</strong></p>
<table>
<thead>
<tr>
<th>上下文长度</th>
<th>注意力类型</th>
<th align="center">每层注意力时间(μs)</th>
<th align="center"></th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td></td>
<td></td>
<td align="center">H800</td>
<td align="center">H20</td>
<td align="center">A800</td>
</tr>
<tr>
<td>8K</td>
<td>MFA-Step3</td>
<td align="center">281</td>
<td align="center">438</td>
<td align="center">531</td>
</tr>
<tr>
<td></td>
<td>MLA-DSv3</td>
<td align="center">372</td>
<td align="center">1252</td>
<td align="center">-</td>
</tr>
<tr>
<td></td>
<td>GQA-Qwen3</td>
<td align="center">382</td>
<td align="center">812</td>
<td align="center">791</td>
</tr>
<tr>
<td>32K</td>
<td>MFA-Step3</td>
<td align="center">791</td>
<td align="center">1452</td>
<td align="center">3010</td>
</tr>
<tr>
<td></td>
<td>MLA-DSv3</td>
<td align="center">1125</td>
<td align="center">4817</td>
<td align="center">-</td>
</tr>
<tr>
<td></td>
<td>GQA-Qwen3</td>
<td align="center">1391</td>
<td align="center">3042</td>
<td align="center">1484</td>
</tr>
</tbody></table>
<p><em>对于 MLA,我们使用 FlashMLA,它没有官方 SM80 实现,因此其 A800 数字未测试。我们对 MFA/GQA 使用 FA3(SM90)和 FA2(SM80)。这里注意力层包括核心注意力操作前后的线性投影。每个实验使用 4 张 GPU,总批大小为 256。MFA 和 MLA 使用 DP 注意力,而 GQA 使用 TP 注意力。GEMM 使用 FP8(SM90)或 INT8(SM80),注意力使用 BF16。</em></p>
<p><strong>消融实验:将 Step-3 扩展到 600B+</strong>:读者可能想知道 Step-3 的优势有多少来自于总参数比 DSv3 少。我们考虑将 Step-3 的 MoE FFN 升级到 600B 参数区域(与 DSv3 类似大小)的情况。由于 FFN 翻倍,我们需要 &quot;4F&quot; 而非 &quot;2F&quot; 来保持每 token 延迟相同。然而,假设我们不增加每 token 的激活参数,升级后的 Step-3 将与 DSv3 有相同的过度稀疏问题并面临网络带宽限制。计算显示 400Gbps × 8 网络只能为每个 FFN 实例维持 3072(8 位分发,16 位合并)的微批大小。因此,最终方案是 &quot;3A4F&quot; 运行三个 3072 的微批。每个 A 和 F 的负载与原始 Step-3 相同或更少,因此 50ms TPOT SLA 仍然满足。在这种情况下,TGS 为 3291。它显示了过度稀疏的影响(第 5.4 节),与原始 Step-3 的 4039 相比。尽管如此,它仍然远高于 DSv3 使用 DeepEP 的 2324。如果我们进一步与使用 BF16 运行注意力的官方 DSv3 对齐,基于性能分析我们估计这种升级后的 Step-3 将运行在约 2880 TGS——它显示了 AFD 相比纯 EP 的优势。</p>
<blockquote>
<p><strong>译者思考：数据与实验</strong></p>
<p>表 8 和表 9 的实验结果非常扎实:</p>
<p><strong>端到端吞吐</strong>:Step-3 在 32 张 H800(2A2F)上达到 4039 TGS,比 DSv3 在 128 张 H800 上的 2324 TGS 高出 74%。但公平地说,DSv3 使用 128 张 GPU 可能是因为其 EP 部署需要更多节点来处理 256 个专家。Step-3 的 32 张 GPU 部署规模小得多,这本身也是一个优势——更少的节点意味着更低的运维复杂度和成本。</p>
<p><strong>BF16 vs FP8 注意力</strong>:FP8 注意力带来约 18% 的吞吐提升。这说明在当前优化水平下,注意力仍然是瓶颈之一(否则量化不会有这么大收益)。这也暗示了未来还有进一步优化的空间——如果注意力计算可以进一步减少(如通过更激进的低秩分解),FFN 可能成为新的瓶颈。</p>
<p><strong>MFA vs MLA vs GQA 的微观对比</strong>(表 9):在 H800 上,三者的差距相对较小(281 vs 372 vs 382 μs)。但在 H20 上,MFA(438)比 MLA(1252)快了近 3 倍,比 GQA(812)快了约 1.9 倍。这验证了作者的论点:MFA 的&quot;甜点&quot;算术强度使其在各种硬件上都能高效运行,而 MLA 只在 H800 上高效,GQA 只在内存带宽非常大的硬件上高效。</p>
<p><strong>A800 上 MLA 未测试</strong>:FlashMLA 没有 SM80 实现,这意味着 MLA 目前主要支持 Hopper 架构(SM90)。这是一个实际的部署限制——如果用户只有 A100/A800,就无法使用 MLA 的优化内核。</p>
<p><strong>600B 升级实验</strong>:这个消融实验非常聪明。它回答了&quot;如果 Step-3 也做到和 DSv3 一样大,还能赢吗?&quot;的质疑。答案是:即使 FFN 翻倍到 600B 参数(使用 3A4F),Step-3 仍然能达到 3291 TGS,远高于 DSv3 的 2324。这说明 Step-3 的优势不仅仅来自&quot;模型更小&quot;,而是来自 AFD 架构本身。</p>
</blockquote>
<hr>
<h2 id="8-jlywlgz">8 结论与未来工作</h2>
<p>本文介绍了 Step-3,以及其模型-系统协同设计如何在相似规模的 LLM 中实现最先进的解码效率水平。同时,我们也解释了如何利用 AFD 进行分析并实现 Step-3 的潜力。</p>
<p>我们的下一步是启用 MTP 并评估其对解码的性能提升。未来,我们将致力于探索新的注意力变体,继续推动模型容量和系统成本的帕累托前沿。</p>
<p>我们还分析了当今互连带宽限制了 MoE FFN 的稀疏度,如果目标是高效解码的话。为缓解这个问题,我们正在与硬件供应商合作开发新型高带宽域设计 [19]。有了适当的互连,我们将追求 FFN 的更稀疏化。</p>
<hr>
<h2 id="ckwx">参考文献</h2>
<p>[1] DeepSeek AI. Deepseek-v3 inference system. <a href="https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/">https://github.com/deepseek-ai/open-infra-index/blob/main/202502OpenSourceWeek/</a>, 2025.</p>
<p>[2] Li-Wen Chang 等. Flux: Fast software-based communication overlap on gpus through kernel fusion, 2024.</p>
<p>[3] DeepSeek. Profiling data in deepseek infra. <a href="https://github.com/deepseek-ai/profile-data/">https://github.com/deepseek-ai/profile-data/</a>, 2025.</p>
<p>[4] DeepSeek-AI. Deepseek-v3 technical report, 2025.</p>
<p>[5] Nelson Elhage 等. A mathematical framework for transformer circuits. Transformer Circuits Thread, 2021.</p>
<p>[6] Ethan He 等. Upcycling large language models into mixture of experts. arXiv:2410.07524, 2025.</p>
<p>[7] Jingcheng Hu 等. Multi-matrix factorization attention, 2025.</p>
<p>[8] Alibaba Inc. Qwen3: Think deeper, act faster, 2025.</p>
<p>[9] Nvidia Inc. Improving network performance of hpc systems using nvidia magnum io nvshmem and gpudirect async, 2025.</p>
<p>[10] Yimin Jiang 等. A unified architecture for accelerating distributed DNN training in heterogeneous GPU/CPU clusters. OSDI 20, 2020.</p>
<p>[11] Aran Komatsuzaki 等. Sparse upcycling: Training mixture-of-experts from dense checkpoints. ICLR, 2023.</p>
<p>[12] Woosuk Kwon 等. Efficient memory management for large language model serving with pagedattention, 2023.</p>
<p>[13] Jiamin Li 等. Accelerating distributed MoE training and inference with lina. USENIX ATC 23, 2023.</p>
<p>[14] Juncai Liu 等. Janus: A unified distributed training framework for sparse mixture-of-experts models. SIGCOMM 2023, 2023.</p>
<p>[15] Meta. Llama 4. <a href="https://www.llama.com/models/llama-4/">https://www.llama.com/models/llama-4/</a>, 2025.</p>
<p>[16] MiniMax. Minimax-m1: Scaling test-time compute efficiently with lightning attention, 2025.</p>
<p>[17] Moonshoot-AI. Kimi k2: Open agentic intelligence. <a href="https://moonshotai.github.io/Kimi-K2/">https://moonshotai.github.io/Kimi-K2/</a>, 2025.</p>
<p>[18] Pratyush Patel 等. Splitwise: Efficient generative llm inference using phase splitting, 2023.</p>
<p>[19] Chenchen Shou 等. Infinitehbd: Building datacenter-scale high-bandwidth domain for llm with optical circuit switching transceivers. arXiv:2502.03885, 2025.</p>
<p>[20] StepFun. Step 2. <a href="https://platform.stepfun.com/docs/llm/text">https://platform.stepfun.com/docs/llm/text</a>, 2025.</p>
<p>[21] Yehui Tang 等. Pangu pro moe: Mixture of grouped experts for efficient sparsity, 2025.</p>
<p>[22] ERNIE Team. Ernie 4.5 technical report, 2025.</p>
<p>[23] The SGLang Team. Deploying deepseek with pd disaggregation and large-scale expert parallelism on 96 h100 gpus. <a href="https://lmsys.org/blog/2025-05-05-large-scale-ep/">https://lmsys.org/blog/2025-05-05-large-scale-ep/</a>, 2025.</p>
<p>[24] Ashish Vaswani 等. Attention is all you need. NeurIPS, 2017.</p>
<p>[25] An Yang 等. Qwen3 technical report, 2025.</p>
<p>[26] Songlin Yang 等. Gated linear attention transformers with hardware-efficient training, 2024.</p>
<p>[27] Jingyang Yuan 等. Native sparse attention: Hardware-aligned and natively trainable sparse attention, 2025.</p>
<p>[28] Zili Zhang 等. Disttrain: Addressing model and data heterogeneity with disaggregated training for multimodal large language models, 2024.</p>
<p>[29] Chenggang Zhao 等. Insights into deepseek-v3: Scaling challenges and reflections on hardware for ai architectures. ISCA 25, 2025.</p>
<p>[30] Chenggang Zhao 等. Deepep: an efficient expert-parallel communication library. <a href="https://github.com/deepseek-ai/DeepEP">https://github.com/deepseek-ai/DeepEP</a>, 2025.</p>
<p>[31] Yinmin Zhong 等. DistServe: Disaggregating prefill and decoding for goodput-optimized large language model serving. OSDI 24, 2024.</p>
<p>[32] Ruidong Zhu 等. Megascale-infer: Serving mixture-of-experts at scale with disaggregated expert parallelism, 2025.</p>
<p>[33] Pengfei Zuo 等. Serving large language models on huawei cloudmatrix384, 2025.</p>
<hr>
<h2 id="fl-a-syb">附录 A:术语表</h2>
<table>
<thead>
<tr>
<th>术语</th>
<th>解释</th>
</tr>
</thead>
<tbody><tr>
<td>AFD</td>
<td>Attention-FFN Disaggregation,注意力-前馈网络解耦。将 Transformer 中的注意力层和 FFN 层分别部署到不同硬件子系统的分布式推理架构。</td>
</tr>
<tr>
<td>MFA</td>
<td>Multi-Matrix Factorization Attention,多矩阵分解注意力。Step-3 提出的注意力机制,在 QK 电路中使用低秩矩阵分解,平衡 KV 缓存和计算量。</td>
</tr>
<tr>
<td>MoE</td>
<td>Mixture of Experts,混合专家。一种稀疏激活的神经网络架构,每个 token 只路由到少数专家,总参数量大但激活参数少。</td>
</tr>
<tr>
<td>MLA</td>
<td>Multi-head Latent Attention,多头潜在注意力。DeepSeek-V3 使用的注意力机制,通过低秩压缩 KV 来减少缓存。</td>
</tr>
<tr>
<td>GQA</td>
<td>Grouped Query Attention,分组查询注意力。多个 Query 头共享一组 KV 头,减少 KV 缓存大小。</td>
</tr>
<tr>
<td>EP</td>
<td>Expert Parallelism,专家并行。将不同专家放置在不同设备上的并行策略。</td>
</tr>
<tr>
<td>TP</td>
<td>Tensor Parallelism,张量并行。将层内张量分片到多个设备上的并行策略。</td>
</tr>
<tr>
<td>DP</td>
<td>Data Parallelism,数据并行。将不同数据样本分发到多个设备上的并行策略。</td>
</tr>
<tr>
<td>TPOT</td>
<td>Time Per Output Token,每输出 token 时间。衡量解码延迟的关键指标,单位为毫秒。</td>
</tr>
<tr>
<td>MFU</td>
<td>Model FLOPs Utilization,模型 FLOPs 利用率。实际达到的计算性能与理论峰值的比例。</td>
</tr>
<tr>
<td>SLA</td>
<td>Service Level Agreement,服务等级协议。指推理系统需要满足的延迟/吞吐量目标。</td>
</tr>
<tr>
<td>MTP</td>
<td>Multi-Token Prediction,多 token 预测。一次前向传播预测多个未来 token 的技术。</td>
</tr>
<tr>
<td>Roofline</td>
<td>Roofline 模型。一种分析计算受限 vs 内存受限的性能模型,通过计算-带宽比划分。</td>
</tr>
<tr>
<td>算术强度</td>
<td>Arithmetic Intensity。每字节内存访问所需的浮点运算数,是 roofline 模型的核心指标。</td>
</tr>
<tr>
<td>RDMA</td>
<td>Remote Direct Memory Access,远程直接内存访问。允许一台机器直接访问另一台机器内存的网络技术,绕过 CPU。</td>
</tr>
<tr>
<td>FP8/BF16/INT8</td>
<td>不同的浮点/整数精度格式。FP8 是 8 位浮点,BF16 是 16 位脑浮点,INT8 是 8 位整数。</td>
</tr>
</tbody></table>
<hr>
<h2 id="fl-b-hxgssy">附录 B:核心公式索引</h2>
<ol>
<li><p><strong>注意力成本公式</strong>(第 4.2 节):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Cost</mtext><mtext>Attn</mtext></msub><mo>=</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mtext>FLOP</mtext><mtext>Attn</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>FLOP</mtext></msub><mo separator="true">,</mo><msub><mtext>Byte</mtext><mtext>KV</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>byte</mtext></msub><mo stretchy="false">)</mo><mo>+</mo><msub><mtext>FLOP</mtext><mtext>Linear</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>FLOP</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Cost}_{\\text{Attn}} = \\max(\\text{FLOP}_{\\text{Attn}} \\times U_{\\text{FLOP}}, \\text{Byte}_{\\text{KV}} \\times U_{\\text{byte}}) + \\text{FLOP}_{\\text{Linear}} \\times U_{\\text{FLOP}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Cost</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Attn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">FLOP</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Attn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9275em;vertical-align:-0.2441em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FLOP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Byte</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2342em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KV</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">byte</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOP</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Linear</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FLOP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>
</li>
<li><p><strong>FFN 成本公式</strong>(第 4.2 节):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Cost</mtext><mtext>FFN</mtext></msub><mo>=</mo><msub><mtext>FLOP</mtext><mtext>FFN</mtext></msub><mo>×</mo><msub><mi>U</mi><mtext>FLOP</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Cost}_{\\text{FFN}} = \\text{FLOP}_{\\text{FFN}} \\times U_{\\text{FLOP}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Cost</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOP</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">U</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FLOP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>
</li>
<li><p><strong>FFN FLOPs</strong>(第 5.3 节):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>FLOPs</mtext><mo>=</mo><mn>2</mn><mo>×</mo><msub><mi>N</mi><mtext>token</mtext></msub><mo>×</mo><msub><mi>W</mi><mtext>FFN</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{FLOPs} = 2 \\times N_{\\text{token}} \\times W_{\\text{FFN}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">FLOPs</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">token</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>
</li>
<li><p><strong>MoE 理想批大小</strong>(第 5.3 节):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>B</mi><mtext>MoE</mtext></msub><mo>=</mo><mfrac><msub><mi>B</mi><mtext>dense</mtext></msub><mi>S</mi></mfrac></mrow><annotation encoding="application/x-tex">B_{\\text{MoE}} = \\frac{B_{\\text{dense}}}{S}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0463em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dense</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span>
</li>
<li><p><strong>最优 MoE 稀疏度</strong>(第 5.4 节):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>S</mi><mo>≥</mo><mfrac><mrow><mi>H</mi><mo>×</mo><mtext>FLOPs</mtext><mo>×</mo><mi>L</mi></mrow><mrow><mtext>Net</mtext><mo>×</mo><mtext>Bandwidth</mtext><mo>×</mo><mn>11.1</mn><mtext>ms</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">S \\geq \\frac{H \\times \\text{FLOPs} \\times L}{\\text{Net} \\times \\text{Bandwidth} \\times 11.1\\text{ms}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8193em;vertical-align:-0.136em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1297em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Net</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">Bandwidth</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">11.1</span><span class="mord text"><span class="mord">ms</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">FLOPs</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span>
</li>
<li><p><strong>网络传输量</strong>(第 5.4 节):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mn>3</mn><mo>×</mo><mi>H</mi><mo>×</mo><msub><mi>B</mi><mtext>MoE</mtext></msub></mrow><annotation encoding="application/x-tex">3 \\times H \\times B_{\\text{MoE}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MoE</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></li>
</ol>
<hr>
<h2 id="fl-c-gjsjsc">附录 C:关键数据速查</h2>
<p><strong>模型规格</strong></p>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>总参数(LLM)</td>
<td>3160 亿</td>
</tr>
<tr>
<td>总参数(VLM)</td>
<td>3210 亿</td>
</tr>
<tr>
<td>每 token 激活参数</td>
<td>380 亿</td>
</tr>
<tr>
<td>Transformer 层数</td>
<td>61</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>7168</td>
</tr>
<tr>
<td>注意力机制</td>
<td>MFA(64 Q 头,共享 1 K 头+1 V 头,头维度 256)</td>
</tr>
<tr>
<td>低秩 Query 维度</td>
<td>2048(7168 → 2048 → 16384)</td>
</tr>
<tr>
<td>MoE 配置</td>
<td>48 个专家,每 token 激活 3 个 + 1 个共享专家</td>
</tr>
<tr>
<td>MoE 层范围</td>
<td>第 5-60 层(共 56 层)</td>
</tr>
<tr>
<td>视觉Encoder</td>
<td>50 亿参数(5B Vision Encoder)</td>
</tr>
<tr>
<td>最大上下文长度</td>
<td>65536</td>
</tr>
</tbody></table>
<p><strong>性能基准</strong></p>
<table>
<thead>
<tr>
<th>场景</th>
<th>指标</th>
</tr>
</thead>
<tbody><tr>
<td>峰值吞吐(4K 上下文,FP8,32 GPU 2A2F)</td>
<td>4039 TGS</td>
</tr>
<tr>
<td>峰值吞吐(4K 上下文,BF16,40 GPU 3A2F)</td>
<td>3321 TGS</td>
</tr>
<tr>
<td>峰值吞吐(8K 上下文,FP8,48 GPU 4A2F)</td>
<td>2643 TGS</td>
</tr>
<tr>
<td>对比 DSv3(相同设置)</td>
<td>+74%</td>
</tr>
<tr>
<td>SLA</td>
<td>50ms TPOT(20 tokens/s)</td>
</tr>
</tbody></table>
<p><strong>理论解码成本(每百万 token,USD)</strong></p>
<table>
<thead>
<tr>
<th>上下文长度</th>
<th>Step-3(AFD)</th>
<th>DSv3(EP)</th>
<th>Qwen3 MoE(AFD)</th>
</tr>
</thead>
<tbody><tr>
<td>8K</td>
<td>0.055</td>
<td>0.068</td>
<td>0.062</td>
</tr>
<tr>
<td>32K</td>
<td>0.129</td>
<td>0.211</td>
<td>0.193</td>
</tr>
</tbody></table>
<p><strong>硬件兼容性</strong></p>
<table>
<thead>
<tr>
<th>硬件</th>
<th>最小 MoE 稀疏度 S</th>
<th>Step-3 S=0.083 是否满足</th>
</tr>
</thead>
<tbody><tr>
<td>H800</td>
<td>0.058</td>
<td>是</td>
</tr>
<tr>
<td>H20</td>
<td>0.007</td>
<td>是</td>
</tr>
<tr>
<td>A800</td>
<td>0.031</td>
<td>是</td>
</tr>
<tr>
<td>910B</td>
<td>0.034</td>
<td>是</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>译者注</strong>:本文的核心贡献不在于提出了一个全新的模型架构,而在于提出了&quot;模型-系统协同设计&quot;的方法论框架。AFD 不是单纯系统层面的优化技巧,而是重新思考模型设计的前提假设——如果 Attention 和 FFN 可以独立部署,那么模型架构设计就可以在两个维度上分别优化,而不必在一个 GPU 上做妥协。MFA 的算术强度 128 是这种方法论的直接产物:它不是为了在单一硬件上跑得最快,而是为了在各种硬件上都能跑得足够快。这种&quot;硬件友好性优先于单一硬件峰值性能&quot;的设计哲学,可能是大模型工程化部署的一个重要转折点。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-step-3-mxkp","text":"2 Step-3 模型卡片"},{"level":2,"id":"3-afd-fbstlxt","text":"3 AFD 分布式推理系统"},{"level":3,"id":"3-1-afd-sjdj","text":"3.1 AFD 设计动机"},{"level":3,"id":"3-2-yxggzdbj","text":"3.2 与相关工作的比较"},{"level":2,"id":"4-llm-jmcbfx","text":"4 LLM 解码成本分析"},{"level":3,"id":"4-1-ll-flo-ps-hncfw","text":"4.1 理论 FLOPs 和内存访问"},{"level":3,"id":"4-2-ymyjdlljmcb","text":"4.2 以美元计的理论解码成本"},{"level":3,"id":"4-3-jmmxsjxz","text":"4.3 揭秘模型设计选择"},{"level":2,"id":"5-mx-xtxtsj","text":"5 模型-系统协同设计"},{"level":3,"id":"5-1-zylssqdyyjpp","text":"5.1 注意力算术强度与硬件匹配"},{"level":3,"id":"5-2-tl-lhy-mtp","text":"5.2 讨论:量化与 MTP"},{"level":3,"id":"5-3-ffn-g-mfu-dpdxyq","text":"5.3 FFN 高 MFU 的批大小要求"},{"level":3,"id":"5-4-zy-moe-xsd-vs-yj","text":"5.4 最优 MoE 稀疏度 vs 硬件"},{"level":3,"id":"5-5-tl-gdxsdbtfa","text":"5.5 讨论:过度稀疏的变通方案"},{"level":2,"id":"6-fqjyjzc","text":"6 非旗舰硬件支持"},{"level":2,"id":"7-sxyjg","text":"7 实现与结果"},{"level":3,"id":"7-1-xtgzlyyh","text":"7.1 系统工作流与优化"},{"level":3,"id":"7-2-step-mesh-afd-txk","text":"7.2 StepMesh:AFD 通信库"},{"level":3,"id":"7-3-xnjg","text":"7.3 性能结果"},{"level":2,"id":"8-jlywlgz","text":"8 结论与未来工作"},{"level":2,"id":"ckwx","text":"参考文献"},{"level":2,"id":"fl-a-syb","text":"附录 A:术语表"},{"level":2,"id":"fl-b-hxgssy","text":"附录 B:核心公式索引"},{"level":2,"id":"fl-c-gjsjsc","text":"附录 C:关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/02-step-3/01-step-3-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/02-step-3/01-step-3-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-3: 模型-系统协同设计实现高性价比解码</h1>
          <p className="text-paper-800/50">{t("From LLM Guide", "来自 LLM 指南")}</p>
        </header>
        <article
          className="paper-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-paper-200 dark:border-slate-700 bg-paper-50 dark:bg-slate-900">
        <LlmGuideToc items={toc} />
      </aside>
    </div>
  );
}
