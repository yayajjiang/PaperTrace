"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiMo-7B 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">返回 14.9-MiMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiMo: Unlocking the Reasoning Potential of Language Model - From Pretraining to Posttraining
原文链接: <a href="https://github.com/XiaomiMiMo/MiMo/blob/main/MiMo-7B-Technical-Report.pdf">https://github.com/XiaomiMiMo/MiMo/blob/main/MiMo-7B-Technical-Report.pdf</a>
发布日期: 2025-04-30
发布机构: Xiaomi LLM-Core Team</p>
</blockquote>
<hr>
<h2 id="0-zyyhxzb">0. 摘要与核心指标</h2>
<p>MiMo-7B 是一个专为推理任务从头训练的大型语言模型系列,在预训练与后训练两个阶段均进行了针对性优化.</p>
<p><strong>预训练</strong>: 优化数据预处理流程,采用三阶段数据混合策略增强基座模型的推理潜力.MiMo-7B-Base 在约 25 万亿 token 上预训练,并引入 Multi-Token Prediction(MTP)作为额外训练目标以增强性能并加速推理.</p>
<p><strong>后训练</strong>: 策划 130K 道可验证的数学与编程问题用于强化学习,集成 test-difficulty-driven code-reward 机制缓解稀疏奖励问题,并采用策略性数据重采样稳定训练.</p>
<p><strong>核心性能</strong>:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>AIME 2024</th>
<th>AIME 2025</th>
<th>LiveCodeBench v5</th>
<th>LiveCodeBench v6</th>
<th>MATH500</th>
</tr>
</thead>
<tbody><tr>
<td>MiMo-7B-Base</td>
<td>32.9</td>
<td>24.3</td>
<td>32.9</td>
<td>29.1</td>
<td>37.4</td>
</tr>
<tr>
<td>MiMo-7B-RL-Zero</td>
<td>56.4</td>
<td>46.3</td>
<td>49.1</td>
<td>42.9</td>
<td>93.6</td>
</tr>
<tr>
<td>MiMo-7B-SFT</td>
<td>58.7</td>
<td>44.3</td>
<td>52.3</td>
<td>45.5</td>
<td>93.0</td>
</tr>
<tr>
<td><strong>MiMo-7B-RL</strong></td>
<td><strong>68.2</strong></td>
<td><strong>55.4</strong></td>
<td><strong>57.8</strong></td>
<td><strong>49.3</strong></td>
<td><strong>95.8</strong></td>
</tr>
<tr>
<td>OpenAI o1-mini</td>
<td>63.6</td>
<td>50.7</td>
<td>53.8</td>
<td>46.8</td>
<td>90.0</td>
</tr>
<tr>
<td>QwQ-32B-Preview</td>
<td>50.0</td>
<td>32.4</td>
<td>41.9</td>
<td>39.1</td>
<td>90.6</td>
</tr>
<tr>
<td>R1-Distill-Qwen-7B</td>
<td>55.5</td>
<td>38.8</td>
<td>37.6</td>
<td>23.9</td>
<td>92.8</td>
</tr>
</tbody></table>
<p>MiMo-7B-RL 在数学推理与代码生成任务上超越 OpenAI o1-mini,在 LiveCodeBench v6 上超越 QwQ-32B-Preview 超过 10 分.MiMo-7B-Base 的 pass@k 表现甚至超越 32B 规模的基座模型.</p>
<p><strong>开源</strong>: 完整开源 MiMo-7B 系列,包括 Base、SFT、RL-Zero 和 RL 的Checkpoint.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: MiMo-7B 的核心假设是&quot;推理模型的有效性依赖于基座模型固有的推理潜力&quot;.这一观点挑战了当时的主流认知——即 RL 后训练可以弥补任何基座模型的不足.小米团队证明,通过在预训练阶段注入高密度的推理模式(三阶段数据混合 + 合成推理数据),即使是 7B 的小模型也能拥有超越 32B 模型的推理潜力.这暗示了一个被低估的事实:模型规模并非推理能力的唯一决定因素,训练数据的&quot;推理密度&quot;同样关键.</p>
</blockquote>
<hr>
<h2 id="1-yy">1. 引言</h2>
<p>具备高级推理能力的大型语言模型,如 OpenAI o 系列、DeepSeek-R1 和 Claude 3.7,已在数学推理和代码生成等复杂任务上取得了显著性能.通过大规模强化学习(RL),这些模型发展出复杂的推理模式,包括逐步分析、自我反思和回溯,使其能够在多样化领域实现更稳健和准确的问题解决能力.这一新兴范式代表了人工智能应对复杂挑战的重大进步.</p>
<p>目前,大多数成功的 RL 工作,包括开源研究,都依赖相对较大的基座模型,例如 32B 模型,特别是在增强代码推理能力方面.此外,业界普遍认为在小型模型中同时实现数学和代码能力的统一提升是困难的.尽管如此,团队相信 RL 训练推理模型的有效性依赖于基座模型固有的推理潜力.为充分解锁语言模型的推理潜力,努力必须不仅聚焦于后训练,还需聚焦于针对推理定制的预训练策略.</p>
<p>本工作呈现 MiMo-7B,一个从头训练、专为推理任务而生的模型系列.从 MiMo-7B-Base 进行的 RL 实验表明,该模型具备非凡的推理潜力,甚至超越了规模大得多的 32B 模型.此外,团队在冷启动的 SFT 模型上执行 RL 训练,得到 MiMo-7B-RL,其在数学和代码推理任务上展现出优越性能,超越了 OpenAI o1-mini 的表现.</p>
<blockquote>
<p><strong>思考节点-谱系影响</strong>: MiMo-7B 的发布时间是 2025 年 4 月,正值 DeepSeek-R1 引发全球推理模型热潮之后.与 R1 依赖 32B 基础模型不同,MiMo-7B 选择了 7B 这一&quot;小模型&quot;路线.这不是简单的参数缩减,而是对&quot;推理能力是否可以被压缩到小模型中&quot;这一问题的直接回答.后续 MiMo-V2-Flash 和 MiMo-V2.5 的发布(分别基于更大的 MoE 架构)表明,MiMo-7B 是小米大模型 Core 团队的&quot;概念验证&quot;——先证明小模型推理的可行性,再扩展到更大规模的架构.</p>
</blockquote>
<hr>
<h2 id="2-yxl">2. 预训练</h2>
<h3 id="2-1-yxlsj">2.1 预训练数据</h3>
<p>MiMo-7B 的预训练语料整合多样化来源,包括网页、学术论文、书籍、编程代码和合成数据.团队认为在预训练阶段纳入更多具有高质量推理模式的数据可以显著增强所得语言模型的推理潜力.为实现这一目标,首先优化自然文本预处理流程以提高质量,最重要的是提升推理数据密度;其次利用高级推理模型生成大规模合成推理数据;最后实施三阶段数据混合策略以最大化模型在各任务和领域的推理潜力.</p>
<p><strong>更好的推理数据提取</strong>.网页天然包含高推理模式密度的内容,如编程教程和数学博客.然而,团队发现常用的提取器(如 Trafilatura)往往无法保留嵌入网页中的数学公式和代码片段.为解决此限制,团队开发了专门针对数学内容、代码块和论坛网站的新型 HTML 提取工具.对于论文和书籍,增强 PDF 解析工具包以更好地处理 STEM 和代码内容.通过这些优化的提取工具,成功保留了大量推理模式供后续处理.</p>
<p><strong>快速全局去重</strong>.数据去重在提高训练效率和减少过拟合方面发挥重要作用.团队在所有网页 dump 上采用 URL 去重和 MinHash 去重.通过极致的工程优化,可在一天内完成此全局去重过程.由于去重算法对高质量和低质量文本一视同仁而不具备内容感知能力,团队随后根据多维度质量评分调整最终数据分布.</p>
<p><strong>多维度数据过滤</strong>.高质量且富含推理模式的预训练数据对于开发强推理能力模型至关重要.团队发现常用的启发式规则过滤器会错误地过滤包含大量数学和代码内容的高质量网页.为解决此限制,团队改为微调小型 LLM 作为数据质量标注器,执行领域分类和多维度质量评估.</p>
<p><strong>合成推理数据</strong>.推理模式的另一关键来源是由高级推理模型生成的合成数据.团队采用多种策略生成多样化的合成推理响应.首先,选择标注为高推理深度的 STEM 内容,并提示模型基于源材料发展深刻分析和深入思考.其次,收集数学和代码问题并提示推理模型解决.此外,纳入通用领域查询,特别是创意写作任务.值得注意的是,初步实验揭示,与非推理数据不同,合成推理数据可以训练极多个 epoch 而不存在过拟合风险.</p>
<p><strong>三阶段数据混合</strong>.为优化预训练数据分布,团队在最终模型训练中采用三阶段数据混合策略:</p>
<ul>
<li><strong>阶段 1</strong>: 纳入除推理任务查询的合成响应外的所有数据源.对过度代表的内容(如广告、新闻、招聘启事)以及知识和推理密度不足的材料进行下采样.同时上采样来自专业领域的高质量数据.</li>
<li><strong>阶段 2</strong>: 在阶段 1 策划分布的基础上,显著增加数学和代码相关数据至混合的 70%.此方法预期增强专项技能而不损害通用语言能力.前两个阶段使用 8,192 token 的上下文长度训练.</li>
<li><strong>阶段 3</strong>: 为提升解决复杂任务的能力,进一步纳入 10% 的数学、代码和创意写作查询的合成响应.同时将上下文长度从 8,192 扩展到 32,768.</li>
</ul>
<p>通过此过程,构建了包含约 25 万亿 token 的大型高质量预训练数据集.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: 三阶段数据混合策略中的&quot;阶段 2 将数学和代码提升到 70%&quot;是一个大胆的决策.大多数基座模型的预训练数据混合中,数学和代码通常只占 10-20%.将这一比例提升到 70% 意味着模型在预训练期间几乎完全沉浸于推理密集型内容.这解释了为什么 MiMo-7B-Base 在 LiveCodeBench 和 AIME 上的 pass@1 分数(32.9 和 32.9)远超同规模模型(Qwen2.5-7B 为 5.0 和 4.3).但代价是通用语言能力可能受损——MMLU 71.2 与 Qwen2.5-7B 的 74.2 相比略有下降,说明推理密度与通用知识之间存在权衡.合成推理数据&quot;可训练极多个 epoch 不过拟合&quot;的发现也很关键:这意味着推理模式具有高度可压缩性,与小模型有限容量的担忧形成对比.</p>
</blockquote>
<h3 id="2-2-mxjg">2.2 模型架构</h3>
<p>MiMo-7B 遵循通用的 decoder-only Transformer 架构,包含 GQA(Grouped-Query Attention)、pre-RMSNorm、SwiGLU 激活函数和 RoPE(Rotary Positional Embedding),与 Llama 和 Qwen 类似.</p>
<p>推理模型常面临推理速度瓶颈,因为尽管连续 token 之间的高相关性和可预测性,其冗长的自回归生成过程仍然存在.</p>
<p><strong>MTP 模块</strong>.受 DeepSeek-V3 启发,团队将 Multi-Token Prediction(MTP)作为额外训练目标纳入.此方法使模型能够策略性地预规划并生成有助于更准确且潜在更快预测未来 token 的表示.如图 2 所示,预训练和推理采用不同的 MTP 设置.预训练期间仅使用单个 MTP 层,因为初步研究表明多个 MTP 层没有进一步改进.相反,团队发现多个并行 MTP 层通过投机解码显著加速推理.为实现此目标,预训练后将预训练的单层 MTP 复制为两个相同副本.然后,在冻结主模型和第一层 MTP 的情况下,微调两个新的 MTP 层以加速推理.</p>
<p><strong>MTP 推理加速</strong>.推理时,这些 MTP 层可用于投机解码以降低生成延迟.团队在 AIME24 基准上评估了 MTP 层的性能.第一层 MTP 实现了约 90% 的 remarkably high 接受率,即使第三层 MTP 也保持 75% 以上的接受率.这一高接受率使 MiMo-7B 能够提供增强的解码速度,特别是在需要极长输出的推理场景中.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: MTP 的训练-推理分离设计值得注意.预训练时只用单层 MTP(因为多层无额外收益),推理时复制成多层用于投机解码.这是&quot;训练-推理解耦&quot;的典型实践:训练阶段追求模型质量,推理阶段追求吞吐量.90% 的第一层接受率在 7B 模型上是非常高的数字,说明推理模型生成的 token 序列具有高度可预测性——这与传统认知中&quot;推理需要创造性跳跃&quot;的直觉相反.实际上,推理过程的大部分步骤是模式化的(如&quot;让我们检查这一步&quot;、&quot;另一种方法是&quot;),这些正是 MTP 擅长预测的内容.不过,这种高度结构化的输出也可能带来&quot;模板化推理&quot;的风险.</p>
</blockquote>
<h3 id="2-3-ccs">2.3 超参数</h3>
<p><strong>模型超参数</strong>: Transformer 层数 36, hidden dimension 4,096, FFN 中间 hidden dimension 11,008, 注意力头数 32, KV group 数 8.</p>
<p><strong>训练超参数</strong>: 优化器使用 AdamW, beta1=0.9, beta2=0.95, weight decay 0.1.梯度裁剪最大范数 1.0.</p>
<p>前两个预训练阶段的最大序列长度为 8,192 token,RoPE base 为 10,000.阶段 3 将这些参数扩展到 32,768 token 和 640,000.学习率调度:阶段 1 线性 warmup 从 0 到 1.07e-4 覆盖前 84B token,随后恒定 1.07e-4 覆盖 10.2T token,最后 cosine decay 至 3e-5 覆盖 7.5T token.此 3e-5 的速率在阶段 2(4T token)和阶段 3 的前 1.5T token 中保持.随后学习率通过 cosine 调度 decay 至 1e-5 覆盖最后 500B token.</p>
<p>Batch size 线性 warmup 至 2,560 覆盖前 168B token,并在阶段 1 和阶段 2 的剩余部分保持此值.阶段 3 中 batch size 固定为 640.</p>
<p>MTP loss weight: 前 10.3T token 设为 0.3,预训练剩余部分降至 0.1.</p>
<h3 id="2-4-yxlpg">2.4 预训练评估</h3>
<h4 id="2-4-1-pgsz">2.4.1 评估设置</h4>
<p>团队在系列基准上评估 MiMo-7B-Base,涵盖自然语言理解与推理、科学问答、阅读理解、数学推理、代码、中文理解和长上下文理解:</p>
<ul>
<li>语言理解与推理: BBH, MMLU, MMLU-Redux, MMLU-Pro, ARC, HellaSwag, PIQA</li>
<li>闭卷问答: TriviaQA, NaturalQuestions</li>
<li>科学问答: GPQA, SuperGPQA</li>
<li>阅读理解: DROP, RACE</li>
<li>数学推理: AIME, GSM8K, MATH</li>
<li>代码: LiveCodeBench, HumanEval, HumanEval+, MBPP, MBPP+, CRUXEval</li>
<li>中文: C-Eval, CMMLU</li>
<li>长上下文: RULER</li>
</ul>
<p>与同等规模的开源基座模型比较,包括 Llama-3.1-8B、Gemma-2-9B 和 Qwen2.5-7B.所有模型使用相同的评估设置.</p>
<h4 id="2-4-2-tlnlsx">2.4.2 推理能力上限</h4>
<p>传统评估方法往往通过单遍成功率或多采样平均性能低估模型的真实推理潜力.遵循 Yue et al.(2025),团队采用 pass@k 指标——若 k 个采样解中任一正确则认为问题解决——以更好评估不同模型的推理能力边界.MiMo-7B-Base 在所有基准和评估的 k 值上均取得显著高于所有对比模型的 pass@k 分数,包括 32B 基线.值得注意的是,随着 k 增加,MiMo-7B-Base 与其他基线的性能差距稳步扩大,尤其在 LiveCodeBench 上.这些结果证明了 MiMo-7B-Base 优越的推理潜力,为 RL 训练建立了强基座策略.</p>
<h4 id="2-4-3-pgjg">2.4.3 评估结果</h4>
<table>
<thead>
<tr>
<th>基准</th>
<th>Llama-3.1 8B</th>
<th>Gemma-2 9B</th>
<th>Qwen2.5 7B</th>
<th>MiMo-7B</th>
</tr>
</thead>
<tbody><tr>
<td>BBH</td>
<td>64.2</td>
<td>69.4</td>
<td>70.4</td>
<td><strong>75.2</strong></td>
</tr>
<tr>
<td>MMLU</td>
<td>65.3</td>
<td>71.2</td>
<td>74.2</td>
<td>71.2</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>37.1</td>
<td>44.7</td>
<td>45.0</td>
<td>41.9</td>
</tr>
<tr>
<td>GPQA-Diamond</td>
<td>33.3</td>
<td>24.2</td>
<td>35.4</td>
<td>25.8</td>
</tr>
<tr>
<td>SuperGPQA</td>
<td>19.9</td>
<td>22.6</td>
<td>24.6</td>
<td><strong>25.1</strong></td>
</tr>
<tr>
<td>DROP</td>
<td>59.5</td>
<td>67.9</td>
<td>61.5</td>
<td><strong>69.2</strong></td>
</tr>
<tr>
<td>AIME 2024</td>
<td>0.3</td>
<td>0.0</td>
<td>10.1</td>
<td><strong>32.9</strong></td>
</tr>
<tr>
<td>AIME 2025</td>
<td>0.0</td>
<td>0.0</td>
<td>4.3</td>
<td><strong>24.3</strong></td>
</tr>
<tr>
<td>GSM8K</td>
<td>48.5</td>
<td>70.2</td>
<td>80.2</td>
<td>75.2</td>
</tr>
<tr>
<td>MATH</td>
<td>16.9</td>
<td>36.4</td>
<td>44.3</td>
<td>37.4</td>
</tr>
<tr>
<td>LiveCodeBench v5</td>
<td>0.4</td>
<td>0.0</td>
<td>5.0</td>
<td><strong>32.9</strong></td>
</tr>
<tr>
<td>HumanEval</td>
<td>37.8</td>
<td>41.5</td>
<td>56.7</td>
<td>51.8</td>
</tr>
<tr>
<td>MBPP</td>
<td>58.4</td>
<td>63.9</td>
<td>76.7</td>
<td>69.2</td>
</tr>
<tr>
<td>C-Eval</td>
<td>52.2</td>
<td>57.0</td>
<td>81.8</td>
<td>68.7</td>
</tr>
<tr>
<td>CMMLU</td>
<td>52.1</td>
<td>58.4</td>
<td>82.7</td>
<td>70.9</td>
</tr>
</tbody></table>
<p><strong>通用推理</strong>: MiMo-7B-Base 在通用知识和推理方面表现优越,超越同等规模的开源模型.BBH 上得分 75.2,超越 Qwen2.5-7B 约 5 分.SuperGPQA 结果显示模型解决研究生级别问题的稳健能力.DROP 上超越对比模型,展现先进的语言理解能力.</p>
<p><strong>代码与数学推理</strong>: MiMo-7B-Base 在代码和数学任务上展现出强熟练度.LiveCodeBench v5 上得分 32.9,远超 Llama-3.1-8B 和 Qwen-2.5-7B.AIME 2024 上达到 32.9,显著优于其他同等规模基座模型.这些结果凸显了 MiMo-7B-Base 非凡的问题解决能力和复杂推理任务的巨大潜力.</p>
<p><strong>长上下文理解</strong>: 对于关注长上下文检索的 needle-in-a-haystack(NIAH)任务,团队聚合不同深度和上下文长度的准确率.MiMo-7B 在 32K 上下文窗口内的所有位置均实现近乎完美的检索性能.超越纯检索,MiMo-7B 在需要长上下文推理的任务上表现出色,包括 Common Words Extraction(CWE)、Frequent Words Extraction(FWE)和 Variable Tracking(VT).它在大多数场景中超越 Qwen2.5-7B.这些结果验证了预训练期间纳入多样化高质量推理模式数据策略的有效性.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: MiMo-7B-Base 的评估结果呈现一个鲜明的&quot;偏科&quot;特征:在推理密集型任务(BBH +5, AIME 2024 +22.8, LiveCodeBench v5 +27.9)上碾压同规模模型,但在通用知识任务(MMLU 71.2 vs Qwen2.5-7B 74.2, C-Eval 68.7 vs 81.8)上落后.这不是缺陷,而是有意为之的设计选择——通过牺牲部分通用知识能力来最大化推理潜力.对于专注于推理场景的下游应用(如代码助手、数学求解器),这种权衡是合理的.但对于需要广泛世界知识的通用对话场景,MiMo-7B-Base 可能不是最佳选择.pass@k 曲线显示随着 k 增加,性能差距扩大,说明模型的&quot;推理上限&quot;非常高,只是单遍采样时未能充分触及.</p>
</blockquote>
<hr>
<h2 id="3-hxl">3. 后训练</h2>
<h3 id="3-1-jdwt">3.1 监督微调</h3>
<p><strong>SFT 数据</strong>: SFT 数据由开源和专有蒸馏数据组合而成.为确保最佳质量和多样性,实施三阶段预处理流水线.首先,消除与评估基准存在 16-gram 重叠的所有训练查询以防止数据泄漏.然后,排除语言混合或响应不完整的样本.最后,将每查询的响应数上限设为 8,在保留多样性和防止冗余之间取得平衡.经此预处理,最终 SFT 数据集包含约 500K 样本.</p>
<p><strong>SFT 超参数</strong>: 使用恒定学习率 3e-5 和 batch size 128 微调 MiMo-7B-Base.训练期间样本打包至最大长度 32,768 token.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: SFT 数据仅 500K 样本,相对于 7B 模型来说是一个非常小的数据集.后续消融实验(表 6)显示,将 SFT 数据从 500K 扩展到 6M 显著提升了推理和对话能力.这说明 500K 的 SFT 规模是&quot;够用但不足&quot;的——足以让模型学会答案格式和基本对话,但不足以充分激发预训练阶段积累的推理潜力.这与 DeepSeek-R1 报告中&quot;SFT 数据应精简以避免限制 RL 探索空间&quot;的观点形成有趣对比:MiMo-7B 的实验暗示,对于 7B 小模型,更多的 SFT 数据不仅不会限制 RL,反而能为 RL 提供更好的初始化.</p>
</blockquote>
<h3 id="3-2-rl-sjch">3.2 RL 数据策划</h3>
<p>团队利用两类可验证问题——数学和代码——构建 RL 训练数据.初步研究表明,高质量问题集在稳定 RL 训练过程和进一步提升 LLM 推理能力方面发挥关键作用.</p>
<p><strong>数学数据</strong>: 数学问题集来自多样化来源,包括开源数据集和专有收集的竞赛级集合.为缓解奖励 hacking 风险,使用 LLM 过滤证明型和选择题.与近期修改问题以确保整数答案的方法不同,团队保留原始问题以最小化奖励 hacking.此外,执行全局 n-gram 去重,并仔细与评估基准进行数据去污染.</p>
<p>基于模型的难度评估用于进一步提升数据集质量.首先,过滤掉高级推理模型无法解决的问题,识别出过于困难或包含错误答案的问题.对于剩余问题,对 SFT 版 MiMo-7B 执行 16 次 rollout,消除通过率达 90% 的问题.此过程从原始问题集中移除了约 50% 的容易问题.数据清洗后,建立包含 100K 问题的数学训练集.</p>
<p><strong>代码数据</strong>: 对于代码问题,策划包含开源数据集和新收集问题集的高质量训练集.移除无测试用例的问题.对于有黄金解的问题,排除黄金解未通过所有测试用例的问题.对于无黄金解的问题,丢弃在高级推理模型 16 次 rollout 中无法解决任何测试用例的问题.与数学数据类似,使用 SFT 版 MiMo-7B 过滤在所有 16 次 rollout 中完全解决的容易问题.此严格清洗流程产出 30K 代码问题.</p>
<p>在每次 RL 迭代中,评估数千道问题以计算奖励,每道问题可能包含数百个测试用例.为提高奖励计算效率并消除 GPU 空闲时间,团队开发了在线判题环境,支持极高吞吐量单元测试的并行执行.</p>
<p><strong>奖励函数</strong>: 训练过程中仅使用基于规则的准确率奖励.数学数据使用规则型 Math-Verify 库评估响应正确性.代码问题采用 test difficulty driven reward(详见 3.3.1 节).未纳入额外奖励,如格式奖励和长度惩罚奖励.</p>
<h3 id="3-3-rl-xlpf">3.3 RL 训练配方</h3>
<p>团队采用改进版的 GRPO(Group Relative Policy Optimization),并纳入研究社区近期提出的改进.对于每个问题 q,算法从旧策略 pi_old 采样一组响应 {o1, o2, ..., oG},通过最大化以下目标更新策略 pi:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>J</mi><mrow><mi>G</mi><mi>R</mi><mi>P</mi><mi>O</mi></mrow></msub><mo stretchy="false">(</mo><mi>π</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>E</mi><mrow><mi>q</mi><mo separator="true">,</mo><mo stretchy="false">{</mo><msub><mi>o</mi><mi>i</mi></msub><mo stretchy="false">}</mo></mrow></msub><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mrow><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><mi mathvariant="normal">∣</mi><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi></mrow></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi mathvariant="normal">∣</mi><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi></mrow></munderover><mi>min</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo separator="true">,</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo separator="true">,</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><mtext>clip</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo separator="true">,</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo separator="true">,</mo><msub><mi>o</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo separator="true">,</mo><mn>1</mn><mo>−</mo><msub><mi>ϵ</mi><mrow><mi>l</mi><mi>o</mi><mi>w</mi></mrow></msub><mo separator="true">,</mo><mn>1</mn><mo>+</mo><msub><mi>ϵ</mi><mrow><mi>h</mi><mi>i</mi><mi>g</mi><mi>h</mi></mrow></msub><mo fence="true">)</mo></mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">J_{GRPO}(\\pi) = E_{q,\\{o_i\\}} \\left[ \\frac{1}{\\sum_{i=1}^G |o_i|} \\sum_{i=1}^G \\sum_{t=1}^{|o_i|} \\min\\left( \\frac{\\pi_\\theta(o_{i,t}|q,o_{i,&lt;t})}{\\pi_{old}(o_{i,t}|q,o_{i,&lt;t})} \\hat{A}_{i,t}, \\text{clip}\\left(\\frac{\\pi_\\theta(o_{i,t}|q,o_{i,&lt;t})}{\\pi_{old}(o_{i,t}|q,o_{i,&lt;t})}, 1-\\epsilon_{low}, 1+\\epsilon_{high}\\right) \\hat{A}_{i,t} \\right) \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0962em;">J</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0962em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0077em;">GR</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.6em;vertical-align:-1.55em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mpunct mtight">,</span><span class="mopen mtight">{</span><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">}</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.05em;"><span class="pstrut" style="height:5.6em;"></span><span style="width:0.667em;height:3.6em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.667em" height="3.6em" viewBox="0 0 667 3600"><path d="M403 1759 V84 H666 V0 H319 V1759 v0 v1759 h347 v-84
H403z M403 1759 V0 H319 V1759 v0 v1759 h84z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.1288em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9812em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1709em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.961em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.386em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">∣</span><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight">∣</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">min</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">clip</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">hi</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.05em;"><span class="pstrut" style="height:5.6em;"></span><span style="width:0.667em;height:3.6em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.667em" height="3.6em" viewBox="0 0 667 3600"><path d="M347 1759 V0 H0 V84 H263 V1759 v0 v1759 H0 v84 H347z
M347 1759 V0 H263 V1759 v0 v1759 h84z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span></span></span></span></span></span><p>其中 epsilon_low 和 epsilon_high 为超参数.hat_A_{i,t} 是优势,由同组响应的奖励 {r1, r2, ..., rG} 计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>j</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mi>j</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\hat{A}_{i,t} = \\frac{r_i - \\text{mean}(\\{r_j\\}_{j=1}^G)}{\\text{std}(\\{r_j\\}_{j=1}^G)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2329em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7522em;vertical-align:-1.1261em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6261em;"><span style="top:-2.2869em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">std</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8231em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.413em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7848em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">mean</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4413em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1261em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>在原始 GRPO 算法基础上,团队纳入几项近期研究的增强:</p>
<ul>
<li><strong>移除 KL Loss</strong>(He et al., 2025; Hu et al., 2025): 简单移除 KL loss 可有效释放策略模型的全部潜力,且不损害训练稳定性.</li>
<li><strong>Dynamic Sampling</strong>(Yu et al., 2025): 在 RL rollout 阶段,过采样并过滤掉通过率为 1 和 0 的 prompt,使批次中所有 prompt 都具有有效梯度,同时保持一致的 batch size.此策略自动校准策略训练期间的问题难度.</li>
<li><strong>Clip-Higher</strong>(Yu et al., 2025): 提高上界裁剪边界 epsilon_high,固定下界裁剪边界 epsilon_low.可缓解熵收敛问题并促进策略探索新解.</li>
</ul>
<p>训练期间,团队识别出影响模型性能的两个关键挑战:代码问题的稀疏奖励和 dynamic sampling 的采样效率下降.因此,提出 test complexity driven reward 函数和 easy data re-sampling 方法.</p>
<h4 id="3-3-1-test-difficulty-driven-reward">3.3.1 Test Difficulty Driven Reward</h4>
<p>目前,对于算法代码生成任务,现有 RL 工作(如 DeepSeek-R1)采用基于规则的奖励策略,只有当生成代码通过给定问题的所有测试用例时才会获得奖励.然而,对于困难的算法问题,模型可能永远收不到任何奖励,阻止其从这些挑战性案例中学习并降低 dynamic sampling 的训练效率.</p>
<p><strong>IOI 评分规则的启示</strong>.为应对此限制,团队提出新的奖励机制: test difficulty driven reward.设计灵感来自国际信息学奥林匹克(IOI)的评分规则.在 IOI 竞赛中,每道完整题目分为多个子任务,参与者成功完成每个子任务即可获得分数.每个子任务包含不同难度的测试.为子任务分配不同分数更好地反映了人类解决问题的方式.对于挑战性题目,模型仍可通过解决部分子任务获得部分分数,从而在训练期间更好地利用这些困难示例.</p>
<p><strong>基于通过率为测试分配难度</strong>.团队提出一种基于难度对测试用例进行分组的技术.利用多个模型对每个问题进行多次 rollout,计算每个测试用例在所有模型生成解中的通过率.然后根据通过率将测试用例聚类到不同难度级别,较低通过率表示较高难度.</p>
<p><strong>奖励规则</strong>.将测试分类到不同难度级别后,设计两种基于这些难度级别的奖励方案:</p>
<ul>
<li><strong>Strict Reward</strong>: 在严格奖励方案下,只有当解通过某难度组的所有测试以及所有更低难度组的所有测试时,才获得该难度级别的对应奖励.</li>
<li><strong>Soft Reward</strong>: 在软奖励方案下,将每组的总分均等地分配给组内测试.最终奖励为所有通过测试的分数之和.</li>
</ul>
<p>实验比较显示,两种奖励方案均优于无 test difficulty driven reward 的基线.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: Test Difficulty Driven Reward 是 MiMo-7B 后训练中最具原创性的算法贡献.其核心洞察是:对于困难算法问题,&quot;全对或全错&quot;的二元奖励过于稀疏,导致模型在 RL 早期阶段几乎无法从这些题目中获得学习信号.借鉴 IOI 的子任务评分机制,将测试用例按难度分层,使模型即使只通过部分简单测试也能获得部分奖励.这与教育心理学中的&quot;支架式学习&quot;(scaffolding)理念一致:先学会解决简单子问题,再逐步攻克困难子问题.Strict 和 Soft 两种方案的差异在于:Strict 要求&quot;逐层解锁&quot;,更强调解题的系统性;Soft 允许&quot;跳过&quot;低难度组直接获得高分测试的奖励,更灵活但可能鼓励&quot;偏科&quot;.实验显示两种方案均有效,说明分层的核心思想(而非具体实现)才是提升训练效率的关键.</p>
</blockquote>
<h4 id="3-3-2-easy-data-filter-and-re-sampling">3.3.2 Easy Data Filter and Re-Sampling</h4>
<p>RL 训练期间,随着策略改进,越来越多的问题达到完美通过率 1.在 dynamic sampling 机制下,这些问题从策略更新的批次中被过滤.此过滤导致采样效率急剧下降,因为需要更多 rollout 才能构建固定大小的批次.直接解决此效率问题的简单方法是完全移除完美通过率的问题.然而,初步研究表明此方法会引入策略更新的显著不稳定性.</p>
<p>为在不冒策略崩溃风险的情况下提高采样效率,团队开发了 easy data resampling 策略.训练过程中维护一个 easy data pool,存储完美通过率的问题.执行 rollout 时,有概率 p(实验中 10%)从此 easy data pool 采样数据.此策略有效稳定策略更新同时提高采样效率,尤其在 RL 训练的后期阶段.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: Easy Data Re-Sampling 解决的是 RL 训练中一个鲜少被讨论但实际非常关键的问题:当策略变强后,大部分训练数据变得&quot;太简单&quot;而被 dynamic sampling 过滤,导致有效 batch size 急剧缩小.完全移除简单数据会导致策略崩溃(可能是因为模型忘记了如何处理简单问题,或者简单问题中仍包含重要的模式).10% 的重采样概率是一个经验值:足够小以避免训练被简单数据主导,又足够大以维持策略稳定性.这种&quot;保留一小部分简单数据作为锚点&quot;的策略,与课程学习(curriculum learning)中&quot;不时回顾基础&quot;的做法异曲同工.</p>
</blockquote>
<h4 id="3-3-3-ccs">3.3.3 超参数</h4>
<p>实验中使用训练 batch size 512,actor mini-batch size 32.每训练迭代执行 16 次梯度更新,学习率 1e-6.最大序列长度设为 32,768 token 以支持复杂推理任务.训练期间 temperature 和 top-p 均设为 1.0 以促进输出多样性.</p>
<h3 id="3-4-rl-jcss">3.4 RL 基础设施</h3>
<p>团队开发 Seamless Rollout Engine 并增强 vLLM 的稳健性,以实现高效的基于 dynamic sampling 的 RL 训练.RL 系统基于 verl 构建,使用 Ray 管理计算和通信,在 Ray Actors 中实现 rollout 和训练阶段,并通过 Ray Objects 交换训练数据.尽管 verl 支持各种 RL 算法的灵活实现,但在 rollout 和奖励计算阶段均存在 GPU 空闲时间.由于响应长度的偏斜,团队观察到大部分 GPU 在等待少数长序列 rollout worker 完成时保持空闲,导致计算资源浪费和训练过程缓慢.此前工作已识别此问题并提出系统级解决方案,但大多数方案依赖异步训练,修改底层算法并引入长序列响应的 staleness.基于规则的奖励计算也耗时,尤其代码数据,导致宝贵 GPU 资源的空闲期.团队使用的 dynamic sampling 虽然提高了样本效率,但加剧了 GPU 空闲时间,并在多轮 rollout 中导致浪费样本.为同时优化 GPU 利用率和减少样本浪费,团队开发 Seamless Rollout Engine,在执行异步奖励计算的同时 opportunistically 将样本批次填入 rollout.系统基于 vLLM 推理引擎构建,并与开源社区合作增强 vLLM 在 verl 框架内&quot;external launch&quot;模式的稳健性.此外,在 vLLM 中实现 MTP 以支持 MiMo-7B 和 MiMo-7B-RL.</p>
<h4 id="3-4-1-seamless-rollout-engine">3.4.1 Seamless Rollout Engine</h4>
<p>Seamless Rollout Engine 通过高效的任务调度优化 rollout worker 中的 GPU 利用率,在连续运行中最小化空闲时间.引擎包含以下组件:</p>
<p><strong>(a) Continuous Rollout</strong>.引擎的核心在于主动处理已完成的 rollout 任务并启动新的 rollout.与 naive dynamic sampling 实现延迟奖励计算直到所有 rollout worker 完成不同,Seamless Rollout Engine 消除生成与奖励阶段之间的同步屏障.它主动监控完成的 worker,立即计算其奖励,并按需触发新的 rollout.计算奖励后,更新有效样本数和当前步的通过率统计,然后如果这些统计表明活跃任务不足以满足训练需求,则启动新的 rollout 任务.</p>
<p><strong>(b) Asynchronous Reward Computation</strong>.数学数据的奖励计算迅速,但代码相关数据的判题开销显著,导致 GPU 空闲时间延长.此外,naive 顺序奖励计算的特性无法利用现代处理单元的多进程能力.为解决这些问题,使用 Ray 启动异步奖励计算,促进 rollout 和奖励任务的并发管理.任务完成后,系统动态转发 rollout 输出进行奖励评估或聚合结果以更新样本状态.为代码特定奖励计算分配专用服务器,防止 rollout 流水线的瓶颈.</p>
<p><strong>(c) Early Termination</strong>.当有效样本数超过所需训练 batch size 时,对进行中的任务进行谨慎管理至关重要.突然终止进行中的任务倾向于抑制长序列响应的生成,可能 destabilize RL 训练动态.一个直接方案是等待所有活跃任务完成,然后从输出中随机采样所需 batch.然而,如果长序列 rollout 在 dynamic sampling 阶段末期启动,此方法可能延长等待时间.为在保留数据分布完整性的同时缓解此延迟,团队实现 first-in-first-out 选择策略.仅当有效样本数满足 batch 需求且所有在这些选中样本之前启动的任务均已完成时,才终止进行中的任务.</p>
<table>
<thead>
<tr>
<th>方法</th>
<th>Overall Speedup</th>
<th>Rollout Speedup</th>
<th>Normalized GPU Idle Time</th>
<th>GPU Idle Ratio</th>
<th>Sample Waste Ratio</th>
</tr>
</thead>
<tbody><tr>
<td>w/o Dynamic Sampling</td>
<td>2.45x</td>
<td>2.82x</td>
<td>0.36</td>
<td>70.8%</td>
<td>/</td>
</tr>
<tr>
<td>Naive Dynamic Sampling</td>
<td>1.00x</td>
<td>1.00x</td>
<td>1.00</td>
<td>69.3%</td>
<td>22.1%</td>
</tr>
<tr>
<td>+ Continuous Rollout</td>
<td>1.99x</td>
<td>2.20x</td>
<td>0.25</td>
<td>38.8%</td>
<td>13.9%</td>
</tr>
<tr>
<td>+ Async. Reward</td>
<td>2.09x</td>
<td>2.34x</td>
<td>0.21</td>
<td>34.0%</td>
<td>16.4%</td>
</tr>
<tr>
<td>+ Early Termination</td>
<td><strong>2.29x</strong></td>
<td><strong>2.61x</strong></td>
<td><strong>0.15</strong></td>
<td><strong>27.7%</strong></td>
<td><strong>12.9%</strong></td>
</tr>
</tbody></table>
<p>实验在 256 张 H20 GPU 上进行.三个组件均对更快的 dynamic sampling 和更小的 GPU 空闲时间有贡献.尽管无 dynamic sampling 的实验可实现更高吞吐,但由于大量零梯度训练样本而产生显著的样本低效.在平均样本通过率 41% 的 5 步实验中,静态采样实现与 naive dynamic sampling 相似的样本效率;后者不训练零梯度数据但产生浪费样本.配备所有三个组件的 Seamless Rollout Engine 实现与静态采样相当的一步训练时间,同时展现优越的样本效率.</p>
<p><strong>加速验证</strong>.验证期间,可直接使用 Seamless Rollout Engine 流式传输 rollout 和奖励任务.与 naive 实现类似,当前将验证 batch size 设为数据集长度并同时启动所有 rollout 任务.实现利用异步奖励计算,实现 1.96x 加速,同时将空闲 GPU 时间降至 25%.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: Seamless Rollout Engine 是 MiMo-7B 报告中最具工程价值的部分之一.它解决的不是算法问题,而是系统问题:在 dynamic sampling 场景下,如何消除 GPU 空闲时间.三个组件的设计各自针对不同的瓶颈:</p>
</blockquote>
<ul>
<li>Continuous Rollout 解决&quot;长 tail 等待&quot;问题——少数长序列 worker 拖慢整个 batch</li>
<li>Async Reward Computation 解决&quot;顺序判题&quot;问题——代码测试的串行执行浪费并行能力</li>
<li>Early Termination 解决&quot;过度生成&quot;问题——batch 已满足后继续生成长序列是浪费</li>
</ul>
<p>从表 2 的数据看,naive dynamic sampling 的 GPU idle ratio 高达 69.3%,几乎等同于无 dynamic sampling 的 70.8%——这说明 dynamic sampling 本身如果没有系统工程支撑,反而可能降低整体效率.Seamless Rollout Engine 将 idle ratio 降至 27.7%,sample waste ratio 从 22.1% 降至 12.9%.这些数字在 256 H20 GPU 的规模上意味着巨大的成本节省.值得注意的是,H20 是 NVIDIA 的特供版 H100(针对中国市场的合规版本),其算力和互联带宽与 H100 有差距,因此系统优化在此硬件上尤为重要.</p>
<h4 id="3-4-2-vllm-based-inference-engine">3.4.2 vLLM-based Inference Engine</h4>
<p>RL 系统采用 vLLM 作为推理引擎.为适应模型新特性,扩展了框架的额外功能.</p>
<p><strong>MTP 支持</strong>: 在 vLLM 中实现并开源了 MTP 支持,使 MTP 架构能够高效推理.</p>
<p><strong>更好的稳健性</strong>: 在 verl 中,vLLM 使用 external launch 模式部署,在某些场景下可能显示不稳定性.团队增强了引擎稳健性以解决这些问题:在 pre-emption 期间清除 prefix caching 中的已计算块以保持 KV-Cache 一致性;在增加 scheduler steps 数量时禁用异步输出处理以确保兼容性并优化性能.</p>
<h3 id="3-5-hxlpg">3.5 后训练评估</h3>
<h4 id="3-5-1-pgsz">3.5.1 评估设置</h4>
<p>团队在多样化基准上全面评估推理模型:</p>
<ul>
<li>语言理解与推理: MMLU-Pro</li>
<li>科学问答: GPQA Diamond(8 次重复平均), SuperGPQA</li>
<li>指令遵循: IFEval(8 次重复平均)</li>
<li>阅读理解: DROP</li>
<li>数学推理: MATH500, AIME 2024 和 AIME 2025(32 次重复平均)</li>
<li>代码: LiveCodeBench v5(20240801-20250201)和 LiveCodeBench v6(20250201-20250501)(8 次重复平均)</li>
</ul>
<p>评估期间,所有基准的采样 temperature 设为 0.6,top-p 0.95.数学推理、代码和科学问答基准的最大生成长度设为 32,768 token,其他基准设为 8,192 token.</p>
<p>对比基线包括非推理模型 GPT-4o-0513、Claude-Sonnet-3.5-1022,以及推理模型 OpenAI-o1-mini、QwQ-32B-Preview、DeepSeek-R1-Distill-Qwen-14B 和 DeepSeek-R1-Distill-Qwen-7B.</p>
<h4 id="3-5-2-pgjg">3.5.2 评估结果</h4>
<table>
<thead>
<tr>
<th>模型</th>
<th>GPQA Diamond</th>
<th>SuperGPQA</th>
<th>DROP</th>
<th>MMLU-Pro</th>
<th>IFEval</th>
<th>MATH500</th>
<th>AIME 2024</th>
<th>AIME 2025</th>
<th>LCB v5</th>
<th>LCB v6</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4o 0513</td>
<td>49.9</td>
<td>42.4</td>
<td>83.7</td>
<td>72.6</td>
<td>84.3</td>
<td>74.6</td>
<td>9.3</td>
<td>11.6</td>
<td>32.9</td>
<td>30.9</td>
</tr>
<tr>
<td>Claude-3.5Sonnet</td>
<td>65.0</td>
<td>48.2</td>
<td>88.3</td>
<td>78.0</td>
<td>86.5</td>
<td>78.3</td>
<td>16.0</td>
<td>7.4</td>
<td>38.9</td>
<td>37.2</td>
</tr>
<tr>
<td>OpenAI o1-mini</td>
<td>60.0</td>
<td>45.2</td>
<td>83.9</td>
<td>80.3</td>
<td>84.8</td>
<td>90.0</td>
<td>63.6</td>
<td>50.7</td>
<td>53.8</td>
<td>46.8</td>
</tr>
<tr>
<td>QwQ-32B Preview</td>
<td>54.5</td>
<td>43.6</td>
<td>71.2</td>
<td>52.0</td>
<td>40.4</td>
<td>90.6</td>
<td>50.0</td>
<td>32.4</td>
<td>41.9</td>
<td>39.1</td>
</tr>
<tr>
<td>R1-Distill-Qwen-14B</td>
<td>59.1</td>
<td>40.6</td>
<td>85.5</td>
<td>68.8</td>
<td>78.3</td>
<td>93.9</td>
<td>69.7</td>
<td>48.2</td>
<td>53.1</td>
<td>31.9</td>
</tr>
<tr>
<td>R1-Distill-Qwen-7B</td>
<td>49.1</td>
<td>28.9</td>
<td>77.0</td>
<td>53.5</td>
<td>60.5</td>
<td>92.8</td>
<td>55.5</td>
<td>38.8</td>
<td>37.6</td>
<td>23.9</td>
</tr>
<tr>
<td><strong>MiMo-7B-RL</strong></td>
<td><strong>54.4</strong></td>
<td><strong>40.5</strong></td>
<td><strong>78.7</strong></td>
<td><strong>58.6</strong></td>
<td><strong>61.0</strong></td>
<td><strong>95.8</strong></td>
<td><strong>68.2</strong></td>
<td><strong>55.4</strong></td>
<td><strong>57.8</strong></td>
<td><strong>49.3</strong></td>
</tr>
</tbody></table>
<p>数学推理方面,MiMo-7B-RL 在同等参数规模模型中达到顶级性能,AIME 2024 上仅略低于 DeepSeek-R1-Distill-Qwen-14B.算法代码生成任务上,MiMo-7B-RL 展现出极为出色的结果.LiveCodeBench v5 上显著超越 OpenAI o1-mini,在最新的 LiveCodeBench v6 上得分 49.3%,超越 QwQ-32B-Preview 超过 10 分,展现其稳健稳定的能力.值得注意的是,MiMo-7B-RL 还保持强通用性能,超越 QwQ-32B-Preview 和 DeepSeek-R1-Distill-Qwen-7B,尽管 RL 仅纳入数学和代码问题.</p>
<p>团队还呈现不同版本 MiMo-7B 的评估结果(表 5).MiMo-7B-RL-Zero 从 MiMo-7B-Base 训练,而 MiMo-7B-RL 从 MiMo-7B-SFT 训练.RL 从基座模型展现出更强的增长趋势,例如 AIME 2024 上从 32.9% 提升至 56.4%.尽管如此,从 SFT 模型的 RL 训练达到更高的性能上限,在所有评估基准上取得最佳结果.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: MiMo-7B-RL 的评估结果揭示了几个重要发现.第一,从 Base 直接 RL(MiMo-7B-RL-Zero)的增长曲线更陡峭,说明强基座模型的探索空间更大;但从 SFT 初始化(MiMo-7B-RL)的最终天花板更高,说明格式对齐和基础策略质量对最终性能有显著影响.第二,MiMo-7B-RL 在仅使用数学和代码 RL 数据的情况下,通用能力(MMLU-Pro 58.6, IFEval 61.0)仍超越 QwQ-32B-Preview,说明推理能力的提升具有一定的迁移效应.第三,LiveCodeBench v6 上 49.3% 的分数意味着 MiMo-7B-RL 在代码推理上已达到与 o1-mini(46.8%)相当甚至超越的水平,这对于 7B 模型来说是突破性的.</p>
</blockquote>
<h3 id="3-6-tl">3.6 讨论</h3>
<p><strong>SFT for Format Alignment</strong>.从 MiMo-7B-Base 的初始 RL 训练步骤中,团队观察到模型主要学习适应答案提取函数,例如数学问题的 &quot;\\boxed{}&quot;.因此,团队调查了&quot;轻量&quot;SFT 以帮助基座模型对齐预期答案格式.然而,如图 7 所示,得到的 MiMo-7B-RL-LiteSFT 模型在推理潜力和最终性能上均失败.虽然 MiMo-7B-RL-LiteSFT 起步性能高于 MiMo-7B-RL-Zero,但仅在 500 步后就落后于基座模型的轨迹.此外,与经历&quot;更重&quot;SFT 的 MiMo-7B-RL 相比,MiMo-7B-RL-LiteSFT 展现出相似的增长趋势但显著表现不足,最终导致更差的结果.</p>
<blockquote>
<p><strong>思考节点-局限风险</strong>: 这个发现直接反驳了&quot;SFT 越少越好&quot;的流行观点.轻量 SFT(仅教答案格式)不仅没有帮助,反而限制了模型的最终表现.这可能是因为轻量 SFT 让模型过早收敛到一种&quot;表面正确但缺乏深度&quot;的策略,而 RL 需要在此基础上进行探索时,发现的空间被严重压缩.相比之下,&quot;更重&quot;的 SFT(500K 样本)教会了模型更丰富的推理模式,为 RL 提供了更好的起点.但这与 3.1 节中&quot;SFT 数据从 500K 扩展到 6M 显著提升性能&quot;的发现形成张力——SFT 应该足够&quot;重&quot;以提供良好初始化,但又不能过重以至于限制 RL 的探索.这个&quot;SFT 甜蜜点&quot;的精确位置可能需要针对每个模型规模单独调优.</p>
</blockquote>
<p><strong>不同领域之间的干扰</strong>.从 MiMo-7B-Base 的 RL 训练后期,维持数学和代码任务之间的性能平衡被证明具有挑战性.在训练步 2000 到 2500 之间,模型在代码问题上持续改善,而数学推理性能波动并下降.相比之下,冷启动 SFT 模型的 RL 训练在两个领域均显示一致改进.分析模型输出揭示,基座模型以其强探索能力倾向于对数学问题进行奖励 hacking.对于代码问题,基于测试用例的验证器使奖励 exploitation 显著更困难.这凸显了高质量数学问题集对于稳健 RL 训练的关键需求.</p>
<p><strong>语言混合惩罚</strong>.与 DeepSeek-R1-Zero 类似,团队在 MiMo-7B-Base 的 RL 训练中也观察到语言混合问题.为缓解此问题,在奖励函数中引入语言混合惩罚.然而,团队发现设计此类惩罚函数具有挑战性.虽然在英文响应中检测中文字符简单,但反向检测困难得多,因为数学公式和代码 inherently 包含英文单词.结果,惩罚不仅未能完全解决语言混合,还引入了奖励 hacking 的风险,例如无论问题语言如何都始终生成英文响应.</p>
<p><strong>SFT 数据规模的影响</strong>.基于初步实验,团队将 SFT 数据集从约 500K 显著扩展到 600 万实例.经验观察到,SFT 数据的这一大幅扩展显著提升了模型的推理能力和通用对话能力,且不损害后续 RL 的潜力.如表 6 所示,使用 600 万 SFT 实例训练的模型在数学推理、代码推理、科学推理和通用对话能力等方面均展现出显著进步.重要的是,随后在此增强 SFT 阶段之后进行 RL 微调的模型也展现出持续的性能提升.</p>
<p><strong>On-Policy RL with Extended Generation Budget</strong>.团队此前的经验调查表明,vanilla GRPO 的实现明显容易出现过早性能饱和.为缓解此,团队采用 on-policy RL 算法,类似于 MiMo-VL-7B-RL 中使用的方法.On-policy RL 训练被证明非常稳定,同时在整个学习过程中实现模型效能的持续提升.进一步扩展发现,在 on-policy RL 训练期间持续提升生成长度预算可持续提升模型性能.具体而言,RL 训练协议涉及将模型的生成长度从 32K 系统性地增加到 38K,随后增加到 48K.这种生成预算的渐进扩展是 7B 模型最终在数学推理上达到与 DeepSeek-R1 性能持平的关键.MiMo-7B-RL-0530 模型已开源并公开发布.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: &quot;逐渐增加生成长度预算&quot;是 MiMo-7B 后训练中最反直觉但也最有效的策略之一.传统 RL 训练通常固定最大生成长度,但 MiMo-7B 发现:随着模型能力提升,它自然需要更长的推理链来解决问题.如果最大长度固定为 32K,模型在训练后期会被迫压缩推理过程,导致性能瓶颈.通过将长度预算逐步扩展到 48K,模型获得了足够的&quot;思考空间&quot;来解决最困难的竞赛级数学问题.这一发现对推理模型的训练有深远影响:推理能力与生成长度之间存在正反馈循环——更好的模型需要更长的输出,而允许更长的输出又能释放更好的模型.这与人类认知中的&quot;深度思考需要时间&quot;的直觉一致.</p>
</blockquote>
<hr>
<h2 id="4-jl">4. 结论</h2>
<p>本工作介绍 MiMo-7B,一个通过优化的预训练和后训练过程解锁高级推理能力的 LLM 系列.预训练期间暴露于多样化推理模式,MiMo-7B-Base 具备非凡的推理潜力,超越规模大得多的模型.对于后训练,借助稳健高效的 RL 框架,团队训练了 MiMo-7B-RL-Zero 和 MiMo-7B-RL,其在数学、代码和通用任务上展现出优越的推理能力.团队希望本工作为开发更强大的推理模型提供 insights.</p>
<hr>
<h2 id="fl-mxpxdw">附录: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Llama / Qwen 架构基座(GQA + pre-RMSNorm + SwiGLU + RoPE)</li>
<li><strong>核心创新</strong>: 三阶段推理密度数据混合(阶段 2 达 70% 数学/代码)、Test Difficulty Driven Reward(IOI 启发)、Seamless Rollout Engine(连续 rollout + 异步奖励 + 早期终止)、逐步扩展生成长度预算(32K -&gt; 38K -&gt; 48K)</li>
<li><strong>被后续工作引用</strong>: MiMo-VL-7B-RL(多模态推理)、MiMo-7B-RL-0530(48K 上下文扩展)、MiMo-V2-Flash / MiMo-V2.5(MoE 架构升级)</li>
<li><strong>技术定位</strong>: MiMo-7B 是小米大模型 Core 团队的首个开源作品,以 7B 参数证明小模型通过&quot;预训练推理密度最大化 + 后训练基础设施优化&quot;可与 32B 模型竞争.其 Seamless Rollout Engine 和 Test Difficulty Driven Reward 已被后续 MiMo 系列继承和发展</li>
</ul>
<hr>
<p><em>本文档基于 MiMo-7B 官方技术报告 PDF 逐段精译,所有公式、数据与实验方法均忠实于原文.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"0-zyyhxzb","text":"0. 摘要与核心指标"},{"level":2,"id":"1-yy","text":"1. 引言"},{"level":2,"id":"2-yxl","text":"2. 预训练"},{"level":3,"id":"2-1-yxlsj","text":"2.1 预训练数据"},{"level":3,"id":"2-2-mxjg","text":"2.2 模型架构"},{"level":3,"id":"2-3-ccs","text":"2.3 超参数"},{"level":3,"id":"2-4-yxlpg","text":"2.4 预训练评估"},{"level":4,"id":"2-4-1-pgsz","text":"2.4.1 评估设置"},{"level":4,"id":"2-4-2-tlnlsx","text":"2.4.2 推理能力上限"},{"level":4,"id":"2-4-3-pgjg","text":"2.4.3 评估结果"},{"level":2,"id":"3-hxl","text":"3. 后训练"},{"level":3,"id":"3-1-jdwt","text":"3.1 监督微调"},{"level":3,"id":"3-2-rl-sjch","text":"3.2 RL 数据策划"},{"level":3,"id":"3-3-rl-xlpf","text":"3.3 RL 训练配方"},{"level":4,"id":"3-3-1-test-difficulty-driven-reward","text":"3.3.1 Test Difficulty Driven Reward"},{"level":4,"id":"3-3-2-easy-data-filter-and-re-sampling","text":"3.3.2 Easy Data Filter and Re-Sampling"},{"level":4,"id":"3-3-3-ccs","text":"3.3.3 超参数"},{"level":3,"id":"3-4-rl-jcss","text":"3.4 RL 基础设施"},{"level":4,"id":"3-4-1-seamless-rollout-engine","text":"3.4.1 Seamless Rollout Engine"},{"level":4,"id":"3-4-2-vllm-based-inference-engine","text":"3.4.2 vLLM-based Inference Engine"},{"level":3,"id":"3-5-hxlpg","text":"3.5 后训练评估"},{"level":4,"id":"3-5-1-pgsz","text":"3.5.1 评估设置"},{"level":4,"id":"3-5-2-pgjg","text":"3.5.2 评估结果"},{"level":3,"id":"3-6-tl","text":"3.6 讨论"},{"level":2,"id":"4-jl","text":"4. 结论"},{"level":2,"id":"fl-mxpxdw","text":"附录: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.9-mimo/01-mimo-7b/01-mimo-7b-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.9-mimo/01-mimo-7b/01-mimo-7b-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiMo-7B 技术报告精译</h1>
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
