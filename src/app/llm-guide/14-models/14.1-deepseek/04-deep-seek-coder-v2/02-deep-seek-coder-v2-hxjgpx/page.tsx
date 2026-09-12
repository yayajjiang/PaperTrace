"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Coder-V2 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《DeepSeek-Coder-V2 技术报告精译》与 D5 核心技术专题, 对 DeepSeek-Coder-V2 的架构进行系统性梳理. Coder-V2 是首款将 MLA + DeepSeekMoE 架构应用于代码领域的旗舰模型.
详细分析请参阅 <a href="/llm-guide/14-models/14.1-deepseek/04-deep-seek-coder-v2/05-deep-seek-coder-v2-architecture-overview">05-DeepSeek-Coder-V2-Architecture-Overview.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-dmmxdtsxq">1 设计动机: 代码模型的特殊需求</h2>
<p>DeepSeek-Coder-V2 发布于 2024 年 6 月, 基于 DeepSeek-V2 的架构, 在 4 万亿 token 的代码语料上持续预训练. 其核心任务是解决代码模型的三个特殊需求:</p>
<ol>
<li><strong>长上下文理解</strong>: 代码文件通常较长, 需要理解跨文件的依赖关系.</li>
<li><strong>Fill-in-the-Middle(FIM)</strong>: 代码补全任务需要模型预测中间段, 而非仅仅续写.</li>
<li><strong>多语言支持</strong>: 支持 338 种编程语言, 需要广泛的语言知识.</li>
</ol>
<blockquote>
<p>译者注: Coder-V2 的设计选择反映了 DeepSeek 的一个重要产品策略: 将通用架构(V2)与领域数据(代码)结合, 通过持续预训练而非从头训练来实现领域专业化. 这比从头训练一个代码专用模型更经济, 因为通用语言能力已经由 V2 的预训练提供.</p>
</blockquote>
<hr>
<h2 id="2-ztjg">2 整体架构</h2>
<p>DeepSeek-Coder-V2 直接复用了 DeepSeek-V2 的架构:</p>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">Coder-V2 配置</th>
<th align="left">来源</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">MoE</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">总参数</td>
<td align="left">236B</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">激活参数/token</td>
<td align="left">21B</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">注意力</td>
<td align="left">MLA</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">KV 压缩维度</td>
<td align="left">512</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">路由专家数</td>
<td align="left">160</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">128K</td>
<td align="left">继承自 V2</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left">4T 代码 token</td>
<td align="left">新增</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: DeepSeek-Coder-V2 核心配置.</p>
</blockquote>
<p>架构完全继承自 V2 意味着 Coder-V2 的 MLA 和 DeepSeekMoE 设计与 V2 相同. 差异主要体现在数据和训练策略上.</p>
<hr>
<h2 id="3-sjgc-4t-dmyldgj">3 数据工程: 4T 代码语料的构建</h2>
<h3 id="3-1-sjlyyqx">3.1 数据来源与清洗</h3>
<p>Coder-V2 的预训练数据包括:</p>
<ul>
<li>GitHub 公开仓库</li>
<li>高质量技术文档</li>
<li>代码相关的自然语言文本</li>
</ul>
<p>数据清洗流程:</p>
<ol>
<li><strong>语言识别</strong>: 使用语法解析器识别 338 种编程语言.</li>
<li><strong>质量过滤</strong>: 基于星标数、代码复杂度、注释比例等指标过滤低质量文件.</li>
<li><strong>去重</strong>: 使用 MinHash 等算法去除重复代码片段.</li>
<li><strong>敏感信息过滤</strong>: 移除包含密钥、密码等敏感信息的文件.</li>
</ol>
<h3 id="3-2-fim-xlsj">3.2 FIM 训练数据</h3>
<p>Fill-in-the-Middle(FIM)是代码模型的关键能力. 训练时, 代码文件被随机分割为前缀-中间-后缀三部分, 模型需要预测中间段:</p>
<pre><code>&lt;PRE&gt; prefix &lt;SUF&gt; suffix &lt;MID&gt; middle
</code></pre>
<p>这种训练方式显著提升了代码补全和编辑能力. Coder-V2 使用 50% 的 FIM 格式数据和 50% 的标准 left-to-right 数据.</p>
<blockquote>
<p>译者注: FIM 训练不仅提升了代码补全能力, 还意外地改善了模型的「中间推理」能力. 在数学证明等需要「先给出结论再补充中间步骤」的任务中, FIM 训练过的模型表现更好. 这启发了 V3 的 MTP(Multi-Token Prediction)设计.</p>
</blockquote>
<hr>
<h2 id="4-xlcl">4 训练策略</h2>
<h3 id="4-1-cxyxl">4.1 持续预训练</h3>
<p>Coder-V2 不是从头训练, 而是在 DeepSeek-V2 的基础上进行持续预训练. 这种方式的优势在于:</p>
<ol>
<li><strong>节省计算成本</strong>: 无需重复通用预训练阶段.</li>
<li><strong>保留通用能力</strong>: 模型不会遗忘已有的语言知识和推理能力.</li>
<li><strong>快速收敛</strong>: 代码数据的分布与通用文本不同, 但模型已经具备强大的表示能力, 可以快速适应新分布.</li>
</ol>
<h3 id="4-2-sjdxxstd">4.2 三阶段学习率调度</h3>
<p>Coder-V2 采用三阶段学习率调度:</p>
<ol>
<li><strong>Warmup</strong>: 线性升温至峰值学习率.</li>
<li><strong>稳定期</strong>: 保持峰值学习率, 进行大部分训练.</li>
<li><strong>衰减期</strong>: 余弦衰减至最终学习率.</li>
</ol>
<p>这种调度方式在持续预训练中尤为重要, 因为它平衡了「适应新数据」和「保持旧知识」之间的张力.</p>
<hr>
<h2 id="5-xnyjx">5 性能与局限</h2>
<h3 id="5-1-dmnl">5.1 代码能力</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">Coder-V2</th>
<th align="left">GPT-4-Turbo</th>
<th align="left">Claude-3-Opus</th>
</tr>
</thead>
<tbody><tr>
<td align="left">HumanEval</td>
<td align="left">90.2%</td>
<td align="left">87.6%</td>
<td align="left">84.9%</td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="left">83.4%</td>
<td align="left">80.5%</td>
<td align="left">78.1%</td>
</tr>
<tr>
<td align="left">SWE-Bench</td>
<td align="left">18.7%</td>
<td align="left">12.5%</td>
<td align="left">14.8%</td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="left">43.4%</td>
<td align="left">38.1%</td>
<td align="left">35.2%</td>
</tr>
</tbody></table>
<p>Coder-V2 在代码生成基准上超越了当时的闭源模型, 成为开源社区最强的代码模型.</p>
<h3 id="5-2-tynlbc">5.2 通用能力保持</h3>
<p>尽管经过大量代码数据的持续预训练, Coder-V2 的通用能力(MMLU、GSM8K 等)并未显著下降. 这表明 MoE 架构的稀疏激活使得代码专家和通用专家可以共存, 互不干扰.</p>
<h3 id="5-3-jxx">5.3 局限性</h3>
<ol>
<li><strong>推理能力有限</strong>: Coder-V2 的推理能力主要依赖于 V2 的基础能力, 没有经过专门的 RL 优化. 在复杂算法设计上仍有提升空间.</li>
<li><strong>长上下文利用率</strong>: 虽然支持 128K 上下文, 但在实际的多文件代码理解中, 模型对远距离依赖的利用仍有局限.</li>
<li><strong>特定领域代码</strong>: 对于某些小众编程语言或领域特定代码(如硬件描述语言), 模型表现不如主流语言.</li>
</ol>
<hr>
<h2 id="6-pxdw">6 谱系定位</h2>
<p>Coder-V2 在 DeepSeek 家族树中的位置:</p>
<pre><code>DeepSeek-V2 (通用基座, 2024-05)
  |
  +--&gt; DeepSeek-Coder-V2 (代码专用, 2024-06)
  |       持续预训练 + FIM + 三阶段学习率
  |
  +--&gt; DeepSeek-V3 (通用升级, 2024-12)
  |       架构继承 + 工程极致
</code></pre>
<p>Coder-V2 验证了「通用 MoE 基座 + 领域持续预训练」这一路径的可行性. 这一策略后来被广泛应用于其他领域(如 Math、VL 等).</p>
<hr>
<blockquote>
<p>本文档为综合架构剖析. 详细精译见《01-DeepSeek-Coder-V2技术报告精译.md》, 架构深入分析见《05-DeepSeek-Coder-V2-Architecture-Overview.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-dmmxdtsxq","text":"1 设计动机: 代码模型的特殊需求"},{"level":2,"id":"2-ztjg","text":"2 整体架构"},{"level":2,"id":"3-sjgc-4t-dmyldgj","text":"3 数据工程: 4T 代码语料的构建"},{"level":3,"id":"3-1-sjlyyqx","text":"3.1 数据来源与清洗"},{"level":3,"id":"3-2-fim-xlsj","text":"3.2 FIM 训练数据"},{"level":2,"id":"4-xlcl","text":"4 训练策略"},{"level":3,"id":"4-1-cxyxl","text":"4.1 持续预训练"},{"level":3,"id":"4-2-sjdxxstd","text":"4.2 三阶段学习率调度"},{"level":2,"id":"5-xnyjx","text":"5 性能与局限"},{"level":3,"id":"5-1-dmnl","text":"5.1 代码能力"},{"level":3,"id":"5-2-tynlbc","text":"5.2 通用能力保持"},{"level":3,"id":"5-3-jxx","text":"5.3 局限性"},{"level":2,"id":"6-pxdw","text":"6 谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/02-deep-seek-coder-v2-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/04-deep-seek-coder-v2/02-deep-seek-coder-v2-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Coder-V2 核心架构剖析</h1>
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
