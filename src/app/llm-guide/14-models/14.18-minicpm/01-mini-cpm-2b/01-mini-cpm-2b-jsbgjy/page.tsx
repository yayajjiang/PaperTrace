"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-2B 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies
原文链接: <a href="https://arxiv.org/abs/2404.06395">https://arxiv.org/abs/2404.06395</a>
发布日期: 2024-04-09 (v1), 2024-06-03 (v3)
发布机构: Tsinghua University (清华大学) &amp; Modelbest Inc. (面壁智能)
模型规模: 1.2B / 2.4B 非嵌入参数
训练数据: 1T+ tokens
开源协议: Apache 2.0</p>
</blockquote>
<hr>
<h2 id="zy-abstract">摘要 (Abstract)</h2>
<p>开发拥有多达万亿参数的大型语言模型(LLMs)的兴趣日渐浓厚, 但人们对资源效率和实际开支却感到担忧, 特别是考虑到实验的巨大成本. 这种情况凸显了探索小型语言模型(SLMs)作为资源节约型替代方案的潜力的重要性. 在此背景下, 我们引入了 MiniCPM, 特别是 1.2B 和 2.4B 非嵌入参数变体, 它们不仅在各自的类别中表现出色, 而且还展示了与 7B-13B LLM 不相上下的能力. 在关注 SLM 的同时, 我们的方法在模型和数据两个维度上都表现出了可扩展性, 适合未来的 LLM 研究. 在模型扩展方面, 我们采用了大量的模型风洞实验, 以实现稳定和最佳的扩展. 在数据扩展方面, 我们引入了热身-稳定-衰减(WSD)学习率调度器(LRS), 有利于持续训练和领域适应. 我们深入分析了 WSD LRS 中发生的有趣的训练动态. 有了 WSD LRS, 我们现在无需在模型和数据两个轴上进行大量的再训练实验, 就能高效地研究数据-模型缩放规律, 并由此得出比 Chinchilla Optimal 高得多的计算最佳数据-模型比. 此外, 我们还介绍了 MiniCPM 家族, 包括 MiniCPM-DPO、MiniCPM-MoE 和 MiniCPM-128K, 它们的卓越性能进一步巩固了 MiniCPM 在各种 SLM 应用中的基础.</p>
<blockquote>
<p>译者注: MiniCPM 的核心定位是&quot;小模型的大能力&quot;. 2.4B 非嵌入参数(总计约 2.7B)在 2024 年初是一个激进的尝试——当时业界普遍认为 7B 是端侧部署的最低门槛. MiniCPM 通过精细的超参搜索和独特的 WSD 调度器, 证明了小模型在充分训练后可以达到大模型的能力水平. 这一工作直接影响了后续的端侧模型竞争, 包括 Gemma-2 2B、Qwen2.5-0.5B/1.5B/3B 等系列的开发思路.</p>
</blockquote>
<hr>
<h2 id="1-yy-introduction">1 引言 (Introduction)</h2>
<p>近年来, 大型语言模型(LLMs)在自然语言处理领域取得了显著进展(Brown et al., 2020; Chowdhery et al., 2022; OpenAI, 2023). 这些模型通常拥有数百亿到数万亿的参数, 并在海量文本数据上进行训练. 然而, 训练和部署如此庞大的模型需要巨大的计算资源, 这给研究和实际应用带来了挑战. 因此, 探索小型语言模型(SLMs)的潜力作为一种资源高效的替代方案变得越来越重要.</p>
<p>小型语言模型具有多项优势. 首先, 它们可以在资源受限的设备(如移动设备和边缘设备)上部署, 使得 AI 应用更加普及. 其次, 较小的模型尺寸意味着更低的推理延迟和能耗, 这对于实时应用至关重要. 此外, 训练 SLMs 的实验成本显著降低, 使研究人员能够进行更广泛的实验和迭代.</p>
<p>尽管 SLMs 具有这些优势, 但它们的能力通常被认为远低于大型模型. 然而, 我们假设, 通过精心设计的训练策略和充分的训练, SLMs 可以达到令人惊讶的性能水平. 在本文中, 我们介绍了 MiniCPM, 一个旨在挑战这一假设的小型语言模型系列.</p>
<p>MiniCPM 的核心贡献包括:</p>
<ol>
<li><p><strong>模型风洞实验</strong>: 我们进行了广泛的超参数搜索实验, 以找到最佳的模型配置和训练设置. 这些实验帮助我们确定了稳定和高效的训练配方.</p>
</li>
<li><p><strong>WSD 学习率调度器</strong>: 我们提出了 Warmup-Stable-Decay(WSD)学习率调度器, 它将训练过程分为三个阶段: 热身阶段、稳定训练阶段和衰减阶段. WSD 调度器特别适用于持续训练和领域适应, 因为它允许从中间检查点恢复训练并进入衰减阶段.</p>
</li>
<li><p><strong>缩放规律研究</strong>: 利用 WSD 调度器, 我们高效地研究了数据-模型缩放规律, 发现最优的数据-模型比远高于 Chinchilla Optimal(Hoffmann et al., 2022). 这一发现对于指导未来模型训练的数据规划具有重要意义.</p>
</li>
<li><p><strong>MiniCPM 家族</strong>: 基于上述技术, 我们开发了 MiniCPM 系列模型, 包括基础模型、DPO 对齐模型、长上下文模型(128K)和 MoE 模型. 这些模型在各自的规模类别中表现出色, 并与更大的模型竞争.</p>
</li>
</ol>
<blockquote>
<p>译者注: &quot;模型风洞实验&quot;(model wind tunnel experiments)这个术语借自航空工程——风洞用于测试飞机设计的空气动力学特性. 在深度学习中, 它指的是在小规模模型上进行广泛的超参数搜索, 然后将发现的规律迁移到大规模模型. 这种方法的经济性在于: 在小模型上做一次完整实验的成本, 可能只有大模型的 1/100 甚至更低. MiniCPM 的作者们正是利用这一点, 在 0.04B 到 2B 的范围内进行了系统性的网格搜索, 找到了最优的深度-宽度比、学习率、batch size 等关键超参.</p>
</blockquote>
<hr>
<h2 id="2-mxfdsy-model-wind-tunnel-experiments">2 模型风洞实验 (Model Wind Tunnel Experiments)</h2>
<h3 id="2-1-sysj">2.1 实验设计</h3>
<p>为了找到最佳的模型配置, 我们进行了一系列模型风洞实验. 这些实验涉及训练不同规模的模型(从 0.04B 到 2B 参数), 并系统地变化关键超参数, 包括模型深度、宽度、学习率、batch size 等.</p>
<p>我们的实验设计遵循以下原则:</p>
<ul>
<li><strong>系统性</strong>: 我们在一个多维网格上搜索超参数, 确保覆盖广泛的配置空间.</li>
<li><strong>经济性</strong>: 小模型实验成本低, 使我们能够进行大量实验.</li>
<li><strong>可迁移性</strong>: 我们假设在小模型上发现的最佳超参数可以迁移到更大的模型.</li>
</ul>
<h3 id="2-2-gjfx">2.2 关键发现</h3>
<p>通过模型风洞实验, 我们获得了以下关键发现:</p>
<p><strong>深度-宽度比</strong>: 对于小型语言模型, 更深的网络(更多的层)比较宽的网络(更大的隐藏维度)表现更好. 这一发现与 Liu et al. (2024) 的观察一致, 即深而薄的网络更适合 SLMs. 基于这一发现, MiniCPM-2.4B 采用了 40 层的深度架构, 而 MiniCPM-1.2B 甚至更深, 达到 52 层.</p>
<p><strong>学习率</strong>: 最优学习率与模型规模有关. 我们发现, 对于小模型, 相对较高的学习率(如 0.01 到 0.1 之间)通常效果更好.</p>
<p><strong>Batch Size</strong>: 较大的 batch size 通常带来更稳定的训练, 但我们也观察到, 在一定的阈值之后, 进一步增加 batch size 的收益递减.</p>
<blockquote>
<p>译者注: &quot;深而薄&quot;(deep and thin)的架构选择是 MiniCPM 的一个关键洞察. 标准 Transformer 的设计通常倾向于较宽的隐藏维度(如 4096 或 8192)和中等深度(如 32 或 40 层). 但 MiniCPM-2.4B 选择了 d_model=2304(相对较窄)和 40 层(相对较深). 这种选择的原因是: 对于固定参数量, 增加深度比增加宽度能带来更好的表征能力——每一层新增的变换都引入了额外的非线性, 而增加宽度只是线性扩展. 但代价是训练稳定性下降(梯度消失/爆炸风险增加)和推理延迟上升(更多的串行计算). MiniCPM 通过精心的初始化、学习率调度和归一化策略来稳定深层网络的训练.</p>
</blockquote>
<hr>
<h2 id="3-wsd-xxstdq-wsd-learning-rate-scheduler">3 WSD 学习率调度器 (WSD Learning Rate Scheduler)</h2>
<h3 id="3-1-dj">3.1 动机</h3>
<p>传统的学习率调度器, 如余弦退火(cosine annealing), 通常需要预先定义总的训练步数. 这在实际应用中是一个限制, 因为研究人员可能希望在训练过程中根据中间结果调整训练计划. 此外, 余弦调度器在整个训练过程中持续衰减学习率, 这可能不是最优的——在训练初期, 模型需要较大的学习率来快速探索参数空间; 在训练后期, 较小的学习率有助于精细调整.</p>
<h3 id="3-2-wsd-ddy">3.2 WSD 的定义</h3>
<p>基于上述观察, 我们提出了 Warmup-Stable-Decay(WSD)学习率调度器, 它将训练明确分为三个阶段:</p>
<p><strong>阶段一: 热身阶段(Warmup)</strong>. 从步数 0 到 W, 学习率从 0 线性增加到最大值 η.</p>
<p><strong>阶段二: 稳定训练阶段(Stable)</strong>. 从步数 W 到 T, 学习率保持在最大值 η 不变.</p>
<p><strong>阶段三: 衰减阶段(Decay)</strong>. 从步数 T 到 S, 学习率通过衰减函数 f(s-T) 从 η 递减.</p>
<p>数学形式如下:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>W</mi><mi>S</mi><mi>D</mi><mo stretchy="false">(</mo><mi>T</mi><mo separator="true">;</mo><mi>s</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mfrac><mi>s</mi><mi>W</mi></mfrac><mi>η</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>s</mi><mo>&lt;</mo><mi>W</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>η</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>W</mi><mo>≤</mo><mi>s</mi><mo>≤</mo><mi>T</mi></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mi>η</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>T</mi><mo>&lt;</mo><mi>s</mi></mrow></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">WSD(T; s) = \\begin{cases}
\\frac{s}{W} \\eta, &amp; s &lt; W \\\\
\\eta, &amp; W \\leq s \\leq T \\\\
f(s-T) \\eta, &amp; T &lt; s
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:4.32em;vertical-align:-1.91em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.35em;"><span style="top:-2.2em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎩</span></span></span><span style="top:-2.192em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.316em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"/></svg></span></span><span style="top:-3.15em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎨</span></span></span><span style="top:-4.292em;"><span class="pstrut" style="height:3.15em;"></span><span style="height:0.316em;width:0.8889em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.8889em" height="0.316em" style="width:0.8889em" viewBox="0 0 888.89 316" preserveAspectRatio="xMinYMin"><path d="M384 0 H504 V316 H384z M384 0 H504 V316 H384z"/></svg></span></span><span style="top:-4.6em;"><span class="pstrut" style="height:3.15em;"></span><span class="delimsizinginner delim-size4"><span>⎧</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.85em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.41em;"><span style="top:-4.41em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6954em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mpunct">,</span></span></span><span style="top:-2.97em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mpunct">,</span></span></span><span style="top:-1.53em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mpunct">,</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.91em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.41em;"><span style="top:-4.41em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span><span style="top:-2.97em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span><span style="top:-1.53em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.91em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0</mn><mo>&lt;</mo><mi>f</mi><mo stretchy="false">(</mo><mi>s</mi><mo>−</mo><mi>T</mi><mo stretchy="false">)</mo><mo>≤</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">0 &lt; f(s-T) \\leq 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6835em;vertical-align:-0.0391em;"></span><span class="mord">0</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 是关于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi></mrow><annotation encoding="application/x-tex">s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span></span></span></span> 的递减函数, η 是最大学习率. 通常情况下, 只要热身阶段足够, 它对最终性能的影响很小, 因此我们在后续讨论中省略 W.</p>
<blockquote>
<p>译者注: WSD 的设计非常简洁——三段式: 热身→稳定→衰减. 但简洁的背后是一个深刻的洞察: 模型在&quot;稳定阶段&quot;(高学习率)主要学习粗粒度的语言结构和知识, 在&quot;衰减阶段&quot;(低学习率)主要进行精细的能力优化. 这种分离使得 WSD 具有两个独特优势: (1) 可以从任意中间检查点恢复并进入衰减阶段, 支持持续训练;(2) 衰减阶段只占约 10% 的 token, 却贡献了显著的 loss 下降, 这使得用少量高质量数据在衰减阶段进行&quot;退火&quot;(annealing)变得极为高效.</p>
</blockquote>
<h3 id="3-3-xldtfx">3.3 训练动态分析</h3>
<p>我们观察到一个有趣的现象: 在 WSD 的衰减阶段, 训练损失会出现突然的显著下降. 这表明, 在高学习率的稳定阶段, 模型可能处于一个&quot;高原&quot;状态——参数在损失 landscape 的一个相对平坦区域游走, 但没有找到更深的局部最小值. 当学习率开始衰减时, 模型能够更精细地探索这个区域的细节, 从而发现更好的最小值.</p>
<p>这一现象对训练策略有重要启示: 稳定阶段的主要作用是&quot;探索&quot;参数空间, 而衰减阶段的主要作用是&quot;精炼&quot;已发现的解. 因此, 衰减阶段引入高质量数据(如 SFT 数据或领域特定数据)可以获得比仅在 SFT 阶段使用这些数据更好的效果.</p>
<h3 id="3-4-yyxtdqdbj">3.4 与余弦调度器的比较</h3>
<p>与传统的余弦调度器相比, WSD 具有以下优势:</p>
<ol>
<li><p><strong>无需预定义总步数</strong>: 余弦调度器需要知道总训练步数才能计算衰减曲线, 而 WSD 可以在任意步数开始衰减.</p>
</li>
<li><p><strong>支持持续训练</strong>: 可以从稳定阶段的任何检查点恢复, 进入衰减阶段, 无需重新训练.</p>
</li>
<li><p><strong>中间检查点可用</strong>: 稳定阶段的检查点可以直接使用, 无需等待训练完成.</p>
</li>
<li><p><strong>高效的数据利用</strong>: 衰减阶段可以使用高质量数据进行精细优化.</p>
</li>
</ol>
<h3 id="3-5-sfglyj">3.5 缩放规律研究</h3>
<p>利用 WSD 调度器, 我们高效地研究了数据-模型缩放规律. 传统方法需要在模型轴和数据轴上进行大量的再训练实验, 成本为二次方 O(mD). 而使用 WSD, 我们只需要在模型轴上进行线性数量的实验 O(mC), 因为对于每个模型, 我们可以从稳定阶段的不同检查点(对应不同的数据量)直接进入衰减阶段, 获得不同数据量下的最终性能.</p>
<p>我们训练了 6 种不同规模的模型(从 0.04B 到 2B), 每种模型在稳定阶段训练后, 从 10N 到 60N 的不同数据量检查点进入衰减阶段(N 为模型参数量). 最终损失在 5 个 held-out 评估集上测量. 为了比较使用不同 tokenizer 的模型的损失, 我们按照 Achiam et al. (2023) 的方法, 使用字节数而非 token 数平均损失.</p>
<p>我们使用 scipy curvefit 函数拟合损失与模型大小 N 和数据大小 D 的关系:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>N</mi><mo separator="true">,</mo><mi>D</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>C</mi><mi>N</mi></msub><msup><mi>N</mi><mrow><mo>−</mo><mi>α</mi></mrow></msup><mo>+</mo><msub><mi>C</mi><mi>D</mi></msub><msup><mi>D</mi><mrow><mo>−</mo><mi>β</mi></mrow></msup><mo>+</mo><msub><mi>L</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">L(N, D) = C_N N^{-\\alpha} + C_D D^{-\\beta} + L_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9713em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8213em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0491em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>拟合曲线沿数据轴的结果如图 17 所示(橙色线). 然后我们可以得到在固定计算量 C = 6ND(Rae et al., 2021) 下的最优模型大小 N_opt 和数据集大小 D_opt:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>N</mi><mrow><mi>o</mi><mi>p</mi><mi>t</mi></mrow></msub><mo>=</mo><msup><mrow><mo fence="true">(</mo><mfrac><mrow><mi>α</mi><msub><mi>C</mi><mi>N</mi></msub></mrow><mrow><mi>β</mi><msub><mi>C</mi><mi>D</mi></msub></mrow></mfrac><mo fence="true">)</mo></mrow><mfrac><mn>1</mn><mrow><mi>α</mi><mo>+</mo><mi>β</mi></mrow></mfrac></msup><msup><mi>C</mi><mfrac><mi>β</mi><mrow><mi>α</mi><mo>+</mo><mi>β</mi></mrow></mfrac></msup></mrow><annotation encoding="application/x-tex">N_{opt} = \\left( \\frac{\\alpha C_N}{\\beta C_D} \\right)^{\\frac{1}{\\alpha + \\beta}} C^{\\frac{\\beta}{\\alpha + \\beta}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">pt</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7439em;vertical-align:-0.95em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.7939em;"><span style="top:-4.2029em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8443em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.384em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4829em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.1167em;"><span style="top:-3.4458em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9584em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.4624em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4829em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>D</mi><mrow><mi>o</mi><mi>p</mi><mi>t</mi></mrow></msub><mo>=</mo><msup><mrow><mo fence="true">(</mo><mfrac><mrow><mi>β</mi><msub><mi>C</mi><mi>D</mi></msub></mrow><mrow><mi>α</mi><msub><mi>C</mi><mi>N</mi></msub></mrow></mfrac><mo fence="true">)</mo></mrow><mfrac><mn>1</mn><mrow><mi>α</mi><mo>+</mo><mi>β</mi></mrow></mfrac></msup><msup><mi>C</mi><mfrac><mi>α</mi><mrow><mi>α</mi><mo>+</mo><mi>β</mi></mrow></mfrac></msup></mrow><annotation encoding="application/x-tex">D_{opt} = \\left( \\frac{\\beta C_D}{\\alpha C_N} \\right)^{\\frac{1}{\\alpha + \\beta}} C^{\\frac{\\alpha}{\\alpha + \\beta}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">pt</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7439em;vertical-align:-0.95em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.7939em;"><span style="top:-4.2029em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8443em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.384em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4829em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9298em;"><span style="top:-3.4458em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.6915em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.384em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4829em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span></span></span></span></span><blockquote>
<p>译者注: 这里的关键发现是 MiniCPM 得出的最优数据-模型比远高于 Chinchilla Optimal. Chinchilla 的结论是: 对于给定的计算预算, 模型参数量 N 和训练 token 数 D 应该大致相等(即 N ≈ D, 以 20B token 训练 10B 模型). 但 MiniCPM 的发现暗示, 对于小模型, 应该用更多的数据来训练——可能是 Chinchilla 建议的 2-3 倍. 这一结论对端侧模型的训练策略有直接影响: 不要追求更大的模型, 而是追求更充分训练的模型. 但需要注意, 这个结论的适用范围可能仅限于 SLM 区域( &lt; 3B), 在 LLM 区域( &gt; 10B)是否成立仍需验证.</p>
</blockquote>
<hr>
<h2 id="4-mx-model">4 模型 (Model)</h2>
<h3 id="4-1-mxjg">4.1 模型架构</h3>
<p>MiniCPM 基于标准的 Transformer 解码器架构(Vaswani et al., 2017), 并采用了以下改进:</p>
<p><strong>分组查询注意力(GQA)</strong>. 我们在 MiniCPM-1.2B 上应用了 Group Query Attention(Ainslie et al., 2023), 以进一步减少参数量. MiniCPM-2.4B 保持标准的多头注意力不变.</p>
<p><strong>深层架构</strong>. 如模型风洞实验所示, 我们选择深而薄的架构. MiniCPM-2.4B 有 40 层, MiniCPM-1.2B 有 52 层.</p>
<h3 id="4-2-mxpz">4.2 模型配置</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>N(B)</th>
<th>d_model</th>
<th>d_ff</th>
<th>d_h</th>
<th>n_q</th>
<th>n_kv</th>
<th>L</th>
<th>Batch size(M)</th>
<th>Tokens(T)</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-1.2B</td>
<td>1,247,442,432</td>
<td>1536</td>
<td>3840</td>
<td>64</td>
<td>24</td>
<td>8</td>
<td>52</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>MiniCPM-2.4B</td>
<td>2,442,057,984</td>
<td>2304</td>
<td>5760</td>
<td>64</td>
<td>36</td>
<td>36</td>
<td>40</td>
<td>-</td>
<td>-</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: MiniCPM 的模型配置. N(B) 表示模型的非嵌入参数数量, d_model 表示模型隐藏维度, d_ff 表示前馈层瓶颈维度, d_h 表示注意力头维度, n_q 表示查询头数, n_kv 表示键/值头数, L 表示层数, Batch size(M) 表示训练 batch size(百万), Tokens(T) 表示总训练 token 数.</p>
</blockquote>
<hr>
<h2 id="5-sy-experiments">5 实验 (Experiments)</h2>
<h3 id="5-1-xlsz">5.1 训练设置</h3>
<p>我们使用 AdamW 优化器进行训练, 权重衰减为 0.1. 训练数据包括来自网页、书籍、代码和对话的多样化文本. 具体的训练配方通过模型风洞实验确定.</p>
<h3 id="5-2-zyjg">5.2 主要结果</h3>
<p>我们在多个学术基准测试上评估了 MiniCPM, 包括 C-Eval、CMMLU、MMLU、GSM8K、MATH、HumanEval 和 MBPP. 结果如表 2 所示.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>C-Eval</th>
<th>CMMLU</th>
<th>MMLU</th>
<th>GSM8K</th>
<th>MATH</th>
<th>HumanEval</th>
<th>MBPP</th>
</tr>
</thead>
<tbody><tr>
<td>Llama-7B</td>
<td>32.6</td>
<td>32.0</td>
<td>35.2</td>
<td>14.2</td>
<td>3.2</td>
<td>11.6</td>
<td>18.9</td>
</tr>
<tr>
<td>Mistral-7B</td>
<td>47.4</td>
<td>46.2</td>
<td>62.7</td>
<td>38.4</td>
<td>10.8</td>
<td>27.4</td>
<td>36.4</td>
</tr>
<tr>
<td>Gemma-7B</td>
<td>42.9</td>
<td>43.3</td>
<td>59.6</td>
<td>37.0</td>
<td>21.8</td>
<td>25.6</td>
<td>32.8</td>
</tr>
<tr>
<td>Llama-13B</td>
<td>37.1</td>
<td>37.0</td>
<td>47.6</td>
<td>20.9</td>
<td>3.9</td>
<td>15.2</td>
<td>24.0</td>
</tr>
<tr>
<td>MiniCPM-1.2B</td>
<td>52.6</td>
<td>51.1</td>
<td>50.9</td>
<td>42.3</td>
<td>5.4</td>
<td>30.4</td>
<td>30.3</td>
</tr>
<tr>
<td>MiniCPM-2.4B</td>
<td>52.1</td>
<td>52.0</td>
<td>53.5</td>
<td>53.8</td>
<td>10.2</td>
<td>33.5</td>
<td>32.8</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: MiniCPM 与同等规模及更大规模模型的性能对比. 所有结果均为 few-shot 设置. MiniCPM-2.4B 在多数基准上超越了 Llama-13B, 并在中文任务(C-Eval、CMMLU)上超越了 Mistral-7B.</p>
</blockquote>
<blockquote>
<p>译者注: MiniCPM-2.4B 的结果非常引人注目. GSM8K 53.8% 在 2.4B 规模上是前所未有的——作为对比, Gemma-2 2B(2024 年 6 月发布)的 GSM8K 约为 46%, 而 MiniCPM-2.4B 在 2024 年 4 月就已经达到了 53.8%. 中文能力(C-Eval 52.1%, CMMLU 52.0%)同样强劲, 这与训练数据中的中文比例较高有关. 但 MATH 仅 10.2%, HumanEval 33.5%, 说明在复杂数学推理和代码生成上, 小模型仍有明显的天花板效应.</p>
</blockquote>
<h3 id="5-3-sjjddsjcl">5.3 衰减阶段的数据策略</h3>
<p>为了验证衰减阶段引入高质量数据的效果, 我们进行了以下对比实验:</p>
<ul>
<li><strong>A-1</strong>: 基础模型, 仅在 SFT 阶段使用 SFT 数据.</li>
<li><strong>A-2</strong>: 基础模型, 在衰减阶段将 SFT 数据混入预训练数据, 随后进行 6B token 的 SFT.</li>
<li><strong>B-1/B-2/B-3</strong>: 不同配置的变体.</li>
</ul>
<p>结果表明, 尽管 A-2 和 A-1 经历了相同的 SFT 分布, 但在衰减阶段添加 SFT 数据显著提升了性能. B-2 与 B-3 的对比表明, 仅 SFT 的不足并非由于 SFT 阶段的训练 token 不足.</p>
<p>这些结果表明, 在衰减阶段开始时引入高质量数据的收益远高于仅在 SFT 阶段添加这些数据. 因此, 我们推荐模型的专业化和能力增强应从衰减阶段开始.</p>
<hr>
<h2 id="6-mini-cpm-jz-mini-cpm-family">6 MiniCPM 家族 (MiniCPM Family)</h2>
<h3 id="6-1-mini-cpm-dpo">6.1 MiniCPM-DPO</h3>
<p>我们使用 Direct Preference Optimization(DPO)对 MiniCPM 进行对齐训练. DPO 训练使用 UltraFeedback 数据集, 并在学习率 1×10^-5 下进行 1 个 epoch, 使用余弦学习率调度器.</p>
<p>在 MTBench 上, MiniCPM-DPO 超越了 Zephyr-7B, 展示了小型模型在经过偏好对齐后可以达到的对话质量.</p>
<h3 id="6-2-mini-cpm-128k">6.2 MiniCPM-128K</h3>
<p>我们通过扩展位置编码和继续训练, 将 MiniCPM-2.4B 的上下文窗口扩展到 128K. 在 LongBench 等长上下文基准测试中, MiniCPM-128K 的表现超越了 Yarn-Mistral-7B-128K 和 ChatGLM3-6B-128K.</p>
<blockquote>
<p>译者注: 在 2.4B 参数规模上实现 128K 上下文是一个显著的工程成就. 标准 RoPE 位置编码在超出训练长度时会面临&quot;注意力稀释&quot;问题. MiniCPM-128K 的解决方案可能包括位置编码插值(NTK-aware interpolation)或 YaRN(Yet another RoPE extension). 长上下文能力对于端侧应用(如本地文档分析、多轮对话)至关重要, 但 128K 的 KV Cache 即使在 GQA 压缩后也需要数 GB 内存, 这限制了其在低端设备上的可用性.</p>
</blockquote>
<h3 id="6-3-mini-cpm-moe">6.3 MiniCPM-MoE</h3>
<p>我们探索了混合专家(MoE)架构在小型模型中的应用. MiniCPM-MoE 使用 4B 激活参数, 在保持与 MiniCPM-2.4B 相当的推理成本的同时, 性能匹敌 Llama2-34B.</p>
<hr>
<h2 id="7-jl-conclusion">7 结论 (Conclusion)</h2>
<p>本文介绍了 MiniCPM, 包含两个非嵌入参数分别为 2.4B 和 1.2B 的 SLM. 这些模型展示了超越其规模的能力, 与 7B-13B 的 LLM 竞争. 我们的训练方法论在模型规模和数据规模上都是可扩展的, 为未来的 LLM 开发提供了潜在的适用性.</p>
<p>WSD 调度器的引入值得注意, 它促进了持续训练, 展现了有趣的训练动态, 并使得高效研究缩放规律成为可能. 我们进一步介绍了 MiniCPM 家族, 包括 DPO、长上下文和 MoE 版本. 未来的方向包括深入分析衰减阶段的损失下降机制, 以及通过扩展模型规模和数据规模来增强 MiniCPM 的能力.</p>
<hr>
<h2 id="fl-syb">附录: 术语表</h2>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>首次出现位置</th>
<th>简要解释</th>
</tr>
</thead>
<tbody><tr>
<td>SLM</td>
<td>小型语言模型</td>
<td>摘要</td>
<td>参数量通常在 1B-3B 范围内的语言模型</td>
</tr>
<tr>
<td>WSD</td>
<td>热身-稳定-衰减</td>
<td>第 3 节</td>
<td>三阶段学习率调度器, 支持持续训练</td>
</tr>
<tr>
<td>GQA</td>
<td>分组查询注意力</td>
<td>第 4 节</td>
<td>将查询头分组共享 KV 头, 减少 KV Cache</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>第 6.1 节</td>
<td>不依赖奖励模型, 直接用偏好数据优化策略</td>
</tr>
<tr>
<td>MoE</td>
<td>混合专家</td>
<td>第 6.3 节</td>
<td>稀疏激活架构, 每个 token 只路由到部分专家</td>
</tr>
<tr>
<td>Wind Tunnel</td>
<td>模型风洞实验</td>
<td>第 2 节</td>
<td>在小模型上系统搜索超参, 再迁移到大模型</td>
</tr>
<tr>
<td>Chinchilla Optimal</td>
<td>Chinchilla 最优</td>
<td>摘要</td>
<td>DeepMind 提出的计算最优数据-模型比</td>
</tr>
<tr>
<td>NTK-aware</td>
<td>NTK 感知插值</td>
<td>第 6.2 节</td>
<td>一种位置编码扩展方法, 支持更长上下文</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 MiniCPM 官方技术报告的精译. 核心技术创新为 WSD 学习率调度器和模型风洞实验方法论. 由于网络限制, 原始 PDF 未能成功下载, D1 暂缺, D3/D4 基于已有信息跳过. D2 基于 arXiv 摘要、HTML 版本和第三方解读综合整理.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy-abstract","text":"摘要 (Abstract)"},{"level":2,"id":"1-yy-introduction","text":"1 引言 (Introduction)"},{"level":2,"id":"2-mxfdsy-model-wind-tunnel-experiments","text":"2 模型风洞实验 (Model Wind Tunnel Experiments)"},{"level":3,"id":"2-1-sysj","text":"2.1 实验设计"},{"level":3,"id":"2-2-gjfx","text":"2.2 关键发现"},{"level":2,"id":"3-wsd-xxstdq-wsd-learning-rate-scheduler","text":"3 WSD 学习率调度器 (WSD Learning Rate Scheduler)"},{"level":3,"id":"3-1-dj","text":"3.1 动机"},{"level":3,"id":"3-2-wsd-ddy","text":"3.2 WSD 的定义"},{"level":3,"id":"3-3-xldtfx","text":"3.3 训练动态分析"},{"level":3,"id":"3-4-yyxtdqdbj","text":"3.4 与余弦调度器的比较"},{"level":3,"id":"3-5-sfglyj","text":"3.5 缩放规律研究"},{"level":2,"id":"4-mx-model","text":"4 模型 (Model)"},{"level":3,"id":"4-1-mxjg","text":"4.1 模型架构"},{"level":3,"id":"4-2-mxpz","text":"4.2 模型配置"},{"level":2,"id":"5-sy-experiments","text":"5 实验 (Experiments)"},{"level":3,"id":"5-1-xlsz","text":"5.1 训练设置"},{"level":3,"id":"5-2-zyjg","text":"5.2 主要结果"},{"level":3,"id":"5-3-sjjddsjcl","text":"5.3 衰减阶段的数据策略"},{"level":2,"id":"6-mini-cpm-jz-mini-cpm-family","text":"6 MiniCPM 家族 (MiniCPM Family)"},{"level":3,"id":"6-1-mini-cpm-dpo","text":"6.1 MiniCPM-DPO"},{"level":3,"id":"6-2-mini-cpm-128k","text":"6.2 MiniCPM-128K"},{"level":3,"id":"6-3-mini-cpm-moe","text":"6.3 MiniCPM-MoE"},{"level":2,"id":"7-jl-conclusion","text":"7 结论 (Conclusion)"},{"level":2,"id":"fl-syb","text":"附录: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/01-mini-cpm-2b/01-mini-cpm-2b-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/01-mini-cpm-2b/01-mini-cpm-2b-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-2B 技术报告精译</h1>
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
