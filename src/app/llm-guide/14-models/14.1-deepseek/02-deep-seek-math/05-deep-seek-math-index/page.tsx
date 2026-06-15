"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-Math</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<p>DeepSeek-Math 是 DeepSeek 在数学推理方向上的关键专项模型。它一方面通过 120B 数学相关 token 的数据工程，把 7B 级别模型推到了接近 GPT-4 的竞赛级数学推理水平; 另一方面又首次提出了 GRPO，为后续 DeepSeek 全系推理模型的强化学习路线奠定了基础。</p>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-Math 要解决的是两个问题：</p>
<ol>
<li>如何在开放可用的 7B 规模模型上，把数学推理能力推到接近闭源前沿模型的水平。</li>
<li>如何在不承受 PPO 全套训练成本的情况下，找到更适合长链条数学推理的强化学习方法。</li>
</ol>
<p>这两个问题背后有几个约束：</p>
<ul>
<li>数学数据不能只依赖 arXiv 论文，需要更贴近真实解题场景的网页内容。</li>
<li>基座模型必须具备足够强的结构化推理能力，因此代码模型比通用模型更适合做起点。</li>
<li>RL 阶段必须尽量降低显存和训练成本，否则 7B 规模也难以高效迭代。</li>
<li>评测不能只看英文，还要验证中文数学推理和形式化数学能力。</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>DeepSeek-Math 的方法链条可以概括为三段。</p>
<p>第一段是数学数据工程：从 OpenWebMath 种子出发，通过 fastText 分类器做四轮 Common Crawl 迭代挖掘，最终构建出 120B token 的 DeepSeekMath Corpus。</p>
<p>第二段是数学继续预训练：以 DeepSeek-Coder-Base-v1.5 7B 为初始化基座，继续训练 500B token，把代码模型的结构化推理能力迁移到数学推理上。</p>
<p>第三段是后训练增强：先用 776K 中英双语数学指令数据做 SFT，再引入 GRPO 替代传统 PPO，通过组内相对奖励估计基线来提升 RL 的效率和稳定性。</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>DeepSeek-Math 最重要的工程价值不只是“数学分数更高”，而是它证明了三件事。</p>
<p>第一，网页数学数据在很多时候比 arXiv 更有效。因为竞赛题和数学问答更接近自然语言推理分布，而不是高度形式化的论文表达。</p>
<p>第二，代码训练对数学推理确实有正向迁移。DeepSeek 不是从通用 LLM 起步，而是从 Coder-Base-v1.5 起步，这一选择后来被整个家族反复继承。</p>
<p>第三，GRPO 把 PPO 里最重的一部分，也就是 value model，直接拿掉了。它用“同一问题下多条回答的组内平均奖励”做基线，显著降低了强化学习训练成本，并且在数学任务上证明了有效性。</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>DeepSeek-Math 是 DeepSeek 家族里“数据工程 + 代码基座 + RL 方法创新”三者首次真正汇合的版本。它的重要性不只在于自己分数高，更在于它把后面 R1 所需的关键技术路径先跑通了。</p>
<p>它适合的场景包括：</p>
<ul>
<li>竞赛级和多步数学推理</li>
<li>程序辅助数学求解</li>
<li>中英文数学问答</li>
<li>强调步骤化解释的数学推理任务</li>
</ul>
<p>它的边界也很明确：</p>
<ul>
<li>在几何和形式化证明上仍弱于最强闭源模型。</li>
<li>7B 规模决定了 few-shot 学习能力上限有限。</li>
<li>旧版 D4 和 Index 都不能直接视为合格交付，需要按当前标准重做和增强。</li>
</ul>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/02-deep-seek-math/01-deep-seek-math-jsbgjy">01-DeepSeek-Math 技术报告精读</a></td>
<td align="left">技术报告全文精译</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/02-deep-seek-math/02-deep-seek-math-slljjm">02-DeepSeek-Math 数理逻辑解码</a></td>
<td align="left">数理逻辑深度解码</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-mathematical-reasoning">05-DeepSeek-Math 数理逻辑解码</a></td>
<td align="left">数学推理机制深度解读</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-Math MinerU-EN</a></td>
<td align="left">原始英文 Markdown(MinerU 解析)</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-Math MinerU-ZH</a></td>
<td align="left">中英对照+译者注(MinerU 解析)</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"},{"level":2,"id":"wddh","text":"文档导航"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/02-deep-seek-math/05-deep-seek-math-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-Math</h1>
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
