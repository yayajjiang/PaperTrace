"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2.2 · 基础注意力机制</h1>
<h2 id="1-zjdw">1. 章节定位</h2>
<p>注意力机制(Attention Mechanism)是 Transformer 架构的数学心脏，也是大语言模型一切能力的计算原点. 本章从第一性原理出发，完整推导自注意力机制的概率解释、多头注意力的并行化设计，以及MLA(Multi-head Latent Attention)等现代变体如何在保持表达能力的同时将 KV Cache 压缩到极致.</p>
<p>理解本章，是阅读后续所有高效注意力优化(FlashAttention、稀疏注意力、线性注意力)的<strong>必要前置</strong>. 如果注意力机制的计算图在你脑中还不够清晰，后续章节中的内存优化策略和并行策略都将沦为死记硬背的口诀.</p>
<hr>
<h2 id="2-bznrsy">2. 本章内容索引</h2>
<table>
<thead>
<tr>
<th>编号</th>
<th>文章</th>
<th>核心内容</th>
<th>难度</th>
</tr>
</thead>
<tbody><tr>
<td>2.2.1</td>
<td><a href="/llm-guide/2-arch/2.2-attention/2.2.1-zzyljz/2.2.1-zzyljz">自注意力机制</a></td>
<td>Q/K/V 的数学定义、Scaled Dot-Product、Softmax 的概率解释、注意力权重的物理意义</td>
<td>⭐⭐</td>
</tr>
<tr>
<td>2.2.2</td>
<td><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/2.2.2-dtzylbt">多头注意力变体</a></td>
<td>MHA → MQA → GQA → MLA（含吸收双版本）的演进家谱、KV Cache 压缩</td>
<td>⭐⭐⭐</td>
</tr>
</tbody></table>
<hr>
<h2 id="3-ydlxjy">3. 阅读路线建议</h2>
<p><strong>初学者</strong>：先读 2.2.1 建立注意力机制的完整计算图，再读 2.2.2 了解多头设计如何扩展表达空间.</p>
<p><strong>进阶读者</strong>：读完 2.2.2 前四篇后，<strong>必读</strong> <a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/05-mla-jzxsyfxssbb/05-mla-jzxsyfxssbb">05 MLA 矩阵吸收与非吸收双版本</a>，理解 Prefill/Decode 如何切换 MHA/MQA mode。稀疏与 1M 上下文见 <a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/07-csa-hca-hhyszyl/07-csa-hca-hhyszyl">2.3.2 CSA-HCA</a>。</p>
<p><strong>家谱提示</strong>：2.2 的所有内容都是 2.3(高效注意力优化)和 2.5(长上下文外推)的数学基础. 如果你在阅读 2.3 的 FlashAttention 时感到困惑，回到 2.2.1 重新建立注意力计算的逐元素印象.</p>
<hr>
<h2 id="4-wsmzyljzcw-transformer-dhx">4. 为什么注意力机制成为 Transformer 的核心</h2>
<p>在 Transformer 出现之前，序列模型的主流路线一直是“递归地处理时间”. 无论是 RNN、GRU 还是 LSTM，本质上都要求模型按照时间步逐个更新状态. 这样的设计在短序列上仍然可用，但在长序列上会同时遭遇两个问题：</p>
<ol>
<li>训练并行性差</li>
<li>长程依赖路径太长</li>
</ol>
<p>注意力机制的突破在于，它彻底放弃了“必须按时间顺序一格一格传递信息”的假设. 相反，它把一个 token 对所有其他 token 的依赖统一放进一个匹配矩阵里，一次性并行计算.</p>
<p>这带来的结果是双重的：</p>
<ul>
<li>从建模角度，远距离依赖的最短路径从线性级降成常数级</li>
<li>从硬件角度，序列计算第一次被改写成大矩阵乘法</li>
</ul>
<p>这两件事叠加，才让 Transformer 不只是“另一种模型结构”，而是直接变成了大规模训练和大规模推理都能持续扩张的基础范式.</p>
<h2 id="5-zyljzzzjjdbs-ksxw-es-dtxsxw">5. 注意力机制真正解决的不是“看上下文”，而是“动态选上下文”</h2>
<p>很多入门资料把注意力机制描述成“让模型关注重要信息”. 这句话没错，但还太抽象. 更准确地说，注意力机制解决的是这样一个问题：</p>
<p>给定一个 token，当它生成自己的下一层表示时，应该从整个序列中读回哪些信息、读回多少、以什么组合方式读回.</p>
<p>这比简单“看上下文”更强，因为它引入的是<strong>按 token 动态变化的检索行为</strong>. 同一句话里，不同 token 会形成不同的 Query，于是它们从同一个上下文里取回的信息也完全不同. 语言建模不再依赖一个统一的压缩状态，而是允许每个 token 用自己的方式去理解整个序列.</p>
<p>这使注意力机制不仅是一种表示聚合方式，更像是序列内的动态可微检索器.</p>
<h2 id="6-wsm-query-key-value-sygjqcgdcx">6. 为什么 Query-Key-Value 是一个极其成功的抽象</h2>
<p>QKV 的成功之处，不只是把问题拆成三部分，而是它恰好把“检索”这个动作分解成了最适合矩阵运算的形式.</p>
<ul>
<li>Query 表示“我想找什么”</li>
<li>Key 表示“我能提供什么标签”</li>
<li>Value 表示“我真正携带什么内容”</li>
</ul>
<p>这种分工非常自然，因为现实中的信息访问本来就常常如此：你先拿关键词搜索，再根据匹配度筛选结果，最后读取内容. QKV 把这个过程做成了端到端可微分的形式.</p>
<p>更重要的是，它让“内容匹配”和“内容承载”分离了. 一个 token 的 Key 负责被检索，一个 token 的 Value 负责被聚合. 这样模型在训练时拥有更大的自由度：它不需要用同一组向量同时承担“被找到”和“贡献内容”两种职责.</p>
<h2 id="7-dt-dtydtbtdyjzx">7. 单头、多头与多头变体的演进主线</h2>
<p>如果只用单头注意力，模型当然也能工作，但它会把所有依赖模式都压在同一组投影空间里. 于是自然就出现了多头注意力：不同头可以在不同子空间中学习不同关系模式.</p>
<p>接下来的工业演化其实可以概括成一条很清晰的主线：</p>
<ol>
<li><strong>MHA</strong>：最大化表达能力所有 Query、Key、Value 头都独立，最灵活，也最贵.</li>
<li><strong>MQA</strong>：压缩 KV Cache多个 Query 头共享一组 Key/Value，显著降低推理内存与带宽成本.</li>
<li><strong>GQA</strong>：在表达和成本间折中Query 头按组共享 Key/Value，比 MQA 更强、比 MHA 更省.</li>
<li><strong>MLA</strong>：进一步在 latent 空间压缩 KV
这是更激进的路线，把 KV 的存储和重建问题重新定义.</li>
</ol>
<p>所以 2.2 这一章，并不是从“自注意力”跳到“多头”这么简单，而是在讲一整条从表达能力到系统成本的折中历史.</p>
<h2 id="8-zyljzwsmyksjdzjszb">8. 注意力机制为什么一开始就带着计算账本</h2>
<p>Transformer 的伟大之处之一，在于它不是一个“先学术后工程”的模块. Attention 从诞生那天起，就同时带着理论优点和成本账本.</p>
<p>它的好处很直接：</p>
<ul>
<li>并行</li>
<li>长程依赖路径短</li>
<li>显式权重</li>
<li>容易扩展到多头</li>
</ul>
<p>但它的成本同样清晰：</p>
<ul>
<li>需要构造 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>×</mo><mi>T</mi></mrow><annotation encoding="application/x-tex">T \\times T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span></span> 级别的注意力矩阵</li>
<li>序列越长，显存和计算成本越容易爆炸</li>
<li>推理阶段 KV Cache 会持续膨胀</li>
</ul>
<p>所以，注意力机制从来不是“无代价的完美答案”. 它是一种在当时硬件和任务背景下非常成功的平衡方案. 也正因为它的成本一开始就被清楚暴露，后续整个高效注意力研究才会围绕它形成如此庞大的分支.</p>
<h2 id="9-prefill-y-decoding-wsmyfklj">9. Prefill 与 Decoding 为什么要分开理解</h2>
<p>很多人只记住“attention 是二次复杂度”，但对工程系统来说，还必须分清楚两个阶段：</p>
<h3 id="9-1-prefill">9.1 Prefill</h3>
<p>Prefill 指的是模型并行处理整个 prompt 的阶段. 这时所有 token 都已经在手里，主要成本是：</p>
<ul>
<li>生成 Q/K/V</li>
<li>计算完整注意力分数矩阵</li>
<li>做 softmax 和加权聚合</li>
</ul>
<p>这一阶段更偏 <strong>compute-bound</strong>. 如果 kernel 写得好、矩阵乘法吃得满，吞吐可以很高.</p>
<h3 id="9-2-decoding">9.2 Decoding</h3>
<p>Decoding 指的是模型一边读历史缓存、一边生成新 token 的阶段. 这时新 token 只生成一行 Query，但它要与所有历史 Key/Value 交互. 此时主要问题不再是算不动，而是 <strong>KV Cache 太大、HBM 带宽不够、内存墙先到</strong>.</p>
<p>这是理解 MQA、GQA、MLA 和 PagedAttention 的关键. 它们不只是“注意力变体”，本质上是在为 decoding 阶段做服务.</p>
<h2 id="10-wsm-kv-cache-hcwxd-llm-dthxtwt">10. 为什么 KV Cache 会成为现代 LLM 的头号系统问题</h2>
<p>在纯理论公式里，Key 和 Value 看起来只是中间张量. 但一旦进入自回归推理，它们会变成必须长期保留的历史状态.</p>
<p>假设模型层数很多、头数很多、head dim 很大、上下文很长，那么 KV Cache 很快就会占据大量显存. 此时系统瓶颈不再是“能不能算”，而是：</p>
<ul>
<li>能不能装下</li>
<li>能不能搬得动</li>
<li>能不能在高并发下不炸</li>
</ul>
<p>所以，现代 LLM serving 的很多工作，其实都是围绕“如何减少或更高效组织 KV Cache”展开的. GQA、MQA、MLA 只是这条路线在架构层面的体现.</p>
<h2 id="11-wsmjczyljzbxzgxzylzqxt">11. 为什么基础注意力机制必须在高效注意力之前学透</h2>
<p>很多读者喜欢直接去看 FlashAttention、滑动窗口注意力、稀疏注意力、线性注意力和长上下文技巧，因为这些名字听起来更接近“工业前沿”. 但如果没有先把基础注意力机制吃透，后面的所有优化都会变成术语拼盘.</p>
<p>因为所有高效注意力方法，归根结底都在回答三个问题：</p>
<ol>
<li>哪些 Attention 计算其实不必显式做完</li>
<li>哪些 Key/Value 可以被共享、压缩、分页或丢弃</li>
<li>哪些注意力权重模式可以近似而不明显损伤效果</li>
</ol>
<p>而这三问的起点，正是 2.2.1 和 2.2.2 里的基础计算图.</p>
<h2 id="12-zzhhxzjdgx">12. 这章和后续章节的关系</h2>
<p>你可以把 <code>2.2</code> 当成整个 LLM 核心架构部分的“分水岭”.</p>
<p>往前看，它承接：</p>
<ul>
<li><code>2.1</code> 的线性层、归一化、位置编码、残差与优化基础</li>
</ul>
<p>往后看，它分裂成三条重要支线：</p>
<ul>
<li><code>2.3</code>：高效与稀疏注意力，重点是把 Attention 做快做省</li>
<li><code>2.4</code>：前沿架构与变体，重点是替换或重构 Attention 主干</li>
<li><code>2.5</code>：长上下文与外推技术，重点是让 Attention 撑得更远</li>
</ul>
<p>这也是为什么 <code>2.2</code> 虽然看起来只是“基础注意力机制”，但其实是后面多个专题的共同母体.</p>
<h2 id="13-xxzzszryfdsgc">13. 学习这章时最容易犯的三个错</h2>
<h3 id="cwy-zjgs-bjzzfg">错误一：只记公式，不记职责分工</h3>
<p>如果只记住 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup><mi mathvariant="normal">/</mi><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mrow><annotation encoding="application/x-tex">QK^T/\\sqrt{d_k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1072em;vertical-align:-0.25em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mord">/</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span> 和 softmax，你会知道注意力怎么算，但不会真正理解它为什么有效. 更重要的是记住：Query 是查询意图，Key 是可检索标签，Value 是被读取内容.</p>
<h3 id="cwe-zkbdnl-bkxtcb">错误二：只看表达能力，不看系统成本</h3>
<p>很多人第一次学 Attention 时只觉得它“能看全局好厉害”，却忽略了它从一开始就带着显存和带宽账本. 到了长上下文和在线 serving 阶段，这笔账会变成主问题.</p>
<h3 id="cws-bdtdzjdbhfz">错误三：把多头当作简单并行复制</h3>
<p>多头不是把单头复制很多份，而是让模型在不同子空间里形成不同依赖模式. 真正重要的是“分工”和“共享方式”，这也是后面 MQA / GQA / MLA 演化的起点.</p>
<h2 id="14-tpzwjy">14. 图片占位建议</h2>
<p>如果你后续要为 <code>2.2</code> 总览页配图，最有价值的不是具体公式截图，而是一张把整章路线串起来的导航图.</p>
<p>建议至少包含三部分：</p>
<ol>
<li>自注意力基本计算链：Q/K/V -&gt; scores -&gt; softmax -&gt; weighted sum</li>
<li>多头家谱：MHA -&gt; MQA -&gt; GQA -&gt; MLA</li>
<li>成本分叉：表达能力增强 versus KV Cache 压缩</li>
</ol>
<p>可以直接给生图模型的 prompt:</p>
<pre><code class="language-text">Create a chapter overview diagram for basic attention mechanisms in large language models. Show three parts:
1) self-attention pipeline with Query, Key, Value, score matrix, softmax, and weighted aggregation,
2) evolution tree from MHA to MQA to GQA to MLA,
3) engineering trade-off map between expressiveness and KV-cache efficiency.
Style: white background, technical paper overview figure, blue/orange/purple highlights, clean readable labels, precise arrows, no decorative elements.
</code></pre>
<h2 id="15-bzzlxj">15. 本章总览小结</h2>
<p>注意力机制是 Transformer 的数学心脏，但它真正重要的地方，不只是“会算权重”，而是它把动态检索、全局上下文聚合和并行矩阵计算统一到了同一个框架里.</p>
<p>理解 <code>2.2.1</code>，你会明白自注意力为什么能击败 RNN.
理解 <code>2.2.2</code>，你会明白现代大模型为什么必须继续改写注意力头和 KV 组织方式.
再带着这两部分进入 <code>2.3</code> 和 <code>2.5</code>，高效注意力与长上下文技巧才不会看起来像一堆零散 patch，而会变成同一条技术路线的不同阶段.</p>
<h2 id="16-zyljzdxxzdqd">16. 注意力机制的学习重点清单</h2>
<p>如果你准备继续往后读 <code>2.3</code> 和 <code>2.5</code>，建议在这一章里先确保自己已经真正掌握下面几个点，而不是只看过名词.</p>
<ol>
<li>Query、Key、Value 各自承担什么职责</li>
<li>为什么要除以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mrow><annotation encoding="application/x-tex">\\sqrt{d_k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.1828em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span></span></li>
<li>softmax 为什么既是选择器也是数值风险点</li>
<li>因果掩码在训练和推理中为什么必须一致</li>
<li>多头为什么不是简单复制单头</li>
<li>MQA / GQA / MLA 为什么会围绕 KV Cache 展开演化</li>
<li>Prefill 和 Decoding 的瓶颈为什么完全不同</li>
</ol>
<p>只有这七点建立起来，后面的高效注意力路线图才会真正顺畅.</p>
<h2 id="17-cbzdgysxdq">17. 从本章到工业实现的桥</h2>
<p>在学术视角里，Attention 主要是一个数学算子.在工业视角里，Attention 同时是：</p>
<ul>
<li>一个状态管理问题</li>
<li>一个显存组织问题</li>
<li>一个带宽分配问题</li>
<li>一个 kernel 设计问题</li>
<li>一个长上下文可扩展问题</li>
</ul>
<p>这也是为什么你会在后续章节里频繁看到“算子没变，但执行方式完全变了”的现象. 真正的大模型工程，不是重新发明注意力，而是在不同约束下重新实现注意力.</p>
<h2 id="18-zzzzydxzmx">18. 这章最重要的心智模型</h2>
<p>如果要给 <code>2.2</code> 留下一个最关键的心智模型，那就是：**Attention 是一种可微的、按 token 动态触发的检索-筛选-聚合系统. **</p>
<p>这个表述比“模型会关注重要词”更准确，因为它同时强调了三点：</p>
<ol>
<li>它是检索系统Query 在问“我需要什么”，Key 在回答“我拥有什么标签”.</li>
<li>它是筛选系统Softmax 不是装饰品，而是决定不同候选项如何竞争注意力预算的机制.</li>
<li>它是聚合系统
最终输出不是选出一个 token，而是对多个 Value 做加权融合.</li>
</ol>
<p>只要把这个模型立住，后面 MHA、MQA、GQA、MLA 以及所有高效变体都只是对这个“检索系统”的不同实现.</p>
<h2 id="19-wsms-attention-bxljmwtzxcshl">19. 为什么说 Attention 把序列建模问题重新参数化了</h2>
<p>在 RNN 里，序列建模的重点是“如何维护状态”. 在 Attention 里，序列建模被重新改写为“如何计算相关性并组织上下文检索”. 这不是术语变化，而是问题本体被重新参数化.</p>
<p>RNN 的记忆是被压缩进一个不断演化的状态向量里.
Attention 的记忆则更接近“把历史都暂时摆在外面，然后按需读取”.</p>
<p>这就是为什么 Attention 在表达上更透明，也为什么它会立刻引出 KV Cache、内存墙、分页和稀疏化这些工程问题. 因为你把记忆从“隐藏在状态中”变成了“显式存放在缓存中”.</p>
<h2 id="20-bzdhxxxdzzyy">20. 本章对后续学习的真正意义</h2>
<p>从课程组织上看，<code>2.2</code> 当然只是“基础注意力机制”. 但从知识结构上看，它决定了后面三件事你到底能不能真的读懂：</p>
<ul>
<li>你能不能理解为什么 FlashAttention 的优化对象不是 softmax 本身，而是 IO</li>
<li>你能不能理解为什么 MQA / GQA / MLA 都盯着 KV 而不是 Q</li>
<li>你能不能理解为什么长上下文技术本质上是位置编码、KV 管理和注意力结构的联合工程</li>
</ul>
<p>所以这一章真正的意义，不是记住几个公式，而是建立一个后续所有章节共用的统一计算图.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zjdw","text":"1. 章节定位"},{"level":2,"id":"2-bznrsy","text":"2. 本章内容索引"},{"level":2,"id":"3-ydlxjy","text":"3. 阅读路线建议"},{"level":2,"id":"4-wsmzyljzcw-transformer-dhx","text":"4. 为什么注意力机制成为 Transformer 的核心"},{"level":2,"id":"5-zyljzzzjjdbs-ksxw-es-dtxsxw","text":"5. 注意力机制真正解决的不是“看上下文”，而是“动态选上下文”"},{"level":2,"id":"6-wsm-query-key-value-sygjqcgdcx","text":"6. 为什么 Query-Key-Value 是一个极其成功的抽象"},{"level":2,"id":"7-dt-dtydtbtdyjzx","text":"7. 单头、多头与多头变体的演进主线"},{"level":2,"id":"8-zyljzwsmyksjdzjszb","text":"8. 注意力机制为什么一开始就带着计算账本"},{"level":2,"id":"9-prefill-y-decoding-wsmyfklj","text":"9. Prefill 与 Decoding 为什么要分开理解"},{"level":3,"id":"9-1-prefill","text":"9.1 Prefill"},{"level":3,"id":"9-2-decoding","text":"9.2 Decoding"},{"level":2,"id":"10-wsm-kv-cache-hcwxd-llm-dthxtwt","text":"10. 为什么 KV Cache 会成为现代 LLM 的头号系统问题"},{"level":2,"id":"11-wsmjczyljzbxzgxzylzqxt","text":"11. 为什么基础注意力机制必须在高效注意力之前学透"},{"level":2,"id":"12-zzhhxzjdgx","text":"12. 这章和后续章节的关系"},{"level":2,"id":"13-xxzzszryfdsgc","text":"13. 学习这章时最容易犯的三个错"},{"level":3,"id":"cwy-zjgs-bjzzfg","text":"错误一：只记公式，不记职责分工"},{"level":3,"id":"cwe-zkbdnl-bkxtcb","text":"错误二：只看表达能力，不看系统成本"},{"level":3,"id":"cws-bdtdzjdbhfz","text":"错误三：把多头当作简单并行复制"},{"level":2,"id":"14-tpzwjy","text":"14. 图片占位建议"},{"level":2,"id":"15-bzzlxj","text":"15. 本章总览小结"},{"level":2,"id":"16-zyljzdxxzdqd","text":"16. 注意力机制的学习重点清单"},{"level":2,"id":"17-cbzdgysxdq","text":"17. 从本章到工业实现的桥"},{"level":2,"id":"18-zzzzydxzmx","text":"18. 这章最重要的心智模型"},{"level":2,"id":"19-wsms-attention-bxljmwtzxcshl","text":"19. 为什么说 Attention 把序列建模问题重新参数化了"},{"level":2,"id":"20-bzdhxxxdzzyy","text":"20. 本章对后续学习的真正意义"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.2-attention/2.2-attention" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.2-attention/2.2-attention" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2.2 · 基础注意力机制</h1>
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
