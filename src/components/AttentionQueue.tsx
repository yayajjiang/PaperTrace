"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { ReadingQueueItem, readReadingQueue, readingQueueEvent, writeReadingQueue } from "@/lib/readingQueue";

const budgets = [30, 60, 120] as const;

function valueDensity(item: ReadingQueueItem) {
  const scores = item.headline.scores;
  if (!scores) return 0;
  return (scores.impact * .55 + scores.utility * .45) / item.minutes;
}

export function AttentionQueue() {
  const { lang, t } = useLang();
  const [items, setItems] = useState<ReadingQueueItem[]>([]);
  const [budget, setBudget] = useState<number>(60);

  useEffect(() => {
    const sync = () => setItems(readReadingQueue());
    sync();
    window.addEventListener(readingQueueEvent, sync);
    return () => window.removeEventListener(readingQueueEvent, sync);
  }, []);

  const plan = useMemo(() => {
    let used = 0;
    const selected = new Set<string>();
    [...items].sort((a, b) => valueDensity(b) - valueDensity(a)).forEach((item) => {
      if (used + item.minutes <= budget) {
        used += item.minutes;
        selected.add(item.headline.id);
      }
    });
    return { selected, used };
  }, [budget, items]);

  const remove = (id: string) => writeReadingQueue(items.filter((item) => item.headline.id !== id));
  const total = items.reduce((sum, item) => sum + item.minutes, 0);

  if (items.length === 0) {
    return (
      <div className="empty-state py-16">
        <div className="text-3xl mb-4" aria-hidden="true">◷</div>
        <h2 className="text-xl font-bold dark:text-white">{t("Your attention queue is empty", "你的注意力队列还是空的")}</h2>
        <p className="mt-2">{t("Save useful items from Research Radar. No account is required; the queue stays in this browser.", "在研究雷达中收藏值得读的内容。无需登录，队列只保存在当前浏览器。")}</p>
        <Link href="/radar" className="button-primary mt-6 inline-flex">{t("Open Research Radar", "打开研究雷达")} →</Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="space-y-3">
        {items.map((item) => {
          const selected = plan.selected.has(item.headline.id);
          return (
            <article key={item.headline.id} className={`queue-item ${selected ? "queue-item-selected" : ""}`}>
              <div className="queue-time"><b>{item.minutes}</b><span>{t("min", "分钟")}</span></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {selected && <span className="topic-chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{t("TODAY", "今日计划")}</span>}
                  <span className="domain-label">{item.headline.domain}</span>
                  <time className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{item.headline.date}</time>
                </div>
                <a href={item.headline.sourceUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 font-bold leading-snug dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{lang === "en" ? item.headline.title : item.headline.titleZh}</a>
                <p className="mt-1.5 text-xs leading-relaxed text-paper-800/50 dark:text-slate-400 line-clamp-2">{lang === "en" ? item.headline.summary : item.headline.summaryZh}</p>
              </div>
              <button type="button" onClick={() => remove(item.headline.id)} className="queue-remove" aria-label={t("Remove from queue", "从队列移除")}>×</button>
            </article>
          );
        })}
      </div>

      <aside className="radar-method lg:sticky lg:top-24">
        <div className="eyebrow mb-3">{t("Attention budget", "注意力预算")}</div>
        <h2 className="text-xl font-bold dark:text-white">{t("Build today's reading plan", "生成今日阅读计划")}</h2>
        <p className="mt-2 text-xs leading-relaxed text-paper-800/50 dark:text-slate-400">{t("The planner favors high impact and utility per minute. Change the budget; your saved list stays intact.", "计划器优先选择单位时间内影响力与实用性更高的内容；切换预算不会改变收藏列表。")}</p>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {budgets.map((value) => <button key={value} onClick={() => setBudget(value)} className={`budget-button ${budget === value ? "budget-button-active" : ""}`}>{value}<small>{t("min", "分钟")}</small></button>)}
        </div>
        <div className="attention-summary mt-5">
          <div><b>{plan.selected.size}</b><span>{t("items today", "项今日阅读")}</span></div>
          <div><b>{plan.used}</b><span>{t("minutes used", "分钟已安排")}</span></div>
          <div><b>{total}</b><span>{t("minutes saved", "分钟总收藏")}</span></div>
        </div>
        <p className="mt-5 text-[10px] leading-relaxed text-paper-800/35 dark:text-slate-500">{t("5 min = skim · 20 min = read · 45 min = deep dive. Estimates are based on impact and runnable-artifact cues, not document length.", "5 分钟为速览，20 分钟为阅读，45 分钟为深挖。估时依据影响力与可运行成果线索，不代表文档实际长度。")}</p>
      </aside>
    </div>
  );
}
