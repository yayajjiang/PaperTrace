"use client";

import { useEffect, useState } from "react";
import { communityTopics } from "@/lib/community";
import { useLang } from "@/lib/i18n";

const storageKey = "papertrace-topic-votes";
const tagStyle = {
  Hot: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Question: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  Build: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Reading: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function CommunityBoard({ limit }: { limit?: number }) {
  const { lang, t } = useLang();
  const [votes, setVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setVotes(new Set(JSON.parse(localStorage.getItem(storageKey) || "[]")));
    } catch {}
  }, []);

  const toggleVote = (id: string) => {
    setVotes((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(storageKey, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {communityTopics.slice(0, limit).map((topic) => {
        const voted = votes.has(topic.id);
        return (
          <article key={topic.id} className="community-topic">
            <button
              onClick={() => toggleVote(topic.id)}
              className={`vote-button ${voted ? "vote-button-active" : ""}`}
              aria-pressed={voted}
              aria-label={t("Upvote topic", "为话题点赞")}
            >
              <span aria-hidden="true">↑</span>
              <span>{topic.votes + (voted ? 1 : 0)}</span>
            </button>
            <a href={topic.href} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 group">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`topic-chip ${tagStyle[topic.tag]}`}>{topic.tag}</span>
                <span className="text-xs text-paper-800/35 dark:text-slate-500">{topic.comments} {t("replies", "条讨论")}</span>
              </div>
              <h3 className="font-bold dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {lang === "en" ? topic.title : topic.titleZh}
              </h3>
              <p className="text-sm text-paper-800/55 dark:text-slate-400 mt-1 leading-relaxed">
                {lang === "en" ? topic.description : topic.descriptionZh}
              </p>
            </a>
          </article>
        );
      })}
      <p className="text-[11px] text-paper-800/35 dark:text-slate-500 text-right">
        {t("Your upvotes stay in this browser for now.", "当前点赞仅保存在此浏览器。")}
      </p>
    </div>
  );
}
