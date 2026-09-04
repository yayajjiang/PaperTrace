"use client";

import { useMemo, useState } from "react";
import lifecycle from "@/data/model-lifecycle.json";
import { useLang } from "@/lib/i18n";

type LifecycleStatus = "Available" | "Preview" | "Limited" | "Watch" | "Deprecated" | "Retired";
type LifecycleItem = (typeof lifecycle)[number];

const statusOrder: Record<LifecycleStatus, number> = { Watch: 0, Deprecated: 1, Limited: 2, Preview: 3, Available: 4, Retired: 5 };
const statusClass: Record<LifecycleStatus, string> = {
  Available: "lifecycle-available",
  Preview: "lifecycle-preview",
  Limited: "lifecycle-limited",
  Watch: "lifecycle-watch",
  Deprecated: "lifecycle-deprecated",
  Retired: "lifecycle-retired",
};

function daysFromToday(date: string | null) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((Date.parse(date + "T00:00:00") - today.getTime()) / 86_400_000);
}

export function ModelLifecycle() {
  const { lang, t } = useLang();
  const [provider, setProvider] = useState("All");
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const providers = ["All", ...Array.from(new Set(lifecycle.map((item) => item.provider)))];
  const statuses = ["All", "Watch", "Deprecated", "Available", "Preview", "Limited", "Retired"];

  const items = useMemo(() => lifecycle
    .filter((item) => provider === "All" || item.provider === provider)
    .filter((item) => status === "All" || item.status === status)
    .filter((item) => !query.trim() || (item.model + " " + item.provider + " " + item.surface + " " + item.summary + " " + item.summaryZh).toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      const aDays = daysFromToday(a.actionAt);
      const bDays = daysFromToday(b.actionAt);
      const aUpcoming = aDays !== null && aDays >= 0;
      const bUpcoming = bDays !== null && bDays >= 0;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      if (aUpcoming && bUpcoming && aDays !== bDays) return (aDays || 0) - (bDays || 0);
      return statusOrder[a.status as LifecycleStatus] - statusOrder[b.status as LifecycleStatus] || b.announcedAt.localeCompare(a.announcedAt);
    }), [provider, query, status]);

  return (
    <>
      <div className="radar-controls">
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search model, provider or surface…", "搜索模型、厂商或使用端…")} /></label>
        <div className="flex flex-wrap gap-2">
          {providers.map((item) => <button key={item} onClick={() => setProvider(item)} className={"domain-pill " + (provider === item ? "domain-pill-active" : "")}>{item === "All" ? t("All providers", "全部厂商") : item}</button>)}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {statuses.map((item) => <button key={item} onClick={() => setStatus(item)} className={"filter-pill " + (status === item ? "filter-pill-active" : "")}>{item === "All" ? t("All states", "全部状态") : item}</button>)}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item: LifecycleItem) => {
          const days = daysFromToday(item.actionAt);
          return (
            <article key={item.id} className="lifecycle-card">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="md:w-36 shrink-0">
                  <span className={"lifecycle-status " + statusClass[item.status as LifecycleStatus]}>{item.status}</span>
                  <div className="mt-3 text-xs font-bold dark:text-slate-200">{item.provider}</div>
                  <div className="mt-1 text-[10px] text-paper-800/40 dark:text-slate-500">{item.surface}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-bold dark:text-white">{item.model}</h2>
                    <span className="text-[10px] font-mono text-paper-800/40 dark:text-slate-500">{item.dateLabel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-paper-800/55 dark:text-slate-400">{lang === "en" ? item.summary : item.summaryZh}</p>
                  {item.replacement && <div className="migration-line mt-3"><span>{t("Replacement", "替代型号")}</span><code>{item.replacement}</code></div>}
                  <div className="next-action mt-4"><b>{t("Next action", "下一步")}</b><p>{lang === "en" ? item.nextAction : item.nextActionZh}</p></div>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <a href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400">{t("Official source", "官方来源")} ↗</a>
                    <span className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{t("Checked", "核验")} {item.verifiedAt}</span>
                    {days !== null && days >= 0 && <span className={"deadline-count " + (days <= 30 ? "deadline-urgent" : "")}>{days === 0 ? t("today", "今天") : days + "d"}</span>}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {items.length === 0 && <div className="empty-state">{t("No lifecycle entries match these filters.", "没有符合当前筛选的生命周期动态。")}</div>}
      </div>
    </>
  );
}
