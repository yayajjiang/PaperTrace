"use client";

import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import { DLLMTimeline } from "@/components/DLLMTimeline";
import { LiveHeadlines } from "@/components/LiveHeadlines";
import { CommunityBoard } from "@/components/CommunityBoard";
import { researchTools } from "@/lib/tools";
import { frontierItems } from "@/lib/frontier";
import { researchEvents } from "@/lib/events";

interface PaperMeta {
  slug: string;
  title: string;
  titleZh: string;
  authors: string;
  year: number;
  venue: string;
  tags: string[];
  description: string;
  descriptionZh: string;
}

interface Section {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  papers: PaperMeta[];
}

const sections: Section[] = [
  {
    id: "dllm",
    title: "Diffusion Language Models",
    titleZh: "扩散语言模型 (DLLM)",
    description:
      "Applying diffusion processes to discrete text generation — an emerging alternative to autoregressive LLMs.",
    descriptionZh:
      "将扩散过程应用于离散文本生成 — 一种新兴的自回归 LLM 替代方案。",
    papers: [
      {
        slug: "llada",
        title: "LLaDA: Large Language Diffusion with mAsking",
        titleZh: "LLaDA: 基于掩码的大语言扩散模型",
        authors: "Nie et al.",
        year: 2025,
        venue: "arXiv",
        tags: ["Diffusion LM", "Masked Diffusion", "Pre-training"],
        description:
          "A masked diffusion framework for LLMs. Uses progressive masking as the forward process and learns to predict masked tokens in reverse, matching AR models at 8B scale.",
        descriptionZh:
          "面向大语言模型的掩码扩散框架。前向过程逐步掩码 token，逆向过程学习预测被掩码的 token。在 8B 规模上可与 AR 模型媲美。",
      },
      {
        slug: "mdlm",
        title: "Simple and Effective Masked Diffusion Language Models (MDLM)",
        titleZh: "MDLM: 简洁有效的掩码扩散语言模型",
        authors: "Sahoo et al.",
        year: 2024,
        venue: "NeurIPS",
        tags: ["Diffusion LM", "Masked Diffusion", "ELBO"],
        description:
          "Simplifies masked discrete diffusion with a principled continuous-time ELBO. Clean, minimal design with strong perplexity results.",
        descriptionZh:
          "基于连续时间 ELBO 推导，简化掩码离散扩散的训练目标。设计简洁，困惑度表现优异。",
      },
      {
        slug: "fast-dllm",
        title: "Fast Discrete Diffusion Language Models (Fast DLLM)",
        titleZh: "Fast DLLM: 快速离散扩散语言模型",
        authors: "Shi et al.",
        year: 2025,
        venue: "arXiv",
        tags: ["Diffusion LM", "Fast Sampling", "Adaptive"],
        description:
          "Accelerates discrete diffusion LMs with adaptive noise schedules and importance sampling, reducing denoising steps by 3-10x.",
        descriptionZh:
          "通过自适应噪声调度和重要性采样加速离散扩散语言模型，将去噪步数减少 3-10 倍。",
      },
      {
        slug: "block-diffusion",
        title:
          "Block Diffusion: Interpolating Between Autoregressive and Diffusion Language Models",
        titleZh: "Block Diffusion: 在自回归与扩散语言模型之间插值",
        authors: "Arriola et al.",
        year: 2025,
        venue: "arXiv",
        tags: ["Diffusion LM", "Block Generation", "Hybrid"],
        description:
          "Generates text in blocks — blocks go left-to-right (AR), tokens within each block are denoised in parallel (diffusion). Best of both worlds.",
        descriptionZh:
          "按块生成文本 — 块间从左到右 (AR)，块内 token 并行去噪 (diffusion)。兼得两种范式的优势。",
      },
    ],
  },
  {
    id: "rlhf-alignment",
    title: "RLHF & Alignment",
    titleZh: "RLHF 与对齐",
    description:
      "Methods for aligning language models with human preferences — from PPO to DPO to GRPO.",
    descriptionZh:
      "将语言模型与人类偏好对齐的方法 — 从 PPO 到 DPO 到 GRPO。",
    papers: [
      {
        slug: "ppo",
        title: "PPO: Proximal Policy Optimization",
        titleZh: "PPO: 近端策略优化",
        authors: "Schulman et al.",
        year: 2017,
        venue: "arXiv",
        tags: ["RL", "Policy Gradient", "RLHF"],
        description:
          "The RL algorithm behind ChatGPT's RLHF. Clips the policy gradient to ensure stable updates.",
        descriptionZh:
          "ChatGPT RLHF 背后的 RL 算法。裁剪策略梯度以确保稳定更新。",
      },
      {
        slug: "dpo",
        title: "DPO: Direct Preference Optimization",
        titleZh: "DPO: 直接偏好优化",
        authors: "Rafailov et al.",
        year: 2023,
        venue: "NeurIPS",
        tags: ["Alignment", "Preference Learning", "RLHF"],
        description:
          "Eliminates the reward model and PPO — converts RLHF into a simple classification loss on preference pairs.",
        descriptionZh:
          "消除奖励模型和 PPO — 将 RLHF 转化为偏好对上的简单分类损失。",
      },
      {
        slug: "grpo",
        title: "GRPO: Group Relative Policy Optimization",
        titleZh: "GRPO: 组相对策略优化",
        authors: "Shao et al. (DeepSeek)",
        year: 2024,
        venue: "arXiv",
        tags: ["RL", "Math Reasoning", "RLHF"],
        description:
          "DeepSeek's simplified PPO — replaces the critic with group-relative advantages. Powers DeepSeek-R1.",
        descriptionZh:
          "DeepSeek 的简化版 PPO — 用组相对优势替代 critic。驱动 DeepSeek-R1。",
      },
    ],
  },
  {
    id: "transformer-foundations",
    title: "Transformer Foundations",
    titleZh: "Transformer 基础",
    description:
      "The core architectures and mechanisms that power modern deep learning. See also: BERT and GPT-2 deep-dives in the LLMs section below.",
    descriptionZh: "驱动现代深度学习的核心架构与机制。另见：下方大语言模型章节中的 BERT 和 GPT-2 精读。",
    papers: [
      {
        slug: "attention-is-all-you-need",
        title: "Attention Is All You Need",
        titleZh: "Attention Is All You Need (注意力就是你所需要的一切)",
        authors: "Vaswani et al.",
        year: 2017,
        venue: "NeurIPS",
        tags: ["Transformer", "Attention", "Seq2Seq"],
        description:
          "The paper that introduced the Transformer — replacing recurrence with self-attention.",
        descriptionZh:
          "提出 Transformer 架构的开创性论文 — 用自注意力完全替代循环结构。",
      },
    ],
  },
  {
    id: "llms",
    title: "Large Language Models",
    titleZh: "大语言模型基础",
    description: "Foundation models for text — bidirectional encoders, autoregressive decoders, and the scaling laws that drive modern AI.",
    descriptionZh: "文本基础模型 — 双向编码器、自回归解码器，以及驱动现代 AI 的规模化定律。",
    papers: [
      {
        slug: "bert",
        title: "BERT: Pre-training of Deep Bidirectional Transformers",
        titleZh: "BERT: 深度双向 Transformer 预训练",
        authors: "Devlin et al. (Google)",
        year: 2018,
        venue: "NAACL",
        tags: ["BERT", "Pre-training", "NLP"],
        description: "Introduces masked language modeling for bidirectional pre-training. Fine-tuning on BERT set new SOTA across 11 NLP benchmarks in 2018.",
        descriptionZh: "引入掩码语言建模实现双向预训练。在 11 个 NLP 基准测试上微调 BERT，于 2018 年全面刷新最优成绩。",
      },
      {
        slug: "gpt-2",
        title: "Language Models are Unsupervised Multitask Learners (GPT-2)",
        titleZh: "GPT-2: 语言模型是无监督多任务学习者",
        authors: "Radford et al. (OpenAI)",
        year: 2019,
        venue: "OpenAI Blog",
        tags: ["GPT", "Language Model", "Zero-shot"],
        description: "Shows that a large autoregressive LM can perform NLP tasks zero-shot — no fine-tuning needed. At 1.5B params, too 'dangerous' to release initially.",
        descriptionZh: "表明大型自回归语言模型可以零样本完成 NLP 任务 — 无需微调。1.5B 参数，OpenAI 最初因「太危险」而拒绝完全发布。",
      },
    ],
  },
  {
    id: "vlms",
    title: "Vision-Language Models",
    titleZh: "视觉语言模型",
    description: "Models that bridge vision and language — contrastive learning for image-text alignment and instruction-following VLMs.",
    descriptionZh: "连接视觉与语言的模型 — 用于图文对齐的对比学习，以及支持指令跟随的 VLM。",
    papers: [
      {
        slug: "clip",
        title: "CLIP: Learning Transferable Visual Models From Natural Language Supervision",
        titleZh: "CLIP: 从自然语言监督中学习可迁移的视觉模型",
        authors: "Radford et al. (OpenAI)",
        year: 2021,
        venue: "ICML",
        tags: ["CLIP", "Contrastive Learning", "Zero-shot"],
        description: "Trains image and text encoders jointly on 400M web image-text pairs using contrastive loss. Enables zero-shot image classification by text similarity.",
        descriptionZh: "使用对比损失在 4 亿网络图文对上联合训练图像和文本编码器。通过文本相似度实现零样本图像分类。",
      },
      {
        slug: "llava",
        title: "LLaVA: Visual Instruction Tuning",
        titleZh: "LLaVA: 视觉指令微调",
        authors: "Liu et al. (Wisconsin/Columbia)",
        year: 2023,
        venue: "NeurIPS",
        tags: ["VLM", "Instruction Tuning", "Multimodal"],
        description: "Connects CLIP vision encoder to LLaMA with a single linear projection. Fine-tuned on 158K GPT-4-generated instruction pairs, achieving 85.1% on ScienceQA.",
        descriptionZh: "通过单层线性投影将 CLIP 视觉编码器连接到 LLaMA。在 158K 条 GPT-4 生成的指令对上微调，ScienceQA 达到 85.1%。",
      },
    ],
  },
  {
    id: "efficiency",
    title: "Efficient Training & Inference",
    titleZh: "高效训练与推理",
    description: "Making large models practical — parameter-efficient fine-tuning and hardware-aware attention computation.",
    descriptionZh: "让大模型变得实用 — 参数高效微调与硬件感知注意力计算。",
    papers: [
      {
        slug: "lora",
        title: "LoRA: Low-Rank Adaptation of Large Language Models",
        titleZh: "LoRA: 大语言模型的低秩适配",
        authors: "Hu et al. (Microsoft)",
        year: 2021,
        venue: "ICLR",
        tags: ["LoRA", "PEFT", "Fine-tuning"],
        description: "Freezes pre-trained weights and learns low-rank decomposition ΔW = BA per layer. Reduces trainable parameters by 10,000× with no inference latency overhead.",
        descriptionZh: "冻结预训练权重，每层学习低秩分解 ΔW = BA。将可训练参数减少 10,000 倍，且推理时无额外延迟。",
      },
      {
        slug: "flashattention",
        title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness",
        titleZh: "FlashAttention: 快速、内存高效的 IO 感知精确注意力",
        authors: "Dao et al. (Stanford)",
        year: 2022,
        venue: "NeurIPS",
        tags: ["FlashAttention", "Efficiency", "GPU"],
        description: "Tiles attention computation to fit in GPU SRAM, avoiding O(N²) HBM writes. Exact attention (not approximate) with 3× speedup and O(N) memory.",
        descriptionZh: "将注意力计算分块以适配 GPU SRAM，避免 O(N²) HBM 写入。精确注意力（非近似），3 倍加速，O(N) 内存。",
      },
    ],
  },
];

export default function Home() {
  const { t, lang } = useLang();
  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["dllm"]));
  const [timelineOpen, setTimelineOpen] = useState(false);
  const toggleSection = (id: string) =>
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Hero */}
      <section className="home-hero py-16 md:py-24">
        <div className="max-w-4xl relative z-10">
          <div className="eyebrow mb-5 animate-fadeInUp">{t("The research commons", "开放科研公共空间")} <span>·</span> EN / 中文</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] animate-fadeInUp dark:text-slate-50">
            {t("Trace the signal.", "追踪信号，")}
            <br />
            <span className="hero-accent">{t("Build what matters.", "共建真正有用的东西。")}</span>
          </h1>
          <p className="text-lg md:text-xl text-paper-800/60 dark:text-slate-300 max-w-3xl leading-relaxed mt-6 animate-fadeInUp delay-1">
            {t(
              "Research news with context, papers explained without hand-waving, tools you can actually run, and a community that helps ideas travel across fields.",
              "有上下文的科研热点、不含糊的论文精读、真正能跑的工具，以及让好想法跨领域流动的共建社区。"
            )}
          </p>
          <div className="flex flex-wrap gap-3 mt-8 animate-fadeInUp delay-2">
            <a href={`${basePath}/daily`} className="button-primary button-large">{t("Explore today's signals", "查看今日动态")} →</a>
            <a href={`${basePath}/community`} className="button-secondary button-large">{t("Join the community", "加入社区")}</a>
          </div>
        </div>
        <div className="hero-grid" aria-hidden="true" />
      </section>

      {/* Quick nav */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pb-12">
        {[
          { href: `${basePath}/domains`, icon: "01", label: t("Research domains", "研究领域"), desc: t("CS today, every field next", "从 CS 走向更多领域") },
          { href: `${basePath}/tools`, icon: "02", label: t("Tools & MCP", "工具 & MCP"), desc: t("Agents, skills and demos", "Agent、Skills 与 Demo") },
          { href: `${basePath}/events`, icon: "03", label: t("Events", "活动雷达"), desc: t("Deadlines before recaps", "在截止前收到提醒") },
          { href: `${basePath}/community`, icon: "04", label: t("Community", "共建社区"), desc: t("Research, roles and people", "科研、实习与人脉互助") },
        ].map((item) => (
          <a key={item.href} href={item.href}
            className="quick-route group"
          >
            <span className="route-index">{item.icon}</span>
            <div>
              <div className="font-bold text-sm dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.label}</div>
              <div className="text-xs text-paper-800/50 dark:text-slate-500">{item.desc}</div>
            </div>
            <span className="ml-auto text-paper-800/20 group-hover:text-blue-500">→</span>
          </a>
        ))}
      </div>

      <LiveHeadlines compact />

      <section className="pt-16">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow mb-2">{t("Deadline desk", "近期活动与截止")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Still in time to participate", "现在知道，还来得及参加")}</h2>
          </div>
          <a href={`${basePath}/events`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t("All events", "全部活动")} →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {researchEvents
            .filter((event) => event.endsAt >= new Date().toISOString().slice(0, 10))
            .sort((a, b) => (a.deadlineAt || a.startsAt).localeCompare(b.deadlineAt || b.startsAt))
            .slice(0, 3)
            .map((event) => (
              <a key={event.id} href={event.href} target="_blank" rel="noopener noreferrer" className="home-event-card group">
                <div className="flex items-center justify-between gap-3">
                  <span className={`topic-chip ${event.type === "Call" ? "bg-rose-100 text-rose-700" : event.type === "Hackathon" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>{event.type}</span>
                  <time className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{event.deadlineAt ? `${t("DEADLINE", "截止")} ${event.deadlineAt}` : event.startsAt}</time>
                </div>
                <h3 className="font-bold mt-4 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{lang === "en" ? event.title : event.titleZh}</h3>
                <p className="mt-2 text-xs text-paper-800/50 dark:text-slate-400">{lang === "en" ? event.location : event.locationZh}</p>
              </a>
            ))}
        </div>
      </section>

      <section className="py-16 border-b border-paper-200 dark:border-slate-800">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow mb-2">{t("Frontier watch", "前沿观察")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("New builders shaping the next cycle", "正在塑造下一轮方向的新力量")}</h2>
          </div>
          <a href={`${basePath}/frontier`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t("Open watchlist", "查看观察列表")} →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {frontierItems.slice(0, 3).map((item) => (
            <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" className="home-tool-card group">
              <div className="flex items-center justify-between gap-2">
                <span className="topic-chip bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">{item.type}</span>
                <time className="text-[10px] font-mono text-paper-800/35 dark:text-slate-500">{item.announcedAt}</time>
              </div>
              <h3 className="text-lg font-bold mt-5 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{lang === "en" ? item.name : item.nameZh}</h3>
              <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-2">{lang === "en" ? item.whyWatch : item.whyWatchZh}</p>
              <div className="flex items-center justify-between gap-3 mt-5 text-[10px] font-bold">
                <span className="text-paper-800/35 dark:text-slate-500">{item.domain}</span>
                <span className="text-violet-700 dark:text-violet-300">◷ {item.attention}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow mb-2">{t("Community-tested", "社区精选")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Research tools worth trying", "值得立即试用的科研工具")}</h2>
          </div>
          <a href={`${basePath}/tools`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t("Open directory", "查看目录")} →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {researchTools.filter((tool) => tool.featured).slice(0, 3).map((tool) => (
            <a key={tool.id} href={tool.href} target="_blank" rel="noopener noreferrer" className="home-tool-card group">
              <div className="flex items-center justify-between gap-3">
                <span className="topic-chip bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{tool.category}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-paper-800/35 dark:text-slate-500">{t("Curated", "编辑精选")}</span>
              </div>
              <h3 className="text-lg font-bold mt-5 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">{tool.name}</h3>
              <p className="text-sm leading-relaxed text-paper-800/55 dark:text-slate-400 mt-2">{lang === "en" ? tool.tagline : tool.taglineZh}</p>
              <div className="grid grid-cols-3 gap-2 mt-6">
                {[[t("Impact", "影响"), tool.scores.impact], [t("Buzz", "热度"), tool.scores.buzz], [t("Utility", "实用"), tool.scores.utility]].map(([label, score]) => (
                  <div key={String(label)} className="text-center"><b className="block text-sm dark:text-slate-200">{score}</b><span className="text-[10px] text-paper-800/35 dark:text-slate-500">{label}</span></div>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 py-12 border-y border-paper-200 dark:border-slate-800">
        <div>
          <div className="eyebrow mb-3">{t("People in the loop", "连接真实的人")}</div>
          <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Ask, share, build together.", "提问、分享、一起建设。")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper-800/60 dark:text-slate-400">{t("Research help, internships, collaborators and tool launches belong in one place — with a path from quick chat to durable public knowledge.", "科研互助、实习岗位、合作伙伴和工具发布汇集在一起，让即时交流最终沉淀为长期可用的公共知识。")}</p>
          <a href={`${basePath}/community`} className="button-secondary mt-6">{t("Enter community", "进入社区")} →</a>
        </div>
        <CommunityBoard limit={3} />
      </section>

      {/* Sections — collapsible */}
      <div className="py-16 space-y-4">
        <div className="section-heading-row mb-8">
          <div>
            <div className="eyebrow mb-2">AI & CS · {t("Original collection", "原始内容库")}</div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-white">{t("Interactive paper deep-dives", "交互式论文精读")}</h2>
          </div>
          <a href={`${basePath}/domains`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t("All domains", "全部领域")} →</a>
        </div>
        {sections.map((section) => {
          const isOpen = expandedSections.has(section.id);
          return (
          <section key={section.id} className="border border-paper-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800/60 hover:bg-paper-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div>
                <h2 className="text-lg font-bold tracking-tight dark:text-slate-100">
                  {lang === "en" ? section.title : section.titleZh}
                </h2>
                <p className="text-sm text-paper-800/50 dark:text-slate-400 mt-0.5">
                  {lang === "en" ? section.description : section.descriptionZh}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                <span className="text-xs text-paper-800/40 dark:text-slate-500 font-medium">
                  {section.papers.length} {t("papers", "篇")}
                </span>
                <span className={`text-paper-800/40 dark:text-slate-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▼</span>
              </div>
            </button>
            {isOpen && (
            <div className="px-6 pb-6 pt-2 bg-paper-50/50 dark:bg-slate-900/40 space-y-4">
              {/* DLLM Timeline — collapsible, only shown in the dllm section */}
              {section.id === "dllm" && (
                <div className="border border-paper-200 dark:border-slate-700 rounded-lg overflow-hidden mb-2">
                  <button
                    onClick={() => setTimelineOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 hover:bg-paper-50 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-semibold dark:text-slate-100">
                        {t("Diffusion LM Timeline", "扩散语言模型时间线")}
                      </span>
                      <span className="text-xs text-paper-800/40 dark:text-slate-500 ml-2">
                        {t("D3PM (2021) → present", "D3PM (2021) → 至今")}
                      </span>
                    </div>
                    <span className={`text-paper-800/40 dark:text-slate-600 transition-transform duration-200 text-xs ${timelineOpen ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  {timelineOpen && (
                    <div className="border-t border-paper-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
                      <DLLMTimeline />
                    </div>
                  )}
                </div>
              )}
              {section.papers.map((paper, idx) => (
                <Link
                  key={paper.slug}
                  href={`/papers/${paper.slug}`}
                  className="block group"
                >
                  <article className={`bg-white dark:bg-slate-800 border border-paper-200 dark:border-slate-700 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-blue-900/10 hover:-translate-y-0.5 transition-all duration-200 animate-fadeInUp ${(["delay-1","delay-2","delay-3","delay-4","delay-5"] as const)[Math.min(idx, 4)]}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {lang === "en" ? paper.title : paper.titleZh}
                        </h3>
                        <p className="text-sm text-paper-800/50 dark:text-slate-500 mt-1">
                          {paper.authors} &middot; {paper.venue} {paper.year}
                        </p>
                        <p className="text-sm text-paper-800/70 dark:text-slate-300 mt-2 leading-relaxed">
                          {lang === "en"
                            ? paper.description
                            : paper.descriptionZh}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {paper.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-paper-800/30 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-xl mt-1">
                        &rarr;
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            )}
          </section>
          );
        })}
      </div>

    </div>
  );
}
