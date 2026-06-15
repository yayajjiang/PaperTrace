"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma-2 核心技术专题索引</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<h2 id="1-jswtdyybj-technical-problem-definition">1. 技术问题定义与背景 (Technical Problem Definition)</h2>
<p>Gemma-2 的核心设计目标是在保持小尺寸模型(9B、27B 等量级)轻量级推理优势的同时, 突破传统小模型由于参数量受限导致的知识容量与推理能力天花板。在大模型(如 Gemini 1.5 Pro)不断演进的同时, 端侧与边缘侧对开源、高效且性能拔尖的小模型需求日益强烈。</p>
<p>Gemma-2 面临的主要技术挑战包括：</p>
<ol>
<li><strong>模型压缩与知识蒸馏</strong>：如何将千亿级甚至万亿级教师模型(Gemini)的深层知识(尤其是推理过程与分布特征)无损或少损地迁移到百亿级学生模型。</li>
<li><strong>长上下文与显存优化</strong>：在有限的显存下(尤其是端侧设备), 如何支持更长上下文并维持注意力机制的计算效率。</li>
<li><strong>数值稳定性</strong>：在深度网络中, 尤其是激活值极值问题导致量化和推理过程中的数值溢出(例如在半精度或 INT8 训练/推理时)。</li>
</ol>
<h2 id="2-fflcj-method-breakdown">2. 方法论拆解 (Method Breakdown)</h2>
<h3 id="2-1-jyljzdsdzszl-logit-based-knowledge-distillation">2.1 基于逻辑值的深度知识蒸馏 (Logit-based Knowledge Distillation)</h3>
<p>Gemma-2 广泛采用了教师模型的预测概率分布(Logits)来指导学生模型的训练。相比于仅使用硬标签(Hard Labels), 软标签(Soft Labels)包含了模型对不同候选词的置信度, 这在保留模型推理路径上至关重要。</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>K</mi><mi>D</mi></mrow></msub><mo>=</mo><mo>−</mo><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>P</mi><mrow><mi>t</mi><mi>e</mi><mi>a</mi><mi>c</mi><mi>h</mi><mi>e</mi><mi>r</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo><mi>log</mi><mo>⁡</mo><msub><mi>P</mi><mrow><mi>s</mi><mi>t</mi><mi>u</mi><mi>d</mi><mi>e</mi><mi>n</mi><mi>t</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{KD} = - \\sum_{i} P_{teacher}(y_i | x) \\log P_{student}(y_i | x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3277em;vertical-align:-1.2777em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span><p>此外, Gemma-2 引入了更细粒度的蒸馏策略, 结合了中间层特征对齐与分布对齐。</p>
<h3 id="2-2-jb-qjzyljc-interleaved-local-global-attention">2.2 局部-全局注意力交错 (Interleaved Local-Global Attention)</h3>
<p>为了在长上下文中平衡计算效率与信息捕捉能力, Gemma-2 采用了滑动窗口注意力(Local/Sliding Window Attention)与全局注意力(Global Attention)交错的架构。</p>
<pre><code class="language-mermaid">graph TD
    A[Input Tokens] --&gt; B[Layer 1: Local Attention W=4096]
    B --&gt; C[Layer 2: Global Attention]
    C --&gt; D[Layer 3: Local Attention W=4096]
    D --&gt; E[Layer 4: Global Attention]
    E --&gt; F[Output Representation]
    
    style B fill:#e1f5fe,stroke:#01579b
    style C fill:#fff3e0,stroke:#e65100
    style D fill:#e1f5fe,stroke:#01579b
    style E fill:#fff3e0,stroke:#e65100
</code></pre>
<p>这种设计使得：</p>
<ul>
<li><strong>局部层</strong>：捕捉相邻上下文的细粒度依赖, 减少 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的复杂度。</li>
<li><strong>全局层</strong>：确保远距离信息的有效传递, 防止上下文碎片化。</li>
</ul>
<h3 id="2-3-logit-soft-capping">2.3 Logit Soft-Capping</h3>
<p>为了防止由于极端 Logit 值导致的梯度爆炸和数值不稳定, Gemma-2 在注意力分数(Attention Scores)和最终输出层引入了 Soft-Capping 机制。</p>
<p>公式如下：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Logit</mtext><mo>=</mo><mi>τ</mi><mo>⋅</mo><mi>tanh</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mi>x</mi><mi>τ</mi></mfrac><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\text{Logit} = \\tau \\cdot \\tanh\\left(\\frac{x}{\\tau}\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Logit</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.836em;vertical-align:-0.686em;"></span><span class="mop">tanh</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 是一预设的缩放阈值(例如 30.0)。这种非线性约束在保证梯度的同时, 硬性限制了输出的上界, 极大增强了量化推理(如 FP8、INT8)的鲁棒性。</p>
<h2 id="3-gcsxyxnfx-engineering-analysis">3. 工程实现与性能分析 (Engineering Analysis)</h2>
<p>Gemma-2 在工程实现上做出了多项针对端侧和单卡部署的优化：</p>
<ol>
<li><p><strong>GQA (Grouped-Query Attention)</strong>:
不同于传统的多头注意力, Gemma-2 全面采用 GQA, 通过共享 Key/Value 头, 大幅降低了推理阶段的 KV Cache 内存占用。</p>
<ul>
<li>内存对比：标准 MHA 在长上下文下可能占用十数 GB, 而 GQA 可将内存消耗降低至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mi>G</mi></mrow><annotation encoding="application/x-tex">1/G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1/</span><span class="mord mathnormal">G</span></span></span></span>(其中 G 为组数)。</li>
</ul>
</li>
<li><p><strong>多硬件后端的适配 (JAX / PyTorch / MLX)</strong>:
Gemma-2 在开源时即提供了广泛的后端支持, 特别是通过 JAX/XLA 实现的大规模训练集群高效通信。</p>
</li>
</ol>
<h2 id="4-bjyjxxsm-boundary-explanations">4. 边界与局限性说明 (Boundary Explanations)</h2>
<p>尽管 Gemma-2 表现出色, 但其架构也决定了部分局限性：</p>
<ul>
<li><strong>知识截断与更新难题</strong>：作为一个蒸馏为主导的模型, 其内部知识图谱严格受限于教师模型。如果教师模型存在幻觉或知识盲点, Gemma-2 会大概率继承甚至放大。</li>
<li><strong>特定语言的偏置</strong>：在多语言支持上, 尤其针对低资源语言, 受限于词表的压缩率, Gemma-2 表现不如专注于多语言的专属模型。</li>
<li><strong>交错注意力的推理适配</strong>：局部与全局交错的注意力机制导致部分高度优化的推理引擎(如早期的 vLLM 某些分支)需要特定的算子修改才能充分释放吞吐潜力。</li>
</ul>
<hr>
<h2 id="5-ztlb">5. 专题列表</h2>
<p>本文档汇总 Gemma-2 子目录下的所有 D5 核心技术专题文档.</p>
<table>
<thead>
<tr>
<th>编号</th>
<th>文件名</th>
<th>技术点</th>
<th>状态</th>
</tr>
</thead>
<tbody><tr>
<td>1</td>
<td><a href="/llm-guide/14-models/14.10-gemma/02-gemma-2/05-gemma-2-knowledge-distillation">05-Gemma-2-Knowledge-Distillation.md</a></td>
<td>知识蒸馏原理与工程实现</td>
<td>已完成</td>
</tr>
</tbody></table>
<h2 id="6-dbczt">6. 待补充专题</h2>
<ul>
<li>局部-全局注意力交错的工程权衡(深度对比测试数据)</li>
<li>Logit Soft-Capping 的数值稳定性分析(FP8 混合精度场景)</li>
<li>GQA 在端侧推理中的 KV Cache 优化与分块管理机制</li>
</ul>
<blockquote>
<p>知识库同步位置: <code>docs/guide/llm/distillation/gemma2-kd.md</code></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jswtdyybj-technical-problem-definition","text":"1. 技术问题定义与背景 (Technical Problem Definition)"},{"level":2,"id":"2-fflcj-method-breakdown","text":"2. 方法论拆解 (Method Breakdown)"},{"level":3,"id":"2-1-jyljzdsdzszl-logit-based-knowledge-distillation","text":"2.1 基于逻辑值的深度知识蒸馏 (Logit-based Knowledge Distillation)"},{"level":3,"id":"2-2-jb-qjzyljc-interleaved-local-global-attention","text":"2.2 局部-全局注意力交错 (Interleaved Local-Global Attention)"},{"level":3,"id":"2-3-logit-soft-capping","text":"2.3 Logit Soft-Capping"},{"level":2,"id":"3-gcsxyxnfx-engineering-analysis","text":"3. 工程实现与性能分析 (Engineering Analysis)"},{"level":2,"id":"4-bjyjxxsm-boundary-explanations","text":"4. 边界与局限性说明 (Boundary Explanations)"},{"level":2,"id":"5-ztlb","text":"5. 专题列表"},{"level":2,"id":"6-dbczt","text":"6. 待补充专题"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/02-gemma-2/05-gemma-2-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/02-gemma-2/05-gemma-2-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma-2 核心技术专题索引</h1>
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
