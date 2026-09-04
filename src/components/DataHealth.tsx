"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/i18n";

type SourceState = { name: string; status: string; note?: string };
type Snapshot = {
  generatedAt?: string;
  checkedAt?: string;
  sources?: SourceState[];
  stale?: unknown[];
};

type Feed = {
  id: string;
  name: [string, string];
  path: string;
  expectedHours: number;
  job: [string, string];
};

const feeds: Feed[] = [
  { id: "headlines", name: ["Headlines", "头条"], path: "/data/headlines.json", expectedHours: 18, job: ["Official newsrooms + cross-field paper discovery", "官方新闻源与跨领域论文发现"] },
  { id: "providers", name: ["Provider status", "服务状态"], path: "/data/provider-status.json", expectedHours: 18, job: ["Official OpenAI and Claude incidents", "OpenAI 与 Claude 官方事故状态"] },
  { id: "community", name: ["Community signals", "社区信号"], path: "/data/community-signals.json", expectedHours: 18, job: ["Public discussion snapshots; discovery only", "公开讨论快照；仅用于发现"] },
  { id: "tools", name: ["Tool signals", "工具信号"], path: "/data/tool-signals.json", expectedHours: 18, job: ["GitHub activity, license and repository attention", "GitHub 活跃度、许可证与仓库关注度"] },
  { id: "events", name: ["Event audit", "活动审计"], path: "/data/event-health.json", expectedHours: 18, job: ["Deadline freshness and field coverage", "截止日期新鲜度与领域覆盖"] },
  { id: "models", name: ["Model lifecycle", "模型生命周期"], path: "/data/model-health.json", expectedHours: 18, job: ["Release, migration and retirement checks", "发布、迁移与退役检查"] },
];

function ageHours(timestamp?: string) {
  if (!timestamp) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - Date.parse(timestamp)) / 3_600_000);
}

function formatAge(hours: number, lang: "en" | "zh") {
  if (!Number.isFinite(hours)) return lang === "en" ? "unknown" : "未知";
  if (hours < 1) return lang === "en" ? `${Math.max(1, Math.round(hours * 60))}m ago` : `${Math.max(1, Math.round(hours * 60))} 分钟前`;
  if (hours < 48) return lang === "en" ? `${Math.round(hours)}h ago` : `${Math.round(hours)} 小时前`;
  return lang === "en" ? `${Math.round(hours / 24)}d ago` : `${Math.round(hours / 24)} 天前`;
}

export function DataHealth() {
  const { lang, t } = useLang();
  const [snapshots, setSnapshots] = useState<Record<string, Snapshot | null>>({});

  useEffect(() => {
    const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
    Promise.all(feeds.map(async (feed) => {
      try {
        const response = await fetch(`${basePath}${feed.path}`, { cache: "no-store" });
        if (!response.ok) throw new Error(String(response.status));
        return [feed.id, await response.json()] as const;
      } catch {
        return [feed.id, null] as const;
      }
    })).then((entries) => setSnapshots(Object.fromEntries(entries)));
  }, []);

  const summary = useMemo(() => feeds.map((feed) => {
    const data = snapshots[feed.id];
    const timestamp = data?.generatedAt || data?.checkedAt;
    const hours = ageHours(timestamp);
    const failedSources = data?.sources?.filter((source) => source.status !== "ok") || [];
    const staleRecords = data?.stale?.length || 0;
    const loading = data === undefined;
    const unavailable = data === null;
    const stale = hours > feed.expectedHours;
    const state = loading ? "loading" : unavailable ? "error" : stale || failedSources.length || staleRecords ? "warn" : "ok";
    return { feed, data, timestamp, hours, failedSources, staleRecords, state };
  }), [snapshots]);

  const healthy = summary.filter((item) => item.state === "ok").length;
  const attention = summary.filter((item) => item.state === "warn" || item.state === "error").length;

  return (
    <div>
      <div className="health-summary">
        <div><strong>{healthy}/{feeds.length}</strong><span>{t("fresh and healthy", "新鲜且健康")}</span></div>
        <div><strong>{attention}</strong><span>{t("need attention", "需要关注")}</span></div>
        <div><strong>18h</strong><span>{t("freshness budget", "新鲜度预算")}</span></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {summary.map(({ feed, timestamp, hours, failedSources, staleRecords, state }) => (
          <article key={feed.id} className="data-health-card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={state === "ok" ? "health-ok" : state === "loading" ? "health-loading" : "health-warn"} />
                <h2 className="font-bold dark:text-white">{t(feed.name[0], feed.name[1])}</h2>
              </div>
              <span className="text-[10px] font-mono text-paper-800/40 dark:text-slate-500">{state === "loading" ? t("checking…", "检查中…") : formatAge(hours, lang)}</span>
            </div>
            <p className="mt-3 text-sm text-paper-800/55 dark:text-slate-400">{t(feed.job[0], feed.job[1])}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <span className="subtle-chip">{t("Expected", "预期更新")} ≤ {feed.expectedHours}h</span>
              {failedSources.map((source) => <span key={source.name} className="warning-chip">{source.name}: {source.note || source.status}</span>)}
              {staleRecords > 0 && <span className="warning-chip">{staleRecords} {t("stale records", "条过期记录")}</span>}
              {state === "error" && <span className="warning-chip">{t("Snapshot unavailable", "快照不可用")}</span>}
            </div>
            {timestamp && <time className="block mt-4 text-[9px] font-mono text-paper-800/30 dark:text-slate-600" dateTime={timestamp}>{t("LAST SNAPSHOT", "最近快照")} · {new Date(timestamp).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}</time>}
          </article>
        ))}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-paper-800/45 dark:text-slate-500">{t("A warning means “inspect before trusting,” not necessarily that the upstream service is down. Community-source failures remain visible instead of silently falling back to old engagement numbers.", "警告表示“使用前检查”，不一定代表上游服务宕机。社区来源失败会明确显示，而不是悄悄沿用旧热度数字。")}</p>
    </div>
  );
}
