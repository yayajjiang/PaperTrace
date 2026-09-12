"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama 3 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《The Llama 3 Herd of Models》技术报告精译, 对 405B dense Transformer 的架构选择、三阶段预训练、4D 并行基础设施、六轮后训练及超大规模集群可靠性进行深度拆解.</p>
</blockquote>
<hr>
<h2 id="1-jgzlypxdw">1 架构总览与谱系定位</h2>
<p>Llama 3 发布于 2024 年 7 月, 是 Meta 开源模型家族从「追赶者」到「并跑者」跃迁的标志性版本. 其技术谱系定位如下:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Llama 2</th>
<th>Llama 3</th>
<th>核心变化</th>
</tr>
</thead>
<tbody><tr>
<td>架构</td>
<td>Dense Transformer</td>
<td>Dense Transformer</td>
<td>坚持 dense, 拒绝 MoE</td>
</tr>
<tr>
<td>最大参数</td>
<td>70B</td>
<td>405B</td>
<td>5.8 倍规模提升</td>
</tr>
<tr>
<td>预训练数据</td>
<td>1.8T tokens</td>
<td>15.6T tokens</td>
<td>8.7 倍数据增长</td>
</tr>
<tr>
<td>计算预算</td>
<td>~7e23 FLOPs</td>
<td>3.8e25 FLOPs</td>
<td>~54 倍计算增长</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>4K</td>
<td>128K</td>
<td>32 倍扩展</td>
</tr>
<tr>
<td>词表大小</td>
<td>32K</td>
<td>128K</td>
<td>4 倍扩展, 多语言增强</td>
</tr>
<tr>
<td>KV 头数</td>
<td>8(GQA 70B)</td>
<td>8(全系列统一)</td>
<td>推理效率优化</td>
</tr>
<tr>
<td>RoPE 基数</td>
<td>10,000</td>
<td>500,000</td>
<td>长上下文支持</td>
</tr>
<tr>
<td>后训练</td>
<td>SFT + RLHF(PPO)</td>
<td>SFT + RS + DPO</td>
<td>简化对齐流程</td>
</tr>
</tbody></table>
<p>这里值得停一下. 在 2024 年的开源模型生态中, Mixtral 8x7B/8x22B 已经证明了 MoE 架构的效率优势——以更少的激活参数达到 dense 模型的性能. 但 Meta 选择在 Llama 3 上坚持 dense 路线, 并将规模推到 405B. 这一决策的核心逻辑是「管理复杂性」——dense 架构的梯度流更稳定, 超参数调优更简单, 工程团队可以将精力集中在数据质量和训练规模上, 而非解决 MoE 特有的负载均衡和路由稳定性问题. 这是一种「工程可靠性优先于理论效率」的务实选择, 也与 Meta 作为社交巨头的工程文化一致: 宁可多花算力, 也要保证训练的可预测性和可重复性.</p>
<hr>
<h2 id="2-dense-vs-moe-dzljz">2 Dense vs MoE 的战略抉择</h2>
<h3 id="2-1-wsmjj-moe">2.1 为什么拒绝 MoE?</h3>
<p>Llama 3 的技术报告明确将「管理复杂性」列为三大关键杠杆之一. 在架构选择上, 这意味着:</p>
<ol>
<li><p><strong>训练稳定性</strong>: Dense Transformer 的梯度流经过数十亿参数规模的验证, 收敛行为可预测. MoE 的路由机制引入了额外的非线性——gate 网络的 softmax 输出可能导致某些专家被过度使用, 梯度在专家之间分布不均, 训练过程中可能出现 loss spike 或发散.</p>
</li>
<li><p><strong>超参数调优</strong>: Dense 模型的超参数空间相对简单(学习率、批次大小、权重衰减等). MoE 需要额外调优专家数量、Top-K 选择、负载均衡损失系数、容量因子等, 调优维度翻倍.</p>
</li>
<li><p><strong>推理可预测性</strong>: Dense 模型的推理延迟是固定的——每个 token 都经过相同数量的计算. MoE 的推理延迟取决于路由决策, 不同 token 可能激活不同的专家组合, 导致延迟波动. 对于 Meta 这种需要服务数十亿用户的场景, 延迟的可预测性比峰值吞吐量更重要.</p>
</li>
</ol>
<blockquote>
<p>译者注: 但坚持 dense 的代价是惊人的. 405B 参数的 dense 模型意味着每次前向传播需要激活全部 405B 参数. 相比之下, DeepSeek-V3(671B 总参数, 37B 激活)在推理时只使用约 5.5% 的参数, 却达到了与 Llama 3 405B 相当的性能. 从训练成本看, Llama 3 405B 消耗了 3.8e25 FLOPs, 约 3080 万 H100 GPU 小时; DeepSeek-V3 消耗约 279 万 H800 GPU 小时(报告数据), 训练成本差距超过 10 倍. Meta 的选择本质上是用资本换时间——用更高的训练成本换取更短的工程周期和更低的技术风险.</p>
</blockquote>
<h3 id="2-2-dense-lxdxnsx">2.2 Dense 路线的性能上限</h3>
<p>Llama 3 405B 在 MMLU 上达到 87.3%, 与 GPT-4(85.1%) 和 Claude 3.5 Sonnet(88.0%) 相当. 这证明了一个重要命题: <strong>在足够的数据和计算规模下, dense Transformer 仍然可以达到与闭源模型相当的性能</strong>.</p>
<p>但这个命题有一个隐含前提: 「足够的数据和计算规模」. 405B 参数 + 15.6T token 的训练成本对于大多数组织而言是不可承受的. 从民主化角度看, Llama 3 的 dense 路线实际上提高了开源模型的「准入门槛」——虽然权重开源了, 但能够复现或微调 405B 模型的机构屈指可数. 这与 DeepSeek 的 MoE 路线形成对比: DeepSeek 用更低的训练成本达到了相似的性能, 使更多研究机构能够参与复现和改进.</p>
<hr>
<h2 id="3-mxjgdgcxj">3 模型架构的工程细节</h2>
<h3 id="3-1-gqa-c-128-d-8-d-kv-tys">3.1 GQA: 从 128 到 8 的 KV 头压缩</h3>
<p>Llama 3 全系列采用 GQA(Grouped Query Attention), 统一使用 8 个 KV 头——无论模型有 32 个注意力头(8B)还是 128 个(405B).</p>
<p>在标准 MHA(Multi-Head Attention)中, 每个注意力头独立维护一组 K 和 V. 对于 Llama 3 405B(128 头), MHA 的 KV Cache 大小为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV Cache</mtext><mtext>MHA</mtext></msub><mo>=</mo><mn>2</mn><mo>×</mo><msub><mi>n</mi><mi>h</mi></msub><mo>×</mo><msub><mi>d</mi><mi>h</mi></msub><mo>×</mo><mi>L</mi><mo>=</mo><mn>2</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>128</mn><mo>×</mo><mi>L</mi><mo>=</mo><mn>32768</mn><mi>L</mi></mrow><annotation encoding="application/x-tex">\\text{KV Cache}_{\\text{MHA}} = 2 \\times n_h \\times d_h \\times L = 2 \\times 128 \\times 128 \\times L = 32768L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">KV Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MHA</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">32768</span><span class="mord mathnormal">L</span></span></span></span></span><p>GQA 将 128 个 Query 头分成 16 组, 每组共享 1 个 KV 头(共 8 个). KV Cache 降至:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>KV Cache</mtext><mtext>GQA</mtext></msub><mo>=</mo><mn>2</mn><mo>×</mo><msub><mi>n</mi><mrow><mi>k</mi><mi>v</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mi>h</mi></msub><mo>×</mo><mi>L</mi><mo>=</mo><mn>2</mn><mo>×</mo><mn>8</mn><mo>×</mo><mn>128</mn><mo>×</mo><mi>L</mi><mo>=</mo><mn>2048</mn><mi>L</mi></mrow><annotation encoding="application/x-tex">\\text{KV Cache}_{\\text{GQA}} = 2 \\times n_{kv} \\times d_h \\times L = 2 \\times 8 \\times 128 \\times L = 2048L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">KV Cache</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">GQA</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">2048</span><span class="mord mathnormal">L</span></span></span></span></span><p>压缩比为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>32768</mn><mi mathvariant="normal">/</mi><mn>2048</mn><mo>=</mo><mn>16</mn><mo>×</mo></mrow><annotation encoding="application/x-tex">32768 / 2048 = 16\\times</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">32768/2048</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16</span><span class="mord">×</span></span></span></span>.</p>
<p>这里需要理解的是, GQA 的压缩是有代价的——多个 Query 头共享同一组 K/V, 意味着它们无法独立地关注不同的语义子空间. 但从工程角度看, 这种信息冗余在 Transformer 中广泛存在: 相邻的注意力头往往学习相似的表示模式. GQA 的核心洞察是: <strong>完全独立的 KV 头在大多数任务上是过度设计, 适度的共享可以在几乎不损失质量的情况下大幅削减显存占用</strong>.</p>
<h3 id="3-2-rope-jstz-c-10k-d-500k">3.2 RoPE 基数调整: 从 10K 到 500K</h3>
<p>Llama 3 将 RoPE(Rotary Position Embedding)的基数频率从 Llama 2 的 10,000 提高到 500,000. 这一调整直接支持了 128K 长上下文.</p>
<p>RoPE 的旋转角度定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mtext>base</mtext><mrow><mo>−</mo><mn>2</mn><mi>i</mi><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = \\text{base}^{-2i/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9723em;"></span><span class="mord"><span class="mord text"><span class="mord">base</span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9723em;"><span style="top:-3.1473em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mord mathnormal mtight">i</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 为维度索引, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi></mrow><annotation encoding="application/x-tex">d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 为 head dimension. 基数 base 决定了位置编码的「波长」——更大的基数意味着更长的波长, 相邻位置之间的角度变化更小.</p>
<p>在 128K 上下文中, 位置索引 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 的范围是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>0</mn><mo separator="true">,</mo><mn>131071</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[0, 131071]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">131071</span><span class="mclose">]</span></span></span></span>. 如果基数仍为 10,000, 远距离位置的 RoPE 编码可能产生高度相似的角度, 导致模型难以区分远距离 token. 将基数提高到 500,000 后, 即使在最远的位置, 编码仍然保持足够的区分度.</p>
<p>但这里有一个微妙的 trade-off: <strong>更大的基数会降低短距离位置的区分精度</strong>. 在 base=500,000 时, 相邻 token 的旋转角度极小, 模型对局部语序的敏感度可能下降. Llama 3 通过在长上下文预训练阶段逐步扩展窗口来缓解这一问题——模型先在 8K 上学习局部模式, 再逐步适应更大的基数和更长的距离.</p>
<h3 id="3-3-128k-cb-dyydysys">3.3 128K 词表: 多语言的压缩艺术</h3>
<p>Llama 3 的词表大小从 Llama 2 的 32K 扩展到 128K, 基于 tiktoken 的 100K token 加上 28K 额外 token 以支持非英语语言.</p>
<p>词表扩展的效果可以通过压缩率来衡量:</p>
<table>
<thead>
<tr>
<th>词表</th>
<th>英语压缩率(字符/token)</th>
<th>多语言支持</th>
</tr>
</thead>
<tbody><tr>
<td>Llama 2(32K)</td>
<td>3.17</td>
<td>有限(以英语为主)</td>
</tr>
<tr>
<td>Llama 3(128K)</td>
<td>3.94</td>
<td>8 种语言 + 扩展覆盖</td>
</tr>
</tbody></table>
<p>压缩率从 3.17 提高到 3.94 意味着处理相同文本所需的 token 数减少了约 19.5%. 这带来了双重收益:</p>
<ol>
<li><strong>训练效率</strong>: 相同数量的训练 token 可以覆盖更多的原始文本内容.</li>
<li><strong>推理效率</strong>: 输入序列更短, 注意力计算量减少.</li>
</ol>
<p>但词表扩大也有代价: 嵌入层和输出层的参数量从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>32</mn><mi>K</mi><mo>×</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">32K \\times d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 增加到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>128</mn><mi>K</mi><mo>×</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">128K \\times d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span>, 对于 405B 模型(d=16,384), 这增加了约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>128</mn><mi>K</mi><mo>−</mo><mn>32</mn><mi>K</mi><mo stretchy="false">)</mo><mo>×</mo><mn>16</mn><mo separator="true">,</mo><mn>384</mn><mo>×</mo><mn>2</mn><mo>≈</mo><mn>3.1</mn><mi>B</mi></mrow><annotation encoding="application/x-tex">(128K-32K) \\times 16,384 \\times 2 \\approx 3.1B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">32</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">16</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">384</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">3.1</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 参数. 虽然相对于 405B 总参数量而言占比很小(&lt;1%), 但在小模型(8B)上, 嵌入层占比从约 2% 增加到约 8%, 可能影响模型容量的分配.</p>
<hr>
<h2 id="4-sfdlyjszy">4 缩放定律与计算最优</h2>
<h3 id="4-1-iso-flo-ps-ymlnh">4.1 IsoFLOPs 与幂律拟合</h3>
<p>Llama 3 团队通过在小规模模型(40M 到 16B 参数)上进行大量预训练实验, 建立了计算最优模型的缩放定律. 核心发现是: 最优训练 token 数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>N</mi><mo>⋆</mo></msup></mrow><annotation encoding="application/x-tex">N^\\star</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6887em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6887em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">⋆</span></span></span></span></span></span></span></span></span></span></span> 与计算预算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi></mrow><annotation encoding="application/x-tex">C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 之间满足幂律关系:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>N</mi><mo>⋆</mo></msup><mo stretchy="false">(</mo><mi>C</mi><mo stretchy="false">)</mo><mo>=</mo><mi>A</mi><msup><mi>C</mi><mi>α</mi></msup></mrow><annotation encoding="application/x-tex">N^\\star(C) = A C^\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">⋆</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7144em;"></span><span class="mord mathnormal">A</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span></span></span></span><p>拟合结果为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>α</mi><mo separator="true">,</mo><mi>A</mi><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><mn>0.53</mn><mo separator="true">,</mo><mn>0.29</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(\\alpha, A) = (0.53, 0.29)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">A</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0.53</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0.29</span><span class="mclose">)</span></span></span></span>. 将这一关系外推到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi><mo>=</mo><mn>3.8</mn><mo>×</mo><msup><mn>10</mn><mn>25</mn></msup></mrow><annotation encoding="application/x-tex">C = 3.8 \\times 10^{25}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">25</span></span></span></span></span></span></span></span></span></span></span></span> FLOPs, 得到计算最优模型规模约为 402B 参数, 训练 token 约 16.55T. Llama 3 最终选择 405B 参数和 15.6T token, 与理论最优非常接近.</p>
<p>这里值得停下来理解 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.53</mn></mrow><annotation encoding="application/x-tex">\\alpha = 0.53</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.53</span></span></span></span> 的工程含义. 当计算预算翻倍时, 最优 token 数增加约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>2</mn><mn>0.53</mn></msup><mo>≈</mo><mn>1.44</mn></mrow><annotation encoding="application/x-tex">2^{0.53} \\approx 1.44</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.53</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.44</span></span></span></span> 倍, 最优参数增加约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>2</mn><mn>0.47</mn></msup><mo>≈</mo><mn>1.39</mn></mrow><annotation encoding="application/x-tex">2^{0.47} \\approx 1.39</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.47</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1.39</span></span></span></span> 倍. 这意味着数据和模型规模应该以大致相等的速度增长——与 Chinchilla 缩放定律的「数据=2x参数」原则一致.</p>
<p>但 Llama 3 团队还观察到一个重要现象: <strong>IsoFLOPs 曲线在最小值附近变得「更平坦」</strong>. 这意味着在计算预算确定的情况下, 模型规模和数据量的小幅偏离最优比例不会显著影响最终性能. 这一发现给了工程团队宝贵的灵活性: 当 GPU 内存限制无法容纳理论最优的模型规模时, 可以适当减小模型、增加数据, 而不会付出太大的性能代价.</p>
<h3 id="4-2-yhxsfdlddb">4.2 与后续缩放定律的对比</h3>
<p>Llama 3 的缩放定律基于 2024 年初的数据. 后续研究(如 DeepSeek-V3 和 MiniMax-M2)发现, 数据质量的重要性可能超过了纯粹的 scaling law 预测——使用更高质量但数量更少的数据, 有时能超越使用低质量海量数据的模型. 这一趋势对 Llama 3 的「数据量优先」策略提出了挑战: 15.6T token 中是否包含了大量低信息密度的重复内容? 如果将这些计算预算集中在 10T 高质量 token 上, 性能是否可能更好?</p>
<hr>
<h2 id="5-sjdyxlfa">5 三阶段预训练方案</h2>
<h3 id="5-1-jdhfdnlpymb">5.1 阶段划分的能力培养目标</h3>
<p>Llama 3 405B 的预训练分为三个主要阶段:</p>
<table>
<thead>
<tr>
<th>阶段</th>
<th>目标</th>
<th>序列长度</th>
<th>批次大小</th>
<th>关键特征</th>
</tr>
</thead>
<tbody><tr>
<td>初始预训练</td>
<td>通用语言能力与知识</td>
<td>4K-&gt;8K-&gt;8K</td>
<td>4M-&gt;8M-&gt;16M</td>
<td>学习率从 8e-5 余弦衰减到 8e-7</td>
</tr>
<tr>
<td>长上下文预训练</td>
<td>长距离依赖建模</td>
<td>8K-&gt;16K-&gt;32K-&gt;64K-&gt;128K</td>
<td>16M</td>
<td>分六步逐步扩展, 约 800B token</td>
</tr>
<tr>
<td>退火</td>
<td>知识固化与精细化</td>
<td>128K</td>
<td>16M</td>
<td>学习率线性降到 0, 上采样高质量数据</td>
</tr>
</tbody></table>
<p>这种阶段划分反映了「能力解耦」的训练哲学. 初始预训练阶段(约 14T token)专注于构建基础语言模型——语法、语义、世界知识和基本推理能力. 长上下文预训练阶段专门解决长距离注意力问题, 退火阶段则通过高质量数据的集中训练和 Polyak 平均来精细化模型.</p>
<h3 id="5-2-dtpckzcl">5.2 动态批次扩展策略</h3>
<p>Llama 3 采用了一种不常见的动态批次扩展策略: 在训练早期使用较小的批次(4M token)和较短的序列(4K), 随后在特定Checkpoint翻倍.</p>
<p>具体时间表:</p>
<ul>
<li>0-252M token: 批次 4M, 序列 4K</li>
<li>252M-2.87T token: 批次 8M, 序列 8K</li>
<li>2.87T token 之后: 批次 16M, 序列 8K(长上下文阶段逐步扩展到 128K)</li>
</ul>
<p>这种策略的工程动机是<strong>训练稳定性</strong>. 在训练初期, 模型参数随机初始化, 梯度噪声大, 小批次有助于稳定收敛. 随着模型逐渐习得基本语言模式, 梯度方向变得更加可靠, 可以安全地增加批次大小以提高硬件利用率. 这与 GPT-4 和 DeepSeek-V3 采用的「固定大批次」策略不同——后者在训练开始就使用大批次, 但需要更长的预热期和更保守的学习率.</p>
<hr>
<h2 id="6-ljdcsxwkz">6 六阶段长上下文扩展</h2>
<h3 id="6-1-jjskzdgclj">6.1 渐进式扩展的工程逻辑</h3>
<p>Llama 3 从 8K 到 128K 的上下文扩展不是一次性完成的, 而是分六个阶段逐步推进:</p>
<pre><code>8K -&gt; 16K -&gt; 32K -&gt; 64K -&gt; 128K
</code></pre>
<p>每个阶段, 模型在当前长度上继续预训练, 直到满足两个条件:</p>
<ol>
<li>短上下文评估上的性能完全恢复(不丢失已有能力).</li>
<li>完美解决到该长度的「大海捞针」任务(基本的长距离检索能力).</li>
</ol>
<p>这种渐进式扩展的核心洞察是: <strong>Transformer 的位置编码(尤其是 RoPE)对新长度的适应需要渐进学习</strong>. 如果直接将 8K 模型放到 128K 序列上训练, 模型可能对远距离位置的编码感到「困惑」——RoPE 的旋转角度在远距离上可能产生未见过的大值, 导致注意力权重分布异常.</p>
<p>从计算效率角度看, 渐进扩展也是必要的. 注意力计算的复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>, 128K 序列的单步计算量是 8K 的 256 倍. 如果在训练早期就使用 128K 序列, 大部分计算预算将被消耗在长上下文上, 而模型尚未具备基本的语言理解能力, 这是一种巨大的浪费.</p>
<h3 id="6-2-ywzbmwtddb">6.2 与位置编码外推的对比</h3>
<p>Llama 3 采用的是「继续预训练」策略, 而非纯位置编码外推(如 YaRN 或 NTK-aware 扩展). 继续预训练的优势在于: 模型不仅调整了位置编码, 还在长序列数据上学习了长距离依赖模式. 但代价是需要大量的额外训练 token(约 800B).</p>
<p>YaRN 等外推方法可以在不继续预训练的情况下扩展上下文, 但通常只在 2-8 倍的扩展范围内有效, 且长距离上的性能衰减明显. Llama 3 的 16 倍扩展(8K-&gt;128K)已经超出了纯外推方法的有效范围, 继续预训练是更可靠的选择.</p>
<hr>
<h2 id="7-4d-bhyxlxs">7 4D 并行与训练效率</h2>
<h3 id="7-1-bhcldzhlj">7.1 并行策略的组合逻辑</h3>
<p>Llama 3 405B 在 16K H100 GPU 上训练, 采用 4D 并行——四种并行策略的组合:</p>
<table>
<thead>
<tr>
<th>并行类型</th>
<th>分片维度</th>
<th>目的</th>
<th>Llama 3 405B 配置</th>
</tr>
</thead>
<tbody><tr>
<td>TP(Tensor Parallelism)</td>
<td>权重张量</td>
<td>减少单 GPU 显存占用</td>
<td>8(同节点 NVLink)</td>
</tr>
<tr>
<td>CP(Context Parallelism)</td>
<td>序列维度</td>
<td>支持超长序列</td>
<td>1(8K) / 16(128K)</td>
</tr>
<tr>
<td>PP(Pipeline Parallelism)</td>
<td>模型层</td>
<td>支持大模型</td>
<td>16</td>
</tr>
<tr>
<td>DP(Data Parallelism, FSDP)</td>
<td>数据批次</td>
<td>加速训练</td>
<td>64(8K) / 8(128K)</td>
</tr>
</tbody></table>
<p>四种并行的组合逻辑是层级化的:</p>
<ol>
<li><strong>TP=8</strong>: 在单节点 8 GPU 内部通过 NVLink 进行张量分片, 利用高带宽低延迟的节点内通信.</li>
<li><strong>PP=16</strong>: 将 126 层 Transformer 分成 16 个阶段, 每个阶段约 8 层. PP 的通信量小(只需传递激活值), 适合跨节点部署.</li>
<li><strong>CP=1/16</strong>: 在 8K 序列长度时不需要上下文并行; 在 128K 时启用 CP=16, 将序列分成 16 段分布在不同 GPU 上.</li>
<li><strong>DP=64/8</strong>: 数据并行决定全局批次大小. DP=64 时, 总 GPU 数 = TP<em>CP</em>PP<em>DP = 8</em>1<em>16</em>64 = 8,192; DP=8 时(128K), 总 GPU 数 = 8<em>16</em>16*8 = 16,384.</li>
</ol>
<h3 id="7-2-43-mfu-dgcyy">7.2 43% MFU 的工程意义</h3>
<p>Llama 3 405B 在 8K 序列长度时达到了 43% 的 BF16 MFU(Model FLOPs Utilization). 这意味着实际训练吞吐量达到了理论峰值算力的 43%.</p>
<p>MFU 的计算涉及多个因素:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>MFU</mtext><mo>=</mo><mfrac><mtext>实际训练吞吐量(TFLOPs/s)</mtext><mrow><mtext>GPU 峰值算力(TFLOPs/s)</mtext><mo>×</mo><mtext>GPU 数量</mtext></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{MFU} = \\frac{\\text{实际训练吞吐量(TFLOPs/s)}}{\\text{GPU 峰值算力(TFLOPs/s)} \\times \\text{GPU 数量}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">MFU</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">GPU </span><span class="mord cjk_fallback">峰值算力</span><span class="mord">(TFLOPs/s)</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">GPU </span><span class="mord cjk_fallback">数量</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord cjk_fallback">实际训练吞吐量</span><span class="mord">(TFLOPs/s)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>H100 的 BF16 密集峰值算力约为 989 TFLOPS(稀疏)或 495 TFLOPS(密集). 以 43% 的 MFU 计算, 每个 GPU 的有效算力约为 213 TFLOPS(基于密集峰值).</p>
<p>43% 的 MFU 在超大规模训练中属于优秀水平. 作为对比:</p>
<ul>
<li>GPT-4 的 MFU 估计在 30-40% 范围(未公开, 基于行业估算).</li>
<li>DeepSeek-V3 报告 42% 的 MFU.</li>
<li>一般大规模训练的 MFU 通常在 25-35%.</li>
</ul>
<p>Llama 3 的高 MFU 归功于精细的并行配置调优和 Meta 自研的通信优化. 但注意到, 128K 长上下文下的 MFU 降至 38%——注意力计算的二次方复杂度使得长序列阶段的硬件利用率下降. 这是所有长上下文模型面临的共同挑战.</p>
<h3 id="7-3-lsxbhdgcyh">7.3 流水线并行的工程优化</h3>
<p>Llama 3 团队在流水线并行上做了三项关键优化:</p>
<ol>
<li><p><strong>灵活的 micro-batch 数 N</strong>: 传统流水线要求 N 等于流水线阶段数或满足特定整除关系. Llama 3 修改了调度算法, 允许更灵活的 N 设置, 从而更好地匹配硬件批次约束.</p>
</li>
<li><p><strong>首末阶段负载均衡</strong>: 嵌入层和输出层通常消耗更多内存(大词表). Llama 3 从第一和最后阶段各减少一个 Transformer 层, 将节省的内存分配给嵌入和输出计算, 实现了各阶段的负载均衡.</p>
</li>
<li><p><strong>异步点对点通信</strong>: 在 PP 中采用异步通信替代同步阻塞, 显著减少了流水线气泡时间.</p>
</li>
</ol>
<blockquote>
<p>译者注: 这些优化看似是「工程微调」, 但在 16K GPU 的规模下, 每 1% 的 MFU 提升都意味着数十万美元的计算成本节约. 以 3080 万 H100 GPU 小时计算, 如果 MFU 从 38% 提升到 43%, 节省的训练时间约为 360 万 GPU 小时, 相当于约 5000 万美元的成本节约(按 H100 每小时 1.5 美元估算). 这正是为什么超大规模训练团队会投入大量工程师专门优化并行效率的原因.</p>
</blockquote>
<hr>
<h2 id="8-jqkkx-54-t-466-czddqs">8 集群可靠性: 54 天 466 次中断的启示</h2>
<h3 id="8-1-gzdtjhx">8.1 故障的统计画像</h3>
<p>Llama 3 405B 的预训练在 54 天内经历了 466 次作业中断, 平均每天 8.6 次. 中断根因分布如下:</p>
<table>
<thead>
<tr>
<th>类别</th>
<th>占比</th>
<th>主要子项</th>
</tr>
</thead>
<tbody><tr>
<td>GPU 硬件故障</td>
<td>58.7%</td>
<td>故障 GPU(30.1%), HBM3 内存错误(17.2%), SRAM(4.5%), 系统处理器(4.1%), SDC(1.4%), 热界面(1.4%)</td>
</tr>
<tr>
<td>软件/依赖</td>
<td>12.9%</td>
<td>软件 Bug</td>
</tr>
<tr>
<td>网络</td>
<td>8.4%</td>
<td>交换机/线缆故障</td>
</tr>
<tr>
<td>非计划维护</td>
<td>7.6%</td>
<td>主机维护</td>
</tr>
<tr>
<td>其他</td>
<td>12.4%</td>
<td>NIC, SSD, 电源, CPU 等</td>
</tr>
</tbody></table>
<p>这里最令人警醒的数字是「静默数据损坏」(SDC, Silent Data Corruption)——6 次中断, 占比 1.4%. SDC 是指 GPU 计算过程中由于硬件错误(如位翻转)产生了错误结果, 但没有触发任何错误报告机制. 这意味着模型可能在「无感知」的情况下学习到错误的模式, 导致训练质量下降或模型行为异常.</p>
<h3 id="8-2-zdhrcjz">8.2 自动化容错机制</h3>
<p>尽管故障数量庞大, 期间仅需 3 次重大人工干预. 这背后是 Meta 的自动化容错系统:</p>
<ol>
<li><strong>频繁Checkpoint</strong>: 训练状态定期保存到分布式存储(Tectonic), 故障后从最近的Checkpoint恢复.</li>
<li><strong>校验和验证</strong>: 对关键计算结果进行校验和检查, 检测潜在的 SDC.</li>
<li><strong>自动故障诊断</strong>: 系统能够快速识别故障 GPU 并将其从训练中隔离, 无需停止整个作业.</li>
<li><strong>热插拔维护</strong>: 支持在训练进行中进行固件升级和硬件维护, 通过计划中断最小化影响.</li>
</ol>
<p>这里值得停下来想一下 SDC 的检测难题. 传统的 ECC(Error-Correcting Code)内存可以检测和纠正单比特错误, 但 H100 的 HBM3 和 SRAM 中的 ECC 覆盖范围有限. 某些计算路径(如 Tensor Core 的某些操作模式)可能没有完整的 ECC 保护. SDC 的可怕之处在于它的「不可检测性」——如果没有校验和机制, 错误的梯度更新会被正常地应用到模型参数上, 模型继续训练, 但收敛轨迹已经偏离了正确路径. 在极端情况下, SDC 可能导致模型在某些特定输入上产生系统性错误, 而这种错误在标准评测中可能无法被发现.</p>
<hr>
<h2 id="9-hxllc-sft-rs-dpo-dlldd">9 后训练流程: SFT + RS + DPO 的六轮迭代</h2>
<h3 id="9-1-wsmfq-ppo">9.1 为什么放弃 PPO?</h3>
<p>Llama 2 使用 RLHF(PPO)进行偏好对齐, 但 Llama 3 改为 DPO(Direct Preference Optimization). 这一转变反映了业界对 PPO 复杂性的反思:</p>
<ul>
<li>PPO 需要维护奖励模型、价值网络、策略网络三个模型, 内存开销大.</li>
<li>PPO 的在线采样需要生成大量候选响应, 计算成本高.</li>
<li>PPO 的训练稳定性差, 容易出现 reward hacking 或策略崩溃.</li>
<li>PPO 的超参数敏感(clip ratio、KL penalty、advantage estimation 等).</li>
</ul>
<p>DPO 将偏好学习转化为一个分类问题, 直接从成对偏好数据优化策略, 无需奖励模型和价值网络. Llama 3 报告称 「DPO 需要更少的计算量且表现更好, 特别是在 IFEval 等指令遵循基准上」.</p>
<p>但 DPO 也有其局限性: 对偏好数据质量要求极高, 且容易过拟合到训练时的偏好分布, 泛化到新领域的能力可能弱于 PPO. Llama 3 通过六轮迭代来缓解这一问题——每轮使用上一轮的最佳模型重新采样和标注偏好数据, 使训练数据不断「刷新」.</p>
<h3 id="9-2-jjcy-tlsjshxlsjzl">9.2 拒绝采样: 推理时计算换训练数据质量</h3>
<p>Llama 3 的后训练中, 拒绝采样(RS)是一个关键的数据增强步骤. 对于每个提示, 从策略模型采样 K(10-30)个输出, 用奖励模型选择最佳候选.</p>
<p>从计算角度看, RS 是一种「推理时计算换训练数据质量」的策略. 生成 30 个候选响应的计算成本是单次生成的 30 倍, 但换来的是更高质量的 SFT 数据. 这种 trade-off 在训练后期尤其有效——当模型本身已经具备较强能力时, 从 30 个候选中筛选出的「精华」响应质量远高于随机采样.</p>
<p>Llama 3 还使用了 PagedAttention 来加速 RS. PagedAttention 通过动态 KV Cache 分配, 避免了传统实现中为每个序列预留最大长度内存的浪费, 使得在相同 GPU 内存下可以并行处理更多的采样请求.</p>
<h3 id="9-3-lldddjjjl">9.3 六轮迭代的渐进精炼</h3>
<p>Llama 3 的后训练遵循六轮迭代流程:</p>
<pre><code>轮 1: 预训练Checkpoint -&gt; RM -&gt; SFT(基础数据) -&gt; DPO
轮 2: 轮 1 最佳模型 -&gt; 新 RM -&gt; SFT(RS 增强) -&gt; DPO
...
轮 6: 轮 5 最佳模型 -&gt; 最终 RM -&gt; SFT(多轮精炼) -&gt; DPO
</code></pre>
<p>每轮迭代的核心价值在于「数据刷新」: 使用能力更强的模型生成更高质量的训练样本, 同时人工标注也基于更强模型的输出来评估和编辑. 这种「自举」(bootstrapping)策略使得模型能力在每一轮都有提升, 而不像单轮训练那样受限于初始数据的质量上限.</p>
<p>但六轮迭代也带来了成本问题. 每轮都需要重新训练奖励模型、执行拒绝采样、进行 SFT 和 DPO. 对于 405B 模型, 单轮后训练可能就消耗数百万 GPU 小时, 六轮的总成本可能接近甚至超过预训练成本的 10-20%. Meta 没有公开后训练的具体成本, 但从工程投入推断, 这绝非小数.</p>
<hr>
<h2 id="10-zhsdmtjg">10 组合式多模态架构</h2>
<h3 id="10-1-spqff-vs-dddxl">10.1 适配器方法 vs 端到端训练</h3>
<p>Llama 3 的多模态扩展(图像、视频、语音)采用了「组合式方法」——保持核心语言模型冻结, 通过适配器(adapter)集成新的Encoder .</p>
<p>具体架构:</p>
<ul>
<li><strong>图像</strong>: ViT Encoder  + 交叉注意力适配器 -&gt; 语言模型.</li>
<li><strong>视频</strong>: 在图像适配器之上添加时序聚合适配器 -&gt; 语言模型.</li>
<li><strong>语音</strong>: 自监督语音Encoder  + 线性投影适配器 -&gt; 语言模型.</li>
</ul>
<p>这种设计与 GPT-4V、Gemini 等「端到端多模态」模型的本质区别在于: <strong>语言模型的权重在多模态训练中保持不变</strong>. 这意味着:</p>
<ol>
<li><strong>语言能力的保护</strong>: 多模态训练不会「污染」语言模型的已有能力——这是端到端训练常见的问题, 多模态数据可能稀释语言理解能力.</li>
<li><strong>模块化开发</strong>: 不同模态的适配器可以独立开发和迭代, 无需重新训练整个模型.</li>
<li><strong>推理灵活性</strong>: 纯文本推理时, 适配器可以完全旁路, 不产生额外计算开销.</li>
</ol>
<p>但代价是模态融合的深度受限. 交叉注意力适配器只在特定层将视觉/音频表示注入语言模型, 这种「浅层融合」可能无法捕捉复杂的跨模态关联(如视频中的时序推理与语言描述的深度对齐). 端到端训练虽然风险更高, 但理论上可以实现更深度的模态融合.</p>
<hr>
<h2 id="11-jx-fxywjwt">11 局限、风险与未解问题</h2>
<h3 id="11-1-tlcbdxsys">11.1 推理成本的现实约束</h3>
<p>Llama 3 405B 的 dense 架构带来了严峻的推理成本挑战. 405B 参数在 FP16 精度下需要约 810 GB 显存, 即使使用 4-bit 量化也需要约 230 GB. 这意味着单机部署(8xH100, 80GB each)只能容纳量化版本, 且 batch size 受限.</p>
<p>社区实测数据显示, Llama 3.1 405B Q3_K_S 量化在 3 节点x2 GPU 的配置下, 输出吞吐量仅约 0.8 token/s——这对于交互式应用是不可接受的. 相比之下, DeepSeek-V3(671B 总参数, 37B 激活)在相似硬件上可以达到更高的有效吞吐量, 因为每次前向只激活 5.5% 的参数.</p>
<h3 id="11-2-dyyfgdjx">11.2 多语言覆盖的局限</h3>
<p>Llama 3 官方支持 8 种语言(英语、德语、法语、意大利语、葡萄牙语、印地语、西班牙语、泰语). 这与 Qwen3(119 种语言)和 Qwen3.5(201 种语言)相比差距巨大. 对于全球部署场景, Llama 3 在低资源语言上的能力明显不足.</p>
<h3 id="11-3-csxwdzsnlbj">11.3 长上下文的真实能力边界</h3>
<p>虽然 Llama 3 支持 128K 上下文, 但「支持」不等于「有效利用」. 大海捞针测试(Needle in a Haystack)显示 405B 模型在 128K 上的检索准确率约为 98.1%, 但这只是一个简单的信息检索任务. 在真实的多文档推理、长程依赖推理任务中, 128K 上下文的实际有效利用率尚未被充分验证.</p>
<hr>
<h2 id="12-zj">12 总结</h2>
<p>Llama 3 的架构设计体现了 Meta 的工程哲学: <strong>用极致的规模和可靠性, 证明 dense Transformer 的上限</strong>.</p>
<ol>
<li><p><strong>Dense 路线的坚守</strong>: 在 MoE 浪潮中坚持 dense, 用 405B 参数和 15.6T token 证明了开源模型可以达到 GPT-4 级别性能. 代价是训练成本远高于 MoE 竞品.</p>
</li>
<li><p><strong>渐进式能力培养</strong>: 三阶段预训练(初始-&gt;长上下文-&gt;退火)和六轮后训练迭代, 将复杂的能力培养分解为可控的渐进步骤.</p>
</li>
<li><p><strong>超大规模工程</strong>: 16K H100 GPU、43% MFU、54 天 466 次故障的自动化应对, 展现了工业级训练基础设施的成熟度.</p>
</li>
</ol>
<p>从算法家族树的角度看, Llama 3 是「scale is all you need」理念在 dense 架构上的终极验证. 它影响了后续 Llama 3.2/3.3 的多模态扩展, 也为 Llama 4 最终转向 MoE 提供了对比基准——当 dense 路线的成本收益曲线触及拐点时, 即使是 Meta 也不得不拥抱稀疏架构.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jgzlypxdw","text":"1 架构总览与谱系定位"},{"level":2,"id":"2-dense-vs-moe-dzljz","text":"2 Dense vs MoE 的战略抉择"},{"level":3,"id":"2-1-wsmjj-moe","text":"2.1 为什么拒绝 MoE?"},{"level":3,"id":"2-2-dense-lxdxnsx","text":"2.2 Dense 路线的性能上限"},{"level":2,"id":"3-mxjgdgcxj","text":"3 模型架构的工程细节"},{"level":3,"id":"3-1-gqa-c-128-d-8-d-kv-tys","text":"3.1 GQA: 从 128 到 8 的 KV 头压缩"},{"level":3,"id":"3-2-rope-jstz-c-10k-d-500k","text":"3.2 RoPE 基数调整: 从 10K 到 500K"},{"level":3,"id":"3-3-128k-cb-dyydysys","text":"3.3 128K 词表: 多语言的压缩艺术"},{"level":2,"id":"4-sfdlyjszy","text":"4 缩放定律与计算最优"},{"level":3,"id":"4-1-iso-flo-ps-ymlnh","text":"4.1 IsoFLOPs 与幂律拟合"},{"level":3,"id":"4-2-yhxsfdlddb","text":"4.2 与后续缩放定律的对比"},{"level":2,"id":"5-sjdyxlfa","text":"5 三阶段预训练方案"},{"level":3,"id":"5-1-jdhfdnlpymb","text":"5.1 阶段划分的能力培养目标"},{"level":3,"id":"5-2-dtpckzcl","text":"5.2 动态批次扩展策略"},{"level":2,"id":"6-ljdcsxwkz","text":"6 六阶段长上下文扩展"},{"level":3,"id":"6-1-jjskzdgclj","text":"6.1 渐进式扩展的工程逻辑"},{"level":3,"id":"6-2-ywzbmwtddb","text":"6.2 与位置编码外推的对比"},{"level":2,"id":"7-4d-bhyxlxs","text":"7 4D 并行与训练效率"},{"level":3,"id":"7-1-bhcldzhlj","text":"7.1 并行策略的组合逻辑"},{"level":3,"id":"7-2-43-mfu-dgcyy","text":"7.2 43% MFU 的工程意义"},{"level":3,"id":"7-3-lsxbhdgcyh","text":"7.3 流水线并行的工程优化"},{"level":2,"id":"8-jqkkx-54-t-466-czddqs","text":"8 集群可靠性: 54 天 466 次中断的启示"},{"level":3,"id":"8-1-gzdtjhx","text":"8.1 故障的统计画像"},{"level":3,"id":"8-2-zdhrcjz","text":"8.2 自动化容错机制"},{"level":2,"id":"9-hxllc-sft-rs-dpo-dlldd","text":"9 后训练流程: SFT + RS + DPO 的六轮迭代"},{"level":3,"id":"9-1-wsmfq-ppo","text":"9.1 为什么放弃 PPO?"},{"level":3,"id":"9-2-jjcy-tlsjshxlsjzl","text":"9.2 拒绝采样: 推理时计算换训练数据质量"},{"level":3,"id":"9-3-lldddjjjl","text":"9.3 六轮迭代的渐进精炼"},{"level":2,"id":"10-zhsdmtjg","text":"10 组合式多模态架构"},{"level":3,"id":"10-1-spqff-vs-dddxl","text":"10.1 适配器方法 vs 端到端训练"},{"level":2,"id":"11-jx-fxywjwt","text":"11 局限、风险与未解问题"},{"level":3,"id":"11-1-tlcbdxsys","text":"11.1 推理成本的现实约束"},{"level":3,"id":"11-2-dyyfgdjx","text":"11.2 多语言覆盖的局限"},{"level":3,"id":"11-3-csxwdzsnlbj","text":"11.3 长上下文的真实能力边界"},{"level":2,"id":"12-zj","text":"12 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/03-llama-3/05-llama-3-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/03-llama-3/05-llama-3-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama 3 核心架构剖析</h1>
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
