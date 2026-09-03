"use client";

import { ResearchRadar } from "@/components/ResearchRadar";
import { TopicPulse } from "@/components/TopicPulse";
import { MomentumMap } from "@/components/MomentumMap";
import { useLang } from "@/lib/i18n";

export default function RadarPage() {
  const { t } = useLang();
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-4xl">
        <div className="eyebrow mb-4"><span className="live-dot" /> {t("Research radar", "科研雷达")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("New is not the same as important.", "最新，不等于最重要。")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300 max-w-3xl">
          {t("Track model launches, papers and technical shifts across fields. Sort the same feed by impact, public attention or practical value — and always inspect the source.", "追踪跨领域的模型发布、论文与技术变化。按影响力、公开热度或实用价值查看同一信息流，并始终回到原始来源。")}
        </p>
      </section>
      <section className="mt-12">
        <div className="section-heading-row">
          <div><div className="eyebrow mb-2">{t("Topic pulse", "研究主线")}</div><h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Where attention is moving", "注意力正在流向哪里")}</h2></div>
          <span className="text-xs text-paper-800/40 dark:text-slate-500">{t("Editor-tracked · source-backed", "编辑追踪 · 来源可查")}</span>
        </div>
        <TopicPulse />
      </section>
      <section className="mt-16">
        <div className="section-heading-row">
          <div><div className="eyebrow mb-2">{t("Momentum map", "热点动量图")}</div><h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("See what is hot — and whether it matters", "看见热度，也看见它是否重要")}</h2></div>
          <span className="text-xs text-paper-800/40 dark:text-slate-500">arXiv · official labs · model releases</span>
        </div>
        <MomentumMap />
      </section>
      <section className="mt-16">
        <div className="section-heading-row"><div><div className="eyebrow mb-2">{t("Live stream", "实时信息流")}</div><h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Signals, ranked your way", "按你的方式排序")}</h2></div></div>
        <ResearchRadar />
      </section>
    </div>
  );
}
