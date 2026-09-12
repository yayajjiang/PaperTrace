"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax-M2 核心技术专题：Lightning Attention 闪电注意力</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<h2 id="1-xxzyldfx">1. 线性注意力的复兴</h2>
<p>传统的 Transformer 饱受 KV Cache 显存墙的困扰。M2 摒弃了标准的 Softmax 归一化，通过核技巧 (Kernel Trick) 和右乘关联机制，在训练和推理时将复杂度极限压缩。这意味着无论上下文多长，理论上的推理状态大小都是固定的 (O(1) 的显存增长)。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-xxzyldfx","text":"1. 线性注意力的复兴"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/02-mini-max-m2/05-mini-max-m2-lightning-attention-jx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/02-mini-max-m2/05-mini-max-m2-lightning-attention-jx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax-M2 核心技术专题：Lightning Attention 闪电注意力</h1>
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
