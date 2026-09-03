"use client";

import { I18nProvider, useLang } from "@/lib/i18n";
import { ReactNode, useEffect, useState, createContext, useContext, useCallback } from "react";
import Script from "next/script";

/* ── Theme context ─────────────────────────────────────────────── */
interface ThemeCtx { dark: boolean; toggleTheme: () => void }
const ThemeContext = createContext<ThemeCtx>({ dark: false, toggleTheme: () => {} });

function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Theme is already applied by the inline script in layout.tsx <head>.
    // Just sync state with whatever class is currently on <html>.
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try { localStorage.setItem("papertrace-theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() { return useContext(ThemeContext); }

/* ── Header ────────────────────────────────────────────────────── */
function Header() {
  const { lang, toggleLang, t } = useLang();
  const { dark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
  const primaryNav = [
    { href: "/", label: t("Discover", "发现") },
    { href: "/radar", label: t("Radar", "雷达") },
    { href: "/domains", label: t("Domains", "领域") },
    { href: "/tools", label: t("Tools & MCP", "工具 & MCP") },
    { href: "/community", label: t("Community", "社区") },
  ];
  const secondaryNav = [
    { href: "/skills", label: "Skills" },
    { href: "/daily", label: t("Research feed", "研究动态") },
    { href: "/timeline", label: t("Timeline", "时间线") },
    { href: "/guide", label: t("Research guide", "科研指南") },
    { href: "/resources", label: t("Learning resources", "学习资源") },
    { href: "/interview", label: t("Internships & jobs", "实习与找工") },
    { href: "/knowledge-graph", label: t("Knowledge graph", "知识图谱") },
  ];

  return (
    <header className="border-b border-paper-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-5">
        <a
          href={basePath || "/"}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold tracking-tight dark:text-white font-display">
            Paper<span className="text-blue-500">Trace</span>
          </span>
        </a>
        <nav className="hidden lg:flex items-center gap-5 text-sm flex-1 justify-center" aria-label={t("Main navigation", "主导航")}>
          {primaryNav.map((item) => (
            <a key={item.href} href={`${basePath}${item.href === "/" ? "" : item.href}`} className="nav-link">{item.label}</a>
          ))}
          <details className="relative group">
            <summary className="nav-link cursor-pointer list-none flex items-center gap-1">{t("More", "更多")} <span className="text-[9px] opacity-50">▼</span></summary>
            <div className="nav-popover">
              {secondaryNav.map((item) => <a key={item.href} href={`${basePath}${item.href}`}>{item.label}<span>→</span></a>)}
            </div>
          </details>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-paper-100 dark:bg-slate-800 hover:bg-paper-200 dark:hover:bg-slate-700 transition-colors text-paper-800 dark:text-slate-200 font-medium"
            title={t("Switch to Chinese", "切换到英文")}
          >
            <span>{lang === "en" ? "中" : "EN"}</span>
          </button>
          {/* Dark / light mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-paper-100 dark:bg-slate-800 hover:bg-paper-200 dark:hover:bg-slate-700 transition-colors text-paper-800 dark:text-slate-200"
            title={dark ? t("Light mode", "亮色模式") : t("Dark mode", "暗色模式")}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? (
              /* Sun */
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon */
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {/* GitHub */}
          <a
            href="https://github.com/yayajjiang/PaperTrace"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-md bg-paper-100 dark:bg-slate-800 hover:bg-paper-200 dark:hover:bg-slate-700 transition-colors text-paper-800 dark:text-slate-200"
            title="GitHub"
            aria-label="View source on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <button onClick={() => setMenuOpen((value) => !value)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md bg-paper-100 dark:bg-slate-800 text-paper-800 dark:text-slate-200" aria-expanded={menuOpen} aria-label={t("Open navigation", "打开导航")}>
            {menuOpen ? "×" : "≡"}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden border-t border-paper-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <nav className="max-w-6xl mx-auto grid grid-cols-2 gap-2">
            {[...primaryNav, ...secondaryNav].map((item) => (
              <a key={item.href} onClick={() => setMenuOpen(false)} href={`${basePath}${item.href === "/" ? "" : item.href}`} className="mobile-nav-link">{item.label}</a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ── Footer ────────────────────────────────────────────────────── */
function Footer() {
  const { t } = useLang();
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
  return (
    <footer className="border-t border-paper-200 dark:border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-paper-800/45 dark:text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="font-bold text-paper-800/70 dark:text-slate-300">Paper<span className="text-blue-500">Trace</span></div>
          <div className="mt-1">{t("A bilingual commons for research signals, tools and people.", "连接科研动态、工具与人的双语公共空间。")}</div>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href={`${basePath}/tools`} className="hover:text-blue-600">{t("Tools", "工具")}</a>
          <a href={`${basePath}/community`} className="hover:text-blue-600">{t("Community", "社区")}</a>
          <a href="https://github.com/yayajjiang/PaperTrace" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">GitHub ↗</a>
        </div>
        <div className="flex justify-center mt-4">
          <Script
            id="mapmyvisitors"
            src="https://mapmyvisitors.com/map.js?cl=ffffff&w=150&t=tt&d=uXX9ttEyvwWpg_VNSd3nV7rjj5YP5PAPRwBbVV8VIs8&co=57a6dd"
            strategy="lazyOnload"
          />
        </div>
      </div>
    </footer>
  );
}

/* ── Language flash prevention ─────────────────────────────────── */
function LanguageReadyWrapper({ children }: { children: ReactNode }) {
  const { mounted } = useLang();
  return (
    <div
      className="transition-opacity duration-[120ms]"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {children}
    </div>
  );
}

/* ── Root layout ───────────────────────────────────────────────── */
export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LanguageReadyWrapper>
          <Header />
          <main>{children}</main>
          <Footer />
        </LanguageReadyWrapper>
      </I18nProvider>
    </ThemeProvider>
  );
}
