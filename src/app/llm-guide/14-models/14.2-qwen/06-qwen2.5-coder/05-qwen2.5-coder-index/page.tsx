"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-Coder</h1>
<blockquote>
<p><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></p>
</blockquote>
<p>Qwen2.5-Coder 是 Qwen 路线在代码模型方向上的一次系统升级. 它不是简单把通用模型继续堆代码数据, 而是围绕代码数据工程、仓库级预训练、代码对齐和多尺寸部署矩阵, 把代码模型做成了真正独立的一条产品线.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/06-qwen2.5-coder/01-qwen2.5-coder-jsbgjy">01-Qwen2.5-Coder 技术报告精译</a></td>
<td align="left">主报告精译与完整技术脉络</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-Qwen2.5-Coder 中文交付稿</a></td>
<td align="left">中文正式交付稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">02-Qwen2.5-Coder 核心架构剖析</a></td>
<td align="left">代码数据、训练阶段与 GRPO 路线拆解</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/06-qwen2.5-coder/05-qwen2.5-coder-architecture-overview">05-Qwen2.5-Coder Architecture Overview</a></td>
<td align="left">从谱系与方法论视角理解 Qwen2.5-Coder</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-Qwen2.5-Coder MinerU-EN</a></td>
<td align="left">英文整理稿</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen2.5-Coder 解决的核心问题是: 如何在保持 Qwen2.5 通用能力底座的前提下, 训练出一个兼具代码生成、代码补全、仓库级理解、代码推理和代码编辑能力的专用模型系列, 并且让它在多个尺寸上都具备实际部署价值.</p>
<p>这背后至少有四个关键挑战:</p>
<ul>
<li>代码数据如何做大规模清洗, 既覆盖 92 种语言, 又避免质量塌陷</li>
<li>代码模型如何从单文件理解升级到仓库级上下文理解</li>
<li>代码对齐如何从单纯 SFT 走向可验证的离线 RL 与多维在线 RL</li>
<li>如何让小模型也在真实编程任务中具备超出参数规模预期的性价比</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen2.5-Coder 的方法主线很完整:</p>
<ol>
<li>基于 Qwen2.5 通用模型继续训练, 而不是重新设计代码专用主架构.</li>
<li>构建 5.5T 级别的代码相关数据体系, 包括源代码、文本-代码关联数据、合成数据、数学数据和通用文本数据.</li>
<li>通过实验选择 70% 代码、20% 文本、10% 数学的混合比例, 证明纯代码并不是最优方案.</li>
<li>训练流程分三阶段: 文件级预训练、仓库级预训练、指令微调.</li>
<li>仓库级阶段用 <code>&lt;|repo_name|&gt;</code> 和 <code>&lt;|file_sep|&gt;</code> 把 repo-level FIM 变成显式训练格式.</li>
<li>后训练阶段同时引入离线 RL 和在线 RL, 并把 GRPO 纳入代码模型主链路.</li>
</ol>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>Qwen2.5-Coder 最强的地方不在单个模块, 而在工程体系的组织方式.</p>
<ul>
<li>数据侧, 团队把代码数据当成一个结构化供应链来做, 而不是简单抓 GitHub.</li>
<li>训练侧, repo-level FIM 说明他们真正关心的是跨文件理解而不是单函数背诵.</li>
<li>对齐侧, 离线 RL 与在线 RL 的分工很清楚: 前者学“硬技能”, 后者学“软偏好”.</li>
<li>产品侧, 从 0.5B 到 32B 的完整尺寸矩阵, 说明这是一个面向真实部署的系列, 不是只冲旗舰分数.</li>
</ul>
<p>尤其值得注意的是 7B 模型在多项代码基准上超过更大模型, 这直接证明了高质量代码数据、仓库级训练格式和对齐系统的价值.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen2.5-Coder 适合:</p>
<ul>
<li>IDE 补全和中小规模代码助手</li>
<li>跨语言代码生成与修复</li>
<li>仓库级代码理解和文档辅助</li>
<li>代码推理、Text-to-SQL、表格理解等结构化任务</li>
</ul>
<p>它的边界也很清楚:</p>
<ul>
<li>仓库级理解虽然进了一步, 但 128K 上下文对超大单体仓库仍然有限</li>
<li>大量能力提升依赖复杂数据系统与验证系统, 复制门槛不低</li>
<li>在线 RL 和奖励模型之间仍然可能存在评估脱节与 Goodhart 风险</li>
</ul>
<p>如果说 Qwen2.5 是“平台化通用模型”, 那么 Qwen2.5-Coder 就是“建立在该平台之上的成熟代码产品线”.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/06-qwen2.5-coder/05-qwen2.5-coder-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/06-qwen2.5-coder/05-qwen2.5-coder-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-Coder</h1>
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
