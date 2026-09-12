"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5V-Turbo 多模态 Agent 架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文档基于 D2 精译和 D4 逐段精译整理, 聚焦核心技术点的深度剖析.
状态: 待完善.</p>
</blockquote>
<h2 id="1-sjdjyhxdc">1 设计动机与核心洞察</h2>
<p>[待补充: 该技术点解决了什么工程痛点, 核心 insight 是什么]</p>
<h2 id="2-yltd">2 原理推导</h2>
<p>[待补充: 完整的技术原理, 含 LaTeX 公式]</p>
<h2 id="3-gcsxxj">3 工程实现细节</h2>
<p>[待补充: 具体实现中的关键决策和 trade-off]</p>
<h2 id="4-ytljsdb">4 与同类技术对比</h2>
<p>[待补充: 横向对比表]</p>
<h2 id="5-jxxyfx">5 局限性与风险</h2>
<p>[待补充: 该方法的前提假设和失效场景]</p>
<h2 id="6-zsktb">6 知识库同步</h2>
<ul>
<li>同步位置: [待补充]</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdjyhxdc","text":"1 设计动机与核心洞察"},{"level":2,"id":"2-yltd","text":"2 原理推导"},{"level":2,"id":"3-gcsxxj","text":"3 工程实现细节"},{"level":2,"id":"4-ytljsdb","text":"4 与同类技术对比"},{"level":2,"id":"5-jxxyfx","text":"5 局限性与风险"},{"level":2,"id":"6-zsktb","text":"6 知识库同步"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/10-glm-5v-turbo/02-glm-5v-turbo-dmt-agent-jgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/10-glm-5v-turbo/02-glm-5v-turbo-dmt-agent-jgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5V-Turbo 多模态 Agent 架构剖析</h1>
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
