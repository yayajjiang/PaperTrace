"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import type {
  KnowledgeGardenSummary,
  KnowledgeTocItem,
  RenderedKnowledgeDocument,
} from "@/lib/knowledge";

interface KnowledgeReaderProps {
  gardens: KnowledgeGardenSummary[];
  page: RenderedKnowledgeDocument;
}

function DocumentNavigation({ page }: { page: RenderedKnowledgeDocument }) {
  const { t } = useLang();

  return (
    <nav aria-label={t("Library contents", "知识库目录")}>
      <Link
        href="/knowledge"
        className="inline-flex items-center gap-2 text-xs font-medium text-paper-800/55 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-5"
      >
        <span aria-hidden="true">←</span>
        {t("All libraries", "全部知识库")}
      </Link>
      <h2 className="font-display font-bold leading-snug dark:text-white mb-1">
        {t(page.garden.titleEn, page.garden.titleZh)}
      </h2>
      <p className="text-xs text-paper-800/45 dark:text-slate-500 mb-5">
        {page.garden.documentCount} {t("pages", "篇")}
      </p>
      <div className="space-y-0.5">
        {page.garden.documents.map((document) => {
          const active = document.route === page.document.route;
          return (
            <Link
              key={document.route}
              href={document.route}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md py-2 pr-2 text-xs leading-5 transition-colors ${
                active
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-paper-800/65 dark:text-slate-400 hover:bg-paper-100 dark:hover:bg-slate-800 hover:text-paper-900 dark:hover:text-slate-200"
              }`}
              style={{ paddingLeft: `${Math.min(document.depth, 4) * 12 + 8}px` }}
            >
              {document.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TableOfContents({ items }: { items: KnowledgeTocItem[] }) {
  const { t } = useLang();
  if (items.length === 0) return null;

  return (
    <nav className="p-5" aria-label={t("On this page", "本页目录")}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-paper-800/45 dark:text-slate-500 mb-3">
        {t("On this page", "本页目录")}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="block text-xs leading-5 text-paper-800/55 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            style={{ paddingLeft: item.level === 3 ? "12px" : 0 }}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function KnowledgeReader({ gardens, page }: KnowledgeReaderProps) {
  const { t } = useLang();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)_15rem]">
      <aside className="hidden lg:block border-r border-paper-200 dark:border-slate-800 bg-paper-50/70 dark:bg-slate-900/40">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-5">
          <DocumentNavigation page={page} />
        </div>
      </aside>

      <main className="min-w-0 px-6 py-10 lg:px-10 xl:px-14">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-7">
            {gardens.map((garden) => (
              <Link
                key={garden.id}
                href={`/knowledge/${garden.id}`}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  garden.id === page.garden.id
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-paper-200 text-paper-800/55 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {t(garden.titleEn, garden.titleZh)}
              </Link>
            ))}
          </div>

          <details className="lg:hidden mb-8 rounded-xl border border-paper-200 dark:border-slate-700 bg-paper-50 dark:bg-slate-900 p-4">
            <summary className="cursor-pointer text-sm font-semibold dark:text-white">
              {t("Browse this library", "浏览本库目录")}
            </summary>
            <div className="mt-5 pt-5 border-t border-paper-200 dark:border-slate-700 max-h-[60vh] overflow-y-auto">
              <DocumentNavigation page={page} />
            </div>
          </details>

          <header className="mb-10 pb-8 border-b border-paper-200 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-3">
              {t("Chinese source article", "中文原文")}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight dark:text-white">
              {page.document.title}
            </h1>
            {page.document.excerpt ? (
              <p className="mt-4 text-paper-800/60 dark:text-slate-400 leading-7">
                {page.document.excerpt}
              </p>
            ) : null}
            <a
              href={page.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-5 text-xs font-medium text-paper-800/50 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("View original Markdown", "查看 Markdown 原文")} ↗
            </a>
          </header>

          <article
            className="paper-content knowledge-content dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </div>
      </main>

      <aside className="hidden lg:block border-l border-paper-200 dark:border-slate-800 bg-paper-50/50 dark:bg-slate-900/30">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <TableOfContents items={page.toc} />
        </div>
      </aside>
    </div>
  );
}
