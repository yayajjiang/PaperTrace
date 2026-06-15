"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>04-Gemini-1.5-Flash-8B 核心技术专题：端侧友好的极致轻量架构与 1M 上下文工程</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.11-gemini/14.11-gemini">返回 14.11-Gemini 家族总览</a></strong></p>
</blockquote>
<h2 id="y-mxdwycpcl">一、模型定位与产品策略</h2>
<p>2024 年 8 月，Google DeepMind 在 Gemini 1.5 Flash 发布三个月后，推出了 <strong>Gemini 1.5 Flash-8B</strong>。这是 Google 首次在 Gemini 系列中明确标注参数规模的型号，8B 的参数量使其成为<strong>端侧部署</strong>和<strong>极低延迟场景</strong>的理想选择。</p>
<h3 id="1-1-flash-xldtdsj">1.1 Flash 系列的梯度设计</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>1.5 Flash-8B</th>
<th>1.5 Flash</th>
<th>1.5 Pro</th>
<th>定位</th>
</tr>
</thead>
<tbody><tr>
<td>参数量</td>
<td><strong>~8B</strong></td>
<td>~数十B</td>
<td>~数百B</td>
<td>规模梯度</td>
</tr>
<tr>
<td>上下文</td>
<td>1M</td>
<td>1M</td>
<td>1M/2M</td>
<td>持平</td>
</tr>
<tr>
<td>输入价格/1M</td>
<td>**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.0375</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.0375** |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.0375</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span></span></span></span>0.075</td>
<td>\$3.50</td>
<td>cheapest</td>
<td></td>
</tr>
<tr>
<td>输出价格/1M</td>
<td>**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15** |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.15</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span></span></span></span>0.30</td>
<td>\$10.50</td>
<td>cheapest</td>
<td></td>
</tr>
<tr>
<td>速度</td>
<td><strong>最快</strong></td>
<td>极快</td>
<td>中等</td>
<td>核心优势</td>
</tr>
<tr>
<td>多模态</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>全系标配</td>
</tr>
</tbody></table>
<p>Flash-8B 的价格是 Flash 的一半、Pro 的 1/93，这种极致定价策略使其成为<strong>高频低价值任务</strong>的首选。</p>
<h3 id="1-2-quot-cstmh-quot-dzlyy">1.2 &quot;参数透明化&quot;的战略意义</h3>
<p>Google 在 Flash-8B 上首次公开标注参数规模(8B)，这在大模型行业具有象征意义：</p>
<ol>
<li><strong>对抗开源模型</strong>：开源社区(Llama、Gemma、Qwen)普遍公开参数规模，闭源厂商的不透明性受到批评</li>
<li><strong>端侧部署信任</strong>：开发者需要知道模型规模来评估端侧可行性</li>
<li><strong>性能预期管理</strong>：明确 8B 的定位，避免用户将其与 Pro 对比</li>
<li><strong>行业标准化</strong>：推动闭源模型也采用参数标注的惯例</li>
</ol>
<h2 id="e-8b-jgdgcjx">二、8B 架构的工程极限</h2>
<h3 id="2-1-mxjgtc">2.1 模型架构推测</h3>
<p>基于 8B 参数规模和 Gemini 系列的技术传统，推测 Flash-8B 的架构：</p>
<pre><code>架构类型: Dense Transformer(非 MoE，端侧友好)
层数: ~32-36 层
隐藏维度: ~3072-4096
注意力头: ~24-32(采用 GQA/MQA)
FFN 维度: ~4x 隐藏维度
位置编码: RoPE(支持 1M 外推)
激活函数: SwiGLU
归一化: RMSNorm / LayerNorm
</code></pre>
<p><strong>从 MoE 到 Dense 的切换</strong>：
1.5 Pro 和 Flash 可能采用 MoE 架构，但 Flash-8B 几乎肯定是 <strong>Dense Transformer</strong>：</p>
<ul>
<li>MoE 的路由开销在端侧不可接受</li>
<li>Dense 架构更简单，量化效果更稳定</li>
<li>8B 参数规模下，Dense 的推理效率足够高</li>
</ul>
<h3 id="2-2-ytlkymxdjgdb">2.2 与同类开源模型的架构对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数</th>
<th>架构</th>
<th>上下文</th>
<th>与 Flash-8B 的关系</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 2 9B</td>
<td>9B</td>
<td>Dense</td>
<td>8K</td>
<td>Google 自家开源，最接近</td>
</tr>
<tr>
<td>Llama 3.1 8B</td>
<td>8B</td>
<td>Dense</td>
<td>128K</td>
<td>开源竞品</td>
</tr>
<tr>
<td>Qwen2.5 7B</td>
<td>7B</td>
<td>Dense</td>
<td>128K</td>
<td>中文优化竞品</td>
</tr>
<tr>
<td>Mistral 7B</td>
<td>7B</td>
<td>Dense</td>
<td>32K</td>
<td>欧洲开源竞品</td>
</tr>
<tr>
<td>Phi-3 mini</td>
<td>3.8B</td>
<td>Dense</td>
<td>128K</td>
<td>微软轻量竞品</td>
</tr>
</tbody></table>
<p>Flash-8B 的核心差异化在于 <strong>1M 上下文</strong> 和 <strong>原生多模态</strong>——这些是大多数 8B 开源模型不具备的。</p>
<h3 id="2-3-csxsyh">2.3 参数效率优化</h3>
<p>在 8B 参数预算内实现 1M 上下文和多模态能力，需要极致的参数效率：</p>
<p><strong>技术一：嵌入层共享(Embedding Tying)</strong></p>
<p>输入嵌入矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mrow><mi>e</mi><mi>m</mi><mi>b</mi><mi>e</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">W_{embed}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">mb</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和输出投影矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mrow><mi>o</mi><mi>u</mi><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">W_{out}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 共享：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>W</mi><mrow><mi>o</mi><mi>u</mi><mi>t</mi></mrow></msub><mo>=</mo><msubsup><mi>W</mi><mrow><mi>e</mi><mi>m</mi><mi>b</mi><mi>e</mi><mi>d</mi></mrow><mi>T</mi></msubsup></mrow><annotation encoding="application/x-tex">W_{out} = W_{embed}^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1383em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">mb</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">d</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span></span><p>节省参数量：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>节省</mtext><mo>=</mo><mi>V</mi><mo>×</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">\\text{节省} = V \\times d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">节省</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span></span>
<p>对于词汇量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi><mo>=</mo><mn>100</mn><mi>K</mi></mrow><annotation encoding="application/x-tex">V=100K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">100</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span>，维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">d=4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>节省</mtext><mo>=</mo><mn>100</mn><mi>K</mi><mo>×</mo><mn>4096</mn><mo>=</mo><mn>409.6</mn><mi>M</mi><mtext> 参数</mtext></mrow><annotation encoding="application/x-tex">\\text{节省} = 100K \\times 4096 = 409.6M \\text{ 参数}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">节省</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">100</span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">409.6</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">参数</span></span></span></span></span></span><p>这占 8B 总参数的 <strong>5%</strong>，在轻量模型中意义重大。</p>
<p><strong>技术二：分组查询注意力(GQA)</strong></p>
<p>Flash-8B 几乎肯定采用 GQA 或 MQA：</p>
<table>
<thead>
<tr>
<th>注意力类型</th>
<th>KV-Cache/头</th>
<th>总 KV-Cache</th>
<th>相对 MHA</th>
</tr>
</thead>
<tbody><tr>
<td>MHA</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">2 \\times L \\times d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">2 \\times L \\times d_{model}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td>100%</td>
</tr>
<tr>
<td>GQA (g=4)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">2 \\times L \\times d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mi mathvariant="normal">/</mi><mn>4</mn></mrow><annotation encoding="application/x-tex">2 \\times L \\times d_{model}/4</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">/4</span></span></span></span></td>
<td>25%</td>
</tr>
<tr>
<td>MQA</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">2 \\times L \\times d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>d</mi><mrow><mi>h</mi><mi>e</mi><mi>a</mi><mi>d</mi></mrow></msub></mrow><annotation encoding="application/x-tex">2 \\times L \\times d_{head}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td>~6%</td>
</tr>
</tbody></table>
<p>GQA 在 8B 模型中可以在压缩比和性能间取得最佳平衡。</p>
<p><strong>技术三：SwiGLU 激活函数</strong></p>
<p>SwiGLU 相比标准 FFN 有更好的表达能力：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>SwiGLU</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><mi>x</mi><msub><mi>W</mi><mn>1</mn></msub><mo>⊙</mo><mi>σ</mi><mo stretchy="false">(</mo><mi>x</mi><msub><mi>W</mi><mn>2</mn></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><msub><mi>W</mi><mn>3</mn></msub></mrow><annotation encoding="application/x-tex">\\text{SwiGLU}(x) = (xW_1 \\odot \\sigma(xW_2)) W_3</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">SwiGLU</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊙</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>虽然增加了 50% 的 FFN 参数，但表达能力提升使同等效果下可以使用更小的隐藏维度。</p>
<p><strong>技术四：层共享(Layer Sharing)</strong></p>
<p>相邻 Transformer 层共享部分参数：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>W</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><msub><mi>r</mi><mi>i</mi></msub></mrow></msub><mo>=</mo><msub><mi>W</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><msub><mi>r</mi><mrow><mi>i</mi><mo>+</mo><mn>1</mn></mrow></msub></mrow></msub><mspace width="1em"/><mtext>for some </mtext><mi>i</mi></mrow><annotation encoding="application/x-tex">W_{layer_i} = W_{layer_{i+1}} \\quad \\text{for some } i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight">e</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9862em;vertical-align:-0.2918em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight">e</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2025em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2918em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:1em;"></span><span class="mord text"><span class="mord">for some </span></span><span class="mord mathnormal">i</span></span></span></span></span><p>这种技术在 ALBERT 和MobileLLM 中已有验证，可以在不显著降低性能的情况下减少 20-30% 的参数。</p>
<h2 id="s-1m-sxwddckhx">三、1M 上下文的端侧可行性</h2>
<h3 id="3-1-dc-kv-cache-dncjs">3.1 端侧 KV-Cache 的内存计算</h3>
<p>8B 模型 + 1M 上下文在端侧设备的内存需求：</p>
<p><strong>模型权重</strong>：</p>
<ul>
<li>FP16：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mi>B</mi><mo>×</mo><mn>2</mn><mtext> bytes</mtext><mo>=</mo><mn>16</mn><mtext> GB</mtext></mrow><annotation encoding="application/x-tex">8B \\times 2 \\text{ bytes} = 16 \\text{ GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">16</span><span class="mord text"><span class="mord"> GB</span></span></span></span></span></li>
<li>INT8：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mi>B</mi><mo>×</mo><mn>1</mn><mtext> byte</mtext><mo>=</mo><mn>8</mn><mtext> GB</mtext></mrow><annotation encoding="application/x-tex">8B \\times 1 \\text{ byte} = 8 \\text{ GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mord text"><span class="mord"> byte</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">8</span><span class="mord text"><span class="mord"> GB</span></span></span></span></span></li>
<li>INT4：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mi>B</mi><mo>×</mo><mn>0.5</mn><mtext> bytes</mtext><mo>=</mo><mn>4</mn><mtext> GB</mtext></mrow><annotation encoding="application/x-tex">8B \\times 0.5 \\text{ bytes} = 4 \\text{ GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">8</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">0.5</span><span class="mord text"><span class="mord"> bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">4</span><span class="mord text"><span class="mord"> GB</span></span></span></span></span></li>
</ul>
<p><strong>KV-Cache(1M 上下文)</strong>：
假设 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>=</mo><mn>32</mn></mrow><annotation encoding="application/x-tex">n_{layers}=32</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">32</span></span></span></span>，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">d_{model}=4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>，GQA(g=4)：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>KV-Cache</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mi>L</mi><mo>×</mo><msub><mi>n</mi><mrow><mi>l</mi><mi>a</mi><mi>y</mi><mi>e</mi><mi>r</mi><mi>s</mi></mrow></msub><mo>×</mo><mfrac><msub><mi>d</mi><mrow><mi>m</mi><mi>o</mi><mi>d</mi><mi>e</mi><mi>l</mi></mrow></msub><mi>g</mi></mfrac><mo>×</mo><mtext>bytes</mtext></mrow><annotation encoding="application/x-tex">\\text{KV-Cache} = 2 \\times L \\times n_{layers} \\times \\frac{d_{model}}{g} \\times \\text{bytes}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">KV-Cache</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">L</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight">s</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.2519em;vertical-align:-0.8804em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3714em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">d</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">bytes</span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mo>=</mo><mn>2</mn><mo>×</mo><mn>1</mn><mi>M</mi><mo>×</mo><mn>32</mn><mo>×</mo><mn>1024</mn><mo>×</mo><mn>1</mn><mtext> byte (INT8)</mtext></mrow><annotation encoding="application/x-tex">= 2 \\times 1M \\times 32 \\times 1024 \\times 1 \\text{ byte (INT8)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.3669em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1024</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mord text"><span class="mord"> byte (INT8)</span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mo>=</mo><mn>65.5</mn><mtext> GB</mtext></mrow><annotation encoding="application/x-tex">= 65.5 \\text{ GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.3669em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">65.5</span><span class="mord text"><span class="mord"> GB</span></span></span></span></span></span><p>这远超任何端侧设备的内存容量！</p>
<h3 id="3-2-dc-1m-sxwdjsbknsj">3.2 端侧 1M 上下文的技术不可能三角</h3>
<p>在端侧实现 1M 上下文面临&quot;不可能三角&quot;：</p>
<pre><code>       长上下文(1M)
            /\\
           /  \\
          /    \\
         /      \\
        /   ?    \\
       /          \\
      /____________\\
  小模型(8B)  低内存(&lt;8GB)
</code></pre>
<p>三者不可兼得，必须牺牲至少一个维度。</p>
<p><strong>Flash-8B 的解决方案：分层上下文管理</strong></p>
<p>Flash-8B 的&quot;1M 上下文&quot;并非在端侧一次加载全部 1M，而是采用<strong>分层管理</strong>：</p>
<ol>
<li><strong>活跃窗口(Active Window)</strong>：~4K-8K，常驻内存，用于当前交互</li>
<li><strong>工作集(Working Set)</strong>：~32K-64K，存储在设备内存，按需加载</li>
<li><strong>归档存储(Archive)</strong>：~1M，存储在云端或外存，需要时通过 API 检索</li>
</ol>
<pre><code>用户输入 → 活跃窗口处理
              ↓
    需要历史信息？
              ↓
    是 → 查询工作集/归档存储
              ↓
    综合信息生成回答
</code></pre>
<p>这种&quot;端-云协同&quot;的上下文管理使端侧设备&quot;感觉&quot;到有 1M 上下文，但实际并不全部驻留本地。</p>
<h3 id="3-3-hdckzylddcsx">3.3 滑动窗口注意力的端侧实现</h3>
<p>对于纯端侧推理(无云端辅助)，Flash-8B 可能采用<strong>滑动窗口注意力</strong>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Attention</mtext><mi>i</mi></msub><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>Q</mi><mi>i</mi></msub><msubsup><mi>K</mi><mrow><mo stretchy="false">[</mo><mi>i</mi><mo>−</mo><mi>W</mi><mo>:</mo><mi>i</mi><mo>+</mo><mi>W</mi><mo stretchy="false">]</mo></mrow><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>V</mi><mrow><mo stretchy="false">[</mo><mi>i</mi><mo>−</mo><mi>W</mi><mo>:</mo><mi>i</mi><mo>+</mo><mi>W</mi><mo stretchy="false">]</mo></mrow></msub></mrow><annotation encoding="application/x-tex">\\text{Attention}_i = \\text{softmax}\\left(\\frac{Q_i K_{[i-W:i+W]}^T}{\\sqrt{d_k}}\\right) V_{[i-W:i+W]}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Attention</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.7283em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.887em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.378em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">[</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span><span class="mrel mtight">:</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span><span class="mclose mtight">]</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.497em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">[</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span><span class="mrel mtight">:</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">W</span><span class="mclose mtight">]</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 为窗口大小(如 4096)。这样：</p>
<ul>
<li>KV-Cache 只需存储 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi>W</mi></mrow><annotation encoding="application/x-tex">2W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">2</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 个 Token</li>
<li>内存需求从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>L</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">L</span><span class="mclose">)</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>W</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(W)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span></span></span></span></li>
<li>对于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi><mo>=</mo><mn>4096</mn></mrow><annotation encoding="application/x-tex">W=4096</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span></span></span></span>：KV-Cache 仅需 <strong>~256MB</strong></li>
</ul>
<p>代价是：模型只能&quot;看到&quot;最近的 4096 个 Token，无法关联更早的信息。但对于大多数端侧场景(聊天、简单问答)，这已足够。</p>
<h2 id="s-dmtnldqlh">四、多模态能力的轻量化</h2>
<h3 id="4-1-qlsjbmq">4.1 轻量视觉编码器</h3>
<p>Flash-8B 的多模态架构：</p>
<pre><code>图像(低分辨率)→ 轻量 ViT(~50-100M 参数)→ 图像 Token(~64-128个)
                                                          ↓
文本 → Tokenizer → 文本 Token → 拼接 → 8B Transformer → 输出
</code></pre>
<p><strong>视觉编码器的轻量化手段</strong>：</p>
<ol>
<li><strong>低分辨率输入</strong>：256×256 而非 1024×1024</li>
<li><strong>Patch 大小增大</strong>：16×16 或 32×32 而非 14×14</li>
<li><strong>层数减少</strong>：6-12 层而非 24-48 层</li>
<li><strong>知识蒸馏</strong>：用 Pro 的视觉编码器作为教师</li>
</ol>
<h3 id="4-2-dmt-token-ysgl">4.2 多模态 Token 预算管理</h3>
<p>8B 模型的总 Token 预算有限(1M 上下文是&quot;容量&quot;而非&quot;实际处理能力&quot;)。在多模态场景下：</p>
<table>
<thead>
<tr>
<th>输入类型</th>
<th>Token 消耗</th>
<th>8B 模型处理能力</th>
</tr>
</thead>
<tbody><tr>
<td>纯文本</td>
<td>1 token/词</td>
<td>~128K-256K 有效</td>
</tr>
<tr>
<td>单图(低分辨率)</td>
<td>~64-128 tokens</td>
<td>~1000 张图/1M 上下文</td>
</tr>
<tr>
<td>单图(标准分辨率)</td>
<td>~256-512 tokens</td>
<td>~2000-4000 张/1M</td>
</tr>
<tr>
<td>短视频(1分钟)</td>
<td>~1000-2000 tokens</td>
<td>~500-1000 分钟/1M</td>
</tr>
</tbody></table>
<p>对于端侧应用，Flash-8B 更适合<strong>单图+短文本</strong>的场景，而非复杂的视频分析。</p>
<h2 id="w-xnjzyjpdb">五、性能基准与竞品对比</h2>
<h3 id="5-1-xsjz">5.1 学术基准</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Flash-8B</th>
<th>Flash</th>
<th>Flash(推测)</th>
<th>Llama 3.1 8B</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>~72%</td>
<td>~77.5%</td>
<td>~5% 差距</td>
<td>73.0%</td>
<td>接近开源</td>
</tr>
<tr>
<td>HumanEval</td>
<td>~65%</td>
<td>~73%</td>
<td>~8% 差距</td>
<td>72.6%</td>
<td>编码差距</td>
</tr>
<tr>
<td>MATH</td>
<td>~45%</td>
<td>~52%</td>
<td>~7% 差距</td>
<td>52.0%</td>
<td>数学差距</td>
</tr>
<tr>
<td>BBH</td>
<td>~65%</td>
<td>~72%</td>
<td>~7% 差距</td>
<td>68.0%</td>
<td>推理差距</td>
</tr>
</tbody></table>
<p>Flash-8B 在通用能力上略低于 1.5 Flash，但接近 Llama 3.1 8B 的水平。</p>
<h3 id="5-2-sddb">5.2 速度对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>端侧延迟(A100)</th>
<th>端侧延迟(手机 NPU)</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>Flash-8B</td>
<td>8B</td>
<td>~50ms/Token</td>
<td>~200-500ms/Token</td>
<td>核心优势</td>
</tr>
<tr>
<td>Flash</td>
<td>~数十B</td>
<td>~150ms/Token</td>
<td>不可行</td>
<td>端侧困难</td>
</tr>
<tr>
<td>Llama 3.1 8B</td>
<td>8B</td>
<td>~60ms/Token</td>
<td>~250-600ms/Token</td>
<td>接近</td>
</tr>
<tr>
<td>Gemma 2 9B</td>
<td>9B</td>
<td>~70ms/Token</td>
<td>~300-700ms/Token</td>
<td>略慢</td>
</tr>
</tbody></table>
<p>Flash-8B 的速度优势主要来自 Google 的推理优化(TPU 训练生态的协同优化)。</p>
<h3 id="5-3-jgys">5.3 价格优势</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>输入/1M</th>
<th>输出/1M</th>
<th>端侧部署成本</th>
</tr>
</thead>
<tbody><tr>
<td>Flash-8B</td>
<td><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.0375</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo></mrow><annotation encoding="application/x-tex">0.0375** | **</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.0375</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span></span></span></span>0.15</strong></td>
<td>免费(自托管)</td>
<td></td>
</tr>
<tr>
<td>Flash</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.075</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.075 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.075∣</span></span></span></span>0.30</td>
<td>较高</td>
<td></td>
</tr>
<tr>
<td>GPT-4o-mini</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15∣</span></span></span></span>0.60</td>
<td>不可行</td>
<td></td>
</tr>
<tr>
<td>Llama 3.1 8B</td>
<td>免费</td>
<td>免费</td>
<td>硬件成本</td>
</tr>
</tbody></table>
<p>Flash-8B 在 API 价格上具有竞争力，但开源模型(Llama 3.1 8B)在自托管场景下完全免费。</p>
<h2 id="l-dcbsdgcsj">六、端侧部署的工程实践</h2>
<h3 id="6-1-lhfa">6.1 量化方案</h3>
<p>Flash-8B 的端侧部署需要激进的量化：</p>
<table>
<thead>
<tr>
<th>量化方案</th>
<th>模型大小</th>
<th>质量保留</th>
<th>适用设备</th>
</tr>
</thead>
<tbody><tr>
<td>FP16</td>
<td>16 GB</td>
<td>100%</td>
<td>高端 GPU</td>
</tr>
<tr>
<td>INT8</td>
<td>8 GB</td>
<td>95-98%</td>
<td>笔记本/高端手机</td>
</tr>
<tr>
<td>INT4(GPTQ/AWQ)</td>
<td>4 GB</td>
<td>90-95%</td>
<td>中端手机</td>
</tr>
<tr>
<td>INT3</td>
<td>3 GB</td>
<td>85-90%</td>
<td>低端手机</td>
</tr>
<tr>
<td>INT2</td>
<td>2 GB</td>
<td>75-85%</td>
<td>极低内存设备</td>
</tr>
</tbody></table>
<p><strong>推荐方案</strong>：</p>
<ul>
<li><strong>移动端</strong>：INT4(GGUF Q4_K_M)，~4GB，质量保留 ~92%</li>
<li><strong>边缘设备</strong>：INT8，~8GB，质量保留 ~97%</li>
<li><strong>开发板(Raspberry Pi)</strong>：INT3，~3GB，质量保留 ~88%</li>
</ul>
<h3 id="6-2-tlyqxz">6.2 推理引擎选择</h3>
<table>
<thead>
<tr>
<th>引擎</th>
<th>平台</th>
<th>优势</th>
<th>适用场景</th>
</tr>
</thead>
<tbody><tr>
<td>llama.cpp</td>
<td>全平台</td>
<td>成熟、量化格式丰富</td>
<td>通用端侧</td>
</tr>
<tr>
<td>mlc-llm</td>
<td>移动端</td>
<td>专为手机优化</td>
<td>iOS/Android</td>
</tr>
<tr>
<td>ONNX Runtime</td>
<td>全平台</td>
<td>微软生态</td>
<td>Windows/云端</td>
</tr>
<tr>
<td>TensorFlow Lite</td>
<td>移动端</td>
<td>Google 生态</td>
<td>Android</td>
</tr>
<tr>
<td>Core ML</td>
<td>iOS</td>
<td>Apple 原生优化</td>
<td>iPhone/iPad</td>
</tr>
</tbody></table>
<p>Flash-8B 作为 Google 模型，在 <strong>TensorFlow Lite</strong> 和 <strong>mlc-llm</strong> 上可能有原生优化。</p>
<h3 id="6-3-dcbssl">6.3 端侧部署示例</h3>
<pre><code class="language-bash"># 下载 Flash-8B GGUF 量化模型
# (注：Flash-8B 为闭源模型，以下为假设性示例)

# 使用 llama.cpp 推理
./main \\
  -m gemini-1.5-flash-8b-Q4_K_M.gguf \\
  -p &quot;What is machine learning?&quot; \\
  -n 200 \\
  --ctx-size 32768  # 端侧有效上下文

# 使用 mlc-llm(移动端)
mlc_llm chat \\
  --model gemini-1.5-flash-8b \\
  --quantization q4f16_1 \\
  --device iphone
</code></pre>
<h2 id="q-yycjyzjsj">七、应用场景与最佳实践</h2>
<h3 id="7-1-hjyycj">7.1 黄金应用场景</h3>
<p><strong>场景一：端侧 AI 助手</strong></p>
<ul>
<li>iOS/Android 原生智能助手</li>
<li>离线语音助手</li>
<li>隐私敏感场景(医疗、法律)</li>
<li><strong>Why Flash-8B</strong>：端侧运行，数据不出设备</li>
</ul>
<p><strong>场景二：实时多模态交互</strong></p>
<ul>
<li>拍照即问(物体识别+问答)</li>
<li>实时翻译(摄像头 OCR + 翻译)</li>
<li>辅助视障人士(图像描述)</li>
<li><strong>Why Flash-8B</strong>：低延迟 + 多模态</li>
</ul>
<p><strong>场景三：IoT 设备智能</strong></p>
<ul>
<li>智能家居控制中心</li>
<li>工业设备监控</li>
<li>车载语音助手</li>
<li><strong>Why Flash-8B</strong>：低功耗 + 离线能力</li>
</ul>
<p><strong>场景四：高并发微服务</strong></p>
<ul>
<li>同时服务数万用户的简单查询</li>
<li>内容审核(文本+图像)</li>
<li>数据预处理</li>
<li><strong>Why Flash-8B</strong>：API 价格最低</li>
</ul>
<h3 id="7-2-bjysy-flash-8b-dcj">7.2 不建议使用 Flash-8B 的场景</h3>
<ul>
<li><strong>复杂推理</strong>：数学证明、代码架构设计(选 Flash 或 Pro)</li>
<li><strong>长文档深度分析</strong>：1M 是容量不是精度(选 Pro)</li>
<li><strong>高精度创意生成</strong>：小说、诗歌质量有限(选 Pro)</li>
<li><strong>多语言翻译</strong>：小语种能力有限(选 Flash)</li>
</ul>
<h2 id="b-jxxywlyj">八、局限性与未来演进</h2>
<h3 id="8-1-yzjx">8.1 已知局限</h3>
<ol>
<li><strong>能力天花板</strong>：8B 参数限制了复杂推理和知识深度</li>
<li><strong>端侧上下文虚高</strong>：1M 是理论容量，端侧实际有效上下文可能仅 4K-32K</li>
<li><strong>多模态质量</strong>：视觉理解质量显著低于 Flash 和 Pro</li>
<li><strong>闭源限制</strong>：无法自托管，必须依赖 Google API</li>
<li><strong>知识截止</strong>：训练数据截止较早</li>
</ol>
<h3 id="8-2-x-2-0-flash-lite-dyj">8.2 向 2.0 Flash-Lite 的演进</h3>
<p>基于 Gemini 系列的发布节奏，2.0 Flash-Lite(或类似定位的模型)可能带来：</p>
<ul>
<li><strong>原生多模态输出</strong>：图像+音频生成(继承 2.0 Flash 能力)</li>
<li><strong>Agentic 能力</strong>：轻量工具使用</li>
<li><strong>更长有效上下文</strong>：端侧实现 128K 有效上下文</li>
<li><strong>更低价格</strong>：规模效应进一步降低成本</li>
</ul>
<h3 id="8-3-ykymxdjzgj">8.3 与开源模型的竞争格局</h3>
<p>Flash-8B 在端侧市场面临激烈竞争：</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Flash-8B</th>
<th>Llama 3.1 8B</th>
<th>Gemma 2 9B</th>
<th>优势方</th>
</tr>
</thead>
<tbody><tr>
<td>价格</td>
<td>\$0.0375/1M</td>
<td>免费</td>
<td>免费</td>
<td>开源</td>
</tr>
<tr>
<td>可控性</td>
<td>低(闭源)</td>
<td>高(开源)</td>
<td>高(开源)</td>
<td>开源</td>
</tr>
<tr>
<td>多模态</td>
<td>✅</td>
<td>❌</td>
<td>❌</td>
<td>Flash-8B</td>
</tr>
<tr>
<td>上下文</td>
<td>1M(理论)</td>
<td>128K</td>
<td>8K</td>
<td>Flash-8B</td>
</tr>
<tr>
<td>端侧优化</td>
<td>强</td>
<td>强</td>
<td>强</td>
<td>持平</td>
</tr>
<tr>
<td>生态集成</td>
<td>Google</td>
<td>Meta</td>
<td>Google</td>
<td>持平</td>
</tr>
</tbody></table>
<p>Flash-8B 的核心竞争力在于<strong>原生多模态 + 1M 上下文 + Google 生态集成</strong>，开源模型在可控性和免费方面占优。</p>
<h2 id="j-zj">九、总结</h2>
<p>Gemini 1.5 Flash-8B 代表了 Google 在<strong>极致轻量模型</strong>方向上的探索——它证明了 8B 参数模型可以同时支持 1M 上下文和原生多模态，同时保持极低的推理成本。</p>
<p>核心启示：</p>
<ol>
<li><strong>端侧 AI 的可行性</strong>：8B 参数 + INT4 量化使大模型首次真正可以在消费级设备上流畅运行</li>
<li><strong>参数透明化的趋势</strong>：Google 在 Flash-8B 上公开参数规模，标志着闭源厂商向开源社区标准的靠拢</li>
<li><strong>上下文的分层管理</strong>：1M 上下文在端侧的实现需要&quot;活跃窗口+工作集+归档&quot;的分层架构，而非简单的一次加载</li>
<li><strong>多模态是标配而非高配</strong>：Flash-8B 将多模态能力下放到 8B 级别，预示着未来所有模型都将具备基本的多模态理解能力</li>
</ol>
<p>Flash-8B 的历史意义在于：它证明了<strong>大模型的民主化</strong>不仅是价格问题，更是工程问题——通过极致的架构优化、量化技术和分层上下文管理，前沿 AI 能力可以被压缩到端侧设备中，让数亿用户无需云端连接即可享受 AI 服务。这一方向将深刻影响未来 AI 产品的设计范式——从&quot;云端智能&quot;走向&quot;端云协同智能&quot;。</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxdwycpcl","text":"一、模型定位与产品策略"},{"level":3,"id":"1-1-flash-xldtdsj","text":"1.1 Flash 系列的梯度设计"},{"level":3,"id":"1-2-quot-cstmh-quot-dzlyy","text":"1.2 &quot;参数透明化&quot;的战略意义"},{"level":2,"id":"e-8b-jgdgcjx","text":"二、8B 架构的工程极限"},{"level":3,"id":"2-1-mxjgtc","text":"2.1 模型架构推测"},{"level":3,"id":"2-2-ytlkymxdjgdb","text":"2.2 与同类开源模型的架构对比"},{"level":3,"id":"2-3-csxsyh","text":"2.3 参数效率优化"},{"level":2,"id":"s-1m-sxwddckhx","text":"三、1M 上下文的端侧可行性"},{"level":3,"id":"3-1-dc-kv-cache-dncjs","text":"3.1 端侧 KV-Cache 的内存计算"},{"level":3,"id":"3-2-dc-1m-sxwdjsbknsj","text":"3.2 端侧 1M 上下文的技术不可能三角"},{"level":3,"id":"3-3-hdckzylddcsx","text":"3.3 滑动窗口注意力的端侧实现"},{"level":2,"id":"s-dmtnldqlh","text":"四、多模态能力的轻量化"},{"level":3,"id":"4-1-qlsjbmq","text":"4.1 轻量视觉编码器"},{"level":3,"id":"4-2-dmt-token-ysgl","text":"4.2 多模态 Token 预算管理"},{"level":2,"id":"w-xnjzyjpdb","text":"五、性能基准与竞品对比"},{"level":3,"id":"5-1-xsjz","text":"5.1 学术基准"},{"level":3,"id":"5-2-sddb","text":"5.2 速度对比"},{"level":3,"id":"5-3-jgys","text":"5.3 价格优势"},{"level":2,"id":"l-dcbsdgcsj","text":"六、端侧部署的工程实践"},{"level":3,"id":"6-1-lhfa","text":"6.1 量化方案"},{"level":3,"id":"6-2-tlyqxz","text":"6.2 推理引擎选择"},{"level":3,"id":"6-3-dcbssl","text":"6.3 端侧部署示例"},{"level":2,"id":"q-yycjyzjsj","text":"七、应用场景与最佳实践"},{"level":3,"id":"7-1-hjyycj","text":"7.1 黄金应用场景"},{"level":3,"id":"7-2-bjysy-flash-8b-dcj","text":"7.2 不建议使用 Flash-8B 的场景"},{"level":2,"id":"b-jxxywlyj","text":"八、局限性与未来演进"},{"level":3,"id":"8-1-yzjx","text":"8.1 已知局限"},{"level":3,"id":"8-2-x-2-0-flash-lite-dyj","text":"8.2 向 2.0 Flash-Lite 的演进"},{"level":3,"id":"8-3-ykymxdjzgj","text":"8.3 与开源模型的竞争格局"},{"level":2,"id":"j-zj","text":"九、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/04-gemini-1.5-flash-8b/05-04-gemini-1.5-flash-8b-hxjszt" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/04-gemini-1.5-flash-8b/05-04-gemini-1.5-flash-8b-hxjszt" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">04-Gemini-1.5-Flash-8B 核心技术专题：端侧友好的极致轻量架构与 1M 上下文工程</h1>
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
