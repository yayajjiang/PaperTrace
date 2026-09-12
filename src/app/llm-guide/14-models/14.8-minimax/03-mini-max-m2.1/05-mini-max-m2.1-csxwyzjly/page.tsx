"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax-M2.1 核心技术专题：极长上下文与专家路由优化</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<h2 id="moe-yxxzyldhwxy">MoE 与线性注意力的化武效应</h2>
<p>M2.1 将 MoE 架构与 Lightning Attention 进行了底层算子级别的融合 (Triton 优化)。它证明了，在极长文中，部分 Token 只需要极少数专门处理时序关联的 Expert，这种解耦大幅度降低了冗余计算。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"moe-yxxzyldhwxy","text":"MoE 与线性注意力的化武效应"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/03-mini-max-m2.1/05-mini-max-m2.1-csxwyzjly" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/03-mini-max-m2.1/05-mini-max-m2.1-csxwyzjly" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax-M2.1 核心技术专题：极长上下文与专家路由优化</h1>
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
