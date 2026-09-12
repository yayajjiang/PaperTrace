"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE 系统与架构优化综述</h1>
<blockquote>
<p>本文系统梳理混合专家模型(MoE)在系统部署与硬件架构层面的优化技术,涵盖并行策略(EP/TP/PP/DP 的组合与自动选择)、通信优化、访存优化、卸载策略,以及 FPGA/ASIC 硬件加速器设计. 适合负责 MoE 模型工程部署的系统工程师和架构师阅读. </p>
</blockquote>
<hr>
<h2 id="1-xtbsdhxtz">1. 系统部署的核心挑战</h2>
<p>MoE 模型的系统优化面临三个层次的瓶颈：</p>
<ol>
<li><strong>计算瓶颈</strong>：稀疏激活下,每次前向只调用少量专家,但路由决策和专家切换引入额外开销. </li>
<li><strong>通信瓶颈</strong>：专家并行(EP)需要 All-to-All 通信分发 token 到目标专家所在的设备,通信量与 batch size 和序列长度成正比. </li>
<li><strong>访存瓶颈</strong>：虽然每次只激活部分专家,但所有专家参数仍需驻留在显存中(或快速可访问的存储层级),总参数量可达 Dense 模型的 5-20 倍.</li>
</ol>
<p>系统优化的目标是在给定硬件约束下,最小化端到端延迟并最大化吞吐量. 当前研究从两大场景切入：</p>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">特征</th>
<th align="left">核心策略</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>显存充足</strong></td>
<td align="left">多卡/多节点,总显存可容纳全部专家</td>
<td align="left">专家并行(EP)+ 数据并行(DP),最小化专家切换开销</td>
</tr>
<tr>
<td align="left"><strong>显存受限</strong></td>
<td align="left">单卡或边缘设备,无法容纳全部专家</td>
<td align="left">专家卸载(Offloading)+ 动态加载,层级化存储调度</td>
</tr>
</tbody></table>
<hr>
<h2 id="2-bhclyzdbh">2. 并行策略与自动并行</h2>
<h3 id="2-1-bhwddzhkj">2.1 并行维度的组合空间</h3>
<p>MoE 模型的并行策略比 Dense 模型多一个维度——专家并行(EP). 典型的组合方式包括：</p>
<ul>
<li><strong>EP + DP</strong>：专家按数据并行组分配,每组处理不同 batch 的子集</li>
<li><strong>EP + TP</strong>：节点内张量并行处理 Attention/共享 FFN,跨节点专家并行分配专家</li>
<li><strong>EP + PP</strong>：流水线并行拆分层组,每组内部再专家并行</li>
<li><strong>EP + TP + DP</strong>：三维混合,如 DeepSeek-V3 的 EP=16(跨节点)+ TP=8(节点内)+ DP=全局</li>
</ul>
<h3 id="2-2-zdbhxz">2.2 自动并行选择</h3>
<p>手动选择并行配置需要深入理解模型结构和硬件拓扑,自动并行系统通过理论建模和运行时分析自动优化：</p>
<p><strong>Tutel(Microsoft, 2022)</strong> ：系统分析 DP/EP/MP 各并行策略的理论性能(计算量、通信量、内存占用),在运行时根据当前 batch size、序列长度、设备拓扑自动选择最优并行组合. 其核心洞察是：没有单一最优策略,最优配置随输入动态变化. </p>
<p><strong>SmartMoE(USENIX, 2024)</strong> ：两阶段自动专家并行策略. 第一阶段根据历史运行信息建模负载分布,离线预测最优专家放置方案; 第二阶段在执行时动态调度,根据实际负载微调专家位置. 这种&quot;离线规划 + 在线适应&quot;的混合策略比纯静态或纯动态方法均有显著提升. </p>
<p><strong>MoESys</strong>：针对互联网服务的 MoE 分布式训练与推理系统,采用多层级内存管理(GPU HBM → CPU DRAM → NVMe SSD),在显存不足时自动将低频专家卸载到更廉价的存储层级,通过预测下一层所需专家提前预加载. </p>
<hr>
<h2 id="3-txyh">3. 通信优化</h2>
<h3 id="3-1-all-to-all-txdpjyyh">3.1 All-to-All 通信的瓶颈与优化</h3>
<p>专家并行的核心通信模式是 All-to-All：每个设备需要将自己 batch 中的 token 发送到目标专家所在的设备,同时接收其他设备发送给自己的 token. </p>
<p>优化策略包括：</p>
<ul>
<li><strong>细粒度调度</strong>：将 All-to-All 拆分为多个微批次(micro-batch),与计算流水线重叠,隐藏通信延迟. </li>
<li><strong>专家聚类</strong>：将高频共现的专家放置在同一个设备或同一节点内,减少跨节点通信. </li>
<li><strong>通信压缩</strong>：对 token 的隐藏状态进行量化(INT8/FP8)后再传输,降低带宽需求. </li>
<li><strong>拓扑感知路由</strong>：根据实际网络拓扑(NVLink、IB、以太网)设计路由策略,优先使用高带宽链路.</li>
</ul>
<h3 id="3-2-qzxhtx">3.2 去中心化通信</h3>
<p>传统 All-to-All 需要一个全局协调器来管理 token 分发. 去中心化方案让每个设备只与直接邻居通信,通过多跳传递实现全局路由,减少协调开销,更适合大规模集群. </p>
<hr>
<h2 id="4-fcyjsyh">4. 访存与计算优化</h2>
<h3 id="4-1-zjcsdgxcc">4.1 专家参数的高效存储</h3>
<ul>
<li><strong>N:M 结构化剪枝</strong>：在 M 个连续参数中只保留 N 个非零值(如 2:4),通过稀疏存储格式减少显存占用,同时保持硬件友好的计算模式. </li>
<li><strong>专家权重共享</strong>：让相邻层或语义相近的专家共享部分权重,减少总参数量. </li>
<li><strong>动态精度</strong>：对高频使用的热专家保持 FP16,对冷专家降至 INT8/FP8,甚至量化到 4-bit.</li>
</ul>
<h3 id="4-2-jsrhy-kernel-yh">4.2 计算融合与 Kernel 优化</h3>
<ul>
<li><strong>Fused Gate + GEMM</strong>：将路由计算(Gate)与专家的前向 GEMM 融合为单个 CUDA kernel,减少 kernel 启动开销和中间结果访存. </li>
<li><strong>Grouped GEMM</strong>：将多个小矩阵乘法(不同专家的输入)批处理为单个 grouped GEMM 调用,提高 Tensor Core 利用率. </li>
<li><strong>动态负载均衡</strong>：在运行时监测各专家的计算负载,动态调整 token 分配,避免某些 GPU 过载而另一些空闲.</li>
</ul>
<hr>
<h2 id="5-yjjsqsj">5. 硬件加速器设计</h2>
<h3 id="5-1-fpga-sd-moe-js">5.1 FPGA 上的 MoE 加速</h3>
<p><strong>UbiMoE(FPGA, 2025)</strong> ：设计了两套异构计算核——延迟优化的流式注意力核和可复用线性核. 注意力核优化数据加载策略(固定 Q、广播 K),使用融合 Softmax kernel 并支持动态最大值提取; 线性核设计硬件级动态数据调度,支持 Dense 模式和稀疏模式切换,并通过搜索算法根据 FPGA 资源约束自动调整硬件参数. </p>
<p><strong>FLAME(FPGA, DAC 2024)</strong> ：三大亮点：</p>
<ol>
<li><strong>存储优化</strong>：N:M 剪枝策略大幅削减专家参数规模</li>
<li><strong>调度优化</strong>：发现专家激活路径高度集中(冷热特性明显),通过学习分布预测专家激活,并引入循环预测机制(CEPR)——用上一 token 的末期层信息预测下一 token 的早期层</li>
<li><strong>两阶段架构</strong>：离线学习优化 + 在线动态调度,在 FPGA 上完成完整验证</li>
</ol>
<p><strong>Edge-MoE</strong>：针对边缘设备的端到端 MoE 加速器,同时做任务级稀疏性和专家级稀疏性,在严格功耗约束下实现多任务 Vision Transformer 的高效推理. </p>
<h3 id="5-2-asic-yzyxpqs">5.2 ASIC 与专用芯片趋势</h3>
<p>Google TPU v5 开始支持稀疏计算原语,NVIDIA Blackwell 架构引入了针对 MoE 的专家并行通信加速单元. 未来专用 AI 芯片可能直接支持：</p>
<ul>
<li>硬件级 All-to-All 路由引擎</li>
<li>可变精度专家权重(不同专家不同精度)</li>
<li>片上专家缓存(将热专家常驻 SRAM,冷专家从 HBM 动态加载)</li>
</ul>
<hr>
<h2 id="6-xzclycjhcc">6. 卸载策略与层级化存储</h2>
<h3 id="6-1-zjxzdjbsx">6.1 专家卸载的基本思想</h3>
<p>当单卡显存无法容纳全部专家时,将部分专家卸载到 CPU 内存或 NVMe SSD,在需要时动态加载. 核心挑战是加载延迟可能远超计算时间. </p>
<h3 id="6-2-ycxyjz">6.2 预测性预加载</h3>
<ul>
<li><strong>基于路由预测</strong>：利用门控网络的输出提前预测下一层将激活哪些专家,在计算当前层的同时异步预加载下一层所需专家. </li>
<li><strong>基于访问模式</strong>：分析专家的历史访问频率和共现模式,将高频专家和常共现专家预加载到 GPU 显存.</li>
</ul>
<h3 id="6-3-hgca-hh-gpu-cpu-zyl">6.3 HGCA：混合 GPU-CPU 注意力</h3>
<p>HGCA(Hybrid GPU-CPU Attention)将卸载策略从&quot;参数卸载&quot;扩展到&quot;注意力计算卸载&quot;：对 GPU 内存中的近期 KV 执行密集注意力,对 CPU 内存中的历史 KV 执行并行稀疏注意力,通过 log-sum-exp 融合两个输出. 这一思路可自然扩展到 MoE 场景：将冷专家的计算卸载到 CPU,热专家保留在 GPU,实现非对称计算. </p>
<hr>
<h2 id="7-xxjcywlfx">7. 选型决策与未来方向</h2>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">推荐策略</th>
<th align="left">关键考量</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数据中心训练(千卡级)</td>
<td align="left">EP + TP + DP 混合,Tutel/SmartMoE 自动并行</td>
<td align="left">通信拓扑、负载均衡、故障恢复</td>
</tr>
<tr>
<td align="left">数据中心推理(高并发)</td>
<td align="left">EP + TP,Grouped GEMM + 通信压缩</td>
<td align="left">延迟敏感,需隐藏 All-to-All 开销</td>
</tr>
<tr>
<td align="left">边缘设备(显存受限)</td>
<td align="left">专家卸载 + N:M 剪枝 + 动态精度</td>
<td align="left">功耗约束,预加载策略至关重要</td>
</tr>
<tr>
<td align="left">实时交互(低延迟)</td>
<td align="left">小批量 + 专家缓存 + 预测性预加载</td>
<td align="left">首 token 延迟和 throughput 的平衡</td>
</tr>
<tr>
<td align="left">FPGA 原型验证</td>
<td align="left">UbiMoE/FLAME 架构</td>
<td align="left">资源约束下的软硬件协同设计</td>
</tr>
</tbody></table>
<p><strong>未来方向</strong>：</p>
<ul>
<li><strong>自适应并行</strong>：根据输入内容动态调整并行策略(简单查询用 EP,复杂推理用 TP+EP)</li>
<li><strong>神经架构搜索(NAS)for MoE</strong>：自动搜索最优的专家数量、容量、路由策略</li>
<li><strong>存算一体</strong>：将专家参数存储和计算在物理上融合,消除&quot;存储墙&quot;</li>
</ul>
<hr>
<h2 id="8-ckwx">8. 参考文献</h2>
<ol>
<li><p><strong>Tutel: Adaptive Mixture-of-Experts at Scale</strong></p>
<ul>
<li>Hwang et al., arXiv:2206.03382, 2022.</li>
</ul>
</li>
<li><p><strong>SmartMoE: Efficiently Training Sparsely-Activated Models through Combining Offline and Online Parallelization</strong></p>
<ul>
<li>Zhai et al., USENIX ATC, 2024.</li>
</ul>
</li>
<li><p><strong>UbiMoE: A Ubiquitous Mixture-of-Experts Vision Transformer Accelerator With Hybrid Computation Pattern on FPGA</strong></p>
<ul>
<li>Dong et al., arXiv:2502.05602, 2025.</li>
</ul>
</li>
<li><p><strong>FLAME: Fully Leveraging MoE Sparsity for Transformer on FPGA</strong></p>
<ul>
<li>Lin et al., DAC 2024.</li>
</ul>
</li>
<li><p><strong>Edge-MoE: Memory-Efficient Multi-Task Vision Transformer Architecture with Task-Level Sparsity via Mixture-of-Experts</strong></p>
<ul>
<li>Sarkar et al., IEEE, 2023.</li>
</ul>
</li>
<li><p><strong>混合专家大语言模型的系统与架构优化技术综述</strong></p>
<ul>
<li>电子与信息学报, 2025. <a href="https://jeit.ac.cn/cn/article/doi/10.11999/JEIT250407">https://jeit.ac.cn/cn/article/doi/10.11999/JEIT250407</a></li>
</ul>
</li>
</ol>
<blockquote>
<p>参考来源：</p>
<ul>
<li><a href="https://zhuanlan.zhihu.com/p/1952413528670607319">MoE 研究进展：算法、系统与架构综述(三)-系统篇</a></li>
<li><a href="https://zhuanlan.zhihu.com/p/1960776777216550865">MoE 研究进展：算法、系统与架构综述(四)-架构篇</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-xtbsdhxtz","text":"1. 系统部署的核心挑战"},{"level":2,"id":"2-bhclyzdbh","text":"2. 并行策略与自动并行"},{"level":3,"id":"2-1-bhwddzhkj","text":"2.1 并行维度的组合空间"},{"level":3,"id":"2-2-zdbhxz","text":"2.2 自动并行选择"},{"level":2,"id":"3-txyh","text":"3. 通信优化"},{"level":3,"id":"3-1-all-to-all-txdpjyyh","text":"3.1 All-to-All 通信的瓶颈与优化"},{"level":3,"id":"3-2-qzxhtx","text":"3.2 去中心化通信"},{"level":2,"id":"4-fcyjsyh","text":"4. 访存与计算优化"},{"level":3,"id":"4-1-zjcsdgxcc","text":"4.1 专家参数的高效存储"},{"level":3,"id":"4-2-jsrhy-kernel-yh","text":"4.2 计算融合与 Kernel 优化"},{"level":2,"id":"5-yjjsqsj","text":"5. 硬件加速器设计"},{"level":3,"id":"5-1-fpga-sd-moe-js","text":"5.1 FPGA 上的 MoE 加速"},{"level":3,"id":"5-2-asic-yzyxpqs","text":"5.2 ASIC 与专用芯片趋势"},{"level":2,"id":"6-xzclycjhcc","text":"6. 卸载策略与层级化存储"},{"level":3,"id":"6-1-zjxzdjbsx","text":"6.1 专家卸载的基本思想"},{"level":3,"id":"6-2-ycxyjz","text":"6.2 预测性预加载"},{"level":3,"id":"6-3-hgca-hh-gpu-cpu-zyl","text":"6.3 HGCA：混合 GPU-CPU 注意力"},{"level":2,"id":"7-xxjcywlfx","text":"7. 选型决策与未来方向"},{"level":2,"id":"8-ckwx","text":"8. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/05-moe-xtyjgyhzs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/05-moe-xtyjgyhzs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE 系统与架构优化综述</h1>
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
