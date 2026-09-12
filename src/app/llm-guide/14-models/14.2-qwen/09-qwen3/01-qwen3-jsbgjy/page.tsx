"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>原文</strong>: Qwen3 Technical Report (arXiv:2505.09388)
<strong>模型系列</strong>: Qwen3 (0.6B ~ 235B-A22B, Dense + MoE)
<strong>发布时间</strong>: 2025 年 4 月
<strong>翻译原则</strong>: 逐句精译, 保留所有技术细节、数据表格与公式</p>
</blockquote>
<hr>
<h2 id="y-yy-introduction">一、引言 (Introduction)</h2>
<p>通用人工智能(AGI)乃至超级人工智能(ASI)的追求长期以来一直是人类的目标。近期大型基础模型的进步, 例如 GPT-4o、Claude 3.7、Gemini 2.5、DeepSeek-V3、Llama-4 以及 Qwen2.5, 已经朝着这一目标取得了显著进展。这些模型在涵盖数万亿 token 的多样化领域和任务的海量数据集上进行训练, 有效地将人类知识和能力蒸馏到其参数中。此外, 通过强化学习优化的推理模型的最新发展, 凸显了基础模型增强推理时扩展(inference-time scaling)并实现更高智能水平的潜力, 例如 o3、DeepSeek-R1。尽管大多数最先进的模型仍然是专有的, 但开源社区的快速增长已大幅缩小了开放权重模型与闭源模型之间的性能差距。值得注意的是, 越来越多的一流模型正以开源形式发布, 促进了人工智能领域更广泛的研究与创新。</p>
<p>在本工作中, 我们推出了 Qwen3——Qwen 基础模型家族的最新系列。Qwen3 是一系列开放权重的大型语言模型(LLM), 在广泛的任务和领域中达到了最先进的性能。我们同时发布了稠密(Dense)和混合专家(MoE)模型, 参数量从 6 亿到 2350 亿不等, 以满足不同下游应用的需求。值得注意的是, 旗舰模型 Qwen3-235B-A22B 是一个 MoE 模型, 总共拥有 2350 亿参数, 每 token 激活 220 亿参数。这一设计确保了高性能与高效推理。</p>
<p>Qwen3 引入了若干关键进步以增强其功能性和可用性:</p>
<p><strong>第一, 双模式统一架构。</strong> Qwen3 将「思考模式」(thinking mode)和「非思考模式」(non-thinking mode)集成到单一模型中。这允许用户在这两种模式之间切换, 而无需在不同模型之间切换(例如从 Qwen2.5 切换到 QwQ)。这种灵活性确保开发者和用户能够根据特定任务高效地调整模型行为。</p>
<p><strong>第二, 思考预算(Thinking Budget)机制。</strong> Qwen3 引入了思考预算, 为用户提供细粒度的控制, 以调节模型在任务执行期间投入的推理努力程度。这一能力对于优化计算资源和性能至关重要, 使模型的思考行为能够适应现实应用中不同的复杂度需求。</p>
<p><strong>第三, 多语言能力的极大扩展。</strong> Qwen3 在 36 万亿 token 上进行预训练, 涵盖多达 119 种语言和方言, 有效增强了其多语言能力。这种广泛的语言支持放大了其在全球用例和国际应用中的部署潜力。</p>
<p>这些进步共同确立了 Qwen3 作为前沿开源大语言模型家族的地位, 能够有效应对各种领域和语言中的复杂任务。</p>
<hr>
<h2 id="e-mxjg-architecture">二、模型架构 (Architecture)</h2>
<p>Qwen3 系列包含 6 个稠密模型——Qwen3-0.6B、1.7B、4B、8B、14B、32B——以及 2 个 MoE 模型——Qwen3-30B-A3B 和 Qwen3-235B-A22B。旗舰模型 Qwen3-235B-A22B 总共拥有 235B 参数, 每 token 激活 22B 参数。</p>
<h3 id="2-1-cmmxjg">2.1 稠密模型架构</h3>
<p>Qwen3 稠密模型的架构与 Qwen2.5 相似, 包括:</p>
<ul>
<li><strong>分组查询注意力(GQA)</strong>: 用于减少 KV 缓存内存占用</li>
<li><strong>SwiGLU 激活函数</strong></li>
<li><strong>旋转位置编码(RoPE)</strong></li>
<li><strong>RMSNorm 预归一化</strong></li>
</ul>
<p>此外, Qwen3 移除了 Qwen2 中使用的 QKV-bias, 并引入了 <strong>QK-Norm</strong> 到注意力机制中, 以确保训练稳定性。关键架构信息见下表:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>层数</th>
<th>注意力头数(Q / KV)</th>
<th>嵌入共享</th>
<th>上下文长度</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen3-0.6B</td>
<td>28</td>
<td>16 / 8</td>
<td>是</td>
<td>32K</td>
</tr>
<tr>
<td>Qwen3-1.7B</td>
<td>28</td>
<td>16 / 8</td>
<td>是</td>
<td>32K</td>
</tr>
<tr>
<td>Qwen3-4B</td>
<td>36</td>
<td>32 / 8</td>
<td>是</td>
<td>128K</td>
</tr>
<tr>
<td>Qwen3-8B</td>
<td>36</td>
<td>32 / 8</td>
<td>否</td>
<td>128K</td>
</tr>
<tr>
<td>Qwen3-14B</td>
<td>40</td>
<td>40 / 8</td>
<td>否</td>
<td>128K</td>
</tr>
<tr>
<td>Qwen3-32B</td>
<td>64</td>
<td>64 / 8</td>
<td>否</td>
<td>128K</td>
</tr>
</tbody></table>
<h3 id="2-2-moe-mxjg">2.2 MoE 模型架构</h3>
<p>Qwen3 MoE 模型与稠密模型共享相同的基础架构。关键信息如下:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>层数</th>
<th>注意力头数(Q / KV)</th>
<th>专家数(总 / 激活)</th>
<th>上下文长度</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen3-30B-A3B</td>
<td>48</td>
<td>32 / 4</td>
<td>128 / 8</td>
<td>128K</td>
</tr>
<tr>
<td>Qwen3-235B-A22B</td>
<td>94</td>
<td>64 / 4</td>
<td>128 / 8</td>
<td>128K</td>
</tr>
</tbody></table>
<p>Qwen3 MoE 遵循 Qwen2.5-MoE 并实现细粒度专家分割(fine-grained expert segmentation)。Qwen3 MoE 模型共有 <strong>128 个专家</strong>, 每 token 激活 <strong>8 个专家</strong>。与 Qwen2.5-MoE 不同, Qwen3-MoE 设计<strong>排除了共享专家(shared experts)</strong>。此外, 我们采用<strong>全局批次负载均衡损失(global-batch load balancing loss)</strong> 来鼓励专家专业化。这些架构和训练创新在下游任务中带来了显著的性能提升。</p>
<h3 id="2-3-fcq">2.3 分词器</h3>
<p>Qwen3 模型使用 Qwen 分词器, 实现字节级字节对编码(BBPE), 词表大小为 <strong>151,669</strong>。</p>
<hr>
<h2 id="s-yxl-pre-training">三、预训练 (Pre-training)</h2>
<h3 id="3-1-yxlsj">3.1 预训练数据</h3>
<p>与 Qwen2.5 相比, 我们显著扩展了训练数据的规模和多样性。具体来说, 我们收集了<strong>两倍</strong>的预训练 token——涵盖<strong>三倍</strong>的语言。所有 Qwen3 模型都在一个庞大而多样化的数据集上进行训练, 该数据集包含 <strong>119 种语言和方言</strong>, 总计 <strong>36 万亿 token</strong>。数据集涵盖编码、STEM(科学、技术、工程和数学)、推理任务、书籍、多语言文本和合成数据等多个领域的高质量内容。</p>
<p>为进一步扩展预训练数据语料库, 我们采用多模态方法:</p>
<ol>
<li><p><strong>PDF 文本提取</strong>: 使用 Qwen2.5-VL 模型对大量 PDF 类文档进行文本识别, 然后使用 Qwen2.5 模型精炼识别出的文本以提高质量。通过这一两步流程, 我们获得了额外数万亿的高质量文本 token。</p>
</li>
<li><p><strong>合成数据生成</strong>: 使用 Qwen2.5、Qwen2.5-Math 和 Qwen2.5-Coder 模型以不同格式合成数万亿文本 token, 包括教科书、问答、指令和代码片段, 涵盖数十个领域。</p>
</li>
<li><p><strong>多语言扩展</strong>: 进一步扩展预训练语料库, 引入更多多语言数据。与 Qwen2.5 使用的预训练数据相比, 支持的语言数量从 29 种显著增加到 119 种, 增强了模型的语言覆盖范围和跨语言能力。</p>
</li>
</ol>
<p>我们开发了一个多语言数据标注系统, 旨在提升训练数据的质量和多样性。该系统已应用于大规模预训练数据集, 在超过 30 万亿 token 上进行了多维度标注, 包括教育价值、领域、学科和安全性。这些详细标注支持更有效的数据过滤和组合。与之前在数据源或领域级别优化数据混合的研究不同, 我们的方法通过在小型代理模型上进行大量消融实验, 利用细粒度数据标签在**实例级别(instance-level)**优化数据混合。</p>
<h3 id="3-2-yxljd">3.2 预训练阶段</h3>
<p>Qwen3 模型通过<strong>三阶段</strong>预训练过程:</p>
<p><strong>阶段一: 通用阶段(S1)</strong></p>
<p>所有 Qwen3 模型在超过 30 万亿 token 上使用 4,096 的序列长度进行训练。在此阶段, 模型在语言能力和通用世界知识方面得到充分预训练, 训练数据涵盖 119 种语言和方言。</p>
<p><strong>阶段二: 推理阶段(S2)</strong></p>
<p>为进一步提升推理能力, 我们通过增加 STEM、编码、推理和合成数据的比例来优化此阶段的预训练语料库。模型在约 5 万亿更高质量的 token 上以 4,096 的序列长度进行进一步预训练。我们还在此阶段加速学习率衰减。</p>
<p><strong>阶段三: 长上下文阶段</strong></p>
<p>在最终的预训练阶段, 我们收集高质量的长上下文语料库来扩展 Qwen3 模型的上下文长度。所有模型在数百亿 token 上以 32,768 的序列长度进行预训练。长上下文语料库包括 75% 长度在 16,384 至 32,768 token 之间的文本, 以及 25% 长度在 4,096 至 16,384 token 之间的文本。遵循 Qwen2.5 的做法, 我们使用 ABF 技术将 RoPE 的基频从 10,000 增加到 1,000,000。同时, 我们引入 YARN 和双块注意力(DCA)来实现推理时序列长度能力的四倍扩展。</p>
<p>与 Qwen2.5 类似, 我们基于上述三个预训练阶段开发了最优超参数(如学习率调度器和批次大小)的缩放定律。通过大量实验, 我们系统研究了模型架构、训练数据、训练阶段与最优训练超参数之间的关系。最终, 我们为每个稠密或 MoE 模型设置了预测的最优学习率和批次大小策略。</p>
<h3 id="3-3-jzmxpg">3.3 基座模型评估</h3>
<p>我们对 Qwen3 系列的基座语言模型进行了全面评估。基座模型评估主要关注其在通用知识、推理、数学、科学知识、编码和多语言能力方面的表现。评估数据集包括 15 个基准:</p>
<p><strong>通用任务</strong>: MMLU(5-shot)、MMLU-Pro(5-shot, CoT)、MMLU-redux(5-shot)、BBH(3-shot, CoT)、SuperGPQA(5-shot, CoT)</p>
<p><strong>数学与 STEM 任务</strong>: GPQA(5-shot, CoT)、GSM8K(4-shot, CoT)、MATH(4-shot, CoT)</p>
<p><strong>编码任务</strong>: EvalPlus(0-shot, HumanEval/MBPP/Humaneval+/MBPP+ 平均)、MultiPL-E(0-shot, 8 种语言)、MBPP-3shot、CRUXEval(1-shot)</p>
<p><strong>多语言任务</strong>: MGSM(8-shot, CoT)、MMMLU(5-shot)、INCLUDE(5-shot)</p>
<p><strong>基座模型评估关键结论</strong>:</p>
<ol>
<li><p><strong>Qwen3-235B-A22B-Base</strong>: 与此前开源的 SOTA 稠密和 MoE 基座模型(如 DeepSeek-V3 Base、Llama-4-Maverick Base、Qwen2.5-72B-Base)相比, Qwen3-235B-A22B-Base 在大多数任务上以显著更少的总参数或激活参数 outperform 这些模型。与 DeepSeek-V3-Base 相比, Qwen3-235B-A22B-Base 在 15 个评估基准中的 14 个上胜出, 而总参数仅约为 1/3, 激活参数约为 2/3。</p>
</li>
<li><p><strong>Qwen3 MoE 基座模型</strong>: (a) 使用相同的预训练数据, Qwen3 MoE 基座模型仅以 <strong>1/5</strong> 的激活参数即可达到与 Qwen3 稠密基座模型相似的性能。(b) 由于 Qwen3 MoE 架构的改进、训练 token 规模的扩大以及更先进的训练策略, Qwen3 MoE 基座模型以少于 <strong>1/2</strong> 的激活参数和更少的总参数即可 outperform Qwen2.5 MoE 基座模型。(c) 即使激活参数仅为 Qwen2.5 稠密基座模型的 <strong>1/10</strong>, Qwen3 MoE 基座模型也能达到可比的性能, 这为我们带来了推理和训练成本上的显著优势。</p>
</li>
<li><p><strong>Qwen3 稠密基座模型</strong>: 整体性能与更高参数规模的 Qwen2.5 基座模型相当。例如, Qwen3-1.7B/4B/8B/14B/32B-Base 分别与 Qwen2.5-3B/7B/14B/32B/72B-Base 达到可比性能。尤其在 STEM、编码和推理基准上, Qwen3 稠密基座模型的性能甚至 surpass 更高参数规模的 Qwen2.5 基座模型。</p>
</li>
</ol>
<p>以下是各尺寸模型的详细对比:</p>
<p><strong>Qwen3-32B-Base</strong> (最大稠密模型): 与相似规模的 Qwen2.5-32B-Base 和 Gemma-3-27B Base 相比, Qwen3-32B-Base 在大多数基准上胜出。值得注意的是, 尽管 Qwen3-32B-Base 的参数不到 Qwen2.5-72B-Base 的一半, 它在 15 个评估基准中的 10 个上 outperform 后者。在编码、数学和推理基准上, Qwen3-32B-Base 具有显著优势。</p>
<p><strong>Qwen3-14B-Base 与 Qwen3-30B-A3B-Base</strong>: Qwen3-14B-Base 在所有 15 个基准上显著优于 Qwen2.5-14B-Base 和 Gemma-3-12B-Base。Qwen3-30B-A3B 仅以 1/5 的激活非嵌入参数就在所有任务上显著 outperform Qwen2.5-14B-Base, 并与 Qwen3-14B-Base 和 Qwen2.5-32B-Base 达到可比性能。</p>
<p><strong>边缘端模型(Qwen3-8B/4B/1.7B/0.6B-Base)</strong>: 所有 Qwen3 边缘端模型在几乎所有基准上继续保持强劲性能。值得注意的是, Qwen3-8B/4B/1.7B-Base 模型在超过一半的基准上甚至 outperform 更大尺寸的 Qwen2.5-14B/7B/3B Base 模型, 尤其在 STEM 相关和编码基准上, 反映了 Qwen3 模型的显著改进。</p>
<hr>
<h2 id="s-hxl-post-training">四、后训练 (Post-training)</h2>
<p>Qwen3 的后训练流程围绕两个核心目标进行策略设计:</p>
<ol>
<li><strong>思考控制(Thinking Control)</strong>: 整合「非思考」和「思考」两种不同模式, 为用户提供灵活选择——决定模型是否进行推理, 以及通过指定思考过程的 token 预算来控制推理深度。</li>
<li><strong>强到弱蒸馏(Strong-to-Weak Distillation)</strong>: 优化轻量级模型的后训练流程, 利用大规模模型的知识, 大幅减少构建小尺寸模型所需的计算成本和开发工作量。</li>
</ol>
<p>Qwen3 系列的旗舰模型遵循一个精巧的<strong>四阶段训练</strong>流程。前两个阶段专注于培养模型的「思考」能力。后两个阶段旨在将强大的「非思考」功能整合到模型中。</p>
<p>初步实验表明, 直接将教师模型的输出 logits 蒸馏到轻量级学生模型中, 可以有效提升性能, 同时保持对推理过程的细粒度控制。这种方法消除了为每个小尺寸模型单独执行完整四阶段训练流程的必要性, 不仅带来了更好的即时性能(以更高的 Pass@1 分数体现), 还改善了模型的探索能力(以提升的 Pass@64 结果反映)。此外, 它以更高的训练效率实现了这些收益, 仅需四阶段训练方法 <strong>1/10</strong> 的 GPU 小时。</p>
<h3 id="4-1-clssklqd-long-cot-cold-start">4.1 长链式思考冷启动 (Long-CoT Cold Start)</h3>
<p>我们首先整理一个全面的数据集, 涵盖数学、代码、逻辑推理和通用 STEM 问题等多个类别。数据集中的每个问题都配有经过验证的参考答案或基于代码的测试用例。该数据集作为长链式思考(long CoT)训练「冷启动」阶段的基础。</p>
<p>数据集构建涉及严格的两阶段过滤流程:<strong>查询过滤</strong>和<strong>响应过滤</strong>。</p>
<p><strong>查询过滤阶段</strong>: 使用 Qwen2.5-72B-Instruct 识别并移除不易验证的查询, 包括包含多个子问题的查询或要求通用文本生成的查询。此外, 我们排除那些 Qwen2.5-72B-Instruct 可以在不使用 CoT 推理的情况下正确回答的查询, 以防止模型依赖表面猜测, 确保仅包含需要深入推理的复杂问题。我们还使用 Qwen2.5-72B-Instruct 为每个查询标注领域, 以保持数据集内领域表示的平衡。</p>
<p><strong>响应过滤阶段</strong>: 在保留验证查询集后, 我们使用 QwQ-32B 为每个剩余查询生成 N 个候选响应。当 QwQ-32B 持续无法生成正确解答时, 人工标注员手动评估响应的准确性。对于 Pass@N 为正的查询, 进一步应用严格的过滤标准以移除以下响应:(1) 最终答案错误的;(2) 包含大量重复的;(3) 明显表明猜测而缺乏充分推理的;(4) 思考内容与总结内容不一致的;(5) 涉及不恰当的语言混合或风格转变的;(6)  suspected 与潜在验证集项目过于相似的。</p>
<p>随后, 使用经过精心筛选的数据集子集进行推理模式的初始冷启动训练。此阶段的目标是在模型中灌输基础推理模式, 而不过度强调即时推理性能。这种方法确保模型的潜力不受限制, 允许在后续的强化学习(RL)阶段有更大的灵活性和改进空间。为了有效实现这一目标, 最好在此准备阶段最小化训练样本数量和训练步数。</p>
<h3 id="4-2-tlqhxx-reasoning-rl">4.2 推理强化学习 (Reasoning RL)</h3>
<p>推理 RL 阶段使用的查询-验证器对必须满足以下四个标准:</p>
<ol>
<li>未在冷启动阶段使用过</li>
<li>对冷启动模型而言是可学习的</li>
<li>尽可能具有挑战性</li>
<li>涵盖广泛的子领域</li>
</ol>
<p>我们最终收集了总计 <strong>3,995</strong> 个查询-验证器对, 并采用 <strong>GRPO</strong> 更新模型参数。我们观察到, 使用大批量大小和每查询较高的 rollout 数量, 结合离线训练以提高样本效率, 对训练过程有益。我们还通过控制模型的熵稳步增加或保持稳定来解决探索与利用的平衡问题, 这对维持稳定训练至关重要。结果, 我们在单次 RL 运行中实现了训练奖励和验证性能的一致提升, 无需对超参数进行任何人工干预。例如, Qwen3-235B-A22B 模型的 AIME&#39;24 分数在总计 170 个 RL 训练步中从 70.1 提升至 85.1。</p>
<h3 id="4-3-skmsrh-thinking-mode-fusion">4.3 思考模式融合 (Thinking Mode Fusion)</h3>
<p>思考模式融合阶段的目标是将「非思考」能力整合到先前开发的「思考」模型中。这种方法允许开发者管理和控制推理行为, 同时降低为思考和推理任务部署单独模型的成本和复杂度。</p>
<p>为实现这一目标, 我们对推理 RL 模型进行持续监督微调(SFT), 并设计对话模板来融合两种模式。此外, 我们发现能够熟练处理两种模式的模型在不同思考预算下表现一致良好。</p>
<h4 id="4-3-1-sft-sjgj">4.3.1 SFT 数据构建</h4>
<p>SFT 数据集结合了「思考」数据和「非思考」数据。为确保阶段 2 模型的性能不会因额外的 SFT 而受损, 「思考」数据通过对阶段 1 查询使用阶段 2 模型本身进行拒绝采样生成。「非思考」数据则经过精心整理, 涵盖编码、数学、指令遵循、多语言任务、创意写作、问答和角色扮演等多样化任务。此外, 我们采用自动生成的检查清单来评估「非思考」数据的响应质量。为增强低资源语言任务的性能, 我们特别增加了翻译任务的比例。</p>
<h4 id="4-3-2-dhmbsj">4.3.2 对话模板设计</h4>
<p>为更好地整合两种模式并允许用户动态切换模型的思考过程, 我们为 Qwen3 设计了对话模板。具体来说, 对于思考模式和非思考模式的样本, 我们在用户查询或系统消息中分别引入 <code>/think</code> 和 <code>/no_think</code> 标志。这允许模型遵循用户输入并相应地选择适当的思考模式。</p>
<p>对于非思考模式样本, 我们在助手的响应中保留一个空的思考块。这种设计确保了模型内部的格式一致性, 并允许开发者通过在对话模板中拼接一个空思考块来阻止模型进行思考行为。默认情况下, 模型以思考模式运行; 因此, 我们添加了一些用户查询不包含 <code>/think</code> 标志的思考模式训练样本。对于更复杂的多轮对话, 我们随机在用户的查询中插入多个 <code>/think</code> 和 <code>/no_think</code> 标志, 模型响应遵循最后遇到的标志。</p>
<h4 id="4-3-3-skys-thinking-budget">4.3.3 思考预算(Thinking Budget)</h4>
<p>思考模式融合的一个额外优势是, 一旦模型学会以非思考和思考模式响应, 它自然就具备了处理中间情况的能力——基于不完整的思考生成响应。这一能力为实现对模型思考过程的预算控制奠定了基础。</p>
<p>具体来说, 当模型思考的长度达到用户定义的阈值时, 我们手动停止思考过程并插入停止思考指令: &quot;Considering the limited time by the user, I have to give the solution based on the thinking directly now.\\n</think>.\\n\\n&quot;。在此指令插入后, 模型基于其截至该点积累的推理生成最终响应。值得注意的是, 这种能力并非经过显式训练, 而是应用思考模式融合后自然涌现的结果。</p>
<h3 id="4-4-tyqhxx-general-rl">4.4 通用强化学习 (General RL)</h3>
<p>通用 RL 阶段旨在广泛增强模型在多样化场景中的能力和稳定性。为此, 我们建立了一个复杂的<strong>奖励系统</strong>, 涵盖 <strong>20 多个不同任务</strong>, 每个任务都有定制的评分标准。这些任务专门针对以下核心能力的增强:</p>
<ul>
<li><strong>指令遵循</strong>: 确保模型准确理解和遵循用户指令, 包括与内容、格式、长度和结构化输出相关的要求, 提供符合用户期望的响应。</li>
<li><strong>格式遵循</strong>: 除明确指令外, 我们期望模型遵守特定的格式约定。例如, 它应根据 <code>/think</code> 和 <code>/no_think</code> 标志在思考和非思考模式之间切换, 并始终使用指定 token(如 <code>&lt;think&gt;</code> 和 <code>&lt;/think&gt;</code>)分隔最终输出中的思考部分和响应部分。</li>
<li><strong>偏好对齐</strong>: 对于开放式查询, 偏好对齐专注于提升模型的有用性、参与度和风格, 最终提供更自然、更令人满意的用户体验。</li>
<li><strong>Agent 能力</strong>: 训练模型通过指定接口正确调用工具。在 RL rollout 期间, 模型被允许执行完整的多轮交互循环, 获得真实环境执行反馈, 从而提升其在长程决策任务中的性能和稳定性。</li>
<li><strong>专用场景能力</strong>: 在更专业的场景中, 我们设计针对特定上下文量身定制的任务。例如, 在检索增强生成(RAG)任务中, 我们引入奖励信号来引导模型生成准确且上下文适当的响应, 从而最小化幻觉风险。</li>
</ul>
<p>为上述任务提供反馈, 我们使用了三种不同类型的奖励:</p>
<ol>
<li><strong>基于规则的奖励(Rule-based Reward)</strong>: 基于规则的奖励在推理 RL 阶段已广泛使用, 对指令遵循和格式遵守等通用任务也很有用。精心设计的基于规则的奖励可以高精度评估模型输出的正确性, 防止奖励篡改(reward hacking)等问题。</li>
<li><strong>带参考答案的模型奖励(Model-based Reward with Reference Answer)</strong>: 在此方法中, 我们为每个查询提供参考答案, 并提示 Qwen2.5-72B-Instruct 根据此参考答案为模型响应评分。这种方法允许更灵活地处理多样化任务, 无需严格格式, 避免了纯基于规则奖励可能产生的假阴性。</li>
<li><strong>不带参考答案的模型奖励(Model-based Reward without Reference Answer)</strong>: 利用人类偏好数据, 我们训练一个奖励模型为模型响应分配标量分数。这种不依赖参考答案的方法可以处理更广泛的查询, 同时有效提升模型的参与度和有用性。</li>
</ol>
<h3 id="4-5-qdrzl-strong-to-weak-distillation">4.5 强到弱蒸馏 (Strong-to-Weak Distillation)</h3>
<p>强到弱蒸馏流程专门为优化轻量级模型而设计, 涵盖 5 个稠密模型(Qwen3-0.6B、1.7B、4B、8B、14B)和 1 个 MoE 模型(Qwen3-30B-A3B)。这种方法在提升模型性能的同时, 有效 impart 了强大的模式切换能力。蒸馏过程分为两个主要阶段:</p>
<p><strong>阶段一: 离线蒸馏(Off-policy Distillation)</strong></p>
<p>在此初始阶段, 我们结合使用 <code>/think</code> 和 <code>/no_think</code> 模式生成的教师模型输出进行响应蒸馏。这帮助轻量级学生模型培养基本推理技能和在不同思考模式之间切换的能力, 为下一阶段的在线训练奠定坚实基础。</p>
<p><strong>阶段二: 在线蒸馏(On-policy Distillation)</strong></p>
<p>在此阶段, 学生模型生成在线策略序列用于微调。具体来说, 采样提示, 学生模型以 <code>/think</code> 或 <code>/no_think</code> 模式生成响应。然后通过将学生模型的 logits 与教师模型(Qwen3-32B 或 Qwen3-235B-A22B)的 logits 对齐以最小化 KL 散度来微调学生模型。</p>
<p><strong>蒸馏效果验证</strong>: 我们通过比较蒸馏后与直接强化学习的性能和计算成本(以 GPU 小时衡量)来评估在线蒸馏的有效性和效率, 两者均从相同的离线蒸馏 8B Checkpoint开始。为简化, 我们仅关注数学和代码相关查询。结果显示, 蒸馏实现了显著优于强化学习的性能, 而仅需约 <strong>1/10</strong> 的 GPU 小时。此外, 从教师 logits 蒸馏使学生模型能够扩展其探索空间并增强推理潜力, 这体现在蒸馏后 AIME&#39;24 和 AIME&#39;25 基准上的 pass@64 分数提升, 而强化学习并未带来 pass@64 分数的任何改善。</p>
<hr>
<h2 id="w-sypg-experiments">五、实验评估 (Experiments)</h2>
<h3 id="5-1-zlwtmxpg">5.1 指令微调模型评估</h3>
<p>为全面评估指令微调模型的质量, 我们在思考模式和非思考模式下采用自动基准进行评估。这些基准按以下几个维度分类:</p>
<p><strong>通用任务</strong>: MMLU-Redux、GPQA-Diamond、C-Eval、LiveBench(2024-11-25)</p>
<p><strong>对齐任务</strong>: IFEval(严格提示准确率)、Arena-Hard、AlignBench v1.1、Creative Writing V3、WritingBench</p>
<p><strong>数学与文本推理</strong>: MATH-500、AIME&#39;24、AIME&#39;25、ZebraLogic、AutoLogi</p>
<p><strong>Agent 与编码</strong>: BFCL v3、LiveCodeBench(v5, 2024.10-2025.02)、CodeForces Elo 评分</p>
<p><strong>多语言任务</strong>: Multi-IF(8 种语言)、INCLUDE(44 种语言)、MMMLU(14 种语言)、MT-AIME2024(55 种语言)、PolyMath(18 种语言)、MLogiQA(10 种语言)</p>
<h4 id="5-1-1-qjmx-qwen3-235b-a22b">5.1.1 旗舰模型 Qwen3-235B-A22B</h4>
<p><strong>思考模式对比</strong>: 与 OpenAI-o1、DeepSeek-R1、Grok-3-Beta(Think)、Gemini2.5-Pro 等推理基线相比, Qwen3-235B-A22B(Thinking)以仅 60% 的激活参数和 35% 的总参数, 在 <strong>23 个基准中的 17 个</strong>上 outperform DeepSeek-R1, 尤其在需要推理的任务(如数学、Agent 和编码)上表现突出, 展示了 Qwen3-235B-A22B 在开源模型中最先进的推理能力。同时, Qwen3-235B-A22B(Thinking) 与闭源的 OpenAI-o1、Grok-3-Beta(Think) 和 Gemini2.5-Pro 也极具竞争力, 大幅缩小了开源与闭源模型在推理能力上的差距。</p>
<p><strong>非思考模式对比</strong>: 与 GPT-4o、DeepSeek-V3、Qwen2.5-72B-Instruct、LLaMA-4-Maverick 等非推理基线相比, Qwen3-235B-A22B(Non-thinking) 超越了其他领先的开源模型, 并在 <strong>23 个基准中的 18 个</strong>上 surpass 闭源的 GPT-4o-2024-11-20, 表明即使不增强深思熟虑的思考过程, 其本身也具备强大的能力。</p>
<table>
<thead>
<tr>
<th>任务类别</th>
<th>基准</th>
<th>OpenAI-o1</th>
<th>DeepSeek-R1</th>
<th>Gemini2.5-Pro</th>
<th>Qwen3-235B-A22B (Thinking)</th>
</tr>
</thead>
<tbody><tr>
<td>数学推理</td>
<td>AIME&#39;24</td>
<td>74.3</td>
<td>79.8</td>
<td><strong>92.0</strong></td>
<td><strong>85.7</strong></td>
</tr>
<tr>
<td>数学推理</td>
<td>AIME&#39;25</td>
<td>79.2</td>
<td>70.0</td>
<td><strong>86.7</strong></td>
<td><strong>81.5</strong></td>
</tr>
<tr>
<td>数学推理</td>
<td>MATH-500</td>
<td>96.4</td>
<td>97.3</td>
<td><strong>98.8</strong></td>
<td><strong>98.0</strong></td>
</tr>
<tr>
<td>编码</td>
<td>LiveCodeBench v5</td>
<td>63.9</td>
<td>64.3</td>
<td>70.4</td>
<td><strong>70.7</strong></td>
</tr>
<tr>
<td>编码</td>
<td>CodeForces</td>
<td>1891</td>
<td><strong>2029</strong></td>
<td>2001</td>
<td><strong>2056</strong></td>
</tr>
<tr>
<td>Agent</td>
<td>BFCL v3</td>
<td><strong>67.8</strong></td>
<td>56.9</td>
<td>62.9</td>
<td><strong>70.8</strong></td>
</tr>
<tr>
<td>对齐</td>
<td>Arena-Hard</td>
<td>92.1</td>
<td>92.3</td>
<td><strong>96.4</strong></td>
<td><strong>95.6</strong></td>
</tr>
</tbody></table>
<h4 id="5-1-2-qjcmmx-qwen3-32b">5.1.2 旗舰稠密模型 Qwen3-32B</h4>
<p><strong>思考模式</strong>: 与 DeepSeek-R1-Distill-Llama-70B、QwQ-32B、OpenAI-o3-mini(medium) 等推理基线相比, Qwen3-32B(Thinking) 在 <strong>23 个基准中的 17 个</strong>上 outperform QwQ-32B, 成为 32B 尺寸上新的 SOTA 推理模型。同时, Qwen3-32B(Thinking) 与闭源的 OpenAI-o3-mini(medium) 在对齐和多语言性能上更具优势。</p>
<p><strong>非思考模式</strong>: 与 GPT-4o-mini、LLaMA-4-Scout、Qwen2.5-72B-Instruct 等非推理基线相比, Qwen3-32B(Non-thinking) 在几乎所有基准上均 exhibit 优越性能。尤其, Qwen3-32B(Non-thinking) 在通用任务上与 Qwen2.5-72B-Instruct 表现相当, 在对齐、多语言和推理相关任务上具有显著优势, 再次证明了 Qwen3 相对于 Qwen2.5 系列的根本性改进。</p>
<h4 id="5-1-3-qljmx">5.1.3 轻量级模型</h4>
<p>包括 Qwen3-30B-A3B、Qwen3-14B 及其他更小的稠密模型在内的轻量级模型, 在思考模式和非思考模式下均持续优于参数相近或更大的开源模型, 证明了强到弱蒸馏方法的成功。</p>
<p><strong>Qwen3-14B / 30B-A3B(Thinking)</strong>: Qwen3-14B 在 23 个基准中的多个上接近或 surpass QwQ-32B, 而 Qwen3-30B-A3B 以仅 3B 激活参数在推理任务上达到与 QwQ-32B 和 DeepSeek-R1-Distill-Qwen-32B 相当的水平。</p>
<p><strong>Qwen3-8B / 4B(Thinking)</strong>: Qwen3-8B 在多个基准上 outperform DeepSeek-R1-Distill-Qwen-32B, 展示了小尺寸模型的强大潜力。Qwen3-4B 也在多个推理任务上 surpass DeepSeek-R1-Distill-Qwen-14B。</p>
<h3 id="5-2-csxwnl">5.2 长上下文能力</h3>
<p>为评估长上下文处理能力, 我们在 RULER 基准上报告结果。为启用长度外推, 我们使用 YARN 并设置 <code>scaling_factor=4</code>。在思考模式下, 我们将思考预算设为 8192 token 以缓解极长输入上过于冗长的推理。</p>
<table>
<thead>
<tr>
<th>模式</th>
<th>模型</th>
<th>平均</th>
<th>4K</th>
<th>8K</th>
<th>16K</th>
<th>32K</th>
<th>64K</th>
<th>128K</th>
</tr>
</thead>
<tbody><tr>
<td>非思考</td>
<td>Qwen3-235B-A22B</td>
<td><strong>95.0</strong></td>
<td><strong>97.7</strong></td>
<td><strong>97.2</strong></td>
<td>96.4</td>
<td>95.1</td>
<td><strong>93.3</strong></td>
<td><strong>90.6</strong></td>
</tr>
<tr>
<td>非思考</td>
<td>Qwen3-14B</td>
<td>94.6</td>
<td>98.0</td>
<td>97.8</td>
<td><strong>96.4</strong></td>
<td><strong>96.1</strong></td>
<td>94.0</td>
<td>85.1</td>
</tr>
<tr>
<td>非思考</td>
<td>Qwen3-32B</td>
<td>93.7</td>
<td><strong>98.4</strong></td>
<td>96.0</td>
<td>96.2</td>
<td>94.4</td>
<td>91.8</td>
<td>85.6</td>
</tr>
<tr>
<td>思考</td>
<td>Qwen3-235B-A22B</td>
<td>92.2</td>
<td>95.1</td>
<td>94.8</td>
<td>93.0</td>
<td>92.3</td>
<td>92.0</td>
<td>86.0</td>
</tr>
<tr>
<td>思考</td>
<td>Qwen3-32B</td>
<td>91.0</td>
<td>94.7</td>
<td>93.7</td>
<td>91.6</td>
<td>92.5</td>
<td>90.0</td>
<td>83.5</td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>:</p>
<ol>
<li>在非思考模式下, Qwen3 在长上下文处理任务上 outperform 相似尺寸的 Qwen2.5 模型。</li>
<li>在思考模式下, 模型的性能略有下降。我们假设思考内容对这些不依赖推理的检索任务没有显著益处, 反而可能干扰检索过程。</li>
</ol>
<h3 id="5-3-skysdyxx">5.3 思考预算的有效性</h3>
<p>为验证 Qwen3 能否通过增加思考预算来提升智能水平, 我们在数学、编码和 STEM 领域的四个基准上调整分配的思考预算。结果显示, Qwen3 展现出与分配的思考预算相关的可扩展且平滑的性能提升。此外, 我们观察到如果进一步将输出长度扩展到 32K 以上, 模型性能预计将进一步提升。</p>
<hr>
<h2 id="l-jsskjd-thinking-nodes">六、技术思考节点 (Thinking Nodes)</h2>
<h3 id="6-1-sjdjcm">6.1 设计动机层面</h3>
<p><strong>思考 1: 为什么要在单一模型中统一思考模式和非思考模式, 而不是像之前那样分别发布 Qwen2.5 和 QwQ?</strong></p>
<p>Qwen3 选择双模式统一的核心动机在于<strong>部署效率与用户体验</strong>。分别维护两个模型(Qwen2.5 + QwQ)意味着双倍的服务基础设施、路由逻辑和版本管理复杂度。对于开发者而言, 在两种模式之间切换需要更换模型端点或重新加载权重, 这在实时应用中是不可接受的延迟。统一模型通过 <code>/think</code> 和 <code>/no_think</code> 对话模板标志实现零开销模式切换, 同时思考预算机制允许在单一推理调用中动态调节计算投入。这种设计哲学与 DeepSeek-R1 的「蒸馏版」策略不同——Qwen3 不是训练一个强推理教师再蒸馏出弱学生, 而是让单一模型内部同时掌握两种能力范式, 从根本上消除了模式切换的摩擦成本。</p>
<p><strong>思考 2: 思考预算机制的本质是什么? 它与传统推理时扩展(inference-time scaling)有何不同?</strong></p>
<p>思考预算的本质是<strong>对推理深度的显式控制接口</strong>。传统推理时扩展(如 o3 的 test-time compute 或 DeepSeek-R1 的多轮推理)通常通过增加采样次数或推理步数来提升性能, 但用户无法精确控制「思考多少 token 后停止」。Qwen3 的思考预算允许用户设定一个硬阈值(如 8192 token), 当思考长度达到阈值时强制插入停止指令 <code>&lt;/think&gt;</code> 并要求模型基于不完整思考给出答案。这种机制的创新之处在于:(1) 它是<strong>训练时涌现的能力</strong>——模型在思考模式融合阶段学会了处理不完整思考, 无需显式训练;(2) 它提供了<strong>连续谱控制</strong>——从 0 token(非思考模式)到任意长度(思考模式)之间的任意点都可以作为终止条件;(3) 它实现了<strong>计算-质量权衡的可编程性</strong>——用户可以根据延迟约束或成本预算动态调整, 而非被动接受模型的默认推理深度。</p>
<h3 id="6-2-jgxjcm">6.2 架构细节层面</h3>
<p><strong>思考 3: Qwen3-MoE 去掉共享专家(shared experts)并采用全局批次负载均衡, 相比 Qwen2.5-MoE 的设计有何取舍?</strong></p>
<p>Qwen2.5-MoE 采用了 DeepSeek-MoE 的共享专家设计——部分专家始终激活以捕获通用知识, 其余专家通过路由选择。Qwen3-MoE 移除了共享专家, 所有 128 个专家完全由路由机制决定。这一变化的潜在逻辑是:(1) <strong>简化架构</strong>——共享专家需要额外的超参数(共享专家数量、容量因子等), 移除后减少了调参空间;(2) <strong>全局负载均衡</strong>——通过在整个训练批次而非单个序列上计算负载均衡损失, 可以更有效地缓解专家崩溃(expert collapse)问题, 因为全局统计更稳定;(3) <strong>细粒度专业化</strong>——没有共享专家的「保底」机制, 所有专家都必须通过路由竞争来证明自己, 这可能促进更细粒度的专业化。但潜在风险是: 某些基础语言建模能力可能分散在多个专家中, 导致单 token 的激活专家覆盖不够全面。实验结果表明这一设计是成功的——Qwen3-30B-A3B 以仅 3B 激活参数就达到与 Qwen3-14B(14B 激活)相当的性能, 说明专家路由学会了高效分配计算。</p>
<p><strong>思考 4: QK-Norm 的引入对训练稳定性有何具体影响? 为什么 Qwen2 的 QKV-bias 被移除?</strong></p>
<p>QK-Norm(对 Query 和 Key 在点积注意力之前应用 LayerNorm)的引入直接解决了大模型训练中常见的<strong>注意力 logits 爆炸问题</strong>。随着模型深度增加, Q 和 K 的点积可能产生极大值, 导致 softmax 梯度消失(vanishing gradients)和训练不稳定。QK-Norm 将 Q 和 K 的范数约束在合理范围内, 确保注意力权重的分布更加稳定。移除 QKV-bias 则遵循了现代 Transformer 设计的主流趋势——bias 项在预训练中的收益有限, 但会增加参数量和计算开销。更重要的是, 移除 bias 后 QK-Norm 的效果更纯粹: 如果没有 QK-Norm, 移除 bias 可能使注意力 logits 的均值偏移问题加剧; 但配合 QK-Norm 后, 注意力计算完全依赖于归一化后的 Q/K 方向相似度, bias 的缺失不再构成问题。这一组合变更(QKV-bias 移除 + QK-Norm 引入)反映了 Qwen3 在训练稳定性与架构简洁性之间的审慎权衡。</p>
<h3 id="6-3-sjysycm">6.3 数据与实验层面</h3>
<p><strong>思考 5: 四阶段后训练中, 为什么阶段 3(思考模式融合)要使用阶段 2 模型自身进行拒绝采样, 而不是继续使用 QwQ-32B 生成思考数据?</strong></p>
<p>这一设计选择的核心是<strong>防止能力退化(capability regression)</strong>。阶段 2 的 Reasoning RL 模型已经在数学和代码推理上达到了很高水平(如 AIME&#39;24 从 70.1 提升到 85.1)。如果阶段 3 的 SFT 使用 QwQ-32B 生成的思考数据, 这些数据可能来自与阶段 2 模型不同的分布——QwQ-32B 的推理风格、中间步骤结构和错误模式可能与阶段 2 模型训练出的模式不一致。将分布外(OOD)数据混入阶段 3 的 SFT 可能导致阶段 2 获得的推理能力被「覆盖」或稀释。相反, 使用阶段 2 模型自身进行拒绝采样确保了「思考」数据与模型当前的能力分布一致, 从而保护阶段 2 的 RL 成果。同时, 非思考数据的引入为模型提供了全新的能力维度(快速响应、创意写作等), 这两种数据的结合使得模型能够在不牺牲已有推理能力的前提下扩展功能边界。</p>
<p><strong>思考 6: 强到弱蒸馏中, 离线蒸馏(off-policy)和在线蒸馏(on-policy)的分工逻辑是什么? 为什么两步都比单步效果更好?</strong></p>
<p>离线蒸馏和在线蒸馏构成了一个<strong>从模仿到精调</strong>的递进流程。离线蒸馏使用教师模型预先生成的 <code>/think</code> 和 <code>/no_think</code> 响应对作为静态数据集, 学生模型通过标准 SFT 学习这些响应。这一步的目标是<strong>快速建立基础能力</strong>——让学生模型掌握两种模式的基本行为模式和推理结构。由于数据是预先生成的, 离线蒸馏效率高, 可以在较短时间内赋予学生模型「看起来像教师」的能力。</p>
<p>在线蒸馏则进入<strong>动态对齐阶段</strong>: 学生模型自己生成响应(在线策略), 然后将其 logits 与教师模型的 logits 对齐以最小化 KL 散度。这一步的关键在于:(1) <strong>分布匹配</strong>——学生模型在自己的生成分布上学习, 而非教师分布, 避免了离线蒸馏中教师数据与学生能力不匹配的问题;(2) <strong>探索扩展</strong>——实验显示在线蒸馏显著提升了 pass@64(从 90.0 提升到 93.3), 说明学生模型学会了更广泛的解题路径, 而非仅仅复制教师的特定解法;(3) <strong>计算效率</strong>——在线蒸馏仅需约 1/10 的 GPU 小时就达到了比完整 RL 更好的性能, 因为 KL 散度目标比 RL 的奖励优化更稳定、样本效率更高。</p>
<p>两步结合的逻辑是: 离线蒸馏提供「起跑线」, 在线蒸馏提供「优化空间」。如果直接进行在线蒸馏而没有离线阶段, 学生模型初始能力不足, 生成的响应质量太低, 与教师的 KL 散度优化可能陷入局部最优。如果只做离线蒸馏, 学生模型只是机械模仿, 缺乏在自己分布上精调的机会, 探索能力受限。</p>
<h3 id="6-4-jxyfxcm">6.4 局限与风险层面</h3>
<p><strong>思考 7: 思考模式下的长上下文性能为何反而下降? 这对实际应用有何启示?</strong></p>
<p>RULER 基准结果显示, 思考模式下所有 Qwen3 模型的长上下文性能均低于非思考模式。根本原因在于<strong>任务性质与计算分配的不匹配</strong>。RULER 测试的是纯检索能力(如在长文档中定位特定信息), 这类任务不需要多步推理——思考模式下的模型会生成大量中间推理步骤, 这些步骤不仅消耗了本应用于注意力计算的上下文窗口预算, 还可能引入与检索目标无关的语义干扰。具体机制可能是:(1) 思考 token 占用了 KV 缓存空间, 减少了可用于存储原文上下文的位置;(2) 推理链中的假设和验证过程可能「覆盖」或「扭曲」对原文细节的记忆;(3) 注意力权重被重新分配到思考 token 上, 削弱了对远距离上下文的关注。</p>
<p>对实际应用的启示是:<strong>思考模式并非万能</strong>。对于明确的检索任务(如文档问答、关键词定位), 应默认使用非思考模式; 对于需要综合分析、多文档对比或隐含推理的任务, 思考模式的价值才能体现。未来的改进方向可能包括: (1) 训练模型在长上下文检索任务中自动抑制思考;(2) 设计更智能的思考预算分配, 在上下文的不同区域动态调节推理深度;(3) 开发混合模式, 在检索阶段禁用思考、在综合阶段启用思考。</p>
<p><strong>思考 8: 119 种语言的覆盖是否意味着真正的多语言公平性? 数据标注系统如何应对低资源语言的「质量-数量」困境?</strong></p>
<p>119 种语言的支持在数量上令人印象深刻, 但<strong>语言覆盖不等于语言公平性</strong>。INCLUDE 和 Belebele 基准的评估结果显示, Qwen3 在高资源语言(如英语、中文、西班牙语)上表现强劲, 但在部分低资源语言上仍有差距。多语言数据标注系统虽然通过实例级优化提升了数据混合效率, 但低资源语言面临的根本困境——高质量语料稀缺——无法通过算法完全解决。Qwen3 的应对策略包括:(1) 增加翻译任务比例以提升低资源语言的监督信号;(2) 使用合成数据生成(如 Qwen2.5-Math/Coder)来补充特定领域的低资源语言内容;(3) 通过跨语言迁移, 利用高资源语言的表示来辅助低资源语言。然而, 这些方法的局限性在于: 翻译数据可能引入源语言的句法偏见; 合成数据的多样性受限于生成模型的语言能力; 跨语言迁移的效果随语言族距离增加而衰减。真正的多语言公平性可能需要更根本的解决方案, 如与本土语言社区合作收集原始语料、开发语言特定的 tokenizer 优化等。</p>
<h3 id="6-5-jscccm">6.5 技术传承层面</h3>
<p><strong>思考 9: Qwen3 的后训练流程如何继承了 Qwen2/2.5 的技术遗产, 又在哪些关键点上实现了代际跃迁?</strong></p>
<p><strong>传承脉络</strong>:</p>
<table>
<thead>
<tr>
<th>技术组件</th>
<th>Qwen2</th>
<th>Qwen2.5</th>
<th>Qwen3</th>
</tr>
</thead>
<tbody><tr>
<td>基础架构</td>
<td>GQA + DCA + YARN</td>
<td>GQA + RoPE ABF + YARN</td>
<td>GQA + QK-Norm + RoPE ABF + YARN + DCA</td>
</tr>
<tr>
<td>预训练数据</td>
<td>7T tokens, 30 语言</td>
<td>18T tokens, 29 语言</td>
<td>36T tokens, 119 语言</td>
</tr>
<tr>
<td>冷启动</td>
<td>SFT 500K+ 样本</td>
<td>9 维 SFT 增强</td>
<td>长 CoT 冷启动</td>
</tr>
<tr>
<td>对齐方法</td>
<td>DPO 离线 + 在线 RLHF</td>
<td>Offline RL + GRPO 在线 RL</td>
<td>GRPO 推理 RL + 通用 RL + 强到弱蒸馏</td>
</tr>
<tr>
<td>长上下文</td>
<td>32K / 128K</td>
<td>4K-&gt;32K(稠密), 32K-&gt;262K(Turbo)</td>
<td>4K-&gt;32K(全系列), 128K 推理</td>
</tr>
<tr>
<td>推理能力</td>
<td>基础 CoT</td>
<td>基础推理</td>
<td>思考/非思考双模式 + 思考预算</td>
</tr>
</tbody></table>
<p><strong>代际跃迁点</strong>:</p>
<ol>
<li><p><strong>从「单一能力模型」到「模式自适应模型」</strong>: Qwen2/2.5 的训练目标是产出「一个能力尽可能全面的模型」, 而 Qwen3 的训练目标是产出「一个能根据用户需求动态调整能力表达方式的模型」。这不是简单的功能叠加, 而是对模型「元能力」(meta-capability)的培养——让模型学会何时思考、思考多少、如何在不完整思考下给出合理答案。</p>
</li>
<li><p><strong>从「模型为中心」到「用户控制为中心」</strong>: Qwen2.5 的 GRPO 在线 RL 旨在让模型自动学会最优推理深度, 但用户无法干预。Qwen3 的思考预算将控制权交还给用户, 这是从「模型决定一切」到「用户与模型协同决策」的范式转变。</p>
</li>
<li><p><strong>从「逐模型训练」到「蒸馏工厂」</strong>: Qwen2/2.5 的每个尺寸模型都需要独立的后训练流程。Qwen3 的强到弱蒸馏将旗舰模型的能力高效传递给 6 个轻量级模型, 使小尺寸模型的训练成本降低 10 倍, 同时性能超越独立 RL 训练。这标志着开源模型生态从「手工打造每个模型」向「规模化模型生产」的工业化转变。</p>
</li>
</ol>
<hr>
<h2 id="q-jl-conclusion">七、结论 (Conclusion)</h2>
<p>在本技术报告中, 我们介绍了 Qwen3——Qwen 系列的最新版本。Qwen3 同时具备思考模式和非思考模式, 允许用户动态管理用于复杂思考任务的 token 数量。模型在包含 36 万亿 token 的庞大数据集上进行预训练, 使其能够理解和生成 119 种语言和方言的文本。通过一系列全面评估, Qwen3 在基座模型和指令微调模型的标准基准上均展现出强劲性能, 涵盖代码生成、数学、推理和 Agent 相关任务。</p>
<p>在不久的将来, 我们的研究将聚焦以下几个关键领域。我们将继续通过使用质量更高、内容更多样化的数据来扩展预训练规模。同时, 我们将致力于改进模型架构和训练方法, 以实现有效的模型压缩、超长上下文扩展等目标。此外, 我们计划增加强化学习的计算资源, 特别关注基于 Agent 的 RL 系统——这些系统从环境反馈中学习。这将使我们能够构建能够应对需要推理时扩展的复杂任务的 Agent。</p>
<hr>
<blockquote>
<p><strong>附注</strong>: 本精译严格遵循原文逐句翻译, 保留所有技术术语的英文原名(首次出现时附中文释义), 所有数据表格均忠实还原原文数值。如需查阅原始论文的完整图表与附录细节, 请参阅 arXiv:2505.09388。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-yy-introduction","text":"一、引言 (Introduction)"},{"level":2,"id":"e-mxjg-architecture","text":"二、模型架构 (Architecture)"},{"level":3,"id":"2-1-cmmxjg","text":"2.1 稠密模型架构"},{"level":3,"id":"2-2-moe-mxjg","text":"2.2 MoE 模型架构"},{"level":3,"id":"2-3-fcq","text":"2.3 分词器"},{"level":2,"id":"s-yxl-pre-training","text":"三、预训练 (Pre-training)"},{"level":3,"id":"3-1-yxlsj","text":"3.1 预训练数据"},{"level":3,"id":"3-2-yxljd","text":"3.2 预训练阶段"},{"level":3,"id":"3-3-jzmxpg","text":"3.3 基座模型评估"},{"level":2,"id":"s-hxl-post-training","text":"四、后训练 (Post-training)"},{"level":3,"id":"4-1-clssklqd-long-cot-cold-start","text":"4.1 长链式思考冷启动 (Long-CoT Cold Start)"},{"level":3,"id":"4-2-tlqhxx-reasoning-rl","text":"4.2 推理强化学习 (Reasoning RL)"},{"level":3,"id":"4-3-skmsrh-thinking-mode-fusion","text":"4.3 思考模式融合 (Thinking Mode Fusion)"},{"level":4,"id":"4-3-1-sft-sjgj","text":"4.3.1 SFT 数据构建"},{"level":4,"id":"4-3-2-dhmbsj","text":"4.3.2 对话模板设计"},{"level":4,"id":"4-3-3-skys-thinking-budget","text":"4.3.3 思考预算(Thinking Budget)"},{"level":3,"id":"4-4-tyqhxx-general-rl","text":"4.4 通用强化学习 (General RL)"},{"level":3,"id":"4-5-qdrzl-strong-to-weak-distillation","text":"4.5 强到弱蒸馏 (Strong-to-Weak Distillation)"},{"level":2,"id":"w-sypg-experiments","text":"五、实验评估 (Experiments)"},{"level":3,"id":"5-1-zlwtmxpg","text":"5.1 指令微调模型评估"},{"level":4,"id":"5-1-1-qjmx-qwen3-235b-a22b","text":"5.1.1 旗舰模型 Qwen3-235B-A22B"},{"level":4,"id":"5-1-2-qjcmmx-qwen3-32b","text":"5.1.2 旗舰稠密模型 Qwen3-32B"},{"level":4,"id":"5-1-3-qljmx","text":"5.1.3 轻量级模型"},{"level":3,"id":"5-2-csxwnl","text":"5.2 长上下文能力"},{"level":3,"id":"5-3-skysdyxx","text":"5.3 思考预算的有效性"},{"level":2,"id":"l-jsskjd-thinking-nodes","text":"六、技术思考节点 (Thinking Nodes)"},{"level":3,"id":"6-1-sjdjcm","text":"6.1 设计动机层面"},{"level":3,"id":"6-2-jgxjcm","text":"6.2 架构细节层面"},{"level":3,"id":"6-3-sjysycm","text":"6.3 数据与实验层面"},{"level":3,"id":"6-4-jxyfxcm","text":"6.4 局限与风险层面"},{"level":3,"id":"6-5-jscccm","text":"6.5 技术传承层面"},{"level":2,"id":"q-jl-conclusion","text":"七、结论 (Conclusion)"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/09-qwen3/01-qwen3-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/09-qwen3/01-qwen3-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3 技术报告精译</h1>
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
