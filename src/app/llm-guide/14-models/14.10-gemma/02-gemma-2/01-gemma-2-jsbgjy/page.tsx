"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma-2 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Gemma 2: Improving Open Language Models at a Practical Size
原文链接: <a href="https://arxiv.org/abs/2408.00118">https://arxiv.org/abs/2408.00118</a>
发布日期: 2024-07-31
发布机构: Google DeepMind (Gemma Team)
模型规模: 2B / 9B / 27B
上下文窗口: 8192 tokens
训练数据: 2B 模型 2T tokens, 9B 模型 8T tokens, 27B 模型 13T tokens</p>
</blockquote>
<hr>
<h2 id="1-yy-introduction">1 引言 (Introduction)</h2>
<p>大语言模型(Large Language Models, LLMs)在语言理解、生成和推理方面展现出强大的能力. 规模扩展是近期进步的关键, 许多新能力只有在足够大的规模上才会涌现. 最新的大型模型不仅在推理基准测试上达到了前所未有的性能, 还展示了多模态和多语言能力, 甚至能够处理超过 100 万 token 的上下文长度.</p>
<p>小规模模型的性能也在迅速提升, 但这些收益主要来源于延长训练时间. 这种方法仅随数据集大小对数增长, 而最新的小模型需要多达 15T token 才能将最先进性能提升不到 1-2%.</p>
<p>然而, 这些持续的改进表明小模型仍然处于欠训练状态. 在本工作中, 我们探索了不单纯增加训练长度来提升小模型性能的替代方案. 一种解决方案是通过用更丰富的目标替代下一个 token 预测任务, 从而改善网络在每一步训练中接收到的信息质量.</p>
<p>具体而言, 我们将精力集中在知识蒸馏(Knowledge Distillation)上, 它用一个大模型计算出的潜在下一个 token 分布来替代每个 token 位置上看到的 one-hot 向量. 这种方法通常用于通过给予小模型更丰富的梯度来减少其训练时间. 而在本工作中, 我们转而使用蒸馏在大量 token 上进行训练, 以模拟超越可用 token 数量的训练效果. 具体地说, 我们使用一个大语言模型作为教师来训练小模型, 即分别在超过理论预测的计算最优数量 50 倍以上的 token 上训练 2B 和 9B 模型. 除了使用蒸馏训练的模型外, 我们还发布了一个为本工作从头训练的 27B 模型.</p>
<p>我们还利用了 Transformer 的几个已知改进, 即 Beltagy 等人(2020a)提出的全局注意力与局部注意力层交错, 以及 Ainslie 等人(2023)提出的分组查询注意力(GQA)机制.</p>
<p>总体而言, 与同等规模的开源模型相比, Gemma-2 显著推进了最先进的性能, 甚至在一些模型两倍以上的规模上仍具有竞争力, 涵盖多种自动化基准测试和人工评估. 示例领域包括问答、常识推理、数学与科学以及编程.</p>
<p>虽然我们对模型进行了全面的测试, 但这些测试无法覆盖 Gemma-2 可能被使用的所有应用场景. 鉴于此, 所有 Gemma-2 用户在部署或使用前都应针对其具体用例进行严格的安全测试.</p>
<p>在本技术报告中, 我们提供了模型概述, 包括架构、训练以及预训练和后训练的配方. 我们还提供了在多种定量和定性基准测试上的详细评估, 以及标准学术基准测试和人工偏好评估. 最后, 我们讨论了安全且负责任的部署方法, 并概述了 Gemma-2 的更广泛影响、其局限性及优势.</p>
<blockquote>
<p>译者注: Gemma-2 的核心定位非常清晰——它不是通过&quot;大力出奇迹&quot;的预训练来追赶大模型, 而是在小模型尺度上做&quot;精准手术&quot;. 知识蒸馏是其最大亮点: 传统观点认为小模型欠训练是因为数据不够, 而 Gemma-2 的洞察是——问题不在于数据量, 而在于每一步训练的信号质量. one-hot 标签的信息熵极低, 而教师模型的 soft target 包含了类别间的相似性信息(例如 &quot;cat&quot; 和 &quot;kitten&quot; 的 logits 应该相近). 用蒸馏目标训练, 相当于让小模型在每个 token 位置上都获得了一个&quot;更丰富、更平滑&quot;的学习信号. 值得注意的是, 他们训练的 token 数量&quot;超过计算最优量的 50 倍以上&quot;——这意味着他们有意让小模型进入极度过拟合训练数据的区域, 但蒸馏提供的正则化效果使其避免了传统过拟合的弊端.</p>
</blockquote>
<hr>
<h2 id="2-mxjg-model-architecture">2 模型架构 (Model Architecture)</h2>
<p>与之前的 Gemma 模型类似, Gemma-2 模型基于解码器-only 的 Transformer 架构. 我们在表 1 中总结了主要参数和架构选择.</p>
<table>
<thead>
<tr>
<th>Parameters</th>
<th>2B</th>
<th>9B</th>
<th>27B</th>
</tr>
</thead>
<tbody><tr>
<td>d_model</td>
<td>2304</td>
<td>3584</td>
<td>4608</td>
</tr>
<tr>
<td>Layers</td>
<td>26</td>
<td>42</td>
<td>46</td>
</tr>
<tr>
<td>Pre-norm</td>
<td>yes</td>
<td>yes</td>
<td>yes</td>
</tr>
<tr>
<td>Post-norm</td>
<td>yes</td>
<td>yes</td>
<td>yes</td>
</tr>
<tr>
<td>Non-linearity</td>
<td>GeGLU</td>
<td>GeGLU</td>
<td>GeGLU</td>
</tr>
<tr>
<td>Feedforward dim</td>
<td>18432</td>
<td>28672</td>
<td>73728</td>
</tr>
<tr>
<td>Head type</td>
<td>GQA</td>
<td>GQA</td>
<td>GQA</td>
</tr>
<tr>
<td>Num heads</td>
<td>8</td>
<td>16</td>
<td>32</td>
</tr>
<tr>
<td>Num KV heads</td>
<td>4</td>
<td>8</td>
<td>16</td>
</tr>
<tr>
<td>Head size</td>
<td>256</td>
<td>256</td>
<td>128</td>
</tr>
<tr>
<td>Global att. span</td>
<td>8192</td>
<td>8192</td>
<td>8192</td>
</tr>
<tr>
<td>Sliding window</td>
<td>4096</td>
<td>4096</td>
<td>4096</td>
</tr>
<tr>
<td>Vocab size</td>
<td>256128</td>
<td>256128</td>
<td>256128</td>
</tr>
<tr>
<td>Tied embedding</td>
<td>yes</td>
<td>yes</td>
<td>yes</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 主要模型参数和设计选择概述.</p>
</blockquote>
<p>部分架构元素与 Gemma 第一版模型相似, 即 8192 token 的上下文长度、Rotary Position Embeddings(RoPE, Su et al., 2021)的使用, 以及近似的 GeGLU 非线性(Shazeer, 2020). Gemma-1 和 Gemma-2 之间存在一些差异, 包括使用更深的网络. 我们在下面总结关键差异.</p>
<h3 id="2-1-jbhdckzylyqjzyl">2.1 局部滑动窗口注意力与全局注意力</h3>
<p>我们在每隔一层的局部滑动窗口注意力(Beltagy et al., 2020b, a)和全局注意力(Luong et al., 2015)之间交替. 局部注意力层的滑动窗口大小设置为 4096 token, 而全局注意力层的跨度设置为 8192 token.</p>
<blockquote>
<p>译者注: 局部-全局注意力交错是一个在计算效率和全局建模能力之间的经典权衡. 滑动窗口注意力将每个 token 的注意力范围限制在局部邻域内, 将自注意力的计算复杂度从 O(L^2) 降低到 O(L * w)(其中 w 是窗口大小). 对于长序列, 这可以显著减少计算量和 KV Cache 内存占用. 但完全局部注意力会丧失长距离依赖能力, 因此每隔一层插入全局注意力层来捕获远距离关系. Gemma-2 采用 1:1 的交错比例(一层局部、一层全局), 这是 Beltagy 等人提出的 Longformer 架构的核心思想. 与 Gemma-1 的全局注意力相比, 这种设计将推理时的 KV Cache 内存需求降低了约 50%(因为一半的层只需要存储局部 KV).</p>
</blockquote>
<h3 id="2-2-logit-soft-capping">2.2 Logit Soft-Capping</h3>
<p>我们在每个注意力层和最终层中对 logits 进行限制(Bello et al., 2016), 使得 logits 的值保持在 -soft_cap 和 +soft_cap 之间. 更具体地说, 我们使用以下函数对 logits 进行限制:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>logits</mtext><mo>←</mo><mtext>soft_cap</mtext><mo>∗</mo><mi>tanh</mi><mo>⁡</mo><mo stretchy="false">(</mo><mtext>logits</mtext><mi mathvariant="normal">/</mi><mtext>soft_cap</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{logits} \\leftarrow \\text{soft\\_cap} * \\tanh(\\text{logits} / \\text{soft\\_cap})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">logits</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0044em;vertical-align:-0.31em;"></span><span class="mord text"><span class="mord">soft_cap</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mop">tanh</span><span class="mopen">(</span><span class="mord text"><span class="mord">logits</span></span><span class="mord">/</span><span class="mord text"><span class="mord">soft_cap</span></span><span class="mclose">)</span></span></span></span></span><p>我们将自注意力层的 soft_cap 参数设置为 50.0, 最终层设置为 30.0.</p>
<blockquote>
<p>译者注: Logit soft-capping 是一个相对少见但有趣的技术细节. 它的动机是防止注意力机制中产生极端的 logits 值, 这在深层网络或长序列中可能导致数值不稳定或梯度爆炸. 通过 tanh 将 logits 压缩到一个有界区间内, 可以看作是一种&quot;软裁剪&quot;. 注意力层的 cap 值(50.0)比最终层(30.0)更宽松, 因为注意力内部需要保留一定的动态范围来区分不同位置的权重, 而输出层则更关注相对排名. 这种技术在 Gemini 系列中也有使用, 是 Google 的一个内部工程实践.</p>
</blockquote>
<h3 id="2-3-sy-rms-norm-d-post-norm-y-pre-norm">2.3 使用 RMSNorm 的 Post-Norm 与 Pre-Norm</h3>
<p>为了稳定训练, 我们使用 RMSNorm(Zhang and Sennrich, 2019)对每个 Transformer 子层(注意力层和前馈层)的输入和输出进行归一化.</p>
<h3 id="2-4-fzcxzyl-grouped-query-attention">2.4 分组查询注意力 (Grouped-Query Attention)</h3>
<p>我们使用 num_groups=2 的 GQA(Ainslie et al., 2023), 基于消融实验显示其在推理时速度提升的同时保持了下游性能.</p>
<blockquote>
<p>译者注: GQA 是 MHA(Multi-Head Attention) 向 MQA(Multi-Query Attention) 的折中方案. MQA 只保留单个 KV 头, 推理速度最快但质量下降明显; MHA 每个头独立 KV, 质量最好但显存占用最大. GQA 将 Query 头分成若干组, 每组共享一组 KV 头. Gemma-2 选择 num_groups=2, 意味着 8 个 Query 头对应 4 个 KV 头(2B 模型), 16 个 Query 头对应 8 个 KV 头(9B 模型). 这种 2:1 的压缩比是一个经过工程验证的甜点: 相比 MHA, KV Cache 内存减半; 相比 MQA, 质量损失微乎其微. 后续 Llama-3、Qwen2 等模型也都采用了 GQA.</p>
</blockquote>
<table>
<thead>
<tr>
<th>Model</th>
<th>Embedding Parameters</th>
<th>Non-embedding Parameters</th>
</tr>
</thead>
<tbody><tr>
<td>2B</td>
<td>590,118,912</td>
<td>2,024,517,888</td>
</tr>
<tr>
<td>9B</td>
<td>917,962,752</td>
<td>8,324,201,984</td>
</tr>
<tr>
<td>27B</td>
<td>1,180,237,824</td>
<td>26,047,480,320</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Gemma 模型的参数计数. 我们继承了大型 Gemini 词表(256k 条目), 该词表设计用于处理大量语言, 因此与仅限于一种或少数几种语言的模型相比, 嵌入参数计数更大.</p>
</blockquote>
<hr>
<h2 id="3-yxl-pre-training">3 预训练 (Pre-training)</h2>
<p>我们简要概述与 Gemma-1 不同的预训练部分.</p>
<h3 id="3-1-xlsj">3.1 训练数据</h3>
<p>我们在主要由英文数据组成的 13T token 上训练 Gemma-2 27B 模型, 9B 模型在 8T token 上训练, 2B 模型在 2T token 上训练. 这些 token 来自多种数据源, 包括网页文档、代码和科学文章. 我们的模型不是多模态的, 也没有专门为最先进的多语言能力而训练. 最终的数据混合比例通过与 Gemini 1.0 类似的方法(Gemini Team, 2023)通过消融实验确定.</p>
<p><strong>Tokenizer.</strong> 我们使用与 Gemma-1 和 Gemini 相同的 tokenizer: 一个带有分割数字、保留空白和字节级编码的 SentencePiece tokenizer(Kudo and Richardson, 2018). 得到的词表有 256k 条目.</p>
<p><strong>Filtering.</strong> 我们使用与 Gemma-1 相同的数据过滤技术. 具体而言, 我们过滤预训练数据集以减少产生不需要或不安全话语的风险, 过滤掉某些个人信息或其他敏感数据, 从预训练数据混合中去除污染评估集, 并通过最小化敏感输出的扩散来降低背诵的风险.</p>
<table>
<thead>
<tr>
<th>Model</th>
<th>Type</th>
<th>#Chips</th>
<th>Data Shards</th>
<th>Model Shards</th>
</tr>
</thead>
<tbody><tr>
<td>2B</td>
<td>TPUv5e</td>
<td>512</td>
<td>512</td>
<td>1</td>
</tr>
<tr>
<td>9B</td>
<td>TPUv4</td>
<td>4096</td>
<td>1024</td>
<td>4</td>
</tr>
<tr>
<td>27B</td>
<td>TPUv5p</td>
<td>6144</td>
<td>768</td>
<td>8</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 训练基础设施及分片配置.</p>
</blockquote>
<h3 id="3-2-zszl-knowledge-distillation">3.2 知识蒸馏 (Knowledge Distillation)</h3>
<p>给定一个用作教师的大模型, 我们通过蒸馏教师对每个 token x 给定其上下文 x_c 的概率来学习小模型, 即 P_T(x | x_c). 更精确地说, 我们最小化教师概率与学生概率之间的负对数似然:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><munder><mrow><mi>min</mi><mo>⁡</mo></mrow><msub><mi>P</mi><mi>S</mi></msub></munder><munder><mo>∑</mo><mi>x</mi></munder><mo>−</mo><msub><mi>P</mi><mi>T</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mi mathvariant="normal">∣</mi><msub><mi>x</mi><mi>c</mi></msub><mo stretchy="false">)</mo><mi>log</mi><mo>⁡</mo><msub><mi>P</mi><mi>S</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mi mathvariant="normal">∣</mi><msub><mi>x</mi><mi>c</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\min_{P_S} \\sum_{x} -P_T(x | x_c) \\log P_S(x | x_c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.3em;vertical-align:-1.25em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6679em;"><span style="top:-2.3557em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:-0.1389em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">min</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8446em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.9em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.25em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>其中 P_S 是学生的参数化概率. 注意, 知识蒸馏也在 Gemini 1.5(Gemini Team, 2024)中使用过.</p>
<blockquote>
<p>译者注: 这里的蒸馏公式是标准的 KL 散度最小化, 但有一个关键细节: Gemma-2 使用完整的教师分布 P_T, 而不是仅使用 top-k 或采样后的子集. 这意味着学生必须从教师的 soft target 中学习完整的概率分布. 对于 256k 词表的每个位置, 计算完整的 KL 散度在计算上是昂贵的——教师需要为每个 token 输出完整的 logits 向量, 学生也需要计算完整的 softmax. 这就是为什么 Gemma-2 只在 2B 和 9B 模型上使用蒸馏, 而 27B 模型是&quot;从头训练&quot;的: 27B 作为教师模型, 其自身的蒸馏成本已经很高, 再为更大的模型做蒸馏的收益递减. 此外, 论文提到他们训练的 token 数量&quot;超过计算最优量的 50 倍以上&quot;——根据 Chinchilla 定律(Hoffmann et al., 2022), 2B 模型的计算最优训练量约为 40B token, 而 Gemma-2 2B 训练了 2T token, 确实是约 50 倍. 这本质上是在用蒸馏来&quot;模拟&quot;一个更大的数据集: 教师提供的软标签可以看作是对真实数据分布的一种更平滑、更丰富的近似.</p>
</blockquote>
<h3 id="3-3-jsjcss">3.3 计算基础设施</h3>
<p>我们使用 TPUv4、TPUv5e 和 TPUv5p 训练我们的模型, 如表 3 所述.</p>
<p>对于 2B 模型, 我们在 2x16x16 配置的 TPUv5e 上训练, 共 512 个芯片, 512 路数据复制和 1 路模型分片.</p>
<p>对于 9B 模型, 我们在 8x16x32 配置的 TPUv4 上训练, 共 4096 个芯片, 1024 路数据复制和 4 路模型分片.</p>
<p>对于 27B 模型, 我们在 8x24x32 配置的 TPUv5p 上训练, 共 6144 个芯片, 768 路数据复制和 8 路模型分片.</p>
<p>优化器状态进一步使用类似 ZeRO-3(Ren et al., 2021)的技术进行分片. 对于超过单个 pod 的规模, 我们使用 Barham 等人(2022)的 Pathways 方法通过数据中心网络执行数据副本间的规约. 我们还使用 Jax(Roberts et al., 2023)和 Pathways(Barham et al., 2022)的&quot;单控制器&quot;编程范式. 与 Gemma-1 一样, 我们使用 GSPMD partitioner(Xu et al., 2021)进行训练步骤计算, 并使用 MegaScale XLA 编译器(XLA, 2019).</p>
<blockquote>
<p>译者注: Gemma-2 的训练基础设施揭示了几个工程细节. 首先, 数据分片数(512/1024/768)远大于模型分片数(1/4/8), 说明主要的并行维度是数据并行, 而非模型并行. 这与模型规模相对较小(最大 27B)有关——27B 参数在 BF16 下约 54GB, 可以轻松放入单个 TPU pod 的显存中. 其次, 使用 Pathways 进行跨 pod 通信意味着 Google 使用了其内部的数据中心网络而非 NVLink 来连接 TPU pod. 最后, 优化器状态使用 ZeRO-3 分片进一步降低了每个设备的显存占用. 这些设计选择表明 Gemma-2 的训练优化重点在于吞吐量而非超大模型的扩展性——这与 DeepSeek-V3 的极致工程优化形成对比, 后者需要处理 671B 参数和跨节点的 EP/TP/PP 复杂调度.</p>
</blockquote>
<h3 id="3-4-tzj">3.4 碳足迹</h3>
<p>我们估计 Gemma 模型预训练的碳排放量为 1247.61 tCO2eq. 与 Gemma-1(Gemma Team, 2024)一样, 该值基于直接从我们的 TPU 数据中心报告的每小时能源使用量计算, 并缩放以考虑创建和维护数据中心所消耗的额外能源. 重要的是, Google 数据中心通过能源效率、可再生能源购买和碳抵消的组合实现了碳中和. 这种碳中和适用于我们的实验和运行它们的机器.</p>
<hr>
<h2 id="4-hxl-post-training">4 后训练 (Post-Training)</h2>
<p>对于后训练, 我们将预训练模型微调为指令微调模型. 首先, 我们在混合了纯文本、纯英文的合成和人工生成的提示-响应对上应用监督微调(Supervised Fine-Tuning, SFT). 然后, 我们在这些模型之上应用 RLHF, 奖励模型在标注的纯英文偏好数据上训练, 策略基于与 SFT 阶段相同的提示. 最后, 我们对每个阶段后获得的模型进行平均以提高整体性能. 最终的数据混合比例和后训练配方(包括调整后的超参数)是在提高有用性的同时最小化与安全性和幻觉相关的模型危害的基础上选择的.</p>
<p>我们从 Gemma-1.1 扩展了后训练数据, 混合了内部和外部公开数据. 特别地, 我们使用 LMSYS-chat-1M(Zheng et al., 2023)的提示, 但不使用其答案. 我们所有的数据都经过下面描述的过滤阶段.</p>
<p><strong>监督微调 (SFT).</strong> 我们在合成和真实提示以及主要由教师(即更大的模型)合成生成的响应上运行行为克隆. 我们还在学生分布上运行来自教师的蒸馏(Agarwal et al., 2024; Gu et al., 2024).</p>
<table>
<thead>
<tr>
<th>Context</th>
<th>Relevant Token</th>
</tr>
</thead>
<tbody><tr>
<td>User turn</td>
<td>user</td>
</tr>
<tr>
<td>Model turn</td>
<td>model</td>
</tr>
<tr>
<td>Start of conversation turn</td>
<td><start_of_turn></td>
</tr>
<tr>
<td>End of conversation turn</td>
<td><end_of_turn></td>
</tr>
<tr>
<td>Beginning of sequence</td>
<td><bos></td>
</tr>
<tr>
<td>End of sequence</td>
<td><eos></td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Gemma 模型使用的相关格式化控制 token.</p>
</blockquote>
<p><strong>基于人类反馈的强化学习 (RLHF).</strong> 我们使用与 Gemma-1.1(Gemma Team, 2024)类似的 RLHF 算法, 但使用了一个不同的奖励模型, 该奖励模型比策略模型大一个数量级. 新的奖励模型也更侧重于对话能力, 特别是多轮对话.</p>
<p><strong>模型融合 (Model merging).</strong> 我们对使用不同超参数运行管道获得的不同模型进行平均(Ramé et al., 2024).</p>
<p><strong>数据过滤.</strong> 在使用合成数据时, 我们运行多个过滤阶段以去除显示某些个人信息、不安全或有毒模型输出、错误自我识别数据以及重复示例的数据. 遵循 Gemini 的做法, 我们发现包含鼓励更好的上下文归因、对冲和拒绝的数据子集可以提高事实性指标上的性能, 而不会降低模型在其他指标上的性能.</p>
<p><strong>格式化.</strong> Gemma-2 模型使用与 Gemma-1 模型相同的控制 token 进行微调, 如表 4 详细说明, 但使用不同的格式化模式. 参见表 5 中的对话示例. 注意, 模型显式地使用 <end_of_turn><eos> token 结束生成, 而之前它只生成 <eos>. 有关此格式化结构背后的动机, 参见 Gemma-1.</p>
<table>
<thead>
<tr>
<th></th>
<th></th>
</tr>
</thead>
<tbody><tr>
<td><strong>First turn</strong></td>
<td></td>
</tr>
<tr>
<td>User:</td>
<td><start_of_turn>user<br>Knock knock.<end_of_turn></td>
</tr>
<tr>
<td></td>
<td><start_of_turn>model</td>
</tr>
<tr>
<td>Model:</td>
<td>Who&#39;s there?<end_of_turn><eos></td>
</tr>
<tr>
<td><strong>Second turn</strong></td>
<td></td>
</tr>
<tr>
<td>User:</td>
<td><start_of_turn>user<br>Knock knock.<end_of_turn></td>
</tr>
<tr>
<td></td>
<td><start_of_turn>model</td>
</tr>
<tr>
<td>Model:</td>
<td>Who&#39;s there?<end_of_turn></td>
</tr>
<tr>
<td>User:</td>
<td><start_of_turn>user<br>Gemma.<end_of_turn></td>
</tr>
<tr>
<td></td>
<td><start_of_turn>model</td>
</tr>
<tr>
<td>Model:</td>
<td>Gemma who?<end_of_turn><eos></td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: 用户和模型控制 token 的对话示例. 要进行多轮对话, 移除模型输出的 <eos>, 添加回用户回合的常规控制 token, 并继续下一轮的聊天模板.</p>
</blockquote>
<blockquote>
<p>译者注: Gemma-2 的后训练配方有几个值得注意的工程选择. 第一, 奖励模型&quot;比策略模型大一个数量级&quot;——这在 RLHF 中并不常见, 通常奖励模型与策略模型规模相当或略小. 更大的奖励模型意味着更准确的偏好判断, 但也增加了训练成本. 第二, 模型融合(Model Merging)被用于结合不同超参数下的训练结果, 这是一种低成本集成方法: 不是训练多个完整模型然后投票, 而是直接对权重进行线性插值. Ramé 等人的研究表明, 在权重空间中相邻的局部最优解可以通过简单平均获得更好的泛化性能. 第三, 数据过滤明确针对&quot;错误自我识别数据&quot;——这是指模型错误地声称自己是另一个模型(如 GPT-4)的数据, 在早期的开源模型中这是一个常见问题.</p>
</blockquote>
<hr>
<h2 id="5-xrsy-ablations">5 消融实验 (Ablations)</h2>
<p>在本节中, 我们关注本工作的主要发现, 即知识蒸馏对小语言模型的影响.</p>
<table>
<thead>
<tr>
<th></th>
<th>from scratch</th>
<th>distilled</th>
</tr>
</thead>
<tbody><tr>
<td>Average (3 bench.)</td>
<td>60.3</td>
<td>67.7</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: 在 500B token 上训练的 2B 模型, 分别从头训练和使用 7B 模型蒸馏的对比.</p>
</blockquote>
<p><strong>蒸馏与从头训练对比.</strong> 在表 6 中, 我们展示了从更大的模型蒸馏相比从头训练可以提高性能. 注意, 500B 是 2B 模型计算最优 token 数量的 10 倍. 我们从 7B 模型蒸馏以保持与最终目标(从 27B 蒸馏到 9B)相似的比率.</p>
<table>
<thead>
<tr>
<th></th>
<th>200M</th>
<th>400M</th>
<th>1B</th>
</tr>
</thead>
<tbody><tr>
<td>from scratch</td>
<td>23</td>
<td>19</td>
<td>17</td>
</tr>
<tr>
<td>distilled (7B)</td>
<td>21</td>
<td>17</td>
<td>15</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: 使用或不使用蒸馏训练的不同规模模型在验证集上测量的困惑度. 教师有 7B 参数.</p>
</blockquote>
<p><strong>蒸馏对模型规模的影响.</strong> 在表 7 中, 我们测量了随着模型规模增加的蒸馏影响. 我们观察到, 随着模型规模扩展, 增益仍然存在. 在此消融实验中, 我们将教师的大小保持在 7B, 并训练更小的模型以模拟最终教师和学生规模之间的相同差距.</p>
<table>
<thead>
<tr>
<th></th>
<th>MHA</th>
<th>GQA</th>
</tr>
</thead>
<tbody><tr>
<td>Average (4 bench.)</td>
<td>50.3</td>
<td>50.8</td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: 在 9B 模型上用 GQA 替换 Multi-Head Attention(MHA)的影响, 在 4 个基准测试上取平均.</p>
</blockquote>
<p><strong>GQA 与 MHA 对比.</strong> 在表 8 中, 我们比较了 9B 模型的两个实例, 分别使用 MHA 或 GQA. 我们观察到在两个模型之间, 在几个基准测试上测量的总体性能变化很小. 我们选择 GQA, 因为它需要更少的参数并且推理速度更快.</p>
<table>
<thead>
<tr>
<th></th>
<th>Wide</th>
<th>Deep</th>
</tr>
</thead>
<tbody><tr>
<td>Average (4 bench.)</td>
<td>50.8</td>
<td>52.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 9: 宽与深的 9B 模型. 在 4 个基准测试上的性能, 越高越好.</p>
</blockquote>
<p><strong>宽与深对比.</strong> 在表 9 中, 我们展示了更深的 9B 网络略优于更宽的 9B 网络(参数数量相同). 尽管差距很小, 但在基准测试之间是一致的, 这证明了转向更深架构的合理性.</p>
<table>
<thead>
<tr>
<th>sliding window</th>
<th>4096</th>
<th>2048</th>
<th>1024</th>
</tr>
</thead>
<tbody><tr>
<td>perplexity (val. set)</td>
<td>1.63</td>
<td>1.63</td>
<td>1.64</td>
</tr>
</tbody></table>
<blockquote>
<p>表 10: 在推理时改变 9B 模型局部注意力层滑动窗口大小的影响.</p>
</blockquote>
<p><strong>改变滑动窗口大小.</strong> 在表 10 中, 我们展示了可以在推理时改变模型局部注意力层的滑动窗口大小, 对困惑度影响适中. 因此, 调整滑动窗口的大小可以作为轻微推理速度提升的杠杆.</p>
<p><strong>格式化的影响.</strong> 我们在 MMLU 上测量了提示/评估格式化变化的性能方差. 表 11 展示了 12 种格式化/评估组合的标准差, 作为不期望的性能可变性的代理. Gemma-2B 模型比更大的模型稍微不那么鲁棒. 值得注意的是, Mistral-7B 比我们的模型显著更不稳定.</p>
<table>
<thead>
<tr>
<th></th>
<th>Standard Deviation</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 1 2B</td>
<td>1.5</td>
</tr>
<tr>
<td>Gemma 2 2B</td>
<td>2.1</td>
</tr>
<tr>
<td>Mistral 7B</td>
<td>6.9</td>
</tr>
<tr>
<td>Gemma 1 7B</td>
<td>0.7</td>
</tr>
<tr>
<td>Gemma 2 9B</td>
<td>0.9</td>
</tr>
<tr>
<td>Gemma 2 27B</td>
<td>1.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 11: 12 种格式化和评估组合的 MMLU 分数标准差.</p>
</blockquote>
<hr>
<h2 id="6-pg-evaluation">6 评估 (Evaluation)</h2>
<p>在本节中, 我们在一系列自动化基准测试和人工评估中对预训练模型和 IT 模型进行评估, 涵盖多种领域. 我们还报告了具有宽松许可证的相似规模模型的性能, 或其他人报告的性能. 注意, 我们考虑总参数量而非激活参数量, 因为总内存使用量通常是限制开源模型在标准设备上使用的因素.</p>
<h3 id="6-1-yxlpg">6.1 预训练评估</h3>
<h4 id="pg-27b-mx">评估 27B 模型</h4>
<p>在这组评估中, 我们评估在没有蒸馏的情况下在 13T token 上训练的 27B 模型的性能. 我们在表 12 中报告结果, 将其与类似规模的模型 Qwen1.5 34B(Team, 2024)以及大 2.5 倍的模型 LLaMA-3 70B 在 HuggingFace 评估套件上进行比较. 我们根据这些模型在 HuggingFace 排行榜上的排名选择了它们.</p>
<p>总体而言, 我们观察到我们的模型在其规模类别中表现最佳, 甚至与训练时间更长的更大模型具有竞争力. 尽管如此, 以类似方式训练的模型的性能仅随规模对数改善, 因此, 我们的模型可能与 LLaMA-3 模型处于相同的帕累托曲线上. 然而, 这些差异如何影响最终 IT 模型的质量尚不清楚.</p>
<table>
<thead>
<tr>
<th></th>
<th>LLaMA-3 70B</th>
<th>Qwen1.5 32B</th>
<th>Gemma-2 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>79.2</td>
<td>74.3</td>
<td>75.2</td>
</tr>
<tr>
<td>GSM8K</td>
<td>76.9</td>
<td>61.1</td>
<td>74.0</td>
</tr>
<tr>
<td>ARC-c</td>
<td>68.8</td>
<td>63.6</td>
<td>71.4</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>88.0</td>
<td>85.0</td>
<td>86.4</td>
</tr>
<tr>
<td>Winogrande</td>
<td>85.3</td>
<td>81.5</td>
<td>83.7</td>
</tr>
</tbody></table>
<blockquote>
<p>表 12: 在 HuggingFace 基准测试上, 我们将 27B 模型与具有竞争力的开源模型 Qwen1.5 32B(规模相似)进行比较. 我们还报告了 LLaMA-3 70B 的性能作为参考. 注意, 我们的模型优于 Qwen1.5 32B, 尽管规模小 2.5 倍且训练数据少 2/3, 但仅比 LLaMA-3 70B 低几个百分点.</p>
</blockquote>
<h4 id="pg-2b-h-9b-mx">评估 2B 和 9B 模型</h4>
<table>
<thead>
<tr>
<th></th>
<th>Gemma-1 2B</th>
<th>Gemma-2 2B</th>
<th>Mistral 7B</th>
<th>LLaMA-3 8B</th>
<th>Gemma-1 7B</th>
<th>Gemma-2 9B</th>
<th>Gemma-2 27B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>42.3</td>
<td>52.2</td>
<td>62.5</td>
<td>66.6</td>
<td>64.4</td>
<td>71.3</td>
<td>75.2</td>
</tr>
<tr>
<td>ARC-C</td>
<td>48.5</td>
<td>55.7</td>
<td>60.5</td>
<td>59.2</td>
<td>61.1</td>
<td>68.4</td>
<td>71.4</td>
</tr>
<tr>
<td>GSM8K</td>
<td>15.1</td>
<td>24.3</td>
<td>39.6</td>
<td>45.7</td>
<td>51.8</td>
<td>68.6</td>
<td>74.0</td>
</tr>
<tr>
<td>AGIEval</td>
<td>24.2</td>
<td>31.5</td>
<td>44.0</td>
<td>45.9</td>
<td>44.9</td>
<td>52.8</td>
<td>55.1</td>
</tr>
<tr>
<td>DROP</td>
<td>48.5</td>
<td>51.2</td>
<td>63.8</td>
<td>58.4</td>
<td>56.3</td>
<td>69.4</td>
<td>74.2</td>
</tr>
<tr>
<td>BBH</td>
<td>35.2</td>
<td>41.9</td>
<td>56.0</td>
<td>61.1</td>
<td>59.0</td>
<td>68.2</td>
<td>74.9</td>
</tr>
<tr>
<td>Winogrande</td>
<td>66.8</td>
<td>71.3</td>
<td>78.5</td>
<td>76.1</td>
<td>79.0</td>
<td>80.6</td>
<td>83.7</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>71.7</td>
<td>72.9</td>
<td>83.0</td>
<td>82.0</td>
<td>82.3</td>
<td>81.9</td>
<td>86.4</td>
</tr>
<tr>
<td>MATH</td>
<td>11.8</td>
<td>16.0</td>
<td>12.7</td>
<td>-</td>
<td>24.3</td>
<td>36.6</td>
<td>42.3</td>
</tr>
<tr>
<td>ARC-e</td>
<td>73.2</td>
<td>80.6</td>
<td>80.5</td>
<td>-</td>
<td>81.5</td>
<td>88.0</td>
<td>88.6</td>
</tr>
<tr>
<td>PIQA</td>
<td>77.3</td>
<td>78.4</td>
<td>82.2</td>
<td>-</td>
<td>81.2</td>
<td>81.7</td>
<td>83.2</td>
</tr>
<tr>
<td>SIQA</td>
<td>49.7</td>
<td>51.9</td>
<td>47.0</td>
<td>-</td>
<td>51.8</td>
<td>53.4</td>
<td>53.7</td>
</tr>
<tr>
<td>Boolq</td>
<td>69.4</td>
<td>72.7</td>
<td>83.2</td>
<td>-</td>
<td>83.2</td>
<td>84.2</td>
<td>84.8</td>
</tr>
<tr>
<td>TriviaQA</td>
<td>53.2</td>
<td>60.4</td>
<td>62.5</td>
<td>-</td>
<td>63.4</td>
<td>76.6</td>
<td>83.7</td>
</tr>
<tr>
<td>NQ</td>
<td>12.5</td>
<td>17.1</td>
<td>23.2</td>
<td>-</td>
<td>23.0</td>
<td>29.2</td>
<td>34.5</td>
</tr>
<tr>
<td>HumanEval</td>
<td>22.0</td>
<td>20.1</td>
<td>26.2</td>
<td>-</td>
<td>32.3</td>
<td>40.2</td>
<td>51.8</td>
</tr>
<tr>
<td>MBPP</td>
<td>29.2</td>
<td>30.2</td>
<td>40.2</td>
<td>-</td>
<td>44.4</td>
<td>52.4</td>
<td>62.6</td>
</tr>
<tr>
<td>Average (8)</td>
<td>44.0</td>
<td>50.0</td>
<td>61.0</td>
<td>61.9</td>
<td>62.4</td>
<td>70.2</td>
<td>74.4</td>
</tr>
<tr>
<td>Average (all)</td>
<td>44.2</td>
<td>48.7</td>
<td>55.6</td>
<td>-</td>
<td>57.9</td>
<td>64.9</td>
<td>69.4</td>
</tr>
</tbody></table>
<blockquote>
<p>表 13: 2B 到 9B 参数范围模型的对比, 以及我们的 27B 模型, 在多种基准测试上的表现. 我们报告了可以与 LLaMA-3 比较的 8 个基准测试的平均性能, 以及所有基准测试的平均性能(all). LLaMA-3 8B 的数字来自 HuggingFace 排行榜或其博客.</p>
</blockquote>
<p>在这组实验中, 我们将使用蒸馏训练的新 2B 和 9B 模型与我们的先前模型以及 Gemma Team(2024)中的几个标准开源模型进行比较.</p>
<p>总体而言, 我们观察到与先前版本相比, 我们的模型取得了巨大改进, 9B 模型在某些基准测试上提高了多达 10%. 两个 2B 模型使用了相似数量的 token 训练(Gemma-2 为 2T, Gemma-1 为 3T), 我们仍然观察到新模型的显著改进. 这证实了即使在相同数量的 token 上训练, 蒸馏也能显著提高模型质量.</p>
<blockquote>
<p>译者注: 表 13 的数据非常直观地展示了蒸馏的效果. Gemma-2 2B 在 MMLU 上达到 52.2%, 相比 Gemma-1 2B 的 42.3% 提升了近 10 个百分点. 更惊人的是, Gemma-2 9B 的 GSM8K 达到 68.6%, 远超 Gemma-1 7B 的 51.8%. 这些提升不能简单地归因于训练数据量的增加(2B 模型甚至训练了更少的 token). 蒸馏的价值在于: 它让小模型直接继承了教师模型在推理链上的优化——教师模型在数学问题上的中间推理步骤会通过 soft target 传递给学生. 此外, Gemma-2 27B 的性能与其规模相比非常出色: 75.2% 的 MMLU 接近 LLaMA-3 70B 的 79.2%, 尽管参数量不到后者的 40%. 这说明 Google 在数据质量和架构优化上的投入获得了很好的回报.</p>
</blockquote>
<h3 id="6-2-hxlpg">6.2 后训练评估</h3>
<p>在本节中, 我们在一组人工评估和标准学术基准测试上评估我们的 IT 模型. Gemma-2 模型推动了后训练开源权重模型的前沿, 在 LMSYS Chatbot Arena(Chiang et al., 2024)上树立了新的最先进水平.</p>
<h4 id="lmsys-chatbot-arena">LMSYS Chatbot Arena</h4>
<p>Gemma-2 指令微调模型在 Chatbot Arena 上通过人工评分员与其他最先进模型进行盲测对比评估. 我们在表 14 中报告 Elo 分数. Gemma-2 2B、9B 和 27B 强烈优于所有其他同等参数范围的开源模型, 特别是: Gemma-27B(Elo 1218)排名高于 Llama-3 70B(Elo 1206), Gemma-9B(Elo 1187)与 GPT-4-0314(Elo 1186)相当, Gemma-2B(Elo 1126)排名高于 GPT-3.5-Turbo-0613(Elo 1116).</p>
<table>
<thead>
<tr>
<th>Model</th>
<th>Elo</th>
<th>95% CI</th>
<th>Open</th>
</tr>
</thead>
<tbody><tr>
<td>gpt-4o-2024-05-13</td>
<td>1286</td>
<td>+2 / -3</td>
<td>-</td>
</tr>
<tr>
<td>gpt-4o-mini-2024-07-18</td>
<td>1279</td>
<td>+5 / -4</td>
<td>-</td>
</tr>
<tr>
<td>claude-3-5-sonnet</td>
<td>1271</td>
<td>+3 / -4</td>
<td>-</td>
</tr>
<tr>
<td>gemini-advanced-0514</td>
<td>1266</td>
<td>+2 / -3</td>
<td>-</td>
</tr>
<tr>
<td>llama-3.1-405b-instruct</td>
<td>1262</td>
<td>+8 / -7</td>
<td>+</td>
</tr>
<tr>
<td>gemini-1.5-pro-api-0514</td>
<td>1261</td>
<td>+2 / -3</td>
<td>-</td>
</tr>
<tr>
<td>gemini-1.5-pro-api-0409</td>
<td>1257</td>
<td>+3 / -3</td>
<td>-</td>
</tr>
<tr>
<td>gpt-4-turbo-2024-04-09</td>
<td>1256</td>
<td>+2 / -3</td>
<td>-</td>
</tr>
<tr>
<td>gpt-4-1106-preview</td>
<td>1250</td>
<td>+3 / -3</td>
<td>-</td>
</tr>
<tr>
<td>claude-3-opus-20240229</td>
<td>1248</td>
<td>+2 / -2</td>
<td>-</td>
</tr>
<tr>
<td>athene-70b-0725</td>
<td>1245</td>
<td>+8 / -6</td>
<td>+</td>
</tr>
<tr>
<td>gpt-4-0125-preview</td>
<td>1245</td>
<td>+2 / -2</td>
<td>-</td>
</tr>
<tr>
<td>llama-3.1-70b-instruct</td>
<td>1244</td>
<td>+8 / -9</td>
<td>+</td>
</tr>
<tr>
<td>yi-large-preview</td>
<td>1239</td>
<td>+3 / -3</td>
<td>-</td>
</tr>
<tr>
<td>gemini-1.5-flash-api-0514</td>
<td>1227</td>
<td>+3 / -3</td>
<td>-</td>
</tr>
<tr>
<td>deepseek-v2-api-0628</td>
<td>1220</td>
<td>+6 / -6</td>
<td>+</td>
</tr>
<tr>
<td>gemma-2-27b-it</td>
<td>1218</td>
<td>+4 / -3</td>
<td>+</td>
</tr>
<tr>
<td>yi-large</td>
<td>1212</td>
<td>+4 / -5</td>
<td>-</td>
</tr>
<tr>
<td>nemotron-4-340b-instruct</td>
<td>1209</td>
<td>+3 / -4</td>
<td>+</td>
</tr>
<tr>
<td>bard-jan-24-gemini-pro</td>
<td>1208</td>
<td>+5 / -7</td>
<td>-</td>
</tr>
<tr>
<td>glm-4-0520</td>
<td>1206</td>
<td>+3 / -5</td>
<td>-</td>
</tr>
<tr>
<td>llama-3-70b-instruct</td>
<td>1206</td>
<td>+2 / -2</td>
<td>+</td>
</tr>
<tr>
<td>claude-3-sonnet</td>
<td>1200</td>
<td>+2 / -2</td>
<td>-</td>
</tr>
<tr>
<td>reka-core-20240501</td>
<td>1199</td>
<td>+2 / -2</td>
<td>-</td>
</tr>
<tr>
<td>command-r-plus</td>
<td>1189</td>
<td>+2 / -2</td>
<td>+</td>
</tr>
<tr>
<td>gemma-2-9b-it</td>
<td>1187</td>
<td>+3 / -5</td>
<td>+</td>
</tr>
<tr>
<td>qwen2-72b-instruct</td>
<td>1187</td>
<td>+3 / -3</td>
<td>+</td>
</tr>
<tr>
<td>gpt-4-0314</td>
<td>1186</td>
<td>+2 / -3</td>
<td>-</td>
</tr>
<tr>
<td>qwen1.5-110b-chat</td>
<td>1161</td>
<td>+3 / -3</td>
<td>+</td>
</tr>
<tr>
<td>mistral-large-2402</td>
<td>1157</td>
<td>+3 / -3</td>
<td>-</td>
</tr>
<tr>
<td>yi-1.5-34b-chat</td>
<td>1157</td>
<td>+4 / -5</td>
<td>+</td>
</tr>
<tr>
<td>reka-flash-21b-20240226</td>
<td>1155</td>
<td>+4 / -4</td>
<td>-</td>
</tr>
<tr>
<td>llama-3-8b-instruct</td>
<td>1151</td>
<td>+2 / -3</td>
<td>+</td>
</tr>
<tr>
<td>command-r</td>
<td>1148</td>
<td>+3 / -3</td>
<td>+</td>
</tr>
<tr>
<td>claude-1</td>
<td>1148</td>
<td>+4 / -4</td>
<td>-</td>
</tr>
<tr>
<td>mistral-medium</td>
<td>1147</td>
<td>+4 / -4</td>
<td>-</td>
</tr>
<tr>
<td>reka-flash-21b-20240226</td>
<td>1147</td>
<td>+3 / -4</td>
<td>-</td>
</tr>
<tr>
<td>qwen1.5-72b-chat</td>
<td>1147</td>
<td>+4 / -4</td>
<td>+</td>
</tr>
<tr>
<td>mixtral-8x22b-instruct-v0.1</td>
<td>1145</td>
<td>+2 / -3</td>
<td>+</td>
</tr>
<tr>
<td>claude-2.0</td>
<td>1131</td>
<td>+4 / -6</td>
<td>-</td>
</tr>
<tr>
<td>gemini-pro-dev-api</td>
<td>1131</td>
<td>+4 / -3</td>
<td>-</td>
</tr>
<tr>
<td>zephyr-orpo-141b</td>
<td>1127</td>
<td>+10 / -6</td>
<td>+</td>
</tr>
<tr>
<td>gemma-2-2b-it</td>
<td>1126</td>
<td>+10 / -10</td>
<td>+</td>
</tr>
<tr>
<td>qwen1.5-32b-chat</td>
<td>1125</td>
<td>+3 / -3</td>
<td>+</td>
</tr>
<tr>
<td>mistral-next</td>
<td>1124</td>
<td>+5 / -5</td>
<td>-</td>
</tr>
<tr>
<td>phi-3-medium-4k-instruct</td>
<td>1122</td>
<td>+4 / -4</td>
<td>+</td>
</tr>
<tr>
<td>starling-lm-7b-beta</td>
<td>1118</td>
<td>+4 / -5</td>
<td>+</td>
</tr>
<tr>
<td>claude-2.1</td>
<td>1118</td>
<td>+3 / -4</td>
<td>-</td>
</tr>
<tr>
<td>gpt-3.5-turbo-0613</td>
<td>1116</td>
<td>+3 / -4</td>
<td>-</td>
</tr>
<tr>
<td>mixtral-8x7b-instruct-v0.1</td>
<td>1114</td>
<td>+0 / -0</td>
<td>-</td>
</tr>
</tbody></table>
<blockquote>
<p>表 14: Gemma-2 指令微调模型在 Chatbot Arena 上的评估. 模型通过人工评分员的盲测并排对比进行评估. 每个模型根据 Elo 评分系统获得一个分数.</p>
</blockquote>
<blockquote>
<p>译者注: Chatbot Arena 的 Elo 排名是本文最有说服力的结果之一. Gemma-2 27B IT(Elo 1218)超过了 Llama-3 70B IT(Elo 1206), 这意味着一个参数量不到 40% 的模型在人工盲测中表现更好. 更令人惊讶的是 Gemma-2 9B IT(Elo 1187)与早期 GPT-4(Elo 1186)相当——一个 9B 的开源模型追平了 2023 年初的闭源旗舰. 这验证了蒸馏+后训练配方在小模型上的威力. 然而需要注意, Chatbot Arena 评估的是对话质量和指令遵循能力, 而非纯推理能力; 而且 Elo 分数的差距(如 1218 vs 1206)在统计上可能不显著(考虑置信区间). 但即便如此, 这种性价比优势是真实的.</p>
</blockquote>
<h4 id="rgphpg">人工偏好评估</h4>
<p>我们还将 Gemma IT 模型提交进行并排人工评估研究(独立于 Chatbot Arena). 我们使用针对安全性和指令遵循(IF)的单轮提示的保留集合. 我们以 gpt4o-2024-05-13 作为基线模型, 并观察到与旧的 Gemma-1.1 7B 模型相比, 胜率和偏好分数有大幅提升. 我们将安全性报告为对 GPT4o 的胜负比, 将单面指令遵循分数报告为所有指令都被遵循的提示比例. 特别地, 我们发现无论规模如何, Gemma-2 模型在保留的安全性提示集上产生的输出比 GPT4o 更安全、更合适.</p>
<table>
<thead>
<tr>
<th>Model</th>
<th>Instruction Following</th>
<th>Safety</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 1.1 IT 7B</td>
<td>24.3% +- 1.9%</td>
<td>42.8%</td>
</tr>
<tr>
<td>Win / Tie / Loss</td>
<td></td>
<td>37.4% / 10.8% / 51.8%</td>
</tr>
<tr>
<td>Gemma 2 IT 2B</td>
<td>26.5% +- 1.8%</td>
<td>57.5%</td>
</tr>
<tr>
<td>Win / Tie / Loss</td>
<td></td>
<td>53% / 9% / 38%</td>
</tr>
<tr>
<td>Gemma 2 IT 9B</td>
<td>34.1% +- 3.0%</td>
<td>57.8%</td>
</tr>
<tr>
<td>Win / Tie / Loss</td>
<td></td>
<td>48.2% / 19.2% / 28.3%</td>
</tr>
<tr>
<td>Gemma 2 IT 27B</td>
<td>37.7% +- 2.3%</td>
<td>55%</td>
</tr>
<tr>
<td>Win / Tie / Loss</td>
<td></td>
<td>49.6% / 10.8% / 39.6%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 15: 来自人工评分员的指令遵循和安全性指标. 指令遵循指标是单面的, 没有胜负率, 因此留空.</p>
</blockquote>
<h4 id="rgdlpg">人工多轮评估</h4>
<p>我们通过让人工评分员与模型进行对话并遵循给定的指定场景来评估 Gemma-1.1 7B、Gemma-2 2B、9B 和 27B 模型的多轮能力. 我们使用了多样化的 500 个场景的保留集, 每个场景描述了一系列对模型的请求, 包括测量头脑风暴、制定计划或学习新知识的实例. 平均用户轮数为 8.4. 我们发现与 Gemma-2 模型的对话在用户评价和对话目标达成方面显著优于 Gemma-1.1(表 16). 此外, 我们看到 Gemma-2 模型在整个对话中保持高质量响应的能力优于 Gemma-1.1 7B.</p>
<table>
<thead>
<tr>
<th></th>
<th>User satisfaction</th>
<th>Conversation goal achievement</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 1.1 IT 7B</td>
<td>3.32</td>
<td>3.36</td>
</tr>
<tr>
<td>Gemma 2 IT 2B</td>
<td>3.64</td>
<td>3.88</td>
</tr>
<tr>
<td>Gemma 2 IT 9B</td>
<td>4.04</td>
<td>4.08</td>
</tr>
<tr>
<td>Gemma 2 IT 27B</td>
<td>4.20</td>
<td>4.24</td>
</tr>
</tbody></table>
<blockquote>
<p>表 16: 500 个多轮场景的人工评估. 评分员为整体满意度和对话目标达成赋予 1 到 5 的分数.</p>
</blockquote>
<h4 id="bzjzcs">标准基准测试</h4>
<p>Llama-3(AI@Meta, 2024)中观察到, 指令微调可以提高模型在 few-shot 基准测试上的性能, 尽管没有针对 few-shot 能力进行训练. 在表 17 中, 我们在模型上展示了类似的改进. 总体而言, 我们观察到几个百分点的改进. 我们推测 IT 模型更擅长理解格式化的问题, 而预训练模型对格式化敏感.</p>
<table>
<thead>
<tr>
<th></th>
<th>2B</th>
<th></th>
<th>9B</th>
<th></th>
<th>27B</th>
<th></th>
</tr>
</thead>
<tbody><tr>
<td>Model</td>
<td>PT</td>
<td>IT</td>
<td>PT</td>
<td>IT</td>
<td>PT</td>
<td>IT</td>
</tr>
<tr>
<td>MMLU</td>
<td>52.2</td>
<td>56.1</td>
<td>71.3</td>
<td>72.3</td>
<td>75.2</td>
<td>76.2</td>
</tr>
<tr>
<td>MBPP</td>
<td>30.2</td>
<td>36.6</td>
<td>52.4</td>
<td>59.2</td>
<td>62.6</td>
<td>67.4</td>
</tr>
</tbody></table>
<blockquote>
<p>表 17: 不同规模的预训练(PT)和指令微调(IT)模型在 few-shot 基准测试上的对比.</p>
</blockquote>
<hr>
<h2 id="7-jyhyys-memorization-and-privacy">7 记忆化与隐私 (Memorization and Privacy)</h2>
<p>大型语言模型在特定情况下可能容易受到攻击, 导致模型生成记忆化的训练数据(Nasr et al., 2023). 为了研究对此类攻击的敏感性并量化记忆化, 我们按照之前几项研究的做法评估模型的逐字记忆化和近似记忆化(Carlini et al., 2022; Anil et al., 2023; Kudugunta et al., 2023; Gemini Team, 2024).</p>
<p>我们遵循 Gemma Team(2024)的评估设置, 该设置使用 50 token 的提示测试训练数据的(50 token)记忆化. 我们使用精确匹配标准和近似匹配标准(Ippolito et al., 2022)(使用 10% 的编辑距离)比较整个数据集均匀采样后的整体记忆化率.</p>
<p><strong>逐字记忆化.</strong> 结果见图 1. 我们首先与文献中最近包含记忆化评估的模型进行比较. 我们发现 Gemma-2 的记忆化显著少于先前同等规模的模型, 记忆化率低于 0.1%(注意对数 y 轴). 我们进一步调查了这种记忆化如何按数据源分解. 与 Gemma-1 类似, 我们发现 Gemma-2 从代码、维基和科学来源记忆化更多, 而且在所有来源上的记忆化都显著更少(同样, 注意对数 y 轴).</p>
<p><strong>近似记忆化.</strong> 图 1 还展示了按数据源的近似记忆化. 我们观察到, 虽然近似记忆化高于精确记忆化, 但记忆化率仍然很低. 例如, 该模型的近似记忆化远低于 Gemma-1 的精确记忆化. 我们发现近似记忆化的增加远低于先前模型; 在某些情况下, 我们观察到完全没有提升(参见 Gemma Team, 2024, 图 4)(注意没有条形表示没有增加, 即近似记忆化率等于精确记忆化率).</p>
<p><strong>个人数据.</strong> 我们在训练时使用与 Gemma Team(2024)相同的预防方法并进行相同的评估. 特别地, 我们使用 Google Cloud 敏感数据保护工具来查找潜在的个人数据实例. 许多类别的个人数据(例如电话号码、账号)被分为三个严重程度级别. 我们使用这些严重程度级别分析记忆化输出. 我们没有发现高严重度数据被发出的实例, 并且发现记忆化数据中包含低严重度个人信息的比例非常低, 为 0.00026%. 我们注意到, 这些自动化工具已知会产生误报, 因为它们不考虑上下文. 这意味着我们的结果很可能是高估的.</p>
<hr>
<h2 id="fl-syb">附录: 术语表</h2>
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
<td>Knowledge Distillation</td>
<td>知识蒸馏</td>
<td>第 1 节</td>
<td>用大模型的 soft target 训练小模型, 替代 one-hot 标签</td>
</tr>
<tr>
<td>GQA</td>
<td>分组查询注意力</td>
<td>第 2 节</td>
<td>将 Query 头分组, 每组共享 KV 头, 平衡效率与质量</td>
</tr>
<tr>
<td>RoPE</td>
<td>旋转位置编码</td>
<td>第 2 节</td>
<td>通过旋转矩阵编码位置信息的位置编码方案</td>
</tr>
<tr>
<td>GeGLU</td>
<td>门控线性单元变体</td>
<td>第 2 节</td>
<td>结合 GELU 激活和门控机制的 FFN 变体</td>
</tr>
<tr>
<td>RMSNorm</td>
<td>均方根层归一化</td>
<td>第 2.3 节</td>
<td>对输入进行均方根归一化, 省略均值中心化</td>
</tr>
<tr>
<td>Logit soft-capping</td>
<td>Logit 软限制</td>
<td>第 2.2 节</td>
<td>用 tanh 将 logits 压缩到有界区间, 防止数值不稳定</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>第 4 节</td>
<td>在输入-输出对上训练模型以遵循指令</td>
</tr>
<tr>
<td>RLHF</td>
<td>基于人类反馈的强化学习</td>
<td>第 4 节</td>
<td>使用人类偏好数据训练奖励模型, 再用 RL 优化策略</td>
</tr>
<tr>
<td>ZeRO-3</td>
<td>第三阶段零冗余优化器</td>
<td>第 3.3 节</td>
<td>将优化器状态、梯度和参数分片到所有数据并行进程</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 Gemma-2 官方技术报告的逐字精读翻译. 原文共约 12 页, 涵盖架构、预训练(含知识蒸馏)、后训练、消融实验、评估和安全性分析. 核心创新在于将知识蒸馏系统性地应用于 2B 和 9B 小模型, 在相同训练预算下实现了显著的性能跃升, 并配合局部-全局注意力交错、GQA、logit soft-capping 等架构改进, 在 Chatbot Arena 上超越了参数量 2-3 倍的竞争对手.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yy-introduction","text":"1 引言 (Introduction)"},{"level":2,"id":"2-mxjg-model-architecture","text":"2 模型架构 (Model Architecture)"},{"level":3,"id":"2-1-jbhdckzylyqjzyl","text":"2.1 局部滑动窗口注意力与全局注意力"},{"level":3,"id":"2-2-logit-soft-capping","text":"2.2 Logit Soft-Capping"},{"level":3,"id":"2-3-sy-rms-norm-d-post-norm-y-pre-norm","text":"2.3 使用 RMSNorm 的 Post-Norm 与 Pre-Norm"},{"level":3,"id":"2-4-fzcxzyl-grouped-query-attention","text":"2.4 分组查询注意力 (Grouped-Query Attention)"},{"level":2,"id":"3-yxl-pre-training","text":"3 预训练 (Pre-training)"},{"level":3,"id":"3-1-xlsj","text":"3.1 训练数据"},{"level":3,"id":"3-2-zszl-knowledge-distillation","text":"3.2 知识蒸馏 (Knowledge Distillation)"},{"level":3,"id":"3-3-jsjcss","text":"3.3 计算基础设施"},{"level":3,"id":"3-4-tzj","text":"3.4 碳足迹"},{"level":2,"id":"4-hxl-post-training","text":"4 后训练 (Post-Training)"},{"level":2,"id":"5-xrsy-ablations","text":"5 消融实验 (Ablations)"},{"level":2,"id":"6-pg-evaluation","text":"6 评估 (Evaluation)"},{"level":3,"id":"6-1-yxlpg","text":"6.1 预训练评估"},{"level":4,"id":"pg-27b-mx","text":"评估 27B 模型"},{"level":4,"id":"pg-2b-h-9b-mx","text":"评估 2B 和 9B 模型"},{"level":3,"id":"6-2-hxlpg","text":"6.2 后训练评估"},{"level":4,"id":"lmsys-chatbot-arena","text":"LMSYS Chatbot Arena"},{"level":4,"id":"rgphpg","text":"人工偏好评估"},{"level":4,"id":"rgdlpg","text":"人工多轮评估"},{"level":4,"id":"bzjzcs","text":"标准基准测试"},{"level":2,"id":"7-jyhyys-memorization-and-privacy","text":"7 记忆化与隐私 (Memorization and Privacy)"},{"level":2,"id":"fl-syb","text":"附录: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/02-gemma-2/01-gemma-2-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/02-gemma-2/01-gemma-2-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma-2 技术报告精译</h1>
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
