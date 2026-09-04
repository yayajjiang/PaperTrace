"use client";

import { TodayBriefing } from "@/components/TodayBriefing";
import { useLang } from "@/lib/i18n";

export default function BriefingPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="radar-hero">
        <div className="eyebrow mb-4">TODAY · {t("ATTENTION BRIEF", "注意力简报")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-4xl dark:text-white">{t("Do not read everything. Notice the right thing in time.", "不用读完所有信息，只要及时注意对的事情。")}</h1>
        <p className="mt-5 text-lg leading-relaxed max-w-3xl text-paper-800/60 dark:text-slate-300">{t("Choose an attention budget. PaperTrace compresses research news, deadlines, model migrations and community signals into the next useful action.", "选择一个注意力预算。PaperTrace 将科研新闻、活动截止、模型迁移与社区信号压缩成下一步可执行动作。")}</p>
      </section>
      <section className="mt-10"><TodayBriefing /></section>
    </div>
  );
}
