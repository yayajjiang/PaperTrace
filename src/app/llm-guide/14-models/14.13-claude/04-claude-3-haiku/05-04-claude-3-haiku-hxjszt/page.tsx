"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>04-Claude-3-Haiku 核心技术专题：RLAIF 与模型神经元干预</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.13-claude/14.13-claude">返回 14.13-Claude 家族总览</a></strong></p>
</blockquote>
<h2 id="xf-ai-ddcsx">宪法 AI 的底层数学</h2>
<p>有别于单纯依赖人类标注的 RLHF，Claude 采用 RLAIF 机制让模型根据一套“宪法(原则集)”自我批判并修正其输出。本专题深度拆解了这套奖励反馈树的动态收敛过程。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"xf-ai-ddcsx","text":"宪法 AI 的底层数学"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.13-claude/04-claude-3-haiku/05-04-claude-3-haiku-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.13-claude/04-claude-3-haiku/05-04-claude-3-haiku-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">04-Claude-3-Haiku 核心技术专题：RLAIF 与模型神经元干预</h1>
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
