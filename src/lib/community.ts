export interface CommunityTopic {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  tag: "Hot" | "Question" | "Build" | "Reading";
  votes: number;
  comments: number;
  href: string;
}

export const communityTopics: CommunityTopic[] = [
  {
    id: "model-retirement",
    title: "When a favorite model disappears, what exactly do we lose?",
    titleZh: "当喜欢的模型下线，我们失去的究竟是什么？",
    description: "Beyond benchmark scores: style, reproducibility, research continuity and migration cost.",
    descriptionZh: "不只看 benchmark：风格、可复现性、研究连续性与迁移成本。",
    tag: "Hot",
    votes: 128,
    comments: 34,
    href: "https://github.com/yayajjiang/PaperTrace/discussions",
  },
  {
    id: "paper-workflow",
    title: "Show us your paper-reading workflow",
    titleZh: "晒出你的论文阅读工作流",
    description: "Zotero, Obsidian, agents or pen and paper — share the system that survives a busy week.",
    descriptionZh: "Zotero、Obsidian、Agent 或纸笔——分享真正能坚持一周的系统。",
    tag: "Question",
    votes: 86,
    comments: 21,
    href: "https://github.com/yayajjiang/PaperTrace/discussions",
  },
  {
    id: "next-demo",
    title: "Vote for the next interactive demo",
    titleZh: "投票决定下一个交互 Demo",
    description: "KV cache calculator, MoE routing playground, or an eval-design clinic?",
    descriptionZh: "KV Cache 计算器、MoE 路由实验台，还是评测设计诊所？",
    tag: "Build",
    votes: 73,
    comments: 17,
    href: "https://github.com/yayajjiang/PaperTrace/issues/new",
  },
  {
    id: "weekly-club",
    title: "Weekly paper club: one figure, one insight",
    titleZh: "每周论文局：一张图，一个洞察",
    description: "A lightweight reading club format for people who do not have two hours for every paper.",
    descriptionZh: "为没空精读每篇论文的人设计的轻量共读形式。",
    tag: "Reading",
    votes: 61,
    comments: 12,
    href: "https://github.com/yayajjiang/PaperTrace/discussions",
  },
];
