"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2.4 · 前沿架构与变体</h1>
<h2 id="1-zjdw">1. 章节定位</h2>
<p>当标准 Transformer 的优化空间被逐渐榨干,研究界开始探索<strong>根本性的架构变革</strong>. 这些变革不是对注意力机制的修修补补,而是对&quot;如何组织神经网络计算&quot;这一元问题的重新回答. </p>
<p>本章聚焦于目前最成功、最具工业落地价值的架构变体：<strong>混合专家模型(Mixture of Experts, MoE)</strong> . MoE 的核心洞见令人震惊——与其让所有参数参与每个 token 的计算,不如只激活一小部分&quot;专家&quot;参数. 这种稀疏激活策略让模型参数量可以膨胀到万亿级别,而每次前向传播的计算成本仅与稠密模型的 1/8 ~ 1/32 相当. </p>
<p>DeepSeek-V2/V3、Mixtral 8×7B、Qwen2-57B-A14B 等当前最顶级的开源模型,无一不是 MoE 架构的信徒. </p>
<hr>
<h2 id="2-bznrsy">2. 本章内容索引</h2>
<table>
<thead>
<tr>
<th>编号</th>
<th>文章</th>
<th>核心内容</th>
<th>难度</th>
</tr>
</thead>
<tbody><tr>
<td>2.4.1</td>
<td><a href="/llm-guide/2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/2.4.1-hhzjmx-moe">混合专家模型 MoE</a></td>
<td>DeepSeek-MoE 的细粒度路由、共享专家设计; MoE 工程实践中的负载均衡、通信优化与部署陷阱</td>
<td>⭐⭐⭐</td>
</tr>
<tr>
<td>2.4.2</td>
<td><a href="/llm-guide/2-arch/2.4-frontier-arch/2.4.2-ztkjmx-ssm/2.4.2-ztkjmx-ssm">状态空间模型 SSM</a></td>
<td>SSM 理论、S4、HiPPO、连续到离散的数学推导</td>
<td>⭐⭐⭐⭐</td>
</tr>
<tr>
<td>2.4.3</td>
<td><a href="/llm-guide/2-arch/2.4-frontier-arch/2.4.3-mamba-xl/2.4.3-mamba-xl">Mamba 系列</a></td>
<td>Mamba、Mamba-2、Jamba、Falcon-Mamba 等选择性状态空间模型</td>
<td>⭐⭐⭐⭐</td>
</tr>
<tr>
<td>2.4.4</td>
<td><a href="/llm-guide/2-arch/2.4-frontier-arch/2.4.4-xx-rnn-y-griffin/2.4.4-xx-rnn-y-griffin">线性 RNN 与 Griffin</a></td>
<td>RWKV、Griffin、Hawk 等线性循环架构</td>
<td>⭐⭐⭐</td>
</tr>
<tr>
<td>2.4.5</td>
<td><a href="/llm-guide/2-arch/2.4-frontier-arch/2.4.5-xxjgyhhmx/2.4.5-xxjgyhhmx">新兴架构与混合模型</a></td>
<td>其他新兴架构与混合设计</td>
<td>⭐⭐⭐</td>
</tr>
</tbody></table>
<hr>
<h2 id="3-ydlxjy">3. 阅读路线建议</h2>
<p><strong>必读</strong>：2.4.1 的 DeepSeek-MoE 专题. 理解为什么 DeepSeek 能在参数量媲美 GPT-4 的同时保持开源和低成本训练,MoE 是答案的核心部分. </p>
<p><strong>家谱提示</strong>：MoE 不是独立的优化技巧,而是与 2.3(高效注意力)、3.2(预训练策略)、4.6(OPD 蒸馏)紧密耦合的系统设计. 一个万亿参数的 MoE 模型,如果没有 9.3(分布式训练框架)中的专家并行策略,根本无法训练. </p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-zjdw","text":"1. 章节定位"},{"level":2,"id":"2-bznrsy","text":"2. 本章内容索引"},{"level":2,"id":"3-ydlxjy","text":"3. 阅读路线建议"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4-frontier-arch" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4-frontier-arch" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2.4 · 前沿架构与变体</h1>
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
