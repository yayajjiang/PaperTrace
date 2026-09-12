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
<p>本文基于《DeepSeek-R1 技术报告精译》的后训练章节, 对 R1 的四阶段训练流水线进行系统性梳理. 详细技术细节请参阅 <a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-training-pipeline">05-DeepSeek-R1-Training-Pipeline.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdlsxzl">1 四阶段流水线总览</h2>
<p>DeepSeek-R1 的训练分为四个阶段, 设计哲学是: <strong>先让模型学会推理, 再让模型学会对齐</strong>.</p>
<pre><code>Stage 1: 冷启动 SFT  (数千条长 CoT 数据)
    |
Stage 2: 推理导向 RL  (规则奖励 + 语言一致性奖励)
    |
Stage 3: 拒绝采样 SFT  (约 80 万条: 600K 推理 + 200K 通用)
    |
Stage 4: 通用对齐 RL  (规则奖励 + 奖励模型 + 语言一致性奖励)
</code></pre>
<blockquote>
<p>译者注: 这个流水线的核心洞察是「奖励信号的异质性」. 推理任务的奖励是可靠的、二元的(正确/错误), 而通用任务的奖励是主观的、连续的(偏好分数). 混合这两种信号会导致训练不稳定和奖励黑客. 分阶段训练通过时间上的分离来解决这一问题.</p>
</blockquote>
<hr>
<h2 id="2-stage-1-lqd-sft">2 Stage 1: 冷启动 SFT</h2>
<h3 id="2-1-sjdj">2.1 设计动机</h3>
<p>R1-Zero 证明了纯 RL 可以激发推理能力, 但有两个致命缺陷:</p>
<ol>
<li><strong>可读性差</strong>: 输出缺乏结构, 段落冗长.</li>
<li><strong>语言混合</strong>: 中英文混杂, 影响用户体验.</li>
</ol>
<p>冷启动 SFT 的目的不是「教」模型推理(这是 RL 的工作), 而是给模型一个<strong>合理的初始行为模式</strong>, 使后续 RL 从更高的起点开始.</p>
<h3 id="2-2-sjgj">2.2 数据构建</h3>
<ol>
<li>收集数千条高质量推理提示.</li>
<li>用 R1-Zero 生成多条轨迹, 温度设为 1.0.</li>
<li>过滤: 仅保留答案正确且格式可读的轨迹.</li>
<li>人工改写: 将推理轨迹转换为自然、对话式风格.</li>
<li>LLM 批量重写: 用改写后的数据作为示例, 生成更多类似风格的数据.</li>
</ol>
<p>冷启动数据的规模刻意保持很小(仅数千条), 远小于传统 SFT 的数十万条. 这表明作者有意限制了 SFT 的影响范围 —— 只给模型一个「体面」的初始行为, 而不限制其后续的 RL 探索空间.</p>
<blockquote>
<p>译者注: 表 2 的数据证实了这一点. Dev1(冷启动后)的通用能力大幅提升(IF-Eval 从 46.6% 到 71.7%), 但推理能力反而下降(AIME 从 77.9% 到 59.0%). 这说明人类的「可读性先验」与「推理最优策略」之间存在张力.</p>
</blockquote>
<hr>
<h2 id="3-stage-2-tldx-rl">3 Stage 2: 推理导向 RL</h2>
<p>Stage 2 使用与 R1-Zero 相同的 GRPO 算法, 但增加了一个关键组件:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Reward</mtext><mo>=</mo><msub><mtext>Reward</mtext><mtext>rule</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>language</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Reward} = \\text{Reward}_{\\text{rule}} + \\text{Reward}_{\\text{language}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Reward</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rule</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>语言一致性奖励计算为 CoT 中目标语言词汇的比例:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Reward</mtext><mtext>language</mtext></msub><mo>=</mo><mfrac><mrow><mtext>Num</mtext><mo stretchy="false">(</mo><msub><mtext>Words</mtext><mtext>target</mtext></msub><mo stretchy="false">)</mo></mrow><mrow><mtext>Num</mtext><mo stretchy="false">(</mo><mtext>Words</mtext><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\text{Reward}_{\\text{language}} = \\frac{\\text{Num}(\\text{Words}_{\\text{target}})}{\\text{Num}(\\text{Words})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Num</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Words</span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">Num</span></span><span class="mopen">(</span><span class="mord"><span class="mord text"><span class="mord">Words</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">target</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>消融实验表明, 语言一致性奖励会导致模型性能轻微下降(特别是在代码基准上). 但作者认为这是值得的, 因为语言混合严重降低可读性. 这是一个典型的「对齐税」(alignment tax).</p>
<p>Clip ratio 保持为 10, 与 R1-Zero 相同. 推理任务需要大幅度的策略更新来学习复杂推理模式, 因此高 clip ratio 是必要的.</p>
<hr>
<h2 id="4-stage-3-jjcy-sft">4 Stage 3: 拒绝采样 SFT</h2>
<h3 id="4-1-sjdj">4.1 设计动机</h3>
<p>Stage 2 的 RL 只使用可验证的推理数据. 模型在通用任务(写作、QA、翻译)上仍然较弱. Stage 3 的目标是通过大规模 SFT 扩展通用能力, 同时保持推理能力.</p>
<h3 id="4-2-sjfb">4.2 数据分布</h3>
<table>
<thead>
<tr>
<th align="left">领域</th>
<th align="left">数量</th>
<th align="left">占比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数学</td>
<td align="left">~200K</td>
<td align="left">25%</td>
</tr>
<tr>
<td align="left">代码</td>
<td align="left">~200K</td>
<td align="left">25%</td>
</tr>
<tr>
<td align="left">STEM</td>
<td align="left">~50K</td>
<td align="left">6.25%</td>
</tr>
<tr>
<td align="left">逻辑</td>
<td align="left">~50K</td>
<td align="left">6.25%</td>
</tr>
<tr>
<td align="left">通用</td>
<td align="left">~300K</td>
<td align="left">37.5%</td>
</tr>
</tbody></table>
<p>推理数据约占 62.5%, 通用数据约占 37.5%. 这种分配确保了模型在保持推理能力的同时获得足够的通用任务训练.</p>
<p>数据由 Stage 2 的 Checkpoint 通过拒绝采样生成: 每个提示采样多个响应, 仅保留正确的. 对于无法规则验证的任务, 使用 DeepSeek-V3 作为裁判模型.</p>
<hr>
<h2 id="5-stage-4-tydq-rl">5 Stage 4: 通用对齐 RL</h2>
<p>Stage 4 使用三种奖励信号的加权和:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Reward</mtext><mo>=</mo><msub><mtext>Reward</mtext><mtext>reasoning</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>general</mtext></msub><mo>+</mo><msub><mtext>Reward</mtext><mtext>language</mtext></msub></mrow><annotation encoding="application/x-tex">\\text{Reward} = \\text{Reward}_{\\text{reasoning}} + \\text{Reward}_{\\text{general}} + \\text{Reward}_{\\text{language}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Reward</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reasoning</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">general</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Reward</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">language</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中通用奖励来自神经奖励模型. 关键发现是: <strong>过早引入偏好奖励会导致奖励黑客</strong>. 奖励模型分数持续上升, 但外部基准上的实际性能下降.</p>
<p>解决方案: 仅在最后 400 步(共 1700 步)加入通用数据和偏好奖励. 前 1300 步主要用规则奖励巩固推理能力, 最后 400 步适度引入偏好奖励来对齐通用行为.</p>
<p>采样温度从 1.0 降低到 0.7, 因为通用任务需要更确定性的输出.</p>
<hr>
<h2 id="6-xnyjygjdc">6 性能演进与关键洞察</h2>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">AIME 2024</th>
<th align="left">IF-Eval</th>
<th align="left">AlpacaEval 2.0</th>
</tr>
</thead>
<tbody><tr>
<td align="left">R1-Zero</td>
<td align="left">77.9%</td>
<td align="left">46.6%</td>
<td align="left">24.7%</td>
</tr>
<tr>
<td align="left">Dev1(冷启动+RL)</td>
<td align="left">59.0%</td>
<td align="left">71.7%</td>
<td align="left">50.1%</td>
</tr>
<tr>
<td align="left">Dev2(拒绝采样+RL)</td>
<td align="left">74.0%</td>
<td align="left">72.0%</td>
<td align="left">55.8%</td>
</tr>
<tr>
<td align="left">Dev3(+通用SFT)</td>
<td align="left">78.1%</td>
<td align="left">78.1%</td>
<td align="left">62.1%</td>
</tr>
<tr>
<td align="left">R1(最终)</td>
<td align="left">79.8%</td>
<td align="left">83.3%</td>
<td align="left">87.6%</td>
</tr>
</tbody></table>
<p>这个表格揭示了「推理能力」与「通用能力」之间存在<strong>可解耦的优化空间</strong>. 通过分阶段训练, 模型可以依次攻克不同目标, 最终达到均衡.</p>
<blockquote>
<p>译者注: R1 的流水线展示了 SFT 和 RL 的理想分工. SFT 提供行为的「先验分布」, 定义输出的基本格式和风格; RL 在先验之上进行优化, 探索超越人类示范的策略. R1-Zero 跳过 SFT 证明了 RL 的独立能力, 但 R1 的最终结果表明, 适量的 SFT 可以加速收敛并改善用户体验, 而不会严重限制探索空间.</p>
</blockquote>
<hr>
<blockquote>
<p>本文档为多阶段对齐剖析. 详细精译见《01-DeepSeek-R1技术报告精译.md》, 完整训练流水线分析见《05-DeepSeek-R1-Training-Pipeline.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdlsxzl","text":"1 四阶段流水线总览"},{"level":2,"id":"2-stage-1-lqd-sft","text":"2 Stage 1: 冷启动 SFT"},{"level":3,"id":"2-1-sjdj","text":"2.1 设计动机"},{"level":3,"id":"2-2-sjgj","text":"2.2 数据构建"},{"level":2,"id":"3-stage-2-tldx-rl","text":"3 Stage 2: 推理导向 RL"},{"level":2,"id":"4-stage-3-jjcy-sft","text":"4 Stage 3: 拒绝采样 SFT"},{"level":3,"id":"4-1-sjdj","text":"4.1 设计动机"},{"level":3,"id":"4-2-sjfb","text":"4.2 数据分布"},{"level":2,"id":"5-stage-4-tydq-rl","text":"5 Stage 4: 通用对齐 RL"},{"level":2,"id":"6-xnyjygjdc","text":"6 性能演进与关键洞察"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/03-deep-seek-r1-djddqpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/03-deep-seek-r1-djddqpx" />
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
