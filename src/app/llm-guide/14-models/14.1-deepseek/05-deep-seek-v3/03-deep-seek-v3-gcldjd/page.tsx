"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V3 工程落地精读</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文聚焦 DeepSeek-V3 训练与推理的工程实现细节, 涵盖 DualPipe 流水线并行、跨节点 All-to-All 通信优化、FP8 混合精度训练、内存节省策略、推理部署架构以及训练成本核算. 如需更深入的细节, 请参阅 <a href="/llm-guide/14-models/14.1-deepseek/05-deep-seek-v3/05-deep-seek-v3-training-system">05-DeepSeek-V3-Training-System.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-dual-pipe-jsytxdlqpzd">1 DualPipe: 计算与通信的零气泡重叠</h2>
<h3 id="1-1-wsmby-tp">1.1 为什么不用 TP</h3>
<p>DeepSeek-V3 刻意避免使用张量并行(TP). 原因是: TP 的 all-reduce 通信发生在每个层内部, 且需要分割注意力头的计算, 导致 SM 利用率下降. 相比之下, 专家并行(EP)的 all-to-all 虽然通信量更大, 但发生在层与层之间, 可以通过流水线调度来重叠.</p>
<p>核心洞察: <strong>通信的位置比通信的量更重要</strong>. 层间的 all-to-all 可以被流水线隐藏, 而层内的 all-reduce 无法被隐藏.</p>
<h3 id="1-2-sxlsxdtdyl">1.2 双向流水线的调度原理</h3>
<p>DualPipe 将每个块分解为四个组件: <code>attention</code>、<code>all-to-all dispatch</code>、<code>MLP</code>、<code>all-to-all combine</code>. 反向块进一步拆分为「输入反向」和「权重反向」(类似 ZeroBubble).</p>
<p>通过从流水线两端同时喂入 micro-batch, 正向流的通信间隙恰好被反向流的计算填充, 反之亦然. 在 16 路 PP 下, DualPipe 的气泡约为传统 1F1B 的 1/4 到 1/3.</p>
<p>在 H800 上, 约 15% 的 SM(20/132)专门用于通信, 通过 warp specialization 分成 10 个通信通道, 根据工作负载动态调整.</p>
<blockquote>
<p>译者注: 15% 的 SM 用于通信意味着只有 85% 的算力用于实际计算. 如果未来 GPU 集成通信协处理器(如 NVIDIA SHARP 的进化版), 这 15% 可以全部释放给计算, 训练效率还能再提升约 15%.</p>
</blockquote>
<hr>
<h2 id="2-fp8-hhjdxl">2 FP8 混合精度训练</h2>
<h3 id="2-1-xldlhcl">2.1 细粒度量化策略</h3>
<p>FP8 的动态范围极小(5 bit 指数位), 梯度容易下溢或上溢. DeepSeek-V3 采用「细粒度量化」: 不是对整个张量用一个缩放因子, 而是对更小的 tile(如 128x128)分别计算缩放因子.</p>
<p>前向激活使用 E4M3 格式(4 指数位 + 3 尾数位), 权重梯度使用 E5M2 格式(5 指数位 + 2 尾数位). 这种分离是因为激活值分布更集中, 不需要太大动态范围; 而梯度分布更分散, 需要更大范围.</p>
<h3 id="2-2-cuda-core-lj">2.2 CUDA Core 累加</h3>
<p>FP8 GEMM 的累加精度有限, 大量小梯度更新会丢失. DeepSeek 的解决方案是: 在 CUDA Core(而非 Tensor Core)上进行 FP32 累加, 然后将结果转换回 FP8. 这保持了数值稳定性, 同时享受了 FP8 的高吞吐.</p>
<blockquote>
<p>译者注: FP8 训练目前基本被 NVIDIA H100/H200 生态垄断. A100 不支持 FP8 Tensor Core, 国产芯片(如昇腾 910B)在这块的软件栈成熟度差距明显. 这是 DeepSeek-V3 训练方案的一个重要硬件锁定.</p>
</blockquote>
<hr>
<h2 id="3-tlbsjg">3 推理部署架构</h2>
<h3 id="3-1-prefilling-y-decoding-fl">3.1 Prefilling 与 Decoding 分离</h3>
<p>DeepSeek-V3 采用预填充(prefilling)和解码(decoding)分离部署:</p>
<ul>
<li><strong>Prefilling</strong>: 最少 32 块 GPU, 使用 4 路 TP + 8 路 EP. 设置 32 个冗余专家应对负载不均衡.</li>
<li><strong>Decoding</strong>: 最少 320 块 GPU, 使用 4 路 TP + 80 路 EP. 每 GPU 托管 16 个专家但只激活 9 个, 提供动态冗余.</li>
</ul>
<p>分离的原因是两者的计算特性不同: prefilling 是计算密集型的矩阵乘法(处理整个输入序列), decoding 是内存带宽密集型的逐 token 生成(KV Cache 访问).</p>
<h3 id="3-2-ryzjcl">3.2 冗余专家策略</h3>
<p>MoE 的专家专业化会导致推理时的负载不均衡: 代码输入会使代码专家过载. 解决方案:</p>
<ol>
<li><strong>静态冗余</strong>: prefilling 阶段设置 32 个冗余专家副本</li>
<li><strong>动态冗余</strong>: 每 GPU 托管 16 个专家, 但只激活 9 个, 剩余 7 个作为热备份</li>
</ol>
<p>这使得系统可以容忍一定程度的负载倾斜, 而无需复杂的实时重新调度.</p>
<hr>
<h2 id="4-xlcbhs">4 训练成本核算</h2>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">数据量</th>
<th align="left">GPU 小时</th>
<th align="left">估计成本</th>
</tr>
</thead>
<tbody><tr>
<td align="left">预训练</td>
<td align="left">14.8T token</td>
<td align="left">2664K H800 GPUh</td>
<td align="left">557.6 万美元</td>
</tr>
<tr>
<td align="left">上下文扩展(4K-&gt;128K)</td>
<td align="left">-</td>
<td align="left">119K GPUh</td>
<td align="left">约 25 万美元</td>
</tr>
<tr>
<td align="left">后训练(SFT + RL)</td>
<td align="left">-</td>
<td align="left">约 50K GPUh</td>
<td align="left">约 10 万美元</td>
</tr>
<tr>
<td align="left"><strong>总计</strong></td>
<td align="left">-</td>
<td align="left"><strong>约 2833K GPUh</strong></td>
<td align="left"><strong>约 593 万美元</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: DeepSeek-V3 训练成本估算(基于 H800 每小时 2.1 美元).</p>
</blockquote>
<p>预训练成本 557.6 万美元, 相当于 Llama-3.1 405B(约 5800 万美元)的 1/10. 这一巨大差异来自:</p>
<ol>
<li><strong>MoE 稀疏激活</strong>: 每次前向仅激活 37B, 而非 405B</li>
<li><strong>FP8 训练</strong>: 峰值算力比 FP16 翻倍</li>
<li><strong>DualPipe 重叠</strong>: 通信开销接近零</li>
<li><strong>MTP 信号稠化</strong>: 更快的收敛</li>
</ol>
<hr>
<h2 id="5-dwlyjdsjjy">5 对未来硬件的设计建议</h2>
<p>DeepSeek-V3 的技术报告末尾提出了对未来 GPU 架构的建议:</p>
<ol>
<li><strong>通信协处理器</strong>: 将 all-to-all 和 all-reduce 通信从 SM 卸载到专用硬件, 释放 15% 的算力.</li>
<li><strong>更大的 SRAM/共享内存</strong>: 当前 H800 的 L2 Cache 和共享内存不足以完全缓存 MLA 的投影矩阵, 需要频繁访问 HBM.</li>
<li><strong>原生 FP8/FP4 支持</strong>: 更细粒度的量化硬件支持, 减少软件层面的开销.</li>
<li><strong>更灵活的 SM 分配</strong>: 允许动态调整计算 SM 和通信 SM 的比例, 而非固定划分.</li>
</ol>
<blockquote>
<p>译者注: 这些建议反映了「算法驱动硬件设计」的新趋势. 传统上, 算法研究者在给定硬件约束下优化算法; 而 DeepSeek-V3 的经验表明, 当算法复杂度达到一定程度后, 硬件架构的微小改进可以带来系统级的巨大收益. NVIDIA 的 Blackwell 架构已经在朝着这个方向进化(如第五代 Tensor Core 支持 FP4/FP6).</p>
</blockquote>
<hr>
<blockquote>
<p>本文档为工程落地精读. 详细精译见《01-DeepSeek-V3技术报告精译.md》, 更深入的工程分析见《05-DeepSeek-V3-Training-System.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dual-pipe-jsytxdlqpzd","text":"1 DualPipe: 计算与通信的零气泡重叠"},{"level":3,"id":"1-1-wsmby-tp","text":"1.1 为什么不用 TP"},{"level":3,"id":"1-2-sxlsxdtdyl","text":"1.2 双向流水线的调度原理"},{"level":2,"id":"2-fp8-hhjdxl","text":"2 FP8 混合精度训练"},{"level":3,"id":"2-1-xldlhcl","text":"2.1 细粒度量化策略"},{"level":3,"id":"2-2-cuda-core-lj","text":"2.2 CUDA Core 累加"},{"level":2,"id":"3-tlbsjg","text":"3 推理部署架构"},{"level":3,"id":"3-1-prefilling-y-decoding-fl","text":"3.1 Prefilling 与 Decoding 分离"},{"level":3,"id":"3-2-ryzjcl","text":"3.2 冗余专家策略"},{"level":2,"id":"4-xlcbhs","text":"4 训练成本核算"},{"level":2,"id":"5-dwlyjdsjjy","text":"5 对未来硬件的设计建议"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/05-deep-seek-v3/03-deep-seek-v3-gcldjd" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/05-deep-seek-v3/03-deep-seek-v3-gcldjd" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V3 工程落地精读</h1>
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
