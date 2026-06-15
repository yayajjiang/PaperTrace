"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma-1 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Gemma: Open Models Based on Gemini Research and Technology
原文链接: <a href="https://arxiv.org/abs/2403.08295">https://arxiv.org/abs/2403.08295</a>
发布日期: 2024-02-21
发布机构: Google DeepMind (Gemma Team)
模型规模: 2B / 7B
上下文窗口: 8192 tokens
训练数据: 2B 模型 3T tokens, 7B 模型 6T tokens</p>
</blockquote>
<hr>
<h2 id="1-yy-introduction">1 引言 (Introduction)</h2>
<p>我们在此介绍 Gemma, 一个基于 Google Gemini 模型(Gemini Team, 2023)构建的轻量级、最先进的开放模型家族.</p>
<p>Gemma 模型在语言理解、推理和安全性等学术基准测试上展现出强大的性能. 我们发布了两种规模的模型(20 亿和 70 亿参数), 并提供预训练和微调后的检查点. Gemma 在 18 项基于文本的任务中有 11 项优于同等规模的开源模型, 并且我们提出了对模型安全性和责任性方面的全面评估, 以及模型开发的详细描述. 我们认为, 负责任地发布大语言模型对于改进前沿模型的安全性以及推动下一代大语言模型创新至关重要.</p>
<blockquote>
<p>译者注: Gemma-1 的发布时间(2024 年 2 月)非常关键. 这是 Google 在开源大模型领域的首次正式入场, 直接对标 Meta 的 LLaMA-2(2023 年 7 月)和 Mistral-7B(2023 年 9 月). Google 的策略很明确——不追求最大规模的开放模型, 而是提供&quot;可部署、可研究&quot;的轻量级模型, 同时继承 Gemini 的技术积累和安全性标准. 这种&quot;技术下放&quot;策略与 Meta 的&quot;生态扩张&quot;策略形成对比: Meta 通过开源 LLaMA 来建立行业标准, Google 则通过 Gemma 来展示其内部技术栈的成熟度.</p>
</blockquote>
<p>我们使用受 Gemini 模型家族启发的架构、数据和训练配方, 在最多 6T token 的文本上训练 Gemma 模型. 与 Gemini 一样, 这些模型在文本领域实现了强大的通用能力, 以及规模化的最先进的理解和推理技能. 通过本工作, 我们同时发布了预训练和微调后的检查点, 以及用于推理和服务的开源代码库.</p>
<p>Gemma 有两种规模: 一个 70 亿参数模型, 用于在 GPU 和 TPU 上进行高效部署和开发; 以及一个 20 亿参数模型, 用于 CPU 和端侧应用. 每种规模都旨在应对不同的计算约束、应用和开发者需求. 在每个规模上, 我们都发布了原始预训练检查点, 以及为对话、指令遵循、有用性和安全性进行微调的检查点. 我们在一套定量和定性基准测试上全面评估了我们模型的不足之处. 我们相信, 同时发布预训练和微调后的检查点将有助于深入研究当前指令微调机制的影响, 以及开发越来越安全和负责任的模型开发方法.</p>
<p>Gemma 在多种自动化基准测试和人工评估中, 相对于同等规模(甚至某些更大规模)的开源模型显著推进了最先进的性能(Jiang et al., 2023; Touvron et al., 2023b, a; Almazrouei et al., 2023). 示例领域包括问答(Clark et al., 2019; Kwiatkowski et al., 2019)、常识推理(Sakaguchi et al., 2019; Suzgun et al., 2022)、数学和科学(Cobbe et al., 2021; Hendrycks et al., 2020)以及编程(Austin et al., 2021; Chen et al., 2021). 详见评估部分.</p>
<p>虽然我们对所有 Gemma 模型进行了全面测试, 但这些测试无法覆盖 Gemma 可能被使用的所有应用场景. 鉴于此, 所有 Gemma 用户在部署或使用前都应针对其具体用例进行严格的安全测试. 关于我们安全性方法的更多细节, 请参阅&quot;负责任部署&quot;部分.</p>
<p>在本技术报告中, 我们提供了模型架构、训练基础设施以及预训练和微调配方的详细概述, 随后对所有检查点在多种定量和定性基准测试上进行了全面评估, 以及标准学术基准测试和人工偏好评估. 然后我们详细讨论了安全且负责任的部署方法. 最后, 我们概述了 Gemma 的更广泛影响、其局限性及优势.</p>
<hr>
<h2 id="2-mxjg-model-architecture">2 模型架构 (Model Architecture)</h2>
<p>Gemma 模型架构基于 Transformer 解码器(Vaswani et al., 2017). 表 1 中总结了架构的核心参数. 模型在 8192 token 的上下文长度上训练.</p>
<table>
<thead>
<tr>
<th>Parameters</th>
<th>2B</th>
<th>7B</th>
</tr>
</thead>
<tbody><tr>
<td>d_model</td>
<td>2048</td>
<td>3072</td>
</tr>
<tr>
<td>Layers</td>
<td>18</td>
<td>28</td>
</tr>
<tr>
<td>Feedforward hidden dims</td>
<td>32768</td>
<td>49152</td>
</tr>
<tr>
<td>Num heads</td>
<td>8</td>
<td>16</td>
</tr>
<tr>
<td>Num KV heads</td>
<td>1</td>
<td>16</td>
</tr>
<tr>
<td>Head size</td>
<td>256</td>
<td>256</td>
</tr>
<tr>
<td>Vocab size</td>
<td>256128</td>
<td>256128</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 关键模型参数.</p>
</blockquote>
<p>我们还利用了原始 Transformer 论文之后提出的几项改进, 并在下面列出:</p>
<p><strong>多查询注意力 (Multi-Query Attention, Shazeer, 2019).</strong> 值得注意的是, 7B 模型使用多头注意力, 而 2B 检查点使用多查询注意力(其中 num_kv_heads=1), 基于消融实验表明多查询注意力在小规模上表现良好(Shazeer, 2019).</p>
<blockquote>
<p>译者注: MQA 是 Gemma-1 2B 模型的关键架构选择. 标准 MHA 中, 每个注意力头都有独立的 K 和 V 投影, 导致 KV Cache 内存与头数成正比. MQA 让所有头共享同一组 K 和 V, 将 KV Cache 内存降低到原来的 1/num_heads. 对于 2B 这种端侧模型, 推理时的内存占用比训练时的计算量更重要——用户更关心&quot;能不能在我的笔记本上跑&quot;, 而不是&quot;训练时多花了几小时&quot;. 但 MQA 的代价是表达能力下降: 单个 KV 头需要编码所有注意力头所需的信息, 这在复杂任务上可能导致质量损失. Gemma-1 的 7B 模型保留了 MHA, 说明 Google 认为在 7B 规模上, MQA 的质量损失不再可接受. 后续 Gemma-2 统一使用 GQA(分组查询注意力), 这是对 MHA 和 MQA 的折中.</p>
</blockquote>
<p><strong>RoPE 嵌入 (Su et al., 2021).</strong> 我们不使用绝对位置嵌入, 而是在每一层使用旋转位置嵌入; 我们还在输入和输出之间共享嵌入, 以减少模型大小.</p>
<p><strong>GeGLU 激活 (Shazeer, 2020).</strong> 标准的 ReLU 非线性被 GeGLU 激活函数的近似版本所替代.</p>
<p><strong>RMSNorm.</strong> 我们使用 RMSNorm(Zhang and Sennrich, 2019) 对每个 Transformer 子层(注意力层和前馈层)的输入进行归一化, 以稳定训练.</p>
<table>
<thead>
<tr>
<th>Model</th>
<th>Embedding Parameters</th>
<th>Non-embedding Parameters</th>
</tr>
</thead>
<tbody><tr>
<td>2B</td>
<td>524,550,144</td>
<td>1,981,884,416</td>
</tr>
<tr>
<td>7B</td>
<td>786,825,216</td>
<td>7,751,248,896</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Gemma 模型的参数计数. 我们继承了大型 Gemini 词表(256k 条目), 该词表设计用于处理大量语言, 因此与仅限于一种或少数几种语言的模型相比, 嵌入参数计数更大.</p>
</blockquote>
<hr>
<h2 id="3-xljcss-training-infrastructure">3 训练基础设施 (Training Infrastructure)</h2>
<p>我们使用 TPUv5e 训练 Gemma 模型; TPUv5e 以 256 个芯片的 pod 部署, 配置为 16 x 16 芯片的 2D 环面. 对于 7B 模型, 我们在 16 个 pod 上训练, 共 4096 个 TPUv5e. 我们在 2 个 pod 上预训练 2B 模型, 共 512 个 TPUv5e. 在 pod 内, 我们对 7B 模型使用 16 路模型分片和 16 路数据复制. 对于 2B 模型, 我们简单地使用 256 路数据复制. 优化器状态使用类似 ZeRO-3 的技术进一步分片. 超出 pod 范围, 我们使用 Barham 等人(2022)的 Pathways 方法通过数据中心网络执行数据副本间的规约.</p>
<blockquote>
<p>译者注: Gemma-1 的训练基础设施揭示了几个有趣的工程细节. 首先, 7B 模型使用 4096 个 TPUv5e——这在 2024 年初属于顶级计算资源. 作为对比, LLaMA-2 7B 使用了约 1720 个 A100-80GB GPU. TPUv5e 的峰值 BF16 算力约为 197 TFLOPS, 而 A100 为 312 TFLOPS, 但 TPU 的利用率通常更高(得益于 XLA 编译器的优化). 其次, 2B 模型使用纯数据并行(256 路复制, 无模型分片), 这说明 2B 参数在 BF16 下仅需约 4GB 显存, 可以轻松放入单个 TPU chip 中. 最后, &quot;数据中心网络&quot;(DCN)用于跨 pod 通信, 这意味着通信带宽远低于 pod 内部的芯片间互联(ICI). 这种设计选择表明 Gemma-1 的训练主要受限于 pod 内部的计算, 而非跨 pod 通信.</p>
</blockquote>
<p>我们遵循 Gemini, 利用 Jax(Roberts et al., 2023)和 Pathways(Barham et al., 2022)的&quot;单控制器&quot;编程范式. 这通过启用单个 Python 进程来编排整个训练运行, 从而简化了开发过程; 我们还利用 GSPMD partitioner(Xu et al., 2021)进行训练步骤计算, 以及 MegaScale XLA 编译器(XLA, 2019).</p>
<h3 id="3-1-tzj">3.1 碳足迹</h3>
<p>我们估计预训练 Gemma 模型的碳排放量约为 131 tCO2eq. 该值基于直接从我们的 TPU 数据中心报告的每小时能源使用量计算; 我们还缩放该值以考虑创建和维护数据中心所消耗的额外能源, 从而得到训练实验的总能源使用量. 我们通过将总能源使用量与数据中心报告的每小时每单元碳排放数据相结合, 将总能源使用量转换为碳排放量.</p>
<p>此外, Google 数据中心通过能源效率、可再生能源购买和碳抵消的组合实现了碳中和. 这种碳中和适用于我们的实验和运行它们的机器.</p>
<blockquote>
<p>译者注: 131 tCO2eq 是一个相对较低的碳排放数字. 作为对比, GPT-3(175B)的训练碳排放估计约为 552 tCO2eq, LLaMA-2 70B 约为 291 tCO2eq. Gemma-1 的低碳足迹部分归因于 TPU 的能效优势——TPU 专为矩阵运算设计, 每瓦特性能通常高于通用 GPU. 但这里也需要注意&quot;碳中和&quot;声明的局限性: Google 通过&quot;碳抵消&quot;实现碳中和, 这意味着实际排放了 131 吨 CO2, 但通过购买碳信用额度来&quot;抵消&quot;. 这种会计方法在业界存在争议, 因为它不减少实际排放.</p>
</blockquote>
<hr>
<h2 id="4-yxl-pretraining">4 预训练 (Pretraining)</h2>
<h3 id="4-1-xlsj">4.1 训练数据</h3>
<p>Gemma 2B 和 7B 分别在 3T 和 6T token 的、主要由英文数据组成的网页文档、数学和代码上训练. 与 Gemini 不同, 这些模型不是多模态的, 也没有针对最先进的多语言任务性能进行训练.</p>
<p>我们使用 Gemini 的 SentencePiece tokenizer(Kudo and Richardson, 2018)的子集以保持兼容性. 它分割数字, 不移除额外的空白, 并对未知 token 依赖字节级编码, 遵循 Chowdhery 等人(2022)和 Gemini Team(2023)使用的技术. 词表大小为 256k token.</p>
<h3 id="4-2-gl">4.2 过滤</h3>
<p>我们过滤预训练数据集以减少产生不需要或不安全话语的风险, 并过滤掉某些个人信息或其他敏感数据. 这包括使用启发式和基于模型的分类器来去除有害或低质量内容. 此外, 我们从预训练数据混合中过滤掉所有评估集, 运行针对性的污染分析以检查评估集泄漏, 并通过最小化敏感输出的扩散来降低背诵的风险.</p>
<p>最终的数据混合比例通过在 2B 和 7B 模型上的一系列消融实验确定. 类似于 Gemini Team(2023)倡导的方法, 我们分阶段训练, 在训练过程中改变语料库混合比例, 在训练结束时增加相关、高质量数据的权重.</p>
<blockquote>
<p>译者注: &quot;分阶段训练&quot;(staged training)是 Gemma-1 数据策略的一个关键细节. 在训练初期, 模型主要学习通用的语言结构和知识; 在训练后期, 增加高质量数据(如代码、数学、科学文献)的比例, 可以使模型在这些领域获得更精细的能力. 这与传统的&quot;固定数据混合&quot;策略不同, 后者在整个训练过程中保持相同的数据比例. 分阶段训练的理论依据是: 早期阶段模型需要广泛接触各种数据以建立基础表征, 后期阶段则可以专注于提升特定领域的能力. 但这种策略也增加了调参复杂度——需要确定何时切换阶段、切换后的混合比例是多少.</p>
</blockquote>
<hr>
<h2 id="5-zlwt-instruction-tuning">5 指令微调 (Instruction Tuning)</h2>
<p>我们使用监督微调(SFT)在混合了纯文本、纯英文的合成和人工生成的提示-响应对上对 Gemma 2B 和 7B 进行微调, 并使用基于人类反馈的强化学习(RLHF)进一步训练, 奖励模型在标注的纯英文偏好数据上训练, 策略基于一组高质量提示. 我们发现两个阶段对于改进下游自动评估和模型输出的人工偏好评估的性能都很重要.</p>
<h3 id="5-1-jdwt">5.1 监督微调</h3>
<p>我们基于 LM -based 的并排评估(Zheng et al., 2023)选择 SFT 的数据混合. 给定一组保留的提示, 我们从测试模型生成响应, 从基线模型在相同提示上生成响应, 随机打乱这些响应, 并要求一个更大、更高能力的模型表达对两个响应的偏好. 不同的提示集被构建以突出特定能力, 如指令遵循、事实性、创造性和安全性. 我们的 LM-based 评判者采用多种已知策略, 如链式思维提示(Wei et al., 2022)、评分标准和宪法(Bai et al., 2022), 以与人类偏好对齐.</p>
<h3 id="5-2-gl">5.2 过滤</h3>
<p>在使用合成数据时, 我们对其运行多个过滤阶段, 去除显示某些个人信息、不安全或有毒模型输出、错误自我识别数据或重复示例的数据. 遵循 Gemini 的做法, 我们发现包含鼓励更好的上下文归因、对冲和拒绝的数据子集可以提高事实性指标上的性能, 而不会降低模型在其他指标上的性能.</p>
<p>最终的数据混合和 SFT 配方(包括调整后的超参数)是在提高有用性的同时最小化与安全性和幻觉相关的模型危害的基础上选择的.</p>
<blockquote>
<p>译者注: &quot;错误自我识别数据&quot;(mistaken self-identification data)是指模型错误地声称自己是另一个 AI(如 GPT-4 或 Claude)的训练数据. 这是指令微调中的一个常见问题——如果合成数据由另一个大模型生成, 学生模型可能会继承生成模型的&quot;身份认同&quot;. 例如, 如果 SFT 数据包含 &quot;I am Claude, an AI assistant made by Anthropic&quot;, 微调后的 Gemma 可能会在自己生成中也包含类似表述. Google 明确过滤这类数据, 说明他们意识到了这个问题. 后续研究发现, 即使经过过滤, 开源模型仍有一定概率在特定提示下产生错误的自我识别.</p>
</blockquote>
<h3 id="5-3-gsh">5.3 格式化</h3>
<p>指令微调模型使用特定的格式化器进行训练, 该格式化器在训练和推理时都为所有指令微调示例标注额外信息. 它有两个目的: 1) 指示对话中的角色, 如用户角色; 2) 划定对话中的轮次, 特别是在多轮对话中. 为此, 在 tokenizer 中保留了特殊的控制 token. 虽然不使用格式化器也可能获得连贯的生成, 但这对模型来说是分布外的, 很可能会产生更差的生成.</p>
<table>
<thead>
<tr>
<th>Context</th>
<th>Relevant Token</th>
</tr>
</thead>
<tbody><tr>
<td>User turn</td>
<td>user</td>
</tr>
<tr>
<td>Model turn</td>
<td>model</td>
</tr>
<tr>
<td>Start of conversation turn</td>
<td><start_of_turn></td>
</tr>
<tr>
<td>End of conversation turn</td>
<td><end_of_turn></td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Gemma 模型用于 SFT 和 RLHF 的相关格式化控制 token.</p>
</blockquote>
<table>
<thead>
<tr>
<th></th>
<th></th>
</tr>
</thead>
<tbody><tr>
<td>User:</td>
<td><start_of_turn>user</td>
</tr>
<tr>
<td></td>
<td>Knock knock.<end_of_turn></td>
</tr>
<tr>
<td></td>
<td><start_of_turn>model</td>
</tr>
<tr>
<td>Model:</td>
<td>Who&#39;s there?<end_of_turn></td>
</tr>
<tr>
<td>User:</td>
<td><start_of_turn>user</td>
</tr>
<tr>
<td></td>
<td>Gemma.<end_of_turn></td>
</tr>
<tr>
<td></td>
<td><start_of_turn>model</td>
</tr>
<tr>
<td>Model:</td>
<td>Gemma who?<end_of_turn></td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: 用户和模型控制 token 的对话示例.</p>
</blockquote>
<h3 id="5-4-jyrlfkdqhxx-rlhf">5.4 基于人类反馈的强化学习 (RLHF)</h3>
<p>我们进一步使用 RLHF(Christiano et al., 2017; Ouyang et al., 2022)对监督微调后的模型进行微调. 我们从人类评分员收集偏好对, 并在 Bradley-Terry 模型(Bradley and Terry, 1952)下训练奖励函数, 类似于 Gemini. 策略被训练以使用一种新颖的强化学习算法来优化该奖励函数. 类似于 SFT 阶段, 为了调整超参数并额外缓解奖励黑客(Amodei et al., 2016; Skalse et al., 2022), 我们依赖高容量模型作为自动评分员, 并计算与基线模型的并排对比.</p>
<blockquote>
<p>译者注: &quot;新颖的强化学习算法&quot;——Gemini/Gemma 的 RLHF 算法细节从未完全公开. 业界普遍猜测 Google 使用了某种形式的 PPO(Proximal Policy Optimization)变体或 REINFORCE 的改进版本. 与 OpenAI 的 InstructGPT 和 Anthropic 的 Constitutional AI 不同, Google 没有公开其 RLHF 的具体算法细节, 这限制了研究社区对其对齐方法的复现和分析. &quot;奖励黑客&quot;(reward hacking)是指策略模型找到奖励函数的漏洞而非真正学习期望行为——例如, 奖励模型可能偏爱长回答, 策略模型就会生成冗长但无意义的内容. 使用高容量模型作为自动评分员是一种缓解策略, 但它引入了新的偏差——自动评分员本身可能有偏见.</p>
</blockquote>
<hr>
<h2 id="6-pg-evaluation">6 评估 (Evaluation)</h2>
<p>我们在广泛领域中对 Gemma 进行评估, 使用自动化基准测试和人工评估.</p>
<h3 id="6-1-rgphpg">6.1 人工偏好评估</h3>
<p>除了在微调模型上运行标准学术基准测试外, 我们还将最终发布候选模型送交人工评估研究, 与 Mistral v0.2 7B Instruct 模型(Jiang et al., 2023)进行比较.</p>
<p>在一个约 1000 个提示的保留集合上(侧重于要求模型在创意写作任务、编程和遵循指令方面遵循指令), Gemma 7B IT 具有 61.2% 的正面胜率, Gemma 2B IT 具有 45% 的胜率超过 Mistral v0.2 7B Instruct. 在一个约 400 个提示的保留集合上(侧重于测试基本安全协议), Gemma 7B IT 具有 63.5% 的胜率, 而 Gemma 2B IT 具有 60.1% 的胜率. 我们在表 5 中报告了相应的数字.</p>
<table>
<thead>
<tr>
<th>Model</th>
<th>Safety</th>
<th>Instr. Following</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 1.1 IT 7B</td>
<td>63.5%</td>
<td>61.2%</td>
</tr>
<tr>
<td>95% Conf. Interval</td>
<td>[60.7%, 66.1%]</td>
<td>[59.3%, 63%]</td>
</tr>
<tr>
<td>Win / Tie / Loss</td>
<td>51.5% / 23.9% / 24.6%</td>
<td>52.2% / 18.1% / 29.8%</td>
</tr>
<tr>
<td>Gemma 1.1 IT 2B</td>
<td>60.1%</td>
<td>45%</td>
</tr>
<tr>
<td>95% Conf. Interval</td>
<td>[57.3%, 62.8%]</td>
<td>[43.1%, 46.9%]</td>
</tr>
<tr>
<td>Win / Tie / Loss</td>
<td>48.5% / 23.2% / 28.3%</td>
<td>37.1% / 15.8% / 47.1%</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: Gemma 1.1 IT 模型与 Mistral 7B v0.2 Instruct 的胜率及 95% 置信区间. 我们报告胜负平的分解, 并在报告最终胜率时平均分配平局. Gemma 1.0 的结果见附录.</p>
</blockquote>
<blockquote>
<p>译者注: 值得注意的是, Gemma 2B IT 在安全测试中以 60.1% 的胜率击败了 Mistral 7B IT——一个参数量仅 29% 的模型在安全对齐上表现更好. 这说明模型规模并非安全性的唯一决定因素; 训练数据的质量、过滤策略和对齐方法的精细度同样重要. 然而, 在指令遵循方面, 2B 模型的 45% 胜率表明其能力明显弱于 7B 模型, 这符合规模效应的预期.</p>
</blockquote>
<h3 id="6-2-zdhjzcs">6.2 自动化基准测试</h3>
<table>
<thead>
<tr>
<th></th>
<th>LLaMA-2 7B</th>
<th>Mistral 7B</th>
<th>Gemma 7B</th>
<th>Gemma 2B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>45.3</td>
<td>62.5</td>
<td>64.3</td>
<td>42.3</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>77.2</td>
<td>81.0</td>
<td>81.2</td>
<td>71.4</td>
</tr>
<tr>
<td>PIQA</td>
<td>78.8</td>
<td>82.2</td>
<td>81.2</td>
<td>77.3</td>
</tr>
<tr>
<td>SIQA</td>
<td>48.3</td>
<td>47.0</td>
<td>51.8</td>
<td>49.7</td>
</tr>
<tr>
<td>Boolq</td>
<td>77.4</td>
<td>83.2</td>
<td>83.2</td>
<td>69.4</td>
</tr>
<tr>
<td>Winogrande</td>
<td>69.2</td>
<td>74.2</td>
<td>72.3</td>
<td>65.4</td>
</tr>
<tr>
<td>CQA</td>
<td>57.8</td>
<td>66.3</td>
<td>71.3</td>
<td>65.3</td>
</tr>
<tr>
<td>OBQA</td>
<td>58.6</td>
<td>52.2</td>
<td>52.8</td>
<td>47.8</td>
</tr>
<tr>
<td>ARC-e</td>
<td>75.2</td>
<td>80.5</td>
<td>81.5</td>
<td>73.2</td>
</tr>
<tr>
<td>ARC-c</td>
<td>45.9</td>
<td>54.9</td>
<td>53.2</td>
<td>42.1</td>
</tr>
<tr>
<td>TriviaQA</td>
<td>72.1</td>
<td>62.5</td>
<td>63.4</td>
<td>53.2</td>
</tr>
<tr>
<td>NQ</td>
<td>25.7</td>
<td>23.2</td>
<td>23.0</td>
<td>12.5</td>
</tr>
<tr>
<td>HumanEval</td>
<td>12.8</td>
<td>26.2</td>
<td>32.3</td>
<td>22.0</td>
</tr>
<tr>
<td>MBPP</td>
<td>20.8</td>
<td>40.2</td>
<td>44.4</td>
<td>29.2</td>
</tr>
<tr>
<td>GSM8K</td>
<td>14.6</td>
<td>35.4</td>
<td>46.4</td>
<td>17.7</td>
</tr>
<tr>
<td>MATH</td>
<td>2.5</td>
<td>12.7</td>
<td>24.3</td>
<td>11.8</td>
</tr>
<tr>
<td>AGIEval</td>
<td>29.3</td>
<td>41.2</td>
<td>41.7</td>
<td>24.2</td>
</tr>
<tr>
<td>BBH</td>
<td>32.6</td>
<td>56.1</td>
<td>55.1</td>
<td>35.2</td>
</tr>
<tr>
<td>Average</td>
<td>46.9</td>
<td>54.5</td>
<td>56.9</td>
<td>45.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: 学术基准测试结果, 与同等规模、公开可用的模型进行比较. † Mistral 报告在 MBPP 的不同分割上为 50.2, 在我们的分割上 7B 模型达到 54.5. ∗ 由我们运行的评估. 注意, 由于许可限制, 我们无法在 LLaMA-2 上运行评估; 上述所有值均来自 Touvron et al. (2023b) 之前报告的数据.</p>
</blockquote>
<p>我们在包括物理推理(Bisk et al., 2019)、社会推理(Sap et al., 2019)、问答(Clark et al., 2019; Kwiatkowski et al., 2019)、编程(Austin et al., 2021; Chen et al., 2021)、数学(Cobbe et al., 2021)、常识推理(Sakaguchi et al., 2019)、语言建模(Paperno et al., 2016)、阅读理解(Joshi et al., 2017)等多个领域测量 Gemma 模型的性能.</p>
<p>我们在表 6 和表 7 中将 Gemma 2B 和 7B 模型与几个外部开源 LLM 进行比较.</p>
<p>在 MMLU(Hendrycks et al., 2020)上, Gemma 7B 在相同或更小规模的所有开源替代品中表现最佳; 它还优于几个更大的模型, 包括 LLaMA2 13B. 然而, 基准作者评估的人类专家性能为 89.8%; 由于 Gemini Ultra 是第一个超过这一阈值的模型, 因此在达到 Gemini 和人类水平性能方面仍有显著的改进空间.</p>
<p>Gemma 模型在数学和编程基准测试上表现出特别强的性能. 在数学任务上(通常用于基准测试模型的通用分析能力), Gemma 模型在 GSM8K(Cobbe et al., 2021)和更难的 MATH(Hendrycks et al., 2021)基准测试中至少比其他模型高出 10 分. 类似地, 它们在 HumanEval(Chen et al., 2021)上至少比替代开源模型高出 6 分. 它们甚至超过了经过代码微调的 CodeLLaMA-7B 模型在 MBPP 上的性能(CodeLLaMA 达到 41.4%, 而 Gemma 7B 达到 44.4%).</p>
<table>
<thead>
<tr>
<th></th>
<th>Mistral 7B</th>
<th>Gemma 7B</th>
</tr>
</thead>
<tbody><tr>
<td>ARC-c</td>
<td>60.0</td>
<td>61.9</td>
</tr>
<tr>
<td>HellaSwag</td>
<td>83.3</td>
<td>82.2</td>
</tr>
<tr>
<td>MMLU</td>
<td>64.2</td>
<td>64.6</td>
</tr>
<tr>
<td>TruthfulQA</td>
<td>42.2</td>
<td>44.8</td>
</tr>
<tr>
<td>Winogrande</td>
<td>78.4</td>
<td>79.0</td>
</tr>
<tr>
<td>GSM8K</td>
<td>37.8</td>
<td>50.9</td>
</tr>
<tr>
<td>Average</td>
<td>61.0</td>
<td>63.8</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: HuggingFace H6 基准测试. 小模型的性能对提示的微小修改很敏感, 我们使用多个已知基准的独立实现进一步验证了我们模型的质量. 所有评估均由 HuggingFace 运行.</p>
</blockquote>
<blockquote>
<p>译者注: Gemma-1 7B 在数学和编程上的领先是一个重要信号. GSM8K 46.4% 和 MATH 24.3% 的成绩在 2024 年初的开源模型中属于顶尖水平——Mistral 7B 的 GSM8K 仅为 35.4%, MATH 仅为 12.7%. 这种优势可能来自训练数据中的数学和代码比例较高, 以及 Gemini 技术栈中的特定优化. 但需要注意, 这些数字是在 few-shot 设置下取得的, 实际对话中的数学能力可能因提示格式不同而有显著差异. 此外, Gemma 7B 在 TruthfulQA 上仅 44.8%, 说明事实性和幻觉仍是主要挑战.</p>
</blockquote>
<h3 id="6-3-jyhpg">6.3 记忆化评估</h3>
<p>最近的研究表明, 对齐后的模型可能容易受到新的对抗性攻击, 这些攻击可以绕过对齐(Nasr et al., 2023). 这些攻击可能导致模型发散, 有时在此过程中背诵记忆化的训练数据. 我们关注可发现的记忆化, 它作为模型记忆化的合理上限(Nasr et al., 2023), 并已在几项研究中使用(Carlini et al., 2022; Anil et al., 2023; Kudugunta et al., 2023).</p>
<p>我们使用与 Anil et al. (2023) 相同的方法测试 Gemma 预训练模型的记忆化. 我们从每个语料库中采样 10,000 个文档, 并使用前 50 个 token 作为模型的提示. 我们主要关注精确记忆化, 即如果模型生成的后续 50 个 token 与文本中的真实延续完全匹配, 则将文本分类为记忆化. 然而, 为了更好地捕获潜在的改写记忆化, 我们使用 10% 的编辑距离阈值包含近似记忆化(Ippolito et al., 2022). 在图 2 中, 我们将评估结果与最接近规模的 PaLM(Chowdhery et al., 2022)和 PaLM 2 模型(Anil et al., 2023)进行比较.</p>
<p><strong>逐字记忆化.</strong> PaLM 2 通过在共享的训练语料子集上评估来与 PaLM 进行比较. 然而, Gemma 预训练数据与 PaLM 模型之间的重叠更少, 因此使用相同的方法, 我们观察到更低的记忆化率(图 2 左). 相反, 我们发现估计整个预训练数据集上的&quot;总记忆化&quot;给出了更可靠的估计(图 2 右), 在此我们发现 Gemma 以与 PaLM 相当的速率记忆训练数据.</p>
<p><strong>个人数据.</strong> 也许更重要的是个人数据可能被记忆化的可能性. 作为使 Gemma 预训练模型安全和可靠的一部分, 我们使用自动化技术从训练集中过滤掉某些个人信息和其他敏感数据.</p>
<p>为了识别个人数据的可能出现, 我们使用 Google Cloud 敏感数据保护工具. 该工具基于许多类别的个人数据(例如姓名、电子邮件等)输出三个严重程度级别. 我们将最高严重程度归类为&quot;敏感&quot;, 将剩余两个归类为&quot;个人&quot;. 然后, 我们测量记忆化输出中包含任何敏感或个人数据的比例. 如图 3 所示, <strong>我们观察到没有记忆化敏感数据的案例.</strong> 我们确实发现模型记忆了一些我们按上述归类为潜在&quot;个人&quot;的数据, 尽管通常以低得多的速率. 此外, 重要的是要注意这些工具已知有许多误报(因为它们只匹配模式而不考虑上下文), 这意味着我们的结果很可能是对识别到的个人数据量的高估.</p>
<p><strong>近似记忆化.</strong> 在图 4 中, 我们观察到大约多 50% 的数据被近似记忆化(注意对数尺度), 并且这在数据集的不同子类别中几乎是一致的.</p>
<hr>
<h2 id="7-fzrbs-responsible-deployment">7 负责任部署 (Responsible Deployment)</h2>
<p>与 Google AI 技术的先前发布一致(Gemini Team, 2023; Kavukcuoglu et al., 2022), 我们遵循结构化的方法来进行负责任的模型开发和部署, 以识别、衡量和管理可预见的下游社会影响. 正如我们最近的 Gemini 发布一样, 这些方法基于先前关于语言模型风险的学术文献(Weidinger et al., 2021)、跨行业进行的类似先前工作的发现(Anil et al., 2023)、与内部和外部专家的持续接触, 以及发现新模型漏洞的非结构化尝试.</p>
<h3 id="7-1-sy">7.1 收益</h3>
<p>我们相信 AI 科学和技术的开放性可以带来显著的好处. 开源是科学和创新的重要驱动力, 在大多数情况下是一种负责任的做法. 但这需要与为现在或将来造成伤害的行为者提供工具的风险相平衡.</p>
<p>Google 长期以来致力于提供更广泛的成功研究创新访问权限(GraphCast、Transformer、BERT、T5、Word2Vec), 我们相信将 Gemma 发布到 AI 开发生态系统将使下游开发者能够创建一系列有益的应用, 涉及科学、教育和艺术等领域. 我们的指令微调产品应鼓励各种开发者利用 Gemma 的聊天和代码能力来支持他们自己的有益应用, 同时允许自定义微调以将模型的能力专门用于特定用例. 为了确保 Gemma 支持广泛的开发者需求, 我们还发布了两种模型规模以最优地支持不同环境, 并在多个平台上提供这些模型(详见 Kaggle). 以这种方式广泛提供 Gemma 应该降低新企业或独立开发者在将这些技术整合到其工作流程中时面临的经济和技术障碍.</p>
<p>除了通过指令微调模型为开发者服务外, 我们还提供了相应的基础预训练模型的访问. 通过这样做, 我们的意图是鼓励进一步的 AI 安全研究和社区创新, 为开发者提供更广泛的模型池, 以构建社区已经受益的各种透明度和可解释性研究方法(Pacchiardi et al., 2023; Zou et al., 2023).</p>
<blockquote>
<p>译者注: Google 在&quot;收益&quot;部分的论述体现了其在开源与闭源之间寻求平衡的努力. 与 Meta 的&quot;开源一切&quot;策略不同, Google 强调&quot;负责任地开放&quot;——只开放特定规模的模型, 同时保留最大规模的模型(如 Gemini Ultra)作为闭源产品. 这种策略的商业逻辑是: 通过开源轻量级模型来扩大技术影响力, 吸引开发者进入 Google 生态(GCP、Vertex AI、Kaggle), 同时保持闭源旗舰模型的竞争优势. 但这也引发了一个伦理问题: 如果开源模型确实存在被滥用的风险, 那么谁有权决定&quot;开放多少&quot;? Google 的答案是&quot;我们自己&quot;, 通过内部安全评估和许可条款来控制.</p>
</blockquote>
<h3 id="7-2-fx">7.2 风险</h3>
<p>除了为 AI 开发生态系统带来好处外, 我们也意识到大语言模型的恶意使用, 如深度伪造图像的创建、AI 生成的虚假信息以及非法和令人不安的内容, 可能对个人和机构层面造成伤害(Weidinger et al., 2021). 提供对模型权重的访问, 而不是在 API 后发布模型, 也为负责任部署带来了新的挑战.</p>
<p>首先, 尽管其使用受禁止将 Gemma 模型用于违反 Gemma 禁止用例政策的条款约束, 我们无法阻止恶意行为者出于恶意意图对 Gemma 进行微调. 然而, 我们认识到需要进一步的工作来构建更强大的缓解策略, 以抵御对开放模型的故意滥用, Google DeepMind 将继续在内部以及与 AI 社区合作探索这一领域.</p>
<p>我们面临的第二个挑战是保护开发者和下游用户免受开放模型的意外行为, 包括生成有毒语言或延续歧视性社会危害、模型幻觉以及个人可识别信息的泄漏. 在 API 后部署模型时, 可以通过各种过滤方法来降低这些风险.</p>
<h3 id="7-3-hjcs">7.3 缓解措施</h3>
<p>对于 Gemma 模型家族, 没有这层防御, 我们努力通过与 Gemini 方法一致的预训练数据中的偏见过滤和测量、通过标准化 AI 安全基准测试评估安全性、内部红队测试以更好地了解与 Gemma 外部使用相关的风险, 以及对模型进行严格的伦理和安全评估(结果见表 8)来防范这些风险.</p>
<table>
<thead>
<tr>
<th></th>
<th>Mistral v0.2 7B</th>
<th>Gemma 1.1 IT</th>
<th></th>
</tr>
</thead>
<tbody><tr>
<td></td>
<td></td>
<td>2B</td>
<td>7B</td>
</tr>
<tr>
<td>RealToxicity</td>
<td>8.44</td>
<td>7.03</td>
<td>8.04</td>
</tr>
<tr>
<td>BOLD</td>
<td>46.0</td>
<td>47.76</td>
<td>45.2</td>
</tr>
<tr>
<td>CrowS-Pairs</td>
<td>32.76</td>
<td>45.89</td>
<td>49.67</td>
</tr>
<tr>
<td>BBQ Ambig</td>
<td>97.53</td>
<td>58.97</td>
<td>86.06</td>
</tr>
<tr>
<td>BBQ Disambig</td>
<td>84.45</td>
<td>53.9</td>
<td>85.08</td>
</tr>
<tr>
<td>Winogender</td>
<td>64.3</td>
<td>50.14</td>
<td>57.64</td>
</tr>
<tr>
<td>TruthfulQA</td>
<td>48.54</td>
<td>44.24</td>
<td>45.34</td>
</tr>
<tr>
<td>Winobias 1_2</td>
<td>65.72</td>
<td>55.93</td>
<td>59.22</td>
</tr>
<tr>
<td>Winobias 2_2</td>
<td>84.53</td>
<td>89.46</td>
<td>89.2</td>
</tr>
<tr>
<td>Toxigen</td>
<td>61.77</td>
<td>29.64</td>
<td>38.75</td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: Gemma 1.1 IT 模型的安全性学术基准测试结果, 与同等规模、公开可用的模型进行比较. 由我们运行的评估. 注意, 由于许可限制, 我们无法在 LLaMA-2 上运行评估; 我们不在 TruthfulQA 上报告 LLaMA-2 的先前发布数字, 因为我们使用不同的、不可比较的评估设置: 我们使用 MC2, 而 LLaMA-2 使用 GPT-Judge. Gemma 1.0 IT 模型的结果见附录.</p>
</blockquote>
<p>虽然我们已在改进模型方面投入了大量资源, 但我们认识到其局限性. 为了确保下游用户的透明度, 我们发布了详细的模型卡, 为研究人员提供更全面的 Gemma 理解.</p>
<p>我们还发布了生成式 AI 负责任工具包, 以支持开发者负责任地构建 AI. 这包括一系列帮助开发者设计和实施负责任 AI 最佳实践并保持其用户安全的资源.</p>
<p>开放权重模型的相对新颖性意味着这些模型的新用途和误用仍在被发现, 这就是 Google DeepMind 致力于在未来模型开发的同时持续研究和开发强大缓解策略的原因.</p>
<h3 id="7-4-pg">7.4 评估</h3>
<p>最终, 鉴于现有生态系统中可访问的更大系统的能力, 我们相信 Gemma 的发布将对整体 AI 风险组合产生微不足道的影响. 鉴于此, 以及这些模型对研究、审计和下游产品开发的效用, 我们确信 Gemma 对 AI 社区的收益大于所描述的风险.</p>
<h3 id="7-5-zw">7.5 展望</h3>
<p>作为指导原则, Google DeepMind 努力采用与模型潜在风险相称的评估和安全缓解措施. 虽然我们确信 Gemma 模型将为社区提供净收益, 但我们对安全性的强调源于这次发布的不可逆性. 由于开放模型造成的危害尚未被明确定义, 也没有针对此类模型的既定评估框架存在, 我们将继续遵循这一先例, 对开放模型开发采取审慎和谨慎的方法. 随着能力的进步, 我们可能会探索扩展测试、分阶段发布或替代访问机制, 以确保负责任的 AI 开发.</p>
<p>随着生态系统的发展, 我们敦促更广泛的 AI 社区超越简单的&quot;开放 vs. 封闭&quot;辩论, 避免夸大或最小化潜在危害, 因为我们相信对风险和收益的细致、协作的方法至关重要. 在 Google DeepMind, 我们致力于开发高质量的评估, 并邀请社区加入我们, 以更深入地理解 AI 系统.</p>
<blockquote>
<p>译者注: &quot;开放 vs. 封闭&quot;辩论是 2024 年 AI 社区的核心争议之一. Meta 的 LLaMA-2 采用相对宽松的许可(允许商业使用), 而 Google 的 Gemma 采用更严格的许可(禁止某些用例, 限制最大部署规模). Google 在这里试图占据&quot;理性中间派&quot;的位置——既不完全开放也不完全封闭. 但这种立场在实践中面临批评: 安全研究者认为限制过多阻碍了研究, 而安全倡导者认为开放权重本身就是一种风险. Gemma-1 的发布策略可以看作是一种&quot;受控开放&quot;实验, 其结果影响了后续 Gemma-2/3/4 的许可条款演进.</p>
</blockquote>
<hr>
<h2 id="8-tlyjl-discussion-and-conclusion">8 讨论与结论 (Discussion and Conclusion)</h2>
<p>我们介绍了 Gemma, 一个用于文本和代码的公开可用的生成式语言模型家族. Gemma 在公开可用语言模型的性能、安全性和负责任开发方面推进了最先进水平.</p>
<p>特别是, 鉴于我们广泛的安全评估和缓解措施, 我们确信 Gemma 模型将为社区提供净收益; 然而, 我们承认这次发布是不可逆的, 开放模型造成的危害尚未被明确定义, 因此我们将继续采用与这些模型潜在风险相称的评估和安全缓解措施. 此外, 我们的模型在 6 个标准安全基准测试中优于竞争对手, 在人工并排评估中也是如此.</p>
<p>Gemma 模型在包括对话、推理、数学和代码生成在内的广泛领域中提升了性能. MMLU(64.3%)和 MBPP(44.4%)的结果展示了 Gemma 的高性能, 以及公开可用大语言模型性能的持续提升空间.</p>
<p>除了基准任务上的最先进水平性能指标外, 我们期待看到社区中出现的新用例, 以及随着我们共同推动该领域发展而出现的新能力. 我们希望研究人员使用 Gemma 来加速广泛的研究, 开发者创建有益的新应用、用户体验和其他功能.</p>
<p>Gemma 受益于 Gemini 模型项目的许多经验, 包括代码、数据、架构、指令微调、基于人类反馈的强化学习和评估. 正如 Gemini 技术报告中所讨论的, 我们重申大语言模型使用的局限性(非穷尽集合). 即使在基准任务上表现出色, 仍需要进一步研究来创建稳健、安全的模型, 可靠地按预期执行. 示例进一步研究领域包括事实性、对齐、复杂推理和对对抗性输入的鲁棒性. 正如 Gemini 所讨论的, 我们注意到需要更具挑战性和鲁棒性的基准测试.</p>
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
<td>MQA</td>
<td>多查询注意力</td>
<td>第 2 节</td>
<td>所有注意力头共享同一组 K/V, 极大降低 KV Cache 内存</td>
</tr>
<tr>
<td>RoPE</td>
<td>旋转位置编码</td>
<td>第 2 节</td>
<td>通过旋转矩阵编码位置信息的位置编码方案</td>
</tr>
<tr>
<td>GeGLU</td>
<td>门控线性单元变体</td>
<td>第 2 节</td>
<td>结合 GELU 激活和门控机制的 FFN 变体</td>
</tr>
<tr>
<td>RMSNorm</td>
<td>均方根层归一化</td>
<td>第 2 节</td>
<td>对输入进行均方根归一化, 省略均值中心化</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>第 5 节</td>
<td>在输入-输出对上训练模型以遵循指令</td>
</tr>
<tr>
<td>RLHF</td>
<td>基于人类反馈的强化学习</td>
<td>第 5.4 节</td>
<td>使用人类偏好数据训练奖励模型, 再用 RL 优化策略</td>
</tr>
<tr>
<td>ZeRO-3</td>
<td>第三阶段零冗余优化器</td>
<td>第 3 节</td>
<td>将优化器状态、梯度和参数分片到所有数据并行进程</td>
</tr>
<tr>
<td>Staged Training</td>
<td>分阶段训练</td>
<td>第 4.2 节</td>
<td>在训练过程中动态调整数据混合比例</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 Gemma-1 官方技术报告的逐字精读翻译. 原文共约 125 页, 涵盖架构、训练基础设施、预训练、指令微调、评估、记忆化分析和负责任部署. 核心定位是 Google 开源大模型的首秀, 继承 Gemini 技术栈, 主打轻量级(2B/7B)和负责任开放. 与后续 Gemma-2 相比, Gemma-1 的架构相对保守(MQA+RoPE+GeGLU+RMSNorm), 但在安全性评估和负责任部署讨论上投入了前所未有的篇幅.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yy-introduction","text":"1 引言 (Introduction)"},{"level":2,"id":"2-mxjg-model-architecture","text":"2 模型架构 (Model Architecture)"},{"level":2,"id":"3-xljcss-training-infrastructure","text":"3 训练基础设施 (Training Infrastructure)"},{"level":3,"id":"3-1-tzj","text":"3.1 碳足迹"},{"level":2,"id":"4-yxl-pretraining","text":"4 预训练 (Pretraining)"},{"level":3,"id":"4-1-xlsj","text":"4.1 训练数据"},{"level":3,"id":"4-2-gl","text":"4.2 过滤"},{"level":2,"id":"5-zlwt-instruction-tuning","text":"5 指令微调 (Instruction Tuning)"},{"level":3,"id":"5-1-jdwt","text":"5.1 监督微调"},{"level":3,"id":"5-2-gl","text":"5.2 过滤"},{"level":3,"id":"5-3-gsh","text":"5.3 格式化"},{"level":3,"id":"5-4-jyrlfkdqhxx-rlhf","text":"5.4 基于人类反馈的强化学习 (RLHF)"},{"level":2,"id":"6-pg-evaluation","text":"6 评估 (Evaluation)"},{"level":3,"id":"6-1-rgphpg","text":"6.1 人工偏好评估"},{"level":3,"id":"6-2-zdhjzcs","text":"6.2 自动化基准测试"},{"level":3,"id":"6-3-jyhpg","text":"6.3 记忆化评估"},{"level":2,"id":"7-fzrbs-responsible-deployment","text":"7 负责任部署 (Responsible Deployment)"},{"level":3,"id":"7-1-sy","text":"7.1 收益"},{"level":3,"id":"7-2-fx","text":"7.2 风险"},{"level":3,"id":"7-3-hjcs","text":"7.3 缓解措施"},{"level":3,"id":"7-4-pg","text":"7.4 评估"},{"level":3,"id":"7-5-zw","text":"7.5 展望"},{"level":2,"id":"8-tlyjl-discussion-and-conclusion","text":"8 讨论与结论 (Discussion and Conclusion)"},{"level":2,"id":"fl-syb","text":"附录: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/01-gemma-1/01-gemma-1-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/01-gemma-1/01-gemma-1-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma-1 技术报告精译</h1>
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
