"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>全面综述与技术总结</h1>
<h2 id="1-wsmxyzsdh">1. 为什么需要综述导航</h2>
<p>大语言模型领域的发展速度前所未有. 仅2023年至2025年间，arXiv上每天新增的LLM相关论文就超过百篇. 对于研究者、工程师乃至决策者而言，面对这样指数级膨胀的文献海洋，最大的困难不是&quot;找不到资料&quot;，而是&quot;不知道哪些资料值得优先阅读&quot;. </p>
<p>综述论文(Survey / Review)的价值在于: 它们由领域专家系统性地梳理某一子方向的发展脉络，将分散在数百篇论文中的碎片化进展组织成连贯的知识图谱. 一篇高质量的综述可以节省读者数十乃至上百小时的文献筛选时间. </p>
<p>本文按技术方向和时间线双维度组织，为不同背景的读者提供导航: 想理解Transformer架构演进？想知道RLHF之后对齐技术走向何方？想把握多模态大模型的最新进展？你都可以在这里找到入口. </p>
<h2 id="2-yxlfxzs">2. 预训练方向综述</h2>
<h3 id="2-1-zqdj-2017-2020">2.1 早期奠基(2017-2020)</h3>
<p><strong>&quot;Attention Is All You Need&quot; (Vaswani et al., 2017)</strong> —— 这不是一篇综述，但它开启了一个时代. Transformer架构的提出奠定了后续所有大模型的基础. 对于希望从源头理解注意力机制的读者，这是不可绕过的起点. </p>
<p><strong>&quot;Pre-trained Models for Natural Language Processing: A Survey&quot; (Qiu et al., 2020)</strong> —— 发表于Transformer问世三年后，系统总结了从ELMo、GPT-1到BERT、RoBERTa、XLNet的预训练范式演进. 这篇综述的价值在于清晰区分了&quot;基于特征&quot;(Feature-based)和&quot;微调&quot;(Fine-tuning)两种范式，并梳理了NSP、MLM等预训练任务的设计逻辑. 适合作为预训练技术的&quot;历史教科书&quot;阅读. </p>
<h3 id="2-2-gpt-3-sdygmfz-2020-2022">2.2 GPT-3时代与规模法则(2020-2022)</h3>
<p><strong>&quot;Language Models are Few-Shot Learners&quot; (Brown et al., 2020, GPT-3)</strong> —— GPT-3论文本身不仅是技术报告，更是一份关于&quot;规模法则(Scaling Laws)&quot;的实证研究. 它证明了当模型参数量跨越到百亿甚至千亿级别时，上下文学习(In-Context Learning)能力会&quot;涌现&quot;. </p>
<p><strong>&quot;Scaling Laws for Neural Language Models&quot; (Kaplan et al., 2020, OpenAI)</strong> —— 这篇技术报告建立了模型参数量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span>、训练数据量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>D</mi></mrow><annotation encoding="application/x-tex">D</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span></span></span></span>、计算量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>C</mi></mrow><annotation encoding="application/x-tex">C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 与最终Loss之间的幂律关系: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo><mspace linebreak="newline"></mspace><mi>p</mi><mi>r</mi><mi>o</mi><mi>p</mi><mi>t</mi><mi>o</mi><msup><mi>N</mi><mrow><mo>−</mo><mi>α</mi></mrow></msup></mrow><annotation encoding="application/x-tex">L(N) \\\\propto N^{-\\alpha}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span><span class="mspace newline"></span><span class="base"><span class="strut" style="height:0.9658em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">o</span><span class="mord mathnormal">pt</span><span class="mord mathnormal">o</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7713em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>D</mi><mo stretchy="false">)</mo><mspace linebreak="newline"></mspace><mi>p</mi><mi>r</mi><mi>o</mi><mi>p</mi><mi>t</mi><mi>o</mi><msup><mi>D</mi><mrow><mo>−</mo><mi>β</mi></mrow></msup></mrow><annotation encoding="application/x-tex">L(D) \\\\propto D^{-\\beta}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="mclose">)</span></span><span class="mspace newline"></span><span class="base"><span class="strut" style="height:1.0435em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mord mathnormal">o</span><span class="mord mathnormal">pt</span><span class="mord mathnormal">o</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span></span></span></span></span></span></span></span></span>. 这些公式至今仍是训练大模型时的核心参考依据. </p>
<p><strong>&quot;Harnessing the Power of LLMs in Practice: A Survey on ChatGPT and Beyond&quot; (Yang et al., 2023)</strong> —— 发表于ChatGPT引爆公众关注之后，是首批系统对比GPT系列、PaLM、LLaMA等主流模型的综述之一. 它不仅覆盖预训练，还延伸到了指令微调和应用实践. </p>
<h3 id="2-3-h-l-la-ma-sddkyst-2023-2024">2.3 后LLaMA时代的开源生态(2023-2024)</h3>
<p><strong>&quot;A Survey of Large Language Models&quot; (Zhao et al., 2023, 后持续更新)</strong> —— 由人民大学赵鑫团队维护，是国内最具影响力的LLM中文综述之一. 它从预训练数据、架构、训练策略到评估方法进行了全景式覆盖，并且持续跟进最新模型(如Qwen、DeepSeek系列). </p>
<p><strong>&quot;Efficient Large Language Models: A Survey&quot; (Wan et al., 2024)</strong> —— 聚焦预训练后的效率优化，包括量化、剪枝、蒸馏、稀疏化、推测解码等技术. 对于需要在资源受限环境下部署模型的工程师，这是必读的效率优化指南. </p>
<h2 id="3-dq-alignment-fxzs">3. 对齐(Alignment)方向综述</h2>
<h3 id="3-1-rlhf-jqqqts-2020-2023">3.1 RLHF及其前期探索(2020-2023)</h3>
<p><strong>&quot;Training language models to follow instructions with human feedback&quot; (Ouyang et al., 2022, InstructGPT / RLHF)</strong> —— RLHF的奠基之作，虽然并非综述，但其方法论影响了此后所有对齐研究. 它确立了SFT → RM训练 → PPO优化的三阶段范式. </p>
<p><strong>&quot;RLHF: Reinforcement Learning from Human Feedback&quot; (Christiano et al., 2023, 概念综述)</strong> —— Paul Christiano等人在Anthropic的工作从强化学习理论的角度，解释了为什么基于人类偏好的奖励建模优于直接模仿学习. 它揭示了&quot;对齐问题&quot;的本质: 人类价值观难以被简单编码为损失函数，必须通过交互式反馈来近似. </p>
<h3 id="3-2-h-rlhf-sddq-rl-h-2023-2025">3.2 后RLHF时代的去RL化(2023-2025)</h3>
<p><strong>&quot;Direct Preference Optimization: Your Language Model is Secretly a Reward Model&quot; (Rafailov et al., 2023, DPO)</strong> —— DPO的提出标志着对齐技术从RL范式向监督学习范式的回归. 它证明了可以直接用偏好数据优化策略，无需显式训练奖励模型和调用PPO. </p>
<p><strong>&quot;A General Theoretical Paradigm to Understand Learning from Human Preferences&quot; (Azar et al., 2023, IPO / General Preference Optimization)</strong> —— 从理论角度统一了DPO、IPO、SLiC等偏好优化方法，揭示了它们背后的统计学习理论框架. </p>
<p><strong>&quot;Preference Optimization for LLMs&quot; (Xu et al., 2024, 综述)</strong> —— 系统对比了DPO、IPO、KTO、SimPO、ORPO等2023-2024年涌现的偏好优化变体，分析了它们在奖励过度优化(Reward Hacking)、分布外泛化、训练稳定性等方面的差异. </p>
<h3 id="3-3-kkzjdycjdq-2023-2025">3.3 可扩展监督与超级对齐(2023-2025)</h3>
<p><strong>&quot;Weak-to-Strong Generalization&quot; (Burns et al., 2023, OpenAI)</strong> —— 探讨了一个核心问题: 当模型能力超过人类评估者时，如何确保对齐信号仍然有效？论文提出用弱监督者(如GPT-2级别的模型)去对齐强模型(GPT-4级别)，并实证发现强模型可以泛化出超越弱监督者的表现. </p>
<p><strong>&quot;Constitutional AI: Harmlessness from AI Feedback&quot; (Bai et al., 2022, Anthropic)</strong> —— 提出用AI自身而非人类来生成反馈(RLAIF)，为可扩展监督提供了一条技术路径. 这是Constitutional AI系列工作的起点. </p>
<h2 id="4-tl-reasoning-fxzs">4. 推理(Reasoning)方向综述</h2>
<h3 id="4-1-chain-of-thought-yzjbz-2022-2023">4.1 Chain-of-Thought与中间步骤(2022-2023)</h3>
<p><strong>&quot;Chain-of-Thought Prompting Elicits Reasoning in Large Language Models&quot; (Wei et al., 2022, Google)</strong> —— CoT的奠基之作，证明了在Prompt中引导模型输出中间推理步骤，可以显著提升数学、逻辑和常识推理能力. </p>
<p><strong>&quot;Tree of Thoughts: Deliberate Problem Solving with Large Language Models&quot; (Yao et al., 2023)</strong> —— 将CoT从线性链扩展为树形搜索，允许模型在推理过程中回溯和探索多条路径，是推理能力从&quot;直觉&quot;走向&quot;深思熟虑&quot;的关键一步. </p>
<h3 id="4-2-cctly-test-time-scaling-2024-2025">4.2 长程推理与Test-Time Scaling(2024-2025)</h3>
<p><strong>&quot;Training Verifiers to Solve Math Word Problems&quot; (Cobbe et al., 2021, OpenAI)</strong> —— 虽然早于CoT时代，但它引入了&quot;验证器(Verifier)&quot;概念——训练一个独立模型来评判主模型输出的正确性. 这一思想在o1和DeepSeek-R1时代被重新激活. </p>
<p><strong>&quot;LLM Reasoning: A Comprehensive Survey&quot; (Qin et al., 2024)</strong> —— 这篇综述将推理技术分为&quot;提示工程&quot;(如CoT、ToT、GoT)、&quot;知识增强&quot;(如RAG for reasoning)、&quot;训练策略&quot;(如SFT on reasoning traces、RL for reasoning)三大类，并讨论了推理能力的涌现与评估. </p>
<p><strong>&quot;DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning&quot; (DeepSeek-AI, 2025)</strong> —— 虽然不是综述，但它是推理领域的里程碑. 它证明了纯RL(无需SFT冷启动)可以让基础模型自发涌现出长程CoT推理能力，并且将这一能力通过蒸馏传递给小模型. </p>
<h3 id="4-3-tldsxjc">4.3 推理的数学基础</h3>
<p><strong>&quot;Let&#39;s Verify Step by Step&quot; (Lightman et al., 2023, OpenAI)</strong> —— 对比了&quot;结果奖励模型(Outcome Reward Model)&quot;和&quot;过程奖励模型(Process Reward Model)&quot;在数学推理中的效果，发现逐过程验证显著优于仅验证最终结果. </p>
<h2 id="5-dmtfxzs">5. 多模态方向综述</h2>
<h3 id="5-1-sj-yymx-vlm">5.1 视觉-语言模型(VLM)</h3>
<p><strong>&quot;Multimodal Foundation Models: From Specialists to General-Purpose Assistants&quot; (Yin et al., 2023, Microsoft)</strong> —— 将多模态基础模型按架构分为&quot;专用模型&quot;(如CLIP、DALL-E)和&quot;通用助手&quot;(如GPT-4V、LLaVA)，并讨论了从对比学习到指令调优的技术迁移. </p>
<p><strong>&quot;A Survey on Multimodal Large Language Models&quot; (Yin et al., 2024, 更新版)</strong> —— 延续上一篇工作，但覆盖到2024年的最新进展，包括原生多模态(如Gemini)、视频理解(如Video-LLaMA)、以及多模态Agent. </p>
<p><strong>&quot;MM1: Methods, Analysis &amp; Insights from Multimodal LLM Pre-training&quot; (McKinzie et al., 2024, Apple)</strong> —— 虽然不是综述，但作为工业界(Apple)对多模态预训练的系统性消融研究，它揭示了数据配比、分辨率、模型规模等因素对VLM能力的边际贡献. </p>
<h3 id="5-2-spy-3d-lj">5.2 视频与3D理解</h3>
<p><strong>&quot;Video Understanding with Large Language Models: A Survey&quot; (Wang et al., 2024)</strong> —— 视频是多模态中技术难度最高的模态(时序+空间+音频). 这篇综述梳理了从早期视频-文本预训练到现代视频LLM的演进，重点讨论了时序建模策略(如时序采样、Tubelet embedding). </p>
<h3 id="5-3-ysdmt-native-multimodality">5.3 原生多模态(Native Multimodality)</h3>
<p><strong>&quot;Gemini: A Family of Highly Capable Multimodal Models&quot; (Gemini Team, 2023-2024, Google)</strong> —— Gemini系列代表&quot;原生多模态&quot;路线——从预训练阶段就融合文本、图像、音频、视频，而非后期将视觉Encoder 嫁接在语言模型上. </p>
<h2 id="6-agent-fxzs">6. Agent方向综述</h2>
<h3 id="6-1-zqgjxxy-re-act-2022-2023">6.1 早期工具学习与ReAct(2022-2023)</h3>
<p><strong>&quot;ReAct: Synergizing Reasoning and Acting in Language Models&quot; (Yao et al., 2022)</strong> —— 提出让LLM交替执行&quot;思考(Thought)&quot;和&quot;行动(Action)&quot;，通过调用外部工具(如搜索引擎、计算器)来扩展自身能力. 这是LLM Agent范式的雏形. </p>
<p><strong>&quot;Toolformer: Language Models Can Teach Themselves to Use Tools&quot; (Schick et al., 2023, Meta)</strong> —— 提出自监督工具学习范式，让模型通过API调用和结果回填来训练工具使用能力，无需人工标注工具调用数据. </p>
<h3 id="6-2-d-agent-xtyzzh-2023-2025">6.2 多Agent系统与自主化(2023-2025)</h3>
<p><strong>&quot;A Survey on Large Language Model based Autonomous Agents&quot; (Wang et al., 2023)</strong> —— 系统性定义了LLM Agent的核心组件: 大脑(LLM)、感知(Perception)、行动(Action)、记忆(Memory). 并讨论了单Agent与多Agent协作的架构设计. </p>
<p><strong>&quot;MetaGPT: Meta Programming for Multi-Agent Collaborative Framework&quot; (Hong et al., 2023)</strong> —— 虽然不是综述，但作为多Agent协作的代表性工作，它展示了如何用角色分工(产品经理、架构师、工程师)来组织多个LLM Agent完成复杂软件项目. </p>
<p><strong>&quot;The Rise and Potential of Large Language Model Based Agents: A Survey&quot; (Xi et al., 2024)</strong> —— 将Agent研究分为&quot;个体Agent能力&quot;和&quot;社会模拟(Multi-Agent Society)&quot;两个层次，并讨论了Agent的安全性、可解释性和伦理挑战. </p>
<h3 id="6-3-jsjczy-gui-agent-2024-2025">6.3 计算机操作与GUI Agent(2024-2025)</h3>
<p><strong>&quot;OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments&quot; (Xie et al., 2024)</strong> —— 提出了让Agent直接操作真实操作系统(Ubuntu)的基准测试，标志着Agent从&quot;玩具演示&quot;走向&quot;真实世界任务&quot;. </p>
<p><strong>&quot;Agent Arena: Evaluating LLM Agents in Real-World Computer Environment&quot; (2024-2025系列工作)</strong> —— 多个团队同步推进的GUI Agent基准，包括WebArena、VisualWebArena、Mind2Web等，推动了Agent在浏览器和桌面环境中的应用落地. </p>
<h2 id="7-pgyjzcszs">7. 评估与基准测试综述</h2>
<p><strong>&quot;A Survey on Evaluation of Large Language Models&quot; (Chang et al., 2023)</strong> —— 系统梳理了LLM评估的维度: 知识、推理、安全性、鲁棒性、偏见等. 它揭示了一个关键问题: 当前基准测试存在严重的&quot;数据污染&quot;问题(测试集已被包含在预训练语料中)，导致评估分数虚高. </p>
<p><strong>&quot;Holistic Evaluation of Language Models&quot; (Liang et al., 2022, HELM / Stanford)</strong> —— 提出&quot;全景评估&quot;理念，主张从多个场景、多个指标、多个子群体来评估模型，而非依赖单一排行榜分数. </p>
<p><strong>&quot;LiveBench: A Challenging, Contamination-Free LLM Benchmark&quot; (White et al., 2024)</strong> —— 为应对数据污染问题，LiveBench采用不断更新的测试题(如最新数学竞赛题、实时信息)，确保评估的公平性. </p>
<h2 id="8-zjyydjy">8. 总结与阅读建议</h2>
<table>
<thead>
<tr>
<th>读者背景</th>
<th>推荐阅读顺序</th>
</tr>
</thead>
<tbody><tr>
<td>刚入门LLM</td>
<td>Zhao et al. (A Survey of LLMs) → Qiu et al. (Pre-trained Models Survey) → Wei et al. (CoT)</td>
</tr>
<tr>
<td>关注推理与o1/R1</td>
<td>Lightman et al. (PRM) → Qin et al. (LLM Reasoning Survey) → DeepSeek-R1</td>
</tr>
<tr>
<td>做对齐/后训练</td>
<td>Ouyang et al. (RLHF) → Rafailov et al. (DPO) → Xu et al. (Preference Optimization Survey)</td>
</tr>
<tr>
<td>做多模态</td>
<td>Yin et al. (Multimodal Foundation Models) → Gemini Paper → Video LLM Survey</td>
</tr>
<tr>
<td>做Agent应用</td>
<td>Yao et al. (ReAct) → Wang et al. (Autonomous Agents Survey) → OSWorld</td>
</tr>
<tr>
<td>关注效率与部署</td>
<td>Wan et al. (Efficient LLMs) → vLLM Paper → 各量化/蒸馏论文</td>
</tr>
</tbody></table>
<p><img src="/llm-guide/10-surveys/qmzsyjszj/qmzsyjszj/images/llm_tech_evolution_map.png" alt="LLM 技术演进地图"></p>
<blockquote>
<p><strong>图 10.1 LLM 范式演进时间轴 (2017-2024+)</strong>
从 Transformer 的提出到 Pre-training，再从对齐时代的 InstructGPT 到走向 AGI 火花的 GPT-4 与聚焦 Test-Time Compute 的 o1 模型，大模型的演化呈现出显著的阶段性特征. </p>
</blockquote>
<p>综述的价值不在于背诵每篇论文的细节，而在于建立对领域发展脉络的&quot;肌肉记忆&quot;——当你遇到新问题时，能够迅速定位到相关的技术分支，知道&quot;这个问题在202X年已经被哪类方法尝试过&quot;. 这种全局视野，是研究者与工程师在信息洪流中保持方向感的罗盘. </p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wsmxyzsdh","text":"1. 为什么需要综述导航"},{"level":2,"id":"2-yxlfxzs","text":"2. 预训练方向综述"},{"level":3,"id":"2-1-zqdj-2017-2020","text":"2.1 早期奠基(2017-2020)"},{"level":3,"id":"2-2-gpt-3-sdygmfz-2020-2022","text":"2.2 GPT-3时代与规模法则(2020-2022)"},{"level":3,"id":"2-3-h-l-la-ma-sddkyst-2023-2024","text":"2.3 后LLaMA时代的开源生态(2023-2024)"},{"level":2,"id":"3-dq-alignment-fxzs","text":"3. 对齐(Alignment)方向综述"},{"level":3,"id":"3-1-rlhf-jqqqts-2020-2023","text":"3.1 RLHF及其前期探索(2020-2023)"},{"level":3,"id":"3-2-h-rlhf-sddq-rl-h-2023-2025","text":"3.2 后RLHF时代的去RL化(2023-2025)"},{"level":3,"id":"3-3-kkzjdycjdq-2023-2025","text":"3.3 可扩展监督与超级对齐(2023-2025)"},{"level":2,"id":"4-tl-reasoning-fxzs","text":"4. 推理(Reasoning)方向综述"},{"level":3,"id":"4-1-chain-of-thought-yzjbz-2022-2023","text":"4.1 Chain-of-Thought与中间步骤(2022-2023)"},{"level":3,"id":"4-2-cctly-test-time-scaling-2024-2025","text":"4.2 长程推理与Test-Time Scaling(2024-2025)"},{"level":3,"id":"4-3-tldsxjc","text":"4.3 推理的数学基础"},{"level":2,"id":"5-dmtfxzs","text":"5. 多模态方向综述"},{"level":3,"id":"5-1-sj-yymx-vlm","text":"5.1 视觉-语言模型(VLM)"},{"level":3,"id":"5-2-spy-3d-lj","text":"5.2 视频与3D理解"},{"level":3,"id":"5-3-ysdmt-native-multimodality","text":"5.3 原生多模态(Native Multimodality)"},{"level":2,"id":"6-agent-fxzs","text":"6. Agent方向综述"},{"level":3,"id":"6-1-zqgjxxy-re-act-2022-2023","text":"6.1 早期工具学习与ReAct(2022-2023)"},{"level":3,"id":"6-2-d-agent-xtyzzh-2023-2025","text":"6.2 多Agent系统与自主化(2023-2025)"},{"level":3,"id":"6-3-jsjczy-gui-agent-2024-2025","text":"6.3 计算机操作与GUI Agent(2024-2025)"},{"level":2,"id":"7-pgyjzcszs","text":"7. 评估与基准测试综述"},{"level":2,"id":"8-zjyydjy","text":"8. 总结与阅读建议"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/qmzsyjszj/qmzsyjszj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/qmzsyjszj/qmzsyjszj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">全面综述与技术总结</h1>
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
