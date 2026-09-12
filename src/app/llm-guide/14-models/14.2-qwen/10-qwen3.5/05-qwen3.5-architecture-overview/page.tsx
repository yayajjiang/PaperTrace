"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.5 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 Qwen3.5 官方技术博客的精译内容, 从设计动机、工程落地、数据可信性、谱系演进与潜在风险五个维度, 对模型核心架构做系统性拆解. 分析对象为 Qwen3.5-397B-A17B: 397B 总参数, 17B 激活参数, 1M tokens 上下文窗口, 支持 201 种语言的原生多模态模型.</p>
</blockquote>
<hr>
<h2 id="1-hhjg-wsmsxxzyl-xs-moe">1 混合架构: 为什么是线性注意力 + 稀疏 MoE</h2>
<h3 id="1-1-sjdj-bzzyldxssj">1.1 设计动机: 标准注意力的效率死结</h3>
<p>标准 Transformer 的自注意力在时间复杂度上为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, 空间复杂度同样为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> (KV Cache). 当序列长度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 达到 1M tokens 时, 单层注意力计算量膨胀到不可接受的程度. 更隐蔽的是内存带宽瓶颈: 即使通过 GQA 压缩了 KV Cache, 长序列下的 cache 读取仍会成为推理瓶颈.</p>
<p>这里值得停一下, 追问一个被 benchmark 忽略的问题: 模型能力究竟来自「参数量」还是「计算量」? Qwen3.5 的工程判断是, 能力主要来自<strong>激活参数规模</strong>与<strong>数据质量</strong>, 而非总参数量. 397B / 17B 的设计意味着每次前向传播只使用约 4.3% 的参数, 激活比低于 DeepSeek-V3.2 的约 5.5% (671B / 37B), 远低于 Dense 模型的 100%. 为什么线性注意力 + 稀疏 MoE 是当下最优解? 核心洞察有两点.</p>
<p>第一, <strong>线性注意力的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 复杂度在长序列下具有不可替代的吞吐量优势</strong>. Gated Delta Networks 通过门控状态更新机制, 将注意力计算从二次降为线性. 标准 Softmax 注意力的输出为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span><span class="tag"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>. 线性注意力将 Softmax 核函数替换为特征映射 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϕ</mi></mrow><annotation encoding="application/x-tex">\\phi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">ϕ</span></span></span></span>, 使得:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>LinearAttn</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mrow><mi>ϕ</mi><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo>⋅</mo><mo stretchy="false">(</mo><mi>ϕ</mi><mo stretchy="false">(</mo><mi>K</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup><mo>⋅</mo><mi>V</mi><mo stretchy="false">)</mo></mrow><mrow><mi>ϕ</mi><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo>⋅</mo><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><mi>ϕ</mi><mo stretchy="false">(</mo><msub><mi>K</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{LinearAttn}(Q, K, V) = \\frac{\\phi(Q) \\cdot (\\phi(K)^T \\cdot V)}{\\phi(Q) \\cdot \\sum_{i=1}^{n} \\phi(K_i)} \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">LinearAttn</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5123em;vertical-align:-0.994em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.3057em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8043em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mopen">(</span><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.994em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.5123em;vertical-align:-0.994em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>通过将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϕ</mi><mo stretchy="false">(</mo><mi>K</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup><mo>⋅</mo><mi>V</mi></mrow><annotation encoding="application/x-tex">\\phi(K)^T \\cdot V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0913em;vertical-align:-0.25em;"></span><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 预先计算为累积状态矩阵, 整个序列的复杂度降为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>≫</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">n \\gg d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 时, 这就是从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 的质变.</p>
<p>但 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 成立有一个关键前提: <strong>序列必须按顺序处理, 且状态矩阵维度固定</strong>. 这意味着它天然适合自回归解码, 但在需要随机访问或双向编码的场景下优势消失. Qwen3.5 的解决方案是混合架构: 在部分层保留 Gated Attention (标准注意力的门控变体), 在其余层使用 Gated DeltaNet. 这种「因地制宜」的路由策略, 与 DeepSeek-V4 的 CSA + HCA 混合注意力、MiniMax-01 的 Lightning Attention + Softmax Attention 属于同一技术范式.</p>
<p>第二, <strong>稀疏 MoE 在推理阶段的真实成本远低于 Dense 模型</strong>. 17B 激活参数意味着在单张 H100 上, 推理时的活跃权重可完整驻留显存, 无需频繁换入换出. 表 1 显示了吞吐量对比:</p>
<table>
<thead>
<tr>
<th align="left">对比模型</th>
<th align="center">总参数</th>
<th align="center">激活参数</th>
<th align="center">32k 吞吐</th>
<th align="center">256k 吞吐</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen3-Max</td>
<td align="center">1T+</td>
<td align="center">1T+ (Dense)</td>
<td align="center">1.0×</td>
<td align="center">1.0×</td>
</tr>
<tr>
<td align="left">Qwen3-235B-A22B</td>
<td align="center">235B</td>
<td align="center">22B</td>
<td align="center">2.5×</td>
<td align="center">2.6×</td>
</tr>
<tr>
<td align="left">Qwen3.5-397B-A17B</td>
<td align="center">397B</td>
<td align="center">17B</td>
<td align="center">8.6×</td>
<td align="center">19.0×</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Qwen3.5 相对于 Qwen3-Max 的解码吞吐量提升.</p>
</blockquote>
<p>19.0 倍的提升并非 solely 来自线性注意力. 在长序列下, 标准注意力的 KV Cache 内存占用随长度线性增长, 导致缓存未命中率急剧上升. 线性注意力由于无需存储完整 KV Cache, 其内存占用几乎与序列长度无关, 这正是 256k 下加速比远高于 32k 的根本原因.</p>
<h3 id="1-2-jgxj-moe-lydsggcxj">1.2 架构细节: MoE 路由的三个工程陷阱</h3>
<p>稀疏 MoE 的优雅停留在纸面上. 工程落地时, 路由决策引入了三个麻烦.</p>
<p>首先是 <strong>all-to-all 通信瓶颈</strong>. MoE 的 expert 通常分布在不同 GPU 上, 每个 token 需要被路由到目标 expert 所在设备, 计算完成后再聚合结果. 在 397B 规模下, 跨节点的 all-to-all 通信可能占据前向传播时间的 30%-50%. Qwen3.5 选择 17B 激活参数而非更高的 22B, 也隐含了减少 expert 数量、缓解通信压力的考量.</p>
<p>其次是 <strong>负载均衡</strong>. 如果路由网络总是偏好少数几个 expert, 这些 expert 会成为热点. 常见的解决方案是添加辅助 loss 强制均衡, 但这会干扰主任务的学习. Qwen3.5 博客未披露具体路由均衡策略, 这是待补充的细节.</p>
<p>第三是 <strong>动态性与编译优化的冲突</strong>. 现代推理引擎 (vLLM, TensorRT-LLM) 重度依赖图优化和算子融合. 但 MoE 的动态路由意味着每次前向传播的计算图都不完全相同, 静态编译的优势难以发挥. 推理阶段的动态性对编译优化的挑战未被讨论.</p>
<h3 id="1-3-pxyyx-hhzyldjsml">1.3 谱系与影响: 混合注意力的技术脉络</h3>
<p>Qwen3.5 的混合注意力设计有清晰的技术谱系. Mamba 系列状态空间模型证明了线性复杂度序列建模的可行性; RetNet 提出了保留机制的并行训练方案; DeltaNet 本身则是对线性注意力的门控改进, 通过 delta 规则 (差分更新) 增强状态的记忆选择性. Qwen3.5 将这些成果工程化, 并与稀疏 MoE 结合, 形成了「线性注意力处理长程依赖 + 标准注意力处理精细对齐 + MoE 扩展容量」的三位一体架构.</p>
<hr>
<h2 id="2-ysdmt-rhefpj">2 原生多模态: 融合而非拼接</h2>
<h3 id="2-1-sjdj-hpjfadgbqx">2.1 设计动机: 后拼接方案的根本缺陷</h3>
<p>传统视觉-语言模型 (如 Qwen2-VL、LLaVA) 采用「后拼接」架构: 预训练视觉Encoder  (ViT) 提取图像特征, 再通过投影层映射到语言模型的输入空间. 这种方案的缺陷在于, 视觉信息始终是被「翻译」成文本 token, 而非在同一表征空间中被联合推理.</p>
<p>这里值得停一下, 思考这种差异在 Agent 场景中的实际影响. 当模型需要操作 GUI (点击按钮、填写表单) 时, 后拼接方案中的视觉Encoder 可能输出「左上角有一个蓝色按钮」的高层语义描述, 但丢失了精确像素坐标. 而原生多模态模型从预训练阶段就在同一空间中表示文本 token 和视觉 token, 像素级位置信息被直接编码进表征. 这解释了为什么 Qwen3.5 在 V* 基准上达到 95.8 分 (启用 Code Interpreter), 远超 Gemini-3 Pro 的 88.0.</p>
<p>Qwen3.5 的原生多模态策略可概括为「早期融合、统一表征、联合推理」: 文本、图像、视频数据在预训练阶段即混合输入, 视觉 token 与文本 token 共享同一个 embedding 空间和注意力机制, 模型可在注意力层中直接建立跨模态关联, 无需桥接层间接交互.</p>
<h3 id="2-2-jgxj-ygbhdgcbyx">2.2 架构细节: 异构并行的工程必要性</h3>
<p>原生多模态的代价是训练复杂度急剧上升. 视觉数据和文本数据的计算特征截然不同: 图像 patch 序列较短但每 patch 计算密度高 (ViT 风格稠密自注意力); 文本 token 序列长且稀疏 MoE 占主导. 统一并行策略必然导致一方等待另一方.</p>
<p>Qwen3.5 的解决方案是 <strong>异构并行策略解耦</strong>: 视觉组件采用 TP (Tensor Parallelism), 语言组件采用 EP (Expert Parallelism). 这种解耦使得视觉Encoder 和语言Decoder  可各自选择最优并行拓扑, 在混合数据上达到「近 100% 的训练吞吐」. 大多数多模态训练框架为简化实现强制统一并行策略, 实际吞吐往往只有纯文本的 60%-70%.</p>
<h3 id="2-3-sjysy-sj-benchmark-dpgmq">2.3 数据与实验: 视觉 benchmark 的评估盲区</h3>
<p>表 2 汇总了关键视觉基准表现:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">任务类型</th>
<th align="center">Gemini-3 Pro</th>
<th align="center">K2.5-1T-A32B</th>
<th align="center">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MathVision</td>
<td align="left">STEM 视觉推理</td>
<td align="center">86.6</td>
<td align="center">84.2</td>
<td align="center">88.6</td>
</tr>
<tr>
<td align="left">V* (w/ CI)</td>
<td align="left">视觉定位 + 代码交互</td>
<td align="center">88.0</td>
<td align="center">77.0</td>
<td align="center">95.8</td>
</tr>
<tr>
<td align="left">BabyVision (w/ CI)</td>
<td align="left">视觉常识</td>
<td align="center">49.7</td>
<td align="center">36.5</td>
<td align="center">52.3</td>
</tr>
<tr>
<td align="left">OSWorld-Verified</td>
<td align="left">GUI 自动化</td>
<td align="center">--</td>
<td align="center">63.3</td>
<td align="center">62.2</td>
</tr>
<tr>
<td align="left">AndroidWorld</td>
<td align="left">移动端操作</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">66.8</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 核心视觉基准横向对比.</p>
</blockquote>
<p>MathVision 上 Qwen3.5 使用了固定提示, 而其他模型报告的是「带/不带格式化」两种运行中的较高分, 这是一个未被控制的变量. V* 和 BabyVision 的 CI 开关差距分别为 4.7 分和 9 分, 验证了「视觉 + 代码」的协同效应, 但也带来评估一致性问题: 启用 CI 后模型相当于获得额外感知工具, 横向对比时必须确认所有模型是否都在同等条件下使用 CI.</p>
<h3 id="2-4-jxyfx-ysdmtdyxcb">2.4 局限与风险: 原生多模态的隐性成本</h3>
<p>最大的隐性成本是 <strong>训练数据配比</strong>. 视觉-文本-视频三种模态的数据在质量、规模和分布上差异巨大, 博客未给出具体配比. 在缺乏这一信息时, 我们无从判断模型的视觉能力是「真融合」还是「数据堆砌」. 另一个风险是 <strong>模态间的干扰</strong>: 同一表征空间意味着视觉噪声和文本噪声可以互相污染, 后拼接方案中视觉Encoder 至少起到「隔离带」作用, 而原生融合方案失去了这一保护.</p>
<hr>
<h2 id="3-1m-tokens-csxw-jsljybj">3 1M Tokens 长上下文: 技术路径与边界</h2>
<h3 id="3-1-sjdj-wsms-1m-bs-10m">3.1 设计动机: 为什么是 1M, 不是 10M</h3>
<p>Llama-4 将上下文推到了 10M tokens, Gemini 也支持 1M+. Qwen3.5 选择 1M 作为 API 版本上下文长度, 背后有务实的工程考量. 1M tokens 约等于 200 万汉字或 75 万英文单词, 足以覆盖绝大多数实际场景. 10M tokens 虽然更震撼, 但实际使用率极低, 且对推理基础设施的要求呈指数级上升. Qwen3.5 的判断是, <strong>在 1M 尺度上做好可靠性, 远比在 10M 尺度上做一个 demo 更有价值</strong>.</p>
<h3 id="3-2-jgxj-szjsddj">3.2 架构细节: 三重技术的叠加</h3>
<p>Qwen3.5 的长上下文能力来自多重技术叠加, 而非单一方案.</p>
<p>第一重是 <strong>Gated DeltaNet 的线性复杂度</strong>. 线性注意力将 KV Cache 内存占用从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> (状态矩阵), 使 1M tokens 序列不会在内存上压垮 GPU. 对于标准注意力层, 即使使用 GQA, 1M tokens 的 KV Cache 也需要数百 GB 显存, 在当前硬件上不可行.</p>
<p>第二重是 <strong>渐进式上下文扩展</strong>. 模型经历 32k → 256k → 1M 的多阶段扩展, 每个阶段使用对应长度的数据继续预训练, 让模型逐步适应更长的位置编码. 这避免了长序列训练的不稳定性.</p>
<p>第三重是 <strong>位置编码的外推能力</strong>. Qwen3.5 基于 RoPE, 该技术天然具有一定长度外推性. 但为了确保 1M 尺度的稳定性, 训练时必定使用了调整后的 RoPE base 或引入了 YaRN / NTK-aware 等外推技术. 博客未披露具体方案, 这是待补充的细节.</p>
<p>与 Gemini 的 1M 和 Llama-4 的 10M 对比, Qwen3.5 的路径更偏「算法效率优化」. Gemini-3 Pro 主要依赖 Sparse Attention (只计算部分 token 对) 和 TP 并行分摊内存压力; Llama-4 则使用了层次化注意力模式. Qwen3.5 的选择是在混合架构中让线性注意力承担长序列主力, 标准注意力处理短序列精细任务, 这是一种更均衡的方案.</p>
<h3 id="3-3-sjysy-csxw-benchmark-dxtxmq">3.3 数据与实验: 长上下文 benchmark 的系统性盲区</h3>
<p>表 3 对比了各模型在长上下文基准上的表现:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">测试内容</th>
<th align="center">GPT-5.2</th>
<th align="center">Gemini-3 Pro</th>
<th align="center">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AA-LCR</td>
<td align="left">长程连贯性推理</td>
<td align="center">72.7</td>
<td align="center">70.7</td>
<td align="center">68.7</td>
</tr>
<tr>
<td align="left">LongBench v2</td>
<td align="left">多任务长文档理解</td>
<td align="center">54.5</td>
<td align="center">68.2</td>
<td align="center">63.2</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 长上下文基准对比.</p>
</blockquote>
<p>AA-LCR 上 Qwen3.5 的 68.7 分略低于 GPT-5.2 和 Gemini-3 Pro. 需要追问: 这个分数是在 1M 上下文下测得的, 还是在更短长度上? 如果所有模型都在 256k 或更短长度上测试, 那么 1M 的能力优势无法被 benchmark 捕获. 当前长上下文评估存在一个系统性盲区: 大多数 benchmark 的文档长度远不到 1M, 模型即使在 1M 上下文上训练, 其真实优势也无法被现有评估体系量化.</p>
<p>BrowseComp 的对比提供了一个有趣的反例. Qwen3.5 使用 discard-all 策略 (丢弃所有旧工具响应) 获得 78.6 分, 比简单上下文折叠的 69.0 分高出近 10 分. 这说明在超长上下文搜索场景中, <strong>「扔掉旧信息」比「压缩旧信息」更有效</strong>——也侧面验证了 1M 上下文的真实价值.</p>
<hr>
<h2 id="4-kz-rl-hxl-cjtsjdhjbh">4 扩展 RL 后训练: 从静态数据到环境闭环</h2>
<h3 id="4-1-sjdj-ct-rlhf-d-agent-mq">4.1 设计动机: 传统 RLHF 的 Agent 盲区</h3>
<p>传统 RLHF 的 reward model 基于人类偏好数据训练, 擅长判断「回答 A 是否比回答 B 更流畅」. 但 Agent 场景的核心挑战不是「说得好不好」, 而是「做得对不对」——多步决策的正确性、工具调用链的合法性、环境状态反馈的响应能力. 这些信号在静态对话对中无法被充分表达.</p>
<p>Qwen3.5 的核心洞察是: <strong>扩展「环境」而非仅仅扩展「数据」</strong>. 模型在训练时与真实的工具、API、多轮交互环境进行闭环学习, 而非仅在静态对话对上做 PPO. 这种「训推一体」的 RL 框架意味着模型在训练阶段就暴露于真实的错误反馈.</p>
<h3 id="4-2-jgxj-yb-rl-dsggjjc">4.2 架构细节: 异步 RL 的三个关键决策</h3>
<p>第一, <strong>训推分离架构</strong>. 传统 RL (如 PPO) 中, Rollout 和 Training 通常串行执行. 生成阶段 GPU 执行自回归解码, 计算密度低, 大量算力闲置; 训练阶段执行反向传播, 计算密度高. 训推分离将 Rollout 放到专门推理集群, 训练集群专注梯度计算, 两者通过异步队列解耦. 3-5 倍的端到端加速说明推理开销在总训练时间中占比极高 (可能 60%-80%), 分离后训练集群利用率从 20%-40% 提升到接近 100%.</p>
<p>第二, <strong>FP8 训推一致性</strong>. 训练使用 FP8 降低显存, 推理也使用 FP8 加速生成, 两者之间通过运行时监控保持数值一致性. 如果训练和推理精度不一致, 策略在训练时优化的目标与实际部署时的行为会出现偏差, 导致「训得好但推得差」.</p>
<p>第三, <strong>多轮 Rollout 锁定</strong>. Agent 任务通常需要 10+ 轮工具调用. 如果中间某一轮被调度中断, 轨迹会断裂, reward 信号被污染. 「锁定」机制确保 Agent 任务的多轮交互在调度层面被视为原子操作, 不会被其他任务抢占. 这在传统 RL 框架中是一个被忽视的细节, 但对 Agent 训练至关重要.</p>
<h3 id="4-3-sjysy-rl-zydgynt">4.3 数据与实验: RL 增益的归因难题</h3>
<p>官方博客展示了通用 Agent 能力随 RL Environment scaling 的增益曲线, 但未披露具体数据. 只能通过最终 benchmark 间接验证 RL 效果. 表 4 列出了后训练后的 Agent 能力:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">任务类型</th>
<th align="center">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">BFCL-V4</td>
<td align="left">函数调用</td>
<td align="center">72.9</td>
</tr>
<tr>
<td align="left">VITA-Bench</td>
<td align="left">多模态 Agent</td>
<td align="center">49.7</td>
</tr>
<tr>
<td align="left">Tool Decathlon</td>
<td align="left">工具使用</td>
<td align="center">38.3</td>
</tr>
<tr>
<td align="left">MCP-Mark</td>
<td align="left">MCP 协议</td>
<td align="center">46.1</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Qwen3.5 后训练后的 Agent 能力表现. 基座分数未公开.</p>
</blockquote>
<p>问题在于, <strong>无法区分这些增益来自 RL 环境扩展, 还是来自预训练阶段的原生多模态能力</strong>. 如果基座模型已因早期视觉-文本融合而具备强大的工具理解能力, 那么 RL 后训练的边际增益可能被高估. 缺乏基座-后训练的 paired 对比, 归因分析存在不确定性.</p>
<h3 id="4-4-jxyfx-yb-rl-dybcjx">4.4 局限与风险: 异步 RL 的样本陈旧性</h3>
<p>异步 RL 的最大理论风险是 <strong>样本陈旧性 (stale samples)</strong>. 当 Rollout 集群生成的轨迹被送入训练集群时, 策略参数可能已经更新了数百甚至数千步. 此时轨迹是在旧策略下采样的, 用它们来更新当前策略会引入偏差. Qwen3.5 博客提到「严格控制样本陈旧性」, 但未说明具体控制机制.</p>
<p>更严重的是, 当环境交互需要 50+ 轮时, 异步带来的时滞可能导致 credit assignment 失效. 在长轨迹中, reward 信号需要反向传播到早期决策步骤, 如果策略在此期间已经大幅更新, credit assignment 的准确性会急剧下降. 这是一个尚未被充分验证的假设, 尤其在复杂的 MCP 多轮交互场景中.</p>
<hr>
<h2 id="5-201-zyy-gdysddzl">5 201 种语言: 广度与深度的张力</h2>
<h3 id="5-1-sjdj-dzyyyd-scaling-law">5.1 设计动机: 低资源语言的 scaling law</h3>
<p>Qwen3.5 将语言支持从 Qwen3 的 119 种扩展到 201 种, 重点是低资源语言. 这个决策的动机来自 scaling law 的一个反直觉结论: <strong>在总计算预算固定的情况下, 适度增加低资源语言训练数据, 不仅不会损害高资源语言性能, 反而可能通过跨语言迁移提升整体能力</strong>.</p>
<p>其机制在于, 模型在低资源语言上学到的句法结构和语义映射, 可作为先验知识迁移到高资源语言的复杂任务中. 只在英语上训练的模型可能过度拟合英语特定表达模式; 而在 200 种语言上训练时, 被迫学习更抽象、更通用的表征, 这种「语言无关」的表征在推理任务中反而更鲁棒.</p>
<h3 id="5-2-jgxj-25-wcbd-trade-off">5.2 架构细节: 25 万词表的 trade-off</h3>
<p>201 种语言的直接工程后果是词表必须大幅扩展. Qwen3.5 使用了 25 万词表, 相比 Qwen3 的 15 万增加了 67%. 更大词表带来两个效应.</p>
<p>正面效应是 <strong>编码效率提升</strong>. 对于形态丰富的语言 (如芬兰语、土耳其语) 和表意文字 (如中文), 更大词表意味着更少的 token 数编码相同内容. 官方声称在多数语言上带来约 10%-60% 的编码效率提升, 直接转化为更短序列长度, 进而降低推理延迟和训练成本.</p>
<p>负面效应是 <strong>embedding 层的内存压力与梯度稀疏性</strong>. 25 万词表 × 隐藏维度 (假设 8192) 的 embedding 矩阵, 仅输入层就需要约 2B 参数. 对于低资源语言, 其对应词元的训练样本稀少, embedding 向量的梯度更新极为稀疏, 可能导致这些词元的表征质量不足. 此外, 输出层分类头同样面临 25 万类的 softmax 计算压力.</p>
<p>Qwen3.5 的解决方案可能是将低资源语言词元与高资源语言词元共享部分 embedding 空间, 或通过子词切分让低资源语言词元由高资源语言子词组合而成.</p>
<h3 id="5-3-sjysy-yyfgdsdmq">5.3 数据与实验: 语言覆盖的深度盲区</h3>
<p>表 5 对比了多语言基准表现:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">测试范围</th>
<th align="center">Qwen3-Max-Thinking</th>
<th align="center">K2.5-1T-A32B</th>
<th align="center">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMMLU</td>
<td align="left">多语言知识</td>
<td align="center">84.4</td>
<td align="center">86.0</td>
<td align="center">88.5</td>
</tr>
<tr>
<td align="left">MMLU-ProX</td>
<td align="left">29 种语言平均</td>
<td align="center">78.5</td>
<td align="center">82.3</td>
<td align="center">84.7</td>
</tr>
<tr>
<td align="left">NOVA-63</td>
<td align="left">63 种语言</td>
<td align="center">54.2</td>
<td align="center">56.0</td>
<td align="center">59.1</td>
</tr>
<tr>
<td align="left">WMT24++</td>
<td align="left">55 种语言翻译</td>
<td align="center">77.6</td>
<td align="center">77.6</td>
<td align="center">78.9</td>
</tr>
<tr>
<td align="left">MAXIFE</td>
<td align="left">23 种设置指令遵循</td>
<td align="center">84.0</td>
<td align="center">72.8</td>
<td align="center">88.2</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: 多语言基准对比.</p>
</blockquote>
<p>Qwen3.5 在 MAXIFE (88.2) 上大幅领先 K2.5 (72.8), 这一 15.4 分的差距说明 201 种语言支持在指令遵循场景中有显著优势. 但关键问题是: 这些 benchmark 覆盖的语言最多 63 种 (NOVA-63), 只占 201 种的约 31%. 对于剩余 138 种语言, 没有任何公开定量评估. 这意味着 201 种语言的支持在技术上是一个壮举, 但在实际质量上可能存在「覆盖广但深度浅」的问题——某些低资源语言可能仅能达到「基本理解」水平, 远不足以支撑复杂推理或 Agent 任务.</p>
<h3 id="5-4-jxyfx-sjzldbkkx">5.4 局限与风险: 数据质量的不可控性</h3>
<p>低资源语言的最大风险是 <strong>训练数据的不可控性</strong>. 对于使用人数极少或互联网内容稀少的语言, 训练语料可能来自自动抓取或机器翻译, 质量参差不齐. 更严重的是数据污染: 低资源语言的评估 benchmark 本身可能已被包含在训练语料中, 因为语料筛选时难以区分「训练数据」和「评估数据」——这些语言的公开文本总量本身就很小.</p>
<p>此外, 词表扩展带来的编码效率提升在不同语言间分布不均. 10%-60% 的范围说明某些语言获益巨大, 而某些语言可能几乎没有提升. 如果官方未披露每种语言的具体提升幅度, 那么「10%-60%」只是一个难以验证的聚合数字.</p>
<hr>
<h2 id="6-jphxdb-jgcyyxn-trade-off">6 竞品横向对比: 架构差异与性能 trade-off</h2>
<h3 id="6-1-yzyjpdjgcy">6.1 与主要竞品的架构差异</h3>
<p>表 6 汇总了 Qwen3.5 与核心竞品的对比:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">GPT-5.2</th>
<th align="left">Claude 4.5 Opus</th>
<th align="left">Gemini-3 Pro</th>
<th align="left">K2.5-1T-A32B</th>
<th align="left">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构类型</td>
<td align="left">Dense</td>
<td align="left">未公开</td>
<td align="left">原生多模态</td>
<td align="left">稀疏 MoE</td>
<td align="left">混合注意力 + 稀疏 MoE</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="left">87.4</td>
<td align="left">89.5</td>
<td align="left">89.8</td>
<td align="left">87.1</td>
<td align="left">87.8</td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="left">87.7</td>
<td align="left">84.8</td>
<td align="left">90.7</td>
<td align="left">85.0</td>
<td align="left">83.6</td>
</tr>
<tr>
<td align="left">SWE-bench Verified</td>
<td align="left">80.0</td>
<td align="left">80.9</td>
<td align="left">76.2</td>
<td align="left">76.8</td>
<td align="left">76.4</td>
</tr>
<tr>
<td align="left">VITA-Bench</td>
<td align="left">38.2</td>
<td align="left">56.3</td>
<td align="left">51.6</td>
<td align="left">41.9</td>
<td align="left">49.7</td>
</tr>
<tr>
<td align="left">OSWorld-Verified</td>
<td align="left">38.2</td>
<td align="left">66.3</td>
<td align="left">--</td>
<td align="left">63.3</td>
<td align="left">62.2</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">~100%</td>
<td align="left">未公开</td>
<td align="left">未公开</td>
<td align="left">32B</td>
<td align="left">17B</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: Qwen3.5 与核心竞品的横向对比.</p>
</blockquote>
<p>几个关键 trade-off 值得分析. GPT-5.2 采用 Dense 架构, 在 MMLU-Pro 和 LiveCodeBench 上与 Qwen3.5 互有胜负, 但 Qwen3.5 的 17B 激活参数意味着单次推理计算量远低于 Dense 模型. Claude 4.5 Opus 在编码 Agent 上领先, 但在通用 Agent 上优势缩小. Gemini-3 Pro 在视觉基准上长期领先, 但 Qwen3.5 在 MathVision 和 V* 上实现了反超, 验证了「预训练深度融合 + STEM 数据扩展」策略的有效性.</p>
<p>K2.5-1T-A32B 是稀疏架构上最直接的竞品: 1T 总参数, 32B 激活参数. 其激活参数几乎是 Qwen3.5 的两倍 (32B vs. 17B), 但在多数基准上并未展现相应优势. 这说明<strong>激活参数的规模不是决定能力的唯一因素, 架构效率、数据质量和训练方法同样关键</strong>. Qwen3.5 用更少的激活参数实现了相当或更好的性能, 验证了其混合架构在能力密度上的优越性. K2.5 在长上下文搜索 (BrowseComp 74.9 vs. 78.6) 上略胜一筹, 这可能反映了月之暗面在超长上下文处理上的特定优化.</p>
<p>这里值得停一下, 追问一个关于 benchmark 可比性的问题. 表 6 中的数据来自官方博客, 但不同模型的评估条件并不完全一致: Qwen3.5 在部分基准上使用了固定提示或特定工具配置 (如 CI), 而其他模型可能采用了不同的评估协议. 这意味着横向对比的绝对分数差异需要谨慎解读, 更应关注相对趋势和架构层面的 trade-off.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">K2.5-1T-A32B</th>
<th align="left">Qwen3.5-397B-A17B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">1T</td>
<td align="left">397B</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">32B</td>
<td align="left">17B</td>
</tr>
<tr>
<td align="left">激活比</td>
<td align="left">3.2%</td>
<td align="left">4.3%</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="left">87.1</td>
<td align="left">87.8</td>
</tr>
<tr>
<td align="left">MMLU-Redux</td>
<td align="left">94.5</td>
<td align="left">94.9</td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="left">85.0</td>
<td align="left">83.6</td>
</tr>
<tr>
<td align="left">BFCL-V4</td>
<td align="left">68.3</td>
<td align="left">72.9</td>
</tr>
<tr>
<td align="left">VITA-Bench</td>
<td align="left">41.9</td>
<td align="left">49.7</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: Qwen3.5 与 K2.5-1T-A32B 的核心对比.</p>
</blockquote>
<hr>
<h2 id="7-jcssyzj">7 基础设施与总结</h2>
<h3 id="7-1-fp8-yhsjkyyb-rl-yh">7.1 FP8 运行时监控与异步 RL 优化</h3>
<p>Qwen3.5 采用原生 FP8 流水线, 对激活、MoE 路由与 GEMM 运算使用低精度, 并通过运行时监控在敏感层自动回退 BF16, 实现约 50% 的激活显存降低与超过 10% 的加速.</p>
<p>这里值得停一下, 分析「运行时监控回退」的工程价值. 纯 FP8 训练的问题在于, 某些层 (如 LayerNorm 附近、注意力 Softmax 的指数运算) 对数值范围极其敏感, FP8 的窄动态范围 (E4M3 格式仅有 1 位符号 + 4 位指数 + 3 位尾数) 容易导致梯度下溢或激活溢出. 传统方案是人工标注敏感层并强制使用 BF16, 但这需要大量实验调优, 且不同架构的敏感层分布不同. Qwen3.5 的「运行时监控 + 自动回退」将这一过程自动化, 在保持训练稳定性的同时最大化 FP8 覆盖范围. 在数万亿 token 的训练规模下, 50% 的激活显存降低意味着数十 GB 甚至数百 GB 的显存节省, 直接转化为更大的 batch size 或更长的上下文.</p>
<p>异步 RL 框架还引入了投机采样 (通过 draft 模型加速 Rollout 解码) 和 Rollout 路由回放 (复用 MoE 路由决策避免重复计算), 共同支撑了 3-5 倍的端到端加速.</p>
<h3 id="7-2-jgzxywjwt">7.2 架构哲学与未解问题</h3>
<p>Qwen3.5 的架构设计体现了一套清晰的工程哲学: <strong>在能力密度与推理效率之间做极端优化, 在多模态融合与训练稳定性之间找动态平衡, 在语言覆盖广度与单语质量深度之间接受 trade-off</strong>. 核心创新可总结为三点: (1) Gated DeltaNet + Gated Attention 混合注意力, 用线性注意力攻克长序列效率瓶颈, 用标准注意力保留短序列精细对齐能力; (2) 原生多模态预训练融合, 从训练第一天就将文本、图像、视频置于同一表征空间; (3) 异步 RL 训推分离, 通过 FP8、投机采样、路由回放实现 3-5 倍端到端加速.</p>
<p>然而, 几个未解问题值得后续关注: MoE 路由的 all-to-all 通信在超大规模部署中是否会成为硬约束? Gated DeltaNet 的数学形式化细节尚未公开, 其「平移不变性」假设在某些任务中可能构成限制. 异步 RL 的长轨迹稳定性是一个开放问题——当 Agent 任务扩展到 50+ 轮环境交互时, 样本陈旧性和 credit assignment 的相互作用尚未被充分验证. 低资源语言的 201 种覆盖在质量上是否经得起检验? 当前多语言 benchmark 最多覆盖 63 种语言, 剩余 138 种语言的能力处于「黑箱」状态.</p>
<hr>
<h2 id="ckyys">参考与延伸</h2>
<ul>
<li>Qwen3.5 官方博客: <a href="https://qwen.ai/blog?id=qwen3.5">Qwen3.5: Accelerating Productivity with Native Multimodal Agents</a></li>
<li>DeltaNet 原始论文 (门控线性注意力的理论基础)</li>
<li>DeepSeek-V3.2 技术报告 (同代稀疏 MoE 架构的对比参照)</li>
<li>Llama-4 技术报告 (10M 长上下文与层次化注意力方案)</li>
<li>Gemini-3 Pro 技术文档 (原生多模态与 Sparse Attention 的工程实现)</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hhjg-wsmsxxzyl-xs-moe","text":"1 混合架构: 为什么是线性注意力 + 稀疏 MoE"},{"level":3,"id":"1-1-sjdj-bzzyldxssj","text":"1.1 设计动机: 标准注意力的效率死结"},{"level":3,"id":"1-2-jgxj-moe-lydsggcxj","text":"1.2 架构细节: MoE 路由的三个工程陷阱"},{"level":3,"id":"1-3-pxyyx-hhzyldjsml","text":"1.3 谱系与影响: 混合注意力的技术脉络"},{"level":2,"id":"2-ysdmt-rhefpj","text":"2 原生多模态: 融合而非拼接"},{"level":3,"id":"2-1-sjdj-hpjfadgbqx","text":"2.1 设计动机: 后拼接方案的根本缺陷"},{"level":3,"id":"2-2-jgxj-ygbhdgcbyx","text":"2.2 架构细节: 异构并行的工程必要性"},{"level":3,"id":"2-3-sjysy-sj-benchmark-dpgmq","text":"2.3 数据与实验: 视觉 benchmark 的评估盲区"},{"level":3,"id":"2-4-jxyfx-ysdmtdyxcb","text":"2.4 局限与风险: 原生多模态的隐性成本"},{"level":2,"id":"3-1m-tokens-csxw-jsljybj","text":"3 1M Tokens 长上下文: 技术路径与边界"},{"level":3,"id":"3-1-sjdj-wsms-1m-bs-10m","text":"3.1 设计动机: 为什么是 1M, 不是 10M"},{"level":3,"id":"3-2-jgxj-szjsddj","text":"3.2 架构细节: 三重技术的叠加"},{"level":3,"id":"3-3-sjysy-csxw-benchmark-dxtxmq","text":"3.3 数据与实验: 长上下文 benchmark 的系统性盲区"},{"level":2,"id":"4-kz-rl-hxl-cjtsjdhjbh","text":"4 扩展 RL 后训练: 从静态数据到环境闭环"},{"level":3,"id":"4-1-sjdj-ct-rlhf-d-agent-mq","text":"4.1 设计动机: 传统 RLHF 的 Agent 盲区"},{"level":3,"id":"4-2-jgxj-yb-rl-dsggjjc","text":"4.2 架构细节: 异步 RL 的三个关键决策"},{"level":3,"id":"4-3-sjysy-rl-zydgynt","text":"4.3 数据与实验: RL 增益的归因难题"},{"level":3,"id":"4-4-jxyfx-yb-rl-dybcjx","text":"4.4 局限与风险: 异步 RL 的样本陈旧性"},{"level":2,"id":"5-201-zyy-gdysddzl","text":"5 201 种语言: 广度与深度的张力"},{"level":3,"id":"5-1-sjdj-dzyyyd-scaling-law","text":"5.1 设计动机: 低资源语言的 scaling law"},{"level":3,"id":"5-2-jgxj-25-wcbd-trade-off","text":"5.2 架构细节: 25 万词表的 trade-off"},{"level":3,"id":"5-3-sjysy-yyfgdsdmq","text":"5.3 数据与实验: 语言覆盖的深度盲区"},{"level":3,"id":"5-4-jxyfx-sjzldbkkx","text":"5.4 局限与风险: 数据质量的不可控性"},{"level":2,"id":"6-jphxdb-jgcyyxn-trade-off","text":"6 竞品横向对比: 架构差异与性能 trade-off"},{"level":3,"id":"6-1-yzyjpdjgcy","text":"6.1 与主要竞品的架构差异"},{"level":2,"id":"7-jcssyzj","text":"7 基础设施与总结"},{"level":3,"id":"7-1-fp8-yhsjkyyb-rl-yh","text":"7.1 FP8 运行时监控与异步 RL 优化"},{"level":3,"id":"7-2-jgzxywjwt","text":"7.2 架构哲学与未解问题"},{"level":2,"id":"ckyys","text":"参考与延伸"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/10-qwen3.5/05-qwen3.5-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/10-qwen3.5/05-qwen3.5-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.5 核心架构剖析</h1>
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
