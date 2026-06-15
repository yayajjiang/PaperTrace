"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM4: InfLLM v2 稀疏注意力与端侧推理加速</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 MiniCPM4 的两项核心技术创新: (1) InfLLM v2 可训练稀疏注意力机制，从算法层面突破 Transformer 长文本瓶颈; (2) CPM.cu + FR-Spec + BitCPM 端侧推理系统，从工程层面实现极致推理效率。我们将深入分析其设计原理、实现细节和实际效果。</p>
</blockquote>
<hr>
<h2 id="y-bj-dccwbd-bknsj">一、背景: 端侧长文本的「不可能三角」</h2>
<p>端侧大模型在处理长文本时面临一个经典的「不可能三角」:</p>
<ol>
<li><strong>长上下文能力</strong>: 模型需要理解和生成 32K、64K 甚至 128K 的序列。</li>
<li><strong>低延迟响应</strong>: 用户期望在 1 秒内得到回答，不能等待数秒甚至更久。</li>
<li><strong>有限硬件资源</strong>: 端侧设备的显存通常为 4GB-24GB，远低于云端服务器的数百 GB。</li>
</ol>
<p>标准 Transformer 的自注意力机制计算复杂度为 O(n^2)，KV Cache 内存占用为 O(n)，这意味着:</p>
<ul>
<li>当序列长度从 4K 增加到 128K 时，注意力计算量增长 1,024 倍。</li>
<li>一个 8B 模型在 128K 上下文下的 KV Cache 可能占用 20GB+ 显存，这已经超出了大多数端侧设备的容量。</li>
</ul>
<p>业界现有解决方案各有取舍:</p>
<table>
<thead>
<tr>
<th>技术路线</th>
<th>代表工作</th>
<th>优势</th>
<th>局限</th>
</tr>
</thead>
<tbody><tr>
<td>位置编码外推</td>
<td>YaRN, RoPE 插值</td>
<td>实现简单，不改动模型架构</td>
<td>外推能力有限，超过一定长度后性能急剧衰减</td>
</tr>
<tr>
<td>滑动窗口注意力</td>
<td>Mistral SWA</td>
<td>计算和内存严格 O(w)，w 为窗口大小</td>
<td>无法捕获超出窗口的全局依赖</td>
</tr>
<tr>
<td>线性注意力</td>
<td>RWKV, Mamba</td>
<td>复杂度降为 O(n)</td>
<td>表达能力与标准注意力存在差距</td>
</tr>
<tr>
<td>静态稀疏注意力</td>
<td>Longformer, BigBird</td>
<td>预定义稀疏模式，计算量减少</td>
<td>稀疏模式固定，无法自适应不同任务</td>
</tr>
<tr>
<td>动态稀疏注意力</td>
<td>InfLLM, StreamingLLM</td>
<td>根据输入动态选择关注范围</td>
<td>需要专门的训练或微调</td>
</tr>
</tbody></table>
<p>InfLLM v2 选择了「动态稀疏注意力 + 端到端训练」的技术路线，试图在不牺牲模型能力的前提下，将长文本处理的计算和内存开销降至 O(n) 级别。</p>
<blockquote>
<p>这里需要理解稀疏注意力的根本困境。所有稀疏注意力方法都面临一个核心问题: <strong>如何在不计算全部注意力的情况下，准确找到重要的上下文 token？</strong> 静态稀疏方法(如滑动窗口)假设「邻近 token 更重要」，这对某些任务(如局部语义理解)成立，但对需要全局关联的任务(如跨文档推理、长距离代码依赖)会失效。动态稀疏方法(如 InfLLM)通过引入额外的选择机制来解决这个问题，但选择机制本身也有开销——如果选择的复杂度接近 O(n^2)，稀疏化就失去了意义。InfLLM v2 的关键创新在于用「语义核压缩 + LSE 近似」将选择开销控制在了可接受的范围内。</p>
</blockquote>
<hr>
<h2 id="e-inf-llm-v2-ctlsxsdxlsxs">二、InfLLM v2: 从推理时稀疏到训练时稀疏</h2>
<h3 id="2-1-inf-llm-dyj-c-v1-d-v2">2.1 InfLLM 的演进: 从 v1 到 v2</h3>
<p>InfLLM 最初由面壁智能和清华大学于 2024 年提出(Xiao et al., 2024)，其核心思想是<strong>训练无关的动态稀疏注意力</strong>: 在推理时，根据查询 token 动态选择最相关的上下文块进行注意力计算，而不需要修改预训练模型。</p>
<p>InfLLM v1 的优势在于「即插即用」——任何预训练的稠密注意力模型都可以直接应用 InfLLM v1 进行长文本推理。但其局限也很明显:</p>
<ol>
<li><strong>稀疏模式未经训练</strong>: 模型在预训练阶段从未见过稀疏注意力，因此在稀疏模式下可能出现性能下降。</li>
<li><strong>仅在预填充阶段有效</strong>: InfLLM v1 的块选择机制主要加速预填充阶段，对解码阶段的加速有限。</li>
<li><strong>块选择开销较大</strong>: 在高稀疏度下，块选择的计算和内存访问开销可能抵消稀疏化的收益。</li>
</ol>
<p>InfLLM v2 针对上述三个问题进行了系统性改进:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>InfLLM v1</th>
<th>InfLLM v2</th>
</tr>
</thead>
<tbody><tr>
<td>训练</td>
<td>训练无关，推理时应用</td>
<td>端到端训练，预训练阶段即引入稀疏注意力</td>
</tr>
<tr>
<td>加速阶段</td>
<td>主要预填充</td>
<td>预填充 + 解码双阶段加速</td>
</tr>
<tr>
<td>块选择粒度</td>
<td>块级(block-level)</td>
<td>Token 级(token-level)，更细粒度</td>
</tr>
<tr>
<td>Kernel 优化</td>
<td>通用实现</td>
<td>专用 CUDA Kernel，深度优化</td>
</tr>
<tr>
<td>长文本训练数据</td>
<td>不需要</td>
<td>仅需 5B 长文本 tokens 即可训练</td>
</tr>
</tbody></table>
<h3 id="2-2-ljdxszyljs">2.2 两阶段稀疏注意力计算</h3>
<p>InfLLM v2 的注意力计算分为两个阶段:</p>
<p><strong>阶段一: 动态上下文块选择</strong></p>
<p>对于第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个查询 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">q_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>，上下文被划分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 个块 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi><mo>=</mo><mo stretchy="false">{</mo><msub><mi>B</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>B</mi><mn>2</mn></msub><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msub><mi>B</mi><mi>m</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">B = \\{B_1, B_2, ..., B_m\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span>。每个块 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>B</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">B_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 通过压缩函数(如平均池化或最大池化)生成语义核 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>k</mi><mi>j</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msubsup></mrow><annotation encoding="application/x-tex">k_j^{block}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2439em;vertical-align:-0.3948em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4413em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span></span></span></span>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>k</mi><mi>j</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msubsup><mo>=</mo><mtext>Pool</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>k</mi><mi>t</mi></msub><mo>∣</mo><mi>t</mi><mo>∈</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">k_j^{block} = \\text{Pool}(\\{k_t \\mid t \\in B_j\\})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2822em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Pool</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6542em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">})</span></span></span></span></span><p>查询 token 与每个块的相关性得分通过点积计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">)</mo><mo>=</mo><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msubsup><mi>k</mi><mi>j</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msubsup></mrow><annotation encoding="application/x-tex">r_{block}(q_i, B_j) = q_i \\cdot k_j^{block}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.2822em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span></span></span></span></span><p>选择得分最高的 top-k 个块:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">I</mi><mi>i</mi></msub><mo>=</mo><mtext>TopK</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">)</mo><msubsup><mo stretchy="false">}</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>m</mi></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{I}_i = \\text{TopK}(\\{r_{block}(q_i, B_j)\\}_{j=1}^m)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0738em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1331em;vertical-align:-0.3831em;"></span><span class="mord text"><span class="mord">TopK</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p><strong>阶段二: 注意力计算</strong></p>
<p>基于选中的块集合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{I}_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0738em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>，计算标准注意力:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><mo stretchy="false">{</mo><msub><mi>k</mi><mi>t</mi></msub><mo separator="true">,</mo><msub><mi>v</mi><mi>t</mi></msub><msub><mo stretchy="false">}</mo><mrow><mi>t</mi><mo>∈</mo><munder><mo>⋃</mo><mrow><mi>j</mi><mo>∈</mo><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></mrow></munder><msub><mi>B</mi><mi>j</mi></msub></mrow></msub><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>q</mi><mi>i</mi></msub><msubsup><mi>K</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>V</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></msub></mrow><annotation encoding="application/x-tex">\\text{Attention}(q_i, \\{k_t, v_t\\}_{t \\in \\bigcup_{j \\in \\mathcal{I}_i} B_j}) = \\text{softmax}\\left(\\frac{q_i K_{\\mathcal{I}_i}^T}{\\sqrt{d_k}}\\right) V_{\\mathcal{I}_i}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.3126em;vertical-align:-0.5626em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">∈</span><span class="mop mtight"><span class="mop op-symbol small-op mtight" style="position:relative;top:0em;">⋃</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1667em;"><span style="top:-2.1786em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">∈</span><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0738em;margin-right:0.1em;"><span class="pstrut" style="height:2.6595em;"></span><span class="mord mathnormal mtight">i</span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3147em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.5462em;"><span></span></span></span></span></span></span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0502em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.5626em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6068em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7654em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4247em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3754em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>K</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></msub></mrow><annotation encoding="application/x-tex">K_{\\mathcal{I}_i}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9334em;vertical-align:-0.2501em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>V</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></msub></mrow><annotation encoding="application/x-tex">V_{\\mathcal{I}_i}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9334em;vertical-align:-0.2501em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span></span> 是选中块内的 key 和 value 矩阵。</p>
<h3 id="2-3-fzdfx">2.3 复杂度分析</h3>
<p>设序列长度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi></mrow><annotation encoding="application/x-tex">l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span>，块大小为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span>，选中块数为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span>，每个块包含 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 个 token。</p>
<p><strong>阶段一复杂度</strong>:</p>
<ul>
<li>语义核数量: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">⌊</mo><mi>l</mi><mi mathvariant="normal">/</mi><mi>B</mi><mo stretchy="false">⌋</mo></mrow><annotation encoding="application/x-tex">\\lfloor l / B \\rfloor</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">⌊</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">⌋</span></span></span></span></li>
<li>每个查询需要 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">⌊</mo><mi>l</mi><mi mathvariant="normal">/</mi><mi>B</mi><mo stretchy="false">⌋</mo></mrow><annotation encoding="application/x-tex">\\lfloor l / B \\rfloor</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">⌊</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">⌋</span></span></span></span> 次向量点积</li>
<li>总复杂度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>l</mi><mo>⋅</mo><mi>l</mi><mi mathvariant="normal">/</mi><mi>B</mi><mo stretchy="false">)</mo><mo>=</mo><mi>O</mi><mo stretchy="false">(</mo><msup><mi>l</mi><mn>2</mn></msup><mi mathvariant="normal">/</mi><mi>B</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(l \\cdot l / B) = O(l^2 / B)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span></span></li>
</ul>
<p>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 为常数(如 64 或 128)时，阶段一的理论复杂度仍为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>l</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(l^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>。但论文指出，由于语义核的计算可以复用(同一序列中所有查询 token 共享相同的语义核)，实际开销可以分摊。此外，LSE 近似进一步降低了阶段一的计算量。</p>
<p><strong>阶段二复杂度</strong>:</p>
<ul>
<li>每个查询与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>⋅</mo><mi>B</mi></mrow><annotation encoding="application/x-tex">k \\cdot B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 个 token 计算注意力</li>
<li>总复杂度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>l</mi><mo>⋅</mo><mi>k</mi><mo>⋅</mo><mi>B</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(l \\cdot k \\cdot B)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mclose">)</span></span></span></span></li>
</ul>
<p>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>⋅</mo><mi>B</mi><mo>≪</mo><mi>l</mi></mrow><annotation encoding="application/x-tex">k \\cdot B \\ll l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span> 时，阶段二的复杂度接近 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>l</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(l)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mclose">)</span></span></span></span>。</p>
<p><strong>端到端加速效果</strong>:</p>
<table>
<thead>
<tr>
<th>指标</th>
<th>A100</th>
<th>RTX 4090</th>
</tr>
</thead>
<tbody><tr>
<td>算子级加速(vs FlashAttention-2)</td>
<td>7.4x</td>
<td>9.3x</td>
</tr>
<tr>
<td>端到端 Prefill 加速</td>
<td>2.1x</td>
<td>2.1x</td>
</tr>
<tr>
<td>端到端 Decode 加速</td>
<td>2.3x</td>
<td>2.3x</td>
</tr>
</tbody></table>
<p>算子级加速(7-9x)与端到端加速(2-2.3x)之间的差距说明: 在完整的推理 pipeline 中，注意力计算只是总时间的一部分。FFN 层、Embedding 层、输出投影层以及块选择本身的开销共同占据了约 70-80% 的时间。因此，即使注意力计算加速 9 倍，端到端也只能加速约 2 倍。</p>
<blockquote>
<p>译者注: 这个「算子级加速 vs 端到端加速」的差距是一个重要的工程现实。很多论文在报告加速比时会选择性地展示算子级结果(因为数字更亮眼)，而端到端结果往往保守得多。InfLLM v2 论文同时报告了两种数字，这是值得肯定的。但从工程落地角度看，用户真正关心的是端到端加速。2.1x-2.3x 的端到端加速在端侧场景中意味着什么？以 Jetson AGX Orin 为例，如果稠密模型处理 128K 文本需要 30 秒，InfLLM v2 可以将时间缩短到约 13 秒——这仍然不是一个「实时」的体验，但已经是从「不可用」到「勉强可用」的质变。</p>
</blockquote>
<h3 id="2-4-kxlxszyldxlcl">2.4 可训练稀疏注意力的训练策略</h3>
<p>InfLLM v2 的核心突破在于将稀疏注意力引入了预训练阶段。这意味着模型从出生起就学会了如何利用稀疏模式，而非成年后被迫适应。</p>
<p><strong>训练数据效率</strong>: 论文报告称，仅用 5B 长文本 tokens 即可训练出有效的稀疏注意力模型。这与 NSA(Native Sparse Attention, DeepSeek-V3.2)等方法形成了对比——NSA 需要大量的长文本训练数据才能收敛，而 InfLLM v2 的数据需求显著更低。</p>
<p><strong>混合注意力模式</strong>: MiniCPM4-8B 采用了「双频换挡」机制——在短文本场景下使用稠密注意力确保精度，在长文本场景下自动切换为稀疏注意力降低计算量。这种混合模式通过一个简单的阈值机制实现: 当序列长度超过某个阈值(如 32K)时，自动启用稀疏注意力。</p>
<blockquote>
<p>译者注: 「仅需 5B 长文本 tokens」这个数据非常有价值。长文本训练数据是稀缺资源——高质量的 128K 级别文档远不如 4K 级别的网页文本丰富。InfLLM v2 能在 5B tokens 上收敛，说明其稀疏模式的学习效率很高。但这里有一个未被充分讨论的问题: 5B tokens 的训练是在什么基础模型上进行的？如果基础模型已经在大量短文本上预训练过，那么 5B 长文本 tokens 只是「微调」稀疏注意力; 如果是从头训练，5B  tokens 是否足够学习语言的基本规律？论文没有明确说明这一点。从 MiniCPM4 的训练 pipeline 来看，更可能是先进行标准的稠密注意力预训练(8T tokens)，然后在后期引入稀疏注意力并进行长文本专项训练(5B tokens)。</p>
</blockquote>
<hr>
<h2 id="s-cpm-cu-dctld-zysd">三、CPM.cu: 端侧推理的「专用赛道」</h2>
<h3 id="3-1-wsmxyzytlyq">3.1 为什么需要专用推理引擎</h3>
<p>通用推理框架(vLLM、SGLang、Transformers)的设计目标是「一套代码跑所有模型」，这在云端场景中是合理的——云端的计算资源充足，框架的通用性比极致性能更重要。但在端侧场景中，资源受限到「每一 MB 显存、每一毫秒延迟都至关重要」的程度。</p>
<p>CPM.cu 的设计哲学与通用框架截然不同:</p>
<table>
<thead>
<tr>
<th>设计维度</th>
<th>通用框架(vLLM/SGLang)</th>
<th>CPM.cu</th>
</tr>
</thead>
<tbody><tr>
<td>目标场景</td>
<td>云端高吞吐量 serving</td>
<td>端侧低延迟推理</td>
</tr>
<tr>
<td>模型支持</td>
<td>数百种架构</td>
<td>仅 MiniCPM 系列</td>
</tr>
<tr>
<td>注意力实现</td>
<td>通用 FlashAttention</td>
<td>InfLLM v2 专用 Kernel</td>
</tr>
<tr>
<td>量化支持</td>
<td>插件式(如 GPTQ/AWQ)</td>
<td>原生集成(BitCPM 三值量化)</td>
</tr>
<tr>
<td>投机解码</td>
<td>独立模块</td>
<td>与推理引擎深度融合(FR-Spec)</td>
</tr>
<tr>
<td>内存管理</td>
<td>PagedAttention(通用)</td>
<td>针对稀疏 KV Cache 优化</td>
</tr>
</tbody></table>
<h3 id="3-2-fr-spec-tjjmddcsp">3.2 FR-Spec: 投机解码的端侧适配</h3>
<p>投机解码(Speculative Decoding)的原理很简单: 用一个小的「草稿模型」快速生成候选 token，然后用大的「目标模型」并行验证这些候选。如果草稿模型的命中率足够高，整体推理速度可以大幅提升。</p>
<p>标准投机解码在端侧面临两个问题:</p>
<ol>
<li><strong>内存开销</strong>: 需要同时加载草稿模型和目标模型，内存占用翻倍。</li>
<li><strong>模型切换开销</strong>: 每次在草稿模型和目标模型之间切换都涉及权重加载和状态保存，在端侧 GPU 上这是不可忽视的开销。</li>
</ol>
<p><strong>FR-Spec</strong> 的解决方案是「草稿不全写」:</p>
<ul>
<li>草稿模型只生成部分 token(如每 3 个 token 中生成 1 个)。</li>
<li>目标模型在验证时，不仅验证草稿 token，还快速补全剩余的 token。</li>
<li>这种「部分草稿 + 快速补全」的混合策略减少了草稿模型的运行时间，同时保持了较高的命中率。</li>
</ul>
<blockquote>
<p>译者注: FR-Spec 的设计体现了端侧优化的一个核心原则: <strong>减少内存访问比减少计算更重要</strong>。在 GPU 上，内存带宽通常是瓶颈而非算力。标准投机解码需要两次完整的内存读取(草稿模型权重 + 目标模型权重)，而 FR-Spec 通过减少草稿模型的运行次数，间接减少了内存访问总量。此外，FR-Spec 与 CPM.cu 的深度集成意味着草稿生成和目标验证可以在同一个 Kernel 调用中完成，避免了跨 Kernel 的数据搬运。这种「软硬件协同设计」的思路在端侧场景中非常关键。</p>
</blockquote>
<h3 id="3-3-bit-cpm-szlhdxlcl">3.3 BitCPM: 三值量化的训练策略</h3>
<p>BitCPM 将模型权重限制为 {-1, 0, +1} 三个离散值。这种极端量化的存储效率是惊人的: 每个权重只需 2 bits，相比 FP16 的 16 bits，压缩比为 8:1。</p>
<p>但三值量化的挑战在于<strong>信息损失</strong>。标准的训练后量化(PTQ)方法在三值化时会产生严重的精度下降。BitCPM 的解决方案是<strong>训练时量化(Quantization-Aware Training, QAT)</strong>:</p>
<ol>
<li><strong>渐进式量化</strong>: 训练初期使用较高精度(如 FP16)，随着训练进行逐步降低精度，让模型逐渐适应低精度表示。</li>
<li><strong>直通估计器(Straight-Through Estimator, STE)</strong>: 在前向传播中使用三值权重，在反向传播中将梯度直接传递给浮点权重，解决三值函数不可导的问题。</li>
<li><strong>知识蒸馏</strong>: 用全精度教师模型指导三值学生模型的训练，将教师的知识迁移到学生中。</li>
</ol>
<p>BitCPM 的评估结果显示，在 4-bit 权重 + 16-bit 激活(W4A16)配置下，模型性能损失控制在可接受范围内，同时推理速度提升显著。</p>
<hr>
<h2 id="s-ytljsddb">四、与同类技术的对比</h2>
<h3 id="4-1-xszyldb">4.1 稀疏注意力对比</h3>
<table>
<thead>
<tr>
<th>方法</th>
<th>类型</th>
<th>训练需求</th>
<th>Prefill 加速</th>
<th>Decode 加速</th>
<th>长文本性能</th>
</tr>
</thead>
<tbody><tr>
<td>InfLLM v1</td>
<td>动态稀疏，训练无关</td>
<td>无</td>
<td>有</td>
<td>有限</td>
<td>轻微下降</td>
</tr>
<tr>
<td>InfLLM v2</td>
<td>动态稀疏，可训练</td>
<td>5B tokens</td>
<td>2.1x</td>
<td>2.3x</td>
<td>与稠密相当</td>
</tr>
<tr>
<td>NSA</td>
<td>静态+动态混合，可训练</td>
<td>大量</td>
<td>~2x</td>
<td>~2x</td>
<td>轻微下降</td>
</tr>
<tr>
<td>MInference</td>
<td>动态稀疏，训练无关</td>
<td>无</td>
<td>有</td>
<td>有限</td>
<td>中等下降</td>
</tr>
<tr>
<td>StreamingLLM</td>
<td>静态稀疏(滑动窗口+锚点)</td>
<td>无</td>
<td>无</td>
<td>有</td>
<td>明显下降</td>
</tr>
<tr>
<td>Lightning Attention</td>
<td>线性注意力</td>
<td>从头训练</td>
<td>显著</td>
<td>显著</td>
<td>中等下降</td>
</tr>
</tbody></table>
<p>InfLLM v2 的核心优势在于「训练时引入稀疏性」，这使得稀疏模式可以与模型能力共同进化。相比之下，训练无关的稀疏方法(如 InfLLM v1、MInference)虽然即插即用，但无法充分利用模型的潜力。</p>
<h3 id="4-2-dctlkjdb">4.2 端侧推理框架对比</h3>
<table>
<thead>
<tr>
<th>框架</th>
<th>稀疏注意力支持</th>
<th>量化集成</th>
<th>投机解码</th>
<th>跨平台</th>
<th>适用场景</th>
</tr>
</thead>
<tbody><tr>
<td>vLLM</td>
<td>有限(需插件)</td>
<td>插件式</td>
<td>支持(EAGLE)</td>
<td>Linux 为主</td>
<td>云端 serving</td>
</tr>
<tr>
<td>SGLang</td>
<td>有限</td>
<td>插件式</td>
<td>支持</td>
<td>Linux 为主</td>
<td>云端 serving</td>
</tr>
<tr>
<td>llama.cpp</td>
<td>部分支持</td>
<td>原生</td>
<td>支持</td>
<td>跨平台</td>
<td>端侧/CPU</td>
</tr>
<tr>
<td>CPM.cu</td>
<td>原生(InfLLM v2)</td>
<td>原生(BitCPM)</td>
<td>原生(FR-Spec)</td>
<td>需 ArkInfer</td>
<td>端侧/GPU</td>
</tr>
</tbody></table>
<p>CPM.cu 的劣势在于适用范围受限——它只能运行 MiniCPM 系列模型。但在端侧场景中，如果开发者已经选择了 MiniCPM4，CPM.cu 可以提供比通用框架更高的性能。</p>
<hr>
<h2 id="w-gcldtz">五、工程落地挑战</h2>
<h3 id="5-1-xszyldjdbj">5.1 稀疏注意力的精度边界</h3>
<p>InfLLM v2 在 81% 稀疏度下保持了与稠密注意力相当的性能，但当稀疏度进一步提升到 90%+ 时，性能下降是否仍然可控？论文没有报告 90% 稀疏度下的结果。从理论上讲，当稀疏度过高时，模型可能丢失关键的远距离依赖信息。</p>
<h3 id="5-2-kptbsdfzx">5.2 跨平台部署的复杂性</h3>
<p>虽然 ArkInfer 提供了跨平台适配，但不同硬件平台(NVIDIA CUDA、Intel OpenVINO、高通 QNN、联发科 NeuroPilot)的优化深度各不相同。在 NVIDIA GPU 上，CPM.cu 可以发挥全部性能; 但在其他平台上，可能只能使用通用实现，性能优势会打折扣。</p>
<h3 id="5-3-hhtlmsdqhkx">5.3 混合推理模式的切换开销</h3>
<p>MiniCPM4.1 的「思考/非思考」模式切换虽然通过简单的 prompt 标记实现，但模式切换是否会导致生成风格的不一致？例如，在一次多轮对话中，如果第一轮使用思考模式、第二轮使用非思考模式，模型是否能保持上下文一致性？论文没有深入讨论这种边界情况。</p>
<hr>
<h2 id="l-zj">六、总结</h2>
<p>MiniCPM4 通过 InfLLM v2、CPM.cu、FR-Spec 和 BitCPM 的协同设计，在端侧场景下实现了「算法-数据-系统」的全栈优化:</p>
<ul>
<li><strong>算法层</strong>: InfLLM v2 将长文本注意力的计算和内存开销从 O(n^2) 降至接近 O(n)。</li>
<li><strong>数据层</strong>: UltraClean 和 UltraChat v2 用 8T tokens 达到了 36T tokens 的效果。</li>
<li><strong>系统层</strong>: CPM.cu + FR-Spec + BitCPM 将端到端推理速度提升了 2-5 倍(常规场景)至 220 倍(极限场景)。</li>
</ul>
<p>这种「端到端效率优化」的思路——从模型架构到训练数据到推理引擎的全面协同——为端侧大模型的发展提供了一个值得参考的范式。</p>
<hr>
<blockquote>
<p>本文档为 Chapter 14 精读系列 D5 交付物，知识库同步版本见 <code>docs/sections/llm-guide/5-主流模型全解/5.2-国内大模型/面壁智能-MiniCPM/05-MiniCPM-4.0-InfLLM-v2稀疏注意力与端侧推理加速.md</code>。</p>
</blockquote>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-hxgs">A. 核心公式</h3>
<p><strong>语义核计算</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>k</mi><mi>j</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msubsup><mo>=</mo><mtext>Pool</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>k</mi><mi>t</mi></msub><mo>∣</mo><mi>t</mi><mo>∈</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">k_j^{block} = \\text{Pool}(\\{k_t \\mid t \\in B_j\\})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2822em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Pool</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6542em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">})</span></span></span></span></span><p>其中 Pool 可以是平均池化或最大池化操作。</p>
<p><strong>块相关性得分</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">)</mo><mo>=</mo><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msubsup><mi>k</mi><mi>j</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msubsup></mrow><annotation encoding="application/x-tex">r_{block}(q_i, B_j) = q_i \\cdot k_j^{block}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.2822em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>选中块的 Top-K 选择</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">I</mi><mi>i</mi></msub><mo>=</mo><mtext>TopK</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">)</mo><msubsup><mo stretchy="false">}</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>m</mi></msubsup><mo separator="true">,</mo><mi>k</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{I}_i = \\text{TopK}(\\{r_{block}(q_i, B_j)\\}_{j=1}^m, k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0738em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1331em;vertical-align:-0.3831em;"></span><span class="mord text"><span class="mord">TopK</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span></span></span><p><strong>稀疏注意力计算</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>K</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></msub><mo separator="true">,</mo><msub><mi>V</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></msub><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>q</mi><mi>i</mi></msub><msubsup><mi>K</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>V</mi><msub><mi mathvariant="script">I</mi><mi>i</mi></msub></msub></mrow><annotation encoding="application/x-tex">\\text{Attention}(q_i, K_{\\mathcal{I}_i}, V_{\\mathcal{I}_i}) = \\text{softmax}\\left(\\frac{q_i K_{\\mathcal{I}_i}^T}{\\sqrt{d_k}}\\right) V_{\\mathcal{I}_i}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0001em;vertical-align:-0.2501em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6068em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7654em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4247em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3754em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0738em;">I</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0738em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2501em;"><span></span></span></span></span></span></span></span></span></span></span><h3 id="b-syb">B. 术语表</h3>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>InfLLM v2</td>
<td>-</td>
<td>可训练稀疏注意力机制</td>
</tr>
<tr>
<td>Semantic Kernel</td>
<td>语义核</td>
<td>上下文块的压缩表示</td>
</tr>
<tr>
<td>LSE Approximation</td>
<td>LSE 近似</td>
<td>加速块选择的对数求和指数近似</td>
</tr>
<tr>
<td>CPM.cu</td>
<td>-</td>
<td>端侧定制 CUDA 推理引擎</td>
</tr>
<tr>
<td>FR-Spec</td>
<td>-</td>
<td>快速可复用投机解码</td>
</tr>
<tr>
<td>BitCPM</td>
<td>-</td>
<td>三值量化 LLM</td>
</tr>
<tr>
<td>STE</td>
<td>Straight-Through Estimator</td>
<td>直通估计器，用于不可导函数的反向传播</td>
</tr>
<tr>
<td>QAT</td>
<td>Quantization-Aware Training</td>
<td>量化感知训练</td>
</tr>
<tr>
<td>ArkInfer</td>
<td>-</td>
<td>跨平台部署适配系统</td>
</tr>
<tr>
<td>Top-K</td>
<td>-</td>
<td>选择得分最高的 K 个元素</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-bj-dccwbd-bknsj","text":"一、背景: 端侧长文本的「不可能三角」"},{"level":2,"id":"e-inf-llm-v2-ctlsxsdxlsxs","text":"二、InfLLM v2: 从推理时稀疏到训练时稀疏"},{"level":3,"id":"2-1-inf-llm-dyj-c-v1-d-v2","text":"2.1 InfLLM 的演进: 从 v1 到 v2"},{"level":3,"id":"2-2-ljdxszyljs","text":"2.2 两阶段稀疏注意力计算"},{"level":3,"id":"2-3-fzdfx","text":"2.3 复杂度分析"},{"level":3,"id":"2-4-kxlxszyldxlcl","text":"2.4 可训练稀疏注意力的训练策略"},{"level":2,"id":"s-cpm-cu-dctld-zysd","text":"三、CPM.cu: 端侧推理的「专用赛道」"},{"level":3,"id":"3-1-wsmxyzytlyq","text":"3.1 为什么需要专用推理引擎"},{"level":3,"id":"3-2-fr-spec-tjjmddcsp","text":"3.2 FR-Spec: 投机解码的端侧适配"},{"level":3,"id":"3-3-bit-cpm-szlhdxlcl","text":"3.3 BitCPM: 三值量化的训练策略"},{"level":2,"id":"s-ytljsddb","text":"四、与同类技术的对比"},{"level":3,"id":"4-1-xszyldb","text":"4.1 稀疏注意力对比"},{"level":3,"id":"4-2-dctlkjdb","text":"4.2 端侧推理框架对比"},{"level":2,"id":"w-gcldtz","text":"五、工程落地挑战"},{"level":3,"id":"5-1-xszyldjdbj","text":"5.1 稀疏注意力的精度边界"},{"level":3,"id":"5-2-kptbsdfzx","text":"5.2 跨平台部署的复杂性"},{"level":3,"id":"5-3-hhtlmsdqhkx","text":"5.3 混合推理模式的切换开销"},{"level":2,"id":"l-zj","text":"六、总结"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-hxgs","text":"A. 核心公式"},{"level":3,"id":"b-syb","text":"B. 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/11-mini-cpm-4.0/05-mini-cpm-4.0-inf-llm-v2-xszylydctljs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/11-mini-cpm-4.0/05-mini-cpm-4.0-inf-llm-v2-xszylydctljs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM4: InfLLM v2 稀疏注意力与端侧推理加速</h1>
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
