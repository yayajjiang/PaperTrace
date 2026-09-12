"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemini 家族演进总览</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14-models">返回 第 14 章：主流开源模型全景解析与技术报告精读</a></strong></p>
</blockquote>
<p>作为 Google 汇聚 Google Brain 与 DeepMind 全力打造的反击利器，Gemini 家族代表了全球多模态基础模型的最高工业标准。</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>核心特性</th>
<th>D2 精译</th>
<th>D5 专题</th>
</tr>
</thead>
<tbody><tr>
<td>01-Gemini-1.0</td>
<td>开启原生多模态时代 (Ultra/Pro/Nano)</td>
<td><a href="/llm-guide/14-models/14.11-gemini/01-gemini-1.0/01-01-gemini-1.0-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/01-gemini-1.0/05-01-gemini-1.0-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>02-Gemini-1.5-Pro</td>
<td>100万上下文与MoE架构的引入</td>
<td><a href="/llm-guide/14-models/14.11-gemini/02-gemini-1.5-pro/01-02-gemini-1.5-pro-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/02-gemini-1.5-pro/05-02-gemini-1.5-pro-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>03-Gemini-1.5-Flash</td>
<td>高频API调用的极致速度优化</td>
<td><a href="/llm-guide/14-models/14.11-gemini/03-gemini-1.5-flash/01-03-gemini-1.5-flash-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/03-gemini-1.5-flash/05-03-gemini-1.5-flash-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>04-Gemini-1.5-Flash-8B</td>
<td>端侧与边缘计算的微型巨头</td>
<td><a href="/llm-guide/14-models/14.11-gemini/04-gemini-1.5-flash-8b/01-04-gemini-1.5-flash-8b-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/04-gemini-1.5-flash-8b/05-04-gemini-1.5-flash-8b-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>05-Gemini-2.0-Pro</td>
<td>全模态原生与空间智能突破</td>
<td><a href="/llm-guide/14-models/14.11-gemini/05-gemini-2.0-pro/01-05-gemini-2.0-pro-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/05-gemini-2.0-pro/05-05-gemini-2.0-pro-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>06-Gemini-2.0-Flash</td>
<td>取代 1.5 Pro 的性价比王者</td>
<td><a href="/llm-guide/14-models/14.11-gemini/06-gemini-2.0-flash/01-06-gemini-2.0-flash-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/06-gemini-2.0-flash/05-06-gemini-2.0-flash-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>07-Gemini-2.0-Flash-Thinking</td>
<td>内置隐式思考链</td>
<td><a href="/llm-guide/14-models/14.11-gemini/07-gemini-2.0-flash-thinking/01-07-gemini-2.0-flash-thinking-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/07-gemini-2.0-flash-thinking/05-07-gemini-2.0-flash-thinking-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>08-Gemini-2.5-Pro</td>
<td>超大规模强化学习与物理世界模拟</td>
<td><a href="/llm-guide/14-models/14.11-gemini/08-gemini-2.5-pro/01-08-gemini-2.5-pro-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/08-gemini-2.5-pro/05-08-gemini-2.5-pro-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>09-Gemini-2.5-Flash</td>
<td>端到端低延迟语音交互霸主</td>
<td><a href="/llm-guide/14-models/14.11-gemini/09-gemini-2.5-flash/01-09-gemini-2.5-flash-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/09-gemini-2.5-flash/05-09-gemini-2.5-flash-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>10-Project-Astra</td>
<td>实时视觉与语音多模态全双工 Agent</td>
<td><a href="/llm-guide/14-models/14.11-gemini/10-project-astra/01-10-project-astra-jsbgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.11-gemini/10-project-astra/05-10-project-astra-hxjszt">D5入口</a></td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/14.11-gemini" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/14.11-gemini" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemini 家族演进总览</h1>
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
