"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4.7 技术报告精译 (全员 Agent)</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>模型基础信息</strong></p>
<ul>
<li><strong>发布时间</strong>：2025年3月</li>
<li><strong>核心定位</strong>：工具调用 (Tool-Use) 与智能体能力 (Agent) 满配的终极版本。</li>
</ul>
</blockquote>
<h2 id="1-wsmhy-4-7">1. 为什么会有 4.7？</h2>
<p>在 GLM-5 正式发布前，智谱需要一个过渡版本来全面测试其最新研发的 Agent-Driven (智能体驱动) 训练引擎。GLM-4.7 应运而生。它能够原生调用 Python 解释器、浏览器渲染器以及几十种外部 API。</p>
<h2 id="2-pcbx">2. 评测表现</h2>
<p>在 Berkeley Function Calling Leaderboard (BFCL) 上取得了统治级地位，超越了几乎所有同等规模的开源模型。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wsmhy-4-7","text":"1. 为什么会有 4.7？"},{"level":2,"id":"2-pcbx","text":"2. 评测表现"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/07-glm-4.7/01-glm-4.7-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/07-glm-4.7/01-glm-4.7-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4.7 技术报告精译 (全员 Agent)</h1>
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
