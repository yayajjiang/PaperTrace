"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2.3.1 · 硬件高效注意力</h1>
<h2 id="1-yjgzdszyj">1. 硬件感知的算子演进</h2>
<p>在将 Transformer 机制扩展到大上下文(Long Context)的过程中, 最致命的阻碍往往不是算法本身的数学表达, 而是<strong>中间张量的访存与搬运延迟(Memory Bound)</strong>. </p>
<p>本专题聚焦于不改动标准注意力数学机制, 完全在底层硬件执行层面重构数据流的极致优化技术. 以 FlashAttention 系列与 PagedAttention (vLLM) 为主干, 构建了一套完整的硬件高效计算理论. </p>
<hr>
<h2 id="2-zsjgybzml">2. 知识结构与本章目录</h2>
<h3 id="2-1-flash-attention-jzzl">2.1 FlashAttention 家族专栏</h3>
<p>针对稠密自注意力, 我们拆解为 6 篇相互咬合, 深度极强的专题文章, 从零推导 Online Softmax 乃至最新 Blackwell 架构的物理终结: </p>
<ol>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/01-flash-attention/01-flash-attention">01-FlashAttention 家族全景图</a></strong>: FlashAttention 家族演进全谱, 内存墙背景与 GPU 物理存储层次鸿沟. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/01-flash-attention/02-flash-attention-v1">02-FlashAttention-v1 核心推导</a></strong>: Online Softmax 数学递推公式的极详尽手写证明, SRAM 容量约束与反向传播的<strong>重计算</strong>机制. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/01-flash-attention/03-flash-attention-v2">03-FlashAttention-v2 执行优化</a></strong>: 循环顺序交换(KV外循环), 非 Matmul 算子标度压缩消除, 以及 Warp 级别零同步调度. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/01-flash-attention/04-flash-attention-v3">04-FlashAttention-v3 压榨 Hopper</a></strong>: 专为 H100/SM90 硬件设计的 TMA 硬件异步加载, WGMMA 协同矩阵乘以及 <strong>FP8 块级量化(Block-wise Scaling)</strong>. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/01-flash-attention/05-flash-attention-v4">05-FlashAttention-4 终结 Blackwell 瓶颈</a></strong>: 剖析 2025/2026 年 Blackwell 架构的物理限制, 通过软件多项式逼近模拟指数(消除 SFU 瓶颈)以及 CuTe-DSL 元描述. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/01-flash-attention/06-flash-attention-triton-sx">06-FlashAttention Triton 源码剖析</a></strong>: Triton 算子开发实战, 网格计算映射, 寄存器动态标度更新逻辑.</li>
</ol>
<hr>
<h3 id="2-2-xnncyds-kv-gxzt">2.2 虚拟内存与低损 KV 共享专题</h3>
<ol>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/02-paged-attention/01-paged-attention-y-vllm">02-PagedAttention 与 vLLM: 分页内存终结 KV Cache 碎片</a></strong>: 引入操作系统虚拟内存思想管理 KV Cache, Continuous Batching, Copy-on-Write 以及推理吞吐性能分析. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/03-gqa-y-mqa/01-gqa-y-mqa-ymsxfx">03-GQA 与 MQA: 多头注意力的高效变体与源码实现</a></strong>: 低损 KV 共享机制, 计算与参数开销推导, 以及 PyTorch/CUDA 源码级对照. </li>
<li><strong><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/04-attention-sxfsdb/01-attention-sxfsqjdb">04-Attention 实现方式全景对比: 手动实现, Triton 与 FlashAttention</a></strong>: 手动 PyTorch/CUDA 实现与 FlashAttention 算子算术强度, 访存开销, Roofline 跑分深度测评.</li>
</ol>
<hr>
<h2 id="3-wsm-yjgx-bskxx-eszylsddssx">3. 为什么“硬件高效”不是可选项, 而是注意力时代的生死线</h2>
<p>在理论课程里, 标准注意力通常写作：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>这个公式非常简洁, 也很优雅. 但一旦你把它放进真实 GPU, 问题会立刻爆炸. 真正难的从来不是公式本身, 而是：</p>
<ul>
<li>你是否真的要把整个 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><annotation encoding="application/x-tex">QK^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span> 显式写回显存  </li>
<li>softmax 的中间统计量是否必须完整保存  </li>
<li>V 聚合前后是否会产生巨大的中间张量  </li>
<li>KV Cache 是否会把显存打碎  </li>
<li>Decode 阶段是否会被 HBM 带宽锁死</li>
</ul>
<p>所以“硬件高效注意力”的核心目标不是发明一个新的数学注意力, 而是回答同一个老问题：**怎样在不改变注意力语义的前提下, 重新组织数据流, 让 GPU 更像在做它擅长的事, 而不是在当搬运工. **</p>
<p>这件事在 2023 年前后变成了真正的生死线. 因为模型上下文从 2K、4K 一路拉到 32K、128K、1M 时, 注意力不再只是一个计算模块, 而是直接决定：</p>
<ul>
<li>训练吞吐</li>
<li>推理延迟</li>
<li>最大可支持上下文</li>
<li>并发能力</li>
<li>显存利用率</li>
</ul>
<h2 id="4-flash-attention-jjdbs-sbk-es-bbd">4. FlashAttention 解决的不是“算不快”, 而是“搬不动”</h2>
<p>FlashAttention 最常被误解的一点是：人们以为它主要是在减少 FLOPs. 其实它更核心的价值在于 <strong>减少 HBM 读写</strong>. </p>
<p>标准注意力的问题是中间矩阵太大. 你先算一遍 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><annotation encoding="application/x-tex">QK^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span>, 把它存下来; 再做 softmax, 又要读写一次; 再乘 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span>, 又要读一次. 真正慢的不是乘法本身, 而是这些巨大的中间结果来回进出显存. </p>
<p>FlashAttention 的关键洞察是：如果我们能把注意力矩阵分块, 在 SRAM / shared memory 里边算边归约边聚合, 那么很多中间张量就没必要落到 HBM.<br>这意味着：</p>
<ul>
<li>IO 大幅减少</li>
<li>算术强度提升</li>
<li>大模型在相同 GPU 上能吃到更多有效吞吐</li>
</ul>
<p>所以 FlashAttention 并不是“另一种 attention”, 它是“同样 attention 的 IO-aware 实现”. </p>
<h2 id="5-wsm-online-softmax-szgtxdhxsn">5. 为什么 Online Softmax 是整个体系的核心枢纽</h2>
<p>一旦不再显式保存完整分数矩阵, softmax 就成了最大难点. 因为普通 softmax 默认你已经拿到了完整的一整行 logits, 再统一做：</p>
<ol>
<li>求最大值  </li>
<li>减最大值  </li>
<li>求指数和  </li>
<li>再归一化</li>
</ol>
<p>但分块计算时, 你每次只看到局部块. Online Softmax 的意义就在于：它让最大值和归一化分母都能在分块扫描中递推维护, 而不必一次拿到整行. </p>
<p>没有 Online Softmax, FlashAttention 就只是一个“块状 matmul 技巧”; 有了它, 分块注意力才真正闭环成完整算子.<br>所以如果你要抓 FlashAttention 的主线, 第一关键点不是 TMA、WGMMA 或 Triton, 而是这个在线归约思想. </p>
<h2 id="6-flash-attention-v1-v2-v3-v4-dyjlj">6. FlashAttention-v1/v2/v3/v4 的演进逻辑</h2>
<p>这几代工作不是简单的版本号堆叠, 而是一条非常清晰的演化路径. </p>
<h3 id="v1">v1</h3>
<p>核心目标是证明：标准 attention 可以在不显式 materialize 中间矩阵的情况下正确计算.<br>关键词是：</p>
<ul>
<li>IO-aware</li>
<li>tiled attention</li>
<li>online softmax</li>
<li>recomputation in backward</li>
</ul>
<h3 id="v2">v2</h3>
<p>v1 证明了“能做”, v2 开始优化“怎么做得更快”.<br>关键词是：</p>
<ul>
<li>更好的并行分工</li>
<li>更少同步</li>
<li>更高 SM 利用率</li>
<li>更合理的 loop order</li>
</ul>
<h3 id="v3">v3</h3>
<p>v3 开始显著绑定 Hopper 架构特性.<br>关键词是：</p>
<ul>
<li>TMA</li>
<li>WGMMA</li>
<li>FP8 block scaling</li>
<li>更深度的 hardware co-design</li>
</ul>
<h3 id="v4">v4</h3>
<p>v4 则更像“面对 Blackwell 时代的新瓶颈继续压榨”. 它不再只是传统意义上的 kernel 优化, 而开始把：</p>
<ul>
<li>特殊函数单元瓶颈</li>
<li>DSL 元编程</li>
<li>更极致的软件模拟</li>
</ul>
<p>一起拉进来. </p>
<p>所以 FlashAttention 家族的主线, 不是“算法换代”, 而是“同一数学算子在不同硬件时代被不断重写”. </p>
<h2 id="7-paged-attention-wsms-serving-sjdlytzx">7. PagedAttention 为什么是 serving 世界的另一条主线</h2>
<p>训练和 Prefill 更多受计算形状影响, Decode 阶段则更受 KV Cache 组织方式影响. </p>
<p>随着序列越来越长、并发越来越高, KV Cache 不只是“占很多显存”, 而是会产生：</p>
<ul>
<li>空间碎片</li>
<li>预留浪费</li>
<li>批次调度困难</li>
<li>请求插队和终止后的内存洞</li>
</ul>
<p>PagedAttention 的伟大之处在于, 它没有试图改变注意力本身, 而是借用了操作系统虚拟内存思想：把 KV Cache 按页管理, 而不是按单请求连续大块管理. </p>
<p>这带来的收益非常实用：</p>
<ul>
<li>更容易做 continuous batching</li>
<li>更容易复用与释放内存</li>
<li>更少碎片</li>
<li>更高并发吞吐</li>
</ul>
<p>从服务系统角度看, PagedAttention 和 FlashAttention 是两条互补路线：</p>
<ul>
<li>FlashAttention 更偏 kernel 与算子级 IO 优化</li>
<li>PagedAttention 更偏 serving 运行时与缓存管理优化</li>
</ul>
<h2 id="8-mqa-gqa-wsmyfzyjgxzyll">8. MQA / GQA 为什么也放在硬件高效注意力里</h2>
<p>很多人会把 MQA / GQA 当作纯架构问题, 但它们之所以重要, 本质上是因为 KV Cache 是推理大头. </p>
<p>MHA 的问题在于每个 Query 头都配一组独立 Key/Value, 表达力强, 但缓存极贵.<br>MQA 走到另一个极端：所有 Query 头共享一组 KV, 缓存极省, 但表达损失更明显.<br>GQA 作为折中方案, 把 Query 头按组共享 KV, 成为工业界极受欢迎的现实路径. </p>
<p>所以把它们放进“硬件高效注意力”是合理的. 因为它们不是为了数学优雅出现的, 而是为了减少推理阶段的存储和带宽压力. </p>
<h2 id="9-wsmgxzylyhylyxxtgc">9. 为什么高效注意力优化越来越像系统工程</h2>
<p>注意力高效化走到今天, 已经很难再用“这是一篇算法论文”来概括. 它越来越像系统工程问题, 原因有三：</p>
<p>第一, 瓶颈往往不是来自公式, 而是来自存储层次.<br>第二, 性能上限越来越依赖具体 GPU 架构.<br>第三, 训练、Prefill、Decode 三个阶段的最优策略并不一样. </p>
<p>这意味着高效注意力优化天然需要跨越：</p>
<ul>
<li>数学理解</li>
<li>kernel 编写</li>
<li>并行调度</li>
<li>缓存布局</li>
<li>推理服务系统</li>
</ul>
<p>因此, 这一章不该被看作“Attention 的边缘优化”, 而应该被看作“LLM 工业化的第一现场”. </p>
<h2 id="10-bjyhxzjdgx">10. 本节与后续章节的关系</h2>
<p><code>2.3.1</code> 是整个高效注意力路线里最接近底层硬件的一支.<br>后面你会看到的很多路线：</p>
<ul>
<li>稀疏注意力</li>
<li>线性注意力</li>
<li>MLA</li>
<li>长上下文外推</li>
</ul>
<p>都在某种意义上与这里形成互补：</p>
<ul>
<li><code>2.3.1</code>：不改数学, 重写执行方式</li>
<li><code>2.3.2</code>：减少必须计算的连边</li>
<li><code>2.3.3</code>：改变注意力公式本身</li>
<li><code>2.3.5</code>：重构 KV 表示形态</li>
</ul>
<p>所以这一节真正的价值, 在于建立一个判断标准：**当你想优化注意力时, 首先应该问, 问题出在数学表达, 还是出在数据流与内存组织. **</p>
<h2 id="11-tpzwjy">11. 图片占位建议</h2>
<p>如果你后续要给这一节补图, 最值得画的是三类：</p>
<p>第一类是 <strong>标准注意力与 FlashAttention 的数据流对比图</strong>. 重点画出 HBM 和 SRAM 之间的数据来回次数差异. </p>
<p>第二类是 <strong>PagedAttention 的页式 KV Cache 布局图</strong>. 用操作系统页表类比, 非常适合帮助读者建立直觉. </p>
<p>第三类是 <strong>MHA / MQA / GQA 的 KV Cache 结构对比图</strong>. 说明共享 KV 是如何直接压缩缓存体积的. </p>
<p>可以直接给生图模型的 prompt:</p>
<pre><code class="language-text">Create a technical chapter overview figure for hardware-efficient attention in LLMs. Show three panels:
1) standard attention dataflow versus FlashAttention tiled SRAM-aware dataflow,
2) paged KV-cache layout inspired by virtual memory in PagedAttention,
3) MHA versus MQA versus GQA KV-cache sharing comparison.
Style: white background, research-paper systems diagram, blue/orange/green highlights, precise arrows, readable labels, no decorative elements.
</code></pre>
<h2 id="12-bjxj">12. 本节小结</h2>
<p>硬件高效注意力的本质, 不是发明一种全新的注意力, 而是把“同样的注意力”做成更适合现代加速器和推理系统的形态. </p>
<p>FlashAttention 证明了：只要重写 IO 路径, 就能显著提高训练与 Prefill 效率.<br>PagedAttention 证明了：只要重写 KV Cache 组织方式, 就能显著提高 Decode 并发与显存利用率.<br>MQA / GQA 则证明了：只要调整头与 KV 的共享结构, 就能用较小表达代价换到巨大的缓存收益. </p>
<p>所以这一节真正想建立的不是某个单点技巧, 而是一种工程判断力：注意力性能问题往往不是“算错了”, 而是“存错了、搬错了、组织错了”. 理解这一点, 后续整条高效注意力路线才会真正变得清晰. </p>
<h2 id="13-ytfcsydpdgs">13. 一条非常实用的判断公式</h2>
<p>如果你在真实系统里遇到注意力瓶颈, 先别急着换架构. 可以先问自己三个问题：</p>
<ol>
<li>当前瓶颈在算力还是带宽  </li>
<li>当前阶段是 Prefill 还是 Decode  </li>
<li>当前问题来自中间矩阵 materialization 还是来自 KV Cache 管理</li>
</ol>
<p>如果答案分别偏向：</p>
<ul>
<li>Prefill + 带宽 / IO -&gt; 优先看 FlashAttention 类路线</li>
<li>Decode + KV Cache -&gt; 优先看 PagedAttention、MQA、GQA、MLA</li>
<li>极长上下文 + 结构稀疏性明显 -&gt; 再考虑稀疏注意力或线性注意力</li>
</ul>
<p>很多团队会一上来就追“最前沿注意力变体”, 但真正高性价比的优化常常是先把硬件路径和缓存组织做对. </p>
<h2 id="14-wsmzjnrdgctdtbzy">14. 为什么这节内容对工程团队特别重要</h2>
<p>从研究者角度看, Attention 变体可能只是论文路线图的一部分.<br>但从工程团队角度看, <code>2.3.1</code> 几乎就是注意力系统化落地的起点. 因为你只要开始服务真实用户, 就一定会碰到：</p>
<ul>
<li>prompt 很长</li>
<li>batch 很大</li>
<li>并发很多</li>
<li>decode 很慢</li>
<li>HBM 很满</li>
</ul>
<p>这些问题不会自动因为模型“更聪明”而消失. 它们需要的是系统级答案, 而这一节正是在讲这些答案最核心的几条路线. </p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yjgzdszyj","text":"1. 硬件感知的算子演进"},{"level":2,"id":"2-zsjgybzml","text":"2. 知识结构与本章目录"},{"level":3,"id":"2-1-flash-attention-jzzl","text":"2.1 FlashAttention 家族专栏"},{"level":3,"id":"2-2-xnncyds-kv-gxzt","text":"2.2 虚拟内存与低损 KV 共享专题"},{"level":2,"id":"3-wsm-yjgx-bskxx-eszylsddssx","text":"3. 为什么“硬件高效”不是可选项, 而是注意力时代的生死线"},{"level":2,"id":"4-flash-attention-jjdbs-sbk-es-bbd","text":"4. FlashAttention 解决的不是“算不快”, 而是“搬不动”"},{"level":2,"id":"5-wsm-online-softmax-szgtxdhxsn","text":"5. 为什么 Online Softmax 是整个体系的核心枢纽"},{"level":2,"id":"6-flash-attention-v1-v2-v3-v4-dyjlj","text":"6. FlashAttention-v1/v2/v3/v4 的演进逻辑"},{"level":3,"id":"v1","text":"v1"},{"level":3,"id":"v2","text":"v2"},{"level":3,"id":"v3","text":"v3"},{"level":3,"id":"v4","text":"v4"},{"level":2,"id":"7-paged-attention-wsms-serving-sjdlytzx","text":"7. PagedAttention 为什么是 serving 世界的另一条主线"},{"level":2,"id":"8-mqa-gqa-wsmyfzyjgxzyll","text":"8. MQA / GQA 为什么也放在硬件高效注意力里"},{"level":2,"id":"9-wsmgxzylyhylyxxtgc","text":"9. 为什么高效注意力优化越来越像系统工程"},{"level":2,"id":"10-bjyhxzjdgx","text":"10. 本节与后续章节的关系"},{"level":2,"id":"11-tpzwjy","text":"11. 图片占位建议"},{"level":2,"id":"12-bjxj","text":"12. 本节小结"},{"level":2,"id":"13-ytfcsydpdgs","text":"13. 一条非常实用的判断公式"},{"level":2,"id":"14-wsmzjnrdgctdtbzy","text":"14. 为什么这节内容对工程团队特别重要"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/2.3.1-yjgxzyl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.3-efficient-attention/2.3.1-yjgxzyl/2.3.1-yjgxzyl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2.3.1-硬件高效注意力</h1>
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
