"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>DeepSeek-V4 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.1-deepseek/14.1-deepseek">返回 14.1-DeepSeek 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《DeepSeek-V4 技术报告精译》与 D5 核心技术专题, 对 DeepSeek-V4 的架构进行系统性梳理. V4 是 DeepSeek 在 2026 年 4 月发布的最新旗舰模型, 将上下文能力和推理效率推向新的高度.
详细分析请参阅 <a href="/llm-guide/14-models/14.1-deepseek/10-deep-seek-v4/05-deep-seek-v4-hxjgygxcsxwsjpx">05-DeepSeek-V4核心架构与高效长上下文设计剖析.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-bw-token-sxwdgctz">1 设计动机: 百万 token 上下文的工程挑战</h2>
<p>DeepSeek-V4 发布于 2026 年 4 月, 其核心任务是突破长上下文推理的效率瓶颈. 在 V3 的 128K 上下文基础上, V4 将默认窗口扩展至 1M token, V4-Pro 更是达到 1.6T 总参数 / 49B 激活参数.</p>
<p>长上下文带来的挑战:</p>
<ol>
<li><strong>注意力复杂度爆炸</strong>: 标准自注意力的 O(L^2) 复杂度在 1M token 下变得不可接受.</li>
<li><strong>KV Cache 内存占用</strong>: 即使使用 MLA, 1M 上下文的 KV Cache 仍然巨大.</li>
<li><strong>训练稳定性</strong>: 深层网络在长序列上的梯度衰减和表示崩溃.</li>
</ol>
<p>V4 的答案是: <strong>CSA/HCA 解决注意力复杂度, mHC 解决训练稳定性, Muon 提升优化效率, FP4 降低推理显存</strong>.</p>
<hr>
<h2 id="2-ztjgpz">2 整体架构配置</h2>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">DeepSeek-V4</th>
<th align="left">DeepSeek-V4-Pro</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">MoE</td>
<td align="left">MoE</td>
</tr>
<tr>
<td align="left">总参数</td>
<td align="left">1.6T</td>
<td align="left">1.6T</td>
</tr>
<tr>
<td align="left">激活参数/token</td>
<td align="left">49B</td>
<td align="left">49B</td>
</tr>
<tr>
<td align="left">Transformer 层数</td>
<td align="left">72</td>
<td align="left">72</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">8192</td>
<td align="left">8192</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">128</td>
<td align="left">128</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">1M</td>
<td align="left">1M</td>
</tr>
<tr>
<td align="left">位置编码</td>
<td align="left">CSA + HCA</td>
<td align="left">CSA + HCA</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: DeepSeek-V4 核心配置.</p>
</blockquote>
<hr>
<h2 id="3-hxcx">3 核心创新</h2>
<h3 id="3-1-csa-ysxszyl">3.1 CSA: 压缩稀疏注意力</h3>
<p>Compressed Sparse Attention(CSA)对局部上下文做精细压缩保留, 对远距离上下文做粗粒度摘要. 其核心思想是: <strong>并非所有历史 token 都需要同等精度的表示</strong>.</p>
<ul>
<li><strong>局部窗口</strong>: 最近的 W 个 token 使用标准注意力, 保持完整精度.</li>
<li><strong>远距离摘要</strong>: 超出窗口的历史信息被压缩为低维摘要向量.</li>
</ul>
<p>这使得注意力复杂度从 O(L^2) 降低到 O(L * W + L * S), 其中 S &lt;&lt; L 为摘要数量.</p>
<h3 id="3-2-hca-zdyszyl">3.2 HCA: 重度压缩注意力</h3>
<p>Heavily Compressed Attention(HCA)对历史信息做极低维度压缩, 实现近似常数级别的远程依赖访问.</p>
<p>HCA 的核心洞察: 对于极长距离(如数十万 token 之前)的依赖, 模型通常只需要「知道某个概念存在」而非「记住具体细节」. 因此, 这些信息可以被压缩到极低维度(如 64 维甚至 16 维).</p>
<p>CSA 和 HCA 的组合形成了分层压缩策略:</p>
<pre><code>局部(精细) -&gt; 中距离(摘要) -&gt; 远距离(极度压缩)
</code></pre>
<h3 id="3-3-mhc-lxysclj">3.3 mHC: 流形约束超连接</h3>
<p>Manifold-Constrained Hyper-Connections(mHC)解决深层网络训练中的梯度衰减和表示崩溃.</p>
<p>传统残差连接: h&#39; = h + F(h)
mHC 引入流形约束: 确保每一层的表示都位于一个低维流形上, 防止表示空间的无序膨胀.</p>
<p>这通过在学习残差连接的同时, 约束表示的谱范数来实现. 实验表明, mHC 使得 72 层网络的训练稳定性与 32 层网络相当.</p>
<h3 id="3-4-muon-optimizer">3.4 Muon Optimizer</h3>
<p>Muon 是一种混合 Newton-Schulz 迭代的二阶优化器, 提升参数更新效率.</p>
<p>传统 AdamW 使用一阶动量估计, 而 Muon 通过低秩近似计算 Hessian 矩阵的逆, 实现更精确的参数更新方向. 在长上下文训练中, Muon 的收敛速度比 AdamW 快约 30%.</p>
<h3 id="3-5-fp4-lhgzxl">3.5 FP4 量化感知训练</h3>
<p>V4 对 MoE 专家进行 4-bit 量化感知训练(QAT), 进一步降低推理显存.</p>
<p>FP4 的动态范围极小(4 bit 总位数), 但通过细粒度量化和动态缩放, V4 在保持模型质量的同时将专家参数量压缩到原来的 1/4.</p>
<hr>
<h2 id="4-xnyjx">4 性能与局限</h2>
<h3 id="4-1-csxwnl">4.1 长上下文能力</h3>
<p>V4 在 1M 上下文下的「大海捞针」测试表现优异, 但在真实的多文档推理任务中, 超过 500K token 后的准确率衰减曲线尚未被独立第三方充分验证.</p>
<h3 id="4-2-bsmj">4.2 部署门槛</h3>
<p>1.6T 参数的模型即使使用 FP4 量化, 仍然需要数百 GB 的显存. 这基本上锁定了云端部署, 排除了端侧应用.</p>
<hr>
<h2 id="5-pxdw">5 谱系定位</h2>
<p>DeepSeek-V4 的架构演进:</p>
<pre><code>DeepSeek-V3 (2024-12, 671B, 128K, MLA + DeepSeekMoE)
  |
  +--&gt; DeepSeek-V3.2 (2025-12, 685B, 128K, DSA 稀疏注意力)
  |
  +--&gt; DeepSeek-V4 (2026-04, 1.6T, 1M, CSA + HCA + mHC + Muon)
</code></pre>
<p>V4 代表了 DeepSeek 在「极致稀疏 + 极致长上下文」方向上的最新探索.</p>
<hr>
<blockquote>
<p>本文档为综合架构剖析. 详细精译见《01-DeepSeek-V4技术报告精译.md》, 架构深入分析见《05-DeepSeek-V4核心架构与高效长上下文设计剖析.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-bw-token-sxwdgctz","text":"1 设计动机: 百万 token 上下文的工程挑战"},{"level":2,"id":"2-ztjgpz","text":"2 整体架构配置"},{"level":2,"id":"3-hxcx","text":"3 核心创新"},{"level":3,"id":"3-1-csa-ysxszyl","text":"3.1 CSA: 压缩稀疏注意力"},{"level":3,"id":"3-2-hca-zdyszyl","text":"3.2 HCA: 重度压缩注意力"},{"level":3,"id":"3-3-mhc-lxysclj","text":"3.3 mHC: 流形约束超连接"},{"level":3,"id":"3-4-muon-optimizer","text":"3.4 Muon Optimizer"},{"level":3,"id":"3-5-fp4-lhgzxl","text":"3.5 FP4 量化感知训练"},{"level":2,"id":"4-xnyjx","text":"4 性能与局限"},{"level":3,"id":"4-1-csxwnl","text":"4.1 长上下文能力"},{"level":3,"id":"4-2-bsmj","text":"4.2 部署门槛"},{"level":2,"id":"5-pxdw","text":"5 谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.1-deepseek/10-deep-seek-v4/02-deep-seek-v4-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.1-deepseek/10-deep-seek-v4/02-deep-seek-v4-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DeepSeek-V4 核心架构剖析</h1>
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
