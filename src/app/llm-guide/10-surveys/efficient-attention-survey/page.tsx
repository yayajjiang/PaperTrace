"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>高效注意力方法综述: 从静态稀疏到线性注意力</h1>
<blockquote>
<p>本文系统梳理当前高效注意力机制的技术谱系,将主流方法归纳为四大范式——静态稀疏注意力、动态稀疏注意力、Compact 注意力与线性注意力,并对比各类方法的计算复杂度、训练要求和适用场景. 适合需要选型注意力优化的工程师和研究者参考. </p>
</blockquote>
<hr>
<h2 id="1-jspxzl">1. 技术谱系总览</h2>
<p>标准自注意力的计算复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 为序列长度,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi></mrow><annotation encoding="application/x-tex">d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 为隐藏维度. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 超过 16K 时,二次复杂度成为推理和训练的绝对瓶颈. 当前工业界和学术界的高效注意力研究可归纳为四大类: </p>
<table>
<thead>
<tr>
<th align="left">范式</th>
<th align="left">核心思想</th>
<th align="left">代表方法</th>
<th align="left">复杂度</th>
<th align="left">是否需要训练</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>静态稀疏注意力</strong></td>
<td align="left">预设固定稀疏模式,只计算模式内 token 的注意力</td>
<td align="left">Sliding Window, StreamingLLM, BigBird</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot w \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span></td>
<td align="left">否</td>
</tr>
<tr>
<td align="left"><strong>动态稀疏注意力</strong></td>
<td align="left">运行时根据 token 重要性动态筛选参与计算的 KV</td>
<td align="left">H2O, Minference, Sparge Attention, NSA, DSA</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>D</mi><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot D \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi><mo>≪</mo><mi>n</mi></mrow><annotation encoding="application/x-tex">D \\ll n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span></td>
<td align="left">部分需要</td>
</tr>
<tr>
<td align="left"><strong>Compact 注意力</strong></td>
<td align="left">压缩 KV 的维度或数量,减少存储和计算</td>
<td align="left">GQA, MQA, MLA, KVQuant</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d&#x27; \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7519em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>d</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>&lt;</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">d&#x27; &lt; d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.791em;vertical-align:-0.0391em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span></td>
<td align="left">是(架构级)</td>
</tr>
<tr>
<td align="left"><strong>线性注意力</strong></td>
<td align="left">改写注意力为核函数内积,降低复杂度至线性</td>
<td align="left">Performer, Linformer, Linear Transformer, Mamba, DeltaNet</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td align="left">是</td>
</tr>
</tbody></table>
<hr>
<h2 id="2-jtxszyl-pattern-based-sparse-attention">2. 静态稀疏注意力(Pattern-Based Sparse Attention)</h2>
<h3 id="2-1-hxjz">2.1 核心机制</h3>
<p>静态稀疏注意力采用<strong>预定义的稀疏掩码</strong>(sparse mask),在注意力计算前即确定哪些 token 对参与计算. 掩码中的值为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>−</mo><mi mathvariant="normal">∞</mi></mrow><annotation encoding="application/x-tex">-\\infty</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord">−</span><span class="mord">∞</span></span></span></span>(或一个极大负数)的位置在 softmax 后注意力权重趋近于零,等价于跳过该位置的计算. </p>
<p>常见静态模式包括: </p>
<ul>
<li><strong>Sliding Window</strong>: 每个 token 只关注邻近的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi></mrow><annotation encoding="application/x-tex">w</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span></span></span></span> 个 token,复杂度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo>⋅</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot w \\cdot d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>. 实现简单,但全局信息依赖纯堆叠层数传递. </li>
<li><strong>StreamingLLM</strong>: 在 Sliding Window 基础上强制保留序列初始的 1-4 个 token(Attention Sink),解决窗口滑动过初始 token 后的分布漂移问题. </li>
<li><strong>BigBird</strong>: 组合局部窗口 + 全局 token + 随机采样,理论上可近似全注意力的表达能力. </li>
<li><strong>Longformer</strong>: 滑动窗口 + 扩张窗口 + 全局注意力,针对长文档任务设计.</li>
</ul>
<h3 id="2-2-ylfx">2.2 优劣分析</h3>
<p><strong>优点</strong>: </p>
<ul>
<li>实现简单,无额外训练开销</li>
<li>与标准注意力兼容,可即插即用</li>
<li>推理速度提升明确(窗口大小固定,KV Cache 有界)</li>
</ul>
<p><strong>缺点</strong>: </p>
<ul>
<li>稀疏模式是手工预设的,无法适应输入内容的变化</li>
<li>效果一般,在需要全局精细依赖的任务上损失明显</li>
<li>长程信息传递依赖多层堆叠,深层梯度信号弱</li>
</ul>
<hr>
<h2 id="3-dtxszyl-dynamic-sparse-attention">3. 动态稀疏注意力(Dynamic Sparse Attention)</h2>
<h3 id="3-1-hxsx">3.1 核心思想</h3>
<p>动态稀疏注意力将注意力计算分为两步: </p>
<ol>
<li><strong>动态生成稀疏掩码</strong>: 根据某种重要性指标筛选参与计算的 KV token</li>
<li><strong>叠加稀疏掩码与因果掩码</strong>: 在缩减后的 KV 集合上执行标准注意力</li>
</ol>
<p>基本目标是将 KV 矩阵的序列维度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi><mo>≪</mo><mi>n</mi></mrow><annotation encoding="application/x-tex">D \\ll n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span>),从而将复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>D</mi><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n D d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>. </p>
<h3 id="3-2-training-free-dtxs">3.2 Training-Free 动态稀疏</h3>
<p><strong>基于 QK 相似度的直接筛选</strong>: </p>
<ul>
<li><strong>Top-K Attention</strong>: 直接通过 QK 点积计算注意力分数,保留每个 query 对应的 Top-K 个 key. 实现简单,但 Top-K 选择本身需要计算完整的 QK 矩阵,节省的是后续 softmax 和 V 的加权求和. </li>
<li><strong>H2O(Heavy-Hitter Oracle)</strong> : 计算单个 token 对其他 token 的累积注意力分数,动态保留&quot;重击者&quot;token 的 KV Cache. 无需训练,基于历史注意力模式的统计筛选. </li>
<li><strong>Sparge Attention</strong>: 两阶段稀疏化. 第一阶段通过 QK 相似度压缩 QK 矩阵; 第二阶段筛选 softmax 后近似为零的块,避免无效计算.</li>
</ul>
<p><strong>基于变换域的加速筛选</strong>: </p>
<ul>
<li><strong>HashAttention</strong>: 先用局部敏感哈希(LSH)对 Q/K 签名,再根据汉明距离筛选最相近的 QK 对计算注意力. 用 Hash + Hamming 距离替代昂贵的 QK 矩阵乘法. </li>
<li><strong>降维投影</strong>: 将 QK 投影到低维空间后计算相似度,降低 Top-K 之前的计算开销.</li>
</ul>
<h3 id="3-3-training-aware-dtxs">3.3 Training-Aware 动态稀疏</h3>
<ul>
<li><strong>Native Sparse Attention(NSA)</strong> : 通过可学习的压缩 token 将历史序列压缩为粗粒度表示,同时保留细粒度的近期 token. 压缩与选择过程端到端可训练. </li>
<li><strong>DeepSeek Sparse Attention(DSA)</strong> : 为每个 query token 动态计算与所有历史 token 的相关性分数,选择 Top-K 最相关的 token 进行注意力计算. 通过 Lightning Indexer 实现硬件协同优化. </li>
<li><strong>MoBA(Mixture of Block Attention)</strong> : 将序列分块,每块视为一个&quot;专家&quot;,通过路由网络动态选择参与的块. 块级稀疏与 MoE 的路由机制结合.</li>
</ul>
<h3 id="3-4-ylfx">3.4 优劣分析</h3>
<p><strong>优点</strong>: </p>
<ul>
<li>保留内容适应性,稀疏模式随输入动态变化</li>
<li>Training-free 方法可即插即用,兼容预训练模型</li>
<li>Training-aware 方法精度更高,端到端优化</li>
</ul>
<p><strong>缺点</strong>: </p>
<ul>
<li>Training-free 方法需要计算完整 QK 来筛选,实际节省的计算量有限</li>
<li>Training-aware 方法需要重新训练或微调,工程成本高</li>
<li>稀疏掩码的动态性可能与 CUDA Graph 等推理优化技术冲突</li>
</ul>
<hr>
<h2 id="4-compact-zyl-ys-kv-wdysl">4. Compact 注意力: 压缩 KV 维度与数量</h2>
<h3 id="4-1-hxsx">4.1 核心思想</h3>
<p>不减少参与计算的 token 数量,而是减少每个 token 的 KV 表示维度或共享 KV 表示,从而降低内存占用和计算量. </p>
<table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">压缩策略</th>
<th align="left">KV Cache 压缩比</th>
<th align="left">质量损失</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>MQA</strong></td>
<td align="left">所有头共享同一套 K/V</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mi>h</mi></mrow><annotation encoding="application/x-tex">1/h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord mathnormal">h</span></span></span></span></td>
<td align="left">中</td>
</tr>
<tr>
<td align="left"><strong>GQA</strong></td>
<td align="left">将头分组,组内共享 K/V</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mi>g</mi></mrow><annotation encoding="application/x-tex">1/g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mo>&lt;</mo><mi>h</mi></mrow><annotation encoding="application/x-tex">g &lt; h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span>)</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left"><strong>MLA</strong></td>
<td align="left">低秩 latent 向量联合编码 K/V</td>
<td align="left">~1/4(DeepSeek-V2)</td>
<td align="left">极低</td>
</tr>
<tr>
<td align="left"><strong>KVQuant</strong></td>
<td align="left">INT8/FP8 量化 KV Cache</td>
<td align="left">1/2 ~ 1/4</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left"><strong>Cross-layer Sharing</strong></td>
<td align="left">相邻层共享 KV Cache</td>
<td align="left">1/2 ~ 1/4</td>
<td align="left">低-中</td>
</tr>
</tbody></table>
<h3 id="4-2-gjqh">4.2 关键权衡</h3>
<p>Compact 注意力的核心权衡是<strong>信息容量 vs 存储效率</strong>. MLA 通过训练阶段的低秩约束将 KV 压缩到 latent 空间,在保持质量的同时实现高压缩比,代表了当前工业界的最优实践. 但 MLA 需要从头训练,无法直接应用到已有模型. </p>
<hr>
<h2 id="5-xxzyl-linear-attention">5. 线性注意力(Linear Attention)</h2>
<h3 id="5-1-hxsx">5.1 核心思想</h3>
<p>线性注意力将标准 softmax 注意力改写为核函数的内积形式: </p>
<p>基于前述物理直觉,给出数学形式: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\text{Attention}(Q, K, V) = \\frac{\\phi(Q)\\phi(K)^T}{\\phi(Q)\\phi(K)^T \\cdot \\mathbf{1}} V \\tag{1} \\tag{1}</span>
<p>此式将上述直觉形式化,各项分别对应输入变换、非线性激活与输出生成. </p>
<p>利用矩阵乘法的结合律,将计算顺序从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup><mo stretchy="false">)</mo><mi>V</mi></mrow><annotation encoding="application/x-tex">(QK^T)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0913em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 改为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo stretchy="false">(</mo><msup><mi>K</mi><mi>T</mi></msup><mi>V</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">Q(K^T V)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0913em;vertical-align:-0.25em;"></span><span class="mord mathnormal">Q</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span></span></span></span>,将复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2 d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><msup><mi>d</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n d^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. </p>
<h3 id="5-2-zyff">5.2 主要方法</h3>
<ul>
<li><strong>Performer</strong>: 使用随机特征映射(Random Fourier Features)近似 softmax 核,保证近似精度. </li>
<li><strong>Linformer</strong>: 通过低秩投影将 K/V 的序列维度降至固定大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>≪</mo><mi>n</mi></mrow><annotation encoding="application/x-tex">k \\ll n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span>. </li>
<li><strong>Linear Transformer</strong>: 将 softmax 替换为elu等点态非线性,完全消除二次复杂度. </li>
<li><strong>Mamba / State Space Models</strong>: 将注意力机制替换为选择性状态空间模型,通过状态变量隐式编码历史信息,复杂度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>. </li>
<li><strong>DeltaNet / Gated DeltaNet</strong>: 引入 delta rule 更新状态,比 Hebbian 更新更精细地管理记忆状态.</li>
</ul>
<h3 id="5-3-ylfx">5.3 优劣分析</h3>
<p><strong>优点</strong>: </p>
<ul>
<li>计算复杂度降至线性或近线性,可处理极长序列</li>
<li>递归形式适合流式推理,KV Cache 可被有限状态替代</li>
</ul>
<p><strong>缺点</strong>: </p>
<ul>
<li>表达能力与标准注意力存在差距,部分任务质量 trade-off</li>
<li>需要从头训练,无法直接微调预训练 Transformer</li>
<li>硬件优化生态(CUDA kernel、编译器支持)不如标准注意力成熟</li>
</ul>
<hr>
<h2 id="6-xxjczn">6. 选型决策指南</h2>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">推荐方案</th>
<th align="left">理由</th>
</tr>
</thead>
<tbody><tr>
<td align="left">短文本(&lt;4K),质量优先</td>
<td align="left">标准注意力 + GQA</td>
<td align="left">无需妥协,GQA 降低 KV 开销</td>
</tr>
<tr>
<td align="left">中长文本(4K-32K),零微调</td>
<td align="left">StreamingLLM / H2O</td>
<td align="left">即插即用,实现简单</td>
</tr>
<tr>
<td align="left">长文本(32K-128K),可训练</td>
<td align="left">NSA / DSA + MLA</td>
<td align="left">动态稀疏 + 低秩压缩,精度与效率兼顾</td>
</tr>
<tr>
<td align="left">极长文本(128K+),流式</td>
<td align="left">Mamba / DeltaNet</td>
<td align="left">线性复杂度,天然支持无限上下文</td>
</tr>
<tr>
<td align="left">已有模型加速,不训练</td>
<td align="left">Sparge Attention + KVQuant</td>
<td align="left">组合优化,最大化现有模型效率</td>
</tr>
<tr>
<td align="left">从头训练,追求极限效率</td>
<td align="left">Linear Attention + Gated DeltaNet</td>
<td align="left">架构级重构,长期最优</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-wlqs">7. 未来趋势</h2>
<p><strong>混合架构成为主流</strong>. 单一范式难以满足所有需求,未来的高效注意力设计趋向于&quot;分层混合&quot;: 局部用 Sliding Window / Linear Attention 处理,全局用 Dynamic Sparse Attention 捕获关键依赖,KV 存储用 MLA / 量化压缩. DeepSeek-V3.2-Exp 的 DSA + Qwen3-Next 的 Hybrid Attention 均体现了这一趋势. </p>
<p><strong>硬件-算法协同设计</strong>. NVIDIA Blackwell 的 FP4/FP6 支持、专用稀疏计算单元将倒逼注意力算法向量化友好的方向演进. 未来可能出现&quot;可变精度注意力&quot;——不同层、不同头自动选择 INT8/FP8/FP16 的混合精度. </p>
<p><strong>可学习的位置感知</strong>. RoPE、ALiBi 等手工设计的位置编码方案将被自动学习的位置感知机制替代,使模型自主决定如何编码和利用位置信息. </p>
<hr>
<h2 id="8-ckwx">8. 参考文献</h2>
<ol>
<li><p><strong>Efficient Transformers: A Survey</strong></p>
<ul>
<li>Tay et al., arXiv:2009.00032, 2020.</li>
<li>首次系统分类高效注意力方法.</li>
</ul>
</li>
<li><p><strong>Longformer: The Long-Document Transformer</strong></p>
<ul>
<li>Beltagy et al., arXiv:2004.05150, 2020.</li>
</ul>
</li>
<li><p><strong>BigBird: Transformers for Longer Sequences</strong></p>
<ul>
<li>Zaheer et al., NeurIPS 2020.</li>
</ul>
</li>
<li><p><strong>H2O: Heavy-Hitter Oracle for Efficient Generative Inference</strong></p>
<ul>
<li>Zhang et al., NeurIPS 2024.</li>
</ul>
</li>
<li><p><strong>Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention</strong></p>
<ul>
<li>DeepSeek-AI, arXiv:2501.12948, 2025.</li>
</ul>
</li>
<li><p><strong>Mamba: Linear-Time Sequence Modeling with Selective State Spaces</strong></p>
<ul>
<li>Gu &amp; Dao, arXiv:2312.00752, 2023.</li>
</ul>
</li>
<li><p><strong>Rethinking Attention with Performers</strong></p>
<ul>
<li>Choromanski et al., ICLR 2021.</li>
</ul>
</li>
<li><p><strong>DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model</strong></p>
<ul>
<li>DeepSeek-AI, arXiv:2405.04434, 2024. (MLA)</li>
</ul>
</li>
</ol>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/2010823876536469213">Sparse Attention 稀疏注意力综述解读</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jspxzl","text":"1. 技术谱系总览"},{"level":2,"id":"2-jtxszyl-pattern-based-sparse-attention","text":"2. 静态稀疏注意力(Pattern-Based Sparse Attention)"},{"level":3,"id":"2-1-hxjz","text":"2.1 核心机制"},{"level":3,"id":"2-2-ylfx","text":"2.2 优劣分析"},{"level":2,"id":"3-dtxszyl-dynamic-sparse-attention","text":"3. 动态稀疏注意力(Dynamic Sparse Attention)"},{"level":3,"id":"3-1-hxsx","text":"3.1 核心思想"},{"level":3,"id":"3-2-training-free-dtxs","text":"3.2 Training-Free 动态稀疏"},{"level":3,"id":"3-3-training-aware-dtxs","text":"3.3 Training-Aware 动态稀疏"},{"level":3,"id":"3-4-ylfx","text":"3.4 优劣分析"},{"level":2,"id":"4-compact-zyl-ys-kv-wdysl","text":"4. Compact 注意力: 压缩 KV 维度与数量"},{"level":3,"id":"4-1-hxsx","text":"4.1 核心思想"},{"level":3,"id":"4-2-gjqh","text":"4.2 关键权衡"},{"level":2,"id":"5-xxzyl-linear-attention","text":"5. 线性注意力(Linear Attention)"},{"level":3,"id":"5-1-hxsx","text":"5.1 核心思想"},{"level":3,"id":"5-2-zyff","text":"5.2 主要方法"},{"level":3,"id":"5-3-ylfx","text":"5.3 优劣分析"},{"level":2,"id":"6-xxjczn","text":"6. 选型决策指南"},{"level":2,"id":"7-wlqs","text":"7. 未来趋势"},{"level":2,"id":"8-ckwx","text":"8. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/efficient-attention-survey" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/efficient-attention-survey" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">高效注意力方法综述: 从静态稀疏到线性注意力</h1>
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
