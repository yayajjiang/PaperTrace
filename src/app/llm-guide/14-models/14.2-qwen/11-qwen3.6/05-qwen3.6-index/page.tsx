"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.6 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">14.2-Qwen</a></p>
</blockquote>
<p>Qwen3.6 是 Qwen 系列在 Agent 编程能力上的全尺度收束: 同时发布 35B-A3B(MoE, 3B 激活)与 27B(Dense)两个开源规格, 以及 Qwen3.6-Plus / Max-Preview API 版本. 其核心主张是「训练质量 &gt; 参数规模」——Qwen3.6-27B 在 SWE-bench、Terminal-Bench、SkillsBench 等 Agent 编程基准上全面超越 397B/17B 的 Qwen3.5 前代旗舰.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.2-qwen/11-qwen3.6/01-qwen3.6-jsbgjy">01-Qwen3.6 技术报告精译</a></td>
<td>基于两篇官方博客的中文精译主稿</td>
</tr>
<tr>
<td><a href="#broken-link">03-Qwen3.6-mineru-en</a></td>
<td>英文源资料整理稿(无独立 PDF)</td>
</tr>
<tr>
<td><a href="#broken-link">04-Qwen3.6-mineru-zh</a></td>
<td>中文交付稿(含译者注)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.2-qwen/11-qwen3.6/05-qwen3.6-architecture-overview">05-Qwen3.6-Architecture-Overview</a></td>
<td>架构推断与 Agent 编程能力拆解</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen3.6 要回答三个问题. 第一, 能否在「开发者可实际部署」的规模(3B 激活 MoE 或 27B Dense)上, 达到旗舰级 Agent 编程能力, 而非仅依赖 397B 级 MoE 旗舰? 第二, 稠密与稀疏两条路线如何分工——MoE 追求极致效率, Dense 追求推理一致性与部署简便? 第三, 多模态 Agent(视觉 grounding、GUI 自动化、前端代码生成)能否与编程 Agent 能力在同一模型族内同步提升?</p>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen3.6 的方法主线可归纳为四条.</p>
<p><strong>双规格矩阵</strong>: Qwen3.6-35B-A3B(35B/3B, MoE, 激活比 8.6%)面向极致效率; Qwen3.6-27B(27B Dense)面向部署便捷与单步推理一致性. 两者均继承 Qwen3.5 的 Gated DeltaNet + Gated Attention 混合注意力.</p>
<p><strong>Agent 编程后训练</strong>: 博客强调 SWE-bench、Terminal-Bench、SkillsBench、Claw-Eval、QwenClawBench 等端到端 Agent 基准的大幅提升. SkillsBench 通过 OpenCode 在 78 个自包含任务上评估, 反映真实编程助手能力而非单点代码补全.</p>
<p><strong>preserve_thinking 产品能力</strong>: 多轮 Agent 交互中保留前序思维链, 避免工具调用场景下的推理断裂. 这是从「单轮问答模型」向「多轮 Agent 运行时」过渡的关键 API 设计.</p>
<p><strong>多模态 Agent 强化</strong>: 35B-A3B 在 RefCOCO(92.0)、ODInW13(50.8)等空间智能基准跃升; 27B 在 V*(94.7)、AndroidWorld(70.3)、VlmsAreBlind(97.0)上接近或超越前代 MoE 旗舰.</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>从工程视角, Qwen3.6 有三个值得关注的系统设计.</p>
<p>第一, <strong>27B Dense 的「回归」是 deliberate 的产品选择</strong>. Qwen3 之后主力均为 MoE, 但 Agent 编程任务(变量作用域跟踪、类型推断、多文件编辑状态机)可能更受益于全参数参与计算的稠密架构. SWE-bench Verified 77.2 vs 397B/17B 的 76.2 是最直接的证据.</p>
<p>第二, <strong>35B-A3B 的 8.6% 激活比是效率与质量的折中</strong>. 相比 Qwen3.5-397B-A17B 的 4.3%, 更高激活比降低路由不稳定风险, 小 batch 场景实际吞吐更接近理论值, 但极致并发成本效率略逊.</p>
<p>第三, <strong>评估体系高度 Agent 化</strong>. 内部基准(QwenClawBench、QwenWebBench、NL2Repo)与公开基准(SWE-bench、Terminal-Bench)并存, 评估设置明确依赖 bash + file-edit 脚手架、Harbor/Terminus-2 harness、OpenCode 等真实工具链. 这意味着 Qwen3.6 的优化目标已从「答对题」转向「在工具环境中完成任务」.</p>
<p>部署路径: Hugging Face / ModelScope 开源权重; 百炼 API(<code>qwen3.6-flash</code>, <code>qwen3.6-27b</code>); 兼容 OpenAI / Anthropic 接口; 集成 OpenClaw、Claude Code、Qwen Code.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen3.6 适合:</p>
<ul>
<li>需要本地部署顶级 Agent 编程能力的开发者(27B Dense 或 35B-A3B MoE)</li>
<li>构建多轮工具调用 Agent(terminal、文件编辑、版本控制)的应用</li>
<li>视觉 Agent 场景(GUI 自动化、前端代码生成、空间 grounding)</li>
<li>希望用 <code>preserve_thinking</code> 保持多轮推理连贯性的 Agent 运行时</li>
</ul>
<p>适用边界:</p>
<ol>
<li><strong>无独立技术报告</strong>: 架构与训练细节披露有限, 深度复现困难.</li>
<li><strong>27B 并非「轻量」</strong>: FP16 约需 60GB 显存; 35B-A3B 的 MoE 路由在小 batch 下有通信开销.</li>
<li><strong>知识密集型任务仍受益于大容量</strong>: MMLU-Pro、SuperGPQA 上 27B 仍略逊于 397B MoE 前代.</li>
<li><strong>内部基准可比性</strong>: QwenClawBench、QwenWebBench 等尚未完全开源, 评估脚手架依赖可能引入偏差.</li>
<li><strong>多模态与编程的 trade-off</strong>: 35B-A3B 在部分通用 Agent 基准(VITA-Bench)上未全面领先, 说明能力优化存在任务侧重.</li>
</ol>
<p>Qwen3.6 的强项是「全尺度 Agent 编程 + 可部署性 + 多模态 grounding」, 代表 Qwen 从「做大模型」到「做开发者可用的 Agent 基座」的产品化跃迁.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/11-qwen3.6/05-qwen3.6-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/11-qwen3.6/05-qwen3.6-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.6 Index</h1>
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
