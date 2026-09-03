export interface Domain {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  color: string;
  status: "active" | "forming";
  sources: string[];
  subtopics: Array<{ name: string; nameZh: string }>;
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
    subtopics: [
      { name: "Foundation Models", nameZh: "基础模型" },
      { name: "World Models", nameZh: "世界模型" },
      { name: "Embodied AI", nameZh: "具身智能" },
      { name: "Agents & MCP", nameZh: "Agent 与 MCP" },
      { name: "Multimodal", nameZh: "多模态" },
      { name: "Systems & Efficiency", nameZh: "系统与效率" },
      { name: "Alignment & Safety", nameZh: "对齐与安全" },
      { name: "HCI", nameZh: "人机交互" },
    ],
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
    subtopics: [
      { name: "Genomics", nameZh: "基因组学" },
      { name: "Proteins", nameZh: "蛋白质" },
      { name: "Drug Discovery", nameZh: "药物发现" },
      { name: "Clinical Evidence", nameZh: "临床证据" },
      { name: "NeuroAI", nameZh: "神经科学与 AI" },
      { name: "Computational Biology", nameZh: "计算生物学" },
    ],
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
    subtopics: [
      { name: "High-energy Physics", nameZh: "高能物理" },
      { name: "Astrophysics", nameZh: "天体物理" },
      { name: "Quantum", nameZh: "量子" },
      { name: "Condensed Matter", nameZh: "凝聚态" },
      { name: "Simulation", nameZh: "数值模拟" },
      { name: "Scientific ML", nameZh: "科学机器学习" },
    ],
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
    subtopics: [
      { name: "Optimization", nameZh: "优化" },
      { name: "Probability", nameZh: "概率" },
      { name: "Formal Proof", nameZh: "形式化证明" },
      { name: "Causal Inference", nameZh: "因果推断" },
      { name: "Bayesian Methods", nameZh: "贝叶斯方法" },
      { name: "Numerical Methods", nameZh: "数值方法" },
    ],
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
    subtopics: [
      { name: "Molecular Design", nameZh: "分子设计" },
      { name: "Catalysis", nameZh: "催化" },
      { name: "Batteries", nameZh: "电池" },
      { name: "Structure Prediction", nameZh: "结构预测" },
      { name: "Molecular Dynamics", nameZh: "分子动力学" },
      { name: "Reaction Prediction", nameZh: "反应预测" },
    ],
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
    subtopics: [
      { name: "Economics", nameZh: "经济学" },
      { name: "Psychology", nameZh: "心理学" },
      { name: "Organizations", nameZh: "组织科学" },
      { name: "Public Policy", nameZh: "公共政策" },
      { name: "Computational Social Science", nameZh: "计算社会科学" },
      { name: "Reproducibility", nameZh: "可复现性" },
    ],
  },
];
