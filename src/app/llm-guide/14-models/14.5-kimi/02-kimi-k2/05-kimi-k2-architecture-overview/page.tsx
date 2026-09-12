"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi K2 核心架构与 Agentic 训练体系剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">返回 14.5-Kimi 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Kimi K2: Open Agentic Intelligence (arXiv:2507.20534v2)
发布日期: 2025.07 (v1), 2026.02 (v2)
发布机构: Moonshot AI, Kimi Team
开源协议: 模型权重开放下载 (MIT-style)</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsm-k2-xz-agentic-th-lx">1. 设计动机: 为什么 K2 选择「Agentic 特化」路线</h2>
<p>Kimi K2 的发布标志着 Moonshot AI 战略焦点的明确转向:从「通用大模型竞争」转向「Agentic Intelligence 领先者」. 这一选择并非偶然,而是对开源模型竞争格局的清醒判断:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>通用能力竞争</th>
<th>Agentic 特化</th>
</tr>
</thead>
<tbody><tr>
<td>代表模型</td>
<td>DeepSeek-V3, Qwen3, Llama 4</td>
<td>Kimi K2, Claude 4</td>
</tr>
<tr>
<td>竞争壁垒</td>
<td>参数量、训练数据量</td>
<td>工具使用生态、合成数据流水线、RL 框架</td>
</tr>
<tr>
<td>护城河深度</td>
<td>低(可被更大模型超越)</td>
<td>高(数据合成和 RL 基础设施难以复制)</td>
</tr>
<tr>
<td>商业化路径</td>
<td>API 按 token 计费</td>
<td>Agent 平台、企业自动化</td>
</tr>
</tbody></table>
<p>K2 的 1.04 万亿参数/320 亿激活参数规模在开源 MoE 中并非最大(DeepSeek-V3 为 671B/37B),但其在 SWE-bench Verified(65.8%)和 Tau2-Bench(66.1)上的开源 SOTA 表现,证明了「Agentic 特化」策略的有效性. Moonshot AI 的赌注是:在通用基准上追赶闭源模型的成本过高,但在 agentic 能力上建立开源领先是可行的——因为这一领域的技术栈(大规模工具合成、可验证奖励 RL、自批判对齐)尚未被少数巨头垄断.</p>
<p>这里需要停下来想一下. K2 的 Agentic 特化路线与 DeepSeek 的「推理特化」(R1)形成了有趣的对照. DeepSeek 通过纯 RL 激发模型的推理能力,证明了「少即是多」——无需大量 SFT,仅通过奖励信号即可涌现 CoT. K2 则走了另一条路:通过大规模合成数据 + 联合 RL 框架,将 agentic 能力「工程化」地注入模型. 两者并非竞争关系,而是互补:K2 擅长与外部世界交互(工具使用、代码执行),DeepSeek-R1 擅长内部推理(数学证明、逻辑推导). 未来最强的系统可能需要两者的融合.</p>
<hr>
<h2 id="2-muon-clip-yhqcmdjgcx">2. MuonClip: 优化器层面的架构创新</h2>
<h3 id="2-1-c-adam-d-muon-wsmxyxyhq">2.1 从 Adam 到 Muon: 为什么需要新优化器</h3>
<p>传统 LLM 预训练使用 AdamW 优化器,其更新规则为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>θ</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>θ</mi><mi>t</mi></msub><mo>−</mo><mi>η</mi><mrow><mo fence="true">(</mo><mfrac><msub><mover accent="true"><mi>m</mi><mo>^</mo></mover><mi>t</mi></msub><mrow><msqrt><msub><mover accent="true"><mi>v</mi><mo>^</mo></mover><mi>t</mi></msub></msqrt><mo>+</mo><mi>ϵ</mi></mrow></mfrac><mo>+</mo><mi>λ</mi><msub><mi>θ</mi><mi>t</mi></msub><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\theta_{t+1} = \\theta_t - \\eta \\left( \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon} + \\lambda \\theta_t \\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9028em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6944em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6944em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">m</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">λ</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>m</mi><mo>^</mo></mover><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">\\hat{m}_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6944em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">m</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>v</mi><mo>^</mo></mover><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">\\hat{v}_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6944em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 分别是一阶和二阶矩的偏差修正估计. AdamW 的优势在于自适应学习率,但其更新矩阵的有效秩较低——少数大奇异值主导,导致权重更新的「方向性」不足.</p>
<p>Muon 优化器(Keller Jordan, 2024)采用完全不同的思路:对每个权重矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>n</mi><mo>×</mo><mi>m</mi></mrow></msup></mrow><annotation encoding="application/x-tex">W \\in \\mathbb{R}^{n \\times m}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7713em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7713em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">m</span></span></span></span></span></span></span></span></span></span></span></span>,其更新来自对动量矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi></mrow><annotation encoding="application/x-tex">M</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span></span> 的正交化操作:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>O</mi><mo>=</mo><mtext>Newton-Schulz</mtext><mo stretchy="false">(</mo><mi>M</mi><mo stretchy="false">)</mo><mo>⋅</mo><msqrt><mrow><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>n</mi><mo separator="true">,</mo><mi>m</mi><mo stretchy="false">)</mo></mrow></msqrt><mo>⋅</mo><mn>0.2</mn></mrow><annotation encoding="application/x-tex">O = \\text{Newton-Schulz}(M) \\cdot \\sqrt{\\max(n,m)} \\cdot 0.2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Newton-Schulz</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.24em;vertical-align:-0.2561em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9839em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mop">max</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mclose">)</span></span></span><span style="top:-2.9439em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2561em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.2</span></span></span></span></span><p>Newton-Schulz 迭代将任意矩阵正交化为最近正交矩阵,使得更新矩阵的所有奇异值相等——有效秩满. 这意味着 Muon 的权重更新在各个方向上「均匀用力」,避免了 Adam 的「偏斜谱」问题.</p>
<h3 id="2-2-qk-clip-jj-muon-d-logit-bzwt">2.2 QK-Clip: 解决 Muon 的 logit 爆炸问题</h3>
<p>Muon 的满秩更新带来了一个副作用:注意力 logit 爆炸. 注意力分数计算为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>S</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mn>1</mn><msqrt><mi>d</mi></msqrt></mfrac><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>k</mi><mi>j</mi></msub><mo>=</mo><mfrac><mn>1</mn><msqrt><mi>d</mi></msqrt></mfrac><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><msub><mi>W</mi><mi>q</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>j</mi></msub><msub><mi>W</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">S_{ij} = \\frac{1}{\\sqrt{d}} q_i \\cdot k_j = \\frac{1}{\\sqrt{d}} (x_i W_q) \\cdot (x_j W_k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2514em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.1778em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">d</span></span></span><span style="top:-2.8922em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1078em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2514em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.1778em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">d</span></span></span><span style="top:-2.8922em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1078em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>由于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub><msubsup><mi>W</mi><mi>k</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">W_q W_k^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1352em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4169em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2831em;"><span></span></span></span></span></span></span></span></span></span> 的谱范数将奇异值平方化,Muon 扩大奇异值的趋势被复合放大,导致 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>max</mi><mo>⁡</mo></msub></mrow><annotation encoding="application/x-tex">S_{\\max}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 无界增长. 在中等规模实验中,Muon 训练的模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>max</mi><mo>⁡</mo></msub></mrow><annotation encoding="application/x-tex">S_{\\max}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 迅速超过 1000,引发训练不稳定.</p>
<p>QK-Clip 的核心思想极其简洁:每当某注意力头的最大 logit <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>S</mi><mi>max</mi><mo>⁡</mo><mi>h</mi></msubsup></mrow><annotation encoding="application/x-tex">S_{\\max}^h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0961em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span> 超过阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 时,对该头的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub></mrow><annotation encoding="application/x-tex">W_q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">W_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 进行重新缩放:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>W</mi><mi>h</mi><mi>q</mi></msubsup><mo>←</mo><msqrt><msub><mi>γ</mi><mi>h</mi></msub></msqrt><mtext> </mtext><msubsup><mi>W</mi><mi>h</mi><mi>q</mi></msubsup><mo separator="true">,</mo><mspace width="1em"/><msubsup><mi>W</mi><mi>h</mi><mi>k</mi></msubsup><mo>←</mo><msqrt><msub><mi>γ</mi><mi>h</mi></msub></msqrt><mtext> </mtext><msubsup><mi>W</mi><mi>h</mi><mi>k</mi></msubsup></mrow><annotation encoding="application/x-tex">W_h^q \\leftarrow \\sqrt{\\gamma_h} \\, W_h^q, \\quad W_h^k \\leftarrow \\sqrt{\\gamma_h} \\, W_h^k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0836em;vertical-align:-0.3013em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7823em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2004em;vertical-align:-0.3013em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.7119em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2881em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7823em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1872em;vertical-align:-0.2881em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.7119em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2881em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>γ</mi><mi>h</mi></msub><mo>=</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mn>1</mn><mo separator="true">,</mo><mi>τ</mi><mi mathvariant="normal">/</mi><msubsup><mi>S</mi><mi>max</mi><mo>⁡</mo><mi>h</mi></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\gamma_h = \\min(1, \\tau / S_{\\max}^h)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0991em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. 关键设计要点:</p>
<ol>
<li><strong>每头独立缩放</strong>: 仅裁剪超出阈值的头,避免过度正则化正常头</li>
<li><strong>零训练开销</strong>: 裁剪发生在优化步骤结束后,不改变前向/反向传播</li>
<li><strong>自停用</strong>: K2 训练中,初始 70,000 步约 12.7% 的头触发裁剪;之后所有头自然衰减到阈值以下,QK-Clip 完全失活</li>
</ol>
<p>这里值得停下来想一下. QK-Clip 的巧妙之处在于它是一个「更新后修正」而非「训练中干预」. 传统的梯度裁剪或学习率调整会改变优化轨迹,而 QK-Clip 仅在权重更新完成后做一次性重新缩放——类似于物理系统中的阻尼器,不改变运动方程,仅在速度过大时施加阻力. 这种「非侵入式」稳定化手段的哲学值得推广:当新优化器引入未知的不稳定性时,不应放弃其优势,而应设计针对性的、最小干预的修正机制.</p>
<h3 id="2-3-muon-clip-dsltx">2.3 MuonClip 的收敛特性</h3>
<p>消融实验证实,MuonClip 在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>30</mn></mrow><annotation encoding="application/x-tex">\\tau=30</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">30</span></span></span></span> 的激进设置下,损失曲线与原始 Muon 几乎重合,下游任务无统计显著退化. 对于 K2 的大规模训练(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>100</mn></mrow><annotation encoding="application/x-tex">\\tau=100</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">100</span></span></span></span>),整个 15.5T token 过程零损失尖峰——这是 AdamW 在大规模训练中难以实现的稳定性.</p>
<p>MuonClip 对开源社区的意义超越了 K2 本身:它为 Muon 优化器在超大规模模型上的应用扫清了障碍,可能推动更多团队从 AdamW 迁移到 Muon 家族.</p>
<hr>
<h2 id="3-moe-jg-xsdsfdldsj">3. MoE 架构: 稀疏度缩放定律的实践</h2>
<h3 id="3-1-jgcsdb">3.1 架构参数对比</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>DeepSeek-V3</th>
<th>Kimi K2</th>
<th>工程含义</th>
</tr>
</thead>
<tbody><tr>
<td>层数</td>
<td>61</td>
<td>61</td>
<td>相同深度</td>
</tr>
<tr>
<td>总参数</td>
<td>671B</td>
<td>1,043B</td>
<td>K2 大 54%</td>
</tr>
<tr>
<td>激活参数</td>
<td>37B</td>
<td>32.6B</td>
<td>K2 少 13%(更低推理成本)</td>
</tr>
<tr>
<td>专家总数</td>
<td>256</td>
<td>384</td>
<td>K2 稀疏度 48 vs 32</td>
</tr>
<tr>
<td>每 token 激活专家</td>
<td>8</td>
<td>8</td>
<td>相同</td>
</tr>
<tr>
<td>注意力头数</td>
<td>128</td>
<td>64</td>
<td>K2 减半</td>
</tr>
<tr>
<td>稠密层数</td>
<td>3</td>
<td>1</td>
<td>K2 更稀疏</td>
</tr>
</tbody></table>
<h3 id="3-2-xsdsfdl">3.2 稀疏度缩放定律</h3>
<p>K2 团队通过控制实验发现了一个反直觉的结论:在固定激活参数(即固定 FLOPs)的条件下,增加专家总数(提高稀疏度)一致地降低验证损失. 具体而言,稀疏度 48(384 专家/8 激活)相比稀疏度 8,在达到相同验证损失 1.5 时减少 FLOPs 1.69 倍.</p>
<p>这一发现直接挑战了「MoE 的收益递减」假设. 传统观点认为,超过一定稀疏度后,路由噪声和专家负载不均衡会抵消收益. K2 的实验表明,至少在稀疏度 48 范围内,收益仍然显著. 但代价是基础设施复杂性的急剧增加:更多的专家意味着更大的显存占用(需存储全部专家权重)、更复杂的 all-to-all 通信和更严格的负载均衡要求.</p>
<h3 id="3-3-zyltsjb-zl-xsdpltzy">3.3 注意力头数减半: 质量-效率的帕累托最优</h3>
<p>K2 的另一个大胆决策是将注意力头数从 DeepSeek-V3 的 128 减半到 64. 控制实验显示,加倍头数仅在验证损失上带来 0.5%-1.2% 的微小改进,但在 128K 上下文下推理 FLOPs 增加 83%.</p>
<p>这里的设计权衡非常清晰:<strong>在稀疏度 48 已经提供强劲性能的前提下,加倍注意力头数的边际收益不足以弥补推理成本</strong>. 从 agentic 场景的实际需求看,长上下文推理的效率往往比绝对质量更重要——agent 可能需要处理数万 token 的代码库、多轮对话历史或工具调用结果,推理延迟直接影响用户体验.</p>
<p>值得注意的是,头数减半与 MLA(Multi-head Latent Attention)的结合尤为关键. MLA 通过低秩压缩将 KV cache 从传统 MHA 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>⋅</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>⋅</mo><mi>L</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n_{heads} \\cdot d_{head} \\cdot L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mclose">)</span></span></span></span> 降低到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>d</mi><mi>c</mi></msub><mo>⋅</mo><mi>L</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(d_{c} \\cdot L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>c</mi></msub><mo>≪</mo><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>⋅</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_c \\ll n_{heads} \\cdot d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.5945em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>. 在 64 头配置下,MLA 的内存优势更加显著,使得 K2 在 128K 上下文下的推理仍保持高效.</p>
<hr>
<h2 id="4-xljcss-1t-csmxdgctz">4. 训练基础设施: 1T 参数模型的工程挑战</h2>
<h3 id="4-1-bhcl-wsmby-dual-pipe">4.1 并行策略: 为什么不用 DualPipe</h3>
<p>K2 采用 16 路流水线并行(PP)与虚拟阶段、16 路专家并行(EP)和 ZeRO-1 数据并行的组合. 一个关键决策是<strong>不使用 DeepSeek-V3 的 DualPipe</strong>:</p>
<table>
<thead>
<tr>
<th>方案</th>
<th>DualPipe</th>
<th>交错 1F1B (K2)</th>
</tr>
</thead>
<tbody><tr>
<td>参数内存</td>
<td>2×(参数+梯度)</td>
<td>1×(参数+梯度)</td>
</tr>
<tr>
<td>气泡</td>
<td>更低</td>
<td>更高(被权重梯度延迟抵消)</td>
</tr>
<tr>
<td>适用规模</td>
<td>&lt;500B 参数</td>
<td>&gt;1T 参数</td>
</tr>
</tbody></table>
<p>对于 1T+ 参数的模型,DualPipe 的内存开销(参数和梯度各加倍)过于昂贵. K2 选择交错 1F1B + EP=16 的组合:1F1B 的额外气泡被权重梯度计算的延迟所抵消,而 EP=16 是满足「计算-通信完全重叠」条件的最小规模.</p>
<p>更小的 EP 组还有一个意外好处:<strong>放松了专家负载均衡约束</strong>. 在 MoE 训练中,如果某些专家被过度使用,需要容量因子来容纳溢出 token,这会浪费计算. EP=16 使得 token 在更小的组内分布更均匀,接近理想的负载均衡,无需复杂的辅助损失调参.</p>
<h3 id="4-2-jhsj-sccl">4.2 激活缩减: 三层策略</h3>
<p>在 1T 参数模型中,激活内存是主要瓶颈. K2 采用三层缩减策略:</p>
<ol>
<li><strong>选择性重计算</strong>: LayerNorm、SwiGLU、MLA 上投影、MoE 下投影被重计算</li>
<li><strong>FP8 存储不敏感激活</strong>: MoE 上投影和 SwiGLU 输入压缩为 FP8-E4M3(1×128 tile + FP32 缩放因子)</li>
<li><strong>激活 CPU 卸载</strong>: 所有剩余激活卸载到 CPU RAM,拷贝引擎负责流式传输</li>
</ol>
<p>三层策略的协同使得每个 GPU 仅需约 30GB 内存用于模型状态,剩余空间用于激活——这是 256 GPU 训练 1T 模型的关键.</p>
<h3 id="4-3-checkpoint-yq-30-mcsgxdgcqs">4.3 Checkpoint引擎: 30 秒参数更新的工程巧思</h3>
<p>K2 的 RL 训练采用混合同地架构(训练与推理引擎在同一组 worker 上). 每次 RL 迭代需要同步 1T 参数,传统 NFS 方案因带宽不足而不可行.</p>
<p>K2 的解决方案是「广播全量参数而非按需传输」:</p>
<ul>
<li>每个Checkpoint引擎 worker 从训练引擎获取参数的本地副本</li>
<li>在所有Checkpoint引擎 worker 之间广播完整参数集</li>
<li>推理引擎仅从Checkpoint引擎获取所需分片</li>
</ul>
<p>这一方案看似反直觉(多传输了数倍数据),但实践中更快:按需传输需要推理 worker 和训练 worker 之间复杂的协调(「我需要哪个分片?」「哪个 worker 有它?」),同步开销远超额外传输的带宽成本. 广播方案让每个推理 worker 独立获取所需分片,完全消除了跨 worker 协调. 系统可在不到 30 秒内完成 K2 的完整参数更新.</p>
<p>这里需要停下来想一下. Checkpoint引擎的设计体现了分布式系统中「以带宽换延迟」的经典哲学. 但更深层的是「一物多用」的设计智慧:Checkpoint引擎既用于 RL 参数同步,也用于故障恢复时的快速启动. 这种组件复用减少了系统组件数量,降低了维护复杂度. Moonshot AI 将该引擎开源,促进了研究的可重复性——这在业界并不常见,值得赞赏.</p>
<hr>
<h2 id="5-hxl-agentic-nldgchzr">5. 后训练: Agentic 能力的工程化注入</h2>
<h3 id="5-1-agentic-sjhc-20-000-hcgj-zssx">5.1 Agentic 数据合成: 20,000+ 合成工具 + 真实沙箱</h3>
<p>K2 的后训练核心是大规模 agentic 数据合成流水线,包含三个阶段:</p>
<ol>
<li><strong>工具规格生成</strong>: 从 3,000+ 真实 MCP 工具 + 20,000+ 合成工具构建仓库</li>
<li><strong>智能体与任务生成</strong>: 为每个工具集生成智能体配置和任务(配评分标准)</li>
<li><strong>轨迹生成</strong>: 通过用户模拟 + 工具执行环境 + 多轮交互生成轨迹</li>
</ol>
<p>合成工具的层次化生成策略尤为关键:从关键类别(金融交易、软件应用、机器人控制)开始,在每个类别中演化多个特定应用领域,确保工具空间的系统性覆盖. t-SNE 可视化证实,MCP 工具和合成工具覆盖了工具空间中互补的区域.</p>
<p>但仅有合成数据不够. K2 用<strong>真实执行沙箱</strong>补充模拟环境,用于编码和软件工程任务——真实编译器和测试套件提供不可替代的 ground truth. 这种「合成多样性 + 真实验证」的混合策略正在成为 agentic 数据合成的行业最佳实践.</p>
<p>这里值得停下来想一下. K2 的数据合成规模(20,000+ 工具)远超此前任何公开工作. 但规模本身不是目的——关键在于「结构化多样性」. 随机生成 20,000 个工具无意义;层次化领域演化确保了工具之间的结构差异,从简单计算器到复杂数据库查询. 这类似于自然语言预训练中「去重 + 质量筛选」的哲学:不是更多数据,而是更多「有意义的变化」.</p>
<h3 id="5-2-sz-rl-kj-kyzjl-zpppf">5.2 双重 RL 框架: 可验证奖励 + 自批判评分</h3>
<p>K2 的 RL 后训练采用双轨制:</p>
<p><strong>轨道一: 可验证奖励训练场(Verifiable Rewards Gym)</strong></p>
<p>覆盖数学、STEM、逻辑、复杂指令遵循、忠实性、编码、安全性等领域. 每个任务都有客观可验证的奖励信号:</p>
<ul>
<li>数学:答案正确性</li>
<li>编码:单元测试通过率</li>
<li>指令遵循:规则匹配度 + hack-check 层</li>
<li>忠实性:句子级事实核查模型</li>
</ul>
<p><strong>轨道二: 自批判评分奖励(Self-Critique Rubric Reward)</strong></p>
<p>对于创意写作、开放式问答等无客观正确答案的任务,K2 训练模型成为自己的评判者:</p>
<ul>
<li>K2 actor 生成回复</li>
<li>K2 critic 通过成对比较排序(核心评分标准 + 处方性评分标准 + 情境评分标准)</li>
<li>评判模型使用可验证任务的 on-policy rollout 持续更新,实现「客观→主观」的能力迁移</li>
</ul>
<p>两个轨道的闭环设计尤为精妙:可验证任务上获得的客观反馈,被用来持续更新评判标准,然后将这些更新的标准应用到主观任务上. 这实现了从「客观正确」到「主观偏好」的能力迁移.</p>
<p>但附录 F.3 也诚实地指出了风险:当前评分标准 favor「自信、果断」的回复,惩罚 hedging 和免责声明. 这意味着 RL 训练后的模型可能在不确定时仍表现得过于确定——在医疗建议、法律解释等高风险场景中可能产生危险误导.</p>
<h3 id="5-3-yskz-jj-rl-d-hfpz-wt">5.3 预算控制: 解决 RL 的「回复膨胀」问题</h3>
<p>RL 训练中模型输出长度失控是一个众所周知的难题. K2 的解决方案是根据任务类型设置每样本最大 token 预算,超限回复被截断并受罚.</p>
<p>这本质上是在 RL 目标中引入了一个「资源约束」:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>RL</mtext></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>x</mi><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mi>K</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></munderover><msup><mrow><mo fence="true">(</mo><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>−</mo><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>−</mo><mi>τ</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mtext>old</mtext></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">)</mo></mrow><mn>2</mn></msup><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{RL}}(\\theta) = \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ \\frac{1}{K} \\sum_{i=1}^{K} \\left( r(x, y_i) - \\bar{r}(x) - \\tau \\log \\frac{\\pi_\\theta(y_i|x)}{\\pi_{\\text{old}}(y_i|x)} \\right)^2 \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">RL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">[</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.654em;"><span style="top:-3.9029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">]</span></span></span></span></span></span></span><p>模型必须学会在有限预算内完成任务,鼓励生成简洁而有效的解决方案. 差异化预算(编码任务长、简单问答短)反映了对任务复杂度的先验知识,比一刀切的截断更合理.</p>
<hr>
<h2 id="6-xndw-agentic-thxmxdnlhx">6. 性能定位: Agentic 特化型模型的能力画像</h2>
<h3 id="6-1-hxlpg-qxyrx">6.1 后训练评估: 强项与弱项</h3>
<table>
<thead>
<tr>
<th>领域</th>
<th>基准</th>
<th>K2</th>
<th>最强开源对比</th>
<th>闭源对比</th>
</tr>
</thead>
<tbody><tr>
<td>软件工程</td>
<td>SWE-bench Verified</td>
<td><strong>65.8%</strong></td>
<td>DeepSeek-V3: 38.8%</td>
<td>Claude 4 Sonnet: 72.7%</td>
</tr>
<tr>
<td>Agentic 工具</td>
<td>Tau2-Bench</td>
<td><strong>66.1</strong></td>
<td>DeepSeek-V3: 48.8</td>
<td>Claude 4 Opus: 81.8</td>
</tr>
<tr>
<td>数学竞赛</td>
<td>AIME 2025</td>
<td><strong>49.5</strong></td>
<td>DeepSeek-V3: 46.7</td>
<td>Gemini 2.5 Flash: 46.6</td>
</tr>
<tr>
<td>指令遵循</td>
<td>IFEval</td>
<td><strong>89.8%</strong></td>
<td>DeepSeek-V3: 81.1%</td>
<td>GPT-4.1: 88.0%</td>
</tr>
<tr>
<td>事实性</td>
<td>FACTS Grounding</td>
<td><strong>88.5</strong></td>
<td>DeepSeek-V3: 68.3%</td>
<td>GPT-4.1: 79.2%</td>
</tr>
<tr>
<td>长上下文推理</td>
<td>LongBench v2</td>
<td>49.1%</td>
<td><strong>DeepSeek-V3: 51.1%</strong></td>
<td>Gemini 2.5 Flash: 55.5%</td>
</tr>
</tbody></table>
<p>K2 的能力画像清晰呈现:</p>
<ul>
<li><strong>绝对优势领域</strong>: Agentic 工具使用、软件工程、指令遵循、事实性</li>
<li><strong>相对弱项</strong>: 长上下文推理(LongBench v2 和 FRAMES 略低于 DeepSeek-V3)、极端难题(Humanity&#39;s Last Exam 4.7%)</li>
</ul>
<h3 id="6-2-yxlpg-zsmd-vs-tlsd">6.2 预训练评估: 知识密度 vs 推理深度</h3>
<p>K2-Base 在知识密集型任务(SimpleQA 35.25% vs DeepSeek-V3-Base 26.49%)和中文基准(C-Eval 92.50%)上大幅领先,但在 GPQA-Diamond(48.11% vs 50.51%)上略低于 DeepSeek-V3-Base. 这暗示 K2 的预训练在「知识覆盖」和「数据多样性」上投入更多,而 DeepSeek-V3 在「推理深度」上略有优势.</p>
<p>值得注意的是,尽管 K2 总参数(1.04T)远大于 DeepSeek-V3(671B),但激活参数更少(32B vs 37B). 这意味着在等 FLOPs 条件下,K2 通过更高的稀疏度(48 vs 32)获得了更好的性能——稀疏度缩放定律的实证验证.</p>
<h3 id="6-3-aqpg-nl-aqdbph">6.3 安全评估: 能力-安全的不平衡</h3>
<p>Promptfoo 红队测试揭示了 K2 的安全短板:</p>
<table>
<thead>
<tr>
<th>攻击策略</th>
<th>Security 通过率</th>
<th>与 Qwen3 对比</th>
</tr>
</thead>
<tbody><tr>
<td>Basic</td>
<td>77.84%</td>
<td>Qwen3: 90.09%</td>
</tr>
<tr>
<td>Iterative Jailbreak</td>
<td>43.90%</td>
<td>Qwen3: 78.04%</td>
</tr>
<tr>
<td>Crescendo</td>
<td>68.29%</td>
<td>Qwen3: 87.80%</td>
</tr>
</tbody></table>
<p>Security 类别的低通过率可能反映了 K2 在代码相关安全(如恶意代码生成)上的相对薄弱——考虑到 K2 的强大编程能力,这种「能力-安全」之间的不平衡值得警惕. 更强的代码生成能力意味着更强的恶意代码生成潜力,而 K2 的安全对齐似乎未完全跟上其能力增长.</p>
<hr>
<h2 id="7-jxyfx">7. 局限与风险</h2>
<p>K2 的作者在论文中明确承认了以下局限:</p>
<ol>
<li><p><strong>生成过量 token</strong>: 在困难推理任务或不清晰工具定义时,模型可能超出预算导致截断. 这是 RL 预算控制的边界案例.</p>
</li>
<li><p><strong>工具使用过度依赖</strong>: 在某些任务上不必要地启用工具使用会导致性能下降——直接回答能力被工具调用能力干扰.</p>
</li>
<li><p><strong>单次提示 vs Agentic 框架</strong>: K2 的 SOTA 性能在很大程度上依赖外部 agent 框架(迭代执行、错误纠正、工具编排),而非模型本身的单轮能力.</p>
</li>
<li><p><strong>自批判评分的隐性偏见</strong>: 评分标准 favor 自信回复,可能在需要认识论谦逊的场景中过度陈述确定性.</p>
</li>
</ol>
<p>这里需要停下来想一下. 第 3 点「单次提示不如 agentic 框架」是一个极为诚实的声明,也揭示了当前 LLM 评估的一个系统性问题:benchmark 数字往往反映「模型+框架」的组合能力,而非模型本身. 当用户在实际部署中不使用特定 agent 框架时,体验可能远低于 benchmark 所示. 这要求开发者在选择模型时,不仅要关注数字,更要理解数字背后的评估设置和依赖条件.</p>
<hr>
<h2 id="8-mxpxdw">8. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Kimi K1.5(Muon 优化器、RL 框架、长上下文技术)</li>
<li><strong>核心创新</strong>:<ul>
<li>MuonClip 优化器(Muon + QK-Clip),实现 1T 参数模型零损失尖峰训练</li>
<li>稀疏度缩放定律实证(稀疏度 48 的 384 专家 MoE)</li>
<li>注意力头数减半策略(64 头,128K 上下文 FLOPs 降低 83%)</li>
<li>大规模 agentic 数据合成(20,000+ 合成工具 + 3,000+ MCP + 真实沙箱)</li>
<li>双重 RL 框架(可验证奖励 + 自批判评分奖励 + 闭环评判者精炼)</li>
<li>Checkpoint引擎(开源,30 秒 1T 参数同步)</li>
</ul>
</li>
<li><strong>同期可比模型</strong>:<ul>
<li>DeepSeek-V3(MoE,参数量较小,推理深度略优)</li>
<li>Claude 4 Sonnet/Opus(闭源,SWE-bench 仍领先,安全对齐更强)</li>
<li>Qwen3-235B-A22B(MoE,通用能力均衡,agentic 能力较弱)</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>MuonClip 可能推动开源社区从 AdamW 向 Muon 迁移</li>
<li>Agentic 数据合成流水线的方法论可能影响后续工具学习研究</li>
<li>Checkpoint引擎的开源可能促进大规模 RL 训练基础设施的标准化</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档基于 Kimi K2 技术报告(arXiv:2507.20534v2)进行系统性架构剖析.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsm-k2-xz-agentic-th-lx","text":"1. 设计动机: 为什么 K2 选择「Agentic 特化」路线"},{"level":2,"id":"2-muon-clip-yhqcmdjgcx","text":"2. MuonClip: 优化器层面的架构创新"},{"level":3,"id":"2-1-c-adam-d-muon-wsmxyxyhq","text":"2.1 从 Adam 到 Muon: 为什么需要新优化器"},{"level":3,"id":"2-2-qk-clip-jj-muon-d-logit-bzwt","text":"2.2 QK-Clip: 解决 Muon 的 logit 爆炸问题"},{"level":3,"id":"2-3-muon-clip-dsltx","text":"2.3 MuonClip 的收敛特性"},{"level":2,"id":"3-moe-jg-xsdsfdldsj","text":"3. MoE 架构: 稀疏度缩放定律的实践"},{"level":3,"id":"3-1-jgcsdb","text":"3.1 架构参数对比"},{"level":3,"id":"3-2-xsdsfdl","text":"3.2 稀疏度缩放定律"},{"level":3,"id":"3-3-zyltsjb-zl-xsdpltzy","text":"3.3 注意力头数减半: 质量-效率的帕累托最优"},{"level":2,"id":"4-xljcss-1t-csmxdgctz","text":"4. 训练基础设施: 1T 参数模型的工程挑战"},{"level":3,"id":"4-1-bhcl-wsmby-dual-pipe","text":"4.1 并行策略: 为什么不用 DualPipe"},{"level":3,"id":"4-2-jhsj-sccl","text":"4.2 激活缩减: 三层策略"},{"level":3,"id":"4-3-checkpoint-yq-30-mcsgxdgcqs","text":"4.3 Checkpoint引擎: 30 秒参数更新的工程巧思"},{"level":2,"id":"5-hxl-agentic-nldgchzr","text":"5. 后训练: Agentic 能力的工程化注入"},{"level":3,"id":"5-1-agentic-sjhc-20-000-hcgj-zssx","text":"5.1 Agentic 数据合成: 20,000+ 合成工具 + 真实沙箱"},{"level":3,"id":"5-2-sz-rl-kj-kyzjl-zpppf","text":"5.2 双重 RL 框架: 可验证奖励 + 自批判评分"},{"level":3,"id":"5-3-yskz-jj-rl-d-hfpz-wt","text":"5.3 预算控制: 解决 RL 的「回复膨胀」问题"},{"level":2,"id":"6-xndw-agentic-thxmxdnlhx","text":"6. 性能定位: Agentic 特化型模型的能力画像"},{"level":3,"id":"6-1-hxlpg-qxyrx","text":"6.1 后训练评估: 强项与弱项"},{"level":3,"id":"6-2-yxlpg-zsmd-vs-tlsd","text":"6.2 预训练评估: 知识密度 vs 推理深度"},{"level":3,"id":"6-3-aqpg-nl-aqdbph","text":"6.3 安全评估: 能力-安全的不平衡"},{"level":2,"id":"7-jxyfx","text":"7. 局限与风险"},{"level":2,"id":"8-mxpxdw","text":"8. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/02-kimi-k2/05-kimi-k2-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/02-kimi-k2/05-kimi-k2-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi K2 核心架构与 Agentic 训练体系剖析</h1>
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
