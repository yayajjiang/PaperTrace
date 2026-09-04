"use client";

import { SourceNetwork } from "@/components/SourceNetwork";
import { CommunityPulse } from "@/components/CommunityPulse";
import { signalSources } from "@/lib/sources";
import { useLang } from "@/lib/i18n";

export default function SourcesPage() {
  const { t } = useLang();
  const fields = new Set(signalSources.flatMap((source) => source.domains)).size;
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="radar-hero">
        <div className="eyebrow mb-4">SOURCE NETWORK · {t("EDITORIAL INFRASTRUCTURE", "编辑基础设施")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl dark:text-white">{t("Large information, small trust boundaries.", "信息可以巨大，信任边界必须清楚。")}</h1>
        <p className="mt-5 text-lg leading-relaxed max-w-3xl text-paper-800/60 dark:text-slate-300">{t("PaperTrace uses communities such as LINUX DO to discover what practitioners care about, then walks back to primary evidence before publishing a claim.", "PaperTrace 用 LINUX DO 等社区发现实践者关心什么，再回到一手证据核验后发布主张。")}</p>
        <div className="radar-stats mt-8">
          <div><strong>{signalSources.length}</strong><span>{t("sources mapped", "已映射来源")}</span></div>
          <div><strong>4</strong><span>{t("evidence layers", "证据层级")}</span></div>
          <div><strong>{fields}</strong><span>{t("research fields", "研究领域")}</span></div>
          <div><strong>0</strong><span>{t("auto-post targets", "自动发帖平台")}</span></div>
        </div>
      </section>
      <section className="mt-10"><SourceNetwork /></section>
      <CommunityPulse />
    </div>
  );
}
