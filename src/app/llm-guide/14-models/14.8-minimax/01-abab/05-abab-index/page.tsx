"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ABAB-初代 核心技术专题索引</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<h2 id="1-jswtdyybj-technical-problem-definition">1. 技术问题定义与背景 (Technical Problem Definition)</h2>
<p>MiniMax 是国内最早一批跑通万亿参数 MoE 和多模态(语音、文本并重)的大模型创业公司。其初代的 ABAB 模型在发布时面临的技术挑战与同期其他国产大模型有显著不同，其最大的差异化在于<strong>拟人化交互(Character AI)与高表现力语音合成的底层绑定</strong>。</p>
<p>核心需要解决的问题：</p>
<ol>
<li><strong>多模态与人格化对齐</strong>：如何让语言模型不仅仅输出冷冰冰的知识，而是具备角色扮演能力，并能生成带有情绪标签的输出以供后端的 TTS(Text-to-Speech)引擎使用。</li>
<li><strong>早期 MoE 的工程探索</strong>：在缺乏开源成熟框架的早期，如何自研一套能够有效调度的混合专家系统，使得百亿甚至千亿级别的参数能够在云端低延迟并发。</li>
</ol>
<h2 id="2-fflcj-method-breakdown">2. 方法论拆解 (Method Breakdown)</h2>
<h3 id="2-1-gdnrhzlwt-character-aligned-sft">2.1 高度拟人化指令微调 (Character-aligned SFT)</h3>
<p>ABAB 初代的后训练(Post-Training)极度侧重于人类风格的对话和情绪注入。它采用了大规模的人类情感标注数据集：</p>
<ul>
<li>模型不仅生成文本内容，还在生成的同时预测出隐含的“情绪标签”和“语速/语调提示”。</li>
<li>配合 RLHF 机制，让模型学会根据 System Prompt 中的设定维持稳定的人设。</li>
</ul>
<h3 id="2-2-zq-moe-lyjg">2.2 早期 MoE 路由架构</h3>
<p>ABAB 系列早期即采用了 MoE 架构。与 DeepSeek 的无辅助损失策略不同，早期的 ABAB 采用了较为经典的 Top-2 门控机制，并对专家容量(Expert Capacity)进行了严格的截断限制。</p>
<pre><code class="language-mermaid">graph TD
    A[Token Input] --&gt; B[Router / Gating Network]
    B --&gt;|Score &gt; Threshold| C[Expert 1: Logic]
    B --&gt;|Score &gt; Threshold| D[Expert 4: Roleplay]
    B -.-&gt;|Score &lt; Threshold| E[Expert 2: Code - Dropped]
    C --&gt; F[Weighted Sum]
    D --&gt; F
    F --&gt; G[Next Layer]
    
    style B fill:#ffebee,stroke:#c62828
    style F fill:#e8f5e9,stroke:#2e7d32
</code></pre>
<h3 id="2-3-wb-yylhtdycyh-text-to-speech-joint-optimization">2.3 文本-语音联合推断延迟优化 (Text-to-Speech Joint Optimization)</h3>
<p>为了服务于其核心产品(如星野)，ABAB 模型的生成不仅追求 TPOT(每 Token 耗时)短，更追求与自研 TTS 的流水线对接。</p>
<ul>
<li><strong>Chunked Streaming</strong>：语言模型输出的 Token 会按照语法和语义意群(而非按个字)进行 Chunk 打包，第一时间送入语音合成，实现极其平滑的语音对话体验。</li>
</ul>
<h2 id="3-gcfxybjjx-engineering-amp-boundaries">3. 工程分析与边界局限 (Engineering &amp; Boundaries)</h2>
<p><strong>工程亮点</strong>：</p>
<ul>
<li>ABAB 初代证明了“应用驱动模型”的价值。在模型绝对逻辑能力尚未登顶时，通过极强的人设对齐和工程化的流式 TTS 结合，依然能打造出护城河极深的消费级应用。</li>
</ul>
<p><strong>局限性</strong>：</p>
<ul>
<li><strong>技术透明度极低</strong>：初代 ABAB 几乎没有发布任何严谨的技术报告或论文，大量技术细节依赖外部评测与猜测。</li>
<li><strong>严重偏科</strong>：在偏向代码、高阶数学和严肃长文档推理的场景下，初代 ABAB 经常表现出幻觉或逻辑链条断裂。其过度拟人化的 SFT 在某些客观事实类 Benchmark 上起到了反效果。</li>
</ul>
<hr>
<h2 id="4-zwdyzy">4. 子文档与资源</h2>
<h3 id="hxjx">核心解析</h3>
<ul>
<li><a href="/llm-guide/14-models/14.8-minimax/01-abab/01-abab-cdjsbwfx">ABAB初代技术博文分析</a></li>
<li><a href="#broken-link">ABAB初代核心架构剖析</a></li>
</ul>
<h3 id="fjzy">附加资源</h3>
<ul>
<li><a href="#">images</a></li>
<li><a href="#">pdfs</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jswtdyybj-technical-problem-definition","text":"1. 技术问题定义与背景 (Technical Problem Definition)"},{"level":2,"id":"2-fflcj-method-breakdown","text":"2. 方法论拆解 (Method Breakdown)"},{"level":3,"id":"2-1-gdnrhzlwt-character-aligned-sft","text":"2.1 高度拟人化指令微调 (Character-aligned SFT)"},{"level":3,"id":"2-2-zq-moe-lyjg","text":"2.2 早期 MoE 路由架构"},{"level":3,"id":"2-3-wb-yylhtdycyh-text-to-speech-joint-optimization","text":"2.3 文本-语音联合推断延迟优化 (Text-to-Speech Joint Optimization)"},{"level":2,"id":"3-gcfxybjjx-engineering-amp-boundaries","text":"3. 工程分析与边界局限 (Engineering &amp; Boundaries)"},{"level":2,"id":"4-zwdyzy","text":"4. 子文档与资源"},{"level":3,"id":"hxjx","text":"核心解析"},{"level":3,"id":"fjzy","text":"附加资源"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/01-abab/05-abab-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/01-abab/05-abab-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ABAB-初代 核心技术专题索引</h1>
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
