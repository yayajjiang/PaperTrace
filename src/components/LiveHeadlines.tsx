"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fallbackHeadlines, Headline } from "@/lib/headlines";
import { useLang } from "@/lib/i18n";

const tagStyle: Record<Headline["tag"], string> = {
  Research: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  Release: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  Industry: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
};

export function LiveHeadlines({ compact = false }: { compact?: boolean }) {
  const { lang, t } = useLang();
  const [items, setItems] = useState<Headline[]>(fallbackHeadlines);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    fetch(`${basePath}/data/headlines.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { items?: Headline[] }) => {
        if (Array.isArray(data.items) && data.items.length > 0) setItems(data.items);
      })
      .catch(() => undefined);
  }, [basePath]);

  const visible = items.slice(0, compact ? 3 : 6);
  const lead = visible[0];
  if (!lead) return null;

  return (
    <section aria-labelledby="signal-desk-title" className="signal-panel">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="eyebrow mb-2">
            <span className="live-dot" /> {t("Signal desk", "热点雷达")}
          </div>
          <h2 id="signal-desk-title" className="text-2xl md:text-3xl font-bold dark:text-white">
            {t("What changed in research", "科研世界刚刚发生了什么")}
          </h2>
        </div>
        <Link href="/radar" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
          {t("All signals", "全部动态")} →
        </Link>
      </div>

      <div className="grid md:grid-cols-[1.45fr_1fr] gap-3">
        <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" className="headline-lead group">
          <div className="flex items-center gap-2 mb-5">
            <span className={`topic-chip ${tagStyle[lead.tag]}`}>{lead.tag}</span>
            {lead.domain && <span className="domain-label">{lead.domain}</span>}
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{lead.date}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold leading-tight dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {lang === "en" ? lead.title : lead.titleZh}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-paper-800/65 dark:text-slate-300">
            {lang === "en" ? lead.summary : lead.summaryZh}
          </p>
          <div className="mt-7 text-sm font-semibold text-blue-600 dark:text-blue-400">
            {lead.source} ↗
          </div>
          {lead.scores && (
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-paper-100 dark:border-slate-700">
              {[[t("Impact", "影响"), lead.scores.impact], [t("Buzz", "热度"), lead.scores.buzz], [t("Utility", "实用"), lead.scores.utility]].map(([label, value]) => (
                <div key={String(label)} className="text-xs text-paper-800/40 dark:text-slate-500"><b className="text-paper-800/70 dark:text-slate-300 mr-1">{value}</b>{label}</div>
              ))}
            </div>
          )}
        </a>

        <div className="space-y-3">
          {visible.slice(1).map((item) => (
            <a key={item.id} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="headline-row group">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className={`topic-chip ${tagStyle[item.tag]}`}>{item.tag}</span>
                <time className="text-[11px] font-mono text-paper-800/40 dark:text-slate-500">{item.date}</time>
              </div>
              <h3 className="text-sm font-bold leading-snug dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === "en" ? item.title : item.titleZh}
              </h3>
              {!compact && (
                <p className="mt-1.5 text-xs leading-relaxed text-paper-800/55 dark:text-slate-400 line-clamp-2">
                  {lang === "en" ? item.summary : item.summaryZh}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-paper-800/40 dark:text-slate-500">
        {t(
          "Official sources first · refreshed daily by an automated build · editorial fallback when feeds fail",
          "官方来源优先 · 每日自动构建更新 · 数据源异常时使用人工核验内容"
        )}
        {t(" · Scores are transparent editorial heuristics, not citation metrics", " · 评分是透明的编辑启发式指标，不等同于引用量")}
      </p>
    </section>
  );
}
