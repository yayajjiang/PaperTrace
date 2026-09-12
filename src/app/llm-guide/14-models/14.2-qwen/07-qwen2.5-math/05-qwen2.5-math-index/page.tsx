"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-Math</h1>
<blockquote>
<p><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></p>
</blockquote>
<p>Qwen2.5-Math 是 Qwen 体系里最典型的“专项强化模型”之一。它不是简单把通用模型拉来做几轮数学微调，而是围绕数学数据召回、合成语料自举、奖励模型训练、CoT 与 TIR 双路径后训练, 做成了一条相对完整的数学模型研发闭环。</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/07-qwen2.5-math/01-qwen2.5-math-jsbgjy">01-Qwen2.5-Math 技术报告精译</a></td>
<td align="left">主报告精译与整体技术脉络</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/07-qwen2.5-math/05-qwen2.5-math-mathematical-reasoning">05-Qwen2.5-Math Mathematical Reasoning</a></td>
<td align="left">数学推理方法与训练路线的专题拆解</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-Qwen2.5-Math MinerU-EN</a></td>
<td align="left">英文整理稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-Qwen2.5-Math MinerU-ZH</a></td>
<td align="left">中文交付稿</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>Qwen2.5-Math 要解决的是一个比“让模型做更多数学题”更深的问题: 如何让通用大模型在数学领域形成可持续、自举式增强能力, 而不完全依赖人工高质量 CoT 标注。</p>
<p>这个问题拆开至少包括:</p>
<ul>
<li>数学预训练语料如何高质量召回与扩张</li>
<li>数学推理数据如何通过模型自生成与过滤形成闭环</li>
<li>CoT 与 TIR 这两类不同推理范式如何同时训练</li>
<li>奖励模型如何真正服务于数据筛选、强化学习和推理时重采样</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>Qwen2.5-Math 的方法主线非常清晰:</p>
<ol>
<li>先在大规模高质量数学语料上训练 Qwen2-Math 基础模型。</li>
<li>用 Qwen2-Math-Instruct 反过来生成更高质量的数学预训练数据, 构建 Corpus v2。</li>
<li>基于更强的 Qwen2.5 通用底座, 在 Corpus v2 上继续得到 Qwen2.5-Math。</li>
<li>在后训练阶段同时构建 CoT 数据与 TIR 数据, 让模型兼具自然语言推理和工具集成推理能力。</li>
<li>训练专门的数学奖励模型, 既参与样本筛选, 也参与 RL 和 test-time best-of-N 选择。</li>
<li>使用 GRPO 做强化学习, 进一步优化推理质量。</li>
</ol>
<p>换句话说, 这不是一篇只谈某个算法技巧的数学模型报告, 而是一篇把“数学专项模型如何持续自举迭代”讲清楚的工程化报告。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>Qwen2.5-Math 最强的地方在于方法链路闭合。</p>
<ul>
<li>数据侧, 它把数学网页、题库、合成数据和中文材料都整合进来, 解决专项数据稀缺问题。</li>
<li>模型侧, 它不是孤立从头训练, 而是建立在更强的 Qwen2.5 基座上, 让语言、代码和一般推理能力成为数学能力的支撑。</li>
<li>后训练侧, CoT 与 TIR 双路线并存, 说明团队不把“数学推理”简化成单一路径。</li>
<li>奖励模型侧, 奖励模型不只是打分器, 而是贯穿数据构建、RL 与推理时重排序的基础组件。</li>
<li>RL 侧, GRPO 的引入说明团队开始把大规模数学推理优化视为一项可工程化工作, 而非只靠离线 SFT。</li>
</ul>
<p>从工程视角看, 它的价值在于把数学模型开发从“刷题微调”推进到了“专项模型系统工程”阶段。</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>Qwen2.5-Math 适合:</p>
<ul>
<li>竞赛数学和结构化数学推理任务</li>
<li>需要 CoT 展开能力的数学问答场景</li>
<li>需要 Python 工具辅助计算的复杂数值题</li>
<li>中英文双语数学教学与评测系统</li>
</ul>
<p>它的边界也很清楚:</p>
<ul>
<li>TIR 的收益并不在所有语言和场景下都稳定, 中文场景下优势未必总比 CoT 明显</li>
<li>数学专项模型的很多能力依赖可验证答案, 向更开放 STEM 领域迁移会更难</li>
<li>奖励模型和 best-of-N 机制虽然有效, 但也提高了训练和推理系统复杂度</li>
</ul>
<p>如果说 Qwen2.5 是平台化通用模型, 那么 Qwen2.5-Math 就是“把这套平台拿去做专项数学强化”的最完整样板之一。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/07-qwen2.5-math/05-qwen2.5-math-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/07-qwen2.5-math/05-qwen2.5-math-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-Math</h1>
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
