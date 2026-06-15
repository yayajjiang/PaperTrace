"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE 系统优化综述</h1>
<blockquote>
<p>本文从系统层面梳理 MoE 模型的部署与优化策略, 涵盖显存充足与受限两大场景下的并行策略、卸载策略、通信优化和计算优化. </p>
</blockquote>
<hr>
<h2 id="1-xtbsdldcj">1. 系统部署的两大场景</h2>
<h3 id="1-1-xcczcj">1.1 显存充足场景</h3>
<p><strong>专家并行(Expert Parallelism, EP)</strong> ：</p>
<ul>
<li>将专家分配到多个 GPU 上</li>
<li>每个 GPU 只存放部分专家</li>
<li>通过 All-to-All 通信将 token 发送到目标专家</li>
</ul>
<p><strong>优势</strong>：</p>
<ul>
<li>单卡显存需求降低</li>
<li>专家计算并行化</li>
</ul>
<p><strong>挑战</strong>：</p>
<ul>
<li>All-to-All 通信开销大</li>
<li>负载不均衡导致部分 GPU 空闲</li>
</ul>
<h3 id="1-2-xcsxcj">1.2 显存受限场景</h3>
<p><strong>卸载策略(Offloading)</strong> ：</p>
<ul>
<li>将不活跃专家卸载到 CPU 内存或磁盘</li>
<li>需要时动态加载到 GPU</li>
<li>适用于单卡或少量 GPU 部署</li>
</ul>
<p><strong>优势</strong>：</p>
<ul>
<li>支持超大模型在有限显存上运行</li>
<li>灵活性高</li>
</ul>
<p><strong>挑战</strong>：</p>
<ul>
<li>加载延迟高</li>
<li>需要精细的预取策略</li>
</ul>
<hr>
<h2 id="2-bhclxj">2. 并行策略详解</h2>
<h3 id="2-1-sjbh-zjbh">2.1 数据并行 + 专家并行</h3>
<p><strong>ZeRO-EP 混合</strong>：</p>
<ul>
<li>数据并行维度：复制专家参数</li>
<li>专家并行维度：分散专家到不同节点</li>
<li>梯度聚合：先在 EP 组内聚合, 再在 DP 组间聚合</li>
</ul>
<h3 id="2-2-zlbh-zjbh">2.2 张量并行 + 专家并行</h3>
<ul>
<li>Attention 层：张量并行(TP)</li>
<li>MoE 层：专家并行(EP)</li>
<li>组合：TP 处理共享参数, EP 处理专家参数</li>
</ul>
<hr>
<h2 id="3-txyh">3. 通信优化</h2>
<h3 id="3-1-all-to-all-yh">3.1 All-to-All 优化</h3>
<p><strong>问题</strong>：MoE 的 All-to-All 通信量与 batch size × 专家数量成正比. </p>
<p><strong>优化方向</strong>：</p>
<ul>
<li><strong>细粒度调度</strong>：按 expert 分组发送, 减少单次通信量</li>
<li><strong>拓扑感知</strong>：优先将 token 发送到同一节点的专家</li>
<li><strong>双缓冲</strong>：通信与计算重叠</li>
</ul>
<h3 id="3-2-tx-jszd">3.2 通信-计算重叠</h3>
<p><strong>核心思想</strong>：在通信的同时进行其他计算. </p>
<p>实现方式：</p>
<ol>
<li>预取下一 batch 需要的专家权重</li>
<li>在 All-to-All 通信时计算非 MoE 层</li>
<li>流水线并行：前向传播与反向传播重叠</li>
</ol>
<hr>
<h2 id="4-jsyh">4. 计算优化</h2>
<h3 id="4-1-zjjsyh">4.1 专家计算优化</h3>
<p><strong>Group GEMM</strong>：</p>
<ul>
<li>不同专家的输入拼接成一个大矩阵</li>
<li>一次性执行矩阵乘法</li>
<li>减少 kernel 启动开销</li>
</ul>
<p><strong>动态批处理</strong>：</p>
<ul>
<li>根据实际激活的专家动态调整 batch size</li>
<li>避免为未激活专家分配计算资源</li>
</ul>
<h3 id="4-2-fzjh">4.2 负载均衡</h3>
<p><strong>问题</strong>：某些专家被频繁激活, 成为瓶颈. </p>
<p><strong>解决方案</strong>：</p>
<ul>
<li><strong>辅助损失</strong>：在训练时加入负载均衡损失</li>
<li><strong>容量因子</strong>：限制每个专家处理的 token 数量</li>
<li><strong>随机路由</strong>：添加随机噪声打破平局</li>
</ul>
<hr>
<h2 id="5-fcyh">5. 访存优化</h2>
<h3 id="5-1-zjqzgl">5.1 专家权重管理</h3>
<p><strong>按需加载</strong>：</p>
<ul>
<li>只加载当前 step 需要的专家</li>
<li>使用 LRU 缓存管理专家权重</li>
</ul>
<p><strong>权重共享</strong>：</p>
<ul>
<li>多个专家共享部分参数</li>
<li>减少总参数量和访存量</li>
</ul>
<h3 id="5-2-jhzyh">5.2 激活值优化</h3>
<p><strong>选择性重计算</strong>：</p>
<ul>
<li>重计算注意力输出, 释放 KV Cache</li>
<li>以计算换显存</li>
</ul>
<p><strong>激活值压缩</strong>：</p>
<ul>
<li>使用 FP8/BF16 存储激活值</li>
<li>降低显存占用</li>
</ul>
<hr>
<h2 id="6-zj">6. 总结</h2>
<p>MoE 系统优化的核心矛盾：<strong>稀疏激活的灵活性 vs 硬件的并行性要求</strong>. </p>
<table>
<thead>
<tr>
<th align="left">优化维度</th>
<th align="left">关键技术</th>
<th align="left">目标</th>
</tr>
</thead>
<tbody><tr>
<td align="left">并行</td>
<td align="left">EP + TP + PP</td>
<td align="left">扩展性</td>
</tr>
<tr>
<td align="left">通信</td>
<td align="left">All-to-All 优化 + 重叠</td>
<td align="left">降低延迟</td>
</tr>
<tr>
<td align="left">计算</td>
<td align="left">Group GEMM + 动态批处理</td>
<td align="left">提升吞吐</td>
</tr>
<tr>
<td align="left">访存</td>
<td align="left">按需加载 + 选择性重计算</td>
<td align="left">节省显存</td>
</tr>
<tr>
<td align="left">负载</td>
<td align="left">辅助损失 + 容量因子</td>
<td align="left">均衡负载</td>
</tr>
</tbody></table>
<h2 id="7-sonic-mo-e-io-y-tile-gzdjzyh">7. SonicMoE：IO 与 Tile 感知的极致优化</h2>
<h3 id="7-1-hxgc">7.1 核心观察</h3>
<p>SonicMoE 提出三个关键观察：</p>
<ol>
<li><strong>细粒度 MoE 需要更大的激活内存</strong>：激活大小与激活的专家数量呈线性关系</li>
<li><strong>计算强度降低, IO 成本增加</strong>：细粒度和高稀疏性使 MoE 更趋向内存密集型</li>
<li><strong>Grouped GEMM 分块量化效应</strong>：高度稀疏时, 固定 Tile 大小导致计算资源浪费</li>
</ol>
<h3 id="7-2-jhncyh">7.2 激活内存优化</h3>
<p><strong>目标</strong>：在不增加 FLOPs 的情况下, 以尽可能小的激活内存占用实现 MoE 训练. </p>
<p>MoE 总 FLOPs 为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>6</mn><mo>+</mo><mn>12</mn><mo stretchy="false">)</mo><mo>⋅</mo><mi>T</mi><mo>⋅</mo><mi>n</mi><mo>⋅</mo><mi>K</mi><mo>⋅</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">(6+12) \\cdot T \\cdot n \\cdot K \\cdot d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">12</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span>. 为了保持总计算量不变, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mo>⋅</mo><mi>K</mi></mrow><annotation encoding="application/x-tex">n \\cdot K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 必须是常数——增加专家数量就必须减少每个专家的容量. </p>
<p>标准实现中, 反向传播需要缓存中间激活(尺寸 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>⋅</mo><mi>K</mi><mo>⋅</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">T \\cdot K \\cdot d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span>), 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 增加时内存线性增长. </p>
<p><strong>SonicMoE 的三项技术</strong>：</p>
<ol>
<li><strong>识别并避免缓存巨型激活</strong>：反向传播不依赖存储在 HBM 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>X</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">X_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Y</mi></mrow><annotation encoding="application/x-tex">Y</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span></span></span></span></li>
<li><strong>Operator Fusion 消除中间产物</strong>：将 HBM load 和 Gather 融合成一个 Kernel, 不显式构建 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>X</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">X_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></li>
<li><strong>数学等价替换绕开依赖</strong>：通过 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>S</mi><mo>=</mo><mo stretchy="false">⟨</mo><mi>d</mi><mi>A</mi><mo separator="true">,</mo><msup><mi>A</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo stretchy="false">⟩</mo></mrow><annotation encoding="application/x-tex">dS = \\langle dA, A&#x27; \\rangle</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0019em;vertical-align:-0.25em;"></span><span class="mopen">⟨</span><span class="mord mathnormal">d</span><span class="mord mathnormal">A</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mclose">⟩</span></span></span></span> 路径计算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>S</mi></mrow><annotation encoding="application/x-tex">dS</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span>, 无需存储 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Y</mi></mrow><annotation encoding="application/x-tex">Y</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span></span></span></span></li>
</ol>
<h3 id="7-3-szrh">7.3 算子融合</h3>
<p><strong>Gather 与 HBM Load 融合</strong>：</p>
<ul>
<li>通过 <code>cp.async</code> 指令异步加载 token index 对应的内容到 SMEM</li>
<li>支持 contiguously-packed 或非连续输入</li>
<li>通过 prefetch 和 producer 协同获取优化同步索引</li>
</ul>
<p><strong>Epilogue 融合</strong>：</p>
<ul>
<li>前向传播：在 GEMM Epilogue 后直接在寄存器中做 SwiGLU 计算</li>
<li>反向传播：将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>H</mi></mrow><annotation encoding="application/x-tex">dH</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span>、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>S</mi></mrow><annotation encoding="application/x-tex">dS</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span></span></span></span>、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mtext>SwiGLU</mtext></mrow><annotation encoding="application/x-tex">d\\text{SwiGLU}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mord text"><span class="mord">SwiGLU</span></span></span></span></span> 三个关键梯度计算融合到一个 Kernel</li>
</ul>
<h3 id="7-4-jsy-io-zdyh">7.4 计算与 IO 重叠优化</h3>
<p><strong>Hopper GPUs 上的 PingPong Warpgroup 调度</strong>：</p>
<ul>
<li>计算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>H</mi></mrow><annotation encoding="application/x-tex">dH</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> Epilogue 时的 TMA load 与其他操作并行</li>
<li>前向 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Y</mi></mrow><annotation encoding="application/x-tex">Y</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span></span></span></span> 计算与反向 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>X</mi><mo>~</mo></mover></mrow><annotation encoding="application/x-tex">\\tilde{X}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9202em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">~</span></span></span></span></span></span></span></span></span></span> 的 TMA store：先用 TMA 将结果连续存储到 HBM 临时区域, 再启动独立 Kernel 完成 Scatter</li>
<li>避免融合 Scatter-Store 对主 GEMM 的阻塞</li>
</ul>
<h3 id="7-5-top-k-px-kernel-sj">7.5 Top-K 排序 Kernel 设计</h3>
<p><strong>问题</strong>：PyTorch 的 <code>torch.topk</code> 占据路由计算时间的 40%. </p>
<p><strong>解决方案</strong>：</p>
<ul>
<li>设计适用于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>≤</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">E \\leq 4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8193em;vertical-align:-0.136em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi><mo>≤</mo><mn>16</mn></mrow><annotation encoding="application/x-tex">K \\leq 16</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8193em;vertical-align:-0.136em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">16</span></span></span></span> 的专用内核</li>
<li>使用<strong>双调排序(Bitonic Sort)</strong> 作为核心算法</li>
<li>打包索引保证排序稳定性</li>
<li>利用寄存器和 Warp-Shuffle 提升内存效率</li>
</ul>
<h3 id="7-6-token-srsf">7.6 Token 舍入算法</h3>
<p><strong>问题</strong>：训练非常稀疏的 MoE 时, 每个专家分配的 token 数量变少, 无法被 Tile 大小整除, 造成填充浪费. </p>
<p><strong>Token Rounding Routing</strong>：</p>
<ol>
<li>计算初始分配和候选池：执行标准 Top-K 路由, 对每个专家的所有 token 路由得分排序</li>
<li>舍入决策与执行：就近舍入到最接近 Tile 大小的倍数, 向上或向下调整分配</li>
</ol>
<h3 id="7-7-syjg">7.7 实验结果</h3>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">SonicMoE vs ScatterMoE</th>
<th align="left">SonicMoE vs MoMoE</th>
</tr>
</thead>
<tbody><tr>
<td align="left">峰值内存(7B, n=256)</td>
<td align="left">-45%</td>
<td align="left">更显著</td>
</tr>
<tr>
<td align="left">TFLOPs(1.4B/7B)</td>
<td align="left">+40%</td>
<td align="left">+40%</td>
</tr>
<tr>
<td align="left">正向传播吞吐量</td>
<td align="left">&gt;500 TFLOPs</td>
<td align="left">远超 baseline</td>
</tr>
</tbody></table>
<blockquote>
<p>参考来源：<a href="https://zhuanlan.zhihu.com/p/1952413528670607319">MoE 研究进展：算法、系统与架构综述(三)-系统篇</a>
补充来源：<a href="https://zhuanlan.zhihu.com/p/1987208541124202922">MoE 笔记：从数学推导到 SonicMoE 的极致优化</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-xtbsdldcj","text":"1. 系统部署的两大场景"},{"level":3,"id":"1-1-xcczcj","text":"1.1 显存充足场景"},{"level":3,"id":"1-2-xcsxcj","text":"1.2 显存受限场景"},{"level":2,"id":"2-bhclxj","text":"2. 并行策略详解"},{"level":3,"id":"2-1-sjbh-zjbh","text":"2.1 数据并行 + 专家并行"},{"level":3,"id":"2-2-zlbh-zjbh","text":"2.2 张量并行 + 专家并行"},{"level":2,"id":"3-txyh","text":"3. 通信优化"},{"level":3,"id":"3-1-all-to-all-yh","text":"3.1 All-to-All 优化"},{"level":3,"id":"3-2-tx-jszd","text":"3.2 通信-计算重叠"},{"level":2,"id":"4-jsyh","text":"4. 计算优化"},{"level":3,"id":"4-1-zjjsyh","text":"4.1 专家计算优化"},{"level":3,"id":"4-2-fzjh","text":"4.2 负载均衡"},{"level":2,"id":"5-fcyh","text":"5. 访存优化"},{"level":3,"id":"5-1-zjqzgl","text":"5.1 专家权重管理"},{"level":3,"id":"5-2-jhzyh","text":"5.2 激活值优化"},{"level":2,"id":"6-zj","text":"6. 总结"},{"level":2,"id":"7-sonic-mo-e-io-y-tile-gzdjzyh","text":"7. SonicMoE：IO 与 Tile 感知的极致优化"},{"level":3,"id":"7-1-hxgc","text":"7.1 核心观察"},{"level":3,"id":"7-2-jhncyh","text":"7.2 激活内存优化"},{"level":3,"id":"7-3-szrh","text":"7.3 算子融合"},{"level":3,"id":"7-4-jsy-io-zdyh","text":"7.4 计算与 IO 重叠优化"},{"level":3,"id":"7-5-top-k-px-kernel-sj","text":"7.5 Top-K 排序 Kernel 设计"},{"level":3,"id":"7-6-token-srsf","text":"7.6 Token 舍入算法"},{"level":3,"id":"7-7-syjg","text":"7.7 实验结果"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/08-moe-xtyhzs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/08-moe-xtyhzs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE 系统优化综述</h1>
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
