"use client";

import { Math } from "@/components/Math";
import { Collapsible } from "@/components/Collapsible";
import { useLang } from "@/lib/i18n";

// ─── Small helpers ──────────────────────────────────────────────────────────

function SectionHeader({
  number,
  en,
  zh,
  color,
  t,
}: {
  number: string;
  en: string;
  zh: string;
  color: "blue" | "violet" | "emerald" | "rose";
  t: (en: string, zh: string) => string;
}) {
  const bg: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-700/40 dark:text-blue-100",
    violet: "bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-900/20 dark:border-violet-700/40 dark:text-violet-100",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-700/40 dark:text-emerald-100",
    rose: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-900/20 dark:border-rose-700/40 dark:text-rose-100",
  };
  const badge: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  return (
    <div
      className={`flex items-center gap-3 mt-14 mb-6 px-5 py-4 rounded-xl border ${bg[color]}`}
    >
      <span
        className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${badge[color]}`}
      >
        {number}
      </span>
      <h2 className="text-xl font-bold m-0 border-0 p-0">{t(en, zh)}</h2>
    </div>
  );
}

function KeyInsight({
  en,
  zh,
  t,
}: {
  en: string;
  zh: string;
  t: (en: string, zh: string) => string;
}) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-5 dark:bg-amber-900/15 dark:border-amber-700/40">
      <p className="text-sm mb-0">
        <strong className="text-amber-800 dark:text-amber-300">{t("Key insight", "关键洞察")}</strong>
        {": "}
        <span className="text-amber-900 dark:text-amber-200">{t(en, zh)}</span>
      </p>
    </div>
  );
}

function QuestionLabel({
  n,
  en,
  zh,
  t,
}: {
  n: number;
  en: string;
  zh: string;
  t: (en: string, zh: string) => string;
}) {
  return (
    <span className="flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-paper-900 dark:bg-slate-600 text-white text-xs font-bold">
        {n}
      </span>
      <span>{t(en, zh)}</span>
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const { t } = useLang();

  const leetcodeResources = [
    {
      name: "NeetCode",
      href: "https://neetcode.io",
      icon: "🧩",
      desc: "Curated 150-problem roadmap with video solutions. The best structured path for algo interview prep.",
      descZh: "精选 150 题路线图配视频讲解。算法面试备考最佳结构化路径。",
      tag: "English",
      tagColor: "bg-blue-100 text-blue-700",
      recommended: true,
    },
    {
      name: "灵茶山艾府",
      href: "https://space.bilibili.com/206214",
      icon: "🍵",
      desc: "Top Chinese LeetCode explainer on Bilibili. Deep dives into patterns: sliding window, monotonic stack, trees, DP, and more.",
      descZh: "B 站顶级力扣讲解区 UP 主。深入讲解滑动窗口、单调栈、树、DP 等题型模板。",
      tag: "B站",
      tagColor: "bg-sky-100 text-sky-700",
      recommended: true,
    },
    {
      name: "LeetCode",
      href: "https://leetcode.cn",
      icon: "💻",
      desc: "The primary platform. Use LeetCode CN (leetcode.cn) for Chinese UI and local contest.",
      descZh: "主平台。国内用力扣（leetcode.cn），有中文界面和国内周赛。",
      tag: "Platform",
      tagColor: "bg-orange-100 text-orange-700",
    },
  ];

  // Only currently verified public opportunities belong here. Every entry
  // must include an official URL, verification date, and expiry boundary.
  const urgentPosts: {
    company: string; role: string; roleZh: string;
    type: "internship" | "fulltime"; location: string; region?: string;
    urgent?: boolean; desc?: string; descZh?: string;
    contact?: string; href?: string; date?: string;
  }[] = [];

  const basePath = process.env.NODE_ENV === "production" ? "/PaperTrace" : "";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* ── Header ── */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 dark:text-slate-100">
          {t("Job Hunt", "找工")}
        </h1>
        <p className="text-paper-800/50 dark:text-slate-400">
          {t(
            "LeetCode resources and ML interview prep — for SWE and research roles.",
            "力扣刷题资源 + 大模型八股题 — 适用于工程师和研究岗位求职。"
          )}
        </p>
      </header>

      {/* ════════════════════════════════════════════
          SECTION 0 — MOTIVATION LINK
      ════════════════════════════════════════════ */}
      <a
        href={`${basePath}/interview/notes`}
        className="flex items-center gap-4 mb-10 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-700/40 rounded-2xl hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all group"
      >
        <span className="text-3xl flex-shrink-0">✍️</span>
        <div className="flex-1">
          <p className="font-semibold text-paper-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mb-0.5">
            {t("Notes on the Job Hunt", "写在找工路上")}
          </p>
          <p className="text-sm text-paper-800/60 dark:text-slate-400 mb-0">
            {t("Timing, information, connection & mindset", "时机、信息差、人脉与心态")}
          </p>
        </div>
        <span className="text-amber-400 dark:text-amber-500 group-hover:translate-x-1 transition-transform text-lg flex-shrink-0">→</span>
      </a>

      {/* ════════════════════════════════════════════
          SECTION A — LEETCODE
      ════════════════════════════════════════════ */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-bold mb-5 pb-3 border-b border-paper-200 dark:border-slate-700 tracking-tight dark:text-slate-100">
          {t("LeetCode / 力扣", "力扣 / LeetCode")}
        </h2>
        <div className="space-y-2.5">
          {leetcodeResources.map((r) => (
            <a
              key={r.name}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 border border-paper-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <span className="text-xl mt-0.5 flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{r.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.tagColor}`}>{r.tag}</span>
                </div>
                <p className="text-sm text-paper-800/60 dark:text-slate-400 leading-relaxed mb-0">
                  {t(r.desc, r.descZh)}
                </p>
              </div>
              <span className="text-paper-800/30 dark:text-slate-600 group-hover:text-blue-500 text-sm mt-1 flex-shrink-0 transition-colors">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION B — JOB OPENINGS
      ════════════════════════════════════════════ */}
      <section className="mb-14">
        <h2 className="font-display text-2xl font-bold mb-2 pb-3 border-b border-paper-200 dark:border-slate-700 tracking-tight dark:text-slate-100">
          {t("Job Openings / 岗位", "岗位")}
        </h2>
        <p className="text-sm text-paper-800/50 dark:text-slate-400 mb-5">
          {t("Career pages for major AI labs — US and China.", "中美主流 AI 公司招聘页面。")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {[
            { name: "Anthropic", href: "https://www.anthropic.com/careers", region: "🇺🇸", color: "bg-orange-50 border-orange-200 hover:border-orange-400 dark:bg-orange-900/10 dark:border-orange-700/40" },
            { name: "OpenAI", href: "https://openai.com/careers", region: "🇺🇸", color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400 dark:bg-emerald-900/10 dark:border-emerald-700/40" },
            { name: "Google DeepMind", href: "https://deepmind.google/about/join-us/", region: "🇺🇸", color: "bg-blue-50 border-blue-200 hover:border-blue-400 dark:bg-blue-900/10 dark:border-blue-700/40" },
            { name: "Meta AI (FAIR)", href: "https://www.metacareers.com/teams/ai-research", region: "🇺🇸", color: "bg-blue-50 border-blue-200 hover:border-blue-400 dark:bg-blue-900/10 dark:border-blue-700/40" },
            { name: "DeepSeek", href: "https://www.deepseek.com/careers", region: "🇨🇳", color: "bg-sky-50 border-sky-200 hover:border-sky-400 dark:bg-sky-900/10 dark:border-sky-700/40" },
            { name: "字节跳动", href: "https://jobs.bytedance.com/experienced/position?keywords=&category=6704215862393TB&location=CT_156&project=&type=3&job_hot_flag=&current=1&limit=10&functionCategory=", region: "🇨🇳", color: "bg-red-50 border-red-200 hover:border-red-400 dark:bg-red-900/10 dark:border-red-700/40" },
            { name: "阿里通义 / Qwen", href: "https://talent.alibaba.com", region: "🇨🇳", color: "bg-orange-50 border-orange-200 hover:border-orange-400 dark:bg-orange-900/10 dark:border-orange-700/40" },
            { name: "Moonshot AI (Kimi)", href: "https://www.moonshot.cn/careers", region: "🇨🇳", color: "bg-violet-50 border-violet-200 hover:border-violet-400 dark:bg-violet-900/10 dark:border-violet-700/40" },
          ].map((c) => (
            <a
              key={c.name}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${c.color}`}
            >
              <span className="text-lg">{c.region}</span>
              <span className="font-medium text-sm dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-1 transition-colors">{c.name}</span>
              <span className="text-paper-800/30 dark:text-slate-600 group-hover:text-blue-500 text-sm transition-colors">↗</span>
            </a>
          ))}
        </div>

        {/* ── Community Posts ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-sm dark:text-slate-100">{t("Community Posts", "急招帖子")}</p>
              <p className="text-xs text-paper-800/50 dark:text-slate-500 mt-0.5">
                {t("Only publicly verifiable, unexpired opportunities are listed.", "仅展示可公开核验且尚未失效的机会。")}
              </p>
            </div>
            <a href="https://github.com/yayajjiang/PaperTrace/issues/new?template=role-opportunity.yml" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-paper-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">
              + {t("Submit verified role", "提交已核验岗位")}
            </a>
          </div>

          {urgentPosts.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-paper-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm text-paper-800/40 dark:text-slate-600">
                {t("No currently verified community roles. Old April 2025 posts were archived instead of being shown as urgent.", "当前没有已核验的社区岗位；2025 年 4 月旧帖已归档，不再显示为急招。")}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentPosts.map((post, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-paper-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {post.urgent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                            {t("Urgent", "急招")}
                          </span>
                        )}
                        <span className="font-semibold text-sm dark:text-slate-100">{post.company}</span>
                        <span className="text-xs text-paper-800/50 dark:text-slate-500">·</span>
                        <span className="text-sm text-paper-800/70 dark:text-slate-300">{t(post.role, post.roleZh)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-paper-100 dark:bg-slate-700 text-paper-800/60 dark:text-slate-400">{post.type === "internship" ? t("Internship", "实习") : t("Full-time", "校招")}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-paper-100 dark:bg-slate-700 text-paper-800/60 dark:text-slate-400">{post.location}</span>
                        {post.region && <span className="text-xs px-2 py-0.5 rounded-full bg-paper-100 dark:bg-slate-700 text-paper-800/60 dark:text-slate-400">{post.region}</span>}
                      </div>
                      {post.desc && <p className="text-xs text-paper-800/60 dark:text-slate-400 leading-relaxed mb-1">{t(post.desc, post.descZh ?? post.desc)}</p>}
                      {post.contact && (
                        <p className="text-xs text-paper-800/50 dark:text-slate-500">
                          📩 {post.contact}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {post.href && (
                        <a href={post.href} target="_blank" rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-paper-900 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-paper-700 dark:hover:bg-white transition-colors font-medium">
                          {t("Apply", "投递")} ↗
                        </a>
                      )}
                      {post.date && <span className="text-xs text-paper-800/35 dark:text-slate-600">{post.date}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION C — 面经 / 八股
      ════════════════════════════════════════════ */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-5 pb-3 border-b border-paper-200 dark:border-slate-700 tracking-tight dark:text-slate-100">
          {t("ML Interview / 面经·八股", "面经 · 八股")}
        </h2>
        <p className="text-sm text-paper-800/50 dark:text-slate-400 mb-8">
          {t(
            "Core concepts with rigorous answers — for LLM researchers and practitioners.",
            "核心概念与严谨解答 — 面向大模型研究者和从业者。"
          )}
        </p>

      {/* ── TOC pill strip ── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {[
          { href: "#attention", en: "Transformer & Attention", zh: "Transformer & 注意力" },
          { href: "#training", en: "Training & Optimization", zh: "训练与优化" },
          { href: "#architecture", en: "Architecture", zh: "架构设计" },
          { href: "#alignment", en: "Training & Alignment", zh: "训练与对齐" },
          { href: "#inference", en: "Inference & Deployment", zh: "推理与部署" },
        ].map(({ href, en, zh }) => (
          <a
            key={href}
            href={href}
            className="text-xs px-3 py-1.5 rounded-full border border-paper-200 bg-white hover:border-blue-300 hover:text-blue-600 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            {t(en, zh)}
          </a>
        ))}
      </div>

      <article className="paper-content">
        {/* ════════════════════════════════════════════
            SECTION 1 — TRANSFORMER & ATTENTION
        ════════════════════════════════════════════ */}
        <div id="attention">
          <SectionHeader
            number="01"
            en="Transformer & Attention"
            zh="Transformer & 注意力机制"
            color="blue"
            t={t}
          />

          {/* Q1 */}
          <Collapsible
            title={t(
              "Q1: Why does scaled dot-product attention divide by √d_k?",
              "问1：缩放点积注意力为何除以 √d_k？"
            )}
            defaultOpen
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "When d_k is large, the dot products Q·Kᵀ grow in magnitude — their variance scales with d_k, pushing softmax into regions with very small gradients (saturation). Dividing by √d_k normalizes the variance back to ~1, keeping softmax in a stable gradient regime.",
                  "当 d_k 很大时，点积 Q·Kᵀ 的数值会增大 — 其方差随 d_k 增长，导致 softmax 进入梯度极小的饱和区。除以 √d_k 将方差归一化回 ~1，使 softmax 保持在稳定的梯度区间内。"
                )}
              </p>

              <Math
                display
                label={t("Scaled dot-product attention", "缩放点积注意力")}
                tex="\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V"
              />

              <Collapsible
                title={t("Variance proof", "方差证明")}
                defaultOpen={false}
              >
                <div className="space-y-3 text-sm">
                  <p>
                    {t(
                      "If q and k have components drawn i.i.d. from N(0,1), then:",
                      "若 q、k 的分量独立同分布于 N(0,1)，则："
                    )}
                  </p>
                  <Math
                    display
                    tex="q \cdot k = \sum_{i=1}^{d_k} q_i k_i \;\implies\; \text{Var}(q \cdot k) = d_k"
                  />
                  <p>
                    {t(
                      "After dividing by √d_k the variance becomes 1, preventing softmax saturation.",
                      "除以 √d_k 后方差变为 1，防止 softmax 饱和。"
                    )}
                  </p>
                </div>
              </Collapsible>

              <KeyInsight
                en="Concrete example: d_k = 64 → without scaling, dot products have std ≈ 8; after scaling by 1/√64 = 1/8, std ≈ 1."
                zh="具体例子：d_k = 64 → 不缩放时点积标准差 ≈ 8；除以 √64 = 8 后标准差 ≈ 1。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q2 */}
          <Collapsible
            title={t(
              "Q2: Encoder-only vs decoder-only vs encoder-decoder Transformers?",
              "问2：编码器、解码器、编码器-解码器架构有何区别？"
            )}
          >
            <div className="space-y-4 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                  <p className="font-semibold text-blue-800 mb-1">
                    {t("Encoder-only (BERT)", "编码器（BERT）")}
                  </p>
                  <p className="mb-0 text-blue-900">
                    {t(
                      "Bidirectional attention — each token sees all other tokens. No causal mask. Used for understanding tasks (classification, NER, QA). Pre-trained with Masked Language Modeling (MLM).",
                      "双向注意力 — 每个 token 可见所有其他 token，无因果掩码。用于理解任务（分类、NER、问答）。使用掩码语言建模（MLM）预训练。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40">
                  <p className="font-semibold text-violet-800 mb-1">
                    {t("Decoder-only (GPT series, LLaMA)", "解码器（GPT 系列、LLaMA）")}
                  </p>
                  <p className="mb-0 text-violet-900">
                    {t(
                      "Causal / autoregressive attention — each token only sees previous tokens. Used for generation. Pre-trained with next-token prediction.",
                      "因果/自回归注意力 — 每个 token 只能看到之前的 token。用于生成任务，使用下一个 token 预测预训练。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/40">
                  <p className="font-semibold text-emerald-800 mb-1">
                    {t("Encoder-decoder (T5, original Transformer)", "编码器-解码器（T5、原始 Transformer）")}
                  </p>
                  <p className="mb-0 text-emerald-900">
                    {t(
                      "Encoder reads the full source with bidirectional attention; decoder attends to encoder outputs via cross-attention, plus its own past tokens via causal attention. Used for seq2seq tasks (translation, summarization).",
                      "编码器用双向注意力读全文；解码器通过交叉注意力访问编码输出，同时对自身历史 token 使用因果注意力。用于序列到序列任务（翻译、摘要）。"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Q3 */}
          <Collapsible
            title={t(
              "Q3: What is FlashAttention and why does it matter?",
              "问3：FlashAttention 是什么，为何重要？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Standard attention writes the full N×N attention matrix to GPU HBM (high-bandwidth memory, which is slow), requiring O(N²) memory. FlashAttention tiles the computation to stay in SRAM (fast on-chip cache), computing exact attention while only writing O(N) data to HBM.",
                  "标准注意力将完整的 N×N 注意力矩阵写入 GPU HBM（高带宽内存，较慢），需要 O(N²) 内存。FlashAttention 将计算分块在 SRAM（快速片上缓存）中完成，精确计算注意力，同时只向 HBM 写入 O(N) 数据。"
                )}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    {t("Standard Attention", "标准注意力")}
                  </p>
                  <p className="font-mono text-red-800 mb-0">
                    O(N²) {t("HBM reads/writes", "HBM 读写")}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    {t("FlashAttention", "FlashAttention")}
                  </p>
                  <p className="font-mono text-green-800 mb-0">
                    O(N) {t("HBM reads/writes", "HBM 读写")}
                  </p>
                </div>
              </div>

              <KeyInsight
                en="~3× speedup on attention, enables 64K+ context lengths without approximation — the result is mathematically identical to standard attention."
                zh="注意力计算约 3× 加速，支持 64K+ 上下文长度，无需近似 — 结果与标准注意力数学等价。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q4 */}
          <Collapsible
            title={t(
              "Q4: Explain multi-head attention. Why use multiple heads?",
              "问4：解释多头注意力。为何使用多个头？"
            )}
          >
            <div className="space-y-4 text-sm">
              <Math
                display
                label={t("Multi-head attention", "多头注意力")}
                tex="\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)\,W^O"
              />
              <Math
                display
                label={t("Each head", "每个头")}
                tex="\text{head}_i = \text{Attention}(QW_i^Q,\; KW_i^K,\; VW_i^V)"
              />

              <p>
                {t(
                  "The original Transformer uses h=8 heads with d_model=512, giving d_k=d_v=64 per head. The total compute is similar to single-head attention at d_model.",
                  "原始 Transformer 使用 h=8 个头，d_model=512，每头 d_k=d_v=64。总计算量与单头 d_model 维度的注意力相近。"
                )}
              </p>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                <p className="font-semibold text-blue-800 mb-2">
                  {t("Why multiple heads?", "为何多头？")}
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-0 text-blue-900">
                  <li>
                    {t(
                      "Each head attends to different representation subspaces and different positions simultaneously.",
                      "每个头可同时关注不同表示子空间和不同位置的信息。"
                    )}
                  </li>
                  <li>
                    {t(
                      "In practice: one head may focus on syntax, another on coreference, another on positional relations.",
                      "实践中：一个头可能关注句法，另一个关注指代，另一个关注位置关系。"
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </Collapsible>

          {/* Q5 */}
          <Collapsible
            title={t(
              "Q5: What is positional encoding and why does Transformer need it?",
              "问5：什么是位置编码，Transformer 为何需要它？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Self-attention is permutation-invariant — it produces the same output regardless of token order. Positional encoding injects sequence position information by adding a position-dependent signal to each token embedding.",
                  "自注意力对序列顺序不敏感（置换不变）— 无论 token 顺序如何都会产生相同输出。位置编码通过向每个 token 嵌入添加位置相关信号来注入序列位置信息。"
                )}
              </p>

              <Math
                display
                label={t("Sinusoidal positional encoding", "正弦位置编码")}
                tex="\text{PE}_{(pos,\,2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right), \quad \text{PE}_{(pos,\,2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)"
              />

              <p>
                {t(
                  "Different frequencies let the model learn both absolute positions and relative distances between positions.",
                  "不同频率使模型能学习绝对位置和位置间的相对距离。"
                )}
              </p>

              <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40">
                <p className="font-semibold text-violet-800 mb-1">
                  {t("Modern LLMs: RoPE", "现代 LLM：RoPE")}
                </p>
                <p className="mb-0 text-violet-900">
                  {t(
                    "Rotary Position Embedding applies rotation in complex space to Q and K before computing attention. It naturally encodes relative positions and generalizes better to sequences longer than those seen during training.",
                    "旋转位置编码在计算注意力前对 Q 和 K 在复数空间中施加旋转。它自然编码相对位置，并比绝对位置编码更好地泛化到训练时未见过的更长序列。"
                  )}
                </p>
              </div>
            </div>
          </Collapsible>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 2 — TRAINING & OPTIMIZATION
        ════════════════════════════════════════════ */}
        <div id="training">
          <SectionHeader
            number="02"
            en="Training & Optimization"
            zh="训练与优化"
            color="violet"
            t={t}
          />

          {/* Q6 */}
          <Collapsible
            title={t(
              "Q6: What is gradient clipping and why is it used in LLM training?",
              "问6：梯度裁剪是什么，LLM 训练中为何使用？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Gradient clipping rescales the gradient vector when its norm exceeds a threshold θ. If ||∇L|| > θ, all gradients are scaled by θ/||∇L|| so the resulting norm equals exactly θ.",
                  "梯度裁剪在梯度向量的范数超过阈值 θ 时对其进行缩放。若 ||∇L|| > θ，所有梯度按 θ/||∇L|| 缩放，使结果范数恰好等于 θ。"
                )}
              </p>

              <Math
                display
                label={t("Gradient clipping rule", "梯度裁剪规则")}
                tex="g \leftarrow \begin{cases} g & \text{if } \|g\| \leq \theta \\ \dfrac{\theta}{\|g\|}\, g & \text{otherwise} \end{cases}"
              />

              <KeyInsight
                en="Clipping preserves gradient direction (it's a rescaling, not per-element truncation). Typical value: θ = 1.0. Prevents gradient explosion that is especially severe in deep Transformers and RNNs."
                zh="裁剪保留梯度方向（是整体缩放，非逐元素截断）。典型值 θ = 1.0。防止深层 Transformer 和 RNN 中尤为严重的梯度爆炸。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q7 */}
          <Collapsible
            title={t(
              "Q7: Pre-norm vs post-norm Transformers — what's the difference?",
              "问7：Pre-norm 与 Post-norm Transformer 有何区别？"
            )}
          >
            <div className="space-y-4 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-semibold text-red-800 mb-1">
                    {t("Post-norm (original Transformer, 2017)", "Post-norm（原始 Transformer，2017）")}
                  </p>
                  <Math
                    display
                    tex="x \leftarrow \text{LayerNorm}(x + \text{Sublayer}(x))"
                  />
                  <p className="mb-0 text-red-900">
                    {t(
                      "Harder to train — requires careful learning-rate warmup. Gradient magnitude varies across layers.",
                      "训练较难 — 需要仔细的学习率预热。各层梯度幅度差异大。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold text-green-800 mb-1">
                    {t("Pre-norm (GPT-2+, LLaMA, Mistral…)", "Pre-norm（GPT-2+、LLaMA、Mistral…）")}
                  </p>
                  <Math
                    display
                    tex="x \leftarrow x + \text{Sublayer}(\text{LayerNorm}(x))"
                  />
                  <p className="mb-0 text-green-900">
                    {t(
                      "More stable gradients, easier to train, can use larger learning rates. The residual stream passes through the network unnormalized, carrying information cleanly across layers.",
                      "梯度更稳定，训练更容易，可使用更大的学习率。残差流无归一化地穿过网络，在各层间干净地传递信息。"
                    )}
                  </p>
                </div>
              </div>

              <KeyInsight
                en="Virtually all modern LLMs use pre-norm. The clean residual stream is a key reason interpretability methods (like logit lens) work well on them."
                zh="现代 LLM 几乎全部使用 pre-norm。干净的残差流也是可解释性方法（如 logit lens）能有效工作的关键原因。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q8 */}
          <Collapsible
            title={t(
              "Q8: What is label smoothing and when should you use it?",
              "问8：什么是标签平滑，何时应使用？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Instead of hard one-hot targets, label smoothing uses soft targets: the correct class receives probability 1−ε, and the remaining ε probability mass is distributed uniformly across all K classes.",
                  "标签平滑用软标签代替硬 one-hot 目标：正确类别获得概率 1−ε，剩余 ε 均匀分配给所有 K 个类别。"
                )}
              </p>

              <Math
                display
                label={t("Smoothed target distribution", "平滑目标分布")}
                tex="y_i^{\text{smooth}} = \begin{cases} 1 - \varepsilon & \text{if } i = \text{correct class} \\ \dfrac{\varepsilon}{K-1} & \text{otherwise} \end{cases}"
              />

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                <p className="font-semibold text-blue-800 mb-2">
                  {t("Benefits", "好处")}
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-0 text-blue-900">
                  <li>{t("Prevents overconfident predictions", "防止过度自信的预测")}</li>
                  <li>{t("Acts as regularization — improves generalization", "起正则化作用 — 提升泛化")}</li>
                  <li>{t("Better calibration: predicted probabilities more closely match true likelihoods", "更好的校准：预测概率更接近真实概率")}</li>
                </ul>
              </div>

              <p>
                {t(
                  "The original Transformer uses ε=0.1 for machine translation. Avoid label smoothing when the model needs to be confident — e.g., reward prediction in RL, or classification with clean labels.",
                  "原始 Transformer 在机器翻译中使用 ε=0.1。当模型需要自信时避免标签平滑 — 例如 RL 中的奖励预测，或带有干净标签的分类任务。"
                )}
              </p>
            </div>
          </Collapsible>

          {/* Q9 */}
          <Collapsible
            title={t(
              "Q9: BPE vs WordPiece vs SentencePiece tokenization?",
              "问9：BPE、WordPiece 与 SentencePiece 分词有何区别？"
            )}
          >
            <div className="space-y-3 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("BPE — Byte Pair Encoding (GPT-2/3/4, LLaMA)", "BPE — 字节对编码（GPT-2/3/4、LLaMA）")}
                  </p>
                  <p className="mb-0 text-paper-800/80">
                    {t(
                      "Start with a character vocabulary. Iteratively merge the most frequent adjacent pair. Greedy and deterministic. GPT-4 uses ~100K BPE tokens.",
                      "从字符词表开始，迭代合并最频繁的相邻字符对。贪心且确定性。GPT-4 使用约 10 万个 BPE token。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("WordPiece (BERT, DistilBERT)", "WordPiece（BERT、DistilBERT）")}
                  </p>
                  <p className="mb-0 text-paper-800/80">
                    {t(
                      "Like BPE, but merges pairs that maximize the language model likelihood (not raw frequency). Words split as: \"running\" → \"run\" + \"##ning\" (## marks non-initial sub-words).",
                      "类似 BPE，但合并使语言模型似然最大化的字符对（非频率）。单词拆分示例：\"running\" → \"run\" + \"##ning\"（## 标记非首位子词）。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("SentencePiece (LLaMA, T5, mT5)", "SentencePiece（LLaMA、T5、mT5）")}
                  </p>
                  <p className="mb-0 text-paper-800/80">
                    {t(
                      "Language-agnostic: treats text as raw Unicode sequences with no pre-tokenization on whitespace. Works well for non-Latin scripts (Chinese, Japanese, Arabic). Can be used with either BPE or Unigram LM algorithm.",
                      "与语言无关：将文本视为原始 Unicode 序列，不进行空格预分词。对非拉丁语系（中、日、阿拉伯语等）友好。可与 BPE 或 Unigram LM 算法结合使用。"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Q15 */}
          <Collapsible
            title={t(
              "Q15: Why does Transformer use LayerNorm instead of BatchNorm?",
              "问15：Transformer 为何用 LayerNorm 而不是 BatchNorm？"
            )}
          >
            <div className="space-y-4 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-700/40">
                  <p className="font-semibold text-red-800 mb-1">{t("BatchNorm — normalizes across batch dimension", "BatchNorm — 跨 batch 维度归一化")}</p>
                  <p className="mb-0 text-red-900 dark:text-red-200">
                    {t(
                      "For each feature dimension, normalize across the batch. Requires a large batch to estimate stable statistics. Fails for variable-length sequences — padding tokens corrupt batch statistics.",
                      "对每个特征维度，跨 batch 归一化。需要较大 batch 估计稳定统计量。变长序列下 padding token 会污染 batch 统计量，效果差。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700/40">
                  <p className="font-semibold text-green-800 mb-1">{t("LayerNorm — normalizes across feature dimension", "LayerNorm — 跨特征维度归一化")}</p>
                  <p className="mb-0 text-green-900 dark:text-green-200">
                    {t(
                      "For each token, normalize across its feature vector. Independent of batch size and sequence length. Works identically during training and inference — no need to track running statistics.",
                      "对每个 token，跨其特征向量归一化。与 batch 大小和序列长度无关。训练和推理行为完全一致，无需维护滑动统计量。"
                    )}
                  </p>
                </div>
              </div>
              <KeyInsight
                en="LayerNorm normalizes each token independently — it doesn't care about batch size or sequence length, making it the natural choice for autoregressive and variable-length sequence models."
                zh="LayerNorm 对每个 token 独立归一化，与 batch 大小和序列长度无关，天然适合自回归和变长序列模型。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q16 */}
          <Collapsible
            title={t(
              "Q16: How does Adam work? What does AdamW fix?",
              "问16：Adam 的原理？AdamW 修复了什么问题？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Adam maintains two moving averages per parameter: first moment m (mean of gradients, like momentum) and second moment v (mean of squared gradients, like RMSProp). These are used to compute an adaptive per-parameter learning rate.",
                  "Adam 为每个参数维护两个移动平均值：一阶矩 m（梯度均值，类似动量）和二阶矩 v（梯度平方均值，类似 RMSProp）。用于计算自适应的逐参数学习率。"
                )}
              </p>
              <Math
                display
                label={t("Adam update rule", "Adam 更新规则")}
                tex="m_t = \beta_1 m_{t-1} + (1-\beta_1)g_t \quad v_t = \beta_2 v_{t-1} + (1-\beta_2)g_t^2 \quad \theta_t = \theta_{t-1} - \frac{\eta}{\sqrt{\hat{v}_t}+\epsilon}\hat{m}_t"
              />
              <p className="text-paper-800/70 dark:text-slate-400 text-xs">
                {t("Typical defaults: β₁=0.9, β₂=0.999, ε=1e-8. Bias correction: m̂ = m/(1−β₁ᵗ), v̂ = v/(1−β₂ᵗ).", "典型默认值：β₁=0.9，β₂=0.999，ε=1e-8。偏差修正：m̂ = m/(1−β₁ᵗ)，v̂ = v/(1−β₂ᵗ)。")}
              </p>
              <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40">
                <p className="font-semibold text-violet-800 mb-1">{t("AdamW: decoupled weight decay", "AdamW：解耦权重衰减")}</p>
                <p className="mb-0 text-violet-900 dark:text-violet-200">
                  {t(
                    "Standard Adam applies L2 regularization by adding λθ to the gradient before the update. This interacts with the adaptive scaling, making regularization weaker for parameters with large gradients. AdamW decouples weight decay — applies it directly to weights after the gradient step: θ ← θ − η(Adam step) − ηλθ. This is the standard for LLM training.",
                    "标准 Adam 将 L2 正则通过在梯度中加入 λθ 实现，与自适应缩放耦合，导致大梯度参数的正则效果减弱。AdamW 解耦权重衰减 — 在梯度更新后直接对权重施加：θ ← θ − η(Adam步骤) − ηλθ。这是 LLM 训练的标准选择。"
                  )}
                </p>
              </div>
            </div>
          </Collapsible>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 3 — ARCHITECTURE DESIGN
        ════════════════════════════════════════════ */}
        <div id="architecture">
          <SectionHeader
            number="03"
            en="Architecture Design"
            zh="架构设计"
            color="emerald"
            t={t}
          />

          {/* Q10 */}
          <Collapsible
            title={t(
              "Q10: What is LoRA and how does it reduce parameters?",
              "问10：LoRA 是什么，如何减少参数量？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "LoRA (Low-Rank Adaptation) freezes the pre-trained weight matrix W₀ and learns a low-rank decomposition of the weight update ΔW = BA, where B ∈ ℝᵈˣʳ, A ∈ ℝʳˣᵏ, and rank r ≪ min(d, k).",
                  "LoRA（低秩自适应）冻结预训练权重矩阵 W₀，学习权重更新的低秩分解 ΔW = BA，其中 B ∈ ℝᵈˣʳ，A ∈ ℝʳˣᵏ，秩 r ≪ min(d, k)。"
                )}
              </p>

              <Math
                display
                label={t("LoRA forward pass", "LoRA 前向传播")}
                tex="h = W_0 x + \frac{\alpha}{r} B A x"
              />

              <p>
                {t(
                  "At inference: merge W = W₀ + (α/r)BA. Zero latency overhead compared to the base model.",
                  "推理时合并 W = W₀ + (α/r)BA，与基础模型相比零延迟开销。"
                )}
              </p>

              <Collapsible
                title={t("Parameter reduction example (GPT-3 scale)", "参数减少示例（GPT-3 规模）")}
                defaultOpen={false}
              >
                <div className="text-sm space-y-2">
                  <p>
                    {t(
                      "For a GPT-3 attention projection (d = 12288):",
                      "对于 GPT-3 注意力投影矩阵（d = 12288）："
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 rounded border border-red-200 text-center">
                      <p className="text-xs font-semibold text-red-700">
                        {t("Full fine-tuning", "全量微调")}
                      </p>
                      <p className="font-mono text-red-800 mb-0">
                        12288² = 150M {t("params", "参数")}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
                      <p className="text-xs font-semibold text-green-700">
                        {t("LoRA r=4", "LoRA r=4")}
                      </p>
                      <p className="font-mono text-green-800 mb-0">
                        2 × 12288 × 4 = 98K {t("params", "参数")}
                      </p>
                    </div>
                  </div>
                  <p className="text-paper-800/60">
                    {t("1500× parameter reduction per matrix.", "每个矩阵参数量减少 1500 倍。")}
                  </p>
                </div>
              </Collapsible>

              <KeyInsight
                en="Why does it work? Fine-tuning tasks have low intrinsic dimensionality — the meaningful weight changes live in a low-rank subspace of the full parameter space."
                zh="为何有效？微调任务的内在维度低 — 有意义的权重变化位于全参数空间的低秩子空间中。"
                t={t}
              />

              <Collapsible title={t("Deep dive: r, α, and initialization", "深入：r、α 与初始化")} defaultOpen={false}>
                <div className="space-y-4 text-sm">
                  <div className="grid gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                      <p className="font-semibold text-blue-800 mb-1">{t("r — Rank", "r — 秩")}</p>
                      <p className="mb-0 text-blue-900 dark:text-blue-200">
                        {t("Controls expressiveness. Typical values: 4, 8, 16. Surprisingly low ranks (r=4) match full fine-tuning quality on many tasks. Larger r helps complex, high-diversity tasks. Increasing r increases parameters linearly: 2 × d × r per matrix.", "控制表达能力。典型值：4、8、16。极低的秩（r=4）在很多任务上能匹配全量微调效果。复杂多样性任务需要更大的 r。参数量随 r 线性增加：每个矩阵 2 × d × r。")}
                      </p>
                    </div>
                    <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40">
                      <p className="font-semibold text-violet-800 mb-1">{t("α — Scaling factor", "α — 缩放因子")}</p>
                      <p className="mb-0 text-violet-900 dark:text-violet-200">
                        {t("Scales the LoRA output by α/r before adding to the base weight. Increasing r (with fixed α) shrinks the effective learning rate automatically, preventing instability. Common convention: set α = r for the first run. Tuning α is equivalent to tuning learning rate for LoRA modules.", "以 α/r 缩放 LoRA 输出再叠加到基础权重。增大 r（固定 α）时，有效学习率自动减小，防止训练不稳定。惯例：第一次实验设 α = r。调整 α 等价于为 LoRA 模块调整学习率。")}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/40">
                      <p className="font-semibold text-emerald-800 mb-2">{t("Initialization: why B=0, A∼Gaussian?", "初始化：为何 B=0，A∼高斯？")}</p>
                      <p className="mb-2 text-emerald-900 dark:text-emerald-200">
                        {t("Goal: ΔW = BA = 0 at the start of training, so the model begins from the pre-trained checkpoint with no disturbance. But both matrices must have non-zero gradients.", "目标：训练开始时 ΔW = BA = 0，使模型从预训练检查点无扰动启动。但两个矩阵都需要有非零梯度。")}
                      </p>
                      <div className="text-xs text-emerald-800/80 dark:text-emerald-200/80 space-y-1">
                        <p>
                          {t("• B=0, A~Gaussian: BA=0 ✓, gradient w.r.t B = (Ax)ᵀ ≠ 0 ✓ — B can learn immediately.", "• B=0，A∼高斯：BA=0 ✓，B 的梯度 = (Ax)ᵀ ≠ 0 ✓ — B 能立即学习。")}
                        </p>
                        <p>
                          {t("• A=0, B~Gaussian: BA=0 ✓ but gradient w.r.t B = (Ax)ᵀ = 0 — B gets no useful gradient. Training stalls.", "• A=0，B∼高斯：BA=0 ✓，但 B 的梯度 = (Ax)ᵀ = 0 — B 无法获得有效梯度，训练卡死。")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>
          </Collapsible>

          {/* Q10b: PEFT methods */}
          <Collapsible
            title={t(
              "Q10b: What other PEFT methods exist besides LoRA?",
              "问10b：除 LoRA 外还有哪些 PEFT 方法？"
            )}
          >
            <div className="space-y-3 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 dark:bg-slate-800 dark:border-slate-700">
                  <p className="font-semibold mb-1">LoRA / QLoRA</p>
                  <p className="mb-0 text-paper-800/70 dark:text-slate-400">{t("Low-rank weight update. No inference latency (merge at deploy time). QLoRA adds 4-bit base model quantization for consumer GPU fine-tuning.", "低秩权重更新。无推理延迟（部署时合并）。QLoRA 加入 4-bit 量化使消费级显卡可微调。")}</p>
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 dark:bg-slate-800 dark:border-slate-700">
                  <p className="font-semibold mb-1">{t("Adapter", "Adapter 层")}</p>
                  <p className="mb-0 text-paper-800/70 dark:text-slate-400">{t("Small bottleneck MLP inserted between Transformer sublayers. Simple, but adds serial computation → inference latency. Cannot be merged away.", "在 Transformer 子层间插入小型瓶颈 MLP。简单，但引入串行计算 → 推理延迟，无法消除。")}</p>
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 dark:bg-slate-800 dark:border-slate-700">
                  <p className="font-semibold mb-1">Prefix Tuning / Prompt Tuning</p>
                  <p className="mb-0 text-paper-800/70 dark:text-slate-400">{t("Prepend learnable soft tokens to the input or to every layer's KV. No weight changes. But reduces effective context length and underperforms LoRA on most tasks.", "在输入或每层 KV 前追加可学习软 token。不修改权重，但会占用有效上下文长度，多数任务不如 LoRA。")}</p>
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200 dark:bg-slate-800 dark:border-slate-700">
                  <p className="font-semibold mb-1">(IA)³</p>
                  <p className="mb-0 text-paper-800/70 dark:text-slate-400">{t("Infused Adapter by Inhibiting and Amplifying Inner Activations. Learns element-wise rescaling vectors for K, V, FFN. Even fewer parameters than LoRA, but less expressive.", "通过抑制和放大内部激活注入适配器。对 K、V、FFN 学习逐元素缩放向量。参数比 LoRA 更少，但表达能力较弱。")}</p>
                </div>
              </div>
              <KeyInsight
                en="LoRA dominates in practice because: (1) no inference overhead, (2) good quality, (3) easy to implement. QLoRA made it accessible on a single consumer GPU."
                zh="LoRA 在实践中占主导：①无推理开销，②效果好，③易实现。QLoRA 让单张消费级显卡也能微调大模型。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q11 */}
          <Collapsible
            title={t(
              "Q11: What is Grouped Query Attention (GQA)?",
              "问11：什么是分组查询注意力（GQA）？"
            )}
          >
            <div className="space-y-4 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("MHA — Multi-Head Attention (standard)", "MHA — 多头注意力（标准）")}
                  </p>
                  <p className="mb-0 text-paper-800/70">
                    {t(
                      "h query heads, h key heads, h value heads. Full quality, largest KV cache.",
                      "h 个查询头，h 个键头，h 个值头。质量最高，KV 缓存最大。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="font-semibold mb-1">
                    {t("MQA — Multi-Query Attention (Falcon)", "MQA — 多查询注意力（Falcon）")}
                  </p>
                  <p className="mb-0 text-red-900">
                    {t(
                      "h query heads share a single K and V. Fastest inference, smallest KV cache, but noticeable quality drop on some tasks.",
                      "h 个查询头共享 1 个 K 和 V。推理最快，KV 缓存最小，但部分任务质量明显下降。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-semibold mb-1">
                    {t("GQA — Grouped Query Attention (Mistral 7B, LLaMA 3)", "GQA — 分组查询注意力（Mistral 7B、LLaMA 3）")}
                  </p>
                  <p className="mb-0 text-green-900">
                    {t(
                      "h query heads split into g groups; each group shares one K/V pair. Mistral 7B: 32 query heads, 8 KV heads. Balance between MHA quality and MQA speed. KV cache is h/g × smaller than MHA.",
                      "h 个查询头分为 g 组，每组共享一对 K/V。Mistral 7B：32 个查询头，8 个 KV 头。在 MHA 质量和 MQA 速度间取得平衡。KV 缓存比 MHA 小 h/g 倍。"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Collapsible>

          {/* Q12 */}
          <Collapsible
            title={t(
              "Q12: What is the KV Cache and why is it important for inference?",
              "问12：什么是 KV 缓存，为何对推理至关重要？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "During autoregressive generation, each new token must attend to all previous tokens' keys and values. Without caching, we'd recompute K,V for every past token at every generation step — O(n²) total compute for a sequence of length n.",
                  "在自回归生成时，每个新 token 必须关注所有历史 token 的 K 和 V。不缓存的话，每一步生成都需重新计算所有历史 token 的 K、V — 总计算量为 O(n²)。"
                )}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    {t("Without KV Cache", "无 KV 缓存")}
                  </p>
                  <p className="font-mono text-red-800 mb-0">O(n²)</p>
                  <p className="text-xs text-red-700">
                    {t("total compute", "总计算量")}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-xs font-semibold text-green-700 mb-1">
                    {t("With KV Cache", "有 KV 缓存")}
                  </p>
                  <p className="font-mono text-green-800 mb-0">O(n)</p>
                  <p className="text-xs text-green-700">
                    {t("total compute", "总计算量")}
                  </p>
                </div>
              </div>

              <p>
                {t(
                  "Each step: compute Q, K, V only for the new token, append K and V to the cache, then attend over the full cached sequence.",
                  "每一步：只计算新 token 的 Q、K、V，将 K 和 V 追加到缓存，然后关注完整的缓存序列。"
                )}
              </p>

              <Collapsible
                title={t("KV cache memory cost", "KV 缓存内存占用")}
                defaultOpen={false}
              >
                <div className="text-sm space-y-2">
                  <Math
                    display
                    label={t("Memory per token (bytes)", "每 token 内存（字节）")}
                    tex="\text{mem} = 2 \times n_{\text{layers}} \times n_{\text{kv\_heads}} \times d_{\text{head}} \times \text{sizeof}(\text{dtype})"
                  />
                  <p className="text-paper-800/70">
                    {t(
                      "LLaMA-7B (fp16) at 4096 tokens: 2 × 32 layers × 32 heads × 128 dims × 2 bytes ≈ 0.5 GB per sequence.",
                      "LLaMA-7B（fp16）在 4096 tokens 时：2 × 32 层 × 32 头 × 128 维 × 2 字节 ≈ 每个序列 0.5 GB。"
                    )}
                  </p>
                </div>
              </Collapsible>
            </div>
          </Collapsible>

          {/* Q17 */}
          <Collapsible
            title={t(
              "Q17: What is SwiGLU and why do modern LLMs use it over ReLU/GELU?",
              "问17：什么是 SwiGLU，为何现代 LLM 用它替代 ReLU/GELU？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "The standard Transformer FFN applies two linear layers with a single activation: FFN(x) = max(0, xW₁+b₁)W₂+b₂. SwiGLU replaces this with a gated architecture using three weight matrices.",
                  "标准 Transformer FFN 在两个线性层间使用单一激活：FFN(x) = max(0, xW₁+b₁)W₂+b₂。SwiGLU 用三个权重矩阵替换为门控架构。"
                )}
              </p>
              <Math
                display
                label={t("SwiGLU FFN", "SwiGLU FFN")}
                tex="\text{FFN}_{\text{SwiGLU}}(x) = \bigl(\text{Swish}(xW) \odot xV\bigr) W_2 \quad \text{where Swish}(x) = x \cdot \sigma(x)"
              />
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/40">
                <p className="font-semibold text-emerald-800 mb-2">{t("Why better?", "为何更优？")}</p>
                <ul className="list-disc pl-5 space-y-1 mb-0 text-emerald-900 dark:text-emerald-200">
                  <li>{t("Gate mechanism: the V branch controls information flow — learns to select which activations are relevant.", "门控机制：V 分支控制信息流，学习筛选相关激活。")}</li>
                  <li>{t("Swish is smooth and non-monotonic, unlike ReLU's hard zero gate. Empirically outperforms ReLU and GELU on language modeling.", "Swish 平滑且非单调，不像 ReLU 的硬零门。在语言建模上经验表现优于 ReLU 和 GELU。")}</li>
                  <li>{t("Used by: LLaMA, PaLM, Gemma, Mistral, Qwen. Standard for modern open-weights LLMs.", "使用模型：LLaMA、PaLM、Gemma、Mistral、Qwen。现代开源 LLM 的标准选择。")}</li>
                </ul>
              </div>
              <p className="text-paper-800/60 dark:text-slate-400 text-xs">
                {t("Note: SwiGLU uses 3 matrices vs 2, so the intermediate dim is typically reduced to 2/3 × 4d to keep FLOPs equal.", "注意：SwiGLU 使用 3 个矩阵而非 2 个，因此中间维度通常缩减为 2/3 × 4d 以保持 FLOPs 不变。")}
              </p>
            </div>
          </Collapsible>

          {/* Q18 */}
          <Collapsible
            title={t(
              "Q18: How does Mixture of Experts (MoE) work?",
              "问18：混合专家（MoE）的工作原理？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "MoE replaces each dense FFN layer with N expert FFNs and a router. For each token, the router selects the top-k experts (typically k=1 or k=2) and routes the token only to those experts. The output is the weighted sum of selected expert outputs.",
                  "MoE 将每个密集 FFN 层替换为 N 个专家 FFN 和一个路由器。对每个 token，路由器选择 top-k 个专家（通常 k=1 或 k=2），只将 token 路由到这些专家。输出是所选专家输出的加权和。"
                )}
              </p>
              <Math
                display
                label={t("MoE output", "MoE 输出")}
                tex="\text{MoE}(x) = \sum_{i \in \text{top-k}} G_i(x) \cdot E_i(x) \quad G(x) = \text{Softmax}(\text{TopK}(xW_g))"
              />
              <div className="grid gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                  <p className="font-semibold text-blue-800 mb-1">{t("Key advantage", "核心优势")}</p>
                  <p className="mb-0 text-blue-900 dark:text-blue-200">
                    {t(
                      "More parameters, same compute. Mixtral 8x7B has 46.7B total parameters but only activates ~13B per token — inference cost of a 13B dense model with quality closer to a 47B model.",
                      "更多参数，相同计算量。Mixtral 8x7B 共 46.7B 参数，每个 token 只激活约 13B — 推理成本等同 13B 密集模型，质量接近 47B 模型。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40">
                  <p className="font-semibold text-amber-800 mb-1">{t("Load balancing problem", "负载均衡问题")}</p>
                  <p className="mb-0 text-amber-900 dark:text-amber-200">
                    {t(
                      "Without regularization, the router collapses — a few experts receive all tokens ('rich get richer'). The auxiliary load balancing loss penalizes uneven expert utilization: L_balance = α · N · Σᵢ fᵢ·Pᵢ, where fᵢ is the fraction of tokens routed to expert i.",
                      "没有正则化，路由器会坍塌 — 少数专家收到全部 token（马太效应）。辅助负载均衡损失惩罚不均匀的专家使用率：L_balance = α · N · Σᵢ fᵢ·Pᵢ，其中 fᵢ 是路由到专家 i 的 token 比例。"
                    )}
                  </p>
                </div>
              </div>
              <KeyInsight
                en="Models: Mixtral 8x7B (top-2 routing), DeepSeek-MoE (fine-grained, 64 experts), Switch Transformer (top-1). MoE is why DeepSeek-V3 (671B total, 37B active) is competitive with dense frontier models."
                zh="代表模型：Mixtral 8x7B（top-2 路由）、DeepSeek-MoE（细粒度，64 专家）、Switch Transformer（top-1）。MoE 是 DeepSeek-V3（共 671B，激活 37B）能与密集前沿模型竞争的原因。"
                t={t}
              />
            </div>
          </Collapsible>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 4 — TRAINING & ALIGNMENT
        ════════════════════════════════════════════ */}
        <div id="alignment">
          <SectionHeader
            number="04"
            en="Training & Alignment"
            zh="训练与对齐"
            color="rose"
            t={t}
          />

          {/* Q13 */}
          <Collapsible
            title={t(
              "Q13: Explain RLHF step by step. What are the main failure modes?",
              "问13：逐步解释 RLHF。主要失败模式有哪些？"
            )}
          >
            <div className="space-y-4 text-sm">
              <div className="space-y-3">
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("Step 1 — Supervised Fine-Tuning (SFT)", "第一步 — 监督微调（SFT）")}
                  </p>
                  <p className="mb-0 text-paper-800/70">
                    {t(
                      "Fine-tune the pre-trained LM on human-written demonstrations of desired behavior.",
                      "在人类编写的期望行为示范数据上对预训练语言模型进行微调。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("Step 2 — Reward Model (RM)", "第二步 — 奖励模型（RM）")}
                  </p>
                  <p className="mb-0 text-paper-800/70">
                    {t(
                      "Train a reward model on human preference comparisons using the Bradley-Terry loss.",
                      "使用 Bradley-Terry 损失在人类偏好比较数据上训练奖励模型。"
                    )}
                  </p>
                  <Math
                    display
                    tex="\mathcal{L}_{\text{RM}} = -\log \sigma\!\left(r(x, y_w) - r(x, y_l)\right)"
                  />
                </div>
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">
                    {t("Step 3 — PPO with KL constraint", "第三步 — 带 KL 约束的 PPO")}
                  </p>
                  <p className="mb-0 text-paper-800/70">
                    {t(
                      "Optimize the policy to maximize the reward model score while staying close to the SFT model via a KL divergence penalty.",
                      "通过 KL 散度惩罚约束，在最大化奖励模型得分的同时保持策略接近 SFT 模型。"
                    )}
                  </p>
                  <Math
                    display
                    tex="\max_{\pi_\theta}\; \mathbb{E}[r_\phi(x,y)] - \beta\, D_{\text{KL}}[\pi_\theta \| \pi_{\text{ref}}]"
                  />
                </div>
              </div>

              <Collapsible
                title={t("Main failure modes", "主要失败模式")}
                defaultOpen={false}
              >
                <div className="text-sm space-y-2">
                  <ul className="list-disc pl-5 space-y-2 mb-0">
                    <li>
                      <strong>{t("Reward hacking", "奖励欺骗")}</strong>
                      {": "}
                      {t(
                        "Model learns to exploit RM flaws — produces long verbose answers, sycophantic responses, or format tricks that fool the RM without being genuinely helpful.",
                        "模型学会利用 RM 的漏洞 — 产生冗长啰嗦的回答、谄媚响应或格式技巧，欺骗 RM 但实际并不有用。"
                      )}
                    </li>
                    <li>
                      <strong>{t("KL constraint too loose", "KL 约束过松")}</strong>
                      {": "}
                      {t(
                        "Policy diverges from SFT distribution and loses general helpfulness.",
                        "策略偏离 SFT 分布，丧失通用有用性。"
                      )}
                    </li>
                    <li>
                      <strong>{t("RM distributional shift", "RM 分布偏移")}</strong>
                      {": "}
                      {t(
                        "RM was only trained on human preference pairs, not on the model's own outputs — may give unreliable scores out-of-distribution.",
                        "RM 只在人类偏好对上训练，未见过模型自身输出 — 在分布外可能给出不可靠的分数。"
                      )}
                    </li>
                    <li>
                      <strong>{t("Mode collapse", "模式坍塌")}</strong>
                      {": "}
                      {t(
                        "Policy collapses to a few high-reward responses, losing response diversity.",
                        "策略坍塌为少数高奖励响应，丧失输出多样性。"
                      )}
                    </li>
                  </ul>
                </div>
              </Collapsible>
            </div>
          </Collapsible>

          {/* Q14 */}
          <Collapsible
            title={t(
              "Q14: What's the difference between PPO, DPO, and GRPO?",
              "问14：PPO、DPO 与 GRPO 有何区别？"
            )}
          >
            <div className="space-y-4 text-sm">
              <div className="grid gap-3">
                <div className="p-3 bg-paper-50 rounded-lg border border-paper-200">
                  <p className="font-semibold mb-1">PPO</p>
                  <p className="mb-0 text-paper-800/70">
                    {t(
                      "Requires a reward model and a value network (critic). Online RL — generates new samples at each step. KL penalty against reference policy. Most powerful, but most complex and expensive to run.",
                      "需要奖励模型和价值网络（critic）。在线 RL — 每步生成新样本。有参考策略的 KL 惩罚。最强大，但最复杂、运行成本最高。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                  <p className="font-semibold text-blue-800 mb-1">DPO</p>
                  <p className="mb-0 text-blue-900">
                    {t(
                      "No reward model, no RL. Analytically reparameterizes the RLHF objective into a classification loss on preference pairs. Offline — trains on a fixed dataset. Simple and stable, but cannot explore new data.",
                      "无奖励模型，无 RL。将 RLHF 目标解析重参数化为偏好对上的分类损失。离线 — 在固定数据集上训练。简单稳定，但无法探索新数据。"
                    )}
                  </p>
                  <Math
                    display
                    tex="\mathcal{L}_{\text{DPO}} = -\mathbb{E}\!\left[\log \sigma\!\left(\beta \log \frac{\pi_\theta(y_w|x)}{\pi_{\text{ref}}(y_w|x)} - \beta \log \frac{\pi_\theta(y_l|x)}{\pi_{\text{ref}}(y_l|x)}\right)\right]"
                  />
                </div>
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40">
                  <p className="font-semibold text-violet-800 mb-1">
                    {t("GRPO (DeepSeek-R1)", "GRPO（DeepSeek-R1）")}
                  </p>
                  <p className="mb-0 text-violet-900">
                    {t(
                      "Like PPO but replaces the critic (value network) with group-relative baselines. Sample G responses per prompt, normalize rewards within the group to compute advantages. Online but no critic network needed — middle ground between PPO and DPO.",
                      "类似 PPO，但用组相对基线替代 critic（价值网络）。每个提示采样 G 个响应，在组内归一化奖励以计算优势。在线但无需 critic 网络 — PPO 与 DPO 的折中方案。"
                    )}
                  </p>
                  <Math
                    display
                    tex="\hat{A}_i = \frac{r_i - \text{mean}(\{r_j\}_{j=1}^G)}{\text{std}(\{r_j\}_{j=1}^G)}"
                  />
                </div>
              </div>

              <KeyInsight
                en="PPO: most flexible, most expensive. DPO: simplest, offline only. GRPO: online training without a critic, used in DeepSeek-R1 to train strong reasoning."
                zh="PPO：最灵活，最昂贵。DPO：最简单，仅离线。GRPO：无 critic 的在线训练，DeepSeek-R1 用它训练强推理能力。"
                t={t}
              />
            </div>
          </Collapsible>
        </div>

        {/* ════════════════════════════════════════════
            SECTION 5 — INFERENCE & DEPLOYMENT
        ════════════════════════════════════════════ */}
        <div id="inference">
          <SectionHeader
            number="05"
            en="Inference & Deployment"
            zh="推理与部署"
            color="blue"
            t={t}
          />

          {/* Q19 */}
          <Collapsible
            title={t(
              "Q19: What is LLM quantization? Compare INT8 and INT4.",
              "问19：什么是 LLM 量化？比较 INT8 与 INT4。"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Quantization reduces model precision from FP16/BF16 to lower-bit integer formats to save memory and accelerate inference. The two main approaches are Post-Training Quantization (PTQ) — quantize after training, no gradient needed — and Quantization-Aware Training (QAT) — simulate quantization during training.",
                  "量化将模型精度从 FP16/BF16 降低到低位整数格式，以节省内存并加速推理。主要分两类：训练后量化（PTQ）— 训练后量化，无需梯度；量化感知训练（QAT）— 训练中模拟量化。"
                )}
              </p>
              <div className="grid gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/40">
                  <p className="font-semibold text-blue-800 mb-1">{t("W8A8 (INT8 weights + activations)", "W8A8（INT8 权重 + 激活）")}</p>
                  <p className="mb-0 text-blue-900 dark:text-blue-200">
                    {t(
                      "2× memory reduction vs FP16. Near-lossless quality for most tasks. Used by: LLM.int8() (bitsandbytes), SmoothQuant. Supported natively on modern NVIDIA GPUs (tensor cores).",
                      "相比 FP16 内存减半。大多数任务质量几乎无损。代表方案：LLM.int8()（bitsandbytes）、SmoothQuant。现代 NVIDIA GPU 原生支持（Tensor Core）。"
                    )}
                  </p>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 dark:bg-violet-900/20 dark:border-violet-700/40">
                  <p className="font-semibold text-violet-800 mb-1">{t("W4A16 (INT4 weights, FP16 activations)", "W4A16（INT4 权重，FP16 激活）")}</p>
                  <p className="mb-0 text-violet-900 dark:text-violet-200">
                    {t(
                      "4× memory reduction vs FP16 for weights. Small quality degradation if done carefully. Representative methods: GPTQ (layer-by-layer Hessian-guided quantization), AWQ (activations-aware weight quantization — scales weights by activation magnitude). GGUF format used by llama.cpp.",
                      "权重相比 FP16 内存减少 4 倍。谨慎操作下质量损失较小。代表方案：GPTQ（逐层 Hessian 引导量化）、AWQ（激活感知权重量化 — 按激活幅度缩放权重）。llama.cpp 使用 GGUF 格式。"
                    )}
                  </p>
                </div>
              </div>
              <KeyInsight
                en="Rule of thumb: a 7B FP16 model needs ~14 GB VRAM. INT8 → ~7 GB. INT4 → ~4 GB. This determines which consumer GPU can run it."
                zh="经验法则：7B FP16 模型约需 14 GB 显存。INT8 → 约 7 GB。INT4 → 约 4 GB。这决定了哪款消费级显卡能跑起来。"
                t={t}
              />
            </div>
          </Collapsible>

          {/* Q20 */}
          <Collapsible
            title={t(
              "Q20: How does speculative decoding work?",
              "问20：投机采样（Speculative Decoding）的工作原理？"
            )}
          >
            <div className="space-y-4 text-sm">
              <p>
                {t(
                  "Autoregressive generation is memory-bandwidth-bound: the large model runs one forward pass per token, but GPUs are underutilized because the batch size is 1. Speculative decoding uses a small, fast draft model to propose multiple tokens at once, then verifies them in a single parallel pass of the large model.",
                  "自回归生成受内存带宽瓶颈限制：大模型每 token 进行一次前向传播，但 batch size 为 1 导致 GPU 利用率低。投机采样使用一个小型快速草稿模型一次提出多个 token，然后用大模型一次并行验证。"
                )}
              </p>
              <div className="space-y-2">
                {[
                  { step: "1", en: "Draft model generates k tokens autoregressively (fast, cheap).", zh: "草稿模型自回归生成 k 个 token（快速、低成本）。" },
                  { step: "2", en: "Target (large) model scores all k+1 positions in one forward pass — same cost as generating 1 token.", zh: "目标（大）模型一次前向传播对全部 k+1 个位置打分 — 代价等同生成 1 个 token。" },
                  { step: "3", en: "Accept/reject each draft token via a sampling criterion that preserves the target distribution exactly.", zh: "通过采样准则对每个草稿 token 接受/拒绝，精确保持目标分布不变。" },
                  { step: "4", en: "If all k accepted: k+1 tokens generated at the cost of ~1 large model pass.", zh: "若全部 k 个被接受：以约 1 次大模型前向传播的代价生成 k+1 个 token。" },
                ].map(({ step, en, zh }) => (
                  <div key={step} className="flex gap-3 p-3 bg-paper-50 rounded-lg border border-paper-200 dark:bg-slate-800/50 dark:border-slate-700">
                    <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-paper-900 dark:bg-slate-600 text-white text-xs font-bold">{step}</span>
                    <p className="mb-0 text-paper-800/80 dark:text-slate-300">{t(en, zh)}</p>
                  </div>
                ))}
              </div>
              <KeyInsight
                en="Speedup factor ≈ expected acceptance length. Works best when draft and target agree often (same family, e.g., LLaMA-68M drafting for LLaMA-70B). Used in production by Google, Meta, and others. Self-speculative decoding uses early exit layers of the same model as the draft."
                zh="加速倍数 ≈ 预期接受长度。草稿与目标分布越接近效果越好（如同系列模型：LLaMA-68M 为 LLaMA-70B 起草）。已被 Google、Meta 等用于生产环境。自投机解码用同模型早退出层作为草稿。"
                t={t}
              />
            </div>
          </Collapsible>
        </div>

        {/* ── Footer note ── */}
        <div className="mt-16 pt-6 border-t border-paper-200 text-xs text-paper-800/40">
          {t(
            "20 questions across 5 categories. More coming soon.",
            "5 个类别共 20 题。持续更新中。"
          )}
        </div>
      </article>
      </section>
    </div>
  );
}
