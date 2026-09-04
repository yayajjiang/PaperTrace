"use client";

import { ModelLifecycle } from "@/components/ModelLifecycle";
import lifecycle from "@/data/model-lifecycle.json";
import { useLang } from "@/lib/i18n";

export default function ModelsPage() {
  const { t } = useLang();
  const active = lifecycle.filter((item) => ["Available", "Preview", "Limited"].includes(item.status)).length;
  const migration = lifecycle.filter((item) => ["Watch", "Deprecated"].includes(item.status)).length;
  const providers = new Set(lifecycle.map((item) => item.provider)).size;
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="radar-hero">
        <div className="eyebrow mb-4">MODEL LIFECYCLE · {t("ACTION DESK", "行动台")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl dark:text-white">{t("A launch is news. A shutdown is a deadline.", "模型发布是新闻，模型下线是截止日期。")}</h1>
        <p className="mt-5 text-lg leading-relaxed max-w-3xl text-paper-800/60 dark:text-slate-300">{t("Track releases, preview access, deprecations, retirements and replacement paths without mixing ChatGPT product availability with API availability.", "追踪发布、预览准入、弃用、下线与替代路径，并严格区分 ChatGPT 产品端和 API 端的可用性。")}</p>
        <div className="radar-stats mt-8">
          <div><strong>{active}</strong><span>{t("available / preview", "可用 / 预览")}</span></div>
          <div><strong>{migration}</strong><span>{t("migration watch", "迁移关注")}</span></div>
          <div><strong>{providers}</strong><span>{t("providers tracked", "已追踪厂商")}</span></div>
          <div><strong>100%</strong><span>{t("primary sources", "官方一手来源")}</span></div>
        </div>
      </section>
      <section className="mt-10"><ModelLifecycle /></section>
      <p className="mt-8 text-xs leading-relaxed text-paper-800/40 dark:text-slate-500">{t("A 'no retirement before' date is a commitment boundary, not a confirmed shutdown. Always re-open the official source before a production migration.", "“不会早于某日下线”是承诺边界，不是已确认停服日。生产迁移前务必再次打开官方来源核验。")}</p>
    </div>
  );
}
