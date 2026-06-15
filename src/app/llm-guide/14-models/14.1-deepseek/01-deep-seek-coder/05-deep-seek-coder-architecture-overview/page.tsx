"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文是对 DeepSeek-Coder 技术报告(arXiv:2401.14196)中架构与工程决策的深度解读，聚焦「为什么这样设计」以及「工程落地时的权衡」。</p>
</blockquote>
<hr>
<h2 id="1-ztdw-clxldkydmmx">1. 总体定位: 从零训练的开源代码模型</h2>
<p>DeepSeek-Coder 是 DeepSeek 家族的第一个重要开源模型，其核心定位非常清晰:<strong>用开源、可商用的代码模型打破闭源模型(Codex、GPT-3.5)在代码智能领域的垄断</strong>。</p>
<p>与后续 DeepSeek-Coder-V2 选择「继续预训练通用基座」不同，DeepSeek-Coder 选择了「从零训练」路线:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>DeepSeek-Coder</th>
<th>DeepSeek-Coder-V2</th>
</tr>
</thead>
<tbody><tr>
<td>基座</td>
<td>从零训练</td>
<td>DeepSeek-V2 中间Checkpoint</td>
</tr>
<tr>
<td>数据配比</td>
<td>87% 代码 + 13% 自然语言</td>
<td>60% 代码 + 10% 数学 + 30% 自然语言</td>
</tr>
<tr>
<td>编程语言</td>
<td>87 种</td>
<td>338 种</td>
</tr>
<tr>
<td>上下文长度</td>
<td>16K</td>
<td>128K</td>
</tr>
<tr>
<td>最大规模</td>
<td>33B 稠密</td>
<td>236B MoE(21B 激活)</td>
</tr>
<tr>
<td>架构</td>
<td>DeepSeek-LLM(标准 Transformer)</td>
<td>DeepSeek-V2(MLA + DeepSeekMoE)</td>
</tr>
</tbody></table>
<blockquote>
<p>设计动机节点: 为什么第一版选择从零训练而非继续预训练? 2023 年底 DeepSeek 的通用基座模型(DeepSeek-LLM)刚刚发布，其通用能力虽然不错，但还没有达到可以作为「万能基座」的程度。在代码这个垂直领域，从零训练可以更精确地控制数据配比(87% 代码)、分词器(32K 词汇量专门面向代码)和架构细节(如 GQA 在 33B 上的应用)。此外，从零训练能够避免通用语料中的「非代码模式」对代码能力的潜在干扰。这个决策在工程上虽然成本更高，但为 DeepSeek 积累了从零构建代码模型的完整经验——这些经验后来被用于优化 Coder-V2 的数据工程流水线。</p>
</blockquote>
<hr>
<h2 id="2-sjgc-ckjylkdgj">2. 数据工程: 仓库级语料库的构建</h2>
<h3 id="2-1-tppx-cwjjdckjdzb">2.1 拓扑排序: 从文件级到仓库级的质变</h3>
<p>DeepSeek-Coder 数据工程中最具创新性的决策是「仓库级预训练」。传统代码模型(如 StarCoder、CodeLlama)将代码文件视为独立的文本片段进行预训练，这导致模型虽然擅长单文件内的代码生成，但在处理跨文件引用时表现不佳。</p>
<p>DeepSeek-Coder 的解决方案分为三步:</p>
<ol>
<li><strong>依赖解析</strong>: 使用正则表达式提取文件间的 import/include/using 关系，构建仓库内的依赖图。</li>
<li><strong>拓扑排序</strong>: 对依赖图进行拓扑排序，确保被依赖的文件排在依赖它的文件之前。对于循环依赖(如 A import B, B import A)，采用「最小入度」策略选择下一个文件，而非要求入度为零。</li>
<li><strong>序列拼接</strong>: 将排序后的文件按顺序拼接成训练样本，每个文件开头添加路径注释。</li>
</ol>
<blockquote>
<p>架构细节节点: 拓扑排序的「最小入度」变体是一个务实的工程选择。标准拓扑排序要求无环图(DAG)，但真实代码库中循环依赖非常常见——Python 的相互 import、C 的头文件循环引用等。如果强制要求无环，要么需要人为打破循环(引入偏差)，要么会丢失大量真实数据。最小入度策略的优雅之处在于:它不需要修改数据，而是通过「先处理依赖最少的节点」来近似拓扑序。当遇到 A&lt;-&gt;B 的循环时，A 和 B 的入度都是 1，算法会任意选择一个(通常取决于遍历顺序)，将其入度降为 0 后处理另一个。虽然这不是严格的最优解，但在统计意义上，它保留了绝大多数的「依赖在前、使用在后」的顺序信息。</p>
</blockquote>
<h3 id="2-2-ckjqz-bcjgwzx">2.2 仓库级去重: 保持结构完整性</h3>
<p>去重是大语言模型数据预处理的标准步骤，但 DeepSeek-Coder 在「去重粒度」上做出了关键创新:</p>
<ul>
<li><strong>文件级去重</strong>(StarCoder 等): 逐文件计算 minhash，重复文件被删除。风险:一个仓库中部分文件被删、部分保留，导致 import 了不存在模块的「断链」代码。</li>
<li><strong>仓库级去重</strong>(DeepSeek-Coder): 将整个仓库的连接代码视为单个样本进行 minhash 去重。要么整个仓库保留，要么整个删除。</li>
</ul>
<blockquote>
<p>工程落地视角: 这个决策的代价是「去重不够精细」——如果一个大仓库中只有 10% 的文件与另一个仓库重复，文件级去重可以只删除这 10%，而仓库级去重会删除整个仓库。但论文认为，保持仓库结构的完整性带来的收益超过了这种代价。实际上，GitHub 上相同功能的仓库克隆(如 fork)在去重时本就应该被整体删除，所以仓库级去重在这个场景下反而是更合理的。</p>
</blockquote>
<h3 id="2-3-zlsxdscfy">2.3 质量筛选的三层防御</h3>
<p>DeepSeek-Coder 的数据质量控制采用了三层过滤:</p>
<table>
<thead>
<tr>
<th>层级</th>
<th>方法</th>
<th>过滤目标</th>
<th>数据保留率</th>
</tr>
</thead>
<tbody><tr>
<td>第一层: 规则过滤</td>
<td>行长度、字母比例、HTML 文本比、JSON/YAML 长度</td>
<td>minified 代码、数据文件、配置文件</td>
<td>32.8%</td>
</tr>
<tr>
<td>第二层: 编译器检查</td>
<td>用对应语言的编译器/解释器检查语法</td>
<td>语法错误代码</td>
<td>未公开</td>
</tr>
<tr>
<td>第三层: 质量模型</td>
<td>训练一个质量打分模型</td>
<td>可读性差、模块化低的代码</td>
<td>未公开</td>
</tr>
</tbody></table>
<p>三层防御的累积效果是将原始 GitHub 数据压缩到约 798GB、6.03 亿个文件。虽然论文没有给出每层的具体保留率，但「规则过滤 32.8%」这个数字说明，仅第一层就过滤掉了约 2/3 的数据——GitHub 上的原始数据质量确实堪忧。</p>
<hr>
<h2 id="3-xlcldjxhty">3. 训练策略的精细化调优</h2>
<h3 id="3-1-fim-bsdxrsy">3.1 FIM 比率的消融实验</h3>
<p>DeepSeek-Coder 对 FIM(Fill-in-the-Middle)训练策略进行了系统的消融实验，这是代码预训练领域最早的系统性分析之一:</p>
<table>
<thead>
<tr>
<th>配置</th>
<th>HumanEval-FIM</th>
<th>HumanEval(生成)</th>
<th>MBPP</th>
</tr>
</thead>
<tbody><tr>
<td>0% FIM(纯 NTP)</td>
<td>较低</td>
<td>较高</td>
<td>较高</td>
</tr>
<tr>
<td>50% PSM</td>
<td>中等</td>
<td>中等</td>
<td>中等</td>
</tr>
<tr>
<td>50% MSP</td>
<td>中等</td>
<td>略低于 PSM</td>
<td>略低于 PSM</td>
</tr>
<tr>
<td>100% FIM</td>
<td>最高</td>
<td>最低</td>
<td>最低</td>
</tr>
</tbody></table>
<p>实验结论:</p>
<ul>
<li>FIM 和代码生成能力之间存在明确的权衡(trade-off)。</li>
<li>50% PSM 率优于 MSP(Masked Span Prediction)策略。</li>
<li>最终选择 50% PSM 率作为平衡方案。</li>
</ul>
<blockquote>
<p>设计动机节点: 为什么 PSM 优于 MSP? PSM(Prefix-Suffix-Middle)保持了「前缀在前、后缀随后」的直觉顺序，与程序员阅读代码时的认知流一致;而 MSP(Suffix-Prefix-Middle)将后缀放在前缀之前，是一种更「反直觉」的排列。虽然 MSP 在理论上可能增强模型处理任意顺序上下文的能力，但实验表明这种增益不足以弥补对自然顺序学习的干扰。这个发现也解释了为什么后续的代码模型(包括 StarCoder2、CodeLlama 和 DeepSeek-Coder-V2)都默认采用 PSM 模式。</p>
</blockquote>
<h3 id="3-2-sjdxxstd">3.2 三阶段学习率调度</h3>
<p>DeepSeek-Coder 采用了 DeepSeek-LLM 提出的三阶段学习率策略:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>LR</mtext><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mtext>LR</mtext><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub><mo>⋅</mo><mfrac><mi>t</mi><msub><mi>t</mi><mrow><mi>w</mi><mi>a</mi><mi>r</mi><mi>m</mi><mi>u</mi><mi>p</mi></mrow></msub></mfrac></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>t</mi><mo>&lt;</mo><msub><mi>t</mi><mrow><mi>w</mi><mi>a</mi><mi>r</mi><mi>m</mi><mi>u</mi><mi>p</mi></mrow></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mtext>LR</mtext><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>t</mi><mrow><mi>w</mi><mi>a</mi><mi>r</mi><mi>m</mi><mi>u</mi><mi>p</mi></mrow></msub><mo>≤</mo><mi>t</mi><mo>&lt;</mo><mn>0.8</mn><mi>T</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mtext>LR</mtext><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub><mo>⋅</mo><msqrt><mfrac><mn>1</mn><mn>10</mn></mfrac></msqrt></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mn>0.8</mn><mi>T</mi><mo>≤</mo><mi>t</mi><mo>&lt;</mo><mn>0.9</mn><mi>T</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mtext>LR</mtext><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub><mo>⋅</mo><mfrac><mn>1</mn><mn>10</mn></mfrac></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mn>0.9</mn><mi>T</mi><mo>≤</mo><mi>t</mi><mo>≤</mo><mi>T</mi></mrow></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">\\text{LR}(t) = \\begin{cases}
\\text{LR}_{max} \\cdot \\frac{t}{t_{warmup}} &amp; t &lt; t_{warmup} \\\\
\\text{LR}_{max} &amp; t_{warmup} \\leq t &lt; 0.8T \\\\
\\text{LR}_{max} \\cdot \\sqrt{\\frac{1}{10}} &amp; 0.8T \\leq t &lt; 0.9T \\\\
\\text{LR}_{max} \\cdot \\frac{1}{10} &amp; 0.9T \\leq t \\leq T
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">LR</span></span><span class="mopen">(</span><span class="mord mathnormal">t</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:6.2703em;vertical-align:-2.8852em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:3.25em;"><span style="top:-1.366em;"><span class="pstrut" style="height:3.216em;"></span><span class="delimsizinginner delim-size4"><span>⎩</span></span></span><span style="top:-1.358em;"><span class="pstrut" style="height:3.216em;"></span><span style="height:1.216em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="1.216em" style="width:0.8889em" viewBox="0 0 888.89 1216" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V1216 H384z M384 0 H504 V1216 H384z"/></svg></span></span><span style="top:-3.216em;"><span class="pstrut" style="height:3.216em;"></span><span class="delimsizinginner delim-size4"><span>⎨</span></span></span><span style="top:-4.358em;"><span class="pstrut" style="height:3.216em;"></span><span style="height:1.216em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="1.216em" style="width:0.8889em" viewBox="0 0 888.89 1216" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V1216 H384z M384 0 H504 V1216 H384z"/></svg></span></span><span style="top:-5.566em;"><span class="pstrut" style="height:3.216em;"></span><span class="delimsizinginner delim-size4"><span>⎧</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:2.75em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:3.3852em;"><span style="top:-5.6122em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord"><span class="mord text"><span class="mord">LR</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">x</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8246em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">p</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.5423em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span><span style="top:-4.0619em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord"><span class="mord text"><span class="mord">LR</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">x</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.3948em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord"><span class="mord text"><span class="mord">LR</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">x</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2351em;"><span class="svg-align" style="top:-3.8em;"><span class="pstrut" style="height:3.8em;"></span><span class="mord" style="padding-left:1em;"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span><span style="top:-3.1951em;"><span class="pstrut" style="height:3.8em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.88em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.88em" viewBox="0 0 400000 1944" preserveAspectRatio="xMinYMin slice"><path d="M983 90
l0 -0
c4,-6.7,10,-10,18,-10 H400000v40
H1013.1s-83.4,268,-264.1,840c-180.7,572,-277,876.3,-289,913c-4.7,4.7,-12.7,7,-24,7
s-12,0,-12,0c-1.3,-3.3,-3.7,-11.7,-7,-25c-35.3,-125.3,-106.7,-373.3,-214,-744
c-10,12,-21,25,-33,39s-32,39,-32,39c-6,-5.3,-15,-14,-27,-26s25,-30,25,-30
c26.7,-32.7,52,-63,76,-91s52,-60,52,-60s208,722,208,722
c56,-175.3,126.3,-397.3,211,-666c84.7,-268.7,153.8,-488.2,207.5,-658.5
c53.7,-170.3,84.5,-266.8,92.5,-289.5z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.6049em;"><span></span></span></span></span></span></span></span><span style="top:-0.7819em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord"><span class="mord text"><span class="mord">LR</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">x</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:2.8852em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:3.3852em;"><span style="top:-5.6122em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">p</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0619em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">p</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0.8</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-2.3948em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord">0.8</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0.9</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-0.7819em;"><span class="pstrut" style="height:3.2351em;"></span><span class="mord"><span class="mord">0.9</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:2.8852em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这种「阶梯式衰减」而非「平滑余弦衰减」的设计有其独特的考量:</p>
<ul>
<li><strong>第一阶段(warmup)</strong>: 线性增长避免初始阶段的梯度爆炸。</li>
<li><strong>第二阶段(恒定期)</strong>: 让模型在稳定的较大学习率下充分学习数据的主要模式。</li>
<li><strong>第三阶段(第一次衰减)</strong>: 学习率降至约 31.6%，进入「精调」阶段，学习更细粒度的模式。</li>
<li><strong>第四阶段(第二次衰减)</strong>: 学习率降至 10%，进行最终的微调和收敛。</li>
</ul>
<blockquote>
<p>译者注: 这种多阶段调度与常见的 cosine 衰减相比，在超大规模训练(2T token)中展现出更好的收敛稳定性。cosine 衰减在整个训练过程中持续降低学习率，可能导致模型在早期就陷入局部最优;而阶梯式衰减在大部分时间保持较高学习率，给予模型更多「逃离」局部最优的机会。</p>
</blockquote>
<h3 id="3-3-csxwkzdwscl">3.3 长上下文扩展的务实策略</h3>
<p>DeepSeek-Coder 的长上下文扩展策略非常简洁:</p>
<ul>
<li>修改 RoPE 参数:缩放因子从 1 增加到 4，基频从 10000 改为 100000。</li>
<li>继续训练 1000 步，批量大小 512，序列长度 16K。</li>
<li>理论上可处理 64K，但经验上 16K 内最可靠。</li>
</ul>
<p>这个策略的成本极低:仅 1000 步 × 512 × 16K ≈ 8.2B token，占 2T 总训练量的 0.4%。</p>
<blockquote>
<p>局限与风险节点: 论文坦诚地承认「16K 内最可靠」，这意味着线性缩放 RoPE 虽然理论上支持 64K，但实际效果在超过 16K 后显著下降。这是所有位置编码外推方法的共同局限——无论 YARN、NTK-aware 还是线性插值，模型在训练时未见过的长度上都存在「注意力稀释」问题。后续的 DeepSeek-Coder-V2 通过 YARN 和两阶段渐进训练(32K → 128K)才将可靠上下文长度真正扩展到 128K。</p>
</blockquote>
<hr>
<h2 id="4-mxjg-bz-transformer-dsyty">4. 模型架构: 标准 Transformer 的实用调优</h2>
<h3 id="4-1-jggl">4.1 架构概览</h3>
<p>DeepSeek-Coder 的架构基本沿用 DeepSeek-LLM 的设计，是一种标准的Encoder-Only Transformer，主要特点:</p>
<ul>
<li><strong>SwiGLU 激活函数</strong>: 替代传统 ReLU/GELU，提供更强的非线性表达能力。</li>
<li><strong>RoPE 位置编码</strong>: 替代绝对位置编码，更好地处理相对位置关系。</li>
<li><strong>GQA(33B 版本)</strong>: Grouped-Query-Attention，组大小为 8，将 KV 头数从 56 降到 7，显著减少推理时的 KV Cache。</li>
<li><strong>FlashAttention v2</strong>: 加速注意力计算，减少显存占用。</li>
</ul>
<table>
<thead>
<tr>
<th>模型</th>
<th>1.3B</th>
<th>6.7B</th>
<th>33B</th>
</tr>
</thead>
<tbody><tr>
<td>隐藏层维度</td>
<td>2048</td>
<td>4096</td>
<td>7168</td>
</tr>
<tr>
<td>层数</td>
<td>24</td>
<td>32</td>
<td>62</td>
</tr>
<tr>
<td>注意力头数</td>
<td>16</td>
<td>32</td>
<td>56</td>
</tr>
<tr>
<td>注意力类型</td>
<td>MHA</td>
<td>MHA</td>
<td>GQA(8 组)</td>
</tr>
<tr>
<td>中间层维度</td>
<td>5504</td>
<td>11008</td>
<td>19200</td>
</tr>
<tr>
<td>批量大小</td>
<td>1024</td>
<td>2304</td>
<td>3840</td>
</tr>
</tbody></table>
<blockquote>
<p>架构细节节点: GQA 在 33B 版本上的引入是一个关键的效率优化。标准 MHA 中，Query、Key、Value 各有 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">n_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 个头，推理时需要存储 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msub><mi>n</mi><mi>h</mi></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>×</mo><mi>L</mi></mrow><annotation encoding="application/x-tex">2 \\times n_h \\times d_{head} \\times L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 的 KV Cache。GQA 将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">n_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 个 Query 头分成 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>g</mi></msub></mrow><annotation encoding="application/x-tex">n_g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 组，每组共享一组 KV 头，KV Cache 降为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msub><mi>n</mi><mi>g</mi></msub><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub><mo>×</mo><mi>L</mi></mrow><annotation encoding="application/x-tex">2 \\times n_g \\times d_{head} \\times L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span>。DeepSeek-Coder 33B 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>h</mi></msub><mo>=</mo><mn>56</mn></mrow><annotation encoding="application/x-tex">n_h = 56</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">56</span></span></span></span>，组大小为 8，意味着 KV 头数为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>56</mn><mi mathvariant="normal">/</mi><mn>8</mn><mo>=</mo><mn>7</mn></mrow><annotation encoding="application/x-tex">56/8 = 7</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">56/8</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">7</span></span></span></span>，KV Cache 减少了 8 倍。这个优化在 33B 规模上尤为关键——如果没有 GQA，batch size 稍大就会导致显存溢出。</p>
</blockquote>
<h3 id="4-2-scaling-law-dsj">4.2 Scaling Law 的实践</h3>
<p>DeepSeek-Coder 的批量大小和学习率遵循 DeepSeek-LLM 的 scaling law:</p>
<table>
<thead>
<tr>
<th>模型规模</th>
<th>批量大小</th>
<th>最大学习率</th>
<th>学习率比值</th>
</tr>
</thead>
<tbody><tr>
<td>1.3B</td>
<td>1024</td>
<td>5.3e-4</td>
<td>-</td>
</tr>
<tr>
<td>6.7B</td>
<td>2304</td>
<td>4.2e-4</td>
<td>0.79x</td>
</tr>
<tr>
<td>33B</td>
<td>3840</td>
<td>3.5e-4</td>
<td>0.83x</td>
</tr>
</tbody></table>
<p>随着模型规模增加，批量大小和学习率都增加，但学习率的增加速度低于批量大小。这符合大模型训练中的经验规律:更大的模型需要更大的 batch 来获得稳定的梯度估计，但学习率不能同比例增长，否则会导致优化不稳定。</p>
<hr>
<h2 id="5-xnfx-xsyxgdph">5. 性能分析: 效率与效果的平衡</h2>
<h3 id="5-1-csxsdtcbx">5.1 参数效率的突出表现</h3>
<p>DeepSeek-Coder 最引人注目的结果是「小模型超越大模型」:</p>
<ul>
<li><strong>DeepSeek-Coder-Base 6.7B vs CodeLlama-Base 34B</strong>: 参数量只有 20%，但 HumanEval 平均 44.7% vs 41.0%，MBPP 60.6% vs 55.2%。</li>
<li><strong>DeepSeek-Coder-Base 1.3B vs StarCoderBase 16B</strong>: 参数量只有 8%，但 HumanEval 平均 28.3% vs 28.0%，MBPP 46.2% vs 42.8%。</li>
</ul>
<p>这种「参数效率」来自三个因素的协同:</p>
<ol>
<li><strong>数据质量</strong>: 2T token 的高质量项目级语料，远优于 CodeLlama 的 500B。</li>
<li><strong>数据规模</strong>: 2T vs 500B，4 倍的训练量让模型「见过更多模式」。</li>
<li><strong>架构细节</strong>: SwiGLU + GQA 的组合在同等参数量下提供了更强的表达能力。</li>
</ol>
<h3 id="5-2-kwjnldckjyxlyz">5.2 跨文件能力的仓库级预训练验证</h3>
<p>表 7 中的消融实验是论文中最有力的证据:</p>
<table>
<thead>
<tr>
<th>语言</th>
<th>仓库级预训练 EM</th>
<th>文件级预训练 EM</th>
<th>差值</th>
</tr>
</thead>
<tbody><tr>
<td>Python</td>
<td>16.14%</td>
<td>16.02%</td>
<td>+0.12%</td>
</tr>
<tr>
<td>Java</td>
<td>17.72%</td>
<td>16.64%</td>
<td>+1.08%</td>
</tr>
<tr>
<td>TypeScript</td>
<td>14.03%</td>
<td>13.23%</td>
<td>+0.80%</td>
</tr>
<tr>
<td>C#</td>
<td>16.23%</td>
<td>14.48%</td>
<td>+1.75%</td>
</tr>
</tbody></table>
<p>Java 和 C# 的收益最明显，这与这两种语言的「强类型 + 显式 import」特性有关——跨文件依赖在 Java/C# 中更为突出，因此仓库级预训练带来的结构信息更有价值。Python 的收益较小，可能是因为 Python 的动态类型和隐式导入使得跨文件依赖更难解析，也更难建模。</p>
<hr>
<h2 id="6-cdmmxdtymx-v1-5-dqs">6. 从代码模型到通用模型: v1.5 的启示</h2>
<p>DeepSeek-Coder-v1.5 7B 是一个容易被忽视但极具启示性的实验。它证明了:</p>
<ol>
<li><strong>代码预训练不是「单向增强」</strong>: 在 DeepSeek-LLM-7B 上继续预训练代码数据，不仅增强了代码能力，还显著提升了数学推理(GSM8K 从约 15% 提升到 62.4%)和自然语言理解(MMLU 从约 30% 提升到 49.1%)。</li>
<li><strong>通用能力可以通过「代码 + 自然语言」混合预训练来增强</strong>: v1.5 的数据配比(70% 代码 + 30% 自然语言/数学)比原始 Coder(87% 代码 + 13% 自然语言)更加均衡，结果显示它在保持代码能力的同时大幅提升了通用能力。</li>
<li><strong>为 DeepSeek-Math 铺平道路</strong>: v1.5 是 DeepSeek-Math 的直接基座。v1.5 实验验证了「从代码模型出发增强数学能力」的可行性，这是 DeepSeek-Math 选择 DeepSeek-Coder-Base-v1.5 作为初始化基座的核心依据。</li>
</ol>
<blockquote>
<p>谱系与影响节点: DeepSeek-Coder → DeepSeek-Coder-v1.5 → DeepSeek-Math 这条技术路线展示了 DeepSeek 的「渐进式增强」策略:先训练一个强大的代码模型，然后通过调整数据配比将其扩展为「代码 + 通用」模型，最后在此基础上专注于数学能力。这种策略的优势在于每一步都建立在前一步的验证之上，降低了整体研发风险。相比之下，同期其他团队(如 Meta 的 CodeLlama)选择直接在 Llama-2 上继续预训练代码数据——虽然起点更高(通用能力更强)，但失去了「从零构建代码模型」过程中积累的数据工程经验。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-ztdw-clxldkydmmx","text":"1. 总体定位: 从零训练的开源代码模型"},{"level":2,"id":"2-sjgc-ckjylkdgj","text":"2. 数据工程: 仓库级语料库的构建"},{"level":3,"id":"2-1-tppx-cwjjdckjdzb","text":"2.1 拓扑排序: 从文件级到仓库级的质变"},{"level":3,"id":"2-2-ckjqz-bcjgwzx","text":"2.2 仓库级去重: 保持结构完整性"},{"level":3,"id":"2-3-zlsxdscfy","text":"2.3 质量筛选的三层防御"},{"level":2,"id":"3-xlcldjxhty","text":"3. 训练策略的精细化调优"},{"level":3,"id":"3-1-fim-bsdxrsy","text":"3.1 FIM 比率的消融实验"},{"level":3,"id":"3-2-sjdxxstd","text":"3.2 三阶段学习率调度"},{"level":3,"id":"3-3-csxwkzdwscl","text":"3.3 长上下文扩展的务实策略"},{"level":2,"id":"4-mxjg-bz-transformer-dsyty","text":"4. 模型架构: 标准 Transformer 的实用调优"},{"level":3,"id":"4-1-jggl","text":"4.1 架构概览"},{"level":3,"id":"4-2-scaling-law-dsj","text":"4.2 Scaling Law 的实践"},{"level":2,"id":"5-xnfx-xsyxgdph","text":"5. 性能分析: 效率与效果的平衡"},{"level":3,"id":"5-1-csxsdtcbx","text":"5.1 参数效率的突出表现"},{"level":3,"id":"5-2-kwjnldckjyxlyz","text":"5.2 跨文件能力的仓库级预训练验证"},{"level":2,"id":"6-cdmmxdtymx-v1-5-dqs","text":"6. 从代码模型到通用模型: v1.5 的启示"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder 核心架构剖析</h1>
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
