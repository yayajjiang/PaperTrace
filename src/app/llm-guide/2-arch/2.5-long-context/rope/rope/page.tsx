"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>RoPE：旋转位置编码</h1>
<blockquote>
<p>RoPE(Rotary Position Embedding)是当前大语言模型最主流的位置编码方案. 本文档集从数学原理、工程实现、长度外推、视觉扩展到工业实践, 系统性覆盖RoPE的全貌. </p>
</blockquote>
<hr>
<h2 id="mljg">目录结构</h2>
<table>
<thead>
<tr>
<th>序号</th>
<th>子文档</th>
<th>核心内容</th>
<th>篇幅</th>
</tr>
</thead>
<tbody><tr>
<td>01</td>
<td><a href="/llm-guide/2-arch/2.5-long-context/rope/01-sxyl-cxzjzdxdwzbm">数学原理：从旋转矩阵到相对位置编码</a></td>
<td>向量旋转、复数表示、多维分组、内积恒等式</td>
<td>~200行</td>
</tr>
<tr>
<td>02</td>
<td><a href="/llm-guide/2-arch/2.5-long-context/rope/02-gcsxygxjs">工程实现与高效计算</a></td>
<td>HF Transformers实现、GPT-NeoX Style、预计算缓存、融合kernel</td>
<td>~200行</td>
</tr>
<tr>
<td>03</td>
<td><a href="/llm-guide/2-arch/2.5-long-context/rope/03-cdwt-c-pi-d-yarn-dpskz">长度外推：从PI到YaRN的频率扩展</a></td>
<td>位置内插、NTK-aware、YaRN、动态NTK、各模型配置</td>
<td>~250行</td>
</tr>
<tr>
<td>04</td>
<td><a href="/llm-guide/2-arch/2.5-long-context/rope/04-sjydmtkz">视觉与多模态扩展</a></td>
<td>2D-RoPE、3D-RoPE、M-RoPE、Interleaved-MRoPE</td>
<td>~250行</td>
</tr>
<tr>
<td>05</td>
<td><a href="/llm-guide/2-arch/2.5-long-context/rope/05-gysjysxms">工业实践与失效模式</a></td>
<td>典型配置对比、计算开销、失效模式深度分析</td>
<td>~150行</td>
</tr>
</tbody></table>
<hr>
<h2 id="hxgssc">核心公式速查</h2>
<p><strong>旋转角度</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mtext>base</mtext><mrow><mo>−</mo><mn>2</mn><mi>i</mi><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup><mo separator="true">,</mo><mspace width="1em"/><mi>i</mi><mo>∈</mo><mo stretchy="false">[</mo><mn>0</mn><mo separator="true">,</mo><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn><mo>−</mo><mn>1</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\theta_i = \\text{base}^{-2i/d}, \\quad i \\in [0, d/2 - 1]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1668em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord text"><span class="mord">base</span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9723em;"><span style="top:-3.1473em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mord mathnormal mtight">i</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">d</span><span class="mord">/2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">]</span></span></span></span></span><p><strong>相对位置内积</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>R</mi><mi>m</mi></msub><mi>q</mi><msup><mo stretchy="false">)</mo><mi>T</mi></msup><mo stretchy="false">(</mo><msub><mi>R</mi><mi>n</mi></msub><mi>k</mi><mo stretchy="false">)</mo><mo>=</mo><msup><mi>q</mi><mi>T</mi></msup><msub><mi>R</mi><mrow><mi>n</mi><mo>−</mo><mi>m</mi></mrow></msub><mi>k</mi></mrow><annotation encoding="application/x-tex">(R_m q)^T (R_n k) = q^T R_{n-m} k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1413em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0997em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2583em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight">m</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span></span><p><strong>高效实现</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>q</mi><mtext>embed</mtext></msub><mo>=</mo><mi>q</mi><mo>⋅</mo><mi>cos</mi><mo>⁡</mo><mo>+</mo><mtext>rotate_half</mtext><mo stretchy="false">(</mo><mi>q</mi><mo stretchy="false">)</mo><mo>⋅</mo><mi>sin</mi><mo>⁡</mo></mrow><annotation encoding="application/x-tex">q_{\\text{embed}} = q \\cdot \\cos + \\text{rotate\\_half}(q) \\cdot \\sin</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">embed</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.06em;vertical-align:-0.31em;"></span><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">+</span><span class="mord text"><span class="mord">rotate_half</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6679em;"></span><span class="mop">sin</span></span></span></span></span><hr>
<h2 id="yqtztdgx">与其他主题的关系</h2>
<ul>
<li><strong>Attention架构</strong>：RoPE是MHA/GQA/MLA等注意力变体的标配位置编码</li>
<li><strong>长度外推</strong>：RoPE本身不支持超长序列, 需配合NTK/YaRN等技术</li>
<li><strong>多模态模型</strong>：Qwen-VL系列通过M-RoPE将RoPE扩展到2D/3D视觉数据</li>
<li><strong>融合Kernel</strong>：FlashAttention-v2+ 原生支持RoPE的在线计算, 避免额外内存访问</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"mljg","text":"目录结构"},{"level":2,"id":"hxgssc","text":"核心公式速查"},{"level":2,"id":"yqtztdgx","text":"与其他主题的关系"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.5-long-context/rope/rope" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.5-long-context/rope/rope" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">RoPE：旋转位置编码</h1>
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
