"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3 工程落地精读</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 DeepSeek-V3 训练与推理的工程实现细节, 涵盖 DualPipe 流水线并行、跨节点 All-to-All 通信内核优化、FP8 混合精度训练、内存节省策略、推理部署架构、训练成本核算以及对未来硬件的设计建议.</p>
</blockquote>
<hr>
<h2 id="1-dual-pipe-tx-jszddjz">1 DualPipe: 通信-计算重叠的极致</h2>
<h3 id="1-1-ctlsxbhdpj">1.1 传统流水线并行的瓶颈</h3>
<p>标准流水线并行(Pipeline Parallelism, PP)将模型按层划分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi></mrow><annotation encoding="application/x-tex">P</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span> 个阶段. 在 GPT-3 风格的流水线中, 气泡占总时间的比例约为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Bubble Ratio</mtext><mo>=</mo><mfrac><mrow><mo stretchy="false">(</mo><mi>P</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">(</mo><mi>F</mi><mo>+</mo><mi>B</mi><mo stretchy="false">)</mo></mrow><mrow><mi>M</mi><mo>⋅</mo><mo stretchy="false">(</mo><mi>F</mi><mo>+</mo><mi>B</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>=</mo><mfrac><mrow><mi>P</mi><mo>−</mo><mn>1</mn></mrow><mi>M</mi></mfrac></mrow><annotation encoding="application/x-tex">\\text{Bubble Ratio} = \\frac{(P-1)(F+B)}{M \\cdot (F+B)} = \\frac{P-1}{M}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Bubble Ratio</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0463em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi></mrow><annotation encoding="application/x-tex">M</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span></span> 为 micro-batch 数量, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>F</mi></mrow><annotation encoding="application/x-tex">F</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 分别为前向和反向时间. 即使 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi></mrow><annotation encoding="application/x-tex">M</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span></span> 很大, 专家并行引入的 all-to-all 通信也无法被隐藏. 在 DeepSeek-V3 的场景下, 跨节点 EP 引入的通信开销导致计算-通信比约为 1:1, 这意味着如果不做重叠优化, 50% 的训练时间将被通信消耗.</p>
<h3 id="1-2-dual-pipe-dsxtdyl">1.2 DualPipe 的双向调度原理</h3>
<p>DualPipe 的核心思想是在一对独立的前向和反向块内重叠计算和通信. 具体而言, 每个块被分成四个组件: <code>attention</code>、<code>all-to-all dispatch</code>、<code>MLP</code> 和 <code>all-to-all combine</code>. 对于反向块, <code>attention</code> 和 <code>MLP</code> 都被进一步分成「输入反向」和「权重反向」, 类似于 ZeroBubble. 此外还有一个 <code>PP communication</code> 组件.</p>
<p>对于一对前向和反向块, DeepSeek 重新排列这些组件并手动调整专用于通信与计算的 GPU SM(Streaming Multiprocessor)比例. 在这种重叠策略中, all-to-all 和 PP 通信在执行期间都可以被完全隐藏.</p>
<p>完整的 DualPipe 调度采用双向流水线: 从流水线两端同时喂入 micro-batch. 正向流从输入层到输出层执行前向传播, 反向流从输出层到输入层执行反向传播. 当正向流需要执行 all-to-all 通信时, 反向流的计算单元恰好处于计算阶段; 反之亦然.</p>
<blockquote>
<p>译者注: DualPipe 的数学本质是将流水线调度问题转化为一个双向流水线图着色问题: 给定计算图 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 和通信边集合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">E_c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 找到一种调度方案使得任意时刻计算资源利用率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ρ</mi><mo>≥</mo><msub><mi>ρ</mi><mi>min</mi><mo>⁡</mo></msub></mrow><annotation encoding="application/x-tex">\\rho \\geq \\rho_{\\min}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8304em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">ρ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">ρ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">i</span><span class="mtight">n</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 且通信边 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>e</mi><mo>∈</mo><msub><mi>E</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">e \\in E_c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">e</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 不与其他计算冲突. 这种双向调度不是简单的「两个 1F1B 叠加」, 而是需要精确到微秒级的时序编排. 在工程实现上, DeepSeek 团队手动编写了 CUDA 内核来确保计算和通信的精确同步, 而非依赖 PyTorch 的自动调度.</p>
</blockquote>
<h3 id="1-3-yxy-pp-ffddb">1.3 与现有 PP 方法的对比</h3>
<table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">气泡公式</th>
<th align="left">参数内存</th>
<th align="left">激活内存</th>
<th align="left">约束条件</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1F1B</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>P</mi><mi>P</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">(</mo><mi>F</mi><mo>+</mo><mi>B</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(PP - 1)(F + B)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo></mrow><annotation encoding="application/x-tex">1\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mord">×</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">PP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span></td>
<td align="left">无</td>
</tr>
<tr>
<td align="left">ZB1P</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>P</mi><mi>P</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">(</mo><mi>F</mi><mo>+</mo><mi>B</mi><mo>−</mo><mn>2</mn><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(PP - 1)(F + B - 2W)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo></mrow><annotation encoding="application/x-tex">1\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mord">×</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">PP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span></td>
<td align="left">无</td>
</tr>
<tr>
<td align="left">Chimera</td>
<td align="left">约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mrow><mi>P</mi><mi>P</mi></mrow><mn>2</mn></mfrac><mo stretchy="false">(</mo><mi>F</mi><mo>+</mo><mi>B</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\frac{PP}{2}(F + B)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2173em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8723em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo></mrow><annotation encoding="application/x-tex">2\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mord">×</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>P</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">2 \\times PP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span></td>
<td align="left">micro-batch 能被 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">PP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span> 整除</td>
</tr>
<tr>
<td align="left"><strong>DualPipe</strong></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mfrac><mrow><mi>P</mi><mi>P</mi></mrow><mn>2</mn></mfrac><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">(</mo><mi>F</mi><mi mathvariant="normal">&amp;</mi><mi>B</mi><mo>+</mo><mi>B</mi><mo>−</mo><mn>3</mn><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(\\frac{PP}{2} - 1)(F\\&amp;B + B - 3W)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2173em;vertical-align:-0.345em;"></span><span class="mopen">(</span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8723em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mord">&amp;</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo></mrow><annotation encoding="application/x-tex">2\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mord">×</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mi>P</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">PP + 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span></td>
<td align="left">阶段和 micro-batch 能被 2 整除</td>
</tr>
</tbody></table>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 为「权重反向」块的执行时间, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>F</mi><mi mathvariant="normal">&amp;</mi><mi>B</mi></mrow><annotation encoding="application/x-tex">F\\&amp;B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mord">&amp;</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 为两个相互重叠的前向和反向块的执行时间.</p>
<p>对于 DeepSeek-V3 的 16 路 PP(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mi>P</mi><mo>=</mo><mn>16</mn></mrow><annotation encoding="application/x-tex">PP=16</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">16</span></span></span></span>):</p>
<ul>
<li>1F1B 的气泡为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mo stretchy="false">(</mo><mi>F</mi><mo>+</mo><mi>B</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">15(F+B)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span></span></li>
<li>DualPipe 的气泡仅为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo stretchy="false">(</mo><mi>F</mi><mi mathvariant="normal">&amp;</mi><mi>B</mi><mo>+</mo><mi>B</mi><mo>−</mo><mn>3</mn><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">7(F\\&amp;B + B - 3W)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">7</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mord">&amp;</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span></span></span></span></li>
</ul>
<p>由于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>F</mi><mi mathvariant="normal">&amp;</mi><mi>B</mi></mrow><annotation encoding="application/x-tex">F\\&amp;B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mord">&amp;</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 是重叠后的时间(远小于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>F</mi><mo>+</mo><mi>B</mi></mrow><annotation encoding="application/x-tex">F+B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span>), 且 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 通常约为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 的一半, DualPipe 的气泡大约是 1F1B 的 1/4 到 1/3.</p>
<blockquote>
<p>译者注: DualPipe 的代价是需要保存两份模型参数(因为反向传播需要同时访问前向的参数). 但在 DeepSeek-V3 的场景下, 这是可接受的: EP 已经将专家参数分散到大量 GPU 上, 单卡参数量不大. 此外, DualPipe 的激活内存为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mi>P</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">PP + 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>, 比 Chimera 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>P</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">2 \\times PP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span> 更省. 与 Chimera 相比, DualPipe 只要求流水线阶段和 micro-batch 能被 2 整除, 而不要求 micro-batch 能被流水线阶段数整除, 这在实际部署中更灵活.</p>
</blockquote>
<h3 id="1-4-xlddyhfy-sm-td">1.4 细粒度单元划分与 SM 调度</h3>
<p>DeepSeek 将每个 attention 和 FFN 层进一步细分为更小的计算单元, 使得单元间的计算-通信粒度匹配. 计算单元小到足以填充通信间隙, 但又大到不会引入过多的调度开销.</p>
<p>在 H800 GPU 上, 132 个 SM 被划分为两部分: 约 112 个 SM 用于计算, 20 个 SM(约 15%)专门用于通信. 这 20 个通信 SM 通过 warp specialization 技术进一步分成 10 个通信通道. 分配给每个通信任务的 warp 数量根据所有 SM 上的实际工作负载动态调整.</p>
<blockquote>
<p>译者注: 15% 的 SM 用于通信是一个巨大的比例. 这意味着在 DeepSeek-V3 的训练中, 只有约 85% 的 GPU 算力用于实际计算. 如果这些通信任务能被卸载到专用硬件(如 NVIDIA SHARP 或未来的通信协处理器), 训练效率还可以再提升约 15%. 这也是为什么 DeepSeek 在硬件建议中明确提出「将通信任务从 SM 卸载」的原因.</p>
</blockquote>
<hr>
<h2 id="2-kjd-all-to-all-txnhyh">2 跨节点 All-to-All 通信内核优化</h2>
<h3 id="2-1-yjtpydkcy">2.1 硬件拓扑与带宽差异</h3>
<p>DeepSeek-V3 的训练集群配备 2048 块 NVIDIA H800 GPU, 分为 256 个节点(每节点 8 块). 节点内 GPU 通过 NVLink(160 GB/s)和 NVSwitch 互联, 跨节点通过 InfiniBand(IB, 50 GB/s)互联. NVLink 带宽约为 IB 的 3.2 倍.</p>
<h3 id="2-2-tx-jszdcl">2.2 通信-计算重叠策略</h3>
<p>为了有效利用 IB 和 NVLink 的不同带宽, DeepSeek 将每个 token 限制为最多分发到 4 个节点, 从而减少 IB 流量. 对于每个 token, 其路由决策做出后:</p>
<ol>
<li>首先通过 IB 传输到目标节点上具有相同节点内索引的 GPU</li>
<li>到达目标节点后, 通过 NVLink 即时转发到承载目标专家的特定 GPU</li>
</ol>
<p>通过这种方式, IB 和 NVLink 上的通信被完全重叠, 两者不相互等待. 每个 token 可以在每个节点上高效选择平均 3.2 个专家而不产生 NVLink 额外开销. 这意味着虽然 DeepSeek-V3 实践中只选择 8 个路由专家, 但可将此数量扩展到最多 13 个专家(4 节点 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>×</mo></mrow><annotation encoding="application/x-tex">\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord">×</span></span></span></span> 3.2 专家/节点), 同时保持相同的通信成本.</p>
<h3 id="2-3-warp-specialization-y-ptx-yh">2.3 Warp Specialization 与 PTX 优化</h3>
<p>20 个通信 SM 被分成 10 个通信通道. 在 dispatch 过程中:</p>
<ul>
<li>IB 发送</li>
<li>IB-to-NVLink 转发</li>
<li>NVLink 接收</li>
</ul>
<p>以上三个步骤由各自的 warp 处理, warp 数量动态调整. 在 combine 过程中:</p>
<ul>
<li>NVLink 发送</li>
<li>NVLink-to-IB 转发和累加</li>
<li>IB 接收和累加</li>
</ul>
<p>同样由动态调整的 warp 处理. 此外, dispatch 和 combine 内核都与计算流重叠.</p>
<p>DeepSeek 采用定制的 PTX(Parallel Thread Execution)指令并自动调整通信块大小, 这显著减少了 L2 缓存的使用和对其他 SM 计算内核的干扰.</p>
<blockquote>
<p>译者注: PTX 是 NVIDIA GPU 的中间指令集, 比 CUDA C++ 更底层. 使用定制 PTX 指令意味着 DeepSeek 团队直接操作 GPU 的寄存器分配、warp 调度和内存访问模式, 绕过 CUDA 编译器的自动优化. 这种「手写汇编」级别的优化在现代大模型训练中非常罕见, 通常只有专业的 HPC 团队才会采用. 自动调整通信块大小则是一个自适应优化: 不同消息大小和集群拓扑下, 最优的通信块大小不同, 固定块大小可能导致带宽利用率不足或缓存 thrashing.</p>
</blockquote>
<hr>
<h2 id="3-fp8-hhjdxl">3 FP8 混合精度训练</h2>
<h3 id="3-1-wsm-fp8-kh">3.1 为什么 FP8 可行</h3>
<p>FP8 (E4M3) 的数值范围:</p>
<table>
<thead>
<tr>
<th align="left">属性</th>
<th align="left">E4M3</th>
<th align="left">E5M2</th>
<th align="left">BF16</th>
</tr>
</thead>
<tbody><tr>
<td align="left">指数位</td>
<td align="left">4</td>
<td align="left">5</td>
<td align="left">8</td>
</tr>
<tr>
<td align="left">尾数位</td>
<td align="left">3</td>
<td align="left">2</td>
<td align="left">7</td>
</tr>
<tr>
<td align="left">最大值</td>
<td align="left">448.0</td>
<td align="left">57344.0</td>
<td align="left">3.4×10^38</td>
</tr>
<tr>
<td align="left">最小正数</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>2</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup><mo>≈</mo><mn>0.0156</mn></mrow><annotation encoding="application/x-tex">2^{-6} \\approx 0.0156</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.0156</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>2</mn><mrow><mo>−</mo><mn>9</mn></mrow></msup><mo>≈</mo><mn>0.00195</mn></mrow><annotation encoding="application/x-tex">2^{-9} \\approx 0.00195</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">9</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.00195</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>38</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.2 \\times 10^{-38}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">38</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td align="left">相对精度</td>
<td align="left">~12.5%</td>
<td align="left">~25%</td>
<td align="left">~0.4%</td>
</tr>
</tbody></table>
<p>对于 Transformer 训练, 激活值的分布通常呈现长尾特征: 大部分值集中在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mo>−</mo><mn>1</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[-1, 1]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">−</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">]</span></span></span></span> 区间, 但偶尔有异常值(outliers)达到数十或数百. 直接对所有张量使用统一缩放因子会导致: 缩放因子过大 → 小值被量化为 0, 信息丢失; 缩放因子过小 → 大值溢出为 Inf, 训练崩溃.</p>
<h3 id="3-2-hhjdkj">3.2 混合精度框架</h3>
<p>在 DeepSeek 的混合精度框架中, 大多数计算密集型操作以 FP8 精度执行, 而关键操作策略性保持更高精度:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">精度</th>
<th align="left">原因</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Fprop/Dgrad/Wgrad GEMM</td>
<td align="left">FP8</td>
<td align="left">计算密集型, Tensor Core 原生支持</td>
</tr>
<tr>
<td align="left">嵌入模块</td>
<td align="left">BF16/FP32</td>
<td align="left">对低精度敏感</td>
</tr>
<tr>
<td align="left">输出头</td>
<td align="left">BF16/FP32</td>
<td align="left">对低精度敏感</td>
</tr>
<tr>
<td align="left">MoE 门控模块</td>
<td align="left">BF16/FP32</td>
<td align="left">路由决策精度影响负载均衡</td>
</tr>
<tr>
<td align="left">归一化算子</td>
<td align="left">BF16/FP32</td>
<td align="left">统计量计算需要高精度</td>
</tr>
<tr>
<td align="left">注意力算子</td>
<td align="left">BF16/FP32</td>
<td align="left">softmax 数值稳定性</td>
</tr>
<tr>
<td align="left">主权重</td>
<td align="left">FP32</td>
<td align="left">优化器更新精度</td>
</tr>
<tr>
<td align="left">权重梯度</td>
<td align="left">FP32</td>
<td align="left">批量累加精度</td>
</tr>
<tr>
<td align="left">优化器状态</td>
<td align="left">BF16</td>
<td align="left">一阶/二阶矩, 可容忍精度损失</td>
</tr>
</tbody></table>
<p>这一设计理论上将核心 GEMM 计算速度提升至 BF16 方法的两倍.</p>
<h3 id="3-3-xldlhcl">3.3 细粒度量化策略</h3>
<p>DeepSeek 的细粒度量化策略:</p>
<table>
<thead>
<tr>
<th align="left">张量类型</th>
<th align="left">量化粒度</th>
<th align="left">缩放因子维度</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">激活值</td>
<td align="left">1×128 tile</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>B</mi><mo>×</mo><mi>S</mi><mo separator="true">,</mo><msub><mi>d</mi><mi>h</mi></msub><mi mathvariant="normal">/</mi><mn>128</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(B \\times S, d_h / 128)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">/128</span><span class="mclose">)</span></span></span></span></td>
<td align="left">每 token 每 128 通道独立缩放</td>
</tr>
<tr>
<td align="left">权重</td>
<td align="left">128×128 block</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>d</mi><mi mathvariant="normal">/</mi><mn>128</mn><mo separator="true">,</mo><mi>d</mi><mi mathvariant="normal">/</mi><mn>128</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(d / 128, d / 128)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mord">/128</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">d</span><span class="mord">/128</span><span class="mclose">)</span></span></span></span></td>
<td align="left">每 128×128 元素块独立缩放</td>
</tr>
</tbody></table>
<p>对于矩阵乘法 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">Y</mi><mo>=</mo><mrow><mi mathvariant="bold">X</mi><mi mathvariant="bold">W</mi></mrow></mrow><annotation encoding="application/x-tex">\\mathbf{Y} = \\mathbf{XW}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6861em;"></span><span class="mord mathbf" style="margin-right:0.0288em;">Y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6861em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">XW</span></span></span></span></span>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="bold">Y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>k</mi></mrow></msub><mo>=</mo><munder><mo>∑</mo><mi>j</mi></munder><msub><mi>s</mi><mrow><mi>X</mi><mo separator="true">,</mo><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow></msub><mo>⋅</mo><msub><mi>s</mi><mrow><mi>W</mi><mo separator="true">,</mo><mi>j</mi><mo separator="true">,</mo><mi>k</mi></mrow></msub><mo>⋅</mo><mtext>dequant</mtext><mo stretchy="false">(</mo><mtext>quant</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">X</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>⋅</mo><mtext>dequant</mtext><mo stretchy="false">(</mo><mtext>quant</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">W</mi><mrow><mi>j</mi><mo separator="true">,</mo><mi>k</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathbf{Y}_{i,k} = \\sum_j s_{X,i,j} \\cdot s_{W,j,k} \\cdot \\text{dequant}(\\text{quant}(\\mathbf{X}_{i,j})) \\cdot \\text{dequant}(\\text{quant}(\\mathbf{W}_{j,k}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9722em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathbf" style="margin-right:0.0288em;">Y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0288em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4638em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">X</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7306em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">dequant</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">quant</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">X</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">dequant</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">quant</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf" style="margin-right:0.016em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.016em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span></span></span></span><p>这实际上是一种 <strong>自适应精度分配</strong>: 数值分布均匀的 block 获得较高有效精度, 分布分散的 block 获得较低有效精度但避免溢出.</p>
<blockquote>
<p>译者注: 细粒度量化的核心洞察是「异常值局部化」. 在 Transformer 的激活中, 异常值通常集中在少数通道(如某些注意力头或某些位置), 而不是均匀分布在整个张量上. per-tensor 量化会被这些局部异常值「绑架」, 导致大部分正常数值被过度压缩. tile-wise 和 block-wise 量化则让异常值只影响其所在的局部区域, 其他区域保持较高的有效精度. 这与 NVIDIA Blackwell 架构中引入的 microscaling 格式思想高度一致, 说明 DeepSeek 的设计超前于硬件演进.</p>
</blockquote>
<h3 id="3-4-cuda-core-lj-jdzjz">3.4 CUDA Core 累加: 精度拯救者</h3>
<p>NVIDIA H800 GPU 上 FP8 GEMM 的累加精度限制为保留约 14 位, 显著低于 FP32 累加精度. 当内维度 K 较大时(K = 4096 的测试中, 最大相对误差接近 2%), 这个问题会变得更加明显.</p>
<p>DeepSeek 的解决方案是「提升到 CUDA Core」:</p>
<ol>
<li>Tensor Core 执行 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>128</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">128 \\times 128 \\times 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 的 FP8 矩阵乘法</li>
<li>每 128 次乘法结果立即转换为 BF16</li>
<li>使用 CUDA Core 进行 FP32 累加</li>
</ol>
<p>设置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>C</mi></msub><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">N_C = 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">C</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 个元素(相当于 4 个 WGMMA)为累加间隔. 在 H800 架构上, 两个 WGMMA 通常会并发持续存在: 当一个 warpgroup 执行提升操作时, 另一个能够执行 MMA 操作, 保持 Tensor Core 的高利用率.</p>
<p>实验表明, 这种方案下的 FP8 训练与 BF16 训练的 loss 曲线几乎完全重合, 相对损失误差始终低于 0.25%.</p>
<h3 id="3-5-djdcchtx">3.5 低精度存储和通信</h3>
<p><strong>优化器状态.</strong> AdamW 优化器中的一阶和二阶矩采用 BF16 而非 FP32 存储, 没有观察到可察觉的性能下降. 主权重和梯度仍保留在 FP32 中.</p>
<p><strong>激活缓存.</strong> Wgrad 操作以 FP8 执行, 激活以 FP8 缓存用于反向传播. 注意力算子后 Linear 的输入采用定制的 E5M6 格式(5 位指数 + 6 位尾数, 比 E4M3 更高的精度). 缩放因子采用 2 的整数幂, 使去量化为位移操作.</p>
<p><strong>通信优化.</strong> MoE 上投影前的激活量化为 FP8 后应用 dispatch, 与 FP8 Fprop 兼容. 缩放因子同样为 2 的整数幂. combine 组件保留在 BF16 中, 以保持训练精度.</p>
<blockquote>
<p>译者注: 2 的整数幂缩放因子是一个「以小博大」的工程技巧. 量化公式为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi><mo>=</mo><mtext>round</mtext><mo stretchy="false">(</mo><mi>x</mi><mi mathvariant="normal">/</mi><mi>s</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">q = \\text{round}(x / s)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">round</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord">/</span><span class="mord mathnormal">s</span><span class="mclose">)</span></span></span></span>, 反量化为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>x</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>=</mo><mi>q</mi><mo>×</mo><mi>s</mi></mrow><annotation encoding="application/x-tex">x&#x27; = q \\times s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7519em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span></span></span></span>. 如果 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mo>=</mo><msup><mn>2</mn><mi>k</mi></msup></mrow><annotation encoding="application/x-tex">s = 2^k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span></span></span></span></span></span></span>, 则除法和乘法分别变为右移和左移操作, 在 GPU 上只需一个指令周期. 相比之下, 浮点乘除法需要多个周期. 此外, 当激活从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">1 \\times 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> tile 转换为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>128</mn><mo>×</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">128 \\times 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> tile 时, 2 的整数幂缩放使得转换过程精度无损, 因为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi></mrow><annotation encoding="application/x-tex">s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span></span></span></span> 在两种方向上是相同的.</p>
</blockquote>
<hr>
<h2 id="4-jzncjscl">4 极致内存节省策略</h2>
<h3 id="4-1-rms-norm-h-mla-stydzjs">4.1 RMSNorm 和 MLA 上投影的重计算</h3>
<p>在反向传播期间重计算所有 RMSNorm 操作和 MLA 上投影, 从而无需持久存储它们的输出激活. 以较小的开销为代价, 这一策略显著减少了存储激活的内存需求.</p>
<blockquote>
<p>译者注: 重计算(activation checkpointing)是节省激活内存的经典技术, 但通常只应用于注意力层. DeepSeek-V3 将重计算扩展到 RMSNorm 和 MLA 上投影, 这意味着在每个 Transformer 块中, 只有最基础的输入激活需要被持久存储, 所有中间激活都在反向传播时重新计算. 代价是前向传播需要执行两次(一次正常前向, 一次重计算前向), 但对于内存受限的大规模训练, 这是标准做法.</p>
</blockquote>
<h3 id="4-2-cpu-zdzsydpj">4.2 CPU 中的指数移动平均</h3>
<p>训练期间保留模型参数的 EMA(Exponential Moving Average)用于学习率衰减后模型性能的早期估计. EMA 参数存储在 CPU 内存中, 并在每个训练步骤后异步更新. 这避免了在 GPU 显存中维护 EMA 副本.</p>
<h3 id="4-3-mtp-gxqrhsct">4.3 MTP 共享嵌入和输出头</h3>
<p>通过 DualPipe 策略, 模型的最浅层(嵌入层)和最深层(输出头)部署在同一个 PP 秩上. 这使得 MTP 模块和主模型之间可以物理共享嵌入和输出头的参数和梯度, 进一步减少内存占用.</p>
<h3 id="4-4-bsy-tensor-parallelism">4.4 不使用 Tensor Parallelism</h3>
<p>DeepSeek-V3 的一个关键工程决策是 <strong>不使用 TP(Tensor Parallelism)</strong>. 这一决策的直接后果:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">使用 TP</th>
<th align="left">不使用 TP(DeepSeek-V3)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">注意力计算</td>
<td align="left">被分割到多个 GPU, 需要频繁同步</td>
<td align="left">完整在单个 GPU 上执行</td>
</tr>
<tr>
<td align="left">通信模式</td>
<td align="left">频繁的 intra-node AllReduce</td>
<td align="left">稀疏的 all-to-all(可被重叠)</td>
</tr>
<tr>
<td align="left">最大层大小</td>
<td align="left">受单卡显存限制</td>
<td align="left">受单卡显存限制, 但 MoE 专家分散</td>
</tr>
<tr>
<td align="left">实现复杂度</td>
<td align="left">较低(PyTorch 原生支持)</td>
<td align="left">较高(需定制通信内核)</td>
</tr>
</tbody></table>
<p>DeepSeek-V3 的证明是: 在精心优化的通信内核下, EP + PP + DP 的组合比引入 TP 更高效. TP 的频繁同步会分割注意力头的计算, 降低效率; 而 EP 的 all-to-all 虽然通信量更大, 但可以通过 DualPipe 几乎完全隐藏.</p>
<hr>
<h2 id="5-tlbsjg">5 推理部署架构</h2>
<h3 id="5-1-prefilling-jd">5.1 Prefilling 阶段</h3>
<p>Prefilling 阶段的最小部署单元由 4 个节点共 32 块 GPU 组成:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">并行策略</th>
<th align="left">配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Attention</td>
<td align="left">TP4 + SP + DP8</td>
<td align="left">4 路张量并行 + 序列并行 + 8 路数据并行</td>
</tr>
<tr>
<td align="left">MoE</td>
<td align="left">EP32</td>
<td align="left">32 路专家并行</td>
</tr>
<tr>
<td align="left">Dense MLP(浅层)</td>
<td align="left">TP1</td>
<td align="left">1 路张量并行, 节省通信</td>
</tr>
</tbody></table>
<p><strong>负载均衡策略.</strong> 引入「冗余专家」部署: 复制高负载专家并冗余部署. 高负载专家基于在线统计信息检测, 每 10 分钟调整一次. Prefilling 阶段设置 32 个冗余专家(256 个路由专家中约 12.5% 被复制). 每个 GPU 除原本托管的 8 个专家外, 还托管 1 个额外的冗余专家.</p>
<p><strong>Micro-batch 重叠.</strong> 同时处理两个计算负载相似的 micro-batch, 将一个 micro-batch 的 <code>attention</code> 和 <code>MoE</code> 与另一个 micro-batch 的 <code>dispatch</code> 和 <code>combine</code> 重叠.</p>
<p><strong>动态冗余(探索中).</strong> 每个 GPU 托管更多专家(如 16 个), 但每次推理步骤只激活 9 个. 在每层 all-to-all 操作开始前, 实时计算全局最优路由方案.</p>
<h3 id="5-2-decoding-jd">5.2 Decoding 阶段</h3>
<p>Decoding 阶段的最小部署单元由 40 个节点共 320 块 GPU 组成:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">并行策略</th>
<th align="left">配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Attention</td>
<td align="left">TP4 + SP + DP80</td>
<td align="left">4 路张量并行 + 序列并行 + 80 路数据并行</td>
</tr>
<tr>
<td align="left">MoE</td>
<td align="left">EP320</td>
<td align="left">320 路专家并行</td>
</tr>
<tr>
<td align="left">共享专家</td>
<td align="left">作为路由专家处理</td>
<td align="left">每个 token 选择 9 个专家(含共享专家)</td>
</tr>
</tbody></table>
<p>每个 GPU 只托管一个专家, 64 块 GPU 负责托管冗余专家和共享专家. <code>dispatch</code> 和 <code>combine</code> 的 all-to-all 通信通过 IB 上的直接点对点传输执行, 利用 IBGDA(InfiniBand GPUDirect Async)技术进一步减少延迟.</p>
<p><strong>Micro-batch 重叠.</strong> 与 prefilling 不同, decoding 阶段 <code>attention</code> 消耗更大比例的时间. 因此, 将一个 micro-batch 的 <code>attention</code> 与另一个 micro-batch 的 <code>dispatch+MoE+combine</code> 重叠. 由于每个专家的批量大小较小(通常在 256 个 token 以内), 瓶颈是内存访问而非计算, 因此将较少 SM 分配给 <code>dispatch+MoE+combine</code> 不会影响整体性能.</p>
<blockquote>
<p>译者注: Prefilling 和 Decoding 采用不同的部署单元和重叠策略, 反映了两个阶段截然不同的计算特征. Prefilling 是计算密集型(一次性处理长序列的 attention 计算), 因此需要较大的 EP 规模(EP32)来确保每个专家有足够的 batch size. Decoding 是内存带宽密集型(逐个生成 token, 主要瓶颈是加载 KV Cache 和专家参数), 因此需要更大的 EP 规模(EP320)来分散内存访问压力. IBGDA 技术允许 GPU 直接通过 InfiniBand 网卡收发数据, 绕过 CPU 和系统内存, 这对于延迟敏感的 decoding 阶段至关重要.</p>
</blockquote>
<hr>
<h2 id="6-xlcbhsyxsfx">6 训练成本核算与效率分析</h2>
<h3 id="6-1-yxlcbgc">6.1 预训练成本构成</h3>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">GPU 小时</th>
<th align="left">占比</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">主预训练</td>
<td align="left">2664K</td>
<td align="left">93.8%</td>
<td align="left">14.8T tokens, 61 层, 7168 维</td>
</tr>
<tr>
<td align="left">上下文扩展</td>
<td align="left">119K</td>
<td align="left">4.5%</td>
<td align="left">4K → 32K → 128K, YaRN 外推</td>
</tr>
<tr>
<td align="left">辅助损失实验</td>
<td align="left">10K</td>
<td align="left">0.4%</td>
<td align="left">auxiliary-loss-free 消融</td>
</tr>
<tr>
<td align="left">其他消融实验</td>
<td align="left">42K</td>
<td align="left">1.5%</td>
<td align="left">MTP、FP8、路由策略等</td>
</tr>
<tr>
<td align="left"><strong>总计</strong></td>
<td align="left"><strong>2664K</strong></td>
<td align="left"><strong>100%</strong></td>
<td align="left">约 557.6 万美元(@\$2/GPUh)</td>
</tr>
</tbody></table>
<h3 id="6-2-cbyslyfj">6.2 成本优势来源分解</h3>
<table>
<thead>
<tr>
<th align="left">优化技术</th>
<th align="left">对训练成本的贡献</th>
<th align="left">量化估算</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MLA 压缩</td>
<td align="left">减少 KV Cache 显存占用 57 倍</td>
<td align="left">内存带宽节省约 30%, 等效加速约 1.15 倍</td>
</tr>
<tr>
<td align="left">稀疏激活(MoE)</td>
<td align="left">37B 激活 vs 671B 总参数</td>
<td align="left">计算量减少约 5-6 倍</td>
</tr>
<tr>
<td align="left">FP8 训练</td>
<td align="left">Tensor Core 峰值算力翻倍</td>
<td align="left">训练速度提升约 1.5-2 倍</td>
</tr>
<tr>
<td align="left">DualPipe</td>
<td align="left">通信几乎完全重叠</td>
<td align="left">效率损失 &lt; 5%, 等效于加速约 1.9 倍(原本通信占 50%)</td>
</tr>
<tr>
<td align="left">数据质量</td>
<td align="left">14.8T 高质量语料</td>
<td align="left">收敛速度提升约 1.3 倍</td>
</tr>
<tr>
<td align="left"><strong>综合加速</strong></td>
<td align="left"></td>
<td align="left"><strong>约 10-20 倍 vs 同等性能 Dense 模型</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 上述各因素的加速倍数不是简单相乘的关系, 因为它们作用于不同的瓶颈. MLA 主要缓解内存带宽瓶颈, MoE 减少计算量, FP8 提升计算吞吐量, DualPipe 隐藏通信延迟. 在实际的训练流水线中, 这些优化是协同作用的: 当 MLA 减少了内存带宽压力后, FP8 的计算加速效果更容易被充分利用; 当 DualPipe 隐藏了通信后, MoE 的稀疏激活才能真正发挥计算节省的优势. 这种「算法-框架-硬件」的协同设计是 DeepSeek-V3 训练成本极低的核心原因, 而非任何单一技术的突破.</p>
</blockquote>
<h3 id="6-3-y-llama-3-1-405b-dcbdb">6.3 与 Llama-3.1 405B 的成本对比</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">DeepSeek-V3</th>
<th align="left">Llama-3.1 405B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">671B(MoE)</td>
<td align="left">405B(Dense)</td>
</tr>
<tr>
<td align="left">激活参数/token</td>
<td align="left">37B</td>
<td align="left">405B</td>
</tr>
<tr>
<td align="left">训练数据</td>
<td align="left">14.8T tokens</td>
<td align="left">~15.6T tokens</td>
</tr>
<tr>
<td align="left">训练 GPU</td>
<td align="left">2048 × H800</td>
<td align="left">~16,000 × H100(估算)</td>
</tr>
<tr>
<td align="left">训练时间</td>
<td align="left">~2 个月</td>
<td align="left">~2 个月</td>
</tr>
<tr>
<td align="left">官方训练成本</td>
<td align="left">557.6 万美元</td>
<td align="left">~5800 万美元(估算)</td>
</tr>
<tr>
<td align="left">成本/万亿 token</td>
<td align="left">~37.7 万美元</td>
<td align="left">~371.8 万美元</td>
</tr>
</tbody></table>
<p>DeepSeek-V3 的每万亿 token 训练成本约为 Llama-3.1 405B 的 1/10. 这主要归功于 MoE 的稀疏激活(每次前向只需 37B 参数参与计算)和 FP8 训练(矩阵乘法吞吐翻倍).</p>
<h3 id="6-4-xlwdx">6.4 训练稳定性</h3>
<p>DeepSeek-V3 在整个预训练过程中没有遇到任何不可恢复的损失尖峰, 也没有执行任何回滚. 这一稳定性来自于:</p>
<ol>
<li><strong>细粒度 FP8 量化</strong>: 避免了 per-tensor 量化导致的数值不稳定</li>
<li><strong>CUDA Core FP32 累加</strong>: 解决了 Tensor Core 累加精度不足的问题</li>
<li><strong>高精度保留组件</strong>: 嵌入、输出头、门控、归一化等关键组件保持 BF16/FP32</li>
<li><strong>Auxiliary-loss-free 负载均衡</strong>: 消除了辅助损失对梯度信号的干扰</li>
<li><strong>渐进式上下文扩展</strong>: 4K → 32K → 128K 的两阶段扩展避免了长序列训练的突变</li>
</ol>
<hr>
<h2 id="7-dyjsjdjyyhyyx">7 对硬件设计的建议与行业影响</h2>
<h3 id="7-1-txyj">7.1 通信硬件</h3>
<p>DeepSeek 建议未来 GPU 集成「通信协处理器」, 将 all-to-all 通信任务从 SM 卸载. 具体功能包括:</p>
<ul>
<li>在 IB 和 NVLink 域之间转发数据并聚合流量</li>
<li>在 RDMA 缓冲区和输入/输出缓冲区之间传输数据</li>
<li>执行 all-to-all combine 的 reduce 操作</li>
<li>管理跨 IB-NVLink 域的细粒度内存布局</li>
</ul>
<p>如果实现, 20 个通信 SM 可以全部用于计算, 训练效率再提升约 15%.</p>
<blockquote>
<p>译者注: NVIDIA 已经在朝这个方向努力. NVLink Switch 和 SHARP(Scalable Hierarchical Aggregation and Reduction Protocol)技术正在将部分集合通信操作从 SM 卸载到网络硬件. 但 DeepSeek 的建议更进一步: 希望有一个统一的「通信协处理器」, 能够同时处理 IB(scale-out)和 NVLink(scale-up)域的所有通信任务, 并提供 read、write、multicast、reduce 等简单原语. 如果这一愿景实现, MoE 模型的训练和推理成本还可以再降一个数量级.</p>
</blockquote>
<h3 id="7-2-jsyj">7.2 计算硬件</h3>
<table>
<thead>
<tr>
<th align="left">建议</th>
<th align="left">当前痛点</th>
<th align="left">预期收益</th>
</tr>
</thead>
<tbody><tr>
<td align="left">更高的 FP8 累加精度</td>
<td align="left">Hopper Tensor Core 仅 14 位累加</td>
<td align="left">无需 CUDA Core 回退, 简化代码</td>
</tr>
<tr>
<td align="left">原生支持 tile/block-wise 量化</td>
<td align="left">需 Tensor Core ↔ CUDA Core 频繁数据移动</td>
<td align="left">避免数据移动, 提升 10-20% 效率</td>
</tr>
<tr>
<td align="left">融合 FP8 cast + TMA</td>
<td align="left">量化需额外 HBM 读写</td>
<td align="left">减少 50% 片外内存访问</td>
</tr>
<tr>
<td align="left">共享内存转置读取</td>
<td align="left">反向传播需 HBM 读写转置</td>
<td align="left">减少一倍内存带宽消耗</td>
</tr>
</tbody></table>
<h3 id="7-3-dgcxpdqs">7.3 对国产芯片的启示</h3>
<p>DeepSeek-V3 的训练经验对国产 AI 芯片有重要参考价值:</p>
<ol>
<li><strong>通信能力比峰值算力更重要</strong>: MoE 训练的核心瓶颈是 all-to-all 通信, 而非矩阵乘法. 国产芯片如果能在片间互联带宽上取得突破, 即使峰值算力略低, 也能在 MoE 场景中取得竞争力.</li>
<li><strong>FP8 生态必须完整</strong>: 不仅要有 FP8 计算单元, 还要有细粒度量化、高精度累加、在线量化等配套能力. 昇腾 910B 目前已支持 FP16 和 INT8, 但 FP8 的软件栈成熟度与 H100 仍有差距.</li>
<li><strong>统一内存架构的优势</strong>: DeepSeek-V3 的通信优化严重依赖 IB + NVLink 的高速互联. 国产芯片如果采用统一内存架构(如华为 Atlas 的 HCCS), 可能在某些场景下简化通信优化.</li>
</ol>
<hr>
<h2 id="8-gjgczbhz">8 关键工程指标汇总</h2>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">数值</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">训练集群规模</td>
<td align="left">2048 × H800 GPU</td>
<td align="left">256 节点, 每节点 8 块 GPU</td>
</tr>
<tr>
<td align="left">并行策略</td>
<td align="left">PP16 + EP64 + DP(ZeRO-1)</td>
<td align="left">不使用 TP</td>
</tr>
<tr>
<td align="left">计算-通信比(优化前)</td>
<td align="left">~1:1</td>
<td align="left">EP 引入大量 all-to-all 通信</td>
</tr>
<tr>
<td align="left">计算-通信比(优化后)</td>
<td align="left">~1:0.05</td>
<td align="left">DualPipe 隐藏了 ~95% 通信</td>
</tr>
<tr>
<td align="left">通信 SM 占比</td>
<td align="left">20/132 ≈ 15%</td>
<td align="left">112 个 SM 用于计算</td>
</tr>
<tr>
<td align="left">NVLink 带宽</td>
<td align="left">160 GB/s</td>
<td align="left">节点内互联</td>
</tr>
<tr>
<td align="left">IB 带宽</td>
<td align="left">50 GB/s</td>
<td align="left">跨节点互联</td>
</tr>
<tr>
<td align="left">FP8 训练精度损失</td>
<td align="left">&lt; 0.25%</td>
<td align="left">相对 BF16 基线的损失误差</td>
</tr>
<tr>
<td align="left">FP8 累加间隔 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>C</mi></msub></mrow><annotation encoding="application/x-tex">N_C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">C</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td align="left">128 元素</td>
<td align="left">相当于 4 个 WGMMA</td>
</tr>
<tr>
<td align="left">预训练总成本</td>
<td align="left">557.6 万美元</td>
<td align="left">@ \$2/H800 GPUh</td>
</tr>
<tr>
<td align="left">每万亿 token 成本</td>
<td align="left">~37.7 万美元</td>
<td align="left">含上下文扩展和后训练</td>
</tr>
<tr>
<td align="left">Prefilling 最小部署</td>
<td align="left">32 GPU(4 节点)</td>
<td align="left">TP4 + SP + DP8 + EP32</td>
</tr>
<tr>
<td align="left">Decoding 最小部署</td>
<td align="left">320 GPU(40 节点)</td>
<td align="left">TP4 + SP + DP80 + EP320</td>
</tr>
<tr>
<td align="left">冗余专家比例(Prefill)</td>
<td align="left">32/256 = 12.5%</td>
<td align="left">约 12.5% 的专家被复制</td>
</tr>
<tr>
<td align="left">MTP 投机解码接受率</td>
<td align="left">85%-90%</td>
<td align="left">第二 token 预测准确率</td>
</tr>
<tr>
<td align="left">MTP 投机解码加速</td>
<td align="left">1.8× TPS</td>
<td align="left">Tokens Per Second</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档聚焦工程实现与部署细节. 架构总览见《05-DeepSeek-V3-Architecture-Overview.md》, 技术报告精译见《01-DeepSeek-V3技术报告精译.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dual-pipe-tx-jszddjz","text":"1 DualPipe: 通信-计算重叠的极致"},{"level":3,"id":"1-1-ctlsxbhdpj","text":"1.1 传统流水线并行的瓶颈"},{"level":3,"id":"1-2-dual-pipe-dsxtdyl","text":"1.2 DualPipe 的双向调度原理"},{"level":3,"id":"1-3-yxy-pp-ffddb","text":"1.3 与现有 PP 方法的对比"},{"level":3,"id":"1-4-xlddyhfy-sm-td","text":"1.4 细粒度单元划分与 SM 调度"},{"level":2,"id":"2-kjd-all-to-all-txnhyh","text":"2 跨节点 All-to-All 通信内核优化"},{"level":3,"id":"2-1-yjtpydkcy","text":"2.1 硬件拓扑与带宽差异"},{"level":3,"id":"2-2-tx-jszdcl","text":"2.2 通信-计算重叠策略"},{"level":3,"id":"2-3-warp-specialization-y-ptx-yh","text":"2.3 Warp Specialization 与 PTX 优化"},{"level":2,"id":"3-fp8-hhjdxl","text":"3 FP8 混合精度训练"},{"level":3,"id":"3-1-wsm-fp8-kh","text":"3.1 为什么 FP8 可行"},{"level":3,"id":"3-2-hhjdkj","text":"3.2 混合精度框架"},{"level":3,"id":"3-3-xldlhcl","text":"3.3 细粒度量化策略"},{"level":3,"id":"3-4-cuda-core-lj-jdzjz","text":"3.4 CUDA Core 累加: 精度拯救者"},{"level":3,"id":"3-5-djdcchtx","text":"3.5 低精度存储和通信"},{"level":2,"id":"4-jzncjscl","text":"4 极致内存节省策略"},{"level":3,"id":"4-1-rms-norm-h-mla-stydzjs","text":"4.1 RMSNorm 和 MLA 上投影的重计算"},{"level":3,"id":"4-2-cpu-zdzsydpj","text":"4.2 CPU 中的指数移动平均"},{"level":3,"id":"4-3-mtp-gxqrhsct","text":"4.3 MTP 共享嵌入和输出头"},{"level":3,"id":"4-4-bsy-tensor-parallelism","text":"4.4 不使用 Tensor Parallelism"},{"level":2,"id":"5-tlbsjg","text":"5 推理部署架构"},{"level":3,"id":"5-1-prefilling-jd","text":"5.1 Prefilling 阶段"},{"level":3,"id":"5-2-decoding-jd","text":"5.2 Decoding 阶段"},{"level":2,"id":"6-xlcbhsyxsfx","text":"6 训练成本核算与效率分析"},{"level":3,"id":"6-1-yxlcbgc","text":"6.1 预训练成本构成"},{"level":3,"id":"6-2-cbyslyfj","text":"6.2 成本优势来源分解"},{"level":3,"id":"6-3-y-llama-3-1-405b-dcbdb","text":"6.3 与 Llama-3.1 405B 的成本对比"},{"level":3,"id":"6-4-xlwdx","text":"6.4 训练稳定性"},{"level":2,"id":"7-dyjsjdjyyhyyx","text":"7 对硬件设计的建议与行业影响"},{"level":3,"id":"7-1-txyj","text":"7.1 通信硬件"},{"level":3,"id":"7-2-jsyj","text":"7.2 计算硬件"},{"level":3,"id":"7-3-dgcxpdqs","text":"7.3 对国产芯片的启示"},{"level":2,"id":"8-gjgczbhz","text":"8 关键工程指标汇总"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/05-deep-seek-v3/05-deep-seek-v3-training-system" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/05-deep-seek-v3/05-deep-seek-v3-training-system" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3 工程落地精读</h1>
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
