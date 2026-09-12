"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-R1: 通过强化学习激励 LLM 中的推理能力</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning
原文链接: <a href="https://arxiv.org/abs/2501.12948">https://arxiv.org/abs/2501.12948</a>
发布日期: 2025 年 1 月 20 日
发布机构: DeepSeek-AI
关键词: Large Language Model, Reasoning, Reinforcement Learning</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>通用推理一直是人工智能领域长期存在且艰巨的挑战. 近年来, 以大语言模型(LLM)和思维链(Chain-of-Thought, CoT) prompting 为代表的突破性进展, 在基础推理任务上取得了相当的成功. 然而, 这一成功在很大程度上依赖于大量人工标注的示范数据, 且模型在处理更复杂问题时能力仍然不足.</p>
<p>本文表明, LLM 的推理能力可以通过纯强化学习(RL)来激励, 从而无需人类标注的推理轨迹. 所提出的 RL 框架促进了高级推理模式的涌现式发展, 例如自我反思、验证和动态策略调整. 因此, 训练后的模型在数学、编程竞赛和 STEM 等可验证任务上取得了卓越的性能, 超越了通过传统监督学习在人类示范上训练的同类模型. 此外, 这些大规模模型所展现出的涌现推理模式可以被系统地利用, 以指导和增强较小模型的推理能力.</p>
<blockquote>
<p>译者注: 这篇摘要传递了一个非常激进的信号 —— 推理能力不需要 SFT, 只需要 RL 和可靠的验证器. 这与 OpenAI o1 的闭门方法论形成了鲜明对照. DeepSeek 选择将完整的训练流程开源, 包括 R1-Zero(纯 RL)和 R1(多阶段)两个版本, 以及 6 个蒸馏小模型. 这种开放策略的价值不仅在于模型权重, 更在于它证明了「推理能力可以通过自举(self-bootstrapping)获得」这一假设.</p>
</blockquote>
<hr>
<h2 id="1-yy">1. 引言</h2>
<p>推理能力是人类智能的基石, 使复杂的认知任务成为可能, 从数学问题求解到逻辑演绎再到编程. 近年来, 人工智能领域的进展表明, 当大语言模型(LLM)被扩展到足够大的规模时, 可以表现出涌现行为, 包括推理能力. 然而, 在预训练阶段实现此类能力通常需要大量的计算资源.</p>
<p>与此同时, 一条互补的研究路线已经证明, 大语言模型可以通过思维链(Chain-of-Thought, CoT) prompting 得到有效增强. 这种技术涉及提供精心设计的 few-shot 示例或使用极简的提示如「Let’s think step by step」, 使模型能够生成中间推理步骤, 从而显著提升其在复杂任务上的性能. 类似地, 当模型在后训练阶段学习高质量的多步推理轨迹时, 也观察到了进一步的性能提升.</p>
<p>尽管这些方法有效, 但它们表现出明显的局限性. 对人类标注推理轨迹的依赖阻碍了可扩展性, 并引入了认知偏差. 此外, 通过将模型约束为复制人类思维过程, 其性能被人类提供的示例所固有的上限所限制, 这阻止了对更优的、非人类式推理路径的探索.</p>
<p>为了解决这些问题, 我们旨在探索 LLM 在 RL 框架中通过自我进化来发展推理能力的潜力, 同时尽量减少对人类标注工作的依赖.</p>
<p>具体而言, 我们基于 DeepSeek-V3-Base 构建模型, 并采用 Group Relative Policy Optimization(GRPO, 群组相对策略优化)作为我们的 RL 框架. 奖励信号仅基于最终预测与真实答案的正确性, 而不对推理过程本身施加约束. 值得注意的是, 我们跳过了 RL 训练前的传统监督微调(SFT)阶段. 这一设计选择源于我们的假设: 人类定义的推理模式可能会限制模型的探索, 而无约束的 RL 训练能够更好地激励 LLM 中新颖推理能力的涌现.</p>
<p>通过这一过程(详见第 2 节), 我们的模型(称为 DeepSeek-R1-Zero)自然地发展出了多样化且复杂的推理行为. 在求解推理问题时, 模型倾向于生成更长的响应, 在每个响应中融入验证、反思和替代方案的探索. 尽管我们没有明确地教模型如何推理, 它仍然成功地通过强化学习学会了改进的推理策略.</p>
<p>这里值得停一下. 传统后训练范式的核心假设是: 人类标注的推理轨迹是「黄金标准」, 模型应该尽可能地模仿它们. DeepSeek-R1-Zero 的设计直接挑战了这一假设. 团队的核心洞察是: 预训练模型已经内化了大量推理相关知识, 只是缺乏一个机制来组织这些知识形成连贯的推理链. RL 提供了一个搜索机制, 让模型在奖励信号的引导下自主探索最优的推理策略. 这与 AlphaGo 的逻辑是一致的: 不是教它人类的棋谱, 而是让它通过自我对弈发现更好的策略.</p>
<p>尽管 DeepSeek-R1-Zero 展示了出色的推理能力, 但它面临着可读性差和语言混合等挑战, 偶尔会在单个思维链响应中混合使用英语和中文. 此外, DeepSeek-R1-Zero 基于规则的 RL 训练阶段 narrowly focused on 推理任务, 导致在写作和开放域问答等更广泛的领域性能有限.</p>
<p>为了解决这些挑战, 我们引入了 DeepSeek-R1, 这是一个通过多阶段学习框架训练的模型, 整合了拒绝采样(Rejection Sampling)、强化学习和监督微调(详见第 3 节). 该训练流水线使 DeepSeek-R1 能够继承其前代 DeepSeek-R1-Zero 的推理能力, 同时通过额外的非推理数据将模型行为与人类偏好对齐.</p>
<p>为了使更广泛的受众能够以更低的能源成本获得强大的 AI, 我们蒸馏了多个较小的模型并公开发布. 这些蒸馏模型展现出强大的推理能力, 超越了其原始指令微调版本的性能. 我们相信, 这些指令微调版本也将通过提供理解长思维链(CoT)推理模型底层机制和促进更强大推理模型发展的宝贵资源, 为研究社区做出重大贡献.</p>
<hr>
<h2 id="2-deep-seek-r1-zero-cqhxxqddtlmx">2. DeepSeek-R1-Zero: 纯强化学习驱动的推理模型</h2>
<p>我们首先详细阐述 DeepSeek-R1-Zero 的训练过程, 它完全依赖强化学习, 不使用监督微调. 为了促进大规模 RL 的效率, 我们采用 Group Relative Policy Optimization(GRPO).</p>
<h3 id="2-1-group-relative-policy-optimization">2.1 Group Relative Policy Optimization</h3>
<p>GRPO 是我们用来训练 DeepSeek-R1-Zero 和 DeepSeek-R1 的强化学习算法. 它最初被提出是为了简化 Proximal Policy Optimization(PPO, 近端策略优化)的训练过程并降低其资源消耗, PPO 是 LLM RL 阶段广泛使用的算法.</p>
<p>对于每个问题 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi></mrow><annotation encoding="application/x-tex">q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span>, GRPO 从旧策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{old}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6864em;vertical-align:-0.2559em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span></span></span></span> 中采样一组输出 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">{</mo><msub><mi>o</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>o</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>o</mi><mi>G</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\{o_1, o_2, \\cdots, o_G\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span>, 然后通过最大化以下目标来优化策略模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">J</mi><mrow><mi>G</mi><mi>R</mi><mi>P</mi><mi>O</mi></mrow></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mo stretchy="false">[</mo><mi>q</mi><mo>∼</mo><mi>P</mi><mo stretchy="false">(</mo><mi>Q</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mo stretchy="false">{</mo><msub><mi>o</mi><mi>i</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo>∼</mo><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub><mo stretchy="false">(</mo><mi>O</mi><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo><mo stretchy="false">]</mo></mrow></msub><mfrac><mn>1</mn><mi>G</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><mrow><mo fence="true">(</mo><mi>min</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></mfrac><msub><mi>A</mi><mi>i</mi></msub><mo separator="true">,</mo><mtext>clip</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><msub><mi>θ</mi><mrow><mi>o</mi><mi>l</mi><mi>d</mi></mrow></msub></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></mfrac><mo separator="true">,</mo><mn>1</mn><mo>−</mo><mi>ϵ</mi><mo separator="true">,</mo><mn>1</mn><mo>+</mo><mi>ϵ</mi><mo fence="true">)</mo></mrow><msub><mi>A</mi><mi>i</mi></msub><mo fence="true">)</mo></mrow><mo>−</mo><mi>β</mi><msub><mi mathvariant="double-struck">D</mi><mrow><mi>K</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>π</mi><mi>θ</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{J}_{GRPO}(\\theta) = \\mathbb{E}_{[q \\sim P(Q), \\{o_i\\}_{i=1}^G \\sim \\pi_{\\theta_{old}}(O|q)]} \\frac{1}{G}\\sum_{i=1}^G \\left( \\min \\left( \\frac{\\pi_\\theta(o_i|q)}{\\pi_{\\theta_{old}}(o_i|q)} A_i, \\text{clip}\\left(\\frac{\\pi_\\theta(o_i|q)}{\\pi_{\\theta_{old}}(o_i|q)}, 1-\\epsilon, 1+\\epsilon\\right) A_i \\right) - \\beta \\mathbb{D}_{KL}(\\pi_\\theta \\|\\| \\pi_{ref}) \\right) \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.1847em;">J</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1847em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0077em;">GR</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.4618em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">[</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mrel mtight">∼</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">Q</span><span class="mclose mtight">)</span><span class="mpunct mtight">,</span><span class="mopen mtight">{</span><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight"><span class="mclose mtight">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8329em;"><span style="top:-2.1777em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-2.8448em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3223em;"><span></span></span></span></span></span></span><span class="mrel mtight">∼</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0278em;margin-right:0.1em;"><span class="pstrut" style="height:2.6944em;"></span><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3496em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.401em;"><span></span></span></span></span></span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span><span class="mord mtight">∣</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mclose mtight">)]</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.5189em;"><span></span></span></span></span></span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">G</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mop">min</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9419em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">clip</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9419em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathbb">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span><span class="tag"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 KL 散度的无偏估计为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="double-struck">D</mi><mrow><mi>K</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>π</mi><mi>θ</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">)</mo><mo>=</mo><mfrac><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>−</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>o</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>q</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>−</mo><mn>1</mn></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbb{D}_{KL}(\\pi_\\theta \\|\\| \\pi_{ref}) = \\frac{\\pi_{ref}(o_i|q)}{\\pi_\\theta(o_i|q)} - \\log\\frac{\\pi_{ref}(o_i|q)}{\\pi_\\theta(o_i|q)} - 1 \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathbb">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span><span class="tag"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\pi_{ref}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是参考策略, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi></mrow><annotation encoding="application/x-tex">\\epsilon</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 是超参数, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">A_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是优势(advantage), 使用每组内对应输出的一组奖励 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">{</mo><msub><mi>r</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>r</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>r</mi><mi>G</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\{r_1, r_2, \\ldots, r_G\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span> 计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>A</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>r</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>r</mi><mi>G</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>r</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>r</mi><mi>G</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">A_i = \\frac{r_i - \\text{mean}(\\{r_1, r_2, \\cdots, r_G\\})}{\\text{std}(\\{r_1, r_2, \\cdots, r_G\\})} \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">std</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">})</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">mean</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">})</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>与 PPO 的关键区别在于: PPO 需要一个与策略模型同等规模的价值模型(value model)来估计优势, 而 GRPO 通过同一组内的相对奖励来计算优势, 从而完全省去了价值模型. 在 PPO 中, 优势通常通过 Generalized Advantage Estimation(GAE)计算, 这不仅基于奖励, 还依赖于学习的价值模型. 价值模型的训练目标是基于从开头到当前位置生成的 token 来预测从当前位置开始的预期累积奖励, 这本身就非常困难, 尤其是当只有最终结果奖励可用时. 随着输出长度增加, 模型更可能在生成过程中进行反思和修正, 这意味着最初生成的内容可能被后续修正或否定, 这使得基于部分响应预测最终奖励更加不可行.</p>
<p>另一个关键区别在于 KL 散度的处理方式. 在 GRPO 中, KL 散度的无偏估计器直接作为损失项加入(如式 (1) 所示), 而在 PPO 中, 每 token 的 KL 惩罚作为密集奖励在每一步加入. 由于 RL 的优化目标是最大化累积奖励, PPO 的方法会隐式惩罚累积 KL 散度, 这可能隐式惩罚响应长度, 从而阻止模型响应长度的增长. 此外, 在训练长思维链推理模型时, 训练策略可能与初始参考策略显著偏离, 因此我们会在实际训练过程中定期将参考策略更新为最新的策略模型.</p>
<blockquote>
<p>译者注: GRPO 的核心工程价值在于「砍掉价值模型」. 在 PPO 中, 价值模型通常与策略模型同等规模(如 660B), 这意味着训练时需要两倍的显存和计算资源. GRPO 通过组内相对评分来估计优势, 不仅节省了资源, 还避免了价值模型在长 CoT 场景下的估计困难. 附录中的实验表明, 即使将 PPO 的 GAE 参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>λ</mi></mrow><annotation encoding="application/x-tex">\\lambda</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span></span></span></span> 精细调至 1.0, 其性能也只能接近 GRPO, 且需要额外的超参搜索成本. 这是一个典型的「简单即美」的设计 —— 通过改变问题定义(从绝对值预测改为相对比较)来消除一个复杂组件.</p>
</blockquote>
<p>为了训练 DeepSeek-R1-Zero, 我们设置学习率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3\\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>, KL 系数为 0.001, rollout 采样温度为 1. 对于每个问题, 我们在 8200 步之前采样 16 个输出, 最大长度为 32768 个 token, 之后最大长度为 65536 个 token. 结果, DeepSeek-R1-Zero 的性能和响应长度在 8200 步时都出现显著提升, 训练持续共 10400 步, 对应 1.6 个训练 epoch. 每个训练步包含 32 个独立问题, 训练 batch size 为 512. 每 400 步, 我们用最新的策略模型替换参考模型. 为了加速训练, 每个 rollout 生成 8192 个输出, 随机分为 16 个 mini-batch, 仅训练单个 inner epoch.</p>
<h3 id="2-2-jlsj">2.2 奖励设计</h3>
<p>奖励是训练信号的来源, 决定了 RL 优化的方向. 对于 DeepSeek-R1-Zero, 我们采用基于规则的奖励, 为数学、代码和逻辑推理领域的数据提供精确的反馈. 我们的基于规则奖励系统主要由两种奖励组成: 准确性奖励和格式奖励.</p>
<p><strong>准确性奖励</strong> 评估响应是否正确. 例如, 对于具有确定性结果的数学问题, 模型被要求以指定格式(如框内)提供最终答案, 从而实现基于规则的可靠正确性验证. 类似地, 对于代码竞赛提示, 可以利用编译器根据一组预定义的测试用例来评估模型的响应, 从而生成关于正确性的客观反馈.</p>
<p><strong>格式奖励</strong> 通过强制执行特定的格式要求来补充准确性奖励模型. 具体而言, 模型被激励将其推理过程封装在指定的标签内, 即 <code>&lt;think&gt;</code> 和 <code>&lt;/think&gt;</code>. 这确保了模型的思维过程被明确界定, 增强了可解释性并便于后续分析.</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>Reward</mtext><mtext>rule</mtext></msub><mo>=</mo><msub><mtext>Reward</mtext><mtext>acc</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>format</mtext></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward}_{\\text{rule}} = \\text{Reward}_{\\text{acc}} + \\text{Reward}_{\\text{format}} \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rule</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">acc</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">format</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>准确性奖励和格式奖励以相同的权重组合.</p>
<p>值得注意的是, 我们避免将神经奖励模型 —— 无论是结果型(outcome-based)还是过程型(process-based) —— 应用于推理任务. 这一决定基于我们的观察: 神经奖励模型在大规模强化学习期间容易受到奖励黑客(reward hacking)的影响. 此外, 重新训练此类模型需要大量的计算资源, 并在训练流水线中引入额外的复杂性, 从而使整体优化过程复杂化.</p>
<blockquote>
<p>译者注: 这里的选择是反直觉的. 过程奖励模型(PRM)在 2024 年被广泛认为是提升数学推理的关键, 但 DeepSeek 明确拒绝了这一路线. 原因很务实: PRM 在大规模 RL 中不稳定, 且需要持续重训练. 基于规则的奖励虽然只能覆盖「可验证」的任务(数学、代码、逻辑), 但它提供了完美可靠的信号 —— 答案对就是对, 错就是错, 没有灰色地带. 这种「硬约束」恰恰是 RL 稳定训练的前提. 代价是奖励设计的工作量很大: 每个任务域都需要专门的验证器.</p>
</blockquote>
<h3 id="2-3-jl-llm-dtlnl">2.3 激励 LLM 的推理能力</h3>
<p>具体而言, 我们将 RL 技术应用于 DeepSeek-V3 Base 来训练 DeepSeek-R1-Zero. 在训练期间, 我们设计了一个简单的模板, 要求 DeepSeek-R1-Zero 首先产生推理过程, 然后给出最终答案. 我们有意将约束限制在这种结构格式上, 避免任何内容特定的偏见, 以确保我们能够准确观察模型在 RL 过程中的自然演进.</p>
<p>训练模板如下:</p>
<table>
<thead>
<tr>
<th>模板内容</th>
</tr>
</thead>
<tbody><tr>
<td>A conversation between User and Assistant. The user asks a question, and the Assistant solves it. The assistant first thinks about the reasoning process in the mind and then provides the user with the answer. The reasoning process and answer are enclosed within <code>&lt;think&gt;...&lt;/think&gt;</code> and <code>&lt;answer&gt;...&lt;/answer&gt;</code> tags, respectively, i.e., <code>&lt;think&gt;</code> reasoning process here <code>&lt;/think&gt;</code> <code>&lt;answer&gt;</code> answer here <code>&lt;/answer&gt;</code>. User: prompt. Assistant:</td>
</tr>
</tbody></table>
<p>图 1(a) 描绘了 DeepSeek-R1-Zero 在 AIME 2024 基准测试上的性能轨迹. AIME 2024 的平均 pass@1 分数从初始的 15.6% 显著提升至 77.9%. 此外, 通过利用自一致性解码(self-consistency decoding), 模型性能可以进一步提升至 86.7%. 这一性能显著超越了所有人类参赛者的平均表现.</p>
<blockquote>
<p>图 1: DeepSeek-R1-Zero 在训练期间的 AIME 准确率(a)和训练集上的平均响应长度(b). 模型自然地学会用更多思考时间来解决推理任务. 训练步指单次策略更新操作.</p>
</blockquote>
<p>除了数学竞赛, DeepSeek-R1-Zero 在编程竞赛和研究生级别的生物、物理、化学问题上也取得了显著的性能. 这些结果凸显了 RL 在增强大语言模型推理能力方面的有效性.</p>
<p>DeepSeek-R1-Zero 的自我进化展示了 RL 如何自主增强模型的推理能力.</p>
<p>如表 1 所示, DeepSeek-R1-Zero 的一个中间版本展示了一个有趣的「顿悟时刻」(aha moment). 模型学会了使用拟人化的语气重新思考.</p>
<blockquote>
<p>表 1: DeepSeek-R1-Zero 中间版本的一个有趣的「顿悟时刻」. 模型学会了使用拟人化的语气重新思考. 这也是我们的顿悟时刻, 让我们见证了强化学习的力量和美.</p>
</blockquote>
<table>
<thead>
<tr>
<th>问题与响应</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Question</strong>: If <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>a</mi><mo>&gt;</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">a &gt; 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>, then the sum of the real solutions of <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><mrow><mi>a</mi><mo>−</mo><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt></mrow></msqrt><mo>=</mo><mi>x</mi></mrow><annotation encoding="application/x-tex">\\sqrt{a - \\sqrt{a + x}} = x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.24em;vertical-align:-0.24em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span></span></span><span style="top:-2.96em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.24em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> is equal to</td>
</tr>
<tr>
<td><strong>Response</strong>: <code>&lt;think&gt;</code> To solve the equation <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><mrow><mi>a</mi><mo>−</mo><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt></mrow></msqrt><mo>=</mo><mi>x</mi></mrow><annotation encoding="application/x-tex">\\sqrt{a - \\sqrt{a + x}} = x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.24em;vertical-align:-0.24em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span></span></span><span style="top:-2.96em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.24em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>, let&#39;s start by squaring both <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⋯</mo></mrow><annotation encoding="application/x-tex">\\cdots</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.313em;"></span><span class="minner">⋯</span></span></span></span> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msqrt><mrow><mi>a</mi><mo>−</mo><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt></mrow></msqrt><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mtext>  </mtext><mo>⟹</mo><mtext>  </mtext><mi>a</mi><mo>−</mo><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">(\\sqrt{a - \\sqrt{a + x}})^2 = x^2 \\implies a - \\sqrt{a + x} = x^2.</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.25em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span></span></span><span style="top:-2.96em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.24em;"><span></span></span></span></span></span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8381em;vertical-align:-0.024em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">⟹</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.205em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mord">.</span></span></span></span> Rearrange to isolate the inner square root term: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>a</mi><mo>−</mo><msup><mi>x</mi><mn>2</mn></msup><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>=</mo><mi>a</mi><mo>+</mo><mi>x</mi><mtext>  </mtext><mo>⟹</mo><mtext>  </mtext><msup><mi>a</mi><mn>2</mn></msup><mo>−</mo><mn>2</mn><mi>a</mi><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><mo stretchy="false">(</mo><msup><mi>x</mi><mn>2</mn></msup><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>=</mo><mi>a</mi><mo>+</mo><mi>x</mi><mtext>  </mtext><mo>⟹</mo><mtext>  </mtext><msup><mi>x</mi><mn>4</mn></msup><mo>−</mo><mn>2</mn><mi>a</mi><msup><mi>x</mi><mn>2</mn></msup><mo>−</mo><mi>x</mi><mo>+</mo><mo stretchy="false">(</mo><msup><mi>a</mi><mn>2</mn></msup><mo>−</mo><mi>a</mi><mo stretchy="false">)</mo><mo>=</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">(a - x^2)^2 = a + x \\implies a^2 - 2ax^2 + (x^2)^2 = a + x \\implies x^4 - 2ax^2 - x + (a^2 - a) = 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.549em;vertical-align:-0.024em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">⟹</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mord mathnormal">a</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.549em;vertical-align:-0.024em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">⟹</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">4</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8974em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mord mathnormal">a</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">a</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>…</mo></mrow><annotation encoding="application/x-tex">\\ldots</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.123em;"></span><span class="minner">…</span></span></span></span> <strong>Wait, wait. Wait. That&#39;s an aha moment I can flag here.</strong> Let&#39;s reevaluate this step-by-step to identify if the correct sum can be <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⋯</mo></mrow><annotation encoding="application/x-tex">\\cdots</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.313em;"></span><span class="minner">⋯</span></span></span></span> We started with the equation: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><mrow><mi>a</mi><mo>−</mo><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt></mrow></msqrt><mo>=</mo><mi>x</mi></mrow><annotation encoding="application/x-tex">\\sqrt{a - \\sqrt{a + x}} = x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.24em;vertical-align:-0.24em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1em;"><span class="svg-align" style="top:-3.2em;"><span class="pstrut" style="height:3.2em;"></span><span class="mord" style="padding-left:1em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span></span></span><span style="top:-2.96em;"><span class="pstrut" style="height:3.2em;"></span><span class="hide-tail" style="min-width:1.02em;height:1.28em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.28em" viewBox="0 0 400000 1296" preserveAspectRatio="xMinYMin slice"><path d="M263,681c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l0 -0
c4.7,-7.3,11,-11,19,-11
H40000v40H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M1001 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.24em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> First, let&#39;s square both sides: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>a</mi><mo>−</mo><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup><mtext>  </mtext><mo>⟹</mo><mtext>  </mtext><msqrt><mrow><mi>a</mi><mo>+</mo><mi>x</mi></mrow></msqrt><mo>=</mo><mi>a</mi><mo>−</mo><msup><mi>x</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">a - \\sqrt{a + x} = x^2 \\implies \\sqrt{a + x} = a - x^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.205em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8381em;vertical-align:-0.024em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">⟹</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.205em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.835em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">x</span></span></span><span style="top:-2.795em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.205em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span> Next, I could square both sides again, treating the equation: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⋯</mo></mrow><annotation encoding="application/x-tex">\\cdots</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.313em;"></span><span class="minner">⋯</span></span></span></span> <code>&lt;/think&gt;</code></td>
</tr>
</tbody></table>
<p>如图 1(b) 所示, DeepSeek-R1-Zero 在整个训练过程中展现出稳定的思考时间增长, 这完全由内在适应驱动而非外部修改. 利用长 CoT, 模型逐步改进其推理, 生成数百到数千个 token 来探索和优化其问题求解策略.</p>
<p>思考时间的增加促进了复杂行为的自主发展. 具体而言, DeepSeek-R1-Zero 越来越多地展现出高级推理策略, 如反思性推理(reflective reasoning)和系统性地探索替代方案. 值得注意的是, 在训练期间, DeepSeek-R1-Zero 展现了一个「顿悟时刻」, 其特征是在反思期间「wait」一词的使用突然增加. 这一时刻标志着推理模式的明显变化, 清楚地展示了 DeepSeek-R1-Zero 的自我进化过程.</p>
<p>DeepSeek-R1-Zero 的自我进化凸显了 RL 的力量和美: 与其明确地教模型如何解决问题, 我们只需提供正确的激励, 它就会自主发展出高级的问题解决策略. 这提醒我们 RL 在解锁 LLM 更高层次能力方面的潜力, 为未来更自主和自适应的模型铺平了道路.</p>
<blockquote>
<p>译者注: 「顿悟时刻」是这篇论文最具传播力的发现. 它没有出现在训练目标中, 也没有被人类标注者引导 —— 模型自己学会了在推理过程中停下来, 质疑之前的步骤, 然后重新评估. 这种行为的出现, 本质上是因为 RL 奖励信号只关心最终答案的正确性, 而不限制中间过程. 当模型发现「重新检查」能提高正确率时, 这种行为就被 RL 正向选择了. 这与人类学习数学时的「验算」行为异曲同工, 但它是从统计优化中自发涌现的, 而非被明确编码的.</p>
</blockquote>
<hr>
<h2 id="3-deep-seek-r1-djddqdtlmx">3. DeepSeek-R1: 多阶段对齐的推理模型</h2>
<p>尽管 DeepSeek-R1-Zero 展现出强大的推理能力, 但它面临几个问题: 可读性差、语言混合. 由于 DeepSeek-V3-Base 在多种语言上训练, 尤其是英语和中文, DeepSeek-R1-Zero 偶尔会在单个思维链响应中混合使用英语和中文. 此外, DeepSeek-R1-Zero 基于规则的 RL 训练阶段 narrowly focused on 推理任务, 导致在写作和开放域问答等更广泛领域性能有限.</p>
<p>为了解决这些问题, 我们开发了 DeepSeek-R1, 其流水线如图 2 所示. 在初始阶段, 我们收集了数千条展示对话式、人类对齐思维过程的冷启动数据. 然后应用 RL 训练来提升模型性能, 同时保持对话式思维过程和语言一致性. 随后, 我们再次应用拒绝采样和 SFT. 这一阶段将推理和非推理数据集都纳入 SFT 过程, 使模型不仅在推理任务上表现出色, 还展现出高级写作能力. 为了进一步将模型与人类偏好对齐, 我们实现了第二阶段的 RL, 旨在增强模型的有用性和无害性, 同时精化其推理能力.</p>
<blockquote>
<p>图 2: DeepSeek-R1 的多阶段流水线. DeepSeek-V3 Base 和 DeepSeek-V3 的详细背景见附录. DeepSeek-R1 Dev1、Dev2 和 Dev3 代表该流水线中的中间Checkpoint.</p>
</blockquote>
<h3 id="3-1-jymxdjl">3.1 基于模型的奖励</h3>
<p>对于通用数据, 我们借助奖励模型来捕捉复杂和微妙场景中的人类偏好. 我们基于 DeepSeek-V3 流水线构建, 采用类似的偏好对分布和训练提示分布.</p>
<p><strong>有用性奖励模型(Helpful Reward Model)</strong> 的训练, 我们首先通过使用 arena-hard 提示格式向 DeepSeek-V3 查询来生成偏好对, 其中每对包含一个用户查询和两个候选响应. 对于每个偏好对, 我们向 DeepSeek-V3 查询四次, 随机分配响应为 Response A 或 Response B 以减轻位置偏差. 最终偏好分数由四次独立判断的平均值确定, 仅保留分数差(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi></mrow><annotation encoding="application/x-tex">\\Delta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span></span></span></span>)超过 1 的对以确保有意义的区分. 此外, 为了最小化与长度相关的偏差, 我们确保整个数据集中被选择和被拒绝的响应具有可比的长度. 总共, 我们策划了 66000 条数据对用于训练奖励模型. 奖励模型的架构与 DeepSeek-R1 一致, 增加了用于预测标量偏好分数的奖励头.</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>Reward</mtext><mtext>helpful</mtext></msub><mo>=</mo><msub><mtext>RM</mtext><mtext>helpful</mtext></msub><mo stretchy="false">(</mo><msub><mtext>Response</mtext><mi>A</mi></msub><mo separator="true">,</mo><msub><mtext>Response</mtext><mi>B</mi></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward}_{\\text{helpful}} = \\text{RM}_{\\text{helpful}}(\\text{Response}_A, \\text{Response}_B) \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">helpful</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">RM</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">helpful</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">Response</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2342em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">A</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Response</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2342em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><p>有用性奖励模型以 batch size 256、学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6\\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 训练一个 epoch. 训练期间最大序列长度为 8192 个 token, 而奖励模型推理时没有明确的长度限制.</p>
<p><strong>安全性奖励模型(Safety Reward Model)</strong> 用于评估和改进模型安全性. 我们策划了一个包含 106000 个提示的数据集, 模型生成的响应根据预定义的安全指南被标注为「安全」或「不安全」. 与有用性奖励模型使用的成对损失不同, 安全性奖励模型采用点式(point-wise)方法来区分安全和危险响应. 训练超参数与有用性奖励模型相同.</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>Reward</mtext><mtext>safety</mtext></msub><mo>=</mo><msub><mtext>RM</mtext><mtext>safety</mtext></msub><mo stretchy="false">(</mo><mtext>Response</mtext><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(6)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward}_{\\text{safety}} = \\text{RM}_{\\text{safety}}(\\text{Response}) \\tag{6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">safety</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">RM</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">safety</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Response</span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">6</span></span><span class="mord">)</span></span></span></span></span></span><p>对于通用查询, 每个实例被归类为属于安全性数据集或有用性数据集. 分配给每个查询的通用奖励 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mtext>Reward</mtext><mtext>General</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Reward}_{\\text{General}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">General</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 对应于相关数据集中定义的相应奖励.</p>
<blockquote>
<p>译者注: DeepSeek-R1 没有使用单一奖励模型, 而是分离了「有用性」和「安全性」两个维度. 这是 RLHF 的标准做法(InstructGPT 即采用此模式), 但 DeepSeek 在这里做了一个关键调整: 有用性评估只关注最终摘要, 而不干扰底层推理过程; 安全性评估则覆盖整个响应, 包括推理过程和摘要. 这种设计反映了「推理自由, 输出受控」的哲学 —— 模型可以在思维链中自由探索, 但最终输出必须符合安全标准.</p>
</blockquote>
<h3 id="3-2-xlxj">3.2 训练细节</h3>
<h4 id="3-2-1-dyjd-rl-dxlxj">3.2.1 第一阶段 RL 的训练细节</h4>
<p>在第一阶段 RL 中, 我们设置学习率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3\\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>, KL 系数为 0.001, GRPO clip ratio <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi></mrow><annotation encoding="application/x-tex">\\epsilon</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span></span></span></span> 为 10, rollout 采样温度为 1. 对于每个问题, 我们采样 16 个输出, 最大长度为 32768. 每个训练步包含 32 个独立问题, 训练 batch size 为 512. 每 400 步, 用最新策略模型替换参考模型. 每个 rollout 生成 8192 个输出, 随机分为 16 个 mini-batch, 仅训练单个 inner epoch.</p>
<p>为了缓解语言混合问题, 我们在 RL 训练期间引入了语言一致性奖励, 计算为 CoT 中目标语言词汇的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>Reward</mtext><mtext>language</mtext></msub><mo>=</mo><mfrac><mrow><mtext>Num</mtext><mo stretchy="false">(</mo><msub><mtext>Words</mtext><mtext>target</mtext></msub><mo stretchy="false">)</mo></mrow><mrow><mtext>Num</mtext><mo stretchy="false">(</mo><mtext>Words</mtext><mo stretchy="false">)</mo></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(7)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward}_{\\text{language}} = \\frac{\\text{Num}(\\text{Words}_{\\text{target}})}{\\text{Num}(\\text{Words})} \\tag{7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Num</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Words</span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Num</span></span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">Words</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">target</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">7</span></span><span class="mord">)</span></span></span></span></span></span><p>附录中的消融实验表明, 这种对齐导致模型性能轻微下降, 但该奖励符合人类偏好, 使输出更可读. 我们将语言一致性奖励同时应用于推理和非推理数据, 直接将其加入最终奖励.</p>
<p>值得注意的是, clip ratio 在训练中起着关键作用. 较低的值可能导致大量 token 的梯度被截断, 从而降低模型性能; 较高的值可能导致训练不稳定.</p>
<h4 id="3-2-2-dejd-rl-dxlxj">3.2.2 第二阶段 RL 的训练细节</h4>
<p>具体而言, 我们使用组合奖励信号和多样化的提示分布来训练模型. 对于推理数据, 我们遵循 DeepSeek-R1-Zero 的方法, 采用基于规则的奖励来指导数学、代码和逻辑推理领域的学习. 对于通用数据, 我们利用奖励模型来指导训练. 最终, 奖励信号与多样化数据分布的整合使我们能够开发出一个不仅在推理上表现出色, 而且优先考虑有用性和无害性的模型.</p>
<p>给定一批数据, 奖励可以形式化为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Reward</mtext><mo>=</mo><msub><mtext>Reward</mtext><mtext>reasoning</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>general</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>language</mtext></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(8)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward} = \\text{Reward}_{\\text{reasoning}} + \\text{Reward}_{\\text{general}} + \\text{Reward}_{\\text{language}} \\tag{8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Reward</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reasoning</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">general</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">8</span></span><span class="mord">)</span></span></span></span></span></span><p>其中:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>Reward</mtext><mtext>reasoning</mtext></msub><mo>=</mo><msub><mtext>Reward</mtext><mtext>rule</mtext></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(9)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward}_{\\text{reasoning}} = \\text{Reward}_{\\text{rule}} \\tag{9}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reasoning</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rule</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">9</span></span><span class="mord">)</span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mtext>Reward</mtext><mtext>general</mtext></msub><mo>=</mo><msub><mtext>Reward</mtext><mtext>reward_model</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>format</mtext></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(10)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Reward}_{\\text{general}} = \\text{Reward}_{\\text{reward\\_model}} + \\text{Reward}_{\\text{format}} \\tag{10}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">general</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0614em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reward_model</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">format</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.117em;vertical-align:-0.367em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">10</span></span><span class="mord">)</span></span></span></span></span></span><p>第二阶段 RL 保留了第一阶段的大部分参数, 关键区别是将温度降低至 0.7, 因为我们发现此阶段较高的温度会导致不连贯的生成. 该阶段共 1700 个训练步, 其中通用指令数据和基于偏好的奖励仅在最后 400 步中加入. 我们发现, 使用基于模型的偏好奖励信号进行更多训练步可能导致奖励黑客, 这在附录中有记录. 总训练成本见附录.</p>
<hr>
<h2 id="4-sy">4. 实验</h2>
<h3 id="4-1-sysz">4.1 实验设置</h3>
<p>我们在 MMLU、MMLU-Redux、MMLU-Pro、C-Eval、CMMLU、IF-Eval、FRAMES、GPQA Diamond、SimpleQA、C-SimpleQA、SWE-Bench Verified、Aider、LiveCodeBench(2024-08 至 2025-01)、Codeforces、CNMO 2024 和 AIME 2024 上评估模型.</p>
<p>我们将最大生成长度设置为 32768 个 token. 我们发现使用贪心解码来评估长输出推理模型会导致更高的重复率和不同Checkpoint之间的显著差异. 因此, 我们默认采用 pass@<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 评估, 并使用非零温度报告 pass@1. 具体而言, 我们使用采样温度 0.6 和 top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>p</mi></mrow><annotation encoding="application/x-tex">p</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">p</span></span></span></span> 值 0.95 为每个问题生成 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个响应(通常在 4 到 64 之间, 取决于测试集大小). 对于 AIME 和 GPQA, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>64</mn></mrow><annotation encoding="application/x-tex">k=64</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">64</span></span></span></span>; 对于 MATH 和 Codeforces, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>16</mn></mrow><annotation encoding="application/x-tex">k=16</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">16</span></span></span></span>; 对于 LCB, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">k=8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span>. pass@1 计算为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>pass@1</mtext><mo>=</mo><mfrac><mn>1</mn><mi>k</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>k</mi></munderover><msub><mi>p</mi><mi>i</mi></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(11)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{pass@1} = \\frac{1}{k} \\sum_{i=1}^{k} p_i \\tag{11}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">pass@1</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:3.1138em;vertical-align:-1.2777em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">11</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>p</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">p_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个响应的正确性.</p>
<p>对于 AIME 2024, 我们还使用 64 个样本报告共识(多数投票)结果, 记为 cons@64.</p>
<p>基线模型包括 DeepSeek-V3、Claude-Sonnet-3.5-1022、GPT-4o-0513、OpenAI-o1-mini 和 OpenAI-o1-1217. 由于在中国大陆访问 OpenAI-o1-1217 API 存在困难, 其性能基于官方报告.</p>
<blockquote>
<p>译者注: 使用非零温度进行 pass@1 评估是一个重要的方法论选择. 传统评估通常使用贪心解码(温度=0)来计算 pass@1, 但 DeepSeek 发现这会导致约 5% 的性能波动, 且不能准确反映模型的真实性能. 这是因为长 CoT 推理模型在贪心解码下更容易陷入重复模式. 采用温度 0.6 的采样平均, 相当于在评估时引入了「推理多样性」的考量 —— 一个优秀的推理模型不应该只在最优路径上表现好, 而应该在多条合理的推理路径上都有高成功率.</p>
</blockquote>
<h3 id="4-2-zyjg">4.2 主要结果</h3>
<p>表 2 总结了 DeepSeek-R1 在多个开发阶段的性能, 如图 2 所示.</p>
<blockquote>
<p>表 2: DeepSeek-R1 各阶段的实验结果. 加粗数字表示性能具有统计显著性(t-test, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>p</mi><mo>&lt;</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">p &lt; 0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">p</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>).</p>
</blockquote>
<table>
<thead>
<tr>
<th>领域</th>
<th>基准测试(指标)</th>
<th>R1-Zero</th>
<th>R1-Dev1</th>
<th>R1-Dev2</th>
<th>R1-Dev3</th>
<th>R1</th>
</tr>
</thead>
<tbody><tr>
<td>英文</td>
<td>MMLU(EM)</td>
<td>88.8</td>
<td>89.1</td>
<td>91.2</td>
<td>91.0</td>
<td>90.8</td>
</tr>
<tr>
<td>英文</td>
<td>MMLU-Redux(EM)</td>
<td>85.6</td>
<td>90.0</td>
<td>93.0</td>
<td>93.1</td>
<td>92.9</td>
</tr>
<tr>
<td>英文</td>
<td>MMLU-Pro(EM)</td>
<td>68.9</td>
<td>74.1</td>
<td>83.8</td>
<td>83.1</td>
<td>84.0</td>
</tr>
<tr>
<td>英文</td>
<td>DROP(3-shot F1)</td>
<td>89.1</td>
<td>89.8</td>
<td>91.1</td>
<td>88.7</td>
<td>92.2</td>
</tr>
<tr>
<td>英文</td>
<td>IF-Eval(Prompt Strict)</td>
<td>46.6</td>
<td>71.7</td>
<td>72.0</td>
<td>78.1</td>
<td>83.3</td>
</tr>
<tr>
<td>英文</td>
<td>GPQA Diamond(Pass@1)</td>
<td>75.8</td>
<td>66.1</td>
<td>70.7</td>
<td>71.2</td>
<td>71.5</td>
</tr>
<tr>
<td>英文</td>
<td>SimpleQA(Correct)</td>
<td>30.3</td>
<td>17.8</td>
<td>28.2</td>
<td>24.9</td>
<td>30.1</td>
</tr>
<tr>
<td>英文</td>
<td>FRAMES(Acc.)</td>
<td>82.3</td>
<td>78.5</td>
<td>81.8</td>
<td>81.9</td>
<td>82.5</td>
</tr>
<tr>
<td>英文</td>
<td>AlpacaEval2.0(LC-winrate)</td>
<td>24.7</td>
<td>50.1</td>
<td>55.8</td>
<td>62.1</td>
<td>87.6</td>
</tr>
<tr>
<td>英文</td>
<td>ArenaHard(GPT-4-1106)</td>
<td>53.6</td>
<td>77.0</td>
<td>73.2</td>
<td>75.6</td>
<td>92.3</td>
</tr>
<tr>
<td>代码</td>
<td>LiveCodeBench(Pass@1-COT)</td>
<td>50.0</td>
<td>57.5</td>
<td>63.5</td>
<td>64.6</td>
<td>65.9</td>
</tr>
<tr>
<td>代码</td>
<td>Codeforces(Percentile)</td>
<td>80.4</td>
<td>84.5</td>
<td>90.5</td>
<td>92.1</td>
<td>96.3</td>
</tr>
<tr>
<td>代码</td>
<td>Codeforces(Rating)</td>
<td>1444</td>
<td>1534</td>
<td>1687</td>
<td>1746</td>
<td>2029</td>
</tr>
<tr>
<td>代码</td>
<td>SWE Verified(Resolved)</td>
<td>43.2</td>
<td>39.6</td>
<td>44.6</td>
<td>45.6</td>
<td>49.2</td>
</tr>
<tr>
<td>代码</td>
<td>Aider-Polyglot(Acc.)</td>
<td>12.2</td>
<td>6.7</td>
<td>25.6</td>
<td>44.8</td>
<td>53.3</td>
</tr>
<tr>
<td>数学</td>
<td>AIME 2024(Pass@1)</td>
<td>77.9</td>
<td>59.0</td>
<td>74.0</td>
<td>78.1</td>
<td>79.8</td>
</tr>
<tr>
<td>数学</td>
<td>MATH-500(Pass@1)</td>
<td>95.9</td>
<td>94.2</td>
<td>95.9</td>
<td>95.4</td>
<td>97.3</td>
</tr>
<tr>
<td>数学</td>
<td>CNMO 2024(Pass@1)</td>
<td>88.1</td>
<td>58.0</td>
<td>73.9</td>
<td>77.3</td>
<td>78.8</td>
</tr>
<tr>
<td>中文</td>
<td>CLUEWSC(EM)</td>
<td>93.1</td>
<td>92.8</td>
<td>92.6</td>
<td>91.6</td>
<td>92.8</td>
</tr>
<tr>
<td>中文</td>
<td>C-Eval(EM)</td>
<td>92.8</td>
<td>85.7</td>
<td>91.9</td>
<td>86.4</td>
<td>91.8</td>
</tr>
<tr>
<td>中文</td>
<td>C-SimpleQA(Correct)</td>
<td>66.4</td>
<td>58.8</td>
<td>64.2</td>
<td>66.9</td>
<td>63.7</td>
</tr>
</tbody></table>
<p>DeepSeek-R1-Zero 与 DeepSeek-R1 Dev1 的比较揭示了在指令遵循方面的实质性改进, IF-Eval 和 ArenaHard 基准测试上的更高分数证明了这一点. 然而, 由于冷启动数据集规模有限, Dev1 在推理性能上相比 DeepSeek-R1-Zero 出现部分退化, 最显著的是在 AIME 基准测试上. 相比之下, DeepSeek-R1 Dev2 在需要高级推理技能的基准测试上展现出显著的性能提升, 包括代码生成、数学问题求解和 STEM 相关任务. 针对通用任务的基准测试(如 AlpacaEval 2.0)显示边际改善. 这些结果表明, 面向推理的 RL 显著增强了推理能力, 而对用户偏好导向的基准测试影响有限.</p>
<p>DeepSeek-R1 Dev3 将推理和非推理数据集都纳入 SFT 流水线, 从而增强了模型在推理和通用语言生成任务上的熟练度. 与 Dev2 相比, DeepSeek-R1 Dev3 在 AlpacaEval 2.0 和 Aider-Polyglot 上取得了显著的性能提升, 这归因于大规模非推理语料库和代码工程数据集的加入. 最后, 在 DeepSeek-R1 Dev3 上使用混合推理导向和通用数据进行全面的 RL 训练, 产生了最终的 DeepSeek-R1. 代码和数学基准测试的边际改善发生在之前的阶段, 因为大量推理特定的 RL 已在前期完成. DeepSeek-R1 的主要进步在于通用指令遵循和用户偏好基准测试, AlpacaEval 2.0 提升了 25%, ArenaHard 提升了 17%.</p>
<blockquote>
<p>译者注: 这个 staged development 的过程非常有信息量. R1-Zero 纯 RL 模型在推理任务上很强(AIME 77.9%, MATH-500 95.9%), 但在通用任务上很弱(IF-Eval 46.6%, AlpacaEval 24.7%). Dev1 加入少量冷启动数据后, 通用能力大幅提升, 但推理能力反而下降了 —— 这说明冷启动数据的「人类先验」确实会限制模型的推理探索空间. Dev2 通过大规模推理 RL 恢复了推理能力. Dev3 加入非推理数据后, 通用能力再次飞跃. 最终 R1 是一个「推理 + 通用」的均衡模型. 这个渐进过程本身反驳了「SFT 有害」的极端观点: SFT 本身不是问题, 问题是 SFT 的时机和规模.</p>
</blockquote>
<p>表 3 展示了 DeepSeek-R1 与其他代表性模型的全面对比.</p>
<blockquote>
<p>表 3: DeepSeek-R1 与其他代表性模型的对比. 加粗数字表示性能具有统计显著性(t-test, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>p</mi><mo>&lt;</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">p &lt; 0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">p</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>).</p>
</blockquote>
<table>
<thead>
<tr>
<th>基准测试(指标)</th>
<th>Claude-3.5-Sonnet-1022</th>
<th>GPT-4o-0513</th>
<th>DeepSeek-V3</th>
<th>OpenAI-o1-mini</th>
<th>OpenAI-o1-1217</th>
<th>DeepSeek-R1</th>
</tr>
</thead>
<tbody><tr>
<td>架构</td>
<td>-</td>
<td>-</td>
<td>MoE</td>
<td>-</td>
<td>-</td>
<td>MoE</td>
</tr>
<tr>
<td>激活参数</td>
<td>-</td>
<td>-</td>
<td>37B</td>
<td>-</td>
<td>-</td>
<td>37B</td>
</tr>
<tr>
<td>总参数</td>
<td>-</td>
<td>-</td>
<td>671B</td>
<td>-</td>
<td>-</td>
<td>671B</td>
</tr>
<tr>
<td><strong>英文</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>MMLU(EM)</td>
<td>88.3</td>
<td>87.2</td>
<td>88.5</td>
<td>85.2</td>
<td>91.8</td>
<td>90.8</td>
</tr>
<tr>
<td>MMLU-Redux(EM)</td>
<td>88.9</td>
<td>88.0</td>
<td>89.1</td>
<td>86.7</td>
<td>-</td>
<td>92.9</td>
</tr>
<tr>
<td>MMLU-Pro(EM)</td>
<td>78.0</td>
<td>72.6</td>
<td>75.9</td>
<td>80.3</td>
<td>-</td>
<td>84.0</td>
</tr>
<tr>
<td>DROP(3-shot F1)</td>
<td>88.3</td>
<td>83.7</td>
<td>91.6</td>
<td>83.9</td>
<td>90.2</td>
<td>92.2</td>
</tr>
<tr>
<td>IF-Eval(Prompt Strict)</td>
<td>86.5</td>
<td>84.3</td>
<td>86.1</td>
<td>84.8</td>
<td>-</td>
<td>83.3</td>
</tr>
<tr>
<td>GPQA Diamond(Pass@1)</td>
<td>65.0</td>
<td>49.9</td>
<td>59.1</td>
<td>60.0</td>
<td>75.7</td>
<td>71.5</td>
</tr>
<tr>
<td>SimpleQA(Correct)</td>
<td>28.4</td>
<td>38.2</td>
<td>24.9</td>
<td>7.0</td>
<td>47.0</td>
<td>30.1</td>
</tr>
<tr>
<td>FRAMES(Acc.)</td>
<td>72.5</td>
<td>80.5</td>
<td>73.3</td>
<td>76.9</td>
<td>-</td>
<td>82.5</td>
</tr>
<tr>
<td>AlpacaEval2.0(LC-winrate)</td>
<td>52.0</td>
<td>51.1</td>
<td>70.0</td>
<td>57.8</td>
<td>-</td>
<td>87.6</td>
</tr>
<tr>
<td>ArenaHard(GPT-4-1106)</td>
<td>85.2</td>
<td>80.4</td>
<td>85.5</td>
<td>92.0</td>
<td>-</td>
<td>92.3</td>
</tr>
<tr>
<td><strong>代码</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>LiveCodeBench(Pass@1-COT)</td>
<td>38.9</td>
<td>32.9</td>
<td>36.2</td>
<td>53.8</td>
<td>63.4</td>
<td>65.9</td>
</tr>
<tr>
<td>Codeforces(Percentile)</td>
<td>20.3</td>
<td>23.6</td>
<td>58.7</td>
<td>93.4</td>
<td>96.6</td>
<td>96.3</td>
</tr>
<tr>
<td>Codeforces(Rating)</td>
<td>717</td>
<td>759</td>
<td>1134</td>
<td>1820</td>
<td>2061</td>
<td>2029</td>
</tr>
<tr>
<td>SWE Verified(Resolved)</td>
<td>50.8</td>
<td>38.8</td>
<td>42.0</td>
<td>41.6</td>
<td>48.9</td>
<td>49.2</td>
</tr>
<tr>
<td>Aider-Polyglot(Acc.)</td>
<td>45.3</td>
<td>16.0</td>
<td>49.6</td>
<td>32.9</td>
<td>61.7</td>
<td>53.3</td>
</tr>
<tr>
<td><strong>数学</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>AIME 2024(Pass@1)</td>
<td>16.0</td>
<td>9.3</td>
<td>39.2</td>
<td>63.6</td>
<td>79.2</td>
<td>79.8</td>
</tr>
<tr>
<td>MATH-500(Pass@1)</td>
<td>78.3</td>
<td>74.6</td>
<td>90.2</td>
<td>90.0</td>
<td>96.4</td>
<td>97.3</td>
</tr>
<tr>
<td>CNMO 2024(Pass@1)</td>
<td>13.1</td>
<td>10.8</td>
<td>43.2</td>
<td>67.6</td>
<td>-</td>
<td>78.8</td>
</tr>
<tr>
<td><strong>中文</strong></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr>
<td>CLUEWSC(EM)</td>
<td>85.4</td>
<td>87.9</td>
<td>90.9</td>
<td>89.9</td>
<td>-</td>
<td>92.8</td>
</tr>
<tr>
<td>C-Eval(EM)</td>
<td>76.7</td>
<td>76.0</td>
<td>86.5</td>
<td>68.9</td>
<td>-</td>
<td>91.8</td>
</tr>
<tr>
<td>C-SimpleQA(Correct)</td>
<td>55.4</td>
<td>58.7</td>
<td>68.0</td>
<td>40.3</td>
<td>-</td>
<td>63.7</td>
</tr>
</tbody></table>
<p>在教育导向的知识基准测试(如 MMLU、MMLU-Pro 和 GPQA Diamond)上, DeepSeek-R1 相比 DeepSeek-V3 展现出卓越的性能. 这一改进主要归因于 STEM 相关问题准确率的提升, 其中大规模 RL 带来了显著的增益. 此外, DeepSeek-R1 在 FRAMES(长上下文依赖 QA 任务)上表现出色, 展示了其强大的文档分析能力. 这凸显了推理模型在 AI 驱动的搜索和数据分析任务中的潜力.</p>
<p>DeepSeek-R1 在 IF-Eval(评估模型遵循格式指令能力的基准测试)上也提供了令人印象深刻的结果. 这些改进可以与在 SFT 和 RL 训练最后阶段包含指令遵循数据相关联. 此外, 在 AlpacaEval 2.0 和 ArenaHard 上观察到了出色的性能, 表明 DeepSeek-R1 在写作任务和开放域问答方面的优势.</p>
<p>在数学任务方面, DeepSeek-R1 的性能与 OpenAI-o1-1217 相当, 大大超过其他模型. 在编码算法任务(如 LiveCodeBench 和 Codeforces)上观察到类似的趋势, 其中以推理为中心的模型在这些基准测试中占据主导地位. 在面向工程的编码任务上, OpenAI-o1-1217 在 Aider 上的性能优于 DeepSeek-R1, 但在 SWE Verified 上实现了相当的性能. 我们相信 DeepSeek-R1 的工程性能将在下一个版本中得到提升, 因为目前相关的 RL 训练数据量仍然非常有限.</p>
<p>图 3 展示了 DeepSeek-R1 与 DeepSeek-R1-Zero 和人类参与者在多个基准竞赛上的性能对比.</p>
<blockquote>
<p>图 3: DeepSeek-R1 和 DeepSeek-R1-Zero 与人类参与者在不同数据集上的基准性能对比. 对于 AIME 和 Codeforces, 人类分数代表所有人类参赛者的平均表现. 对于 GPQA, 人类分数对应具有网络访问权限的博士级个人.</p>
</blockquote>
<h3 id="4-3-zl-rxmxhdtlnl">4.3 蒸馏: 让小模型获得推理能力</h3>
<p>我们证明, 较大模型的推理模式可以提炼到较小的模型中, 与通过 RL 在小型模型上发现的推理模式相比, 性能更好. 使用 DeepSeek-R1 生成的推理数据, 我们微调了研究界广泛使用的几个密集模型. 评估结果表明, 蒸馏的较小密集模型在基准上表现非常出色.</p>
<p>表 4 展示了蒸馏模型与其他可比较模型在推理相关基准测试上的对比.</p>
<blockquote>
<p>表 4: DeepSeek-R1 蒸馏模型与其他可比较模型在推理相关基准测试上的对比. 加粗数字表示性能具有统计显著性(t-test, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>p</mi><mo>&lt;</mo><mn>0.01</mn></mrow><annotation encoding="application/x-tex">p &lt; 0.01</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">p</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.01</span></span></span></span>).</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>AIME 2024 pass@1</th>
<th>AIME 2024 cons@64</th>
<th>MATH-500 pass@1</th>
<th>GPQA Diamond pass@1</th>
<th>LiveCodeBench pass@1</th>
<th>Codeforces rating</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4o-0513</td>
<td>9.3</td>
<td>13.4</td>
<td>74.6</td>
<td>49.9</td>
<td>32.9</td>
<td>759</td>
</tr>
<tr>
<td>Claude-3.5-Sonnet-1022</td>
<td>16.0</td>
<td>26.7</td>
<td>78.3</td>
<td>65.0</td>
<td>38.9</td>
<td>717</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-1.5B</td>
<td>28.9</td>
<td>52.7</td>
<td>83.9</td>
<td>33.8</td>
<td>16.9</td>
<td>954</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-7B</td>
<td>55.5</td>
<td>83.3</td>
<td>92.8</td>
<td>49.1</td>
<td>37.6</td>
<td>1189</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-14B</td>
<td>69.7</td>
<td>80.0</td>
<td>93.9</td>
<td>59.1</td>
<td>53.1</td>
<td>1481</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-32B</td>
<td>72.6</td>
<td>83.3</td>
<td>94.3</td>
<td>62.1</td>
<td>57.2</td>
<td>1691</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Llama-8B</td>
<td>50.4</td>
<td>80.0</td>
<td>89.1</td>
<td>49.0</td>
<td>39.6</td>
<td>1205</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Llama-70B</td>
<td>70.0</td>
<td>86.7</td>
<td>94.5</td>
<td>65.2</td>
<td>57.5</td>
<td>1633</td>
</tr>
</tbody></table>
<p>DeepSeek-R1-Distill-Qwen-7B 在 AIME 2024 上取得了 55.5%, 超越了 QwQ-32B-Preview. 此外, DeepSeek-R1-Distill-Qwen-32B 在 AIME 2024 上的得分为 72.6%, 在 MATH-500 上为 94.3%, 在 LiveCodeBench 上为 57.2%. 这些结果明显优于以前的开源模型, 可与 o1-mini 相媲美.</p>
<p>表 5 对比了蒸馏和纯 RL 在 Qwen-32B 上的效果.</p>
<blockquote>
<p>表 5: 蒸馏模型与纯 RL 模型在推理相关基准测试上的对比.</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>AIME 2024 pass@1</th>
<th>AIME 2024 cons@64</th>
<th>MATH-500 pass@1</th>
<th>GPQA Diamond pass@1</th>
<th>LiveCodeBench pass@1</th>
</tr>
</thead>
<tbody><tr>
<td>QwQ-32B-Preview</td>
<td>50.0</td>
<td>60.0</td>
<td>90.6</td>
<td>54.5</td>
<td>41.9</td>
</tr>
<tr>
<td>Qwen2.5-32B-Zero(纯 RL)</td>
<td>47.0</td>
<td>60.0</td>
<td>91.6</td>
<td>55.0</td>
<td>40.2</td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-32B</td>
<td>72.6</td>
<td>83.3</td>
<td>94.3</td>
<td>62.1</td>
<td>57.2</td>
</tr>
</tbody></table>
<p>这一对比揭示了一个重要发现: 在相同基础模型(Qwen-32B)上, 蒸馏版本(72.6% on AIME)显著优于纯 RL 版本(47.0% on AIME). 这表明, 对于中小型模型, 从强教师模型蒸馏高质量推理数据, 比让模型自己通过 RL 探索推理策略更有效.</p>
<blockquote>
<p>译者注: 蒸馏实验是这篇论文最具实际价值的部分之一. 它回答了一个关键问题: 小模型能否通过纯 RL 获得与蒸馏相当的推理能力? 答案是「不能」 —— 至少在目前的技术条件下. 表 5 的数据显示, 即使是 32B 规模的模型, 纯 RL 训练(AIME 47.0%)也远不如从 R1 蒸馏(AIME 72.6%). 这意味着推理能力的涌现可能需要足够的模型容量作为前提. 对于资源有限的研究者, 蒸馏是获得推理能力的最有效途径. 这也解释了为什么 DeepSeek 选择开源 6 个蒸馏模型(1.5B 到 70B) —— 它们为社区提供了立即可用的推理能力, 而不需要昂贵的 RL 基础设施.</p>
</blockquote>
<p>蒸馏模型的配置和初始学习率见表 6.</p>
<blockquote>
<p>表 6: DeepSeek-R1 蒸馏模型、对应的基础模型和初始学习率.</p>
</blockquote>
<table>
<thead>
<tr>
<th>蒸馏模型</th>
<th>基础模型</th>
<th>初始学习率</th>
</tr>
</thead>
<tbody><tr>
<td>DeepSeek-R1-Distill-Qwen-1.5B</td>
<td>Qwen2.5-Math-1.5B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1\\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-7B</td>
<td>Qwen2.5-Math-7B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">8\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-14B</td>
<td>Qwen2.5-14B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Qwen-32B</td>
<td>Qwen2.5-32B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>6</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">6\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Llama-8B</td>
<td>Llama-3.1-8B</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>DeepSeek-R1-Distill-Llama-70B</td>
<td>Llama-3.3-70B-Instruct</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
</tbody></table>
<h3 id="4-4-xlcb">4.4 训练成本</h3>
<p>表 7 列出了 DeepSeek-R1 的训练成本, 假设 H800 的租赁价格为每小时 2 美元.</p>
<blockquote>
<p>表 7: DeepSeek-R1 的训练成本.</p>
</blockquote>
<table>
<thead>
<tr>
<th>训练成本</th>
<th>R1-Zero</th>
<th>SFT 数据创建</th>
<th>R1</th>
<th>总计</th>
</tr>
</thead>
<tbody><tr>
<td>H800 GPU 小时</td>
<td>101K</td>
<td>5K</td>
<td>41K</td>
<td>147K</td>
</tr>
<tr>
<td>美元</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>202</mn><mi>K</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">202K |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">202</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord">∣</span></span></span></span>10K</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>82</mn><mi>K</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">82K |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">82</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mord">∣</span></span></span></span>294K</td>
<td></td>
<td></td>
</tr>
</tbody></table>
<p>为了准备实验, 我们使用 A100 GPU 对较小的模型(30B 参数)进行了预实验. 这些较小模型的结果令人鼓舞, 使我们能够有信心扩展到 660B 的 R1-Zero 和 R1. 对于 R1-Zero 的训练, 我们使用了 64×8 H800 GPU, 耗时约 198 小时. 对于 R1 的训练阶段, 使用相同的 64×8 H800 GPU, 耗时约 4 天(约 80 小时). SFT 数据集的创建使用了 5K GPU 小时.</p>
<blockquote>
<p>译者注: 29.4 万美元的总训练成本, 对于达到 OpenAI o1 级别性能的推理模型来说, 是一个极具冲击力的数字. 更关键的是, 这 29.4 万美元不仅包含了 R1 本身, 还包含了 R1-Zero 和 SFT 数据创建. 如果只计算 R1 的最终训练阶段, 成本仅为 8.2 万美元. 这种成本效率来自于 GRPO 省去价值模型、DeepSeek-V3 的 MoE 架构(37B 激活参数)以及高效的 RL 基础设施. 对于研究社区而言, 这意味着「复制 o1」不再是只有顶级实验室才能承担的奢侈项目.</p>
</blockquote>
<hr>
<h2 id="5-llyaqsm">5. 伦理与安全声明</h2>
<p>随着 DeepSeek-R1 推理能力的进步, 我们深刻认识到潜在的伦理风险. 例如, R1 可能受到越狱攻击(jailbreak attacks), 导致生成危险内容(如爆炸物制造计划), 而增强的推理能力使模型能够提供具有更好操作可行性和可执行性的计划.</p>
<p>此外, 公开模型也容易受到进一步微调的影响, 这可能破坏其固有的安全保护机制.</p>
<p>在安全评估中, 我们从多个角度呈现了全面的安全报告, 包括开源和内部安全评估基准的性能、多语言安全水平以及对越狱攻击的鲁棒性. 这些全面的安全分析得出结论: DeepSeek-R1 模型的固有安全水平, 与其他前沿模型相比, 总体上处于中等水平(与 GPT-4o(2024-05-13)相当). 此外, 当配合风险控制系统时, 模型的安全水平提升到卓越标准.</p>
<hr>
<h2 id="6-jl-jxxywlgz">6. 结论、局限性与未来工作</h2>
<p>我们提出了 DeepSeek-R1-Zero 和 DeepSeek-R1, 它们依赖大规模 RL 来激励模型的推理行为. 我们的结果表明, 预训练Checkpoint本身蕴含着复杂推理任务的巨大潜力. 我们相信, 解锁这一潜力的关键不在于大规模人类标注, 而在于提供困难的推理问题、可靠的验证器和充足的计算资源用于强化学习. 复杂的推理行为(如自我验证和反思)似乎在强化学习过程中有机地涌现.</p>
<p>尽管 DeepSeek-R1 在推理基准测试上取得了前沿结果, 它仍面临几个能力局限性:</p>
<p><strong>结构化输出和工具使用</strong>: 目前, DeepSeek-R1 的结构化输出能力相比现有模型仍然次优. 此外, DeepSeek-R1 无法利用工具(如搜索引擎和计算器)来提升输出性能. 然而, 为结构化输出和工具使用构建 RL 环境并不困难, 我们相信该问题将在下一个版本中得到解决.</p>
<p><strong>Token 效率</strong>: 与传统的测试时计算扩展方法(如多数投票或蒙特卡洛树搜索)不同, DeepSeek-R1 在推理期间根据问题的复杂程度动态分配计算资源. 具体而言, 它使用较少的 token 解决简单任务, 而对复杂任务生成更多 token. 然而, 在 token 效率方面仍有进一步优化空间, 因为在回答较简单问题时仍观察到过度推理(overthinking)的实例.</p>
<p><strong>语言混合</strong>: DeepSeek-R1 目前针对中文和英文进行了优化, 在处理其他语言的查询时可能导致语言混合问题. 例如, DeepSeek-R1 可能会使用英语进行推理和响应, 即使查询使用的是英语或中文以外的语言. 我们旨在在未来的更新中解决这一限制. 这一限制可能与基础Checkpoint DeepSeek-V3-Base 主要利用中文和英文有关, 因此它在这两种语言的推理上能获得更好的结果.</p>
<p><strong>提示工程</strong>: 在评估 DeepSeek-R1 时, 我们观察到它对提示很敏感. Few-shot prompting 始终会降低其性能. 因此, 我们建议用户直接描述问题并使用零样本设置指定输出格式以获得最佳结果.</p>
<p><strong>软件工程任务</strong>: 由于评估时间长, 这会影响 RL 过程的效率, 大规模 RL 尚未在软件工程任务中得到广泛应用. 因此, DeepSeek-R1 在软件工程基准测试中没有表现出比 DeepSeek-V3 有的巨大改进. 未来的版本将通过对软件工程数据实施拒绝采样或在 RL 过程中结合异步评估来提高效率, 从而解决这个问题.</p>
<p>除了具体的能力局限性外, 纯 RL 方法论本身也呈现出固有的挑战:</p>
<p><strong>奖励黑客</strong>: 纯 RL 的成功依赖于可靠的奖励信号. 在本研究中, 我们通过推理领域基于规则的奖励模型(RM)确保奖励可靠性. 然而, 对于某些任务(如写作), 构建如此可靠的 RM 很困难. 如果奖励信号由模型而非预定义规则分配, 随着训练进展它更容易被利用, 这意味着策略模型可能找到捷径来黑客奖励模型. 因此, 对于无法被可靠奖励模型有效评估的复杂任务, 扩展纯 RL 方法仍然是一个开放的挑战.</p>
<p>在本工作中, 对于无法获得可靠信号的任务, DeepSeek-R1 使用人类标注创建监督数据, 仅进行数百步的 RL. 我们希望未来能够获得一个鲁棒的奖励模型来解决此类问题.</p>
<p>随着 DeepSeek-R1 等纯 RL 方法的出现, 未来在解决任何能够被验证器有效评估的任务方面具有巨大潜力, 无论其对人类而言的复杂程度如何. 配备这种高级 RL 技术的机器有望在这些领域超越人类能力,  driven by their ability to optimize performance iteratively through trial and error. 然而, 对于构建可靠奖励模型本质上困难的任务, 挑战仍然存在. 在这种情况下, 缺乏鲁棒的反馈机制可能阻碍进展, 这表明未来研究应侧重于为这些复杂、难以验证的问题开发和改进奖励结构的创新方法.</p>
<p>此外, 在推理过程中利用工具具有重要前景. 无论是使用编译器或搜索引擎等工具来检索或计算必要信息, 还是采用外部工具(如生物或化学试剂)来验证现实世界中的最终结果, 这种工具增强推理的集成都可以显著增强机器驱动解决方案的范围和准确性.</p>
<blockquote>
<p>译者注: 论文作者对局限性的坦诚令人印象深刻. 特别是关于「奖励黑客」的讨论, 它揭示了纯 RL 方法的天花板: 没有可靠验证器的任务(如创意写作、开放式对话)无法从纯 RL 中获益. 这解释了为什么 R1 在软件工程任务上的改进有限 —— SWE-Bench 的验证需要运行测试套件, 耗时很长, 难以集成到高频 RL 循环中. 这也暗示了未来方向: 工具使用 + 异步验证可能是突破这一瓶颈的关键.</p>
</blockquote>
<hr>
<h2 id="fl-a-sjpf">附录 A: 数据配方</h2>
<h3 id="a-1-rl-sj">A.1 RL 数据</h3>
<p>推理 RL 数据包括四个类别: 数学、代码、STEM 和逻辑问题. 此外, 我们还纳入通用 RL 数据来提高 DeepSeek-R1 的有用性和无害性. 所有问题均为中文或英文. RL 数据的描述见表 8.</p>
<blockquote>
<p>表 8: RL 数据和任务的描述.</p>
</blockquote>
<table>
<thead>
<tr>
<th>数据类型</th>
<th>提示数量</th>
<th>问题类型</th>
<th>输出类型</th>
</tr>
</thead>
<tbody><tr>
<td>数学</td>
<td>26K</td>
<td>定量推理</td>
<td>数字/表达式/方程</td>
</tr>
<tr>
<td>代码</td>
<td>17K</td>
<td>算法和缺陷修复</td>
<td>代码解决方案</td>
</tr>
<tr>
<td>STEM</td>
<td>22K</td>
<td>多选题</td>
<td>选项</td>
</tr>
<tr>
<td>逻辑</td>
<td>15K</td>
<td>选择/定量推理</td>
<td>选项/数字</td>
</tr>
<tr>
<td>通用</td>
<td>66K</td>
<td>有用性/无害性</td>
<td>排序响应</td>
</tr>
</tbody></table>
<p><strong>数学</strong> 数据集包含 26K 定量推理问题, 包括数学考试题和竞赛题. 平均提示 token 数为 122. 数据集涵盖代数、微积分、概率和几何等多个数学领域. 问题难度从地区竞赛到国际奥林匹克竞赛不等. 对于每个问题, 模型需要生成逐步推理过程并最终给出答案, 答案可以是数值、数学表达式或方程. 数学证明被排除, 因为难以确定其正确性.</p>
<p><strong>代码</strong> 数据集包括 17K 算法竞赛问题, 以及 8K 缺陷修复问题. 算法竞赛问题类似于 Codeforces 或 LeetCode 上的问题. 每个问题通常包含详细的问题描述、约束条件和多个输入输出示例. 任务是编写一个完整的函数或程序, 能够正确且高效地解决问题, 通过一套全面的隐藏测试用例评估正确性和性能.</p>
<p>缺陷修复问题从真实的 GitHub issue 中提取. 每个任务提供 issue 描述、有缺陷的源代码版本, 以及一组部分或完全失败的单元测试. 目标是理解 issue 的意图, 定位并修复代码中的缺陷, 并确保修正后的版本通过所有单元测试.</p>
<p><strong>STEM</strong> 数据集包含 22K 选择题, 涵盖物理、化学和生物等主题. 每个问题呈现一个学科特定的问题, 并附带四到八个答案选项. 模型需要根据给定的上下文和领域知识选择最科学的准确答案. 平均提示 token 数为 161. 具体而言, 数据集包括 15.5% 物理、30.7% 生物、46.5% 化学和 7.3% 其他主题(如健康和医学).</p>
<p><strong>逻辑</strong> 数据集包含 15K 问题, 旨在评估模型在广泛逻辑挑战中的推理能力. 数据集包括真实世界问题和合成生成问题. 所有问题支持自动评估, 平均提示长度约 420 个 token.</p>
<p>真实世界部分包含来自网络的各种问题, 包括脑筋急转弯、经典逻辑谜题和知识密集型问题. 合成部分主要包括两类: code-IO 问题(使用数据流水线将竞赛编程问题及其输入输出测试用例转换为可验证的逻辑推理问题)和谜题任务(包括密码学谜题、逻辑谜题和算术谜题).</p>
<p><strong>通用</strong> 数据集包含 66K 问题, 旨在评估有用性, 涵盖创意写作、编辑、事实问答和角色扮演等类别. 此外, 数据集还包括 12000 个专注于评估无害性的问题. 为确保鲁棒验证, 使用两个奖励模型, 分别针对有用性和无害性在排序响应上训练.</p>
<h3 id="a-2-lqdsj">A.2 冷启动数据</h3>
<p>对于 DeepSeek-R1, 我们构建并收集少量长 CoT 数据来微调模型作为初始 RL actor. 动机主要是产品驱动的, 非常强调提升用户体验. 用户倾向于发现推理过程与第一人称视角思维模式对齐时更直观和吸引人. 例如, DeepSeek-R1-Zero 在解决问题时更可能使用代词「we」或完全避免第一人称代词, 而 DeepSeek-R1 倾向于更频繁地使用「I」. 此外, 我们承认这种模式可能引发用户不必要的信任. 在此, 我们想强调, 观察到的生动推理模式主要反映的是 DeepSeek 设计的启发式规则, 而非表明模型已经固有地获得了类人智能或自主问题解决能力.</p>
<p>在冷启动数据创建中, 我们偏好以理解问题开始的思维过程, 随后是包含反思和验证的详细推理. 整个思维过程使用第一人称视角呈现. 此外, 保持语言一致性对于最佳用户体验至关重要. 如果没有适当控制, 模型响应可能包含不同语言的混合, 无论查询中使用的语言如何.</p>
<p>具体而言, 我们首先让人类标注者将推理轨迹转换为更自然、人类对话式的风格. 修改后的数据对随后用作示例, 提示 LLM 以类似风格重写额外数据. 所有 LLM 生成的输出随后经过第二轮人工验证以确保质量和一致性.</p>
<h3 id="a-3-80-wtjdsj">A.3 80 万条监督数据</h3>
<p><strong>推理数据</strong>: 我们策划了大量推理提示, 通过对第一阶段 RL 训练的Checkpoint执行拒绝采样来生成推理轨迹. 在此阶段, 我们之前只包含可以使用基于规则奖励评估的数据. 然而, 在此阶段, 我们通过纳入额外数据来扩展数据集, 其中一些使用生成式奖励模型(通过将真实答案和模型预测输入 DeepSeek-V3 进行判断). 此外, 由于模型输出有时混乱且难以阅读, 我们过滤掉了混合语言、长段落和代码块的思维链. 对于每个提示, 我们采样多个响应并仅保留正确的. 总共, 我们收集了约 600K 推理相关训练样本.</p>
<p><strong>非推理数据</strong>: 对于非推理数据(如写作、事实 QA、自我认知和翻译), 我们采用 DeepSeek-V3 流水线并重用 DeepSeek-V3 SFT 数据集的部分内容. 我们还纳入软件工程聚焦的数据(包括程序修复和前端网页开发)来增强模型解决现实世界问题的能力. 对于某些非推理任务, 我们通过提示让 DeepSeek-V3 在回答问题前生成潜在的思维链. 然而, 对于更简单的查询(如「hello」), 我们不提供 CoT 响应.</p>
<p>最终, 我们收集了约 200K 与推理无关的训练样本.</p>
<p>表 9 总结了约 80 万条监督样本的各域数据统计.</p>
<blockquote>
<p>表 9: SFT 数据统计(基于约 800K 监督样本).</p>
</blockquote>
<table>
<thead>
<tr>
<th>领域</th>
<th>数据量</th>
</tr>
</thead>
<tbody><tr>
<td>数学</td>
<td>约 200K</td>
</tr>
<tr>
<td>代码</td>
<td>约 200K</td>
</tr>
<tr>
<td>STEM</td>
<td>约 50K</td>
</tr>
<tr>
<td>逻辑</td>
<td>约 50K</td>
</tr>
<tr>
<td>通用</td>
<td>约 300K</td>
</tr>
</tbody></table>
<p>值得注意的是, 绝大多数数据由单轮交互组成, 这可能限制了 DeepSeek-R1 的多轮对话能力. 我们将扩展到多轮对话数据作为未来工作.</p>
<hr>
<h2 id="fl-b-jcssyxrsy">附录 B: 基础设施与消融实验</h2>
<h3 id="b-1-rl-jcss">B.1 RL 基础设施</h3>
<p>在大模型上进行 RL 训练对基础设施提出了很高的要求. 我们的 RL 框架采用解耦和可扩展的架构, 以促进不同模型和算法的无缝集成.</p>
<p>具体而言, 框架被划分为四个独立模块:</p>
<ul>
<li><p><strong>Rollout 模块</strong>: 从训练数据集加载提示, 均匀分发给多个配备 actor 模型的 vLLM worker 来采样多个响应. 对于 DeepSeek-V3 的 MoE 架构, 我们在节点间实现专家并行策略来减少内存访问开销, 并部署热点专家的冗余副本来平衡不同专家之间的计算负载. 多 Token 预测(MTP)组件也被用于自投机解码(self-speculative decoding), 显著加速解码速度并有效减少最长样本的完成时间.</p>
</li>
<li><p><strong>推理模块</strong>: 加载奖励模型和参考模型, 对 rollout 阶段生成的样本执行前向传播, 从而获得基于模型的奖励和其他必要信息.</p>
</li>
<li><p><strong>基于规则的奖励模块</strong>: 计算模型生成响应的基于规则奖励. 设计了统一接口以适配多样化实现(如代码执行器、答案匹配器、格式检查器等). 尽管此模块不需要将模型加载到 GPU 内存中, 但其执行往往耗时. 为解决此问题, 采用异步调度方法将其执行与 Rollout 和推理模块重叠, 有效隐藏相关延迟.</p>
</li>
<li><p><strong>训练模块</strong>: 加载 actor 模型和 critic 模型(如需要), 计算损失并更新模型参数. 它灵活支持多种 RL 算法(如 PPO、GRPO、DPO 等). 为最小化序列填充造成的计算浪费并平衡设备间的工作负载, 我们设计了以下数据打包策略: 首先, 全局 batch 中的所有数据按长度排序并分发到数据并行组内的进程; 随后, 在每个进程内应用 Best-Fit 策略将数据打包到固定长度的块中, 以最小化填充; 最后, 调整所有进程的块数量使其相等. 此外, 我们集成了 DeepSeek-V3 训练中使用的 DualPipe 算法来实现高效的流水线并行.</p>
</li>
</ul>
<p>值得注意的是, 每个模块完成(基于规则的奖励模块除外)后, 该阶段使用的模型实例会自动从 VRAM 卸载到系统内存或磁盘存储, 从而为后续阶段释放 VRAM.</p>
<h3 id="b-2-yyyzxjldxrsy">B.2 语言一致性奖励的消融实验</h3>
<p>为研究语言一致性(Language Consistency, LC)奖励的影响, 我们在 DeepSeek-R1-Distill-Qwen-7B 上进行了消融实验. 该模型使用与 DeepSeek-R1 相同的冷启动数据, 在 RL 过程中也表现出语言混合. 结果表明, 没有 LC 奖励时, 语言一致性随着训练步数增加而逐渐恶化. 然而, 当应用 LC 奖励时, 整个训练过程中语言一致性保持稳定. 对于基准性能, 模型在数学基准上保持相当性能, 而在代码基准上观察到轻微退化. 尽管这种对齐导致模型性能轻微下降, 但该奖励符合人类偏好, 使输出更可读.</p>
<h3 id="b-3-jlhk">B.3 奖励黑客</h3>
<p>在 LLM 训练中, 奖励黑客指的是模型利用奖励函数的缺陷或偏差, 从而在不真正与人类意图对齐的情况下获得高奖励分数的现象. 在我们的工作中, 当采用有用性奖励模型时观察到了此类奖励黑客行为. 具体而言, 如果奖励模型包含系统性偏差或不准确, LLM 可能学会生成被模型评为高分但与真实人类偏好偏离的响应. 这种不对齐可能在需要复杂推理的任务上表现为性能退化.</p>
<hr>
<h2 id="fl-c-aqpgxq">附录 C: 安全评估详情</h2>
<h3 id="c-1-fxkztx">C.1 风险控制体系</h3>
<p>DeepSeek-R1 的风险控制体系通过向 DeepSeek-V3 发送风险审查提示来实现. 具体包括以下两个主要过程:</p>
<p><strong>潜在风险对话过滤</strong>: 每轮对话后, 用户查询自动与预定义的关键词列表匹配. 该列表包含伦理和安全场景中常用的术语, 旨在确保对潜在安全问题的全面覆盖. 匹配这些关键词的对话被标记为潜在不安全对话.</p>
<p><strong>基于模型的风险审查</strong>: 随后, 这些潜在不安全对话与预设的风险审查提示拼接, 并发送到 DeepSeek-V3 模型(综合考虑有效性和效率之间的平衡). 系统然后根据风险审查结果判断对话是否应被撤回.</p>
<h3 id="c-2-dyyaqxn">C.2 多语言安全性能</h3>
<p>我们将原始双语安全测试集翻译成 50 种常用语言. 对于高频语言, 我们对整个数据集进行全面翻译; 对于低频语言, 我们进行抽样翻译. 这一过程产生了一个包含 9330 个问题的综合多语言安全测试集.</p>
<p>评估结果表明, 配备风险控制体系时, DeepSeek-V3(86.5%)和 DeepSeek-R1(85.9%)在 50 种语言上的总安全分数接近表现最佳的 Claude-3.7-Sonnet(88.3%). 不配备风险控制体系时, DeepSeek-V3(75.3%)和 DeepSeek-R1(74.2%)的安全分数与 GPT-4o(2024-05-13, 75.2%)相当.</p>
<h3 id="c-3-yygjlbx">C.3 越狱攻击鲁棒性</h3>
<p>恶意用户可能采用各种越狱技术来规避模型的安全对齐并诱导有害响应. 因此, 除了直接提问下的模型安全评估外, 我们非常重视检查模型在面对越狱攻击时的鲁棒性. 我们构建了一个包含 2232 条越狱指令的模板集合, 然后将这些越狱提示与原始安全测试集中的问题随机拼接, 进一步检查模型在面对原始不安全问题和带有越狱元素的新问题时响应的性能差异.</p>
<hr>
<h2 id="fl-d-syb">附录 D: 术语表</h2>
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
<td>RL</td>
<td>强化学习</td>
<td>摘要</td>
<td>通过与环境交互、最大化累积奖励来优化策略的机器学习方法</td>
</tr>
<tr>
<td>GRPO</td>
<td>群组相对策略优化</td>
<td>第 2.1 节</td>
<td>无需价值模型的 RL 算法, 通过组内相对奖励计算优势</td>
</tr>
<tr>
<td>CoT</td>
<td>思维链</td>
<td>第 1 节</td>
<td>模型生成中间推理步骤来解决复杂问题的技术</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>第 1 节</td>
<td>在标注数据对上进行有监督训练以微调预训练模型</td>
</tr>
<tr>
<td>PPO</td>
<td>近端策略优化</td>
<td>第 2.1 节</td>
<td>广泛使用的 RL 算法, 需要价值模型和裁剪机制</td>
</tr>
<tr>
<td>KL 散度</td>
<td>Kullback-Leibler Divergence</td>
<td>第 2.1 节</td>
<td>衡量两个概率分布差异的非对称度量</td>
</tr>
<tr>
<td>Reward Hacking</td>
<td>奖励黑客</td>
<td>第 2.2 节</td>
<td>模型利用奖励函数缺陷获取高分但不对齐真实目标的现象</td>
</tr>
<tr>
<td>Rejection Sampling</td>
<td>拒绝采样</td>
<td>第 3 节</td>
<td>从模型生成多个候选, 仅保留满足条件的样本用于训练</td>
</tr>
<tr>
<td>Distillation</td>
<td>蒸馏</td>
<td>第 4.3 节</td>
<td>将大模型的知识迁移到小模型的技术</td>
</tr>
<tr>
<td>RM</td>
<td>奖励模型</td>
<td>第 3.1 节</td>
<td>评估模型输出质量并输出标量分数的神经网络</td>
</tr>
</tbody></table>
<hr>
<h2 id="fl-e-hxgssy">附录 E: 核心公式索引</h2>
<table>
<thead>
<tr>
<th>编号</th>
<th>公式</th>
<th>所在章节</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>(1)</td>
<td>GRPO 目标函数</td>
<td>第 2.1 节</td>
<td>群组相对策略优化的最大化目标</td>
</tr>
<tr>
<td>(2)</td>
<td>KL 散度无偏估计</td>
<td>第 2.1 节</td>
<td>使用逆向 KL 形式的散度估计</td>
</tr>
<tr>
<td>(3)</td>
<td>优势计算</td>
<td>第 2.1 节</td>
<td>组内标准化相对奖励</td>
</tr>
<tr>
<td>(4)</td>
<td>规则奖励</td>
<td>第 2.2 节</td>
<td>准确性奖励与格式奖励之和</td>
</tr>
<tr>
<td>(5)</td>
<td>有用性奖励</td>
<td>第 3.1 节</td>
<td>基于偏好对的奖励模型输出</td>
</tr>
<tr>
<td>(6)</td>
<td>安全性奖励</td>
<td>第 3.1 节</td>
<td>点式安全分类器的输出</td>
</tr>
<tr>
<td>(7)</td>
<td>语言一致性奖励</td>
<td>第 3.2.1 节</td>
<td>目标语言词汇占比</td>
</tr>
<tr>
<td>(8)</td>
<td>综合奖励</td>
<td>第 3.2.2 节</td>
<td>推理、通用和语言奖励之和</td>
</tr>
<tr>
<td>(9)</td>
<td>推理奖励</td>
<td>第 3.2.2 节</td>
<td>基于规则的推理奖励</td>
</tr>
<tr>
<td>(10)</td>
<td>通用奖励</td>
<td>第 3.2.2 节</td>
<td>奖励模型输出加格式奖励</td>
</tr>
<tr>
<td>(11)</td>
<td>pass@1</td>
<td>第 4.1 节</td>
<td>多次采样正确率的平均值</td>
</tr>
</tbody></table>
<hr>
<h2 id="fl-f-mxpxdw">附录 F: 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: DeepSeek-V3-Base(671B MoE, 预训练基座模型)</li>
<li><strong>核心创新</strong>:<ol>
<li>纯 RL 训练推理能力(R1-Zero), 无需 SFT 冷启动</li>
<li>GRPO 算法省去价值模型, 降低训练资源消耗</li>
<li>基于规则的奖励系统(准确性 + 格式), 避免神经奖励模型的奖励黑客</li>
<li>多阶段训练流水线(冷启动 RL → 拒绝采样 SFT → 通用 RL)</li>
<li>推理能力蒸馏到小模型(1.5B-70B), 证明大模型推理模式可迁移</li>
</ol>
</li>
<li><strong>被后续工作引用/影响</strong>:<ul>
<li>催生了大量开源推理模型的复现(如 QwQ、Kimi k1.5、GLM-Zero 等)</li>
<li>推动了「Test-time Compute Scaling」范式的普及</li>
<li>影响了后续模型对 RL 在后训练中作用的重新评估</li>
<li>蒸馏策略被广泛采用, 成为小模型获取推理能力的标准路径</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档为 DeepSeek-R1 技术报告的逐字精读翻译. 所有数据、公式和实验结果均忠实于原文. 技术思考段落以「译者注」标识, 供读者参考.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1. 引言"},{"level":2,"id":"2-deep-seek-r1-zero-cqhxxqddtlmx","text":"2. DeepSeek-R1-Zero: 纯强化学习驱动的推理模型"},{"level":3,"id":"2-1-group-relative-policy-optimization","text":"2.1 Group Relative Policy Optimization"},{"level":3,"id":"2-2-jlsj","text":"2.2 奖励设计"},{"level":3,"id":"2-3-jl-llm-dtlnl","text":"2.3 激励 LLM 的推理能力"},{"level":2,"id":"3-deep-seek-r1-djddqdtlmx","text":"3. DeepSeek-R1: 多阶段对齐的推理模型"},{"level":3,"id":"3-1-jymxdjl","text":"3.1 基于模型的奖励"},{"level":3,"id":"3-2-xlxj","text":"3.2 训练细节"},{"level":4,"id":"3-2-1-dyjd-rl-dxlxj","text":"3.2.1 第一阶段 RL 的训练细节"},{"level":4,"id":"3-2-2-dejd-rl-dxlxj","text":"3.2.2 第二阶段 RL 的训练细节"},{"level":2,"id":"4-sy","text":"4. 实验"},{"level":3,"id":"4-1-sysz","text":"4.1 实验设置"},{"level":3,"id":"4-2-zyjg","text":"4.2 主要结果"},{"level":3,"id":"4-3-zl-rxmxhdtlnl","text":"4.3 蒸馏: 让小模型获得推理能力"},{"level":3,"id":"4-4-xlcb","text":"4.4 训练成本"},{"level":2,"id":"5-llyaqsm","text":"5. 伦理与安全声明"},{"level":2,"id":"6-jl-jxxywlgz","text":"6. 结论、局限性与未来工作"},{"level":2,"id":"fl-a-sjpf","text":"附录 A: 数据配方"},{"level":3,"id":"a-1-rl-sj","text":"A.1 RL 数据"},{"level":3,"id":"a-2-lqdsj","text":"A.2 冷启动数据"},{"level":3,"id":"a-3-80-wtjdsj","text":"A.3 80 万条监督数据"},{"level":2,"id":"fl-b-jcssyxrsy","text":"附录 B: 基础设施与消融实验"},{"level":3,"id":"b-1-rl-jcss","text":"B.1 RL 基础设施"},{"level":3,"id":"b-2-yyyzxjldxrsy","text":"B.2 语言一致性奖励的消融实验"},{"level":3,"id":"b-3-jlhk","text":"B.3 奖励黑客"},{"level":2,"id":"fl-c-aqpgxq","text":"附录 C: 安全评估详情"},{"level":3,"id":"c-1-fxkztx","text":"C.1 风险控制体系"},{"level":3,"id":"c-2-dyyaqxn","text":"C.2 多语言安全性能"},{"level":3,"id":"c-3-yygjlbx","text":"C.3 越狱攻击鲁棒性"},{"level":2,"id":"fl-d-syb","text":"附录 D: 术语表"},{"level":2,"id":"fl-e-hxgssy","text":"附录 E: 核心公式索引"},{"level":2,"id":"fl-f-mxpxdw","text":"附录 F: 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/01-deep-seek-r1-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/01-deep-seek-r1-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-R1: 通过强化学习激励 LLM 中的推理能力</h1>
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
