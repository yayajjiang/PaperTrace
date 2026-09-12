"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi-K2.6 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">14.5-Kimi</a></p>
</blockquote>
<p>Kimi K2.6(2026-04, 无独立 PDF)是 Moonshot 最新开源旗舰: <strong>同 K2.5 架构</strong>, post-training 强化长程编码与 Agent Swarm(300 子 Agent / 4000 步). SWE-Bench Pro <strong>58.6%</strong>, Verified <strong>80.2%</strong>, 256K 上下文.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.5-kimi/04-kimi-k2.6/01-kimi-k2.6-jsbgjy">01-Kimi-K2.6 技术报告精译</a></td>
<td>博客中文精译(D2, 完整 benchmark)</td>
</tr>
<tr>
<td><a href="#broken-link">03-Kimi-K2.6-mineru-en</a></td>
<td>英文源资料整理(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-Kimi-K2.6-mineru-zh</a></td>
<td>中文交付稿(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.5-kimi/04-kimi-k2.6/02-kimi-k2.6-dmty-agent-nlpx">02-Kimi-K2.6 多模态与 Agent 剖析</a></td>
<td>Swarm / Skills 专题</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>K2.5 已证明多模态 Agent Swarm 可行, 但生产级「自主软件工程师」需要:</p>
<ol>
<li><strong>更长上下文</strong>(整库级代码)与 <strong>更长运行时间</strong>(数小时 tool loop).</li>
<li><strong>更大并行规模</strong>(100→300 子 Agent)而不损失协调质量.</li>
<li><strong>可复用输出模式</strong>(Skills)而非一次性生成.</li>
</ol>
<p>K2.6 在<strong>不改变 1T/32B MoE 骨架</strong>的前提下, 通过后训练把这些边界推向前沿.</p>
<h2 id="ffcj">方法拆解</h2>
<ul>
<li><strong>Post-training 专精</strong>: 长程稳定性、指令遵循、Swarm 编排 RL; 无新预训练.</li>
<li><strong>Agent Swarm 3×</strong>: 300 并行子 Agent, 4000 协调步, PARL 学习编排(非 hand-crafted workflow).</li>
<li><strong>Skills</strong>: 文档→结构+风格+推理 DNA 的可复用模板.</li>
<li><strong>Coding-Driven Design</strong>: 自然语言 UI 意图→HTML/CSS/JS.</li>
<li><strong>Proactive Agent</strong>: 24/7 后台 + Open 模式; 框架下可达 5 天连续运行.</li>
</ul>
<h2 id="gcyjgfx">工程与架构分析</h2>
<table>
<thead>
<tr>
<th>项</th>
<th>K2.6</th>
</tr>
</thead>
<tbody><tr>
<td>基座</td>
<td>K2.5 同架构(MoE+MLA+MoonViT)</td>
</tr>
<tr>
<td>上下文</td>
<td>256K (K2.5 为 128K)</td>
</tr>
<tr>
<td>自托管</td>
<td>INT4 256K ≈ 8× H200 (~640GB)</td>
</tr>
<tr>
<td>API 定价</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.60</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.60/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.60/</span></span></span></span>4.00 per 1M (约为 GPT-5.5 输入 1/8)</td>
</tr>
<tr>
<td>权重</td>
<td><code>moonshotai/Kimi-K2.6</code> (Modified MIT)</td>
</tr>
</tbody></table>
<p><strong>工程启示</strong>: 2026 开源竞争焦点从「更大预训练」转向「后训练 + Agent 架构 + 长程可靠性」.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用</strong>: 长程编码 Agent、多 Agent 并行研究、成本敏感的企业 coding automation、Skills/模板化交付.</p>
<p><strong>不适用/谨慎</strong>: 纯数学推理顶尖场景(AIME/HLE 仍落后 GPT-5.4); 视觉 grounding 平均排名一般; 官方 benchmark 多为第一方报告; 12h/5d showcase 需生产验证.</p>
<p><strong>谱系</strong>: K2 → K2.5(多模态 Swarm) → <strong>K2.6(长程编码 + Swarm 3×)</strong>. Kimi 子队列 #23–#26 全部闭环.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/04-kimi-k2.6/05-kimi-k2.6-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/04-kimi-k2.6/05-kimi-k2.6-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi-K2.6 Index</h1>
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
