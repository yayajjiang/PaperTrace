"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE 硬件架构研究综述</h1>
<blockquote>
<p>本文梳理 MoE 模型在硬件层面的研究进展, 涵盖从宏观架构设计到微观计算优化的两条技术路线. </p>
</blockquote>
<hr>
<h2 id="1-hgjglx-sp-moe-dtxdxtsj">1. 宏观架构路线：适配 MoE 动态性的系统设计</h2>
<h3 id="1-1-hxtz">1.1 核心挑战</h3>
<p>MoE 的路由动态性导致：</p>
<ul>
<li>不同输入激活不同专家, 计算需求不可预测</li>
<li>专家分布在不同 GPU, 通信模式动态变化</li>
<li>负载不均衡导致部分 GPU 空闲、部分过载</li>
</ul>
<h3 id="1-2-ubi-mo-e-fpga-sd-moe-jsq">1.2 UbiMoE：FPGA 上的 MoE 加速器</h3>
<p><strong>核心设计</strong>：</p>
<ul>
<li><strong>双核架构</strong>：<ul>
<li>延迟优化的流式注意力核</li>
<li>可复用线性核</li>
</ul>
</li>
<li><strong>自动搜索算法</strong>：根据 FPGA 资源约束自动调整硬件参数</li>
</ul>
<p><strong>优化策略</strong>：</p>
<ul>
<li>注意力核优化数据加载：固定 Q, 广播 K, 降低访存</li>
<li>融合 Softmax 核：动态取最大值, 减少内存访问</li>
<li>混合计算模式：根据输入动态选择计算策略</li>
</ul>
<hr>
<h2 id="2-wgyhlx-js-fc-txdtp">2. 微观优化路线：计算、访存、通信的突破</h2>
<h3 id="2-1-jsyh">2.1 计算优化</h3>
<p><strong>稀疏矩阵乘法</strong>：</p>
<ul>
<li>MoE 的 FFN 是稀疏激活的, 标准 GEMM 效率低</li>
<li>需要专门的稀疏矩阵加速器</li>
<li>动态调度：根据路由结果实时选择计算单元</li>
</ul>
<p><strong>量化计算</strong>：</p>
<ul>
<li>低比特(INT8/FP8)矩阵乘法</li>
<li>混合精度： gate 网络用高精度, 专家用低精度</li>
</ul>
<h3 id="2-2-fcyh">2.2 访存优化</h3>
<p><strong>专家权重管理</strong>：</p>
<ul>
<li>专家数量多(256+), 权重总量大</li>
<li>按需加载：只加载被激活的专家权重</li>
<li>权重共享：多个专家共享部分参数</li>
</ul>
<p><strong>KV Cache 压缩</strong>：</p>
<ul>
<li>MLA：将 KV Cache 压缩到 1/4</li>
<li>分页管理：类似 PagedAttention 的分块管理</li>
</ul>
<h3 id="2-3-txyh">2.3 通信优化</h3>
<p><strong>All-to-All 优化</strong>：</p>
<ul>
<li>细粒度调度：将 token 按目标专家分组发送</li>
<li>通信-计算重叠：在通信时进行其他计算</li>
<li>拓扑感知：根据网络拓扑优化路由</li>
</ul>
<hr>
<h2 id="3-yj-sfxtsj">3. 硬件-算法协同设计</h2>
<h3 id="3-1-sfcmdsp">3.1 算法层面的适配</h3>
<ul>
<li><strong>细粒度路由</strong>：减少单个专家的计算量, 增加并行度</li>
<li><strong>负载均衡损失</strong>：在训练时鼓励均衡的路由</li>
<li><strong>专家共享</strong>：减少专家数量, 降低访存压力</li>
</ul>
<h3 id="3-2-yjcmdzc">3.2 硬件层面的支持</h3>
<ul>
<li><strong>稀疏计算单元</strong>：支持动态稀疏模式的矩阵乘法</li>
<li><strong>大容量片上内存</strong>：缓存更多专家权重</li>
<li><strong>高速互联</strong>：降低 All-to-All 通信延迟</li>
</ul>
<hr>
<h2 id="4-wlfx">4. 未来方向</h2>
<ol>
<li><strong>专用 MoE 芯片</strong>：为 MoE 架构设计的 ASIC</li>
<li><strong>光互联</strong>：突破电互联的带宽瓶颈</li>
<li><strong>近存计算</strong>：将计算单元放入 HBM 堆栈中</li>
<li><strong>动态重配置</strong>：根据输入动态调整硬件配置</li>
</ol>
<hr>
<h2 id="5-zj">5. 总结</h2>
<p>MoE 的硬件研究从两条路线并进：</p>
<table>
<thead>
<tr>
<th align="left">路线</th>
<th align="left">关注点</th>
<th align="left">代表工作</th>
</tr>
</thead>
<tbody><tr>
<td align="left">宏观架构</td>
<td align="left">系统级动态性适配</td>
<td align="left">UbiMoE (FPGA)</td>
</tr>
<tr>
<td align="left">微观优化</td>
<td align="left">计算/访存/通信突破</td>
<td align="left">稀疏 GEMM、量化、分页管理</td>
</tr>
</tbody></table>
<p>算法与硬件的协同设计是释放 MoE 潜力的关键. </p>
<blockquote>
<p>参考来源：<a href="https://zhuanlan.zhihu.com/p/1960776777216550865">MoE 研究进展：算法、系统与架构综述(四)-架构篇</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hgjglx-sp-moe-dtxdxtsj","text":"1. 宏观架构路线：适配 MoE 动态性的系统设计"},{"level":3,"id":"1-1-hxtz","text":"1.1 核心挑战"},{"level":3,"id":"1-2-ubi-mo-e-fpga-sd-moe-jsq","text":"1.2 UbiMoE：FPGA 上的 MoE 加速器"},{"level":2,"id":"2-wgyhlx-js-fc-txdtp","text":"2. 微观优化路线：计算、访存、通信的突破"},{"level":3,"id":"2-1-jsyh","text":"2.1 计算优化"},{"level":3,"id":"2-2-fcyh","text":"2.2 访存优化"},{"level":3,"id":"2-3-txyh","text":"2.3 通信优化"},{"level":2,"id":"3-yj-sfxtsj","text":"3. 硬件-算法协同设计"},{"level":3,"id":"3-1-sfcmdsp","text":"3.1 算法层面的适配"},{"level":3,"id":"3-2-yjcmdzc","text":"3.2 硬件层面的支持"},{"level":2,"id":"4-wlfx","text":"4. 未来方向"},{"level":2,"id":"5-zj","text":"5. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/04-moe-yjjgyjzs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/04-moe-yjjgyjzs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE 硬件架构研究综述</h1>
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
