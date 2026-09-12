"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MoE 模型量化技术综述</h1>
<blockquote>
<p>本文系统梳理 MoE(Mixture-of-Experts)模型的量化技术前沿, 涵盖 Sub-1-Bit 压缩、专家级混合精度、动态校准、低秩补偿等核心方法, 为 MoE 模型的高效部署提供技术选型参考. </p>
</blockquote>
<hr>
<h2 id="1-moe-lhddttz">1. MoE 量化的独特挑战</h2>
<h3 id="1-1-wsm-moe-lhgn">1.1 为什么 MoE 量化更难</h3>
<p>MoE 模型在 4-bit、3-bit 量化时会遭受比 Dense 模型更严重的精度损失, 原因包括：</p>
<ul>
<li><strong>稀疏动态计算</strong>：传统激活量化未考虑门控产生的结构性稀疏, 导致量化步长不稳定</li>
<li><strong>专家激活不平衡</strong>：不同专家被激活的频率差异巨大(最高可达 11.7 倍), 导致校准数据覆盖不足</li>
<li><strong>路由敏感性</strong>：门控分数的微小扰动会扰乱 top-k 专家分配, 引发级联误差</li>
</ul>
<h3 id="1-2-hxjjsl">1.2 核心解决思路</h3>
<table>
<thead>
<tr>
<th align="left">挑战</th>
<th align="left">解决方向</th>
</tr>
</thead>
<tbody><tr>
<td align="left">专家激活不平衡</td>
<td align="left">专家级混合精度、平衡采样校准</td>
</tr>
<tr>
<td align="left">路由敏感性</td>
<td align="left">KL 散度约束、双目标校准</td>
</tr>
<tr>
<td align="left">精度损失大</td>
<td align="left">低秩补偿、敏感通道保留</td>
</tr>
<tr>
<td align="left">系统开销高</td>
<td align="left">Roofline-aware 精度选择、GEMM 编排</td>
</tr>
</tbody></table>
<hr>
<h2 id="2-dbxffxj">2. 代表性方法详解</h2>
<h3 id="2-1-qmoe-sub-1-bit-ys">2.1 QMoE：Sub-1-Bit 压缩</h3>
<p><strong>论文</strong>：QMoE: Practical Sub-1-Bit Compression of Trillion-Parameter Models (MLSys 2024)
<strong>目标模型</strong>：SwitchTransformer-c2048 (1.6T 参数)</p>
<p><strong>核心方法</strong>：</p>
<ul>
<li>使用 GPTQ 算法对分组专家进行三进制量化(-m, 0, +m)</li>
<li>三进制自然产生 ~90% 的零值稀疏性</li>
<li>利用稀疏矩阵乘法进一步压缩, 实现 <strong>&lt; 1 bit/weight</strong> 的压缩率</li>
<li>非专家层保持 BF16, 专家层用 2-bit</li>
</ul>
<p><strong>效果</strong>：1.6T 模型压缩到 &lt; 160GB(20× 压缩)</p>
<h3 id="2-2-moqa-djdsj-mxfbgz">2.2 MoQa：多阶段数据-模型分布感知</h3>
<p><strong>论文</strong>：MoQa: Rethinking MoE Quantization with Multi-stage Data-model Distribution Awareness (2025)
<strong>目标模型</strong>：OLMoE、Qwen-MoE、DeepSeek-MoE</p>
<p><strong>核心洞察</strong>：</p>
<ul>
<li>不同输入数据分布下, 专家重要性差异巨大</li>
<li>单一校准数据集无法覆盖所有专家的数据分布</li>
</ul>
<p><strong>三阶段框架</strong>：</p>
<ol>
<li><strong>预校准</strong>：基于专家路由概率初始化量化缩放因子</li>
<li><strong>自适应</strong>：在线调整专家的量化范围(动态缩放)</li>
<li><strong>微调</strong>：通过知识蒸馏修复专家间交互误差</li>
</ol>
<p><strong>专家级混合精度</strong>：</p>
<ul>
<li>共享专家 + 重要性高的专家 → INT8</li>
<li>重要性低的专家 → INT2/INT4</li>
</ul>
<p><strong>通道级动态调整</strong>：</p>
<ul>
<li>筛选出 1% 最敏感的通道(类似 AWQ 的发现)</li>
<li>这些通道用 FP16 计算, 开销可忽略</li>
</ul>
<h3 id="2-3-mx-mo-e-jdyxnxtsj">2.3 MxMoE：精度与性能协同设计</h3>
<p><strong>论文</strong>：MxMoE: Mixed-precision Quantization for MoE with Accuracy and Performance Co-Design (2025)</p>
<p><strong>核心思想</strong>：混合精度不仅要考虑精度, 还要考虑<strong>实际加速效果</strong></p>
<p><strong>Roofline 分析</strong>：</p>
<ul>
<li>不同量化方法在 Roofline 模型中处于不同位置</li>
<li>激活比例高的专家 → W8A8(计算受限, 需降低计算量)</li>
<li>激活比例低的专家 → W4A16(内存受限, 需降低带宽)</li>
</ul>
<p><strong>细粒度划分</strong>：</p>
<ul>
<li>将 MoE 块划分为 Gate、Proj_Up、Proj_Down</li>
<li>不同块使用不同量化方法</li>
<li>编写专门的 GEMM Orchestration kernel</li>
</ul>
<h3 id="2-4-mo-e-quant-zjphcyyqhdyd">2.4 MoEQuant：专家平衡采样与亲和度引导</h3>
<p><strong>论文</strong>：MoEQuant: Enhancing Quantization for MoE via Expert-Balanced Sampling and Affinity Guidance (2025)</p>
<p><strong>核心问题</strong>：PTQ 校准数据的负载不均衡</p>
<p><strong>自采样(Self-Sampling)</strong> ：</p>
<ul>
<li>利用模型自身自回归生成校准数据</li>
<li>从固定起点(词汇表)开始, 选择最优分支直到 EoS</li>
<li>路径剪枝优化, 忽略低概率分支</li>
</ul>
<p><strong>亲和度引导</strong>：</p>
<ul>
<li>将门控系数纳入逐层校准</li>
<li>样本与专家之间的相关性作为量化调整依据</li>
</ul>
<h3 id="2-5-ea-quant-zjgzyh">2.5 EAQuant：专家感知优化</h3>
<p><strong>论文</strong>：EAQuant: Enhancing Post-Training Quantization for MoE via Expert-Aware Optimization (2025)
<strong>目标场景</strong>：W4A4 和极端 W3A4 量化</p>
<p><strong>三个具体方法</strong>：</p>
<ol>
<li><strong>统一通道级平滑向量</strong>：跨专家最大化, 抑制激活中的极端值</li>
<li><strong>双目标校准</strong>：MSE + KL 散度, 同时保持数值精度和路由分布一致</li>
<li><strong>非专家参数校准</strong>：PTQ 中不仅校准专家参数, 还校准非专家参数</li>
</ol>
<h3 id="2-6-milo-dzbc">2.6 MiLo：低秩补偿</h3>
<p><strong>论文</strong>：MiLo: Efficient Quantized MoE Inference with Mixture of Low-Rank Compensators (2025)
<strong>目标场景</strong>：INT3 量化</p>
<p><strong>核心方法</strong>：</p>
<ul>
<li>对残差矩阵(量化前后差值)进行 SVD 分解</li>
<li>用低秩矩阵补偿量化误差</li>
<li>解决 INT3 &quot;理论节省无法转化为实际加速&quot;的问题</li>
</ul>
<h3 id="2-7-fate-kcmkyq">2.7 Fate：跨层门控预取</h3>
<p><strong>论文</strong>：Fate: Fast Edge Inference of MoE via Cross-Layer Gate (2025)
<strong>目标场景</strong>：边缘设备 CPU offload</p>
<p><strong>核心设计</strong>：</p>
<ul>
<li>利用相邻层 gate 输入预测下一层激活的专家</li>
<li>实现高准确率的专家预取(prefetch)</li>
</ul>
<p><strong>分阶段量化策略</strong>：</p>
<ul>
<li>CPU 缓存阶段：统一 INT4 存储</li>
<li>Prefill 阶段：受欢迎专家 INT4, 不受欢迎专家 INT2</li>
<li>Decode 阶段：统一 INT4(batch=1 时不区分)</li>
</ul>
<h3 id="2-8-mo-qae-lhgzzj">2.8 MoQAE：量化感知专家</h3>
<p><strong>论文</strong>：MoQAE: Mixed-Precision Quantization for Long-Context via Mixture of Quantization-Aware Experts (2025)</p>
<p><strong>核心思想</strong>：借用 MoE 门控机制选择<strong>最优量化比特宽度</strong></p>
<ul>
<li>不是压缩 MoE 架构本身</li>
<li>而是用门控为不同 KV Cache 选择不同精度</li>
<li>类似 MoBA 用门控选择注意力机制</li>
</ul>
<hr>
<h2 id="3-jsxxzn">3. 技术选型指南</h2>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">推荐方法</th>
<th align="left">压缩率</th>
<th align="left">精度损失</th>
</tr>
</thead>
<tbody><tr>
<td align="left">极致压缩(云端)</td>
<td align="left">QMoE (Sub-1-Bit)</td>
<td align="left">20×</td>
<td align="left">中等</td>
</tr>
<tr>
<td align="left">动态数据分布</td>
<td align="left">MoQa</td>
<td align="left">4-8×</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left">追求实际加速</td>
<td align="left">MxMoE</td>
<td align="left">4-6×</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left">校准数据不足</td>
<td align="left">MoEQuant (自采样)</td>
<td align="left">4-8×</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left">极端低比特</td>
<td align="left">EAQuant + MiLo</td>
<td align="left">8-16×</td>
<td align="left">中</td>
</tr>
<tr>
<td align="left">边缘设备</td>
<td align="left">Fate</td>
<td align="left">4-8×</td>
<td align="left">低</td>
</tr>
<tr>
<td align="left">KV Cache 压缩</td>
<td align="left">MoQAE</td>
<td align="left">2-4×</td>
<td align="left">低</td>
</tr>
</tbody></table>
<hr>
<h2 id="4-wlfx">4. 未来方向</h2>
<ol>
<li><strong>训练时量化感知</strong>：当前多为 PTQ, 未来可能在预训练阶段就引入量化约束</li>
<li><strong>专家剪枝 + 量化联合优化</strong>：先剪掉不重要的专家, 再量化剩余专家</li>
<li><strong>动态精度切换</strong>：根据输入复杂度实时调整量化精度</li>
<li><strong>硬件-算法协同</strong>：为 MoE 量化设计专门的稀疏 GEMM 加速器</li>
</ol>
<blockquote>
<p>参考来源：<a href="https://zhuanlan.zhihu.com/p/1929499400977256981">笔记：聊聊 MoE 模型的量化</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-moe-lhddttz","text":"1. MoE 量化的独特挑战"},{"level":3,"id":"1-1-wsm-moe-lhgn","text":"1.1 为什么 MoE 量化更难"},{"level":3,"id":"1-2-hxjjsl","text":"1.2 核心解决思路"},{"level":2,"id":"2-dbxffxj","text":"2. 代表性方法详解"},{"level":3,"id":"2-1-qmoe-sub-1-bit-ys","text":"2.1 QMoE：Sub-1-Bit 压缩"},{"level":3,"id":"2-2-moqa-djdsj-mxfbgz","text":"2.2 MoQa：多阶段数据-模型分布感知"},{"level":3,"id":"2-3-mx-mo-e-jdyxnxtsj","text":"2.3 MxMoE：精度与性能协同设计"},{"level":3,"id":"2-4-mo-e-quant-zjphcyyqhdyd","text":"2.4 MoEQuant：专家平衡采样与亲和度引导"},{"level":3,"id":"2-5-ea-quant-zjgzyh","text":"2.5 EAQuant：专家感知优化"},{"level":3,"id":"2-6-milo-dzbc","text":"2.6 MiLo：低秩补偿"},{"level":3,"id":"2-7-fate-kcmkyq","text":"2.7 Fate：跨层门控预取"},{"level":3,"id":"2-8-mo-qae-lhgzzj","text":"2.8 MoQAE：量化感知专家"},{"level":2,"id":"3-jsxxzn","text":"3. 技术选型指南"},{"level":2,"id":"4-wlfx","text":"4. 未来方向"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/09-moe-mxlhjszs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.4-frontier-arch/2.4.1-hhzjmx-moe/09-moe-mxlhjszs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MoE 模型量化技术综述</h1>
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
