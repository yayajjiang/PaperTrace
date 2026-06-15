"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemini 1.5 Flash: 高频API调用的极致速度优化 - 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>核心定位</strong>：本报告深度解构了 Google DeepMind 在该阶段发布的技术细节与架构思想。作为闭源模型，其技术报告是窥探其内部机制的唯一窗口。</p>
</blockquote>
<h2 id="1-jgyjytp">1. 架构演进与突破</h2>
<p>Google 在此版本中继续深化了原生多模态(Native Multimodal)的理念，摒弃了早期模型中常见的“拼凑式”架构(如单独的视觉编码器加语言解码器)，而是采用了一套统一的 Token 空间来联合表征音频、图像、视频和文本。</p>
<h2 id="2-xljcss">2. 训练基础设施</h2>
<p>借助 Google 内部强大的 TPU v5/v6 算力矩阵与 Pathways 架构，模型在极其庞大的混合数据源上进行了预训练，并通过 RLHF 和特殊的长程强化学习实现了深度对齐。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jgyjytp","text":"1. 架构演进与突破"},{"level":2,"id":"2-xljcss","text":"2. 训练基础设施"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/03-gemini-1.5-flash/01-03-gemini-1.5-flash-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/03-gemini-1.5-flash/01-03-gemini-1.5-flash-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemini 1.5 Flash: 高频API调用的极致速度优化 - 技术报告精译</h1>
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
