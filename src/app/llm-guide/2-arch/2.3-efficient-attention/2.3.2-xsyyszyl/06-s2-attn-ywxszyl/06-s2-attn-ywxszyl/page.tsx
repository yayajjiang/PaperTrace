"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>06 S²-Attn：移位稀疏注意力（Shifted Sparse Attention）</h1>
<blockquote>
<p>系列索引：<a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/2.3.2-xsyyszyl">2.3.2 稀疏与压缩注意力</a> · <a href="/llm-guide/2-arch/2.3-efficient-attention/2.3-efficient-attention">2.3 高效与稀疏注意力</a><br>论文：<a href="https://arxiv.org/abs/2309.12307">LongLoRA: Efficient Fine-tuning of Long-Context LLMs</a> · 代码：<a href="https://github.com/dvlab-research/LongLoRA">LongLoRA</a></p>
</blockquote>
<p><strong>S²-Attn</strong>（Shifted Sparse Attention，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>S</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">S^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-Attn）来自 LongLoRA（2023）。它解决 <strong>长上下文微调</strong> 的算力爆炸：8192 训练相对 2048 时，self-attention FLOPs 约 <strong>×16</strong>。LongLoRA 用 <strong>分组局部 attention + 半头移位</strong> 在训练期近似全局模式，且 <strong>推理可切回全注意力</strong>。</p>
<hr>
<h2 id="1-dj">1. 动机</h2>
<table>
<thead>
<tr>
<th>杠杆</th>
<th>作用</th>
</tr>
</thead>
<tbody><tr>
<td><strong>S²-Attn</strong></td>
<td>训练时 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo>⋅</mo><mi>g</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L \\cdot g)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mclose">)</span></span></span></span> 而非 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>L</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
</tr>
<tr>
<td><strong>扩展 LoRA</strong></td>
<td>对 embedding、norm 也训练，弥补长文分布偏移</td>
</tr>
</tbody></table>
<p>即使用 LoRA，若仍做全局 dense attention，长上下文 SFT 依然极慢 — S² 改的是 <strong>attention 图</strong>，不是参数量。</p>
<hr>
<h2 id="2-sf-fz-btyw">2. 算法：分组 + 半头移位</h2>
<p>设上下文 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span>，组大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span>（如 8192 训练、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mo>=</mo><mn>2048</mn></mrow><annotation encoding="application/x-tex">g=2048</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2048</span></span></span></span>）。</p>
<p><strong>Step 1 — 分组局部注意力</strong><br>序列切成 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mi mathvariant="normal">/</mi><mi>g</mi></mrow><annotation encoding="application/x-tex">L/g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 组，<strong>组内</strong>独立 causal self-attention。单组 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>g</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(g^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>，总计 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo>⋅</mo><mi>g</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L \\cdot g)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mclose">)</span></span></span></span>。</p>
<p><strong>Step 2 — 半头移位（Shift）</strong><br>在 <strong>一半 head</strong> 上将序列 <strong>平移 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow><annotation encoding="application/x-tex">g/2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord">/2</span></span></span></span></strong>，再分组 attention。相邻组经移位头 <strong>交换信息</strong>，避免组间完全隔离 — 与 Swin Transformer 的 shifted window 同 spirit。</p>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/06-s2-attn-ywxszyl/06-s2-attn-ywxszyl/images/fig-s2attn-shifted-sparse-pattern.jpg" alt="S²-Attn 分组与移位示意"></p>
<blockquote>
<p>图 1: S²-Attn 分组局部 attention + 半头移位形成跨组边（LongLoRA 论文）。</p>
</blockquote>
<p><strong>图 1 解析</strong></p>
<ul>
<li><strong>未移位头</strong>：attention 只在同色块（组）内 — 等价于把长序列当成多个短序列并行训练，块间无连接。</li>
<li><strong>移位头</strong>：token 索引整体 roll <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow><annotation encoding="application/x-tex">g/2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord">/2</span></span></span></span> 后再分组 — 原来属于不同组的 token 落入同一组，形成 <strong>跨组边</strong>。</li>
<li><strong>因果性</strong>：roll 后仍施加因果 mask，不窥视未来。</li>
<li><strong>有效感受野</strong>：两轮（移位/不移位）叠加后，信息可沿序列传播多组距离，但 FLOPs 仍按 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi><mo>⋅</mo><mi>g</mi></mrow><annotation encoding="application/x-tex">L \\cdot g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 计。</li>
</ul>
<h3 id="py-torch-wdm-lw-algorithm-1-js">PyTorch 伪代码（论文 Algorithm 1 精神）</h3>
<pre><code class="language-python"># x: [B, L, H, D]
x1, x2 = x.chunk(2, dim=2)           # 半头
x2 = torch.roll(x2, shifts=group_size // 2, dims=1)
x = torch.cat([x1, x2], dim=2)
x = rearrange(x, &#39;b (ng g) h d -&gt; (b ng) g h d&#39;, g=group_size)
out = flash_attn(x, causal=True)
# 逆变换 + 对移位头 roll 回来
</code></pre>
<hr>
<h2 id="3-xl-vs-tl">3. 训练 vs 推理</h2>
<table>
<thead>
<tr>
<th>阶段</th>
<th>Attention</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td><strong>训练</strong></td>
<td>S²-Attn</td>
<td>省显存与 FLOPs</td>
</tr>
<tr>
<td><strong>推理</strong></td>
<td>可选 <strong>全注意力</strong></td>
<td>避免过拟合固定稀疏；测试用 dense 不损外推</td>
</tr>
</tbody></table>
<p>这是 S² 与多数「训练推理不一致」稀疏方案的关键区别。</p>
<p><img src="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/06-s2-attn-ywxszyl/06-s2-attn-ywxszyl/images/fig-s2attn-longlora-overview.jpg" alt="LongLoRA 上下文扩展与训练配置"></p>
<blockquote>
<p>图 2: LongLoRA 将 4K 模型扩至 8K–100K 的训练/评测曲线（论文）。</p>
</blockquote>
<p><strong>图 2 解析</strong></p>
<ul>
<li>通常对比 <strong>4K 预训练 → 8K/16K/32K/100K</strong> 微调后的 loss 或 benchmark。</li>
<li><strong>S² + LoRA</strong> 曲线应接近 <strong>全注意力微调</strong>，但训练 wall-clock 更短 — 验证稀疏近似是否足够。</li>
<li><strong>7B / 70B</strong> 两档：70B 往往只扩到 32K（资源限制），7B 可到 100K — 读图时区分模型规模。</li>
<li>若 S² 曲线在超长处掉队，优先检查 <strong>组大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span></strong> 与 <strong>是否推理阶段恢复全注意力</strong>。</li>
</ul>
<hr>
<h2 id="4-y-dca-mla-ddb">4. 与 DCA、MLA 的对比</h2>
<table>
<thead>
<tr>
<th>方法</th>
<th>主要目标</th>
<th>是否训练</th>
<th>KV Cache</th>
</tr>
</thead>
<tbody><tr>
<td><a href="/llm-guide/2-arch/2.2-attention/2.2.2-dtzylbt/04-mla-dzqblyjoszyl/04-mla-dzqblyjoszyl">MLA</a></td>
<td>压缩 KV</td>
<td>预训练结构</td>
<td>显著减小</td>
</tr>
<tr>
<td><a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/05-dca-skzyl/05-dca-skzyl">DCA</a></td>
<td>Training-free 外推</td>
<td>否</td>
<td>不压缩</td>
</tr>
<tr>
<td><strong>S²-Attn</strong></td>
<td>高效长上下文 <strong>微调</strong></td>
<td>LoRA+S²</td>
<td>训练期仍全量</td>
</tr>
</tbody></table>
<p><strong>LongLoRA 成绩单（论文）</strong></p>
<ul>
<li>Llama-2 <strong>7B</strong>：4K → <strong>100K</strong>（8×A100）</li>
<li>Llama-2 <strong>70B</strong>：4K → <strong>32K</strong></li>
<li>兼容 FlashAttention-2</li>
</ul>
<hr>
<h2 id="5-jx">5. 局限</h2>
<ul>
<li>组大小需与目标长度、预训练长度联合调参  </li>
<li>移位只连 <strong>邻近组</strong>；极长依赖仍依赖 LoRA + 位置外推（PI、YaRN 等可叠加）  </li>
<li>主要服务 <strong>微调</strong>；仅推理外推优先 <a href="/llm-guide/2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/05-dca-skzyl/05-dca-skzyl">DCA</a></li>
</ul>
<hr>
<h2 id="6-ckwx">6. 参考文献</h2>
<ol>
<li>Chen, Y., et al. (2023). <a href="https://arxiv.org/abs/2309.12307">LongLoRA: Efficient Fine-tuning of Long-Context Large Language Models</a>. <em>arXiv</em>.</li>
<li><a href="https://github.com/dvlab-research/LongLoRA">LongLoRA GitHub</a>.</li>
</ol>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dj","text":"1. 动机"},{"level":2,"id":"2-sf-fz-btyw","text":"2. 算法：分组 + 半头移位"},{"level":3,"id":"py-torch-wdm-lw-algorithm-1-js","text":"PyTorch 伪代码（论文 Algorithm 1 精神）"},{"level":2,"id":"3-xl-vs-tl","text":"3. 训练 vs 推理"},{"level":2,"id":"4-y-dca-mla-ddb","text":"4. 与 DCA、MLA 的对比"},{"level":2,"id":"5-jx","text":"5. 局限"},{"level":2,"id":"6-ckwx","text":"6. 参考文献"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/06-s2-attn-ywxszyl/06-s2-attn-ywxszyl" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="2-arch/2.3-efficient-attention/2.3.2-xsyyszyl/06-s2-attn-ywxszyl/06-s2-attn-ywxszyl" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">06 S²-Attn：移位稀疏注意力</h1>
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
