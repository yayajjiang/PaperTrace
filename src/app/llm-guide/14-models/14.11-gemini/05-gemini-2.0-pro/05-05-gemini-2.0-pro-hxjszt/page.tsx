"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>05-Gemini-2.0-Pro 核心技术专题：原生多模态与长上下文的底层原理</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<h2 id="sdtzrh">深度特征融合</h2>
<p>传统的 VLM 往往会在视觉编码后产生信息的“瓶颈”(Bottleneck)。而 Gemini 家族通过交织注意力机制(Interleaved Attention)，使得每一层 Transformer 都能直接读取到原始的多模态特征，彻底打通了视觉、听觉与文本的经络。</p>
<h2 id="jdsxwcl">极端上下文处理</h2>
<p>在高达数百万的 Context Window 中，模型如何不迷失？本专题探讨了其内部可能采用的 Ring Attention 与动态 KV Cache 压缩技术，解析了其“大海捞针”全绿背后的数学机理。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"sdtzrh","text":"深度特征融合"},{"level":2,"id":"jdsxwcl","text":"极端上下文处理"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/05-gemini-2.0-pro/05-05-gemini-2.0-pro-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/05-gemini-2.0-pro/05-05-gemini-2.0-pro-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">05-Gemini-2.0-Pro 核心技术专题：原生多模态与长上下文的底层原理</h1>
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
