"use client";

import { EventRadar } from "@/components/EventRadar";
import { useLang } from "@/lib/i18n";
import { researchEvents } from "@/lib/events";

export default function EventsPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="max-w-4xl">
        <div className="eyebrow mb-4">{t("Event radar", "活动雷达")}</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight dark:text-white">{t("Know before the room fills up.", "在名额满之前知道。")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300 max-w-3xl">{t("Major conferences, hackathons, competitions and exhibitions—sorted by the next deadline, checked against organizer pages, and separated from after-the-fact news.", "大型大会、黑客松、比赛与展览——按最近截止日期排序，以主办方页面核验，不再等活动结束后才看到新闻。")}</p>
        <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-900/70 dark:text-amber-200/70">{t("Dates can change. Every card shows the last verified date and links to the organizer; check the official page before booking travel or paying fees.", "活动日期可能变更。每张卡片都连接主办方页面；预订行程或付费前请再次以官网为准。")}</div>
        <p className="mt-3 text-xs text-paper-800/45 dark:text-slate-500">{t("Calendar exports include the event, its open deadline, and 7-day / 1-day reminders. They work without an account.", "日历导出包含活动、尚未截止的关键日期，以及提前 7 天 / 1 天提醒；无需账号。")}</p>
        <div className="flex flex-wrap items-center gap-3 mt-5 text-xs text-paper-800/45 dark:text-slate-500">
          <b className="text-paper-800/70 dark:text-slate-300">{researchEvents.length} {t("verified entries", "条已核验活动")}</b>
          <span>·</span><span>{new Set(researchEvents.flatMap((event) => event.domains)).size} {t("fields", "个方向")}</span>
          <a href="https://github.com/yayajjiang/PaperTrace/issues/new?template=submit-event.yml" target="_blank" rel="noopener noreferrer" className="ml-auto font-bold text-blue-600 dark:text-blue-400">{t("Submit an event", "提交活动")} ↗</a>
        </div>
      </section>
      <section className="mt-8"><EventRadar /></section>
    </div>
  );
}
