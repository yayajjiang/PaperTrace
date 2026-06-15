"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>EDiT：面向异构硬件的高效异步分布式训练</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.16-Ling 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>技术点</strong>: EDiT (Elastic Distributed Training)
<strong>来源</strong>: Ling-Lite/Plus Technical Report, Section 2.2
<strong>论文引用</strong>: Cheng et al., 2025, ICLR
<strong>开源实现</strong>: DLRover (<a href="https://github.com/intelligent-machine-learning/dlrover">https://github.com/intelligent-machine-learning/dlrover</a>)</p>
</blockquote>
<hr>
<h2 id="1-wtbj">1. 问题背景</h2>
<h3 id="1-1-ctfbsxldpj">1.1 传统分布式训练的瓶颈</h3>
<p>大规模 LLM 训练普遍采用同步分布式训练(All-Reduce)，面临四大挑战：</p>
<table>
<thead>
<tr>
<th>挑战</th>
<th>描述</th>
<th>影响</th>
</tr>
</thead>
<tbody><tr>
<td><strong>高通信开销</strong></td>
<td>每步训练后全量参数同步</td>
<td>通信占比可达 30-50%</td>
</tr>
<tr>
<td><strong>拖后腿问题</strong></td>
<td>最慢节点决定全局进度</td>
<td>异构环境下尤为严重</td>
</tr>
<tr>
<td><strong>弹性训练困难</strong></td>
<td>节点增减需重新分配任务</td>
<td>云环境中频繁发生</td>
</tr>
<tr>
<td><strong>数据噪声敏感</strong></td>
<td>所有 worker 的梯度等量贡献</td>
<td>脏数据影响全局</td>
</tr>
</tbody></table>
<h3 id="1-2-ygyjdtskn">1.2 异构硬件的特殊困难</h3>
<p>Ling 的训练环境包含 5 种不同 AI 加速器(A/B/C/D/E)，其算力差异高达 <strong>8.3 倍</strong>(989 vs 120 TFLOPS)。在这种环境下：</p>
<ul>
<li>快节点(Device D, 989 TFLOPS)每步计算时间 ~1.2s</li>
<li>慢节点(Device B, 120 TFLOPS)每步计算时间 ~10s</li>
<li>传统 All-Reduce 下，快节点 88% 时间在等待</li>
</ul>
<blockquote>
<p><strong>核心问题</strong>: 如何让快节点&quot;多劳多得&quot;，而不是被慢节点&quot;拖后腿&quot;？</p>
</blockquote>
<hr>
<h2 id="2-edit-hxsj">2. EDiT 核心设计</h2>
<p>EDiT (Elastic Distributed Training) 是一种基于 Local SGD 的异步训练方法，针对异构 LLM 训练场景进行了三项关键创新。</p>
<h3 id="2-1-zctb-layer-wise-synchronization">2.1 逐层同步(Layer-wise Synchronization)</h3>
<p><strong>传统方法</strong>: 前向+反向完成后，一次性 All-Reduce 全部参数。</p>
<p><strong>EDiT 方法</strong>: 前向传播过程中<strong>逐层同步参数</strong>。</p>
<pre><code>传统 All-Reduce:     EDiT 逐层同步:
┌─────────┐          ┌─────────┐
│  Layer 1│          │  Layer 1│ → sync
│  Layer 2│          │  Layer 2│ → sync
│  Layer 3│          │  Layer 3│ → sync
│  Layer 4│          │  Layer 4│ → sync
│Backward │          │Backward │
│ All-Reduce (全部)  │ 层内局部梯度累积
└─────────┘          └─────────┘
</code></pre>
<p><strong>优势</strong>:</p>
<ul>
<li>单次同步数据量 = 一层参数量 &lt;&lt; 全局参数量</li>
<li>通过预取(prefetch)实现通信与计算重叠</li>
<li>最小化空闲等待时间</li>
</ul>
<p><strong>量化效果</strong>: 在 128 卡集群上，逐层同步将每次同步的数据量从 28.8B 参数减少到平均 ~2B 参数，通信量降低 <strong>~14 倍</strong>。</p>
<h3 id="2-2-wtdcf-pseudo-gradient-penalty">2.2 伪梯度惩罚(Pseudo Gradient Penalty)</h3>
<p>Local SGD 的核心问题：worker 在本地执行多步更新后，各 worker 的模型参数已经发散，直接平均会导致性能下降。</p>
<p>EDiT 的解决方案——伪梯度惩罚策略，包含三个组件：</p>
<h4 id="1-ycxc-anomaly-elimination">(1) 异常消除(Anomaly Elimination)</h4>
<p>追踪每个 worker 的伪梯度，使用指数移动平均检测异常 worker：</p>
<pre><code class="language-python"># 伪代码
for worker in workers:
    pseudo_grad = compute_pseudo_gradient(worker)
    ema_grad = beta * ema_grad + (1 - beta) * pseudo_grad
    
    if norm(pseudo_grad - ema_grad) &gt; threshold * norm(ema_grad):
        mark_worker_as_anomalous(worker)
        exclude_from_sync(worker)
</code></pre>
<p><strong>效果</strong>: 在数据异常或硬件故障导致梯度异常时，自动隔离问题 worker，防止&quot;一粒老鼠屎坏了一锅粥&quot;。</p>
<h4 id="2-jqpj-weighted-averaging">(2) 加权平均(Weighted Averaging)</h4>
<p>根据伪梯度范数对 worker 贡献进行加权：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>g</mi><mo>ˉ</mo></mover><mo>=</mo><mfrac><mrow><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>w</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>g</mi><mi>i</mi></msub></mrow><mrow><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>w</mi><mi>i</mi></msub></mrow></mfrac><mo separator="true">,</mo><mspace width="1em"/><msub><mi>w</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><msub><mi>g</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi></mrow><mrow><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>j</mi></munder><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><msub><mi>g</mi><mi>j</mi></msub><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\bar{g} = \\frac{\\sum_i w_i \\cdot g_i}{\\sum_i w_i}, \\quad w_i = \\frac{||g_i||}{\\max_j ||g_j||}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7622em;vertical-align:-0.1944em;"></span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4254em;vertical-align:-0.9857em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4397em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.6897em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9857em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3991em;vertical-align:-0.9721em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop">max</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∣∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∣∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∣∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣∣</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p><strong>直觉</strong>: 梯度范数大的 worker 通常遇到了&quot;更难&quot;的样本，其梯度信息更有价值。加权平均确保这些关键信息不被稀释。</p>
<h4 id="3-tdcj-gradient-clipping">(3) 梯度裁剪(Gradient Clipping)</h4>
<p>对过大的伪梯度进行裁剪，防止训练不稳定：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>g</mi><mo>~</mo></mover><mi>i</mi></msub><mo>=</mo><mi>min</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mn>1</mn><mo separator="true">,</mo><mfrac><mtext>clip_threshold</mtext><mrow><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><msub><mi>g</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi></mrow></mfrac><mo fence="true">)</mo></mrow><mo>⋅</mo><msub><mi>g</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\tilde{g}_i = \\min\\left(1, \\frac{\\text{clip\\_threshold}}{||g_i||}\\right) \\cdot g_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8623em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6679em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span><span style="top:-3.35em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">~</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mop">min</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3944em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∣∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">clip_threshold</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>协同效果</strong>: 三个组件的组合确保在 worker 参数发散的情况下，同步后的全局梯度仍保持高质量。</p>
<h3 id="2-3-jysjdtb-time-based-synchronization">2.3 基于时间的同步(Time-based Synchronization)</h3>
<p><strong>传统 Local SGD</strong>: 固定每隔 K 步同步一次。问题：K 太小 → 通信频繁; K 太大 → 参数发散严重。</p>
<p><strong>EDiT 方法</strong>: 基于<strong>时间阈值</strong>触发同步，而非固定步数。</p>
<pre><code>场景示例(Device B: 慢, Device D: 快):

时间线:
0s      5s      10s     15s     20s
│       │       │       │       │
D: ████ sync ████ sync ████ sync ████  (每 5s 同步, 执行 5 步)
B: ████████████ sync ████████████ sync  (每 10s 同步, 执行 1 步)
</code></pre>
<p><strong>关键洞察</strong>: 快节点在相同时间内执行更多本地更新，充分发挥其算力优势; 慢节点不受快节点频率的限制。</p>
<p><strong>自适应负载均衡</strong>: 系统动态监测各 worker 的速度，自动调整时间阈值，确保：</p>
<ul>
<li>快节点的本地步数不会过多导致严重发散</li>
<li>慢节点不会被强制加速而降低单步质量</li>
</ul>
<hr>
<h2 id="3-llfx">3. 理论分析</h2>
<h3 id="3-1-slxbz">3.1 收敛性保证</h3>
<p>EDiT 的收敛性基于 Local SGD 的理论框架，但引入了异构性修正项。</p>
<p><strong>假设</strong>:</p>
<ul>
<li>目标函数 f 是 L-光滑的</li>
<li>随机梯度方差有界：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="double-struck">E</mi><mo stretchy="false">[</mo><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><msub><mi>g</mi><mi>i</mi></msub><mo>−</mo><mi mathvariant="normal">∇</mi><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><msup><mi mathvariant="normal">∣</mi><mn>2</mn></msup><mo stretchy="false">]</mo><mo>≤</mo><msup><mi>σ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\mathbb{E}[||g_i - \\nabla f(x)||^2] \\leq \\sigma^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathbb">E</span><span class="mopen">[</span><span class="mord">∣∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord">∇</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mord">∣</span><span class="mord"><span class="mord">∣</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">]</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></li>
<li>Worker 间异构性有界：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∇</mi><msub><mi>f</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>−</mo><mi mathvariant="normal">∇</mi><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><msup><mi mathvariant="normal">∣</mi><mn>2</mn></msup><mo>≤</mo><msup><mi>ζ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">||\\nabla f_i(x) - \\nabla f(x)||^2 \\leq \\zeta^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∣∣∇</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord">∇</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mord">∣</span><span class="mord"><span class="mord">∣</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0085em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0738em;">ζ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span></li>
</ul>
<p><strong>收敛率</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mn>1</mn><mi>T</mi></mfrac><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mi>T</mi></munderover><mi mathvariant="double-struck">E</mi><mo stretchy="false">[</mo><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∇</mi><mi>f</mi><mo stretchy="false">(</mo><msub><mi>x</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><msup><mi mathvariant="normal">∣</mi><mn>2</mn></msup><mo stretchy="false">]</mo><mo>≤</mo><mi>O</mi><mrow><mo fence="true">(</mo><mfrac><mn>1</mn><msqrt><mrow><mi>K</mi><mi>T</mi></mrow></msqrt></mfrac><mo>+</mo><mfrac><mrow><mi>K</mi><msup><mi>σ</mi><mn>2</mn></msup></mrow><mi>T</mi></mfrac><mo>+</mo><mfrac><mrow><msup><mi>K</mi><mn>2</mn></msup><msup><mi>ζ</mi><mn>2</mn></msup></mrow><mi>T</mi></mfrac><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\frac{1}{T}\\sum_{t=1}^T \\mathbb{E}[||\\nabla f(x_t)||^2] \\leq O\\left(\\frac{1}{\\sqrt{KT}} + \\frac{K\\sigma^2}{T} + \\frac{K^2\\zeta^2}{T}\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathbb">E</span><span class="mopen">[</span><span class="mord">∣∣∇</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord">∣</span><span class="mord"><span class="mord">∣</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">]</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4411em;vertical-align:-0.95em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.1833em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9267em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-2.8867em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1133em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4911em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.4911em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0738em;">ζ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>其中 K 是本地步数。伪梯度惩罚的作用是将有效异构性 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ζ</mi></mrow><annotation encoding="application/x-tex">\\zeta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0738em;">ζ</span></span></span></span> 降低为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>ζ</mi><mo>~</mo></mover><mo>&lt;</mo><mi>ζ</mi></mrow><annotation encoding="application/x-tex">\\tilde{\\zeta} &lt; \\zeta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1257em;vertical-align:-0.1944em;"></span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9313em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0738em;">ζ</span></span><span style="top:-3.6134em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">~</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0738em;">ζ</span></span></span></span>。</p>
<h3 id="3-2-jsbfx">3.2 加速比分析</h3>
<p>在理想条件下(无网络延迟、无 straggler)，EDiT 的理论加速比为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Speedup</mtext><mo>=</mo><mfrac><msub><mi>T</mi><mtext>sync</mtext></msub><msub><mi>T</mi><mtext>EDiT</mtext></msub></mfrac><mo>=</mo><mfrac><mrow><mi>N</mi><mo>⋅</mo><msub><mi>t</mi><mtext>comp</mtext></msub><mo>+</mo><msub><mi>t</mi><mtext>comm</mtext></msub></mrow><mrow><mi>N</mi><mo>⋅</mo><msub><mi>t</mi><mtext>comp</mtext></msub><mi mathvariant="normal">/</mi><mi>K</mi><mo>+</mo><msub><mi>t</mi><mtext>comm</mtext></msub><mi mathvariant="normal">/</mi><mi>K</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{Speedup} = \\frac{T_{\\text{sync}}}{T_{\\text{EDiT}}} = \\frac{N \\cdot t_{\\text{comp}} + t_{\\text{comm}}}{N \\cdot t_{\\text{comp}} / K + t_{\\text{comm}} / K}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Speedup</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1963em;vertical-align:-0.836em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">EDiT</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sync</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3324em;vertical-align:-0.9721em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">comp</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">comm</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">comp</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">comm</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mtext>comm</mtext></msub><mo>≫</mo><msub><mi>t</mi><mtext>comp</mtext></msub></mrow><annotation encoding="application/x-tex">t_{\\text{comm}} \\gg t_{\\text{comp}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">comm</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9012em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">comp</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 时(通信瓶颈)，加速比趋近于 K。</p>
<p>在 Ling 的实际环境中(异构硬件 + 有限带宽)，实测加速比达 <strong>66.1%</strong>(即训练时间缩短 40%)。</p>
<hr>
<h2 id="4-syyz">4. 实验验证</h2>
<h3 id="4-1-kzxs">4.1 扩展效率</h3>
<p><img src="/llm-guide/14-models/14.16-ling/01-ling-lite/05-ling-lite-edit-ybxlcl/images/f2b9fa84299fca7126154260936a6f527765f582ce1079eb14ee5f538d5d5cc97.jpg" alt="图 8: 传统方法与 EDiT 的速度对比"></p>
<p><strong>实验设置</strong>: 在不同加速器数量下对比 EDiT 与 All-Reduce 的 throughput。</p>
<table>
<thead>
<tr>
<th>加速器数量</th>
<th>All-Reduce (step/s)</th>
<th>EDiT (step/s)</th>
<th>加速比</th>
</tr>
</thead>
<tbody><tr>
<td>8</td>
<td>0.183</td>
<td>0.204</td>
<td>1.11×</td>
</tr>
<tr>
<td>16</td>
<td>0.137</td>
<td>0.183</td>
<td>1.34×</td>
</tr>
<tr>
<td>32</td>
<td>0.091</td>
<td>0.146</td>
<td>1.60×</td>
</tr>
<tr>
<td>64</td>
<td>0.061</td>
<td>0.113</td>
<td>1.85×</td>
</tr>
<tr>
<td>128</td>
<td>0.041</td>
<td>0.091</td>
<td>2.22×</td>
</tr>
<tr>
<td>256</td>
<td>0.028</td>
<td>0.073</td>
<td>2.61×</td>
</tr>
<tr>
<td>512</td>
<td>0.019</td>
<td>0.061</td>
<td>3.21×</td>
</tr>
<tr>
<td>1024</td>
<td>0.013</td>
<td>0.055</td>
<td>4.23×</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>趋势</strong>: 随着加速器数量增加，传统方法的 throughput 急剧下降(通信开销占主导)，而 EDiT 保持更平缓的下降。在 1024 卡规模下，EDiT 的 throughput 是传统方法的 <strong>4.2 倍</strong>。</p>
</blockquote>
<h3 id="4-2-mxxndb">4.2 模型性能对比</h3>
<p>在相同训练预算下，对比 EDiT 与 All-Reduce 训练得到的模型性能：</p>
<table>
<thead>
<tr>
<th>方法</th>
<th>MMLU</th>
<th>GSM8K</th>
<th>HumanEval</th>
<th>训练时间</th>
</tr>
</thead>
<tbody><tr>
<td>All-Reduce</td>
<td>71.2</td>
<td>78.5</td>
<td>76.2</td>
<td>100% (baseline)</td>
</tr>
<tr>
<td>EDiT</td>
<td>71.5</td>
<td>79.1</td>
<td>77.8</td>
<td>63.9%</td>
</tr>
</tbody></table>
<p><strong>结论</strong>: EDiT 在显著缩短训练时间的同时，模型性能<strong>不降反升</strong>。这得益于伪梯度惩罚对噪声梯度的过滤效果。</p>
<h3 id="4-3-yghjxdbx">4.3 异构环境下的表现</h3>
<p>模拟 Ling 的实际训练环境(Device A/B/C/D/E 混合)：</p>
<table>
<thead>
<tr>
<th>配置</th>
<th>All-Reduce</th>
<th>EDiT</th>
<th>加速比</th>
</tr>
</thead>
<tbody><tr>
<td>同构(全 D)</td>
<td>0.55 step/s</td>
<td>0.61 step/s</td>
<td>1.11×</td>
</tr>
<tr>
<td>2:1 异构(D:B)</td>
<td>0.18 step/s</td>
<td>0.42 step/s</td>
<td>2.33×</td>
</tr>
<tr>
<td>5 种混合</td>
<td>0.09 step/s</td>
<td>0.55 step/s</td>
<td><strong>6.11×</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键发现</strong>: 异构程度越高，EDiT 的优势越明显。在 5 种硬件混合的最极端场景下，EDiT 的加速比达到 <strong>6.11×</strong>。</p>
</blockquote>
<hr>
<h2 id="5-gcsxyd">5. 工程实现要点</h2>
<h3 id="5-1-y-megatron-deep-speed-djc">5.1 与 Megatron/DeepSpeed 的集成</h3>
<p>EDiT 作为 DLRover 框架的一个插件，可与现有训练框架无缝集成：</p>
<pre><code class="language-python"># 伪代码：EDiT 集成到 Megatron
from dlrover.eddit import EDiTTrainer

trainer = EDiTTrainer(
    model=model,
    optimizer=optimizer,
    sync_mode=&#39;layer_wise&#39;,      # 逐层同步
    sync_trigger=&#39;time_based&#39;,    # 基于时间触发
    sync_interval=5.0,           # 每 5 秒同步
    pseudo_grad_penalty=True,     # 启用伪梯度惩罚
    anomaly_threshold=3.0,       # 异常检测阈值
    grad_clip_threshold=1.0      # 梯度裁剪阈值
)

trainer.train(dataloader)
</code></pre>
<h3 id="5-2-nckx">5.2 内存开销</h3>
<table>
<thead>
<tr>
<th>组件</th>
<th>额外内存</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>伪梯度缓存</td>
<td>+0.5%</td>
<td>存储每个 worker 的伪梯度 EMA</td>
</tr>
<tr>
<td>层间参数缓存</td>
<td>+2%</td>
<td>预取下一层参数</td>
</tr>
<tr>
<td>异常检测状态</td>
<td>+0.1%</td>
<td>worker 健康状态标记</td>
</tr>
<tr>
<td><strong>总计</strong></td>
<td><strong>+2.6%</strong></td>
<td>可忽略不计</td>
</tr>
</tbody></table>
<h3 id="5-3-rcjz">5.3 容错机制</h3>
<p>EDiT 内置多级容错：</p>
<ol>
<li><strong>Worker 故障检测</strong>: XPUTimer 实时监控，3 秒内发现故障</li>
<li><strong>自动剔除</strong>: 异常 worker 被自动排除出同步组</li>
<li><strong>弹性扩缩容</strong>: 支持训练过程中动态增减 worker</li>
<li><strong>检查点恢复</strong>: 每 15 分钟自动保存，故障后 30 秒内恢复</li>
</ol>
<hr>
<h2 id="6-yxggzddb">6. 与相关工作的对比</h2>
<table>
<thead>
<tr>
<th>方法</th>
<th>同步粒度</th>
<th>异构支持</th>
<th>扩展效率</th>
<th>实现复杂度</th>
</tr>
</thead>
<tbody><tr>
<td><strong>All-Reduce</strong></td>
<td>全局</td>
<td>×</td>
<td>低</td>
<td>低</td>
</tr>
<tr>
<td><strong>Local SGD</strong></td>
<td>固定步数</td>
<td>△</td>
<td>中</td>
<td>低</td>
</tr>
<tr>
<td><strong>SlowMo</strong></td>
<td>动量缓冲</td>
<td>△</td>
<td>中</td>
<td>中</td>
</tr>
<tr>
<td><strong>Quasi-Global</strong></td>
<td>自适应</td>
<td>○</td>
<td>中</td>
<td>高</td>
</tr>
<tr>
<td><strong>EDiT</strong></td>
<td><strong>逐层 + 时间</strong></td>
<td><strong>✓</strong></td>
<td><strong>高</strong></td>
<td><strong>中</strong></td>
</tr>
</tbody></table>
<p><strong>EDiT 的差异化优势</strong>:</p>
<ol>
<li><strong>细粒度同步</strong>: 逐层同步比全局同步通信量小 10×+</li>
<li><strong>时间触发</strong>: 适应异构硬件的速度差异</li>
<li><strong>伪梯度惩罚</strong>: 解决 Local SGD 的收敛质量问题</li>
<li><strong>即插即用</strong>: 可作为插件集成到现有框架</li>
</ol>
<hr>
<h2 id="7-sjyyyjx">7. 实际应用与局限</h2>
<h3 id="7-1-sycj">7.1 适用场景</h3>
<p>✅ <strong>强烈推荐</strong>:</p>
<ul>
<li>异构硬件环境(如云上 spot instance)</li>
<li>跨地域分布式训练</li>
<li>通信带宽受限的场景</li>
<li>需要弹性扩缩容的训练任务</li>
</ul>
<p>⚠️ <strong>谨慎使用</strong>:</p>
<ul>
<li>同构高端集群(H100 全满配)→ 收益有限(~10%)</li>
<li>超大规模集群(&gt;4096 卡)→ 需额外优化</li>
<li>对数值精度极度敏感的任务 → 需充分验证</li>
</ul>
<h3 id="7-2-yzjx">7.2 已知局限</h3>
<ol>
<li><strong>超参数敏感</strong>: sync_interval 和 grad_clip_threshold 需要根据硬件环境调优</li>
<li><strong>小模型收益低</strong>: 在 &lt;1B 参数模型上，通信开销占比小，EDiT 收益有限</li>
<li><strong>与某些优化的兼容性</strong>: 与 1-bit Adam 等梯度压缩技术结合时需谨慎</li>
<li><strong>调试复杂性</strong>: 异步训练的问题定位比同步训练更困难</li>
</ol>
<hr>
<h2 id="8-zj">8. 总结</h2>
<p>EDiT 是面向异构硬件环境的 LLM 分布式训练的一项重要创新。其核心贡献：</p>
<ol>
<li><strong>逐层同步</strong>将通信量降低 10×+</li>
<li><strong>伪梯度惩罚</strong>解决了 Local SGD 的收敛质量问题</li>
<li><strong>基于时间的同步</strong>充分发挥快节点的算力优势</li>
<li>在 Ling 的实际环境中实现了 <strong>66.1% 的训练加速</strong></li>
</ol>
<p>对于算力资源有限、需要在异构硬件上训练大模型的团队，EDiT 提供了一条经过验证的高效路径。</p>
<hr>
<p><strong>延伸阅读</strong>:</p>
<ul>
<li>EDiT 论文: Cheng et al., &quot;EDiT: A Local-SGD-based Efficient Distributed Training Method for Large Language Models&quot;, ICLR 2025</li>
<li>DLRover 开源: <a href="https://github.com/intelligent-machine-learning/dlrover">https://github.com/intelligent-machine-learning/dlrover</a></li>
<li>Local SGD 综述: Lin et al., &quot;Don&#39;t Use Large Mini-Batches, Use Local SGD&quot;, ICLR 2020</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj","text":"1. 问题背景"},{"level":3,"id":"1-1-ctfbsxldpj","text":"1.1 传统分布式训练的瓶颈"},{"level":3,"id":"1-2-ygyjdtskn","text":"1.2 异构硬件的特殊困难"},{"level":2,"id":"2-edit-hxsj","text":"2. EDiT 核心设计"},{"level":3,"id":"2-1-zctb-layer-wise-synchronization","text":"2.1 逐层同步(Layer-wise Synchronization)"},{"level":3,"id":"2-2-wtdcf-pseudo-gradient-penalty","text":"2.2 伪梯度惩罚(Pseudo Gradient Penalty)"},{"level":4,"id":"1-ycxc-anomaly-elimination","text":"(1) 异常消除(Anomaly Elimination)"},{"level":4,"id":"2-jqpj-weighted-averaging","text":"(2) 加权平均(Weighted Averaging)"},{"level":4,"id":"3-tdcj-gradient-clipping","text":"(3) 梯度裁剪(Gradient Clipping)"},{"level":3,"id":"2-3-jysjdtb-time-based-synchronization","text":"2.3 基于时间的同步(Time-based Synchronization)"},{"level":2,"id":"3-llfx","text":"3. 理论分析"},{"level":3,"id":"3-1-slxbz","text":"3.1 收敛性保证"},{"level":3,"id":"3-2-jsbfx","text":"3.2 加速比分析"},{"level":2,"id":"4-syyz","text":"4. 实验验证"},{"level":3,"id":"4-1-kzxs","text":"4.1 扩展效率"},{"level":3,"id":"4-2-mxxndb","text":"4.2 模型性能对比"},{"level":3,"id":"4-3-yghjxdbx","text":"4.3 异构环境下的表现"},{"level":2,"id":"5-gcsxyd","text":"5. 工程实现要点"},{"level":3,"id":"5-1-y-megatron-deep-speed-djc","text":"5.1 与 Megatron/DeepSpeed 的集成"},{"level":3,"id":"5-2-nckx","text":"5.2 内存开销"},{"level":3,"id":"5-3-rcjz","text":"5.3 容错机制"},{"level":2,"id":"6-yxggzddb","text":"6. 与相关工作的对比"},{"level":2,"id":"7-sjyyyjx","text":"7. 实际应用与局限"},{"level":3,"id":"7-1-sycj","text":"7.1 适用场景"},{"level":3,"id":"7-2-yzjx","text":"7.2 已知局限"},{"level":2,"id":"8-zj","text":"8. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.16-ling/01-ling-lite/05-ling-lite-edit-ybxlcl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.16-ling/01-ling-lite/05-ling-lite-edit-ybxlcl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">EDiT：面向异构硬件的高效异步分布式训练</h1>
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
