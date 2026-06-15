"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMo-2</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<h2 id="zwd">子文档</h2>
<ul>
<li><p><a href="/llm-guide/14-models/14.4-olmo/02-olmo-2/02-olmo-2-bhyjyrzpx">OLMo-2白盒演进与日志剖析</a></p>
</li>
<li><p><a href="/llm-guide/14-models/14.4-olmo/02-olmo-2/01-olmo-2-jsbgjy">OLMo-2 技术报告精译</a></p>
</li>
<li><p><a href="#broken-link">OLMo-2训练稳定性工程与数据科学剖析</a></p>
</li>
</ul>
<h2 id="zml">子目录</h2>
<ul>
<li><a href="#">images</a></li>
<li><a href="#">pdfs</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zwd","text":"子文档"},{"level":2,"id":"zml","text":"子目录"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/02-olmo-2/05-olmo-2-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/02-olmo-2/05-olmo-2-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMo-2</h1>
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
