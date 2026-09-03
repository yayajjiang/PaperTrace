export type HeadlineTag = "Research" | "Release" | "Industry";

export interface Headline {
  id: string;
  date: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  source: string;
  sourceUrl: string;
  tag: HeadlineTag;
  domain?: string;
  scores?: { impact: number; buzz: number; utility: number };
  featured?: boolean;
}

// Editorially verified fallbacks keep the homepage useful if a feed is down.
// The scheduled news sync replaces these with newer official-source items.
export const fallbackHeadlines: Headline[] = [
  {
    id: "openai-youth-ai-safety-2026",
    date: "2026-08-31",
    title: "OpenAI backs California's youth AI-safety bill",
    titleZh: "OpenAI 支持加州青少年 AI 安全法案",
    summary:
      "A policy signal worth watching: frontier labs are moving from voluntary safeguards toward concrete rules for age-appropriate AI experiences.",
    summaryZh:
      "一个值得关注的政策信号：前沿实验室正从自愿安全措施，走向更具体的未成年人 AI 产品规范。",
    source: "OpenAI",
    sourceUrl: "https://openai.com/news/",
    tag: "Industry",
    domain: "AI & CS",
    scores: { impact: 79, buzz: 81, utility: 63 },
    featured: true,
  },
  {
    id: "claude-opus-4-1-retired",
    date: "2026-08-05",
    title: "Claude Opus 4.1 retired from the Anthropic API",
    titleZh: "Claude Opus 4.1 已从 Anthropic API 下线",
    summary:
      "Anthropic recommends moving workloads to Claude Opus 4.8. It is a timely reminder to pin model migrations to evals, not model names alone.",
    summaryZh:
      "Anthropic 建议迁移到 Claude Opus 4.8。这也提醒团队：模型迁移应绑定评测，而不能只替换模型名。",
    source: "Anthropic Docs",
    sourceUrl: "https://docs.anthropic.com/en/docs/about-claude/model-deprecations",
    tag: "Release",
    domain: "AI & CS",
    scores: { impact: 86, buzz: 88, utility: 91 },
  },
  {
    id: "chatgpt-model-retirements-2026",
    date: "2026-03-11",
    title: "GPT-5.1 models retired from ChatGPT",
    titleZh: "GPT-5.1 系列已从 ChatGPT 下线",
    summary:
      "GPT-5.1 Instant, Thinking and Pro left ChatGPT after GPT-4o, GPT-4.1 and o4-mini. API availability follows a separate lifecycle.",
    summaryZh:
      "GPT-5.1 Instant、Thinking 与 Pro 继 GPT-4o、GPT-4.1 和 o4-mini 后从 ChatGPT 下线；API 有独立生命周期。",
    source: "OpenAI Help Center",
    sourceUrl: "https://help.openai.com/en/articles/20001051-retiring-gpt-4o-and-otherchatgpt-models",
    tag: "Release",
    domain: "AI & CS",
    scores: { impact: 91, buzz: 95, utility: 87 },
  },
];
