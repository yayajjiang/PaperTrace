"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>02 MoE大模型架构的工程实践与深度解析</h1>
<h2 id="1-yy-xsh-llm-jgdyjqy">1. 引言: 稀疏化—LLM架构的演进前沿</h2>
<p>大语言模型(LLM)的架构演进正朝着一个关键方向发展: <strong>参数规模与计算成本的解耦</strong>. 在这一趋势中, <strong>混合专家</strong>(Mixture-of-Experts, MoE)架构已成为业界前沿的核心技术. 它允许模型参数量达到数千亿甚至万亿级别, 而在推理或训练期间的单次前向传播计算成本仅保持在一个相对固定的较低水平.</p>
<p>MoE的核心思想是<strong>稀疏激活</strong>: 将传统的, 对所有输入都使用相同参数的稠密层(dense layer), 替换为一组并行的, 专门化的“专家”网络. 对于每一个输入token, 一个动态路由机制会选择性地激活一小部分专家参与计算. 这种条件化计算模式不仅是通往更强大模型的路径, 也对工程实现提出了独特的挑战.</p>
<p>本文档旨在提供一份关于MoE模型构建与训练的综合性工程实践指南. 我们将从其基础架构<strong>Decoder-Only Transformer</strong>开始, 逐步深入到MoE的核心组件, 并最终通过一个从零构建的案例(<strong>nanoMoE</strong>)展示如何解决训练稳定性等关键工程问题.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_0.png" alt=""></p>
<p>图 1: 混合专家(MoE)模型通过动态路由激活部分专家网络.</p>
<h2 id="2-jcjg-decoder-only-transformer-px">2. 基础架构: Decoder-Only Transformer剖析</h2>
<p>要构建MoE模型, 必须首先掌握其骨架——<strong>Decoder-Only Transformer</strong>. 该架构是现代生成式LLM的基石.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_1.png" alt=""></p>
<p>图 2: Decoder-Only Transformer由多个相同的模块堆叠而成.</p>
<h3 id="2-1-sjsrlsx-cwbdzl">2.1 数据输入流水线: 从文本到张量</h3>
<p>模型的输入始于原始文本, 经过一系列处理最终转换为可供神经网络计算的张量.</p>
<ul>
<li><p><strong>分词</strong>(Tokenization): 使用分词器(如<strong>BPE</strong>)将文本字符串分解为离散的token单元.</p>
</li>
<li><p><strong>ID映射</strong>: 将每个token映射到词汇表中的一个唯一整数ID.</p>
</li>
<li><p><strong>嵌入</strong>(Embedding): 通过一个嵌入矩阵, 将每个token ID转换为一个高维向量(<strong>token embedding</strong>). 这个嵌入矩阵是模型的可训练参数.</p>
</li>
</ul>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_2.png" alt=""></p>
<p>图 3: 从原始文本到离散token的转换流程.</p>
<p>最终, 一个文本序列变成了形状为 [SequenceLength, EmbeddingDim] 的矩阵. 为了让模型感知token的顺序, 还需要为每个token嵌入叠加一个<strong>位置嵌入</strong>(Positional Embedding).</p>
<h3 id="2-2-hxjsdy-transformer-mk">2.2 核心计算单元: Transformer模块</h3>
<p>Transformer的核心由多个完全相同的模块(Block)堆叠而成. 每个模块包含两个关键的子层.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_3.png" alt=""></p>
<p>图 4: Transformer模块的内部结构.</p>
<h4 id="2-2-1-zcy-dygymddtzzyl">2.2.1 子层一: 带因果掩码的多头自注意力</h4>
<p><strong>自注意力</strong>(Self-Attention)机制允许模型在处理一个token时, 权衡序列中所有其他token的重要性. 其计算过程借鉴了信息检索的概念:</p>
<ul>
<li><p><strong>查询</strong>(Query, Q): 当前token的角色, 用于发起信息查询.</p>
</li>
<li><p><strong>键</strong>(Key, K): 序列中所有token的角色, 用于响应查询.</p>
</li>
<li><p><strong>值</strong>(Value, V): 序列中所有token包含的实际信息.</p>
</li>
</ul>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_4.png" alt=""></p>
<p>图 5: 输入嵌入通过独立的线性投影生成Q, K, V.</p>
<p>注意力得分通过Q和K的点积计算, 公式为:</p>
<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0895em;"><span style="top:-2.5864em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord sqrt mtight"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8622em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mtight" style="padding-left:0.833em;"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8222em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail mtight" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1778em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4461em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">Q</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9191em;"><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.538em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">d_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是K向量的维度. 缩放因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mrow><annotation encoding="application/x-tex">\\sqrt{d_k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.1828em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span> 用于稳定梯度.</p>
<p><strong>因果掩码</strong>(Causal Mask)是Decoder-Only架构的关键. 它确保在计算第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个token的表示时, 模型只能关注到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 位置及之前的信息, 从而防止在自回归生成任务中发生信息泄露.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_5.png" alt=""></p>
<p>图 6: 因果掩码阻止了对未来token的关注.</p>
<p><strong>多头注意力</strong>(Multi-Head Attention)将注意力计算并行化. 它设置多个独立的注意力“头”, 每个头学习不同子空间中的表示. 各个头的输出被拼接并再次线性投影, 从而整合来自不同维度的信息.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_6.png" alt=""></p>
<p>图 7: 将多个头的输出拼接并投影以形成最终输出.</p>
<h4 id="2-2-2-zce-zdqkwl">2.2.2 子层二: 逐点前馈网络</h4>
<p>这是一个简单的两层全连接网络(MLP), 它独立地作用于序列中的每一个token. 其作用是增加模型的非线性表示能力.</p>
<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>FFN</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>max</mtext><mo stretchy="false">(</mo><mn>0</mn><mo separator="true">,</mo><mi>x</mi><msub><mi>W</mi><mn>1</mn></msub><mo>+</mo><msub><mi>b</mi><mn>1</mn></msub><mo stretchy="false">)</mo><msub><mi>W</mi><mn>2</mn></msub><mo>+</mo><msub><mi>b</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\text{FFN}(x) = \\text{max}(0, xW_1 + b_1)W_2 + b_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">FFN</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">max</span></span><span class="mopen">(</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">x</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><p>在现代Transformer中, 激活函数通常使用<strong>GELU</strong>或<strong>SwiGLU</strong>.</p>
<h4 id="2-2-3-mklj-ccycgyh">2.2.3 模块连接: 残差与层归一化</h4>
<p>每个子层都被<strong>残差连接</strong>(Residual Connection)和<strong>层归一化</strong>(Layer Normalization)包裹.</p>
<ul>
<li><p><strong>残差连接</strong>: 将子层的输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 直接加到其输出 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>SubLayer</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{SubLayer}(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">SubLayer</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span> 上. 这种捷径连接极大地缓解了深度网络中的梯度消失问题.</p>
</li>
<li><p><strong>层归一化</strong>: 在每个子层的输入处对特征进行归一化, 稳定了训练过程中的激活值分布, 加速模型收敛.</p>
</li>
</ul>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_7.png" alt=""></p>
<p>图 8: 层归一化通过标准化和可学习的仿射变换来稳定激活.</p>
<h3 id="2-3-mxscysc">2.3 模型输出与生成</h3>
<p>经过多层Transformer模块的处理后, 最终的输出张量通过一个线性层映射到整个词汇表的维度, 得到logits. 对logits应用softmax函数即可得到每个词的概率分布, 用于<strong>下一token预测</strong>. LLM通过<strong>自回归</strong>(autoregressive)的方式生成文本: 预测一个token, 将其添加到输入序列, 然后再进行下一次预测, 循环往复.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_8.png" alt=""></p>
<p>图 9: 自回归解码过程示意图.</p>
<h2 id="3-moe-jgsdjx">3. MoE架构深度解析</h2>
<p>MoE的核心创新在于用稀疏激活的专家层替换了Transformer模块中密集的逐点前馈网络(FFN).</p>
<h3 id="3-1-hxzj-zjcylyq">3.1 核心组件: 专家层与路由器</h3>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_9.png" alt=""></p>
<p>图 10: MoE架构用一组并行的专家网络替换了单个FFN.</p>
<ul>
<li><p><strong>专家层</strong>(Expert Layer): 由多个并行的MLP网络构成, 每个MLP就是一个“专家”. 所有专家结构相同, 但参数独立.</p>
</li>
<li><p><strong>路由器</strong>(Router): 一个小型神经网络(通常是单个线性层), 负责决定将每个输入token发送给哪些专家.</p>
</li>
</ul>
<p>路由过程如下:</p>
<ol>
<li>路由器接收一个token的嵌入向量.2. 输出一个在所有专家上的得分(logits).3. 通过softmax将得分转换为概率.4. 选择概率最高的<strong>top-K</strong>个专家来处理该token. <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 是一个超参数, 通常为1或2.</li>
</ol>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_10.png" alt=""></p>
<p>图 11: 路由器为输入token选择top-K个专家.</p>
<p>最终, token的输出是所选K个专家输出的加权和, 权重即为路由器计算出的概率.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_11.png" alt=""></p>
<p>图 12: 专家层的最终输出是各激活专家输出的加权组合.</p>
<h3 id="3-2-gctzyjjfa">3.2 工程挑战与解决方案</h3>
<h4 id="3-2-1-tzy-dtfzyjsxs">3.2.1 挑战一: 动态负载与计算效率</h4>
<p>动态路由导致每个专家在不同时间步接收的token数量不同, 这对硬件(尤其是GPU)的并行计算效率是极大的挑战.
<strong>解决方案</strong>: <strong>专家容量</strong>(Expert Capacity).
我们为每个专家预先设定一个固定的缓冲区大小, 即<strong>专家容量</strong>.</p>
<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>ExpertCapacity</mtext><mo>=</mo><mtext>round</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mtext>TokensPerBatch</mtext><mo>×</mo><mi>K</mi></mrow><mtext>NumExperts</mtext></mfrac><mo fence="true">)</mo></mrow><mo>×</mo><mtext>CapacityFactor</mtext></mrow><annotation encoding="application/x-tex">\\text{ExpertCapacity} = \\text{round}\\left(\\frac{\\text{TokensPerBatch} \\times K}{\\text{NumExperts}}\\right) \\times \\text{CapacityFactor}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">ExpertCapacity</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord text"><span class="mord">round</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8801em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">NumExperts</span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">TokensPerBatch</span></span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4811em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">CapacityFactor</span></span></span></span></span><p>CapacityFactor 是一个大于1的超参数, 用于提供冗余空间. 如果路由到某个专家的token数超过其容量, 多余的token将被“丢弃”, 其信息通过残差连接直接传递到下一层, 不经过专家计算.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_12.png" alt=""></p>
<p>图 13: 超过专家容量的token通过残差连接绕过专家计算.</p>
<h4 id="3-2-2-tze-xlbwdx">3.2.2 挑战二: 训练不稳定性</h4>
<p>MoE训练是出了名的不稳定, 主要表现为:</p>
<ul>
<li><p><strong>路由崩溃</strong>(Routing Collapse): 路由器倾向于只选择少数几个“明星”专家, 导致其他专家得不到训练.</p>
</li>
<li><p><strong>数值不稳定</strong>: 路由器的softmax计算涉及指数函数, 在低精度训练(如<strong>float16</strong>)下容易出现上溢或下溢.</p>
</li>
</ul>
<p><strong>解决方案</strong>: <strong>辅助损失与精度控制</strong>.</p>
<ol>
<li><strong>负载均衡损失</strong>(Load Balancing Loss): 在主损失函数中加入一个辅助项, 惩罚不均衡的专家路由. 该损失项鼓励路由器将token尽可能均匀地分配给所有专家.</li>
</ol>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_13.png" alt=""></p>
<p>图 14: 负载均衡损失旨在实现专家利用率的均衡.</p>
<ol>
<li><strong>路由器Z-Loss</strong>: 另一个辅助损失项, 专门用于惩罚路由器输出的logits值过大. 这有助于在应用softmax前控制数值范围, 提高数值稳定性.</li>
</ol>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_14.png" alt=""></p>
<p>图 15: 最终损失由主任务损失和多个辅助损失加权构成.</p>
<ol>
<li><p><strong>精度控制</strong>: 在进行混合精度训练时, 将模型大部分参数置于bfloat16或float16下以加速计算, 但<strong>强制将路由器模块保持在全精度(float32)下运行</strong>.</p>
</li>
<li><p><strong>专门的权重初始化</strong>: 使用方差更小的截断正态分布来初始化MoE层的权重, 也能有效提升训练初期的稳定性.</p>
</li>
</ol>
<h2 id="4-alyj-clgjyxl-nano-mo-e">4. 案例研究: 从零构建与训练nanoMoE</h2>
<p>本节将上述理论和工程技巧应用于一个实际项目: 从零开始构建并预训练一个名为<strong>nanoMoE</strong>的中型MoE模型.</p>
<h3 id="4-1-sypz">4.1 实验配置</h3>
<p>实验在一个配备两块RTX 3090 GPU的设备上进行. 核心配置如下:</p>
<ul>
<li><p><strong>模型架构</strong>: 6层, 6个注意力头, 嵌入维度 d=384.</p>
</li>
<li><p><strong>MoE配置</strong>: 每隔一层(P=2)设置一个专家层. 每个专家层有8个专家(N=8), 每次激活2个(K=2).</p>
</li>
<li><p><strong>专家容量因子</strong>: 训练时1.25, 评估时2.0.</p>
</li>
<li><p><strong>损失函数</strong>: 采用语言模型损失, 并结合了负载均衡损失(权重0.01)和路由器Z-loss(权重0.001).</p>
</li>
<li><p><strong>训练精度</strong>: bfloat16混合精度, 但路由器保持float32.</p>
</li>
<li><p><strong>优化器与学习率</strong>: AdamW优化器, 采用带线性预热和余弦衰减的学习率策略.</p>
</li>
<li><p><strong>数据集</strong>: 使用OpenWebText数据集的一个子集, 总计约250亿token.</p>
</li>
</ul>
<h3 id="4-2-wdxsyyjg">4.2 稳定性实验与结果</h3>
<p>为了验证各项工程技巧的有效性, 我们进行了一系列消融实验. 基线模型不采用任何稳定性技巧, 然后逐一引入: (1) 负载均衡损失, (2) 路由器Z-loss, (3) 路由器全精度, (4) 专门的权重初始化.</p>
<p><img src="./02-MoE%E7%9A%84%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5-images/image_15.png" alt=""></p>
<p>图 16: 不同稳定性技术的训练损失曲线对比.</p>
<p>实验结果清晰地表明:</p>
<ul>
<li><p><strong>基线模型</strong>很快就因训练不稳定而导致损失发散.</p>
</li>
<li><p><strong>每引入一项技巧</strong>, 都能在一定程度上推迟或减轻不稳定性.</p>
</li>
<li><p><strong>当所有技巧组合使用时</strong>, 模型能够稳定地完成整个预训练过程, 损失曲线平滑下降.</p>
</li>
</ul>
<p>这证明了上述工程实践对于成功训练MoE模型是至关重要的.</p>
<h3 id="4-3-fxzn">4.3 复现指南</h3>
<p>要复现此训练, 可使用以下命令 (假设已安装相应环境并准备好数据集):</p>
<p>配置文件train_nano_moe.py中包含了上述所有超参数设置.</p>
<h2 id="5-jl">5. 结论</h2>
<p>混合专家(MoE)架构通过稀疏激活为构建超大规模语言模型提供了一条高效可行的路径.然而, 其强大的能力背后是对工程实现的更高要求. 本文档系统性地剖析了从基础的Transformer架构到复杂的MoE层的构建细节, 并重点阐述了应对MoE训练不稳定性的核心工程技术, 包括:</p>
<ul>
<li><p><strong>使用辅助损失</strong>来保证专家负载均衡.</p>
</li>
<li><p><strong>实施严格的精度控制</strong>, 尤其是对路由器模块.</p>
</li>
<li><p><strong>采用专门的权重初始化</strong>方案.</p>
</li>
</ul>
<p>通过<strong>nanoMoE</strong>的实证案例, 我们验证了这些技术组合的有效性, 证明了即使在消费级硬件上, 只要遵循严谨的工程实践, 也能成功训练先进的MoE模型. 对于致力于前沿大模型研发的工程师而言, 掌握这些实践是驾驭MoE这项强大技术的关键.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yy-xsh-llm-jgdyjqy","text":"1. 引言: 稀疏化—LLM架构的演进前沿"},{"level":2,"id":"2-jcjg-decoder-only-transformer-px","text":"2. 基础架构: Decoder-Only Transformer剖析"},{"level":3,"id":"2-1-sjsrlsx-cwbdzl","text":"2.1 数据输入流水线: 从文本到张量"},{"level":3,"id":"2-2-hxjsdy-transformer-mk","text":"2.2 核心计算单元: Transformer模块"},{"level":4,"id":"2-2-1-zcy-dygymddtzzyl","text":"2.2.1 子层一: 带因果掩码的多头自注意力"},{"level":4,"id":"2-2-2-zce-zdqkwl","text":"2.2.2 子层二: 逐点前馈网络"},{"level":4,"id":"2-2-3-mklj-ccycgyh","text":"2.2.3 模块连接: 残差与层归一化"},{"level":3,"id":"2-3-mxscysc","text":"2.3 模型输出与生成"},{"level":2,"id":"3-moe-jgsdjx","text":"3. MoE架构深度解析"},{"level":3,"id":"3-1-hxzj-zjcylyq","text":"3.1 核心组件: 专家层与路由器"},{"level":3,"id":"3-2-gctzyjjfa","text":"3.2 工程挑战与解决方案"},{"level":4,"id":"3-2-1-tzy-dtfzyjsxs","text":"3.2.1 挑战一: 动态负载与计算效率"},{"level":4,"id":"3-2-2-tze-xlbwdx","text":"3.2.2 挑战二: 训练不稳定性"},{"level":2,"id":"4-alyj-clgjyxl-nano-mo-e","text":"4. 案例研究: 从零构建与训练nanoMoE"},{"level":3,"id":"4-1-sypz","text":"4.1 实验配置"},{"level":3,"id":"4-2-wdxsyyjg","text":"4.2 稳定性实验与结果"},{"level":3,"id":"4-3-fxzn","text":"4.3 复现指南"},{"level":2,"id":"5-jl","text":"5. 结论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/02-moe-dgcsj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/02-moe-dgcsj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE大模型架构的工程实践与深度解析</h1>
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
