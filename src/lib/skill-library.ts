export interface SkillEntry {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  trigger: string;
  stage: string;
  color: "blue" | "emerald" | "violet" | "amber";
  origin?: string;
  status?: string;
}

export const skillLibrary: SkillEntry[] = [
  {
    id: "deep-dive",
    name: "Paper → Deep Dive",
    nameZh: "论文 → 交互式精读",
    description: "Turn a research paper into a bilingual explanation with formula walkthroughs, concrete examples, connections and an interactive demo.",
    descriptionZh: "把一篇论文变成含公式拆解、具体例子、工作关联与交互 Demo 的双语精读。",
    trigger: "Build a PaperTrace deep-dive for [paper URL]",
    stage: "Understand → explain → visualize → verify",
    color: "blue",
  },
  {
    id: "daily-digest",
    name: "Daily Research Signal",
    nameZh: "每日科研信号",
    description: "Collect recent work, identify why it matters, label one editor's pick and publish a compact bilingual digest.",
    descriptionZh: "收集近期工作、判断其价值、选出编辑精选，并发布紧凑的双语日报。",
    trigger: "Create today's research digest for [domain]",
    stage: "Collect → rank → summarize → source-check",
    color: "emerald",
  },
  {
    id: "weekly-narrative",
    name: "Weekly Narrative",
    nameZh: "每周研究主线",
    description: "Find the week's connecting idea instead of listing links, then group 5–10 papers around one emerging narrative.",
    descriptionZh: "不只罗列链接，而是找到一周内容之间的主线，并围绕一个趋势组织 5–10 篇论文。",
    trigger: "Synthesize this week's [domain] research",
    stage: "Collect → cluster → theme → publish",
    color: "violet",
  },
  {
    id: "ai-research",
    name: "AI Research Loop",
    nameZh: "AI 科研闭环",
    description: "An installed MIT-licensed workflow for hypotheses, literature review, baseline reproduction, leak-free experiments, multi-seed analysis and evidence-backed writing.",
    descriptionZh: "已安装的 MIT 开源工作流，覆盖假设、文献综述、基线复现、防泄漏实验、多随机种子分析与证据驱动写作。",
    trigger: "Use the ai-research skill to design and verify [experiment]",
    stage: "Frame → reproduce → run → analyze → write",
    color: "amber",
    origin: "Toadoum/ai-research-skill",
    status: "Installed · source + scripts inspected",
  },
];

export const skillSources = [
  {
    id: "arex",
    name: "AREX Research Skills Library",
    nameZh: "AREX 科研技能库",
    scope: "1,060 public operating skills · 170 repositories · 14 families",
    scopeZh: "公开版本含 1,060 个操作技能 · 170 个仓库 · 14 个能力族",
    description: "A routed repository-skill graph for ML, data, evaluation, retrieval, vision, generation, MLOps and scientific computing. The router loads only the relevant fragment.",
    descriptionZh: "面向机器学习、数据、评测、检索、视觉、生成、MLOps 与科学计算的仓库技能图；路由器只加载与任务相关的片段。",
    sourceUrl: "https://github.com/VectorSpaceLab/AREX-Skill",
    install: "npm install -g @auto-ml-skills/disco && disco repo-skills install",
    trust: "Catalog checked",
    license: "Apache-2.0 collection",
  },
  {
    id: "ai-research-source",
    name: "AI Research Loop",
    nameZh: "AI 科研闭环",
    scope: "Hypothesis → experiment → paper",
    scopeZh: "假设 → 实验 → 论文",
    description: "Installed project-locally after inspecting the full manifest and both deterministic Python helpers. It writes only experiment scaffolds and an explicit lessons log.",
    descriptionZh: "已在项目内安装，并完整检查清单与两个无第三方依赖的 Python 脚本；写入范围仅为实验脚手架与显式经验日志。",
    sourceUrl: "https://github.com/Toadoum/ai-research-skill",
    install: "Installed at .agents/skills/ai-research",
    trust: "Installed + inspected",
    license: "MIT",
  },
  {
    id: "ai4s-skills",
    name: "AI4S Skills",
    nameZh: "AI4S 科研工作流",
    scope: "7 connected skills · exploration to integrity audit",
    scopeZh: "7 个衔接技能 · 从方向探索到完整性审计",
    description: "A source-checked suite for topic exploration, literature surveys, experiment packages, paper writing, mind maps and integrity audits. Listed for selective review; not installed wholesale.",
    descriptionZh: "覆盖方向探索、文献综述、实验包、论文写作、思维导图与完整性审计的已核验套件。当前供按需审查选择，不整包安装。",
    sourceUrl: "https://github.com/ai4s-research/ai4s-skills",
    install: "Select one folder under skills/ and inspect it before project-local installation",
    trust: "Source checked · selective install",
    license: "MIT",
  },
  {
    id: "k-dense-science",
    name: "Scientific Agent Skills",
    nameZh: "Scientific Agent Skills 科学技能库",
    scope: "156 skills · databases, packages and scientific workflows",
    scopeZh: "156 个技能 · 科学数据库、软件包与研究工作流",
    description: "Broad cross-domain coverage with unusually explicit boundaries for evidence, ethics, clinical use and local deterministic helpers. Individual skills still require inspection before installation.",
    descriptionZh: "跨领域覆盖广，并明确区分证据、伦理、临床边界与本地确定性脚本。每个技能安装前仍需单独审查。",
    sourceUrl: "https://github.com/K-Dense-AI/scientific-agent-skills",
    install: "Browse skills/ → inspect one SKILL.md + references → install only that folder",
    trust: "Catalog checked · per-skill review",
    license: "Per-skill license",
  },
  {
    id: "awesome-scientific-skills",
    name: "Awesome Scientific Skills",
    nameZh: "Awesome Scientific Skills 导航",
    scope: "Curated directory · science, medicine, finance and data",
    scopeZh: "精选导航 · 科学、医学、金融与数据",
    description: "A discovery index pointing to skills from many upstream projects. It is useful for breadth, but each linked skill keeps its own license and trust boundary.",
    descriptionZh: "指向多个上游项目的科研 Skills 导航，适合扩大覆盖面；每个链接技能保留各自许可证与信任边界。",
    sourceUrl: "https://github.com/InternScience/Awesome-Scientific-Skills",
    install: "Directory only: follow the upstream source and verify the selected skill",
    trust: "Discovery directory",
    license: "Mixed upstream licenses",
  },
];
