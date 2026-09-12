"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi Attention Residuals：当层间残差混合变成深度维注意力</h1>
<p>Kimi 团队提出的 <a href="https://arxiv.org/abs/2603.15031">Attention Residuals(AttnRes)</a> 看起来像是在改残差连接, 但如果从机制上看, 它真正改写的是一件更底层的事：<strong>深度维上的历史层表示到底应该怎样被当前层聚合.</strong></p>
<p>标准 Transformer 的残差主干默认使用固定相加规则. 每一层都把自己的输出加回主干, 形成一条从浅层到深层不断累积的表示流. 这种设计极其稳定, 也非常成功, 但它隐含了一个默认假设：<strong>所有历史层输出都应该以统一、固定、同权的方式累积.</strong></p>
<p>Kimi 团队认为, 这个假设在超深模型里开始变得不够理想. 因为随着层数增加, 表示幅值会逐步膨胀, 而每一层自身的独特贡献却会在统一累积中被逐渐稀释. 论文把这种现象总结为 <strong>PreNorm dilution</strong>, 也就是 Pre-Norm Transformer 下, 层与层之间的有效贡献会在固定残差累积中被不断冲淡.</p>
<p>Attention Residuals 的核心切入点, 不是「要不要残差连接」, 而是：<strong>历史层表示是否还应该继续用固定加法混合, 还是应该让当前层通过注意力主动选择更重要的历史表示.</strong></p>
<p>这也是为什么它更适合被放在「注意力机制变体」目录, 而不是放在残差连接基础篇里. 它虽然确实改的是 residual mixing, 但方法核心已经变成了<strong>深度维注意力聚合</strong>.</p>
<h2 id="1-bz-pre-norm-ccljddysmwt">1. 标准 Pre-Norm 残差累积到底有什么问题</h2>
<p>在标准 Pre-Norm 结构中, 第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi></mrow><annotation encoding="application/x-tex">l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span> 层可以写成：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>h</mi><mi>l</mi></msub><mo>=</mo><msub><mi>h</mi><mrow><mi>l</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>+</mo><msub><mi>F</mi><mi>l</mi></msub><mo stretchy="false">(</mo><mtext>Norm</mtext><mo stretchy="false">(</mo><msub><mi>h</mi><mrow><mi>l</mi><mo>−</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">h_l = h_{l-1} + F_l(\\text{Norm}(h_{l-1})) \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9028em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Norm</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>这里 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mrow><mi>l</mi><mo>−</mo><mn>1</mn></mrow></msub></mrow><annotation encoding="application/x-tex">h_{l-1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9028em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span></span> 是上一层主干表示, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>F</mi><mi>l</mi></msub><mo stretchy="false">(</mo><mo>⋅</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">F_l(\\cdot)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord">⋅</span><span class="mclose">)</span></span></span></span> 是当前层子网络对它做出的修正. 这个结构极其成功, 因为它保住了残差主干的恒等通路, 并允许子层只做增量修改.</p>
<p>但当网络非常深时, 这种固定累积方式会带来两个副作用. 第一, 主干表示会随着层数不断叠加, 导致 hidden-state magnitudes 持续增长. 第二, 由于所有层都默认按单位权重叠加, 个别层本来很有辨识度的修正贡献, 会在越来越长的累积链中被逐渐平均化.</p>
<p>这件事可以更直白地理解：标准残差默认认为“所有历史层输出都值得同样保留”. 可现实并不一定如此. 某些层的信号也许更像短期修正, 某些层的信号也许更该长期保留. 固定相加没有能力表达这种选择.</p>
<p>因此, AttnRes 不是在否定残差主干, 而是在质疑：<strong>历史层表示为什么必须全部一视同仁.</strong></p>
<h2 id="2-pre-norm-dilution-wsmcdgxhbxs">2. PreNorm dilution：为什么层的贡献会被稀释</h2>
<p>Kimi 团队在论文摘要和官方仓库 README 里都强调了一个核心现象：随着深度增加, Pre-Norm 结构下会出现 <strong>dilution effect</strong>. 这个词如果直接照搬, 很容易显得抽象. 它的更直观含义是：</p>
<ol>
<li>每一层的输出都被加进主干;</li>
<li>主干越来越大;</li>
<li>单层修正所占比例越来越小;</li>
<li>于是某一层本来有辨识度的贡献, 在总和里越来越难被凸显.</li>
</ol>
<p>这就像你不断往一大桶水里加一小杯不同颜色的液体. 前几次变化很明显, 后面每一杯都会越来越容易被整桶背景色稀释掉. 深层残差主干里的「层贡献变淡」就是这个逻辑.</p>
<p>这种稀释问题不仅影响表达, 也影响训练. 因为一旦层贡献更难凸显, 梯度就更难在深度维上把“哪一层应该改更多”这件事学清楚. 结果往往是：</p>
<ul>
<li>深层表示幅值越来越大;</li>
<li>层间贡献越来越平均;</li>
<li>梯度分配越来越不均;</li>
<li>一部分层变得更像在“被动随大流”, 而不是主动承担结构功能.</li>
</ul>
<p>AttnRes 正是要对这个深度累积机制动手.</p>
<h2 id="3-attention-residuals-dhxxf">3. Attention Residuals 的核心想法</h2>
<p>AttnRes 最核心的一步, 是把“固定残差加法”改成“按注意力权重聚合历史层表示”. Kimi 团队 README 给出的核心形式是：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="bold">h</mi><mi>l</mi></msub><mo>=</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>0</mn></mrow><mrow><mi>l</mi><mo>−</mo><mn>1</mn></mrow></munderover><msub><mi>α</mi><mrow><mi>i</mi><mo>→</mo><mi>l</mi></mrow></msub><mtext> </mtext><msub><mi mathvariant="bold">v</mi><mi>i</mi></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbf{h}_l = \\sum_{i=0}^{l-1} \\alpha_{i \\to l}\\,\\mathbf{v}_i \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">0</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">→</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>这里 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">v</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\mathbf{v}_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是来自历史层 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的 value 向量, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mrow><mi>i</mi><mo>→</mo><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\alpha_{i \\to l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">→</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 则表示当前层 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi></mrow><annotation encoding="application/x-tex">l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span> 对历史层 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的聚合权重.</p>
<p>这个公式最重要的变化不是把“加法”换成了“求和”, 而是把原来固定为 1 的主干累积权重, 换成了由模型动态学习的注意力权重. 也就是说, 当前层不再被迫把所有历史层都等权叠加, 而是可以主动决定：</p>
<ol>
<li>哪些早层更值得保留;</li>
<li>哪些中层贡献更重要;</li>
<li>哪些层只该被弱引用;</li>
<li>哪些层几乎可以被忽略.</li>
</ol>
<p>这使得层间表示混合不再是固定规则, 而变成了一个<strong>深度维上的内容相关选择过程</strong>.</p>
<h2 id="4-wsmzbzsyjszyljz">4. 为什么这本质上已经是注意力机制</h2>
<p>如果只看“它改了残差连接”, 很容易把 AttnRes 误分类为残差结构小变体. 但只要看它的计算方式, 就会发现它已经满足了注意力的基本定义：</p>
<ol>
<li>有一个历史表示集合可供检索;</li>
<li>有一套动态计算的权重;</li>
<li>有一个加权聚合输出.</li>
</ol>
<p>这三条正是标准注意力的核心结构, 只不过这里的注意力轴不是 token 维, 而是<strong>深度维</strong>. 你可以把它理解成一种 depth-wise attention：</p>
<ul>
<li>普通自注意力：当前 token 对历史 token 选择性聚合;</li>
<li>Attention Residuals：当前层对历史层选择性聚合.</li>
</ul>
<p>因此, AttnRes 更适合被理解成「注意力机制向深度维扩展」的结果, 而不是普通残差连接上的一个小参数调整.</p>
<h2 id="5-trhhjfzpzhcgxxs">5. 它如何缓解幅值膨胀和层贡献稀释</h2>
<p>一旦把固定加法变成注意力聚合, AttnRes 就获得了两个直接能力.</p>
<p>第一, 它不再需要把所有层输出都无条件等权叠加, 因此主干幅值更容易保持在可控范围. 标准残差里, 深度越深, 所有层修正都往一个桶里倒; AttnRes 则允许当前层只取自己真正需要的部分, 因此输出 magnitudes across depth 更容易保持均匀.</p>
<p>第二, 它让层贡献从“机械累积”变成“选择性引用”. 某一层如果真的含有重要结构信号, 就可以通过更大的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mrow><mi>i</mi><mo>→</mo><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\alpha_{i\\to l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">→</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 被更明确地保留下来; 如果某层只是噪声更大、泛化价值更低, 也可以被弱化. 于是每层的贡献不再天然被后续累积冲淡.</p>
<p>从论文摘要给出的结论看, AttnRes 最终带来了：</p>
<ol>
<li>更均匀的输出幅值;</li>
<li>更均匀的梯度分布;</li>
<li>相比标准 Pre-Norm 更好的收敛与效果.</li>
</ol>
<p>这说明它不是只在“理论上更优雅”, 而是真的改变了深度维上的信号管理方式.</p>
<h2 id="6-wsmbnzjdsylscqlzzyl">6. 为什么不能直接对所有历史层全量做注意力</h2>
<p>最朴素的 AttnRes 想法, 是让每一层直接对所有之前的层做全量注意力. 可这在工程上会立刻遇到代价问题：你不仅要保留所有历史层表示, 还要为每个当前层计算完整深度注意力, 这会让训练内存和通信成本迅速变得不可接受.</p>
<p>所以论文进一步提出了 <strong>Block Attention Residuals</strong>. 它的核心思路是：</p>
<ol>
<li>局部 block 内继续使用标准残差积累;</li>
<li>block 之间再通过注意力做更粗粒度聚合.</li>
</ol>
<p>这样一来, 模型不必在全深度上做最昂贵的全量注意, 而是只在更粗粒度的 block 表示上做选择. 你可以把它理解成：</p>
<ul>
<li>细粒度层内保留残差简单性;</li>
<li>粗粒度层间引入注意力选择性.</li>
</ul>
<p>这种设计很像很多高效注意力路线的共同哲学：不是完全拒绝全局交互, 而是把它移到一个更便宜、更抽象的层级去完成.</p>
<h2 id="7-kimi-wsmbtjj-kimi-linear">7. Kimi 为什么把它接进 Kimi Linear</h2>
<p>AttnRes 并不是停留在「小模型上做一个概念实验」. 根据论文摘要, 它被接入了 <strong>Kimi Linear</strong>, 并在一个大规模预训练设置中验证：</p>
<ul>
<li>48B total parameters</li>
<li>3B activated parameters</li>
<li>1.4T pretraining tokens</li>
</ul>
<p>这说明 Kimi 团队不是把它当一个论文点子, 而是把它当作一种真正能放进大模型主干里的结构机制来评估.</p>
<p>更重要的是, Kimi Linear 本身就带有强工程导向：它并不是在纯标准 dense Transformer 上追求理论美感, 而是在一个更强调效率与可扩展性的系统里看 AttnRes 是否还能成立. 换句话说, AttnRes 不是“理想环境里的小修饰”, 而是被放到现实预训练系统里测了一次.</p>
<h2 id="8-wsmtbshfjccljjcp">8. 为什么它不适合放进残差连接基础篇</h2>
<p>残差连接基础篇的任务, 应该优先解释：</p>
<ol>
<li>什么是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">x+F(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span>;</li>
<li>为什么它构造了梯度高速公路;</li>
<li>为什么它保护前向信息;</li>
<li>为什么它与 Pre-Norm 绑定.</li>
</ol>
<p>AttnRes 则已经跨到了另一个问题：</p>
<ol>
<li>标准残差为什么会在深度维上稀释层贡献;</li>
<li>固定加法是否还应该继续做默认层间聚合方式;</li>
<li>历史层表示能否像 token 一样被注意力检索;</li>
<li>深度维聚合如何兼顾效果与工程成本.</li>
</ol>
<p>因此, AttnRes 不是“残差连接是什么”的内容, 而是“注意力机制还能不能扩展到深度维”的内容. 它当然和残差连接强相关, 但如果把它塞进残差连接基础篇, 会导致整篇文档主题从「解释基础残差哲学」突然跳到「深度维注意力聚合」, 读者主线会被直接打断.</p>
<h2 id="9-ty-hc-mhc-dbj">9. 它与 HC / mHC 的边界</h2>
<p>AttnRes、HC、mHC 看起来都在改 residual mixing, 但它们处理的问题并不一样.</p>
<p>HC / mHC 的核心问题是：</p>
<ol>
<li>残差主干是否只该有一条流;</li>
<li>多条残差流如何交互;</li>
<li>这种交互怎样不破坏 identity mapping.</li>
</ol>
<p>AttnRes 的核心问题则是：</p>
<ol>
<li>历史层输出是否还应该等权累积;</li>
<li>当前层是否应该通过注意力选择历史层;</li>
<li>深度维聚合怎样从固定加法变成动态读取.</li>
</ol>
<p>所以, HC / mHC 仍主要属于<strong>残差主干设计</strong>; 而 AttnRes 则更像<strong>深度维注意力机制</strong>. 两者都在挑战“标准残差的默认答案”, 但挑战的方向不同.</p>
<h2 id="10-gcszzdjtddj">10. 工程上最值得警惕的代价</h2>
<p>AttnRes 很吸引人的地方, 是它提供了更灵活的深度混合能力; 但这也意味着几类新的工程代价会出现.</p>
<p>第一, <strong>历史层表示要保留多久</strong> 会变成问题. 标准残差只需要主干自然流过, 而 AttnRes 需要把可被查询的历史层表示以某种形式保留下来.</p>
<p>第二, <strong>深度维注意力本身要花多少算力</strong> 会成为问题. 哪怕不是 token 维全注意, 层维注意力本身也会带来额外矩阵操作和缓存开销.</p>
<p>第三, <strong>训练稳定性与梯度分布</strong> 会重新成为焦点. 因为你不再只是让梯度沿固定残差主干走, 而是让层与层之间发生注意力式重配, 这对优化器和归一化路径都会带来新要求.</p>
<p>第四, <strong>与现有 fused kernel / 并行策略的兼容性</strong> 也不再自动成立. 标准残差连接之所以工程上舒适, 很大程度上是因为所有框架都默认知道怎么高效做 <code>x + F(x)</code>. AttnRes 则要求更多新的内核与调度设计.</p>
<p>这意味着 AttnRes 的问题从来不只是「效果好不好」, 而是：**它值不值得为这种更强的深度表达, 再付出一套新的工程复杂度. **</p>
<h2 id="11-bjxj">11. 本节小结</h2>
<p>Kimi 的 Attention Residuals 真正做的, 不是简单“把残差改一下”, 而是把「层与层之间的表示混合」本身变成了注意力问题. 标准残差连接默认所有历史层都用固定权重累积, 而 AttnRes 让当前层可以按输入内容, 选择性聚合更早层表示.</p>
<p>正因为如此, 它更适合被归入「注意力机制新变体」, 而不是残差连接基础篇. 它关心的核心已经不是「如何保住一条稳定残差主干」, 而是「如何用注意力机制重写深度维上的信息聚合规则」.</p>
<p>这也是它最值得继续跟踪的地方：如果标准注意力改写了 token 之间的交互方式, 那么 Attention Residuals 正在尝试改写层与层之间的交互方式.</p>
<h2 id="12-ckwx">12. 参考文献</h2>
<ol>
<li><a href="https://arxiv.org/abs/2603.15031">Kimi Team et al. (2026). Attention Residuals.</a> <em>arXiv:2603.15031</em>.</li>
<li><a href="https://github.com/MoonshotAI/Attention-Residuals">MoonshotAI/Attention-Residuals (official repository).</a></li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-bz-pre-norm-ccljddysmwt","text":"1. 标准 Pre-Norm 残差累积到底有什么问题"},{"level":2,"id":"2-pre-norm-dilution-wsmcdgxhbxs","text":"2. PreNorm dilution：为什么层的贡献会被稀释"},{"level":2,"id":"3-attention-residuals-dhxxf","text":"3. Attention Residuals 的核心想法"},{"level":2,"id":"4-wsmzbzsyjszyljz","text":"4. 为什么这本质上已经是注意力机制"},{"level":2,"id":"5-trhhjfzpzhcgxxs","text":"5. 它如何缓解幅值膨胀和层贡献稀释"},{"level":2,"id":"6-wsmbnzjdsylscqlzzyl","text":"6. 为什么不能直接对所有历史层全量做注意力"},{"level":2,"id":"7-kimi-wsmbtjj-kimi-linear","text":"7. Kimi 为什么把它接进 Kimi Linear"},{"level":2,"id":"8-wsmtbshfjccljjcp","text":"8. 为什么它不适合放进残差连接基础篇"},{"level":2,"id":"9-ty-hc-mhc-dbj","text":"9. 它与 HC / mHC 的边界"},{"level":2,"id":"10-gcszzdjtddj","text":"10. 工程上最值得警惕的代价"},{"level":2,"id":"11-bjxj","text":"11. 本节小结"},{"level":2,"id":"12-ckwx","text":"12. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.2-attention/2.2.2-dtzylbt/kimi-attention-residuals-sdwzyljh" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.2-attention/2.2.2-dtzylbt/kimi-attention-residuals-sdwzyljh" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi Attention Residuals：当层间残差混合变成深度维注意力</h1>
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
