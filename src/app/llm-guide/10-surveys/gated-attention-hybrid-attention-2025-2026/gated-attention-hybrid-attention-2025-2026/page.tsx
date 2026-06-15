"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gated Attention 与混合注意力: 2025-2026 LLM 架构最大突破</h1>
<blockquote>
<p>本文基于 Gated Attention(NeurIPS 2025 Best Paper)作者自述、Qwen3-Next 完整技术解析、Qwen3.5-Plus 工业级实践等多篇最新资料撰写. 信息截至 2026 年 5 月. </p>
</blockquote>
<h2 id="1-bj-attention-sink-wtdfx">1. 背景: Attention Sink 问题的发现</h2>
<p>2023 年,Streaming LLM 研究首次揭示了 <strong>Attention Sink 现象</strong>: 在多层 Transformer 中,越深的层越倾向于关注第一个 token(通常是 BOS 或句首 token),这些 token 像&quot; sinks&quot;一样吸收了大量的注意力权重. </p>
<p>这个现象的背后原因直到 2025 年才被彻底理解. Qwen 团队在《Gated Attention for Large Language Models》一文中给出了关键洞察: </p>
<blockquote>
<p>**Attention Sink 的根源在于 Softmax 的固有属性. ** Softmax 要求对所有输出求和为 1,因此即使某个位置的上下文信息与当前查询完全无关,模型也必须分配一些注意力权重到这个位置上——否则 Softmax 的归一化就会出问题. </p>
</blockquote>
<p>换句话说,**Attention Sink 不是 bug,而是 Softmax 约束下的必然产物. ** 当模型在某个位置上没有任何需要关注的信息时,它仍然需要维持注意力权重的总和为 1. </p>
<h2 id="2-gated-attention-cgysxc-attention-sink">2. Gated Attention: 从根源上消除 Attention Sink</h2>
<h3 id="2-1-hxsx">2.1 核心思想</h3>
<p>Gated Attention 的核心创新极其简洁: **在注意力输出后添加一个可学习的门控(gate)机制. **</p>
<p>具体实现: </p>
<pre><code class="language-python"># q_proj 中同时生成 query 和 gate
query_states, gate = torch.chunk(
    self.q_proj(hidden_states).view(*input_shape, -1, self.head_dim * 2),
    2, dim=-1
)

# 标准 attention 计算
attn_output = standard_attention(query_states, key_states, value_states)

# 门控筛选
attn_output = attn_output * torch.sigmoid(gate)
</code></pre>
<p>当上下文与当前查询无关时,门控输出接近 0,模型<strong>不需要通过 Softmax 强行分配一个 Sink token</strong>,而是通过门控将输出 Y 乘以一个接近 0 的系数,直接阻断信息流. 实验证实: Gated 模型的第一 token 注意力占比从 Baseline 的显著比例降到了接近 0. </p>
<h3 id="2-2-g1-wzdgjfx">2.2 G1 位置的关键发现</h3>
<p>Qwen 团队实验了四种门控放置位置: </p>
<table>
<thead>
<tr>
<th align="left">位置</th>
<th align="left">描述</th>
<th align="center">效果</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>G1</strong></td>
<td align="left">gate 在 Attn 输出后(Y × gate)</td>
<td align="center"><strong>最优</strong> ✅</td>
</tr>
<tr>
<td align="left">G2</td>
<td align="left">gate 在 Softmax 前</td>
<td align="center">无法使输出为 0</td>
</tr>
<tr>
<td align="left">G3</td>
<td align="left">gate 在 V 上</td>
<td align="center">无法使输出为 0</td>
</tr>
<tr>
<td align="left">G4</td>
<td align="left">gate 在 Q 之前</td>
<td align="center">最差 ❌</td>
</tr>
</tbody></table>
<p><strong>G1 位置最优的原因</strong>: 只有将门控放在注意力输出的最终位置,才能从根本上控制&quot;模型是否需要输出任何信息&quot;——这是门控消除 Attention Sink 的关键. </p>
<h3 id="2-3-xsxdyr">2.3 稀疏性的引入</h3>
<p>一个更深层的洞察是: **Attention 中需要稀疏性,但模型需要以 Sink 或 Gate 的方式来引入稀疏性. **</p>
<p>Sink 是 Softmax 强制归一化下的&quot;被动稀疏&quot;,而 Gate 是数据依赖的&quot;主动稀疏&quot;. 有效的稀疏性是一个重要的 inductive bias——它能加速模型收敛、提高训练稳定性、帮助模型更好地 Scaling. </p>
<p>作者原话: </p>
<blockquote>
<p>&quot;我觉得很有启发的点包括: attention 中需要稀疏性,但是模型需要以 sink 或者 gate 的方式来引入稀疏性; 有效地引入稀疏性能加速模型的收敛(或者说合理的稀疏性是一个有效的 inductive bias)&quot;</p>
</blockquote>
<h2 id="3-c-gated-attention-dhhzyl-qwen3-next-dsj">3. 从 Gated Attention 到混合注意力: Qwen3-Next 的实践</h2>
<h3 id="3-1-hybrid-attention-gated-delta-net-gated-attention-d-3-1-hh">3.1 Hybrid Attention: Gated DeltaNet + Gated Attention 的 3:1 混合</h3>
<p>Qwen3-Next 使用了 <strong>Hybrid Attention</strong> 架构——这是 Gated Attention 的第一次大规模工业落地. 设计如下: </p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="center">比例</th>
<th align="left">作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Gated DeltaNet</strong>(线性注意力)</td>
<td align="center"><strong>3 份</strong></td>
<td align="left">高效长程依赖建模,无 KV Cache 瓶颈</td>
</tr>
<tr>
<td align="left"><strong>Gated Attention</strong>(标准注意力)</td>
<td align="center"><strong>1 份</strong></td>
<td align="left">精确召回,消除 Attention Sink</td>
</tr>
</tbody></table>
<p>3:1 的比例是 Qwen 团队大量实验调出来的最优比——在效率和精度之间取得最佳平衡. </p>
<h3 id="3-2-gated-delta-net-xxzyldjhzd">3.2 Gated DeltaNet: 线性注意力的进化终点</h3>
<p>Gated DeltaNet 代表了线性注意力多年演化的终极形态. 要理解 Gated DeltaNet,需要先理解整个线性注意力的演进路线: </p>
<h4 id="stage-1-ys-linear-attention">Stage 1: 原始 Linear Attention</h4>
<p>去掉 Softmax 和 Causal Mask 后,Attention 变成线性递推形式: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>+</mo><msub><mi>v</mi><mi>t</mi></msub><msubsup><mi>k</mi><mi>t</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">S_t = S_{t-1} + v_t k_t^\\top \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8917em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1461em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>o</mi><mi>t</mi></msub><mo>=</mo><msub><mi>S</mi><mi>t</mi></msub><msub><mi>q</mi><mi>t</mi></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">o_t = S_t q_t \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span>
<p>这里 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>d</mi><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">S_t \\in \\mathbb{R}^{d \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span> 是状态矩阵. 问题是: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">S_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 容量有限,随着 step 增长会遗忘早期信息. </p>
<h4 id="stage-2-cssj-ret-net-lightning-attention">Stage 2: 常数衰减(RetNet / Lightning Attention)</h4>
<p>给 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub></mrow><annotation encoding="application/x-tex">S_{t-1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8917em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span></span> 一个常数衰减因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>γ</mi></mrow><annotation encoding="application/x-tex">\\gamma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span></span></span></span>: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><mi>γ</mi><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>+</mo><msub><mi>v</mi><mi>t</mi></msub><msubsup><mi>k</mi><mi>t</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">S_t = \\gamma S_{t-1} + v_t k_t^\\top \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8917em;vertical-align:-0.2083em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1461em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>但 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>γ</mi></mrow><annotation encoding="application/x-tex">\\gamma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span></span></span></span> 与数据无关,缺乏选择性更新能力. </p>
<h4 id="stage-3-sjyldsj-mamba-2-gated-retention">Stage 3: 数据依赖的衰减(Mamba-2 / Gated Retention)</h4>
<p>让衰减因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>γ</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">\\gamma_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是输入的函数: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><msub><mi>γ</mi><mi>t</mi></msub><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>+</mo><msub><mi>v</mi><mi>t</mi></msub><msubsup><mi>k</mi><mi>t</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">S_t = \\gamma_t S_{t-1} + v_t k_t^\\top \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8917em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1461em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><h4 id="stage-4-gated-delta-net-zjxt">Stage 4: Gated DeltaNet(终极形态)</h4>
<p>将 SSM 的递归更新视为在线学习问题. 核心思想: 状态 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">S_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是一个将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>k</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">k_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 映射到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>v</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">v_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的权重矩阵. 按照 Delta Rule(梯度下降)更新: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>S</mi><mi>t</mi></msub><mo>=</mo><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>+</mo><msub><mi>β</mi><mi>t</mi></msub><mo stretchy="false">(</mo><msub><mi>v</mi><mi>t</mi></msub><mo>−</mo><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><msub><mi>k</mi><mi>t</mi></msub><mo stretchy="false">)</mo><msubsup><mi>k</mi><mi>t</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">S_t = S_{t-1} + \\beta_t (v_t - S_{t-1} k_t) k_t^\\top \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8917em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><p>这里的创新在于: <strong>更新不再是简单的加法(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>v</mi><mi>t</mi></msub><msubsup><mi>k</mi><mi>t</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">v_t k_t^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0961em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span>),而是包含了误差项(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>v</mi><mi>t</mi></msub><mo>−</mo><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><msub><mi>k</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">v_t - S_{t-1}k_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9028em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>)的修正</strong>——只有当模型对当前输入的预测 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><msub><mi>k</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">S_{t-1}k_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9028em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 与真实值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>v</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">v_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 存在差异时,状态才会被更新. 这大大减少了状态被无关信息污染的程度. </p>
<h3 id="3-3-qwen3-next-dwzsx">3.3 Qwen3-Next 的完整实现</h3>
<p>Gated DeltaNet 的完整前向过程: </p>
<pre><code class="language-python"># 1. 获取 qkv + gate + 参数
projected = self.in_proj_qkvz(hidden_states)
query, key, value, z, b, a = split(projected)

# 2. Causal Conv1D 预处理
mixed_qkv = cat([query, key, value], dim=-1)
mixed_qkv = causal_conv1d_update(mixed_qkv, conv_state)

# 3. 计算衰减和门控
beta = sigmoid(b)
gate = -exp(A_log) * softplus(a + dt_bias)

# 4. Gated DeltaNet 递归更新
for i in range(num_heads):
    g_t = exp(gate[:, :, i])
    beta_t = beta[:, :, i]
    kv_mem = last_state * k_t[:, :, i].unsqueeze(-1)
    delta = (v_t - kv_mem) * beta_t
    last_state = last_state + k_t.unsqueeze(-1) * delta.unsqueeze(-2)
    output[:, :, i] = (last_state * q_t[:, :, i].unsqueeze(-1)).sum(dim=-2)
</code></pre>
<h3 id="3-4-zero-centered-rms-norm">3.4 Zero-Centered RMSNorm</h3>
<p>Qwen3-Next 在 Gated Attention 层使用 <strong>Zero-Centered RMSNorm</strong>,采用零初始化的可学习权重(weight=0),使得训练初期等价于恒等映射,逐步学习缩放. 相比 Qwen3 的 QK-Norm,Zero-Centered RMSNorm 配合 weight decay 可有效抑制部分层 norm weight 异常升高. </p>
<h2 id="4-qwen3-5-plus-xtjdxsgm">4. Qwen3.5-Plus: 系统级的效率革命</h2>
<h3 id="4-1-jggg">4.1 架构规格</h3>
<table>
<thead>
<tr>
<th align="left">参数</th>
<th align="left">数值</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数量</td>
<td align="left"><strong>397B</strong></td>
</tr>
<tr>
<td align="left">激活参数量</td>
<td align="left"><strong>17B</strong>(4.2% 激活比例)</td>
</tr>
<tr>
<td align="left">架构</td>
<td align="left">Gated Attention + Linear Attention + MoE + MTP</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left"><strong>文本 + 视觉混合</strong>(原生多模态)</td>
</tr>
</tbody></table>
<h3 id="4-2-xstsdsgwd">4.2 效率提升的四个维度</h3>
<p>Qwen3.5-Plus 实现了 <strong>4 项技术整合 → 约 19× 系统效率提升</strong>: </p>
<table>
<thead>
<tr>
<th align="left">技术</th>
<th align="center">单独提升</th>
<th align="center">累积效果</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Hybrid Attention</strong>(Gated + Linear)</td>
<td align="center">~5×</td>
<td align="center">长上下文下注意力计算和显存大幅降低</td>
</tr>
<tr>
<td align="left"><strong>High-Sparsity MoE</strong>(4.2% 激活)</td>
<td align="center">~2×</td>
<td align="center">相比 10% 激活比例节省更多计算</td>
</tr>
<tr>
<td align="left"><strong>MTP 多 Token 预测</strong></td>
<td align="center">~1.5×</td>
<td align="center">投机采样友好,提高 Token 吞吐率</td>
</tr>
<tr>
<td align="left"><strong>系统级叠加</strong></td>
<td align="center"><strong>~19×</strong></td>
<td align="center">单点技术叠加后的综合效率</td>
</tr>
</tbody></table>
<blockquote>
<p>注: 19× 不是简单的乘法叠加(5×2×1.5=15),而是实际综合效果接近 19 倍,反映了技术之间正协同效应. </p>
</blockquote>
<h3 id="4-3-benchmark-sj">4.3 Benchmark 数据</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">Qwen3.5-Plus</th>
<th align="left">竞品对比</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>MMLU-Pro</strong></td>
<td align="left"><strong>87.8</strong></td>
<td align="left">&gt; GPT-5.2</td>
</tr>
<tr>
<td align="left"><strong>GPQA</strong></td>
<td align="left"><strong>88.4</strong></td>
<td align="left">&gt; Claude 4.5</td>
</tr>
<tr>
<td align="left"><strong>IFBench</strong></td>
<td align="left"><strong>76.5</strong></td>
<td align="left">SOTA</td>
</tr>
<tr>
<td align="left"><strong>BFCL-V4</strong></td>
<td align="left">领先</td>
<td align="left">&gt; 多数闭源模型</td>
</tr>
<tr>
<td align="left"><strong>AgentBrowseComp</strong></td>
<td align="left">领先</td>
<td align="left">&gt; Gemini 3 Pro</td>
</tr>
</tbody></table>
<h3 id="4-4-agent-sddcbgs">4.4 Agent 时代的成本公式</h3>
<p>Qwen3.5-Plus 的实践提出了一个重要视角——<strong>Agent 时代的真正成本公式</strong>: </p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>单位有效成本</mtext><mo>=</mo><mfrac><mrow><mtext>GPU小时</mtext><mo>×</mo><mtext>GPU数</mtext><mi mathvariant="normal">/</mi><mtext>tokens产出</mtext></mrow><mtext>成功率</mtext></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(6)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{单位有效成本} = \\frac{\\text{GPU小时} \\times \\text{GPU数} / \\text{tokens产出}}{\\text{成功率}} \\tag{6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">单位有效成本</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.113em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord cjk_fallback">成功率</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">GPU</span><span class="mord cjk_fallback">小时</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">GPU</span><span class="mord cjk_fallback">数</span></span><span class="mord">/</span><span class="mord text"><span class="mord">tokens</span><span class="mord cjk_fallback">产出</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.113em;vertical-align:-0.686em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">6</span></span><span class="mord">)</span></span></span></span></span></span>
<ul>
<li><strong>吞吐</strong>(分子)决定&quot;跑得多快、跑得多便宜&quot;</li>
<li><strong>成功率</strong>(分母)决定&quot;要不要返工、要不要重跑&quot;</li>
</ul>
<p>Qwen3.5-Plus 的关键贡献在于: <strong>它不只是把&quot;吞吐&quot;做上去,而是把&quot;聪明程度&quot;也顶上去了</strong>——否则吞吐提升,最后可能只是让你更快地出错. </p>
<h2 id="5-ckzl">5. 参考资料</h2>
<ol>
<li>Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free (NeurIPS 2025 Best Paper)</li>
<li>Gated Delta Networks: Improving Mamba2 with Delta Rule</li>
<li>Qwen3-Next: Towards Ultimate Training &amp; Inference Efficiency (2025.9)</li>
<li>Qwen3.5-Plus 技术报告 (2026)</li>
<li>知乎: 如何评价 Qwen 门控注意力 Gated Attention 获得 NeurIPS 最佳论文(作者自述)</li>
<li>知乎: 如何评价阿里的新模型 Qwen3-Next-80B-A3B-Instruct(淘气堡)</li>
<li>知乎: 阿里除夕夜发布 Qwen3.5 模型(平凡)</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-bj-attention-sink-wtdfx","text":"1. 背景: Attention Sink 问题的发现"},{"level":2,"id":"2-gated-attention-cgysxc-attention-sink","text":"2. Gated Attention: 从根源上消除 Attention Sink"},{"level":3,"id":"2-1-hxsx","text":"2.1 核心思想"},{"level":3,"id":"2-2-g1-wzdgjfx","text":"2.2 G1 位置的关键发现"},{"level":3,"id":"2-3-xsxdyr","text":"2.3 稀疏性的引入"},{"level":2,"id":"3-c-gated-attention-dhhzyl-qwen3-next-dsj","text":"3. 从 Gated Attention 到混合注意力: Qwen3-Next 的实践"},{"level":3,"id":"3-1-hybrid-attention-gated-delta-net-gated-attention-d-3-1-hh","text":"3.1 Hybrid Attention: Gated DeltaNet + Gated Attention 的 3:1 混合"},{"level":3,"id":"3-2-gated-delta-net-xxzyldjhzd","text":"3.2 Gated DeltaNet: 线性注意力的进化终点"},{"level":4,"id":"stage-1-ys-linear-attention","text":"Stage 1: 原始 Linear Attention"},{"level":4,"id":"stage-2-cssj-ret-net-lightning-attention","text":"Stage 2: 常数衰减(RetNet / Lightning Attention)"},{"level":4,"id":"stage-3-sjyldsj-mamba-2-gated-retention","text":"Stage 3: 数据依赖的衰减(Mamba-2 / Gated Retention)"},{"level":4,"id":"stage-4-gated-delta-net-zjxt","text":"Stage 4: Gated DeltaNet(终极形态)"},{"level":3,"id":"3-3-qwen3-next-dwzsx","text":"3.3 Qwen3-Next 的完整实现"},{"level":3,"id":"3-4-zero-centered-rms-norm","text":"3.4 Zero-Centered RMSNorm"},{"level":2,"id":"4-qwen3-5-plus-xtjdxsgm","text":"4. Qwen3.5-Plus: 系统级的效率革命"},{"level":3,"id":"4-1-jggg","text":"4.1 架构规格"},{"level":3,"id":"4-2-xstsdsgwd","text":"4.2 效率提升的四个维度"},{"level":3,"id":"4-3-benchmark-sj","text":"4.3 Benchmark 数据"},{"level":3,"id":"4-4-agent-sddcbgs","text":"4.4 Agent 时代的成本公式"},{"level":2,"id":"5-ckzl","text":"5. 参考资料"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/gated-attention-hybrid-attention-2025-2026/gated-attention-hybrid-attention-2025-2026" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/gated-attention-hybrid-attention-2025-2026/gated-attention-hybrid-attention-2025-2026" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gated Attention 与混合注意力: 2025-2026 LLM 架构最大突破</h1>
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
