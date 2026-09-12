import { pinyin } from "pinyin";

const OVERRIDES = {
  // chapter roots
  "1-导论与基础": "1-intro",
  "2-核心原理与架构": "2-arch",
  "10-综述与前沿论文": "10-surveys",
  "14-主流开源模型全景解析与技术报告精读": "14-models",
  // common sections
  "1.1-学习路线与知识图谱": "1.1-roadmap",
  "1.2-科普与行业杂谈": "1.2-misc",
  "1.3-发展历程与趋势展望": "1.3-history",
  "2.1-深度学习基础组件": "2.1-basics",
  "2.2-基础注意力机制": "2.2-attention",
  "2.3-高效与稀疏注意力": "2.3-efficient-attention",
  "2.4-前沿架构与变体": "2.4-frontier-arch",
  "2.5-长上下文与外推技术": "2.5-long-context",
  "大语言模型架构全景图": "llm-arch-map",
  "2023年AI-Agent调研": "agent-survey-2023",
  "2024年终总结AI与Agents": "ai-agents-2024",
  "工具学习全面综述": "tool-learning",
  "隐式思维链Latent-CoT综述": "latent-cot",
  "隐式思维链推理综述": "implicit-cot",
  "隐状态空间动力学与推理机制前沿观察": "ssm-dynamics",
  "高效注意力方法综述：从静态稀疏到线性注意力": "efficient-attention-survey",
  "人工智能学习路线": "ai-learning-route",
  "The Document is All You Need": "the-document-is-all-you-need",
  "14.1-DeepSeek": "14.1-deepseek",
  "14.2-Qwen": "14.2-qwen",
  "14.3-LLaMA": "14.3-llama",
  "14.4-OLMo": "14.4-olmo",
  "14.5-Kimi": "14.5-kimi",
  "14.6-GLM": "14.6-glm",
  "14.7-StepFun": "14.7-stepfun",
  "14.8-MiniMax": "14.8-minimax",
  "14.9-MiMo": "14.9-mimo",
  "14.10-Gemma": "14.10-gemma",
  "14.11-Gemini": "14.11-gemini",
  "14.12-OpenAI": "14.12-openai",
  "14.13-Claude": "14.13-claude",
  "14.14-Mistral": "14.14-mistral",
  "14.15-xAI": "14.15-xai",
  "14.16-Ling": "14.16-ling",
  "14.17-Doubao": "14.17-doubao",
  "14.18-MiniCPM": "14.18-minicpm",
  "14.19-Ernie": "14.19-ernie",
  "14.20-Hunyuan": "14.20-hunyuan",
  "14.21-Erine": "14.21-erine",
};

function isChinese(char) {
  return /\p{Script=Han}/u.test(char);
}

function isLetterOrDigit(char) {
  return /[A-Za-z0-9.]/.test(char);
}

function splitEnglish(buf) {
  if (!buf) return "";
  // pure uppercase acronyms / short tokens stay as-is
  if (buf.length <= 4 || /^[A-Z]+$/.test(buf)) return buf.toLowerCase();
  return buf
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export function slugifySegment(segment) {
  if (OVERRIDES[segment]) return OVERRIDES[segment];

  const tokens = [];
  let buf = "";
  let chineseBuf = "";
  function flushBuf() {
    if (buf) {
      const part = splitEnglish(buf);
      if (part) tokens.push(part);
      buf = "";
    }
    if (chineseBuf) {
      tokens.push(chineseBuf);
      chineseBuf = "";
    }
  }
  for (const ch of segment) {
    if (isChinese(ch)) {
      if (buf) flushBuf();
      const initials = pinyin(ch, { style: pinyin.STYLE_FIRST_LETTER });
      if (initials.length && initials[0].length) {
        chineseBuf += initials[0][0];
      }
    } else if (isLetterOrDigit(ch)) {
      if (chineseBuf) flushBuf();
      buf += ch;
    } else {
      flushBuf();
    }
  }
  flushBuf();

  let slug = tokens.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = "untitled";
  return slug;
}

export function slugifyRoute(segments) {
  return segments.map(slugifySegment).join("/");
}
