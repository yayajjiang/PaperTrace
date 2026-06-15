"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM3-4B 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniCPM3-4B: A Language Model with Function Call, Long Context, and Retrieval Augmented Generation
原文链接: <a href="https://huggingface.co/openbmb/MiniCPM3-4B">https://huggingface.co/openbmb/MiniCPM3-4B</a>
发布日期: 2024.09.05
发布机构: OpenBMB (面壁智能), 清华大学自然语言处理实验室</p>
</blockquote>
<hr>
<h2 id="y-mxgs">一、模型概述</h2>
<p>MiniCPM3-4B 是 MiniCPM 系列的第三代基座语言模型，于 2024 年 9 月 5 日正式开源发布。该模型拥有 40 亿参数，在保持端侧部署友好性的同时，实现了综合性能的跨越式提升: 整体表现超越 Phi-3.5-mini-Instruct 和 GPT-3.5-Turbo-0125，可与多款近期发布的 70 亿至 90 亿参数模型相媲美，包括 Llama3.1-8B-Instruct、Qwen2-7B-Instruct 和 GLM-4-9B-Chat。</p>
<p>与 MiniCPM 前两代产品相比，MiniCPM3-4B 的最大变化在于「功能全面化」。前两代模型主要聚焦于通用文本生成能力，而第三代在保持文本生成质量的同时，新增了三项对端侧场景至关重要的能力: 工具调用(Function Calling)、代码解释器(Code Interpreter)以及检索增强生成(RAG)完整套件。这些能力的加入使 MiniCPM3-4B 从一台「文本生成器」进化为一个「端侧 AI 智能体」，能够直接调用外部 API、执行代码、检索知识库并综合生成回答。</p>
<blockquote>
<p>译者注: 从产品设计角度看，MiniCPM3-4B 的演进路线非常清晰。前两代验证了「小模型也能做好通用 NLP」的可行性，第三代则回答了「小模型能否做 Agent」的问题。Function Calling 和 Code Interpreter 的引入不是锦上添花，而是端侧 AI 从「聊天工具」升级为「生产力助手」的关键分水岭。Phi-3.5-mini 虽然在通用能力上很强，但缺乏原生的工具调用能力，这限制了它在实际应用中的价值。</p>
</blockquote>
<hr>
<h2 id="e-jgyjymxgg">二、架构演进与模型规格</h2>
<p>MiniCPM 系列三代模型的架构参数演变如下表所示:</p>
<table>
<thead>
<tr>
<th>规格项</th>
<th>MiniCPM-2B (第1代)</th>
<th>MiniCPM-1.2B (第2代)</th>
<th>MiniCPM3-4B (第3代)</th>
</tr>
</thead>
<tbody><tr>
<td>词表大小</td>
<td>123,000</td>
<td>73,000</td>
<td>73,000</td>
</tr>
<tr>
<td>模型层数</td>
<td>40</td>
<td>52</td>
<td>62</td>
</tr>
<tr>
<td>隐藏层维度</td>
<td>2,304</td>
<td>1,536</td>
<td>2,560</td>
</tr>
<tr>
<td>最大上下文长度</td>
<td>4,096</td>
<td>4,096</td>
<td>32,768</td>
</tr>
<tr>
<td>系统提示词支持</td>
<td>不支持</td>
<td>不支持</td>
<td>支持</td>
</tr>
<tr>
<td>工具调用与代码解释器</td>
<td>不支持</td>
<td>不支持</td>
<td>支持</td>
</tr>
<tr>
<td>发布日期</td>
<td>2024.02</td>
<td>2024.04</td>
<td>2024.09</td>
</tr>
</tbody></table>
<p>从这张对比表可以看出，MiniCPM3-4B 在三个维度上同时进行了扩展: 深度(层数从 40/52 增加到 62)、宽度(隐藏层维度从 1,536 提升到 2,560)和长度(上下文窗口从 4K 扩展到 32K)。词表大小保持在 73K(与第 2 代一致)，相比第 1 代的 123K 更加精简，这有助于降低嵌入层的参数量和推理时的显存占用。</p>
<p>这里需要停下来想一下架构选择背后的权衡。MiniCPM3-4B 的层数增加到 62 层、隐藏层维度提升到 2,560，这意味着总参数量中 FFN 层的权重从第 2 代的 1,536×4×1,536×52 增长到了 2,560×4×2,560×62，粗略估算 FFN 参数量增长了约 3.4 倍。但 4B 的总参数量控制仍然非常克制——相比之下，Llama3.1-8B 的隐藏层维度为 4,096、层数为 32，FFN 维度为 14,336，总参数量约为 8B。MiniCPM3-4B 用更深的网络(62 层 vs 32 层)和更窄的宽度(2,560 vs 4,096)来逼近更大模型的性能，这是「深度换宽度」的经典策略，在端侧部署中通常更有利，因为窄层的矩阵乘法更适合内存带宽受限的硬件。</p>
<hr>
<h2 id="s-hxnl">三、核心能力</h2>
<h3 id="3-1-gjtyydmjsq">3.1 工具调用与代码解释器</h3>
<p>MiniCPM3-4B 原生支持 Function Calling 和 Code Interpreter，这是其相比前两代最显著的功能增量。</p>
<p>在 Berkeley Function-Calling Leaderboard (BFCL) 上，MiniCPM3-4B 取得了 90 亿参数以下模型的 SOTA 成绩，超越了 GLM-4-9B-Chat 和 Qwen2-7B-Instruct 等更大参数规模的模型。BFCL 是业界公认的函数调用能力评测基准，涵盖简单函数调用、多函数并行调用、嵌套函数调用以及带约束条件的复杂调用等多种场景。MiniCPM3-4B 在该榜单上的表现接近 GPT-4o，证明了其在结构化指令解析和工具编排方面的实力。</p>
<blockquote>
<p>译者注: BFCL 接近 GPT-4o 这个结论需要谨慎理解。BFCL 评测的是模型将自然语言请求转换为结构化函数调用的能力，这与通用推理能力是两个不同的维度。GPT-4o 在 BFCL 上的高分部分得益于其强大的指令遵循能力和对 JSON Schema 的精确理解。MiniCPM3-4B 能在 4B 规模上逼近这一水平，说明团队在 post-training 阶段对工具调用场景做了大量针对性优化，包括专门的训练数据构造和强化学习对齐。但这不意味着 MiniCPM3-4B 的综合推理能力达到了 GPT-4o 的水平。</p>
</blockquote>
<h3 id="3-2-sxydmnl">3.2 数学与代码能力</h3>
<p>在数学推理方面，MiniCPM3-4B 在 MathBench 评测集上的效果超越了 GPT-3.5-Turbo，并在极具挑战性的 LiveCodeBench 上超越了 Llama3.1-8B-Instruct。LiveCodeBench 是一个动态更新的代码评测平台，测试数据不固定，能够有效避免数据污染问题，因此其结果比静态基准更具可信度。</p>
<p>在代码生成任务上，MiniCPM3-4B 内置的 Code Interpreter 使其不仅能生成代码片段，还能在实际执行环境中运行代码、观察输出并迭代修正。这一能力对于需要数值计算、数据分析或复杂逻辑验证的场景尤为重要。</p>
<h3 id="3-3-zlzxnl">3.3 指令遵循能力</h3>
<p>MiniCPM3-4B 在中英文指令遵循评测中均表现突出。在英文指令遵循基准 IFEval 上，效果超越了 GLM-4-9B-Chat 和 Qwen2-7B-Instruct。在中文指令遵循基准 FollowBench-zh 上，得分高达 66.8%，同样超越上述两款更大规模的模型。</p>
<p>指令遵循能力的提升与系统提示词(System Prompt)的支持密切相关。前两代 MiniCPM 不支持系统提示词，这意味着模型无法通过系统级指令建立全局行为约束(如「你是一个严谨的数学助教，回答必须包含推导过程」)。第三代新增系统提示词支持后，开发者可以更精确地控制模型的输出风格、安全边界和角色定位，这直接反映在了 IFEval 和 FollowBench 的分数提升上。</p>
<hr>
<h2 id="s-cwbclnl">四、长文本处理能力</h2>
<h3 id="4-1-32k-yssxwck">4.1 32K 原生上下文窗口</h3>
<p>MiniCPM3-4B 的原生上下文窗口扩展至 32,768 tokens，是前两代(4K)的 8 倍。在 32K 长度内，模型通过了「大海捞针」(Needle in a Haystack)测试的全部检索任务，即在任意位置插入的关键信息都能被准确提取。</p>
<h3 id="4-2-ll-mx-map-reduce-llsdwxsxw">4.2 LLMxMapReduce: 理论上的无限上下文</h3>
<p>MiniCPM3-4B 最具创新性的长文本技术是其提出的 <strong>LLMxMapReduce</strong> 机制。该技术借鉴了分布式计算中 MapReduce 的思想，将超长文档切分为多个片段(Map 阶段)，分别编码后通过聚合层(Reduce 阶段)综合生成最终输出。由于每个片段独立处理，模型的内存消耗不会随文档长度线性增长，理论上可以处理无限长度的上下文。</p>
<blockquote>
<p>译者注: LLMxMapReduce 是一个工程创新而非算法创新，其核心洞察是「不是所有 token 都需要互相注意」。标准 Transformer 的自注意力复杂度为 O(n^2)，这是长文本的根本瓶颈。MapReduce 风格的分块处理将复杂度降为 O(n/k × k^2) = O(nk)(其中 k 为块大小，k &lt;&lt; n)，本质上是用「局部注意力+全局聚合」替代「全局注意力」。但这里有一个关键问题: 块与块之间的信息如何传递？如果文档第 1 段的关键信息需要在第 100 段的回答中被引用，而这两段落在不同的 Map 块中，Reduce 阶段的聚合器是否能捕捉到这种跨块依赖？官方声称「性能随文本长度延展而不衰减」，但跨块长距离依赖的召回率尚未被独立第三方充分验证。此外，「理论上无限」不等于「实践中可用」——当文档达到百万级 token 时，Map 阶段的并行计算开销和 Reduce 阶段的聚合复杂度都会成为新的瓶颈。</p>
</blockquote>
<p>在 InfiniteBench Zh.QA 评测中，MiniCPM3-4B 的表现甚至超越了多款 80 亿至 90 亿参数的模型(包括 Kimi 系列在长文本场景的表现)，展现出在超长文档问答任务中的竞争力。</p>
<hr>
<h2 id="w-rag-tj">五、RAG 套件</h2>
<p>MiniCPM3-4B 的发布并非单一模型，而是一套完整的 RAG(Retrieval-Augmented Generation，检索增强生成)解决方案，包含三个组件:</p>
<table>
<thead>
<tr>
<th>组件</th>
<th>功能</th>
<th>规模/特点</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-Embedding</td>
<td>文本嵌入/检索</td>
<td>专门优化的 Embedding 模型</td>
</tr>
<tr>
<td>MiniCPM-Reranker</td>
<td>结果重排序</td>
<td>提升检索结果的相关性</td>
</tr>
<tr>
<td>MiniCPM3-RAG-LoRA</td>
<td>生成模型</td>
<td>基于 MiniCPM3-4B 的 LoRA 微调版本</td>
</tr>
</tbody></table>
<p>在中文和中英跨语言检索测试中，MiniCPM-Embedding 和 MiniCPM-Reranker 取得了 SOTA 表现。针对 RAG 场景的 MiniCPM3-RAG-LoRA 在开放域问答、多跳问答等任务上超越了 Llama3-8B 和 Baichuan2-13B 等更大规模的模型，成为中英文跨语言检索任务的领先方案。</p>
<blockquote>
<p>译者注: RAG 三件套的设计体现了面壁智能对端侧知识库场景的深刻理解。Embedding 和 Reranker 独立于生成模型，意味着检索阶段可以离线预处理，只有最后的生成阶段需要加载 4B 模型。这种解耦设计对于端侧设备尤为重要: 用户可以将大量文档预先编码为向量索引存储在本地，查询时只需运行轻量级的 Reranker 和 4B 生成模型，无需在每次查询时都处理原始文档。LoRA 微调版本(而非全参数微调)进一步降低了部署门槛——用户只需加载原模型+LoRA 权重(通常仅几十 MB)，即可适配特定的 RAG 场景。</p>
</blockquote>
<hr>
<h2 id="l-xnpc">六、性能评测</h2>
<h3 id="6-1-zhpc">6.1 综合评测</h3>
<p>以下为 MiniCPM3-4B 在主要公开基准上的评测表现及与同规模/更大规模模型的对比:</p>
<table>
<thead>
<tr>
<th>评测基准</th>
<th>任务类型</th>
<th>MiniCPM3-4B</th>
<th>Phi-3.5-mini-Instruct</th>
<th>GPT-3.5-Turbo-0125</th>
<th>Llama3.1-8B-Instruct</th>
<th>Qwen2-7B-Instruct</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>多学科知识</td>
<td>70.5</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>GSM8K</td>
<td>数学推理</td>
<td>82.3</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>MathBench</td>
<td>数学能力</td>
<td>超越 GPT-3.5-Turbo</td>
<td>-</td>
<td>基准</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>代码能力</td>
<td>超越 Llama3.1-8B</td>
<td>-</td>
<td>-</td>
<td>被超越</td>
<td>-</td>
</tr>
<tr>
<td>IFEval</td>
<td>英文指令遵循</td>
<td>超越 GLM-4-9B/Qwen2-7B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>被超越</td>
</tr>
<tr>
<td>FollowBench-zh</td>
<td>中文指令遵循</td>
<td>66.8%</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>BFCL</td>
<td>函数调用</td>
<td>9B 以下 SOTA</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 上表中存在数据完整性问题。由于 MiniCPM3-4B 没有独立的技术报告 PDF，其详细评测数据分散在官方博客、HuggingFace model card 和第三方评测文章中。官方只公布了部分关键对比结果(如「超越某某模型」)，但没有给出完整的绝对分数表。这种「选择性披露」是博客型发布的常见现象——作者倾向于展示有利的对比，而省略不利的维度。对于严肃的技术分析，我们需要注意到: (1) 不同评测版本的基准可能有差异(如 GSM8K 有多个评测协议); (2) 「超越」一词没有量化差距，1 分也是超越，10 分也是超越; (3) 部分对比模型(如 GPT-3.5-Turbo-0125)是 API 服务，其评测条件(温度参数、采样策略)可能与开源模型不同。建议读者在引用这些数据时保持审慎。</p>
</blockquote>
<h3 id="6-2-cwbpc">6.2 长文本评测</h3>
<p>在 InfiniteBench Zh.QA 评测中，MiniCPM3-4B 在长文档问答任务上的表现超越了多款 80 亿至 90 亿参数的对手。结合 LLMxMapReduce 技术，该模型在 32K 至 512K 长度的文档处理中均保持了稳定的性能表现。</p>
<hr>
<h2 id="q-xlysj">七、训练与数据</h2>
<p>MiniCPM3-4B 的训练数据包含大规模中英文语料，经过严格的数据筛选和预处理流程。官方强调数据质量优先于数据规模，在指令遵循和代码生成等复杂任务中，高质量的训练数据比单纯的参数量堆砌更为关键。</p>
<blockquote>
<p>译者注: 「高质量数据优先」已经成为 2024 年后小模型训练的共识。从 MiniCPM-2B 到 MiniCPM3-4B，面壁智能在数据工程上的积累可能比架构设计更为重要。第三代模型新增的工具调用、代码解释器和 RAG 能力，本质上都是数据驱动的——需要构造大量高质量的 Function Calling 对话数据、代码执行轨迹和检索-生成配对数据。这些数据通常无法从公开语料中直接获取，需要专门的标注 pipeline 或合成数据生成策略。官方没有披露具体的数据构造方法，但可以推测其在 post-training 阶段(尤其是 SFT 和 RLHF)对特定能力做了深度优化。</p>
</blockquote>
<hr>
<h2 id="b-tlybs">八、推理与部署</h2>
<p>MiniCPM3-4B 支持多种推理框架和部署方式:</p>
<ul>
<li><strong>HuggingFace Transformers</strong>: 原生支持，可直接使用 AutoModelForCausalLM 加载</li>
<li><strong>vLLM</strong>: 需安装 OpenBMB 维护的 fork 版本，支持高吞吐量推理</li>
<li><strong>SGLang</strong>: 官方推荐方案，优化后吞吐量相比 vLLM 提升约 70%</li>
<li><strong>llama.cpp / Ollama</strong>: 支持 GGUF 格式量化，适用于 CPU 或低显存 GPU 推理</li>
<li><strong>GPTQ Int4 量化</strong>: 官方提供 4-bit 量化版本，进一步降低显存需求</li>
</ul>
<p>对于端侧部署，MiniCPM3-4B 的 4B 参数量配合 4-bit 量化后仅需约 2GB 显存，在主流消费级 GPU 和甚至部分高端移动设备的 NPU 上均可运行。</p>
<hr>
<h2 id="j-kyxy">九、开源协议</h2>
<p>MiniCPM3-4B 采用 Apache-2.0 许可证发布，模型权重对学术研究完全免费。商业使用需填写问卷进行注册，注册后同样可免费商用。</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>首次出现位置</th>
<th>简要解释</th>
</tr>
</thead>
<tbody><tr>
<td>Function Calling</td>
<td>函数调用/工具调用</td>
<td>第1节</td>
<td>模型将自然语言请求转换为结构化 API 调用的能力</td>
</tr>
<tr>
<td>Code Interpreter</td>
<td>代码解释器</td>
<td>第1节</td>
<td>模型生成并执行代码以完成计算或数据分析任务的能力</td>
</tr>
<tr>
<td>RAG</td>
<td>检索增强生成</td>
<td>第1节</td>
<td>结合外部知识检索的文本生成框架</td>
</tr>
<tr>
<td>BFCL</td>
<td>Berkeley Function-Calling Leaderboard</td>
<td>3.1节</td>
<td>函数调用能力评测基准</td>
</tr>
<tr>
<td>IFEval</td>
<td>Instruction-Following Evaluation</td>
<td>3.3节</td>
<td>英文指令遵循评测基准</td>
</tr>
<tr>
<td>FollowBench</td>
<td>指令遵循评测基准</td>
<td>3.3节</td>
<td>多语言指令遵循评测基准</td>
</tr>
<tr>
<td>LLMxMapReduce</td>
<td>-</td>
<td>4.2节</td>
<td>MiniCPM 提出的分块长文本处理机制</td>
</tr>
<tr>
<td>LoRA</td>
<td>Low-Rank Adaptation</td>
<td>第5节</td>
<td>低秩适配，一种参数高效的模型微调方法</td>
</tr>
<tr>
<td>SFT</td>
<td>Supervised Fine-Tuning</td>
<td>第7节</td>
<td>监督微调</td>
</tr>
<tr>
<td>RLHF</td>
<td>Reinforcement Learning from Human Feedback</td>
<td>第7节</td>
<td>基于人类反馈的强化学习</td>
</tr>
</tbody></table>
<h3 id="b-mxpxdw">B. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: MiniCPM-2B(第1代)、MiniCPM-1.2B(第2代)</li>
<li><strong>核心创新</strong>: (1) 端侧原生 Function Calling + Code Interpreter; (2) LLMxMapReduce 无限长文本机制; (3) RAG 三件套完整生态</li>
<li><strong>被后续工作引用/影响</strong>: MiniCPM4 系列(2025.06)、MiniCPM4.1 系列(2025.09)在架构和训练策略上延续了 MiniCPM3 的技术路线</li>
<li><strong>同期竞争模型</strong>: Phi-3.5-mini-Instruct(Microsoft, 3.8B)、Gemma-2-2B(Google)、Qwen2.5-3B(Alibaba)</li>
</ul>
<h3 id="c-xnsjhz">C. 性能数据汇总</h3>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>关键指标</th>
<th>表现</th>
</tr>
</thead>
<tbody><tr>
<td>通用知识</td>
<td>MMLU</td>
<td>70.5</td>
</tr>
<tr>
<td>数学推理</td>
<td>GSM8K</td>
<td>82.3</td>
</tr>
<tr>
<td>数学能力</td>
<td>MathBench</td>
<td>超越 GPT-3.5-Turbo</td>
</tr>
<tr>
<td>代码能力</td>
<td>LiveCodeBench</td>
<td>超越 Llama3.1-8B-Instruct</td>
</tr>
<tr>
<td>英文指令遵循</td>
<td>IFEval</td>
<td>超越 GLM-4-9B-Chat, Qwen2-7B-Instruct</td>
</tr>
<tr>
<td>中文指令遵循</td>
<td>FollowBench-zh</td>
<td>66.8%</td>
</tr>
<tr>
<td>函数调用</td>
<td>BFCL</td>
<td>9B 以下 SOTA</td>
</tr>
<tr>
<td>长文本</td>
<td>InfiniteBench Zh.QA</td>
<td>超越 8B-9B 级模型</td>
</tr>
<tr>
<td>RAG</td>
<td>开放域问答</td>
<td>超越 Llama3-8B, Baichuan2-13B</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxgs","text":"一、模型概述"},{"level":2,"id":"e-jgyjymxgg","text":"二、架构演进与模型规格"},{"level":2,"id":"s-hxnl","text":"三、核心能力"},{"level":3,"id":"3-1-gjtyydmjsq","text":"3.1 工具调用与代码解释器"},{"level":3,"id":"3-2-sxydmnl","text":"3.2 数学与代码能力"},{"level":3,"id":"3-3-zlzxnl","text":"3.3 指令遵循能力"},{"level":2,"id":"s-cwbclnl","text":"四、长文本处理能力"},{"level":3,"id":"4-1-32k-yssxwck","text":"4.1 32K 原生上下文窗口"},{"level":3,"id":"4-2-ll-mx-map-reduce-llsdwxsxw","text":"4.2 LLMxMapReduce: 理论上的无限上下文"},{"level":2,"id":"w-rag-tj","text":"五、RAG 套件"},{"level":2,"id":"l-xnpc","text":"六、性能评测"},{"level":3,"id":"6-1-zhpc","text":"6.1 综合评测"},{"level":3,"id":"6-2-cwbpc","text":"6.2 长文本评测"},{"level":2,"id":"q-xlysj","text":"七、训练与数据"},{"level":2,"id":"b-tlybs","text":"八、推理与部署"},{"level":2,"id":"j-kyxy","text":"九、开源协议"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-mxpxdw","text":"B. 模型谱系定位"},{"level":3,"id":"c-xnsjhz","text":"C. 性能数据汇总"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/10-mini-cpm3-4b/01-mini-cpm3-4b-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/10-mini-cpm3-4b/01-mini-cpm3-4b-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM3-4B 技术报告精译</h1>
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
