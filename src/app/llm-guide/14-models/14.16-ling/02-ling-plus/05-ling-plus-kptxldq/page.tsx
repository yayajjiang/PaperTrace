"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>跨平台训练对齐：在 5 种异构硬件上训练 290B MoE 的工程实践</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.16-Ling 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>技术点</strong>: Cross-Platform Alignment for MoE Training
<strong>来源</strong>: Ling-Plus Technical Report, Section 6.2
<strong>相关系统</strong>: DLRover, Megatron-LM, Megatron 厂商版本
<strong>硬件环境</strong>: 5 种异构 AI 加速器(Device A/B/C/D/E)</p>
</blockquote>
<hr>
<h2 id="1-wtbj">1. 问题背景</h2>
<h3 id="1-1-wsmykptxl">1.1 为什么要跨平台训练</h3>
<p>Ling-Plus(290B 总参/28.8B 激活参)的预训练面临一个独特的约束：<strong>没有独占的高端 GPU 集群</strong>。蚂蚁集团的训练环境由以下硬件组成：</p>
<table>
<thead>
<tr>
<th>设备</th>
<th>峰值算力</th>
<th>显存</th>
<th>每小时成本</th>
<th>占比估算</th>
</tr>
</thead>
<tbody><tr>
<td>A</td>
<td>370 TFLOPS</td>
<td>64GB</td>
<td>7 RMB</td>
<td>~25%</td>
</tr>
<tr>
<td>B</td>
<td>120 TFLOPS</td>
<td>96GB</td>
<td>4.5 RMB</td>
<td>~20%</td>
</tr>
<tr>
<td>C</td>
<td>312 TFLOPS</td>
<td>80GB</td>
<td>10 RMB</td>
<td>~20%</td>
</tr>
<tr>
<td>D</td>
<td>989 TFLOPS</td>
<td>80GB</td>
<td>27.5 RMB</td>
<td>~15%</td>
</tr>
<tr>
<td>E</td>
<td>147 TFLOPS</td>
<td>96GB</td>
<td>5.64 RMB</td>
<td>~20%</td>
</tr>
</tbody></table>
<p>算力差异高达 <strong>8.3 倍</strong>(989 vs 120 TFLOPS)，架构差异包括：</p>
<ul>
<li>DSA(领域特定架构)vs GPGPU(通用 GPU)</li>
<li>部分支持 FP8(Device D/E)，部分不支持(Device A/B/C)</li>
<li>不同的 NCCL 实现和通信原语</li>
<li>不同的内存层次结构和缓存策略</li>
</ul>
<h3 id="1-2-kptxldhxtz">1.2 跨平台训练的核心挑战</h3>
<p><strong>挑战 1: 算子实现差异</strong></p>
<p>同一种数学运算(如矩阵乘法)在不同硬件上的底层实现可能产生不同的数值结果。对于 FP32 精度，差异通常在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span> 量级; 但对于 BF16/FP16，差异可能达到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>3</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">3</span></span></span></span></span></span></span></span></span></span></span></span>。</p>
<p><strong>挑战 2: 分布式策略差异</strong></p>
<p>MoE 训练依赖 expert parallelism(EP)、tensor parallelism(TP)、pipeline parallelism(PP)的组合。不同硬件对 all-to-all、all-gather、reduce-scatter 等集合通信的支持程度不同。</p>
<p><strong>挑战 3: 精度累积效应</strong></p>
<p>单次前向/反向传播的微小差异(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 量级)在 9T token、数百万步的训练中累积，可能导致：</p>
<ul>
<li>损失曲线偏离</li>
<li>评估指标漂移</li>
<li>模型收敛到不同的局部最优</li>
</ul>
<blockquote>
<p>蚂蚁集团的实验表明：<strong>即使基本操作(matmul)的误差在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 以下，经过 100K 步训练后，最终损失差异可达 0.1-0.3</strong>——这足以导致模型性能的显著差异。</p>
</blockquote>
<hr>
<h2 id="2-dqffl">2. 对齐方法论</h2>
<h3 id="2-1-scdqkj">2.1 三层对齐框架</h3>
<p>Ling 团队提出了<strong>三层对齐框架</strong>，从底层到上层逐层验证：</p>
<pre><code>Layer 3: 框架层对齐
    ├─ Attention 模块前向/反向
    ├─ MLP/MoE 模块前向/反向
    ├─ Router 模块前向/反向
    └─ Loss 计算(含辅助损失)
    
Layer 2: 算子层对齐
    ├─ 矩阵乘法(matmul)
    ├─ 线性变换(linear)
    ├─ Softmax / LayerNorm
    ├─ All-Reduce / All-to-All
    └─ Embedding / Top-K
    
Layer 1: 基础操作对齐
    ├─ 标量运算(+,-,*,/)
    ├─ 类型转换(cast)
    ├─ 内存布局(layout)
    └─ 随机数生成(RNG)
</code></pre>
<p><strong>关键洞察</strong>: 只有三层全部对齐，才能确保跨平台训练的一致性。许多团队只做到 Layer 2 就以为足够，结果在大规模训练中遇到难以调试的漂移问题。</p>
<h3 id="2-2-layer-1-jcczdq">2.2 Layer 1: 基础操作对齐</h3>
<p><strong>目标</strong>: 确保最基本的数学运算在不同平台上产生比特级一致的结果。</p>
<p><strong>方法</strong>:</p>
<ol>
<li><strong>统一 RNG 种子</strong>: 在所有平台上使用相同的随机数生成器(如 Philox)和相同的种子序列</li>
<li><strong>标量运算标准化</strong>: 对于涉及分支逻辑的运算(如 <code>max(x, 0)</code>)，明确边界条件处理方式</li>
<li><strong>类型转换规则</strong>: 统一 <code>float32 → bfloat16</code> 的舍入模式(round-to-nearest-even)</li>
</ol>
<p><strong>验证</strong>:</p>
<pre><code class="language-python"># 伪代码：基础操作一致性测试
def test_basic_ops_alignment():
    test_cases = generate_test_cases()
    for platform in [A, B, C, D, E]:
        results[platform] = run_on_platform(test_cases, platform)
    
    for i, case in enumerate(test_cases):
        ref = results[D][i]  # 以 Device D 为基准
        for platform in [A, B, C, E]:
            assert abs(results[platform][i] - ref) &lt; 1e-6
</code></pre>
<h3 id="2-3-layer-2-szcdq">2.3 Layer 2: 算子层对齐</h3>
<p><strong>目标</strong>: 确保核心深度学习算子的输出在可接受误差范围内一致。</p>
<p><strong>关键算子及其对齐策略</strong>:</p>
<h4 id="jzcf-matmul">矩阵乘法(matmul)</h4>
<p>不同硬件的 GEMM 实现可能采用不同的 tiling 策略和累加顺序，导致 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 量级的差异。</p>
<p><strong>对齐方法</strong>:</p>
<ul>
<li>强制使用相同的分块大小(tile size)</li>
<li>统一累加顺序(从左到右，从上到下)</li>
<li>对于 FP16/BF16，在累加时使用 FP32 中间结果</li>
</ul>
<h4 id="softmax">Softmax</h4>
<p>Softmax 的数值稳定性高度依赖 <code>max(x)</code> 的计算：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>softmax</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>=</mo><mfrac><msup><mi>e</mi><mrow><msub><mi>x</mi><mi>i</mi></msub><mo>−</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow></msup><mrow><munder><mo>∑</mo><mi>j</mi></munder><msup><mi>e</mi><mrow><msub><mi>x</mi><mi>j</mi></msub><mo>−</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow></msup></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{softmax}(x_i) = \\frac{e^{x_i - \\max(x)}}{\\sum_j e^{x_j - \\max(x)}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7209em;vertical-align:-1.1559em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.565em;"><span style="top:-2.2799em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4358em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8301em;"><span style="top:-3.0051em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mbin mtight">−</span><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">)</span></span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mbin mtight">−</span><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">)</span></span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1559em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>如果两个平台计算的 <code>max(x)</code> 有微小差异(如 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>)，在指数放大后可能导致显著差异。</p>
<p><strong>对齐方法</strong>:</p>
<ul>
<li>显式指定 <code>max</code> 的约简算法(tree reduction vs sequential)</li>
<li>对 online softmax 算法进行标准化</li>
</ul>
<h4 id="all-to-all-moe-hxtx">All-to-All(MoE 核心通信)</h4>
<p>All-to-All 是 MoE 训练中最复杂的通信模式。不同硬件厂商的 NCCL 实现对数据切分和传输顺序的处理可能不同。</p>
<p><strong>对齐方法</strong>:</p>
<ul>
<li>使用自定义 All-to-All 实现，替代厂商提供的版本</li>
<li>明确指定数据切分维度(按 token 维度 vs 按 expert 维度)</li>
<li>统一通信缓冲区的内存对齐要求</li>
</ul>
<h3 id="2-4-layer-3-kjcdq">2.4 Layer 3: 框架层对齐</h3>
<p><strong>目标</strong>: 确保整个训练框架(Megatron/DeepSpeed)在不同平台上产生一致的损失曲线。</p>
<p><strong>关键模块</strong>:</p>
<h4 id="attention-mk">Attention 模块</h4>
<p>不同平台对 Flash Attention 的实现可能有差异，特别是在：</p>
<ul>
<li>online softmax 的累积策略</li>
<li>block size 的选择</li>
<li>causal mask 的处理</li>
</ul>
<p><strong>对齐方法</strong>:</p>
<ul>
<li>使用统一的 Flash Attention 内核(如 Triton 实现)</li>
<li>对非 Flash Attention 路径(fallback)也进行对齐验证</li>
</ul>
<h4 id="moe-router">MoE Router</h4>
<p>Router 的 Top-K 选择和负载均衡是 MoE 训练中最敏感的部分。</p>
<p><strong>对齐方法</strong>:</p>
<ul>
<li>统一 Top-K 选择算法(stable sort vs unstable sort)</li>
<li>对负载均衡损失的计算进行精度控制</li>
<li>验证专家并行的 all-to-all 通信一致性</li>
</ul>
<h4 id="loss-js">Loss 计算</h4>
<p>总损失 = 语言模型损失 + 负载均衡损失 + z-loss</p>
<p><strong>对齐方法</strong>:</p>
<ul>
<li>每个损失组件单独对齐</li>
<li>验证损失组合时的数值稳定性</li>
<li>确保梯度裁剪的阈值和方式一致</li>
</ul>
<hr>
<h2 id="3-fxcbdtstz">3. 反向传播的特殊挑战</h2>
<h3 id="3-1-router-tdcb">3.1 Router 梯度传播</h3>
<p>Router 的梯度传播是跨平台对齐中最容易出问题的环节：</p>
<p><strong>前向传播</strong>:</p>
<pre><code>input → linear → softmax → topk → expert_output → sum → output
</code></pre>
<p><strong>反向传播</strong>:</p>
<pre><code>output_grad → sum_grad → expert_grad → router_grad → linear_grad
</code></pre>
<p><strong>问题点</strong>:</p>
<ol>
<li><strong>Top-K 的梯度</strong>: 不同平台对非选中专家的梯度处理可能不同(零梯度 vs 停止梯度)</li>
<li><strong>Softmax 的数值稳定性</strong>: 在梯度回传时，softmax 的输入可能包含极大/极小值</li>
<li><strong>All-to-All 的梯度</strong>: 反向的 all-to-all 必须与正向的切分方式完全镜像</li>
</ol>
<p><strong>解决方案</strong>:</p>
<ul>
<li>对 router 的每个操作单独编写自定义梯度函数</li>
<li>使用双精度(FP64)验证单精度(FP16/BF16)的梯度计算</li>
<li>在框架层注入梯度检查点，逐层对比梯度值</li>
</ul>
<h3 id="3-2-jdljdlhfx">3.2 精度累积的量化分析</h3>
<p>假设每步训练的相对误差为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi></mrow><annotation encoding="application/x-tex">\\epsilon</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span></span></span></span>，训练 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 步后的总误差可以用随机游走模型近似：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Total Drift</mtext><mo>≈</mo><mi>ϵ</mi><mo>⋅</mo><msqrt><mi>N</mi></msqrt></mrow><annotation encoding="application/x-tex">\\text{Total Drift} \\approx \\epsilon \\cdot \\sqrt{N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Total Drift</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.0645em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9755em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span><span style="top:-2.9355em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.0645em;"><span></span></span></span></span></span></span></span></span></span><p>对于 Ling-Plus 的训练：</p>
<ul>
<li>每步误差 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi><mo>≈</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\epsilon \\approx 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4831em;"></span><span class="mord mathnormal">ϵ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>(BF16 精度)</li>
<li>总步数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>≈</mo><msup><mn>10</mn><mn>6</mn></msup></mrow><annotation encoding="application/x-tex">N \\approx 10^6</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span>(9T token / 9K batch size)</li>
<li>理论漂移 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>≈</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup><mo>⋅</mo><msqrt><msup><mn>10</mn><mn>6</mn></msup></msqrt><mo>=</mo><mn>0.1</mn></mrow><annotation encoding="application/x-tex">\\approx 10^{-4} \\cdot \\sqrt{10^6} = 0.1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4831em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.0849em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9551em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7401em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span><span style="top:-2.9151em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.0849em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.1</span></span></span></span></li>
</ul>
<p>这与实际观察到的 0.1-0.3 损失差异吻合。</p>
<p><strong>缓解策略</strong>:</p>
<ul>
<li>降低每步误差(使用 FP32 累积、更稳定的算法)</li>
<li>定期同步(如每 100 步进行一次全量同步)</li>
<li>损失对齐监控(实时对比不同平台的损失曲线)</li>
</ul>
<hr>
<h2 id="4-gjylc">4. 工具与流程</h2>
<h3 id="4-1-xpu-timer-zdqzdyy">4.1 XPUTimer 在对齐中的应用</h3>
<p>XPUTimer 不仅用于性能分析，也是跨平台对齐的重要工具：</p>
<p><strong>功能 1: 算子级对比</strong></p>
<pre><code class="language-python"># 在每个关键算子前后插入探针
@xputimer.trace(&quot;matmul&quot;)
def aligned_matmul(a, b):
    return torch.matmul(a, b)
</code></pre>
<p><strong>功能 2: 梯度级对比</strong></p>
<pre><code class="language-python"># 在反向传播关键节点对比梯度
if step % 100 == 0:
    compare_gradients(platform_a, platform_b, tolerance=1e-3)
</code></pre>
<p><strong>功能 3: 自动异常检测</strong></p>
<ul>
<li>当某平台的损失与其他平台偏差超过阈值时自动报警</li>
<li>定位到具体的算子或层</li>
</ul>
<h3 id="4-2-dqyzlc">4.2 对齐验证流程</h3>
<pre><code>阶段 1: 单元测试对齐
    ├─ 每个算子单独测试
    ├─ 输入：固定随机种子生成的张量
    └─ 通过标准：所有平台输出差异 &lt; 1e-4

阶段 2: 模块级对齐
    ├─ Attention / MLP / Router 分别测试
    ├─ 输入：真实训练数据的前 100 个 batch
    └─ 通过标准：隐藏状态差异 &lt; 1e-3

阶段 3: 完整前向对齐
    ├─ 整个模型前向传播
    ├─ 输入：真实训练数据
    └─ 通过标准：损失差异 &lt; 1e-2

阶段 4: 完整反向对齐
    ├─ 前向 + 反向传播
    ├─ 对比梯度值
    └─ 通过标准：梯度相对差异 &lt; 5%

阶段 5: 小规模训练对齐
    ├─ 用 1B 模型训练 1K 步
    ├─ 对比损失曲线
    └─ 通过标准：损失曲线形状一致，最终值差异 &lt; 0.05

阶段 6: 大规模训练监控
    ├─ 全量 290B 模型训练
    ├─ 实时监控多平台损失
    └─ 通过标准：损失漂移 &lt; 0.1
</code></pre>
<h3 id="4-3-wtdwal">4.3 问题定位案例</h3>
<p><strong>案例</strong>: Device A 上的损失在 50K 步后比 Device D 高 0.15</p>
<p><strong>排查过程</strong>:</p>
<ol>
<li>检查基础操作 → 通过</li>
<li>检查算子层 → 发现 Flash Attention 的 online softmax 实现不同</li>
<li>具体差异: Device A 使用 tree reduction 求 max，Device D 使用 sequential</li>
<li>修复: 统一使用 sequential reduction</li>
<li>验证: 重新训练 10K 步，损失差异缩小到 0.02</li>
</ol>
<hr>
<h2 id="5-jyjxyzjsj">5. 经验教训与最佳实践</h2>
<h3 id="5-1-bxzdds">5.1 必须做对的事</h3>
<ol>
<li><strong>不要信任厂商的&quot;标准实现&quot;</strong>: 即使两个平台都声称遵循同一标准(如 CUDA)，底层实现细节仍可能有差异</li>
<li><strong>从第一天就开始对齐</strong>: 不要先在一个平台上训练，再试图迁移到另一个平台</li>
<li><strong>自动化一切</strong>: 手动对比不可扩展，所有对齐检查必须自动化</li>
<li><strong>监控比修复更重要</strong>: 建立实时监控系统，在漂移发生的早期就发现并干预</li>
</ol>
<h3 id="5-2-cjdk">5.2 常见的坑</h3>
<table>
<thead>
<tr>
<th>坑</th>
<th>表现</th>
<th>解决方案</th>
</tr>
</thead>
<tbody><tr>
<td>RNG 不一致</td>
<td>数据增强/ dropout 结果不同</td>
<td>统一 RNG 实现和种子</td>
</tr>
<tr>
<td>求和顺序不同</td>
<td>大规模张量求和结果差异</td>
<td>使用 Kahan 求和或 FP32 累积</td>
</tr>
<tr>
<td>Softmax 数值稳定性</td>
<td>极大/极小输入时输出差异</td>
<td>统一 online softmax 算法</td>
</tr>
<tr>
<td>Top-K 稳定性</td>
<td>相等元素的选择顺序不同</td>
<td>使用 stable sort</td>
</tr>
<tr>
<td>通信切分不同</td>
<td>All-to-All 后张量布局不同</td>
<td>明确指定切分维度和顺序</td>
</tr>
<tr>
<td>梯度裁剪阈值</td>
<td>不同平台的 inf/nan 处理不同</td>
<td>统一异常值检测逻辑</td>
</tr>
</tbody></table>
<h3 id="5-3-dyjdqs">5.3 对业界的启示</h3>
<p><strong>对于拥有异构硬件的团队</strong>:</p>
<ul>
<li>Ling 的对齐方法论可以直接复用</li>
<li>建议投资自动化对齐工具(如 XPUTimer 的跨平台对比模式)</li>
<li>优先对齐 Router 和 Attention 模块</li>
</ul>
<p><strong>对于只有同构硬件的团队</strong>:</p>
<ul>
<li>仍然建议进行基础的对齐验证(如不同 CUDA 版本的兼容性)</li>
<li>在云环境中(如 AWS spot instance)，硬件可能随时变化，对齐策略同样适用</li>
</ul>
<p><strong>对于国产芯片厂商</strong>:</p>
<ul>
<li>跨平台对齐的最大痛点往往是软件栈不成熟</li>
<li>建议提供与 NVIDIA 的比特级对比工具</li>
<li>开源社区需要更多跨平台训练的成功案例</li>
</ul>
<hr>
<h2 id="6-zj">6. 总结</h2>
<p>Ling-Plus 在 5 种异构硬件上成功训练 290B MoE 模型，是跨平台训练对齐的一个里程碑式实践。其核心经验：</p>
<ol>
<li><strong>三层对齐框架</strong>(基础操作 → 算子 → 框架)是系统化的解决思路</li>
<li><strong>Router 梯度传播</strong>是反向传播中最容易出问题的环节</li>
<li><strong>精度累积效应</strong>不可忽视，每步 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 的误差在百万步后会放大到 0.1+</li>
<li><strong>自动化工具</strong>(XPUTimer)是规模化对齐的关键</li>
<li><strong>实时监控</strong>比事后修复更有效</li>
</ol>
<p>这套方法论不仅适用于 Ling-Plus 的特定环境，对于任何需要在多平台、多云、多代硬件上训练大模型的团队都有重要参考价值。</p>
<hr>
<p><strong>延伸阅读</strong>:</p>
<ul>
<li>Ling Technical Report, Section 6.2: Cross-Platform Alignment</li>
<li>DLRover: <a href="https://github.com/intelligent-machine-learning/dlrover">https://github.com/intelligent-machine-learning/dlrover</a></li>
<li>NVIDIA NCCL Tests: <a href="https://github.com/NVIDIA/nccl-tests">https://github.com/NVIDIA/nccl-tests</a></li>
<li>&quot;Reproducibility in Deep Learning&quot;: <a href="https://arxiv.org/abs/2206.13998">https://arxiv.org/abs/2206.13998</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj","text":"1. 问题背景"},{"level":3,"id":"1-1-wsmykptxl","text":"1.1 为什么要跨平台训练"},{"level":3,"id":"1-2-kptxldhxtz","text":"1.2 跨平台训练的核心挑战"},{"level":2,"id":"2-dqffl","text":"2. 对齐方法论"},{"level":3,"id":"2-1-scdqkj","text":"2.1 三层对齐框架"},{"level":3,"id":"2-2-layer-1-jcczdq","text":"2.2 Layer 1: 基础操作对齐"},{"level":3,"id":"2-3-layer-2-szcdq","text":"2.3 Layer 2: 算子层对齐"},{"level":4,"id":"jzcf-matmul","text":"矩阵乘法(matmul)"},{"level":4,"id":"softmax","text":"Softmax"},{"level":4,"id":"all-to-all-moe-hxtx","text":"All-to-All(MoE 核心通信)"},{"level":3,"id":"2-4-layer-3-kjcdq","text":"2.4 Layer 3: 框架层对齐"},{"level":4,"id":"attention-mk","text":"Attention 模块"},{"level":4,"id":"moe-router","text":"MoE Router"},{"level":4,"id":"loss-js","text":"Loss 计算"},{"level":2,"id":"3-fxcbdtstz","text":"3. 反向传播的特殊挑战"},{"level":3,"id":"3-1-router-tdcb","text":"3.1 Router 梯度传播"},{"level":3,"id":"3-2-jdljdlhfx","text":"3.2 精度累积的量化分析"},{"level":2,"id":"4-gjylc","text":"4. 工具与流程"},{"level":3,"id":"4-1-xpu-timer-zdqzdyy","text":"4.1 XPUTimer 在对齐中的应用"},{"level":3,"id":"4-2-dqyzlc","text":"4.2 对齐验证流程"},{"level":3,"id":"4-3-wtdwal","text":"4.3 问题定位案例"},{"level":2,"id":"5-jyjxyzjsj","text":"5. 经验教训与最佳实践"},{"level":3,"id":"5-1-bxzdds","text":"5.1 必须做对的事"},{"level":3,"id":"5-2-cjdk","text":"5.2 常见的坑"},{"level":3,"id":"5-3-dyjdqs","text":"5.3 对业界的启示"},{"level":2,"id":"6-zj","text":"6. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.16-ling/02-ling-plus/05-ling-plus-kptxldq" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.16-ling/02-ling-plus/05-ling-plus-kptxldq" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">跨平台训练对齐：在 5 种异构硬件上训练 290B MoE 的工程实践</h1>
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
