"use client";

import { ToolDirectory } from "@/components/ToolDirectory";
import { useLang } from "@/lib/i18n";

export default function ToolsPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="directory-hero">
        <div className="eyebrow mb-4">{t("Research stack", "科研工具栈")}</div>
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("Tools that move research forward.", "真正推动科研向前的工具。")}</h1>
            <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300 max-w-3xl">
              {t(
                "Open-source systems, agent skills and sharp demos — selected for a concrete research job, inspectable evidence and a path to try them now.",
                "开源系统、Agent Skills 与好用的 Demo——每个项目都要解决具体科研任务、有可查看的证据，并且现在就能上手。"
              )}
            </p>
          </div>
          <a href="https://github.com/yayajjiang/PaperTrace/issues/new?template=submit-a-tool.yml" target="_blank" rel="noopener noreferrer" className="button-primary whitespace-nowrap">
            + {t("Submit a tool", "提交工具")}
          </a>
        </div>
      </section>

      <section className="mt-10">
        <ToolDirectory />
      </section>

      <section className="mt-16 surface-card p-7 md:p-9 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="eyebrow mb-2">{t("Curation standard", "收录标准")}</div>
          <h2 className="text-2xl font-bold dark:text-white">{t("A launch post should answer four questions", "一篇发布帖，要回答四个问题")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-800/60 dark:text-slate-400">
            {t("What research job does it solve? What is new? What evidence supports the claim? How can someone reproduce or try it?", "解决哪个科研任务？新在哪里？结论有什么证据？别人怎么复现或直接体验？")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          {[t("Job", "任务"), t("Novelty", "创新"), t("Evidence", "证据"), t("Try it", "体验")].map((item, index) => (
            <span key={item} className="criteria-tile"><b>0{index + 1}</b>{item}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
