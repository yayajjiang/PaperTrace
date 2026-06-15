"use client";

import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import manifest from "@/lib/llm-guide-manifest.json";

interface Article {
  slug: string;
  title: string;
}

interface Chapter {
  slug: string;
  title: string;
  children: Article[];
}

function shortTitle(title: string) {
  return title.replace(/^第?\s*[0-9.]+\s*章\s*[·\-]?\s*/, "").replace(/^[0-9.]+[-\s]/, "");
}

export default function LLMGuideIndexPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("LLM Guide", "LLM 指南")}</h1>
          <p className="text-paper-800/50">{t("Curated knowledge base migrated from MetaBlog.", "从 MetaBlog 迁移的精选知识库。")}</p>
        </header>

        {/* Top chapter bar */}
        <nav className="sticky top-0 z-30 -mx-6 px-6 mb-10 border-b border-paper-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <span className="text-xs font-medium text-paper-800/40 dark:text-slate-500 whitespace-nowrap">章节：</span>
            {(manifest.chapters as Chapter[]).map((ch) => (
              <Link
                key={ch.slug}
                href={`/llm-guide/${ch.slug}`}
                className="whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md bg-paper-100 dark:bg-slate-800 text-paper-800 dark:text-slate-200 hover:bg-paper-200 dark:hover:bg-slate-700 transition-colors"
              >
                {shortTitle(ch.title)}
              </Link>
            ))}
          </div>
        </nav>

        {(manifest.chapters as Chapter[]).map((ch) => (
          <section key={ch.slug} className="mb-12">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-paper-200 dark:border-slate-700">
              <Link href={`/llm-guide/${ch.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {ch.title}
              </Link>
            </h2>
            <div className="grid gap-2">
              {ch.children.slice(0, 12).map((article) => (
                <Link
                  key={article.slug}
                  href={`/llm-guide/${article.slug}`}
                  className="block p-3 bg-white dark:bg-slate-800 border border-paper-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                >
                  <span className="text-sm font-medium dark:text-slate-100">{shortTitle(article.title)}</span>
                </Link>
              ))}
              {ch.children.length > 12 && (
                <Link
                  href={`/llm-guide/${ch.slug}`}
                  className="block p-3 text-center text-sm text-paper-800/60 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  + {ch.children.length - 12} 篇文章
                </Link>
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
