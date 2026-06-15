"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama-3 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《The Llama 3 Herd of Models》技术报告精译, 对 405B dense Transformer 的架构选择,三阶段预训练,4D 并行基础设施,六轮后训练及超大规模集群可靠性进行深度拆解.</p>
</blockquote>
<hr>
<h2 id="1-sjdjyhxdc">1 设计动机与核心洞察</h2>
<p>Llama 3 发布于 2024 年 7 月, 是 Meta 开源模型家族从「追赶者」到「并跑者」跃迁的标志性版本. 其技术报告将开发高质量基础模型的关键杠杆归结为三点: 数据,规模和管理复杂性. 在架构层面, 「管理复杂性」这一杠杆直接决定了 Llama 3 最引人注目的战略选择——在 Mixtral 8x7B/8x22B 等 MoE 模型已证明稀疏架构效率优势的 2024 年, Meta 选择坚守 dense Transformer, 并将规模推至 405B 参数.</p>
<p>这一决策的核心逻辑并非技术保守, 而是「工程可靠性优先于理论效率」的务实哲学. Dense Transformer 的梯度流经过数十亿参数规模的验证, 收敛行为可预测; MoE 的路由机制引入额外非线性, gate 网络的 softmax 输出可能导致专家负载不均衡,梯度分布异常, 训练过程中更易出现 loss spike 或发散. 对于需要服务数十亿用户的 Meta 而言, 推理延迟的可预测性比峰值吞吐量更重要——dense 模型每个 token 的计算量是固定的, 而 MoE 的延迟取决于路由决策.</p>
<blockquote>
<p>译者注: 但坚持 dense 的代价是惊人的. 405B 参数的 dense 模型意味着每次前向传播需要激活全部 405B 参数. 相比之下, DeepSeek-V3(671B 总参数, 37B 激活)在推理时只使用约 5.5% 的参数, 却达到了与 Llama 3 405B 相当的性能. 从训练成本看, Llama 3 405B 消耗了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs, 约 3080 万 H100 GPU 小时; DeepSeek-V3 的训练成本差距超过 10 倍. Meta 的选择本质上是用资本换时间——用更高的训练成本换取更短的工程周期和更低的技术风险.</p>
</blockquote>
<hr>
<h2 id="2-hxjg-bz-dense-transformer-djzgc">2 核心架构: 标准 Dense Transformer 的极致工程</h2>
<h3 id="2-1-mxggyccs">2.1 模型规格与超参数</h3>
<p>Llama 3 全系列采用统一的 dense Transformer 架构, 仅在层数,隐藏维度和注意力头数上按规模缩放:</p>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="left">8B</th>
<th align="left">70B</th>
<th align="left">405B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">层数</td>
<td align="left">32</td>
<td align="left">80</td>
<td align="left">126</td>
</tr>
<tr>
<td align="left">模型维度</td>
<td align="left">4,096</td>
<td align="left">8,192</td>
<td align="left">16,384</td>
</tr>
<tr>
<td align="left">FFN 维度</td>
<td align="left">14,336</td>
<td align="left">28,672</td>
<td align="left">53,248</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">32</td>
<td align="left">64</td>
<td align="left">128</td>
</tr>
<tr>
<td align="left">Key/Value 头数</td>
<td align="left">8</td>
<td align="left">8</td>
<td align="left">8</td>
</tr>
<tr>
<td align="left">词表大小</td>
<td align="left">128,000</td>
<td align="left">128,000</td>
<td align="left">128,000</td>
</tr>
<tr>
<td align="left">位置编码</td>
<td align="left">RoPE (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span>=500,000)</td>
<td align="left">RoPE (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span>=500,000)</td>
<td align="left">RoPE (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span>=500,000)</td>
</tr>
<tr>
<td align="left">激活函数</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
</tr>
<tr>
<td align="left">峰值学习率</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Llama 3 关键超参数概览.</p>
</blockquote>
<p>405B 模型使用 126 层,16,384 维 token 表示和 128 个注意力头. 根据数据上的缩放定律, 该模型规模对于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs 的训练预算而言近似计算最优.</p>
<h3 id="2-2-gqa-c-128-d-8-d-kv-tys">2.2 GQA: 从 128 到 8 的 KV 头压缩</h3>
<p>Llama 3 全系列采用 GQA(Grouped Query Attention), 统一使用 8 个 KV 头——无论模型有 32 个注意力头(8B)还是 128 个(405B).</p>
<p>在标准 MHA(Multi-Head Attention)中, 每个注意力头独立维护一组 K 和 V. 对于 Llama 3 405B(128 头), MHA 的 KV Cache 大小为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV Cache</mtext><mtext>MHA</mtext></msub><mo>=</mo><mn>2</mn><mo>×</mo><msub><mi>n</mi><mi>h</mi></msub><mo>×</mo><msub><mi>d</mi><mi>h</mi></msub><mo>×</mo><mi>L</mi><mo>=</mo><mn>2</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>128</mn><mo>×</mo><mi>L</mi><mo>=</mo><mn>32768</mn><mi>L</mi></mrow><annotation encoding="application/x-tex">\\text{KV Cache}_{\\text{MHA}} = 2 \\times n_h \\times d_h \\times L = 2 \\times 128 \\times 128 \\times L = 32768L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MHA</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">32768</span><span class="mord mathnormal">L</span></span></span></span></span><p>GQA 将 128 个 Query 头分成 16 组, 每组共享 1 个 KV 头(共 8 个). KV Cache 降至:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV Cache</mtext><mtext>GQA</mtext></msub><mo>=</mo><mn>2</mn><mo>×</mo><msub><mi>n</mi><mrow><mi>k</mi><mi>v</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mi>h</mi></msub><mo>×</mo><mi>L</mi><mo>=</mo><mn>2</mn><mo>×</mo><mn>8</mn><mo>×</mo><mn>128</mn><mo>×</mo><mi>L</mi><mo>=</mo><mn>2048</mn><mi>L</mi></mrow><annotation encoding="application/x-tex">\\text{KV Cache}_{\\text{GQA}} = 2 \\times n_{kv} \\times d_h \\times L = 2 \\times 8 \\times 128 \\times L = 2048L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">KV Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">GQA</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">2048</span><span class="mord mathnormal">L</span></span></span></span></span><p>压缩比为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>32768</mn><mi mathvariant="normal">/</mi><mn>2048</mn><mo>=</mo><mn>16</mn><mo>×</mo></mrow><annotation encoding="application/x-tex">32768 / 2048 = 16\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">32768/2048</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16</span><span class="mord">×</span></span></span></span>.</p>
<blockquote>
<p>译者注: GQA 的压缩是有代价的——多个 Query 头共享同一组 K/V, 意味着它们无法独立地关注不同的语义子空间. 但从工程角度看, 这种信息冗余在 Transformer 中广泛存在: 相邻的注意力头往往学习相似的表示模式. GQA 的核心洞察是, 完全独立的 KV 头在大多数任务上是过度设计, 适度的共享可以在几乎不损失质量的情况下大幅削减显存占用.</p>
</blockquote>
<h3 id="2-3-rope-jstz-c-10k-d-500k">2.3 RoPE 基数调整: 从 10K 到 500K</h3>
<p>Llama 3 将 RoPE(Rotary Position Embedding)的基数频率从 Llama 2 的 10,000 提高到 500,000. RoPE 的旋转角度定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mtext>base</mtext><mrow><mo>−</mo><mn>2</mn><mi>i</mi><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = \\text{base}^{-2i/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9723em;"></span><span class="mord"><span class="mord text"><span class="mord">base</span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9723em;"><span style="top:-3.1473em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mord mathnormal mtight">i</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 为维度索引, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi></mrow><annotation encoding="application/x-tex">d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 为 head dimension. 基数 base 决定了位置编码的「波长」——更大的基数意味着更长的波长, 相邻位置之间的角度变化更小. 在 128K 上下文中, 将基数提高到 500,000 后, 即使在最远的位置, 编码仍然保持足够的区分度.</p>
<h3 id="2-4-128k-cb-dyydysys">2.4 128K 词表: 多语言的压缩艺术</h3>
<p>Llama 3 的词表大小从 Llama 2 的 32K 扩展到 128K, 基于 tiktoken 的 100K token 加上 28K 额外 token 以支持非英语语言. 压缩率从 3.17 提高到 3.94(字符/token), 意味着处理相同文本所需的 token 数减少了约 19.5%.</p>
<hr>
<h2 id="3-gjcx-sjdyxlyllhxl">3 关键创新: 三阶段预训练与六轮后训练</h2>
<h3 id="3-1-sjdyxlfa">3.1 三阶段预训练方案</h3>
<p>Llama 3 405B 的预训练分为三个主要阶段:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">目标</th>
<th align="left">序列长度</th>
<th align="left">批次大小</th>
<th align="left">关键特征</th>
</tr>
</thead>
<tbody><tr>
<td align="left">初始预训练</td>
<td align="left">通用语言能力与知识</td>
<td align="left">4K→8K→8K</td>
<td align="left">4M→8M→16M</td>
<td align="left">学习率从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 余弦衰减到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td align="left">长上下文预训练</td>
<td align="left">长距离依赖建模</td>
<td align="left">8K→16K→32K→64K→128K</td>
<td align="left">16M</td>
<td align="left">分六步逐步扩展, 约 800B token</td>
</tr>
<tr>
<td align="left">退火</td>
<td align="left">知识固化与精细化</td>
<td align="left">128K</td>
<td align="left">16M</td>
<td align="left">学习率线性降到 0, 上采样高质量数据</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Llama 3 三阶段预训练方案.</p>
</blockquote>
<p>长上下文扩展采用渐进式策略: 从 8K 开始, 分六个阶段逐步推进到 128K. 每个阶段, 模型在当前长度上继续预训练, 直到短上下文评估性能完全恢复且完美解决「大海捞针」任务. 这种渐进式扩展的核心洞察是: Transformer 的位置编码对新长度的适应需要渐进学习. 如果在训练早期就使用 128K 序列, 注意力计算的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度将使大部分计算预算被浪费在长上下文上, 而模型尚未具备基本的语言理解能力.</p>
<h3 id="3-2-sfdlyjszy">3.2 缩放定律与计算最优</h3>
<p>Llama 3 团队通过 IsoFLOPs 曲线建立了计算最优模型的缩放定律. 核心发现是最优训练 token 数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>N</mi><mo>⋆</mo></msup></mrow><annotation encoding="application/x-tex">N^\\star</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6887em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6887em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">⋆</span></span></span></span></span></span></span></span></span></span></span> 与计算预算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi></mrow><annotation encoding="application/x-tex">C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 之间满足幂律关系:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>N</mi><mo>⋆</mo></msup><mo stretchy="false">(</mo><mi>C</mi><mo stretchy="false">)</mo><mo>=</mo><mi>A</mi><msup><mi>C</mi><mi>α</mi></msup></mrow><annotation encoding="application/x-tex">N^\\star(C) = A C^\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">⋆</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7144em;"></span><span class="mord mathnormal">A</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span></span></span></span><p>拟合结果为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>α</mi><mo separator="true">,</mo><mi>A</mi><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><mn>0.53</mn><mo separator="true">,</mo><mn>0.29</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(\\alpha, A) = (0.53, 0.29)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">A</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0.53</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0.29</span><span class="mclose">)</span></span></span></span>. 将这一关系外推到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi><mo>=</mo><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">C = 3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs, 得到计算最优模型规模约为 402B 参数, 训练 token 约 16.55T. Llama 3 最终选择 405B 参数和 15.6T token, 与理论最优非常接近.</p>
<blockquote>
<p>译者注: 公式 (1) 是 Chinchilla 缩放定律的变体. 关键发现是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.53</mn></mrow><annotation encoding="application/x-tex">\\alpha=0.53</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.53</span></span></span></span>, 这意味着计算预算翻倍时, 最优 token 数增加约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>2</mn><mn>0.53</mn></msup><mo>≈</mo><mn>1.44</mn></mrow><annotation encoding="application/x-tex">2^{0.53} \\approx 1.44</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.53</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.44</span></span></span></span> 倍. 另一个重要洞察是「IsoFLOPs 曲线在最小值附近更平坦」——这意味着模型规模和数据量的小幅偏离最优比例不会显著影响最终性能, 给了工程团队宝贵的灵活性.</p>
</blockquote>
<h3 id="3-3-llddhxl-sft-rs-dpo">3.3 六轮迭代后训练: SFT + RS + DPO</h3>
<p>Llama 3 的后训练流程经历了从 Llama 2 的 PPO 到 DPO 的关键转变:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Llama 2</th>
<th align="left">Llama 3</th>
</tr>
</thead>
<tbody><tr>
<td align="left">对齐算法</td>
<td align="left">RLHF(PPO)</td>
<td align="left">SFT + RS + DPO</td>
</tr>
<tr>
<td align="left">迭代轮次</td>
<td align="left">5 轮</td>
<td align="left">6 轮</td>
</tr>
<tr>
<td align="left">拒绝采样</td>
<td align="left">有(K=10~100)</td>
<td align="left">有(K=10~30)</td>
</tr>
<tr>
<td align="left">奖励模型</td>
<td align="left">双模型(有用性+安全性)</td>
<td align="left">单模型(多能力覆盖)</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Llama 2 与 Llama 3 后训练对比.</p>
</blockquote>
<p>DPO(Direct Preference Optimization)将偏好学习转化为一个分类问题, 直接从成对偏好数据优化策略, 无需奖励模型和价值网络. Llama 3 报告称「DPO 需要更少的计算量且表现更好, 特别是在 IFEval 等指令遵循基准上」. 但 DPO 也有其局限性: 对偏好数据质量要求极高, 且容易过拟合到训练时的偏好分布. Llama 3 通过六轮迭代来缓解这一问题——每轮使用上一轮的最佳模型重新采样和标注偏好数据, 使训练数据不断「刷新」.</p>
<hr>
<h2 id="4-4d-bhycdgmgc">4 4D 并行与超大规模工程</h2>
<h3 id="4-1-bhcldzhlj">4.1 并行策略的组合逻辑</h3>
<p>Llama 3 405B 在 16K H100 GPU 上训练, 采用 4D 并行:</p>
<table>
<thead>
<tr>
<th align="left">并行类型</th>
<th align="left">分片维度</th>
<th align="left">目的</th>
<th align="left">Llama 3 405B 配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">TP(Tensor Parallelism)</td>
<td align="left">权重张量</td>
<td align="left">减少单 GPU 显存占用</td>
<td align="left">8(同节点 NVLink)</td>
</tr>
<tr>
<td align="left">CP(Context Parallelism)</td>
<td align="left">序列维度</td>
<td align="left">支持超长序列</td>
<td align="left">1(8K) / 16(128K)</td>
</tr>
<tr>
<td align="left">PP(Pipeline Parallelism)</td>
<td align="left">模型层</td>
<td align="left">支持大模型</td>
<td align="left">16</td>
</tr>
<tr>
<td align="left">DP(Data Parallelism, FSDP)</td>
<td align="left">数据批次</td>
<td align="left">加速训练</td>
<td align="left">64(8K) / 8(128K)</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Llama 3 405B 预训练并行配置.</p>
</blockquote>
<p>四种并行的组合逻辑是层级化的: TP=8 在单节点 8 GPU 内部通过 NVLink 进行张量分片; PP=16 将 126 层分成 16 个阶段; CP 在 128K 时启用 CP=16; DP 决定全局批次大小. 总 GPU 数满足 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mi>P</mi><mo>×</mo><mi>C</mi><mi>P</mi><mo>×</mo><mi>P</mi><mi>P</mi><mo>×</mo><mi>D</mi><mi>P</mi></mrow><annotation encoding="application/x-tex">TP \\times CP \\times PP \\times DP</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span></span></span></span>.</p>
<h3 id="4-2-43-mfu-dgcyy">4.2 43% MFU 的工程意义</h3>
<p>Llama 3 405B 在 8K 序列长度时达到了 43% 的 BF16 MFU(Model FLOPs Utilization):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>MFU</mtext><mo>=</mo><mfrac><mtext>实际训练吞吐量(TFLOPs/s)</mtext><mrow><mtext>GPU 峰值算力(TFLOPs/s)</mtext><mo>×</mo><mtext>GPU 数量</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{MFU} = \\frac{\\text{实际训练吞吐量(TFLOPs/s)}}{\\text{GPU 峰值算力(TFLOPs/s)} \\times \\text{GPU 数量}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">MFU</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">GPU </span><span class="mord cjk_fallback">峰值算力</span><span class="mord">(TFLOPs/s)</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">GPU </span><span class="mord cjk_fallback">数量</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord cjk_fallback">实际训练吞吐量</span><span class="mord">(TFLOPs/s)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>H100 的 BF16 密集峰值算力约为 495 TFLOPS(密集). 以 43% 的 MFU 计算, 每个 GPU 的有效算力约为 213 TFLOPS. 43% 的 MFU 在超大规模训练中属于优秀水平——DeepSeek-V3 报告 42% 的 MFU, 一般大规模训练的 MFU 通常在 25-35%.</p>
<h3 id="4-3-jqkkx-54-t-466-czd">4.3 集群可靠性: 54 天 466 次中断</h3>
<p>Llama 3 405B 的预训练在 54 天内经历了 466 次作业中断, 平均每天 8.6 次. 419 次意外中断中, GPU 相关故障占 58.7%, 其中故障 GPU(30.1%)和 HBM3 内存错误(17.2%)是最大来源. 最令人警醒的是「静默数据损坏」(SDC)——6 次中断, 占比 1.4%. SDC 是指计算产生了错误结果但没有任何错误报告机制触发, 错误的梯度更新被正常地应用到模型参数上.</p>
<blockquote>
<p>译者注: 尽管故障数量庞大, 期间仅需 3 次重大人工干预, 其余全部由自动化系统处理. 这背后是 Meta 的自动化容错系统: 频繁 Checkpoint,校验和验证,自动故障诊断和热插拔维护. 在超大规模训练场景下, 人工运维已经退居「异常兜底」角色, 日常故障处理完全由软件系统接管.</p>
</blockquote>
<hr>
<h2 id="5-hxdb-dense-lxdxnsx">5 横向对比: Dense 路线的性能上限</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Llama 3 405B</th>
<th align="left">GPT-4</th>
<th align="left">DeepSeek-V3</th>
<th align="left">Qwen2.5 72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">Dense</td>
<td align="left">未知</td>
<td align="left">MoE(671B/37B act)</td>
<td align="left">Dense</td>
</tr>
<tr>
<td align="left">预训练 Token</td>
<td align="left">15.6T</td>
<td align="left">未知</td>
<td align="left">14.8T</td>
<td align="left">18T</td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="left">87.3%</td>
<td align="left">85.1%</td>
<td align="left">88.5%</td>
<td align="left">86.1%</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="left">89.0%</td>
<td align="left">86.6%</td>
<td align="left">92.0%</td>
<td align="left">84.6%</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="left">96.8%</td>
<td align="left">94.2%</td>
<td align="left">95.8%</td>
<td align="left">93.2%</td>
</tr>
<tr>
<td align="left">上下文长度</td>
<td align="left">128K</td>
<td align="left">128K</td>
<td align="left">128K</td>
<td align="left">128K</td>
</tr>
<tr>
<td align="left">推理激活参数</td>
<td align="left">405B</td>
<td align="left">未知</td>
<td align="left">37B</td>
<td align="left">72B</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: Llama 3 405B 与竞品模型核心指标对比.</p>
</blockquote>
<p>Llama 3 405B 在 MMLU 上达到 87.3%, 与 GPT-4(85.1%) 和 Claude 3.5 Sonnet(88.0%) 相当. 这证明了一个重要命题: <strong>在足够的数据和计算规模下, dense Transformer 仍然可以达到与闭源模型相当的性能</strong>. 但这个命题有一个隐含前提——「足够的数据和计算规模」. 405B 参数 + 15.6T token 的训练成本对于大多数组织而言是不可承受的.</p>
<hr>
<h2 id="6-jxxyfx">6 局限性与风险</h2>
<h3 id="6-1-tlcbdxsys">6.1 推理成本的现实约束</h3>
<p>Llama 3 405B 的 dense 架构带来了严峻的推理成本挑战. 405B 参数在 FP16 精度下需要约 810 GB 显存, 即使使用 4-bit 量化也需要约 230 GB. 社区实测数据显示, Llama 3.1 405B Q3_K_S 量化在 3 节点配置下, 输出吞吐量仅约 0.8 token/s——这对于交互式应用是不可接受的. 相比之下, DeepSeek-V3(671B 总参数, 37B 激活)在相似硬件上可以达到更高的有效吞吐量.</p>
<h3 id="6-2-dyyfgdjx">6.2 多语言覆盖的局限</h3>
<p>Llama 3 官方支持 8 种语言(英语,德语,法语,意大利语,葡萄牙语,印地语,西班牙语和泰语). 这与 Qwen3(119 种语言)相比差距巨大. 对于全球部署场景, Llama 3 在低资源语言上的能力明显不足.</p>
<h3 id="6-3-csxwdzsnlbj">6.3 长上下文的真实能力边界</h3>
<p>虽然 Llama 3 支持 128K 上下文, 但「支持」不等于「有效利用」. 大海捞针测试显示 405B 模型在 128K 上的检索准确率约为 98.1%, 但这只是一个简单的信息检索任务. 在真实的多文档推理,长程依赖推理任务中, 128K 上下文的实际有效利用率尚未被充分验证.</p>
<hr>
<h2 id="7-zj">7 总结</h2>
<p>Llama 3 的架构设计体现了 Meta 的工程哲学: <strong>用极致的规模和可靠性, 证明 dense Transformer 的上限</strong>. 它坚持 dense 路线, 用 405B 参数和 15.6T token 证明了开源模型可以达到 GPT-4 级别性能; 通过三阶段预训练和六轮后训练迭代, 将复杂的能力培养分解为可控的渐进步骤; 在 16K H100 GPU 上实现了 43% 的 MFU 和 99.4% 的故障自动化处理率. 从算法家族树的角度看, Llama 3 是「scale is all you need」理念在 dense 架构上的终极验证, 也为 Llama 4 最终转向 MoE 提供了对比基准.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdjyhxdc","text":"1 设计动机与核心洞察"},{"level":2,"id":"2-hxjg-bz-dense-transformer-djzgc","text":"2 核心架构: 标准 Dense Transformer 的极致工程"},{"level":3,"id":"2-1-mxggyccs","text":"2.1 模型规格与超参数"},{"level":3,"id":"2-2-gqa-c-128-d-8-d-kv-tys","text":"2.2 GQA: 从 128 到 8 的 KV 头压缩"},{"level":3,"id":"2-3-rope-jstz-c-10k-d-500k","text":"2.3 RoPE 基数调整: 从 10K 到 500K"},{"level":3,"id":"2-4-128k-cb-dyydysys","text":"2.4 128K 词表: 多语言的压缩艺术"},{"level":2,"id":"3-gjcx-sjdyxlyllhxl","text":"3 关键创新: 三阶段预训练与六轮后训练"},{"level":3,"id":"3-1-sjdyxlfa","text":"3.1 三阶段预训练方案"},{"level":3,"id":"3-2-sfdlyjszy","text":"3.2 缩放定律与计算最优"},{"level":3,"id":"3-3-llddhxl-sft-rs-dpo","text":"3.3 六轮迭代后训练: SFT + RS + DPO"},{"level":2,"id":"4-4d-bhycdgmgc","text":"4 4D 并行与超大规模工程"},{"level":3,"id":"4-1-bhcldzhlj","text":"4.1 并行策略的组合逻辑"},{"level":3,"id":"4-2-43-mfu-dgcyy","text":"4.2 43% MFU 的工程意义"},{"level":3,"id":"4-3-jqkkx-54-t-466-czd","text":"4.3 集群可靠性: 54 天 466 次中断"},{"level":2,"id":"5-hxdb-dense-lxdxnsx","text":"5 横向对比: Dense 路线的性能上限"},{"level":2,"id":"6-jxxyfx","text":"6 局限性与风险"},{"level":3,"id":"6-1-tlcbdxsys","text":"6.1 推理成本的现实约束"},{"level":3,"id":"6-2-dyyfgdjx","text":"6.2 多语言覆盖的局限"},{"level":3,"id":"6-3-csxwdzsnlbj","text":"6.3 长上下文的真实能力边界"},{"level":2,"id":"7-zj","text":"7 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/03-llama-3/02-llama-3-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/03-llama-3/02-llama-3-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama-3 核心架构剖析</h1>
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
