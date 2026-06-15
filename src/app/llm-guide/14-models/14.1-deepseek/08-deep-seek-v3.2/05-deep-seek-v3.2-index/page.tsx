"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3.2</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>DeepSeek-V3.2 通过 <code>DSA</code>、可扩展 <code>GRPO</code> 和大规模智能体任务合成流水线，把 DeepSeek 家族从“强架构、强训练系统”进一步推进到“强推理、强 agent、强成本效率”的新阶段。</p>
</blockquote>
<p>DeepSeek-V3.2 不是一篇孤立的新模型报告，而是建立在 <code>DeepSeek-V3.1-Terminus</code> 与 <code>DeepSeek-V3</code> 之上的定向升级：它既延续了 <code>MLA</code>、<code>DeepSeekMoE</code>、<code>DualPipe</code> 和 <code>FP8</code> 这些工程基石，又把重点转向三件更贴近 2025 年竞争焦点的事情：更高效的长上下文注意力、更大规模的后训练算力投放，以及更贴近真实工具使用场景的智能体数据合成。</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/08-deep-seek-v3.2/01-deep-seek-v3.2-jsbgjy">01-DeepSeek-V3.2 技术报告精译</a></td>
<td align="left">技术报告精读</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-V3.2 MinerU-EN</a></td>
<td align="left">原始英文 Markdown(MinerU 解析)</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-V3.2 MinerU-ZH</a></td>
<td align="left">中英对照+译者注(MinerU 解析)</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/08-deep-seek-v3.2/05-deep-seek-v3.2-speciale-jxtlpx">05-DeepSeek-V3.2-Speciale 极限推理剖析</a></td>
<td align="left"><code>Speciale</code> 高计算推理变体专题</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-V3.2 聚焦解决三类在 2025 年最尖锐的问题：</p>
<ol>
<li>标准密集注意力即使配合 MLA，在超长上下文下依然有显著计算成本，难以进一步压缩推理费用。</li>
<li>开源模型在后训练阶段普遍算力投入不足，导致 reasoning 能力和 frontier closed-source 模型之间再次拉开差距。</li>
<li>开源模型在真实 agent 场景里容易出现指令漂移、上下文管理失控和工具使用泛化不足，难以稳定落地。</li>
</ol>
<p>因此，这篇报告的核心不是“再做一个更大的 base model”，而是通过更高效的注意力、更激进的 RL 预算和更接近真实任务分布的 agent 数据，把同一条模型路线推向更强的 reasoning 与 tool-use 能力。</p>
<h2 id="ffcj">方法拆解</h2>
<p>第一层方法是 <code>DSA (DeepSeek Sparse Attention)</code>。它不试图彻底推翻注意力机制，而是在保持长上下文性能的前提下，只为每个 query 选择少量关键 token，从而把核心注意力复杂度从平方级压缩到近似线性稀疏模式。对 V3.2 而言，DSA 解决的是“长上下文下推理账单太高”的现实问题。</p>
<p>第二层方法是可扩展 <code>GRPO</code>。论文明确强调，V3.2 的后训练预算已经提升到超过预训练成本的 10%。这意味着团队不再把 RL 当成廉价收尾，而是把它当成 reasoning 能力跃迁的主要计算支出。这一层直接决定了 V3.2 与 <code>GPT-5</code>、<code>Kimi-k2-thinking</code> 这类推理模型的对抗能力。</p>
<p>第三层方法是 thinking + tool-use 的一体化数据流水线。先通过 cold-start 把思考过程和工具调用放进统一轨迹，再通过大规模智能体任务合成生成超过 1800 个环境与 85000 条复杂任务。这套方法解决的是 agent 训练里最难的那部分：真实环境覆盖不够、工具调用格式不统一、泛化能力弱。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程视角看，DeepSeek-V3.2 的价值在于它把“推理能力”和“推理成本”放到同一张设计表里权衡：</p>
<ul>
<li><code>DSA</code> 的意义不是纯学术新注意力，而是实打实地压低 prefilling 和 decoding 的 token 成本。</li>
<li>可扩展 RL 说明团队已经接受一个现实：在 reasoning 时代，post-training 的算力投入本身就是模型能力的一部分。</li>
<li>context management 与 synthesized agent tasks 说明团队不再满足于 benchmark 做题，而是开始直接优化真实多轮、带工具、长轨迹的 agent 工作流。</li>
<li><code>Speciale</code> 变体则进一步证明：当长度约束放松、后训练预算继续增加时，开源模型可以在极限推理任务上逼近最强闭源系统。</li>
</ul>
<p>也就是说，V3.2 的工程哲学不是“单点最优”，而是“按产品目标重新分配计算预算”：把该花在长上下文效率上的算力花掉，把该花在 RL 上的算力补足，把该花在 agent 数据合成上的工程成本提前承担。</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>DeepSeek-V3.2 的意义主要体现在三点：</p>
<ol>
<li>它证明了开源模型在 2025 年仍能通过架构效率和后训练放大，继续追到闭源 reasoning 主线附近。</li>
<li>它把 agent 训练从简单工具调用模板推进到了更系统的大规模环境合成阶段。</li>
<li>它给出了一条很清楚的路线：如果预训练基座已经足够强，下一阶段真正拉开差距的，往往是注意力效率、RL 预算和 agent 数据流水线。</li>
</ol>
<p>它的边界也很清楚：</p>
<ul>
<li>很多成绩依赖高计算版本 <code>Speciale</code>，不能简单等同于默认服务形态。</li>
<li>DSA 解决的是注意力成本，不等于已经彻底解决所有长轨迹上下文管理问题。</li>
<li>agent 评测里的高分仍然建立在大量合成任务与内部环境之上，迁移到开放世界生产环境时还需要持续验证。</li>
</ul>
<p>如果说 <code>DeepSeek-V3</code> 是“系统级开源闭环”的代表作，那么 <code>DeepSeek-V3.2</code> 更像是这条闭环路线在 reasoning 与 agent 方向上的一次高压推进版。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/08-deep-seek-v3.2/05-deep-seek-v3.2-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/08-deep-seek-v3.2/05-deep-seek-v3.2-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3.2</h1>
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
