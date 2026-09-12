"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma-3 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《Gemma-3 技术报告精译》与 D5 核心技术专题, 对 Gemma-3 的架构进行系统性梳理. Gemma-3 是 Google 在 2025 年 3 月发布的轻量开源模型系列, 覆盖从 1B 到 27B 的全尺寸.
详细分析请参阅 <a href="/llm-guide/14-models/14.10-gemma/03-gemma-3/05-gemma-3-architecture-overview">05-Gemma-3-Architecture-Overview.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-dcdyddqfg">1 设计动机: 端侧到云端的全覆盖</h2>
<p>Gemma-3 发布于 2025 年 3 月, 其核心设计动机:</p>
<ol>
<li><strong>全尺寸覆盖</strong>: 提供 1B/4B/12B/27B 四个参数规模, 从端侧到云端全覆盖.</li>
<li><strong>多模态长上下文</strong>: 支持文本 + 图像输入, 上下文窗口最高 128K.</li>
<li><strong>部署效率</strong>: 针对 Google 的 TPU 和 NVIDIA GPU 进行联合优化.</li>
</ol>
<blockquote>
<p>译者注: Gemma-3 的定位与 Qwen2 的「全尺寸矩阵」策略类似, 但 Gemma-3 更强调「端侧可用性」. 1B 模型可以在智能手机上运行, 4B 模型可以在浏览器中运行(WebGPU), 这是 Google 推动 AI 普及化的重要一步.</p>
</blockquote>
<hr>
<h2 id="2-ztjg">2 整体架构</h2>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">Gemma-3-1B</th>
<th align="left">Gemma-3-4B</th>
<th align="left">Gemma-3-12B</th>
<th align="left">Gemma-3-27B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">Dense</td>
<td align="left">Dense</td>
<td align="left">Dense</td>
<td align="left">Dense</td>
</tr>
<tr>
<td align="left">层数</td>
<td align="left">18</td>
<td align="left">34</td>
<td align="left">48</td>
<td align="left">64</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">1152</td>
<td align="left">2560</td>
<td align="left">3840</td>
<td align="left">5376</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">4</td>
<td align="left">8</td>
<td align="left">16</td>
<td align="left">32</td>
</tr>
<tr>
<td align="left">KV 头数</td>
<td align="left">1</td>
<td align="left">1</td>
<td align="left">16</td>
<td align="left">16</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">32K</td>
<td align="left">128K</td>
<td align="left">128K</td>
<td align="left">128K</td>
</tr>
<tr>
<td align="left">多模态</td>
<td align="left">否</td>
<td align="left">是</td>
<td align="left">是</td>
<td align="left">是</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: Gemma-3 系列核心配置.</p>
</blockquote>
<p>Gemma-3 采用标准 Dense Transformer 架构, 使用 GQA(Grouped-Query Attention)压缩 KV Cache. 小模型(1B/4B)使用 MQA(Multi-Query Attention), 大模型(12B/27B)使用 GQA.</p>
<hr>
<h2 id="3-hxcx">3 核心创新</h2>
<h3 id="3-1-jb-qjzyl">3.1 局部-全局注意力</h3>
<p>Gemma-3 采用局部-全局混合注意力(Local-Global Attention):</p>
<ul>
<li><strong>局部注意力</strong>: 对最近的 token 使用标准注意力, 保持精细的局部依赖.</li>
<li><strong>全局注意力</strong>: 对远距离 token 使用稀疏注意力, 降低计算成本.</li>
</ul>
<p>这种混合策略使得 128K 上下文的计算成本可控, 同时保持了长距离依赖的捕捉能力.</p>
<h3 id="3-2-dmtjg">3.2 多模态架构</h3>
<p>Gemma-3 的多模态版本(4B/12B/27B)引入了一个轻量的视觉编码器:</p>
<ul>
<li><strong>图像编码</strong>: 使用 SigLIP 编码器将图像转换为视觉 token.</li>
<li><strong>模态融合</strong>: 视觉 token 与文本 token 在输入层拼接, 共同进入 Transformer.</li>
<li><strong>训练策略</strong>: 先预训练视觉编码器, 再与语言模型联合微调.</li>
</ul>
<h3 id="3-3-zszl">3.3 知识蒸馏</h3>
<p>Gemma-3 的大模型(27B)通过知识蒸馏从 Gemini 系列获取能力, 小模型(1B/4B/12B)通过蒸馏从 27B 模型获取能力.</p>
<p>这种「教师-学生」链式蒸馏确保了全系列模型的能力一致性.</p>
<hr>
<h2 id="4-xnyjx">4 性能与局限</h2>
<h3 id="4-1-xn">4.1 性能</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">Gemma-3-27B</th>
<th align="left">Qwen2.5-32B</th>
<th align="left">Llama-3.1-8B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="left">78.5</td>
<td align="left">83.2</td>
<td align="left">73.0</td>
</tr>
<tr>
<td align="left">MATH-500</td>
<td align="left">65.2</td>
<td align="left">78.5</td>
<td align="left">51.0</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="left">72.5</td>
<td align="left">80.2</td>
<td align="left">60.5</td>
</tr>
</tbody></table>
<p>Gemma-3-27B 在同等参数量下表现良好, 但在数学和代码任务上略逊于 Qwen2.5-32B.</p>
<h3 id="4-2-jxx">4.2 局限性</h3>
<ol>
<li><strong>Dense 架构成本</strong>: 27B Dense 模型的推理成本高于同等性能的 MoE 模型.</li>
<li><strong>多模态能力有限</strong>: 视觉编码器相对轻量, 复杂图像理解能力有限.</li>
<li><strong>中文能力</strong>: 中文数据占比较低, 中文任务表现不如 Qwen 系列.</li>
</ol>
<hr>
<h2 id="5-pxdw">5 谱系定位</h2>
<p>Gemma-3 在 Google 开源家族中的位置:</p>
<pre><code>Gemma (2024-02)
  |
  +--&gt; Gemma-2 (2024-06)
  |
  +--&gt; Gemma-3 (2025-03)
         全尺寸 + 多模态 + 128K 上下文
</code></pre>
<p>Gemma-3 代表了 Google 在「轻量开源 + 端侧部署」方向上的最新探索, 与 DeepSeek 的「工程极致 + 云端部署」形成互补.</p>
<hr>
<blockquote>
<p>本文档为综合架构剖析. 详细精译见《01-Gemma-3技术报告精译.md》, 架构深入分析见《05-Gemma-3-Architecture-Overview.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-dcdyddqfg","text":"1 设计动机: 端侧到云端的全覆盖"},{"level":2,"id":"2-ztjg","text":"2 整体架构"},{"level":2,"id":"3-hxcx","text":"3 核心创新"},{"level":3,"id":"3-1-jb-qjzyl","text":"3.1 局部-全局注意力"},{"level":3,"id":"3-2-dmtjg","text":"3.2 多模态架构"},{"level":3,"id":"3-3-zszl","text":"3.3 知识蒸馏"},{"level":2,"id":"4-xnyjx","text":"4 性能与局限"},{"level":3,"id":"4-1-xn","text":"4.1 性能"},{"level":3,"id":"4-2-jxx","text":"4.2 局限性"},{"level":2,"id":"5-pxdw","text":"5 谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/03-gemma-3/02-gemma-3-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/03-gemma-3/02-gemma-3-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma-3 核心架构剖析</h1>
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
