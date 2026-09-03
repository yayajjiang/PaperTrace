export type ToolCategory = "Agent Skills" | "MCP & Infra" | "Paper Search" | "People Search" | "Data & Compute" | "Demo";
export type ResearchDomain = "AI & CS" | "Bio & Medicine" | "Physics" | "Math & Stats" | "Materials & Chemistry" | "Social Science" | "Multidisciplinary";

export interface ResearchTool {
  id: string;
  name: string;
  tagline: string;
  taglineZh: string;
  description: string;
  descriptionZh: string;
  category: ToolCategory;
  domains: ResearchDomain[];
  tags: string[];
  href: string;
  github?: string;
  paper?: string;
  guide?: string;
  install?: string;
  votes: number;
  featured?: boolean;
  scores: { impact: number; buzz: number; utility: number };
  evidence?: { value: string; label: string; labelZh: string }[];
}

export const researchTools: ResearchTool[] = [
  {
    id: "arex-skill",
    name: "AREX-Skill + DisCo",
    tagline: "The missing skill layer between intelligence and research",
    taglineZh: "补上智能与科研之间缺失的技能层",
    description:
      "5,000+ verified executable skills distilled from 1,000+ repositories across 20 research fields. DisCo can create, verify and refresh skills, then route them into Codex, Claude Code, Pi and other harnesses.",
    descriptionZh:
      "从 1,000+ 个仓库蒸馏出 5,000+ 个经验证的可执行技能，覆盖 20 个研究领域；DisCo 可构建、验证、刷新技能，并接入 Codex、Claude Code、Pi 等 Harness。",
    category: "Agent Skills",
    domains: ["AI & CS", "Multidisciplinary"],
    tags: ["Open Source", "Agent", "Reproducibility"],
    href: "https://github.com/VectorSpaceLab/AREX-Skill",
    github: "https://github.com/VectorSpaceLab/AREX-Skill",
    paper: "https://arxiv.org/abs/2609.02749",
    install: "npm install -g --ignore-scripts @arex-skill/disco",
    votes: 412,
    featured: true,
    scores: { impact: 88, buzz: 94, utility: 93 },
    evidence: [
      { value: "+134.3%", label: "MLE-bench gain", labelZh: "MLE-bench 提升" },
      { value: "5,000+", label: "verified skills", labelZh: "已验证技能" },
      { value: "178", label: "capability clusters", labelZh: "能力簇" },
    ],
  },
  {
    id: "deepxiv",
    name: "DeepXiv SDK",
    tagline: "An agent-native CLI and index for all of arXiv",
    taglineZh: "面向 Agent 的全量 arXiv CLI 与自建索引",
    description:
      "T+1 full-index updates, progressive paper reading, section-level LLM summaries, semantic search and social attention signals from X — designed to reduce paper-reading context and token cost.",
    descriptionZh:
      "全量自建索引 T+1 更新，支持渐进式阅读、section 级 LLM 摘要、搜索与 X 关注度信号，减少 Agent 读论文的上下文与 token 成本。",
    category: "Paper Search",
    domains: ["AI & CS", "Math & Stats", "Physics"],
    tags: ["CLI", "arXiv", "Agent API"],
    href: "https://github.com/DeepXiv/deepxiv_sdk",
    github: "https://github.com/DeepXiv/deepxiv_sdk",
    votes: 237,
    featured: true,
    scores: { impact: 78, buzz: 82, utility: 91 },
    evidence: [
      { value: "T+1", label: "index refresh", labelZh: "索引更新" },
      { value: "80%+", label: "reported token saving", labelZh: "报告 token 节省" },
    ],
  },
  {
    id: "dinq",
    name: "DINQ",
    tagline: "Turn an underspecified people-search request into verifiable candidates",
    taglineZh: "把欠定义的找人需求变成可验证的候选人名单",
    description:
      "A requirement-driven people-search agent with bounded clarification, two-stage confirmation and evidence validation. Built for hard-to-find researchers whose work lives across papers, code and the open web.",
    descriptionZh:
      "需求驱动的找人 Agent：通过有边界的追问、两阶段确认与证据校验，发现那些履历散落在论文、代码与开放网络中的研究者。",
    category: "People Search",
    domains: ["Multidisciplinary"],
    tags: ["Agent", "Evidence", "MCP"],
    href: "https://www.dinq.me",
    paper: "https://arxiv.org/abs/2608.23501",
    votes: 198,
    featured: true,
    scores: { impact: 84, buzz: 87, utility: 86 },
    evidence: [
      { value: "691", label: "real requests", labelZh: "真实需求" },
      { value: "1.9×", label: "verified recall", labelZh: "验证后召回" },
      { value: "90%", label: "exclusive hits", labelZh: "独家命中" },
    ],
  },
  {
    id: "dinq-analysis",
    name: "DINQ Analysis",
    tagline: "Inspect and compare people-search results",
    taglineZh: "查看与比较找人结果的分析 Demo",
    description:
      "A focused companion experience for understanding candidate evidence and search behavior.",
    descriptionZh: "用于理解候选人证据与搜索行为的轻量分析体验。",
    category: "Demo",
    domains: ["Multidisciplinary"],
    tags: ["Demo", "Analysis", "People Search"],
    href: "https://analysis.dinq.me/",
    votes: 94,
    scores: { impact: 62, buzz: 68, utility: 71 },
  },
  {
    id: "first-author",
    name: "Find 1st Author",
    tagline: "A lightweight research-talent discovery demo",
    taglineZh: "轻量研究人才发现 Demo",
    description:
      "An alternative people-finding demo for comparing discovery paths and candidate coverage.",
    descriptionZh: "可用于对比发现路径与候选覆盖面的另一款找人 Demo。",
    category: "Demo",
    domains: ["Multidisciplinary"],
    tags: ["Demo", "Discovery", "Research Talent"],
    href: "https://find.1stauthor.com/",
    votes: 76,
    scores: { impact: 56, buzz: 63, utility: 69 },
  },
  {
    id: "scho-ai",
    name: "学术智能体 / Scholar Copilot",
    tagline: "A local, customizable academic workspace around your own literature",
    taglineZh: "围绕个人文献库构建的本地化、可定制学术工作台",
    description:
      "Turns local PDFs and research notes into a cited private knowledge base, supports reusable review and writing skills, and routes tasks across several frontier models. The product guide says knowledge-base and conversation data currently remain on the user's computer.",
    descriptionZh:
      "把本地 PDF 与研究笔记组织成带引用的私人知识库，支持可复用的审稿/写作 Skill，并可在多种前沿模型间完成任务。产品教程说明当前知识库与对话数据保存在用户电脑。",
    category: "Agent Skills",
    domains: ["Multidisciplinary"],
    tags: ["Local-first", "Knowledge Base", "Custom Skills"],
    href: "https://www.schoai.cn",
    guide: "https://my.feishu.cn/wiki/AgZlwq6Xli9xnokfjUMcPsqEnSJ",
    votes: 132,
    featured: true,
    scores: { impact: 70, buzz: 76, utility: 85 },
  },
  {
    id: "openalex",
    name: "OpenAlex",
    tagline: "An open graph of the global research system",
    taglineZh: "开放的全球科研知识图谱",
    description:
      "A fully open catalog connecting works, authors, institutions, topics, funders and sources, with a public API and downloadable snapshot for literature analytics and agent tools.",
    descriptionZh:
      "连接论文、作者、机构、主题、资助方与来源的开放目录，提供公开 API 和数据快照，适合文献分析与科研 Agent。",
    category: "MCP & Infra",
    domains: ["Multidisciplinary"],
    tags: ["Open Data", "API", "Knowledge Graph"],
    href: "https://openalex.org/",
    votes: 361,
    scores: { impact: 96, buzz: 72, utility: 94 },
  },
  {
    id: "europe-pmc",
    name: "Europe PMC",
    tagline: "Open life-sciences literature with links to data, protocols and reviews",
    taglineZh: "连接数据、协议与评审的开放生命科学文献库",
    description:
      "Search life-sciences publications and preprints, including full text, citations, open peer review, protocols and biomedical entity annotations.",
    descriptionZh:
      "检索生命科学论文与预印本，并关联全文、引用、开放评审、实验协议和生物医学实体标注。",
    category: "Paper Search",
    domains: ["Bio & Medicine"],
    tags: ["Open Access", "Literature", "Biomedical"],
    href: "https://europepmc.org/",
    votes: 289,
    scores: { impact: 94, buzz: 65, utility: 95 },
  },
  {
    id: "materials-project",
    name: "Materials Project",
    tagline: "Open computed properties and apps for materials discovery",
    taglineZh: "用于材料发现的开放计算性质数据库与应用",
    description:
      "DOE-backed infrastructure that pre-computes material properties and exposes exploration apps, contributed datasets and APIs for batteries, catalysts, solar and other discovery workflows.",
    descriptionZh:
      "由美国能源部支持的科研基础设施，预计算材料性质，并提供探索应用、社区数据与 API，服务电池、催化、光伏等发现流程。",
    category: "Data & Compute",
    domains: ["Materials & Chemistry", "Physics"],
    tags: ["Open Data", "API", "Simulation"],
    href: "https://materialsproject.org/",
    votes: 344,
    scores: { impact: 97, buzz: 70, utility: 96 },
  },
  {
    id: "plumed",
    name: "PLUMED",
    tagline: "Community-developed enhanced sampling for molecular simulation",
    taglineZh: "社区共建的分子模拟增强采样工具",
    description:
      "An open-source library for enhanced sampling, free-energy methods and trajectory analysis that integrates with widely used molecular-dynamics engines.",
    descriptionZh:
      "开源的增强采样、自由能计算与轨迹分析库，可与多种主流分子动力学引擎集成。",
    category: "Data & Compute",
    domains: ["Materials & Chemistry", "Physics", "Bio & Medicine"],
    tags: ["Open Source", "Simulation", "Molecular Dynamics"],
    href: "https://www.plumed.org/",
    github: "https://github.com/plumed/plumed2",
    votes: 218,
    scores: { impact: 92, buzz: 60, utility: 90 },
  },
  {
    id: "inspire-hep",
    name: "INSPIRE HEP",
    tagline: "Curated literature, data and people for high-energy physics",
    taglineZh: "面向高能物理的文献、数据与研究者平台",
    description:
      "A field-specific information platform covering HEP literature, citations, author profiles, conferences, institutions, experiments and jobs.",
    descriptionZh:
      "高能物理垂直信息平台，覆盖文献、引用、作者档案、会议、机构、实验与岗位。",
    category: "Paper Search",
    domains: ["Physics"],
    tags: ["Literature", "Citations", "Research Jobs"],
    href: "https://inspirehep.net/",
    votes: 246,
    scores: { impact: 95, buzz: 61, utility: 93 },
  },
  {
    id: "open-knowledge-maps",
    name: "Open Knowledge Maps",
    tagline: "Visual maps for exploring a research field",
    taglineZh: "用可视化知识地图探索研究领域",
    description:
      "An open, nonprofit discovery tool that builds visual overviews from scholarly metadata and links publications, datasets, software and other research outputs.",
    descriptionZh:
      "开放、非营利的科研发现工具，基于学术元数据生成领域可视化概览，并连接论文、数据集、软件等研究产出。",
    category: "Paper Search",
    domains: ["Multidisciplinary", "Social Science"],
    tags: ["Open Source", "Visualization", "Discovery"],
    href: "https://openknowledgemaps.org/",
    votes: 205,
    scores: { impact: 86, buzz: 66, utility: 87 },
  },
];
