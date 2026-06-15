"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Grok 4.1：统一权重双模式与长时界强化学习训练</h1>
<h2 id="y-fbbj-0-20-djbhdjsyx">一、发布背景：\$0.20 定价背后的技术野心</h2>
<p>2025 年 11 月 17 日, xAI 发布 Grok 4.1 Fast 系列——这不是一次常规的模型迭代, 而是一次<strong>定价革命</strong>。在 frontier 模型普遍定价 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>−</mo><mn>5</mn><mi mathvariant="normal">/</mi><mtext>百万输入</mtext><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mtext>的市场中</mtext><mo separator="true">,</mo><mi>G</mi><mi>r</mi><mi>o</mi><mi>k</mi><mn>4.1</mn><mi>F</mi><mi>a</mi><mi>s</mi><mi>t</mi><mtext>将价格压至</mtext><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">2-5/百万输入 token 的市场中, Grok 4.1 Fast 将价格压至 **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5/</span><span class="mord cjk_fallback">百万输入</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord cjk_fallback">的市场中</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">G</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord">4.1</span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mord mathnormal">a</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span><span class="mord cjk_fallback">将价格压至</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.20/百万输入 token**、**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.50</mn><mi mathvariant="normal">/</mi><mtext>百万输出</mtext><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mo>∗</mo><mo>∗</mo><mo separator="true">,</mo><mtext>同时提供</mtext><mo>∗</mo><mo>∗</mo><mn>200</mn><mtext>万</mtext><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mtext>的上下文窗口</mtext><mo>∗</mo><mo>∗</mo><mtext>。这一价格仅为</mtext><mi>G</mi><mi>P</mi><mi>T</mi><mo>−</mo><mn>5.4</mn><mo>−</mo><mi>m</mi><mi>i</mi><mi>n</mi><mi>i</mi><mo stretchy="false">(</mo></mrow><annotation encoding="application/x-tex">0.50/百万输出 token**, 同时提供 **200 万 token 的上下文窗口**。这一价格仅为 GPT-5.4-mini(</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.50/</span><span class="mord cjk_fallback">百万输出</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord">∗</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord cjk_fallback">同时提供</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">∗</span><span class="mord">200</span><span class="mord cjk_fallback">万</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord cjk_fallback">的上下文窗口</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">∗</span><span class="mord cjk_fallback">。这一价格仅为</span><span class="mord mathnormal" style="margin-right:0.1389em;">GP</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5.4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">mini</span><span class="mopen">(</span></span></span></span>0.75/\$3)的 27%, 却提供了 15 倍的上下文容量。</p>
<p>但这并非简单的&quot;价格战&quot;。Grok 4.1 的核心技术赌注是<strong>统一权重双模式架构</strong>——用一个模型同时承载&quot;深度推理&quot;和&quot;即时响应&quot;两种能力, 通过 API 参数动态切换, 而非维护两个独立的模型权重。这一设计在降低推理基础设施成本的同时, 实现了知识在两个模式间的完全共享。</p>
<table>
<thead>
<tr>
<th>规格</th>
<th>Grok 4 Fast</th>
<th>Grok 4.1 Fast</th>
<th>GPT-5.4-mini</th>
<th>DeepSeek V4</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2025.09</td>
<td>2025.11.17</td>
<td>2026.01</td>
<td>2026.02</td>
</tr>
<tr>
<td>架构</td>
<td>密集 Transformer</td>
<td><strong>密集 Transformer</strong></td>
<td>密集 Transformer</td>
<td>MoE</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>2M</td>
<td><strong>2M</strong></td>
<td>128K</td>
<td>1M</td>
</tr>
<tr>
<td>推理/非推理</td>
<td>独立权重</td>
<td><strong>统一权重</strong></td>
<td>独立模型</td>
<td>独立模型</td>
</tr>
<tr>
<td>输入价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.20</mn><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">0.20 | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.20∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.20**</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.75</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.75 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.75∣</span></span></span></span>0.30</td>
<td></td>
<td></td>
</tr>
<tr>
<td>输出价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.50</mn><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">0.50 | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.50∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.50**</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.00</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">3.00 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3.00∣</span></span></span></span>0.50</td>
<td></td>
<td></td>
</tr>
<tr>
<td>Function Calling</td>
<td>基础</td>
<td><strong>Berkeley FC v4 SOTA</strong></td>
<td>良好</td>
<td>优秀</td>
</tr>
<tr>
<td>LMArena Elo</td>
<td>~1450</td>
<td><strong>~1483</strong></td>
<td>~1460</td>
<td>~1475</td>
</tr>
</tbody></table>
<p>Grok 4.1 在发布前进行了 11 月 1-14 日的&quot;静默上线&quot;(silent rollout), 在真实流量中与上一代 Grok 4 Fast 进行盲对比测试, 用户偏好选中率达到 <strong>64.78%</strong>。</p>
<h2 id="e-hxjsy-tyqzsmsjg">二、核心技术一：统一权重双模式架构</h2>
<h3 id="2-1-ctsmsdtd">2.1 传统双模式的痛点</h3>
<p>主流模型的推理/非推理双模式通常采用<strong>独立模型</strong>方案：</p>
<ul>
<li><strong>OpenAI</strong>：o3(推理)和 GPT-5.4(非推理)是完全独立的模型权重</li>
<li><strong>DeepSeek</strong>：R1(推理)和 V4(非推理)分别训练</li>
<li><strong>xAI 自身</strong>：Grok 4.20 的推理模式和非推理模式也使用了不同的优化路径</li>
</ul>
<p>独立模型的问题在于：</p>
<ol>
<li><strong>知识割裂</strong>：推理模型学到的知识不会自动迁移到非推理模型, 反之亦然</li>
<li><strong>基础设施翻倍</strong>：需要部署两套模型服务, GPU 利用率下降</li>
<li><strong>上下文不共享</strong>：用户在同一对话中切换模式时, 模型&quot;忘记&quot;了之前的上下文</li>
<li><strong>维护成本高</strong>：两个模型的安全对齐、功能更新需要分别进行</li>
</ol>
<h3 id="2-2-tyqzdsxjz">2.2 统一权重的实现机制</h3>
<p>Grok 4.1 采用<strong>单一套模型权重</strong>, 通过控制<strong>推理深度参数</strong> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>∈</mo><mo stretchy="false">[</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\tau \\in [0, 1]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">]</span></span></span></span> 实现模式切换：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Output</mtext><mo>=</mo><mtext>Grok-4.1</mtext><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>τ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Output} = \\text{Grok-4.1}(x, \\tau)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Output</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Grok-4.1</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">)</span></span></span></span></span><p>具体实现上, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 控制三个层面的行为：</p>
<p><strong>层面 1：思维链(Chain-of-Thought)生成</strong></p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>CoT Length</mtext><mo>=</mo><msub><mi>L</mi><mi>max</mi><mo>⁡</mo></msub><mo>⋅</mo><mtext>sigmoid</mtext><mo stretchy="false">(</mo><mi>α</mi><mi>τ</mi><mo>+</mo><mi>β</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{CoT Length} = L_{\\max} \\cdot \\text{sigmoid}(\\alpha \\tau + \\beta)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">CoT Length</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">sigmoid</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mclose">)</span></span></span></span></span><p>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\tau = 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span>(非推理模式)时, 模型直接输出答案, 不生成显式的思维链; 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">\\tau = 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>(推理模式)时, 模型生成完整的逐步推理过程。中间值产生&quot;浅层思维链&quot;——简要的关键步骤而非详尽的推导。</p>
<p><strong>层面 2：解码策略</strong></p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>T</mi><mtext>sampling</mtext></msub><mo>=</mo><msub><mi>T</mi><mtext>base</mtext></msub><mo>⋅</mo><mo stretchy="false">(</mo><mn>1</mn><mo>+</mo><mi>γ</mi><mi>τ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">T_{\\text{sampling}} = T_{\\text{base}} \\cdot (1 + \\gamma \\tau)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sampling</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">base</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">)</span></span></span></span></span><p>推理模式使用更高的采样温度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>γ</mi><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\gamma &gt; 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span>, 鼓励模型探索更多可能的推理路径; 非推理模式使用较低温度, 追求确定性和速度。</p>
<p><strong>层面 3：工具调用深度</strong></p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>N</mi><mtext>tools</mtext></msub><mo>=</mo><mo stretchy="false">⌊</mo><msub><mi>N</mi><mi>max</mi><mo>⁡</mo></msub><mo>⋅</mo><mi>τ</mi><mo stretchy="false">⌋</mo></mrow><annotation encoding="application/x-tex">N_{\\text{tools}} = \\lfloor N_{\\max} \\cdot \\tau \\rfloor</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tools</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">⌊</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">⌋</span></span></span></span></span><p>非推理模式限制工具调用次数(通常 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≤</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">\\leq 2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7719em;vertical-align:-0.136em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> 次), 避免延迟爆炸; 推理模式允许更深度的多步工具调用链(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≤</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">\\leq 10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7719em;vertical-align:-0.136em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10</span></span></span></span> 次)。</p>
<h3 id="2-3-tyqzdxlcl">2.3 统一权重的训练策略</h3>
<p>统一权重的训练是一个<strong>多目标优化</strong>问题：模型需要同时学会&quot;快速回答&quot;和&quot;深度推理&quot;, 且两者不能互相干扰。</p>
<p>xAI 采用**课程化强化学习(Curriculum RL)**策略：</p>
<p><strong>第一阶段：推理能力奠基</strong></p>
<ul>
<li>使用高质量的数学、代码、逻辑推理数据集进行监督微调(SFT)</li>
<li>训练目标：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>reason</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mi>P</mi><mo stretchy="false">(</mo><msub><mi>y</mi><mtext>CoT</mtext></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{reason}} = -\\log P(y_{\\text{CoT}} | x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reason</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">CoT</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></li>
</ul>
<p><strong>第二阶段：非推理能力蒸馏</strong></p>
<ul>
<li>从推理模式的输出中蒸馏&quot;直接答案&quot;, 训练模型在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\tau = 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span> 时跳过 CoT 直接输出</li>
<li>训练目标：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>direct</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mi>P</mi><mo stretchy="false">(</mo><msub><mi>y</mi><mtext>answer</mtext></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><mi>τ</mi><mo>=</mo><mn>0</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{direct}} = -\\log P(y_{\\text{answer}} | x, \\tau=0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">direct</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">answer</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0</span><span class="mclose">)</span></span></span></span></li>
<li>关键技巧：使用<strong>知识蒸馏损失</strong>而非简单监督, 保留推理模式的&quot;内部知识&quot;：</li>
</ul>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>distill</mtext></msub><mo>=</mo><mtext>KL</mtext><mrow><mo fence="true">(</mo><msub><mi>P</mi><mtext>teacher</mtext></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><mi>τ</mi><mo>=</mo><mn>1</mn><mo stretchy="false">)</mo><mi mathvariant="normal">∥</mi><msub><mi>P</mi><mtext>student</mtext></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><mi>τ</mi><mo>=</mo><mn>0</mn><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{distill}} = \\text{KL}\\left(P_{\\text{teacher}}(y | x, \\tau=1) \\| P_{\\text{student}}(y | x, \\tau=0)\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">distill</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">KL</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">teacher</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">student</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span></span></span></span></span><p><strong>第三阶段：混合训练</strong></p>
<ul>
<li>每个训练 batch 中, 50% 样本使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">\\tau = 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>(推理模式), 50% 使用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\tau = 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span>(非推理模式)</li>
<li>引入<strong>模式识别损失</strong>, 让模型学会根据问题复杂度自动选择适当的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span>：</li>
</ul>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>mode</mtext></msub><mo>=</mo><mtext>CrossEntropy</mtext><mo stretchy="false">(</mo><msub><mi>τ</mi><mtext>pred</mtext></msub><mo separator="true">,</mo><msub><mi>τ</mi><mtext>optimal</mtext></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{mode}} = \\text{CrossEntropy}(\\tau_{\\text{pred}}, \\tau_{\\text{optimal}})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">mode</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">CrossEntropy</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1132em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">pred</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1132em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">optimal</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>τ</mi><mtext>optimal</mtext></msub></mrow><annotation encoding="application/x-tex">\\tau_{\\text{optimal}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1132em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">optimal</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 由人工标注的&quot;问题复杂度&quot;决定。</p>
<h3 id="2-4-tyqzdgcys">2.4 统一权重的工程优势</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>独立模型方案</th>
<th>统一权重方案(Grok 4.1)</th>
</tr>
</thead>
<tbody><tr>
<td>GPU 显存占用</td>
<td>2×</td>
<td><strong>1×</strong></td>
</tr>
<tr>
<td>服务部署复杂度</td>
<td>高(两套系统)</td>
<td><strong>低(一套系统)</strong></td>
</tr>
<tr>
<td>模式切换延迟</td>
<td>&gt;100ms(加载新模型)</td>
<td><strong>&lt;10ms</strong>(参数调整)</td>
</tr>
<tr>
<td>知识共享程度</td>
<td>低</td>
<td><strong>完全共享</strong></td>
</tr>
<tr>
<td>模式间能力差距</td>
<td>大(各自专精)</td>
<td><strong>小(-40%)</strong></td>
</tr>
</tbody></table>
<p>xAI 报告称, 统一权重设计使推理模式和非推理模式的<strong>能力差距缩小了 40%</strong>——这意味着即使使用非推理模式, 模型也能保留相当比例的推理能力(因为底层权重共享)。</p>
<h2 id="s-hxjse-csjqhxx-long-horizon-rl">三、核心技术二：长时界强化学习(Long-Horizon RL)</h2>
<h3 id="3-1-agentic-cjdxltz">3.1 Agentic 场景的训练挑战</h3>
<p>Grok 4.1 的训练目标不仅是&quot;回答问题&quot;, 而是<strong>在模拟环境中自主完成复杂任务</strong>。这类任务的特点是<strong>长时界(Long-Horizon)</strong>——需要数十轮甚至数百轮交互才能完成：</p>
<pre><code>用户：&quot;帮我策划一次从纽约到东京的商务旅行&quot;
    ↓
Agent: 搜索航班 → 比较价格 → 搜索酒店 → 检查签证要求 → 
       查询天气预报 → 推荐行程安排 → 预订确认 → 生成行程单
    ↓
(可能涉及 20+ 轮工具调用, 跨越多个 API)
</code></pre>
<p>传统的 RLHF(基于人类反馈的强化学习)在这种场景下失效, 因为：</p>
<ol>
<li><strong>信用分配困难</strong>：最终任务成功/失败的信号如何归因到中间某一步的工具调用？</li>
<li><strong>延迟奖励</strong>：任务可能在 50 轮后才完成, RL 算法难以处理如此长的延迟</li>
<li><strong>环境异构性</strong>：不同工具调用的延迟差异巨大(本地计算 &lt; 1ms, API 调用 &gt; 500ms)</li>
<li><strong>轨迹长度不一致</strong>：不同任务的完成轮数差异巨大(5 轮到 200 轮)</li>
</ol>
<h3 id="3-2-mnhjxlgd">3.2 模拟环境训练管道</h3>
<p>xAI 构建了大规模的<strong>模拟环境</strong>来训练 Grok 4.1 的 agentic 能力：</p>
<p><strong>环境类型</strong>：</p>
<ul>
<li><strong>WebAgent 环境</strong>：模拟浏览器交互(点击、输入、滚动、导航)</li>
<li><strong>CodeAgent 环境</strong>：提供沙箱执行环境, 允许模型编写、测试、调试代码</li>
<li><strong>CustomerService 环境</strong>：模拟客服对话, 模型需要检索知识库、查询订单、处理退换货</li>
<li><strong>FinanceAgent 环境</strong>：模拟交易环境, 模型需要分析市场数据、执行交易、生成报告</li>
</ul>
<p><strong>奖励设计</strong>：</p>
<p>不同于单轮任务的简单正确/错误奖励, 长时界任务使用<strong>分层奖励(Hierarchical Reward)</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mtext>total</mtext></msub><mo>=</mo><msub><mi>R</mi><mtext>final</mtext></msub><mo>+</mo><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mi>T</mi></munderover><msup><mi>γ</mi><mi>t</mi></msup><mrow><mo fence="true">(</mo><msub><mi>R</mi><mtext>step</mtext></msub><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>+</mo><msub><mi>R</mi><mtext>milestone</mtext></msub><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">R_{\\text{total}} = R_{\\text{final}} + \\sum_{t=1}^{T} \\gamma^t \\left(R_{\\text{step}}(t) + R_{\\text{milestone}}(t)\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">total</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">final</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8436em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">step</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">milestone</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span></span></span></span></span><p>其中：</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>final</mtext></msub></mrow><annotation encoding="application/x-tex">R_{\\text{final}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">final</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：任务最终完成的稀疏奖励(+10 成功, -5 失败)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>step</mtext></msub><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">R_{\\text{step}}(t)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">step</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span></span></span></span>：每步的格式奖励(正确调用工具格式 +0.1, 错误格式 -0.2)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>milestone</mtext></msub><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">R_{\\text{milestone}}(t)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">milestone</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span></span></span></span>：里程碑奖励(到达关键子目标 +1)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>γ</mi><mo>=</mo><mn>0.99</mn></mrow><annotation encoding="application/x-tex">\\gamma = 0.99</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.99</span></span></span></span>：折扣因子</li>
</ul>
<h3 id="3-3-gjglywdxyh">3.3 轨迹过滤与稳定性优化</h3>
<p>长时界 RL 的最大挑战是训练不稳定性——agent 可能在早期学到&quot;重复调用同一工具获取正奖励&quot;的捷径(reward hacking)。Grok 4.1 采用**轨迹过滤(Trajectory Filtering)**策略：</p>
<ol>
<li><strong>重复检测</strong>：如果 agent 在 5 轮内重复调用同一工具且参数相同, 该轨迹被标记为&quot;可疑&quot;</li>
<li><strong>进度检查</strong>：如果 10 轮后任务进度(由人工定义的里程碑)&lt; 20%, 该轨迹被丢弃</li>
<li><strong>多样性奖励</strong>：鼓励 agent 尝试不同的工具组合, 对&quot;首次使用的工具&quot;给予额外奖励</li>
</ol>
<p>此外, xAI 采用了**从推理模型初始化(Warm Start from Reasoning Model)**的策略：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>θ</mi><mtext>agent</mtext><mrow><mo stretchy="false">(</mo><mn>0</mn><mo stretchy="false">)</mo></mrow></msubsup><mo>=</mo><msub><mi>θ</mi><mtext>reasoning</mtext></msub></mrow><annotation encoding="application/x-tex">\\theta_{\\text{agent}}^{(0)} = \\theta_{\\text{reasoning}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.4267em;vertical-align:-0.3819em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4542em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">agent</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight">0</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3819em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reasoning</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>而非从基础模型或 SFT 模型初始化。这使得 agent 在一开始就具备强大的逐步推理能力, 只需要学习&quot;如何将推理转化为工具调用行动&quot;。</p>
<h3 id="3-4-ybfbsxljg">3.4 异步分布式训练架构</h3>
<p>长时界 agentic 训练的另一个瓶颈是<strong>经验生成(Rollout Generation)</strong>——每个训练步骤需要生成大量交互轨迹, 而轨迹长度差异导致严重的负载不均衡。</p>
<p>xAI 的解决方案是<strong>完全异步的分布式架构</strong>：</p>
<pre><code>训练节点(Trainer)          经验生成节点(Generator)
     ↓                              ↓
  更新策略权重  ←──────────────  发送轨迹批次
     ↓                              ↓
  广播新权重   ───────────────→  异步接收, 无需等待
     ↓                              ↓
  继续训练  ←────────────────  生成器使用最新可用权重
</code></pre>
<p>关键设计：</p>
<ul>
<li><strong>去中心化权重存储</strong>：使用参数服务器, 生成器随时拉取最新权重</li>
<li><strong>动态批处理</strong>：将不同长度的轨迹动态组合成批次, 减少填充(padding)开销</li>
<li><strong>优先级回放</strong>：对&quot;高难度任务&quot;的轨迹给予更高的采样优先级</li>
</ul>
<p>实验表明, 这种异步架构将训练吞吐量提升了 <strong>14.6 倍</strong>(对比同步架构)。</p>
<h2 id="s-hxjss-2m-sxwdgxcl">四、核心技术三：2M 上下文的高效处理</h2>
<h3 id="4-1-cxljsyh">4.1 长序列检索优化</h3>
<p>Grok 4.1 的 2M token 上下文窗口在实际使用中面临一个关键问题：<strong>信息检索精度随上下文长度增加而下降</strong>。实验表明, 当上下文超过 500K token 时, 模型对早期信息的召回率明显下降。</p>
<p>xAI 的解决方案是<strong>分层注意力机制(Hierarchical Attention)</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo>+</mo><mi>M</mi><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi></mrow><annotation encoding="application/x-tex">M</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span></span></span> 是<strong>分层掩码(Hierarchical Mask)</strong>：</p>
<ul>
<li><strong>第一层</strong>：局部窗口注意力(local window, 每 token 只关注邻近 4K token)</li>
<li><strong>第二层</strong>：段落级注意力(paragraph-level, 每段落有一个摘要 token, 段落内 token 互相可见)</li>
<li><strong>第三层</strong>：全局稀疏注意力(global sparse, 每 1K token 有一个全局锚点, 所有 token 可见)</li>
</ul>
<p>这种三层结构将注意力计算复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降低到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span>, 同时保持了长程依赖的捕捉能力。</p>
<h3 id="4-2-hcyh-qzgx">4.2 缓存优化：前缀共享</h3>
<p>在 agentic 工作流中, 大量的上下文是<strong>固定的系统提示和工具定义</strong>, 只有少量的用户输入和工具输出在变化。Grok 4.1 的 API 支持<strong>前缀缓存(Prefix Caching)</strong>：</p>
<pre><code class="language-python"># 系统提示和工具定义(固定前缀)
system_and_tools = &quot;...&quot;  # 100K tokens

# 第一次调用：计算并缓存前缀的 KV Cache
response1 = grok.chat(prefix=system_and_tools, message=user_msg1)

# 第二次调用：直接命中缓存, 无需重新计算前缀
response2 = grok.chat(prefix=system_and_tools, message=user_msg2)
# 缓存命中价格：&lt;!--MATH_36--&gt;0.20 降低 75%)
</code></pre>
<p>前缀缓存将 agentic 工作流的实际成本降低了 <strong>50-75%</strong>, 使得 \$0.20 的标价在实际使用中更具竞争力。</p>
<h2 id="w-xnpg">五、性能评估</h2>
<h3 id="5-1-agentic-nljz">5.1 Agentic 能力基准</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Grok 4.1 Fast</th>
<th>GPT-5.4</th>
<th>Claude Sonnet 4.6</th>
<th>DeepSeek V4</th>
</tr>
</thead>
<tbody><tr>
<td>Berkeley FC v4</td>
<td><strong>SOTA</strong></td>
<td>良好</td>
<td>良好</td>
<td>优秀</td>
</tr>
<tr>
<td>Research-Eval Reka</td>
<td><strong>63.9</strong></td>
<td>58.2</td>
<td>55.7</td>
<td>61.5</td>
</tr>
<tr>
<td>FRAMES</td>
<td><strong>87.6</strong></td>
<td>82.1</td>
<td>79.3</td>
<td>85.2</td>
</tr>
<tr>
<td>SWE-bench Verified</td>
<td>70%</td>
<td>88%</td>
<td>90%</td>
<td>81%</td>
</tr>
</tbody></table>
<p>Grok 4.1 在工具调用和 agentic 搜索基准上表现突出, 但在纯编程任务(SWE-bench)上仍落后于 Claude 和 GPT。</p>
<h3 id="5-2-sdyyc">5.2 速度与延迟</h3>
<table>
<thead>
<tr>
<th>场景</th>
<th>Grok 4.1(非推理)</th>
<th>Grok 4.1(推理)</th>
<th>GPT-5.4-mini</th>
<th>DeepSeek V4</th>
</tr>
</thead>
<tbody><tr>
<td>首 Token 延迟</td>
<td><strong>150ms</strong></td>
<td>800ms</td>
<td>200ms</td>
<td>300ms</td>
</tr>
<tr>
<td>Tokens/s</td>
<td><strong>180</strong></td>
<td>45</td>
<td>120</td>
<td>80</td>
</tr>
<tr>
<td>工具调用往返</td>
<td><strong>300ms</strong></td>
<td>1.2s</td>
<td>500ms</td>
<td>600ms</td>
</tr>
</tbody></table>
<p>非推理模式的 150ms 首 token 延迟和 180 tokens/s 的输出速度, 使 Grok 4.1 成为实时交互场景(客服、聊天)的理想选择。</p>
<h3 id="5-3-cbxs">5.3 成本效率</h3>
<table>
<thead>
<tr>
<th>工作负载</th>
<th>Grok 4.1</th>
<th>GPT-5.4-mini</th>
<th>DeepSeek V4</th>
<th>成本优势</th>
</tr>
</thead>
<tbody><tr>
<td>1000 次简单查询</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.20</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.20 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.20∣</span></span></span></span>0.75</td>
<td>\$0.30</td>
<td><strong>73%</strong></td>
<td></td>
</tr>
<tr>
<td>1000 次 agentic 任务</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2.00</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">2.00 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2.00∣</span></span></span></span>5.00</td>
<td>\$2.50</td>
<td><strong>60%</strong></td>
<td></td>
</tr>
<tr>
<td>1M token 长文档分析</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.20</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.20 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.20∣</span></span></span></span>0.75</td>
<td>\$0.30</td>
<td><strong>73%</strong></td>
<td></td>
</tr>
</tbody></table>
<h3 id="5-4-hjsyaq">5.4 幻觉率与安全</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>Grok 4.1</th>
<th>Grok 4</th>
<th>GPT-5.4-mini</th>
</tr>
</thead>
<tbody><tr>
<td>AA Omni 幻觉率</td>
<td><strong>28%</strong></td>
<td>22%</td>
<td>32%</td>
</tr>
<tr>
<td>&quot;我不知道&quot;准确率</td>
<td><strong>72%</strong></td>
<td>65%</td>
<td>55%</td>
</tr>
<tr>
<td>安全对齐分数</td>
<td>中等</td>
<td>中等</td>
<td>高</td>
</tr>
</tbody></table>
<p>值得注意的是, Microsoft Azure 的安全评估指出 Grok 4.1 的<strong>安全对齐分数低于其他主流模型</strong>, 存在更高的有害内容生成风险。Azure 通过强制系统级安全提示来缓解这一问题。</p>
<h2 id="l-jxytz">六、局限与挑战</h2>
<h3 id="6-1-jsjx">6.1 技术局限</h3>
<ol>
<li><strong>密集架构的扩展瓶颈</strong>：Grok 4.1 采用密集 Transformer(非 MoE), 推理成本随参数量线性增长。xAI 通过低定价补贴用户, 但长期可持续性存疑</li>
<li><strong>幻觉率回归</strong>：Grok 4.1 的 AA Omni 幻觉率(28%)高于 Grok 4(22%), 可能是因为长时界 RL 训练引入了更多&quot;创造性&quot;行为</li>
<li><strong>编程任务短板</strong>：SWE-bench 70% 远低于 Claude Opus 4.6(90%), 说明 agentic 优化并未自动转化为编程能力</li>
<li><strong>小语种支持有限</strong>：主要优化英语场景, 中文、日文等语言的 agentic 任务表现明显下降</li>
</ol>
<h3 id="6-2-sykcxx">6.2 商业可持续性</h3>
<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.20</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.20/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.20/</span></span></span></span>0.50 的定价策略引发了行业对 xAI **补贴模式**的质疑。分析表明：<ul>
<li>2M 上下文的密集模型推理成本约为 \$0.15-0.25/百万 token(GPU 折旧 + 电费)</li>
<li>\$0.20 的定价可能仅覆盖边际成本, 无法覆盖研发摊销</li>
<li>xAI 的可能策略：通过低价获取用户和数据, 用数据改进模型, 再用模型吸引更多用户(飞轮效应)</li>
</ul>
<p>这种策略与早期 Uber、滴滴的补贴打法类似, 但需要持续的大规模资本投入。</p>
<h3 id="6-3-aqfx">6.3 安全风险</h3>
<p>xAI &quot;追求真相、最小审查&quot;的产品哲学与低价格结合, 可能导致：</p>
<ol>
<li><strong>恶意使用的低成本</strong>：\$0.20/百万 token 意味着生成大量有害内容的成本极低</li>
<li><strong>深度伪造规模化</strong>：2M 上下文 + 低延迟使得长文本伪造(如假新闻、假论文)更加高效</li>
<li><strong>自动化攻击</strong>：agentic 能力被用于自动化网络攻击(如自动发现漏洞、构造钓鱼邮件)</li>
</ol>
<p>Microsoft Azure 在部署 Grok 4.1 时强制添加了不可禁用的系统安全提示, 并建议用户配合 Azure AI Content Safety 服务使用。</p>
<h2 id="q-zj">七、总结</h2>
<p>Grok 4.1 是 xAI 在&quot;极致性价比&quot;路线上的战略产品。其<strong>统一权重双模式架构</strong>打破了推理/非推理模型必须独立维护的行业惯例, 通过课程化 RL 训练实现了单模型的多能力承载; <strong>长时界强化学习训练</strong>在模拟环境中培养出的 agentic 能力, 使其在工具调用和多轮任务执行上达到了 SOTA 水平; <strong>2M 上下文 + 前缀缓存</strong>的组合则为长文档分析和复杂 agentic 工作流提供了基础设施。</p>
<p>然而, Grok 4.1 面临的挑战同样严峻：密集架构的扩展性瓶颈、幻觉率的相对上升、安全对齐的不足、以及激进的补贴定价模式。在 AI 模型能力快速趋同的背景下, xAI 能否将&quot;低价 + 大上下文 + agentic&quot;的差异化组合转化为可持续的市场地位, 将取决于其技术迭代速度、安全投入力度、以及资本市场的耐心。</p>
<p>对于开发者而言, Grok 4.1 提供了一个极具吸引力的&quot;生产级 agentic API&quot;选项——尤其是当应用场景涉及大量工具调用、长上下文处理、且对成本敏感时。但高风险场景(医疗、法律、金融决策)建议配合额外的安全层和人工审核使用。</p>
<hr>
<blockquote>
<p>📚 <strong>延伸阅读</strong></p>
<ul>
<li><a href="https://docs.x.ai/docs/models">xAI Grok 4.1 官方文档</a></li>
<li><a href="https://gorilla.cs.berkeley.edu/leaderboard.html">Berkeley Function Calling Leaderboard</a></li>
<li><a href="https://arxiv.org/abs/2509.02547">长时界强化学习综述</a></li>
<li><a href="https://artificialanalysis.ai/">Artificial Analysis 模型对比</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbj-0-20-djbhdjsyx","text":"一、发布背景：\$0.20 定价背后的技术野心"},{"level":2,"id":"e-hxjsy-tyqzsmsjg","text":"二、核心技术一：统一权重双模式架构"},{"level":3,"id":"2-1-ctsmsdtd","text":"2.1 传统双模式的痛点"},{"level":3,"id":"2-2-tyqzdsxjz","text":"2.2 统一权重的实现机制"},{"level":3,"id":"2-3-tyqzdxlcl","text":"2.3 统一权重的训练策略"},{"level":3,"id":"2-4-tyqzdgcys","text":"2.4 统一权重的工程优势"},{"level":2,"id":"s-hxjse-csjqhxx-long-horizon-rl","text":"三、核心技术二：长时界强化学习(Long-Horizon RL)"},{"level":3,"id":"3-1-agentic-cjdxltz","text":"3.1 Agentic 场景的训练挑战"},{"level":3,"id":"3-2-mnhjxlgd","text":"3.2 模拟环境训练管道"},{"level":3,"id":"3-3-gjglywdxyh","text":"3.3 轨迹过滤与稳定性优化"},{"level":3,"id":"3-4-ybfbsxljg","text":"3.4 异步分布式训练架构"},{"level":2,"id":"s-hxjss-2m-sxwdgxcl","text":"四、核心技术三：2M 上下文的高效处理"},{"level":3,"id":"4-1-cxljsyh","text":"4.1 长序列检索优化"},{"level":3,"id":"4-2-hcyh-qzgx","text":"4.2 缓存优化：前缀共享"},{"level":2,"id":"w-xnpg","text":"五、性能评估"},{"level":3,"id":"5-1-agentic-nljz","text":"5.1 Agentic 能力基准"},{"level":3,"id":"5-2-sdyyc","text":"5.2 速度与延迟"},{"level":3,"id":"5-3-cbxs","text":"5.3 成本效率"},{"level":3,"id":"5-4-hjsyaq","text":"5.4 幻觉率与安全"},{"level":2,"id":"l-jxytz","text":"六、局限与挑战"},{"level":3,"id":"6-1-jsjx","text":"6.1 技术局限"},{"level":3,"id":"6-2-sykcxx","text":"6.2 商业可持续性"},{"level":3,"id":"6-3-aqfx","text":"6.3 安全风险"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.15-xai/08-grok-4.1/05-grok-4.1-tyqzsmsycsjqhxxxl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.15-xai/08-grok-4.1/05-grok-4.1-tyqzsmsycsjqhxxxl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Grok 4.1：统一权重双模式与长时界强化学习训练</h1>
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
