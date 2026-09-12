"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>01-Grok-1 核心技术剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.15-xai/14.15-xai">返回 14.15-xAI 家族总览</a></strong></p>
</blockquote>
<p>在底层算子调优与基础设施构建上, 该模型探索了独特的分布式训练切分方案。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.15-xai/01-grok-1/05-01-grok-1-hxzt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.15-xai/01-grok-1/05-01-grok-1-hxzt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">01-Grok-1 核心技术剖析</h1>
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
