"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OpenAI 家族演进总览</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14-models">返回 第 14 章：主流开源模型全景解析与技术报告精读</a></strong></p>
</blockquote>
<p>作为开启本轮 AI 革命的先驱, OpenAI 的架构演变史就是一部大语言模型发展的标准教科书。从早期的 Decoder-only 信仰, 到 RLHF 的工程奇迹, 再到 O1 开启的 System-2 强化学习新纪元, 本文档深入探测了其 15 代核心架构背后的机密。</p>
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
<td>01-GPT-1</td>
<td>无监督预训练的开山之作</td>
<td><a href="/llm-guide/14-models/14.12-openai/01-gpt-1/01-01-gpt-1-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/01-gpt-1/05-01-gpt-1-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>02-GPT-2</td>
<td>多任务学习与 Zero-Shot 的萌芽</td>
<td><a href="/llm-guide/14-models/14.12-openai/02-gpt-2/01-02-gpt-2-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/02-gpt-2/05-02-gpt-2-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>03-GPT-3</td>
<td>In-Context Learning 的算力暴力美学</td>
<td><a href="/llm-guide/14-models/14.12-openai/03-gpt-3/01-03-gpt-3-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/03-gpt-3/05-03-gpt-3-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>04-InstructGPT</td>
<td>RLHF 对齐人类意图的里程碑</td>
<td><a href="/llm-guide/14-models/14.12-openai/04-instruct-gpt/01-04-instruct-gpt-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/04-instruct-gpt/05-04-instruct-gpt-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>05-ChatGPT-3.5</td>
<td>引爆全球 AI 浪潮的对话引擎</td>
<td><a href="/llm-guide/14-models/14.12-openai/05-chat-gpt-3.5/01-05-chat-gpt-3.5-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/05-chat-gpt-3.5/05-05-chat-gpt-3.5-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>06-GPT-4</td>
<td>跨越模态界限的专家混合架构 (MoE)</td>
<td><a href="/llm-guide/14-models/14.12-openai/06-gpt-4/01-06-gpt-4-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/06-gpt-4/05-06-gpt-4-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>07-GPT-4-Vision</td>
<td>视觉语言多模态的深度融合</td>
<td><a href="/llm-guide/14-models/14.12-openai/07-gpt-4-vision/01-07-gpt-4-vision-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/07-gpt-4-vision/05-07-gpt-4-vision-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>08-GPT-4-Turbo</td>
<td>128K上下文与极致性能优化</td>
<td><a href="/llm-guide/14-models/14.12-openai/08-gpt-4-turbo/01-08-gpt-4-turbo-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/08-gpt-4-turbo/05-08-gpt-4-turbo-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>09-GPT-4o</td>
<td>Omni 全模态端到端原生架构</td>
<td><a href="/llm-guide/14-models/14.12-openai/09-gpt-4o/01-09-gpt-4o-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/09-gpt-4o/05-09-gpt-4o-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>10-GPT-4o-mini</td>
<td>端侧与边缘的高性价比之王</td>
<td><a href="/llm-guide/14-models/14.12-openai/10-gpt-4o-mini/01-10-gpt-4o-mini-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/10-gpt-4o-mini/05-10-gpt-4o-mini-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>11-o1-preview</td>
<td>纯强化学习驱动的 System-2 思考引擎</td>
<td><a href="/llm-guide/14-models/14.12-openai/11-o1-preview/01-11-o1-preview-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/11-o1-preview/05-11-o1-preview-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>12-o1-mini</td>
<td>专攻数学与代码的轻量化推理巨头</td>
<td><a href="/llm-guide/14-models/14.12-openai/12-o1-mini/01-12-o1-mini-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/12-o1-mini/05-12-o1-mini-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>13-o1</td>
<td>完全体慢思考模型的终极形态</td>
<td><a href="/llm-guide/14-models/14.12-openai/13-o1/01-13-o1-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/13-o1/05-13-o1-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>14-o3-mini</td>
<td>推理成本极限压缩的新范式</td>
<td><a href="/llm-guide/14-models/14.12-openai/14-o3-mini/01-14-o3-mini-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/14-o3-mini/05-14-o3-mini-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>15-Operator-Agent</td>
<td>接管浏览器的自动化自主 Agent</td>
<td><a href="/llm-guide/14-models/14.12-openai/15-operator-agent/01-15-operator-agent-fxgcjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.12-openai/15-operator-agent/05-15-operator-agent-hxjszt">D5入口</a></td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/14.12-openai" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/14.12-openai" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OpenAI 家族演进总览</h1>
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
