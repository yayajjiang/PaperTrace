"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackHeadlines, Headline } from "@/lib/headlines";
import { researchEvents } from "@/lib/events";
import { useLang } from "@/lib/i18n";

function daysUntil(date: string) {
  return Math.ceil((Date.parse(`${date}T23:59:59Z`) - Date.now()) / 86_400_000);
}

export function ResearchHeat() {
  const { lang, t } = useLang();
  const [items, setItems] = useState<Headline[]>(fallbackHeadlines);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    fetch(`${basePath}/data/headlines.json`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { items?: Headline[] }) => data.items?.length && setItems(data.items))
      .catch(() => undefined);
  }, [basePath]);

  const sourceCounts = useMemo(() => {
    const arxiv = items.filter((item) => item.source.startsWith("arXiv")).length;
    const hf = items.filter((item) => item.source === "Hugging Face Papers").length;
    return [{ label: "arXiv", value: arxiv, color: "bg-blue-500" }, { label: "Hugging Face Papers", value: hf, color: "bg-amber-500" }];
  }, [items]);
  const maxCount = Math.max(1, ...sourceCounts.map((item) => item.value));
  const hfPapers = useMemo(() => items
    .filter((item) => item.source === "Hugging Face Papers" && item.signals?.huggingFaceUpvotes !== undefined)
    .sort((a, b) => (b.signals?.huggingFaceUpvotes || 0) - (a.signals?.huggingFaceUpvotes || 0)).slice(0, 3), [items]);
  const deadlines = researchEvents.filter((event) => event.deadlineAt && daysUntil(event.deadlineAt) >= -1)
    .sort((a, b) => (a.deadlineAt || "").localeCompare(b.deadlineAt || "")).slice(0, 3);

  return <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
    <section className="rounded-2xl border border-paper-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4"><div><div className="eyebrow mb-2">SOURCE HEAT</div><h3 className="text-xl font-bold dark:text-white">{t("What the radar is seeing", "雷达正在采集什么")}</h3></div><span className="text-xs text-paper-800/45 dark:text-slate-400">{t("Latest synced feed", "最新同步数据")}</span></div>
      <div className="mt-6 space-y-4">{sourceCounts.map((source) => <div key={source.label}><div className="mb-1.5 flex justify-between text-sm"><b className="dark:text-white">{source.label}</b><span className="font-mono text-paper-800/55 dark:text-slate-400">{source.value}</span></div><div className="h-3 overflow-hidden rounded-full bg-paper-100 dark:bg-slate-800"><div className={`h-full rounded-full ${source.color}`} style={{ width: `${(source.value / maxCount) * 100}%` }} /></div></div>)}</div>
      <p className="mt-5 text-xs leading-relaxed text-paper-800/50 dark:text-slate-400">{t("Counts are items tracked by this feed, not the total number of papers on either platform. HF votes are a community signal, kept separate from scientific impact.", "数字是本信息流采集的条目数，并非平台论文总量。HF 赞数是社区信号，和科研影响力分开呈现。")}</p>
      {hfPapers.length > 0 && <div className="mt-5 border-t border-paper-100 pt-4 dark:border-slate-800"><div className="mb-3 text-xs font-bold uppercase tracking-wider text-paper-800/45 dark:text-slate-500">HF papers · community votes</div>{hfPapers.map((paper) => <a key={paper.id} href={paper.sourceUrl} target="_blank" rel="noopener noreferrer" className="mb-2 flex items-center justify-between gap-3 text-sm hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"><span className="min-w-0 truncate">{lang === "zh" ? paper.titleZh : paper.title}</span><b className="shrink-0 font-mono text-amber-600">↑ {paper.signals?.huggingFaceUpvotes}</b></a>)}</div>}
    </section>
    <section className="rounded-2xl border border-paper-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="eyebrow mb-2">VENUE CLOCK</div><h3 className="text-xl font-bold dark:text-white">{t("Submission windows", "投稿窗口")}</h3>
      <div className="mt-5 space-y-3">{deadlines.map((event) => { const days = daysUntil(event.deadlineAt!); return <a key={event.id} href={event.href} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-paper-100 p-4 transition hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-700"><div className="flex items-start justify-between gap-3"><div><b className="block dark:text-white">{lang === "zh" ? event.titleZh : event.title}</b><span className="mt-1 block text-xs text-paper-800/50 dark:text-slate-400">{lang === "zh" ? event.deadlineLabelZh : event.deadlineLabel} · {event.deadlineAt} AOE</span></div><span className={`rounded-lg px-2 py-1 text-center font-mono text-xs font-bold ${days <= 7 ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>{days <= 0 ? t("today", "今天") : `${days}d`}</span></div></a>; })}</div>
      <p className="mt-5 text-xs leading-relaxed text-paper-800/50 dark:text-slate-400">{t("Countdowns use the official deadline date. Open the organizer page for the authoritative time zone and policy.", "倒计时以官网截止日期计算；具体时区和规则请以主办方页面为准。")}</p>
    </section>
  </div>;
}
