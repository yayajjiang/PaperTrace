"use client";

import { SkillLibrary } from "@/components/SkillLibrary";
import { useLang } from "@/lib/i18n";

export default function SkillsPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="skills-hero">
        <div className="eyebrow mb-4">{t("Executable knowledge", "可执行知识")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl dark:text-white">{t("Don't start every research task from zero.", "别让每次科研任务都从零试错。")}</h1>
        <p className="mt-5 text-lg leading-relaxed max-w-3xl text-paper-800/60 dark:text-slate-300">
          {t(
            "PaperTrace Skills package repeatable research practice into inspectable workflows. Use the built-in publishing skills, or connect a larger skill library when the task needs specialist execution.",
            "PaperTrace Skills 把可复用的科研经验封装成可检查的工作流。可以使用站内发布技能，也可以在任务需要专业执行时接入更大的技能库。"
          )}
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <a href="https://github.com/yayajjiang/PaperTrace/tree/main/skills" target="_blank" rel="noopener noreferrer" className="button-primary">{t("View source", "查看源码")} ↗</a>
          <a href="https://github.com/VectorSpaceLab/AREX-Skill" target="_blank" rel="noopener noreferrer" className="button-secondary">AREX-Skill ↗</a>
        </div>
      </section>

      <section className="mt-14">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow mb-2">{t("PaperTrace-native", "PaperTrace 原生")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Publishing workflows", "内容生产工作流")}</h2>
          </div>
          <span className="text-sm text-paper-800/45 dark:text-slate-500">3 {t("skills", "个技能")}</span>
        </div>
        <SkillLibrary />
      </section>

      <section className="mt-16 skill-architecture">
        <div>
          <div className="eyebrow mb-3">{t("Skill architecture", "技能架构")}</div>
          <h2 className="text-2xl font-bold dark:text-white">{t("Load expertise only when it is needed", "只在需要时加载专业能力")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-800/60 dark:text-slate-400">
            {t("A small routing layer chooses a scoped, source-backed workflow. The workflow produces an artifact, then verification gates decide whether it can be published.", "轻量路由层选择范围明确、有来源依据的工作流；工作流产出内容，再经过验证门槛后发布。")}
          </p>
        </div>
        <div className="architecture-flow" aria-label={t("Skill flow", "技能流程")}>
          <span>{t("Goal", "目标")}</span><i>→</i><span>{t("Route", "路由")}</span><i>→</i><span>Skill</span><i>→</i><span>{t("Verify", "验证")}</span><i>→</i><span>{t("Publish", "发布")}</span>
        </div>
      </section>
    </div>
  );
}
