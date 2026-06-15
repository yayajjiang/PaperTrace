"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface TocItem {
  level: number;
  id: string;
  text: string;
}

function padClass(level: number) {
  if (level >= 4) return "pl-4";
  if (level === 3) return "pl-3";
  return "";
}

export function LlmGuideToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemIds = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    if (!itemIds.length) return;
    setActiveId(itemIds[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id);
        if (visible.length) {
          // prefer the first visible heading in DOM order
          setActiveId(visible[0]);
        }
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    itemIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [itemIds]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
    setMobileOpen(false);
  };

  if (!items.length) return null;

  const toc = (
    <nav className="space-y-0.5">
      {items.map((item, idx) => {
        const isActive = activeId === item.id;
        return (
          <Link
            key={`${item.id}-${idx}`}
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className={`
              block border-l-2 py-1 text-xs transition-colors
              ${padClass(item.level)}
              ${
                isActive
                  ? "border-blue-500 text-blue-700 dark:text-blue-300 font-medium"
                  : "border-transparent text-paper-800/70 dark:text-slate-400 hover:text-paper-900 dark:hover:text-slate-200"
              }
            `}
            title={item.text}
          >
            <span className="truncate block">{item.text}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile TOC toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed bottom-6 right-6 z-40 px-4 py-2 text-sm font-medium rounded-full bg-white dark:bg-slate-800 border border-paper-200 dark:border-slate-700 shadow-lg"
      >
        目录
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-xl border-t border-paper-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-paper-800 dark:text-slate-200">目录</h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-xs text-paper-800/60 dark:text-slate-400"
              >
                关闭
              </button>
            </div>
            {toc}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block p-4">
        <h3 className="text-sm font-bold mb-3 text-paper-800 dark:text-slate-200">目录</h3>
        {toc}
      </div>
    </>
  );
}
