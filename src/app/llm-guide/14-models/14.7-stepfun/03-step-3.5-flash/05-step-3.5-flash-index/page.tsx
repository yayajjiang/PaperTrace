"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-3.5-Flash</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<h2 id="zwd">子文档</h2>
<ul>
<li><p><a href="/llm-guide/14-models/14.7-stepfun/03-step-3.5-flash/02-step-3.5-flash-gxtlpx">Step-3.5-Flash高效推理剖析</a></p>
</li>
<li><p><a href="/llm-guide/14-models/14.7-stepfun/03-step-3.5-flash/01-step-3.5-flash-jsbgjy">Step-3.5-Flash 技术报告精译</a></p>
</li>
<li><p><a href="#broken-link">Step-3.5-Flash-Agentic低延迟设计与可扩展RL框架剖析</a></p>
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
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/05-step-3.5-flash-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/03-step-3.5-flash/05-step-3.5-flash-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-3.5-Flash</h1>
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
