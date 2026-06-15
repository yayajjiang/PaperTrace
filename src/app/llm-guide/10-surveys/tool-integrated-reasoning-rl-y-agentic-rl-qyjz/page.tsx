"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Tool-integrated Reasoning RL 与 Agentic RL 前沿进展</h1>
<blockquote>
<p>本文梳理 2025 年 Tool-integrated Reasoning(TIR)和 Agentic RL 领域的代表性工作，涵盖 Search-R1、ToRL、OTC、RAGEN、SimpleTIR、Memento 和 rStar2-Agent，分析多轮工具调用与强化学习的结合范式、核心挑战与未来方向. </p>
</blockquote>
<hr>
<h2 id="1-lybj-cdl-rl-ddl-agentic-rl">1. 领域背景: 从单轮 RL 到多轮 Agentic RL</h2>
<p>传统 RLHF/RLVR 训练的是单轮问答策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\pi_\\theta(y|x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span>——给定输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>，模型生成回答 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>y</mi></mrow><annotation encoding="application/x-tex">y</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span></span></span></span>，奖励函数根据 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>y</mi></mrow><annotation encoding="application/x-tex">y</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span></span></span></span> 的质量打分. 然而，当模型需要与外部工具(搜索引擎、代码解释器、数据库)进行多轮交互时，策略的定义扩展为: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\pi_\\theta(a_t | s_t), \\quad s_t = (x, a_1, o_1, \\dots, a_{t-1}, o_{t-1}) \\tag{1} \\tag{1}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>a</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">a_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 步的动作(生成文本或调用工具)，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>o</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">o_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为环境/工具的观测反馈. 这种多轮交互引入了三个新挑战: </p>
<ol>
<li><strong>信用分配</strong>: 最终任务成功时，哪一步的决策(搜索关键词、工具调用时机)应获得正信用？</li>
<li><strong>稀疏奖励</strong>: 只有任务完成时才有反馈，中间步骤缺乏密集监督信号. </li>
<li><strong>工具噪声</strong>: 工具返回结果的质量不稳定(搜索可能返回无关内容、代码可能执行失败)，噪声会通过信用分配污染策略更新.</li>
</ol>
<hr>
<h2 id="2-dbxgz">2. 代表性工作</h2>
<h3 id="2-1-search-r1-xl-llm-lyssyqtl-uiuc-2025-03">2.1 Search-R1: 训练 LLM 利用搜索引擎推理(UIUC, 2025.03)</h3>
<p>Search-R1 是较早将 DeepSeek-R1 的 RL 方法扩展到搜索工具的完整框架. 核心贡献: </p>
<ul>
<li><strong>搜索与推理的交替训练</strong>: 模型在推理过程中可以调用 <code>&lt;search&gt;</code> 工具，搜索结果插入到上下文后继续推理. RL 优化同时作用于&quot;何时搜索&quot;、&quot;搜索什么&quot;和&quot;如何利用搜索结果&quot;. </li>
<li><strong>稳定性保障</strong>: 针对搜索引擎返回结果不稳定的问题，引入结果重采样和置信度过滤，降低工具噪声对策略更新的影响. </li>
<li><strong>端到端优化</strong>: 不同于先训练推理能力再叠加工具的模块化方案，Search-R1 从初始阶段就将搜索调用纳入 RL 的优化目标.</li>
</ul>
<h3 id="2-2-torl-scaling-tool-integrated-rl-sjtu-2025-03">2.2 ToRL: Scaling Tool-Integrated RL(SJTU, 2025.03)</h3>
<p>ToRL 聚焦 TIR 的规模扩展问题. 核心发现: </p>
<ul>
<li><strong>工具调用的涌现</strong>: 当模型规模超过 7B 且训练步数足够时，模型自发学会&quot;在不确定时主动调用工具&quot;的行为，无需显式监督. </li>
<li><strong>多工具协同</strong>: ToRL 训练模型同时管理多个工具(搜索 + 计算器 + 代码解释器)，模型学会根据问题类型自动选择最合适的工具组合.</li>
</ul>
<h3 id="2-3-otc-optimal-tool-calls-via-rl-2025-03">2.3 OTC: Optimal Tool Calls via RL(2025.03)</h3>
<p>OTC 从最优控制的角度分析工具调用策略. 将工具调用建模为<strong>部分可观察马尔可夫决策过程(POMDP)</strong> ，其中工具返回结果为观察值，真实世界状态对模型不可见. OTC 引入信息增益作为辅助奖励信号: </p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">R_{\\text{info}}(a_t) = H(s_t) - \\mathbb{E}_{o_t}[H(s_t | o_t)] \\tag{2} \\tag{2}</span>
<p>此式将上述直觉形式化，各项分别对应输入变换、非线性激活与输出生成. </p>
<p>即鼓励模型选择能够最大程度减少状态不确定性的工具调用. 这使得模型在信息不足时主动探索(调用工具)，在信息充分时停止探索(直接回答). </p>
<h3 id="2-4-ragen-lj-llm-agent-dzwjh-2025-05">2.4 RAGEN: 理解 LLM Agent 的自我进化(2025.05)</h3>
<p>RAGEN 的核心贡献是<strong>多轮 RL 中的自我进化分析</strong>. 通过大规模实验，作者发现: </p>
<ul>
<li><strong>能力涌现曲线</strong>: Agent 的工具使用能力不是线性增长的，而是在训练约 60% 总步数时出现相变——此前模型主要依赖内部知识，此后主动工具调用频率急剧上升. </li>
<li><strong>策略多样性崩溃</strong>: 若不加约束，多轮 RL 容易收敛到单一策略(如&quot;所有问题都搜索&quot;)，损失策略多样性. RAGEN 通过熵正则化和探索奖励维持策略多样性.</li>
</ul>
<h3 id="2-5-simple-tir-ddddl-tir-ntu-2025-07">2.5 SimpleTIR: 端到端多轮 TIR(NTU, 2025.07)</h3>
<p>SimpleTIR 强调<strong>简化即强大</strong>. 与 Search-R1 等复杂框架不同，SimpleTIR 证明: 仅需二元奖励(最终答案正确/错误)和基础 GRPO，即可训练出有效的多轮工具调用策略. 其极简配方包括: </p>
<ul>
<li>单阶段训练，无课程学习</li>
<li>固定超参数，无动态调度</li>
<li>严格二元奖励，无中间步骤奖励</li>
</ul>
<p>实验表明，SimpleTIR 在多个 TIR 基准上与复杂基线持平或更优，验证了&quot;基础配方足够好&quot;的假设. </p>
<h3 id="2-6-memento-bwt-llm-d-agent-wt-ucl-amp-huawei-2025-08">2.6 Memento: 不微调 LLM 的 Agent 微调(UCL &amp; Huawei, 2025.08)</h3>
<p>Memento 提出了一种反直觉的方案: <strong>不更新 LLM 权重，仅微调工具调用策略</strong>. 其核心洞察是: 大模型的内部知识已足够强大，Agent 能力的瓶颈不在于模型本身，而在于&quot;何时、如何调用工具&quot;的决策策略. </p>
<p>Memento 将工具调用策略参数化为一个小型适配器(Adapter)，冻结 LLM 权重，仅通过 RL 训练适配器. 这不仅大幅降低了训练成本，还避免了微调 LLM 可能导致的通用能力退化. </p>
<h3 id="2-7-r-star2-agent-agentic-tljsbg-msra-2025-08">2.7 rStar2-Agent: Agentic 推理技术报告(MSRA, 2025.08)</h3>
<p>rStar2-Agent 将微软的 rStar(推理自举)方法扩展到 Agent 场景. 核心设计: </p>
<ul>
<li><strong>多路径探索</strong>: 在每一步生成多个候选动作(不同工具调用 + 不同参数)，并行执行并评估结果</li>
<li><strong>回溯机制</strong>: 当某条路径进入死胡同时，自动回溯到最近的分叉点尝试替代路径</li>
<li><strong>策略蒸馏</strong>: 将多路径探索中表现最佳的轨迹蒸馏为单路径策略，提升推理效率</li>
</ul>
<hr>
<h2 id="3-jsqszj">3. 技术趋势总结</h2>
<table>
<thead>
<tr>
<th align="left">方向</th>
<th align="left">核心进展</th>
<th align="left">开放问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>单工具 → 多工具</strong></td>
<td align="left">模型学会管理工具组合</td>
<td align="left">工具间冲突如何解决？</td>
</tr>
<tr>
<td align="left"><strong>端到端训练 → 模块化训练</strong></td>
<td align="left">Memento 冻结 LLM 仅训策略</td>
<td align="left">适配器的表达能力上限？</td>
</tr>
<tr>
<td align="left"><strong>复杂奖励 → 极简奖励</strong></td>
<td align="left">SimpleTIR 证明二元奖励足够</td>
<td align="left">极简配方在多模态上的泛化性？</td>
</tr>
<tr>
<td align="left"><strong>单路径 → 多路径探索</strong></td>
<td align="left">rStar2 的并行探索 + 回溯</td>
<td align="left">计算成本与探索深度的权衡？</td>
</tr>
<tr>
<td align="left"><strong>工具调用 → 自我进化</strong></td>
<td align="left">RAGEN 的相变现象</td>
<td align="left">自我进化的可控性与安全性？</td>
</tr>
</tbody></table>
<hr>
<h2 id="4-wlfx">4. 未来方向</h2>
<p><strong>工具创造(Tool Creation)</strong> . 当前 TIR 假设工具集合是固定的，未来模型可能自主学习何时需要新工具、如何设计工具接口、甚至自动生成工具实现(如编写 Python 函数). 这从&quot;使用工具&quot;跃迁到&quot;创造工具&quot;，是 Agent 能力质变的标志. </p>
<p><strong>跨模态工具调用</strong>. 将 TIR 从文本工具(搜索、代码)扩展到视觉工具(图像生成、视频编辑)和物理工具(机器人控制、实验设备)，实现真正意义上的&quot;多模态 Agent&quot;. </p>
<p><strong>社会性工具调用</strong>. 多 Agent 共享工具池，通过工具调用的协调实现协作(如一个 Agent 搜索、另一个 Agent 分析、第三个 Agent 总结). 工具从个人能力的延伸转变为社会协作的媒介. </p>
<hr>
<h2 id="5-ckwx">5. 参考文献</h2>
<ol>
<li><p><strong>Search-R1: Training LLMs to Reason and Leverage Search Engines with Reinforcement Learning</strong></p>
<ul>
<li>UIUC, 2025.03.</li>
</ul>
</li>
<li><p><strong>ToRL: Scaling Tool-Integrated RL</strong></p>
<ul>
<li>SJTU, 2025.03.</li>
</ul>
</li>
<li><p><strong>OTC: Optimal Tool Calls via Reinforcement Learning</strong></p>
<ul>
<li>2025.03.</li>
</ul>
</li>
<li><p><strong>RAGEN: Understanding Self-Evolution in LLM Agents via Multi-Turn Reinforcement Learning</strong></p>
<ul>
<li>2025.05.</li>
</ul>
</li>
<li><p><strong>SimpleTIR: End-to-End Reinforcement Learning for Multi-Turn Tool-Integrated Reasoning</strong></p>
<ul>
<li>NTU, 2025.07.</li>
</ul>
</li>
<li><p><strong>Memento: Fine-tuning LLM Agents without Fine-tuning LLMs</strong></p>
<ul>
<li>UCL &amp; Huawei, 2025.08.</li>
</ul>
</li>
<li><p><strong>rStar2-Agent: Agentic Reasoning Technical Report</strong></p>
<ul>
<li>MSRA, 2025.08.</li>
</ul>
</li>
</ol>
<blockquote>
<p>参考来源: <a href="https://zhuanlan.zhihu.com/p/1946169580193055874">2025 年 Tool-integrated Reasoning RL 及 Agentic RL 论文总结</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-lybj-cdl-rl-ddl-agentic-rl","text":"1. 领域背景: 从单轮 RL 到多轮 Agentic RL"},{"level":2,"id":"2-dbxgz","text":"2. 代表性工作"},{"level":3,"id":"2-1-search-r1-xl-llm-lyssyqtl-uiuc-2025-03","text":"2.1 Search-R1: 训练 LLM 利用搜索引擎推理(UIUC, 2025.03)"},{"level":3,"id":"2-2-torl-scaling-tool-integrated-rl-sjtu-2025-03","text":"2.2 ToRL: Scaling Tool-Integrated RL(SJTU, 2025.03)"},{"level":3,"id":"2-3-otc-optimal-tool-calls-via-rl-2025-03","text":"2.3 OTC: Optimal Tool Calls via RL(2025.03)"},{"level":3,"id":"2-4-ragen-lj-llm-agent-dzwjh-2025-05","text":"2.4 RAGEN: 理解 LLM Agent 的自我进化(2025.05)"},{"level":3,"id":"2-5-simple-tir-ddddl-tir-ntu-2025-07","text":"2.5 SimpleTIR: 端到端多轮 TIR(NTU, 2025.07)"},{"level":3,"id":"2-6-memento-bwt-llm-d-agent-wt-ucl-amp-huawei-2025-08","text":"2.6 Memento: 不微调 LLM 的 Agent 微调(UCL &amp; Huawei, 2025.08)"},{"level":3,"id":"2-7-r-star2-agent-agentic-tljsbg-msra-2025-08","text":"2.7 rStar2-Agent: Agentic 推理技术报告(MSRA, 2025.08)"},{"level":2,"id":"3-jsqszj","text":"3. 技术趋势总结"},{"level":2,"id":"4-wlfx","text":"4. 未来方向"},{"level":2,"id":"5-ckwx","text":"5. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/tool-integrated-reasoning-rl-y-agentic-rl-qyjz" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/tool-integrated-reasoning-rl-y-agentic-rl-qyjz" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tool-integrated Reasoning RL 与 Agentic RL 前沿进展</h1>
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
