"use client";

import { useState } from "react";
import { skillLibrary } from "@/lib/skill-library";
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
            <span className="topic-chip bg-paper-100 text-paper-800/45">SKILL.md</span>
          </div>
          <h2 className="text-xl font-bold mt-6 dark:text-white">{lang === "en" ? skill.name : skill.nameZh}</h2>
          <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-3">{lang === "en" ? skill.description : skill.descriptionZh}</p>
          <div className="skill-stage mt-5">{skill.stage}</div>
          <button onClick={() => copy(skill.id, skill.trigger)} className="copy-prompt mt-5">
            <span className="truncate">{skill.trigger}</span>
            <b>{copied === skill.id ? t("Copied", "已复制") : t("Copy", "复制")}</b>
          </button>
        </article>
      ))}
    </div>
  );
}
