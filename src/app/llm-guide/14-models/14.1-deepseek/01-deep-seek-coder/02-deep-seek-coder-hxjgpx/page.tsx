"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《DeepSeek-Coder 技术报告精译》与 D5 核心技术专题, 对 DeepSeek-Coder 的架构进行系统性梳理. Coder 是 DeepSeek 家族的第一款开源模型, 专注于代码智能领域.
详细分析请参阅 <a href="/llm-guide/14-models/14.1-deepseek/01-deep-seek-coder/05-deep-seek-coder-architecture-overview">05-DeepSeek-Coder-Architecture-Overview.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-dmmxdsghxxq">1 设计动机: 代码模型的三个核心需求</h2>
<p>DeepSeek-Coder 发布于 2023 年 11 月, 其核心任务是解决代码模型的三个需求:</p>
<ol>
<li><strong>仓库级代码理解</strong>: 需要理解跨文件的依赖关系和项目结构.</li>
<li><strong>Fill-in-the-Middle(FIM)</strong>: 代码补全需要预测中间段, 而非仅仅续写.</li>
<li><strong>多语言支持</strong>: 支持多种编程语言, 需要广泛的语言知识.</li>
</ol>
<hr>
<h2 id="2-ztjg">2 整体架构</h2>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">Coder 配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">Dense Transformer</td>
</tr>
<tr>
<td align="left">模型尺寸</td>
<td align="left">1B, 5.7B, 6.7B, 33B</td>
</tr>
<tr>
<td align="left">层数</td>
<td align="left">32-62</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">2048-7168</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">16-56</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">16K</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left">2T token(87% 代码 + 13% 自然语言)</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: DeepSeek-Coder 核心配置.</p>
</blockquote>
<p>Coder 采用标准 Dense Transformer 架构, 没有使用 MoE. 这是因为早期 DeepSeek 团队选择了「先验证代码领域价值, 再探索稀疏架构」的研发策略.</p>
<hr>
<h2 id="3-gjcx">3 关键创新</h2>
<h3 id="3-1-ckjylgj">3.1 仓库级语料构建</h3>
<p>Coder 的预训练数据不仅包含单个代码文件, 还包含完整的代码仓库. 这使得模型可以学习到:</p>
<ul>
<li>跨文件的函数调用关系</li>
<li>项目目录结构和模块组织</li>
<li>代码与配置文件(如 package.json、requirements.txt)的关联</li>
</ul>
<h3 id="3-2-fill-in-the-middle-fim">3.2 Fill-in-the-Middle(FIM)</h3>
<p>FIM 训练将代码文件随机分割为前缀-中间-后缀三部分, 模型需要预测中间段:</p>
<pre><code>&lt;PRE&gt; prefix &lt;SUF&gt; suffix &lt;MID&gt; middle
</code></pre>
<p>这种训练方式显著提升了代码补全和编辑能力, 成为后续代码模型的标准训练流程.</p>
<blockquote>
<p>译者注: FIM 的设计灵感来自代码编辑的实际场景. 开发者在 IDE 中经常需要在已有代码中间插入新逻辑, 而不是在文件末尾续写. FIM 训练使模型学会了「双向上下文理解」——同时考虑前缀和后缀来生成中间内容. 这一方法后来被广泛应用于所有主流代码模型(GitHub Copilot、CodeLlama、StarCoder 等).</p>
</blockquote>
<h3 id="3-3-sjdxxstd">3.3 三阶段学习率调度</h3>
<p>Coder 采用三阶段学习率调度:</p>
<ol>
<li><strong>Warmup</strong>: 线性升温.</li>
<li><strong>稳定期</strong>: 保持峰值学习率.</li>
<li><strong>衰减期</strong>: 余弦衰减.</li>
</ol>
<p>这种调度在代码预训练中尤为重要, 因为代码数据的分布与通用文本不同, 需要更谨慎的学习率控制来避免灾难性遗忘.</p>
<hr>
<h2 id="4-xnyyx">4 性能与影响</h2>
<p>DeepSeek-Coder 在 HumanEval、MBPP 等代码生成基准上取得了当时的开源最佳成绩. 更重要的是, Coder 为 DeepSeek 后续的技术路线埋下了两颗种子:</p>
<ol>
<li><strong>FIM 启发了 V3 的 MTP</strong>: Multi-Token Prediction 可以看作是 FIM 的通用化版本.</li>
<li><strong>代码数据工程经验</strong>: 为 Coder-V2 的 4T 代码语料构建提供了方法论基础.</li>
</ol>
<hr>
<blockquote>
<p>本文档为综合架构剖析. 详细精译见《01-DeepSeek-Coder技术报告精译.md》, 架构深入分析见《05-DeepSeek-Coder-Architecture-Overview.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-dmmxdsghxxq","text":"1 设计动机: 代码模型的三个核心需求"},{"level":2,"id":"2-ztjg","text":"2 整体架构"},{"level":2,"id":"3-gjcx","text":"3 关键创新"},{"level":3,"id":"3-1-ckjylgj","text":"3.1 仓库级语料构建"},{"level":3,"id":"3-2-fill-in-the-middle-fim","text":"3.2 Fill-in-the-Middle(FIM)"},{"level":3,"id":"3-3-sjdxxstd","text":"3.3 三阶段学习率调度"},{"level":2,"id":"4-xnyyx","text":"4 性能与影响"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/02-deep-seek-coder-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/01-deep-seek-coder/02-deep-seek-coder-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder 核心架构剖析</h1>
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
