"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Ernie 家族演进总览</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14-models">返回 第 14 章：主流开源模型全景解析与技术报告精读</a></strong></p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>核心特性</th>
<th>D2</th>
<th>D5</th>
</tr>
</thead>
<tbody><tr>
<td>01-Ernie-3.5</td>
<td>飞桨架构的深度绑定</td>
<td><a href="/llm-guide/14-models/14.19-ernie/01-ernie-3.5/01-01-ernie-3.5-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.19-ernie/01-ernie-3.5/05-01-ernie-3.5-hxzt">D5</a></td>
</tr>
<tr>
<td>02-Ernie-4.0</td>
<td>知识增强大语言模型</td>
<td><a href="/llm-guide/14-models/14.19-ernie/02-ernie-4.0/01-02-ernie-4.0-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.19-ernie/02-ernie-4.0/05-02-ernie-4.0-hxzt">D5</a></td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.19-ernie/14.19-ernie" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.19-ernie/14.19-ernie" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ernie 家族演进总览</h1>
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
