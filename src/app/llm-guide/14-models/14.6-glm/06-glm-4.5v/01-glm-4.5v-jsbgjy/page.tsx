"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4.5V 技术报告精译 (多模态原生)</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>模型基础信息</strong></p>
<ul>
<li><strong>发布时间</strong>：2025年1月</li>
<li><strong>核心定位</strong>：极高分辨率、多图联合推理的视觉-语言融合旗舰。</li>
<li><strong>基座</strong>：GLM-4</li>
</ul>
</blockquote>
<h2 id="1-hxtp">1. 核心突破</h2>
<ul>
<li><strong>万物皆可视</strong>：支持最高 4K 分辨率的原生输入，无需强行裁剪或降采样，极大地保留了发票、工程图纸中的微小文字。</li>
<li><strong>双塔融合演进</strong>：将早期的浅层对齐升级为深度的跨层交叉注意力，图像特征不再仅仅作为 Prompt 放在最前面，而是直接参与每一层语言解码的残差计算。</li>
</ul>
<h2 id="2-xnpg">2. 性能评估</h2>
<p>在 MMBench 和 MathVista 上，4.5V 的表现逼近了当时的 GPT-4V，成为国产开源多模态的标杆。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxtp","text":"1. 核心突破"},{"level":2,"id":"2-xnpg","text":"2. 性能评估"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/06-glm-4.5v/01-glm-4.5v-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/06-glm-4.5v/01-glm-4.5v-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4.5V 技术报告精译 (多模态原生)</h1>
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
