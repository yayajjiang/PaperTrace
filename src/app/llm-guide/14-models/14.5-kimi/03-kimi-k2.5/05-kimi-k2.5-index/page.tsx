"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi-K2.5 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">14.5-Kimi</a></p>
</blockquote>
<p>Kimi K2.5(arXiv:2602.02276, 2026-01)在 K2 万亿 MoE 基座上引入<strong>原生多模态 Agentic 智能</strong>: 文本-视觉联合预训练、零视觉 SFT、联合多模态 RL, 以及 <strong>Agent Swarm</strong> 并行编排(延迟最高降低 4.5×). SWE-bench Verified <strong>76.8%</strong>, VideoMMMU <strong>86.6%</strong>.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.5-kimi/03-kimi-k2.5/01-kimi-k2.5-jsbgjy">01-Kimi-K2.5 技术报告精译</a></td>
<td>中文精译主稿(D2)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.5-kimi/03-kimi-k2.5/02-kimi-k2.5-tljgpx">02-Kimi-K2.5 推理架构剖析</a></td>
<td>Toggle / token 效率专题(D2)</td>
</tr>
<tr>
<td><a href="#broken-link">03-Kimi-K2.5-mineru-en</a></td>
<td>MinerU 英文原文(D3)</td>
</tr>
<tr>
<td><a href="#broken-link">04-Kimi-K2.5-mineru-zh</a></td>
<td>逐段精译与译者注(D4)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-architecture-overview">05-Kimi-K2.5 架构专题</a></td>
<td>MoonViT-3D / Agent Swarm 深度拆解</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>K2 已在文本 Agent 任务上达到开源 SOTA, 但真实 Agent 工作负载大量涉及<strong>视觉输入</strong>(UI 截图、图表、文档扫描、长视频). K2.5 要回答:</p>
<ol>
<li>如何在固定 token 预算下联合优化文本与视觉, 避免「后期加视觉损害文本」?</li>
<li>如何在视觉配对数据稀缺时仍激活强视觉推理(尤其工具调用)?</li>
<li>复杂 Agent 任务串行执行延迟过高, 如何 learned parallelization?</li>
</ol>
<h2 id="ffcj">方法拆解</h2>
<p><strong>联合预训练(Early Fusion, 低视觉比例)</strong></p>
<ul>
<li>固定视觉-文本 token 总预算下, <strong>10% 视觉比例 + 从头融合</strong> 优于 50%/80% 晚期融合(表 1 / 图 9).</li>
<li>MoonViT-3D: SigLIP 初始化, 图像/视频统一 NaViT packing, 4× 时间压缩, 262K 上下文 mid-training.</li>
</ul>
<p><strong>零视觉 SFT + 联合 RL</strong></p>
<ul>
<li>SFT 阶段仅文本轨迹(生成操作图像的 Python 代码), 激活视觉工具调用能力.</li>
<li>视觉 RL FLOPs 扩展持续提升视觉 benchmark; 视觉 RL 同时提升文本任务(正向迁移).</li>
</ul>
<p><strong>Agent Swarm + PARL</strong></p>
<ul>
<li>可训练编排器动态创建<strong>冻结子智能体</strong>, 并行分解子任务.</li>
<li>PARL 奖励: 任务性能 + 并行度 + 完成度; 关键步骤指标(类 CPM)惩罚虚假并行.</li>
<li>WideSearch: 目标 Item-F1 从 30%→70% 时, 单 Agent 耗时 7× 基线, Swarm 维持 ~0.6–1.6×.</li>
</ul>
<p><strong>工程: DEP + Toggle</strong></p>
<ul>
<li>Decoupled Encoder Process: 视觉编码器前向/反向解耦, 多模态训练效率达纯文本 90%.</li>
<li>Toggle RL: 交替长/短 CoT 预算, 平均减少 25–30% 输出 token.</li>
</ul>
<h2 id="gcyjgfx">工程与架构分析</h2>
<table>
<thead>
<tr>
<th>组件</th>
<th>要点</th>
</tr>
</thead>
<tbody><tr>
<td>基座</td>
<td>Kimi K2 MoE(1.04T/32B act), 384 experts, MLA</td>
</tr>
<tr>
<td>视觉</td>
<td>MoonViT-3D + MLP projector, 原生分辨率</td>
</tr>
<tr>
<td>训练</td>
<td>ViT 1T → Joint PT 15T → Long-ctx 262K → SFT → RL</td>
</tr>
<tr>
<td>Agent</td>
<td>统一 Gym-like RL 环境; Computer Use / BrowseComp / WideSearch</td>
</tr>
<tr>
<td>开源</td>
<td>Post-trained checkpoint 开放(HuggingFace)</td>
</tr>
</tbody></table>
<p><strong>代表性成绩(论文报告)</strong>: SWE-bench Verified 76.8, BrowseComp 74.9, MMMU Pro 78.5, VideoMMMU 86.6, AIME 2025 96.1.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p><strong>适用</strong>: 需要开源多模态 Agent(代码+视觉+工具)、长视频理解、并行任务编排的研究与产品; 希望降低视觉 SFT 标注成本(零视觉 SFT 路径).</p>
<p><strong>边界</strong>:</p>
<ul>
<li>Computer Use(OSWorld 等)仍略低于 Claude Opus 4.5 等闭源 GUI Agent.</li>
<li>Agent Swarm 加速依赖任务可并行度; 本质串行推理收益有限.</li>
<li>零视觉 SFT 对需深层语义理解的视觉任务(情感、审美)可能不足.</li>
<li>部分 benchmark 与 GPT-5.2 thinking/xhigh 模式不完全可比.</li>
</ul>
<p><strong>谱系</strong>: K2(文本 Agent 开源标杆) → <strong>K2.5(视觉 Agent + Swarm)</strong> → K2.6(最新旗舰).</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi-K2.5 Index</h1>
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
