"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>xAI 家族演进总览</h1>
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
<td>01-Grok-1</td>
<td>314B 巨无霸全开源</td>
<td><a href="/llm-guide/14-models/14.15-xai/01-grok-1/01-01-grok-1-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.15-xai/01-grok-1/05-01-grok-1-hxzt">D5</a></td>
</tr>
<tr>
<td>02-Grok-1.5V</td>
<td>真实世界空间理解</td>
<td><a href="/llm-guide/14-models/14.15-xai/02-grok-1.5v/01-02-grok-1.5v-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.15-xai/02-grok-1.5v/05-02-grok-1.5v-hxzt">D5</a></td>
</tr>
<tr>
<td>03-Grok-2</td>
<td>混合黑林模型与 X 数据飞轮</td>
<td><a href="/llm-guide/14-models/14.15-xai/03-grok-2/01-03-grok-2-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.15-xai/03-grok-2/05-03-grok-2-hxzt">D5</a></td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.15-xai/14.15-xai" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.15-xai/14.15-xai" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">xAI 家族演进总览</h1>
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
