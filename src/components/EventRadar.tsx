"use client";

import { useMemo, useState } from "react";
import { EventType, researchEvents } from "@/lib/events";
import { useLang } from "@/lib/i18n";

const types: Array<EventType | "All"> = ["All", "Conference", "Hackathon", "Expo", "Call"];
const locations = ["All", "China", "Global", "Other"] as const;
const today = new Date().toISOString().slice(0, 10);

function daysUntil(date: string) {
  return Math.ceil((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export function EventRadar() {
  const { lang, t } = useLang();
  const [type, setType] = useState<EventType | "All">("All");
  const [location, setLocation] = useState<(typeof locations)[number]>("All");
  const [domain, setDomain] = useState("All");
  const [query, setQuery] = useState("");

  const domains = useMemo(() => ["All", ...Array.from(new Set(researchEvents.flatMap((event) => event.domains)))], []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return researchEvents
      .filter((event) => type === "All" || event.type === type)
      .filter((event) => domain === "All" || event.domains.includes(domain))
      .filter((event) => location === "All" || (location === "China" ? event.location.includes("China") : location === "Global" ? /Global|online/.test(event.location) : !event.location.includes("China") && !/Global|online/.test(event.location)))
      .filter((event) => !normalized || [event.title, event.titleZh, event.location, event.locationZh, event.organizer, ...event.domains].some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => (a.deadlineAt || a.startsAt).localeCompare(b.deadlineAt || b.startsAt));
  }, [domain, location, query, type]);

  const upcoming = visible.filter((event) => event.endsAt >= today);
  const recent = visible.filter((event) => event.endsAt < today && daysUntil(event.endsAt) >= -30);

  const renderEvent = (event: (typeof researchEvents)[number]) => {
    const actionDate = event.deadlineAt && event.deadlineAt >= today ? event.deadlineAt : event.startsAt;
    const remaining = daysUntil(actionDate);
    const started = event.startsAt <= today && event.endsAt >= today;
    return (
      <article key={event.id} className="event-card">
        <div className="event-calendar" aria-hidden="true"><b>{new Date(`${event.startsAt}T00:00:00Z`).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "short" })}</b><strong>{event.startsAt.slice(-2)}</strong></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`topic-chip ${event.type === "Hackathon" ? "bg-violet-100 text-violet-700" : event.type === "Call" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{event.type}</span>
            <span className="domain-label">{event.format}</span>
            {started && <span className="topic-chip bg-emerald-100 text-emerald-700">{t("HAPPENING NOW", "正在进行")}</span>}
          </div>
          <h2 className="text-lg font-bold mt-3 dark:text-white">{lang === "en" ? event.title : event.titleZh}</h2>
          <p className="mt-1 text-xs font-medium text-paper-800/45 dark:text-slate-500">{lang === "en" ? event.location : event.locationZh} · {event.startsAt} → {event.endsAt}</p>
          <p className="mt-3 text-sm leading-relaxed text-paper-800/55 dark:text-slate-400">{lang === "en" ? event.summary : event.summaryZh}</p>
          <div className="flex flex-wrap gap-1.5 mt-4">{event.domains.map((domain) => <span key={domain} className="subtle-chip">{domain}</span>)}</div>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {event.deadlineAt && event.deadlineAt >= today && <span className="event-deadline"><b>{lang === "en" ? event.deadlineLabel : event.deadlineLabelZh}</b> · {event.deadlineAt}</span>}
            <a href={event.href} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">{t("Official page", "官网核验")} ↗</a>
          </div>
          <div className="mt-3 text-[9px] font-mono text-paper-800/25 dark:text-slate-600">{t("VERIFIED", "核验于")} {event.verifiedAt} · {event.organizer}</div>
        </div>
        {event.endsAt >= today && <div className={`countdown-badge ${remaining <= 7 ? "countdown-urgent" : ""}`}><b>{Math.max(0, remaining)}</b><span>{t("days", "天")}</span></div>}
      </article>
    );
  };

  return (
    <>
      <div className="directory-controls">
        <label className="directory-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search events, cities or domains…", "搜索活动、城市或领域…")} /></label>
        <div className="flex flex-wrap gap-2">
          {types.map((item) => <button key={item} onClick={() => setType(item)} className={`filter-pill ${type === item ? "filter-pill-active" : ""}`}>{item === "All" ? t("All formats", "全部类型") : item}</button>)}
          <span className="hidden sm:block w-px bg-paper-200 dark:bg-slate-700 mx-1" />
          {locations.map((item) => <button key={item} onClick={() => setLocation(item)} className={`filter-pill ${location === item ? "filter-pill-active" : ""}`}>{item === "All" ? t("Everywhere", "全部地区") : item === "China" ? t("China", "中国") : item === "Global" ? t("Online / global", "线上 / 全球") : t("International", "海外线下")}</button>)}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {domains.map((item) => <button key={item} onClick={() => setDomain(item)} className={`domain-pill ${domain === item ? "domain-pill-active" : ""}`}>{item === "All" ? t("All fields", "全部领域") : item}</button>)}
        </div>
      </div>
      <div className="space-y-3">{upcoming.map(renderEvent)}</div>
      {recent.length > 0 && <section className="mt-12"><div className="eyebrow mb-4">{t("Just ended · watch next cycle", "刚刚结束 · 追踪下一届")}</div><div className="space-y-3 opacity-75">{recent.map(renderEvent)}</div></section>}
      {visible.length === 0 && <div className="empty-state">{t("No verified events match these filters.", "没有符合筛选条件的已核验活动。")}</div>}
    </>
  );
}
