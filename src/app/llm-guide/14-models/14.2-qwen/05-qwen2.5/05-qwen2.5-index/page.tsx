"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5 核心技术专题索引</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<p>Qwen2.5 是 Qwen 路线从“强开源模型系列”迈向“成熟模型平台”的关键版本。它没有依赖颠覆性新架构，而是围绕数据规模、后训练体系、超长上下文和产品矩阵做系统升级，把 Qwen2 推向了更工业化的阶段。</p>
<h2 id="1-jswtdyybj-technical-problem-definition">1. 技术问题定义与背景 (Technical Problem Definition)</h2>
<p>Qwen2.5 要解决的核心问题不是“把 Qwen2 再放大一点”，而是“如何在保持成熟架构稳定的前提下，把能力、上下文、对齐和产品可用性一起做上去”。具体包括：</p>
<ol>
<li><strong>预训练数据规模壁垒</strong>：如何把预训练数据从 7T Tokens 扩展到 18T Tokens，而不靠低质量语料硬堆，同时维持多语言和多模态对齐的潜力。</li>
<li><strong>后训练(Post-Training)范式演进</strong>：如何让后训练从简单的 SFT + DPO 进一步演进到更深度的强化学习(RL)对齐体系，特别是结合在线 RL。</li>
<li><strong>超长上下文的系统性工程</strong>：如何把超长上下文从“外挂式配置”变成模型原生能力，从 128k 推到 1M(百万级)。</li>
</ol>
<h2 id="2-fflcj-method-breakdown">2. 方法论拆解 (Method Breakdown)</h2>
<p>Qwen2.5 的方法主线是典型的工业化升级路线，其关键技术模块包括：</p>
<h3 id="2-1-18t-gzlylyqyhcsjxh">2.1 18T 高质量语料引擎与合成数据循环</h3>
<p>Qwen2.5 建立了一个高度自动化的数据飞轮。除了常规的启发式过滤和去重，引入了：</p>
<ul>
<li><strong>自举过滤(Bootstrapped Filtering)</strong>：使用早期版本的 Qwen 模型作为分类器，清洗全网脏数据。</li>
<li><strong>合成数据增强</strong>：特别在代码和数学领域，利用强推理模型生成中间推导步骤(CoT)，反哺基础模型的预训练和 SFT。</li>
</ul>
<h3 id="2-2-jjscsxwxly-rope-tz">2.2 渐进式长上下文训练与 RoPE 调整</h3>
<p>Qwen2.5-Turbo 实现 1M 上下文的核心在于渐进式扩展(Progressive Extension)与 YARN(Yet Another RoPE for Transformers)技术的结合。</p>
<p>对于位置编码，Qwen2.5 调整了基频(Base Frequency)：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msub><mi>θ</mi><mn>0</mn></msub><mo>⋅</mo><msup><mi>b</mi><mrow><mo>−</mo><mfrac><mrow><mn>2</mn><mi>i</mi></mrow><mi>d</mi></mfrac></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = \\theta_0 \\cdot b^{-\\frac{2i}{d}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0116em;"></span><span class="mord"><span class="mord mathnormal">b</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.0116em;"><span style="top:-3.413em;margin-right:0.05em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight"><span class="mopen nulldelimiter sizing reset-size3 size6"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8551em;"><span style="top:-2.656em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span></span></span></span><span style="top:-3.2255em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line mtight" style="border-bottom-width:0.049em;"></span></span><span style="top:-3.384em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">2</span><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.344em;"><span></span></span></span></span></span><span class="mclose nulldelimiter sizing reset-size3 size6"></span></span></span></span></span></span></span></span></span></span></span></span></span></span>
<p>在长上下文微调中，动态调整 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>b</mi></mrow><annotation encoding="application/x-tex">b</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">b</span></span></span></span>(如从 10000 扩展到 1000000)，配合 Dual Chunk Attention (DCA) 和稀疏注意力，以降低计算复杂度。</p>
<pre><code class="language-mermaid">graph LR
    A[Pre-training 4k] --&gt;|Stage 1| B[Context Extension 32k]
    B --&gt;|Stage 2: RoPE Base scaling| C[Context Extension 128k]
    C --&gt;|Stage 3: YARN + DCA| D[Turbo 1M Context]
    
    style A fill:#e0f7fa,stroke:#006064
    style B fill:#b2ebf2,stroke:#00838f
    style C fill:#80deea,stroke:#0097a6
    style D fill:#4dd0e1,stroke:#00acc1
</code></pre>
<h3 id="2-3-hhqhxxdq-offline-amp-online-rl">2.3 混合强化学习对齐 (Offline &amp; Online RL)</h3>
<p>后训练阶段区分了离线 RL 与在线 RL：</p>
<ul>
<li><strong>离线 RL(Offline RL)</strong>：通过大规模人工或强模型打分的偏好数据集(如 DPO、ORPO)校准硬能力。</li>
<li><strong>在线 RL(Online RL / PPO / GRPO)</strong>：使用类似 DeepSeek 的 GRPO(Group Relative Policy Optimization)或者标准的 PPO，通过实时 Reward Model 反馈，优化软偏好和细微的逻辑推导。</li>
</ul>
<h2 id="3-gcyjgfx-engineering-analysis">3. 工程与架构分析 (Engineering Analysis)</h2>
<p>Qwen2.5 最强的地方在于工程体系的完整度：</p>
<ol>
<li><strong>尺寸全覆盖与集群算力调度</strong>：
开源版本覆盖 0.5B 到 72B，商业版包括千亿级别 MoE 模型。这要求底层的 Megatron-LM / Deepspeed 修改版必须支持高效率的 3D 并行(TP + PP + DP)以及动态算子熔断(Kernel Fusion)。</li>
<li><strong>Dense 与 MoE 双线并行</strong>：
在 72B dense 达到开源顶流的同时，利用 MoE 架构在云端提供更高参数量但推理成本可控的服务，这种双线策略考验着数据配比的通用性。</li>
<li><strong>KV Cache 与长文本算子优化</strong>：
引入 FlashAttention-3(或类似的底层自研算子)结合 GQA，使得 72B 模型在端侧或单机 8 卡环境下的长文本吞吐大幅上升。</li>
</ol>
<h2 id="4-bjyjxxsm-boundary-explanations">4. 边界与局限性说明 (Boundary Explanations)</h2>
<ul>
<li><strong>数据系统复制门槛</strong>：大部分能力跃升来源于 18T 高质量语料的处理系统，社区很难复制其数据清洗流水线。</li>
<li><strong>长文本能力的分布不均</strong>：百万上下文能力主要集中在 Turbo 线上，开源的 Dense 基础版通常默认支持 128K，强行外推到 1M 仍会出现 &quot;Lost in the middle&quot; 现象。</li>
<li><strong>在线 RL 的评估脱节</strong>：奖励模型(Reward Model)的泛化能力和下游 RL 表现之间仍存在一定脱节，Reward Hacking(Goodhart 风险)在代码生成任务中依然存在。</li>
</ul>
<hr>
<h2 id="5-wddh">5. 文档导航</h2>
<table>
<thead>
<tr>
<th align="left">文档</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/05-qwen2.5/01-qwen2.5-jsbgjy">01-Qwen2.5 技术报告精译</a></td>
<td align="left">主报告精译与整体技术脉络</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/05-qwen2.5/02-qwen2.5-hxjgpx">02-Qwen2.5 核心架构剖析</a></td>
<td align="left">稠密与 MoE 路线、GRPO 引入和配置矩阵解析</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-architecture-overview">05-Qwen2.5 Architecture Overview</a></td>
<td align="left">从谱系与版本路线看 Qwen2.5 的定位</td>
</tr>
<tr>
<td align="left"><a href="/llm-guide/14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-training-system">05-Qwen2.5 Training System</a></td>
<td align="left">18T 数据工程、SFT、离线 RL 与在线 RL 的系统拆解</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">03-Qwen2.5 MinerU-EN</a></td>
<td align="left">英文整理稿</td>
</tr>
<tr>
<td align="left"><a href="#broken-link">04-Qwen2.5 MinerU-ZH</a></td>
<td align="left">中文交付稿</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jswtdyybj-technical-problem-definition","text":"1. 技术问题定义与背景 (Technical Problem Definition)"},{"level":2,"id":"2-fflcj-method-breakdown","text":"2. 方法论拆解 (Method Breakdown)"},{"level":3,"id":"2-1-18t-gzlylyqyhcsjxh","text":"2.1 18T 高质量语料引擎与合成数据循环"},{"level":3,"id":"2-2-jjscsxwxly-rope-tz","text":"2.2 渐进式长上下文训练与 RoPE 调整"},{"level":3,"id":"2-3-hhqhxxdq-offline-amp-online-rl","text":"2.3 混合强化学习对齐 (Offline &amp; Online RL)"},{"level":2,"id":"3-gcyjgfx-engineering-analysis","text":"3. 工程与架构分析 (Engineering Analysis)"},{"level":2,"id":"4-bjyjxxsm-boundary-explanations","text":"4. 边界与局限性说明 (Boundary Explanations)"},{"level":2,"id":"5-wddh","text":"5. 文档导航"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/05-qwen2.5/05-qwen2.5-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5 核心技术专题索引</h1>
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
