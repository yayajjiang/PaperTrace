"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax-M2.5 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>模型定位</strong>：Agent-Native RL 驱动的全新一代，专为高强度的生产力工作流设计. </p>
</blockquote>
<p>在 M2.5 中，稀宇科技不再满足于刷榜，而是将强化学习的重点放在了“真实世界的工具编排与自我纠错”上，赋予了模型高度自治的智能体属性. </p>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/01-mini-max-m2.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/01-mini-max-m2.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax-M2.5 技术报告精译</h1>
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
