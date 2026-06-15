"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMo 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: OLMo: Accelerating the Science of Language Models
原文链接: <a href="https://arxiv.org/abs/2402.00838">https://arxiv.org/abs/2402.00838</a>
发布日期: 2024.02
发布机构: Allen Institute for AI (AI2)</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>语言模型(Language Models, LMs) 已在 NLP 研究和商业产品中无处不在. 随着其商业重要性的激增, 最强大的模型已被封闭起来, 隐藏在专有接口之后, 其训练数据、架构和开发细节均未公开.</p>
<p>鉴于这些细节对于科学研究所这些模型至关重要, 包括研究其偏见和潜在风险, 我们认为研究社区必须能够访问强大的、真正开放的语言模型. 为此, 我们构建了 OLMo (Open Language Model), 一个具有竞争力的、真正开源的语言模型, 以加速语言模型的科学研究.</p>
<p>与大多数仅发布模型权重和推理代码的先前的努力不同, 我们 alongside OLMo 一起发布了开放的训练数据和训练与评估代码. 我们希望这一发布能够赋能开放研究社区并激发新一轮创新.</p>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: OLMo 的核心定位不是「又一个开源模型」, 而是「科学研究的使能器&quot;. 在 2024 年初的时间点上, 开源社区面临一个尴尬局面: 虽然 Llama 2、Mistral 等模型开放了权重, 但训练数据、中间Checkpoint、训练日志等关键科研资产仍然封闭. 这导致大量研究只能做「黑盒分析&quot;, 而无法深入理解模型行为与训练过程之间的因果关系. OLMo 的回应是「全开放&quot;: 权重、代码、数据、Checkpoint、日志、评估工具全部 Apache 2.0 发布. 这种极端开放策略的商业风险是存在的 (竞争对手可以直接复制其训练方案), 但 AI2 作为非营利研究机构的定位使其可以不受商业利益约束.</p>
</blockquote>
<hr>
<h2 id="1-yy">1. 引言</h2>
<p>语言模型多年来一直是 NLP 技术的核心 (rosenfeld2000two, Bengio2003ANP, Mikolov2013DistributedRO, Peters2018DeepCW, Brown2020LanguageMA). 最近, 由于大规模预训练和用于对齐的人工标注, 它们已变得具有商业价值 (OpenAI2023GPT4TR). 然而, 随着其商业价值的增加, 最大的模型已被封闭在专有接口之后, 重要细节未予披露.</p>
<p>我们认为, 研究社区能够完全访问开放语言模型对于科学 studying 这些模型、其 strengths and weaknesses、以及其偏见和风险至关重要. 因此, 我们介绍了 OLMo, 一个强大的、真正开放的语言模型, 以及 alongside 开放的训练数据、训练和评估代码、中间模型Checkpoint和训练日志.</p>
<p>近期的语言模型发布在开放程度上各不相同. 例如, Mixtral 8x7B 提供了模型权重和一份简要报告 (jiang2024mixtral), 而 LLaMA 附带详细的适配训练说明 (touvron2023llama2), Mosaic Pretrained Transformer 则提供了许多细节包括数据集分布, 尽管数据本身未发布 (MosaicML2023Introducing). Falcon 的预训练数据部分发布 (Falcon), 而最开放的模型——Pythia 套件 (pmlr-v202-biderman23a) 和 BLOOM (workshop2022bloom)——发布了训练代码、模型Checkpoint和更多内容.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">权重</th>
<th align="center">代码</th>
<th align="center">数据</th>
<th align="center">Checkpoint</th>
<th align="center">日志</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">LLaMA 2</td>
<td align="center">yes</td>
<td align="center">inference</td>
<td align="center">no</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">Mistral</td>
<td align="center">yes</td>
<td align="center">brief</td>
<td align="center">no</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">MPT</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">distribution only</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">Falcon</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">partial</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">Pythia</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">BLOOM</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left"><strong>OLMo</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 主流语言模型的开放程度对比. 数据取自原文 Table 1 的扩展版本.</p>
</blockquote>
<p>通过 OLMo, 我们发布了从数据到训练到评估工具的完整框架: 跨多种硬件类型的多个训练Checkpoint、训练日志和精确使用的数据集, 均使用宽松许可证.</p>
<p>我们并非唯一这样做的团队; LLM360 的近期工作针对类似目标 (liu2023llm360). OLMo 缩小了他们的模型与 Llama 2 等模型的 state-of-the-art 能力之间的差距. 本项目受益于所有这些先前努力的 lessons learned, 我们相信一个庞大、多样化的开放模型群体是理解语言模型和工程改进其效用的科学进步的最佳希望.</p>
<p>OLMo 框架包含构建和研究语言模型所需的工具和资源. 对于训练和建模, 它包括完整的模型权重、训练代码、训练日志和推理代码. 发布的模型包括四种不同架构、优化器和训练硬件对应的 7B 规模语言模型变体, 以及一个 1B 规模模型, 所有模型均在至少 2T token 上训练. 我们还发布了数百个中间Checkpoint, 可在 HuggingFace 上作为 revisions 获取.</p>
<p>对于数据集构建和分析, 用于这些模型的完整训练数据公开可用 (Dolma; dolma), 包括生成训练数据的代码, 以及用于分析预训练数据的工具 (wimbd).</p>
<p>对于评估, 我们基于 Catwalk (groeneveld2023catwalk) 进行下游评估, 基于 Paloma (magnusson2023paloma) 进行基于困惑度的评估.</p>
<p>对于适配, 我们使用 Open Instruct (ivison2023camels, wang2023far) 用指令和反馈数据进行训练.</p>
<p>最后, 所有代码和权重均在 Apache 2.0 许可证下发布.</p>
<p>通过这一发布, 我们希望推动对这些模型迄今 poorly understood 方面的研究, 例如预训练数据与模型能力之间的关系、设计和超参数选择的影响, 以及各种优化方法对模型训练的影响. 此外, 我们报告了成功在此规模训练语言模型所需的 lessons learned 和重要细节.</p>
<hr>
<h2 id="2-olmo-kj">2. OLMo 框架</h2>
<p>本节描述 OLMo 框架, 包括 OLMo 模型 (第 2.1 节)、预训练数据集 Dolma (第 2.2 节) 和评估框架 (第 2.3 节).</p>
<h3 id="2-1-olmo-mxyjg">2.1 OLMo 模型与架构</h3>
<p>我们采用基于 vaswani2017attention 的 decoder-only Transformer 架构, 提供 1B 和 7B 变体, 如表 2 所述.</p>
<table>
<thead>
<tr>
<th align="left">规模</th>
<th align="center">层数 L</th>
<th align="center">隐藏维度 D</th>
<th align="center">注意力头数 H</th>
<th align="center">训练 Token 数</th>
<th align="center">峰值学习率</th>
<th align="center">Warmup</th>
<th align="center">权重共享</th>
<th align="center">Batch Size</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1B</td>
<td align="center">16</td>
<td align="center">2048</td>
<td align="center">16</td>
<td align="center">2T</td>
<td align="center">4.0E-4</td>
<td align="center">2000 steps</td>
<td align="center">yes</td>
<td align="center">~4M</td>
</tr>
<tr>
<td align="left">7B</td>
<td align="center">32</td>
<td align="center">4096</td>
<td align="center">32</td>
<td align="center">2.46T</td>
<td align="center">3.0E-4</td>
<td align="center">5000 steps</td>
<td align="center">no</td>
<td align="center">~4M</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: OLMo 模型规模、训练 token 数和优化器设置. 所有运行使用 AdamW 优化器, beta 为 0.9 和 0.95, epsilon 为 1.0E-5.</p>
</blockquote>
<p>我们的具体架构包含相对于 vanilla Transformer 的多项改进, 遵循 PaLM (chowdhery2022palm)、LLaMA 家族 (touvron2023llama1, touvron2023llama2)、OpenLM (open_lm) 和 Falcon (Falcon) 等其他近期大型语言模型. 详见附录表 6 中我们与这些其他家族类似规模模型的 7B 架构全面比较.</p>
<p>我们一般通过在硬件上优化训练吞吐量同时最小化 loss spike 和慢发散风险来选择超参数. 我们通过 in-loop 评估设置来消融选择, 给定可用计算资源 (第 2.3 节).</p>
<p>我们对 vanilla Transformer 架构的主要改动总结如下:</p>
<ol>
<li><p><strong>无偏置项</strong>. 遵循 LLaMA、PaLM 等, 我们从架构中排除所有偏置项以提高训练稳定性.</p>
</li>
<li><p><strong>非参数化 Layer Norm</strong>. 我们使用 Layer Norm 的非参数化形式 (Ba2016LayerNorm), 其中没有仿射变换, 即没有 &quot;adaptive gain&quot; (或偏置). 我们相信这是最安全的选择, 也是我们考虑过的其他变体中最快的: 参数化 Layer Norm 和 RMSNorm (RMSNorm).</p>
</li>
<li><p><strong>SwiGLU 激活函数</strong>. 与 LLaMA、PaLM 等一样, 我们使用 SwiGLU 激活函数 (Shazeer2020GLUVI) 替代 ReLU, 并遵循 LLaMA 将激活隐藏层大小设为约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{8}{3}d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal">d</span></span></span></span>, 但增加到最接近的 128 的倍数 (例如 7B 模型为 11,008) 以提高吞吐量. 由于 SwiGLU 是 &quot;gated&quot; 激活函数, 输出是输入大小的一半. 因此技术上我们的 SwiGLU 输入维度为 2 x 11,008 = 22,016.</p>
</li>
<li><p><strong>旋转位置编码 (RoPE)</strong>. 与 LLaMA、PaLM 等一样, 我们用旋转位置编码 (RoPE; Su2021RoFormerET) 替代绝对位置编码.</p>
</li>
<li><p><strong>词表</strong>. 我们使用 GPT-NeoX-20B (gpt-neox-20b) 的 BPE 分词器的修改版本, 添加了用于遮蔽个人身份信息 (PII) 的额外 token. 最终词表大小为 50,280. 然而, 为了最大化训练吞吐量, 我们将模型中对应的嵌入矩阵大小增加到 50,304, 使其成为 128 的倍数.</p>
</li>
</ol>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: OLMo 的架构选择非常务实, 几乎全部是「跟随最佳实践&quot;而非原创创新. 无偏置、SwiGLU、RoPE 都来自 PaLM/LLaMA; 非参数化 Layer Norm 是一个相对少见的选择 (大多数模型使用 RMSNorm 或参数化 LN). 这里的 engineering trade-off 是速度 vs 稳定性: 作者明确提到非参数化 LN &quot;是最快的&quot;, 但也承认这主要是出于保守考虑 (&quot;safest option&quot;). 词表大小 50,280 → 50,304 的填充 (padding to multiple of 128) 是一个细节但重要的优化: NVIDIA GPU 的 Tensor Core 对 128 的倍数的矩阵维度有更高的效率, 这个填充可以让 embedding 层的矩阵乘法更高效. 代价是浪费了 24 个 token 位置的嵌入参数, 但对于 7B 模型来说这个开销可以忽略.</p>
</blockquote>
<h3 id="2-2-yxlsj-dolma">2.2 预训练数据: Dolma</h3>
<p>尽管模型参数的访问有所改善, 预训练数据集仍然不够开放. 预训练数据通常 alongside 开放模型 (更不用说封闭模型) 不发布, 且此类数据的文档往往缺乏复制或 fully understand 工作所需的细节. 这使得支持某些语言模型研究线程变得困难, 例如理解训练数据如何影响模型能力和局限性.</p>
<p>为了促进语言模型预训练的开放研究, 我们构建并发布了预训练数据集 Dolma——一个多样化的、多来源的语料库, 包含来自不同数据源的数十亿文档中的数万亿 token, 这些数据源 (1) 常见于大规模语言模型预训练, 且 (2) 对公众可访问 (dolma). 表 3 提供了每个来源数据量的 high-level 概览.</p>
<table>
<thead>
<tr>
<th align="left">来源</th>
<th align="left">类型</th>
<th align="right">UTF-8 bytes (GB)</th>
<th align="right">文档数 (百万)</th>
<th align="right">Token 数 (十亿)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Common Crawl</td>
<td align="left">网页</td>
<td align="right">9,812</td>
<td align="right">3,734</td>
<td align="right">2,180</td>
</tr>
<tr>
<td align="left">GitHub</td>
<td align="left">代码</td>
<td align="right">1,043</td>
<td align="right">210</td>
<td align="right">342</td>
</tr>
<tr>
<td align="left">Reddit</td>
<td align="left">社交媒体</td>
<td align="right">339</td>
<td align="right">377</td>
<td align="right">80</td>
</tr>
<tr>
<td align="left">Semantic Scholar</td>
<td align="left">论文</td>
<td align="right">268</td>
<td align="right">38.8</td>
<td align="right">57</td>
</tr>
<tr>
<td align="left">Project Gutenberg</td>
<td align="left">书籍</td>
<td align="right">20.4</td>
<td align="right">0.056</td>
<td align="right">5.2</td>
</tr>
<tr>
<td align="left">Wikipedia</td>
<td align="left">百科全书</td>
<td align="right">16.2</td>
<td align="right">6.2</td>
<td align="right">3.7</td>
</tr>
<tr>
<td align="left"><strong>Total</strong></td>
<td align="left"></td>
<td align="right"><strong>11,519</strong></td>
<td align="right"><strong>4,367</strong></td>
<td align="right"><strong>2,668</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Dolma 数据构成. Token 数基于 GPT-NeoX 分词器.</p>
</blockquote>
<p>Dolma 的构建流水线包括: (1) 语言过滤, (2) 质量过滤, (3) 内容过滤, (4) 去重, (5) 多来源混合, (6) 分词. 我们 refer 读者到 Dolma 报告 (dolma) 以获取关于其设计原则、构建细节和内容的更详细 summary. 该报告提供了额外的分析和在 Dolma 中间状态上训练语言模型的实验结果, 分享了我们对重要数据整理实践的 learnings, 包括内容或质量过滤器、去重和多来源数据混合的作用.</p>
<p>我们将每个来源的文档在整理期间以及最终发布中保持分开. 我们开源了高性能数据整理工具; 该工具包可用于进一步在 Dolma 上实验、复现我们的工作, 以及快速便捷地整理预训练语料库.</p>
<p>最后, 我们还开源了 WIMBD 工具 (wimbd) 以帮助数据集分析.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Dolma 的数据策略有几个值得注意的点. 第一, Common Crawl 占比高达 81.6% (2,180B / 2,668B tokens), 这与 LLaMA 1 (67%) 和 LLaMA 2 (~80%) 类似, 但高于一些更近期的模型 (如 Llama 3 专门将 CC 占比降低到 50% 以下). 第二, 所有来源在发布中保持分离, 这是一个重要的科研设计: 它允许研究人员精确控制训练数据中各来源的比例, 从而研究不同数据混合对模型能力的影响. 这是「黑盒&quot;模型无法实现的. 第三, Dolma 报告 (单独的一篇论文) 中对数据整理实践进行了系统消融, 包括质量过滤器的角色、去重的影响等——这种「数据工程即科学&quot;的态度在当时是相当罕见的.</p>
</blockquote>
<h3 id="2-3-sp">2.3 适配</h3>
<p>预训练模型并非总是直接使用, 而是进一步微调以提升性能、安全性和可用性. 通常模型首先被训练以遵循指令 (mishra-etal-2022-cross, wei2022finetuned, sanh2022multitask), 然后在人类偏好上进一步训练 (NEURIPS2022_b1efde53) 以提升生成质量. 我们通过使用 Tulu 数据和训练设置 (ivison2023camels) 将 OLMo 训练为通用聊天助手来展示使用 OLMo 作为进一步微调基座模型的 efficacy. 这涉及首先用蒸馏和人工编写的指令数据混合物进行指令微调, 然后使用 Direct Preference Optimization (DPO) (rafailov2023direct) 进一步用蒸馏偏好数据对齐模型.</p>
<h3 id="2-4-pg">2.4 评估</h3>
<p>我们在两个阶段执行基座模型评估: 用于模型设计决策的在线评估和用于评估模型Checkpoint的离线评估.</p>
<p>对于离线阶段, 我们使用 Catwalk 框架 (groeneveld2023catwalk), 一个可公开访问的评估工具, 可访问广泛的数据集和任务格式, 进行下游评估以及基于困惑度的评估 Paloma (magnusson2023paloma).</p>
<p><strong>循环内训练消融</strong>. 在整个模型训练过程中, 我们执行下游评估以围绕模型架构、初始化、优化器、学习率调度和数据混合做出决策. 我们称之为在线评估, 因为它每 1000 训练步骤 (或约 4B 训练 token) 在循环内运行, 并在被训练模型质量上提供早期和持续的信号. 这些评估依赖许多用于离线评估的核心任务和实验设置 (详细见第 3.1 节), 其镜像 EleutherAI eval harness (eval-harness) 的任务和评估结构.</p>
<p><strong>下游评估</strong>. 遵循大量先前工作 (Brown2020LanguageMA, gpt-neox-20b, touvron2023llama1, touvron2023llama2 等), 我们报告在一组下游任务上的 zero-shot 性能. 我们的评估套件包含 8 个核心任务, 与 touvron2023llama1 和 touvron2023llama2 报告的常识推理任务集 closely corresponding (见表 4 的任务列表). 鉴于被评估模型的规模, 此类任务在模型开发初期被选中, 因为它们具有 naturalness (例如, 都可以被形式化为文本补全评分任务) 和在整个训练中提供有意义信号的能力 (见图 2).</p>
<p><strong>内在语言建模评估</strong>. 为了衡量 OLMo 在超出 held-out 训练数据的语言分布上的拟合程度, 我们使用 Paloma (magnusson2023paloma), 一个新的困惑度基准, 包含 585 个不同的文本领域. 领域范围从 nytimes.com 到 Reddit 的 r/depression, 来自 18 个单独的数据源, 如 C4 (raffel2020exploring), 以分层样本抽取. 这允许更平等地包含在其源语料库中 under-represented 的文本领域.</p>
<p>我们的目标不仅仅是将 OLMo 与其他模型进行最佳性能比较, 还要展示它如何实现更完整和更受控的科学评估. OLMo-7B 是具有显式去污染 perplexity 评估的最大语言模型. 遵循 Paloma 中描述的方法, 我们移除任何从 Paloma 评估数据泄漏段落的预训练文档. 没有去污染, 其他模型面临低估困惑度 (即高估模型 out-of-sample 拟合) 的风险. 我们还发布中间Checkpoint, 允许与另外两个发布Checkpoint的模型 Pythia-6.9B (pmlr-v202-biderman23a) 和 RPJ-INCITE-7B (together2023redpajama) 进行更丰富的比较.</p>
<p><strong>适配评估</strong>. 我们还使用 wang2023far 和 ivison2023camels 提出的 Tulu 评估套件评估指令微调和 DPO 训练后的 OLMo. 我们聚焦于模型聊天能力和安全性评估, 以展示使用 OLMo 作为进一步微调基座的 efficacy.</p>
<hr>
<h2 id="3-xl-olmo">3. 训练 OLMo</h2>
<p>本节描述我们的预训练设置, 包括分布式训练框架 (第 3.1 节)、优化器 (第 3.2 节)、数据准备 (第 3.3 节) 和硬件 (第 3.4 节).</p>
<h3 id="3-1-fbsxlkj">3.1 分布式训练框架</h3>
<p>我们使用 ZeRO 优化器策略 (Rajbhandari2019ZeRO) 通过 PyTorch 的 FSDP 框架 (Zhao2023PyTorchFSDP) 训练模型, 通过在 GPU 间分片模型权重及其对应的优化器状态来减少内存消耗. 在 7B 规模上, 这使得在我们的硬件上每个 GPU 可以使用 4096 token 的 micro-batch size (见第 3.4 节).</p>
<p>对于 OLMo-1B 和 -7B 模型, 我们使用恒定的约 4M token 全局 batch size (2048 个实例, 每个序列长度为 2048 token).</p>
<p>为了提高吞吐量, 我们通过 FSDP 的内置设置和 PyTorch 的 amp 模块采用混合精度训练 (Micikevicius2017MixedPT). 后者确保 softmax 等某些操作始终在全精度下运行以提高稳定性, 而所有其他操作在 bfloat16 格式下半精度运行. 在我们的特定设置下, 每个 GPU 本地分片的模型权重和优化器状态保持全精度. 每个 Transformer 块内的权重仅在 forward 和 backward pass 期间在每个 GPU 上实例化全尺寸参数时转换为 bfloat16. 梯度在 GPU 间以全精度 reduce.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: OLMo 的训练配置有几个工程上的 careful choices. FSDP + ZeRO 是标准的内存优化方案, 但作者特别强调了 &quot;weights within each transformer block are only cast to bfloat16 when materialized&quot;——这是一个关键稳定性措施. 如果权重在 optimizer step 期间也保持 bfloat16, 梯度更新的精度损失会累积, 导致训练发散. 通过在 optimizer step 保持 FP32, 只在 forward/backward 时临时转换为 BF16, OLMo 在速度和稳定性之间取得了平衡. 另一个细节是梯度在 reduce 时使用 FP32: 这在多 GPU 训练中是必要的, 因为 BF16 的梯度 all-reduce 可能引入数值误差.</p>
</blockquote>
<h3 id="3-2-yhq">3.2 优化器</h3>
<p>我们使用 AdamW 优化器 (loshchilov2018decoupled), 超参数如表 2 所示. 对于所有模型规模, 我们在 5000 步骤 (~21B token) 内预热学习率, 然后将其线性衰减至峰值学习率的十分之一. 预热期后, 我们裁剪梯度, 使得参数梯度的总 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>l</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">l^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-norm 不超过 1.0. 表 6 给出了我们 7B 规模优化器设置与其他近期使用 AdamW 的语言模型的比较.</p>
<h3 id="3-3-sj">3.3 数据</h3>
<p>我们从开放的 Dolma 数据集 (dolma) 的 2T token 样本构建训练数据集 (第 2.2 节描述). 每个文档的 token 在附加特殊 EOS token 后被连接在一起, 然后将连续的 2048 token 块分组形成训练实例. 训练实例对每个训练运行以相同方式 shuffle. 数据顺序和每个训练 batch 的确切组成可以从我们发布的 artifacts 中重建.</p>
<p>我们所有发布的模型都至少训练到了 2T token (对我们训练数据的单次遍历), 有些通过以不同的 shuffle 顺序开始数据的第二次遍历来训练更多. 根据先前工作 (muennighoff2023scaling), 重复这么少量数据的影响应该是可忽略的.</p>
<h3 id="3-4-yj">3.4 硬件</h3>
<p>为了验证我们的代码库可以在 NVIDIA 和 AMD GPU 上使用而不损失性能, 我们在两个不同的集群上训练模型:</p>
<ul>
<li><strong>LUMI</strong>: 由 LUMI 超级计算机提供, 我们在此集群上使用多达 256 个节点, 每个节点由 4 个 AMD MI250X GPU (128GB 内存) 和 800Gbps 互连组成. MI250X 是双芯片模块, 实际上每个物理设备由两个逻辑设备组成, 因此每个节点有 8 个逻辑 GPU 设备, 每个 64GB 内存.</li>
<li><strong>MosaicML</strong>: 由 MosaicML (Databricks) 提供, 我们在此集群上使用 27 个节点, 每个节点由 8 个 NVIDIA A100 GPU (40GB 内存) 和 800Gbps 互连组成.</li>
</ul>
<p>尽管 batch size 有微小差异以优化训练吞吐量, 两个运行在我们的评估套件上产生了几乎相同的性能.</p>
<blockquote>
<p><strong>Thinking (Infrastructure)</strong>: OLMo 的跨平台训练验证是一个值得注意的工程决策. 在 2024 年, 大多数大规模训练都在 NVIDIA A100/H100 上进行, AMD GPU (尤其是 MI250X) 的软件栈成熟度明显落后. AI2 选择同时在 LUMI (AMD) 和 MosaicML (NVIDIA) 上训练, 并验证结果一致性, 这有两个目的: (1) 证明其代码库的可移植性, (2) 为 AMD GPU 在大模型训练中的可行性提供实证. 从结果看, &quot;nearly identical performance&quot; 说明硬件差异对最终模型质量的影响在 7B 规模上是次要的——这对于考虑使用非 NVIDIA 硬件的研究机构是一个重要信号. 当然, 这里的一个 caveat 是 7B 规模相对较小; 在更大规模 (如 70B+) 上, AMD 和 NVIDIA 之间的性能差距可能会放大.</p>
</blockquote>
<hr>
<h2 id="4-jg">4. 结果</h2>
<p>用于评估 OLMo-7B 的Checkpoint使用第 3.2 节提到的线性学习率衰减 schedule 在 Dolma 数据集上训练至 2.46T token. 在我们的实验中, 我们发现用学习率线性衰减至 0 的方式在 Dolma 数据集上进一步调优此Checkpoint 1000 步骤可以提升模型在困惑度和 end-task 评估套件上的性能. 我们将 OLMo 与其他公开可用的模型进行比较, 包括 LLaMA-7B (touvron2023llama1)、Llama-2-7B (touvron2023llama2)、MPT-7B (MosaicML2023Introducing)、Pythia-6.9B (pmlr-v202-biderman23a)、Falcon-7B (Falcon) 和 RPJ-INCITE-7B (together2023redpajama).</p>
<h3 id="4-1-xypg">4.1 下游评估</h3>
<p><strong>设置</strong>. 我们的核心下游评估套件 (见表 4) 包括: arc (arc_easy 和 arc_challenge) (clark2018think)、boolq (clark2019boolq)、openbookqa (mihaylov2018can)、sciq (welbl2017crowdsourcing)、hellaswag (zellers2019hellaswag)、piqa (bisk2020piqa) 和 winogrande (sakaguchi2021winogrande). 附录第 B 节还报告了我们核心评估集之外的一组额外辅助任务的结果 (见表 7).</p>
<p>在所有情况下, 我们使用 Brown2020LanguageMA 推广的 rank classification 方法进行 zero-shot 评估. 在此方法下, 候选文本补全 (例如不同的多选选项) 按似然度排序 (通常由某种归一化因子归一化), 报告预测准确率. 虽然 Catwalk 实现了多种常见的似然归一化策略, 包括按 token 数归一化 (per-token normalization; Brown2020LanguageMA, liang2022holistic)、按字符数归一化 (per-character normalization; eval-harness) 以及结合答案的无条件似然 (Brown2020LanguageMA), 我们为每个数据集分别选择了归一化策略. 具体而言, 我们对 arc 和 openbookqa 使用无条件归一化, 对 hellaswag、piqa 和 winogrande 使用 per-token 归一化, 对 boolq 和 sciq 不使用归一化 (即被形式化为单 token 预测任务的任务).</p>
<p><strong>结果</strong>. 表 4 总结了 OLMo 的 zero-shot 评估结果, 并与其他公开可用的类似规模模型进行比较. 我们在来自第 2.4 节描述的评估套件的 8 个核心任务上报告结果. 总体而言, OLMo-7B 在所有可比较模型中具有竞争力.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="right">arc challenge</th>
<th align="right">arc easy</th>
<th align="right">boolq</th>
<th align="right">hellaswag</th>
<th align="right">openbookqa</th>
<th align="right">piqa</th>
<th align="right">sciq</th>
<th align="right">winogrande</th>
<th align="right">avg.</th>
</tr>
</thead>
<tbody><tr>
<td align="left">StableLM 1.6B</td>
<td align="right">43.8</td>
<td align="right">63.7</td>
<td align="right">76.6</td>
<td align="right">68.2</td>
<td align="right">45.8</td>
<td align="right">74.0</td>
<td align="right">94.7</td>
<td align="right">64.9</td>
<td align="right">66.5</td>
</tr>
<tr>
<td align="left">Pythia 1B</td>
<td align="right">33.1</td>
<td align="right">50.2</td>
<td align="right">61.8</td>
<td align="right">44.7</td>
<td align="right">37.8</td>
<td align="right">69.1</td>
<td align="right">86.0</td>
<td align="right">53.3</td>
<td align="right">54.5</td>
</tr>
<tr>
<td align="left">TinyLlama 1.1B</td>
<td align="right">34.8</td>
<td align="right">53.2</td>
<td align="right">64.6</td>
<td align="right">58.7</td>
<td align="right">43.6</td>
<td align="right">71.1</td>
<td align="right">90.5</td>
<td align="right">58.9</td>
<td align="right">59.4</td>
</tr>
<tr>
<td align="left">OLMo-1B</td>
<td align="right">34.5</td>
<td align="right">58.1</td>
<td align="right">60.7</td>
<td align="right">62.5</td>
<td align="right">46.4</td>
<td align="right">73.7</td>
<td align="right">88.1</td>
<td align="right">58.9</td>
<td align="right">60.4</td>
</tr>
<tr>
<td align="left">Falcon-7B</td>
<td align="right">47.5</td>
<td align="right">70.4</td>
<td align="right">74.6</td>
<td align="right">75.9</td>
<td align="right">53.0</td>
<td align="right">78.5</td>
<td align="right">93.9</td>
<td align="right">68.9</td>
<td align="right">70.3</td>
</tr>
<tr>
<td align="left">LLaMA 7B</td>
<td align="right">44.5</td>
<td align="right">67.9</td>
<td align="right">75.4</td>
<td align="right">76.2</td>
<td align="right">51.2</td>
<td align="right">77.2</td>
<td align="right">93.9</td>
<td align="right">70.5</td>
<td align="right">69.6</td>
</tr>
<tr>
<td align="left">Llama 2 7B</td>
<td align="right">48.5</td>
<td align="right">69.5</td>
<td align="right">80.2</td>
<td align="right">76.8</td>
<td align="right">48.4</td>
<td align="right">76.7</td>
<td align="right">94.5</td>
<td align="right">69.4</td>
<td align="right">70.5</td>
</tr>
<tr>
<td align="left">MPT-7B</td>
<td align="right">46.5</td>
<td align="right">70.5</td>
<td align="right">74.2</td>
<td align="right">77.6</td>
<td align="right">48.6</td>
<td align="right">77.3</td>
<td align="right">93.7</td>
<td align="right">69.9</td>
<td align="right">69.8</td>
</tr>
<tr>
<td align="left">Pythia 6.9B</td>
<td align="right">44.1</td>
<td align="right">61.9</td>
<td align="right">61.1</td>
<td align="right">63.8</td>
<td align="right">45.0</td>
<td align="right">75.1</td>
<td align="right">91.1</td>
<td align="right">62.0</td>
<td align="right">63.0</td>
</tr>
<tr>
<td align="left">RPJ-INCITE-7B</td>
<td align="right">42.8</td>
<td align="right">68.4</td>
<td align="right">68.6</td>
<td align="right">70.3</td>
<td align="right">49.4</td>
<td align="right">76.0</td>
<td align="right">92.9</td>
<td align="right">64.7</td>
<td align="right">66.6</td>
</tr>
<tr>
<td align="left"><strong>OLMo-7B</strong></td>
<td align="right"><strong>48.5</strong></td>
<td align="right"><strong>65.4</strong></td>
<td align="right"><strong>73.4</strong></td>
<td align="right"><strong>76.4</strong></td>
<td align="right"><strong>50.4</strong></td>
<td align="right"><strong>78.4</strong></td>
<td align="right"><strong>93.8</strong></td>
<td align="right"><strong>67.9</strong></td>
<td align="right"><strong>69.3</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: OLMo-1B 和 OLMo-7B 与其他公开可用模型在 8 个核心下游任务上的 zero-shot 评估. OLMo-7B 报告 2.46T token Checkpoint的结果.</p>
</blockquote>
<p>在图 2 中, 我们绘制了 8 个核心 end-task 的准确率分数 progression. 除 OBQA 外, 所有任务随着 OLMo-7B 训练更多 token 都显示出准确率上升趋势. 最后一步和倒数第二步之间许多任务的准确率 sharp upward tick 显示了在最后 1000 训练步骤将学习率线性降至 0 的好处. 见附录表 7 的额外评估结果和讨论.</p>
<blockquote>
<p>图 2: OLMo-7B 在 8 个核心 end-task 上的准确率 progression. 可以看到在最后 1000 步骤将学习率衰减至 0 对大多数任务都有益处.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 表 4 的数据揭示了几个有趣的点. 第一, OLMo-7B 的平均分 69.3 略低于 Llama 2 7B 的 70.5 和 Falcon-7B 的 70.3, 但高于 LLaMA 7B 的 69.6 和 MPT-7B 的 69.8. 这说明 OLMo 在核心常识推理任务上达到了同期开源模型的 competitive 水平, 但并非绝对领先. 第二, 作者诚实地指出了 OLMo 的 relative weaknesses: 在 arc_easy (65.4 vs Llama 2 的 69.5) 和 boolq (73.4 vs 80.2) 上明显落后. 这种坦诚的 self-assessment 与一些模型报告只强调 best results 的做法形成对比. 第三, 最后 1000 步的 LR 衰减至 0 带来的性能提升是一个重要的 training insight: 这说明即使在 2.46T token 之后, 模型仍未完全收敛, 额外的 fine-tuning 式的退火仍有价值.</p>
</blockquote>
<h3 id="4-2-nzyyjmpg">4.2 内在语言建模评估</h3>
<p><strong>设置</strong>. 对于内在评估, Paloma 提出了从单独检查每个领域的性能到更 summarized 的组合领域结果的多种分析. 我们在两个粒度级别报告结果: 11 个 Paloma 来源的 aggregate 性能 (如 magnusson2023paloma), 以及更细粒度的每个来源单独结果. 这个特定的 11 个来源子集排除了不公开可用、涉及边缘或有毒文本、或包含 Paloma 去污染方法不支持的代码数据的来源.</p>
<p>这留下了 C4 (raffel2020exploring)、mC4-en (chung2023unimaxfa)、Wikitext 103 (merity2016pointersm)、Penn Treebank (marcusptb, nunesptb)、RedPajama (together2023redpajama)、Falcon-RefinedWeb (penedo2023therd)、Dolma (dolma)、M2D2 S2ORC (reid-etal-2022-m2d2)、M2D2 Wikipedia (reid-etal-2022-m2d2)、C4 100 domains (chronopoulou-etal-2022-efficient) 和 Dolma 100 Subreddits (dolma). 为了允许不同词表模型的公平比较, 我们报告 gao2020pile 定义的 bits per byte.</p>
<p><strong>结果</strong>. 在图 3 的 Sources Combined 子图中, 我们展示了 OLMo-7B 与 6 个类似规模语言模型在 Paloma 11 个数据源组合上的性能. 总体而言, 我们发现 OLMo 具有 competitive 的拟合度, 特别是考虑到其训练数据被显式去污染以对抗 Paloma. 如最终模型 (见形状) 以及中间Checkpoint (见虚线) 的比较所示, OLMo 结果遵循与其他模型类似的 scaling trends. 注意中间Checkpoint的性能受其学习率 schedule 中Checkpoint位置的影响. 因此训练步骤较少的模型倾向于有更陡峭的训练曲线, 如果所有模型的训练持续时间固定, 不一定更具样本效率. MPT-7B 在此子图中脱颖而出, 领先于其他模型. 这可能是由于多种因素, 包括预训练数据组成及其与 Paloma 领域的匹配 (例如, MPT 训练了 27% 非 Common Crawl 数据, 而 LLaMA 为 18%, RedPajama 为 12.2%, OLMo 为 11.2%) 以及各种数据预处理决策 (例如, MPT 使用 abbas2023semdedup 的语义去重).</p>
<blockquote>
<p>图 3: Paloma 11 个评估数据源的 bits per byte 及其组合, 已从 OLMo 预训练数据中 decontaminated. 模型遵循 general data scaling trend, 但样本效率在 in-distribution 数据上最有利.</p>
</blockquote>
<p>图 3 中的剩余子图通过分别报告 11 个数据源的 bits per byte 提供了更细粒度的分析. 从中我们看到样本效率的更大变化, 主要由训练和评估分布的相似性驱动. 值得注意的是, OLMo 在以 Common Crawl 为主的评估上表现良好, 如 C4, 尽管不同的 Common Crawl 后处理方式被使用该特定数据训练的模型 best fit, 如 Falcon-7B 在 Falcon RefinedWeb 上. 同时, OLMo 在与 scraped web text 关联较少的来源上相比其他模型样本效率较低, 如 WikiText-103、M2D2 S2ORC 和 M2D2 Wikipedia. RedPajama 评估显示了类似的模式, 可能因为其 7 个领域中只有 2 个来自 Common Crawl, 且 Paloma 在每个来源内平等加权领域. 由于来自 Wikipedia 和 ArXiv 论文等 curated 来源的 heterogeneous 数据比 scraped web text 更 scarce, 随着预训练语料库规模扩大, 维持对这些语言分布的拟合样本效率将具有挑战性.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Paloma 评估的设计意图非常值得称赞: 它不是简单地报告一个 aggregate perplexity 数字, 而是将 585 个不同领域平等呈现, 从而避免被 web-dominated 的语料库偏见所主导. 结果也验证了这个设计的价值: OLMo 在 C4 (88.8% CC 训练数据) 上表现最好, 但在 WikiText-103 和学术文献上落后. 这揭示了一个 fundamental tension: 大规模预训练天然偏向 web text (因为它最 abundant 且 cheapest to acquire), 但 curated 来源 (如 Wikipedia、arXiv) 的知识密度更高. 随着模型规模增大, 这种 &quot;web bias&quot; 可能导致模型在需要精确知识或结构化推理的任务上表现不佳. OLMo 的完全开放性使得研究人员可以精确调整数据混合来研究这个问题, 这是封闭模型无法做到的.</p>
</blockquote>
<h3 id="4-3-sppg">4.3 适配评估</h3>
<p><strong>设置</strong>. 我们在适配前、监督微调和 DPO 训练后评估 OLMo-7B, 聚焦于 wang2023far 使用的安全性和聊天评估. 我们还将 OLMo 与表 4 中模型的官方发布的指令微调变体进行比较. 最后我们还与 Tulu 2 模型比较, 以对比使用相同后训练数据混合物和 procedure 训练的模型.</p>
<p><strong>结果</strong>. 我们发现指令微调显著提升了 OLMo-7B 的性能和安全性, MMLU 性能大幅提升, ToxiGen 和 TruthfulQA 分数改善——尤其是 DPO 训练后. 此外, 我们发现 OLMo 在初始指令微调 (OLMo+SFT) 和额外偏好对齐 (OLMo+SFT+DPO) 后优于大多数其他聊天变体, 突出了 OLMo 作为基座模型的 strength 和用于适配训练的 Tulu 混合物的 strength. 然而, 我们发现与 Tulu 2 仍有差距, 后者是在 Llama 2 上应用 Tulu 混合物训练的. 这一差距可能由于 Llama 2 的测试集污染 (touvron2023llama2 报告 Llama 2 在包含 MMLU 测试数据的污染数据上预训练) 以及 Tulu 混合物主要为 Llama 模型设计. 总体而言, 我们看到 OLMo 从额外调优中 greatly benefits, 并作为下游应用的强基座模型.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="right">MMLU 0-shot</th>
<th align="right">AlpacaEval %win</th>
<th align="right">ToxiGen %Toxic</th>
<th align="right">TruthfulQA %Info+True</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OLMo (base)</td>
<td align="right">28.3</td>
<td align="right">-</td>
<td align="right">81.4</td>
<td align="right">31.6</td>
</tr>
<tr>
<td align="left">MPT Chat</td>
<td align="right">33.8</td>
<td align="right">46.8</td>
<td align="right">0.1</td>
<td align="right">42.7</td>
</tr>
<tr>
<td align="left">Falcon Instruct</td>
<td align="right">25.2</td>
<td align="right">14.0</td>
<td align="right">70.7</td>
<td align="right">27.2</td>
</tr>
<tr>
<td align="left">RPJ-INCITE Chat</td>
<td align="right">27.0</td>
<td align="right">38.0</td>
<td align="right">46.4</td>
<td align="right">53.0</td>
</tr>
<tr>
<td align="left">Llama-2-Chat</td>
<td align="right">46.8</td>
<td align="right">87.3</td>
<td align="right">0.0</td>
<td align="right">26.3</td>
</tr>
<tr>
<td align="left">Tulu 2</td>
<td align="right">50.4</td>
<td align="right">73.9</td>
<td align="right">7.0</td>
<td align="right">51.7</td>
</tr>
<tr>
<td align="left">Tulu 2+DPO</td>
<td align="right">50.7</td>
<td align="right">85.1</td>
<td align="right">0.5</td>
<td align="right">-</td>
</tr>
<tr>
<td align="left">OLMo+SFT</td>
<td align="right">47.3</td>
<td align="right">57.0</td>
<td align="right">14.4</td>
<td align="right">41.2</td>
</tr>
<tr>
<td align="left">OLMo+SFT+DPO</td>
<td align="right">46.2</td>
<td align="right">69.3</td>
<td align="right">1.7</td>
<td align="right">52.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: 各种指令微调 7B 模型的评估, 包括 OLMo-7B 适配训练前后的结果. ToxiGen 越低越好, 其他指标越高越好.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Alignment Analysis)</strong>: 表 5 的数据非常 revealing. 首先, 基座模型的 MMLU 28.3% 明显低于 Llama 2 基座 (约 45%), 但 SFT 后跃升至 47.3%, 接近 Tulu 2 的 50.4%. 这说明 OLMo 基座在知识密集型任务上的 gap 很大程度上可以通过高质量指令数据弥补. 其次, 安全性指标 (ToxiGen) 的改善最为 dramatic: 从基座的 81.4% (极高毒性率) 到 SFT+DPO 后的 1.7%. 这揭示了预训练模型固有的 toxicity 问题, 以及 DPO 在抑制有害生成方面的 effectiveness. 第三, 作者诚实指出了与 Tulu 2 的差距, 并给出了两个可能原因: (1) Llama 2 的测试集污染, (2) Tulu mix 为 Llama 优化. 这种 candor 在模型报告中并不常见.</p>
</blockquote>
<hr>
<h2 id="5-fbd-artifacts">5. 发布的 artifacts</h2>
<p>通过分享所有 pipeline 阶段的 artifacts, 我们 aim 鼓励开放研究并减少学术界和从业者重复、往往成本高昂的努力. 我们发布以下内容:</p>
<ul>
<li><strong>预训练</strong> (第 2.1 节)<ol>
<li>训练和建模代码.</li>
<li>7B 模型、7B-twin-2T 和 1B 模型的训练权重. 对于所有模型, 我们不仅发布最终模型权重, 还发布 500+ 中间Checkpoint, 间隔 1000 步骤.</li>
<li>训练期间记录到 Weights &amp; Biases 的完整指标集.</li>
</ol>
</li>
<li><strong>数据</strong> (第 2.2 节)<ol>
<li>我们的完整预训练语料库 Dolma (dolma).</li>
<li>支持复现完整训练数据顺序以及在训练期间每一步看到哪些训练数据的工具.</li>
<li>用于重建训练数据 (dolma) 和执行数据集分析 (wimbd) 的工具.</li>
</ol>
</li>
<li><strong>适配</strong> (第 2.3 节)<ol>
<li>适配的训练代码和数据.</li>
<li>OLMo+SFT 和 OLMo+SFT+DPO 的模型权重.</li>
</ol>
</li>
<li><strong>评估</strong> (第 2.4 节)<ol>
<li>Catwalk (groeneveld2023catwalk) 中的代码和数据, 用于下游任务和内在语言建模 (magnusson2023paloma) 的离线评估.</li>
<li>适配模型的评估套件 (wang2023far, ivison2023camels).</li>
</ol>
</li>
</ul>
<hr>
<h2 id="6-jlywlgz">6. 结论与未来工作</h2>
<p>本文介绍了我们的首个 OLMo 发布, 一个 state-of-the-art 的、真正开放的语言模型及其构建和研究语言模型科学的框架.</p>
<p>与大多数仅发布模型权重和推理代码的先前的努力不同, 我们发布了 OLMo 和整个框架, 包括训练数据、训练和评估代码以及训练运行期间收集的详细指标. 此外, 我们发布了适配模型以及所有模型适配代码和数据.</p>
<p>我们打算持续支持和扩展 OLMo 及其框架, 继续推动开放语言模型的边界以赋能开放研究社区.</p>
<p>自此处描述的 OLMo 原始发布以来, 我们改进了数据和训练设置以显著提升结果. 例如, MMLU 分数提高了 24 个百分点至 52%.</p>
<p>我们期待将不同模型规模、模态、数据集、安全措施和评估带入 OLMo 家族. 我们希望本次和未来的发布将赋能和加强开放研究社区并激发新一轮创新.</p>
<hr>
<h2 id="7-jxx">7. 局限性</h2>
<p>我们认识到构建大型语言模型有许多局限性. 事实上, 创建语言模型的每个步骤——从数据到训练到适配到评估——都有其自身的局限性, 因此我们在下面为每个步骤添加了章节. 当然我们认识到今天的 AI 系统可以有广泛的社会影响, 因此存在我们无法在本节中涵盖的重大局限性.</p>
<p><strong>数据</strong>. 我们的工作聚焦于英语预训练数据. 我们希望我们的开放框架能够 enable 未来更多语言以及多语言模型的发展. 模型训练的数据赋予了模型能力, 在训练大型语言模型的规模上, 我们认识到数据可能包含有问题的内容, 如有毒语言、个人信息和受版权保护的文本. 我们尽力缓解了这一点, 但认识到今天没有完美的方法可以完全移除此类内容.</p>
<p><strong>训练</strong>. 训练大型语言模型目前是一项具有挑战性的工作, 开源社区缺乏 significant support. 由于页面限制, 我们没有提供广泛的训练日志,  documenting 例如发散或未能学习的训练运行.</p>
<p><strong>适配</strong>. 我们的预训练模型面临与现有预训练 LLM 相同的问题, 如偏见、毒性和幻觉. 我们的适配模型在避免这些生成方面更好, 但并不完美.</p>
<p>此外, 我们注意到我们 largely 采用了为不同模型家族 (Tulu, 为 Llama 模型设计) 设计的现有数据混合物, OLMo 可能需要不同的数据混合来调整其独特的 strengths 和 weaknesses. Tulu 混合物本身也依赖于从各种模型蒸馏的数据, 我们希望未来减少对此类数据的依赖.</p>
<p><strong>评估</strong>. 虽然我们包含了与其他当前语言模型在各种数据集上的比较, 但许多下游任务实际上并不代表用户如何与语言模型交互 (即作为聊天机器人). 此外, 语言模型评估目前非常 noisy; 我们 aim 仅包含在提供某种信号以判断哪个模型表现最佳的评估数据集上, 但认识到没有完美的自动评估, 因此比较应持保留态度.</p>
<hr>
<h2 id="8-llsm">8. 伦理声明</h2>
<p>通过这项工作, 我们采取立场认为增加语言模型的开放性对于科学理解其能力和局限性以及广泛参与这些模型的持续发展至关重要.</p>
<p>在开放数据上训练进一步增强了这些好处. 此外, 我们的开放发布使从业者能够采用我们的模型并在此基础上构建, 而不必从头训练自己的模型, 在这种情况下他们将重复我们的工作同时消耗更多资源并导致 increased 环境影响.</p>
<p>当然, 开放性并非没有风险; 这些模型被用于造成 harm 的 unintended 方式的可能性仍然存在. 我们相信, 理解和 mitigate 这些潜在 harm 的研究和开发工作也将因模型的开放性而加速, 允许多样化的方法和分析.</p>
<p>过去一年有许多具有非常宽松许可证的类似模型发布, 因此对我们工作使用更严格的许可证不会消除该领域的 overall risk. 我们相信这种偏向更开放的 trade-off 是最佳选择.</p>
<hr>
<h2 id="fl-a-xlszxq">附录 A. 训练设置详情</h2>
<p>表 6 总结了 OLMo-7B 的模型架构和优化器参数, 以及近期类似规模模型.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">OLMo-7B</th>
<th align="left">LLaMA2-7B</th>
<th align="left">OpenLM-7B</th>
<th align="left">Falcon-7B</th>
<th align="left">PaLM-8B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Dimension</td>
<td align="left">4096</td>
<td align="left">4096</td>
<td align="left">4096</td>
<td align="left">4544</td>
<td align="left">4096</td>
</tr>
<tr>
<td align="left">Num heads</td>
<td align="left">32</td>
<td align="left">32</td>
<td align="left">32</td>
<td align="left">71</td>
<td align="left">16</td>
</tr>
<tr>
<td align="left">Num layers</td>
<td align="left">32</td>
<td align="left">32</td>
<td align="left">32</td>
<td align="left">32</td>
<td align="left">32</td>
</tr>
<tr>
<td align="left">MLP ratio</td>
<td align="left">~8/3</td>
<td align="left">~8/3</td>
<td align="left">~8/3</td>
<td align="left">4</td>
<td align="left">4</td>
</tr>
<tr>
<td align="left">Layer norm type</td>
<td align="left">non-parametric</td>
<td align="left">RMSNorm</td>
<td align="left">parametric</td>
<td align="left">parametric</td>
<td align="left">parametric</td>
</tr>
<tr>
<td align="left">Positional embeddings</td>
<td align="left">RoPE</td>
<td align="left">RoPE</td>
<td align="left">RoPE</td>
<td align="left">RoPE</td>
<td align="left">RoPE</td>
</tr>
<tr>
<td align="left">Attention variant</td>
<td align="left">full</td>
<td align="left">GQA</td>
<td align="left">full</td>
<td align="left">MQA</td>
<td align="left">MQA</td>
</tr>
<tr>
<td align="left">Biases</td>
<td align="left">none</td>
<td align="left">none</td>
<td align="left">in LN only</td>
<td align="left">in LN only</td>
<td align="left">none</td>
</tr>
<tr>
<td align="left">Block type</td>
<td align="left">sequential</td>
<td align="left">sequential</td>
<td align="left">sequential</td>
<td align="left">parallel</td>
<td align="left">parallel</td>
</tr>
<tr>
<td align="left">Activation</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">SwiGLU</td>
<td align="left">GeLU</td>
<td align="left">SwiGLU</td>
</tr>
<tr>
<td align="left">Sequence length</td>
<td align="left">2048</td>
<td align="left">4096</td>
<td align="left">2048</td>
<td align="left">2048</td>
<td align="left">2048</td>
</tr>
<tr>
<td align="left">Batch size (instances)</td>
<td align="left">2160</td>
<td align="left">1024</td>
<td align="left">2048</td>
<td align="left">2304</td>
<td align="left">512</td>
</tr>
<tr>
<td align="left">Batch size (tokens)</td>
<td align="left">~4M</td>
<td align="left">~4M</td>
<td align="left">~4M</td>
<td align="left">~4M</td>
<td align="left">~1M</td>
</tr>
<tr>
<td align="left">Weight tying</td>
<td align="left">no</td>
<td align="left">no</td>
<td align="left">no</td>
<td align="left">no</td>
<td align="left">yes</td>
</tr>
<tr>
<td align="left">Warmup steps</td>
<td align="left">5000</td>
<td align="left">2000</td>
<td align="left">2000</td>
<td align="left">1000</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Peak LR</td>
<td align="left">3.0E-04</td>
<td align="left">3.0E-04</td>
<td align="left">3.0E-04</td>
<td align="left">6.0E-04</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Minimum LR</td>
<td align="left">3.0E-05</td>
<td align="left">3.0E-05</td>
<td align="left">3.0E-05</td>
<td align="left">1.2E-05</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Weight decay</td>
<td align="left">0.1</td>
<td align="left">0.1</td>
<td align="left">0.1</td>
<td align="left">0.1</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Beta1</td>
<td align="left">0.9</td>
<td align="left">0.9</td>
<td align="left">0.9</td>
<td align="left">0.99</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Beta2</td>
<td align="left">0.95</td>
<td align="left">0.95</td>
<td align="left">0.95</td>
<td align="left">0.999</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Epsilon</td>
<td align="left">1.0E-05</td>
<td align="left">1.0E-05</td>
<td align="left">1.0E-05</td>
<td align="left">1.0E-05</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">LR schedule</td>
<td align="left">linear</td>
<td align="left">cosine</td>
<td align="left">cosine</td>
<td align="left">cosine</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Gradient clipping</td>
<td align="left">global 1.0</td>
<td align="left">global 1.0</td>
<td align="left">global 1.0</td>
<td align="left">global 1.0</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Gradient reduce dtype</td>
<td align="left">FP32</td>
<td align="left">FP32</td>
<td align="left">FP32</td>
<td align="left">BF16</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">Optimizer state dtype</td>
<td align="left">FP32</td>
<td align="left">most likely FP32</td>
<td align="left">FP32</td>
<td align="left">FP32</td>
<td align="left">-</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: 7-8B 规模的 LM 架构和优化器比较. 所有模型均使用 AdamW.</p>
</blockquote>
<hr>
<h2 id="fl-b-ghytzj">附录 B. 功耗与碳足迹</h2>
<p>遵循先前文献 (strubell-etal-2019-energy, patterson2021carbon, wu2022sustainable, dodge2022measuring), 我们通过计算训练所需的总功耗然后乘以模型训练地电网的碳排放强度来估计预训练模型消耗的总能量和释放的碳. 虽然报告这些 operational emissions 是标准做法, 但它未涵盖其他排放来源, 如硬件和数据中心基础设施的制造、运输和处置产生的 embodied emissions、使用导致的 lifetime operational emissions、rebound effects 或其他环境影响如水消耗或采矿. 因此我们的估计应被视为 lower bounds.</p>
<p>我们通过每 25ms 测量单个节点的功耗, 计算整个训练运行的平均值, 然后乘以总节点数来计算模型的总功耗. 然后我们乘以数据中心的 PUE (Power Usage Effectiveness) 因子, 设为 1.1, 代表 energy efficient 数据中心的保守 10% 能耗开销. 我们估计预训练 7B 模型消耗了 <strong>239 MWh</strong> 能量.</p>
<p>为了计算碳排放, 我们将总功耗乘以碳强度因子, 以每 KWh 排放的 kg CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 计量, 基于每个模型训练的数据中心的物理位置. 在 A100-40GB GPU 上训练的模型在澳大利亚训练, 因此我们假设碳强度因子为 0.610, 澳大利亚 2022 年的全国平均值. 在 MI250X GPU 上训练的模型在 LUMI 超级计算机上训练, 运行在 100% 可再生、碳中和能源上, 因此假设碳强度因子为 0. 因此我们估计总预训练排放为 <strong>69.78 tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq</strong>.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="left">GPU 类型</th>
<th align="right">GPU 功耗 (MWh)</th>
<th align="right">PUE</th>
<th align="right">碳强度 (kg CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>e/KWh)</th>
<th align="right">碳排放 (tCO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>eq)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Gopher-280B</td>
<td align="left">TPU v3</td>
<td align="right">1,066</td>
<td align="right">1.08</td>
<td align="right">0.330</td>
<td align="right">380</td>
</tr>
<tr>
<td align="left">BLOOM-176B</td>
<td align="left">A100-80GB</td>
<td align="right">433</td>
<td align="right">1.2</td>
<td align="right">0.057</td>
<td align="right">30</td>
</tr>
<tr>
<td align="left">OPT-175B</td>
<td align="left">A100-80GB</td>
<td align="right">324</td>
<td align="right">1.1</td>
<td align="right">0.231</td>
<td align="right">82</td>
</tr>
<tr>
<td align="left">T5-11B</td>
<td align="left">TPU v3</td>
<td align="right">77</td>
<td align="right">1.12</td>
<td align="right">0.545</td>
<td align="right">47</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="left">A100-80GB</td>
<td align="right">33</td>
<td align="right">1.1</td>
<td align="right">0.385</td>
<td align="right">14</td>
</tr>
<tr>
<td align="left">LLaMA2-7B</td>
<td align="left">A100-80GB</td>
<td align="right">74</td>
<td align="right">1.1</td>
<td align="right">0.385</td>
<td align="right">31</td>
</tr>
<tr>
<td align="left">OLMo-7B (MI250X)</td>
<td align="left">MI250X</td>
<td align="right">135</td>
<td align="right">1.1</td>
<td align="right">0.000*</td>
<td align="right">0*</td>
</tr>
<tr>
<td align="left">OLMo-7B (A100-40GB)</td>
<td align="left">A100-40GB</td>
<td align="right">104</td>
<td align="right">1.1</td>
<td align="right">0.610</td>
<td align="right">70</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: 预训练期间的 CO<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mrow></mrow><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4511em;vertical-align:-0.15em;"></span><span class="mord"><span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 排放. *LUMI 完全由水电驱动.</p>
</blockquote>
<hr>
<h2 id="fl-c-ewpg">附录 C. 额外评估</h2>
<p>图 4 展示了 Paloma 中 7 个未包含在图 3 组合指标中的数据源的 bits per byte.</p>
<blockquote>
<p>图 4: Paloma 中 7 个剩余数据源的 bits per byte, 未包含在图 3 的组合指标中.</p>
</blockquote>
<p>表 8 提供了 OLMo-7B 在 6 个额外 end-task 上的 zero-shot 评估结果: headqa_en (head-qa)、logiqa (logi-qa)、mrpc (mrpc)、qnli (glue)、wic (wic) 和 wnli (glue).</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="right">headqa_en</th>
<th align="right">logiqa</th>
<th align="right">mrpc</th>
<th align="right">qnli</th>
<th align="right">wic</th>
<th align="right">wnli</th>
<th align="right">avg.</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Falcon-7B</td>
<td align="right">38.6</td>
<td align="right">23.7</td>
<td align="right">62.8</td>
<td align="right">49.8</td>
<td align="right">49.5</td>
<td align="right">47.9</td>
<td align="right">45.4</td>
</tr>
<tr>
<td align="left">LLaMA-7B</td>
<td align="right">38.7</td>
<td align="right">19.5</td>
<td align="right">68.6</td>
<td align="right">50.1</td>
<td align="right">49.1</td>
<td align="right">52.1</td>
<td align="right">46.4</td>
</tr>
<tr>
<td align="left">Llama-2-7B</td>
<td align="right">39.5</td>
<td align="right">26.1</td>
<td align="right">69.1</td>
<td align="right">49.4</td>
<td align="right">49.8</td>
<td align="right">45.1</td>
<td align="right">46.5</td>
</tr>
<tr>
<td align="left">MPT-7B</td>
<td align="right">37.4</td>
<td align="right">22.9</td>
<td align="right">67.7</td>
<td align="right">52.1</td>
<td align="right">48.1</td>
<td align="right">47.9</td>
<td align="right">46.0</td>
</tr>
<tr>
<td align="left">Pythia-6.9B</td>
<td align="right">40.1</td>
<td align="right">21.5</td>
<td align="right">65.4</td>
<td align="right">53.8</td>
<td align="right">55.0</td>
<td align="right">38.0</td>
<td align="right">45.6</td>
</tr>
<tr>
<td align="left">RPJ-INCITE-7B</td>
<td align="right">36.9</td>
<td align="right">27.8</td>
<td align="right">58.8</td>
<td align="right">53.8</td>
<td align="right">48.9</td>
<td align="right">57.8</td>
<td align="right">47.3</td>
</tr>
<tr>
<td align="left">OLMo-7B</td>
<td align="right">37.3</td>
<td align="right">23.4</td>
<td align="right">68.4</td>
<td align="right">49.1</td>
<td align="right">50.2</td>
<td align="right">56.3</td>
<td align="right">47.5</td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: OLMo-7B 在 6 个额外 end-task 上的 zero-shot 评估.</p>
</blockquote>
<p>这些额外任务与第 3.1 节描述的核心评估集相比, 在模型开发期间性能趋势较不稳定, 提供的信号有限. 这在图 5 中有所说明, 其中我们看到任务性能在训练过程中的 progression 更 random (与图 2 中更稳定的上升趋势相比).</p>
<blockquote>
<p>图 5: OLMo-7B 在 6 个额外 end-task 上的准确率 progression. 这些额外任务的性能不稳定, 在模型开发期间提供的信号有限.</p>
</blockquote>
<hr>
<h2 id="fl-d-spxlxj">附录 D. 适配训练细节</h2>
<p>指令微调使用以下超参数 (通过小规模 pilot 实验选择):</p>
<ul>
<li>学习率: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span></li>
<li>Epochs: 3</li>
<li>Warmup: 前 3% 训练时间的线性 warmup, 然后线性 cooldown 至学习率 0</li>
<li>Weight decay: 0</li>
<li>Gradient clipping: 0</li>
<li>最大序列长度: 2048</li>
<li>数据: Tulu V2 SFT mix</li>
</ul>
<p>DPO 训练使用以下超参数 (遵循 ivison2023camels):</p>
<ul>
<li>学习率: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span></li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span>: 0.1</li>
<li>Epochs: 3</li>
<li>Warmup: 前 10% 训练时间的线性 warmup, 然后线性 cooldown</li>
<li>Weight decay: 0</li>
<li>Gradient clipping: 0</li>
<li>最大序列长度: 2048</li>
<li>数据: UltraFeedback 的修改版本</li>
</ul>
<hr>
<h2 id="fl-e-syb">附录 E. 术语表</h2>
<table>
<thead>
<tr>
<th align="left">英文术语</th>
<th align="left">中文译名</th>
<th align="left">首次出现</th>
<th align="left">简要解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OLMo</td>
<td align="left">Open Language Model</td>
<td align="left">摘要</td>
<td align="left">AI2 发布的全开源语言模型框架</td>
</tr>
<tr>
<td align="left">Dolma</td>
<td align="left">-</td>
<td align="left">第 2.2 节</td>
<td align="left">AI2 构建的开放预训练语料库, 2.7T tokens</td>
</tr>
<tr>
<td align="left">Paloma</td>
<td align="left">-</td>
<td align="left">第 2.4 节</td>
<td align="left">AI2 开发的 585 领域困惑度评估基准</td>
</tr>
<tr>
<td align="left">Catwalk</td>
<td align="left">-</td>
<td align="left">第 2.4 节</td>
<td align="left">AI2 的下游任务评估框架</td>
</tr>
<tr>
<td align="left">Tulu</td>
<td align="left">-</td>
<td align="left">第 2.3 节</td>
<td align="left">指令微调和偏好对齐的数据与训练设置</td>
</tr>
<tr>
<td align="left">DPO</td>
<td align="left">Direct Preference Optimization</td>
<td align="left">第 2.3 节</td>
<td align="left">直接偏好优化, 无需奖励模型的 RLHF 替代方案</td>
</tr>
<tr>
<td align="left">ZeRO</td>
<td align="left">-</td>
<td align="left">第 3.1 节</td>
<td align="left">微软提出的优化器状态分片策略</td>
</tr>
<tr>
<td align="left">FSDP</td>
<td align="left">Fully Sharded Data Parallel</td>
<td align="left">第 3.1 节</td>
<td align="left">PyTorch 的全分片数据并行框架</td>
</tr>
<tr>
<td align="left">RoPE</td>
<td align="left">Rotary Position Embedding</td>
<td align="left">第 2.1 节</td>
<td align="left">旋转位置编码</td>
</tr>
<tr>
<td align="left">SwiGLU</td>
<td align="left">-</td>
<td align="left">第 2.1 节</td>
<td align="left">门控激活函数, 由 Swish 和 GLU 组合</td>
</tr>
<tr>
<td align="left">PUE</td>
<td align="left">Power Usage Effectiveness</td>
<td align="left">附录 B</td>
<td align="left">数据中心能耗效率指标</td>
</tr>
<tr>
<td align="left">Bits per Byte</td>
<td align="left">每字节比特数</td>
<td align="left">第 4.2 节</td>
<td align="left">跨词表模型的困惑度比较指标</td>
</tr>
</tbody></table>
<hr>
<h2 id="ckly">参考来源</h2>
<ol>
<li>Groeneveld et al., &quot;OLMo: Accelerating the Science of Language Models&quot;, arXiv:2402.00838 (2024)</li>
<li>Soldaini et al., &quot;Dolma: An Open Corpus of Three Trillion Tokens for Language Model Pretraining&quot;, arXiv:2402.00159 (2024)</li>
<li>Magnusson et al., &quot;Paloma: A Benchmark for Scientific Language Modeling&quot;, arXiv:2311.03601 (2023)</li>
<li>Ivison et al., &quot;Camels in a Changing Climate: Enhancing LM Adaptation with Tulu 2&quot;, arXiv:2311.10702 (2023)</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1. 引言"},{"level":2,"id":"2-olmo-kj","text":"2. OLMo 框架"},{"level":3,"id":"2-1-olmo-mxyjg","text":"2.1 OLMo 模型与架构"},{"level":3,"id":"2-2-yxlsj-dolma","text":"2.2 预训练数据: Dolma"},{"level":3,"id":"2-3-sp","text":"2.3 适配"},{"level":3,"id":"2-4-pg","text":"2.4 评估"},{"level":2,"id":"3-xl-olmo","text":"3. 训练 OLMo"},{"level":3,"id":"3-1-fbsxlkj","text":"3.1 分布式训练框架"},{"level":3,"id":"3-2-yhq","text":"3.2 优化器"},{"level":3,"id":"3-3-sj","text":"3.3 数据"},{"level":3,"id":"3-4-yj","text":"3.4 硬件"},{"level":2,"id":"4-jg","text":"4. 结果"},{"level":3,"id":"4-1-xypg","text":"4.1 下游评估"},{"level":3,"id":"4-2-nzyyjmpg","text":"4.2 内在语言建模评估"},{"level":3,"id":"4-3-sppg","text":"4.3 适配评估"},{"level":2,"id":"5-fbd-artifacts","text":"5. 发布的 artifacts"},{"level":2,"id":"6-jlywlgz","text":"6. 结论与未来工作"},{"level":2,"id":"7-jxx","text":"7. 局限性"},{"level":2,"id":"8-llsm","text":"8. 伦理声明"},{"level":2,"id":"fl-a-xlszxq","text":"附录 A. 训练设置详情"},{"level":2,"id":"fl-b-ghytzj","text":"附录 B. 功耗与碳足迹"},{"level":2,"id":"fl-c-ewpg","text":"附录 C. 额外评估"},{"level":2,"id":"fl-d-spxlxj","text":"附录 D. 适配训练细节"},{"level":2,"id":"fl-e-syb","text":"附录 E. 术语表"},{"level":2,"id":"ckly","text":"参考来源"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/01-olmo/01-olmo-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/01-olmo/01-olmo-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMo 技术报告精译</h1>
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
