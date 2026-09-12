"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM3-4B: 端侧工具调用与无限长文本处理</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 MiniCPM3-4B 的两项核心创新: (1) 在 40 亿参数规模上实现端侧最强 Function Calling 能力; (2) 通过 LLMxMapReduce 机制突破 Transformer 长文本瓶颈。我们将从工程原理、实现挑战和实际应用三个维度展开深度分析。</p>
</blockquote>
<hr>
<h2 id="y-bj-dc-ai-c-ltgj-d-znt-dyq">一、背景: 端侧 AI 从「聊天工具」到「智能体」的跃迁</h2>
<p>2024 年以前，端侧语言模型(如 Gemma-2B、Phi-3-mini、MiniCPM-2B)的核心价值 proposition 是「在手机上跑 GPT-3.5 级别的文本生成」。这类模型的典型应用场景是离线聊天、文本摘要和简单的问答。但它们的共同局限是: 只能处理「纯文本输入→纯文本输出」的闭环，无法与外部世界交互。</p>
<p>真正的 AI 智能体(Agent)需要三项基础能力: <strong>感知</strong>(理解用户意图)、<strong>推理</strong>(规划行动步骤)、<strong>执行</strong>(调用工具或操作环境)。在端侧场景中，执行能力尤为重要——因为端侧设备拥有丰富的本地资源: 通讯录、日历、文件系统、传感器数据、已安装的 App。如果模型不能调用这些资源，它本质上只是一个「离线百科全书」，而非「个人助理」。</p>
<p>MiniCPM3-4B 的发布标志着端侧模型从「聊天工具」向「智能体」的关键跃迁。它在 4B 参数规模上同时具备了 Function Calling(函数调用)、Code Interpreter(代码解释)和 RAG(检索增强生成)三项 Agent 核心能力，并首次在端侧实现了 32K 原生上下文窗口和理论无限长文本处理。</p>
<blockquote>
<p>这里需要理解一个产品层面的判断。Function Calling 在云端大模型(如 GPT-4、Claude-3)上早已是标配，但在端侧模型上的落地面临截然不同的约束: (1) 模型参数只有云端的 1/50 到 1/100，理解复杂工具描述和生成精确 JSON 的能力天然受限; (2) 端侧没有无限算力做重试和纠错，一次调用失败就会直接暴露给用户; (3) 端侧工具的多样性远超云端——同一款手机可能安装了数十个 App，每个 App 暴露的接口各不相同，模型需要处理高度动态的工具集合。MiniCPM3-4B 能在 BFCL 上取得 9B 以下 SOTA，说明团队在后训练阶段对端侧 Function Calling 的特殊挑战做了深度优化。</p>
</blockquote>
<hr>
<h2 id="e-dc-function-calling-dgcsx">二、端侧 Function Calling 的工程实现</h2>
<h3 id="2-1-function-calling-djsyl">2.1 Function Calling 的技术原理</h3>
<p>Function Calling 的本质是「将自然语言意图映射到结构化 API 调用」。其标准流程如下:</p>
<ol>
<li><strong>工具注册</strong>: 开发者向模型提供一组工具描述，每个工具包含名称、功能说明和参数 Schema(JSON Schema 格式)。</li>
<li><strong>意图解析</strong>: 模型接收用户查询后，判断是否需要调用工具、调用哪个工具、传入什么参数。</li>
<li><strong>结构化生成</strong>: 模型输出符合 JSON Schema 的函数调用请求，而非自由文本。</li>
<li><strong>执行与反馈</strong>: 外部系统执行函数调用，将结果返回给模型。</li>
<li><strong>综合生成</strong>: 模型基于函数执行结果生成最终回答。</li>
</ol>
<p>在 MiniCPM3-4B 中，这一流程被深度集成到模型的对话模板和生成逻辑中。与通过 prompt engineering 在通用模型上「诱导」JSON 输出不同，MiniCPM3-4B 在 post-training 阶段使用了大量真实的 Function Calling 对话数据进行监督微调(SFT)，使模型将「工具调用」作为一种原生能力内化，而非外部技巧。</p>
<h3 id="2-2-dc-function-calling-ddttz">2.2 端侧 Function Calling 的独特挑战</h3>
<h4 id="tzy-gjmsdsxwzy">挑战一: 工具描述的上下文占用</h4>
<p>在云端场景中，工具描述通常通过系统提示词注入，可以占用大量上下文空间(如 GPT-4 支持数千个工具的注册)。但在端侧，32K 的上下文窗口需要同时容纳用户输入、历史对话、工具描述和模型输出。如果注册了 50 个工具，每个工具描述平均 200 tokens，仅工具描述就占去 10K tokens，留给实际交互的空间所剩无几。</p>
<p>MiniCPM3-4B 的解决方案可能涉及两个层面: (1) 工具描述的压缩——使用更精简的 Schema 表示; (2) 动态工具选择——不把所有工具一次性注入，而是先由轻量级路由模型判断需要哪些工具。官方博客提到「端侧最强 Function Calling」，暗示其在工具选择的精确性上做了特殊优化，避免无效工具占用上下文。</p>
<h4 id="tze-json-schema-djqzx">挑战二: JSON Schema 的精确遵循</h4>
<p>Function Calling 要求模型生成的 JSON 必须严格符合预设 Schema，包括字段名、数据类型、必填项和枚举值。对于 4B 规模的小模型，生成复杂嵌套 JSON 时容易出现语法错误(如缺少引号、括号不匹配)或类型错误(如字符串写成数字)。</p>
<p>业界常见的解决方案包括: (1) <strong>约束解码(Constrained Decoding)</strong>——在解码阶段强制 token 流符合 Schema 的语法规则，从根本上杜绝非法 JSON; (2) <strong>语法纠错后处理</strong>——用 JSON 解析器检测错误并请求模型重试。MiniCPM3-4B 的官方博客未明确说明采用了哪种方案，但 BFCL 的高分表明其在 Schema 遵循方面的可靠性达到了生产可用水平。</p>
<blockquote>
<p>译者注: 约束解码是目前 Function Calling 的主流技术路线。其核心思想是在每个解码步骤，只允许生成符合当前 Schema 状态的合法 token。例如，如果 Schema 要求某个字段是整数，解码器就不会采样到非数字 token。这种方法的代价是增加了解码逻辑的复杂度——需要在 GPU 内核中维护一个状态机来跟踪 JSON 的解析状态。vLLM 和 SGLang 等推理框架已经原生支持约束解码，MiniCPM3-4B 配合这些框架使用时应能自动获得这一能力。</p>
</blockquote>
<h4 id="tzs-dlgjtydbp">挑战三: 多轮工具调用的编排</h4>
<p>复杂任务往往需要连续调用多个工具。例如，「查一下明天北京的天气，如果下雨就提醒我带伞，并把提醒添加到日历」涉及天气查询、条件判断和日历创建三个步骤。模型需要: (1) 理解任务可以分解为子步骤; (2) 按正确顺序调用工具; (3) 将前一步的输出作为后一步的输入; (4) 处理工具执行失败的情况。</p>
<p>MiniCPM3-4B 支持的 Code Interpreter 进一步扩展了编排能力。与 Function Calling 调用外部 API 不同，Code Interpreter 允许模型生成 Python 代码并在沙箱中执行，实现更灵活的数据处理、计算和逻辑控制。对于需要循环、条件分支或复杂数据转换的任务，Code Interpreter 比纯 Function Calling 更具表达力。</p>
<h3 id="2-3-yjpddb">2.3 与竞品的对比</h3>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>MiniCPM3-4B (4B)</th>
<th>Phi-3.5-mini (3.8B)</th>
<th>Gemma-2-2B (2B)</th>
<th>Qwen2.5-3B (3B)</th>
<th>GPT-3.5-Turbo</th>
</tr>
</thead>
<tbody><tr>
<td>原生 Function Calling</td>
<td>支持</td>
<td>不支持</td>
<td>不支持</td>
<td>支持</td>
<td>支持(云端)</td>
</tr>
<tr>
<td>Code Interpreter</td>
<td>支持</td>
<td>不支持</td>
<td>不支持</td>
<td>不支持</td>
<td>支持(云端)</td>
</tr>
<tr>
<td>BFCL 排名</td>
<td>9B 以下 SOTA</td>
<td>无</td>
<td>无</td>
<td>有排名</td>
<td>有排名</td>
</tr>
<tr>
<td>端侧部署</td>
<td>4-bit 约 2GB</td>
<td>4-bit 约 2GB</td>
<td>4-bit 约 1.5GB</td>
<td>4-bit 约 1.8GB</td>
<td>不可端侧部署</td>
</tr>
</tbody></table>
<p>从上表可以看出，MiniCPM3-4B 在端侧模型中率先实现了「Function Calling + Code Interpreter」的双能力组合。Phi-3.5-mini 虽然通用能力很强(MMLU 超过 70)，但缺乏原生工具调用支持; Qwen2.5-3B 支持 Function Calling，但没有 Code Interpreter; Gemma-2-2B 两者都不支持。这种能力差异在实际应用中非常关键——没有 Function Calling 的模型无法操作外部系统，只能做纯文本生成。</p>
<hr>
<h2 id="s-ll-mx-map-reduce-wxcwbdgccx">三、LLMxMapReduce: 无限长文本的工程创新</h2>
<h3 id="3-1-transformer-cwbdpj">3.1 Transformer 长文本的瓶颈</h3>
<p>标准 Transformer 的自注意力机制计算复杂度为 O(n^2)，其中 n 为序列长度。这意味着:</p>
<ul>
<li>当 n = 4K 时，注意力矩阵大小为 4,096 × 4,096 = 16.8M</li>
<li>当 n = 32K 时，注意力矩阵大小为 32,768 × 32,768 = 1.07B(增长 64 倍)</li>
<li>当 n = 128K 时，注意力矩阵大小为 128K × 128K = 16.4B(增长 1,024 倍)</li>
</ul>
<p>不仅是计算量，KV Cache 的显存占用也随序列长度线性增长。一个 4B 模型在 32K 上下文下，KV Cache 可能占用数 GB 显存，在端侧设备上已经接近极限。</p>
<p>业界解决长文本问题的主流技术路线包括:</p>
<table>
<thead>
<tr>
<th>技术路线</th>
<th>代表工作</th>
<th>核心思想</th>
<th>局限</th>
</tr>
</thead>
<tbody><tr>
<td>位置编码外推</td>
<td>RoPE 插值、NTK-aware</td>
<td>通过调整位置编码使模型适应更长序列</td>
<td>外推能力有限，超过一定长度后性能急剧衰减</td>
</tr>
<tr>
<td>注意力近似</td>
<td>Longformer、BigBird、Sparse Attention</td>
<td>用稀疏注意力替代全连接注意力</td>
<td>稀疏模式设计影响捕获长距离依赖的能力</td>
</tr>
<tr>
<td>上下文压缩</td>
<td>RAG、Hierarchical Attention</td>
<td>压缩或检索历史上下文</td>
<td>压缩过程可能丢失关键信息</td>
</tr>
<tr>
<td>滑动窗口</td>
<td>Mistral 的 SWA</td>
<td>只关注局部窗口内的 token</td>
<td>无法捕获超出窗口范围的全局依赖</td>
</tr>
<tr>
<td>线性注意力</td>
<td>RWKV、Mamba、Lightning Attention</td>
<td>将注意力复杂度降为 O(n)</td>
<td>表达能力与标准注意力存在差距，通常需要配合标准注意力使用</td>
</tr>
</tbody></table>
<h3 id="3-2-ll-mx-map-reduce-dsjyl">3.2 LLMxMapReduce 的设计原理</h3>
<p>LLMxMapReduce 借鉴了分布式计算框架 MapReduce 的核心思想: <strong>分而治之，局部处理后再聚合</strong>。</p>
<p>其工作流程如下:</p>
<p><strong>Map 阶段</strong>: 将超长文档按固定长度(如 4K 或 8K tokens)切分为多个片段。每个片段独立输入模型进行编码，生成该片段的上下文表示(通常是最后一层的 hidden states 或特定的聚合 token)。由于各片段独立处理，这一阶段可以并行执行，且显存占用只取决于单个片段的长度，而非总长度。</p>
<p><strong>Reduce 阶段</strong>: 将所有片段的表示聚合，生成对全局文档的理解。聚合方式可以有多种设计: (1) 简单的拼接后通过一个轻量级聚合层; (2) 使用交叉注意力让各片段互相交互; (3) 引入特殊的「全局查询 token」从所有片段中提取关键信息。</p>
<p><strong>生成阶段</strong>: 基于聚合后的全局表示，模型生成回答。如果回答需要引用文档中的具体细节，可以通过某种形式的「指针机制」定位到原始片段。</p>
<blockquote>
<p>译者注: LLMxMapReduce 的工程价值在于「显存与序列长度解耦」。传统方法中，处理 128K 文本需要一次性加载全部 128K 的 KV Cache; 而 MapReduce 只需要同时保留一个片段(如 4K)的 KV Cache，显存占用降低为原来的 1/32。但这里有几个关键问题官方博客没有详细说明: (1) 片段切分点如果落在句子中间，是否会破坏语义连贯性？官方是否采用了语义感知的切分策略？(2) 片段之间的信息如何传递？如果问题需要综合第 1 段和第 100 段的信息，Reduce 阶段的聚合器是否有能力建立这种跨片段关联？(3) 对于需要精确引用的任务(如「文档第三段提到的数字是多少」)，模型如何在分块处理后准确定位原始位置？这些问题的答案将直接决定 LLMxMapReduce 在真实场景中的可用性。</p>
</blockquote>
<h3 id="3-3-ybzcwbjsddb">3.3 与标准长文本技术的对比</h3>
<table>
<thead>
<tr>
<th>对比维度</th>
<th>LLMxMapReduce</th>
<th>RoPE 插值/NTK</th>
<th>稀疏注意力</th>
</tr>
</thead>
<tbody><tr>
<td>复杂度</td>
<td>O(n) (线性)</td>
<td>O(n^2) (二次)</td>
<td>O(n log n) 或 O(n)</td>
</tr>
<tr>
<td>显存需求</td>
<td>与片段长度成正比</td>
<td>与总长度成正比</td>
<td>与总长度成正比(稀疏度决定系数)</td>
</tr>
<tr>
<td>长距离依赖</td>
<td>依赖聚合机制质量</td>
<td>原生支持</td>
<td>依赖稀疏模式设计</td>
</tr>
<tr>
<td>实现复杂度</td>
<td>中(需分块和聚合逻辑)</td>
<td>低(仅修改位置编码)</td>
<td>高(需定制 CUDA kernel)</td>
</tr>
<tr>
<td>适用场景</td>
<td>超长文档(&gt;100K)</td>
<td>中等长度(4K-128K)</td>
<td>中等至长长度</td>
</tr>
</tbody></table>
<p>LLMxMapReduce 的优势在「极端长度」场景(&gt;100K tokens)中最为明显。对于 32K 以内的长度，RoPE 插值或 NTK-aware 方案可能更简单有效，因为它们不需要额外的分块和聚合逻辑。但当长度达到 100K 甚至 1M 时，O(n^2) 的注意力计算和线性增长的 KV Cache 会使标准方法在端侧完全不可行，此时 MapReduce 的 O(n) 复杂度成为唯一可行的工程路径。</p>
<h3 id="3-4-gcldtz">3.4 工程落地挑战</h3>
<h4 id="tzy-jhxxss">挑战一: 聚合信息损失</h4>
<p>MapReduce 的核心假设是「局部处理后可以通过聚合还原全局理解」。但对于需要细粒度跨段落关联的任务(如「比较文档第 3 章和第 15 章的观点差异」)，聚合层是否能保留足够的信息？如果聚合只是简单的加权平均或拼接，复杂的多段关联可能会被稀释。</p>
<h4 id="tze-qfbjxy">挑战二: 切分边界效应</h4>
<p>固定长度切分可能导致关键信息被分割到两个片段中。例如，一个完整的句子「该公司 2024 年营收为 100 亿元，同比增长 20%」如果在「100 亿」处被切断，Map 阶段处理前半段的模型只能看到「营收为 100」，而处理后半段的模型只能看到「亿元，同比增长 20%」，两者都无法独立理解完整语义。</p>
<p>解决方案包括: (1) <strong>重叠切分</strong>——相邻片段之间有重叠区域(如各重叠 512 tokens)，确保边界信息不被遗漏; (2) <strong>语义切分</strong>——以段落、句子或语义单元为边界进行切分，而非固定长度; (3) <strong>边界标记</strong>——在片段开头和结尾添加特殊标记，提示模型注意边界处的上下文不完整性。</p>
<h4 id="tzs-ycyjhty">挑战三: 延迟与交互体验</h4>
<p>MapReduce 的并行化处理虽然降低了单次推理的显存峰值，但增加了总体计算量(因为每个片段都需要完整的前向传播)。对于实时交互场景(如用户输入一个问题，模型需要在 1 秒内回答)，串行处理多个片段的延迟可能 unacceptable。虽然 Map 阶段可以并行，但 Reduce 和生成阶段通常需要等待所有 Map 完成，这引入了一个同步点。</p>
<p>在端侧设备上，由于 GPU 并行度有限，「理论上并行」不等于「实际上并行」。一个片段的推理可能需要数十到数百毫秒，处理 10 个片段的 Map 阶段可能需要数秒时间，这对于聊天场景是不可接受的。因此，LLMxMapReduce 更适合「离线批处理」场景(如一次性总结一本电子书)，而非「实时对话」场景。</p>
<hr>
<h2 id="s-rag-tjddcbsjg">四、RAG 套件的端侧部署架构</h2>
<p>MiniCPM3-4B 的 RAG 三件套(MiniCPM-Embedding、MiniCPM-Reranker、MiniCPM3-RAG-LoRA)为端侧知识库应用提供了完整的工程方案。</p>
<h3 id="4-1-lxsyjd">4.1 离线索引阶段</h3>
<ol>
<li>用户将本地文档(PDF、Word、Markdown 等)导入系统。</li>
<li>MiniCPM-Embedding 将文档切分为片段(如每 512 tokens 一段)，并为每个片段生成稠密向量表示(Embedding)。</li>
<li>片段的 Embedding 存入本地向量数据库(如 FAISS、Milvus Lite 或 Chroma)。</li>
<li>可选: MiniCPM-Reranker 对索引数据进行预排序优化(通常用于提升检索质量)。</li>
</ol>
<p>这一阶段完全离线执行，只需在文档新增或更新时运行。Embedding 模型通常比生成模型小得多(如 100M-300M 参数)，在端侧 CPU 上即可高效运行。</p>
<h3 id="4-2-zxcxjd">4.2 在线查询阶段</h3>
<ol>
<li>用户输入查询(query)。</li>
<li>MiniCPM-Embedding 将查询编码为向量。</li>
<li>向量数据库执行近似最近邻(ANN)搜索，返回 top-k 个最相关的文档片段。</li>
<li>MiniCPM-Reranker 对这 k 个候选片段进行精排，进一步提升相关性。</li>
<li>MiniCPM3-RAG-LoRA(基于 MiniCPM3-4B 的 LoRA 微调版本)将查询和检索到的片段拼接为上下文，生成最终回答。</li>
</ol>
<blockquote>
<p>译者注: 这个架构设计非常符合端侧场景的约束。关键洞察是「检索和生成解耦」——检索阶段(Embedding + Reranker)可以在用户输入查询时实时执行，而索引构建(最耗时的部分)完全离线。生成阶段只加载 4B 模型+LoRA 权重，LoRA 的额外参数量通常只有原模型的 0.1%-1%(约 4M-40M)，对推理延迟和显存的影响微乎其微。另一个值得注意的设计是「中文检索 SOTA」——大多数开源 Embedding 模型在英文上表现良好但在中文上欠佳，MiniCPM-Embedding 针对中文做了专门优化，这对于中文用户是一个重要的差异化优势。</p>
</blockquote>
<hr>
<h2 id="w-sjyycj">五、实际应用场景</h2>
<h3 id="5-1-dcgrzl">5.1 端侧个人助理</h3>
<p>结合 Function Calling 和本地工具，MiniCPM3-4B 可以实现: 查询本地日历并创建事件、读取通讯录并发送消息、调用天气 API 获取 forecast、控制智能家居设备等。所有处理都在本地完成，无需联网，保护用户隐私。</p>
<h3 id="5-2-lxwdwd">5.2 离线文档问答</h3>
<p>通过 RAG 套件，用户可以将数千页的本地文档(如法律合同、技术手册、论文集)构建为本地知识库。即使在没有网络的环境下，也能对文档进行深度问答、摘要和跨文档关联分析。</p>
<h3 id="5-3-dmfzkf">5.3 代码辅助开发</h3>
<p>Code Interpreter 能力使 MiniCPM3-4B 成为开发者的离线编程助手。它可以生成代码、执行测试、分析错误日志、进行数据处理和可视化——所有操作在本地沙箱中完成，无需担心代码泄露到云端。</p>
<hr>
<h2 id="l-jxywlfx">六、局限与未来方向</h2>
<h3 id="6-1-yzjx">6.1 已知局限</h3>
<ol>
<li><p><strong>Function Calling 的泛化性</strong>: MiniCPM3-4B 在 BFCL 上表现优异，但 BFCL 的测试工具相对标准化。在真实场景中，用户可能使用各种非标准 API 或自定义工具，模型的泛化能力有待验证。</p>
</li>
<li><p><strong>LLMxMapReduce 的引用精度</strong>: 对于需要精确引用原文位置的任务，分块处理后的聚合机制可能丢失细粒度的位置信息。</p>
</li>
<li><p><strong>多语言覆盖</strong>: 虽然 MiniCPM3-4B 在中英文上表现突出，但在其他语言(如日语、韩语、阿拉伯语)上的能力可能弱于通用多语言模型。</p>
</li>
</ol>
<h3 id="6-2-hxyj">6.2 后续演进</h3>
<p>MiniCPM3-4B 的技术路线直接影响了后续 MiniCPM4(2025.06)和 MiniCPM4.1(2025.09)系列。第四代模型在保持端侧友好的同时，引入了稀疏注意力(InfLLM v2)和混合推理模式(可切换思考/非思考模式)，将端侧模型的能力边界进一步扩展。MiniCPM3-4B 验证的「小模型+Agent 能力」范式已成为面壁智能后续产品的核心设计哲学。</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-hxgs">A. 核心公式</h3>
<p><strong>自注意力计算复杂度</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>FLOPs</mtext><mtext>attention</mtext></msub><mo>=</mo><mn>2</mn><mo>×</mo><msup><mi>n</mi><mn>2</mn></msup><mo>×</mo><msub><mi>d</mi><mtext>head</mtext></msub><mo>×</mo><mi>h</mi></mrow><annotation encoding="application/x-tex">\\text{FLOPs}_{\\text{attention}} = 2 \\times n^2 \\times d_{\\text{head}} \\times h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOPs</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">attention</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9474em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 为序列长度，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mtext>head</mtext></msub></mrow><annotation encoding="application/x-tex">d_{\\text{head}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为每个注意力头的维度，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span> 为注意力头数。当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 从 4K 增加到 128K 时，FLOPs 增长 1,024 倍。</p>
<p><strong>MapReduce 分块后的复杂度</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>FLOPs</mtext><mtext>MapReduce</mtext></msub><mo>=</mo><mfrac><mi>n</mi><mi>k</mi></mfrac><mo>×</mo><mn>2</mn><mo>×</mo><msup><mi>k</mi><mn>2</mn></msup><mo>×</mo><msub><mi>d</mi><mtext>head</mtext></msub><mo>×</mo><mi>h</mi><mo>+</mo><msub><mtext>FLOPs</mtext><mtext>reduce</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{FLOPs}_{\\text{MapReduce}} = \\frac{n}{k} \\times 2 \\times k^2 \\times d_{\\text{head}} \\times h + \\text{FLOPs}_{\\text{reduce}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOPs</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MapReduce</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.7936em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9474em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">FLOPs</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reduce</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 为每个片段的长度，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mi mathvariant="normal">/</mi><mi>k</mi></mrow><annotation encoding="application/x-tex">n/k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">n</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 为片段数量。第一项为 Map 阶段总 FLOPs，第二项为 Reduce 阶段开销。当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>≪</mo><mi>n</mi></mrow><annotation encoding="application/x-tex">k \\ll n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 时，整体复杂度从 O(n^2) 降至 O(nk)。</p>
<p><strong>LoRA 低秩适配</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>h</mi><mo>=</mo><msub><mi>W</mi><mn>0</mn></msub><mi>x</mi><mo>+</mo><mi mathvariant="normal">Δ</mi><mi>W</mi><mi>x</mi><mo>=</mo><msub><mi>W</mi><mn>0</mn></msub><mi>x</mi><mo>+</mo><mi>B</mi><mi>A</mi><mi>x</mi></mrow><annotation encoding="application/x-tex">h = W_0 x + \\Delta W x = W_0 x + B A x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mord mathnormal">A</span><span class="mord mathnormal">x</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">W_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为预训练权重(frozen)，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>d</mi><mo>×</mo><mi>r</mi></mrow></msup></mrow><annotation encoding="application/x-tex">B \\in \\mathbb{R}^{d \\times r}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span></span></span></span></span></span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>r</mi><mo>×</mo><mi>k</mi></mrow></msup></mrow><annotation encoding="application/x-tex">A \\in \\mathbb{R}^{r \\times k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">A</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span></span></span></span></span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>r</mi><mo>≪</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>d</mi><mo separator="true">,</mo><mi>k</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r \\ll \\min(d, k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span></span>。训练时只更新 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span>，参数量从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mo>×</mo><mi>k</mi></mrow><annotation encoding="application/x-tex">d \\times k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>r</mi><mo>×</mo><mo stretchy="false">(</mo><mi>d</mi><mo>+</mo><mi>k</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r \\times (d + k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span></span>。</p>
<h3 id="b-syb">B. 术语表</h3>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>Function Calling</td>
<td>函数调用</td>
<td>模型将自然语言转换为结构化 API 调用的能力</td>
</tr>
<tr>
<td>Code Interpreter</td>
<td>代码解释器</td>
<td>模型生成并执行代码的能力</td>
</tr>
<tr>
<td>RAG</td>
<td>检索增强生成</td>
<td>结合外部知识检索的生成框架</td>
</tr>
<tr>
<td>LoRA</td>
<td>低秩适配</td>
<td>参数高效的微调方法</td>
</tr>
<tr>
<td>KV Cache</td>
<td>键值缓存</td>
<td>推理时存储的键值对，避免重复计算</td>
</tr>
<tr>
<td>Embedding</td>
<td>嵌入/向量表示</td>
<td>将文本映射为稠密向量的表示方法</td>
</tr>
<tr>
<td>Reranker</td>
<td>重排序器</td>
<td>对检索候选进行精排的模型</td>
</tr>
<tr>
<td>BFCL</td>
<td>Berkeley Function-Calling Leaderboard</td>
<td>函数调用能力评测基准</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>在标注数据上的有监督训练</td>
</tr>
<tr>
<td>ANN</td>
<td>近似最近邻</td>
<td>高效向量检索算法</td>
</tr>
<tr>
<td>FAISS</td>
<td>-</td>
<td>Meta 开源的向量检索库</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 Chapter 14 精读系列 D5 交付物，知识库同步版本见 <code>docs/sections/llm-guide/5-主流模型全解/5.2-国内大模型/面壁智能-MiniCPM/05-MiniCPM3-4B-端侧工具调用与无限长文本处理.md</code>。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-bj-dc-ai-c-ltgj-d-znt-dyq","text":"一、背景: 端侧 AI 从「聊天工具」到「智能体」的跃迁"},{"level":2,"id":"e-dc-function-calling-dgcsx","text":"二、端侧 Function Calling 的工程实现"},{"level":3,"id":"2-1-function-calling-djsyl","text":"2.1 Function Calling 的技术原理"},{"level":3,"id":"2-2-dc-function-calling-ddttz","text":"2.2 端侧 Function Calling 的独特挑战"},{"level":4,"id":"tzy-gjmsdsxwzy","text":"挑战一: 工具描述的上下文占用"},{"level":4,"id":"tze-json-schema-djqzx","text":"挑战二: JSON Schema 的精确遵循"},{"level":4,"id":"tzs-dlgjtydbp","text":"挑战三: 多轮工具调用的编排"},{"level":3,"id":"2-3-yjpddb","text":"2.3 与竞品的对比"},{"level":2,"id":"s-ll-mx-map-reduce-wxcwbdgccx","text":"三、LLMxMapReduce: 无限长文本的工程创新"},{"level":3,"id":"3-1-transformer-cwbdpj","text":"3.1 Transformer 长文本的瓶颈"},{"level":3,"id":"3-2-ll-mx-map-reduce-dsjyl","text":"3.2 LLMxMapReduce 的设计原理"},{"level":3,"id":"3-3-ybzcwbjsddb","text":"3.3 与标准长文本技术的对比"},{"level":3,"id":"3-4-gcldtz","text":"3.4 工程落地挑战"},{"level":4,"id":"tzy-jhxxss","text":"挑战一: 聚合信息损失"},{"level":4,"id":"tze-qfbjxy","text":"挑战二: 切分边界效应"},{"level":4,"id":"tzs-ycyjhty","text":"挑战三: 延迟与交互体验"},{"level":2,"id":"s-rag-tjddcbsjg","text":"四、RAG 套件的端侧部署架构"},{"level":3,"id":"4-1-lxsyjd","text":"4.1 离线索引阶段"},{"level":3,"id":"4-2-zxcxjd","text":"4.2 在线查询阶段"},{"level":2,"id":"w-sjyycj","text":"五、实际应用场景"},{"level":3,"id":"5-1-dcgrzl","text":"5.1 端侧个人助理"},{"level":3,"id":"5-2-lxwdwd","text":"5.2 离线文档问答"},{"level":3,"id":"5-3-dmfzkf","text":"5.3 代码辅助开发"},{"level":2,"id":"l-jxywlfx","text":"六、局限与未来方向"},{"level":3,"id":"6-1-yzjx","text":"6.1 已知局限"},{"level":3,"id":"6-2-hxyj","text":"6.2 后续演进"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-hxgs","text":"A. 核心公式"},{"level":3,"id":"b-syb","text":"B. 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/10-mini-cpm3-4b/05-mini-cpm3-4b-dcgjtyywxcwbcl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/10-mini-cpm3-4b/05-mini-cpm3-4b-dcgjtyywxcwbcl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM3-4B: 端侧工具调用与无限长文本处理</h1>
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
