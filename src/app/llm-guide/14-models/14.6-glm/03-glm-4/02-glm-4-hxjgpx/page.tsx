"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于《GLM-4 技术报告精译》与 D5 核心技术专题, 对 GLM-4 的架构进行系统性梳理. GLM-4 是智谱 AI 在 2024 年 6 月发布的主力模型, 在中文对齐和全工具调用方面具有特色.
详细分析请参阅 <a href="/llm-guide/14-models/14.6-glm/03-glm-4/05-glm-4-architecture-overview">05-GLM-4-Architecture-Overview.md</a>.</p>
</blockquote>
<hr>
<h2 id="1-sjdj-zwdqyqgjty">1 设计动机: 中文对齐与全工具调用</h2>
<p>GLM-4 发布于 2024 年 6 月, 其核心设计动机:</p>
<ol>
<li><strong>中文对齐</strong>: 针对中文语境进行深度优化, 在中文理解和生成上达到领先水平.</li>
<li><strong>全工具调用</strong>: 支持代码解释器、搜索引擎、绘图工具等多种外部工具的自动调用.</li>
<li><strong>长上下文</strong>: 支持 128K 上下文, 满足复杂文档分析需求.</li>
</ol>
<blockquote>
<p>译者注: GLM-4 的「全工具调用」设计反映了智谱 AI 对 Agent 能力的早期探索. 与 Llama-3 的「安全优先」策略不同, GLM-4 更倾向于「能力优先」——通过赋予模型广泛的工具访问权限来提升其实用性. 这种设计哲学在后续 GLM-4-All-Tools 和 GLM-5 中得到了进一步发扬.</p>
</blockquote>
<hr>
<h2 id="2-ztjg">2 整体架构</h2>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="left">GLM-4 配置</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">Dense Transformer</td>
</tr>
<tr>
<td align="left">模型尺寸</td>
<td align="left">9B, 32B, 128B</td>
</tr>
<tr>
<td align="left">层数</td>
<td align="left">40-80</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">4096-8192</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">32-64</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">128K</td>
</tr>
<tr>
<td align="left">位置编码</td>
<td align="left">RoPE</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left">10T+ token</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: GLM-4 核心配置.</p>
</blockquote>
<p>GLM-4 采用标准 Dense Transformer 架构, 没有使用 MoE. 这与同期 DeepSeek 的 MoE 路线形成对比, 反映了智谱 AI 在架构选择上的保守策略.</p>
<hr>
<h2 id="3-hxcx">3 核心创新</h2>
<h3 id="3-1-zwdq">3.1 中文对齐</h3>
<p>GLM-4 的中文对齐体现在:</p>
<ul>
<li><strong>中文数据占比</strong>: 预训练数据中中文占比显著高于 Llama-3 和 Qwen2.</li>
<li><strong>中文评测优势</strong>: 在 C-Eval、CMMLU 等中文基准上显著优于同等规模的国际模型.</li>
<li><strong>文化适应性</strong>: 对中文成语、古诗词、网络用语等有更好的理解和生成能力.</li>
</ul>
<h3 id="3-2-qgjty">3.2 全工具调用</h3>
<p>GLM-4 支持多种外部工具的自动调用:</p>
<ul>
<li><strong>代码解释器</strong>: 自动执行 Python 代码解决数学和数据分析问题.</li>
<li><strong>搜索引擎</strong>: 实时获取信息并整合到回答中.</li>
<li><strong>绘图工具</strong>: 根据描述生成图像.</li>
<li><strong>文件处理</strong>: 读取和分析上传的文档.</li>
</ul>
<p>工具调用通过 Function Calling API 实现, 模型在生成回答时自动判断是否需要调用工具, 并根据工具返回结果继续推理.</p>
<h3 id="3-3-csxwkz">3.3 长上下文扩展</h3>
<p>GLM-4 从 4K 基础上下文扩展到 128K, 采用以下技术:</p>
<ul>
<li><strong>位置编码外推</strong>: 使用 NTK-aware 扩展和 YaRN 技术.</li>
<li><strong>滑动窗口注意力</strong>: 对远距离 token 使用稀疏注意力降低计算成本.</li>
<li><strong>长文本数据</strong>: 在预训练后期加入大量长文档数据.</li>
</ul>
<hr>
<h2 id="4-xnyjx">4 性能与局限</h2>
<h3 id="4-1-xn">4.1 性能</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="left">GLM-4-128B</th>
<th align="left">Llama-3-70B</th>
<th align="left">Qwen2-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="left">83.2</td>
<td align="left">82.0</td>
<td align="left">84.2</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="left">89.5</td>
<td align="left">65.2</td>
<td align="left">91.0</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="left">87.5</td>
<td align="left">83.5</td>
<td align="left">89.0</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="left">78.2</td>
<td align="left">81.7</td>
<td align="left">80.2</td>
</tr>
</tbody></table>
<p>GLM-4 在中文基准上优势明显, 但在代码生成等任务上略逊于 Llama-3.</p>
<h3 id="4-2-jxx">4.2 局限性</h3>
<ol>
<li><strong>Dense 架构的成本</strong>: 128B Dense 模型的推理成本显著高于同等性能的 MoE 模型.</li>
<li><strong>工具调用稳定性</strong>: 复杂场景下的多工具协调仍有提升空间.</li>
<li><strong>长上下文精度</strong>: 超过 64K 后的「大海捞针」准确率有所下降.</li>
</ol>
<hr>
<h2 id="5-pxdw">5 谱系定位</h2>
<p>GLM-4 在智谱 AI 家族树中的位置:</p>
<pre><code>GLM-130B (2022-10)
  |
  +--&gt; ChatGLM 系列 (2023)
  |
  +--&gt; GLM-4 (2024-06)
         中文对齐 + 全工具调用
  |
  +--&gt; GLM-4-Voice (2024-10)
  |
  +--&gt; GLM-5 (2025-04)
         MoE + 预训练到后训练全链路
</code></pre>
<p>GLM-4 是智谱 AI 从「学术探索」转向「产品落地」的关键节点, 其全工具调用设计为后续 GLM-5 的 Agent 能力奠定了基础.</p>
<hr>
<blockquote>
<p>本文档为综合架构剖析. 详细精译见《01-GLM-4技术报告精译.md》, 架构深入分析见《05-GLM-4-Architecture-Overview.md》.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-zwdqyqgjty","text":"1 设计动机: 中文对齐与全工具调用"},{"level":2,"id":"2-ztjg","text":"2 整体架构"},{"level":2,"id":"3-hxcx","text":"3 核心创新"},{"level":3,"id":"3-1-zwdq","text":"3.1 中文对齐"},{"level":3,"id":"3-2-qgjty","text":"3.2 全工具调用"},{"level":3,"id":"3-3-csxwkz","text":"3.3 长上下文扩展"},{"level":2,"id":"4-xnyjx","text":"4 性能与局限"},{"level":3,"id":"4-1-xn","text":"4.1 性能"},{"level":3,"id":"4-2-jxx","text":"4.2 局限性"},{"level":2,"id":"5-pxdw","text":"5 谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/03-glm-4/02-glm-4-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/03-glm-4/02-glm-4-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4 核心架构剖析</h1>
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
