"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Mistral 家族演进总览</h1>
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
<td>01-Mistral-7B</td>
<td>欧洲开源之光的起跑线</td>
<td><a href="/llm-guide/14-models/14.14-mistral/01-mistral-7b/01-01-mistral-7b-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.14-mistral/01-mistral-7b/05-01-mistral-7b-hxzt">D5</a></td>
</tr>
<tr>
<td>02-Mixtral-8x7B</td>
<td>首个击败 LLaMA 的开源 MoE</td>
<td><a href="/llm-guide/14-models/14.14-mistral/02-mixtral-8x7b/01-02-mixtral-8x7b-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.14-mistral/02-mixtral-8x7b/05-02-mixtral-8x7b-hxzt">D5</a></td>
</tr>
<tr>
<td>03-Mistral-Large</td>
<td>剑指 GPT-4 的旗舰闭源模型</td>
<td><a href="/llm-guide/14-models/14.14-mistral/03-mistral-large/01-03-mistral-large-jgjy">D2</a></td>
<td><a href="/llm-guide/14-models/14.14-mistral/03-mistral-large/05-03-mistral-large-hxzt">D5</a></td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.14-mistral/14.14-mistral" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.14-mistral/14.14-mistral" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mistral 家族演进总览</h1>
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
