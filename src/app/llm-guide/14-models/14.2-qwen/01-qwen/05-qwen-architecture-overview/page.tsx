"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen 核心架构与长上下文扩展设计剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>对应精译: <a href="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy">01-Qwen技术报告精译</a>
原文: Qwen Team, &quot;Qwen Technical Report&quot;, arXiv:2309.16609 (2023)
分析范围: Qwen-1.8B/7B/14B (2023.09 发布)</p>
</blockquote>
<hr>
<h2 id="1-sjln-zzjrjbs-zwyx">1. 设计理念: 站在巨人肩膀上, 中文优先</h2>
<p>2023 年 9 月, 当 Qwen 1.0 开源时, 开源社区正处于「后 LLaMA 时代」: Meta 的 LLaMA 和 LLaMA-2 已树立了开源基座模型的标杆. Qwen 选择在这个时间点开源, 面临的是一个高度竞争的环境. 其设计哲学非常务实: 以 LLaMA 的成熟架构为基础, 在词表、数据、长上下文等关键维度上进行针对性优化, 同时保持与消费级硬件的兼容性.</p>
<table>
<thead>
<tr>
<th align="left">规模</th>
<th align="center">隐藏维度</th>
<th align="center">注意力头数</th>
<th align="center">层数</th>
<th align="center">学习率</th>
<th align="center">Batch Size</th>
<th align="center">训练 Token</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1.8B</td>
<td align="center">2048</td>
<td align="center">16</td>
<td align="center">24</td>
<td align="center">3.0E-4</td>
<td align="center">4M</td>
<td align="center">2.2T</td>
</tr>
<tr>
<td align="left">7B</td>
<td align="center">4096</td>
<td align="center">32</td>
<td align="center">32</td>
<td align="center">3.0E-4</td>
<td align="center">4M</td>
<td align="center">2.4T</td>
</tr>
<tr>
<td align="left">14B</td>
<td align="center">5120</td>
<td align="center">40</td>
<td align="center">40</td>
<td align="center">3.0E-4</td>
<td align="center">4M</td>
<td align="center">3.0T</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Qwen 模型规模与训练配置.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: Qwen 1.0 的架构选择几乎全部是「跟随最佳实践&quot;: RoPE 来自 PaLM/LLaMA, SwiGLU 来自 PaLM, RMSNorm 来自 LLaMA, Flash Attention 来自 Dao et al. 这种「站在巨人肩膀上&quot;的策略降低了技术风险, 但也意味着 Qwen 1.0 在架构层面缺乏原创突破. 其真正的差异化来自三个工程决策: 第一, 152K 多语言词表——在当时几乎是 LLaMA 的 5 倍, 直接解决了中文 token 化效率低的问题; 第二, 预训练阶段混入高质量指令数据——将通常只在 SFT 阶段使用的数据提前到预训练, 增强了零样本能力; 第三, 长上下文扩展的三重技术组合(dynamic NTK + LogN-Scaling + 分层窗口)——这是当时最系统的无训练上下文扩展方案之一. 这三个决策共同构成了 Qwen 1.0 的核心竞争力: 不是在架构上创新, 而是在数据工程和推理优化上领先.</p>
</blockquote>
<hr>
<h2 id="2-jggl-zdxwt-l-la-ma">2. 架构概览: 针对性微调 LLaMA</h2>
<p>Qwen 采用修改版的 Transformer 架构, 以 LLaMA 为基础, 进行以下关键修改:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">设计选择</th>
<th align="left">与 LLaMA 的差异</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Embedding</td>
<td align="left">Untied (非绑定)</td>
<td align="left">LLaMA 绑定输入/输出权重</td>
</tr>
<tr>
<td align="left">位置编码</td>
<td align="left">RoPE, FP32 逆频率矩阵</td>
<td align="left">LLaMA 使用 BF16/FP16</td>
</tr>
<tr>
<td align="left">偏置项</td>
<td align="left">移除大部分, 保留 QKV 层</td>
<td align="left">LLaMA-2 完全移除所有偏置</td>
</tr>
<tr>
<td align="left">归一化</td>
<td align="left">Pre-Norm + RMSNorm</td>
<td align="left">与 LLaMA 相同</td>
</tr>
<tr>
<td align="left">激活函数</td>
<td align="left">SwiGLU, FFN 维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{8}{3}d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal">d</span></span></span></span></td>
<td align="left">与 LLaMA 相同</td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">标准 Multi-Head Attention</td>
<td align="left">LLaMA-2 引入 GQA</td>
</tr>
<tr>
<td align="left">上下文长度</td>
<td align="left">2048 (训练)</td>
<td align="left">与 LLaMA 相同</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Qwen 架构设计与 LLaMA 的对比.</p>
</blockquote>
<h3 id="2-1-untied-embedding">2.1 Untied Embedding</h3>
<p>Qwen 选择非绑定输入嵌入和输出投影的权重, 而非 LLaMA 的绑定方案.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 绑定输入/输出权重(tied embedding)是语言模型中常见的参数效率优化: 输入嵌入矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>V</mi><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">E \\in \\mathbb{R}^{V \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span> 和输出投影矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mtext>out</mtext></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>d</mi><mo>×</mo><mi>V</mi></mrow></msup></mrow><annotation encoding="application/x-tex">W_{\\text{out}} \\in \\mathbb{R}^{d \\times V}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">out</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span></span></span></span> 共享同一组参数, 可减少约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi><mo>×</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">V \\times d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 的参数量. 对于 152K 词表和 5120 隐藏维度的 14B 模型, 绑定可减少约 780M 参数(占总数约 5.5%). Qwen 选择非绑定的理由是实验表明它能带来更好的下游性能. 这个权衡的直觉是: 输入嵌入需要学习「将 token 映射到语义空间」, 而输出投影需要学习「将隐藏状态映射到 token 分布&quot;, 这两个任务的优化目标并不完全一致. 非绑定给予模型更多的灵活性来分别优化这两个映射. 代价是增加了约 5-6% 的参数量和内存占用, 在 7B/14B 规模下这个开销是可以接受的.</p>
</blockquote>
<h3 id="2-2-fp32-rope-npsjz">2.2 FP32 RoPE 逆频率矩阵</h3>
<p>Qwen 在 RoPE 的逆频率矩阵(inverse frequency matrix)计算中使用 FP32 精度, 而非 BF16 或 FP16.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: RoPE 的逆频率矩阵定义为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mn>10000</mn><mrow><mo>−</mo><mn>2</mn><mi>i</mi><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = 10000^{-2i/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.888em;"></span><span class="mord">1000</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mord mathnormal mtight">i</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 为维度索引. 在高维情况下(如 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mo>=</mo><mn>5120</mn></mrow><annotation encoding="application/x-tex">d=5120</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">5120</span></span></span></span>), 这个指数运算涉及极大的动态范围——高频维度(小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span>)的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\theta_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 接近 1, 低频维度(大 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span>)的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\theta_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 接近 0. 在 BF16/FP16 下, 接近 0 的小数值可能因为尾数精度不足(7-10 位)而被截断或下溢, 导致位置编码的精细结构丢失. FP32 的 23 位尾数可以精确表示这些微小差异. 这是一个「精度换稳定性&quot;的经典工程决策: 逆频率矩阵只需在模型初始化时计算一次, 然后缓存复用, 因此 FP32 的计算开销可以忽略, 但带来的数值稳定性收益贯穿整个训练过程. 这个细节在后来的模型(如 Qwen2、LLaMA 3)中被广泛采纳.</p>
</blockquote>
<h3 id="2-3-qkv-pzx">2.3 QKV 偏置项</h3>
<p>Qwen 移除了大部分层的偏置, 但在注意力的 QKV 层中保留了偏置.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 保留 QKV 偏置是 Qwen 区别于 LLaMA-2 的一个细节设计. LLaMA-2 完全移除了所有线性层的偏置(遵循 PaLM), 理由是减少参数量和提升训练稳定性. Qwen 的作者引用 qkv_bias 的相关文献, 认为 QKV 层的偏置有助于增强模型的外推能力——即在没有见过更长序列的情况下, 模型在推理时处理超过训练长度的序列的能力. 其直觉可能是: 偏置项为注意力分数提供了一种「软阈值&quot;, 帮助模型在序列长度变化时保持稳定的注意力模式. 在标准注意力中, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><annotation encoding="application/x-tex">QK^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span> 的点积值随着序列长度增加而尺度变化(因为更多的 key 参与竞争), 偏置项可以在一定程度上补偿这种尺度变化. 然而, 这个设计的有效性在消融实验中并未被直接验证, 其收益更多是理论性的.</p>
</blockquote>
<hr>
<h2 id="3-152k-cb-dyyddjysy">3. 152K 词表: 多语言的代价与收益</h2>
<p>Qwen 采用 BPE 分词器, 以 cl100k base 为起点, 补充了常用中文字词以及其他语言的词表. 最终词表大小约为 152K.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 152K 词表在当时是一个大胆的设计选择. LLaMA 使用 32K, Baichuan 使用 64K, 而 Qwen 将词表扩大到 152K——几乎是 LLaMA 的 5 倍. 收益方面: 压缩效率显著提升, 特别是在中文上. 论文中的对比显示, Qwen 在中文上的压缩率显著优于 LLaMA, 这意味着同样长度的中文文本, Qwen 需要的 token 数更少——这直接转化为更低的推理成本和更长的有效上下文窗口. 此外, 数字拆分为单个数字的策略确保了模型对数值的「逐位理解&quot;, 有助于算术和数学推理. 代价方面: 嵌入矩阵参数量激增. 对于 1.8B 模型, 302M 参数中有约 1/3 来自嵌入层; 对于 14B 模型, 1.4B 参数来自嵌入层. 这意味着大量容量被「浪费」在词表上而非语言建模能力本身. 更大的词表还意味着更大的内存占用和更慢的 token 采样速度. 从结果看, Qwen-1.8B 在某些基准上超越了更大的模型(如 LLaMA-7B 的 MMLU), 这说明压缩效率的提升在一定程度上弥补了小模型的容量劣势.</p>
</blockquote>
<hr>
<h2 id="4-csxwkz-szz">4. 长上下文扩展: 三重奏</h2>
<p>Qwen 实现了一套仅应用于推理阶段的无训练长上下文扩展技术, 由三个组件组成:</p>
<h3 id="4-1-dynamic-ntk-aware-cz">4.1 Dynamic NTK-aware 插值</h3>
<p>NTK-aware 插值调整 RoPE 的基数(base), 而非像位置插值(PI)那样对所有维度等比例缩放. Dynamic NTK-aware 插值进一步按块动态改变缩放比例, 避免了严重的性能下降.</p>
<p>标准 RoPE 的位置编码为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msup><mi>e</mi><mrow><mi>i</mi><mi>m</mi><mi>θ</mi></mrow></msup></mrow><annotation encoding="application/x-tex">f(m, \\theta) = e^{im\\theta}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8991em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">im</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span></span></span></span></span></span></span></span></span><p>NTK-aware 插值通过调整基数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>b</mi></mrow><annotation encoding="application/x-tex">b</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">b</span></span></span></span> 来扩展上下文:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mi>b</mi><mrow><mo>−</mo><mn>2</mn><mi>i</mi><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = b^{-2i/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.938em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.938em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mord mathnormal mtight">i</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span></span><p>当上下文从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mtext>train</mtext></msub></mrow><annotation encoding="application/x-tex">L_{\\text{train}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 扩展到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mtext>target</mtext></msub></mrow><annotation encoding="application/x-tex">L_{\\text{target}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">target</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 时, 缩放后的基数为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>b</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>=</mo><mi>b</mi><mo>⋅</mo><msup><mrow><mo fence="true">(</mo><mfrac><msub><mi>L</mi><mtext>target</mtext></msub><msub><mi>L</mi><mtext>train</mtext></msub></mfrac><mo fence="true">)</mo></mrow><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mo stretchy="false">(</mo><mi>d</mi><mo>−</mo><mn>2</mn><mo stretchy="false">)</mo></mrow></msup></mrow><annotation encoding="application/x-tex">b&#x27; = b \\cdot \\left(\\frac{L_{\\text{target}}}{L_{\\text{train}}}\\right)^{d/(d-2)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8019em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">b</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.6779em;vertical-align:-0.95em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">target</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.7279em;"><span style="top:-3.9029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">d</span><span class="mbin mtight">−</span><span class="mord mtight">2</span><span class="mclose mtight">)</span></span></span></span></span></span></span></span></span></span></span></span></span><h3 id="4-2-logn-scaling">4.2 LogN-Scaling</h3>
<p>LogN-Scaling 通过一个依赖于上下文长度与训练长度之比的因子重新缩放 query 和 value 的点积:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo>⋅</mo><msub><mrow><mi>log</mi><mo>⁡</mo></mrow><msub><mi>L</mi><mtext>train</mtext></msub></msub><mo stretchy="false">(</mo><msub><mi>L</mi><mtext>current</mtext></msub><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} \\cdot \\log_{L_{\\text{train}}}(L_{\\text{current}})\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop"><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2342em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.334em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3442em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">current</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>这确保随着上下文长度增长, 注意力值的熵保持稳定.</p>
<h3 id="4-3-fc-window-attention">4.3 分层 Window Attention</h3>
<p>Qwen 观察到模型的长上下文建模能力在不同层之间有所差异, 较低层比较高层对上下文长度扩展更敏感. 因此, 为每层分配不同的窗口大小: 较低层使用较短的窗口, 较高层使用较长的窗口.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 这三项技术的组合效果几乎是「乘法级」的. 消融数据显示: 原始 Qwen-7B 在 4096 token 时 PPL 从 3.78 飙升至 39.35, 在 16384 token 时达到 2645——几乎完全失效. 仅添加 dynamic NTK 插值, PPL 就降到 5.71(16384 时). 再叠加 LogN-Scaling 降到 4.62, 最后加上 window attention 降到 4.32. 分层窗口的设计尤其值得分析: 低层负责局部模式(如词法、短语结构), 对长距离依赖不敏感, 因此使用短窗口不会影响性能; 高层负责语义和篇章结构, 需要更大的感受野, 因此使用长窗口. 这种「分层外推」策略的直觉来自对 Transformer 层级功能的分化理解——它后来被多个模型采纳, 包括 Qwen2 和 Kimi 系列.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">技术组合</th>
<th align="right">1024</th>
<th align="right">2048</th>
<th align="right">4096</th>
<th align="right">8192</th>
<th align="right">16384</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen-7B (基线)</td>
<td align="right">4.23</td>
<td align="right">3.78</td>
<td align="right">39.35</td>
<td align="right">469.81</td>
<td align="right">2645.09</td>
</tr>
<tr>
<td align="left">+ dynamic_ntk</td>
<td align="right">4.23</td>
<td align="right">3.78</td>
<td align="right">3.59</td>
<td align="right">3.66</td>
<td align="right">5.71</td>
</tr>
<tr>
<td align="left">+ dynamic_ntk + logn</td>
<td align="right">4.23</td>
<td align="right">3.78</td>
<td align="right">3.58</td>
<td align="right">3.56</td>
<td align="right">4.62</td>
</tr>
<tr>
<td align="left">+ dynamic_ntk + logn + window_attn</td>
<td align="right">4.23</td>
<td align="right">3.78</td>
<td align="right">3.58</td>
<td align="right">3.49</td>
<td align="right">4.32</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Qwen-7B 使用各种技术进行长上下文推理的困惑度(PPL)结果.</p>
</blockquote>
<hr>
<h2 id="5-yxlcl-sj-zlyxs">5. 预训练策略: 数据、指令与效率</h2>
<h3 id="5-1-sjgmyzl">5.1 数据规模与质量</h3>
<p>Qwen 在 3 万亿 token 的多语言数据集上预训练, 包括公共网络文档、百科全书、书籍、代码等. 数据预处理流程包括:</p>
<ul>
<li>语言识别与过滤</li>
<li>精确匹配去重 + MinHash/LSH 模糊去重</li>
<li>基于规则和机器学习的质量评分</li>
<li>13-gram 重叠去污染</li>
<li>预训练阶段混入高质量指令数据</li>
</ul>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 3T token 的数据规模在 2023 年 9 月是相当激进的数字——LLaMA-1 使用了 1.4T, LLaMA-2 使用了 2T. 几个数据策略值得分析. 第一, 13-gram 重叠过滤是一种相当严格的去污染措施, 相比之下很多模型仅使用 8-gram 或 10-gram. 这反映了对评测公平性的高度重视, 但也意味着可能有更多的训练数据被误删. 第二, 在预训练阶段混入指令数据是一个前瞻性的设计. 传统上, 指令数据只在 SFT 阶段使用; Qwen 将其提前到预训练, 使得模型在预训练结束时就具备一定的指令遵循能力. 这本质上是将「指令微调」提前到「指令预训练」, 可能有助于提升模型的零样本指令遵循能力. 第三, 中英文双语数据配比是一个未公开的关键超参数——从 Qwen-14B 在 C-Eval(72.1%)上大幅领先于所有开源模型的结果来看, 中文数据占比应该不低.</p>
</blockquote>
<h3 id="5-2-xlpz">5.2 训练配置</h3>
<p>Qwen 使用 AdamW 优化器, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1=0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2=0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi><mo>=</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\epsilon=10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>, 余弦学习率调度, BFloat16 混合精度, Flash Attention 加速. 所有模型使用 4M token 的 batch size 和 2048 的上下文长度.</p>
<hr>
<h2 id="6-dq-sft-rlhf-yyxltd">6. 对齐: SFT、RLHF 与预训练梯度</h2>
<h3 id="6-1-sft">6.1 SFT</h3>
<p>Qwen 的 SFT 使用 ChatML 格式, 训练 4000 步, 批次大小 128, 序列长度 2048, 峰值学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 4000 步的 SFT 训练非常短——以批次大小 128 和序列长度 2048 计算, 每步处理约 262K token, 4000 步总计约 1B token. 这与 3T 的预训练数据相比不到 0.04%. 这种「轻量 SFT」策略在当时是常见做法, 但后续研究表明更长的 SFT 训练(如 Qwen2 的做法)可以显著提升对齐质量. ChatML 格式的选择是另一个重要设计: 使用 <code>&lt;|im_start|&gt;</code> 和 <code>&lt;|im_end|&gt;</code> 等特殊 token 标记系统、用户和助手角色的边界, 避免了模型将对话标记与普通文本混淆. 这个设计被 Qwen 系列一直沿用, 成为其标志性特征.</p>
</blockquote>
<h3 id="6-2-rlhf-yyxltd">6.2 RLHF 与预训练梯度</h3>
<p>Qwen 的 RLHF 采用 PPO 算法, 涉及四个模型: 策略模型、价值模型、参考模型和奖励模型. 奖励模型使用与策略模型相同规模的基础模型初始化, 并增加了一个池化层.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Qwen 1.0 的 RLHF 设计有几个亮点. 第一, 奖励模型使用与策略模型相同规模的基础模型初始化(而非从零训练一个小模型), 这确保了奖励模型具备与策略模型相当的理解能力. 第二, 6600 个标签的分类系统是一个相当细粒度的提示分类方案, 远超当时大多数工作的简单分类. 第三, 「预训练梯度」(pretrained gradient)是缓解对齐税(alignment tax)的关键技巧: 在 PPO 的梯度更新中混入预训练数据上的梯度, 使模型在优化人类偏好的同时不遗忘通用知识. 这本质上是一种正则化——用预训练数据作为锚点, 防止策略模型偏离基础能力太远. 作者提到「必须使用显著更大体积的预训练数据&quot;, 暗示了配比的重要性. 这个思路与后来 DPO 方法中参考模型所起的「锚定」作用形成了有趣的对比: PPO 用预训练梯度锚定, DPO 用参考模型锚定.</p>
</blockquote>
<hr>
<h2 id="7-zymx-code-qwen-y-math-qwen">7. 专用模型: Code-Qwen 与 Math-Qwen</h2>
<h3 id="7-1-code-qwen">7.1 Code-Qwen</h3>
<p>Code-Qwen 采用「通用预训练 → 代码继续预训练 → 多阶段 SFT&quot;的训练流程. 在约 90B token 的代码数据上继续预训练, 上下文长度扩展到 8192.</p>
<p>Code-Qwen-14B-Chat 在 HumanEval 上达到 66.4% 的 pass@1, 超越了 Code-LLaMA-Python-34B(53.7%) 和 Code-LLaMA-Instruct-34B(41.5%).</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Code-Qwen 14B 超越 34B 的 Code-LLaMA 是一个重要的结果. 它揭示了通用模型+适当的继续预训练, 在代码任务上可以击败专门的代码模型. 原因可能是: Qwen 的通用基座能力(特别是数学和推理)更强, 而代码生成不仅需要编码能力, 还需要数学建模和规划能力. 但 66.4% 与 GPT-4 的 86.6% 之间仍有 20 个百分点的差距, 说明在代码生成这一特定任务上, 闭源模型的优势仍然显著. Code-Qwen 的训练策略是「通用+代码&quot;, 而非 Code-LLaMA 的「通用→长代码→专用→通用指令&quot;四阶段, 这反映了阿里对「通用能力优先于专用能力&quot;的判断.</p>
</blockquote>
<h3 id="7-2-math-qwen">7.2 Math-Qwen</h3>
<p>Math-Qwen 在增强的数学指令数据集上进行 SFT, 使用 1024 的序列长度. 关键细节是: 掩码用户输入的损失计算, 模型只学习生成答案.</p>
<p>Math-Qwen-14B-Chat 在 GSM8K 上达到 69.8%, 接近 GPT-3.5 的 80.8%; 在 MATH 上达到 24.2%, 与 GPT-3.5 的 34.1% 仍有差距.</p>
<hr>
<h2 id="8-agent-nl-gjsyydmjsq">8. Agent 能力: 工具使用与代码解释器</h2>
<p>Qwen-Chat 展现了当时开源模型中领先的 Agent 能力, 包括:</p>
<ul>
<li><strong>ReAct 工具使用</strong>: Qwen-7B 在工具选择准确率(98%)上超越了 GPT-4(95%).</li>
<li><strong>代码解释器</strong>: Qwen-14B 在代码可执行率(81.7%)和正确性(56.4%)上大幅超越了所有开源对手, 包括专门优化的 Code-LLaMA-13B.</li>
<li><strong>Hugging Face Agent</strong>: 在多模态工具调用上展现出竞争力.</li>
</ul>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Agent 能力的来源值得分析. Qwen 使用 self-instruct 策略生成约 2000 条高质量 Agent 训练样本, 与通用 SFT 样本混合训练(而非额外的训练阶段). 这确保了模型在获得 Agent 能力的同时保留通用能力. 更值得注意的是, 通用模型在 Agent 任务上击败专门代码模型的现象: Agent 任务不仅需要编码能力, 还需要数学建模、数据理解和规划能力——这正是通用模型的优势所在. 这揭示了一个重要的产品设计洞察: 对于需要综合能力的复杂任务, 通用模型的「广度」可能比专用模型的「深度」更有价值.</p>
</blockquote>
<hr>
<h2 id="9-xndwyjx">9. 性能定位与局限</h2>
<h3 id="9-1-jzmxxn">9.1 基座模型性能</h3>
<p>Qwen-14B 在多个基准上超越了参数量更大的模型:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="right">Qwen-14B</th>
<th align="right">LLaMA-65B</th>
<th align="right">LLaMA-2-70B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">C-Eval 5-shot</td>
<td align="right">72.1</td>
<td align="right">40.4</td>
<td align="right">50.1</td>
</tr>
<tr>
<td align="left">MATH 4-shot</td>
<td align="right">24.8</td>
<td align="right">10.6</td>
<td align="right">13.5</td>
</tr>
<tr>
<td align="left">HumanEval 0-shot</td>
<td align="right">32.3</td>
<td align="right">23.7</td>
<td align="right">29.9</td>
</tr>
<tr>
<td align="left">BBH 3-shot</td>
<td align="right">53.4</td>
<td align="right">58.4</td>
<td align="right">64.9</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Qwen-14B 与更大规模模型的性能对比.</p>
</blockquote>
<p>Qwen-14B 在 C-Eval(中文)和 MATH(数学)上大幅领先, 但在 BBH(广义推理)上仍落后于 LLaMA-65B/70B. 这反映了「数据质量 vs 规模&quot;的 trade-off: Qwen 通过高质量的中英文数据和指令混入, 在特定领域超越了更大模型, 但在需要广泛世界知识的任务上, 参数量的劣势仍然存在.</p>
<h3 id="9-2-jx">9.2 局限</h3>
<ol>
<li><strong>缺乏 GQA</strong>: Qwen 1.0 使用标准 Multi-Head Attention, 而 LLaMA-2 已引入 GQA 来减少 KV Cache. 这使得 Qwen 在推理效率上处于劣势.</li>
<li><strong>轻量 SFT</strong>: 4000 步的 SFT 训练相对较短, 对齐质量有提升空间.</li>
<li><strong>上下文长度</strong>: 训练上下文仅 2048, 虽然通过推理时扩展可以处理更长序列, 但原生长上下文能力不足.</li>
<li><strong>人工评估的局限性</strong>: 300 条中文指令的样本量较小, 且由阿里自己构建和标注, 可比性受限.</li>
</ol>
<hr>
<h2 id="10-lsdw">10. 历史定位</h2>
<blockquote>
<p><strong>Thinking (Lineage)</strong>: Qwen 1.0 是阿里通义千问大模型家族的开山之作, 其技术决策深刻影响了后续所有 Qwen 系列模型. 152K 词表的设计被 Qwen1.5/1.6 继承并扩展到更大的规模; ChatML 格式成为 Qwen 系列的标志性对话格式; 预训练混入指令数据的思路在 Qwen2 中得到进一步发展; 长上下文扩展的三重技术(dynamic NTK/LogN/分层窗口)为后续模型(包括 Qwen2 和 Kimi)提供了重要参考. Qwen 1.0 的发布也标志着中国大模型开源生态的重要里程碑——它是当时中文能力最强的开源模型之一, 直接推动了国内开源模型竞争的升温. 从技术演进看, Qwen 1.0 的定位是「基座」: 它验证了阿里在大模型训练上的工程能力, 为后续的 Qwen2(架构全面升级)、Qwen-VL(多模态)、Qwen-Audio(音频)等衍生模型奠定了坚实的技术基础.</p>
</blockquote>
<hr>
<h2 id="11-zj">11. 总结</h2>
<p>Qwen 1.0 是一个在成熟架构(LLaMA)基础上进行针对性优化的模型家族. 它的核心创新不在于架构本身, 而在于数据工程和推理优化: 152K 多语言词表解决了中文 token 化效率的痛点, 预训练混入指令数据增强了零样本能力, 三重长上下文扩展技术实现了当时领先的无训练上下文扩展. 这些设计决策反映了 Qwen 团队对「工程优化」的深刻理解——在硬件和算法约束下, 通过精细的数据和训练策略来最大化模型能力.</p>
<p>Qwen 1.0 的局限也清晰可辨: 缺乏 GQA 导致推理效率落后, 轻量 SFT 限制了对齐质量, 2048 的训练上下文长度是原生长上下文能力的瓶颈. 但这些局限在后续的 Qwen1.5/2 中得到了系统性的解决, 使得 Qwen 1.0 成为一个成功的「技术验证&quot;和「生态起点&quot;.</p>
<p>从更广阔的视角看, Qwen 1.0 的发布标志着中国大模型开源力量从技术跟随走向自主创新. 它证明了在 LLaMA 开源生态的基础上, 通过针对性的数据工程和优化策略, 可以构建出在特定领域(如中文理解、代码生成、Agent 能力)具有竞争力的模型. 这一经验对后续的中国开源模型(如 Baichuan、ChatGLM、InternLM)产生了深远影响.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjln-zzjrjbs-zwyx","text":"1. 设计理念: 站在巨人肩膀上, 中文优先"},{"level":2,"id":"2-jggl-zdxwt-l-la-ma","text":"2. 架构概览: 针对性微调 LLaMA"},{"level":3,"id":"2-1-untied-embedding","text":"2.1 Untied Embedding"},{"level":3,"id":"2-2-fp32-rope-npsjz","text":"2.2 FP32 RoPE 逆频率矩阵"},{"level":3,"id":"2-3-qkv-pzx","text":"2.3 QKV 偏置项"},{"level":2,"id":"3-152k-cb-dyyddjysy","text":"3. 152K 词表: 多语言的代价与收益"},{"level":2,"id":"4-csxwkz-szz","text":"4. 长上下文扩展: 三重奏"},{"level":3,"id":"4-1-dynamic-ntk-aware-cz","text":"4.1 Dynamic NTK-aware 插值"},{"level":3,"id":"4-2-logn-scaling","text":"4.2 LogN-Scaling"},{"level":3,"id":"4-3-fc-window-attention","text":"4.3 分层 Window Attention"},{"level":2,"id":"5-yxlcl-sj-zlyxs","text":"5. 预训练策略: 数据、指令与效率"},{"level":3,"id":"5-1-sjgmyzl","text":"5.1 数据规模与质量"},{"level":3,"id":"5-2-xlpz","text":"5.2 训练配置"},{"level":2,"id":"6-dq-sft-rlhf-yyxltd","text":"6. 对齐: SFT、RLHF 与预训练梯度"},{"level":3,"id":"6-1-sft","text":"6.1 SFT"},{"level":3,"id":"6-2-rlhf-yyxltd","text":"6.2 RLHF 与预训练梯度"},{"level":2,"id":"7-zymx-code-qwen-y-math-qwen","text":"7. 专用模型: Code-Qwen 与 Math-Qwen"},{"level":3,"id":"7-1-code-qwen","text":"7.1 Code-Qwen"},{"level":3,"id":"7-2-math-qwen","text":"7.2 Math-Qwen"},{"level":2,"id":"8-agent-nl-gjsyydmjsq","text":"8. Agent 能力: 工具使用与代码解释器"},{"level":2,"id":"9-xndwyjx","text":"9. 性能定位与局限"},{"level":3,"id":"9-1-jzmxxn","text":"9.1 基座模型性能"},{"level":3,"id":"9-2-jx","text":"9.2 局限"},{"level":2,"id":"10-lsdw","text":"10. 历史定位"},{"level":2,"id":"11-zj","text":"11. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/01-qwen/05-qwen-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/01-qwen/05-qwen-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen 核心架构与长上下文扩展设计剖析</h1>
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
