"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step 3.5 Flash Agentic 低延迟设计与可扩展 RL 框架剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: Step 3.5 Flash Technical Report (arXiv:2602.10604)
<strong>剖析角度</strong>: Agentic 低延迟架构、S3F1 混合注意力、MIS-PO RL、训练稳定性诊断
<strong>面向读者</strong>: 已阅读 Step 3.5 Flash 技术报告精译,希望深入理解 Agentic 场景优化与 RL 训练框架的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-hxdw-agentic-sdddswd">1. 核心定位:Agentic 时代的第三维度</h2>
<p>Step 3.5 Flash 将<strong>推理延迟</strong>提升为与「智能&quot;和「成本&quot;并列的第三大约束.在交互式 agentic 工作流中,延迟直接决定任务完成的 wall-clock 时间;在固定时间预算下,更低的延迟意味着可通过 test-time scaling 投入更多推理步数换取更高智能.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">传统模型设计</th>
<th align="left">Step 3.5 Flash</th>
</tr>
</thead>
<tbody><tr>
<td align="left">优化目标</td>
<td align="left">智能 + 成本</td>
<td align="left"><strong>智能 + 成本 + 延迟</strong></td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">全注意力或线性注意力</td>
<td align="left"><strong>S3F1 混合滑动窗口</strong></td>
</tr>
<tr>
<td align="left">MoE 负载均衡</td>
<td align="left">无损失全局均衡</td>
<td align="left"><strong>EP-Group 秩级均衡</strong></td>
</tr>
<tr>
<td align="left">解码加速</td>
<td align="left">纯自回归</td>
<td align="left"><strong>MTP-3 投机解码</strong></td>
</tr>
<tr>
<td align="left">RL 框架</td>
<td align="left">PPO/GRPO</td>
<td align="left"><strong>MIS-PO 稳定优化</strong></td>
</tr>
</tbody></table>
<hr>
<h2 id="2-s3f1-hhzyl-jhmfdwc">2. S3F1 混合注意力:近乎免费的午餐</h2>
<h3 id="2-1-sjdj">2.1 设计动机</h3>
<p>Agentic 工作负载的特征是「大量上下文预填充后接 prolonged 多轮交互解码&quot;.全注意力的二次复杂度在长上下文预填充时成为瓶颈,而纯滑动窗口注意力(SWA)会损失长程依赖.</p>
<p>Step 3.5 Flash 采用 <strong>3:1 的 SWA 与全注意力交错比例(S3F1)</strong>:三层 SWA 层(W=512)后接一层全 GQA-8 层.</p>
<table>
<thead>
<tr>
<th align="left">布局</th>
<th align="center">相对 FLOPs(解码)</th>
<th align="center">相对 FLOPs(预填充)</th>
<th align="center">预训练 Avg</th>
<th align="center">LongCtx</th>
</tr>
</thead>
<tbody><tr>
<td align="left">FFFF(全注意力)</td>
<td align="center">~2.68</td>
<td align="center">~2.90</td>
<td align="center">54.1</td>
<td align="center"><strong>28.8</strong></td>
</tr>
<tr>
<td align="left">S1F1(交替)</td>
<td align="center">~1.58</td>
<td align="center">~1.65</td>
<td align="center">54.6</td>
<td align="center"><strong>29.6</strong></td>
</tr>
<tr>
<td align="left">S3F1(朴素)</td>
<td align="center"><strong>1.00</strong></td>
<td align="center"><strong>1.00</strong></td>
<td align="center">53.6</td>
<td align="center">27.5</td>
</tr>
<tr>
<td align="left"><strong>S3F1+Head</strong></td>
<td align="center"><strong>~1.01</strong></td>
<td align="center"><strong>~1.02</strong></td>
<td align="center"><strong>55.7</strong></td>
<td align="center">28.2</td>
</tr>
</tbody></table>
<h3 id="2-2-bccl-query-head-kz-head-wise-gating">2.2 补偿策略:Query-Head 扩展 + Head-wise Gating</h3>
<p>朴素 S3F1 虽然 FLOPs 最低,但质量有退化.两项互补增强弥合了差距:</p>
<p><strong>增加 SWA Query-Head 数</strong>:从 64 提升到 96.这是「近乎免费的午餐&quot;——SWA 本身的 overhead 很小,扩展 head 数增加的计算可忽略,但有效缓解了性能下降.</p>
<p><strong>Head-wise Gated Attention</strong>:引入数据依赖的 sink token,替代固定 sink token:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>g</mi><mi>i</mi></msub><mo>=</mo><mtext>sigmoid</mtext><mo stretchy="false">(</mo><msubsup><mi>w</mi><mtext>gate</mtext><mi>T</mi></msubsup><mo>⋅</mo><msub><mi>x</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mspace width="1em"/><msubsup><mi>o</mi><mi>i</mi><mtext>gate</mtext></msubsup><mo>=</mo><msub><mi>g</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>y</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">g_i = \\text{sigmoid}(w_{\\text{gate}}^T \\cdot x_i), \\quad o^{\\text{gate}}_i = g_i \\cdot y_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2744em;vertical-align:-0.3831em;"></span><span class="mord text"><span class="mord">sigmoid</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">gate</span></span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9115em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">gate</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><table>
<thead>
<tr>
<th align="left">方法</th>
<th align="center">BBH</th>
<th align="center">MMLU</th>
<th align="center">GPQA</th>
<th align="center">MBPP</th>
<th align="center">平均</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Sink Token</td>
<td align="center">70.6</td>
<td align="center">65.1</td>
<td align="center">27.2</td>
<td align="center">61.2</td>
<td align="center">62.5</td>
</tr>
<tr>
<td align="left"><strong>Head-wise Gate</strong></td>
<td align="center"><strong>73.7</strong></td>
<td align="center"><strong>67.0</strong></td>
<td align="center"><strong>28.1</strong></td>
<td align="center"><strong>62.6</strong></td>
<td align="center"><strong>64.4</strong></td>
</tr>
</tbody></table>
<p>Head-wise gating 对理论 FLOPs 与实际延迟均可忽略,但持续提升质量(+1.97).</p>
<h3 id="2-3-wsmbsxxzyl">2.3 为什么不是线性注意力?</h3>
<p>Step 3.5 Flash 明确选择了 SWA 而非线性注意力:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">线性注意力</th>
<th align="left">SWA</th>
</tr>
</thead>
<tbody><tr>
<td align="left">投机解码兼容性</td>
<td align="left">状态更新机制复杂化 draft tree</td>
<td align="left"><strong>KV masking 天然支持并行验证</strong></td>
</tr>
<tr>
<td align="left">长上下文建模</td>
<td align="left">有潜力,但缺乏稳健实证</td>
<td align="left">已被广泛验证</td>
</tr>
<tr>
<td align="left">工程复杂度</td>
<td align="left">需要定制内核</td>
<td align="left">标准 FlashAttention 支持</td>
</tr>
</tbody></table>
<p>在「没有稳健实证表明线性注意力在 agentic 长上下文建模上更优&quot;的前提下,SWA 是更务实的选择.</p>
<hr>
<h2 id="3-ep-group-ph-xcfbsbszd-straggler">3. EP-Group 平衡:消除分布式部署中的 Straggler</h2>
<h3 id="3-1-wt-qjjhbdyjbjh">3.1 问题:全局均衡不等于局部均衡</h3>
<p>无损失负载均衡(loss-free load balancing)鼓励全局 token 在专家间平衡,但不能保证微批次级别 EP 秩间的负载平衡.token 分配倾斜将工作负载集中在少数专家及其承载 GPU 上,在同步点扼制吞吐量.</p>
<h3 id="3-2-ep-group-phss">3.2 EP-Group 平衡损失</h3>
<p>将专家集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi></mrow><annotation encoding="application/x-tex">E</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span></span></span></span> 划分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 个不相交组,对 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">S_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示 Top-K 专家, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>p</mi><mrow><mi>t</mi><mo separator="true">,</mo><mo>⋅</mo></mrow></msub></mrow><annotation encoding="application/x-tex">p_{t,\\cdot}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mtight">⋅</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 为路由概率:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>p</mi><mi>e</mi></msub><mo>=</mo><mfrac><mn>1</mn><mi>T</mi></mfrac><munder><mo>∑</mo><mi>t</mi></munder><msub><mi>p</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>e</mi></mrow></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>f</mi><mi>e</mi></msub><mo>=</mo><mfrac><mn>1</mn><mrow><mi>T</mi><mi>K</mi></mrow></mfrac><munder><mo>∑</mo><mi>t</mi></munder><msub><mi>s</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>e</mi></mrow></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>p</mi><mi>g</mi></msub><mo>=</mo><munder><mo>∑</mo><mrow><mi>e</mi><mo>∈</mo><msub><mi>E</mi><mi>g</mi></msub></mrow></munder><msub><mi>p</mi><mi>e</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>f</mi><mi>g</mi></msub><mo>=</mo><munder><mo>∑</mo><mrow><mi>e</mi><mo>∈</mo><msub><mi>E</mi><mi>g</mi></msub></mrow></munder><msub><mi>f</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">p_e = \\frac{1}{T}\\sum_t p_{t,e}, \\quad f_e = \\frac{1}{TK}\\sum_t s_{t,e}, \\quad p_g = \\sum_{e \\in E_g} p_e, \\quad f_g = \\sum_{e \\in E_g} f_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5714em;vertical-align:-1.25em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.9em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.25em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5714em;vertical-align:-1.25em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.9em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.25em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5417em;vertical-align:-1.4917em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8557em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mrel mtight">∈</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4917em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5417em;vertical-align:-1.4917em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8557em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mrel mtight">∈</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4917em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>L</mi><mtext>EP</mtext></msub><mo>=</mo><mi>G</mi><mo>×</mo><munderover><mo>∑</mo><mrow><mi>g</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><msub><mi>f</mi><mi>g</mi></msub><mo>×</mo><msub><mi>p</mi><mi>g</mi></msub></mrow><annotation encoding="application/x-tex">L_{\\text{EP}} = G \\times \\sum_{g=1}^G f_g \\times p_g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">EP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.2316em;vertical-align:-1.4032em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4032em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><blockquote>
<p><strong>关键洞察</strong>: EP-Group 平衡不要求每个专家的 token 绝对均匀,而是要求每个 EP 组的负载与路由概率乘积之和均匀.这比简单的 per-expert balance 更能直接消除 straggler,因为 straggler 的根源是 rank 级别的负载不均而非专家级别的.</p>
</blockquote>
<hr>
<h2 id="4-mtp-3-qltjjm">4. MTP-3:轻量投机解码</h2>
<h3 id="4-1-sjys">4.1 设计约束</h3>
<p>为保持投机轻量,MTP 头利用 SWA 和稠密 FFN 精简设计:</p>
<ul>
<li>仅增加 0.81B 参数(约 0.41%)</li>
<li>每个 MTP 头由 SWA + 稠密 FFN 组成</li>
<li>基于位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 的骨干隐藏状态预测 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mrow><mi>t</mi><mo>+</mo><mn>1</mn><mo>+</mo><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">x_{t+1+h}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">+</span><span class="mord mtight">1</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span></span>(h in {1,2,3})</li>
</ul>
<h3 id="4-2-xlcl">4.2 训练策略</h3>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">MTP 激活</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">骨干训练</td>
<td align="left">仅 MTP-1</td>
<td align="left">控制训练开销</td>
</tr>
<tr>
<td align="left">轻量后训练</td>
<td align="left">MTP-1/2/3 联合</td>
<td align="left">从 MTP-1 初始化</td>
</tr>
</tbody></table>
<p><strong>位置依赖的损失重加权</strong>:防止对远端 token 预测的过度优化.</p>
<hr>
<h2 id="5-mis-po-kkz-rl-kj">5. MIS-PO:可扩展 RL 框架</h2>
<h3 id="5-1-wt-ct-rl-dgtdfc">5.1 问题:传统 RL 的高梯度方差</h3>
<p>LLM 的 RL 优化面临严重不稳定性,源于:</p>
<ul>
<li><strong>基础设施差异</strong>:高吞吐推理引擎与训练框架之间的不匹配</li>
<li><strong>Off-policy 错位</strong>:重要性采样因微小 token 级概率偏移累积为噪声梯度</li>
</ul>
<h3 id="5-2-metropolis-independence-sampling-gl">5.2 Metropolis Independence Sampling 过滤</h3>
<p>MIS-PO 将推理策略视为提议分布,训练策略视为目标,限制更新至与目标分布足够接近的样本.</p>
<p>与重要性采样的关键区别:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">重要性采样(PPO)</th>
<th align="left">MIS-PO</th>
</tr>
</thead>
<tbody><tr>
<td align="left">梯度控制</td>
<td align="left">有界比率缩放</td>
<td align="left"><strong>二元掩码过滤 off-distribution 样本</strong></td>
</tr>
<tr>
<td align="left">方差</td>
<td align="left">高(受离群样本影响)</td>
<td align="left"><strong>低(只保留有效样本)</strong></td>
</tr>
<tr>
<td align="left">粒度</td>
<td align="left">连续权重</td>
<td align="left"><strong>Token 级 + 轨迹级双粒度</strong></td>
</tr>
</tbody></table>
<p>重构的 actor loss:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>L</mi><mtext>actor</mtext></msub><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>τ</mi><mo>∼</mo><msub><mi>π</mi><msub><mi>θ</mi><mtext>vllm</mtext></msub></msub></mrow></msub><mrow><mo fence="true">[</mo><mi>I</mi><mo stretchy="false">(</mo><msub><mi>x</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><mi>I</mi><mo stretchy="false">(</mo><mover accent="true"><mi>ρ</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>τ</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>⋅</mo><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>s</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi></msub><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">L_{\\text{actor}} = -\\mathbb{E}_{\\tau \\sim \\pi_{\\theta_{\\text{vllm}}}} \\left[ I(x_t) \\cdot I(\\bar{\\rho}(\\tau)) \\cdot \\log \\pi_\\theta(a_t|s_t) \\cdot \\hat{A}_t \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">actor</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1132em;">τ</span><span class="mrel mtight">∼</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0278em;margin-right:0.1em;"><span class="pstrut" style="height:2.6944em;"></span><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">vllm</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3496em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.401em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4307em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">[</span></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mopen">(</span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">ρ</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">]</span></span></span></span></span></span></span><table>
<thead>
<tr>
<th align="left">过滤粒度</th>
<th align="left">作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Token 级 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>I</mi><mo stretchy="false">(</mo><msub><mi>x</mi><mi>t</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">I(x_t)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td align="left">抑制训练与推理策略之间的局部化不匹配</td>
</tr>
<tr>
<td align="left">轨迹级 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>I</mi><mo stretchy="false">(</mo><mover accent="true"><mi>ρ</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>τ</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">I(\\bar{\\rho}(\\tau))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">I</span><span class="mopen">(</span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">ρ</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mclose">))</span></span></span></span></td>
<td align="left">丢弃从目标分布显著漂移的完整轨迹</td>
</tr>
</tbody></table>
<h3 id="5-3-fzwdjs">5.3 辅助稳定技术</h3>
<table>
<thead>
<tr>
<th align="left">技术</th>
<th align="left">问题</th>
<th align="left">解决方案</th>
</tr>
</thead>
<tbody><tr>
<td align="left">截断感知 Value Bootstrapping</td>
<td align="left">上下文截断被误判为任务失败</td>
<td align="left">用 bootstrapped value 替换零奖励</td>
</tr>
<tr>
<td align="left">路由置信度代理</td>
<td align="left">低路由不确定性放大训练-推理不匹配</td>
<td align="left">监控 Sigma_k,识别稳定性相变</td>
</tr>
</tbody></table>
<p>消融表明,MIS-PO 的 actor 梯度范数噪声显著低于 PPO.</p>
<hr>
<h2 id="6-xlwdx-sdsxmszd">6. 训练稳定性:三大失效模式诊断</h2>
<h3 id="6-1-sxmsy-muon-szmgxdzd-loss-spike">6.1 失效模式一:Muon 数值敏感性导致的 Loss Spike</h3>
<table>
<thead>
<tr>
<th align="left">现象</th>
<th align="left">原因</th>
<th align="left">解决方案</th>
</tr>
</thead>
<tbody><tr>
<td align="left">尖锐的不可恢复 loss spike</td>
<td align="left">BFloat16 Polar Express 的加法累积误差</td>
<td align="left"><strong>仅将 Polar Express 迭代转为 float16</strong></td>
</tr>
</tbody></table>
<p>关键发现:spike 是非确定性的,暗示数值病理而非数据问题.</p>
<h3 id="6-2-sxmse-zjbk-dead-experts">6.2 失效模式二:专家崩溃(Dead Experts)</h3>
<p>专家崩溃不仅表现为路由频率下降,还可能表现为<strong>专家侧病理</strong>:</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">健康状态</th>
<th align="left">崩溃预警</th>
</tr>
</thead>
<tbody><tr>
<td align="left">每专家激活范数</td>
<td align="left">中位数稳定</td>
<td align="left">min-to-median 比率下降</td>
</tr>
<tr>
<td align="left">参数范数</td>
<td align="left">持续增长</td>
<td align="left">停滞或衰减</td>
</tr>
</tbody></table>
<p>两个关键因素:</p>
<ul>
<li><strong>路由专家聚合需要显式缩放</strong>:共享专家引入时必须校准相对贡献</li>
<li><strong>微批次平衡可能过于严格</strong>:细粒度稀疏性下,微批次级 LBL 可能引发过度竞争</li>
</ul>
<h3 id="6-3-sxmss-moe-cjbhjhbz">6.3 失效模式三:MoE 层局部化激活爆炸</h3>
<table>
<thead>
<tr>
<th align="left">特征</th>
<th align="left">表现</th>
<th align="left">诊断指标</th>
</tr>
</thead>
<tbody><tr>
<td align="left">深层少数专家激活范数快速增长</td>
<td align="left">重尾分布,中位数稳定但最大值爆炸</td>
<td align="left">每专家 FFN 输出范数的 max-to-median 比率</td>
</tr>
</tbody></table>
<p>两种干预的对比:</p>
<table>
<thead>
<tr>
<th align="left">干预</th>
<th align="left">效果</th>
<th align="left">结论</th>
</tr>
</thead>
<tbody><tr>
<td align="left">专家投影权重裁剪</td>
<td align="left">仅延迟爆炸</td>
<td align="left">无效</td>
</tr>
<tr>
<td align="left"><strong>专家内部激活裁剪</strong></td>
<td align="left"><strong>有效约束最大范数</strong></td>
<td align="left"><strong>推荐策略</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 训练 loss 曲线完全无法反映深层 MoE 层的激活爆炸——loss 看起来正常,但 Layer 45 的最大专家激活范数已呈指数增长.这彻底颠覆了「loss 平滑=训练稳定&quot;的直觉.max-to-median 比率是更稳健的监控指标.</p>
</blockquote>
<hr>
<h2 id="7-agentic-xnqj">7. Agentic 性能全景</h2>
<h3 id="7-1-tljz">7.1 推理基准</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Step 3.5 Flash</th>
<th align="center">GPT-5.2 xHigh</th>
<th align="center">Gemini 3.0 Pro</th>
<th align="center">DeepSeek V3.2</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AIME 2025</td>
<td align="center"><strong>97.3</strong></td>
<td align="center">92.5</td>
<td align="center">95.8</td>
<td align="center">91.8</td>
</tr>
<tr>
<td align="left">HMMT Fe.</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<p>| <strong>98.4</strong> | 95.2 | 96.7 | 93.6 |
| HMMT No.</p>
<p>| <strong>94.0</strong> | 88.6 | 90.1 | 85.4 |
| IMO-AnswerBench | 85.4 | <strong>87.9</strong> | 86.2 | 81.7 |
| LiveCodeBench-v6 | <strong>86.4</strong> | 81.5 | 83.2 | 80.5 |</p>
<h3 id="7-2-dm-agent-jz">7.2 代码 Agent 基准</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">SWE-Bench Verified</th>
<th align="center">SWE-Bench Multilingual</th>
<th align="center">Terminal-Bench 2.0</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Step 3.5 Flash</strong></td>
<td align="center"><strong>74.4</strong></td>
<td align="center"><strong>67.4</strong></td>
<td align="center"><strong>51.0</strong></td>
</tr>
<tr>
<td align="left">GPT-5.2 xHigh</td>
<td align="center">72.1</td>
<td align="center">64.8</td>
<td align="center">48.3</td>
</tr>
<tr>
<td align="left">Gemini 3.0 Pro</td>
<td align="center">70.5</td>
<td align="center">62.1</td>
<td align="center">46.8</td>
</tr>
<tr>
<td align="left">DeepSeek V3.2</td>
<td align="center">68.3</td>
<td align="center">60.5</td>
<td align="center">44.2</td>
</tr>
</tbody></table>
<h3 id="7-3-ty-agent-jz">7.3 通用 Agent 基准</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">tau^2-Bench</th>
<th align="center">BrowseComp</th>
<th align="center">GAIA</th>
<th align="center">ResearchRubrics</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Step 3.5 Flash</strong></td>
<td align="center"><strong>88.2</strong></td>
<td align="center"><strong>69.0</strong></td>
<td align="center"><strong>67.5</strong></td>
<td align="center"><strong>65.3</strong></td>
</tr>
<tr>
<td align="left">GPT-5.2 xHigh</td>
<td align="center">85.1</td>
<td align="center">62.3</td>
<td align="center">61.2</td>
<td align="center">60.7</td>
</tr>
<tr>
<td align="left">Gemini 3.0 Pro</td>
<td align="center">83.5</td>
<td align="center">58.7</td>
<td align="center">59.8</td>
<td align="center">58.4</td>
</tr>
</tbody></table>
<h3 id="7-4-gjsyzyfx">7.4 工具使用增益分析</h3>
<p>Delta_tool = Score_with_tools - Score_no_tools</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">平均增益</th>
<th align="left">评价</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Step 3.5 Flash</strong></td>
<td align="center"><strong>52.0</strong></td>
<td align="left"><strong>最高工具使用增益,检索弥合知识差距能力最强</strong></td>
</tr>
<tr>
<td align="left">Kimi K2.5</td>
<td align="center">40.2</td>
<td align="left">高绝对分但增益较低</td>
</tr>
<tr>
<td align="left">DeepSeek V3.2</td>
<td align="center">38.1</td>
<td align="left">中等增益</td>
</tr>
<tr>
<td align="left">Kimi K2-Thinking</td>
<td align="center">35.9</td>
<td align="left">增益最低</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 大 Delta_tool 明确信号模型通过检索弥合知识差距的熟练度.Step 3.5 Flash 的 52.0 平均增益远超竞争对手,说明其工具使用不是「装饰&quot;,而是真正的能力扩展.</p>
</blockquote>
<hr>
<h2 id="8-jsskjd">8. 技术思考节点</h2>
<h3 id="8-1-sjdj">8.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么「推理延迟&quot;应该成为与「智能&quot;和「成本&quot;并列的第三维度?</strong></p>
</blockquote>
<p>传统模型评估聚焦于「能力&quot;(benchmark 分数)和「成本&quot;(每百万 token 价格),但忽略了「延迟&quot;对 Agentic 场景的决定性影响:</p>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">延迟影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">交互式编码</td>
<td align="left">100ms vs 500ms 延迟决定开发者是否愿意使用</td>
</tr>
<tr>
<td align="left">多轮 Agent 对话</td>
<td align="left">累积延迟可能使 10 轮对话从 5 分钟变成 30 分钟</td>
</tr>
<tr>
<td align="left">Test-time scaling</td>
<td align="left">固定时间预算下,低延迟 = 更多推理步数 = 更高智能</td>
</tr>
</tbody></table>
<p>Step 3.5 Flash 的 196B/11B 配置(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.10</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.10/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.10/</span></span></span></span>0.30 per MTok)与 DeepSeek-V3.2 同档,但在 Agentic 基准上全面领先.这说明「延迟优化&quot;和&quot;成本优化&quot;可以兼得——关键在于架构层面的协同设计,而非简单的模型缩小.</p>
<blockquote>
<p><strong>思考 2: S3F1 的「3:1&quot;比例是如何确定的?</strong></p>
</blockquote>
<p>作者尝试了多种比例:</p>
<table>
<thead>
<tr>
<th align="left">布局</th>
<th align="center">预训练 Avg</th>
<th align="center">LongCtx</th>
<th align="center">成本</th>
<th align="left">评价</th>
</tr>
</thead>
<tbody><tr>
<td align="left">FFFF</td>
<td align="center">54.1</td>
<td align="center">28.8</td>
<td align="center">高</td>
<td align="left">质量基准</td>
</tr>
<tr>
<td align="left">S1F1</td>
<td align="center">54.6</td>
<td align="center"><strong>29.6</strong></td>
<td align="center">中等</td>
<td align="left">质量最佳但成本高 60%</td>
</tr>
<tr>
<td align="left">S3F1</td>
<td align="center">53.6</td>
<td align="center">27.5</td>
<td align="center"><strong>最低</strong></td>
<td align="left">质量有退化</td>
</tr>
<tr>
<td align="left"><strong>S3F1+Head</strong></td>
<td align="center"><strong>55.7</strong></td>
<td align="center">28.2</td>
<td align="center"><strong>接近最低</strong></td>
<td align="left"><strong>最佳性价比</strong></td>
</tr>
</tbody></table>
<p>S1F1 虽然 LongCtx 最强(29.6),但 attention FLOPs 比 S3F1+Head 高约 60%.对于 agentic 工作负载(大量预填充 + 多轮解码),S3F1+Head 以可忽略的成本增加(1-2%)换取了强劲的质量表现.这是一种「工作负载感知&quot;的设计决策——不是追求单一基准最优,而是针对实际使用场景的帕累托最优.</p>
<h3 id="8-2-sjsy">8.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: Head-wise Gated Attention 为什么优于固定 Sink Token?</strong></p>
</blockquote>
<p>固定 sink token 是数据无关的——无论输入内容如何,sink mass 都是固定的.Head-wise gating 是数据依赖的:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>exp</mtext><mo stretchy="false">(</mo><mo>−</mo><msub><mi>g</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><msub><mi>Z</mi><mi>i</mi></msub><mtext> 在 softmax 归一化器中充当输入依赖的 sink mass</mtext></mrow><annotation encoding="application/x-tex">\\text{exp}(-g_i) \\cdot Z_i \\text{ 在 softmax 归一化器中充当输入依赖的 sink mass}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">exp</span></span><span class="mopen">(</span><span class="mord">−</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">Z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">在</span><span class="mord"> softmax </span><span class="mord cjk_fallback">归一化器中充当输入依赖的</span><span class="mord"> sink mass</span></span></span></span></span></span><table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">Sink Token</th>
<th align="left">Head-wise Gate</th>
</tr>
</thead>
<tbody><tr>
<td align="left">适应性</td>
<td align="left">数据无关,全局固定</td>
<td align="left"><strong>数据依赖,局部自适应</strong></td>
</tr>
<tr>
<td align="left">表达能力</td>
<td align="left">有限(单一 sink)</td>
<td align="left"><strong>丰富(每头每位置独立)</strong></td>
</tr>
<tr>
<td align="left">计算开销</td>
<td align="left">零</td>
<td align="left">可忽略(sigmoid + 乘法)</td>
</tr>
</tbody></table>
<p>实验表明 head-wise gating 平均提升 +1.97,这证明「让注意力机制自己决定何时忽略无关信息&quot;比「人为设置一个固定的忽略阈值&quot;更有效.</p>
<blockquote>
<p><strong>思考 4: MIS-PO 的「二元掩码&quot;vs PPO 的「连续权重&quot;的统计意义</strong></p>
</blockquote>
<p>MIS-PO 受 Metropolis Independence Sampling(MIS)启发,MIS 是 MCMC 中的一种采样方法,其核心思想是:如果提议样本与目标分布差异太大,就拒绝它.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">PPO(连续权重)</th>
<th align="left">MIS-PO(二元掩码)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">离群样本影响</td>
<td align="left">通过比率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">r_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 缩放,仍贡献梯度</td>
<td align="left"><strong>直接丢弃,零梯度</strong></td>
</tr>
<tr>
<td align="left">梯度方差</td>
<td align="left">高(离群样本放大方差)</td>
<td align="left"><strong>低(只保留&quot;安全&quot;样本)</strong></td>
</tr>
<tr>
<td align="left">收敛稳定性</td>
<td align="left">需要小学习率、长训练</td>
<td align="left"><strong>支持更大步长、更快收敛</strong></td>
</tr>
<tr>
<td align="left">样本效率</td>
<td align="left">所有样本都参与更新</td>
<td align="left"><strong>部分样本被过滤,效率略低</strong></td>
</tr>
</tbody></table>
<p>二元掩码的代价是样本效率略低——部分轨迹被完全丢弃.但对于长视界推理任务,稳定性比样本效率更重要.一个发散的训练 run 会浪费所有之前的计算.</p>
<h3 id="8-3-jgxj">8.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: 为什么 Step 3.5 Flash 的 MoE 使用 288 个专家而非更细粒度?</strong></p>
</blockquote>
<p>Step 3.5 Flash 采用 288 路由专家 + 1 共享专家,Top-k=8.这与 DeepSeek-V3 的 256 专家 + 1 共享专家类似,但规模略大.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">专家数</th>
<th align="center">激活专家</th>
<th align="center">稀疏度</th>
<th align="center">总参数</th>
</tr>
</thead>
<tbody><tr>
<td align="left">DeepSeek-V3</td>
<td align="center">256 + 1</td>
<td align="center">8</td>
<td align="center">0.031</td>
<td align="center">671B</td>
</tr>
<tr>
<td align="left">Step 3.5 Flash</td>
<td align="center">288 + 1</td>
<td align="center">8</td>
<td align="center">0.028</td>
<td align="center">196B</td>
</tr>
</tbody></table>
<p>Step 3.5 Flash 的稀疏度 0.028 比 DeepSeek-V3 的 0.031 更稀疏,但考虑到其 196B 总参数远小于 671B,绝对激活参数(11B vs 37B)差距更大.这种设计选择反映了不同的优化目标:Step 3.5 Flash 追求低延迟(小激活参数),而非 Step-3 追求的高吞吐(适度稀疏度).更少的激活参数意味着每个 token 的 FFN 计算更少,延迟更低.</p>
<blockquote>
<p><strong>思考 6: Muon 优化器在大规模 MoE 训练中的风险与收益</strong></p>
</blockquote>
<p>Step 3.5 Flash 使用 Muon 优化器,这是一种通过 Newton-Schulz 迭代实现半正交更新的二阶方法.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">收益</th>
<th align="left">风险</th>
</tr>
</thead>
<tbody><tr>
<td align="left">收敛速度</td>
<td align="left">比 Adam 更快找到优质解</td>
<td align="left">Polar Express 的数值敏感性</td>
</tr>
<tr>
<td align="left">更新质量</td>
<td align="left">半正交方向,减少参数耦合</td>
<td align="left">BFloat16 累积误差导致 spike</td>
</tr>
<tr>
<td align="left">训练稳定性</td>
<td align="left">通常更稳定</td>
<td align="left">需要 float16 中间状态</td>
</tr>
</tbody></table>
<p>关键工程决策:<strong>仅将 Polar Express 迭代(状态与中间值)转为 float16</strong>,其余训练保持混合精度.这是一个精妙的折中——在不牺牲整体训练速度的前提下,消除了数值病理.</p>
<h3 id="8-4-jxyfx">8.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: 「需要更长轨迹才能达到可比质量&quot;的效率代价</strong></p>
</blockquote>
<p>作者坦诚承认:Step 3.5 Flash 目前需要比 Gemini 3.0 Pro 更长的生成轨迹才能达到可比质量.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">影响</th>
<th align="left">缓解方向</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Token 消耗</td>
<td align="left">更长轨迹 = 更高成本</td>
<td align="left">修剪和压缩思考</td>
</tr>
<tr>
<td align="left">延迟感知</td>
<td align="left">用户可能感知到&quot;思考太久&quot;</td>
<td align="left">流式输出部分结果</td>
</tr>
<tr>
<td align="left">竞争优势</td>
<td align="left">成本优势可能被 token 消耗抵消</td>
<td align="left">提升每 token 的信息密度</td>
</tr>
</tbody></table>
<p>这种自我批评在技术报告中较为少见.下一步的优化方向(思考压缩)如果能成功,将显著提升模型的商业竞争力.</p>
<blockquote>
<p><strong>思考 8: 训练稳定性诊断的普适性边界</strong></p>
</blockquote>
<p>Step 3.5 Flash 发现的三大失效模式及其诊断方法具有广泛的工程价值:</p>
<table>
<thead>
<tr>
<th align="left">失效模式</th>
<th align="left">诊断指标</th>
<th align="left">普适性</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Muon 数值敏感性</td>
<td align="left">Loss spike + 恢复测试</td>
<td align="left">所有使用 Muon 的模型</td>
</tr>
<tr>
<td align="left">专家崩溃</td>
<td align="left">专家激活/参数范数</td>
<td align="left">所有细粒度 MoE</td>
</tr>
<tr>
<td align="left">激活爆炸</td>
<td align="left">Max-to-median 比率</td>
<td align="left">所有深层 MoE + SwiGLU</td>
</tr>
</tbody></table>
<p>但这些诊断方法也有局限:</p>
<ul>
<li>需要细粒度的每专家监控,增加遥测开销(4096 GPU 每迭代 600 万条消息)</li>
<li>某些模式可能是 Step 3.5 Flash 特定架构的 artifact</li>
<li>在更大规模(10K+ GPU)上,监控基础设施本身可能成为瓶颈</li>
</ul>
<blockquote>
<p><strong>思考 9: 端云协同(Step-GUI)的架构启示</strong></p>
</blockquote>
<p>Step-GUI 在 AndroidDaily Hard 基准上的表现:</p>
<table>
<thead>
<tr>
<th align="left">模式</th>
<th align="center">分数</th>
</tr>
</thead>
<tbody><tr>
<td align="left">纯端侧</td>
<td align="center">40.0%</td>
</tr>
<tr>
<td align="left">端云协同</td>
<td align="center"><strong>57.0%</strong></td>
</tr>
</tbody></table>
<p>17 个百分点的提升说明:<strong>将强云端推理与高效边缘执行相结合是应对多轮 agent 交互中部署约束的有效策略</strong>.</p>
<p>这种架构对行业的影响:</p>
<ul>
<li><strong>端侧模型</strong>负责低延迟的感知和简单决策</li>
<li><strong>云端模型</strong>负责复杂推理和工具调用</li>
<li><strong>协同协议</strong>定义何时上云、何时本地处理</li>
</ul>
<p>这与 Apple Intelligence 的「Private Cloud Compute&quot;和 Google 的「Gemini Nano + Pro&quot;策略异曲同工,但 Step-GUI 提供了更具体的基准数据.</p>
<h3 id="8-5-jspx">8.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: Step 3.5 Flash 在开源模型演进中的「整合者&quot;角色</strong></p>
</blockquote>
<p>Step 3.5 Flash 的设计深受近期开源前沿模型影响:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">灵感来源</th>
<th align="left">改进</th>
</tr>
</thead>
<tbody><tr>
<td align="left">S3F1 混合注意力</td>
<td align="left">GPT-OSS, Gemma 3, Command A</td>
<td align="left">+Head-wise gating, +Query-head 扩展</td>
</tr>
<tr>
<td align="left">MTP 架构</td>
<td align="left">MiMo-V2.5</td>
<td align="left">更轻量(SWA + 稠密 FFN)</td>
</tr>
<tr>
<td align="left">Muon 优化器</td>
<td align="left">Jordan 等人</td>
<td align="left">+Float16 数值稳定化</td>
</tr>
<tr>
<td align="left">EP-Group 平衡</td>
<td align="left">DeepSeek-V3 无损失负载均衡</td>
<td align="left">扩展到秩级平衡</td>
</tr>
<tr>
<td align="left">MIS-PO</td>
<td align="left">Metropolis Independence Sampling</td>
<td align="left">双粒度过滤(token + 轨迹)</td>
</tr>
</tbody></table>
<p>这不是孤立创新,而是在开源生态上的系统性工程整合.这种「整合者&quot;角色比「开创者&quot;更务实——它站在巨人的肩膀上,通过精妙的工程组合实现超越各个组件之和的效果.</p>
<blockquote>
<p><strong>思考 11: 从「训练稳定性&quot;到「训练可观测性&quot;的工程范式转移</strong></p>
</blockquote>
<p>Step 3.5 Flash 对训练稳定性的处理代表了工程范式的转移:</p>
<table>
<thead>
<tr>
<th align="left">范式</th>
<th align="left">核心假设</th>
<th align="left">监控重点</th>
<th align="left">干预方式</th>
</tr>
</thead>
<tbody><tr>
<td align="left">传统</td>
<td align="left">Loss 平滑 = 训练稳定</td>
<td align="left">全局 loss</td>
<td align="left">学习率调整</td>
</tr>
<tr>
<td align="left"><strong>Step 3.5 Flash</strong></td>
<td align="left"><strong>Loss 正常 ≠ 内部稳定</strong></td>
<td align="left"><strong>每专家激活/参数范数</strong></td>
<td align="left"><strong>激活裁剪、路由调整</strong></td>
</tr>
</tbody></table>
<p>这一转移的关键驱动力是<strong>大规模 MoE 的复杂性</strong>:数百个专家、数十层、数十亿参数,全局 loss 是完全不足以捕捉内部动态的.细粒度可观测性(每专家、每层、每微批次)成为训练稳定的先决条件.</p>
<p>轻量指标服务器(将遥测从训练路径解耦,600 万消息/迭代 → 100ms 开销)是这一范式的关键基础设施.未来,训练框架的内置可观测性可能比优化器选择更重要.</p>
<hr>
<h2 id="9-bssj-cjspycbfx">9. 部署视角:场景适配与成本分析</h2>
<h3 id="9-1-cj-mxpp">9.1 场景-模型匹配</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐模式</th>
<th align="left">关键能力</th>
<th align="left">注意事项</th>
</tr>
</thead>
<tbody><tr>
<td align="left">软件工程(SWE-Bench)</td>
<td align="left">标准推理 + TIR</td>
<td align="left">SWE 74.4%,Terminal-Bench 51.0%</td>
<td align="left">需要代码执行环境</td>
</tr>
<tr>
<td align="left">数学推理(AIME)</td>
<td align="left">+Python TIR</td>
<td align="left">97.3 → 99.8</td>
<td align="left">沙箱安全性</td>
</tr>
<tr>
<td align="left">搜索 Agent(BrowseComp)</td>
<td align="left">工具使用</td>
<td align="left">69.0,Delta 52.0</td>
<td align="left">需要搜索 API</td>
</tr>
<tr>
<td align="left">实时对话</td>
<td align="left">S3F1 低延迟</td>
<td align="left">50ms 级响应</td>
<td align="left">批大小影响延迟</td>
</tr>
<tr>
<td align="left">长文档分析</td>
<td align="left">256K 上下文</td>
<td align="left">LongBench 70.3,FRAMES 95.2</td>
<td align="left">预填充成本</td>
</tr>
<tr>
<td align="left">端侧部署</td>
<td align="left">端云协同(Step-GUI)</td>
<td align="left">AndroidDaily 57.0%</td>
<td align="left">网络连接要求</td>
</tr>
<tr>
<td align="left">成本敏感批处理</td>
<td align="left">标准推理</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.10</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.10/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.10/</span></span></span></span>0.30 per MTok</td>
<td align="left">与 V3.2 同档</td>
</tr>
</tbody></table>
<h3 id="9-2-y-step-3-djzdwcy">9.2 与 Step-3 的家族定位差异</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Step-3</th>
<th align="left">Step 3.5 Flash</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总/激活参数</td>
<td align="left">321B / 38B</td>
<td align="left">196B / 11B</td>
</tr>
<tr>
<td align="left">核心优化</td>
<td align="left">解码吞吐</td>
<td align="left"><strong>Agentic 延迟</strong></td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">MFA</td>
<td align="left"><strong>S3F1 + Head-wise Gate</strong></td>
</tr>
<tr>
<td align="left">MoE 稀疏度</td>
<td align="left">0.083(保守)</td>
<td align="left">0.028(更稀疏)</td>
</tr>
<tr>
<td align="left">推理系统</td>
<td align="left">AFD + StepMesh</td>
<td align="left">标准部署</td>
</tr>
<tr>
<td align="left">定价</td>
<td align="left">未公开 API</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.10</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.10/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.10/</span></span></span></span>0.30 per MTok</td>
</tr>
<tr>
<td align="left">最佳场景</td>
<td align="left">高吞吐在线服务</td>
<td align="left"><strong>交互式 Agent</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>建议</strong>: Step-3 适合需要大规模并发、低单 token 成本的在线服务场景;Step 3.5 Flash 适合交互式 Agent、编码助手和实时对话场景.两者在阶跃星辰的产品矩阵中形成互补.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Step 3.5 Flash Technical Report, arXiv:2602.10604</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.7-stepfun/03-step-3.5-flash/01-step-3.5-flash-jsbgjy">01-Step-3.5-Flash技术报告精译</a></li>
<li>同家族模型: <a href="#broken-link">Step-3 剖析</a></li>
<li>开源影响: GPT-OSS, Gemma 3, MiMo-V2.5, DeepSeek-V3</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxdw-agentic-sdddswd","text":"1. 核心定位:Agentic 时代的第三维度"},{"level":2,"id":"2-s3f1-hhzyl-jhmfdwc","text":"2. S3F1 混合注意力:近乎免费的午餐"},{"level":3,"id":"2-1-sjdj","text":"2.1 设计动机"},{"level":3,"id":"2-2-bccl-query-head-kz-head-wise-gating","text":"2.2 补偿策略:Query-Head 扩展 + Head-wise Gating"},{"level":3,"id":"2-3-wsmbsxxzyl","text":"2.3 为什么不是线性注意力?"},{"level":2,"id":"3-ep-group-ph-xcfbsbszd-straggler","text":"3. EP-Group 平衡:消除分布式部署中的 Straggler"},{"level":3,"id":"3-1-wt-qjjhbdyjbjh","text":"3.1 问题:全局均衡不等于局部均衡"},{"level":3,"id":"3-2-ep-group-phss","text":"3.2 EP-Group 平衡损失"},{"level":2,"id":"4-mtp-3-qltjjm","text":"4. MTP-3:轻量投机解码"},{"level":3,"id":"4-1-sjys","text":"4.1 设计约束"},{"level":3,"id":"4-2-xlcl","text":"4.2 训练策略"},{"level":2,"id":"5-mis-po-kkz-rl-kj","text":"5. MIS-PO:可扩展 RL 框架"},{"level":3,"id":"5-1-wt-ct-rl-dgtdfc","text":"5.1 问题:传统 RL 的高梯度方差"},{"level":3,"id":"5-2-metropolis-independence-sampling-gl","text":"5.2 Metropolis Independence Sampling 过滤"},{"level":3,"id":"5-3-fzwdjs","text":"5.3 辅助稳定技术"},{"level":2,"id":"6-xlwdx-sdsxmszd","text":"6. 训练稳定性:三大失效模式诊断"},{"level":3,"id":"6-1-sxmsy-muon-szmgxdzd-loss-spike","text":"6.1 失效模式一:Muon 数值敏感性导致的 Loss Spike"},{"level":3,"id":"6-2-sxmse-zjbk-dead-experts","text":"6.2 失效模式二:专家崩溃(Dead Experts)"},{"level":3,"id":"6-3-sxmss-moe-cjbhjhbz","text":"6.3 失效模式三:MoE 层局部化激活爆炸"},{"level":2,"id":"7-agentic-xnqj","text":"7. Agentic 性能全景"},{"level":3,"id":"7-1-tljz","text":"7.1 推理基准"},{"level":3,"id":"7-2-dm-agent-jz","text":"7.2 代码 Agent 基准"},{"level":3,"id":"7-3-ty-agent-jz","text":"7.3 通用 Agent 基准"},{"level":3,"id":"7-4-gjsyzyfx","text":"7.4 工具使用增益分析"},{"level":2,"id":"8-jsskjd","text":"8. 技术思考节点"},{"level":3,"id":"8-1-sjdj","text":"8.1 设计动机"},{"level":3,"id":"8-2-sjsy","text":"8.2 数据实验"},{"level":3,"id":"8-3-jgxj","text":"8.3 架构细节"},{"level":3,"id":"8-4-jxyfx","text":"8.4 局限与风险"},{"level":3,"id":"8-5-jspx","text":"8.5 技术谱系"},{"level":2,"id":"9-bssj-cjspycbfx","text":"9. 部署视角:场景适配与成本分析"},{"level":3,"id":"9-1-cj-mxpp","text":"9.1 场景-模型匹配"},{"level":3,"id":"9-2-y-step-3-djzdwcy","text":"9.2 与 Step-3 的家族定位差异"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/05-step-3.5-flash-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/05-step-3.5-flash-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step 3.5 Flash Agentic 低延迟设计与可扩展 RL 框架剖析</h1>
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
