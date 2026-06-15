"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Ling 2.5 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.16-Ling 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>来源</strong>: Inclusion AI 官方博客、HuggingFace Model Card、技术社区分析<br><strong>发布日期</strong>: 2026-02-17<br><strong>模型</strong>: <a href="https://huggingface.co/inclusionAI/Ling-2.5-1T">Ling-2.5-1T</a> | <a href="https://huggingface.co/inclusionAI/Ring-2.5-1T">Ring-2.5-1T</a><br><strong>系列定位</strong>: 面向通用智能体(General Agent)时代的万亿参数混合线性注意力架构</p>
</blockquote>
<hr>
<h2 id="y-mxglydw">一、模型概览与定位</h2>
<p>Ling 2.5 是 Inclusion AI 在 Ling 2.0 基础上的<strong>架构升级版本</strong>，核心目标是从&quot;推理导向基座&quot;进化为&quot;智能体时代基础设施&quot;。随着通用智能体(General Agent)逐步成为大模型的核心应用形态，<strong>深度推理能力</strong>与<strong>超长上下文建模能力</strong>成为新代模型的关键指标。这对模型在长视野推理解码阶段的<strong>吞吐效率、显存占用与时延稳定性</strong>提出了远高于以往的要求。</p>
<p>Ling 2.5 包含两个变体：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>类型</th>
<th>总参数</th>
<th>激活参数</th>
<th>核心特色</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Ling-2.5-1T</strong></td>
<td>Instruct(非思考)</td>
<td>1T</td>
<td>~63B</td>
<td>混合线性注意力，长上下文高效推理</td>
</tr>
<tr>
<td><strong>Ring-2.5-1T</strong></td>
<td>Thinking(思考)</td>
<td>1T</td>
<td>~63B</td>
<td>全球首个基于混合线性架构的万亿参数推理模型</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>命名说明</strong>: &quot;Ring&quot; 系列是 Ling 家族的思考型(thinking)变体，与 Ling 系列的非思考型(non-thinking/instruct)形成互补。Ring-2.5-1T 是全球首个基于混合线性架构的万亿参数推理模型。</p>
</blockquote>
<hr>
<h2 id="e-hxjgcx-hhxxzyl-hybrid-linear-attention">二、核心架构创新：混合线性注意力(Hybrid Linear Attention)</h2>
<h3 id="2-1-jgyjlx">2.1 架构演进路线</h3>
<p>Ling 2.5 并非从零训练，而是在已训练好的 <strong>Ling-2.0-1T</strong> 基础上，通过<strong>增量式结构迁移</strong>完成架构升级：</p>
<pre><code>Ling 2.0 (GQA + MoE) 
    ↓ 增量训练 Stage A
Ling 2.5 Stage A (Lightning Attention + GQA 混合)
    ↓ 增量训练 Stage B (线性 warmup)
Ling 2.5 Stage B (稳定过渡)
    ↓ 增量训练 Stage C (GQA → MLA 转换)
Ling 2.5 Stage C (MLA + Lightning 混合)
    ↓ 全参数训练 Stage D
Ling 2.5 Final (1:7 MLA + Lightning Linear)
</code></pre>
<h3 id="2-2-1-7-hhblsj">2.2 1:7 混合比例设计</h3>
<p>Ling 2.5 的核心创新是将 Ling 2.0 的 GQA(Grouped Query Attention)注意力机制升级为 <strong>MLA + Lightning Linear 按 1:7 比例混合</strong> 的结构：</p>
<ul>
<li><strong>1 层 MLA(Multi-head Latent Attention)</strong>：承担精确检索和长程依赖建模，保留传统 attention 的表达能力</li>
<li><strong>7 层 Lightning Linear Attention</strong>：承担高吞吐解码路径，以接近线性的时间复杂度处理长序列</li>
</ul>
<p><strong>为什么 1:7？</strong> 这一比例基于 Inclusion AI 此前发布的 <strong>Ring-Flash-Linear-2.0</strong> 技术路线中的大量实验验证。其核心权衡是：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>纯 MLA</th>
<th>纯 Lightning Linear</th>
<th>1:7 混合</th>
</tr>
</thead>
<tbody><tr>
<td>表达能力</td>
<td>强</td>
<td>较弱</td>
<td>强(MLA 层补偿)</td>
</tr>
<tr>
<td>长序列吞吐</td>
<td>中等</td>
<td>极高</td>
<td>高</td>
</tr>
<tr>
<td>KV Cache 占用</td>
<td>中等</td>
<td>极低</td>
<td>低</td>
</tr>
<tr>
<td>训练稳定性</td>
<td>高</td>
<td>中等</td>
<td>高(渐进迁移)</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>与 Qwen3.5 / Kimi Linear 的对比</strong>：Ling 2.5、Qwen3.5 和 Kimi Linear 都属于&quot;线性注意力混合架构&quot;这一新兴范式，但三者在&quot;轻量侧&quot;和&quot;重量侧&quot;的选择不同：</p>
<ul>
<li>Qwen3.5：Gated DeltaNet + Gated Attention</li>
<li>Kimi Linear：Kimi Delta Attention(Gated DeltaNet 改进)+ Gated MLA</li>
<li><strong>Ling 2.5</strong>：Lightning Attention + MLA(来自 DeepSeek)</li>
</ul>
</blockquote>
<h3 id="2-3-lightning-linear-attention">2.3 Lightning Linear Attention</h3>
<p>Lightning Attention 是 Ling 2.5 在&quot;轻量侧&quot;采用的具体机制。它是一种<strong>循环线性注意力变体</strong>(recurrent linear attention variant)，比 Gated DeltaNet 更简单，但在长序列上仍能保持极高的计算效率。</p>
<p>线性注意力的核心思想是将标准 attention 的 softmax 替换为核函数点积，使注意力计算从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Standard Attention: </mtext><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo><mspace width="1em"/><mo>→</mo><mspace width="1em"/><mtext>Linear Attention: </mtext><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Standard Attention: } O(n^2 \\cdot d) \\quad \\rightarrow \\quad \\text{Linear Attention: } O(n \\cdot d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1141em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Standard Attention: </span></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Linear Attention: </span></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1141em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>对于长序列(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>≫</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">n \\gg d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span>)，线性注意力的优势极为显著。</p>
<h3 id="2-4-mla-dyrysp">2.4 MLA 的引入与适配</h3>
<p>Ling 2.5 在&quot;重量侧&quot;采用 DeepSeek 提出的 MLA(Multi-head Latent Attention)机制，以进一步压缩 KV Cache：</p>
<p><strong>从 GQA 到 MLA 的转换挑战</strong>：</p>
<ol>
<li><p><strong>QK Norm 非线性</strong>：Ling 2.0 引入的 QKNorm 会阻碍 MLA 推理阶段的高效 KV absorption。解决方案：通过采样校准将 QKNorm 吸收到 q_proj / k_proj 权重中。</p>
</li>
<li><p><strong>Partial RoPE 不兼容</strong>：Ling 2.0 使用的 Partial RoPE(仅前 64 维应用位置编码)与 Full RoPE 假设的转换方法不兼容。解决方案：仅对 RoPE 相关维度进行操作，然后重新组合。</p>
</li>
</ol>
<p><strong>转换效果</strong>：在 Ling-mini/flash 规模上的消融实验表明，转换并持续训练后，性能快速恢复并可超越 GQA 基线。</p>
<h3 id="2-5-csxwnl">2.5 长上下文能力</h3>
<p>Ling 2.5 的上下文窗口从 Ling 2.0 的 128K 扩展到 <strong>256K → 1M tokens</strong>。混合线性注意力架构在这一尺度上的优势尤为明显：</p>
<ul>
<li>在 <strong>32K tokens</strong> 序列长度下，Ling-2.5-1T 的吞吐量比同规模(1T 参数)的 Kimi-K2 高 <strong>3.5 倍</strong></li>
<li>KV Cache 资源消耗大幅降低，使长文本推理的显存压力显著缓解</li>
</ul>
<hr>
<h2 id="s-xlcl-zlsjgqy">三、训练策略：增量式结构迁移</h2>
<h3 id="3-1-sjdqylc">3.1 四阶段迁移流程</h3>
<p><strong>Stage A: GQA → Lightning Attention + GQA 混合</strong></p>
<ul>
<li>扩展 linear_qkv 的头维度</li>
<li>初始化新引入的门控参数</li>
<li>早期过渡阶段保留 QK Norm 和 Partial RoPE 以确保稳定性</li>
</ul>
<p><strong>Stage B: 线性 Warmup</strong></p>
<ul>
<li>冻结大部分参数，仅解冻 attention 关键转换部分</li>
<li>使用 LR warmup + 有限持续训练快速恢复转换前的 loss 水平</li>
</ul>
<p><strong>Stage C: GQA → MLA 转换</strong></p>
<ul>
<li>通过采样校准将 QK Norm 吸收到 q_proj / k_proj</li>
<li>应用 Partial-RoPE 兼容的转换</li>
<li>短 warmup 恢复临时 PPL 增长</li>
</ul>
<p><strong>Stage D: 全参数训练</strong></p>
<ul>
<li>确认稳定性后解冻所有参数</li>
<li>在目标规模下继续全量训练</li>
</ul>
<h3 id="3-2-xlgm">3.2 训练规模</h3>
<p>Ling 2.5 的总训练数据量达到 <strong>29T tokens</strong>，超越 Ling 2.0 的 20T tokens。</p>
<hr>
<h2 id="s-mxbxyxsfx">四、模型表现与效率分析</h2>
<h3 id="4-1-xsdb">4.1 效率对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>32K 吞吐(相对)</th>
<th>上下文长度</th>
<th>架构</th>
</tr>
</thead>
<tbody><tr>
<td>Kimi-K2</td>
<td>1T</td>
<td>1.0× (baseline)</td>
<td>128K</td>
<td>Dense + MLA</td>
</tr>
<tr>
<td><strong>Ling-2.5-1T</strong></td>
<td><strong>1T</strong></td>
<td><strong>3.5×</strong></td>
<td><strong>256K→1M</strong></td>
<td><strong>MoE + MLA + Lightning</strong></td>
</tr>
<tr>
<td>Qwen3.5</td>
<td>~235B</td>
<td>~2.0× (估计)</td>
<td>128K→1M</td>
<td>Dense/MoE + Gated DeltaNet</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>注</strong>：3.5× 吞吐量提升来自 Ling 2.5 官方 model hub 页面报告，在相同 1T 参数规模下对比。</p>
</blockquote>
<h3 id="4-2-dwsm">4.2 定位说明</h3>
<p>Ling 2.5 的绝对 benchmark 性能并非其首要卖点。Sebastian Raschka 的技术分析指出：</p>
<blockquote>
<p>&quot;Ling 2.5 is not the strongest model in terms of absolute benchmark performance, but its selling point is very good efficiency in long contexts (due to the hybrid attention).&quot;</p>
</blockquote>
<p>换言之，Ling 2.5 选择了一条与 DeepSeek-V3(追求精度)和 Kimi-K2(追求 Agent 能力)不同的路线——<strong>追求长上下文场景下的极致效率</strong>。</p>
<hr>
<h2 id="w-zntnl">五、智能体能力</h2>
<p>Ling 2.5 面向 General Agent 时代设计，在以下 Agent 相关能力上进行了重点优化：</p>
<ul>
<li><strong>长视野推理</strong>：支持多轮思考、长程规划和复杂任务分解</li>
<li><strong>工具调用</strong>：与主流 Agent 框架(如 OpenClaw、CodeBuddy)兼容</li>
<li><strong>代码生成</strong>：继承 Ling 2.0 的代码推理优势，在长代码上下文中保持高效</li>
</ul>
<hr>
<h2 id="l-kycl">六、开源策略</h2>
<p>Ling 2.5 采用<strong>全系列开源</strong>策略：</p>
<ul>
<li>Ling-2.5-1T 和 Ring-2.5-1T 的权重和代码均已开源</li>
<li>HuggingFace 模型卡提供详细的技术规格和使用说明</li>
<li>与 Ling 2.0 一样，遵循开放的许可协议</li>
</ul>
<hr>
<h2 id="q-jspxyyjlj">七、技术谱系与演进逻辑</h2>
<table>
<thead>
<tr>
<th>代际</th>
<th>时间</th>
<th>核心架构</th>
<th>关键创新</th>
<th>定位</th>
</tr>
</thead>
<tbody><tr>
<td>Ling-Lite/Plus</td>
<td>2025-03</td>
<td>MoE + GQA</td>
<td>EDiT 异步训练、跨平台对齐</td>
<td>普惠训练</td>
</tr>
<tr>
<td>Ling 2.0</td>
<td>2025-10</td>
<td>MoE + GQA + MTP</td>
<td>Evo-CoT、LPO、FP8 全训练</td>
<td>推理导向基座</td>
</tr>
<tr>
<td><strong>Ling 2.5</strong></td>
<td><strong>2026-02</strong></td>
<td><strong>MoE + MLA + Lightning</strong></td>
<td><strong>混合线性注意力、增量迁移</strong></td>
<td><strong>Agent 时代基础设施</strong></td>
</tr>
</tbody></table>
<p>Ling 2.5 的演进逻辑清晰：在保持 MoE 稀疏激活优势的同时，将注意力机制从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的 GQA 升级为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 的混合线性架构，以应对 Agent 时代长上下文、多轮交互的核心需求。这不是对 Ling 2.0 的否定，而是<strong>面向新应用场景的架构适配</strong>。</p>
<hr>
<h2 id="b-gjsjsc">八、关键数据速查</h2>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>总参数</td>
<td>1T</td>
</tr>
<tr>
<td>激活参数</td>
<td>~63B</td>
</tr>
<tr>
<td>注意力混合比例</td>
<td>1:7 (MLA : Lightning Linear)</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>256K → 1M</td>
</tr>
<tr>
<td>训练数据</td>
<td>29T tokens</td>
</tr>
<tr>
<td>32K 吞吐提升</td>
<td>3.5× (vs Kimi-K2)</td>
</tr>
<tr>
<td>发布日期</td>
<td>2026-02-17</td>
</tr>
<tr>
<td>开源策略</td>
<td>全系列开源</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxglydw","text":"一、模型概览与定位"},{"level":2,"id":"e-hxjgcx-hhxxzyl-hybrid-linear-attention","text":"二、核心架构创新：混合线性注意力(Hybrid Linear Attention)"},{"level":3,"id":"2-1-jgyjlx","text":"2.1 架构演进路线"},{"level":3,"id":"2-2-1-7-hhblsj","text":"2.2 1:7 混合比例设计"},{"level":3,"id":"2-3-lightning-linear-attention","text":"2.3 Lightning Linear Attention"},{"level":3,"id":"2-4-mla-dyrysp","text":"2.4 MLA 的引入与适配"},{"level":3,"id":"2-5-csxwnl","text":"2.5 长上下文能力"},{"level":2,"id":"s-xlcl-zlsjgqy","text":"三、训练策略：增量式结构迁移"},{"level":3,"id":"3-1-sjdqylc","text":"3.1 四阶段迁移流程"},{"level":3,"id":"3-2-xlgm","text":"3.2 训练规模"},{"level":2,"id":"s-mxbxyxsfx","text":"四、模型表现与效率分析"},{"level":3,"id":"4-1-xsdb","text":"4.1 效率对比"},{"level":3,"id":"4-2-dwsm","text":"4.2 定位说明"},{"level":2,"id":"w-zntnl","text":"五、智能体能力"},{"level":2,"id":"l-kycl","text":"六、开源策略"},{"level":2,"id":"q-jspxyyjlj","text":"七、技术谱系与演进逻辑"},{"level":2,"id":"b-gjsjsc","text":"八、关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.16-ling/04-ling-2.5/01-ling-2.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.16-ling/04-ling-2.5/01-ling-2.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ling 2.5 技术报告精译</h1>
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
