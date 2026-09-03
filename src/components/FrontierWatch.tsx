"use client";

import { useMemo, useState } from "react";
import { frontierItems, FrontierType } from "@/lib/frontier";
import { useLang } from "@/lib/i18n";

const types: Array<FrontierType | "All"> = ["All", "Lab", "Team", "Model", "Infrastructure", "Direction"];

export function FrontierWatch() {
  const { lang, t } = useLang();
  const [type, setType] = useState<FrontierType | "All">("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return frontierItems.filter((item) => (type === "All" || item.type === type) && (!normalized || [item.name, item.nameZh, item.domain, item.summary, item.summaryZh, ...item.people].some((value) => value.toLowerCase().includes(normalized))));
  }, [query, type]);

  return (
    <>
      <div className="directory-controls">
        <label className="directory-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search labs, people, models or directions…", "搜索实验室、研究者、模型或方向…")} /></label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {types.map((item) => <button key={item} onClick={() => setType(item)} className={`filter-pill ${type === item ? "filter-pill-active" : ""}`}>{item === "All" ? t("All frontier signals", "全部前沿信号") : item}</button>)}
        </div>
      </div>
      <div className="frontier-timeline">
        {visible.map((item) => (
          <article key={item.id} className="frontier-item">
            <div className="frontier-date">{item.announcedAt}</div>
            <div className="frontier-node" aria-hidden="true" />
            <div className="frontier-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="topic-chip bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{item.type}</span>
                <span className="domain-label">{item.domain}</span>
                <span className="topic-chip bg-paper-100 text-paper-800/45 dark:bg-slate-700 dark:text-slate-400">{item.status}</span>
              </div>
              <h2 className="text-xl font-bold mt-3 dark:text-white">{lang === "en" ? item.name : item.nameZh}</h2>
              <p className="text-sm leading-relaxed text-paper-800/60 dark:text-slate-300 mt-2">{lang === "en" ? item.summary : item.summaryZh}</p>
              <div className="why-watch mt-4"><b>{t("Why watch", "为什么值得关注")}</b><p>{lang === "en" ? item.whyWatch : item.whyWatchZh}</p></div>
              <div className="flex flex-wrap items-center gap-2 mt-5">
                {item.people.map((person) => <span key={person} className="subtle-chip">{person}</span>)}
                <span className="attention-badge">◷ {item.attention}</span>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">{t("Primary source", "官方来源")} ↗</a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

