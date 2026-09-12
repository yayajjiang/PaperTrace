"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-R1</h1>
<blockquote>
<p><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></p>
</blockquote>
<p>DeepSeek-R1 是 DeepSeek 推理路线真正形成体系的版本. 它不只是一个“会想更久”的模型, 而是把纯规则奖励 RL、冷启动 SFT、拒绝采样、通用对齐 RL、以及蒸馏落地完整串起来, 证明了开源模型可以把推理能力做成一条可复制的训练方法学.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/01-deep-seek-r1-jsbgjy">01-DeepSeek-R1 技术报告精译</a></td>
<td align="left">主报告精译与完整技术脉络</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/02-deep-seek-r1-zero-ylpx">02-DeepSeek-R1-Zero 原理剖析</a></td>
<td align="left">R1-Zero 的纯 RL 起点与 GRPO 核心思想</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/03-deep-seek-r1-djddqpx">03-DeepSeek-R1 多阶段对齐剖析</a></td>
<td align="left">从 Zero 到 R1 的多阶段训练闭环</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/04-deep-seek-r1-zlygyld">04-DeepSeek-R1 蒸馏与工业落地</a></td>
<td align="left">小模型蒸馏与部署视角</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-grpo">05-DeepSeek-R1-GRPO</a></td>
<td align="left">GRPO 数学机制与工程实现</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-distillation">05-DeepSeek-R1-Distillation</a></td>
<td align="left">蒸馏效果与工业化取舍</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-training-pipeline">05-DeepSeek-R1-Training-Pipeline</a></td>
<td align="left">四阶段训练流程拆解</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-R1 MinerU-EN</a></td>
<td align="left">英文整理稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-R1 MinerU-ZH</a></td>
<td align="left">中文交付稿</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-R1 要解决的问题, 不是传统“让模型多写几步 CoT”那么简单, 而是更根本的问题: 在尽量少依赖人工推理标注的前提下, 是否能让大模型通过强化学习自主长出稳定、可迁移、可蒸馏的推理能力. 这个问题拆开后至少包括四层:</p>
<ul>
<li>规则奖励能否替代大规模人工推理示范</li>
<li>长链路推理中的策略更新, 是否可以用更低成本的 RL 算法稳定完成</li>
<li>纯推理 RL 得到的能力, 是否能进一步被对齐、被泛化、被蒸馏</li>
<li>推理能力是否能从超大模型迁移到更可部署的小模型</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>DeepSeek-R1 的方法可以看成一条清晰的分阶段路线:</p>
<ol>
<li>先训练 R1-Zero: 跳过 SFT, 只用 GRPO 和规则奖励在可验证任务上做纯 RL.</li>
<li>观察到 R1-Zero 虽然推理强, 但可读性差、语言混杂、通用任务弱.</li>
<li>引入少量冷启动 SFT 数据, 解决输出风格与语言一致性问题.</li>
<li>继续做推理导向 RL, 把被 SFT 拉低的推理能力重新推高.</li>
<li>用拒绝采样构建大规模高质量推理与非推理数据, 做第二轮 SFT.</li>
<li>最后做通用对齐 RL, 把“会推理”进一步升级成“更像可用助手”.</li>
<li>再把 R1 产生的推理模式蒸馏到 1.5B 到 70B 的小模型, 形成实际可部署的推理族谱.</li>
</ol>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>R1 真正强的地方在工程化.</p>
<ul>
<li>算法上, GRPO 砍掉了 PPO 所依赖的 value model, 把长 CoT 场景下最重、最不稳定的一块成本直接拿掉.</li>
<li>奖励设计上, 优先使用数学、代码、逻辑任务中的规则奖励, 避免神经奖励模型被 reward hacking.</li>
<li>训练流程上, 不是端到端一把梭, 而是把“推理能力生成”和“用户可用性对齐”拆成多个阶段分别处理.</li>
<li>系统上, Rollout、规则奖励、训练解耦, 说明团队不是只在论文层面讨论 RL, 而是真正在做大规模推理 RL 基础设施.</li>
<li>产品上, 蒸馏实验直接回答了一个产业问题: 大模型发现出来的推理能力, 如何转成更便宜、更易部署的小模型能力.</li>
</ul>
<h2 id="jlysybj">结论与适用边界</h2>
<p>DeepSeek-R1 适合被看作“开源推理模型路线的主方法论样板”. 如果你关心的是数学、代码、逻辑推理、可验证任务的后训练路线, 这篇报告几乎就是必读材料. 对实际应用而言, R1 大模型给出了上限, 蒸馏版给出了落地路径.</p>
<p>它的边界也同样明确:</p>
<ul>
<li>纯规则奖励只适合可验证任务, 对创意写作、开放式对话等任务无能为力</li>
<li>即便是 R1, 也不是完整的软件工程 Agent, 在复杂工具链协作上仍有距离</li>
<li>推理能力与可读性、通用对齐之间存在真实权衡, 这也是为什么最终必须走多阶段流程而不是只做纯 RL</li>
<li>小模型很难通过纯 RL 自己长出同等级推理能力, 蒸馏目前仍是更现实的路径</li>
</ul>
<p>如果说 R1-Zero 证明了“纯 RL 可以长出推理”, 那么 DeepSeek-R1 证明的是“这种推理可以被驯化、扩展并工程化落地”.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/06-deep-seek-r1/05-deep-seek-r1-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-R1</h1>
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
