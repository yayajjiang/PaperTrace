"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder-V2</h1>
<blockquote>
<p><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></p>
</blockquote>
<p>DeepSeek-Coder-V2 是 DeepSeek 在代码模型路线上的第一次旗舰级跃迁. 它不再只是“在代码上继续堆数据”, 而是把 DeepSeek-V2 的 MoE 基座、长上下文扩展、代码与数学混合训练、以及基于可执行反馈的 RL 对齐真正组合成一个面向工程落地的代码助手体系.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/04-deep-seek-coder-v2/01-deep-seek-coder-v2-jsbgjy">01-DeepSeek-Coder-V2 技术报告精译</a></td>
<td align="left">完整技术报告的中文精译与延伸说明</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/04-deep-seek-coder-v2/02-deep-seek-coder-v2-hxjgpx">02-DeepSeek-Coder-V2 核心架构剖析</a></td>
<td align="left">MoE、MLA、长上下文与训练策略的结构化拆解</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-architecture-overview">05-DeepSeek-Coder-V2 架构专题</a></td>
<td align="left">从工程和产品视角看 Coder-V2 的关键决策</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-Coder-V2 MinerU-EN</a></td>
<td align="left">英文原始整理稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-Coder-V2 MinerU-ZH</a></td>
<td align="left">中文交付稿</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-Coder-V2 要解决的核心问题, 不是单点的代码补全精度, 而是“开源代码模型如何在保持可部署性的同时, 缩小与闭源旗舰编程助手的系统性差距”. 这个问题至少包含四层:</p>
<ul>
<li>代码生成能力要从单函数补全扩展到更真实的仓库级理解与修复</li>
<li>数学与符号推理要同步增强, 因为复杂编程任务本身就依赖结构化推理</li>
<li>上下文窗口要足够长, 才能支撑多文件、多模块、多约束的真实代码场景</li>
<li>对齐方式不能只靠人工偏好, 必须把编译器与测试用例等可执行反馈引入训练闭环</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>DeepSeek-Coder-V2 的方法主线非常清晰:</p>
<ol>
<li>基于 DeepSeek-V2 的 MoE 架构继续预训练, 而不是从零训练 Dense 代码模型.</li>
<li>使用 60% 代码、10% 数学、30% 自然语言的混合语料, 在扩大代码能力的同时保住通用语言能力.</li>
<li>把代码语言覆盖从 86 种扩展到 338 种, 让模型不只服务主流语言生态.</li>
<li>通过 Yarn 与两阶段长上下文训练, 把窗口从 16K 扩展到 128K.</li>
<li>在 16B Lite 上保留 FIM 能力以适配 IDE 补全场景, 在 236B 版本上更聚焦完整的对话式编程任务.</li>
<li>在对齐阶段使用 SFT + GRPO, 并引入 reward model 平滑编译器的二元反馈信号.</li>
</ol>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>这份报告最强的地方在于它展现了 DeepSeek 的工程判断力.</p>
<ul>
<li>架构上, 直接复用 DeepSeek-V2 的 MLA + DeepSeekMoE, 避免在超大规模代码训练中引入新的结构风险.</li>
<li>数据上, 过滤规则与 BPE 驱动的网页召回流程说明团队已经把代码语料当作长期数据基础设施来经营, 而不是一次性抓取.</li>
<li>训练上, 两阶段长上下文扩展和归一化回退都体现出“先保稳定再追极限”的工程风格.</li>
<li>对齐上, 奖励模型不是装饰品, 而是为了弥补测试覆盖不足, 让代码 RL 从硬反馈走向更鲁棒的软反馈.</li>
<li>产品定位上, 16B Lite 与 236B 的 FIM 配置差异, 反映了 DeepSeek 已经在区分 IDE 补全引擎与云端编程助手这两类产品场景.</li>
</ul>
<h2 id="jlysybj">结论与适用边界</h2>
<p>DeepSeek-Coder-V2 的适用场景很明确: 它适合需要高强度代码生成、数学推理、长上下文理解、并且希望使用开源权重部署编程助手的团队. 尤其是在 API 服务、代码问答、竞赛编程、复杂函数生成等任务上, 它已经具备旗舰级价值.</p>
<p>它的边界也同样明确:</p>
<ul>
<li>它仍然不是完整意义上的代码 Agent, 在复杂仓库修复和多文件计划执行上还有明显短板</li>
<li>通用知识问答与通用对话对齐并非它的最优项, 某些指标会为代码强化付出代价</li>
<li>128K 长上下文并不自动等于“会用好 128K”, 真正的工程级长程依赖利用能力仍需更强的 agent 化与检索配合</li>
</ul>
<p>如果把 DeepSeek-Coder 看作“开源代码模型的第一代突破”, 那么 DeepSeek-Coder-V2 就是“第一次把这条路线做成旗舰产品”的版本.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder-V2</h1>
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
