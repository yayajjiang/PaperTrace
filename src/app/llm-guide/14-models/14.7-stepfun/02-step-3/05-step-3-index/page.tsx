"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Step-3 核心技术专题索引</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.7-stepfun/14.7-stepfun">返回 14.7-StepFun 家族总览</a></strong></p>
</blockquote>
<h2 id="1-jswtdyybj-technical-problem-definition">1. 技术问题定义与背景 (Technical Problem Definition)</h2>
<p>Step-3 是阶跃星辰(StepFun)推出的千亿参数级 MoE 语言模型。在国内大模型创业公司中，StepFun 以“模型-系统协同设计(Co-design)”著称。</p>
<p>Step-3 需要解决的核心问题是：在极其有限且异构的算力资源下，如何设计一个千亿参数级别的 MoE 模型，既能在能力上逼近国际一线，又能在端到端的解码与服务成本上实现极致压缩？</p>
<ol>
<li><strong>异构集群下的长序列扩展</strong>：如何在算力波动的智算中心完成极大规模的预训练。</li>
<li><strong>MoE 路由坍塌问题</strong>：千亿模型在专家分配时极易出现“旱的旱死，涝的涝死”导致算力闲置。</li>
<li><strong>极高并发下的解码成本瓶颈</strong>：如何缓解生成首字时间(TTFT)和每个 token 生成时间(TPOT)之间的矛盾。</li>
</ol>
<h2 id="2-fflcj-method-breakdown">2. 方法论拆解 (Method Breakdown)</h2>
<h3 id="2-1-gx-moe-y-cchfzjh">2.1 高效 MoE 与 层次化负载均衡</h3>
<p>Step-3 采用了细粒度专家和共享专家的混合架构，但在负载均衡上进行了自研改进。通过分层路由机制，保证在不同 Token 尺度上专家的激活概率趋于平稳。</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>L</mi><mrow><mi>b</mi><mi>a</mi><mi>l</mi><mi>a</mi><mi>n</mi><mi>c</mi><mi>e</mi></mrow></msub><mo>=</mo><mi>α</mi><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>E</mi></munderover><msub><mi>f</mi><mi>i</mi></msub><msub><mi>P</mi><mi>i</mi></msub><mo>+</mo><mi>β</mi><mtext>KL</mtext><mo stretchy="false">(</mo><msub><mi>P</mi><mrow><mi>r</mi><mi>o</mi><mi>u</mi><mi>t</mi><mi>e</mi><mi>r</mi></mrow></msub><mi mathvariant="normal">∣</mi><mi mathvariant="normal">∣</mi><msub><mi>P</mi><mrow><mi>u</mi><mi>n</mi><mi>i</mi><mi>f</mi><mi>o</mi><mi>r</mi><mi>m</mi></mrow></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">L_{balance} = \\alpha \\sum_{i=1}^{E} f_i P_i + \\beta \\text{KL}(P_{router} || P_{uniform})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ba</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">an</span><span class="mord mathnormal mtight">ce</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0576em;">E</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord text"><span class="mord">KL</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">ni</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">or</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><h3 id="2-2-mx-xtxtsj-algorithm-system-co-design">2.2 模型-系统协同设计 (Algorithm-System Co-design)</h3>
<p>阶跃星辰的特色在于算法设计不仅仅为了跑分，而是为了契合底层的分布式系统特征：</p>
<ul>
<li>算子层面的前向与反向重写。</li>
<li>动态 KV Cache 换入换出机制。</li>
</ul>
<pre><code class="language-mermaid">graph LR
    A[User Request] --&gt; B[Scheduler with Chunked Prefill]
    B --&gt; C[Step-3 MoE Network]
    C --&gt;|KV Cache Swapping| D[(Paged KV Pool)]
    C --&gt; E[Speculative Decoding Head]
    E --&gt; F[Output]
    
    style B fill:#ffe0b2,stroke:#ef6c00
    style D fill:#bbdefb,stroke:#1565c0
</code></pre>
<h3 id="2-3-jmcbyh-decoding-cost-optimization">2.3 解码成本优化 (Decoding Cost Optimization)</h3>
<p>采用多种并行解码技术，将自回归生成的延时大幅降低，极大拉低了商业 API 调用的成本。结合投机解码(Speculative Decoding)，不仅减少了主模型的激活次数，更在内存带宽受限的情况下提升了算力利用率(MFU)。</p>
<h2 id="3-gcfxybjjx-engineering-amp-boundaries">3. 工程分析与边界局限 (Engineering &amp; Boundaries)</h2>
<p><strong>工程亮点</strong>：</p>
<ul>
<li>Step-3 展示了国内初创团队在缺乏无限算力的背景下，如何通过压榨系统层面的性能(定制 Cuda/Triton 内核、改进 Megatron 框架)来弥补算力差距。</li>
</ul>
<p><strong>局限性</strong>：</p>
<ul>
<li><strong>学术透明度</strong>：相较于完全开源的 Qwen 或 DeepSeek，StepFun 的技术细节披露较少，部分协同设计的底层数据难以复现。</li>
<li><strong>多语言生态</strong>：专注于中文与英文，在国际化多语言测试集中的泛化能力边界仍未彻底探明。</li>
</ul>
<hr>
<h2 id="4-zwdyzy">4. 子文档与资源</h2>
<h3 id="hxjx">核心解析</h3>
<ul>
<li><a href="/llm-guide/14-models/14.7-stepfun/02-step-3/01-step-3-jsbgjy">Step-3 技术报告精译</a></li>
<li><a href="/llm-guide/14-models/14.7-stepfun/02-step-3/02-step-3-hxjgpx">Step-3核心架构剖析</a></li>
<li><a href="#broken-link">Step-3模型-系统协同设计与解码成本优化剖析</a></li>
</ul>
<h3 id="fjzy">附加资源</h3>
<ul>
<li><a href="#">images</a></li>
<li><a href="#">pdfs</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-jswtdyybj-technical-problem-definition","text":"1. 技术问题定义与背景 (Technical Problem Definition)"},{"level":2,"id":"2-fflcj-method-breakdown","text":"2. 方法论拆解 (Method Breakdown)"},{"level":3,"id":"2-1-gx-moe-y-cchfzjh","text":"2.1 高效 MoE 与 层次化负载均衡"},{"level":3,"id":"2-2-mx-xtxtsj-algorithm-system-co-design","text":"2.2 模型-系统协同设计 (Algorithm-System Co-design)"},{"level":3,"id":"2-3-jmcbyh-decoding-cost-optimization","text":"2.3 解码成本优化 (Decoding Cost Optimization)"},{"level":2,"id":"3-gcfxybjjx-engineering-amp-boundaries","text":"3. 工程分析与边界局限 (Engineering &amp; Boundaries)"},{"level":2,"id":"4-zwdyzy","text":"4. 子文档与资源"},{"level":3,"id":"hxjx","text":"核心解析"},{"level":3,"id":"fjzy","text":"附加资源"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.7-stepfun/02-step-3/05-step-3-index" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.7-stepfun/02-step-3/05-step-3-index" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Step-3 核心技术专题索引</h1>
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
