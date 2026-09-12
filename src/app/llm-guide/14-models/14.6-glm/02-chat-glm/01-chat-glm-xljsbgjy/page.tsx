"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ChatGLM: 从 GLM-130B 到 GLM-4 All Tools 的大语言模型家族</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools
作者: Team GLM (Zhipu AI &amp; Tsinghua University)
原文链接: arXiv:2406.12793v2 [cs.CL]
发布日期: 2024 年 7 月 30 日
精译日期: 2026 年 5 月 18 日</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>本文介绍 ChatGLM,一个我们持续开发并不断演进的大语言模型家族。本报告主要聚焦于 GLM-4 语言系列,包括 GLM-4、GLM-4-Air 和 GLM-4-9B。它们代表了我们最具能力的模型,凝聚了前三代 ChatGLM 积累的所有洞察和经验教训。迄今为止,GLM-4 模型已在约十万亿 token 上进行预训练,语料主要为中文和英文,同时包含少量来自 24 种其他语言的语料,并主要针对中文和英文使用场景进行对齐。高质量的对齐通过多阶段后训练过程实现,包括监督微调(SFT)和基于人类反馈的强化学习(RLHF)。</p>
<p>评估显示,GLM-4:</p>
<ol>
<li>在 MMLU、GSM8K、MATH、BBH、GPQA 和 HumanEval 等通用指标上与 GPT-4 接近或超越;</li>
<li>在 IFEval 评测的指令遵循能力上接近 GPT-4-Turbo;</li>
<li>在长上下文任务上匹配 GPT-4 Turbo(128K)和 Claude 3;</li>
<li>在 AlignBench 评测的中文对齐方面超越 GPT-4。</li>
</ol>
<p>GLM-4 All Tools 模型进一步通过对齐训练,能够理解用户意图并自主决定何时以及使用哪些工具——包括网页浏览器、Python 解释器、文生图模型和用户自定义函数——以有效完成复杂任务。在实际应用中,它在通过网页浏览获取在线信息和利用 Python 解释器解决数学问题等任务上匹配甚至超越 GPT-4 All Tools。</p>
<p>在此过程中,我们开源了一系列模型,包括 ChatGLM-6B(三代)、GLM-4-9B(128K、1M)、GLM-4V-9B、WebGLM 和 CodeGeeX,仅在 2023 年就在 Hugging Face 上获得了超过 1000 万次下载。开源模型可通过 <a href="https://github.com/THUDM">https://github.com/THUDM</a> 和 <a href="https://huggingface.co/THUDM">https://huggingface.co/THUDM</a> 获取。</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>大语言模型(LLM)的快速发展令人瞩目 [57]。以 OpenAI 的 GPT 模型系列为例:2020 年发布的原始 GPT-3 模型 [3] 将规模从 GPT-1 的 1.17 亿参数和 GPT-2 的 15 亿参数大幅扩展到 1750 亿参数。这种规模扩展使基于 decoder-only Transformer 的 GPT-3 模型具备了上下文内学习和泛化能力。据 OpenAI 称,GPT-3.5 系列通过引入指令微调、监督微调(SFT)和/或基于人类反馈的强化学习(RLHF) [29] 对 GPT-3 进行了改进。这现已成为创建高性能 LLM 的标准流程,包括 PaLM 模型 [6]、LLaMA 模型 [41]、Gemini 模型 [40] 等。</p>
<p>在并行于主流 LLM 开发实践的路线中,我们提出了通用语言模型(GLM, General Language Model)架构 [11],其特征为自回归空白填充目标,并于 2021 年开源了 GLM-10B 模型(参见图 1 中的 GLM 时间线)。从 2021 年底开始,我们开始预训练 GLM-130B [53]。目标是训练一个百亿级规模的模型以匹配或超越 GPT-3(davinci),同时验证在此规模上成功训练模型的技术,与其他同期工作如 OPT-175B [54] 和 BLOOM-176B [33] 一道。我们在 2022 年 7 月完成了 GLM-130B 的 400B token 训练和评估,随后在 8 月发布了模型和预训练细节 [53]。根据 2022 年 11 月的 HELM 评测,GLM-130B 在各个维度上匹配 GPT-3(davinci) [20]。</p>
<p>此后,我们对 GLM-130B 进行指令微调。后来,ChatGPT 进一步促使我们使用 SFT 和 RLHF 对基座模型进行对齐。我们从头开始创建和精心制作 prompt-response 对并执行 SFT,同时开始研究如何有效应用 RLHF。2023 年 3 月 14 日,对齐后的模型 ChatGLM-130B 在 <a href="https://chatglm.cn">https://chatglm.cn</a> 上线。此外,一个更小的版本 ChatGLM-6B [13] 于同一天开源,获得了远超预期的关注。它被设计为 62 亿参数,目的是:</p>
<ol>
<li>便于快速迭代预训练和后训练技术以及数据选择;</li>
<li>通过 INT4 量化实现消费级显卡上的本地部署。</li>
</ol>
<p>从那时起,我们快速探索和优化预训练和对齐技术,每隔三个月推出第二代和第三代 ChatGLM 系列,两者都是从头开始预训练的。</p>
<p>ChatGLM-6B 在约 1 万亿 token 的中英文语料上预训练,上下文长度为 2048(2K),主要通过 SFT 补充。2023 年 6 月发布的 ChatGLM2-6B 在更多高质量数据上预训练和对齐,相比前代有显著提升,包括 MMLU 提升 23%、GSM8K 提升 571%、BBH 提升 60%。通过采用 FlashAttention 技术 [8],其上下文长度扩展到 32K。此外,Multi-Query Attention [35] 的集成使推理速度提升 42%。在此基础上,我们的第二代代码模型 CodeGeeX2-6B 通过在额外 6000 亿代码 token 上预训练而开发。它在 HumanEval-X 评测中相比初代 CodeGeeX-13B [58] 的 Pass@1 提升幅度为:Python 57%、C++ 71%、Java 54%、JavaScript 83%、Go 56%。在适配基于角色的对话时,CharacterGLM [61] 允许在 LLM 上进行有效且安全的角色定制。通过进一步适配更多样化的训练数据集、更充分的训练步骤和更优化的训练策略,ChatGLM3-6B 在语义、数学、推理、代码和知识等 42 个基准上登顶。从这一代开始,ChatGLM 还支持函数调用和代码解释器,以及复杂的 agent 任务 [22; 52; 18]。</p>
<p>在这些开发过程中,我们还开发了 1.5B、3B、12B、32B、66B 和 130B 参数的模型,使我们能够验证观察结果并建立我们自己的 scaling laws。</p>
<p>凭借所有积累的经验教训,我们启动了 GLM-4 的训练。第一个 cutoff checkpoint 随后经历多阶段后训练过程(如 SFT、RLHF、安全对齐),目前主要聚焦于中英文语言。随后,它被开发为两个不同版本:GLM-4 和 GLM-4 All Tools,两者都支持 128K 上下文长度。自 2024 年 1 月 16 日起,GLM-4(0116)通过 GLM-4 API 在 <a href="https://bigmodel.cn">https://bigmodel.cn</a> 上线,GLM-4 All Tools 可通过网站 <a href="https://chatglm.cn">https://chatglm.cn</a> 和支持创建个人 agent——GLMs——的移动应用访问。最新的模型是 GLM-4(0520)和 GLM-4-Air(0605),在预训练和对齐上都有升级。GLM-4-Air 以更低的延迟和推理成本实现了与 GLM-4(0116)相当的性能。</p>
<blockquote>
<p><strong>译者思考：技术谱系</strong></p>
<p>ChatGLM 的技术演进路线非常清晰,可以用四个阶段概括:</p>
<p><strong>阶段 1(2021-2022):GLM 预训练框架探索</strong>。GLM-10B(2021)和 GLM-130B(2022)验证了一个核心假设:自回归空白填充(autoregressive blank infilling)可以作为 GPT 自回归生成的有效替代。GLM-130B 在 HELM 上匹配 GPT-3(davinci),这是中国团队首次在百亿级模型上达到国际顶尖水平。</p>
<p><strong>阶段 2(2023.03-2023.10):ChatGLM 快速迭代</strong>。从 ChatGLM-6B 到 ChatGLM3-6B,仅用了 7 个月时间完成了三代迭代。这个速度在全球开源模型领域都是罕见的。核心驱动力是&quot;小模型快速验证&quot;策略——用 6B 参数模型快速测试预训练数据、对齐技术和架构改进,然后再扩展到大模型。</p>
<p><strong>阶段 3(2023.10 起):GLM-4 集大成</strong>。GLM-4 是前三代所有经验的汇总,其技术报告中的每个设计选择(Multi-Query Attention、RMSNorm、SwiGLU、GQA 等)都可以在前代中找到实验验证的痕迹。</p>
<p><strong>阶段 4(2024 年):All Tools 和 Agent 化</strong>。GLM-4 All Tools 代表了从&quot;对话模型&quot;到&quot;Agent 基座&quot;的转型,这与中国市场对&quot;智能体&quot;的强烈需求密切相关。</p>
<p>值得注意的是,智谱 AI 采取了与 DeepSeek 不同的开源策略:DeepSeek 主要开源最终的大模型(如 DeepSeek-V3 671B),而智谱 AI 开源了完整的模型家族(1.5B 到 130B),这更有利于社区研究和应用开发。</p>
</blockquote>
<hr>
<h2 id="2-chat-glm-js">2 ChatGLM 技术</h2>
<p>本节介绍 ChatGLM 中采用和开发的预训练和后训练技术,包括模型架构、预训练数据、对齐和 All Tools。</p>
<h3 id="2-1-yxlsj">2.1 预训练数据</h3>
<p>我们的预训练语料由多语言(主要是英文和中文)文档组成,来源包括网页、维基百科、书籍、代码和研究论文。数据处理流水线主要包括三个阶段:去重、过滤和 tokenization。</p>
<ul>
<li><strong>去重阶段</strong>:通过去除重复或相似的文档来提高数据多样性,包括精确去重和模糊去重。</li>
<li><strong>过滤阶段</strong>:对于网页,通过去除包含冒犯性语言、占位符文本、源代码等的噪声文档来提高数据质量。</li>
<li><strong>Tokenization 阶段</strong>:将文本转换为 token 序列以进行进一步处理。</li>
</ul>
<p>预训练数据中的 token 数量直接影响模型训练速度。为优化这一方面,我们采用字节级字节对编码(BPE, byte-level byte pair encoding)算法 [34] 分别学习中文和多语言 token,并将其与 tiktoken [27] 中 cl100k_base tokenizer 的 token 合并为一个统一的词表,大小为 150,000。在最终训练集中,我们对不同来源进行重新加权,以提高高质量和教育性来源(如书籍和维基百科)的重要性。最终,预训练语料包含约十万亿 token。</p>
<p>在 ChatGLM 的四代开发过程中,我们的发现与现有研究 [60] 一致:数据质量和多样性对于构建有效的 LLM 至关重要。尽管获得了经验性的经验教训和洞察,但我们至今尚未确定一个能够指导数据收集、清洗和选择过程的根本原则,这可能启发未来的研究方向。</p>
<h3 id="2-2-jg">2.2 架构</h3>
<p>GLM 家族的 LLM 基于 Transformer [43] 构建。在 GLM-130B [53] 中,我们探索了各种选项来稳定其预训练,同时考虑了当时面临的硬件约束。具体来说,GLM-130B 采用 DeepNorm [44] 作为层归一化策略,在 FFN 中使用 RoPE(Rotary Positional Embedding,旋转位置编码) [38] 以及带 GeLU [15] 激活函数的 Gated Linear Unit [36]。</p>
<p>在我们探索过程中,我们研究了不同的策略来提升模型性能和推理效率。最近的 GLM-4 模型采用以下架构设计选择:</p>
<ul>
<li><strong>除 QKV 外无偏置</strong>:为提高训练速度,我们移除了除注意力层中 Query、Key 和 Value(QKV)矩阵偏置外的所有偏置项。这样做时,我们观察到长度外推有轻微改善。</li>
<li><strong>RMSNorm 和 SwiGLU</strong>:我们采用 RMSNorm 和 SwiGLU 分别替代 LayerNorm 和 ReLU。这两种策略带来了更好的模型性能。</li>
<li><strong>RoPE 二维扩展</strong>:我们将 RoPE 扩展为二维形式以适应 GLM 中的 2D 位置编码。</li>
<li><strong>GQA</strong>:我们用 GQA(Group Query Attention,分组查询注意力)替代 MHA(Multi-Head Attention,多头注意力),以减少推理时的 KV 缓存大小。鉴于 GQA 比 MHA 使用更少的参数,我们增加了 FFN 参数数量以保持相同的模型大小,即将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mtext>FFN</mtext></msub></mrow><annotation encoding="application/x-tex">d_{\\text{FFN}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 设置为隐藏层大小的 10/3。</li>
</ul>
<p>我们模型的上下文长度从 2K(ChatGLM)扩展到 32K(ChatGLM2 和 ChatGLM3),再到 128K 和 1M(GLM-4)。这些扩展不仅通过上下文扩展——位置编码扩展 [31; 5] 和长文本持续训练 [47]——实现,还包括长上下文对齐,使 GLM-4 能够有效处理非常长的上下文(详见 [1] 的技术细节)。</p>
<blockquote>
<p><strong>译者思考：架构细节</strong></p>
<p>GLM-4 的架构选择是&quot;集各家之长&quot;的典型:</p>
<p><strong>GQA + FFN 补偿</strong>:GQA 通过共享 KV 头减少 KV 缓存,但会减少参数量。GLM-4 的做法是将 FFN 维度从标准的 4×hidden_size 增加到 10/3×hidden_size ≈ 3.33×hidden_size。这不是标准的 4 倍,但接近。这种补偿设计说明智谱团队在参数预算分配上有细致的考量——注意力省下来的参数转移到 FFN,保持总参数量不变。</p>
<p><strong>RoPE 二维扩展</strong>:这是 GLM 架构的独特之处。GLM 的空白填充目标需要同时编码被填充片段的位置和原始文本的位置,因此需要二维位置编码。这与标准 GPT 的 RoPE(一维)不同,是 GLM 预训练框架在推理阶段的一个技术遗产。</p>
<p><strong>除 QKV 外无偏置</strong>:移除偏置是 LLaMA-2 以来的常见做法,可以减少参数量并改善训练稳定性。但保留 QKV 偏置是为了长度外推——偏置项在注意力计算中提供了一个与位置无关的偏移,有助于模型在比训练时更长的上下文上表现稳定。</p>
<p><strong>SwiGLU 替代 ReLU</strong>:SwiGLU 已成为现代 LLM 的标准激活函数,相比 ReLU 有更好的梯度流和表达能力。DeepSeek-V3、LLaMA-3、Qwen2 等都采用了 SwiGLU。</p>
</blockquote>
<h3 id="2-3-dq">2.3 对齐</h3>
<p>预训练构建 LLM 的基础,而后训练 [29] 进一步细化这些模型以使其与人类偏好对齐,例如理解人类意图、遵循指令和促进多轮对话。对于 GLM-4,对齐主要通过 SFT 和 RLHF [17] 实现。</p>
<p>在 SFT 中,我们发现真实的人类 prompt 和交互(而非基于模板或模型生成的响应)对于对齐质量至关重要。虽然 SFT 在很大程度上使基座模型与人类偏好对齐,但 RLHF 可以进一步帮助缓解响应拒答、安全性、双语 token 混合和多轮连贯性等问题。</p>
<p>对于我们模型的第一代(ChatGLM-6B 和 ChatGLM-130B),prompt-response 对主要由模型开发者标注。对于后续模型,对齐数据是内部标注和从第三方获取的专有数据的组合,受严格的质量控制措施约束。与现有实践 [42] 类似,标注员被指示从多个维度对模型响应进行评分,包括安全性、事实性、相关性、有用性和人类偏好。</p>
<h3 id="2-4-chat-glm-jstx">2.4 ChatGLM 技术体系</h3>
<p>在 ChatGLM 的开发过程中,我们引入并发表了用于增强其性能的技术:</p>
<ul>
<li><strong>LLM 的涌现能力 [12]</strong>:我们检查了预训练损失与下游任务性能之间的关系,发现在相同的预训练损失下,不同模型大小和训练 token 的 LLM 产生相同的下游性能。我们还发现在某些任务(如 MMLU 和 GSM8K)上,只有当预训练损失低于某个阈值时,性能才会超越随机水平。因此,我们将涌现能力重新定义为那些由预训练损失较低的模型所展示的能力 [12]。</li>
<li><strong>LongAlign [1]</strong>:为扩展 LLM 的上下文窗口大小,我们提出了 LongAlign——一个长上下文对齐的综合方案。它使 GLM-4 能够处理长达 128K token 的长上下文文本,性能与 Claude 2 和 GPT-4 Turbo(1106)相当。</li>
<li><strong>ChatGLM-Math [48]</strong>:为提高 LLM 的数学问题解决能力,我们引入了 ChatGLM-Math,利用自我批判而非外部模型或人工标注进行数据选择。</li>
<li><strong>ChatGLM-RLHF [17]</strong>:为使 LLM 与人类反馈对齐,我们引入了 ChatGLM-RLHF——我们将 PPO 和 DPO 应用于 LLM 的实践。</li>
<li><strong>Self-Contrast [24]</strong>:为避免昂贵的人类偏好反馈数据的需求,我们开发了一种无需反馈的对齐策略 Self-Contrast。它利用目标 LLM 自我生成大量负样本用于其 RLHF 对齐。</li>
<li><strong>AgentTuning [52]</strong>:为提高 LLM 的 agent 能力,我们开发了 AgentTuning 框架,包含 AgentInstruct 指令微调数据集,其中包括 agent 与环境之间的高质量交互轨迹。</li>
<li><strong>APAR [21]</strong>:为提高 LLM 对具有层次结构响应的推理速度,我们提出了一种自动并行自回归(APAR, auto-parallel auto-regressive)生成方法。它利用指令微调训练 LLM 规划其(并行)生成过程并执行 APAR 生成。</li>
<li><strong>基准测试</strong>:我们还开发了多个开放 LLM 基准,包括 AgentBench [25](评估 LLM 作为 agent)、LongBench [2](评估 LLM 的长上下文处理能力)、AlignBench [23](衡量 ChatGLM 与中文内容的对齐质量)、HumanEval-X [58](评估 HumanEval [4] 问题在 Python 之外的编程语言中的表现),以及 NaturalCodeBench(NCB)(衡量模型解决实际编程任务的能力)。</li>
</ul>
<h3 id="2-5-glm-4-all-tools">2.5 GLM-4 All Tools</h3>
<p>最新的 ChatGLM 模型是 GLM-4 和 GLM-4 All Tools,两者都使用上述技术进行训练和对齐。GLM-4 All Tools 是一个进一步对齐以支持智能 agent 和相关任务的模型版本。它被训练为自主理解用户意图、规划复杂指令,并调用一个或多个工具(如网页浏览器、Python 解释器和文生图模型)来完成复杂任务。</p>
<p>图 4 展示了 GLM-4 All Tools 系统的整体流程。当用户发出复杂请求时,模型分析任务并一步一步规划问题解决过程。如果它确定无法独立完成任务,将顺序调用一个或多个外部工具,利用它们的中期反馈和结果来帮助解决任务。</p>
<p>基于 GLM-4 的 All Tools 能力,我们还开发了 GLMs 应用平台,允许用户为特定任务创建和定制自己的 agent。GLMs 不仅支持嵌入式 Python 解释器、网页浏览器、文生图模型,还支持用户自定义函数、API 和外部知识库,以更有效地满足用户需求。</p>
<hr>
<h2 id="3-glm-4-nlpg">3 GLM-4 能力评估</h2>
<p>我们从多个角度考察 GLM-4 模型的能力,包括学术基准上的基础能力、代码问题解决、英文 agent 能力、中英文指令遵循、长上下文以及中文对齐。如前所述,GLM-4 主要在中英文上预训练并主要针对中文进行对齐。本节中,我们主要报告最新 GLM-4 版本的结果,即 GLM-4(0520)和 GLM-4-Air(0605),因为 GLM-4(0520)在评估基准上比原始 0116 版本略好。评估期间,GLM-4 和 GLM-4-Air 都以 BFloat16 精度部署。</p>
<p>对于基线,我们展示 GPT-4(0603)、GPT-4 Turbo(1106, 2024-04-09)、Claude 2、Claude 3 Opus 和 Gemini 1.5 Pro 的结果,所有结果均从相应的技术报告中提取或通过其公共 API 测试获得。</p>
<p>总体而言,GLM-4 在标准基准、指令遵循、长上下文、代码问题解决和英文环境中的 agent 能力方面接近最先进的模型(GPT-4-Turbo、Gemini 1.5 Pro 和 Claude 3 Opus)。在中文对齐方面,它在各种领域(如基础语言能力、高级中文理解、专业知识和开放式问答)对 SOTA 模型表现出强劲性能。总之,GLM-4 在中文语言任务方面处于最佳水平。它在中文数学和逻辑推理能力方面也展示了与 GPT-4 和 Claude 3 Opus 相当的性能,尽管落后于 GPT-4 Turbo。</p>
<p><strong>表 1: ChatGLM-6B、ChatGLM2-6B、ChatGLM3-6B 和 GLM-4-9B 的性能对比</strong></p>
<table>
<thead>
<tr>
<th>语言</th>
<th>数据集</th>
<th>ChatGLM-6B (2023-03-14)</th>
<th>ChatGLM2-6B (2023-06-25)</th>
<th>ChatGLM3-6B-Base (2023-10-27)</th>
<th>GLM-4-9B (2024-06-05)</th>
</tr>
</thead>
<tbody><tr>
<td></td>
<td>GSM8K</td>
<td>1.5</td>
<td>25.9</td>
<td>72.3</td>
<td>79.6</td>
</tr>
<tr>
<td></td>
<td>MATH</td>
<td>3.1</td>
<td>6.9</td>
<td>25.7</td>
<td>30.4</td>
</tr>
<tr>
<td>英文</td>
<td>BBH</td>
<td>0.0</td>
<td>29.2</td>
<td>66.1</td>
<td>76.3</td>
</tr>
<tr>
<td></td>
<td>MMLU</td>
<td>25.2</td>
<td>45.2</td>
<td>61.4</td>
<td>72.4</td>
</tr>
<tr>
<td></td>
<td>GPQA</td>
<td>-</td>
<td>-</td>
<td>34.3</td>
<td>38.4</td>
</tr>
<tr>
<td></td>
<td>HumanEval</td>
<td>0.0</td>
<td>9.8</td>
<td>58.5</td>
<td>71.8</td>
</tr>
<tr>
<td></td>
<td>BoolQ</td>
<td>51.8</td>
<td>79.0</td>
<td>87.9</td>
<td>89.6</td>
</tr>
<tr>
<td></td>
<td>CommonSenseQA</td>
<td>20.5</td>
<td>65.4</td>
<td>79.7</td>
<td>82.6</td>
</tr>
<tr>
<td></td>
<td>HellaSwag</td>
<td>30.4</td>
<td>57.0</td>
<td>74.7</td>
<td>80.1</td>
</tr>
<tr>
<td></td>
<td>PIQA</td>
<td>65.7</td>
<td>69.6</td>
<td>86.5</td>
<td>79.1</td>
</tr>
<tr>
<td></td>
<td>DROP</td>
<td>3.9</td>
<td>25.6</td>
<td>26.8</td>
<td>70.9</td>
</tr>
<tr>
<td></td>
<td>C-Eval</td>
<td>23.7</td>
<td>51.7</td>
<td>69.0</td>
<td>77.1</td>
</tr>
<tr>
<td>中文</td>
<td>CMMLU</td>
<td>25.3</td>
<td>50.0</td>
<td>67.5</td>
<td>77.2</td>
</tr>
<tr>
<td></td>
<td>GAOKAO-Bench</td>
<td>26.8</td>
<td>46.4</td>
<td>67.3</td>
<td>75.1</td>
</tr>
<tr>
<td></td>
<td>C3</td>
<td>35.1</td>
<td>58.6</td>
<td>73.9</td>
<td>77.2</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者思考：数据与实验</strong></p>
<p>表 1 的数据非常直观地展示了 ChatGLM 家族的快速进化:</p>
<p><strong>GSM8K 的跨越</strong>:从 ChatGLM-6B 的 1.5% 到 GLM-4-9B 的 79.6%,这是 53 倍的提升。数学能力从几乎为零(1.5% 接近随机)到接近 GPT-4 水平。这说明数学能力的提升主要来自:</p>
<ol>
<li>预训练数据质量的提升(更多高质量数学语料);</li>
<li>后训练对齐的改进(从纯 SFT 到 SFT+RLHF);</li>
<li>模型架构和规模的优化。</li>
</ol>
<p><strong>中文优势</strong>:在 C-Eval(77.1%)、CMMLU(77.2%)和 GAOKAO-Bench(75.1%)上,GLM-4-9B 的表现非常突出。GAOKAO(高考)是一个极具中国特色的基准,测试模型对中国高中知识的掌握。GLM-4 在这些基准上的优势直接反映了其&quot;主要针对中文进行对齐&quot;的设计目标。</p>
<p><strong>BBH 的飞跃</strong>:从 0.0% 到 76.3%,这是最具戏剧性的提升。BBH(Big-Bench Hard)包含 23 个具有挑战性的推理任务。ChatGLM-6B 在 BBH 上的 0.0% 并不意味着完全失败,而是因为早期版本的 ChatGLM 在某些任务格式上存在兼容性问题。这提醒我们:早期开源模型在基准适配方面常常有细节问题,不能简单用分数判断能力。</p>
</blockquote>
<h3 id="3-1-xsjzpg">3.1 学术基准评估</h3>
<p>为评估基座模型的通用性能,我们选择六个常用的基准,涵盖知识、数学、推理、常识和编码:</p>
<ul>
<li><strong>MMLU [14]</strong>:从各种考试(包括数学、历史、计算机科学等)收集的多选题。我们向模型展示所有答案并要求其选择答案的字母。</li>
<li><strong>GSM8K [7]</strong>:8500 道小学数学文字题(测试集 1000 道),要求模型使用数学概念解决现实情境问题。我们对该基准使用思维链提示 [46]。</li>
<li><strong>MATH</strong>:12500 道具有挑战性的竞赛级数学问题(测试集 5000 道)。我们对该基准使用思维链提示 [46]。</li>
<li><strong>BBH [39]</strong>:23 个具有挑战性的 BIG-Bench [37] 任务套件。我们对该基准使用思维链提示 [46]。</li>
<li><strong>GPQA [32]</strong>:生物学、化学和物理领域的研究生级多选题基准。</li>
<li><strong>HumanEval [4]</strong>:一个编码基准,通过自动测试用例检查来衡量合成函数的正确性。</li>
</ul>
<p>我们将 GLM-4 与原始 GPT-4 [28] 进行比较。结果如表 2 所示。我们可以观察到 GLM-4 在 MMLU 上达到 GPT-4 准确率的 96.3%,在其他基准上超越 GPT-4。总体而言,GLM-4 的基础能力接近 GPT-4-Turbo 和 Claude 3 Opus。</p>
<p><strong>表 2: GLM-4 在学术基准上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">MMLU</th>
<th align="center">GSM8K</th>
<th align="center">MATH</th>
<th align="center">BBH</th>
<th align="center">GPQA</th>
<th align="center">HumanEval</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4(0314)</td>
<td align="center">86.4</td>
<td align="center">92.0</td>
<td align="center">52.9</td>
<td align="center">83.1</td>
<td align="center">35.7</td>
<td align="center">67.0</td>
</tr>
<tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">84.7</td>
<td align="center">95.7</td>
<td align="center">64.3</td>
<td align="center">88.3</td>
<td align="center">42.5</td>
<td align="center">83.7</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">86.7</td>
<td align="center">95.6</td>
<td align="center">73.4</td>
<td align="center">88.2</td>
<td align="center">49.3</td>
<td align="center">88.2</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">86.8</td>
<td align="center">95.0</td>
<td align="center">60.1</td>
<td align="center">86.8</td>
<td align="center">50.4</td>
<td align="center">84.9</td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td align="center">85.9</td>
<td align="center">90.8</td>
<td align="center">67.7</td>
<td align="center">89.2</td>
<td align="center">46.2</td>
<td align="center">84.1</td>
</tr>
<tr>
<td>GLM-4-9B-Chat</td>
<td align="center">72.4</td>
<td align="center">79.6</td>
<td align="center">50.6</td>
<td align="center">76.3</td>
<td align="center">28.8</td>
<td align="center">71.8</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">81.9</td>
<td align="center">90.9</td>
<td align="center">57.9</td>
<td align="center">80.4</td>
<td align="center">38.4</td>
<td align="center">75.7</td>
</tr>
<tr>
<td>GLM-4(0116)</td>
<td align="center">81.5</td>
<td align="center">87.6</td>
<td align="center">47.9</td>
<td align="center">82.3</td>
<td align="center">35.7</td>
<td align="center">72.0</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">83.3</td>
<td align="center">93.3</td>
<td align="center">61.3</td>
<td align="center">84.7</td>
<td align="center">39.9</td>
<td align="center">78.5</td>
</tr>
</tbody></table>
<h3 id="3-2-zlzxpg">3.2 指令遵循评估</h3>
<p>我们使用最近推出的 IFEval 数据集 [62] 评估 GLM-4 的指令遵循能力。该数据集包含 541 个 prompt,源自 25 种不同的指令,可通过明确标准验证(例如,&quot;以 P.S. I do like the cake 结尾&quot;可以通过字符串匹配验证)。我们遵循 [62] 的方法计算严格模式和宽松模式下 prompt 级别和指令级别的准确率。为进一步评估模型在中文指令遵循上的表现,我们将原始 prompt 翻译成中文,省略不适用于中文的指令(如大小写),并调整评分脚本以适应中文数据。</p>
<p><strong>表 3: GLM-4 在 IFEval 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">英文</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
<th align="center">中文</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td></td>
<td align="center">L-P</td>
<td align="center">S-P</td>
<td align="center">L-I</td>
<td align="center">S-I</td>
<td align="center">L-P</td>
<td align="center">S-P</td>
<td align="center">L-I</td>
<td align="center">S-I</td>
</tr>
<tr>
<td>GPT-4(0613)</td>
<td align="center">79.5</td>
<td align="center">77.1</td>
<td align="center">85.5</td>
<td align="center">83.7</td>
<td align="center">72.4</td>
<td align="center">68.9</td>
<td align="center">80.0</td>
<td align="center">75.7</td>
</tr>
<tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">79.1</td>
<td align="center">75.4</td>
<td align="center">85.1</td>
<td align="center">82.4</td>
<td align="center">74.3</td>
<td align="center">69.1</td>
<td align="center">80.8</td>
<td align="center">76.5</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">84.5</td>
<td align="center">81.2</td>
<td align="center">88.7</td>
<td align="center">85.9</td>
<td align="center">79.3</td>
<td align="center">72.6</td>
<td align="center">84.2</td>
<td align="center">79.1</td>
</tr>
<tr>
<td>Claude 2</td>
<td align="center">75.0</td>
<td align="center">58.0</td>
<td align="center">81.7</td>
<td align="center">67.7</td>
<td align="center">57.1</td>
<td align="center">46.5</td>
<td align="center">64.9</td>
<td align="center">55.1</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">90.6</td>
<td align="center">85.5</td>
<td align="center">93.7</td>
<td align="center">90.0</td>
<td align="center">78.3</td>
<td align="center">73.3</td>
<td align="center">84.3</td>
<td align="center">80.4</td>
</tr>
<tr>
<td>GLM-4-9B-Chat</td>
<td align="center">73.0</td>
<td align="center">69.0</td>
<td align="center">80.3</td>
<td align="center">77.2</td>
<td align="center">73.0</td>
<td align="center">69.0</td>
<td align="center">80.3</td>
<td align="center">77.2</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">80.4</td>
<td align="center">75.2</td>
<td align="center">86.1</td>
<td align="center">82.3</td>
<td align="center">79.3</td>
<td align="center">71.2</td>
<td align="center">84.0</td>
<td align="center">77.3</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">83.7</td>
<td align="center">79.1</td>
<td align="center">88.7</td>
<td align="center">85.0</td>
<td align="center">79.7</td>
<td align="center">71.9</td>
<td align="center">84.2</td>
<td align="center">78.0</td>
</tr>
</tbody></table>
<p><em>L=Loose(宽松), S=Strict(严格), P=Prompt(提示级别), I=Instruction(指令级别)</em></p>
<p>在宽松模式下,GLM-4 在英文和中文上都匹配 GPT-4 Turbo 的指令级别准确率。在严格模式下,GLM-4 在英文和中文上分别达到 GPT-4 Turbo(2024-04-09)指令级别准确率的 99.0% 和 98.6%。</p>
<h3 id="3-3-dqpg">3.3 对齐评估</h3>
<p>AlignBench [23] 提供了一种自动的 LLM-as-Judge 方法来基准测试 LLM 在中文语境中的对齐质量。它包含 683 个查询,跨越 8 个不同类别,并使用基于 GPT-4 的多维规则校准逐点参考评分方法评估模型响应。我们在 AlignBench-v1.1 上评估,该版本更仔细地改进了参考生成质量,特别是通过补充带有 URL 的网页人工收集证据来处理占总查询 66.5% 的知识相关问题。在这个版本上,几乎所有 LLM 的分数都比之前的 AlignBench 低。</p>
<p><strong>表 4: GLM-4 在 AlignBench 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">数学</th>
<th align="center">逻辑</th>
<th align="center">语言</th>
<th align="center">中文 QA</th>
<th align="center">写作</th>
<th align="center">角色扮演</th>
<th align="center">专业</th>
<th align="center">综合</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4(0613)</td>
<td align="center">7.54</td>
<td align="center">7.17</td>
<td align="center">7.82</td>
<td align="center">7.02</td>
<td align="center">7.39</td>
<td align="center">7.67</td>
<td align="center">8.20</td>
<td align="center">7.46</td>
</tr>
<tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">7.85</td>
<td align="center">7.66</td>
<td align="center">7.90</td>
<td align="center">7.22</td>
<td align="center">8.24</td>
<td align="center">8.53</td>
<td align="center">8.46</td>
<td align="center">7.95</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">8.32</td>
<td align="center">7.67</td>
<td align="center">7.60</td>
<td align="center">7.57</td>
<td align="center">8.37</td>
<td align="center">7.75</td>
<td align="center">8.18</td>
<td align="center">7.90</td>
</tr>
<tr>
<td>Claude 2</td>
<td align="center">6.39</td>
<td align="center">5.85</td>
<td align="center">6.75</td>
<td align="center">5.72</td>
<td align="center">6.68</td>
<td align="center">5.87</td>
<td align="center">6.86</td>
<td align="center">6.26</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">7.27</td>
<td align="center">7.11</td>
<td align="center">7.94</td>
<td align="center">7.71</td>
<td align="center">8.21</td>
<td align="center">7.61</td>
<td align="center">7.73</td>
<td align="center">7.53</td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td align="center">7.07</td>
<td align="center">7.77</td>
<td align="center">7.31</td>
<td align="center">7.22</td>
<td align="center">8.55</td>
<td align="center">7.83</td>
<td align="center">7.79</td>
<td align="center">7.65</td>
</tr>
<tr>
<td>GLM-4-9B-Chat</td>
<td align="center">7.00</td>
<td align="center">6.01</td>
<td align="center">6.69</td>
<td align="center">7.26</td>
<td align="center">7.97</td>
<td align="center">7.59</td>
<td align="center">8.10</td>
<td align="center">7.00</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">7.69</td>
<td align="center">6.95</td>
<td align="center">7.53</td>
<td align="center">8.00</td>
<td align="center">7.90</td>
<td align="center">8.01</td>
<td align="center">8.35</td>
<td align="center">7.52</td>
</tr>
<tr>
<td>GLM-4(0116)</td>
<td align="center">7.20</td>
<td align="center">7.20</td>
<td align="center">7.60</td>
<td align="center">8.19</td>
<td align="center">8.45</td>
<td align="center">7.88</td>
<td align="center">8.05</td>
<td align="center">7.89</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">7.89</td>
<td align="center">7.95</td>
<td align="center">8.00</td>
<td align="center">7.86</td>
<td align="center">8.11</td>
<td align="center">8.04</td>
<td align="center">8.06</td>
<td align="center">7.95</td>
</tr>
</tbody></table>
<p>结果显示,GLM-4 总体上超越 GPT-4 Turbo、Claude 3 Opus 和 Gemini 1.5 Pro,在基线中取得最高综合分数。特别是在中文逻辑推理和语言理解任务上,GLM-4 显著超越所有其他强大模型。这些结果展示了它对中文语言和知识的强大掌握。</p>
<p>GLM-4 与 GPT-4 Turbo(2024-04-09)之间的当前性能差距主要在于数学维度。我们一直在采用 ChatGLM-Math [48] 中介绍的技术(如自我批判)来持续提升 GLM 模型的数学推理能力。</p>
<blockquote>
<p><strong>译者思考：数据与实验</strong></p>
<p>AlignBench 是智谱团队自己开发的评测基准,这是一个需要谨慎看待的点。自研基准+自研模型=潜在的评测偏差。</p>
<p>但有几个因素让结果更可信:</p>
<ol>
<li>AlignBench-v1.1 使用了&quot;LLM-as-Judge&quot;方法,用 GPT-4 来评分,减少了人为操纵的空间;</li>
<li>论文明确承认 GLM-4 在数学维度上落后于 GPT-4 Turbo,这种&quot;承认不足&quot;增加了整体可信度;</li>
<li>评分是 7 维度的,GLM-4 并非在所有维度都领先(如 GLM-4(0520)的专业维度 8.06 低于 GPT-4 Turbo 的 8.18)。</li>
</ol>
<p>一个有趣的观察:GLM-4 在&quot;角色扮演&quot;维度(8.04)上超过了 GPT-4 Turbo(7.75),这可能与 CharacterGLM 的技术积累有关。智谱在角色扮演方面有专门的研究和产品化经验。</p>
</blockquote>
<h3 id="3-4-csxwclnlpg">3.4 长上下文处理能力评估</h3>
<p>为评估 GLM-4 在长文本任务上的性能,我们在 LongBench-Chat [1] 上进行评估,这是一个上下文长度从 10K 到 100K 的基准集,涵盖用户常用的广泛长文本场景,如文档问答、摘要和编码。在我们的对比中,为提供更详细的 GLM-4 不同语言性能对比,我们还按语言将 LongBench-Chat 划分为两部分:中文和英文。因此我们分别报告两部分的结果,提供 GLM-4 跨语言能力细粒度概览。</p>
<p>关于具体评估设置,我们基于 GPT-4 对每个模型的输出进行评分,在 LongBench-Chat 中采用少样本策略。此外,鉴于我们最小化分数变化和得出更可靠统计结论的目标,我们重复评估多次。随后在表 5 中报告多次评估的平均值,以确保最终性能指标反映对 GLM-4 在多样条件下行为的全面理解。</p>
<p>结果清楚地表明,GLM-4 的性能在英文 prompt 上与 GPT-4 Turbo 和 Claude 3 Opus 相当,在中文 prompt 上超越其中最佳者。</p>
<p><strong>表 5: GLM-4 在 LongBench-Chat 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">英文</th>
<th align="center">中文</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">87.2</td>
<td align="center">71.4</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">85.0</td>
<td align="center">82.1</td>
</tr>
<tr>
<td>Claude 2</td>
<td align="center">81.3</td>
<td align="center">76.2</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">87.7</td>
<td align="center">82.7</td>
</tr>
<tr>
<td>GLM-4-9B-Chat</td>
<td align="center">76.8</td>
<td align="center">82.4</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">79.0</td>
<td align="center">81.0</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">87.3</td>
<td align="center">84.0</td>
</tr>
</tbody></table>
<h3 id="3-5-zsyh-prompt-ddmnlpg">3.5 真实用户 Prompt 的代码能力评估</h3>
<p>虽然 HumanEval [4] 已被广泛采用于评估 LLM 的代码生成,但其大多数问题涉及入门算法。然而,在实践中,用户提出复杂问题来完成日常工作,其难度通常远超 HumanEval 的范围。此外,已有研究报告其自身或其他 LLM 的训练数据中存在 HumanEval 污染 [28; 19; 50],使 HumanEval 的结果相对之前可信度降低。</p>
<p>因此,除 HumanEval 外,我们还在 NaturalCodeBench(NCB) [55] 上评估 GLM-4,这是一个具有挑战性的双语编码基准,源自真实用户 prompt,反映真实世界编码任务的复杂性。如表 6 所示,GLM-4 在实际场景中的编码性能接近 Claude 3 Opus。虽然与 GPT-4 模型仍有差距,但考虑到 GLM-4 的双语平衡特性,通过更好的训练策略和数据整理,在后续迭代中有很大潜力提升其在 NCB 上的表现。</p>
<p><strong>表 6: GLM-4 在 NaturalCodeBench 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">Python(en)</th>
<th align="center">Java(en)</th>
<th align="center">Python(zh)</th>
<th align="center">Java(zh)</th>
<th align="center">综合</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4(0613)</td>
<td align="center">55.7</td>
<td align="center">51.1</td>
<td align="center">53.4</td>
<td align="center">51.1</td>
<td align="center">52.8</td>
</tr>
<tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">51.9</td>
<td align="center">55.0</td>
<td align="center">47.3</td>
<td align="center">51.9</td>
<td align="center">51.5</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">57.5</td>
<td align="center">52.3</td>
<td align="center">53.1</td>
<td align="center">52.3</td>
<td align="center">53.8</td>
</tr>
<tr>
<td>Claude 2</td>
<td align="center">34.4</td>
<td align="center">36.6</td>
<td align="center">33.6</td>
<td align="center">32.8</td>
<td align="center">34.4</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">48.9</td>
<td align="center">48.9</td>
<td align="center">45.0</td>
<td align="center">50.4</td>
<td align="center">48.3</td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td align="center">45.0</td>
<td align="center">39.7</td>
<td align="center">41.5</td>
<td align="center">43.1</td>
<td align="center">42.3</td>
</tr>
<tr>
<td>GLM-4-9B-Chat</td>
<td align="center">33.9</td>
<td align="center">29.8</td>
<td align="center">30.8</td>
<td align="center">34.4</td>
<td align="center">32.2</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">40.8</td>
<td align="center">39.7</td>
<td align="center">43.1</td>
<td align="center">39.7</td>
<td align="center">40.8</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">51.6</td>
<td align="center">42.8</td>
<td align="center">45.4</td>
<td align="center">48.9</td>
<td align="center">47.1</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者思考：局限与风险</strong></p>
<p>关于 HumanEval 数据污染的问题,这是一个非常重要的提醒。HumanEval 的 164 道编程题来自 OpenAI 的内部测试,这些题目在公开后迅速被纳入各种预训练数据集。论文 [28; 19; 50] 都报告了不同程度的污染。</p>
<p>NCB 的设计思路非常正确:从真实用户 prompt 出发,而不是从已有的编程竞赛题出发。但 NCB 也有自己的问题:</p>
<ol>
<li>真实用户 prompt 的复杂度差异很大,可能导致评测结果波动较大;</li>
<li>双语评测(中英文)虽然更符合 GLM-4 的定位,但不同语言的问题难度可能不一致;</li>
<li>基准的公开性和可复现性——如果 NCB 的测试集不公开,第三方难以验证结果。</li>
</ol>
<p>GLM-4(0520)在 NCB 综合得分 47.1,与 Claude 3 Opus 的 48.3 接近,但低于 GPT-4 Turbo(2024-04-09)的 53.8。这说明 GLM-4 在真实编程场景中有竞争力,但尚未达到顶尖水平。</p>
</blockquote>
<h3 id="3-6-hstypg">3.6 函数调用评估</h3>
<p>为评估 GLM 模型在函数调用上的性能,我们在 Berkeley Function Call Leaderboard [49] 上进行评估,这是一个包含 2k 问题-函数-答案对的基准。该基准从三个类别评估模型的函数调用能力:</p>
<ol>
<li><strong>AST 评估</strong>:通过 AST 分析将模型输出函数与函数文档和可能答案对比;</li>
<li><strong>执行评估</strong>:通过执行生成的函数调用检查响应正确性;</li>
<li><strong>相关性检测</strong>:评估模型识别不适合回答用户问题的函数的能力。</li>
</ol>
<p><strong>表 7: GLM 在 Berkeley Function Call Leaderboard 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">AST Summary</th>
<th align="center">Exec Summary</th>
<th align="center">Relevance</th>
<th align="center">综合</th>
</tr>
</thead>
<tbody><tr>
<td>Llama-3-8B-Instruct</td>
<td align="center">59.25</td>
<td align="center">70.01</td>
<td align="center">45.83</td>
<td align="center">58.88</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">82.14</td>
<td align="center">78.61</td>
<td align="center">88.75</td>
<td align="center">81.24</td>
</tr>
<tr>
<td>GPT-4o(2024-05-13)</td>
<td align="center">85.23</td>
<td align="center">80.37</td>
<td align="center">81.25</td>
<td align="center">82.94</td>
</tr>
<tr>
<td>ChatGLM3-6B</td>
<td align="center">62.18</td>
<td align="center">69.78</td>
<td align="center">5.42</td>
<td align="center">57.88</td>
</tr>
<tr>
<td>GLM-4-9B-Chat</td>
<td align="center">80.26</td>
<td align="center">84.40</td>
<td align="center">87.92</td>
<td align="center">81.00</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">84.34</td>
<td align="center">85.93</td>
<td align="center">68.33</td>
<td align="center">80.94</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">82.59</td>
<td align="center">87.78</td>
<td align="center">84.17</td>
<td align="center">81.76</td>
</tr>
</tbody></table>
<p>我们可以观察到 GLM-4(0520)的函数调用能力与 GPT-4 Turbo(2024-04-09)相当,而 GLM-4-9B-Chat 显著超越 Llama-3-8B-Instruct。另一个观察是,综合准确率并不随模型大小提升,GLM-4-9B-Chat 甚至能超越 GLM-4-Air。另一方面,我们观察到执行摘要(评估真实世界 API 的执行结果)上的性能随模型大小平稳提升。</p>
<h3 id="3-7-agent-nlpg">3.7 Agent 能力评估</h3>
<p>人们广泛观察到 LLM 能够在各种环境和上下文中充当智能 agent [30; 51],即 LLM-as-Agents [25]。因此,我们在 AgentBench [25] 上评估 GLM-4 和其他对比 LLM,这是一个针对基于文本的 LLM 的全面 agent 基准,跨越一系列实际环境,包括基于代码、基于游戏和基于网络的上下文。具体来说,我们在 AgentBench 的 8 个环境中的 7 个上评估(除 Digital Card Game 外,因其交互过于耗时)。综合分数使用 AgentBench [25] 提供的原始每数据集权重计算。</p>
<p><strong>表 8: GLM-4 在 AgentBench 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">OS</th>
<th align="center">知识图谱</th>
<th align="center">横向思维</th>
<th align="center">家务</th>
<th align="center">网页购物</th>
<th align="center">网页浏览</th>
<th align="center">数据库</th>
<th align="center">综合</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4(0613)</td>
<td align="center">42.4</td>
<td align="center">32.0</td>
<td align="center">58.8</td>
<td align="center">16.6</td>
<td align="center">78.0</td>
<td align="center">61.1</td>
<td align="center">29.0</td>
<td align="center">3.69</td>
</tr>
<tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">40.3</td>
<td align="center">52.7</td>
<td align="center">54.0</td>
<td align="center">17.7</td>
<td align="center">70.0</td>
<td align="center">52.8</td>
<td align="center">30.0</td>
<td align="center">3.77</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">41.0</td>
<td align="center">46.7</td>
<td align="center">53.2</td>
<td align="center">19.4</td>
<td align="center">72.0</td>
<td align="center">55.1</td>
<td align="center">19.0</td>
<td align="center">3.68</td>
</tr>
<tr>
<td>Claude 2</td>
<td align="center">18.1</td>
<td align="center">27.3</td>
<td align="center">41.3</td>
<td align="center">8.4</td>
<td align="center">54.0</td>
<td align="center">61.4</td>
<td align="center">0.0</td>
<td align="center">2.03</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">23.6</td>
<td align="center">55.0</td>
<td align="center">53.4</td>
<td align="center">20.0</td>
<td align="center">70.0</td>
<td align="center">48.5</td>
<td align="center">28.0</td>
<td align="center">3.62</td>
</tr>
<tr>
<td>GLM-4-Air(0605)</td>
<td align="center">31.9</td>
<td align="center">51.0</td>
<td align="center">53.8</td>
<td align="center">12.3</td>
<td align="center">78.0</td>
<td align="center">69.2</td>
<td align="center">30.0</td>
<td align="center">3.58</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">36.8</td>
<td align="center">52.7</td>
<td align="center">51.4</td>
<td align="center">15.3</td>
<td align="center">82.0</td>
<td align="center">68.3</td>
<td align="center">29.0</td>
<td align="center">3.79</td>
</tr>
</tbody></table>
<p>如表所示,GLM-4 模型在 agent 任务上表现相当出色,GLM-4-Air 与 GPT-4 Turbo 和 Claude 3 Opus 相当,GLM-4 则超越它们。在具体环境方面,我们发现 GLM-4 系列在数据库、家务和网页购物任务上表现尤其出色,而在操作系统、知识图谱和横向思维谜题上仍与 GPT-4 系列存在差距。这种差距表明 GLM-4 在代码相关 agent 任务和高交互性语言任务上仍有提升空间。</p>
<h3 id="3-8-all-tools-pg">3.8 All Tools 评估</h3>
<p>GLM-4 进一步对齐以支持 <a href="https://chatglm.cn">https://chatglm.cn</a> 上的智能 agent 和用户配置的 GLMs 功能,由此产生的模型即为 GLM-4 All Tools。如前所述,GLM-4 All Tools 可以通过自主理解用户意图、逐步规划指令并调用多个工具(包括网页浏览器、Python 解释器和文生图模型,如 CogView3 [59])来完成复杂任务。</p>
<p><strong>表 9: GLM-4 All Tools 的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">Python 解释器</th>
<th align="center"></th>
<th align="center">浏览器信息检索</th>
</tr>
</thead>
<tbody><tr>
<td></td>
<td align="center">GSM8K</td>
<td align="center">MATH</td>
<td align="center">Math23K</td>
</tr>
<tr>
<td>GLM-4 All Tools(Web)</td>
<td align="center">91.59</td>
<td align="center">63.60</td>
<td align="center">88.50</td>
</tr>
<tr>
<td>GPT-4(Web, 0116)</td>
<td align="center">92.72</td>
<td align="center">65.00</td>
<td align="center">88.40</td>
</tr>
</tbody></table>
<p>表 9 显示,GLM-4 All Tools(Web)在使用 Python 解释器解决数学问题和使用浏览器进行信息检索方面,分别与 ChatGPT-4(Web)达到相似性能。</p>
<hr>
<h2 id="4-aqyfx">4 安全与风险</h2>
<p>我们致力于确保 GLM-4 作为一个安全、负责和无偏见的模型运行。除解决常见的伦理和公平问题外,我们仔细评估和减轻模型在真实场景中可能对用户造成的潜在伤害。</p>
<h3 id="fxhj">风险缓解</h3>
<p>我们在预训练阶段仔细清洗数据,通过去除包含敏感关键词的文本和来自预定义黑名单的网页。在对齐阶段,我们评估每个训练样本的安全性并去除任何存在潜在风险的样本。无害性也是比较多个模型输出时偏好对齐的重要标准。</p>
<p>我们有一支红队,不断用容易导致不安全回答的棘手问题挑战模型。我们收集 GLM-4 的所有有害问答对,并通过人工标注改进以进行进一步的模型对齐。</p>
<h3 id="aqpg">安全评估</h3>
<p>我们在 SafetyBench [56] 上评估 GLM-4 模型,该基准从 7 个维度评估每个模型:伦理与道德(不道德行为)、非法活动(基本法律知识)、心理健康(对心理健康的不利影响)、攻击性(攻击性行为)、身体健康(可能导致身体伤害的危险行为)、隐私与财产(隐私泄露或财产损失)、不公平与偏见。我们在 SafetyBench 的中文子集上评估不同模型,该子集通过删除倾向于被审查的高度敏感问题创建,以减轻不同 API 安全策略的干扰。</p>
<p><strong>表 10: GLM-4 在 SafetyBench 上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th align="center">伦理道德</th>
<th align="center">非法活动</th>
<th align="center">心理健康</th>
<th align="center">攻击性</th>
<th align="center">身体健康</th>
<th align="center">隐私财产</th>
<th align="center">不公平偏见</th>
<th align="center">综合</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4(0613)</td>
<td align="center">92.7</td>
<td align="center">93.3</td>
<td align="center">93.0</td>
<td align="center">87.7</td>
<td align="center">96.7</td>
<td align="center">91.3</td>
<td align="center">73.3</td>
<td align="center">89.7</td>
</tr>
<tr>
<td>GPT-4 Turbo(1106)</td>
<td align="center">91.0</td>
<td align="center">92.0</td>
<td align="center">93.0</td>
<td align="center">86.0</td>
<td align="center">92.0</td>
<td align="center">88.7</td>
<td align="center">74.3</td>
<td align="center">88.1</td>
</tr>
<tr>
<td>GPT-4 Turbo(2024-04-09)</td>
<td align="center">90.3</td>
<td align="center">91.3</td>
<td align="center">91.7</td>
<td align="center">85.3</td>
<td align="center">92.0</td>
<td align="center">89.3</td>
<td align="center">75.0</td>
<td align="center">87.9</td>
</tr>
<tr>
<td>Claude 3 Opus</td>
<td align="center">92.7</td>
<td align="center">91.7</td>
<td align="center">92.7</td>
<td align="center">86.3</td>
<td align="center">94.7</td>
<td align="center">88.7</td>
<td align="center">66.0</td>
<td align="center">87.5</td>
</tr>
<tr>
<td>GLM-4(0520)</td>
<td align="center">92.3</td>
<td align="center">91.3</td>
<td align="center">93.3</td>
<td align="center">86.3</td>
<td align="center">92.3</td>
<td align="center">88.6</td>
<td align="center">66.0</td>
<td align="center">87.2</td>
</tr>
</tbody></table>
<p>表 10 显示了 GLM-4 和 SOTA 模型的安全结果。在大多数维度上,GLM-4(0520)展示了有竞争力的安全性能,总体上与 Claude 3 Opus 相当。GLM-4 略低于 GPT-4 家族,特别是在身体健康维度上,这需要关于物理世界的稳健常识知识来避免潜在风险。我们已在该方向投入更多努力以开发更有能力且更安全的 GLM 模型。</p>
<hr>
<h2 id="5-jl">5 结论</h2>
<p>在本报告中,我们介绍了从 GLM-130B 到 GLM-4(All Tools)的 ChatGLM 大语言模型家族。在过去一年半中,我们从一手经验中在理解大语言模型的各个方面取得了巨大进步。随着每一代模型的发展,团队学习并应用了更有效、更高效的预训练和对齐策略。最近的 ChatGLM 模型——GLM-4(0116, 0520)、GLM-4-Air(0605)和 GLM-4 All Tools——通过自主使用外部工具和功能,在理解和执行复杂任务方面展示了显著进步。这些 GLM-4 模型在性能上与 SOTA 模型(如 GPT-4 Turbo、Claude 3 Opus 和 Gemini 1.5 Pro)相当,在某些情况下甚至超越它们,特别是在处理与中文语言相关的任务方面。</p>
<p>此外,我们致力于通过开源模型权重和在整个过程中开发的技术来促进 LLM 的可访问性和安全性。我们的开源模型,包括语言、代码和视觉模型,仅在 2023 年就在 Hugging Face 上吸引了超过 1000 万次下载。目前,我们正在利用迄今为止所学的一切开发更有能力的模型。未来,我们将继续通过开源来普及尖端 LLM 技术,并推动模型能力边界朝着&quot;让机器像人类一样思考&quot;的使命前进。</p>
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
<td>GLM</td>
<td>General Language Model,通用语言模型。智谱 AI 提出的预训练框架,采用自回归空白填充目标。</td>
</tr>
<tr>
<td>ChatGLM</td>
<td>基于 GLM 架构的对话模型系列,由智谱 AI 和清华大学开发。</td>
</tr>
<tr>
<td>SFT</td>
<td>Supervised Fine-Tuning,监督微调。使用人工标注的输入-输出对微调预训练模型的过程。</td>
</tr>
<tr>
<td>RLHF</td>
<td>Reinforcement Learning from Human Feedback,基于人类反馈的强化学习。使用人类偏好数据训练奖励模型,再通过 PPO 等算法优化策略。</td>
</tr>
<tr>
<td>PPO</td>
<td>Proximal Policy Optimization,近端策略优化。一种策略梯度强化学习算法,用于 RLHF 阶段。</td>
</tr>
<tr>
<td>DPO</td>
<td>Direct Preference Optimization,直接偏好优化。无需显式奖励模型,直接从偏好数据优化策略的方法。</td>
</tr>
<tr>
<td>GQA</td>
<td>Group Query Attention,分组查询注意力。多个 Query 头共享一组 KV 头,减少 KV 缓存。</td>
</tr>
<tr>
<td>MQA</td>
<td>Multi-Query Attention,多查询注意力。所有 Query 头共享单个 KV 头,进一步减少 KV 缓存。</td>
</tr>
<tr>
<td>RoPE</td>
<td>Rotary Position Embedding,旋转位置编码。通过旋转矩阵编码位置信息的位置编码方案。</td>
</tr>
<tr>
<td>RMSNorm</td>
<td>Root Mean Square Layer Normalization,均方根层归一化。一种层归一化变体,不含可学习的缩放和偏移参数。</td>
</tr>
<tr>
<td>SwiGLU</td>
<td>Swish-Gated Linear Unit,一种激活函数,结合 Swish 门控和线性单元。</td>
</tr>
<tr>
<td>BPE</td>
<td>Byte Pair Encoding,字节对编码。一种子词分词算法。</td>
</tr>
<tr>
<td>Agent</td>
<td>智能体。能够自主感知环境、做出决策并执行行动的 AI 系统。</td>
</tr>
<tr>
<td>All Tools</td>
<td>GLM-4 的功能版本,能够自主调用网页浏览器、Python 解释器、文生图模型等工具。</td>
</tr>
<tr>
<td>GLMs</td>
<td>智谱 AI 的应用平台,允许用户创建和定制自己的 agent。</td>
</tr>
<tr>
<td>IFEval</td>
<td>Instruction Following Evaluation,指令遵循评估基准。</td>
</tr>
<tr>
<td>AlignBench</td>
<td>中文对齐评估基准,由智谱团队开发。</td>
</tr>
<tr>
<td>SafetyBench</td>
<td>安全评估基准,从 7 个维度评估模型安全性。</td>
</tr>
</tbody></table>
<hr>
<h2 id="fl-b-gjsjsc">附录 B:关键数据速查</h2>
<p><strong>模型演进时间线</strong></p>
<table>
<thead>
<tr>
<th>时间</th>
<th>模型</th>
<th>关键特性</th>
</tr>
</thead>
<tbody><tr>
<td>2021.06</td>
<td>GLM-10B</td>
<td>GLM 预训练框架,自回归空白填充</td>
</tr>
<tr>
<td>2022.08</td>
<td>GLM-130B</td>
<td>130B 参数,双语预训练,HELM 匹配 GPT-3</td>
</tr>
<tr>
<td>2023.03</td>
<td>ChatGLM-6B / ChatGLM-130B</td>
<td>6B 对话模型开源,INT4 量化支持消费级显卡</td>
</tr>
<tr>
<td>2023.06</td>
<td>ChatGLM2-6B</td>
<td>32K 上下文,FlashAttention,MQA,推理速度 +42%</td>
</tr>
<tr>
<td>2023.10</td>
<td>ChatGLM3-6B</td>
<td>42 个基准登顶,支持函数调用和代码解释器</td>
</tr>
<tr>
<td>2024.01</td>
<td>GLM-4 / GLM-4 All Tools</td>
<td>128K 上下文,自主工具调用</td>
</tr>
<tr>
<td>2024.05</td>
<td>GLM-4(0520)</td>
<td>预训练和对齐升级</td>
</tr>
<tr>
<td>2024.06</td>
<td>GLM-4-Air(0605)</td>
<td>与 GLM-4(0116)相当性能,更低延迟和成本</td>
</tr>
</tbody></table>
<p><strong>GLM-4(0520) 核心性能</strong></p>
<table>
<thead>
<tr>
<th>基准</th>
<th align="center">得分</th>
<th align="center">对比 GPT-4(0314)</th>
<th align="center">对比 GPT-4 Turbo(2024-04-09)</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td align="center">83.3</td>
<td align="center">96.3%</td>
<td align="center">96.1%</td>
</tr>
<tr>
<td>GSM8K</td>
<td align="center">93.3</td>
<td align="center">101.4%</td>
<td align="center">97.6%</td>
</tr>
<tr>
<td>MATH</td>
<td align="center">61.3</td>
<td align="center">116.0%</td>
<td align="center">83.5%</td>
</tr>
<tr>
<td>BBH</td>
<td align="center">84.7</td>
<td align="center">101.9%</td>
<td align="center">96.0%</td>
</tr>
<tr>
<td>GPQA</td>
<td align="center">39.9</td>
<td align="center">111.8%</td>
<td align="center">80.9%</td>
</tr>
<tr>
<td>HumanEval</td>
<td align="center">78.5</td>
<td align="center">117.2%</td>
<td align="center">89.0%</td>
</tr>
</tbody></table>
<p><strong>GLM-4 架构要点</strong></p>
<table>
<thead>
<tr>
<th>组件</th>
<th>设计选择</th>
</tr>
</thead>
<tbody><tr>
<td>层归一化</td>
<td>RMSNorm</td>
</tr>
<tr>
<td>激活函数</td>
<td>SwiGLU</td>
</tr>
<tr>
<td>位置编码</td>
<td>RoPE 二维扩展</td>
</tr>
<tr>
<td>注意力</td>
<td>GQA(分组查询注意力)</td>
</tr>
<tr>
<td>FFN 维度</td>
<td>10/3 × hidden_size</td>
</tr>
<tr>
<td>偏置</td>
<td>仅保留 QKV 偏置</td>
</tr>
<tr>
<td>上下文长度</td>
<td>128K(标准) / 1M(实验)</td>
</tr>
<tr>
<td>词表大小</td>
<td>150,000</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>译者注</strong>:这篇论文的独特价值在于它不仅是 GLM-4 的技术报告,更是一部中国开源大模型发展的编年史。从 2021 年的 GLM-10B 到 2024 年的 GLM-4,智谱 AI 用三年时间完成了从追赶者到并跑者的转变。论文中反复出现的&quot;主要针对中文进行对齐&quot;不是一个简单的市场定位,而是反映了中国 LLM 团队的一个核心认知:通用能力的差距可以通过针对性的后训练来弥补,而语言文化的深度理解是构建差异化竞争力的关键。GLM-4 在 AlignBench 和 LongBench-Chat(中文)上的领先,正是这种策略的成果。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-chat-glm-js","text":"2 ChatGLM 技术"},{"level":3,"id":"2-1-yxlsj","text":"2.1 预训练数据"},{"level":3,"id":"2-2-jg","text":"2.2 架构"},{"level":3,"id":"2-3-dq","text":"2.3 对齐"},{"level":3,"id":"2-4-chat-glm-jstx","text":"2.4 ChatGLM 技术体系"},{"level":3,"id":"2-5-glm-4-all-tools","text":"2.5 GLM-4 All Tools"},{"level":2,"id":"3-glm-4-nlpg","text":"3 GLM-4 能力评估"},{"level":3,"id":"3-1-xsjzpg","text":"3.1 学术基准评估"},{"level":3,"id":"3-2-zlzxpg","text":"3.2 指令遵循评估"},{"level":3,"id":"3-3-dqpg","text":"3.3 对齐评估"},{"level":3,"id":"3-4-csxwclnlpg","text":"3.4 长上下文处理能力评估"},{"level":3,"id":"3-5-zsyh-prompt-ddmnlpg","text":"3.5 真实用户 Prompt 的代码能力评估"},{"level":3,"id":"3-6-hstypg","text":"3.6 函数调用评估"},{"level":3,"id":"3-7-agent-nlpg","text":"3.7 Agent 能力评估"},{"level":3,"id":"3-8-all-tools-pg","text":"3.8 All Tools 评估"},{"level":2,"id":"4-aqyfx","text":"4 安全与风险"},{"level":3,"id":"fxhj","text":"风险缓解"},{"level":3,"id":"aqpg","text":"安全评估"},{"level":2,"id":"5-jl","text":"5 结论"},{"level":2,"id":"fl-a-syb","text":"附录 A:术语表"},{"level":2,"id":"fl-b-gjsjsc","text":"附录 B:关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/02-chat-glm/01-chat-glm-xljsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/02-chat-glm/01-chat-glm-xljsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ChatGLM: 从 GLM-130B 到 GLM-4 All Tools 的大语言模型家族</h1>
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
