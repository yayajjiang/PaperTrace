"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax-M2 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>模型定位</strong>：全球首批将 Transformer 与 Linear Attention(闪电注意力 Lightning Attention)深度融合的开源旗舰。</p>
</blockquote>
<h2 id="1-hxpjtp">1. 核心瓶颈突破</h2>
<p>在极长上下文(百万级别)下，传统 Softmax Attention 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 计算复杂度与内存占用是毁灭性的。M2 通过引入 Lightning Attention，将复杂度降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span></span></span>，使得在普通硬件上跑通超长文成为可能。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxpjtp","text":"1. 核心瓶颈突破"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/02-mini-max-m2/01-mini-max-m2-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/02-mini-max-m2/01-mini-max-m2-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax-M2 技术报告精译</h1>
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
