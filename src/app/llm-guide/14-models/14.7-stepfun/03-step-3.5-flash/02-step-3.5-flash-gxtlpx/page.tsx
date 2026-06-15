"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step 3.5 Flash 高效推理剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Step 3.5 Flash Technical Report (arXiv:2602.10604)
发布日期: 2026-02
发布机构: 阶跃星辰(StepFun)
开源协议: Apache 2.0</p>
</blockquote>
<hr>
<h2 id="1-sjdj-yczwdswd">1. 设计动机:延迟作为第三维度</h2>
<p>Step 3.5 Flash 将<strong>推理延迟</strong>提升为与「智能」和「成本」并列的第三大约束.在交互式 agentic 工作流中,延迟直接决定任务完成的 wall-clock 时间;在固定时间预算下,更低的延迟意味着可通过 test-time scaling 投入更多推理步数换取更高智能.</p>
<p>这是模型-系统协同设计范式的根本转变.传统模型评估聚焦于「能力」(benchmark 分数)和「成本」(每百万 token 价格),但忽略了「延迟」对 Agentic 场景的决定性影响:</p>
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
<p>Step 3.5 Flash 的 196B/11B 配置(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.10</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.10/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.10/</span></span></span></span>0.30 per MTok)与 DeepSeek-V3.2 同档,但在 Agentic 基准上全面领先.这说明「延迟优化」和「成本优化」可以兼得——关键在于架构层面的协同设计,而非简单的模型缩小.</p>
<hr>
<h2 id="2-hxjg-196b-moe-yszxtsj">2. 核心架构:196B MoE 与三轴协同设计</h2>
<p>Step 3.5 Flash 采用 45 层稀疏 MoE Transformer 骨干(3 层稠密层 + 42 层 MoE 层),配合专门的混合注意力层布局.模型规模进一步约束在 200B 参数以内,可在高端工作站 128GB 内存预算内实现高性能推理.</p>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">数值</th>
</tr>
</thead>
<tbody><tr>
<td align="left">词表大小(V)</td>
<td align="left">128,896</td>
</tr>
<tr>
<td align="left">模型宽度(d_model)</td>
<td align="left">4096</td>
</tr>
<tr>
<td align="left">Transformer 块数</td>
<td align="left">45(3 稠密 + 42 MoE)</td>
</tr>
<tr>
<td align="left">每 MoE 块专家数</td>
<td align="left">288 路由 + 1 共享</td>
</tr>
<tr>
<td align="left">路由</td>
<td align="left">Top-k=8</td>
</tr>
<tr>
<td align="left">混合块结构</td>
<td align="left">3 SWA 块 + 1 全注意力块</td>
</tr>
<tr>
<td align="left">SWA 窗口大小</td>
<td align="left">512</td>
</tr>
<tr>
<td align="left">KV 头数(GQA)</td>
<td align="left">8</td>
</tr>
<tr>
<td align="left">Query 头数(全/SWA)</td>
<td align="left">64 / 96</td>
</tr>
<tr>
<td align="left">MTP 块数</td>
<td align="left">3(稠密 SWA)</td>
</tr>
<tr>
<td align="left">总参数(骨干)</td>
<td align="left">196B</td>
</tr>
<tr>
<td align="left">每 token 激活参数(骨干)</td>
<td align="left">11B</td>
</tr>
</tbody></table>
<h3 id="2-1-s3f1-hhzyl-jhmfdwc">2.1 S3F1 混合注意力:近乎免费的午餐</h3>
<p>为加速预填充,Step 3.5 Flash 采用混合注意力机制缓解长上下文二次复杂度.为解码,优先保证与投机解码的架构兼容性——在带宽受限硬件上,验证效率是主导杠杆.</p>
<p>采用 3:1 的 SWA 与全注意力交错比例(S3F1):三层 SWA 层(W=512)后接一层全 GQA-8 层.然而,朴素交错策略在各基准上持续劣于稠密注意力基线.为弥合性能差距而不增加实际开销,采用两项互补增强:</p>
<ul>
<li><strong>增加 SWA query-head 数</strong>: 从 64 提升到 96</li>
<li><strong>采用 head-wise gated attention</strong></li>
</ul>
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
<p>S3F1+Head 以可忽略的额外 attention 成本(1-2%)弥合了与 FFFF 基线的大部分差距.作者称其为「近乎免费的午餐」.</p>
<blockquote>
<p><strong>译者注</strong>: S1F1 虽然 LongCtx 最强(29.6),但 attention FLOPs 比 S3F1+Head 高约 60%.对于 agentic 工作负载(大量预填充 + 多轮解码),S3F1+Head 优先其低得多的预填充/解码成本与强劲稳定的长上下文性能.这是一种「工作负载感知」的设计决策——不是追求单一基准最优,而是针对实际使用场景的帕累托最优.</p>
</blockquote>
<h3 id="2-2-head-wise-gated-attention-sjyld-sink-token">2.2 Head-wise Gated Attention:数据依赖的 Sink Token</h3>
<p>朴素 SWA 的局限在于,当输入窗口内无有用信息时,无法有效吸收未使用的注意力权重.先前工作通过引入可学习的、数据无关的 sink token 解决此问题.Step 3.5 Flash 选择不同路径,集成参数高效的 head-wise gating 机制:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>g</mi><mi>i</mi></msub><mo>=</mo><mtext>sigmoid</mtext><mo stretchy="false">(</mo><msubsup><mi>w</mi><mtext>gate</mtext><mi>T</mi></msubsup><mo>⋅</mo><msub><mi>x</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mspace width="1em"/><msubsup><mi>o</mi><mi>i</mi><mtext>gate</mtext></msubsup><mo>=</mo><msub><mi>g</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>y</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">g_i = \\text{sigmoid}(w_{\\text{gate}}^T \\cdot x_i), \\quad o^{\\text{gate}}_i = g_i \\cdot y_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2744em;vertical-align:-0.3831em;"></span><span class="mord text"><span class="mord">sigmoid</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">gate</span></span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9115em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">gate</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>Head-wise gating 可视为在注意力机制中引入<strong>输入依赖的 sink token</strong>.将 sigmoid 代入后,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mo>−</mo><msub><mi>g</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><msub><mi>Z</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\exp(-g_i) \\cdot Z_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord">−</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">Z</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 在 softmax 归一化器中充当输入依赖的 sink mass.</p>
<table>
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
<blockquote>
<p><strong>译者注</strong>: 固定 sink token 是数据无关的——无论输入内容如何,sink mass 都是固定的.Head-wise gating 是数据依赖的:每头每位置独立决定 sink mass 的大小.这证明「让注意力机制自己决定何时忽略无关信息」比「人为设置一个固定的忽略阈值」更有效.</p>
</blockquote>
<h3 id="2-3-ep-group-ph-xcfbsbszd-straggler">2.3 EP-Group 平衡:消除分布式部署中的 Straggler</h3>
<p>采用无损失负载均衡鼓励全局 token 在专家间平衡.然而,这不能保证微批次级别 EP 秩间的负载平衡.token 分配倾斜将工作负载集中在少数专家及其承载 GPU 上,在同步点扼制吞吐量.</p>
<p>引入 EP-Group 平衡损失,显式促进秩级利用率均匀.将专家集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi></mrow><annotation encoding="application/x-tex">E</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span></span></span></span> 划分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 个不相交组:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>p</mi><mi>e</mi></msub><mo>=</mo><mfrac><mn>1</mn><mi>T</mi></mfrac><munder><mo>∑</mo><mi>t</mi></munder><msub><mi>p</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>e</mi></mrow></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>f</mi><mi>e</mi></msub><mo>=</mo><mfrac><mn>1</mn><mrow><mi>T</mi><mi>K</mi></mrow></mfrac><munder><mo>∑</mo><mi>t</mi></munder><msub><mi>s</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>e</mi></mrow></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>p</mi><mi>g</mi></msub><mo>=</mo><munder><mo>∑</mo><mrow><mi>e</mi><mo>∈</mo><msub><mi>E</mi><mi>g</mi></msub></mrow></munder><msub><mi>p</mi><mi>e</mi></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mi>f</mi><mi>g</mi></msub><mo>=</mo><munder><mo>∑</mo><mrow><mi>e</mi><mo>∈</mo><msub><mi>E</mi><mi>g</mi></msub></mrow></munder><msub><mi>f</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">p_e = \\frac{1}{T}\\sum_t p_{t,e}, \\quad f_e = \\frac{1}{TK}\\sum_t s_{t,e}, \\quad p_g = \\sum_{e \\in E_g} p_e, \\quad f_g = \\sum_{e \\in E_g} f_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5714em;vertical-align:-1.25em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.9em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.25em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5714em;vertical-align:-1.25em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.9em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.25em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5417em;vertical-align:-1.4917em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8557em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mrel mtight">∈</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4917em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5417em;vertical-align:-1.4917em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8557em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mrel mtight">∈</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0576em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4917em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>L</mi><mtext>EP</mtext></msub><mo>=</mo><mi>G</mi><mo>×</mo><munderover><mo>∑</mo><mrow><mi>g</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><msub><mi>f</mi><mi>g</mi></msub><mo>×</mo><msub><mi>p</mi><mi>g</mi></msub></mrow><annotation encoding="application/x-tex">L_{\\text{EP}} = G \\times \\sum_{g=1}^G f_g \\times p_g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">EP</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3.2316em;vertical-align:-1.4032em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4032em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><blockquote>
<p><strong>译者注</strong>: EP-Group 平衡不要求每个专家的 token 绝对均匀,而是要求每个 EP 组的负载与路由概率乘积之和均匀.这比简单的 per-expert balance 更能直接消除 straggler,因为 straggler 的根源是 rank 级别的负载不均而非专家级别的.此设计的精妙之处在于它直接优化了分布式系统的瓶颈变量.</p>
</blockquote>
<h3 id="2-4-mtp-3-qltjjm">2.4 MTP-3:轻量投机解码</h3>
<p>附加三个轻量多 token 预测(MTP)头.每个 MTP 头由 SWA 与稠密 FFN 组成,仅增加 0.81B 参数(约 0.41%).</p>
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
<p>受 Fast-MTP 启发,在 MTP 头中采用<strong>位置依赖的损失重加权</strong> across 预测偏移量,防止对远端 token 预测的过度优化.</p>
<hr>
<h2 id="3-gjcx-mis-po-yxlwdxzd">3. 关键创新:MIS-PO 与训练稳定性诊断</h2>
<h3 id="3-1-mis-po-kkz-rl-kj">3.1 MIS-PO:可扩展 RL 框架</h3>
<p>LLM 的 RL 优化面临严重不稳定性,源于高梯度方差,被极长视界与模型规模进一步放大.此方差主要来自:(i) 高吞吐推理引擎与训练框架之间的<strong>基础设施差异</strong>;(ii) 迭代更新固有的<strong>off-policy 错位</strong>.</p>
<p>提出 <strong>MIS-PO(Metropolis Independence Sampling-Filtered Policy Optimization)</strong>,受 Metropolis Independence Sampling 启发.将推理策略视为提议分布,训练策略视为目标,限制更新至与目标分布足够接近的样本.</p>
<p>与重要性采样的关键区别:MIS-PO 应用<strong>二元掩码过滤 off-distribution 样本</strong>,将保留的轨迹视为 effectively on-policy,显著降低梯度方差.</p>
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
<blockquote>
<p><strong>译者注</strong>: MIS-PO 的灵感来源是 Metropolis Independence Sampling——一种 MCMC 方法.MIS-PO 将训练-推理策略差异视为提议分布与目标分布之间的差异,用二元掩码替代连续重要性权重.这不是简单的工程技巧,而是将统计采样理论嫁接到 RL 优化中的概念创新.二元掩码的代价是样本效率略低——部分轨迹被完全丢弃.但对于长视界推理任务,稳定性比样本效率更重要.一个发散的训练 run 会浪费所有之前的计算.</p>
</blockquote>
<h3 id="3-2-xlwdx-sdsxmszd">3.2 训练稳定性:三大失效模式诊断</h3>
<p>训练稳定性是大规模稀疏 MoE 预训练的<strong>一级需求</strong>.实践中,发现三种主导不稳定性:</p>
<p><strong>失效模式一:Muon 数值敏感性导致的 Loss Spike.</strong>
Muon 通过 Newton-Schulz(NS)迭代逼近半正交更新方向.偶尔观察到尖锐的不可恢复 loss spike,尽管使用了推荐的安全缩放.模拟表明,bfloat16 Polar Express 在某些更新统计下因加法累积误差极少产生极端中间异常值.解决方案:<strong>仅将 Polar Express 迭代(状态与中间值)转为 float16</strong>,其余训练保持混合精度.此变更后 spike 不再复发.</p>
<p><strong>失效模式二:专家崩溃(Dead Experts).</strong>
专家崩溃不仅表现为路由频率下降,还可能表现为<strong>专家侧病理</strong>——专家激活消失与专家参数范数停滞或衰减.关键因素:(1) 共享专家引入时必须校准相对贡献;(2) 微批次级负载均衡约束在细粒度稀疏性下可能过于严格,引发过度跨专家竞争.</p>
<p><strong>失效模式三:MoE 层局部化激活爆炸.</strong>
随着专家专业化在主训练阶段成熟,观察到深层 MoE 层的局部化稳定性病理:一小部分专家(通常每层仅一两个)的激活范数快速增长,而同层大多数专家保持良好.训练 loss 完全掩盖了此内部不稳定性——loss 显示可忽略变化,而底层范数已爆炸.</p>
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
<p><strong>译者注</strong>: 这是本报告最具工程价值的部分之一.作者发现训练 loss 曲线完全无法反映深层 MoE 层的激活爆炸——loss 看起来正常,但 Layer 45 的最大专家激活范数已呈指数增长.这一发现彻底颠覆了「loss 平滑 = 训练稳定」的直觉.他们提出的 max-to-median 比率监控指标,以及激活裁剪(而非权重裁剪)的干预策略,是可直接复用的工程经验.轻量指标服务器(将遥测从训练路径解耦,4096 GPU 每迭代 600 万条消息 → 100ms 开销)是这一范式的关键基础设施.</p>
</blockquote>
<hr>
<h2 id="4-hxdb-agentic-dycdjzgj">4. 横向对比:Agentic 低延迟的竞争格局</h2>
<h3 id="4-1-tljz">4.1 推理基准</h3>
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
<h3 id="4-2-dm-agent-jz">4.2 代码 Agent 基准</h3>
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
<h3 id="4-3-ty-agent-jz">4.3 通用 Agent 基准</h3>
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
<h3 id="4-4-gjsyzyfx">4.4 工具使用增益分析</h3>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="normal">Δ</mi><mtext>tool</mtext></msub><mo>=</mo><msub><mtext>Score</mtext><mtext>with tools</mtext></msub><mo>−</mo><msub><mtext>Score</mtext><mtext>no tools</mtext></msub></mrow><annotation encoding="application/x-tex">\\Delta_{\\text{tool}} = \\text{Score}_{\\text{with tools}} - \\text{Score}_{\\text{no tools}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord">Δ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tool</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Score</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">with tools</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Score</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">no tools</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><table>
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
<p>Step 3.5 Flash 展现出利用外部信息的最稳健能力,实现最高平均增益(52.0).大 Delta_tool 明确信号模型通过检索弥合知识差距的熟练度.</p>
<hr>
<h2 id="5-jxxyfx">5. 局限性与风险</h2>
<p><strong>需要更长轨迹才能达到可比质量.</strong> 作者坦诚承认:Step 3.5 Flash 目前需要比 Gemini 3.0 Pro 更长的生成轨迹才能达到可比质量.更长轨迹 = 更高成本,用户可能感知到「思考太久」.下一步的优化方向(思考压缩)如果能成功,将显著提升模型的商业竞争力.</p>
<p><strong>训练稳定性诊断的普适性边界.</strong> 三大失效模式及其诊断方法具有广泛的工程价值,但这些诊断方法也有局限:需要细粒度的每专家监控,增加遥测开销(4096 GPU 每迭代 600 万条消息);某些模式可能是 Step 3.5 Flash 特定架构的 artifact;在更大规模(10K+ GPU)上,监控基础设施本身可能成为瓶颈.</p>
<p><strong>操作范围与约束.</strong> Step 3.5 Flash 针对编码与工作中心任务定制,但在分布偏移期间可能经历降低的稳定性.这通常发生在高度专业化领域或长视界多轮对话中,模型可能表现出重复推理、混合语言输出或时间与身份感知不一致.</p>
<p><strong>端云协同的未解问题.</strong> Step-GUI 在 AndroidDaily Hard 基准上,纯端侧 40.0%,端云协同 57.0%.17 个百分点的提升说明端云协同有效,但协同协议(何时上云、何时本地处理)的设计仍是一个开放问题.</p>
<p><strong>信息来源与完整性.</strong> Step 3.5 Flash 的技术报告(arXiv:2602.10604)是一份完整的学术论文,数据和方法论披露相对充分.但部分工程细节(如 Steptron 框架的具体实现、MIS-PO 的超参数选择)未完全公开.</p>
<hr>
<h2 id="6-kymxyjzd-zhz-js">6. 开源模型演进中的「整合者」角色</h2>
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
<p>这不是孤立创新,而是在开源生态上的系统性工程整合.这种「整合者」角色比「开创者」更务实——它站在巨人的肩膀上,通过精妙的工程组合实现超越各个组件之和的效果.</p>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Step 3.5 Flash Technical Report, arXiv:2602.10604</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.7-stepfun/03-step-3.5-flash/01-step-3.5-flash-jsbgjy">01-Step-3.5-Flash技术报告精译</a></li>
<li>架构总览: <a href="/llm-guide/14-models/14.7-stepfun/03-step-3.5-flash/05-step-3.5-flash-architecture-overview">05-Step-3.5-Flash-Architecture-Overview</a></li>
<li>同家族模型: Step-3 技术报告精译(见 02-Step-3 目录)</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-yczwdswd","text":"1. 设计动机:延迟作为第三维度"},{"level":2,"id":"2-hxjg-196b-moe-yszxtsj","text":"2. 核心架构:196B MoE 与三轴协同设计"},{"level":3,"id":"2-1-s3f1-hhzyl-jhmfdwc","text":"2.1 S3F1 混合注意力:近乎免费的午餐"},{"level":3,"id":"2-2-head-wise-gated-attention-sjyld-sink-token","text":"2.2 Head-wise Gated Attention:数据依赖的 Sink Token"},{"level":3,"id":"2-3-ep-group-ph-xcfbsbszd-straggler","text":"2.3 EP-Group 平衡:消除分布式部署中的 Straggler"},{"level":3,"id":"2-4-mtp-3-qltjjm","text":"2.4 MTP-3:轻量投机解码"},{"level":2,"id":"3-gjcx-mis-po-yxlwdxzd","text":"3. 关键创新:MIS-PO 与训练稳定性诊断"},{"level":3,"id":"3-1-mis-po-kkz-rl-kj","text":"3.1 MIS-PO:可扩展 RL 框架"},{"level":3,"id":"3-2-xlwdx-sdsxmszd","text":"3.2 训练稳定性:三大失效模式诊断"},{"level":2,"id":"4-hxdb-agentic-dycdjzgj","text":"4. 横向对比:Agentic 低延迟的竞争格局"},{"level":3,"id":"4-1-tljz","text":"4.1 推理基准"},{"level":3,"id":"4-2-dm-agent-jz","text":"4.2 代码 Agent 基准"},{"level":3,"id":"4-3-ty-agent-jz","text":"4.3 通用 Agent 基准"},{"level":3,"id":"4-4-gjsyzyfx","text":"4.4 工具使用增益分析"},{"level":2,"id":"5-jxxyfx","text":"5. 局限性与风险"},{"level":2,"id":"6-kymxyjzd-zhz-js","text":"6. 开源模型演进中的「整合者」角色"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/02-step-3.5-flash-gxtlpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/02-step-3.5-flash-gxtlpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step 3.5 Flash 高效推理剖析</h1>
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
