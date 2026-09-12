"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Ling 2.5 混合线性注意力架构：从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 的注意力革命</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.16-Ling 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>来源</strong>: Inclusion AI Ling 2.5 技术博客、Sebastian Raschka 架构分析、社区技术解读<br><strong>核心概念</strong>: Hybrid Linear Attention, MLA, Lightning Attention, 增量式结构迁移</p>
</blockquote>
<hr>
<h2 id="y-wtbj-wsmxyxxzyl">一、问题背景：为什么需要线性注意力？</h2>
<h3 id="1-1-bz-attention-d-o-n-2-o-n-2-o-n-2-pj">1.1 标准 Attention 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 瓶颈</h3>
<p>Transformer 的核心是 Self-Attention，其计算复杂度为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>对于序列长度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 和维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi></mrow><annotation encoding="application/x-tex">d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span>，复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>。这意味着：</p>
<table>
<thead>
<tr>
<th>序列长度</th>
<th>计算量(相对)</th>
<th>实际场景</th>
</tr>
</thead>
<tbody><tr>
<td>4K</td>
<td>1×</td>
<td>短文本问答</td>
</tr>
<tr>
<td>32K</td>
<td>64×</td>
<td>长文档分析</td>
</tr>
<tr>
<td>128K</td>
<td>1,024×</td>
<td>代码库理解</td>
</tr>
<tr>
<td>1M</td>
<td>65,536×</td>
<td>多轮 Agent 交互</td>
</tr>
</tbody></table>
<p>当模型进入 Agent 时代，上下文长度从 4K 扩展到 1M，标准 attention 的计算量膨胀了 <strong>6.5 万倍</strong>。这是不可持续的。</p>
<h3 id="1-2-xyjjfadjx">1.2 现有解决方案的局限</h3>
<table>
<thead>
<tr>
<th>方案</th>
<th>原理</th>
<th>局限</th>
</tr>
</thead>
<tbody><tr>
<td><strong>稀疏 Attention</strong></td>
<td>只关注局部窗口</td>
<td>丢失长程依赖</td>
</tr>
<tr>
<td><strong>滑动窗口</strong></td>
<td>固定窗口大小</td>
<td>无法处理跨越窗口的任务</td>
</tr>
<tr>
<td><strong>MQA/GQA</strong></td>
<td>共享 KV 头</td>
<td>仅减少内存，不降低 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td><strong>MLA</strong></td>
<td>低秩 KV 压缩</td>
<td>减少 KV Cache，但计算仍为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td><strong>线性 Attention</strong></td>
<td>替换 softmax 为核函数</td>
<td>表达能力下降，需与标准 attention 混合</td>
</tr>
</tbody></table>
<p>线性注意力是唯一能在保持全局依赖的同时将复杂度降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的方案。但纯线性注意力在&quot;精确检索&quot;任务上表现较弱——这正是混合架构的动机。</p>
<hr>
<h2 id="e-ling-2-5-dhhjgsj">二、Ling 2.5 的混合架构设计</h2>
<h3 id="2-1-1-7-hhbldyl">2.1 1:7 混合比例的原理</h3>
<p>Ling 2.5 的注意力层按 <strong>1:7</strong> 比例混合 MLA 和 Lightning Linear Attention。这一比例并非随意设定，而是基于以下权衡：</p>
<p><strong>为什么不是 1:1 或 1:15？</strong></p>
<ul>
<li><strong>1:1(太重)</strong>：过多的 MLA 层会抵消线性注意力的效率优势</li>
<li><strong>1:15(太轻)</strong>：过少的 MLA 层无法提供足够的精确检索能力，模型在长程依赖任务上性能下降</li>
<li><strong>1:7(平衡)</strong>：在 Ring-Flash-Linear-2.0 技术路线的消融实验中，1:7 在&quot;表达能力-效率&quot;帕累托前沿上处于最优点</li>
</ul>
<h3 id="2-2-lightning-attention-qlcdxz">2.2 Lightning Attention：轻量侧的选择</h3>
<p>Ling 2.5 在&quot;轻量侧&quot;选择了 Lightning Attention 而非社区中更流行的 Gated DeltaNet。关键差异：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>Gated DeltaNet</th>
<th>Lightning Attention</th>
</tr>
</thead>
<tbody><tr>
<td>门控机制</td>
<td>标量门(per head)</td>
<td>更简化的循环机制</td>
</tr>
<tr>
<td>记忆更新</td>
<td>状态空间模型风格</td>
<td>纯线性递归</td>
</tr>
<tr>
<td>实现复杂度</td>
<td>较高</td>
<td><strong>较低</strong></td>
</tr>
<tr>
<td>长序列稳定性</td>
<td>良好</td>
<td><strong>良好</strong></td>
</tr>
<tr>
<td>训练稳定性</td>
<td>需要仔细调参</td>
<td><strong>更稳定</strong></td>
</tr>
</tbody></table>
<p>Inclusion AI 的选择反映了其工程优先的文化——在保证效率的前提下，选择实现更简单、训练更稳定的方案。</p>
<h3 id="2-3-mla-zlcdxz">2.3 MLA：重量侧的选择</h3>
<p>Ling 2.5 在&quot;重量侧&quot;采用 DeepSeek 的 MLA 而非继续用 GQA 或标准 MHA：</p>
<p><strong>MLA 的核心优势</strong>：</p>
<ul>
<li><strong>KV Cache 压缩</strong>：通过低秩投影将 KV Cache 从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>h</mi><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot h \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 压缩到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>c</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">c</span><span class="mclose">)</span></span></span></span>，其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>c</mi><mo>≪</mo><mi>h</mi><mo>⋅</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">c \\ll h \\cdot d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">c</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span></li>
<li><strong>推理效率</strong>：在解码阶段，KV Cache 的大小直接影响 batch size 和并发能力</li>
<li><strong>与线性注意力的互补</strong>：MLA 提供&quot;精确检索&quot;，Lightning 提供&quot;快速遍历&quot;</li>
</ul>
<p><strong>从 GQA 到 MLA 的转换</strong>：</p>
<p>Ling 2.5 面临两个具体的兼容性问题：</p>
<ol>
<li><p><strong>QK Norm 非线性</strong>：Ling 2.0 的 QKNorm 阻碍 MLA 推理阶段的高效 KV absorption</p>
<ul>
<li>解决方案：通过采样校准将 QKNorm 参数融合到 q_proj / k_proj 权重中</li>
</ul>
</li>
<li><p><strong>Partial RoPE 不兼容</strong>：Ling 2.0 的 Partial RoPE(仅前 64 维)与 Full RoPE 假设的转换方法冲突</p>
<ul>
<li>解决方案：Partial-RoPE-aware 分解管道——仅对 RoPE 相关维度操作，然后重新组合</li>
</ul>
</li>
</ol>
<hr>
<h2 id="s-zlsjgqy-sjdxlcl">三、增量式结构迁移：四阶段训练策略</h2>
<h3 id="3-1-wsmzlqy">3.1 为什么增量迁移？</h3>
<p>万亿参数模型从零训练的成本极高(数千万美元级别)。Ling 2.5 选择在已训练好的 Ling-2.0-1T 上进行<strong>架构手术</strong>，以 <strong>&lt;10%</strong> 的额外训练成本完成升级。</p>
<h3 id="3-2-sjdlcxj">3.2 四阶段流程详解</h3>
<p><strong>Stage A: GQA → Lightning + GQA 混合(结构手术)</strong></p>
<ul>
<li>将部分 GQA 层的 linear_qkv 扩展头维度，以支持 Lightning Attention 的参数化需求</li>
<li>新引入的门控参数随机初始化，其余参数从 Ling 2.0 checkpoint 继承</li>
<li>保留 QK Norm 和 Partial RoPE 作为&quot;稳定锚点&quot;</li>
</ul>
<p><strong>Stage B: 线性 Warmup(能力恢复)</strong></p>
<ul>
<li>冻结大部分参数，仅解冻 attention 关键转换部分</li>
<li>使用低学习率 + 有限持续训练(通常 &lt;100B tokens)</li>
<li>目标：快速恢复转换前的 loss 水平，验证结构变更未造成灾难性遗忘</li>
</ul>
<p><strong>Stage C: GQA → MLA 转换(KV 压缩升级)</strong></p>
<ul>
<li>移除 QK Norm(已吸收到投影权重)</li>
<li>应用 Partial-RoPE-compatible 的 MLA 转换</li>
<li>短 warmup 恢复临时 PPL 增长</li>
<li>关键观察：Ling-mini/flash 规模上的消融显示，转换后性能快速恢复并超越 GQA 基线</li>
</ul>
<p><strong>Stage D: 全参数训练(规模扩展)</strong></p>
<ul>
<li>确认稳定性后解冻所有参数</li>
<li>在目标规模(1T)下继续全量训练</li>
<li>总训练数据：29T tokens(Ling 2.0 的 20T + 增量 9T)</li>
</ul>
<h3 id="3-3-qydfxyhj">3.3 迁移的风险与缓解</h3>
<table>
<thead>
<tr>
<th>风险</th>
<th>缓解措施</th>
</tr>
</thead>
<tbody><tr>
<td>架构变更导致能力崩塌</td>
<td>分阶段迁移，每阶段验证 loss 恢复</td>
</tr>
<tr>
<td>新参数随机初始化拖慢收敛</td>
<td>Stage B 的线性 warmup，仅训练新参数</td>
</tr>
<tr>
<td>MLA 转换的数值不稳定</td>
<td>QKNorm 吸收 + Partial RoPE 兼容分解</td>
</tr>
<tr>
<td>长程依赖能力退化</td>
<td>1:7 比例确保足够的 MLA 层保留精确检索</td>
</tr>
</tbody></table>
<hr>
<h2 id="s-xsfx-wsm-3-5-ttts">四、效率分析：为什么 3.5× 吞吐提升？</h2>
<h3 id="4-1-fzddb">4.1 复杂度对比</h3>
<table>
<thead>
<tr>
<th>组件</th>
<th>标准 Attention</th>
<th>Linear Attention</th>
<th>MLA</th>
<th>Lightning</th>
</tr>
</thead>
<tbody><tr>
<td>训练复杂度</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>⋅</mo><mi>c</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 \\cdot c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">c</span><span class="mclose">)</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td>推理 KV Cache</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>h</mi><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot h \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>c</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">c</span><span class="mclose">)</span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td>表达能力</td>
<td>最强</td>
<td>较弱</td>
<td>强</td>
<td>较弱</td>
</tr>
</tbody></table>
<p>在 32K 序列长度下：</p>
<ul>
<li>标准 GQA 的 attention 计算占总前向传播的 ~60%</li>
<li>Lightning Linear 将这部分降至 ~15%</li>
<li>MLA 将 KV Cache 从 ~40GB 压缩到 ~8GB(以 1T 模型估算)</li>
</ul>
<h3 id="4-2-y-kimi-k2-ddb">4.2 与 Kimi-K2 的对比</h3>
<p>Kimi-K2(1T 参数)采用 Dense + MLA 架构：</p>
<ul>
<li>没有线性注意力层，所有 attention 仍为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></li>
<li>仅靠 MLA 压缩 KV Cache，但计算复杂度未降低</li>
</ul>
<p>Ling-2.5-1T(1T 参数)的 3.5× 吞吐提升来源：</p>
<ul>
<li><strong>7/8 的层</strong>使用 Lightning Linear，attention 计算近乎消除</li>
<li><strong>1/8 的层</strong>使用 MLA，保留精确检索能力</li>
<li>KV Cache 整体压缩比 Kimi-K2 更激进</li>
</ul>
<hr>
<h2 id="w-y-qwen3-5-kimi-linear-djgdb">五、与 Qwen3.5 / Kimi Linear 的架构对比</h2>
<p>2026 年初，三大中国实验室几乎同时推出了&quot;混合线性注意力&quot;架构：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Ling 2.5</th>
<th>Qwen3.5</th>
<th>Kimi Linear</th>
</tr>
</thead>
<tbody><tr>
<td>轻量侧</td>
<td>Lightning Attention</td>
<td>Gated DeltaNet</td>
<td>Kimi Delta Attention</td>
</tr>
<tr>
<td>重量侧</td>
<td>MLA</td>
<td>Gated Attention</td>
<td>Gated MLA</td>
</tr>
<tr>
<td>混合比例</td>
<td>1:7</td>
<td>1:3 (估计)</td>
<td>1:3 (估计)</td>
</tr>
<tr>
<td>参数规模</td>
<td>1T</td>
<td>~235B</td>
<td>~1T</td>
</tr>
<tr>
<td>上下文</td>
<td>256K→1M</td>
<td>128K→1M</td>
<td>256K</td>
</tr>
<tr>
<td>核心卖点</td>
<td>长上下文效率</td>
<td>综合性能</td>
<td>长上下文效率</td>
</tr>
</tbody></table>
<p><strong>共同趋势</strong>：三者都采用了&quot;轻量线性层 + 重量标准层&quot;的混合范式，差异仅在于具体机制的选择。这标志着 LLM 架构从&quot;统一标准 attention&quot;向&quot;分层异构 attention&quot;的范式转变。</p>
<hr>
<h2 id="l-jxywlfx">六、局限与未来方向</h2>
<ol>
<li><strong>绝对性能 trade-off</strong>：混合线性注意力在长上下文效率上领先，但在短序列、高精度检索任务上可能略逊于纯 MLA 架构</li>
<li><strong>1:7 比例的通用性</strong>：该比例在 1T 规模上验证，但在更小或更大规模上是否需要调整尚不明确</li>
<li><strong>Lightning Attention 的理论理解</strong>：相比标准 attention，线性注意力的表达能力边界仍缺乏系统的理论分析</li>
<li><strong>与 MoE 的协同</strong>：Ling 2.5 保留了 MoE 架构，但线性注意力与专家路由的交互效应尚未被充分研究</li>
</ol>
<hr>
<h2 id="q-zj">七、总结</h2>
<p>Ling 2.5 的混合线性注意力架构代表了大模型 attention 机制的一次重要演进：</p>
<ul>
<li><strong>从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></strong>：通过 Lightning Linear Attention 将大部分层的计算复杂度降至线性</li>
<li><strong>从统一到异构</strong>：1:7 的 MLA + Lightning 混合，在效率和表达能力之间取得平衡</li>
<li><strong>从零到增量</strong>：四阶段增量迁移策略，以 &lt;10% 额外成本完成万亿参数架构升级</li>
<li><strong>从基座到 Agent</strong>：256K→1M 上下文和 3.5× 吞吐提升，为通用智能体时代提供基础设施</li>
</ul>
<p>这一架构选择也反映了 Inclusion AI 的技术哲学：<strong>不追求单一维度的 SOTA，而是在关键应用场景(长上下文 Agent)上做到极致</strong>。在 LLM 架构趋同的背景下，这种&quot;场景驱动差异化&quot;的策略可能是开源模型竞争的新范式。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-wtbj-wsmxyxxzyl","text":"一、问题背景：为什么需要线性注意力？"},{"level":3,"id":"1-1-bz-attention-d-o-n-2-o-n-2-o-n-2-pj","text":"1.1 标准 Attention 的 O ( n 2 ) O(n^2) O ( n 2 ) 瓶颈"},{"level":3,"id":"1-2-xyjjfadjx","text":"1.2 现有解决方案的局限"},{"level":2,"id":"e-ling-2-5-dhhjgsj","text":"二、Ling 2.5 的混合架构设计"},{"level":3,"id":"2-1-1-7-hhbldyl","text":"2.1 1:7 混合比例的原理"},{"level":3,"id":"2-2-lightning-attention-qlcdxz","text":"2.2 Lightning Attention：轻量侧的选择"},{"level":3,"id":"2-3-mla-zlcdxz","text":"2.3 MLA：重量侧的选择"},{"level":2,"id":"s-zlsjgqy-sjdxlcl","text":"三、增量式结构迁移：四阶段训练策略"},{"level":3,"id":"3-1-wsmzlqy","text":"3.1 为什么增量迁移？"},{"level":3,"id":"3-2-sjdlcxj","text":"3.2 四阶段流程详解"},{"level":3,"id":"3-3-qydfxyhj","text":"3.3 迁移的风险与缓解"},{"level":2,"id":"s-xsfx-wsm-3-5-ttts","text":"四、效率分析：为什么 3.5× 吞吐提升？"},{"level":3,"id":"4-1-fzddb","text":"4.1 复杂度对比"},{"level":3,"id":"4-2-y-kimi-k2-ddb","text":"4.2 与 Kimi-K2 的对比"},{"level":2,"id":"w-y-qwen3-5-kimi-linear-djgdb","text":"五、与 Qwen3.5 / Kimi Linear 的架构对比"},{"level":2,"id":"l-jxywlfx","text":"六、局限与未来方向"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.16-ling/04-ling-2.5/05-ling-2.5-hhxxzyljg" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.16-ling/04-ling-2.5/05-ling-2.5-hhxxzyljg" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ling 2.5 混合线性注意力架构：从 $O(n^2)$ 到 $O(n)$ 的注意力革命</h1>
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
