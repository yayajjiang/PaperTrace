"use client";

import { DataHealth } from "@/components/DataHealth";
import { useLang } from "@/lib/i18n";

export default function HealthPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-4xl">
        <div className="eyebrow mb-4">DATA HEALTH · {t("PUBLIC RECEIPTS", "公开凭据")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("Freshness is part of the answer.", "新鲜度，本身就是答案的一部分。")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300 max-w-3xl">{t("See when each automated desk last ran, which upstream source failed, and whether old records need human review. No green badge is inferred from missing data.", "查看每条自动化信息流上次运行时间、失败的上游来源，以及哪些旧记录需要人工复核。缺失数据不会被推断成绿色正常。")}</p>
      </section>
      <section className="mt-10"><DataHealth /></section>
    </div>
  );
}
