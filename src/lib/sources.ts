import { ResearchDomain } from "@/lib/tools";

export type SourceLayer = "Primary" | "Index" | "Community" | "Social";

export interface SignalSource {
  id: string;
  name: string;
  layer: SourceLayer;
  domains: ResearchDomain[];
  region: "China" | "Global";
  cadence: string;
  access: string;
  useFor: string;
  useForZh: string;
  boundary: string;
  boundaryZh: string;
  href: string;
}

export const signalSources: SignalSource[] = [
  {
    id: "official-ai-labs", name: "OpenAI · Anthropic · Google DeepMind", layer: "Primary",
    domains: ["AI & CS"], region: "Global", cadence: "Every 8h", access: "RSS / newsroom",
    useFor: "Model launches, pricing, capabilities, safety reports and official lifecycle changes.",
    useForZh: "模型发布、价格、能力、安全报告与官方生命周期变化。",
    boundary: "Vendor claims stay labelled until independently reproduced.",
    boundaryZh: "厂商自报结果在独立复现前始终保留标注。",
    href: "https://openai.com/news/",
  },
  {
    id: "openai-codex-github", name: "OpenAI Codex · GitHub Releases", layer: "Primary",
    domains: ["AI & CS"], region: "Global", cadence: "Every 8h", access: "Public GitHub API",
    useFor: "Official Codex release notes and versioned change records, cross-checked against community links.",
    useForZh: "Codex 官方 Release Notes 与版本化变更记录，并与社区外链交叉核验。",
    boundary: "A community thread is verified only when it directly links to OpenAI or the openai/codex repository.",
    boundaryZh: "社区讨论只有直接回链 OpenAI 或 openai/codex 仓库时才算已核验。",
    href: "https://github.com/openai/codex/releases",
  },
  {
    id: "official-events", name: "Organizer & society calendars", layer: "Primary",
    domains: ["Multidisciplinary"], region: "Global", cadence: "Twice weekly", access: "Official pages",
    useFor: "Conference dates, submission deadlines, registration and venue changes.",
    useForZh: "大会日期、投稿截止、报名与场地变化。",
    boundary: "Aggregators can discover an event, but cannot verify its date.",
    boundaryZh: "聚合站可用于发现活动，但不能作为日期核验依据。",
    href: "https://conferences.nature.com/index.html",
  },
  {
    id: "arxiv", name: "arXiv", layer: "Index",
    domains: ["AI & CS", "Physics", "Math & Stats", "Materials & Chemistry", "Bio & Medicine", "Social Science"], region: "Global", cadence: "Daily", access: "Public API",
    useFor: "Fast preprint discovery across six tracked domain feeds.",
    useForZh: "通过六个领域流快速发现预印本。",
    boundary: "Submission is not peer review; impact needs downstream evidence.",
    boundaryZh: "投稿不等于同行评审；影响力需要后续证据。",
    href: "https://arxiv.org/",
  },
  {
    id: "huggingface-papers", name: "Hugging Face Papers", layer: "Index",
    domains: ["AI & CS"], region: "Global", cadence: "Daily", access: "Public endpoint",
    useFor: "Paper discovery plus a separately displayed platform-upvote signal.",
    useForZh: "论文发现，并单独展示平台点赞信号。",
    boundary: "Upvotes measure one community's attention, not scientific quality.",
    boundaryZh: "点赞只代表单个平台注意力，不代表科研质量。",
    href: "https://huggingface.co/papers/trending",
  },
  {
    id: "huggingface-models", name: "Hugging Face Models · verified organizations", layer: "Index",
    domains: ["AI & CS"], region: "Global", cadence: "Every 8h", access: "Public API",
    useFor: "Fresh model-card and checkpoint signals from selected vendor and open-model organizations.",
    useForZh: "发现选定厂商与开放模型组织新发布的模型卡和 checkpoint。",
    boundary: "A registry upload is not a formal launch, benchmark result or safety review; verify the model card and vendor announcement.",
    boundaryZh: "模型仓库上新不等于正式发布、基准结论或安全审查；需继续核验模型卡与厂商公告。",
    href: "https://huggingface.co/models",
  },
  {
    id: "openalex", name: "OpenAlex", layer: "Index",
    domains: ["Multidisciplinary"], region: "Global", cadence: "Daily", access: "Open API + snapshot",
    useFor: "Works, authors, institutions, topics and citation-graph enrichment.",
    useForZh: "补充论文、作者、机构、主题与引用图谱。",
    boundary: "Metadata coverage and entity matching must be spot-checked.",
    boundaryZh: "元数据覆盖与实体匹配需要抽样核查。",
    href: "https://openalex.org/",
  },
  {
    id: "europe-pmc", name: "Europe PMC", layer: "Index",
    domains: ["Bio & Medicine"], region: "Global", cadence: "Daily", access: "Open API",
    useFor: "Life-science literature, full text, grants, data links and biomedical entities.",
    useForZh: "生命科学文献、全文、基金、数据链接与生物医学实体。",
    boundary: "Clinical decisions still require primary studies and expert review.",
    boundaryZh: "临床决策仍需回到原始研究并由专业人员审核。",
    href: "https://europepmc.org/",
  },
  {
    id: "biorxiv", name: "bioRxiv · medRxiv", layer: "Index",
    domains: ["Bio & Medicine"], region: "Global", cadence: "Daily", access: "Public feeds",
    useFor: "Earliest biology and health preprint signals.",
    useForZh: "最早期的生物与健康预印本信号。",
    boundary: "medRxiv findings are preliminary and must not drive medical advice.",
    boundaryZh: "medRxiv 结果为初步研究，不能直接用于医疗建议。",
    href: "https://www.biorxiv.org/",
  },
  {
    id: "chemrxiv", name: "ChemRxiv", layer: "Index",
    domains: ["Materials & Chemistry"], region: "Global", cadence: "Daily", access: "Public search",
    useFor: "Early chemistry and materials manuscripts.",
    useForZh: "早期化学与材料研究稿件。",
    boundary: "Preprints remain unreviewed; safety-critical claims need stronger evidence.",
    boundaryZh: "预印本未经同行评审；安全关键结论需要更强证据。",
    href: "https://chemrxiv.org/",
  },
  {
    id: "inspire", name: "INSPIRE HEP · NASA ADS", layer: "Index",
    domains: ["Physics"], region: "Global", cadence: "Daily", access: "Public search / API",
    useFor: "Physics literature, citations, people, experiments and astronomy coverage.",
    useForZh: "物理文献、引用、研究者、实验与天文学覆盖。",
    boundary: "Field-specific relevance does not transfer automatically across domains.",
    boundaryZh: "领域内相关性不能自动外推到其他方向。",
    href: "https://inspirehep.net/",
  },
  {
    id: "repec", name: "RePEc · SSRN", layer: "Index",
    domains: ["Social Science"], region: "Global", cadence: "Daily", access: "Public search",
    useFor: "Economics working papers and early social-science research.",
    useForZh: "经济学工作论文与早期社会科学研究。",
    boundary: "Working-paper status and later revisions must stay visible.",
    boundaryZh: "必须保留工作论文状态与后续版本变化。",
    href: "https://repec.org/",
  },
  {
    id: "linuxdo", name: "LINUX DO", layer: "Community",
    domains: ["AI & CS", "Multidisciplinary"], region: "China", cadence: "Daily sample", access: "Public topics",
    useFor: "Chinese developer pain points, hands-on tool reports, launch discovery and early adoption signals.",
    useForZh: "中文开发者痛点、工具实测、项目首发与早期采用信号。",
    boundary: "Discovery only until linked to primary evidence. Respect the community's AI-content policy; PaperTrace never auto-posts.",
    boundaryZh: "回链一手证据前仅用于发现。遵守社区 AI 内容政策，PaperTrace 不自动发帖。",
    href: "https://linux.do/latest",
  },
  {
    id: "github", name: "GitHub", layer: "Community",
    domains: ["Multidisciplinary"], region: "Global", cadence: "Daily", access: "Public API",
    useFor: "Runnable artifacts, releases, issues, maintenance activity and timestamped attention signals.",
    useForZh: "可运行产物、版本、Issue、维护活跃度与带时间戳的注意力信号。",
    boundary: "Stars are attention, not reproducibility or scientific validation.",
    boundaryZh: "Star 是注意力，不是可复现性或科研验证。",
    href: "https://github.com/trending",
  },
  {
    id: "hacker-news", name: "Hacker News", layer: "Community",
    domains: ["AI & CS"], region: "Global", cadence: "Daily sample", access: "Public API",
    useFor: "Fast developer discussion around new infrastructure, models and open-source releases.",
    useForZh: "捕捉新基础设施、模型与开源发布的快速开发者讨论。",
    boundary: "Audience and ranking bias are strong; use only as a buzz signal.",
    boundaryZh: "受众与排序偏差明显，只能作为热度信号。",
    href: "https://news.ycombinator.com/",
  },
  {
    id: "x", name: "X", layer: "Social",
    domains: ["Multidisciplinary"], region: "Global", cadence: "Verified samples", access: "Public posts only",
    useFor: "Researcher announcements, thread velocity and links to newly released artifacts.",
    useForZh: "研究者公告、讨论速度与新发布产物链接。",
    boundary: "No private/session scraping; a captured public URL and timestamp are mandatory.",
    boundaryZh: "不抓取私有/会话数据；必须保存公开链接与采集时间。",
    href: "https://x.com/",
  },
  {
    id: "xiaohongshu", name: "小红书", layer: "Social",
    domains: ["Multidisciplinary"], region: "China", cadence: "Verified samples", access: "Public posts only",
    useFor: "Chinese event reports, tool adoption, lab-life and early community questions.",
    useForZh: "中文活动报道、工具采用、实验室生活与早期社区问题。",
    boundary: "Never convert anecdotal popularity into an impact score without primary evidence.",
    boundaryZh: "没有一手证据时，绝不把轶事热度换算成影响力评分。",
    href: "https://www.xiaohongshu.com/explore",
  },
];
