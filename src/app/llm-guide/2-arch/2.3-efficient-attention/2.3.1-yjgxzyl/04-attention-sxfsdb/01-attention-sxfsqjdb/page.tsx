"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>04 Attention 实现方式全景对比: 从手动实现到 FlashAttention</h1>
<blockquote>
<p>来源: 知乎专栏 (<a href="https://zhuanlan.zhihu.com/p/2029243648827467520">https://zhuanlan.zhihu.com/p/2029243648827467520</a>)
标签: #Attention #SDPA #FlashAttention #xFormers #性能优化</p>
</blockquote>
<hr>
<h2 id="1-yy-tyd-attention-btdsx-xzdxs">1. 引言: 同样的 Attention, 不同的实现, 显著的效率</h2>
<p>Attention 机制的数学定义是唯一的对于查询矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>B</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>D</mi></mrow></msup></mrow><annotation encoding="application/x-tex">Q \\in \\mathbb{R}^{B \\times N \\times H \\times D}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span></span></span></span></span></span></span></span>, 键矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 和值矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span>, 输出由式 (1) 计算: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><mi>D</mi></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{D}}\\right)V \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.1833em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9267em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span><span style="top:-2.8867em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1133em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span><span class="tag"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>式 (1) 中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 为批次大小, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 为序列长度, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 为注意力头数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span> 为每个头的维度. 然而, <strong>实现这一公式的代码路径有数十种</strong>, 从最朴素的 PyTorch 逐行实现到高度优化的 CUDA kernel, 性能差距可达 <strong>10 倍以上</strong>, 显存占用差距可达 <strong>20 倍以上</strong>. </p>
<p>本文基于 H800 GPU 的实测数据, 系统对比四种主流实现方式: 手动实现, PyTorch SDPA, FlashAttention 和 xFormers. 我们将从计算复杂度, 内存访问模式, 硬件利用率三个维度展开分析, 并给出工业级的选型建议. </p>
<hr>
<h2 id="2-szsxfs-ylysycj">2. 四种实现方式: 原理与适用场景</h2>
<h3 id="2-1-sdsx-na-ve-py-torch">2.1 手动实现(Naïve PyTorch)</h3>
<p>手动实现严格遵循式 (1) 的三步计算流程: </p>
<p><strong>Step 1 计算注意力分数</strong>: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>S</mi><mo>=</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><mi>D</mi></msqrt></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">S = \\frac{QK^T}{\\sqrt{D}} \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4483em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.1833em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9267em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span><span style="top:-2.8867em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1133em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.4483em;vertical-align:-0.93em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>式 (2) 中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>B</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>N</mi></mrow></msup></mrow><annotation encoding="application/x-tex">S \\in \\mathbb{R}^{B \\times H \\times N \\times N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span></span></span></span></span></span></span></span> 为注意力分数矩阵, 其计算量(FLOPs)为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mi>D</mi></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 \\cdot D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>(每次乘加运算计 2 FLOPs). </p>
<p><strong>Step 2 Softmax 归一化</strong>: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>A</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>S</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></munderover><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>S</mi><mrow><mi>i</mi><mi>k</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">A_{ij} = \\frac{\\exp(S_{ij})}{\\sum_{k=1}^{N} \\exp(S_{ik})} \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5979em;vertical-align:-1.1709em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.1288em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9812em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">ik</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1709em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.5979em;vertical-align:-1.1709em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>式 (3) 对每一行进行指数归一化, 产生注意力权重矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>B</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>N</mi></mrow></msup></mrow><annotation encoding="application/x-tex">A \\in \\mathbb{R}^{B \\times H \\times N \\times N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">A</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span></span></span></span></span></span></span></span>. </p>
<p><strong>Step 3 加权求和</strong>: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>O</mi><mo>=</mo><mi>A</mi><mi>V</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">O = AV \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>式 (4) 的 FLOPs 同样为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mi>D</mi></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 \\cdot D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>. </p>
<p><strong>核心缺陷</strong>: </p>
<ul>
<li><strong>显存物化 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span></strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span> 均为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>N</mi></mrow><annotation encoding="application/x-tex">B \\times H \\times N \\times N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 的浮点矩阵, 显存占用为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mn>4</mn><mtext> bytes</mtext></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 \\cdot 4\\text{ bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">4</span><span class="mord text"><span class="mord"> bytes</span></span></span></span></span>(FP32)或 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mn>2</mn><mtext> bytes</mtext></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 \\cdot 2\\text{ bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span></span></span></span>(FP16)</li>
<li><strong>三次独立的 HBM 读写</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo>→</mo><mi>S</mi></mrow><annotation encoding="application/x-tex">Q,K \\to S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo>→</mo><mi>A</mi></mrow><annotation encoding="application/x-tex">S \\to A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi><mo separator="true">,</mo><mi>V</mi><mo>→</mo><mi>O</mi></mrow><annotation encoding="application/x-tex">A,V \\to O</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">A</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span></span></span></span>, 每次都要经过高延迟的 GPU 全局内存(HBM)</li>
<li><strong>无算子融合</strong>: PyTorch Eager 模式下的三个操作各自启动 CUDA kernel, 每次启动都有固定开销</li>
</ul>
<h3 id="2-2-sdpa-py-torch-gf-scaled-dot-product-attention">2.2 SDPA(PyTorch 官方 <code>scaled_dot_product_attention</code>)</h3>
<p>PyTorch 2.0+ 引入的 <code>F.scaled_dot_product_attention</code> 是一个<strong>调度层(Dispatch Layer)</strong>, 它根据输入参数和设备条件自动选择最优后端: </p>
<table>
<thead>
<tr>
<th align="left">后端</th>
<th align="left">触发条件</th>
<th align="left">技术特点</th>
</tr>
</thead>
<tbody><tr>
<td align="left">FlashAttention-2</td>
<td align="left">CUDA + head_dim 128 + sm80+</td>
<td align="left">内存重计算 + tiling</td>
</tr>
<tr>
<td align="left">Memory-Efficient Attention</td>
<td align="left">CUDA + 特定 shape</td>
<td align="left">xFormers 风格的融合 kernel</td>
</tr>
<tr>
<td align="left">CUBLAS</td>
<td align="left">fallback</td>
<td align="left">标准矩阵乘法</td>
</tr>
<tr>
<td align="left">Math</td>
<td align="left">CPU / 不支持的配置</td>
<td align="left">标准 PyTorch 实现</td>
</tr>
</tbody></table>
<p>SDPA 的核心价值在于<strong>自动选择</strong>: 开发者无需手动判断当前配置适合哪种实现, 框架自动完成调度. 其内部通过 CUDA Graph 或算子融合技术, 将式 (2)-(4) 的三步合并为一个 fused kernel, 消除了中间矩阵的 HBM 物化. </p>
<h3 id="2-3-flash-attention">2.3 FlashAttention</h3>
<p>FlashAttention 的核心思想不是降低 FLOPs(式 (1) 的计算量下限不可突破), 而是<strong>降低内存访问开销(Memory Access Cost, MAC)</strong>. 其关键创新包括: </p>
<p><strong>Tiling 分块策略</strong>: </p>
<p>将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi></mrow><annotation encoding="application/x-tex">Q, K, V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 按序列维度切分为小块(tile), 每块加载到快速的 SRAM(Shared Memory)中, 计算局部 softmax 后只输出聚合结果, 不存储中间注意力矩阵. </p>
<p><strong>Online Softmax</strong>: </p>
<p>FlashAttention 采用 streaming 方式计算 softmax. 设当前已处理 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>j</mi></mrow><annotation encoding="application/x-tex">j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span></span></span></span> 个 key, 累积的指数和为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mi>j</mi></msub><mo>=</mo><msubsup><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>j</mi></msubsup><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>m</mi><mi>k</mi></msub><mo>−</mo><msub><mi>m</mi><mi>j</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">L_j = \\sum_{k=1}^{j} \\exp(m_k - m_j)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2643em;vertical-align:-0.2997em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9646em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>m</mi><mi>j</mi></msub><mo>=</mo><msub><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>k</mi><mo>≤</mo><mi>j</mi></mrow></msub><msub><mi>s</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">m_j = \\max_{k \\leq j} s_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mop"><span class="mop">max</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mrel mtight">≤</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为当前最大值. 当新的 key <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">j+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 到来时: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>m</mi><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>m</mi><mi>j</mi></msub><mo separator="true">,</mo><msub><mi>s</mi><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">m_{j+1} = \\max(m_j, s_{j+1}) \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>L</mi><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>L</mi><mi>j</mi></msub><mo>⋅</mo><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>m</mi><mi>j</mi></msub><mo>−</mo><msub><mi>m</mi><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo><mo>+</mo><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>s</mi><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>−</mo><msub><mi>m</mi><mrow><mi>j</mi><mo>+</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(6)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">L_{j+1} = L_j \\cdot \\exp(m_j - m_{j+1}) + \\exp(s_{j+1} - m_{j+1}) \\tag{6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">6</span></span><span class="mord">)</span></span></span></span></span></span><p>式 (5)(6) 使得 softmax 可以在流式扫描中增量计算, 无需存储完整的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>×</mo><mi>N</mi></mrow><annotation encoding="application/x-tex">N \\times N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 分数矩阵. </p>
<p><strong>限制</strong>: </p>
<ul>
<li>head_dim 不能超过 256(当前版本)</li>
<li>需要 CUDA 11.6+ 和 sm80+(A100/H100)</li>
<li>不支持所有 Attention 变体(如局部 Attention, 稀疏 Attention)</li>
</ul>
<h3 id="2-4-x-formers">2.4 xFormers</h3>
<p>Meta 开源的 xFormers 库提供了<strong>多种 Attention 变体的统一接口</strong>: </p>
<ul>
<li><code>memory_efficient_attention</code>: 基于 CUTLASS 的通用融合 kernel</li>
<li><code>local_attention</code>: 滑动窗口 Attention</li>
<li><code>linformer_attention</code>: 低秩近似 Attention</li>
<li><code>nystrom_attention</code>: Nyström 方法近似</li>
</ul>
<p>xFormers 的优势在于<strong>灵活性</strong>当 FlashAttention 不支持特定配置时, xFormers 通常有对应的实现. 但通用性带来的代价是: 在标准配置下, 其性能通常略低于专门优化的 FlashAttention 或 SDPA. </p>
<hr>
<h2 id="3-xnsc-h800-gpu-qwddb">3. 性能实测: H800 GPU 全维度对比</h2>
<h3 id="3-1-sypz">3.1 实验配置</h3>
<table>
<thead>
<tr>
<th align="left">参数</th>
<th align="left">值</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPU</td>
<td align="left">NVIDIA H800 (80GB)</td>
</tr>
<tr>
<td align="left">CUDA</td>
<td align="left">12.2</td>
</tr>
<tr>
<td align="left">PyTorch</td>
<td align="left">2.3.1</td>
</tr>
<tr>
<td align="left">flash-attn</td>
<td align="left">2.7.4.post1</td>
</tr>
<tr>
<td align="left">xformers</td>
<td align="left">0.0.27</td>
</tr>
<tr>
<td align="left">基准配置</td>
<td align="left">B=64, N=1024, H=16, D=64</td>
</tr>
</tbody></table>
<h3 id="3-2-bly-batch-size-gd-n-1024-h-16-d-64">3.2 变量一: Batch Size(固定 N=1024, H=16, D=64)</h3>
<p><strong>计算耗时对比</strong>: </p>
<table>
<thead>
<tr>
<th align="left">batch_size</th>
<th align="left">手动实现 (s)</th>
<th align="left">SDPA (s)</th>
<th align="left">FlashAttention (s)</th>
<th align="left">xFormers (s)</th>
<th align="left">SDPA 加速比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1</td>
<td align="left">0.00012</td>
<td align="left">0.000037</td>
<td align="left">0.000048</td>
<td align="left">0.000084</td>
<td align="left">3.2×</td>
</tr>
<tr>
<td align="left">8</td>
<td align="left">0.00083</td>
<td align="left">0.000134</td>
<td align="left">0.000164</td>
<td align="left">0.000186</td>
<td align="left">6.2×</td>
</tr>
<tr>
<td align="left">64</td>
<td align="left">0.00617</td>
<td align="left">0.000897</td>
<td align="left">0.000952</td>
<td align="left">0.000980</td>
<td align="left">6.9×</td>
</tr>
<tr>
<td align="left">512</td>
<td align="left">0.04906</td>
<td align="left">0.006859</td>
<td align="left">0.007751</td>
<td align="left">0.007593</td>
<td align="left">7.2×</td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>: SDPA 在所有 batch_size 下均保持 3~7 倍加速, 且优势随 batch_size 增大而扩大. 原因在于更大的 batch 更容易占满 GPU 的 Streaming Multiprocessor(SM), 减少 kernel 启动的固定开销占比. </p>
<p><strong>显存占用对比</strong>: </p>
<table>
<thead>
<tr>
<th align="left">batch_size</th>
<th align="left">手动实现 (MB)</th>
<th align="left">SDPA (MB)</th>
<th align="left">FlashAttention (MB)</th>
<th align="left">xFormers (MB)</th>
<th align="left">SDPA 节省率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1</td>
<td align="left">106</td>
<td align="left">44</td>
<td align="left">46</td>
<td align="left">48</td>
<td align="left">58.5%</td>
</tr>
<tr>
<td align="left">8</td>
<td align="left">672</td>
<td align="left">152</td>
<td align="left">160</td>
<td align="left">168</td>
<td align="left">77.4%</td>
</tr>
<tr>
<td align="left">64</td>
<td align="left">5152</td>
<td align="left">996</td>
<td align="left">1060</td>
<td align="left">1124</td>
<td align="left">80.7%</td>
</tr>
<tr>
<td align="left">512</td>
<td align="left">40992</td>
<td align="left">7744</td>
<td align="left">8256</td>
<td align="left">8768</td>
<td align="left">81.1%</td>
</tr>
</tbody></table>
<p>显存节省的物理原因: 手动实现需要物化 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 矩阵(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>N</mi></mrow><annotation encoding="application/x-tex">B \\times H \\times N \\times N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span>)和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span> 矩阵(同样大小), 而融合实现通过重计算(recomputation)消除了这一存储需求. 当 B=512 时, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo>+</mo><mi>A</mi></mrow><annotation encoding="application/x-tex">S+A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span> 的显存为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mn>512</mn><mo>×</mo><mn>16</mn><mo>×</mo><msup><mn>1024</mn><mn>2</mn></msup><mo>×</mo><mn>2</mn><mtext> bytes</mtext><mo>=</mo><mn>32.5</mn></mrow><annotation encoding="application/x-tex">2 \\times 512 \\times 16 \\times 1024^2 \\times 2\\text{ bytes} = 32.5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">512</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord">102</span><span class="mord"><span class="mord">4</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">32.5</span></span></span></span> GB, 这正是手动实现与 SDPA 差距的主要来源. </p>
<h3 id="3-3-ble-xlcd-gd-b-64-h-16-d-64">3.3 变量二: 序列长度(固定 B=64, H=16, D=64)</h3>
<p><strong>计算耗时对比</strong>: </p>
<table>
<thead>
<tr>
<th align="left">seq_len</th>
<th align="left">手动实现 (s)</th>
<th align="left">SDPA (s)</th>
<th align="left">FlashAttention (s)</th>
<th align="left">xFormers (s)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">64</td>
<td align="left">0.00011</td>
<td align="left">0.000042</td>
<td align="left">0.000054</td>
<td align="left">0.000088</td>
</tr>
<tr>
<td align="left">512</td>
<td align="left">0.00177</td>
<td align="left">0.000259</td>
<td align="left">0.000281</td>
<td align="left">0.000313</td>
</tr>
<tr>
<td align="left">1024</td>
<td align="left">0.00616</td>
<td align="left">0.000902</td>
<td align="left">0.000959</td>
<td align="left">0.001000</td>
</tr>
<tr>
<td align="left">4096</td>
<td align="left">0.08889</td>
<td align="left">0.013295</td>
<td align="left">0.014418</td>
<td align="left">0.014291</td>
</tr>
</tbody></table>
<p><strong>复杂度分析</strong>: Attention 的计算复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. 从数据可见, 当 seq_len 从 64 增加到 4096(64 倍), 手动实现的耗时从 0.00011s 增加到 0.08889s(约 808 倍), 接近理论上的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>64</mn><mn>2</mn></msup><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">64^2 = 4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">6</span><span class="mord"><span class="mord">4</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span> 倍增长除以 GPU 并行度的饱和效应. </p>
<p><strong>显存占用对比</strong>: </p>
<table>
<thead>
<tr>
<th align="left">seq_len</th>
<th align="left">手动实现 (MB)</th>
<th align="left">SDPA (MB)</th>
<th align="left">SDPA 节省率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">64</td>
<td align="left">96</td>
<td align="left">80</td>
<td align="left">16.7%</td>
</tr>
<tr>
<td align="left">512</td>
<td align="left">1568</td>
<td align="left">514</td>
<td align="left">67.2%</td>
</tr>
<tr>
<td align="left">1024</td>
<td align="left">5152</td>
<td align="left">996</td>
<td align="left">80.7%</td>
</tr>
<tr>
<td align="left">4096</td>
<td align="left">69664</td>
<td align="left">3888</td>
<td align="left"><strong>94.4%</strong></td>
</tr>
</tbody></table>
<p>长序列下显存节省尤为显著: seq_len=4096 时, 手动实现的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 矩阵大小为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>64</mn><mo>×</mo><mn>16</mn><mo>×</mo><msup><mn>4096</mn><mn>2</mn></msup><mo>×</mo><mn>2</mn><mtext> bytes</mtext><mo>≈</mo><mn>34.4</mn></mrow><annotation encoding="application/x-tex">64 \\times 16 \\times 4096^2 \\times 2\\text{ bytes} \\approx 34.4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">64</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord">409</span><span class="mord"><span class="mord">6</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">34.4</span></span></span></span> GB, 而 SDPA 通过重计算将这一开销完全消除. </p>
<h3 id="3-4-bls-zylts-gd-b-64-n-1024-d-64">3.4 变量三: 注意力头数(固定 B=64, N=1024, D=64)</h3>
<table>
<thead>
<tr>
<th align="left">num_heads</th>
<th align="left">手动实现 (s)</th>
<th align="left">SDPA (s)</th>
<th align="left">SDPA 加速比</th>
<th align="left">手动实现 (MB)</th>
<th align="left">SDPA (MB)</th>
<th align="left">SDPA 节省率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1</td>
<td align="left">0.00038</td>
<td align="left">0.000076</td>
<td align="left">5.0×</td>
<td align="left">328</td>
<td align="left">80</td>
<td align="left">75.6%</td>
</tr>
<tr>
<td align="left">16</td>
<td align="left">0.00615</td>
<td align="left">0.000892</td>
<td align="left">6.9×</td>
<td align="left">5152</td>
<td align="left">996</td>
<td align="left">80.7%</td>
</tr>
<tr>
<td align="left">128</td>
<td align="left">0.04911</td>
<td align="left">0.006860</td>
<td align="left">7.2×</td>
<td align="left">40992</td>
<td align="left">7744</td>
<td align="left">81.1%</td>
</tr>
</tbody></table>
<p>头数变化不改变 Attention 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度, 但增加了总并行度. SDPA 的加速比稳定在 6~7 倍区间, 说明优化 kernel 的并行效率与头数基本无关. </p>
<h3 id="3-5-bls-head-dimension-gd-b-64-n-1024-h-16">3.5 变量四: Head Dimension(固定 B=64, N=1024, H=16)</h3>
<table>
<thead>
<tr>
<th align="left">head_dim</th>
<th align="left">手动实现 (s)</th>
<th align="left">SDPA (s)</th>
<th align="left">FlashAttention (s)</th>
<th align="left">xFormers (s)</th>
<th align="left">SDPA 加速比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">8</td>
<td align="left">0.00514</td>
<td align="left">0.00073</td>
<td align="left">0.00075</td>
<td align="left">0.00075</td>
<td align="left">7.0×</td>
</tr>
<tr>
<td align="left">64</td>
<td align="left">0.00617</td>
<td align="left">0.00089</td>
<td align="left">0.00095</td>
<td align="left">0.00098</td>
<td align="left">6.9×</td>
</tr>
<tr>
<td align="left">128</td>
<td align="left">0.00737</td>
<td align="left">0.00162</td>
<td align="left">0.00158</td>
<td align="left">0.00159</td>
<td align="left">4.6×</td>
</tr>
<tr>
<td align="left">512</td>
<td align="left">0.01564</td>
<td align="left">0.01762</td>
<td align="left"></td>
<td align="left">0.01747</td>
<td align="left"><strong>0.9×</strong></td>
</tr>
<tr>
<td align="left">2048</td>
<td align="left">0.05152</td>
<td align="left">0.07396</td>
<td align="left"></td>
<td align="left">0.07610</td>
<td align="left"><strong>0.7×</strong></td>
</tr>
</tbody></table>
<p><strong>关键发现性能拐点</strong>: </p>
<p>当 head_dim 64 时, SDPA 保持 6~7 倍加速; 当 head_dim = 128 时, 加速比降至 4.6×; 当 head_dim 512 时, SDPA <strong>反而比手动实现更慢</strong>. </p>
<p>物理原因分析: </p>
<ol>
<li><p><strong>Tensor Core 利用率</strong>: NVIDIA Tensor Core 对矩阵乘法的加速效果在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>K</mi></mrow><annotation encoding="application/x-tex">M \\times N \\times K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 为 8/16/32/64 的倍数时最优. 当 head_dim = 2048 时, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><annotation encoding="application/x-tex">QK^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span> 的维度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>1024</mn><mo>×</mo><mn>2048</mn><mo stretchy="false">)</mo><mo>×</mo><mo stretchy="false">(</mo><mn>2048</mn><mo>×</mo><mn>1024</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(1024 \\times 2048) \\times (2048 \\times 1024)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">1024</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2048</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">2048</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1024</span><span class="mclose">)</span></span></span></span>, 虽然绝对规模很大, 但分块策略(tiling)的 block size 无法完美匹配 Tensor Core 的 warp 大小, 导致利用率下降. </p>
</li>
<li><p><strong>FlashAttention 的分块限制</strong>: FlashAttention 的 tiling 策略在 SRAM 中同时缓存 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi></mrow><annotation encoding="application/x-tex">Q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 块. SRAM 容量有限(A100 每 SM 为 164 KB), 当 head_dim 过大时, 单个 tile 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 或 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 块就占满 SRAM, 导致 tiling 粒度变粗, 重计算的收益降低. 当前 FlashAttention 实现 head_dim 上限为 256, 超过后直接 fallback 到标准实现. </p>
</li>
<li><p><strong>显存带宽压力</strong>: 大 dim 时 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi></mrow><annotation encoding="application/x-tex">Q, K, V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 的显存占用增加(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><mi>B</mi><mo>×</mo><mi>N</mi><mo>×</mo><mi>H</mi><mo>×</mo><mi>D</mi><mo>×</mo><mn>2</mn><mtext> bytes</mtext></mrow><annotation encoding="application/x-tex">3 \\times B \\times N \\times H \\times D \\times 2\\text{ bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span></span></span></span>), 数据传输时间占比上升. 当计算时间被内存带宽主导时, 手动实现与优化实现的差距缩小.</p>
</li>
</ol>
<p><strong>显存占用拐点</strong>: </p>
<table>
<thead>
<tr>
<th align="left">head_dim</th>
<th align="left">手动实现 (MB)</th>
<th align="left">SDPA (MB)</th>
<th align="left">SDPA 节省率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">8</td>
<td align="left">4224</td>
<td align="left">132</td>
<td align="left"><strong>96.9%</strong></td>
</tr>
<tr>
<td align="left">64</td>
<td align="left">5152</td>
<td align="left">996</td>
<td align="left">80.7%</td>
</tr>
<tr>
<td align="left">512</td>
<td align="left">12320</td>
<td align="left">9760</td>
<td align="left">20.8%</td>
</tr>
<tr>
<td align="left">2048</td>
<td align="left">34848</td>
<td align="left">36896</td>
<td align="left"><strong>-5.9%</strong></td>
</tr>
</tbody></table>
<p>head_dim=2048 时 SDPA 显存反超手动实现, 原因是 SDPA 的某些后端(如 Memory-Efficient Attention)需要额外的 workspace buffer 来存储中间结果, 当 dim 极大时这一开销超过了物化注意力矩阵的收益. </p>
<hr>
<h2 id="4-scfx-roofline-mxyncfwms">4. 深层分析: Roofline 模型与内存访问模式</h2>
<h3 id="4-1-roofline-mxsj">4.1 Roofline 模型视角</h3>
<p>Roofline 模型将计算性能表示为: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Performance</mtext><mo>=</mo><mi>min</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mtext>Peak_FLOPS</mtext><mo separator="true">,</mo><mtext>Memory_Bandwidth</mtext><mo>×</mo><mtext>Arithmetic_Intensity</mtext><mo fence="true">)</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(7)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Performance} = \\min\\left(\\text{Peak\\_FLOPS}, \\text{Memory\\_Bandwidth} \\times \\text{Arithmetic\\_Intensity}\\right) \\tag{7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Performance</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2em;vertical-align:-0.35em;"></span><span class="mop">min</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mord text"><span class="mord">Peak_FLOPS</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Memory_Bandwidth</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">Arithmetic_Intensity</span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span></span><span class="tag"><span class="strut" style="height:1.2em;vertical-align:-0.35em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">7</span></span><span class="mord">)</span></span></span></span></span></span><p>式 (7) 中算术强度(Arithmetic Intensity)定义为每字节内存访问所执行的 FLOPs. 对于 Attention 操作: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>AI</mtext><mtext>attention</mtext></msub><mo>=</mo><mfrac><mrow><mn>4</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mi>D</mi></mrow><mtext>total_bytes_moved</mtext></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(8)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{AI}_{\\text{attention}} = \\frac{4 \\cdot B \\cdot H \\cdot N^2 \\cdot D}{\\text{total\\_bytes\\_moved}} \\tag{8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">AI</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">attention</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4871em;vertical-align:-0.996em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4911em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">total_bytes_moved</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.996em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.4871em;vertical-align:-0.996em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">8</span></span><span class="mord">)</span></span></span></span></span></span><p><strong>手动实现的内存访问</strong>: 需要读取 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi></mrow><annotation encoding="application/x-tex">Q, K, V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>N</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><mi>D</mi></mrow><annotation encoding="application/x-tex">3 \\cdot B \\cdot N \\cdot H \\cdot D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>), 写入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo separator="true">,</mo><mi>A</mi><mo separator="true">,</mo><mi>O</mi></mrow><annotation encoding="application/x-tex">S, A, O</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">A</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>+</mo><mi>B</mi><mo>⋅</mo><mi>N</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><mi>D</mi></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 + B \\cdot N \\cdot H \\cdot D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>), 总计约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mn>4</mn></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 \\cdot 4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4</span></span></span></span> bytes(FP32)或 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><msup><mi>N</mi><mn>2</mn></msup><mo>⋅</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">2 \\cdot B \\cdot H \\cdot N^2 \\cdot 2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> bytes(FP16). </p>
<p><strong>融合实现的内存访问</strong>: 仅需读取 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi></mrow><annotation encoding="application/x-tex">Q, K, V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 和写入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi></mrow><annotation encoding="application/x-tex">O</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span></span></span></span>, 总计约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mo>⋅</mo><mi>B</mi><mo>⋅</mo><mi>N</mi><mo>⋅</mo><mi>H</mi><mo>⋅</mo><mi>D</mi></mrow><annotation encoding="application/x-tex">4 \\cdot B \\cdot N \\cdot H \\cdot D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span> bytes. </p>
<p>因此, 融合实现的算术强度约为手动实现的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mi>N</mi><mi>D</mi></mfrac></mrow><annotation encoding="application/x-tex">\\frac{N}{D}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2173em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8723em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 倍. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>≫</mo><mi>D</mi></mrow><annotation encoding="application/x-tex">N \\gg D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>(长序列场景)时, 融合实现更容易达到 compute-bound 区域, 充分发挥 GPU 的峰值算力. </p>
<h3 id="4-2-wsm-sdpa-zcxlxysgd">4.2 为什么 SDPA 在长序列下优势更大?</h3>
<p>从实测数据看, seq_len=64 时 SDPA 仅比手动实现快 2.6 倍, 而 seq_len=4096 时快 6.7 倍. 这一趋势可以用内存墙(Memory Wall)解释: </p>
<ul>
<li><strong>短序列</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 较小, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 矩阵的显存占用不大(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>64</mn><mo>×</mo><mn>16</mn><mo>×</mo><msup><mn>64</mn><mn>2</mn></msup><mo>×</mo><mn>2</mn><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">64 \\times 16 \\times 64^2 \\times 2 = 8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">64</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mord"><span class="mord">4</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span> MB), 可以缓存于 L2 cache 中, 手动实现的内存访问惩罚不严重</li>
<li><strong>长序列</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 较大, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 矩阵的显存占用剧增(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>64</mn><mo>×</mo><mn>16</mn><mo>×</mo><msup><mn>4096</mn><mn>2</mn></msup><mo>×</mo><mn>2</mn><mo>=</mo><mn>34.4</mn></mrow><annotation encoding="application/x-tex">64 \\times 16 \\times 4096^2 \\times 2 = 34.4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">64</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord">409</span><span class="mord"><span class="mord">6</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">34.4</span></span></span></span> GB), 远超 GPU 缓存容量, 每次访问都要经过 HBM. 融合实现通过消除 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>A</mi></mrow><annotation encoding="application/x-tex">A</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">A</span></span></span></span> 的存储, 将内存访问从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降低到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span></span></span>, 在长序列下的收益被放大</li>
</ul>
<hr>
<h2 id="5-gyxxjcs">5. 工业选型决策树</h2>
<h3 id="5-1-ksjcb">5.1 快速决策表</h3>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">推荐实现</th>
<th align="left">理由</th>
</tr>
</thead>
<tbody><tr>
<td align="left">生产环境(标准配置)</td>
<td align="left"><strong>SDPA</strong></td>
<td align="left">自动选择最优后端, 无需额外依赖</td>
</tr>
<tr>
<td align="left">长序列训练(N &gt; 2048)</td>
<td align="left"><strong>FlashAttention</strong></td>
<td align="left">显存优化最显著, 节省 80%+</td>
</tr>
<tr>
<td align="left">需要 Attention 变体(稀疏/局部)</td>
<td align="left"><strong>xFormers</strong></td>
<td align="left">支持 Linformer, Local Attention 等</td>
</tr>
<tr>
<td align="left">教学/调试/算法验证</td>
<td align="left"><strong>手动实现</strong></td>
<td align="left">透明可控, 便于插入断点和可视化</td>
</tr>
<tr>
<td align="left">超大 head_dim(D 512)</td>
<td align="left"><strong>手动实现或 SDPA math 后端</strong></td>
<td align="left">优化实现在大 dim 时可能负优化</td>
</tr>
<tr>
<td align="left">边缘部署(CPU/无 CUDA)</td>
<td align="left"><strong>手动实现或 SDPA</strong></td>
<td align="left">FlashAttention 需要 CUDA sm80+</td>
</tr>
</tbody></table>
<h3 id="5-2-pztj">5.2 配置推荐</h3>
<p><strong>标准 LLM 训练</strong>(如 LLaMA-2 7B: H=32, D=128): </p>
<ul>
<li>使用 SDPA 或 FlashAttention</li>
<li>head_dim=128 时加速比约 4.6×, 显存节省约 68%</li>
</ul>
<p><strong>视觉 Transformer</strong>(如 ViT-Large: H=16, D=64): </p>
<ul>
<li>强烈推荐 SDPA/FlashAttention</li>
<li>head_dim=64 时加速比 6.9×, 显存节省 80%</li>
</ul>
<p><strong>长上下文模型</strong>(如 128K 上下文): </p>
<ul>
<li>FlashAttention 必选</li>
<li>seq_len=4096 时显存节省 94.4%, seq_len 越大优势越明显</li>
</ul>
<p><strong>超大嵌入维度实验</strong>(如 D=1024 per head): </p>
<ul>
<li>考虑减少 num_heads(如 D=1024 H=8, D=128)</li>
<li>或使用低秩近似(Linformer)</li>
</ul>
<hr>
<h2 id="6-sxmsybjtj">6. 失效模式与边界条件</h2>
<h3 id="6-1-sxmsy-d-head-dimension-xdxnbt">6.1 失效模式一: 大 Head Dimension 下的性能崩塌</h3>
<p><strong>现象</strong>: head_dim 512 时, SDPA/FlashAttention 加速比降至 1× 以下, 甚至显存反超手动实现. </p>
<p><strong>根因</strong>: </p>
<ul>
<li>Tensor Core 利用率下降: warp 内的线程无法充分利用 MMA(Matrix Multiply Accumulate)指令的并行度</li>
<li>FlashAttention tiling 失效: SRAM 无法容纳大块数据, 导致分块粒度变粗, 重计算开销上升</li>
<li>workspace buffer 膨胀: 某些后端需要额外 buffer 存储中间累加结果</li>
</ul>
<p><strong>应对</strong>: </p>
<ul>
<li>将 head_dim 控制在 64~128(LLaMA/Qwen 的标准配置)</li>
<li>若必须使用大 dim, 减少 num_heads 以保持总 hidden_size 不变</li>
</ul>
<h3 id="6-2-sxmse-flash-attention-d-head-dim-sx">6.2 失效模式二: FlashAttention 的 head_dim 上限</h3>
<p><strong>现象</strong>: head_dim &gt; 256 时 FlashAttention 直接报错或 fallback. </p>
<p><strong>根因</strong>: 当前 FlashAttention-2 的 CUDA kernel 中, tile 的寄存器分配和 SRAM 使用针对 head_dim 256 优化. 更大的 dim 需要重新设计分块策略. </p>
<p><strong>应对</strong>: </p>
<ul>
<li>使用 SDPA(自动 fallback 到其他后端)</li>
<li>将注意力头拆分为多个小组</li>
</ul>
<h3 id="6-3-sxmss-ygymdewkx">6.3 失效模式三: 因果掩码的额外开销</h3>
<p><strong>现象</strong>: 启用 causal mask(自回归生成)时, 某些后端的性能下降幅度不一致. </p>
<p><strong>根因</strong>: </p>
<ul>
<li>FlashAttention 对 causal mask 有专门优化(跳过下三角计算), 开销极小</li>
<li>手动实现中 causal mask 需要构造 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>×</mo><mi>N</mi></mrow><annotation encoding="application/x-tex">N \\times N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 的下三角矩阵并加到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi></mrow><annotation encoding="application/x-tex">S</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span> 上, 增加 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>N</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">N^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span> 的显存和计算</li>
<li>xFormers 的 <code>LowerTriangularMask</code> 实现较通用, 优化不如 FlashAttention 激进</li>
</ul>
<p><strong>应对</strong>: </p>
<ul>
<li>自回归训练/推理优先使用 FlashAttention</li>
<li>避免手动构造 dense causal mask</li>
</ul>
<h3 id="6-4-sxmss-batch-size-gxdz-gpu-lysbz">6.4 失效模式四: Batch Size 过小导致 GPU 利用率不足</h3>
<p><strong>现象</strong>: batch_size=1 时, SDPA 仅比手动实现快 3.2×, 远低于 batch_size=512 时的 7.2×. </p>
<p><strong>根因</strong>: GPU 的 SM(Streaming Multiprocessor)数量为 100+(H800 有 132 个 SM), batch_size=1 时仅占用少量 SM, 大量计算资源空闲. kernel 启动的固定开销(约 5~10 μs)在总时间中占比上升. </p>
<p><strong>应对</strong>: </p>
<ul>
<li>训练时尽量使用较大的 batch_size(或通过梯度累积模拟)</li>
<li>推理时使用 continuous batching(vLLM 的 PagedAttention)合并多个请求</li>
</ul>
<hr>
<h2 id="7-dmsl-szsxdhxty">7. 代码示例: 四种实现的核心调用</h2>
<pre><code class="language-python">import torch
import torch.nn.functional as F
from flash_attn import flash_attn_func
from xformers.ops import memory_efficient_attention

def attention_naive(q, k, v, causal=False):
    &quot;&quot;&quot;手动实现 Attention(教学用, 不建议生产)&quot;&quot;&quot;
    # q, k, v: [B, H, N, D]
    d = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) / (d ** 0.5)  # [B, H, N, N]
    if causal:
        mask = torch.triu(torch.ones(scores.shape[-2:], device=q.device), diagonal=1)
        scores = scores.masked_fill(mask.bool(), float(&#39;-inf&#39;))
    attn = F.softmax(scores, dim=-1)  # [B, H, N, N]
    out = torch.matmul(attn, v)       # [B, H, N, D]
    return out

def attention_sdpa(q, k, v, causal=False):
    &quot;&quot;&quot;PyTorch SDPA(生产环境首选)&quot;&quot;&quot;
    # 自动选择 FlashAttention / Memory-Efficient / CUBLAS / Math 后端
    return F.scaled_dot_product_attention(q, k, v, is_causal=causal)

def attention_flash(q, k, v, causal=False):
    &quot;&quot;&quot;FlashAttention(长序列最优)&quot;&quot;&quot;
    # 限制: head_dim &lt;= 256
    # 输入需为 [B, N, H, D], 与 SDPA 的 [B, H, N, D] 不同
    q = q.transpose(1, 2)  # [B, N, H, D]
    k = k.transpose(1, 2)
    v = v.transpose(1, 2)
    out = flash_attn_func(q, k, v, causal=causal)
    return out.transpose(1, 2)  # [B, H, N, D]

def attention_xformers(q, k, v, causal=False):
    &quot;&quot;&quot;xFormers(灵活多变种)&quot;&quot;&quot;
    # 输入格式 [B, N, H, D]
    q = q.transpose(1, 2)
    k = k.transpose(1, 2)
    v = v.transpose(1, 2)
    attn_bias = LowerTriangularMask() if causal else None
    out = memory_efficient_attention(q, k, v, attn_bias=attn_bias)
    return out.transpose(1, 2)
</code></pre>
<hr>
<h2 id="8-zj">8. 总结</h2>
<table>
<thead>
<tr>
<th align="left">实现</th>
<th align="left">优化层级</th>
<th align="left">速度</th>
<th align="left">显存</th>
<th align="left">适用场景</th>
<th align="left">关键限制</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>SDPA</strong></td>
<td align="left">自动调度最优 kernel</td>
<td align="left">最快</td>
<td align="left">最低</td>
<td align="left"><strong>生产环境首选</strong></td>
<td align="left">大 dim 时效率下降</td>
</tr>
<tr>
<td align="left"><strong>FlashAttention</strong></td>
<td align="left">手写 CUDA + tiling</td>
<td align="left">接近最快</td>
<td align="left">很低</td>
<td align="left"><strong>长序列训练</strong></td>
<td align="left">head_dim 256</td>
</tr>
<tr>
<td align="left"><strong>xFormers</strong></td>
<td align="left">C++/CUDA 通用实现</td>
<td align="left">次之</td>
<td align="left">中等</td>
<td align="left"><strong>Attention 变体研究</strong></td>
<td align="left">标准配置不如 SDPA</td>
</tr>
<tr>
<td align="left"><strong>手动实现</strong></td>
<td align="left">PyTorch Eager</td>
<td align="left">最慢</td>
<td align="left">最高</td>
<td align="left"><strong>教学/调试</strong></td>
<td align="left">仅用于理解原理</td>
</tr>
</tbody></table>
<p><strong>最终建议</strong>: </p>
<ol>
<li><strong>无脑使用 SDPA</strong>: <code>torch.nn.functional.scaled_dot_product_attention</code> 是 PyTorch 2.0+ 的默认选择, 自动选择最优后端</li>
<li><strong>长序列必用 FlashAttention</strong>: 当 seq_len &gt; 2048 且 head_dim 256 时, 显存节省 80%+</li>
<li><strong>head_dim 控制在 64~128</strong>: 这是当前 GPU Tensor Core 的最优工作区间</li>
<li><strong>混合精度训练</strong>: FP16/BF16 可进一步提升 2~3 倍吞吐量</li>
</ol>
<hr>
<h2 id="9-ckwx">9. 参考文献</h2>
<ol>
<li>Dao, T., et al. (2022). FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness. <em>NeurIPS</em>.</li>
<li>Dao, T., et al. (2023). FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning. <em>ICLR</em>.</li>
<li>PyTorch Documentation: <code>torch.nn.functional.scaled_dot_product_attention</code></li>
<li>xFormers GitHub: <a href="https://github.com/facebookresearch/xformers">https://github.com/facebookresearch/xformers</a></li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yy-tyd-attention-btdsx-xzdxs","text":"1. 引言: 同样的 Attention, 不同的实现, 显著的效率"},{"level":2,"id":"2-szsxfs-ylysycj","text":"2. 四种实现方式: 原理与适用场景"},{"level":3,"id":"2-1-sdsx-na-ve-py-torch","text":"2.1 手动实现(Naïve PyTorch)"},{"level":3,"id":"2-2-sdpa-py-torch-gf-scaled-dot-product-attention","text":"2.2 SDPA(PyTorch 官方 scaled_dot_product_attention )"},{"level":3,"id":"2-3-flash-attention","text":"2.3 FlashAttention"},{"level":3,"id":"2-4-x-formers","text":"2.4 xFormers"},{"level":2,"id":"3-xnsc-h800-gpu-qwddb","text":"3. 性能实测: H800 GPU 全维度对比"},{"level":3,"id":"3-1-sypz","text":"3.1 实验配置"},{"level":3,"id":"3-2-bly-batch-size-gd-n-1024-h-16-d-64","text":"3.2 变量一: Batch Size(固定 N=1024, H=16, D=64)"},{"level":3,"id":"3-3-ble-xlcd-gd-b-64-h-16-d-64","text":"3.3 变量二: 序列长度(固定 B=64, H=16, D=64)"},{"level":3,"id":"3-4-bls-zylts-gd-b-64-n-1024-d-64","text":"3.4 变量三: 注意力头数(固定 B=64, N=1024, D=64)"},{"level":3,"id":"3-5-bls-head-dimension-gd-b-64-n-1024-h-16","text":"3.5 变量四: Head Dimension(固定 B=64, N=1024, H=16)"},{"level":2,"id":"4-scfx-roofline-mxyncfwms","text":"4. 深层分析: Roofline 模型与内存访问模式"},{"level":3,"id":"4-1-roofline-mxsj","text":"4.1 Roofline 模型视角"},{"level":3,"id":"4-2-wsm-sdpa-zcxlxysgd","text":"4.2 为什么 SDPA 在长序列下优势更大?"},{"level":2,"id":"5-gyxxjcs","text":"5. 工业选型决策树"},{"level":3,"id":"5-1-ksjcb","text":"5.1 快速决策表"},{"level":3,"id":"5-2-pztj","text":"5.2 配置推荐"},{"level":2,"id":"6-sxmsybjtj","text":"6. 失效模式与边界条件"},{"level":3,"id":"6-1-sxmsy-d-head-dimension-xdxnbt","text":"6.1 失效模式一: 大 Head Dimension 下的性能崩塌"},{"level":3,"id":"6-2-sxmse-flash-attention-d-head-dim-sx","text":"6.2 失效模式二: FlashAttention 的 head_dim 上限"},{"level":3,"id":"6-3-sxmss-ygymdewkx","text":"6.3 失效模式三: 因果掩码的额外开销"},{"level":3,"id":"6-4-sxmss-batch-size-gxdz-gpu-lysbz","text":"6.4 失效模式四: Batch Size 过小导致 GPU 利用率不足"},{"level":2,"id":"7-dmsl-szsxdhxty","text":"7. 代码示例: 四种实现的核心调用"},{"level":2,"id":"8-zj","text":"8. 总结"},{"level":2,"id":"9-ckwx","text":"9. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/04-attention-sxfsdb/01-attention-sxfsqjdb" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/04-attention-sxfsdb/01-attention-sxfsqjdb" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Attention 实现方式全景对比: 从手动实现到 FlashAttention</h1>
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
