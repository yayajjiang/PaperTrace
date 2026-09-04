"use client";

import { useState } from "react";
import { skillLibrary, skillSources } from "@/lib/skill-library";
import { useLang } from "@/lib/i18n";

export function SkillLibrary() {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {skillLibrary.map((skill, index) => (
        <article key={skill.id} className="skill-card">
          <div className="flex items-center justify-between">
            <span className={`skill-glyph skill-glyph-${skill.color}`}>0{index + 1}</span>
            <span className="topic-chip bg-paper-100 text-paper-800/45">{skill.origin ? "EXTERNAL" : "SKILL.md"}</span>
          </div>
          <h2 className="text-xl font-bold mt-6 dark:text-white">{lang === "en" ? skill.name : skill.nameZh}</h2>
          <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-3">{lang === "en" ? skill.description : skill.descriptionZh}</p>
          <div className="skill-stage mt-5">{skill.stage}</div>
          {(skill.origin || skill.status) && <p className="mt-3 text-[10px] font-mono text-paper-800/40 dark:text-slate-500">{[skill.origin, skill.status].filter(Boolean).join(" · ")}</p>}
          <button onClick={() => copy(skill.id, skill.trigger)} className="copy-prompt mt-5">
            <span className="truncate">{skill.trigger}</span>
            <b>{copied === skill.id ? t("Copied", "已复制") : t("Copy", "复制")}</b>
          </button>
        </article>
      ))}
    </div>
  );
}

export function SkillSourceDirectory() {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {}
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {skillSources.map((source) => (
        <article key={source.id} className="skill-source-card">
          <div className="flex flex-wrap items-center gap-2">
            <span className="topic-chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{source.trust}</span>
            <span className="domain-label">{source.license}</span>
          </div>
          <h3 className="text-xl font-bold mt-5 dark:text-white">{lang === "en" ? source.name : source.nameZh}</h3>
          <p className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400">{lang === "en" ? source.scope : source.scopeZh}</p>
          <p className="mt-3 text-sm leading-relaxed text-paper-800/55 dark:text-slate-400">{lang === "en" ? source.description : source.descriptionZh}</p>
          <button onClick={() => copy(source.id, source.install)} className="copy-prompt mt-5 w-full">
            <code className="truncate text-left">{source.install}</code>
            <b>{copied === source.id ? t("Copied", "已复制") : t("Copy", "复制")}</b>
          </button>
          <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-xs font-bold text-blue-600 dark:text-blue-400">{t("Inspect source", "检查来源")} ↗</a>
        </article>
      ))}
    </div>
  );
}
