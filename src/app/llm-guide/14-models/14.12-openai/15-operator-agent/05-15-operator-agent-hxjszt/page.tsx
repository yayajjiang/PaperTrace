"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>15-Operator-Agent 核心技术专题：黑盒边界与逆向工程</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.12-openai/14.12-openai">返回 14.12-OpenAI 家族总览</a></strong></p>
</blockquote>
<h2 id="ycztyyszyl">隐藏状态与隐式注意力</h2>
<p>由于我们无法直接获取其 Attention Matrix, 学界往往通过对比生成的 Logit 分布与梯度扰动来推测其层级结构。证据表明, 该模型在深层网络中发生了一次维度的跃迁压缩。</p>
<h2 id="jcsszm">基础设施之谜</h2>
<p>OpenAI 如何在万卡集群上保证连续数月的无故障训练？本专题探讨了其可能采用的 3D 并行策略、Checkpoint 异步持久化以及独特的故障恢复态机制。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ycztyyszyl","text":"隐藏状态与隐式注意力"},{"level":2,"id":"jcsszm","text":"基础设施之谜"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/15-operator-agent/05-15-operator-agent-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/15-operator-agent/05-15-operator-agent-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">15-Operator-Agent 核心技术专题：黑盒边界与逆向工程</h1>
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
