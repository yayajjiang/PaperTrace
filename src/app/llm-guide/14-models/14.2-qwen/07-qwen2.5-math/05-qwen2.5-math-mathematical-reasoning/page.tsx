"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-Math 数理逻辑剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: Qwen2.5-Math Technical Report (arXiv:2409.12122)
<strong>剖析角度</strong>: 自提升闭环设计、数学预训练数据工程、双轨推理体系、奖励模型与 RL 优化
<strong>面向读者</strong>: 已阅读 Qwen2.5-Math 技术报告精译,希望深入理解数学专用模型构建方法论的研究者</p>
</blockquote>
<hr>
<h2 id="1-hxfs-ztsbhdsldd">1. 核心范式:自提升闭环的三轮迭代</h2>
<p>Qwen2.5-Math 的根本创新不在于某一单项技术,而在于构建了一个完整的<strong>自提升(self-improvement)闭环</strong>——利用模型自身的监督信号来迭代增强能力.这一闭环贯穿预训练、后训练和推理三个阶段:</p>
<pre><code>Qwen2-Math-72B-Instruct
        |
        v
合成 Qwen Math Corpus v2 (&gt;1T token)
        |
        v
预训练 Qwen2.5-Math Base
        |
        v
拒绝采样 → CoT/TIR SFT 数据
        |
        v
Qwen2.5-Math-Instruct
        |
        v
采样 6 条解答/问题 → 训练 Qwen2.5-Math-RM
        |
        v
GRPO + Reward Shaping → RL 优化
        |
        v
更强模型 → 更强合成数据 → (循环)
</code></pre>
<p>这一闭环的本质是将模型自身作为「数据生成器」和「质量评判者」,在人工标注极为昂贵的数学领域实现了规模化数据自给.与通用模型的「预训练 → SFT → RLHF」线性流程不同,数学专用模型的闭环允许每一轮迭代都产生更高质量的合成数据,形成正向飞轮.</p>
<hr>
<h2 id="2-yxlsjgc-c-v1-d-v2-dky">2. 预训练数据工程:从 v1 到 v2 的跨越</h2>
<h3 id="2-1-qwen-math-corpus-dyjdb">2.1 Qwen Math Corpus 的演进对比</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Corpus v1 (Qwen2-Math)</th>
<th align="left">Corpus v2 (Qwen2.5-Math)</th>
<th align="left">提升</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总 token 量</td>
<td align="left">~7000 亿</td>
<td align="left">&gt;1 万亿</td>
<td align="left">+43%</td>
</tr>
<tr>
<td align="left">合成数据生成器</td>
<td align="left">Qwen2-72B-Instruct</td>
<td align="left">Qwen2-Math-72B-Instruct(更强)</td>
<td align="left">质量跃迁</td>
</tr>
<tr>
<td align="left">中文数据</td>
<td align="left">较少</td>
<td align="left">多轮召回扩充,显著增加</td>
<td align="left">双语覆盖</td>
</tr>
<tr>
<td align="left">基座初始化</td>
<td align="left">Qwen2 系列</td>
<td align="left">Qwen2.5 系列</td>
<td align="left">语言/代码/推理能力</td>
</tr>
<tr>
<td align="left">上下文长度</td>
<td align="left">4K</td>
<td align="left">4K</td>
<td align="left">保持一致</td>
</tr>
<tr>
<td align="left">数据召回方法</td>
<td align="left">FastText 分类器 + MinHash 去重</td>
<td align="left">同上 + 更多轮次迭代</td>
<td align="left">规模扩大</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: Corpus v2 的核心增量不是「更多网页爬取」,而是「更强模型生成的合成数据」.Qwen2-Math-72B-Instruct 相比 Qwen2-72B-Instruct 在数学推理上有显著提升,因此由前者生成的合成数据质量更高,形成了「数据质量 → 模型能力 → 更高质量数据」的正循环.</p>
</blockquote>
<h3 id="2-2-sjzhygldscjg">2.2 数据召回与过滤的三层架构</h3>
<table>
<thead>
<tr>
<th align="left">层级</th>
<th align="left">方法</th>
<th align="left">目的</th>
<th align="center">模型规模</th>
</tr>
</thead>
<tbody><tr>
<td align="left">第一层:URL 召回</td>
<td align="left">FastText 分类器(网页级)</td>
<td align="left">从 Common Crawl 中召回数学相关页面</td>
<td align="center">小模型</td>
</tr>
<tr>
<td align="left">第二层:文档去重</td>
<td align="left">MinHash LSH</td>
<td align="left">移除近似重复文档</td>
<td align="center">无模型</td>
</tr>
<tr>
<td align="left">第三层:质量评分</td>
<td align="left">Qwen2-0.5B-Instruct + prompt</td>
<td align="left">评估单条数据质量,高分的优先纳入</td>
<td align="center">小模型</td>
</tr>
<tr>
<td align="left">第四层:合成扩充</td>
<td align="left">Qwen2-72B-Instruct / Qwen2-Math-72B-Instruct</td>
<td align="left">从参考材料提取/精炼/生成新问答对</td>
<td align="center">大模型</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>设计选择</strong>: 质量评分使用 Qwen2-0.5B-Instruct 而非更大模型,这与 Qwen2.5-Coder 中「小模型做粗筛」的洞察一致——数学数据的质量评估(如「这个问题是否有明确的解」「解答是否包含完整的推理步骤&quot;)不需要深层语义理解,小模型足以胜任,且成本更低.</p>
</blockquote>
<hr>
<h2 id="3-sgtltx-cot-y-tir-dhbsj">3. 双轨推理体系:CoT 与 TIR 的互补设计</h2>
<h3 id="3-1-lztlmsddwcy">3.1 两种推理模式的定位差异</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">Chain-of-Thought (CoT)</th>
<th align="left">Tool-Integrated Reasoning (TIR)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">核心机制</td>
<td align="left">纯自然语言逐步推理</td>
<td align="left">自然语言推理 + Python 解释器执行</td>
</tr>
<tr>
<td align="left">适用场景</td>
<td align="left">概念理解、逻辑推导、证明构造</td>
<td align="left">精确计算、符号操作、复杂算法</td>
</tr>
<tr>
<td align="left">优势</td>
<td align="left">推理过程透明、可解释性强</td>
<td align="left">计算零错误、可处理数值/矩阵/方程</td>
</tr>
<tr>
<td align="left">劣势</td>
<td align="left">计算易出错(算术错误、符号混淆)</td>
<td align="left">需要外部工具支持、推理链可能断裂</td>
</tr>
<tr>
<td align="left">典型问题</td>
<td align="left">数论证明、几何推导、逻辑 puzzle</td>
<td align="left">求根、矩阵特征值、复杂方程求解</td>
</tr>
<tr>
<td align="left">训练数据规模</td>
<td align="left">200万英文 + 50万中文</td>
<td align="left">19.5万英文 + 中文翻译</td>
</tr>
<tr>
<td align="left">解答生成方法</td>
<td align="left">迭代拒绝采样</td>
<td align="left">在线 RFT + 多温度核采样</td>
</tr>
</tbody></table>
<p>CoT 与 TIR 不是互斥的替代关系,而是互补的协同关系.CoT 负责「理解问题、设计策略、构造证明&quot;,TIR 负责「精确执行计算、验证中间结果、处理复杂数值&quot;.Qwen2.5-Math 的训练将两者合并进行联合训练,使模型能够根据问题特征自动选择合适的推理模式.</p>
<h3 id="3-2-tir-dsjgssj">3.2 TIR 的数据格式设计</h3>
<p>TIR 模式的解答格式要求模型在推理过程中插入工具调用标记:</p>
<pre><code>&lt;|tool_call_begin|&gt;
import sympy
x = sympy.Symbol(&#39;x&#39;)
eq = sympy.Eq(x**2 - 5*x + 6, 0)
solution = sympy.solve(eq, x)
print(solution)
&lt;|tool_call_end|&gt;
&lt;|tool_output_begin|&gt;
[2, 3]
&lt;|tool_output_end|&gt;
</code></pre>
<p>这种格式的设计要求模型掌握三项能力:(1) 判断何时需要工具辅助;(2) 生成正确的可执行代码;(3) 理解工具输出并继续推理.在 RL 训练中,Python 执行器提供的所有输出 token 被 mask(不参与 loss 计算),这意味着模型只学习「生成正确的工具调用&quot;,而不学习「预测解释器的输出&quot;.</p>
<h3 id="3-3-cot-vs-tir-dxnhg">3.3 CoT vs TIR 的性能鸿沟</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">CoT MATH</th>
<th align="center">TIR MATH</th>
<th align="center">TIR 提升</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen2.5-Math-1.5B-Instruct</td>
<td align="center">75.8</td>
<td align="center">79.9</td>
<td align="center">+4.1</td>
</tr>
<tr>
<td align="left">Qwen2.5-Math-7B-Instruct</td>
<td align="center">83.6</td>
<td align="center">85.2</td>
<td align="center">+1.6</td>
</tr>
<tr>
<td align="left">Qwen2.5-Math-72B-Instruct</td>
<td align="center">85.9</td>
<td align="center">88.1</td>
<td align="center">+2.2</td>
</tr>
</tbody></table>
<p>TIR 的提升在较小模型上更显著(1.5B +4.1),说明工具辅助对弥补小模型计算能力的作用更大.对于 72B 大模型,CoT 本身已接近能力上限,TIR 的边际收益相对有限(+2.2),但仍将 MATH 分数推向了 88.1 的新高度.</p>
<blockquote>
<p><strong>中文基准的特殊现象</strong>: 与英文不同,TIR 在中文基准上并未展现显著优势.可能原因包括:中文数学题以「填空/解答」为主,对精确数值计算的需求不如英文竞赛题强烈;中文 TIR 数据规模可能不及英文;Python 解释器处理中文文本输出的格式兼容性问题.</p>
</blockquote>
<hr>
<h2 id="4-jlmx-listwise-pxyxldfk">4. 奖励模型:Listwise 排序与细粒度反馈</h2>
<h3 id="4-1-sjgjcl">4.1 数据构建策略</h3>
<p>Qwen2.5-Math-RM 的训练数据规模:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="center">Qwen2-Math-RM</th>
<th align="center">Qwen2.5-Math-RM</th>
</tr>
</thead>
<tbody><tr>
<td align="left">问题数量</td>
<td align="center">20.6 万(仅英文)</td>
<td align="center">36.1 万英文 + 25.7 万中文</td>
</tr>
<tr>
<td align="left">每问题候选解答数</td>
<td align="center">6</td>
<td align="center">6</td>
</tr>
<tr>
<td align="left">语言覆盖</td>
<td align="center">英文</td>
<td align="center">英文 + 中文</td>
</tr>
<tr>
<td align="left">推理模式</td>
<td align="center">CoT</td>
<td align="center">CoT + TIR</td>
</tr>
</tbody></table>
<p>偏好信号的构建方法:检查每条解答的最终答案与标准答案比对,正确的标记为 positive,错误的标记为 negative.随后过滤掉全部正确或全部错误的 case(模型无法从中学习排序).为保持难度均衡,使用不同中间版本和不同尺寸的模型生成解答.</p>
<h3 id="4-2-listwise-sssj">4.2 Listwise 损失设计</h3>
<p>Qwen2.5-Math-RM 采用 listwise 损失而非传统的 pairwise 损失:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>r</mi><mi>m</mi></mrow></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><mfrac><mn>1</mn><mrow><mi>k</mi><mo stretchy="false">(</mo><mn>6</mn><mo>−</mo><mi>k</mi><mo stretchy="false">)</mo></mrow></mfrac><munder><mo>∑</mo><mrow><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>p</mi><mi>o</mi><mi>s</mi></mrow></msub><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>n</mi><mi>e</mi><mi>g</mi></mrow></msub><mo stretchy="false">)</mo><mo>∈</mo><mi>D</mi></mrow></munder><mi>log</mi><mo>⁡</mo><mi>σ</mi><mrow><mo fence="true">(</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>p</mi><mi>o</mi><mi>s</mi></mrow></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>n</mi><mi>e</mi><mi>g</mi></mrow></msub><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{rm}(\\theta) = -\\frac{1}{k(6-k)} \\sum_{(x,y_{pos},y_{neg}) \\in D} \\log \\sigma\\left(r_\\theta(x, y_{pos}) - r_\\theta(x, y_{neg})\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.8598em;vertical-align:-1.5383em;"></span><span class="mord">−</span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mopen">(</span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">os</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span><span class="mrel mtight">∈</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.5383em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">os</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span></span></span></span></span><table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">处理方式</th>
<th align="left">优势</th>
<th align="left">劣势</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Pairwise</td>
<td align="left">将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>×</mo><mo stretchy="false">(</mo><mn>6</mn><mo>−</mo><mi>k</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">k \\times (6-k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span></span> 对拆分为独立样本</td>
<td align="left">实现简单</td>
<td align="left">信息损失,同一 query 内解答的相对关系被割裂</td>
</tr>
<tr>
<td align="left"><strong>Listwise</strong></td>
<td align="left"><strong>直接在有效 pair 上计算排序损失</strong></td>
<td align="left"><strong>保留完整偏好排序信息,训练效率和效果均更优</strong></td>
<td align="left">实现稍复杂</td>
</tr>
</tbody></table>
<p>listwise 方法的核心优势在于:每个 query 的 6 条解答被整体处理,保留了「这条解答比那条好,但不如另一条&quot;的完整偏序关系.这在数学推理中尤为重要——同一问题的多条错误解答可能有不同的「错误程度&quot;,pairwise 方法无法捕获这种细粒度差异.</p>
<h3 id="4-3-rm-ztlsdjz">4.3 RM 在推理时的价值</h3>
<p>在所有基准上,RM@8(奖励模型从 8 条采样中选择最优)显著优于 Maj@8(多数投票).这一差距揭示了两个关键信息:</p>
<ol>
<li><strong>奖励模型已具备高度可靠的排序能力</strong>——能够从 8 条采样中稳定选出最优解答</li>
<li><strong>生成模型仍有巨大提升空间</strong>——如果生成模型能通过 RL 更好地对齐奖励模型的偏好,greedy 解码的性能将大幅提升</li>
<li><strong>未来方向</strong>: 更强的 RL 策略有望将 RM@N 的优势转化为 greedy 性能的提升</li>
</ol>
<hr>
<h2 id="5-qhxx-grpo-reward-shaping">5. 强化学习:GRPO + Reward Shaping</h2>
<h3 id="5-1-grpo-d-group-level-baseline">5.1 GRPO 的 Group-Level Baseline</h3>
<p>Qwen2.5-Math 采用 Group Relative Policy Optimization (GRPO) 而非 PPO,核心差异在于 baseline 的计算方式:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\hat{A}_i = \\frac{r_i - \\text{mean}(r)}{\\text{std}(r)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0968em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">std</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">mean</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><table>
<thead>
<tr>
<th align="left">方法</th>
<th align="left">Baseline 来源</th>
<th align="center">额外模型</th>
<th align="left">适用场景</th>
</tr>
</thead>
<tbody><tr>
<td align="left">PPO</td>
<td align="left">独立价值函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi><mo stretchy="false">(</mo><mi>s</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">V(s)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mclose">)</span></span></span></span></td>
<td align="center">需要 value model</td>
<td align="left">通用 RL,状态空间复杂</td>
</tr>
<tr>
<td align="left"><strong>GRPO</strong></td>
<td align="left"><strong>同一 group 内采样输出的平均奖励</strong></td>
<td align="center"><strong>无需 value model</strong></td>
<td align="left"><strong>LLM 推理,同一 query 内解答难度相近</strong></td>
</tr>
</tbody></table>
<p>GRPO 的设计特别适合数学推理场景:同一 group(同一问题的多条采样解答)内的难度是相近的,因此相对排序比绝对分数更有意义.省去了训练独立 value model 的计算开销,同时对 reward model 的绝对校准要求降低,更关注相对排序.</p>
<h3 id="5-2-query-sxd-goldilocks-yz">5.2 Query 筛选的「Goldilocks 原则」</h3>
<p>RL 训练仅保留满足特定条件的 query:</p>
<table>
<thead>
<tr>
<th align="center">正确解答数</th>
<th align="left">处理方式</th>
<th align="left">原因</th>
</tr>
</thead>
<tbody><tr>
<td align="center">0-1 条</td>
<td align="left">排除</td>
<td align="left">模型缺乏基本解题能力,RL 难以收敛</td>
</tr>
<tr>
<td align="center"><strong>2-5 条</strong></td>
<td align="left"><strong>保留用于训练</strong></td>
<td align="left"><strong>「刚好够难」——模型有基础但不够稳定,RL 边际收益最大</strong></td>
</tr>
<tr>
<td align="center">6-8 条</td>
<td align="left">排除</td>
<td align="left">模型已掌握该问题,RL 无提升空间</td>
</tr>
</tbody></table>
<p>最终保留 6.6 万条 query 用于训练.这一筛选策略体现了对 RL 训练动态的深刻理解:RL 不是万能的,它只能在「模型已经部分掌握但需要进一步巩固&quot;的问题上发挥作用.</p>
<h3 id="5-3-reward-shaping-dszxhrh">5.3 Reward Shaping 的双重信号融合</h3>
<p>整体奖励计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>r</mi><mo>=</mo><mi>σ</mi><mo stretchy="false">(</mo><mi>α</mi><mo>⋅</mo><msub><mi>r</mi><mi>m</mi></msub><mo stretchy="false">)</mo><mo>+</mo><mo stretchy="false">(</mo><msub><mi>r</mi><mi>v</mi></msub><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r = \\sigma(\\alpha \\cdot r_m) + (r_v - 1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>0.5</mn></mrow><annotation encoding="application/x-tex">\\alpha = 0.5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.5</span></span></span></span>,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>m</mi></msub><mo>∈</mo><mi mathvariant="double-struck">R</mi></mrow><annotation encoding="application/x-tex">r_m \\in \\mathbb{R}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6889em;"></span><span class="mord mathbb">R</span></span></span></span> 为奖励模型输出,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>v</mi></msub><mo>∈</mo><mo stretchy="false">{</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">r_v \\in \\{0, 1\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">}</span></span></span></span> 为基于规则验证器的稀疏奖励.</p>
<table>
<thead>
<tr>
<th align="left">信号</th>
<th align="center">取值范围</th>
<th align="left">作用</th>
<th align="left">特性</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi><mo stretchy="false">(</mo><mi>α</mi><mo>⋅</mo><msub><mi>r</mi><mi>m</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\sigma(\\alpha \\cdot r_m)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(0, 1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">)</span></span></span></span></td>
<td align="left">细粒度质量排序</td>
<td align="left">连续,区分「好对&quot;和「更好对&quot;</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>r</mi><mi>v</mi></msub><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(r_v - 1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span></span></span></span></td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">{</mo><mo>−</mo><mn>1</mn><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\{-1, 0\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord">−</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">}</span></span></span></span></td>
<td align="left">正确性二元判断</td>
<td align="left">离散,确保正确解答始终获得更高总奖励</td>
</tr>
</tbody></table>
<p>这一 shaping 机制实现了「先分对错,再比质量&quot;的两层区分:</p>
<ul>
<li>正确解答的总奖励范围: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">)</mo><mo>+</mo><mn>0</mn><mo>=</mo><mo stretchy="false">(</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(0, 1) + 0 = (0, 1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">)</span></span></span></span></li>
<li>错误解答的总奖励范围: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">)</mo><mo>+</mo><mo stretchy="false">(</mo><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><mo>−</mo><mn>1</mn><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(0, 1) + (-1) = (-1, 0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">−</span><span class="mord">1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">−</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">)</span></span></span></span></li>
</ul>
<p>正确组和错误组之间形成了不可逾越的鸿沟,而组内则按奖励模型分数进行细粒度排序.</p>
<hr>
<h2 id="6-sjqw-scpjdbyx">6. 数据去污:双层判据的必要性</h2>
<p>Qwen2.5-Math 采用 <strong>13-gram 匹配 + 最长公共子序列(LCS)比例 &gt; 0.6</strong> 的双层判据:</p>
<table>
<thead>
<tr>
<th align="left">判据</th>
<th align="left">捕获类型</th>
<th align="left">局限</th>
</tr>
</thead>
<tbody><tr>
<td align="left">13-gram</td>
<td align="left">精确或近精确复制</td>
<td align="left">对改写变体敏感度过低</td>
</tr>
<tr>
<td align="left">LCS 比例 &gt; 0.6</td>
<td align="left">结构相似但表述不同的变体</td>
<td align="left">计算成本更高</td>
</tr>
</tbody></table>
<p>精译文档中展示了 MATH 训练集中被过滤的样本与测试集的相似案例:</p>
<table>
<thead>
<tr>
<th align="left">MATH 训练集(已过滤)</th>
<th align="left">MATH 测试集</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>+</mo><mn>2</mn><mo>+</mo><mn>3</mn><mo>+</mo><mo>⋯</mo><mo>+</mo><mn>9</mn><mo>+</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">1+2+3+\\cdots+9+10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">9</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10</span></span></span></span> 除以 8 的余数?</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>+</mo><mn>2</mn><mo>+</mo><mn>3</mn><mo>+</mo><mo>⋯</mo><mo>+</mo><mn>9</mn><mo>+</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">1+2+3+\\cdots+9+10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">9</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10</span></span></span></span> 除以 9 的余数?</td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mi mathvariant="normal">/</mi><mn>1400</mn></mrow><annotation encoding="application/x-tex">n/1400</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">n</span><span class="mord">/1400</span></span></span></span> 小数终止的整数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> (1-1000) 个数?</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi><mi mathvariant="normal">/</mi><mn>1375</mn></mrow><annotation encoding="application/x-tex">n/1375</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">n</span><span class="mord">/1375</span></span></span></span> 小数终止的整数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> (1-1000) 个数?</td>
</tr>
<tr>
<td align="left">每天翻倍存钱,总金额先超过 \$2 的是星期几?</td>
<td align="left">每天翻倍存钱,总金额先超过 \$5 的是星期几?</td>
</tr>
</tbody></table>
<p>这些案例表明,即使问题参数发生微小变化,核心解题思路也完全相同,若保留在训练集中将严重高估模型真实能力.双层判据的设计弥补了单一 n-gram 方法的不足.</p>
<hr>
<h2 id="7-xnfx-kccyqynlbj">7. 性能分析:跨尺寸跃迁与能力边界</h2>
<h3 id="7-1-base-mxd-scaling-qx">7.1 Base 模型的 Scaling 曲线</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">GSM8K</th>
<th align="center">MATH</th>
<th align="center">MMLU-STEM</th>
<th align="center">CMATH</th>
<th align="center">GaoKao Cloze</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen2-Math-1.5B</td>
<td align="center">71.3</td>
<td align="center">44.4</td>
<td align="center">50.4</td>
<td align="center">79.6</td>
<td align="center">37.3</td>
</tr>
<tr>
<td align="left">Qwen2.5-Math-1.5B</td>
<td align="center">76.8</td>
<td align="center">49.8</td>
<td align="center">51.3</td>
<td align="center">83.0</td>
<td align="center">47.5</td>
</tr>
<tr>
<td align="left"><strong>提升</strong></td>
<td align="center"><strong>+5.5</strong></td>
<td align="center"><strong>+5.4</strong></td>
<td align="center"><strong>+0.9</strong></td>
<td align="center"><strong>+3.4</strong></td>
<td align="center"><strong>+10.2</strong></td>
</tr>
<tr>
<td align="left">Qwen2-Math-7B</td>
<td align="center">80.4</td>
<td align="center">50.4</td>
<td align="center">65.7</td>
<td align="center">83.2</td>
<td align="center">48.3</td>
</tr>
<tr>
<td align="left">Qwen2.5-Math-7B</td>
<td align="center">91.6</td>
<td align="center">55.4</td>
<td align="center">67.8</td>
<td align="center">85.0</td>
<td align="center">57.6</td>
</tr>
<tr>
<td align="left"><strong>提升</strong></td>
<td align="center"><strong>+11.2</strong></td>
<td align="center"><strong>+5.0</strong></td>
<td align="center"><strong>+2.1</strong></td>
<td align="center"><strong>+1.8</strong></td>
<td align="center"><strong>+9.3</strong></td>
</tr>
<tr>
<td align="left">Qwen2-Math-72B</td>
<td align="center">89.1</td>
<td align="center">60.5</td>
<td align="center">79.1</td>
<td align="center">86.4</td>
<td align="center">72.9</td>
</tr>
<tr>
<td align="left">Qwen2.5-Math-72B</td>
<td align="center">90.8</td>
<td align="center">66.8</td>
<td align="center">82.8</td>
<td align="center">89.7</td>
<td align="center">72.9</td>
</tr>
<tr>
<td align="left"><strong>提升</strong></td>
<td align="center"><strong>+1.7</strong></td>
<td align="center"><strong>+6.3</strong></td>
<td align="center"><strong>+3.7</strong></td>
<td align="center"><strong>+3.3</strong></td>
<td align="center"><strong>0.0</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-Math 在所有尺寸上均超越 Qwen2-Math,验证了 Corpus v2 和更强基座的双重价值.值得注意的是,Qwen2.5-Math-7B 在 GSM8K(91.6)上超过了 Qwen2-72B(89.5)和 Llama-3.1-405B(89.0),证明了数据质量和训练策略的改进可以作为参数规模扩展的替代路径.</p>
<h3 id="7-2-instruct-mxdjsjnl">7.2 Instruct 模型的竞赛级能力</h3>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">AIME24 (CoT)</th>
<th align="center">AIME24 (TIR)</th>
<th align="center">AMC23 (CoT)</th>
<th align="center">AMC23 (TIR)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Claude 3 Opus</td>
<td align="center">2/30</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">GPT-4 Turbo</td>
<td align="center">1/30</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">Gemini 1.5 Pro</td>
<td align="center">2/30</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">Qwen2-Math-72B-Instruct</td>
<td align="center">6/30</td>
<td align="center">—</td>
<td align="center">24/40</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">Qwen2.5-Math-72B-Instruct</td>
<td align="center">9/30</td>
<td align="center">12/30</td>
<td align="center">28/40</td>
<td align="center">28/40</td>
</tr>
</tbody></table>
<p>在极其困难的 AIME 2024 上,Claude 3 Opus、GPT-4 Turbo 和 Gemini 1.5 Pro 仅解出 1-2 题,而 Qwen2.5-Math-72B-Instruct 在 TIR 模式下解出 12 题.借助奖励模型,Qwen2.5-Math-7B-Instruct 甚至能够解出 21 题(RM@256),进一步证明了奖励模型在推理时的巨大价值.</p>
<h3 id="7-3-kccxnyqdqs">7.3 跨尺寸性能跃迁的启示</h3>
<p>Qwen2.5-Math-1.5B-Instruct 在 CoT 模式下超过了所有参数量低于 70B 的模型;Qwen2.5-Math-7B-Instruct 几乎达到 Qwen2-Math-72B-Instruct 的性能.这一现象揭示了一个重要趋势:</p>
<ul>
<li><strong>数据质量与训练策略的改进可以作为参数规模扩展的替代路径</strong></li>
<li>在特定领域(如数学),精心设计的合成数据 pipeline 和 RL 训练流程可能比单纯增大模型尺寸更具成本效益</li>
<li>然而,这一结论是否能推广到通用能力仍存疑——数学问题的结构化和可验证性使其特别适合合成数据驱动的方法</li>
</ul>
<hr>
<h2 id="8-jsskjd">8. 技术思考节点</h2>
<h3 id="8-1-sjdj">8.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么需要数学专用模型而非通用模型的数学能力增强?</strong></p>
</blockquote>
<p>通用语言模型在数学推理上的次优表现根源在于预训练阶段数学数据的不足.专用数学模型的价值不仅在于聚焦数据分布,更在于可以引入数学特有的训练范式——拒绝采样、奖励模型、工具集成推理——这些范式在通用模型的训练中难以获得足够关注和资源倾斜.此外,数学问题的「可验证性」(答案明确正确或错误)使其特别适合自动化数据生成和质量评估,这是通用开放域任务所不具备的优势.</p>
<blockquote>
<p><strong>思考 2: 自提升闭环的核心设计逻辑</strong></p>
</blockquote>
<p>Qwen2.5-Math 的自提升闭环本质是将模型自身作为「数据生成器」和「质量评判者&quot;:</p>
<ul>
<li><strong>预训练</strong>: 用 Qwen2-Math-72B-Instruct 合成 Corpus v2</li>
<li><strong>SFT</strong>: 用拒绝采样迭代进化 CoT/TIR 数据</li>
<li><strong>RM</strong>: 在大量采样数据上训练细粒度奖励模型</li>
<li><strong>RL</strong>: 用 GRPO + reward shaping 持续优化策略</li>
<li><strong>推理</strong>: 用 RM 进行 best-of-N 采样</li>
</ul>
<p>这一闭环在人工标注极为昂贵的数学领域实现了规模化数据自给,但其前提是「当前模型已经足够强,能够生成比训练数据更高质量的合成数据&quot;.如果初始模型质量过低,闭环可能陷入「垃圾进垃圾出&quot;的困境.</p>
<h3 id="8-2-sjsy">8.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: Corpus v2 相比 v1 的关键增量分析</strong></p>
</blockquote>
<p>Corpus v2 的三项核心增量:(1) <strong>合成数据生成器升级</strong>——从 Qwen2-72B-Instruct 升级到 Qwen2-Math-72B-Instruct,合成数据质量跃迁;(2) <strong>中文数据扩充</strong>——多轮召回聚合更多高质量中文数学数据,解决了 Qwen2-Math 中文能力不足的短板;(3) <strong>更强基座初始化</strong>——从 Qwen2 升级到 Qwen2.5,更强的语言理解和代码能力为数学推理提供了更好的基础表示.这三项增量中,第一项(合成数据)的贡献可能最大,因为数学预训练的核心瓶颈是高质量数学语料的稀缺性,而合成数据是突破这一瓶颈的关键.</p>
<blockquote>
<p><strong>思考 4: CoT 与 TIR 数据合成策略的差异与协同</strong></p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">CoT 数据</th>
<th align="left">TIR 数据</th>
</tr>
</thead>
<tbody><tr>
<td align="left">问题来源</td>
<td align="left">GSM8K/MATH/NuminaMath + K-12 中文题库</td>
<td align="left">GSM8K/MATH/CollegeMath/NuminaMath</td>
</tr>
<tr>
<td align="left">问题演化</td>
<td align="left">MuggleMath</td>
<td align="left">MuggleMath + DotaMath</td>
</tr>
<tr>
<td align="left">解答生成</td>
<td align="left">迭代拒绝采样,基于 RM 和标注答案筛选</td>
<td align="left">在线 RFT,多温度核采样 + 迭代去重</td>
</tr>
<tr>
<td align="left">数据规模</td>
<td align="left">200万英文 + 50万中文</td>
<td align="left">19.5万英文 + 中文翻译</td>
</tr>
<tr>
<td align="left">核心挑战</td>
<td align="left">推理路径质量</td>
<td align="left">工具调用格式与计算精确度</td>
</tr>
</tbody></table>
<p>CoT 数据规模更大(250万 vs 约20万),因为自然语言推理的数据生成成本更低;TIR 数据需要确保生成的 Python 代码可执行且输出正确,质量验证成本更高.两者的联合训练使模型能够根据问题特征自动选择推理模式——这种「路由能力&quot;本身也是训练的结果.</p>
<h3 id="8-3-jgxj">8.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: 奖励模型的 listwise 损失设计的工程意义</strong></p>
</blockquote>
<p>Qwen2.5-Math-RM 的 listwise 损失:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>r</mi><mi>m</mi></mrow></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><mfrac><mn>1</mn><mrow><mi>k</mi><mo stretchy="false">(</mo><mn>6</mn><mo>−</mo><mi>k</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>∑</mo><mi>log</mi><mo>⁡</mo><mi>σ</mi><mo stretchy="false">(</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>p</mi><mi>o</mi><mi>s</mi></mrow></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>n</mi><mi>e</mi><mi>g</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{rm}(\\theta) = -\\frac{1}{k(6-k)} \\sum \\log \\sigma(r_\\theta(x, y_{pos}) - r_\\theta(x, y_{neg}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2574em;vertical-align:-0.936em;"></span><span class="mord">−</span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mopen">(</span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-symbol large-op" style="position:relative;top:0em;">∑</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">os</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span></span></span></span><p>这一设计的工程意义在于:(1) 每个 query 的 6 条解答被整体处理,保留了完整的偏好排序信息;(2) 避免了将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>×</mo><mo stretchy="false">(</mo><mn>6</mn><mo>−</mo><mi>k</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">k \\times (6-k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span></span> 对拆分为独立样本带来的信息损失——pairwise 方法丢失了「解答 A &gt; 解答 B &gt; 解答 C&quot;的传递关系;(3) 在数学推理中,同一问题的多条错误解答可能有不同的「错误程度&quot;(如「计算错误但思路正确&quot; vs 「完全错误的思路&quot;),listwise 方法能够捕获这种细粒度差异.从实现角度看,listwise 损失与 pairwise 损失的计算复杂度相近,但效果更优,是「免费&quot;的性能提升.</p>
<blockquote>
<p><strong>思考 6: GRPO 的 group-level baseline 为何适合数学推理?</strong></p>
</blockquote>
<p>GRPO 相比 PPO 消除了价值函数近似的需求:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\hat{A}_i = \\frac{r_i - \\text{mean}(r)}{\\text{std}(r)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0968em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">std</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">mean</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这一设计特别适合数学推理的原因:(1) 同一 group(同一问题的多条采样解答)内的难度是相近的,因此组内平均奖励是一个合理的 baseline——它代表了「这个问题的平均解答质量&quot;;(2) 数学问题的奖励分布往往很稀疏(多数解答错误,少数正确),全局 value model 难以准确估计不同问题的绝对难度,但组内相对排序是稳定的;(3) 省去了训练独立 value model 的计算开销,简化了 RL 系统的复杂度.局限在于:如果同一 group 内的解答质量差异过大(如 7 条错误 + 1 条正确),baseline 可能被少数高质量解答拉高,导致优势估计偏差.</p>
<h3 id="8-4-jxyfx">8.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: TIR 模式在中文上的「失效&quot;现象及其启示</strong></p>
</blockquote>
<p>报告坦诚指出:TIR 在中文基准上未展现显著优势,与英文上 TIR 大幅超越 CoT 形成对比.可能原因:(1) 中文数学题以「填空/解答&quot;为主,对精确数值计算的需求不如英文竞赛题强烈;(2) 中文 TIR 数据的规模和质量可能不及英文;(3) Python 解释器处理中文文本输出的格式兼容性问题.这一观察提醒我们:工具集成推理的价值高度依赖于任务类型和语言特性.在需要大量精确计算的工程数学、物理模拟、金融建模等场景中,TIR 的价值可能更大;而在以概念理解和逻辑推导为主的纯数学场景中,CoT 可能已足够.</p>
<blockquote>
<p><strong>思考 8: 数据去污的双层判据是否足够?</strong></p>
</blockquote>
<p>13-gram + LCS &gt; 0.6 的双层判据能够捕获精确复制和结构相似变体,但对于以下情况仍可能失效:(1) <strong>概念等价但表述完全不同</strong>的问题——如用不同变量名、不同场景包装的同一数学原理;(2) <strong>多步组合</strong>——训练集中的单步问题与测试集中的多步组合问题共享部分子问题;(3) <strong>元技能迁移</strong>——模型在训练集中学会的「如何解二次方程&quot;的元技能,在测试集中以不同形式应用.这些「间接记忆&quot;或「技能迁移&quot;难以通过字符串匹配检测,是当前所有去污染方法的共同局限.更严格的方案可能需要评估模型的「解题思路相似度&quot;而非「文本相似度&quot;,但这需要人工定义「思路&quot;的表示,成本极高.</p>
<h3 id="8-5-jspx">8.5 技术谱系</h3>
<blockquote>
<p><strong>思考 9: Qwen2.5-Math 在数学模型演进中的位置</strong></p>
</blockquote>
<p>数学专用模型的发展脉络:</p>
<pre><code>Minerva(2022): PaLM + 数学网页数据持续预训练
    |
DeepSeekMath(2024): 专门数学语料 + GRPO + 工具使用
    |
Qwen2-Math(2024): Qwen2 + 700B 数学语料 + RM + RL
    |
Qwen2.5-Math(2024): 自提升闭环 + Corpus v2(&gt;1T) + CoT/TIR 双语 + 细粒度 RM
    |
NuminaMath(2024): 大规模开源数学指令数据集
</code></pre>
<p>Qwen2.5-Math 的差异化贡献:(1) <strong>系统化的自提升闭环</strong>——从数据合成到 RL 训练的完整自动化 pipeline;(2) <strong>双语 CoT + TIR 联合训练</strong>——首次在数学模型中系统整合中文推理和工具使用;(3) <strong>跨尺寸性能跃迁</strong>——证明了数据策略可以弥补参数规模的差距.对后续工作的影响:Qwen3-Math 系列直接继承了这一 pipeline 并扩展到更大规模;「合成数据 + 自提升&quot;范式正在被物理、化学、生物等 STEM 领域借鉴.</p>
<blockquote>
<p><strong>思考 10: 数学模型方法论向其他 STEM 领域的迁移可能性</strong></p>
</blockquote>
<p>Qwen2.5-Math 的成功方法论能否迁移到物理、化学、生物等领域?关键因素分析:</p>
<table>
<thead>
<tr>
<th align="left">因素</th>
<th align="center">数学</th>
<th align="center">物理</th>
<th align="center">化学</th>
<th align="center">生物</th>
</tr>
</thead>
<tbody><tr>
<td align="left">答案可验证性</td>
<td align="center">高(精确解)</td>
<td align="center">中(数值模拟)</td>
<td align="center">中(实验验证)</td>
<td align="center">低(统计显著性)</td>
</tr>
<tr>
<td align="left">问题结构化程度</td>
<td align="center">高</td>
<td align="center">中高</td>
<td align="center">中</td>
<td align="center">低</td>
</tr>
<tr>
<td align="left">合成数据可行性</td>
<td align="center">高</td>
<td align="center">中</td>
<td align="center">中</td>
<td align="center">低</td>
</tr>
<tr>
<td align="left">工具集成价值</td>
<td align="center">高(符号计算)</td>
<td align="center">高(数值求解)</td>
<td align="center">高(分子模拟)</td>
<td align="center">中(序列分析)</td>
</tr>
<tr>
<td align="left">标注数据成本</td>
<td align="center">高</td>
<td align="center">高</td>
<td align="center">高</td>
<td align="center">高</td>
</tr>
</tbody></table>
<p>数学之所以成为「自提升闭环&quot;的理想试验场,是因为其答案的精确可验证性和问题的高度结构化.物理和化学在「工具集成&quot;维度有类似需求(如数值求解、分子模拟),但答案验证更复杂.生物领域由于问题的开放性和答案的不确定性,自提升闭环的构建难度最大.Qwen2.5-Math 的核心经验——「利用模型自身生成合成数据 + 自动化验证&quot;——在向其他 STEM 领域迁移时,最大的挑战是设计各领域的「自动化验证器&quot;.</p>
<hr>
<h2 id="9-bssj-mxxzyjcjy">9. 部署视角:模型选择与集成建议</h2>
<h3 id="9-1-cj-mxpp">9.1 场景-模型匹配</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐模型</th>
<th align="center">推理模式</th>
<th align="left">理由</th>
</tr>
</thead>
<tbody><tr>
<td align="left">中小学数学辅导</td>
<td align="left">1.5B/7B CoT</td>
<td align="center">CoT</td>
<td align="left">成本低,CoT 可解释性强,适合教学</td>
</tr>
<tr>
<td align="left">竞赛数学(AIME/AMC)</td>
<td align="left">72B TIR + RM@N</td>
<td align="center">TIR</td>
<td align="left">TIR MATH 88.1,AIME 12/30,RM 进一步提升</td>
</tr>
<tr>
<td align="left">大学理工科作业</td>
<td align="left">7B/72B TIR</td>
<td align="center">TIR</td>
<td align="left">College Math 57.7,可处理复杂计算</td>
</tr>
<tr>
<td align="left">数学证明/逻辑推导</td>
<td align="left">72B CoT</td>
<td align="center">CoT</td>
<td align="left">CoT 更适合概念理解和证明构造</td>
</tr>
<tr>
<td align="left">中文数学考试(GaoKao)</td>
<td align="left">72B CoT</td>
<td align="center">CoT</td>
<td align="left">中文 TIR 优势不明显,CoT CMATH 94.3</td>
</tr>
<tr>
<td align="left">实时数学问答(低延迟)</td>
<td align="left">1.5B CoT</td>
<td align="center">CoT</td>
<td align="left">响应快,成本极低,MATH 75.8 已超越多数竞品</td>
</tr>
</tbody></table>
<h3 id="9-2-tlcbyzlqh">9.2 推理成本与质量权衡</h3>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="center">贪婪解码</th>
<th align="center">Maj@8</th>
<th align="center">RM@8</th>
<th align="center">成本倍数</th>
</tr>
</thead>
<tbody><tr>
<td align="left">CoT 1.5B</td>
<td align="center">75.8</td>
<td align="center">~78</td>
<td align="center">~80</td>
<td align="center">1x</td>
</tr>
<tr>
<td align="left">CoT 7B</td>
<td align="center">83.6</td>
<td align="center">~86</td>
<td align="center">~88</td>
<td align="center">4x</td>
</tr>
<tr>
<td align="left">CoT 72B</td>
<td align="center">85.9</td>
<td align="center">~88</td>
<td align="center">~90</td>
<td align="center">48x</td>
</tr>
<tr>
<td align="left">TIR 1.5B</td>
<td align="center">79.9</td>
<td align="center">~82</td>
<td align="center">~84</td>
<td align="center">2x(含执行)</td>
</tr>
<tr>
<td align="left">TIR 72B</td>
<td align="center">88.1</td>
<td align="center">~90</td>
<td align="center">~92</td>
<td align="center">96x(含执行)</td>
</tr>
</tbody></table>
<blockquote>
<p>注:成本倍数基于模型参数规模估算,实际成本还取决于推理框架(vLLM、TensorRT-LLM 等)和硬件配置.TIR 模式的额外开销来自 Python 解释器的执行时间和 I/O 延迟.对于生产部署,建议根据任务难度动态选择模型尺寸和推理模式:简单问题用 1.5B CoT,复杂问题用 7B/72B TIR,竞赛级问题用 RM@N 采样.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Qwen2.5-Math Technical Report, arXiv:2409.12122</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.2-qwen/07-qwen2.5-math/01-qwen2.5-math-jsbgjy">01-Qwen2.5-Math技术报告精译</a></li>
<li>相关模型: DeepSeekMath (arXiv:2402.03300)、NuminaMath (arXiv:2406.14215)</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxfs-ztsbhdsldd","text":"1. 核心范式:自提升闭环的三轮迭代"},{"level":2,"id":"2-yxlsjgc-c-v1-d-v2-dky","text":"2. 预训练数据工程:从 v1 到 v2 的跨越"},{"level":3,"id":"2-1-qwen-math-corpus-dyjdb","text":"2.1 Qwen Math Corpus 的演进对比"},{"level":3,"id":"2-2-sjzhygldscjg","text":"2.2 数据召回与过滤的三层架构"},{"level":2,"id":"3-sgtltx-cot-y-tir-dhbsj","text":"3. 双轨推理体系:CoT 与 TIR 的互补设计"},{"level":3,"id":"3-1-lztlmsddwcy","text":"3.1 两种推理模式的定位差异"},{"level":3,"id":"3-2-tir-dsjgssj","text":"3.2 TIR 的数据格式设计"},{"level":3,"id":"3-3-cot-vs-tir-dxnhg","text":"3.3 CoT vs TIR 的性能鸿沟"},{"level":2,"id":"4-jlmx-listwise-pxyxldfk","text":"4. 奖励模型:Listwise 排序与细粒度反馈"},{"level":3,"id":"4-1-sjgjcl","text":"4.1 数据构建策略"},{"level":3,"id":"4-2-listwise-sssj","text":"4.2 Listwise 损失设计"},{"level":3,"id":"4-3-rm-ztlsdjz","text":"4.3 RM 在推理时的价值"},{"level":2,"id":"5-qhxx-grpo-reward-shaping","text":"5. 强化学习:GRPO + Reward Shaping"},{"level":3,"id":"5-1-grpo-d-group-level-baseline","text":"5.1 GRPO 的 Group-Level Baseline"},{"level":3,"id":"5-2-query-sxd-goldilocks-yz","text":"5.2 Query 筛选的「Goldilocks 原则」"},{"level":3,"id":"5-3-reward-shaping-dszxhrh","text":"5.3 Reward Shaping 的双重信号融合"},{"level":2,"id":"6-sjqw-scpjdbyx","text":"6. 数据去污:双层判据的必要性"},{"level":2,"id":"7-xnfx-kccyqynlbj","text":"7. 性能分析:跨尺寸跃迁与能力边界"},{"level":3,"id":"7-1-base-mxd-scaling-qx","text":"7.1 Base 模型的 Scaling 曲线"},{"level":3,"id":"7-2-instruct-mxdjsjnl","text":"7.2 Instruct 模型的竞赛级能力"},{"level":3,"id":"7-3-kccxnyqdqs","text":"7.3 跨尺寸性能跃迁的启示"},{"level":2,"id":"8-jsskjd","text":"8. 技术思考节点"},{"level":3,"id":"8-1-sjdj","text":"8.1 设计动机"},{"level":3,"id":"8-2-sjsy","text":"8.2 数据实验"},{"level":3,"id":"8-3-jgxj","text":"8.3 架构细节"},{"level":3,"id":"8-4-jxyfx","text":"8.4 局限与风险"},{"level":3,"id":"8-5-jspx","text":"8.5 技术谱系"},{"level":2,"id":"9-bssj-mxxzyjcjy","text":"9. 部署视角:模型选择与集成建议"},{"level":3,"id":"9-1-cj-mxpp","text":"9.1 场景-模型匹配"},{"level":3,"id":"9-2-tlcbyzlqh","text":"9.2 推理成本与质量权衡"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/07-qwen2.5-math/05-qwen2.5-math-mathematical-reasoning" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/07-qwen2.5-math/05-qwen2.5-math-mathematical-reasoning" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-Math 数理逻辑剖析</h1>
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
