"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma 3 核心架构与多模态长上下文设计剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>对应精译: <a href="/llm-guide/14-models/14.10-gemma/03-gemma-3/01-gemma-3-jsbgjy">01-Gemma-3技术报告精译</a>
原文: Gemma Team, &quot;Gemma 3 Technical Report&quot;, arXiv:2503.19786 (2025)
分析范围: Gemma 3 1B/4B/12B/27B (2025.03 发布)</p>
</blockquote>
<hr>
<h2 id="1-sjln-ql-xfj-kf">1. 设计理念: 轻量、消费级、开放</h2>
<p>Gemma 3 延续了 Gemma 家族的核心定位: 与 Gemini 前沿模型协同设计, 但面向消费级硬件部署. 1B 模型可跑在手机端, 27B 模型可跑在单张高端 GPU 上. 这一「轻量优先」的设计哲学深刻影响了其所有架构决策.</p>
<table>
<thead>
<tr>
<th align="left">规模</th>
<th align="right">总参数</th>
<th align="right">训练 Token</th>
<th align="left">视觉Encoder</th>
<th align="center">上下文长度</th>
<th align="left">目标硬件</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1B</td>
<td align="right">~1B</td>
<td align="right">2T</td>
<td align="left">无</td>
<td align="center">32K</td>
<td align="left">手机/嵌入式</td>
</tr>
<tr>
<td align="left">4B</td>
<td align="right">~4.3B</td>
<td align="right">4T</td>
<td align="left">417M (SigLIP)</td>
<td align="center">128K</td>
<td align="left">笔记本/中端 GPU</td>
</tr>
<tr>
<td align="left">12B</td>
<td align="right">~12.2B</td>
<td align="right">12T</td>
<td align="left">417M (SigLIP)</td>
<td align="center">128K</td>
<td align="left">高端 GPU</td>
</tr>
<tr>
<td align="left">27B</td>
<td align="right">~27.4B</td>
<td align="right">14T</td>
<td align="left">417M (SigLIP)</td>
<td align="center">128K</td>
<td align="left">单卡高端 GPU</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Gemma 3 模型家族配置.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: Gemma 3 的定位与 Llama 3 形成了鲜明对比. Llama 3 的 8B/70B/405B 策略覆盖了从边缘到数据中心的全谱系, 但 405B 的部署成本极高. Gemma 3 的上限是 27B, 这意味着它放弃了在绝对性能上追赶最大规模模型的野心, 换取了「可部署性&quot;——27B 模型在 int4 量化后仅需 14.1GB 权重 + KV Cache 即可运行, 确实可以装入单张消费级 GPU. 这种定位决定了其架构创新必须围绕「效率」展开: 5:1 Local:Global 注意力、知识蒸馏、QAT 量化, 所有设计都服务于同一个目标: 在有限的硬件预算内挤出最大性能.</p>
</blockquote>
<hr>
<h2 id="2-jggl-c-gemma-2-d-gemma-3-dyj">2. 架构概览: 从 Gemma 2 到 Gemma 3 的演进</h2>
<p>Gemma 3 保留了 decoder-only Transformer 的基础框架, 但在注意力机制、归一化、位置编码等关键组件上做了重要修改.</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">Gemma 2</th>
<th align="left">Gemma 3</th>
</tr>
</thead>
<tbody><tr>
<td align="left">注意力</td>
<td align="left">GQA + soft-capping</td>
<td align="left">GQA + QK-Norm</td>
</tr>
<tr>
<td align="left">归一化</td>
<td align="left">RMSNorm (Pre + Post)</td>
<td align="left">RMSNorm (Pre + Post)</td>
</tr>
<tr>
<td align="left">局部-全局比例</td>
<td align="left">1:1</td>
<td align="left">5:1</td>
</tr>
<tr>
<td align="left">局部滑动窗口</td>
<td align="left">4096</td>
<td align="left">1024</td>
</tr>
<tr>
<td align="left">全局 RoPE 基频</td>
<td align="left">10,000</td>
<td align="left">1,000,000</td>
</tr>
<tr>
<td align="left">局部 RoPE 基频</td>
<td align="left">10,000</td>
<td align="left">10,000</td>
</tr>
<tr>
<td align="left">词表</td>
<td align="left">~50k</td>
<td align="left">262k (Gemini 2.0)</td>
</tr>
<tr>
<td align="left">视觉Encoder</td>
<td align="left">无</td>
<td align="left">400M SigLIP (4B/12B/27B)</td>
</tr>
<tr>
<td align="left">上下文长度</td>
<td align="left">8K</td>
<td align="left">32K (1B) / 128K (其他)</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Gemma 2 与 Gemma 3 架构对比.</p>
</blockquote>
<h3 id="2-1-qk-norm-td-soft-capping">2.1 QK-Norm 替代 Soft-Capping</h3>
<p>Gemma 2 使用 soft-capping 来限制注意力分数的数值范围, 防止训练中的数值爆炸. Gemma 3 改用 QK-Norm(Query-Key Normalization), 在计算注意力分数前对 query 和 key 进行 Layer Norm 标准化.</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Attention</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>在 QK-Norm 下, query 和 key 先经过归一化:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>Q</mi><mo>~</mo></mover><mo>=</mo><mfrac><mi>Q</mi><mrow><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><mi>Q</mi><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi></mrow></mfrac><mo separator="true">,</mo><mspace width="1em"/><mover accent="true"><mi>K</mi><mo>~</mo></mover><mo>=</mo><mfrac><mi>K</mi><mrow><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><mi>K</mi><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\tilde{Q} = \\frac{Q}{||Q||}, \\quad \\tilde{K} = \\frac{K}{||K||}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1146em;vertical-align:-0.1944em;"></span><span class="mord accent"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">Q</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">~</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1944em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2963em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∣∣</span><span class="mord mathnormal">Q</span><span class="mord">∣∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">~</span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2963em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∣∣</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord">∣∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><blockquote>
<p><strong>Thinking (Architecture Details)</strong>: QK-Norm 与 soft-capping 的根本区别在于干预时机. soft-capping 是在注意力分数计算后施加一个饱和函数(tanh-based)来限制数值范围, 类似于「事后修正」; QK-Norm 则是在计算前通过归一化确保 query 和 key 的尺度一致, 类似于「事前预防&quot;. 从工程角度看, QK-Norm 有两个优势: 第一, 它消除了 soft-capping 中饱和函数引入的非线性, 使得注意力分数的梯度更加稳定; 第二, 归一化后的 query/key 内积天然有界(在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mo>−</mo><mn>1</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[-1, 1]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">−</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">]</span></span></span></span> 之间), 不需要额外的裁剪. 但 QK-Norm 也有一个隐性代价: 额外的归一化操作增加了每层的前向计算开销, 在 27B 模型的数十层堆叠中, 这个开销会累积. Gemma 3 的选择说明, 在训练和推理稳定性方面, QK-Norm 的收益超过了其计算成本.</p>
</blockquote>
<h3 id="2-2-262k-cb-dyyddjysy">2.2 262k 词表: 多语言的代价与收益</h3>
<p>Gemma 3 采用与 Gemini 2.0 相同的 SentencePiece 分词器, 词表大小为 262,000, 带有数字拆分、保留空白和字节级编码.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 262k 词表远大于 Llama 3 的 128k 和 Gemma 2 的约 50k. 这一选择的利弊非常鲜明. 收益方面: (1) 非英语 token 表示更高效, 相同文本的序列长度更短, 对多语言任务有直接帮助; (2) 数字拆分策略使得数学计算中的数字序列更精确, 不会被错误地合并为单个 token. 代价方面: (1) 嵌入矩阵参数量激增——对于 1B 模型, 302M 参数中有约 1/3 来自嵌入层, 这意味着大量参数被「浪费」在词表上而非语言建模能力本身; (2) 词表稀疏性增加, 对于低频语言或技术术语, 对应嵌入向量的训练可能不充分; (3) 更大的词表意味着更大的 embedding 层内存占用和更慢的 token 采样速度. 论文中 1B 模型的性能略低于 Gemma 2 的 2B, 可能部分与词表过大有关——小模型的容量被稀疏的词表「稀释&quot;了.</p>
</blockquote>
<hr>
<h2 id="3-5-1-local-global-zyl-kv-cache-dgm">3. 5:1 Local:Global 注意力: KV Cache 的革命</h2>
<p>Gemma 3 最核心的架构创新是 5:1 的局部(local)与全局(global)注意力层交错. 每 5 个局部层之后放置 1 个全局层, 以局部层作为第一层.</p>
<h3 id="3-1-zylms">3.1 注意力模式</h3>
<ul>
<li><strong>局部层</strong>: 滑动窗口注意力, 窗口大小仅 1024 token. 每个 token 只能关注其前 1024 个 token.</li>
<li><strong>全局层</strong>: 标准自注意力, 关注所有先前 token.</li>
</ul>
<h3 id="3-2-kv-cache-ncsy">3.2 KV Cache 内存收益</h3>
<p>在标准 Transformer 中, KV Cache 的总内存为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>M</mi><mtext>KV</mtext></msub><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>h</mi><mtext>kv</mtext></msub><mo>×</mo><msub><mi>d</mi><mtext>head</mtext></msub><mo>×</mo><mi>s</mi></mrow><annotation encoding="application/x-tex">M_{\\text{KV}} = 2 \\times L \\times h_{\\text{kv}} \\times d_{\\text{head}} \\times s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KV</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kv</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 为层数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>kv</mtext></msub></mrow><annotation encoding="application/x-tex">h_{\\text{kv}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kv</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为 KV 头数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mtext>head</mtext></msub></mrow><annotation encoding="application/x-tex">d_{\\text{head}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为每头维度, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi></mrow><annotation encoding="application/x-tex">s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span></span></span></span> 为序列长度.</p>
<p>在 Gemma 3 的 5:1 配置下, 只有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mn>6</mn></mrow><annotation encoding="application/x-tex">1/6</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/6</span></span></span></span> 的层需要存储完整序列长度的 KV Cache, 其余 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mi mathvariant="normal">/</mi><mn>6</mn></mrow><annotation encoding="application/x-tex">5/6</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5/6</span></span></span></span> 的层仅需存储 1024 的滑动窗口:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>M</mi><mtext>KV</mtext><mtext>Gemma3</mtext></msubsup><mo>=</mo><mn>2</mn><mo>×</mo><mrow><mo fence="true">(</mo><mfrac><mrow><mn>5</mn><mi>L</mi></mrow><mn>6</mn></mfrac><mo>×</mo><msub><mi>h</mi><mtext>kv</mtext></msub><mo>×</mo><msub><mi>d</mi><mtext>head</mtext></msub><mo>×</mo><mn>1024</mn><mo>+</mo><mfrac><mi>L</mi><mn>6</mn></mfrac><mo>×</mo><msub><mi>h</mi><mtext>kv</mtext></msub><mo>×</mo><msub><mi>d</mi><mtext>head</mtext></msub><mo>×</mo><mi>s</mi><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">M_{\\text{KV}}^{\\text{Gemma3}} = 2 \\times \\left(\\frac{5L}{6} \\times h_{\\text{kv}} \\times d_{\\text{head}} \\times 1024 + \\frac{L}{6} \\times h_{\\text{kv}} \\times d_{\\text{head}} \\times s\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">KV</span></span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">Gemma3</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">6</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">5</span><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kv</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">1024</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">6</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">L</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">kv</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">head</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">s</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><blockquote>
<p><strong>Thinking (Architecture Details)</strong>: Gemma 3 的 KV Cache 优化效果非常显著. 消融实验显示, 在 32K 上下文中, 标准全局注意力的 KV Cache 占用了模型权重 60% 的额外内存; 而 Gemma 3 的 5:1 + sw=1024 配置将这一开销压缩到不足 15%. 随着上下文继续增长, 这一差距会进一步拉大——在 128K 上下文中, 全局注意力的 KV Cache 可能超过模型权重本身, 而 Gemma 3 的 KV Cache 仍保持可控. 但这里有一个 engineering trade-off: 局部注意力限制了信息传播距离. 在 5:1 的配置下, 信息需要通过全局层才能跨长距离传播, 而全局层仅占 1/6, 这意味着长距离依赖的建模能力理论上弱于全全局注意力. 消融实验显示不同 Local:Global 比例对困惑度影响极小(即使 7:1 也几乎无影响), 这说明 Gemma 3 的训练数据和学习目标使得局部层已足够捕获大部分局部模式, 全局层仅需处理稀疏的长距离关联.</p>
</blockquote>
<h3 id="3-3-y-gemma-2-ddb">3.3 与 Gemma 2 的对比</h3>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="center">局部-全局比例</th>
<th align="center">滑动窗口</th>
<th align="center">32K 上下文 KV Cache 开销</th>
</tr>
</thead>
<tbody><tr>
<td align="left">全局-only</td>
<td align="center">0:1</td>
<td align="center">-</td>
<td align="center">~60% 模型权重</td>
</tr>
<tr>
<td align="left">Gemma 2</td>
<td align="center">1:1</td>
<td align="center">4096</td>
<td align="center">~30% 模型权重</td>
</tr>
<tr>
<td align="left">Gemma 3</td>
<td align="center">5:1</td>
<td align="center">1024</td>
<td align="center">&lt;15% 模型权重</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 不同注意力配置的 KV Cache 内存开销对比.</p>
</blockquote>
<hr>
<h2 id="4-rope-jpfl-csxwdgjmm">4. RoPE 基频分离: 长上下文的关键密码</h2>
<p>Gemma 3 在全局层和局部层使用了不同的 RoPE 基频(base frequency):</p>
<ul>
<li><strong>局部层</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mn>10000</mn><mrow><mo>−</mo><mn>2</mn><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = 10000^{-2(i-1)/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.888em;"></span><span class="mord">1000</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mtight">1</span><span class="mclose mtight">)</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span> (标准基频)</li>
<li><strong>全局层</strong>: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mn>1000000</mn><mrow><mo>−</mo><mn>2</mn><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = 1000000^{-2(i-1)/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.888em;"></span><span class="mord">100000</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mtight">1</span><span class="mclose mtight">)</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span> (扩大 100 倍)</li>
</ul>
<h3 id="4-1-csxwkzcl">4.1 长上下文扩展策略</h3>
<p>Gemma 3 并非从一开始就使用 128K 序列训练, 而是:</p>
<ol>
<li>先用 32K 序列预训练模型.</li>
<li>在预训练结束时通过 RoPE rescaling 将模型扩展到 128K.</li>
<li>缩放因子为 8(即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>128</mn><mi>K</mi><mi mathvariant="normal">/</mi><mn>32</mn><mi>K</mi><mo>=</mo><mn>4</mn></mrow><annotation encoding="application/x-tex">128K / 32K = 4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord">/32</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4</span></span></span></span>, 但论文报告缩放因子 8 效果更好).</li>
</ol>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: RoPE 基频分离是一个非常巧妙的设计. 在标准 RoPE 中, 所有层共享同一个基频; 当需要扩展上下文时, 通常采用位置插值(PI)或 YaRN 等方法, 但这些方法对所有层一视同仁. Gemma 3 的洞察是: 局部层只关注 1024 token 的窗口, 不需要处理长距离位置编码, 因此保持标准基频 10K 即可; 全局层需要处理 128K 的完整序列, 使用 1M 的基频可以让模型在预训练时就适应更大的位置范围. 这种「分层位置编码&quot;使得模型同时学习局部精细模式和长距离粗粒度关联. 消融实验表明, 模型可以成功泛化到 128K, 但超过后继续扩展时「rapidly degrade」——这说明 128K 并非一个「自然」的上下文长度, 而是通过位置插值强行扩展的结果, 存在一个明确的性能悬崖.</p>
</blockquote>
<hr>
<h2 id="5-dmtsj-sig-lip-pan-amp-scan">5. 多模态设计: SigLIP + Pan &amp; Scan</h2>
<h3 id="5-1-sj-encoder">5.1 视觉Encoder</h3>
<p>Gemma 3 使用 400M 参数的 SigLIP Encoder ( frozen 状态), 接收 resize 为 896x896 的方形图像输入. 视觉嵌入通过 MultiModalProjector 压缩为固定大小的 256 个 soft token 序列, 送入语言模型.</p>
<h3 id="5-2-pan-amp-scan-p-amp-s">5.2 Pan &amp; Scan (P&amp;S)</h3>
<p>由于Encoder 固定 896x896 分辨率, 处理非方形宽高比或高分辨率图像时会产生伪影. P&amp;S 在推理时将图像分割为等大小的不重叠裁剪块, 覆盖整个图像, 每块 resize 到 896x896 后送入Encoder .</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: P&amp;S 是一个纯推理时优化, 可以在需要更快推理时禁用. 它的核心洞察是: 图像理解的质量与Encoder 看到的分辨率直接相关. 消融实验显示, 在 2B 参数变体上, 将视觉Encoder 分辨率从 256 提升到 896, DocVQA 性能从 31.9 提升到 59.8——几乎翻倍. P&amp;S 通过多裁剪策略, 让模型在不改变Encoder 架构的情况下「看到」更多细节. 但代价是计算开销: 每增加一个裁剪块, 就需要额外一次Encoder 前向传播. 论文报告称 Gemma 3 的 4B/12B 模型在相同 896x896 分辨率下的转移成本比 PaliGemma 2 低约 10 倍, 这得益于视觉嵌入的平均池化压缩(从Encoder 输出到 256 token). 这种「固定 token 预算」的设计使得图像处理的推理成本可控, 不会因为输入分辨率提高而线性增长.</p>
</blockquote>
<hr>
<h2 id="6-zszl-rbqyjsxz">6. 知识蒸馏: 软标签与教师选择</h2>
<p>Gemma 3 在预训练和后训练阶段均使用知识蒸馏. 每 token 采样 256 个 logit, 按教师概率加权, 学生通过交叉熵损失学习教师在这些采样中的分布.</p>
<h3 id="6-1-zldsx">6.1 蒸馏的实现</h3>
<p>与硬标签蒸馏(只取 top-1)不同, Gemma 3 使用软标签蒸馏: 保留教师对 256 个候选 token 的完整概率分布. 教师的目标分布对非采样 logit 设为零概率并重新归一化.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 软标签蒸馏让学生学到教师的「置信度梯度」——不仅知道教师认为哪个 token 最好, 还知道次优选择的相对概率. 这保留了比硬标签更多的信号, 但代价是每步需要额外计算教师的 256 维概率分布. 对于 Gemma 3 的 2T-14T token 训练规模, 这个开销是显著的. 消融实验还揭示了一个有趣的发现: 短训练长度下较小教师更好(正则化效应防止过拟合), 但长训练下趋势反转, 大教师的上限更高. 这暗示了蒸馏存在一个「训练长度阈值&quot;——超过该阈值后, 教师模型的能力上限成为瓶颈因素. Gemma 3 的 2T-14T token 训练显然超过了这个阈值, 因此选择大教师是合理的.</p>
</blockquote>
<hr>
<h2 id="7-xlgc-tpu-zero-3-y-pathways">7. 训练工程: TPU、ZeRO-3 与 Pathways</h2>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">硬件</th>
<th align="right">芯片数</th>
<th align="right">Data Shards</th>
<th align="right">Seq. Shards</th>
<th align="right">Replica</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1B</td>
<td align="left">TPUv5e</td>
<td align="right">512</td>
<td align="right">16</td>
<td align="right">16</td>
<td align="right">2</td>
</tr>
<tr>
<td align="left">4B</td>
<td align="left">TPUv5e</td>
<td align="right">2048</td>
<td align="right">16</td>
<td align="right">16</td>
<td align="right">8</td>
</tr>
<tr>
<td align="left">12B</td>
<td align="left">TPUv4</td>
<td align="right">6144</td>
<td align="right">16</td>
<td align="right">16</td>
<td align="right">24</td>
</tr>
<tr>
<td align="left">27B</td>
<td align="left">TPUv5p</td>
<td align="right">6144</td>
<td align="right">24</td>
<td align="right">8</td>
<td align="right">32</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: Gemma 3 训练基础设施配置.</p>
</blockquote>
<p>Gemma 3 使用 Google 的 Pathways 系统在 TPU 集群上训练. 优化器状态通过 ZeRO-3 分片, 多 pod 训练通过 Pathways 在数据中心网络上执行数据副本规约. 视觉Encoder 的嵌入被预计算, 不增加语言模型训练成本.</p>
<blockquote>
<p><strong>Thinking (Infrastructure)</strong>: Gemma 3 的训练基础设施配置有几个值得注意的点. 第一, 视觉Encoder 预计算: 这是多模态训练中常见的效率优化——先让冻结的视觉Encoder 处理所有图像, 将输出嵌入缓存到磁盘, 语言模型训练时直接读取嵌入而非原始图像. 这使得语言模型训练的数据加载和预处理与纯文本训练几乎相同, 大幅简化了训练流水线. 第二, TPUv4/v5e/v5p 的混合使用: 1B 和 4B 使用 TPUv5e(成本较低), 12B 使用 TPUv4(可能利用现有集群), 27B 使用 TPUv5p(最高性能). 这种「按规模选硬件&quot;的策略在成本控制上很务实. 第三, Seq. Shards 从 16(1B/4B/12B)降到 8(27B), 说明更大的模型需要更长的序列并行粒度来平衡内存和通信.</p>
</blockquote>
<hr>
<h2 id="8-lhgzxl-qat">8. 量化感知训练 (QAT)</h2>
<p>Gemma 3 不仅发布原始 bf16 Checkpoint, 还提供三种量化格式: per-channel int4、per-block int4 和 switched fp8. 这些通过约 5,000 步的 QAT 微调获得.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="right">Raw bf16</th>
<th align="right">Int4</th>
<th align="right">Int4 blocks=32</th>
<th align="right">SFP8</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1B</td>
<td align="right">2.0</td>
<td align="right">0.5</td>
<td align="right">0.7</td>
<td align="right">1.0</td>
</tr>
<tr>
<td align="left">+KV (32K)</td>
<td align="right">2.9</td>
<td align="right">1.4</td>
<td align="right">1.6</td>
<td align="right">1.9</td>
</tr>
<tr>
<td align="left">27B</td>
<td align="right">54.0</td>
<td align="right">14.1</td>
<td align="right">15.3</td>
<td align="right">27.4</td>
</tr>
<tr>
<td align="left">+KV (128K)</td>
<td align="right">72.7</td>
<td align="right">32.8</td>
<td align="right">34.0</td>
<td align="right">46.1</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: Gemma 3 模型量化后的内存占用 (GB).</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: QAT 的价值在于「让模型适应量化误差&quot;. 标准 PTQ(Post-Training Quantization)直接对训练好的模型进行量化, 往往导致性能下降, 因为模型在训练时从未「经历」过低精度. QAT 通过在微调阶段模拟量化(前向传播使用量化权重, 反向传播更新全精度权重), 让模型学会在量化约束下优化目标. 5,000 步的 QAT 是一个轻量级的「量化适配&quot;过程, 成本远低于从头训练. 从内存数据看, int4 量化将 27B 模型从 54GB 压缩到 14.1GB, 加上 128K KV Cache 后总内存约 32.8GB——这确实可以装入单张 A100-40GB 或 H100-80GB. 这是 Gemma 3 「消费级部署」定位的关键支撑.</p>
</blockquote>
<hr>
<h2 id="9-hxl-bond-warm-y-warp">9. 后训练: BOND、WARM 与 WARP</h2>
<p>Gemma 3 的后训练采用改进版知识蒸馏(来自大型 IT 教师)和基于 BOND、WARM、WARP 的 RL 微调阶段.</p>
<ul>
<li><strong>BOND(Best-of-N Distillation)</strong>: 从 Best-of-N 采样中学习, 将拒绝采样的高效性蒸馏到单样本生成中.</li>
<li><strong>WARM(Weight Averaged Reward Models)</strong>: 通过平均多个奖励模型的权重获得更鲁棒的奖励信号, 减少单一奖励模型的过拟合.</li>
<li><strong>WARP(Weight Averaged Policy)</strong>: 对策略模型进行权重平均, 提升泛化能力.</li>
</ul>
<blockquote>
<p><strong>Thinking (Lineage)</strong>: BOND/WARM/WARP 代表了 DeepMind 在 RLHF 领域的特色技术路线, 与 OpenAI 的 PPO、Anthropic 的 Constitutional AI 形成对比. 这三种方法的共同点是利用「权重平均&quot;来增强鲁棒性——WARM 平均奖励模型权重, WARP 平均策略模型权重, 本质上都是用集成学习(ensembling)的思想来降低单一模型的方差. 这种「平均即正则化&quot;的哲学在 DeepMind 的多项工作中反复出现, 从模型平均(model soup)到指数移动平均(EMA), 都体现了对模型权重空间平滑性的信任. 与标准 RLHF 相比, 这种方法的计算开销更低(不需要同时维护多个模型的推理), 但效果取决于权重平均的具体策略(如均匀平均 vs 按性能加权).</p>
</blockquote>
<hr>
<h2 id="10-xnfx-4b-rhpm-27b">10. 性能分析: 4B 如何媲美 27B</h2>
<p>Gemma 3 最引人注目的结果之一是 4B 模型的性能跨越:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="right">Gemma 2 27B</th>
<th align="right">Gemma 3 4B</th>
<th align="center">提升</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MATH</td>
<td align="right">55.6</td>
<td align="right">75.6</td>
<td align="center">+20.0</td>
</tr>
<tr>
<td align="left">HiddenMath</td>
<td align="right">14.8</td>
<td align="right">43.0</td>
<td align="center">+28.2</td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="right">76.2</td>
<td align="right">58.1</td>
<td align="center">-18.1</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="right">91.1</td>
<td align="right">89.2</td>
<td align="center">-1.9</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="right">51.8</td>
<td align="right">71.3</td>
<td align="center">+19.5</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: Gemma 3 4B-IT vs Gemma 2 27B-IT 性能对比.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Gemma 3 4B-IT 在数学和代码任务上大幅超越 Gemma 2 27B-IT, 但在 MMLU 等知识密集型任务上仍有差距. 这种「偏科」现象揭示了知识蒸馏和后训练配方的选择性增强: 教师模型的数学和代码能力被高效地迁移到了小模型, 但世界知识(需要大量参数来存储)的迁移效率较低. 这符合一个基本直觉: 推理能力(如数学证明、代码生成)是「过程性知识&quot;, 可以通过蒸馏学习; 事实性知识(如历史日期、地理信息)是「陈述性知识&quot;, 需要足够的参数容量来记忆. Gemma 3 的后训练配方显然针对数学和代码做了优化, 这是其 4B 模型在这些任务上表现突出的原因. 但这也带来了一个局限: 4B 模型作为通用助手的知识覆盖可能不如 27B 模型全面.</p>
</blockquote>
<hr>
<h2 id="11-jxybj">11. 局限与边界</h2>
<h3 id="11-1-128k-sxwdzsnl">11.1 128K 上下文的真实能力</h3>
<p>消融实验显示, 模型在 128K 附近表现良好, 但超过后「rapidly degrade」. 长上下文基准 RULER 和 MRCR 也显示, 从 32K 到 128K 性能有明显退化.</p>
<blockquote>
<p><strong>Thinking (Limitation)</strong>: 128K 上下文窗口在营销上很有吸引力, 但实际能力存在边界. Gemma 3 的 128K 是通过 RoPE rescaling 从 32K 扩展而来, 并非原生训练. 这意味着模型在 32K-128K 范围内的位置编码是「外推」而非「内插」, 精度会随着距离增加而衰减. 在真实场景中, 如果用户期望模型在 128K 文档中进行精确的跨段落推理(如对比第 1 页和第 500 页的内容), 可能会失望——模型更可能「找到」信息而非「理解」信息. 这与原生训练 128K 的模型(如 LLaMA 3 的渐进扩展)有本质区别.</p>
</blockquote>
<h3 id="11-2-sjnldfbsthb">11.2 视觉能力的分辨率天花板</h3>
<p>虽然 P&amp;S 通过多裁剪提升了效果, 但视觉Encoder 本身的分辨率固定为 896x896. 对于需要极精细视觉理解的任务(如医学影像分析、卫星图像解读), 这个分辨率可能成为瓶颈.</p>
<h3 id="11-3-1b-mxdcbcf">11.3 1B 模型的词表惩罚</h3>
<p>1B 模型的嵌入参数占总数约 30%, 大量容量被 262k 词表占用. 这导致 1B 模型的整体性能略低于预期, 在部分基准上甚至不如 Gemma 2 的 2B 模型.</p>
<hr>
<h2 id="12-zj">12. 总结</h2>
<p>Gemma 3 是一个围绕「效率」和「可部署性&quot;精心设计的模型家族. 它的核心架构创新——5:1 Local:Global 注意力、RoPE 基频分离、QK-Norm——全部服务于同一个目标: 在消费级硬件上实现最大性能. 知识蒸馏和后训练配方(BOND/WARM/WARP)使得小模型(4B)在特定任务上达到大模型(27B)的水平, 证明了训练方法的重要性不亚于规模本身.</p>
<p>从工程角度看, Gemma 3 的 QAT 量化、视觉Encoder 预计算、P&amp;S 推理优化等设计, 体现了一个成熟产品团队的系统思维: 不仅关注训练时的性能, 更关注部署时的成本. 从科研角度看, Gemma 3 的消融实验(特别是 Local:Global 比例、教师大小、视觉分辨率)为社区提供了宝贵的数据点, 帮助研究者理解哪些设计选择真正重要.</p>
<p>Gemma 3 的局限也揭示了当前轻量级模型的共同边界: 上下文扩展存在性能悬崖, 视觉分辨率有硬件上限, 小模型的知识容量受限于参数量. 这些不是 Gemma 3 独有的问题, 而是整个「高效小模型」研究方向的结构性挑战. Gemma 3 的价值在于, 它用详细的实验数据和透明的技术报告, 为这些边界提供了清晰的标注.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjln-ql-xfj-kf","text":"1. 设计理念: 轻量、消费级、开放"},{"level":2,"id":"2-jggl-c-gemma-2-d-gemma-3-dyj","text":"2. 架构概览: 从 Gemma 2 到 Gemma 3 的演进"},{"level":3,"id":"2-1-qk-norm-td-soft-capping","text":"2.1 QK-Norm 替代 Soft-Capping"},{"level":3,"id":"2-2-262k-cb-dyyddjysy","text":"2.2 262k 词表: 多语言的代价与收益"},{"level":2,"id":"3-5-1-local-global-zyl-kv-cache-dgm","text":"3. 5:1 Local:Global 注意力: KV Cache 的革命"},{"level":3,"id":"3-1-zylms","text":"3.1 注意力模式"},{"level":3,"id":"3-2-kv-cache-ncsy","text":"3.2 KV Cache 内存收益"},{"level":3,"id":"3-3-y-gemma-2-ddb","text":"3.3 与 Gemma 2 的对比"},{"level":2,"id":"4-rope-jpfl-csxwdgjmm","text":"4. RoPE 基频分离: 长上下文的关键密码"},{"level":3,"id":"4-1-csxwkzcl","text":"4.1 长上下文扩展策略"},{"level":2,"id":"5-dmtsj-sig-lip-pan-amp-scan","text":"5. 多模态设计: SigLIP + Pan &amp; Scan"},{"level":3,"id":"5-1-sj-encoder","text":"5.1 视觉Encoder"},{"level":3,"id":"5-2-pan-amp-scan-p-amp-s","text":"5.2 Pan &amp; Scan (P&amp;S)"},{"level":2,"id":"6-zszl-rbqyjsxz","text":"6. 知识蒸馏: 软标签与教师选择"},{"level":3,"id":"6-1-zldsx","text":"6.1 蒸馏的实现"},{"level":2,"id":"7-xlgc-tpu-zero-3-y-pathways","text":"7. 训练工程: TPU、ZeRO-3 与 Pathways"},{"level":2,"id":"8-lhgzxl-qat","text":"8. 量化感知训练 (QAT)"},{"level":2,"id":"9-hxl-bond-warm-y-warp","text":"9. 后训练: BOND、WARM 与 WARP"},{"level":2,"id":"10-xnfx-4b-rhpm-27b","text":"10. 性能分析: 4B 如何媲美 27B"},{"level":2,"id":"11-jxybj","text":"11. 局限与边界"},{"level":3,"id":"11-1-128k-sxwdzsnl","text":"11.1 128K 上下文的真实能力"},{"level":3,"id":"11-2-sjnldfbsthb","text":"11.2 视觉能力的分辨率天花板"},{"level":3,"id":"11-3-1b-mxdcbcf","text":"11.3 1B 模型的词表惩罚"},{"level":2,"id":"12-zj","text":"12. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/03-gemma-3/05-gemma-3-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/03-gemma-3/05-gemma-3-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma 3 核心架构与多模态长上下文设计剖析</h1>
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
