"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>基于 GLM-5 技术报告(arXiv:2602.15763)的架构深度分析,聚焦四大技术支柱:DSA 稀疏注意力、MLA+Muon Split、异步 Agentic RL 基础设施、国产芯片全栈适配.</p>
</blockquote>
<hr>
<h2 id="1-jgzl">1 架构总览</h2>
<p>GLM-5 是一个 744B 总参数、40B 激活参数的 MoE 模型,采用 80 层 transformer 架构(3 层稠密 + 75 层 MoE).与 GLM-4.5(355B/32B)相比,参数规模翻倍,但核心创新不在于单纯的规模扩展,而在于四个维度的系统性优化:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">GLM-4.5</th>
<th align="left">GLM-5</th>
<th align="left">核心变化</th>
</tr>
</thead>
<tbody><tr>
<td align="left">注意力机制</td>
<td align="left">GQA-8</td>
<td align="left">MLA-256 + DSA</td>
<td align="left">从分组查询到潜在压缩+动态稀疏</td>
</tr>
<tr>
<td align="left">推理加速</td>
<td align="left">单 MTP 层</td>
<td align="left">3 MTP 层(参数共享)</td>
<td align="left">接受长度 2.55 -&gt; 2.76</td>
</tr>
<tr>
<td align="left">RL 基础设施</td>
<td align="left">slime v1</td>
<td align="left">slime v2(异步解耦)</td>
<td align="left">支持 1K+ 并发 rollouts</td>
</tr>
<tr>
<td align="left">芯片适配</td>
<td align="left">NVIDIA 为主</td>
<td align="left">7 大国产平台</td>
<td align="left">全栈深度优化</td>
</tr>
</tbody></table>
<hr>
<h2 id="2-dsa-cecdxxdzylgm">2 DSA: 从二次到线性的注意力革命</h2>
<h3 id="2-1-wtbj">2.1 问题背景</h3>
<p>标准 Transformer 的 self-attention 计算复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>L</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L^2 \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 为序列长度.当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mo>=</mo><mn>128</mn><mi>K</mi></mrow><annotation encoding="application/x-tex">L=128K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 时,注意力计算成为训练和推理的主要瓶颈.现有解决方案分为三类:</p>
<ol>
<li><strong>固定模式稀疏</strong>(如滑动窗口): 简单但内容无关,长距离依赖易丢失</li>
<li><strong>线性注意力</strong>(如 GDN): 将 softmax 替换为线性核,但表达能力受限</li>
<li><strong>内容感知稀疏</strong>(如 DSA): 动态选择重要 token,保持表达能力的同时降低复杂度</li>
</ol>
<h3 id="2-2-dsa-dljdjz">2.2 DSA 的两阶段机制</h3>
<p>DSA 的核心是一个「lightning indexer」和一个「token selector」:</p>
<p><strong>阶段 1: Lightning Indexer</strong></p>
<p>为每个查询 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">q_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 计算与所有 key <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>k</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">k_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的相似度分数,检索 top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个最相关的 key-value 对:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><msub><mtext>TopK</mtext><mi>i</mi></msub><mrow><mo fence="true">(</mo><msub><mi>q</mi><mi>t</mi></msub><mo>⋅</mo><msubsup><mi>k</mi><mi>i</mi><mi>T</mi></msubsup><mo fence="true">)</mo></mrow><mo separator="true">,</mo><mspace width="1em"/><mi mathvariant="normal">∣</mi><msub><mi>S</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mo>=</mo><mi>k</mi></mrow><annotation encoding="application/x-tex">S_t = \\text{TopK}_i\\left( q_t \\cdot k_i^T \\right), \\quad |S_t| = k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2413em;vertical-align:-0.35em;"></span><span class="mord"><span class="mord text"><span class="mord">TopK</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span></span><p>在 GLM-5 中,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>2048</mn></mrow><annotation encoding="application/x-tex">k=2048</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2048</span></span></span></span>,远小于序列长度(128K 或 200K).</p>
<p><strong>阶段 2: Sparse Attention</strong></p>
<p>注意力仅在检索到的子集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">S_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 上计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><msub><mi>q</mi><mi>t</mi></msub><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>q</mi><mi>t</mi></msub><mo>⋅</mo><msubsup><mi>K</mi><msub><mi>S</mi><mi>t</mi></msub><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mo>⋅</mo><msub><mi>V</mi><msub><mi>S</mi><mi>t</mi></msub></msub></mrow><annotation encoding="application/x-tex">\\text{Attention}(q_t, K, V) = \\text{softmax}\\left( \\frac{q_t \\cdot K_{S_t}^T}{\\sqrt{d_k}} \\right) \\cdot V_{S_t}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6068em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7654em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4247em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3754em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9334em;vertical-align:-0.2501em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span></span></span><blockquote>
<p><strong>[关键洞察]</strong> 为什么 DSA 是无损的?</p>
<p>固定模式稀疏(如滑动窗口)预设了「哪些 token 重要」,这 inevitably 会丢弃有用信息.DSA 的 indexer 是内容感知的——它为每个查询动态选择最相关的 token.实验表明,在长上下文中约 90% 的注意力条目是冗余的,DSA 通过只计算剩下的 10% 实现了 1.5-2 倍的计算 reduction,同时保持了与全注意力相当的性能.</p>
</blockquote>
<h3 id="2-3-cxyxlsp">2.3 持续预训练适配</h3>
<p>DSA 的一个工程优势是可通过持续预训练从稠密模型迁移,无需从头训练:</p>
<ol>
<li><strong>Warmup 阶段</strong>: 冻结基座模型,仅训练 indexer 1000 步</li>
<li><strong>Joint-training 阶段</strong>: 解冻所有参数,联合训练 20B token</li>
</ol>
<p>GLM-4.7-Flash 上的实验表明,仅 warmup 就保留了 90%+ 的性能;联合训练 150B token 后,性能几乎完全恢复.</p>
<hr>
<h2 id="3-mla-muon-split-ysyyhdph">3 MLA + Muon Split: 压缩与优化的平衡</h2>
<h3 id="3-1-mla-djbyl">3.1 MLA 的基本原理</h3>
<p>MLA(Multi-latent Attention)将 key 和 value 压缩到低维潜在向量,减少 KV Cache 内存:</p>
<ul>
<li>标准 GQA-8: KV Cache 每 token 为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mn>2048</mn></mrow><annotation encoding="application/x-tex">2 \\times 2048</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2048</span></span></span></span> 维</li>
<li>MLA: KV Cache 每 token 为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>576</mn></mrow><annotation encoding="application/x-tex">576</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">576</span></span></span></span> 维(压缩比 3.55x)</li>
</ul>
<p>但 MLA 的原始实现在 Muon optimizer 下性能不如 GQA-8.问题在于 Muon 的正交化操作对所有注意力头共享,限制了不同头的独立优化.</p>
<h3 id="3-2-muon-split-dgj">3.2 Muon Split 的改进</h3>
<p>Muon Split 将上投影矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>W</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msup><mo separator="true">,</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>K</mi></mrow></msup><mo separator="true">,</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>V</mi></mrow></msup></mrow><annotation encoding="application/x-tex">W^{UQ}, W^{UK}, W^{UV}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span></span></span></span> 按头拆分为独立子矩阵:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>W</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msup><mo>=</mo><mo stretchy="false">[</mo><msubsup><mi>W</mi><mn>1</mn><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mo separator="true">,</mo><msubsup><mi>W</mi><mn>2</mn><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msubsup><mi>W</mi><mi>h</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mo stretchy="false">]</mo><mo separator="true">,</mo><mspace width="1em"/><mtext>对每个 </mtext><msubsup><mi>W</mi><mi>i</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mtext> 独立正交化</mtext></mrow><annotation encoding="application/x-tex">W^{UQ} = [W^{UQ}_1, W^{UQ}_2, \\dots, W^{UQ}_h], \\quad \\text{对每个 } W^{UQ}_i \\text{ 独立正交化}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8913em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2605em;vertical-align:-0.3013em;"></span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4337em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2663em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4337em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2663em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mclose">]</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord cjk_fallback">对每个</span><span class="mord"> </span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4231em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">独立正交化</span></span></span></span></span></span><p>这使不同头的投影权重可以以不同尺度更新,实验显示 MLA + Muon Split 在 4/7 基准上超越了 GQA-8.</p>
<h3 id="3-3-mla-256-jdjmcb">3.3 MLA-256: 降低解码成本</h3>
<p>MLA 的另一个问题是解码阶段的高计算成本(576 维点积 vs GQA 的 128 维).GLM-5 将头维度从 192 增加到 256,头数减少 1/3,保持训练计算不变的同时降低了解码 FLOPs.</p>
<hr>
<h2 id="4-yb-agentic-rl-jcsscx">4 异步 Agentic RL: 基础设施创新</h2>
<h3 id="4-1-tb-rl-dpj">4.1 同步 RL 的瓶颈</h3>
<p>在 agentic 任务中,rollout 长度差异极大:简单任务可能只需 10 步,复杂任务可能需要 1000+ 步.同步 RL 等待所有 rollout 完成后才进行梯度更新,导致大量 GPU 空闲时间.</p>
<h3 id="4-2-wqybjg">4.2 完全异步架构</h3>
<p>GLM-5 的异步 RL 将推理引擎和训练引擎物理分离:</p>
<pre><code>推理引擎(GPU Cluster A)          训练引擎(GPU Cluster B)
     |                                    |
  持续生成轨迹  --------------------&gt;  批量接收轨迹
     |                                    |
  权重定期同步  &lt;--------------------  梯度更新
</code></pre>
<p>关键设计:</p>
<ul>
<li><strong>TITO(Token-in-Token-out)</strong>: 直接传输 token IDs,避免文本往返的 tokenization 不一致</li>
<li><strong>Direct Double-sided Importance Sampling</strong>: 丢弃 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{\\text{old}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6864em;vertical-align:-0.2559em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span></span></span></span>,直接用 rollout 概率作为行为代理,简化 off-policy 修正</li>
<li><strong>DP-aware Routing</strong>: 通过一致性哈希将同一 rollout 的请求路由到固定 DP rank,最大化 KV Cache 复用</li>
</ul>
<h3 id="4-3-drw-rollout-orchestrator">4.3 多任务 Rollout Orchestrator</h3>
<p>中央编排器管理超过 1K 并发 rollouts,支持:</p>
<ul>
<li>动态任务采样比例调整</li>
<li>统一消息列表表示(隔离任务特定逻辑)</li>
<li>细粒度任务进度监控</li>
</ul>
<hr>
<h2 id="5-gcxpqzsp">5 国产芯片全栈适配</h2>
<h3 id="5-1-hhjdlhcl">5.1 混合精度量化策略</h3>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">精度</th>
<th align="left">原因</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Attention &amp; MLP</td>
<td align="left">W8A8 (INT8)</td>
<td align="left">平衡精度与速度</td>
</tr>
<tr>
<td align="left">MoE Experts</td>
<td align="left">W4A8 (INT4)</td>
<td align="left">最大内存节省</td>
</tr>
</tbody></table>
<p>采用 QuaRot 进行 outlier 抑制,Flex_AWQ_SSZ 进行缩放校准.</p>
<h3 id="5-2-dzrhnh">5.2 定制融合内核</h3>
<ul>
<li><strong>Lightning Indexer</strong>: 融合分数计算、ReLU、TopK 为单内核</li>
<li><strong>Sparse Flash Attention</strong>: 并行处理 TopK 选择和稀疏注意力</li>
<li><strong>MLAPO</strong>: 将 13 个小算子融合为「超级算子」</li>
</ul>
<h3 id="5-3-tlyqyh">5.3 推理引擎优化</h3>
<ul>
<li><strong>异步调度</strong>: 重叠 D2H 采样复制与下一步解码准备</li>
<li><strong>RadixCache + Prefix Cache</strong>: KV 前缀共享+系统内存扩展</li>
<li><strong>FlashComm</strong>: 拆分 AllReduce 以隐藏通信延迟</li>
<li><strong>MTP</strong>: 每步多 token 生成,提升 NPU 计算密度</li>
</ul>
<hr>
<h2 id="6-yqymxdjgdb">6 与前沿模型的架构对比</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">GLM-5</th>
<th align="left">DeepSeek-V3.2</th>
<th align="left">Kimi K2.5</th>
<th align="left">Claude Opus 4.5</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">744B</td>
<td align="left">约 320B</td>
<td align="left">约 1T</td>
<td align="left">未公开</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">40B</td>
<td align="left">37B</td>
<td align="left">32B</td>
<td align="left">未公开</td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">MLA + DSA</td>
<td align="left">MLA + NSA</td>
<td align="left">MLA</td>
<td align="left">未公开</td>
</tr>
<tr>
<td align="left">上下文</td>
<td align="left">200K</td>
<td align="left">128K</td>
<td align="left">262K</td>
<td align="left">200K</td>
</tr>
<tr>
<td align="left">专家数</td>
<td align="left">256</td>
<td align="left">256</td>
<td align="left">384</td>
<td align="left">未公开</td>
</tr>
<tr>
<td align="left">RL 框架</td>
<td align="left">slime(异步)</td>
<td align="left">同步 GRPO</td>
<td align="left">同步</td>
<td align="left">未公开</td>
</tr>
<tr>
<td align="left">芯片生态</td>
<td align="left">7 大国产+NVIDIA</td>
<td align="left">NVIDIA</td>
<td align="left">NVIDIA</td>
<td align="left">未公开</td>
</tr>
<tr>
<td align="left">开源协议</td>
<td align="left">MIT</td>
<td align="left">MIT</td>
<td align="left">Modified MIT</td>
<td align="left">专有</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-gjgssy">7 关键公式索引</h2>
<table>
<thead>
<tr>
<th align="center">编号</th>
<th align="left">公式</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="center">(1)</td>
<td align="left">IcePop 优化损失</td>
<td align="left">Reasoning RL 的核心目标函数,含 pop 算子和训练-推理不匹配比率</td>
</tr>
<tr>
<td align="center">(2)</td>
<td align="left">组级策略优化</td>
<td align="left">Agentic RL 的基础目标,仅优化模型生成 token</td>
</tr>
<tr>
<td align="center">(3)</td>
<td align="left">Token 级重要性采样</td>
<td align="left">异步 RL 的简化 off-policy 修正,丢弃历史策略追踪</td>
</tr>
<tr>
<td align="center">(4)</td>
<td align="left">校准函数</td>
<td align="left">双边裁剪机制,将信任区域限制在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>1</mn><mo>−</mo><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub><mo separator="true">,</mo><mn>1</mn><mo>+</mo><msub><mi>ϵ</mi><mi>h</mi></msub><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[1-\\epsilon_\\ell, 1+\\epsilon_h]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">]</span></span></span></span></td>
</tr>
<tr>
<td align="center">(5)</td>
<td align="left">Cross-stage Distillation 优势</td>
<td align="left">用教师模型概率与学生模型概率的比值作为优势</td>
</tr>
</tbody></table>
<hr>
<h2 id="8-zj">8 总结</h2>
<p>GLM-5 的架构设计体现了「效率优先」的哲学:不是单纯追求最大参数规模,而是在给定计算预算下最大化 agentic 能力.其四大支柱——DSA(降低注意力成本)、MLA+Muon Split(降低 KV Cache 成本)、异步 RL(提升训练效率)、国产芯片适配(降低部署成本)——共同构成了一个从训练到推理、从云端到端侧的完整效率优化体系.这种系统性方法使 GLM-5 在 744B 总参数的规模上实现了与千亿级模型相当的 agentic 性能,同时保持了对消费级硬件的友好性.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jgzl","text":"1 架构总览"},{"level":2,"id":"2-dsa-cecdxxdzylgm","text":"2 DSA: 从二次到线性的注意力革命"},{"level":3,"id":"2-1-wtbj","text":"2.1 问题背景"},{"level":3,"id":"2-2-dsa-dljdjz","text":"2.2 DSA 的两阶段机制"},{"level":3,"id":"2-3-cxyxlsp","text":"2.3 持续预训练适配"},{"level":2,"id":"3-mla-muon-split-ysyyhdph","text":"3 MLA + Muon Split: 压缩与优化的平衡"},{"level":3,"id":"3-1-mla-djbyl","text":"3.1 MLA 的基本原理"},{"level":3,"id":"3-2-muon-split-dgj","text":"3.2 Muon Split 的改进"},{"level":3,"id":"3-3-mla-256-jdjmcb","text":"3.3 MLA-256: 降低解码成本"},{"level":2,"id":"4-yb-agentic-rl-jcsscx","text":"4 异步 Agentic RL: 基础设施创新"},{"level":3,"id":"4-1-tb-rl-dpj","text":"4.1 同步 RL 的瓶颈"},{"level":3,"id":"4-2-wqybjg","text":"4.2 完全异步架构"},{"level":3,"id":"4-3-drw-rollout-orchestrator","text":"4.3 多任务 Rollout Orchestrator"},{"level":2,"id":"5-gcxpqzsp","text":"5 国产芯片全栈适配"},{"level":3,"id":"5-1-hhjdlhcl","text":"5.1 混合精度量化策略"},{"level":3,"id":"5-2-dzrhnh","text":"5.2 定制融合内核"},{"level":3,"id":"5-3-tlyqyh","text":"5.3 推理引擎优化"},{"level":2,"id":"6-yqymxdjgdb","text":"6 与前沿模型的架构对比"},{"level":2,"id":"7-gjgssy","text":"7 关键公式索引"},{"level":2,"id":"8-zj","text":"8 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/08-glm-5/05-glm-5-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/08-glm-5/05-glm-5-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5 核心架构剖析</h1>
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
