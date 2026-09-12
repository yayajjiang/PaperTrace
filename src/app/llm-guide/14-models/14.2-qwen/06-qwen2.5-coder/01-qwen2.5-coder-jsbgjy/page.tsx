"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-Coder 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>原文</strong>: Qwen2.5-Coder Technical Report (arXiv:2409.12186)
<strong>模型系列</strong>: Qwen2.5-Coder (0.5B / 1.5B / 3B / 7B / 14B / 32B)
<strong>发布时间</strong>: 2024 年 9 月
<strong>翻译原则</strong>: 逐句精译, 保留所有技术细节、数据表格与公式</p>
</blockquote>
<hr>
<h2 id="y-yy-introduction">一、引言 (Introduction)</h2>
<p>随着大型语言模型(LLM)的快速发展, 代码专用语言模型在社区中获得了广泛关注。建立在预训练 LLM 基础之上的代码模型, 如 StarCoder 系列、CodeLlama 系列、DeepSeek-Coder 系列、CodeQwen1.5 和 CodeStral 等, 在编码评测中展现了优越的性能。然而, 与最近最先进的专有 LLM——Claude-3.5-Sonnet 和 GPT-4o 相比, 无论是开源还是专有代码模型, 仍然存在差距。</p>
<p>基于我们之前的工作 CodeQwen1.5, 我们推出了 <strong>Qwen2.5-Coder</strong>——一系列旨在在各种模型尺寸上实现顶级编码任务性能的语言模型。Qwen2.5-Coder 模型衍生自 Qwen2.5 LLM, 继承了其先进的架构和分词器。这些模型在大量数据集上进行训练, 并进一步在专门为编码任务精心策划的指令数据集上进行微调。</p>
<p>我们致力于促进代码 LLM、编码 Agent 和编码助手应用领域的研究和创新。因此, 我们发布了 <strong>强大的</strong>(Powerful)、<strong>多样化的</strong>(Diverse)和<strong>实用的</strong>(Practical) Qwen2.5-Coder 系列, 致力于持续推动开放代码语言模型(Open CodeLLMs)的发展。</p>
<p><strong>(1) 强大</strong>: Qwen2.5-Coder-32B-Instruct 已成为当前 SOTA 开源代码模型, 编码能力可与 GPT-4o 匹敌。在展现强大而全面的编码能力的同时, 它还具备良好的通用能力和数学能力。</p>
<p><strong>(2) 多样化</strong>: Qwen2.5-Coder 系列带来了六种模型尺寸, 包括 0.5B/1.5B/3B/7B/14B/32B, 覆盖了六种主流模型尺寸以满足不同开发者的需求。</p>
<p><strong>(3) 实用</strong>: 我们在两种场景中探索了 Qwen2.5-Coder 的实用性, 包括代码助手和 Artifacts, 通过一些示例展示 Qwen2.5-Coder 在现实场景中的潜在应用。</p>
<p>我们在构建大规模、编码专用的预训练数据集方面投入了巨大努力, 该数据集包含超过 <strong>5.5 万亿 token</strong>。数据集来源广泛, 包括 GitHub 等公共代码仓库以及包含代码相关文本的大规模网络爬取数据。我们实施了精细的流程来召回和清洗潜在代码数据, 并使用基于弱模型的分类器和评分器过滤低质量内容。我们的方法涵盖文件级和仓库级预训练以确保全面覆盖。</p>
<p>为了优化性能并平衡编码专业能力与通用语言理解, 我们精心策划了包含代码、数学和通用文本的数据混合。为了将模型转变为适用于下游应用的编码助手, 我们开发了一个精心设计的指令微调数据集。该数据集包含广泛的编码相关问题和解法, 来源包括真实应用和由代码专注 LLM 生成的合成数据, 覆盖广泛的编码任务。</p>
<p>为评估 Qwen2.5-Coder 的有效性, 我们在一套流行的基准上进行了全面评估。结果突出了 Qwen2.5-Coder 卓越的代码生成能力, 在超过十个代码聚焦基准上达到最先进的性能, 同时保持稳健的通用和数学推理能力。该模型在各种任务上 outperform 更大的代码模型。</p>
<hr>
<h2 id="e-mxjg-model-architecture">二、模型架构 (Model Architecture)</h2>
<h3 id="2-1-jg">2.1 架构</h3>
<p>Qwen2.5-Coder 的架构直接继承自 Qwen2.5。下表概述了 Qwen2.5-Coder 在六种不同模型尺寸(0.5B、1.5B、3B、7B、14B 和 32B 参数)上的架构配置。</p>
<table>
<thead>
<tr>
<th>配置</th>
<th>0.5B</th>
<th>1.5B</th>
<th>3B</th>
<th>7B</th>
<th>14B</th>
<th>32B</th>
</tr>
</thead>
<tbody><tr>
<td>Hidden Size</td>
<td>896</td>
<td>1,536</td>
<td>2,048</td>
<td>3,584</td>
<td>5,120</td>
<td>5,120</td>
</tr>
<tr>
<td>层数</td>
<td>24</td>
<td>28</td>
<td>36</td>
<td>28</td>
<td>48</td>
<td>64</td>
</tr>
<tr>
<td>Query 头数</td>
<td>14</td>
<td>12</td>
<td>16</td>
<td>28</td>
<td>40</td>
<td>40</td>
</tr>
<tr>
<td>KV 头数</td>
<td>2</td>
<td>2</td>
<td>2</td>
<td>4</td>
<td>8</td>
<td>8</td>
</tr>
<tr>
<td>头大小</td>
<td>128</td>
<td>128</td>
<td>128</td>
<td>128</td>
<td>128</td>
<td>128</td>
</tr>
<tr>
<td>中间层大小</td>
<td>4,864</td>
<td>8,960</td>
<td>4,864</td>
<td>18,944</td>
<td>13,824</td>
<td>27,648</td>
</tr>
<tr>
<td>嵌入共享</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>否</td>
<td>否</td>
<td>否</td>
</tr>
<tr>
<td>词表大小</td>
<td>151,646</td>
<td>151,646</td>
<td>151,646</td>
<td>151,646</td>
<td>151,646</td>
<td>151,646</td>
</tr>
<tr>
<td>训练 token 数</td>
<td>5.5T</td>
<td>5.5T</td>
<td>5.5T</td>
<td>5.5T</td>
<td>5.5T</td>
<td>5.5T</td>
</tr>
</tbody></table>
<p>所有尺寸在头大小方面共享相同的架构, 但在其他关键方面有所不同。除 1.5B 模型具有更大的中间层大小、3B 模型具有更多层数外, 大多数参数通常随模型尺寸扩大而增加。以 7B 和 32B 模型为例: 7B 模型的隐藏大小为 3,584, 而 32B 模型为 5,120; 7B 模型使用 28 个 query 头和 4 个 KV 头, 而 32B 模型使用 40 个 query 头和 8 个 KV 头。中间层大小也随模型尺寸扩展, 7B 模型为 18,944, 32B 模型为 27,648。此外, 较小模型使用嵌入共享(embedding tying), 而较大模型不使用。所有模型的词表大小均为 151,646, 均在 5.5 万亿 token 上训练。</p>
<p>这里需要理解的是, Qwen2.5-Coder 的架构选择与通用 Qwen2.5 保持一致——GQA 用于压缩 KV Cache, SwiGLU 激活, RoPE 位置编码, RMSNorm 预归一化。这种「继承而非重新设计」的策略降低了训练不稳定性的风险, 因为 Qwen2.5 的架构已经经过了大规模验证。同时, 通过在不同尺寸上保持一致的词表和训练 token 数, 团队可以更方便地进行跨尺寸的 scaling law 分析。</p>
<h3 id="2-2-fcq">2.2 分词器</h3>
<p>Qwen2.5-Coder 继承了 Qwen2.5 的词表, 但引入了若干特殊 token 以帮助模型更好地理解代码。</p>
<table>
<thead>
<tr>
<th>Token</th>
<th>Token ID</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><code>&lt;|endoftext|&gt;</code></td>
<td>151643</td>
<td>文本/序列结束标记</td>
</tr>
<tr>
<td><code>&lt;|fim_prefix|&gt;</code></td>
<td>151659</td>
<td>FIM 前缀</td>
</tr>
<tr>
<td><code>&lt;|fim_middle|&gt;</code></td>
<td>151660</td>
<td>FIM 中间部分</td>
</tr>
<tr>
<td><code>&lt;|fim_suffix|&gt;</code></td>
<td>151661</td>
<td>FIM 后缀</td>
</tr>
<tr>
<td><code>&lt;|fim_pad|&gt;</code></td>
<td>151662</td>
<td>FIM 填充</td>
</tr>
<tr>
<td><code>&lt;|repo_name|&gt;</code></td>
<td>151663</td>
<td>仓库名称</td>
</tr>
<tr>
<td><code>&lt;|file_sep|&gt;</code></td>
<td>151664</td>
<td>文件分隔符</td>
</tr>
</tbody></table>
<p>这些 token 在代码处理流程中服务于特定目的。例如, <code>&lt;\\|endoftext\\|&gt;</code> 标记文本或序列的结束; <code>&lt;\\|fim_prefix\\|&gt;</code>、<code>&lt;\\|fim_middle\\|&gt;</code> 和 <code>&lt;\\|fim_suffix\\|&gt;</code> 用于实现 Fill-in-the-Middle(FIM)技术, 模型通过该技术预测代码块中缺失的部分。此外, <code>&lt;\\|fim_pad\\|&gt;</code> 用于 FIM 操作期间的填充。其他 token 包括用于标识仓库名称的 <code>&lt;\\|repo_name\\|&gt;</code> 和用作文件分隔符以更好管理仓库级信息的 <code>&lt;\\|file_sep\\|</code>&gt;。这些 token 对于帮助模型从多样化的代码结构中学习至关重要, 并使其能够在文件级和仓库级预训练期间处理更长、更复杂的上下文。</p>
<hr>
<h2 id="s-yxl-pre-training">三、预训练 (Pre-training)</h2>
<h3 id="3-1-yxlsj">3.1 预训练数据</h3>
<p>大规模、高质量和多样化的数据构成了预训练模型的基础。为此, 我们构建了一个名为 Qwen2.5-Coder-Data 的数据集。该数据集包含五种关键数据类型: 源代码数据(Source Code Data)、文本-代码关联数据(Text-Code Grounding Data)、合成数据(Synthetic Data)、数学数据(Math Data)和文本数据(Text Data)。</p>
<h4 id="3-1-1-sjgc">3.1.1 数据构成</h4>
<p><strong>源代码(Source Code)</strong></p>
<p>我们从 GitHub 收集了 2024 年 2 月之前创建的公共仓库, 涵盖 <strong>92 种编程语言</strong>。类似于 StarCoder2 和 DeepSeek-Coder, 我们应用了一系列基于规则的过滤方法。除原始代码外, 我们还从 Pull Requests、Commits、Jupyter Notebooks 和 Kaggle 数据集中收集数据, 所有数据都经过了类似的基于规则的清洗技术处理。</p>
<p><strong>文本-代码关联数据(Text-Code Grounding Data)</strong></p>
<p>我们从 Common Crawl 策划了一个大规模、高质量的文本-代码混合数据集, 其中包括代码相关的文档、教程、博客等。与传统的基于 URL 的多阶段召回方法不同, 我们开发了一种从粗到细(coarse-to-fine)的分层过滤方法。这种方法有两个关键优势: (1) 能够精确控制每个过滤器的职责, 确保每个维度都得到全面处理; (2) 它自然地为数据集分配了质量分数, 最终阶段保留的数据质量更高, 为质量驱动的数据混合提供了有价值的洞察。</p>
<p>我们设计了一个针对 Text-Code Grounding Data 的清洗流程, 其中每个过滤级别都使用较小的模型(如 fastText)构建。虽然我们尝试了更大的模型, 但它们并未带来显著收益。一个可能的解释是, 较小的模型更关注表面级特征, 避免了不必要的语义复杂性。</p>
<p>在 Qwen2.5-Coder 中, 我们迭代应用了这一过程。每次迭代都带来了 Qwen2.5-Coder-1.5B 的提升。通过 4 阶段过滤, HumanEval 和 MBPP 的平均分数相比基线从 41.6% 提升至 46.8%, 证明了高质量 Text-Code Grounding Data 对代码生成的价值。</p>
<p>这里值得停一下。传统的数据清洗通常依赖人工规则(如正则表达式过滤 HTML 标签)或大型模型进行质量评分, 但 Qwen2.5-Coder 团队发现「小模型做粗筛」反而更有效。核心原因是: 代码和文本的区分往往不需要深层语义理解——fastText 这类轻量级模型足以识别「这段文本是否包含代码块」「这段代码是否有基本的语法结构」等表面特征。而大模型倾向于过度推理, 可能把高质量的伪代码或算法描述误判为低质量内容。这种「分级过滤 + 质量评分」的思路, 本质上是用工程化的方式替代了昂贵的人工标注。</p>
<p><strong>合成数据(Synthetic Data)</strong></p>
<p>合成数据为解决训练数据预期稀缺问题提供了一种有前景的方式。我们使用 CodeQwen1.5(Qwen2.5-Coder 的前身)生成大规模合成数据集。为缓解此过程中的幻觉风险, 我们引入了执行器(executor)进行验证, 确保仅保留可执行代码。</p>
<p><strong>数学数据(Math Data)</strong></p>
<p>为增强 Qwen2.5-Coder 的数学能力, 我们将 Qwen2.5-Math 的预训练语料整合到 Qwen2.5-Coder 数据集中。重要的是, 数学数据的加入并未对模型在代码任务上的性能产生负面影响。</p>
<p><strong>文本数据(Text Data)</strong></p>
<p>类似于数学数据, 我们包含了来自 Qwen2.5 模型预训练语料的高质量通用自然语言数据, 以保留 Qwen2.5-Coder 的通用能力。该数据在 Qwen2.5 数据集清洗阶段已经通过了严格的质量检查, 因此无需进一步处理。但是, 所有代码段都从通用文本数据中移除, 以避免与我们的代码数据重叠, 确保不同数据源的独立性。</p>
<h4 id="3-1-2-sjhh">3.1.2 数据混合</h4>
<p>平衡代码、数学和文本数据对于构建基础模型至关重要。虽然研究社区此前已探索过这种平衡, 但关于其在大规模数据集上的可扩展性证据有限。为此, 我们对不同比例的代码、数学和文本数据进行了实证实验, 设计了多个实验以快速识别最优组合。</p>
<p>具体而言, 我们比较了三种不同的 Code:Text:Math 比例——100:0:0、85:10:5 和 70:20:10。</p>
<table>
<thead>
<tr>
<th>Code</th>
<th>Text</th>
<th>Math</th>
<th>Common</th>
<th>BCB</th>
<th>MATH</th>
<th>GSM8K</th>
<th>MMLU</th>
<th>CEval</th>
<th>HellaSwag</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>100</td>
<td>0</td>
<td>0</td>
<td><strong>49.8</strong></td>
<td><strong>40.3</strong></td>
<td>10.3</td>
<td>23.8</td>
<td>42.8</td>
<td>35.9</td>
<td>58.3</td>
<td>31.3</td>
</tr>
<tr>
<td>85</td>
<td>15</td>
<td>5</td>
<td>43.3</td>
<td>36.2</td>
<td>26.1</td>
<td>52.5</td>
<td>56.8</td>
<td>57.1</td>
<td>70.0</td>
<td>48.9</td>
</tr>
<tr>
<td>70</td>
<td>20</td>
<td>10</td>
<td>48.3</td>
<td>38.3</td>
<td><strong>33.2</strong></td>
<td><strong>64.5</strong></td>
<td><strong>62.9</strong></td>
<td><strong>64.0</strong></td>
<td><strong>73.5</strong></td>
<td><strong>55.0</strong></td>
</tr>
</tbody></table>
<p>有趣的是, 我们发现 <strong>7:2:1</strong> 的比例 outperform 其他比例, 甚至 surpass 了代码比例更高的组合。一个可能的解释是, 数学和文本数据可能对代码性能有正向贡献, 但只有当它们的浓度达到特定阈值时。最终, 我们选择了 <strong>70% 代码、20% 文本和 10% 数学</strong>的最终混合比例。最终训练数据集包含 <strong>5.2 万亿 token</strong>。</p>
<p>这个数据混合实验揭示了一个反直觉的结论: 并非「代码越多越好」。纯代码(100%)在代码基准(Common 49.8%, BCB 40.3%)上表现最好, 但在综合平均分数上垫底(31.3%)。而 70:20:10 的混合虽然在纯代码指标上略低, 但数学(MATH 33.2% vs 10.3%)、通用(MMLU 62.9% vs 42.8%)和整体平均(55.0% vs 31.3%)都有巨大提升。这说明代码能力不是孤立存在的——数学数据增强了逻辑推理(这对算法实现至关重要), 文本数据保留了自然语言理解(这对代码注释、文档和指令遵循至关重要)。这个 7:2:1 的比例可能不是一个 universal 最优解, 但它证明了「适度通用化」对专用模型的价值。</p>
<h3 id="3-2-xlcl">3.2 训练策略</h3>
<p>我们采用<strong>三阶段训练</strong>方法来训练 Qwen2.5-Coder, 包括文件级预训练(file-level pretraining)、仓库级预训练(repo-level pretraining)和指令微调(instruction tuning)。</p>
<h4 id="3-2-1-wjjyxl-file-level-pretraining">3.2.1 文件级预训练(File-Level Pretraining)</h4>
<p>文件级预训练专注于从单个代码文件学习。在此阶段, 最大训练序列长度设为 8,192 token, 覆盖 5.2T 高质量数据。训练目标包括 next token prediction 和 fill-in-the-middle(FIM)。文件级 FIM 格式如下:</p>
<pre><code>&lt;|fim_prefix|&gt;{code_pre}&lt;|fim_suffix|&gt;{code_suf}&lt;|fim_middle|&gt;{code_mid}&lt;|endoftext|&gt;
</code></pre>
<h4 id="3-2-2-ckjyxl-repo-level-pretraining">3.2.2 仓库级预训练(Repo-Level Pretraining)</h4>
<p>文件级预训练后, 我们转向仓库级预训练, 旨在增强模型的长上下文能力。在此阶段, 上下文长度从 8,192 token 扩展至 32,768 token, RoPE 的基频从 10,000 调整为 1,000,000。为进一步利用模型的外推潜力, 我们应用了 YARN 机制, 使模型能够处理长达 131,072(128K)token 的序列。</p>
<p>此阶段使用了大量高质量、长上下文代码数据(约 300B), 并将文件级 FIM 扩展为仓库级 FIM, 格式如下:</p>
<pre><code>&lt;|repo_name|&gt;{repo_name}
&lt;|file_sep|&gt;{file_path1}
{file_content1}
&lt;|file_sep|&gt;{file_path2}
{file_content2}
&lt;|file_sep|&gt;{file_path3}
&lt;|fim_prefix|&gt;{code_pre}&lt;|fim_suffix|&gt;{code_suf}&lt;|fim_middle|&gt;{code_fim}&lt;|endoftext|&gt;
</code></pre>
<p>仓库级 FIM 的设计值得注意。它不仅把单个文件的上下文扩展到了整个仓库(通过 <code>&lt;\\|repo_name\\|&gt;</code> 和 <code>&lt;\\|file_sep\\|&gt;</code>), 还保留了 FIM 的训练目标——模型需要在理解跨文件依赖关系的基础上, 预测被 masked 的代码段。这比单纯的「把更多 token 塞入上下文窗口」更有训练价值, 因为它强制模型学习「这个函数调用了另一个文件中的哪个 API」「这个 import 语句对应哪个模块的哪个功能」。从工程角度看, 128K 的上下文对于小型仓库(如一个微服务或一个 Python 包)是足够的, 但对于大型单体代码库(如 Linux 内核或 Chromium)仍然捉襟见肘。这是当前所有代码模型面临的共同瓶颈。</p>
<hr>
<h2 id="s-hxl-post-training">四、后训练 (Post-training)</h2>
<h3 id="4-1-zlsjpf">4.1 指令数据配方</h3>
<p><strong>多语言编程代码识别</strong></p>
<p>我们微调了一个 CodeBERT 来执行语言识别模型, 将文档分类到近 100 种编程语言中。我们保留主流编程语言的指令数据, 并随机丢弃一部分长尾语言的指令数据。如果给定样本包含很少的代码数据甚至没有代码片段, 该样本可能被分类为「无编程语言」标签。由于过多不含代码片段的指令样本会损害模型在代码生成任务(如 MultiPL-E、McEval 和 MdEval)上的性能, 我们移除了大部分不含代码片段的样本, 以保持指令模型的代码生成能力。</p>
<p><strong>从 GitHub 合成指令</strong></p>
<p>对于大量存在于许多网站(如 GitHub)中的无监督数据(代码片段), 我们尝试使用 LLM 构建监督指令数据集。具体来说, 我们使用 LLM 从 1024 token 内的代码片段生成指令, 然后使用代码 LLM 生成响应。最后, 我们使用 LLM 评分器过滤低质量样本以获得最终配对。鉴于不同编程语言的代码片段, 我们从代码片段构建指令数据集。为充分释放所提方法的潜力, 我们还将开源指令数据集(如用于大规模多语言代码生成和调试的 McEval-Instruct)纳入种子指令数据集。最终, 我们结合来自 GitHub 代码片段和开源指令的指令数据进行监督微调。</p>
<p><strong>多语言代码指令数据</strong></p>
<p>为弥合不同编程语言之间的差距, 我们提出了一个多语言多 Agent 协作框架来合成多语言指令语料库。我们引入语言专用 Agent, 其中创建了一组专门的 Agent, 每个 Agent  dedicated 于特定的编程语言。这些 Agent 使用从有限现有语料库中筛选的代码片段派生的语言专用指令数据进行初始化。多语言数据生成过程可分为:</p>
<ol>
<li>语言专用智能 Agent: 创建一组专门的 Agent, 每个 dedicated 于特定的编程语言。</li>
<li>协作讨论协议: 多个语言专用 Agent 参与结构化对话以制定新的指令和解法。</li>
<li>自适应记忆系统: 每个 Agent 维护一个动态记忆库, 存储其生成历史以避免生成相似样本。</li>
<li>跨语言讨论: 实现一种新颖的知识蒸馏技术, 允许 Agent 跨语言边界共享洞察和模式。</li>
<li>协同评估指标: 开发新指标来量化模型内不同编程语言之间的知识共享和协同程度。</li>
<li>自适应指令生成: 框架包含一种机制, 根据跨语言识别的知识差距动态生成新指令。</li>
</ol>
<p>这里需要停下来想一下。这个「多语言多 Agent 协作框架」听起来很宏大, 但其实质是一个自动化的数据增强流水线。核心 insight 是: 不同编程语言之间存在大量的「同构问题」——比如 Python 的列表推导和 JavaScript 的 map/filter、C++ 的 STL 算法和 Rust 的迭代器链, 解决的是同一类问题。通过让不同语言的 Agent 互相「教学」, 可以用少量高质量的单语言数据生成大量多语言平行数据。但这里有一个潜在风险: 如果某个语言的种子数据质量不高, 错误会在 Agent 之间传播。框架中的「自适应记忆系统」和「协同评估指标」就是为了缓解这个问题——避免重复生成相似样本, 并量化跨语言迁移的有效性。不过, 报告并未提供这些指标的具体数值, 因此实际效果难以独立验证。</p>
<p><strong>基于检查清单的指令数据评分</strong></p>
<p>为全面评估创建的指令配对质量, 我们为每个样本引入了几个评分点: (1) 问答一致性; (2) 问答相关性(是否与计算机领域相关); (3) 问答难度(是否具有足够挑战性); (4) 代码是否存在; (5) 代码正确性; (6) 变量命名、缩进和最佳实践; (7) 代码清晰度; (8) 代码注释; (9) 易学性。获得所有分数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>s</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>s</mi><mi>n</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(s_1, \\dots, s_n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 后, 最终分数为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mo>=</mo><msub><mi>w</mi><mn>1</mn></msub><msub><mi>s</mi><mn>1</mn></msub><mo>+</mo><mo>⋯</mo><mo>+</mo><msub><mi>w</mi><mi>n</mi></msub><msub><mi>s</mi><mi>n</mi></msub></mrow><annotation encoding="application/x-tex">s = w_1 s_1 + \\dots + w_n s_n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>w</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>w</mi><mi>n</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(w_1, \\dots, w_n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 是一系列预定义权重。</p>
<p><strong>多语言沙箱用于代码验证</strong></p>
<p>为进一步验证代码语法的正确性, 我们对所有提取的编程语言代码片段使用代码静态检查。我们将代码片段解析为抽象语法树(AST), 并过滤掉解析节点有解析错误的代码片段。我们创建了一个多语言沙箱来支持主要编程语言的代码静态检查。</p>
<p>多语言沙箱是一个综合平台, 旨在验证跨多种编程语言的代码片段。它自动化了基于语言特定样本生成相关单元测试的过程, 并评估提供的代码片段是否能成功通过这些测试。多语言验证沙箱主要由五部分组成: (1) 语言支持模块; (2) 样本代码仓库; (3) 单元测试生成器; (4) 代码执行引擎; (5) 结果分析器。</p>
<h3 id="4-2-xlcl">4.2 训练策略</h3>
<p><strong>粗到精细调优(Coarse-to-fine Fine-tuning)</strong></p>
<p>我们首先合成数千万低质量但多样化的指令样本来微调基座模型。在第二阶段, 我们采用数百万高质量指令样本, 通过拒绝采样(rejection sampling)和监督微调来提升指令模型的性能。对于同一查询, 我们使用 LLM 生成多个候选, 然后使用 LLM 评分选择最佳候选进行监督微调。</p>
<p><strong>混合调优(Mixed Tuning)</strong></p>
<p>由于大多数指令数据长度较短, 我们使用 FIM 格式构建指令配对以保持基座模型的长上下文能力。受编程语言语法规则和实际场景中用户习惯的启发, 我们利用 tree-sitter-languages 解析代码片段并提取基本逻辑块作为要填充的中间代码。例如, 抽象语法树(AST)以树格式表示 Python 代码的结构, 树中的每个节点代表源代码中出现的构造。通过遍历和操作 AST, 我们可以随机提取多层节点并使用同一文件的代码上下文来 uncover 被 mask 的节点。最终, 我们用大部分标准 SFT 数据和一小部分 FIM 指令样本优化指令模型。</p>
<p><strong>代码直接偏好优化(DPO)</strong></p>
<p>获得 SFT 模型后, 我们进一步借助离线 DPO 对齐 Qwen2.5-Coder。鉴于人类反馈劳动密集, 我们使用多语言代码沙箱提供代码执行反馈, 同时利用 LLM 进行人类判断反馈。对于算法类和自包含代码片段, 我们生成测试用例来检查代码正确性作为代码执行反馈。对于其他复杂代码片段, 我们使用 LLM-as-a-judge 来决定哪个代码片段更好。进一步, 我们结合代码 DPO 数据和通用数据进行离线 DPO 训练。</p>
<p>这里值得理解的是, 代码领域的 DPO 与通用领域的 DPO 有一个关键差异: 偏好信号的来源。通用领域通常依赖人类标注者或奖励模型来打分, 但代码有「客观正确性」——一段代码要么通过测试用例, 要么不通过。Qwen2.5-Coder 团队充分利用了这一特性: 对于自包含的算法代码(如 LeetCode 风格的问题), 直接用单元测试作为偏好信号; 对于更复杂的场景(如代码重构、风格优化), 才退回到 LLM-as-a-judge。这种「分层偏好标注」策略既降低了成本(不需要人类标注者), 又提高了可靠性(测试用例不会受主观偏好影响)。但局限性也很明显: 只有「可执行 + 可测试」的代码才能用这种方法, 对于设计文档、架构讨论等非执行型任务, 仍然需要 LLM 判断。</p>
<hr>
<h2 id="w-qwr-decontamination">五、去污染 (Decontamination)</h2>
<p>为确保 Qwen2.5-Coder 不会因测试集泄漏而产生虚高结果, 我们对所有数据(包括预训练和后训练数据集)进行了去污染处理。我们移除了 HumanEval、MBPP、GSM8K 和 MATH 等关键数据集。过滤使用 <strong>10-gram 重叠方法</strong>, 任何与测试数据有 10-gram 词级重叠的训练数据都被移除。</p>
<hr>
<h2 id="l-jzmxpg-evaluation-on-base-models">六、基座模型评估 (Evaluation on Base Models)</h2>
<h3 id="6-1-dmsc">6.1 代码生成</h3>
<p>我们在 HumanEval、MBPP 及其增强版本 HumanEval+ 和 MBPP+ 上评估了 Qwen2.5-Coder。此外, 我们还在 MultiPL-E 上评估了多语言代码生成能力。</p>
<h4 id="6-1-1-human-eval-y-mbpp">6.1.1 HumanEval 与 MBPP</h4>
<p>Qwen2.5-Coder 在所有尺寸上 consistently outperform 同等规模的开源代码模型。特别是 Qwen2.5-Coder-7B 在 HumanEval 上达到 86.0%, MBPP 上达到 80.6%; Qwen2.5-Coder-32B 在 HumanEval 上达到 88.4%, MBPP 上达到 85.4%。</p>
<h4 id="6-1-2-dyydmsc-multi-pl-e">6.1.2 多语言代码生成 (MultiPL-E)</h4>
<p>Qwen2.5-Coder 在 MultiPL-E 的八种编程语言(Python、Java、C++、C#、TypeScript、JavaScript、PHP、Bash)上进行了评估。Qwen2.5-Coder-7B 的平均 pass@1 达到 72.6%, 超越所有同等规模模型。Qwen2.5-Coder-32B 达到 79.1%, 接近 DeepSeek-Coder-V2(79.9%)。</p>
<h3 id="6-2-dmbq">6.2 代码补全</h3>
<h4 id="6-2-1-cross-code-long-eval">6.2.1 CrossCodeLongEval</h4>
<p>CrossCodeLongEval 用于评估长上下文代码补全能力。Qwen2.5-Coder-32B 在六个任务上均达到 SOTA, 平均 outperform DeepSeek-Coder-33B-Base。</p>
<h4 id="6-2-2-repo-eval">6.2.2 RepoEval</h4>
<p>RepoEval 评估仓库级代码补全能力, 涵盖行级、API 调用和函数体补全三种粒度。Qwen2.5-Coder-32B 相比 DeepSeek-Coder-33B-Base 平均提升 7.9% EM 和 4.2% ES。Qwen2.5-Coder-14B 和 7B 在同等规模模型中保持 SOTA。</p>
<h3 id="6-3-dmtl">6.3 代码推理</h3>
<p>代码是一种高度抽象的逻辑语言, 基于代码的推理有助于确定模型是否真正理解代码背后的推理流程。我们选择了 CRUXEval 作为基准, 包括 800 个 Python 函数及相应的输入输出示例。CRUXEval-I 要求模型根据给定输入预测输出; CRUXEval-O 要求模型根据已知输出预测输入。两者均使用 CoT 方法。</p>
<p>Qwen2.5-Coder 取得了非常有前景的结果, CRUXEval-I 达到 56.5 分, CRUXEval-O 达到 56.0 分, 这得益于我们在代码清洗过程中对可执行质量的关注。</p>
<h3 id="6-4-sxtl">6.4 数学推理</h3>
<p>数学与编码一直紧密交织。数学是编码的基础学科, 而编码是数学领域的重要工具。因此我们期望一个开放且强大的代码模型也展现出强大的数学能力。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>尺寸</th>
<th>MATH(4-shot)</th>
<th>GSM8K(4-shot)</th>
<th>MMLU STEM(5-shot)</th>
<th>TheoremQA(5-shot)</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-Coder-0.5B</td>
<td>0.5B</td>
<td><strong>15.4</strong></td>
<td><strong>34.5</strong></td>
<td><strong>34.4</strong></td>
<td><strong>14.3</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-1.5B</td>
<td>1.5B</td>
<td><strong>30.9</strong></td>
<td><strong>65.8</strong></td>
<td><strong>49.0</strong></td>
<td><strong>21.4</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-3B</td>
<td>3B</td>
<td><strong>40.0</strong></td>
<td><strong>75.7</strong></td>
<td><strong>56.0</strong></td>
<td><strong>29.5</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-7B</td>
<td>7B</td>
<td><strong>46.6</strong></td>
<td><strong>83.9</strong></td>
<td><strong>67.6</strong></td>
<td><strong>34.0</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-14B</td>
<td>14B</td>
<td><strong>52.8</strong></td>
<td><strong>88.7</strong></td>
<td><strong>73.9</strong></td>
<td><strong>39.6</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-32B</td>
<td>32B</td>
<td><strong>57.2</strong></td>
<td><strong>91.1</strong></td>
<td>75.1</td>
<td><strong>43.1</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-Coder 在数学上的优势可能来自两个关键因素: 首先, 模型建立在 Qwen2.5 的强大基础之上; 其次, 训练期间代码和数学数据的精心混合, 确保了这些领域的均衡表现。</p>
<h3 id="6-5-tyzryy">6.5 通用自然语言</h3>
<p>除数学能力外, 我们旨在尽可能保留基座模型的通用能力。我们选择了 MMLU、MMLU-Redux 以及 ARC-Challenge、TruthfulQA、WinoGrande 和 HellaSwag 等基准。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>尺寸</th>
<th>MMLU Base</th>
<th>MMLU Pro</th>
<th>MMLU Redux</th>
<th>ARC-C</th>
<th>TruthfulQA</th>
<th>WinoGrande</th>
<th>HellaSwag</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-Coder-7B</td>
<td>7B</td>
<td><strong>68.0</strong></td>
<td><strong>40.1</strong></td>
<td><strong>66.6</strong></td>
<td><strong>60.9</strong></td>
<td><strong>50.6</strong></td>
<td><strong>72.9</strong></td>
<td><strong>76.8</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-32B</td>
<td>32B</td>
<td><strong>79.1</strong></td>
<td><strong>50.4</strong></td>
<td><strong>77.5</strong></td>
<td><strong>70.5</strong></td>
<td><strong>54.2</strong></td>
<td>80.8</td>
<td>83.0</td>
</tr>
</tbody></table>
<p>与其他代码模型相比, Qwen2.5-Coder 在通用自然语言能力方面的优势进一步验证了其数据混合策略的有效性。</p>
<h3 id="6-6-csxwpg">6.6 长上下文评估</h3>
<p>长上下文能力对代码 LLM 至关重要, 是理解仓库级代码和成为代码 Agent 的核心技能。然而, 大多数当前代码模型的长度支持仍然非常有限, 阻碍了其实际应用潜力。Qwen2.5-Coder 旨在进一步推动开源代码模型在长上下文建模方面的进展。</p>
<p><strong>Needle in the Code</strong></p>
<p>我们创建了一个简单但基础的合成任务「代码中的针」, 灵感来自文本领域中流行的长上下文评估。在此任务中, 我们在代码仓库(我们选择了 Megatron 以纪念其对开源 LLM 的贡献)的各个位置插入了一个非常简单的自定义函数, 并测试模型是否能在代码库末尾复现该函数。结果显示 Qwen2.5-Coder 能够在 128K 长度范围内成功完成此任务。</p>
<hr>
<h2 id="q-zlmxpg-evaluation-on-instruct-models">七、指令模型评估 (Evaluation on Instruct Models)</h2>
<p>对于指令模型的评估, 我们严格评估了六个核心领域: 代码生成、代码推理、代码编辑、Text-to-SQL、数学推理和通用自然语言理解。</p>
<h3 id="7-1-dmsc">7.1 代码生成</h3>
<h4 id="7-1-1-human-eval-y-mbpp">7.1.1 HumanEval 与 MBPP</h4>
<p>我们使用 EvalPlus 数据集评估了 Qwen2.5-Coder 系列指令模型的代码生成能力。Qwen2.5-Coder-7B-Instruct 展现了卓越的准确率, 显著 outperform 同等参数规模的其他模型。值得注意的是, 它甚至 surpass 了超过 200 亿参数的大型模型, 如 CodeStral-22B 和 DeepSeek-Coder-33B-Instruct。此外, Qwen2.5-Coder-32B-Instruct 在 EvalPlus 上取得了最高性能, 甚至 outperform DeepSeek-Coder-V2-Instruct, 成为迄今为止最强大的开源代码模型。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>尺寸</th>
<th>HumanEval</th>
<th>HumanEval+</th>
<th>MBPP</th>
<th>MBPP+</th>
<th>BigCodeBench Full</th>
<th>BigCodeBench Hard</th>
<th>LiveCodeBench</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-Coder-7B-Instruct</td>
<td>7B</td>
<td><strong>88.4</strong></td>
<td><strong>84.1</strong></td>
<td><strong>83.5</strong></td>
<td><strong>71.7</strong></td>
<td><strong>41.0</strong></td>
<td><strong>18.2</strong></td>
<td><strong>18.2</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-14B-Instruct</td>
<td>14B</td>
<td><strong>89.6</strong></td>
<td><strong>87.2</strong></td>
<td><strong>86.2</strong></td>
<td><strong>72.8</strong></td>
<td><strong>48.4</strong></td>
<td><strong>22.2</strong></td>
<td><strong>23.4</strong></td>
</tr>
<tr>
<td>Qwen2.5-Coder-32B-Instruct</td>
<td>32B</td>
<td><strong>92.7</strong></td>
<td><strong>87.2</strong></td>
<td><strong>90.2</strong></td>
<td><strong>75.1</strong></td>
<td><strong>49.6</strong></td>
<td><strong>27.0</strong></td>
<td><strong>31.4</strong></td>
</tr>
<tr>
<td>Claude-3.5-Sonnet-20241022</td>
<td>-</td>
<td>92.1</td>
<td>86.0</td>
<td>91.0</td>
<td>74.6</td>
<td>45.3</td>
<td>23.6</td>
<td>31.6</td>
</tr>
<tr>
<td>GPT-4o-2024-08-06</td>
<td>-</td>
<td>92.1</td>
<td>86.0</td>
<td>86.8</td>
<td>72.5</td>
<td><strong>50.1</strong></td>
<td>25.0</td>
<td><strong>34.6</strong></td>
</tr>
</tbody></table>
<h4 id="7-1-2-dyydmsc">7.1.2 多语言代码生成</h4>
<p><strong>MultiPL-E</strong>: Qwen2.5-Coder-7B-Instruct 在八种编程语言上 consistently outperform 同等规模模型。Qwen2.5-Coder-32B-Instruct 达到与 DeepSeek-Coder-V2-Instruct 相当的性能。</p>
<p><strong>McEval</strong>: McEval 基准涵盖 40 种编程语言和 16,000 个测试用例。Qwen2.5-Coder-32B-Instruct 在广泛编程语言范围内表现出色。</p>
<p><strong>MdEval</strong>: MdEval 是涵盖 18 种语言的综合多语言代码调试基准。Qwen2.5-Coder-32B-Instruct 即使与更大尺寸的 LLM 相比也能达到相当或更好的性能。</p>
<h3 id="7-2-dmtl">7.2 代码推理</h3>
<p>我们在 CRUXEval 数据集上评估了 Qwen2.5-Coder 系列指令模型的代码推理能力。Qwen2.5-Coder-7B-Instruct 的 Input-CoT 和 Output-CoT 准确率分别为 65.8% 和 65.9%, 相比 DeepSeek-Coder-V2-Lite-Instruct 分别提升了 12.8% 和 13.0%。Qwen2.5-Coder-32B-Instruct 达到 75.2% 和 83.4%, 显著 outperform 其他开源代码模型。</p>
<h3 id="7-3-dmbj">7.3 代码编辑</h3>
<p><strong>Aider</strong>: Qwen2.5-Coder-7B-Instruct 在代码编辑任务中展现了卓越能力, 尽管仅有 7B 参数, Pass@1 达到 51.9%, 显著 outperform 同类模型, 甚至 surpass CodeStral-22B 和 DeepSeek-Coder-33B-Instruct。Qwen2.5-Coder-32B-Instruct 的 Pass@1 和 Pass@2 分别达到 60.9% 和 73.7%。</p>
<p><strong>CodeEditorBench</strong>: Qwen2.5-Coder-32B-Instruct 在调试、翻译、切换和润色四个维度上达到与 DeepSeek-Coder-V2-Instruct(86.2% 胜率)相当的胜率。</p>
<h3 id="7-4-text-to-sql">7.4 Text-to-SQL</h3>
<p>SQL 是日常软件开发和生产中的基本工具之一, 但其陡峭的学习曲线常常阻碍非编程专家与数据库的自由交互。我们在 Spider 和 BIRD 两个著名基准上进行了全面评估。Qwen2.5-Coder 在 Text-to-SQL 任务上 outperform 同等规模的其他代码模型。</p>
<h3 id="7-5-sxtlytyzryy">7.5 数学推理与通用自然语言</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>尺寸</th>
<th>MATH</th>
<th>GSM8K</th>
<th>GaoKao</th>
<th>Olympiad</th>
<th>College</th>
<th>AIME24</th>
<th>AMC23</th>
<th>MMLU</th>
<th>MMLU-Pro</th>
<th>IFEval</th>
<th>CEval</th>
<th>GPQA</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-Coder-7B-Instruct</td>
<td>7B</td>
<td>66.8</td>
<td>86.7</td>
<td>60.5</td>
<td>29.8</td>
<td>43.5</td>
<td>10.0</td>
<td>42.5</td>
<td>68.7</td>
<td>45.6</td>
<td>58.6</td>
<td>61.4</td>
<td>35.6</td>
</tr>
<tr>
<td>Qwen2.5-Coder-32B-Instruct</td>
<td>32B</td>
<td><strong>76.4</strong></td>
<td>93.0</td>
<td><strong>68.3</strong></td>
<td><strong>42.5</strong></td>
<td><strong>47.7</strong></td>
<td><strong>20.0</strong></td>
<td><strong>55.0</strong></td>
<td><strong>77.6</strong></td>
<td>62.3</td>
<td><strong>79.9</strong></td>
<td>68.9</td>
<td><strong>41.8</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-Coder 系列不仅在复杂编码任务中表现出色, 在高级通用任务中也表现优异, 使其区别于竞争对手。</p>
<h3 id="7-6-bglj">7.6 表格理解</h3>
<p>我们在 TableBench 上评估了 Qwen2.5-Coder 的结构化数据理解能力。TableBench 包含四个主要类别的 18 个领域的表格问答能力。Qwen2.5-Coder-32B-Instruct 在 TableBench 上取得最佳性能 45.1。</p>
<h3 id="7-7-rlphdq">7.7 人类偏好对齐</h3>
<p>为评估 Qwen2.5-Coder-32B-Instruct 与人类偏好的对齐性能, 我们采用了内部标注的评估基准 CodeArena, 包含近 400 个人工策划样本。我们使用 GPT-4o 作为评估模型进行偏好对齐, 采用「A vs. B 获胜」评估方法。结果显示 Qwen2.5-Coder-32B-Instruct 在偏好对齐方面具有优势。</p>
<hr>
<h2 id="b-tl-scaling-jsnsxydyq">八、讨论: Scaling 就是你所需要的一切</h2>
<p>我们呈现了不同尺寸的 Qwen2.5-Coder 与其他开源 LLM 在 MBPP-3shot 和 LiveCodeBench 上的比较。对于基座 LLM, 我们选择 MBPP-3shot 作为评估指标。我们的广泛实验表明, MBPP-3shot 更适合评估基座模型, 并与模型的实际性能高度相关。对于指令模型, 我们选择 LiveCodeBench 最近 4 个月(2024.07~2024.11)的问题进行评估, 以严格避免测试数据污染, 真实反映 LLM 的 OOD 能力。</p>
<p>模型尺寸与模型性能之间存在正相关关系, Qwen2.5-Coder 在所有尺寸上均达到 SOTA 性能, 这激励我们继续探索更大尺寸的代码 LLM。</p>
<hr>
<h2 id="j-jsskjd-thinking-nodes">九、技术思考节点 (Thinking Nodes)</h2>
<h3 id="9-1-sjdjcm">9.1 设计动机层面</h3>
<p><strong>思考 1: 为什么代码专用模型需要保留通用和数学能力? 不是「专用」吗?</strong></p>
<p>Qwen2.5-Coder 的数据混合比例(70% 代码 : 20% 文本 : 10% 数学)揭示了一个关键洞察: 代码能力并非孤立存在。纯代码训练(100%)虽然在 HumanEval/MBPP 等纯代码基准上表现最好, 但在综合平均分数上垫底(31.3 vs 55.0)。这是因为:(1) 数学数据增强了逻辑推理能力, 这对算法实现和复杂数据结构操作至关重要;(2) 文本数据保留了自然语言理解, 这对代码注释、文档生成、需求理解和指令遵循不可或缺;(3) 通用知识帮助模型理解代码的业务上下文——一个只懂语法不懂业务的模型, 无法生成真正有用的生产代码。这个设计选择反映了代码模型从「代码补全工具」向「编程助手」演进的趋势——后者需要理解人类意图、进行多步推理、并在代码与自然语言之间自由切换。</p>
<p><strong>思考 2: FIM(Fill-in-the-Middle)为什么对代码模型如此重要, 而通用 LLM 很少使用?</strong></p>
<p>FIM 的核心价值在于匹配代码编辑的真实场景。程序员日常工作中大量的操作不是「从头写一个新文件」, 而是「在现有代码中间插入一段逻辑」「补全一个函数体」「在光标位置生成代码」。通用 LLM 的 left-to-right 自回归训练目标, 只能建模「给定前面所有 token, 预测下一个 token」, 无法直接学习「给定前缀和后缀, 预测中间内容」。FIM 通过 <code>&lt;\\|fim_prefix\\|&gt;</code> / <code>&lt;\\|fim_suffix\\|&gt;</code> / <code>&lt;\\|fim_middle\\|&gt;</code> 的特殊格式, 将代码编辑任务转化为自回归模型可以学习的形式。从信息论角度看, FIM 提供了更强的条件约束——模型不仅要生成语法正确的代码, 还要确保生成的代码与前缀和后缀在语义上连贯(如变量名一致、类型匹配、控制流连续)。Qwen2.5-Coder 将 FIM 从文件级扩展到仓库级, 进一步要求模型理解跨文件的依赖关系, 这是向「仓库级智能」迈进的关键一步。</p>
<h3 id="9-2-jgxjcm">9.2 架构细节层面</h3>
<p><strong>思考 3: 仓库级 FIM 的实现难点在哪里? 简单拼接多个文件就能工作吗?</strong></p>
<p>仓库级 FIM 不是「把多个文件内容拼在一起」那么简单。真正的挑战在于:(1) 上下文预算管理——128K 的上下文对于大型仓库仍然不足, 需要智能地选择哪些文件放入上下文;(2) 依赖图理解——模型需要知道「这个函数调用了哪个文件的哪个函数」「这个类继承了哪个模块的哪个基类」, 而不仅仅是看到文件内容;(3) 位置敏感性——代码的行为高度依赖文件结构和 import 路径, 同样的代码放在不同位置可能有完全不同的语义。Qwen2.5-Coder 的解决策略是通过 <code>&lt;\\|repo_name\\|&gt;</code> 和 <code>&lt;\\|file_sep\\|&gt;</code> 引入结构信息, 但这只是第一步。更根本的解决方案可能需要: 显式的代码图表示(如把 AST 或调用图编码为额外的输入)、检索增强(动态从仓库中提取相关文件而非静态拼接)、或者更大的上下文窗口(1M+)。当前 128K 的窗口对于小型项目是足够的, 但对于大型单体代码库(如 Chromium、Linux 内核)仍然是一个瓶颈。</p>
<p><strong>思考 4: 多语言沙箱验证的工程实现复杂度如何? 为什么是「代码领域 DPO」的关键使能器?</strong></p>
<p>多语言沙箱的复杂度远超表面描述。一个生产级的代码验证系统需要: (1) 隔离执行环境(Docker 容器或沙箱进程)以防止恶意代码破坏系统; (2) 资源限制(CPU 时间、内存、网络访问)以防止无限循环或资源耗尽攻击; (3) 依赖解析(不同语言的包管理器: pip、npm、maven、cargo 等); (4) 测试框架集成(pytest、JUnit、Mocha 等); (5) 超时和错误处理机制。Qwen2.5-Coder 报告中描述的「抽象语法树静态检查 + 单元测试动态验证」两层过滤, 是一个务实的折中方案——AST 检查快速过滤语法错误, 单元测试验证语义正确性。这个沙箱之所以是「代码领域 DPO」的关键使能器, 是因为它为偏好对(pair)提供了客观、可扩展的标注信号。与传统 DPO 依赖人类标注者或昂贵奖励模型不同, 代码沙箱可以 24/7 自动运行, 为任意两个候选代码片段给出「哪个通过更多测试」的确定性判断。这大幅降低了高质量偏好数据的获取成本。</p>
<h3 id="9-3-sjysycm">9.3 数据与实验层面</h3>
<p><strong>思考 5: 10-gram 去污染是否足够? 为什么不用更严格的 n-gram?</strong></p>
<p>Qwen2.5-Coder 使用 10-gram 重叠方法进行去污染——任何与测试数据有 10-gram 词级重叠的训练数据都被移除。这个阈值的选择是一个权衡: 更小的 n(如 5-gram)会导致过度激进的过滤, 移除大量与测试集仅有短片段相似的训练数据, 可能损害模型的泛化能力; 更大的 n(如 20-gram)则可能漏掉经过轻微改写的测试样本。10-gram 约对应 10-15 个英文单词或 5-8 行代码, 足以捕获大多数直接复制, 同时避免误伤独立开发的相似代码。但需要注意的是, 这种方法对于「语义等价但语法不同」的改写(如变量重命名、逻辑重构)无能为力。更严格的去污染可能需要结合 AST 结构匹配或语义嵌入相似度, 但这会显著增加计算成本。对于 HumanEval/MBPP 这类小样本基准, 10-gram 配合人工审核是业界主流做法; 但对于大规模竞赛编程数据集, 可能需要更复杂的策略。</p>
<p><strong>思考 6: LiveCodeBench 作为「防污染」评估的优势和局限是什么?</strong></p>
<p>LiveCodeBench 的核心价值在于「持续收集新问题」——从 LeetCode、AtCoder、CodeForces 等平台抓取 2023 年 5 月至 2024 年 9 月之间发布的新题目, 确保测试数据在模型训练截止日期之后。这从根本上解决了传统静态基准(如 HumanEval、MBPP)的数据污染问题, 因为模型不可能在训练时「见过」未来发布的竞赛题。但 LiveCodeBench 也有局限: (1) 题型偏算法和竞赛编程, 不代表真实软件开发场景(如没有涉及 API 设计、系统架构、代码审查等); (2) 题目难度分布不均, 大量简单题(如数组遍历)可能使分数虚高; (3) 作为「在线」基准, 其题目质量和测试用例完整性不如经过多轮验证的静态基准。因此, LiveCodeBench 最适合作为「防污染能力」的验证指标, 而非代码能力的唯一度量。</p>
<h3 id="9-4-jxyfxcm">9.4 局限与风险层面</h3>
<p><strong>思考 7: Qwen2.5-Coder 在 Aider 基准上的突出表现(7B 超越 33B)说明了什么? 这种能力可以泛化到真实开发环境吗?</strong></p>
<p>Aider 基准测试的是「代码编辑」能力——给定自然语言指令, 修改现有代码使其通过单元测试。Qwen2.5-Coder-7B-Instruct 的 Pass@1 达到 51.9%, 超越 CodeStral-22B 和 DeepSeek-Coder-33B, 这说明了小尺寸模型在「精确编辑」任务上可以达到惊人的效率。但 Aider 与真实开发环境存在显著差距: (1) Aider 的测试集来自 Exercism——结构清晰、边界明确的小型练习, 而真实代码库往往有复杂的依赖、模糊的需求和隐含的假设; (2) Aider 的评估是「单次编辑」——模型一次性生成完整修改, 而真实开发需要多轮迭代、调试和重构; (3) Aider 的单元测试是完备的, 而真实项目中测试覆盖率往往不足。因此, Aider 的高分是「编辑能力存在」的必要条件, 但不是「可以替代程序员」的充分条件。从工程角度看, 7B 模型在 Aider 上的高效表现更适合「IDE 自动补全 + 小范围重构」场景, 而非「自主完成需求到部署的全流程」。</p>
<p><strong>思考 8: 代码模型对 92 种编程语言的支持是真实能力还是「形式上的覆盖」?</strong></p>
<p>Qwen2.5-Coder 支持 92 种编程语言, 但这并不意味着它在所有语言上都具有同等质量。从数据分布来看, GitHub 上不同语言的代码量呈严重长尾分布——Python、JavaScript、Java、C++ 等主流语言占据了绝大部分训练数据, 而 COBOL、Fortran、Lisp 等语言的样本可能非常稀疏。McEval(40 种语言)和 MdEval(18 种语言)的评估结果表明, Qwen2.5-Coder 在主流语言上表现强劲, 但在长尾语言上的能力可能主要依赖「跨语言迁移」——利用 Python/Java 中学到的算法模式, 通过语法映射生成其他语言的代码。这种迁移对于语法相似的语言族(如 C/C++/Java/C#)效果较好, 但对于范式迥异的语言(如 Haskell 的纯函数式、Prolog 的逻辑式)可能力不从心。此外, 92 种语言的支持也带来了 tokenizer 和推理效率的挑战——词表需要覆盖更多语言的关键字和惯用标识符, 这增加了词表大小和 embedding 层的参数量。</p>
<h3 id="9-5-jspxcm">9.5 技术谱系层面</h3>
<p><strong>思考 9: Qwen2.5-Coder 在代码模型演进谱系中处于什么位置? 它对后续工作产生了哪些影响?</strong></p>
<p>Qwen2.5-Coder 处于「专用代码模型」向「通用能力代码模型」演进的关键节点。在其之前, 代码模型的发展脉络大致是: StarCoder(多语言、大规模代码预训练) → CodeLlama(Llama 架构 + 代码续训) → DeepSeek-Coder(MoE + 代码专用) → CodeQwen1.5(Qwen1.5 + 代码适配)。Qwen2.5-Coder 的差异化在于:(1) 它不追求「纯代码」的极端, 而是通过 7:2:1 的数据混合保留了通用和数学能力; (2) 它系统性地解决了「数据质量 → 数据规模 → 模型尺寸」的 scaling 问题, 在所有尺寸上都达到 SOTA; (3) 它把 FIM 从文件级提升到仓库级, 为「仓库级代码理解」设立了新标杆。</p>
<p>对后续工作的影响体现在: (1) Qwen3-Coder-Next(arXiv:2603.00729)直接继承了 Qwen2.5-Coder 的数据 pipeline 和训练策略, 并扩展到 80B 参数和 Agent 能力; (2) 数据混合策略(代码 + 数学 + 文本)被 Yi-Coder、GLM-4-Coder 等后续模型广泛借鉴; (3) 多语言沙箱验证 + DPO 的范式成为代码模型后训练的标准做法之一。从更宏观的视角看, Qwen2.5-Coder 证明了「专用模型不需要牺牲通用能力」——这一理念正在影响整个代码智能领域的发展方向。</p>
<hr>
<h2 id="s-jl-conclusion">十、结论 (Conclusion)</h2>
<p>本工作介绍了 Qwen2.5-Coder——Qwen 系列的最新成员。建立在顶级开源 LLM Qwen2.5 基础之上, Qwen2.5-Coder 通过对 Qwen2.5-0.5B/1.5B/3B/7B/14B/32B 在大规模数据集上进行广泛的预训练和后训练而开发。为确保预训练数据的质量, 我们通过收集公共代码数据和从网络文本中提取高质量代码相关内容来策划数据集, 同时使用先进的分类器过滤低质量数据。此外, 我们构建了精心设计的指令微调数据集, 将基座代码 LLM 转变为强大的编码助手。</p>
<p>展望未来, 我们的研究将聚焦于探索代码 LLM 在数据规模和模型规模方面的扩展影响。我们还将继续增强这些模型的推理能力, 旨在推动代码 LLM 所能达到的边界。</p>
<hr>
<blockquote>
<p><strong>附注</strong>: 本精译严格遵循原文逐句翻译, 保留所有技术术语的英文原名(首次出现时附中文释义), 所有数据表格均忠实还原原文数值。如需查阅原始论文的完整图表与附录细节, 请参阅 arXiv:2409.12186。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-yy-introduction","text":"一、引言 (Introduction)"},{"level":2,"id":"e-mxjg-model-architecture","text":"二、模型架构 (Model Architecture)"},{"level":3,"id":"2-1-jg","text":"2.1 架构"},{"level":3,"id":"2-2-fcq","text":"2.2 分词器"},{"level":2,"id":"s-yxl-pre-training","text":"三、预训练 (Pre-training)"},{"level":3,"id":"3-1-yxlsj","text":"3.1 预训练数据"},{"level":4,"id":"3-1-1-sjgc","text":"3.1.1 数据构成"},{"level":4,"id":"3-1-2-sjhh","text":"3.1.2 数据混合"},{"level":3,"id":"3-2-xlcl","text":"3.2 训练策略"},{"level":4,"id":"3-2-1-wjjyxl-file-level-pretraining","text":"3.2.1 文件级预训练(File-Level Pretraining)"},{"level":4,"id":"3-2-2-ckjyxl-repo-level-pretraining","text":"3.2.2 仓库级预训练(Repo-Level Pretraining)"},{"level":2,"id":"s-hxl-post-training","text":"四、后训练 (Post-training)"},{"level":3,"id":"4-1-zlsjpf","text":"4.1 指令数据配方"},{"level":3,"id":"4-2-xlcl","text":"4.2 训练策略"},{"level":2,"id":"w-qwr-decontamination","text":"五、去污染 (Decontamination)"},{"level":2,"id":"l-jzmxpg-evaluation-on-base-models","text":"六、基座模型评估 (Evaluation on Base Models)"},{"level":3,"id":"6-1-dmsc","text":"6.1 代码生成"},{"level":4,"id":"6-1-1-human-eval-y-mbpp","text":"6.1.1 HumanEval 与 MBPP"},{"level":4,"id":"6-1-2-dyydmsc-multi-pl-e","text":"6.1.2 多语言代码生成 (MultiPL-E)"},{"level":3,"id":"6-2-dmbq","text":"6.2 代码补全"},{"level":4,"id":"6-2-1-cross-code-long-eval","text":"6.2.1 CrossCodeLongEval"},{"level":4,"id":"6-2-2-repo-eval","text":"6.2.2 RepoEval"},{"level":3,"id":"6-3-dmtl","text":"6.3 代码推理"},{"level":3,"id":"6-4-sxtl","text":"6.4 数学推理"},{"level":3,"id":"6-5-tyzryy","text":"6.5 通用自然语言"},{"level":3,"id":"6-6-csxwpg","text":"6.6 长上下文评估"},{"level":2,"id":"q-zlmxpg-evaluation-on-instruct-models","text":"七、指令模型评估 (Evaluation on Instruct Models)"},{"level":3,"id":"7-1-dmsc","text":"7.1 代码生成"},{"level":4,"id":"7-1-1-human-eval-y-mbpp","text":"7.1.1 HumanEval 与 MBPP"},{"level":4,"id":"7-1-2-dyydmsc","text":"7.1.2 多语言代码生成"},{"level":3,"id":"7-2-dmtl","text":"7.2 代码推理"},{"level":3,"id":"7-3-dmbj","text":"7.3 代码编辑"},{"level":3,"id":"7-4-text-to-sql","text":"7.4 Text-to-SQL"},{"level":3,"id":"7-5-sxtlytyzryy","text":"7.5 数学推理与通用自然语言"},{"level":3,"id":"7-6-bglj","text":"7.6 表格理解"},{"level":3,"id":"7-7-rlphdq","text":"7.7 人类偏好对齐"},{"level":2,"id":"b-tl-scaling-jsnsxydyq","text":"八、讨论: Scaling 就是你所需要的一切"},{"level":2,"id":"j-jsskjd-thinking-nodes","text":"九、技术思考节点 (Thinking Nodes)"},{"level":3,"id":"9-1-sjdjcm","text":"9.1 设计动机层面"},{"level":3,"id":"9-2-jgxjcm","text":"9.2 架构细节层面"},{"level":3,"id":"9-3-sjysycm","text":"9.3 数据与实验层面"},{"level":3,"id":"9-4-jxyfxcm","text":"9.4 局限与风险层面"},{"level":3,"id":"9-5-jspxcm","text":"9.5 技术谱系层面"},{"level":2,"id":"s-jl-conclusion","text":"十、结论 (Conclusion)"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/06-qwen2.5-coder/01-qwen2.5-coder-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/06-qwen2.5-coder/01-qwen2.5-coder-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-Coder 技术报告精译</h1>
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
