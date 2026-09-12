"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4 核心架构与中文对齐设计剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools (arXiv:2406.12793)
发表会议: arXiv preprint (2024.06)
发布日期: 2024.06.18 (v1)
发布机构: Zhipu AI &amp; Tsinghua University (Team GLM)
开源协议: 模型权重公开 (ChatGLM-6B 三代, GLM-4-9B 系列)</p>
</blockquote>
<hr>
<h2 id="1-sjdj-xmxxh-dddzx">1. 设计动机: 「小模型先行」的迭代哲学</h2>
<p>GLM 家族的发展路径与大多数大模型团队截然不同. 在 GPT-3/4 选择闭源巨模型的同时,智谱 AI 采取了一条「小模型探路 → 大模型验证」的开源路线:</p>
<table>
<thead>
<tr>
<th>时间节点</th>
<th>模型</th>
<th>参数</th>
<th>上下文</th>
<th>核心策略</th>
</tr>
</thead>
<tbody><tr>
<td>2023.03</td>
<td>ChatGLM-6B</td>
<td>6.2B</td>
<td>2K</td>
<td>消费级 GPU 可部署,快速验证假设</td>
</tr>
<tr>
<td>2023.06</td>
<td>ChatGLM2-6B</td>
<td>6.2B</td>
<td>32K</td>
<td>FlashAttention + MQA,推理加速 42%</td>
</tr>
<tr>
<td>2023.10</td>
<td>ChatGLM3-6B</td>
<td>6.2B</td>
<td>32K</td>
<td>函数调用 + 代码解释器 + Agent 任务</td>
</tr>
<tr>
<td>2024.01</td>
<td>GLM-4(0116)</td>
<td>未公开</td>
<td>128K</td>
<td>10T token 预训练,接近 GPT-4 水平</td>
</tr>
<tr>
<td>2024.06</td>
<td>GLM-4-9B</td>
<td>9B</td>
<td>128K/1M</td>
<td>开源版本,超越 Llama-3-8B</td>
</tr>
</tbody></table>
<p>这里需要停下来想一下. 这种「小模型先行」策略的本质是<strong>用时间换信息</strong>. 6B 模型在单张 A100 上数周即可完成训练,使得团队能够在 7 个月内迭代三代——从 ChatGLM-6B 到 ChatGLM3-6B-Base,MMLU 从 25.2% 提升到 61.4%,GSM8K 从 1.5% 提升到 72.3%. 这种迭代速度在当时的 LLM 赛道中是极快的. 但代价也很明显:每一代都需要<strong>从头预训练</strong>,没有采用继续预训练的方式. 这可能是因为团队希望彻底验证新的数据配方和训练策略,而非在旧Checkpoint上微调.</p>
<p>从工程角度看,这种策略的深层逻辑在于:对于学术背景浓厚的团队,开源小模型不仅是技术验证工具,更是<strong>声誉建立和社区反馈收集的渠道</strong>. ChatGLM-6B 在 2023 年 3 月的开源引发了远超预期的关注,仅 2023 一年 Hugging Face 下载量超过 1000 万次. 这些真实用户的反馈——尤其是失败案例——为后续大模型的对齐数据收集提供了宝贵信号.</p>
<hr>
<h2 id="2-jgsj-gqa-y-ffn-dbcby">2. 架构设计: GQA 与 FFN 的补偿博弈</h2>
<h3 id="2-1-hxjgxz">2.1 核心架构选择</h3>
<p>GLM-4 的架构遵循后 Llama-2 时代的标准范式,但有几处值得注意的设计:</p>
<table>
<thead>
<tr>
<th>组件</th>
<th>GLM-4 选择</th>
<th>标准做法</th>
<th>差异动机</th>
</tr>
</thead>
<tbody><tr>
<td>归一化</td>
<td>RMSNorm</td>
<td>LayerNorm</td>
<td>训练稳定性与速度</td>
</tr>
<tr>
<td>激活函数</td>
<td>SwiGLU</td>
<td>ReLU/GeLU</td>
<td>门控机制提升表达能力</td>
</tr>
<tr>
<td>位置编码</td>
<td>二维 RoPE</td>
<td>一维 RoPE</td>
<td>适配 GLM 的二维位置编码</td>
</tr>
<tr>
<td>注意力</td>
<td>GQA</td>
<td>MHA</td>
<td>减少 KV cache,提升推理效率</td>
</tr>
<tr>
<td>FFN 维度</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>=</mo><mfrac><mn>10</mn><mn>3</mn></mfrac><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{\\mathrm{ffn}} = \\frac{10}{3} d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">ffn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\frac{8}{3} d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>(SwiGLU)</td>
<td>补偿 GQA 节省的参数</td>
</tr>
<tr>
<td>偏置</td>
<td>仅 QKV 保留</td>
<td>全部保留/全部移除</td>
<td>长度外推轻微改善</td>
</tr>
</tbody></table>
<h3 id="2-2-gqa-dbcsj-wsm-d-f-f-n-10-3-d-h-i-d-d-e-n-d-mathrm-ffn-frac-10-3-d-mathrm-hidden-d-ffn-3-10-d-hidden">2.2 GQA 的补偿设计: 为什么 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mrow><mi mathvariant="normal">f</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>=</mo><mfrac><mn>10</mn><mn>3</mn></mfrac><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">d_{\\mathrm{ffn}} = \\frac{10}{3} d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">ffn</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></h3>
<p>标准 Transformer 中 FFN 维度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub></mrow><annotation encoding="application/x-tex">4 \\times d_{\\mathrm{hidden}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>. SwiGLU 由于门控机制通常设为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>≈</mo><mn>2.67</mn></mrow><annotation encoding="application/x-tex">\\frac{8}{3} \\times d_{\\mathrm{hidden}} \\approx 2.67</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2.67</span></span></span></span>. GLM-4 进一步增加到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>10</mn><mn>3</mn></mfrac><mo>≈</mo><mn>3.33</mn></mrow><annotation encoding="application/x-tex">\\frac{10}{3} \\approx 3.33</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">3.33</span></span></span></span>,比标准 SwiGLU 大了约 25%.</p>
<p>这里的设计权衡非常清晰: GQA 减少了注意力头的数量(从而减少了参数),为了保持总参数量不变,需要在 FFN 中补偿. 具体而言,如果 GQA 将 KV 头数从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span> 降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi><mi mathvariant="normal">/</mi><mi>g</mi></mrow><annotation encoding="application/x-tex">h/g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">h</span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>g</mi></mrow><annotation encoding="application/x-tex">g</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span></span> 为分组数),节省的参数约为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>P</mi><mo>≈</mo><mn>2</mn><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">h</mi><mi mathvariant="normal">i</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">d</mi><mi mathvariant="normal">e</mi><mi mathvariant="normal">n</mi></mrow></msub><mo>×</mo><msub><mi>d</mi><mrow><mi mathvariant="normal">k</mi><mi mathvariant="normal">v</mi></mrow></msub><mo>×</mo><mi>h</mi><mo>×</mo><mrow><mo fence="true">(</mo><mn>1</mn><mo>−</mo><mfrac><mn>1</mn><mi>g</mi></mfrac><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\Delta P \\approx 2 \\times d_{\\mathrm{hidden}} \\times d_{\\mathrm{kv}} \\times h \\times \\left(1 - \\frac{1}{g}\\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight">hidden</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathrm mtight" style="margin-right:0.0139em;">kv</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8804em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>将这些参数转移到 FFN 中,需要增加 FFN 的中间维度. <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>10</mn><mn>3</mn></mfrac></mrow><annotation encoding="application/x-tex">\\frac{10}{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">10</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 的系数意味着每个 token 的前向计算中 FFN 部分的计算量增加了 25%. 这是「参数量不变 → 计算量增加」的权衡,因为 GQA 节省的是内存带宽(更少的 KV cache 读写),而非计算.</p>
<p>这里值得停下来想一下. 这种「补偿设计」反映了一个重要的工程原则:<strong>在总预算(参数量、训练成本)约束下,不同组件之间的资源可以重新分配</strong>. GQA 将资源从注意力层转移到 FFN 层,本质上是在「内存效率」和「计算效率」之间做选择. 对于长上下文推理场景,KV cache 的内存占用往往是瓶颈,因此 GQA 的收益大于 FFN 计算增加的代价. 但对于短上下文、高吞吐场景,这种权衡可能不划算. GLM-4 的选择表明,其目标场景是<strong>长上下文对话和 Agent 任务</strong>,而非批处理推理.</p>
<hr>
<h2 id="3-yxlsj-10t-token-dsygc">3. 预训练数据: 10T Token 的双语工程</h2>
<h3 id="3-1-sjgmypb">3.1 数据规模与配比</h3>
<p>GLM-4 的预训练语料包含约 10 万亿(10T) token,在 2024 年属于顶级水平:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>预训练数据量</th>
<th>主要语言</th>
</tr>
</thead>
<tbody><tr>
<td>Llama-2</td>
<td>2T</td>
<td>英文为主</td>
</tr>
<tr>
<td>Qwen2</td>
<td>7T</td>
<td>中英为主</td>
</tr>
<tr>
<td>GLM-4</td>
<td>10T</td>
<td>中英为主,24 种语言</td>
</tr>
<tr>
<td>Llama-3</td>
<td>15T</td>
<td>英文为主</td>
</tr>
</tbody></table>
<h3 id="3-2-tycb-150k-bpe-dkyydq">3.2 统一词表: 150K BPE 的跨语言对齐</h3>
<p>GLM-4 采用了一个关键但常被忽视的设计:将中文 BPE 与 tiktoken 的 cl100k_base 合并为一个包含 150,000 个 token 的统一词表.</p>
<p>这里需要停下来想一下. 统一词表对中英双语模型的意义远超表面. 如果中文使用独立的子词表,同一概念的中英文表示会不对齐——例如「机器学习」和 &quot;machine learning&quot; 会映射到完全不同的 token 序列,导致跨语言迁移困难. 统一词表通过共享 subword 单元,使得模型在预训练阶段就能建立中英文概念之间的隐式映射. 这对于 GLM-4 的「中文对齐」定位至关重要:一个需要理解中文用户意图并用英文工具(如 Python、API)执行任务的模型,必须在底层表征中实现语言的统一.</p>
<p>但统一词表也有代价:cl100k_base 的 100K token 已经针对英文优化,加入中文后词表膨胀到 150K,导致 embedding 层参数增加 50%. 对于 9B 规模的开源模型,这种开销是可接受的;但对于更大规模的模型,embedding 层的参数量可能成为瓶颈.</p>
<h3 id="3-3-sjzld-jyzy-kj">3.3 数据质量的「经验主义」困境</h3>
<p>论文坦诚地承认:「迄今为止我们尚未确定一个能够指导数据收集、清洗和选择过程的根本性原则」. 这一声明揭示了 LLM 预训练中的一个核心困境:数据质量的重要性已被广泛认可,但「什么是高质量」仍缺乏可操作化的定义. GLM-4 的做法是经验性的——通过重新加权不同来源(增加书籍和 Wikipedia 的比例)、去重、过滤噪声文档——但这些步骤的权重和阈值是通过实验调参确定的,而非基于第一性原理.</p>
<hr>
<h2 id="4-hxl-c-rlhf-d-self-contrast">4. 后训练: 从 RLHF 到 Self-Contrast</h2>
<h3 id="4-1-dqlsx">4.1 对齐流水线</h3>
<p>GLM-4 的对齐采用标准的多阶段流程:</p>
<ol>
<li><strong>SFT</strong>: 使用真实人类提示和交互数据,强调「真实数据」优于「模型生成数据」</li>
<li><strong>RLHF</strong>: PPO 和 DPO 的结合,缓解拒答、安全性、双语 token 混合和多轮连贯性问题</li>
<li><strong>安全对齐</strong>: 红队测试 + 有害样本过滤 + 偏好对齐中的无害性标准</li>
</ol>
<h3 id="4-2-self-contrast-wfkdqcl">4.2 Self-Contrast: 无反馈对齐策略</h3>
<p>Self-Contrast 是 GLM 家族的一项独特创新. 传统 RLHF 需要昂贵的人类偏好反馈数据,而 Self-Contrast 利用目标 LLM <strong>自我生成大量负样本</strong>用于 RLHF 对齐.</p>
<p>其核心洞察是:模型本身足够强大,可以生成「几乎正确但有关键缺陷」的回复. 这些自生成的负样本比随机采样或模板生成的负样本更有信息量,因为它们针对模型自身的弱点. 通过将模型生成的「好回复」与「自生成的差回复」配对,可以构建偏好数据集,无需人工标注.</p>
<p>这里值得停下来想一下. Self-Contrast 的巧妙之处在于它将「数据生成」和「模型训练」耦合在一起:模型越强大,生成的负样本质量越高,从而训练出更强的模型. 这是一种自举(bootstrapping)机制. 但它的有效性高度依赖模型的初始能力——如果基座模型太弱,生成的负样本可能过于明显,无法提供有效的学习信号. 这也解释了为什么 Self-Contrast 在 GLM-4(强大的基座)上有效,但在早期 ChatGLM-6B 上未被采用.</p>
<h3 id="4-3-agent-tuning-agent-nldzlwt">4.3 AgentTuning: Agent 能力的指令微调</h3>
<p>AgentTuning 框架包含 AgentInstruct 数据集,涵盖 Agent 与环境之间的高质量交互轨迹. 与 K2 的大规模合成工具不同,AgentTuning 更侧重于<strong>轨迹质量</strong>而非<strong>工具多样性</strong>——通过精心设计的交互场景,教授模型规划、工具调用和错误恢复能力.</p>
<hr>
<h2 id="5-csxwgc-long-align-y-1m-sxw">5. 长上下文工程: LongAlign 与 1M 上下文</h2>
<p>GLM-4 的上下文长度从 ChatGLM 的 2K 扩展到 128K(GLM-4)和 1M(GLM-4-9B-Chat-1M). 这一扩展通过三个技术实现:</p>
<ol>
<li><strong>位置编码扩展</strong>: 将 RoPE 从一维扩展为二维形式,适应 GLM 的二维位置编码需求</li>
<li><strong>持续训练</strong>: 在长文本数据上进行继续预训练,使模型适应长序列分布</li>
<li><strong>LongAlign</strong>: 专门的长上下文对齐方案,确保模型在 128K 上下文下的指令遵循和事实性</li>
</ol>
<p>在 LongBench-Chat 上的评估显示,GLM-4(0520)在英文 prompt 上达到 87.3(与 GPT-4 Turbo 的 87.2 和 Claude 3 Opus 的 87.7 相当),在中文 prompt 上达到 84.0(超越所有对比模型).</p>
<p>这里需要停下来想一下. GLM-4 在长上下文上的中文优势(84.0 vs GPT-4 Turbo 的 82.1)可能反映了两个因素:第一,LongAlign 的对齐数据可能包含更多中文长文档(如法律条文、学术论文),使得模型对中文长文本的结构更熟悉;第二,中文的字符密度(每个汉字携带的信息量)高于英文,在相同 token 预算下,中文文档的语义连贯性可能更容易保持. 但这只是一个假设,论文未提供详细的长上下文训练数据构成.</p>
<hr>
<h2 id="6-glm-4-all-tools-zzgjtydlsxsj">6. GLM-4 All Tools: 自主工具调用的流水线设计</h2>
<p>GLM-4 All Tools 是 GLM-4 的一个专门对齐版本,支持自主理解用户意图、逐步规划复杂指令,并调用多个工具完成任务. 其系统流水线包含:</p>
<ol>
<li><strong>意图解析</strong>: 分析用户请求,判断是否需要外部工具</li>
<li><strong>任务规划</strong>: 将复杂请求分解为可执行的子任务序列</li>
<li><strong>工具选择</strong>: 从可用工具(网页浏览器、Python 解释器、文生图模型、用户自定义函数)中选择最合适的</li>
<li><strong>执行与迭代</strong>: 调用工具,根据中间反馈调整计划</li>
<li><strong>结果整合</strong>: 将多工具输出整合为最终回复</li>
</ol>
<p>在浏览器信息检索任务上,GLM-4 All Tools 达到 78.08%,超越 GPT-4(Web)的 67.12%. 在 Python 解释器解决数学问题上,GLM-4 All Tools 的 GSM8K 得分 91.59% 与 GPT-4 的 92.72% 相当.</p>
<p>这里值得停下来想一下. GLM-4 All Tools 的设计与 GPT-4 的「插件系统」和 Kimi K2 的「Agentic 数据合成」形成三代演进. GPT-4 的插件是「被动调用」——用户明确选择插件,模型按指令执行;GLM-4 All Tools 是「主动规划」——模型自主判断何时使用工具;Kimi K2 则是「深度交互」——模型通过 RL 在真实和合成环境中学习工具使用策略. 这种演进反映了工具学习从「功能添加」到「能力内化」再到「智能涌现」的发展轨迹.</p>
<hr>
<h2 id="7-xndw-zwthxtymx">7. 性能定位: 中文特化型通用模型</h2>
<h3 id="7-1-xsjz">7.1 学术基准</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>GLM-4(0520)</th>
<th>GPT-4 Turbo(2024-04)</th>
<th>差距分析</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>83.3</td>
<td>86.7</td>
<td>-3.4%(知识覆盖略逊)</td>
</tr>
<tr>
<td>GSM8K</td>
<td>93.3</td>
<td>95.6</td>
<td>-2.3%(基础数学扎实)</td>
</tr>
<tr>
<td>MATH</td>
<td>61.3</td>
<td>73.4</td>
<td>-12.1%(竞赛数学是主要短板)</td>
</tr>
<tr>
<td>HumanEval</td>
<td>78.5</td>
<td>88.2</td>
<td>-9.7%(代码能力有差距)</td>
</tr>
<tr>
<td>GPQA</td>
<td>39.9</td>
<td>49.3</td>
<td>-9.4%(研究生级推理不足)</td>
</tr>
</tbody></table>
<h3 id="7-2-zwdq-align-bench-dlxdw">7.2 中文对齐: AlignBench 的领先地位</h3>
<p>AlignBench 评估显示 GLM-4(0520)总体得分 8.00,超越 GPT-4 Turbo(8.00 持平)、Claude 3 Opus(7.53)和 Gemini 1.5 Pro(7.47). 尤其在中文逻辑推理(7.95)和语言理解(8.00)上显著领先.</p>
<p>但需要谨慎看待这一结果. AlignBench 使用 GPT-4 作为评判器,这意味着如果 GPT-4 本身对中文的理解有偏差,评分就会系统性地偏向 GPT-4 风格的回答. 此外,GLM-4 在「数学」维度上 7.89 vs GPT-4 Turbo 的 8.32 有明显差距,这与学术基准的结论一致.</p>
<h3 id="7-3-agent-nl-agent-bench-dqmpg">7.3 Agent 能力: AgentBench 的全面评估</h3>
<p>AgentBench 涵盖 7 个环境(OS、DB、KG、LTP、HH、WS、WB),GLM-4(0520)总体得分 3.79,超越 GPT-4 Turbo(3.68)和 Claude 3 Opus(3.62). 但在代码相关的 OS(36.8 vs GPT-4 的 42.4)和 KG(51.4 vs 58.8)上仍有差距.</p>
<hr>
<h2 id="8-aqyfx">8. 安全与风险</h2>
<p>GLM-4 在 SafetyBench 中文子集上的总体得分 87.2,与 Claude 3 Opus(87.5)相当,略低于 GPT-4 家族(87.9-89.7). 值得关注的是「不公平与偏见」维度:GLM-4 与 Claude 3 Opus 同为 66.0%,显著低于 GPT-4 家族的 73-75%.</p>
<p>这里需要停下来想一下. 这种差距可能反映了<strong>中文语料中性别和种族偏见的不同分布</strong>,而非模型本身的能力缺陷. 中文互联网内容中,职业性别刻板印象(如「护士=女性」、「工程师=男性」)可能更为普遍,导致模型在相关测试上表现较差. 另一个因素是 SafetyBench 中文子集「移除了容易被审查的高敏感问题」,这使得评测结果被「软化」——如果保留那些问题,不同模型的安全策略差异会更大. 中国模型通常有更严格的内容过滤,可能在某些维度上得分更高,但也可能因过度审查而降低有用性.</p>
<hr>
<h2 id="9-mxpxdw">9. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: GLM-130B(ICLR 2023)、三代 ChatGLM-6B 迭代经验</li>
<li><strong>核心创新</strong>:<ul>
<li>「小模型先行」的快速迭代策略(6B 探路 → 大模型验证)</li>
<li>GQA + d_ffn = 10/3 的架构补偿设计</li>
<li>150K 统一中英词表的跨语言对齐</li>
<li>Self-Contrast 无反馈对齐策略</li>
<li>LongAlign 长上下文对齐方案(128K/1M)</li>
<li>GLM-4 All Tools 自主工具调用流水线</li>
</ul>
</li>
<li><strong>同期竞争</strong>: GPT-4 Turbo(2024-04)、Claude 3 Opus、Gemini 1.5 Pro、Llama-3-8B/70B</li>
<li><strong>开源影响</strong>:<ul>
<li>ChatGLM-6B 三代累计 Hugging Face 下载超 1000 万次</li>
<li>GLM-4-9B(128K/1M)开源,超越 Llama-3-8B</li>
<li>LongAlign、AgentTuning、Self-Contrast、APAR 等技术被社区广泛采用</li>
<li>CodeGeeX、CogVLM/CogAgent、CogView、WebGLM 等衍生项目形成完整生态</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>GLM-4.5(ARC, Agentic/Reasoning/Coding 增强)</li>
<li>GLM-4.6/4.7(代码能力专项提升)</li>
<li>GLM-5(MoE 架构,744B 参数)</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档基于 GLM-4 技术报告(arXiv:2406.12793)进行系统性架构剖析.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-xmxxh-dddzx","text":"1. 设计动机: 「小模型先行」的迭代哲学"},{"level":2,"id":"2-jgsj-gqa-y-ffn-dbcby","text":"2. 架构设计: GQA 与 FFN 的补偿博弈"},{"level":3,"id":"2-1-hxjgxz","text":"2.1 核心架构选择"},{"level":3,"id":"2-2-gqa-dbcsj-wsm-d-f-f-n-10-3-d-h-i-d-d-e-n-d-mathrm-ffn-frac-10-3-d-mathrm-hidden-d-ffn-3-10-d-hidden","text":"2.2 GQA 的补偿设计: 为什么 d f f n = 10 3 d h i d d e n d_{\\mathrm{ffn}} = \\frac{10}{3} d_{\\mathrm{hidden}} d ffn ​ = 3 10 ​ d hidden ​"},{"level":2,"id":"3-yxlsj-10t-token-dsygc","text":"3. 预训练数据: 10T Token 的双语工程"},{"level":3,"id":"3-1-sjgmypb","text":"3.1 数据规模与配比"},{"level":3,"id":"3-2-tycb-150k-bpe-dkyydq","text":"3.2 统一词表: 150K BPE 的跨语言对齐"},{"level":3,"id":"3-3-sjzld-jyzy-kj","text":"3.3 数据质量的「经验主义」困境"},{"level":2,"id":"4-hxl-c-rlhf-d-self-contrast","text":"4. 后训练: 从 RLHF 到 Self-Contrast"},{"level":3,"id":"4-1-dqlsx","text":"4.1 对齐流水线"},{"level":3,"id":"4-2-self-contrast-wfkdqcl","text":"4.2 Self-Contrast: 无反馈对齐策略"},{"level":3,"id":"4-3-agent-tuning-agent-nldzlwt","text":"4.3 AgentTuning: Agent 能力的指令微调"},{"level":2,"id":"5-csxwgc-long-align-y-1m-sxw","text":"5. 长上下文工程: LongAlign 与 1M 上下文"},{"level":2,"id":"6-glm-4-all-tools-zzgjtydlsxsj","text":"6. GLM-4 All Tools: 自主工具调用的流水线设计"},{"level":2,"id":"7-xndw-zwthxtymx","text":"7. 性能定位: 中文特化型通用模型"},{"level":3,"id":"7-1-xsjz","text":"7.1 学术基准"},{"level":3,"id":"7-2-zwdq-align-bench-dlxdw","text":"7.2 中文对齐: AlignBench 的领先地位"},{"level":3,"id":"7-3-agent-nl-agent-bench-dqmpg","text":"7.3 Agent 能力: AgentBench 的全面评估"},{"level":2,"id":"8-aqyfx","text":"8. 安全与风险"},{"level":2,"id":"9-mxpxdw","text":"9. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/03-glm-4/05-glm-4-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/03-glm-4/05-glm-4-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4 核心架构与中文对齐设计剖析</h1>
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
