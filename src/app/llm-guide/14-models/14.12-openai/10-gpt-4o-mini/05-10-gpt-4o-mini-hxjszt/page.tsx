"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>10-GPT-4o-mini 核心技术专题：多模态小模型的成本极限与端侧部署探索</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<h2 id="y-mxdwyfbbj">一、模型定位与发布背景</h2>
<p>2024 年 7 月 18 日，OpenAI 发布了 <strong>GPT-4o-mini</strong>，这款模型的发布标志着 OpenAI 正式完成了从 GPT-3.5 时代向 GPT-4 时代的全面过渡。Sam Altman 将其定位为&quot;<strong>目前最有能力的小模型</strong>&quot;，意图用 GPT-4o-mini 全面替代 GPT-3.5 Turbo 的市场地位。</p>
<h3 id="1-1-cpjzzdwz">1.1 产品矩阵中的位置</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-3.5 Turbo</th>
<th>GPT-4o-mini</th>
<th>GPT-4o</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>发布时间</td>
<td>2023.03</td>
<td>2024.07</td>
<td>2024.05</td>
<td>换代</td>
</tr>
<tr>
<td>定位</td>
<td>上一代轻量</td>
<td><strong>新一代轻量</strong></td>
<td>新一代主力</td>
<td>梯度</td>
</tr>
<tr>
<td>上下文</td>
<td>16K</td>
<td><strong>128K</strong></td>
<td>128K</td>
<td>8x 扩展</td>
</tr>
<tr>
<td>多模态</td>
<td>❌</td>
<td><strong>✅</strong></td>
<td>✅</td>
<td>新增</td>
</tr>
<tr>
<td>MMLU</td>
<td>70.0%</td>
<td><strong>82.0%</strong></td>
<td>87.2%</td>
<td>大幅超越</td>
</tr>
<tr>
<td>输入价格/1M</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.50</mn><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">0.50 | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.50∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.15**</td>
<td>\$2.50</td>
<td>↓ 70%</td>
<td></td>
</tr>
<tr>
<td>输出价格/1M</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.50</mn><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">1.50 | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.50∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.60**</td>
<td>\$10.00</td>
<td>↓ 60%</td>
<td></td>
</tr>
</tbody></table>
<p>GPT-4o-mini 在<strong>价格低于 GPT-3.5 Turbo</strong> 的同时，实现了**能力超越 GPT-4(2023 版)**的跨越。这种&quot;<strong>更便宜、更强</strong>&quot;的组合彻底改写了轻量模型的市场格局。</p>
<h3 id="1-2-sccl-jwdj">1.2 市场策略：降维打击</h3>
<p>OpenAI 发布 GPT-4o-mini 的时机和定价充满战略意图：</p>
<ol>
<li><strong>替代 GPT-3.5</strong>：以更低价格提供更强能力，迫使所有基于 GPT-3.5 的应用迁移</li>
<li><strong>挤压竞品空间</strong>：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mtext>的定价直接冲击</mtext><mi>C</mi><mi>l</mi><mi>a</mi><mi>u</mi><mi>d</mi><mi>e</mi><mn>3</mn><mi>H</mi><mi>a</mi><mi>i</mi><mi>k</mi><mi>u</mi><mo stretchy="false">(</mo></mrow><annotation encoding="application/x-tex">0.15/1M 的定价直接冲击 Claude 3 Haiku(</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord cjk_fallback">的定价直接冲击</span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">a</span><span class="mord mathnormal">u</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord">3</span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="mord mathnormal" style="margin-right:0.0315em;">aik</span><span class="mord mathnormal">u</span><span class="mopen">(</span></span></span></span>0.25/1M)和 Gemini 1.5 Flash(\$0.075/1M 但 Flash 稍晚发布)</li>
<li><strong>为 GPT-4o 让路</strong>：明确区分轻量和主力市场，避免内部竞争</li>
<li><strong>教育市场</strong>：让开发者习惯&quot;轻量模型也应该是多模态的&quot;</li>
</ol>
<h2 id="e-mxysyzszldjssx">二、模型压缩与知识蒸馏的技术实现</h2>
<h3 id="2-1-c-gpt-4o-d-gpt-4o-mini-dyslj">2.1 从 GPT-4o 到 GPT-4o-mini 的压缩路径</h3>
<p>GPT-4o-mini 的核心技术路线是<strong>模型压缩 + 知识蒸馏</strong>：以 GPT-4o 作为教师模型，将能力迁移到更小的学生模型。</p>
<p><strong>推测的架构对比</strong>：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-4o(推测)</th>
<th>GPT-4o-mini(推测)</th>
<th>压缩比</th>
</tr>
</thead>
<tbody><tr>
<td>参数量</td>
<td><del>200B(MoE, 激活</del>20B)</td>
<td><strong>~8B(Dense)</strong></td>
<td>~25x</td>
</tr>
<tr>
<td>层数</td>
<td>~80-120</td>
<td><strong>~32-40</strong></td>
<td>~3x</td>
</tr>
<tr>
<td>隐藏维度</td>
<td>~8192-12288</td>
<td><strong>~3072-4096</strong></td>
<td>~3x</td>
</tr>
<tr>
<td>注意力头</td>
<td>~64-96</td>
<td><strong>~24-32</strong></td>
<td>~3x</td>
</tr>
<tr>
<td>架构</td>
<td>MoE</td>
<td><strong>Dense</strong></td>
<td>架构变革</td>
</tr>
</tbody></table>
<p><strong>关键发现</strong>：GPT-4o-mini 可能从 MoE 架构切换到了 <strong>Dense Transformer</strong>，这与 Claude 系列的选择一致。Dense 架构的优势：</p>
<ul>
<li>更稳定的训练行为</li>
<li>更低的推理延迟(无路由开销)</li>
<li>更易于端侧部署</li>
</ul>
<h3 id="2-2-dcczszl">2.2 多层次知识蒸馏</h3>
<p>GPT-4o-mini 的蒸馏策略可能包含三个层次：</p>
<p><strong>层次一：Logits 蒸馏(响应级)</strong></p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>l</mi><mi>o</mi><mi>g</mi><mi>i</mi><mi>t</mi><mi>s</mi></mrow></msub><mo>=</mo><msup><mi>τ</mi><mn>2</mn></msup><mo>⋅</mo><mtext>KL</mtext><mrow><mo fence="true">(</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><msub><mi>z</mi><mrow><mi>t</mi><mi>e</mi><mi>a</mi><mi>c</mi><mi>h</mi><mi>e</mi><mi>r</mi></mrow></msub><mi>τ</mi></mfrac><mo fence="true">)</mo></mrow><mo>∥</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><msub><mi>z</mi><mrow><mi>s</mi><mi>t</mi><mi>u</mi><mi>d</mi><mi>e</mi><mi>n</mi><mi>t</mi></mrow></msub><mi>τ</mi></mfrac><mo fence="true">)</mo></mrow><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{logits} = \\tau^2 \\cdot \\text{KL}\\left(\\text{softmax}\\left(\\frac{z_{teacher}}{\\tau}\\right) \\parallel \\text{softmax}\\left(\\frac{z_{student}}{\\tau}\\right)\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8641em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.836em;vertical-align:-0.686em;"></span><span class="mord text"><span class="mord">KL</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∥</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.044em;">z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.044em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 为温度参数(通常 2-5)，用于软化概率分布，使学生模型能学习到教师模型的&quot;置信度模式&quot;。</p>
<p><strong>层次二：隐藏状态蒸馏(特征级)</strong></p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>h</mi><mi>i</mi><mi>d</mi><mi>d</mi><mi>e</mi><mi>n</mi></mrow></msub><mo>=</mo><munder><mo>∑</mo><mrow><mi>l</mi><mo>∈</mo><mi mathvariant="script">L</mi></mrow></munder><msup><mrow><mo fence="true">∥</mo><msubsup><mi>h</mi><mrow><mi>s</mi><mi>t</mi><mi>u</mi><mi>d</mi><mi>e</mi><mi>n</mi><mi>t</mi></mrow><mrow><mo stretchy="false">(</mo><mi>l</mi><mo stretchy="false">)</mo></mrow></msubsup><mo>−</mo><msubsup><mi>W</mi><mrow><mi>p</mi><mi>r</mi><mi>o</mi><mi>j</mi></mrow><mrow><mo stretchy="false">(</mo><mi>l</mi><mo stretchy="false">)</mo></mrow></msubsup><msubsup><mi>h</mi><mrow><mi>t</mi><mi>e</mi><mi>a</mi><mi>c</mi><mi>h</mi><mi>e</mi><mi>r</mi></mrow><mrow><mo stretchy="false">(</mo><msup><mi>l</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo stretchy="false">)</mo></mrow></msubsup><mo fence="true">∥</mo></mrow><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{hidden} = \\sum_{l \\in \\mathcal{L}} \\left\\| h_{student}^{(l)} - W_{proj}^{(l)} h_{teacher}^{(l&#x27;)}\\right\\|^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">hi</span><span class="mord mathnormal mtight">dd</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.6835em;vertical-align:-1.3295em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8479em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mrel mtight">∈</span><span class="mord mathcal mtight">L</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.3295em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.15em;"><span style="top:-3.15em;"><span class="pstrut" style="height:3.8em;"></span><span style="width:0.556em;height:1.8em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.556em" height="1.8em" viewBox="0 0 556 1800"><path d="M145 15 v585 v600 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-600 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M188 15 H145 v585 v600 v585 h43z
M367 15 v585 v600 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-600 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M410 15 H367 v585 v600 v585 h43z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.65em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.3987em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.413em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0993em;"><span style="top:-2.3987em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8278em;"><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.15em;"><span style="top:-3.15em;"><span class="pstrut" style="height:3.8em;"></span><span style="width:0.556em;height:1.8em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.556em" height="1.8em" viewBox="0 0 556 1800"><path d="M145 15 v585 v600 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-600 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M188 15 H145 v585 v600 v585 h43z
M367 15 v585 v600 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-600 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M410 15 H367 v585 v600 v585 h43z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.65em;"><span></span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.354em;"><span style="top:-3.6029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></span><p>由于学生模型层数更少，需要建立教师层到学生层的映射关系(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi><mo>→</mo><msup><mi>l</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup></mrow><annotation encoding="application/x-tex">l \\to l&#x27;</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7519em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span></span></span></span>)。<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mrow><mi>p</mi><mi>r</mi><mi>o</mi><mi>j</mi></mrow></msub></mrow><annotation encoding="application/x-tex">W_{proj}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 为投影矩阵，对齐教师和学生隐藏状态的维度。</p>
<p><strong>层次三：多模态特征蒸馏</strong></p>
<p>对于 GPT-4o-mini 的多模态能力，蒸馏需要跨越模态边界：</p>
<ul>
<li><strong>视觉-文本对齐</strong>：蒸馏 CLIP 风格的对比损失</li>
<li><strong>图像 Caption 蒸馏</strong>：用 GPT-4o 的图像描述作为软标签</li>
<li><strong>OCR 能力蒸馏</strong>：蒸馏文本识别任务的表现</li>
</ul>
<h3 id="2-3-xlsjdzlsx">2.3 训练数据的质量筛选</h3>
<p>小模型对训练数据质量更敏感。GPT-4o-mini 可能采用了<strong>更严格的数据筛选策略</strong>：</p>
<p><strong>筛选指标</strong>：</p>
<ol>
<li><strong>教育价值评分</strong>：使用小模型预测样本的学习增益</li>
<li><strong>多样性评分</strong>：避免重复和冗余数据</li>
<li><strong>质量评分</strong>：语言流畅性、事实准确性、逻辑一致性</li>
<li><strong>安全评分</strong>：过滤有害、偏见和隐私敏感内容</li>
</ol>
<p><strong>推测的数据组成</strong>：</p>
<table>
<thead>
<tr>
<th>数据类型</th>
<th>比例</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>网页文本(高质量)</td>
<td>~40%</td>
<td>经严格筛选的 Common Crawl 子集</td>
</tr>
<tr>
<td>代码数据</td>
<td>~20%</td>
<td>GitHub + 合成代码(Code Interpreter 生成)</td>
</tr>
<tr>
<td>书籍/论文</td>
<td>~15%</td>
<td>学术和高质量文学</td>
</tr>
<tr>
<td>对话数据</td>
<td>~15%</td>
<td>人类对话 + 合成对话</td>
</tr>
<tr>
<td>多模态数据</td>
<td>~10%</td>
<td>图像-文本对 + 视频-文本对</td>
</tr>
</tbody></table>
<p>总训练 Token 量推测：~10-15T(低于 GPT-4o 的推测 20T+，但数据质量更高)</p>
<h2 id="s-dmtnldqlsx">三、多模态能力的轻量实现</h2>
<h3 id="3-1-sjljjg">3.1 视觉理解架构</h3>
<p>GPT-4o-mini 支持图像输入，其视觉架构可能为：</p>
<pre><code>图像输入 → 轻量 ViT 编码器 → 图像 Token(~256-512个)
                                      ↓
文本输入 → 文本 Tokenizer → 文本 Token → 拼接 → 小 Transformer → 输出
</code></pre>
<p><strong>与 GPT-4o 的视觉差异</strong>：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>GPT-4o</th>
<th>GPT-4o-mini(推测)</th>
</tr>
</thead>
<tbody><tr>
<td>视觉编码器</td>
<td>大型 ViT(~1B+ 参数)</td>
<td><strong>轻量 ViT(~100-300M 参数)</strong></td>
</tr>
<tr>
<td>图像分辨率</td>
<td>最高 1024×1024</td>
<td><strong>最高 512×512 或 1024×1024</strong></td>
</tr>
<tr>
<td>图像 Token 数</td>
<td>~512-1024</td>
<td><strong>~256-512</strong></td>
</tr>
<tr>
<td>多图处理</td>
<td>支持</td>
<td><strong>支持(限制更少)</strong></td>
</tr>
</tbody></table>
<p>轻量视觉编码器通过以下方式保持能力：</p>
<ol>
<li><strong>知识蒸馏</strong>：用 GPT-4o 的视觉特征作为教师信号</li>
<li><strong>分辨率自适应</strong>：低分辨率处理 + 局部放大(two-stage)</li>
<li><strong>参数共享</strong>：视觉编码器与文本 Transformer 部分参数共享</li>
</ol>
<h3 id="3-2-dmtnldsjbx">3.2 多模态能力的实际表现</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>GPT-4o-mini</th>
<th>GPT-4o</th>
<th>GPT-3.5</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMMU</td>
<td>56.7%</td>
<td>69.1%</td>
<td>N/A</td>
<td>多模态理解</td>
</tr>
<tr>
<td>MathVista</td>
<td>56.8%</td>
<td>63.8%</td>
<td>N/A</td>
<td>数学视觉推理</td>
</tr>
<tr>
<td>ChartQA</td>
<td>68.5%</td>
<td>85.7%</td>
<td>N/A</td>
<td>图表问答</td>
</tr>
<tr>
<td>DocVQA</td>
<td>81.2%</td>
<td>92.1%</td>
<td>N/A</td>
<td>文档 OCR</td>
</tr>
</tbody></table>
<p>GPT-4o-mini 在多模态基准上达到 GPT-4o 的 <strong>70-85%</strong>，对于轻量模型而言已属优秀。</p>
<h2 id="s-128k-sxwdjssx">四、128K 上下文的技术实现</h2>
<h3 id="4-1-qlmxdcsxwtz">4.1 轻量模型的长上下文挑战</h3>
<p>将 8B 参数的 Dense 模型扩展到 128K 上下文面临独特挑战：</p>
<p><strong>KV-Cache 显存压力</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>KV-Cache</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV-Cache} = 2 \\times L \\times n_{layers} \\times d_{model} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">KV-Cache</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span><p>对于 8B 模型(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>=</mo><mn>32</mn><mo separator="true">,</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">n_{layers}=32, d_{model}=4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">32</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>)：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV-Cache</mtext><mrow><mn>128</mn><mi>K</mi></mrow></msub><mo>=</mo><mn>2</mn><mo>×</mo><mn>128</mn><mi>K</mi><mo>×</mo><mn>32</mn><mo>×</mo><mn>4096</mn><mo>×</mo><mn>2</mn><mtext> bytes</mtext><mo>=</mo><mn>67.1</mn><mtext> GB</mtext></mrow><annotation encoding="application/x-tex">\\text{KV-Cache}_{128K} = 2 \\times 128K \\times 32 \\times 4096 \\times 2 \\text{ bytes} = 67.1 \\text{ GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV-Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">128</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">67.1</span><span class="mord text"><span class="mord"> GB</span></span></span></span></span></span><p>这远超单卡显存容量，需要激进的压缩策略。</p>
<h3 id="4-2-kv-cache-yscl">4.2 KV-Cache 压缩策略</h3>
<p><strong>策略一：MQA(Multi-Query Attention)</strong></p>
<p>将多头注意力中的 K/V 共享为单头：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>M</mi><mi>Q</mi><mi>A</mi></mrow></msub><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV}_{MQA} = 2 \\times L \\times n_{layers} \\times d_{model} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight">Q</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span><p>注意：MQA 的 KV-Cache 与 MHA 相同？不，MQA 中所有查询头共享同一组 K/V，所以：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>M</mi><mi>Q</mi><mi>A</mi></mrow></msub><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV}_{MQA} = 2 \\times L \\times n_{layers} \\times d_{model} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight">Q</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>M</mi><mi>H</mi><mi>A</mi></mrow></msub><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV}_{MHA} = 2 \\times L \\times n_{layers} \\times n_{heads} \\times d_{head} \\times \\text{bytes} = 2 \\times L \\times n_{layers} \\times d_{model} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span><p>实际上对于 MHA，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>=</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{heads} \\times d_{head} = d_{model}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>，所以 KV-Cache 大小相同？</p>
<p>让我重新思考：</p>
<ul>
<li>MHA：每个头有自己的 K/V，所以 KV-Cache = <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">2 \\times L \\times n_{layers} \\times d_{model} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></li>
<li>MQA：所有头共享同一组 K/V，所以 KV-Cache = <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">2 \\times L \\times n_{layers} \\times d_{head} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span>(如果 K/V 维度是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 而非 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{model}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>)</li>
</ul>
<p>实际上 MQA 中 K/V 的维度是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>(单个头的维度)，而 MHA 中 K/V 的维度是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{model}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>(所有头的拼接)。所以：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>压缩比</mtext><mo>=</mo><mfrac><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mfrac><mo>=</mo><mfrac><mn>1</mn><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub></mfrac></mrow><annotation encoding="application/x-tex">\\text{压缩比} = \\frac{d_{head}}{d_{model}} = \\frac{1}{n_{heads}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">压缩比</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2074em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1574em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>对于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>=</mo><mn>32</mn></mrow><annotation encoding="application/x-tex">n_{heads}=32</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">32</span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV-Cache</mtext><mrow><mi>M</mi><mi>Q</mi><mi>A</mi></mrow></msub><mo>=</mo><mfrac><mn>1</mn><mn>32</mn></mfrac><mo>×</mo><msub><mtext>KV-Cache</mtext><mrow><mi>M</mi><mi>H</mi><mi>A</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\text{KV-Cache}_{MQA} = \\frac{1}{32} \\times \\text{KV-Cache}_{MHA}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">KV-Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight">Q</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">32</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV-Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>这是 <strong>32 倍压缩</strong>！</p>
<p><strong>策略二：KV-Cache 量化</strong></p>
<p>对 KV-Cache 进行 INT8 量化：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV-Cache</mtext><mrow><mi>I</mi><mi>N</mi><mi>T</mi><mn>8</mn></mrow></msub><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>×</mo><msub><mtext>KV-Cache</mtext><mrow><mi>F</mi><mi>P</mi><mn>16</mn></mrow></msub></mrow><annotation encoding="application/x-tex">\\text{KV-Cache}_{INT8} = \\frac{1}{2} \\times \\text{KV-Cache}_{FP16}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV-Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">2</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV-Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">F</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mtight">16</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>策略三：滑动窗口注意力</strong></p>
<p>每个 Token 只 attend 到最近的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 个 Token：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>有效 KV-Cache</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mi>W</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{有效 KV-Cache} = 2 \\times W \\times n_{layers} \\times d_{head} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord cjk_fallback">有效</span><span class="mord"> KV-Cache</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span><p>对于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">W=4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>有效 KV-Cache</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mn>4096</mn><mo>×</mo><mn>32</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>1</mn><mtext> byte (INT8)</mtext><mo>=</mo><mn>33.5</mn><mtext> MB</mtext></mrow><annotation encoding="application/x-tex">\\text{有效 KV-Cache} = 2 \\times 4096 \\times 32 \\times 128 \\times 1 \\text{ byte (INT8)} = 33.5 \\text{ MB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord cjk_fallback">有效</span><span class="mord"> KV-Cache</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mord text"><span class="mord"> byte (INT8)</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">33.5</span><span class="mord text"><span class="mord"> MB</span></span></span></span></span></span><p>这是单卡完全可以容纳的！</p>
<p><strong>综合压缩效果</strong>：</p>
<table>
<thead>
<tr>
<th>技术</th>
<th>压缩比</th>
<th>累积压缩</th>
</tr>
</thead>
<tbody><tr>
<td>MQA</td>
<td>1/32</td>
<td>1/32</td>
</tr>
<tr>
<td>INT8 量化</td>
<td>1/2</td>
<td>1/64</td>
</tr>
<tr>
<td>滑动窗口(W=4096)</td>
<td>1/32</td>
<td>1/2048</td>
</tr>
</tbody></table>
<p>综合压缩后，128K 上下文的 KV-Cache 仅需 <strong>~33MB</strong>，可以在端侧设备上运行。</p>
<h3 id="4-3-csxwjd">4.3 长上下文精度</h3>
<p>尽管支持 128K，轻量模型的长上下文精度通常随长度衰减：</p>
<table>
<thead>
<tr>
<th>上下文长度</th>
<th>&quot;大海捞针&quot;准确率</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>8K</td>
<td>&gt;95%</td>
<td>高精度</td>
</tr>
<tr>
<td>32K</td>
<td>~90%</td>
<td>良好</td>
</tr>
<tr>
<td>64K</td>
<td>~80%</td>
<td>可接受</td>
</tr>
<tr>
<td>128K</td>
<td>~65-75%</td>
<td>衰减明显</td>
</tr>
</tbody></table>
<p>GPT-4o-mini 的 128K 更多是&quot;<strong>能处理</strong>&quot;而非&quot;<strong>高精度处理</strong>&quot;——适合长文档扫描和信息提取，但不适合需要精确关联的超长程推理。</p>
<h2 id="w-xnjzyjpdb">五、性能基准与竞品对比</h2>
<h3 id="5-1-xsjz">5.1 学术基准</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>GPT-4o-mini</th>
<th>GPT-3.5</th>
<th>Claude 3 Haiku</th>
<th>Gemini 1.5 Flash</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>82.0%</td>
<td>70.0%</td>
<td>75.2%</td>
<td>77.5%</td>
<td><strong>mini 领先</strong></td>
</tr>
<tr>
<td>HumanEval</td>
<td>87.2%</td>
<td>48.1%</td>
<td>75.9%</td>
<td>73.0%</td>
<td><strong>mini 领先</strong></td>
</tr>
<tr>
<td>MATH</td>
<td>70.2%</td>
<td>23.5%</td>
<td>40.9%</td>
<td>52.3%</td>
<td><strong>mini 领先</strong></td>
</tr>
<tr>
<td>HellaSwag</td>
<td>87.9%</td>
<td>85.5%</td>
<td>85.1%</td>
<td>87.5%</td>
<td>接近</td>
</tr>
<tr>
<td>MGSM</td>
<td>87.0%</td>
<td>57.0%</td>
<td>72.0%</td>
<td>78.5%</td>
<td><strong>mini 领先</strong></td>
</tr>
</tbody></table>
<p>GPT-4o-mini 在几乎所有基准上<strong>全面超越 GPT-3.5 和 Claude 3 Haiku</strong>，在部分基准上接近 Gemini 1.5 Flash。</p>
<h3 id="5-2-xjbfx">5.2 性价比分析</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>MMLU</th>
<th>输入价格/1M</th>
<th>MMLU/美元(每百万输入)</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4o-mini</td>
<td>82.0%</td>
<td>\$0.15</td>
<td><strong>546.7</strong></td>
</tr>
<tr>
<td>Claude 3 Haiku</td>
<td>75.2%</td>
<td>\$0.25</td>
<td>300.8</td>
</tr>
<tr>
<td>Gemini 1.5 Flash</td>
<td>77.5%</td>
<td>\$0.075</td>
<td>1033.3</td>
</tr>
<tr>
<td>GPT-3.5</td>
<td>70.0%</td>
<td>\$0.50</td>
<td>140.0</td>
</tr>
</tbody></table>
<p>GPT-4o-mini 的性价比是 GPT-3.5 的 <strong>3.9 倍</strong>，是 Claude 3 Haiku 的 <strong>1.8 倍</strong>。虽然 Gemini 1.5 Flash 的绝对性价比更高(得益于更低价格和 1M 上下文)，但 GPT-4o-mini 在编码和推理基准上表现更优。</p>
<h2 id="l-yycjydcbs">六、应用场景与端侧部署</h2>
<h3 id="6-1-hjyycj">6.1 黄金应用场景</h3>
<p><strong>场景一：AI 应用的基础设施</strong></p>
<ul>
<li>绝大多数应用的首选默认模型</li>
<li>简单问答、文本生成、信息提取</li>
<li>作为复杂系统的&quot;第一响应&quot;模型</li>
</ul>
<p><strong>场景二：实时交互应用</strong></p>
<ul>
<li>聊天机器人(低延迟需求)</li>
<li>语音助手(实时转录+响应)</li>
<li>客服系统(高并发处理)</li>
</ul>
<p><strong>场景三：嵌入式多模态</strong></p>
<ul>
<li>移动端图像描述</li>
<li>文档扫描 OCR</li>
<li>简单图表解读</li>
</ul>
<p><strong>场景四：批量数据处理</strong></p>
<ul>
<li>文本分类和标注</li>
<li>内容审核</li>
<li>数据清洗和格式化</li>
</ul>
<h3 id="6-2-dcbsdkhx">6.2 端侧部署的可行性</h3>
<p>GPT-4o-mini 的小规模使其成为<strong>端侧部署</strong>的有力候选：</p>
<p><strong>8B 模型的端侧资源需求</strong>：</p>
<table>
<thead>
<tr>
<th>设备类型</th>
<th>可用显存/内存</th>
<th>量化方案</th>
<th>可行性</th>
</tr>
</thead>
<tbody><tr>
<td>旗舰手机(16GB RAM)</td>
<td>~8GB 可用</td>
<td>INT4/INT8</td>
<td>✅ 可行</td>
</tr>
<tr>
<td>中端手机(8GB RAM)</td>
<td>~4GB 可用</td>
<td>INT4</td>
<td>⚠️ 勉强</td>
</tr>
<tr>
<td>笔记本(16GB RAM)</td>
<td>~12GB 可用</td>
<td>INT8/FP16</td>
<td>✅ 流畅</td>
</tr>
<tr>
<td>边缘设备(4GB RAM)</td>
<td>~2GB 可用</td>
<td>INT4 + 裁剪</td>
<td>❌ 困难</td>
</tr>
</tbody></table>
<p><strong>端侧优化的关键技术</strong>：</p>
<ol>
<li><p><strong>GGML/GGUF 量化</strong>：
将模型转换为 4-bit 或 5-bit 量化格式：</p>
<ul>
<li>Q4_K_M：4-bit 量化，~4GB 模型文件</li>
<li>Q5_K_M：5-bit 量化，~5GB 模型文件</li>
<li>Q8_0：8-bit 量化，~8GB 模型文件</li>
</ul>
</li>
<li><p><strong>MobileLLM 优化</strong>：</p>
<ul>
<li>嵌入层共享(Embedding Tying)</li>
<li>分组查询注意力(GQA)</li>
<li>SwiGLU 激活函数替代 ReLU</li>
<li>层共享(Layer Sharing)：相邻层共享参数</li>
</ul>
</li>
<li><p><strong>推理引擎</strong>：</p>
<ul>
<li>llama.cpp(C++ 实现，跨平台)</li>
<li>mlc-llm(移动端优化)</li>
<li>ONNX Runtime(通用部署)</li>
</ul>
</li>
</ol>
<p><strong>端侧部署示例</strong>：</p>
<pre><code class="language-bash"># 使用 llama.cpp 转换和运行
python convert_hf_to_gguf.py --outfile gpt-4o-mini-Q4_K_M.gguf --outtype Q4_K_M

# 运行推理
./main -m gpt-4o-mini-Q4_K_M.gguf -p &quot;What is the capital of France?&quot; -n 50
</code></pre>
<h3 id="6-3-ypg-gthzddcst">6.3 与苹果、高通合作的端侧生态</h3>
<p>OpenAI 已与苹果和芯片厂商展开端侧合作：</p>
<ul>
<li><strong>Apple Intelligence</strong>：GPT-4o-mini 可能作为 iPhone 端侧 AI 的后端模型</li>
<li><strong>高通骁龙</strong>：优化 8B 模型在 NPU 上的推理性能</li>
<li><strong>边缘计算</strong>：与云服务形成&quot;端-云协同&quot;架构</li>
</ul>
<pre><code>┌─────────────────────────────────────────┐
│  端侧(GPT-4o-mini 量化版)             │
│  → 简单查询、隐私敏感任务、离线场景       │
├─────────────────────────────────────────┤
│  云端(GPT-4o / o3)                     │
│  → 复杂推理、多模态生成、Agent 任务       │
└─────────────────────────────────────────┘
</code></pre>
<h2 id="q-jxxyzjsj">七、局限性与最佳实践</h2>
<h3 id="7-1-yzjx">7.1 已知局限</h3>
<ol>
<li><strong>复杂推理不足</strong>：在需要多步深度推理的任务上(如 AIME、高级数学证明)，表现不如 o3-mini 甚至 o1</li>
<li><strong>多模态质量</strong>：图像理解和生成的质量显著低于 GPT-4o</li>
<li><strong>长上下文精度衰减</strong>：128K 是&quot;容量&quot;而非&quot;精度&quot;——超长文档的关联准确率随长度下降</li>
<li><strong>知识截止</strong>：训练数据截止较早，对最新事件了解有限</li>
<li><strong>创造力边界</strong>：创意写作和开放式生成的多样性不如大模型</li>
</ol>
<h3 id="7-2-zjsj">7.2 最佳实践</h3>
<p><strong>适合使用 GPT-4o-mini 的场景</strong>：</p>
<ul>
<li>成本敏感型应用(大规模部署)</li>
<li>延迟敏感型应用(实时交互)</li>
<li>简单到中等复杂度的任务</li>
<li>多模态入门级应用</li>
<li>端侧/边缘部署</li>
</ul>
<p><strong>应升级到 GPT-4o 的场景</strong>：</p>
<ul>
<li>需要高质量多模态输出</li>
<li>复杂代码生成和调试</li>
<li>需要精确长上下文关联的任务</li>
<li>高质量创意写作</li>
</ul>
<p><strong>应切换到 o3-mini 的场景</strong>：</p>
<ul>
<li>数学和科学推理</li>
<li>竞赛编程</li>
<li>需要 Thinking Mode 的复杂问题</li>
</ul>
<h2 id="b-hyyxykyst">八、行业影响与开源生态</h2>
<h3 id="8-1-dqlmxscdzs">8.1 对轻量模型市场的重塑</h3>
<p>GPT-4o-mini 的发布重新定义了&quot;轻量模型&quot;的标准：</p>
<p><strong>发布前</strong>：</p>
<ul>
<li>轻量模型 = 能力较弱(GPT-3.5 级别)+ 价格便宜</li>
<li>多模态是旗舰模型的专属</li>
<li>128K 上下文是高端功能</li>
</ul>
<p><strong>发布后</strong>：</p>
<ul>
<li>轻量模型 = 能力接近旗舰 + 价格便宜</li>
<li>多模态成为标配</li>
<li>128K 上下文成为基础配置</li>
</ul>
<h3 id="8-2-kysqxy">8.2 开源社区响应</h3>
<p>GPT-4o-mini 刺激了开源轻量模型的发展：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数</th>
<th>特点</th>
<th>与 GPT-4o-mini 的关系</th>
</tr>
</thead>
<tbody><tr>
<td>Llama 3.1 8B</td>
<td>8B</td>
<td>开放权重，可商用</td>
<td>直接竞品</td>
</tr>
<tr>
<td>Qwen2.5 7B</td>
<td>7B</td>
<td>中文优化</td>
<td>区域竞品</td>
</tr>
<tr>
<td>Mistral 7B</td>
<td>7B</td>
<td>欧洲开源</td>
<td>早期竞品</td>
</tr>
<tr>
<td>Phi-3 mini</td>
<td>3.8B</td>
<td>微软轻量模型</td>
<td>更小替代</td>
</tr>
<tr>
<td>Gemma 2 9B</td>
<td>9B</td>
<td>Google 开源</td>
<td>生态竞品</td>
</tr>
</tbody></table>
<p>开源模型在<strong>可控性</strong>和<strong>隐私性</strong>上有优势，但 GPT-4o-mini 在<strong>易用性</strong>和<strong>生态系统</strong>上领先。</p>
<h3 id="8-3-dc-ai-djsq">8.3 端侧 AI 的加速器</h3>
<p>GPT-4o-mini 的小规模推动了端侧 AI 的发展：</p>
<ul>
<li>证明 8B 模型足以处理绝大多数日常任务</li>
<li>激励芯片厂商优化小模型推理(NPU、DSP)</li>
<li>推动&quot;端侧智能&quot;从概念走向产品</li>
</ul>
<h2 id="j-zj">九、总结</h2>
<p>GPT-4o-mini 代表了 OpenAI 在<strong>模型小型化</strong>方向上的集大成之作——它以 GPT-3.5 级别的价格，提供了接近 GPT-4 的能力，同时支持多模态和 128K 上下文。</p>
<p>核心技术创新：</p>
<ol>
<li><strong>从 MoE 到 Dense 的架构切换</strong>：放弃 MoE 的稀疏激活，采用 Dense Transformer 的确定性计算，降低推理复杂度和端侧部署门槛</li>
<li><strong>多层次知识蒸馏</strong>：Logits 级 + 特征级 + 多模态级的三重蒸馏，将 GPT-4o 的能力高效迁移到 8B 模型</li>
<li><strong>极致 KV-Cache 压缩</strong>：MQA + INT8 量化 + 滑动窗口的组合，使 128K 上下文在端侧可运行</li>
<li><strong>数据质量 &gt; 数据数量</strong>：通过严格的数据筛选，用更少的训练 Token 达到更高的训练效率</li>
</ol>
<p>GPT-4o-mini 的成功验证了<strong>小模型时代</strong>的来临——未来的 AI 应用生态将不是由少数几个超大模型主导，而是由大量专门化、高效、可部署的小模型组成。GPT-4o-mini 是这一趋势的先驱，也是 OpenAI 从&quot;模型提供商&quot;向&quot;基础设施提供商&quot;转型的关键一步。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxdwyfbbj","text":"一、模型定位与发布背景"},{"level":3,"id":"1-1-cpjzzdwz","text":"1.1 产品矩阵中的位置"},{"level":3,"id":"1-2-sccl-jwdj","text":"1.2 市场策略：降维打击"},{"level":2,"id":"e-mxysyzszldjssx","text":"二、模型压缩与知识蒸馏的技术实现"},{"level":3,"id":"2-1-c-gpt-4o-d-gpt-4o-mini-dyslj","text":"2.1 从 GPT-4o 到 GPT-4o-mini 的压缩路径"},{"level":3,"id":"2-2-dcczszl","text":"2.2 多层次知识蒸馏"},{"level":3,"id":"2-3-xlsjdzlsx","text":"2.3 训练数据的质量筛选"},{"level":2,"id":"s-dmtnldqlsx","text":"三、多模态能力的轻量实现"},{"level":3,"id":"3-1-sjljjg","text":"3.1 视觉理解架构"},{"level":3,"id":"3-2-dmtnldsjbx","text":"3.2 多模态能力的实际表现"},{"level":2,"id":"s-128k-sxwdjssx","text":"四、128K 上下文的技术实现"},{"level":3,"id":"4-1-qlmxdcsxwtz","text":"4.1 轻量模型的长上下文挑战"},{"level":3,"id":"4-2-kv-cache-yscl","text":"4.2 KV-Cache 压缩策略"},{"level":3,"id":"4-3-csxwjd","text":"4.3 长上下文精度"},{"level":2,"id":"w-xnjzyjpdb","text":"五、性能基准与竞品对比"},{"level":3,"id":"5-1-xsjz","text":"5.1 学术基准"},{"level":3,"id":"5-2-xjbfx","text":"5.2 性价比分析"},{"level":2,"id":"l-yycjydcbs","text":"六、应用场景与端侧部署"},{"level":3,"id":"6-1-hjyycj","text":"6.1 黄金应用场景"},{"level":3,"id":"6-2-dcbsdkhx","text":"6.2 端侧部署的可行性"},{"level":3,"id":"6-3-ypg-gthzddcst","text":"6.3 与苹果、高通合作的端侧生态"},{"level":2,"id":"q-jxxyzjsj","text":"七、局限性与最佳实践"},{"level":3,"id":"7-1-yzjx","text":"7.1 已知局限"},{"level":3,"id":"7-2-zjsj","text":"7.2 最佳实践"},{"level":2,"id":"b-hyyxykyst","text":"八、行业影响与开源生态"},{"level":3,"id":"8-1-dqlmxscdzs","text":"8.1 对轻量模型市场的重塑"},{"level":3,"id":"8-2-kysqxy","text":"8.2 开源社区响应"},{"level":3,"id":"8-3-dc-ai-djsq","text":"8.3 端侧 AI 的加速器"},{"level":2,"id":"j-zj","text":"九、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/10-gpt-4o-mini/05-10-gpt-4o-mini-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/10-gpt-4o-mini/05-10-gpt-4o-mini-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">10-GPT-4o-mini 核心技术专题：多模态小模型的成本极限与端侧部署探索</h1>
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
