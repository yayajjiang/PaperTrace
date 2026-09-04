"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";

type CommunitySignal = {
  id: string;
  platform: string;
  title: string;
  url: string;
  primaryUrl?: string | null;
  publishedAt: string;
  lastActivityAt?: string | null;
  capturedAt: string;
  tags: string[];
  metrics: Record<string, number>;
  platformScore: number;
  evidence: string;
  stale?: boolean;
};
type SourceHealth = { name: string; status: "ok" | "error"; itemCount: number; note?: string };

const metricLabel: Record<string, [string, string]> = {
  views: ["views", "浏览"],
  replies: ["replies", "回复"],
  likes: ["likes", "赞"],
  points: ["points", "分"],
  comments: ["comments", "评论"],
};

export function CommunityPulse() {
  const { lang, t } = useLang();
  const [items, setItems] = useState<CommunitySignal[]>([]);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const [platform, setPlatform] = useState("All");
  const [sort, setSort] = useState<"latest" | "engaged">("latest");
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  useEffect(() => {
    fetch(basePath + "/data/community-signals.json")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { generatedAt?: string; sources?: SourceHealth[]; items?: CommunitySignal[] }) => {
        setItems(data.items || []);
        setSources(data.sources || []);
        setGeneratedAt(data.generatedAt || "");
      })
      .catch(() => undefined);
  }, [basePath]);

  const platforms = ["All", ...Array.from(new Set(items.map((item) => item.platform)))];
  const visible = useMemo(() => items
    .filter((item) => platform === "All" || item.platform === platform)
    .sort((a, b) => sort === "engaged"
      ? b.platformScore - a.platformScore
      : (b.lastActivityAt || b.publishedAt).localeCompare(a.lastActivityAt || a.publishedAt)), [items, platform, sort]);

  return (
    <section className="mt-16">
      <div className="section-heading-row">
        <div>
          <div className="eyebrow mb-2">{t("Community pulse", "社区脉搏")}</div>
          <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("What practitioners are testing and debating", "实践者正在测试和讨论什么")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-paper-800/55 dark:text-slate-400">{t("Public metadata from LINUX DO and Hacker News. These are discovery signals only; open the thread and follow its links before trusting a claim.", "来自 LINUX DO 与 Hacker News 的公开元数据。这里只用于发现；相信任何主张前，请打开讨论并继续核验其中的一手链接。")}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {platforms.map((item) => <button key={item} onClick={() => setPlatform(item)} className={"domain-pill " + (platform === item ? "domain-pill-active" : "")}>{item === "All" ? t("All communities", "全部社区") : item}</button>)}
        <select value={sort} onChange={(event) => setSort(event.target.value as "latest" | "engaged")} className="radar-select md:ml-auto">
          <option value="latest">{t("Latest activity", "最近活跃")}</option>
          <option value="engaged">{t("Platform engagement", "站内互动")}</option>
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {visible.map((item) => (
          <article key={item.id} className="community-signal-card">
            <div className="flex items-center justify-between gap-3">
              <span className="source-layer-badge source-layer-community">{item.platform}</span>
              <time className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{new Date(item.lastActivityAt || item.publishedAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}</time>
            </div>
            <h3 className="mt-4 font-bold leading-snug dark:text-white">{item.title}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4">
              {Object.entries(item.metrics).map(([key, value]) => <span key={key} className="community-metric"><b>{value.toLocaleString()}</b> {t(metricLabel[key]?.[0] || key, metricLabel[key]?.[1] || key)}</span>)}
            </div>
            {item.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{item.tags.slice(0, 4).map((tag) => <span key={tag} className="subtle-chip">{tag}</span>)}</div>}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400">{t("Open discussion", "打开讨论")} ↗</a>
              {item.primaryUrl && <a href={item.primaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t("Linked source", "讨论中链接")} ↗</a>}
              {item.stale && <span className="text-[10px] text-amber-600">{t("stale snapshot", "快照待刷新")}</span>}
            </div>
          </article>
        ))}
        {visible.length === 0 && <div className="empty-state md:col-span-2">{t("No community snapshot is available yet.", "社区快照尚未生成。")}</div>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-[10px] text-paper-800/35 dark:text-slate-500">
        <span>{t("Engagement scores are platform-local and never used as scientific impact.", "互动分只在站内有意义，绝不作为科研影响力。")}</span>
        <span>{sources.filter((source) => source.status === "ok").length}/{sources.length || 2} {t("sources online", "信息源在线")}{generatedAt ? " · " + new Date(generatedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US") : ""}</span>
      </div>
    </section>
  );
}
