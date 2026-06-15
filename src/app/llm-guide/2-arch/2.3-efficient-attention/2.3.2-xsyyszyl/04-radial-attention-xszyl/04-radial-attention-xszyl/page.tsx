"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Radial Attention：O(n log n) 复杂度的稀疏注意力</h1>
<blockquote>
<p>本文介绍 MIT HAN Lab 提出的 Radial Attention（<a href="https://arxiv.org/abs/2506.19852">arXiv:2506.19852</a>），通过时空能量衰减现象设计径向稀疏掩码，将视频 DiT 的注意力复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降低到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span>。<br>系列索引：<a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/2.3.2-xsyyszyl">2.3.2 稀疏与压缩注意力</a> · <a href="#broken-link">2.3 进度</a></p>
</blockquote>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-01-teaser-hunyuan-speedup.jpg" alt="Radial Attention 在 HunyuanVideo 上的加速与画质（论文 Figure 1）"></p>
<blockquote>
<p>图 1: 默认长度 1.9× 推理加速、4× 外推长度下 4.4× 降训练成本与 3.7× 推理加速（论文 Figure 1）。</p>
</blockquote>
<p><strong>图 1 解析</strong></p>
<ul>
<li><strong>左/上</strong>：Dense vs Radial 同 prompt 视频帧 — 视觉质量相当，延迟显著下降。</li>
<li><strong>117 帧默认长度</strong>：HunyuanVideo 上约 <strong>1.9×</strong> 端到端加速（PSNR 仍 ~27）。</li>
<li><strong>509 帧 4× 外推</strong>：Radial + LoRA 的 Vision Reward <strong>不低于</strong> Dense+LoRA，且 GPU 小时与延迟双降。</li>
<li><strong>赛道</strong>：视频扩散 <strong>3D Full Attention</strong>，非文本 LLM；与 MoBA/NSA 方法论同属「稀疏掩码」但目标模态不同。</li>
<li><strong>工程</strong>：静态掩码 + 轻量 LoRA 即可外推长度，无需全量重训。</li>
</ul>
<hr>
<h2 id="1-bj-sp-dit-dzylpj">1. 背景：视频 DiT 的注意力瓶颈</h2>
<h3 id="1-1-3d-full-attention-ddj">1.1 3D Full Attention 的代价</h3>
<p>视频扩散模型通过 3D Full Attention 捕捉时空关联性。以 HunyuanVideo 为例：</p>
<ul>
<li>帧时长 33 × 宽高 3600 + 文本 226 ≈ <strong>~120k 序列长度</strong></li>
<li>Attention 占端到端耗时的 <strong>82%</strong></li>
</ul>
<h3 id="1-2-xszyldlzlx">1.2 稀疏注意力的两种路线</h3>
<ul>
<li><strong>静态方法</strong>（如 STA）：预定义稀疏模式，表达能力有限</li>
<li><strong>动态方法</strong>（如 SVG）：按 head 在线 profiling 选空间/时间掩码，推理可加速但 <strong>长视频训练易误分类、难外推</strong></li>
</ul>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-03-svg-vs-radial-pipeline.jpg" alt="SVG 动态 profiling vs Radial 静态统一掩码（论文 Figure 3）"></p>
<blockquote>
<p>图 2: SVG 每 head 二选一空间/时间稀疏；Radial 用单一静态 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n\\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 掩码统一二者（论文 Figure 3）。</p>
</blockquote>
<p><strong>图 2 解析</strong></p>
<ul>
<li><strong>SVG (a)</strong>：推理时 profiling → 空间 <strong>或</strong> 时间 attention，无法覆盖训练分布外的更长视频。</li>
<li><strong>Radial (b)</strong>：静态径向掩码同时编码时空衰减，<strong>可 LoRA 微调外推</strong>。</li>
<li><strong>复杂度</strong>：二者均可做到次二次方，但 Radial 的掩码由物理衰减模型导出，非纯启发式窗口。</li>
<li><strong>与 2.3.2 其他篇关系</strong>：MoBA/NSA 是 <strong>LLM token 路由</strong>；Radial 是 <strong>视频 DiT 帧-空间块掩码</strong>。</li>
<li><strong>实现</strong>：均可用 128×128 块稀疏 + FlashAttention 类内核。</li>
</ul>
<hr>
<h2 id="2-hxdc-sknlsj">2. 核心洞察：时空能量衰减</h2>
<h3 id="2-1-xxgc">2.1 现象观察</h3>
<p>在视频扩散模型的 Attention Map 中，注意力分数随 token 之间<strong>空间和时间距离</strong>增大而减弱，作者称为 <strong>Spatiotemporal Energy Decay（时空能量衰减）</strong>。</p>
<h3 id="2-2-lzzylmt">2.2 两种注意力模态</h3>
<table>
<thead>
<tr>
<th align="left">模态</th>
<th align="left">特征</th>
<th align="left">衰减特性</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>空间注意力</strong></td>
<td align="left">主要关注同帧或相邻帧附近 token</td>
<td align="left">高时间衰减、低空间衰减</td>
</tr>
<tr>
<td align="left"><strong>时间注意力</strong></td>
<td align="left">主要关注跨帧同空间位置</td>
<td align="left">低时间衰减、高空间衰减</td>
</tr>
</tbody></table>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-04-spatiotemporal-energy-decay.jpg" alt="HunyuanVideo 上空间/时间 attention map 与衰减曲线（论文 Figure 4）"></p>
<blockquote>
<p>图 3: 空间 head 随时间距离快速衰减；时间 head 随空间距离衰减更明显（论文 Figure 4）。</p>
</blockquote>
<p><strong>图 3 解析</strong></p>
<ul>
<li><strong>(a)</strong>：从 HunyuanVideo 抽样的 post-softmax map — 左偏空间局部、右偏时间对齐。</li>
<li><strong>(b1)</strong>：同空间位置、时间距增大 → 分数指数下降。</li>
<li><strong>(b2)</strong>：同帧内、空间距增大 → 同样衰减，曲线可拟合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup><mo>&gt;</mo><mn>0.98</mn></mrow><annotation encoding="application/x-tex">R^2&gt;0.98</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8532em;vertical-align:-0.0391em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.98</span></span></span></span>。</li>
<li><strong>设计含义</strong>：应用 <strong>统一径向掩码</strong>，而非 SVG 式硬拆 head 类型。</li>
<li><strong>参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo separator="true">,</mo><mi>β</mi></mrow><annotation encoding="application/x-tex">\\alpha,\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span></strong>：分别控制时间/空间衰减率，高 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 低 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 偏空间局部。</li>
</ul>
<h3 id="2-3-zssjmx">2.3 指数衰减模型</h3>
<p>对于第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>i</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">i_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8095em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">i</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 帧、空间位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>k</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">k_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的 query，注意力分数满足：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>p</mi><mo stretchy="false">(</mo><mi>i</mi><mo separator="true">,</mo><mi>k</mi><mo stretchy="false">)</mo><mo>∝</mo><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mo>−</mo><mi>α</mi><mi mathvariant="normal">∣</mi><mi>i</mi><mo>−</mo><msub><mi>i</mi><mn>0</mn></msub><mi mathvariant="normal">∣</mi><mo>−</mo><mi>β</mi><mi mathvariant="normal">∣</mi><mi>k</mi><mo>−</mo><msub><mi>k</mi><mn>0</mn></msub><mi mathvariant="normal">∣</mi><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">p(i, k) \\propto \\exp(-\\alpha |i - i_0| - \\beta |k - k_0|) \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mopen">(</span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∝</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord">−</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mord">∣</span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">i</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><hr>
<h2 id="3-radial-attention-sj">3. Radial Attention 设计</h2>
<h3 id="3-1-sjwddmdsj">3.1 时间维度的密度衰减</h3>
<ul>
<li>帧 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow><annotation encoding="application/x-tex">i,j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span></span></span></span> 间计算密度：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>1</mn><mi mathvariant="normal">/</mi><mn>2</mn><msup><mo stretchy="false">)</mo><mrow><mo stretchy="false">⌊</mo><msub><mrow><mi>log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mo stretchy="false">(</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi mathvariant="normal">∣</mi><mi>i</mi><mo>−</mo><mi>j</mi><mi mathvariant="normal">∣</mi><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo stretchy="false">⌋</mo></mrow></msup></mrow><annotation encoding="application/x-tex">(1/2)^{\\lfloor \\log_2(\\max(|i-j|, 1)) \\rfloor}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.138em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">1/2</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">⌊</span><span class="mop mtight"><span class="mop mtight"><span class="mtight">l</span><span class="mtight">o</span><span class="mtight" style="margin-right:0.0139em;">g</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span style="top:-2.2341em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2659em;"><span></span></span></span></span></span></span><span class="mopen mtight">(</span><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span><span class="mopen mtight">(</span><span class="mord mtight">∣</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mord mtight">∣</span><span class="mpunct mtight">,</span><span class="mord mtight">1</span><span class="mclose mtight">))⌋</span></span></span></span></span></span></span></span></span></span></span></span></li>
<li>中心带（band 0）100% 密度；向外每带密度减半、带宽倍增（band ±1 除外）</li>
<li>每带总计算量近似 <strong>常数</strong> → 总长 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 时总和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n\\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></li>
</ul>
<h3 id="3-2-kjwddmdsj">3.2 空间维度的密度衰减</h3>
<ul>
<li>帧 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow><annotation encoding="application/x-tex">i,j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span></span></span></span> 块内对角线宽度：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">⌊</mo><mi>s</mi><mi mathvariant="normal">/</mi><msup><mn>2</mn><mrow><mo stretchy="false">⌊</mo><msub><mrow><mi>log</mi><mo>⁡</mo></mrow><mn>2</mn></msub><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi mathvariant="normal">∣</mi><mi>i</mi><mo>−</mo><mi>j</mi><mi mathvariant="normal">∣</mi><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">)</mo><mo stretchy="false">⌋</mo></mrow></msup><mo stretchy="false">⌋</mo></mrow><annotation encoding="application/x-tex">\\lfloor s / 2^{\\lfloor \\log_2 \\max(|i-j|, 1) \\rfloor} \\rfloor</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.138em;vertical-align:-0.25em;"></span><span class="mopen">⌊</span><span class="mord mathnormal">s</span><span class="mord">/</span><span class="mord"><span class="mord">2</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">⌊</span><span class="mop mtight"><span class="mop mtight"><span class="mtight">l</span><span class="mtight">o</span><span class="mtight" style="margin-right:0.0139em;">g</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span style="top:-2.2341em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2659em;"><span></span></span></span></span></span></span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span><span class="mopen mtight">(</span><span class="mord mtight">∣</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mord mtight">∣</span><span class="mpunct mtight">,</span><span class="mord mtight">1</span><span class="mclose mtight">)⌋</span></span></span></span></span></span></span></span></span><span class="mclose">⌋</span></span></span></span></li>
<li>宽度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>&lt;</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">&lt;1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 时降低对角线频率（模运算抽稀），保持块内 FLOPs 下界</li>
</ul>
<h3 id="3-3-ymy-attention-sink">3.3 掩码与 Attention Sink</h3>
<p>4D 掩码 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>M</mi><mo stretchy="true">~</mo></mover><mo>∈</mo><mo stretchy="false">{</mo><mo>−</mo><mi mathvariant="normal">∞</mi><mo separator="true">,</mo><mn>0</mn><msup><mo stretchy="false">}</mo><mrow><mi>f</mi><mo>×</mo><mi>f</mi><mo>×</mo><mi>s</mi><mo>×</mo><mi>s</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\widetilde{M} \\in \\{-\\infty, 0\\}^{f \\times f \\times s \\times s}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9824em;vertical-align:-0.0391em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9433em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span><span class="svg-align" style="width:calc(100% - 0.1667em);margin-left:0.1667em;top:-3.6833em;"><span class="pstrut" style="height:3em;"></span><span style="height:0.26em;"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="0.26em" viewBox="0 0 600 260" preserveAspectRatio="none"><path d="M200 55.538c-77 0-168 73.953-177 73.953-3 0-7
-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0
 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0
 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128
-68.267.847-113-73.952-191-73.952z"/></svg></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0991em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord">−</span><span class="mord">∞</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">s</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">s</span></span></span></span></span></span></span></span></span></span></span></span>，展平为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>M</mi><mrow><mi>i</mi><mi>s</mi><mo>+</mo><mi>k</mi><mo separator="true">,</mo><mtext> </mtext><mi>j</mi><mi>s</mi><mo>+</mo><mi>l</mi></mrow></msub><mo>=</mo><msub><mover accent="true"><mi>M</mi><mo stretchy="true">~</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi><mo separator="true">,</mo><mi>k</mi><mo separator="true">,</mo><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">M_{is+k,\\,js+l}=\\widetilde{M}_{i,j,k,l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">s</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mpunct mtight">,</span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mord mathnormal mtight">s</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2294em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9433em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span></span><span class="svg-align" style="width:calc(100% - 0.1667em);margin-left:0.1667em;top:-3.6833em;"><span class="pstrut" style="height:3em;"></span><span style="height:0.26em;"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="0.26em" viewBox="0 0 600 260" preserveAspectRatio="none"><path d="M200 55.538c-77 0-168 73.953-177 73.953-3 0-7
-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0
 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0
 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128
-68.267.847-113-73.952-191-73.952z"/></svg></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>。</p>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-05-radial-mask-bands.jpg" alt="径向带、掩码与 HunyuanVideo 实例（论文 Figure 5）"></p>
<blockquote>
<p>图 4: 时间带密度减半 + 远帧空间对角线收窄；首帧 attention sink（论文 Figure 5）。</p>
</blockquote>
<p><strong>图 4 解析</strong></p>
<ul>
<li><strong>(a)</strong>：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo>=</mo><mn>12</mn></mrow><annotation encoding="application/x-tex">f=12</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">12</span></span></span></span> 示意 — 主对角 band 0 全密度，外带宽度×2、密度÷2。</li>
<li><strong>(b)</strong>：与 (a) 对应的 0/−∞ 二值掩码；远帧块仅保留稀疏对角。</li>
<li><strong>(c)</strong>：253 帧 720p HunyuanVideo 真实掩码 — 含 <strong>首帧 sink</strong>（全体 attend 帧 0）。</li>
<li><strong>与 SVG</strong>：中心带已含密空间交互；远帧不再浪费算力在低相关 token。</li>
<li><strong>块大小 128×128</strong>：与 FlashAttention 分块策略对齐。</li>
</ul>
<h3 id="3-4-attention-sink">3.4 Attention Sink</h3>
<p>每个 token <strong>关注第一帧</strong>（与 StreamingLLM / SVG 的 sink 同类）；3D Causal VAE 常单独处理首帧。</p>
<hr>
<h2 id="4-fzdywc">4. 复杂度与误差</h2>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-02-complexity-9x-speedup.jpg" alt="长视频 attention 计算量与加速（论文 Figure 2）"></p>
<blockquote>
<p>图 5: 509 帧 720p HunyuanVideo 上 attention 计算约 <strong>9×</strong> 减少、3.7× 加速（论文 Figure 2）。</p>
</blockquote>
<p><strong>图 5 解析</strong></p>
<ul>
<li>横轴序列长度/帧数增加时，Dense <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 陡升，Radial 近 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n\\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 斜率。</li>
<li><strong>9×</strong>：论文在 4× 长度设定下测得的 attention FLOPs 比（非端到端唯一指标）。</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="normal">ℓ</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\ell_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord">ℓ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 误差界：随 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo separator="true">,</mo><mi>β</mi></mrow><annotation encoding="application/x-tex">\\alpha,\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 增大，掩码与全注意力分数差异 **指数缩小**。</li>
<li>相对 SVG：统一衰减 → 更小理论误差（论文 §4.2）。</li>
<li>实现：块稀疏 + FA2（论文用 FA2；换 FA3 为正交优化）。</li>
</ul>
<hr>
<h2 id="5-csp-lora-ysy">5. 长视频 LoRA 与实验</h2>
<h3 id="5-1-djysx">5.1 动机与实现</h3>
<ul>
<li>预训练短视频模型 + Radial 掩码 → 权重大部分可保留</li>
<li><strong>LoRA rank 128</strong> 作用于 q/k/v/o；每扩展长度采样 2k 高质量视频</li>
<li>HunyuanVideo 约 16–21 GPU·hour（8×H100）</li>
</ul>
<h3 id="5-2-dljg-lw-table-1-2-zy">5.2 定量结果（论文 Table 1–2 摘要）</h3>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">Dense</th>
<th align="left">Radial</th>
</tr>
</thead>
<tbody><tr>
<td align="left">视觉质量 (Vision Reward)</td>
<td align="left">基准</td>
<td align="left"><strong>相当或略优</strong></td>
</tr>
<tr>
<td align="left">PSNR/SSIM/LPIPS</td>
<td align="left">基准</td>
<td align="left"><strong>优于 STA/PA，≈ SVG</strong></td>
</tr>
<tr>
<td align="left">HunyuanVideo 端到端</td>
<td align="left">1×</td>
<td align="left"><strong>~1.8×</strong></td>
</tr>
<tr>
<td align="left">Wan2.1 端到端</td>
<td align="left">1×</td>
<td align="left"><strong>~1.9×</strong></td>
</tr>
</tbody></table>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-06-wan21-video-quality.jpg" alt="Wan2.1 默认长度生成对比（论文 Figure 6）"></p>
<blockquote>
<p>图 6: Wan2.1-14B 上 Radial 与原版画质对齐（论文 Figure 6）。</p>
</blockquote>
<p><strong>图 6 解析</strong></p>
<ul>
<li>Training-free 设定：不改权重，只换稀疏掩码 + 系统优化（与 SVG 同栈）。</li>
<li>相似度指标上优于 STA；STA 虽更快但画质掉点明显。</li>
<li>PA 同为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n\\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 但忽略时空局部性 → 实践不如 Radial。</li>
</ul>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-07-hunyuan-4x-extension.jpg" alt="HunyuanVideo 4× 长度外推视觉对比（论文 Figure 7）"></p>
<blockquote>
<p>图 7: 509 帧外推 — Radial+LoRA Vision Reward <strong>≥</strong> Dense+LoRA（论文 Figure 7）。</p>
</blockquote>
<p><strong>图 7 解析</strong></p>
<ul>
<li>4× 长度下 Dense 无微调明显退化；RIFLEx 外推有限。</li>
<li>Radial+LoRA：<strong>0.134 vs 0.133</strong>（Vision Reward），且 <strong>3.7×</strong> 推理、<strong>4.4×</strong> 训练成本下降。</li>
<li>说明静态掩码 + 短 LoRA 即可 <strong>外推长度</strong> 而不毁分布。</li>
</ul>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl/images/fig-radial-08-lora-effectiveness-decay-fit.jpg" alt="LoRA 有效性 &amp; 衰减曲线拟合（论文 Figure 8）"></p>
<blockquote>
<p>图 8: 长序列上 Radial+LoRA 可匹配全微调；<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mo>−</mo><mi>a</mi><mi>x</mi><mo>+</mo><mi>b</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\exp(-ax+b)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord">−</span><span class="mord mathnormal">a</span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">b</span><span class="mclose">)</span></span></span></span> 拟合衰减 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup><mo>&gt;</mo><mn>0.985</mn></mrow><annotation encoding="application/x-tex">R^2&gt;0.985</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8532em;vertical-align:-0.0391em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.985</span></span></span></span>（论文 Figure 8）。</p>
</blockquote>
<p><strong>图 8 解析</strong></p>
<ul>
<li><strong>(a)</strong>：帧数增加时 Radial+LoRA 的 Vision Reward 不低于 Dense 全量微调。</li>
<li><strong>(b)</strong>：实证曲线与式 (1) 指数模型一致 → 掩码设计有数据支撑而非纯画图。</li>
<li>可与 <strong>风格 LoRA</strong> 叠加做 4× 长度风格化（论文 §5.3）。</li>
<li>代码：<a href="https://github.com/mit-han-lab/radial-attention">mit-han-lab/radial-attention</a>。</li>
</ul>
<hr>
<h2 id="6-y-svg-sta-db">6. 与 SVG / STA 对比</h2>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">Radial</th>
<th align="left">SVG</th>
<th align="left">STA</th>
</tr>
</thead>
<tbody><tr>
<td align="left">复杂度</td>
<td align="left"><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></strong></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td align="left">时间衰减</td>
<td align="left">✅ 指数</td>
<td align="left">❌</td>
<td align="left">❌ 固定窗</td>
</tr>
<tr>
<td align="left">空间衰减</td>
<td align="left">✅ 对角收窄</td>
<td align="left">✅ 固定模式</td>
<td align="left">❌</td>
</tr>
<tr>
<td align="left">训练/外推</td>
<td align="left">✅ 静态掩码 + LoRA</td>
<td align="left">推理 profiling</td>
<td align="left">❌</td>
</tr>
<tr>
<td align="left">误差</td>
<td align="left"><strong>较小</strong></td>
<td align="left">中等</td>
<td align="left">较大</td>
</tr>
</tbody></table>
<p>Radial 将 <strong>能量衰减</strong> 转为 <strong>计算密度衰减</strong>，在质量与加速之间取得论文验证的平衡。</p>
<hr>
<h2 id="7-whz-llm-qjstd">7. 为何在 LLM 圈较少听到？</h2>
<p>面向 <strong>视频 DiT（HunyuanVideo / Wan2.1 / Mochi）</strong>，不是 Llama 长文本主线；2.3.2 收录是为对比 <strong>稀疏掩码设计空间</strong>（静态径向 vs 动态 SVG vs 块路由 MoBA）。</p>
<hr>
<h2 id="8-ckwx">8. 参考文献</h2>
<ul>
<li>Li, X., et al. (2025). Radial Attention: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>log</mi><mo>⁡</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{O}(n\\log n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathcal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> Sparse Attention with Energy Decay for Long Video Generation. <em>arXiv:2506.19852</em>.</li>
<li>代码：<a href="https://github.com/mit-han-lab/radial-attention">https://github.com/mit-han-lab/radial-attention</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-bj-sp-dit-dzylpj","text":"1. 背景：视频 DiT 的注意力瓶颈"},{"level":3,"id":"1-1-3d-full-attention-ddj","text":"1.1 3D Full Attention 的代价"},{"level":3,"id":"1-2-xszyldlzlx","text":"1.2 稀疏注意力的两种路线"},{"level":2,"id":"2-hxdc-sknlsj","text":"2. 核心洞察：时空能量衰减"},{"level":3,"id":"2-1-xxgc","text":"2.1 现象观察"},{"level":3,"id":"2-2-lzzylmt","text":"2.2 两种注意力模态"},{"level":3,"id":"2-3-zssjmx","text":"2.3 指数衰减模型"},{"level":2,"id":"3-radial-attention-sj","text":"3. Radial Attention 设计"},{"level":3,"id":"3-1-sjwddmdsj","text":"3.1 时间维度的密度衰减"},{"level":3,"id":"3-2-kjwddmdsj","text":"3.2 空间维度的密度衰减"},{"level":3,"id":"3-3-ymy-attention-sink","text":"3.3 掩码与 Attention Sink"},{"level":3,"id":"3-4-attention-sink","text":"3.4 Attention Sink"},{"level":2,"id":"4-fzdywc","text":"4. 复杂度与误差"},{"level":2,"id":"5-csp-lora-ysy","text":"5. 长视频 LoRA 与实验"},{"level":3,"id":"5-1-djysx","text":"5.1 动机与实现"},{"level":3,"id":"5-2-dljg-lw-table-1-2-zy","text":"5.2 定量结果（论文 Table 1–2 摘要）"},{"level":2,"id":"6-y-svg-sta-db","text":"6. 与 SVG / STA 对比"},{"level":2,"id":"7-whz-llm-qjstd","text":"7. 为何在 LLM 圈较少听到？"},{"level":2,"id":"8-ckwx","text":"8. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/04-radial-attention-xszyl/04-radial-attention-xszyl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Radial Attention：O(n log n) 复杂度的稀疏注意力</h1>
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
