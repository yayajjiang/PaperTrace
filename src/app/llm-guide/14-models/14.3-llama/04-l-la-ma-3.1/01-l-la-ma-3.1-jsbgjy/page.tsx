"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>LLaMA-3.1 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>核心定位</strong>：Meta 开源帝国的巅峰之作，高达 405B 的密集参数模型首次在多项基准上逼平甚至超越闭源王者 GPT-4o 与 Claude 3.5 Sonnet。</p>
</blockquote>
<h2 id="1-sjgcycsxw">1. 数据工程与长上下文</h2>
<p>Meta 在 3.1 世代展现了恐怖的数据清洗能力，预训练数据规模超过 15T Tokens。同时，通过 RoPE 参数的大幅调整，将原生上下文窗口从 8K 暴力拉升至 128K。</p>
<h2 id="2-gjtyyhxl">2. 工具调用与后训练</h2>
<p>在 SFT 阶段加入了海量的 Tool-Use 与数学代码轨迹，配合超大规模的 DPO (直接偏好优化)，彻底让 LLaMA 具备了企业级智能体(Agent)中枢的能力。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjgcycsxw","text":"1. 数据工程与长上下文"},{"level":2,"id":"2-gjtyyhxl","text":"2. 工具调用与后训练"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/04-l-la-ma-3.1/01-l-la-ma-3.1-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/04-l-la-ma-3.1/01-l-la-ma-3.1-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">LLaMA-3.1 技术报告精译</h1>
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
