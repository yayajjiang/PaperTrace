"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2 核心原理与架构：从乐高积木到动力引擎</h1>
<h2 id="1-yjmlyjszb">1. 演进脉络与技术坐标</h2>
<p>Transformer (Vaswani et al., 2017) 并非凭空诞生. 其前代——RNN 与 LSTM——在处理长序列时遭遇了梯度消失与并行度瓶颈的双重绞杀. CNN 虽可并行，但感受野受限，难以建模全局依赖. Transformer 以自注意力机制取代了循环结构，将序列建模的时间复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 的串行依赖转变为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的矩阵并行计算，在 GPU 批量运算的物理特性上获得了压倒性优势. </p>
<p>本章覆盖的技术演进轴线如下：</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">时间</th>
<th align="left">核心突破</th>
<th align="left">解决的物理约束</th>
</tr>
</thead>
<tbody><tr>
<td align="left">基础组件标准化</td>
<td align="left">2017-2019</td>
<td align="left">LayerNorm、残差连接、GELU</td>
<td align="left">训练稳定性与梯度流通</td>
</tr>
<tr>
<td align="left">注意力机制统治</td>
<td align="left">2017-2022</td>
<td align="left">MHA、MQA、GQA、RoPE</td>
<td align="left">显存瓶颈与长上下文外推</td>
</tr>
<tr>
<td align="left">高效注意力爆发</td>
<td align="left">2022-2024</td>
<td align="left">FlashAttention、NSA、MoBA</td>
<td align="left">计算-访存失衡、二次复杂度</td>
</tr>
<tr>
<td align="left">非 Transformer 架构崛起</td>
<td align="left">2023-2025</td>
<td align="left">Mamba、RWKV、线性注意力</td>
<td align="left">长序列线性复杂度</td>
</tr>
<tr>
<td align="left">稀疏与混合专家</td>
<td align="left">2024-2025</td>
<td align="left">DeepSeek-MoE、Llama 4</td>
<td align="left">固定参数量下的能力扩展</td>
</tr>
</tbody></table>
<p>本章的知识图谱呈三层递进结构：</p>
<ul>
<li><strong>2.1 深度学习基础组件</strong>：FFN、归一化、残差连接、位置编码. 这些模块如同乐高积木，单独看似简单，但组合方式决定了整座大厦的承重能力. </li>
<li><strong>2.2-2.3 注意力机制与高效变体</strong>：自注意力是 Transformer 的心脏，其 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度是 blessings 也是 curse. 从 MHA 到 MLA，从 FlashAttention 到 NSA，社区在不牺牲表达能力的前提下持续压缩注意力的物理开销. </li>
<li><strong>2.4-2.5 前沿架构与长上下文</strong>：MoE 以稀疏激活突破参数规模天花板; Mamba/RWKV 以状态空间或线性 RNN 彻底摆脱二次复杂度; 长上下文外推技术(YaRN、LongRoPE)则在现有架构上扩展上下文窗口.</li>
</ul>
<h2 id="2-gyjzyldxz">2. 工业价值与落地现状</h2>
<p>理解本章内容是进行模型选型、性能优化和架构创新的基石. </p>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">需要掌握的核心知识</th>
<th align="left">决策影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">模型选型(7B vs 70B)</td>
<td align="left">FFN 参数量占比、注意力头数、隐藏层维度</td>
<td align="left">决定推理成本与能力的 trade-off</td>
</tr>
<tr>
<td align="left">推理性能优化</td>
<td align="left">FlashAttention、PagedAttention、KV Cache 压缩</td>
<td align="left">决定 P99 延迟与吞吐量</td>
</tr>
<tr>
<td align="left">长上下文产品(&gt;128K)</td>
<td align="left">RoPE 外推、ALiBi、线性注意力</td>
<td align="left">决定上下文窗口的可扩展性</td>
</tr>
<tr>
<td align="left">私有化部署资源受限</td>
<td align="left">MQA/GQA、量化、MoE 路由策略</td>
<td align="left">决定单卡可承载的最大模型</td>
</tr>
<tr>
<td align="left">自研模型架构</td>
<td align="left">各组件的失效模式与组合兼容性</td>
<td align="left">避免训练不稳定或推理崩溃</td>
</tr>
</tbody></table>
<p>以 Llama 3.1 70B 为例，其 FFN 层参数量占总量的 67.5%，注意力层占 20%，嵌入层占 12.5%. 这意味着针对 FFN 的量化(INT4/INT8)带来的整体压缩收益远大于注意力层. </p>
<h2 id="3-hxzjwlzj">3. 核心组件物理直觉</h2>
<h3 id="3-1-ffn-fbsjzjy">3.1 FFN：分布式键值记忆</h3>
<p>FFN 的本质是一个高维稀疏激活的键值记忆网络(Geva et al., 2020). <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mrow><mi>i</mi><mi>n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">W_{in}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">in</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的每一列是模式探测器(Key)，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mrow><mi>o</mi><mi>u</mi><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">W_{out}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的每一行是知识向量(Value). 非线性激活函数(ReLU/GELU/SiLU)充当阈值门，仅放行与当前语义最匹配的少数神经元. 这解释了为何 FFN 占据 2/3 参数量——它是模型存储世界常识的物理载体. </p>
<h3 id="3-2-gyhc-wdccldxyj">3.2 归一化层：稳定残差流的血压计</h3>
<p>LayerNorm 通过对单一样本的特征维度进行归一化，将隐状态分布锚定在一个可控区间. 在深层网络中，它如同血压计，防止梯度在反向传播时爆炸或消失. Pre-LN 与 Post-LN 的选择直接决定了模型可稳定训练的最大深度. </p>
<h3 id="3-3-cclj-tdgsgl">3.3 残差连接：梯度高速公路</h3>
<p>残差连接(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi><mo>+</mo><mtext>SubLayer</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">x + \\text{SubLayer}(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">SubLayer</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span>)在反向传播时提供了恒等映射的梯度高速公路. 即使某个子层(如注意力)的梯度趋近于零，信号仍可通过短路路径回传. 这是 Transformer 能够堆叠上百层的根本原因. </p>
<h3 id="3-4-wzbm-gwxjhzrsx">3.4 位置编码：给无序集合注入时序</h3>
<p>自注意力本身对输入排列保持不变性——交换两个 token 的位置，输出仅相应交换，注意力权重不变. 位置编码(绝对/相对/RoPE/ALiBi)通过在输入中注入位置信息，打破这种对称性. RoPE 的优雅之处在于：它将绝对位置编码为旋转相位，使得注意力分数自然仅依赖于相对距离 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>−</mo><mi>n</mi></mrow><annotation encoding="application/x-tex">m - n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span>，且具备长距离衰减特性. </p>
<h2 id="4-slcbqj">4. 算力成本全景</h2>
<p>以 Llama 3.1 8B 的单层前向传播为例(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">d = 4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>=</mo><mn>32</mn></mrow><annotation encoding="application/x-tex">n_{heads} = 32</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">32</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">d_{head} = 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>=</mo><mn>32</mn></mrow><annotation encoding="application/x-tex">n_{layers} = 32</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">32</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub><mo>=</mo><mn>14336</mn></mrow><annotation encoding="application/x-tex">d_{ff} = 14336</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">14336</span></span></span></span>)：</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="center">参数量</th>
<th align="left">每 token FLOPs</th>
<th align="left">访存字节</th>
<th align="left">计算强度 (FLOPs/Byte)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Self-Attention QKV</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mi>d</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">3 \\times d^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span> = 50.3M</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><msup><mi>d</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">6d^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">6</span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span> = 100.7M</td>
<td align="left">201.4MB</td>
<td align="left">0.5</td>
</tr>
<tr>
<td align="left">Attention Score (QK^T)</td>
<td align="center">0</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub><mo>×</mo><mi>s</mi><mi>e</mi><msup><mi>q</mi><mn>2</mn></msup><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">2 \\times n_{heads} \\times seq^2 \\times d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0085em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">se</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mi>e</mi><msup><mi>q</mi><mn>2</mn></msup><mo>×</mo><msub><mi>n</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi><mi>s</mi></mrow></msub></mrow><annotation encoding="application/x-tex">seq^2 \\times n_{heads}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0085em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">se</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td align="left">取决于 seq</td>
</tr>
<tr>
<td align="left">FFN (SwiGLU)</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><mi>d</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">3 \\times d \\times d_{ff}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> = 176.2M</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mi>d</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>f</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">6d \\times d_{ff}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> = 352.4M</td>
<td align="left">704.8MB</td>
<td align="left">0.5</td>
</tr>
<tr>
<td align="left">总参数量/层</td>
<td align="center">~226M</td>
<td align="left">~453M</td>
<td align="left">~906MB</td>
<td align="left">~0.5</td>
</tr>
</tbody></table>
<p>关键观察：</p>
<ul>
<li>FFN 参数量是 Attention 的 3.5 倍，但两者 FLOPs 比例接近(因 SwiGLU 的三矩阵结构). </li>
<li>计算强度仅为 0.5，远低于 A100 FP16 Tensor Core 的峰值计算强度(约 100+). 这意味着在解码阶段(Batch Size = 1)，推理完全受限于显存带宽，而非算力. </li>
<li>FlashAttention 通过分块计算将 Attention 的访存从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span></span></span>，在 seq &gt; 2K 时成为必需品.</li>
</ul>
<h2 id="5-jjsx-ygwzd-transformer-c">5. 极简实现：一个完整的 Transformer 层</h2>
<pre><code class="language-python">import torch
import torch.nn as nn
import math

class TransformerLayer(nn.Module):
    def __init__(self, d_model=512, n_heads=8, d_ff=2048, dropout=0.1):
        super().__init__()
        self.d_head = d_model // n_heads
        self.n_heads = n_heads

        # Self-Attention
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

        # FFN (SwiGLU)
        self.W_gate = nn.Linear(d_model, d_ff)
        self.W_up   = nn.Linear(d_model, d_ff)
        self.W_down = nn.Linear(d_ff, d_model)

        # Normalization
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)

        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # Pre-LN: 先归一化再计算子层
        # Self-Attention with RoPE (simplified)
        residual = x
        x = self.norm1(x)
        q = self.W_q(x).view(x.size(0), x.size(1), self.n_heads, self.d_head).transpose(1, 2)
        k = self.W_k(x).view(x.size(0), x.size(1), self.n_heads, self.d_head).transpose(1, 2)
        v = self.W_v(x).view(x.size(0), x.size(1), self.n_heads, self.d_head).transpose(1, 2)

        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.d_head)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float(&#39;-inf&#39;))
        attn = torch.softmax(scores, dim=-1)
        out = torch.matmul(attn, v).transpose(1, 2).contiguous().view(x.size(0), x.size(1), -1)
        out = self.W_o(out)
        x = residual + self.dropout(out)

        # FFN (SwiGLU)
        residual = x
        x = self.norm2(x)
        gate = torch.sigmoid(self.W_gate(x)) * self.W_gate(x)  # SiLU
        up = self.W_up(x)
        ffn_out = self.W_down(gate * up)
        x = residual + self.dropout(ffn_out)

        return x
</code></pre>
<h2 id="6-bjtjysxms">6. 边界条件与失效模式</h2>
<table>
<thead>
<tr>
<th align="left">失效场景</th>
<th align="left">物理根源</th>
<th align="left">典型症状</th>
<th align="left">缓解策略</th>
</tr>
</thead>
<tbody><tr>
<td align="left">训练 Loss 震荡/发散</td>
<td align="left">Post-LN + 大学习率导致梯度爆炸</td>
<td align="left">Loss NaN 或剧烈震荡</td>
<td align="left">改用 Pre-LN，降低初始学习率</td>
</tr>
<tr>
<td align="left">长上下文外推崩溃</td>
<td align="left">RoPE 基频对未训练长度产生陌生相位</td>
<td align="left">长文本 PPL 急剧上升</td>
<td align="left">NTK-aware 插值、YaRN 长度缩放</td>
</tr>
<tr>
<td align="left">FFN 稀疏过度</td>
<td align="left">ReLU 死神经元累积，知识存储密度下降</td>
<td align="left">模型能力随深度退化</td>
<td align="left">改用 GELU/SiLU，引入门控机制</td>
</tr>
<tr>
<td align="left">Attention 显存 OOM</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> KV Cache 随长度平方增长</td>
<td align="left">CUDA OOM at long seq</td>
<td align="left">GQA/MQA 压缩 KV，PagedAttention</td>
</tr>
<tr>
<td align="left">MoE 路由崩塌</td>
<td align="left">负载均衡失效，所有 token 涌向同一专家</td>
<td align="left">训练 Loss 持平，部分专家零激活</td>
<td align="left">引入辅助负载均衡损失 (aux loss)</td>
</tr>
<tr>
<td align="left">残差流退化</td>
<td align="left">深层网络中残差路径被主路径淹没</td>
<td align="left">深层参数更新趋近于零</td>
<td align="left">初始化缩放(如 GPT-3 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><msqrt><mi>N</mi></msqrt></mrow><annotation encoding="application/x-tex">1/\\sqrt{N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1767em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9267em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span><span style="top:-2.8867em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1133em;"><span></span></span></span></span></span></span></span></span>)</td>
</tr>
</tbody></table>
<h2 id="7-jsqz">7. 技术前瞻</h2>
<p>本章涵盖的架构仍在以月为单位迭代：</p>
<ul>
<li><strong>深度扩展</strong>：Moonshot 的 Moonlight 将层数推至 100+，依赖 Ultra-Deep Post-LN 的精细初始化. </li>
<li><strong>上下文窗口军备竞赛</strong>：从 128K 到 1M+，线性注意力(MiniMax-01)与渐进式训练(GLM-4)两条路线并行. </li>
<li><strong>测试时计算扩展</strong>：o3 类模型通过增加推理时的思考深度(Test-time Compute)提升效果，这要求架构支持极长的内部 CoT 序列. </li>
<li><strong>硬件-架构协同设计</strong>：NVIDIA Blackwell 的 FP4/FP6 支持将倒逼架构师重新评估量化友好的激活函数选择.</li>
</ul>
<h2 id="8-ckwx">8. 参考文献</h2>
<ol>
<li>Vaswani, A., et al. (2017). Attention Is All You Need. <em>NeurIPS</em>.</li>
<li>Geva, M., et al. (2020). Transformer Feed-Forward Layers Are Key-Value Memories. <em>EMNLP</em>.</li>
<li>Su, J., et al. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding. <em>arXiv:2104.09864</em>.</li>
<li>Press, O., et al. (2021). Train Short, Test Long: Attention with Linear Biases. <em>arXiv:2108.12409</em>.</li>
<li>Dao, T., et al. (2022). FlashAttention: Fast and Memory-Efficient Exact Attention. <em>NeurIPS</em>.</li>
<li>Shazeer, N. (2020). GLU Variants Improve Transformer. <em>arXiv:2002.05202</em>.</li>
<li>Gu, A., &amp; Dao, T. (2023). Mamba: Linear-Time Sequence Modeling with Selective State Spaces. <em>arXiv:2312.00752</em>.</li>
<li>Dai, D., et al. (2024). DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models. <em>arXiv:2401.06066</em>.</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yjmlyjszb","text":"1. 演进脉络与技术坐标"},{"level":2,"id":"2-gyjzyldxz","text":"2. 工业价值与落地现状"},{"level":2,"id":"3-hxzjwlzj","text":"3. 核心组件物理直觉"},{"level":3,"id":"3-1-ffn-fbsjzjy","text":"3.1 FFN：分布式键值记忆"},{"level":3,"id":"3-2-gyhc-wdccldxyj","text":"3.2 归一化层：稳定残差流的血压计"},{"level":3,"id":"3-3-cclj-tdgsgl","text":"3.3 残差连接：梯度高速公路"},{"level":3,"id":"3-4-wzbm-gwxjhzrsx","text":"3.4 位置编码：给无序集合注入时序"},{"level":2,"id":"4-slcbqj","text":"4. 算力成本全景"},{"level":2,"id":"5-jjsx-ygwzd-transformer-c","text":"5. 极简实现：一个完整的 Transformer 层"},{"level":2,"id":"6-bjtjysxms","text":"6. 边界条件与失效模式"},{"level":2,"id":"7-jsqz","text":"7. 技术前瞻"},{"level":2,"id":"8-ckwx","text":"8. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2-arch" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2-arch" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2 核心原理与架构：从乐高积木到动力引擎</h1>
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
