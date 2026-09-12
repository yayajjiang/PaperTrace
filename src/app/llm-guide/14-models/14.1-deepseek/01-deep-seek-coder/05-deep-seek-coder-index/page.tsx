"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>DeepSeek-Coder 是 DeepSeek 家族的第一款开源模型，专注于代码智能领域。</p>
</blockquote>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/01-deep-seek-coder/01-deep-seek-coder-jsbgjy">01-DeepSeek-Coder 技术报告精读</a></td>
<td align="left">技术报告全文精译</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/01-deep-seek-coder/02-deep-seek-coder-hxjgpx">02-DeepSeek-Coder 核心架构剖析</a></td>
<td align="left">核心架构深度剖析</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-architecture-overview">05-DeepSeek-Coder 架构总览</a></td>
<td align="left">架构与工程决策深度解读</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-Coder MinerU-EN</a></td>
<td align="left">原始英文 Markdown(MinerU 解析)</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-Coder MinerU-ZH</a></td>
<td align="left">中英对照+译者注(MinerU 解析)</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-Coder 的核心问题可以概括为：如何在“通用大模型”的训练与推理框架内，把对代码任务真正关键的能力系统化做强，包括代码补全、跨文件理解、指令跟随式编程、以及在真实工程约束下的可用性与可部署性。</p>
<p>在这份报告里，DeepSeek 团队把能力目标拆成了几类可测的任务面：</p>
<ul>
<li>代码生成与补全(含 Fill-in-the-Middle, FIM)</li>
<li>代码理解/推理(如 HumanEval/MBPP 等标准评测)</li>
<li>更贴近工程场景的交互式编码与多轮任务(例如带状态的小游戏、多轮修复)</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>这篇报告的方法主线很清晰，按“数据 → 训练目标 → 训练设置 → 评测/案例”推进：</p>
<ol>
<li>数据与任务构造：围绕代码语料、指令数据、以及更贴近开发流程的样例组织训练数据，并给出数据清洗与构建流程图。</li>
<li>训练目标与策略：重点包含 FIM 训练目标与对应的消融/曲线，展示它对代码补全与局部修改类任务的贡献。</li>
<li>训练配置与稳定性：给出优化器、学习率策略、阶段性缩放等训练细节，并用训练过程曲线对稳定性做侧面验证。</li>
<li>定性案例：用多轮互动任务、数据库分析、LeetCode 等案例，说明模型在“真实编码过程”中的表现特征与局限。</li>
</ol>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程交付角度，DeepSeek-Coder 的价值不只是“刷榜”，而是把若干关键能力做成了可复现的训练与评测链路：</p>
<ul>
<li>数据管线可视化：清洗/构建流程图把数据工程的关键步骤显式化，方便复现与迭代。</li>
<li>指标与曲线闭环：FIM 相关曲线与训练阶段基准曲线，提供了训练过程可诊断的抓手。</li>
<li>面向开发者场景：案例覆盖多轮任务与工具/状态交互，贴近“IDE 里写代码”的真实过程，而不是只停留在单轮生成。</li>
</ul>
<h2 id="jlysybj">结论与适用边界</h2>
<ul>
<li>适用：需要开源、可控、并且以“代码生成/补全/理解”为主的研发团队; 尤其是希望在本地或私有环境部署的场景。</li>
<li>边界：模型在复杂项目级任务上仍高度依赖数据覆盖与工具链集成; 仅靠模型本体很难替代完整的工程化流程(检索、构建、测试、静态分析等)。</li>
<li>建议使用方式：把它视为“编码能力底座”，再叠加检索/代码库索引、工具调用与自动化测试，效果会比单独聊天式使用更稳定。</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder</h1>
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
