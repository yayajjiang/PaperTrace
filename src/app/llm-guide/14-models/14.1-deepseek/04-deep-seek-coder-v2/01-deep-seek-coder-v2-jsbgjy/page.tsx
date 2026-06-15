"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder-V2 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence
原文链接: <a href="https://arxiv.org/abs/2406.11931">https://arxiv.org/abs/2406.11931</a>
发布日期: 2024-06
发布机构: DeepSeek-AI</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>我们提出了 DeepSeek-Coder-V2，一个开源的混合专家(Mixture-of-Experts, MoE)代码语言模型，其在代码特定任务上的性能可与 GPT4-Turbo 相当。具体而言，DeepSeek-Coder-V2 从 DeepSeek-V2 的一个中间Checkpoint出发，在额外的 6 万亿个 token 上进行了进一步预训练。通过这种持续预训练，DeepSeek-Coder-V2 显著增强了 DeepSeek-V2 的编码和数学推理能力，同时在通用语言任务上保持了可比的性能。与 DeepSeek-Coder-33B 相比，DeepSeek-Coder-V2 在代码相关任务的各个方面以及推理和通用能力上都展现出显著进步。此外，DeepSeek-Coder-V2 将支持的编程语言从 86 种扩展到 338 种，同时将上下文长度从 16K 扩展到 128K。在标准基准评估中，DeepSeek-Coder-V2 在编码和数学基准测试中优于 GPT4-Turbo、Claude 3 Opus 和 Gemini 1.5 Pro 等闭源模型。</p>
<blockquote>
<p>这里值得停一下。DeepSeek-Coder-V2 的核心定位非常清晰:它不是从零训练，而是「站在巨人肩膀上」的持续预训练。选择 DeepSeek-V2 作为基座而非 DeepSeek-Coder-33B，意味着团队认为通用语言能力对代码智能至关重要——纯代码模型在复杂推理和跨领域迁移上存在天花板。6T 额外 token 的数据构成(60% 代码 + 10% 数学 + 30% 自然语言)也印证了这一点:代码能力不是孤立训练的产物，而是代码、数学推理和通用语言能力的协同增强。</p>
</blockquote>
<hr>
<h2 id="1-yy">1. 引言</h2>
<p>开源社区在代码智能领域取得了显著进展，通过开发 StarCoder、CodeLlama、DeepSeek-Coder 和 Codestral 等开源代码模型，逐步逼近闭源模型的性能水平。然而，与 GPT4-Turbo、Claude 3 Opus 和 Gemini 1.5 Pro 等最先进的闭源模型相比，仍然存在可察觉的差距。为了弥合这一差距并进一步推动开源代码模型的发展，我们引入了 DeepSeek-Coder-V2 系列。这些模型建立在 DeepSeek-V2 的基础之上，并在额外的 6 万亿 token 语料库上进行了进一步预训练。</p>
<p>在预训练阶段，DeepSeek-Coder-V2 的数据集由 60% 的源代码、10% 的数学语料库和 30% 的自然语言语料库组成。源代码部分包含 1,170B 个代码相关 token，来自 GitHub 和 CommonCrawl，使用与 DeepSeekMath 相同的流水线。与 DeepSeek-Coder 训练所用代码语料库相比，该语料库将编程语言覆盖范围从 86 种扩展到 338 种。为了验证新代码语料库的有效性，我们用 1B 参数模型进行了消融实验，观察到 HumanEval 准确率提升 6.7%(从 30.5% 到 37.2%)、MBPP 准确率提升 9.4%(从 44.6% 到 54.0%)。对于数学语料库，我们使用相同流水线从 CommonCrawl 收集了 221B 个数学相关 token，大约是 DeepSeekMath 语料库(120B)的两倍; 自然语言语料库则直接从 DeepSeek-V2 的训练语料库中采样。总体而言，DeepSeek-Coder-V2 共接触了 10.2T 训练 token，其中 4.2 万亿来自 DeepSeek-V2 数据集，其余 6 万亿来自 DeepSeek-Coder-V2 数据集。</p>
<p>为了适应更长的代码输入并增强在各种编程场景中的适用性，我们将上下文长度从 16K 扩展到 128K token，使模型能够处理更复杂和广泛的编码任务。在多源语料库上持续预训练 DeepSeek-V2 后，我们发现 DeepSeek-Coder-V2 显著增强了模型的编码和数学推理能力，同时保持了可比的通用语言性能。</p>
<p>在对齐阶段，我们首先构建了一个指令训练数据集，包含来自 DeepSeek-Coder 和 DeepSeek-Math 的代码与数学数据，以及来自 DeepSeek-V2 的通用指令数据，用于微调基座模型。然后，在强化学习阶段，我们采用 Group Relative Policy Optimization(GRPO，分组相对策略优化)算法将其行为与人类偏好对齐。偏好数据在编码领域通过编译器反馈和测试用例收集，并开发了一个奖励模型来指导策略模型的训练。这一方法确保模型在编码任务中的回复针对正确性和人类偏好进行了优化。为了使模型在对齐后仍支持代码补全，我们在 16B 参数基座模型的微调过程中还采用了 Fill-In-Middle(FIM，中间填充)方法。</p>
<blockquote>
<p>译者注: 对齐阶段的一个关键细节是「FIM 保留」。通常经过 SFT+RL 的对齐模型会失去代码补全能力，因为指令数据格式与补全格式完全不同。DeepSeek-Coder-V2 在 16B Lite 版本的 SFT 中保留 FIM，说明团队明确区分了「对话助手」和「IDE 补全引擎」两种使用场景。236B 大模型未启用 FIM，可能是因为其主要定位是对话式编程助手而非 IDE 插件。</p>
</blockquote>
<h3 id="1-1-zygx">1.1 主要贡献</h3>
<p>总结而言，我们的主要贡献如下:</p>
<ul>
<li>我们推出了基于 DeepSeekMoE 框架的 DeepSeek-Coder-V2，包含 16B 和 236B 参数两个版本，激活参数分别仅为 2.4B 和 21B，高效支持多样化的计算和应用需求。此外，DeepSeek-Coder-V2 支持 338 种编程语言，最大上下文长度为 128K token。</li>
<li>我们首次尝试开发开源的千亿参数代码模型以推进代码智能领域的发展。实验结果表明，DeepSeek-Coder-V2 236B 在编码和数学任务上超越了 GPT4-Turbo、Claude 3 Opus 和 Gemini 1.5 Pro 等最先进的闭源模型。</li>
<li>DeepSeek-Coder-V2 模型以宽松许可证公开发布，允许用于研究和无限制的商业用途。</li>
</ul>
<h3 id="1-2-pcyzbgs">1.2 评测与指标概述</h3>
<ul>
<li><p><strong>代码</strong>: 在代码生成基准评测方面，DeepSeek-Coder-V2 在所有开源模型中展现出显著优势，同时与 GPT4-Turbo、Claude 3 Opus 和 Gemini 1.5 Pro 等领先闭源模型的性能相当。值得注意的是，我们在 HumanEval 上取得了 90.2% 的分数，在 MBPP 上取得了 76.2% 的分数(使用 EvalPlus 评测流水线创造了新的 state-of-the-art 结果)，在 LiveCodeBench 上取得了 43.4% 的分数(使用 2023 年 12 月至 2024 年 6 月的问题)。此外，DeepSeek-Coder-V2 是首个在 SWE-Bench 上得分超过 10% 的开源模型。</p>
</li>
<li><p><strong>数学</strong>: DeepSeek-Coder-V2 展现出强大的数学推理能力，在 GSM8K 等基础基准以及 MATH、AIME 和 Math Odyssey 等高级竞赛级基准上，与 GPT-4o、Gemini 1.5 Pro 和 Claude 3 Opus 等顶级闭源模型不相上下。值得注意的是，DeepSeek-Coder-V2 在 MATH 基准上取得了 75.7% 的准确率，几乎追平了 GPT-4o 达到的 76.6% 的 state-of-the-art 准确率。此外，它在 AIME 2024 竞赛中超越了这些闭源模型的表现。</p>
</li>
<li><p><strong>自然语言</strong>: DeepSeek-Coder-V2 保持了与 DeepSeek-V2 可比的通用语言性能。例如，DeepSeek-Coder-V2 在使用 OpenAI simple-eval 流水线的 MMLU 上取得了 79.2%。在由 GPT-4 担任评判的主观评测中，DeepSeek-Coder-V2 在 Arena-Hard 上取得 65.0、在 MT-Bench 上取得 8.77、在 AlignBench 上取得 7.84。这些分数显著优于其他代码专用模型，甚至与通用开源模型相当。</p>
</li>
</ul>
<blockquote>
<p>数据与实验节点: 需要注意两点。第一，SWE-Bench 12.7% 的得分虽然是开源模型首次突破 10%，但与 GPT-4o 的 26.7% 仍有显著差距，说明真实世界软件工程问题的修复能力仍是开源模型的短板。第二，MATH 75.7% 的得分是在零样本链式思维(Zero-shot CoT)条件下取得的，没有使用工具调用或多数投票——这意味着基座模型本身的数学推理能力已经很强，而非依赖 Test-time Compute Scaling 的技巧。</p>
</blockquote>
<hr>
<h2 id="2-sjsj">2. 数据收集</h2>
<p>DeepSeek-Coder-V2 的预训练数据主要由 60% 的源代码、10% 的数学语料库和 30% 的自然语言语料库组成。由于自然语言语料库直接采样自 DeepSeek-V2 的训练数据集，本节重点介绍代码和数学数据的收集、清洗与过滤流程。同时，我们通过对比分析实验进一步验证了这些数据的质量。</p>
<p>我们从 GitHub 收集了 2023 年 11 月之前创建的公开仓库。首先应用与 DeepSeek-Coder 相同的过滤规则和近去重策略，以过滤掉低质量和重复的源代码。为使论文自洽，我们简要描述过滤规则。首先，我们过滤掉平均行长度超过 100 个字符或最大行长度超过 1000 个字符的文件。此外，我们移除字母字符比例低于 25% 的文件。除 XSLT 编程语言外，我们进一步过滤掉在前 100 个字符中出现字符串 <code>&lt;?xml version=</code> 的文件。对于 HTML 文件，我们考虑可见文本与 HTML 代码的比例。我们保留可见文本占代码至少 20% 且不少于 100 个字符的文件。对于 JSON 和 YAML 文件(通常包含更多数据)，我们只保留字符数在 50 到 5000 之间的文件。这有效去除了大多数数据密集型文件。通过应用这些过滤规则和近去重，我们获得了 821B 个涵盖 338 种编程语言的代码 token 和 185B 个代码相关文本 token(如 markdown 和 issues)。支持的编程语言列表见附录。我们使用与 DeepSeek-V2 相同的分词器，详见 DeepSeek-V2 技术报告。</p>
<blockquote>
<p>译者注: 这些过滤规则看起来琐碎，但每一条背后都有明确的工程意图。「平均行长度 &gt; 100」是在过滤 minified/uglified 代码(如 JavaScript bundle)，这类代码对模型学习语义毫无帮助;「字母字符 &lt; 25%」过滤掉以二进制数据或大量数字为主的文件;「JSON/YAML 50-5000 字符」则是精准打击配置文件和数据文件。这些规则不是拍脑袋定的，而是从数据质量反馈循环中迭代出来的。</p>
</blockquote>
<p>为了从 Common Crawl 收集代码相关和数学相关的网页文本，我们遵循与 DeepSeekMath 相同的流水线。具体而言，我们选择 StackOverflow、PyTorch 文档等库站点、以及 StackExchange 等数学网站作为初始种子语料库。使用该种子语料库，我们训练了一个 fastText 模型来召回更多编码相关和数学相关的网页。由于中文等语言的分词无法通过空格完成，我们使用 DeepSeek-V2 的 Byte Pair Encoding(BPE)分词器，显著提升了 fastText 的召回准确率。对于每个域名，我们计算第一轮收集中收集到的网页百分比。超过 10% 网页被收集的域名被归类为代码相关或数学相关。然后我们标注这些识别出的域名中代码相关或数学相关内容的 URL。链接到这些 URL 的未收集网页被添加到种子语料库中。经过三轮数据收集，我们从网页中收集了 700 亿个代码相关 token 和 221B 个数学相关 token。</p>
<p>为了进一步从 GitHub 收集高质量源代码，我们还将相同的流水线应用于 GitHub，经过两轮数据收集，收集了 94B 个源代码 token。初始种子语料库通过手动收集包含详细描述的高质量源代码构建。最终，新的代码语料库包含来自 GitHub 和 CommonCrawl 的 1,170B 个代码相关 token。</p>
<p>为了验证新代码语料库的有效性，我们用 1B 参数模型进行了消融实验，将其与 DeepSeek-Coder 训练所用的语料库进行比较。使用 1T token 在新代码语料库上预训练 1B 模型，HumanEval 准确率提升了 5.5%(从 30.5% 到 36.0%)、MBPP 准确率提升了 4.4%(从 44.6% 到 49.0%)。将 1B 模型进一步训练到 2T token 后，HumanEval 和 MBPP 得分分别提升至 37.2% 和 54.0%。因此，新的代码语料库优于 DeepSeek-Coder 训练所用的代码语料库。</p>
<blockquote>
<p>这里的设计动机值得注意。新语料库的改进并非来自简单的数据量膨胀，而是来自覆盖范围的质变——从 86 种编程语言扩展到 338 种，从单一 GitHub 来源扩展到 GitHub + CommonCrawl 的双源采集。1B 小模型的消融实验是一个聪明的验证策略:如果 1B 模型都能从新语料库中获益，那么 236B 大模型的增益几乎是确定性的。这也说明数据质量提升存在「规模互补效应」:更好的数据在小模型上已有信号，在大模型上会被进一步放大。</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>Token</th>
<th>Python</th>
<th>C++</th>
<th>Java</th>
<th>PHP</th>
<th>TS</th>
<th>C#</th>
<th>Bash</th>
<th>JS</th>
<th>平均</th>
<th>MBPP</th>
</tr>
</thead>
<tbody><tr>
<td>DeepSeek-Coder-1B</td>
<td>1T</td>
<td>30.5%</td>
<td>28.0%</td>
<td>31.7%</td>
<td>23.0%</td>
<td>30.8%</td>
<td>31.7%</td>
<td>9.5%</td>
<td>28.6%</td>
<td>26.7%</td>
<td>44.6%</td>
</tr>
<tr>
<td>DeepSeek-Coder-V2-1B</td>
<td>1T</td>
<td>36.0%</td>
<td>34.8%</td>
<td>31.7%</td>
<td>27.3%</td>
<td>37.7%</td>
<td>34.2%</td>
<td>6.3%</td>
<td>38.5%</td>
<td>31.2%</td>
<td>49.0%</td>
</tr>
<tr>
<td>DeepSeek-Coder-V2-1B</td>
<td>2T</td>
<td>37.2%</td>
<td>39.1%</td>
<td>32.3%</td>
<td>31.7%</td>
<td>34.6%</td>
<td>36.7%</td>
<td>12.0%</td>
<td>32.9%</td>
<td>32.0%</td>
<td>54.0%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 1B 基座模型在 DeepSeek-Coder 与 DeepSeek-Coder-V2 语料库上的性能对比。</p>
</blockquote>
<hr>
<h2 id="3-xlcl">3. 训练策略</h2>
<h3 id="3-1-xlmb">3.1 训练目标</h3>
<p>我们对 DeepSeek-Coder-V2 16B 使用两种训练目标:Next-Token-Prediction(下一 token 预测)和 Fill-In-Middle(FIM，中间填充);对 DeepSeek-Coder-V2 236B，仅使用 Next-Token-Prediction 目标。</p>
<p>这里我们对 FIM 训练策略做简要介绍。我们在 DeepSeek-Coder-V2-16B 的开发中采用 FIM 训练方法，利用 PSM(Prefix, Suffix, Middle，前缀-后缀-中间)模式。该方法按以下顺序重构序列内容:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext mathvariant="monospace">&lt;|fim_begin|&gt;</mtext><msub><mi>f</mi><mrow><mi>p</mi><mi>r</mi><mi>e</mi></mrow></msub><mtext mathvariant="monospace">&lt;|fim_hole|&gt;</mtext><msub><mi>f</mi><mrow><mi>s</mi><mi>u</mi><mi>f</mi></mrow></msub><mtext mathvariant="monospace">&lt;|fim_end|&gt;</mtext><msub><mi>f</mi><mrow><mi>m</mi><mi>i</mi><mi>d</mi><mi>d</mi><mi>l</mi><mi>e</mi></mrow></msub><mtext mathvariant="monospace">&lt;|eos_token|&gt;</mtext></mrow><annotation encoding="application/x-tex">\\texttt{&lt;|fim\\_begin|&gt;} f_{pre} \\texttt{&lt;|fim\\_hole|&gt;} f_{suf} \\texttt{&lt;|fim\\_end|&gt;} f_{middle} \\texttt{&lt;|eos\\_token|&gt;}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord texttt">&lt;|fim_begin|&gt;</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord texttt">&lt;|fim_hole|&gt;</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord texttt">&lt;|fim_end|&gt;</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">mi</span><span class="mord mathnormal mtight">dd</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord text"><span class="mord texttt">&lt;|eos_token|&gt;</span></span></span></span></span></span><p>该结构在预打包阶段应用于文档级别。FIM 以 0.5 的比率使用，与 PSM 框架一致，以增强训练效果和模型性能。</p>
<blockquote>
<p>谱系与影响节点: FIM 训练最早由 Bavarian 等人(2022)在「Efficient Training of Language Models to Fill in the Middle」中系统提出，后被 StarCoder、CodeLlama 等模型广泛采用。其核心洞察是:代码补全任务天然具有「双向上下文」(光标前后的代码都可见)，而标准自回归只能利用单向上下文。PSM 模式通过特殊分隔符将前缀和后缀拼接在目标之前，让模型学会利用双向信息预测中间内容。DeepSeek-Coder-V2 仅在 16B Lite 版本中使用 FIM，236B 版本不使用——这与模型的产品定位有关:Lite 版本面向 IDE 插件(需要实时补全)，236B 版本面向对话式编程(不需要 FIM)。</p>
</blockquote>
<h3 id="3-2-mxjg">3.2 模型架构</h3>
<p>我们的架构与 DeepSeek-V2 保持一致。16B 和 236B 的超参数设置分别对应 DeepSeek-V2-Lite 和 DeepSeek-V2 的配置。值得注意的是，我们在训练中遇到了不稳定性和梯度值尖峰问题，将其归因于指数归一化技术。为解决这一问题，我们改回了传统的归一化方法。</p>
<blockquote>
<p>架构细节节点: 这是一条极其重要的工程经验。DeepSeek-V2 使用了「指数归一化」技术(即对路由 logits 做指数变换后再 softmax)，目的是增强专家路由的区分度，让 top-k 选择更「尖锐」。但在代码数据上继续预训练时，代码 token 的分布特性(大量重复结构、长序列依赖)导致了梯度尖峰——这说明数据分布的变化会直接影响训练稳定技巧的有效性。改回传统归一化是一个务实的工程决策，它证明了「没有放之四海而皆准的训练 trick，任何技巧都需要在新数据域上重新验证」。</p>
</blockquote>
<h3 id="3-3-xlccs">3.3 训练超参数</h3>
<p>与 DeepSeek-V2 的方法一致，我们使用 AdamW 优化器，配置为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1 = 0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2 = 0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>，权重衰减为 0.1。批量大小和学习率按照 DeepSeek-V2 的规格进行调整。对于学习率调度，我们采用余弦衰减策略，以 2000 步 warmup 开始，并逐渐将学习率降低到初始值的 10%。</p>
<p>DeepSeek-Coder-V2 和 DeepSeek-Coder-V2-Lite 均使用相同的方法训练。为了在 DeepSeek-Coder-V2 中保持稳健的自然语言理解能力，我们从 DeepSeek-V2 的中间Checkpoint继续预训练过程。该中间Checkpoint最初在 4.2T token 上训练。因此，DeepSeek-Coder-V2 在预训练阶段共接触了 10.2T 高质量 token。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>DeepSeek-Coder-V2-Lite</th>
<th>DeepSeek-Coder-V2</th>
</tr>
</thead>
<tbody><tr>
<td>总参数(#TP)</td>
<td>16B</td>
<td>236B</td>
</tr>
<tr>
<td>激活参数(#AP)</td>
<td>2.4B</td>
<td>21B</td>
</tr>
<tr>
<td>预训练 Token</td>
<td>4.2T + 6T</td>
<td>4.2T + 6T</td>
</tr>
<tr>
<td>学习率调度</td>
<td>Cosine</td>
<td>Cosine</td>
</tr>
<tr>
<td>FIM</td>
<td>启用</td>
<td>禁用</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: DeepSeek-Coder-V2 的训练设置。</p>
</blockquote>
<h3 id="3-4-csxwkz">3.4 长上下文扩展</h3>
<p>遵循 DeepSeek-V2 的做法，我们使用 YARN(Yet Another RoPE Extension Method)将 DeepSeek-Coder-V2 的上下文长度扩展到 128K。YARN 的超参数与 DeepSeek-V2 相同:scale <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>s</mi><mo>=</mo><mn>40</mn></mrow><annotation encoding="application/x-tex">s = 40</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">s</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">40</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">\\alpha = 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi><mo>=</mo><mn>32</mn></mrow><annotation encoding="application/x-tex">\\beta = 32</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">32</span></span></span></span>。</p>
<p>我们进一步通过两个阶段继续训练模型以增强其长上下文处理能力。在第一阶段，我们使用 32K 的序列长度和 1152 的批量大小训练 1000 步。在第二阶段，我们使用 128K 的序列长度和 288 的批量大小额外训练 1000 步。需要注意的是，在长上下文扩展期间我们上采样了长上下文数据的比例。如图 1 所示，「大海捞针」(Needle In A Haystack, NIAH)测试结果表明，DeepSeek-Coder-V2 在所有长度不超过 128K 的上下文窗口中均表现良好。</p>
<blockquote>
<p>图 1: NIAH 测试结果。DeepSeek-Coder-V2 在最长 128K 的所有上下文长度中均表现良好。(见 <code>images/longcontext.pdf</code>)</p>
</blockquote>
<blockquote>
<p>设计动机节点: 代码场景对长上下文的需求比自然语言更迫切。一个中等规模的代码库(如 React 源码)轻松超过 100K token，而跨文件引用、类型推断、重构建议等任务都需要模型「记住」远距离的代码结构。YARN 的核心思想是通过调整 RoPE 的频率缩放因子来外推位置编码，使其在训练时未见过的更长序列上仍保持有效的相对位置关系。DeepSeek-Coder-V2 的两阶段扩展策略(32K → 128K)是渐进式适应的经典做法，每阶段仅 1000 步的轻量微调说明 YARN 已经将大部分工作「前置」到了位置编码层面，后续的继续训练主要是让模型适应新的注意力分布。</p>
</blockquote>
<h3 id="3-5-dq">3.5 对齐</h3>
<h4 id="3-5-1-jdwt-sft">3.5.1 监督微调(SFT)</h4>
<p>为了构建 DeepSeek-Coder-V2 Chat，我们构建了一个混合了代码和数学数据的指令训练数据集。我们首先从 DeepSeek-Coder 和 DeepSeek-Math 收集了 20k 条代码相关指令数据和 30k 条数学相关数据。为了保持通用能力，我们还从 DeepSeek-V2 的指令数据中采样了若干数据。最终，我们使用了 300M token 的指令数据集。训练方面，我们使用余弦调度，100 步 warmup，初始学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>。我们还使用了 1M token 的批量大小，总共 1B token。</p>
<blockquote>
<p>译者注: 300M token 的 SFT 数据量在大模型对齐中属于「轻量微调」级别。作为对比，Llama-3 70B 的 SFT 数据量据称为 1000 万条高质量样本，DeepSeek-V3 的 SFT 也使用了更多数据。这里的数据量控制反映了团队的一个假设:代码和数学任务的对齐不需要海量通用对话数据，而是需要高质量、领域聚焦的指令-响应对。20k 代码 + 30k 数学的样本数虽然不多，但每个样本可能很长(包含完整的问题描述、代码、测试用例)。</p>
</blockquote>
<h4 id="3-5-2-qhxx-rl">3.5.2 强化学习(RL)</h4>
<p>我们进一步采用强化学习(RL)技术来充分激发 DeepSeek-Coder-V2 的能力，这已被证明非常有效。</p>
<p><strong>Prompt 收集</strong> 我们投入了大量精力从各种来源收集与代码和数学相关的 prompt，每个代码 prompt 都配有相应的测试用例。过滤后，总共约有 40k 条数据。</p>
<p><strong>奖励建模</strong> 奖励模型在 RL 训练中扮演关键角色。对于数学偏好数据，我们通过 ground-truth 标签获得。对于代码偏好数据，尽管代码编译器本身已经可以提供 0-1 反馈(代码是否通过所有测试用例)，但某些代码 prompt 的测试用例数量有限、覆盖不完整，因此直接使用编译器的 0-1 反馈可能带有噪声且次优。</p>
<p>因此，我们仍然决定在编译器提供的数据上训练一个奖励模型，并在 RL 训练中使用奖励模型提供信号——相比原始编译器信号，它更加鲁棒且具有更好的泛化能力。如图 2 所示，在我们的内部测试集(LeetCode 和 LeetCode-zh)上，使用奖励模型提供 RL 训练信号明显优于使用原始编译器信号。因此，我们在所有后续实验中使用奖励模型信号而非编译器信号。</p>
<blockquote>
<p>图 2: 不同方法在内部测试集上的性能对比。(见 <code>images/rl.pdf</code>)</p>
</blockquote>
<blockquote>
<p>局限与风险节点: 奖励模型的引入是一把双刃剑。它的优势在于可以处理测试用例覆盖不完整的场景，通过 learned preference 提供「软」信号;但它的风险在于奖励模型本身可能引入新的偏差——如果奖励模型在分布外(OOD)的代码风格或语言特性上表现不佳，它会在 RL 训练中放大这种偏差。论文中提到的「在内部测试集上优于编译器信号」是一个有说服力的证据，但需要注意内部测试集可能无法完全代表真实世界代码的多样性。这是一个「论文宣称」与「实际泛化」之间的典型张力。</p>
</blockquote>
<p><strong>强化学习算法</strong> 我们采用 Group Relative Policy Optimization(GRPO)作为 RL 算法，与 DeepSeek-V2 使用的相同。值得注意的是，GRPO 已被证明非常有效，且相比 PPO 成本更低，因为不需要维护额外的 Critic 模型。</p>
<blockquote>
<p>谱系与影响节点: GRPO 首次在 DeepSeekMath 技术报告中提出，随后被 DeepSeek-V2、DeepSeek-Coder-V2、DeepSeek-V3 和 DeepSeek-R1 沿用了整个家族。其核心思想是用「组内相对优势」替代 PPO 中需要单独训练的 Critic 模型:对每个问题采样一组输出，用组内奖励的均值和标准差来计算优势值。这不仅减少了显存占用(无需 Critic)，还避免了 Critic 模型与策略模型之间的「协同训练」难题。GRPO 的成功使得它已经成为 DeepSeek 家族后训练阶段的事实标准算法，也是后续许多开源项目复现 DeepSeek 训练流程时的首选 RL 方法。</p>
</blockquote>
<hr>
<h2 id="4-syjg">4. 实验结果</h2>
<p>在本节中，我们在编码、数学和通用自然语言三类任务上评估 DeepSeek-Coder-V2。我们将 DeepSeek-Coder-V2 与先前最先进的大语言模型进行比较:</p>
<ul>
<li><strong>CodeLlama</strong> 是一系列基于 Llama2 的代码语言模型，在 500B 到 1000B 代码 token 的数据集上继续预训练。这些模型有 7B、13B、34B 和 70B 四个尺寸。</li>
<li><strong>StarCoder</strong> 是一个 150 亿参数的公开可访问模型，专门在 Stack 数据集的一个精心筛选子集上训练，覆盖 86 种编程语言。</li>
<li><strong>StarCoder2</strong> 包含 3B、7B 和 15B 参数的模型，在 3.3T 到 4.3T token 的 Stack2 数据集上训练，覆盖 619 种编程语言。</li>
<li><strong>DeepSeek-Coder</strong> 是一系列从 1B 到 33B 参数的代码语言模型，每个模型在 2T token 上从零训练，其中 87% 为代码、13% 为中英文自然语言。这些模型在项目级代码语料库上以 16K 窗口预训练，并额外使用填空任务，支持项目级代码补全和填充。</li>
<li><strong>Codestral</strong> 是 Mistral 开发的 22B 参数模型，在超过 80 种编程语言的多样化数据集上训练，包括 Python、Java、JavaScript 等主流语言以及 Swift、Fortran 等更专业的语言。</li>
<li>我们比较的通用语言模型包括 <strong>Llama3 70B</strong>、<strong>GPT-4</strong>、<strong>Claude 3 Opus</strong> 和 <strong>Gemini 1.5 Pro</strong>。虽然它们没有专门在大型代码语料库上训练，但在编码任务上达到了 state-of-the-art 性能。</li>
</ul>
<h3 id="4-1-dmsc">4.1 代码生成</h3>
<p><strong>HumanEval 和 MBPP 基准</strong> HumanEval 和 MBPP 基准通常用于评估代码生成大语言模型的性能。HumanEval 包含 164 个通过测试用例验证的 Python 任务，评估 Code LLM 在零样本场景下的表现。对于 MBPP，我们使用 MBPP-Plus 版本来评估模型。为了测试模型的多语言能力，我们将 HumanEval 基准问题扩展为 7 种额外语言:C++、Java、PHP、TypeScript、C#、Bash、JavaScript，以及 Swift、R、Julia、D、Rust 和 Racket。对于两个基准，我们采用贪心搜索策略，并使用相同的脚本和环境复现基线结果以确保公平比较。</p>
<p>表 3 提供了各模型在 HumanEval 和 MBPP+ 基准上跨多种编程语言的性能指标概览。DeepSeek-Coder-V2-Instruct 表现出色，以 75.3% 的平均得分位居第二。这一表现打破了闭源模型通常的主导地位，成为领先的开源竞争者。它仅被 GPT-4o 超越，后者以 76.4% 的平均得分领先。DeepSeek-Coder-V2-Instruct 在多种语言上取得了顶级结果，包括 Java 和 PHP 的最高分，以及在 Python、C++、C#、TypeScript 和 JavaScript 上的强劲表现，展示了其处理多样化编码挑战的鲁棒性和通用性。</p>
<p>此外，DeepSeek-Coder-V2-Lite-Instruct 也表现令人印象深刻，超越了更大的 33B 模型。平均性能差距显著(65.6% 对 61.9%)，凸显了 16B 模型在较小尺寸下提供竞争性结果的有效性。这证明了模型的效率以及模型架构和训练方法的进步使其能够超越更大规模的同类模型。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>Python</th>
<th>Java</th>
<th>C++</th>
<th>C#</th>
<th>TS</th>
<th>JS</th>
<th>PHP</th>
<th>Bash</th>
</tr>
</thead>
<tbody><tr>
<td><strong>闭源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Gemini-1.5-Pro</td>
<td>-</td>
<td>-</td>
<td>83.5%</td>
<td>81.0%</td>
<td>78.3%</td>
<td>75.3%</td>
<td>77.4%</td>
<td>80.8%</td>
<td>74.5%</td>
<td>39.9%</td>
</tr>
<tr>
<td>Claude-3-Opus</td>
<td>-</td>
<td>-</td>
<td>84.2%</td>
<td>78.5%</td>
<td>81.4%</td>
<td>74.7%</td>
<td>76.1%</td>
<td>75.8%</td>
<td>78.3%</td>
<td>48.7%</td>
</tr>
<tr>
<td>GPT-4-1106</td>
<td>-</td>
<td>-</td>
<td>87.8%</td>
<td>82.3%</td>
<td>78.9%</td>
<td>80.4%</td>
<td>81.8%</td>
<td>80.1%</td>
<td>77.6%</td>
<td>55.7%</td>
</tr>
<tr>
<td>GPT-4-Turbo-0409</td>
<td>-</td>
<td>-</td>
<td>88.2%</td>
<td>81.7%</td>
<td>78.3%</td>
<td>79.1%</td>
<td>79.3%</td>
<td>80.8%</td>
<td>78.9%</td>
<td>55.1%</td>
</tr>
<tr>
<td>GPT-4o-0513</td>
<td>-</td>
<td>-</td>
<td>91.0%</td>
<td>80.4%</td>
<td>87.0%</td>
<td>82.9%</td>
<td>86.2%</td>
<td>87.6%</td>
<td>79.5%</td>
<td>53.8%</td>
</tr>
<tr>
<td><strong>开源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>78.1%</td>
<td>71.5%</td>
<td>71.4%</td>
<td>77.2%</td>
<td>72.3%</td>
<td>73.9%</td>
<td>69.6%</td>
<td>47.5%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>33B</td>
<td>79.3%</td>
<td>73.4%</td>
<td>68.9%</td>
<td>74.1%</td>
<td>67.9%</td>
<td>73.9%</td>
<td>72.7%</td>
<td>43.0%</td>
</tr>
<tr>
<td>Llama3-Instruct</td>
<td>70B</td>
<td>70B</td>
<td>81.1%</td>
<td>67.7%</td>
<td>64.0%</td>
<td>69.6%</td>
<td>69.8%</td>
<td>70.2%</td>
<td>65.8%</td>
<td>36.1%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>81.1%</td>
<td>76.6%</td>
<td>75.8%</td>
<td>76.6%</td>
<td>80.5%</td>
<td>77.6%</td>
<td>74.5%</td>
<td>43.0%</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>90.2%</td>
<td>82.3%</td>
<td>84.8%</td>
<td>82.3%</td>
<td>83.0%</td>
<td>84.5%</td>
<td>79.5%</td>
<td>52.5%</td>
</tr>
<tr>
<td>模型</td>
<td>#TP</td>
<td>#AP</td>
<td>Swift</td>
<td>R</td>
<td>Julia</td>
<td>D</td>
<td>Rust</td>
<td>Racket</td>
<td>MBPP+</td>
<td>平均</td>
</tr>
<tr>
<td>------</td>
<td>-----</td>
<td>-----</td>
<td>-------</td>
<td>---</td>
<td>-------</td>
<td>---</td>
<td>------</td>
<td>--------</td>
<td>-------</td>
<td>------</td>
</tr>
<tr>
<td><strong>闭源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Gemini-1.5-Pro</td>
<td>-</td>
<td>-</td>
<td>66.5%</td>
<td>53.4%</td>
<td>71.7%</td>
<td>55.8%</td>
<td>73.1%</td>
<td>48.4%</td>
<td>74.6%</td>
<td>68.9%</td>
</tr>
<tr>
<td>Claude-3-Opus</td>
<td>-</td>
<td>-</td>
<td>63.9%</td>
<td>55.9%</td>
<td>76.1%</td>
<td>60.3%</td>
<td>71.2%</td>
<td>64.6%</td>
<td>72.0%</td>
<td>70.8%</td>
</tr>
<tr>
<td>GPT-4-1106</td>
<td>-</td>
<td>-</td>
<td>62.7%</td>
<td>57.8%</td>
<td>69.2%</td>
<td>60.9%</td>
<td>78.8%</td>
<td>64.0%</td>
<td>69.3%</td>
<td>72.5%</td>
</tr>
<tr>
<td>GPT-4-Turbo-0409</td>
<td>-</td>
<td>-</td>
<td>63.9%</td>
<td>56.5%</td>
<td>69.8%</td>
<td>61.5%</td>
<td>78.8%</td>
<td>63.4%</td>
<td>72.2%</td>
<td>72.3%</td>
</tr>
<tr>
<td>GPT-4o-0513</td>
<td>-</td>
<td>-</td>
<td>75.9%</td>
<td>65.2%</td>
<td>78.0%</td>
<td>60.9%</td>
<td>80.1%</td>
<td>64.6%</td>
<td>73.5%</td>
<td>76.4%</td>
</tr>
<tr>
<td><strong>开源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>63.3%</td>
<td>49.7%</td>
<td>67.9%</td>
<td>32.1%</td>
<td>67.3%</td>
<td>37.3%</td>
<td>68.2%</td>
<td>63.2%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>33B</td>
<td>61.4%</td>
<td>44.7%</td>
<td>53.5%</td>
<td>31.4%</td>
<td>68.6%</td>
<td>46.0%</td>
<td>70.1%</td>
<td>61.9%</td>
</tr>
<tr>
<td>Llama3-Instruct</td>
<td>70B</td>
<td>70B</td>
<td>55.1%</td>
<td>46.0%</td>
<td>62.9%</td>
<td>48.1%</td>
<td>58.3%</td>
<td>46.0%</td>
<td>68.8%</td>
<td>60.6%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>64.6%</td>
<td>47.8%</td>
<td>67.3%</td>
<td>45.5%</td>
<td>62.2%</td>
<td>41.6%</td>
<td>68.8%</td>
<td>65.6%</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>72.2%</td>
<td>64.0%</td>
<td>72.3%</td>
<td>64.1%</td>
<td>78.2%</td>
<td>63.4%</td>
<td>76.2%</td>
<td>75.3%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 各模型在 HumanEval 和 MBPP+ 基准上的性能。</p>
</blockquote>
<blockquote>
<p>数据与实验节点: 几个值得注意的数字。第一，DeepSeek-Coder-V2-Instruct 在 236B/21B 的配置下，平均 75.3% 接近 GPT-4o 的 76.4%，而激活参数只有 GPT-4o 的估计激活参数(约 200B+)的十分之一。这再次验证了 MoE 架构在代码任务上的效率优势。第二，Lite 版本(16B/2.4B)的平均分 65.6% 已经超过了 DeepSeek-Coder-33B 的 61.9%，说明架构改进(MLA + MoE)和数据质量提升的增益超过了纯参数规模的增益。</p>
</blockquote>
<p><strong>竞技编程</strong> 为了进一步验证模型在真实世界竞技编程问题上的能力，我们使用 LiveCodeBench 和 USACO 基准来评估 DeepSeek-Coder-V2。LiveCodeBench 是一个对代码生成大语言模型进行细致且无数据污染评估的基准，系统地从 LeetCode、AtCoder 和 CodeForces 三个主要竞技编程平台收集新题目。由于训练数据的截止日期为 2023 年 11 月之前，我们使用 LiveCodeBench 的 2023 年 12 月至 2024 年 6 月子集。USACO 基准包含来自美国信息学奥林匹克的 307 道问题，每道题配有高质量的单元测试、参考代码和官方分析。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>Easy(82)</th>
<th>Medium(87)</th>
<th>Hard(57)</th>
<th>Overall(226)</th>
<th>USACO</th>
</tr>
</thead>
<tbody><tr>
<td><strong>闭源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Gemini-1.5-Pro</td>
<td>-</td>
<td>-</td>
<td>74.9%</td>
<td>16.8%</td>
<td>1.8%</td>
<td>34.1%</td>
<td>4.9%</td>
</tr>
<tr>
<td>Claude-3-Opus</td>
<td>-</td>
<td>-</td>
<td>77.2%</td>
<td>16.7%</td>
<td>0.7%</td>
<td>34.6%</td>
<td>7.8%</td>
</tr>
<tr>
<td>GPT-4-1106</td>
<td>-</td>
<td>-</td>
<td>78.4%</td>
<td>20.2%</td>
<td>3.5%</td>
<td>37.1%</td>
<td>11.1%</td>
</tr>
<tr>
<td>GPT-4-Turbo-0409</td>
<td>-</td>
<td>-</td>
<td>84.1%</td>
<td>35.4%</td>
<td>6.1%</td>
<td>45.7%</td>
<td>12.3%</td>
</tr>
<tr>
<td>GPT-4o-0513</td>
<td>-</td>
<td>-</td>
<td>87.4%</td>
<td>27.5%</td>
<td>4.9%</td>
<td>43.4%</td>
<td>18.8%</td>
</tr>
<tr>
<td><strong>开源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>66.5%</td>
<td>17.7%</td>
<td>0.2%</td>
<td>31.0%</td>
<td>4.6%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>33B</td>
<td>51.6%</td>
<td>9.7%</td>
<td>0.4%</td>
<td>22.5%</td>
<td>4.2%</td>
</tr>
<tr>
<td>Llama3-Instruct</td>
<td>70B</td>
<td>70B</td>
<td>62.4%</td>
<td>14.4%</td>
<td>2.1%</td>
<td>28.7%</td>
<td>3.3%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>58.5%</td>
<td>8.0%</td>
<td>0.0%</td>
<td>24.3%</td>
<td>6.5%</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>84.1%</td>
<td>29.9%</td>
<td>5.3%</td>
<td>43.4%</td>
<td>12.1%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: 各模型在 LiveCodeBench(LCB)和 USACO 基准上的性能。</p>
</blockquote>
<p>表 4 展示了各语言模型在两个基准上的表现。值得注意的是，DeepSeek-Coder-V2-Instruct 以 43.4% 的分数与 GPT-4o 并列大型模型中的最高分。这一卓越结果使其总体排名第二，仅次于以 45.7% 总体性能领先的 GPT-4-Turbo-0409。DeepSeek-Coder-V2-Instruct 处理复杂编码挑战的出色能力确立了其顶级竞争者的地位，紧紧追随领先的 GPT-4-Turbo 变体。</p>
<blockquote>
<p>译者注: LiveCodeBench 的 Hard 子集(57 题)是所有模型表现最差的部分。即使是最强的 GPT-4-Turbo-0409，Hard 准确率也只有 6.1%。这说明竞技编程的 Hard 级别问题对当前所有 LLM 来说仍然是「不可解」的——它们需要创造性的算法设计、复杂的数据结构组合，以及通常需要数小时的深思熟虑，这些能力超出了当前自回归语言模型的范畴。</p>
</blockquote>
<h3 id="4-2-dmbq">4.2 代码补全</h3>
<h4 id="4-2-1-ckjdmbqpg">4.2.1 仓库级代码补全评估</h4>
<p>我们使用 RepoBench 来评估当前可用的、规模在 35B 以下的开源代码模型在仓库级代码补全任务上的能力。该数据集从两种流行编程语言(Python 和 Java)的各种真实世界、开源、宽松许可的仓库构建。值得注意的是，RepoBench 最新版本(v1.1)的数据来自 2023 年 10 月 6 日至 12 月 31 日创建的 GitHub 仓库，而我们的预训练数据包含 2023 年 11 月之前创建的代码。为确保该数据集不在我们的预训练数据中、避免数据泄漏，我们只使用 2023 年 12 月的数据。</p>
<p>我们的评估包含 2k、4k、8k、12k 和 16k token 五个上下文长度级别，涵盖三种设置:cross-file-first、cross-file-random 和 in-file。我们对所有被评估模型使用贪心搜索。模型被限制每个 prompt 最多生成 64 个新 token，输出的第一行非空非注释行被选为预测结果。prompt 的最大 token 长度设为 15800，通过截断多余的跨文件上下文。我们报告不同上下文长度级别的平均精确匹配率。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>Python 2k</th>
<th>Python 4k</th>
<th>Python 8k</th>
<th>Python 12k</th>
<th>Python 16k</th>
<th>Python 平均</th>
<th>Java 2k</th>
<th>Java 4k</th>
<th>Java 8k</th>
<th>Java 12k</th>
<th>Java 16k</th>
<th>Java 平均</th>
</tr>
</thead>
<tbody><tr>
<td>StarCoder2-Base</td>
<td>15B</td>
<td>15B</td>
<td>35.7%</td>
<td>36.7%</td>
<td>34.6%</td>
<td>27.4%</td>
<td>25.1%</td>
<td>32.1%</td>
<td>46.2%</td>
<td>45.0%</td>
<td>39.8%</td>
<td>30.5%</td>
<td>30.7%</td>
<td>38.7%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>7B</td>
<td>7B</td>
<td>32.0%</td>
<td>34.4%</td>
<td>35.3%</td>
<td>33.3%</td>
<td>32.2%</td>
<td>33.5%</td>
<td>43.1%</td>
<td>42.1%</td>
<td>40.4%</td>
<td>37.0%</td>
<td>40.3%</td>
<td>40.6%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>13B</td>
<td>13B</td>
<td>33.0%</td>
<td>36.5%</td>
<td>37.0%</td>
<td>34.6%</td>
<td>35.0%</td>
<td>35.2%</td>
<td>43.5%</td>
<td>44.8%</td>
<td>40.7%</td>
<td>38.6%</td>
<td>41.1%</td>
<td>41.8%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>34B</td>
<td>34B</td>
<td>35.3%</td>
<td>37.5%</td>
<td>39.5%</td>
<td>34.9%</td>
<td>35.6%</td>
<td>36.6%</td>
<td>45.9%</td>
<td>45.4%</td>
<td>42.5%</td>
<td>41.0%</td>
<td>41.2%</td>
<td>43.3%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>6.7B</td>
<td>6.7B</td>
<td>36.1%</td>
<td>37.5%</td>
<td>38.2%</td>
<td>34.0%</td>
<td>35.0%</td>
<td>36.2%</td>
<td>46.8%</td>
<td>46.4%</td>
<td>42.9%</td>
<td>38.8%</td>
<td>40.8%</td>
<td>43.3%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>33B</td>
<td>33B</td>
<td>39.7%</td>
<td>40.1%</td>
<td>40.0%</td>
<td>36.9%</td>
<td>38.5%</td>
<td>39.1%</td>
<td>47.9%</td>
<td>47.7%</td>
<td>43.3%</td>
<td>40.9%</td>
<td>43.6%</td>
<td>44.8%</td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>42.1%</td>
<td>44.3%</td>
<td>46.6%</td>
<td>46.6%</td>
<td>51.5%</td>
<td>46.1%</td>
<td>48.3%</td>
<td>47.8%</td>
<td>46.0%</td>
<td>42.2%</td>
<td>43.9%</td>
<td>45.7%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Base</td>
<td>16B</td>
<td>2.4B</td>
<td>38.3%</td>
<td>38.6%</td>
<td>40.6%</td>
<td>38.3%</td>
<td>38.7%</td>
<td>38.9%</td>
<td>48.8%</td>
<td>45.7%</td>
<td>42.4%</td>
<td>38.1%</td>
<td>41.1%</td>
<td>43.3%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: 各模型在 RepoBench v1.1 12 月子集上的性能。</p>
</blockquote>
<p>如表 5 所示，结果表明 DeepSeek-Coder-V2-Lite-Base 模型尽管只有 24 亿激活参数，但在 Python 代码补全能力上与 DeepSeek-Coder-Base 33B 模型相当，在 Java 上与 DeepSeek-Coder-Base 7B 模型相当。与 Codestral 相比，DeepSeek-Coder-V2-Lite-Base 的激活参数只有 Codestral 的十分之一，在代码补全任务上性能较低。然而，我们认为 DeepSeek-Coder-V2 较少的激活参数使其在代码补全场景中速度更快。</p>
<h4 id="4-2-2-fill-in-the-middle-dmbq">4.2.2 Fill-in-the-Middle 代码补全</h4>
<p>DeepSeek-Coder-V2-Lite 在预训练阶段采用了包含 0.5 FIM 比率的独特训练方法。这种方法使模型能够熟练地利用周围上下文(包括前后代码段)来填充空白完成代码。这一能力对代码补全工具尤为有利。SantaCoder、StarCoder 和 CodeLlama 等多个开源模型也利用了类似能力，并在代码生成和补全领域树立了高标准。</p>
<p>为了评估 DeepSeek-Coder-V2 模型的性能，我们与领先模型进行了对比分析。评估基于 Single-Line Infilling 基准，涵盖 SantaCoder 描述的三门不同编程语言。该评估的主要指标是行精确匹配准确率。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>Python</th>
<th>Java</th>
<th>JavaScript</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>StarCoder</td>
<td>16B</td>
<td>16B</td>
<td>71.5%</td>
<td>82.3%</td>
<td>83.0%</td>
<td>80.2%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>7B</td>
<td>7B</td>
<td>58.6%</td>
<td>70.6%</td>
<td>70.7%</td>
<td>68.0%</td>
</tr>
<tr>
<td>CodeLlama-Base</td>
<td>13B</td>
<td>13B</td>
<td>60.7%</td>
<td>74.3%</td>
<td>78.5%</td>
<td>73.1%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>1B</td>
<td>1B</td>
<td>74.1%</td>
<td>85.1%</td>
<td>82.9%</td>
<td>81.8%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>7B</td>
<td>7B</td>
<td>79.8%</td>
<td>89.6%</td>
<td>86.3%</td>
<td>86.1%</td>
</tr>
<tr>
<td>DS-Coder-Base</td>
<td>33B</td>
<td>33B</td>
<td>80.5%</td>
<td>88.4%</td>
<td>86.6%</td>
<td>86.4%</td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>77.2%</td>
<td>83.2%</td>
<td>85.9%</td>
<td>83.0%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Base</td>
<td>16B</td>
<td>2.4B</td>
<td>80.0%</td>
<td>89.1%</td>
<td>87.2%</td>
<td>86.4%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: 各模型在 FIM 任务上的性能。(StarCoder-2 在 FIM 上有问题，故仍使用 StarCoder。)</p>
</blockquote>
<p>表中展示了各编码模型在 FIM 任务上三门编程语言的性能。在所比较的模型中，DeepSeek-Coder-V2-Lite-Base 以 2.4B 激活参数的配置取得了出色结果:Python 80.0%、Java 89.1%、JavaScript 87.2%，平均得分 86.4% 位居榜首。这证明了 DeepSeek-Coder-V2-Lite-Base 在处理跨编程语言 FIM 任务上的卓越有效性，达到了与评估中其他更大模型相当的性能。</p>
<h3 id="4-3-dmxf">4.3 代码修复</h3>
<p>为了评估模型的 bug 修复能力，我们使用 Defects4J、SWE-bench 和 Aider 数据集进行测试。Defects4J 是软件工程领域广泛使用的数据集，专门用于评估和测试程序修复技术。它包含来自各种开源项目(包括但不限于 Apache Commons、JFreeChart 和 Closure Compiler)的真实软件 bug 集合。数据集中的每个 bug 都配有可用于验证程序修复工具有效性的测试套件。由于 Defects4J 中的原始 bug 可能需要修改仓库中的多个文件导致长上下文，我们从该基准中收集了 238 个仅需修改一个方法的 bug。</p>
<p>SWE-bench 是一个全面的基准，旨在评估大语言模型解决来自 GitHub 的真实软件问题的性能。该基准呈现一个代码库和一个特定问题，挑战语言模型生成一个有效解决问题的补丁。这一严格的评估框架确保了对语言模型理解和修复真实软件问题能力的全面测试，为其在实际软件开发任务中的实用性和有效性提供了清晰的衡量标准。</p>
<p>Aider 的代码编辑基准评估 LLM 修改 Python 源文件的能力，完成 133 个不同的编码任务。该基准不仅测试 LLM 的编码技能，还检查其按照 prompt 规范生成代码编辑的一致性。对于 DeepSeek-Coder-V2 模型，我们使用 whole 格式进行评估。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>Defects4J</th>
<th>SWE-Bench</th>
<th>Aider</th>
</tr>
</thead>
<tbody><tr>
<td><strong>闭源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Gemini-1.5-Pro</td>
<td>-</td>
<td>-</td>
<td>18.6%</td>
<td>19.3%</td>
<td>57.1%</td>
</tr>
<tr>
<td>Claude-3-Opus</td>
<td>-</td>
<td>-</td>
<td>25.5%</td>
<td>11.7%</td>
<td>68.4%</td>
</tr>
<tr>
<td>GPT-4-1106</td>
<td>-</td>
<td>-</td>
<td>22.8%</td>
<td>22.7%</td>
<td>65.4%</td>
</tr>
<tr>
<td>GPT-4-Turbo-0409</td>
<td>-</td>
<td>-</td>
<td>24.3%</td>
<td>18.3%</td>
<td>63.9%</td>
</tr>
<tr>
<td>GPT-4o-0513</td>
<td>-</td>
<td>-</td>
<td>26.1%</td>
<td>26.7%</td>
<td>72.9%</td>
</tr>
<tr>
<td><strong>开源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>17.8%</td>
<td>2.7%</td>
<td>51.1%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>33B</td>
<td>11.3%</td>
<td>0.0%</td>
<td>54.5%</td>
</tr>
<tr>
<td>Llama3-Instruct</td>
<td>70B</td>
<td>70B</td>
<td>16.2%</td>
<td>-</td>
<td>49.2%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>9.2%</td>
<td>0.0%</td>
<td>44.4%</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>21.0%</td>
<td>12.7%</td>
<td>73.7%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: 各模型在代码修复基准上的性能。未在 SWE-Bench 上评估 Llama3-Instruct，因为它只支持 8K 上下文长度。</p>
</blockquote>
<p>表 7 概述了各语言模型在 Defects4J、SWE-Bench 和 Aider 三个软件修复基准上的性能。在开源模型中，DeepSeek-Coder-V2-Instruct 表现突出，在开源模型中取得最佳成绩:Defects4J 21.0%、SWE-Bench 12.7%，接近领先闭源模型的结果，展示了处理更长代码序列的显著能力。值得注意的是，DeepSeek-Coder-V2-Instruct 在 Aider 上取得了 73.7% 的最高分，超越了列表中所有其他模型(包括闭源模型)。这一卓越表现凸显了其在自动化代码修复任务中的效率和鲁棒性，使 DeepSeek-Coder-V2-Instruct 成为顶级开源模型，也是代码修复领域中闭源模型的有力竞争者。</p>
<blockquote>
<p>局限与风险节点: 虽然 DeepSeek-Coder-V2-Instruct 在 Aider 上超越了 GPT-4o，但在 SWE-Bench 上 12.7% 与 GPT-4o 的 26.7% 仍有超过一倍的差距。SWE-Bench 是最接近真实软件工程场景的基准:它需要理解 GitHub issue 描述、在完整仓库中定位问题、生成符合项目编码规范的补丁、并通过回归测试。这个差距的核心原因不是「代码生成能力不足」，而是「指令遵循能力」和「长上下文精确操作能力」的不足——模型可能生成了正确的修复逻辑，但无法将其精确地嵌入到正确的文件位置和格式中。结论部分也明确提到了这一点。</p>
</blockquote>
<h3 id="4-4-dmljytl">4.4 代码理解与推理</h3>
<p>为了评估我们模型的代码推理能力，我们使用 CRUXEval 基准。该基准包含 800 个配有对应输入输出示例的 Python 函数。它分为两个任务:CRUXEval-I，要求大语言模型根据给定输入预测输出;CRUXEval-O，要求模型根据已知输出预测输入。这种结构挑战了模型在正向和反向两个方向上理解和推理 Python 代码的能力。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>CruxEval-I-COT</th>
<th>CruxEval-O-COT</th>
</tr>
</thead>
<tbody><tr>
<td><strong>闭源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Gemini-1.5-Pro</td>
<td>-</td>
<td>-</td>
<td>67.0%</td>
<td>77.5%</td>
</tr>
<tr>
<td>Claude-3-Opus</td>
<td>-</td>
<td>-</td>
<td>73.4%</td>
<td>82.0%</td>
</tr>
<tr>
<td>GPT-4-1106</td>
<td>-</td>
<td>-</td>
<td>75.5%</td>
<td>77.1%</td>
</tr>
<tr>
<td>GPT-4-Turbo-0409</td>
<td>-</td>
<td>-</td>
<td>75.7%</td>
<td>82.0%</td>
</tr>
<tr>
<td>GPT-4o-0513</td>
<td>-</td>
<td>-</td>
<td>77.4%</td>
<td>88.7%</td>
</tr>
<tr>
<td><strong>开源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Codestral</td>
<td>22B</td>
<td>22B</td>
<td>48.0%</td>
<td>60.6%</td>
</tr>
<tr>
<td>DS-Coder-Instruct</td>
<td>33B</td>
<td>33B</td>
<td>47.3%</td>
<td>50.6%</td>
</tr>
<tr>
<td>Llama3-Instruct</td>
<td>70B</td>
<td>70B</td>
<td>61.1%</td>
<td>64.3%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>53.0%</td>
<td>52.9%</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>70.0%</td>
<td>75.1%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: 各模型在 CRUXEval 基准上的性能。</p>
</blockquote>
<p>表 8 展示了各语言模型在 CRUXEval 基准上的性能。在开源模型中，DeepSeek-Coder-V2-Instruct 表现显著突出，CruxEval-I-COT 得分 70.0%、CruxEval-O-COT 得分 75.1%。然而，与更大的闭源模型相比存在性能差距。这一差距可能主要归因于 DeepSeek-Coder-V2-Instruct 只有 210 亿激活参数，与 GPT-4o 等更先进的大型闭源模型相比明显更少。这种模型复杂度的限制可能会制约其学习和问题解决能力。</p>
<h3 id="4-5-sxtl">4.5 数学推理</h3>
<p>为了评估 DeepSeek-Coder-V2 的数学推理能力，我们使用了流行的 GSM8K 基准，以及包括 MATH、AIME 2024 和 Math Odyssey 在内的高级竞赛级基准。DeepSeek-Coder-V2 在四个数学基准上的性能使用零样本链式思维提示获得;每个测试问题拼接的指令为:「请逐步推理，并将最终答案放在 \\boxed{} 中。」</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>#TP</th>
<th>#AP</th>
<th>GSM8K</th>
<th>MATH</th>
<th>AIME 2024</th>
<th>Math Odyssey</th>
</tr>
</thead>
<tbody><tr>
<td><strong>闭源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td>-</td>
<td>-</td>
<td>90.8%</td>
<td>67.7%</td>
<td>2/30</td>
<td>45.0%</td>
</tr>
<tr>
<td>Claude-3-Opus</td>
<td>-</td>
<td>-</td>
<td>95.0%</td>
<td>60.1%</td>
<td>2/30</td>
<td>40.6%</td>
</tr>
<tr>
<td>GPT-4-1106</td>
<td>-</td>
<td>-</td>
<td>91.4%</td>
<td>64.3%</td>
<td>1/30</td>
<td>49.1%</td>
</tr>
<tr>
<td>GPT-4-Turbo-0409</td>
<td>-</td>
<td>-</td>
<td>93.7%</td>
<td>73.4%</td>
<td>3/30</td>
<td>46.8%</td>
</tr>
<tr>
<td>GPT-4o-0513</td>
<td>-</td>
<td>-</td>
<td>95.8%</td>
<td>76.6%</td>
<td>2/30</td>
<td>53.2%</td>
</tr>
<tr>
<td><strong>开源模型</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Llama3-Instruct</td>
<td>70B</td>
<td>70B</td>
<td>93.0%</td>
<td>50.4%</td>
<td>1/30</td>
<td>27.9%</td>
</tr>
<tr>
<td>DS-Coder-V2-Lite-Instruct</td>
<td>16B</td>
<td>2.4B</td>
<td>86.4%</td>
<td>61.8%</td>
<td>0/30</td>
<td>44.4%</td>
</tr>
<tr>
<td>DS-Coder-V2-Instruct</td>
<td>236B</td>
<td>21B</td>
<td>94.9%</td>
<td>75.7%</td>
<td>4/30</td>
<td>53.7%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 9: 各模型在数学推理基准上的性能。DeepSeek-Coder-V2-Instruct 使用 maj@64 在 AIME 2024 上可达 5/30。</p>
</blockquote>
<p>表 9 中的结果使用贪心解码获得，未借助工具或投票技术，除非另有说明。DeepSeek-Coder-V2 在 MATH 基准上取得 75.7% 的准确率，在 Math Odyssey 上取得 53.7%，与 state-of-the-art 的 GPT-4o 相当。此外，DeepSeek-Coder-V2 在 AIME 2024 中解决的问题比其他模型更多，展示了其强大的数学推理能力。</p>
<blockquote>
<p>数据与实验节点: 三个值得深挖的数字。第一，GSM8K 94.9% 的得分说明基础数学能力几乎饱和——这个数据集对当前大模型来说已经太简单了。第二，MATH 75.7% 与 GPT-4o 76.6% 的差距仅 0.9%，考虑到 DeepSeek-Coder-V2 的激活参数约为 GPT-4o 的十分之一，这是一个极具性价比的结果。第三，AIME 2024 4/30(使用 maj@64 可达 5/30)是开源模型在该竞赛级基准上的最佳表现，说明代码预训练带来的结构化推理能力对数学竞赛题有显著的迁移效应。论文脚注提到使用多数投票(maj@64)可以提升 AIME 表现，这是 Test-time Compute Scaling 的早期应用。</p>
</blockquote>
<h3 id="4-6-tyzryy">4.6 通用自然语言</h3>
<p>由于 DeepSeek-Coder-V2 建立在 DeepSeek-V2 之上，它继承了强大的自然语言能力，甚至在推理相关基准上超越了 DeepSeek-V2。我们将 DeepSeek-Coder-V2-Instruct 与 DeepSeek-V2 Chat 在标准基准上进行比较，涵盖英文和中文基准，包括 BBH、MMLU、ARC、TriviaQA、NaturalQuestions、AGIEval、CLUEWSC、C-Eval 和 CMMLU。此外，我们还评估了模型的开放式生成能力，包括 Arena-Hard、AlpacaEval 2.0、MT-Bench 和 AlignBench。</p>
<table>
<thead>
<tr>
<th>基准(指标)</th>
<th>#Shots</th>
<th>DeepSeek-V2-Lite Chat</th>
<th>DS-Coder-V2-Lite Instruct</th>
<th>DeepSeek-V2 Chat</th>
<th>DS-Coder-V2 Instruct</th>
</tr>
</thead>
<tbody><tr>
<td>激活参数</td>
<td>-</td>
<td>2.4B</td>
<td>2.4B</td>
<td>21B</td>
<td>21B</td>
</tr>
<tr>
<td>总参数</td>
<td>-</td>
<td>16B</td>
<td>16B</td>
<td>236B</td>
<td>236B</td>
</tr>
<tr>
<td>训练 Token</td>
<td>-</td>
<td>5.7T</td>
<td>10.2T</td>
<td>8.1T</td>
<td>10.2T</td>
</tr>
<tr>
<td><strong>英文</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>BBH(EM)</td>
<td>3-shot</td>
<td>48.1</td>
<td>61.2</td>
<td>79.7</td>
<td>83.9</td>
</tr>
<tr>
<td>MMLU(Acc.)</td>
<td>5-shot</td>
<td>55.7</td>
<td>60.1</td>
<td>78.1</td>
<td>79.2</td>
</tr>
<tr>
<td>ARC-Easy(Acc.)</td>
<td>25-shot</td>
<td>86.1</td>
<td>88.9</td>
<td>98.1</td>
<td>97.4</td>
</tr>
<tr>
<td>ARC-Challenge(Acc.)</td>
<td>25-shot</td>
<td>73.4</td>
<td>77.4</td>
<td>92.3</td>
<td>92.8</td>
</tr>
<tr>
<td>TriviaQA(EM)</td>
<td>5-shot</td>
<td>65.2</td>
<td>59.5</td>
<td>86.7</td>
<td>82.3</td>
</tr>
<tr>
<td>NaturalQuestions(EM)</td>
<td>5-shot</td>
<td>35.5</td>
<td>30.8</td>
<td>53.4</td>
<td>47.5</td>
</tr>
<tr>
<td>AGIEval(Acc.)</td>
<td>0-shot</td>
<td>42.8</td>
<td>28.7</td>
<td>61.4</td>
<td>60.0</td>
</tr>
<tr>
<td><strong>中文</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>CLUEWSC(EM)</td>
<td>5-shot</td>
<td>80.0</td>
<td>76.5</td>
<td>89.9</td>
<td>85.9</td>
</tr>
<tr>
<td>C-Eval(Acc.)</td>
<td>5-shot</td>
<td>60.1</td>
<td>61.6</td>
<td>78.0</td>
<td>79.4</td>
</tr>
<tr>
<td>CMMLU(Acc.)</td>
<td>5-shot</td>
<td>62.5</td>
<td>62.7</td>
<td>81.6</td>
<td>80.9</td>
</tr>
<tr>
<td><strong>开放式</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>Arena-Hard</td>
<td>-</td>
<td>11.40</td>
<td>38.10</td>
<td>41.60</td>
<td>65.00</td>
</tr>
<tr>
<td>AlpacaEval 2.0</td>
<td>-</td>
<td>16.85</td>
<td>17.74</td>
<td>38.90</td>
<td>36.92</td>
</tr>
<tr>
<td>MT-Bench</td>
<td>-</td>
<td>7.37</td>
<td>7.81</td>
<td>8.97</td>
<td>8.77</td>
</tr>
<tr>
<td>AlignBench</td>
<td>-</td>
<td>6.02</td>
<td>6.83</td>
<td>7.91</td>
<td>7.84</td>
</tr>
</tbody></table>
<blockquote>
<p>表 10: DeepSeek-Coder-V2-Instruct 与 DeepSeek-V2 Chat 的对比。</p>
</blockquote>
<p>比较 16B 模型的性能时，可以明显看出 DeepSeek-Coder-V2-Lite-Instruct 在 BBH 和 Arena-Hard 等基准上优于 DeepSeek-V2-Lite-Chat。这些基准对模型的推理能力要求很高，而 DeepSeek-Coder-V2-Lite-Instruct 在这方面表现出色。然而，DeepSeek-Coder-V2-Lite-Instruct 在 TriviaQA 等知识密集型基准上落后，主要原因是预训练期间使用的网页数据相对较少。</p>
<p>对于 236B 模型，DeepSeek-Coder-V2-Instruct 在推理基准上展现出更强的实力，特别是在 Arena-Hard 上——该基准包含大量代码、数学和推理问题。另一方面，DeepSeek-V2 Chat 在 MT-Bench、AlpacaEval 2.0 和 AlignBench 等基准上表现出略好的结果。这一优势可归因于 DeepSeek-V2 Chat 的通用对齐阶段。</p>
<blockquote>
<p>设计动机节点: 表 10 揭示了一个有趣的「能力迁移」现象。DeepSeek-Coder-V2 的通用语言能力并没有因为「代码数据占比 60%」而退化，反而在推理类基准(BBH、Arena-Hard)上显著超越了同参数的 DeepSeek-V2。这说明代码预训练不是「挤占」了通用语言能力，而是「增强」了结构化推理能力——代码本质上就是一种高度结构化的形式语言，学习代码的语义和逻辑对通用推理有正向迁移。但在知识密集型任务(TriviaQA、NaturalQuestions)上的下降也值得关注:代码语料库中事实性知识远少于网页语料，这导致了「推理增强、知识稀释」的权衡。</p>
</blockquote>
<hr>
<h2 id="5-jl">5. 结论</h2>
<p>本文中，我们介绍了 DeepSeek-Coder-V2，通过在高质量的多元语料库上继续预训练 DeepSeek-V2 共 6 万亿 token，进一步推进代码智能领域的发展。通过这种持续预训练，我们发现 DeepSeek-Coder-V2 显著增强了模型的编码和数学推理能力，同时保持了与 DeepSeek-V2 可比的通用语言性能。与 DeepSeek-Coder 相比，DeepSeek-Coder-V2 支持显著更多的编程语言，从 86 种增加到 338 种，并将最大上下文长度从 16K 扩展到 128K token。实验结果表明，DeepSeek-Coder-V2 在代码和数学特定任务上达到了与 GPT-4 Turbo、Claude 3 Opus 和 Gemini 1.5 Pro 等最先进闭源模型相当的性能。</p>
<p>尽管 DeepSeek-Coder-V2 在标准基准上取得了令人印象深刻的性能，我们发现与 GPT-4 Turbo 等当前最先进模型相比，其指令遵循能力仍存在显著差距。这一差距导致在 SWE-Bench 等复杂场景和任务中表现不佳。因此，我们认为代码模型不仅需要强大的编码能力，还需要出色的指令遵循能力来处理真实世界的复杂编程场景。未来，我们将更多地关注提升模型的指令遵循能力，以更好地处理真实世界的复杂编程场景并提高开发效率。</p>
<blockquote>
<p>局限与风险节点: 结论中坦诚地指出了两个核心短板。第一，指令遵循能力的差距是 SWE-Bench 表现不佳的根本原因——生成正确代码和将代码精确嵌入到正确文件位置是两个不同层次的能力。第二，标准基准测试(如 HumanEval、MBPP)与真实软件工程场景之间存在巨大的「可用性鸿沟」。HumanEval 是孤立函数的生成，SWE-Bench 是完整仓库的修改;前者可以通过模式匹配和模板生成解决，后者需要理解项目架构、依赖关系、编码规范和版本控制。DeepSeek-Coder-V2 在前者上接近满分，在后者上只有 12.7%，这个差距恰恰说明当前代码 LLM 的评测体系需要更多像 SWE-Bench 这样贴近真实场景的基准。</p>
</blockquote>
<hr>
<h2 id="fl-a-syb">附录 A: 术语表</h2>
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
<td>MoE</td>
<td>混合专家</td>
<td>摘要</td>
<td>将模型划分为多个专家子网络,通过路由机制选择性激活部分专家</td>
</tr>
<tr>
<td>FIM</td>
<td>Fill-In-Middle</td>
<td>引言</td>
<td>中间填充,一种代码补全训练目标,利用前后文预测中间代码</td>
</tr>
<tr>
<td>GRPO</td>
<td>Group Relative Policy Optimization</td>
<td>引言</td>
<td>分组相对策略优化,无需 Critic 模型的强化学习算法</td>
</tr>
<tr>
<td>BPE</td>
<td>Byte Pair Encoding</td>
<td>数据收集</td>
<td>字节对编码,一种子词分词算法</td>
</tr>
<tr>
<td>PSM</td>
<td>Prefix-Suffix-Middle</td>
<td>训练策略</td>
<td>FIM 的一种序列组织模式</td>
</tr>
<tr>
<td>YARN</td>
<td>Yet Another RoPE Extension Method</td>
<td>长上下文扩展</td>
<td>一种位置编码外推方法,用于扩展上下文长度</td>
</tr>
<tr>
<td>NIAH</td>
<td>Needle In A Haystack</td>
<td>长上下文扩展</td>
<td>大海捞针测试,评估长上下文模型的信息检索能力</td>
</tr>
<tr>
<td>SFT</td>
<td>Supervised Fine-Tuning</td>
<td>对齐</td>
<td>监督微调,使用标注数据对模型进行有监督训练</td>
</tr>
<tr>
<td>RL</td>
<td>Reinforcement Learning</td>
<td>对齐</td>
<td>强化学习,通过奖励信号优化模型行为</td>
</tr>
<tr>
<td>CoT</td>
<td>Chain-of-Thought</td>
<td>数学推理</td>
<td>链式思维,引导模型逐步推理的提示技术</td>
</tr>
</tbody></table>
<h2 id="fl-b-hxsjhz">附录 B: 核心数据汇总</h2>
<table>
<thead>
<tr>
<th>任务类型</th>
<th>基准</th>
<th>DS-Coder-V2-Lite-Instruct</th>
<th>DS-Coder-V2-Instruct</th>
<th>最强闭源对比</th>
</tr>
</thead>
<tbody><tr>
<td>代码生成</td>
<td>HumanEval(平均)</td>
<td>65.6%</td>
<td>75.3%</td>
<td>GPT-4o 76.4%</td>
</tr>
<tr>
<td>代码生成</td>
<td>LiveCodeBench</td>
<td>24.3%</td>
<td>43.4%</td>
<td>GPT-4-Turbo 45.7%</td>
</tr>
<tr>
<td>代码补全</td>
<td>FIM(平均)</td>
<td>86.4%</td>
<td>-</td>
<td>DS-Coder-33B 86.4%</td>
</tr>
<tr>
<td>代码修复</td>
<td>SWE-Bench</td>
<td>0.0%</td>
<td>12.7%</td>
<td>GPT-4o 26.7%</td>
</tr>
<tr>
<td>代码修复</td>
<td>Aider</td>
<td>44.4%</td>
<td>73.7%</td>
<td>GPT-4o 72.9%</td>
</tr>
<tr>
<td>代码推理</td>
<td>CRUXEval-I</td>
<td>53.0%</td>
<td>70.0%</td>
<td>GPT-4o 77.4%</td>
</tr>
<tr>
<td>数学推理</td>
<td>MATH</td>
<td>61.8%</td>
<td>75.7%</td>
<td>GPT-4o 76.6%</td>
</tr>
<tr>
<td>数学推理</td>
<td>AIME 2024</td>
<td>0/30</td>
<td>4/30</td>
<td>GPT-4-Turbo 3/30</td>
</tr>
<tr>
<td>通用语言</td>
<td>MMLU</td>
<td>60.1%</td>
<td>79.2%</td>
<td>GPT-4o ~87%</td>
</tr>
<tr>
<td>开放式</td>
<td>Arena-Hard</td>
<td>38.10</td>
<td>65.00</td>
<td>GPT-4o ~80+</td>
</tr>
</tbody></table>
<h2 id="fl-c-mxpxdw">附录 C: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: DeepSeek-V2(中间Checkpoint,已训练 4.2T token)</li>
<li><strong>核心创新</strong>:<ul>
<li>在代码领域首次将开源 MoE 代码模型规模推向 236B/21B</li>
<li>数据覆盖从 86 种编程语言扩展到 338 种</li>
<li>上下文长度从 16K 扩展到 128K</li>
<li>在代码 RL 中验证了「奖励模型优于原始编译器信号」的假设</li>
<li>发现代码预训练对通用推理能力的正向迁移效应</li>
</ul>
</li>
<li><strong>被后续工作引用/影响</strong>:<ul>
<li>训练方法(GRPO + 奖励模型)被 DeepSeek-V3 和 DeepSeek-R1 继承</li>
<li>数据收集流水线被后续 DeepSeek 系列模型沿用</li>
<li>为开源社区提供了首个在多项代码基准上匹敌 GPT-4-Turbo 的代码模型</li>
</ul>
</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1. 引言"},{"level":3,"id":"1-1-zygx","text":"1.1 主要贡献"},{"level":3,"id":"1-2-pcyzbgs","text":"1.2 评测与指标概述"},{"level":2,"id":"2-sjsj","text":"2. 数据收集"},{"level":2,"id":"3-xlcl","text":"3. 训练策略"},{"level":3,"id":"3-1-xlmb","text":"3.1 训练目标"},{"level":3,"id":"3-2-mxjg","text":"3.2 模型架构"},{"level":3,"id":"3-3-xlccs","text":"3.3 训练超参数"},{"level":3,"id":"3-4-csxwkz","text":"3.4 长上下文扩展"},{"level":3,"id":"3-5-dq","text":"3.5 对齐"},{"level":4,"id":"3-5-1-jdwt-sft","text":"3.5.1 监督微调(SFT)"},{"level":4,"id":"3-5-2-qhxx-rl","text":"3.5.2 强化学习(RL)"},{"level":2,"id":"4-syjg","text":"4. 实验结果"},{"level":3,"id":"4-1-dmsc","text":"4.1 代码生成"},{"level":3,"id":"4-2-dmbq","text":"4.2 代码补全"},{"level":4,"id":"4-2-1-ckjdmbqpg","text":"4.2.1 仓库级代码补全评估"},{"level":4,"id":"4-2-2-fill-in-the-middle-dmbq","text":"4.2.2 Fill-in-the-Middle 代码补全"},{"level":3,"id":"4-3-dmxf","text":"4.3 代码修复"},{"level":3,"id":"4-4-dmljytl","text":"4.4 代码理解与推理"},{"level":3,"id":"4-5-sxtl","text":"4.5 数学推理"},{"level":3,"id":"4-6-tyzryy","text":"4.6 通用自然语言"},{"level":2,"id":"5-jl","text":"5. 结论"},{"level":2,"id":"fl-a-syb","text":"附录 A: 术语表"},{"level":2,"id":"fl-b-hxsjhz","text":"附录 B: 核心数据汇总"},{"level":2,"id":"fl-c-mxpxdw","text":"附录 C: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/01-deep-seek-coder-v2-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/01-deep-seek-coder-v2-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder-V2 技术报告精译</h1>
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
