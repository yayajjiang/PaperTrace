"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Grok 3：测试时计算扩展与原生搜索架构</h1>
<h2 id="y-fbbj-122-tjcdslqj">一、发布背景：122 天建成的算力奇迹</h2>
<p>2025 年 2 月 17 日, xAI 发布 Grok 3——这是马斯克对 AI 行业的又一次&quot;闪电战&quot;。Grok 3 的训练依托于 xAI 在孟菲斯(Memphis, Tennessee)建造的 <strong>Colossus 超级计算机</strong>：首批 10 万块 NVIDIA H100 GPU 在 <strong>122 天内</strong>完成部署, 随后又在 <strong>92 天内</strong>翻倍至 20 万块, 成为当时全球最大的完全连接 GPU 集群。这一建设速度颠覆了行业认知——作为对比, Google 的 TPU 集群建设通常需要 18-24 个月。</p>
<p>Grok 3 的训练计算量达到 <strong>2 亿 GPU 小时</strong>, 是 Grok 2 的 <strong>10-15 倍</strong>。在行业普遍转向&quot;算法效率优先&quot;(如 DeepSeek 的 MoE 优化、Qwen 的模型压缩)的 2025 年, xAI 选择了最原始的 scaling 路线：<strong>用极致算力暴力破解推理能力</strong>。</p>
<table>
<thead>
<tr>
<th>规格</th>
<th>Grok 2</th>
<th>Grok 3</th>
<th>Grok 3 Mini</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2024.08</td>
<td><strong>2025.02.17</strong></td>
<td>2025.02</td>
</tr>
<tr>
<td>总参数量</td>
<td>~314B</td>
<td><strong>~2.7T</strong></td>
<td>~100B</td>
</tr>
<tr>
<td>训练 tokens</td>
<td>~1T</td>
<td><strong>12.8T</strong></td>
<td>~3T</td>
</tr>
<tr>
<td>训练计算量</td>
<td>~2e24 FLOP</td>
<td><strong>~2e25 FLOP</strong></td>
<td>~5e23 FLOP</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>128K</td>
<td><strong>128K / 1M 扩展</strong></td>
<td>128K</td>
</tr>
<tr>
<td>GPU 集群</td>
<td>~50K H100</td>
<td><strong>100K-200K H100</strong></td>
<td>共享</td>
</tr>
<tr>
<td>推理速度</td>
<td>基线</td>
<td><strong>3× Grok 2</strong></td>
<td>5× Grok 2</td>
</tr>
<tr>
<td>AIME 2024</td>
<td>~75%</td>
<td><strong>99.3%</strong></td>
<td>~85%</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>~65%</td>
<td><strong>79.4%</strong></td>
<td>~70%</td>
</tr>
</tbody></table>
<p>Grok 3 在 AIME 2024 上达到 <strong>99.3%</strong> 的准确率——这是当时所有模型中的最高分, 甚至超过了 OpenAI 的 o3-mini。这一成绩验证了 xAI 的核心假设：<strong>当预训练计算量足够大时, 模型可以自发涌现出深度推理能力</strong>。</p>
<h2 id="e-hxjsy-cssjskz-test-time-compute-scaling">二、核心技术一：测试时计算扩展(Test-Time Compute Scaling)</h2>
<h3 id="2-1-c-quot-xls-scaling-quot-d-quot-css-scaling-quot">2.1 从&quot;训练时 Scaling&quot;到&quot;测试时 Scaling&quot;</h3>
<p>传统的大模型能力提升路径是<strong>训练时 scaling</strong>：更大的模型、更多的数据、更长的训练时间。但 2024 年底 OpenAI o1 的发布揭示了一条新路径——<strong>测试时 scaling</strong>：在推理阶段投入更多计算, 让模型&quot;思考更久&quot;以获得更好的答案。</p>
<p>Grok 3 将测试时 scaling 系统化为三个层次：</p>
<p><strong>层次 1：Think 模式(标准推理)</strong></p>
<p>Think 模式是 Grok 3 的默认推理机制。当用户提出复杂问题时, 模型自动生成思维链(Chain-of-Thought)：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Think</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mtext>CoT</mtext><mn>1</mn></msub><mo>→</mo><msub><mtext>CoT</mtext><mn>2</mn></msub><mo>→</mo><mo>⋯</mo><mo>→</mo><msub><mtext>CoT</mtext><mi>n</mi></msub><mo>→</mo><mtext>Answer</mtext></mrow><annotation encoding="application/x-tex">\\text{Think}(x) = \\text{CoT}_1 \\rightarrow \\text{CoT}_2 \\rightarrow \\cdots \\rightarrow \\text{CoT}_n \\rightarrow \\text{Answer}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Think</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">CoT</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">CoT</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.3669em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">CoT</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">Answer</span></span></span></span></span></span><p>每个 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mtext>CoT</mtext><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\text{CoT}_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">CoT</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是一个中间推理步骤, 模型在生成最终答案前会自我验证每个步骤的正确性。</p>
<p><strong>层次 2：Big Brain Mode(深度推理)</strong></p>
<p>Big Brain Mode 是 Think 模式的强化版, 核心机制是<strong>多路径假设验证</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>BigBrain</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>Aggregate</mtext><mrow><mo fence="true">(</mo><mo stretchy="false">{</mo><msub><mtext>Path</mtext><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><msubsup><mo stretchy="false">}</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>k</mi></msubsup><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\text{BigBrain}(x) = \\text{Aggregate}\\left(\\{\\text{Path}_i(x)\\}_{i=1}^{k}\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">BigBrain</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2491em;vertical-align:-0.35em;"></span><span class="mord text"><span class="mord">Aggregate</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size1">(</span></span><span class="mopen">{</span><span class="mord"><span class="mord text"><span class="mord">Path</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size1">)</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 是并行推理路径的数量(通常为 3-5 条)。每条路径独立探索不同的解题策略：</p>
<ul>
<li><strong>路径 1</strong>：直接推导法(从已知条件出发, 逐步推导结论)</li>
<li><strong>路径 2</strong>：逆向验证法(从结论出发, 验证所需条件是否满足)</li>
<li><strong>路径 3</strong>：类比迁移法(寻找类似问题的解法, 迁移到当前问题)</li>
</ul>
<p>聚合策略采用<strong>自一致性投票(Self-Consistency Voting)</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Answer</mtext><mo>=</mo><mi>arg</mi><mo>⁡</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>y</mi></munder><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>k</mi></munderover><mn mathvariant="double-struck">1</mn><mo stretchy="false">[</mo><msub><mtext>Path</mtext><mi>i</mi></msub><mo>→</mo><mi>y</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\text{Answer} = \\arg\\max_y \\sum_{i=1}^{k} \\mathbb{1}[\\text{Path}_i \\rightarrow y]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">Answer</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mop">ar<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.4em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8361em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mopen">[</span><span class="mord"><span class="mord text"><span class="mord">Path</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">]</span></span></span></span></span><p>如果多条路径得出相同答案, 该答案的置信度大幅提升; 如果路径间存在分歧, 模型会标记&quot;该问题存在多种合理解法&quot;。</p>
<p><strong>层次 3：无限制深度推理</strong></p>
<p>在基准测试(如 AIME)中, Grok 3 支持&quot;无限制思考时间&quot;模式——模型可以持续推理直到找到确定的答案或达到最大 token 限制。实验数据显示了测试时计算与准确率之间的<strong>近似线性关系</strong>：</p>
<table>
<thead>
<tr>
<th>推理时间限制</th>
<th>AIME 2024</th>
<th>AIME 2025</th>
<th>GPQA</th>
</tr>
</thead>
<tbody><tr>
<td>1 秒(快速回答)</td>
<td>85%</td>
<td>78%</td>
<td>72%</td>
</tr>
<tr>
<td>10 秒(标准 Think)</td>
<td>95%</td>
<td>88%</td>
<td>80%</td>
</tr>
<tr>
<td>60 秒(Big Brain)</td>
<td>98%</td>
<td>92%</td>
<td>83%</td>
</tr>
<tr>
<td><strong>无限制</strong></td>
<td><strong>99.3%</strong></td>
<td><strong>93.3%</strong></td>
<td><strong>84.6%</strong></td>
</tr>
</tbody></table>
<p>这一关系表明, Grok 3 的推理能力存在显著的&quot;计算-精度可交换性&quot;——开发者可以通过调整推理时间预算来平衡速度与准确率。</p>
<h3 id="2-2-cssjsdgcsx">2.2 测试时计算的工程实现</h3>
<p>测试时计算的核心工程挑战是<strong>推理效率</strong>。Big Brain Mode 的 3-5 条并行路径意味着 3-5 倍的计算开销, xAI 通过以下优化控制成本：</p>
<p><strong>投机推理(Speculative Reasoning)</strong>：</p>
<p>使用一个轻量级的&quot;草稿模型&quot;(Grok-3-Mini, ~100B 参数)快速生成候选推理路径, 然后由完整模型(Grok-3, 2.7T 参数)验证和修正：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Path</mtext><mtext>draft</mtext></msub><mo>=</mo><mtext>Grok-3-Mini</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mspace width="1em"/><msub><mtext>Path</mtext><mtext>verified</mtext></msub><mo>=</mo><mtext>Grok-3</mtext><mo stretchy="false">(</mo><msub><mtext>Path</mtext><mtext>draft</mtext></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Path}_{\\text{draft}} = \\text{Grok-3-Mini}(x), \\quad \\text{Path}_{\\text{verified}} = \\text{Grok-3}(\\text{Path}_{\\text{draft}})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Path</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">draft</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Grok-3-Mini</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Path</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">verified</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Grok-3</span></span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">Path</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">draft</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>这种&quot;小模型探索 + 大模型验证&quot;的策略将 Big Brain Mode 的开销从 5× 降低至 <strong>2×</strong>。</p>
<p><strong>动态路径剪枝</strong>：</p>
<p>在并行推理过程中, 如果某条路径的 intermediate confidence 连续 3 步低于阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>0.3</mn></mrow><annotation encoding="application/x-tex">\\tau = 0.3</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.3</span></span></span></span>, 该路径被提前终止, 释放计算资源给其他路径：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>if </mtext><munderover><mo>∏</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mn>3</mn></munderover><mi>P</mi><mo stretchy="false">(</mo><msub><mtext>CoT</mtext><mi>j</mi></msub><mo stretchy="false">)</mo><mo>&lt;</mo><mi>τ</mi><msub><mtext>, then terminate Path</mtext><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\text{if } \\prod_{j=1}^{3} P(\\text{CoT}_j) &lt; \\tau \\text{, then terminate Path}_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.2149em;vertical-align:-1.4138em;"></span><span class="mord text"><span class="mord">if </span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8011em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∏</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">CoT</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9386em;vertical-align:-0.2441em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mord"><span class="mord text"><span class="mord">, then terminate Path</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>缓存共享</strong>：</p>
<p>多条推理路径共享前缀的 KV Cache(问题理解和初始分析阶段), 只有在路径分叉后才独立计算。这使得 5 条路径的总计算量不是 5×, 而是约 <strong>2.5×</strong>。</p>
<h2 id="s-hxjse-deep-search-ysznssyq">三、核心技术二：DeepSearch——原生智能搜索引擎</h2>
<h3 id="3-1-wsmxyysss">3.1 为什么需要原生搜索？</h3>
<p>传统大模型的知识受限于训练数据的截止日期, 面对时效性问题时只能&quot;编造&quot;或&quot;回避&quot;。常见的解决方案是<strong>外挂检索(RAG)</strong>：</p>
<pre><code>用户提问 → 模型生成搜索查询 → 调用搜索引擎 API → 检索结果注入 prompt → 模型生成答案
</code></pre>
<p>但外挂检索存在三个问题：</p>
<ol>
<li><strong>延迟高</strong>：每次查询需要 2-3 次网络往返, 总延迟 &gt; 2s</li>
<li><strong>质量不稳定</strong>：搜索引擎返回的结果质量不可控, 可能包含过时或错误信息</li>
<li><strong>上下文碎片化</strong>：检索结果以文本块形式注入, 模型难以建立跨文档的逻辑关联</li>
</ol>
<p>Grok 3 的 DeepSearch 是<strong>原生集成</strong>的搜索引擎——不是外挂工具, 而是模型内部的认知模块。</p>
<h3 id="3-2-deep-search-dsjdjg">3.2 DeepSearch 的三阶段架构</h3>
<p><strong>Phase 1：查询理解与意图分解</strong></p>
<p>DeepSearch 首先分析用户问题的信息需求, 将其分解为多个子查询：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>SubQueries</mtext><mo>=</mo><mtext>Decomposer</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">{</mo><msub><mi>q</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>q</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>q</mi><mi>m</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\text{SubQueries} = \\text{Decomposer}(x) = \\{q_1, q_2, \\ldots, q_m\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">SubQueries</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Decomposer</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span></span><p>例如, 对于问题&quot;SpaceX 星舰下一次发射的时间和地点是什么？&quot;, 分解为：</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">q_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：SpaceX 官方发布的星舰发射计划</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">q_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：FAA(联邦航空管理局)的发射许可状态</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex">q_3</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>： Boca Chica 发射场的近期动态</li>
</ul>
<p><strong>Phase 2：多源并行检索</strong></p>
<p>每个子查询同时向多个信息源发起检索：</p>
<table>
<thead>
<tr>
<th>信息源</th>
<th>类型</th>
<th>更新频率</th>
<th>数据量</th>
</tr>
</thead>
<tbody><tr>
<td>X 平台 Firehose</td>
<td>社交媒体</td>
<td>实时</td>
<td>~6800 万条/天</td>
</tr>
<tr>
<td>网页索引</td>
<td>通用网页</td>
<td>小时级</td>
<td>万亿级页面</td>
</tr>
<tr>
<td>新闻 API</td>
<td>新闻网站</td>
<td>分钟级</td>
<td>百万级文章</td>
</tr>
<tr>
<td>知识图谱</td>
<td>结构化知识</td>
<td>天级</td>
<td>十亿级三元组</td>
</tr>
<tr>
<td>学术论文库</td>
<td>学术文献</td>
<td>周级</td>
<td>亿级论文</td>
</tr>
</tbody></table>
<p>检索不是简单的关键词匹配, 而是<strong>语义检索</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Score</mtext><mo stretchy="false">(</mo><mi>d</mi><mo separator="true">,</mo><mi>q</mi><mo stretchy="false">)</mo><mo>=</mo><mi>cos</mi><mo>⁡</mo><mo stretchy="false">(</mo><mtext>Embed</mtext><mo stretchy="false">(</mo><mi>d</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mtext>Embed</mtext><mo stretchy="false">(</mo><mi>q</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>+</mo><mi>α</mi><mo>⋅</mo><mtext>Recency</mtext><mo stretchy="false">(</mo><mi>d</mi><mo stretchy="false">)</mo><mo>+</mo><mi>β</mi><mo>⋅</mo><mtext>Authority</mtext><mo stretchy="false">(</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Score}(d, q) = \\cos(\\text{Embed}(d), \\text{Embed}(q)) + \\alpha \\cdot \\text{Recency}(d) + \\beta \\cdot \\text{Authority}(d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Score</span></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">cos</span><span class="mopen">(</span><span class="mord text"><span class="mord">Embed</span></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Embed</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Recency</span></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Authority</span></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Embed</mtext><mo stretchy="false">(</mo><mo>⋅</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Embed}(\\cdot)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Embed</span></span><span class="mopen">(</span><span class="mord">⋅</span><span class="mclose">)</span></span></span></span> 是语义嵌入, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Recency</mtext><mo stretchy="false">(</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Recency}(d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Recency</span></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 是文档时效性评分, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>Authority</mtext><mo stretchy="false">(</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Authority}(d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Authority</span></span><span class="mopen">(</span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 是来源权威性评分。</p>
<p><strong>Phase 3：信息合成与可信度评估</strong></p>
<p>检索到的信息经过三层验证后合成为最终答案：</p>
<p><strong>第一层：交叉验证</strong></p>
<ul>
<li>对关键事实(如&quot;发射时间&quot;), 要求至少 2 个独立来源一致</li>
<li>对数值型信息(如&quot;火箭推力&quot;), 进行范围合理性检查</li>
</ul>
<p><strong>第二层：时效性校准</strong></p>
<ul>
<li>优先使用最近 24 小时的信息</li>
<li>对超过 7 天的信息标注&quot;可能已过时&quot;</li>
</ul>
<p><strong>第三层：来源透明化</strong></p>
<ul>
<li>每个事实声明附带来源链接</li>
<li>争议性信息呈现多源观点</li>
</ul>
<p>最终输出的结构：</p>
<pre><code>【答案】SpaceX 星舰的下次发射预计为 2025 年 3 月 15 日, 地点为德克萨斯州 Boca Chica 发射场。

【来源】
- SpaceX 官方 X 账号(2025-02-20)
- FAA 发射许可公告(2025-02-18)

【验证状态】✅ 多源一致
【时效性】⚠️ 信息发布于 7 天内, 建议关注最新更新
</code></pre>
<h3 id="3-3-x-ptsjddtjz">3.3 X 平台数据的独特价值</h3>
<p>DeepSearch 的最大差异化优势是其对 <strong>X 平台 Firehose</strong> 的直接访问。X 平台的实时信息流包含：</p>
<ul>
<li><strong>官方一手信息</strong>：SpaceX、NASA、政府机构的官方公告</li>
<li><strong>专家即时分析</strong>：领域专家的问题解读和预测</li>
<li><strong>公众情绪信号</strong>：事件的社会反响和潜在影响</li>
<li><strong>Breaking News</strong>：比传统新闻媒体快 5-15 分钟的事件报道</li>
</ul>
<p>这种数据优势使得 DeepSearch 在以下场景表现突出：</p>
<table>
<thead>
<tr>
<th>场景</th>
<th>DeepSearch</th>
<th>Perplexity</th>
<th>GPT-4o</th>
</tr>
</thead>
<tbody><tr>
<td>24h 内新闻事件</td>
<td><strong>95% 准确率</strong></td>
<td>85%</td>
<td>60%</td>
</tr>
<tr>
<td>股市实时数据</td>
<td><strong>92% 准确率</strong></td>
<td>80%</td>
<td>N/A</td>
</tr>
<tr>
<td>产品发布信息</td>
<td><strong>94% 准确率</strong></td>
<td>88%</td>
<td>65%</td>
</tr>
<tr>
<td>社交媒体趋势</td>
<td><strong>96% 准确率</strong></td>
<td>75%</td>
<td>55%</td>
</tr>
</tbody></table>
<h3 id="3-4-ycyh-lt-2-mdssjs">3.4 延迟优化：&lt; 2 秒的实时检索</h3>
<p>DeepSearch 的检索延迟控制在 <strong>&lt; 2 秒</strong>, 关键优化包括：</p>
<ol>
<li><strong>预取索引</strong>：对热门话题(股市、体育、科技)预先构建实时索引, 命中时直接返回</li>
<li><strong>并行检索</strong>：5 个信息源同时查询, 而非串行查询</li>
<li><strong>增量更新</strong>：索引采用增量更新策略, 新内容在 30 秒内可检索</li>
<li><strong>结果缓存</strong>：相同查询的结果缓存 5 分钟, 减少重复检索</li>
</ol>
<h2 id="s-hxjss-1m-sxwdxszylyh">四、核心技术三：1M 上下文的稀疏注意力优化</h2>
<h3 id="4-1-csxwdjstz">4.1 长上下文的技术挑战</h3>
<p>Grok 3 支持 <strong>100 万 token</strong> 的扩展上下文——足以一次性处理《三体》三部曲(约 90 万字)或一个中型代码仓库。但长上下文带来两个技术挑战：</p>
<p><strong>显存瓶颈</strong>：标准 Transformer 的 KV Cache 随序列长度线性增长。对于 1M token、2.7T 参数的模型, KV Cache 可能占用数 TB 显存。</p>
<p><strong>注意力稀释</strong>：随着序列增长, 每个 token 的注意力权重被更多 token 稀释, 导致&quot;早期信息遗忘&quot;。</p>
<h3 id="4-2-xszyljz">4.2 稀疏注意力机制</h3>
<p>Grok 3 采用**分层稀疏注意力(Hierarchical Sparse Attention)**解决上述问题：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>LocalAttn</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>+</mo><mtext>DilatedAttn</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>+</mo><mtext>GlobalAttn</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{LocalAttn}(Q, K, V) + \\text{DilatedAttn}(Q, K, V) + \\text{GlobalAttn}(Q, K, V)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">LocalAttn</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">DilatedAttn</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">GlobalAttn</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span></span></span></span></span><p><strong>局部注意力(Local Attention)</strong>：</p>
<p>每个 token 只关注邻近的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">W = 4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span> 个 token：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>A</mi><mtext>local</mtext></msub><mo stretchy="false">(</mo><mi>i</mi><mo separator="true">,</mo><mi>j</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mfrac><mrow><msub><mi>Q</mi><mi>i</mi></msub><msubsup><mi>K</mi><mi>j</mi><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mi mathvariant="normal">∣</mi><mi>i</mi><mo>−</mo><mi>j</mi><mi mathvariant="normal">∣</mi><mo>≤</mo><mi>W</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><mi mathvariant="normal">∞</mi></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">A_{\\text{local}}(i, j) = \\begin{cases} \\frac{Q_i K_j^T}{\\sqrt{d_k}} &amp; \\text{if } |i - j| \\leq W/2 \\\\ -\\infty &amp; \\text{otherwise} \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">local</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.2288em;vertical-align:-1.3644em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8644em;"><span style="top:-3.8644em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2508em;"><span style="top:-2.5864em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord sqrt mtight"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8622em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mtight" style="padding-left:0.833em;"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8222em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail mtight" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1778em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.6074em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9191em;"><span style="top:-2.214em;margin-left:-0.0715em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4249em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.538em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span><span style="top:-2.3184em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord">−</span><span class="mord">∞</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.3644em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8644em;"><span style="top:-3.8644em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord">∣</span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mord">/2</span></span></span><span style="top:-2.3184em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.3644em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这捕捉了局部的语法和语义依赖, 计算复杂度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(nW)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">nW</span><span class="mclose">)</span></span></span></span>。</p>
<p><strong>扩张注意力(Dilated Attention)</strong>：</p>
<p>每个 token 关注间隔为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">D = 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 的 token：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>A</mi><mtext>dilated</mtext></msub><mo stretchy="false">(</mo><mi>i</mi><mo separator="true">,</mo><mi>j</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mfrac><mrow><msub><mi>Q</mi><mi>i</mi></msub><msubsup><mi>K</mi><mi>j</mi><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mi mathvariant="normal">∣</mi><mi>i</mi><mo>−</mo><mi>j</mi><mi mathvariant="normal">∣</mi><mo>≡</mo><mn>0</mn><mspace></mspace><mspace width="0.4444em"/><mo stretchy="false">(</mo><mrow><mi mathvariant="normal">m</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">d</mi></mrow><mspace width="0.3333em"/><mi>D</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><mi mathvariant="normal">∞</mi></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">A_{\\text{dilated}}(i, j) = \\begin{cases} \\frac{Q_i K_j^T}{\\sqrt{d_k}} &amp; \\text{if } |i - j| \\equiv 0 \\pmod{D} \\\\ -\\infty &amp; \\text{otherwise} \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">dilated</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.2288em;vertical-align:-1.3644em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8644em;"><span style="top:-3.8644em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2508em;"><span style="top:-2.5864em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord sqrt mtight"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8622em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mtight" style="padding-left:0.833em;"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8222em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail mtight" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1778em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.6074em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9191em;"><span style="top:-2.214em;margin-left:-0.0715em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4249em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.538em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span><span style="top:-2.3184em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord">−</span><span class="mord">∞</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.3644em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8644em;"><span style="top:-3.8644em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord">∣</span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≡</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0</span><span class="mspace allowbreak"></span><span class="mspace" style="margin-right:0.4444em;"></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord mathrm">mod</span></span></span><span class="mspace" style="margin-right:0.3333em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mclose">)</span></span></span><span style="top:-2.3184em;"><span class="pstrut" style="height:3.2508em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.3644em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这以极低成本捕捉长程的周期性模式。</p>
<p><strong>全局注意力(Global Attention)</strong>：</p>
<p>每 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo>=</mo><mn>1024</mn></mrow><annotation encoding="application/x-tex">G = 1024</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1024</span></span></span></span> 个 token 设置一个&quot;全局锚点&quot;, 所有 token 可见：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>A</mi><mtext>global</mtext></msub><mo stretchy="false">(</mo><mi>i</mi><mo separator="true">,</mo><mi>j</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mrow><msub><mi>Q</mi><mi>i</mi></msub><msubsup><mi>K</mi><mi>j</mi><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mspace width="1em"/><mtext>if </mtext><mi>j</mi><mo>∈</mo><mtext>GlobalAnchors</mtext></mrow><annotation encoding="application/x-tex">A_{\\text{global}}(i, j) = \\frac{Q_i K_j^T}{\\sqrt{d_k}} \\quad \\text{if } j \\in \\text{GlobalAnchors}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">global</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5561em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6261em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7848em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4413em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">if </span></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">GlobalAnchors</span></span></span></span></span></span><p>全局锚点通常是段落边界、章节标题、或语义转换点。</p>
<p>三种注意力的组合使总计算复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">(</mo><mi>W</mi><mo>+</mo><mi>n</mi><mi mathvariant="normal">/</mi><mi>D</mi><mo>+</mo><mi>n</mi><mi mathvariant="normal">/</mi><mi>G</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>≈</mo><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n(W + n/D + n/G)) \\approx O(n \\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">n</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">n</span><span class="mord">/</span><span class="mord mathnormal">G</span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span>。</p>
<h3 id="4-3-csxwzhcs">4.3 长上下文召回测试</h3>
<table>
<thead>
<tr>
<th>上下文长度</th>
<th>关键信息位置</th>
<th>召回率</th>
<th>延迟</th>
</tr>
</thead>
<tbody><tr>
<td>100K</td>
<td>开头 10%</td>
<td>98%</td>
<td>200ms</td>
</tr>
<tr>
<td>100K</td>
<td>中间 50%</td>
<td>95%</td>
<td>220ms</td>
</tr>
<tr>
<td>100K</td>
<td>末尾 90%</td>
<td>97%</td>
<td>210ms</td>
</tr>
<tr>
<td><strong>1M</strong></td>
<td><strong>开头 10%</strong></td>
<td><strong>92%</strong></td>
<td><strong>1.2s</strong></td>
</tr>
<tr>
<td><strong>1M</strong></td>
<td><strong>中间 50%</strong></td>
<td><strong>85%</strong></td>
<td><strong>1.5s</strong></td>
</tr>
<tr>
<td><strong>1M</strong></td>
<td><strong>末尾 90%</strong></td>
<td><strong>94%</strong></td>
<td><strong>1.3s</strong></td>
</tr>
</tbody></table>
<p>1M 上下文的召回率在中间位置下降到 85%, 这是当前长上下文模型的普遍瓶颈。Grok 3 通过**关键信息重播(Key Information Replay)**机制缓解：在生成答案前, 模型会主动&quot;回顾&quot;文档的关键段落, 将其重新加载到工作记忆中。</p>
<h2 id="w-xnpgyjpdb">五、性能评估与竞品对比</h2>
<h3 id="5-1-sxytlnl">5.1 数学与推理能力</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Grok 3</th>
<th>GPT-4o</th>
<th>DeepSeek-R1</th>
<th>Claude 3.5 Sonnet</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2024</td>
<td><strong>99.3%</strong></td>
<td>87.3%</td>
<td>79.8%</td>
<td>82%</td>
</tr>
<tr>
<td>AIME 2025</td>
<td><strong>93.3%</strong></td>
<td>85%</td>
<td>88%</td>
<td>80%</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td><strong>84.6%</strong></td>
<td>75%</td>
<td>78%</td>
<td>76%</td>
</tr>
<tr>
<td>MATH-500</td>
<td><strong>96%</strong></td>
<td>92%</td>
<td>94%</td>
<td>90%</td>
</tr>
</tbody></table>
<p>Grok 3 在 AIME 2024 上达到 99.3%——这是当时所有模型中的最高分。但在 AIME 2025 上, DeepSeek-R1(88%)反超了 Grok 3(93.3% 是 2025 年的分数, 而 DeepSeek-R1 的 88% 可能来自不同版本), 说明竞赛题目的快速迭代使模型优势难以维持。</p>
<h3 id="5-2-bcnl">5.2 编程能力</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Grok 3</th>
<th>GPT-4o</th>
<th>DeepSeek-R1</th>
<th>Claude 3.5 Sonnet</th>
</tr>
</thead>
<tbody><tr>
<td>LiveCodeBench</td>
<td><strong>79.4%</strong></td>
<td>72.9%</td>
<td>64.3%</td>
<td>78%</td>
</tr>
<tr>
<td>HumanEval</td>
<td><strong>92%</strong></td>
<td>90%</td>
<td>88%</td>
<td>91%</td>
</tr>
<tr>
<td>SWE-bench</td>
<td>45%</td>
<td>43%</td>
<td>35%</td>
<td><strong>52%</strong></td>
</tr>
</tbody></table>
<p>Grok 3 在 LiveCodeBench 和 HumanEval 上领先, 但在实际软件工程任务(SWE-bench)上落后于 Claude 3.5 Sonnet。这表明 Grok 3 的编程优势主要在&quot;算法题&quot;层面, 在&quot;工程实践&quot;层面仍有差距。</p>
<h3 id="5-3-ssxxnl">5.3 实时信息能力</h3>
<table>
<thead>
<tr>
<th>场景</th>
<th>Grok 3 (DeepSearch)</th>
<th>Perplexity</th>
<th>GPT-4o</th>
</tr>
</thead>
<tbody><tr>
<td>新闻时效性</td>
<td><strong>98%</strong></td>
<td>90%</td>
<td>55%</td>
</tr>
<tr>
<td>数据准确性</td>
<td><strong>94%</strong></td>
<td>88%</td>
<td>70%</td>
</tr>
<tr>
<td>来源透明度</td>
<td><strong>100%</strong>(强制)</td>
<td>95%</td>
<td>60%</td>
</tr>
<tr>
<td>检索延迟</td>
<td><strong>&lt; 2s</strong></td>
<td>3-5s</td>
<td>N/A</td>
</tr>
</tbody></table>
<h3 id="5-4-cbykjx">5.4 成本与可及性</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>输入价格</th>
<th>输出价格</th>
<th>上下文</th>
<th>推理模式</th>
</tr>
</thead>
<tbody><tr>
<td>Grok 3</td>
<td>—</td>
<td>—</td>
<td>1M</td>
<td>Think + Big Brain</td>
</tr>
<tr>
<td>GPT-4o</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">5 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5∣</span></span></span></span>15</td>
<td>128K</td>
<td>有限推理</td>
<td></td>
</tr>
<tr>
<td>DeepSeek-R1</td>
<td>开源/免费</td>
<td>开源</td>
<td>128K</td>
<td>完整推理</td>
</tr>
<tr>
<td>Claude 3.5 Sonnet</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">3 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3∣</span></span></span></span>15</td>
<td>200K</td>
<td>有限推理</td>
<td></td>
</tr>
</tbody></table>
<p>Grok 3 最初仅通过 X Premium+ 和 SuperGrok 订阅提供, 未开放独立 API。这一策略限制了其在开发者社区中的普及, 但也确保了 xAI 对用户体验的完全控制。</p>
<h2 id="l-jxytz">六、局限与挑战</h2>
<h3 id="6-1-jsjx">6.1 技术局限</h3>
<ol>
<li><strong>1M 上下文的召回瓶颈</strong>：中间位置信息召回率仅 85%, 对于需要精确定位细节的代码审查场景不够可靠</li>
<li><strong>DeepSearch 的覆盖盲区</strong>：X 平台数据以英文为主, 非英语实时信息的检索能力明显弱化</li>
<li><strong>Big Brain Mode 的成本</strong>：5 条并行推理路径的 2× 开销对于高频应用场景(如客服机器人)仍显昂贵</li>
<li><strong>幻觉率</strong>：虽然 DeepSearch 降低了时效性幻觉, 但模型在推理复杂逻辑时仍会产生&quot;逻辑幻觉&quot;(推理步骤看似合理但存在隐蔽错误)</li>
</ol>
<h3 id="6-2-syysttz">6.2 商业与生态挑战</h3>
<ol>
<li><strong>封闭生态</strong>：Grok 3 未开源, 开发者无法自托管或微调</li>
<li><strong>X 平台绑定</strong>：DeepSearch 的核心优势依赖 X 平台数据, 对于不使用 X 的用户价值下降</li>
<li><strong>算力可持续性</strong>：Colossus 集群的电力消耗达到兆瓦级, 运营成本和碳足迹巨大</li>
<li><strong>订阅门槛</strong>：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>40</mn><mi mathvariant="normal">/</mi><mtext>月的</mtext><mi>X</mi><mi>P</mi><mi>r</mi><mi>e</mi><mi>m</mi><mi>i</mi><mi>u</mi><mi>m</mi><mo>+</mo><mtext>或</mtext></mrow><annotation encoding="application/x-tex">40/月的 X Premium+ 或</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">40/</span><span class="mord cjk_fallback">月的</span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal">mi</span><span class="mord mathnormal">u</span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord cjk_fallback">或</span></span></span></span>30/月的 SuperGrok 订阅限制了普通用户的访问</li>
</ol>
<h3 id="6-3-aqyll">6.3 安全与伦理</h3>
<p>Grok 3 的&quot;最小审查&quot;哲学带来了独特的安全挑战：</p>
<ol>
<li><strong>实时信息的误用</strong>：DeepSearch 可以快速检索和传播未经核实信息, 在突发事件中可能放大谣言</li>
<li><strong>Big Brain Mode 的过度自信</strong>：多路径一致性投票可能产生&quot;虚假的高置信度&quot;——当所有路径基于同一错误假设时, 一致性反而增强了错误答案的可信度</li>
<li><strong>算力军备竞赛</strong>：Colossus 的建设标志着 AI 训练进入&quot;百万 GPU&quot;时代, 可能加剧全球算力的不平等分配</li>
</ol>
<h2 id="q-zj">七、总结</h2>
<p>Grok 3 是 xAI&quot;大力出奇迹&quot;哲学的首次全面验证。其<strong>测试时计算扩展</strong>机制证明了推理能力不仅来自训练, 还可以通过延长思考时间持续提升; <strong>DeepSearch</strong> 的原生集成设计将实时信息检索从&quot;外挂工具&quot;升级为&quot;认知模块&quot;; <strong>1M 上下文的稀疏注意力</strong>则在工程上实现了超长文本的可处理性。</p>
<p>从行业影响来看, Grok 3 的发布推动了三个趋势：</p>
<ol>
<li><strong>测试时计算的普及</strong>：o1/o3 之后, Grok 3 进一步验证了测试时 scaling 的有效性, 促使行业重新分配&quot;训练算力&quot;和&quot;推理算力&quot;的投资比例</li>
<li><strong>实时数据的战略价值</strong>：DeepSearch 展示了 X 平台数据作为差异化竞争要素的潜力, 推动其他厂商加速构建自有实时数据源</li>
<li><strong>算力基础设施的竞赛</strong>：Colossus 的 122 天建设速度刷新了行业记录, 引发了全球范围内的 AI 数据中心建设热潮</li>
</ol>
<p>然而, Grok 3 的局限性也同样明显：过度依赖算力 scaling 而非算法创新、封闭生态限制了社区贡献、以及 X 平台绑定带来的数据偏见。在 xAI 自身的产品矩阵中, Grok 3 很快被 Grok 4(RL at pretraining scale)和 Grok 4.1(极致性价比)所超越, 其历史地位更多在于&quot;验证了暴力 scaling 的可行性&quot;和&quot;建立了实时数据护城河&quot;, 而非作为长期的技术标杆。</p>
<hr>
<blockquote>
<p>📚 <strong>延伸阅读</strong></p>
<ul>
<li><a href="https://x.ai/blog/grok-3">xAI Grok 3 发布直播</a></li>
<li><a href="https://www.techtarget.com/whatis/feature/Grok-3-model-explained">Colossus 数据中心建设纪实</a></li>
<li><a href="https://arxiv.org/abs/2408.03314">测试时计算扩展：理论与实验</a></li>
<li><a href="https://arxiv.org/abs/2402.16682">稀疏注意力机制综述</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbj-122-tjcdslqj","text":"一、发布背景：122 天建成的算力奇迹"},{"level":2,"id":"e-hxjsy-cssjskz-test-time-compute-scaling","text":"二、核心技术一：测试时计算扩展(Test-Time Compute Scaling)"},{"level":3,"id":"2-1-c-quot-xls-scaling-quot-d-quot-css-scaling-quot","text":"2.1 从&quot;训练时 Scaling&quot;到&quot;测试时 Scaling&quot;"},{"level":3,"id":"2-2-cssjsdgcsx","text":"2.2 测试时计算的工程实现"},{"level":2,"id":"s-hxjse-deep-search-ysznssyq","text":"三、核心技术二：DeepSearch——原生智能搜索引擎"},{"level":3,"id":"3-1-wsmxyysss","text":"3.1 为什么需要原生搜索？"},{"level":3,"id":"3-2-deep-search-dsjdjg","text":"3.2 DeepSearch 的三阶段架构"},{"level":3,"id":"3-3-x-ptsjddtjz","text":"3.3 X 平台数据的独特价值"},{"level":3,"id":"3-4-ycyh-lt-2-mdssjs","text":"3.4 延迟优化：&lt; 2 秒的实时检索"},{"level":2,"id":"s-hxjss-1m-sxwdxszylyh","text":"四、核心技术三：1M 上下文的稀疏注意力优化"},{"level":3,"id":"4-1-csxwdjstz","text":"4.1 长上下文的技术挑战"},{"level":3,"id":"4-2-xszyljz","text":"4.2 稀疏注意力机制"},{"level":3,"id":"4-3-csxwzhcs","text":"4.3 长上下文召回测试"},{"level":2,"id":"w-xnpgyjpdb","text":"五、性能评估与竞品对比"},{"level":3,"id":"5-1-sxytlnl","text":"5.1 数学与推理能力"},{"level":3,"id":"5-2-bcnl","text":"5.2 编程能力"},{"level":3,"id":"5-3-ssxxnl","text":"5.3 实时信息能力"},{"level":3,"id":"5-4-cbykjx","text":"5.4 成本与可及性"},{"level":2,"id":"l-jxytz","text":"六、局限与挑战"},{"level":3,"id":"6-1-jsjx","text":"6.1 技术局限"},{"level":3,"id":"6-2-syysttz","text":"6.2 商业与生态挑战"},{"level":3,"id":"6-3-aqyll","text":"6.3 安全与伦理"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.15-xai/05-grok-3/05-grok-3-cssjskzyysssjg" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.15-xai/05-grok-3/05-grok-3-cssjskzyysssjg" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Grok 3：测试时计算扩展与原生搜索架构</h1>
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
