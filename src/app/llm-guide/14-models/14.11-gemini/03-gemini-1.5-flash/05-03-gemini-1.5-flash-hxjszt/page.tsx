"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>03-Gemini-1.5-Flash 核心技术专题：百万上下文轻量模型的工程极致优化</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<h2 id="y-mxdwycpcl">一、模型定位与产品策略</h2>
<p>2024 年 5 月，Google DeepMind 在 I/O 大会上同时发布了 Gemini 1.5 Pro 和 Gemini 1.5 Flash。这一对&quot;双子星&quot;的发布策略揭示了 Google 对多模态大模型产品化的深刻理解：<strong>用同一个技术底座，通过差异化工程优化，覆盖不同成本-性能敏感度的用户群体</strong>。</p>
<h3 id="1-1-pro-vs-flash-nljzdb">1.1 Pro vs Flash：能力矩阵对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemini 1.5 Pro</th>
<th>Gemini 1.5 Flash</th>
<th>Flash/Pro 比值</th>
</tr>
</thead>
<tbody><tr>
<td>上下文窗口</td>
<td>1M tokens (2M exp)</td>
<td><strong>1M tokens</strong></td>
<td>1:1</td>
</tr>
<tr>
<td>推理速度</td>
<td>基准</td>
<td><strong>最高 10x</strong></td>
<td>10:1</td>
</tr>
<tr>
<td>输入价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.50</mn><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">3.50/1M tokens | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3.50/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.075/1M tokens**</td>
<td>1:47</td>
<td></td>
</tr>
<tr>
<td>输出价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10.50</mn><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">10.50/1M tokens | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">10.50/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.30/1M tokens**</td>
<td>1:35</td>
<td></td>
</tr>
<tr>
<td>MMLU</td>
<td>81.9%</td>
<td>77.5%</td>
<td>94.6%</td>
</tr>
<tr>
<td>多模态推理</td>
<td>强</td>
<td>中等</td>
<td>~80%</td>
</tr>
<tr>
<td>代码能力</td>
<td>强</td>
<td>中等</td>
<td>~75%</td>
</tr>
</tbody></table>
<p><strong>核心洞察</strong>：Flash 以 <strong>Pro 5% 的价格</strong>，实现了 <strong>Pro 80-95% 的能力</strong> 和 <strong>10 倍的速度</strong>。这种&quot;性价比极致化&quot;策略直接对标 OpenAI 的 GPT-4o-mini 和 GPT-4o 的梯度设计。</p>
<h3 id="1-2-quot-zlb-quot-hs-quot-xsb-quot">1.2 &quot;蒸馏版&quot;还是&quot;稀疏版&quot;？</h3>
<p>业界对 Flash 的实现方式有两种推测：</p>
<p><strong>模型蒸馏(Distillation)假说</strong>：</p>
<ul>
<li>用 1.5 Pro 作为教师模型，训练更小的学生模型</li>
<li>通过知识蒸馏将大模型的能力迁移到小模型</li>
<li>优势：学生模型可以独立运行，无需教师参与</li>
</ul>
<p><strong>专家稀疏化(Expert Sparsification)假说</strong>：</p>
<ul>
<li>与 Pro 共享相同的 MoE 架构和大部分参数</li>
<li>但限制每次前向传播激活的专家数量(如 Pro 激活 4-8 个专家，Flash 仅激活 1-2 个)</li>
<li>优势：开发成本低，可直接从 Pro 继承能力</li>
</ul>
<p><strong>Google 的实际方案</strong>：更可能是两者的混合——基于相同的 MoE 架构，但通过<strong>更激进的专家稀疏化</strong>和<strong>针对性蒸馏</strong>实现轻量化和加速。</p>
<h2 id="e-moe-xshdjzgc">二、MoE 稀疏化的极致工程</h2>
<h3 id="2-1-moe-jgdcbmx">2.1 MoE 架构的成本模型</h3>
<p>Gemini 系列采用 Mixture-of-Experts(MoE)架构，其推理成本由两部分组成：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>推理延迟</mtext><mo>=</mo><munder><munder><msub><mi>T</mi><mrow><mi>r</mi><mi>o</mi><mi>u</mi><mi>t</mi><mi>i</mi><mi>n</mi><mi>g</mi></mrow></msub><mo stretchy="true">⏟</mo></munder><mtext>路由计算</mtext></munder><mo>+</mo><munder><munder><mrow><msub><mi>T</mi><mrow><mi>e</mi><mi>x</mi><mi>p</mi><mi>e</mi><mi>r</mi><mi>t</mi></mrow></msub><mo>×</mo><msub><mi>N</mi><mrow><mi>a</mi><mi>c</mi><mi>t</mi><mi>i</mi><mi>v</mi><mi>e</mi></mrow></msub></mrow><mo stretchy="true">⏟</mo></munder><mtext>专家计算</mtext></munder></mrow><annotation encoding="application/x-tex">\\text{推理延迟} = \\underbrace{T_{routing}}_{\\text{路由计算}} + \\underbrace{T_{expert} \\times N_{active}}_{\\text{专家计算}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">推理延迟</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2958em;vertical-align:-1.6124em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span style="top:-1.3876em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">路由计算</span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span class="svg-align" style="top:-2.0659em;"><span class="pstrut" style="height:3em;"></span><span class="stretchy" style="height:0.548em;min-width:1.6em;"><span class="brace-left" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMinYMin slice"><path d="M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z"/></svg></span><span class="brace-center" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMidYMin slice"><path d="M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z"/></svg></span><span class="brace-right" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMaxYMin slice"><path d="M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z"/></svg></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">in</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9341em;"><span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.6124em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.2958em;vertical-align:-1.6124em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span style="top:-1.3876em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">专家计算</span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="minner munder"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6833em;"><span class="svg-align" style="top:-2.0659em;"><span class="pstrut" style="height:3em;"></span><span class="stretchy" style="height:0.548em;min-width:1.6em;"><span class="brace-left" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMinYMin slice"><path d="M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z"/></svg></span><span class="brace-center" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMidYMin slice"><path d="M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z"/></svg></span><span class="brace-right" style="height:0.548em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.548em" viewBox="0 0 400000 548" preserveAspectRatio="xMaxYMin slice"><path d="M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z"/></svg></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">x</span><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9341em;"><span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.6124em;"><span></span></span></span></span></span></span></span></span></span><p>其中：</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>T</mi><mrow><mi>r</mi><mi>o</mi><mi>u</mi><mi>t</mi><mi>i</mi><mi>n</mi><mi>g</mi></mrow></msub></mrow><annotation encoding="application/x-tex">T_{routing}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">in</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：门控网络计算每个 Token 应路由到哪些专家的时间</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>T</mi><mrow><mi>e</mi><mi>x</mi><mi>p</mi><mi>e</mi><mi>r</mi><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">T_{expert}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">x</span><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：单个专家的前向传播时间</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mrow><mi>a</mi><mi>c</mi><mi>t</mi><mi>i</mi><mi>v</mi><mi>e</mi></mrow></msub></mrow><annotation encoding="application/x-tex">N_{active}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：每个 Token 激活的专家数量</li>
</ul>
<p>对于 1.5 Pro，假设参数规模为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∼</mo></mrow><annotation encoding="application/x-tex">\\sim</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.3669em;"></span><span class="mrel">∼</span></span></span></span>1T(推测)，每次激活 4-8 个专家(每个专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∼</mo></mrow><annotation encoding="application/x-tex">\\sim</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.3669em;"></span><span class="mrel">∼</span></span></span></span>100B 参数)，则实际计算量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>400</mn><mi>B</mi></mrow><annotation encoding="application/x-tex">400B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">400</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span>-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>800</mn><mi>B</mi></mrow><annotation encoding="application/x-tex">800B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">800</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 参数。</p>
<h3 id="2-2-flash-dxshcl">2.2 Flash 的稀疏化策略</h3>
<p>Flash 可能采用了以下稀疏化手段：</p>
<p><strong>策略一：减少每 Token 激活专家数</strong></p>
<table>
<thead>
<tr>
<th>配置</th>
<th>每 Token 激活专家数</th>
<th>计算量(相对 Pro)</th>
<th>能力保留</th>
</tr>
</thead>
<tbody><tr>
<td>Pro</td>
<td>4-8</td>
<td>100%</td>
<td>100%</td>
</tr>
<tr>
<td>Flash-A</td>
<td>2-4</td>
<td>40-60%</td>
<td>85-90%</td>
</tr>
<tr>
<td>Flash-B</td>
<td>1-2</td>
<td>20-30%</td>
<td>70-80%</td>
</tr>
</tbody></table>
<p>Flash 的实际配置很可能在 Flash-A 和 Flash-B 之间，通过精细调优找到速度-质量的帕累托前沿。</p>
<p><strong>策略二：专家容量限制(Expert Capacity Factor)</strong></p>
<p>MoE 训练中，每个专家在一次 batch 中处理的 Token 数是有限制的：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Capacity</mtext><mi>i</mi></msub><mo>=</mo><mfrac><mrow><mtext>BatchSize</mtext><mo>×</mo><mtext>SeqLen</mtext></mrow><msub><mi>N</mi><mrow><mi>e</mi><mi>x</mi><mi>p</mi><mi>e</mi><mi>r</mi><mi>t</mi><mi>s</mi></mrow></msub></mfrac><mo>×</mo><mtext>CapacityFactor</mtext></mrow><annotation encoding="application/x-tex">\\text{Capacity}_i = \\frac{\\text{BatchSize} \\times \\text{SeqLen}}{N_{experts}} \\times \\text{CapacityFactor}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9275em;vertical-align:-0.2441em;"></span><span class="mord"><span class="mord text"><span class="mord">Capacity</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3435em;vertical-align:-0.9721em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">x</span><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">BatchSize</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">SeqLen</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">CapacityFactor</span></span></span></span></span></span><p>Flash 可能采用了<strong>更低的容量因子</strong>(如 1.0 而非 1.25)，迫使门控网络将 Token 更均匀地分配给专家，虽然可能增加部分 Token 的溢出(overflow)风险，但显著降低了峰值显存占用和计算不均衡。</p>
<p><strong>策略三：分层稀疏(Layer-wise Sparsity)</strong></p>
<p>并非所有 Transformer 层都需要相同的专家数量。Flash 可能在：</p>
<ul>
<li><strong>浅层</strong>：使用更多专家(捕捉低级特征)</li>
<li><strong>深层</strong>：使用更少专家(高级抽象已相对稳定)</li>
</ul>
<p>这种分层策略能在保持核心能力的同时最大化速度收益。</p>
<h3 id="2-3-mkwldjh">2.3 门控网络的简化</h3>
<p>MoE 的门控网络(Gating Network)负责决定每个 Token 路由到哪些专家。Pro 版本可能使用复杂的多层 MLP 门控：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>G</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>Softmax</mtext><mo stretchy="false">(</mo><mtext>TopK</mtext><mo stretchy="false">(</mo><msub><mi>W</mi><mi>g</mi></msub><mo>⋅</mo><mi>x</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">G(x) = \\text{Softmax}(\\text{TopK}(W_g \\cdot x))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">G</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">TopK</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">x</span><span class="mclose">))</span></span></span></span></span><p>Flash 可能简化为：</p>
<ul>
<li><strong>线性门控</strong>：单层线性变换，减少路由计算开销</li>
<li><strong>固定路由模式</strong>：对某些常见 Token 类型使用预计算的路由表</li>
<li><strong>专家合并</strong>：将语义相近的专家合并为&quot;超级专家&quot;，减少选择复杂度</li>
</ul>
<h3 id="2-4-y-switch-transformer-ddb">2.4 与 Switch Transformer 的对比</h3>
<p>Google 自己的 Switch Transformer 研究为 Flash 的设计提供了理论基础：</p>
<table>
<thead>
<tr>
<th>特性</th>
<th>Switch Transformer</th>
<th>Gemini 1.5 Flash(推测)</th>
</tr>
</thead>
<tbody><tr>
<td>每 Token 专家数</td>
<td>1(Top-1)</td>
<td>1-2(Top-1/2 混合)</td>
</tr>
<tr>
<td>容量因子</td>
<td>1.0</td>
<td>1.0-1.25</td>
</tr>
<tr>
<td>专家数量</td>
<td>2048</td>
<td>8-64(推测)</td>
</tr>
<tr>
<td>参数量</td>
<td>1.6T</td>
<td>~数百B(推测)</td>
</tr>
<tr>
<td>训练数据</td>
<td>C4</td>
<td>多模态混合数据</td>
</tr>
</tbody></table>
<p>Flash 可以被视为 Switch Transformer 理念在工业级产品中的实践——<strong>用极致稀疏化换取推理效率</strong>。</p>
<h2 id="s-csxw-1m-dqlsx">三、长上下文(1M)的轻量实现</h2>
<h3 id="3-1-csxwdcbbl">3.1 长上下文的成本悖论</h3>
<p>1M tokens 的上下文窗口在长文档分析、视频理解等场景极具价值，但也带来了严峻的成本挑战：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>推理成本</mtext><mo>∝</mo><msub><mi>N</mi><mrow><mi>i</mi><mi>n</mi><mi>p</mi><mi>u</mi><mi>t</mi></mrow></msub><mo>×</mo><mo stretchy="false">(</mo><msub><mi>N</mi><mrow><mi>i</mi><mi>n</mi><mi>p</mi><mi>u</mi><mi>t</mi></mrow></msub><mo>+</mo><msub><mi>N</mi><mrow><mi>o</mi><mi>u</mi><mi>t</mi><mi>p</mi><mi>u</mi><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{推理成本} \\propto N_{input} \\times (N_{input} + N_{output})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">推理成本</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∝</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">in</span><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">in</span><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">tp</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>对于 1M 输入 + 2K 输出的请求：</p>
<ul>
<li><strong>Prefill 阶段</strong>：需要处理 1M tokens 的输入，计算量巨大</li>
<li><strong>Decode 阶段</strong>：每次生成新 Token 都需要 attend 到 1M 的 KV-Cache</li>
</ul>
<p>Flash 的目标是在保持 1M 能力的同时，将这一成本控制在商业可行的范围内。</p>
<h3 id="3-2-kv-cache-djzys">3.2 KV-Cache 的极致压缩</h3>
<p>Flash 对 KV-Cache 可能采用了<strong>多级压缩策略</strong>：</p>
<p><strong>第一级：GQA/MQA 基础压缩</strong></p>
<p>标准 Multi-Head Attention(MHA)的 KV-Cache：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>M</mi><mi>H</mi><mi>A</mi></mrow></msub><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><mi>h</mi><mo>×</mo><msub><mi>d</mi><mi>h</mi></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV}_{MHA} = 2 \\times L \\times h \\times d_h \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span><p>Grouped-Query Attention(GQA)将查询头分组共享 KV：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>G</mi><mi>Q</mi><mi>A</mi></mrow></msub><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><mfrac><mi>h</mi><mi>g</mi></mfrac><mo>×</mo><msub><mi>d</mi><mi>h</mi></msub><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV}_{GQA} = 2 \\times L \\times \\frac{h}{g} \\times d_h \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">GQ</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.2519em;vertical-align:-0.8804em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 为分组数。对于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi><mo>=</mo><mn>32</mn><mo separator="true">,</mo><mi>g</mi><mo>=</mo><mn>4</mn></mrow><annotation encoding="application/x-tex">h=32, g=4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">32</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4</span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>压缩比</mtext><mo>=</mo><mfrac><msub><mtext>KV</mtext><mrow><mi>G</mi><mi>Q</mi><mi>A</mi></mrow></msub><msub><mtext>KV</mtext><mrow><mi>M</mi><mi>H</mi><mi>A</mi></mrow></msub></mfrac><mo>=</mo><mfrac><mn>1</mn><mi>g</mi></mfrac><mo>=</mo><mfrac><mn>1</mn><mn>4</mn></mfrac><mo>=</mo><mn>25</mn><mi mathvariant="normal">%</mi></mrow><annotation encoding="application/x-tex">\\text{压缩比} = \\frac{\\text{KV}_{GQA}}{\\text{KV}_{MHA}} = \\frac{1}{g} = \\frac{1}{4} = 25\\%</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">压缩比</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1963em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">M</span><span class="mord mathnormal mtight" style="margin-right:0.0813em;">H</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">GQ</span><span class="mord mathnormal mtight">A</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2019em;vertical-align:-0.8804em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">4</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8056em;vertical-align:-0.0556em;"></span><span class="mord">25%</span></span></span></span></span><p><strong>第二级：动态量化</strong></p>
<p>对 KV-Cache 进行 INT8 甚至 INT4 量化：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>I</mi><mi>N</mi><mi>T</mi><mn>8</mn></mrow></msub><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>×</mo><msub><mtext>KV</mtext><mrow><mi>F</mi><mi>P</mi><mn>16</mn></mrow></msub></mrow><annotation encoding="application/x-tex">\\text{KV}_{INT8} = \\frac{1}{2} \\times \\text{KV}_{FP16}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">2</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">F</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mtight">16</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV</mtext><mrow><mi>I</mi><mi>N</mi><mi>T</mi><mn>4</mn></mrow></msub><mo>=</mo><mfrac><mn>1</mn><mn>4</mn></mfrac><mo>×</mo><msub><mtext>KV</mtext><mrow><mi>F</mi><mi>P</mi><mn>16</mn></mrow></msub></mrow><annotation encoding="application/x-tex">\\text{KV}_{INT4} = \\frac{1}{4} \\times \\text{KV}_{FP16}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span><span class="mord mtight">4</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">4</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">F</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mtight">16</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>1M tokens × INT4 KV-Cache 可将显存从数十 GB 降到数 GB，使单卡推理成为可能。</p>
<p><strong>第三级：Token 压缩/摘要</strong></p>
<p>对于超长文档，Flash 可能在内部执行<strong>隐式摘要</strong>：</p>
<ul>
<li>将文档分块处理，每块生成压缩表示</li>
<li>只保留关键块的全精度 KV-Cache</li>
<li>次要块使用压缩表示或甚至丢弃</li>
</ul>
<p>这类似于 RAG 的思路，但在模型内部自动完成，对用户透明。</p>
<h3 id="3-3-zyljsdjs">3.3 注意力计算的近似</h3>
<p>对于 1M 序列，精确 Attention 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度不可接受。Flash 可能采用：</p>
<p><strong>局部-全局混合注意力(Local-Global Hybrid)</strong>：</p>
<ul>
<li><strong>局部窗口</strong>：每个 Token 只 attend 到附近的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 个 Token(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo>×</mo><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N \\times W)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span></span></span></span>)</li>
<li><strong>全局聚合</strong>：少量特殊 Token(如 [CLS]、段落标记)可以 attend 到全部序列(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo>×</mo><mi>G</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N \\times G)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">G</span><span class="mclose">)</span></span></span></span>)</li>
<li>总复杂度：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo>×</mo><mo stretchy="false">(</mo><mi>W</mi><mo>+</mo><mi>G</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N \\times (W + G))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">G</span><span class="mclose">))</span></span></span></span>，远低于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></li>
</ul>
<p><strong>线性注意力(Linear Attention)近似</strong>：
将 Softmax Attention 替换为核函数的线性近似：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>≈</mo><mi>ϕ</mi><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo>⋅</mo><mo stretchy="false">(</mo><mi>ϕ</mi><mo stretchy="false">(</mo><mi>K</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup><mo>⋅</mo><mi>V</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) \\approx \\phi(Q) \\cdot (\\phi(K)^T \\cdot V)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">ϕ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϕ</mi></mrow><annotation encoding="application/x-tex">\\phi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">ϕ</span></span></span></span> 为特征映射函数。这样可以将复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2 d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>。</p>
<h3 id="3-4-srdjcldgchy">3.4 输入定价策略的工程含义</h3>
<p>Flash 的输入定价为 \$0.075/1M tokens(Pro 的 1/47)，这一极低的定价暗示了其推理系统的高度优化：</p>
<ol>
<li><strong>Prompt Caching</strong>：重复的系统提示和用户上下文可以被缓存复用</li>
<li><strong>Prefix Sharing</strong>：多个请求共享相同前缀的 KV-Cache，只计算增量部分</li>
<li><strong>Batch Processing</strong>：高并发场景下，批量处理摊薄单次请求成本</li>
<li><strong>硬件效率</strong>：TPU v5p 的高效利用，单位算力成本降低</li>
</ol>
<h2 id="s-dmtnldqs">四、多模态能力的取舍</h2>
<h3 id="4-1-tydmtjgdcb">4.1 统一多模态架构的成本</h3>
<p>Gemini 系列的核心优势是<strong>原生多模态</strong>——图像、音频、视频都编码为统一 Token 空间中的 Token。但这意味着：</p>
<ul>
<li>视觉 Token 数量巨大：一张 1024×1024 图像可能需要 256-1024 个 Token</li>
<li>视频序列更长：1 分钟视频(30fps)= 1800 帧 × 每帧 Token 数</li>
</ul>
<p>Flash 在多模态处理上的策略可能是：</p>
<p><strong>策略一：降采样</strong></p>
<ul>
<li>使用更低分辨率的视觉编码器(如 256×256 而非 1024×1024)</li>
<li>视频帧率降采样(如 1fps 而非 30fps)</li>
<li>音频采样率降低</li>
</ul>
<p><strong>策略二：早期融合+晚期压缩</strong></p>
<ul>
<li>浅层使用完整多模态特征</li>
<li>深层对多模态特征进行压缩和筛选</li>
<li>只保留与当前生成最相关的多模态信息</li>
</ul>
<h3 id="4-2-y-pro-ddmtnlcj">4.2 与 Pro 的多模态能力差距</h3>
<table>
<thead>
<tr>
<th>任务类型</th>
<th>1.5 Pro</th>
<th>1.5 Flash</th>
<th>差距原因</th>
</tr>
</thead>
<tbody><tr>
<td>单图理解</td>
<td>强</td>
<td>中等</td>
<td>视觉编码器规模较小</td>
</tr>
<tr>
<td>多图对比</td>
<td>强</td>
<td>中等</td>
<td>跨图像注意力计算受限</td>
</tr>
<tr>
<td>长视频分析</td>
<td>强</td>
<td>弱</td>
<td>视频 Token 压缩更激进</td>
</tr>
<tr>
<td>文档 OCR</td>
<td>强</td>
<td>中等</td>
<td>高分辨率处理能力下降</td>
</tr>
<tr>
<td>音频理解</td>
<td>强</td>
<td>中等</td>
<td>音频编码器简化</td>
</tr>
</tbody></table>
<p>Flash 的多模态能力虽然不及 Pro，但对于大多数日常应用场景(单图问答、短视频分析、语音转文字)仍然足够。</p>
<h2 id="w-yycjyzjsj">五、应用场景与最佳实践</h2>
<h3 id="5-1-flash-dhjcj">5.1 Flash 的黄金场景</h3>
<p><strong>场景一：高并发聊天机器人</strong></p>
<ul>
<li>同时服务数千用户</li>
<li>对话长度通常 &lt; 10K tokens</li>
<li>Flash 的低延迟和高吞吐量完美匹配</li>
</ul>
<p><strong>场景二：批量文档处理</strong></p>
<ul>
<li>一次性处理数万份文档</li>
<li>每份文档提取关键信息</li>
<li>Flash 的低价使批量处理成本可接受</li>
</ul>
<p><strong>场景三：实时翻译与摘要</strong></p>
<ul>
<li>会议实时转录+翻译</li>
<li>新闻流实时摘要</li>
<li>Flash 的速度优势至关重要</li>
</ul>
<p><strong>场景四：A/B 测试与原型开发</strong></p>
<ul>
<li>快速验证产品想法</li>
<li>低成本试错</li>
<li>验证后升级到 Pro 获取更高质量</li>
</ul>
<h3 id="5-2-bjysy-flash-dcj">5.2 不建议使用 Flash 的场景</h3>
<ul>
<li><strong>复杂代码生成</strong>：需要深层推理和调试</li>
<li><strong>数学/科学证明</strong>：需要精确的逐步推理</li>
<li><strong>多步骤 Agent 任务</strong>：需要高可靠性的工具调用</li>
<li><strong>创意写作</strong>：需要高质量的文本生成</li>
</ul>
<h3 id="5-3-yjpdxjbdb">5.3 与竞品的性价比对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>输入价格/1M</th>
<th>输出价格/1M</th>
<th>上下文</th>
<th>质量评级</th>
</tr>
</thead>
<tbody><tr>
<td>Gemini 1.5 Flash</td>
<td><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.075</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">0.075** | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.075</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.30</strong></td>
<td>1M</td>
<td>B+</td>
<td></td>
</tr>
<tr>
<td>GPT-4o-mini</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15∣</span></span></span></span>0.60</td>
<td>128K</td>
<td>B+</td>
<td></td>
</tr>
<tr>
<td>Claude 3 Haiku</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.25</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.25 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.25∣</span></span></span></span>1.25</td>
<td>200K</td>
<td>B</td>
<td></td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.50</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">3.50 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">3.50∣</span></span></span></span>10.50</td>
<td>1M</td>
<td>A</td>
<td></td>
</tr>
<tr>
<td>GPT-4o</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2.50</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">2.50 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2.50∣</span></span></span></span>10.00</td>
<td>128K</td>
<td>A</td>
<td></td>
</tr>
</tbody></table>
<p>Flash 在<strong>性价比</strong>维度上具有明显优势：比 GPT-4o-mini 便宜 50%，上下文大 8 倍。</p>
<h2 id="l-xlyhxlyh">六、训练与后训练优化</h2>
<h3 id="6-1-c-pro-d-flash-dzsqy">6.1 从 Pro 到 Flash 的知识迁移</h3>
<p>Flash 的训练流程可能包括：</p>
<ol>
<li><strong>预训练</strong>：使用与 Pro 相同的数据混合，但可能减少重复轮次或过滤低质量数据</li>
<li><strong>知识蒸馏</strong>：用 Pro 的输出来训练 Flash，特别是：<ul>
<li>使用 Pro 的软标签(soft labels)而非硬标签(hard labels)</li>
<li>中间层特征蒸馏(hidden state distillation)</li>
<li>注意力模式蒸馏(attention distillation)</li>
</ul>
</li>
<li><strong>指令微调</strong>：在相同的指令数据集上微调，但可能使用更短的响应</li>
<li><strong>RLHF 对齐</strong>：使用相同的奖励模型，但优化目标加入延迟约束</li>
</ol>
<h3 id="6-2-sjkcsj">6.2 数据课程设计</h3>
<p>Flash 作为轻量模型，可能采用了<strong>更严格的数据筛选</strong>：</p>
<ul>
<li>过滤重复和低信息量的数据</li>
<li>优先保留高质量、多样性强的样本</li>
<li>减少训练数据总量，但提升数据质量</li>
</ul>
<p>这基于&quot;<strong>数据质量 &gt; 数据数量</strong>&quot;的研究发现：小模型在高质量数据上的表现可以接近大模型在大量低质量数据上的表现。</p>
<h2 id="q-jxxyhxyj">七、局限性与后续演进</h2>
<h3 id="7-1-yzjx">7.1 已知局限</h3>
<ol>
<li><strong>推理深度不足</strong>：由于专家稀疏化，复杂推理链(如多步数学证明)容易出错</li>
<li><strong>创造力受限</strong>：文本生成的多样性和新颖性不如 Pro</li>
<li><strong>长上下文精度衰减</strong>：虽然支持 1M，但在极端长度下&quot;大海捞针&quot;准确率低于 Pro</li>
<li><strong>多模态压缩损失</strong>：视频和长文档理解能力受压缩策略影响</li>
</ol>
<h3 id="7-2-x-2-0-flash-dyj">7.2 向 2.0 Flash 的演进</h3>
<p>Gemini 2.0 Flash(2024年12月)在 1.5 Flash 基础上实现了质的飞跃：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>1.5 Flash</th>
<th>2.0 Flash</th>
<th>演进</th>
</tr>
</thead>
<tbody><tr>
<td>上下文</td>
<td>1M</td>
<td>1M</td>
<td>保持</td>
</tr>
<tr>
<td>多模态输出</td>
<td>仅文本</td>
<td><strong>图像+音频+文本</strong></td>
<td>质变</td>
</tr>
<tr>
<td>Agentic 能力</td>
<td>函数调用</td>
<td><strong>原生智能体</strong></td>
<td>升级</td>
</tr>
<tr>
<td>速度</td>
<td>10x Pro</td>
<td><strong>2x 1.5 Pro</strong></td>
<td>新基准</td>
</tr>
<tr>
<td>价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.075</mn><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">0.075 | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.075∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.075**</td>
<td>保持</td>
<td></td>
</tr>
</tbody></table>
<p>2.0 Flash 继承了 1.5 Flash 的极致性价比哲学，同时补全了多模态输出和 Agentic 能力的短板，成为 Google AI 的主力工作模型。</p>
<h2 id="b-zj">八、总结</h2>
<p>Gemini 1.5 Flash 代表了大模型<strong>工程优化</strong>的极致——在保持核心技术架构(MoE、原生多模态、1M 上下文)不变的前提下，通过<strong>专家稀疏化、KV-Cache 压缩、注意力近似</strong>等手段，将推理成本降低了一个数量级。</p>
<p>其核心启示在于：</p>
<ol>
<li><strong>稀疏化是效率的关键</strong>：MoE 架构天然适合稀疏化，Flash 展示了如何通过精细控制激活专家数来调节速度-质量曲线</li>
<li><strong>长上下文需要系统级优化</strong>：1M 上下文不仅是算法问题，更是 KV-Cache 管理、注意力计算、批处理策略的系统工程</li>
<li><strong>价格即产品</strong>：\$0.075/1M 的定价使大模型从&quot;实验工具&quot;变为&quot;基础设施&quot;，开启了真正的规模化应用</li>
<li><strong>梯度的艺术</strong>：Pro-Flash 的产品梯度为行业树立了标杆——同一架构，不同配置，覆盖不同需求</li>
</ol>
<p>1.5 Flash 的成功为后续的 2.0 Flash 和整个 Gemini Flash 系列奠定了产品哲学基础：<strong>以用户场景为导向，用工程创新实现成本革命</strong>。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxdwycpcl","text":"一、模型定位与产品策略"},{"level":3,"id":"1-1-pro-vs-flash-nljzdb","text":"1.1 Pro vs Flash：能力矩阵对比"},{"level":3,"id":"1-2-quot-zlb-quot-hs-quot-xsb-quot","text":"1.2 &quot;蒸馏版&quot;还是&quot;稀疏版&quot;？"},{"level":2,"id":"e-moe-xshdjzgc","text":"二、MoE 稀疏化的极致工程"},{"level":3,"id":"2-1-moe-jgdcbmx","text":"2.1 MoE 架构的成本模型"},{"level":3,"id":"2-2-flash-dxshcl","text":"2.2 Flash 的稀疏化策略"},{"level":3,"id":"2-3-mkwldjh","text":"2.3 门控网络的简化"},{"level":3,"id":"2-4-y-switch-transformer-ddb","text":"2.4 与 Switch Transformer 的对比"},{"level":2,"id":"s-csxw-1m-dqlsx","text":"三、长上下文(1M)的轻量实现"},{"level":3,"id":"3-1-csxwdcbbl","text":"3.1 长上下文的成本悖论"},{"level":3,"id":"3-2-kv-cache-djzys","text":"3.2 KV-Cache 的极致压缩"},{"level":3,"id":"3-3-zyljsdjs","text":"3.3 注意力计算的近似"},{"level":3,"id":"3-4-srdjcldgchy","text":"3.4 输入定价策略的工程含义"},{"level":2,"id":"s-dmtnldqs","text":"四、多模态能力的取舍"},{"level":3,"id":"4-1-tydmtjgdcb","text":"4.1 统一多模态架构的成本"},{"level":3,"id":"4-2-y-pro-ddmtnlcj","text":"4.2 与 Pro 的多模态能力差距"},{"level":2,"id":"w-yycjyzjsj","text":"五、应用场景与最佳实践"},{"level":3,"id":"5-1-flash-dhjcj","text":"5.1 Flash 的黄金场景"},{"level":3,"id":"5-2-bjysy-flash-dcj","text":"5.2 不建议使用 Flash 的场景"},{"level":3,"id":"5-3-yjpdxjbdb","text":"5.3 与竞品的性价比对比"},{"level":2,"id":"l-xlyhxlyh","text":"六、训练与后训练优化"},{"level":3,"id":"6-1-c-pro-d-flash-dzsqy","text":"6.1 从 Pro 到 Flash 的知识迁移"},{"level":3,"id":"6-2-sjkcsj","text":"6.2 数据课程设计"},{"level":2,"id":"q-jxxyhxyj","text":"七、局限性与后续演进"},{"level":3,"id":"7-1-yzjx","text":"7.1 已知局限"},{"level":3,"id":"7-2-x-2-0-flash-dyj","text":"7.2 向 2.0 Flash 的演进"},{"level":2,"id":"b-zj","text":"八、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/03-gemini-1.5-flash/05-03-gemini-1.5-flash-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/03-gemini-1.5-flash/05-03-gemini-1.5-flash-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">03-Gemini-1.5-Flash 核心技术专题：百万上下文轻量模型的工程极致优化</h1>
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
