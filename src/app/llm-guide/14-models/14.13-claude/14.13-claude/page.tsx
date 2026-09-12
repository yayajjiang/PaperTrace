"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Claude 家族演进总览</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14-models">返回 第 14 章：主流开源模型全景解析与技术报告精读</a></strong></p>
</blockquote>
<p>Anthropic 走了一条与 OpenAI 截然不同的道路：将“安全可控 (Helpful, Honest, Harmless)”放在首位。通过 Constitutional AI 和 RLAIF 机制，Claude 家族不仅在代码与长文能力上登峰造极，更是首创了 Artifacts 界面与原生 Computer Use 操作。</p>
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
<td>01-Claude-1</td>
<td>Constitutional AI (宪法AI) 的初试啼声</td>
<td><a href="/llm-guide/14-models/14.13-claude/01-claude-1/01-01-claude-1-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/01-claude-1/05-01-claude-1-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>02-Claude-2</td>
<td>超长上下文 (100K) 的领跑者</td>
<td><a href="/llm-guide/14-models/14.13-claude/02-claude-2/01-02-claude-2-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/02-claude-2/05-02-claude-2-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>03-Claude-2.1</td>
<td>幻觉抑制与 200K 窗口扩展</td>
<td><a href="/llm-guide/14-models/14.13-claude/03-claude-2.1/01-03-claude-2.1-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/03-claude-2.1/05-03-claude-2.1-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>04-Claude-3-Haiku</td>
<td>极致响应速度的端侧小钢炮</td>
<td><a href="/llm-guide/14-models/14.13-claude/04-claude-3-haiku/01-04-claude-3-haiku-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/04-claude-3-haiku/05-04-claude-3-haiku-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>05-Claude-3-Sonnet</td>
<td>企业级多模态生产力中枢</td>
<td><a href="/llm-guide/14-models/14.13-claude/05-claude-3-sonnet/01-05-claude-3-sonnet-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/05-claude-3-sonnet/05-05-claude-3-sonnet-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>06-Claude-3-Opus</td>
<td>全面反超 GPT-4 的巅峰之作</td>
<td><a href="/llm-guide/14-models/14.13-claude/06-claude-3-opus/01-06-claude-3-opus-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/06-claude-3-opus/05-06-claude-3-opus-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>07-Claude-3.5-Sonnet</td>
<td>编码之神与交互式工件 (Artifacts)</td>
<td><a href="/llm-guide/14-models/14.13-claude/07-claude-3.5-sonnet/01-07-claude-3.5-sonnet-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/07-claude-3.5-sonnet/05-07-claude-3.5-sonnet-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>08-Claude-3.5-Haiku</td>
<td>算力成本的最优解</td>
<td><a href="/llm-guide/14-models/14.13-claude/08-claude-3.5-haiku/01-08-claude-3.5-haiku-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/08-claude-3.5-haiku/05-08-claude-3.5-haiku-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>09-Claude-Computer-Use</td>
<td>突破沙盒的系统级图形界面接管</td>
<td><a href="/llm-guide/14-models/14.13-claude/09-claude-computer-use/01-09-claude-computer-use-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/09-claude-computer-use/05-09-claude-computer-use-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>10-Claude-3.7-Sonnet</td>
<td>混合推理(Hybrid Reasoning)的混合巨兽</td>
<td><a href="/llm-guide/14-models/14.13-claude/10-claude-3.7-sonnet/01-10-claude-3.7-sonnet-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/10-claude-3.7-sonnet/05-10-claude-3.7-sonnet-hxjszt">D5入口</a></td>
</tr>
<tr>
<td>11-Claude-4</td>
<td>Anthropic 新一代安全与智能边界探索</td>
<td><a href="/llm-guide/14-models/14.13-claude/11-claude-4/01-11-claude-4-jgjy">D2入口</a></td>
<td><a href="/llm-guide/14-models/14.13-claude/11-claude-4/05-11-claude-4-hxjszt">D5入口</a></td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.13-claude/14.13-claude" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.13-claude/14.13-claude" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Claude 家族演进总览</h1>
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
