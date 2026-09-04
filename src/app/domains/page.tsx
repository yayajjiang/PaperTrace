"use client";

import Link from "next/link";
import { domains } from "@/lib/domains";
import { useLang } from "@/lib/i18n";

export default function DomainsPage() {
  const { lang, t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-3xl">
        <div className="eyebrow mb-4">{t("Research domains", "研究领域")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("One research commons, many expert rooms.", "一个科研公共空间，多个专业房间。")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300">
          {t(
            "AI & CS is the first complete collection. New fields start with trusted sources and tools, then grow under domain editors who understand what evidence matters there.",
            "AI 与 CS 是第一个完整板块。其他领域从可信来源与工具开始，再由真正理解该领域证据标准的维护者共同建设。"
          )}
        </p>
      </section>

      <div className="domain-grid mt-12">
        {domains.map((domain, index) => (
          <article key={domain.id} className={`domain-card ${domain.status !== "forming" ? "domain-card-active" : ""}`} style={{ "--domain-color": domain.color } as React.CSSProperties}>
            <div className="flex items-start justify-between gap-4">
              <span className="domain-index">0{index + 1}</span>
              <span className={`topic-chip ${domain.status !== "forming" ? "bg-emerald-100 text-emerald-700" : "bg-paper-100 text-paper-800/50"}`}>
                {domain.status === "active" ? t("FULL COLLECTION", "完整内容库") : domain.status === "live" ? t("LIVE SIGNALS", "实时信号") : t("FORMING", "筹备中")}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-6 dark:text-white">{lang === "en" ? domain.name : domain.nameZh}</h2>
            <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-2">{lang === "en" ? domain.description : domain.descriptionZh}</p>
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-paper-800/35 dark:text-slate-500 mb-2">{t("Open desks", "可延伸方向")}</div>
              <div className="flex flex-wrap gap-1.5">
                {domain.subtopics.map((topic) => <span key={topic.name} className="subtle-chip">{lang === "en" ? topic.name : topic.nameZh}</span>)}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-5">
              {domain.sources.map((source) => <span key={source} className="subtle-chip">{source}</span>)}
            </div>
            <div className="mt-7">
              <Link href={domain.status === "active" ? "/" : "/radar?domain=" + encodeURIComponent(domain.radarDomain)} className="text-sm font-bold text-blue-600 dark:text-blue-400">{domain.status === "active" ? t("Explore collection", "浏览内容") : t("Open live desk", "打开实时工作台")} →</Link>
              {domain.status !== "active" && <a href={`https://github.com/yayajjiang/PaperTrace/issues/new?title=${encodeURIComponent(`[Domain editor] ${domain.name}`)}`} target="_blank" rel="noopener noreferrer" className="block mt-3 text-xs font-bold text-paper-800/45 dark:text-slate-400 hover:text-blue-600">{t("Become a founding editor", "成为领域共建人")} →</a>}
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16 manifesto-strip">
        <div>
          <div className="eyebrow mb-2">{t("Governance", "共建原则")}</div>
          <h2 className="text-2xl font-bold dark:text-white">{t("Local expertise, shared infrastructure", "专业判断分布式，基础设施共用")}</h2>
        </div>
        <p className="text-sm leading-relaxed text-paper-800/60 dark:text-slate-400 max-w-xl">
          {t(
            "Each field owns its curation rubric, canonical sources and reviewers. PaperTrace provides the bilingual publishing system, ranking model, automation and community surface.",
            "每个领域维护自己的收录标准、权威来源与审核者；PaperTrace 提供双语发布系统、评分模型、自动化与社区入口。"
          )}
        </p>
      </section>
    </div>
  );
}
