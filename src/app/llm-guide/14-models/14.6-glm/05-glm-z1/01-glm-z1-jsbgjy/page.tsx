"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-Z1 技术报告精译 (强化学习专版)</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>模型基础信息</strong></p>
<ul>
<li><strong>发布时间</strong>：2024年底</li>
<li><strong>核心定位</strong>：智谱在纯粹强化学习 (RL) 领域的探索先锋，对标 OpenAI o1 的反思机制。</li>
<li><strong>核心突破</strong>：隐式思考链 (Implicit Chain-of-Thought) 的原生涌现。</li>
</ul>
</blockquote>
<h2 id="1-wsms-z1">1. 为什么是 Z1？</h2>
<p>Z1 并非 GLM 主线版本，而是智谱用来“探路”纯强化学习的科研分支。在 SFT 达到天花板后，Z1 完全依靠基于过程奖励矩阵 (PRM) 的 PPO 算法进行训练。</p>
<h2 id="2-hxjgy-rl-xl">2. 核心架构与 RL 训练</h2>
<ul>
<li><strong>长程惩罚退火</strong>：为了防止模型在思考链中“原地绕圈”，Z1 设计了特殊的动态长度惩罚项。</li>
<li><strong>思考树搜索 (Tree-Search in weights)</strong>：在生成时，模型会在内部计算多条逻辑路径的 Q 值，这种机制后来被彻底吸收到 GLM-5 的 MCTS 框架中。</li>
</ul>
<h2 id="3-lsdw">3. 历史定位</h2>
<p>Z1 证明了国产大模型可以通过大规模的算力消耗来换取高质量的思考链(System 2 思考)，直接孕育了后来横空出世的 GLM-5 家族。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wsms-z1","text":"1. 为什么是 Z1？"},{"level":2,"id":"2-hxjgy-rl-xl","text":"2. 核心架构与 RL 训练"},{"level":2,"id":"3-lsdw","text":"3. 历史定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/05-glm-z1/01-glm-z1-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/05-glm-z1/01-glm-z1-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-Z1 技术报告精译 (强化学习专版)</h1>
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
