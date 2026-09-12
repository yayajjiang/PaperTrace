"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama 3 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: The Llama 3 Herd of Models
原文链接: <a href="https://arxiv.org/abs/2407.21783">https://arxiv.org/abs/2407.21783</a>
发布日期: 2024 年 7 月 23 日
发布机构: Llama Team, AI @ Meta</p>
</blockquote>
<hr>
<h2 id="abstract">Abstract</h2>
<p>现代人工智能(AI)系统由基础模型驱动。本文介绍了一组新的基础模型——Llama 3。它是一个语言模型系列，原生支持多语言、编码、推理和工具使用。我们最大的模型是一个具有 405B 参数和最高 128K token 上下文窗口的 dense Transformer。本文对 Llama 3 进行了广泛的实证评估，发现 Llama 3 在大量任务上提供了与 GPT-4 等领先语言模型相当的质量。我们公开发布 Llama 3，包括 405B 参数语言模型的预训练和后训练版本，以及用于输入和输出安全的 Llama Guard 3 模型。本文还展示了通过组合式方法将图像、视频和语音能力集成到 Llama 3 中的实验结果。我们观察到这种方法在图像、视频和语音识别任务上与 SOTA 表现相当。生成的模型尚未广泛发布，因为它们仍在开发中。</p>
<hr>
<h2 id="1-introduction">1 Introduction</h2>
<p>基础模型是为支持大量 AI 任务而设计的通用语言、视觉、语音和/或其他模态模型。它们构成了许多现代 AI 系统的基础。</p>
<p>现代基础模型的开发包括两个主要阶段：(1) 预训练阶段，在此阶段模型使用简单的任务(如下一个词预测或描述)进行大规模训练; (2) 后训练阶段，在此阶段模型被微调以遵循指令、与人类偏好对齐并改进特定能力(如编码和推理)。</p>
<p><strong>表 1: Llama 3 系列模型概览</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>微调</th>
<th>多语言</th>
<th>长上下文</th>
<th>工具使用</th>
<th>发布时间</th>
</tr>
</thead>
<tbody><tr>
<td>Llama 3 8B</td>
<td>否</td>
<td>部分</td>
<td>否</td>
<td>否</td>
<td>2024 年 4 月</td>
</tr>
<tr>
<td>Llama 3 8B Instruct</td>
<td>是</td>
<td>部分</td>
<td>否</td>
<td>否</td>
<td>2024 年 4 月</td>
</tr>
<tr>
<td>Llama 3 70B</td>
<td>否</td>
<td>部分</td>
<td>否</td>
<td>否</td>
<td>2024 年 4 月</td>
</tr>
<tr>
<td>Llama 3 70B Instruct</td>
<td>是</td>
<td>部分</td>
<td>否</td>
<td>否</td>
<td>2024 年 4 月</td>
</tr>
<tr>
<td>Llama 3.1 8B</td>
<td>否</td>
<td>是</td>
<td>是</td>
<td>否</td>
<td>2024 年 7 月</td>
</tr>
<tr>
<td>Llama 3.1 8B Instruct</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>2024 年 7 月</td>
</tr>
<tr>
<td>Llama 3.1 70B</td>
<td>否</td>
<td>是</td>
<td>是</td>
<td>否</td>
<td>2024 年 7 月</td>
</tr>
<tr>
<td>Llama 3.1 70B Instruct</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>2024 年 7 月</td>
</tr>
<tr>
<td>Llama 3.1 405B</td>
<td>否</td>
<td>是</td>
<td>是</td>
<td>否</td>
<td>2024 年 7 月</td>
</tr>
<tr>
<td>Llama 3.1 405B Instruct</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>是</td>
<td>2024 年 7 月</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：表 1 揭示了一个重要的产品策略。Meta 采取了&quot;分阶段发布&quot;的方式：4 月先发布 8B 和 70B 的 Llama 3(不支持多语言和长上下文)，7 月再发布 Llama 3.1(全面支持多语言、128K 长上下文和工具使用)。这种策略允许 Meta 在开发 405B 旗舰模型的同时，先用小规模模型建立生态和社区反馈。值得注意的是，Llama 3.1 在 7 月发布时，同时提供了 8B、70B 和 405B 三个尺寸，这是开源社区首次出现 400B+ 级别的开源 dense 模型。</p>
</blockquote>
<p>在本文中，我们介绍了一组新的语言基础模型——Llama 3。Llama 3 系列模型原生支持多语言、编码、推理和工具使用。我们最大的模型是一个具有 405B 参数的 dense Transformer，在最高 128K token 的上下文窗口中处理信息。该系列的每个成员都列在表 1 中。本文展示的所有结果均针对 Llama 3.1 模型，为简洁起见，我们在全文中将其称为 Llama 3。</p>
<p>我们认为，开发高质量基础模型有三个关键杠杆：数据、规模和管理复杂性。我们在开发过程中寻求优化这三个杠杆：</p>
<ul>
<li><strong>数据</strong>：与 Llama 的先前的版本相比，我们改进了预训练和后训练所用数据的数量和质量。这些改进包括开发更仔细的预训练数据预处理和筛选流程，以及开发更严格的后训练数据质量保证和过滤方法。我们在约 15T 多语言 token 的语料上预训练 Llama 3，而 Llama 2 仅使用 1.8T token。</li>
<li><strong>规模</strong>：我们以远大于此前 Llama 模型的规模训练模型：我们的旗舰语言模型使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs 进行预训练，几乎是 Llama 2 最大版本的 50 倍。具体来说，我们在 15.6T 文本 token 上预训练了一个具有 405B 可训练参数的旗舰模型。正如基础模型的缩放定律所预期的那样，我们的旗舰模型在使用相同流程训练的较小模型上表现更优。虽然我们的缩放定律表明，对于我们的训练预算而言，旗舰模型是一个近似计算最优的规模，但我们也以远超计算最优的方式训练了较小的模型。得到的模型在相同推理预算下表现优于计算最优模型。我们在后训练期间使用旗舰模型来进一步提高较小模型的质量。</li>
<li><strong>管理复杂性</strong>：我们做出设计选择以最大化扩展模型开发过程的能力。例如，我们选择标准的 dense Transformer 模型架构并进行小幅调整，而非混合专家模型(MoE)，以最大化训练稳定性。类似地，我们采用基于监督微调(SFT)、拒绝采样(RS)和直接偏好优化(DPO)的相对简单的后训练流程，而非往往更不稳定且更难扩展的更复杂的强化学习算法。</li>
</ul>
<p>我们工作的结果是 Llama 3：一个包含 8B、70B 和 405B 参数的多语言语言模型系列。我们在涵盖广泛语言理解任务的大量基准数据集上评估了 Llama 3 的性能。此外，我们进行了广泛的人工评估，将 Llama 3 与竞争模型进行对比。旗舰 Llama 3 模型在关键基准上的性能概述如表 2 所示。</p>
<p><strong>表 2: Llama 3 微调模型在关键基准评测上的性能</strong></p>
<table>
<thead>
<tr>
<th>类别</th>
<th>基准</th>
<th>8B</th>
<th>Gemma2 9B</th>
<th>Mistral 7B</th>
<th>70B</th>
<th>Mixtral 8x22B</th>
<th>GPT-3.5</th>
<th>405B</th>
<th>Nemotron 340B</th>
<th>GPT-4</th>
<th>GPT-4o</th>
<th>Claude 3.5 Sonnet</th>
</tr>
</thead>
<tbody><tr>
<td>General</td>
<td>MMLU 5-shot</td>
<td>69.4</td>
<td><strong>72.3</strong></td>
<td>61.1</td>
<td><strong>83.6</strong></td>
<td>76.9</td>
<td>70.7</td>
<td>87.3</td>
<td>82.6</td>
<td>85.1</td>
<td>89.1</td>
<td><strong>89.9</strong></td>
</tr>
<tr>
<td></td>
<td>MMLU 0-shot CoT</td>
<td><strong>73.0</strong></td>
<td>72.3</td>
<td>60.5</td>
<td><strong>86.0</strong></td>
<td>79.9</td>
<td>69.8</td>
<td>88.6</td>
<td>78.7</td>
<td>85.4</td>
<td><strong>88.7</strong></td>
<td>88.3</td>
</tr>
<tr>
<td></td>
<td>MMLU-Pro 5-shot CoT</td>
<td><strong>48.3</strong></td>
<td>-</td>
<td>36.9</td>
<td><strong>66.4</strong></td>
<td>56.3</td>
<td>49.2</td>
<td>73.3</td>
<td>62.7</td>
<td>64.8</td>
<td>74.0</td>
<td><strong>77.0</strong></td>
</tr>
<tr>
<td></td>
<td>IFEval</td>
<td><strong>80.4</strong></td>
<td>73.6</td>
<td>57.6</td>
<td><strong>87.5</strong></td>
<td>72.7</td>
<td>69.9</td>
<td><strong>88.6</strong></td>
<td>85.1</td>
<td>84.3</td>
<td>85.6</td>
<td>88.0</td>
</tr>
<tr>
<td>Code</td>
<td>HumanEval 0-shot</td>
<td><strong>72.6</strong></td>
<td>54.3</td>
<td>40.2</td>
<td><strong>80.5</strong></td>
<td>75.6</td>
<td>68.0</td>
<td>89.0</td>
<td>73.2</td>
<td>86.6</td>
<td>90.2</td>
<td><strong>92.0</strong></td>
</tr>
<tr>
<td></td>
<td>MBPP EvalPlus 0-shot</td>
<td><strong>72.8</strong></td>
<td>71.7</td>
<td>49.5</td>
<td><strong>86.0</strong></td>
<td>78.6</td>
<td>82.0</td>
<td>88.6</td>
<td>72.8</td>
<td>83.6</td>
<td>87.8</td>
<td><strong>90.5</strong></td>
</tr>
<tr>
<td>Math</td>
<td>GSM8K 8-shot CoT</td>
<td><strong>84.5</strong></td>
<td>76.7</td>
<td>53.2</td>
<td><strong>95.1</strong></td>
<td>88.2</td>
<td>81.6</td>
<td><strong>96.8</strong></td>
<td>92.3</td>
<td>94.2</td>
<td>96.1</td>
<td>96.4</td>
</tr>
<tr>
<td></td>
<td>MATH 0-shot CoT</td>
<td><strong>51.9</strong></td>
<td>44.3</td>
<td>13.0</td>
<td><strong>68.0</strong></td>
<td>54.1</td>
<td>43.1</td>
<td>73.8</td>
<td>41.1</td>
<td>64.5</td>
<td><strong>76.6</strong></td>
<td>71.1</td>
</tr>
<tr>
<td>Reasoning</td>
<td>ARC-C 0-shot</td>
<td>83.4</td>
<td><strong>87.6</strong></td>
<td>74.2</td>
<td><strong>94.8</strong></td>
<td>88.7</td>
<td>83.7</td>
<td><strong>96.9</strong></td>
<td>94.6</td>
<td>96.4</td>
<td>96.7</td>
<td>96.7</td>
</tr>
<tr>
<td></td>
<td>GPQA 0-shot CoT</td>
<td>32.8</td>
<td>-</td>
<td>28.8</td>
<td><strong>46.7</strong></td>
<td>33.3</td>
<td>30.8</td>
<td>51.1</td>
<td>-</td>
<td>41.4</td>
<td>53.6</td>
<td><strong>59.4</strong></td>
</tr>
<tr>
<td>Tool use</td>
<td>BFCL</td>
<td><strong>76.1</strong></td>
<td>-</td>
<td>60.4</td>
<td>84.8</td>
<td>-</td>
<td><strong>85.9</strong></td>
<td>88.5</td>
<td>86.5</td>
<td>88.3</td>
<td>80.5</td>
<td><strong>90.2</strong></td>
</tr>
<tr>
<td></td>
<td>Nexus</td>
<td><strong>38.5</strong></td>
<td>30.0</td>
<td>24.7</td>
<td><strong>56.7</strong></td>
<td>48.5</td>
<td>37.2</td>
<td><strong>58.7</strong></td>
<td>-</td>
<td>50.3</td>
<td>56.1</td>
<td>45.7</td>
</tr>
<tr>
<td>Long context</td>
<td>ZeroSCROLLS/QuALITY</td>
<td>81.0</td>
<td>-</td>
<td>-</td>
<td>90.5</td>
<td>-</td>
<td>-</td>
<td><strong>95.2</strong></td>
<td>-</td>
<td><strong>95.2</strong></td>
<td>90.5</td>
<td>90.5</td>
</tr>
<tr>
<td></td>
<td>InfiniteBench/En.MC</td>
<td>65.1</td>
<td>-</td>
<td>-</td>
<td>78.2</td>
<td>-</td>
<td>-</td>
<td><strong>83.4</strong></td>
<td>-</td>
<td>72.1</td>
<td>82.5</td>
<td>-</td>
</tr>
<tr>
<td></td>
<td>NIH/Multi-needle</td>
<td>98.8</td>
<td>-</td>
<td>-</td>
<td>97.5</td>
<td>-</td>
<td>-</td>
<td>98.1</td>
<td>-</td>
<td><strong>100.0</strong></td>
<td><strong>100.0</strong></td>
<td>90.8</td>
</tr>
<tr>
<td>Multilingual</td>
<td>MGSM 0-shot CoT</td>
<td><strong>68.9</strong></td>
<td>53.2</td>
<td>29.9</td>
<td><strong>86.9</strong></td>
<td>71.1</td>
<td>51.4</td>
<td><strong>91.6</strong></td>
<td>-</td>
<td>85.9</td>
<td>90.5</td>
<td><strong>91.6</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：表 2 的数据揭示了几个关键洞察。第一，Llama 3 405B 在通用任务(MMLU 87.3%, IFEval 88.6%)上确实达到了 GPT-4 级别(GPT-4 0125 版本 MMLU 85.1%, GPT-4o 89.1%)，验证了&quot;dense 模型在足够规模下可以匹敌 MoE 闭源模型&quot;的假设。第二，8B 小模型在多个基准上超越了同尺寸的 Mistral 7B 和 Gemma 2 9B——这意味着 Llama 3 的训练流程(数据+后训练)具有显著的质量优势，而不仅仅是规模优势。第三，长上下文评测(multi-needle)上 405B 达到 98.1%，接近 GPT-4 的 100%，证明了 128K 上下文窗口的实际可用性。但 GPQA(研究生级科学问答)上 405B 的 51.1% 仍落后于 Claude 3.5 Sonnet 的 59.4%，说明在某些高阶推理任务上，闭源模型仍保持领先。</p>
</blockquote>
<p>我们的实验评估表明，我们的旗舰模型在各种任务上与 GPT-4 等领先语言模型表现相当，接近匹配 SOTA。我们的较小模型是同类别中最佳的，在相似参数数量的替代模型上表现出色。Llama 3 在 helpfulness 和 harmlessness 之间也提供了比其前代更好的平衡。</p>
<p>作为 Llama 3 开发过程的一部分，我们还开发了模型的多模态扩展，实现图像识别、视频识别和语音理解能力。这些模型仍在积极开发中，尚未准备好发布。除语言建模结果外，本文还展示了我们对这些多模态模型的初步实验结果。</p>
<hr>
<h2 id="2-overview">2 Overview</h2>
<p>Llama 3 的模型架构如图 1 所示。我们的 Llama 3 语言模型开发包括两个主要阶段：</p>
<ul>
<li><strong>语言模型预训练</strong>：我们首先将大规模多语言文本语料转换为离散 token，并在所得数据上预训练大语言模型(LLM)以执行下一个 token 预测。在语言模型预训练阶段，模型学习语言结构并从其&quot;阅读&quot;的文本中获取关于世界的大量知识。为有效做到这一点，预训练以大规模进行：我们在 8K token 上下文窗口下，在 15.6T token 上预训练一个 405B 参数的模型。这个标准预训练阶段之后是一个继续预训练阶段，将支持的上下文窗口增加到 128K token。</li>
<li><strong>语言模型后训练</strong>：预训练的语言模型对语言有丰富的理解，但尚未遵循指令或表现出我们期望助手应有的行为。我们通过多轮对齐将模型与人类反馈对齐，每轮都涉及在指令微调数据上进行监督微调(SFT)和直接偏好优化(DPO)。在后训练阶段，我们还整合了新的能力，如工具使用，并在其他领域(如编码和推理)观察到显著改进。最后，安全缓解措施也在后训练阶段纳入模型。</li>
</ul>
<p><img src="/llm-guide/14-models/14.3-llama/03-llama-3/01-llama-3-jsbgjy/images/llama3_language_architecture.pdf" alt="Llama 3 整体架构和训练示意图"></p>
<blockquote>
<p>图 1: Llama 3 整体架构和训练示意图。Llama 3 是一个训练用于预测文本序列下一个 token 的 Transformer 语言模型。</p>
</blockquote>
<p>我们还进行了实验，使用组合式方法为 Llama 3 添加图像、视频和语音能力。我们研究的方法包括三个额外的阶段：</p>
<ul>
<li><strong>多模态Encoder 预训练</strong>：我们为图像和语音训练单独的Encoder 。图像Encoder 在大量图像-文本对上训练，教授模型视觉内容与自然语言描述之间的关系。语音Encoder 使用自监督方法训练，该方法掩码语音输入的部分并尝试通过离散 token 表示重建掩码部分。</li>
<li><strong>视觉适配器训练</strong>：我们训练一个适配器将预训练图像Encoder 集成到预训练语言模型中。适配器由一系列 cross-attention 层组成，将图像Encoder 表示输入语言模型。适配器在文本-图像对上训练。此过程对齐图像表示与语言表示。在适配器训练期间，我们还更新图像Encoder 的参数，但有意不更新语言模型参数。我们还在图像适配器之上训练视频适配器。</li>
<li><strong>语音适配器训练</strong>：最后，我们通过一个适配器将语音Encoder 集成到模型中，该适配器将语音编码转换为可直接输入微调语言模型的 token 表示。适配器和Encoder 的参数在监督微调阶段联合更新以实现高质量语音理解。我们不改变语音适配器训练期间的语言模型。</li>
</ul>
<hr>
<h2 id="3-pre-training">3 Pre-Training</h2>
<p>语言模型预训练涉及：(1) 大规模训练语料的筛选和过滤，(2) 模型架构和相应缩放定律的开发以确定模型规模，(3) 大规模高效预训练技术的开发，以及 (4) 预训练方案的开发。我们在下面分别介绍这些组件。</p>
<h3 id="3-1-pre-training-data">3.1 Pre-Training Data</h3>
<p>我们从包含截至 2023 年底知识的各种数据源创建语言模型预训练数据集。我们对每个数据源应用多种去重方法和数据清理机制以获得高质量 token。我们移除包含大量个人可识别信息(PII)的域，以及已知包含成人内容的域。</p>
<h4 id="web-data-curation">Web Data Curation</h4>
<p>我们使用的大部分数据来自网络，以下描述我们的清理流程。</p>
<p><strong>PII 和安全过滤</strong>：我们实施过滤器以移除可能包含不安全内容或大量 PII 的网站数据，根据 Meta 安全标准被评为有害的域，以及已知包含成人内容的域。</p>
<p><strong>文本提取和清理</strong>：我们处理非截断网络文档的原始 HTML 内容以提取高质量多样化文本。为此，我们构建了一个自定义解析器来提取 HTML 内容并优化 boilerplate 移除的精度和内容召回率。我们在人工评估中评估了解析器质量，与优化文章类内容的流行第三方 HTML 解析器相比，发现其表现更优。我们仔细处理包含数学和代码内容的 HTML 页面以保留这些内容的结构。我们保留图像 alt 属性文本，因为数学内容通常以预渲染图像形式呈现，而数学也在 alt 属性中提供。我们实验评估了不同的清理配置，发现 markdown 对主要在网络数据上训练的模型性能有害，因此我们移除了所有 markdown 标记。</p>
<p><strong>去重</strong>：我们在 URL、文档和行级别应用多轮去重：</p>
<ul>
<li>URL 级去重：我们在整个数据集上执行 URL 级去重，为每个 URL 对应的页面保留最新版本。</li>
<li>文档级去重：我们在整个数据集上执行全局 MinHash 去重以移除近似重复文档。</li>
<li>行级去重：我们执行激进的行级去重，移除在每个 3000 万文档桶中出现超过 6 次的行。虽然手动定性分析显示行级去重不仅移除了各种网站的残留 boilerplate(如导航菜单、Cookie 警告)，还移除了频繁出现的高质量文本，但实证评估显示了显著改进。</li>
</ul>
<p><strong>启发式过滤</strong>：我们开发启发式方法以移除额外的低质量文档、异常值和包含过度重复的文档。例如，我们使用重复 n-gram 覆盖率比率来移除由重复内容(如日志或错误消息)组成的行; 使用&quot;脏词&quot;计数来过滤未被域黑名单覆盖的成人网站; 使用 token 分布的 KL 散度来过滤包含过多异常 token 的文档。</p>
<p><strong>基于模型的质量过滤</strong>：我们实验应用各种基于模型的质量分类器来子选择高质量 token。这些包括使用 fasttext 分类器(训练用于识别给定文本是否会被 Wikipedia 引用)，以及计算量更大的基于 Roberta 的分类器(训练用于 Llama 2 预测)。为训练基于 Llama 2 的质量分类器，我们创建了一个清理后的网络文档训练集，描述质量要求，并指示 Llama 2 的聊天模型判断文档是否满足这些要求。出于效率考虑，我们使用 DistilRoberta 为每个文档生成质量分数。</p>
<p><strong>代码和推理数据</strong>：我们构建领域专用流程来提取代码和数学相关的网页。代码和推理分类器都是基于 Llama 2 标注的网络数据训练的 DistilRoberta 模型。与上述通用质量分类器不同，我们进行提示调优以针对包含数学推导、STEM 领域推理和与自然语言交错的代码的网页。</p>
<p><strong>多语言数据</strong>：我们使用 fasttext 语言识别模型将文档分类为 176 种语言。我们在每种语言的数据内执行文档级和行级去重，并应用语言特定的启发式和基于模型的过滤器来移除低质量文档。此外，我们使用多语言 Llama 2 分类器对多语言文档进行质量排序。</p>
<h4 id="determining-the-data-mix">Determining the Data Mix</h4>
<p>为获得高质量语言模型，仔细确定不同数据源在预训练数据混合中的比例至关重要。我们的主要工具是知识分类和缩放定律实验。</p>
<p><strong>知识分类</strong>：我们开发了一个分类器来分类网络数据中包含的信息类型，以更有效地确定数据混合。我们使用此分类器对网络上过度代表的类别(如艺术和娱乐)进行下采样。</p>
<p><strong>数据混合的缩放定律</strong>：为确定最佳数据混合，我们在数据混合上训练几个小模型，并用其预测大模型在该混合上的性能。我们对不同数据混合重复此过程以选择新的数据混合候选。随后，我们在此候选数据混合上训练更大的模型并评估其在几个关键基准上的性能。</p>
<p><strong>数据混合总结</strong>：我们的最终数据混合大致包含 50% 通用知识 token、25% 数学和推理 token、17% 代码 token 和 8% 多语言 token。</p>
<h4 id="annealing-data">Annealing Data</h4>
<p>实证上，我们发现对小量高质量代码和数学数据进行退火(annealing)可以提升预训练模型在关键基准上的性能。我们在退火时使用上采样选定领域高质量数据的数据混合。我们不包含任何常用基准的训练集在退火数据中。</p>
<p>我们发现退火将预训练的 Llama 3 8B 模型在 GSM8k 和 MATH 验证集上的性能分别提高了 24.0% 和 6.4%。然而，405B 模型上的改进可以忽略不计，这表明我们的旗舰模型具有强大的上下文内学习和推理能力，不需要特定的域内训练样本来获得强劲性能。</p>
<blockquote>
<p>译者注：退火(annealing)是 Llama 3 预训练中的一个关键技巧，但作者坦诚地指出其对 405B 旗舰模型几乎无效——这是一个重要的诚实披露。这意味着对于足够大的模型，预训练阶段已经学到了充分的推理模式，额外的&quot;刷题&quot;式退火数据收益递减。但对 8B 小模型来说，退火带来了 24% 的 GSM8k 提升，说明小模型更依赖高质量域内数据来弥补规模不足。这个数据点对于实际部署有重要启示：如果你只能部署小模型，精心策划的退火数据可以显著提升特定任务性能; 但如果你有足够的资源部署大模型，数据筛选的投入回报比可能不如扩大模型规模。</p>
</blockquote>
<h3 id="3-2-model-architecture">3.2 Model Architecture</h3>
<p>Llama 3 使用标准的 dense Transformer 架构。与 Llama 和 Llama 2 相比，它在模型架构上没有显著偏离; 我们的性能提升主要由数据质量和多样性的改进以及训练规模的增加驱动。</p>
<p>与 Llama 2 相比，我们进行了几项小修改：</p>
<ul>
<li>我们使用 GQA(Grouped Query Attention，分组查询注意力)，8 个 key-value 头，以提高推理速度并减少解码期间的 KV Cache 大小。</li>
<li>我们使用防止同一序列内不同文档之间自注意力的注意力掩码。我们发现此更改在标准预训练中影响有限，但在非常长序列的继续预训练中很重要。</li>
<li>我们使用 128K token 的词表。词表组合了 tiktoken 的 100K token 和 28K 额外 token 以更好地支持非英语语言。与 Llama 2 分词器相比，新分词器将英语数据的压缩率从每个 token 3.17 个字符提高到 3.94 个字符。</li>
<li>我们将 RoPE 基数频率超参数增加到 500,000，以更好地支持更长上下文。</li>
</ul>
<p><strong>表 3: Llama 3 关键超参数概览</strong></p>
<table>
<thead>
<tr>
<th></th>
<th>8B</th>
<th>70B</th>
<th>405B</th>
</tr>
</thead>
<tbody><tr>
<td>层数</td>
<td>32</td>
<td>80</td>
<td>126</td>
</tr>
<tr>
<td>模型维度</td>
<td>4,096</td>
<td>8,192</td>
<td>16,384</td>
</tr>
<tr>
<td>FFN 维度</td>
<td>14,336</td>
<td>28,672</td>
<td>53,248</td>
</tr>
<tr>
<td>注意力头数</td>
<td>32</td>
<td>64</td>
<td>128</td>
</tr>
<tr>
<td>Key/Value 头数</td>
<td>8</td>
<td>8</td>
<td>8</td>
</tr>
<tr>
<td>峰值学习率</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>激活函数</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
<td>SwiGLU</td>
</tr>
<tr>
<td>词表大小</td>
<td>128,000</td>
<td>128,000</td>
<td>128,000</td>
</tr>
<tr>
<td>位置编码</td>
<td>RoPE (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span>=500,000)</td>
<td>RoPE (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span>=500,000)</td>
<td>RoPE (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span>=500,000)</td>
</tr>
</tbody></table>
<p>Llama 3 405B 使用 126 层、16,384 的 token 表示维度和 128 个注意力头的架构。根据我们数据上的缩放定律，该模型规模对于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs 的训练预算而言近似计算最优。</p>
<blockquote>
<p>译者注：Llama 3 405B 的架构选择有几个值得深挖的决策。第一，坚持 dense 架构而非 MoE——在 2024 年，Mixtral 8x7B/8x22B 等 MoE 模型已经证明了稀疏架构的效率优势，但 Meta 选择 dense 路线。原因是&quot;最大化训练稳定性&quot;——dense 架构的梯度流更稳定，超参数调优更简单。这是一个&quot;工程可靠性优先于理论效率&quot;的务实选择。第二，GQA 使用 8 个 KV 头(无论模型大小)，这意味着 405B 模型有 128 个 Q 头但仅 8 个 KV 头——每个 KV 头服务 16 个 Q 头。这大幅压缩了 KV Cache 大小(从 128 倍降至 8 倍)，对长上下文推理至关重要。第三，RoPE 基数从 Llama 2 的 10,000 提高到 500,000——这直接支持了 128K 长上下文，因为更大的基数允许位置编码在更长序列上保持区分度。</p>
</blockquote>
<h3 id="3-3-scaling-laws">3.3 Scaling Laws</h3>
<p>我们开发缩放定律以确定给定预训练计算预算下旗舰模型的最优模型规模。除确定最优模型规模外，一个主要挑战是预测旗舰模型在下游基准任务上的性能，原因有两个问题：(1) 现有缩放定律通常仅预测下一个 token 预测损失而非特定基准性能; (2) 缩放定律可能嘈杂且不可靠，因为它们基于小计算预算的预训练运行开发。</p>
<p>为解决这些挑战，我们实施了两阶段方法来开发准确预测下游基准性能的缩放定律：</p>
<ol>
<li>我们首先建立计算最优模型在下游任务上的负对数似然与训练 FLOPs 之间的相关性。</li>
<li>接下来，我们利用缩放定律模型和使用更高计算 FLOPs 训练的较旧模型，将下游任务上的负对数似然与任务准确率相关联。在此步骤中，我们具体利用 Llama 2 系列模型。</li>
</ol>
<p>这使我们能够预测给定训练 FLOPs 下计算最优模型的下游任务性能。我们使用类似方法选择预训练数据混合。</p>
<p><strong>缩放定律实验</strong>：具体而言，我们通过使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>×</mo><msup><mn>10</mn><mn>18</mn></msup></mrow><annotation encoding="application/x-tex">6 \\times 10^{18}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">18</span></span></span></span></span></span></span></span></span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mn>22</mn></msup></mrow><annotation encoding="application/x-tex">10^{22}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">22</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs 之间的计算预算预训练模型来构建缩放定律。在每个计算预算下，我们预训练规模从 40M 到 16B 参数不等的模型。在这些训练运行中，我们使用余弦学习率调度，线性预热 2000 步。峰值学习率根据模型大小设在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">4 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 之间。我们将余弦衰减设为峰值值的 0.1。每步的权重衰减设为该步学习率的 0.1 倍。</p>
<p>这些实验产生了 IsoFLOPs 曲线。我们在单独验证集上测量损失，使用二次多项式拟合测量的损失值并识别每条抛物线的最小值。我们将抛物线的最小值称为对应预训练计算预算下的计算最优模型。</p>
<p>我们使用这种方式识别的计算最优模型来预测特定计算预算下最优训练 token 数量。为此，我们假设计算预算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi></mrow><annotation encoding="application/x-tex">C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 与最优训练 token 数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>N</mi><mo>⋆</mo></msup><mo stretchy="false">(</mo><mi>C</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">N^\\star(C)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6887em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">⋆</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mclose">)</span></span></span></span> 之间的幂律关系：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msup><mi>N</mi><mo>⋆</mo></msup><mo stretchy="false">(</mo><mi>C</mi><mo stretchy="false">)</mo><mo>=</mo><mi>A</mi><msup><mi>C</mi><mi>α</mi></msup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">N^\\star(C) = A C^\\alpha
\\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">⋆</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7144em;"></span><span class="mord mathnormal">A</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>我们使用 IsoFLOPs 曲线数据拟合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span>，发现 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>α</mi><mo separator="true">,</mo><mi>A</mi><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><mn>0.53</mn><mo separator="true">,</mo><mn>0.29</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(\\alpha, A) = (0.53, 0.29)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">A</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0.53</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0.29</span><span class="mclose">)</span></span></span></span>。将所得缩放定律外推到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs 建议训练一个 402B 参数模型，使用 16.55T token。</p>
<p>一个重要的观察是，随着计算预算增加，IsoFLOPs 曲线在最小值附近变得&quot;更平坦&quot;。这意味着旗舰模型的性能对模型规模与训练 token 之间的权衡的小变化相对稳健。基于这一观察，我们最终决定训练一个 405B 参数的旗舰模型。</p>
<blockquote>
<p>译者注：公式 (1) 是 Chinchilla 缩放定律的变体。关键发现是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.53</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.53</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.53</span></span></span></span>，这意味着计算预算翻倍时，最优 token 数增加约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>2</mn><mn>0.53</mn></msup><mo>≈</mo><mn>1.44</mn></mrow><annotation encoding="application/x-tex">2^{0.53} \\approx 1.44</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.53</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.44</span></span></span></span> 倍。与 DeepSeek 后来发现的&quot;数据应该比模型增长更快&quot;的趋势相比，Llama 3 的缩放定律相对保守。另一个重要洞察是&quot;IsoFLOPs 曲线在最小值附近更平坦&quot;——这意味着在计算预算确定的情况下，模型规模和数据量的小幅偏离最优比例不会显著影响最终性能。这给了工程团队灵活性：不必严格追求理论最优，而可以在硬件限制(如 GPU 内存)和训练时间之间做实际权衡。</p>
</blockquote>
<h3 id="3-4-training-recipe">3.4 Training Recipe</h3>
<p>Llama 3 405B 的预训练方案包括三个主要阶段：(1) 初始预训练，(2) 长上下文预训练，(3) 退火。</p>
<h4 id="initial-pre-training">Initial Pre-Training</h4>
<p>我们使用 AdamW 预训练 Llama 3 405B，峰值学习率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>，线性预热 8,000 步，余弦学习率调度在 1,200,000 步内衰减到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span>。我们在训练早期使用较低的批次大小以提高训练稳定性，随后增加以提高效率。具体来说，我们使用 4M token 的初始批次大小和 4,096 的序列长度，在预训练 252M token 后将这些值翻倍到 8M 批次和 8,192 序列长度。在预训练 2.87T token 后再次翻倍到 16M。我们发现此训练方案非常稳定：观察到很少的 loss spike，不需要干预来纠正模型训练发散。</p>
<h4 id="long-context-pre-training">Long Context Pre-Training</h4>
<p>在预训练的最后阶段，我们在长序列上训练以支持最高 128K token 的上下文窗口。我们不在早期训练长序列，因为自注意力层的计算随序列长度二次方增长。我们逐步增加支持的上下文长度，预训练直到模型成功适应增加的上下文长度。我们通过测量 (1) 模型在短上下文评估上的性能是否完全恢复，以及 (2) 模型是否完美解决到该长度的&quot;大海捞针&quot;任务来评估成功适应。在 Llama 3 405B 预训练中，我们分六个阶段逐步增加上下文长度，从原始 8K 上下文窗口开始到最终 128K 上下文窗口。此长上下文预训练阶段使用了约 800B 训练 token。</p>
<h4 id="annealing">Annealing</h4>
<p>在预训练最后 40M token 期间，我们将学习率线性退火到 0，保持 128K token 的上下文长度。在退火阶段，我们还调整数据混合以上采样非常高质量的数据源。最后，我们计算退火期间模型Checkpoint的平均(polyak averaging)以产生最终预训练模型。</p>
<h3 id="3-5-infrastructure-scaling-and-efficiency">3.5 Infrastructure, Scaling, and Efficiency</h3>
<h4 id="training-infrastructure">Training Infrastructure</h4>
<p>Llama 1 和 2 模型在 Meta 的 AI Research SuperCluster 上训练。随着规模进一步扩大，Llama 3 的训练迁移到 Meta 的生产集群。此设置优化了生产级可靠性，这对扩展训练至关重要。</p>
<p><strong>计算</strong>：Llama 3 405B 在最多 16K H100 GPU 上训练，每块以 700W TDP 运行，配备 80GB HBM3，使用 Meta 的 Grand Teton AI 服务器平台。每台服务器配备 8 个 GPU 和 2 个 CPU。服务器内的 8 个 GPU 通过 NVLink 连接。训练作业使用 MAST(Meta 的全球规模训练调度器)进行调度。</p>
<p><strong>存储</strong>：Tectonic(Meta 的通用分布式文件系统)用于构建 Llama 3 预训练的存储架构。它提供 240 PB 存储，由 7,500 台配备 SSD 的服务器组成，支持 2 TB/s 的持续吞吐量和 7 TB/s 的峰值吞吐量。一个主要挑战是支持高度突发的Checkpoint写入，这些写入会在短时间内饱和存储架构。</p>
<p><strong>网络</strong>：Llama 3 405B 使用基于 Arista 7800 和 Minipack2 OCP 机架交换机的 RoCE(RDMA over Converged Ethernet)架构。较小模型使用 Nvidia Quantum2 Infiniband。两种网络都利用 GPU 之间 400 Gbps 的互联。尽管底层网络技术不同，我们调整两者以提供等效性能。</p>
<ul>
<li><strong>网络拓扑</strong>：RoCE 集群包含 24K GPU，通过三层 Clos 网络连接。底层每个机架托管 16 个 GPU(分在两台服务器中)，由单个 Minipack2 ToR 交换机连接。中间层 192 个机架通过集群交换机连接形成一个 pod(3,072 GPU)，具有全对分带宽。顶层同一数据中心内的 8 个 pod 通过聚合交换机连接形成 24K GPU 的集群。但聚合层不保持全对分带宽， oversubscription 比率为 1:7。</li>
<li><strong>负载均衡</strong>：LLM 训练产生难以用传统 ECMP 路由在所有可用网络路径上负载均衡的胖网络流。我们采用两种技术：集体库在两个 GPU 之间创建 16 个网络流而非 1 个; E-ECMP 协议通过哈希 RoCE 头部的附加字段有效平衡这些流。</li>
<li><strong>拥塞控制</strong>：我们在 spine 中使用 deep-buffer 交换机来容纳集体通信模式引起的瞬态拥塞和缓冲。通过 E-ECMP 更好的负载均衡显著降低了拥塞几率。借助这些优化，我们成功运行 24K GPU 集群而无需传统拥塞控制方法如 DCQCN。</li>
</ul>
<h4 id="parallelism-for-model-scaling">Parallelism for Model Scaling</h4>
<p>为扩展最大模型的训练，我们使用 4D 并行——四种不同类型并行方法的组合来分片模型。这包括张量并行(TP)、流水线并行(PP)、上下文并行(CP)和数据并行(DP，即 FSDP)。</p>
<p><strong>GPU 利用率</strong>：通过仔细调整并行配置、硬件和软件，我们在表 4 所示配置下实现了 38-43% 的整体 BF16 MFU(Model FLOPs Utilization)。</p>
<p><strong>表 4: Llama 3 405B 预训练各阶段的扩展配置和 MFU</strong></p>
<table>
<thead>
<tr>
<th>GPU</th>
<th>TP</th>
<th>CP</th>
<th>PP</th>
<th>DP</th>
<th>序列长度</th>
<th>每 DP 批次</th>
<th>每批次 Token</th>
<th>TFLOPs/GPU</th>
<th>BF16 MFU</th>
</tr>
</thead>
<tbody><tr>
<td>8,192</td>
<td>8</td>
<td>1</td>
<td>16</td>
<td>64</td>
<td>8,192</td>
<td>32</td>
<td>16M</td>
<td>430</td>
<td>43%</td>
</tr>
<tr>
<td>16,384</td>
<td>8</td>
<td>1</td>
<td>16</td>
<td>128</td>
<td>8,192</td>
<td>16</td>
<td>16M</td>
<td>400</td>
<td>41%</td>
</tr>
<tr>
<td>16,384</td>
<td>8</td>
<td>16</td>
<td>16</td>
<td>8</td>
<td>131,072</td>
<td>16</td>
<td>16M</td>
<td>380</td>
<td>38%</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：43% 的 MFU 是什么概念？H100 的 BF16 峰值算力约为 989 TFLOPS(稀疏)或 495 TFLOPS(密集)。以 43% 的 MFU 计算，实际有效算力约为 213 TFLOPS/GPU。在 16K GPU 上训练 405B 模型，每个 GPU 处理约 25M 参数。8K 上下文时 430 TFLOPs/GPU 意味着每个 GPU 每步执行约 430T 浮点运算。考虑到 attention 的二次方复杂度，128K 上下文下的 MFU 降至 38% 是预期的。这些数字与 DeepSeek-V3 报告的 42% MFU 相当，说明两大巨头在超大规模训练效率上达到了相似水平。</p>
</blockquote>
<p><strong>流水线并行改进</strong>：我们遇到现有实现的几个挑战：</p>
<ul>
<li>批次大小约束：当前实现对每 GPU 支持的批次大小有限制，要求可被流水线阶段数整除。</li>
<li>内存不平衡：第一阶段由于嵌入和预热 micro-batch 消耗更多内存。</li>
<li>计算不平衡：最后一层之后需要计算输出和损失，使该阶段成为执行延迟瓶颈。</li>
</ul>
<p>为解决这些问题，我们修改了流水线调度以允许灵活设置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span>(连续 micro-batch 数)。我们还从第一和最后阶段各减少一个 Transformer 层以平衡流水线。为减少流水线气泡，我们使用交错调度。此外，我们在 PP 中采用异步点对点通信，显著加速了训练。</p>
<p><strong>上下文并行</strong>：我们利用 CP 来提高 Llama 3 的内存效率，并支持在最长 128K 的极长序列上训练。在 CP 中，我们跨序列维度进行分区，具体将输入序列分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>C</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">2 \\times CP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span> 块，以便每个 CP 秩接收两个块以实现更好的负载均衡。</p>
<p>与现有在环形结构中重叠通信和计算的 CP 实现不同，我们的 CP 实现采用基于 all-gather 的方法：我们首先 all-gather K 和 V 张量，然后计算本地 Q 张量块的注意力输出。尽管 all-gather 通信延迟暴露在关键路径中，我们仍采用这种方法，原因有二：(1) 更容易支持不同类型的注意力掩码; (2) 由于使用 GQA，通信的 K 和 V 张量远小于 Q 张量，all-gather 开销可忽略不计。</p>
<h4 id="reliability-and-operational-challenges">Reliability and Operational Challenges</h4>
<p>16K GPU 训练的复杂性和潜在故障场景远超我们操作过的更大 CPU 集群。此外，训练的同步性质使其容错性更低——单个 GPU 故障可能需要重启整个作业。</p>
<p>在 54 天的预训练快照期间，我们共经历了 466 次作业中断。其中 47 次是计划中断(固件升级或操作员发起的操作)。其余 419 次是意外中断，约 78% 归因于确认的硬件问题。GPU 问题是最大类别，占所有意外问题的 58.7%。尽管故障数量庞大，此期间仅需 3 次重大人工干预，其余问题由自动化处理。</p>
<p><strong>表 5: Llama 3 405B 预训练 54 天期间意外中断的根因分类</strong></p>
<table>
<thead>
<tr>
<th>组件</th>
<th>类别</th>
<th>中断次数</th>
<th>占比</th>
</tr>
</thead>
<tbody><tr>
<td>故障 GPU</td>
<td>GPU</td>
<td>148</td>
<td>30.1%</td>
</tr>
<tr>
<td>GPU HBM3 内存</td>
<td>GPU</td>
<td>72</td>
<td>17.2%</td>
</tr>
<tr>
<td>软件 Bug</td>
<td>依赖</td>
<td>54</td>
<td>12.9%</td>
</tr>
<tr>
<td>网络交换机/线缆</td>
<td>网络</td>
<td>35</td>
<td>8.4%</td>
</tr>
<tr>
<td>主机维护</td>
<td>非计划维护</td>
<td>32</td>
<td>7.6%</td>
</tr>
<tr>
<td>GPU SRAM 内存</td>
<td>GPU</td>
<td>19</td>
<td>4.5%</td>
</tr>
<tr>
<td>GPU 系统处理器</td>
<td>GPU</td>
<td>17</td>
<td>4.1%</td>
</tr>
<tr>
<td>NIC</td>
<td>主机</td>
<td>7</td>
<td>1.7%</td>
</tr>
<tr>
<td>NCCL Watchdog 超时</td>
<td>未知</td>
<td>7</td>
<td>1.7%</td>
</tr>
<tr>
<td>静默数据损坏</td>
<td>GPU</td>
<td>6</td>
<td>1.4%</td>
</tr>
<tr>
<td>GPU 热界面+传感器</td>
<td>GPU</td>
<td>6</td>
<td>1.4%</td>
</tr>
<tr>
<td>SSD</td>
<td>主机</td>
<td>3</td>
<td>0.7%</td>
</tr>
<tr>
<td>电源</td>
<td>主机</td>
<td>3</td>
<td>0.7%</td>
</tr>
<tr>
<td>服务器机箱</td>
<td>主机</td>
<td>2</td>
<td>0.5%</td>
</tr>
<tr>
<td>IO 扩展板</td>
<td>主机</td>
<td>2</td>
<td>0.5%</td>
</tr>
<tr>
<td>依赖</td>
<td>依赖</td>
<td>2</td>
<td>0.5%</td>
</tr>
<tr>
<td>CPU</td>
<td>主机</td>
<td>2</td>
<td>0.5%</td>
</tr>
<tr>
<td>系统内存</td>
<td>主机</td>
<td>2</td>
<td>0.5%</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：表 5 是这篇论文中最具&quot;工程血泪&quot;色彩的数据。54 天内 466 次中断，平均每天 8.6 次——这意味着训练集群几乎每小时都在经历某种故障。但更令人印象深刻的是自动化处理能力：仅 3 次需要人工干预。这背后是 Meta 在超大规模训练基础设施上的深厚积累。GPU 相关故障占 58.7%(HBM3 内存 17.2% + 故障 GPU 30.1% + SRAM 4.5% + 系统处理器 4.1% + 静默数据损坏 1.4% + 热界面 1.4%)，这与 NVIDIA H100 的早期批次质量有关。值得注意的是&quot;静默数据损坏&quot;(SDC)——这是一种极难检测的故障类型，可能导致模型在无明显错误的情况下学到错误模式。Meta 通过频繁Checkpoint和校验和来缓解这一风险。</p>
</blockquote>
<hr>
<h2 id="4-post-training">4 Post-Training</h2>
<p>我们通过在预训练Checkpoint上应用多轮后训练来产生对齐的 Llama 3 模型，每轮都涉及在指令微调数据上进行 SFT，然后在与人类反馈对齐的数据上进行 DPO。我们的后训练建模和数据方法如下所述。</p>
<h3 id="4-1-modeling">4.1 Modeling</h3>
<p>我们后训练策略的骨干是奖励模型和语言模型。我们首先使用人工标注的偏好数据在预训练Checkpoint之上训练奖励模型。然后我们使用 SFT 微调预训练Checkpoint，并进一步使用 DPO 对齐Checkpoint。</p>
<h4 id="chat-dialog-format">Chat Dialog Format</h4>
<p>为调整 LLM 进行人机交互，我们需要定义聊天对话协议。与前辈相比，Llama 3 具有工具使用等新能力，可能需要在单个对话轮次中生成多条消息并发送到不同位置。为此，我们设计了新的多消息聊天协议，使用各种特殊头部和终止 token。</p>
<h4 id="reward-modeling">Reward Modeling</h4>
<p>我们在预训练Checkpoint之上训练覆盖不同能力的奖励模型。训练目标与 Llama 2 相同，只是我们移除了损失中的 margin 项，因为在数据扩展后观察到收益递减。除了标准的 (chosen, rejected) 偏好对外，标注还为某些提示创建了第三个&quot;编辑响应&quot;，其中对 chosen 响应进行进一步编辑以改进。因此，每个偏好排序样本有两个或三个具有明确排序的响应(edited &gt; chosen &gt; rejected)。</p>
<h4 id="supervised-finetuning">Supervised Finetuning</h4>
<p>奖励模型随后用于对我们的人工标注提示执行拒绝采样。与拒绝采样数据和其他数据源(包括合成数据)一起，我们使用标准交叉熵损失对目标 token 微调预训练语言模型(同时掩码提示 token 上的损失)。我们最大的模型以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 的学习率在 8.5K 到 9K 步上微调。</p>
<h4 id="direct-preference-optimization">Direct Preference Optimization</h4>
<p>我们进一步使用 DPO 训练 SFT 模型以进行人类偏好对齐。对于训练，我们主要使用使用前几轮对齐的最佳性能模型收集的最新批次偏好数据。我们还探索了 PPO 等 on-policy 算法，但发现 DPO 需要更少的计算量且表现更好，特别是在 IFEval 等指令遵循基准上。</p>
<p>对于 Llama 3，我们使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 的学习率，将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 超参数设为 0.1。此外，我们应用了以下算法修改：</p>
<ul>
<li><strong>在 DPO 损失中掩码格式化 token</strong>：我们在 chosen 和 rejected 响应的损失中掩码特殊格式化 token(包括头部和终止 token)以稳定 DPO 训练。</li>
<li><strong>用 NLL 损失正则化</strong>：我们在 chosen 序列上添加额外的负对数似然(NLL)损失项，缩放系数为 0.2。</li>
</ul>
<h4 id="model-averaging">Model Averaging</h4>
<p>最后，我们对使用各种数据版本或超参数在 RM、SFT 或 DPO 阶段获得的模型进行平均。</p>
<h4 id="iterative-rounds">Iterative Rounds</h4>
<p>遵循 Llama 2，我们在六轮中应用上述方法。在每轮循环中，我们从最新模型收集新的偏好标注和 SFT 数据，采样合成数据。</p>
<blockquote>
<p>译者注：Llama 3 的后训练流程有几个与 Qwen 2 不同的关键选择。第一，使用 DPO 而非 PPO——这与 Qwen2-Audio 的选择一致，但 Llama 3 在 405B 规模上验证了这一选择的可扩展性。作者明确提到&quot;DPO 需要更少的计算量且表现更好&quot;，这是对 RLHF(PPO) 复杂性的直接否定。第二，拒绝采样(RS)被用作 SFT 前的数据增强步骤：从策略模型采样 K 个(10-30)输出，用奖励模型选择最佳。这实际上是一种&quot;推理时计算换训练数据质量&quot;的策略。第三，六轮迭代后训练——这比大多数模型的 2-3 轮更多，暗示了 Llama 3 的SFT+DPO数据是在多轮中逐步精炼的，每轮都使用上一轮的最佳模型来生成更好的训练样本。</p>
</blockquote>
<h3 id="4-2-post-training-data">4.2 Post-Training Data</h3>
<h4 id="preference-data">Preference Data</h4>
<p>我们的偏好数据标注过程与 Llama 2 类似。我们在每轮后部署多个模型进行标注，并为每个用户提示从两个不同模型采样两个回复。这些模型可以使用不同的数据混合和对齐方案训练，允许不同的能力强度和增加的数据多样性。我们要求标注者根据对 chosen 响应相对于 rejected 响应的偏好程度将偏好分为四个等级：显著更好、更好、稍好或边际更好。我们还纳入编辑步骤以鼓励标注者进一步改进 preferred 响应。</p>
<h4 id="sft-data">SFT Data</h4>
<p>我们的微调数据主要由以下来源组成：</p>
<ul>
<li>来自人工标注收集的带有拒绝采样回复的提示</li>
<li>针对特定能力的合成数据</li>
<li>少量人工策划的数据</li>
</ul>
<p><strong>拒绝采样</strong>：在 RS 期间，对于人工标注期间收集的每个提示，我们从最新的聊天模型策略(通常是前一轮后训练的最佳Checkpoint)采样 K(通常在 10 到 30 之间)个输出，并使用奖励模型选择最佳候选。在后来的后训练轮次中，我们引入系统提示来引导 RS 回复符合期望的语气、风格或格式。</p>
<p>为提高拒绝采样的效率，我们采用 PagedAttention。这通过动态 KV Cache 分配增强内存效率，支持基于当前缓存容量的任意输出长度动态调度请求。</p>
<h4 id="data-processing-and-quality-control">Data Processing and Quality Control</h4>
<p>鉴于我们的大部分训练数据是模型生成的，它需要仔细的清理和质量控制。</p>
<p><strong>数据清理</strong>：在早期轮次中，我们观察到数据中常见的若干不良模式，如过度使用 emoji 或感叹号。因此，我们实施了一系列基于规则的数据移除和修改策略。</p>
<p><strong>数据剪枝</strong>：</p>
<ul>
<li><strong>主题分类</strong>：我们将 Llama 3 8B 微调为主题分类器，对所有数据进行推理以将其分类为粗粒度桶(如&quot;数学推理&quot;)和细粒度桶(如&quot;几何和三角&quot;)。</li>
<li><strong>质量评分</strong>：我们使用奖励模型和 Llama 信号为每个样本获取质量分数。对于 RM 分数，我们将 RM 分数顶部四分位数的数据视为高质量。对于 Llama 分数，我们提示 Llama 3 Checkpoint以三点量表对每个样本评分。</li>
<li><strong>难度评分</strong>：我们使用 Instag 和 Llama 评分两种难度度量。Instag 中更多意图意味着更高复杂性。</li>
<li><strong>语义去重</strong>：我们使用 RoBERTa 对完整对话进行聚类，在每个聚类内按质量分数 × 难度分数排序，然后进行贪心选择，仅保留与已见样本最大余弦相似度低于阈值的样本。</li>
</ul>
<h3 id="4-3-capabilities">4.3 Capabilities</h3>
<p>我们重点努力提高特定能力的性能，如代码、多语言、数学和推理、长上下文、工具使用、事实性和可操控性。</p>
<h4 id="code">Code</h4>
<p>我们针对提高和评估以下高优先级编程语言的代码生成、文档、调试和审查能力：Python、Java、Javascript、C/C++、Typescript、Rust、PHP、HTML/CSS、SQL、bash/shell。</p>
<p><strong>专家训练</strong>：我们训练一个代码专家，用于在后续后训练轮次中收集高质量的人工代码标注。这是通过分支主预训练运行并在以代码数据为主的 1T token 混合(&gt;85% 代码)上继续预训练实现的。对于最后几千步，我们在高质量仓库级代码数据混合上执行长上下文微调(LCFT)以将专家的上下文长度扩展到 16K token。</p>
<p><strong>合成数据生成</strong>：我们使用 Llama 3 和代码专家生成大量合成 SFT 对话。我们生成超过 270 万合成示例用于 SFT。主要方法包括：</p>
<ul>
<li><strong>执行反馈</strong>：生成编程问题描述，让模型解决，然后通过静态分析和单元测试执行验证正确性。约 20% 的解决方案最初不正确但自我纠正。</li>
<li><strong>编程语言翻译</strong>：将数据从常见编程语言翻译到较少见的语言，通过语法解析、编译和执行确保质量。</li>
<li><strong>反向翻译</strong>：从预训练数据中的代码片段开始，让模型生成文档/解释，然后反向翻译回代码，使用原始代码作为参考评估质量。</li>
</ul>
<h4 id="math-and-reasoning">Math and Reasoning</h4>
<p>为提升数学推理能力，我们采用与代码类似的方法：训练推理专家、生成合成数据、使用奖励模型和验证器进行筛选。</p>
<h4 id="multilinguality">Multilinguality</h4>
<p>Llama 3 支持 8 种语言(英语、德语、法语、意大利语、葡萄牙语、印地语、西班牙语和泰语)。我们收集多语言的人工标注和合成数据，特别关注语言特定的文化细微差别和表达。</p>
<h4 id="tool-use">Tool Use</h4>
<p>Llama 3 支持零样本工具使用，包括搜索、Python 解释器、数学计算和自定义函数调用。我们训练模型理解工具调用格式、生成正确的函数调用参数，并解释工具返回的结果。</p>
<h4 id="long-context">Long Context</h4>
<p>通过后训练，我们进一步微调模型以有效利用 128K 上下文窗口。我们使用长文档问答、摘要和多文档推理任务进行训练。</p>
<h4 id="factuality">Factuality</h4>
<p>为减少幻觉，我们在后训练中纳入事实性数据，包括问答对、事实核查数据和引用生成任务。我们训练模型在不确定时承认不确定性，并提供可验证的信息来源。</p>
<h4 id="steerability">Steerability</h4>
<p>我们引入系统提示来增强模型的可操控性，允许用户通过自然语言指定期望的行为、语气、角色和格式约束。</p>
<hr>
<h2 id="5-results">5 Results</h2>
<h3 id="5-1-pretrained-models">5.1 Pretrained Models</h3>
<p>Llama 3 405B 在大量基准上展现出强劲性能。在 MMLU 上达到 87.3%(5-shot)，在 HumanEval 上达到 89.0%(0-shot)，在 GSM8K 上达到 96.8%(8-shot CoT)。与 GPT-4 和 Claude 3.5 Sonnet 等闭源模型相比，Llama 3 405B 在大多数任务上表现相当。</p>
<p>较小模型同样表现优异：8B 模型在 MMLU 上达到 69.4%，超越了 Mistral 7B(61.1%) 和 Gemma 2 9B(72.3% 仅在部分任务上); 70B 模型在 MMLU 上达到 83.6%，接近 GPT-3.5 Turbo(70.7%) 并超越了 Mixtral 8x22B(76.9%)。</p>
<h3 id="5-2-post-trained-models">5.2 Post-Trained Models</h3>
<p>对齐后的 Llama 3 模型在指令遵循和对话能力上显著提升。在 IFEval(指令遵循评估)上，405B Instruct 达到 88.6%，与 GPT-4(84.3%) 和 Claude 3.5 Sonnet(88.0%) 相当。</p>
<p>人工评估表明，Llama 3 70B Instruct 和 405B Instruct 在 helpfulness 和 safety 之间取得了良好平衡。与 Llama 2 相比，Llama 3 在拒绝回答无害查询方面的倾向显著降低，同时在识别和拒绝有害请求方面保持了强劲性能。</p>
<hr>
<h2 id="6-vision-video-and-speech-capabilities">6 Vision, Video, and Speech Capabilities</h2>
<p>作为 Llama 3 开发过程的一部分，我们实验了将图像、视频和语音能力添加到模型中。这些多模态扩展采用组合式方法，保持语言模型本身不变，通过适配器集成Encoder 。</p>
<h3 id="6-1-image-recognition">6.1 Image Recognition</h3>
<p>我们的图像Encoder 基于 Vision Transformer(ViT)架构，在大量图像-文本对上预训练。适配器由交叉注意力层组成，将图像Encoder 表示输入语言模型。我们在图像描述、视觉问答和文档理解等任务上评估，观察到与 SOTA 开源多模态模型相当的表现。</p>
<h3 id="6-2-video-recognition">6.2 Video Recognition</h3>
<p>我们在图像适配器之上训练视频适配器，使用配对视频-文本数据。这使模型能够聚合跨帧的信息。视频理解能力包括视频描述、时间定位和动作识别。</p>
<h3 id="6-3-speech-understanding">6.3 Speech Understanding</h3>
<p>我们的语音Encoder 使用自监督方法训练，掩码部分语音输入并尝试通过离散 token 表示重建掩码部分。适配器将语音编码转换为语言模型可处理的 token 表示。语音能力包括自动语音识别(ASR)和语音到文本翻译。</p>
<hr>
<h2 id="7-safety">7 Safety</h2>
<p>Llama 3 在预训练和后训练阶段都纳入了全面的安全缓解措施。我们训练 Llama Guard 3 作为输入和输出安全分类器，可检测和阻止有害内容。</p>
<p>在对抗性评估中，Llama 3 405B Instruct 在识别和拒绝有害请求方面表现强劲，同时最小化对无害查询的过度拒绝。与 Llama 2 相比，Llama 3 在 helpfulness 和 harmlessness 之间取得了更好的平衡。</p>
<p>我们还评估了模型在网络安全、生物风险和化学武器等极端风险领域的性能，发现 Llama 3 在这些方面的风险与同等规模的现有模型相当。</p>
<hr>
<h2 id="8-related-work-conclusion-and-appendices">8 Related Work, Conclusion, and Appendices</h2>
<h3 id="8-1-related-work">8.1 Related Work</h3>
<p>Llama 3 的开发建立在大语言模型研究的丰富基础之上。在架构方面，我们遵循 Transformer 架构并采用 RoPE、SwiGLU 和 RMSNorm 等成熟技术。在训练方面，我们的工作受益于缩放定律、预训练数据筛选和对齐技术的最新进展。在基础设施方面，我们利用大规模 GPU 集群训练、4D 并行和高效通信库的最新成果。</p>
<h3 id="8-2-conclusion">8.2 Conclusion</h3>
<p>本文介绍了 Llama 3，一个包含 8B、70B 和 405B 参数的多语言语言模型系列。Llama 3 在大量基准上展现出与领先语言模型(如 GPT-4)相当的性能，同时以开源形式发布，包括 405B 参数的旗舰模型。</p>
<p>我们的开发过程强调了三个关键杠杆：数据质量、训练规模和管理复杂性。通过在这些维度上的系统优化，我们展示了 dense Transformer 架构在足够规模下可以达到与闭源 MoE 模型相当的性能。</p>
<p>我们还展示了将图像、视频和语音能力集成到 Llama 3 中的初步实验结果。这些多模态扩展采用组合式方法，保持核心语言模型不变，通过适配器添加新模态。</p>
<h3 id="8-3-appendices">8.3 Appendices</h3>
<p>本文附录包含额外的技术细节，包括：</p>
<ul>
<li><strong>预训练结果附录</strong>：详细的基准评测结果和消融实验</li>
<li><strong>后训练附录</strong>：数据组成、提示模板和评估协议的详细信息</li>
<li><strong>安全附录</strong>：红队测试、风险评估和缓解措施的详细描述</li>
<li><strong>FP8 附录</strong>：FP8 量化训练的实现细节</li>
<li><strong>语音附录</strong>：语音识别和合成系统的额外结果</li>
</ul>
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
<td>GQA</td>
<td>分组查询注意力</td>
<td>Section 3.2</td>
<td>Grouped Query Attention，多个 Query 头共享一组 KV 头以减少 KV Cache</td>
</tr>
<tr>
<td>RoPE</td>
<td>旋转位置编码</td>
<td>Section 3.2</td>
<td>Rotary Positional Embedding，通过旋转矩阵编码位置信息</td>
</tr>
<tr>
<td>FSDP</td>
<td>全分片数据并行</td>
<td>Section 3.5</td>
<td>Fully Sharded Data Parallel，将模型/优化器/梯度分片到多个 GPU</td>
</tr>
<tr>
<td>TP</td>
<td>张量并行</td>
<td>Section 3.5</td>
<td>Tensor Parallelism，将单个权重张量分片到多个设备</td>
</tr>
<tr>
<td>PP</td>
<td>流水线并行</td>
<td>Section 3.5</td>
<td>Pipeline Parallelism，按层垂直分区模型到不同阶段</td>
</tr>
<tr>
<td>CP</td>
<td>上下文并行</td>
<td>Section 3.5</td>
<td>Context Parallelism，跨序列维度分区输入以支持长序列</td>
</tr>
<tr>
<td>MFU</td>
<td>模型 FLOPs 利用率</td>
<td>Section 3.5</td>
<td>Model FLOPs Utilization，实际训练吞吐量占理论峰值的比例</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>Section 4.1</td>
<td>Direct Preference Optimization，直接从偏好数据优化模型</td>
</tr>
<tr>
<td>RS</td>
<td>拒绝采样</td>
<td>Section 4.1</td>
<td>Rejection Sampling，从模型采样多个输出并选择最佳</td>
</tr>
<tr>
<td>RoCE</td>
<td>融合以太网 RDMA</td>
<td>Section 3.5</td>
<td>RDMA over Converged Ethernet，一种网络协议</td>
</tr>
<tr>
<td>Annealing</td>
<td>退火</td>
<td>Section 3.1</td>
<td>训练末期线性降低学习率到 0 并上采样高质量数据</td>
</tr>
<tr>
<td>SDC</td>
<td>静默数据损坏</td>
<td>Section 3.5</td>
<td>Silent Data Corruption，硬件错误导致的不可检测的数据损坏</td>
</tr>
</tbody></table>
<h2 id="fl-b-gjsysjhz">附录 B: 关键实验数据汇总</h2>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>8B</th>
<th>70B</th>
<th>405B</th>
<th>GPT-4</th>
<th>GPT-4o</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU 5-shot</td>
<td>69.4%</td>
<td>83.6%</td>
<td>87.3%</td>
<td>85.1%</td>
<td>89.1%</td>
</tr>
<tr>
<td>HumanEval 0-shot</td>
<td>72.6%</td>
<td>80.5%</td>
<td>89.0%</td>
<td>86.6%</td>
<td>90.2%</td>
</tr>
<tr>
<td>GSM8K 8-shot CoT</td>
<td>84.5%</td>
<td>95.1%</td>
<td>96.8%</td>
<td>94.2%</td>
<td>96.1%</td>
</tr>
<tr>
<td>MATH 0-shot CoT</td>
<td>51.9%</td>
<td>68.0%</td>
<td>73.8%</td>
<td>64.5%</td>
<td>76.6%</td>
</tr>
<tr>
<td>IFEval</td>
<td>80.4%</td>
<td>87.5%</td>
<td>88.6%</td>
<td>84.3%</td>
<td>85.6%</td>
</tr>
<tr>
<td>GPQA 0-shot CoT</td>
<td>32.8%</td>
<td>46.7%</td>
<td>51.1%</td>
<td>41.4%</td>
<td>53.6%</td>
</tr>
<tr>
<td>MGSM 0-shot CoT</td>
<td>68.9%</td>
<td>86.9%</td>
<td>91.6%</td>
<td>85.9%</td>
<td>90.5%</td>
</tr>
<tr>
<td>Multi-needle</td>
<td>98.8%</td>
<td>97.5%</td>
<td>98.1%</td>
<td>100%</td>
<td>100%</td>
</tr>
</tbody></table>
<h2 id="fl-c-mxpxdw">附录 C: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Llama 2(2023 年 7 月)的架构基础，但在数据规模、训练规模和工程基础设施上全面超越</li>
<li><strong>核心创新</strong>:<ul>
<li>15.6T token 预训练数据(约 8.7 倍于 Llama 2 的 1.8T)</li>
<li>405B 参数 dense 旗舰模型，计算预算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs</li>
<li>128K 上下文窗口，通过六阶段逐步扩展实现</li>
<li>GQA(8 KV 头)降低 KV Cache，支持高效长上下文推理</li>
<li>4D 并行(TP+CP+PP+DP)在 16K H100 上实现 38-43% MFU</li>
<li>六轮迭代后训练(SFT + RS + DPO)，替代复杂的 RLHF(PPO)</li>
<li>组合式多模态扩展(图像/视频/语音适配器)，保持语言模型冻结</li>
<li>数据混合：50% 通用 + 25% 数学推理 + 17% 代码 + 8% 多语言</li>
</ul>
</li>
<li><strong>被后续工作引用</strong>:<ul>
<li>Llama 3.2(2024 年 9 月)：引入小型视觉模型(1B/3B/11B/90B)</li>
<li>Llama 3.3(2024 年 12 月)：70B 模型的知识更新和推理改进</li>
<li>Llama 4(2025 年)：引入 MoE 架构和 10M 上下文窗口</li>
</ul>
</li>
<li><strong>技术定位</strong>: 开源社区首个 400B+ 级别 dense 模型，证明开源模型可以达到 GPT-4 级别性能</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"abstract","text":"Abstract"},{"level":2,"id":"1-introduction","text":"1 Introduction"},{"level":2,"id":"2-overview","text":"2 Overview"},{"level":2,"id":"3-pre-training","text":"3 Pre-Training"},{"level":3,"id":"3-1-pre-training-data","text":"3.1 Pre-Training Data"},{"level":4,"id":"web-data-curation","text":"Web Data Curation"},{"level":4,"id":"determining-the-data-mix","text":"Determining the Data Mix"},{"level":4,"id":"annealing-data","text":"Annealing Data"},{"level":3,"id":"3-2-model-architecture","text":"3.2 Model Architecture"},{"level":3,"id":"3-3-scaling-laws","text":"3.3 Scaling Laws"},{"level":3,"id":"3-4-training-recipe","text":"3.4 Training Recipe"},{"level":4,"id":"initial-pre-training","text":"Initial Pre-Training"},{"level":4,"id":"long-context-pre-training","text":"Long Context Pre-Training"},{"level":4,"id":"annealing","text":"Annealing"},{"level":3,"id":"3-5-infrastructure-scaling-and-efficiency","text":"3.5 Infrastructure, Scaling, and Efficiency"},{"level":4,"id":"training-infrastructure","text":"Training Infrastructure"},{"level":4,"id":"parallelism-for-model-scaling","text":"Parallelism for Model Scaling"},{"level":4,"id":"reliability-and-operational-challenges","text":"Reliability and Operational Challenges"},{"level":2,"id":"4-post-training","text":"4 Post-Training"},{"level":3,"id":"4-1-modeling","text":"4.1 Modeling"},{"level":4,"id":"chat-dialog-format","text":"Chat Dialog Format"},{"level":4,"id":"reward-modeling","text":"Reward Modeling"},{"level":4,"id":"supervised-finetuning","text":"Supervised Finetuning"},{"level":4,"id":"direct-preference-optimization","text":"Direct Preference Optimization"},{"level":4,"id":"model-averaging","text":"Model Averaging"},{"level":4,"id":"iterative-rounds","text":"Iterative Rounds"},{"level":3,"id":"4-2-post-training-data","text":"4.2 Post-Training Data"},{"level":4,"id":"preference-data","text":"Preference Data"},{"level":4,"id":"sft-data","text":"SFT Data"},{"level":4,"id":"data-processing-and-quality-control","text":"Data Processing and Quality Control"},{"level":3,"id":"4-3-capabilities","text":"4.3 Capabilities"},{"level":4,"id":"code","text":"Code"},{"level":4,"id":"math-and-reasoning","text":"Math and Reasoning"},{"level":4,"id":"multilinguality","text":"Multilinguality"},{"level":4,"id":"tool-use","text":"Tool Use"},{"level":4,"id":"long-context","text":"Long Context"},{"level":4,"id":"factuality","text":"Factuality"},{"level":4,"id":"steerability","text":"Steerability"},{"level":2,"id":"5-results","text":"5 Results"},{"level":3,"id":"5-1-pretrained-models","text":"5.1 Pretrained Models"},{"level":3,"id":"5-2-post-trained-models","text":"5.2 Post-Trained Models"},{"level":2,"id":"6-vision-video-and-speech-capabilities","text":"6 Vision, Video, and Speech Capabilities"},{"level":3,"id":"6-1-image-recognition","text":"6.1 Image Recognition"},{"level":3,"id":"6-2-video-recognition","text":"6.2 Video Recognition"},{"level":3,"id":"6-3-speech-understanding","text":"6.3 Speech Understanding"},{"level":2,"id":"7-safety","text":"7 Safety"},{"level":2,"id":"8-related-work-conclusion-and-appendices","text":"8 Related Work, Conclusion, and Appendices"},{"level":3,"id":"8-1-related-work","text":"8.1 Related Work"},{"level":3,"id":"8-2-conclusion","text":"8.2 Conclusion"},{"level":3,"id":"8-3-appendices","text":"8.3 Appendices"},{"level":2,"id":"fl-a-syb","text":"附录 A: 术语表"},{"level":2,"id":"fl-b-gjsysjhz","text":"附录 B: 关键实验数据汇总"},{"level":2,"id":"fl-c-mxpxdw","text":"附录 C: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/03-llama-3/01-llama-3-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/03-llama-3/01-llama-3-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama 3 技术报告精译</h1>
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
