"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>ChatGLM 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.6-glm/14.6-glm">14.6-GLM</a></p>
</blockquote>
<p>ChatGLM 是智谱 GLM 家族的<strong>对话与对齐产品线</strong>, 从 ChatGLM-6B(2023-03) 演进到 GLM-4 / GLM-4 All Tools(2024). 本目录覆盖 <strong>GLM-130B → 三代 ChatGLM → GLM-4</strong> 的谱系技术报告(arXiv:2406.12793).</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.6-glm/02-chat-glm/01-chat-glm-xljsbgjy">01-ChatGLM 系列技术报告精译</a></td>
<td>中文精译主稿(D2)</td>
</tr>
<tr>
<td><a href="#broken-link">03-ChatGLM-mineru-en</a></td>
<td>MinerU 英文原文(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-ChatGLM-mineru-zh</a></td>
<td>逐段精译与译者注(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.6-glm/02-chat-glm/02-chat-glm-hxjgpx">02-ChatGLM 核心架构剖析</a></td>
<td>架构与开源生态(D2)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.6-glm/02-chat-glm/05-chat-glm-architecture-overview">05-ChatGLM-Architecture-Overview</a></td>
<td>GLM-4 能力专题</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>ChatGLM 系列要解决的核心问题是: 在 GLM-130B 基座之上, 如何构建<strong>持续迭代的中文对话模型</strong>, 并最终达到与 GPT-4 可比的通用能力, 同时保持开源小模型(6B/9B)与 API 大模型的双线生态.</p>
<p>关键挑战:</p>
<ol>
<li><strong>谱系连续性</strong>: 不是单次发布, 而是 ChatGLM → ChatGLM2 → ChatGLM3 → GLM-4 的能力累积.</li>
<li><strong>中英双语对齐</strong>: 10T+ token 预训练 + 多阶段 SFT/RLHF, 中文 AlignBench 需领先 GPT-4.</li>
<li><strong>Agent 化</strong>: GLM-4 All Tools 需自主决定何时调用浏览器、Python、文生图等工具.</li>
</ol>
<h2 id="ffcj">方法拆解</h2>
<p><strong>预训练与架构</strong></p>
<ul>
<li>继承 GLM 空白填充 + 双语语料(中英为主, 24 语言辅助).</li>
<li>GLM-4 系列: 10T tokens, 128K/1M 长上下文变体.</li>
</ul>
<p><strong>对齐流水线</strong></p>
<ul>
<li>多阶段 post-training: SFT → RLHF/DPO 类人类反馈对齐.</li>
<li>指令跟随(IFEval)、长上下文、代码、函数调用分项优化.</li>
</ul>
<p><strong>GLM-4 All Tools</strong></p>
<ul>
<li>统一 agent 框架: 理解意图 → 选择工具(网页/Python/图像/用户函数) → 多步执行.</li>
<li>与 GPT-4 All Tools 对标 Web 浏览与数学求解.</li>
</ul>
<p><strong>开源生态</strong></p>
<ul>
<li>ChatGLM-6B 三代、GLM-4-9B(128K/1M)、GLM-4V-9B、WebGLM、CodeGeeX 等.</li>
<li>HuggingFace 2023 年下载量 1000 万+.</li>
</ul>
<h2 id="gcyjgfx">工程与架构分析</h2>
<table>
<thead>
<tr>
<th>维度</th>
<th>要点</th>
</tr>
</thead>
<tbody><tr>
<td>产品分层</td>
<td>API 旗舰(GLM-4) + 开源可部署(6B/9B)</td>
</tr>
<tr>
<td>能力栈</td>
<td>对话 → 代码 → 视觉 → Agent → All Tools</td>
</tr>
<tr>
<td>评测</td>
<td>MMLU/GSM8K/HumanEval + AlignBench(中文) + IFEval</td>
</tr>
<tr>
<td>安全</td>
<td>独立 Safety and Risks 章节</td>
</tr>
</tbody></table>
<p><strong>与 GLM-130B 关系</strong>: 130B 是基座论文; ChatGLM 是对齐与产品化主线; GLM-4 是能力收敛点.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用</strong>: 研究中国大模型谱系演化、双语对齐、开源+API 双轨策略、工具型 Agent 系统.</p>
<p><strong>边界</strong>:</p>
<ul>
<li>报告以 GLM-4 为主, 早期 ChatGLM-6B 细节相对简略.</li>
<li>部分 benchmark 为自测或特定 harness, 与第三方复现有偏差可能.</li>
<li>All Tools 能力依赖外部工具链稳定性.</li>
<li>闭源满血 GLM-4 与开源 9B 能力差距显著.</li>
</ul>
<p><strong>谱系</strong>: GLM-130B → ChatGLM(1/2/3) → <strong>GLM-4 / All Tools</strong> → 后续 GLM-4.5V / GLM-5 系列.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/02-chat-glm/05-chat-glm-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/02-chat-glm/05-chat-glm-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ChatGLM Index</h1>
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
