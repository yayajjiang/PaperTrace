"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma 4 架构迭代与端侧智能设计剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Google DeepMind 官方博客、Model Card、Hugging Face 发布页. Gemma 4 未发布独立技术报告,本文基于官方已公开的技术细节进行系统性架构剖析.
发布日期: 2026 年 4 月 2 日
发布机构: Google DeepMind
许可证: Apache 2.0</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsm-google-xy-gemma-4">1. 设计动机: 为什么 Google 需要 Gemma 4</h2>
<p>Gemma 系列自 2024 年首代发布以来,累计下载量超过 4 亿次,衍生出超过 10 万个社区变体.但前三代 Gemma 面临三个结构性问题:</p>
<table>
<thead>
<tr>
<th>问题</th>
<th>Gemma 1/2/3 的状态</th>
<th>Gemma 4 的解决</th>
</tr>
</thead>
<tbody><tr>
<td>许可证限制</td>
<td>自定义 Gemma Terms,含 MAU 上限</td>
<td><strong>Apache 2.0</strong>,无上限、无限制</td>
</tr>
<tr>
<td>模态覆盖</td>
<td>纯文本或文本+图像</td>
<td>边缘层(E2B/E4B):文本+图像+<strong>音频</strong>;工作站层:文本+图像+<strong>视频</strong></td>
</tr>
<tr>
<td>架构效率</td>
<td>传统 Dense,参数量即计算量</td>
<td>引入 <strong>PLE</strong>(存储大/计算小)和 <strong>MoE</strong>(存储大/激活小)</td>
</tr>
</tbody></table>
<p>这里需要停下来想一下. Gemma 4 的许可证变更(Apache 2.0)可能比任何基准测试提升都更具战略意义. 在 Gemma 1/2/3 时代,Google 对开放模型持谨慎态度——自定义条款中的 MAU 上限和可接受使用政策给企业带来了合规不确定性. 这导致 Gemma 在企业级部署中的采用率远低于 Llama 和 Qwen. 改为 Apache 2.0 后,Gemma 4 与 Llama、Qwen、DeepSeek 站在同一竞争平面,消除了法律层面的入场障碍. 这一决策反映了 Google 对开放模型生态的重新定位:不再将 Gemma 视为 Gemini 的「降级版」,而是作为互补战略——Gemini 负责云端前沿,Gemma 负责端侧可部署性.</p>
<hr>
<h2 id="2-mxjz-scbspx">2. 模型家族: 四层部署谱系</h2>
<p>Gemma 4 家族按部署场景分为两个层级,共四个尺寸:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>有效/激活参数</th>
<th>总参数</th>
<th>上下文</th>
<th>支持模态</th>
<th>目标硬件</th>
</tr>
</thead>
<tbody><tr>
<td>E2B</td>
<td>2.3B</td>
<td>5.1B(含 PLE)</td>
<td>128K</td>
<td>文本、图像、<strong>音频</strong></td>
<td>手机、Raspberry Pi、Jetson Orin Nano</td>
</tr>
<tr>
<td>E4B</td>
<td>4.5B</td>
<td>8B(含 PLE)</td>
<td>128K</td>
<td>文本、图像、<strong>音频</strong></td>
<td>笔记本、T4 GPU</td>
</tr>
<tr>
<td>26B A4B</td>
<td>3.8B</td>
<td>25.2B</td>
<td>256K</td>
<td>文本、图像、<strong>视频</strong></td>
<td>RTX 4090/5090、消费级 GPU</td>
</tr>
<tr>
<td>31B Dense</td>
<td>30.7B</td>
<td>30.7B</td>
<td>256K</td>
<td>文本、图像、<strong>视频</strong></td>
<td>H100 80GB、工作站</td>
</tr>
</tbody></table>
<h3 id="2-1-mmtxdgchy">2.1 命名体系的工程含义</h3>
<p>Gemma 4 的命名体系比大多数模型更复杂,但每个部分都传达了关键信息:</p>
<ul>
<li><strong>E(Effective)</strong>: E2B/E4B 的「E」表示推理时实际参与计算的参数量. PLE 技术使总参数量(含 embeddings)远大于有效参数,但推理 FLOPs 与有效参数一致</li>
<li><strong>A(Active)</strong>: 26B A4B 的「A」表示 MoE 每 token 激活的参数.「26B」是存储需求,「A4B」是计算成本</li>
<li><strong>Dense</strong>: 31B 为传统稠密架构,每个前向传播激活全部参数,行为最可预测</li>
</ul>
<p>这里的设计权衡非常清晰:Google 试图用命名本身教育用户——<strong>模型选择应基于激活参数和部署约束,而非总参数</strong>. 26B A4B 的「26B」是存储标签,「A4B」才是计算真相;E2B 的「2.3B」是推理标签,「5.1B」才是能力深度.</p>
<h3 id="2-2-mtfpd-axfp-cl">2.2 模态分配的「按需分配」策略</h3>
<p>一个有趣的模态分配策略:音频能力仅限于 E2B/E4B(边缘模型),而工作站层(26B/31B)不支持音频;反之,视频能力仅支持工作站层. 这与通常的「大模型支持更多模态」直觉相反. 可能的原因包括:</p>
<ol>
<li><strong>音频-文本对齐在较小模型上更容易实现高质量</strong></li>
<li><strong>边缘场景(语音助手、实时转录)对音频需求更强烈</strong></li>
<li><strong>工作站层的目标用例(代码生成、长文档分析)对音频需求较低</strong></li>
</ol>
<p>这种「按需分配模态」的策略比「一刀切全模态」更具工程理性,但也意味着开发者无法在一个模型中获得所有模态——需要在模态覆盖和模型能力之间做选择.</p>
<hr>
<h2 id="3-jgcx-ple-y-moe">3. 架构创新: PLE 与 MoE</h2>
<h3 id="3-1-per-layer-embeddings-ple">3.1 Per-Layer Embeddings (PLE)</h3>
<p>PLE 是 Gemma 4 边缘模型的核心架构创新. 标准 Transformer 的输入嵌入为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>V</mi><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">E \\in \\mathbb{R}^{V \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span>,token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 的嵌入为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>e</mi><mi>t</mi></msub><mo>=</mo><mi>E</mi><mo stretchy="false">[</mo><mi>t</mi><mo stretchy="false">]</mo><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mi>d</mi></msup></mrow><annotation encoding="application/x-tex">e_t = E[t] \\in \\mathbb{R}^d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mopen">[</span><span class="mord mathnormal">t</span><span class="mclose">]</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span>,之后该向量通过 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 层 decoder,每层执行:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mrow><mi>l</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>+</mo><mtext>FFN</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">x_{l+1} = x_l + \\text{Attention}(\\text{LN}(x_l)) + \\text{FFN}(\\text{LN}(x_l))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">FFN</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span></span></span></span><p>PLE 为每一层 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi></mrow><annotation encoding="application/x-tex">l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span> 引入独立的嵌入表 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>l</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>V</mi><mo>×</mo><msub><mi>d</mi><mi>l</mi></msub></mrow></msup></mrow><annotation encoding="application/x-tex">E_l \\in \\mathbb{R}^{V \\times d_l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span><span class="mbin mtight">×</span><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span>,token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 的条件向量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>c</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>l</mi></mrow></msub><mo>=</mo><msub><mi>E</mi><mi>l</mi></msub><mo stretchy="false">[</mo><mi>t</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">c_{t,l} = E_l[t]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">[</span><span class="mord mathnormal">t</span><span class="mclose">]</span></span></span></span>,通过残差连接注入:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mrow><mi>l</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><msub><mi>c</mi><mrow><mo>:</mo><mo separator="true">,</mo><mi>l</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>+</mo><mtext>FFN</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><msub><mi>c</mi><mrow><mo>:</mo><mo separator="true">,</mo><mi>l</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">x_{l+1} = x_l + \\text{Attention}(\\text{LN}(x_l + c_{:,l})) + \\text{FFN}(\\text{LN}(x_l + c_{:,l}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">:</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">FFN</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">:</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span></span></span></span><p>这里需要停下来想一下. PLE 的关键洞察在于<strong>计算-存储分离</strong>. embedding tables 是 lookup 操作,不依赖输入序列长度,且每层仅读取当前层所需的一小部分权重. 相比增加隐藏维度或层数,PLE 以极低的推理开销换取了表征能力的深度. 这类似于 MoE 的「存储大、计算小」哲学,但应用于嵌入层而非 FFN 层.</p>
<p>对于边缘设备,这种设计特别有价值:<strong>闪存(存储)通常比算力更充裕</strong>. E2B 在 2-bit 量化下可运行在 1.5GB 内存内,同时携带比纯 2B 模型更深的表征能力. 但代价是模型文件更大(E2B 总参数 5.1B  vs  有效参数 2.3B),对存储空间有更高要求.</p>
<h3 id="3-2-moe-sj-128-zj-gxzj">3.2 MoE 设计: 128 专家 + 共享专家</h3>
<p>26B A4B 的 MoE 设计遵循现代稀疏 Transformer 的标准范式:</p>
<ol>
<li><p><strong>路由(Router)</strong>: 学习的路由网络计算门控分数:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>g</mi><mo>=</mo><mtext>Softmax</mtext><mo stretchy="false">(</mo><msub><mi>W</mi><mi>r</mi></msub><mo>⋅</mo><mi>h</mi><mo stretchy="false">)</mo><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><msub><mi>N</mi><mi>e</mi></msub></msup></mrow><annotation encoding="application/x-tex">g = \\text{Softmax}(W_r \\cdot h) \\in \\mathbb{R}^{N_e}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">h</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8913em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>e</mi></msub><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">N_e = 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 为专家总数.</p>
</li>
<li><p><strong>专家选择</strong>: 选择 top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">k=8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span> 专家,应用负载均衡.</p>
</li>
<li><p><strong>共享专家</strong>: 1 个共享专家始终激活,确保基础语言知识不依赖路由决策.</p>
</li>
<li><p><strong>输出聚合</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>h</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>=</mo><mtext>SharedExpert</mtext><mo stretchy="false">(</mo><mi>h</mi><mo stretchy="false">)</mo><mo>+</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mtext>top-</mtext><mi>k</mi></mrow></munder><msubsup><mi>g</mi><mi>i</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msubsup><mo>⋅</mo><msub><mtext>Expert</mtext><mi>i</mi></msub><mo stretchy="false">(</mo><mi>h</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">h&#x27; = \\text{SharedExpert}(h) + \\sum_{i \\in \\text{top-}k} g&#x27;_i \\cdot \\text{Expert}_i(h)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8019em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">SharedExpert</span></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4882em;vertical-align:-1.4382em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8479em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord text mtight"><span class="mord mtight">top-</span></span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4382em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord text"><span class="mord">Expert</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mclose">)</span></span></span></span></span></li>
</ol>
<p>与同类 MoE 模型的对比:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemma 4(26B A4B)</th>
<th>DeepSeek-V3</th>
<th>OLMoE</th>
</tr>
</thead>
<tbody><tr>
<td>总专家数</td>
<td>128</td>
<td>256</td>
<td>64</td>
</tr>
<tr>
<td>激活专家数</td>
<td>8 + 1 shared</td>
<td>8 + 1 shared</td>
<td>8</td>
</tr>
<tr>
<td>总参数</td>
<td>25.2B</td>
<td>671B</td>
<td>6.9B</td>
</tr>
<tr>
<td>激活参数</td>
<td>3.8B</td>
<td>37B</td>
<td>1.3B</td>
</tr>
<tr>
<td>负载均衡</td>
<td>隐式(未公开)</td>
<td>辅助损失</td>
<td>辅助损失 + Z-loss</td>
</tr>
</tbody></table>
<p>这里值得停下来想一下. Gemma 4 的 MoE 规模介于 OLMoE(研究导向)和 DeepSeek-V3(生产级)之间. 一个值得注意的细节是 Google <strong>未公开其负载均衡机制的具体实现</strong>(是否有显式辅助损失、容量因子等),这与 DeepSeek 和 OLMoE 的完全透明形成对比. 对于研究社区而言,这意味着难以深入分析其路由行为或复现训练结果.</p>
<p>另一个关键洞察是 MoE 的「内存-计算」双账单问题:虽然每 token 的计算 FLOPs 由激活参数决定,但<strong>存储全部专家权重所需的 GPU 内存并未减少</strong>. 26B A4B 需要约 50GB bfloat16 显存(或约 16-18GB 4-bit 量化),与加载一个 26B 稠密模型的成本相当. 真正的收益在于<strong>计算延迟</strong>而非<strong>内存占用</strong>. 对于 latency-sensitive 应用(如交互式编程助手、实时 OCR),这是正确的优化方向;但对于 memory-constrained 部署(如单卡 24GB 消费级 GPU),MoE 的优势被削弱.</p>
<hr>
<h2 id="4-dmtycsxwsj">4. 多模态与长上下文设计</h2>
<h3 id="4-1-sjysp">4.1 视觉与视频</h3>
<p>所有模型均原生处理图像,支持变量分辨率,推测仍基于 SigLIP 400M 视觉Encoder,将图像压缩为固定数量的视觉 token. 工作站层(26B/31B)支持视频输入,推测采用「视频作为帧序列」策略:将视频采样为关键帧,每帧由视觉Encoder 独立处理,然后在时间维度上拼接为长序列.</p>
<h3 id="4-2-yp-jbymx">4.2 音频(仅边缘模型)</h3>
<p>E2B/E4B 支持原生音频输入(语音识别与音频理解),最长 30 秒. 这是 Gemma 家族首次进入音频模态. 推测通过轻量化的音频Encoder 将音频转换为与文本共享的嵌入空间. 音频能力仅限于边缘模型,体现了 Google 对端侧语音交互场景的重视.</p>
<h3 id="4-3-csxw-c-128k-d-256k">4.3 长上下文: 从 128K 到 256K</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>上下文窗口</th>
<th>技术推测</th>
</tr>
</thead>
<tbody><tr>
<td>E2B/E4B</td>
<td>128K</td>
<td>可能延续 Gemma 3 的 5:1 Local:Global 注意力交错策略</td>
</tr>
<tr>
<td>26B/31B</td>
<td>256K</td>
<td>可能采用更激进的长上下文技术,YaRN 或类似 RoPE 重标定</td>
</tr>
</tbody></table>
<p>在长上下文检索基准上,Gemma 4 31B 达到 66.4%,而 Gemma 3 27B 仅为 13.5%. 这一巨大提升(约 5 倍)表明长上下文能力不仅是窗口尺寸的增加,更是注意力机制或位置编码的根本改进. 但 Google 未公开 256K 窗口的具体实现细节,这是 Gemma 4 透明度方面的又一个遗憾.</p>
<hr>
<h2 id="5-hxlnl-agentic-ddjky">5. 后训练能力: Agentic 的代际跨越</h2>
<p>Gemma 4 引入了四项关键后训练能力:</p>
<table>
<thead>
<tr>
<th>能力</th>
<th>描述</th>
<th>工程意义</th>
</tr>
</thead>
<tbody><tr>
<td>原生 Function Calling</td>
<td>直接输出结构化工具调用</td>
<td>消除 prompt 模拟的误差累积</td>
</tr>
<tr>
<td>结构化 JSON 输出</td>
<td>约束解码生成符合 JSON Schema</td>
<td>无需外部验证器或重试</td>
</tr>
<tr>
<td>Thinking Mode</td>
<td>可配置的速度-深度推理 trade-off</td>
<td>类似轻量级推理链生成</td>
</tr>
<tr>
<td>系统指令</td>
<td>原生支持系统级行为设定</td>
<td>不污染用户提示</td>
</tr>
</tbody></table>
<p><strong>Agentic 能力的代际跨越</strong>是最引人注目的结果. 在 τ2-bench(agentic 工具使用基准)上:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>τ2-bench</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 3 27B</td>
<td>6.6%</td>
</tr>
<tr>
<td><strong>Gemma 4 31B</strong></td>
<td><strong>86.4%</strong></td>
</tr>
</tbody></table>
<p>这不是渐进式改进,而是能力涌现——提升了约 13 倍. 可能的原因包括:(1)训练数据中有意增加了多步工具调用轨迹;(2)后训练阶段引入了专门针对 agentic 场景的 RL;(3)Function calling 的原生支持消除了 prompt 模拟的误差累积. Google 明确将 agentic workflows 列为 Gemma 4 的核心定位,这一基准结果验证了其训练投入的有效性.</p>
<hr>
<h2 id="6-xndw-csxsdzxdy">6. 性能定位: 参数效率的重新定义</h2>
<h3 id="6-1-bzjz">6.1 标准基准</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>Gemma 3 27B</th>
<th>Gemma 4 E4B</th>
<th>Gemma 4 26B A4B</th>
<th>Gemma 4 31B</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2026</td>
<td>20.8%</td>
<td>42.5%</td>
<td>88.3%</td>
<td><strong>89.2%</strong></td>
</tr>
<tr>
<td>LiveCodeBench v6</td>
<td>29.1%</td>
<td>52.0%</td>
<td>77.1%</td>
<td><strong>80.0%</strong></td>
</tr>
<tr>
<td>MMLU Pro</td>
<td>-</td>
<td>~69.4%</td>
<td>82.6%</td>
<td><strong>85.2%</strong></td>
</tr>
<tr>
<td>τ2-bench</td>
<td>6.6%</td>
<td>-</td>
<td>-</td>
<td><strong>86.4%</strong></td>
</tr>
<tr>
<td>长上下文检索</td>
<td>13.5%</td>
<td>-</td>
<td>-</td>
<td><strong>66.4%</strong></td>
</tr>
</tbody></table>
<p>三个显著的模式:</p>
<ol>
<li><p><strong>推理能力的代际飞跃</strong>: AIME 2026 从 Gemma 3 27B 的 20.8% 提升到 Gemma 4 31B 的 89.2%,提升超过 4 倍. 这一跨越远超参数规模增长所能解释的范围(27B → 31B 仅增加 15% 参数),表明训练方法论发生了根本性变化.</p>
</li>
<li><p><strong>MoE 的效率验证</strong>: 26B A4B 在 AIME(88.3% vs 89.2%)、LiveCodeBench(77.1% vs 80.0%)、MMLU Pro(82.6% vs 85.2%)上均接近 31B Dense 的水平,但激活参数仅为后者的 12.4%(3.8B vs 30.7B). 这验证了 MoE「以存储换计算」的效率承诺——在实际质量损失 &lt;5% 的前提下,计算成本降低约 87%.</p>
</li>
<li><p><strong>边缘模型的可用性突破</strong>: E4B 的 AIME 得分(42.5%)已超过 Gemma 3 27B(20.8%)的两倍,尽管有效参数仅为 4.5B. PLE 架构的有效性在此得到验证.</p>
</li>
</ol>
<h3 id="6-2-arena-ai-rlpg">6.2 Arena AI 人类评估</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>Arena ELO</th>
<th>全球开放模型排名</th>
<th>参数规模</th>
</tr>
</thead>
<tbody><tr>
<td>Gemma 4 31B</td>
<td><strong>1452</strong></td>
<td><strong>#3</strong></td>
<td>30.7B Dense</td>
</tr>
<tr>
<td>Gemma 4 26B A4B</td>
<td>1441</td>
<td>#6</td>
<td>25.2B MoE(3.8B active)</td>
</tr>
<tr>
<td>Qwen 3.5 27B</td>
<td>1403</td>
<td>-</td>
<td>27B</td>
</tr>
<tr>
<td>DeepSeek-V3.2</td>
<td>~1425</td>
<td>-</td>
<td>~320B MoE</td>
</tr>
<tr>
<td>Gemma 3 27B</td>
<td>1365</td>
<td>-</td>
<td>27B</td>
</tr>
</tbody></table>
<p>Gemma 4 31B 的 ELO 1452 不仅超过了参数规模相当的 Qwen 3.5 27B(ELO 1403),也逼近了参数量 10 倍以上的 DeepSeek-V3.2(~1425). 在性能-参数散点图上,Gemma 4 位于「左上」最优区域:高 ELO、低参数. 这一定位验证了 Google 的「intelligence-per-parameter」策略.</p>
<hr>
<h2 id="7-bsyyjsp">7. 部署与硬件适配</h2>
<h3 id="7-1-bybs">7.1 边缘部署</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>量化格式</th>
<th>内存占用</th>
<th>目标设备</th>
</tr>
</thead>
<tbody><tr>
<td>E2B</td>
<td>2-bit GGUF</td>
<td>~1.5GB</td>
<td>Raspberry Pi 5、Android 手机</td>
</tr>
<tr>
<td>E4B</td>
<td>4-bit GGUF</td>
<td>~5GB</td>
<td>笔记本、Jetson Orin Nano</td>
</tr>
<tr>
<td>E4B</td>
<td>8-bit</td>
<td>~8GB</td>
<td>高端笔记本、T4 GPU</td>
</tr>
</tbody></table>
<p>E2B 在 2-bit 量化下可运行在 1.5GB 内存内,这是目前能在如此低内存下运行的最强开放模型之一. Android 开发者可通过 AICore Developer Preview 在设备端 prototype agentic 工作流.</p>
<h3 id="7-2-gzzbs">7.2 工作站部署</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>精度</th>
<th>显存需求</th>
<th>目标硬件</th>
</tr>
</thead>
<tbody><tr>
<td>26B A4B</td>
<td>4-bit(Q4_K_M)</td>
<td>~16-18GB</td>
<td>RTX 4090(24GB)、Mac Studio</td>
</tr>
<tr>
<td>31B</td>
<td>4-bit</td>
<td>~20GB</td>
<td>RTX 4090(24GB)</td>
</tr>
<tr>
<td>31B</td>
<td>bfloat16</td>
<td>~62GB</td>
<td>H100 80GB</td>
</tr>
</tbody></table>
<p>26B A4B 是消费级 GPU 部署的性价比最优解:在 RTX 4090 的 24GB 显存内运行,质量接近 31B,但计算延迟更低. 31B Dense 是最佳微调基底——无路由、无 tricks,行为最可预测.</p>
<hr>
<h2 id="8-jxytmdwt">8. 局限与透明度问题</h2>
<h3 id="8-1-wdljsbg">8.1 无独立技术报告</h3>
<p>Gemma 4 仅有 Model Card 和博客发布,未发布如 Gemma 3(arXiv:2503.19786)那样的独立技术报告. 这导致许多架构细节无法完全验证:</p>
<ul>
<li>PLE 的确切实现(条件向量的维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>l</mi></msub></mrow><annotation encoding="application/x-tex">d_l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>、是否所有层都使用 PLE)</li>
<li>MoE 的路由算法细节(负载均衡机制、容量因子、是否 dropless)</li>
<li>256K 长上下文的具体实现(YaRN、NTK-aware 或其他)</li>
<li>训练数据构成、混合比例、过滤策略</li>
</ul>
<h3 id="8-2-y-olmo-deep-seek-dtmddb">8.2 与 OLMo/DeepSeek 的透明度对比</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemma 4</th>
<th>OLMoE</th>
<th>DeepSeek-V3</th>
</tr>
</thead>
<tbody><tr>
<td>模型权重</td>
<td>开源</td>
<td>开源</td>
<td>开源</td>
</tr>
<tr>
<td>训练数据</td>
<td>未公开</td>
<td>完全公开</td>
<td>部分公开</td>
</tr>
<tr>
<td>训练代码</td>
<td>未公开</td>
<td>完全公开</td>
<td>未公开</td>
</tr>
<tr>
<td>训练日志</td>
<td>未公开</td>
<td>完全公开</td>
<td>未公开</td>
</tr>
<tr>
<td>技术报告</td>
<td>无</td>
<td>有(arXiv)</td>
<td>有(arXiv)</td>
</tr>
<tr>
<td>中间Checkpoint</td>
<td>未公开</td>
<td>每 5000 步</td>
<td>未公开</td>
</tr>
</tbody></table>
<p>Gemma 4 在「开放程度」上属于「权重开放+黑盒训练」类型,与 Llama 4(Model Card+源码)类似,但远不如 OLMo 家族的完全白盒开放.</p>
<h3 id="8-3-mtfpdc">8.3 模态分配断层</h3>
<p>边缘模型(E2B/E4B)支持音频但不支持视频,工作站模型(26B/31B)支持视频但不支持音频. 这种「二选一」的模态分配意味着开发者无法在一个模型中同时处理音频和视频——需要为不同模态加载不同模型或进行复杂的多模型编排.</p>
<hr>
<h2 id="9-mxpxdw">9. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Gemma 3(SigLIP 视觉Encoder、多模态基础、5:1 Local:Global 注意力)</li>
<li><strong>核心创新</strong>:<ul>
<li>Per-Layer Embeddings(PLE):计算-存储分离的嵌入层设计</li>
<li>MoE 架构首次引入 Gemma 家族(128 专家+共享专家)</li>
<li>音频模态首次支持(E2B/E4B)</li>
<li>视频模态扩展至工作站层(26B/31B)</li>
<li>Apache 2.0 许可证变更</li>
<li>Agentic 能力代际跨越(τ2-bench 86.4%)</li>
</ul>
</li>
<li><strong>同期可比模型</strong>:<ul>
<li>Llama 4(MoE+多模态,但无音频)</li>
<li>Qwen 3.5 27B(Dense,参数规模相当)</li>
<li>DeepSeek-V3.2(MoE,参数量大 10 倍)</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>PLE 架构可能启发更多端侧模型的嵌入层设计</li>
<li>Apache 2.0 许可证可能推动 Google 其他开放产品采用更宽松条款</li>
<li>Agentic 能力的训练方法可能为社区提供参考</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档基于 Gemma 4 官方博客、Model Card 及配套公开资料进行技术剖析. 由于 Gemma 4 未发布独立技术报告,部分架构细节基于推测,可能存在理解偏差.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsm-google-xy-gemma-4","text":"1. 设计动机: 为什么 Google 需要 Gemma 4"},{"level":2,"id":"2-mxjz-scbspx","text":"2. 模型家族: 四层部署谱系"},{"level":3,"id":"2-1-mmtxdgchy","text":"2.1 命名体系的工程含义"},{"level":3,"id":"2-2-mtfpd-axfp-cl","text":"2.2 模态分配的「按需分配」策略"},{"level":2,"id":"3-jgcx-ple-y-moe","text":"3. 架构创新: PLE 与 MoE"},{"level":3,"id":"3-1-per-layer-embeddings-ple","text":"3.1 Per-Layer Embeddings (PLE)"},{"level":3,"id":"3-2-moe-sj-128-zj-gxzj","text":"3.2 MoE 设计: 128 专家 + 共享专家"},{"level":2,"id":"4-dmtycsxwsj","text":"4. 多模态与长上下文设计"},{"level":3,"id":"4-1-sjysp","text":"4.1 视觉与视频"},{"level":3,"id":"4-2-yp-jbymx","text":"4.2 音频(仅边缘模型)"},{"level":3,"id":"4-3-csxw-c-128k-d-256k","text":"4.3 长上下文: 从 128K 到 256K"},{"level":2,"id":"5-hxlnl-agentic-ddjky","text":"5. 后训练能力: Agentic 的代际跨越"},{"level":2,"id":"6-xndw-csxsdzxdy","text":"6. 性能定位: 参数效率的重新定义"},{"level":3,"id":"6-1-bzjz","text":"6.1 标准基准"},{"level":3,"id":"6-2-arena-ai-rlpg","text":"6.2 Arena AI 人类评估"},{"level":2,"id":"7-bsyyjsp","text":"7. 部署与硬件适配"},{"level":3,"id":"7-1-bybs","text":"7.1 边缘部署"},{"level":3,"id":"7-2-gzzbs","text":"7.2 工作站部署"},{"level":2,"id":"8-jxytmdwt","text":"8. 局限与透明度问题"},{"level":3,"id":"8-1-wdljsbg","text":"8.1 无独立技术报告"},{"level":3,"id":"8-2-y-olmo-deep-seek-dtmddb","text":"8.2 与 OLMo/DeepSeek 的透明度对比"},{"level":3,"id":"8-3-mtfpdc","text":"8.3 模态分配断层"},{"level":2,"id":"9-mxpxdw","text":"9. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/04-gemma-4/05-gemma-4-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/04-gemma-4/05-gemma-4-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma 4 架构迭代与端侧智能设计剖析</h1>
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
