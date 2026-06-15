"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V4</h1>
<blockquote>
<p><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></p>
</blockquote>
<p>DeepSeek-V4 是 DeepSeek 在长上下文与系统级效率问题上的一次正面硬攻. 它不只是把上下文窗口从 128K 提到 1M, 而是围绕“百万 token 在生产环境里到底能不能用”这个问题, 一次性把注意力架构、残差连接、优化器、训练基础设施和后训练策略都重新设计了一遍.</p>
<h2 id="wddh">文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/10-deep-seek-v4/01-deep-seek-v4-jsbgjy">01-DeepSeek-V4 技术报告精译</a></td>
<td align="left">技术报告主稿精译与完整脉络</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/10-deep-seek-v4/02-deep-seek-v4-hxjgpx">02-DeepSeek-V4 核心架构剖析</a></td>
<td align="left">CSA、HCA、mHC、Muon 的结构拆解</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.1-deepseek/10-deep-seek-v4/05-deep-seek-v4-hxjgygxcsxwsjpx">05-DeepSeek-V4 核心架构与高效长上下文设计剖析</a></td>
<td align="left">从工程角度理解 V4 的效率路线</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-DeepSeek-V4 MinerU-EN</a></td>
<td align="left">英文整理稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-DeepSeek-V4 MinerU-ZH</a></td>
<td align="left">中文交付稿</td>
</tr>
</tbody></table>
<h2 id="jswtdy">技术问题定义</h2>
<p>DeepSeek-V4 要解决的是一个比“模型再大一点、分数再高一点”更难的问题: 当上下文走到百万 token 级别时, 标准注意力的计算量、KV Cache、训练稳定性、推理部署成本会同时爆炸. 因此它面临的是一个系统级问题, 不是单点架构 tweak 能解决的问题.</p>
<p>具体来说, 它试图同时回答四个问题:</p>
<ul>
<li>如何把注意力复杂度降下来, 但又不让长程语义理解明显塌陷</li>
<li>如何在超深超大模型中维持稳定的信号传播和训练收敛</li>
<li>如何让百万 token 场景下的 KV Cache 和单 token FLOPs 进入生产可接受范围</li>
<li>如何让长上下文能力、推理能力和 agent 能力同时存在, 而不是彼此挤压</li>
</ul>
<h2 id="ffcj">方法拆解</h2>
<p>V4 的方法主线很清楚, 也很激进:</p>
<ol>
<li>在注意力层引入 CSA + HCA 的混合压缩注意力架构.</li>
<li>用 mHC 替代传统更脆弱的残差连接形态, 稳住深层信号传递.</li>
<li>用 Muon 优化器提升超大规模训练下的收敛速度与稳定性.</li>
<li>对专家权重与部分路径引入 FP4 量化感知训练, 进一步压低内存和计算成本.</li>
<li>在训练基础设施层面配套做 Mega-Kernel、TileLang、异构 KV Cache、磁盘前缀缓存和两阶段上下文并行.</li>
<li>在后训练阶段先分领域培养专家, 再通过 on-policy distillation 融合成统一模型.</li>
</ol>
<p>这意味着 V4 的创新不是集中在某一个方程或某一个 trick 上, 而是一个完整的“架构-系统-训练-后训练”联动解法.</p>
<h2 id="gcyjgfx">工程与架构分析</h2>
<p>V4 最强的地方就在于工程完整性.</p>
<ul>
<li>CSA 和 HCA 的组合说明 DeepSeek 没有赌单一路线, 而是用“稀疏精确检索 + 极限压缩全局补偿”做互补.</li>
<li>mHC 解决的是训练可行性问题, 不是锦上添花的性能微调.</li>
<li>Muon 不只是换个优化器名字, 而是为 32T+ token 预训练的稳定收敛服务.</li>
<li>基础设施层的 wave 调度、Mega-Kernel 和异构 KV Cache 说明团队非常清楚真正的瓶颈不只在论文公式里, 还在通信、缓存和 kernel 细节里.</li>
<li>后训练阶段的“先分领域专家化、再统一蒸馏”也是非常现实的多目标优化解法, 避免一个模型直接被太多目标拉扯。</li>
</ul>
<p>从工程落地看, V4 的价值甚至不完全在 benchmark 分数, 而在它把 1M context 的成本从“几乎不可用”拉进了“可以认真考虑生产化”的区间.</p>
<h2 id="jlysybj">结论与适用边界</h2>
<p>DeepSeek-V4 适合被理解为“开源超长上下文路线的一个关键里程碑”. 它最适合的场景包括:</p>
<ul>
<li>大规模长文档分析</li>
<li>多文件代码仓库理解</li>
<li>长时程 agent 任务</li>
<li>需要把推理扩展到超长输入环境的系统</li>
</ul>
<p>它的边界也同样清楚:</p>
<ul>
<li>世界知识与最强闭源模型仍有明显差距, 尤其在 factual QA 上</li>
<li>复杂 agent 任务虽然逼近闭源, 但并未完全超越</li>
<li>百万 token 的可用性不代表任意长上下文都能无损工作, 压缩注意力仍然存在信息损失边界</li>
</ul>
<p>如果说 V3 的关键词是“高效 MoE”, 那么 V4 的关键词就是“把百万上下文从理论能力改造成工程能力”.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"wddh","text":"文档导航"},{"level":2,"id":"jswtdy","text":"技术问题定义"},{"level":2,"id":"ffcj","text":"方法拆解"},{"level":2,"id":"gcyjgfx","text":"工程与架构分析"},{"level":2,"id":"jlysybj","text":"结论与适用边界"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/10-deep-seek-v4/05-deep-seek-v4-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/10-deep-seek-v4/05-deep-seek-v4-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V4</h1>
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
