"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>InstructGPT: RLHF 对齐人类意图的里程碑 - 技术探测与反向工程</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>背景</strong>：该模型并未完全开源其底层代码与权重，本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。</p>
</blockquote>
<h2 id="hxjgcj">核心架构拆解</h2>
<p>在这个版本中，OpenAI 引入了极其超前的设计理念。无论是在数据飞轮的构建、并行训练的切分策略，还是在拒绝采样的安全围栏上，都展现了极强的工程掌控力。</p>
<h2 id="nlbj">能力边界</h2>
<p>通过官方披露的几十项 Benchmark 评估，我们在本章节深度还原了它在代码编写、逻辑推理、数学证明等维度的能力极值。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"hxjgcj","text":"核心架构拆解"},{"level":2,"id":"nlbj","text":"能力边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/04-instruct-gpt/01-04-instruct-gpt-fxgcjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/04-instruct-gpt/01-04-instruct-gpt-fxgcjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">InstructGPT: RLHF 对齐人类意图的里程碑 - 技术探测与反向工程</h1>
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
