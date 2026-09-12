"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>2.2.2 多头注意力变体</h1>
<p>如果说 <a href="/llm-guide/2-arch/2.2-attention/2.2.1-zzyljz/2.2.1-zzyljz">《2.2.1 自注意力机制》</a> 讲清楚了 attention 的基本计算逻辑，那么这一节要回答的问题是：<strong>为什么业界没有停在标准的多头注意力（MHA）上，而是继续走到了 MQA、GQA，甚至 MLA？</strong></p>
<p>答案很现实：标准自注意力在训练阶段最主要的问题是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>T</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(T^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的计算与显存，而在推理阶段更痛的常常不是算不动，而是 <strong>KV Cache 太大、带宽太吃紧</strong>。后续这些变体，本质上都在围绕一个共同问题做权衡：</p>
<p><strong>怎么在尽量不丢模型能力的前提下，把注意力的缓存和带宽成本压下来。</strong></p>
<h2 id="1-yjjp-kv-yszx">1. 演进家谱（KV 压缩主线）</h2>
<table>
<thead>
<tr>
<th align="left">变体</th>
<th align="left">核心改动</th>
<th align="left">KV Cache</th>
<th align="left">文档</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MHA</td>
<td align="left">每头独立 Q/K/V</td>
<td align="left">基准 1×</td>
<td align="left"><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/01-mha-dtzyldbzxs/01-mha-dtzyldbzxs">01-MHA</a></td>
</tr>
<tr>
<td align="left">MQA</td>
<td align="left">全头共享 K/V</td>
<td align="left">≈ 1/h</td>
<td align="left"><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/02-mqa-gx-key-value-djzys/02-mqa-gx-key-value-djzys">02-MQA</a></td>
</tr>
<tr>
<td align="left">GQA</td>
<td align="left">分组共享 K/V</td>
<td align="left">≈ 1/(h/g)</td>
<td align="left"><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/03-gqa-zxnyhczjzz/03-gqa-zxnyhczjzz">03-GQA</a></td>
</tr>
<tr>
<td align="left">MLA</td>
<td align="left">低秩 latent + RoPE 解耦</td>
<td align="left">≈ 1/(h·d/r)</td>
<td align="left"><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/04-mla-dzqblyjoszyl/04-mla-dzqblyjoszyl">04-MLA</a></td>
</tr>
<tr>
<td align="left">MLA 双版本</td>
<td align="left">Prefill 非吸收 / Decode 吸收</td>
<td align="left">权重相同</td>
<td align="left"><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/05-mla-jzxsyfxssbb/05-mla-jzxsyfxssbb">05-MLA 吸收</a></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>长上下文外推</strong>（不改 KV 结构、改写位置/分块）见 <a href="#broken-link">2.3.2 — DCA</a> 与 <a href="#broken-link">S²-Attn</a>。<br><strong>稀疏 + 压缩</strong>（NSA / DSA / MoBA / CSA-HCA）见 <a href="#broken-link">2.3.2 稀疏与压缩注意力</a>。</p>
</blockquote>
<p><img src="./02-MQA-%E5%85%B1%E4%BA%ABKeyValue%E7%9A%84%E6%9E%81%E8%87%B4%E5%8E%8B%E7%BC%A9/images/fig-attention-mechanism-family.jpg" alt=""></p>
<blockquote>
<p>图 1：DeepSeek-V2 Figure 3 — MHA、GQA、MQA、MLA 的 KV 结构演进。</p>
</blockquote>
<p><strong>图 1 解析</strong></p>
<p>本节索引用 <strong>注意力族四列图</strong>（与 02/03/04 各篇图 1 同源）。第一次读建议 <strong>自下而上三行</strong>：</p>
<table>
<thead>
<tr>
<th>行</th>
<th>含义</th>
</tr>
</thead>
<tbody><tr>
<td><strong>Queries</strong></td>
<td>查询头数量（通常保持 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>H</mi></mrow><annotation encoding="application/x-tex">H</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0813em;">H</span></span></span></span> 路）</td>
</tr>
<tr>
<td><strong>Keys</strong></td>
<td>缓存的 Key 路数 / 形式</td>
</tr>
<tr>
<td><strong>Values</strong></td>
<td>缓存的 Value 路数 / 形式</td>
</tr>
</tbody></table>
<p>从左到右：<strong>MHA</strong>（8-8-8 一一对应）→ <strong>GQA</strong>（8 Q，4 KV 组）→ <strong>MQA</strong>（8 Q，1 KV）→ <strong>MLA</strong>（8 Q，cache 一块 <strong>Latent KV</strong> + projection）。斜线填充 = 推理时写入 KV Cache 的部分。</p>
<p>读完此图再进入子文档：01 讲 MHA 基准；02/03 讲「少存几份 KV」；04/05 讲「每份 KV 变短 + 怎么算」。</p>
<h2 id="2-wsm-kv-cache-hcwzzc">2. 为什么 KV Cache 会成为主战场</h2>
<p>推理分两阶段：</p>
<ol>
<li><strong>Prefill</strong>：并行处理 prompt，瓶颈多在计算  </li>
<li><strong>Decoding</strong>：逐 token 生成，瓶颈多在 <strong>KV Cache 读写</strong></li>
</ol>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>KV Cache Size</mtext><mo>∝</mo><mi>L</mi><mo>×</mo><mi>B</mi><mo>×</mo><mi>T</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>k</mi><mi>v</mi></mrow></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{KV Cache Size} \\propto L \\times B \\times T \\times d_{kv} \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">KV Cache Size</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∝</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>MHA、MQA、GQA、MLA 的差异，最终都落在：<strong>每个时间步到底要缓存多少 Key/Value 信息</strong>。</p>
<h2 id="3-tjydsx">3. 推荐阅读顺序</h2>
<ol>
<li><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/01-mha-dtzyldbzxs/01-mha-dtzyldbzxs">01-MHA — 标准形式</a>  </li>
<li><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/02-mqa-gx-key-value-djzys/02-mqa-gx-key-value-djzys">02-MQA — 极致共享</a>  </li>
<li><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/03-gqa-zxnyhczjzz/03-gqa-zxnyhczjzz">03-GQA — 性能与缓存折中</a>  </li>
<li><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/04-mla-dzqblyjoszyl/04-mla-dzqblyjoszyl">04-MLA — 低秩 latent 与 RoPE 解耦</a>  </li>
<li><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/05-mla-jzxsyfxssbb/05-mla-jzxsyfxssbb">05-MLA — 矩阵吸收与非吸收双版本</a>（<strong>Prefill/Decode 工程必读</strong>）</li>
</ol>
<h2 id="4-y-2-3-dxj">4. 与 2.3 的衔接</h2>
<ul>
<li><strong>2.2</strong> 回答：KV <strong>表示</strong>怎么设计（MHA → MLA）  </li>
<li><strong>2.3</strong> 回答：Attention <strong>怎么算、怎么存、怎么稀疏</strong>（FlashAttention、PagedAttention、NSA、CSA…）</li>
</ul>
<h2 id="5-ckwx">5. 参考文献</h2>
<ol>
<li>Vaswani, A., et al. (2017). <a href="https://arxiv.org/abs/1706.03762">Attention Is All You Need</a>.  </li>
<li>Shazeer, N. (2019). <a href="https://arxiv.org/abs/1911.02150">Fast Transformer Decoding: One Write-Head is All You Need</a>.  </li>
<li>Ainslie, J., et al. (2023). <a href="https://arxiv.org/abs/2305.13245">GQA</a>.  </li>
<li>Dai, D., et al. (2024). <a href="https://arxiv.org/abs/2405.04434">DeepSeek-V2</a>.</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yjjp-kv-yszx","text":"1. 演进家谱（KV 压缩主线）"},{"level":2,"id":"2-wsm-kv-cache-hcwzzc","text":"2. 为什么 KV Cache 会成为主战场"},{"level":2,"id":"3-tjydsx","text":"3. 推荐阅读顺序"},{"level":2,"id":"4-y-2-3-dxj","text":"4. 与 2.3 的衔接"},{"level":2,"id":"5-ckwx","text":"5. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.2-attention/2.2.2-dtzylbt/2.2.2-dtzylbt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.2-attention/2.2.2-dtzylbt/2.2.2-dtzylbt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">2.2.2 多头注意力变体</h1>
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
