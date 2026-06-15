"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3.1</h1>
<blockquote>
<p><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></p>
</blockquote>
<p>DeepSeek-V3.1 不是一篇典型“论文驱动”的版本, 而是一个很典型的“产品驱动”版本. 它延续 V3 的大基座, 重点解决长上下文、混合推理与 agent 使用体验, 把模型从“能力很强”推向“更适合被真实使用”.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/07-deep-seek-v3.1/01-deep-seek-v3.1-yjxjjy">01-DeepSeek-V3.1 演进细节精译</a></td>
<td align="left">官方公告与公开资料的精译整理</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/07-deep-seek-v3.1/05-deep-seek-v3.1-hhtlmsdsjysx">05-DeepSeek-V3.1 混合推理模式的设计与实现</a></td>
<td align="left">对混合推理产品设计与实现方式的专题拆解</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-V3.1 Source Notes</a></td>
<td align="left">英文源资料整理稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-V3.1 中文交付稿</a></td>
<td align="left">中文正式交付稿</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-V3.1 解决的核心问题不是“再造一个全新模型家族”, 而是“如何在保持 V3 架构连续性的前提下, 让同一个模型更适合真实产品与 agent 场景”. 这个问题具体表现为:</p>
<ul>
<li>长上下文能力不能只停留在名义窗口大小, 必须通过继续训练真正做稳</li>
<li>用户既需要快答模式, 也需要深推理模式, 但不希望频繁切换模型</li>
<li>代码和工具场景要求模型不只会回答, 还要更会在多步流程中工作</li>
<li>模型升级必须尽量复用既有 V3 的部署生态, 否则工程迁移成本过高</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>V3.1 的方法主线很清楚:</p>
<ol>
<li>保持 DeepSeek-V3 的 671B / 37B 激活 MoE 架构不变.</li>
<li>用约 840B token 做面向 32K 与 128K 场景的继续预训练.</li>
<li>在产品层引入混合推理模式, 让同一模型支持 thinking 与 non-thinking 两种行为.</li>
<li>通过后训练增强 agent 相关能力, 包括工具使用与多步任务稳定性.</li>
<li>更新 tokenizer 与 chat-template, 让模式切换和多轮交互更稳.</li>
</ol>
<p>这说明 V3.1 的创新重点不是底层算子, 而是“继续训练 + 服务侧行为控制 + 使用场景优化”的组合.</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程角度看, V3.1 的价值很高.</p>
<ul>
<li>架构连续性意味着现有 V3 部署链路可以较低成本迁移.</li>
<li>840B token 的继续预训练说明 DeepSeek 把长上下文当成单独能力层来建设, 而不是当成宣传参数.</li>
<li>混合推理模式把“是否展开思考”变成一个产品可控开关, 降低了双模型维护成本.</li>
<li>这类设计非常适合统一 API 服务, 也更有利于后续 agent 工作流接入.</li>
<li>它同时暴露出一条清晰演进线: V3.1 先解决模式统一, V3.2 再继续解决思考模式与工具调用的协同问题.</li>
</ul>
<h2 id="jlysybj">结论与适用边界</h2>
<p>DeepSeek-V3.1 适合被理解为 V3 到后续 agent 版本之间的关键过渡点. 它最适合的使用场景是:</p>
<ul>
<li>需要统一快答与深推理体验的产品</li>
<li>需要长上下文处理但又不想放弃现有 V3 部署基础的团队</li>
<li>关注工具调用、软件工程和 agent 任务演进方向的开发者</li>
</ul>
<p>它的边界也很明确:</p>
<ul>
<li>没有独立论文 PDF, 公开训练细节远少于 V3 和 R1</li>
<li>很多关键结论来自官方公告与模型卡, 而非完整论文实验</li>
<li>它更像“产品化增强版”, 不是一篇可供逐段论文精译的标准技术报告</li>
</ul>
<p>因此, 这个目录的交付重点应放在“公开资料的结构化重建”, 而不是强行伪装成一篇完整论文译稿.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/07-deep-seek-v3.1/05-deep-seek-v3.1-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/07-deep-seek-v3.1/05-deep-seek-v3.1-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3.1</h1>
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
