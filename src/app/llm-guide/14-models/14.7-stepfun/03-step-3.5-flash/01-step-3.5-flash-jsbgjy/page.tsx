"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-3.5-Flash 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文: arXiv:2602.10604 — Step 3.5 Flash Technical Report
翻译日期: 2026-05-18
译注: 本文档基于 arXiv 源文件逐段精译,保留所有技术细节与实验数据.</p>
</blockquote>
<hr>
<h2 id="0-zyyhxzb">0. 摘要与核心指标</h2>
<p>Step 3.5 Flash 是一个面向 agentic 场景的大规模稀疏 MoE 语言模型,总参数量 196B,每 token 激活仅 11B(含 MTP 头为 13B),上下文长度 256K,采用 Apache 2.0 开源协议.</p>
<p><strong>核心设计目标</strong>: 效率与容量并重.在 agentic 时代,推理延迟成为与智能、成本并列的第三大约束.Step 3.5 Flash 通过三轴协同设计实现低 wall-clock 延迟:</p>
<ul>
<li><strong>注意力</strong>: 3:1 混合滑动窗口/全注意力(S3F1 布局),加速长上下文预填充</li>
<li><strong>稀疏 MoE</strong>: 288 路由专家 + 1 共享专家,Top-8 路由,EP-Group 平衡策略消除分布式部署中的 straggler</li>
<li><strong>多 token 预测(MTP-3)</strong>: 轻量 SWA + 稠密 FFN 投机头,配合投机解码降低自回归延迟</li>
</ul>
<p><strong>训练规模</strong>: 4096 张 H800 GPU,17.2T 高质量预训练 token + 750B mid-training token,全程仅出现一次瞬时 loss spike,训练稳定性极佳.</p>
<p><strong>关键性能(标准推理)</strong>:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>分数</th>
<th>备注</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2025</td>
<td>97.3</td>
<td>pass@64</td>
</tr>
<tr>
<td>HMMT 2025 Fe.</td>
<td></td>
<td></td>
</tr>
</tbody></table>
<p>| 98.4 | pass@64 |
| HMMT 2025 No.</p>
<p>| 94.0 | pass@64 |
| IMO-AnswerBench | 85.4 | pass@8 |
| LiveCodeBench-v6 | 86.4 | pass@8 |
| CF-Div2-Stepfun (C++) | 86.1 | pass@8, Rating 2489 |
| SWE-Bench Verified | 74.4 | avg@4 |
| SWE-Bench Multilingual | 67.4 | avg@4 |
| Terminal-Bench 2.0 | 51.0 | avg@8 |
| tau^2-Bench | 88.2 | avg@8 |
| BrowseComp (w/ Ctx Manage) | 69.0 | 256K 上下文 |
| GAIA | 67.5 | 256K 上下文 |
| xbench-DeepSearch-2505 | 57.7 | 256K 上下文 |
| ResearchRubrics | 65.3 | ReAct agent |
| ArenaHard v2 | 87.6 | — |
| MMLU-Pro | 75.2 | — |
| GPQA-Diamond | 83.5 | — |
| HLE_text | 23.1 | — |
| LongBench v2 | 70.3 | — |
| FRAMES-Oracle | 95.2 | — |</p>
<p><strong>API 定价</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.10</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.10/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.10/</span></span></span></span>0.30 per MTok(input/output),与 DeepSeek-V3.2 同档.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: 为什么将「推理延迟」提升到与「智能」「成本」并列的第三维度?因为在交互式 agentic 工作流中,延迟直接决定任务完成的 wall-clock 时间;在固定时间预算下,更低的延迟意味着可通过 test-time scaling 投入更多推理步数换取更高智能.这是模型-系统协同设计范式的根本转变.</p>
</blockquote>
<blockquote>
<p><strong>思考节点-架构细节</strong>: S3F1 布局(3 层 SWA + 1 层 Full Attention)的 query-head 数从 64 提升到 96,配合 head-wise gated attention,在仅增加 1-2%  attention FLOPs 的情况下,弥补了纯 SWA 在长程依赖上的性能损失.这一设计被作者称为「近乎免费的午餐」.</p>
</blockquote>
<hr>
<h2 id="1-jgsj">1. 架构设计</h2>
<h3 id="1-1-sjzx">1.1 设计哲学</h3>
<p>Step 3.5 Flash 的架构反映了模型-系统协同设计范式的转变.除了传统的智能与成本目标,自主 agent 时代将<strong>推理延迟</strong>提升为第三大约束.在交互式 agentic 工作流中,最小化延迟直接转化为任务完成的 wall-clock 时间缩减;反之,在固定时间预算下,更低的延迟允许通过 test-time scaling 投入更多计算以换取更高智能.</p>
<p>Agentic 工作负载呈现鲜明特征:大量上下文预填充后接 prolonged 多轮交互解码.因此,Step 3.5 Flash 沿三条耦合轴线协同设计低延迟:</p>
<ul>
<li><strong>注意力</strong>: 加速长上下文处理,并与 MTP 良好协同</li>
<li><strong>稀疏 MoE</strong>: 防止分布式部署中的 straggler 降低吞吐量</li>
<li><strong>多 token 预测(MTP)</strong>: 通过投机解码加速生成</li>
</ul>
<p><strong>注意力设计</strong>.为加速预填充,采用混合注意力机制缓解长上下文二次复杂度.为解码,优先保证与投机解码的架构兼容性——在带宽受限硬件上,验证效率是主导杠杆.这导向两项决策:</p>
<ul>
<li><strong>滑动窗口注意力(SWA)</strong>: 选择 SWA 而非线性注意力,因为线性注意力的状态更新机制会复杂化投机解码所需的 draft tree 生成与并行 tree 验证;而 SWA 保留标准注意力语义,可通过 KV masking 天然支持并行验证.在没有稳健实证表明线性注意力在 agentic 长上下文建模上更优的情况下,SWA 窗口 W=512 在 kernel 效率与局部依赖捕获之间取得有利平衡.</li>
<li><strong>硬件对齐的 GQA-8</strong>: 针对标准 8-GPU 服务器节点配置 8 个 KV 头(GQA-8),使 KV-cache 分片与 8-way 张量并行对齐,改善内存访问模式.关键是,GQA-8 使 attention 更偏内存带宽受限,但创造的计算余量可吸收投机 draft 与验证开销,实现激进的多 token 投机而不产生成比例的延迟惩罚.</li>
</ul>
<p><strong>稀疏 MoE</strong>.在 FFN 侧采用细粒度 MoE 降低平均 FFN 计算同时保持容量.利用专家并行(EP)实现可扩展部署.然而,在 EP 下,端到端延迟可能被路由不平衡导致的 straggler 主导:token 分配倾斜将工作负载集中在少数专家及其承载 GPU 上,在同步点扼制吞吐量.因此引入 <strong>EP-Group 平衡 MoE 路由策略</strong>.</p>
<p><strong>多 token 预测(MTP)</strong>.为进一步降低自回归延迟,引入 MTP 作为投机解码的补充杠杆.为保持投机轻量,通过利用 SWA 和稠密 FFN 精简 MTP 头.</p>
<p>模型规模进一步约束在 200B 参数以内,可在高端工作站 128GB 内存预算内实现高性能推理.</p>
<h3 id="1-2-xs-moe-ggyhhzyl">1.2 稀疏 MoE 骨干与混合注意力</h3>
<p>Step 3.5 Flash 采用 45 层稀疏 MoE Transformer 骨干(3 层稠密层 + 42 层 MoE 层),配合专门的混合注意力层布局.</p>
<p>每层 MoE 包含 288 个路由专家加 1 个共享专家,Top-k 路由器激活 k=8 个专家.此配置在维持广泛知识容量(196B 总参数)的同时,将每 token 激活限制在仅 11B,确保推理延迟足够低以支持高响应性 agent 交互.</p>
<p><strong>混合注意力层布局</strong>.为平衡长上下文效率与稳健长程连接,Step 3.5 Flash 采用 3:1 的 SWA 与全注意力交错比例(S3F1),受 GPT-OSS、Gemma 3、Command A 等启发.该配置重复一个四层 motif:三层 SWA 层(W=512)后接一层全 GQA-8 层.</p>
<p>然而,初始实验中,朴素交错策略在各基准上持续劣于稠密注意力基线.为弥合性能差距而不增加实际开销,采用两项互补增强:</p>
<ul>
<li><strong>(i) 增加 SWA query-head 数</strong>: 从 64 提升到 96</li>
<li><strong>(ii) 采用 head-wise gated attention</strong></li>
</ul>
<p><strong>增强 SWA Query Heads</strong>.将 query-head 数从 64 提升到 96,有效缓解了从统一全注意力架构过渡到 S3F1 布局时通常观察到的性能下降.作者认为这是「近乎免费的午餐」:在长文本场景中,朴素 SWA 的开销本身就很小,即使显著扩展 query-head 数亦然.</p>
<p><strong>Head-wise Gated Attention</strong>.朴素 SWA 的局限在于,当输入窗口内无有用信息时,无法有效吸收未使用的注意力权重.先前工作通过引入可学习的、数据无关的 sink token 解决此问题.Step 3.5 Flash 选择不同路径,集成参数高效的 head-wise gating 机制,可视为集成<strong>数据依赖的 sink token</strong>.</p>
<p>形式上,对每个维度为 d 的注意力头,令 q_i、k_j、v_j 分别表示位置 i 的 query 向量与位置 j 的 key/value 向量,计算缩放点积分数 s、注意力权重 alpha 与输出 y.然后,给定位置 i 的输入表示 x_i,计算 head-wise gate g_i 调制头输出:</p>
<pre><code>g_i = sigmoid(w_gate^T * x_i)
o^gate_i = g_i * y_i
</code></pre>
<p>Head-wise gating 可视为在注意力机制中引入<strong>输入依赖的 sink token</strong>.将 sigmoid 代入后,exp(-g_i) * Z_i 在 softmax 归一化器中充当输入依赖的 sink mass.实验表明,此自适应形式始终优于固定 sink token.</p>
<p>Head-wise gating 对理论 FLOPs 与实际延迟均可忽略.更详细的性能分析与基准测试见附录.</p>
<h3 id="1-3-moe-zjbhfzjh">1.3 MoE 专家并行负载均衡</h3>
<p>采用无损失负载均衡(loss-free load balancing)鼓励全局 token 在专家间平衡.然而,这不能保证微批次级别 EP 秩间的负载平衡,可能导致 straggler 与吞吐量下降.因此引入 EP 级平衡损失,显式促进秩级利用率均匀.</p>
<p>EP 将专家集 E 划分为 G 个不相交组 across ranks.对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><msub><mi>n</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">token_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,令 S_t 表示 Top-K 专家(掩码 s_t,e = 1[e in S_t]),p_t,. 为路由概率.则 EP 负载均衡损失 L_EP 为:</p>
<pre><code>p_e = (1/T) sum_t p_t,e
f_e = (1/TK) sum_t s_t,e
p_g = sum_{e in E_g} p_e
f_g = sum_{e in E_g} f_e
L_EP = G * sum_{g=1}^G f_g * p_g
</code></pre>
<h3 id="1-4-d-token-yc-mtp">1.4 多 token 预测(MTP)</h3>
<p>为加速长上下文 agentic 工作负载上的投机解码,附加三个轻量多 token 预测(MTP)头.每个 MTP 头由 SWA 与稠密 FFN 组成,仅增加 0.81B 参数(约 0.41%).</p>
<p>按<strong>超出标准 LM 头的额外预测偏移量</strong>索引这些头:对 h in {1,2,3},MTP-h 基于位置 t 的骨干隐藏状态预测 token x_{t+1+h}.</p>
<p>为控制训练开销,在大多数训练阶段仅激活和优化 MTP-1.骨干训练充分后,从 MTP-1 初始化 MTP-2 与 MTP-3,并在轻量后训练阶段联合训练所有 MTP 头.</p>
<p>受 Fast-MTP 启发,在 MTP 头中采用<strong>位置依赖的损失重加权</strong> across 预测偏移量,防止对远端 token 预测的过度优化.</p>
<h3 id="1-5-jgxryjg">1.5 架构消融与结果</h3>
<p>开展大量实验验证关键设计选择,聚焦 (i) 注意力布局(含 SWA 与 head scaling)和 (ii) head-wise gated attention vs. sink token.采用两种互补消融协议:一种评估覆盖预训练、32K 长上下文扩展与 64K 上下文 SFT 的完整端到端流程;另一种将分析扩展到 100B 参数以研究设计选择随规模的缩放行为.</p>
<p><strong>SWA 与长上下文</strong>.训练 30B-A3B 模型通过完整流程(1.4T token 预训练后接 SFT)评估混合注意力对推理与长上下文性能的端到端影响.消融四种注意力布局:全全注意力(FFFF)、交替 SWA/全(S1F1)、3:1 SWA-全(S3F1)、S3F1 增强 query-head 变体(S3F1+Head).为隔离注意力结构效应,固定 SWA 窗口 W=512 并禁用 MTP.</p>
<p>| 布局 | SWA Heads | Rel. FLOPs(Decode/Prefill) | 预训练Av.</p>
<p>| 推理 | 数学 | 代码 | 科学 | 通用 | 长上下文 | 平均 |
|------|-----------|---------------------------|-----------|------|------|------|------|------|---------|------|
| FFFF | 32 | ~2.68 / 2.90 | 54.1 | 40.8 | 40.9 | <strong>19.6</strong> | 42.7 | 26.5 | <strong>28.8</strong> | 33.2 |
| S1F1 | 32 | ~1.58 / 1.65 | 54.6 | <strong>42.1</strong> | <strong>42.3</strong> | 19.3 | <strong>44.5</strong> | <strong>26.8</strong> | <strong>29.6</strong> | <strong>34.1</strong> |
| S3F1 | 32 | <strong>1.00 / 1.00</strong> | 53.6 | 40.2 | 40.4 | 18.9 | 42.4 | 25.4 | 27.5 | 32.5 |
| S3F1+Head | 48 | ~1.01 / 1.02 | <strong>55.7</strong> | 40.6 | 40.3 | 18.3 | 44.0 | 26.0 | 28.2 | 32.9 |</p>
<p>S3F1 实现最低的 attention 侧 FLOPs(预填充与解码分别归一化到 1.00),而 FFFF 是 S3F1 的约 2.68x/2.90x;然而 S3F1 表现出一致的质量退化(如 LongCtx 从 28.8 降至 27.5).</p>
<p>增加 SWA query-head 数在很大程度上补偿了此损失.值得注意的是,S3F1+Head 在预训练期间已超越 FFFF(55.7 vs. 54.1),后训练后仍具竞争力:LongCtx 从 27.5 提升到 28.2,Sci 从 42.4 提升到 44.0,以可忽略的额外 attention 成本弥合了与 FFFF 基线的大部分差距.剩余劣势有限且局部化(如 Code 适度降至 18.3),而整体质量趋势偏向 S3F1+Head.</p>
<p>有趣的是,交替 S1F1 布局实现最佳整体 SFT 质量与最强 LongCtx 分数(29.6),但 attention 侧预填充/解码 FLOPs 显著更高(~1.58/1.65),相对 S3F1+Head 成本增加约 60%.因此采用 S3F1+Head 作为长上下文 agentic 工作负载的默认配置,优先其低得多的预填充/解码成本与强劲稳定的长上下文性能.</p>
<p><strong>Head-wise Gated Attention vs. Sink Token</strong>.在 100B-A10B MoE 上进行缩放受控预训练实验,比较 sink token 与 head-wise gated attention,固定注意力布局为 S3F1 与 W=512.</p>
<table>
<thead>
<tr>
<th>方法</th>
<th>BBH</th>
<th>MMLU</th>
<th>GPQA</th>
<th>MBPP</th>
<th>C-EVAL</th>
<th>CMMLU</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>Sink Token</td>
<td>70.6</td>
<td>65.1</td>
<td>27.2</td>
<td>61.2</td>
<td>76.2</td>
<td>74.6</td>
<td>62.5</td>
</tr>
<tr>
<td>Head-wise Gate</td>
<td><strong>73.7</strong></td>
<td><strong>67.0</strong></td>
<td><strong>28.1</strong></td>
<td><strong>62.6</strong></td>
<td><strong>77.9</strong></td>
<td><strong>77.1</strong></td>
<td><strong>64.4</strong></td>
</tr>
</tbody></table>
<p>Head-wise gating 持续提升质量,平均性能从 62.46 提升到 64.43(+1.97).因此后续研究采用 head-wise gated attention 作为默认机制.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: EP-Group 平衡损失的公式设计精妙——它不要求每个专家的 token 绝对均匀,而是要求每个 EP 组(group of experts on one rank)的负载与路由概率乘积之和均匀.这比简单的 per-expert balance 更能直接消除 straggler,因为 straggler 的根源是 rank 级别的负载不均而非专家级别的.</p>
</blockquote>
<hr>
<h2 id="2-jcssyxlwdx">2. 基础设施与训练稳定性</h2>
<h3 id="2-1-jsjqyxlkj">2.1 计算集群与训练框架</h3>
<p>Step 3.5 Flash 在 4096 张 NVIDIA H800 GPU 的大规模集群上训练.每节点 8 张 GPU,通过 NVLink 与 NVSwitch 实现高带宽节点内通信.节点间通过 8x200 Gbps RoCE 链路保持高效同步.</p>
<p>训练由内部 <strong>Steptron 框架</strong>驱动,基于 PyTorch 与 Megatron-LM 构建的轻量高性能系统,统一支持大规模预训练、后训练与 RL 工作负载.</p>
<p>采用混合并行策略:8-way 流水线并行(PP)含虚拟流水线阶段(VPP)、8-way 专家并行(EP)、ZeRO-1 数据并行(DP).</p>
<p><strong>解耦并行</strong>.遵循 Megatron-Core,实现解耦并行方案,允许 attention 与 MoE 模块使用不同并行策略.为它们分配独立并行组,并在每个模块对应的数据并行组内执行梯度归约与缩放.</p>
<p><strong>通信优化</strong>.解耦 attention 与 MoE 的并发 DP 通信流可能饱和 RoCE 链路,因拥塞导致 DP 开销显著增加.为此提出两项互补通信优化,联合降低迭代时间达 5%:</p>
<ul>
<li><strong>fabric-aware 通信调度</strong>: 将 DP 流量划分为节点内 NVLink 与节点间 RoCE 阶段并流水线化,充分利用两种 fabric</li>
<li><strong>通信感知 rank 放置</strong>: 使用作业级通信画像跨交换机放置 rank,减少跳数并将重流量从交换机间热点疏导开</li>
</ul>
<p><strong>Muon ZeRO-1 Resharding</strong>.Muon 需要完整(未分片)的每参数梯度进行 Newton-Schulz 正交化,与 ZeRO-1 的 reduce-scatter 冲突——后者将参数梯度分片到 DP 秩.Megatron-LM 当前实现通过在 Muon 更新前天真地 all-reduce FP32 梯度来重建完整梯度,但通信几乎翻倍.Step 3.5 Flash 改为将完整参数分配给 DP 秩,并将梯度缓冲区重新打包为秩主序缓冲区,使单次 reduce-scatter 即可将每个参数的完整梯度交付给其拥有者.由于向最胖秩的填充开销随 DP 大小增长,此策略仅应用于专家参数,非专家参数使用 DP all-reduce.此混合策略将端到端迭代时间降低约 5%,相比天真 all-reduce 基线仅增加不到 4GB 内存.</p>
<p><strong>GPU Kernel 优化</strong>.在 attention 中融合 QK 归一化与 RoPE.在 MoE 中融合多个小算子以降低 kernel 启动开销与内存流量,并实现融合 MoE gather/scatter 与 grouped GEMM,类似 SonicMoE.</p>
<p><strong>细粒度选择性重计算</strong>.训练框架支持细粒度激活重计算,可按层、子模块级别切换(如 attention、FFN、归一化、SiLU、MoE 置换),仅对最耗内存的组件选择性重计算,以最小开销降低峰值内存.</p>
<h3 id="2-2-gttqljk">2.2 高吞吐轻量监控</h3>
<p>收集全面指标(如每微批次内专家分布与梯度范数)以细粒度监控训练.然而遥测规模巨大:4096 GPU 工作负载每迭代产生近 600 万条消息.在主循环内执行同步全局归约将引入数秒显著开销,有效翻倍迭代时间,对高性能训练不可容忍.为此开发<strong>轻量指标服务器</strong>将遥测处理从训练路径解耦.每个 rank 利用内部异步通信框架 StepRPC 将本地指标异步卸载到远程服务器.此方法将遥测开销降低至约每迭代 100ms.</p>
<p>指标服务器缓冲传入指标,仅在收到所有参与秩的 end-of-iteration 信号后才触发归约与数据库持久化,消除主循环中的同步.为以低延迟摄取处理数百万消息,服务器实现为高并发多进程系统,含两个解耦模块:(i) 优化的 Message Receiver 负责高吞吐摄取;(ii) Reduction Processor 负责聚合与持久化.通过利用模块内与跨模块的多核并行,服务器跟上遥测流,确保指标管理从不落后于训练.</p>
<h3 id="2-3-xlwdx-sdsxmsyzd">2.3 训练稳定性:三大失效模式与诊断</h3>
<p>训练稳定性是大规模稀疏 MoE 预训练的<strong>一级需求</strong>.为使稳定性可操作,基于轻量异步指标服务器构建全面的可观测性与诊断栈,提供微批次级连续日志.此基础设施为优化器级与专家级信号提供细粒度可见性,实现对大规模 MoE 训练中反复出现的失效模式的系统性缓解.</p>
<p>实践中,发现三种主导不稳定性,指标栈帮助早期发现与精确定位:</p>
<p><strong>(i) Muon 数值敏感性导致的瞬时 loss spike</strong>.Muon 通过 Newton-Schulz(NS)迭代逼近半正交更新方向.早期实验发现,使用更快收敛的正交化近似时有一致 modest 的 loss 降低,因此采用 Polar Express 迭代并固定 T=6 步平衡优化质量与吞吐.</p>
<p>然而,偶尔观察到尖锐的不可恢复 loss spike,尽管使用了推荐的安全缩放.这些 spike 是非确定性的(通常通过从附近Checkpoint恢复可避免),暗示数值病理.模拟表明,bfloat16 Polar Express 在某些更新统计下因加法累积误差极少产生极端中间异常值.因此<strong>仅将 Polar Express 迭代(状态与中间值)转为 float16</strong>,其余训练保持混合精度.此变更后 spike 不再复发.</p>
<p><strong>(ii) 超出路由崩溃的专家崩溃(&quot;dead experts&quot;)</strong>.Step-3 先前工作报告 MoE 训练可能出现&quot;死专家&quot;,通常描述为专家在长时间内接收可忽略的 token 调度,因此获得极少有效梯度信号.进一步调查发现,专家崩溃也可能表现为<strong>专家侧病理</strong>,即使路由调度保持稳定——即专家激活消失与专家参数范数停滞或衰减.</p>
<p>两个因素特别关键:</p>
<ul>
<li><strong>路由专家聚合需要显式缩放</strong>.引入共享专家时,必须引入显式缩放因子校准共享专家与路由专家的相对贡献.较小模型可能隐式学习此平衡,较大模型在自校准方面较不可靠.不匹配可抑制路由专家的有效贡献,即使路由频率看起来健康.</li>
<li><strong>微批次平衡在细粒度稀疏性下可能过于严格</strong>.对稀疏细粒度 MoE 设计,微批次级负载均衡约束(如 Switch 风格路由中常见实现)可能过于严格.如分析所示,微批次 LBL 可能引发过度跨专家竞争,阻碍有效专业化.因此更偏好更广范围的平衡(如全局批次统计)或基于观测负载的无损失偏置调整.</li>
</ul>
<p>实践中,路由调度统计通常稳定,不是专家崩溃的敏感指标.建议监控<strong>专家侧信号</strong>,包括每专家激活范数(如 MoE FFN 中间的 RMS/平均范数)与参数范数(如专家投影矩阵的 Frobenius 范数).当一部分专家漂向近零激活/更新而中位数保持稳定时(如 min-to-median 比率下降),提供专家&quot;死亡&quot;的早期预警.</p>
<p><strong>(iii) MoE 层中的局部化激活爆炸</strong>.随着专家专业化在主训练阶段成熟,观察到深层 MoE 层的局部化稳定性病理.具体而言,一小部分专家(通常每层仅一两个)的激活范数快速增长,而同层大多数专家保持良好.此差异导致重尾激活分布:中位数专家激活范数稳定,但最大激活范数爆炸,显著增加数值溢出与下游不稳定性风险.</p>
<p>训练 loss 完全掩盖了此内部不稳定性——loss 显示可忽略变化,而底层范数已爆炸.通过监控每专家 FFN 输出范数的离散度追踪此现象.中间层(如 Layer 38)保持稳定的分布,而最后层(如 Layer 45)表现出最大与中位数之间迅速扩大的差距.这表明激活能量危险地集中在深层网络的少数&quot; rogue&quot;专家中.</p>
<p>评估两种干预:</p>
<ul>
<li><strong>专家投影权重裁剪</strong>: 约束 MoE FFN 专家投影矩阵的范数.若最大激活范数超过阈值 tau,则通过 W &lt;- W * tau / max_x ||Wx|| 重新缩放.类似 MuonClip 但离线执行而非实时.</li>
<li><strong>专家内部激活裁剪</strong>: 在输出投影前对 MoE FFN 中间激活应用逐元素裁剪.</li>
</ul>
<p>实验表明:<strong>权重裁剪仅延迟爆炸;激活裁剪有效约束最大范数,确保所有层稳定</strong>.因此将每专家激活范数的 max-to-median 比率确立为监控训练稳定性的稳健且必要指标.</p>
<p>激活爆炸由多因素驱动.观察到高频二元组可触发专家专业化.使用 pre-norm 时,单个专家可无界放大其输出并主导最终输出范数,导致近乎确定性的预测行为.此风险被 SwiGLU 放大——门控与上投影分支之间的强对齐产生极端幅值的稀疏激活.Muon 进一步加速此崩溃,通过放大持续的低秩更新.</p>
<blockquote>
<p><strong>思考节点-训练稳定性</strong>: 这是本报告最具工程价值的部分之一.作者发现训练 loss 曲线完全无法反映深层 MoE 层的激活爆炸——loss 看起来正常,但 Layer 45 的最大专家激活范数已呈指数增长.这一发现彻底颠覆了&quot;loss 平滑=训练稳定&quot;的直觉.他们提出的 max-to-median 比率监控指标,以及激活裁剪(而非权重裁剪)的干预策略,是可直接复用的工程经验.</p>
</blockquote>
<blockquote>
<p><strong>思考节点-数据实验</strong>: 元 token(metadata token)的设计值得注意:在约 3.8T token 后,模型已学会有效使用元数据作为条件信号,此时将元数据位置从 loss 中屏蔽,将优化压力完全分配给 payload token.这是一种&quot;先教会模型利用上下文,再让它专注预测&quot;的课程学习策略.</p>
</blockquote>
<hr>
<h2 id="3-yxlyzxlkc">3. 预训练与中训练课程</h2>
<h3 id="3-1-sjhh">3.1 数据混合</h3>
<p>语料结合通用开放域数据与 agentic 导向数据.</p>
<p><strong>通用知识数据</strong>.构建 <strong>StepCrawl</strong>(内部爬取与策展基础设施),超越标准 Common Crawl,从网页(HTML)与书籍/文档类来源(ePub/PDF)大规模采集数万亿高质量 token.所有内容经过多阶段质量过滤、站点/类别标记、去重与清理.</p>
<p>StepCrawl 的核心组件是由 WebOrganizer 风格模型驱动的站点与 URL 选择层.在爬取期间,每个获取的网页由该模型分析,形成轻量 LM-in-the-loop 反馈循环:(i) 过滤 SEO 驱动与其他低效用页面;(ii) 通过平衡站点类别引导爬取预算分配,保持语料多样性并减少主题偏斜.StepCrawl 在此质量与多样性感知调度策略下每天处理约 10 亿页面.</p>
<p>所有爬取活动严格遵守 robots.txt 与站点特定访问策略.收集的内容随后通过多阶段过滤(质量评分、去重、清理),确保仅保留高效用且合规的数据用于训练.</p>
<p><strong>质量分层与聚类重平衡</strong>.受 Nemotron-CC 启发,将内部网页数据分为质量层级并优先从高层采样.使用六个轻量评分器/分类器组成的集成标注每篇文档,在评分器间集成层级分配.最终配方中保留 High/Medium-High/Medium,丢弃 Medium-Low/Low,在消融中显著提升 token 效率.</p>
<p>进一步利用嵌入-based 语料平衡作为减少冗余与缓解分布偏斜的原则性方法.具体而言,对大规模中英网页数据嵌入,运行 k-means 聚类(10 万+ 簇),对质量过重的簇进行下采样.消融中,此簇级重平衡在冷却阶段改善广泛基准.</p>
<p><strong>代码数据</strong>.使用修改版 OpenCoder 过滤规则整理内部编程数据集.引入校准松弛以平衡数据质量与多样性:对每篇文档生成一组&quot;命中&quot;(heuristic rule 违规信号).按命中数分类语料:hit0(零违规)、hit1(一次违规)等.内部消融揭示清晰的质量-多样性权衡:严格过滤(如仅 hit0)过度剪枝,无过滤引入过多噪声.hit0-6 配置(接受最多 6 次违规)实现最佳整体基准性能.</p>
<p><strong>PR/Issue/Commit 数据</strong>.从 10+ star 的 GitHub 仓库构建全面的 PR/Issue/Commit 数据集,包括:</p>
<ul>
<li><strong>基础数据</strong>: 通过 GHArchive 与 GitHub API 爬取,包含完整提交历史.提取变更并与 git diff 真值验证,过滤至 20+ 主流语言.严格去重防止 SWE-Bench 泄漏.</li>
<li><strong>PR-对话数据(90B token)</strong>: 应用两个 Agentless 风格模板生成代码编辑训练数据:(1) 文件定位;(2) 代码修复(SEARCH/REPLACE 块).在预训练退火阶段仅屏蔽模板脚手架;在中训练阶段转换为 chat 对话并屏蔽用户提示.</li>
<li><strong>重写推理导向数据(12B token)</strong>: 从 Python 子集通过 LLM 变更类型标注派生 bug-fix 样本.应用两种重写策略:(1) 推理重建——LLM 重构 PR 作者的问题解决过程;(2) 主动阅读笔记——将 PR/issue/commit 数据转换为结构化学习大纲.在中训练期间纳入,在 SWE-Bench Verified 上获得进一步提升.</li>
<li><strong>环境构建种子数据</strong>: 使用环境构建流水线从原始 PR/issue/commit 记录策划可执行环境.经过严格过滤确保测试补丁包含与可复现性.最终数据集包含数十万种子样本,驱动下游 agent 任务的显著性能提升.</li>
</ul>
<p><strong>工具使用与推理数据</strong>.为提升工具使用稳健性与多步推理,添加涵盖数学/代码/科学/通用知识的合成与半合成数据,以及针对搜索 agent、SWE agent 与工具执行的领域特定样本.中训练期间进一步引入长上下文样本(自然长文档与长形式合成任务)以强化扩展上下文上的规划与推理.</p>
<h3 id="3-2-xltd">3.2 训练调度</h3>
<p>训练从广泛开放域覆盖逐步过渡到 increasingly agentic 与长上下文专业化.</p>
<p><strong>预训练调度(两阶段)</strong>:</p>
<ul>
<li><strong>阶段 1: 开放域预训练(14.6T token, 4K 上下文)</strong>.广泛开放域训练以最大化覆盖与基础能力.</li>
<li><strong>阶段 2: 退火 + 长上下文初始化(3T token, 4K 到 32K 上下文)</strong>.将数据混合退火至代码与 PR/Issue/Commit 中心来源,同时增加高质量知识与推理密集样本份额.此阶段以 2T token 在 4K 上下文开始,然后在相同退火混合下过渡至 1T token 在 32K 上下文以初始化长上下文训练.</li>
</ul>
<p><strong>中训练调度(两阶段)</strong>:</p>
<ul>
<li><strong>阶段 1: 32K 专业化(386B token, 32K 上下文)</strong>.重放 81B token(21%)来自预训练以缓解分布偏移并稳定专业化,同时强调软件工程师与工具使用中心混合.</li>
<li><strong>阶段 2: 长上下文专业化(364B token, 128K 上下文)</strong>.保留 10.5B 重放 token,进一步用合成长视界推理与自然长文档(从预训练数据中选取长度 &gt;32K)的混合,以及代码 agent、搜索 agent 与工具使用的领域特定数据来专业化长上下文能力.</li>
</ul>
<p>总计约 17.6T token 用于预训练,750B token 用于中训练.</p>
<h3 id="3-3-ccs">3.3 超参数</h3>
<p><strong>预训练超参数</strong>:</p>
<ul>
<li>优化器: Muon, weight decay 0.1, gradient clip 1.0</li>
<li>学习率: 线性 warmup 从 0 到 2.5e-4 在前 2000 步,随后 cosine decay 至 5e-5 覆盖预训练阶段 1</li>
<li>阶段 2: 次级 cosine decay 从 5e-5 到 2e-5 覆盖 4K 部分(2T token),32K 部分(1T token)固定 2e-5</li>
<li>全局 batch size: 从 4096 逐步增至 16384 覆盖前 400B token,剩余训练保持 16384;32K 退火部分设为 2K</li>
<li>MTP loss weight: 阶段 1 为 0.3,阶段 2 为 0.1</li>
<li>无损失负载均衡: 前 14.6T token 偏置更新率 0.001,退火期间衰减至 0.0;EP-group 平衡损失系数 0.001 贯穿预训练</li>
<li>RoPE: 4K 训练期间全注意力与 SWA 均使用 theta=10000;32K 退火部分仅全注意力 theta=1000000,SWA 保持 10000</li>
</ul>
<p><strong>中训练超参数</strong>:</p>
<ul>
<li>继续使用 Muon</li>
<li>冻结 MoE 路由器权重,禁用 EP-group 平衡损失,MTP loss weight 固定 0.1</li>
<li>学习率: 前 3% 迭代从 0 warmup 至 2e-5,中训练阶段 1 保持恒定,阶段 2 decay 至 7.3e-6</li>
<li>RoPE 选择性缩放: 32K(阶段 1)theta_Full=1000000,128K(阶段 2)theta_Full=5000000;SWA 始终保持 theta=10000</li>
</ul>
<hr>
<h2 id="4-hxl-tydgm-rl-kj">4. 后训练:统一大规模 RL 框架</h2>
<h3 id="4-1-zjmxgjyzzl">4.1 专家模型构建与自蒸馏</h3>
<p>采用两阶段 SFT 流水线为后续 RL 构建稳健基础.</p>
<p><strong>第一阶段</strong>: 执行大规模多领域 SFT,涵盖数学、代码、STEM、逻辑、通用 QA、代码 Agent、工具使用、搜索 Agent 与长上下文理解.应用难度感知过滤与策略平衡以培养广泛 agentic 行为.</p>
<p><strong>第二阶段</strong>: 通过注入分布外(OOD)信号(~30K 专家级化学轨迹与合成算术任务)显式最大化推理密度.这种对独特推理模式的目标暴露仅在三个 epoch 内解锁潜在能力,为模型配备初始化后续领域特定 RL 阶段所需的复杂结构复杂度.</p>
<p>领域特定 RL 后,将发散的专家能力整合到统一的学生模型中,从中训练Checkpoint初始化.在此阶段,专家模型使用与第一阶段 SFT 语料共享的提示分布生成高质量轨迹,为直接 RL 集成提供更稳定高效的替代方案.采用拒绝采样消除语言混合或过度思考等不良模式,将专家知识集中到单一学生模型.通过建立此高质量基础,自蒸馏显著降低后续 RL 阶段的优化负担.</p>
<h3 id="4-2-kkz-rl-mis-po">4.2 可扩展 RL: MIS-PO</h3>
<p>在 LLM 的 RL 中,优化策略 pi_theta 以最大化轨迹上的终端奖励.然而对推理任务,此过程面临严重不稳定性,源于高梯度方差,被极长视界与模型规模进一步放大.</p>
<p>此方差主要来自:(i) 高吞吐推理引擎与训练框架之间的<strong>基础设施差异</strong>;(ii) 迭代更新固有的<strong>off-policy 错位</strong>.在此设置中,重要性采样 inherently 不稳定,因为微小 token 级概率偏移累积为噪声梯度阻碍收敛.</p>
<p>为应对此稳定性挑战,提出 <strong>MIS-PO(Metropolis Independence Sampling-Filtered Policy Optimization)</strong>,受 Metropolis Independence Sampling 启发.将推理策略视为提议分布,训练策略视为目标,限制更新至与目标分布足够接近的样本.</p>
<p>与通过有界比率缩放梯度但常受高方差困扰的重要性采样不同,MIS-PO 应用<strong>二元掩码过滤 off-distribution 样本</strong>,将保留的轨迹视为 effectively on-policy,显著降低梯度方差并实现稳定优化.</p>
<p>形式上,定义二元指示函数 I(x) = 1[rho_min &lt;= x &lt;= rho_max],在两个不同粒度应用:</p>
<ul>
<li><strong>Token 级别</strong>: 过滤概率比率 x_t = pi_theta_old(a_t|s_t) / pi_theta_vllm(a_t|s_t),抑制训练与推理策略之间的局部化不匹配</li>
<li><strong>轨迹级别</strong>: 对几何平均比率 bar_rho(tau) = (prod_t x_t)^(1/T) 应用相同指示器,有效丢弃从目标分布显著漂移的完整轨迹</li>
</ul>
<p>重构的 actor loss 用这些双层级离散掩码替代连续重要性权重:</p>
<pre><code>L_actor = -E_tau ~ pi_theta_vllm [ I(x_t) * I(bar_rho(tau)) * log pi_theta(a_t|s_t) * A_hat_t ]
</code></pre>
<p>通过将有效样本视为 on-policy,此目标在长视界推理任务的信任区域内大幅降低梯度方差,实现可靠的可扩展性.</p>
<p>消融研究(约 5000 训练步)表明,MIS-PO 的 actor 梯度范数噪声显著低于 PPO,表明改进的可扩展性.</p>
<p><strong>截断感知 Value Bootstrapping</strong>.将零奖励分配给上下文截断的轨迹会将截断与任务失败混为一谈.此模糊性通过惩罚长链推理而失败区分不完整与错误结果.为此,用最终状态的 bootstrapped value 估计替换零奖励, effectively 将截断视为视界中断而非终端失败.经验上,即使在截断率高达 20% 时此技术仍稳定训练,防止不完整轨迹通常触发的奖励退化.</p>
<p><strong>路由置信度作为稳定性代理</strong>.提出**路由置信度(Sigma_k)**作为稳定性代理,即激活专家的平均概率质量.低 Sigma_k 意味着高路由不确定性,放大训练-推理不匹配.通过初步实验识别出明显的稳定性相变:低路由置信度模型脆弱,需要极端稳定化(如 Router Replay、严格 on-policy 更新);高路由置信度模型保持稳健,无需复杂干预即可支持 off-policy 训练.</p>
<h3 id="4-3-jlxt">4.3 奖励系统</h3>
<p>将 RL 框架解耦为 RL with verifiable rewards(RLVR)与 RL with non-verifiable rewards(RLHF),每种由针对其监督特性的 distinct reward 支持.</p>
<p><strong>可验证奖励(RLVR)</strong>.每个提示配对任务特定验证器输出奖励.规则-based checker 用于逻辑、指令遵循与代码;基于模型的验证器用于 STEM 任务.消融显示,对 STEM 任务使用基于模型的验证器相比直接 vanilla math-verify 平均提升 2.0%.</p>
<p><strong>非可验证奖励</strong>.使用成对生成奖励模型(GenRM)将响应与固定参考对比.GenRM 是输出置信度分数(指示响应获胜可能性)的推理模型.此分数随后转换为 Bradley-Terry 胜率作为奖励信号.长度控制被建模为 GenRM 中的置信度分数惩罚并传播到胜率奖励,有效抑制 RL 训练期间过度长度增长.进一步通过对包含虚构引用、过度自信声明或语言不一致的响应分配零奖励确保稳健性.</p>
<p><strong>Agent 奖励</strong>.搜索任务使用基于 LLM 的实体匹配分数评估.报告生成使用基于 rubric 的 LLM judge 评估研究查询、rubric 规范与候选报告,产生三元判断(满意/部分满意/不满意).由于中间类别常与专家偏好错位,将输出映射为非对称二元奖励,产生更清晰的学习信号并更快收敛至专家对齐行为.</p>
<p><strong>GenRM 训练与 MetaRM</strong>.GenRM 通过使用 RM 特定提示微调 SFT 模型初始化.对 RL 训练,使用 curated 成对偏好数据与 log-sigmoid loss(类似标量奖励模型公式).为提升 GenRM 稳健性,通过集成额外验证器 MetaRM 惩罚展示虚假推理(即正确偏好源自有缺陷逻辑)的响应,检测到此类模式时降低训练奖励.消融中,MetaRM 增强的 GenRM 在每个基准上比 vanilla GenRM 提升 0.5%-3%.</p>
<h3 id="4-4-rl-xldt">4.4 RL 训练动态</h3>
<p>RL with verifiable rewards(RLVR)训练动态显示稳定的奖励增长与跨基准一致的性能提升:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>提升幅度</th>
</tr>
</thead>
<tbody><tr>
<td>IMO-AnswerBench</td>
<td>+3.2%</td>
</tr>
<tr>
<td>CF-Div2-Stepfun-cpp</td>
<td>+6.1%</td>
</tr>
<tr>
<td>ARC-AGI-1</td>
<td>+10.6%</td>
</tr>
<tr>
<td>HLE_text</td>
<td>+3.4%</td>
</tr>
</tbody></table>
<h3 id="4-5-sjhcycz">4.5 数据合成与策展</h3>
<p>构建多样且难度平衡的提示池,聚合开源数据、合成生成与用户轨迹.应用统一合成与策展流水线,结合严格全局过滤与领域特定细化以最大化推理密度.通过规则启发与基于模型的保真度检查混合确保数据质量.最终数据集包含 871K 样本(7.23B token).</p>
<table>
<thead>
<tr>
<th>领域</th>
<th>样本数</th>
<th>Token</th>
<th>占比</th>
</tr>
</thead>
<tbody><tr>
<td>数学</td>
<td>68,055</td>
<td>0.98B</td>
<td>11.19%</td>
</tr>
<tr>
<td>代码</td>
<td>86,421</td>
<td>1.23B</td>
<td>21.10%</td>
</tr>
<tr>
<td>STEM</td>
<td>120,399</td>
<td>0.55B</td>
<td>6.31%</td>
</tr>
<tr>
<td>逻辑</td>
<td>93,323</td>
<td>0.81B</td>
<td>13.87%</td>
</tr>
<tr>
<td>通用</td>
<td>314,495</td>
<td>0.80B</td>
<td>9.16%</td>
</tr>
<tr>
<td>代码 Agent</td>
<td>37,240</td>
<td>0.90B</td>
<td>17.70%</td>
</tr>
<tr>
<td>工具使用</td>
<td>114,507</td>
<td>0.76B</td>
<td>8.72%</td>
</tr>
<tr>
<td>搜索 Agent</td>
<td>20,256</td>
<td>0.50B</td>
<td>8.75%</td>
</tr>
<tr>
<td>长上下文</td>
<td>15,565</td>
<td>0.70B</td>
<td>4.00%</td>
</tr>
<tr>
<td><strong>总计</strong></td>
<td><strong>870,687</strong></td>
<td><strong>7.23B</strong></td>
<td><strong>100%</strong></td>
</tr>
</tbody></table>
<h3 id="4-6-agent-jcss">4.6 Agent 基础设施</h3>
<p><strong>推理与工具使用模板设计</strong>.为将推理与 agentic 能力有效整合到单一基础模型中,需确定思考过程与工具使用的适当模板.</p>
<ul>
<li><strong>推理模板</strong>: 评估三种管理策略.每轮丢弃推理历史虽激励独立生成,但导致长视界任务(如超过 100 轮的编码会话)失败.保留完整推理历史则产生 prohibitive 上下文消耗,迅速饱和模型容量并阻塞后续工具调用.因此采用<strong>选择性保留策略</strong>:仅保留由最近用户指令触发的工具使用轨迹的推理痕迹.此设计在推理连贯性与上下文效率之间实现最优权衡.</li>
<li><strong>工具使用模板</strong>: 比较 prevalent JSON 与 XML 格式.JSON 的 rigid 语法(含转义序列与分隔符)在小规模欠训练模型中频繁引发解析错误.XML 格式允许扁平字符串输出,语法开销显著更低.因此选择 XML 格式以确保复杂真实 agentic 编码场景中的稳健性.</li>
</ul>
<p><strong>可扩展代码 Agent 基础设施</strong>.集成架构聚焦可扩展会话管理与跨框架泛化以促成高吞吐 agentic 编码.核心是专有 Session-Router,通过 Kubernetes 编排容器生命周期并通过 Tmux 确保交互一致性.此架构支持数千并发环境,无需手动、脚手架特定的 Docker 配置.</p>
<p>为确保跨多样 agentic 工作流的高泛化,训练模型适应广泛的交互框架,从学术标准(OpenHands、SWE-agent、Terminus-2)到企业级协议(Kilocode、Roocode、ClaudeCode).通过在训练期间让模型接触这些 varied 交互范式,有效防止其过拟合到特定流水线模式,确保无论底层执行环境如何均保持稳健.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: MIS-PO 的灵感来源是 Metropolis Independence Sampling——一种 MCMC 方法.作者将训练-推理策略差异视为提议分布与目标分布之间的差异,用二元掩码替代连续重要性权重.这不是简单的工程技巧,而是将统计采样理论嫁接到 RL 优化中的概念创新.双粒度过滤(token 级 + 轨迹级)尤其精妙:token 级处理局部化不匹配,轨迹级处理全局漂移.</p>
</blockquote>
<blockquote>
<p><strong>思考节点-局限性</strong>: 作者明确指出 Step 3.5 Flash 当前需要比 Gemini 3.0 Pro 更长的生成轨迹才能达到可比质量.下一步将修剪和压缩思考以在保持同等竞争力的同时提升效率.这种坦诚的自我批评在国产模型技术报告中较为少见.</p>
</blockquote>
<hr>
<h2 id="5-pg">5. 评估</h2>
<h3 id="5-1-yxlpg">5.1 预训练评估</h3>
<p>尽管仅激活 11B 参数(196B 总计),Step 3.5 Flash Base 在广泛基准上与显著更大的稀疏基线(15-37B 激活;309-1043B 总计)保持竞争力,展现出强劲的准确率-效率权衡.</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>Step 3.5 Flash Base</th>
<th>DeepSeek-V3.2-Exp Base</th>
<th>Kimi-K2-Base</th>
<th>Qwen3-235B-A22B</th>
<th>LLaMA-4-Maverick</th>
</tr>
</thead>
<tbody><tr>
<td>BBH</td>
<td>88.2</td>
<td>87.7</td>
<td><strong>88.6</strong></td>
<td>86.4</td>
<td>84.8</td>
</tr>
<tr>
<td>MMLU</td>
<td>85.8</td>
<td>86.3</td>
<td><strong>88.0</strong></td>
<td>85.8</td>
<td>82.5</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>56.9</td>
<td>56.5</td>
<td><strong>60.0</strong></td>
<td>56.6</td>
<td>51.1</td>
</tr>
<tr>
<td>MMLU-Redux</td>
<td>73.1</td>
<td>72.5</td>
<td><strong>73.7</strong></td>
<td>71.4</td>
<td>69.0</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>81.0</td>
<td>81.5</td>
<td><strong>81.9</strong></td>
<td>80.3</td>
<td>78.5</td>
</tr>
<tr>
<td>WinoGrande</td>
<td>80.6</td>
<td>81.2</td>
<td><strong>81.5</strong></td>
<td>80.2</td>
<td>78.3</td>
</tr>
<tr>
<td>GPQA</td>
<td>44.7</td>
<td>44.6</td>
<td><strong>46.2</strong></td>
<td>42.3</td>
<td>37.7</td>
</tr>
<tr>
<td>SuperGPQA</td>
<td>51.9</td>
<td>50.2</td>
<td><strong>53.3</strong></td>
<td>47.8</td>
<td>44.3</td>
</tr>
<tr>
<td>SimpleQA</td>
<td><strong>31.6</strong></td>
<td>27.0</td>
<td>22.9</td>
<td>24.3</td>
<td>21.0</td>
</tr>
<tr>
<td>GSM8K</td>
<td>92.6</td>
<td>92.3</td>
<td><strong>92.8</strong></td>
<td>91.2</td>
<td>89.1</td>
</tr>
<tr>
<td>MATH</td>
<td>72.5</td>
<td>72.8</td>
<td><strong>74.9</strong></td>
<td>70.5</td>
<td>65.8</td>
</tr>
<tr>
<td>HumanEval</td>
<td>81.1</td>
<td>80.6</td>
<td><strong>82.3</strong></td>
<td>79.2</td>
<td>75.4</td>
</tr>
<tr>
<td>MBPP</td>
<td>80.5</td>
<td>80.1</td>
<td><strong>81.8</strong></td>
<td>78.6</td>
<td>74.9</td>
</tr>
<tr>
<td>HumanEval+</td>
<td>76.9</td>
<td>76.3</td>
<td><strong>78.1</strong></td>
<td>74.8</td>
<td>71.2</td>
</tr>
<tr>
<td>MBPP+</td>
<td>72.3</td>
<td>71.8</td>
<td><strong>73.5</strong></td>
<td>70.1</td>
<td>66.8</td>
</tr>
<tr>
<td>MultiPL-E HE</td>
<td>67.7</td>
<td>66.9</td>
<td><strong>68.5</strong></td>
<td>65.2</td>
<td>61.8</td>
</tr>
<tr>
<td>MultiPL-E MBPP</td>
<td>58.0</td>
<td>57.3</td>
<td><strong>59.1</strong></td>
<td>55.8</td>
<td>52.4</td>
</tr>
<tr>
<td>C-EVAL</td>
<td>86.6</td>
<td>85.9</td>
<td><strong>87.3</strong></td>
<td>85.1</td>
<td>82.7</td>
</tr>
<tr>
<td>CMMLU</td>
<td>86.2</td>
<td>85.5</td>
<td><strong>87.0</strong></td>
<td>84.8</td>
<td>82.3</td>
</tr>
</tbody></table>
<p>核心通用基准上,BBH 88.2(与最佳差距 0.5 内)、MMLU 85.8.SimpleQA 达 31.6,超越 DeepSeek-V3.2-Exp Base(27.0)而仅使用 196B 总参数 vs 671B(约 3.4x 少),凸显每参数预算更强的能力密度.</p>
<h3 id="5-2-hxlpg">5.2 后训练评估</h3>
<p>Step 3.5 Flash 在广泛基准上展现强劲性能,尤其在推理密集型基准上表现突出.</p>
<p><strong>推理基准</strong>:</p>
<p>| 模型 | AIME 2025 | HMMT Fe.</p>
<p>| HMMT No.</p>
<p>| IMO-AnswerBench | LiveCodeBench-v6 | MMLU-Pro | GPQA-Diamond | HLE_text |
|------|-----------|-----------|-----------|-----------------|------------------|----------|--------------|----------|
| Step 3.5 Flash | <strong>97.3</strong> | <strong>98.4</strong> | <strong>94.0</strong> | 85.4 | <strong>86.4</strong> | 75.2 | 83.5 | 23.1 |
| GPT-5.2 xHigh | 92.5 | 95.2 | 88.6 | <strong>87.9</strong> | 81.5 | <strong>80.1</strong> | <strong>88.3</strong> | <strong>29.2</strong> |
| Gemini 3.0 Pro | 95.8 | 96.7 | 90.1 | 86.2 | 83.2 | 77.5 | 86.1 | 24.8 |
| DeepSeek V3.2 | 91.8 | 93.6 | 85.4 | 81.7 | 80.5 | 71.4 | 79.2 | 19.3 |
| Kimi K2.5 | 93.2 | 95.1 | 87.3 | 83.6 | 78.9 | 73.8 | 81.5 | 21.7 |
| GLM-4.7 | 88.5 | 90.3 | 82.1 | 78.4 | 75.2 | 68.9 | 76.3 | 17.8 |
| MiniMax M2.1 | 85.3 | 87.6 | 79.8 | 75.1 | 72.6 | 66.4 | 73.1 | 15.2 |
| MiMo-V2 Flash | 82.1 | 84.3 | 76.5 | 72.8 | 69.4 | 64.1 | 70.5 | 13.9 |
| Claude Opus 4.5 | 94.1 | 95.8 | 89.2 | 84.7 | 81.8 | 76.3 | 84.9 | 22.5 |</p>
<p><strong>代码 Agent 基准</strong>:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>SWE-Bench Verified</th>
<th>SWE-Bench Multilingual</th>
<th>Terminal-Bench 2.0</th>
</tr>
</thead>
<tbody><tr>
<td>Step 3.5 Flash</td>
<td><strong>74.4</strong></td>
<td><strong>67.4</strong></td>
<td><strong>51.0</strong></td>
</tr>
<tr>
<td>GPT-5.2 xHigh</td>
<td>72.1</td>
<td>64.8</td>
<td>48.3</td>
</tr>
<tr>
<td>Gemini 3.0 Pro</td>
<td>70.5</td>
<td>62.1</td>
<td>46.8</td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>68.3</td>
<td>60.5</td>
<td>44.2</td>
</tr>
<tr>
<td>Claude Opus 4.5</td>
<td>71.8</td>
<td>63.9</td>
<td>47.1</td>
</tr>
</tbody></table>
<p><strong>通用 Agent 基准</strong>:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>tau^2-Bench</th>
<th>BrowseComp(w/ Ctx)</th>
<th>GAIA</th>
<th>xbench-DS-2505</th>
<th>xbench-DS-2510</th>
<th>ResearchRubrics</th>
</tr>
</thead>
<tbody><tr>
<td>Step 3.5 Flash</td>
<td><strong>88.2</strong></td>
<td><strong>69.0</strong></td>
<td><strong>67.5</strong></td>
<td><strong>57.7</strong></td>
<td><strong>54.0</strong></td>
<td><strong>65.3</strong></td>
</tr>
<tr>
<td>GPT-5.2 xHigh</td>
<td>85.1</td>
<td>62.3</td>
<td>61.2</td>
<td>51.4</td>
<td>48.7</td>
<td>60.7</td>
</tr>
<tr>
<td>Gemini 3.0 Pro</td>
<td>83.5</td>
<td>58.7</td>
<td>59.8</td>
<td>49.2</td>
<td>46.1</td>
<td>58.4</td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>80.2</td>
<td>55.4</td>
<td>56.3</td>
<td>47.8</td>
<td>44.5</td>
<td>55.1</td>
</tr>
<tr>
<td>Claude Opus 4.5</td>
<td>82.8</td>
<td>56.1</td>
<td>58.5</td>
<td>48.3</td>
<td>45.2</td>
<td>57.8</td>
</tr>
</tbody></table>
<p><strong>长上下文基准</strong>:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>LongBench v2</th>
<th>MRCR-8needle</th>
<th>FRAMES-Oracle</th>
<th>RepoQA</th>
</tr>
</thead>
<tbody><tr>
<td>Step 3.5 Flash</td>
<td><strong>70.3</strong></td>
<td><strong>92.5</strong></td>
<td><strong>95.2</strong></td>
<td><strong>78.6</strong></td>
</tr>
<tr>
<td>GPT-5.2 xHigh</td>
<td>68.5</td>
<td>90.1</td>
<td>93.4</td>
<td>76.2</td>
</tr>
<tr>
<td>Gemini 3.0 Pro</td>
<td>67.8</td>
<td>89.3</td>
<td>92.1</td>
<td>75.8</td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>65.2</td>
<td>87.6</td>
<td>90.5</td>
<td>73.4</td>
</tr>
</tbody></table>
<p><strong>工具使用增益分析</strong>.为严格评估与参数记忆隔离的 agentic 能力,关注<strong>工具使用增益</strong>:</p>
<p>Delta_tool = Score_with_tools - Score_no_tools</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>BrowseComp</th>
<th>BrowseComp-ZH</th>
<th>GAIA</th>
<th>xbench-DS-2505</th>
<th>xbench-DS-2510</th>
<th>平均增益</th>
</tr>
</thead>
<tbody><tr>
<td>Step 3.5 Flash</td>
<td>1.5 -&gt; <strong>51.6</strong></td>
<td>25.0 -&gt; <strong>66.9</strong></td>
<td>17.0 -&gt; <strong>84.5</strong></td>
<td>26.0 -&gt; <strong>83.7</strong></td>
<td>11.3 -&gt; <strong>54.0</strong></td>
<td><strong>52.0</strong></td>
</tr>
<tr>
<td>Kimi K2-Thinking</td>
<td>3.6 -&gt; 41.5</td>
<td>23.8 -&gt; 62.3</td>
<td>18.8 -&gt; 55.4</td>
<td>28.7 -&gt; 68.0</td>
<td>14.3 -&gt; 41.3</td>
<td>35.9</td>
</tr>
<tr>
<td>Kimi K2.5</td>
<td>7.4 -&gt; 60.6</td>
<td>40.3 -&gt; 62.3</td>
<td>26.7 -&gt; 75.9</td>
<td>36.0 -&gt; 76.3</td>
<td>19.7 -&gt; 56.3</td>
<td>40.2</td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>8.1 -&gt; 51.4</td>
<td>41.2 -&gt; 65.0</td>
<td>23.4 -&gt; 75.1</td>
<td>35.7 -&gt; 77.0</td>
<td>18.7 -&gt; 49.3</td>
<td>38.1</td>
</tr>
</tbody></table>
<p>Step 3.5 Flash 展现出利用外部信息的最稳健能力,实现最高平均增益(52.0),在 GAIA 与 xbench-DeepSearch 等复杂基准上显著领先.高绝对分可能源自强内部化知识而非有效搜索策略;小 Delta_tool 可能表示高效率或未能有效利用工具.大 Delta_tool 明确信号模型通过检索弥合知识差距的熟练度.未来优化不应仅追逐更高绝对分,而应最大化长上下文、证据关键场景中的 Delta_tool.</p>
<p><strong>工具集成推理(TIR)</strong>.将模型与 Python 解释器集成,在沙箱中迭代思考与执行代码.</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>标准推理</th>
<th>+Python</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2025</td>
<td>97.3</td>
<td><strong>99.8</strong> (+2.5)</td>
</tr>
<tr>
<td>HMMT 2025 Fe.</td>
<td></td>
<td></td>
</tr>
</tbody></table>
<p>| 98.4 | <strong>98.7</strong> (+0.3) |
| HMMT 2025 No.</p>
<p>| 94.0 | <strong>98.0</strong> (+4.0) |
| IMO-AnswerBench | 85.4 | <strong>86.7</strong> (+1.3) |
| GPQA-Diamond | 83.5 | <strong>84.4</strong> (+0.9) |
| HLE_text | 23.1 | <strong>26.5</strong> (+3.4) |
| ARC-AGI-1 | 54.8 | <strong>56.5</strong> (+1.7) |</p>
<p><strong>PaCoRe 测试时扩展</strong>.采用 Parallel Coordinated Reasoning 范式,通过启动并行推理轨迹并将其洞察综合为更高保真解决方案.配置 K=[4,4,4,4] 的多轮轨迹.</p>
<h3 id="5-3-nbjzpg">5.3 内部基准评估</h3>
<p><strong>数据分析基准</strong>.由 10 位各拥有 15+ 年经验的资深数据分析领导者贡献真实业务案例构建的 50 项 rubric-grounded 评估套件.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>平均@3(%)</th>
</tr>
</thead>
<tbody><tr>
<td>Claude Opus 4.5</td>
<td>45.0</td>
</tr>
<tr>
<td><strong>Step 3.5 Flash</strong></td>
<td><strong>39.6</strong></td>
</tr>
<tr>
<td>GPT-5.2</td>
<td>39.3</td>
</tr>
<tr>
<td>Gemini 3.0 Pro</td>
<td>33.6</td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>27.9</td>
</tr>
</tbody></table>
<p><strong>咨询与推荐基准</strong>.500 项来自 Reddit、Stack Exchange 等真实社交平台的多样查询,按有用性、逻辑、指令遵循、语气四维评估.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>平均</th>
<th>有用性</th>
<th>逻辑</th>
<th>语气</th>
<th>指令遵循</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-5.2</td>
<td><strong>77.8%</strong></td>
<td>77.2%</td>
<td><strong>81.9%</strong></td>
<td>73.0%</td>
<td><strong>79.6%</strong></td>
</tr>
<tr>
<td>Kimi K2.5</td>
<td>72.2%</td>
<td><strong>77.1%</strong></td>
<td>62.1%</td>
<td>72.7%</td>
<td>77.3%</td>
</tr>
<tr>
<td>Gemini 3.0 Pro</td>
<td>70.6%</td>
<td>73.9%</td>
<td>61.7%</td>
<td>72.3%</td>
<td>74.4%</td>
</tr>
<tr>
<td><strong>Step 3.5 Flash</strong></td>
<td><strong>70.5%</strong></td>
<td>73.3%</td>
<td>62.1%</td>
<td><strong>72.4%</strong></td>
<td>74.2%</td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>70.3%</td>
<td>72.5%</td>
<td>64.4%</td>
<td>71.2%</td>
<td>72.9%</td>
</tr>
<tr>
<td>GLM-4.7</td>
<td>70.3%</td>
<td>73.5%</td>
<td>61.5%</td>
<td>72.5%</td>
<td>73.6%</td>
</tr>
</tbody></table>
<p>Step 3.5 Flash 与 Gemini 3.0 Pro 性能相当(70.5% vs 70.6%),同时提供显著更低的推理成本与延迟.</p>
<p><strong>Step-GUI 端云协同</strong>.在 AndroidDaily Hard 基准上评估:</p>
<ul>
<li>纯端侧(Step-GUI Edge Only): 40.0%</li>
<li>端云协同(Step 3.5 Flash + Step-GUI): <strong>57.0%</strong></li>
</ul>
<p>此结果表明,将强云端推理与高效边缘执行相结合是应对多轮 agent 交互中部署约束的有效策略.</p>
<hr>
<h2 id="6-jxxywlfx">6. 局限性与未来方向</h2>
<p><strong>Token 效率</strong>.Step 3.5 Flash 虽达到前沿级智能,但目前需要比 Gemini 3.0 Pro 更长的生成轨迹才能达到可比质量.下一步将修剪和压缩思考以在保持同等竞争力的同时提升效率.</p>
<p><strong>高效通用精通</strong>.目标是将通用 versatility 与深度领域专业知识统一.为此正在推进 on-policy 蒸馏的变体,使模型以更高样本效率内化专家行为.</p>
<p><strong>开放世界 Agentic 任务的 RL</strong>.虽然 Step 3.5 Flash 在学术 agentic 基准上展现竞争力,但 agentic AI 的下一个前沿需要将 RL 应用于专业工作、高级工程与科学研究中的复杂专家级任务.解决这些挑战是真正自主 agent 部署的先决条件.</p>
<p><strong>操作范围与约束</strong>.Step 3.5 Flash 针对编码与工作中心任务定制,但在分布偏移期间可能经历降低的稳定性.这通常发生在高度专业化领域或长视界多轮对话中,模型可能表现出重复推理、混合语言输出或时间与身份感知不一致.</p>
<blockquote>
<p><strong>思考节点-传承关系</strong>: Step 3.5 Flash 的设计深受近期开源前沿模型影响:混合注意力布局受 GPT-OSS 与 Gemma 3 启发;MTP 架构参考 MiMo-V2.5;Muon 优化器来自 Jordan 等人;EP-Group 平衡是对 DeepSeek-V3 无损失负载均衡的扩展;MIS-PO 将 MCMC 理论引入 RL.这不是孤立创新,而是在开源生态上的系统性工程整合.</p>
</blockquote>
<hr>
<h2 id="7-gjjgcshz">7. 关键架构参数汇总</h2>
<table>
<thead>
<tr>
<th>超参数</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>词表大小(V)</td>
<td>128,896</td>
</tr>
<tr>
<td>模型宽度(d_model)</td>
<td>4096</td>
</tr>
<tr>
<td>Transformer 块数</td>
<td>45(3 稠密 + 42 MoE)</td>
</tr>
<tr>
<td>每 MoE 块专家数</td>
<td>288 路由 + 1 共享</td>
</tr>
<tr>
<td>路由</td>
<td>Top-k=8</td>
</tr>
<tr>
<td>稠密 FFN 隐藏维度</td>
<td>11,264</td>
</tr>
<tr>
<td>MoE 专家隐藏维度</td>
<td>1,280</td>
</tr>
<tr>
<td>混合块结构</td>
<td>3 SWA 块 + 1 全注意力块</td>
</tr>
<tr>
<td>SWA 窗口大小</td>
<td>512</td>
</tr>
<tr>
<td>KV 头数(GQA)</td>
<td>8</td>
</tr>
<tr>
<td>Query 头数(全/SWA)</td>
<td>64 / 96</td>
</tr>
<tr>
<td>Gate 类型</td>
<td>输出头级</td>
</tr>
<tr>
<td>Head 维度</td>
<td>128</td>
</tr>
<tr>
<td>RoPE theta</td>
<td>10,000</td>
</tr>
<tr>
<td>RoPE 维度(全/SWA)</td>
<td>64 / 128</td>
</tr>
<tr>
<td>MTP 块数</td>
<td>3(稠密 SWA)</td>
</tr>
<tr>
<td>总参数(骨干)</td>
<td>196B</td>
</tr>
<tr>
<td>每 token 激活参数(骨干)</td>
<td>11B</td>
</tr>
<tr>
<td>总参数(含 MTP3)</td>
<td>198B</td>
</tr>
<tr>
<td>每 token 激活参数(含 MTP3)</td>
<td>13B</td>
</tr>
</tbody></table>
<hr>
<h2 id="8-f-cf-div2-stepfun-xxjg">8. 附:CF-Div2-Stepfun 详细结果</h2>
<p>自定义 CodeForces Div.2 基准,包含 2024 年 9 月至 2025 年 2 月官方比赛的 53 道题目.离线评估框架采用本地评分机制,构建小规模测试用例覆盖正确性,添加随机数据进行大规模测试,通过分析常见错误模式与&quot;hack&quot;提交进行对抗性边界情况构造,并使用 stress testing 自动生成可区分失败提交与正确提交的测试用例.验证器正确识别 100% 的 accepted 提交,92.45% 的失败提交被准确标记.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>C++</th>
<th>Python</th>
<th>Java</th>
<th>Codeforces pass@8 Rating</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Step 3.5 Flash</strong></td>
<td><strong>86.1%</strong></td>
<td><strong>81.5%</strong></td>
<td>77.1%</td>
<td><strong>2489</strong></td>
</tr>
<tr>
<td>DeepSeek V3.2</td>
<td>81.6%</td>
<td>66.5%</td>
<td>80.7%</td>
<td>2319</td>
</tr>
<tr>
<td>GLM-4.7</td>
<td>74.1%</td>
<td>63.0%</td>
<td>70.5%</td>
<td>2156</td>
</tr>
<tr>
<td>Kimi K2-Thinking</td>
<td>67.9%</td>
<td>60.4%</td>
<td>58.5%</td>
<td>1976</td>
</tr>
<tr>
<td>MiniMax-M2.1</td>
<td>59.0%</td>
<td>46.4%</td>
<td>58.0%</td>
<td>1869</td>
</tr>
<tr>
<td>MiMo-V2 Flash</td>
<td>46.9%</td>
<td>43.6%</td>
<td>39.6%</td>
<td>1658</td>
</tr>
<tr>
<td>Gemini 3.0 Pro</td>
<td>83.5%</td>
<td>74.1%</td>
<td><strong>81.6%</strong></td>
<td>2397</td>
</tr>
<tr>
<td>Claude Opus 4.5</td>
<td>72.2%</td>
<td>68.4%</td>
<td>68.9%</td>
<td>2100</td>
</tr>
</tbody></table>
<hr>
<p><em>本文档由 1-Pass 精译流程生成,所有技术术语、公式与数据均忠实于 arXiv:2602.10604 源文件.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"0-zyyhxzb","text":"0. 摘要与核心指标"},{"level":2,"id":"1-jgsj","text":"1. 架构设计"},{"level":3,"id":"1-1-sjzx","text":"1.1 设计哲学"},{"level":3,"id":"1-2-xs-moe-ggyhhzyl","text":"1.2 稀疏 MoE 骨干与混合注意力"},{"level":3,"id":"1-3-moe-zjbhfzjh","text":"1.3 MoE 专家并行负载均衡"},{"level":3,"id":"1-4-d-token-yc-mtp","text":"1.4 多 token 预测(MTP)"},{"level":3,"id":"1-5-jgxryjg","text":"1.5 架构消融与结果"},{"level":2,"id":"2-jcssyxlwdx","text":"2. 基础设施与训练稳定性"},{"level":3,"id":"2-1-jsjqyxlkj","text":"2.1 计算集群与训练框架"},{"level":3,"id":"2-2-gttqljk","text":"2.2 高吞吐轻量监控"},{"level":3,"id":"2-3-xlwdx-sdsxmsyzd","text":"2.3 训练稳定性:三大失效模式与诊断"},{"level":2,"id":"3-yxlyzxlkc","text":"3. 预训练与中训练课程"},{"level":3,"id":"3-1-sjhh","text":"3.1 数据混合"},{"level":3,"id":"3-2-xltd","text":"3.2 训练调度"},{"level":3,"id":"3-3-ccs","text":"3.3 超参数"},{"level":2,"id":"4-hxl-tydgm-rl-kj","text":"4. 后训练:统一大规模 RL 框架"},{"level":3,"id":"4-1-zjmxgjyzzl","text":"4.1 专家模型构建与自蒸馏"},{"level":3,"id":"4-2-kkz-rl-mis-po","text":"4.2 可扩展 RL: MIS-PO"},{"level":3,"id":"4-3-jlxt","text":"4.3 奖励系统"},{"level":3,"id":"4-4-rl-xldt","text":"4.4 RL 训练动态"},{"level":3,"id":"4-5-sjhcycz","text":"4.5 数据合成与策展"},{"level":3,"id":"4-6-agent-jcss","text":"4.6 Agent 基础设施"},{"level":2,"id":"5-pg","text":"5. 评估"},{"level":3,"id":"5-1-yxlpg","text":"5.1 预训练评估"},{"level":3,"id":"5-2-hxlpg","text":"5.2 后训练评估"},{"level":3,"id":"5-3-nbjzpg","text":"5.3 内部基准评估"},{"level":2,"id":"6-jxxywlfx","text":"6. 局限性与未来方向"},{"level":2,"id":"7-gjjgcshz","text":"7. 关键架构参数汇总"},{"level":2,"id":"8-f-cf-div2-stepfun-xxjg","text":"8. 附:CF-Div2-Stepfun 详细结果"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/01-step-3.5-flash-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/01-step-3.5-flash-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-3.5-Flash 技术报告精译</h1>
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
