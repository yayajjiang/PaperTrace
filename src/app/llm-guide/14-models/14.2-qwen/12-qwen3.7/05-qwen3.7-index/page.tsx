"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen3.7 技术入口</h1>
<blockquote>
<p>返回上级：<a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">14.2-Qwen</a></p>
</blockquote>
<p>Qwen3.7-Max 是 Qwen 系列向「智能体基座」战略转型的旗舰节点(2026-05, 仅 API). 其核心卖点不是单一 benchmark 再涨 2%, 而是长程自主执行(35 小时 / 1,158 次工具调用)、跨框架泛化(Claude Code / OpenClaw / Qwen Code)与环境扩展驱动的 Agent 能力泛化.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th>文件</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/14-models/14.2-qwen/12-qwen3.7/01-qwen3.7-jsbgjy">01-Qwen3.7 技术报告精译</a></td>
<td>基于官方博客的中文精译主稿</td>
</tr>
<tr>
<td><a href="#broken-link">03-Qwen3.7-mineru-en</a></td>
<td>英文源资料整理稿</td>
</tr>
<tr>
<td><a href="#broken-link">04-Qwen3.7-mineru-zh</a></td>
<td>中文交付稿(含译者注)</td>
</tr>
<tr>
<td><a href="/llm-guide/14-models/14.2-qwen/12-qwen3.7/05-qwen3.7-cczzzhykkjfhdgcsj">05-Qwen3.7 长程自主执行专题</a></td>
<td>35h kernel 优化与跨框架 RL 工程拆解</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen3.7 要解决的不是「再做一个更强的聊天模型」, 而是四个 Agent 时代问题. 第一, 能否在数百至数千步的长周期任务中保持策略连贯, 不因上下文腐化或指令漂移而崩溃? 第二, 能否在 Claude Code、OpenClaw、自定义 Harness 等不同运行框架下稳定发挥, 而非过拟合单一脚手架? 第三, 能否通过扩展训练环境(而非单环境过优化)实现 Agent 能力的可预测泛化? 第四, 能否在未见硬件/未见评测环境上依靠运行时反馈完成复杂工程任务(如 GPU kernel 优化)?</p>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen3.7 的方法主线包括五条.</p>
<p><strong>环境扩展 RL</strong>: 在 Qwen3.5 基础上大幅扩展 Agent 训练环境的质量与多样性; 评测环境均为训练外 OOD 环境; 子集 benchmark 增益可预测整体增益.</p>
<p><strong>Task / Harness / Verifier 解耦</strong>: Rollout 基础设施三组件正交重组, 支持跨框架、跨验证器 RL, 迫使模型学习任务本质而非框架捷径.</p>
<p><strong>长程自主执行训练</strong>: YC-Bench 等超千步决策任务强化规划一致性; SWE RL 中加入奖励作弊自主监控(80h+, 13 条自进化规则).</p>
<p><strong>自适应推理预算</strong>: Terminal Bench 等评测允许每轮自主选择 extended thinking; API 层 <code>preserve_thinking</code> 保留多轮思维链.</p>
<p><strong>实战验证 trilogy</strong>: (1) 35h M890 PPU kernel 优化 10.0x; (2) RL 作弊监控 1,618 案例; (3) YC-Bench 营收 2.08M vs 前代 1.05M.</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>工程上,Qwen3.7-Max 的定位是「企业级 Agent 运行时」而非「可自部署开源权重」.</p>
<p><strong>API 优先</strong>: 1M 上下文, 百炼 <code>qwen3.7-max</code>, 兼容 OpenAI / Anthropic 接口, 集成 Claude Code / OpenClaw / Qwen Code. 无开源权重意味着能力边界由云 API 定义.</p>
<p><strong>评测体系 Agent 原生</strong>: Terminal Bench(5h/256K)、Kernel Bench L3(隔离 Docker/CUTLASS only)、MCP-Mark/Atlas、QwenClawBench(已部分开源)、CoWorkBench、SkillsBench(OpenCode 78 任务). 分数来自多框架, 强调跨 Harness 一致性.</p>
<p><strong>可靠性参数 vs 能力参数</strong>: Kernel 对比表显示 Qwen3.6-Plus 1.1x 后主动停止(元认知放弃), Qwen3.7-Max 10.0x 完成——差异在「知道何时坚持」. 这是长程 Agent 的关键工程指标.</p>
<p><strong>与谱系关系</strong>: Qwen3(双模式) → Qwen3.5(原生多模态 Agent) → Qwen3.6(全尺度编程) → Qwen3.7(长程自主 + 跨框架). 平均 1-2 月一个大版本, 生态锁定优先于论文完整披露.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen3.7-Max 适合:</p>
<ul>
<li>需要数小时级自主 Agent 运行的企业工作流(办公自动化、长文档分析、复杂代码工程)</li>
<li>多框架部署(Claude Code / OpenClaw / 自研 Harness)且不愿被单一生态绑定</li>
<li>GPU 内核/性能工程等需要 In-context 硬件探索的场景</li>
<li>对 SWE RL 训练需奖励作弊监控的研究/平台团队</li>
</ul>
<p>适用边界:</p>
<ol>
<li><strong>仅 API, 无开源权重</strong>: 无法本地私有化完整能力, 成本与数据合规受云服务商约束.</li>
<li><strong>技术报告未发布</strong>: 环境扩展细节、Scaling Law 公式、架构参数未公开, 深度复现困难.</li>
<li><strong>受控实验 vs 开放世界</strong>: 35h kernel 实验有预设任务/脚本/参考实现; YC-Bench 仍是模拟环境.</li>
<li><strong>xhigh reasoning 分数</strong>: HLE/GPQA 等旗舰分数在最大推理预算下取得, 生产默认配置会打折.</li>
<li><strong>高频版本迭代</strong>: API 兼容性与文档可能滞后, 企业需评估升级节奏.</li>
</ol>
<p>Qwen3.7 的强项是「长程可靠 Agent + 跨框架泛化 + 环境扩展方法论」, 代表 Qwen 从语言模型竞赛进入 Agent 基础设施竞赛.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/12-qwen3.7/05-qwen3.7-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/12-qwen3.7/05-qwen3.7-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen3.7 Index</h1>
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
