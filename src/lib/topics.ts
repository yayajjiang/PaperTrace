export interface ResearchTopic {
  id: string;
  title: string;
  titleZh: string;
  momentum: "Surging" | "Rising" | "Steady";
  domain: string;
  why: string;
  whyZh: string;
  attention: string;
  attentionZh: string;
  links: { label: string; href: string }[];
}

export const researchTopics: ResearchTopic[] = [
  {
    id: "world-models",
    title: "World Models & Spatial Intelligence",
    titleZh: "世界模型与空间智能",
    momentum: "Surging",
    domain: "AI & CS",
    why: "Atlas, robotics simulation and a clearer renderer–simulator–planner taxonomy are turning “world model” from a loose label into an actionable stack.",
    whyZh: "Atlas、机器人仿真，以及更清晰的渲染器—模拟器—规划器分类，正让“世界模型”从宽泛概念变成可执行技术栈。",
    attention: "20 min · Read Atlas architecture and separate reconstruction, generation and simulation claims.",
    attentionZh: "20 分钟 · 阅读 Atlas 架构，并区分重建、生成与模拟三类能力主张。",
    links: [
      { label: "Atlas", href: "https://www.worldlabs.ai/blog/atlas" },
      { label: "Taxonomy", href: "https://www.worldlabs.ai/blog/taxonomy-of-world-models" },
      { label: "Real-to-sim", href: "https://www.worldlabs.ai/blog/real-to-sim-to-real" },
    ],
  },
  {
    id: "embodied-ai",
    title: "Embodied AI & Robot Learning",
    titleZh: "具身智能与机器人学习",
    momentum: "Surging",
    domain: "AI & Robotics",
    why: "The frontier is moving from impressive robot demos toward scalable training loops: simulation, real-to-sim-to-real data, world action models and reliability evaluation.",
    whyZh: "前沿正在从吸睛的机器人 Demo 转向可规模化训练闭环：仿真、real-to-sim-to-real 数据、世界动作模型与可靠性评测。",
    attention: "15 min · Compare the data loop, action representation and evaluation environment of one system.",
    attentionZh: "15 分钟 · 对比一个系统的数据闭环、动作表示与评测环境。",
    links: [
      { label: "World Action Models", href: "https://arxiv.org/abs/2605.12090" },
      { label: "World Labs Robotics", href: "https://www.worldlabs.ai/blog/real-to-sim-to-real" },
    ],
  },
  {
    id: "research-agents",
    title: "Research Agents, Skills & MCP",
    titleZh: "科研 Agent、Skills 与 MCP",
    momentum: "Rising",
    domain: "Multidisciplinary",
    why: "Attention is shifting from general agents to the missing execution layer: verified skills, domain tools, reproducible environments and evidence-aware workflows.",
    whyZh: "关注点正从通用 Agent 转向缺失的执行层：经验证的 Skills、垂直工具、可复现环境与证据感知工作流。",
    attention: "10 min · Inspect one skill's source, verification step and failure boundary before installing it.",
    attentionZh: "10 分钟 · 安装前检查一个 Skill 的来源、验证步骤与失败边界。",
    links: [
      { label: "AREX-Skill", href: "https://github.com/VectorSpaceLab/AREX-Skill" },
      { label: "DeepXiv", href: "https://github.com/DeepXiv/deepxiv_sdk" },
    ],
  },
  {
    id: "model-lifecycle",
    title: "Model Lifecycles & Reproducibility",
    titleZh: "模型生命周期与可复现性",
    momentum: "Rising",
    domain: "AI & CS",
    why: "Fast retirements make model availability a research-method issue. Reproducibility now requires snapshots, migration evals and explicit product-versus-API status.",
    whyZh: "快速下线让模型可用性成为研究方法问题：可复现性需要版本快照、迁移评测，以及明确区分产品与 API 状态。",
    attention: "5 min · Audit pinned model IDs and add a replacement eval before the next retirement date.",
    attentionZh: "5 分钟 · 审计固定的模型 ID，并在下线日前加入替代模型评测。",
    links: [
      { label: "Claude lifecycle", href: "https://docs.anthropic.com/en/docs/about-claude/model-deprecations" },
      { label: "ChatGPT retirements", href: "https://help.openai.com/en/articles/20001051-retiring-gpt-4o-and-otherchatgpt-models" },
    ],
  },
];
