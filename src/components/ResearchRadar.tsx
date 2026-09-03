"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackHeadlines, Headline } from "@/lib/headlines";
import { useLang } from "@/lib/i18n";
import { QueueButton } from "@/components/QueueButton";

type SortKey = "latest" | "impact" | "buzz" | "utility";

const scoreOf = (item: Headline, key: Exclude<SortKey, "latest">) => item.scores?.[key] ?? 0;

export function ResearchRadar() {
  const { lang, t } = useLang();
  const [items, setItems] = useState<Headline[]>(fallbackHeadlines);
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [sort, setSort] = useState<SortKey>("latest");
  const [releasesOnly, setReleasesOnly] = useState(false);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    fetch(`${basePath}/data/headlines.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { generatedAt?: string; items?: Headline[] }) => {
        if (data.items?.length) setItems(data.items);
        if (data.generatedAt) setGeneratedAt(data.generatedAt);
      })
      .catch(() => undefined);
  }, [basePath]);

  const domains = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.domain || "Multidisciplinary")))], [items]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items
      .filter((item) => domain === "All" || item.domain === domain)
      .filter((item) => !releasesOnly || item.tag === "Release")
      .filter((item) => !normalized || [item.title, item.titleZh, item.summary, item.summaryZh, item.source].some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => sort === "latest" ? b.date.localeCompare(a.date) : scoreOf(b, sort) - scoreOf(a, sort));
  }, [domain, items, query, releasesOnly, sort]);

  return (
    <>
      <div className="radar-controls">
        <label className="directory-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search releases, papers and topics…", "搜索模型发布、论文与话题…")} />
        </label>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {domains.map((item) => <button key={item} onClick={() => setDomain(item)} className={`domain-pill ${domain === item ? "domain-pill-active" : ""}`}>{item === "All" ? t("All fields", "全部领域") : item}</button>)}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setReleasesOnly((value) => !value)} className={`filter-pill ${releasesOnly ? "filter-pill-active" : ""}`}>{t("Model watch", "模型发布")}</button>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="radar-select" aria-label={t("Sort signals", "动态排序")}>
              <option value="latest">{t("Latest", "最新")}</option>
              <option value="impact">{t("Highest impact", "影响力最高")}</option>
              <option value="buzz">{t("Most discussed", "火爆度最高")}</option>
              <option value="utility">{t("Most useful", "实用性最高")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_270px] gap-6 items-start">
        <div className="space-y-3">
          {visible.map((item, index) => (
            <article key={item.id} className="radar-item">
              <div className="radar-rank">{String(index + 1).padStart(2, "0")}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`topic-chip ${item.tag === "Release" ? "bg-emerald-100 text-emerald-700" : item.tag === "Industry" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{item.tag}</span>
                  <span className="domain-label">{item.domain || "Multidisciplinary"}</span>
                  <time className="text-[11px] font-mono text-paper-800/35 dark:text-slate-500 ml-auto">{item.date}</time>
                </div>
                <h2 className="font-bold text-lg leading-snug dark:text-white">{lang === "en" ? item.title : item.titleZh}</h2>
                <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-2">
                  {(lang === "en" ? item.summary : item.summaryZh) || t("Open the official source for details and evidence.", "查看官方来源了解详情与证据。")}
                </p>
                {item.scores && (
                  <div className="score-grid mt-4 max-w-md">
                    {[[t("Impact", "影响力"), item.scores.impact], [t("Buzz", "火爆度"), item.scores.buzz], [t("Utility", "实用性"), item.scores.utility]].map(([label, value]) => (
                      <div key={String(label)} className="score-item"><div className="flex justify-between text-[11px] mb-1"><span>{label}</span><b>{value}</b></div><span className="score-track"><span style={{ width: `${value}%` }} /></span></div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.source} ↗</a>
                  <QueueButton headline={item} />
                </div>
                {item.signals?.huggingFaceUpvotes !== undefined && <span className="ml-3 text-[11px] font-mono text-paper-800/40 dark:text-slate-500">↑ {item.signals.huggingFaceUpvotes} HF</span>}
                {item.provenance && (
                  <details className="score-explainer mt-4">
                    <summary>{t("Why these scores?", "为什么这样评分？")}</summary>
                    <div className="score-explainer-body">
                      <div className="flex items-center justify-between gap-3 pb-2 border-b border-paper-200/70 dark:border-slate-700">
                        <span>{t("Evidence layer", "证据层级")}</span>
                        <b>{item.provenance.layer}</b>
                      </div>
                      <dl>
                        <div><dt>{t("Impact", "影响力")}</dt><dd>{item.provenance.scoreNotes.impact}</dd></div>
                        <div><dt>{t("Buzz", "火爆度")}</dt><dd>{item.provenance.scoreNotes.buzz}</dd></div>
                        <div><dt>{t("Utility", "实用性")}</dt><dd>{item.provenance.scoreNotes.utility}</dd></div>
                      </dl>
                      <p className="score-disclaimer">{t("Heuristic signal, not an objective verdict. Open the source before making a research decision.", "这是辅助判断的启发式信号，不是客观结论；做研究决策前请打开原始来源。")}</p>
                    </div>
                  </details>
                )}
              </div>
            </article>
          ))}
          {visible.length === 0 && <div className="empty-state">{t("No signals match these filters.", "没有符合当前筛选的动态。")}</div>}
        </div>

        <aside className="radar-method">
          <div className="eyebrow mb-3">{t("How ranking works", "如何评分")}</div>
          <h2 className="text-lg font-bold dark:text-white">{t("Three signals, kept separate", "三种信号，分别呈现")}</h2>
          <div className="space-y-4 mt-5 text-sm">
            <div><b>{t("Impact", "影响力")}</b><p>{t("Scientific consequence, evidence and downstream work.", "学术后果、证据与后续工作。")}</p></div>
            <div><b>{t("Buzz", "火爆度")}</b><p>{t("Recency and verified discussion velocity across public channels.", "新鲜度与公开渠道中可验证的讨论速度。")}</p></div>
            <div><b>{t("Utility", "实用性")}</b><p>{t("Code, data, demo, API and cost to reproduce.", "代码、数据、Demo、API 与复现成本。")}</p></div>
          </div>
          <div className="mt-6 pt-5 border-t border-paper-200 dark:border-slate-700 text-xs leading-relaxed text-paper-800/45 dark:text-slate-500">
            {t("Official feeds update daily. X and Xiaohongshu signals enter only when a public post can be checked; raw popularity never overrides evidence.", "官方信息源每日更新。X 与小红书信号仅在公开内容可核验时进入；原始热度不会覆盖证据判断。")}
          </div>
          {generatedAt && <div className="mt-4 text-[10px] font-mono text-paper-800/30 dark:text-slate-600">SYNC {new Date(generatedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}</div>}
        </aside>
      </div>
    </>
  );
}
