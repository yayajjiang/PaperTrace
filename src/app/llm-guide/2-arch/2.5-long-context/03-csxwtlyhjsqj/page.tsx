"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>长上下文推理优化技术全景</h1>
<blockquote>
<p>本文系统梳理长上下文推理优化的两大核心目标——扩展支持长度与提升推理效率,涵盖 Attention 稀疏化、Token Drop、KV Cache 压缩、块级记忆等前沿技术路径. </p>
</blockquote>
<hr>
<h2 id="1-csxwyhdszmb">1. 长上下文优化的双重目标</h2>
<h3 id="1-1-kzzccd">1.1 扩展支持长度</h3>
<p>使模型能够处理更长的上下文信息. 对于 256K tokens 以内的长度,主流模型(Qwen、Llama)可通过：</p>
<ul>
<li>引入额外长文本数据进行 SFT</li>
<li>利用 RoPE 外推方法(如 NTK、YaRN)扩展上下文窗口</li>
</ul>
<h3 id="1-2-tstlxs">1.2 提升推理效率</h3>
<p>当上下文超过 256K 甚至 1M tokens 时,标准因果注意力的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度成为瓶颈,需要引入非标准注意力机制或 KV Cache 优化. </p>
<hr>
<h2 id="2-attention-jsxsh">2. Attention 计算稀疏化</h2>
<h3 id="2-1-xszylms">2.1 稀疏注意力模式</h3>
<p>通过对 attention mask 形状的创新设计,减少实际计算量：</p>
<p><strong>BigBird</strong>：结合全局 token + 局部窗口 + 随机稀疏,实现 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span></span></span> 复杂度
<strong>Blockwise Attention</strong>：将序列分块,块内全注意力、块间稀疏连接
<strong>MInference 1.0</strong>：动态识别关键 token,对非关键区域采用低精度或跳过计算</p>
<h3 id="2-2-token-drop-ff">2.2 Token Drop 方法</h3>
<p>核心洞察：<strong>注意力得分符合幂律分布</strong>,大部分 token 不重要,少数 token 关键. </p>
<p><strong>H2O(Heavy Hitter Oracle)</strong> ：</p>
<ul>
<li>维护一个固定大小的 KV Cache(前 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个 token)</li>
<li>新 token 加入时,计算其与现有 token 的注意力权重之和</li>
<li>驱逐权重最低的 token,保持 KV Cache 大小恒定</li>
</ul>
<hr>
<h2 id="3-kv-cache-ysyqzcl">3. KV Cache 压缩与驱逐策略</h2>
<h3 id="3-1-streaming-llm-iclr-2024">3.1 StreamingLLM(ICLR 2024)</h3>
<p>发现 attention sink 现象：初始几个 token(如 BOS、系统提示)的注意力得分异常高,无论序列多长都至关重要. </p>
<p><strong>策略</strong>：</p>
<ul>
<li>始终保留 attention sink token(前 4 个)</li>
<li>对后续 token 采用滑动窗口,仅保留最近 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 个 token</li>
<li>实现 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord">1</span><span class="mclose">)</span></span></span></span> 的 KV Cache 增长(仅与窗口大小相关)</li>
</ul>
<h3 id="3-2-snap-kv-neur-ips-2024">3.2 SnapKV(NeurIPS 2024)</h3>
<p><strong>观察</strong>：不同层对历史 token 的依赖模式不同,某些层需要长程依赖,某些层只需局部上下文. </p>
<p><strong>策略</strong>：</p>
<ul>
<li>逐层分析注意力模式,识别&quot;需要长程依赖的层&quot;</li>
<li>对这些层保留完整的 KV Cache</li>
<li>对其他层采用激进压缩(如 H2O 或滑动窗口)</li>
</ul>
<h3 id="3-3-kj-kv-cache-js-inf-llm">3.3 块级 KV Cache 计算(InfLLM)</h3>
<p>Google 用于将上下文扩展到 1M 的核心方法：</p>
<ol>
<li><strong>分块存储</strong>：将被驱逐的 token 存储到上下文记忆模块,分为多个块级记忆单元</li>
<li><strong>代表性选择</strong>：从每个块中选出最具代表性的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">r_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 个 token</li>
<li><strong>相关性检索</strong>：用代表性 token 与当前 token 求相关性,选出最相关的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>k</mi><mi>m</mi></msub></mrow><annotation encoding="application/x-tex">k_m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 个单元</li>
<li><strong>拼接计算</strong>：concat(初始 token + 相关记忆 + 局部窗口)</li>
</ol>
<hr>
<h2 id="4-ysxszyljg">4. 原生稀疏注意力架构</h2>
<h3 id="4-1-deep-seek-native-sparse-attention-nsa">4.1 DeepSeek Native Sparse Attention (NSA)</h3>
<p><strong>动态分层稀疏策略</strong>：</p>
<p>三路注意力融合：</p>
<ul>
<li><strong>压缩路径(Compression)</strong> ：将全文分为语义块(如每块 512 token),通过可学习 MLP 压缩为&quot;摘要向量&quot;——粗粒度全局理解</li>
<li><strong>选择路径(Selection)</strong> ：基于压缩路径的全局注意力分数,筛选 TOP-N 个关键块,还原细粒度 token 信息——关键部分精读</li>
<li><strong>滑动窗口路径(Sliding Window)</strong> ：对当前 token 的局部窗口进行全注意力计算——确保上下文连贯性</li>
</ul>
<p><strong>门控融合</strong>：</p>
<span class="katex-error" title="ParseError: KaTeX parse error: Multiple \\tag" style="color:#cc0000">\\text{Output} = g_c \\cdot \\text{Compression} + g_s \\cdot \\text{Selection} + g_w \\cdot \\text{Window}\\tag{1} \\tag{1}</span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>g</mi><mi>c</mi></msub><mo>+</mo><msub><mi>g</mi><mi>s</mi></msub><mo>+</mo><msub><mi>g</mi><mi>w</mi></msub><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">g_c + g_s + g_w = 1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span>,由门控 MLP 实时生成,权重由上下文动态决定. </p>
<h3 id="4-2-kimi-moba">4.2 Kimi MoBA</h3>
<p><strong>Mixture of Block Attention</strong>：将长序列划分为固定大小的块,每个查询 token 只关注最相关的少数几个块. </p>
<ul>
<li>块内使用标准自注意力</li>
<li>块间使用路由机制选择相关块</li>
<li>路由决策可学习,训练时 jointly optimized</li>
</ul>
<hr>
<h2 id="5-jsxxzn">5. 技术选型指南</h2>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="left">推荐技术</th>
<th align="left">复杂度</th>
<th align="left">效果</th>
</tr>
</thead>
<tbody><tr>
<td align="left">128K 以内</td>
<td align="left">RoPE 外推 + YaRN</td>
<td align="left">低</td>
<td align="left">好</td>
</tr>
<tr>
<td align="left">256K-1M</td>
<td align="left">StreamingLLM / H2O</td>
<td align="left">中</td>
<td align="left">较好</td>
</tr>
<tr>
<td align="left">1M+</td>
<td align="left">InfLLM / NSA / MoBA</td>
<td align="left">高</td>
<td align="left">优</td>
</tr>
<tr>
<td align="left">实时长文档问答</td>
<td align="left">SnapKV(逐层优化)</td>
<td align="left">中</td>
<td align="left">优</td>
</tr>
<tr>
<td align="left">视频/多模态长序列</td>
<td align="left">块级记忆 + 时间压缩</td>
<td align="left">高</td>
<td align="left">优</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-wlfx">6. 未来方向</h2>
<ol>
<li><strong>动态稀疏策略</strong>：根据输入内容自适应调整稀疏模式,而非固定规则</li>
<li><strong>多模态长上下文</strong>：视频、音频的长序列处理需要新的压缩和稀疏策略</li>
<li><strong>硬件-算法协同设计</strong>：稀疏注意力需要专门的 kernel 优化(如 FlashAttention 的稀疏扩展)</li>
<li><strong>与 RAG 的结合</strong>：长上下文和外部检索的边界在哪里？何时用 KV Cache 压缩,何时用检索增强？</li>
</ol>
<blockquote>
<p>参考来源：<a href="https://zhuanlan.zhihu.com/p/xxxxxxxxxx">LLM Long Context 优化总结</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-csxwyhdszmb","text":"1. 长上下文优化的双重目标"},{"level":3,"id":"1-1-kzzccd","text":"1.1 扩展支持长度"},{"level":3,"id":"1-2-tstlxs","text":"1.2 提升推理效率"},{"level":2,"id":"2-attention-jsxsh","text":"2. Attention 计算稀疏化"},{"level":3,"id":"2-1-xszylms","text":"2.1 稀疏注意力模式"},{"level":3,"id":"2-2-token-drop-ff","text":"2.2 Token Drop 方法"},{"level":2,"id":"3-kv-cache-ysyqzcl","text":"3. KV Cache 压缩与驱逐策略"},{"level":3,"id":"3-1-streaming-llm-iclr-2024","text":"3.1 StreamingLLM(ICLR 2024)"},{"level":3,"id":"3-2-snap-kv-neur-ips-2024","text":"3.2 SnapKV(NeurIPS 2024)"},{"level":3,"id":"3-3-kj-kv-cache-js-inf-llm","text":"3.3 块级 KV Cache 计算(InfLLM)"},{"level":2,"id":"4-ysxszyljg","text":"4. 原生稀疏注意力架构"},{"level":3,"id":"4-1-deep-seek-native-sparse-attention-nsa","text":"4.1 DeepSeek Native Sparse Attention (NSA)"},{"level":3,"id":"4-2-kimi-moba","text":"4.2 Kimi MoBA"},{"level":2,"id":"5-jsxxzn","text":"5. 技术选型指南"},{"level":2,"id":"6-wlfx","text":"6. 未来方向"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.5-long-context/03-csxwtlyhjsqj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.5-long-context/03-csxwtlyhjsqj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">长上下文推理优化技术全景</h1>
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
