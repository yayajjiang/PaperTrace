"use client";

import Image from "next/image";
import qrCode from "@/images/wechat_group.pic.jpg";
import { CommunityBoard } from "@/components/CommunityBoard";
import { useLang } from "@/lib/i18n";

const paths = [
  {
    number: "01",
    title: "Talk",
    titleZh: "聊热点",
    text: "Fast, informal discussion in the WeChat group — new models, paper drops, jobs and meetups.",
    textZh: "微信群里快速聊新模型、论文发布、岗位与线下活动。",
  },
  {
    number: "02",
    title: "Propose",
    titleZh: "提选题",
    text: "Open a GitHub issue with a paper, tool or question you want PaperTrace to cover.",
    textZh: "在 GitHub Issue 提交希望 PaperTrace 覆盖的论文、工具或问题。",
  },
  {
    number: "03",
    title: "Build",
    titleZh: "一起做",
    text: "Improve an explanation, add a demo, fix a translation or contribute a full deep-dive.",
    textZh: "改进解释、补充 Demo、修正翻译，或贡献一篇完整精读。",
  },
];

const rooms = [
  { icon: "◒", title: "Research help", titleZh: "科研互助", text: "Methods, experiments, reproduction and paper feedback", textZh: "方法、实验、复现与论文反馈", color: "room-blue", href: "https://github.com/yayajjiang/PaperTrace/issues/new?template=research-help.yml&title=%5BHelp%5D%20" },
  { icon: "◇", title: "Internships & roles", titleZh: "实习与岗位", text: "Verified public openings with an expiry boundary", textZh: "带核验日期与失效边界的公开机会", color: "room-emerald", href: "https://github.com/yayajjiang/PaperTrace/issues/new?template=role-opportunity.yml" },
  { icon: "◎", title: "People & collaboration", titleZh: "人脉与合作", text: "Find reviewers and co-builders around a defined task", textZh: "围绕明确任务寻找审阅者与共建者", color: "room-violet", href: "https://github.com/yayajjiang/PaperTrace/issues/new?template=collaboration-request.yml" },
  { icon: "⌁", title: "Tools & launches", titleZh: "工具与发布", text: "Share a tool, recruit testers and compare workflows", textZh: "分享工具、招募体验者、对比工作流", color: "room-amber", href: "https://github.com/yayajjiang/PaperTrace/issues/new?template=submit-a-tool.yml" },
];

export default function CommunityPage() {
  const { lang, t } = useLang();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <section className="community-hero">
        <div className="max-w-2xl">
          <div className="eyebrow mb-4">{t("Built in public", "开放共建")}</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight dark:text-white">
            {t("Research is better with people in the loop.", "科研这件事，有同路人会更好。")}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-paper-800/60 dark:text-slate-300">
            {t(
              "PaperTrace is a small, bilingual learning community. Join the conversation, surface the questions that matter, and help turn difficult ideas into useful public knowledge.",
              "PaperTrace 是一个小而开放的双语学习社区。一起讨论真正重要的问题，把难懂的想法变成可复用的公共知识。"
            )}
          </p>
        </div>
        <div className="community-orbit" aria-hidden="true">
          <span>paper</span><span>demo</span><span>idea</span><strong>PT</strong>
        </div>
      </section>

      <section className="py-14 border-b border-paper-200 dark:border-slate-800">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow mb-2">{t("Community rooms", "社区频道")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Come with a need. Leave with a next step.", "带着问题来，带着下一步走。")}</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {rooms.map((room) => (
            <a key={room.title} href={room.href} target="_blank" rel="noopener noreferrer" className={`community-room ${room.color}`}>
              <span className="room-icon">{room.icon}</span>
              <div>
                <h3 className="font-bold dark:text-slate-100">{lang === "en" ? room.title : room.titleZh}</h3>
                <p className="text-sm text-paper-800/50 dark:text-slate-400 mt-1">{lang === "en" ? room.text : room.textZh}</p>
              </div>
              <span className="ml-auto opacity-40">→</span>
            </a>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow mb-2">{t("Trending now", "正在讨论")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Community radar", "社区雷达")}</h2>
          </div>
          <a href="https://github.com/yayajjiang/PaperTrace/discussions" target="_blank" rel="noopener noreferrer" className="button-secondary">
            GitHub Discussions ↗
          </a>
        </div>
        <CommunityBoard />
      </section>

      <section className="grid md:grid-cols-[1fr_320px] gap-6 items-stretch">
        <div className="surface-card p-7 md:p-9">
          <div className="eyebrow mb-3">{t("How to contribute", "怎么参与")}</div>
          <h2 className="text-2xl font-bold dark:text-white mb-7">{t("Three ways in", "三种参与方式")}</h2>
          <div className="space-y-7">
            {paths.map((path) => (
              <div key={path.number} className="flex gap-4">
                <span className="step-number">{path.number}</span>
                <div>
                  <h3 className="font-bold dark:text-slate-100">{lang === "en" ? path.title : path.titleZh}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-paper-800/55 dark:text-slate-400">
                    {lang === "en" ? path.text : path.textZh}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href="https://github.com/yayajjiang/PaperTrace/issues/new?template=frontier-signal.yml" target="_blank" rel="noopener noreferrer" className="button-primary">
              {t("Submit a signal", "提交前沿线索")} ↗
            </a>
            <a href="https://github.com/yayajjiang/PaperTrace/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="button-secondary">
              {t("Contribution guide", "共建指南")} ↗
            </a>
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-paper-800/40 dark:text-slate-500">{t("Public by default: remove private contact details, confidential research, credentials and personal referrals before posting.", "默认公开：发布前请移除私人联系方式、未公开研究、凭据与未经许可的个人引荐信息。")}</p>
        </div>

        <aside className="qr-card">
          <span className="topic-chip bg-emerald-100 text-emerald-700">WECHAT</span>
          <h2 className="text-xl font-bold mt-4 dark:text-white">{t("Join the live room", "加入微信群")}</h2>
          <p className="text-sm text-paper-800/55 dark:text-slate-400 mt-2 mb-5">
            {t("Scan to meet readers, builders and job hunters.", "扫码认识读者、共建者和正在找工作的同学。")}
          </p>
          <div className="qr-frame">
            <Image src={qrCode} alt={t("PaperTrace WeChat group QR code", "PaperTrace 微信群二维码")} className="w-full h-auto rounded-lg" priority />
          </div>
        </aside>
      </section>
    </div>
  );
}
