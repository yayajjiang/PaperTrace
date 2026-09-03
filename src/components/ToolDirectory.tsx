"use client";

import { useEffect, useMemo, useState } from "react";
import { researchTools, ResearchDomain, ToolCategory } from "@/lib/tools";
import { useLang } from "@/lib/i18n";

const categories: Array<ToolCategory | "All"> = ["All", "Agent Skills", "MCP & Infra", "Paper Search", "People Search", "Data & Compute", "Demo"];
const domains: Array<ResearchDomain | "All"> = ["All", "AI & CS", "Bio & Medicine", "Physics", "Math & Stats", "Materials & Chemistry", "Social Science", "Multidisciplinary"];
const voteKey = "papertrace-tool-votes";

export function ToolDirectory() {
  const { lang, t } = useLang();
  const [category, setCategory] = useState<ToolCategory | "All">("All");
  const [domain, setDomain] = useState<ResearchDomain | "All">("All");
  const [query, setQuery] = useState("");
  const [votes, setVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { setVotes(new Set(JSON.parse(localStorage.getItem(voteKey) || "[]"))); } catch {}
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return researchTools.filter((tool) => {
      if (category !== "All" && tool.category !== category) return false;
      if (domain !== "All" && !tool.domains.includes(domain)) return false;
      if (!normalized) return true;
      return [tool.name, tool.tagline, tool.taglineZh, tool.description, tool.descriptionZh, ...tool.tags]
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [category, domain, query]);

  const toggleVote = (id: string) => {
    setVotes((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(voteKey, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  return (
    <>
      <div className="directory-controls">
        <label className="directory-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search tools, tasks or tags…", "搜索工具、任务或标签…")} />
        </label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`filter-pill ${category === item ? "filter-pill-active" : ""}`}>
              {item === "All" ? t("All", "全部") : item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-paper-800/35 dark:text-slate-500 mr-1">{t("Field", "领域")}</span>
          {domains.map((item) => (
            <button key={item} onClick={() => setDomain(item)} className={`domain-pill ${domain === item ? "domain-pill-active" : ""}`}>
              {item === "All" ? t("All fields", "全部领域") : item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((tool) => {
          const voted = votes.has(tool.id);
          return (
            <article key={tool.id} className={`tool-card ${tool.featured ? "tool-card-featured" : ""}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <button onClick={() => toggleVote(tool.id)} className={`vote-button flex-row md:flex-col ${voted ? "vote-button-active" : ""}`} aria-pressed={voted}>
                  <span>↑</span><span>{tool.votes + (voted ? 1 : 0)}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="topic-chip bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{tool.category}</span>
                    {tool.featured && <span className="topic-chip bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">{t("EDITOR'S PICK", "编辑精选")}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tool.domains.map((item) => <span key={item} className="domain-label">{item}</span>)}
                  </div>
                  <h2 className="text-xl font-bold dark:text-white">{tool.name}</h2>
                  <p className="mt-1 font-medium text-blue-600 dark:text-blue-400">{lang === "en" ? tool.tagline : tool.taglineZh}</p>
                  <p className="mt-3 text-sm leading-relaxed text-paper-800/60 dark:text-slate-300">{lang === "en" ? tool.description : tool.descriptionZh}</p>

                  <div className="score-grid mt-5" aria-label={t("Editorial scores", "编辑评分")}>
                    {[
                      [t("Impact", "影响力"), tool.scores.impact],
                      [t("Buzz", "火爆度"), tool.scores.buzz],
                      [t("Utility", "实用性"), tool.scores.utility],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="score-item">
                        <div className="flex justify-between text-[11px] mb-1"><span>{label}</span><b>{value}</b></div>
                        <span className="score-track"><span style={{ width: `${value}%` }} /></span>
                      </div>
                    ))}
                  </div>

                  {tool.evidence && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">
                      {tool.evidence.map((item) => (
                        <div key={item.label} className="metric-mini">
                          <strong>{item.value}</strong>
                          <span>{lang === "en" ? item.label : item.labelZh}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {tool.install && (
                    <div className="install-line mt-4"><span>$</span><code>{tool.install}</code></div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-5">
                    <a href={tool.href} target="_blank" rel="noopener noreferrer" className="button-primary">{t("Try it", "立即体验")} ↗</a>
                    {tool.github && tool.github !== tool.href && <a href={tool.github} target="_blank" rel="noopener noreferrer" className="button-secondary">GitHub ↗</a>}
                    {tool.paper && <a href={tool.paper} target="_blank" rel="noopener noreferrer" className="button-secondary">Paper ↗</a>}
                    {tool.guide && <a href={tool.guide} target="_blank" rel="noopener noreferrer" className="button-secondary">{t("Guide", "教程")} ↗</a>}
                    <div className="flex flex-wrap gap-1.5 md:ml-auto">
                      {tool.tags.map((tag) => <span key={tag} className="subtle-chip">{tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && <div className="empty-state">{t("No tools match this search yet.", "暂时没有匹配的工具。")}</div>}
      </div>
      <p className="mt-4 text-[11px] text-paper-800/35 dark:text-slate-500 text-right">{t("Upvotes are stored in this browser in the static preview.", "静态预览版的点赞保存在此浏览器。")}</p>
    </>
  );
}
