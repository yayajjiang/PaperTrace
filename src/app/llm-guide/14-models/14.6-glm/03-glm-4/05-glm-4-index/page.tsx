"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4 核心技术专题索引</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<h2 id="1-jswtdyybj-technical-problem-definition">1. 技术问题定义与背景 (Technical Problem Definition)</h2>
<p>从 ChatGLM 时代开始，智谱 AI(Zhipu AI)主导的 GLM 系列一直是国内开源/闭源模型的中坚力量。GLM-4 作为第四代旗舰模型，不再仅仅追求单一的对话生成，而是致力于打造一个**全能型通用智能体(All-Tools Agent)**基座。</p>
<p>它面临的核心技术挑战包括：</p>
<ol>
<li><strong>中文原生的深度对齐</strong>：如何在保证英文 Benchmark 不掉队的情况下，将中文知识、逻辑和指令遵循做到极致，而非仅仅是英文模型的“汉化版”。</li>
<li><strong>多工具协同计算(All-Tools)</strong>：如何让模型自主规划任务，并在代码解释器(Code Interpreter)、网页浏览(Web Browsing)、文生图和外部 API 之间自由切换并传递状态。</li>
<li><strong>百万级上下文(1M Context)与显存控制</strong>：把上下文从 32K 扩展到 128K 甚至 1M 时，如何解决长程注意力带来的灾难性内存暴涨。</li>
</ol>
<h2 id="2-fflcj-method-breakdown">2. 方法论拆解 (Method Breakdown)</h2>
<h3 id="2-1-gyzhgyxl-glm-architecture">2.1 广义自回归预训练 (GLM Architecture)</h3>
<p>GLM 家族有别于标准的 Llama Decoder-only 架构。它在底层使用的是**广义自回归预训练(General Language Model)**机制，通过二维位置编码(2D RoPE)来实现自回归填空任务。</p>
<p>在 GLM-4 中，架构全面引入了 <strong>Grouped-Query Attention (GQA)</strong> 并结合 <strong>SwiGLU</strong> 激活函数。为了补偿 GQA 带来的参数减少，GLM-4 增加了 FFN(前馈神经网络)的隐藏层维度。</p>
<pre><code class="language-mermaid">graph TD
    A[Input Text] --&gt; B[GLM-4 Tokenizer 150K]
    B --&gt; C[Transformer Blocks with GQA]
    C --&gt; D[2D Rotary Position Embedding]
    D --&gt; E[FFN Expansion: Hidden x 10/3]
    E --&gt; F[Agent-aligned Output]
    
    style B fill:#e3f2fd,stroke:#1565c0
    style D fill:#bbdefb,stroke:#1976d2
</code></pre>
<h3 id="2-2-agent-tuning-y-all-tools-xlfs">2.2 AgentTuning 与 All-Tools 训练范式</h3>
<p>GLM-4 不是简单地在 SFT 阶段加入工具调用指令，而是通过 <strong>AgentTuning</strong> 框架进行系统性后训练：</p>
<ul>
<li>构造了一个包含多步推理、错误纠正和跨工具通信的高质量轨迹(Trajectory)数据集。</li>
<li>使用 Reward Model 对 Agent 探索的轨迹进行打分，并采用 RLHF 进一步强化。</li>
</ul>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>R</mi><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>a</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>R</mi><mrow><mi>t</mi><mi>a</mi><mi>s</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>a</mi><mo stretchy="false">)</mo><mo>+</mo><mi>λ</mi><mo>⋅</mo><msub><mi>R</mi><mrow><mi>t</mi><mi>o</mi><mi>o</mi><mi>l</mi><mi mathvariant="normal">_</mi><mi>e</mi><mi>f</mi><mi>f</mi><mi>i</mi><mi>c</mi><mi>i</mi><mi>e</mi><mi>n</mi><mi>c</mi><mi>y</mi></mrow></msub><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>a</mi><mo stretchy="false">)</mo><mo>−</mo><mi>γ</mi><mo>⋅</mo><msub><mi>R</mi><mrow><mi>h</mi><mi>a</mi><mi>l</mi><mi>l</mi><mi>u</mi><mi>c</mi><mi>i</mi><mi>n</mi><mi>a</mi><mi>t</mi><mi>i</mi><mi>o</mi><mi>n</mi></mrow></msub><mo stretchy="false">(</mo><mi>s</mi><mo separator="true">,</mo><mi>a</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">R(s, a) = R_{task}(s, a) + \\lambda \\cdot R_{tool\\_efficiency}(s, a) - \\gamma \\cdot R_{hallucination}(s, a)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">a</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">a</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">λ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.117em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">oo</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mtight" style="margin-right:0.0278em;">_</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">cy</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">a</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ha</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">ina</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">n</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">a</span><span class="mclose">)</span></span></span></span></span>
<p>(奖励函数不仅考虑任务是否完成，还惩罚无效的工具调用和幻觉)</p>
<h3 id="2-3-long-align-cwbdq">2.3 LongAlign 长文本对齐</h3>
<p>为了解决 1M 上下文，GLM-4 团队提出了 LongAlign，针对超长数据的微调进行了优化。它打包了不同长度的指令，平衡了长短文本在 batch 中的分布，防止模型在 SFT 阶段遗忘短上下文能力。</p>
<h2 id="3-gcsxyxnfx-engineering-analysis">3. 工程实现与性能分析 (Engineering Analysis)</h2>
<ol>
<li><strong>词表扩展(Tokenizer Expansion)</strong>：
将词表扩大到 150K，大幅提高了多语言与代码的压缩率。这意味着在相同的 128K 窗口下，GLM-4 能塞入比 32K 词表模型多出 20%-30% 的实际中文信息。</li>
<li><strong>显存与推理优化</strong>：
通过 GQA 技术，128K 序列下的 KV Cache 大幅缩小，使得 GLM-4-9B 能够在单张 24GB 显存(如 RTX 3090/4090)的消费级显卡上流畅部署。</li>
</ol>
<h2 id="4-bjyjxxsm-boundary-explanations">4. 边界与局限性说明 (Boundary Explanations)</h2>
<ul>
<li><strong>非标准架构的适配摩擦</strong>：GLM 的二维位置编码和特有的 Mask 机制导致其在接入某些通用推理框架(如早期版本的 vLLM 或 TGI)时，需要等待专门的算子支持，社区适配速度略慢于 Llama 系。</li>
<li><strong>Agent 规划的幻觉</strong>：在执行多步(超过 5 步)且涉及复杂网页解析的 All-Tools 任务时，GLM-4 仍会偶尔陷入“死循环调用”或提取错误网页元素的问题，这受限于当前纯文本 RLHF 的局限。</li>
<li><strong>与闭源 MoE 的差距</strong>：GLM-4 的 Dense 版本在算力转化率上，已逼近 Dense 的极限，面对后续多模态和万亿 MoE 的竞争，依然需要持续架构演进(这在后续的 GLM-4V 和 GLM-5 中得到体现)。</li>
</ul>
<hr>
<h2 id="5-zwddh">5. 子文档导航</h2>
<ul>
<li><a href="/llm-guide/14-models/14.6-glm/03-glm-4/01-glm-4-jsbgjy">GLM-4 技术报告精译</a></li>
<li><a href="/llm-guide/14-models/14.6-glm/03-glm-4/02-glm-4-hxjgpx">GLM-4 核心架构剖析</a></li>
<li><a href="#broken-link">GLM-4 技术报告 MinerU 逐段翻译</a></li>
<li><a href="/llm-guide/14-models/14.6-glm/03-glm-4/05-glm-4-architecture-overview">GLM-4 核心架构与中文对齐设计剖析</a></li>
</ul>
<h2 id="6-fjzy">6. 附加资源</h2>
<ul>
<li><a href="#">images</a></li>
<li><a href="#">pdfs</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jswtdyybj-technical-problem-definition","text":"1. 技术问题定义与背景 (Technical Problem Definition)"},{"level":2,"id":"2-fflcj-method-breakdown","text":"2. 方法论拆解 (Method Breakdown)"},{"level":3,"id":"2-1-gyzhgyxl-glm-architecture","text":"2.1 广义自回归预训练 (GLM Architecture)"},{"level":3,"id":"2-2-agent-tuning-y-all-tools-xlfs","text":"2.2 AgentTuning 与 All-Tools 训练范式"},{"level":3,"id":"2-3-long-align-cwbdq","text":"2.3 LongAlign 长文本对齐"},{"level":2,"id":"3-gcsxyxnfx-engineering-analysis","text":"3. 工程实现与性能分析 (Engineering Analysis)"},{"level":2,"id":"4-bjyjxxsm-boundary-explanations","text":"4. 边界与局限性说明 (Boundary Explanations)"},{"level":2,"id":"5-zwddh","text":"5. 子文档导航"},{"level":2,"id":"6-fjzy","text":"6. 附加资源"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/03-glm-4/05-glm-4-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/03-glm-4/05-glm-4-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4 核心技术专题索引</h1>
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
