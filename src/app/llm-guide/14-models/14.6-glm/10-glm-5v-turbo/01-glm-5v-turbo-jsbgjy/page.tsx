"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5V-Turbo: 面向多模态智能体的原生基础模型 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: GLM-5V-Turbo: Toward a Native Foundation Model for Multimodal Agents
原文链接: <a href="https://arxiv.org/abs/2604.26752">https://arxiv.org/abs/2604.26752</a>
发表会议: arXiv preprint (2026.04)
发布日期: 2026.04.29 (v1), 2026.05.12 (v3)
发布机构: Z.ai (智谱 AI) &amp; Tsinghua University (Team GLM)
作者规模: 76 位作者, 技术负责人 Wenyi Hong 与 Xiaotao Gu
开源协议: 模型权重公开 (MIT)</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E6%A6%82%E8%BF%B0">1 概述</a></li>
<li><a href="#2-%E6%A8%A1%E5%9E%8B%E8%AE%AD%E7%BB%83%E4%B8%8E%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD">2 模型、训练与基础设施</a><ul>
<li><a href="#21-cogvit-%E8%A7%86%E8%A7%89Encoder">2.1 CogViT 视觉Encoder </a></li>
<li><a href="#22-%E5%A4%9A%E6%A8%A1%E6%80%81%E5%A4%9A-token-%E9%A2%84%E6%B5%8B-mmtp">2.2 多模态多 Token 预测 (MMTP)</a></li>
<li><a href="#23-%E6%84%9F%E7%9F%A5%E6%8E%A8%E7%90%86%E4%B8%8E-agent-%E8%83%BD%E5%8A%9B%E7%9A%84%E5%B9%BF%E6%B3%9B%E8%AE%AD%E7%BB%83">2.3 感知、推理与 Agent 能力的广泛训练</a></li>
<li><a href="#24-%E5%A4%A7%E8%A7%84%E6%A8%A1%E5%A4%9A%E6%A8%A1%E6%80%81%E5%BC%BA%E5%8C%96%E5%AD%A6%E4%B9%A0">2.4 大规模多模态强化学习</a></li>
</ul>
</li>
<li><a href="#3-%E5%A4%9A%E6%A8%A1%E6%80%81-agent-%E8%83%BD%E5%8A%9B%E4%B8%8E%E7%94%9F%E6%80%81">3 多模态 Agent 能力与生态</a><ul>
<li><a href="#31-%E5%A4%9A%E6%A8%A1%E6%80%81%E5%B7%A5%E5%85%B7%E9%93%BE%E6%89%A9%E5%B1%95">3.1 多模态工具链扩展</a></li>
<li><a href="#32-%E4%B8%8E%E5%A4%96%E9%83%A8-agent-%E6%A1%86%E6%9E%B6%E7%9A%84%E9%9B%86%E6%88%90">3.2 与外部 Agent 框架的集成</a></li>
<li><a href="#33-imagemining-%E8%A7%86%E8%A7%89-centric-%E6%B7%B1%E5%BA%A6%E6%90%9C%E7%B4%A2%E5%9F%BA%E5%87%86">3.3 ImageMining: 视觉-centric 深度搜索基准</a></li>
<li><a href="#34-%E5%A4%9A%E6%A8%A1%E6%80%81%E6%B7%B1%E5%BA%A6%E7%A0%94%E7%A9%B6%E4%B8%8E%E5%86%85%E5%AE%B9%E5%88%9B%E4%BD%9C">3.4 多模态深度研究与内容创作</a></li>
<li><a href="#35-%E5%AE%98%E6%96%B9-skills">3.5 官方 Skills</a></li>
</ul>
</li>
<li><a href="#4-%E5%BC%80%E5%8F%91%E8%BF%87%E7%A8%8B%E4%B8%AD%E7%9A%84%E8%AE%BE%E8%AE%A1%E8%A7%86%E8%A7%92">4 开发过程中的设计视角</a></li>
<li><a href="#5-%E8%AF%84%E4%BC%B0">5 评估</a></li>
<li><a href="#6-%E5%89%A9%E4%BD%99%E6%8C%91%E6%88%98">6 剩余挑战</a></li>
<li><a href="#7-%E8%B4%A1%E7%8C%AE%E8%80%85">7 贡献者</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a><ul>
<li><a href="#a-%E6%9C%AF%E8%AF%AD%E8%A1%A8">A. 术语表</a></li>
<li><a href="#b-%E6%A0%B8%E5%BF%83%E5%85%AC%E5%BC%8F%E4%B8%8E%E5%8F%82%E6%95%B0%E7%B4%A2%E5%BC%95">B. 核心公式与参数索引</a></li>
<li><a href="#c-%E6%A8%A1%E5%9E%8B%E8%B0%B1%E7%B3%BB%E5%AE%9A%E4%BD%8D">C. 模型谱系定位</a></li>
</ul>
</li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们介绍 GLM-5V-Turbo，一个面向多模态智能体 Agent 的原生基础模型. 随着基础模型越来越多地部署在真实环境中，Agent 能力不仅依赖于语言推理，还依赖于在图像、视频、网页、文档和 GUI 等异构上下文中的感知、解释和行动能力. GLM-5V-Turbo 围绕这一目标构建：多模态感知被整合为推理、规划、工具使用和执行的核心组件，而非作为语言模型的辅助接口. 本报告总结了 GLM-5V-Turbo 在模型设计、多模态训练、强化学习、工具链扩展以及与 Agent 框架集成方面的主要改进. 这些进展使其在多模态编码、视觉工具使用和基于框架的 Agent 任务上取得强劲性能，同时保留了有竞争力的纯文本编码能力. 更重要的是，我们的开发过程为构建多模态 Agent 提供了实践洞察，强调了多模态感知、分层优化和可靠的端到端验证的核心作用.</p>
<hr>
<h2 id="1-gs">1 概述</h2>
<p>基础模型的最新进展推动了从语言理解到 Agent 化真实世界交互的转变，为知识工作、软件工程以及与图形用户界面交互的任务等领域带来了显著的生产力提升机会. 一个通用的 Agent 模型不仅需要高级智能，还需要原生处理复杂多模态上下文的能力——包括图像、视频、文本、网页和文档——并将这些异构输入整合到统一的感知、推理和决策过程中.</p>
<p>为实现这一目标，我们在模型设计、训练和基础设施方面引入了一系列协调一致的进展，以实现更原生的多模态建模. 在模型设计上，我们开发了 CogViT，一种面向多模态细粒度理解的新型视觉Encoder ，并提出了 Multimodal Multi-Token Prediction(MMTP，多模态多 token 预测)，它在支持纯文本和多模态输入的同时保持对大规模基础设施的友好性. 在训练上，我们在预训练和 supervised fine-tuning(SFT) 阶段深度融合视觉与语言，并在涵盖感知、推理和 Agent 能力的 30 多个任务类别上执行联合强化学习(Reinforcement Learning, RL)，由优化后的基础设施栈支持大规模多模态 RL. 基于这些进展，我们通过工具链扩展、框架集成和生态建设进一步扩展了 GLM-5V-Turbo 的多模态 Agent 能力. 我们还提出了一个视觉-centric 的深度搜索基准 ImageMining，用于评估模型「以图像思考、以图像深度搜索」的能力.</p>
<p>这些进展赋予了 GLM-5V-Turbo 原生多模态 Agent 能力，同时相对于其纯文本基座模型 GLM-5-Turbo 保留了强劲的基于文本的 Agent 和编码性能. 这在基准结果和实际 Agent 设置中都得到了体现，包括聊天机器人环境(如 Z.ai)和基于框架的场景(如 Claude Code 和 OpenClaw). GLM-5V-Turbo 在多模态 Agent 基准上取得了强劲结果，包括多模态工具使用(ImageMining 30.7、BrowseComp-VL 51.9、MMSearch 72.9、SimpleVQA 78.2)、GUI Agent 任务(AndroidWorld 75.7 和 OSWorld 62.3)以及 Claw 评估(PinchBench 87.0/80.7、ClawEval 57.7/75.0、ZClawBench 57.6). GLM-5V-Turbo 在多模态和纯文本设置下均展示了强劲的编码性能：在多模态设置下，Design2Code 达到 94.8，超越 Claude Opus 4.6; 在纯文本设置下，保留了 GLM-5-Turbo 的编码能力，甚至在 CC-Backend(22.8)、CC-Frontend(68.4)和 CC-RepoExploration(72.2)上超越后者.</p>
<p>开发 GLM-5V-Turbo 还揭示了几条关于 Agent 模型开发的更广泛经验. 感知仍然是更高级多模态能力的基础，而 Agent 能力往往通过分层优化比通过单块端到端训练更有效地获得. 此外，端到端 Agent 任务需要清晰的规范、可靠的验证和仔细控制的评估，以有效构建、评估和优化. 在本报告中，我们总结了开发 GLM-5V-Turbo 的主要实践和经验教训，为未来原生多模态 Agent 的工作提供参考.</p>
<hr>
<h2 id="2-mx-xlyjcss">2 模型、训练与基础设施</h2>
<h3 id="2-1-cog-vi-t-sj-encoder">2.1 CogViT 视觉Encoder</h3>
<p>我们开发了 CogViT，一种面向多模态感知和下游 Agent 任务的新型参数高效视觉Encoder . 它在通用物体识别、细粒度理解以及几何和空间感知方面均具备强劲能力. 如图 1 所示，CogViT 在这些领域取得了有竞争力的性能. 为了平衡表征学习与跨模态对齐，我们采用两阶段预训练方案.</p>
<blockquote>
<p>图 1: CogViT 与其他 SOTA 视觉Encoder 在通用和细粒度多模态任务上的性能对比. 数据来源: 原文 Figure 1.</p>
</blockquote>
<p>第一阶段，我们使用基于蒸馏的掩码图像建模来强化视觉表征. 具体地，我们训练学生 ViT 重建被掩码的区域(掩码率 35%，分辨率 224 x 224)，特征空间来自双教师模型：SigLIP2 提供语义表征，DINOv3 提供纹理特征. 训练数据遵循质量感知的混合策略：80% 高质量自然图像、10% 指令跟随数据和 10% 科学图像. 我们使用 Muon 优化器配合余弦衰减调度进行优化. 此外，我们引入 QK-Norm 在注意力计算前对 Query 和 Key 向量进行归一化，有效缓解 logit 爆炸并确保大规模训练稳定性.</p>
<p>第二阶段转向对比式图文预训练，以在共享嵌入空间中对齐视觉和文本特征. 与第一阶段相比，我们引入了三项关键升级：(1) 用 NaFlex 方案替换固定的 224 x 224 分辨率，以处理可变尺寸输入同时保留原始长宽比; (2) 使用基于 sigmoid 的 SigLIP loss 将全局 batch size 扩展到 64K，并配合双向分布式实现以提升效率; (3) 利用 80 亿规模的中英双语图文语料来增强跨语言理解. 我们继续使用 Muon 优化器，为视觉、文本和投影组件分配模块特定的学习率和衰减调度.</p>
<blockquote>
<p><strong>[设计动机]</strong> CogViT 的两阶段预训练策略</p>
<p>为什么需要两阶段而不是一阶段端到端训练? 第一阶段掩码图像建模(MIM)的目的是让视觉Encoder 「学会看」——在没有文本监督的情况下建立强大的视觉表征. SigLIP2 和 DINOv3 作为教师模型提供了互补的信号：SigLIP2 擅长语义理解(「这是什么」)，DINOv3 擅长纹理和局部特征(「长什么样」). 这类似于人类视觉系统的发育：先在大量视觉输入中建立基础感知能力，再学习将视觉与语言关联. 如果直接从随机初始化开始对比学习，模型可能会在视觉表征尚未成熟时就被迫对齐到文本空间，导致「为了对齐而牺牲视觉质量」的问题. 第二阶段 NaFlex 的引入也很关键：固定 224x224 的输入对 Agent 任务中的截图和 GUI 图像并不友好，因为这些图像往往有各种长宽比. NaFlex 让模型保持了对原始图像几何的敏感性，这对后续的 grounding 和空间推理至关重要.</p>
</blockquote>
<h3 id="2-2-dmtd-token-yc-mmtp">2.2 多模态多 Token 预测 (MMTP)</h3>
<p>我们提出 Multimodal Multi-Token Prediction(MMTP，多模态多 token 预测)，一种多 token 预测(MTP)的多模态扩展，旨在支持纯文本和多模态输入同时保持对大规模基础设施的友好性. 目标是保留可接受的序列长度以及训练和推理效率. 在标准纯文本 MTP 中，前缀 token 可以通过 token ID 直接传入 MTP head，并用词嵌入层嵌入. 然而，一旦 MTP 扩展到多模态输入，一个核心问题就出现了：图像 token 应该如何传递到 MTP head? 为此，我们系统比较了三种备选方案.</p>
<p>方案一：直接将 LLM 骨干输入端的视觉嵌入传递给 MTP head.</p>
<p>方案二：在 MTP head 输入端掩码掉所有视觉 token，退化为纯文本 MTP.</p>
<p>方案三：保留视觉位置信息，但将所有视觉 token 替换为一个共享的可学习 <code>&lt;|image|&gt;</code> 特殊 token 作为视觉输入表征.</p>
<p>综合考虑优化行为和系统效率，GLM-5V-Turbo 最终采用方案三. 与直接将视觉嵌入传递给 MTP head 相比，使用 <code>&lt;|image|&gt;</code> token 消除了跨流水线并行(Pipeline Parallelism, PP)阶段传播视觉嵌入的需求，大幅降低了通信复杂度，同时提升了系统可扩展性和工程可维护性. 经验上，根据在 0.5B 模型上的消融研究，基于 <code>&lt;|image|&gt;</code> 的设计比直接使用视觉嵌入实现了更低的训练损失和更稳定的收敛. 我们假设这是因为 MTP head 通常是轻量级的，可能没有足够的建模容量来有效吸收分布与文本嵌入差异显著的视觉表征; 相比之下，<code>&lt;|image|&gt;</code> token 以更加统一的形式呈现输入，从而缓解了这种优化困难. 同时，与完全掩码视觉 token 相比，该设计自然兼容现有的分区策略(如序列并行和上下文并行)，无需对视觉嵌入分区、对齐或偏移映射进行额外处理，减少了实现复杂度. 总体而言，该设计在多模态建模能力、训练稳定性和系统效率之间取得了更平衡的权衡.</p>
<blockquote>
<p>图 2: 多模态多 token 预测(MMTP)设计示意图. 左下角：训练损失曲线对比方案一与方案三，被采纳的方案实现了更低损失. 数据来源: 原文 Figure 2.</p>
</blockquote>
<blockquote>
<p><strong>[架构细节]</strong> 为什么 <code>&lt;|image|&gt;</code> token 比直接传视觉嵌入更好?</p>
<p>这个选择揭示了一个工程上的深层权衡. 在纯文本 MTP 中，MTP head 接收的是与主模型相同的词嵌入，分布一致. 但视觉嵌入来自 CogViT + MLP Adapter，其分布特性(维度、数值范围、稀疏性)与词嵌入截然不同. 如果直接把视觉嵌入塞进轻量级 MTP head，相当于强迫一个为文本优化的网络去处理异构输入——这就像让专修中文的翻译家直接翻译阿拉伯语诗歌，不是不能做，但效果打折扣. <code>&lt;|image|&gt;</code> token 的作用是把「视觉存在」编码为一个统一的信号，让 MTP head 专注于预测下一个文本 token，而不必处理复杂的视觉嵌入传播. 从并行训练角度看，PP 阶段间的通信量大幅降低：视觉嵌入通常有很多 token(如 ViT 的 256 个 patch)，而 <code>&lt;|image|&gt;</code> 只需一个 token. 在 128 层以上的大模型中，跨 PP 阶段的视觉嵌入 all-gather 会成为显著瓶颈. 但代价是 MTP head 无法利用视觉细节来辅助预测——这对纯文本 MTP 是无关紧要的，因为多模态场景下 MTP 主要预测的是文本输出.</p>
</blockquote>
<h3 id="2-3-gz-tly-agent-nldgfxl">2.3 感知、推理与 Agent 能力的广泛训练</h3>
<p>多模态 Agent 的实际性能取决于感知、推理、规划和执行的联合发展，这使得狭窄的领域特定优化是不够的. 为提升这些能力，我们从预训练阶段开始就深度融合视觉与语言，强化模型表征和处理多模态上下文的原生能力. 在预训练阶段，我们使用纯文本和多模态数据的混合来促进多样化能力的平衡发展. 多模态数据集涵盖广泛的类别，包括世界知识、图文交错、OCR、编码、GUI、视频、多模态工具使用、空间感知、grounding 和学科问题求解. 我们特别重视多模态编码数据，以更好地将视觉理解与代码生成对齐，并提升模型在多模态 Agent 任务中的表现.</p>
<p>GLM-5V-Turbo 进一步在 30 多个任务类别上经历联合 RL 优化. 我们采用了若干技术改进，如 UI-to-code 任务中的相对视觉策略优化. 这种广泛的训练设置在多个层面带来增益：在感知层面，模型在 2D 图像 grounding 和指向任务上取得提升(与 SFT 相比，RL 阶段在 RefCOCO-avg 和 PointBench 上分别提升 4.8% 和 3.2%)，视频理解(+5.6% on MVBench)、3D grounding(+7.7% on SUNRGBD)、OCR(+4.2% on OCRBench)和图表理解(+7.7% on CharXiv); 在推理密集型任务如 STEM(+1.8% on MMMU_Val、MMMU_Pro、MathVista 和 LogicVista)上，它展现出更稳定的问题求解能力; 在 Agent 设置中——包括 GUI Agent(+4.9% on OSWorld)、编码 Agent(+0.2% on CC-Backend)和通用工具使用(+3.5% on MMSearch，展示了改进的规划与执行能力). 重要的是，这些增益不限于单一任务族，而是在广泛的任务集合上保持相对一致.</p>
<blockquote>
<p><strong>[数据实验]</strong> 多任务 RL 的跨域增益与未覆盖能力衰退</p>
<p>论文中有一个非常关键但容易被忽略的观察：RL 未覆盖的能力在 post-training 后可能下降. 这是一个深刻的发现. 具体地，「随着 RL 进行，模型容量和学到的思维模式越来越集中在采样的任务分布周围，削弱了模型在欠表示领域保持性能的能力」. 这意味着 RL 的任务覆盖范围本身就是塑造模型最终泛化边界的重要因素. 这与 SFT 中常见的跨域 trade-off 不同：SFT 中在一个任务上提升往往伴随另一个任务的下降，而 RL 的跨域干扰更弱——多个领域可以同时提升. 但 RL 有一个更隐蔽的代价：它会把模型的「认知资源」重新分配到训练任务上，未被训练的任务可能因「遗忘」而性能下降. 这对实践者的启示是：如果你需要在某个特定场景部署模型，必须确保该场景在 RL 任务覆盖范围内，或者至少找到语义/结构相关的 proxy 任务. 例如，论文发现「单轮 UI-to-code 生成上的 RL 可以支持更复杂的多轮编码能力」——这就是 proxy 任务的正面案例.</p>
</blockquote>
<p>这种多任务 RL 设置还表现出我们在早期探索(如 GLM-4.1V-Thinking 和 GLM-4.5V)中持续观察到的几个特性. 与 SFT 中常见的跨域权衡相比，RL 倾向于表现出更弱的跨域干扰，允许多个领域一起以稳定的增益提升. 有趣的是，在分布较窄、单任务 RL 容易震荡的领域，协同训练可以通过暴露模型于更丰富的策略分布来使优化更稳定，并引导其走向更鲁棒的解决方案. 除此之外，我们观察到一些思维模式跨任务的迁移：在一个领域获得的推理行为有时可以迁移到另一个领域并在那里产生可衡量的收益. 这表明多任务 RL 的价值不仅在于覆盖更广泛的任务范围，还在于在策略模式层面诱导更深层次的共享.</p>
<h3 id="2-4-dgmdmtqhxx">2.4 大规模多模态强化学习</h3>
<p>在 Agent 时代，训练基础设施在效率和稳定性方面面临更严格的要求，尤其是在大规模多任务多模态强化学习中. 与传统训练相比，这一设置必须处理 prompt 和 response 长度的广泛变化，支持单步和多步任务，并为每个任务协调一个或多个基于规则或基于模型的验证器. 为解决这些挑战，我们沿四个维度系统性地重新设计了训练栈：统一任务与奖励抽象、端到端异步与阶段重叠、多模态工作负载的细粒度内存管理，以及视觉输入的拓扑感知分区与负载均衡.</p>
<p><strong>统一任务与奖励抽象.</strong> 我们构建了一个统一的 VLM RL Gym，为单步和多步任务提供一致的环境接口，使异构任务类型可以在同一训练框架内处理. 同时，我们引入了一个独立的奖励系统，集中编排多个验证器. 基于规则的验证器在本地同步执行，而基于模型的评判器通过 API 异步调用; 它们的输出然后通过可配置的聚合策略组合为奖励，而不将验证器逻辑与主训练代码路径纠缠. 为提升混合任务训练中的可观察性，每个样本还携带一个数据源标签，允许跨并行组聚合 source-specific 指标(如奖励和 pass@k)并分别报告.</p>
<p><strong>全流水线解耦、异步与阶段重叠.</strong> 我们重构训练流水线以解耦 rollout 推理、奖励评估、batch 构造和权重传输，以最大化这些阶段之间的重叠. 每个推理请求注册一个完成回调，因此一旦该请求完成即可触发奖励计算，而非等待整个 rollout batch 完成; 这减少了由长尾请求导致的流水线空闲时间. batch 构造与旧策略权重的 CPU-GPU 传输并行执行. 对于参考模型，参数常驻 CPU 内存，在参考前向之前异步预取到 GPU，并在使用后立即释放，允许参考计算与主训练步骤有效重叠. 系统还支持两种基于完成数量或时间阈值的提前中止模式. 被中止的 prompt 可以被缓存和复用，这有助于控制长尾延迟而不实质性降低数据利用率.</p>
<p><strong>多模态工作负载的细粒度运行时内存管理.</strong> 标准的重计算方案主要围绕纯文本训练设计，不能充分解决多模态输入引入的内存瓶颈. 为此，我们为视觉侧的 ViT 和 projector 模块设计了独立的内存管理策略，结合有针对性的重计算与 CPU offloading. 这防止了激活内存以朴素方式随图像数量线性增长，并在保持整体计算效率的同时大幅降低了运行时内存压力.</p>
<p><strong>视觉输入的拓扑感知分区与动态负载均衡.</strong> 对于长视频等视觉输入，序列长度差异显著，我们进一步引入了拓扑感知分区和动态负载均衡方案. 在常规实现中，分区在前向传播期间执行，这意味着每个 rank 必须首先持有完整的 patch tensor 然后重新分布，导致不必要的内存和通信开销. 为解决此问题，我们将 CP(Context Parallelism)和 TP(Tensor Parallelism)分区上移到数据加载阶段，并将分区边界与下采样组对齐，从而消除了跨 rank patch 聚合的需求. 在 DP(Data Parallelism)组间负载均衡后，通过异步 all-to-all 通信执行精确调度，使每个 rank 只接收它实际需要的分区. 我们进一步将大型 Python 对象从 GPU 通信路径移到 CPU 路径，在实践中降低了约 7GB 的 GPU 通信缓冲开销. 对于 rollout 阶段产生的变长序列，我们还对序列长度和 ViT token 数量执行联合 bin-packing，从而为计算和内存压力带来更均衡的 micro-batch.</p>
<blockquote>
<p><strong>[架构细节]</strong> 大规模多模态 RL 基础设施的工程深度</p>
<p>这四个维度的改造不是简单的工程调优，而是针对多模态 RL 特有瓶颈的系统性重构. 最值得关注的是「拓扑感知分区」：在长视频场景中，ViT 的 patch token 数量可能达到数万(如 1024x1024 图像 → 4096 patch，1 分钟 30fps 视频 → 7200 帧). 如果每个 GPU rank 都要先持有完整 tensor 再 partition，峰值内存会是最终需求的数倍. 将 partition 上移到数据加载阶段并与 downsample group 对齐，意味着数据在进入 GPU 之前就已经按计算单元切分好了——这本质上是用「数据预分区」换取「运行时零聚合」. 7GB 的 GPU 通信缓冲节省在 H100 80GB 上约占 9% 的显存，足以多塞一个 micro-batch. 另一个关键设计是「参考模型的 CPU 常驻 + 异步预取」：在 RL 中，参考模型用于计算 KL 散度约束，但它的前向传播可以与主模型的梯度更新重叠. 把参考模型权重放在 CPU 上(而非常驻 GPU)释放了宝贵的显存，而异步预取确保 GPU 不会空闲等待权重传输. 这些细节体现了智谱 AI 在训练基础设施上的工程成熟度.</p>
</blockquote>
<hr>
<h2 id="3-dmt-agent-nlyst">3 多模态 Agent 能力与生态</h2>
<h3 id="3-1-dmtgjlkz">3.1 多模态工具链扩展</h3>
<p>GLM-5V-Turbo 进一步扩展了其多模态工具链，使模型能够在更真实的环境中支持更完整的感知-规划-执行循环. 除了扩展视觉工具的种类外，模型还展示了维持长程参与的复杂能力，频繁在多种模态搜索、标注、截图和多模态网页阅读工具之间切换以实现彻底的任务解决. 因此，编码和任务执行不再局限于文本接口，而是迭代地建立在基于视觉的全面环境理解之上.</p>
<blockquote>
<p>表 1: 基于应用场景和工具集的多模态工具与处理功能分类. 以 zai_ 为前缀的工具为智谱专有开发，GLM-5V-Turbo 模型也兼容其他用户自定义工具.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">工具集</th>
<th align="left">工具名称</th>
</tr>
</thead>
<tbody><tr>
<td align="left">通用识别</td>
<td align="left">识别工具</td>
<td align="left">zai_recognize_plant, zai_recognize_location, zai_recognize_person</td>
</tr>
<tr>
<td align="left">多模态搜索</td>
<td align="left">搜索工具</td>
<td align="left">zai_search_web_text, zai_search_web_by_image, zai_search_similar_images, zai_search_web_images, zai_search_scholar</td>
</tr>
<tr>
<td align="left">浏览器</td>
<td align="left">浏览器工具</td>
<td align="left">zai_load_image_from_url, zai_read_webpage</td>
</tr>
<tr>
<td align="left">图像处理</td>
<td align="left">图像处理工具</td>
<td align="left">zai_crop_image, zai_draw_image_bounding_boxes, zai_draw_image_point_markers, zai_draw_image_geometry, zai_draw_image_3d_bounding_boxes, zai_draw_video_objects_tracking</td>
</tr>
<tr>
<td align="left">创作</td>
<td align="left">网页创作</td>
<td align="left">submit_plan, apply_edits, zai_generate_web_html, zai_generate_web_outline</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">幻灯片创作</td>
<td align="left">zai_generate_slide_html, zai_generate_outline_ppt</td>
</tr>
<tr>
<td align="left">深度研究</td>
<td align="left">多模态 DR 工具</td>
<td align="left">zai_dr_python, zai_dr_open_url_mm, zai_dr_visit_img, zai_dr_search, zai_dr_images_search, zai_dr_images_lens</td>
</tr>
</tbody></table>
<p>这些架构进展在专门的基准上得到了显著性能增益的验证. 与我们最近的模型 GLM-4.6V 相比，GLM-5V-Turbo 在复杂多模态任务上实现了实质性飞跃; 值得注意的是，它在 MMSearch-Plus 上取得了 30.0 分，相比前代有近八倍的提升. BrowseComp-VL(51.9)和 ImageMining(30.7)也展现了强劲增长，这两个基准专门测试模型浏览网页界面和提取深度视觉洞察的能力. 通过在这些类别上匹配或超越 Kimi K-2.5 和 Claude Opus 4.6 等行业基准，GLM-5V-Turbo 证明了其处理现代 Agent 工作流所需的高维推理能力.</p>
<p>这种扩展对多模态 Agent 尤为重要. 许多真实世界的任务不仅仅是阅读文本和调用函数; 它们要求模型首先解释视觉环境，决定下一步做什么，然后基于行动结果继续调整行为. 例如，在复现真实网站时，模型可以首先使用多模态 GUI Agent 通过截图、与页面元素交互和跨页面导航来探索网站，建立对布局、功能和交互流的更丰富理解. 然后它可以依赖其原生 UI-to-code 能力更忠实地复现网站. 同样，当需要整合图像等媒体资产时，它们可以通过裁剪等原生工具直接处理后再嵌入最终输出.</p>
<h3 id="3-2-ywb-agent-kjdjc">3.2 与外部 Agent 框架的集成</h3>
<p>GLM-5V-Turbo 部署策略的关键组件是其与行业标准外部 Agent 框架的无缝集成. 通过超越孤立工具调用，模型充当 Claude Code 和 AutoClaw 等系统的认知核心，弥合高级推理与低级系统执行之间的差距. 与 Claude Code 的集成将 GLM-5V-Turbo 从被动代码生成器转变为活跃的系统级协作者. 在该框架内，模型利用其多模态能力来导航复杂的终端环境和本地文件系统. Claude Code 处理逻辑和环境，AutoClaw 为基于浏览器和 GUI 的自动化提供「双手」. GLM-5V-Turbo 充当 AutoClaw 的视觉-语言控制器，实现复杂的 Agent 工作流.</p>
<p>GLM-5V-Turbo 与这些框架的融合促进了完整的感知-规划-执行循环. 通过将特定执行逻辑卸载给 Claude Code 和 AutoClaw，模型可以专注于高维推理. 这一转变标志着模型角色的根本转变：它不再只是基于文本的助手，而是扎根于真实环境的多模态行动者，能够跨多样化数字界面自主解决任务.</p>
<h3 id="3-3-image-mining-sj-centric-sdssjz">3.3 ImageMining: 视觉-centric 深度搜索基准</h3>
<p>多模态 Agent 的核心潜力在于将推理锚定在视觉上下文中——我们称之为「以图像思考、以图像深度搜索」的范式. 为评估这一点，我们引入了 ImageMining，一个旨在测试高密度视觉理解与自主多模态搜索整合的基准.</p>
<p>与传统 VQA 不同，ImageMining 要求模型通过 Agent 行为主动挖掘视觉输入. 成功依赖于多步工具调用，如局部裁剪或放大细节以细化搜索查询. 这一「Deep-Wide-Search」谱在搜索广度和视觉推理深度上评估模型，其中任务性能与图像上工具使用的精确度强相关.</p>
<p>ImageMining 包含 217 个精选测试用例，源自人工收集的轨迹样本，跨越七个领域(社交、娱乐、产品、地点、富文本、自然和科学)和五个推理类别：</p>
<ul>
<li><strong>通用识别</strong>：动植物的细粒度识别.</li>
<li><strong>时空推理</strong>：基于视觉线索的地理推断.</li>
<li><strong>事件推理</strong>：对新闻事件和产品发布的理解.</li>
<li><strong>文本推理</strong>：对嵌入富文本(如学术论文、报告)的推理.</li>
<li><strong>视觉搜索</strong>：交叉引用视觉输入以检索特定艺术品或图像.</li>
</ul>
<blockquote>
<p><strong>[设计动机]</strong> ImageMining 的 Visual Jump 约束</p>
<p>ImageMining 最核心的设计不是 217 个测试用例，而是「Visual Jump」(WEB_VISUAL)约束：在数据构建时，中间推理跳跃必须涉及视觉转换，强制模型解析图像而非依赖文本捷径或参数化知识. 这是一个非常巧妙的防作弊设计. 传统 VQA 基准的问题在于，模型可能通过「参数化知识」直接回答——比如看到一张埃菲尔铁塔的照片，模型不需要真正「看」图像，因为它在预训练中已经知道「埃菲尔铁塔在巴黎」. Visual Jump 强制模型必须通过工具调用(如裁剪、放大、搜索)来逐步探索图像，每一步都涉及视觉信息的转换. 这保证了评估的是「以图像为环境的 Agent 能力」，而非「看图说话的 VQA 能力」. ImageMining 已在 GitHub 开源(zai-org/ImageMining)，这对社区是一个重要贡献——它提供了一个可复现的、专门针对视觉-centric Agent 的评测工具.</p>
</blockquote>
<p>为使 GLM-5V-Turbo 具备这些能力，我们开发了一个覆盖知识发现、QA 重构和质量过滤的多阶段自动化数据流水线. 该过程中的一个关键约束是「Visual Jump」(WEB_VISUAL)：在发现过程中，中间推理跳跃必须涉及视觉转换，强制模型解析图像而非依赖文本捷径或参数化知识. 此外，我们为图表、地图和海报构建了专门的 OCR 搜索数据. 这迫使模型在执行搜索链之前先进行实体隔离和局部裁剪，将图像从静态输入转变为深度探索的交互环境.</p>
<h3 id="3-4-dmtsdyjynrcz">3.4 多模态深度研究与内容创作</h3>
<p>利用其 Agent 能力，GLM-5V-Turbo 促进完整的多模态深度研究工作流，涵盖来自异构来源的迭代信息收集、证据整合和长文本合成. 与传统以文本为中心的 Agent 不同，该工作流从开放式目标开始，通过自主的规划、多模态阅读和状态更新循环推进. 通过原生解析视觉丰富的网页、图表和结构化文档，模型访问了高价值证据——如幻灯片和图表——这些在纯文本流水线中通常被丢弃.</p>
<p>该系统的一个决定性特征是其集成的多模态推理. 模型不是将图像视为外围数据，而是同时提取文本和视觉证据(如表格区域、截图). 这对真实研究环境至关重要，因为在真实研究环境中关键洞察往往分布在文档布局和视觉工件中，而非孤立在文本段落内.</p>
<p>除信息获取外，GLM-5V-Turbo 还支持多样化的、面向展示的下游格式：</p>
<ul>
<li><strong>交错报告</strong>：生成文本-图像交错输出，其中视觉证据与基于证据的解释嵌入在一起——适用于对比分析和文献综述.</li>
<li><strong>深度研究到 PPT</strong>：将收集的材料综合为结构化幻灯片组，包括页面分配和多模态内容组织，以模拟专业演示工作流.</li>
<li><strong>文档式撰写</strong>：创建博客式解读或结构化笔记，保持研究发现的视觉-文本完整性.</li>
</ul>
<p>这些能力进一步延伸到文档驱动的生成. 用户可以提供复杂的源材料供模型重组为结构化幻灯片或交错式解读. 通过保留文本结论与支持视觉证据之间的协同作用，GLM-5V-Turbo 标志着从简单多模态信息检索到全面多模态转换与呈现的系统级转变.</p>
<h3 id="3-5-gf-skills">3.5 官方 Skills</h3>
<p>作为擅长 Agent 和编码任务的基础模型，GLM-5V-Turbo 可以 readily 集成到通用和编码 Agent 框架(如 OpenClaw、AutoClaw 和 Claude Code)中，这些框架在社区中越来越受欢迎. 为了让用户更容易在这些 Agent 系统中使用 GLM-5V-Turbo 并更好地发挥其优势，我们提供了一组官方 skills，分为两类：一类建立在 GLM-5V-Turbo 模型的原生能力之上，另一类将 GLM-5V-Turbo 包装为外部工具(以 MaaS API 的形式)供 OpenClaw、AutoClaw 和 Claude Code 调用. 此外，我们基于先前发布的专用模型 GLM-OCR 和 GLM-Image 开发了 5 个 skills，以支持更广泛的场景和任务. 为帮助用户更好地理解、安装和使用官方 skills，我们还提供了一个统一的 master skill.</p>
<blockquote>
<p>表 2: GLM-5V-Turbo 支持的官方 skills 概览.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">Skill</th>
<th align="left">类型</th>
<th align="left">URL</th>
</tr>
</thead>
<tbody><tr>
<td align="left">PDF-to-Web</td>
<td align="left">Native</td>
<td align="left"><a href="https://clawhub.ai/zai-org/glmv-pdf-to-web">https://clawhub.ai/zai-org/glmv-pdf-to-web</a></td>
</tr>
<tr>
<td align="left">PDF-to-PPT</td>
<td align="left">Native</td>
<td align="left"><a href="https://clawhub.ai/zai-org/glmv-pdf-to-ppt">https://clawhub.ai/zai-org/glmv-pdf-to-ppt</a></td>
</tr>
<tr>
<td align="left">Web Replication</td>
<td align="left">Native</td>
<td align="left"><a href="https://clawhub.ai/zai-org/glmv-web-replication">https://clawhub.ai/zai-org/glmv-web-replication</a></td>
</tr>
<tr>
<td align="left">PRD-to-App</td>
<td align="left">Native</td>
<td align="left"><a href="https://clawhub.ai/zai-org/glmv-prd-to-app">https://clawhub.ai/zai-org/glmv-prd-to-app</a></td>
</tr>
<tr>
<td align="left">Stock Analyst</td>
<td align="left">Native</td>
<td align="left"><a href="https://clawhub.ai/zai-org/glmv-stock-analyst">https://clawhub.ai/zai-org/glmv-stock-analyst</a></td>
</tr>
<tr>
<td align="left">Image Captioning</td>
<td align="left">External Tool</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmv-caption">https://clawhub.ai/JaredforReal/glmv-caption</a></td>
</tr>
<tr>
<td align="left">Visual Grounding</td>
<td align="left">External Tool</td>
<td align="left"><a href="https://clawhub.ai/jaredforreal/glmv-grounding">https://clawhub.ai/jaredforreal/glmv-grounding</a></td>
</tr>
<tr>
<td align="left">Doc-based Writing</td>
<td align="left">External Tool</td>
<td align="left"><a href="https://clawhub.ai/jaredforreal/glmv-doc-based-writing">https://clawhub.ai/jaredforreal/glmv-doc-based-writing</a></td>
</tr>
<tr>
<td align="left">Resume Screening</td>
<td align="left">External Tool</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmv-resume-screen">https://clawhub.ai/JaredforReal/glmv-resume-screen</a></td>
</tr>
<tr>
<td align="left">Prompt Generation</td>
<td align="left">External Tool</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmv-prompt-gen">https://clawhub.ai/JaredforReal/glmv-prompt-gen</a></td>
</tr>
<tr>
<td align="left">General OCR</td>
<td align="left">Specialized</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmocr">https://clawhub.ai/JaredforReal/glmocr</a></td>
</tr>
<tr>
<td align="left">Table Recognition</td>
<td align="left">Specialized</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmocr-table">https://clawhub.ai/JaredforReal/glmocr-table</a></td>
</tr>
<tr>
<td align="left">Handwriting Recognition</td>
<td align="left">Specialized</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmocr-handwriting">https://clawhub.ai/JaredforReal/glmocr-handwriting</a></td>
</tr>
<tr>
<td align="left">Formula Recognition</td>
<td align="left">Specialized</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glmocr-formula">https://clawhub.ai/JaredforReal/glmocr-formula</a></td>
</tr>
<tr>
<td align="left">Image Generation</td>
<td align="left">Specialized</td>
<td align="left"><a href="https://clawhub.ai/JaredforReal/glm-image-gen">https://clawhub.ai/JaredforReal/glm-image-gen</a></td>
</tr>
</tbody></table>
<hr>
<h2 id="4-kfgczdsjsj">4 开发过程中的设计视角</h2>
<p>除了上述进展外，构建 GLM-5V-Turbo 的过程还让我们获得了几个关于 Agent 模型开发的实用视角. 我们将它们作为在我们开发过程中反复证明有用的设计视角呈现，而非作为普适规则.</p>
<p><strong>视角 1：感知仍然是更高级多模态能力的基础.</strong> 近期工作越来越强调规划、推理和反思等高层能力. 然而，我们的观察是，多模态能力的进一步提升仍然关键地依赖于感知. 即使在当前最强的 VLM 中，细粒度感知和空间理解中的错误仍然常见，而这些错误往往会传播到下游推理、决策和执行. 换句话说，许多看似高层失败的起点，实际上是模型没有足够准确地看到环境.</p>
<p>在我们的开发中，多模态编码和 grounding 被证明是感知学习的有用代理任务. 前端或 SVG 编码等任务要求模型捕捉布局、结构、相对位置和局部细节，而非仅依赖粗略语义. 我们发现，在预训练中添加特定主题图像与其 SVG 表征之间的配对数据对下游 STEM 问题求解有积极贡献，同时在 RL 中强化 grounding 相关训练也改善了 GUI Agent 性能. 这些观察表明，一些看似下游的结构化任务实际上可以提供通往更好感知的有用路径. 我们还发现，显式训练模型批判自身感知有助于减少生成中的幻觉. 在 GUI Agent 指令微调中，我们包含针对推理过程中错误的批判数据子集，如误读界面细节、误识别目标元素和对下一步行动做出错误决策. 这改善了模型在 GUI 细节上的观察质量并减少了几种反复出现的感知失败模式. 更广泛地说，我们的观点是感知不是一个可以在早期解决然后丢在一边的低级模块; 它持续塑造着更高级多模态能力的上限.</p>
<p><strong>视角 2：Agent 能力可以通过分层优化更高效地构建.</strong> Agent 训练本质上是资源密集型的：环境设置和任务构建成本高，高质量数据稀缺，可靠的验证往往困难. 同时，Agent 任务本身难以高效优化，因为它们通常涉及复杂的组合、长交互轨迹、非唯一解路径以及对演变环境状态的强依赖. 在这些条件下，一个核心问题是如何在有限资源下最大化数据构建的回报.</p>
<p>这促使我们采用分层优化策略. 根据我们的经验，当优化分布在能力层次的多个级别上，而非主要集中于高层长程任务时，Agent 能力的发展更有效. 例如，在 GUI Agent 开发中，这促使我们构建了一个跨越元素感知、GUI grounding、单步动作预测和轨迹级动作预测的多级任务层次，并将其用于 SFT 和 RL. 这种设计的吸引力有两方面：在相同资源约束下，低级任务通常比长程任务更容易构建、标注和验证; 而当低级能力尚未充分发展时，仅推高层任务往往无法产生可靠的增益，反而可能使训练更不稳定. 总体而言，分层优化不仅作为提高效率的方式，也是通往更稳定 Agent 训练的实用路径.</p>
<p><strong>视角 3：端到端长程任务的构建、评估和优化关键在于清晰的任务规范、可靠的结果验证和受控的评估流程.</strong> 对多模态 Agent 而言，真正的挑战往往不是将任务扩展到更长的范围，而是使端到端任务足够稳定以作为评估和优化的有意义目标. 许多真实的 Agent 设置本质上是开放式的，目标 underspecified、执行边界模糊、结果严重依赖中间决策. 因此，它们往往难以一致地比较，更难转化为可复用的优化信号.</p>
<p>这让我们获得了一个更广泛的视角：端到端任务的价值不仅取决于它有多真实，还取决于它是否能被足够清晰地规范、足够可靠地验证、并在足够受控的程序下评估以产生稳定且可复用的反馈. 这一视角塑造了我们关于数据构建、评估和下游优化的思考方式. 在多模态 Agent 设置中，任务定义往往依赖多个约束源而非单一 prompt，而评估不仅需要在最终结果的层面有结构，还需要在验证过程本身层面有结构. 在这一视角下，任务定义、验证设计和反馈结构应该被一起考虑而非孤立考虑.</p>
<p>Vision2Web 是我们面向端到端视觉网站开发的基准，是这一视角的具体实例化. 每个任务不仅 grounded 于文本指令，还 grounded 于更丰富的规范，可能包括 PRD、mockup、参考页面和资源资产，使任务定义更好被规范. 在评估侧，我们不将网站开发视为 loosely specified 的开放式问题，而是使用基于工作流的验证，使执行通过受控的依赖步骤序列而非单一最终状态来评估. 这使得比较系统、归因失败和分别建模不同形式的信号变得更加容易——例如交互执行期间的功能正确性和更孤立比较设置中的视觉一致性. 从这个意义上说，Vision2Web 不仅是一个基准，也是在更好支持可靠评估和优化的方向上对齐任务构建、验证和反馈设计的具体尝试.</p>
<hr>
<h2 id="5-pg">5 评估</h2>
<p>我们在四个类别上评估 GLM-5V-Turbo：</p>
<ul>
<li><strong>多模态编码</strong>：Design2Code、Flame-VLM-Code、Vision2Web; </li>
<li><strong>多模态工具使用</strong>：ImageMining、BrowseComp-VL、MMSearch、MMSearch-Plus、SimpleVQA、Facts、V*; </li>
<li><strong>GUI Agent</strong>：OSWorld、AndroidWorld、WebVoyager; </li>
<li><strong>纯文本编码与 Claw</strong>：CC-Bench-V2、PinchBench、ClawEval、ZClawBench.</li>
</ul>
<blockquote>
<p>图 4: GLM-5V-Turbo 在多模态编码、工具使用和 GUI Agent 基准上的评估. 数据来源: 原文 Figure 4.</p>
</blockquote>
<p>在这些维度上，GLM-5V-Turbo 表现出一致的模式：它在面向编码和 Agent 任务的多模态基准上取得强劲性能，同时在纯文本任务上保持扎实的能力. 这种平衡与我们对 GLM-5V-Turbo 的核心目标一致：构建基础多模态 Agent 能力，同时不牺牲文本优先工作流所需的编码和推理能力.</p>
<blockquote>
<p>图 5: GLM-5V-Turbo 在文本编码和 Claw Agent 基准上的评估. 数据来源: 原文 Figure 5.</p>
</blockquote>
<p>在多模态编码和工具使用基准上，GLM-5V-Turbo 在 UI-to-code 生成、视觉网站开发、多模态搜索和视觉 grounded QA 上表现强劲. 它在 GUI Agent 基准(如 AndroidWorld 和 WebVoyager)上也极具竞争力，表明其视觉理解能有效迁移到 grounded 交互和动作. 同时，在 CC-Bench-V2(包括 CC-Backend、CC-Frontend 和 CC-Repo-Exploration，评估模型在 Claude Code 框架上的性能)上，模型在纯文本编码上保持扎实，表明增加视觉能力并未实质性侵蚀其底层编码性能——这是多模态 Agent 基础的关键特性.</p>
<blockquote>
<p><strong>[数据实验]</strong> Design2Code 94.8 的含金量与局限</p>
<p>Design2Code 94.8 是 GLM-5V-Turbo 最吸引眼球的数字，超越了 Claude Opus 4.6 的 77.3. 但 Design2Code 评估的是「从设计图生成前端代码」的能力，这是一个相对结构化的任务：输入是静态 UI mockup，输出是 HTML/CSS. 这个任务的性能高度依赖于模型对布局、颜色、字体和组件的精确感知——这正是 CogViT + MMTP 的优势领域. 但需要注意的是，Design2Code 的「真实世界复杂度」有限：它不包含交互逻辑、后端集成或响应式适配. 相比之下，SWE-bench Verified/Pro 评估的是解决真实 GitHub issue 的能力，涉及代码理解、调试、测试和 PR 提交，复杂度高出不止一个数量级. 论文中 SWE-bench 的缺位是一个值得关注的信号——如果 GLM-5V-Turbo 在 SWE-bench 上也有强劲表现，论文几乎肯定会报道. 这可能意味着多模态能力虽然提升了前端开发，但对后端软件工程的增益尚不明显. 不过，Vision2Web 和 CC-Bench-V2 的结果已经证明了其在端到端网站开发和 Claude Code 框架中的实用性.</p>
</blockquote>
<p>我们还发现 GLM-5V-Turbo 能有效迁移到视觉赋能的通用 Agent 框架. 特别是，当集成到 Claw Agent 框架时，模型可以原生感知屏幕内容并更有效地对其采取行动，在 PinchBench、ClawEval 和 ZClawBench 等执行导向的评估上取得强劲结果. 虽然 Claw 只是代表性框架之一，但这些结果进一步证明了模型的多模态能力不限于孤立的基准增益，而是可以迁移到真实的端到端 Agent 执行中.</p>
<hr>
<h2 id="6-sytz">6 剩余挑战</h2>
<p>尽管取得了上述进展，若干挑战仍然是未来 Agent 模型开发的核心. 在我们看来，最困难的开放问题越来越不在于孤立的能力提升，而在于 Agent 策略的涌现、长程多模态上下文管理，以及模型能力与 harness 设计之间日益增长的纠缠.</p>
<p><strong>如何使更好的 Agent 策略涌现.</strong> Agent 训练仍然严重依赖手工制作或强过滤的冷启动轨迹. 这对初始化是有效的，但它也缩小了模型可能探索的推理和行动模式空间，因此后续的改进往往仍是局部的：模型变得更擅长执行熟悉的路径，而未能发现真正更好的路径. 在我们的实验中，我们发现增加冷启动阶段的轨迹多样性可以部分 loosen 这一约束，使 RL 更容易发现附近但有所改进的变体. 这表明轨迹多样性不仅仅是更广泛的数据覆盖问题，而可能是策略涌现本身的条件之一. 但这只是第一步. 更根本的目标是让模型自主发现更好的推理和 Agent 策略，而非局限于人类提供的起始模式的变体. 在此之上还有更难的挑战：让模型发现更丰富的组织形式，如子 Agent 分解、多 Agent 协作和更灵活的层次化决策结构.</p>
<p><strong>多模态上下文管理仍然是长程 Agent 的核心瓶颈.</strong> 与文本相比，图像尤其是视频更激进地消耗上下文预算，使它们在长轨迹上保留起来非常昂贵. 在实践中，许多系统通过在上下文增长时丢弃较早的视觉观察来应对. 虽然这是可以理解的工程妥协，但它也丢弃了可能对后续推理、规划或验证仍然重要的信息. 随着轨迹延长，挑战变得更加尖锐. 在纯文本设置中，Claude Code 等系统通常在上下文窗口开始填满时通过压缩或总结较早的交互历史来应对上下文压力; 在多模态设置中，忠实的压缩要困难得多，因为需要保留的不仅是语义内容，还有可能再次变得重要的视觉细节，如布局、空间关系或视频中的时间变化. 大多数当前的记忆机制本质上仍是文本中心的：它们更擅长压缩「说了什么」而非「看到了什么」，或视觉状态如何随时间演变. 对于长程多模态 Agent，简单适应文本记忆机制因此将是不够的. 需要的是一种更原生于多模态的上下文和记忆方法.</p>
<blockquote>
<p><strong>[局限风险]</strong> 模型与 harness 的共生关系：谁是瓶颈?</p>
<p>论文提出了一个非常深刻的观点：「Agent 系统的有效能力边界不再由模型单独决定，而是由模型及其周围的 harness 共同塑造」. 这意味着评估一个 Agent 模型时，你不能把它与 harness(工具链、框架、验证循环、记忆机制)分开来看. 同一个模型在不同的分解策略、工具使用策略、记忆设计或验证工作流下可能表现截然不同; 反之，看似模型局限的东西有时可能反映的是 harness 选择不佳. 这对评测方法论有重大影响：当 Kimi K2.6 在 BrowseComp 上得分 83.2 而 GLM-5V-Turbo 得 51.9 时，差距可能来自模型本身，也可能来自 harness 的设计差异——比如 Kimi 可能有更优化的浏览器工具实现. 更重要的是，这种依赖是双向的：harness 的有用性取决于模型的能力阶段，在一个阶段无效的设计可能在模型跨越推理、规划或反馈利用的阈值后变得关键. 这意味着 Agent 开发不能再被框定为单纯的模型改进：有效的能力边界越来越由模型和 harness 共同塑造，进步被优化和评估的目标也是如此. 这实际上是整个 Agent 领域的一个元问题：我们还没有建立区分「模型问题」和「harness 问题」的可靠方法论.</p>
</blockquote>
<p><strong>模型与 harness 越来越共同塑造系统的能力边界.</strong> 对 Agent 系统而言，有效的能力边界不再由模型单独决定，而是由模型及其周围的 harness 共同塑造. 这极大地扩展了设计空间：任务分解、工具使用、记忆机制和验证循环都可以影响系统在实践中能做什么. 同时，它也使开发路径 substantially 复杂化：同一个模型在不同的分解策略、工具使用策略、记忆设计或验证工作流下可能表现非常不同; 反之，看似模型局限的东西有时可能反映的是 harness 选择不佳. 更重要的是，这种依赖是双向的：harness 的有用性往往取决于模型的能力阶段，在一个阶段无效的设计可能在模型跨越推理、规划或反馈利用的阈值后变得关键. 这意味着 harness 不是可以独立于模型优化的稳定外部层. 它的角色、价值和最优形式随着模型演变而转变. 更广泛地说，这意味着 Agent 模型开发不能再被框定为单纯的模型改进：有效的能力边界越来越由模型和 harness 共同塑造，进步被优化和评估的目标也是如此.</p>
<hr>
<h2 id="7-gxz">7 贡献者</h2>
<p>核心贡献者(按名字首字母 Z 到 A 倒序排列)：Ziyang Pan, Zhen Yang, Yuting Wang, Yue Wang, Yuanchang Yue, Yu Wang, Yanling Wang, Yan Wang, Xijun Liu, Wenmeng Yu, Weihan Wang, Wei Li, Shuaiqi Duan, Sheng Yang, Ruiliang Lv, Mingdao Liu, Lihang Pan, Ke Ning, Junhui Ji, Jinjiang Wang, Jing Chen, Jiazheng Xu, Jiale Zhu, Jiale Cheng, Ji Qi, Guobing Gan, Guo Wang, Cong Yao.</p>
<p>技术负责人：Wenyi Hong, Xiaotao Gu.</p>
<p>学术顾问：Peng Zhang, Debing Liu, Bin Xu, Juanzi Li, Minlie Huang, Yuxiao Dong, Jie Tang.</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">CogViT</td>
<td align="left">面向多模态感知和 Agent 任务定制的视觉Encoder ，两阶段预训练(蒸馏式 MIM + 对比学习)</td>
</tr>
<tr>
<td align="left">MMTP</td>
<td align="left">Multimodal Multi-Token Prediction，多模态多 token 预测，用 \`&lt;</td>
</tr>
<tr>
<td align="left">MTP</td>
<td align="left">Multi-Token Prediction，多 token 预测，同时预测多个未来 token 以加速训练</td>
</tr>
<tr>
<td align="left">Muon</td>
<td align="left">一种面向神经网络隐藏层的优化器，在本工作中用于 CogViT 训练</td>
</tr>
<tr>
<td align="left">QK-Norm</td>
<td align="left">Query-Key Normalization，在注意力计算前对 Q/K 归一化以缓解 logit 爆炸</td>
</tr>
<tr>
<td align="left">NaFlex</td>
<td align="left">支持可变尺寸输入同时保留原始长宽比的图像处理方案</td>
</tr>
<tr>
<td align="left">SigLIP</td>
<td align="left">Sigmoid Loss for Language Image Pre-training，基于 sigmoid 的图文对比学习损失</td>
</tr>
<tr>
<td align="left">DINOv3</td>
<td align="left">自监督视觉表征学习模型，提供纹理和局部特征</td>
</tr>
<tr>
<td align="left">RL</td>
<td align="left">Reinforcement Learning，强化学习</td>
</tr>
<tr>
<td align="left">VLM RL Gym</td>
<td align="left">统一的多模态大模型强化学习环境，支持单步/多步任务</td>
</tr>
<tr>
<td align="left">Harness</td>
<td align="left">围绕模型的外部框架/工具链，包括任务分解、工具使用、记忆和验证</td>
</tr>
<tr>
<td align="left">OpenClaw</td>
<td align="left">开源个人 AI Agent 框架</td>
</tr>
<tr>
<td align="left">AutoClaw</td>
<td align="left">智谱自研的 Agent 框架，支持浏览器和 GUI 自动化</td>
</tr>
<tr>
<td align="left">Claude Code</td>
<td align="left">Anthropic 的 AI 辅助编程工具，支持终端和文件系统操作</td>
</tr>
<tr>
<td align="left">ImageMining</td>
<td align="left">视觉-centric 深度搜索基准，评估模型「以图像思考、以图像深度搜索」的能力</td>
</tr>
<tr>
<td align="left">Visual Jump</td>
<td align="left">ImageMining 数据构建中的核心约束，要求中间推理跳跃必须涉及视觉转换</td>
</tr>
<tr>
<td align="left">Vision2Web</td>
<td align="left">面向端到端视觉网站开发的层次化基准，使用基于工作流的验证</td>
</tr>
<tr>
<td align="left">CC-Bench-V2</td>
<td align="left">智谱自建的 Claude Code 框架评测基准，含前端/后端/仓库探索</td>
</tr>
<tr>
<td align="left">ZClawBench</td>
<td align="left">面向 OpenClaw 生态的端到端 Agent 任务基准</td>
</tr>
</tbody></table>
<h3 id="b-hxgsycssy">B. 核心公式与参数索引</h3>
<table>
<thead>
<tr>
<th align="center">编号</th>
<th align="left">内容</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="center">(1)</td>
<td align="left">CogViT 参数量 = 403M</td>
<td align="left">视觉Encoder</td>
</tr>
<tr>
<td align="center">(2)</td>
<td align="left">MIM 掩码率 = 35%</td>
<td align="left">第一阶段掩码图像建模</td>
</tr>
<tr>
<td align="center">(3)</td>
<td align="left">MIM 分辨率 = 224 x 224</td>
<td align="left">第一阶段输入分辨率</td>
</tr>
<tr>
<td align="center">(4)</td>
<td align="left">SigLIP batch size = 64K</td>
<td align="left">第二阶段对比学习全局 batch</td>
</tr>
<tr>
<td align="center">(5)</td>
<td align="left">双语图文语料 = 8B</td>
<td align="left">第二阶段训练数据规模</td>
</tr>
<tr>
<td align="center">(6)</td>
<td align="left"><code>&lt;|image|&gt;</code> token</td>
<td align="left">MMTP 中替代视觉嵌入的共享可学习特殊 token</td>
</tr>
<tr>
<td align="center">(7)</td>
<td align="left">RL 任务类别 = 30+</td>
<td align="left">联合强化学习的任务覆盖范围</td>
</tr>
<tr>
<td align="center">(8)</td>
<td align="left">GPU 通信缓冲节省 = ~7GB</td>
<td align="left">拓扑感知分区的实际收益</td>
</tr>
<tr>
<td align="center">(9)</td>
<td align="left">ImageMining 测试用例 = 217</td>
<td align="left">覆盖 7 个领域和 5 个推理类别</td>
</tr>
</tbody></table>
<h3 id="c-mxpxdw">C. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: GLM-5(arXiv:2602.15763, 744B MoE)、GLM-4.5V/GLM-4.1V-Thinking(多模态 RL 探索)</li>
<li><strong>核心创新</strong>: CogViT 双阶段视觉Encoder 、MMTP 多模态多 token 预测、30+ 任务联合多模态 RL、ImageMining 视觉-centric 基准、Claude Code/AutoClaw 框架原生集成</li>
<li><strong>被后续工作引用/改进</strong>: GLM-5.1(2026.04, Agentic Engineering 旗舰)</li>
<li><strong>同期竞争</strong>: Kimi K2.5/K2.6(Moonshot, 视觉 Agent)、Claude Opus 4.6(Anthropic)、GPT-5.4(OpenAI)、Gemini 3.1 Pro(Google)</li>
<li><strong>开源贡献</strong>: ImageMining 基准(zai-org/ImageMining)、官方 Skills(zai-org/GLM-skills)、CogViT 权重</li>
<li><strong>技术影响</strong>: 提出「感知是高层能力的基础」、「分层优化优于端到端 monolithic 训练」、「模型与 harness 共生」三个设计视角，对多模态 Agent 领域的方法论有重要启发</li>
</ul>
<blockquote>
<p><strong>历史定位</strong></p>
<p>GLM-5V-Turbo(2026.04)是智谱 AI 从「语言模型 + 视觉适配器」向「原生多模态 Agent 基座」转型的标志性产品. 与 GLM-4V-9B 等早期多模态模型不同，GLM-5V-Turbo 不是给语言模型「贴」一个视觉接口，而是从视觉Encoder (CogViT)、token 预测架构(MMTP)到 RL 训练框架全部重做. 这一转变反映了行业共识：真实的 Agent 任务天然是多模态的，模型必须能同时处理文字、图表、截图、网页和 GUI. 在技术上，CogViT 的 403M 参数在 ImageNet-1K 零样本 83.5 分和 CLIP Bench 70.4 分上超越了更大的 SigLIP2-SO(427M)和 DFN-H(632M)，证明了「为 Agent 任务定制」的Encoder 可以比「通用」Encoder 更高效. MMTP 的 <code>&lt;|image|&gt;</code> token 设计虽然牺牲了 MTP head 对视觉细节的直接访问，但大幅提升了训练系统的可扩展性——这是工程务实主义的体现. 从谱系角度看，GLM-5V-Turbo 与 Kimi K2.5/K2.6(视觉 Agent)和 Claude 3.5 Sonnet/GPT-4o(多模态理解)形成了直接竞争，但在「视觉作为推理核心组件」的定位上更为激进. 论文最后提出的三个 remaining challenges(策略涌现、多模态上下文管理、模型-harness 共生)实际上定义了 2026 年及以后多模态 Agent 研究的三大前沿方向.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-gs","text":"1 概述"},{"level":2,"id":"2-mx-xlyjcss","text":"2 模型、训练与基础设施"},{"level":3,"id":"2-1-cog-vi-t-sj-encoder","text":"2.1 CogViT 视觉Encoder"},{"level":3,"id":"2-2-dmtd-token-yc-mmtp","text":"2.2 多模态多 Token 预测 (MMTP)"},{"level":3,"id":"2-3-gz-tly-agent-nldgfxl","text":"2.3 感知、推理与 Agent 能力的广泛训练"},{"level":3,"id":"2-4-dgmdmtqhxx","text":"2.4 大规模多模态强化学习"},{"level":2,"id":"3-dmt-agent-nlyst","text":"3 多模态 Agent 能力与生态"},{"level":3,"id":"3-1-dmtgjlkz","text":"3.1 多模态工具链扩展"},{"level":3,"id":"3-2-ywb-agent-kjdjc","text":"3.2 与外部 Agent 框架的集成"},{"level":3,"id":"3-3-image-mining-sj-centric-sdssjz","text":"3.3 ImageMining: 视觉-centric 深度搜索基准"},{"level":3,"id":"3-4-dmtsdyjynrcz","text":"3.4 多模态深度研究与内容创作"},{"level":3,"id":"3-5-gf-skills","text":"3.5 官方 Skills"},{"level":2,"id":"4-kfgczdsjsj","text":"4 开发过程中的设计视角"},{"level":2,"id":"5-pg","text":"5 评估"},{"level":2,"id":"6-sytz","text":"6 剩余挑战"},{"level":2,"id":"7-gxz","text":"7 贡献者"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgsycssy","text":"B. 核心公式与参数索引"},{"level":3,"id":"c-mxpxdw","text":"C. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/10-glm-5v-turbo/01-glm-5v-turbo-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/10-glm-5v-turbo/01-glm-5v-turbo-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5V-Turbo: 面向多模态智能体的原生基础模型 技术报告精译</h1>
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
