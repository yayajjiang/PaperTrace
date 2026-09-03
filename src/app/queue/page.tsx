"use client";

import { AttentionQueue } from "@/components/AttentionQueue";
import { useLang } from "@/lib/i18n";

export default function QueuePage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-3xl mb-10">
        <div className="eyebrow mb-4">{t("Attention queue", "注意力队列")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("Spend attention deliberately.", "有意识地分配注意力。")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300">{t("Save first, then let a time budget turn an endless feed into a finite research plan.", "先收藏，再用时间预算把无限信息流变成有限的科研计划。")}</p>
      </section>
      <AttentionQueue />
    </div>
  );
}

