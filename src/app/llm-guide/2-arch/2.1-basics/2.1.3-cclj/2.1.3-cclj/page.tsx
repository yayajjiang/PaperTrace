"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2.1.3 残差连接：从 ResNet 到 Transformer 的稳定主干</h1>
<p>残差连接(Residual Connection)是现代深度学习里最不起眼、却最不能缺的结构之一. 它看起来只是一个简单的相加操作，却几乎重写了深层网络的训练方式. 没有它，网络一旦变深，梯度传播、信息保持和优化稳定性都会迅速恶化; 有了它，模型才真正获得了「安全地变深」的能力. </p>
<p>很多人第一次看到残差连接时，会觉得它只是一个工程技巧：把输入 <code>x</code> 直接加回输出就完了. 但如果只把它理解成技巧，就会低估它的地位. 残差连接真正解决的，不是某一个孤立问题，而是深层网络里的一个系统性矛盾：**模型既要不断加工表示，又不能在每一层都把已有信息和梯度通路彻底重写. **</p>
<p>对大语言模型来说，这种矛盾比 ResNet 时代更尖锐. 因为 Transformer 不只是深，而且每一层都同时包含 Attention、FFN、归一化和残差主干. 模型要想在几十层、上百层甚至更深的结构里保持可训练、可扩展、可部署，残差连接几乎是默认前提. </p>
<p>本文围绕五个问题展开：</p>
<ol>
<li>残差连接到底在解决什么问题. </li>
<li>为什么「学习修正」比「重学映射」更容易. </li>
<li>梯度高速公路到底是怎么形成的. </li>
<li>为什么残差连接在 Transformer 里会与 Pre-Norm、FFN、Attention 深度绑定. </li>
<li>为什么残差连接会继续成为大模型工程的基础设施.</li>
</ol>
<h2 id="1-ccljddzjjsmwt">1. 残差连接到底在解决什么问题</h2>
<p>在残差连接出现之前，深度学习里有一个很反直觉的现象：网络更深，理论上表达能力更强，但实际训练结果反而可能更差. 这种现象通常被称为<strong>退化问题</strong>. 这里的「退化」不是过拟合，而是说：即使在训练集上，更深的网络也不一定比更浅的网络优化得更好. </p>
<p>这背后有两个核心原因. 第一，梯度路径变得过长. 网络每多一层，反向传播就要再多穿过一次局部 Jacobian; 层数一多，梯度就更容易在连乘中衰减或爆炸. 第二，前向信息会被层层覆盖. 每一层都在改写表示，如果没有保底通路，早期层里本来有价值的信息很容易在中途丢失. </p>
<p>换句话说，深层网络并不只是「层更多」，而是同时面临两种风险：</p>
<ol>
<li><strong>梯度难以安全回传</strong></li>
<li><strong>输入信息难以稳定保留</strong></li>
</ol>
<p>残差连接的价值，就在于它同时给这两件事加了一条保底路径. </p>
<h2 id="2-ccljdsxxs-wsms-h-x-f-x-x-h-x-f-x-x-h-x-f-x-x">2. 残差连接的数学形式：为什么是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>+</mo><mi>x</mi></mrow><annotation encoding="application/x-tex">H(x)=F(x)+x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span></h2>
<p>残差连接最经典的写法是：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>H</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>+</mo><mi>x</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">H(x)=F(x)+x \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>这里 <code>x</code> 是输入表示，<code>F(x)</code> 是若干层网络学到的变换结果，<code>H(x)</code> 是残差块最终输出. 这个公式表面上只是多了一项输入直连，但它彻底改变了网络的学习目标. </p>
<p>如果没有残差连接，子网络必须直接学会完整映射 <code>H(x)</code>. 有了残差连接后，子网络只需要学习：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mi>H</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>−</mo><mi>x</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">F(x)=H(x)-x \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>也就是说，它不再被要求「重做整个映射」，而是只需要学习「在现有表示基础上补多少修正」. </p>
<p>这就是残差的本质：**网络学的不是从零开始的重建，而是在已有结果上的增量修正. ** 在很多实际任务里，这比直接学习完整映射容易得多. 因为如果当前层什么都不做其实已经不算太差，那么最优更新往往更接近一个小修正，而不是一场彻底重写. </p>
<blockquote>
<p>配图建议：插在残差公式后，用一张对比图把“直接学 H(x)”和“只学 F(x)”讲清楚. 
图片描述：左侧是普通深层块必须直接拟合完整映射，右侧是残差块只学习增量修正，并有一条 identity 路径直接通过. 
GPT-Image-2 Prompt：Technical educational figure comparing direct mapping and residual learning in deep neural networks. White background, research-paper style. Left panel: a deep block learning the full mapping H(x). Right panel: a residual block learning only F(x) while input x passes through an identity shortcut and is added back. Annotate with labels direct mapping, residual correction, identity path, easier optimization. Minimal academic palette, blue and orange arrows, readable labels, no decorative art, no watermark.
<img src="/llm-guide/2-arch/2.1-basics/2.1.3-cclj/2.1.3-cclj/images/image_1.png" alt=""></p>
</blockquote>
<blockquote>
<p>图 1: 残差学习把“直接拟合完整映射”改成了“只学习增量修正”，从而显著降低优化难度. </p>
</blockquote>
<h2 id="3-wsmxxxzbxxzjgry">3. 为什么学习修正比学习重建更容易</h2>
<p>如果某一层最理想的行为只是「大体保持输入不变，只做一点局部修正」，那么普通网络必须想办法把很多非线性层联合优化成近似恒等映射. 这在实践中并不容易. 相反，残差结构只要让 <code>F(x)</code> 趋近于零，就能自然退化成恒等映射. </p>
<p>这件事很重要，因为它让「更深的网络至少不要比浅层更差」变成了可实现目标. 哪怕新增层暂时没学到特别有用的东西，它也可以先学会不破坏原有表示. 于是深层网络不再被迫“一上来就每层都很有用”，而是允许部分层先当保守修正器，之后再逐步承担更多表达任务. </p>
<p>从优化角度看，这等于把很多难问题变成了更接近零中心的小问题. 一个小修正通常比一个完整替代更容易靠梯度下降找到. </p>
<h2 id="4-tdgsglszmxcd">4. 梯度高速公路是怎么形成的</h2>
<p>残差连接最常见的说法之一，是它构造了「梯度高速公路」. 这句话不是比喻口号，而是可以直接从求导里看出来. 若：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>y</mi><mo>=</mo><mi>x</mi><mo>+</mo><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">y=x+F(x) \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>这里的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 表示模型训练时的损失函数，也就是模型当前输出与目标答案之间的总体误差. 那么损失函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 对输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 的梯度为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mfrac><mrow><mi mathvariant="normal">∂</mi><mi>L</mi></mrow><mrow><mi mathvariant="normal">∂</mi><mi>x</mi></mrow></mfrac><mo>=</mo><mfrac><mrow><mi mathvariant="normal">∂</mi><mi>L</mi></mrow><mrow><mi mathvariant="normal">∂</mi><mi>y</mi></mrow></mfrac><mrow><mo fence="true">(</mo><mi>I</mi><mo>+</mo><mfrac><mrow><mi mathvariant="normal">∂</mi><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><mi mathvariant="normal">∂</mi><mi>x</mi></mrow></mfrac><mo fence="true">)</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\frac{\\partial L}{\\partial x}
=
\\frac{\\partial L}{\\partial y}
\\left(I+\\frac{\\partial F(x)}{\\partial x}\\right) \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.0574em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal">x</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal">x</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span><span class="tag"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>这里最关键的不是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mrow><mi mathvariant="normal">∂</mi><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><mi mathvariant="normal">∂</mi><mi>x</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\frac{\\partial F(x)}{\\partial x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.355em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.01em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal mtight">x</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.485em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">F</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>，而是那个恒等项 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>I</mi></mrow><annotation encoding="application/x-tex">I</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span></span></span></span>. 它意味着：即使子层内部的梯度变得很弱，主干路径上仍然存在一条不依赖子层质量的直接回传通路. </p>
<p>更直白地说，残差连接并不保证梯度永远漂亮，但它保证了梯度<strong>不至于完全被局部坏层堵死</strong>. 这对深层网络训练极其关键. 因为现代大模型的现实并不是“每一层都训练得很完美”，而是“局部不完美依然要让全局训练继续”. </p>
<h2 id="5-ccljrhbhqxxx">5. 残差连接如何保护前向信息</h2>
<p>残差连接不只在反向传播里有价值，在前向传播里也同样重要. 没有残差时，模型默认每层都在重写表示; 有了残差后，模型默认保留原输入，再叠加修正. 这使得前面的有用信息不容易被后面的子层彻底覆盖. </p>
<p>这对语言模型尤其关键. 一个 token 的最终表示，往往同时承载：</p>
<ol>
<li>原始词义</li>
<li>句法角色</li>
<li>上下文依赖</li>
<li>任务指令偏置</li>
<li>领域风格信息</li>
</ol>
<p>如果每层都完全覆盖上一层表示，这些不同层次的信息很容易彼此冲刷. 残差主干让它们更容易以叠加方式共存，而不是以“后层彻底替换前层”的方式竞争. </p>
<blockquote>
<p>配图建议：插在信息保持段后面，说明主干保留与修正分支共存. 
图片描述：一条主干 identity 路径保持原始表示，旁边子层输出增量修正，最后两者相加得到更丰富但未失去原始信息的表示. 
GPT-Image-2 Prompt：Technical educational diagram of residual connection as information-preserving backbone. White background, research-paper style. Show a main identity path carrying original representation and a side branch producing incremental correction. The two are added to form a richer output while preserving core information. Label original signal, correction branch, residual add, preserved representation. Blue and orange arrows, minimal academic palette, no decorative art, no watermark.
<img src="/llm-guide/2-arch/2.1-basics/2.1.3-cclj/2.1.3-cclj/images/image_2.png" alt=""></p>
</blockquote>
<blockquote>
<p>图 2: 残差主干负责保留原表示，子层分支负责叠加修正，因此信息更容易以“保留 + 增量”方式持续流动. </p>
</blockquote>
<h2 id="6-c-res-net-d-transformer-ccljdjszmbl">6. 从 ResNet 到 Transformer：残差连接的角色怎么变了</h2>
<p>在 ResNet 中，残差连接最直接的任务是解决卷积网络变深后的优化退化问题. 但到了 Transformer 里，它的角色进一步升级了. </p>
<p>Transformer 每层通常都包含两个重型子层：</p>
<ol>
<li>Attention</li>
<li>FFN</li>
</ol>
<p>这两个子层都可能对输入做很强变换. 如果没有残差主干，表示在层间会漂移得非常厉害，梯度路径也会更脆弱. 因此在 Transformer 里，残差连接已经不只是“帮助训练”，而是<strong>构成整个主干信息流的默认骨架</strong>. </p>
<p>更具体地说，Attention 和 FFN 更像在主干上不断写入修正项，而不是彻底接管主干. 现代大模型真正持续贯通全网的，往往不是某个子层，而是残差主路径本身. </p>
<h2 id="7-ccljwsmy-pre-norm-sdbd">7. 残差连接为什么与 Pre-Norm 深度绑定</h2>
<p>残差连接在 Transformer 里之所以能发挥到极致，与归一化层位置密切相关. 最关键的分歧就是：</p>
<p>Post-Norm：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>x</mi><mrow><mi>l</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><mtext>Norm</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><mi>F</mi><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">x_{l+1}=\\text{Norm}(x_l+F(x_l)) \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Norm</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><p>Pre-Norm：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>x</mi><mrow><mi>l</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><mi>F</mi><mo stretchy="false">(</mo><mtext>Norm</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(6)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">x_{l+1}=x_l+F(\\text{Norm}(x_l)) \\tag{6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord text"><span class="mord">Norm</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">6</span></span><span class="mord">)</span></span></span></span></span></span><p>两者差别不只是「Norm 放哪儿」，而是<strong>残差主干是否保持纯净恒等通路</strong>. 在 Pre-Norm 里，输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>l</mi></msub></mrow><annotation encoding="application/x-tex">x_l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 几乎原样沿主干往下走，Norm 和子层都被放到旁路修正里; 在 Post-Norm 里，连主干相加后的结果也要立刻再穿过一层归一化. </p>
<p>这也是为什么深层大模型几乎一边倒选择 Pre-Norm. 它优先保护的是那条最重要的主干：不让残差路径本身被每层额外数值变换反复打扰. </p>
<h2 id="8-ccljdgcyy-bzswdxl">8. 残差连接的工程意义：不只是稳定训练</h2>
<p>残差连接的工程价值远不止「能训练更深」. 在现代大模型里，它至少还影响四件事：</p>
<ol>
<li><strong>量化稳定性</strong>主干保留了更稳定的参考表示，子层只做增量修正，这通常比完全覆盖式变换更容易控制量化误差. </li>
<li><strong>参数高效微调</strong>LoRA、Adapter 等方法本质上也是在主干上添加增量修正. 残差结构天然适合这类“外挂式改动”. </li>
<li><strong>多阶段训练迁移</strong>预训练、SFT、对齐、蒸馏等多个阶段，都更容易建立在稳定主干之上做增量行为修正，而不是整网重写. </li>
<li><strong>模块可组合性</strong>
新模块、新桥接器、新工具路径，更容易以旁路修正方式接入，而不是要求完全替代原有主干.</li>
</ol>
<p>这些现象背后是同一个原则：<strong>稳定主干 + 增量修正</strong> 比 <strong>每一层都彻底重写</strong> 更适合大规模系统演化. </p>
<h2 id="9-xlhbssygzdksm">9. 训练和部署时应该重点看什么</h2>
<p>如果你在训练或部署一个深层模型，残差路径本身也值得单独观察. 最值得看的通常有：</p>
<ol>
<li>残差分支输出与主干幅值的比例</li>
<li>各层 residual add 前后的 RMS / 方差变化</li>
<li>深层主干幅值是否持续扩张</li>
<li>子层是否长期学不到有效修正</li>
<li>量化后 residual add 是否引入明显精度损失</li>
</ol>
<p>一个很常见的误区是：以为 residual add 只是 “<code>x + something</code>” 的机械操作，不值得看. 但在深层网络里，残差分支太强会破坏主干，太弱又说明子层不起作用. 它不是“有没有”的问题，而是“修正强度是否合理”的问题. </p>
<blockquote>
<p>配图建议：插在训练与部署检查项后面，展示主干幅值、修正分支幅值和 residual add 的监控逻辑. 
图片描述：一张残差连接诊断图，显示主干 identity 路径、子层修正分支、相加节点，以及旁边的监控指标：branch/main ratio、RMS drift、quantization sensitivity. 
GPT-Image-2 Prompt：Technical diagnostics figure for residual connections in large language models. White background, research-paper systems style. Show identity backbone, correction branch, residual add node, and side monitoring panels for branch-to-main ratio, RMS drift, gradient highway, and quantization sensitivity. Use blue, orange, and green accents, precise labels, no decorative art, no watermark.
<img src="/llm-guide/2-arch/2.1-basics/2.1.3-cclj/2.1.3-cclj/images/image_3.png" alt=""></p>
</blockquote>
<blockquote>
<p>图 3: 残差连接的工程检查重点，不只是“有没有主干”，而是“主干与修正分支之间的幅值关系是否健康”. </p>
</blockquote>
<h2 id="10-jjsx-ccky-transformer-cczg">10. 极简实现：残差块与 Transformer 残差主干</h2>
<p>最简形式的残差块，可以写成：</p>
<pre><code class="language-python">import torch
import torch.nn as nn


class ResidualBlock(nn.Module):
    def __init__(self, module: nn.Module):
        super().__init__()
        self.module = module

    def forward(self, x: torch.Tensor) -&gt; torch.Tensor:
        return x + self.module(x)


class PreNormResidual(nn.Module):
    def __init__(self, norm: nn.Module, module: nn.Module):
        super().__init__()
        self.norm = norm
        self.module = module

    def forward(self, x: torch.Tensor) -&gt; torch.Tensor:
        return x + self.module(self.norm(x))
</code></pre>
<p>第一段是最基础的残差结构：主干原样通过，旁路负责增量修正. 第二段则更接近现代大模型：在修正分支前先做归一化，但主干本身尽量保持纯净. </p>
<p>这也说明了残差连接的实现并不复杂，复杂的是它在整个系统中的作用. 它之所以重要，不是因为代码难，而是因为它决定了深层模型的默认信息流到底长什么样. </p>
<h2 id="11-jsqz-ccljhhzmyh">11. 技术前瞻：残差连接还会怎么演化</h2>
<p>残差连接本身已经非常经典，但它仍然有演化空间. 未来最值得持续关注的方向包括：</p>
<ol>
<li>残差幅值控制会更精细例如 residual scaling、DeepNorm、不同层深度下的主干配方优化. </li>
<li>与量化路径的协同会更重要特别是在低比特推理中，residual add 的精度选择可能直接影响模型稳定性. </li>
<li>与模块化插桩的关系会更紧密Adapter、LoRA、工具增强、多模态桥接等路线，本质上都在继续利用残差哲学. </li>
<li>更复杂主干结构可能出现
例如多分支残差、门控残差、带权重的残差融合等.</li>
</ol>
<p>但无论形式怎么演化，残差连接的核心原则大概率不会变：**默认保留已有表示，只让子层为真正必要的变化负责. **</p>
<h2 id="12-bjxj">12. 本节小结</h2>
<p>残差连接之所以成为现代深度学习的基础设施，不是因为它数学上多复杂，而是因为它极其现实地解决了深层系统的核心矛盾：模型越深，越需要一条不依赖局部子层质量的稳定主干. </p>
<p>它让层学会做修正，而不是重做; 让梯度学会穿越，而不是挣扎; 让表示学会累积，而不是不断被冲刷. 从 ResNet 到 Transformer，再到今天的大语言模型，残差连接已经不只是一个历史技巧，而是深层模型设计里最稳定、最持久、也最不可替代的原则之一. </p>
<h2 id="13-ckwx">13. 参考文献</h2>
<ol>
<li><a href="https://arxiv.org/abs/1512.03385">He, K., Zhang, X., Ren, S., &amp; Sun, J. (2016). Deep Residual Learning for Image Recognition.</a> <em>CVPR / arXiv</em>.</li>
<li><a href="https://arxiv.org/abs/1706.03762">Vaswani, A., et al. (2017). Attention Is All You Need.</a> <em>NeurIPS / arXiv</em>.</li>
<li><a href="https://arxiv.org/abs/1607.06450">Ba, J. L., Kiros, J. R., &amp; Hinton, G. E. (2016). Layer Normalization.</a> <em>arXiv:1607.06450</em>.</li>
<li><a href="https://arxiv.org/abs/1910.07467">Zhang, B., &amp; Sennrich, R. (2019). Root Mean Square Layer Normalization.</a> <em>NeurIPS Workshop / arXiv</em>.</li>
<li><a href="https://arxiv.org/abs/2002.05202">Shazeer, N. (2020). GLU Variants Improve Transformer.</a> <em>arXiv:2002.05202</em>.</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-ccljddzjjsmwt","text":"1. 残差连接到底在解决什么问题"},{"level":2,"id":"2-ccljdsxxs-wsms-h-x-f-x-x-h-x-f-x-x-h-x-f-x-x","text":"2. 残差连接的数学形式：为什么是 H ( x ) = F ( x ) + x H(x)=F(x)+x H ( x ) = F ( x ) + x"},{"level":2,"id":"3-wsmxxxzbxxzjgry","text":"3. 为什么学习修正比学习重建更容易"},{"level":2,"id":"4-tdgsglszmxcd","text":"4. 梯度高速公路是怎么形成的"},{"level":2,"id":"5-ccljrhbhqxxx","text":"5. 残差连接如何保护前向信息"},{"level":2,"id":"6-c-res-net-d-transformer-ccljdjszmbl","text":"6. 从 ResNet 到 Transformer：残差连接的角色怎么变了"},{"level":2,"id":"7-ccljwsmy-pre-norm-sdbd","text":"7. 残差连接为什么与 Pre-Norm 深度绑定"},{"level":2,"id":"8-ccljdgcyy-bzswdxl","text":"8. 残差连接的工程意义：不只是稳定训练"},{"level":2,"id":"9-xlhbssygzdksm","text":"9. 训练和部署时应该重点看什么"},{"level":2,"id":"10-jjsx-ccky-transformer-cczg","text":"10. 极简实现：残差块与 Transformer 残差主干"},{"level":2,"id":"11-jsqz-ccljhhzmyh","text":"11. 技术前瞻：残差连接还会怎么演化"},{"level":2,"id":"12-bjxj","text":"12. 本节小结"},{"level":2,"id":"13-ckwx","text":"13. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.1-basics/2.1.3-cclj/2.1.3-cclj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.1-basics/2.1.3-cclj/2.1.3-cclj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2.1.3 残差连接：从 ResNet 到 Transformer 的稳定主干</h1>
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
