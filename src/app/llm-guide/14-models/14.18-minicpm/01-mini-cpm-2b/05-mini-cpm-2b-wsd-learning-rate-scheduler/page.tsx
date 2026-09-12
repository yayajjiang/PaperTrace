"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM WSD 学习率调度器深度解析</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文定位: MiniCPM 技术报告第 3 节 &quot;WSD Learning Rate Scheduler&quot;
关联文档: <code>01-MiniCPM-2B技术报告精译.md</code> 第 3 节</p>
</blockquote>
<hr>
<h2 id="1-wtbj-cttdqdjx">1 问题背景: 传统调度器的局限</h2>
<h3 id="1-1-yxthdwt">1.1 余弦退火的问题</h3>
<p>在大型语言模型训练中, 最常用的学习率调度器是余弦退火(cosine annealing):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>η</mi><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>η</mi><mrow><mi>m</mi><mi>i</mi><mi>n</mi></mrow></msub><mo>+</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo stretchy="false">(</mo><msub><mi>η</mi><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub><mo>−</mo><msub><mi>η</mi><mrow><mi>m</mi><mi>i</mi><mi>n</mi></mrow></msub><mo stretchy="false">)</mo><mrow><mo fence="true">(</mo><mn>1</mn><mo>+</mo><mi>cos</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mi>t</mi><mi>T</mi></mfrac><mi>π</mi><mo fence="true">)</mo></mrow><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\eta(t) = \\eta_{min} + \\frac{1}{2}(\\eta_{max} - \\eta_{min})\\left(1 + \\cos\\left(\\frac{t}{T}\\pi\\right)\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">min</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">2</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">x</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">min</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2921em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>其中 T 是预先定义的总训练步数. 余弦退火的核心假设是: 学习率应该在训练过程中持续、平滑地下降, 以适应模型从&quot;粗调&quot;到&quot;精调&quot;的需求.</p>
<p>但这一设计存在三个关键局限:</p>
<p><strong>第一, 必须预定义总步数.</strong> 如果训练过程中发现模型尚未收敛, 需要延长训练, 余弦调度器无法直接续训——因为它需要知道总步数才能计算当前步的学习率. 常见的 workaround 是&quot;重启&quot;(re-warmup), 但这会引入训练不稳定性.</p>
<p><strong>第二, 中间检查点不可用.</strong> 在 T/2 处保存的检查点, 其学习率已经衰减到接近 η_min, 如果直接使用这个检查点进行推理或微调, 性能通常不如在衰减前保存的检查点.</p>
<p><strong>第三, 衰减阶段不可控.</strong> 余弦调度器将衰减分布在整个训练过程中, 无法利用&quot;最后阶段引入高质量数据&quot;这一策略.</p>
<h3 id="1-2-xxsjydxssjdbz">1.2 线性衰减与多项式衰减的不足</h3>
<p>线性衰减和多项式衰减同样面临上述问题, 且衰减曲线更为僵硬, 缺乏余弦的平滑性.</p>
<hr>
<h2 id="2-yl-wsd-dsjdsj">2 原理: WSD 的三阶段设计</h2>
<h3 id="2-1-sxdy">2.1 数学定义</h3>
<p>WSD 将训练过程明确划分为三个阶段:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>W</mi><mi>S</mi><mi>D</mi><mo stretchy="false">(</mo><mi>T</mi><mo separator="true">;</mo><mi>s</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mfrac><mi>s</mi><mi>W</mi></mfrac><mi>η</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>s</mi><mo>&lt;</mo><mi>W</mi><mspace width="1em"/><mtext>(Warmup)</mtext></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>η</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>W</mi><mo>≤</mo><mi>s</mi><mo>≤</mo><mi>T</mi><mspace width="1em"/><mtext>(Stable)</mtext></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mi>η</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>T</mi><mo>&lt;</mo><mi>s</mi><mspace width="1em"/><mtext>(Decay)</mtext></mrow></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">WSD(T; s) = \\begin{cases}
\\frac{s}{W} \\eta, &amp; s &lt; W \\quad \\text{(Warmup)} \\\\
\\eta, &amp; W \\leq s \\leq T \\quad \\text{(Stable)} \\\\
f(s-T) \\eta, &amp; T &lt; s \\quad \\text{(Decay)}
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:4.32em;vertical-align:-1.91em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.35em;"><span style="top:-2.2em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎩</span></span></span><span style="top:-2.192em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.316em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"/></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎨</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.316em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"/></svg></span></span><span style="top:-4.6em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎧</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.85em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.41em;"><span style="top:-4.41em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6954em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mpunct">,</span></span></span><span style="top:-2.97em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mpunct">,</span></span></span><span style="top:-1.53em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mpunct">,</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.91em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.41em;"><span style="top:-4.41em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">(Warmup)</span></span></span></span><span style="top:-2.97em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">(Stable)</span></span></span></span><span style="top:-1.53em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">(Decay)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.91em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中:</p>
<ul>
<li>W 是热身阶段的结束步数</li>
<li>T 是稳定阶段的结束步数(即衰减阶段的开始步数)</li>
<li>η 是最大学习率</li>
<li>f(s-T) 是单调递减函数, 满足 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0</mn><mo>&lt;</mo><mi>f</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mo>≤</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">0 &lt; f(s-T) \\leq 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6835em;vertical-align:-0.0391em;"></span><span class="mord">0</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span></li>
</ul>
<p>通常选择 f 为余弦衰减或指数衰减形式:</p>
<p><strong>余弦衰减变体</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mrow><mo fence="true">(</mo><mn>1</mn><mo>+</mo><mi>cos</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><mi>s</mi><mo>−</mo><mi>T</mi></mrow><mrow><mi>S</mi><mo>−</mo><mi>T</mi></mrow></mfrac><mi>π</mi><mo fence="true">)</mo></mrow><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">f(s-T) = \\frac{1}{2}\\left(1 + \\cos\\left(\\frac{s-T}{S-T}\\pi\\right)\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">2</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p><strong>指数衰减变体</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mo>=</mo><mi>exp</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mo>−</mo><mi>λ</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">f(s-T) = \\exp\\left(-\\lambda(s-T)\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord">−</span><span class="mord mathnormal">λ</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span></span></span></span></span><h3 id="2-2-gjddwlyy">2.2 各阶段的物理意义</h3>
<p><strong>Warmup 阶段</strong>: 学习率从 0 线性增长到 η. 这一阶段的作用是避免训练初期的梯度爆炸, 让优化器逐步适应数据分布. 经验上, W 通常设置为总步数的 1%-2%.</p>
<p><strong>Stable 阶段</strong>: 学习率保持在 η 不变. 这是训练的主体阶段, 模型在高学习率下快速探索参数空间, 建立基础的语言表征和知识. 稳定阶段的损失下降通常较为平缓.</p>
<p><strong>Decay 阶段</strong>: 学习率从 η 衰减到接近 0. 这是 WSD 的核心创新所在. MiniCPM 的作者发现, 在衰减阶段, 训练损失会出现突然的显著下降——这种现象被称为&quot;衰减阶段的损失骤降&quot;(loss sudden drop in decay).</p>
<blockquote>
<p>译者注: &quot;损失骤降&quot;现象是 WSD 最令人惊讶的发现. 直观上, 学习率下降应该导致更缓慢的参数更新, 损失下降应该更平缓. 但实验观察到的恰恰相反——当学习率从高值(如 0.1)开始衰减时, 损失曲线出现一个明显的&quot;悬崖式&quot;下降. 一个可能的解释是: 在稳定阶段, 模型参数在一个高学习率下&quot;振荡&quot;, 无法精细地落入局部最小值的底部. 当学习率开始衰减时, 振荡幅度减小, 参数可以更深入地探索当前区域的细节, 从而发现更好的最小值. 这与模拟退火(simulated annealing)中的&quot;温度降低帮助系统找到基态&quot;有相似之处.</p>
</blockquote>
<hr>
<h2 id="3-gcsxxj">3 工程实现细节</h2>
<h3 id="3-1-sjhsdxz">3.1 衰减函数的选择</h3>
<p>MiniCPM 实验中比较了多种衰减函数:</p>
<table>
<thead>
<tr>
<th>衰减函数</th>
<th>公式</th>
<th>特点</th>
</tr>
</thead>
<tbody><tr>
<td>线性衰减</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mn>1</mn><mo>−</mo><mi>x</mi><mi mathvariant="normal">/</mi><mo stretchy="false">(</mo><mi>S</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">f(x) = 1 - x/(S-T)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">x</span><span class="mord">/</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span></span></span></span></td>
<td>简单, 但衰减后期学习率下降过快</td>
</tr>
<tr>
<td>余弦衰减</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mn>0.5</mn><mo stretchy="false">(</mo><mn>1</mn><mo>+</mo><mi>cos</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mi>π</mi><mi mathvariant="normal">/</mi><mo stretchy="false">(</mo><mi>S</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">f(x) = 0.5(1 + \\cos(x\\pi/(S-T)))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.5</span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">cos</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mord">/</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)))</span></span></span></span></td>
<td>平滑, 后期衰减更慢, 推荐</td>
</tr>
<tr>
<td>指数衰减</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mo>−</mo><mi>λ</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">f(x) = \\exp(-\\lambda x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord">−</span><span class="mord mathnormal">λ</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></td>
<td>超参 λ 需调, 可能衰减过快</td>
</tr>
</tbody></table>
<p>实验结果表明, 余弦衰减变体在大多数场景下表现最佳.</p>
<h3 id="3-2-sjbldxz">3.2 衰减比例的选择</h3>
<p>衰减阶段的 token 数量占总训练 token 的比例(称为 annealing ratio)是一个关键超参. MiniCPM 的实验表明:</p>
<ul>
<li>衰减比例过小(&lt; 5%): 衰减阶段的损失骤降不充分, 模型未能充分精炼.</li>
<li>衰减比例过大(&gt; 20%): 稳定阶段过短, 模型探索不充分.</li>
<li>最优比例: 约 10%-15% 的总 token.</li>
</ul>
<p>这一比例与模型大小和数据质量有关. 对于更大的模型或更高质量的数据, 可能需要更长的衰减阶段.</p>
<h3 id="3-3-yljdyxldjh">3.3 与两阶段预训练的结合</h3>
<p>WSD 的三阶段结构天然适合&quot;两阶段预训练&quot;策略:</p>
<pre><code>阶段一: 大规模通用数据预训练(稳定阶段)
  ↓
阶段二: 高质量数据退火(衰减阶段)
  ↓
阶段三: SFT / DPO / RLHF
</code></pre>
<p>MiniCPM 的关键发现是: 在衰减阶段混入 SFT 数据(高质量对话数据), 其效果优于仅在 SFT 阶段使用这些数据. 这说明&quot;预训练级别的退火&quot;比&quot;单独的 SFT&quot;更能激活模型的能力.</p>
<blockquote>
<p>译者注: 这一发现对训练实践有直接影响. 传统流程是: 预训练 → SFT → RLHF, 三个阶段的边界清晰. MiniCPM 的发现暗示, 可以在预训练的衰减阶段就引入 SFT 数据, 实现&quot;预训练到微调的平滑过渡&quot;. 这种策略后来被广泛采用, 如 DeepSeek-V3 的&quot;高质量数据退火&quot;、Qwen2.5 的&quot;post-training 数据混入预训练&quot;等.</p>
</blockquote>
<hr>
<h2 id="4-scaling-law-yjffl">4 Scaling Law 研究方法论</h2>
<h3 id="4-1-ctffdecfcb">4.1 传统方法的二次方成本</h3>
<p>研究数据-模型缩放规律的传统方法(Hoffmann et al., 2022)需要在模型轴和数据轴上进行网格搜索:</p>
<ul>
<li>模型轴: 训练 m 种不同规模的模型</li>
<li>数据轴: 每种模型训练 d 种不同数据量的变体</li>
<li>总成本: O(m × d × C), 其中 C 是单次完整训练的计算成本</li>
</ul>
<p>当 m 和 d 都较大时, 这 rapidly 变得不可行.</p>
<h3 id="4-2-wsd-dxxcbff">4.2 WSD 的线性成本方法</h3>
<p>WSD 使得缩放规律研究的成本大幅降低:</p>
<ul>
<li>模型轴: 训练 m 种不同规模的模型(成本 O(mC))</li>
<li>数据轴: 对于每种模型, 在稳定阶段训练到足够大的数据量, 然后从不同检查点(对应不同数据量)进入衰减阶段</li>
<li>总成本: O(mC + m × d × C_decay), 其中 C_decay &lt;&lt; C(衰减阶段通常只占 10% 的 token)</li>
</ul>
<p>因此, 总成本从 O(m × d × C) 降低到 O(mC), 实现了线性级别的效率提升.</p>
<h3 id="4-3-nhjg">4.3 拟合结果</h3>
<p>MiniCPM 使用以下幂律拟合损失:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>N</mi><mo separator="true">,</mo><mi>D</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>C</mi><mi>N</mi></msub><msup><mi>N</mi><mrow><mo>−</mo><mi>α</mi></mrow></msup><mo>+</mo><msub><mi>C</mi><mi>D</mi></msub><msup><mi>D</mi><mrow><mo>−</mo><mi>β</mi></mrow></msup><mo>+</mo><msub><mi>L</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">L(N, D) = C_N N^{-\\alpha} + C_D D^{-\\beta} + L_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9713em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8213em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0491em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>拟合得到的参数显示, 对于 SLM 区域( &lt; 3B), 最优数据-模型比 D/N 远高于 Chinchilla 的建议值:</p>
<table>
<thead>
<tr>
<th>区域</th>
<th>Chinchilla Optimal D/N</th>
<th>MiniCPM 发现 D/N</th>
</tr>
</thead>
<tbody><tr>
<td>LLM (&gt; 10B)</td>
<td>~20</td>
<td>~20</td>
</tr>
<tr>
<td>SLM (&lt; 3B)</td>
<td>~20</td>
<td>~40-60</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 这一发现意味着, 小模型应该&quot;吃更多的数据&quot;. 对于 2B 模型, Chinchilla 建议训练约 40B token, 但 MiniCPM 的发现暗示 80B-120B token 可能更优. 这一结论与后续研究一致: 例如, Llama-3.2 1B 使用了约 100B token 训练, Qwen2.5 0.5B 使用了约 50B token. 但需要注意, &quot;更多的数据&quot;也有边际递减效应, 且数据来源的质量比数量更重要.</p>
</blockquote>
<hr>
<h2 id="5-tldb">5 同类对比</h2>
<h3 id="5-1-y-cosine-tdqddb">5.1 与 Cosine 调度器的对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Cosine</th>
<th>WSD</th>
</tr>
</thead>
<tbody><tr>
<td>总步数要求</td>
<td>必须预定义</td>
<td>无需预定义</td>
</tr>
<tr>
<td>中间检查点可用性</td>
<td>差(学习率已衰减)</td>
<td>优(高学习率状态)</td>
</tr>
<tr>
<td>持续训练支持</td>
<td>需重启</td>
<td>直接衰减</td>
</tr>
<tr>
<td>高质量数据退火</td>
<td>困难</td>
<td>天然支持</td>
</tr>
<tr>
<td>训练动态</td>
<td>单调递减</td>
<td>稳定→骤降</td>
</tr>
<tr>
<td>超参复杂度</td>
<td>低</td>
<td>中(需调衰减比例)</td>
</tr>
</tbody></table>
<h3 id="5-2-y-step-decay-ddb">5.2 与 Step Decay 的对比</h3>
<p>Step Decay(步进衰减)在特定步数将学习率乘以一个因子(如 0.1). 与 WSD 相比:</p>
<ul>
<li>Step Decay 的衰减是离散的、突发的, 而 WSD 的衰减是连续的、平滑的.</li>
<li>Step Decay 的衰减时机难以确定, 而 WSD 的衰减阶段可以灵活调整.</li>
</ul>
<h3 id="5-3-hxgzdyx">5.3 后续工作的影响</h3>
<p>WSD 的设计思想影响了多个后续工作:</p>
<ul>
<li><strong>DeepSeek-V2/V3</strong>: 在预训练最后阶段使用高质量数据进行&quot;退火&quot;, 与 WSD 的衰减阶段策略一致.</li>
<li><strong>Llama-3</strong>: 在预训练的最后阶段使用高质量数据, 并在衰减阶段进行多次数据混合调整.</li>
<li><strong>Qwen2.5</strong>: 在 post-training 中采用类似的两阶段策略.</li>
<li><strong>Power Scheduler</strong>: 基于 WSD 扩展, 结合 μP(Maximum Update Parameterization)实现零样本学习率迁移.</li>
</ul>
<hr>
<h2 id="6-jxyfx">6 局限与风险</h2>
<h3 id="6-1-syfw">6.1 适用范围</h3>
<p>WSD 的结论主要在 SLM 区域( &lt; 3B)验证. 在 LLM 区域( &gt; 10B), 最优的数据-模型比可能回归 Chinchilla 的建议值. 直接将 WSD 的结论外推到大模型可能存在风险.</p>
<h3 id="6-2-sjjddbwdx">6.2 衰减阶段的不稳定性</h3>
<p>衰减阶段的&quot;损失骤降&quot;虽然带来性能提升, 但也可能导致训练不稳定. 如果衰减速度过快或衰减函数选择不当, 模型可能陷入糟糕的局部最小值.</p>
<h3 id="6-3-yxyjcssdjrx">6.3 与现有基础设施的兼容性</h3>
<p>许多训练框架(如 Megatron-LM、DeepSpeed)对学习率调度器的支持基于 Cosine 或 Linear. 引入 WSD 可能需要修改框架代码, 增加了工程成本.</p>
<h3 id="6-4-zlyl">6.4 质量依赖</h3>
<p>WSD 的优势很大程度上依赖于&quot;衰减阶段的高质量数据&quot;. 如果高质量数据不足或质量不高, WSD 的优势会显著减小.</p>
<hr>
<h2 id="7-jspxyyx">7 技术谱系与影响</h2>
<p>WSD 的发展脉络如下:</p>
<pre><code>2017: Transformer + Adam + Linear Warmup (Vaswani et al.)
  |
2020: Cosine Annealing 成为 LLM 训练标准 (GPT-3, LLaMA)
  |
2022: Chinchilla Scaling Law 提出数据-模型最优比 (Hoffmann et al.)
  |
2024.04: WSD 提出, 三阶段调度 + 损失骤降发现 (MiniCPM)
  |
2024+: Power Scheduler 扩展 WSD + μP (后续工作)
  |
2024+: 高质量数据退火成为行业标准 (DeepSeek, Llama-3, Qwen2.5)
</code></pre>
<p>WSD 的遗产在于它首次系统性地证明了&quot;学习率衰减阶段可以作为一个独立的能力优化阶段&quot;, 而不仅仅是&quot;训练收尾&quot;. 这一思想直接推动了&quot;预训练+退火+SFT&quot;三阶段训练范式的普及.</p>
<hr>
<h2 id="8-jl">8 结论</h2>
<p>Warmup-Stable-Decay(WSD)学习率调度器是 MiniCPM 的核心技术创新. 它通过将训练过程分为热身、稳定和衰减三个阶段, 解决了传统余弦调度器必须预定义总步数、中间检查点不可用、无法支持高质量数据退火等局限.</p>
<p>WSD 的关键发现——衰减阶段的&quot;损失骤降&quot;——揭示了学习率衰减不仅是训练的收尾, 更是一个独立的能力优化阶段. 基于 WSD, MiniCPM 高效地研究了 SLM 区域的缩放规律, 发现最优数据-模型比远高于 Chinchilla Optimal.</p>
<p>WSD 的设计思想已被广泛采纳, 成为端侧模型训练的重要工具, 并推动了&quot;高质量数据退火&quot;成为行业共识.</p>
<hr>
<blockquote>
<p><strong>知识库同步</strong></p>
<p>本文档同步至: <code>docs/guide/llm/training/wsd-scheduler-minicpm.md</code>
本文档来源: <code>docs/sections/llm-guide/14-主流开源模型全景解析与技术报告精读/14.18-MiniCPM/01-MiniCPM-2B/05-MiniCPM-2B-WSD-Learning-Rate-Scheduler.md</code></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj-cttdqdjx","text":"1 问题背景: 传统调度器的局限"},{"level":3,"id":"1-1-yxthdwt","text":"1.1 余弦退火的问题"},{"level":3,"id":"1-2-xxsjydxssjdbz","text":"1.2 线性衰减与多项式衰减的不足"},{"level":2,"id":"2-yl-wsd-dsjdsj","text":"2 原理: WSD 的三阶段设计"},{"level":3,"id":"2-1-sxdy","text":"2.1 数学定义"},{"level":3,"id":"2-2-gjddwlyy","text":"2.2 各阶段的物理意义"},{"level":2,"id":"3-gcsxxj","text":"3 工程实现细节"},{"level":3,"id":"3-1-sjhsdxz","text":"3.1 衰减函数的选择"},{"level":3,"id":"3-2-sjbldxz","text":"3.2 衰减比例的选择"},{"level":3,"id":"3-3-yljdyxldjh","text":"3.3 与两阶段预训练的结合"},{"level":2,"id":"4-scaling-law-yjffl","text":"4 Scaling Law 研究方法论"},{"level":3,"id":"4-1-ctffdecfcb","text":"4.1 传统方法的二次方成本"},{"level":3,"id":"4-2-wsd-dxxcbff","text":"4.2 WSD 的线性成本方法"},{"level":3,"id":"4-3-nhjg","text":"4.3 拟合结果"},{"level":2,"id":"5-tldb","text":"5 同类对比"},{"level":3,"id":"5-1-y-cosine-tdqddb","text":"5.1 与 Cosine 调度器的对比"},{"level":3,"id":"5-2-y-step-decay-ddb","text":"5.2 与 Step Decay 的对比"},{"level":3,"id":"5-3-hxgzdyx","text":"5.3 后续工作的影响"},{"level":2,"id":"6-jxyfx","text":"6 局限与风险"},{"level":3,"id":"6-1-syfw","text":"6.1 适用范围"},{"level":3,"id":"6-2-sjjddbwdx","text":"6.2 衰减阶段的不稳定性"},{"level":3,"id":"6-3-yxyjcssdjrx","text":"6.3 与现有基础设施的兼容性"},{"level":3,"id":"6-4-zlyl","text":"6.4 质量依赖"},{"level":2,"id":"7-jspxyyx","text":"7 技术谱系与影响"},{"level":2,"id":"8-jl","text":"8 结论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/01-mini-cpm-2b/05-mini-cpm-2b-wsd-learning-rate-scheduler" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/01-mini-cpm-2b/05-mini-cpm-2b-wsd-learning-rate-scheduler" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM WSD 学习率调度器深度解析</h1>
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
