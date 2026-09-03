"use client";

import { researchTopics } from "@/lib/topics";
import { useLang } from "@/lib/i18n";

const momentumStyle = {
  Surging: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Rising: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Steady: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};

export function TopicPulse() {
  const { lang, t } = useLang();
  return (
    <div className="topic-pulse-grid">
      {researchTopics.map((topic, index) => (
        <article key={topic.id} className="topic-pulse-card">
          <div className="flex items-center justify-between gap-3">
            <span className={`topic-chip ${momentumStyle[topic.momentum]}`}>↗ {topic.momentum}</span>
            <span className="font-mono text-[10px] text-paper-800/30 dark:text-slate-600">0{index + 1}</span>
          </div>
          <div className="domain-label mt-4">{topic.domain}</div>
          <h3 className="text-lg font-bold mt-1 dark:text-white">{lang === "en" ? topic.title : topic.titleZh}</h3>
          <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-3">{lang === "en" ? topic.why : topic.whyZh}</p>
          <div className="attention-note mt-5"><b>{t("Attention", "注意力预算")}</b><span>{lang === "en" ? topic.attention : topic.attentionZh}</span></div>
          <div className="flex flex-wrap gap-2 mt-5">
            {topic.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">{link.label} ↗</a>)}
          </div>
        </article>
      ))}
    </div>
  );
}
