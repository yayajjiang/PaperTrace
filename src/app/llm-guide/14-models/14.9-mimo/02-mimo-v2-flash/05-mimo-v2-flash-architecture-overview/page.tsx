"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiMo-V2-Flash 混合注意力与 MOPD 后训练范式剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">返回 14.9-MiMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: MiMo-V2-Flash Technical Report (Xiaomi LLM-Core Team, arXiv:2601.02780)
<strong>剖析角度</strong>: Hybrid SWA 架构、Sink Bias、MOPD 蒸馏、大规模 Agent RL 基础设施
<strong>面向读者</strong>: 已阅读 MiMo-V2-Flash 技术报告精译,希望深入理解高效注意力架构与多教师蒸馏的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-hxdw-xjhcsddnl">1. 核心定位:小激活参数的大能力</h2>
<p>MiMo-V2-Flash 的核心命题是:<strong>通过架构创新和后训练创新,用 1/2 到 1/3 的激活参数量达到相近的推理和智能体性能.</strong></p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">总参数</th>
<th align="center">激活参数</th>
<th align="center">SWE-Bench Verified</th>
<th align="center">AIME 2025</th>
<th align="center">LiveCodeBench v6</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Kimi-K2-Thinking</td>
<td align="center">1043B</td>
<td align="center">32B</td>
<td align="center">71.3%</td>
<td align="center">94.5%</td>
<td align="center">83.1%</td>
</tr>
<tr>
<td align="left">DeepSeek-V3.2-Thinking</td>
<td align="center">671B</td>
<td align="center">37B</td>
<td align="center">73.1%</td>
<td align="center">93.1%</td>
<td align="center">83.3%</td>
</tr>
<tr>
<td align="left"><strong>MiMo-V2-Flash</strong></td>
<td align="center"><strong>309B</strong></td>
<td align="center"><strong>15B</strong></td>
<td align="center"><strong>73.4%</strong></td>
<td align="center"><strong>94.1%</strong></td>
<td align="center"><strong>85.1%</strong></td>
</tr>
<tr>
<td align="left">Gemini-3.0 Pro</td>
<td align="center">闭源</td>
<td align="center">闭源</td>
<td align="center">76.2%</td>
<td align="center">95.0%</td>
<td align="center">90.7%</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 15B 激活参数 vs 32-37B 激活参数,但 SWE-Bench Verified 73.4% 超越了所有开源竞争对手.这说明参数规模不是能力天花板——架构效率(Hybrid SWA + Lightweight MTP)和后训练效率(MOPD + 大规模 Agent RL)同样关键.</p>
</blockquote>
<hr>
<h2 id="2-hybrid-swa-xck-gbldfzjsj">2. Hybrid SWA:小窗口 + 高比例的反直觉设计</h2>
<h3 id="2-1-jgpz">2.1 架构配置</h3>
<table>
<thead>
<tr>
<th align="left">参数</th>
<th align="center">MiMo-V2-Flash</th>
<th align="center">对比(Gemma-3)</th>
<th align="center">对比(Llama-4)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">滑动窗口大小</td>
<td align="center"><strong>128</strong></td>
<td align="center">1024</td>
<td align="center">8192</td>
</tr>
<tr>
<td align="left">SWA:GA 比例</td>
<td align="center"><strong>5:1</strong></td>
<td align="center">3:1</td>
<td align="center">混合</td>
</tr>
<tr>
<td align="left">总层数</td>
<td align="center">48(39 SWA + 9 GA)</td>
<td align="center">—</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">KV Cache 节省</td>
<td align="center">~6x</td>
<td align="center">~2-3x</td>
<td align="center">~1.5x</td>
</tr>
</tbody></table>
<h3 id="2-2-sink-bias-xnzylhjd">2.2 Sink Bias:虚拟注意力汇聚点</h3>
<p>标准 SWA 的问题:滑动窗口截断后,窗口外的信息完全丢失.Sink Bias 通过在 Softmax 分母添加可学习常数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>η</mi></mrow><annotation encoding="application/x-tex">\\eta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span></span></span></span> 来解决:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>α</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>−</mo><msub><mi>m</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><mrow><munder><mo>∑</mo><mi>k</mi></munder><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>k</mi></mrow></msub><mo>−</mo><msub><mi>m</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>+</mo><mi>η</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\alpha_{ij} = \\frac{\\exp(e_{ij} - m_i)}{\\sum_{k} \\exp(e_{ik} - m_i) + \\eta}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4127em;vertical-align:-0.9857em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1864em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">ik</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9857em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>η</mi></mrow><annotation encoding="application/x-tex">\\eta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span></span></span></span> 较大时,分母被「垫高&quot;,相当于给每个头增加了一个虚拟的「Sink Token&quot;,模型可以在上面「倾倒&quot;不需要关注的注意力权重.</p>
<h3 id="2-3-xrsy-fzjdfx">2.3 消融实验:反直觉的发现</h3>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="center">MMLU</th>
<th align="center">GSM-Infinite 16K</th>
<th align="center">AIME 24/25</th>
<th align="left">评价</th>
</tr>
</thead>
<tbody><tr>
<td align="left">All GA(全全局)</td>
<td align="center">57.3</td>
<td align="center">12.3</td>
<td align="center">45.5</td>
<td align="left">基线</td>
</tr>
<tr>
<td align="left">Hybrid SWA(W=128, w/o sink)</td>
<td align="center">54.9</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="left">性能下降</td>
</tr>
<tr>
<td align="left"><strong>Hybrid SWA(W=128, w/ sink)</strong></td>
<td align="center"><strong>58.3</strong></td>
<td align="center"><strong>17.3</strong></td>
<td align="center"><strong>47.1</strong></td>
<td align="left"><strong>超越全 GA</strong></td>
</tr>
<tr>
<td align="left">Hybrid SWA(W=512, w/ sink)</td>
<td align="center">58.3</td>
<td align="center">17.2</td>
<td align="center">—</td>
<td align="left">长上下文下降</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: W=128 不仅优于 W=512,甚至能超越全 GA 基线.假设:较小的窗口迫使模型聚焦局部上下文(更好的正则化),同时每 6 层一次 GA 确保了长距离依赖的捕获.W=512 会模糊 SWA 和 GA 的职责边界,导致次优.</p>
</blockquote>
<hr>
<h2 id="3-lightweight-mtp-rwgzjs">3. Lightweight MTP:任务感知加速</h2>
<h3 id="3-1-sjys">3.1 设计约束</h3>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">Main Model</th>
<th align="left">MTP Block</th>
</tr>
</thead>
<tbody><tr>
<td align="left">FFN 类型</td>
<td align="left">MoE</td>
<td align="left"><strong>Dense</strong></td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">GA/SWA 混合</td>
<td align="left"><strong>SWA</strong></td>
</tr>
<tr>
<td align="left">参数量</td>
<td align="left">309B 总 / 15B 激活</td>
<td align="left"><strong>0.33B</strong></td>
</tr>
</tbody></table>
<p>Dense FFN + SWA 的设计使 MTP Block 在 Draft 阶段保持极低延迟.</p>
<h3 id="3-2-rwgzjss">3.2 任务感知接受率</h3>
<p>MTP 的接受长度与任务的不确定性(Next Token 交叉熵)呈强负相关:</p>
<table>
<thead>
<tr>
<th align="left">任务类型</th>
<th align="center">熵</th>
<th align="center">平均接受长度</th>
<th align="center">加速比(3层)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">WebDev(低熵)</td>
<td align="center">低</td>
<td align="center">~3.6</td>
<td align="center">~2.53x</td>
</tr>
<tr>
<td align="left">AIME(中熵)</td>
<td align="center">中</td>
<td align="center">~3.2</td>
<td align="center">~2.25x</td>
</tr>
<tr>
<td align="left">MMLU Pro(高熵)</td>
<td align="center">高</td>
<td align="center">~2.8</td>
<td align="center">~1.97x</td>
</tr>
</tbody></table>
<p>拟合公式: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>y</mi><mo>=</mo><mn>4</mn><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><msup><mn>0.58</mn><mrow><mn>0.58</mn><mi>x</mi></mrow></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">y = 4(1 - 0.58^{0.58x})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">4</span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord">0.5</span><span class="mord"><span class="mord">8</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.58</span><span class="mord mathnormal mtight">x</span></span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup><mo>=</mo><mn>0.995</mn></mrow><annotation encoding="application/x-tex">R^2 = 0.995</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.995</span></span></span></span></p>
<blockquote>
<p><strong>关键洞察</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup><mo>=</mo><mn>0.995</mn></mrow><annotation encoding="application/x-tex">R^2 = 0.995</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.995</span></span></span></span> 的拟合曲线提供了强大的工程预测工具:给定任务的 Next Token 交叉熵,即可预测 MTP 的实际加速比.这意味着 MTP 不是「一刀切&quot;的——应该根据工作负载的熵分布来调优 MTP 层数.</p>
</blockquote>
<hr>
<h2 id="4-mopd-djszxclzl">4. MOPD:多教师在线策略蒸馏</h2>
<h3 id="4-1-ctdjszldwt">4.1 传统多教师蒸馏的问题</h3>
<table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left">参数合并(Model Soup)</td>
<td align="left">抹平各教师专长</td>
</tr>
<tr>
<td align="left">离线蒸馏</td>
<td align="left">Exposure Bias——训练时看到教师分布,推理时看到自身分布</td>
</tr>
<tr>
<td align="left">顺序训练</td>
<td align="left">跷跷板效应——提升一项技能导致其他技能退化</td>
</tr>
</tbody></table>
<h3 id="4-2-mopd-dhxcx">4.2 MOPD 的核心创新</h3>
<p>将蒸馏重新定义为<strong>在线策略 RL 问题</strong>:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">传统离线蒸馏</th>
<th align="left">MOPD</th>
</tr>
</thead>
<tbody><tr>
<td align="left">采样分布</td>
<td align="left">教师分布</td>
<td align="left"><strong>学生自身分布</strong></td>
</tr>
<tr>
<td align="left">监督信号</td>
<td align="left">静态数据集</td>
<td align="left"><strong>Token 级 Reverse KL 奖励</strong></td>
</tr>
<tr>
<td align="left">分布漂移</td>
<td align="left">严重</td>
<td align="left"><strong>无(始终基于自身策略)</strong></td>
</tr>
<tr>
<td align="left">能力整合</td>
<td align="left">取舍</td>
<td align="left"><strong>保留各教师峰值性能</strong></td>
</tr>
</tbody></table>
<p>Reverse KL 损失:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>reverse-KL</mtext></msub><mo>=</mo><mo>−</mo><mi mathvariant="double-struck">E</mi><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mtext>domain</mtext></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{reverse-KL}} = -\\mathbb{E}\\left[\\log \\frac{\\pi_{\\text{domain}}(y|x,y_{&lt;t})}{\\pi_\\theta(y|x,y_{&lt;t})}\\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reverse-KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord">−</span><span class="mord mathbb">E</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span></span></span></span></span><h3 id="4-3-mopd-xg">4.3 MOPD 效果</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">MOPD 前学生</th>
<th align="center">最佳教师</th>
<th align="center">MOPD 后学生</th>
<th align="center">超越教师?</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AIME 2025</td>
<td align="center">89.3</td>
<td align="center">93.9(RL)</td>
<td align="center"><strong>94.1</strong></td>
<td align="center"><strong>+0.2</strong></td>
</tr>
<tr>
<td align="left">HMMT Fe.</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<p>| 76.9 | 82.6(RL) | <strong>84.4</strong> | <strong>+1.8</strong> |
| LiveCodeBench | 77.5 | 82.6(RL) | <strong>83.2</strong> | <strong>+0.6</strong> |
| Arena-Hard(Hard) | 50.0 | 50.0(Self) | <strong>54.1</strong> | <strong>+4.1</strong> |
| BrowseComp | 42.5 | 51.7(SFT) | 45.4 | -6.3 |</p>
<blockquote>
<p><strong>关键洞察</strong>: MOPD 在 4 个基准上超越了最佳教师,说明多教师知识的整合产生了「1+1&gt;2&quot;的协同效应.但在 BrowseComp 上差距达 -6.3,可能是因为搜索智能体的教师是 SFT 而非 RL 训练,其分布与 RL 优化后的学生不够兼容.</p>
</blockquote>
<hr>
<h2 id="5-dgm-agent-rl-xl">5. 大规模 Agent RL 训练</h2>
<h3 id="5-1-znthjgm">5.1 智能体环境规模</h3>
<table>
<thead>
<tr>
<th>智能体类型</th>
<th>任务数量</th>
<th>环境</th>
<th>提示来源</th>
</tr>
</thead>
<tbody><tr>
<td>Code Agent</td>
<td>90K</td>
<td>真实</td>
<td>真实</td>
</tr>
<tr>
<td>Terminal Agent</td>
<td>30K</td>
<td>真实</td>
<td>合成</td>
</tr>
<tr>
<td>Search Agent</td>
<td>150K</td>
<td>真实</td>
<td>合成</td>
</tr>
<tr>
<td>General Agent</td>
<td>50K</td>
<td>合成</td>
<td>合成</td>
</tr>
</tbody></table>
<h3 id="5-2-code-agent-jcss">5.2 Code Agent 基础设施</h3>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">设计</th>
<th align="left">规模</th>
</tr>
</thead>
<tbody><tr>
<td align="left">自动化环境设置</td>
<td align="left">容器化镜像,8 种编程语言</td>
<td align="left">70% 成功率</td>
</tr>
<tr>
<td align="left">轻量级脚手架</td>
<td align="left">3 个原子工具(bash, str_replace, finish)</td>
<td align="left">无预定义工作流</td>
</tr>
<tr>
<td align="left">Kubernetes 集群</td>
<td align="left">并发 Pod</td>
<td align="left">10,000+</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 只有三个原子工具的设计与许多框架的「重型工具链&quot;思路形成鲜明对比.洞察是:给模型最小化的工具集,让它在 RL 训练中自行发现最佳实践——这与 AlphaGo 的「少规则、多搜索&quot;哲学一脉相承.</p>
</blockquote>
<h3 id="5-3-fhxy">5.3 泛化效应</h3>
<p>大规模代码智能体 RL 训练不仅提升了代码能力,还<strong>泛化到其他智能体任务和通用推理基准</strong>.这说明智能体训练发展了广泛可迁移的问题解决能力.</p>
<hr>
<h2 id="6-rl-jcss-r3-ysjtdq">6. RL 基础设施:R3 与数据调度器</h2>
<h3 id="6-1-r3-rollout-routing-replay">6.1 R3:Rollout Routing Replay</h3>
<p>MoE 模型在 Rollout 和训练之间因数值精度问题遭受不一致的专家路由.R3 的解决方案:<strong>把 Rollout 的路由决策记录下来,训练时重放.</strong></p>
<table>
<thead>
<tr>
<th align="left">问题</th>
<th align="left">原因</th>
<th align="left">R3 解决</th>
</tr>
</thead>
<tbody><tr>
<td align="left">路由不一致</td>
<td align="left">Rollout(FP8) vs 训练(BF16/FP32)</td>
<td align="left">重放 Rollout 路由</td>
</tr>
<tr>
<td align="left">前缀缓存失效</td>
<td align="left">Radix Cache 跨请求共享</td>
<td align="left"><strong>请求级前缀缓存,避免重新预填充</strong></td>
</tr>
</tbody></table>
<h3 id="6-2-sjtdq">6.2 数据调度器</h3>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">功能</th>
</tr>
</thead>
<tbody><tr>
<td align="left">细粒度序列调度</td>
<td align="left">以序列而非微批次为单位调度</td>
</tr>
<tr>
<td align="left">Partial Rollout</td>
<td align="left">将过长轨迹跨步骤划分,限制陈旧性</td>
</tr>
<tr>
<td align="left">截断重要性采样</td>
<td align="left">校正 Partial Rollout 的 Staleness 偏差</td>
</tr>
<tr>
<td align="left">数据源特定配置</td>
<td align="left">样本配额、优先级、长度限制、温度</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: Partial Rollout 允许把长轨迹切成多段独立参与训练,但引入了 Staleness.截断重要性采样就是用来校正这种偏差的——这是工程上非常精妙的权衡.</p>
</blockquote>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-sjdj">7.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么「小窗口 + 高比例&quot;优于「大窗口 + 低比例&quot;?</strong></p>
</blockquote>
<p>MiMo-V2-Flash 的消融实验提供了一个反直觉但有力的证据:</p>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="left">局部注意力职责</th>
<th align="left">全局注意力职责</th>
<th align="left">问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left">W=128, 5:1</td>
<td align="left"><strong>聚焦局部信息</strong></td>
<td align="left"><strong>捕获长距离依赖</strong></td>
<td align="left">职责清晰</td>
</tr>
<tr>
<td align="left">W=512, 5:1</td>
<td align="left">部分处理长距离依赖</td>
<td align="left">长距离依赖被稀释</td>
<td align="left">职责模糊</td>
</tr>
<tr>
<td align="left">W=128, w/o sink</td>
<td align="left">信息丢失严重</td>
<td align="left">负担过重</td>
<td align="left">性能下降</td>
</tr>
</tbody></table>
<p>W=128 迫使 SWA 建模局部信息,同时将长距离依赖委托给 GA,产生了更清晰的分工.这类似于软件工程中的「单一职责原则&quot;——每个组件只做一件事,但把它做好.</p>
<blockquote>
<p><strong>思考 2: 为什么 Reverse KL 比 Forward KL 更适合蒸馏?</strong></p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">KL 方向</th>
<th align="left">行为</th>
<th align="left">问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Forward KL</td>
<td align="left">强制学生覆盖教师的所有支持</td>
<td align="left">学生「过度扩散&quot;,包括教师不确定的区域</td>
</tr>
<tr>
<td align="left"><strong>Reverse KL</strong></td>
<td align="left"><strong>让学生在自身高概率区域匹配教师</strong></td>
<td align="left"><strong>保留学生个性,吸收教师知识</strong></td>
</tr>
</tbody></table>
<p>Reverse KL 的数学形式:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>reverse-KL</mtext></msub><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><msub><mi>π</mi><mi>θ</mi></msub></msub><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><msub><mi>π</mi><mtext>domain</mtext></msub><msub><mi>π</mi><mi>θ</mi></msub></mfrac><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{reverse-KL}} = -\\mathbb{E}_{\\pi_\\theta}\\left[\\log \\frac{\\pi_{\\text{domain}}}{\\pi_\\theta}\\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reverse-KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span></span></span></span></span><p>期望是在学生分布 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 下计算的,这意味着学生只在自己「关心&quot;的区域去匹配教师.如果教师在某个区域很确定但学生从不采样到那里,Reverse KL 不会强迫学生去探索——这与 Forward KL 的「强制覆盖&quot;形成对比.</p>
<h3 id="7-2-sjsy">7.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: MTP 加速的「熵定律&quot;工程意义</strong></p>
</blockquote>
<p>MTP 接受长度与 Next Token 交叉熵的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup><mo>=</mo><mn>0.995</mn></mrow><annotation encoding="application/x-tex">R^2 = 0.995</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.995</span></span></span></span> 拟合意味着:</p>
<table>
<thead>
<tr>
<th align="left">应用</th>
<th align="left">熵特征</th>
<th align="left">MTP 策略</th>
</tr>
</thead>
<tbody><tr>
<td align="left">代码生成服务</td>
<td align="left">低熵,结构化</td>
<td align="left">3 层 MTP,最大加速</td>
</tr>
<tr>
<td align="left">通用对话服务</td>
<td align="left">高熵,开放</td>
<td align="left">1-2 层 MTP,权衡开销</td>
</tr>
<tr>
<td align="left">混合工作负载</td>
<td align="left">中等熵</td>
<td align="left">动态层数调整</td>
</tr>
</tbody></table>
<p>这个「熵定律&quot;让 MTP 的部署从「经验调参&quot;变成了「可预测工程&quot;:测量工作负载的熵分布,查表得加速比,决定是否启用 MTP.</p>
<blockquote>
<p><strong>思考 4: MOPD 在 BrowseComp 上失败的原因</strong></p>
</blockquote>
<p>MOPD 在 BrowseComp 上比最佳教师低 6.3 分,这是一个值得分析的案例:</p>
<table>
<thead>
<tr>
<th align="left">因素</th>
<th align="left">影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">教师类型</td>
<td align="left">搜索智能体教师是 SFT 训练,非 RL</td>
</tr>
<tr>
<td align="left">分布差异</td>
<td align="left">SFT 教师的输出分布与 RL 优化后的学生差异大</td>
</tr>
<tr>
<td align="left">Reverse KL 局限</td>
<td align="left">学生在自己分布下学习,可能很少采样到搜索相关区域</td>
</tr>
<tr>
<td align="left">任务特性</td>
<td align="left">搜索需要探索性行为,与 MOPD 的「匹配教师&quot;目标冲突</td>
</tr>
</tbody></table>
<p>这提示:MOPD 并非万能——对于需要强探索性的任务(如搜索、开放世界探索),静态教师的指导可能限制学生的探索空间.</p>
<h3 id="7-3-jgxj">7.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: Sink Bias 的理论基础与局限</strong></p>
</blockquote>
<p>Sink Bias 的精确理论基础仍是活跃的研究方向.几种解释:</p>
<table>
<thead>
<tr>
<th align="left">解释</th>
<th align="left">机制</th>
<th align="left">局限</th>
</tr>
</thead>
<tbody><tr>
<td align="left">虚拟 Sink Token</td>
<td align="left">给注意力提供一个「丢弃&quot;出口</td>
<td align="left">无法选择性保留特定信息</td>
</tr>
<tr>
<td align="left">正则化效应</td>
<td align="left">防止注意力过度集中</td>
<td align="left">可能降低某些任务的聚焦能力</td>
</tr>
<tr>
<td align="left">位置编码补偿</td>
<td align="left">缓解 RoPE 在长距离上的衰减</td>
<td align="left">与窗口大小耦合</td>
</tr>
</tbody></table>
<p>从工程角度看,Sink Bias 只是一个标量加法,计算开销几乎为零.但需要注意:它不能替代真正的全局注意力——在需要精确长距离依赖的任务上,GA 层仍然是必需的.</p>
<blockquote>
<p><strong>思考 6: 轻量级脚手架的「少即是多&quot;哲学</strong></p>
</blockquote>
<p>MiMo-V2-Flash 的 Code Agent 脚手架只有三个原子工具:</p>
<table>
<thead>
<tr>
<th align="left">工具</th>
<th align="left">功能</th>
<th align="left">设计意图</th>
</tr>
</thead>
<tbody><tr>
<td align="left">bash</td>
<td align="left">执行任意 shell 命令</td>
<td align="left"><strong>最大化灵活性</strong></td>
</tr>
<tr>
<td align="left">str_replace</td>
<td align="left">文件内容替换</td>
<td align="left"><strong>精确编辑</strong></td>
</tr>
<tr>
<td align="left">finish</td>
<td align="left">标记任务完成</td>
<td align="left"><strong>终止条件</strong></td>
</tr>
</tbody></table>
<p>与 AutoGPT、OpenDevin 等「重型工具链&quot;对比:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">重型工具链</th>
<th align="left">轻量级脚手架</th>
</tr>
</thead>
<tbody><tr>
<td align="left">预设工作流</td>
<td align="left">多</td>
<td align="left">无</td>
</tr>
<tr>
<td align="left">模型自由度</td>
<td align="left">低</td>
<td align="left"><strong>高</strong></td>
</tr>
<tr>
<td align="left">训练复杂度</td>
<td align="left">高(需要学会每种工具)</td>
<td align="left"><strong>低(只需学会 3 种)</strong></td>
</tr>
<tr>
<td align="left">泛化能力</td>
<td align="left">受限于预设工具</td>
<td align="left"><strong>受限于 shell 能力</strong></td>
</tr>
</tbody></table>
<p>这种设计的风险:模型可能滥用 bash(如执行危险命令),需要在沙箱环境中运行.</p>
<h3 id="7-4-jxyfx">7.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: 309B 总参数 / 15B 激活的知识容量瓶颈</strong></p>
</blockquote>
<p>MiMo-V2-Flash 在知识密集型任务上存在明显短板:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">MiMo-V2-Flash</th>
<th align="center">Kimi-K2-Base</th>
<th align="center">差距</th>
</tr>
</thead>
<tbody><tr>
<td align="left">SimpleQA</td>
<td align="center">20.6</td>
<td align="center">35.3</td>
<td align="center">-14.7</td>
</tr>
<tr>
<td align="left">GlobalMMLU</td>
<td align="center">76.6</td>
<td align="center">80.7</td>
<td align="center">-4.1</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">87.9</td>
<td align="center">92.5</td>
<td align="center">-4.6</td>
</tr>
</tbody></table>
<p>这不是缺陷,而是资源约束下的理性取舍——将有限的参数预算集中在推理和代码能力上.但这也意味着 MiMo-V2-Flash 不适合作为通用知识问答的首选模型.</p>
<blockquote>
<p><strong>思考 8: 与闭源模型的差距</strong></p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">MiMo-V2-Flash</th>
<th align="center">Gemini-3.0 Pro</th>
<th align="center">GPT-5 High</th>
<th align="center">差距</th>
</tr>
</thead>
<tbody><tr>
<td align="left">HLE(no tools)</td>
<td align="center">22.1</td>
<td align="center">37.5</td>
<td align="center">26.3</td>
<td align="center">-4.2 ~ -15.4</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">84.9</td>
<td align="center">90.1</td>
<td align="center">87.5</td>
<td align="center">-2.6 ~ -5.2</td>
</tr>
<tr>
<td align="left">HMMT Fe.</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<p>| 84.4 | 97.5 | 88.3 | -3.9 ~ -13.1 |</p>
<p>差距的存在表明,参数规模仍然是能力天花板的重要决定因素.但 MiMo-V2-Flash 的价值在于证明了:<strong>通过架构和后训练创新,可以用更少的资源达到相近的核心能力</strong>.</p>
<blockquote>
<p><strong>思考 9: 上下文管理策略的公平性问题</strong></p>
</blockquote>
<p>BrowseComp 的分数在「带上下文管理&quot;(58.3%)和「不带&quot;(45.4%)之间有 13 个百分点的差距:</p>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="left">效果</th>
<th align="left">公平性</th>
</tr>
</thead>
<tbody><tr>
<td align="left">上下文管理</td>
<td align="left">模型有多次重置机会</td>
<td align="left">相当于 test-time pass@k</td>
</tr>
<tr>
<td align="left">分数提升</td>
<td align="left">+13%</td>
<td align="left">与单次尝试分数不可直接对比</td>
</tr>
</tbody></table>
<p>在 benchmark 比较中,需要明确标注评估策略的差异.上下文管理在真实应用中可能是合理的,但在学术比较中需要谨慎.</p>
<h3 id="7-5-jspx">7.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: MiMo-V2-Flash 在高效架构演进中的位置</strong></p>
</blockquote>
<p>当前高效注意力架构形成了清晰的演进路线:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">代表</th>
<th align="left">核心机制</th>
<th align="center">KV 节省</th>
</tr>
</thead>
<tbody><tr>
<td align="left">标准注意力</td>
<td align="left">Llama-2</td>
<td align="left">全注意力</td>
<td align="center">1x</td>
</tr>
<tr>
<td align="left">GQA</td>
<td align="left">Llama-3</td>
<td align="left">分组共享 KV</td>
<td align="center">4x</td>
</tr>
<tr>
<td align="left">MLA</td>
<td align="left">DeepSeek-V3</td>
<td align="left">低秩压缩 KV</td>
<td align="center">8x+</td>
</tr>
<tr>
<td align="left"><strong>Hybrid SWA + Sink</strong></td>
<td align="left"><strong>MiMo-V2-Flash</strong></td>
<td align="left"><strong>局部窗口 + 虚拟汇聚点</strong></td>
<td align="center"><strong>6x</strong></td>
</tr>
<tr>
<td align="left">线性注意力</td>
<td align="left">MiniMax M1</td>
<td align="left">状态压缩</td>
<td align="center">无限(理论上)</td>
</tr>
</tbody></table>
<p>MiMo-V2-Flash 的位置介于 MLA 和线性注意力之间:它不像 MLA 那样压缩 KV 表示,而是通过减少参与注意力的 token 数量来降低 KV Cache.这种「空间稀疏&quot;(而非「表示压缩&quot;)的路线在工程上更简单,但在理论上可能不如 MLA 优雅.</p>
<blockquote>
<p><strong>思考 11: MOPD 的「迭代协同进化&quot;潜力</strong></p>
</blockquote>
<p>MOPD 天然支持教师-学生协同进化循环:</p>
<pre><code>学生模型 → 专用 RL → 更强教师 → MOPD 蒸馏 → 更强学生 → ...
</code></pre>
<p>这种循环的潜力:</p>
<ul>
<li>每次迭代教师和学生都变得更强大</li>
<li>无需从头训练,持续扩展能力</li>
<li>模块化设计允许随时加入新领域教师</li>
</ul>
<p>但风险也存在:如果某次迭代的教师质量下降,错误会传播到下一代.建立质量门控(如 benchmark 阈值)是防止退化传播的关键.</p>
<hr>
<h2 id="8-bssj-cjspyxsyh">8. 部署视角:场景适配与效率优化</h2>
<h3 id="8-1-cj-mxpp">8.1 场景-模型匹配</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">关键能力</th>
<th align="left">注意事项</th>
</tr>
</thead>
<tbody><tr>
<td align="left">软件工程</td>
<td align="left">SWE 73.4%,开源领先</td>
<td align="left">代码 Agent 脚手架设计优秀</td>
</tr>
<tr>
<td align="left">数学推理</td>
<td align="left">AIME 94.1%</td>
<td align="left">支持 MTP 加速</td>
</tr>
<tr>
<td align="left">长上下文任务</td>
<td align="left">256K,Hybrid SWA 稳健</td>
<td align="left">GSM-Infinite 衰减极小</td>
</tr>
<tr>
<td align="left">实时交互</td>
<td align="left">MTP 2.7x 加速</td>
<td align="left">根据任务熵调优 MTP 层数</td>
</tr>
<tr>
<td align="left">通用知识问答</td>
<td align="left">SimpleQA 20.6%</td>
<td align="left"><strong>不推荐</strong>,知识容量有限</td>
</tr>
<tr>
<td align="left">搜索智能体</td>
<td align="left">BrowseComp 45.4%</td>
<td align="left">弱于 Claude/GPT</td>
</tr>
</tbody></table>
<h3 id="8-2-mtp-bsjy">8.2 MTP 部署建议</h3>
<table>
<thead>
<tr>
<th align="left">工作负载</th>
<th align="center">建议 MTP 层数</th>
<th align="center">预期加速</th>
</tr>
</thead>
<tbody><tr>
<td align="left">代码/数学推理(低熵)</td>
<td align="center">3 层</td>
<td align="center">2.5x+</td>
</tr>
<tr>
<td align="left">通用对话(中熵)</td>
<td align="center">2 层</td>
<td align="center">1.9x-2.1x</td>
</tr>
<tr>
<td align="left">创意写作(高熵)</td>
<td align="center">1 层或不启用</td>
<td align="center">1.0x-1.8x</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>建议</strong>: 对于以代码和数学为主的推理服务,3 层 MTP 收益最大;对于通用对话服务,需要根据实际工作负载的熵分布来调优.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: MiMo-V2-Flash Technical Report, arXiv:2601.02780</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.9-mimo/02-mimo-v2-flash/01-mimo-v2-flash-jsbgjy">01-MiMo-V2-Flash技术报告精译</a></li>
<li>前代模型: <a href="#broken-link">MiMo-7B 剖析</a></li>
<li>后续模型: <a href="#broken-link">MiMo-V2.5 剖析</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxdw-xjhcsddnl","text":"1. 核心定位:小激活参数的大能力"},{"level":2,"id":"2-hybrid-swa-xck-gbldfzjsj","text":"2. Hybrid SWA:小窗口 + 高比例的反直觉设计"},{"level":3,"id":"2-1-jgpz","text":"2.1 架构配置"},{"level":3,"id":"2-2-sink-bias-xnzylhjd","text":"2.2 Sink Bias:虚拟注意力汇聚点"},{"level":3,"id":"2-3-xrsy-fzjdfx","text":"2.3 消融实验:反直觉的发现"},{"level":2,"id":"3-lightweight-mtp-rwgzjs","text":"3. Lightweight MTP:任务感知加速"},{"level":3,"id":"3-1-sjys","text":"3.1 设计约束"},{"level":3,"id":"3-2-rwgzjss","text":"3.2 任务感知接受率"},{"level":2,"id":"4-mopd-djszxclzl","text":"4. MOPD:多教师在线策略蒸馏"},{"level":3,"id":"4-1-ctdjszldwt","text":"4.1 传统多教师蒸馏的问题"},{"level":3,"id":"4-2-mopd-dhxcx","text":"4.2 MOPD 的核心创新"},{"level":3,"id":"4-3-mopd-xg","text":"4.3 MOPD 效果"},{"level":2,"id":"5-dgm-agent-rl-xl","text":"5. 大规模 Agent RL 训练"},{"level":3,"id":"5-1-znthjgm","text":"5.1 智能体环境规模"},{"level":3,"id":"5-2-code-agent-jcss","text":"5.2 Code Agent 基础设施"},{"level":3,"id":"5-3-fhxy","text":"5.3 泛化效应"},{"level":2,"id":"6-rl-jcss-r3-ysjtdq","text":"6. RL 基础设施:R3 与数据调度器"},{"level":3,"id":"6-1-r3-rollout-routing-replay","text":"6.1 R3:Rollout Routing Replay"},{"level":3,"id":"6-2-sjtdq","text":"6.2 数据调度器"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-sjdj","text":"7.1 设计动机"},{"level":3,"id":"7-2-sjsy","text":"7.2 数据实验"},{"level":3,"id":"7-3-jgxj","text":"7.3 架构细节"},{"level":3,"id":"7-4-jxyfx","text":"7.4 局限与风险"},{"level":3,"id":"7-5-jspx","text":"7.5 技术谱系"},{"level":2,"id":"8-bssj-cjspyxsyh","text":"8. 部署视角:场景适配与效率优化"},{"level":3,"id":"8-1-cj-mxpp","text":"8.1 场景-模型匹配"},{"level":3,"id":"8-2-mtp-bsjy","text":"8.2 MTP 部署建议"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.9-mimo/02-mimo-v2-flash/05-mimo-v2-flash-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.9-mimo/02-mimo-v2-flash/05-mimo-v2-flash-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiMo-V2-Flash 混合注意力与 MOPD 后训练范式剖析</h1>
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
