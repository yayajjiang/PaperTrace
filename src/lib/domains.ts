export interface Domain {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  color: string;
  status: "active" | "forming";
  sources: string[];
}

export const domains: Domain[] = [
  {
    id: "ai-cs",
    name: "AI & Computer Science",
    nameZh: "人工智能与计算机科学",
    description: "The original PaperTrace collection: model releases, foundational papers, systems, alignment, multimodality and research engineering.",
    descriptionZh: "PaperTrace 的起点：模型发布、经典论文、系统、对齐、多模态与科研工程。",
    color: "#2563eb",
    status: "active",
    sources: ["arXiv cs.AI / cs.LG / cs.CL", "Hugging Face Papers", "Open-source repos"],
  },
  {
    id: "bio-medicine",
    name: "Biology & Medicine",
    nameZh: "生物与医学",
    description: "Genomics, proteins, clinical evidence, computational biology and tools that connect papers to protocols and data.",
    descriptionZh: "基因组、蛋白质、临床证据、计算生物学，以及连接论文、协议与数据的工具。",
    color: "#059669",
    status: "forming",
    sources: ["Europe PMC", "PubMed", "bioRxiv / medRxiv"],
  },
  {
    id: "physics",
    name: "Physics",
    nameZh: "物理",
    description: "From high-energy physics and astrophysics to condensed matter, simulation and scientific machine learning.",
    descriptionZh: "从高能物理、天体物理到凝聚态、模拟与科学机器学习。",
    color: "#7c3aed",
    status: "forming",
    sources: ["arXiv physics", "INSPIRE HEP", "NASA ADS"],
  },
  {
    id: "math-stats",
    name: "Mathematics & Statistics",
    nameZh: "数学与统计",
    description: "Proofs, formal methods, probability, statistical inference and tools for checking or exploring mathematical work.",
    descriptionZh: "证明、形式化方法、概率、统计推断，以及用于检查与探索数学工作的工具。",
    color: "#0891b2",
    status: "forming",
    sources: ["arXiv math / stat", "Mathlib", "zbMATH Open"],
  },
  {
    id: "materials-chemistry",
    name: "Materials & Chemistry",
    nameZh: "材料与化学",
    description: "Molecular simulation, structure search, reaction data and open infrastructure for materials discovery.",
    descriptionZh: "分子模拟、结构搜索、反应数据，以及材料发现的开放基础设施。",
    color: "#d97706",
    status: "forming",
    sources: ["Materials Project", "ChemRxiv", "PLUMED"],
  },
  {
    id: "social-science",
    name: "Social Science",
    nameZh: "社会科学",
    description: "Economics, psychology, policy and transparent workflows for data, preregistration, evidence synthesis and replication.",
    descriptionZh: "经济学、心理学、公共政策，以及数据、预注册、证据综合与复现的透明工作流。",
    color: "#e11d48",
    status: "forming",
    sources: ["SSRN", "OpenAlex", "OSF"],
  },
];
