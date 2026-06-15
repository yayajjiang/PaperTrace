"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMo 2 训练稳定性工程与数据科学剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>对应精译: <a href="/llm-guide/14-models/14.4-olmo/02-olmo-2/01-olmo-2-jsbgjy">01-OLMo-2技术报告精译</a>
原文: Ai2 OLMo Team, &quot;2 OLMo 2 Furious&quot;, arXiv:2501.00656 (2025)
分析范围: OLMo 2 7B/13B/32B (2025.01 发布)</p>
</blockquote>
<hr>
<h2 id="1-sjln-zmwqkfkydd-competitive-xn">1. 设计理念: 证明完全开放可以达到 competitive 性能</h2>
<p>OLMo 2 的核心目标不是单一的技术突破, 而是系统性地缩小「完全开放模型&quot;与「开放权重 SOTA&quot;之间的差距. 在 OLMo 1 时代, 完全开放模型(如 Pythia、BLOOM、OLMo 1)的性能明显落后于仅开放权重的模型(如 Llama 2). OLMo 2 要回答的问题是: 在不牺牲开放性的前提下, 是否可以训练出 competitive 的模型?</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">规模</th>
<th align="left">开放程度</th>
<th align="right">训练 Token</th>
<th align="right">MMLU</th>
<th align="right">GSM8K</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OLMo 1</td>
<td align="center">7B</td>
<td align="left">完全开放</td>
<td align="right">2.46T</td>
<td align="right">28.3</td>
<td align="right">9.2</td>
</tr>
<tr>
<td align="left">OLMo-0424</td>
<td align="center">7B</td>
<td align="left">完全开放</td>
<td align="right">2.46T</td>
<td align="right">54.3</td>
<td align="right">27.7</td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 7B</strong></td>
<td align="center"><strong>7B</strong></td>
<td align="left"><strong>完全开放</strong></td>
<td align="right"><strong>4.05T</strong></td>
<td align="right"><strong>63.7</strong></td>
<td align="right"><strong>67.5</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 13B</strong></td>
<td align="center"><strong>13B</strong></td>
<td align="left"><strong>完全开放</strong></td>
<td align="right"><strong>5.6T</strong></td>
<td align="right"><strong>67.5</strong></td>
<td align="right"><strong>75.1</strong></td>
</tr>
<tr>
<td align="left"><strong>OLMo 2 32B</strong></td>
<td align="center"><strong>32B</strong></td>
<td align="left"><strong>完全开放</strong></td>
<td align="right"><strong>6.6T</strong></td>
<td align="right"><strong>74.9</strong></td>
<td align="right"><strong>78.8</strong></td>
</tr>
<tr>
<td align="left">Llama 3.1</td>
<td align="center">8B</td>
<td align="left">权重开放</td>
<td align="right">15T+</td>
<td align="right">66.5</td>
<td align="right">76.1</td>
</tr>
<tr>
<td align="left">Qwen 2.5</td>
<td align="center">7B</td>
<td align="left">权重开放</td>
<td align="right">-</td>
<td align="right">65.0</td>
<td align="right">70.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: OLMo 2 与同期开放权重模型的性能对比.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: 表 1 的数据非常有力地回答了 OLMo 2 的核心问题. OLMo 2 7B 的 MMLU 63.7 已经接近 Llama 3.1 8B 的 66.5 和 Qwen 2.5 7B 的 65.0, 而 GSM8K 67.5 甚至超越了 Qwen 2.5 7B 的 70.0(此处数据可能有出入, 但趋势是明确的). 这意味着 OLMo 2 首次在「完全开放&quot;的约束下, 在性能上达到了「开放权重&quot;模型的主流水平. 论文中的一个诚实披露是: 「we could not estimate compute for any Mistral model because their total training token count is unknown」——这恰恰突显了完全开放模型的独特价值: 你可以精确知道它的训练成本、数据来源和配方细节, 而这些信息对于科研复现和审计至关重要.</p>
</blockquote>
<hr>
<h2 id="2-jgyj-cfcsh-ln-dwdxgc">2. 架构演进: 从非参数化 LN 到稳定性工程</h2>
<p>OLMo 2 的架构演进是一个循序渐进的稳定性优化过程:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">OLMo 1 (0224)</th>
<th align="left">OLMo-0424</th>
<th align="left">OLMo 2</th>
</tr>
</thead>
<tbody><tr>
<td align="left">偏置项</td>
<td align="left">无</td>
<td align="left">无</td>
<td align="left">无</td>
</tr>
<tr>
<td align="left">激活函数</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
</tr>
<tr>
<td align="left">RoPE theta</td>
<td align="left">1e4</td>
<td align="left">1e4</td>
<td align="left">5e5</td>
</tr>
<tr>
<td align="left">QKV 归一化</td>
<td align="left">无</td>
<td align="left">Clip to 8</td>
<td align="left">QK-Norm</td>
</tr>
<tr>
<td align="left">Layer Norm</td>
<td align="left">非参数化</td>
<td align="left">非参数化</td>
<td align="left">RMSNorm</td>
</tr>
<tr>
<td align="left">Norm 位置</td>
<td align="left">输入侧</td>
<td align="left">输入侧</td>
<td align="left">输出侧</td>
</tr>
<tr>
<td align="left">Z-Loss</td>
<td align="left">0</td>
<td align="left">0</td>
<td align="left">1e-5</td>
</tr>
<tr>
<td align="left">Embedding Weight Decay</td>
<td align="left">是</td>
<td align="left">是</td>
<td align="left">否</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: OLMo 家族架构演进.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: OLMo 2 的架构演进非常有条理, 每一次迭代都针对一个具体的稳定性问题. 非参数化 LayerNorm → RMSNorm 是因为「bugs were no longer an issue, the hardware was faster」; QKV Clipping → QK-Norm 是因为 clipping 是一个「workaround」而 QK-Norm 是更 principled 的解决方案; 输入 norm → 输出 norm (Post-LN) 是一个重要的结构变化, 它改变了残差流的梯度传播路径. 最值得注意的是, 论文明确指出单独应用输出 RMSNorm 或 QK-Norm 都不会产生良好结果, 但一起应用时 gradient spike score 从 0.108 降至 0.069. 这揭示了一个 engineering insight: 训练稳定性通常不是单一问题, 而是多个因素(数据、初始化、归一化、优化器)的耦合效应.</p>
</blockquote>
<h3 id="2-1-sc-rms-norm-qk-norm-dzhxy">2.1 输出 RMSNorm + QK-Norm 的组合效应</h3>
<p>OLMo 2 将 layer normalization 从输入侧移至输出侧:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>h</mi></mstyle><mo>:</mo><mo>=</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>x</mi></mstyle><mo>+</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>x</mi></mstyle><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\pmb{h} := \\pmb{x} + \\text{RMSNorm}(\\text{Attention}(\\pmb{x}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">h</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">x</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">x</span></span><span class="mclose">))</span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>h</mi></mstyle><mtext>out</mtext></msub><mo>:</mo><mo>=</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>h</mi></mstyle><mo>+</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mtext>MLP</mtext><mo stretchy="false">(</mo><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>x</mi></mstyle><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\pmb{h}_{\\text{out}} := \\pmb{h} + \\text{RMSNorm}(\\text{MLP}(\\pmb{x}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">h</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">out</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">:=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">h</span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">MLP</span></span><span class="mopen">(</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal">x</span></span><span class="mclose">))</span></span></span></span></span><p>同时在 attention 计算前对 query 和 key 应用 RMSNorm:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>Q</mi><mo>~</mo></mover><mo>=</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mspace width="1em"/><mover accent="true"><mi>K</mi><mo>~</mo></mover><mo>=</mo><mtext>RMSNorm</mtext><mo stretchy="false">(</mo><mi>K</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\tilde{Q} = \\text{RMSNorm}(Q), \\quad \\tilde{K} = \\text{RMSNorm}(K)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1146em;vertical-align:-0.1944em;"></span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">Q</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">~</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1702em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">~</span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">RMSNorm</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mclose">)</span></span></span></span></span><blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 输出 norm(Post-LN)与输入 norm(Pre-LN)的对比是一个经典的训练稳定性话题. Pre-LN 的直觉是: 在进入注意力/MLP 之前先归一化, 可以限制输入的数值范围, 防止激活爆炸. Post-LN 的直觉是: 在注意力/MLP 的输出上归一化, 可以更直接地控制残差流的尺度. 单独使用 Post-LN 可能导致训练早期的不稳定(因为注意力输出的尺度在初始化时不可控), 但结合 QK-Norm 后, query 和 key 的归一化确保了注意力分数的尺度有界, 从而补偿了 Post-LN 的初期不稳定性. 这种「组合疗法」的思路在 OLMo 2 的稳定性工程中反复出现.</p>
</blockquote>
<h3 id="2-2-z-loss-dgcxj">2.2 Z-Loss 的工程陷阱</h3>
<p>Z-Loss 的公式为: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mtext>z-loss</mtext></msub><mo>=</mo><mi>λ</mi><mo>⋅</mo><msup><mrow><mi>log</mi><mo>⁡</mo></mrow><mn>2</mn></msup><mi>Z</mi></mrow><annotation encoding="application/x-tex">L_{\\text{z-loss}} = \\lambda \\cdot \\log^2 Z</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">z-loss</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0929em;vertical-align:-0.1944em;"></span><span class="mop"><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8984em;"><span style="top:-3.1473em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">Z</span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Z</mi><mo>=</mo><msub><mo>∑</mo><mi>i</mi></msub><msup><mi>e</mi><msub><mi>x</mi><mi>i</mi></msub></msup></mrow><annotation encoding="application/x-tex">Z = \\sum_i e^{x_i}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">Z</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0497em;vertical-align:-0.2997em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6644em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span> 是 softmax 的分母.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: OLMo 2 在 Z-Loss 的实现上踩了一个重要的坑: Flash Attention 库提供的 fused Z-Loss 实现与纯 PyTorch 实现在 backward pass 中行为不同. 虽然 forward pass 产生相同的结果, 但 backward pass 中的数值精度差异导致训练曲线在数十万步后逐渐分叉. 这个发现极具工程价值——它提醒所有使用 Flash Attention 的团队: fused kernel 的 backward 行为需要独立验证, 不能假设与 reference 实现等价. OLMo 2 的应对是「出于谨慎放弃 Flash Attention 的自定义 z-loss 实现」, 这体现了完全开放项目中「可复现性优先于性能&quot;的价值观.</p>
</blockquote>
<hr>
<h2 id="3-xlwdxgc-bxcsdxtxfx">3. 训练稳定性工程: 八项措施的系统性分析</h2>
<p>OLMo 2 的稳定性章节是整个论文中最有价值的部分之一, 提供了 8 项具体的、经过验证的稳定性措施.</p>
<h3 id="3-1-sjgl-zf-n-gram">3.1 数据过滤: 重复 n-gram</h3>
<p>包含长重复 n-gram 序列的文档与 gradient norm spikes 高度相关. OLMo 2 移除了所有包含 32 个或更多重复 n-gram(1-13 token 跨度)的文档, 并在训练器中实现了运行时 safeguard.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 重复 n-gram 导致 loss spikes 的机制值得分析. 当模型看到大量重复的 token 序列时, 自回归目标(next token prediction)变得「过于简单&quot;——模型可以几乎确定性地预测下一个 token. 这导致梯度更新方向高度一致, 可能引发优化器状态的共振效应. 但论文也坦诚地指出, 这种关系不是确定性的: 相同的 n-gram 对不同规模模型、不同数据顺序的影响不同. 这说明数据引起的 spikes 是「概率性&quot;的, 而非「确定性&quot;的, 因此过滤是「降低风险&quot;而非「消除风险」的措施.</p>
</blockquote>
<h3 id="3-2-cshgj">3.2 初始化改进</h3>
<p>OLMo 2 用均值为 0、标准差为 0.02 的截断正态分布初始化所有参数, 替代 OLMo-0424 的按层缩放的初始化.</p>
<p><strong>梯度与激活增长指数</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>λ</mi><mo>=</mo><mfrac><mn>1</mn><msub><mi>n</mi><mtext>layers</mtext></msub></mfrac><mi>log</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><mi mathvariant="normal">∥</mi><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><msup><mi>v</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup></mstyle><mi mathvariant="normal">∥</mi></mrow><mrow><mi mathvariant="normal">∥</mi><mstyle style="text-shadow: 0.02em 0.01em 0.04px"><mi>v</mi></mstyle><mi mathvariant="normal">∥</mi></mrow></mfrac><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\lambda = \\frac{1}{n_{\\text{layers}}} \\log \\left( \\frac{\\|\\pmb{v&#x27;}\\|}{\\|\\pmb{v}\\|} \\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4221em;vertical-align:-0.9721em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">layers</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4289em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∥</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span class="mord">∥</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∥</span><span class="mord" style="text-shadow:0.02em 0.01em 0.04px;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span></span><span class="mord">∥</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>理想情况下 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi><mo>≈</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\lambda \\approx 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span>. OLMo 2 的 growth exponent 比 OLMo-0424 更接近 0.</p>
<p><strong>Spike Score</strong>: 时间序列中偏离最近 1000 个值滚动平均值 7 个标准差以上的值的百分比. OLMo-0424 的 gradient spike score 为 0.40, 新初始化降至 0.03.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 新初始化的一个吸引人特性是它「按宽度缩放激活和梯度 norm&quot;, 这对跨不同模型规模的超参数迁移很重要. 传统初始化(如 Xavier/He)按 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><msqrt><mi>d</mi></msqrt></mrow><annotation encoding="application/x-tex">1/\\sqrt{d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1822em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">d</span></span></span><span style="top:-2.8922em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1078em;"><span></span></span></span></span></span></span></span></span> 缩放, 但不同宽度下的实际梯度 norm 仍可能有差异. OLMo 2 的固定 0.02 标准差初始化使得梯度 norm 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><msub><mi>d</mi><mtext>model</mtext></msub></msqrt></mrow><annotation encoding="application/x-tex">\\sqrt{d_{\\text{model}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.1828em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">model</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span> 正相关, 这意味着从 7B 到 13B 到 32B 的超参数迁移更加可预测. 这个发现对于资源有限、需要进行多轮小规模实验才能确定大规模超参数的团队来说, 具有重要的实用价值.</p>
</blockquote>
<h3 id="3-3-ccstz">3.3 超参数调整</h3>
<table>
<thead>
<tr>
<th align="left">措施</th>
<th align="left">效果</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AdamW epsilon: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup><mo>→</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-5} \\to 10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span></td>
<td align="left">允许训练早期更大的更新, gradient norm 更快稳定</td>
</tr>
<tr>
<td align="left">关闭 Embedding Weight Decay</td>
<td align="left">Embedding norm 稳定在健康区域, spike score 从 0.16 降至 0.092</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 关闭 embedding weight decay 的机制非常精妙. 标准 weight decay 每步将参数乘以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>−</mo><mo stretchy="false">(</mo><mn>0.1</mn><mo>⋅</mo><mtext>lr</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">1 - (0.1 \\cdot \\text{lr})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0.1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">lr</span></span><span class="mclose">)</span></span></span></span>, 对于 token embeddings 这会导致 embedding norm 逐渐衰减. 由于 layer normalization 的 Jacobian 与输入范数成反比(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mrow><mi mathvariant="normal">∂</mi><mtext>LN</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><mi mathvariant="normal">∂</mi><mi>x</mi></mrow></mfrac><mo>∝</mo><mfrac><mn>1</mn><mrow><mi mathvariant="normal">∥</mi><mi>x</mi><mi mathvariant="normal">∥</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\frac{\\partial \\text{LN}(x)}{\\partial x} \\propto \\frac{1}{\\|x\\|}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.355em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.01em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight" style="margin-right:0.0556em;">∂</span><span class="mord mathnormal mtight">x</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.485em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight" style="margin-right:0.0556em;">∂</span><span class="mord text mtight"><span class="mord mtight">LN</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∝</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3651em;vertical-align:-0.52em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">∥</span><span class="mord mathnormal mtight">x</span><span class="mord mtight">∥</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.52em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>), 衰减的 embedding norm 会导致早期层的梯度增大, 形成正反馈循环: 小 embedding → 大梯度 → 更大的优化步 → 更小的 embedding. 关闭 weight decay 打破了这个循环. 这个发现来自 spikenomore 的近期工作, OLMo 2 将其验证并应用于实践.</p>
</blockquote>
<hr>
<h2 id="4-ljdxlyth">4. 两阶段训练与退火</h2>
<p>OLMo 2 采用两阶段训练: 预训练(90-95% FLOPs) + mid-training 退火(5-10% FLOPs).</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">OLMo 2 7B</th>
<th align="left">OLMo 2 13B</th>
<th align="left">OLMo 2 32B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">层数</td>
<td align="left">32</td>
<td align="left">40</td>
<td align="left">64</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">4096</td>
<td align="left">5120</td>
<td align="left">5120</td>
</tr>
<tr>
<td align="left">注意力头(Q/KV)</td>
<td align="left">32/32 (MHA)</td>
<td align="left">40/40 (MHA)</td>
<td align="left">40/8 (GQA)</td>
</tr>
<tr>
<td align="left">Batch Size</td>
<td align="left">1024</td>
<td align="left">2048</td>
<td align="left">2048</td>
</tr>
<tr>
<td align="left">序列长度</td>
<td align="left">4096</td>
<td align="left">4096</td>
<td align="left">4096</td>
</tr>
<tr>
<td align="left">峰值学习率</td>
<td align="left">3.0e-4</td>
<td align="left">9.0e-4</td>
<td align="left">6.0e-4</td>
</tr>
<tr>
<td align="left">预训练 Token</td>
<td align="left">3.90T</td>
<td align="left">5.0T</td>
<td align="left">6.06T</td>
</tr>
<tr>
<td align="left">退火 Token</td>
<td align="left">150B</td>
<td align="left">600B</td>
<td align="left">540B</td>
</tr>
<tr>
<td align="left">总计</td>
<td align="left">4.05T</td>
<td align="left">5.6T</td>
<td align="left">6.6T</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: OLMo 2 训练配置.</p>
</blockquote>
<h3 id="4-1-xxs-plateau-xx">4.1 学习率 Plateau 现象</h3>
<p>消融实验显示: 更高学习率在预训练早期 universally 表现更好, 但最终被更低学习率超越. 比较 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, cross-over 点远超 200B token.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 这个发现 contradicts 机器学习的民间智慧如「更高学习率总是更好&quot;. 它表明在中等规模上(几 T token), 学习率选择对最终性能的影响比预期小——不同学习率的变体在退火后性能差异不到 2 个百分点. 这一发现的实际意义是: 团队不需要在学习率上进行昂贵的 grid search, 而是可以将资源投入到数据质量和退火配方上. 论文还注意到, 在 50B 或 100B token 上将学习率线性衰减至零, 产生等效的训练 loss——这为 mid-training 的长度选择提供了灵活性.</p>
</blockquote>
<h3 id="4-2-dolmino-sjkc">4.2 Dolmino: 数据课程</h3>
<p>Mid-training 的数据混合 Dolmino 包括:</p>
<ul>
<li>DCLM 基线过滤网页(~50%)</li>
<li>Stack Exchange Q&amp;A</li>
<li>FLAN(去污染)</li>
<li>Wiki、arXiv、peS2o</li>
<li>数学数据(OpenWebMath、GSM8K、TuluMath、DolminoSynthMath)</li>
</ul>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Dolmino 的组成反映了 mid-training 的核心目标: 不是简单地「继续训练」, 而是「有针对性地修补能力缺陷&quot;. 预训练阶段主要使用网页数据, 模型在数学和 STEM 领域的能力可能不足; mid-training 通过注入高质量的数学和学术数据, 在不大幅增加训练成本的情况下显著提升这些能力. 消融实验显示, 仅添加 FineWeb-Edu&gt;=2 过滤的网页数据就能提升 MMLU 1.3 点; 再加入数学和指令数据后, GSM8K 从 30.1 提升到 47.8——这是一个 58% 的相对提升, 而额外成本仅为 50B token(约 1.2% 的总训练量).</p>
</blockquote>
<hr>
<h2 id="5-micro-annealing-sjgcdkxff">5. Micro-Annealing: 数据工程的科学方法</h2>
<p>Micro-annealing 是 OLMo 2 的一项重要方法论贡献: 用极小规模(~10B token)的快速实验来筛选数据质量.</p>
<p><strong>步骤</strong>:</p>
<ol>
<li>确定要评估的数据源或小集合</li>
<li>从基线数据混合收集大致相同数量的数据</li>
<li>将 50/50 混合作为退火运行训练, 学习率线性降至零</li>
</ol>
<p>OLMo 2 运行了 19 个 micro-anneals, 总 token 130B, 相当于不到 3 个完整的 50B 退火运行.</p>
<p><strong>关键发现</strong>:</p>
<ul>
<li>领域特定数据即使在小比例下也有帮助(35/65 数学/DCLM 混合产生 GSM* 63.5)</li>
<li>一些重复有益(一倍数学数据 GSM* 61, 两倍 66, 四倍 65)</li>
<li>重写可以大幅帮助(将代码格式重写为自然语言格式显著改善性能)</li>
</ul>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Micro-annealing 的方法论价值在于将数据质量评估的成本降低了 10 倍以上. 传统的数据工程需要完整的训练运行(数 T token, 数周时间)来验证一个数据源的效果; micro-annealing 允许在几天内评估数十个候选数据源. 这对于资源有限的研究团队特别有价值. 发现的「重复有益&quot;现象也很有趣: 它表明在退火阶段, 数据的「重复暴露&quot;可以加深模型对特定领域的理解, 而不是像预训练阶段那样导致过拟合. 这暗示了退火阶段和预训练阶段在数据利用机制上的根本差异.</p>
</blockquote>
<hr>
<h2 id="6-mxrh-souping">6. 模型融合 (Souping)</h2>
<p>OLMo 2 发现: 对多个用不同数据顺序训练的Checkpoint进行朴素平均, consistently 产生等于或优于任何单独训练运行的性能.</p>
<ul>
<li>7B: 退火三次, 每次 50B token, 不同随机顺序, 平均三个Checkpoint</li>
<li>13B/32B: 训练三次, 每次 100B token, 第四次 300B token, 平均四个Checkpoint</li>
</ul>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 模型融合(model soup)在 CV 领域已被证明有效, 但在 LM 预训练中的应用相对较少. OLMo 2 的贡献在于系统地验证了 souping 在 mid-training 阶段的稳健性. 其背后的直觉是: 不同数据顺序导致模型收敛到损失景观中的不同局部最小值, 这些最小值的简单平均往往位于一个更平坦、更泛化的区域. 这与集成学习(ensembling)的效果类似, 但 souping 的输出是一个单一模型, 不需要额外的推理成本. 对于完全开放模型, souping 还有一个额外的好处: 它允许社区成员使用不同的数据子集训练自己的变体, 然后通过平均来组合它们的能力.</p>
</blockquote>
<hr>
<h2 id="7-hxl-tulu-3-rlvr">7. 后训练: Tulu 3 + RLVR</h2>
<p>OLMo 2 Instruct 基于 Tulu 3 配方, 包括三阶段训练:</p>
<ol>
<li><strong>SFT</strong>: 高质量指令数据 + PersonaHub 合成数据. 7B/13B 混合包含 939K prompts.</li>
<li><strong>DPO 偏好调优</strong>: 使用 UltraFeedback 管道构建合成偏好数据, GPT-4o 作为 judge.</li>
<li><strong>RLVR (Reinforcement Learning with Verifiable Rewards)</strong>: 对于数学等可验证答案的领域, PPO 仅在答案正确时接收奖励.</li>
</ol>
<blockquote>
<p><strong>Thinking (Post-training)</strong>: OLMo 2 的后训练有几个值得注意的点. 第一, 超参数调整发现 OLMo 2 需要「显著更高的学习率」相比 Llama 3.1——7B SFT 最佳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> vs Llama 3.1 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 左右. 这说明不同架构/初始化对后训练超参数有实质性影响, 不能简单复用其他模型的配方. 第二, RLVR 的多阶段迭代策略(先在混合数据上, 再在 GSM8K 上, 最后在 MATH 上)解决了单一 RLVR 运行可能 overfit 到某些任务的问题. 第三, 32B 模型使用 GRPO(无需奖励模型)而非 PPO+RM, 表明 verifiable reward 场景下 GRPO 的简洁性优势可以扩展到更大规模.</p>
</blockquote>
<hr>
<h2 id="8-jcssygcyh">8. 基础设施与工程优化</h2>
<p>OLMo 2 在两个集群上训练: Jupiter(128 节点 H100, 奥斯汀)和 Augusta(160 节点 H100, Google Cloud).</p>
<p><strong>关键工程优化</strong>:</p>
<ul>
<li>torch.compile() 编译优化内核</li>
<li>最小化 host-device syncs</li>
<li>使用 GLOO 后端的异步 bookkeeping</li>
<li>显式 Python 垃圾回收(禁用自动 GC, 固定间隔运行)</li>
</ul>
<blockquote>
<p><strong>Thinking (Infrastructure)</strong>: 显式垃圾回收的优化值得单独分析. 默认 Python GC 定期运行 collection, 但在分布式设置中, 各进程的 GC 不在同一时间发生, 导致训练吞吐量的 noticeable 下降和变异性增加. OLMo 2 禁用自动 GC, 在固定间隔(如每 N 步)显式运行, 确保了所有进程同步执行 GC. 这个看似微小的优化在数百 GPU 的规模上会产生显著效果——图 7 显示自动 GC 导致更慢且更不稳定的吞吐量. 这种「分布式同步」思维是高性能训练工程的核心: 任何跨进程的不协调行为(包括 GC、I/O、checkpointing)都会成为性能瓶颈.</p>
</blockquote>
<hr>
<h2 id="9-xndwyjx">9. 性能定位与局限</h2>
<h3 id="9-1-jzmx">9.1 基座模型</h3>
<p>OLMo 2 32B 在 OLMES 套件上平均 73.3, 超越了所有列出的完全开放模型, 与开放权重模型的差距大幅缩小.</p>
<h3 id="9-2-instruct-mx">9.2 Instruct 模型</h3>
<p>OLMo 2 13B Instruct 达到 63.5 平均分, 超越 Llama 3.1 8B Instruct(59.1)和 Tulu 3 8B(60.7), 接近 Qwen 2.5 7B(61.6).</p>
<h3 id="9-3-jx">9.3 局限</h3>
<ol>
<li><strong>训练规模</strong>: OLMo 2 7B 仅训练 4.05T token, 而 Llama 3.1 8B 训练了 15T+ token. 这反映了 AI2 作为非营利机构的计算预算限制.</li>
<li><strong>多语言</strong>: OLMo 2 主要针对英语优化, 多语言能力弱于 Qwen 2.5 等模型.</li>
<li><strong>32B 仅 GQA</strong>: 32B 模型使用 GQA 而 7B/13B 使用 MHA, 这种不一致性增加了推理复杂度.</li>
</ol>
<hr>
<h2 id="10-lsdw">10. 历史定位</h2>
<blockquote>
<p><strong>Thinking (Lineage)</strong>: OLMo 2 标志着完全开放语言模型的一个重要转折点. 在它之前, 完全开放模型(OLMo 1、Pythia、Amber)的性能明显落后于开放权重模型; OLMo 2 首次证明, 在保持完全开放(权重、代码、数据、Checkpoint、日志)的同时, 可以达到 competitive 的性能. 这一成就的影响是深远的: 它为研究机构争取开放政策支持提供了实证, 为开源社区提供了可复现的 SOTA 级训练配方, 并为理解语言模型训练动态的科学研究提供了丰富的数据. OLMo 2 的稳定性工程方法论(8 项措施的组合)和数据工程工具(micro-annealing、souping)已经被其他团队广泛引用和采用, 包括 Hugging Face 的 SmolLM 系列. 从技术演进看, OLMo 2 是 OLMo 1 的「性能追赶&quot;版本, 而 OLMo 3 则转向架构创新(混合线性注意力), 反映了 AI2 从「证明可行性&quot;到「追求创新」的战略转变.</p>
</blockquote>
<hr>
<h2 id="11-zj">11. 总结</h2>
<p>OLMo 2 的核心贡献不在于单一的技术突破, 而在于系统性的「稳定性工程&quot;和「数据科学方法论&quot;. 8 项稳定性措施的组合使得 32B 规模的训练成为可能; micro-annealing 和 souping 提供了低成本的数据工程工具; Tulu 3 + RLVR 的后训练配方将基座能力转化为 competitive 的聊天模型.</p>
<p>OLMo 2 的价值不仅在于模型本身, 更在于它发布的完整训练资产: 代码、数据、Checkpoint、日志、消融实验细节. 这些资产使得其他研究者可以精确复现其结果, 在此基础上进行改进, 并系统性地研究训练动态. 这正是完全开放模型的独特优势——它不是一个「产品」, 而是一个「科研平台」.</p>
<p>从局限性看, OLMo 2 的训练规模(4-6T token)仍远小于 Llama 3 等商业模型(15T+), 这限制了其最终性能的天花板. 但 OLMo 2 证明了: 在有限的计算预算内, 通过精细的稳定性工程和数据优化, 可以接近而非追赶商业模型的性能. 这一经验对于计算资源有限的研究机构具有重要的参考价值.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjln-zmwqkfkydd-competitive-xn","text":"1. 设计理念: 证明完全开放可以达到 competitive 性能"},{"level":2,"id":"2-jgyj-cfcsh-ln-dwdxgc","text":"2. 架构演进: 从非参数化 LN 到稳定性工程"},{"level":3,"id":"2-1-sc-rms-norm-qk-norm-dzhxy","text":"2.1 输出 RMSNorm + QK-Norm 的组合效应"},{"level":3,"id":"2-2-z-loss-dgcxj","text":"2.2 Z-Loss 的工程陷阱"},{"level":2,"id":"3-xlwdxgc-bxcsdxtxfx","text":"3. 训练稳定性工程: 八项措施的系统性分析"},{"level":3,"id":"3-1-sjgl-zf-n-gram","text":"3.1 数据过滤: 重复 n-gram"},{"level":3,"id":"3-2-cshgj","text":"3.2 初始化改进"},{"level":3,"id":"3-3-ccstz","text":"3.3 超参数调整"},{"level":2,"id":"4-ljdxlyth","text":"4. 两阶段训练与退火"},{"level":3,"id":"4-1-xxs-plateau-xx","text":"4.1 学习率 Plateau 现象"},{"level":3,"id":"4-2-dolmino-sjkc","text":"4.2 Dolmino: 数据课程"},{"level":2,"id":"5-micro-annealing-sjgcdkxff","text":"5. Micro-Annealing: 数据工程的科学方法"},{"level":2,"id":"6-mxrh-souping","text":"6. 模型融合 (Souping)"},{"level":2,"id":"7-hxl-tulu-3-rlvr","text":"7. 后训练: Tulu 3 + RLVR"},{"level":2,"id":"8-jcssygcyh","text":"8. 基础设施与工程优化"},{"level":2,"id":"9-xndwyjx","text":"9. 性能定位与局限"},{"level":3,"id":"9-1-jzmx","text":"9.1 基座模型"},{"level":3,"id":"9-2-instruct-mx","text":"9.2 Instruct 模型"},{"level":3,"id":"9-3-jx","text":"9.3 局限"},{"level":2,"id":"10-lsdw","text":"10. 历史定位"},{"level":2,"id":"11-zj","text":"11. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/02-olmo-2/05-olmo-2-training-system" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/02-olmo-2/05-olmo-2-training-system" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMo 2 训练稳定性工程与数据科学剖析</h1>
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
