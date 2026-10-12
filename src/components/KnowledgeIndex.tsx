"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import type { KnowledgeGardenSummary } from "@/lib/knowledge";

export function KnowledgeIndex({ gardens }: { gardens: KnowledgeGardenSummary[] }) {
  const { t } = useLang();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
          {t("Curated knowledge gardens", "精选知识库")}
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-4 dark:text-white">
          {t("Knowledge Gardens", "专题知识库")}
        </h1>
        <p className="text-paper-800/65 dark:text-slate-400 leading-7">
          {t(
            "Seven focused Chinese-language libraries connect papers into reusable maps of concepts, methods, systems, and evaluation. The Markdown source stays visible and maintainable instead of being expanded into hundreds of generated pages.",
            "七个中文专题库把论文整理成可复用的概念、方法、系统与评测地图。Markdown 原文直接保留，避免再生成数百个难以维护的重复页面。"
          )}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {gardens.map((garden, index) => (
          <Link
            key={garden.id}
            href={`/knowledge/${garden.id}`}
            className="group rounded-2xl border border-paper-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-sm font-bold text-blue-700 dark:text-blue-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs text-paper-800/45 dark:text-slate-500">
                {garden.documentCount} {t("pages", "篇")}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold mb-1 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {t(garden.titleEn, garden.titleZh)}
            </h2>
            <p className="text-xs text-paper-800/45 dark:text-slate-500 mb-3">
              {garden.titleEn}
            </p>
            <p className="text-sm leading-6 text-paper-800/65 dark:text-slate-400">
              {t(garden.descriptionEn, garden.descriptionZh)}
            </p>
            <span className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-blue-600 dark:text-blue-400">
              {t("Open library", "进入知识库")}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs leading-5 text-paper-800/45 dark:text-slate-500">
        {t(
          "Source material is curated from OasisMind. The original Markdown path is linked on every page.",
          "内容精选自 OasisMind；每篇页面都保留对应的 Markdown 原文链接。"
        )}
      </p>
    </div>
  );
}
