---
title: "01 · DeepSeek-Prover-V2 英中对照"
category: "模型技术报告"
tags: ["DeepSeek", "形式化数学", "Lean 4", "双语对照"]
published: true
excerpt: "DeepSeek-Prover-V2 通过子目标分解、递归证明搜索与强化学习连接自然语言推理和 Lean 4 形式证明."
---
# DeepSeek-Prover-V2 英中对照

<!-- arXiv 2504.21801; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/deepseek-prover-v2/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 39 -->

DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via

Reinforcement Learning for Subgoal Decomposition

Z.Z. Ren*, Zhihong Shao*, Junxiao Song*, Huajian Xin†, Haocheng Wang†, Wanjia Zhao†, Liyue Zhang, Zhe Fu

Qihao Zhu, Dejian Yang, Z.F. Wu, Zhibin Gou, Shirong Ma, Hongxuan Tang, Yuxuan Liu, Wenjun Gao

Daya Guo, Chong Ruan

DeepSeek-AI

https://github.com/deepseek-ai/DeepSeek-Prover-V2

Abstract

We introduce DeepSeek-Prover-V2, an open-source large language model designed for formal

theorem proving in Lean 4, with initialization data collected through a recursive theorem prov- ing pipeline powered by DeepSeek-V3. The cold-start training procedure begins by prompting DeepSeek-V3 to decompose complex problems into a series of subgoals. The proofs of resolved subgoals are synthesized into a chain-of-thought process, combined with DeepSeek-V3’s step- by-step reasoning, to create an initial cold start for reinforcement learning. This process enables us to integrate both informal and formal mathematical reasoning into a unified model. The resulting model, DeepSeek-Prover-V2-671B, achieves state-of-the-art performance in neural theorem proving, reaching 88.9% pass ratio on the MiniF2F-test and solving 47 out of 658 problems from PutnamBench. In addition to standard benchmarks, we introduce ProverBench, a collection of 325 formalized problems, to enrich our evaluation, including 15 selected prob- lems from the recent AIME competitions (years 24-25). Further evaluation on these 15 AIME problems shows that the model successfully solves 6 of them. In comparison, DeepSeek-V3 solves 8 of these problems using majority voting, highlighting that the gap between formal and informal mathematical reasoning in large language models is substantially narrowing.

DeepSeek-Prover-V2-671B DeepSeek-Prover-V2-7B Kimina-Prover-Preview 72B BFS-Prover 7B STP 7B Geodel-Prover 7B DeepSeek-V3-0324 (Informal)

10

90

88.9%

50

47

8

8

85

40

82.0%

arXiv:2504.21801v2  [cs.CL]  18 Jul 2025

80.7%

6

80

6

30

75

73.0%

Pass Rate (%)

4

20

70

67.6%

2

Number of Problems Solved (out of 15)

Number of Problems Solved (out of 658)

10

64.7%

9 8 7

65

1

60

0

0

MiniF2F-test

PutnamBench

ProverBench-AIME 24&25

Figure 1 | Benchmark performance of DeepSeek-Prover-V2. On the AIME benchmark, DeepSeek- V3 is evaluated using the standard find-answer task for natural-language reasoning, while prover models generate Lean code to construct formal proofs for a given correct answer.

*Core contributors †Work done during internship at DeepSeek-AI.

Abstract · 摘要

我们提出 DeepSeek-Prover-V2, 一个面向 Lean 4 形式定理证明的开源大语言模型. 初始化数据由 DeepSeek-V3 驱动的递归证明管线收集. 冷启动训练先提示 DeepSeek-V3 把复杂问题拆成一系列子目标. 已解决子目标的证明被合成为 chain-of-thought, 再与 DeepSeek-V3 的逐步推理结合, 构成强化学习的冷启动数据. 该过程把非形式数学推理与形式推理统一到同一个模型中.

DeepSeek-Prover-V2-671B 在 MiniF2F-test 达到 88.9% pass ratio, 并解出 PutnamBench 658 道题中的 47 道. 新增的 ProverBench 包含 325 道形式化问题, 其中有 AIME 2024–2025 精选的 15 道题, 模型解出 6 道. DeepSeek-V3 通过自然语言多数投票解出其中 8 道, 显示形式与非形式数学推理的差距正在缩小.

<!-- page 2 of 39 -->

1. Introduction

The emergence of reasoning capabilities in large language models (LLMs) has revolutionized numerous areas of artificial intelligence, particularly in the domain of mathematical problem solving (DeepSeek-AI, 2025). These advancements are largely enabled by the paradigm of inference-time scaling, most notably through natural language chain-of-thought reasoning (Jaech et al., 2024). Rather than relying solely on a single forward pass to arrive at an answer, LLMs can reflect on intermediate reasoning steps, improving both accuracy and interpretability. Despite the success of natural language reasoning in solving competition-level mathematical problems, its application to formal theorem proving remains fundamentally challenging. LLMs perform natural language reasoning in an inherently informal manner, relying on heuristics, ap- proximations, and data-driven guessing patterns that often lack the rigorous structure required by formal verification systems. In contrast, proof assistants such as Lean (Moura and Ullrich, 2021), Isabelle (Paulson, 1994), and Coq (Barras et al., 1999) operate on strict logical foundations, where every proof step must be explicitly constructed and formally verified. These systems permit no ambiguity, implicit assumptions, or omission of details. Bridging the gap between informal, high-level reasoning and the syntactic rigor of formal verification systems remains a longstanding research challenge in neural theorem proving (Yang et al., 2024).

To harness the strengths of informal mathematical reasoning in support of formal theorem proving, a classical approach is to hierarchically decompose formal proofs based on the guidance of natural-language proof sketches. Jiang et al. (2023) proposed a framework, called Draft, Sketch, and Prove (DSP), that leverages a large language model to generate proof sketches in natural language, which are subsequently translated into formal proof steps. This informal-to-formal theorem proving paradigm closely mirrors the concept of subgoals in hierarchical reinforcement learning (Barto and Mahadevan, 2003; Nachum et al., 2018; Eppe et al., 2022), where complex tasks are broken down into a hierarchy of simpler subtasks that can be solved independently to progressively achieve the overarching objective. In formal theorem proving, a subgoal is typically an intermediate proposition or lemma that contributes to the proof of a larger theorem (Zhao et al., 2023, 2024). This hierarchical decomposition aligns with human problem- solving strategies and supports modularity, reusability, and more efficient proof search (Wang et al., 2024b; Zheng et al., 2024). Recent studies have extended this paradigm by employing multi-tiered hierarchies for structured proof generation (Wang et al., 2024a), and by leveraging reinforcement learning techniques to optimize the decomposition of complex theorems into manageable subgoals (Dong et al., 2024).

In this paper, we develop a reasoning model for subgoal decomposition, leveraging a suite of synthetic cold-start data and large-scale reinforcement learning to enhance its performance. To construct the cold-start dataset, we develop a simple yet effective pipeline for recursive theorem proving, utilizing DeepSeek-V3 (DeepSeek-AI, 2024) as a unified tool for both subgoal decompo- sition and formalization. We prompt DeepSeek-V3 to decompose theorems into high-level proof sketches while simultaneously formalizing these proof steps in Lean 4, resulting in a sequence of subgoals. Since the subgoal decomposition is powered by a large general-purpose model, we use a smaller 7B model to handle the proof search for each subgoal, thereby reducing the associated computational burden. Additionally, we introduce a curriculum learning framework that lever- ages the decomposed subgoals to generate conjectural theorems, progressively increasing the difficulty of training tasks to better guide the model’s learning process. Once the decomposed steps of a challenging problem are resolved, we pair the complete step-by-step formal proof with the corresponding chain-of-thought from DeepSeek-V3 to create cold-start reasoning data. Based on the cold start, a subsequent reinforcement learning stage is applied to further strengthen

2

1. Introduction · 引言

LLM 推理能力的发展改变了数学问题求解. 这些进展很大程度来自 TestingTime scaling, 特别是自然语言 chain-of-thought. LLM 可以检查中间步骤, 不必依赖一次前向计算直接作答. 但自然语言推理依赖启发式, 近似和数据驱动猜测, 缺少形式验证所需的严格结构. Lean, Isabelle, Coq 等 proof assistant 要求每一步都明确构造并通过内核检查, 不允许歧义, 隐含假设或细节省略. 连接高层非形式推理与形式语法一直是神经定理证明的核心难题.

经典路线是由自然语言证明草图指导, 分层拆解形式证明. Draft, Sketch, and Prove 先生成自然语言草图, 再翻译为形式步骤. subgoal 是服务于更大定理的中间命题或引理. 分解支持模块化, 复用和更高效的搜索, 后续研究也用多级层次或强化学习优化子目标拆分.

本文使用 DeepSeek-V3 同时完成子目标拆分和形式化. 它把定理分成高层证明草图, 同时把步骤写成 Lean 4 子目标. 更小的 7B prover 负责各子目标的证明搜索, 降低计算负担. curriculum learning 利用子目标生成猜想定理, 逐步提高任务难度. 全部子目标解决后, 完整形式证明与 DeepSeek-V3 的 chain-of-thought 配对, 形成冷启动数据, 随后的强化学习继续加强形式证明能力.

<!-- page 3 of 39 -->

Recursively Solve Subgoals by DeepSeek-Prover-V2-7B

theorem induction_ineq_nsqlefactn (n : ℕ) (h₀ : 4 ≤ n) : n ^ 2 ≤ n ! := sorry

Show that for any integer $n \ge 4$, we have $n^2 \le n!$.

lemma inductive_step (n : ℕ) (h₀ : 4 ≤ n) (base_case : 4 ^ 2 ≤ 4 !) : ∀ k ≥ 4, k ^ 2 ≤ k ! → (k + 1) ^ 2 ≤ (k + 1) ! := by sorry

Synthesize into Complete Formal Proofs

Understanding the Problem We need to show that for any integer $n \ge 4$, the inequality $n^2 \le n!$ holds. Here, $n!$ denotes the factorial of $n$, which is the product of all positive integers up to $n$.

theorem induction_ineq_nsqlefactn (n : ℕ) (h₀ : 4 ≤ n) : n ^ 2 ≤ n ! := by have base_case : 4 ^ 2 ≤ 4 ! := by simp [Nat.factorial]

chain-of-thought by DeepSeek-V3

Proof Sketch To prove this formally, we can use mathematical induction. Here's how the induction would work: 1. Base Case: Verify the inequality for $n = 4$. 2. Inductive Step: Assume the inequality holds for some $n \ge 4$, i.e., $n^2 \le n!$. Then show that it holds for $n + 1$, i.e., $(n + 1)^2 \le (n + 1)!$.

have inductive_step : ∀ k ≥ 4, k ^ 2 ≤ k ! → (k + 1) ^ 2 ≤ (k + 1) ! := by intro k h₁ h₂ simp_all [Nat.factorial] nlinarith

Lean 4 Proof Structure

theorem induction_ineq_nsqlefactn (n : ℕ) (h₀ : 4 ≤ n) : n ^ 2 ≤ n ! := by have base_case : 4 ^ 2 ≤ 4 ! := by sorry

have inductive_step : ∀ k ≥ 4, k ^ 2 ≤ k ! → (k + 1) ^ 2 ≤ (k + 1) ! := by sorry

have final_proof : ∀ n ≥ 4, n ^ 2 ≤ n ! := by intro n hn induction' hn with k hk case refl => exact base_case case step => apply inductive_step k hk exact by assumption

apply final_proof exact h₀

have final_proof : ∀ n ≥ 4, n ^ 2 ≤ n ! := by sorry sorry

Figure 2 | Overview of the cold-start data collection process employed by DeepSeek-Prover-V2. We first prompt DeepSeek-V3 to generate a natural-language proof sketch while simultaneously

formalizing it into a Lean statement with sorry placeholders for omitted proof details. A 7B prover model then recursively solves the decomposed subgoals. By combining these subgoal proofs, we construct a complete formal proof for the original complex problem. This composed proof is appended to DeepSeek-V3’s original chain-of-thought, creating high-quality cold-start training data for formal mathematical reasoning.

the connection between informal mathematical reasoning and formal proof construction. Our experiments show that reinforcement learning starting from the cold start of informal reasoning in task decomposition significantly enhances the model’s capabilities in formal theorem prov- ing. The resulting DeepSeek-Prover-V2-671B model establishes a new state-of-the-art in neural theorem proving across multiple benchmarks. On MiniF2F-test, it achieves 82.4% accuracy with Pass@32, improving to 88.9% with Pass@8192. The model shows strong generalization capabilities to college-level theorem proving, solving 37.1% of ProofNet-test problems with Pass@1024 and tackling 47 out of 658 challenging PutnamBench problems. Additionally, we contribute ProverBench, a benchmark dataset containing 325 formalized problems to advance neural theorem proving research, including 15 from the prestigious AIME competitions (years 24-25). DeepSeek-Prover-V2-671B successfully solves 6 of these 15 challenging AIME problems, further demonstrating its sophisticated mathematical reasoning capabilities.

2. Method

2.1. Recursive Proof Search via Subgoal Decomposition

Decomposing the proof of a complex theorem into a sequence of smaller lemmas that serve as stepping stones is an effective strategy commonly employed by human mathematicians. Several previous studies have explored this hierarchical strategy in the context of neural theorem prov- ing, aiming to enhance proof search efficiency by leveraging the informal reasoning capabilities of modern LLMs (Jiang et al., 2023; Zhao et al., 2023; Wang et al., 2024a; Dong et al., 2024). In this paper, we develop a simple yet effective pipeline that utilizes DeepSeek-V3 (DeepSeek-AI, 2024) as a unified tool for subgoal decomposition in formal theorem proving.

3

实验显示, 以任务拆分的非形式推理作为冷启动, 强化学习能显著改善形式证明. 671B 模型在 MiniF2F-test 的 Pass@32 为 82.4%, Pass@8192 为 88.9%; ProofNet-test 的 Pass@1024 为 37.1%; PutnamBench 解出 47/658. ProverBench 的 15 道 AIME 题中解出 6 道.

2. Method · 方法

2.1. 通过子目标拆分递归证明搜索

把复杂定理分解为一系列较小引理是数学家常用的策略. 本文以 DeepSeek-V3 作为形式证明中子目标拆分和形式化的统一工具, 再由专门 prover 完成细节.

<!-- page 4 of 39 -->

Subgoal Decomposition

(a) Substitute the original goal

lemma lower_bound (a b c d s : ℝ) (h₀ : 0 < a ∧ 0 < b ∧ 0 < c ∧ 0 < d) (h₁ : s = a / (a + b + d) + b / (a + b + c) + c / (b + c + d) + d / (a + c + d)) : 1 < s := by sorry

(b) Incorporate preceding subgoals as premises

theorem imo_1974_p5 (a b c d s : ℝ) (h₀ : 0 < a ∧ 0 < b ∧ 0 < c ∧ 0 < d) (h₁ : s = a / (a + b + d) + b / (a + b + c) + c / (b + c + d) + d / (a + c + d)) : 1 < s ∧ s < 2 := by have term1_pos : 0 < a / (a + b + d) := by sorry have term1_less1 : a / (a + b + d) < 1 := by sorry have term2_pos : 0 < b / (a + b + c) := by sorry have term2_less1 : b / (a + b + c) < 1 := by sorry have term3_pos : 0 < c / (b + c + d) := by sorry have term3_less1 : c / (b + c + d) < 1 := by sorry have term4_pos : 0 < d / (a + c + d) := by sorry have term4_less1 : d / (a + c + d) < 1 := by sorry have lower_bound : 1 < s := by sorry have upper_bound : s < 2 := by sorry sorry

lemma lower_bound (a b c d s : ℝ) (h₀ : 0 < a ∧ 0 < b ∧ 0 < c ∧ 0 < d) (h₁ : s = a / (a + b + d) + b / (a + b + c) + c / (b + c + d) + d / (a + c + d)) (term1_pos : 0 < a / (a + b + d)) (term1_less1 : a / (a + b + d) < 1) (term2_pos : 0 < b / (a + b + c)) (term2_less1 : b / (a + b + c) < 1) (term3_pos : 0 < c / (b + c + d)) (term3_less1 : c / (b + c + d) < 1) (term4_pos : 0 < d / (a + c + d)) (term4_less1 : d / (a + c + d) < 1) : 1 < s := by sorry

Figure 3 | An illustrative example of how we translate decomposed subgoals into a series of lemma statements. We first (a) replace the original goal state and then (b) incorporate preceding subgoals as premises. Statement type (b) is used for recursive solving of complex problems, while both types (a) and (b) are incorporated into the curriculum learning process.

Sketching Formal Proofs from Natural Language Reasoning. Recent advances in large lan- guage models have led to significant breakthroughs in informal reasoning capabilities. To bridge the gap between formal and informal reasoning, we leverage cutting-edge general-purpose LLMs, recognized for their strong mathematical reasoning and instruction-following abilities, to construct the foundational framework of our theorem-proving system. Our findings indicate that off-the-shelf models, such as DeepSeek-V3 (DeepSeek-AI, 2024), are capable of decompos- ing proof steps and expressing them in formal languages. To prove a given formal theorem statement, we prompt DeepSeek-V3 to first analyze the mathematical problem in natural lan- guage, then decompose the proof into smaller steps, translating each step into a corresponding Lean formal statement. Since general-purpose models are known to struggle with producing complete Lean proofs, we instruct DeepSeek-V3 to generate only a high-level proof sketch with the details omitted. The resulting chain of thought culminates in a Lean theorem composed of a sequence of have statements, each concluded with a sorry placeholder indicating a subgoal to be solved. This approach mirrors the human style of proof construction, in which a complex theorem is incrementally reduced to a sequence of more manageable lemmas.

Recursive Resolution of Subgoals. Leveraging the subgoals generated by DeepSeek-V3, we adopt a recursive solving strategy to systematically resolve each intermediate proof step. We extract subgoal expressions from have statements to substitute them for the original goals in the given problems (see Figure 3(a)), and then incorporate the preceding subgoals as premises (see Figure 3(b)). This construction enables subsequent subgoals to be resolved using the intermediate results of earlier steps, thereby promoting a more localized dependency structure and facilitating the development of simpler lemmas. To reduce the computational overhead of extensive proof search, we employ a smaller 7B prover model specifically optimized for processing the decomposed lemmas. Upon the successful resolution of all decomposed steps, a complete proof of the original theorem can be automatically derived.

Curriculum Learning for Subgoal-based Theorem Proving. The training of prover models requires large formal-language problem sets, typically derived by formalizing existing natural- language mathematical corpora (Xin et al., 2024a; Ying et al., 2024; Lin et al., 2025). Although formalization of human-authored texts provides high-quality and diverse formal content, the resulting training signals for prover models are often sparse, as a large proportion of computa-

4

从自然语言推理勾勒形式证明. DeepSeek-V3 先用自然语言分析问题, 再把证明分成较小步骤, 将每一步翻译为 Lean statement. 通用模型难以一次产生完整 Lean 证明, 因而只生成高层草图, 省略的细节由 `sorry` 占位. 最终 theorem 由一系列 `have` statement 构成, 每个占位符对应待解决子目标.

递归解决子目标. 管线从 `have` statement 抽取子目标表达式, 用它替换原目标, 再把此前子目标作为 premise. 后续步骤可以利用前面已证中间结果, 形成局部依赖. 专门优化的 7B prover 搜索这些较小引理, 全部成功后自动组合出原定理的完整证明.

<!-- page 5 of 39 -->

tional attempts do not yield successful proofs and therefore offer no positive reward signals. To generate denser training signals, Dong and Ma (2025) proposed a self-play approach that enriches training problem sets by generating tractable conjectures closely related to the original theorem statements, thereby enabling more efficient use of training compute. In this paper, we implement a straightforward approach that leverages subgoals to expand the scope of formal statements used for model training. We generate two types of subgoal theorems, one incor- porating preceding subgoals as premises and one without, corresponding to Figure 3(b) and Figure 3(a), respectively. Both types are integrated into the expert iteration stage (Polu and Sutskever, 2020), establishing a curriculum that progressively guides the prover model toward systematically addressing a curated subset of challenging problems. This procedure builds on the same underlying principle as AlphaProof’s test-time reinforcement learning (DeepMind, 2024), wherein variations of a target problem are generated to enhance the model’s capability in solving challenging IMO-level problems.

2.2. Unifying Informal Reasoning and Proof Formalization

The algorithmic framework discussed above operates in two stages, leveraging two comple- mentary models: DeepSeek-V3 for lemma decomposition and a 7B prover model to complete the corresponding formal proof details. This pipeline provides a natural and scalable mecha- nism for synthesizing formal reasoning data by combining high-level reasoning from language models with precise formal verification. In this manner, we unify the capabilities of informal mathematical reasoning and proof formalization within a single model.

Cold Start by Synthetic Data. We curate a subset of challenging problems that remain unsolved by the 7B prover model in an end-to-end manner, but for which all decomposed subgoals have been successfully resolved. By composing the proofs of all subgoals, we construct a complete formal proof for the original problem. This proof is then appended to DeepSeek-V3’s chain-of- thought, which outlines the corresponding lemma decomposition, thereby producing a cohesive synthesis of informal reasoning and subsequent formalization. It enables the collection of hundreds of high-quality synthetic cold-start data, which serve as the foundation for training DeepSeek-Prover-V2. This cold-start dataset generation strategy differs from that of Kimina- Prover (Wang et al., 2025), a concurrent work on formal reasoning models. Specifically, we synthesize data by formalizing natural-language proofs directly into structured formal proof sketches. In contrast, Kimina-Prover adopts a reverse workflow: it begins by collecting complete formal proofs alongside their informal counterparts, then uses general-purpose reasoning models to retrosynthesize intermediate natural-language reasoning steps into coherent thinking blocks.

Reasoning-oriented Reinforcement Learning. After fine-tuning the prover model on the synthetic cold-start data, we perform a reinforcement learning stage to further enhance its ability to bridge informal reasoning with formal proof construction. Following the standard training objective for reasoning models (DeepSeek-AI, 2025), we use binary correct-or-incorrect feedback as the primary form of reward supervision. During the training process, we observe that the structure of the generated proofs frequently diverges from the lemma decomposition provided by the chain-of-thought guidance. To address this issue, we incorporate a consistency reward in the early steps of training, which penalizes the structural misalignment, explicitly enforcing the inclusion of all decomposed have-structured lemmas in the final proof. In practice, enforcing this alignment enhances proof accuracy, especially on complex theorems that demand multi-step reasoning.

5

基于子目标的 curriculum learning. 大量形式化问题的搜索不会产生成功证明, 正奖励稀疏. 本文把拆出的子目标转为两类 theorem: 一类把前序子目标作为 premise, 另一类不带这些 premise. 两类都进入 expert iteration, 形成从较易子问题逐步走向困难原问题的 curriculum. 其原则与 AlphaProof TestingTime 强化学习相近, 都通过目标问题变体增强解决困难题的能力.

2.2. 统一非形式推理与证明形式化

两阶段管线由 DeepSeek-V3 拆引理, 7B prover 补形式证明细节. 冷启动数据选择端到端 7B prover 无法解决, 但全部拆分子目标均可解决的问题. 合并各子证明得到完整形式证明, 再附到 DeepSeek-V3 的 lemma decomposition chain-of-thought 后, 构成数百条高质量合成数据. Kimina-Prover 从完整形式证明反向合成中间自然语言推理, 本文则把自然语言证明直接形式化成结构化草图, 两者方向不同.

强化学习使用二值正确性反馈. 训练早期还加入一致性奖励, 惩罚最终证明偏离 chain-of-thought 提供的 lemma 结构, 强制纳入全部拆分出的 `have` 引理. 对需要多步推理的复杂 theorem, 结构对齐能提高证明准确率.

<!-- page 6 of 39 -->

2.3. Training Details of DeepSeek-Prover-V2

Two-Stage Training. DeepSeek-Prover-V2 is developed through a two-stage training pipeline that establishes two complementary proof generation modes:

1. High-efficiency non-Chain-of-Thought (non-CoT) mode: This mode is optimized for the rapid generation of formal Lean proof codes, focusing on producing concise proofs without explicit intermediate reasoning steps. 2. High-precision Chain-of-Thought (CoT) mode: This mode systematically articulates intermediate reasoning steps, emphasizing transparency and logical progression, before constructing the final formal proofs.

Consistent with DeepSeek-Prover-V1.5 (Xin et al., 2024b), these two generation modes are governed by two distinct guiding prompts (see Appendix A for examples). In the first stage, we employ expert iteration within a curriculum learning framework to train a non-CoT prover model, meanwhile, synthesizing proofs for hard problems through subgoal-based recursive proving. The non-CoT generation mode is chosen to accelerate iterative training and data collection processes, as it offers significantly faster inference and validation cycles. Building on this foundation, the second stage leverages cold-start chain-of-thought (CoT) data synthesized by integrating DeepSeek-V3’s sophisticated mathematical reasoning patterns with our synthetic formal proofs. The CoT mode is enhanced through a further reinforcement learning stage, following the standard training pipeline commonly used for reasoning models.

Expert Iteration. The training procedure for the non-CoT mode of DeepSeek-Prover-V2 follows the paradigm of expert iteration (Polu and Sutskever, 2020), a widely adopted framework for developing formal theorem provers. In each training iteration, the current best prover policy is used to generate proof attempts for those challenging problems that remain unsolved in prior iterations. Those successful attempts, verified by Lean proof assistant, are incorporated into the SFT dataset to train an improved model. This iterative loop ensures that the model not only learns from the initial demonstration datasets but also distills its own successful reasoning traces, progressively refining its ability to solve harder problems. The overall training procedure remains largely aligned with that of DeepSeek-Prover-V1 (Xin et al., 2024a) and DeepSeek-Prover- V1.5 (Xin et al., 2024b), with only two modifications to the distribution of training problems. First, we incorporate additional problems derived from autoformalization and various open- source datasets (Ying et al., 2024; Dong and Ma, 2025; Lin et al., 2025), broadening the coverage of the training problem domains. Second, we augment the dataset with problems generated through subgoal decomposition, aiming at solving more challenging instances from the valid split of the MiniF2F benchmark (Zheng et al., 2022).

Supervised Fine-tuning. We perform supervised fine-tuning on DeepSeek-V3-Base-671B (DeepSeek-AI, 2024) using a constant learning rate of 5e-6 within a context window of 16,384 tokens. Our training corpus consists of two complementary sources: (1) non-CoT data collected through expert iteration, which produces Lean codes without intermediate reasoning steps; and (2) the cold-start CoT data described in Section 2.2, which distills DeepSeek-V3’s advanced mathematical reasoning processes into structured proving pathways. The non-CoT components emphasize formal verification skills in the Lean theorem prover ecosystem, while the CoT examples explicitly model the cognitive process of transforming mathematical intuition into formal proof structures.

6

2.3. 两种证明模式

统一模型支持两种模式. non-CoT 模式追求快速生成简洁 Lean proof code, 不显式展示中间推理. CoT 模式先系统陈述中间推理步骤, 强调逻辑进展, 再构造最终形式证明. 二者只使用不同 prompt, 不对应两套独立模型.

3. Experimental Results · 实验结果

miniF2F 使用 Wang 等人修订的版本, 并进一步修正 valid 中两题与 test 中一题. 表 1 比较多种 prover. 671B CoT 在 32 次采样下达到 82.4%, 8192 次达到 88.9%; 7B CoT 对应 75.6% 与 82.0%. 随 sample budget 从 1 增至 8192, 671B 相对 7B 的差距扩大, 大模型表现出更高样本效率和更陡的提升曲线.

<!-- page 7 of 39 -->

Reinforcement Learning. We employ Group Relative Policy Optimization (GRPO; Shao et al., 2024) as our reinforcement learning algorithm, which has demonstrated superior effectiveness and efficiency in reasoning tasks (DeepSeek-AI, 2025). Unlike PPO (Schulman et al., 2017), GRPO eliminates the need for a separate critic model by sampling a group of candidate proofs for each theorem prompt and optimizing the policy based on their relative rewards. Training utilizes binary rewards, where each generated Lean proof receives a reward of 1 if verified as correct and 0 otherwise. To ensure effective learning, we curate training prompts to include only problems that are sufficiently challenging yet solvable by the supervised fine-tuned model. During each iteration, we sample 256 distinct problems, generating 32 candidate proofs per theorem with a maximum sequence length of 32,768 tokens.

Distillation. We extend the maximum context length of DeepSeek-Prover-V1.5-Base-7B (Xin et al., 2024b) from 4,096 to 32,768 tokens and fine-tune this extended-context model using rollout data collected during the reinforcement learning phase of DeepSeek-Prover-V2-671B. Alongside the CoT reasoning mode, we incorporate non-CoT proof data collected during expert iteration to enable a cost-efficient proving option that produces concise formal outputs with a small-size model. In addition, we perform the same reinforcement learning stage used in the training of the 671B model to boost the performance of DeepSeek-Prover-V2-7B.

3. Experimental Results

In this section, we present a systematic evaluation of DeepSeek-Prover-V2 across diverse bench- mark datasets of formal theorem proving, covering both high school competition problems and undergraduate-level mathematics. All experimental results of DeepSeek-Prover-V2 are conducted with Lean 4.9.0-rc2, using the same testing environment as DeepSeek-Prover-V1.5 (Xin et al., 2024b). Without further specification, baseline evaluation results are sourced from their respective original papers.

3.1. Results on MiniF2F Benchmark

MiniF2F (Zheng et al., 2022) consists of 488 formalized problem statements sourced from a diverse range of mathematical materials, including the AIME, AMC, and IMO competitions, along with selected problems from the MATH dataset (Hendrycks et al., 2021). The benchmark includes Olympiad-level problems covering core areas of elementary mathematics, including algebra, number theory, and induction. These problems are divided into two equally sized subsets, denoted by miniF2F-valid and miniF2F-test, each containing 244 problems with an identical distribution across subject areas. We reserve the miniF2F-test set exclusively for evalu- ating model performance, while the miniF2F-valid problems are incorporated into curriculum learning with subgoal decomposition. We adopt the revised version of miniF2F released by Wang et al. (2025), and further introduce two additional revisions to miniF2F-valid and one

revision to miniF2F-test (see Appendix D).

Comparison with SoTA Models. Table 1 summarizes a comparison of state-of-the-art formal theorem-proving modeling evaluated on the miniF2F-test dataset. The experimental results demonstrate that DeepSeek-Prover-V2-671B establishes a new state-of-the-art performance on the miniF2F-test benchmark, achieving an unprecedented 82.4% accuracy with only 32 samples when leveraging the CoT generation strategy. Notably, the more parameter-efficient

7

Table 1 | 各方法在 miniF2F-test 上的对比. $\mu\pm\sigma$ 表示平均准确率与标准差. CoT 与 non-CoT 是同一模型由不同 prompt 引导的两种生成模式.

Table 2 | 671B 在 miniF2F 的解题分布. valid 结果在 curriculum learning 期间收集, 剩余题目再用 Pass@8192 调用模型.

<!-- page 8 of 39 -->

Method Model size Sample budget miniF2F-test

Tree Search Methods

Hypertree Proof Search (Lample et al., 2022) 600M 64 × 5000 41.0% InternLM2.5-StepProver + BFS + CG (Wu et al., 2024) 7B 256 × 32 × 600 65.9% HunyuanProver v16 + BFS + DC (Li et al., 2024) 7B 600 × 8 × 400 68.4% BFS-Prover (Xin et al., 2025) 7B 2048 × 2 × 600 70.83% ± 0.89%

Whole-proof Generation Methods

Leanabell-Prover-GD-RL (Zhang et al., 2025) 7B 128 61.1% Goedel-Prover-SFT (Lin et al., 2025) 7B 25600 64.7% STP (Dong and Ma, 2025) 7B 25600 67.6%

Kimina-Prover-Preview-Distill (Wang et al., 2025) 7B 1 52.5% 32 63.1% 1024 70.8%

Kimina-Prover-Preview (Wang et al., 2025) 72B

1 52.94% 32 68.85% 1024 77.87% 8192 80.74%

7B

1 55.5% ± 1.4% 32 68.0% ± 0.5% 1024 73.2% ± 0.5% 8192 75.0%

DeepSeek-Prover-V2 (non-CoT)

671B

1 59.5% ± 1.4% 32 73.8% ± 0.4% 1024 76.7% ± 0.2% 8192 78.3%

7B

1 58.6% ± 1.1% 32 75.6% ± 0.5% 1024 79.9% ± 0.3% 8192 82.0%

DeepSeek-Prover-V2 (CoT)

671B

1 61.9% ± 1.6% 32 82.4% ± 0.6% 1024 86.6% ± 0.3% 8192 88.9%

Table 1 | Comparison with state-of-the-art models on the miniF2F-test dataset. The notation

𝜇± 𝜎denotes the average accuracy 𝜇and the standard deviation 𝜎. The tags CoT and non-CoT refer to two generation modes of a unified model, each guided by a different prompt.

Problem Category miniF2F-valid miniF2F-test curriculum (+Pass@8192) Pass@8192

Olympiad

IMO 10/20 = 50.0% 10/20 = 50.0% AIME 10(+2)/15 = 80.0% 14/15 = 93.3% AMC 39/45 = 86.7% 35/45 = 77.8%

MATH Algebra 69/70 = 98.6% 70/70 = 100.0% Number Theory 58/60 = 96.7% 58/60 = 96.7%

Custom

Algebra 17/18 = 94.4% 15/18 = 83.3% Number Theory 8/8 = 100.0% 7/8 = 87.5% Induction 8/8 = 100.0% 8/8 = 100.0%

Overall Pass Rate 219(+2)/244 = 90.6% 217/244 = 88.9%

Table 2 | Problems solved by DeepSeek-Prover-V2-671B on the miniF2F benchmark. Results on miniF2F-valid are collected throughout the curriculum learning process, and DeepSeek-Prover- V2-671B is further invoked with Pass@8192 on the remaining problems.

8

7B 也超过已有开源 prover. 子目标 curriculum 在 miniF2F-valid 达到接近 671B 的成功率, 表明通用 DeepSeek-V3 与专门 7B prover 的组合能够通过战略性拆分连接非形式推理和形式构造.

CoT 相对 non-CoT 有明显优势, 支持 TestingTime scaling 同样适用于形式证明. Table 3 中, 7B 的 non-CoT/CoT 平均输出为 442.6/4488.5 token, 671B 为 761.8/6751.9. 即使没有显式要求推理, 671B 也常在 proof code 中插入类似隐式推理的简短自然语言注释.

<!-- page 9 of 39 -->

DeepSeek-Prover-V2-7B also exhibits competitive performance, surpassing all existing open- source theorem provers in the literature. The comparative analysis further reveals a compelling scaling pattern: as the sample budget increases from 1 to 8192, the performance gap between the 7B and 671B variants widens considerably, with the larger model demonstrating superior sample efficiency and a steeper improvement trajectory.

Proving Challenging Problems through Subgoal-guided Curricula. Table 2 presents a de- tailed breakdown of the problems solved by DeepSeek-Prover-V2 on the miniF2F benchmark, where it achieves strong overall performance with a 90.6% pass rate on the validation set and 88.9% on the test set. Remarkably, our subgoal-guided curriculum learning framework, which integrates the general-purpose model DeepSeek-V3 with a lightweight specialized 7B prover, achieves a 89.8% success rate on miniF2F-valid, nearly matching the performance of DeepSeek- Prover-V2-671B. These findings highlight the potential of state-of-the-art general-purpose LLMs to extend beyond natural language understanding and effectively support complex formal reasoning tasks. Through strategic subgoal decomposition, the model is able to break down challenging problems into a sequence of tractable steps, serving as an effective bridge between informal reasoning and formal proof construction.

#output tokens non-CoT CoT

7B 442.6 4488.5 671B 761.8 6751.9

Table 3 | Average number of tokens generated by DeepSeek-Prover-V2 on miniF2F-test.

CoT vs. non-CoT. The experimental results in Table 1 demonstrate a substantial perfor- mance advantage of the CoT reasoning mode over the non-CoT mode in formal mathemat- ical reasoning. This reinforces the effectiveness of CoT prompting, which encourages decom- position of complex problems into intermedi- ate steps, and further confirms that inference- time scaling holds in the domain of formal theorem proving. Complementing these findings, Table 3 provides statistics on the number of tokens generated by DeepSeek-Prover-V2 under different reasoning modes. As expected, the CoT mode produces significantly longer outputs, reflecting its sophisticated reasoning process. Interestingly, within the non-CoT setting, the 671B model generates longer outputs on average compared to the 7B model. A closer examination reveals that, although explicit reasoning is not prompted in the non-CoT mode, the larger model often inserts brief natural language comments within the proof code that resemble implicit reasoning steps (see Appendix A). This suggests that high-capacity models may internalize and externalize intermediate reasoning implicitly, even in the absence of explicit CoT prompting

3.2. Results on Undergraduate-level Benchmarks

ProofNet (Azerbayev et al., 2023) consists of 371 problems in Lean 3, drawn from a range of popular undergraduate pure mathematics textbooks, covering topics such as real and complex analysis, linear algebra, abstract algebra, and topology. We use the Lean 4 translation of ProofNet made available by Xin et al. (2024b), which is further divided into two splits: ProofNet-valid and ProofNet-test, containing 185 and 186 problems, respectively. The test split of ProofNet is reserved exclusively for model evaluation, as variants of the ProofNet-valid problems are included in the public synthetic dataset provided by Dong and Ma (2025), which is used in our supervised fine-tuning. The results, shown in Table 4, indicate a substantial improvement in the pass rate of DeepSeek-Prover-V2 when using CoT reasoning compared to the non- CoT setting. Notably, despite the training data being predominantly drawn from high-school

9

3.2. 本科层级基准

ProofNet 包含 371 道由本科纯数学教材提取的 Lean 3 问题, 覆盖实分析, 复分析, 线性代数, 抽象代数与拓扑. 本文使用 Lean 4 版本, valid/test 分别为 185/186. test 专用于评价, 因为 public synthetic data 已包含 valid 的变体. CoT 明显高于 non-CoT, 671B CoT 在 Pass@1024 达到 37.1%, 显示以高中数学为主的训练仍能泛化到本科定理.

<!-- page 10 of 39 -->

Method Model size Sample budget ProofNet-test PutnamBench

Goedel-Prover-SFT (Lin et al., 2025) 7B 32 15.6% 6/644 512 - 7/644

STP (Dong and Ma, 2025) 7B 128 19.5% ± 0.7% 7/644 3200 23.9% ± 0.6% 8/644 25600 26.9% -

7B 32 21.6% ± 0.2% 8/658 128 23.1% ± 0.6% 9/658 1024 24.7% 10/658

DeepSeek-Prover-V2 (non-CoT)

671B 32 23.8% ± 0.2% 9/658 128 27.2% ± 0.5% 11/658 1024 31.2% 15/658

7B 32 23.0% ± 0.4% 9/658 128 25.4% ± 0.7% 10/658 1024 29.6% 11/658

DeepSeek-Prover-V2 (CoT)

671B 32 30.5% ± 0.7% 22/658 128 33.6% ± 0.3% 33/658 1024 37.1% 47/658

Table 4 | The experimental results on ProofNet-test and PutnamBench. The scores for Goedel- Prover-SFT and STP on PutnamBench are sourced from their original papers, which conducted evaluations on an earlier version of PutnamBench comprising 644 problems.

level mathematics, the model exhibits strong generalization to more advanced, college-level mathematical problems, underscoring its robust formal reasoning capabilities.

PutnamBench (Tsoukalas et al., 2024) is a continuously updated benchmark featuring competi- tion mathematics problems from the William Lowell Putnam Mathematical Competition, spanning the years 1962 to 2023. The Putnam Competition is a highly prestigious annual mathematics competition for undergraduate students across the United States and Canada, encompassing a variety of college-level domains such as analysis, linear algebra, abstract algebra, combinatorics, probability, and set theory. We evaluate our model on the latest release of PutnamBench, which contains 658 problems formalized in Lean 4. We exclude problems that are incompatible with Lean 4.9.0 and evaluate the model on the remaining set of 649 problems. Our initial run solved 49 problems using a sample budget of 1024 per problem. After submitting the proofs to the benchmark maintainers, we excluded two problems due to misformulated statements. The final result stands at 47 problems successfully solved (as shown in Table 4), which significantly outperforms its non-CoT counterpart. These results further highlight the effectiveness of the CoT reasoning approach in handling challenging, college-level mathematical problems.

Reward Hacking in Reinforcement Learning. Our initial report claimed an unexpected finding that DeepSeek-Prover-V2-7B successfully solved 13 problems on PutnamBench that remained unsolved by its larger 671B counterpart. We acknowledge the Lean community for their assistance in identifying the cause of this unexpected result, which was traced to a user interface bug in Lean 4.9.0. Specifically, the apply? tactic fails to emit sorry declarations under certain corner cases. Upon closer examination of the model’s outputs, we identified a distinctive pattern in its reasoning approach: the 7B model frequently employs Cardinal.toNat and Cardinal.natCast_inj to exploit this user-interface bug (see examples in Appendix B), which are noticeably absent in the outputs generated by the 671B version.

10

PutnamBench 持续收录 1962–2023 年 Putnam 竞赛题. 最新版有 658 道 Lean 4 题, 排除与 Lean 4.9.0 不兼容项后评价 649 道. 初次运行以每题 1024 个样本解出 49 道; 提交给维护者后发现两题陈述错误并排除, 最终为 47 道. CoT 明显优于 non-CoT.

初版报告曾称 7B 解出 13 道而 671B 未解的 PutnamBench 题. Lean 社区查明原因是 Lean 4.9.0 UI bug: `apply?` 在若干边界情况下没有输出 `sorry` declaration. 7B 频繁用 `Cardinal.toNat` 和 `Cardinal.natCast_inj` 利用该漏洞, 671B 输出中没有同样模式. 这是强化学习 reward hacking 的直接案例, 编译成功并不总等于 theorem 在预期语义下得到合法证明.

<!-- page 11 of 39 -->

3.3. Results on Combinatorial Problems

CombiBench Pass@16

Kimina-Prover-Preview (Wang et al., 2025) 7/100

DeepSeek-Prover-V2-7B non-CoT 6/100 CoT 7/100

DeepSeek-Prover-V2-671B non-CoT 8/100 CoT 10/100

Table 5 | Evaluation results on CombiBench under the with-solution setting.

CombiBench (Liu et al., 2025) is a comprehen- sive benchmark comprising 100 combinatorial competition problems formalized in Lean 4, each paired with its corresponding natural-language statement. We evaluate DeepSeek-Prover-V2 in the with-solution setting of this benchmark, where the correct answer is embedded in the Lean statement, allowing the evaluation to fo- cus solely on proof generation. After filtering out problems incompatible with Lean 4.9.0 and those containing multiple sorry placeholders, we evaluate on 77 problems from the bench- mark. Our initial run reported 12 successfully solved problems. After collaborating with the benchmark maintainers and identifying two misformulated problem statements, the final result stands at 10 solved problems. These results indicate that, while the prover model is primarily trained in number theory and algebra, it demonstrates promising generalization to combinatorial problems, despite their persistent difficulty. An interesting finding is that the chain-of-thought reasoning of DeepSeek-Prover-V2-671B can effectively identify misformulations and adapt its proof strategy accordingly. We include an example in the Appendix C where the model detects a contradiction within a misformulated statement and derives False to close the target goal through exfalso.

3.4. Results on FormalMATH

FormalMATH All Lite

Pass@32 Pass@32 Pass@3200

Goedel-Prover-SFT (Lin et al., 2025) 13.53% 46.70% 49.41% STP (Dong and Ma, 2025) 13.87% 48.59% 53.17% Kimina-Prover-Preview-Distill-7B 16.46% 48.94% -

DeepSeek-Prover-V2-7B 22.41% 51.76% 55.06% DeepSeek-Prover-V2-671B 28.31% 56.00% 61.88%

Table 6 | Evaluation results on FormalMATH-All/Lite. The performance of DeepSeek-Prover-V2 is evaluated with the CoT generation mode.

FormalMATH (Yu et al., 2025) is a large-scale formal theorem proving benchmark with 5560 problems, rang- ing from high school Olympiad ques- tions to undergraduate-level theorems, and covering a wide range of domains such as algebra, applied mathematics, calculus, number theory, and discrete mathematics. FormalMATH-Lite is a manageable subset of 425 problems (comprising 359 high school-level and 66 undergraduate-level problems) care- fully selected from the full corpus, addressing the impracticality of evaluating on the full dataset while still enabling systematic assessment of test-time scaling across various mathematical do- main. Table 6 presents the comparative performance analysis of various theorem provers on both FormalMATH-All and FormalMATH-Lite benchmarks. DeepSeek-Prover-V2-671B demonstrates superior performance across all evaluation metrics, successfully solving 28.31% of problems in the full dataset and 56.00% of problems in the Lite subset with 32 samples. When computational budgets are expanded to accommodate 3200 samples, performance on the Lite subset demon- strates a marked improvement to 61.88%. The 7B parameter variant of DeepSeek-Prover-V2 also exhibits notable effectiveness, outperforming previous baselines including Goedel-Prover-SFT (Lin et al., 2025), STP (Dong and Ma, 2025), and Kimina-Prover-Preview-Distill-7B (Wang et al., 2025).

11

3.3. 组合问题

CombiBench 有 100 道 Lean 4 组合竞赛题及自然语言 statement. with-solution 设置把正确答案写入 Lean statement, 只评价证明生成. 去掉不兼容 Lean 4.9.0 与含多个 `sorry` 的题后剩 77 道. 初报解出 12 道, 与维护者核对后排除两道错误 statement, 最终 671B CoT 解出 10 道. Appendix C 展示模型发现错误陈述中的矛盾, 用 `exfalso` 从 False 关闭目标.

3.4. FormalMATH

FormalMATH 包含 5560 道形式证明题, FormalMATH-Lite 为 425 道子集. 671B CoT 在 All 的 Pass@32 为 28.31%, Lite 的 Pass@32 为 56.00%, Pass@3200 为 61.88%. 7B 也超过 Goedel-Prover-SFT, STP 和 Kimina-Prover-Preview-Distill-7B. 增加 sample budget 能继续提升, 同时成本显著增加.

<!-- page 12 of 39 -->

Method Model size Sample budget ProverBench All AIME 24&25

STP (Dong and Ma, 2025) 7B 32 27.5% ± 0.7% 0/15 128 31.4% ± 1.1% 1/15 512 36.3% 1/15

7B 32 47.7% ± 0.6% 1/15 128 48.8% ± 0.2% 1/15 512 49.5% 1/15

DeepSeek-Prover-V2 (non-CoT)

671B 32 49.5% ± 0.5% 1/15 128 51.5% ± 0.3% 2/15 512 52.3% 2/15

7B 32 49.0% ± 0.3% 1/15 128 50.8% ± 0.5% 1/15 512 51.7% 1/15

DeepSeek-Prover-V2 (CoT)

671B 32 52.9% ± 0.9% 4/15 128 56.5% ± 0.5% 5/15 512 59.1% 6/15

Table 7 | The experimental results on ProverBench. The All category represents the complete evaluation set consisting of 325 problems, while AIME 24&25 denotes a subset of 15 problems formalized from recent AIME competitions. The results for STP (Dong and Ma, 2025) are evaluated using the open-source model weights.

3.5. ProverBench: Formalization of AIME and Textbook Problems

To enhance existing benchmarks and advance research in formal theorem proving, we introduce a benchmark dataset comprising 325 problems. Of these, 15 are formalized from number theory and algebra questions featured in the recent AIME competitions (AIME 24 and 25), offering authentic high-school competition-level challenges. The remaining 310 problems are drawn from curated textbook examples and educational tutorials, contributing a diverse and pedagogically grounded collection of formalized mathematical problems. This benchmark is designed to enable more comprehensive evaluation across both high-school competition problems and undergraduate-level mathematics.

Contest Problems

AIME 24I P2 , P7 , P13

AIME 24II P4 , P7, P13 , P14

AIME 25I P1 , P8 , P9, P11

AIME 25II P2 , P4 , P13, P15

Table 8 | Selection of AIME 24&25 problems for formalization. Problems with underlined bolded indices have been solved by DeepSeek-Prover- V2. Problems solved by DeepSeek-V3-0324 using Maj@16 are highlighted with a gray background.

AIME Formalization. The American In- vitational Mathematics Examination (AIME) is an annual mathematics competition de- signed to challenge and recognize talented high school students who demonstrate ex- ceptional proficiency in mathematics. The problems from AIME 24&25 have become a standard benchmark for evaluating the rea- soning capabilities of large language mod- els. In order to bridge the evaluation of model performance across formal and in- formal mathematical reasoning, we curate and formalize a subset of problems from AIME 24&25. To ensure cleaner formal- izations, we filter out geometry, combina- torics, and counting problems whose representations in Lean are potentially cumbersome. This results in 15 selected problems, covering competition-level topics in elementary number the- ory and algebra. We evaluate DeepSeek-V3-0324 on the selected set of problems using the standard find-answer task for natural-language mathematical reasoning. With majority voting

12

3.5. ProverBench

ProverBench 包含 325 道题. 其中 15 道来自 AIME 2024–2025 的数论与代数, 其余 310 道来自教材和教学材料, 覆盖数论, 初等代数, 线性代数, 抽象代数, 微积分, 实分析, 复分析, 泛函分析与概率. 为使 Lean 形式化更清楚, AIME 子集排除了表示繁琐的几何, 组合与计数题.

Table 7 中, 671B CoT 在全部 325 题上的 Pass@32/128/512 为 52.9%/56.5%/59.1%, AIME 子集分别解出 4/5/6 道. DeepSeek-V3-0324 在已知自然语言找答案任务中用 Maj@16 解出 8/15, Prover-V2 在给定正确答案后构造 Lean proof 解出 6/15. 两种任务不同, 但差距缩小显示语言理解与形式逻辑更加接近.

<!-- page 13 of 39 -->

over 16 sampled responses, the model successfully solves 8 out of 15 problems. In comparison, DeepSeek-Prover-V2-671B, operating under the formal proof generation setting with given correct answers, is able to construct valid formal proofs for 6 of 15 problems. This comparison highlights that the performance gap between informal mathematical reasoning and formal theorem proving is substantially narrowing, indicating growing alignment between linguistic understanding and formal logical rigor in advanced language models.

Area Count

AIME 24&25 15

Number Theory 40

Elementary Algebra 30 Linear Algebra 50 Abstract Algebra 40

Calculus 90 Real Analysis 30 Complex Analysis 10 Functional Analysis 10

Probability 10

Total 325

Table 9 | Distribution of mathematical areas represented in ProverBench.

Textbook Formalization. In addition to AIME 24&25, we augment our benchmark with prob- lems carefully selected from textbooks used in high school competitions and undergraduate- level courses to strengthen coverage in specific mathematical domains. This curation process en- sures comprehensive representation across dif- ficulty levels and topic areas. As a result, we formalize 310 problems that encompass a broad spectrum, ranging from elementary mathematics at the competition level to advanced topics typi- cally encountered in undergraduate studies. This comprehensive benchmark covers number the- ory, elementary algebra, linear algebra, abstract algebra, calculus, real analysis, complex analysis, functional analysis, and probability. The deliber- ate inclusion of this diverse array of mathematical fields allows for a thorough assessment of model capabilities across varying levels of abstraction and reasoning styles. Number theory and algebra problems test a model’s facility with discrete structures and equations, while analysis-oriented problems evaluate understanding of limits, continuity, and calculus. The abstract algebra and functional analysis components challenge models to reason about abstract structures and spaces, requiring sophisticated formal reasoning capabilities. The evaluation results are presented in Table 7. As shown, DeepSeek-Prover-V2- 671B with CoT reasoning consistently outperforms all baselines, reinforcing the trends observed in other benchmark evaluations.

4. Conclusion

In this work, we propose a comprehensive pipeline for synthesizing cold-start reasoning data to advance formal theorem proving. Our data construction process is grounded in a recursive theorem-proving framework, wherein DeepSeek-V3 serves as a unified model for both subgoal decomposition and lemma formalization within the Lean 4 proof assistant. Our approach com- bines high-level proof sketches with formal steps, creating a sequence of manageable subgoals that can be efficiently solved using a smaller 7B model, significantly reducing computational re- quirements. The curriculum learning framework we developed uses these decomposed subgoals to generate increasingly difficult training tasks, creating a more effective learning progression. By pairing complete formal proofs with DeepSeek-V3’s chain-of-thought reasoning, we estab- lished valuable cold-start reasoning data that bridges informal mathematical thinking with formal proof structures. The subsequent reinforcement learning stage substantially enhanced this connection, leading to significant improvements in formal theorem proving capabilities. The resulting model, DeepSeek-Prover-V2-671B, consistently outperforms all baselines across

13

4. Conclusion · 结论

本文提出一条合成形式定理证明冷启动推理数据的完整管线. DeepSeek-V3 同时负责子目标拆分和 Lean 4 lemma 形式化, 把高层证明草图改写为一系列可管理的子目标; 7B prover 高效解决细节. curriculum learning 用子目标生成逐步变难的训练任务. 完整形式证明再与 DeepSeek-V3 的 chain-of-thought 配对, 连接非形式数学思考和形式 proof structure. 后续强化学习显著增强这条连接. 671B 在高中竞赛和本科数学基准上都超过对照. 后续工作将把该范式扩展成类似 AlphaProof 的系统, 目标是解决自动定理证明前沿的 IMO 级问题.

<!-- page 14 of 39 -->

a range of benchmarks, spanning both high-school competition problems and undergraduate- level mathematics. Our future work will focus on scaling this paradigm to an AlphaProof-like system with the ultimate aim of tackling IMO-level mathematical problems that represent the frontier of automated theorem proving challenges.

References

Z. Azerbayev, B. Piotrowski, H. Schoelkopf, E. W. Ayers, D. Radev, and J. Avigad. ProofNet:

Autoformalizing and formally proving undergraduate-level mathematics. arXiv preprint arXiv:2302.12433, 2023.

B. Barras, S. Boutin, C. Cornes, J. Courant, Y. Coscoy, D. Delahaye, D. de Rauglaudre, J.-C.

Filliâtre, E. Giménez, H. Herbelin, et al. The Coq proof assistant reference manual. INRIA, version, 6(11):17–21, 1999.

A. G. Barto and S. Mahadevan. Recent advances in hierarchical reinforcement learning. Discrete

event dynamic systems, 13:341–379, 2003.

DeepMind. AI achieves silver-medal standard solving international mathematical olympiad

problems. https://deepmind.google/discover/blog/ai-solves-imo-problems-a t-silver-medal-level/, 2024.

DeepSeek-AI. Deepseek-v3 technical report, 2024. URL https://arxiv.org/abs/2412.194

37.

DeepSeek-AI. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning,

2025. URL https://arxiv.org/abs/2501.12948.

K. Dong and T. Ma. STP: Self-play llm theorem provers with iterative conjecturing and proving.

arXiv preprint arXiv:2502.00212, 2025.

K. Dong, A. Mahankali, and T. Ma. Formal theorem proving by rewarding llms to decompose

proofs hierarchically. arXiv preprint arXiv:2411.01829, 2024.

M. Eppe, C. Gumbsch, M. Kerzel, P. D. Nguyen, M. V. Butz, and S. Wermter. Intelligent problem-

solving as integrated hierarchical reinforcement learning. Nature Machine Intelligence, 4(1): 11–20, 2022.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt.

Measuring mathematical problem solving with the MATH dataset. In Thirty-fifth Conference on Neural Information Processing Systems Datasets and Benchmarks Track (Round 2), 2021.

A. Jaech, A. Kalai, A. Lerer, A. Richardson, A. El-Kishky, A. Low, A. Helyar, A. Madry, A. Beutel,

A. Carney, et al. Openai o1 system card. arXiv preprint arXiv:2412.16720, 2024.

A. Q. Jiang, S. Welleck, J. P. Zhou, T. Lacroix, J. Liu, W. Li, M. Jamnik, G. Lample, and Y. Wu.

Draft, sketch, and prove: Guiding formal theorem provers with informal proofs. In The Eleventh International Conference on Learning Representations, 2023.

G. Lample, M.-A. Lachaux, T. Lavril, X. Martinet, A. Hayat, G. Ebner, A. Rodriguez, and

T. Lacroix. Hypertree proof search for neural theorem proving. In Proceedings of the 36th International Conference on Neural Information Processing Systems, pages 26337–26349, 2022.

14

<!-- page 15 of 39 -->

Y. Li, D. Du, L. Song, C. Li, W. Wang, T. Yang, and H. Mi. Hunyuanprover: A scalable data

synthesis framework and guided tree search for automated theorem proving. arXiv preprint arXiv:2412.20735, 2024.

Y. Lin, S. Tang, B. Lyu, J. Wu, H. Lin, K. Yang, J. Li, M. Xia, D. Chen, S. Arora, et al. Goedel-

Prover: A frontier model for open-source automated theorem proving. arXiv preprint arXiv:2502.07640, 2025.

J. Liu, X. Lin, J. Bayer, Y. Dillies, W. Jiang, X. Liang, R. Soletskyi, H. Wang, Y. Xie, B. Xiong, et al.

CombiBench: Benchmarking llm capability for combinatorial mathematics. arXiv preprint arXiv:2505.03171, 2025.

L. d. Moura and S. Ullrich. The Lean 4 theorem prover and programming language. In Automated Deduction–CADE 28: 28th International Conference on Automated Deduction, Virtual Event, July 12–15, 2021, Proceedings 28, pages 625–635. Springer, 2021.

O. Nachum, S. S. Gu, H. Lee, and S. Levine. Data-efficient hierarchical reinforcement learning.

Advances in neural information processing systems, 31, 2018.

L. C. Paulson. Isabelle a Generic Theorem Prover. Springer Verlag, 1994.

S. Polu and I. Sutskever. Generative language modeling for automated theorem proving. arXiv

preprint arXiv:2009.03393, 2020.

J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov. Proximal policy optimization

algorithms. arXiv preprint arXiv:1707.06347, 2017.

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, M. Zhang, Y. Li, Y. Wu, and D. Guo. DeepSeekMath:

Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

G. Tsoukalas, J. Lee, J. Jennings, J. Xin, M. Ding, M. Jennings, A. Thakur, and S. Chaudhuri.

PutnamBench: Evaluating neural theorem-provers on the putnam mathematical competi- tion. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024.

H. Wang, H. Xin, Z. Liu, W. Li, Y. Huang, J. Lu, Y. Zhicheng, J. Tang, J. Yin, Z. Li, et al. Prov-

ing theorems recursively. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024a.

H. Wang, H. Xin, C. Zheng, Z. Liu, Q. Cao, Y. Huang, J. Xiong, H. Shi, E. Xie, J. Yin, et al.

Lego-prover: Neural theorem proving with growing libraries. In The Twelfth International Conference on Learning Representations, 2024b.

H. Wang, M. Unsal, X. Lin, M. Baksys, J. Liu, M. D. Santos, F. Sung, M. Vinyes, Z. Ying, Z. Zhu,

et al. Kimina-Prover Preview: Towards large formal reasoning models with reinforcement learning. arXiv preprint arXiv:2504.11354, 2025.

Z. Wu, S. Huang, Z. Zhou, H. Ying, J. Wang, D. Lin, and K. Chen. Internlm2. 5-stepprover:

Advancing automated theorem proving via expert iteration on large-scale lean problems. arXiv preprint arXiv:2410.15700, 2024.

H. Xin, D. Guo, Z. Shao, Z. Ren, Q. Zhu, B. Liu, C. Ruan, W. Li, and X. Liang. DeepSeek-

Prover: Advancing theorem proving in llms through large-scale synthetic data. arXiv preprint arXiv:2405.14333, 2024a.

15

<!-- page 16 of 39 -->

H. Xin, Z. Ren, J. Song, Z. Shao, W. Zhao, H. Wang, B. Liu, L. Zhang, X. Lu, Q. Du, et al.

DeepSeek-Prover-V1.5: Harnessing proof assistant feedback for reinforcement learning and monte-carlo tree search. arXiv preprint arXiv:2408.08152, 2024b.

R. Xin, C. Xi, J. Yang, F. Chen, H. Wu, X. Xiao, Y. Sun, S. Zheng, and K. Shen. BFS-Prover:

Scalable best-first tree search for llm-based automatic theorem proving. arXiv preprint arXiv:2502.03438, 2025.

K. Yang, G. Poesia, J. He, W. Li, K. Lauter, S. Chaudhuri, and D. Song. Formal mathematical

reasoning: A new frontier in AI. arXiv preprint arXiv:2412.16075, 2024.

H. Ying, Z. Wu, Y. Geng, J. Wang, D. Lin, and K. Chen. Lean workbook: A large-scale lean

problem set formalized from natural language math problems. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024.

Z. Yu, R. Peng, K. Ding, Y. Li, Z. Peng, M. Liu, Y. Zhang, Z. Yuan, H. Xin, W. Huang, et al.

Formalmath: Benchmarking formal mathematical reasoning of large language models. arXiv preprint arXiv:2505.02735, 2025.

J. Zhang, Q. Wang, X. Ji, Y. Liu, Y. Yue, F. Zhang, D. Zhang, G. Zhou, and K. Gai. Leanabell-prover:

Posttraining scaling in formal reasoning. arXiv preprint arXiv:2504.06122, 2025.

X. Zhao, W. Li, and L. Kong. Decomposing the enigma: Subgoal-based demonstration learning

for formal theorem proving. arXiv preprint arXiv:2305.16366, 2023.

X. Zhao, L. Zheng, H. Bo, C. Hu, U. Thakker, and L. Kong. Subgoalxl: Subgoal-based expert

learning for theorem proving. arXiv preprint arXiv:2408.11172, 2024.

C. Zheng, H. Wang, E. Xie, Z. Liu, J. Sun, H. Xin, J. Shen, Z. Li, and Y. Li. Lyra: Orchestrating

dual correction in automated theorem proving. Transactions on Machine Learning Research, 2024.

K. Zheng, J. M. Han, and S. Polu. miniF2F: a cross-system benchmark for formal olympiad-level

mathematics. In International Conference on Learning Representations, 2022.

16

<!-- page 17 of 39 -->

A. Examples of Non-CoT and CoT Prompting for Proof Generation

A.1. Non-CoT Generation of DeepSeek-Prover-V2

Input:

Complete the following Lean 4 code:

‘‘‘lean4 import Mathlib import Aesop

set_option maxHeartbeats 0

open BigOperators Real Nat Topology Rat

/-- Prove that cos 𝜋

7 −cos 2𝜋 7 + cos 3𝜋 7 = 1 2.-/ theorem imo_1963_p5 : Real.cos (Real.pi / 7) - Real.cos (2 * Real.pi / 7) +

Real.cos (3 * Real.pi / 7) = 1 / 2 := by sorry ‘‘‘

Output:

‘‘‘lean4 import Mathlib import Aesop

set_option maxHeartbeats 0

open BigOperators Real Nat Topology Rat

/−−Prove that cos 𝜋

7 −cos 2𝜋 7 + cos 3𝜋 7 = 1 2.−/ theorem imo_1963_p5 : Real.cos (Real.pi / 7) −Real.cos (2 * Real.pi / 7) + Real.cos (3 * Real.pi / 7) = 1

/ 2 := by have h1 : Real.cos (Real.pi / 7) > 0 := Real.cos_pos_of_mem_Ioo ⟨by linarith [Real.pi_gt_three], by

linarith [Real.pi_gt_three]⟩ have h2 : Real.cos (2 * Real.pi / 7) = Real.cos (2 * Real.pi / 7) := rfl have h3 : Real.cos (3 * Real.pi / 7) = Real.cos (3 * Real.pi / 7) := rfl have h4 : Real.cos (Real.pi / 7) −Real.cos (2 * Real.pi / 7) + Real.cos (3 * Real.pi / 7) = 1 / 2 := by

−−Use the identity for the sum of cosines with specific angles to simplify the expression have h5 : Real.cos (2 * Real.pi / 7) = Real.cos (2 * (Real.pi / 7)) := by ring have h6 : Real.cos (3 * Real.pi / 7) = Real.cos (3 * (Real.pi / 7)) := by ring rw [h5, h6] have h7 : Real.cos (2 * (Real.pi / 7)) = 2 * Real.cos (Real.pi / 7) ^ 2 −1 := by

have h71 : Real.cos (2 * (Real.pi / 7)) = 2 * Real.cos (Real.pi / 7) ^ 2 −1 := by

rw [Real.cos_two_mul] <;> ring_nf <;> nlinarith [Real.cos_sq_add_sin_sq (Real.pi / 7)] rw [h71] have h8 : Real.cos (3 * (Real.pi / 7)) = 4 * Real.cos (Real.pi / 7) ^ 3 −3 * Real.cos (Real.pi / 7) := by

have h81 : Real.cos (3 * (Real.pi / 7)) = 4 * Real.cos (Real.pi / 7) ^ 3 −3 * Real.cos (Real.pi / 7) := by

rw [show Real.cos (3 * (Real.pi / 7)) = Real.cos (3 * (Real.pi / 7)) by rfl] have h82 : Real.cos (3 * (Real.pi / 7)) = 4 * Real.cos (Real.pi / 7) ^ 3 −3 * Real.cos (Real.pi / 7) := by

rw [show Real.cos (3 * (Real.pi / 7)) = Real.cos (3 * (Real.pi / 7)) by rfl] −−Use the triple angle identity for cosine have h83 : Real.cos (3 * (Real.pi / 7)) = 4 * Real.cos (Real.pi / 7) ^ 3 −3 * Real.cos (Real.pi / 7) := by

rw [Real.cos_three_mul] <;> ring_nf

17

<!-- page 18 of 39 -->

<;> nlinarith [Real.cos_sq_add_sin_sq (Real.pi / 7), Real.sin_le_one (Real.pi / 7), Real.cos_le_one (Real.pi / 7)]

rw [h83] rw [h82] rw [h81] rw [h7, h8] −−Simplify the expression using the derived identities have h9 : Real.cos (Real.pi / 7) > 0 := h1 have h10 : Real.cos (Real.pi / 7) ≠0 := by linarith −−Use the quadratic equation to solve for the sum of cosines have h11 : Real.cos (Real.pi / 7) = Real.cos (Real.pi / 7) := rfl have h12 : 8 * Real.cos (Real.pi / 7) ^ 3 −4 * Real.cos (Real.pi / 7) ^ 2 −4 * Real.cos (Real.pi / 7) + 1 = 0

:= by −−Use the identity to form a polynomial equation and solve it have h13 : Real.cos (Real.pi / 7) > 0 := h1 have h14 : Real.cos (Real.pi / 7) ≠0 := by linarith have h15 : Real.cos (Real.pi / 7) = Real.cos (Real.pi / 7) := rfl −−Use the polynomial equation to find the sum of cosines have h16 : Real.cos (Real.pi / 7) ⩾0 := by linarith −−Use the identity to form a polynomial equation and solve it have h17 : Real.sin (Real.pi / 7) > 0 := by

apply Real.sin_pos_of_pos_of_lt_pi <;> linarith [Real.pi_gt_three] have h18 : Real.sin (3 * (Real.pi / 7)) > 0 := by

apply Real.sin_pos_of_pos_of_lt_pi <;>

(try ring_nf at * <;> nlinarith [Real.pi_gt_three]) <;> (try ring_nf) <;> (try nlinarith [Real.pi_gt_three]) have h19 : Real.sin (3 * (Real.pi / 7)) = 3 * Real.sin (Real.pi / 7) −4 * Real.sin (Real.pi / 7) ^ 3 := by

have h191 : Real.sin (3 * (Real.pi / 7)) = 3 * Real.sin (Real.pi / 7) −4 * Real.sin (Real.pi / 7) ^ 3 := by

rw [Real.sin_three_mul] <;> ring_nf <;> nlinarith [Real.cos_sq_add_sin_sq (Real.pi / 7), Real.sin_le_one (Real.pi / 7), Real.cos_le_one (Real.pi / 7)] rw [h191] have h20 : Real.sin (2 * (Real.pi / 7)) = 2 * Real.sin (Real.pi / 7) * Real.cos (Real.pi / 7) := by

have h201 : Real.sin (2 * (Real.pi / 7)) = 2 * Real.sin (Real.pi / 7) * Real.cos (Real.pi / 7) := by

rw [Real.sin_two_mul] <;> ring_nf <;> nlinarith [Real.cos_sq_add_sin_sq (Real.pi / 7), Real.sin_le_one (Real.pi / 7), Real.cos_le_one (Real.pi / 7)] rw [h201] have h21 : Real.sin (3 * (Real.pi / 7)) = Real.sin (Real.pi −4 * (Real.pi / 7)) := by

have h211 : 3 * (Real.pi / 7) = Real.pi −4 * (Real.pi / 7) := by ring rw [h211] have h22 : Real.sin (Real.pi −4 * (Real.pi / 7)) = Real.sin (4 * (Real.pi / 7)) := by

rw [Real.sin_pi_sub] have h23 : Real.sin (4 * (Real.pi / 7)) = 2 * Real.sin (2 * (Real.pi / 7)) * Real.cos (2 * (Real.pi / 7)) := by

have h231 : Real.sin (4 * (Real.pi / 7)) = 2 * Real.sin (2 * (Real.pi / 7)) * Real.cos (2 * (Real.pi / 7)) :=

by

have h232 : Real.sin (4 * (Real.pi / 7)) = Real.sin (2 * (2 * (Real.pi / 7))) := by ring rw [h232] have h233 : Real.sin (2 * (2 * (Real.pi / 7))) = 2 * Real.sin (2 * (Real.pi / 7)) * Real.cos (2 * (Real.pi / 7)) := by rw [Real.sin_two_mul] <;> ring_nf rw [h233] rw [h231] have h24 : Real.sin (2 * (Real.pi / 7)) > 0 := by

apply Real.sin_pos_of_pos_of_lt_pi

18

<!-- page 19 of 39 -->

<;> (try ring_nf at * <;> nlinarith [Real.pi_gt_three]) <;> (try ring_nf) <;> (try nlinarith

[Real.pi_gt_three]) have h25 : Real.cos (2 * (Real.pi / 7)) > 0 := by

have h251 : Real.cos (2 * (Real.pi / 7)) > 0 := by

apply Real.cos_pos_of_mem_Ioo <;> constructor <;> (try ring_nf at * <;> nlinarith [Real.pi_gt_three]) <;> (try ring_nf) <;> (try nlinarith [Real.pi_gt_three]) linarith have h26 : Real.sin (3 * (Real.pi / 7)) > 0 := h18 have h27 : Real.sin (Real.pi / 7) > 0 := h17 have h28 : Real.sin (2 * (Real.pi / 7)) > 0 := h24 have h29 : Real.cos (2 * (Real.pi / 7)) > 0 := h25 −−Use the polynomial equation to find the sum of cosines nlinarith [Real.sin_sq_add_cos_sq (Real.pi / 7), Real.sin_sq_add_cos_sq (2 * (Real.pi / 7)),

Real.sin_sq_add_cos_sq (3 * (Real.pi / 7)), Real.sin_le_one (Real.pi / 7), Real.sin_le_one (2 *

(Real.pi / 7)), Real.sin_le_one (3 * (Real.pi / 7)), Real.cos_le_one (Real.pi / 7), Real.cos_le_one (2 * (Real.pi /

7)), Real.cos_le_one (3 * (Real.pi / 7))] −−Use the polynomial equation to find the sum of cosines nlinarith [Real.cos_le_one (Real.pi / 7), Real.cos_le_one (2 * (Real.pi / 7)), Real.cos_le_one (3 *

(Real.pi / 7))] −−Use the polynomial equation to find the sum of cosines linarith ‘‘‘

A.2. CoT Generation Strategy of DeepSeek-Prover-V2

Input:

Complete the following Lean 4 code:

‘‘‘lean4 import Mathlib import Aesop

set_option maxHeartbeats 0

open BigOperators Real Nat Topology Rat

/-- Let 𝑝, 𝑞, 𝑟be integers with 1 < 𝑝< 𝑞< 𝑟. Show that if (𝑝−1)(𝑞−1)(𝑟−1) divides

𝑝𝑞𝑟−1, then (𝑝, 𝑞, 𝑟) = (2, 4, 8) or (𝑝, 𝑞, 𝑟) = (3, 5, 15).-/ theorem imo_1992_p1 (p q r : Z) (h0 : 1 < p ∧p < q ∧q < r)

(h1 : (p - 1) * (q - 1) * (r - 1) | p * q * r - 1) : (p, q, r) = (2, 4, 8) ∨(p, q, r) = (3, 5, 15) := by sorry ‘‘‘

Before producing the Lean 4 code to formally prove the given theorem, provide

a detailed proof plan outlining the main proof steps and strategies. The plan should highlight key ideas, intermediate lemmas, and proof

structures that will guide the construction of the final formal proof.

To enhance clarity, model outputs are reformulated using inline LaTeX expressions.

Output:

19

<!-- page 20 of 39 -->

### Detailed Proof and Analysis

We are given integers 𝑝, 𝑞, 𝑟such that 1 < 𝑝< 𝑞< 𝑟, and (𝑝−1)(𝑞−1)(𝑟−1) divides 𝑝𝑞𝑟−1. We need to

prove that (𝑝, 𝑞, 𝑟) is either (2, 4, 8) or (3, 5, 15).

#### Step 1: Understand the divisibility condition The condition (𝑝−1)(𝑞−1)(𝑟−1) | 𝑝𝑞𝑟−1 can be rewritten as:

𝑝𝑞𝑟−1 = 𝑘· (𝑝−1)(𝑞−1)(𝑟−1) for some positive integer 𝑘, since 𝑝, 𝑞, 𝑟> 1, so (𝑝−1)(𝑞−1)(𝑟−1) > 0, and 𝑝𝑞𝑟−1 > 0.

#### Step 2: Derive an upper bound for 𝑘

We can write:

$$
\frac{pqr-1}{(p-1)(q-1)(r-1)}=k.
$$

We claim that $k<4$. To prove this, observe that:

$$
\frac{pqr}{(p-1)(q-1)(r-1)}=
\left(1+\frac{1}{p-1}\right)
\left(1+\frac{1}{q-1}\right)
\left(1+\frac{1}{r-1}\right).
$$

Since 𝑝⩾2, 𝑞⩾3, 𝑟⩾4, we have: 1 + 1 𝑝−1 ⩽2, 1 + 1 𝑞−1 ⩽3

2, 1 + 1 𝑟−1 ⩽4

3 so:

𝑝𝑞𝑟 (𝑝−1) (𝑞−1) (𝑟−1) ⩽2 · 3

2 · 4 3 = 4 Thus:

𝑘= 𝑝𝑞𝑟−1 (𝑝−1) (𝑞−1) (𝑟−1) < 𝑝𝑞𝑟 (𝑝−1) (𝑞−1) (𝑟−1) ⩽4 so 𝑘⩽3.

But we can do better. The function 𝑓(𝑝, 𝑞, 𝑟) = 𝑝𝑞𝑟 (𝑝−1) (𝑞−1) (𝑟−1) is decreasing in 𝑝, 𝑞, 𝑟, so its maximum in

𝑝⩾2, 𝑞⩾𝑝+ 1, 𝑟⩾𝑞+ 1 is achieved at (2, 3, 4), where 𝑓(2, 3, 4) = 24 1·2·3 = 4. At (2, 3, 5), it is 30 1·2·4 = 3.75 < 4, etc.

But the precise calculation is not needed. Since 𝑝⩾2, 𝑞⩾3, 𝑟⩾4, 1 (𝑝−1) (𝑞−1) (𝑟−1) ⩽1

6, while 𝑝𝑞𝑟⩾24, so:

𝑘= 𝑝𝑞𝑟−1 (𝑝−1) (𝑞−1) (𝑟−1) < 𝑝𝑞𝑟 (𝑝−1) (𝑞−1) (𝑟−1) ⩽4 and the bound 𝑘< 4 follows. Since 𝑘is an integer, 𝑘∈{1, 2, 3}.

However, we can tighten this further. The condition 𝑘⩾4 would require (𝑝, 𝑞, 𝑟) = (2, 3, 4), but

𝑝𝑞𝑟−1 = 23 and (𝑝−1)(𝑞−1)(𝑟−1) = 6, which does not divide. So we must have 𝑘< 4.

Alternatively, we can note that for 𝑝⩾2, 𝑞⩾3, 𝑟⩾4, the product (𝑝−1)(𝑞−1)(𝑟−1) is at least 6, and

𝑝𝑞𝑟−1 < 𝑝𝑞𝑟, so 𝑘⩽3.

#### Step 3: Consider possible values of 𝑘 The key is to consider 𝑘= 1, 2, 3 and solve for (𝑝, 𝑞, 𝑟).

**Case 𝑘= 1:** 𝑝𝑞𝑟−1 = (𝑝−1)(𝑞−1)(𝑟−1) Expand the right side:

𝑝𝑞𝑟−𝑝𝑞−𝑝𝑟−𝑞𝑟+ 𝑝+ 𝑞+ 𝑟−1 = 𝑝𝑞𝑟−1 Simplify to: −𝑝𝑞−𝑝𝑟−𝑞𝑟+ 𝑝+ 𝑞+ 𝑟= 0 or:

𝑝𝑞+ 𝑝𝑟+ 𝑞𝑟= 𝑝+ 𝑞+ 𝑟 Since 𝑝, 𝑞, 𝑟⩾2, we have 𝑝𝑞+ 𝑝𝑟+ 𝑞𝑟⩾4𝑝+ 4𝑞+ 4𝑟, which is much larger than 𝑝+ 𝑞+ 𝑟, so no solutions

exist.

**Case 𝑘= 2:** 𝑝𝑞𝑟−1 = 2(𝑝−1)(𝑞−1)(𝑟−1) Expand and simplify:

𝑝𝑞𝑟−1 = 2(𝑝𝑞𝑟−𝑝𝑞−𝑝𝑟−𝑞𝑟+ 𝑝+ 𝑞+ 𝑟−1) 𝑝𝑞𝑟−1 = 2𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−2 −𝑝𝑞𝑟+ 2𝑝𝑞+ 2𝑝𝑟+ 2𝑞𝑟−2𝑝−2𝑞−2𝑟+ 1 = 0

20

<!-- page 21 of 39 -->

Multiply by −1:

𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−1 = 0 Factor: (𝑝−2)(𝑞−2)(𝑟−2) = 𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 4𝑝+ 4𝑞+ 4𝑟−8 But:

𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−1 = 0 Thus: (𝑝−2)(𝑞−2)(𝑟−2) = (𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−1) −(−2𝑝−2𝑞−2𝑟+ 7) Wait, no. It is easier to write: (𝑝−2)(𝑞−2)(𝑟−2) = 𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 4𝑝+ 4𝑞+ 4𝑟−8 Then:

𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−1 = 0 Subtract: (𝑝−2)(𝑞−2)(𝑟−2) −(𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−1) = 2𝑝+ 2𝑞+ 2𝑟−7 But from above: (𝑝−2)(𝑞−2)(𝑟−2) = 2𝑝+ 2𝑞+ 2𝑟−7 Since 𝑝⩾2, the left is ⩾0, so 2𝑝+ 2𝑞+ 2𝑟−7 ⩾0.

But now, set 𝑝= 2. Then the original equation is: 2𝑞𝑟−1 = 2(1)(𝑞−1)(𝑟−1) = 2(𝑞𝑟−𝑞−𝑟+ 1) Simplify: 2𝑞𝑟−1 = 2𝑞𝑟−2𝑞−2𝑟+ 2 −1 = −2𝑞−2𝑟+ 2 2𝑞+ 2𝑟= 3 But 𝑞⩾3 (since 𝑝= 2, 𝑞> 𝑝), so 2𝑞+ 2𝑟⩾6, contradiction. Hence no solution with 𝑝= 2.

Similarly, set 𝑝= 3: 3𝑞𝑟−1 = 2(2)(𝑞−1)(𝑟−1) 3𝑞𝑟−1 = 4(𝑞𝑟−𝑞−𝑟+ 1) 3𝑞𝑟−1 = 4𝑞𝑟−4𝑞−4𝑟+ 4 −𝑞𝑟+ 4𝑞+ 4𝑟−5 = 0 𝑞𝑟−4𝑞−4𝑟+ 5 = 0 Add 11: 𝑞𝑟−4𝑞−4𝑟+ 16 = 11 Factor: (𝑞−4)(𝑟−4) = 11 Since 𝑞> 𝑝= 3, 𝑞⩾4, and 𝑟> 𝑞, possible factorings are: −𝑞−4 = 1, 𝑟−4 = 11: 𝑞= 5, 𝑟= 15 −𝑞−4 = 11, 𝑟−4 = 1: But then 𝑞= 15, 𝑟= 5, but 𝑟> 𝑞, invalid. Thus, the only solution is (𝑝, 𝑞, 𝑟) = (3, 5, 15).

Next, set 𝑝= 4. The original equation is: 4𝑞𝑟−1 = 2(3)(𝑞−1)(𝑟−1) = 6(𝑞𝑟−𝑞−𝑟+ 1) 4𝑞𝑟−1 = 6𝑞𝑟−6𝑞−6𝑟+ 6 −2𝑞𝑟+ 6𝑞+ 6𝑟−7 = 0 Multiply by 2: −4𝑞𝑟+ 12𝑞+ 12𝑟−14 = 0 Factor: (2𝑞−3)(2𝑟−3) = 23 Since 𝑞⩾5, 𝑟⩾6, (2𝑞−3)(2𝑟−3) ⩾7 · 9 = 63 > 23, no solutions.

For 𝑝⩾4, the term (𝑝−2)(𝑞−2)(𝑟−2) dominates 2𝑝+ 2𝑞+ 2𝑟−7, so no solutions will exist. Formally,

since 𝑞⩾𝑝+ 1 ⩾5, 𝑟⩾𝑞+ 1 ⩾6, we have: (𝑝−2)(𝑞−2)(𝑟−2) ⩾(4 −2)(5 −2)(6 −2) = 24 while 2𝑝+ 2𝑞+ 2𝑟−7 ⩽2(𝑟−2) + 2(𝑟−1) + 2𝑟−7 = 6𝑟−13, but no, let’s instead note that: (𝑝−2)(𝑞−2)(𝑟−2) ⩾(𝑝−2)((𝑝+ 1) −2)((𝑝+ 2) −2) = (𝑝−2)(𝑝−1)(𝑝) and 2𝑝+ 2𝑞+ 2𝑟−7 < 6𝑟. But 𝑝⩾4, (𝑝−2)(𝑝−1)(𝑝) ⩾24, 𝑟⩾𝑝+ 2 ⩾6, but this is not directly leading to

a contradiction.

Alternatively, just note that 𝑞⩾𝑝+ 1, 𝑟⩾𝑝+ 2, so: (𝑝−2)(𝑞−2)(𝑟−2) ⩾(𝑝−2)(𝑝−1)(𝑝) ⩾(4 −2)(4 −1)(4) = 24

21

<!-- page 22 of 39 -->

and 2𝑝+ 2𝑞+ 2𝑟−7 ⩽2𝑝+ 2(𝑝+ 1) + 2(𝑝+ 2) −7 = 6𝑝−1. But 6𝑝−1 < (𝑝−2)(𝑝−1)(𝑝) for 𝑝⩾4, since 𝑝= 4

gives 23 < 24, 𝑝= 5 gives 29 < 60, etc. Thus no solutions exist for 𝑝⩾4.

But we have already found (3, 5, 15), and need to consider other 𝑘.

Wait, we found that 𝑘= 2 yields only (3, 5, 15). Now, consider 𝑘= 3.

**Case 𝑘= 3:** The equation is:

𝑝𝑞𝑟−1 = 3(𝑝−1)(𝑞−1)(𝑟−1) Expand:

𝑝𝑞𝑟−1 = 3(𝑝𝑞𝑟−𝑝𝑞−𝑝𝑟−𝑞𝑟+ 𝑝+ 𝑞+ 𝑟−1) 𝑝𝑞𝑟−1 = 3𝑝𝑞𝑟−3𝑝𝑞−3𝑝𝑟−3𝑞𝑟+ 3𝑝+ 3𝑞+ 3𝑟−3 −2𝑝𝑞𝑟+ 3𝑝𝑞+ 3𝑝𝑟+ 3𝑞𝑟−3𝑝−3𝑞−3𝑟+ 2 = 0 Multiply by −1: 2𝑝𝑞𝑟−3𝑝𝑞−3𝑝𝑟−3𝑞𝑟+ 3𝑝+ 3𝑞+ 3𝑟−2 = 0 As before, look for small 𝑝.

Set 𝑝= 2: 4𝑞𝑟−6𝑞−6𝑟+ 6 + 3𝑞+ 3𝑟−2 = 0 Simplify: 4𝑞𝑟−3𝑞−3𝑟+ 4 = 0 Factor: (4𝑞−3)(𝑟) −3𝑞+ 4 = 0 Not obvious, but solve: 4𝑞𝑟−3𝑞−3𝑟+ 4 = 0 4𝑞𝑟−3𝑞−3𝑟= −4 Not possible since 𝑞⩾3, 𝑟⩾4, so 4𝑞𝑟−3𝑞−3𝑟⩾4 · 3 · 4 −3 · 3 −3 · 4 = 48 −9 −12 = 27 > −4.

Wait, no, contradiction. Hence no solution with 𝑝= 2.

Wait, but we need to revisit the case when 𝑝= 2. The correct equation is: 2𝑞𝑟−1 = 3(1)(𝑞−1)(𝑟−1) = 3(𝑞𝑟−𝑞−𝑟+ 1) Thus: 2𝑞𝑟−1 = 3𝑞𝑟−3𝑞−3𝑟+ 3 −𝑞𝑟+ 3𝑞+ 3𝑟−4 = 0 Multiply by −1: 𝑞𝑟−3𝑞−3𝑟+ 4 = 0 Add 5: 𝑞𝑟−3𝑞−3𝑟+ 9 = 5 Factor: (𝑞−3)(𝑟−3) = 5 Since 𝑞⩾3, 𝑟⩾4, possible pairs are: −𝑞−3 = 1, 𝑟−3 = 5: 𝑞= 4, 𝑟= 8 −𝑞−3 = 5, 𝑟−3 = 1: 𝑞= 8, 𝑟= 4, invalid as 𝑟> 𝑞. Thus, the only solution is (2, 4, 8).

Set 𝑝= 3: 3𝑞𝑟−1 = 3(2)(𝑞−1)(𝑟−1) 3𝑞𝑟−1 = 6(𝑞𝑟−𝑞−𝑟+ 1) 3𝑞𝑟−1 = 6𝑞𝑟−6𝑞−6𝑟+ 6 −3𝑞𝑟+ 6𝑞+ 6𝑟−7 = 0 3𝑞𝑟−6𝑞−6𝑟+ 7 = 0 Multiply by 4: 12𝑞𝑟−24𝑞−24𝑟+ 28 = 0 Add 1: 12𝑞𝑟−24𝑞−24𝑟+ 49 = 1 Factor: (3𝑞−6)(4𝑟−8) = −47 But 𝑞⩾4, 𝑟⩾5, so (3𝑞−6) ⩾6, (4𝑟−8) ⩾12, so left side is ⩾72, which cannot be −47. Thus no solution

here.

22

<!-- page 23 of 39 -->

Set 𝑝= 4: 4𝑞𝑟−1 = 3(3)(𝑞−1)(𝑟−1) 4𝑞𝑟−1 = 9𝑞𝑟−9𝑞−9𝑟+ 9 −5𝑞𝑟+ 9𝑞+ 9𝑟−10 = 0 Multiply by 5: −25𝑞𝑟+ 45𝑞+ 45𝑟−50 = 0 Factor: (5𝑞−9)(5𝑟−9) = 31 Since 𝑞⩾5, 𝑟⩾6, (5𝑞−9) ⩾16, (5𝑟−9) ⩾21, so left side is ⩾16 · 21 = 336 > 31. Thus no solution here.

Similarly, for larger 𝑝⩾4, no solutions exist, because the term 𝑝𝑞𝑟dominates.

#### Step 4: Conclusion The only triples (𝑝, 𝑞, 𝑟) satisfying all conditions are (2, 4, 8) and (3, 5, 15).

### Step−by−Step Abstract Plan

1. **Understand the Divison Condition**: −Rewrite the divisibility condition as 𝑝𝑞𝑟−1 = 𝑘· (𝑝−1)(𝑞−1)(𝑟−1). −Note that 𝑘is a positive integer since all terms are positive.

2. **Derive an Upper Bound for 𝑘**: −Use inequalities to show that 𝑘< 4, i.e., 𝑘⩽3. −Alternatively, note that for 𝑝, 𝑞, 𝑟in the given range, 𝑘⩽3 is natural, as larger 𝑘would make

the right side too large.

3. **Case 𝑘= 1**: −Derive the equation 𝑝𝑞+ 𝑝𝑟+ 𝑞𝑟= 𝑝+ 𝑞+ 𝑟. −This has no solutions since 𝑝, 𝑞, 𝑟⩾2, making the left side much larger than the right.

4. **Case 𝑘= 2**: −Derive the equation 𝑝𝑞𝑟−2𝑝𝑞−2𝑝𝑟−2𝑞𝑟+ 2𝑝+ 2𝑞+ 2𝑟−1 = 0. −For 𝑝= 2, no solution. −For 𝑝= 3, solve to get (𝑝, 𝑞, 𝑟) = (3, 5, 15). −For 𝑝⩾4, no solutions exist.

5. **Case 𝑘= 3**: −Derive the equation 2𝑝𝑞𝑟−3𝑝𝑞−3𝑝𝑟−3𝑞𝑟+ 3𝑝+ 3𝑞+ 3𝑟−2 = 0. −For 𝑝= 2, solve to get (𝑝, 𝑞, 𝑟) = (2, 4, 8). −For 𝑝⩾3, no solutions exist.

6. **Conclusion**: −The only valid triples are (2, 4, 8) and (3, 5, 15).

### Lean 4 Proof with ‘have‘ Statements

‘‘‘lean4 theorem imo_1992_p1 (p q r : Z) (h0 : 1 < p ∧p < q ∧q < r)

(h1 : (p −1) * (q −1) * (r −1) | p * q * r −1) : (p, q, r) = (2, 4, 8) ∨(p, q, r) = (3, 5, 15) := by have h2 : p ⩾2 := by sorry have h3 : q ⩾3 := by sorry have h4 : r ⩾4 := by sorry have h5 : (p, q, r) = (2, 4, 8) ∨(p, q, r) = (3, 5, 15) := by sorry sorry ‘‘‘

### Complete Lean 4 Proof

‘‘‘lean4

23

<!-- page 24 of 39 -->

theorem imo_1992_p1 (p q r : Z) (h0 : 1 < p ∧p < q ∧q < r)

(h1 : (p −1) * (q −1) * (r −1) | p * q * r −1) : (p, q, r) = (2, 4, 8) ∨(p, q, r) = (3, 5, 15) := by have h2 : p ⩾2 := by

linarith [h0.1]

have h3 : q ⩾3 := by

by_contra h have h4 : q ⩽2 := by linarith have h5 : q ⩾2 := by linarith [h0.2.1] have h6 : q = 2 := by linarith have h7 : p < 2 := by linarith [h0.2.1] have h8 : p ⩾2 := by linarith [h0.1] linarith

have h4 : r ⩾4 := by

by_contra h have h5 : r ⩽3 := by linarith have h6 : r ⩾3 := by linarith [h0.2.2] have h7 : r = 3 := by linarith have h8 : q < 3 := by linarith [h0.2.2] have h9 : q ⩾3 := by linarith [h3] linarith

have h5 : (p, q, r) = (2, 4, 8) ∨(p, q, r) = (3, 5, 15) := by

have h6 : (p −1 : Z) > 0 := by

linarith have h7 : (q −1 : Z) > 0 := by

linarith have h8 : (r −1 : Z) > 0 := by

linarith have h9 : (p −1 : Z) * (q −1 : Z) * (r −1 : Z) > 0 := by positivity have h10 : ∃(k : Z), (p * q * r −1 : Z) = k * ((p −1 : Z) * (q −1 : Z) * (r −1 : Z)) := by

obtain ⟨k, hk⟩:= h1 refine’ ⟨k, _⟩ linarith obtain ⟨k, hk⟩:= h10 have h11 : k > 0 := by

by_contra h11 have h12 : k ⩽0 := by linarith have h13 : (p * q * r −1 : Z) ⩽0 := by

nlinarith [mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h3),

mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h4), mul_nonneg (sub_nonneg.mpr h3) (sub_nonneg.mpr h4)] have h14 : (p * q * r : Z) ⩽1 := by linarith have h15 : (p : Z) ⩾2 := by linarith have h16 : (q : Z) ⩾3 := by linarith have h17 : (r : Z) ⩾4 := by linarith have h18 : (p * q * r : Z) ⩾2 * 3 * 4 := by

have h19 : (p : Z) * q ⩾2 * 3 := by nlinarith nlinarith linarith have h12 : k ⩽3 := by

by_contra h12 have h13 : k ⩾4 := by linarith have h14 : (p −1 : Z) ⩾1 := by

linarith have h15 : (q −1 : Z) ⩾2 := by

linarith have h16 : (r −1 : Z) ⩾3 := by

linarith

24

<!-- page 25 of 39 -->

have h17 : (p −1 : Z) * (q −1 : Z) ⩾2 := by

nlinarith have h18 : (p −1 : Z) * (q −1 : Z) * (r −1 : Z) ⩾6 := by

nlinarith have h19 : (k : Z) * ((p −1 : Z) * (q −1 : Z) * (r −1 : Z)) ⩾4 * ((p −1 : Z) * (q −1 : Z) * (r −1 : Z)) := by

nlinarith have h20 : (p * q * r −1 : Z) ⩾4 * ((p −1 : Z) * (q −1 : Z) * (r −1 : Z)) := by

linarith have h21 : (p * q * r −1 : Z) < 4 * ((p −1 : Z) * (q −1 : Z) * (r −1 : Z)) := by

have h22 : (p : Z) * q * r < 4 * ((p −1 : Z) * (q −1 : Z) * (r −1 : Z)) + 1 := by

nlinarith [mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h3),

mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h4), mul_nonneg (sub_nonneg.mpr h3) (sub_nonneg.mpr h4)] linarith linarith have h13 : k = 1 ∨k = 2 ∨k = 3 := by

omega −−We need to handle each case of k separately rcases h13 with (rfl | rfl | rfl) · −−Case k = 1 have h14 : p * q * r −1 = (p −1) * (q −1) * (r −1) := by

ring_nf at hk ⊢ <;> linarith have h15 : p * q + p * r + q * r = p + q + r := by

have h151 : p * q * r −1 = (p −1) * (q −1) * (r −1) := by linarith ring_nf at h151 ⊢ nlinarith have h16 : p = 2 := by

by_contra h16 have h17 : p ⩾3 := by

by_contra h17 have h18 : p ⩽2 := by linarith have h19 : p = 2 := by linarith contradiction have h20 : q ⩾3 := by linarith have h21 : r ⩾4 := by linarith have h22 : (p : Z) * q ⩾3 * 3 := by

nlinarith have h23 : (p : Z) * r ⩾3 * 4 := by

nlinarith have h24 : (q : Z) * r ⩾3 * 4 := by

nlinarith nlinarith have h17 : q = 3 := by

by_contra h17 have h18 : q ⩾4 := by

by_contra h18 have h19 : q ⩽3 := by linarith have h20 : q = 3 := by linarith contradiction have h21 : p = 2 := by linarith have h22 : (p : Z) * q ⩾2 * 4 := by

nlinarith have h23 : (p : Z) * r ⩾2 * 4 := by

nlinarith have h24 : (q : Z) * r ⩾4 * 4 := by

nlinarith nlinarith have h18 : r = 4 := by

by_contra h18 have h19 : r ⩾5 := by

25

<!-- page 26 of 39 -->

by_contra h19 have h20 : r ⩽4 := by linarith have h21 : r = 4 := by linarith contradiction have h22 : p = 2 := by linarith have h23 : q = 3 := by linarith have h24 : (p : Z) * q ⩾2 * 3 := by

nlinarith have h25 : (p : Z) * r ⩾2 * 5 := by

nlinarith have h26 : (q : Z) * r ⩾3 * 5 := by

nlinarith nlinarith exfalso norm_num [h16, h17, h18] at h14 h15 hk h0 ⊢<;> linarith · −−Case k = 2 have h14 : p * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by

ring_nf at hk ⊢ <;> linarith have h15 : p = 3 := by

by_contra h15 have h16 : p ≠3 := by tauto −−We need to show that p cannot be greater than 3 have h17 : p ⩾4 := by

by_contra h17 have h18 : p ⩽3 := by linarith have h19 : p = 2 := by

by_contra h19 have h20 : p ⩾3 := by omega have h21 : p = 3 := by omega contradiction have h22 : p = 2 := by omega have h23 : q ⩾3 := by linarith have h24 : r ⩾4 := by linarith have h25 : (p : Z) * q ⩾2 * 3 := by nlinarith have h26 : (p : Z) * r ⩾2 * 4 := by nlinarith have h27 : (q : Z) * r ⩾3 * 4 := by nlinarith have h28 : (p : Z) * q * r ⩾2 * 3 * 4 := by nlinarith have h29 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h30 : (p : Z) = 2 := by omega have h31 : (q : Z) ⩾3 := by omega have h32 : (r : Z) ⩾4 := by omega have h33 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h34 : (p : Z) = 2 := by omega have h35 : (q : Z) ⩾3 := by omega have h36 : (r : Z) ⩾4 := by omega have h37 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h38 : False := by

have h39 : (p : Z) = 2 := by omega have h40 : (q : Z) ⩾3 := by omega have h41 : (r : Z) ⩾4 := by omega have h42 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h43 : 2 * q * r −1 = 2 * (1 * (q −1) * (r −1)) := by

simp [h39] at h42 ⊢ <;> ring_nf at h42 ⊢<;> linarith have h44 : 2 * q * r −1 = 2 * ((q −1) * (r −1)) := by

ring_nf at h43 ⊢<;> linarith have h45 : 2 * q * r −1 = 2 * (q * r −q −r + 1) := by

ring_nf at h44 ⊢<;> linarith have h46 : 2 * q * r −1 = 2 * q * r −2 * q −2 * r + 2 := by

ring_nf at h45 ⊢<;> linarith

26

<!-- page 27 of 39 -->

have h47 : −1 = −2 * q −2 * r + 2 := by

linarith have h48 : 2 * q + 2 * r = 3 := by linarith have h49 : (q : Z) ⩾3 := by omega have h50 : (r : Z) ⩾4 := by omega have h51 : 2 * q + 2 * r ⩾14 := by

nlinarith linarith exact h38 have h19 : q ⩾p + 1 := by omega have h20 : r ⩾q + 1 := by omega have h21 : (p : Z) ⩾4 := by omega have h22 : (q : Z) ⩾5 := by omega have h23 : (r : Z) ⩾6 := by omega have h24 : (p : Z) * q ⩾4 * 5 := by nlinarith have h25 : (p : Z) * r ⩾4 * 6 := by nlinarith have h26 : (q : Z) * r ⩾5 * 6 := by nlinarith have h27 : (p : Z) * q * r ⩾4 * 5 * 6 := by nlinarith have h28 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h29 : (p : Z) ⩾4 := by omega have h30 : (q : Z) ⩾5 := by omega have h31 : (r : Z) ⩾6 := by omega have h32 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h33 : False := by

nlinarith [sq_nonneg ((p : Z) −2), sq_nonneg ((q : Z) −2), sq_nonneg ((r : Z) −2),

mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h3), mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h4), mul_nonneg (sub_nonneg.mpr h3) (sub_nonneg.mpr h4)] exact h33 have h16 : q = 5 := by

have h17 : p = 3 := by linarith have h18 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h19 : (p : Z) = 3 := by norm_num [h17] have h20 : (q : Z) ⩾4 := by

by_contra h20 have h21 : q ⩽3 := by linarith have h22 : q = 3 := by linarith have h23 : (p : Z) = 3 := by norm_num [h17] have h24 : (q : Z) = 3 := by norm_num [h22] have h25 : (r : Z) ⩾4 := by linarith norm_num [h17, h22, h23, h24] at h18 <;>

(try omega) <;> (try nlinarith) <;> (try

{

nlinarith [mul_pos (sub_pos.mpr h0.2.1) (sub_pos.mpr h0.2.2)] }) have h21 : (r : Z) ⩾q + 1 := by linarith have h22 : (q : Z) ⩾4 := by linarith have h23 : (p : Z) = 3 := by norm_num [h17] have h24 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h25 : 3 * q * r −1 = 2 * (2 * (q −1) * (r −1)) := by

norm_num [h17, h19] at h24 ⊢ <;> ring_nf at h24 ⊢<;> linarith have h26 : 3 * q * r −1 = 4 * ((q −1) * (r −1)) := by

ring_nf at h25 ⊢ <;> nlinarith have h27 : 3 * q * r −1 = 4 * (q * r −q −r + 1) := by

ring_nf at h26 ⊢ <;> nlinarith

27

<!-- page 28 of 39 -->

have h28 : 3 * q * r −1 = 4 * q * r −4 * q −4 * r + 4 := by

ring_nf at h27 ⊢ <;> nlinarith have h29 : −q * r + 4 * q + 4 * r −5 = 0 := by

ring_nf at h28 ⊢ <;> nlinarith have h30 : (q : Z) * r −4 * q −4 * r + 5 = 0 := by

ring_nf at h29 ⊢ <;> nlinarith have h31 : (q −4 : Z) * (r −4 : Z) = 11 := by

ring_nf at h30 ⊢ <;> nlinarith have h32 : (q : Z) −4 = 1 ∧(r : Z) −4 = 11 ∨(q : Z) −4 = 11 ∧(r : Z) −4 = 1 ∨(q : Z) −4 = −1 ∧(r : Z) −4 =

−11 ∨(q : Z) −4 = −11 ∧(r : Z) −4 = −1 := by

have h33 : (q : Z) −4 = 1 ∨(q : Z) −4 = 11 ∨(q : Z) −4 = −1 ∨(q : Z) −4 = −11 := by

have h34 : (q : Z) −4 | 11 := by

use (r : Z) −4 linarith have h35 : (q : Z) −4 = 1 ∨(q : Z) −4 = 11 ∨(q : Z) −4 = −1 ∨(q : Z) −4 = −11 := by

have h36 : (q : Z) −4 = 1 ∨(q : Z) −4 = 11 ∨(q : Z) −4 = −1 ∨(q : Z) −4 = −11 := by

rw [←Int.natAbs_dvd_natAbs] at h34 −−We use the fact that the absolute value of (q −4) divides the absolute value of 11 have h37 : ((q : Z) −4).natAbs | 11 := by

simpa [Int.natAbs] using h34 −−Since the possible divisors of 11 are 1 and 11, we check the cases have h38 : ((q : Z) −4).natAbs = 1 ∨((q : Z) −4).natAbs = 11 := by

have h39 : ((q : Z) −4).natAbs | 11 := h37 have h40 : ((q : Z) −4).natAbs ⩽11 := Nat.le_of_dvd (by decide) h39 interval_cases ((q : Z) −4).natAbs <;> norm_num at h39 ⊢<;> omega cases h38 with | inl h38 =>

have h41 : (q : Z) −4 = 1 ∨(q : Z) −4 = −1 := by

have h42 : ((q : Z) −4).natAbs = 1 := h38 have h43 : (q : Z) −4 = 1 ∨(q : Z) −4 = −1 := by

rw [Int.natAbs_eq_iff] at h42 tauto exact h43 cases h41 with | inl h41 =>

tauto | inr h41 =>

tauto | inr h38 =>

have h41 : (q : Z) −4 = 11 ∨(q : Z) −4 = −11 := by

have h42 : ((q : Z) −4).natAbs = 11 := h38 have h43 : (q : Z) −4 = 11 ∨(q : Z) −4 = −11 := by

rw [Int.natAbs_eq_iff] at h42 tauto exact h43 cases h41 with | inl h41 =>

tauto | inr h41 =>

tauto exact h36 exact h35 cases h33 with | inl h33 =>

have h34 : (q : Z) −4 = 1 := h33 have h35 : (r : Z) −4 = 11 := by

have h36 : ((q : Z) −4) * ((r : Z) −4) = 11 := by

28

<!-- page 29 of 39 -->

linarith rw [h34] at h36 linarith exact Or.inl ⟨h34, h35⟩ | inr h33 =>

cases h33 with | inl h33 =>

have h34 : (q : Z) −4 = 11 := h33 have h35 : (r : Z) −4 = 1 := by

have h36 : ((q : Z) −4) * ((r : Z) −4) = 11 := by

linarith rw [h34] at h36 linarith exact Or.inr (Or.inl ⟨h34, h35⟩) | inr h33 =>

cases h33 with | inl h33 =>

have h34 : (q : Z) −4 = −1 := h33 have h35 : (r : Z) −4 = −11 := by

have h36 : ((q : Z) −4) * ((r : Z) −4) = 11 := by

linarith rw [h34] at h36 linarith exact Or.inr (Or.inr (Or.inl ⟨h34, h35⟩)) | inr h33 =>

have h34 : (q : Z) −4 = −11 := h33 have h35 : (r : Z) −4 = −1 := by

have h36 : ((q : Z) −4) * ((r : Z) −4) = 11 := by

linarith rw [h34] at h36 linarith exact Or.inr (Or.inr (Or.inr ⟨h34, h35⟩)) rcases h32 with (⟨h32, h33⟩| ⟨h32, h33⟩| ⟨h32, h33⟩| ⟨h32, h33⟩) · −−Case 1: q −4 = 1 and r −4 = 11 have h34 : q = 5 := by

linarith have h35 : r = 15 := by

linarith simp [h34, h35, h15] <;> norm_num <;> omega · −−Case 2: q −4 = 11 and r −4 = 1 have h34 : q = 15 := by

linarith have h35 : r = 5 := by

linarith have h36 : r > q := by

linarith linarith · −−Case 3: q −4 = −1 and r −4 = −11 have h34 : q = 3 := by

linarith have h35 : r = −7 := by

linarith have h36 : r > q := by

linarith linarith · −−Case 4: q −4 = −11 and r −4 = −1 have h34 : q = −7 := by

linarith have h35 : r = 3 := by

linarith

29

<!-- page 30 of 39 -->

have h36 : r > q := by

linarith linarith have h17 : r = 15 := by

have h18 : p = 3 := by linarith have h19 : q = 5 := by linarith have h20 : (p : Z) * q * r −1 = 2 * ((p −1) * (q −1) * (r −1)) := by linarith have h21 : (p : Z) = 3 := by norm_num [h18] have h22 : (q : Z) = 5 := by norm_num [h19] norm_num [h18, h19, h21, h22] at h20 <;> ring_nf at h20 ⊢<;> omega have h18 : (p, q, r) = (3, 5, 15) := by

simp_all [Prod.ext_iff] <;> norm_num <;> linarith exact Or.inr h18 · −−Case k = 3 have h14 : p * q * r −1 = 3 * ((p −1) * (q −1) * (r −1)) := by

ring_nf at hk ⊢ <;> linarith have h15 : p = 2 := by

by_contra h15 have h16 : p ⩾3 := by

by_contra h16 have h17 : p ⩽2 := by linarith have h18 : p = 2 := by linarith contradiction have h19 : q ⩾p + 1 := by linarith have h20 : r ⩾q + 1 := by linarith have h21 : (p : Z) ⩾3 := by linarith have h22 : (q : Z) ⩾4 := by linarith have h23 : (r : Z) ⩾5 := by linarith have h24 : (p : Z) * q ⩾3 * 4 := by nlinarith have h25 : (p : Z) * r ⩾3 * 5 := by nlinarith have h26 : (q : Z) * r ⩾4 * 5 := by nlinarith have h27 : (p : Z) * q * r ⩾3 * 4 * 5 := by nlinarith have h28 : (p : Z) * q * r −1 = 3 * ((p −1) * (q −1) * (r −1)) := by linarith have h29 : (p : Z) ⩾3 := by linarith have h30 : (q : Z) ⩾4 := by linarith have h31 : (r : Z) ⩾5 := by linarith have h32 : (p : Z) * q * r −1 = 3 * ((p −1) * (q −1) * (r −1)) := by linarith have h33 : False := by

nlinarith [sq_nonneg ((p : Z) −2), sq_nonneg ((q : Z) −2), sq_nonneg ((r : Z) −2),

mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h3), mul_nonneg (sub_nonneg.mpr h2) (sub_nonneg.mpr h4), mul_nonneg (sub_nonneg.mpr h3) (sub_nonneg.mpr h4)] exact h33 have h16 : q = 4 := by

have h17 : p = 2 := by linarith have h18 : (p : Z) * q * r −1 = 3 * ((p −1) * (q −1) * (r −1)) := by linarith have h19 : (p : Z) = 2 := by norm_num [h17] have h20 : (q : Z) ⩾3 := by

by_contra h20 have h21 : q ⩽2 := by linarith have h22 : q = 2 := by linarith have h23 : (p : Z) = 2 := by norm_num [h17] have h24 : (q : Z) = 2 := by norm_num [h22] have h25 : (r : Z) ⩾3 := by linarith norm_num [h17, h22, h23, h24] at h18 <;>

(try omega) <;> (try nlinarith) <;>

30

<!-- page 31 of 39 -->

(try

{

nlinarith [mul_pos (sub_pos.mpr h0.2.1) (sub_pos.mpr h0.2.2)] }) have h21 : (r : Z) ⩾q + 1 := by linarith have h22 : (q : Z) ⩾3 := by linarith have h23 : (p : Z) = 2 := by norm_num [h17] have h24 : (p : Z) * q * r −1 = 3 * ((p −1) * (q −1) * (r −1)) := by linarith have h25 : 2 * q * r −1 = 3 * (1 * (q −1) * (r −1)) := by

norm_num [h17, h19] at h24 ⊢ <;> ring_nf at h24 ⊢<;> linarith have h26 : 2 * q * r −1 = 3 * ((q −1) * (r −1)) := by

ring_nf at h25 ⊢ <;> nlinarith have h27 : 2 * q * r −1 = 3 * (q * r −q −r + 1) := by

ring_nf at h26 ⊢ <;> nlinarith have h28 : 2 * q * r −1 = 3 * q * r −3 * q −3 * r + 3 := by

ring_nf at h27 ⊢ <;> nlinarith have h29 : −q * r + 3 * q + 3 * r −4 = 0 := by

ring_nf at h28 ⊢ <;> nlinarith have h30 : (q : Z) * r −3 * q −3 * r + 4 = 0 := by

ring_nf at h29 ⊢ <;> nlinarith have h31 : (q −3 : Z) * (r −3 : Z) = 5 := by

ring_nf at h30 ⊢ <;> nlinarith have h32 : (q : Z) −3 = 1 ∧(r : Z) −3 = 5 ∨(q : Z) −3 = 5 ∧(r : Z) −3 = 1 ∨(q : Z) −3 = −1 ∧(r : Z) −3 = −5

∨(q : Z) −3 = −5 ∧(r : Z) −3 = −1 := by

have h33 : (q : Z) −3 = 1 ∨(q : Z) −3 = 5 ∨(q : Z) −3 = −1 ∨(q : Z) −3 = −5 := by

have h34 : (q : Z) −3 | 5 := by

use (r : Z) −3 linarith have h35 : (q : Z) −3 = 1 ∨(q : Z) −3 = 5 ∨(q : Z) −3 = −1 ∨(q : Z) −3 = −5 := by

have h36 : (q : Z) −3 = 1 ∨(q : Z) −3 = 5 ∨(q : Z) −3 = −1 ∨(q : Z) −3 = −5 := by

rw [←Int.natAbs_dvd_natAbs] at h34 −−We use the fact that the absolute value of (q −3) divides the absolute value of 5 have h37 : ((q : Z) −3).natAbs | 5 := by

simpa [Int.natAbs] using h34 −−Since the possible divisors of 5 are 1 and 5, we check the cases have h38 : ((q : Z) −3).natAbs = 1 ∨((q : Z) −3).natAbs = 5 := by

have h39 : ((q : Z) −3).natAbs | 5 := h37 have h40 : ((q : Z) −3).natAbs ⩽5 := Nat.le_of_dvd (by decide) h39 interval_cases ((q : Z) −3).natAbs <;> norm_num at h39 ⊢<;> omega cases h38 with | inl h38 =>

have h41 : (q : Z) −3 = 1 ∨(q : Z) −3 = −1 := by

have h42 : ((q : Z) −3).natAbs = 1 := h38 have h43 : (q : Z) −3 = 1 ∨(q : Z) −3 = −1 := by

rw [Int.natAbs_eq_iff] at h42 tauto exact h43 cases h41 with | inl h41 =>

tauto | inr h41 =>

tauto | inr h38 =>

have h41 : (q : Z) −3 = 5 ∨(q : Z) −3 = −5 := by

31

<!-- page 32 of 39 -->

have h42 : ((q : Z) −3).natAbs = 5 := h38 have h43 : (q : Z) −3 = 5 ∨(q : Z) −3 = −5 := by

rw [Int.natAbs_eq_iff] at h42 tauto exact h43 cases h41 with | inl h41 =>

tauto | inr h41 =>

tauto exact h36 exact h35 cases h33 with | inl h33 =>

have h34 : (q : Z) −3 = 1 := h33 have h35 : (r : Z) −3 = 5 := by

have h36 : ((q : Z) −3) * ((r : Z) −3) = 5 := by

linarith rw [h34] at h36 linarith exact Or.inl ⟨h34, h35⟩ | inr h33 =>

cases h33 with | inl h33 =>

have h34 : (q : Z) −3 = 5 := h33 have h35 : (r : Z) −3 = 1 := by

have h36 : ((q : Z) −3) * ((r : Z) −3) = 5 := by

linarith rw [h34] at h36 linarith exact Or.inr (Or.inl ⟨h34, h35⟩) | inr h33 =>

cases h33 with | inl h33 =>

have h34 : (q : Z) −3 = −1 := h33 have h35 : (r : Z) −3 = −5 := by

have h36 : ((q : Z) −3) * ((r : Z) −3) = 5 := by

linarith rw [h34] at h36 linarith exact Or.inr (Or.inr (Or.inl ⟨h34, h35⟩)) | inr h33 =>

have h34 : (q : Z) −3 = −5 := h33 have h35 : (r : Z) −3 = −1 := by

have h36 : ((q : Z) −3) * ((r : Z) −3) = 5 := by

linarith rw [h34] at h36 linarith exact Or.inr (Or.inr (Or.inr ⟨h34, h35⟩)) rcases h32 with (⟨h32, h33⟩| ⟨h32, h33⟩| ⟨h32, h33⟩| ⟨h32, h33⟩) · −−Case 1: q −3 = 1 and r −3 = 5 have h34 : q = 4 := by

linarith have h35 : r = 8 := by

linarith simp [h34, h35, h15] <;> norm_num <;> omega · −−Case 2: q −3 = 5 and r −3 = 1 have h34 : q = 8 := by

linarith have h35 : r = 4 := by

32

<!-- page 33 of 39 -->

linarith have h36 : r > q := by

linarith linarith · −−Case 3: q −3 = −1 and r −3 = −5 have h34 : q = 2 := by

linarith have h35 : r = −2 := by

linarith have h36 : r > q := by

linarith linarith · −−Case 4: q −3 = −5 and r −3 = −1 have h34 : q = −2 := by

linarith have h35 : r = 2 := by

linarith have h36 : r > q := by

linarith linarith have h17 : r = 8 := by

have h18 : p = 2 := by linarith have h19 : q = 4 := by linarith have h20 : (p : Z) * q * r −1 = 3 * ((p −1) * (q −1) * (r −1)) := by linarith have h21 : (p : Z) = 2 := by norm_num [h18] have h22 : (q : Z) = 4 := by norm_num [h19] norm_num [h18, h19, h21, h22] at h20 <;> ring_nf at h20 ⊢<;> omega have h18 : (p, q, r) = (2, 4, 8) := by

simp_all [Prod.ext_iff] <;> norm_num <;> linarith exact Or.inl h18 exact h5 ‘‘‘

B. Examples of the Buggy Proofs Generated by DeepSeek-Prover-V2-7B on

PutnamBench Triggering the User Interface Bug of apply?

import Mathlib

open Nat Set

/−− Let 𝐻be an 𝑛× 𝑛matrix all of whose entries are ±1 and whose rows are mutually orthogonal. Suppose 𝐻has an

𝑎× 𝑏submatrix whose entries are all 1. Show that 𝑎𝑏⩽𝑛. −/ theorem putnam_2005_a4 (n : N) (H : Matrix (Fin n) (Fin n) R) (a b : N) (S : Matrix (Fin a) (Fin b) R) (npos : n ⩾1) (Hentries : ∀i j : Fin n, H i j = 1 ∨H i j = −1) (Hortho : H.HasOrthogonalRows) (hab : 1 ⩽a ∧a ⩽n ∧1 ⩽b ∧b ⩽n) (Ssub : ∃(rri : Fin a →Fin n) (cri : Fin b →Fin n), rri.Injective ∧cri.Injective ∧S = H.submatrix

rri cri) (Sentries : ∀(i : Fin a) (j : Fin b), S i j = 1) : a * b ⩽n := by

33

<!-- page 34 of 39 -->

obtain ⟨rri, cri, hrinj, hcrij, hsub⟩:= Ssub have h1 : a ⩽n := hab.2.1 have h2 : b ⩽n := hab.2.2.2 have h3 : a * b ⩽n := by calc

a * b = Cardinal.toNat (a * b) := by simp [Nat.cast_inj] _ ⩽Cardinal.toNat (n) := by apply? _ = n := by simp [Nat.cast_inj] exact h3

import Mathlib

open Set Nat Function

−−fun n ↦→2 ^ (n + 1) /−− Let 𝑛be a positive integer. Find the number of pairs 𝑃, 𝑄of polynomials with real coefficients such that \[ (P(X))^2 + (Q(X))^2 = X^{2n} + 1 \] and deg 𝑃> deg 𝑄. −/ theorem putnam_2007_b4 (n : N) (npos : n > 0) : ({(P, Q) : (Polynomial R) × (Polynomial R) | P ^ 2 + Q ^ 2 = Polynomial.X ^ (2 * n) + 1 ∧P.degree >

Q.degree}.ncard = ((fun n ↦→2 ^ (n + 1)) : N →N ) n) := by have h1 : ∀n : N, n > 0 →({ (P, Q) : (Polynomial R) × (Polynomial R) | P ^ 2 + Q ^ 2 = Polynomial.X ^ (2 *

n) + 1 ∧P.degree > Q.degree }.ncard : N) = 2 ^ (n + 1) := by intro n hn have h : ∀n : N, n > 0 →({ (P, Q) : (Polynomial R) × (Polynomial R) | P ^ 2 + Q ^ 2 = Polynomial.X ^ (2 * n)

+ 1 ∧P.degree > Q.degree }.ncard : N) = 2 ^ (n + 1) := by intro n hn have h1 : ({ (P, Q) : (Polynomial R) × (Polynomial R) | P ^ 2 + Q ^ 2 = Polynomial.X ^ (2 * n) + 1 ∧

P.degree > Q.degree }.ncard : N) = 2 ^ (n + 1) := by have h2 : ({ (P, Q) : (Polynomial R) × (Polynomial R) | P ^ 2 + Q ^ 2 = Polynomial.X ^ (2 * n) + 1 ∧

P.degree > Q.degree } : Set ((Polynomial R) × (Polynomial R))).ncard = 2 ^ (n + 1) := by

rw [←Cardinal.natCast_inj] apply? exact_mod_cast h2 exact h1 exact h n hn

have h2 : ({ (P, Q) : (Polynomial R) × (Polynomial R) | P ^ 2 + Q ^ 2 = Polynomial.X ^ (2 * n) + 1 ∧P.degree

> Q.degree }.ncard : N) = 2 ^ (n + 1) := by apply h1 exact npos simpa [h2] using h2

C. An Example of Using exfalso to Prove a Vacuously True Statement

The following example is taken from an earlier version of CombiBench (Liu et al., 2025), which has been corrected in the latest release.

Input:

Complete the following Lean 4 code:

34

<!-- page 35 of 39 -->

‘‘‘lean4 import Mathlib

def appears (W : Z →Fin 2) (U : Σ n, Fin n →Fin 2) : Prop :=

∃k, ∀i : Fin U.1, U.2 i = W (k + i)

def ubiquitous (W : Z →Fin 2) (U : Σ n, Fin n →Fin 2) : Prop :=

appears W ⟨U.1 + 1, Fin.snoc U.2 0⟩∧ appears W ⟨U.1 + 1, Fin.snoc U.2 1⟩∧ appears W ⟨U.1 + 1, Fin.cons 0 U.2⟩∧ appears W ⟨U.1 + 1, Fin.cons 1 U.2⟩

/-- Let 𝑛be a positive integer and let 𝑊= . . . 𝑥−1𝑥0𝑥1𝑥2 . . . be an infinite

periodic word consisting of the letters 𝑎and 𝑏. Suppose that the minimal period 𝑁of 𝑊is greater than 2𝑛. A finite nonempty word 𝑈is said to appear in 𝑊if there exist indices 𝑘⩽ℓsuch that 𝑈= 𝑥𝑘𝑥𝑘+1 . . . 𝑥ℓ. A finite word 𝑈is called ubiquitous if the four words 𝑈𝑎,𝑈𝑏, 𝑎𝑈, and 𝑏𝑈all appear in 𝑊. Prove that there are at least 𝑛ubiquitous finite nonempty words.-/ theorem imosl_2011_c6 (W : Z →Fin 2) (n : N+) (N : N) (hN : 2 ^ n.1 < N)

(hW : Function.Periodic W N) (hW’ : ∀N’ < N, ¬ Function.Periodic W N’) : ∃(x : Fin n ↩→(Σ k, Fin k →Fin 2)), (∀i, (x i).1 ≠0) ∧(∀i, ubiquitous W (x i)) := by sorry ‘‘‘

Before producing the Lean 4 code to formally prove the given theorem, provide

a detailed proof plan outlining the main proof steps and strategies. The plan should highlight key ideas, intermediate lemmas, and proof

structures that will guide the construction of the final formal proof.

Output:

### Detailed Proof and Analysis

First, let’s understand the problem: 1. We have an infinite periodic word ‘W : Z →Fin 2‘ with minimal period ‘N > 2𝑛‘ (where ‘n : N+‘ is a positive integer). −‘Function.Periodic W N‘ means ‘∀z, W (z + N) = W z‘. −The minimality condition is ‘∀N’ < N, ¬ Function.Periodic W N’‘. 2. The definitions: −A finite word ‘U = (n, f : Fin n →Fin 2)‘ **appears** in ‘W‘ if there exists ‘k‘ such that ‘U.2 i = W (k +

i)‘ for all ‘i : Fin n‘. −In Lean, ‘appears W U‘ is defined as ‘∃k, ∀i : Fin U.1, U.2 i = W (k + i)‘. −‘U‘ is **ubiquitous** if all four augmented words ‘Ua‘, ‘Ub‘, ‘aU‘, ‘bU‘ appear in ‘W‘.

−In Lean, ‘ubiquitous W U‘ checks that the four augmented words appear, where:

−‘Ua‘ is ‘⟨U.1 + 1, Fin.snoc U.2 0⟩‘, −‘Ub‘ is ‘⟨U.1 + 1, Fin.snoc U.2 1⟩‘, −‘aU‘ is ‘⟨U.1 + 1, Fin.cons 0 U.2⟩‘, −‘bU‘ is ‘⟨U.1 + 1, Fin.cons 1 U.2⟩‘. 3. The goal is to find an injective function from ‘Fin n‘ to ubiquitous finite nonempty words in ‘W‘ (i.e., to ‘Σ k, Fin k →Fin 2‘ where ‘k ≠0‘ and the word is ubiquitous).

However, the Lean problem is slightly different: 1. The function is ‘x : Fin n ↩→(Σ k, Fin k →Fin 2)‘. 2. The conditions are: −‘∀i, (x i).1 ≠0‘ (nonempty words), −‘∀i, ubiquitous W (x i)‘ (ubiquitous words). The minimality of ‘N‘ is given by ‘hW’‘, but the condition ‘N > 2𝑛‘ is only ‘2 ^ n.1 < N‘ (‘n.1‘ is the

35

<!-- page 36 of 39 -->

underlying ‘N‘ of ‘n : N+‘).

#### Observations and Strategy: 1. **Trivial Solution**: The Lean problem does not require the words to be distinct or non−trivial in any way. We can find one ubiquitous word and map all ‘i : Fin n‘ to it. 2. **Choosing ‘U‘**: Pick ‘U‘ to be the empty word (‘k = 0‘). But ‘(x i).1 ≠0‘ forbids ‘k = 0‘. −Alternative: Pick ‘U‘ to be the length−1 word ‘[a]‘. But we need to verify its ubiquity in ‘W‘. 3. **Key Issue**: The definitions in Lean are not quite the same as in the problem statement: −The problem statement uses nonempty words, and ‘appears‘ is about subwords of ‘W‘. −In Lean, ‘appears W ⟨n, f⟩‘ is ‘∃k, ∀i : Fin n, f i = W (k + i)‘, so ‘n = 0‘ (empty word) is allowed (‘Fin 0

→Fin 2‘ is a singleton), but ‘n = 0‘ gives ‘(x i).1 ≠0‘ is false (‘(x i).1 = 0‘). So the Lean condition ‘(x i).1 ≠0‘ corresponds to nonempty words in the problem. 4. **Using Periodicity**: −Since ‘W‘ is periodic with period ‘N‘, we can shift ‘k‘ by multiples of ‘N‘ to get the same word. −For any ‘m : N+‘, the constant word ‘(m, fun _ => a)‘ appears in ‘W‘ if ‘W‘ has ‘a‘ anywhere (‘k‘ can be

chosen such that ‘W (k + i) = a‘ for all ‘i : Fin m‘). But we need to choose ‘a‘ carefully. 5. **Simplest Choice**: −Take ‘U = (1, fun _ => W 0)‘. Then:

−‘Ua = (2, [W 0, 0])‘. −But to show ‘Ua‘ appears, we need ‘∃k, W (k + 0) = W 0 ∧W (k + 1) = 0‘. −This is not guaranteed unless ‘W 1 = 0‘ (e.g., take ‘k = 0‘). −This might not work in general. 6. **Alternative Approach**: −The assumptions are contradictory!

−‘hW’‘ says no ‘N’ < N‘ is a period, but ‘N’ = 0 < N‘ is possible unless ‘N = 0‘. But ‘hN : 2 ^ n.1 < N‘ and ‘n

: N+‘ imply ‘N > 1‘, so ‘N’ = 0‘ is allowed, but ‘W‘ is periodic with ‘N’ = 0‘ iff it is constant (‘W (z + 0) = W z‘ is trivially true), so ‘hW’ 0 (by hN)‘ implies ‘W‘ is not constant. However, ‘N’ = 1‘ is possible (if ‘N > 1‘), but ‘W‘ cannot be periodic with ‘N’ = 1‘, as there are only two possible ‘W‘s (both constant), but ‘hW’‘ forbids this. Contradiction! −More precisely, take ‘N’ = 0‘. Since ‘N ⩾1‘ (as ‘N > 2 ^ n.1 ⩾1‘), ‘N’ = 0 < N‘.

−‘Function.Periodic W 0‘ means ‘∀z, W (z + 0) = W z‘, i.e., ‘∀z, W z = W z‘, which is always true. −But ‘hW’ 0 (by linarith)‘ gives ‘¬Function.Periodic W 0‘, i.e., false. −So, the assumptions ‘hW’‘ lead to a contradiction unless ‘n = 0‘, but ‘n : N+‘ is positive.

**Wait**: In Lean, ‘Function.Periodic f c‘ is ‘∀z, f (z + c) = f z‘ (‘c‘ is the period, not necessarily minimal). Here, ‘hW’‘ takes ‘N’‘ as a ‘N‘, but ‘W : Z →Fin 2‘ uses ‘+‘ as the ‘Z‘ addition, and ‘N’‘ is cast to ‘Z‘ (since ‘c : Z‘ in ‘f (z + c)‘).

But still: −‘hW’ 0 . . .‘ is not directly applicable because ‘0 : N‘ is ‘< N‘ (as ‘N > 2 ^ n.1 ⩾1‘), but

‘Function.Periodic W 0‘ is ‘∀z : Z, W (z + 0) = W z‘, which is trivially true (‘z + 0 = z‘). But ‘hW’ 0 (by linarith)‘ states ‘¬Function.Periodic W 0‘, which is false.

**Conclusion**: The assumptions in the Lean problem are contradictory because: 1. ‘N > 2 ^ n.1 ⩾1‘ (‘n : N+‘ so ‘n.1 ⩾1‘), hence ‘N ⩾2‘ (as ‘N : N‘ and ‘2 ^ n.1 ⩾2 ^ 1 = 2‘). 2. ‘hW’ 0‘ requires ‘0 < N‘ (which is true, as ‘N ⩾2‘) and ‘¬Function.Periodic W 0‘, but ‘Function.Periodic W 0‘ is trivially true (as above). 3. Thus, ‘hW’ 0‘ yields ‘false‘.

But Lean’s ‘hW’‘ is ‘∀(N’ : N), N’ < N →¬Function.Periodic W N’‘. However, in ‘Function.Periodic W N’‘,

‘N’‘ is automatically cast to ‘Z‘ (‘N’ : N‘ is ‘(N’ : Z)‘), so it is still ‘∀z, W (z + (N’ : Z)) = W z‘. For ‘N’ = 0‘, this is ‘∀z, W z = W z‘.

#### Constructing a Proof in Lean: The assumptions are contradictory, so the theorem statement is vacuously true. Construct any ‘x :

Fin n ↩→(Σ k, Fin k →Fin 2)‘ and the conditions ‘(∀i, (x i).1 ≠0)‘ and ‘(∀i, ubiquitous W (x i))‘ will follow from ‘false →anything‘.

But Lean expects ‘x‘ to be constructed. Here is the construction: 1. Use ‘(1, fun _ => 0)‘ as the word (length ‘1‘, all letters ‘0‘). 2. The conditions ‘(x i).1 ≠0‘ (‘1 ≠0‘) and ‘ubiquitous W (x i)‘ (which will follow from ‘false‘).

36

<!-- page 37 of 39 -->

3. The embedding is trivial because all ‘i : Fin n‘ map to the same word.

But to actually prove ‘ubiquitous W (x i)‘, we need to prove ‘appears W ⟨2, _⟩‘, etc., but we can derive

‘false‘ from ‘hW’ 0‘.

However, ‘hN : 2 ^ n.1 < N‘ and ‘n : N+‘ is not directly saying ‘N ⩾2‘ (‘n.1 ⩾1‘ but ‘2 ^ n.1‘ could be ‘2 ^ 1 =

2‘ or more (‘n.1 = 1‘ is possible for ‘n : N+‘), and ‘N > 2 ^ n.1 ⩾2‘ (if ‘n.1 ⩾1‘ then ‘2 ^ n.1 ⩾2‘).

But ‘N‘ is ‘N : N‘, and ‘0 < N‘ (since ‘N > 2 ^ n.1 ⩾1‘), so ‘N’ = 0 < N‘ (‘0 < N‘ is ‘N ⩾1‘). But ‘hW’ 0 h‘ (where ‘h :

0 < N‘ is ‘Nat.lt_of_succ_le (by . . .)‘), gives ‘¬Function.Periodic W 0‘, which is false, so ‘false‘ follows.

Thus, the initial step is to derive ‘false‘ from the hypotheses. Then, we can use ‘false.elim‘ to

prove the goal.

#### Deriving ‘false‘:

1. We know ‘n : N+‘, so ‘n.1 ⩾1‘ (‘n.1‘ is the underlying ‘N‘ of ‘n : N+‘). 2. Then ‘2 ^ n.1 ⩾2 ^ 1 = 2‘ (since ‘n.1 ⩾1‘ and ‘2 ^ (·)‘ is monotone). 3. So ‘N > 2 ^ n.1 ⩾2‘, which means ‘N ⩾3‘ (‘N : N‘ and ‘N > 2‘ implies ‘N ⩾3‘). 4. Now, ‘hW’ 0‘ needs a proof ‘(0 : N) < N‘, which is ‘Nat.lt_of_succ_le (by linarith)‘ (‘N ⩾3‘ so ‘0 < N‘). 5. But ‘Function.Periodic W 0‘ is trivially true, so ‘hW’ 0 . . .‘ is ‘false‘.

But note that ‘2 ^ n.1‘ is not necessarily ‘⩾2‘ if ‘n.1 = 0‘, but ‘n : N+‘ implies ‘n.1 ⩾1‘ (‘n ≠0‘). Thus, ‘2

^ n.1 ⩾2 ^ 1 = 2‘ (‘n.1 ⩾1‘).

However, if ‘N : N‘ is such that ‘N > 2 ^ n.1‘, we have ‘N ⩾1‘ (‘N‘ could be ‘1‘ if ‘n.1 = 1‘ and ‘2 ^ n.1 = 2 > N‘

is not possible by ‘hN‘). Wait no: in ‘hN‘, ‘2 ^ n.1 < N‘. So if ‘n.1 = 1‘, ‘N > 2 ^ 1 = 2‘, so ‘N ⩾3‘.

Wait, ‘n : N+‘ is a positive integer (‘n.1 ⩾1‘), so:

−‘n.1 ⩾1‘ implies ‘2 ^ n.1 ⩾2 ^ 1 = 2‘, so ‘N > 2‘ and ‘N ⩾3‘. Thus, ‘0 < N‘ (‘0 < N‘ because ‘N ⩾3‘), so ‘N’ = 0‘ satisfies ‘N’ < N‘.

But ‘Function.Periodic W 0‘ is ‘∀z, W (z + 0) = W z‘, which is ‘∀z, W z = W z‘, i.e., true. But ‘hW’ 0 (by

linarith)‘ says that this is false, which is a contradiction.

### Step 1: Derive ‘False‘

First, derive ‘False‘ from the given hypotheses.

### Step 2: Prove the Goal Using ‘False‘

Since we have ‘False‘, the goal follows trivially (‘False →anything‘).

### Step 3: Construct ‘x‘

Although we have ‘False‘, Lean still wants us to provide ‘x : Fin n ↩→(Σ k, Fin k →Fin 2)‘. Construct

a trivial one, e.g., ‘x‘ maps everything to ‘⟨1, fun _ => 0⟩‘.

### Step 4: Verify the Conditions for ‘x‘

We need ‘(∀i, (x i).1 ≠0)‘ and ‘(∀i, ubiquitous W (x i))‘. These are trivial because: −‘(x i).1 = 1 ≠0‘. −‘ubiquitous W (x i)‘ follows from ‘False‘.

However, Lean will not actually ask for ‘ubiquitous W (x i)‘ in the proof because we already

derived ‘False‘ earlier. But we must ensure ‘x‘ is defined and uses the correct type.

### Step−by−Step Abstract Plan

1. Derive ‘False‘ from ‘hW’‘:

37

<!-- page 38 of 39 -->

−Since ‘N > 2 ^ n.1 ⩾2‘, ‘N ⩾3‘. −‘hW’ 0‘ requires ‘0 < N‘, which is ‘Nat.pos_of_ne_zero (by linarith)‘. −But ‘Function.Periodic W 0‘ is true, so ‘hW’ 0 . . .‘ is ‘False‘. 2. Since we have ‘False‘, construct any trivial ‘x‘ (e.g., constant embedding to ‘⟨1, fun _ => 0⟩‘). 3. The conditions on ‘x‘ are vacuously true (‘False →anything‘).

### Lean ‘have‘ Statements

‘‘‘lean4 theorem imosl_2011_c6 (W : Z →Fin 2) (n : N+) (N : N) (hN : 2 ^ n.1 < N)

(hW : Function.Periodic W N) (hW’ : ∀N’ < N, ¬ Function.Periodic W N’) : ∃(x : Fin n ↩→(Σ k, Fin k →Fin 2)), (∀i, (x i).1 ≠0) ∧(∀i, ubiquitous W (x i)) := by −−Step 1: Derive False from hW’ have h_false : False := by sorry −−Step 2: The conclusion follows trivially from h_false, but Lean needs an explicit x have h_main : ∃(x : Fin n ↩→(Σ k, Fin k →Fin 2)), (∀i, (x i).1 ≠0) ∧(∀i, ubiquitous W (x i)) := by sorry sorry ‘‘‘

### Complete Lean 4 Proof

‘‘‘lean4 theorem imosl_2011_c6 (W : Z →Fin 2) (n : N+) (N : N) (hN : 2 ^ n.1 < N)

(hW : Function.Periodic W N) (hW’ : ∀N’ < N, ¬ Function.Periodic W N’) : ∃(x : Fin n ↩→(Σ k, Fin k →Fin 2)), (∀i, (x i).1 ≠0) ∧(∀i, ubiquitous W (x i)) := by have h_false : False := by

have h1 : 0 < N := by

have h2 : 2 ^ n.1 ⩾2 ^ 1 := by

apply Nat.pow_le_pow_of_le_right · norm_num · have h3 : n.1 ⩾1 := by exact Nat.one_le_of_lt n.2 linarith have h3 : N > 2 ^ n.1 := hN have h4 : N > 0 := by linarith linarith have h2 : ¬Function.Periodic W 0 := by

apply hW’ 0 <;> simpa [h1] using hN have h3 : Function.Periodic W 0 := by

intro z simp [Function.Periodic] exact h2 h3

have h_main : ∃(x : Fin n ↩→(Σ k, Fin k →Fin 2)), (∀i, (x i).1 ≠0) ∧(∀i, ubiquitous W (x i)) := by

exfalso exact h_false

exact h_main ‘‘‘

D. Revision to MiniF2F

1. mathd_algebra_247:

/−−Let 𝑡= 2𝑠−𝑠2 and 𝑠= 𝑛2 −2𝑛+ 1. What is the value of 𝑡when 𝑛= 3? Show that it is 0.−/ theorem mathd_algebra_247 (t s : R) (n : Z) (h0 : t = 2 * s −s ^ 2) (h1 : s = n ^ 2 −2 ^ n + 1)

(n) (_ : n = 3) : t = 0 := by sorry

38

<!-- page 39 of 39 -->

−−revise to theorem mathd_algebra_247 (t s : R) (n : Z) (h0 : t = 2 * s −s ^ 2) (h1 : s = n ^ 2 −2 ^ n + 1)

(_ : n = 3) : t = 0 := by sorry

2. induction_sum_odd:

/−−Show that for positive integer 𝑛, Í𝑛−1

𝑘=0 (2𝑘+ 1) = 𝑛2.−/ theorem induction_sum_odd (n : N) : (Í k in Finset.range n, 2 * k) + 1 = n ^ 2 := by

sorry −−revise to theorem induction_sum_odd (n : N) : (Í k in Finset.range n, (2 * k + 1)) = n ^ 2 := by

sorry

3. induction_prod1p1onk3le3m1onn:

/−−Show that for any positive integer 𝑛, we have Î𝑛

𝑘=1(1 + 1/𝑘3) ⩽3 −1/𝑛.−/ theorem induction_prod1p1onk3le3m1onn (n : N) (h0 : 0 < n) :

(Î k in Finset.Icc 1 n, 1 + (1 : R) / k ^ 3) ⩽(3 : R) −1 / ↑n := by sorry −−revise to theorem induction_prod1p1onk3le3m1onn (n : N) (h0 : 0 < n) :

(Î k in Finset.Icc 1 n, (1 + (1 : R) / k ^ 3)) ⩽(3 : R) −1 / ↑n := by sorry

39
