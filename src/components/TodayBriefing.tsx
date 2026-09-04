"use client";

import { useEffect, useMemo, useState } from "react";
import { fallbackHeadlines, Headline } from "@/lib/headlines";
import { researchEvents } from "@/lib/events";
import lifecycle from "@/data/model-lifecycle.json";
import { useLang } from "@/lib/i18n";

type Budget = 5 | 20 | 60;
type CommunitySignal = { id: string; platform: string; title: string; url: string; primaryUrl?: string | null; publishedAt: string; lastActivityAt?: string | null; stale?: boolean };

const dayDelta = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((Date.parse(date + "T00:00:00") - today.getTime()) / 86_400_000);
};

export function TodayBriefing() {
  const { lang, t } = useLang();
  const [budget, setBudget] = useState<Budget>(20);
  const [headlines, setHeadlines] = useState<Headline[]>(fallbackHeadlines);
  const [community, setCommunity] = useState<CommunitySignal[]>([]);
  const [generatedAt, setGeneratedAt] = useState("");
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
  const limits = budget === 5 ? { news: 1, events: 1, community: 0 } : budget === 20 ? { news: 3, events: 2, community: 1 } : { news: 6, events: 4, community: 3 };

  useEffect(() => {
    Promise.all([
      fetch(basePath + "/data/headlines.json").then((response) => response.ok ? response.json() : Promise.reject()),
      fetch(basePath + "/data/community-signals.json").then((response) => response.ok ? response.json() : Promise.reject()),
    ]).then(([news, pulse]) => {
      if (news.items?.length) setHeadlines(news.items);
      setCommunity(pulse.items || []);
      setGeneratedAt(news.generatedAt || "");
    }).catch(() => undefined);
  }, [basePath]);

  const events = useMemo(() => researchEvents
    .filter((event) => event.endsAt >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.deadlineAt || a.startsAt).localeCompare(b.deadlineAt || b.startsAt))
    .slice(0, limits.events), [limits.events]);
  const migrations = lifecycle
    .filter((item) => item.actionAt && dayDelta(item.actionAt) >= 0 && dayDelta(item.actionAt) <= 60)
    .sort((a, b) => String(a.actionAt).localeCompare(String(b.actionAt)));
  const discussions = community
    .slice()
    .sort((a, b) => (b.lastActivityAt || b.publishedAt).localeCompare(a.lastActivityAt || a.publishedAt))
    .slice(0, limits.community);

  return (
    <>
      <div className="briefing-budget" aria-label={t("Attention budget", "注意力预算")}>
        {([5, 20, 60] as Budget[]).map((minutes) => (
          <button key={minutes} onClick={() => setBudget(minutes)} className={budget === minutes ? "briefing-budget-active" : ""}>
            <b>{minutes}</b><span>{t("min", "分钟")}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-6 mt-8 items-start">
        <section className="briefing-section">
          <div className="briefing-section-head"><span>01</span><div><b>{t("Know what changed", "先知道发生了什么")}</b><small>{t("Primary and structured sources", "官方与结构化来源")}</small></div></div>
          <div className="space-y-3 mt-5">
            {headlines.slice(0, limits.news).map((item, index) => (
              <a key={item.id} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="briefing-news">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{lang === "en" ? item.title : item.titleZh}</b><p>{lang === "en" ? item.summary : item.summaryZh}</p><small>{item.source} · {item.date} · {item.domain}</small></div>
              </a>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="briefing-section">
            <div className="briefing-section-head"><span>02</span><div><b>{t("Act before it closes", "在截止前行动")}</b><small>{t("Events and calls", "活动与公开征集")}</small></div></div>
            <div className="space-y-3 mt-5">
              {events.map((event) => {
                const nextDate = event.deadlineAt || event.startsAt;
                const days = dayDelta(nextDate);
                return <a key={event.id} href={event.href} target="_blank" rel="noopener noreferrer" className="briefing-action"><div><b>{lang === "en" ? event.title : event.titleZh}</b><small>{event.type} · {lang === "en" ? event.location : event.locationZh}</small></div><span className={days <= 14 ? "deadline-urgent" : ""}>{days <= 0 ? t("now", "现在") : days + "d"}</span></a>;
              })}
            </div>
          </section>

          {migrations.length > 0 && (
            <section className="briefing-section">
              <div className="briefing-section-head"><span>03</span><div><b>{t("Prepare migrations", "准备模型迁移")}</b><small>{t("Next 60 days", "未来 60 天")}</small></div></div>
              <div className="space-y-3 mt-5">
                {migrations.map((item) => <a key={item.id} href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="briefing-action"><div><b>{item.model}</b><small>{lang === "en" ? item.nextAction : item.nextActionZh}</small></div><span>{dayDelta(String(item.actionAt))}d</span></a>)}
              </div>
            </section>
          )}
        </div>
      </div>

      {discussions.length > 0 && (
        <section className="briefing-section mt-6">
          <div className="briefing-section-head"><span>04</span><div><b>{t("Sample the community", "抽样查看社区")}</b><small>{t("Discovery signals, not evidence", "发现信号，不是科研证据")}</small></div></div>
          <div className="grid md:grid-cols-3 gap-3 mt-5">
            {discussions.map((item) => <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="briefing-community"><span>{item.platform}</span><b>{item.title}</b>{item.stale && <small>{t("Snapshot needs refresh", "快照待刷新")}</small>}</a>)}
          </div>
        </section>
      )}

      <div className="briefing-finish mt-6">
        <div><b>{t("Finish with one output", "最后产出一个东西")}</b><p>{budget === 5 ? t("Save one item and write one question.", "收藏一条，写下一个问题。") : budget === 20 ? t("Open one primary source and leave a three-sentence note.", "打开一个一手来源，留下三句话笔记。") : t("Reproduce one claim, try one tool, or contact one collaborator.", "复现一个主张、试用一个工具，或联系一位潜在合作者。")}</p></div>
        <a href={basePath + "/queue"} className="button-primary">{t("Open queue", "打开队列")} →</a>
      </div>
      {generatedAt && <p className="mt-4 text-right text-[10px] font-mono text-paper-800/30 dark:text-slate-600">NEWS SYNC {new Date(generatedAt).toLocaleString(lang === "zh" ? "zh-CN" : "en-US")}</p>}
    </>
  );
}
