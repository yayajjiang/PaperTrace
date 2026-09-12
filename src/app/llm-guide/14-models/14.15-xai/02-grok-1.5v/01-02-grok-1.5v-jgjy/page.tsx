"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Grok-1.5V: 真实世界空间理解</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.15-xai/14.15-xai">返回 14.15-xAI 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>该家族依靠其独特的算力优势与数据护城河, 在 LLM 红海中占据了核心生态位。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.15-xai/02-grok-1.5v/01-02-grok-1.5v-jgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.15-xai/02-grok-1.5v/01-02-grok-1.5v-jgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Grok-1.5V: 真实世界空间理解</h1>
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
