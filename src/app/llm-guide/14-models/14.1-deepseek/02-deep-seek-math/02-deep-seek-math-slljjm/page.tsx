"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Math 数理逻辑解码</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《DeepSeek-Math 技术报告精译》与 D5 核心技术专题, 对 DeepSeek-Math 的数理逻辑能力进行系统性梳理. Math 是 DeepSeek 在数学推理领域的专项模型, 首次提出了 GRPO 算法.
详细分析请参阅 <a href="/llm-guide/14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-mathematical-reasoning">05-DeepSeek-Math-Mathematical-Reasoning.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-sxtldtstz">1 设计动机: 数学推理的特殊挑战</h2>
<p>DeepSeek-Math 发布于 2024 年 2 月, 其核心任务是解决数学推理的三个挑战:</p>
<ol>
<li><strong>精确性</strong>: 数学答案需要完全正确, 近似或部分正确都不得分.</li>
<li><strong>多步推理</strong>: 复杂数学问题需要数十步的逻辑推导.</li>
<li><strong>形式多样性</strong>: 数学问题涵盖代数、几何、微积分、概率等多个子领域.</li>
</ol>
<blockquote>
<p>译者注: 数学推理是检验大模型逻辑能力的「试金石」. 与开放式文本生成不同, 数学问题的答案可以被客观验证, 这使得数学成为研究推理机制的理想领域. DeepSeek-Math 的探索直接催生了 R1-Zero 的纯 RL 训练范式.</p>
</blockquote>
<hr>
<h2 id="2-ztjg">2 整体架构</h2>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">Math 配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">Dense Transformer</td>
</tr>
<tr>
<td align="left">模型尺寸</td>
<td align="left">7B</td>
</tr>
<tr>
<td align="left">基础模型</td>
<td align="left">DeepSeek-Coder-Base-v1.5 7B</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left">120B 数学 token</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">4K</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: DeepSeek-Math 核心配置.</p>
</blockquote>
<p>Math 选择 7B Dense 模型而非更大的 MoE, 原因是: 数学推理主要依赖逻辑能力而非参数容量, 且 7B 模型便于快速实验和迭代.</p>
<hr>
<h2 id="3-hxcx">3 核心创新</h2>
<h3 id="3-1-sxyxlsjgc">3.1 数学预训练数据工程</h3>
<p>DeepSeek-Math 收集了 120B 数学相关的 token, 来源包括:</p>
<ul>
<li>网页上的数学内容(经过质量过滤)</li>
<li>数学教科书和论文</li>
<li>代码中的数学实现</li>
</ul>
<p>数据清洗流程:</p>
<ol>
<li><strong>数学内容识别</strong>: 使用启发式规则识别包含数学表达式的网页.</li>
<li><strong>质量评分</strong>: 基于内容长度、公式密度、逻辑结构等指标评分.</li>
<li><strong>去重</strong>: 去除重复的数学问题和证明.</li>
</ol>
<h3 id="3-2-grpo-dqy">3.2 GRPO 的起源</h3>
<p>DeepSeek-Math 首次提出了 Group Relative Policy Optimization(GRPO), 这是 R1-Zero 和 R1 的核心 RL 算法.</p>
<p>GRPO 的核心洞察: <strong>在数学推理中, 价值模型难以准确预测多步推理的最终奖励</strong>. 因为推理过程中的中间步骤可能看起来合理, 但最终答案却完全错误.</p>
<p>GRPO 的解决方案是<strong>组内相对评分</strong>: 对于同一个问题, 采样多个输出, 用它们之间的相对比较来计算优势, 而不是依赖价值模型的绝对预测.</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>A</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><msub><mi>r</mi><mi>i</mi></msub><mo>−</mo><mtext>mean</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>r</mi><mi>G</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow><mrow><mtext>std</mtext><mo stretchy="false">(</mo><mo stretchy="false">{</mo><msub><mi>r</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>r</mi><mi>G</mi></msub><mo stretchy="false">}</mo><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">A_i = \\frac{r_i - \\text{mean}(\\{r_1, \\cdots, r_G\\})}{\\text{std}(\\{r_1, \\cdots, r_G\\})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord text"><span class="mord">std</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">})</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord text"><span class="mord">mean</span></span><span class="mopen">({</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">})</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><blockquote>
<p>译者注: GRPO 的设计体现了 DeepSeek 团队对 RL 本质的深刻理解. 传统 PPO 的价值模型在短文本生成中工作良好, 因为部分响应可以较好地预测最终质量. 但在长思维链场景中, 模型可能在生成过程中进行反思和修正, 使得基于部分响应的预测几乎不可能. GRPO 通过「相对比较」绕开了这个难题, 这一思路后来被推广到所有需要长推理的场景.</p>
</blockquote>
<h3 id="3-3-dd-rl-xl">3.3 迭代 RL 训练</h3>
<p>DeepSeek-Math 采用迭代 RL 训练:</p>
<ol>
<li>用当前模型生成大量推理轨迹.</li>
<li>过滤出答案正确的轨迹作为新的训练数据.</li>
<li>用新数据继续训练模型.</li>
<li>重复上述过程多轮.</li>
</ol>
<p>这种自举(bootstrapping)方式使得模型可以逐步提升推理能力, 类似于 AlphaGo 的自我对弈.</p>
<hr>
<h2 id="4-xnyyx">4 性能与影响</h2>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">DeepSeek-Math 7B</th>
<th align="left">GPT-4</th>
<th align="left">Minerva 540B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GSM8K</td>
<td align="left">64.2%</td>
<td align="left">92.0%</td>
<td align="left">58.8%</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="left">36.2%</td>
<td align="left">42.5%</td>
<td align="left">33.6%</td>
</tr>
<tr>
<td align="left">College Math</td>
<td align="left">38.6%</td>
<td align="left">-</td>
<td align="left">-</td>
</tr>
</tbody></table>
<p>DeepSeek-Math 7B 在多个数学基准上超越了 540B 的 Minerva, 证明了「领域数据 + 专门训练」可以弥补参数量的差距.</p>
<p>更重要的是, DeepSeek-Math 的探索直接影响了后续模型:</p>
<ol>
<li><strong>GRPO</strong>: 成为 R1-Zero 和 R1 的核心 RL 算法.</li>
<li><strong>迭代 RL</strong>: 启发了 R1 的多阶段训练流水线.</li>
<li><strong>数学数据工程</strong>: 为 Qwen2.5-Math 等模型提供了方法论参考.</li>
</ol>
<hr>
<blockquote>
<p>本文档为数理逻辑解码. 详细精译见《01-DeepSeek-Math技术报告精译.md》, GRPO 深入分析见《05-DeepSeek-Math-Mathematical-Reasoning.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-sxtldtstz","text":"1 设计动机: 数学推理的特殊挑战"},{"level":2,"id":"2-ztjg","text":"2 整体架构"},{"level":2,"id":"3-hxcx","text":"3 核心创新"},{"level":3,"id":"3-1-sxyxlsjgc","text":"3.1 数学预训练数据工程"},{"level":3,"id":"3-2-grpo-dqy","text":"3.2 GRPO 的起源"},{"level":3,"id":"3-3-dd-rl-xl","text":"3.3 迭代 RL 训练"},{"level":2,"id":"4-xnyyx","text":"4 性能与影响"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/02-deep-seek-math/02-deep-seek-math-slljjm" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/02-deep-seek-math/02-deep-seek-math-slljjm" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Math 数理逻辑解码</h1>
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
