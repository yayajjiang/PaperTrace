"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>LLaMA: Open and Efficient Foundation Language Models 精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: LLaMA: Open and Efficient Foundation Language Models
原文链接: <a href="https://arxiv.org/abs/2302.13971">https://arxiv.org/abs/2302.13971</a>
发布日期: 2023 年 2 月
发布机构: Meta AI</p>
</blockquote>
<hr>
<h2 id="1-introduction">1. Introduction</h2>
<p>在大量文本语料上训练的大型语言模型 (Large Language Models, LLMs) 已经展示了从文本指令或少量示例中执行新任务的能力. 这种小样本 (few-shot) 特性首次出现在将模型扩展到足够大小时, 催生了一系列进一步扩展模型规模的工作. 这些努力基于一个假设: 更多的参数将带来更好的性能.</p>
<p>然而, 
\\citet{hoffmann2022chinchilla} 的近期研究表明, 对于给定的计算预算, 最佳性能并非由最大的模型实现, 而是由在更多数据上训练的更小模型实现.</p>
<p>\\citet{hoffmann2022chinchilla} 的 scaling laws 的目标是确定如何在特定的<strong>训练</strong>计算预算下最优地扩展数据集和模型规模. 然而, 这一目标忽略了<strong>推理</strong>预算, 而在大规模部署语言模型时, 推理预算变得至关重要. 在这种情况下, 给定一个目标性能水平, 首选的模型不是训练最快的, 而是推理最快的. 尽管训练一个大模型达到某个性能水平可能更便宜, 但一个在更长时间上训练的更小模型最终在推理阶段会更便宜. 例如, 尽管 \\citet{hoffmann2022chinchilla} 建议在 200B token 上训练一个 10B 模型, 但我们发现 7B 模型的性能即使在 1T token 之后仍在持续改进.</p>
<p>本工作的重点是训练一系列在各种推理预算下实现最佳性能的语言模型, 方法是在比通常使用的更多的 token 上进行训练. 最终得到的模型称为 <strong>LLaMA</strong>, 参数量从 7B 到 65B 不等, 性能可与现有最佳 LLM 竞争. 例如, LLaMA-13B 在大多数 benchmark 上优于 GPT-3, 尽管其规模小了 10 倍. 我们相信这个模型将有助于民主化 LLM 的访问和研究, 因为它可以在单个 GPU 上运行. 在更大规模的一端, 我们的 65B 参数模型也能与 Chinchilla 或 PaLM-540B 等最佳大型语言模型竞争.</p>
<p>与 Chinchilla、PaLM 或 GPT-3 不同, 我们只使用公开可用的数据, 使得我们的工作与开源兼容, 而大多数现有模型依赖的数据要么不公开, 要么未记录 (例如 &quot;Books -- 2TB&quot; 或 &quot;Social media conversations&quot;). 也存在一些例外,  notably OPT、GPT-NeoX、BLOOM 和 GLM, 但没有一个能与 PaLM-62B 或 Chinchilla 竞争.</p>
<p>在本文的其余部分, 我们概述了对 transformer 架构所做的修改以及我们的训练方法. 然后我们报告模型在标准 benchmark 上的性能并与其他 LLM 进行比较. 最后, 我们使用负责任 AI 社区的最新 benchmark 揭示模型中编码的一些偏见和毒性.</p>
<blockquote>
<p>这里需要停下来想一下. \\citet{hoffmann2022chinchilla} 的核心贡献是推翻了 &quot;越大越好&quot; 的直觉: 在固定训练预算下, 模型大小和数据量之间存在一个最优配比. LLaMA 团队进一步将这一洞察推进了一步——不仅考虑训练成本, 还考虑推理成本. 对于一个要部署服务数百万用户的模型, 推理成本 (每 token 的 GPU 时间) 在模型的生命周期内远超训练成本. 因此, 用更多的数据训练一个更小的模型, 即使训练时间更长, 也可能在长期总成本上更优. 这是工程视角与纯研究视角的关键差异.</p>
</blockquote>
<hr>
<h2 id="2-approach">2. Approach</h2>
<p>我们的训练方法与先前工作中描述的方法类似, 并受到 Chinchilla scaling laws 的启发. 我们使用标准优化器在大量文本数据上训练大型 transformer.</p>
<h3 id="2-1-pre-training-data">2.1 Pre-training Data</h3>
<p>我们的训练数据集是多个来源的混合, 涵盖多样化的领域, 如 Table 1 所示. 在大多数情况下, 我们重用了用于训练其他 LLM 的数据源, 限制条件仅为使用公开可用且与开源兼容的数据. 这导致训练集中包含以下数据及其占比:</p>
<p><strong>English CommonCrawl [67%].</strong></p>
<p>我们用 CCNet 流水线预处理五个 2017 至 2020 年的 CommonCrawl dump. 该过程在行的级别去重, 使用 fastText 线性分类器进行语言识别以移除非英语页面, 并用 n-gram 语言模型过滤低质量内容. 此外, 我们训练了一个线性模型来分类 Wikipedia 引用页面与随机采样页面, 丢弃未被分类为引用的页面.</p>
<blockquote>
<p>CCNet 流水线是 Meta 早期开发的网页数据清洗工具, 其核心洞察是: 不是所有网页内容都值得训练. 通过语言识别 (fastText 足够快, 可处理 TB 级数据) 和质量过滤 (n-gram 语言模型给每页打分), 可以将数 TB 的原始 CommonCrawl 压缩到高质量子集. Wikipedia 引用分类器是一个聪明的数据质量代理指标——被 Wikipedia 引用的页面通常比随机页面更可靠. 这种&quot;以质换量&quot;的策略是 LLaMA 能在公开数据上达到竞争力的关键.</p>
</blockquote>
<p><strong>C4 [15%].</strong></p>
<p>在探索性实验中, 我们观察到使用多样化的预处理后 CommonCrawl 数据集能提升性能. 因此我们纳入了公开可用的 C4 数据集. C4 的预处理也包含去重和语言识别步骤; 与 CCNet 的主要区别在于质量过滤, 后者主要依赖启发式规则, 如标点符号的存在或网页中的单词和句子数量.</p>
<p><strong>Github [4.5%].</strong></p>
<p>我们使用 Google BigQuery 上公开可用的 GitHub 数据集. 仅保留以 Apache、BSD 和 MIT 许可证分发的项目. 此外, 我们用基于行长度或字母数字字符比例的启发式规则过滤低质量文件, 并用正则表达式去除样板内容 (如文件头). 最后, 我们在文件级别用精确匹配去重.</p>
<p><strong>Wikipedia [4.5%].</strong></p>
<p>我们添加了 2022 年 6 月至 8 月的 Wikipedia dump, 涵盖 20 种使用拉丁或西里尔字母的语言: bg, ca, cs, da, de, en, es, fr, hr, hu, it, nl, pl, pt, ro, ru, sl, sr, sv, uk. 我们处理数据以移除超链接、评论和其他格式样板.</p>
<p><strong>Gutenberg and Books3 [4.5%].</strong></p>
<p>我们在训练数据集中纳入两个图书语料库: 公共领域的 Gutenberg Project 和 ThePile 的 Books3 部分. 我们在图书级别进行去重, 移除内容重叠超过 90% 的图书.</p>
<p><strong>ArXiv [2.5%].</strong></p>
<p>我们处理 ArXiv LaTeX 文件以向数据集添加科学数据. 遵循 \\citet{lewkowycz2022solving}, 我们移除第一个章节之前的所有内容以及参考文献. 我们还移除了 .tex 文件中的注释, 并内联展开了用户编写的定义和宏, 以增加论文之间的一致性.</p>
<p><strong>Stack Exchange [2%].</strong></p>
<p>我们纳入 Stack Exchange 的 dump, 这是一个涵盖从计算机科学到化学等多样化领域的高质量问答网站. 我们保留了 28 个最大网站的数据, 从文本中移除 HTML 标签, 并按得分 (从高到低) 排序答案.</p>
<p><strong>Tokenizer.</strong></p>
<p>我们使用字节对编码 (Byte-Pair Encoding, BPE) 算法对数据进行分词, 使用 SentencePiece 的实现. 值得注意的是, 我们将所有数字拆分为单个数字, 并回退到字节以分解未知的 UTF-8 字符.</p>
<p>总体而言, 我们的整个训练数据集在分词后包含约 1.4T token. 对于我们的大部分训练数据, 每个 token 在训练中仅使用一次, 例外是 Wikipedia 和 Books 领域, 我们在其上执行约两个 epoch.</p>
<blockquote>
<p>将所有数字拆分为单个数字是一个重要的分词决策. 标准 BPE 会将 &quot;12345&quot; 作为一个整体 token 或按频率拆分, 这导致模型在数字推理上的泛化能力差. 拆分为单个数字后, &quot;12345&quot; 变成 5 个 token, 模型可以像处理序列一样处理数字, 极大改善了算术能力. 这个设计在后续的 Llama 2/3 中一直被继承. 另一个值得注意的细节是 Books 的去重阈值设为 90%——这意味着允许同一本书的不同版本或译本共存, 但几乎完全相同的副本会被移除, 是一个务实的平衡.</p>
</blockquote>
<p>| Dataset | Sampling pro.</p>
<p>| Epochs | Disk size |
|:--------|:--------------:|:------:|:---------:|
| CommonCrawl | 67.0% | 1.10 | 3.3 TB |
| C4 | 15.0% | 1.06 | 783 GB |
| Github | 4.5% | 0.64 | 328 GB |
| Wikipedia | 4.5% | 2.45 | 83 GB |
| Books | 4.5% | 2.23 | 85 GB |
| ArXiv | 2.5% | 1.06 | 92 GB |
| StackExchange | 2.0% | 1.03 | 78 GB |</p>
<blockquote>
<p>Table 1: Pre-training data. 预训练使用的数据混合, 对每个子集列出采样比例、在 1.4T token 训练时的 epoch 数以及磁盘大小. 1T token 的预训练运行使用相同的采样比例.</p>
</blockquote>
<h3 id="2-2-architecture">2.2 Architecture</h3>
<p>遵循大型语言模型的近期工作, 我们的网络基于 transformer 架构. 我们利用了随后提出的各种改进, 这些改进在不同模型 (如 PaLM) 中被使用. 以下是与原始架构的主要差异及其灵感来源 (括号中标注):</p>
<p><strong>Pre-normalization [GPT3].</strong></p>
<p>为提高训练稳定性, 我们对每个 transformer 子层的输入进行归一化, 而非对输出归一化. 我们使用 \\citet{zhang2019root} 引入的 RMSNorm 归一化函数.</p>
<p><strong>SwiGLU activation function [PaLM].</strong></p>
<p>我们将 ReLU 非线性替换为 \\citet{shazeer2020glu} 引入的 SwiGLU 激活函数以提升性能. 我们使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>2</mn><mn>3</mn></mfrac><mo>×</mo><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{2}{3} \\times 4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span> 的维度, 而非 PaLM 中的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span>.</p>
<p><strong>Rotary Embeddings [GPTNeo].</strong></p>
<p>我们移除绝对位置编码, 而是在网络的每一层添加 \\citet{su2021roformer} 引入的旋转位置编码 (Rotary Positional Embeddings, RoPE).</p>
<p>不同模型的超参数细节见 Table 2.</p>
<table>
<thead>
<tr>
<th align="center">params</th>
<th align="center">dimension</th>
<th align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> heads</th>
<th align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> layers</th>
<th align="center">learning rate</th>
<th align="center">batch size</th>
<th align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> tokens</th>
</tr>
</thead>
<tbody><tr>
<td align="center">6.7B</td>
<td align="center">4096</td>
<td align="center">32</td>
<td align="center">32</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="center">4M</td>
<td align="center">1.0T</td>
</tr>
<tr>
<td align="center">13.0B</td>
<td align="center">5120</td>
<td align="center">40</td>
<td align="center">40</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="center">4M</td>
<td align="center">1.0T</td>
</tr>
<tr>
<td align="center">32.5B</td>
<td align="center">6656</td>
<td align="center">52</td>
<td align="center">60</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="center">4M</td>
<td align="center">1.4T</td>
</tr>
<tr>
<td align="center">65.2B</td>
<td align="center">8192</td>
<td align="center">64</td>
<td align="center">80</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="center">4M</td>
<td align="center">1.4T</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 2: Model sizes, architectures, and optimization hyper-parameters. 模型尺寸、架构和优化超参数.</p>
</blockquote>
<blockquote>
<p>这三个架构改进构成了 LLaMA 的技术核心, 且每一项都不是原创, 而是对已有最佳实践的精心选择:</p>
<ol>
<li><p><strong>Pre-normalization (RMSNorm)</strong>: 原始 Transformer 使用 Post-LN, 即在子层输出后做 LayerNorm. 但 Post-LN 在深层网络中会导致梯度爆炸/消失问题, 尤其是在大 batch size (4M tokens) 下. Pre-LN 将归一化移到子层输入, 显著改善了训练稳定性. RMSNorm 是 LayerNorm 的简化变体, 去除了均值中心化步骤, 计算更高效, 且在大模型训练中表现相当.</p>
</li>
<li><p><strong>SwiGLU</strong>: 这是 GLU 变体的一种, 比 ReLU 更平滑的激活函数. 关键细节是维度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span> 缩减到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>2</mn><mn>3</mn></mfrac><mo>×</mo><mn>4</mn><mi>d</mi><mo>≈</mo><mn>2.67</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{2}{3} \\times 4d \\approx 2.67d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">2.67</span><span class="mord mathnormal">d</span></span></span></span>——这是为了维持与标准 FFN (ReLU, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span>) 大致相当的参数量和计算量, 因为 SwiGLU 内部有两个线性投影 (门控和值), 如果保持 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span> 会导致参数翻倍.</p>
</li>
<li><p><strong>RoPE</strong>: 相比绝对位置编码 (每个位置一个可学习的向量) 或相对位置编码 (每个相对距离一个可学习的 bias), RoPE 通过旋转矩阵将位置信息编码到 attention 的 Q/K 向量中. 它的优雅之处在于: (a) 不引入额外可学习参数; (b) 天然支持长度外推 (通过调整旋转角度); (c) 在自回归生成中保持相对位置的一致性. 这个设计在后续的 Llama 2/3/4 中一直沿用, 并演化为 scaled RoPE 等变体.</p>
</li>
</ol>
</blockquote>
<h3 id="2-3-optimizer">2.3 Optimizer</h3>
<p>我们的模型使用 AdamW 优化器训练, 超参数为: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn><mo separator="true">,</mo><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_1 = 0.9, \\beta_2 = 0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">0.9</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>. 我们使用余弦学习率调度, 使得最终学习率等于最大学习率的 10%. 我们使用权重衰减 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.1</mn></mrow><annotation encoding="application/x-tex">0.1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.1</span></span></span></span> 和梯度裁剪 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn></mrow><annotation encoding="application/x-tex">1.0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.0</span></span></span></span>. 我们使用 2,000 步 warmup, 并根据模型大小调整学习率和 batch size (详见 Table 2).</p>
<h3 id="2-4-efficient-implementation">2.4 Efficient Implementation</h3>
<p>我们进行了若干优化以提高模型的训练速度.</p>
<p>首先, 我们使用高效的因果多头注意力实现来降低内存使用和运行时间. 该实现在 xformers 库中可用, 灵感来自 \\citet{rabe2021self}, 并使用 \\citet{dao2022flashattention} 的反向传播实现. 这是通过不存储注意力权重和不计算因语言建模任务的因果性质而被 mask 的 key/query 分数实现的.</p>
<blockquote>
<p>FlashAttention 是 LLaMA 训练效率的核心推动力之一. 标准 attention 的实现需要将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>×</mo><mi>N</mi></mrow><annotation encoding="application/x-tex">N \\times N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 的注意力矩阵 materialize 到 HBM (高带宽显存) 中, 对于长序列这是内存瓶颈. FlashAttention 通过 tiling 和重计算 (recomputation) 策略, 将 attention 计算分解为可在 SRAM (快速片上缓存) 中完成的块, 避免了昂贵的 HBM 读写. 代价是需要在反向传播时重新计算注意力分数, 而不是从 checkpoint 中读取. 对于内存受限的训练场景, 这是一个非常划算的 trade-off.</p>
</blockquote>
<p>为进一步提高训练效率, 我们通过 checkpointing 减少了反向传播期间重计算的激活值数量. 更具体地, 我们保存计算昂贵的激活值, 如线性层的输出. 这是通过手动实现 transformer 层的反向函数实现的, 而非依赖 PyTorch autograd. 为了充分利用这一优化, 我们需要通过模型和序列并行来降低模型的内存使用, 如 \\citet{korthikanti2022reducing} 所述. 此外, 我们还尽可能重叠激活值的计算和 GPU 间通过网络通信 (由于 all_reduce 操作).</p>
<p>在 2048 块 80GB RAM 的 A100 GPU 上训练 65B 参数模型时, 我们的代码处理速度约为 380 tokens/sec/GPU. 这意味着在我们的包含 1.4T token 的数据集上训练大约需要 21 天.</p>
<blockquote>
<p>380 tokens/sec/GPU 乘以 2048 GPU 等于约 778K tokens/sec 的总吞吐量. 在 1.4T token 上训练需要约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.4</mn><mo>×</mo><msup><mn>10</mn><mn>12</mn></msup><mi mathvariant="normal">/</mi><mn>7.78</mn><mo>×</mo><msup><mn>10</mn><mn>5</mn></msup><mo>≈</mo><mn>1.8</mn><mo>×</mo><msup><mn>10</mn><mn>6</mn></msup></mrow><annotation encoding="application/x-tex">1.4 \\times 10^{12} / 7.78 \\times 10^5 \\approx 1.8 \\times 10^6</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">12</span></span></span></span></span></span></span></span></span><span class="mord">/7.78</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">5</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span> 秒, 即约 21 天. 这个数字与论文描述一致. 作为对比, GPT-3 (175B) 在约 10K V100 上训练了数周, PaLM (540B) 在 6K TPUv4 上训练了数月. LLaMA-65B 用 2K A100 在 3 周内完成, 体现了工程和算法优化的综合效率.</p>
</blockquote>
<hr>
<h2 id="3-main-results">3. Main Results</h2>
<p>遵循先前工作, 我们考虑 zero-shot 和 few-shot 任务, 在总共 20 个 benchmark 上报告结果:</p>
<ul>
<li><strong>Zero-shot.</strong> 我们提供任务的文本描述和一个测试示例. 模型要么通过开放式生成提供答案, 要么对候选答案进行排序.</li>
<li><strong>Few-shot.</strong> 我们提供任务的几个示例 (1 到 64 个) 和一个测试示例. 模型将这段文本作为输入并生成答案或对不同选项排序.</li>
</ul>
<p>我们将 LLaMA 与其他基础模型进行比较, 即非公开可用的语言模型 GPT-3、Gopher、Chinchilla 和 PaLM, 以及开源的 OPT 模型、GPT-J 和 GPT-Neo. 在 Section 4 中, 我们还将 LLaMA 与指令微调模型如 OPT-IML 和 Flan-PaLM 进行简要比较.</p>
<p>我们在自由生成任务和多项选择任务上评估 LLaMA. 在多项选择任务中, 目标是基于提供的上下文从给定选项中选择最合适的补全. 我们选择给定上下文下似然最高的补全. 我们遵循 \\citet{eval-harness}, 使用按补全字符数归一化的似然, 除了某些数据集 (OpenBookQA、BoolQ), 我们遵循 \\citet{brown2020gpt3}, 基于给定 &quot;Answer:&quot; 作为上下文时的似然归一化来选择补全:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mi>P</mi><mo stretchy="false">(</mo><mtext>completion</mtext><mo>∣</mo><mtext>context</mtext><mo stretchy="false">)</mo></mrow><mrow><mi>P</mi><mo stretchy="false">(</mo><mtext>completion</mtext><mo>∣</mo><mtext>“Answer:&quot;</mtext><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\frac{P(\\text{completion} \\mid \\text{context})}{P(\\text{completion} \\mid \\text{\`\`Answer:&quot;})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord text"><span class="mord">completion</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord text"><span class="mord">“Answer:&quot;</span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord text"><span class="mord">completion</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord text"><span class="mord">context</span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><h3 id="3-1-common-sense-reasoning">3.1 Common Sense Reasoning</h3>
<p>我们考虑八个标准常识推理 benchmark: BoolQ、PIQA、SIQA、HellaSwag、WinoGrande、ARC easy 和 challenge 以及 OpenBookQA. 这些数据集包括完形填空和 Winograd 风格任务, 以及多项选择问答. 我们按照语言建模社区的惯例在 zero-shot 设置下评估.</p>
<p>在 Table 3 中, 我们与各种规模的现有模型进行比较, 并报告来自相应论文的数字. 首先, LLaMA-65B 在所有报告的 benchmark 上都优于 Chinchilla-70B, 除了 BoolQ. 同样, 该模型在所有地方都超越了 PaLM-540B, 除了 BoolQ 和 WinoGrande. LLaMA-13B 模型也在大多数 benchmark 上优于 GPT-3, 尽管其规模小了 10 倍.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">BoolQ</th>
<th align="center">PIQA</th>
<th align="center">SIQA</th>
<th align="center">HellaSwag</th>
<th align="center">WinoGrande</th>
<th align="center">ARC-e</th>
<th align="center">ARC-c</th>
<th align="center">OBQA</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-3</td>
<td align="left">175B</td>
<td align="center">60.5</td>
<td align="center">81.0</td>
<td align="center">-</td>
<td align="center">78.9</td>
<td align="center">70.2</td>
<td align="center">68.8</td>
<td align="center">51.4</td>
<td align="center">57.6</td>
</tr>
<tr>
<td align="left">Gopher</td>
<td align="left">280B</td>
<td align="center">79.3</td>
<td align="center">81.8</td>
<td align="center">50.6</td>
<td align="center">79.2</td>
<td align="center">70.1</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">Chinchilla</td>
<td align="left">70B</td>
<td align="center">83.7</td>
<td align="center">81.8</td>
<td align="center">51.3</td>
<td align="center">80.8</td>
<td align="center">74.9</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">PaLM</td>
<td align="left">62B</td>
<td align="center">84.8</td>
<td align="center">80.5</td>
<td align="center">-</td>
<td align="center">79.7</td>
<td align="center">77.0</td>
<td align="center">75.2</td>
<td align="center">52.5</td>
<td align="center">50.4</td>
</tr>
<tr>
<td align="left">PaLM-cont</td>
<td align="left">62B</td>
<td align="center">83.9</td>
<td align="center">81.4</td>
<td align="center">-</td>
<td align="center">80.6</td>
<td align="center">77.0</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">PaLM</td>
<td align="left">540B</td>
<td align="center"><strong>88.0</strong></td>
<td align="center">82.3</td>
<td align="center">-</td>
<td align="center">83.4</td>
<td align="center"><strong>81.1</strong></td>
<td align="center">76.6</td>
<td align="center">53.0</td>
<td align="center">53.4</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">76.5</td>
<td align="center">79.8</td>
<td align="center">48.9</td>
<td align="center">76.1</td>
<td align="center">70.1</td>
<td align="center">72.8</td>
<td align="center">47.6</td>
<td align="center">57.2</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">78.1</td>
<td align="center">80.1</td>
<td align="center">50.4</td>
<td align="center">79.2</td>
<td align="center">73.0</td>
<td align="center">74.8</td>
<td align="center">52.7</td>
<td align="center">56.4</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">83.1</td>
<td align="center">82.3</td>
<td align="center">50.4</td>
<td align="center">82.8</td>
<td align="center">76.0</td>
<td align="center"><strong>80.0</strong></td>
<td align="center"><strong>57.8</strong></td>
<td align="center">58.6</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">85.3</td>
<td align="center"><strong>82.8</strong></td>
<td align="center"><strong>52.3</strong></td>
<td align="center"><strong>84.2</strong></td>
<td align="center">77.0</td>
<td align="center">78.9</td>
<td align="center">56.0</td>
<td align="center"><strong>60.2</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>Table 3: Zero-shot performance on Common Sense Reasoning tasks. 常识推理任务的 zero-shot 性能.</p>
</blockquote>
<blockquote>
<p>LLaMA-13B 超越 GPT-3 (175B) 是一个标志性的结果. 它证明了在足够多的高质量数据上训练后, 小模型可以超越大模型. 从推理成本看, 13B 模型可以在单个 V100 上运行, 而 175B 的 GPT-3 需要多卡甚至多机部署. 这种&quot;以小胜大&quot;的能力是 LLaMA 对开源社区最大的贡献之一——它让资源有限的研究者也能使用接近前沿的模型.</p>
</blockquote>
<h3 id="3-2-closed-book-question-answering">3.2 Closed-book Question Answering</h3>
<p>我们在两个闭卷问答 benchmark 上将 LLaMA 与现有大型语言模型进行比较: Natural Questions 和 TriviaQA. 对于两个 benchmark, 我们在闭卷设置下报告精确匹配性能, 即模型无法访问包含回答问题证据的文档. 在 Table 4 中, 我们报告 NaturalQuestions 上的性能; 在 Table 5 中, 我们报告 TriviaQA 上的性能.</p>
<p>在两个 benchmark 上, LLaMA-65B 在 zero-shot 和 few-shot 设置下均达到 state-of-the-art 性能. 更重要的是, LLaMA-13B 在这些 benchmark 上也与 GPT-3 和 Chinchilla 竞争, 尽管其规模小了 5-10 倍. 该模型在推理期间可在单个 V100 GPU 上运行.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">0-shot</th>
<th align="center">1-shot</th>
<th align="center">5-shot</th>
<th align="center">64-shot</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-3</td>
<td align="left">175B</td>
<td align="center">14.6</td>
<td align="center">23.0</td>
<td align="center">-</td>
<td align="center">29.9</td>
</tr>
<tr>
<td align="left">Gopher</td>
<td align="left">280B</td>
<td align="center">10.1</td>
<td align="center">-</td>
<td align="center">24.5</td>
<td align="center">28.2</td>
</tr>
<tr>
<td align="left">Chinchilla</td>
<td align="left">70B</td>
<td align="center">16.6</td>
<td align="center">-</td>
<td align="center">31.5</td>
<td align="center">35.5</td>
</tr>
<tr>
<td align="left">PaLM-8B</td>
<td align="left"></td>
<td align="center">8.4</td>
<td align="center">10.6</td>
<td align="center">-</td>
<td align="center">14.6</td>
</tr>
<tr>
<td align="left">PaLM-62B</td>
<td align="left"></td>
<td align="center">18.1</td>
<td align="center">26.5</td>
<td align="center">-</td>
<td align="center">27.6</td>
</tr>
<tr>
<td align="left">PaLM-540B</td>
<td align="left"></td>
<td align="center">21.2</td>
<td align="center">29.3</td>
<td align="center">-</td>
<td align="center">39.6</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">16.8</td>
<td align="center">18.7</td>
<td align="center">22.0</td>
<td align="center">26.1</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">20.1</td>
<td align="center">23.4</td>
<td align="center">28.1</td>
<td align="center">31.9</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center"><strong>24.9</strong></td>
<td align="center">28.3</td>
<td align="center">32.9</td>
<td align="center">36.0</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">23.8</td>
<td align="center"><strong>31.0</strong></td>
<td align="center"><strong>35.0</strong></td>
<td align="center"><strong>39.9</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>Table 4: NaturalQuestions. Exact match performance. 精确匹配性能.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">0-shot</th>
<th align="center">1-shot</th>
<th align="center">5-shot</th>
<th align="center">64-shot</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Gopher</td>
<td align="left">280B</td>
<td align="center">43.5</td>
<td align="center">-</td>
<td align="center">57.0</td>
<td align="center">57.2</td>
</tr>
<tr>
<td align="left">Chinchilla</td>
<td align="left">70B</td>
<td align="center">55.4</td>
<td align="center">-</td>
<td align="center">64.1</td>
<td align="center">64.6</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">50.0</td>
<td align="center">53.4</td>
<td align="center">56.3</td>
<td align="center">57.6</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">56.6</td>
<td align="center">60.5</td>
<td align="center">63.1</td>
<td align="center">64.0</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">65.1</td>
<td align="center">67.9</td>
<td align="center">69.9</td>
<td align="center">70.4</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center"><strong>68.2</strong></td>
<td align="center"><strong>71.6</strong></td>
<td align="center"><strong>72.6</strong></td>
<td align="center"><strong>73.0</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>Table 5: TriviaQA. Zero-shot and few-shot exact match performance on the filtered dev set. 在过滤后的 dev 集上的 zero-shot 和 few-shot 精确匹配性能.</p>
</blockquote>
<h3 id="3-3-reading-comprehension">3.3 Reading Comprehension</h3>
<p>我们在 RACE 阅读理解 benchmark 上评估模型. 该数据集收集自为中国初中生和高中生设计的英语阅读理解考试. 我们遵循 \\citet{brown2020gpt3} 的评估设置, 在 Table 6 中报告结果. 在这些 benchmark 上, LLaMA-65B 与 PaLM-540B 竞争, 而 LLaMA-13B 比 GPT-3 高几个百分点.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">RACE-middle</th>
<th align="center">RACE-high</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-3</td>
<td align="left">175B</td>
<td align="center">58.4</td>
<td align="center">45.5</td>
</tr>
<tr>
<td align="left">PaLM-8B</td>
<td align="left"></td>
<td align="center">57.9</td>
<td align="center">42.3</td>
</tr>
<tr>
<td align="left">PaLM-62B</td>
<td align="left"></td>
<td align="center">64.3</td>
<td align="center">47.5</td>
</tr>
<tr>
<td align="left">PaLM-540B</td>
<td align="left"></td>
<td align="center"><strong>68.1</strong></td>
<td align="center">49.1</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">61.1</td>
<td align="center">46.9</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">61.6</td>
<td align="center">47.2</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">64.1</td>
<td align="center">48.3</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">67.9</td>
<td align="center"><strong>51.6</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>Table 6: Reading Comprehension. Zero-shot accuracy. Zero-shot 准确率.</p>
</blockquote>
<h3 id="3-4-mathematical-reasoning">3.4 Mathematical Reasoning</h3>
<p>我们在两个数学推理 benchmark 上评估模型: MATH 和 GSM8k. MATH 是一个包含 12K 个初中和高中数学问题的数据集, 用 LaTeX 编写. GSM8k 是一组初中数学问题. 在 Table 7 中, 我们与 PaLM 和 Minerva 进行比较. Minerva 是一系列在从 ArXiv 和数学网页提取的 38.5B token 上微调的 PaLM 模型, 而 PaLM 和 LLaMA 都未在数学数据上微调. PaLM 和 Minerva 的数字取自 \\citet{lewkowycz2022solving}, 我们比较了使用和不使用 maj1@k 的结果. maj1@k 表示我们对每个问题生成 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个样本并执行多数投票. 在 GSM8k 上, 我们观察到 LLaMA-65B 优于 Minerva-62B, 尽管它未在数学数据上微调.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">MATH</th>
<th align="center">+maj1@k</th>
<th align="center"></th>
<th align="center">GSM8k</th>
<th align="center">+maj1@k</th>
</tr>
</thead>
<tbody><tr>
<td align="left">PaLM-8B</td>
<td align="left"></td>
<td align="center">1.5</td>
<td align="center">-</td>
<td align="center"></td>
<td align="center">4.1</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">PaLM-62B</td>
<td align="left"></td>
<td align="center">4.4</td>
<td align="center">-</td>
<td align="center"></td>
<td align="center">33.0</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">PaLM-540B</td>
<td align="left"></td>
<td align="center">8.8</td>
<td align="center">-</td>
<td align="center"></td>
<td align="center">56.5</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">Minerva-8B</td>
<td align="left"></td>
<td align="center">14.1</td>
<td align="center">25.4</td>
<td align="center"></td>
<td align="center">16.2</td>
<td align="center">28.4</td>
</tr>
<tr>
<td align="left">Minerva-62B</td>
<td align="left"></td>
<td align="center">27.6</td>
<td align="center">43.4</td>
<td align="center"></td>
<td align="center">52.4</td>
<td align="center">68.5</td>
</tr>
<tr>
<td align="left">Minerva-540B</td>
<td align="left"></td>
<td align="center"><strong>33.6</strong></td>
<td align="center"><strong>50.3</strong></td>
<td align="center"></td>
<td align="center"><strong>68.5</strong></td>
<td align="center"><strong>78.5</strong></td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">2.9</td>
<td align="center">6.9</td>
<td align="center"></td>
<td align="center">11.0</td>
<td align="center">18.1</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">3.9</td>
<td align="center">8.8</td>
<td align="center"></td>
<td align="center">17.8</td>
<td align="center">29.3</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">7.1</td>
<td align="center">15.2</td>
<td align="center"></td>
<td align="center">35.6</td>
<td align="center">53.1</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">10.6</td>
<td align="center">20.5</td>
<td align="center"></td>
<td align="center">50.9</td>
<td align="center">69.7</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 7: Model performance on quantitative reasoning datasets. 模型在定量推理数据集上的性能. 对于多数投票, 我们使用与 Minerva 相同的设置, MATH 使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>256</mn></mrow><annotation encoding="application/x-tex">k=256</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">256</span></span></span></span> 样本, GSM8k 使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>100</mn></mrow><annotation encoding="application/x-tex">k=100</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">100</span></span></span></span> (Minerva 540B 对 MATH 使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>64</mn></mrow><annotation encoding="application/x-tex">k=64</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">64</span></span></span></span>, 对 GSM8k 使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>40</mn></mrow><annotation encoding="application/x-tex">k=40</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">40</span></span></span></span>). LLaMA-65B 在 GSM8k 上优于 Minerva 62B, 尽管它未在数学数据上微调.</p>
</blockquote>
<blockquote>
<p>GSM8k 上的结果值得关注: LLaMA-65B (50.9%) 超过了专门在数学数据上微调的 Minerva-62B (52.4% 接近, 但 maj1@k 时 69.7% vs 68.5% 实际上超越了). 这说明通用预训练 + 足够大的规模 + 高质量数据清洗, 可以在特定领域达到甚至超过领域专用模型的水平. 这也解释了为什么后续的 Llama 系列没有发布专门的 &quot;Llama-Math&quot; 版本——基础模型本身已经足够强.</p>
</blockquote>
<h3 id="3-5-code-generation">3.5 Code Generation</h3>
<p>我们在两个 benchmark 上评估模型从自然语言描述编写代码的能力: HumanEval 和 MBPP. 对于两个任务, 模型接收几段句子描述的程序以及几组输入输出示例. 在 HumanEval 中, 它还接收函数签名, 提示格式为自然代码, 文本描述和测试用例在 docstring 中. 模型需要生成满足描述并通过测试用例的 Python 程序.</p>
<p>在 Table 8 中, 我们比较了未在代码上微调的现有语言模型的 pass@1 分数, 即 PaLM 和 LaMDA. PaLM 和 LLaMA 训练的数据集包含相似数量的代码 token.</p>
<p>如 Table 8 所示, 对于相似的参数量, LLaMA 优于其他通用模型如 LaMDA 和 PaLM, 这些模型未专门为代码训练或微调. 13B 参数及以上的 LLaMA 在 HumanEval 和 MBPP 上都优于 LaMDA 137B. LLaMA 65B 也优于 PaLM 62B, 即使后者训练时间更长. 本表中报告的 pass@1 结果使用温度 0.1 采样得到. pass@100 和 pass@80 指标使用温度 0.8 获得. 我们使用与 \\citet{chen2021Evaluating} 相同的方法获得 pass@k 的无偏估计.</p>
<p>通过在代码专用 token 上微调可以提升代码性能. 例如, PaLM-Coder 将 PaLM 在 HumanEval 上的 pass@1 分数从 26.2% 提升到 36%. 其他专门为代码训练的模型在这些任务上也表现更好. 在代码 token 上微调超出了本文的范围.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">Params</th>
<th align="center">HumanEval @1</th>
<th align="center">HumanEval @100</th>
<th align="center">MBPP @1</th>
<th align="center">MBPP @80</th>
</tr>
</thead>
<tbody><tr>
<td align="left">LaMDA</td>
<td align="left">137B</td>
<td align="center">14.0</td>
<td align="center">47.3</td>
<td align="center">14.8</td>
<td align="center">62.4</td>
</tr>
<tr>
<td align="left">PaLM-8B</td>
<td align="left"></td>
<td align="center">3.6*</td>
<td align="center">18.7*</td>
<td align="center">5.0*</td>
<td align="center">35.7*</td>
</tr>
<tr>
<td align="left">PaLM-62B</td>
<td align="left"></td>
<td align="center">15.9</td>
<td align="center">46.3*</td>
<td align="center">21.4</td>
<td align="center">63.2*</td>
</tr>
<tr>
<td align="left">PaLM-cont</td>
<td align="left">62B</td>
<td align="center">23.7</td>
<td align="center">-</td>
<td align="center">31.2</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">PaLM-540B</td>
<td align="left"></td>
<td align="center"><strong>26.2</strong></td>
<td align="center">76.2</td>
<td align="center">36.8</td>
<td align="center">75.0</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">10.5</td>
<td align="center">36.5</td>
<td align="center">17.7</td>
<td align="center">56.2</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">15.8</td>
<td align="center">52.5</td>
<td align="center">22.0</td>
<td align="center">64.0</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">21.7</td>
<td align="center">70.7</td>
<td align="center">30.2</td>
<td align="center">73.4</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">23.7</td>
<td align="center"><strong>79.3</strong></td>
<td align="center"><strong>37.7</strong></td>
<td align="center"><strong>76.8</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>Table 8: Model performance for code generation. 代码生成模型性能. 我们报告 HumanEval 和 MBPP 上的 pass@ 分数. HumanEval 生成在 zero-shot 下进行, MBPP 使用与 \\citet{austin2021program} 类似的 3-shot 提示. 标有 * 的值从 \\citet{chowdhery2022palm} 的图中读取.</p>
</blockquote>
<blockquote>
<p>LLaMA-65B 在 HumanEval pass@100 上达到 79.3%, 超越了 PaLM-540B 的 76.2%. 这是又一个&quot;以小胜大&quot;的例子. 值得注意的是, LLaMA 的代码能力主要来自预训练数据中的 GitHub (4.5%), 而非专门的代码微调. 4.5% 的代码数据比例不算高, 但结合高质量过滤 (许可证筛选、行长度启发式、样板去除、文件级去重), 使得这 328GB 的代码数据质量极高. 这说明对于代码生成, 数据质量 (干净、多样、去重充分) 可能比数据数量更重要.</p>
</blockquote>
<h3 id="3-6-massive-multitask-language-understanding">3.6 Massive Multitask Language Understanding</h3>
<p>大规模多任务语言理解 benchmark (MMLU) 由 \\citet{hendrycks2020measuring} 引入, 包含覆盖各种知识领域的多项选择题, 包括人文、STEM 和社会科学. 我们在 5-shot 设置下评估模型, 使用 benchmark 提供的示例, 在 Table 9 中报告结果.</p>
<p>在此 benchmark 上, 我们观察到 LLaMA-65B 在平均分和大多数领域上落后于 Chinchilla-70B 和 PaLM-540B 几个百分点. 一个可能的解释是, 我们在预训练数据中使用了有限数量的图书和学术论文, 即 ArXiv、Gutenberg 和 Books3, 总计仅 177GB, 而这些模型训练了多达 2TB 的图书. Gopher、Chinchilla 和 PaLM 使用的大量图书也可能解释了为什么 Gopher 在此 benchmark 上优于 GPT-3, 尽管在其他 benchmark 上两者相当.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">Humanities</th>
<th align="center">STEM</th>
<th align="center">Social Sciences</th>
<th align="center">Other</th>
<th align="center">Average</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-NeoX</td>
<td align="left">20B</td>
<td align="center">29.8</td>
<td align="center">34.9</td>
<td align="center">33.7</td>
<td align="center">37.7</td>
<td align="center">33.6</td>
</tr>
<tr>
<td align="left">GPT-3</td>
<td align="left">175B</td>
<td align="center">40.8</td>
<td align="center">36.7</td>
<td align="center">50.4</td>
<td align="center">48.8</td>
<td align="center">43.9</td>
</tr>
<tr>
<td align="left">Gopher</td>
<td align="left">280B</td>
<td align="center">56.2</td>
<td align="center">47.4</td>
<td align="center">71.9</td>
<td align="center">66.1</td>
<td align="center">60.0</td>
</tr>
<tr>
<td align="left">Chinchilla</td>
<td align="left">70B</td>
<td align="center">63.6</td>
<td align="center">54.9</td>
<td align="center">79.3</td>
<td align="center"><strong>73.9</strong></td>
<td align="center">67.5</td>
</tr>
<tr>
<td align="left">PaLM-8B</td>
<td align="left"></td>
<td align="center">25.6</td>
<td align="center">23.8</td>
<td align="center">24.1</td>
<td align="center">27.8</td>
<td align="center">25.4</td>
</tr>
<tr>
<td align="left">PaLM-62B</td>
<td align="left"></td>
<td align="center">59.5</td>
<td align="center">41.9</td>
<td align="center">62.7</td>
<td align="center">55.8</td>
<td align="center">53.7</td>
</tr>
<tr>
<td align="left">PaLM-540B</td>
<td align="left"></td>
<td align="center"><strong>77.0</strong></td>
<td align="center"><strong>55.6</strong></td>
<td align="center"><strong>81.0</strong></td>
<td align="center">69.6</td>
<td align="center"><strong>69.3</strong></td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">34.0</td>
<td align="center">30.5</td>
<td align="center">38.3</td>
<td align="center">38.1</td>
<td align="center">35.1</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">45.0</td>
<td align="center">35.8</td>
<td align="center">53.8</td>
<td align="center">53.3</td>
<td align="center">46.9</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">55.8</td>
<td align="center">46.0</td>
<td align="center">66.7</td>
<td align="center">63.4</td>
<td align="center">57.8</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">61.8</td>
<td align="center">51.7</td>
<td align="center">72.9</td>
<td align="center">67.4</td>
<td align="center">63.4</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 9: MMLU. Five-shot accuracy. 5-shot 准确率.</p>
</blockquote>
<blockquote>
<p>MMLU 是 LLaMA-65B 相对表现最弱的 benchmark (63.4% vs Chinchilla-70B 的 67.5% 和 PaLM-540B 的 69.3%). 作者诚实地指出了原因: 图书和学术数据只有 177GB, 而竞争对手使用了多达 2TB. 这是一个重要的数据实验洞察: 对于需要广泛世界知识的多任务理解, 高质量图书数据的数量是一个关键瓶颈. 这也为 Llama 2 的数据策略改进提供了方向——Llama 2 据说大幅增加了图书和代码数据的比例.</p>
</blockquote>
<h3 id="3-7-evolution-of-performance-during-training">3.7 Evolution of Performance During Training</h3>
<p>在训练过程中, 我们追踪了模型在一些问答和常识 benchmark 上的性能, 在 Figure 1 中报告. 在大多数 benchmark 上, 性能稳步提升, 并与模型的训练困惑度相关. 例外是 SIQA 和 WinoGrande. 最值得注意的是, 在 SIQA 上, 我们观察到性能有很大的方差, 这可能表明该 benchmark 不可靠. 在 WinoGrande 上, 性能与训练困惑度的相关性不太好: LLaMA-33B 和 LLaMA-65B 在训练期间有相似的性能.</p>
<blockquote>
<p>图 1: 训练过程中问答和常识推理性能的演化. LLaMA-33B 和 LLaMA-65B 在 1.4T token 上训练, 较小模型在 1.0T token 上训练. 所有模型使用 4M token 的 batch size.</p>
</blockquote>
<blockquote>
<p>图 2: 训练期间在问答和常识推理上的性能演化. 纵轴为 benchmark 准确率, 横轴为训练 token 数.</p>
</blockquote>
<blockquote>
<p>SIQA 的高方差确实是一个值得注意的信号. 如果一个 benchmark 在同一模型的不同Checkpoint之间产生大幅波动, 说明该 benchmark 的评测信号不够稳定, 可能受随机因素 (如提示格式、答案选项排序) 影响过大. 这提醒我们在解读单个 benchmark 数字时要谨慎——稳定的趋势比孤立的峰值更有说服力.</p>
</blockquote>
<hr>
<h2 id="4-instruction-finetuning">4. Instruction Finetuning</h2>
<p>在本节中, 我们展示在指令数据上短暂微调能迅速带来 MMLU 上的改进.</p>
<p>尽管 LLaMA-65B 的非微调版本已经能够遵循基本指令, 但我们观察到少量微调能提升 MMLU 上的性能, 并进一步提升模型遵循指令的能力. 由于这不是本文的重点, 我们只进行了单一实验, 遵循与 \\citet{Chung2022ScalingIL} 相同的协议来训练一个指令模型 LLaMA-I.</p>
<p>在 Table 10 中, 我们报告了指令模型 LLaMA-I 在 MMLU 上的结果, 并与现有中等规模的指令微调模型进行比较, 即 OPT-IML 和 Flan-PaLM 系列. 所有报告的数字来自相应论文. 尽管这里使用的指令微调方法非常简单, 我们在 MMLU 上达到了 68.9%. LLaMA-I (65B) 在 MMLU 上超越了现有中等规模的指令微调模型, 但仍远未达到 state-of-the-art, 即 GPT code-davinci-002 在 MMLU 上的 77.4%.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">MMLU (5-shot)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OPT-30B</td>
<td align="center">26.1</td>
</tr>
<tr>
<td align="left">GLM-120B</td>
<td align="center">44.8</td>
</tr>
<tr>
<td align="left">PaLM-62B</td>
<td align="center">55.1</td>
</tr>
<tr>
<td align="left">PaLM-cont-62B</td>
<td align="center">62.8</td>
</tr>
<tr>
<td align="left">Chinchilla-70B</td>
<td align="center">67.5</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="center">63.4</td>
</tr>
<tr>
<td align="left">OPT-IML-Max-30B</td>
<td align="center">43.2</td>
</tr>
<tr>
<td align="left">Flan-T5-XXL-11B</td>
<td align="center">55.1</td>
</tr>
<tr>
<td align="left">Flan-PaLM-62B</td>
<td align="center">59.6</td>
</tr>
<tr>
<td align="left">Flan-PaLM-cont-62B</td>
<td align="center">66.1</td>
</tr>
<tr>
<td align="left"><strong>LLaMA-I-65B</strong></td>
<td align="center"><strong>68.9</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>Table 10: Instruction finetuning -- MMLU (5-shot). 指令微调 -- MMLU (5-shot).</p>
</blockquote>
<blockquote>
<p>从 63.4% (base) 到 68.9% (instruct) 的提升仅用&quot;少量微调&quot;就实现, 这说明了指令微调的强大效果. 然而 68.9% 仍远低于当时的 SOTA (77.4%), 表明 LLaMA-I 的指令微调策略相当基础. 这也为后续 Alpaca、Vicuna 等基于 LLaMA 的社区微调项目留下了空间——开源社区用更精细的指令数据 (如 ShareGPT) 和更复杂的微调技术, 在 LLaMA 基础上快速超越了 LLaMA-I 的水平.</p>
</blockquote>
<hr>
<h2 id="5-bias-toxicity-and-misinformation">5. Bias, Toxicity and Misinformation</h2>
<p>大型语言模型已被证明会复现和放大训练数据中存在的偏见, 并生成有毒或冒犯性内容. 由于我们的训练数据集包含大量来自 Web 的数据, 我们认为确定模型生成此类内容的潜力至关重要. 为了了解 LLaMA-65B 的潜在危害, 我们在不同的 benchmark 上评估有毒内容生成和刻板印象检测. 虽然我们选择了语言模型社区使用的一些标准 benchmark 来指示这些模型的一些问题, 但这些评估不足以完全理解与这些模型相关的风险.</p>
<h3 id="5-1-real-toxicity-prompts">5.1 RealToxicityPrompts</h3>
<p>语言模型可以生成有毒语言, 例如侮辱、仇恨言论或威胁. 模型可以生成的有毒内容范围非常广泛, 使得全面评估具有挑战性. 几项近期工作将 RealToxicityPrompts benchmark 作为其模型毒性程度的指标. RealToxicityPrompts 包含约 100K 个提示, 模型必须完成它们; 然后通过向 PerspectiveAPI 发起请求自动评估毒性分数. 我们无法控制第三方 PerspectiveAPI 使用的流水线, 这使得与先前模型的比较变得困难.</p>
<p>对于 100K 个提示中的每一个, 我们用模型贪婪生成, 并测量其毒性分数. 每个提示的分数范围从 0 (无毒) 到 1 (有毒). 在 Table 11 中, 我们报告了 RealToxicityPrompts 的 basic 和 respectful 提示类别上的平均分数. 这些分数与文献中观察到的 (例如 Chinchilla 的 0.087) &quot;可比较&quot;, 但这些工作与我们的方法不同 (在采样策略、提示数量和时间/API 方面). 我们观察到毒性随模型规模增加而增加, 尤其是 Respectful 提示. 这在先前工作中也被观察到, 但 \\citet{hoffmann2022chinchilla} 是显著的例外, 他们没有发现 Chinchilla 和 Gopher 之间的差异, 尽管规模不同. 这可能是因为更大的模型 Gopher 性能比 Chinchilla 差, 表明毒性与模型规模之间的关系可能仅适用于同一模型家族内.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">Basic</th>
<th align="center">Respectful</th>
</tr>
</thead>
<tbody><tr>
<td align="left">LLaMA-7B</td>
<td align="center">0.106</td>
<td align="center">0.081</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="center">0.104</td>
<td align="center">0.095</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="center">0.107</td>
<td align="center">0.087</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="center">0.128</td>
<td align="center">0.141</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 11: RealToxicityPrompts. 我们在该 benchmark 的 100K 提示上运行贪婪解码. &quot;respectful&quot; 版本是以 &quot;Complete the following sentence in a polite, respectful, and unbiased manner:&quot; 开头的提示, &quot;Basic&quot; 是没有此前缀的版本. 分数使用 PerplexityAPI 获得, 更高的分数表示更有毒的生成.</p>
</blockquote>
<blockquote>
<p>毒性随模型规模增加而增加是一个令人担忧但已被反复验证的现象. 更大的模型更好地&quot;学习&quot;了训练数据中的统计模式, 包括有害内容的出现规律. 一个有趣的细节是 Respectful 前缀反而导致了更高的毒性分数——当要求模型&quot;礼貌、尊重、无偏见&quot;地完成句子时, 65B 模型的毒性分数从 0.128 上升到 0.141. 这可能说明大模型对显式的道德指令存在某种&quot;逆反&quot;效应, 或者 respectful 前缀改变了模型的生成分布, 使其更倾向于生成更长、更复杂的句子, 从而增加了触及 toxic 模式的概率.</p>
</blockquote>
<h3 id="5-2-crow-s-pairs">5.2 CrowS-Pairs</h3>
<p>我们在 CrowS-Pairs benchmark 上评估模型的偏见. 该数据集允许测量 9 个类别的偏见: 性别、宗教、种族/肤色、性取向、年龄、国籍、残疾、外貌和社会经济地位. 每个示例由一个刻板印象和一个反刻板印象组成, 我们在 zero-shot 设置下使用两个句子的困惑度测量模型对刻板印象句子的偏好. 更高的分数表示更高的偏见. 我们在 Table 12 中与 GPT-3 和 OPT-175B 进行比较.</p>
<p>LLaMA 在平均上略优于两个模型. 我们的模型在宗教类别中特别偏见 (+10% 相比 OPT-175B), 其次是年龄和性别. 我们预计这些偏见来自 CommonCrawl, 尽管经过了多层过滤.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">LLaMA</th>
<th align="center">GPT3</th>
<th align="center">OPT</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Gender</td>
<td align="center">70.6</td>
<td align="center"><strong>62.6</strong></td>
<td align="center">65.7</td>
</tr>
<tr>
<td align="left">Religion</td>
<td align="center">79.0</td>
<td align="center">73.3</td>
<td align="center"><strong>68.6</strong></td>
</tr>
<tr>
<td align="left">Race/Color</td>
<td align="center"><strong>57.0</strong></td>
<td align="center">64.7</td>
<td align="center">68.6</td>
</tr>
<tr>
<td align="left">Sexual orientation</td>
<td align="center">81.0</td>
<td align="center"><strong>76.2</strong></td>
<td align="center">78.6</td>
</tr>
<tr>
<td align="left">Age</td>
<td align="center">70.1</td>
<td align="center"><strong>64.4</strong></td>
<td align="center">67.8</td>
</tr>
<tr>
<td align="left">Nationality</td>
<td align="center">64.2</td>
<td align="center"><strong>61.6</strong></td>
<td align="center">62.9</td>
</tr>
<tr>
<td align="left">Disability</td>
<td align="center"><strong>66.7</strong></td>
<td align="center">76.7</td>
<td align="center">76.7</td>
</tr>
<tr>
<td align="left">Physical appearance</td>
<td align="center">77.8</td>
<td align="center"><strong>74.6</strong></td>
<td align="center">76.2</td>
</tr>
<tr>
<td align="left">Socioeconomic status</td>
<td align="center"><strong>71.5</strong></td>
<td align="center">73.8</td>
<td align="center">76.2</td>
</tr>
<tr>
<td align="left">Average</td>
<td align="center"><strong>66.6</strong></td>
<td align="center">67.2</td>
<td align="center">69.5</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 12: CrowS-Pairs. 我们比较 LLaMA-65B 与 OPT-175B 和 GPT3-175B 中包含的偏见水平. 更高的分数表示更高的偏见.</p>
</blockquote>
<h3 id="5-3-wino-gender">5.3 WinoGender</h3>
<p>为了进一步调查模型在性别类别上的偏见, 我们查看 WinoGender benchmark, 一个共指消解数据集. WinoGender 由 Winograd 模式组成, 通过确定模型的共指消解性能是否受代词性别影响来评估偏见.</p>
<p>更精确地, 每个句子有三个提及: 一个 &quot;occupation&quot;、一个 &quot;participant&quot; 和一个 &quot;pronoun&quot;, 其中代词共指职业或参与者. 我们提示模型确定共指关系, 并根据句子上下文测量其是否正确. 目标是揭示与职业相关的社会偏见是否被模型捕获. 例如, WinoGender 数据集中的一个句子是 &quot;The nurse notified the patient that his shift would be ending in an hour.&quot;, 后面跟着 &quot;His&quot; refers to. 然后我们比较续写 &quot;the nurse&quot; 和 &quot;the patient&quot; 的困惑度, 用模型执行共指消解. 我们评估使用三种代词时的性能: &quot;her/her/she&quot;、&quot;his/him/he&quot; 和 &quot;their/them/someone&quot;.</p>
<p>在 Table 13 中, 我们报告了数据集中包含的三种不同代词的共指分数. 我们观察到模型在执行 &quot;their/them/someone&quot; 代词的共指消解时显著优于 &quot;her/her/she&quot; 和 &quot;his/him/he&quot; 代词. 先前工作中也做了类似的观察, 这可能表明存在性别偏见. 确实, 对于 &quot;her/her/she&quot; 和 &quot;his/him/he&quot; 代词, 模型可能使用职业的多数性别来执行共指消解, 而非使用句子的证据.</p>
<p>为了进一步调查这一假设, 我们查看 WinoGender 数据集中 &quot;her/her/she&quot; 和 &quot;his/him/he&quot; 代词的 &quot;gotcha&quot; 案例集. 这些案例对应于代词与职业的多数性别不匹配且职业是正确答案的句子. 在 Table 13 中, 我们观察到 LLaMA-65B 在 gotcha 示例上犯了更多错误, 清楚地表明它捕获了与性别和职业相关的社会偏见. 性能下降存在于 &quot;her/her/she&quot; 和 &quot;his/him/he&quot; 代词上, 这表明偏见与性别无关.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">7B</th>
<th align="center">13B</th>
<th align="center">33B</th>
<th align="center">65B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">All</td>
<td align="center">66.0</td>
<td align="center">64.7</td>
<td align="center">69.0</td>
<td align="center">77.5</td>
</tr>
<tr>
<td align="left">her/her/she</td>
<td align="center">65.0</td>
<td align="center">66.7</td>
<td align="center">66.7</td>
<td align="center">78.8</td>
</tr>
<tr>
<td align="left">his/him/he</td>
<td align="center">60.8</td>
<td align="center">62.5</td>
<td align="center">62.1</td>
<td align="center">72.1</td>
</tr>
<tr>
<td align="left">their/them/someone</td>
<td align="center">72.1</td>
<td align="center">65.0</td>
<td align="center">78.3</td>
<td align="center">81.7</td>
</tr>
<tr>
<td align="left">her/her/she (gotcha)</td>
<td align="center">64.2</td>
<td align="center">65.8</td>
<td align="center">61.7</td>
<td align="center">75.0</td>
</tr>
<tr>
<td align="left">his/him/he (gotcha)</td>
<td align="center">55.0</td>
<td align="center">55.8</td>
<td align="center">55.8</td>
<td align="center">63.3</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 13: WinoGender. LLaMA 模型的共指消解准确率, 针对不同代词. 我们观察到模型在 &quot;their/them/someone&quot; 代词上获得更好的性能, 而非 &quot;her/her/she&quot; 和 &quot;his/him/he&quot;, 这可能表明存在偏见.</p>
</blockquote>
<h3 id="5-4-truthful-qa">5.4 TruthfulQA</h3>
<p>TruthfulQA 旨在测量模型的真实性, 即其识别声明何时为真的能力. \\citet{lin2021truthfulqa} 考虑 &quot;真&quot; 的定义为 &quot;现实世界的字面真实&quot;, 而非仅在信仰体系或传统语境中为真的声明. 该 benchmark 可以评估模型生成错误信息或虚假声明的风险. 问题以多样化的风格编写, 涵盖 38 个类别, 并被设计为对抗性的.</p>
<p>在 Table 14 中, 我们报告了模型在衡量真实性的问题和真实性与信息性交集上的问题上的性能. 与 GPT-3 相比, 我们的模型在两个类别上得分更高, 但正确答案的比率仍然很低, 表明我们的模型可能会幻觉错误的答案.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left"></th>
<th align="center">Truthful</th>
<th align="center">Truthful*Inf</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-3-1.3B</td>
<td align="left"></td>
<td align="center">0.31</td>
<td align="center">0.19</td>
</tr>
<tr>
<td align="left">GPT-3-6B</td>
<td align="left"></td>
<td align="center">0.22</td>
<td align="center">0.19</td>
</tr>
<tr>
<td align="left">GPT-3-175B</td>
<td align="left"></td>
<td align="center">0.28</td>
<td align="center">0.25</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left"></td>
<td align="center">0.33</td>
<td align="center">0.29</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left"></td>
<td align="center">0.47</td>
<td align="center">0.41</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left"></td>
<td align="center">0.52</td>
<td align="center">0.48</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left"></td>
<td align="center">0.57</td>
<td align="center">0.53</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 14: TruthfulQA. 我们报告真实和真实*信息性答案的比例, 由通过 OpenAI API 专门训练的模型评分. 我们遵循 \\citet{ouyang2022training} 中使用的 QA 提示风格, 并报告来自同一论文的 GPT-3 性能.</p>
</blockquote>
<blockquote>
<p>TruthfulQA 的结果揭示了 LLM 的一个根本局限: 即使是最先进的模型, 在对抗性设计的问题上, 真实率也只有 57%. 这意味着模型仍然倾向于&quot;编造&quot;看似合理但实际上错误的答案. 这种幻觉倾向在后续几代 Llama 中有所改善 (Llama 3 通过更好的数据过滤和更大的知识库显著降低了幻觉率), 但从未完全消除. 从工程角度看, 这提醒我们 LLM 不应被直接用于需要高事实精度的场景 (如医疗、法律建议) 而不加额外的事实核查层.</p>
</blockquote>
<hr>
<h2 id="6-carbon-footprint">6. Carbon Footprint</h2>
<p>我们模型的训练消耗了大量能源, 导致了二氧化碳的排放. 我们遵循该主题的最新文献, 在 Table 15 中分解总能源消耗和由此产生的碳足迹. 我们遵循 \\citet{wu2022sustainable} 的公式来估算训练模型所需的瓦时 (Wh), 以及吨碳排放 (tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq).</p>
<p>对于 Wh, 我们使用公式:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Wh</mtext><mo>=</mo><mtext>GPU-h</mtext><mo>×</mo><mo stretchy="false">(</mo><mtext>GPU power consumption</mtext><mo stretchy="false">)</mo><mo>×</mo><mtext>PUE</mtext></mrow><annotation encoding="application/x-tex">\\text{Wh} = \\text{GPU-h} \\times (\\text{GPU power consumption}) \\times \\text{PUE}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Wh</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord text"><span class="mord">GPU-h</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord text"><span class="mord">GPU power consumption</span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">PUE</span></span></span></span></span></span><p>其中我们将 Power Usage Effectiveness (PUE) 设为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.1</mn></mrow><annotation encoding="application/x-tex">1.1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.1</span></span></span></span>.</p>
<p>由此产生的碳排放取决于用于训练网络的数据中心位置. 例如, BLOOM 使用的电网排放 0.057 kg CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq/KWh, 导致 27 tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq; OPT 使用的电网排放 0.231 kg CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq/KWh, 导致 82 tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq. 在本研究中, 我们有兴趣比较如果这些模型在同一个数据中心训练, 训练这些模型的碳排放成本. 因此, 我们不考虑数据中心的位置, 而是使用美国国家平均碳强度因子 0.385 kg CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq/KWh. 这导致吨碳排放的公式为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>tCO</mtext><mn>2</mn></msub><mtext>eq</mtext><mo>=</mo><mtext>MWh</mtext><mo>×</mo><mn>0.385</mn></mrow><annotation encoding="application/x-tex">\\text{tCO}_2\\text{eq} = \\text{MWh} \\times 0.385</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord text"><span class="mord">tCO</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord">eq</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord text"><span class="mord">MWh</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.385</span></span></span></span></span><p>我们对 OPT 和 BLOOM 应用相同的公式以进行公平比较. 对于 OPT, 我们假设训练需要在 992 A100-80GB 上进行 34 天. 最后, 我们估计在约 5 个月的时间内使用 2048 A100-80GB 来开发我们的模型. 这意味着在我们的假设下, 开发这些模型的成本约为 2,638 MWh, 总排放为 1,015 tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq. 我们希望发布这些模型将有助于减少未来的碳排放, 因为训练已经完成, 而且一些模型相对较小, 可以在单个 GPU 上运行.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">GPU Type</th>
<th align="center">GPU Power</th>
<th align="center">GPU-hours</th>
<th align="center">Total power</th>
<th align="center">Carbon emitted</th>
</tr>
</thead>
<tbody><tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">consumption</td>
<td align="center"></td>
<td align="center">consumption</td>
<td align="center">(tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq)</td>
</tr>
<tr>
<td align="left">OPT-175B</td>
<td align="left">A100-80GB</td>
<td align="center">400W</td>
<td align="center">809,472</td>
<td align="center">356 MWh</td>
<td align="center">137</td>
</tr>
<tr>
<td align="left">BLOOM-175B</td>
<td align="left">A100-80GB</td>
<td align="center">400W</td>
<td align="center">1,082,880</td>
<td align="center">475 MWh</td>
<td align="center">183</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left">A100-80GB</td>
<td align="center">400W</td>
<td align="center">82,432</td>
<td align="center">~36 MWh</td>
<td align="center">~14</td>
</tr>
<tr>
<td align="left">LLaMA-13B</td>
<td align="left">A100-80GB</td>
<td align="center">400W</td>
<td align="center">135,168</td>
<td align="center">~59 MWh</td>
<td align="center">~23</td>
</tr>
<tr>
<td align="left">LLaMA-33B</td>
<td align="left">A100-80GB</td>
<td align="center">400W</td>
<td align="center">530,432</td>
<td align="center">233 MWh</td>
<td align="center">~90</td>
</tr>
<tr>
<td align="left">LLaMA-65B</td>
<td align="left">A100-80GB</td>
<td align="center">400W</td>
<td align="center">1,022,362</td>
<td align="center">449 MWh</td>
<td align="center">173</td>
</tr>
</tbody></table>
<blockquote>
<p>Table 15: Carbon footprint of training different models in the same data center. 在同一数据中心训练不同模型的碳足迹. 我们遵循 \\citet{wu2022sustainable} 计算 OPT、BLOOM 和我们模型的碳排放. 对于 A100-80GB 的功耗, 我们取 NVLink 系统的热设计功率, 即 400W. 我们取 PUE 为 1.1, 碳强度因子设为美国全国平均值 0.385 kg CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>e per KWh.</p>
</blockquote>
<blockquote>
<p>碳足迹计算中有一个微妙的假设选择: 使用美国全国平均碳强度 (0.385 kg CO2eq/KWh) 而非实际数据中心所在地的电网强度. 这个选择使得不同模型之间的比较更公平, 但也掩盖了地理位置对碳排放的巨大影响. 例如, 如果 LLaMA 在法国的低碳电网 (约 0.05 kg/KWh) 上训练, 实际排放将降低约 7 倍. 从工程伦理角度, 这是一个值得研究者关注的维度——选择训练地点可以像选择算法一样显著影响碳足迹.</p>
</blockquote>
<hr>
<h2 id="7-related-work">7. Related Work</h2>
<p><strong>Language models</strong> 是词、token 或字符序列上的概率分布. 这一任务, 通常被框架为下一个 token 预测, 长期以来被认为是自然语言处理中的核心问题. 由于 \\citet{turing1950computing} 提出通过 &quot;imitation game&quot; 使用语言来衡量机器智能, 语言建模被提议为衡量通向人工智能进展的 benchmark.</p>
<p><strong>Architecture.</strong> 传统上, 语言模型基于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span>-gram 计数统计, 并提出了各种平滑技术来改善罕见事件的估计. 在过去二十年中, 神经网络被成功地应用于语言建模任务, 从 feed forward 模型、循环神经网络到 LSTM. 更近期, 基于自注意力的 transformer 网络带来了重要改进, 尤其在捕获长距离依赖方面.</p>
<p><strong>Scaling.</strong> 语言模型的 scaling 有悠久历史, 包括模型和数据集规模两方面. \\citet{brants2007large} 展示了在 2 万亿 token 上训练语言模型的好处, 产生了 3000 亿 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span>-gram, 用于提升机器翻译质量. \\citet{jozefowicz2016exploring} 通过将 LSTM 扩展到 10 亿参数, 在 Billion Word benchmark 上获得了 state-of-the-art 结果. 后来, 扩展 transformer 在许多 NLP 任务上带来了改进. 值得注意的模型包括 BERT、GPT-2、Megatron-LM 和 T5. 一个重大突破是 GPT-3, 一个 1750 亿参数的模型. 这催生了一系列<strong>大型语言模型</strong>, 如 Jurassic-1、Megatron-Turing NLG、Gopher、Chinchilla、PaLM、OPT 和 GLM. \\citet{hestness2017deep} 和 \\citet{rosenfeld2019constructive} 研究了 scaling 对深度学习模型性能的影响, 展示了模型和数据集规模与系统性能之间存在幂律关系. \\citet{kaplan2020scaling} 推导出专门针对基于 transformer 的语言模型的幂律, 后来被 \\citet{hoffmann2022chinchilla} 通过调整 scaling 数据集时的学习率调度进行了细化. 最后, \\citet{wei2022emergent} 研究了 scaling 对大型语言模型能力的影响.</p>
<blockquote>
<p>从算法谱系看, LLaMA 处于 transformer scaling 浪潮的承上启下位置. 它继承了 GPT-3 的 decoder-only 架构、PaLM 的 SwiGLU 和 pre-normalization、GPT-Neo 的 RoPE, 以及 Chinchilla 的数据 scaling 哲学. 同时, 它开创了&quot;纯公开数据 + 开源权重&quot;的先河, 直接催生了 Alpaca、Vicuna、WizardLM 等后续工作, 并最终影响了整个开源 LLM 生态的走向. 在 LLaMA 之前, 开源模型 (OPT、BLOOM、GLM) 与闭源前沿 (GPT-3、PaLM) 之间存在明显的性能鸿沟; LLaMA 首次弥合了这一鸿沟, 证明了开源社区也能训练出竞争力模型.</p>
</blockquote>
<hr>
<h2 id="8-conclusion">8. Conclusion</h2>
<p>在本文中, 我们展示了一系列公开发布且与 state-of-the-art 基础模型竞争的语言模型. 最值得注意的是, LLaMA-13B 优于 GPT-3 且规模小了 10 倍以上, LLaMA-65B 与 Chinchilla-70B 和 PaLM-540B 竞争. 与先前研究不同, 我们展示了完全在公开可用数据上训练即可达到 state-of-the-art 性能, 无需借助专有数据集.</p>
<p>我们希望将这些模型发布给研究社区将加速大型语言模型的发展, 并帮助改进其鲁棒性和缓解已知问题如毒性和偏见. 此外, 我们像 \\citet{Chung2022ScalingIL} 一样观察到, 在指令上微调这些模型能取得有希望的结果, 我们计划在未来的工作中进一步研究这一点. 最后, 我们计划在未来发布在更大预训练语料上训练的更大模型, 因为我们在扩展过程中看到了持续的性能改进.</p>
<hr>
<h2 id="fl-a-mmlu-xxjg">附录 A: MMLU 详细结果</h2>
<p>MMLU 的 57 个任务详细 5-shot 结果见原文 Appendix Table. 为节省篇幅, 此处列出各领域汇总:</p>
<table>
<thead>
<tr>
<th align="left">Domain</th>
<th align="center">LLaMA-7B</th>
<th align="center">LLaMA-13B</th>
<th align="center">LLaMA-33B</th>
<th align="center">LLaMA-65B</th>
<th align="center">LLaMA-I-65B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Humanities</td>
<td align="center">34.0</td>
<td align="center">45.0</td>
<td align="center">55.8</td>
<td align="center">61.8</td>
<td align="center">67.4</td>
</tr>
<tr>
<td align="left">STEM</td>
<td align="center">30.5</td>
<td align="center">35.8</td>
<td align="center">46.0</td>
<td align="center">51.7</td>
<td align="center">56.6</td>
</tr>
<tr>
<td align="left">Social Science</td>
<td align="center">38.3</td>
<td align="center">53.8</td>
<td align="center">66.7</td>
<td align="center">72.9</td>
<td align="center">79.2</td>
</tr>
<tr>
<td align="left">Other</td>
<td align="center">38.1</td>
<td align="center">53.3</td>
<td align="center">63.4</td>
<td align="center">67.4</td>
<td align="center">72.6</td>
</tr>
<tr>
<td align="left">All</td>
<td align="center">35.1</td>
<td align="center">46.9</td>
<td align="center">57.8</td>
<td align="center">63.4</td>
<td align="center">68.9</td>
</tr>
</tbody></table>
<blockquote>
<p>附录 Table: MMLU 按领域 5-shot 结果汇总.</p>
</blockquote>
<hr>
<h2 id="fl-b-syb">附录 B: 术语表</h2>
<table>
<thead>
<tr>
<th align="left">英文术语</th>
<th align="left">中文译名</th>
<th align="left">首次出现</th>
<th align="left">简要解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">LLM</td>
<td align="left">大型语言模型</td>
<td align="left">Introduction</td>
<td align="left">在大规模文本上训练的神经网络语言模型</td>
</tr>
<tr>
<td align="left">Few-shot</td>
<td align="left">小样本</td>
<td align="left">Introduction</td>
<td align="left">仅提供少量示例让模型学习新任务</td>
</tr>
<tr>
<td align="left">Scaling laws</td>
<td align="left">缩放定律</td>
<td align="left">Introduction</td>
<td align="left">描述模型/数据规模与性能关系的幂律</td>
</tr>
<tr>
<td align="left">CommonCrawl</td>
<td align="left">通用爬虫数据</td>
<td align="left">Section 2.1</td>
<td align="left">公开的网页存档数据集</td>
</tr>
<tr>
<td align="left">BPE</td>
<td align="left">字节对编码</td>
<td align="left">Section 2.1</td>
<td align="left">子词分词算法</td>
</tr>
<tr>
<td align="left">RMSNorm</td>
<td align="left">根均方层归一化</td>
<td align="left">Section 2.2</td>
<td align="left">移除了均值中心化的 LayerNorm 变体</td>
</tr>
<tr>
<td align="left">SwiGLU</td>
<td align="left">Swish-Gated Linear Unit</td>
<td align="left">Section 2.2</td>
<td align="left">带门控的激活函数, PaLM 采用</td>
</tr>
<tr>
<td align="left">RoPE</td>
<td align="left">旋转位置编码</td>
<td align="left">Section 2.2</td>
<td align="left">通过旋转矩阵编码位置信息的位置编码方案</td>
</tr>
<tr>
<td align="left">AdamW</td>
<td align="left">Adam with Weight Decay</td>
<td align="left">Section 2.3</td>
<td align="left">带权重衰减的自适应优化器</td>
</tr>
<tr>
<td align="left">FlashAttention</td>
<td align="left">闪存注意力</td>
<td align="left">Section 2.4</td>
<td align="left">通过 tiling 减少 HBM 读写的内存高效注意力实现</td>
</tr>
<tr>
<td align="left">PUE</td>
<td align="left">电能使用效率</td>
<td align="left">Section 6</td>
<td align="left">数据中心总能耗与 IT 设备能耗之比</td>
</tr>
<tr>
<td align="left">maj1@k</td>
<td align="left">多数投票</td>
<td align="left">Section 3.4</td>
<td align="left">生成 k 个样本后取多数答案的评测方法</td>
</tr>
<tr>
<td align="left">pass@k</td>
<td align="left">通过@k</td>
<td align="left">Section 3.5</td>
<td align="left">k 次采样中至少一次通过测试的概率</td>
</tr>
</tbody></table>
<hr>
<h2 id="fl-c-hxgssy">附录 C: 核心公式索引</h2>
<table>
<thead>
<tr>
<th align="left">编号</th>
<th align="left">公式</th>
<th align="left">所在章节</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">(1)</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Wh</mtext><mo>=</mo><mtext>GPU-h</mtext><mo>×</mo><mo stretchy="false">(</mo><mtext>GPU power consumption</mtext><mo stretchy="false">)</mo><mo>×</mo><mtext>PUE</mtext></mrow><annotation encoding="application/x-tex">\\text{Wh} = \\text{GPU-h} \\times (\\text{GPU power consumption}) \\times \\text{PUE}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Wh</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord text"><span class="mord">GPU-h</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord text"><span class="mord">GPU power consumption</span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">PUE</span></span></span></span></span></td>
<td align="left">Carbon footprint</td>
<td align="left">训练能耗计算公式</td>
</tr>
<tr>
<td align="left">(2)</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mtext>tCO</mtext><mn>2</mn></msub><mtext>eq</mtext><mo>=</mo><mtext>MWh</mtext><mo>×</mo><mn>0.385</mn></mrow><annotation encoding="application/x-tex">\\text{tCO}_2\\text{eq} = \\text{MWh} \\times 0.385</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord text"><span class="mord">tCO</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord">eq</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord text"><span class="mord">MWh</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.385</span></span></span></span></td>
<td align="left">Carbon footprint</td>
<td align="left">碳排放计算公式</td>
</tr>
<tr>
<td align="left">(3)</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mrow><mi>P</mi><mo stretchy="false">(</mo><mtext>completion</mtext><mo>∣</mo><mtext>context</mtext><mo stretchy="false">)</mo></mrow><mrow><mi>P</mi><mo stretchy="false">(</mo><mtext>completion</mtext><mo>∣</mo><mtext>“Answer:&quot;</mtext><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\frac{P(\\text{completion} \\mid \\text{context})}{P(\\text{completion} \\mid \\text{\`\`Answer:&quot;})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.53em;vertical-align:-0.52em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.01em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mopen mtight">(</span><span class="mord text mtight"><span class="mord mtight">completion</span></span><span class="mrel mtight">∣</span><span class="mord text mtight"><span class="mord mtight">“Answer:&quot;</span></span><span class="mclose mtight">)</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.485em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mopen mtight">(</span><span class="mord text mtight"><span class="mord mtight">completion</span></span><span class="mrel mtight">∣</span><span class="mord text mtight"><span class="mord mtight">context</span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.52em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></td>
<td align="left">Main results</td>
<td align="left">多项选择任务的标准化似然</td>
</tr>
</tbody></table>
<hr>
<h2 id="fl-d-mxpxdw">附录 D: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: GPT-3 (decoder-only 架构), PaLM (SwiGLU + Pre-normalization), GPT-Neo (RoPE), Chinchilla (数据 scaling 哲学)</li>
<li><strong>核心创新</strong>: (1) 纯公开数据训练达到 SOTA; (2) 证明小模型+大数据在推理效率上优于大模型+小数据; (3) 开源权重推动社区民主化</li>
<li><strong>被后续工作引用</strong>: Alpaca, Vicuna, WizardLM, Llama 2/3/4 等整个开源 LLM 生态</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-introduction","text":"1. Introduction"},{"level":2,"id":"2-approach","text":"2. Approach"},{"level":3,"id":"2-1-pre-training-data","text":"2.1 Pre-training Data"},{"level":3,"id":"2-2-architecture","text":"2.2 Architecture"},{"level":3,"id":"2-3-optimizer","text":"2.3 Optimizer"},{"level":3,"id":"2-4-efficient-implementation","text":"2.4 Efficient Implementation"},{"level":2,"id":"3-main-results","text":"3. Main Results"},{"level":3,"id":"3-1-common-sense-reasoning","text":"3.1 Common Sense Reasoning"},{"level":3,"id":"3-2-closed-book-question-answering","text":"3.2 Closed-book Question Answering"},{"level":3,"id":"3-3-reading-comprehension","text":"3.3 Reading Comprehension"},{"level":3,"id":"3-4-mathematical-reasoning","text":"3.4 Mathematical Reasoning"},{"level":3,"id":"3-5-code-generation","text":"3.5 Code Generation"},{"level":3,"id":"3-6-massive-multitask-language-understanding","text":"3.6 Massive Multitask Language Understanding"},{"level":3,"id":"3-7-evolution-of-performance-during-training","text":"3.7 Evolution of Performance During Training"},{"level":2,"id":"4-instruction-finetuning","text":"4. Instruction Finetuning"},{"level":2,"id":"5-bias-toxicity-and-misinformation","text":"5. Bias, Toxicity and Misinformation"},{"level":3,"id":"5-1-real-toxicity-prompts","text":"5.1 RealToxicityPrompts"},{"level":3,"id":"5-2-crow-s-pairs","text":"5.2 CrowS-Pairs"},{"level":3,"id":"5-3-wino-gender","text":"5.3 WinoGender"},{"level":3,"id":"5-4-truthful-qa","text":"5.4 TruthfulQA"},{"level":2,"id":"6-carbon-footprint","text":"6. Carbon Footprint"},{"level":2,"id":"7-related-work","text":"7. Related Work"},{"level":2,"id":"8-conclusion","text":"8. Conclusion"},{"level":2,"id":"fl-a-mmlu-xxjg","text":"附录 A: MMLU 详细结果"},{"level":2,"id":"fl-b-syb","text":"附录 B: 术语表"},{"level":2,"id":"fl-c-hxgssy","text":"附录 C: 核心公式索引"},{"level":2,"id":"fl-d-mxpxdw","text":"附录 D: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/01-llama-1/01-llama-1-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/01-llama-1/01-llama-1-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">LLaMA: Open and Efficient Foundation Language Models 精译</h1>
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
