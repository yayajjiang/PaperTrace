"use client";

import { useEffect, useMemo, useState } from "react";
import { Headline } from "@/lib/headlines";
import { useLang } from "@/lib/i18n";

type CommunitySignal = { id: string; title: string; url: string; primaryUrl?: string | null; platform: string; metrics: Record<string, number>; officialEvidence?: boolean; evidence: string };
const codex = /\bcodex\b/i;

export function CodexRadar() {
  const { lang, t } = useLang();
  const [official, setOfficial] = useState<Headline[]>([]);
  const [community, setCommunity] = useState<CommunitySignal[]>([]);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
  useEffect(() => {
    Promise.all([
      fetch(`${basePath}/data/headlines.json`).then((r) => r.ok ? r.json() : Promise.reject()),
      fetch(`${basePath}/data/community-signals.json`).then((r) => r.ok ? r.json() : Promise.reject()),
    ]).then(([headlines, signals]) => {
      setOfficial((headlines.items || []).filter((item: Headline) => item.source === "OpenAI Codex · GitHub" || (item.source === "OpenAI" && codex.test(`${item.title} ${item.summary}`))).slice(0, 4));
      setCommunity((signals.items || []).filter((item: CommunitySignal) => codex.test(item.title)).slice(0, 6));
    }).catch(() => undefined);
  }, [basePath]);
  const verified = useMemo(() => community.filter((item) => item.officialEvidence), [community]);
  const leads = useMemo(() => community.filter((item) => !item.officialEvidence), [community]);

  return <div className="grid gap-5 lg:grid-cols-2">
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div className="flex items-start justify-between gap-3"><div><div className="eyebrow mb-2 text-emerald-700">CODEX · VERIFIED</div><h3 className="text-xl font-bold dark:text-white">{t("Official Codex changes", "官方 Codex 变更")}</h3></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">openai/codex</span></div>
      <div className="mt-4 space-y-3">{official.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-white p-3 text-sm shadow-sm transition hover:ring-1 hover:ring-emerald-300 dark:bg-slate-900"><b className="block dark:text-white">{lang === "zh" ? item.titleZh : item.title}</b><span className="mt-1 block text-xs text-paper-800/55 dark:text-slate-400">{item.date} · {item.source}</span></a>)}{official.length === 0 && <p className="text-sm text-paper-800/55 dark:text-slate-400">{t("No official Codex release is in the current snapshot yet.", "当前快照尚未包含 Codex 官方发布记录。")}</p>}</div>
    </section>
    <section className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="eyebrow mb-2">COMMUNITY · CHECKED</div><h3 className="text-xl font-bold dark:text-white">{t("Community leads, with evidence status", "社区线索与证据状态")}</h3>
      <div className="mt-4 space-y-3">{verified.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-emerald-200 p-3 text-sm dark:border-emerald-900"><b className="block dark:text-white">{item.title}</b><span className="mt-1 block text-xs font-bold text-emerald-700">{t("Official source linked", "已回链官方来源")} · {item.platform}</span></a>)}{leads.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-paper-100 p-3 text-sm dark:border-slate-800"><b className="block dark:text-white">{item.title}</b><span className="mt-1 block text-xs text-paper-800/50 dark:text-slate-400">{t("Community lead — official source not linked", "社区线索：尚未回链官方来源")} · {item.platform}</span></a>)}{community.length === 0 && <p className="text-sm text-paper-800/55 dark:text-slate-400">{t("No public Codex discussion is in the current snapshot.", "当前快照没有公开 Codex 讨论。")}</p>}</div>
      <p className="mt-4 text-xs leading-relaxed text-paper-800/50 dark:text-slate-400">{t("Community engagement stays platform-local. Only direct OpenAI or openai/codex links receive the verified label.", "社区互动只在平台内解释；只有直达 OpenAI 或 openai/codex 的链接才会获得已核验标记。")}</p>
    </section>
  </div>;
}
