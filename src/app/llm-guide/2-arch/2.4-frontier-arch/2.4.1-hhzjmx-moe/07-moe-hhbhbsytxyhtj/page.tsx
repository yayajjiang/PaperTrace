"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE 混合并行部署与通信优化图解</h1>
<blockquote>
<p>本文基于图解方式解析 MoE 模型在多卡环境下的混合并行部署策略, 涵盖 TP(张量并行)、EP(专家并行)的计算流程与通信优化, 以及通算融合的前沿实践. </p>
</blockquote>
<hr>
<h2 id="1-dktl-moe-mx">1. 单卡推理 MoE 模型</h2>
<h3 id="1-1-moe-mkjg">1.1 MoE 模块结构</h3>
<p>相比于传统 Transformer 的 FFN 层, MoE 模块增加了三个核心组件：</p>
<ol>
<li><strong>门控网络(Gating/Router)</strong> ：通过 activation 计算每个 token 应该选择哪些专家</li>
<li><strong>Dispatch 模块</strong>：建立 token 到专家的映射, 将输入分发到对应专家</li>
<li><strong>Combine 模块</strong>：将各专家的输出按权重聚合回原始 token 位置</li>
</ol>
<h3 id="1-2-deep-gemm-dlz-layout">1.2 DeepGEMM 的两种 Layout</h3>
<p><strong>Contiguous Layout</strong>：在 Prefill 或训练前向阶段使用. 由于不同专家接收的 token 数量不一致, 系统将各专家的 token 按顺序拼接为连续输入 buffer, 通过 offset/index 进行逻辑划分. 每个专家必须对齐到 M 块大小(如 128), 以最大化 Tensor Core 利用率, 避免尾部不对齐带来的低效计算. </p>
<p><strong>Masked Layout</strong>：在 Decoding + CUDA Graph 场景下使用. 由于 expert-token 分配在运行时动态变化且无法被 CPU 感知, 采用 mask-based grouped GEMM 方案替代传统显式分组, 可兼容 CUDA Graph, 没有冗余计算浪费, 通过更精细的控制获得更好性能. </p>
<hr>
<h2 id="2-dk-tp-bhtl-moe-mx">2. 多卡 TP 并行推理 MoE 模型</h2>
<h3 id="2-1-tp-bhjslc">2.1 TP 并行计算流程</h3>
<p>张量并行(Tensor Parallelism, TP)将模型的参数按列或行切分到多张 GPU 上：</p>
<ul>
<li><strong>Attention 层</strong>：Q/K/V 投影和输出投影按列/行切分, 通过 AllReduce 聚合结果</li>
<li><strong>MoE FFN</strong>：专家本身的参数可以在 TP 维度上拆分</li>
<li><strong>Dispatch/Combine</strong>：在 TP 组内同步后, 再进入 EP 阶段</li>
</ul>
<h3 id="2-2-all-reduce-dtxkx">2.2 AllReduce 的通信开销</h3>
<p>TP 并行中, 每次矩阵乘法后都需要 AllReduce 操作来聚合结果. 对于 MoE 模型, 这会产生额外的通信量：</p>
<ul>
<li>标准 Transformer：每层 2 次 AllReduce(Attention + FFN)</li>
<li>MoE 模型：每层 2 次 AllReduce(Attention)+ EP 阶段的 All2All</li>
</ul>
<hr>
<h2 id="3-dk-ep-bhtl-moe-mx">3. 多卡 EP 并行推理 MoE 模型</h2>
<h3 id="3-1-ep-bhjslc">3.1 EP 并行计算流程</h3>
<p>专家并行(Expert Parallelism, EP)将不同的专家放置在不同的 GPU 上：</p>
<ol>
<li><strong>Token 路由</strong>：门控网络计算每个 token 的 top-k 专家选择</li>
<li><strong>Dispatch(All2All)</strong> ：将 token 发送到其目标专家所在的 GPU</li>
<li><strong>专家计算</strong>：各 GPU 上的专家独立处理分配到的 token</li>
<li><strong>Combine(All2All)</strong> ：将专家输出送回原始 token 位置</li>
<li><strong>加权聚合</strong>：按门控权重合并多个专家的输出</li>
</ol>
<h3 id="3-2-ep-bhdtxtz">3.2 EP 并行的通信挑战</h3>
<p>相比单卡部署, EP 并行的 Dispatch 和 Combine 模块中多了 <strong>Rank 维度</strong>：</p>
<ul>
<li>单卡：Token ↔ Expert 的映射</li>
<li>EP 多卡：Token ↔ Rank ↔ Expert 的三维映射</li>
</ul>
<p>传统的 NCCL(区别于 NCCL-EP 工作)对于 All2All 支持不够友好, 因此需要 <strong>DeepEP</strong> 等专门优化：</p>
<ul>
<li>动态路由的通信调度</li>
<li>与计算的重叠(Overlap)</li>
<li>细粒度的 buffer 管理</li>
</ul>
<hr>
<h2 id="4-tp-ep-hhbh">4. TP + EP 混合并行</h2>
<h3 id="4-1-hhbsjg">4.1 混合部署结构</h3>
<p>实际大规模部署中, 通常采用 TP + EP 的混合策略：</p>
<ul>
<li><strong>TP 组内</strong>：Attention 计算、共享参数(如嵌入层、LayerNorm)</li>
<li><strong>EP 组内</strong>：专家分布、All2All 通信</li>
<li><strong>DP 维度</strong>：数据并行扩展 batch size</li>
</ul>
<p>以 16 GPU 的 MetaShuffling 方案为例：</p>
<ul>
<li>GPU 0-7：TP 组 1, 包含部分专家的副本</li>
<li>GPU 8-15：TP 组 2, 包含另一部分专家的副本</li>
<li>组间通过 EP 的 All2All 交换 token</li>
</ul>
<h3 id="4-2-jslcjx">4.2 计算流程解析</h3>
<ol>
<li>输入 Batch 进入 Attention 计算, Attention 层在 TP 维度上拆分为 TP0 和 TP1 两部分, 分别计算后通过 AllReduce 聚合</li>
<li>Attention 输出进入 Dispatch 模块, 将数据按路由分发到不同专家</li>
<li>在 EP Group 中, 每个专家独立处理分配到的 token</li>
<li>处理完成后, 通过 Combine 模块将各专家输出合并</li>
<li>最终结果输出回对应 Batch</li>
</ol>
<hr>
<h2 id="5-tsrhyh">5. 通算融合优化</h2>
<h3 id="5-1-all-reduce-cjyh">5.1 AllReduce 拆解优化</h3>
<p>核心洞察：<strong>AllReduce 可拆解为 Reduce-Scatter + All-Gather</strong></p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\text{AllReduce}(x) = \\text{AllGather}(\\text{ReduceScatter}(x))\\tag{1} \\tag{1}</span><p>基于此, 可以将 Reduce-Scatter 和 All-Gather 分别与其相邻的 GEMM 结合, 在 GEMM 计算过程中利用通信单元空闲特性进行 Overlap. </p>
<p><strong>限制条件</strong>：</p>
<ul>
<li>第一层的 Attention QKV GEMM 和最后一层的 MoE FFN Out/Down GEMM <strong>无法做 Overlap</strong></li>
<li>需要仔细验证通信转移后中间操作不会影响最终结果</li>
</ul>
<h3 id="5-2-qytxyhgz">5.2 前沿通信优化工作</h3>
<table>
<thead>
<tr>
<th align="left">工作</th>
<th align="left">核心思想</th>
<th align="left">适用场景</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Flux</strong></td>
<td align="left">软件层面的通信-计算重叠</td>
<td align="left">通用 GPU 集群</td>
</tr>
<tr>
<td align="left"><strong>Comet</strong></td>
<td align="left">细粒度通算重叠</td>
<td align="left">MoE 推理</td>
</tr>
<tr>
<td align="left"><strong>Deep-EP</strong></td>
<td align="left">专家并行通信优化</td>
<td align="left">EP 部署</td>
</tr>
<tr>
<td align="left"><strong>NCCL-EP</strong></td>
<td align="left">NCCL 层的 EP 优化</td>
<td align="left">大规模 EP</td>
</tr>
<tr>
<td align="left"><strong>Triton-Distributed</strong></td>
<td align="left">Python 级通信原语</td>
<td align="left">灵活部署</td>
</tr>
<tr>
<td align="left"><strong>Parallel-Kittens</strong></td>
<td align="left">细粒度并行调度</td>
<td align="left">高吞吐推理</td>
</tr>
<tr>
<td align="left"><strong>FlashCommunication V2</strong></td>
<td align="left">任意位宽通信</td>
<td align="left">量化模型</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-zj">6. 总结</h2>
<p>MoE 模型的混合并行部署涉及复杂的计算-通信权衡：</p>
<ol>
<li><strong>TP 并行</strong>解决单专家参数量过大问题, 但引入 AllReduce 开销</li>
<li><strong>EP 并行</strong>解决专家数量过多问题, 但引入 All2All 开销</li>
<li><strong>通算融合</strong>是缓解通信瓶颈的核心方向, 关键在于识别可重叠的计算与通信窗口</li>
<li><strong>布局选择</strong>(Contiguous vs Masked)需根据 Prefill/Decoding 场景动态调整</li>
</ol>
<blockquote>
<p>参考来源：<a href="https://zhuanlan.zhihu.com/p/2019814309815927081">图解MoE模型的混合并行部署与通信优化</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dktl-moe-mx","text":"1. 单卡推理 MoE 模型"},{"level":3,"id":"1-1-moe-mkjg","text":"1.1 MoE 模块结构"},{"level":3,"id":"1-2-deep-gemm-dlz-layout","text":"1.2 DeepGEMM 的两种 Layout"},{"level":2,"id":"2-dk-tp-bhtl-moe-mx","text":"2. 多卡 TP 并行推理 MoE 模型"},{"level":3,"id":"2-1-tp-bhjslc","text":"2.1 TP 并行计算流程"},{"level":3,"id":"2-2-all-reduce-dtxkx","text":"2.2 AllReduce 的通信开销"},{"level":2,"id":"3-dk-ep-bhtl-moe-mx","text":"3. 多卡 EP 并行推理 MoE 模型"},{"level":3,"id":"3-1-ep-bhjslc","text":"3.1 EP 并行计算流程"},{"level":3,"id":"3-2-ep-bhdtxtz","text":"3.2 EP 并行的通信挑战"},{"level":2,"id":"4-tp-ep-hhbh","text":"4. TP + EP 混合并行"},{"level":3,"id":"4-1-hhbsjg","text":"4.1 混合部署结构"},{"level":3,"id":"4-2-jslcjx","text":"4.2 计算流程解析"},{"level":2,"id":"5-tsrhyh","text":"5. 通算融合优化"},{"level":3,"id":"5-1-all-reduce-cjyh","text":"5.1 AllReduce 拆解优化"},{"level":3,"id":"5-2-qytxyhgz","text":"5.2 前沿通信优化工作"},{"level":2,"id":"6-zj","text":"6. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/07-moe-hhbhbsytxyhtj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/07-moe-hhbhbsytxyhtj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE 混合并行部署与通信优化图解</h1>
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
