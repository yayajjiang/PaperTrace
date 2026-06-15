"use client";

import Link from "next/link";
import manifest from "@/lib/llm-guide-manifest.json";

interface Chapter {
  slug: string;
  title: string;
  children: { slug: string; title: string }[];
}

function shortTitle(title: string) {
  return title
    .replace(/^第?\s*[0-9.]+\s*章\s*[·\-]?\s*/, "")
    .replace(/^[0-9.]+[-\s]/, "");
}

export function LlmGuideChapterBar({ currentRoute }: { currentRoute: string }) {
  const activeChapter = manifest.chapters.find(
    (ch: Chapter) => currentRoute === ch.slug || currentRoute.startsWith(ch.slug + "/")
  );

  return (
    <nav className="sticky top-0 z-30 -mx-6 px-6 mb-8 border-b border-paper-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="flex items-center gap-2 py-3 overflow-x-auto">
        <span className="text-xs font-medium text-paper-800/40 dark:text-slate-500 whitespace-nowrap">
          章节：
        </span>
        {(manifest.chapters as Chapter[]).map((ch) => {
          const isActive = activeChapter?.slug === ch.slug;
          return (
            <Link
              key={ch.slug}
              href={`/llm-guide/${ch.slug}`}
              className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "bg-paper-100 dark:bg-slate-800 text-paper-800 dark:text-slate-200 hover:bg-paper-200 dark:hover:bg-slate-700"
              }`}
            >
              {shortTitle(ch.title)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
