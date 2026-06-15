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
<p>信息来源: GLM-5: from Vibe Coding to Agentic Engineering (arXiv:2602.15763)
发布日期: 2026-02-17
发布机构: Zhipu AI &amp; Tsinghua University, GLM-5 Team
开源协议: MIT</p>
</blockquote>
<hr>
<h2 id="1-sjdj-c-vibe-coding-d-agentic-engineering">1. 设计动机:从「Vibe Coding」到「Agentic Engineering」</h2>
<p>GLM-5 的核心定位是将「vibe coding」范式过渡到「agentic engineering」.「vibe coding」指人类通过提示让 AI 模型写代码;而「agentic engineering」指 AI agent 自主规划、实现和迭代代码.这一范式转变反映了 AI 能力边界的根本变化:从「辅助工具」到「自主执行者」.</p>
<p>GLM-5 的训练目标不再是最大化单轮回复质量,而是优化多步任务完成率和长期一致性.这要求模型具备规划、工具调用、错误纠正和上下文维护的综合能力,而非单纯的代码生成能力.在这一理念驱动下,GLM-5 采用 DSA(DeepSeek Sparse Attention)显著降低训练和推理成本,同时保持长上下文保真度;实现了一种新的异步强化学习基础设施,通过解耦生成与训练大幅提升后训练效率;并提出了新颖的异步 Agent RL 算法,使模型能够从复杂的长期交互中更有效地学习.</p>
<hr>
<h2 id="2-hxjg-744b-moe-ysdjszz">2. 核心架构:744B MoE 与四大技术支柱</h2>
<p>GLM-5 是一个 744B 总参数、40B 激活参数的 MoE 模型,采用 80 层 Transformer 架构(3 层稠密 + 75 层 MoE + 1 层 MTP).与 GLM-4.5(355B/32B)相比,参数规模翻倍,但核心创新不在于单纯的规模扩展.</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">GLM-4.5</th>
<th align="left">GLM-5</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">355B</td>
<td align="left">744B</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">32B</td>
<td align="left">40B</td>
</tr>
<tr>
<td align="left">稠密层数</td>
<td align="left">3</td>
<td align="left">3</td>
</tr>
<tr>
<td align="left">MoE 层数</td>
<td align="left">89</td>
<td align="left">75</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">5120</td>
<td align="left">6144</td>
</tr>
<tr>
<td align="left">QK 头维度</td>
<td align="left">128</td>
<td align="left">192</td>
</tr>
<tr>
<td align="left">V 头维度</td>
<td align="left">128</td>
<td align="left">256</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">96</td>
<td align="left">64</td>
</tr>
<tr>
<td align="left">专家总数</td>
<td align="left">160</td>
<td align="left">256</td>
</tr>
<tr>
<td align="left">路由专家数</td>
<td align="left">8</td>
<td align="left">8</td>
</tr>
<tr>
<td align="left">共享专家数</td>
<td align="left">1</td>
<td align="left">1</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: GLM-5 将专家数从 160 增加到 256,但层数从 92 减少到 80.这一权衡的核心是通信开销与计算效率的平衡.MoE 的 All-to-All 通信成本随专家数量增加而上升,但减少层数可以缩短每次前向传播的路径长度,从而降低整体延迟.此外,80 层配合 256 专家的配置使每层路由到约 3.2 个专家(256/80),保持了合理的专家利用率.</p>
</blockquote>
<h3 id="2-1-dsa-cecdxxdzylgm">2.1 DSA:从二次到线性的注意力革命</h3>
<p>标准 Transformer 的 self-attention 计算复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>L</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L^2 \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 为序列长度.当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mo>=</mo><mn>128</mn><mi>K</mi></mrow><annotation encoding="application/x-tex">L=128K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 时,注意力计算成为训练和推理的主要瓶颈.GLM-5 采用 DSA(DeepSeek Sparse Attention),通过一个「lightning indexer」和一个「token selector」的两阶段过程,将注意力计算从二次复杂度降低到接近线性.</p>
<p>Indexer 为每个查询 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">q_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 检索最相关的 top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个 key-value 条目:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><msub><mtext>TopK</mtext><mi>i</mi></msub><mrow><mo fence="true">(</mo><msub><mi>q</mi><mi>t</mi></msub><mo>⋅</mo><msubsup><mi>k</mi><mi>i</mi><mi>T</mi></msubsup><mo fence="true">)</mo></mrow><mo separator="true">,</mo><mspace width="1em"/><mi mathvariant="normal">∣</mi><msub><mi>S</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mo>=</mo><mi>k</mi></mrow><annotation encoding="application/x-tex">S_t = \\text{TopK}_i\\left( q_t \\cdot k_i^T \\right), \\quad |S_t| = k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2413em;vertical-align:-0.35em;"></span><span class="mord"><span class="mord text"><span class="mord">TopK</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span></span><p>在 GLM-5 中,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>2048</mn></mrow><annotation encoding="application/x-tex">k=2048</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2048</span></span></span></span>,远小于序列长度(128K 或 200K).注意力仅在检索到的子集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">S_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 上稀疏计算:</p>
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7654em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4247em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3754em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9334em;vertical-align:-0.2501em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span></span></span><p>DSA 特别有趣的一点在于它如何通过持续预训练从稠密基座模型引入.这避免了从头训练的「天文」成本.迁移遵循两阶段策略:(1) 仅训练 indexer 的 warmup 阶段(1000 步,batch size 16),同时冻结所有基座模型权重;(2) 模型和 indexer 联合训练的 joint-training 阶段(20B token).实验表明,仅 warmup 就保留了 90%+ 的长上下文性能;联合训练 150B token 后,性能几乎完全恢复.</p>
<blockquote>
<p><strong>译者注</strong>: DSA  warmup 的惊人效率意味着:对于已经部署的稠密模型,可以通过极低的成本(几天训练)为其增加 DSA 能力,而无需从头训练.这具有重要的工程意义——现有模型可以通过「插件式」升级获得长上下文效率提升.</p>
</blockquote>
<h3 id="2-2-mla-muon-split-ysyyhdph">2.2 MLA + Muon Split:压缩与优化的平衡</h3>
<p>Multi-latent Attention(MLA)将 key 和 value 压缩到低维潜在向量,减少 KV Cache 内存.标准 GQA-8 的 KV Cache 每 token 为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mn>2048</mn></mrow><annotation encoding="application/x-tex">2 \\times 2048</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2048</span></span></span></span> 维,而 MLA 仅为 576 维(压缩比 3.55x).</p>
<p>然而,在使用 Muon optimizer 的实验中,维度为 576 的 MLA 潜在 KV-cache 无法匹配 8 个查询组的 GQA(记为 GQA-8,2048 维 KV-cache)的性能.原因在于 Muon 的正交化操作对所有注意力头共享,限制了不同头的独立优化.</p>
<p>GLM-5 提出 Muon Split:将上投影矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>W</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msup><mo separator="true">,</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>K</mi></mrow></msup><mo separator="true">,</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>V</mi></mrow></msup></mrow><annotation encoding="application/x-tex">W^{UQ}, W^{UK}, W^{UV}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span></span></span></span> 按头拆分为独立子矩阵:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>W</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msup><mo>=</mo><mo stretchy="false">[</mo><msubsup><mi>W</mi><mn>1</mn><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mo separator="true">,</mo><msubsup><mi>W</mi><mn>2</mn><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msubsup><mi>W</mi><mi>h</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mo stretchy="false">]</mo><mo separator="true">,</mo><mspace width="1em"/><mtext>对每个 </mtext><msubsup><mi>W</mi><mi>i</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msubsup><mtext> 独立正交化</mtext></mrow><annotation encoding="application/x-tex">W^{UQ} = [W^{UQ}_1, W^{UQ}_2, \\dots, W^{UQ}_h], \\quad \\text{对每个 } W^{UQ}_i \\text{ 独立正交化}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8913em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2605em;vertical-align:-0.3013em;"></span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4337em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2663em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4337em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2663em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mclose">]</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord cjk_fallback">对每个</span><span class="mord"> </span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9592em;"><span style="top:-2.4231em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">独立正交化</span></span></span></span></span></span><p>这使不同头的投影权重可以以不同尺度更新.实验显示,MLA + Muon Split 在 7 个基准中的 4 个上超越了 GQA-8,验证了该方法的有效性.</p>
<p>MLA 的另一个缺点是解码阶段的高计算成本(576 维点积 vs GQA 的 128 维).GLM-5 将头维度从 192 增加到 256,头数减少 1/3,保持训练计算量不变的同时降低了解码 FLOPs.</p>
<h3 id="2-3-mtp-csgx-tljsdgg">2.3 MTP 参数共享:推理加速的杠杆</h3>
<p>Multi-token Prediction(MTP)提升了基座模型性能,并作为 speculative decoding 的 draft 模型.然而,在训练期间,为了预测接下来的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 个 token,需要 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 个 MTP 层,导致 MTP 参数和 KV cache 的内存使用量随推测步数线性增长.</p>
<p>GLM-5 提出在训练期间共享 3 个 MTP 层的参数.这保持了 draft 模型的内存成本与 DeepSeek-V3 一致(单 MTP 层),同时提高了接受率.实验显示,在相同的推测步数(4)下,GLM-5 的接受长度从 2.55 提升到 2.76(相对提升 8.2%).</p>
<h3 id="2-4-gcxpqzsp">2.4 国产芯片全栈适配</h3>
<p>GLM-5 从第一天起就全栈适配国产 GPU 生态,已成功完成从底层内核到上层推理框架的深度优化,跨越七个主流国产芯片平台:华为昇腾、摩尔线程、海光、寒武纪、昆仑芯、天数智芯和燧原.</p>
<table>
<thead>
<tr>
<th align="left">优化维度</th>
<th align="left">具体措施</th>
</tr>
</thead>
<tbody><tr>
<td align="left">混合精度量化</td>
<td align="left">W4A8 混合精度:Attention 和 MLP 使用 W8A8,MoE 专家压缩到 W4A8</td>
</tr>
<tr>
<td align="left">定制融合内核</td>
<td align="left">Lightning Indexer、Sparse Flash Attention、MLAPO(13 个小算子融合为「超级算子」)</td>
</tr>
<tr>
<td align="left">推理引擎优化</td>
<td align="left">异步调度(vLLM-Ascend)、RadixCache + Prefix Cache、FlashComm、MTP 支持</td>
</tr>
</tbody></table>
<p>通过这些硬件级协同优化,GLM-5 在单个国产节点上实现了与双 GPU 国际集群相当的性能,同时在长序列场景下将部署成本降低 50%.</p>
<blockquote>
<p><strong>译者注</strong>: GLM-5 的国产芯片全栈适配是中国 AI 基础设施自主化的一个重要里程碑.单节点性能达到双国际 GPU 集群水平、长序列成本降低 50% 的数据,表明国产芯片在大模型推理场景下的竞争力已显著提升.这对于受国际供应链限制的部署场景具有战略价值.</p>
</blockquote>
<hr>
<h2 id="3-gjcx-yb-agentic-rl-yxljcss">3. 关键创新:异步 Agentic RL 与训练基础设施</h2>
<h3 id="3-1-yb-rl-jg-joscyxl">3.1 异步 RL 架构:解耦生成与训练</h3>
<p>在 agentic 任务中,rollout 长度差异极大:简单任务可能只需 10 步,复杂任务可能需要 1000+ 步.同步 RL 等待所有 rollout 完成后才进行梯度更新,导致大量 GPU 空闲时间.GLM-5 的异步 RL 将推理引擎和训练引擎物理分离:</p>
<p>推理引擎持续生成轨迹,一旦生成的轨迹数量达到预定义阈值,batch 就被发送到训练引擎以更新模型.为减少策略滞后并保持训练近似 on-policy,rollout 引擎使用的模型权重定期与训练引擎的权重同步.</p>
<p>关键设计包括:</p>
<ul>
<li><strong>TITO(Token-in-Token-out)</strong>: 直接传输 token IDs,避免文本往返的 tokenization 不一致</li>
<li><strong>Direct Double-sided Importance Sampling</strong>: 丢弃 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{\\text{old}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6864em;vertical-align:-0.2559em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span></span></span></span>,直接用 rollout 概率作为行为代理,简化 off-policy 修正</li>
<li><strong>DP-aware Routing</strong>: 通过一致性哈希将同一 rollout 的请求路由到固定 DP rank,最大化 KV Cache 复用</li>
</ul>
<blockquote>
<p><strong>译者注</strong>: TITO 对异步 RL 至关重要.如果采用 Text-in-Text-out,推理引擎生成文本,通过网络传输到训练引擎,训练引擎再 token 化.这个过程中:不同引擎可能使用不同版本的 tokenizer;文本解码-再编码可能改变特殊 token 的位置;截断策略可能不一致.GLM-5 的 TITO 直接传输 token IDs,完全消除了这些不匹配.</p>
</blockquote>
<h3 id="3-2-slime-kj-rl-jcssdycyxsj">3.2 slime 框架:RL 基础设施的延迟优先设计</h3>
<p>slime 是 GLM-5 的统一后训练基础设施,其设计体现了三个核心原则:</p>
<ol>
<li><strong>解耦</strong>: 推理引擎和训练引擎物理分离,通过 HTTP API 通信,使两者可以独立扩展和优化</li>
<li><strong>延迟优先</strong>: 不以吞吐量为唯一优化目标,而是关注尾延迟——因为 RL 的同步瓶颈由最慢样本决定</li>
<li><strong>容错</strong>: 将故障视为常态而非异常,通过心跳监控和自动故障转移保持训练连续性</li>
</ol>
<p>特别值得注意的是 PD 解聚(Prefill-Decode Disaggregation).在多轮 agentic RL 中,预填充(处理长上下文历史)和解码(生成回复)的混合会严重干扰彼此.GLM-5 将两者分配到专用资源,类似于现代推理服务中的 PD 分离架构.这种设计对于 agentic RL 至关重要,因为 agent 的上下文长度随轮次累积,预填充成本呈线性增长.</p>
<h3 id="3-3-on-policy-cross-stage-distillation-fzznxyw">3.3 On-Policy Cross-Stage Distillation:防止灾难性遗忘</h3>
<p>在多阶段 RL 流水线中,顺序优化不同目标可能导致先前获得的能力累积退化.GLM-5 在最终阶段执行 on-policy cross-stage distillation,采用 on-policy distillation 算法迅速恢复早期 SFT 和 RL 阶段获得的技能.</p>
<p>优势项定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>=</mo><mtext>sg</mtext><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>teacher</mtext></msub><mtext>infer</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msubsup><mi>π</mi><mi>θ</mi><mtext>train</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\hat{A}_{i,t} = \\text{sg}\\left[\\log\\frac{\\pi_{\\theta_{\\text{teacher}}}^{\\text{infer}}(y_{i,t}\\mid x,y_{i,&lt;t})}{\\pi_\\theta^{\\text{train}}(y_{i,t}\\mid x,y_{i,&lt;t})}\\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2329em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">sg</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6281em;"><span style="top:-2.2977em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8123em;"><span style="top:-2.3987em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.779em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4169em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">teacher</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">infer</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.389em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.0036em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">]</span></span></span></span></span></span></span><p>这衡量的是教师模型对学生模型输出概率的「惊讶程度」——如果教师对学生输出的概率远高于学生自己,说明学生在这个 token 上「不自信」,需要加强学习.组大小为 1 的设计意味着不再需要 group-based advantage 估计,简化了训练并提升了吞吐量.</p>
<hr>
<h2 id="4-hxdb-xsyxdjgzx">4. 横向对比:效率优先的架构哲学</h2>
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
<td align="left">~320B</td>
<td align="left">~1T</td>
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
<td align="left">256K</td>
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
<td align="left">7 大国产 + NVIDIA</td>
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
<p>GLM-5 在开源模型中实现了编码基准的 SOTA 性能.SWE-bench Verified 77.8% 优于 Gemini 3 Pro(76.2%),SWE-bench Multilingual 73.3% 击败了 Gemini 3 Pro 和 GPT-5.2(xhigh).在 Terminal-Bench 2.0 上,GLM-5 取得了与 Claude Opus 4.5 相当的结果.在 BrowseComp 上,62.0%(无 CM)和 75.9%(有 CM)均为 SOTA.</p>
<p>但在纯推理基准(AIME 2026、GPQA-Diamond)上,GLM-5 仍略低于 GPT-5.2(xhigh)和 Gemini 3 Pro,表明其优化重点偏向 agentic 和编码能力而非纯知识推理.</p>
<hr>
<h2 id="5-jxx">5. 局限性</h2>
<p><strong>端到端任务完成率.</strong> 在前端开发中,GLM-5 的 ISR(Instance Success Rate)仍显著低于 Claude Opus 4.5(如 React ISR 34.6% vs 39.7%),表明在完整实现复杂需求方面仍有差距.</p>
<p><strong>链式任务误差累积.</strong> 在多步链式任务中,GLM-5(52.3%)与 Claude Opus 4.5(61.6%)存在显著差距,误差在链中累积的问题尚未解决.</p>
<p><strong>SWE-rebench 泛化.</strong> 在持续更新的 SWE-rebench 上,GLM-5 的排名(42.1%,第 6 名)低于静态 SWE-bench Verified(77.8%),提示可能存在一定程度的静态基准过拟合.</p>
<p><strong>纯推理基准.</strong> 在 AIME 2026、GPQA-Diamond 等纯推理基准上,GLM-5 仍略低于 GPT-5.2(xhigh)和 Gemini 3 Pro.</p>
<p><strong>信息来源与可复现性.</strong> GLM-5 的技术报告(arXiv:2602.15763)是一份完整的学术论文,数据和方法论披露相对充分.但部分工程细节(如 slime 框架的具体实现、异步 RL 的权重同步频率)未完全公开,限制了社区的精确复现.</p>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: GLM-5: from Vibe Coding to Agentic Engineering, arXiv:2602.15763</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.6-glm/08-glm-5/01-glm-5-jsbgjy">01-GLM-5技术报告精译</a></li>
<li>架构总览: <a href="/llm-guide/14-models/14.6-glm/08-glm-5/05-glm-5-architecture-overview">05-GLM-5-Architecture-Overview</a></li>
<li>后续模型: GLM-5.1 技术博客(见 09-GLM-5.1 目录)</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-c-vibe-coding-d-agentic-engineering","text":"1. 设计动机:从「Vibe Coding」到「Agentic Engineering」"},{"level":2,"id":"2-hxjg-744b-moe-ysdjszz","text":"2. 核心架构:744B MoE 与四大技术支柱"},{"level":3,"id":"2-1-dsa-cecdxxdzylgm","text":"2.1 DSA:从二次到线性的注意力革命"},{"level":3,"id":"2-2-mla-muon-split-ysyyhdph","text":"2.2 MLA + Muon Split:压缩与优化的平衡"},{"level":3,"id":"2-3-mtp-csgx-tljsdgg","text":"2.3 MTP 参数共享:推理加速的杠杆"},{"level":3,"id":"2-4-gcxpqzsp","text":"2.4 国产芯片全栈适配"},{"level":2,"id":"3-gjcx-yb-agentic-rl-yxljcss","text":"3. 关键创新:异步 Agentic RL 与训练基础设施"},{"level":3,"id":"3-1-yb-rl-jg-joscyxl","text":"3.1 异步 RL 架构:解耦生成与训练"},{"level":3,"id":"3-2-slime-kj-rl-jcssdycyxsj","text":"3.2 slime 框架:RL 基础设施的延迟优先设计"},{"level":3,"id":"3-3-on-policy-cross-stage-distillation-fzznxyw","text":"3.3 On-Policy Cross-Stage Distillation:防止灾难性遗忘"},{"level":2,"id":"4-hxdb-xsyxdjgzx","text":"4. 横向对比:效率优先的架构哲学"},{"level":2,"id":"5-jxx","text":"5. 局限性"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/08-glm-5/02-glm-5-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/08-glm-5/02-glm-5-hxjgpx" />
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
