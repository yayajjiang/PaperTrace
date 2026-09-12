"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE 硬件加速架构综述：从 FPGA 到近存计算</h1>
<blockquote>
<p>本文综述 MoE 模型在硬件层面的加速研究, 涵盖 FPGA、GPU+NDP 异构、PIM 等新型架构, 以及负载均衡、专家预测、N:M 剪枝等关键技术. </p>
</blockquote>
<hr>
<h2 id="1-fpga-jsq">1. FPGA 加速器</h2>
<h3 id="1-1-ubi-mo-e-hhjsms">1.1 UbiMoE：混合计算模式</h3>
<p><strong>核心设计</strong>：</p>
<ul>
<li><strong>延迟优化的流式注意力核</strong>：优化数据加载, 固定 Q、广播 K, 降低访存</li>
<li><strong>可复用线性核</strong>：硬件级动态数据调度, 保证负载均衡, 可配置为 Dense 模式</li>
<li><strong>自动搜索算法</strong>：根据 FPGA 资源约束自动调整硬件参数</li>
</ul>
<p><strong>创新点</strong>：两套核协同工作, 流式注意力处理计算密集部分, 可复用线性核处理专家计算. </p>
<h3 id="1-2-flame-qly-moe-xsx">1.2 FLAME：全利用 MoE 稀疏性</h3>
<p><strong>三大亮点</strong>：</p>
<ol>
<li><strong>存储优化</strong>：N:M 剪枝策略——M 个参数中保留 N 个, 大幅削减专家参数规模</li>
<li><strong>调度优化</strong>：专家预测机制<ul>
<li>发现专家激活路径分布高度集中, 有明显冷热特性</li>
<li>提出循环预测机制 CEPR：使用上一个输出 token 的末期层信息预测下一个输出 token 的早期层</li>
</ul>
</li>
<li><strong>实现架构</strong>：离线学习优化 + 在线动态调度的两阶段结构</li>
</ol>
<hr>
<h2 id="2-byyyddjs">2. 边缘与移动端加速</h2>
<h3 id="2-1-edge-moe-dddsj-transformer-jsq">2.1 Edge-MoE：端到端视觉 Transformer 加速器</h3>
<p><strong>关键组件</strong>：</p>
<ul>
<li>任务特定的门控网络(gating network), 生成专家选择信号</li>
<li>Patch 重排与分组机制, 整合专家权重加载、减少内存访问开销</li>
<li>统一灵活的线性模块(Unified Linear Module), 整合模型中大部分线性层</li>
<li>高效的注意力重排模块(Attention Reordering Module), 大幅降低内存访问量并提升并行度</li>
<li>单次计算、准确且低成本的 Softmax 近似模块</li>
<li>高精度、低成本的 GELU 近似模块</li>
</ul>
<hr>
<h2 id="3-jcjs-near-data-processing">3. 近存计算(Near-Data Processing)</h2>
<h3 id="3-1-mo-nde-gpu-ndp-ygjg">3.1 MoNDE：GPU + NDP 异构架构</h3>
<p><strong>设计思想</strong>：</p>
<ul>
<li>分别执行冷热专家(热专家在 GPU, 冷专家在 NDP)</li>
<li><strong>传输激活值, 不传输权重</strong>, 减少数据传输量</li>
<li>NDP(Near-Data Processing)设备靠近存储, 减少数据搬运</li>
</ul>
<h3 id="3-2-duplex-ysqdgzdygjs">3.2 Duplex：运算强度感知的异构计算</h3>
<p><strong>核心观察</strong>：不同层之间的运算强度(计算量/访存量)差异显著. </p>
<p><strong>协同运算策略</strong>：</p>
<ul>
<li><strong>高运算强度的 Attn 层</strong>：采用 xPU 计算</li>
<li><strong>低运算强度的 MoE 层</strong>：采用 Logic-PIM 计算</li>
<li>Logic-PIM 使用 TSV 技术链接 DRAM 和 logic 单元</li>
</ul>
<h3 id="3-3-pi-mo-e-npu-pim-ygjc">3.3 PIMoE：NPU-PIM 异构集成</h3>
<p><strong>节流感知任务卸载(Throttle-Aware Task Offloading)</strong> ：</p>
<ul>
<li>通过迭代重分配推理时间最长的专家到 NPU</li>
<li>在 PIM 与 NPU 之间优化专家分配</li>
<li>缓解负载不均导致的性能瓶颈</li>
</ul>
<p><strong>数据压缩模块(Data Condenser)</strong> ：</p>
<ul>
<li>过滤零权重, 重排非零权重</li>
<li>通过去除零元素减少 DRAM 向 NPU 传输量</li>
</ul>
<hr>
<h2 id="4-gjjsdb">4. 关键技术对比</h2>
<table>
<thead>
<tr>
<th align="left">工作</th>
<th align="left">平台</th>
<th align="left">核心技术</th>
<th align="left">优化目标</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>UbiMoE</strong></td>
<td align="left">FPGA</td>
<td align="left">流式注意力核 + 可复用线性核</td>
<td align="left">延迟优化、负载均衡</td>
</tr>
<tr>
<td align="left"><strong>FLAME</strong></td>
<td align="left">FPGA</td>
<td align="left">N:M 剪枝 + CEPR 预测</td>
<td align="left">存储削减、调度优化</td>
</tr>
<tr>
<td align="left"><strong>Edge-MoE</strong></td>
<td align="left">边缘设备</td>
<td align="left">端到端加速器 + 近似模块</td>
<td align="left">内存效率、低功耗</td>
</tr>
<tr>
<td align="left"><strong>MoNDE</strong></td>
<td align="left">GPU+NDP</td>
<td align="left">冷热专家分离</td>
<td align="left">减少数据传输</td>
</tr>
<tr>
<td align="left"><strong>Duplex</strong></td>
<td align="left">xPU+Logic-PIM</td>
<td align="left">运算强度感知调度</td>
<td align="left">层间协同优化</td>
</tr>
<tr>
<td align="left"><strong>PIMoE</strong></td>
<td align="left">NPU+PIM</td>
<td align="left">节流感知卸载 + 数据压缩</td>
<td align="left">负载均衡、带宽优化</td>
</tr>
</tbody></table>
<hr>
<h2 id="5-qsyzw">5. 趋势与展望</h2>
<h3 id="5-1-zjyccwgj">5.1 专家预测成为关键</h3>
<p>FLAME 的 CEPR 机制表明, 专家激活路径具有高度可预测性. 未来的硬件设计可以：</p>
<ul>
<li>预加载预测的热专家权重</li>
<li>动态调整计算资源分配</li>
<li>减少路由决策的延迟</li>
</ul>
<h3 id="5-2-jcjssfx">5.2 近存计算是方向</h3>
<p>MoE 的稀疏性导致大量权重闲置. 近存计算(NDP/PIM)可以：</p>
<ul>
<li>将计算推向数据, 而非数据推向计算</li>
<li>显著减少权重搬运的能耗</li>
<li>支持更大规模的专家并行</li>
</ul>
<h3 id="5-3-xsxyyjxtsj">5.3 稀疏性与硬件协同设计</h3>
<p>N:M 剪枝、块稀疏、动态稀疏等算法层面的稀疏性, 需要硬件层面的配套支持：</p>
<ul>
<li>稀疏矩阵运算单元</li>
<li>零值跳过机制</li>
<li>动态数据调度</li>
</ul>
<blockquote>
<p>参考来源：<a href="https://zhuanlan.zhihu.com/p/1960776777216550865">MoE 研究进展：算法、系统与架构综述(四)-架构篇</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-fpga-jsq","text":"1. FPGA 加速器"},{"level":3,"id":"1-1-ubi-mo-e-hhjsms","text":"1.1 UbiMoE：混合计算模式"},{"level":3,"id":"1-2-flame-qly-moe-xsx","text":"1.2 FLAME：全利用 MoE 稀疏性"},{"level":2,"id":"2-byyyddjs","text":"2. 边缘与移动端加速"},{"level":3,"id":"2-1-edge-moe-dddsj-transformer-jsq","text":"2.1 Edge-MoE：端到端视觉 Transformer 加速器"},{"level":2,"id":"3-jcjs-near-data-processing","text":"3. 近存计算(Near-Data Processing)"},{"level":3,"id":"3-1-mo-nde-gpu-ndp-ygjg","text":"3.1 MoNDE：GPU + NDP 异构架构"},{"level":3,"id":"3-2-duplex-ysqdgzdygjs","text":"3.2 Duplex：运算强度感知的异构计算"},{"level":3,"id":"3-3-pi-mo-e-npu-pim-ygjc","text":"3.3 PIMoE：NPU-PIM 异构集成"},{"level":2,"id":"4-gjjsdb","text":"4. 关键技术对比"},{"level":2,"id":"5-qsyzw","text":"5. 趋势与展望"},{"level":3,"id":"5-1-zjyccwgj","text":"5.1 专家预测成为关键"},{"level":3,"id":"5-2-jcjssfx","text":"5.2 近存计算是方向"},{"level":3,"id":"5-3-xsxyyjxtsj","text":"5.3 稀疏性与硬件协同设计"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/06-moe-yjjsjgzs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/06-moe-yjjsjgzs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE 硬件加速架构综述：从 FPGA 到近存计算</h1>
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
