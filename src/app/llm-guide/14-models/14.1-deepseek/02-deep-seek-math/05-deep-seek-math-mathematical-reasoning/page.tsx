"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Math 数理逻辑解码</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文是对 DeepSeek-Math 技术报告(arXiv:2402.03300)中数学推理机制与强化学习算法的深度解读，聚焦「为什么 GRPO 有效」以及「数学数据工程的底层逻辑」。</p>
</blockquote>
<hr>
<h2 id="1-sxyxldsjgc-chlw-tj">1. 数学预训练的数据工程: 从互联网「淘金」</h2>
<h3 id="1-1-wsm-common-crawl-b-ar-xiv-gzy">1.1 为什么 Common Crawl 比 arXiv 更重要?</h3>
<p>DeepSeek-Math 的一个反直觉发现是:<strong>arXiv 论文对数学推理能力的提升效果非常有限</strong>。</p>
<p>论文表 1 中的对比显示，MathPile(85%+ 来自 arXiv)在几乎所有数学基准上都低于「无数学训练」基线。这个发现挑战了当时的主流假设——许多数学相关研究(如 Llemma、Minerva)大量使用 arXiv 论文作为数学预训练数据。</p>
<p>为什么 arXiv 效果差?</p>
<ol>
<li><strong>符号密度 vs 推理密度</strong>: arXiv 论文包含大量数学符号和公式，但这些符号往往处于「定义和定理陈述」层面，而非「逐步推理」层面。模型从 arXiv 学到的是「如何写数学符号」，而非「如何解数学题」。</li>
<li><strong>语言风格差异</strong>: arXiv 论文使用高度形式化的学术语言，与竞赛题、应用题的表述风格差异巨大。预训练在 arXiv 上的模型在面对 GSM8K(小学应用题)或 MATH(竞赛题)时，面临严重的分布偏移。</li>
<li><strong>缺乏交互性</strong>: 好的数学训练数据应该包含「问题 → 尝试 → 错误 → 修正 → 解答」的完整链条。arXiv 论文是 polished 的最终结果，没有展示推理过程中的试错和修正。</li>
</ol>
<p>相比之下，Common Crawl 中的数学网页(如 StackExchange、math forums、教育网站)包含了:</p>
<ul>
<li>多样化的数学问题表述(从应用题到竞赛题)</li>
<li>逐步解答过程(常包含多种解法的讨论)</li>
<li>多语言内容(中英文数学教育的差异在数据中得到体现)</li>
<li>更贴近真实使用场景的问题</li>
</ul>
<blockquote>
<p>数据与实验节点: DeepSeek-Math Corpus 120B token 的来源全部是网页(Common Crawl)，没有任何 arXiv。这个决策在当时是有争议的——同期 Llemma 使用 OpenWebMath + AlgebraicStack + arXiv(比例 4:1:2)，Minerva 使用数学网页 + 数学论文。DeepSeek-Math 的实验结果(arXiv 无益甚至有害)为这个纯网页策略提供了坚实的实证支持。这也说明，数据质量的核心指标不是「看起来有多专业」，而是「是否包含模型需要学习的推理模式」。</p>
</blockquote>
<h3 id="1-2-sdd-fast-text-flqdgcxj">1.2 四迭代 fastText 分类器的工程细节</h3>
<p>DeepSeek-Math 的数据收集流水线是一个精妙的「自举」(bootstrapping)过程:</p>
<table>
<thead>
<tr>
<th>迭代</th>
<th>正例来源</th>
<th>新增域名识别方法</th>
<th>收集数据量</th>
<th>累计数据量</th>
</tr>
</thead>
<tbody><tr>
<td>第 1 轮</td>
<td>OpenWebMath(50 万)</td>
<td>fastText 分类器初版</td>
<td>~40B token( top 排名)</td>
<td>~40B</td>
</tr>
<tr>
<td>第 2 轮</td>
<td>第 1 轮正例 + 新域名标注页</td>
<td>域名收集率 &gt;10% 的标注</td>
<td>新增</td>
<td>~60B</td>
</tr>
<tr>
<td>第 3 轮</td>
<td>第 2 轮扩展种子</td>
<td>同上</td>
<td>新增</td>
<td>~100B</td>
</tr>
<tr>
<td>第 4 轮</td>
<td>第 3 轮扩展种子</td>
<td>同上</td>
<td>少量新增</td>
<td>120B</td>
</tr>
</tbody></table>
<p>停止准则:第四轮中近 98% 的数据已在第三轮收集。这说明分类器在第三轮后已接近收敛，继续迭代的边际收益极低。</p>
<blockquote>
<p>工程落地视角: 这个迭代策略有几个值得学习的工程细节。第一，「域名级分析」而非「页面级分析」是关键洞察——如果 mathoverflow.net 有 50% 的页面被分类为正例，那么该域名下未被收集的页面也很可能是正例，即使分类器对它们的置信度不高。第二，人工标注 URL 而非页面——这大大减少了标注工作量，一个 URL 模式(如 <code>/questions/</code>)可以覆盖数百万个页面。第三，fastText 的配置(256 维向量、3-gram、3 轮训练)是一个轻量但有效的选择——在 100 万样本(50 万正 + 50 万负)上训练只需几分钟，却能达到足够的分类精度。</p>
</blockquote>
<h3 id="1-3-dyysxsjdyxjz">1.3 多语言数学数据的隐性价值</h3>
<p>DeepSeek-Math Corpus 的一个重要特性是「多语言」，这主要体现在中文数学内容的显著比例上。论文中的对比实验揭示了这一特性的价值:</p>
<ul>
<li>以英文为中心的语料库(OpenWebMath、Proof-Pile-2)在中文 CMATH 基准上提升有限(Proof-Pile-2 仅 19.9%)，甚至可能损害性能(MathPile 降至 1.2%)。</li>
<li>DeepSeekMath Corpus 在 CMATH 上达到 41.5%，远超所有对比语料库。</li>
</ul>
<p>这背后的原因不是「中文数学题更难」或「中文数据质量更高」，而是<strong>数学教育在不同语言中的差异</strong>。中国 K-12 数学教育强调代数变形、方程求解和几何证明，而英美数学教育更侧重应用题和统计思维。多语言数据让模型接触到更多样化的解题策略和数学概念表述，从而提升了跨语言的泛化能力。</p>
<hr>
<h2 id="2-grpo-qhxxd-jbzx-gm">2. GRPO: 强化学习的「降本增效」革命</h2>
<h3 id="2-1-ppo-dtd-critic-mxdszfd">2.1 PPO 的痛点: Critic 模型的双重负担</h3>
<p>PPO 是 RLHF 的标准算法，但在大语言模型训练中存在明显的效率问题:</p>
<ol>
<li><strong>显存翻倍</strong>: Critic 模型通常与策略模型等大，导致显存占用翻倍。对于 7B 模型，策略 + Critic + 奖励模型 + 参考模型共需约 4 × 7B = 28B 参数的显存。</li>
<li><strong>训练不稳定</strong>: Critic 模型需要与策略模型协同训练。Critic 对价值的估计如果不准确，会导致优势计算偏差，进而引发策略更新的不稳定。</li>
<li><strong>超参数敏感</strong>: Critic 的学习率、更新频率、损失权重等超参数需要精细调优，增加了实验成本。</li>
</ol>
<h3 id="2-2-grpo-dhxsx-yznxdystd-critic">2.2 GRPO 的核心思想: 用组内相对优势替代 Critic</h3>
<p>GRPO 的关键洞察是:<strong>对于数学问题这类「答案明确」的任务，不需要学习一个复杂的 Critic 模型来估计状态价值</strong>。相反，可以从同一问题的多个输出中推断出「相对质量」:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>A</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>j</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>j</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">A_i = \\frac{r_i - \\text{mean}(\\{r_j\\}_{j=1}^{G})}{\\text{std}(\\{r_j\\}_{j=1}^{G})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7522em;vertical-align:-1.1261em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6261em;"><span style="top:-2.2869em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">std</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8231em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.413em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7848em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">mean</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4413em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1261em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这个公式的直觉是:</p>
<ul>
<li>如果某个输出的奖励高于组内平均，它应该被鼓励(优势为正)。</li>
<li>如果低于平均，它应该被抑制(优势为负)。</li>
<li>标准化(除以标准差)使得优势值在不同问题上具有可比性，避免了某些问题天然奖励范围大而导致的梯度规模差异。</li>
</ul>
<blockquote>
<p>架构细节节点: GRPO 的组大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 是一个关键超参数。太小(如 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo>=</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">G=2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span>)时，均值估计不稳定;太大(如 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mo>=</mo><mn>64</mn></mrow><annotation encoding="application/x-tex">G=64</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">64</span></span></span></span>)时，采样成本过高。论文中使用的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 通常在 4-16 之间。另一个细节是「奖励来源」:GRPO 可以使用规则奖励(如数学问题的答案正确性)或模型奖励(如奖励模型的打分)。在 DeepSeek-Math 中，数学问题使用规则奖励(因为答案可以精确验证)，这使得 GRPO 的优势计算非常干净——没有奖励模型本身的噪声。</p>
</blockquote>
<h3 id="2-3-grpo-y-ppo-dszdb">2.3 GRPO 与 PPO 的实证对比</h3>
<p>论文提供了 GRPO 相比 PPO 的资源节省数据:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>PPO</th>
<th>GRPO</th>
<th>节省比例</th>
</tr>
</thead>
<tbody><tr>
<td>显存占用</td>
<td>策略 + Critic + 奖励 + 参考</td>
<td>策略 + 奖励 + 参考</td>
<td>~25-30%</td>
</tr>
<tr>
<td>训练稳定性</td>
<td>Critic 估计偏差导致波动</td>
<td>组内均值天然平滑</td>
<td>显著提升</td>
</tr>
<tr>
<td>超参数数量</td>
<td>Critic LR、更新频率、权重等</td>
<td>组大小、裁剪阈值</td>
<td>减少</td>
</tr>
<tr>
<td>实现复杂度</td>
<td>需要维护 Critic 的训练循环</td>
<td>仅需策略模型训练循环</td>
<td>简化</td>
</tr>
</tbody></table>
<blockquote>
<p>谱系与影响节点: GRPO 在 DeepSeek-Math 中首次提出时，主要用于数学问题的强化学习。但其设计足够通用，后续被 DeepSeek-V2(通用 RL)、DeepSeek-Coder-V2(代码 RL)和 DeepSeek-R1(推理 RL)全面采用。在 DeepSeek-R1 中，GRPO 的组大小扩大到 16-64，奖励信号从单一的「答案正确性」扩展到「格式奖励 + 过程奖励 + 答案奖励」的组合。GRPO 的成功也影响了开源社区——后续许多复现 DeepSeek-R1 的项目(如 Open-R1、TinyZero)都将 GRPO 作为默认的 RL 算法。</p>
</blockquote>
<h3 id="2-4-tyfs-ljhxlffdyj">2.4 统一范式: 理解后训练方法的演进</h3>
<p>DeepSeek-Math 提出的统一范式将 RFT、DPO、PPO 和 GRPO 视为同一谱系上的不同变体，其核心差异在于三个维度:</p>
<pre><code>                    数据来源
                   /          \\
              离线采样      在线采样
                 |            |
    RFT ────────┤            ├──── PPO (Critic)
    DPO ────────┤            ├──── GRPO (无 Critic)
                 |            |
              规则/模型奖励   规则/模型奖励
</code></pre>
<p>这个范式的价值在于:</p>
<ol>
<li><strong>概念清晰</strong>: 不再将 RFT/DPO/PPO/GRPO 视为互不相关的独立方法，而是理解它们为同一框架下的参数选择。</li>
<li><strong>迁移方便</strong>: 如果一个方法在某个任务上效果不佳，可以根据范式分析是哪个维度出了问题(数据?奖励?算法?)，然后有针对性地调整。</li>
<li><strong>组合创新</strong>: 可以混合不同维度的选择，例如「在线采样 + 规则奖励 + DPO 风格的目标函数」。</li>
</ol>
<hr>
<h2 id="3-cdmmxdsxmx-nlqyddcjz">3. 从代码模型到数学模型: 能力迁移的底层机制</h2>
<h3 id="3-1-wsmdmyxlyzysxtl">3.1 为什么代码预训练有助于数学推理?</h3>
<p>DeepSeek-Math 的一个核心假设是:<strong>从代码模型初始化比从通用模型初始化更好</strong>。论文通过实验验证了这一假设，但没有深入解释其机制。这里我们从工程角度分析其底层原因:</p>
<ol>
<li><strong>结构化思维</strong>: 代码编写要求严格的逻辑顺序(变量定义 → 计算 → 条件判断 → 输出)。这种「逐步构造」的思维模式与数学证明中的「逐步推导」高度一致。</li>
<li><strong>符号操作</strong>: 代码中的变量赋值、函数调用和表达式求值，与数学中的代数变形、公式代入和数值计算在底层操作上是同构的。</li>
<li><strong>精确性</strong>: 代码不允许模糊——一个语法错误或类型不匹配就会导致编译失败。这种对精确性的要求训练了模型「仔细验证每一步」的习惯，这对数学推理至关重要。</li>
<li><strong>工具使用</strong>: 代码模型已经学会了「什么时候调用函数、如何传递参数、如何处理返回值」。这种能力直接迁移到「使用 Python 解决数学问题」的场景中。</li>
</ol>
<p>论文表 4 的数据支持了这一分析:DeepSeek-Coder-Base-v1.5 7B 在 GSM8K(43.2%)和 MATH(19.2%)上已经显著优于通用模型 Mistral 7B(40.3% 和 14.3%)，说明代码预训练已经赋予了模型一定的数学推理基础。</p>
<h3 id="3-2-sxyxldtynldzxqy">3.2 数学预训练对通用能力的正向迁移</h3>
<p>与「代码 → 数学」的迁移同样有趣的是「数学 → 通用」的迁移。DeepSeekMath-Base 7B 相比其前身 DeepSeek-Coder-Base-v1.5:</p>
<ul>
<li>MMLU: 49.1% → 54.9%(+5.8%)</li>
<li>BBH: 55.2% → 59.5%(+4.3%)</li>
<li>HumanEval: 43.2% → 40.9%(-2.3%)</li>
<li>MBPP: 60.4% → 52.6%(-7.8%)</li>
</ul>
<p>通用推理能力的提升说明数学预训练增强了模型的「逻辑推导」和「抽象思维」能力，而这些能力是跨领域的。代码能力的轻微下降则提示了「灾难性遗忘」的风险——虽然 20% 代码数据 + 10% 自然语言数据的配比已经有效缓解了遗忘，但代码能力的峰值仍需要更高比例的代码数据来维持。</p>
<blockquote>
<p>设计动机节点: 这个权衡直接影响了后续 DeepSeek-Coder-V2 的数据配比决策。DeepSeek-Coder-V2 选择 60% 代码 + 10% 数学 + 30% 自然语言，而非 DeepSeek-Coder 的 87% 代码 + 13% 自然语言——这意味着团队从 DeepSeek-Math 的实验中认识到，数学数据不仅对数学能力有益，对通用推理也有显著增益，因此值得在代码模型的预训练中分配一定比例。</p>
</blockquote>
<hr>
<h2 id="4-sxtldpcxjysjwr">4. 数学推理的评测陷阱与数据污染</h2>
<h3 id="4-1-sjwrdbkbmx">4.1 数据污染的不可避免性</h3>
<p>DeepSeek-Math 采用了严格的去污染措施(10-gram 过滤 + 精确匹配)，但论文也坦诚地指出:</p>
<blockquote>
<p>&quot;尽管我们尽最大努力收集最新的代码问题进行模型测试，但数据污染的可能性无法完全排除。&quot;</p>
</blockquote>
<p>数学评测中的数据污染尤其难以防范，因为:</p>
<ol>
<li><strong>问题表述的变体</strong>: 同一数学问题可能有数十种不同的文字表述，n-gram 过滤无法捕捉语义层面的重复。</li>
<li><strong>解答的广泛传播</strong>: 数学竞赛题的解答在论坛、博客、教育网站上广泛存在，即使问题本身被过滤，模型也可能从解答中「学到」解题模式。</li>
<li><strong>核心知识的天生重叠</strong>: 某些数学问题测试的是基础定理的应用(如勾股定理、二次方程求根公式)，这些知识无论如何都无法从训练数据中完全排除。</li>
</ol>
<h3 id="4-2-pcsjdgjfx">4.2 评测设计的改进方向</h3>
<p>基于 DeepSeek-Math 的经验，更可靠的数学评测应该:</p>
<ol>
<li><strong>动态更新题库</strong>: 像 LeetCode 竞赛基准那样，持续收集最新题目，确保测试数据不会出现在训练集中。</li>
<li><strong>人工原创题目</strong>: 聘请数学家设计全新的、从未公开过的问题。</li>
<li><strong>过程评估而非仅结果评估</strong>: 不仅看最终答案是否正确，还评估推理过程的合理性。这可以通过过程奖励模型或人工评判来实现。</li>
<li><strong>跨语言泛化测试</strong>: 在训练时未见过的语言上测试数学能力，以检验模型是否真正理解了数学概念而非记忆了特定语言的表述模式。</li>
</ol>
<hr>
<h2 id="5-wjwtywlfx">5. 未解问题与未来方向</h2>
<h3 id="5-1-gcjldqs">5.1 过程奖励的缺失</h3>
<p>DeepSeek-Math 使用的是「结果监督」(outcome supervision)——仅在最终答案上给予奖励。这在简单问题上有效，但在复杂多步推理中存在局限:</p>
<ul>
<li>一个 10 步推理中，如果第 5 步出错，后续 5 步即使完全正确也无法得到正确答案。结果奖励无法区分「前 5 步正确后 5 步出错」和「前 5 步出错后 5 步正确」的输出。</li>
<li>模型无法从「部分正确」的输出中学习——只要最终答案错误，整个输出就被惩罚。</li>
</ul>
<p>后续 DeepSeek-R1 通过引入「过程奖励模型」(PRM)部分解决了这个问题，但 PRM 的训练成本高且泛化能力有限。如何设计既有效又高效的过程监督机制，仍然是开放问题。</p>
<h3 id="5-2-jhydlzmddb">5.2 几何与定理证明的短板</h3>
<p>论文明确指出 DeepSeekMath 在几何和定理证明方面的能力相对较弱，特别是在处理与三角形和椭圆相关的问题时。这反映了当前大语言模型的一个普遍局限:</p>
<ul>
<li><strong>几何需要空间推理</strong>: 三角形、圆、椭圆等几何对象的关系需要空间想象能力，而自回归语言模型本质上是一维序列处理器，缺乏对二维/三维空间的天然理解。</li>
<li><strong>定理证明需要反向搜索</strong>: 证明一个定理通常需要从结论出发反向寻找前提(「要证 A，只需证 B;要证 B，只需证 C...」)，这种反向搜索与自回归模型的正向生成方向不一致。</li>
</ul>
<p>未来的改进方向可能包括:</p>
<ul>
<li>多模态融合:将几何图形作为图像输入，让模型同时处理视觉和文本信息。</li>
<li>符号-神经混合:结合符号推理引擎(如自动定理证明器)和神经网络，让各自发挥所长。</li>
<li>专门的证明搜索算法:在推理时引入树搜索(如 MCTS)来探索多种证明路径。</li>
</ul>
<h3 id="5-3-c-7b-dgdgmd-scaling">5.3 从 7B 到更大规模的scaling</h3>
<p>DeepSeek-Math 的所有实验都在 7B 规模上进行。一个自然的问题是:如果将同样的数据和方法扩展到 70B 或更大规模，性能会如何变化?</p>
<p>从 Scaling Law 的角度，更大规模的模型在数学推理上应该会有显著提升。但 DeepSeek-Math 的核心发现——「高质量数据 + 高效算法 &gt; 纯参数规模」——提示了一个重要的成本效益考量:与其训练一个 70B 模型，不如将一个 7B 模型训练得更好(更多数据、更好的 RL)。</p>
<p>后续 DeepSeek-V3(236B MoE)和 DeepSeek-R1 的实验表明，当规模足够大时，纯 RL(无需 SFT)就能激发强大的推理能力。这意味着 DeepSeek-Math 的「SFT + RL」两阶段流程在小模型上是必要的，但在超大规模模型上，RL  alone 可能就足够了。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sxyxldsjgc-chlw-tj","text":"1. 数学预训练的数据工程: 从互联网「淘金」"},{"level":3,"id":"1-1-wsm-common-crawl-b-ar-xiv-gzy","text":"1.1 为什么 Common Crawl 比 arXiv 更重要?"},{"level":3,"id":"1-2-sdd-fast-text-flqdgcxj","text":"1.2 四迭代 fastText 分类器的工程细节"},{"level":3,"id":"1-3-dyysxsjdyxjz","text":"1.3 多语言数学数据的隐性价值"},{"level":2,"id":"2-grpo-qhxxd-jbzx-gm","text":"2. GRPO: 强化学习的「降本增效」革命"},{"level":3,"id":"2-1-ppo-dtd-critic-mxdszfd","text":"2.1 PPO 的痛点: Critic 模型的双重负担"},{"level":3,"id":"2-2-grpo-dhxsx-yznxdystd-critic","text":"2.2 GRPO 的核心思想: 用组内相对优势替代 Critic"},{"level":3,"id":"2-3-grpo-y-ppo-dszdb","text":"2.3 GRPO 与 PPO 的实证对比"},{"level":3,"id":"2-4-tyfs-ljhxlffdyj","text":"2.4 统一范式: 理解后训练方法的演进"},{"level":2,"id":"3-cdmmxdsxmx-nlqyddcjz","text":"3. 从代码模型到数学模型: 能力迁移的底层机制"},{"level":3,"id":"3-1-wsmdmyxlyzysxtl","text":"3.1 为什么代码预训练有助于数学推理?"},{"level":3,"id":"3-2-sxyxldtynldzxqy","text":"3.2 数学预训练对通用能力的正向迁移"},{"level":2,"id":"4-sxtldpcxjysjwr","text":"4. 数学推理的评测陷阱与数据污染"},{"level":3,"id":"4-1-sjwrdbkbmx","text":"4.1 数据污染的不可避免性"},{"level":3,"id":"4-2-pcsjdgjfx","text":"4.2 评测设计的改进方向"},{"level":2,"id":"5-wjwtywlfx","text":"5. 未解问题与未来方向"},{"level":3,"id":"5-1-gcjldqs","text":"5.1 过程奖励的缺失"},{"level":3,"id":"5-2-jhydlzmddb","text":"5.2 几何与定理证明的短板"},{"level":3,"id":"5-3-c-7b-dgdgmd-scaling","text":"5.3 从 7B 到更大规模的scaling"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-mathematical-reasoning" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-mathematical-reasoning" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Math 数理逻辑解码</h1>
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
