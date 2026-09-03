export type FrontierType = "Lab" | "Team" | "Model" | "Infrastructure" | "Direction";

export interface FrontierItem {
  id: string;
  name: string;
  nameZh: string;
  type: FrontierType;
  domain: string;
  announcedAt: string;
  summary: string;
  summaryZh: string;
  whyWatch: string;
  whyWatchZh: string;
  people: string[];
  href: string;
  attention: "Skim" | "Read" | "Deep dive";
  status: "New" | "Early access" | "Forming" | "Active";
}

export const frontierItems: FrontierItem[] = [
  {
    id: "world-labs-atlas",
    name: "World Labs · Atlas",
    nameZh: "World Labs · Atlas 世界模型",
    type: "Model",
    domain: "World Models",
    announcedAt: "2026-09-01",
    summary: "An omni world model pretrained for text, images, video and 3D using a multimodal autoregressive diffusion transformer.",
    summaryZh: "原生处理文本、图像、视频与 3D 的 omni 世界模型，采用多模态自回归扩散 Transformer。",
    whyWatch: "It unifies controlled generation, sparse-view reconstruction and real-to-sim robotics inside one spatial context.",
    whyWatchZh: "它在同一个空间上下文中统一了可控生成、稀疏视角重建与机器人 real-to-sim。",
    people: ["Fei-Fei Li", "World Labs"],
    href: "https://www.worldlabs.ai/blog/atlas",
    attention: "Deep dive",
    status: "Early access",
  },
  {
    id: "renesas-physical-ai-lab",
    name: "Renesas Physical AI & Robotics Lab",
    nameZh: "瑞萨电子 Physical AI 与机器人实验室",
    type: "Lab",
    domain: "Embodied AI",
    announcedAt: "2026-08",
    summary: "A new Beijing lab for system-level demonstration, validation and joint development across robotics and physical AI.",
    summaryZh: "在北京成立的新实验室，聚焦机器人与 Physical AI 的系统级展示、验证与联合开发。",
    whyWatch: "It connects embodied-model progress to chips, sensing, control and deployable robotics systems.",
    whyWatchZh: "它把具身模型进展连接到芯片、传感、控制与可部署机器人系统。",
    people: ["Renesas"],
    href: "https://www.renesas.com/en/about/newsroom/renesas-establishes-physical-ai-robotics-lab-beijing-accelerate-next-generation-robotics-innovation",
    attention: "Skim",
    status: "New",
  },
  {
    id: "kaist-nvidia-lab",
    name: "NVIDIA–KAIST Joint AI Research Lab",
    nameZh: "NVIDIA–KAIST 联合 AI 研究实验室",
    type: "Lab",
    domain: "Agentic AI",
    announcedAt: "2026-07-24",
    summary: "A university–industry lab focused on next-generation agentic AI for Korean language and domestic industries.",
    summaryZh: "校企联合实验室，聚焦面向韩语与本土产业的下一代 Agentic AI。",
    whyWatch: "It pairs academic research with frontier compute and a clear regional deployment agenda.",
    whyWatchZh: "它把学术研究、前沿算力与明确的区域落地议程组合在一起。",
    people: ["NVIDIA", "KAIST"],
    href: "https://kaist.ac.kr/newsen/html/news/?mode=V&mng_no=64872",
    attention: "Read",
    status: "Forming",
  },
  {
    id: "bold-lab",
    name: "BOLD Lab",
    nameZh: "BOLD 开放学习与发现实验室",
    type: "Lab",
    domain: "Open-ended Learning",
    announcedAt: "2026-06-22",
    summary: "A £30m UK lab spanning Oxford, UCL and Imperial to develop open, human-centred, resource-efficient AI for the real world.",
    summaryZh: "由牛津、UCL 与帝国理工参与、规模 3,000 万英镑的英国实验室，研究开放、人本、资源高效的现实世界 AI。",
    whyWatch: "Its remit explicitly goes beyond LLMs into robotics, engineering, healthcare and scientific discovery.",
    whyWatchZh: "其议程明确超越 LLM，覆盖机器人、工程、医疗与科学发现。",
    people: ["Jakob Foerster", "Antoine Cully"],
    href: "https://www.imperial.ac.uk/news/articles/engineering/computing/2026/imperial-joins-oxford-and-ucl-in-bold-new-30-million-uk-ai-research-lab/",
    attention: "Read",
    status: "Forming",
  },
  {
    id: "1x-world-model-lab",
    name: "1X World Model Lab",
    nameZh: "1X 世界模型实验室",
    type: "Lab",
    domain: "Embodied AI",
    announcedAt: "2026-06-04",
    summary: "A frontier research group dedicated to large-scale embodied world-model pretraining for autonomous humanoids.",
    summaryZh: "面向自主通用人形机器人的前沿研究团队，专注大规模具身世界模型预训练。",
    whyWatch: "Its proposed data flywheel spans web video, egocentric footage, simulation, teleoperation and on-policy robot data.",
    whyWatchZh: "它提出的数据飞轮连接网络视频、第一视角数据、仿真、遥操作与 on-policy 机器人数据。",
    people: ["Sam Sinha", "1X"],
    href: "https://www.1x.tech/discover/1x-world-model-lab",
    attention: "Deep dive",
    status: "New",
  },
  {
    id: "stanford-ai-orgs",
    name: "Stanford AI and Organizations Lab",
    nameZh: "斯坦福 AI 与组织实验室",
    type: "Lab",
    domain: "Social Science",
    announcedAt: "2026-05-13",
    summary: "A new HAI center building an empirical science of how AI changes jobs, teams, coordination and organizational performance.",
    summaryZh: "Stanford HAI 新中心，建立 AI 如何改变岗位、团队、协作与组织绩效的实证科学。",
    whyWatch: "It treats workplace AI as a measurable organizational system rather than a collection of productivity anecdotes.",
    whyWatchZh: "它把职场 AI 当作可衡量的组织系统，而非零散的效率故事。",
    people: ["Melissa Valentine", "Stanford HAI"],
    href: "https://hai.stanford.edu/news/stanford-hai-launches-ai-and-organizations-lab-to-study-science-of-ai-in-the-workplace",
    attention: "Read",
    status: "New",
  },
  {
    id: "anthropic-labs",
    name: "Anthropic Labs",
    nameZh: "Anthropic Labs",
    type: "Team",
    domain: "Agent Products",
    announcedAt: "2026-01-13",
    summary: "A dedicated team for moving research previews such as Claude Code, MCP, Skills and Cowork into new product categories.",
    summaryZh: "专门把 Claude Code、MCP、Skills、Cowork 等研究预览推进为新品类的团队。",
    whyWatch: "It is a useful organizational signal: agent infrastructure and human-computer interaction are becoming a first-class lab agenda.",
    whyWatchZh: "这是一个组织层面的信号：Agent 基础设施与人机交互正在成为一级研究议程。",
    people: ["Anthropic"],
    href: "https://www.anthropic.com/news/introducing-anthropic-labs",
    attention: "Skim",
    status: "Active",
  },
];

