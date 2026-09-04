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
  signals?: { huggingFaceUpvotes?: number; socialNote?: string };
  provenance?: {
    layer: "Primary" | "Structured discovery" | "Discussion" | "Community";
    scoreNotes: { impact: string; buzz: string; utility: string };
  };
  featured?: boolean;
}

// Editorially verified fallbacks keep the homepage useful if a feed is down.
// The scheduled news sync replaces these with newer official-source items.
export const fallbackHeadlines: Headline[] = [
  {
    id: "openai-gpt-6-astra-2026",
    date: "2026-09-03",
    title: "OpenAI releases GPT-6 Astra",
    titleZh: "OpenAI 发布 GPT-6 Astra",
    summary:
      "Astra is rolling out across ChatGPT, Codex and API surfaces. OpenAI reports large gains in computer use, coding, science and cybersecurity; benchmark figures remain vendor-reported until independently reproduced.",
    summaryZh:
      "Astra 正逐步开放到 ChatGPT、Codex 与 API。OpenAI 报告其在计算机操作、代码、科学与网络安全上大幅提升；相关基准在独立复现前仍属于厂商自报。",
    source: "OpenAI",
    sourceUrl: "https://openai.com/index/gpt-6-astra/",
    tag: "Release",
    domain: "AI & CS",
    scores: { impact: 98, buzz: 99, utility: 88 },
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
