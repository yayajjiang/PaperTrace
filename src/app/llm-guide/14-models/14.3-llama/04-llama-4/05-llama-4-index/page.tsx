"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama-4</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<p>Llama-4 系列模型的技术报告精译与核心技术专题文档.</p>
<h2 id="zwd">子文档</h2>
<ul>
<li><p><a href="#broken-link">Llama-4架构迭代剖析</a></p>
</li>
<li><p><a href="/llm-guide/14-models/14.3-llama/04-llama-4/01-llama-4-jsbgjy">01-Llama-4 技术报告精译</a></p>
</li>
<li><p><a href="/llm-guide/14-models/14.3-llama/04-llama-4/05-llama-4-architecture-overview">05-Llama-4 架构总览</a></p>
</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zwd","text":"子文档"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/04-llama-4/05-llama-4-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/04-llama-4/05-llama-4-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama-4</h1>
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
