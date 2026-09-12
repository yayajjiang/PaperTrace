"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax-M2.5 Agent-Native RL 规模化与成本效率的极致工程</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 MiniMax 官方博客及 agentic RL 领域公开文献, 对 M2.5 最核心的技术突破——Agent-Native 强化学习框架 Forge 的规模化实践, 以及将推理成本压至行业前沿模型 1/10~1/20 的极致工程——进行系统性技术剖析.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-pj-agentic-yyd-quot-bknsj-quot">1 设计动机: 破解 Agentic 应用的&quot;不可能三角&quot;</h2>
<h3 id="1-1-wtdtc">1.1 问题的提出</h3>
<p>2025-2026 年的大模型行业面临一个核心矛盾: <strong>agentic 应用需要海量交互, 但前沿 API 的定价让这种交互成为奢侈品</strong>.</p>
<p>以 Claude Opus 4.6 为例:</p>
<ul>
<li>单次复杂 agent 任务(如 SWE-Bench 级别的代码修复)可能消耗数百万 tokens.</li>
<li>Opus 4.6 的定价: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mi>i</mi><mi>n</mi><mi>p</mi><mi>u</mi><mi>t</mi><mo separator="true">,</mo></mrow><annotation encoding="application/x-tex">5/MTok input,</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">in</span><span class="mord mathnormal">p</span><span class="mord mathnormal">u</span><span class="mord mathnormal">t</span><span class="mpunct">,</span></span></span></span>25/MTok output.</li>
<li>一次任务的 API 成本可达数美元.</li>
<li>对于需要数百轮交互的复杂 agent 工作流, 单次运行成本可能超过 \$100.</li>
</ul>
<p>这形成了一个&quot;不可能三角&quot;:</p>
<ul>
<li><strong>高性能</strong>: 需要大参数模型(如 GPT-4、Claude Opus).</li>
<li><strong>低延迟</strong>: 需要高吞吐推理基础设施.</li>
<li><strong>低成本</strong>: 需要极致的推理效率优化.</li>
</ul>
<p>传统上, 这三个目标最多只能同时满足两个.</p>
<h3 id="1-2-mini-max-djtsl">1.2 MiniMax 的解题思路</h3>
<p>M2.5 的设计哲学是<strong>同时压缩这个三角</strong>: 在保持 SOTA 性能(SWE-Bench Verified 80.2%)的同时, 将推理速度提升至 100 TPS(行业前沿模型的约 2 倍), 并将成本压到 Opus 4.6 的 1/10~1/20.</p>
<p>这一目标的实现依赖三个技术支柱:</p>
<p><strong>支柱一: MoE 架构的稀疏激活效率</strong></p>
<ul>
<li>M2.5 总参数约 200B, 每 token 激活约 10B.</li>
<li>稀疏激活将单次 forward 的计算量降至 Dense 模型的 1/20.</li>
</ul>
<p><strong>支柱二: Agent-Native RL 框架 Forge</strong></p>
<ul>
<li>解决 agentic 场景中&quot;训练-推理不匹配&quot;的核心瓶颈.</li>
<li>通过系统架构创新(而非算法突破)实现 40 倍训练加速.</li>
</ul>
<p><strong>支柱三: 多目标 RL 优化</strong></p>
<ul>
<li>不仅优化&quot;做对&quot;, 还优化&quot;做得快&quot;和&quot;花得少&quot;.</li>
<li>将任务完成时间、token 效率纳入奖励函数.</li>
</ul>
<blockquote>
<p>这里值得停下来想一下. M2.5 的&quot;不可能三角&quot;解题思路与 DeepSeek-V2 的 MLA 注意力优化、Step-3 的国产芯片效率优化, 本质上属于同一技术范式: <strong>通过架构和工程的深度创新, 在固定算力预算下释放更多模型能力</strong>. 但 M2.5 的独特之处在于, 它将&quot;成本&quot;本身作为一等公民纳入优化目标——不仅仅是训练成本, 还包括用户的推理成本. 这种&quot;intelligence too cheap to meter&quot;的愿景, 如果实现, 将从根本上改变 AI 应用的经济学: 从&quot;按调用付费的奢侈品&quot;转变为&quot;按使用时长计费的基础设施&quot;.</p>
</blockquote>
<hr>
<h2 id="2-jsyl-forge-agent-native-rl-kj">2 技术原理: Forge Agent-Native RL 框架</h2>
<h3 id="2-1-agentic-rl-dhxtz">2.1 Agentic RL 的核心挑战</h3>
<p>传统 RL(如 PPO、GRPO)假设环境是&quot;快速&quot;的——每步交互在毫秒级完成. 但 agentic 场景打破了这一假设:</p>
<p><strong>挑战一: 环境延迟不可预测</strong></p>
<ul>
<li>Agent 的工具调用可能涉及网络请求、代码执行、文件 I/O 等操作.</li>
<li>单次工具调用的延迟可能从毫秒到数十秒不等.</li>
<li>在 100 步的 agent 轨迹中, 环境交互时间可能占总时间的 90% 以上.</li>
</ul>
<p><strong>挑战二: 训练-推理紧耦合</strong></p>
<ul>
<li>传统 RL 中, 训练框架(PyTorch)和推理框架(vLLM)通常共享同一进程.</li>
<li>每次策略更新后需要同步权重, 这在 agent 执行期间无法完成.</li>
<li>结果: GPU 在等待环境响应时处于空闲状态.</li>
</ul>
<p><strong>挑战三: 长 Horizon 的 Credit Assignment</strong></p>
<ul>
<li>Agent 任务的 horizon 可能长达数百步.</li>
<li>最终结果的成败难以归因到具体哪一步的决策.</li>
<li>稀疏的终端奖励导致学习信号弱、收敛慢.</li>
</ul>
<h3 id="2-2-forge-dscjojg">2.2 Forge 的三层解耦架构</h3>
<p>Forge 框架通过引入<strong>中间层</strong>将训练-推理-环境三者解耦:</p>
<pre><code>┌─────────────────────────────────────────────────────────────┐
│                      训练引擎 (Training Engine)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  策略网络    │  │  价值网络    │  │  奖励模型(Reward Model)│  │
│  │  (Policy)   │  │  (Value)    │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    中间层 (Middleware Layer)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  异步调度器  │  │  样本缓冲区  │  │  树状样本合并器      │  │
│  │ (Async      │  │ (Replay     │  │  (Tree Merger)      │  │
│  │  Scheduler) │  │  Buffer)    │  │                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    推理引擎 (Inference Engine)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  vLLM /     │  │  工具调用    │  │  环境交互接口        │  │
│  │  自研推理    │  │  (Tool Call) │  │  (Env Interface)    │  │
│  │  引擎        │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
</code></pre>
<p><strong>解耦的核心收益</strong>:</p>
<ul>
<li>训练引擎可以基于稍旧的策略版本(off-policy)进行, 不必等待每次 agent 执行完成.</li>
<li>推理引擎可以独立优化吞吐量和延迟.</li>
<li>中间层的异步调度器平衡系统吞吐量与样本的 off-policyness.</li>
</ul>
<h3 id="2-3-ybtdyszybhb">2.3 异步调度与树状样本合并</h3>
<p><strong>异步调度策略</strong>:</p>
<ul>
<li>当 agent 正在执行环境交互时, 训练引擎继续处理已收集的样本.</li>
<li>调度器动态调整训练步长与环境交互步长的比例.</li>
<li>关键 trade-off: 更高的异步程度 → 更高的吞吐量, 但也更高的 off-policyness → 训练不稳定.</li>
</ul>
<p><strong>树状结构化的样本合并</strong>:</p>
<ul>
<li>Agent 的执行轨迹形成树状结构(每个决策点可能产生多个分支).</li>
<li>传统方法: 逐条处理轨迹, 忽略分支结构.</li>
<li>Forge 的树状合并器: 将共享前缀的轨迹合并, 减少重复计算.</li>
<li>效果: 约 <strong>40 倍训练加速</strong>(来自系统工程的重新设计, 而非算法创新).</li>
</ul>
<blockquote>
<p>40 倍加速的数字需要放在上下文中理解. 它可能主要来自两个因素的叠加: (1) 异步调度消除了 GPU 等待环境响应的空闲时间; (2) 树状合并减少了共享前缀的重复前向传播. 如果原始训练中有 80% 的时间花在等待环境响应, 仅消除这一点就能带来 5 倍加速. 再加上树状合并的 8 倍效率提升, 40 倍并非不可信. 但这个数字是 vendor self-reported, 缺乏独立验证.</p>
</blockquote>
<hr>
<h2 id="3-sfcx-cispo-gcjlydmb-rl">3 算法创新: CISPO、过程奖励与多目标 RL</h2>
<h3 id="3-1-cispo-moe-d-rl-wdsf">3.1 CISPO: MoE 的 RL 稳定算法</h3>
<p>CISPO(Confidence-Informed Self-Play Optimization)是 MiniMax 提出的针对 MoE 架构的 RL 稳定算法.</p>
<p><strong>MoE 在 RL 中的特殊挑战</strong>:</p>
<ul>
<li>专家路由网络的不稳定性: 策略参数的微小变化可能导致路由决策的剧烈改变.</li>
<li>梯度传播通过门控网络时, 可能放大噪声.</li>
<li>结果: 训练过程中的损失尖峰和性能震荡.</li>
</ul>
<p><strong>CISPO 的核心思路</strong>:</p>
<ul>
<li>利用模型的<strong>置信度信息</strong>来指导自对弈优化.</li>
<li>高置信度的决策获得更大的权重, 低置信度的决策被抑制.</li>
<li>这相当于在 RL 训练中引入了一种&quot;自我校准&quot;机制, 减少噪声梯度的影响.</li>
</ul>
<h3 id="3-2-gcjl-jjc-horizon-credit-assignment">3.2 过程奖励: 解决长 Horizon Credit Assignment</h3>
<p>M2.5 引入了<strong>过程奖励机制</strong>(process reward)来应对长 horizon agent 任务的 credit assignment 挑战.</p>
<p><strong>终端奖励的局限</strong>:</p>
<ul>
<li>在 100 步的 agent 轨迹中, 只有最后一步获得明确的成功/失败信号.</li>
<li>前 99 步的决策对最终结果的影响难以量化.</li>
<li>导致&quot;延迟奖励&quot;问题: 模型需要很长时间才能学会哪些中间决策是好的.</li>
</ul>
<p><strong>过程奖励的设计</strong>:</p>
<ul>
<li>对中间步骤的质量进行评分(如代码片段的正确性、搜索查询的相关性、工具调用的合理性).</li>
<li>提供更细粒度的学习信号, 加速收敛.</li>
<li>与终端奖励结合, 形成多层次的奖励结构.</li>
</ul>
<p><strong>挑战与风险</strong>:</p>
<ul>
<li>过程奖励模型的准确性至关重要. 如果奖励模型本身有偏差, 可能引入新的偏差.</li>
<li>设计良好的过程奖励需要深入的任务领域知识.</li>
<li>过度依赖过程奖励可能导致模型&quot;讨好&quot;奖励模型, 而非真正解决任务.</li>
</ul>
<h3 id="3-3-dmb-rl-zn-sdycbdsjyh">3.3 多目标 RL: 智能、速度与成本的三角优化</h3>
<p>M2.5 的 RL 训练不仅优化任务成功率, 还将<strong>任务完成时间</strong>和 <strong>token 效率</strong>纳入优化目标.</p>
<p><strong>多目标奖励函数</strong>(推测):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mtext>total</mtext></msub><mo>=</mo><msub><mi>R</mi><mtext>success</mtext></msub><mo>+</mo><mi>α</mi><mo>⋅</mo><msub><mi>R</mi><mtext>speed</mtext></msub><mo>+</mo><mi>β</mi><mo>⋅</mo><msub><mi>R</mi><mtext>efficiency</mtext></msub></mrow><annotation encoding="application/x-tex">R_{\\text{total}} = R_{\\text{success}} + \\alpha \\cdot R_{\\text{speed}} + \\beta \\cdot R_{\\text{efficiency}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">total</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">success</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">speed</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">efficiency</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>success</mtext></msub></mrow><annotation encoding="application/x-tex">R_{\\text{success}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">success</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 任务是否成功完成(二元奖励).</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>speed</mtext></msub></mrow><annotation encoding="application/x-tex">R_{\\text{speed}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">speed</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>: 完成时间的倒数(越快越好).</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mtext>efficiency</mtext></msub></mrow><annotation encoding="application/x-tex">R_{\\text{efficiency}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">efficiency</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>: 每单位成果的 token 消耗倒数(越省越好).</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo separator="true">,</mo><mi>β</mi></mrow><annotation encoding="application/x-tex">\\alpha, \\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span>: 超参数, 控制速度/效率与成功率的 trade-off.</li>
</ul>
<p><strong>效果验证</strong>:</p>
<ul>
<li>M2.5 平均每任务消耗 352 万 token, 相比 M2.1 的 372 万 token 减少 5.4%.</li>
<li>端到端运行时间从 31.3 分钟降至 22.8 分钟, 提速 37%.</li>
<li>这表明多目标 RL 确实优化了&quot;做得快&quot;和&quot;花得少&quot;.</li>
</ul>
<hr>
<h2 id="4-gcsx-cjgxsddjys">4 工程实现: 从架构效率到定价优势</h2>
<h3 id="4-1-moe-xsjhdcbjg">4.1 MoE 稀疏激活的成本结构</h3>
<p>M2.5 的成本优势根植于 MoE 架构的稀疏激活特性:</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">M2.5</th>
<th align="left">Opus 4.6</th>
<th align="center">成本比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">~200B</td>
<td align="left">推测 ~500B+</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">~10B</td>
<td align="left">推测 ~50B+</td>
<td align="center"><strong>1:5</strong></td>
</tr>
<tr>
<td align="left">Input 价格</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15/MTok |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord">∣</span></span></span></span>5.00/MTok</td>
<td align="left"><strong>1:33</strong></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Output 价格</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.20</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">1.20/MTok |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.20/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord">∣</span></span></span></span>25.00/MTok</td>
<td align="left"><strong>1:21</strong></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">SWE 每任务 token</td>
<td align="left">3.52M</td>
<td align="left">未公开</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">SWE 端到端时间</td>
<td align="left">22.8 min</td>
<td align="left">22.9 min</td>
<td align="center"><strong>1:1</strong></td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>: M2.5 以 <strong>1/5 的激活参数量</strong>, 实现了与 Opus 4.6 <strong>持平的性能和速度</strong>, 同时价格仅为 <strong>1/21~1/33</strong>.</p>
<blockquote>
<p>成本与激活参数的比例并非线性. 如果激活参数比为 1:5, 为什么价格比为 1:21~1:33? 这反映了几个因素: (1) MiniMax 的利润率可能低于 Anthropic; (2) MiniMax 的推理基础设施优化更极致; (3) MoE 的稀疏激活使得 KV Cache 和内存带宽需求更低, 进一步降低了 serving 成本. 无论如何, \$0.15/MTok 的 input 价格在当前市场中极具竞争力.</p>
</blockquote>
<h3 id="4-2-tlxtdgcyh">4.2 推理系统的工程优化</h3>
<p>M2.5 实现 100 TPS( tokens per second)的 serving 速度, 在 MoE 大模型中属于顶尖水平:</p>
<p><strong>专家并行(Expert Parallelism, EP)</strong></p>
<ul>
<li>将专家分散到不同 GPU, 减少单 GPU 的内存瓶颈.</li>
<li>每个 token 只激活少数专家, EP 确保这些专家并行处理.</li>
</ul>
<p><strong>Fused Kernel</strong></p>
<ul>
<li>对 attention 和 MoE 层进行 CUDA kernel 融合, 减少 kernel launch 开销.</li>
<li>利用 FlashAttention 等高效注意力实现.</li>
</ul>
<p><strong>投机解码(Speculative Decoding)</strong></p>
<ul>
<li>使用小型 draft 模型快速生成候选 token, 再由主模型验证.</li>
<li>在可接受的精度损失下, 显著提升解码速度.</li>
</ul>
<p><strong>动态批处理(Continuous Batching)</strong></p>
<ul>
<li>将多个请求的解码步骤动态批处理, 最大化 GPU 利用率.</li>
<li>对 agentic 场景尤为重要(大量短请求交织).</li>
</ul>
<h3 id="4-3-djcldsylj">4.3 定价策略的商业逻辑</h3>
<p>M2.5 的定价策略不仅仅是&quot;低价竞争&quot;, 而是基于结构性成本优势:</p>
<p><strong>\$0.30/小时连续运行成本</strong>:</p>
<ul>
<li>以 100 TPS 连续运行一小时, 成本仅为 \$1.00.</li>
<li>以 50 TPS 连续运行一小时, 成本降至 \$0.30.</li>
<li>四个实例连续运行一整年: \$10,000.</li>
</ul>
<p><strong>商业意义</strong>:</p>
<ul>
<li>\$10,000/年 = 一个初级工程师 1-2 个月的薪水.</li>
<li>这意味着企业可以以极低的成本部署&quot;AI 员工&quot;.</li>
<li>但前提是 agent 的可靠性和通用性足够高, 否则低成本的频繁失败反而增加总成本.</li>
</ul>
<hr>
<h2 id="5-tldb-agent-native-mxdjzgj">5 同类对比: Agent-Native 模型的竞争格局</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">MiniMax M2.5</th>
<th align="left">Claude Opus 4.6</th>
<th align="left">GLM-5.1</th>
<th align="left">Kimi K2.6</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>SWE-Bench Verified</strong></td>
<td align="left"><strong>80.2%</strong></td>
<td align="left">~78.9</td>
<td align="left">58.4%</td>
<td align="left">58.6%</td>
</tr>
<tr>
<td align="left"><strong>Terminal Bench 2</strong></td>
<td align="left"><strong>68.5</strong></td>
<td align="left">~65.4</td>
<td align="left">63.5%</td>
<td align="left">50.8%</td>
</tr>
<tr>
<td align="left"><strong>Input 价格</strong></td>
<td align="left">**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15/MTok** |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span></span></span></span>5.00</td>
<td align="left">~\$0.80</td>
<td align="left">—</td>
<td align="left"></td>
</tr>
<tr>
<td align="left"><strong>Output 价格</strong></td>
<td align="left">**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.20</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">1.20/MTok** |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.20/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span></span></span></span>25.00</td>
<td align="left">~\$2.56</td>
<td align="left">—</td>
<td align="left"></td>
</tr>
<tr>
<td align="left"><strong>Serving 速度</strong></td>
<td align="left"><strong>100 TPS</strong></td>
<td align="left">~50 TPS</td>
<td align="left">—</td>
<td align="left">—</td>
</tr>
<tr>
<td align="left"><strong>架构</strong></td>
<td align="left">~200B MoE, ~10B active</td>
<td align="left">闭源</td>
<td align="left">754B MoE, ~40B active</td>
<td align="left">1T MoE, 32B active</td>
</tr>
<tr>
<td align="left"><strong>许可</strong></td>
<td align="left">API</td>
<td align="left">闭源 API</td>
<td align="left">MIT</td>
<td align="left">Modified MIT</td>
</tr>
<tr>
<td align="left"><strong>核心差异化</strong></td>
<td align="left"><strong>成本效率 + RL 规模化</strong></td>
<td align="left">综合能力</td>
<td align="left">开源 + 全栈国产</td>
<td align="left">多模态 + Agent</td>
</tr>
</tbody></table>
<p><strong>关键观察</strong>:</p>
<ul>
<li><strong>M2.5 在 SWE-Bench 和 Terminal Bench 上均领先</strong>, 但在纯推理基准(AIME)上可能不如专用推理模型.</li>
<li><strong>成本优势是 M2.5 最突出的差异化</strong>: 20-33 倍的价格差距, 对于 agentic 应用是颠覆性的.</li>
<li><strong>GLM-5.1 和 K2.6 采用开源策略</strong>, 但性能明显落后于 M2.5 和 Opus 4.6.</li>
<li><strong>Opus 4.6 在综合能力上仍有优势</strong>, 但定价使其在成本敏感场景中缺乏竞争力.</li>
</ul>
<hr>
<h2 id="6-jxxyfx">6 局限性与风险</h2>
<h3 id="6-1-pgtmddcywt">6.1 评估透明度的残余问题</h3>
<p>尽管 MiniMax 在评估方法上比大多数厂商更透明, 仍存在以下问题:</p>
<p><strong>BrowseComp 的 Context Management 策略</strong></p>
<ul>
<li>&quot;当 token 使用量超过 30% 时丢弃全部历史&quot;本质上是一种 test-time pass@k 变体.</li>
<li>模型有多次从头开始的机会, 分数会显著高于单次尝试.</li>
<li>与其他模型的单次尝试分数直接对比可能不公平.</li>
</ul>
<p><strong>内部基准的偏差风险</strong></p>
<ul>
<li>RISE、GDPval-MM、MEWC、Finance Modeling 等基准使用专家设计的问题和 rubric.</li>
<li>虽然更贴近真实场景, 但也引入了评估者自身的偏好偏差.</li>
<li>独立第三方的验证尚未完成.</li>
</ul>
<h3 id="6-2-zwbgzbdjdfx">6.2 自我报告指标的解读风险</h3>
<ul>
<li>&quot;30% 的公司任务由 M2.5 自主完成&quot;: 未披露任务复杂度分布.</li>
<li>&quot;80% 的新提交代码由 M2.5 生成&quot;: 未说明代码审查和修改的后续流程.</li>
<li>内部使用场景可能与外部用户的真实需求存在偏差.</li>
</ul>
<h3 id="6-3-bjsydj">6.3 边际收益递减</h3>
<p>M2.5 在 SWE-Bench Verified 上已达 80.2%, 接近该基准的天花板(当前最高约 82-83%).</p>
<ul>
<li>进一步提升需要解决越来越边缘的 corner case.</li>
<li>每 1% 的提升所需的 RL 训练成本呈指数增长.</li>
<li>MiniMax 自己也承认&quot;唯一剩下的问题是如何持续推动模型能力前沿&quot;.</li>
</ul>
<h3 id="6-4-kyystsd">6.4 开源与生态锁定</h3>
<ul>
<li>M2.5 仅通过 API 提供服务, 不开源模型权重.</li>
<li>这意味着开发者无法在自己的基础设施上部署 M2.5, 必须依赖 MiniMax 的云服务.</li>
<li>与 GLM-5.1(MIT 开源)和 Qwen(Apache 2.0)形成对比, 后者允许本地部署和二次开发.</li>
</ul>
<blockquote>
<p>从更宏观的视角看, M2.5 代表了大模型行业的一个关键转向: <strong>从&quot;参数竞赛&quot;转向&quot;效率竞赛&quot;</strong>. 当模型能力达到一定阈值后(如 SWE-Bench 80%+), 用户关心的不再是&quot;这个模型是否比那个强 2%&quot;, 而是&quot;我能不能 afford 得起让它运行一整天&quot;. M2.5 的定价策略直击这一痛点, 可能加速 agentic 应用从&quot;演示级&quot;向&quot;生产级&quot;的跃迁. 但其闭源策略也意味着, 如果 MiniMax 的 API 稳定性或服务质量出现问题, 开发者没有 fallback 选项.</p>
</blockquote>
<hr>
<h2 id="fl-gjsyb">附录: 关键术语表</h2>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Agent-Native RL</td>
<td align="left">针对 agentic 场景设计的强化学习框架, 考虑环境延迟、工具调用等特性</td>
</tr>
<tr>
<td align="left">Forge</td>
<td align="left">MiniMax 自研的 agent-native RL 框架, 核心创新是中间层解耦和异步调度</td>
</tr>
<tr>
<td align="left">CISPO</td>
<td align="left">Confidence-Informed Self-Play Optimization, 针对 MoE 的 RL 稳定算法</td>
</tr>
<tr>
<td align="left">过程奖励</td>
<td align="left">Process Reward, 对 agent 轨迹的中间步骤进行评分, 提供细粒度学习信号</td>
</tr>
<tr>
<td align="left">Off-Policy</td>
<td align="left">训练使用的样本来自旧策略, 而非当前策略</td>
</tr>
<tr>
<td align="left">异步调度</td>
<td align="left">训练引擎与环境交互解耦, GPU 不等待环境响应</td>
</tr>
<tr>
<td align="left">树状样本合并</td>
<td align="left">将共享前缀的 agent 轨迹合并, 减少重复计算</td>
</tr>
<tr>
<td align="left">TPS</td>
<td align="left">Tokens Per Second, 推理吞吐量指标</td>
</tr>
<tr>
<td align="left">SWE-Bench</td>
<td align="left">软件工程基准, 评估模型修复真实 GitHub issue 的能力</td>
</tr>
<tr>
<td align="left">Scaffold</td>
<td align="left">Agent 运行时的外部环境(工具集、文件系统、API 等)</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 MiniMax-M2.5 核心技术专题. 完整演进脉络见《01-MiniMax-M2.5技术报告精译.md》, 部署实践参考见《05-MiniMax-M2.5-Architecture-Overview.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-pj-agentic-yyd-quot-bknsj-quot","text":"1 设计动机: 破解 Agentic 应用的&quot;不可能三角&quot;"},{"level":3,"id":"1-1-wtdtc","text":"1.1 问题的提出"},{"level":3,"id":"1-2-mini-max-djtsl","text":"1.2 MiniMax 的解题思路"},{"level":2,"id":"2-jsyl-forge-agent-native-rl-kj","text":"2 技术原理: Forge Agent-Native RL 框架"},{"level":3,"id":"2-1-agentic-rl-dhxtz","text":"2.1 Agentic RL 的核心挑战"},{"level":3,"id":"2-2-forge-dscjojg","text":"2.2 Forge 的三层解耦架构"},{"level":3,"id":"2-3-ybtdyszybhb","text":"2.3 异步调度与树状样本合并"},{"level":2,"id":"3-sfcx-cispo-gcjlydmb-rl","text":"3 算法创新: CISPO、过程奖励与多目标 RL"},{"level":3,"id":"3-1-cispo-moe-d-rl-wdsf","text":"3.1 CISPO: MoE 的 RL 稳定算法"},{"level":3,"id":"3-2-gcjl-jjc-horizon-credit-assignment","text":"3.2 过程奖励: 解决长 Horizon Credit Assignment"},{"level":3,"id":"3-3-dmb-rl-zn-sdycbdsjyh","text":"3.3 多目标 RL: 智能、速度与成本的三角优化"},{"level":2,"id":"4-gcsx-cjgxsddjys","text":"4 工程实现: 从架构效率到定价优势"},{"level":3,"id":"4-1-moe-xsjhdcbjg","text":"4.1 MoE 稀疏激活的成本结构"},{"level":3,"id":"4-2-tlxtdgcyh","text":"4.2 推理系统的工程优化"},{"level":3,"id":"4-3-djcldsylj","text":"4.3 定价策略的商业逻辑"},{"level":2,"id":"5-tldb-agent-native-mxdjzgj","text":"5 同类对比: Agent-Native 模型的竞争格局"},{"level":2,"id":"6-jxxyfx","text":"6 局限性与风险"},{"level":3,"id":"6-1-pgtmddcywt","text":"6.1 评估透明度的残余问题"},{"level":3,"id":"6-2-zwbgzbdjdfx","text":"6.2 自我报告指标的解读风险"},{"level":3,"id":"6-3-bjsydj","text":"6.3 边际收益递减"},{"level":3,"id":"6-4-kyystsd","text":"6.4 开源与生态锁定"},{"level":2,"id":"fl-gjsyb","text":"附录: 关键术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/05-mini-max-m2.5-agent-native-rl-gmhycbxsdjzgc" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/05-mini-max-m2.5-agent-native-rl-gmhycbxsdjzgc" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax-M2.5 Agent-Native RL 规模化与成本效率的极致工程</h1>
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
