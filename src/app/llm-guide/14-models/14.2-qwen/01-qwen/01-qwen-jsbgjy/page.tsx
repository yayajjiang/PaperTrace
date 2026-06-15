"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Qwen Technical Report
原文链接: <a href="https://arxiv.org/abs/2309.16609">https://arxiv.org/abs/2309.16609</a>
发布日期: 2023 年 9 月
发布机构: Qwen Team, Alibaba Group</p>
</blockquote>
<hr>
<h2 id="abstract">Abstract</h2>
<p>大语言模型(LLMs)已经彻底改变了人工智能领域，使此前被认为是人类专属的自然语言处理任务成为可能。在本工作中，我们介绍了 Qwen，这是我们大语言模型系列的第一个版本。Qwen 是一个全面的语言模型系列，包含不同参数规模的模型。它包括 Qwen，即基础预训练语言模型，以及 Qwen-Chat，即使用人类对齐技术微调的聊天模型。</p>
<p>基础语言模型在大量下游任务中始终展现出卓越的性能，而聊天模型——特别是那些使用 RLHF(Reinforcement Learning from Human Feedback，人类反馈强化学习)训练的模型——具有很强的竞争力。聊天模型具备先进的工具使用和规划能力，可用于构建 Agent 应用，即使在利用代码解释器等复杂任务上与更大的模型相比也展现出令人印象深刻的性能。</p>
<p>此外，我们还开发了代码专用模型 Code-Qwen 和 Code-Qwen-Chat，以及数学专用模型 Math-Qwen-Chat，它们均基于基础语言模型构建。这些模型与开源模型相比展现出显著改进的性能，与闭源模型相比也仅有小幅差距。</p>
<hr>
<h2 id="1-introduction">1 Introduction</h2>
<p>大语言模型(LLMs)通过为复杂推理和问题解决任务提供强大的基础，彻底改变了人工智能(AI)领域。这些模型能够将海量知识压缩到神经网络中，使其成为极其通用的智能体。通过聊天界面，LLM 可以执行此前被认为是人类专属的任务，尤其是那些涉及创造力和专业知识的任务。它们可以与人类进行自然语言对话，回答问题、提供信息，甚至生成故事、诗歌和音乐等创意内容。这催生了从聊天机器人和虚拟助手到语言翻译和摘要工具的广泛应用。</p>
<p>LLM 不仅限于语言任务。它们还可以作为通用智能体，与外部系统、工具和模型协作以实现人类设定的目标。例如，LLM 可以理解多模态指令、执行代码、使用工具等。这为 AI 应用开辟了全新的可能性，从自动驾驶汽车和机器人到医疗保健和金融。随着这些模型的不断演进和改进，我们可以期待在未来几年看到更多创新和令人兴奋的应用。</p>
<p><img src="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy/images/qwen-lineage-2.pdf" alt="Qwen 系列模型谱系"></p>
<blockquote>
<p>图 1: Qwen 系列模型谱系。我们在包含数万亿 token 的大规模数据集上预训练了语言模型 Qwen。然后使用 SFT 和 RLHF 将 Qwen 对齐到人类偏好，得到 Qwen-Chat 及其改进版本 Qwen-Chat-RLHF。此外，我们还开发了代码和数学专用模型，如 Code-Qwen、Code-Qwen-Chat 和 Math-Qwen-Chat。我们此前发布的多模态 LLM Qwen-VL 和 Qwen-VL-Chat 也基于 Qwen 基础模型构建。</p>
</blockquote>
<p>尽管 LLM 拥有令人印象深刻的能力，但它们常因缺乏可复现性、可控性和对服务提供者的可访问性而受到批评。在本工作中，我们很高兴地介绍并发布我们 LLM 系列的初始版本 Qwen。Qwen 这个名字源自中文&quot;千问&quot;，传达了拥抱广泛询问的理念。Qwen 是一个全面的语言模型系列，包含不同参数规模的模型。该系列包括基础预训练语言模型、使用人类对齐技术微调的聊天模型(如 SFT、RLHF 等)，以及代码和数学专用模型。详情如下：</p>
<ol>
<li><p>基础语言模型 Qwen 使用多达 3 万亿个 token 的多样化文本和代码进行了广泛训练，涵盖广泛领域。这些模型在大量下游任务中始终展现出卓越性能，即使与参数量显著更大的模型相比也毫不逊色。</p>
</li>
<li><p>Qwen-Chat 模型在精心策划的数据集上进行了微调，该数据集涉及任务执行、聊天、工具使用、Agent、安全等。基准评测表明，SFT 模型可以实现卓越性能。此外，我们训练了奖励模型来模拟人类偏好，并将其应用于聊天模型的 RLHF。通过一个具有挑战性的测试的人工评估，我们发现使用 RLHF 训练的 Qwen-Chat 模型具有很强的竞争力，但在我们的基准上仍落后于 GPT-4。</p>
</li>
<li><p>此外，我们介绍了专用模型 Code-Qwen，包括 Code-Qwen-7B 和 Code-Qwen-14B，以及它们的聊天模型 Code-Qwen-7B-Chat 和 Code-Qwen-14B-Chat。Code-Qwen 在大量代码数据上进行了预训练，并进一步微调以处理与代码生成、调试和解释相关的对话。在 HumanEval、MBPP 和 HumanEvalPack 等基准数据集上的实验结果表明，Code-Qwen 在代码理解和生成方面具有很高水平的专业能力。</p>
</li>
<li><p>本研究还介绍了专门用于解决数学问题的 Math-Qwen-Chat。我们的结果表明，Math-Qwen-7B-Chat 和 Math-Qwen-14B-Chat 在相同规模的开源模型中以较大优势胜出，并正在接近 GPT-3.5 在 GSM8K 和 MATH 等数学相关基准数据集上的性能。</p>
</li>
<li><p>此外，我们还开源了 Qwen-VL 和 Qwen-VL-Chat，它们具有理解视觉和语言指令的多功能能力。这些模型在各种评估基准上超越了当前的开源视觉-语言模型，并支持中英文的文本识别和视觉定位。更多细节请参阅 Qwen-VL 论文。</p>
</li>
</ol>
<p>现在，我们正式开源 14B 和 7B 参数的基础预训练模型 Qwen 以及对齐的聊天模型 Qwen-Chat。此次发布旨在为开发者或应用提供更全面、更强大的 LLM，且规模友好。</p>
<p><img src="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy/images/radar_14b.pdf" alt="Qwen-14B 与 GPT-4、GPT-3.5 及此前 13B SOTA 的性能对比"></p>
<blockquote>
<p>图 2: GPT-4、GPT-3.5、此前 13B SOTA 以及 Qwen-14B 的性能对比。我们在涵盖语言理解、知识、推理等多个领域的 12 个数据集上展示了结果。Qwen 显著超越了相似模型规模的先前 SOTA，但仍落后于 GPT-3.5 和 GPT-4。</p>
</blockquote>
<p>本报告的结构如下：第 2 节描述我们的预训练方法和 Qwen 的结果。第 3 节涵盖对齐方法，并报告自动评估和人工评估的结果。此外，本节还描述了我们构建具备工具使用、代码解释器和 Agent 能力的聊天模型的细节。第 4 节和第 5 节深入探讨代码和数学专用模型及其性能。第 6 节提供相关工作的概述，第 7 节总结本文并指出未来的工作。</p>
<blockquote>
<p>译者注：这里值得停下来审视 Qwen 1.0 的定位。2023 年 9 月发布时，开源社区正处于&quot;后 LLaMA 时代&quot;——Meta 的 LLaMA 和 LLaMA-2 已经树立了开源基座模型的标杆。Qwen 选择在这个时间点开源，面临的是一个高度竞争的环境。作者明确将 GPT-4 和 GPT-3.5 作为参照系，这是一种&quot;对齐到最强对手&quot;的策略。值得注意的是，Qwen 1.0 系列就同时发布了基础模型、聊天模型、代码模型和数学模型，这种&quot;全家桶&quot;式的发布策略与 LLaMA-2 仅发布基础模型+聊天模型形成对比，显示了阿里在模型生态构建上的野心。</p>
</blockquote>
<hr>
<h2 id="2-pretraining">2 Pretraining</h2>
<p>预训练阶段涉及学习海量数据以获得对世界及其各种复杂性的全面理解。这不仅包括基本的语言能力，还包括算术、编码和逻辑推理等高级技能。在本节中，我们介绍数据、模型设计和扩展，以及基准数据集上的全面评估结果。</p>
<h3 id="2-1-data">2.1 Data</h3>
<p>数据规模已被证明是开发稳健大语言模型的关键因素。为了创建有效的预训练数据集，确保数据的多样性并覆盖广泛的类型、领域和任务至关重要。我们的数据集旨在满足这些要求，包括公共网络文档、百科全书、书籍、代码等。此外，我们的数据集是多语言的，其中大部分数据为英文和中文。</p>
<p>为确保预训练数据的质量，我们开发了全面的数据预处理流程。对于公共网络数据，我们从 HTML 中提取文本并使用语言识别工具确定语言。为了增加数据的多样性，我们采用了去重技术，包括规范化后的精确匹配去重和使用 MinHash 与 LSH 算法的模糊去重。为了过滤低质量数据，我们采用了基于规则和基于机器学习的组合方法。具体来说，我们使用多个模型对内容进行评分，包括语言模型、文本质量评分模型以及识别潜在冒犯或不适当内容的模型。我们还手动从不同来源采样文本并审查以确保其质量。为了进一步提高数据质量，我们有选择地对某些来源的数据进行上采样，以确保模型在多样化的高质量内容上训练。</p>
<p>在近期的研究中，已有研究表明使用多任务指令预训练语言模型可以增强其零样本和少样本性能。为了进一步提升模型性能，我们在预训练过程中加入了高质量指令数据。为保障基准评测的完整性，我们采用了与 GPT-3 类似的方法，仔细消除了与评测中使用的任何测试集存在 13-gram 重叠的指令样本。鉴于下游任务数量众多，为所有任务重复此过滤过程是不可行的。因此，我们确保已报告的评测任务的指令数据经过了我们的过滤处理。</p>
<p>最终，我们构建了多达 3 万亿个 token 的数据集。</p>
<blockquote>
<p>译者注：3 万亿 token 的数据规模在 2023 年 9 月是一个相当激进的数字。作为对比，LLaMA-1 使用了 1.4T token，LLaMA-2 使用了 2T token。Qwen 的数据策略有几个值得关注的工程细节：第一，&quot;13-gram 重叠过滤&quot;是一种相当严格的去污染措施——相比之下，很多模型仅使用 8-gram 或 10-gram。这反映了对评测公平性的高度重视，但也意味着可能有更多的训练数据被误删。第二，在预训练阶段就混入指令数据(而非仅在 SFT 阶段使用)是一个有趣的选择，这本质上是将&quot;指令微调&quot;提前到预训练阶段，可能有助于提升模型的零样本指令遵循能力。第三，中英文双语数据配比是一个未公开的关键超参数——从后续模型的中文能力来看，中文数据占比应该不低。</p>
</blockquote>
<h3 id="2-2-tokenization">2.2 Tokenization</h3>
<p>词表设计显著影响训练效率和下游任务性能。在本研究中，我们采用字节对编码(BPE, Byte Pair Encoding)作为分词方法，遵循 GPT-3.5 和 GPT-4 的做法。我们从开源的快速 BPE 分词器 tiktoken 开始，选择 cl100k base 作为起点。为增强模型在多语言下游任务(特别是中文)上的性能，我们补充了常用中文字词以及其他语言的词表。此外，遵循 LLaMA 的做法，我们将数字拆分为单个数字。最终词表大小约为 152K。</p>
<p><img src="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy/images/tokenizer_whitegrid.pdf" alt="不同模型的编码压缩率对比"></p>
<blockquote>
<p>图 3: 不同模型的编码压缩率对比。我们随机选择了每种语言 100 万文档语料进行测试和对比(以支持 100 种语言的 XLM-R 为基准值 1)。可以看出，在确保中文、英文和代码高效解码的同时，Qwen 对许多其他语言也实现了高压缩率，使模型在这些语言上具备强扩展性以及高效的训练和推理效率。</p>
</blockquote>
<p>Qwen 分词器在压缩方面的性能如图 3 所示。在此对比中，我们将 Qwen 与 XLM-R、LLaMA、Baichuan 和 InternLM 等其他分词器进行了评估。我们的发现表明，Qwen 在大多数语言中实现了比竞争对手更高的压缩效率。这意味着 serving 成本可以显著降低，因为更少数量的 Qwen token 就能传达比竞争对手更多的信息。此外，我们进行了初步实验以确保扩大 Qwen 词表规模不会对预训练模型的下游性能产生负面影响。尽管词表规模增加，但实验表明 Qwen 在下游评估中保持了其性能水平。</p>
<blockquote>
<p>译者注：152K 的词表规模在当时是一个显著的设计选择。LLaMA 使用 32K，Baichuan 使用 64K，而 Qwen 将词表扩大到 152K——几乎是 LLaMA 的 5 倍。这样做的直接代价是 embedding 层参数量增加(152K × hidden_size vs 32K × hidden_size)，但收益是多语言压缩效率的提升。图 3 中的数据清晰地展示了这一点：Qwen 在中文上的压缩率显著优于 LLaMA，这意味着同样长度的中文文本，Qwen 需要的 token 数更少——这直接转化为更低的推理成本和更长的有效上下文窗口。将数字拆分为单个数字的做法也很有趣：这确保了模型对数值的&quot;逐位理解&quot;，有助于算术和数学推理，但代价是数字序列的 token 数增加。</p>
</blockquote>
<h3 id="2-3-architecture">2.3 Architecture</h3>
<p>Qwen 采用修改版的 Transformer 架构设计。具体来说，我们采用了近期开源大语言模型的方法 LLaMA，该方法被广泛认为是顶级的开源 LLM。我们对架构的修改包括：</p>
<ul>
<li><strong>Embedding 和输出投影</strong>：基于初步实验结果，我们选择了 untied embedding(非绑定嵌入)方法，而非绑定输入嵌入和输出投影的权重。这一决定是为了获得更好的性能，代价是内存成本。</li>
<li><strong>位置编码</strong>：我们选择了 RoPE(Rotary Positional Embedding，旋转位置编码)作为将位置信息融入模型的首选方案。RoPE 已被广泛采用并在当代大语言模型中取得了成功， notably PaLM 和 LLaMA。特别地，我们选择了使用 FP32 精度处理逆频率矩阵，而非 BF16 或 FP16，以优先保证模型性能和更高精度。</li>
<li><strong>偏置项(Bias)</strong>：对于大部分层，我们遵循 PaLM 的做法移除偏置，但在注意力的 QKV 层中添加了偏置以增强模型的外推能力。</li>
<li><strong>Pre-Norm 和 RMSNorm</strong>：在现代 Transformer 模型中，pre-normalization 是最广泛使用的方法，已被证明比 post-normalization 提高了训练稳定性。此外，我们将传统的 layer normalization 替换为 RMSNorm，这在保持等效性能的同时提高了效率。</li>
<li><strong>激活函数</strong>：我们选择了 SwiGLU 作为激活函数，这是 Swish 和 Gated Linear Unit 的组合。我们的初步实验表明，基于 GLU 的激活函数通常优于其他基线选项(如 GeLU)。按照此前研究的惯例，我们将 FFN 的维度从隐藏层的 4 倍缩减到隐藏层的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac></mrow><annotation encoding="application/x-tex">\\frac{8}{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 倍。</li>
</ul>
<p><strong>表 1: 模型规模、架构和优化超参数</strong></p>
<table>
<thead>
<tr>
<th>参数量</th>
<th>隐藏层维度</th>
<th>注意力头数</th>
<th>层数</th>
<th>学习率</th>
<th>批次大小</th>
<th>训练 token</th>
</tr>
</thead>
<tbody><tr>
<td>1.8B</td>
<td>2048</td>
<td>16</td>
<td>24</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>4M</td>
<td>2.2T</td>
</tr>
<tr>
<td>7B</td>
<td>4096</td>
<td>32</td>
<td>32</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>4M</td>
<td>2.4T</td>
</tr>
<tr>
<td>14B</td>
<td>5120</td>
<td>40</td>
<td>40</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td>4M</td>
<td>3.0T</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：架构选择上 Qwen 采取了&quot;站在巨人肩膀上&quot;的策略：以 LLaMA 的成熟架构为基础，进行针对性的微调。几个关键决策值得分析。第一，untied embedding——绑定输入/输出权重可以减少参数量，但实验表明非绑定能带来更好的下游性能。这是一个&quot;参数换质量&quot;的权衡，在 7B/14B 规模下是可以接受的。第二，FP32 的 RoPE 逆频率矩阵——这确保了位置编码在 BF16/FP16 训练中的数值稳定性，避免了低精度下的频率退化问题。第三，QKV 偏置项——这是 Qwen 区别于 LLaMA 的一个细节。LLaMA-2 完全移除了所有线性层的偏置，而 Qwen 保留 QKV 层的偏置。作者引用 qkv_bias 的文献说明这有助于增强外推能力，其直觉可能是偏置项为注意力提供了一种&quot;软阈值&quot;，帮助模型在更长序列中保持稳定的注意力模式。</p>
</blockquote>
<h3 id="2-4-training">2.4 Training</h3>
<p>为训练 Qwen，我们遵循 GPT 中描述的标准自回归语言建模方法。这涉及训练模型基于前文提供的上下文预测下一个 token。我们使用 2048 的上下文长度训练模型。为创建数据批次，我们对文档进行打乱和合并，然后截断到指定的上下文长度。为提高计算效率并减少内存使用，我们在注意力模块中采用 Flash Attention。我们采用标准优化器 AdamW 进行预训练优化，设置超参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1=0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2=0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi><mo>=</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\epsilon=10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>。我们使用余弦学习率调度，为每种模型规模指定峰值学习率。学习率衰减到峰值学习率的 10% 作为最小学习率。所有模型均使用 BFloat16 混合精度进行训练以确保稳定性。</p>
<h3 id="2-5-context-length-extension">2.5 Context Length Extension</h3>
<p>Transformer 模型在其注意力机制的上下文长度方面有显著限制。随着上下文长度的增加，二次方复杂度的计算导致计算和内存成本急剧上升。在本工作中，我们实现了仅应用于推理阶段的简单无训练技术来扩展模型的上下文长度。我们使用的关键技术之一是 NTK-aware 插值。与对每个 RoPE 维度进行等比例缩放的位置插值(PI)不同，NTK-aware 插值调整 RoPE 的基数，以无训练的方式防止高频信息丢失。为进一步提高性能，我们还实现了一个简单的扩展称为 dynamic NTK-aware 插值，它按块动态改变缩放比例，避免了严重的性能下降。这些技术使我们能够在不损害计算效率或准确性的情况下有效扩展 Transformer 模型的上下文长度。</p>
<p>Qwen 还额外整合了两种注意力机制：LogN-Scaling 和 window attention。LogN-Scaling 通过一个依赖于上下文长度与训练长度之比的因子重新缩放 query 和 value 的点积，确保随着上下文长度增长，注意力值的熵保持稳定。Window attention 将注意力限制在有限的上下文窗口内，防止模型关注过远的 token。</p>
<p>我们还观察到，模型的长上下文建模能力在不同层之间有所差异，较低层比较高层对上下文长度扩展更敏感。为利用这一观察，我们为每层分配不同的窗口大小，对较低层使用较短的窗口，对较高层使用较长的窗口。</p>
<p><strong>表 2: Qwen 使用各种技术进行长上下文推理的结果</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>1024</th>
<th>2048</th>
<th>4096</th>
<th>8192</th>
<th>16384</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen-7B</td>
<td>4.23</td>
<td>3.78</td>
<td>39.35</td>
<td>469.81</td>
<td>2645.09</td>
</tr>
<tr>
<td>+ dynamic_ntk</td>
<td>4.23</td>
<td>3.78</td>
<td>3.59</td>
<td>3.66</td>
<td>5.71</td>
</tr>
<tr>
<td>+ dynamic_ntk + logn</td>
<td>4.23</td>
<td>3.78</td>
<td>3.58</td>
<td>3.56</td>
<td>4.62</td>
</tr>
<tr>
<td>+ dynamic_ntk + logn + window_attn</td>
<td>4.23</td>
<td>3.78</td>
<td>3.58</td>
<td>3.49</td>
<td>4.32</td>
</tr>
<tr>
<td>Qwen-14B</td>
<td>-</td>
<td>3.46</td>
<td>22.79</td>
<td>334.65</td>
<td>3168.35</td>
</tr>
<tr>
<td>+ dynamic_ntk + logn + window_attn</td>
<td>-</td>
<td>3.46</td>
<td>3.29</td>
<td>3.18</td>
<td>3.42</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：长上下文扩展的结果非常直观。原始 Qwen-7B 在 4096 token 时 PPL 从 3.78 飙升至 39.35，在 16384 token 时达到 2645——几乎完全失效。但仅添加 dynamic NTK 插值，PPL 就降到 5.71(16384 时)。再叠加 LogN-Scaling 降到 4.62，最后加上 window attention 降到 4.32。这三项技术的组合效果几乎是&quot;乘法级&quot;的。这里有一个有趣的工程洞察：作者发现&quot;较低层对上下文扩展更敏感&quot;，因此采用分层窗口策略——底层用短窗口、高层用长窗口。这背后的直觉可能是：低层负责局部模式(如词法、短语结构)，对长距离依赖不敏感; 高层负责语义和篇章结构，需要更大的感受野。这种&quot;分层外推&quot;策略后来被多个模型采纳，包括 Qwen2 和 Kimi 系列。</p>
</blockquote>
<h3 id="2-6-experimental-results">2.6 Experimental Results</h3>
<p>为评估模型的零样本和少样本学习能力，我们使用一系列数据集进行了全面的基准评测。我们将 Qwen 与最新的开源基座模型进行对比，包括 LLaMA、LLaMA-2、MPT、Falcon、Baichuan2、ChatGLM2、InternLM、XVERSE 和 StableBeluga2。我们的评测涵盖 7 个流行基准：MMLU(5-shot)、C-Eval(5-shot)、GSM8K(8-shot)、MATH(4-shot)、HumanEval(0-shot)、MBPP(0-shot)和 BBH(3-shot)。</p>
<p>在此评测中，我们关注未经对齐的基础语言模型，并从官方结果和 OpenCompass 收集基线的最佳分数。结果如表 3 所示。</p>
<p><strong>表 3: Qwen 与开源基座模型在广泛使用的基准上的整体性能对比</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>MMLU 5-shot</th>
<th>C-Eval 5-shot</th>
<th>GSM8K 8-shot</th>
<th>MATH 4-shot</th>
<th>HumanEval 0-shot</th>
<th>MBPP 3-shot</th>
<th>BBH 3-shot</th>
</tr>
</thead>
<tbody><tr>
<td>MPT</td>
<td>7B / 30B</td>
<td>30.8 / 47.9</td>
<td>23.5 / -</td>
<td>9.1 / 15.2</td>
<td>3.0 / 3.1</td>
<td>18.3 / 25.0</td>
<td>22.8 / 32.8</td>
<td>35.6 / 38.0</td>
</tr>
<tr>
<td>Falcon</td>
<td>7B / 40B</td>
<td>27.8 / 57.0</td>
<td>- / -</td>
<td>6.8 / 19.6</td>
<td>2.3 / 5.5</td>
<td>- / -</td>
<td>11.2 / 29.8</td>
<td>28.0 / 37.1</td>
</tr>
<tr>
<td>ChatGLM2</td>
<td>6B</td>
<td>47.9</td>
<td>51.7</td>
<td>32.4</td>
<td>6.5</td>
<td>-</td>
<td>-</td>
<td>33.7</td>
</tr>
<tr>
<td>InternLM</td>
<td>7B / 20B</td>
<td>51.0 / 62.1</td>
<td>53.4 / 58.8</td>
<td>31.2 / 52.6</td>
<td>6.3 / 7.9</td>
<td>10.4 / 25.6</td>
<td>14.0 / 35.6</td>
<td>37.0 / 52.5</td>
</tr>
<tr>
<td>Baichuan2</td>
<td>7B / 13B</td>
<td>54.7 / 59.5</td>
<td>56.3 / 59.0</td>
<td>24.6 / 52.8</td>
<td>5.6 / 10.1</td>
<td>18.3 / 17.1</td>
<td>24.2 / 30.2</td>
<td>41.6 / 49.0</td>
</tr>
<tr>
<td>LLaMA</td>
<td>7B / 13B / 33B / 65B</td>
<td>35.6 / 47.7 / 58.7 / 63.7</td>
<td>27.3 / 31.8 / 37.5 / 40.4</td>
<td>11.0 / 20.3 / 42.3 / 54.4</td>
<td>2.9 / 4.2 / 7.1 / 10.6</td>
<td>12.8 / 15.8 / 21.7 / 23.7</td>
<td>17.7 / 22.0 / 30.2 / 37.7</td>
<td>33.5 / 37.9 / 50.0 / 58.4</td>
</tr>
<tr>
<td>LLaMA-2</td>
<td>7B / 13B / 34B / 70B</td>
<td>46.8 / 55.0 / 62.6 / 69.8</td>
<td>32.5 / 41.4 / - / 50.1</td>
<td>16.7 / 29.6 / 42.2 / 63.3</td>
<td>3.3 / 5.0 / 6.2 / 13.5</td>
<td>12.8 / 18.9 / 22.6 / 29.9</td>
<td>20.8 / 30.3 / 33.0 / 45.0</td>
<td>38.2 / 45.6 / 44.1 / 64.9</td>
</tr>
<tr>
<td>StableBeluga2</td>
<td>70B</td>
<td>68.6</td>
<td>51.4</td>
<td>69.6</td>
<td>14.6</td>
<td>28.0</td>
<td>11.4</td>
<td>69.3</td>
</tr>
<tr>
<td><strong>Qwen</strong></td>
<td><strong>1.8B</strong></td>
<td><strong>44.6</strong></td>
<td><strong>54.7</strong></td>
<td><strong>21.2</strong></td>
<td><strong>5.6</strong></td>
<td><strong>17.1</strong></td>
<td><strong>14.8</strong></td>
<td><strong>28.2</strong></td>
</tr>
<tr>
<td></td>
<td><strong>7B</strong></td>
<td><strong>58.2</strong></td>
<td><strong>63.5</strong></td>
<td><strong>51.7</strong></td>
<td><strong>11.6</strong></td>
<td><strong>29.9</strong></td>
<td><strong>31.6</strong></td>
<td><strong>45.0</strong></td>
</tr>
<tr>
<td></td>
<td><strong>14B</strong></td>
<td><strong>66.3</strong></td>
<td><strong>72.1</strong></td>
<td><strong>61.3</strong></td>
<td><strong>24.8</strong></td>
<td><strong>32.3</strong></td>
<td><strong>40.8</strong></td>
<td><strong>53.4</strong></td>
</tr>
</tbody></table>
<p>我们的实验结果表明，三个 Qwen 模型在所有下游任务中展现出卓越性能。值得注意的是，即使是 LLaMA2-70B 这样的更大模型，在 3 个任务上也被 Qwen-14B 超越。Qwen-7B 同样表现出色，超越了 LLaMA2-13B 并达到了与 Baichuan2-13B 相当的结果。尽管参数量相对较小，Qwen-1.8B 在某些任务上也能取得有竞争力的性能，甚至在某些情况下超越了更大的模型。</p>
<p>为评估上下文长度扩展的有效性，表 2 展示了在 arXiv 数据集上以困惑度(PPL)表示的测试结果。这些结果表明，通过结合 NTK-aware 插值、LogN-Scaling 和分层窗口分配，我们可以在超过 8192 token 的上下文中有效保持模型性能。</p>
<blockquote>
<p>译者注：表 3 的数据揭示了几个关键趋势。第一，Qwen-14B 在 C-Eval(72.1%)和 MATH(24.8%)上大幅领先于所有列出的开源模型，包括参数量更大的 LLaMA-65B 和 LLaMA-2-70B。C-Eval 是中文评测集，这强烈暗示了训练数据中的中文比例和质量问题——Qwen 在中文理解上建立了显著优势。第二，HumanEval 上 Qwen-14B(32.3%) 超越了 LLaMA-65B(23.7%) 和 LLaMA-2-70B(29.9%)，这对于一个&quot;通用&quot;基座模型来说是意外的——通常代码能力需要专门的代码预训练，而 Qwen 在通用预训练中就已经展现出强劲的代码理解能力。第三，Qwen-1.8B 的 MMLU 达到 44.6%，接近 LLaMA-7B 的 35.6% 和 MPT-7B 的 30.8%，这个&quot;小模型大能力&quot;的现象暗示了数据质量和训练效率的优化。</p>
</blockquote>
<hr>
<h2 id="3-alignment">3 Alignment</h2>
<p>预训练的大语言模型被发现与人类行为不对齐，这使它们在大多数情况下不适合作为 AI 助手。近期研究表明，使用 SFT 和 RLHF 等对齐技术可以显著提高语言模型进行自然对话的能力。在本节中，我们将深入探讨 Qwen 模型如何使用 SFT 和 RLHF 进行训练，并评估它们在聊天辅助场景中的性能。</p>
<h3 id="3-1-supervised-finetuning">3.1 Supervised Finetuning</h3>
<p>为理解人类行为，初始步骤是进行 SFT，即在包含查询和回复的聊天风格数据上微调预训练 LLM。在以下章节中，我们将深入探讨数据构建和训练方法的细节。</p>
<h4 id="data">Data</h4>
<p>为增强 SFT 数据集的能力，我们以多种风格标注了对话。虽然传统数据集包含大量以问题、指令和答案形式提示的数据，但我们的方法更进一步，标注了人类风格的对话。这一做法受 InstructGPT 启发，旨在通过关注多样化任务的自然语言生成来提高模型的 helpfulness。</p>
<p>为确保模型能够泛化到广泛场景，我们特意排除了以可能限制其能力的提示模板格式化的数据。此外，我们通过对与暴力、偏见和色情等安全问题相关的数据进行标注，优先考虑了语言模型的安全性。</p>
<p>除数据质量外，我们观察到训练方法对模型最终性能有显著影响。为此，我们采用了 ChatML 格式，这是一种能够描述回合的元数据(如角色)和内容的通用元语言。这种格式使模型能够有效区分各种类型的信息，包括系统设置、用户输入和助手输出等。通过利用这种方法，我们可以增强模型准确处理和分析复杂对话数据的能力。</p>
<h4 id="training">Training</h4>
<p>与预训练一致，我们也将下一个 token 预测作为 SFT 的训练任务。我们对系统输入和用户输入应用损失掩码。更多细节在第 8.1 节中展示。</p>
<p>模型训练使用 AdamW 优化器，超参数如下：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1=0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2=0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi><mo>=</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\epsilon=10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>。序列长度限制为 2048，批次大小为 128。模型共训练 4000 步，学习率在前 1430 步逐渐上升，达到峰值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>。为防止过拟合，权重衰减设为 0.1，dropout 设为 0.1，梯度裁剪限制为 1.0。</p>
<blockquote>
<p>译者注：SFT 训练的几个超参数值得注意。4000 步的训练非常短——以批次大小 128 和序列长度 2048 计算，每步处理约 262K token，4000 步总计约 1B token。这与 3T 的预训练数据相比不到 0.04%。这种&quot;轻量 SFT&quot;策略在当时是常见做法，但后续研究表明更长的 SFT 训练(如 Qwen2 的 800B token 全模型训练)可以显著提升对齐质量。另一个细节是 ChatML 格式的选择——使用 <code>&lt;|im_start|&gt;</code> 和 <code>&lt;|im_end|&gt;</code> 等特殊 token 而非自然语言分隔符，这避免了模型将对话标记与普通文本混淆的问题。这个设计后来被 Qwen 系列一直沿用，成为其标志性特征之一。</p>
</blockquote>
<h3 id="3-2-reinforcement-learning-from-human-feedback">3.2 Reinforcement Learning from Human Feedback</h3>
<p>虽然 SFT 已被证明有效，但我们承认其泛化和创造能力可能有限，且容易过拟合。为解决这一问题，我们实现了 RLHF 以进一步将 SFT 模型与人类偏好对齐，遵循 InstructGPT 和 RLHF 论文的方法。此过程涉及训练奖励模型并使用 PPO(Proximal Policy Optimization，近端策略优化)进行策略训练。</p>
<h4 id="reward-model">Reward Model</h4>
<p>为创建成功的奖励模型，与构建大语言模型类似，首先进行预训练然后微调至关重要。此预训练过程也称为偏好模型预训练(PMP, Preference Model Pretraining)，需要大量比较数据。该数据集由样本对组成，每个样本对包含单个查询的两个不同回复及其对应的偏好。类似地，微调也在此类比较数据上进行，但由于存在质量标注，数据质量更高。</p>
<p>在微调阶段，我们收集了各种提示，并根据人类反馈调整奖励模型对 Qwen 模型回复的评估。为确保充分考虑用户提示的多样性和复杂性，我们创建了一个包含约 6600 个详细标签的分类系统，并实现了一个平衡采样算法，在选择用于奖励模型标注的提示时同时考虑多样性和复杂性。为生成广泛的回复，我们使用了不同规模和采样策略的 Qwen 模型，因为多样化的回复有助于降低标注难度并增强奖励模型的性能。这些回复随后由标注者按照标准标注指南进行评估，并根据分数形成比较对。</p>
<p>在创建奖励模型时，我们使用相同规模的语言模型 Qwen 来初始化。需要提及的是，我们在原始 Qwen 模型中增加了一个池化层，以基于特定的结束 token 提取句子的奖励值。</p>
<p>此过程的学习率设为恒定值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>，批次大小为 64。此外，序列长度设为 2048，训练过程持续一个 epoch。</p>
<p>我们将测试数据集上的准确率作为奖励模型的重要但非唯一的评估指标。在表 4 中，我们报告了 PMP 和奖励模型在多样的人类偏好基准数据集上的测试成对准确率。具体来说，Qwen Helpful-base 和 Qwen Helpful-online 是我们的专有数据集。Qwen Helpful-base 中的回复来自未经 RLHF 的 Qwen，而 Qwen Helpful-online 包含来自经过 RLHF 的 Qwen 的回复。结果表明，PMP 模型在分布外数据上展现出高泛化能力，而奖励模型在我们的 Qwen 奖励数据集上表现出显著改进。</p>
<p><strong>表 4: Qwen PMP 和奖励模型在多样人类偏好基准数据集上的测试准确率</strong></p>
<p>| 数据集 | Qwen Helpful-base | Qwen Helpful-online | Anthropic Helpful-base | Anthropic Helpful-online | OpenAI Sum.</p>
<p>| Stanford SHP | OpenAI PRM800K |
|--------|-------------------|---------------------|------------------------|--------------------------|-------------|--------------|----------------|
| PMP | 62.68 | 61.62 | 76.52 | 65.43 | 69.60 | 60.05 | 70.59 |
| RM | 74.78 | 69.71 | 73.98 | 64.57 | 69.99 | 60.10 | 70.52 |</p>
<blockquote>
<p>译者注：奖励模型的设计有几个工程亮点。第一，使用与策略模型相同规模的基础模型来初始化奖励模型(而非从零训练一个小模型)，这确保了奖励模型具备与策略模型相当的理解能力。第二，PMP 阶段使用大量比较数据进行预训练，这类似于语言模型的预训练阶段——先在通用偏好数据上学习&quot;什么是好回复&quot;的基本概念，再在高质量标注数据上微调。第三，6600 个标签的分类系统是一个相当细粒度的提示分类方案，远超当时大多数工作的简单分类(如&quot;helpful&quot;、&quot;harmless&quot;)。这种细粒度分类使得采样算法能够覆盖更广泛的场景，减少奖励模型在某些特定类型提示上的偏见。</p>
</blockquote>
<h4 id="reinforcement-learning">Reinforcement Learning</h4>
<p>我们的 PPO 过程涉及四个模型：策略模型、价值模型、参考模型和奖励模型。在开始 PPO 之前，我们暂停策略模型的更新，专注于仅更新价值模型 50 步。这种方法确保价值模型能够有效适应不同的奖励模型。</p>
<p>在 PPO 过程中，我们采用同时为每个查询采样两个回复的策略。根据我们的内部基准评估，这种策略已被证明更有效。我们将 KL 散度系数设为 0.04，并基于运行均值对奖励进行归一化。</p>
<p>策略模型和价值模型的学习率分别为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>。为增强训练稳定性，我们使用值为 0.15 的 value loss clipping。对于推理，策略 top-p 设为 0.9。我们的发现表明，虽然熵略低于 top-p=1.0 时的情况，但奖励增长更快，最终在相似条件下产生持续更高的评估奖励。</p>
<p>此外，我们实现了预训练梯度来缓解对齐税(alignment tax)。实证发现表明，使用此特定奖励模型，KL 惩罚在非严格代码或数学性质的基准(如测试常识知识和阅读理解的基准)中足以抵消对齐税。与 PPO 数据相比，必须使用显著更大体积的预训练数据来确保预训练梯度的有效性。此外，我们的实证研究表明，过大的系数值会严重阻碍对奖励模型的对齐，最终损害整体对齐效果; 而过小的值则仅对减少对齐税有边际效果。</p>
<blockquote>
<p>译者注：&quot;预训练梯度&quot;(pretrained gradient)是缓解对齐税的一个关键技巧。其核心思想是：在 PPO 的梯度更新中，除了策略梯度外，还混入一部分预训练数据上的梯度。这样模型在优化人类偏好的同时，不会遗忘预训练阶段学到的通用知识。这本质上是一种&quot;正则化&quot;——用预训练数据作为锚点，防止策略模型偏离基础能力太远。作者提到的&quot;必须使用显著更大体积的预训练数据&quot;暗示了配比的重要性：如果 PPO 数据与预训练数据的比例不当，效果会大打折扣。这与后来 DPO 方法中参考模型所起到的类似&quot;锚定&quot;作用形成有趣的对比。</p>
</blockquote>
<h3 id="3-3-automatic-and-human-evaluation-of-aligned-models">3.3 Automatic and Human Evaluation of Aligned Models</h3>
<p>为展示对齐模型的有效性，我们在 MMLU、C-Eval、GSM8K、HumanEval 和 BBH 等成熟基准上与其他对齐模型进行了对比。除广泛使用的少样本设置外，我们还测试了零样本设置以展示模型遵循指令的能力。零样本设置中的提示由指令和问题组成，上下文中没有任何先前的示例。基线结果从官方报告和 OpenCompass 收集。</p>
<p>表 5 中的结果展示了我们aligned模型在理解人类指令和生成适当回复方面的有效性。Qwen-14B-Chat 在所有数据集上超越了除 ChatGPT 和 LLaMA-2-Chat-70B 之外的所有其他模型，包括 MMLU、C-Eval、GSM8K、HumanEval 和 BBH。特别是在 HumanEval 上，Qwen 的性能显著高于其他开源模型。</p>
<p><strong>表 5: 对齐模型在广泛使用的基准上的性能</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>MMLU 0/5-shot</th>
<th>C-Eval 0/5-shot</th>
<th>GSM8K 0/8-shot</th>
<th>HumanEval 0-shot</th>
<th>BBH 0/3-shot</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-3.5</td>
<td>-</td>
<td>- / 69.1</td>
<td>- / 52.5</td>
<td>- / 78.2</td>
<td>73.2</td>
<td>- / 70.1</td>
</tr>
<tr>
<td>GPT-4</td>
<td>-</td>
<td>- / 83.0</td>
<td>- / 69.9</td>
<td>- / 91.4</td>
<td>86.6</td>
<td>- / 86.7</td>
</tr>
<tr>
<td>ChatGLM2</td>
<td>6B</td>
<td>45.5 / 46.0</td>
<td>50.1 / 52.6</td>
<td>- / 28.8</td>
<td>11.0</td>
<td>- / 32.7</td>
</tr>
<tr>
<td>InternLM-Chat</td>
<td>7B</td>
<td>- / 51.1</td>
<td>- / 53.6</td>
<td>- / 33.0</td>
<td>14.6</td>
<td>- / 32.5</td>
</tr>
<tr>
<td>Baichuan2-Chat</td>
<td>7B / 13B</td>
<td>- / 52.9 / 57.3</td>
<td>- / 55.6 / 56.7</td>
<td>- / 32.8 / 55.3</td>
<td>13.4 / 17.7</td>
<td>- / 35.8 / 49.9</td>
</tr>
<tr>
<td>LLaMA-2-Chat</td>
<td>7B / 13B / 70B</td>
<td>- / 46.2 / 54.6 / 63.8</td>
<td>- / 31.9 / 36.2 / 44.3</td>
<td>- / 26.3 / 37.1 / 59.3</td>
<td>12.2 / 18.9 / 32.3</td>
<td>- / 35.6 / 40.1 / 60.8</td>
</tr>
<tr>
<td><strong>Qwen-Chat</strong></td>
<td><strong>1.8B</strong></td>
<td><strong>42.4 / 43.9</strong></td>
<td><strong>50.7 / 50.3</strong></td>
<td><strong>27.8 / 19.5</strong></td>
<td><strong>14.6</strong></td>
<td><strong>27.1 / 25.0</strong></td>
</tr>
<tr>
<td></td>
<td><strong>7B</strong></td>
<td><strong>55.8 / 57.0</strong></td>
<td><strong>59.7 / 59.3</strong></td>
<td><strong>50.3 / 54.1</strong></td>
<td><strong>37.2</strong></td>
<td><strong>39.6 / 46.7</strong></td>
</tr>
<tr>
<td></td>
<td><strong>14B</strong></td>
<td><strong>64.6 / 66.5</strong></td>
<td><strong>69.8 / 71.7</strong></td>
<td><strong>60.1 / 59.3</strong></td>
<td><strong>43.9</strong></td>
<td><strong>46.9 / 58.7</strong></td>
</tr>
</tbody></table>
<p>此外，Qwen 的性能始终优于相似规模的开源模型，如 LLaMA-2、ChatGLM2、InternLM 和 Baichuan2。这表明我们的对齐方法——在大量人类对话数据集上微调模型——在提高模型理解和生成类人类语言的能力方面是有效的。</p>
<p>尽管如此，我们对传统基准评测能否准确衡量当今使用对齐技术训练的聊天模型的性能和潜力持保留态度。前述结果提供了我们竞争力的部分证据，但我们认为开发专门针对对齐模型的新评估方法至关重要。</p>
<p>我们认为人工评估至关重要，为此我们创建了一个精心策划的数据集。我们的过程涉及收集 300 条涵盖广泛主题的中文指令，包括知识、语言理解、创意写作、编码和数学。为评估不同模型的性能，我们选择了 Qwen-Chat-7B 的 SFT 版本以及 Qwen-Chat-14B 的 SFT 和 RLHF 版本，并添加了两个强大的基线 GPT-3.5 和 GPT-4 进行对比。对于每条指令，我们请三位标注者按照 helpfulness、信息量、有效性等因素的综合分数对模型回复进行排序。</p>
<p><img src="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy/images/base_winrate_bar.pdf" alt="聊天模型的人工评估结果"></p>
<blockquote>
<p>图 4: 聊天模型的人工评估结果。我们比较了 Qwen-7B(SFT)、Qwen-14B(SFT)、Qwen-14B(RLHF)以及 GPT-4 相对于 GPT-3.5 的表现。每个柱状段从下到上分别代表胜率、平局率和败率。平均而言，RLHF 模型优于 SFT 模型。数据集包含 300 条中文指令。</p>
</blockquote>
<p>图 4 展示了各模型的胜率。对于每个模型，我们报告其相对于 GPT-3.5 的胜率、平局率和败率百分比。</p>
<p>实验结果清楚地表明，RLHF 模型以显著优势超越了 SFT 模型，表明 RLHF 可以鼓励模型生成更受人类偏好的回复。在整体性能方面，我们发现 RLHF 模型显著优于 SFT 模型，仅次于 GPT-4。这表明 RLHF 对于对齐人类偏好的有效性。</p>
<blockquote>
<p>译者注：人工评估的结果很有趣。Qwen-14B-RLHF 在 300 条中文指令上相对于 GPT-3.5 的胜率约为 40%，平局约 30%，败率约 30%——这意味着在中文场景下，14B 的 RLHF 模型已经可以与 GPT-3.5 形成&quot;有来有回&quot;的竞争。但这里有几个需要注意的点：第一，测试集是中文的，而 GPT-3.5 主要针对英文优化，这在一定程度上&quot;偏袒&quot;了 Qwen。第二，300 条指令的样本量较小，且由阿里自己构建和标注，存在潜在的利益冲突。第三，评估维度(helpfulness、informativeness、validity)较为笼统，缺乏对安全性、事实准确性等关键维度的细分。这些因素提醒我们：人工评估虽然重要，但其结果的可比性和客观性需要谨慎对待。</p>
</blockquote>
<h3 id="3-4-tool-use-code-interpreter-and-agent">3.4 Tool Use, Code Interpreter, and Agent</h3>
<p>Qwen 模型具有多功能性，能够通过利用工具使用和规划技能来协助(半)自动化日常任务。因此，它们可以作为 Agent 或 Copilot 来帮助简化各种任务。我们探索了 Qwen 在以下方面的能力：</p>
<ul>
<li>通过 ReAct 提示使用未见过的工具(见表 6)。</li>
<li>使用 Python 代码解释器增强数学推理、数据分析等(见表 7 和表 8)。</li>
<li>作为访问 Hugging Face 广泛多模态模型集合并与人类交互的 Agent(见表 9)。</li>
</ul>
<p>为增强 Qwen 作为 Agent 或 Copilot 的能力，我们采用 self-instruct 策略进行 SFT。具体来说，我们利用 Qwen 的上下文学习能力进行 self-instruction。通过提供少量示例，我们可以提示 Qwen 生成更多相关查询并生成遵循特定格式(如 ReAct)的输出。然后我们应用规则并引入人工标注者来过滤掉任何噪声样本。之后，样本被纳入 Qwen 的训练数据，从而产生一个更新版本的 Qwen，更适合 self-instruction。我们多次迭代此过程，直到收集到足够数量具有卓越质量和广泛多样性的样本。最终，我们的收集包含约 2000 条高质量样本。</p>
<p>在微调过程中，我们将这些高质量样本与所有其他通用 SFT 样本混合，而非引入额外的训练阶段。通过这样做，我们能够保留对于构建 Agent 应用同样至关重要的通用能力。</p>
<p><strong>表 6: Qwen 在内部中文基准上通过 ReAct 提示使用未见工具的能力评估</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>工具选择准确率</th>
<th>工具输入 Rouge-L</th>
<th>误报错误率</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>-</td>
<td>95</td>
<td>90</td>
<td>15.0%</td>
</tr>
<tr>
<td>GPT-3.5</td>
<td>-</td>
<td>85</td>
<td>88</td>
<td>75.0%</td>
</tr>
<tr>
<td>Qwen-Chat</td>
<td>1.8B</td>
<td>92</td>
<td>89</td>
<td>19.3%</td>
</tr>
<tr>
<td></td>
<td>7B</td>
<td>98</td>
<td>91</td>
<td>7.3%</td>
</tr>
<tr>
<td></td>
<td>14B</td>
<td>98</td>
<td>93</td>
<td>2.4%</td>
</tr>
</tbody></table>
<p><strong>表 7: Qwen 在代码解释器内部评测基准上的代码可执行比例</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>数学(%)</th>
<th>可视化(%)</th>
<th>通用(%)</th>
<th>全部(%)</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>-</td>
<td>91.9</td>
<td>85.9</td>
<td>82.8</td>
<td>86.8</td>
</tr>
<tr>
<td>GPT-3.5</td>
<td>-</td>
<td>89.2</td>
<td>65.0</td>
<td>74.1</td>
<td>72.9</td>
</tr>
<tr>
<td>LLaMA-2-Chat</td>
<td>7B / 13B</td>
<td>41.9 / 50.0</td>
<td>33.1 / 40.5</td>
<td>24.1 / 48.3</td>
<td>33.6 / 44.4</td>
</tr>
<tr>
<td>Code-LLaMA-Instruct</td>
<td>7B / 13B</td>
<td>85.1 / 93.2</td>
<td>54.0 / 55.8</td>
<td>70.7 / 74.1</td>
<td>65.1 / 68.8</td>
</tr>
<tr>
<td>InternLM-Chat</td>
<td>7B / 20B</td>
<td>78.4 / 70.3</td>
<td>44.2 / 44.2</td>
<td>62.1 / 65.5</td>
<td>56.3 / 54.9</td>
</tr>
<tr>
<td>Qwen-Chat</td>
<td>1.8B / 7B / 14B</td>
<td>33.8 / 82.4 / 89.2</td>
<td>30.1 / 64.4 / 84.1</td>
<td>8.6 / 67.2 / 65.5</td>
<td>26.8 / 70.2 / 81.7</td>
</tr>
</tbody></table>
<p><strong>表 8: 代码解释器最终回复的正确性</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>数学(%)</th>
<th>Vis.-Hard(%)</th>
<th>Vis.-Easy(%)</th>
<th>Vis.-All(%)</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>-</td>
<td>82.8</td>
<td>66.7</td>
<td>60.8</td>
<td>63.8</td>
</tr>
<tr>
<td>GPT-3.5</td>
<td>-</td>
<td>47.3</td>
<td>33.3</td>
<td>55.7</td>
<td>44.2</td>
</tr>
<tr>
<td>LLaMA-2-Chat</td>
<td>7B / 13B</td>
<td>3.9 / 8.3</td>
<td>14.3 / 8.3</td>
<td>39.2 / 40.5</td>
<td>26.4 / 23.9</td>
</tr>
<tr>
<td>Code-LLaMA-Instruct</td>
<td>7B / 13B</td>
<td>14.3 / 28.2</td>
<td>26.2 / 27.4</td>
<td>60.8 / 62.0</td>
<td>42.9 / 44.2</td>
</tr>
<tr>
<td>InternLM-Chat</td>
<td>7B / 20B</td>
<td>28.5 / 34.6</td>
<td>4.8 / 21.4</td>
<td>40.5 / 45.6</td>
<td>22.1 / 33.1</td>
</tr>
<tr>
<td>Qwen-Chat</td>
<td>1.8B / 7B / 14B</td>
<td>14.7 / 41.9 / 58.4</td>
<td>3.6 / 40.5 / 53.6</td>
<td>20.3 / 54.4 / 59.5</td>
<td>11.7 / 47.2 / 56.4</td>
</tr>
</tbody></table>
<p><strong>表 9: Qwen-Chat 在 Hugging Face Agent 基准上的结果</strong></p>
<table>
<thead>
<tr>
<th>任务</th>
<th>模型</th>
<th>参数量</th>
<th>工具选择</th>
<th>工具使用</th>
<th>代码正确性</th>
</tr>
</thead>
<tbody><tr>
<td>Run Mode</td>
<td>GPT-4</td>
<td>-</td>
<td>100</td>
<td>100</td>
<td>97.4</td>
</tr>
<tr>
<td></td>
<td>GPT-3.5</td>
<td>-</td>
<td>95.4</td>
<td>96.3</td>
<td>87.0</td>
</tr>
<tr>
<td></td>
<td>Starcoder-Base</td>
<td>15B</td>
<td>86.1</td>
<td>87.0</td>
<td>68.9</td>
</tr>
<tr>
<td></td>
<td>Starcoder</td>
<td>15B</td>
<td>87.0</td>
<td>88.0</td>
<td>68.9</td>
</tr>
<tr>
<td></td>
<td>Qwen-Chat</td>
<td>1.8B / 7B / 14B</td>
<td>85.2 / 87.0 / 93.5</td>
<td>84.3 / 87.0 / 94.4</td>
<td>61.1 / 71.5 / 87.0</td>
</tr>
<tr>
<td>Chat Mode</td>
<td>GPT-4</td>
<td>-</td>
<td>97.9</td>
<td>97.9</td>
<td>98.5</td>
</tr>
<tr>
<td></td>
<td>GPT-3.5</td>
<td>-</td>
<td>97.3</td>
<td>96.8</td>
<td>89.6</td>
</tr>
<tr>
<td></td>
<td>Starcoder-Base</td>
<td>15B</td>
<td>97.9</td>
<td>97.9</td>
<td>91.1</td>
</tr>
<tr>
<td></td>
<td>Starcoder</td>
<td>15B</td>
<td>97.9</td>
<td>97.9</td>
<td>89.6</td>
</tr>
<tr>
<td></td>
<td>Qwen-Chat</td>
<td>1.8B / 7B / 14B</td>
<td>93.6 / 94.7 / 97.9</td>
<td>93.6 / 94.7 / 97.9</td>
<td>73.2 / 85.1 / 95.5</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：工具使用和 Agent 能力是 Qwen 1.0 报告中一个被低估的亮点。表 6 显示 Qwen-7B 在工具选择准确率(98%)上超越了 GPT-4(95%)——虽然这个内部基准可能存在语言偏向(测试集是中文的)，但仍展示了 Qwen 在结构化输出(ReAct 格式)上的强大能力。更值得注意的是表 7 和表 8 中的代码解释器评测：Qwen-14B 在可执行率(81.7%)和正确性(56.4%)上都大幅超越了所有开源对手，包括专门优化的 Code-LLaMA-13B(68.8% / 44.2%)。这揭示了一个反直觉的现象：通用模型+适当的 SFT 数据，在需要综合能力的 Agent 任务上，可以击败专门的代码模型。原因是 Agent 任务不仅需要编码能力，还需要数学建模、数据理解和规划能力——这正是通用模型的优势所在。</p>
</blockquote>
<hr>
<h2 id="4-code-qwen-specialized-model-for-coding">4 Code-Qwen: Specialized Model for Coding</h2>
<p>在特定领域数据上训练已被证明非常有效，特别是在代码预训练和微调方面。经过代码数据强化训练的语言模型可以作为编码、调试和解释等任务的宝贵工具。在本工作中，我们使用预训练和对齐技术开发了一系列通用模型。在此基础上，我们通过利用 Qwen 的基础语言模型创建了代码领域专用模型，包括继续预训练模型 Code-Qwen 和监督微调模型 Code-Qwen-Chat。两个模型均有 14B 和 7B 参数版本。</p>
<h3 id="4-1-code-pretraining">4.1 Code Pretraining</h3>
<p>我们认为仅依靠代码数据进行预训练会导致作为多功能助手的能力显著丧失。与先前专注于仅在代码数据上预训练的方法不同，我们采取了不同的方法：从在文本和代码数据组合上训练的 Qwen 基础模型开始，然后继续在代码数据上预训练。我们继续预训练模型共约 900 亿个 token。在预训练阶段，我们使用 Qwen 基础语言模型初始化模型。</p>
<p>许多依赖代码专用模型的应用可能遇到 lengthy 上下文场景，如第 3.4 节中提到的工具使用和代码解释。为解决此问题，我们以最长 8192 的上下文长度训练模型。与第 2.4 节中的基础模型训练类似，我们在注意力模块中采用 Flash Attention，并使用标准优化器 AdamW，设置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1=0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2=0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi><mo>=</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\epsilon=10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>。学习率设为 Code-Qwen-14B 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 和 Code-Qwen-7B 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>，3% 的 warm up 迭代，无学习率衰减。</p>
<h3 id="4-2-code-supervised-fine-tuning">4.2 Code Supervised Fine-Tuning</h3>
<p>在开展一系列实证实验后，我们确定多阶段 SFT 策略相比其他方法产生了最佳性能。在监督微调阶段，由代码基础模型 Code-Qwen 初始化的模型 Code-Qwen-Chat 通过 AdamW 优化器(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1=0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2=0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi><mo>=</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\epsilon=10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>)进行优化，14B 和 7B 模型的学习率分别为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2.0 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>。学习率通过余弦调度(3% warm-up 步数)上升至峰值后保持恒定。</p>
<h3 id="4-3-evaluation">4.3 Evaluation</h3>
<p><strong>表 10: HumanEval 和 MBPP 上的 pass@1(%)结果</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>HumanEval</th>
<th>MBPP</th>
</tr>
</thead>
<tbody><tr>
<td>PaLM</td>
<td>540B</td>
<td>26.2</td>
<td>36.8</td>
</tr>
<tr>
<td>PaLM-Coder</td>
<td>540B</td>
<td>36.0</td>
<td>47.0</td>
</tr>
<tr>
<td>PaLM 2-S</td>
<td>-</td>
<td>37.6</td>
<td>50.0</td>
</tr>
<tr>
<td>Code-Davinci-002</td>
<td>-</td>
<td>47.0</td>
<td>58.1</td>
</tr>
<tr>
<td>GPT-3.5</td>
<td>-</td>
<td>73.2</td>
<td>-</td>
</tr>
<tr>
<td>GPT-4</td>
<td>-</td>
<td>86.6</td>
<td>-</td>
</tr>
<tr>
<td>LLaMA-2</td>
<td>7B / 13B / 34B / 70B</td>
<td>12.2 / 20.1 / 22.6 / 30.5</td>
<td>20.8 / 27.6 / 33.8 / 45.4</td>
</tr>
<tr>
<td>Code-LLaMA</td>
<td>7B / 13B / 34B</td>
<td>33.5 / 36.0 / 48.8</td>
<td>41.4 / 47.0 / 55.0</td>
</tr>
<tr>
<td>Code-LLaMA-Instruct</td>
<td>7B / 13B / 34B</td>
<td>34.8 / 42.7 / 41.5</td>
<td>44.4 / 49.4 / 57.0</td>
</tr>
<tr>
<td>Code-LLaMA-Python</td>
<td>7B / 13B / 34B</td>
<td>38.4 / 43.3 / 53.7</td>
<td>47.6 / 49.0 / 56.2</td>
</tr>
<tr>
<td>WizardCoder-Python</td>
<td>13B / 34B</td>
<td>64.0 / 73.2</td>
<td>55.6 / 61.2</td>
</tr>
<tr>
<td>Qwen-Chat</td>
<td>7B / 14B</td>
<td>37.2 / 43.9</td>
<td>35.8 / 46.4</td>
</tr>
<tr>
<td>Code-Qwen</td>
<td>7B / 14B</td>
<td>40.2 / 45.1</td>
<td>41.8 / 51.4</td>
</tr>
<tr>
<td>Code-Qwen-Chat</td>
<td>7B / 14B</td>
<td>43.3 / 66.4</td>
<td>44.2 / 52.4</td>
</tr>
</tbody></table>
<p><strong>表 11: HumanEvalPack 多语言代码生成基准上的零样本 pass@1(%)</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>Python</th>
<th>JavaScript</th>
<th>Java</th>
<th>Go</th>
<th>C++</th>
<th>Rust</th>
<th>Avg.</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>-</td>
<td>86.6</td>
<td>82.9</td>
<td>81.7</td>
<td>72.6</td>
<td>78.7</td>
<td>67.1</td>
<td>78.3</td>
</tr>
<tr>
<td>StarCoder</td>
<td>15B</td>
<td>33.6</td>
<td>30.8</td>
<td>30.2</td>
<td>17.6</td>
<td>31.6</td>
<td>21.8</td>
<td>27.6</td>
</tr>
<tr>
<td>Code-LLaMA-Instruct</td>
<td>7B / 13B</td>
<td>34.8 / 42.7</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Code-Qwen</td>
<td>7B / 14B</td>
<td>40.2 / 45.1</td>
<td>40.4 / 51.8</td>
<td>40.2 / 57.3</td>
<td>26.2 / 39.6</td>
<td>20.7 / 18.2</td>
<td>15.8 / 20.7</td>
<td>30.6 / 38.8</td>
</tr>
<tr>
<td>Code-Qwen-Chat</td>
<td>7B / 14B</td>
<td>43.3 / 66.4</td>
<td>41.5 / 58.5</td>
<td>49.4 / 56.1</td>
<td>29.3 / 47.6</td>
<td>32.9 / 54.2</td>
<td>20.1 / 28.7</td>
<td>36.1 / 51.9</td>
</tr>
</tbody></table>
<p>我们的 Code-Qwen 模型与专有和开源语言模型进行了对比，如表 10 和表 11 所示。分析表明，专用模型 Code-Qwen 和 Code-Qwen-Chat 显著超越了相似参数量的先前基线，如 OctoGeeX、InstructCodeT5+ 和 CodeGeeX2。事实上，这些模型甚至可以与 Starcoder 等更大规模的模型媲美。</p>
<p>与某些极大规模的闭源模型相比，Code-Qwen 和 Code-Qwen-Chat 在 pass@1 方面展现出明显优势。但需要注意的是，这些模型总体上仍落后于 GPT-4 等 SOTA 方法。尽管如此，随着模型规模和数据规模的持续扩展，我们相信这一差距可以在不久的将来缩小。</p>
<blockquote>
<p>译者注：Code-Qwen-14B-Chat 在 HumanEval 上达到 66.4% 的 pass@1，这是一个非常强的结果——超越了 Code-LLaMA-Python-34B(53.7%) 和 Code-LLaMA-Instruct-34B(41.5%)，甚至接近 WizardCoder-Python-34B(73.2%)。但这里有一个关键细节：Code-Qwen 的训练流程是&quot;通用预训练 → 代码继续预训练 → SFT&quot;，而 Code-LLaMA 是&quot;通用预训练 → 长代码继续预训练 → 专用代码 SFT → 通用指令 SFT&quot;。Code-Qwen 在 14B 规模上超越 34B 的 Code-LLaMA，可能反映了两个因素：第一，Qwen 的通用基座能力更强; 第二，代码继续预训练的 90B token 虽然不多，但质量很高。不过 66.4% 与 GPT-4 的 86.6% 之间仍有 20 个百分点的差距，这说明在代码生成这一特定任务上，闭源模型的优势仍然显著。</p>
</blockquote>
<hr>
<h2 id="5-math-qwen-specialized-model-for-mathematics-reasoning">5 Math-Qwen: Specialized Model for Mathematics Reasoning</h2>
<p>我们创建了数学专用模型系列 Math-Qwen-Chat，基于 Qwen 预训练语言模型构建。我们开发了专门擅长算术和数学并与人类行为对齐的助手模型。我们发布了该系列的两个版本：Math-Qwen-14B-Chat 和 Math-Qwen-7B-Chat，分别有 140 亿和 70 亿参数。</p>
<h3 id="5-1-training">5.1 Training</h3>
<p>我们在增强的数学指令数据集上对数学推理进行数学 SFT，从而获得聊天模型 Math-Qwen-Chat。由于数学 SFT 数据的平均长度较短，我们使用 1024 的序列长度以实现更快的训练。数学 SFT 数据集中的大多数用户输入是考试题目，模型很容易预测输入格式，且预测可能是随机的输入条件和数字对模型没有意义。因此，我们掩码系统和用户的输入以避免在其上计算损失，并发现掩码它们可以加速初步实验中的收敛。对于优化，我们使用 AdamW 优化器，超参数与 SFT 相同，但峰值学习率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>，训练步数为 50000。</p>
<h3 id="5-2-evaluation">5.2 Evaluation</h3>
<p><strong>表 12: 数学推理模型结果</strong></p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>GSM8K</th>
<th>MATH</th>
<th>Math401</th>
<th>Math23K</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>-</td>
<td>92.0</td>
<td>42.5</td>
<td>83.5</td>
<td>74.0</td>
</tr>
<tr>
<td>GPT-3.5</td>
<td>-</td>
<td>80.8</td>
<td>34.1</td>
<td>75.1</td>
<td>60.0</td>
</tr>
<tr>
<td>Minerva</td>
<td>8B / 62B / 540B</td>
<td>16.2 / 52.4 / 58.8</td>
<td>14.1 / 27.6 / 33.6</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>LLaMA-1 RFT</td>
<td>7B / 13B</td>
<td>46.5 / 52.1</td>
<td>5.2 / 5.1</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>WizardMath</td>
<td>7B / 13B / 70B</td>
<td>54.9 / 63.9 / 81.6</td>
<td>10.7 / 14.0 / 22.7</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>GAIRMath-Abel</td>
<td>7B / 13B / 70B</td>
<td>59.7 / 66.4 / 83.6</td>
<td>13.0 / 17.3 / 28.3</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Qwen-Chat</td>
<td>7B / 14B</td>
<td>50.3 / 60.1</td>
<td>6.8 / 18.4</td>
<td>57.4 / 70.1</td>
<td>51.2 / 67.0</td>
</tr>
<tr>
<td>Math-Qwen-Chat</td>
<td>7B / 14B</td>
<td>62.5 / 69.8</td>
<td>17.2 / 24.2</td>
<td>80.8 / 85.0</td>
<td>75.4 / 78.4</td>
</tr>
</tbody></table>
<p>我们在 GSM8K、MATH、Math401 和 Math23K 的测试集上评估模型。Math-Qwen-Chat 模型与相似规模的开源模型和 Qwen-Chat 模型相比展现出更好的数学推理和算术能力。与专有模型相比，Math-Qwen-7B-Chat 在 MATH 上超越了 Minerva-8B。Math-Qwen-14B-Chat 正在追赶 Minerva-62B 和 GPT-3.5 在 GSM8K 和 MATH 上的表现，并在算术能力和中文数学问题上表现更佳。</p>
<blockquote>
<p>译者注：Math-Qwen 的训练策略有一个关键细节：掩码用户输入的损失计算。这意味着模型只学习生成答案，而不学习重复问题。这在数学任务中是合理的——用户输入(题目)是条件而非目标。但这种方法的泛化风险在于：如果模型从未在训练中看到&quot;重复/理解问题&quot;的行为，它可能在需要复述或澄清问题的场景下表现不佳。此外，50K 步的 SFT 训练(约 13B token)对于数学专用模型来说是相对充分的。Math-Qwen-14B-Chat 在 GSM8K(69.8%) 上接近 GPT-3.5(80.8%)，但在 MATH(24.2%) 上差距仍然明显——这反映了竞赛级数学问题对模型推理能力的极高要求，即使是专用训练也难以完全弥补。</p>
</blockquote>
<hr>
<h2 id="6-related-work">6 Related Work</h2>
<h3 id="6-1-large-language-models">6.1 Large Language Models</h3>
<p>LLM 的兴奋始于 Transformer 架构的引入，随后被研究者应用于大规模数据的预训练。这些努力在迁移学习方面取得了重大成功，模型规模从 1 亿增长到超过 100 亿参数。</p>
<p>2020 年，GPT-3 的发布——一个比 T5 大 10 倍的大规模语言模型——展示了通过提示工程和上下文学习进行少样本和零样本学习的惊人潜力，以及后来的思维链提示。这一成功导致了许多探索进一步扩展这些模型可能性的研究。因此，社区开始将这些大语言模型视为下游模型的基础。</p>
<p>ChatGPT 的诞生和随后 GPT-4 的发布标志着人工智能领域的两个历史性时刻，证明了大语言模型可以作为能够与人类进行有效交流的 AI 助手。这些事件激发了研究者和开发者构建与人类价值观对齐的语言模型、甚至可能实现 AGI 的兴趣。</p>
<p>该领域的一个显著发展是开源 LLM 的出现，特别是 LLaMA 和 LLaMA-2，它们被公认为有史以来最强大的开源语言模型。这导致了开源社区活动的激增，一系列大语言模型被协作开发以在此进展基础上构建。</p>
<h3 id="6-2-alignment">6.2 Alignment</h3>
<p>社区对 LLM 对齐的惊人效果印象深刻。此前，未经对齐的 LLM 常常面临重复生成、幻觉和偏离人类偏好等问题。自 2021 年以来，研究者一直致力于开发增强 LLM 下游任务性能的方法。此外，研究者还积极探索使 LLM 与人类指令对齐的方法。</p>
<p>对齐研究中的一个主要挑战是数据收集的困难。虽然 OpenAI 利用其平台收集人类提示或指令，但其他人收集此类数据是不可行的。然而，这一领域取得了一些进展，如 self-instruct 方法的提出。这一创新工作为对齐研究中的数据收集问题提供了潜在的解决方案。结果，开源聊天数据激增，包括 Alpaca、MOSS、Dolly、Evol-Instruct 等。类似地，开源聊天模型也大量涌现，如 Alpaca、Vicuna、Guanaco、MOSS、WizardLM 等。</p>
<p>为训练有效的聊天模型，可用的解决方案主要基于 SFT 和 RLHF。虽然 SFT 类似于预训练，但它专注于使用上述数据进行指令遵循。然而，对于许多开发者来说，有限的内存容量是 SFT 进一步研究的主要障碍。结果，参数高效微调方法(如 LoRA 和 Q-LoRA)在社区中获得了流行。在 RLHF 方面，近期方法如 PPO 已被采用，但也有旨在解决优化复杂性的替代技术，如 RRHF、DPO 和 PRO。尽管关于 RLHF 有效性的争论仍在持续，但还需要更多证据来理解它如何增强 LLM 的智能以及可能存在哪些潜在缺陷。</p>
<h3 id="6-3-tool-use-and-agents">6.3 Tool Use and Agents</h3>
<p>LLM 的规划功能允许通过上下文学习调用工具(如 API 或 Agent 能力)。ReAct 引入了一种生成格式，使模型能够生成关于使用哪种工具的思考、接受 API 观察的输入并生成回复。GPT-3.5 和 GPT-4 在少量样本提示下展示了持续且令人印象深刻的性能。</p>
<p>除工具使用外，LLM 可以利用外部记忆源(如知识库或搜索引擎)生成更准确和信息丰富的答案。这导致了 LangChain 等框架的流行。LLM 工具使用研究还激发了构建具有 LLM 能力的 Agent 的兴趣，如能调用不同 AI 模型的 Agent、具身终身学习或多模态 Agent，以及相互交互甚至构建微型社会的多个 Agent。</p>
<h3 id="6-4-llm-for-coding">6.4 LLM for Coding</h3>
<p>先前研究已证明 LLM 在代码理解和生成方面具有非凡能力，特别是那些拥有大量参数的模型。此外，多个 LLM 已在代码相关数据上进行了预训练、继续预训练或微调，与通用 LLM 相比显著提升了性能。这些模型包括 Codex、AlphaCode、SantaCoder、Starcoder-Base、InCoder、CodeT5、CodeGeeX 和 Code-LLaMA。</p>
<p>除这些模型外，近期研究还专注于开发代码专用的对齐技术，如 Code-LLaMA-Instruct 和 StarCoder。这些模型可以协助开发者完成各种代码相关任务，包括代码生成、代码补全、代码翻译、bug 修复、代码优化和代码问答。</p>
<h3 id="6-5-llm-for-mathematics">6.5 LLM for Mathematics</h3>
<p>具有一定模型规模的 LLM 已被发现具备执行数学推理的能力。为鼓励 LLM 在数学相关任务上取得更好性能，研究者采用了思维链提示和 scratchpad 等技术，这些方法显示出有希望的结果。此外，self-consistency 和 least-to-most 提示进一步提高了这些模型在这些任务上的性能。</p>
<p>然而，提示工程是一个耗时且需要大量试错的过程，LLM 仍难以在解决数学问题时持续表现良好或取得满意结果。此外，简单地扩展数据和模型规模并不是提高模型数学推理能力的有效方式。相反，在数学相关语料上预训练已被证明可以持续增强这些能力。此外，在数学相关指令遵循数据集上微调也同样有效，且比数学专用预训练更具成本效益。尽管存在准确性方面的局限，LLM 在协助用户解决实际数学问题方面仍有巨大潜力。这一领域有充足的发展空间。</p>
<hr>
<h2 id="7-conclusion">7 Conclusion</h2>
<p>在本报告中，我们介绍了 Qwen 系列大语言模型，展示了自然语言处理的最新进展。Qwen 系列包含 14B、7B 和 1.8B 参数的模型，这些模型在包含数万亿 token 的大规模数据上进行了预训练，并使用 SFT 和 RLHF 等前沿技术进行了微调。此外，Qwen 系列还包括代码和数学专用模型，如 Code-Qwen、Code-Qwen-Chat 和 Math-Qwen-Chat，它们在领域特定数据上训练以在各自领域表现出色。</p>
<p>我们的结果表明，Qwen 系列在全面基准评测和人工评估中与现有开源模型具有竞争力，甚至在某些方面与一些专有模型性能相当。</p>
<p>我们相信 Qwen 的开放访问将促进社区内的协作和创新，使研究者和开发者能够基于我们的工作构建并推动语言模型的边界。通过向公众提供这些模型，我们希望激发新的研究和应用，进一步推动该领域的发展并增进我们对现实环境中引入的变量和技术的理解。</p>
<p>总之，Qwen 系列代表了我们大语言模型开发的一个重要里程碑，我们期待看到它如何在未来几年用于推动进步和创新。</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-gdxlxj">A. 更多训练细节</h3>
<h4 id="a-1-qwen-chat-dsjgs">A.1 Qwen-Chat 的数据格式</h4>
<p>与基于自回归下一个 token 预测的传统预训练不同，尽管使用类似的训练任务，SFT 和 RLHF 需要专门设计的数据格式来构建对话 AI 助手模型。常见格式包括 &quot;human-assistant&quot; 和 ChatML 格式。</p>
<p>据我们所知，human-assistant 格式的最早示例之一来自 Anthropic，它在用户输入前添加特殊短语 &quot;\\n\\nhuman: &quot;，在助手回复前添加 &quot;\\n\\nassistant: &quot;。基础语言模型很容易转移到对话 AI 的模式。然而，由于特定短语是常见词汇，模型可能难以在其他上下文中区分这些词汇。</p>
<p>因此，我们转向 OpenAI 提出的 ChatML 格式。这种格式允许使用特殊 token，即 <code>&lt;|im_start|&gt;</code> 和 <code>&lt;|im_end|&gt;</code>，这些 token 不会出现在预训练中，从而解决了上述问题。我们在下面展示了一个格式示例。</p>
<p><img src="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy/images/chatml_format.pdf" alt="ChatML 格式示例"></p>
<blockquote>
<p>图 5: ChatML 格式示例。<code>&lt;|im_start|&gt;</code> 和 <code>&lt;|im_end|&gt;</code> 特殊 token 用于标记系统、用户和助手角色的边界，避免与自然语言文本混淆。</p>
</blockquote>
<h3 id="b-pcxq">B. 评测详情</h3>
<h4 id="b-1-zdpc">B.1 自动评测</h4>
<p>为提供 Qwen 系列模型性能的全貌，我们在本节中展示模型在 OpenCompass 提出的综合基准评测中的详细性能。我们根据官方提供的类别在多个表格中报告结果，包括考试、语言、知识、理解和推理。</p>
<p><strong>考试类数据集</strong>包括：</p>
<ul>
<li>MMLU：大规模多任务语言理解，5-shot</li>
<li>C-Eval：涵盖 52 个学科的中文评测集，5-shot</li>
<li>CMMLU：中文语言理解能力评测，5-shot</li>
<li>AGIEval：包含高考、法学院入学考试、数学竞赛等的人类中心化考试，零样本</li>
<li>Gaokao-Bench：中国高考题目基准，零样本</li>
<li>ARC：小学水平多选科学题，分简单集(ARC-e)和挑战集(ARC-c)，零样本</li>
</ul>
<p><strong>知识和理解类数据集</strong>包括：</p>
<ul>
<li>BoolQ：基于 Wikipedia 段落的问答数据集，模型需回答是/否，零样本</li>
<li>CommonsenseQA：多选常识问答数据集，8-shot</li>
<li>NaturalQuestions：用户提问、专家验证答案的 QA 数据集，零样本</li>
<li>LAMBADA：通过词预测评估语言理解的数据集，零样本</li>
</ul>
<p><strong>推理类数据集</strong>包括：</p>
<ul>
<li>HellaSwag：对人类简单但对先前语言模型困难的常识自然语言推理(NLI)数据集，零样本</li>
<li>PIQA：评估物理知识的 NLI 数据集，零样本</li>
<li>SIQA：评估社会常识智能的 NLI 数据集，零样本</li>
<li>OCNLI：聚焦中文的 NLI 数据集，零样本</li>
</ul>
<h3 id="c-rgpcalfx">C. 人工评测案例分析</h3>
<p>在本节中，我们展示人工分析的案例。在我们的自建评测数据集中，指令要么是手动编写的数据，要么是从 CLiB、C-Eval、FacTool、LeetCode 等公开数据集手动修订的。</p>
<p>对于每个案例，我们展示所有模型的回复和 Elo 评分以供对比。由于我们人工评估中的数据为中文，我们还提供了英文翻译。</p>
<h3 id="d-dmjsqfx">D. 代码解释器分析</h3>
<p><img src="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy/images/fig_code_interpreter_showcase.pdf" alt="Code-LLaMA 与 Qwen-Chat 处理表格数据的对比案例"></p>
<blockquote>
<p>图 6: 展示 Qwen-Chat 通过 ReAct 提示使用代码解释器能力的案例。Qwen 创建了一个两步计划：首先调查 CSV 文件中的列，然后绘制图表(左上)。Code-LLaMA 则试图基于不存在的列绘制图表(底部)。只有在查询中提供列名时，Code-LLaMA 才能可靠地执行任务(右上)。</p>
</blockquote>
<p>这里我们提供了一个 Code-LLaMA 与 Qwen-Chat 的对比案例。此案例展示了 Qwen-Chat 在处理表格数据和执行复杂任务方面的优势。Qwen 会先检查 CSV 文件的结构，再基于实际存在的列生成绘图代码; 而 Code-LLaMA 倾向于仅根据 CSV 文件名臆测列名，导致幻觉错误。</p>
<hr>
<h2 id="fl-e-syb">附录 E: 术语表</h2>
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
<td>LLM</td>
<td>大语言模型</td>
<td>Abstract</td>
<td>Large Language Model，基于 Transformer 的大规模语言模型</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>Abstract</td>
<td>Supervised Fine-Tuning，在标注数据上微调预训练模型</td>
</tr>
<tr>
<td>RLHF</td>
<td>人类反馈强化学习</td>
<td>Abstract</td>
<td>Reinforcement Learning from Human Feedback，通过人类偏好训练奖励模型并优化策略</td>
</tr>
<tr>
<td>BPE</td>
<td>字节对编码</td>
<td>Section 2.2</td>
<td>Byte Pair Encoding，一种子词分词算法</td>
</tr>
<tr>
<td>RoPE</td>
<td>旋转位置编码</td>
<td>Section 2.3</td>
<td>Rotary Positional Embedding，通过旋转矩阵编码位置信息</td>
</tr>
<tr>
<td>RMSNorm</td>
<td>均方根层归一化</td>
<td>Section 2.3</td>
<td>Root Mean Square Layer Normalization，一种高效的归一化方法</td>
</tr>
<tr>
<td>SwiGLU</td>
<td>Swish 门控线性单元</td>
<td>Section 2.3</td>
<td>Swish + Gated Linear Unit 组合的激活函数</td>
</tr>
<tr>
<td>Flash Attention</td>
<td>闪电注意力</td>
<td>Section 2.4</td>
<td>一种通过 IO 感知的注意力计算优化算法</td>
</tr>
<tr>
<td>NTK-aware interpolation</td>
<td>NTK 感知插值</td>
<td>Section 2.5</td>
<td>调整 RoPE 基数以扩展上下文长度的无训练方法</td>
</tr>
<tr>
<td>LogN-Scaling</td>
<td>对数 N 缩放</td>
<td>Section 2.5</td>
<td>根据上下文长度重新缩放注意力点积的技术</td>
</tr>
<tr>
<td>PPO</td>
<td>近端策略优化</td>
<td>Section 3.2</td>
<td>Proximal Policy Optimization，一种策略梯度强化学习算法</td>
</tr>
<tr>
<td>PMP</td>
<td>偏好模型预训练</td>
<td>Section 3.2</td>
<td>Preference Model Pretraining，奖励模型的预训练阶段</td>
</tr>
<tr>
<td>ReAct</td>
<td>推理+行动</td>
<td>Section 3.4</td>
<td>Reasoning + Acting，一种让模型生成思考并调用工具的提示格式</td>
</tr>
<tr>
<td>pass@1</td>
<td>首次通过率</td>
<td>Section 4.3</td>
<td>代码生成评测指标，衡量模型一次生成即通过测试的比例</td>
</tr>
<tr>
<td>alignment tax</td>
<td>对齐税</td>
<td>Section 3.2</td>
<td>对齐训练后模型在通用能力上的性能损失</td>
</tr>
</tbody></table>
<h2 id="fl-f-gjsysjhz">附录 F: 关键实验数据汇总</h2>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Qwen-14B</th>
<th>Qwen-7B</th>
<th>Qwen-1.8B</th>
<th>同规模最优基线</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU 5-shot</td>
<td>66.3%</td>
<td>58.2%</td>
<td>44.6%</td>
<td>LLaMA-2-13B 55.0%</td>
</tr>
<tr>
<td>C-Eval 5-shot</td>
<td>72.1%</td>
<td>63.5%</td>
<td>54.7%</td>
<td>Baichuan2-13B 59.0%</td>
</tr>
<tr>
<td>GSM8K 8-shot</td>
<td>61.3%</td>
<td>51.7%</td>
<td>21.2%</td>
<td>LLaMA-65B 54.4%</td>
</tr>
<tr>
<td>MATH 4-shot</td>
<td>24.8%</td>
<td>11.6%</td>
<td>5.6%</td>
<td>StableBeluga2-70B 14.6%</td>
</tr>
<tr>
<td>HumanEval 0-shot</td>
<td>32.3%</td>
<td>29.9%</td>
<td>17.1%</td>
<td>LLaMA-2-70B 29.9%</td>
</tr>
<tr>
<td>MBPP 3-shot</td>
<td>40.8%</td>
<td>31.6%</td>
<td>14.8%</td>
<td>LLaMA-65B 37.7%</td>
</tr>
<tr>
<td>BBH 3-shot</td>
<td>53.4%</td>
<td>45.0%</td>
<td>28.2%</td>
<td>LLaMA-65B 58.4%</td>
</tr>
</tbody></table>
<h2 id="fl-g-mxpxdw">附录 G: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: LLaMA 架构(Transformer + RoPE + SwiGLU + RMSNorm)</li>
<li><strong>核心创新</strong>:<ul>
<li>152K 多语言词表，显著提升中文和代码压缩效率</li>
<li>在预训练阶段混入高质量指令数据，增强零样本能力</li>
<li>QKV 层保留偏置以增强长上下文外推能力</li>
<li>分层 window attention + dynamic NTK + LogN-Scaling 的长上下文扩展方案</li>
<li>ChatML 格式的对话数据格式设计</li>
<li>预训练梯度缓解 RLHF 对齐税</li>
<li>同步发布代码(Code-Qwen)和数学(Math-Qwen)专用模型</li>
</ul>
</li>
<li><strong>被后续工作引用</strong>:<ul>
<li>Qwen1.5/1.6(2024 年初)：架构升级，引入 GQA 和更大规模</li>
<li>Qwen2(2024 年 6 月，arXiv:2407.10671)：全面架构升级，引入 SwiGLU、RMSNorm、RoPE 的成熟设计</li>
<li>Qwen2-VL/Audio 等多模态模型均基于 Qwen 基础模型构建</li>
</ul>
</li>
<li><strong>技术定位</strong>: 阿里通义千问大模型家族的开山之作，奠定了后续所有 Qwen 系列模型的技术基座</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"abstract","text":"Abstract"},{"level":2,"id":"1-introduction","text":"1 Introduction"},{"level":2,"id":"2-pretraining","text":"2 Pretraining"},{"level":3,"id":"2-1-data","text":"2.1 Data"},{"level":3,"id":"2-2-tokenization","text":"2.2 Tokenization"},{"level":3,"id":"2-3-architecture","text":"2.3 Architecture"},{"level":3,"id":"2-4-training","text":"2.4 Training"},{"level":3,"id":"2-5-context-length-extension","text":"2.5 Context Length Extension"},{"level":3,"id":"2-6-experimental-results","text":"2.6 Experimental Results"},{"level":2,"id":"3-alignment","text":"3 Alignment"},{"level":3,"id":"3-1-supervised-finetuning","text":"3.1 Supervised Finetuning"},{"level":4,"id":"data","text":"Data"},{"level":4,"id":"training","text":"Training"},{"level":3,"id":"3-2-reinforcement-learning-from-human-feedback","text":"3.2 Reinforcement Learning from Human Feedback"},{"level":4,"id":"reward-model","text":"Reward Model"},{"level":4,"id":"reinforcement-learning","text":"Reinforcement Learning"},{"level":3,"id":"3-3-automatic-and-human-evaluation-of-aligned-models","text":"3.3 Automatic and Human Evaluation of Aligned Models"},{"level":3,"id":"3-4-tool-use-code-interpreter-and-agent","text":"3.4 Tool Use, Code Interpreter, and Agent"},{"level":2,"id":"4-code-qwen-specialized-model-for-coding","text":"4 Code-Qwen: Specialized Model for Coding"},{"level":3,"id":"4-1-code-pretraining","text":"4.1 Code Pretraining"},{"level":3,"id":"4-2-code-supervised-fine-tuning","text":"4.2 Code Supervised Fine-Tuning"},{"level":3,"id":"4-3-evaluation","text":"4.3 Evaluation"},{"level":2,"id":"5-math-qwen-specialized-model-for-mathematics-reasoning","text":"5 Math-Qwen: Specialized Model for Mathematics Reasoning"},{"level":3,"id":"5-1-training","text":"5.1 Training"},{"level":3,"id":"5-2-evaluation","text":"5.2 Evaluation"},{"level":2,"id":"6-related-work","text":"6 Related Work"},{"level":3,"id":"6-1-large-language-models","text":"6.1 Large Language Models"},{"level":3,"id":"6-2-alignment","text":"6.2 Alignment"},{"level":3,"id":"6-3-tool-use-and-agents","text":"6.3 Tool Use and Agents"},{"level":3,"id":"6-4-llm-for-coding","text":"6.4 LLM for Coding"},{"level":3,"id":"6-5-llm-for-mathematics","text":"6.5 LLM for Mathematics"},{"level":2,"id":"7-conclusion","text":"7 Conclusion"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-gdxlxj","text":"A. 更多训练细节"},{"level":4,"id":"a-1-qwen-chat-dsjgs","text":"A.1 Qwen-Chat 的数据格式"},{"level":3,"id":"b-pcxq","text":"B. 评测详情"},{"level":4,"id":"b-1-zdpc","text":"B.1 自动评测"},{"level":3,"id":"c-rgpcalfx","text":"C. 人工评测案例分析"},{"level":3,"id":"d-dmjsqfx","text":"D. 代码解释器分析"},{"level":2,"id":"fl-e-syb","text":"附录 E: 术语表"},{"level":2,"id":"fl-f-gjsysjhz","text":"附录 F: 关键实验数据汇总"},{"level":2,"id":"fl-g-mxpxdw","text":"附录 G: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen 技术报告精译</h1>
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
