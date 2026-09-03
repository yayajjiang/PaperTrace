"use client";

import { FrontierWatch } from "@/components/FrontierWatch";
import { useLang } from "@/lib/i18n";

export default function FrontierPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-4xl">
        <div className="eyebrow mb-4">{t("Frontier watch", "前沿观察")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("Watch the builders before the benchmark.", "在榜单之前，先看谁在建设未来。")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300 max-w-3xl">{t("New labs, research teams, model families and technical infrastructure — resolved to canonical entities, linked to primary sources, and paired with a reason to spend attention.", "追踪新实验室、新团队、新模型家族与技术基础设施——解析到准确实体，连接官方来源，并说明为何值得投入注意力。")}</p>
      </section>
      <section className="mt-8"><FrontierWatch /></section>
    </div>
  );
}

