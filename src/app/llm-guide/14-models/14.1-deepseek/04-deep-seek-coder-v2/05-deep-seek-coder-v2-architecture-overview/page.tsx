"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder-V2 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文是对 DeepSeek-Coder-V2 技术报告(arXiv:2406.11931)中架构与工程决策的深度解读，聚焦「为什么这样设计」以及「工程落地时的权衡」。</p>
</blockquote>
<hr>
<h2 id="1-ztjgdw-zz-deep-seek-v2-djbs">1. 总体架构定位: 站在 DeepSeek-V2 的肩膀上</h2>
<p>DeepSeek-Coder-V2 的架构决策可以概括为一句话:<strong>「不做重复发明，只做定向增强」</strong>。</p>
<p>模型完全复用了 DeepSeek-V2 的架构设计——包括 Multi-Head Latent Attention(MLA)、DeepSeekMoE、YARN 长上下文扩展等核心组件——没有在模型结构上做任何改动。16B 和 236B 两个版本的超参数分别对应 DeepSeek-V2-Lite 和 DeepSeek-V2 的配置。这种「架构冻结」策略有明确的工程逻辑:</p>
<ol>
<li><strong>避免训练不稳定风险</strong>: 新架构在超大规模训练中的稳定性需要大量调试周期，而 DeepSeek-V2 已经通过了 8.1T token 的训练验证。</li>
<li><strong>最大化复用基础设施</strong>: DeepSeek-V2 的训练框架、数据流水线、分布式策略(专家并行 EP、张量并行 TP 等)可以直接复用，降低工程边际成本。</li>
<li><strong>聚焦数据质量而非结构创新</strong>: 论文的核心假设是——在代码智能领域，数据质量和训练策略的改进比架构微调带来的增益更大。</li>
</ol>
<blockquote>
<p>设计动机思考: 这与当前业界的两种路线形成对比。一种路线(如 CodeLlama、StarCoder2)从零训练专用代码模型，追求「代码数据纯度」;另一种路线(如 DeepSeek-Coder-V2)基于通用基座做继续预训练，追求「通用能力 + 代码能力的协同」。DeepSeek-Coder-V2 的数据构成(60% 代码 + 10% 数学 + 30% 自然语言)明确选择了后一条路线。消融实验也证明了这一点:如果基座模型的通用推理能力不强，纯代码数据的上限会很低。</p>
</blockquote>
<hr>
<h2 id="2-mla-deep-seek-mo-e-yzjgddmcjsp">2. MLA + DeepSeekMoE: 已知架构的代码场景适配</h2>
<h3 id="2-1-mla-zcdmxlzdjz">2.1 MLA 在长代码序列中的价值</h3>
<p>DeepSeek-V2 引入的 MLA 通过低秩压缩将每个 token 的 KV Cache 从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msub><mi>d</mi><mrow><mi>k</mi><mi>v</mi></mrow></msub><mo>×</mo><msub><mi>n</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">2 \\times d_{kv} \\times n_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 降到了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>c</mi></msub><mo>×</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">d_c \\times 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>c</mi></msub><mo>≪</mo><msub><mi>d</mi><mrow><mi>k</mi><mi>v</mi></mrow></msub><mo>×</mo><msub><mi>n</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">d_c \\ll d_{kv} \\times n_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≪</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>)。在代码场景中，这一压缩的价值被进一步放大:</p>
<ul>
<li><strong>代码文件的序列长度天然更长</strong>: 一个中型 Python 文件即可达到数千 token，一个完整的代码库提交(patch)可能涉及数万 token。MLA 的压缩率直接决定了模型能处理多长的代码上下文而不触发显存溢出。</li>
<li><strong>代码 token 的局部性更强</strong>: 代码中的变量引用、函数调用、类型推断通常在局部窗口内完成，全局注意力权重往往非常稀疏。MLA 的低秩压缩实际上与代码注意力的稀疏特性形成了天然的匹配。</li>
</ul>
<h3 id="2-2-deep-seek-mo-e-zdmsjsdlyhw">2.2 DeepSeekMoE 在代码数据上的路由行为</h3>
<p>DeepSeek-Coder-V2 236B 使用了 160 个路由专家 + 2 个共享专家，每个 token 激活 21B 参数。代码数据对 MoE 路由提出了独特的挑战:</p>
<ul>
<li><strong>语法结构 token  vs 语义 token</strong>: 代码中大量 token 是语法符号(括号、分号、缩进等)，这些 token 的语义信息密度远低于自然语言。MoE 路由网络需要学会将这些「低信息密度」token 导向更少的专家，以避免专家负载不均。</li>
<li><strong>跨语言迁移</strong>: 338 种编程语言共享同一个路由网络。不同语言的语法结构差异巨大(如 Python 的缩进敏感 vs C 的花括号)，路由网络需要隐式学习到语言无关的「代码抽象表示」。</li>
</ul>
<p>论文中提到的一个关键工程细节是:<strong>训练过程中遇到了不稳定性和梯度尖峰，归因于指数归一化技术，最终改回了传统归一化</strong>。这暗示了代码数据的分布特性与 DeepSeek-V2 的通用语料存在显著差异，导致原本在通用语料上稳定的训练技巧在代码域失效。</p>
<blockquote>
<p>架构细节节点: 指数归一化(Exponential Normalization)是 MoE 路由中的一种技巧，通过对路由 logits 做指数变换后再进行 top-k 选择，目的是让专家分配更加「尖锐」(即每个 token 更确定地分配给少数几个专家)。在通用语料上，这种尖锐化有助于专家特化;但在代码数据上，由于代码 token 的分布更「陡峭」(大量重复的模式和少量的罕见构造)，指数归一化可能导致了路由决策的过度自信——某些 token 被强制分配给单一专家，造成该专家的梯度爆炸。改回传统 softmax 归一化相当于给路由增加了「温度」，让分配更平滑，从而缓解了梯度尖峰。这是一个典型的「通用 trick 在特定数据域上需要重新验证」的案例。</p>
</blockquote>
<hr>
<h2 id="3-sjgc-dmylkdzlkz">3. 数据工程: 代码语料库的质量控制</h2>
<h3 id="3-1-dycjcl">3.1 多源采集策略</h3>
<p>DeepSeek-Coder-V2 的代码语料库由三个来源组成:</p>
<table>
<thead>
<tr>
<th>来源</th>
<th>规模</th>
<th>采集方式</th>
<th>质量特点</th>
</tr>
</thead>
<tbody><tr>
<td>GitHub 源码</td>
<td>821B + 94B = 915B</td>
<td>直接爬取 + fastText 迭代召回</td>
<td>结构化程度高,但包含大量低质量/重复代码</td>
</tr>
<tr>
<td>CommonCrawl 代码网页</td>
<td>70B</td>
<td>fastText 三轮迭代 + BPE 分词器</td>
<td>包含文档、教程、StackOverflow 讨论,语义丰富</td>
</tr>
<tr>
<td>代码相关文本(markdown, issues)</td>
<td>185B</td>
<td>GitHub 过滤后保留</td>
<td>自然语言描述多,有助于代码-自然语言对齐</td>
</tr>
</tbody></table>
<p>总计 1,170B 代码相关 token。对比前代 DeepSeek-Coder 的 2T token(87% 代码 + 13% 自然语言)，新语料库不仅在数量上翻倍，更关键的是<strong>覆盖范围从 86 种语言扩展到 338 种</strong>。</p>
<h3 id="3-2-glgzbhdgclj">3.2 过滤规则背后的工程逻辑</h3>
<p>论文中详细列出的过滤规则看似琐碎，实则是经过多轮迭代的数据质量工程:</p>
<table>
<thead>
<tr>
<th>过滤规则</th>
<th>目标问题</th>
<th>工程实现</th>
</tr>
</thead>
<tbody><tr>
<td>平均行长度 &gt; 100 字符</td>
<td>minified/uglified 代码</td>
<td>统计每行长度,过滤异常值</td>
</tr>
<tr>
<td>最大行长度 &gt; 1000 字符</td>
<td>单行字符串/数据硬编码</td>
<td>检测极端长度的单行</td>
</tr>
<tr>
<td>字母字符比例 &lt; 25%</td>
<td>二进制数据、纯数字文件</td>
<td>正则匹配字母占比</td>
</tr>
<tr>
<td><code>&lt;?xml version=</code> 在前 100 字符中(除 XSLT)</td>
<td>XML 配置文件</td>
<td>简单字符串匹配</td>
</tr>
<tr>
<td>HTML 可见文本 &lt; 20% 且 &lt; 100 字符</td>
<td>纯模板/框架生成的 HTML</td>
<td>解析 DOM 树计算文本比例</td>
</tr>
<tr>
<td>JSON/YAML 字符数不在 50-5000 之间</td>
<td>数据配置文件</td>
<td>基于文件类型的长度过滤</td>
</tr>
</tbody></table>
<p>这些规则的核心思想是:<strong>代码语料库的质量不仅取决于「有没有代码」，更取决于「代码是否值得学习」</strong>。minified 代码、配置文件、数据文件对语言模型的语义学习几乎没有贡献，反而会因为 token 分布的偏移干扰正常训练。</p>
<h3 id="3-3-fast-text-bpe-dddzh">3.3 fastText + BPE 的迭代召回</h3>
<p>从 CommonCrawl 中召回代码和数学网页采用了 fastText 分类器 + 三轮迭代的数据收集策略。一个关键改进是:<strong>使用 DeepSeek-V2 的 BPE 分词器替代空格分词</strong>。这个决策的动机很明确:</p>
<ul>
<li>fastText 默认使用 n-gram + 空格分词，对英文有效但对中文、日文等无空格语言效果差。</li>
<li>BPE 分词器已经在 DeepSeek-V2 的大规模语料上训练过，能够将任何语言的文本切分为语义上有意义的子词单元。</li>
<li>用 BPE token 训练 fastText，使得分类器对多语言代码文档(如中文注释的 Python 代码)有更好的召回能力。</li>
</ul>
<blockquote>
<p>工程落地视角: 这个「分词器复用」的细节看似微小，实则节省了大量工程成本。如果为 fastText 重新训练一个分词器，不仅需要额外的计算资源，还会引入分词不一致问题(BPE vs fastText 的分词结果不同，导致下游模型看到的 token 分布与预训练时不一致)。复用 BPE 分词器保证了数据收集和模型训练在 token 空间上的完全对齐。</p>
</blockquote>
<hr>
<h2 id="4-xlcldgjjc">4. 训练策略的关键决策</h2>
<h3 id="4-1-jxyxlefclxl">4.1 继续预训练而非从零训练</h3>
<p>DeepSeek-Coder-V2 从 DeepSeek-V2 的中间Checkpoint(已训练 4.2T token)出发，额外训练 6T token，总计 10.2T。这个决策的利弊分析如下:</p>
<p><strong>优势</strong>:</p>
<ul>
<li>保留了 DeepSeek-V2 在通用语言、推理和世界知识上的能力</li>
<li>节省了大量的计算成本(4.2T token 的训练开销被完全复用)</li>
<li>缩短了收敛时间，因为模型已经处于「有意义的参数空间」中</li>
</ul>
<p><strong>风险</strong>:</p>
<ul>
<li>如果新数据与原始数据的分布差异过大，可能导致「灾难性遗忘」</li>
<li>中间Checkpoint的选择影响最终性能(太早则通用能力不足，太晚则代码能力上限受限)</li>
</ul>
<p>论文的实验结果表明，在 60% 代码 + 30% 自然语言 + 10% 数学的数据配比下，灾难性遗忘被有效抑制——通用语言能力不仅没有退化，在推理基准上还有所提升。</p>
<h3 id="4-2-fim-dcyhpz">4.2 FIM 的差异化配置</h3>
<table>
<thead>
<tr>
<th>版本</th>
<th>FIM</th>
<th>训练目标</th>
<th>产品定位</th>
</tr>
</thead>
<tbody><tr>
<td>16B Lite</td>
<td>启用(比率 0.5)</td>
<td>NTP + FIM</td>
<td>IDE 代码补全插件</td>
</tr>
<tr>
<td>236B</td>
<td>禁用</td>
<td>仅 NTP</td>
<td>对话式编程助手</td>
</tr>
</tbody></table>
<p>这种差异化配置反映了两种截然不同的产品场景:</p>
<ul>
<li><strong>IDE 补全</strong>: 用户在编辑器中输入代码，需要模型根据光标前后的上下文生成中间片段。FIM 训练使模型天然适应这种「双向上下文」场景。</li>
<li><strong>对话式编程</strong>: 用户通过自然语言描述需求，模型生成完整代码块。这种场景是单向自回归，FIM 训练不仅无益，还可能因为训练数据格式的混用而降低性能。</li>
</ul>
<blockquote>
<p>工程细节: FIM 的 PSM 格式使用了特殊分隔符 <code>&lt;|fim_begin|&gt;</code>、<code>&lt;|fim_hole|&gt;</code>、<code>&lt;|fim_end|&gt;</code>。这些分隔符需要在分词器的词汇表中预留 token id。DeepSeek-Coder-V2 复用了 DeepSeek-V2 的分词器(词汇量 102,400)，意味着这些 FIM 特殊 token 在 V2 阶段就已经被预留——这暗示了 DeepSeek 在 V2 训练时就已经规划了后续的代码模型路线。</p>
</blockquote>
<h3 id="4-3-csxwdljdkz">4.3 长上下文的两阶段扩展</h3>
<p>DeepSeek-Coder-V2 使用 YARN 将上下文从 16K 扩展到 128K，采用两阶段渐进训练:</p>
<table>
<thead>
<tr>
<th>阶段</th>
<th>序列长度</th>
<th>批量大小</th>
<th>训练步数</th>
</tr>
</thead>
<tbody><tr>
<td>第一阶段</td>
<td>32K</td>
<td>1152</td>
<td>1000</td>
</tr>
<tr>
<td>第二阶段</td>
<td>128K</td>
<td>288</td>
<td>1000</td>
</tr>
</tbody></table>
<p>注意批量大小从 1152 降到了 288——这是在固定总 batch size(以 token 计)的前提下，序列长度增加 4 倍，单步的序列数量自然减少 4 倍。总训练 token 数约为:</p>
<ul>
<li>第一阶段: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>32</mn><mi>K</mi><mo>×</mo><mn>1152</mn><mo>×</mo><mn>1000</mn><mo>≈</mo><mn>36.9</mn><mi>B</mi></mrow><annotation encoding="application/x-tex">32K \\times 1152 \\times 1000 \\approx 36.9B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1152</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1000</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">36.9</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span></li>
<li>第二阶段: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>128</mn><mi>K</mi><mo>×</mo><mn>288</mn><mo>×</mo><mn>1000</mn><mo>≈</mo><mn>36.9</mn><mi>B</mi></mrow><annotation encoding="application/x-tex">128K \\times 288 \\times 1000 \\approx 36.9B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">288</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1000</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">36.9</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span></li>
</ul>
<p>两阶段各约 37B token，合计约 74B token——相对于 10.2T 的总预训练量，长上下文扩展只占 0.7%。这是一个非常高效的扩展策略。</p>
<blockquote>
<p>设计动机: 两阶段扩展的核心逻辑是「渐进式适应」。直接从 16K 跳到 128K 会导致模型注意力分布的剧烈变化，而 32K 作为中间过渡可以让模型先适应「中等长度」的依赖关系，再挑战「超长距离」的依赖。YARN 本身通过调整 RoPE 的基频(base frequency)来扩展位置编码的有效范围，但模型仍需要少量训练来「学习」如何在扩展后的注意力分布上进行有效推理。</p>
</blockquote>
<hr>
<h2 id="5-dqjd-c-sft-d-rl-dwzll">5. 对齐阶段: 从 SFT 到 RL 的完整链路</h2>
<h3 id="5-1-sft-sjgc">5.1 SFT 数据构成</h3>
<p>DeepSeek-Coder-V2 的 SFT 数据量为 300M token，构成如下:</p>
<table>
<thead>
<tr>
<th>数据类型</th>
<th>样本数</th>
<th>来源</th>
</tr>
</thead>
<tbody><tr>
<td>代码指令</td>
<td>20k</td>
<td>DeepSeek-Coder</td>
</tr>
<tr>
<td>数学指令</td>
<td>30k</td>
<td>DeepSeek-Math</td>
</tr>
<tr>
<td>通用指令</td>
<td>若干</td>
<td>DeepSeek-V2</td>
</tr>
</tbody></table>
<p>与当前主流模型的 SFT 数据量(通常数千万到数亿条样本)相比，300M token 属于「轻量微调」。这反映了团队的一个核心假设:<strong>代码和数学任务的对齐不需要海量通用对话数据，而是需要高质量、领域聚焦的指令-响应对</strong>。</p>
<p>训练配置: 余弦学习率调度，100 步 warmup，初始学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>，批量大小 1M token，总训练量 1B token。这意味着 SFT 只进行了约 1000 步(1B / 1M = 1000 步)，是一个相当短的微调过程。</p>
<h3 id="5-2-rl-jlmxdbyxlz">5.2 RL: 奖励模型的必要性论证</h3>
<p>DeepSeek-Coder-V2 的 RL 阶段是技术报告中工程细节最丰富的部分。核心决策是:<strong>在代码 RL 中，使用奖励模型信号优于原始编译器信号</strong>。</p>
<p>论文给出了明确的论证:</p>
<ol>
<li><strong>编译器信号的局限性</strong>: 编译器提供的是 0-1 反馈(通过/不通过所有测试用例)。但某些代码 prompt 的测试用例数量有限、覆盖不完整，直接依赖编译器反馈会产生噪声和次优结果。</li>
<li><strong>奖励模型的优势</strong>: 在编译器提供的数据上训练一个奖励模型，可以在 RL 训练中提供更鲁棒、泛化能力更强的信号。</li>
<li><strong>实验验证</strong>: 在内部测试集(LeetCode 和 LeetCode-zh)上，使用奖励模型信号的 RL 明显优于使用原始编译器信号的 RL。</li>
</ol>
<blockquote>
<p>谱系与影响节点: 这个决策在 DeepSeek 家族的技术演进中处于一个有趣的转折点。在 DeepSeek-Coder-V2(2024 年 6 月)中，团队仍然认为奖励模型是必要的，因为「测试用例覆盖不完整」。但在 DeepSeek-R1(2025 年 1 月)中，团队已经完全转向了「纯规则奖励」(编译器反馈 + 格式奖励)，放弃了奖励模型。这个转变说明:随着基础模型能力的提升和测试用例质量的改善，奖励模型的边际收益在下降。DeepSeek-Coder-V2 的奖励模型实验实际上为后续工作提供了一个重要的对比基线——它证明了在特定条件下奖励模型确实有效，也暗示了当条件改变时(更强的基座、更完整的测试覆盖)，简化的规则奖励可能更优。</p>
</blockquote>
<h3 id="5-3-grpo-wsmby-ppo">5.3 GRPO: 为什么不用 PPO?</h3>
<p>DeepSeek-Coder-V2 采用 GRPO 而非 PPO，核心理由在论文中明确给出:<strong>GRPO 不需要维护额外的 Critic 模型，因此成本更低</strong>。</p>
<p>从工程角度看，GRPO 相比 PPO 的优势在代码场景中尤为突出:</p>
<ul>
<li><strong>显存节省</strong>: 代码模型的序列长度通常更长(问题描述 + 代码 + 测试用例)，Critic 模型的显存开销在大 batch size 下非常可观。GRPO 通过组内相对优势计算，完全省去了 Critic。</li>
<li><strong>训练稳定性</strong>: PPO 中 Critic 模型与策略模型的协同训练是一个已知的难点。Critic 估计的价值函数如果偏差过大，会导致优势估计不准确，进而引发策略更新不稳定。GRPO 用组内均值替代 Critic，简化了优化 landscape。</li>
<li><strong>实现简单性</strong>: GRPO 的代码实现比 PPO 简洁得多，调试和超参数调优的工作量显著降低。</li>
</ul>
<p>GRPO 的目标函数为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>J</mi><mrow><mi>G</mi><mi>R</mi><mi>P</mi><mi>O</mi></mrow></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>q</mi><mo>∼</mo><mi>P</mi><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mo stretchy="false">{</mo><msub><mi>o</mi><mi>i</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo>∼</mo><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub><mo stretchy="false">(</mo><mo>⋅</mo><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></msub><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mi>G</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><mrow><mo fence="true">(</mo><mi>min</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></mfrac><msub><mi>A</mi><mi>i</mi></msub><mo separator="true">,</mo><mtext>clip</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></mfrac><mo separator="true">,</mo><mn>1</mn><mo>−</mo><mi>ϵ</mi><mo separator="true">,</mo><mn>1</mn><mo>+</mo><mi>ϵ</mi><mo fence="true">)</mo></mrow><msub><mi>A</mi><mi>i</mi></msub><mo fence="true">)</mo></mrow><mo>−</mo><mi>β</mi><msub><mi mathvariant="double-struck">D</mi><mrow><mi>K</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>π</mi><mi>θ</mi></msub><mi mathvariant="normal">∥</mi><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">J_{GRPO}(\\theta) = \\mathbb{E}_{q \\sim P(Q), \\{o_i\\}_{i=1}^G \\sim \\pi_{\\theta_{old}}(\\cdot|q)} \\left[ \\frac{1}{G} \\sum_{i=1}^{G} \\left( \\min\\left( \\frac{\\pi_\\theta(o_i|q)}{\\pi_{\\theta_{old}}(o_i|q)} A_i, \\text{clip}\\left(\\frac{\\pi_\\theta(o_i|q)}{\\pi_{\\theta_{old}}(o_i|q)}, 1-\\epsilon, 1+\\epsilon\\right) A_i \\right) - \\beta \\mathbb{D}_{KL}(\\pi_\\theta \\| \\pi_{ref}) \\right) \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0962em;">J</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0962em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0077em;">GR</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.4618em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mrel mtight">∼</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">Q</span><span class="mclose mtight">)</span><span class="mpunct mtight">,</span><span class="mopen mtight">{</span><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight"><span class="mclose mtight">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8329em;"><span style="top:-2.1777em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-2.8448em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3223em;"><span></span></span></span></span></span></span><span class="mrel mtight">∼</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0278em;margin-right:0.1em;"><span class="pstrut" style="height:2.6944em;"></span><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3496em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.401em;"><span></span></span></span></span></span></span><span class="mopen mtight">(</span><span class="mord mtight">⋅</span><span class="mord mtight">∣</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.5189em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">[</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">G</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mop">min</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9419em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">clip</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9419em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathbb">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">]</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 是组大小(通常 4-16)，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>j</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>j</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">A_i = \\frac{r_i - \\text{mean}(\\{r_j\\})}{\\text{std}(\\{r_j\\})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.5746em;vertical-align:-0.5423em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0323em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">std</span></span><span class="mopen mtight">({</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mclose mtight">})</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.5073em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mbin mtight">−</span><span class="mord text mtight"><span class="mord mtight">mean</span></span><span class="mopen mtight">({</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mclose mtight">})</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.5423em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 是组内归一化的相对优势。</p>
<blockquote>
<p>工程落地视角: GRPO 的「低成本」是以牺牲某些能力为代价的。PPO 的 Critic 模型可以提供细粒度的 token-level 价值估计，对于长序列生成中的信用分配(credit assignment)更有优势。GRPO 的组级优势是一种粗粒度的近似，在代码生成这种「结果导向」的任务上效果良好(因为最终奖励就是代码是否通过测试)，但在需要过程监督的场景(如多步数学推理)中可能不足。DeepSeek-R1 后来通过「规则奖励 + 过程奖励」的组合弥补了这一短板。</p>
</blockquote>
<hr>
<h2 id="6-xnfx-xsyxgdqh">6. 性能分析: 效率与效果的权衡</h2>
<h3 id="6-1-jhcs-vs-sjxn">6.1 激活参数 vs 实际性能</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>总参数</th>
<th>激活参数</th>
<th>HumanEval 平均</th>
<th>MATH</th>
</tr>
</thead>
<tbody><tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>65.6%</td>
<td>61.8%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>33B</td>
<td>61.9%</td>
<td>-</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>75.3%</td>
<td>75.7%</td>
</tr>
<tr>
<td>GPT-4o</td>
<td>-</td>
<td>~200B+</td>
<td>76.4%</td>
<td>76.6%</td>
</tr>
</tbody></table>
<p>一个引人注目的对比:DeepSeek-Coder-V2-Lite-Instruct(2.4B 激活参数)在 HumanEval 平均上超越了 DeepSeek-Coder-Instruct 33B(33B 激活参数)。这意味着:</p>
<ul>
<li><strong>架构效率 &gt; 纯参数规模</strong>: MLA + MoE 的组合在代码任务上的效率远高于传统的稠密 Transformer。</li>
<li><strong>数据质量 &gt; 模型规模</strong>: 10.2T 高质量语料 + 338 种语言覆盖，使小激活参数模型也能学到丰富的代码模式。</li>
</ul>
<h3 id="6-2-dmnl-vs-tynldlhby">6.2 代码能力 vs 通用能力的零和博弈?</h3>
<p>表 10(精译文档中)的对比揭示了一个反直觉的现象:DeepSeek-Coder-V2 在代码和数学增强的同时，通用语言能力并未退化，甚至在推理基准(BBH、Arena-Hard)上超越了同参数的 DeepSeek-V2。</p>
<p>这说明「代码预训练」和「通用语言能力」之间并非零和关系，而是存在<strong>正向迁移</strong>:</p>
<ul>
<li>代码是一种高度结构化的形式语言，学习代码的语法、类型系统和控制流可以增强模型的结构化推理能力。</li>
<li>数学语料(10% 的配比)与代码数据在逻辑推理层面有天然的重叠(如算法实现、数值计算)。</li>
<li>30% 的自然语言语料起到了「锚定」作用，防止模型过度特化到代码领域。</li>
</ul>
<p>但在知识密集型任务(TriviaQA、NaturalQuestions)上的下降也值得关注:代码语料库中的事实性知识密度远低于网页语料，这导致了「推理增强、知识稀释」的明确权衡。</p>
<hr>
<h2 id="7-wjwtywlfx">7. 未解问题与未来方向</h2>
<p>论文结论中明确指出的两个短板，实际上也是当前代码 LLM 领域的共同挑战:</p>
<ol>
<li><p><strong>指令遵循能力 vs 代码生成能力的不匹配</strong>: DeepSeek-Coder-V2 在 HumanEval(孤立函数生成)上接近满分，但在 SWE-Bench(完整仓库修改)上只有 12.7%。这说明当前评测体系过度关注「代码写得好不好」，而忽视了「代码放得对不对」。SWE-Bench 这类需要理解项目架构、遵循编码规范、操作多文件的基准，更能反映真实软件工程场景的需求。</p>
</li>
<li><p><strong>长上下文中的精确操作</strong>: 虽然 DeepSeek-Coder-V2 支持 128K 上下文且在 NIAH 测试中表现良好，但「能找到针」和「能精确修改针周围的代码」是两个不同层次的能力。代码修复任务要求模型在极长的上下文中定位问题、理解依赖关系、并生成符合项目风格的补丁——这需要比「大海捞针」更细粒度的长上下文操作能力。</p>
</li>
</ol>
<p>未来的改进方向可能包括:</p>
<ul>
<li><strong>Agent 化</strong>: 将代码模型与工具调用(文件系统操作、版本控制、测试运行)结合，让模型通过多轮交互完成复杂修复任务。</li>
<li><strong>过程奖励</strong>: 在代码生成中引入细粒度的过程监督(如语法检查、类型检查的中间反馈)，而非仅依赖最终测试通过率。</li>
<li><strong>项目级预训练</strong>: 目前的代码预训练主要在文件级别或片段级别进行，未来可能需要以整个仓库为粒度进行预训练，让模型学习项目架构、模块依赖和编码规范。</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-ztjgdw-zz-deep-seek-v2-djbs","text":"1. 总体架构定位: 站在 DeepSeek-V2 的肩膀上"},{"level":2,"id":"2-mla-deep-seek-mo-e-yzjgddmcjsp","text":"2. MLA + DeepSeekMoE: 已知架构的代码场景适配"},{"level":3,"id":"2-1-mla-zcdmxlzdjz","text":"2.1 MLA 在长代码序列中的价值"},{"level":3,"id":"2-2-deep-seek-mo-e-zdmsjsdlyhw","text":"2.2 DeepSeekMoE 在代码数据上的路由行为"},{"level":2,"id":"3-sjgc-dmylkdzlkz","text":"3. 数据工程: 代码语料库的质量控制"},{"level":3,"id":"3-1-dycjcl","text":"3.1 多源采集策略"},{"level":3,"id":"3-2-glgzbhdgclj","text":"3.2 过滤规则背后的工程逻辑"},{"level":3,"id":"3-3-fast-text-bpe-dddzh","text":"3.3 fastText + BPE 的迭代召回"},{"level":2,"id":"4-xlcldgjjc","text":"4. 训练策略的关键决策"},{"level":3,"id":"4-1-jxyxlefclxl","text":"4.1 继续预训练而非从零训练"},{"level":3,"id":"4-2-fim-dcyhpz","text":"4.2 FIM 的差异化配置"},{"level":3,"id":"4-3-csxwdljdkz","text":"4.3 长上下文的两阶段扩展"},{"level":2,"id":"5-dqjd-c-sft-d-rl-dwzll","text":"5. 对齐阶段: 从 SFT 到 RL 的完整链路"},{"level":3,"id":"5-1-sft-sjgc","text":"5.1 SFT 数据构成"},{"level":3,"id":"5-2-rl-jlmxdbyxlz","text":"5.2 RL: 奖励模型的必要性论证"},{"level":3,"id":"5-3-grpo-wsmby-ppo","text":"5.3 GRPO: 为什么不用 PPO?"},{"level":2,"id":"6-xnfx-xsyxgdqh","text":"6. 性能分析: 效率与效果的权衡"},{"level":3,"id":"6-1-jhcs-vs-sjxn","text":"6.1 激活参数 vs 实际性能"},{"level":3,"id":"6-2-dmnl-vs-tynldlhby","text":"6.2 代码能力 vs 通用能力的零和博弈?"},{"level":2,"id":"7-wjwtywlfx","text":"7. 未解问题与未来方向"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder-V2 核心架构剖析</h1>
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
