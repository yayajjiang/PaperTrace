"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";

type Desk = "headlines" | "community" | "incidents" | "deadlines" | "migrations";
type SeenState = { reviewedAt: string; seen: Partial<Record<Desk, string[]>> };

const storageKey = "papertrace-signal-baseline-v1";
const desks: Array<{ id: Desk; label: [string, string]; href: string }> = [
  { id: "headlines", label: ["headlines", "条头条"], href: "/radar" },
  { id: "community", label: ["community threads", "条社区讨论"], href: "/sources" },
  { id: "incidents", label: ["provider incidents", "条服务事故"], href: "/models" },
  { id: "deadlines", label: ["urgent deadlines", "个近期截止"], href: "/events" },
  { id: "migrations", label: ["migration actions", "项迁移动作"], href: "/models" },
];

export function SinceLastVisit() {
  const { lang, t } = useLang();
  const [current, setCurrent] = useState<Partial<Record<Desk, string[]>>>({});
  const [previous, setPrevious] = useState<SeenState | null | undefined>(undefined);
  const [failed, setFailed] = useState(0);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    let saved: SeenState | null = null;
    try { saved = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch {}
    setPrevious(saved);

    const requests = [
      fetch(`${basePath}/data/headlines.json`, { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((x) => ["headlines", (x.items || []).map((item: { id: string }) => item.id)] as const),
      fetch(`${basePath}/data/community-signals.json`, { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((x) => ["community", (x.items || []).map((item: { id: string }) => item.id)] as const),
      fetch(`${basePath}/data/provider-status.json`, { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((x) => ["incidents", (x.providers || []).flatMap((provider: { name: string; recentIncidents?: Array<{ id: string }> }) => (provider.recentIncidents || []).map((incident) => `${provider.name}:${incident.id}`))] as const),
      fetch(`${basePath}/data/event-health.json`, { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((x) => ["deadlines", (x.urgent || []).map((item: { id: string }) => item.id)] as const),
      fetch(`${basePath}/data/model-health.json`, { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject()).then((x) => ["migrations", (x.upcomingActions || []).map((item: { id: string }) => item.id)] as const),
    ];
    Promise.allSettled(requests).then((results) => {
      const entries = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      const next = Object.fromEntries(entries) as Partial<Record<Desk, string[]>>;
      setFailed(results.length - entries.length);
      setCurrent(next);
      if (!saved && entries.length) {
        const baseline = { reviewedAt: new Date().toISOString(), seen: next };
        try { localStorage.setItem(storageKey, JSON.stringify(baseline)); } catch {}
        setPrevious(baseline);
      }
    });
  }, [basePath]);

  const deltas = useMemo(() => Object.fromEntries(desks.map((desk) => {
    const seen = new Set(previous?.seen[desk.id] || []);
    return [desk.id, (current[desk.id] || []).filter((id) => !seen.has(id)).length];
  })) as Record<Desk, number>, [current, previous]);
  const total = Object.values(deltas).reduce((sum, count) => sum + count, 0);
  const ready = previous !== undefined && Object.keys(current).length > 0;

  const markReviewed = () => {
    const baseline: SeenState = { reviewedAt: new Date().toISOString(), seen: { ...previous?.seen, ...current } };
    try { localStorage.setItem(storageKey, JSON.stringify(baseline)); } catch {}
    setPrevious(baseline);
  };

  return (
    <section className="visit-delta" aria-live="polite">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="min-w-[170px]">
          <div className="eyebrow">{t("Since your review", "自上次查看")}</div>
          <div className="mt-2 flex items-baseline gap-2"><strong className="text-3xl dark:text-white">{ready ? total : "–"}</strong><span className="text-xs text-paper-800/45 dark:text-slate-500">{t("new signals", "条新信号")}</span></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
          {desks.map((desk) => <a key={desk.id} href={`${basePath}${desk.href}`} className={`delta-desk ${deltas[desk.id] ? "delta-desk-new" : ""}`}><b>{ready ? deltas[desk.id] : "–"}</b><span>{t(desk.label[0], desk.label[1])}</span></a>)}
        </div>
        <button onClick={markReviewed} disabled={!ready || total === 0} className="calendar-export-button whitespace-nowrap">{t("Mark reviewed", "标为已看")}</button>
      </div>
      <div className="flex flex-wrap justify-between gap-2 mt-3 text-[10px] text-paper-800/35 dark:text-slate-500">
        <span>{previous?.reviewedAt ? `${t("Baseline", "基线")} · ${new Date(previous.reviewedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}` : t("Creating a private local baseline…", "正在建立仅保存在本地的基线…")}</span>
        <span>{failed ? t(`${failed} desk(s) unavailable; baseline not overwritten`, `${failed} 条信息流不可用；不会覆盖原基线`) : t("Stored only in this browser", "仅存于此浏览器")}</span>
      </div>
    </section>
  );
}
