---
title: "01 · DeepSeekMath-V2 英中对照"
category: "模型技术报告"
tags: ["DeepSeek", "数学推理", "定理证明", "双语对照"]
published: true
excerpt: "DeepSeekMath-V2 通过证明验证, 元验证和自我改进训练, 探索可自验证的自然语言数学推理."
---
# DeepSeekMath-V2 英中对照

<!-- arXiv 2511.22570; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/deepseek-math-v2/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 19 -->

DeepSeekMath-V2: Towards Self-Verifiable Mathematical Reasoning

Zhihong Shao*, Yuxiang Luo*, Chengda Lu*†, Z.Z. Ren*

Jiewen Hu, Tian Ye, Zhibin Gou, Shirong Ma, Xiaokang Zhang

DeepSeek-AI

zhihongshao@deepseek.com

https://github.com/deepseek-ai/DeepSeek-Math-V2

Abstract

arXiv:2511.22570v1  [cs.AI]  27 Nov 2025

Large language models have made significant progress in mathematical reasoning, which serves as an important testbed for AI and could impact scientific research if further advanced. By scaling reasoning with reinforcement learning that rewards correct final answers, LLMs have improved from poor performance to saturating quantitative reasoning competitions like AIME and HMMT in one year. However, this approach faces fundamental limitations. Pursuing higher final answer accuracy doesn’t address a key issue: correct answers don’t guarantee correct reasoning. Moreover, many mathematical tasks like theorem proving require rigorous step-by- step derivation rather than numerical answers, making final answer rewards inapplicable. To push the limits of deep reasoning, we believe it is necessary to verify the comprehensiveness and rigor of mathematical reasoning. Self-verification is particularly important for scaling test- time compute, especially for open problems without known solutions. Towards self-verifiable mathematical reasoning, we investigate how to train an accurate and faithful LLM-based verifier for theorem proving. We then train a proof generator using the verifier as the reward model, and incentivize the generator to identify and resolve as many issues as possible in their own proofs before finalizing them. To maintain the generation-verification gap as the generator becomes stronger, we propose to scale verification compute to automatically label new hard- to-verify proofs, creating training data to further improve the verifier. Our resulting model, DeepSeekMath-V2, demonstrates strong theorem-proving capabilities, achieving gold-level scores on IMO 2025 and CMO 2024 and a near-perfect 118/120 on Putnam 2024 with scaled test- time compute. While much work remains, these results suggest that self-verifiable mathematical reasoning is a feasible research direction that may help develop more capable mathematical AI systems.

1. Introduction

The conventional approach to reinforcement learning (RL) for mathematical reasoning involves rewarding large language models (LLMs) based on whether their predicted final answers to quantitative reasoning problems match ground-truth answers (Guo et al., 2025). This method- ology suffices to allow frontier LLMs to saturate mathematical competitions that primarily evaluate final answers, such as AIME and HMMT. However, this reward mechanism has two fundamental limitations. First, it serves as an unreliable proxy for reasoning correctness – a model can arrive at the correct answer through flawed logic or fortunate errors. Second, it is

*Core contributors †Work done during internship at DeepSeek-AI.

Abstract

大语言模型在数学推理方面取得了显著进展. 数学推理既是检验 AI 能力的重要试验场, 若继续发展也可能影响科学研究. 通过扩大强化学习中的推理规模, 并按最终答案是否正确给出奖励, LLM 在一年内从表现不佳发展到接近饱和 AIME 和 HMMT 等定量推理竞赛. 然而, 这种路线存在根本限制. 追求更高的最终答案准确率没有解决一个关键问题: 答案正确不保证推理正确. 此外, 定理证明等许多数学任务要求严谨的逐步推导, 而不是数值答案, 因此无法使用最终答案奖励. 若要继续提高深度推理能力, 必须验证数学推理是否完整严谨. 自我验证对扩大 TestingTime 计算尤其重要, 对没有已知解的开放问题更是如此.

为实现可自验证的数学推理, 我们研究如何训练一个准确且忠实的基于 LLM 的定理证明 verifier. 随后以 verifier 作为奖励模型训练 proof generator, 激励 generator 在最终提交证明前尽可能发现并解决自身证明中的问题. 随着 generator 变强, 为维持生成与验证之间的能力差距, 我们扩大验证计算, 自动标注新的难验证证明, 构造数据继续改善 verifier. 最终模型 DeepSeekMath-V2 展现出较强的定理证明能力. 在扩大 TestingTime 计算后, 模型在 IMO 2025 和 CMO 2024 达到金牌档, 并在 Putnam 2024 获得接近满分的 118/120. 仍有许多问题有待解决, 但这些结果表明, 可自验证数学推理是一条可行的研究方向.

1. Introduction

数学推理强化学习的常规做法, 是检查 LLM 对定量推理问题给出的最终答案是否与 ground-truth 一致, 再据此奖励模型. 这种方法足以让前沿 LLM 在主要评价最终答案的 AIME 和 HMMT 等竞赛中达到接近饱和的成绩. 但这种奖励机制有两个根本限制. 第一, 它只是推理正确性的一个不可靠代理: 模型可能依靠错误逻辑或碰巧抵消的错误得到正确答案. 第二, 它不适用于定理证明任务, 因为这类题目可能不要求数值结果, 严谨推导本身才是主要目标.

<!-- page 2 of 19 -->

inapplicable to theorem proving tasks, where problems may not require producing numerical final answers and rigorous derivation is the primary objective.

Consequently, LLMs trained on quantitative reasoning problems with such final answer reward still frequently produce mathematically invalid or logically inconsistent natural-language proofs. Moreover, this training approach does not naturally develop the models’ ability to verify proof validity – they exhibit high false-positive rates, often claiming incorrect proofs are valid even when they contain obvious logical flaws.

因此, 只在定量推理题上使用最终答案奖励训练的 LLM, 仍会频繁生成数学上无效或逻辑不一致的自然语言证明. 这种训练也不会自然形成验证证明有效性的能力. 模型的假阳性率很高, 即使证明含有明显逻辑缺陷, 也常声称证明成立.

The lack of a generation-verification gap in natural-language theorem proving hinders further improvement. To address this, we propose developing proof verification capabilities in LLMs. Our approach is motivated by several key observations:

自然语言定理证明缺少生成与验证之间的能力差距, 限制了进一步提升. 为解决这一问题, 我们提出在 LLM 中发展证明验证能力. 该方法基于几项观察:

• Humans can identify issues in proofs even without reference solutions – a crucial ability when tackling open problems. • A proof is more likely to be valid when no issues can be identified despite scaled verifica- tion efforts. • The efforts required to identify valid issues can serve as a proxy for proof quality, which can be exploited to optimize proof generation.

• 即使没有参考解答, 人类也能发现证明中的问题, 这种能力对开放问题很重要. • 扩大验证工作后仍找不到问题的证明, 更可能是有效证明. • 找到真实问题所需的工作量可以作为证明质量的代理, 并用于优化证明生成.

We believe that LLMs can be trained to identify proof issues without reference solutions. Such a verifier would enable an iterative improvement cycle: (1) using verification feedback to optimize proof generation, (2) scaling verification compute to auto-label hard-to-verify new proofs, thereby creating the training data to improve the verifier itself, and (3) using this enhanced verifier to further optimize proof generation. Moreover, a reliable proof verifier enables us to teach proof generators to evaluate proofs as the verifier does. This allows a proof generator to iteratively refine its proofs until it can no longer identify or resolve any issues. In essence, we make the model explicitly aware of its reward function and enable it to maximize this reward through deliberate reasoning rather than blind trial-and-error.

我们认为, LLM 可以在没有参考解答的情况下学习发现证明问题. 这样的 verifier 能形成迭代改进闭环: 第一, 用验证反馈优化证明生成; 第二, 扩大验证计算, 自动标注新的难验证证明, 由此产生改善 verifier 的训练数据; 第三, 用增强后的 verifier 继续优化证明生成. 可靠的 proof verifier 还可以教 generator 按 verifier 的方式评价证明, 让 generator 反复修改, 直到无法再发现或解决问题. 这相当于让模型明确知道自己的奖励函数, 并通过有目的的推理提高奖励, 而不是盲目试错.

Built on DeepSeek-V3.2-Exp-Base (DeepSeek-AI, 2025), we developed DeepSeekMath-V2, a large language model optimized for natural-language theorem proving that demonstrates self-verifiable mathematical reasoning. Our model can assess and iteratively improve its own proofs, achieving gold-level performance in premier high-school mathematics competitions including IMO 2025 and CMO 2024. On the Putnam 2024 undergraduate competition, it scored 118/120, exceeding the highest score of 90 1 obtained by human participants.

我们基于 DeepSeek-V3.2-Exp-Base 开发了 DeepSeekMath-V2. 该模型针对自然语言定理证明优化, 展现出可自验证的数学推理能力. 模型能够评价并迭代改善自己的证明, 在 IMO 2025 与 CMO 2024 等高中数学竞赛中达到金牌档. 在本科生 Putnam 2024 竞赛中, 模型获得 118/120, 超过人类参赛者的最高分 90.

2. Method

2.1. Proof Verification

2.1.1. Training a Verifier to Identify Issues and Score Proofs

2.1.1. 训练 verifier 发现问题并评价证明

We developed high-level rubrics I𝑣for proof evaluation (see Appendix A.2) with the goal of

training a verifier to evaluate proofs according to these rubrics, mirroring mathematical experts’ assessment process. Specifically, given a problem 𝑋and a proof 𝑌, the verifier 𝜋𝜑(·|𝑋,𝑌, I𝑣) is designed to produce a proof analysis that first summarizes identified issues (if any) and then assigns a score based on three levels: 1 for complete and rigorous proofs with all logical steps clearly justified; 0.5 for proofs with sound overall logic but minor errors or omitted details; and 0 for fundamentally flawed proofs containing fatal logical errors or critical gaps.

我们制定了证明评价的高层 rubric $I_v$, 目标是训练 verifier 按照这些规则评价证明, 模拟数学专家的评审过程. 给定问题 $X$ 与证明 $Y$, verifier $\pi_\phi(\cdot|X,Y,I_v)$ 先总结发现的问题, 再给出三档分数. 1 分表示证明完整严谨, 所有逻辑步骤均有清楚依据; 0.5 分表示整体逻辑成立, 但存在小错误或遗漏细节; 0 分表示证明存在致命逻辑错误或关键缺口.

1https://kskedlaya.org/putnam-archive/putnam2024stats.html

2

<!-- page 3 of 19 -->

Curating Cold Start RL Data We constructed our initial training data through the following process:

1. We crawled problems from Art of Problem Solving (AoPS) contests 2, prioritizing math olympiads, team selection tests, and post-2010 problems explicitly requiring proofs, total- ing 17,503 problems. This problem set is denoted as D𝑝. 2. We generated candidate proofs using a variant of DeepSeek-V3.2-Exp-Thinking. As this model was not optimized for theorem proving and tended to produce concise but error- prone outputs, we prompted it to iteratively refine its proofs over multiple rounds to improve comprehensiveness and rigor. 3. We randomly sampled proofs across diverse problem types (e.g., algebra and number theory) and had mathematical experts score each proof according to the evaluation rubrics described above.

This process yielded an initial RL dataset D𝑣= {(𝑋𝑖,𝑌𝑖, 𝑠𝑖)}, where each item consists of a problem

𝑋𝑖, a proof 𝑌𝑖, and an overall proof score 𝑠𝑖∈{0, 0.5, 1}.

RL Objective. Building on a version of DeepSeek-V3.2-Exp-SFT which was supervised fine- tuned on reasoning data related to mathematics and code, we trained the model with reinforce- ment learning to produce proof analyses using two reward components:

• Format reward 𝑅format: An indicator function that enforces the model to generate both a summary of identified issues and a proof score, by checking whether the final response contains the key phrase “Here is my evaluation of the solution:” as well as a score within \boxed{} following “Based on my evaluation, the final overall score should be:”. • Score reward 𝑅score: Rewards based on proximity between predicted score 𝑠′ 𝑖and annotated score 𝑠𝑖:

𝑖−𝑠𝑖| (1)

𝑖, 𝑠𝑖) = 1 −|𝑠′

𝑅score(𝑠′

The RL objective for training the verifier is:

$$
\max_{\pi_\phi} \mathbb{E}_{(X_i,Y_i,s_i)\sim\mathcal{D}_v,\,(V_i',s_i')\sim\pi_\phi(\cdot\mid X_i,Y_i)}
\left[R_{\mathrm{format}}(V_i')\cdot R_{\mathrm{score}}(s_i',s_i)\right]. \tag{2}
$$

where $V_i'$ denotes the verifier’s final response and $s_i'$ is the proof score extracted from it.

2.1.2. Introducing Meta-Verification to Review Proof Analyses

The approach described in Section 2.1.1 trains proof verification through RL to align predicted proof scores with expert annotations, but provides no direct supervision on the identified issues themselves. This creates a critical vulnerability: when evaluating flawed proofs (where 𝑠𝑖< 1) during training, the verifier can receive full reward by predicting the correct scores while hallucinating non-existent issues, undermining its trustworthiness.

To address this problem, we introduce meta-verification: a secondary evaluation process that assesses whether issues identified by the verifier indeed exist and whether these issues logically justify the predicted proof score according to the evaluation rubrics I𝑣. The complete meta-verification rubrics I𝑚𝑣are detailed in Appendix A.3.

2https://artofproblemsolving.com/community/c13_contest_collections

冷启动 RL 数据构造. 我们通过以下流程构造初始训练数据. 第一, 从 AoPS 竞赛集合抓取题目, 优先数学奥林匹克, 国家队选拔测试以及 2010 年以后明确要求证明的题目, 共计 17,503 道, 记作 $D_p$. 第二, 使用 DeepSeek-V3.2-Exp-Thinking 的一个变体生成候选证明. 该模型没有针对定理证明优化, 输出往往简短且易错, 因此我们提示它进行多轮迭代修改, 提高完整性与严谨性. 第三, 从代数, 数论等不同题型中随机抽样证明, 由数学专家按照上述 rubric 打分.

该流程得到初始 RL 数据集 $D_v=\{(X_i,Y_i,s_i)\}$, 每项包含问题 $X_i$, 证明 $Y_i$ 与总分 $s_i\in\{0,0.5,1\}$.

RL 目标. 我们从 DeepSeek-V3.2-Exp-SFT 的一个版本出发, 该版本已经在数学与代码推理数据上进行监督微调, 再用两类奖励训练模型输出证明分析. 格式奖励 $R_{format}$ 检查回复是否同时包含问题总结与证明分数, 具体通过规定短语和规定位置的 boxed 分数判断. 分数奖励按照预测分数 $s'_i$ 与专家分数 $s_i$ 的距离计算:

$$R_{score}(s'_i,s_i)=1-|s'_i-s_i|.$$

verifier 的 RL 目标最大化格式奖励与分数奖励的乘积期望. 其中 $V'_i$ 表示 verifier 的最终回复, $s'_i$ 是从回复中抽取的证明分数.

2.1.2. 引入元验证检查证明分析

上述方法通过 RL 让预测证明分数与专家标注一致, 却没有直接监督模型指出的问题. 这形成一个关键漏洞: 评价错误证明时, 只要给出正确分数, verifier 即使编造不存在的问题也能获得满奖励, 从而损害可信度.

为此, 我们引入 meta-verification. 第二层评价过程检查 verifier 指出的问题是否确实存在, 以及这些问题按照 $I_v$ 是否足以支持预测分数. 完整元验证 rubric $I_{mv}$ 见附录 A.3.

3

我们用 RL 训练专门的 meta-verifier. 把它的反馈加入 verifier 训练后, 可以提高问题识别的忠实度.

meta-verifier 训练流程如下. 第一, 按 2.1.1 节得到初始 verifier $\pi_\phi$. 第二, 数学专家依据 $I_{mv}$ 给 verifier 回复打分, 构造 $D_{mv}=\{(X_i,Y_i,V_i,ms_i)\}$, 其中 $V_i$ 是对证明 $Y_i$ 的分析, $ms_i\in\{0,0.5,1\}$ 是专家标注的质量分. 第三, 训练 $\pi_\eta(\cdot|X,Y,V,I_{mv})$ 分析证明评语 $V$. meta-verifier 先总结评语本身的问题, 再评价该分析是否准确且理由充分. 它使用与 verifier 相同结构的格式奖励和分数奖励.

训练好 $\pi_\eta$ 后, verifier 的奖励改为 $R_V=R_{format}\cdot R_{score}\cdot R_{meta}$, 其中 $R_{meta}$ 是 meta-verifier 给出的质量分. 增强训练同时使用 $D_v$ 与 $D_{mv}$, 最终模型可以执行证明验证和元验证. 在 $D_v$ 的验证集上, meta-verifier 评价的证明分析平均质量从 0.85 升至 0.96, 同时证明分数预测准确度保持不变.

2.2. Proof Generation · 证明生成

2.2.1. 训练定理证明 generator

以 verifier $\pi_\phi$ 作为生成式奖励模型, 我们训练 proof generator $\pi_\theta(\cdot|X)$. generator 从问题集 $D_p$ 取得 $X_i$ 并生成证明 $Y_i$, 奖励 $R_Y$ 是 verifier 按 $I_v$ 给出的证明分数.

2.2.2. 通过自验证增强推理

难题经常无法一次生成完全正确的证明. 外部 verifier 分析证明后, generator 可以按反馈修正. 但我们观察到一个关键限制: 要求 generator 在一次回复中同时生成并分析自己的证明时, 即使外部 verifier 很容易发现缺陷, generator 也倾向声称证明正确. 它能利用外部反馈修改, 却不能以专门 verifier 的严格程度评价自己的工作.

<!-- page 4 of 19 -->

We trained a dedicated meta-verifier using RL to perform this evaluation. By incorporat- ing the meta-verifier’s feedback into verifier training, we can improve the faithfulness of the verifier’s issue identification.

Meta-Verifier Training Process

1. We obtained an initial verifier 𝜋𝜑following Section 2.1.1. 2. Mathematical experts scored the quality of verifier responses according to I𝑚𝑣, creating dataset D𝑚𝑣= {(𝑋𝑖,𝑌𝑖,𝑉𝑖, 𝑚𝑠𝑖)}, where 𝑉𝑖is the analysis of proof 𝑌𝑖and 𝑚𝑠𝑖∈{0, 0.5, 1} is the expert-annotated quality score. 3. We trained a meta-verifier 𝜋𝜂(·|𝑋,𝑌,𝑉, I𝑚𝑣) to analyze the verifier’s proof analysis 𝑉. The meta-verifier produces a summary of issues found in the analysis itself, followed by a quality score measuring how accurate and justified the verifier’s analysis is. The RL objective follows the same structure as the verifier training, with format and score rewards.

Using the trained meta-verifier 𝜋𝜂, we enhanced the verifier training by integrating meta- verification feedback into the reward function:

𝑅𝑉= 𝑅format · 𝑅score · 𝑅meta (3)

where 𝑅meta is the quality score from the meta-verifier.

We trained the enhanced verifier on both the verification dataset D𝑣and the meta-verification dataset D𝑚𝑣, using the same reward mechanism on D𝑚𝑣as used for training the meta-verifier. The resulting model can perform both proof verification and meta-verification tasks.

On a validation split of D𝑣, the average quality score of the verifier’s proof analyses – as evaluated by the meta-verifier – improved from 0.85 to 0.96, while maintaining the same accuracy in proof score prediction.

2.2. Proof Generation

2.2.1. Training a Generator for Theorem Proving

With verifier 𝜋𝜑serving as a generative reward model, we train a proof generator 𝜋𝜃(·|𝑋) with

the RL objective:

max

𝜋𝜃E𝑋𝑖∼D𝑝,𝑌𝑖∼𝜋𝜃(·|𝑋𝑖) [𝑅𝑌] (4)

where 𝑅𝑌is the proof score produced by 𝜋𝜑(·|𝑋𝑖,𝑌𝑖, I𝑣).

2.2.2. Enhancing Reasoning via Self-Verification

When a proof generator fails to produce a completely correct proof in one shot – common

for challenging problems from competitions like IMO and CMO – iterative verification and refinement can improve results. This involves analyzing the proof with an external verifier and prompting the generator to address identified issues.

However, we observed a critical limitation: when prompted to both generate and analyze its own proof in one shot, the generator tends to claim correctness even when the external verifier

4

因此, 训练时要求 $\pi_\theta$ 生成证明 $Y$ 后继续给出自我分析 $Z$, 格式与 rubric 均同 verifier 一致, 自评分记为 $s'$. 外部 verifier 同时评价两部分: 证明得分 $R_Y=s$, 自我分析得到 meta-verification 分数 $R_{meta}(Z)=ms$. 总奖励为:

$$R=R_{format}(Y,Z)\cdot(\alpha R_Y+\beta R_Z),$$

$$R_Z=R_{score}(s',s)\cdot R_{meta}(Z),$$

其中 $R_{format}$ 检查证明和自评是否符合格式, $R_{score}$ 奖励准确的自我判断. 实验设定 $\alpha=0.76$, $\beta=0.24$. 该结构奖励诚实承认错误, 最高奖励来自生成正确证明并准确识别其严谨性. generator 若想获得高奖励, 有效策略是在最终回复前尽可能发现并解决问题.

2.3. 证明验证与生成的协同

verifier 改善 generator, generator 变强后又会产生挑战当前 verifier 的新证明. 单次验证难以发现问题的样本可用于继续增强 verifier. 新证明需要正确性标签, 但题目越难, 人工评价越耗时. 团队先为每份证明生成多条验证分析, 把潜在问题交给专家复核, 随后发现可以进一步自动化: 扩大 verifier 采样能提高发现真实缺陷的概率; 检查 verifier 已指出的问题正是 meta-verification, 比从头找错更容易, 模型所需样本也更少.

自动标注流程先为每份证明生成 $n$ 份独立验证分析. 对给出 0 或 0.5 分的分析, 再生成 $m$ 份元验证来核实所指出的问题; 多数元验证确认后, 该分析才算有效. 然后查看给出最低分的分析. 若至少有 $k$ 份该最低分分析有效, 证明标成这一最低分. 若所有验证尝试都没有发现合法问题, 证明标成 1. 其他不确定样本丢弃或交给专家. 末尾两轮训练完全由这条自动管线替代人工标注, 质量检查显示自动标签与专家判断较一致.

<!-- page 5 of 19 -->

easily identify flaws. In other words, while the generator can refine proofs based on external feedback, it fails to evaluate its own work with the same rigor as the dedicated verifier.

This observation motivated us to endow the proof generator with genuine verification capabilities. During training, we prompt the generator 𝜋𝜃to produce a proof 𝑌followed by a self-analysis 𝑍that follows the same format and rubrics I𝑣as the verifier (see Appendix A.1). We denote the proof score predicted in the self-analysis as 𝑠′.

To ensure faithful self-evaluation, we use the verifier 𝜋𝜑to assess both components: the proof 𝑌receives score 𝑅𝑌= 𝑠, and the self-analysis 𝑍receives a meta-verification score 𝑅meta(𝑍) = 𝑚𝑠. The reward function combines these assessments:

𝑅= 𝑅format(𝑌, 𝑍) · (𝛼· 𝑅𝑌+ 𝛽· 𝑅𝑍) (5)

𝑅𝑍= 𝑅score(𝑠′, 𝑠) · 𝑅meta(𝑍) (6)

where 𝑅format(𝑌, 𝑍) verifies that both the proof and self-analysis follow the specified format,

𝑅score(𝑠′, 𝑠) rewards accurate self-assessment. We set 𝛼= 0.76 and 𝛽= 0.24. This reward structure creates the following incentives:

• Faithful acknowledgment of errors is rewarded over false claims of correctness. • The highest rewards come from producing correct proofs and accurately recognizing their rigor. • A good strategy to obtain high rewards for the proof generator is to identify and resolve as many issues as possible before finalizing the response.

2.3. Synergy Between Proof Verification and Generation

The proof verifier and generator create a synergistic cycle: the verifier improves the generator, and as the generator improves, it produces new proofs that challenge the verifier’s current capabilities. These challenging cases – where the verifier may fail to identify issues in a single attempt – become valuable training data for enhancing the verifier itself.

To retrain and improve the verifier, we need labeled correctness data for newly generated proofs. Manual annotation, while straightforward, becomes increasingly time-consuming as problems grow harder and errors become more subtle. To boost annotation efficiency, we generated multiple verifier analyses per proof to surface potential issues for human review.

From this AI-assisted annotation process, we recognized two facts that make it feasible to push the level of automation a step further:

1. Scaling verifier samples increases the probability of catching real issues in flawed proofs. 2. Reviewing the verifier’s identified issues is exactly meta-verification, which is easier than identifying issues from scratch. Meta-verification is also more sample-efficient for LLMs to master.

Building on these observations, we developed the following automated labeling process:

1. For each proof, generate 𝑛independent verification analyses

5

3. Experiments · 实验

3.1. 训练设置

强化学习使用 GRPO, 按第 2 节所述反复优化证明验证与生成. 每轮先优化 verifier, 再从 verifier checkpoint 初始化 generator 并优化证明生成. 从第二轮开始, verifier 从上一轮经 rejection fine-tuning 合并验证与生成能力的 checkpoint 初始化.

3.2. 评价基准

内部 CNML 难度集合包含 91 道证明题: 代数 13 道, 几何 24 道, 数论 19 道, 组合 24 道, 不等式 11 道, 难度接近中国高中数学联赛. 竞赛集合包括 IMO 2025 的 6 道题, CMO 2024 的 6 道题, Putnam 2024 的 12 道题, IMO Shortlist 2024 的 31 道题, 以及 IMO-ProofBench 的 60 道题. IMO-ProofBench 分为 30 道 basic 与 30 道 advanced, 后者模拟完整 IMO 考试并覆盖到 IMO-Hard 难度.

<!-- page 6 of 19 -->

2. For analyses reporting issues (scores 0 or 0.5), generate 𝑚meta-verification assessments to validate the identified problems. An analysis is deemed valid if the majority of meta- assessments confirm its findings 3. For each proof, we examine analyses that assign the lowest score. If at least 𝑘such analyses are deemed valid, the proof is labeled with that lowest score. If no legitimate issues are identified across all verification attempts, the proof is labeled with 1. Otherwise, the proof is discarded or routed to human experts for labeling

In our last two training iterations, this fully automated pipeline replaced human annotation en- tirely. Quality checks confirmed that the automated labels aligned well with expert judgments.

3. Experiments

Mean Proof Scores on CNML-Level Problems by Category

0.60

0.59

0.60

0.54

0.52 0.54

0.47

0.45

0.45

0.35

0.36 0.35 0.38

0.32 0.32

0.30

0.17

0.15

Mean Proof Score

0.15

Models Gemini2.5-Pro GPT5-Thinking-High DeepSeekMath-V2

Algebra

Geometry

Inequality

Combinatorics

Number Theory

Figure 1 | Average proof scores on CNML-level problems by category and model, as evaluated by our verifier.

3.1. Training Settings

We employed Group Relative Policy Optimization (GRPO) (Shao et al., 2024) for reinforcement

learning, iteratively optimizing proof verification and generation capabilities as described in Section 2. In each iteration, we first optimized proof verification. The proof generator was then initialized from the verifier checkpoint and optimized for proof generation. Starting from the second iteration, the proof verifier was initialized with a checkpoint that consolidated both verification and generation capabilities from the previous iteration through rejection fine-tuning.

3.2. Evaluation Benchmarks

We evaluate our final proof generator on the following theorem proving benchmarks:

In-House CNML-Level Problems 91 theorem-proving problems spanning algebra (13), geome- try (24), number theory (19), combinatorics (24), and inequality (11), comparable in difficulty to problems from Chinese National High School Mathematics League (CNML)

Competition Problems

• IMO 2025 (6 problems): The International Mathematical Olympiad, the premier global mathematics competition for pre-university students

6

3.3. 评价结果

3.3.1. 单次生成

我们先评价模型不经迭代修改直接生成正确证明的能力. 对内部题目, 每个被测模型为每道题生成 8 份证明. 最终 verifier 生成 8 份验证分析, 再通过多数投票评价证明正确性. Figure 1 显示, 在代数, 几何, 数论, 组合和不等式各类 CNML 难度题目上, DeepSeekMath-V2 均高于 GPT-5-Thinking-High 和 Gemini 2.5-Pro.

3.3.2. 使用自验证顺序改进

IMO, CMO 等难题经常无法在一次 128K token 输出中生成完整严谨的证明. 此时 generator 能通过自验证认识到证明无效, 却缺少上下文长度在一次尝试内解决所有问题.

顺序改进先生成证明与自我分析, 再把上一轮输出放入新 prompt, 让 generator 解决已经发现的问题. 当 generator 给自己满分或达到最大顺序尝试次数时停止. Figure 2 在 IMO Shortlist 2024 上考察该方法. 每题启动 32 条独立改进线程, 每份证明由最终 verifier 生成的 32 份分析多数投票评价.

Figure 2 报告两项指标. Pass@1 是各线程最终证明的平均分. Best@32 按全部线程的自评分选出每题最佳证明, 再计算其得分. 自选最佳证明的验证分显著高于线程平均, 表明 generator 能较准确地判断证明质量. 随最大顺序尝试次数增加, Pass@1 明显上升, 说明自验证反馈能够指导迭代修改.

<!-- page 7 of 19 -->

• CMO 2024 (6 problems): The China Mathematical Olympiad, China’s national champi- onship • Putnam 2024 (12 problems): The William Lowell Putnam Competition, the preeminent mathematics competition for undergraduate students in North America • ISL 2024 (31 problems): The IMO Shortlist, a collection of problems proposed by participat- ing countries and considered by the Problem Selection Committee for potential inclusion in IMO 2024 • IMO-ProofBench (60 problems): Developed by the DeepMind team behind DeepThink IMO-Gold (Luong and Lockhart, 2025), this benchmark (Luong et al., 2025) is divided into a basic set (30 problems, pre-IMO to IMO-Medium difficulty) and an advanced set (30 challenging problems simulating complete IMO examinations, up to IMO-Hard level)

3.3. Evaluation Results

3.3.1. One-Shot Generation

We first evaluate the model’s ability to generate correct proofs without iterative refinement. On

the in-house problems, we generated 8 proof samples per problem for each evaluated model. Proof correctness was measured by majority voting across 8 verification analyses produced by our final verifier. As shown in Figure 1, across all categories of CNML-level problems – algebra, geometry, number theory, combinatorics, and inequality – DeepSeekMath-V2 consistently outperforms GPT-5-Thinking-High (OpenAI, 2025) and Gemini 2.5-Pro (DeepMind, 2025), demonstrating superior theorem-proving ability across domains.

3.3.2. Sequential Refinement with Self-Verification

IMO Shortlist 2024

0.40

0.42

Pass@1 Best@32

0.40

0.40

0.39

0.39

0.35

0.33

0.30

0.27

0.26

0.29

0.24

0.25

0.24

0.26

Proof Score

0.22

0.21

0.20

0.18

For challenging problems from competi- tions like IMO and CMO, models often cannot generate comprehensive and rigor- ous proofs in a single attempt within the 128K token limit. When this occurs, our proof generator recognizes its proof is in- valid through self-verification but lacks the context length to resolve all identified is- sues in a single attempt.

0.15

0.15

1 2 3 4 5 6 7 8 Max Sequential Iterations

Figure 2 | Proof quality improvements as the max- imum sequential iterations varies from 1 (no re- finement) to 8 (initial generation plus up to 7 re- finements based on self verification).

To explore how extended context and self-verification can improve proof qual- ity, we evaluate sequential refinement with self-verification. This approach first gen- erates a proof with self-analysis, then iter- atively re-prompts the generator with its previous output (see Appendix A.4 for the refinement prompt), allowing it to address identified issues. The process continues until the generator assigns itself a perfect score or reaches the maximum number of sequential attempts.

Figure 2 demonstrates proof quality improvement through sequential refinement on IMO Shortlist 2024 problems. For each problem, we launched 32 independent refinement threads. Proof correctness was measured by majority voting across 32 verification analyses from our final verifier. We report two metrics in Figure 2: (1) Pass@1 – the average score of the final

7

3.3.3. 高计算搜索

为解决最困难的题目, 我们同时扩大验证与生成计算: 用大量验证发现细微问题, 用并行生成探索不同证明策略.

每道题的候选池先由 64 份证明初始化, 每份证明生成 64 份验证分析. 每轮按照平均验证分选出最高的 64 份证明, 每份再随机配 8 份分析, 优先选择指出问题的 0 分与 0.5 分分析. 每个证明与分析对生成一份修改后的证明, 更新候选池. 流程最多持续 16 轮, 或某份证明通过全部 64 次验证后停止. 所有实验只使用最终 proof generator 一个模型, 由它同时完成证明生成与验证.

数学专家最终评价最高分证明. Table 1 显示, IMO 2025 中模型完全解出 6 题中的 5 题; CMO 2024 完全解出 4 题, 另一题获部分分, 两项均达到金牌档. Putnam 2024 中模型完整解出 12 题中的 11 题, 剩余一题只有小错误, 得分 118/120, 超过人类最高分 90. Figure 3 显示, 模型在 IMO-ProofBench basic 上超过 DeepMind DeepThink IMO Gold, 在 advanced 上仍有竞争力, 但最难的 IMO 级题目仍然困难.

<!-- page 8 of 19 -->

proof from each thread, and (2) Best@32 – the score of the best proof per problem, selected by self-assigned scores across all threads. The self-selected best proofs achieve significantly higher verification scores than the thread average, demonstrating our generator’s ability to accurately assess proof quality. Furthermore, Pass@1 improves substantially as maximum sequential attempts increase, showing that self-verification effectively guides iterative improvement. These results confirm that our generator can reliably differentiate between high-quality and flawed proofs, and leverage this self-awareness to systematically improve its mathematical reasoning.

99.0

100.00%

89.0

83.8

75.00%

69.5

65.7

61.9

59.0

55.2

46.7

50.00%

37.6

33.3

29.0

27.1

24.8

20.0

25.00%

18.6

17.6

5.2

4.8

3.8

Claude Sonnet 4 DeepSeek R1 Qwen3-235B Grok 4 Gemini 2.5 Pro GPT-5 Gemini 2.5 Pro with (Huang & Yang, 2025) Gemini Deep Think (IMO lite) Gemini Deep Think (IMO Gold) DeepSeekMath-V2 (Heavy)

Human evaluations

ProofBench-Basic ProofBench-Advanced 0.00%

Figure 3 | Expert evaluation results on the Basic and Advanced subsets of IMO-ProofBench. All results are sourced from Luong et al. (2025), with the exception of DeepSeekMath-V2, which was evaluated by our experts following the grading guidelines.

3.3.3. High-Compute Search

Contest Problems Points

IMO 2025 P1 , P2 , P3 , P4 , P5 83.3%

To solve the most challenging problems, we scaled both verification and generation compute – using extensive verification to identify subtle issues and parallel genera- tion to explore diverse proof strategies.

CMO 2024 P1 , P2 , P4 , P5 , P6 73.8%

Putnam 2024 A1 ∼B4 , B5, B6 98.3%

Table 1 | Problems in gray are fully solved , while underlined problems received partial credit.

Our approach maintains a pool of can- didate proofs for each problem, initialized with 64 proof samples with 64 verification analyses generated for each. In each re- finement iteration, we select the 64 highest- scoring proofs based on average verifica- tion scores and pair each with 8 randomly selected analyses, prioritizing those identifying issues (scores 0 or 0.5). Each proof-analysis pair is used to generate one refined proof, which then updates the candidate pool. This process continues for up to 16 iterations or until a proof successfully passes all 64 verification attempts, indicating high confidence in correctness. All ex- periments used a single model, our final proof generator, which performs both proof generation and verification.

To validate our results, mathematical experts assessed the highest-scoring proofs. As shown in Table 1, our approach solved 5 of 6 problems from IMO 2025 and 4 problems plus partial credit on another from CMO 2024, achieving gold medal performance in both pinnacle high-school competitions. On Putnam 2024, the preeminent undergraduate mathematics competition, our model solved 11 of 12 problems completely and the remaining problem with minor errors, scoring 118/120 and surpassing the highest human score of 90. Figure 3 shows the results on IMO-ProofBench. Our approach outperforms DeepMind’s DeepThink (IMO Gold) on the basic set and remains competitive on the advanced set, while substantially outperforming all other baselines. We observe that the hardest IMO-level problems remain challenging for our model.

8

对没有完全解决的题, generator 通常能识别证明中的真实问题; 完全解决的题则通过全部 64 次验证. 结果表明, 经过训练的 LLM verifier 能够评价此前被认为难以自动验证的证明. 在 verifier 指导下扩大 TestingTime 计算后, 模型能够解决人类竞赛者通常需要数小时完成的问题.

4. Related Work · 相关工作

推理模型在一年内让 AIME, HMMT 等定量推理基准接近饱和, 部分原因是最终答案提供了清楚的评价标准. 定理证明通常没有数值结果, 要求严谨的逐步推导, 因而不能采用同一指标. 自然语言证明长期缺少可靠的自动正确性检查方法. 最近结果显示该障碍可能被逐步克服. Gemini 2.5 Pro 已表现出一定自验证能力, 可以修改自身解答; DeepMind 的内部 DeepThink 变体用纯自然语言推理在 IMO 2025 达到金牌档, 说明复杂证明的 LLM 验证并非不可实现. 近期工作也开始研究推理模型在有无参考解答时评价证明的能力.

Lean 与 Isabelle 等 proof assistant 提供可靠验证: 证明必须写成形式语言, 一旦通过内核检查, 正确性便有保证. AlphaProof 专门搜索形式证明, 在 IMO 2024 达到银牌档, 但需要大量计算. 以非形式推理指导形式证明生成已被广泛研究. 随着推理模型的自然语言推导质量提高, 这种指导更加有效. DeepSeek-Prover-V2 与 Seed-Prover 能在相同计算预算内产生更多有效形式证明, Seed-Prover 解出 IMO 2025 的 6 题中的 5 题. 提升自然语言定理证明能力有望继续帮助形式推理, 未来系统可以结合非形式洞见与形式保证.

5. Conclusion · 结论

DeepSeekMath-V2 同时具备生成和验证数学证明的能力. 训练让模型发现自身推理中的问题, 并激励它在最终输出前处理这些问题, 从最终答案奖励推进到可自验证数学推理. 训练过程交替改善验证能力与证明生成, 两部分互相产生更困难的数据.

主要技术贡献包括: 训练准确且忠实的自然语言证明 verifier; 用 meta-verification 减少虚构问题并约束验证质量; 通过自验证激励 generator 提高证明质量; 扩大验证计算, 自动标注越来越难验证的证明, 在不依赖逐条人工标注的情况下继续改善 verifier. 扩大 TestingTime 计算后, 模型在 IMO 2025 与 CMO 2024 达到金牌档, 在 Putnam 2024 获得接近满分的成绩. 结果说明 LLM 能够形成有意义的复杂推理自评能力, 但可靠数学推理仍有明显挑战.

<!-- page 9 of 19 -->

Notably, for problems not fully solved, our generator typically identifies the genuine issues in its proofs, while fully solved problems pass all 64 verification attempts. This demonstrates that we can successfully train LLM-based verifiers to assess proofs previously considered difficult to verify automatically. By scaling test-time compute under verifier guidance, our model solves problems that require hours of effort from human competitors.

4. Related Work

Reasoning models (OpenAI, 2024; Guo et al., 2025) have saturated quantitative reasoning benchmarks like AIME and HMMT within one year. This rapid advancement is partly attributed to the well-defined evaluation criterion: if we care only about final answers, then quantitative reasoning is easy to verify. However, this final answer metric is inapplicable to theorem proving, which often requires no numerical answers but demands rigorous step-by-step derivation. Informal mathematical proofs have long been considered hard to verify automatically, lacking reliable approaches to assess proof correctness. Recent developments suggest this barrier may be surmountable. Models like Gemini-2.5 Pro already demonstrate a certain level of self-verification capabilities, which can refine their own solutions to improve quality (Huang and Yang, 2025). More significantly, DeepMind’s internal DeepThink variant (Luong and Lockhart, 2025) achieved gold medal performance at IMO 2025 using pure natural language reasoning – serving as an existence proof that LLM-based verification of complex proofs is achievable. Recent research has begun exploring whether reasoning models can evaluate proofs, both with and without reference solutions (Dekoninck et al., 2025; Luong et al., 2025), showing promising results. In this work, we open source DeepSeekMath-V2 and our training methodology as concrete steps toward self-verifiable mathematical reasoning, showing how models can learn to verify and improve their own proofs.

Proof assistants like Lean (de Moura et al., 2015) and Isabelle (Paulson, 1994) offer a reliable approach to verify proofs – proofs must be written in formal language, but once compiled, correctness is guaranteed. AlphaProof (AlphaProof and teams, 2024; Trinh et al., 2024; Chervonyi et al., 2025), a system specialized for formal proof search, achieved silver-level performance at IMO 2024 but required intensive computation. While using informal reasoning to guide formal proof generation has been explored extensively (Jiang et al., 2023), recent reasoning models have dramatically improved informal reasoning quality, making this guidance far more effective. Systems like DeepSeek-Prover-V2 (Ren et al., 2025) and Seed-Prover (Chen et al., 2025) can now produce substantially more valid formal proofs within the same computational budget, with Seed-Prover solving 5 of 6 problems at IMO 2025. Notably, these results were achieved without specifically optimizing the informal reasoning components for theorem proving tasks. We believe advancing natural language theorem proving will significantly benefit formal reasoning. We hope to contribute toward truly reliable mathematical reasoning systems that leverage both

informal insights and formal guarantees to advance mathematical research.

5. Conclusion

We presented DeepSeekMath-V2, a model capable of both generating and verifying mathe-

matical proofs. By training models to identify issues in their own reasoning and incentivizing them to address these issues before finalizing outputs, we move beyond the limitations of final- answer-based rewards toward self-verifiable mathematical reasoning. Our iterative training process – alternating between improving verification capabilities and using these to enhance generation – creates a sustainable cycle where each component drives the other forward. Our

9

<!-- page 10 of 19 -->

key technical contributions include: (1) training an accurate and faithful LLM-based verifier for mathematical proofs, (2) using meta-verification to largely reduce hallucinated issues and ensure verification quality, (3) incentivizing the proof generator to maximize proof quality through self-verification, and (4) scaling verification compute to automatically label increasingly hard-to-verify proofs to improve the verifier without human annotation. DeepSeekMath-V2 demonstrates strong performance on competition mathematics. With scaled test-time compute, it achieved gold-medal scores in high-school competitions including IMO 2025 and CMO 2024, and a near-perfect score on the undergraduate Putnam 2024 competition. This work establishes that LLMs can develop meaningful self-evaluation abilities for complex reasoning tasks. While significant challenges remain, we hope this research direction contributes to the goal of creating self-verifiable AI systems that can solve research-level mathematics.

References

AlphaProof and A. teams. Ai achieves silver-medal standard solving international mathematical

olympiad problems, 2024. URL https://deepmind.google/blog/ai-solves-imo-pro blems-at-silver-medal-level.

L. Chen, J. Gu, L. Huang, W. Huang, Z. Jiang, A. Jie, X. Jin, X. Jin, C. Li, K. Ma, C. Ren, J. Shen,

W. Shi, T. Sun, H. Sun, J. Wang, S. Wang, Z. Wang, C. Wei, S. Wei, Y. Wu, Y. Wu, Y. Xia,

H. Xin, F. Yang, H. Ying, H. Yuan, Z. Yuan, T. Zhan, C. Zhang, Y. Zhang, G. Zhang, T. Zhao, J. Zhao, Y. Zhou, and T. H. Zhu. Seed-prover: Deep and broad reasoning for automated theorem proving. CoRR, abs/2507.23726, 2025. doi: 10.48550/ARXIV.2507.23726. URL https://doi.org/10.48550/arXiv.2507.23726.

Y. Chervonyi, T. H. Trinh, M. Olsák, X. Yang, H. Nguyen, M. Menegali, J. Jung, V. Verma,

Q. V. Le, and T. Luong. Gold-medalist performance in solving olympiad geometry with alphageometry2. CoRR, abs/2502.03544, 2025. doi: 10.48550/ARXIV.2502.03544. URL https://doi.org/10.48550/arXiv.2502.03544.

L. M. de Moura, S. Kong, J. Avigad, F. van Doorn, and J. von Raumer. The lean theo- rem prover (system description). In A. P. Felty and A. Middeldorp, editors, Automated Deduction - CADE-25 - 25th International Conference on Automated Deduction, Berlin, Germany, August 1-7, 2015, Proceedings, volume 9195 of Lecture Notes in Computer Science, pages 378–388. Springer, 2015. doi: 10.1007/978-3-319-21401-6\_26. URL https://doi.org/10.1007/978-3-319-21401-6_26.

G. DeepMind. Gemini 2.5 pro, 2025. URL https://deepmind.google/models/gemini/pr

o.

DeepSeek-AI. Deepseek-v3.2-exp: Boosting long-context efficiency with deepseek sparse atten-

tion, 2025.

J. Dekoninck, I. Petrov, K. Minchev, M. Balunovic, M. T. Vechev, M. Marinov, M. Drencheva,

L. Konova, M. Shumanov, K. Tsvetkov, N. Drenchev, L. Todorov, K. Nikolova, N. Georgiev, V. Kalinkova, and M. Ismoldayev. The open proof corpus: A large-scale study of llm-generated mathematical proofs. CoRR, abs/2506.21621, 2025. doi: 10.48550/ARXIV.2506.21621. URL https://doi.org/10.48550/arXiv.2506.21621.

D. Guo, D. Yang, H. Zhang, J. Song, P. Wang, Q. Zhu, R. Xu, R. Zhang, S. Ma, X. Bi, X. Zhang,

X. Yu, Y. Wu, Z. F. Wu, Z. Gou, Z. Shao, Z. Li, Z. Gao, A. Liu, B. Xue, B. Wang, B. Wu, B. Feng,

10

<!-- page 11 of 19 -->

C. Lu, C. Zhao, C. Deng, C. Ruan, D. Dai, D. Chen, D. Ji, E. Li, F. Lin, F. Dai, F. Luo, G. Hao, G. Chen, G. Li, H. Zhang, H. Xu, H. Ding, H. Gao, H. Qu, H. Li, J. Guo, J. Li, J. Chen, J. Yuan, J. Tu, J. Qiu, J. Li, J. L. Cai, J. Ni, J. Liang, J. Chen, K. Dong, K. Hu, K. You, K. Gao, K. Guan, K. Huang, K. Yu, L. Wang, L. Zhang, L. Zhao, L. Wang, L. Zhang, L. Xu, L. Xia, M. Zhang, M. Zhang, M. Tang, M. Zhou, M. Li, M. Wang, M. Li, N. Tian, P. Huang, P. Zhang, Q. Wang, Q. Chen, Q. Du, R. Ge, R. Zhang, R. Pan, R. Wang, R. J. Chen, R. L. Jin, R. Chen, S. Lu, S. Zhou, S. Chen, S. Ye, S. Wang, S. Yu, S. Zhou, S. Pan, S. S. Li, S. Zhou, S. Wu, T. Yun, T. Pei, T. Sun, T. Wang, W. Zeng, W. Liu, W. Liang, W. Gao, W. Yu, W. Zhang, W. L. Xiao, W. An, X. Liu, X. Wang, X. Chen, X. Nie, X. Cheng, X. Liu, X. Xie, X. Liu, X. Yang, X. Li, X. Su, X. Lin, X. Q. Li, X. Jin, X. Shen, X. Chen, X. Sun, X. Wang, X. Song, X. Zhou, X. Wang, X. Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. Zhang, Y. Xu, Y. Li, Y. Zhao, Y. Sun, Y. Wang, Y. Yu, Y. Zhang, Y. Shi, Y. Xiong, Y. He, Y. Piao, Y. Wang, Y. Tan, Y. Ma, Y. Liu, Y. Guo, Y. Ou, Y. Wang, Y. Gong, Y. Zou, Y. He, Y. Xiong, Y. Luo, Y. You, Y. Liu, Y. Zhou, Y. X. Zhu, Y. Huang, Y. Li, Y. Zheng, Y. Zhu, Y. Ma, Y. Tang, Y. Zha, Y. Yan, Z. Z. Ren, Z. Ren, Z. Sha, Z. Fu, Z. Xu, Z. Xie, Z. Zhang, Z. Hao, Z. Ma, Z. Yan, Z. Wu, Z. Gu, Z. Zhu, Z. Liu, Z. Li, Z. Xie, Z. Song, Z. Pan, Z. Huang, Z. Xu, Z. Zhang, and Z. Zhang. Deepseek-r1 incentivizes reasoning in llms through reinforcement learning. Nat., 645(8081):633–638, 2025. doi: 10.1038/S41586-025-09422-Z. URL https://doi.org/10.1038/s41586-025-09422-z.

Y. Huang and L. F. Yang. Gemini 2.5 pro capable of winning gold at IMO 2025. CoRR, abs/2507.15855, 2025. doi: 10.48550/ARXIV.2507.15855. URL https://doi.org/10 .48550/arXiv.2507.15855.

A. Q. Jiang, S. Welleck, J. P. Zhou, T. Lacroix, J. Liu, W. Li, M. Jamnik, G. Lample, and Y. Wu. Draft,

sketch, and prove: Guiding formal theorem provers with informal proofs. In The Eleventh International Conference on Learning Representations, ICLR 2023, Kigali, Rwanda, May 1-5, 2023. OpenReview.net, 2023. URL https://openreview.net/forum?id=SMa9EAovKMC.

T. Luong and E. Lockhart. Advanced version of gemini with deep think officially achieves

gold-medal standard at the international mathematical olympiad, 2025. URL https://goo. gle/imo-gold.

T. Luong, D. Hwang, H. H. Nguyen, G. Ghiasi, Y. Chervonyi, I. Seo, J. Kim, G. Bingham,

J. Lee, S. Mishra, A. Zhai, C. H. Hu, H. Michalewski, J. Kim, J. Ahn, J. Bae, X. Song, T. H. Trinh, Q. V. Le, and J. Jung. Towards robust mathematical reasoning. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, 2025. URL https://aclanthology.org/2025.emnlp-main.1794/.

OpenAI. Learning to reason with llms, 2024. URL https://openai.com/index/learnin

g-to-reason-with-llms/.

OpenAI. Introducing gpt-5, 2025. URL https://openai.com/index/introducing-gpt-5.

L. C. Paulson. Isabelle - A Generic Theorem Prover (with a contribution by T. Nipkow), volume

828 of Lecture Notes in Computer Science. Springer, 1994. ISBN 3-540-58244-4. doi: 10.1007/ BFB0030541. URL https://doi.org/10.1007/BFb0030541.

Z. Z. Ren, Z. Shao, J. Song, H. Xin, H. Wang, W. Zhao, L. Zhang, Z. Fu, Q. Zhu, D. Yang, Z. F. Wu,

Z. Gou, S. Ma, H. Tang, Y. Liu, W. Gao, D. Guo, and C. Ruan. Deepseek-prover-v2: Advancing formal mathematical reasoning via reinforcement learning for subgoal decomposition. CoRR, abs/2504.21801, 2025. doi: 10.48550/ARXIV.2504.21801. URL https://doi.org/10.485 50/arXiv.2504.21801.

11

<!-- page 12 of 19 -->

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, M. Zhang, Y. K. Li, Y. Wu, and D. Guo. Deepseek-

math: Pushing the limits of mathematical reasoning in open language models. CoRR, abs/2402.03300, 2024. doi: 10.48550/ARXIV.2402.03300. URL https://doi.org/10 .48550/arXiv.2402.03300.

T. H. Trinh, Y. Wu, Q. V. Le, H. He, and T. Luong. Solving olympiad geometry without human

demonstrations. Nat., 625(7995):476–482, 2024. doi: 10.1038/S41586-023-06747-5. URL https://doi.org/10.1038/s41586-023-06747-5.

12

<!-- page 13 of 19 -->

A. Prompt Templates

A.1. Proof Generation Prompt

Your task is to solve a given problem. The problem may ask you to ↩→ prove a statement , or ask for an answer. If finding an ↩→answer is required , you should come up with the answer , and ↩→your final solution should also be a rigorous proof of that ↩→answer being valid.

Your final solution to the problem should be exceptionally ↩→comprehensive and easy -to -follow , which will be rated ↩→according to the following evaluation instruction:

‘‘‘txt Here is the instruction to evaluate the quality of a solution to ↩→a problem. The problem may ask for a proof of statement , or ↩→ask for an answer. If finding an answer is required , the ↩→solution should present the answer , and it should also be a ↩→rigorous proof of that answer being valid.

Please evaluate the solution and score it according to the ↩→following criteria: - If the solution is completely correct , with all steps executed ↩→properly and clearly demonstrated , then the score is 1 - If the solution is generally correct , but with some details ↩→omitted or minor errors , then the score is 0.5 - If the solution does not actually address the required problem , ↩→ contains fatal errors , or has severe omissions , then the ↩→score is 0

Additionally , referencing anything from any paper does not save ↩→the need to prove the reference. It ’s okay IF AND ONLY IF ↩→the solution also presents a valid proof of the reference ↩→argument(s); otherwise , if the solution omits the proof or ↩→if the proof provided is not completely correct , the ↩→solution should be scored according to the criteria above , ↩→and definitely not with a score of 1 ‘‘‘

In fact , you already have the ability to rate your solution ↩→yourself , so you are expected to reason carefully about how ↩→to solve a given problem , evaluate your method according to ↩→the instruction , and refine your solution by fixing issues ↩→identified until you can make no further progress.

In your final response , you should present a detailed solution to ↩→ the problem followed by your evaluation of that solution. - To give a good final response , you should try your best to ↩→locate potential issues in your own (partial) solution ↩→according to the evaluation instruction above , and fix them ↩→as many as you can. - A good final response should just faithfully present your ↩→progress , including the best solution you can give , as well ↩→as a faithful evaluation of that solution.

13

<!-- page 14 of 19 -->

- Only when you fail to locate any issues in your solution should ↩→ you score it with 1. - If you do notice some issues in your solution but fail to ↩→resolve them with your best efforts , it ’s totally ok to ↩→faithfully present the issues in your final response. - The worst final response would provide a wrong solution but lie ↩→ that it ’s correct or claim that it ’s correct without ↩→careful error checking. A better version should faithfully ↩→identify errors in the solution. Remember! You CAN ’T cheat! ↩→If you cheat , we will know , and you will be penalized!

Your final response should be in the following format:

## Solution // Your final solution should start with this exact ↩→same markdown title ... // Your final solution to the problem here. You should try ↩→your best to optimize the quality of your solution according ↩→ to the evaluation instruction above before finalizing it ↩→here.

## Self Evaluation // Your evaluation of your own solution above ↩→should start with this exact same markdown title

Here is my evaluation of the solution: // Your analysis should ↩→start with this exact same phrase ... // Your evaluation here. You are required to present in ↩→detail the key steps of the solution or the steps for which ↩→you had doubts regarding their correctness , and explicitly ↩→analyze whether each step is accurate: for correct steps , ↩→explain why you initially doubted their correctness and why ↩→they are indeed correct; for erroneous steps , explain the ↩→reason for the error and the impact of that error on the ↩→solution. You should analyze your solution faithfully. E.g., ↩→ if there are issues in your final solution , you should ↩→point it out.

Based on my evaluation , the final overall score should be: \\ boxed {{...}} // where ... should be the final overall score (0, ↩→ 0.5, or 1, and nothing else) based on the evaluation ↩→instruction above. You should reach this score ONLY AFTER ↩→careful RE -examination of your own solution above

---

Here is your task input:

## Problem {question}

A.2. Proof Verification Prompt

## Instruction

Your task is to evaluate the quality of a solution to a problem. ↩→The problem may ask for a proof of statement , or ask for an

14

<!-- page 15 of 19 -->

↩→answer. If finding an answer is required , the solution ↩→should present the answer , and it should also be a rigorous ↩→proof of that answer being valid.

Please evaluate the solution and score it according to the ↩→following criteria: - If the solution is completely correct , with all steps executed ↩→properly and clearly demonstrated , then the score is 1 - If the solution is generally correct , but with some details ↩→omitted or minor errors , then the score is 0.5 - If the solution does not actually address the required problem , ↩→ contains fatal errors , or has severe omissions , then the ↩→score is 0 - Additionally , referencing anything from any paper does not save ↩→ the need to prove the reference. It ’s okay IF AND ONLY IF ↩→the solution also presents a valid proof of the reference ↩→argument(s); otherwise , if the solution omits the proof or ↩→if the proof provided is not completely correct , the ↩→solution should be scored according to the criteria above , ↩→and definitely not with a score of 1

Please carefully reason out and analyze the quality of the ↩→solution below , and in your final response present a ↩→detailed evaluation of the solution ’s quality followed by ↩→your score. Therefore , your response should be in the ↩→following format:

Here is my evaluation of the solution: ... // Your evaluation here. You are required to present in ↩→detail the key steps of the solution or the steps for which ↩→you had doubts regarding their correctness , and explicitly ↩→analyze whether each step is accurate: for correct steps , ↩→explain why you initially doubted their correctness and why ↩→they are indeed correct; for erroneous steps , explain the ↩→reason for the error and the impact of that error on the ↩→solution.

Based on my evaluation , the final overall score should be: \\ boxed {{...}} // where ... should be the final overall score (0, ↩→ 0.5, or 1, and nothing else) based on the above criteria

---

Here is your task input:

## Problem {question}

## Solution {proof}

A.3. Meta-Verification Prompt

You are given a "problem", "solution", and "solution evaluation", ↩→ and you need to assess the whether this "solution

15

<!-- page 16 of 19 -->

↩→evaluation" is reasonable.

First , "solution evaluation" is generated to evaluate the quality ↩→ of the "solution", by prompting a verifier with the rules ↩→below (these are not your rules):

‘‘‘ Please evaluate the solution and score it according to the ↩→following criteria: - If the solution is completely correct , with all steps executed ↩→properly and clearly demonstrated , then the score is 1 - If the solution is generally correct , but with some details ↩→omitted or minor errors , then the score is 0.5 - If the solution does not actually address the required problem , ↩→ contains fatal errors , or has severe omissions , then the ↩→score is 0

Additionally , referencing anything from any paper does not save ↩→the need to prove the reference. It ’s okay IF AND ONLY IF ↩→the solution also presents a valid proof of the reference ↩→argument(s); otherwise , if the solution omits the proof or ↩→if the proof provided is not completely correct , the ↩→solution should be scored according to the criteria above , ↩→and definitely not with a score of 1 ‘‘‘

Next , I will introduce the rules for you to analyze the quality ↩→of the "solution evaluation ":

1. Your task is to analyze the "solution evaluation ". You do not ↩→need to solve the "problem", nor do you need to strictly ↩→assess whether the "solution" is accurate. Your only task is ↩→ to strictly follow the rules below to evaluate whether the ↩→"solution evaluation" is reasonable.

2. You need to analyze the content of the "solution evaluation" ↩→from three aspects:

Step Restatement: In the "solution evaluation", certain behaviors ↩→ of the "solution" may be restated. You need to return to ↩→the original text of the "solution" and check whether the " ↩→solution" actually has these behaviors mentioned in the " ↩→solution evaluation ".

Defect Analysis: "solution evaluation" may point out errors or ↩→defects in the "solution ". You need to carefully analyze ↩→whether the mentioned errors and defects are indeed valid.

Expression Analysis: Whether the "solution evaluation"’s ↩→expressions are accurate.

Score Analysis: Whether the final score given by the "solution ↩→evaluation" matches the defects it found. You need to ↩→analyze according to the scoring rules given above.

16

<!-- page 17 of 19 -->

3. The most important part is ** defect analysis **: In this part , ↩→your core task is to check whether the errors or defects of ↩→the "solution" pointed out in the "solution evaluation" are ↩→reasonable. In other words , any positive components about ↩→the "solution" in the "solution evaluation", regardless of ↩→whether they are reasonable , are not within your evaluation ↩→scope.

- For example: If the "solution evaluation" says that a certain ↩→conclusion in the "solution" is correct , but actually this ↩→conclusion is incorrect , then you do not need to care about ↩→this point. All parts that the "solution evaluation" ↩→considers correct do not belong to your evaluation scope. - Specifically: If the "solution evaluation" believes that the " ↩→solution" is completely accurate and has not found any ↩→errors or defects , then regardless of whether the "solution" ↩→ itself is actually accurate , even if there are obvious ↩→errors , you should still consider its analysis of errors to ↩→be reasonable.

** Importantly **, for defects found by the "solution evaluation", ↩→you need to analyze two points simultaneously :

- whether this defect actually exists - whether the "solution evaluation"’s analysis of this defect is ↩→accurate

These two aspects constitute the analysis of defects.

4. About ** expression analysis **, if there are certain expression ↩→ errors in the "solution evaluation", even minor errors in ↩→details , you need to identify them. However , please note ↩→that identifying incorrect steps in the "solution" as ↩→correct steps does not constitute an ** expression error **.

In practice , expression errors include but are not limited to:

- If the "solution evaluation" identifies some reasoning step(s) ↩→in the "solution" as incorrect , then it cannot further ↩→indicate that subsequent conclusion(s) depending on those ↩→reasoning step(s) are wrong , but can only indicate that ↩→subsequent conclusion(s) are "not rigorously demonstrated ." - Typos and calculation errors made by "solution evaluation" - Inaccurate restatement of content from "solution"

5. Finally , you need to present your analysis of the "solution ↩→evaluation" in your output and also rate its quality based ↩→on the rules below:

First , if there is at least one unreasonable defect among the ↩→defects found by the "solution evaluation", then you only ↩→need to do ** defect analysis **:

- If all defects found by the "solution evaluation" are ↩→unreasonable , then you should rate it with \(0\)

17

<!-- page 18 of 19 -->

- If some defects found by the "solution evaluation" are ↩→reasonable and some are unreasonable , then your rating ↩→should be \(0.5\)

Next , if the "solution evaluation" points out no errors or ↩→defects , or all defects found by the evaluation are ↩→reasonable , then you should do the following things:

- Analyze whether "expression errors" exist in the "solution ↩→evaluation" (** expression analysis **) or whether "solution ↩→evaluation" gives a wrong score according to the rules for " ↩→solution evaluation" (** score analysis **). If yes , you ↩→should rate the "solution evaluation" with \(0.5\); if no , ↩→your rating should be \(1\)

Your output should follow the format below:

Here is my analysis of the "solution evaluation ": ... // Your analysis here.

Based on my analysis , I will rate the "solution evaluation" as: \\ boxed {{...}} // where ... should be a numerical rating of the " ↩→solution evaluation" (0, 0.5, or 1, and nothing else) based ↩→on the criteria above.

---

Here is your task input:

## Problem {question}

## Solution {proof}

## Solution Evaluation {proof analysis}

A.4. Proof Refinement Prompt

{ proof_generation_prompt }

## Candidate Solution(s) to Refine Here are some solution sample(s) along with their correctness ↩→evaluation(s). You should provide a better solution by ↩→solving issues mentioned in the evaluation(s), or by re - ↩→using promising ideas mentioned in the solution sample(s), ↩→or by doing both.

{proof} {proof analyses}

## Final Instruction Your final response should follow the format above , including a ↩→‘## Solution ‘ section followed by a ‘## Self Evaluation ‘

18

<!-- page 19 of 19 -->

↩→section

19
