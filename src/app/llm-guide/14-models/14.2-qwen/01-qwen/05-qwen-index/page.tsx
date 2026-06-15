"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<p>Qwen 初代系列模型的技术报告精译与核心技术专题文档。该目录关注 Qwen 1.0 如何在 LLaMA 风格架构基础上，通过多语言词表、数据工程、推理期长上下文扩展、SFT/RLHF 对齐和专用模型分支，建立通义千问后续系列的技术底座。</p>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen 1.0 需要解决的是一个复合问题：在 1.8B/7B/14B 这些开发者可部署规模上，构建同时具备中文、多语言、代码、数学、工具调用和对话能力的开源基座模型。</p>
<p>这个目标包含几个约束：</p>
<ul>
<li>中文和多语言文本必须有更高 token 压缩率，否则上下文窗口和推理成本会被分词效率拖垮。</li>
<li>模型需要在成熟 Transformer 架构上稳定训练，而不是依赖高风险结构创新。</li>
<li>2048 训练上下文需要在推理阶段扩展，否则长文档和 Agent 场景会受限。</li>
<li>对话模型不能只做 SFT，还需要奖励模型和 RLHF 改善人类偏好对齐。</li>
<li>代码、数学和工具使用能力需要从通用基座中派生，而不是割裂成互不兼容的模型。</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen 的方法可以拆成五层。</p>
<p>第一层是数据工程。预训练数据覆盖网页、百科、书籍、代码等来源，并使用精确去重、MinHash/LSH 模糊去重、质量评分、人工抽检和 benchmark 去污染。报告中特别强调预训练阶段混入高质量指令数据，这使模型在进入 SFT 前已经具备一定指令感知能力。</p>
<p>第二层是 tokenizer。Qwen 以 tiktoken 的 cl100k base 为起点，扩展常用中文字词和多语言词项，形成约 152K 词表。这个设计牺牲了一部分 embedding 参数效率，但换取中文、多语言和代码的压缩率。</p>
<p>第三层是模型架构。Qwen 沿用 LLaMA 风格 Transformer，同时采用 untied embedding、FP32 RoPE 逆频率矩阵、QKV bias、RMSNorm、SwiGLU 和 Flash Attention。这些改动偏向稳定性、外推性和训练效率。</p>
<p>第四层是长上下文扩展。Qwen 在推理阶段组合 dynamic NTK-aware interpolation、LogN-Scaling 和分层 window attention，使 2048 训练长度的模型可以在更长上下文下保持可用困惑度。</p>
<p>第五层是对齐和专用化。Qwen-Chat 使用 ChatML、SFT、奖励模型与 PPO/RLHF; Code-Qwen 通过代码继续预训练和代码对话 SFT 获得代码能力; Math-Qwen 则用数学指令数据进行针对性 SFT。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>Qwen 1.0 的工程价值在于“成熟架构 + 数据和推理优化”的组合。它没有在基础网络结构上追求激进创新，而是把工程预算投入到更直接影响产品体验的部分：分词压缩率、数据质量、对齐格式、长上下文推理和工具调用。</p>
<p>这种路线有几个好处：</p>
<ul>
<li>架构风险低，训练稳定性更容易控制。</li>
<li>多语言和中文能力可以通过 tokenizer 与数据配比获得直接收益。</li>
<li>推理期长上下文方案不需要重训模型，适合快速上线。</li>
<li>ChatML 形成统一对话协议，便于后续模型继承。</li>
<li>通用基座可以派生代码、数学、多模态分支，降低生态碎片化。</li>
</ul>
<p>但它也有边界：</p>
<ul>
<li>标准 MHA 缺少 GQA，KV cache 成本高于后续 Qwen2 类模型。</li>
<li>原生训练上下文仍是 2048，推理扩展不能完全替代长上下文训练。</li>
<li>152K 大词表提升中文效率，但增加 embedding 与输出层参数占比。</li>
<li>RLHF 细节依赖内部数据和标注体系，外部复现难度较高。</li>
</ul>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen 1.0 更适合被理解为通义千问家族的技术起点，而不是最终形态。它证明了在 LLaMA 风格架构上，通过高质量中英文数据、多语言 tokenizer、推理期上下文扩展和对齐工程，可以在 14B 级别形成强中文、强代码、强数学和可用 Agent 能力。</p>
<p>如果关注现代生产部署，应继续阅读 Qwen2、Qwen2.5 和 Qwen2.5-Coder 等后续目录，因为它们在 GQA、上下文长度、代码能力、训练规模和对齐质量上补齐了 Qwen 1.0 的局限。若关注技术演进史和中文开源模型路线，Qwen 1.0 是必须阅读的基线文档。</p>
<h2 id="zwd">子文档</h2>
<ul>
<li><a href="/llm-guide/14-models/14.2-qwen/01-qwen/01-qwen-jsbgjy">01-Qwen 技术报告精译</a></li>
<li><a href="#broken-link">04-Qwen MinerU 中文精译</a></li>
<li><a href="/llm-guide/14-models/14.2-qwen/01-qwen/05-qwen-architecture-overview">05-Qwen 架构总览</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"},{"level":2,"id":"zwd","text":"子文档"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/01-qwen/05-qwen-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/01-qwen/05-qwen-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen</h1>
          <p className="text-paper-800/50">{t("From LLM Guide", "来自 LLM 指南")}</p>
        </header>
        <article
          className="paper-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-paper-200 dark:border-slate-700 bg-paper-50 dark:bg-slate-900">
        <LlmGuideToc items={toc} />
      </aside>
    </div>
  );
}
