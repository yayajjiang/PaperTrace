"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-R1 多阶段对齐剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 DeepSeek-R1 的四阶段训练流水线, 分析每个阶段的设计动机、技术细节和相互关系.</p>
</blockquote>
<hr>
<h2 id="1-sjdlsxzl">1 四阶段流水线总览</h2>
<p>DeepSeek-R1 的训练分为四个阶段:</p>
<pre><code>Stage 1: 冷启动 SFT  (数千条长 CoT 数据)
    ↓
Stage 2: 推理导向 RL  (规则奖励 + 语言一致性奖励)
    ↓
Stage 3: 拒绝采样 SFT  (约 80 万条数据: 600K 推理 + 200K 通用)
    ↓
Stage 4: 通用对齐 RL  (规则奖励 + 奖励模型 + 语言一致性奖励)
</code></pre>
<p>这个流水线的设计哲学是: <strong>先让模型学会推理, 再让模型学会对齐</strong>.</p>
<hr>
<h2 id="2-stage-1-lqd-sft">2 Stage 1: 冷启动 SFT</h2>
<h3 id="2-1-wsmxylqd">2.1 为什么需要冷启动</h3>
<p>R1-Zero 证明了纯 RL 可以激发推理能力, 但它有两个致命缺陷:</p>
<ol>
<li><strong>可读性差</strong>: 输出缺乏结构, 段落冗长, 难以阅读.</li>
<li><strong>语言混合</strong>: 中英文混杂, 影响用户体验.</li>
</ol>
<p>冷启动 SFT 的目的不是「教」模型推理(这是 RL 的工作), 而是给模型一个<strong>合理的初始行为模式</strong>, 使后续的 RL 训练从更高的起点开始.</p>
<h3 id="2-2-lqdsjdgj">2.2 冷启动数据的构建</h3>
<p>数据构建流程:</p>
<ol>
<li><strong>收集高质量推理提示</strong>: 数千条多样化的推理问题.</li>
<li><strong>用 R1-Zero 生成推理轨迹</strong>: 温度设为 1.0, 采样多条轨迹.</li>
<li><strong>过滤</strong>: 仅保留答案正确且格式可读的轨迹. 使用 sympy 解析数学答案, 检测重复和语言混合.</li>
<li><strong>人工改写</strong>: 人类标注者将推理轨迹转换为自然、对话式的风格.</li>
<li><strong>LLM 批量重写</strong>: 用改写后的数据作为示例, 提示 DeepSeek-V3 生成更多类似风格的数据.</li>
<li><strong>人工验证</strong>: 所有 LLM 生成的输出经过第二轮人工检查.</li>
</ol>
<h3 id="2-3-lqdsjdfgtz">2.3 冷启动数据的风格特征</h3>
<p>冷启动数据强调以下风格:</p>
<ul>
<li><strong>第一人称视角</strong>: 使用「I」而非「we」, 增强用户代入感.</li>
<li><strong>结构化推理</strong>: 从理解问题开始, 经过详细推理, 包含反思和验证.</li>
<li><strong>语言一致性</strong>: 确保推理语言与查询语言一致.</li>
<li><strong>简洁摘要</strong>: 最终答案清晰、人类可读.</li>
</ul>
<p>这里有一个重要的产品考量: 用户倾向于信任使用第一人称的模型. 但作者明确声明, 这种生动的推理模式主要反映的是工程设计的启发式规则, <strong>而非模型获得了类人智能</strong>.</p>
<blockquote>
<p>译者注: 冷启动数据的规模很小(仅数千条), 远小于传统 SFT 通常使用的数十万甚至数百万条数据. 这表明作者有意限制了 SFT 的影响范围 —— 只给模型一个「体面」的初始行为, 而不限制其后续的 RL 探索空间. 表 2 中的数据证实了这一点: Dev1(冷启动后)在通用任务上大幅提升(IF-Eval 从 46.6% 到 71.7%), 但推理能力反而下降(AIME 从 77.9% 到 59.0%). 这说明人类的「可读性先验」与「推理最优策略」之间存在张力.</p>
</blockquote>
<hr>
<h2 id="3-stage-2-tldx-rl">3 Stage 2: 推理导向 RL</h2>
<h3 id="3-1-y-r1-zero-rl-dqb">3.1 与 R1-Zero RL 的区别</h3>
<p>Stage 2 的 RL 与 R1-Zero 的核心算法相同(GRPO + 规则奖励), 但增加了一个关键组件:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Reward</mtext><mo>=</mo><msub><mtext>Reward</mtext><mtext>rule</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>language</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Reward} = \\text{Reward}_{\\text{rule}} + \\text{Reward}_{\\text{language}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Reward</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rule</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>语言一致性奖励计算为 CoT 中目标语言词汇的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Reward</mtext><mtext>language</mtext></msub><mo>=</mo><mfrac><mrow><mtext>Num</mtext><mo stretchy="false">(</mo><msub><mtext>Words</mtext><mtext>target</mtext></msub><mo stretchy="false">)</mo></mrow><mrow><mtext>Num</mtext><mo stretchy="false">(</mo><mtext>Words</mtext><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{Reward}_{\\text{language}} = \\frac{\\text{Num}(\\text{Words}_{\\text{target}})}{\\text{Num}(\\text{Words})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Num</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Words</span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Num</span></span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">Words</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">target</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>这个奖励直接加到最终奖励中, 应用于推理和非推理数据.</p>
<h3 id="3-2-yyyzxjldqh">3.2 语言一致性奖励的权衡</h3>
<p>消融实验表明, 语言一致性奖励会导致模型性能轻微下降(特别是在代码基准上). 但作者认为这是值得的, 因为:</p>
<ol>
<li><strong>用户体验</strong>: 语言混合严重降低可读性.</li>
<li><strong>下游应用</strong>: 一致的语言输出便于后处理和评估.</li>
</ol>
<p>这是一个典型的「对齐税」(alignment tax): 为了符合人类偏好, 模型在客观性能上做出了微小牺牲.</p>
<h3 id="3-3-clip-ratio-dxz">3.3 Clip Ratio 的选择</h3>
<p>Stage 2 中 clip ratio <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϵ</mi></mrow><annotation encoding="application/x-tex">\\epsilon</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ϵ</span></span></span></span> 设为 10, 与 R1-Zero 相同. 作者明确指出:</p>
<ul>
<li>较低的值会截断大量 token 的梯度, 降低性能</li>
<li>较高的值可能导致训练不稳定</li>
</ul>
<p>在实践中的观察是: 推理任务需要大幅度的策略更新来学习复杂的推理模式, 因此高 clip ratio 是必要的.</p>
<hr>
<h2 id="4-stage-3-jjcy-sft">4 Stage 3: 拒绝采样 SFT</h2>
<h3 id="4-1-wsmxydejd-sft">4.1 为什么需要第二阶段 SFT</h3>
<p>Stage 2 的 RL 只使用可验证的推理数据(数学、代码、逻辑). 模型在通用任务(写作、QA、翻译)上仍然较弱.</p>
<p>Stage 3 的目标是通过大规模 SFT 来扩展模型的通用能力, 同时保持推理能力.</p>
<h3 id="4-2-tlsjdsc">4.2 推理数据的生成</h3>
<p><strong>推理数据(约 600K)</strong>:</p>
<ol>
<li>使用 Stage 2 的Checkpoint对大量推理提示进行拒绝采样.</li>
<li>每个提示采样多个响应, 仅保留正确的.</li>
<li>扩展了数据类型: 除了规则可验证的问题, 还纳入了需要生成式奖励模型(DeepSeek-V3 作为裁判)来判断的数据.</li>
<li>过滤: 去除混合语言、长段落和代码块的思维链.</li>
</ol>
<p><strong>非推理数据(约 200K)</strong>:</p>
<ol>
<li>重用 DeepSeek-V3 的 SFT 数据集.</li>
<li>增加软件工程数据: 程序修复、前端网页开发.</li>
<li>对于某些任务, 提示模型在回答前生成思维链; 对于简单查询, 直接回答.</li>
</ol>
<h3 id="4-3-sjfbdph">4.3 数据分布的平衡</h3>
<p>表 9 显示了约 80 万条监督样本的分布:</p>
<table>
<thead>
<tr>
<th>领域</th>
<th>数量</th>
<th>占比</th>
</tr>
</thead>
<tbody><tr>
<td>数学</td>
<td>~200K</td>
<td>25%</td>
</tr>
<tr>
<td>代码</td>
<td>~200K</td>
<td>25%</td>
</tr>
<tr>
<td>STEM</td>
<td>~50K</td>
<td>6.25%</td>
</tr>
<tr>
<td>逻辑</td>
<td>~50K</td>
<td>6.25%</td>
</tr>
<tr>
<td>通用</td>
<td>~300K</td>
<td>37.5%</td>
</tr>
</tbody></table>
<p>推理数据(数学 + 代码 + STEM + 逻辑)约占 62.5%, 通用数据约占 37.5%. 这种分配确保了模型在保持推理能力的同时, 获得足够的通用任务训练.</p>
<h3 id="4-4-sft-ccs">4.4 SFT 超参数</h3>
<ul>
<li>学习率: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5\\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5\\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 的余弦衰减</li>
<li>训练 epoch: 2-3</li>
<li>最大上下文长度: 32768 token</li>
<li>Batch size: 128</li>
</ul>
<hr>
<h2 id="5-stage-4-tydq-rl">5 Stage 4: 通用对齐 RL</h2>
<h3 id="5-1-jlxhdzh">5.1 奖励信号的整合</h3>
<p>Stage 4 使用三种奖励信号的加权和:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Reward</mtext><mo>=</mo><msub><mtext>Reward</mtext><mtext>reasoning</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>general</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>language</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Reward} = \\text{Reward}_{\\text{reasoning}} + \\text{Reward}_{\\text{general}} + \\text{Reward}_{\\text{language}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Reward</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reasoning</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">general</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Reward</mtext><mtext>reasoning</mtext></msub><mo>=</mo><msub><mtext>Reward</mtext><mtext>rule</mtext></msub><mspace width="1em"/><mtext>(数学/代码/逻辑)</mtext></mrow><annotation encoding="application/x-tex">\\text{Reward}_{\\text{reasoning}} = \\text{Reward}_{\\text{rule}} \\quad \\text{(数学/代码/逻辑)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reasoning</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rule</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">(</span><span class="mord cjk_fallback">数学</span><span class="mord">/</span><span class="mord cjk_fallback">代码</span><span class="mord">/</span><span class="mord cjk_fallback">逻辑</span><span class="mord">)</span></span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Reward</mtext><mtext>general</mtext></msub><mo>=</mo><msub><mtext>Reward</mtext><mtext>reward_model</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>format</mtext></msub><mspace width="1em"/><mtext>(写作/QA/安全)</mtext></mrow><annotation encoding="application/x-tex">\\text{Reward}_{\\text{general}} = \\text{Reward}_{\\text{reward\\_model}} + \\text{Reward}_{\\text{format}} \\quad \\text{(写作/QA/安全)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">general</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0614em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reward_model</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">format</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">(</span><span class="mord cjk_fallback">写作</span><span class="mord">/QA/</span><span class="mord cjk_fallback">安全</span><span class="mord">)</span></span></span></span></span></span><p>这种设计使模型同时优化多个目标:</p>
<ul>
<li>推理任务: 追求正确答案</li>
<li>通用任务: 追求人类偏好(有用性 + 安全性)</li>
<li>所有任务: 保持语言一致性</li>
</ul>
<h3 id="5-2-wsmzh-400-bcjrtysj">5.2 为什么最后 400 步才加入通用数据</h3>
<p>Stage 4 共 1700 个训练步, 但通用指令数据和基于偏好的奖励仅在最后 400 步中加入.</p>
<p>作者发现, 过早或过多地使用基于模型的偏好奖励会导致奖励黑客. 具体表现是: 奖励模型分数持续上升, 但模型在 Codeforces 等外部基准上的实际性能下降.</p>
<p>这揭示了神经奖励模型的根本脆弱性: 当策略模型有足够的能力时, 它可以学会「讨好」奖励模型而非真正提升能力.</p>
<p>延迟加入通用数据的策略是一种折中:</p>
<ul>
<li>前 1300 步: 主要用规则奖励巩固推理能力</li>
<li>最后 400 步: 适度引入偏好奖励来对齐通用行为</li>
</ul>
<h3 id="5-3-wdjdd-0-7">5.3 温度降低到 0.7</h3>
<p>Stage 4 将采样温度从 1 降低到 0.7. 作者发现, 在此阶段较高的温度会导致不连贯的生成.</p>
<p>这可能是因为: 通用任务需要更确定性的输出(如格式遵循、事实准确性), 而推理任务需要更多样化的探索.</p>
<hr>
<h2 id="6-gjddxnyj">6 各阶段的性能演进</h2>
<table>
<thead>
<tr>
<th>阶段</th>
<th>AIME 2024</th>
<th>IF-Eval</th>
<th>AlpacaEval 2.0</th>
<th>关键特征</th>
</tr>
</thead>
<tbody><tr>
<td>R1-Zero</td>
<td>77.9%</td>
<td>46.6%</td>
<td>24.7%</td>
<td>纯 RL, 推理强, 通用弱</td>
</tr>
<tr>
<td>Dev1(冷启动+RL)</td>
<td>59.0%</td>
<td>71.7%</td>
<td>50.1%</td>
<td>通用提升, 推理下降</td>
</tr>
<tr>
<td>Dev2(拒绝采样+RL)</td>
<td>74.0%</td>
<td>72.0%</td>
<td>55.8%</td>
<td>推理恢复</td>
</tr>
<tr>
<td>Dev3(+通用SFT)</td>
<td>78.1%</td>
<td>78.1%</td>
<td>62.1%</td>
<td>通用大幅提升</td>
</tr>
<tr>
<td>R1(最终)</td>
<td>79.8%</td>
<td>83.3%</td>
<td>87.6%</td>
<td>均衡优化</td>
</tr>
</tbody></table>
<p>这个表格揭示了一个有趣的模式:</p>
<ol>
<li><strong>R1-Zero → Dev1</strong>: 通用能力(+25.1% on IF-Eval)以推理能力(-18.9% on AIME)为代价获得.</li>
<li><strong>Dev1 → Dev2</strong>: 推理能力(+15.0%)恢复, 通用能力持平.</li>
<li><strong>Dev2 → Dev3</strong>: 通用能力再次跃升, 推理能力小幅提升.</li>
<li><strong>Dev3 → R1</strong>: 通用能力大幅跃升(AlpacaEval +25.5%), 推理能力边际改善.</li>
</ol>
<p>这表明推理能力和通用能力之间存在<strong>可解耦的优化空间</strong>. 通过分阶段训练, 模型可以依次攻克不同目标, 最终达到均衡.</p>
<hr>
<h2 id="7-djdlsxdgcqs">7 多阶段流水线的工程启示</h2>
<h3 id="7-1-wsmbsdddxl">7.1 为什么不是端到端训练</h3>
<p>一个自然的问题是: 为什么不直接用一个端到端的 RL 训练, 同时优化推理和通用能力?</p>
<p>答案在于<strong>奖励信号的异质性</strong>:</p>
<ul>
<li>推理任务的奖励是可靠的、二元的(正确/错误)</li>
<li>通用任务的奖励是主观的、连续的(偏好分数)</li>
</ul>
<p>混合这两种信号会导致:</p>
<ol>
<li>通用任务的噪声污染推理任务的清晰信号</li>
<li>偏好奖励的偏差导致奖励黑客</li>
<li>优化目标冲突, 训练不稳定</li>
</ol>
<p>分阶段训练通过时间上的分离来解决这一问题.</p>
<h3 id="7-2-sft-y-rl-dhbgx">7.2 SFT 与 RL 的互补关系</h3>
<p>R1 的流水线展示了 SFT 和 RL 的理想分工:</p>
<ul>
<li><strong>SFT</strong>: 提供行为的「先验分布」, 定义输出的基本格式和风格</li>
<li><strong>RL</strong>: 在 SFT 提供的先验之上进行优化, 探索超越人类示范的策略</li>
</ul>
<p>R1-Zero 跳过 SFT 证明了 RL 的独立能力, 但 R1 的最终结果表明, <strong>适量的 SFT 可以加速收敛并改善用户体验, 而不会严重限制模型的探索空间</strong>.</p>
<h3 id="7-3-sjgmyzldqh">7.3 数据规模与质量的权衡</h3>
<table>
<thead>
<tr>
<th>阶段</th>
<th>数据规模</th>
<th>数据来源</th>
<th>目的</th>
</tr>
</thead>
<tbody><tr>
<td>冷启动 SFT</td>
<td>数千条</td>
<td>R1-Zero 输出 + 人工改写</td>
<td>建立初始行为模式</td>
</tr>
<tr>
<td>推理 RL</td>
<td>32 问题/步</td>
<td>人工筛选的推理问题</td>
<td>优化推理策略</td>
</tr>
<tr>
<td>拒绝采样 SFT</td>
<td>~800K</td>
<td>R1 Checkpoint生成 + V3 数据</td>
<td>扩展通用能力</td>
</tr>
<tr>
<td>通用 RL</td>
<td>混合批次</td>
<td>推理 + 通用数据</td>
<td>对齐人类偏好</td>
</tr>
</tbody></table>
<p>注意冷启动 SFT 的数据量刻意保持很小, 而拒绝采样 SFT 的数据量很大. 这种「前轻后重」的分配反映了作者对 SFT 作用的精准定位: SFT 只负责「初始化」, 不负责「优化」.</p>
<hr>
<p><em>本文档基于《01-DeepSeek-R1技术报告精译.md》的 R1 章节进行深度剖析.</em></p>
<hr>
<h2 id="zsktb">知识库同步</h2>
<p>本文档同步至知识库以下位置:</p>
<ul>
<li><code>docs/sections/knowledge/algorithms/20_RLHF_Pipeline/</code> — RLHF 训练流水线</li>
<li><code>docs/sections/knowledge/cs336/Lecture16/Lecture16-DeepSeek-R1.md</code> — CS336 课程: DeepSeek-R1 技术解读</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdlsxzl","text":"1 四阶段流水线总览"},{"level":2,"id":"2-stage-1-lqd-sft","text":"2 Stage 1: 冷启动 SFT"},{"level":3,"id":"2-1-wsmxylqd","text":"2.1 为什么需要冷启动"},{"level":3,"id":"2-2-lqdsjdgj","text":"2.2 冷启动数据的构建"},{"level":3,"id":"2-3-lqdsjdfgtz","text":"2.3 冷启动数据的风格特征"},{"level":2,"id":"3-stage-2-tldx-rl","text":"3 Stage 2: 推理导向 RL"},{"level":3,"id":"3-1-y-r1-zero-rl-dqb","text":"3.1 与 R1-Zero RL 的区别"},{"level":3,"id":"3-2-yyyzxjldqh","text":"3.2 语言一致性奖励的权衡"},{"level":3,"id":"3-3-clip-ratio-dxz","text":"3.3 Clip Ratio 的选择"},{"level":2,"id":"4-stage-3-jjcy-sft","text":"4 Stage 3: 拒绝采样 SFT"},{"level":3,"id":"4-1-wsmxydejd-sft","text":"4.1 为什么需要第二阶段 SFT"},{"level":3,"id":"4-2-tlsjdsc","text":"4.2 推理数据的生成"},{"level":3,"id":"4-3-sjfbdph","text":"4.3 数据分布的平衡"},{"level":3,"id":"4-4-sft-ccs","text":"4.4 SFT 超参数"},{"level":2,"id":"5-stage-4-tydq-rl","text":"5 Stage 4: 通用对齐 RL"},{"level":3,"id":"5-1-jlxhdzh","text":"5.1 奖励信号的整合"},{"level":3,"id":"5-2-wsmzh-400-bcjrtysj","text":"5.2 为什么最后 400 步才加入通用数据"},{"level":3,"id":"5-3-wdjdd-0-7","text":"5.3 温度降低到 0.7"},{"level":2,"id":"6-gjddxnyj","text":"6 各阶段的性能演进"},{"level":2,"id":"7-djdlsxdgcqs","text":"7 多阶段流水线的工程启示"},{"level":3,"id":"7-1-wsmbsdddxl","text":"7.1 为什么不是端到端训练"},{"level":3,"id":"7-2-sft-y-rl-dhbgx","text":"7.2 SFT 与 RL 的互补关系"},{"level":3,"id":"7-3-sjgmyzldqh","text":"7.3 数据规模与质量的权衡"},{"level":2,"id":"zsktb","text":"知识库同步"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-training-pipeline" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-training-pipeline" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-R1 多阶段对齐剖析</h1>
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
