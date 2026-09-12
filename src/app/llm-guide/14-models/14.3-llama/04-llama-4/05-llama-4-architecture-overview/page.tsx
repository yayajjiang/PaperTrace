"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama 4 架构迭代与原生多模态设计剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Meta 官方 Model Card、GitHub 开源代码(llama-models)、Meta AI 博客、arXiv:2601.11659(已撤回). Llama 4 暂未发布正式 arXiv 技术报告,本文基于官方已公开的技术细节与开源代码进行系统性架构剖析.
发布时间: 2025年4月</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsm-llama-4-xzl-moe-ysdmt">1. 设计动机: 为什么 Llama 4 选择了 MoE + 原生多模态</h2>
<p>Llama 1~3 三代模型均基于 Dense Transformer 架构,这一选择在开源社区建立了 Llama 作为「可靠 Dense 基线」的声誉. 但 Llama 4 做出了两个根本性转向:全面采用 MoE(Mixture-of-Experts)架构,以及从纯文本扩展到原生多模态.</p>
<p>这一转向的驱动因素可以概括为三点:</p>
<table>
<thead>
<tr>
<th>动机</th>
<th>Llama 3 的局限</th>
<th>Llama 4 的解决方案</th>
</tr>
</thead>
<tbody><tr>
<td>计算效率</td>
<td>405B Dense 模型推理成本极高,即使 FP8 量化也需要多台服务器</td>
<td>MoE 17B 激活参数,以 Dense 17B 的计算成本获得 109B~400B 的模型容量</td>
</tr>
<tr>
<td>多模态能力</td>
<td>Llama 3 为纯文本模型,视觉能力依赖后期添加的适配器</td>
<td>Early Fusion 设计,预训练阶段即将视觉与文本 token 融合到统一主干</td>
</tr>
<tr>
<td>上下文长度</td>
<td>Llama 3 最大 128K,难以支撑代码库级理解或整书翻译</td>
<td>Scout 支持 10M token,通过 iRoPE 和注意力温度调节实现</td>
</tr>
</tbody></table>
<p>这里需要停下来想一下. Meta 在 Llama 3 405B 上投入了大量资源——约 21M H100 GPU 小时的训练成本——但推理阶段的显存和计算需求使得 405B Dense 模型对绝大多数开发者而言「看得懂、用不起」. MoE 架构用「小激活、大容量」的思路解决了这一矛盾:每个 token 只激活约 4% 的总参数(17B/400B),但模型仍能利用全部 400B 参数中存储的知识. 这本质上是在 Transformer 的 FFN 层引入了条件计算(conditional computation),让不同 token 动态选择最匹配的计算路径.</p>
<p>不过,Meta 选择 MoE 的时机值得关注. DeepSeek-V2(2024.05)、Qwen3(2025.01)等模型已经验证了 MoE 在开源领域的可行性,Llama 4 的 MoE 转向更像是「跟随验证后的主流」而非「开创性探索」. 真正的差异化在于 Meta 将 MoE 与原生多模态、超长上下文捆绑发布,形成了一套完整的开源模型解决方案.</p>
<hr>
<h2 id="2-jgyj-c-llama-3-dense-d-llama-4-moe">2. 架构演进: 从 Llama 3 Dense 到 Llama 4 MoE</h2>
<h3 id="2-1-csgmyjsxsdzxph">2.1 参数规模与计算效率的重新平衡</h3>
<p>Llama 4 包含三个模型变体,但只有 Scout 和 Maverick 已公开发布:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>总参数量</th>
<th>激活参数量</th>
<th>激活比例</th>
<th>专家数</th>
<th>Top-K</th>
<th>上下文长度</th>
<th>预训练 Token</th>
</tr>
</thead>
<tbody><tr>
<td>Scout</td>
<td>109B</td>
<td>17B</td>
<td>15.6%</td>
<td>16</td>
<td>1</td>
<td>10M</td>
<td>~40T</td>
</tr>
<tr>
<td>Maverick</td>
<td>400B</td>
<td>17B</td>
<td>4.25%</td>
<td>128</td>
<td>1</td>
<td>1M</td>
<td>~22T</td>
</tr>
<tr>
<td>Behemoth(preview)</td>
<td>~2T</td>
<td>288B</td>
<td>~14.4%</td>
<td>16</td>
<td>1</td>
<td>-</td>
<td>训练中</td>
</tr>
</tbody></table>
<p>一个值得注意的设计选择是:Scout 和 Maverick 的激活参数量相同(17B),但总参数量和专家数差异巨大. 这意味着两个模型的单次前向传播计算量(FLOPs)大致相当,但 Maverick 拥有更大的知识容量(400B vs 109B)和更细粒度的专家分工(128 vs 16).</p>
<p>这里的设计权衡非常清晰:在固定推理预算(17B 激活)下,通过调整专家数量和总参数量,可以在「知识广度」(Maverick 的 400B)和「长上下文能力」(Scout 的 10M)之间做产品级区分. Scout 选择更少的专家(16 个)和更多的训练数据(40T),可能意味着其路由网络更简单、训练更稳定,从而可以将更多计算预算分配给上下文扩展;Maverick 选择更多的专家(128 个)和较少的训练数据(22T),追求在固定推理成本下最大化模型容量.</p>
<h3 id="2-2-jt-dense-moe-c-yzwsdxshcl">2.2 交替 Dense/MoE 层: 一种务实的稀疏化策略</h3>
<p>与 DeepSeek-V3(每层都是 MoE)或 Mixtral(每隔一层 MoE)不同,Llama 4 采用了更细粒度的交替策略——<code>interleave_moe_layer_step=1</code>,即严格地每隔一层设置一个 MoE 层:</p>
<pre><code>Layer 1: Dense FFN
Layer 2: MoE (Router + Shared Expert + 1 Routed Expert)
Layer 3: Dense FFN
Layer 4: MoE
...
</code></pre>
<p>这种设计的工程考量是:</p>
<ul>
<li><strong>Dense 层保持全局模式捕获</strong>: 全连接的 FFN 层在每个位置应用相同的变换,有利于学习跨位置的全局语言和视觉模式</li>
<li><strong>MoE 层实现专业化分工</strong>: 稀疏层让不同 token 路由到不同的专家,学习多样化的子空间表示</li>
<li><strong>交替设计降低通信开销</strong>: 相比每层都是 MoE,交替设计减少了分布式部署时的 all-to-all 通信频率</li>
</ul>
<p>从 GitHub 源码 <code>args.py</code> 中提取的关键 MoE 超参数:</p>
<table>
<thead>
<tr>
<th>参数</th>
<th>Scout</th>
<th>Maverick</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>num_experts</td>
<td>16</td>
<td>128</td>
<td>每层专家总数</td>
</tr>
<tr>
<td>top_k</td>
<td>1</td>
<td>1</td>
<td>每个 token 激活的路由专家数</td>
</tr>
<tr>
<td>capacity_factor</td>
<td>1.0</td>
<td>1.0</td>
<td>专家容量上限系数</td>
</tr>
<tr>
<td>auto_scale_F</td>
<td>True</td>
<td>True</td>
<td>自动调整 hidden_dim 以匹配 Dense 等效计算量</td>
</tr>
<tr>
<td>interleave_moe_layer_step</td>
<td>1</td>
<td>1</td>
<td>每隔一层设置 MoE</td>
</tr>
</tbody></table>
<p><strong>Top-K=1 的极端稀疏性</strong>是一个值得深入分析的选择. 大多数 MoE 模型使用 top_k=2(Mixtral)或更高(DeepSeek-V3 使用 top_k=6+1 shared). Llama 4 选择 top_k=1 意味着:</p>
<ul>
<li><strong>推理时 KV Cache 最小化</strong>: 每个 token 只需存储 1 个 routed expert + 1 个 shared expert 的 KV,而非多个专家的并集</li>
<li><strong>路由决策容错率低</strong>: 如果路由器选错了专家,没有第二个专家可以补偿,对路由器的准确性要求更高</li>
<li><strong>与共享专家互补</strong>: <code>shared expert</code> 始终激活,提供基础的全局计算能力,top_k=1 的 routed expert 则提供专业化补充</li>
</ul>
<h3 id="2-3-gxzjdsjlj">2.3 共享专家的设计逻辑</h3>
<p>Llama 4 的每个 MoE 层包含两类专家:</p>
<ul>
<li><strong>Shared Expert</strong>: 始终激活,负责提供全局性的基础变换</li>
<li><strong>Routed Expert</strong>: 由路由器动态选择(Top-1),负责专业化处理</li>
</ul>
<p>这与 DeepSeekMoE 的共享专家设计有相似之处,但 Llama 4 只使用 1 个 shared expert 配合 1 个 routed expert(top_k=1),而 DeepSeek-V3 使用 1 个 shared expert 配合 6 个 routed expert.</p>
<p>共享专家的作用可以从两个角度理解:</p>
<ol>
<li><strong>稳定性角度</strong>: 始终激活的 shared expert 确保了无论路由决策如何,每层都有稳定的梯度传播路径,防止「死专家」问题</li>
<li><strong>容量角度</strong>: shared expert 可以专注于学习通用的语言和视觉表示,让 routed expert 更专注于特定类型的输入(如代码、数学、多语言等)</li>
</ol>
<hr>
<h2 id="3-csxwgc-c-128k-d-10m-djslj">3. 长上下文工程: 从 128K 到 10M 的技术路径</h2>
<h3 id="3-1-scaled-rope-pswtdphcl">3.1 Scaled RoPE: 频率外推的平滑策略</h3>
<p>Scout 支持 10M token 上下文,这是通过 Scaled Rotary Position Embedding 实现的. 源码中的关键参数:</p>
<ul>
<li><code>rope_scaling_factor = 16</code></li>
<li><code>rope_high_freq_factor = 1</code></li>
<li><code>rope_theta = 500000</code></li>
<li><code>use_scaled_rope = True</code>(仅 Scout)</li>
</ul>
<p>Scaled RoPE 的核心思想是对 RoPE 的频率进行平滑插值:对高频分量(短波长,对应局部位置关系)不做处理,对低频分量(长波长,对应全局位置关系)按 scale_factor 压缩,中间频率区域做线性过渡.</p>
<p>数学上,给定原始频率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi></mrow><annotation encoding="application/x-tex">freq</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span> 和波长 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi><mi>a</mi><mi>v</mi><mi>e</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi><mo>=</mo><mn>2</mn><mi>π</mi><mi mathvariant="normal">/</mi><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi></mrow><annotation encoding="application/x-tex">wavelength = 2\\pi / freq</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span>,缩放后的新频率为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>f</mi><mi>r</mi><mi>e</mi><msup><mi>q</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mi>w</mi><mi>a</mi><mi>v</mi><mi>e</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi><mo>&lt;</mo><mi>h</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">_</mi><mi>w</mi><mi>a</mi><mi>v</mi><mi>e</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">/</mi><mi>s</mi><mi>c</mi><mi>a</mi><mi>l</mi><mi>e</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>a</mi><mi>c</mi><mi>t</mi><mi>o</mi><mi>r</mi></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mi>w</mi><mi>a</mi><mi>v</mi><mi>e</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi><mo>&gt;</mo><mi>l</mi><mi>o</mi><mi>w</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">_</mi><mi>w</mi><mi>a</mi><mi>v</mi><mi>e</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><mi>s</mi><mi>m</mi><mi>o</mi><mi>o</mi><mi>t</mi><mi>h</mi><mo stretchy="false">)</mo><mo>⋅</mo><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">/</mi><mi>s</mi><mi>c</mi><mi>a</mi><mi>l</mi><mi>e</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>a</mi><mi>c</mi><mi>t</mi><mi>o</mi><mi>r</mi><mo>+</mo><mi>s</mi><mi>m</mi><mi>o</mi><mi>o</mi><mi>t</mi><mi>h</mi><mo>⋅</mo><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">freq&#x27; = \\begin{cases}
freq &amp; \\text{if } wavelength &lt; high\\_freq\\_wavelength \\\\
freq / scale\\_factor &amp; \\text{if } wavelength &gt; low\\_freq\\_wavelength \\\\
(1 - smooth) \\cdot freq / scale\\_factor + smooth \\cdot freq &amp; \\text{otherwise}
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9963em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:4.32em;vertical-align:-1.91em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.35em;"><span style="top:-2.2em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎩</span></span></span><span style="top:-2.192em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.316em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"/></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎨</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.316em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"/></svg></span></span><span style="top:-4.6em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎧</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.85em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.41em;"><span style="top:-4.41em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span><span style="top:-2.97em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord">/</span><span class="mord mathnormal">sc</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">a</span><span class="mord mathnormal">c</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0278em;">or</span></span></span><span style="top:-1.53em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">s</span><span class="mord mathnormal">m</span><span class="mord mathnormal">oo</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord">/</span><span class="mord mathnormal">sc</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">a</span><span class="mord mathnormal">c</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0278em;">or</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">s</span><span class="mord mathnormal">m</span><span class="mord mathnormal">oo</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.91em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.41em;"><span style="top:-4.41em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">hi</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">h</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span></span></span><span style="top:-2.97em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span></span></span><span style="top:-1.53em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.91em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mi>m</mi><mi>o</mi><mi>o</mi><mi>t</mi><mi>h</mi><mo>=</mo><mo stretchy="false">(</mo><mi>o</mi><mi>l</mi><mi>d</mi><mi mathvariant="normal">_</mi><mi>c</mi><mi>o</mi><mi>n</mi><mi>t</mi><mi>e</mi><mi>x</mi><mi>t</mi><mi mathvariant="normal">_</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi mathvariant="normal">/</mi><mi>w</mi><mi>a</mi><mi>v</mi><mi>e</mi><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi><mo>−</mo><mi>l</mi><mi>o</mi><mi>w</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>a</mi><mi>c</mi><mi>t</mi><mi>o</mi><mi>r</mi><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mo stretchy="false">(</mo><mi>h</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>a</mi><mi>c</mi><mi>t</mi><mi>o</mi><mi>r</mi><mo>−</mo><mi>l</mi><mi>o</mi><mi>w</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>r</mi><mi>e</mi><mi>q</mi><mi mathvariant="normal">_</mi><mi>f</mi><mi>a</mi><mi>c</mi><mi>t</mi><mi>o</mi><mi>r</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">smooth = (old\\_context\\_len / wavelength - low\\_freq\\_factor) / (high\\_freq\\_factor - low\\_freq\\_factor)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">s</span><span class="mord mathnormal">m</span><span class="mord mathnormal">oo</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mopen">(</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">d</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal">co</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">e</span><span class="mord mathnormal">x</span><span class="mord mathnormal">t</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">t</span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">a</span><span class="mord mathnormal">c</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0278em;">or</span><span class="mclose">)</span><span class="mord">/</span><span class="mopen">(</span><span class="mord mathnormal">hi</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">h</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">a</span><span class="mord mathnormal">c</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0278em;">or</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">a</span><span class="mord mathnormal">c</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0278em;">or</span><span class="mclose">)</span></span></span></span>.</p>
<p>这里需要停下来想一下. 传统的位置编码外推方法(如直接插值或 NTK-aware 缩放)通常对所有频率做统一处理,但 Scaled RoPE 的「选择性缩放」策略更具物理直觉:短距离依赖(高频)在人类语言和视觉中始终重要,不应被压缩;长距离依赖(低频)才是外推时需要调整的. 这种「保近压远」的策略与 YaRN 类似,但 Llama 4 将其与 NOPE 层和注意力温度调节结合,形成了更完整的长上下文解决方案.</p>
<h3 id="3-2-nope-c-qcwzbmdzylc">3.2 NOPE 层: 去除位置编码的注意力层</h3>
<p>源码中出现了 <code>nope_layer_interval</code> 参数,表明部分 attention 层不使用位置编码. 这与 DeepSeek-V2/V3 的 MLA 中去除位置编码的设计思路类似.</p>
<p>NOPE(No Position Encoding)层的动机是:在极长序列中,位置编码的累积噪声可能干扰注意力计算. 去除位置编码后,这些层仅依赖内容相似度进行注意力分配,类似于「内容路由」机制. 在 10M token 的尺度上,位置编码的数值稳定性确实是一个需要关注的问题——RoPE 的旋转矩阵在极长距离上可能出现数值漂移.</p>
<h3 id="3-3-zylwdtj-fz-softmax-gdrh">3.3 注意力温度调节: 防止 Softmax 过度锐化</h3>
<p>当序列长度增加时,注意力分数的尺度会自然漂移,导致 Softmax 输出过度锐化——少数 token 获得接近 1 的注意力权重,其余接近 0. 这种现象在长序列中尤为明显,因为 query-key 点积的方差随维度增加而增大.</p>
<p>Llama 4 的注意力温度调节机制通过动态调整 attention temperature 来缓解这一问题:</p>
<pre><code class="language-python">attn_temperature_tuning: bool = False  # 超长上下文时启用
floor_scale: float = 8192.0
attn_scale: float = 0.1
</code></pre>
<p>具体实现上,注意力分数在 Softmax 前会被一个与序列长度相关的温度因子缩放,防止注意力分布过于集中. 这是支持 10M 上下文稳定运行的关键技术之一,也是对「注意力稀释」问题的直接工程回应.</p>
<h3 id="3-4-djdsxwkzxl">3.4 多阶段上下文扩展训练</h3>
<p>Llama 4 的长上下文能力不是一次性训练到 10M 的,而是通过多阶段渐进扩展:</p>
<table>
<thead>
<tr>
<th>阶段</th>
<th>上下文长度</th>
<th>关键技术</th>
<th>目的</th>
</tr>
</thead>
<tbody><tr>
<td>初始预训练</td>
<td>8K~128K</td>
<td>标准 RoPE</td>
<td>建立基础语言和多模态能力</td>
</tr>
<tr>
<td>Mid-training</td>
<td>128K~1M</td>
<td>长序列数据 + Scaled RoPE</td>
<td>扩展上下文处理能力</td>
</tr>
<tr>
<td>超长上下文激活</td>
<td>1M → 10M</td>
<td>iRoPE + NOPE + 注意力温度调节</td>
<td>实现 10M 稳定运行</td>
</tr>
<tr>
<td>后训练</td>
<td>保持</td>
<td>SFT + RL + DPO</td>
<td>指令对齐和行为优化</td>
</tr>
</tbody></table>
<p>Scout 的 <code>rope_scaling_factor=16</code> 和基础长度 8192 意味着理论外推长度约为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8192</mn><mo>×</mo><mn>16</mn><mo>=</mo><mn>131072</mn></mrow><annotation encoding="application/x-tex">8192 \\times 16 = 131072</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8192</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">16</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">131072</span></span></span></span>. 但实际支持 10M 说明还结合了 NOPE 层、注意力温度调节以及可能的循环或压缩机制. 10M 的 KV Cache 在 BF16 下即使对 17B 激活模型也需要数百 GB 显存,这意味着 10M 上下文的实际部署需要显存优化技术(如 KV Cache 压缩、分页注意力等)的配合.</p>
<hr>
<h2 id="4-ysdmt-early-fusion-djghy">4. 原生多模态: Early Fusion 的架构含义</h2>
<h3 id="4-1-c-late-fusion-d-early-fusion-dfszy">4.1 从 Late Fusion 到 Early Fusion 的范式转移</h3>
<p>传统多模态模型(如 LLaVA 系列)采用 Late Fusion 设计:先分别用独立的视觉Encoder 和文本Encoder 处理输入,再通过 projector(如 MLP 或 Q-Former)对齐后输入 LLM. 这种设计的优势是模块化和灵活性——可以单独更新视觉或语言模块——但存在信息瓶颈:视觉信息在被压缩为少量 query token 时可能丢失细节.</p>
<p>Llama 4 采用 Early Fusion 设计:在预训练阶段即将图像 patch token 与文本 token 混合到统一的序列中,共享同一个 Transformer 主干和注意力机制. 这种设计的架构含义是:</p>
<ul>
<li><strong>视觉和语言在注意力层面直接交互</strong>: 图像 patch 可以直接 attend 到文本 token,反之亦然,无需通过 projector 间接通信</li>
<li><strong>统一的表示空间</strong>: 视觉和语言信息在同一高维空间中编码,理论上可以学习更深度的跨模态关联</li>
<li><strong>任意模态组合</strong>: 多图、图文交错、视频帧序列都可以统一处理为「混合模态 token 序列」</li>
</ul>
<h3 id="4-2-tile-based-txbm">4.2 Tile-based 图像编码</h3>
<p>Llama 4 使用特殊的 token 序列来表示图像输入:</p>
<ul>
<li><code>&lt;|image_start|&gt;</code> / <code>&lt;|image_end|&gt;</code>: 包裹图像数据</li>
<li><code>&lt;|patch|&gt;</code>: 图像 patch</li>
<li><code>&lt;|tile_x_separator|&gt;</code> / <code>&lt;|tile_y_separator|&gt;</code>: 分隔不同 tile</li>
<li><code>&lt;|image|&gt;</code>: 分隔原始尺寸图像与下采样后的单 tile 版本</li>
</ul>
<p>这种设计表明 Llama 4 采用了 <strong>tile-based 图像编码</strong>:高分辨率图像被切分为多个 tile,每个 tile 编码为一系列 patch token. 这与 Gemini 的「patch 化」策略类似,但 Llama 4 通过 separator token 显式标记 tile 边界,而不是依赖位置编码隐式区分.</p>
<p>从工程角度看,tile-based 编码的优势是:</p>
<ul>
<li><strong>处理任意分辨率</strong>: 不受固定输入尺寸限制</li>
<li><strong>局部细节保留</strong>: 高分辨率区域通过更多 tile 覆盖</li>
<li><strong>计算效率</strong>: 每个 tile 独立编码,便于并行化</li>
</ul>
<p>但代价是序列长度随图像分辨率线性增长——一张高分辨率图像可能产生数千个 patch token,对注意力计算的二次复杂度构成挑战.</p>
<h3 id="4-3-early-fusion-dgcdj">4.3 Early Fusion 的工程代价</h3>
<p>Early Fusion 虽然概念上更优雅,但工程复杂度远高于 Late Fusion:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Late Fusion (LLaVA)</th>
<th>Early Fusion (Llama 4)</th>
</tr>
</thead>
<tbody><tr>
<td>预训练数据</td>
<td>文本和图像可以分开预训练</td>
<td>必须同时处理文本和图像数据</td>
</tr>
<tr>
<td>数据配比</td>
<td>视觉数据比例灵活调整</td>
<td>需要精心设计视觉/文本 token 比例</td>
</tr>
<tr>
<td>训练稳定性</td>
<td>视觉和语言模块独立优化</td>
<td>统一优化,模态间的梯度冲突更复杂</td>
</tr>
<tr>
<td>推理效率</td>
<td>视觉编码一次性完成</td>
<td>视觉 patch 参与全程注意力计算</td>
</tr>
<tr>
<td>扩展性</td>
<td>容易替换视觉Encoder</td>
<td>视觉编码与语言主干深度耦合</td>
</tr>
</tbody></table>
<p>Meta 选择在 Llama 4 上采用 Early Fusion,说明其内部基础设施已能支撑大规模多模态预训练. 但从 benchmark 结果来看,Maverick 的 MMMU 73.4 和 MathVista 73.7 虽然优秀,但与专门的 VLM(如 Qwen2.5-VL、Kimi-VL)相比并不占绝对优势. 这可能说明:原生多模态的优势需要更大规模(如 Behemoth 的 2T 参数)才能充分释放,或者在当前规模下,Late Fusion 配合高质量视觉Encoder 仍然是性价比更高的方案.</p>
<hr>
<h2 id="5-xlclygmfx">5. 训练策略与规模分析</h2>
<h3 id="5-1-sjgmymxgmdfdcsj">5.1 数据规模与模型规模的非对称设计</h3>
<p>Llama 4 的一个反直觉设计是:更小的模型(Scout, 109B 总参)使用了更多的训练数据(40T),而更大的模型(Maverick, 400B 总参)使用了更少的数据(22T).</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>总参数量</th>
<th>预训练 Token</th>
<th>Token/Param 比率</th>
</tr>
</thead>
<tbody><tr>
<td>Scout</td>
<td>109B</td>
<td>~40T</td>
<td>~367</td>
</tr>
<tr>
<td>Maverick</td>
<td>400B</td>
<td>~22T</td>
<td>~55</td>
</tr>
<tr>
<td>Llama 3 8B</td>
<td>8B</td>
<td>~15T</td>
<td>~1875</td>
</tr>
<tr>
<td>Llama 3 70B</td>
<td>70B</td>
<td>~15T</td>
<td>~214</td>
</tr>
<tr>
<td>Llama 3 405B</td>
<td>405B</td>
<td>~15T</td>
<td>~37</td>
</tr>
</tbody></table>
<p>Chinchilla scaling law 建议的计算最优比率约为 20 token/参数(对大规模模型). Scout 的 367 远超这一比率,说明其训练是「数据过剩」的;Maverick 的 55 也超过了计算最优值. 这种超比例的数据训练通常是为了提升模型的知识覆盖和泛化能力,而非追求计算效率.</p>
<p>可能的原因包括:</p>
<ul>
<li>Scout 需要额外的长上下文数据进行 mid-training,这部分数据不计入常规预训练 token 统计</li>
<li>Maverick 的 128 个专家需要更高质量而非更高数量的数据来训练路由器——低质量数据可能导致路由决策噪声</li>
<li>Meta 可能使用了数据重复策略,40T 中的部分数据是高质量数据的重复采样</li>
</ul>
<h3 id="5-2-xlnhyjcss">5.2 训练能耗与基础设施</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>Scout</th>
<th>Maverick</th>
<th>合计</th>
</tr>
</thead>
<tbody><tr>
<td>GPU 训练时间</td>
<td>5.0M H100 小时</td>
<td>2.38M H100 小时</td>
<td>7.38M H100 小时</td>
</tr>
<tr>
<td>GPU 类型</td>
<td>H100-80GB</td>
<td>H100-80GB</td>
<td>-</td>
</tr>
<tr>
<td>单卡功耗(TDP)</td>
<td>700W</td>
<td>700W</td>
<td>-</td>
</tr>
<tr>
<td>位置基准碳排放</td>
<td>1,354 吨 CO2eq</td>
<td>645 吨 CO2eq</td>
<td>1,999 吨 CO2eq</td>
</tr>
</tbody></table>
<p>7.38M H100 GPU 小时的训练规模极为庞大. 作为对比,Llama 3 405B 据报道使用了约 16K H100 训练约 54 天(约 21M GPU 小时). Llama 4 两个模型的总训练量约为 Llama 3 405B 的 35%,但 Scout 和 Maverick 的激活参数仅 17B(对比 405B Dense). 这说明 MoE 架构在训练阶段也具备效率优势——用更少的激活计算量达到了更高的有效容量.</p>
<p>不过需要注意:Scout 的 5.0M H100 小时中,相当比例可能用于长上下文扩展训练(10M 上下文需要专门的长序列数据). 如果剔除这部分,MoE 的训练效率优势可能更为显著.</p>
<h3 id="5-3-hxld-qlj-zx">5.3 后训练的「轻量级」转向</h3>
<p>与 Llama 3 的 6 轮 RS+SFT+DPO 迭代相比,Llama 4 的后训练流程被描述为更「轻量级」,包含:</p>
<ol>
<li>轻量级 SFT(Supervised Fine-Tuning)</li>
<li>在线 RL(Reinforcement Learning)</li>
<li>轻量级 DPO(Direct Preference Optimization)</li>
</ol>
<p>这一转向可能反映了几个趋势:</p>
<ul>
<li><strong>预训练能力的提升</strong>: 随着预训练数据规模和质量的增长,基座模型本身已具备更强的指令遵循能力,减少了对复杂后训练的依赖</li>
<li><strong>合成数据的普及</strong>: 使用合成数据替代人类标注,降低了对多轮迭代的依赖</li>
<li><strong>计算成本控制</strong>: 后训练阶段的计算开销在大规模模型中不可忽视,「轻量级」后训练可以显著降低总成本</li>
</ul>
<hr>
<h2 id="6-xndw-17b-jhrhny-405b-dense">6. 性能定位: 17B 激活如何碾压 405B Dense</h2>
<h3 id="6-1-hxtljzdb">6.1 核心推理基准对比</h3>
<table>
<thead>
<tr>
<th>Benchmark</th>
<th>指标</th>
<th>Llama 3.1 405B(Dense)</th>
<th>Scout(MoE, 17B act)</th>
<th>Maverick(MoE, 17B act)</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>5-shot</td>
<td>85.2</td>
<td>79.6</td>
<td><strong>85.5</strong></td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>5-shot</td>
<td>61.6</td>
<td>58.2</td>
<td><strong>62.9</strong></td>
</tr>
<tr>
<td>MATH</td>
<td>4-shot</td>
<td>53.5</td>
<td>50.3</td>
<td><strong>61.2</strong></td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>0-shot</td>
<td>49.0</td>
<td>57.2</td>
<td><strong>69.8</strong></td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>0-shot</td>
<td>27.7</td>
<td>32.8</td>
<td><strong>43.4</strong></td>
</tr>
<tr>
<td>MBPP</td>
<td>3-shot</td>
<td>74.4</td>
<td>67.8</td>
<td><strong>77.6</strong></td>
</tr>
</tbody></table>
<p>Maverick 以仅 17B 激活参数的 MoE 架构,在几乎所有核心推理基准上超越了 405B Dense 的 Llama 3.1. 这一结果对 Dense 架构的 scaling law 提出了直接挑战:当 MoE 可以用 1/24 的激活计算量达到更好的推理性能时,继续扩大 Dense 模型的意义何在?</p>
<p>需要注意两个细节:</p>
<ol>
<li><strong>训练数据差异</strong>: Llama 4 使用了 22T~40T token,远超 Llama 3 的 15T,部分性能提升可能来自数据规模而非架构本身</li>
<li><strong>后训练优化</strong>: Llama 4 的「轻量级」后训练未必比 Llama 3 的 6 轮迭代弱,可能使用了更高质量的合成数据</li>
</ol>
<h3 id="6-2-dmtnldw">6.2 多模态能力定位</h3>
<table>
<thead>
<tr>
<th>Benchmark</th>
<th>Llama 4 Maverick</th>
<th>GPT-4o</th>
<th>Gemini 2.0 Flash</th>
</tr>
</thead>
<tbody><tr>
<td>MMMU</td>
<td><strong>73.4</strong></td>
<td>69.1</td>
<td>71.7</td>
</tr>
<tr>
<td>MathVista</td>
<td><strong>73.7</strong></td>
<td>63.8</td>
<td>73.1</td>
</tr>
<tr>
<td>DocVQA</td>
<td><strong>94.4</strong></td>
<td>92.8</td>
<td>-</td>
</tr>
<tr>
<td>ChartQA</td>
<td><strong>90.0</strong></td>
<td>-</td>
<td>-</td>
</tr>
</tbody></table>
<p>Maverick 在视觉推理基准上与 GPT-4o 和 Gemini 2.0 Flash 处于同一梯队,甚至在部分指标上领先. 作为开源模型,这是显著成就. 但如前所述,其与专门 VLM 的差距并不明显,说明 Early Fusion 在当前规模下的优势尚未完全释放.</p>
<h3 id="6-3-csxwnl-mtob-jz">6.3 长上下文能力:MTOB 基准</h3>
<p>MTOB(Massively Multilingual Translation of Books)测试整本书的翻译能力,是长上下文模型的专属基准:</p>
<table>
<thead>
<tr>
<th>任务</th>
<th>Scout(10M ctx)</th>
<th>Maverick(1M ctx)</th>
</tr>
</thead>
<tbody><tr>
<td>Half book eng→kgv</td>
<td>42.2</td>
<td><strong>54.0</strong></td>
</tr>
<tr>
<td>Half book kgv→eng</td>
<td>36.6</td>
<td><strong>46.4</strong></td>
</tr>
<tr>
<td>Full book eng→kgv</td>
<td>39.7</td>
<td><strong>50.8</strong></td>
</tr>
<tr>
<td>Full book kgv→eng</td>
<td>36.3</td>
<td><strong>46.7</strong></td>
</tr>
</tbody></table>
<p>有趣的现象是:Maverick(1M 上下文)在 MTOB 上反而优于 Scout(10M 上下文). 这是因为 Maverick 的 400B 总参数提供了更强的翻译能力,而 MTOB 的「半本书」测试可能尚未触及 1M 上下文的上限. Scout 的 10M 上下文优势可能在更长的输入(如整系列书籍、大型代码库)中才能体现.</p>
<hr>
<h2 id="7-bsclylhfa">7. 部署策略与量化方案</h2>
<h3 id="7-1-lhfayyjxq">7.1 量化方案与硬件需求</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>BF16 大小</th>
<th>量化方案</th>
<th>量化后大小</th>
<th>部署要求</th>
</tr>
</thead>
<tbody><tr>
<td>Scout</td>
<td>~218GB</td>
<td>Int4(on-the-fly)</td>
<td>~55GB</td>
<td><strong>单张 H100 GPU</strong></td>
</tr>
<tr>
<td>Maverick</td>
<td>~800GB</td>
<td>FP8</td>
<td>~400GB</td>
<td><strong>单台 H100 DGX host</strong></td>
</tr>
</tbody></table>
<p>Scout 的 Int4 量化后可在单张 H100 上运行,这是其作为「开发者友好模型」定位的关键. 相比之下,Llama 3 405B 即使 FP8 量化也需要多台服务器. MoE 的「小激活」特性在部署阶段的优势被充分发挥:KV Cache 大小与激活参数量(17B)成正比,而非总参数量(109B/400B).</p>
<p>不过,on-the-fly Int4 量化虽然方便,但在某些精度敏感任务上可能不如预量化(pre-quantized)模型稳定. 此外,MoE 推理还有额外的路由计算和潜在的 all-to-all 通信开销,这些在 benchmark 中通常不被计入.</p>
<h3 id="7-2-tlxsd-trade-off">7.2 推理效率的 trade-off</h3>
<p>MoE 推理的效率优势与开销并存:</p>
<p><strong>优势</strong>:</p>
<ul>
<li>单次前向计算量与激活参数量(17B)成正比</li>
<li>KV Cache 占用与激活参数量成正比</li>
<li>以 Dense 17B 的成本获得远超 17B Dense 的能力</li>
</ul>
<p><strong>开销</strong>:</p>
<ul>
<li>路由计算:需要为每个 token 计算专家选择概率</li>
<li>通信开销:分布式部署时,不同专家可能位于不同 GPU,需要 all-to-all 通信</li>
<li>负载不均衡:某些专家被过度使用可能导致等待时间增加</li>
<li>内存带宽:虽然计算量减少,但加载 109B/400B 总参数需要更高的内存带宽</li>
</ul>
<hr>
<h2 id="8-jxyzy">8. 局限与争议</h2>
<h3 id="8-1-wzsjsbg">8.1 无正式技术报告</h3>
<p>与 Llama 1~3 均发布详细技术报告不同,Llama 4 截至发布时未提供正式论文. arXiv 上出现的第三方总结 &quot;The Llama 4 Herd&quot;(arXiv:2601.11659)后来被撤回. 这让研究社区难以深入理解:</p>
<ul>
<li>训练数据的具体构成和配比</li>
<li>数据清洗和去污染策略</li>
<li>详细的超参数设置和调优过程</li>
<li>消融实验结果</li>
</ul>
<p>从开放科学的角度看,这是一个退步. Meta 作为开源大模型的领导者,其技术透明度直接影响社区对模型的信任度和复现能力.</p>
<h3 id="8-2-benchmark-zy">8.2 Benchmark 争议</h3>
<p>发布初期有用户反映 Llama 4 在实际任务中的表现与 benchmark 分数存在差距. Meta GenAI 负责人 Ahmad Al-Dahle 回应称这是由于「实现需要稳定化」. 这一争议提醒我们:</p>
<ul>
<li>Benchmark 分数不等于实际用户体验</li>
<li>不同实现框架(vLLM、TensorRT-LLM、原生 PyTorch)可能对同一模型产生不同结果</li>
<li>量化策略(Int4 vs FP8 vs BF16)对性能的影响在不同任务上差异显著</li>
</ul>
<h3 id="8-3-behemoth-d-hb-zy">8.3 Behemoth 的「画饼」质疑</h3>
<p>作为 2T 参数(288B 激活/16 experts)的「教师模型」,Behemoth 目前仍在训练中,未公开发布. 如果 Behemoth 最终不发布,那么:</p>
<ul>
<li>以 Behemoth 为蒸馏目标的训练策略将无法被社区复现</li>
<li>Maverick 和 Scout 可能受益于 Behemoth 的知识蒸馏,这部分优势无法被独立验证</li>
<li>社区对 Meta 开源承诺的信任可能受损</li>
</ul>
<h3 id="8-4-10m-sxwdsjkyx">8.4 10M 上下文的实际可用性</h3>
<p>Scout 的 10M 上下文窗口在技术上令人印象深刻,但实际部署面临挑战:</p>
<ul>
<li>KV Cache 在 BF16 下需要数百 GB 显存,即使 Int4 量化也需要数十 GB</li>
<li>10M token 的注意力计算在单次前向传播中耗时极长</li>
<li>真实的「大海捞针」式长上下文推理能力尚未被独立第三方充分验证</li>
<li>注意力稀释问题:在 10M 尺度上,softmax 后的注意力权重可能极度稀疏,跨距离关联能力可能下降</li>
</ul>
<hr>
<h2 id="9-mxpxdw">9. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Llama 3(Dense 架构基础、SwiGLU、RMSNorm、RoPE、GQA)</li>
<li><strong>核心创新</strong>:<ul>
<li>交替 Dense/MoE 层设计(每隔一层 MoE, Top-1 路由 + 共享专家)</li>
<li>原生多模态 Early Fusion(统一主干处理视觉和文本 token)</li>
<li>10M 上下文窗口(Scaled RoPE + NOPE + 注意力温度调节)</li>
<li>产品级模型分化(Scout 专注长上下文,Maverick 专注推理能力)</li>
</ul>
</li>
<li><strong>同期可比模型</strong>:<ul>
<li>DeepSeek-V3(671B MoE, MLA, MTP)</li>
<li>Qwen3(多尺寸 Dense+MoE, Agent 能力)</li>
<li>Gemma 3(Google 轻量化多模态)</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>验证了 MoE 在开源大模型中的主流地位</li>
<li>Early Fusion 多模态设计为后续模型提供参考</li>
<li>10M 上下文推动了长上下文技术的工程化竞争</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档基于 Llama 4 官方 Model Card、GitHub 开源代码(meta-llama/llama-models)、Meta AI 博客及社区公开资料进行架构剖析. 由于 Llama 4 尚未发布正式技术报告,部分细节基于源码反推,可能存在理解偏差.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsm-llama-4-xzl-moe-ysdmt","text":"1. 设计动机: 为什么 Llama 4 选择了 MoE + 原生多模态"},{"level":2,"id":"2-jgyj-c-llama-3-dense-d-llama-4-moe","text":"2. 架构演进: 从 Llama 3 Dense 到 Llama 4 MoE"},{"level":3,"id":"2-1-csgmyjsxsdzxph","text":"2.1 参数规模与计算效率的重新平衡"},{"level":3,"id":"2-2-jt-dense-moe-c-yzwsdxshcl","text":"2.2 交替 Dense/MoE 层: 一种务实的稀疏化策略"},{"level":3,"id":"2-3-gxzjdsjlj","text":"2.3 共享专家的设计逻辑"},{"level":2,"id":"3-csxwgc-c-128k-d-10m-djslj","text":"3. 长上下文工程: 从 128K 到 10M 的技术路径"},{"level":3,"id":"3-1-scaled-rope-pswtdphcl","text":"3.1 Scaled RoPE: 频率外推的平滑策略"},{"level":3,"id":"3-2-nope-c-qcwzbmdzylc","text":"3.2 NOPE 层: 去除位置编码的注意力层"},{"level":3,"id":"3-3-zylwdtj-fz-softmax-gdrh","text":"3.3 注意力温度调节: 防止 Softmax 过度锐化"},{"level":3,"id":"3-4-djdsxwkzxl","text":"3.4 多阶段上下文扩展训练"},{"level":2,"id":"4-ysdmt-early-fusion-djghy","text":"4. 原生多模态: Early Fusion 的架构含义"},{"level":3,"id":"4-1-c-late-fusion-d-early-fusion-dfszy","text":"4.1 从 Late Fusion 到 Early Fusion 的范式转移"},{"level":3,"id":"4-2-tile-based-txbm","text":"4.2 Tile-based 图像编码"},{"level":3,"id":"4-3-early-fusion-dgcdj","text":"4.3 Early Fusion 的工程代价"},{"level":2,"id":"5-xlclygmfx","text":"5. 训练策略与规模分析"},{"level":3,"id":"5-1-sjgmymxgmdfdcsj","text":"5.1 数据规模与模型规模的非对称设计"},{"level":3,"id":"5-2-xlnhyjcss","text":"5.2 训练能耗与基础设施"},{"level":3,"id":"5-3-hxld-qlj-zx","text":"5.3 后训练的「轻量级」转向"},{"level":2,"id":"6-xndw-17b-jhrhny-405b-dense","text":"6. 性能定位: 17B 激活如何碾压 405B Dense"},{"level":3,"id":"6-1-hxtljzdb","text":"6.1 核心推理基准对比"},{"level":3,"id":"6-2-dmtnldw","text":"6.2 多模态能力定位"},{"level":3,"id":"6-3-csxwnl-mtob-jz","text":"6.3 长上下文能力:MTOB 基准"},{"level":2,"id":"7-bsclylhfa","text":"7. 部署策略与量化方案"},{"level":3,"id":"7-1-lhfayyjxq","text":"7.1 量化方案与硬件需求"},{"level":3,"id":"7-2-tlxsd-trade-off","text":"7.2 推理效率的 trade-off"},{"level":2,"id":"8-jxyzy","text":"8. 局限与争议"},{"level":3,"id":"8-1-wzsjsbg","text":"8.1 无正式技术报告"},{"level":3,"id":"8-2-benchmark-zy","text":"8.2 Benchmark 争议"},{"level":3,"id":"8-3-behemoth-d-hb-zy","text":"8.3 Behemoth 的「画饼」质疑"},{"level":3,"id":"8-4-10m-sxwdsjkyx","text":"8.4 10M 上下文的实际可用性"},{"level":2,"id":"9-mxpxdw","text":"9. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/04-llama-4/05-llama-4-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/04-llama-4/05-llama-4-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama 4 架构迭代与原生多模态设计剖析</h1>
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
