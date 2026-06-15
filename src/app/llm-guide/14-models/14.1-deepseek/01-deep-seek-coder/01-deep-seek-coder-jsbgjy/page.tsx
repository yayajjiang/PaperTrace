"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: DeepSeek-Coder: When the Large Language Model Meets Programming - The Rise of Code Intelligence
原文链接: <a href="https://arxiv.org/abs/2401.14196">https://arxiv.org/abs/2401.14196</a>
发布日期: 2024-01-25
发布机构: DeepSeek-AI, 北京大学</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>大语言模型的快速发展彻底改变了软件开发领域的代码智能。然而，闭源模型的主导地位限制了广泛的研究与开发。为此，我们推出了 DeepSeek-Coder 系列，一系列从 1.3B 到 33B 参数规模的开源代码模型，在 2 万亿 token 上从零训练。这些模型在高质量的项目级代码语料库上预训练，并采用 16K 窗口的填空任务来增强代码生成和填充能力。我们的广泛评估表明，DeepSeek-Coder 不仅在多个基准上达到了开源代码模型的 state-of-the-art 性能，还超越了 Codex 和 GPT-3.5 等现有闭源模型。此外，DeepSeek-Coder 模型采用宽松许可证，允许用于研究和无限制的商业用途。</p>
<blockquote>
<p>谱系与影响节点: DeepSeek-Coder 是 DeepSeek 家族的第一个重要开源模型(2023 年 11 月发布，2024 年 1 月发布技术报告)。它奠定了 DeepSeek 在代码智能领域的声誉，也是后续 DeepSeek-Math(v1.5 基座)、DeepSeek-Coder-V2 和 DeepSeek-V2 的数据工程基础。值得注意的是，论文中提到的「项目级代码语料库」和「FIM 训练」成为了后续代码模型的标准配置。DeepSeek-Coder 的成功也验证了「从零训练专用代码模型」路线的可行性——这与后来 DeepSeek-Coder-V2 选择「继续预训练通用基座」的路线形成了有趣的对比。</p>
</blockquote>
<hr>
<h2 id="1-yy">1. 引言</h2>
<p>软件开发领域已被大语言模型的快速发展显著改变，它们开启了代码智能的新时代。这些模型有潜力自动化和简化编码的多个方面，从 bug 检测到代码生成，从而提高生产力并降低人为错误的可能性。然而，该领域的一个主要挑战是开源模型与闭源模型之间的性能差距。强大的闭源模型虽然性能出色，但由于其专有性质，许多研究人员和开发者无法使用。</p>
<p>为应对这一挑战，我们推出了 DeepSeek-Coder 系列。该系列包含一系列从 1.3B 到 33B 参数规模的开源代码模型，每个尺寸都包含基座版本和指令版本。系列中的每个模型都在来自 87 种编程语言的 2 万亿 token 上从零训练。此外，我们尝试在仓库级别组织预训练数据，以增强预训练模型在仓库内跨文件上下文中的理解能力。除了预训练期间采用下一 token 预测损失外，我们还引入了 Fill-In-Middle(FIM，中间填充)方法，旨在进一步增强模型的代码补全能力。为满足处理更长代码输入的需求，我们将上下文长度扩展到 16K，使我们的模型能够处理更复杂和广泛的编码任务，从而增加其在各种编码场景中的通用性和适用性。</p>
<p>我们使用多种公共代码相关基准进行了全面实验。结果表明，在开源模型中，DeepSeek-Coder-Base 33B 在所有基准上 consistently 表现出色。此外，DeepSeek-Coder-Instruct 33B 在大多数评估基准上超越了 OpenAI GPT-3.5 Turbo，显著缩小了 OpenAI GPT-4 与开源模型之间的性能差距。值得注意的是，即使是我们较小的模型 DeepSeek-Coder-Base 7B，也展现出与五倍规模模型(如 CodeLlama-33B)相当的竞争力。</p>
<blockquote>
<p>设计动机节点: DeepSeek 选择代码作为第一个开源垂类模型，不是偶然的。代码是语言模型最容易量化和验证的领域——是否正确，测试用例一跑就知道。这种「可验证性」使得代码模型能够快速迭代和调优。另一个关键洞察是「项目级上下文」:传统代码模型在文件级别预训练，忽略了同一仓库中文件之间的依赖关系。但在实际开发中，跨文件引用(如 Python 的 import、C 的 include)是常态。DeepSeek-Coder 通过拓扑排序解析文件依赖并按依赖顺序排列文件，让模型在预训练阶段就接触到真实的跨文件上下文，这是其跨文件代码补全能力显著优于竞品的核心原因。</p>
</blockquote>
<h3 id="1-1-zygx">1.1 主要贡献</h3>
<ul>
<li>我们推出了 DeepSeek-Coder-Base 和 DeepSeek-Coder-Instruct，这是我们先进的代码聚焦大语言模型。通过在庞大的代码语料库上进行广泛训练，这些模型展现出对 87 种编程语言的熟练理解。此外，它们提供多种模型规模以满足广泛的计算和应用需求。</li>
<li>我们首次尝试在模型的预训练阶段引入仓库级数据构建。我们发现，尽管这种方法可能略微损害短代码生成的性能，但它能显著提升跨文件代码生成的能力。</li>
<li>我们的分析严格审视了 FIM 训练策略对代码模型预训练阶段的影响。这些综合研究的结果揭示了 FIM 配置的有趣方面，提供了有价值的见解，对代码预训练模型的增强和发展做出了重要贡献。</li>
<li>我们对代码大语言模型进行了广泛的评估，涵盖了众多代码相关任务的广泛基准。结果表明，DeepSeek-Coder-Base 在这些基准上超越了所有现有开源代码大语言模型。此外，通过使用指令数据精心微调，DeepSeek-Coder-Instruct 在代码相关任务中取得了比 OpenAI GPT-3.5 Turbo 更好的性能。</li>
</ul>
<h3 id="1-2-pcyzbgs">1.2 评测与指标概述</h3>
<ul>
<li><strong>代码生成</strong>: DeepSeek-Coder-Base 33B 在 HumanEval 上取得 56.1%(Python)和 50.3%(多语言平均)，在 MBPP 上取得 66.0%，均为开源模型最佳。DeepSeek-Coder-Instruct 33B 在 HumanEval 上达到 79.3%，超越了 GPT-3.5 Turbo(76.2%)。</li>
<li><strong>FIM 代码补全</strong>: DeepSeek-Coder-Base 33B 在 Single-Line Infilling 基准上平均精确匹配率达到 81.2%，优于 StarCoder(69.7%)和 CodeLlama-13B(75.5%)。</li>
<li><strong>跨文件代码补全</strong>: 在 CrossCodeEval 基准上，DeepSeek-Coder-Base 6.7B 在 Python、Java、TypeScript 和 C# 四种语言上均优于同规模的开源模型，验证了仓库级预训练的有效性。</li>
<li><strong>程序辅助数学推理</strong>: DeepSeek-Coder-Base 33B 在 GSM8K 上达到 60.7%，在 MATH 上达到 29.1%，展示了代码模型在数学推理上的潜力。</li>
<li><strong>从通用 LLM 继续预训练</strong>: DeepSeek-Coder-v1.5 7B 在 DeepSeek-LLM-7B 基础上用代码数据继续预训练 2T token，在保持代码能力的同时显著增强了数学推理和自然语言理解能力。</li>
</ul>
<hr>
<h2 id="2-sjsj">2. 数据收集</h2>
<p>DeepSeek-Coder 的训练数据集由 87% 的源代码、10% 的英文代码相关自然语言语料库和 3% 的与代码无关的中文自然语言语料库组成。英文语料库包括 GitHub 的 Markdown 和 StackExchange 材料，用于增强模型对代码相关概念的理解以及处理库使用和 bug 修复等任务的能力。中文语料库由高质量文章组成，旨在提高模型对中文语言的理解能力。</p>
<p>在本节中，我们将概述代码训练数据的构建过程。该过程涉及数据爬取、基于规则的过滤、依赖解析、仓库级去重和质量筛选，如图 1 所示。</p>
<blockquote>
<p>图 1: 数据集创建流程。(见 <code>images/data_clean_pipeline.pdf</code>)</p>
</blockquote>
<h3 id="2-1-git-hub-sjpqygl">2.1 GitHub 数据爬取与过滤</h3>
<p>我们从 GitHub 收集了 2023 年 2 月之前创建的公开仓库，并仅保留 87 种编程语言。为减少待处理的数据量，我们应用与 StarCoder 项目类似的过滤规则，初步过滤掉低质量代码。通过应用这些过滤规则，我们将总数据量减少到原始大小的 32.8%。</p>
<p>具体过滤规则如下:</p>
<ul>
<li>过滤掉平均行长度超过 100 个字符或最大行长度超过 1000 个字符的文件。</li>
<li>移除字母字符比例低于 25% 的文件。</li>
<li>除 XSLT 编程语言外，进一步过滤掉前 100 个字符中出现字符串 <code>&lt;?xml version=</code> 的文件。</li>
<li>对于 HTML 文件，考虑可见文本与 HTML 代码的比例。保留可见文本占代码至少 20% 且不少于 100 个字符的文件。</li>
<li>对于 JSON 和 YAML 文件，只保留字符数在 50 到 5000 之间的文件，有效去除了大多数数据密集型文件。</li>
</ul>
<h3 id="2-2-yljx">2.2 依赖解析</h3>
<p>在先前的工作中，代码大语言模型主要在文件级源代码上预训练，忽略了项目中不同文件之间的依赖关系。然而，在实际应用中，这类模型难以有效扩展到处理整个项目级代码场景。因此，我们在这一步考虑如何利用同一仓库内文件之间的依赖关系。</p>
<p>具体而言，我们首先解析文件之间的依赖关系，然后按一种顺序排列这些文件，确保每个文件所依赖的上下文都位于该文件在输入序列中的位置之前。通过按照依赖关系对齐文件，我们的数据集更准确地反映了真实的编码实践和结构。</p>
<p>值得注意的是，我们只考虑文件之间的调用关系，并使用正则表达式提取它们，例如 Python 中的 import、C# 中的 using 和 C 中的 include。</p>
<p>算法 1 描述了用于项目中文件列表的依赖分析拓扑排序。该算法初始化两个数据结构:一个名为 graphs 的空邻接表，用于表示文件之间的依赖关系;一个名为 inDegree 的空字典，用于存储每个文件的入度。然后算法迭代每对文件以识别依赖关系，相应地更新 graphs 和 inDegree。接下来，它识别整体依赖图中的任何不连通子图。对于每个子图，算法采用改进的拓扑排序。与标准方法选择入度为零的节点不同，该算法选择入度最小的节点，这使其能够处理图中的环。选中的节点被添加到 results 列表中，其连接节点的入度递减。该过程持续进行，直到为每个子图生成拓扑排序序列。最后，算法返回这些排序序列的列表，每个序列的文件被连接形成单个训练样本。为了纳入文件路径信息，在每个文件开头添加指示文件路径的注释。</p>
<blockquote>
<p>架构细节节点: 拓扑排序在代码数据预处理中的应用是一个精妙的工程洞察。传统的文件级预训练将代码文件视为独立的文本片段，而真实的软件开发中，文件之间存在复杂的依赖图(import/include 关系)。通过拓扑排序，模型在预训练时看到的序列顺序是「被依赖的文件在前，依赖它们的文件在后」——这与程序员阅读代码时的认知顺序一致。算法中选择「最小入度」而非「零入度」节点的策略尤为重要，因为真实代码库中存在循环依赖(如 A 依赖 B，B 又依赖 A)，标准拓扑排序无法处理这种情况。最小入度策略 gracefully 处理了这种环，确保即使存在循环依赖，文件也能被合理地排列。</p>
</blockquote>
<h3 id="2-3-ckjqz">2.3 仓库级去重</h3>
<p>最近的研究表明，对大语言模型训练数据集进行去重可以带来显著的性能提升。语言模型训练语料库通常包含大量近重复内容，通过去除长重复子串可以提升大语言模型的性能。Stack 数据集应用了近去重方法，取得了显著的改进，并强调近去重是在代码基准任务上取得竞争性性能的关键预处理步骤。</p>
<p>在我们的数据集中，我们也采用了近去重。然而，我们的方法与之前的工作有一个区别:我们在代码的仓库级别进行去重，而不是文件级别，因为后者可能会过滤掉仓库中的某些文件，从而破坏仓库的结构。具体而言，我们将仓库级别的连接代码视为单个样本，并应用相同的近去重算法，以确保仓库结构的完整性。</p>
<blockquote>
<p>数据与实验节点: 仓库级去重 vs 文件级去重是一个容易被忽视但影响深远的工程决策。文件级去重(如 StarCoder 的做法)可能导致一个仓库中部分文件被保留、部分被删除，从而破坏文件之间的依赖关系——模型可能会看到 import 了一个不存在的模块的代码。仓库级去重将整個仓库作为原子单元，要么全部保留，要么全部删除，保持了仓库内部结构的完整性。论文虽然没有提供定量的消融实验来对比两种去重策略，但「保持结构完整性」的论证在工程逻辑上是成立的。</p>
</blockquote>
<h3 id="2-4-zlsxyqwr">2.4 质量筛选与去污染</h3>
<p>除了应用第 2.1 节提到的过滤规则外，我们还采用编译器和质量模型，结合启发式规则，进一步过滤掉低质量数据。这包括含有语法错误、可读性差和模块化程度低的代码。</p>
<p>源代码的统计摘要见表 1，包含 87 种语言，总计 798GB、6.03 亿个文件。</p>
<table>
<thead>
<tr>
<th>语言</th>
<th>大小(GB)</th>
<th>文件数(k)</th>
<th>占比(%)</th>
<th>语言</th>
<th>大小(GB)</th>
<th>文件数(k)</th>
<th>占比(%)</th>
</tr>
</thead>
<tbody><tr>
<td>Java</td>
<td>148.66</td>
<td>134,367</td>
<td>18.63</td>
<td>TypeScript</td>
<td>60.62</td>
<td>62,432</td>
<td>7.60</td>
</tr>
<tr>
<td>C++</td>
<td>90.87</td>
<td>36,006</td>
<td>11.39</td>
<td>C#</td>
<td>58.56</td>
<td>53,739</td>
<td>7.34</td>
</tr>
<tr>
<td>Python</td>
<td>120.68</td>
<td>75,188</td>
<td>15.12</td>
<td>PHP</td>
<td>58.92</td>
<td>40,627</td>
<td>7.38</td>
</tr>
<tr>
<td>JavaScript</td>
<td>53.84</td>
<td>71,895</td>
<td>6.75</td>
<td>HTML</td>
<td>30.05</td>
<td>14,998</td>
<td>3.77</td>
</tr>
<tr>
<td>C</td>
<td>28.64</td>
<td>27,111</td>
<td>3.59</td>
<td>其他 77 种</td>
<td>约 150</td>
<td>约 100,000</td>
<td>约 20</td>
</tr>
<tr>
<td><strong>总计</strong></td>
<td><strong>797.92</strong></td>
<td><strong>603,173</strong></td>
<td><strong>100.00</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 清洗后训练数据的统计摘要。(仅列出主要语言，完整列表见原文 Appendix)</p>
</blockquote>
<p>为确保代码训练数据不被可能存在于 GitHub 上的测试集信息污染，我们实施了 n-gram 过滤流程。具体而言，如果一段代码包含与测试数据中任何 10-gram 字符串相同的内容，则将其从训练数据中排除。对于长度短于 10-gram 但不少于 3-gram 的测试数据，我们采用精确匹配进行过滤。</p>
<blockquote>
<p>译者注: 10-gram 过滤是代码模型去污染的标准做法，因为代码的重复性比自然语言高得多——一个测试题的函数签名或 docstring 可能只有几十字符，但足以被模型记忆。与自然语言模型常用的 13-gram 去污染相比，代码模型使用更短的 n-gram 是合理的，因为代码的平均 token 长度更短，且结构更 rigid。</p>
</blockquote>
<hr>
<h2 id="3-xlcl">3. 训练策略</h2>
<h3 id="3-1-xlmb">3.1 训练目标</h3>
<p><strong>下一 Token 预测</strong> 我们的第一个训练目标是下一 token 预测。在此过程中，将各种文件连接形成固定长度的条目，然后用这些条目训练模型，使其能够基于提供的上下文预测后续 token。</p>
<p><strong>Fill-in-the-Middle(FIM)</strong> 代码预训练场景中，经常需要根据给定上下文和后续文本生成相应的插入内容。由于编程语言中的特定依赖性，仅依靠下一 token 预测不足以学习这种填空能力。因此，FIM 方法将文本随机分成三部分，然后打乱这些部分的顺序并用特殊字符连接。</p>
<p>在 FIM 方法中，采用两种不同模式:PSM(Prefix-Suffix-Middle)和 SPM(Suffix-Prefix-Middle)。在 PSM 模式中，训练语料按 Prefix、Suffix、Middle 的顺序组织;SPM 模式则将片段排列为 Suffix、Prefix、Middle。</p>
<p>为确定 FIM 方法中各种超参数的有效性，我们进行了一系列消融实验。使用 DeepSeek-Coder-Base 1.3B 作为模型架构，专注于训练数据集中的 Python 子集。主要目标是评估 FIM 技术的有效性，使用 HumanEval-FIM 基准进行测试。</p>
<p>实验结果如图 2 所示。虽然 100% FIM 率在 HumanEval-FIM 上达到峰值性能，但该配置也导致代码生成能力最弱。这表明 FIM 与代码生成能力之间存在权衡。此外，我们观察到 50% PSM 率优于 MSP 策略。为了在 FIM 效率和代码生成能力之间取得平衡，我们最终选择 50% PSM 率作为首选训练策略。</p>
<blockquote>
<p>图 2: 使用 FIM 目标的效果。(见 <code>images/fim.pdf</code>)</p>
</blockquote>
<blockquote>
<p>数据与实验节点: FIM 比率的选择揭示了代码预训练中一个核心的「多任务学习」困境。FIM 任务(双向上下文)和下一 token 预测任务(单向上下文)在注意力机制层面存在竞争:FIM 要求模型在编码 prefix 时「屏蔽」对 suffix 的注意力(否则信息泄漏)，而下一 token 预测则要求模型充分利用所有前文信息。100% FIM 虽然最大化补全能力，但削弱了生成能力;0% FIM 则相反。50% 的折中比率是工程上的务实选择——它让模型同时掌握两种技能，虽然每种都不是极致，但在实际产品场景中(IDE 既需要补全也需要生成)更为实用。</p>
</blockquote>
<p>在我们的实现中，我们引入了三个专门的任务哨兵 token。对于每个代码文件，首先将其内容分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mrow><mi>p</mi><mi>r</mi><mi>e</mi></mrow></msub></mrow><annotation encoding="application/x-tex">f_{pre}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mrow><mi>m</mi><mi>i</mi><mi>d</mi><mi>d</mi><mi>l</mi><mi>e</mi></mrow></msub></mrow><annotation encoding="application/x-tex">f_{middle}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">mi</span><span class="mord mathnormal mtight">dd</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mrow><mi>s</mi><mi>u</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">f_{suf}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 三段。使用 PSM 模式，训练样本构造如下:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext mathvariant="monospace">&lt;|fim_start|&gt;</mtext><msub><mi>f</mi><mrow><mi>p</mi><mi>r</mi><mi>e</mi></mrow></msub><mtext mathvariant="monospace">&lt;|fim_hole|&gt;</mtext><msub><mi>f</mi><mrow><mi>s</mi><mi>u</mi><mi>f</mi></mrow></msub><mtext mathvariant="monospace">&lt;|fim_end|&gt;</mtext><msub><mi>f</mi><mrow><mi>m</mi><mi>i</mi><mi>d</mi><mi>d</mi><mi>l</mi><mi>e</mi></mrow></msub><mtext mathvariant="monospace">&lt;|eos_token|&gt;</mtext></mrow><annotation encoding="application/x-tex">\\texttt{&lt;|fim\\_start|&gt;} f_{pre} \\texttt{&lt;|fim\\_hole|&gt;} f_{suf} \\texttt{&lt;|fim\\_end|&gt;} f_{middle} \\texttt{&lt;|eos\\_token|&gt;}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord texttt">&lt;|fim_start|&gt;</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord texttt">&lt;|fim_hole|&gt;</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord texttt">&lt;|fim_end|&gt;</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">mi</span><span class="mord mathnormal mtight">dd</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord texttt">&lt;|eos_token|&gt;</span></span></span></span></span></span><h3 id="3-2-fcq">3.2 分词器</h3>
<p>对于分词过程，我们使用 HuggingFace Tokenizer 库在训练语料库的子集上训练 Byte Pair Encoding(BPE)分词器。最终，我们使用词汇量为 32,000 的分词器。</p>
<h3 id="3-3-mxjg">3.3 模型架构</h3>
<p>我们开发了不同参数规模的模型以满足 diverse 应用，包括 1.3B、6.7B 和 33B 参数的模型。这些模型基于 DeepSeek 大语言模型框架构建。每个模型都是Encoder-Only的 Transformer，采用 Rotary Position Embedding(RoPE)。值得注意的是，33B 模型集成了 Grouped-Query-Attention(GQA，分组查询注意力)，组大小为 8，以提高训练和推理效率。此外，我们采用 FlashAttention v2 来加速注意力机制的计算。</p>
<table>
<thead>
<tr>
<th>超参数</th>
<th>1.3B</th>
<th>6.7B</th>
<th>33B</th>
</tr>
</thead>
<tbody><tr>
<td>隐藏层激活函数</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
</tr>
<tr>
<td>隐藏层维度</td>
<td>2048</td>
<td>4096</td>
<td>7168</td>
</tr>
<tr>
<td>中间层维度</td>
<td>5504</td>
<td>11008</td>
<td>19200</td>
</tr>
<tr>
<td>隐藏层层数</td>
<td>24</td>
<td>32</td>
<td>62</td>
</tr>
<tr>
<td>注意力头数</td>
<td>16</td>
<td>32</td>
<td>56</td>
</tr>
<tr>
<td>注意力类型</td>
<td>Multi-head</td>
<td>Multi-head</td>
<td>GQA(8)</td>
</tr>
<tr>
<td>批量大小</td>
<td>1024</td>
<td>2304</td>
<td>3840</td>
</tr>
<tr>
<td>最大学习率</td>
<td>5.3e-4</td>
<td>4.2e-4</td>
<td>3.5e-4</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: DeepSeek-Coder 的超参数。</p>
</blockquote>
<h3 id="3-4-yh">3.4 优化</h3>
<p>遵循 DeepSeek LLM 的做法，我们使用 AdamW 作为优化器，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\beta_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\beta_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 值分别为 0.9 和 0.95。我们根据 DeepSeek LLM 建议的 scaling law 调整批量大小和学习率。对于学习率调度，我们实现三阶段策略:包括 2000 步 warmup，最终学习率设为初始值的 10%。值得注意的是，每个阶段的学习率按前一阶段的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><mfrac><mn>1</mn><mn>10</mn></mfrac></msqrt></mrow><annotation encoding="application/x-tex">\\sqrt{\\frac{1}{10}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.84em;vertical-align:-0.6049em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2351em;"><span class="svg-align" style="top:-3.8em;"><span class="pstrut" style="height:3.8em;"></span><span class="mord" style="padding-left:1em;"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span><span style="top:-3.1951em;"><span class="pstrut" style="height:3.8em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.88em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.88em" viewBox="0 0 400000 1944" preserveAspectRatio="xMinYMin slice"><path d="M983 90
l0 -0
c4,-6.7,10,-10,18,-10 H400000v40
H1013.1s-83.4,268,-264.1,840c-180.7,572,-277,876.3,-289,913c-4.7,4.7,-12.7,7,-24,7
s-12,0,-12,0c-1.3,-3.3,-3.7,-11.7,-7,-25c-35.3,-125.3,-106.7,-373.3,-214,-744
c-10,12,-21,25,-33,39s-32,39,-32,39c-6,-5.3,-15,-14,-27,-26s25,-30,25,-30
c26.7,-32.7,52,-63,76,-91s52,-60,52,-60s208,722,208,722
c56,-175.3,126.3,-397.3,211,-666c84.7,-268.7,153.8,-488.2,207.5,-658.5
c53.7,-170.3,84.5,-266.8,92.5,-289.5z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.6049em;"><span></span></span></span></span></span></span></span></span> 缩放。</p>
<h3 id="3-5-xlhj">3.5 训练环境</h3>
<p>我们的实验使用 HAI-LLM 框架进行，该框架以高效和轻量级的方式训练大语言模型。该框架结合了多种并行策略以优化计算效率，包括张量并行、ZeRO 数据并行和 PipeDream 流水线并行。</p>
<p>实验集群配备 NVIDIA A100 和 H800 GPU。A100 集群中每个节点配置 8 块 GPU，通过 NVLink 桥接成对互连。H800 集群同样每个节点 8 块 GPU，使用 NVLink 和 NVSwitch 技术组合互连。节点间通信采用 InfiniBand。</p>
<h3 id="3-6-csxw">3.6 长上下文</h3>
<p>为增强 DeepSeek-Coder 处理扩展上下文的能力(特别是仓库级代码处理场景)，我们重新配置了 RoPE 参数以扩展默认上下文窗口。遵循先前做法，我们采用线性缩放策略，将缩放因子从 1 增加到 4，并将基频从 10000 改为 100000。模型使用 512 的批量大小和 16K 的序列长度额外训练了 1000 步。理论上，这些修改使模型能够处理最多 64K token 的上下文。然而，经验观察表明，模型在 16K token 范围内输出最可靠。</p>
<blockquote>
<p>设计动机节点: 线性缩放 RoPE 是一种经典的上下文外推技术，最早由 Chen 等人(2023)在「Extending Context Window of Large Language Models via Position Interpolation」中提出。其核心思想是:如果模型在位置 0-L 上训练，要外推到 0-kL，可以通过将所有位置索引除以 k 来实现。DeepSeek-Coder 的缩放因子为 4，意味着理论外推长度为 16K * 4 = 64K。但经验上 16K 内最可靠，这是因为线性缩放虽然保证了位置编码的内积关系不被破坏，但注意力权重的分布仍然需要模型「适应」——而 1000 步的继续训练只够让模型适应 16K 左右的长度。</p>
</blockquote>
<h3 id="3-7-zlwt">3.7 指令微调</h3>
<p>我们通过使用高质量数据进行基于指令的微调来增强 DeepSeek-Coder-Base。这些数据包含有用且公正的人类指令，按 Alpaca 指令格式组织。为标记每个对话轮次，我们使用独特的分隔符 token <code>&lt;|EOT|&gt;</code> 表示每段的结束。训练使用余弦调度，100 步 warmup，初始学习率 1e-5。批量大小为 4M token，总共 2B token。</p>
<hr>
<h2 id="4-syjg">4. 实验结果</h2>
<h3 id="4-1-dmsc">4.1 代码生成</h3>
<p><strong>HumanEval 和 MBPP 基准</strong> HumanEval 和 MBPP 基准广泛用于评估代码大语言模型。HumanEval 包含 164 个手写 Python 问题，使用测试用例验证代码大语言模型在零样本设置下生成的代码。MBPP 基准包含 500 个问题，采用少样本设置。为评估模型的多语言能力，我们将 HumanEval 的 Python 问题扩展为 7 种额外常用编程语言:C++、Java、PHP、TypeScript、C#、Bash 和 JavaScript。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>Python</th>
<th>C++</th>
<th>Java</th>
<th>PHP</th>
<th>TS</th>
<th>C#</th>
<th>Bash</th>
<th>JS</th>
<th>平均</th>
<th>MBPP</th>
</tr>
</thead>
<tbody><tr>
<td><strong>开源基座模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>CodeGeeX2</td>
<td>6B</td>
<td>36.0%</td>
<td>29.2%</td>
<td>25.9%</td>
<td>23.6%</td>
<td>20.8%</td>
<td>29.7%</td>
<td>6.3%</td>
<td>24.8%</td>
<td>24.5%</td>
<td>36.2%</td>
</tr>
<tr>
<td>StarCoderBase</td>
<td>16B</td>
<td>31.7%</td>
<td>31.1%</td>
<td>28.5%</td>
<td>25.4%</td>
<td>34.0%</td>
<td>34.8%</td>
<td>8.9%</td>
<td>29.8%</td>
<td>28.0%</td>
<td>42.8%</td>
</tr>
<tr>
<td>CodeLlama</td>
<td>7B</td>
<td>31.7%</td>
<td>29.8%</td>
<td>34.2%</td>
<td>23.6%</td>
<td>36.5%</td>
<td>36.7%</td>
<td>12.0%</td>
<td>29.2%</td>
<td>29.2%</td>
<td>38.6%</td>
</tr>
<tr>
<td>CodeLlama</td>
<td>13B</td>
<td>36.0%</td>
<td>37.9%</td>
<td>38.0%</td>
<td>34.2%</td>
<td>45.2%</td>
<td>43.0%</td>
<td>16.5%</td>
<td>32.3%</td>
<td>35.4%</td>
<td>48.4%</td>
</tr>
<tr>
<td>CodeLlama</td>
<td>34B</td>
<td>48.2%</td>
<td>44.7%</td>
<td>44.9%</td>
<td>41.0%</td>
<td>42.1%</td>
<td>48.7%</td>
<td>15.8%</td>
<td>42.2%</td>
<td>41.0%</td>
<td>55.2%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>1.3B</td>
<td>34.8%</td>
<td>31.1%</td>
<td>32.3%</td>
<td>24.2%</td>
<td>28.9%</td>
<td>36.7%</td>
<td>10.1%</td>
<td>28.6%</td>
<td>28.3%</td>
<td>46.2%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>49.4%</td>
<td>50.3%</td>
<td>43.0%</td>
<td>38.5%</td>
<td>49.7%</td>
<td>50.0%</td>
<td>28.5%</td>
<td>48.4%</td>
<td>44.7%</td>
<td>60.6%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>33B</td>
<td>56.1%</td>
<td>58.4%</td>
<td>51.9%</td>
<td>44.1%</td>
<td>52.8%</td>
<td>51.3%</td>
<td>32.3%</td>
<td>55.3%</td>
<td>50.3%</td>
<td>66.0%</td>
</tr>
<tr>
<td><strong>指令微调模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>GPT-3.5-Turbo</td>
<td>-</td>
<td>76.2%</td>
<td>63.4%</td>
<td>69.2%</td>
<td>60.9%</td>
<td>69.1%</td>
<td>70.8%</td>
<td>42.4%</td>
<td>67.1%</td>
<td>64.9%</td>
<td>70.8%</td>
</tr>
<tr>
<td>GPT-4</td>
<td>-</td>
<td>84.1%</td>
<td>76.4%</td>
<td>81.6%</td>
<td>77.2%</td>
<td>77.4%</td>
<td>79.1%</td>
<td>58.2%</td>
<td>78.0%</td>
<td>76.5%</td>
<td>80.0%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>1.3B</td>
<td>65.2%</td>
<td>45.3%</td>
<td>51.9%</td>
<td>45.3%</td>
<td>59.7%</td>
<td>55.1%</td>
<td>12.7%</td>
<td>52.2%</td>
<td>48.4%</td>
<td>49.4%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>6.7B</td>
<td>78.6%</td>
<td>63.4%</td>
<td>68.4%</td>
<td>68.9%</td>
<td>67.2%</td>
<td>72.8%</td>
<td>36.7%</td>
<td>72.7%</td>
<td>66.1%</td>
<td>65.4%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>79.3%</td>
<td>68.9%</td>
<td>73.4%</td>
<td>72.7%</td>
<td>67.9%</td>
<td>74.1%</td>
<td>43.0%</td>
<td>73.9%</td>
<td>69.2%</td>
<td>70.0%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 各模型在多语言 HumanEval 和 MBPP 基准上的性能。</p>
</blockquote>
<p>如表 3 所示，DeepSeek-Coder-Base 在 HumanEval 上达到平均 50.3% 的准确率，在 MBPP 上达到 66.0%，均为开源模型最佳。与同规模开源模型 CodeLlama-Base 34B 相比，我们的模型在准确率上分别提升了 9% 和 11%。值得注意的是，即使是我们的较小模型 DeepSeek-Coder-Base 6.7B，也超越了 CodeLlama-Base 34B 的性能。经过指令微调后，我们的模型在 HumanEval 基准上超越了闭源 GPT-3.5-Turbo，显著缩小了 OpenAI GPT-4 与开源模型之间的性能差距。</p>
<blockquote>
<p>数据与实验节点: 几个引人注目的数字。第一，DeepSeek-Coder-Base 6.7B(44.7% 平均) &gt; CodeLlama-Base 34B(41.0% 平均)，参数量只有后者的 20%，性能却更高。这说明数据质量(项目级语料 + 精细过滤)和训练规模(2T vs 500B)的增益可以超过纯参数规模的增益。第二，DeepSeek-Coder-Instruct 33B 在 HumanEval 上 79.3% 超过了 GPT-3.5-Turbo 的 76.2%，这是开源代码模型首次在 HumanEval 上超越 GPT-3.5——一个具有里程碑意义的结果。</p>
</blockquote>
<p><strong>DS-1000 基准</strong> HumanEval 和 MBPP 的一个显著缺点是它们严重依赖简单的编程任务，可能无法准确代表大多数程序员通常编写的代码类型。相比之下，DS-1000 基准提供了 1000 个跨越 7 个不同库的实用且 realistic 的数据科学工作流。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>Matplotlib</th>
<th>Numpy</th>
<th>Pandas</th>
<th>Pytorch</th>
<th>Scipy</th>
<th>Scikit-Learn</th>
<th>Tensorflow</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>CodeGeeX2</td>
<td>6B</td>
<td>38.7%</td>
<td>26.8%</td>
<td>14.4%</td>
<td>11.8%</td>
<td>19.8%</td>
<td>27.0%</td>
<td>17.8%</td>
<td>22.9%</td>
</tr>
<tr>
<td>StarCoder-Base</td>
<td>16B</td>
<td>43.2%</td>
<td>29.1%</td>
<td>11.0%</td>
<td>20.6%</td>
<td>23.6%</td>
<td>32.2%</td>
<td>15.6%</td>
<td>24.6%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>7B</td>
<td>41.9%</td>
<td>24.6%</td>
<td>14.8%</td>
<td>16.2%</td>
<td>18.9%</td>
<td>17.4%</td>
<td>17.8%</td>
<td>22.1%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>13B</td>
<td>46.5%</td>
<td>28.6%</td>
<td>18.2%</td>
<td>19.1%</td>
<td>18.9%</td>
<td>27.8%</td>
<td>33.3%</td>
<td>26.8%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>34B</td>
<td>50.3%</td>
<td>42.7%</td>
<td>23.0%</td>
<td>25.0%</td>
<td>28.3%</td>
<td>33.9%</td>
<td>40.0%</td>
<td>34.3%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>1.3B</td>
<td>32.3%</td>
<td>21.4%</td>
<td>9.3%</td>
<td>8.8%</td>
<td>8.5%</td>
<td>16.5%</td>
<td>8.9%</td>
<td>16.2%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>48.4%</td>
<td>35.5%</td>
<td>20.6%</td>
<td>19.1%</td>
<td>22.6%</td>
<td>38.3%</td>
<td>24.4%</td>
<td>30.5%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>33B</td>
<td>56.1%</td>
<td>49.6%</td>
<td>25.8%</td>
<td>36.8%</td>
<td>36.8%</td>
<td>40.0%</td>
<td>46.7%</td>
<td>40.2%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: 各模型在 DS-1000 基准上的性能。</p>
</blockquote>
<p>如表 4 所示，DeepSeek-Coder 模型在所有库中都取得了相对较高的准确率，证明我们的模型不仅能够生成良好的代码，还能在真实数据科学工作流中更准确地使用库。</p>
<p><strong>LeetCode 竞赛基准</strong> 为了进一步验证模型在真实编程问题中的能力，我们构建了 LeetCode 竞赛基准。LeetCode 提供竞赛级问题，对模型的问题理解和代码生成技能提出重大挑战。我们收集了 LeetCode 竞赛的最新题目以防止预训练数据中出现这些问题或解答。共收集了 2023 年 7 月至 2024 年 1 月的 180 道问题，每道题收集 100 个测试用例以确保测试覆盖。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>Easy(45)</th>
<th>Medium(91)</th>
<th>Hard(44)</th>
<th>Overall(180)</th>
</tr>
</thead>
<tbody><tr>
<td>WizardCoder-V1.0</td>
<td>15B</td>
<td>17.8%</td>
<td>1.1%</td>
<td>0.0%</td>
<td>5.0%</td>
</tr>
<tr>
<td>CodeLlama-Instruct</td>
<td>34B</td>
<td>24.4%</td>
<td>4.4%</td>
<td>4.5%</td>
<td>9.4%</td>
</tr>
<tr>
<td>Phind-CodeLlama-V2</td>
<td>34B</td>
<td>26.7%</td>
<td>8.8%</td>
<td>9.1%</td>
<td>13.3%</td>
</tr>
<tr>
<td>GPT-3.5-Turbo</td>
<td>-</td>
<td>46.7%</td>
<td>15.4%</td>
<td>15.9%</td>
<td>23.3%</td>
</tr>
<tr>
<td>GPT-3.5-Turbo + CoT</td>
<td>-</td>
<td>42.2%</td>
<td>15.4%</td>
<td>20.5%</td>
<td>23.3%</td>
</tr>
<tr>
<td>GPT-4-Turbo</td>
<td>-</td>
<td>73.3%</td>
<td>31.9%</td>
<td>25.0%</td>
<td>40.6%</td>
</tr>
<tr>
<td>GPT-4-Turbo + CoT</td>
<td>-</td>
<td>71.1%</td>
<td>35.2%</td>
<td>25.0%</td>
<td>41.8%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>1.3B</td>
<td>22.2%</td>
<td>1.1%</td>
<td>4.5%</td>
<td>7.2%</td>
</tr>
<tr>
<td>DS-Coder-Instruct + CoT</td>
<td>1.3B</td>
<td>22.2%</td>
<td>2.2%</td>
<td>2.3%</td>
<td>7.2%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>6.7B</td>
<td>44.4%</td>
<td>12.1%</td>
<td>9.1%</td>
<td>19.4%</td>
</tr>
<tr>
<td>DS-Coder-Instruct + CoT</td>
<td>6.7B</td>
<td>44.4%</td>
<td>17.6%</td>
<td>4.5%</td>
<td>21.1%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>57.8%</td>
<td>22.0%</td>
<td>9.1%</td>
<td>27.8%</td>
</tr>
<tr>
<td>DS-Coder-Instruct + CoT</td>
<td>33B</td>
<td>53.3%</td>
<td>25.3%</td>
<td>11.4%</td>
<td>28.9%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: 各模型在 LeetCode 竞赛基准上的性能。</p>
</blockquote>
<p>DeepSeek-Coder-Instruct 6.7B 和 33B 在此基准上分别取得 19.4% 和 27.8% 的 Pass@1 分数，显著超越 CodeLlama-33B 等现有开源模型。DeepSeek-Coder-Instruct 33B 是唯一在此任务上超越 OpenAI GPT-3.5-Turbo 的开源模型。然而，与更先进的 GPT-4-Turbo 相比仍存在显著性能差距。</p>
<p>我们的分析表明，Chain-of-Thought(CoT)提示显著增强了 DeepSeek-Coder-Instruct 模型的能力，这种改进在更具挑战性的任务子集中尤为明显。在初始提示后添加指令「You need first to write a step-by-step outline and then write the code.」，我们观察到性能提升。这说明首先编写详细的代码描述有助于模型更有效地理解和处理编码任务中逻辑和依赖关系的复杂性，特别是更高复杂度的任务。</p>
<blockquote>
<p>译者注: CoT 对代码生成的增益主要体现在 Medium 难度题目上(+5.5% for 6.7B, +3.3% for 33B)，但在 Hard 上反而有轻微下降。这可能是因为 Hard 题目本身就已经很难，额外的 CoT 步骤可能引入了更多出错的机会。论文坦诚地承认了数据污染的可能性——LeetCode 的题目和解答广泛存在于 GitHub 上，即使采取了时间过滤(2023 年 7 月后的题目)，也无法完全排除模型在预训练时见过类似题目或解法。</p>
</blockquote>
<h3 id="4-2-fill-in-the-middle-dmbq">4.2 Fill-in-the-Middle 代码补全</h3>
<p>DeepSeek-Coder 模型在预训练阶段以 0.5 的 FIM 率进行训练。这种专门的训练策略使模型能够熟练地基于给定代码片段的前后上下文生成填空代码。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>Python</th>
<th>Java</th>
<th>JavaScript</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>SantaCoder</td>
<td>1.1B</td>
<td>44.0%</td>
<td>62.0%</td>
<td>74.0%</td>
<td>69.0%</td>
</tr>
<tr>
<td>StarCoder</td>
<td>16B</td>
<td>62.0%</td>
<td>73.0%</td>
<td>74.0%</td>
<td>69.7%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>7B</td>
<td>67.6%</td>
<td>74.3%</td>
<td>80.2%</td>
<td>69.7%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>13B</td>
<td>68.3%</td>
<td>77.6%</td>
<td>80.7%</td>
<td>75.5%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>1.3B</td>
<td>57.4%</td>
<td>82.2%</td>
<td>71.7%</td>
<td>70.4%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>66.6%</td>
<td>88.1%</td>
<td>79.7%</td>
<td>80.7%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>33B</td>
<td>65.4%</td>
<td>86.6%</td>
<td>82.5%</td>
<td>81.2%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: 各模型在 FIM 任务上的性能。</p>
</blockquote>
<p>如表 6 所示，即使是最小的 1.3B 参数模型，DeepSeek-Coder 在这些基准上也超越了更大的同类模型 StarCoder 和 CodeLlama。基于这些发现，我们推荐将 DeepSeek-Coder-Base 6.7B 模型部署于代码补全工具中。该模型在效率和准确率之间取得了良好的平衡，已被证明在代码补全场景中非常有效。</p>
<h3 id="4-3-kwjdmbq">4.3 跨文件代码补全</h3>
<p>本节评估现有开源模型在跨文件代码补全任务中的性能。与前面讨论的代码生成不同，跨文件代码补全要求模型访问和理解跨越多个文件且具有众多跨文件依赖关系的仓库。</p>
<p>我们使用 CrossCodeEval 来评估当前可用的 7B 规模开源代码模型在跨文件补全任务中的能力。该数据集基于四种流行编程语言(Python、Java、TypeScript、C#)的各种真实世界开源仓库构建，专门设计为严格需要跨文件上下文才能准确补全。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>Python EM</th>
<th>Python ES</th>
<th>Java EM</th>
<th>Java ES</th>
<th>TS EM</th>
<th>TS ES</th>
<th>C# EM</th>
<th>C# ES</th>
</tr>
</thead>
<tbody><tr>
<td>CodeGeex2</td>
<td>6B</td>
<td>8.11%</td>
<td>59.55%</td>
<td>7.34%</td>
<td>59.60%</td>
<td>6.14%</td>
<td>55.50%</td>
<td>1.70%</td>
<td>51.66%</td>
</tr>
<tr>
<td>+ Retrieval</td>
<td></td>
<td>10.73%</td>
<td>61.76%</td>
<td>10.10%</td>
<td>59.56%</td>
<td>7.72%</td>
<td>55.17%</td>
<td>4.64%</td>
<td>52.30%</td>
</tr>
<tr>
<td>StarCoder-Base</td>
<td>7B</td>
<td>6.68%</td>
<td>59.55%</td>
<td>8.65%</td>
<td>62.57%</td>
<td>5.01%</td>
<td>48.83%</td>
<td>4.75%</td>
<td>59.53%</td>
</tr>
<tr>
<td>+ Retrieval</td>
<td></td>
<td>13.06%</td>
<td>64.24%</td>
<td>15.61%</td>
<td>64.78%</td>
<td>7.54%</td>
<td>42.06%</td>
<td>14.20%</td>
<td>65.03%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>7B</td>
<td>7.32%</td>
<td>59.66%</td>
<td>9.68%</td>
<td>62.64%</td>
<td>8.19%</td>
<td>58.50%</td>
<td>4.07%</td>
<td>59.19%</td>
</tr>
<tr>
<td>+ Retrieval</td>
<td></td>
<td>13.02%</td>
<td>64.30%</td>
<td>16.41%</td>
<td>64.64%</td>
<td>12.34%</td>
<td>60.64%</td>
<td>13.19%</td>
<td>63.04%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>9.53%</td>
<td>61.65%</td>
<td>10.80%</td>
<td>61.77%</td>
<td>9.59%</td>
<td>60.17%</td>
<td>5.26%</td>
<td>61.32%</td>
</tr>
<tr>
<td>+ Retrieval</td>
<td></td>
<td>16.14%</td>
<td>66.51%</td>
<td>17.72%</td>
<td>63.18%</td>
<td>14.03%</td>
<td>61.77%</td>
<td>16.23%</td>
<td>63.42%</td>
</tr>
<tr>
<td>+ Retrieval w/o Repo Pre-training</td>
<td></td>
<td>16.02%</td>
<td>66.65%</td>
<td>16.64%</td>
<td>61.88%</td>
<td>13.23%</td>
<td>60.92%</td>
<td>14.48%</td>
<td>62.38%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: 各模型在跨文件代码补全上的性能。(EM=Exact Match, ES=Edit Similarity)</p>
</blockquote>
<p>结果(表 7)表明，DeepSeek-Coder 在多种语言的跨文件补全任务中 consistently 超越其他模型，展示了其 superior 的实际应用能力。当仅使用文件级代码语料库(w/o Repo Pre-training)预训练 DeepSeek-Coder 时，我们观察到 Java、TypeScript 和 C# 语言中性能下降，表明了仓库级预训练的有效性。</p>
<blockquote>
<p>数据与实验节点: 表 7 中的消融实验「w/o Repo Pre-training」是整篇论文中最有说服力的证据之一。它精确地隔离了「仓库级预训练」的因果效应:在控制模型架构、参数规模、训练数据量和其他条件不变的情况下，仅将预训练数据从「仓库级」替换为「文件级」，跨文件补全性能在 Java(-1.08% EM)、TypeScript(-0.80% EM)和 C#(-1.75% EM)上均有下降。这个下降幅度虽然不大，但在跨文件补全这种已经很难的任务上(基线 EM 只有 5-10%)，相对提升是显著的。这也说明仓库级预训练的收益主要体现在「需要理解跨文件依赖」的任务上，对纯文件内补全的收益有限。</p>
</blockquote>
<h3 id="4-4-cxfzsxtl">4.4 程序辅助数学推理</h3>
<p>程序辅助数学推理评估模型通过编程理解和解决数学问题的能力。我们采用 Program-Aided Math Reasoning(PAL)方法，在 GSM8K、MATH、GSM-Hard、SVAMP、TabMWP、ASDiv 和 MAWPS 七个基准上进行评估。在每个基准中，模型被提示交替用自然语言描述解题步骤，然后用代码执行该步骤。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>GSM8K</th>
<th>MATH</th>
<th>GSM-Hard</th>
<th>SVAMP</th>
<th>TabMWP</th>
<th>ASDiv</th>
<th>MAWPS</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>CodeGeex-2</td>
<td>7B</td>
<td>22.2%</td>
<td>9.7%</td>
<td>23.6%</td>
<td>39.0%</td>
<td>44.6%</td>
<td>48.5%</td>
<td>66.0%</td>
<td>36.2%</td>
</tr>
<tr>
<td>StarCoder-Base</td>
<td>16B</td>
<td>23.4%</td>
<td>10.3%</td>
<td>23.0%</td>
<td>42.4%</td>
<td>45.0%</td>
<td>54.9%</td>
<td>81.1%</td>
<td>40.0%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>7B</td>
<td>31.2%</td>
<td>12.1%</td>
<td>30.2%</td>
<td>54.2%</td>
<td>52.9%</td>
<td>59.6%</td>
<td>82.6%</td>
<td>46.1%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>13B</td>
<td>43.1%</td>
<td>14.4%</td>
<td>40.2%</td>
<td>59.2%</td>
<td>60.3%</td>
<td>63.6%</td>
<td>85.3%</td>
<td>52.3%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>34B</td>
<td>58.2%</td>
<td>21.2%</td>
<td>51.8%</td>
<td>70.3%</td>
<td>69.8%</td>
<td>70.7%</td>
<td>91.8%</td>
<td>62.0%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>1.3B</td>
<td>14.6%</td>
<td>16.8%</td>
<td>14.5%</td>
<td>36.7%</td>
<td>30.0%</td>
<td>48.2%</td>
<td>62.3%</td>
<td>31.9%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>43.2%</td>
<td>19.2%</td>
<td>40.3%</td>
<td>58.4%</td>
<td>67.9%</td>
<td>67.2%</td>
<td>87.0%</td>
<td>54.7%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>33B</td>
<td>60.7%</td>
<td>29.1%</td>
<td>54.1%</td>
<td>71.6%</td>
<td>75.3%</td>
<td>76.7%</td>
<td>93.3%</td>
<td>65.8%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: 各模型在程序辅助数学推理任务上的性能。</p>
</blockquote>
<p>如表 8 所示，DeepSeek-Coder 模型在所有基准上均表现出色，特别是 33B 版本，展示了使用此类模型在需要复杂数学计算和问题解决能力的应用中的潜力。</p>
<hr>
<h2 id="5-ctydyymxjxyxl">5. 从通用大语言模型继续预训练</h2>
<p>为进一步增强 DeepSeek-Coder 模型的自然语言理解和数学推理能力，我们在通用语言模型 DeepSeek-LLM-7B Base 上进行了额外的 2 万亿 token 预训练，得到了 DeepSeek-Coder-v1.5 7B。预训练使用的数据源及占比如表 9 所示。与 DeepSeek-Coder 不同，v1.5 仅使用下一 token 预测目标，上下文长度为 4K。</p>
<table>
<thead>
<tr>
<th>数据源</th>
<th>占比</th>
</tr>
</thead>
<tbody><tr>
<td>源代码</td>
<td>70%</td>
</tr>
<tr>
<td>Markdown 和 StackExchange</td>
<td>10%</td>
</tr>
<tr>
<td>代码相关自然语言</td>
<td>7%</td>
</tr>
<tr>
<td>数学相关自然语言</td>
<td>7%</td>
</tr>
<tr>
<td>中英双语自然语言</td>
<td>6%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 9: DeepSeek-Coder-v1.5 7B 预训练数据源。</p>
</blockquote>
<p>我们将 DeepSeek-Coder-v1.5 7B 与 DeepSeek-Coder 6.7B 进行比较，使用相同的评估流水线重新运行所有基准以确保公平比较。评估涵盖编程、数学推理和自然语言三类任务:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>HumanEval</th>
<th>MBPP</th>
<th>GSM8K</th>
<th>MATH</th>
<th>MMLU</th>
<th>BBH</th>
<th>HellaSwag</th>
<th>WinoG</th>
<th>ARC-C</th>
</tr>
</thead>
<tbody><tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>44.7%</td>
<td>60.6%</td>
<td>43.2%</td>
<td>19.2%</td>
<td>36.6%</td>
<td>44.3%</td>
<td>53.8%</td>
<td>57.1%</td>
<td>32.5%</td>
</tr>
<tr>
<td>DS-Coder-Base-v1.5</td>
<td>6.9B</td>
<td>43.2%</td>
<td>60.4%</td>
<td>62.4%</td>
<td>24.7%</td>
<td>49.1%</td>
<td>55.2%</td>
<td>69.9%</td>
<td>63.8%</td>
<td>47.2%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>6.7B</td>
<td>66.1%</td>
<td>65.4%</td>
<td>62.8%</td>
<td>28.6%</td>
<td>37.2%</td>
<td>46.9%</td>
<td>55.0%</td>
<td>57.6%</td>
<td>37.4%</td>
</tr>
<tr>
<td>DS-Coder-Instruct-v1.5</td>
<td>6.9B</td>
<td>64.1%</td>
<td>64.6%</td>
<td>72.6%</td>
<td>34.1%</td>
<td>49.5%</td>
<td>53.3%</td>
<td>72.2%</td>
<td>63.4%</td>
<td>48.1%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 10: DeepSeek-Coder-Base 与 DeepSeek-Coder-v1.5 的对比。数学任务通过编程解决。</p>
</blockquote>
<p>观察到，尽管 DeepSeek-Coder-Base-v1.5 在编码性能上略有下降，但在大多数任务上相比 DeepSeek-Coder-Base 表现出显著改进。特别是在数学推理和自然语言类别中，v1.5 在所有基准上都显著超越前身，这也证明了其在数学推理和自然语言处理能力上的显著提升。</p>
<blockquote>
<p>谱系与影响节点: DeepSeek-Coder-v1.5 是后续 DeepSeek-Math 的直接基座——DeepSeek-Math 就是从 DeepSeek-Coder-Base-v1.5 7B 出发，在 120B 数学 token 上继续预训练得到的。v1.5 的数据配比(70% 代码 + 20% 自然语言/数学)相比原始 DeepSeek-Coder(87% 代码 + 13% 自然语言)更加均衡，这使得它在保持代码能力的同时大幅提升了通用推理和数学能力。这个实验为后来 DeepSeek-Coder-V2 的「60% 代码 + 10% 数学 + 30% 自然语言」配比提供了重要的实证依据。</p>
</blockquote>
<hr>
<h2 id="6-jl">6. 结论</h2>
<p>本文中，我们介绍了 DeepSeek-Coder 系列，一系列从 1.3B 到 33B 参数的开源代码模型，在 2 万亿 token 上从零训练。这些模型在高质量的项目级代码语料库上预训练，并采用 16K 窗口的填空任务来增强代码生成和填充能力。我们的广泛评估表明，DeepSeek-Coder 不仅在多个基准上达到了开源代码模型的 state-of-the-art 性能，还超越了 Codex 和 GPT-3.5 等现有闭源模型。</p>
<hr>
<h2 id="fl-a-syb">附录 A: 术语表</h2>
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
<td>FIM</td>
<td>Fill-In-the-Middle</td>
<td>引言</td>
<td>中间填充,代码补全训练目标</td>
</tr>
<tr>
<td>GQA</td>
<td>Grouped-Query-Attention</td>
<td>模型架构</td>
<td>分组查询注意力,减少 KV Cache</td>
</tr>
<tr>
<td>RoPE</td>
<td>Rotary Position Embedding</td>
<td>模型架构</td>
<td>旋转位置编码</td>
</tr>
<tr>
<td>BPE</td>
<td>Byte Pair Encoding</td>
<td>分词器</td>
<td>字节对编码分词算法</td>
</tr>
<tr>
<td>CoT</td>
<td>Chain-of-Thought</td>
<td>实验结果</td>
<td>链式思维提示</td>
</tr>
<tr>
<td>PSM</td>
<td>Prefix-Suffix-Middle</td>
<td>训练策略</td>
<td>FIM 的一种序列组织模式</td>
</tr>
<tr>
<td>MSP</td>
<td>Masked Span Prediction</td>
<td>训练策略</td>
<td>掩码跨度预测</td>
</tr>
<tr>
<td>EM</td>
<td>Exact Match</td>
<td>跨文件补全</td>
<td>精确匹配率</td>
</tr>
<tr>
<td>ES</td>
<td>Edit Similarity</td>
<td>跨文件补全</td>
<td>编辑相似度</td>
</tr>
<tr>
<td>PAL</td>
<td>Program-Aided Math Reasoning</td>
<td>数学推理</td>
<td>程序辅助数学推理</td>
</tr>
</tbody></table>
<h2 id="fl-b-hxsjhz">附录 B: 核心数据汇总</h2>
<table>
<thead>
<tr>
<th>任务</th>
<th>基准</th>
<th>DS-Coder-Base 1.3B</th>
<th>6.7B</th>
<th>33B</th>
<th>DS-Coder-Instruct 33B</th>
</tr>
</thead>
<tbody><tr>
<td>代码生成</td>
<td>HumanEval(平均)</td>
<td>28.3%</td>
<td>44.7%</td>
<td>50.3%</td>
<td>69.2%</td>
</tr>
<tr>
<td>代码生成</td>
<td>MBPP</td>
<td>46.2%</td>
<td>60.6%</td>
<td>66.0%</td>
<td>70.0%</td>
</tr>
<tr>
<td>数据科学</td>
<td>DS-1000(平均)</td>
<td>16.2%</td>
<td>30.5%</td>
<td>40.2%</td>
<td>-</td>
</tr>
<tr>
<td>竞赛编程</td>
<td>LeetCode</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>28.9%(+CoT)</td>
</tr>
<tr>
<td>FIM 补全</td>
<td>FIM(平均)</td>
<td>70.4%</td>
<td>80.7%</td>
<td>81.2%</td>
<td>-</td>
</tr>
<tr>
<td>跨文件补全</td>
<td>CrossCodeEval(EM)</td>
<td>-</td>
<td>9.53%</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>数学推理</td>
<td>GSM8K(PAL)</td>
<td>14.6%</td>
<td>43.2%</td>
<td>60.7%</td>
<td>-</td>
</tr>
<tr>
<td>数学推理</td>
<td>MATH(PAL)</td>
<td>16.8%</td>
<td>19.2%</td>
<td>29.1%</td>
<td>-</td>
</tr>
</tbody></table>
<h2 id="fl-c-mxpxdw">附录 C: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: DeepSeek-LLM(通用语言模型,为 Coder 提供基础架构)</li>
<li><strong>核心创新</strong>:<ul>
<li>首次在预训练阶段引入仓库级数据构建(拓扑排序 + 仓库级去重)</li>
<li>系统分析 FIM 训练策略对代码预训练的影响(50% PSM 最优)</li>
<li>开源代码模型首次在 HumanEval 上超越 GPT-3.5-Turbo</li>
<li>验证了代码预训练对数学推理的正向迁移</li>
</ul>
</li>
<li><strong>被后续工作引用/影响</strong>:<ul>
<li>DeepSeek-Coder-Base-v1.5 成为 DeepSeek-Math 的初始化基座</li>
<li>数据工程方法(过滤规则、依赖解析)被 DeepSeek-Coder-V2 继承和扩展</li>
<li>FIM 训练策略成为后续代码模型的标准配置</li>
</ul>
</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1. 引言"},{"level":3,"id":"1-1-zygx","text":"1.1 主要贡献"},{"level":3,"id":"1-2-pcyzbgs","text":"1.2 评测与指标概述"},{"level":2,"id":"2-sjsj","text":"2. 数据收集"},{"level":3,"id":"2-1-git-hub-sjpqygl","text":"2.1 GitHub 数据爬取与过滤"},{"level":3,"id":"2-2-yljx","text":"2.2 依赖解析"},{"level":3,"id":"2-3-ckjqz","text":"2.3 仓库级去重"},{"level":3,"id":"2-4-zlsxyqwr","text":"2.4 质量筛选与去污染"},{"level":2,"id":"3-xlcl","text":"3. 训练策略"},{"level":3,"id":"3-1-xlmb","text":"3.1 训练目标"},{"level":3,"id":"3-2-fcq","text":"3.2 分词器"},{"level":3,"id":"3-3-mxjg","text":"3.3 模型架构"},{"level":3,"id":"3-4-yh","text":"3.4 优化"},{"level":3,"id":"3-5-xlhj","text":"3.5 训练环境"},{"level":3,"id":"3-6-csxw","text":"3.6 长上下文"},{"level":3,"id":"3-7-zlwt","text":"3.7 指令微调"},{"level":2,"id":"4-syjg","text":"4. 实验结果"},{"level":3,"id":"4-1-dmsc","text":"4.1 代码生成"},{"level":3,"id":"4-2-fill-in-the-middle-dmbq","text":"4.2 Fill-in-the-Middle 代码补全"},{"level":3,"id":"4-3-kwjdmbq","text":"4.3 跨文件代码补全"},{"level":3,"id":"4-4-cxfzsxtl","text":"4.4 程序辅助数学推理"},{"level":2,"id":"5-ctydyymxjxyxl","text":"5. 从通用大语言模型继续预训练"},{"level":2,"id":"6-jl","text":"6. 结论"},{"level":2,"id":"fl-a-syb","text":"附录 A: 术语表"},{"level":2,"id":"fl-b-hxsjhz","text":"附录 B: 核心数据汇总"},{"level":2,"id":"fl-c-mxpxdw","text":"附录 C: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/01-deep-seek-coder-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/01-deep-seek-coder-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder 技术报告精译</h1>
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
