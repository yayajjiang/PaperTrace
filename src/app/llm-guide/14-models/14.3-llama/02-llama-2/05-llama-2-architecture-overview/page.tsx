"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama 2 核心架构与对齐技术剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Llama 2: Open Foundation and Fine-Tuned Chat Models
原文链接: <a href="https://arxiv.org/abs/2307.09288">https://arxiv.org/abs/2307.09288</a>
发布日期: 2023 年 7 月
发布机构: Meta AI</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsm-llama-2-syc-kycph-dlcb">1. 设计动机: 为什么 Llama 2 是一次「开源产品化」的里程碑</h2>
<p>Llama 1 的发布(2023 年 2 月)在学术界引发了地震——一个 65B 参数的 Dense 模型在大多数基准上超越了 GPT-3,且完全开源供研究使用.但 Llama 1 存在三个根本性问题,使其无法真正替代闭源「产品级」模型如 ChatGPT 和 Claude:</p>
<table>
<thead>
<tr>
<th>问题</th>
<th>Llama 1 的状态</th>
<th>Llama 2 的解决</th>
</tr>
</thead>
<tbody><tr>
<td>许可证限制</td>
<td>研究许可证,禁止商用</td>
<td>新许可证:月活 &lt; 7 亿的公司可商用</td>
</tr>
<tr>
<td>对话能力</td>
<td>仅提供基座模型,无对话优化</td>
<td>Llama 2-Chat:完整 SFT + RLHF 流水线</td>
</tr>
<tr>
<td>安全性</td>
<td>无系统级安全对齐</td>
<td>双奖励模型、红队测试、Context Distillation</td>
</tr>
</tbody></table>
<p>这里需要停下来想一下.Llama 2 的核心创新不在于基础架构——它仍然是标准的 Decoder-only Transformer,使用 RMSNorm、SwiGLU、RoPE——而在于其「产品化」的完整性.Meta 意识到,开源社区需要的不仅是「能用的模型权重」,还需要「能直接部署的 AI 助手」.这意味着必须解决对齐(alignment)问题:如何让模型既 helpful 又 safe,既遵循指令又保持多轮一致性.Llama 2 的论文花了超过 60% 的篇幅描述微调方法和安全改进,这本身就说明了其技术重心已从「预训练 scaling」转向「后训练对齐」.</p>
<p>从后续影响看,这一策略极其成功.Llama 2 发布后的几个月内,基于它的微调模型(Vicuna、WizardLM、CodeLlama 等)迅速占据了开源 LLM 生态的主导地位,形成了事实上的开源标准.</p>
<hr>
<h2 id="2-yxljgyj-c-llama-1-d-llama-2-dwsgj">2. 预训练架构演进: 从 Llama 1 到 Llama 2 的务实改进</h2>
<h3 id="2-1-csgmyxlsj">2.1 参数规模与训练数据</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>训练数据</th>
<th>参数量</th>
<th>上下文长度</th>
<th>GQA</th>
<th>Token 数</th>
<th>学习率</th>
</tr>
</thead>
<tbody><tr>
<td>LLaMA-1-7B</td>
<td>公开网络数据</td>
<td>7B</td>
<td>2K</td>
<td>-</td>
<td>1.0T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>LLaMA-1-13B</td>
<td></td>
<td>13B</td>
<td>2K</td>
<td>-</td>
<td>1.0T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>LLaMA-1-33B</td>
<td></td>
<td>33B</td>
<td>2K</td>
<td>-</td>
<td>1.4T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>LLaMA-1-65B</td>
<td></td>
<td>65B</td>
<td>2K</td>
<td>-</td>
<td>1.4T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>Llama 2-7B</td>
<td>新的公开数据混合</td>
<td>7B</td>
<td>4K</td>
<td>-</td>
<td>2.0T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>Llama 2-13B</td>
<td></td>
<td>13B</td>
<td>4K</td>
<td>-</td>
<td>2.0T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>Llama 2-34B</td>
<td></td>
<td>34B</td>
<td>4K</td>
<td>Yes</td>
<td>2.0T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
<tr>
<td>Llama 2-70B</td>
<td></td>
<td>70B</td>
<td>4K</td>
<td>Yes</td>
<td>2.0T</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.5</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.5 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span></td>
</tr>
</tbody></table>
<p>Llama 2 相对于 Llama 1 的预训练改进可以概括为「三个翻倍、一个新增」:</p>
<ol>
<li><strong>上下文长度翻倍</strong>: 从 2K 到 4K.在 2023 年初,2K 是标准配置,但 ChatGPT 已支持更长上下文.4K 让 Llama 2 在对话场景中更具竞争力.</li>
<li><strong>训练数据量翻倍</strong>: 从 1.0~1.4T 到 2.0T token.对事实性来源进行上采样,以增加知识并抑制幻觉.</li>
<li><strong>数据清洗更鲁棒</strong>: 新的公开数据混合,排除了已知包含大量个人信息的网站.</li>
<li><strong>新增 GQA</strong>: 仅用于 34B 和 70B 模型.</li>
</ol>
<h3 id="2-2-gqa-tlxsdgjgj">2.2 GQA: 推理效率的关键改进</h3>
<p>Grouped-Query Attention(GQA)是 Llama 2 在架构层面最显著的创新.标准 Multi-Head Attention(MHA)中,每个 Query 头对应独立的 Key 和 Value 头.对于 70B 模型,这在长序列推理中成为显存瓶颈——KV Cache 的大小与头数成正比.</p>
<p>GQA 将 Query 头分组,每组共享一组 KV 头.例如,8 个 Query 头共享 1 个 KV 头:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>GQA</mtext><mo stretchy="false">(</mo><mi>Q</mi><mo separator="true">,</mo><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msubsup><mi>K</mi><mi>G</mi><mi>T</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><msub><mi>V</mi><mi>G</mi></msub></mrow><annotation encoding="application/x-tex">\\text{GQA}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K_G^T}{\\sqrt{d_k}}\\right) V_G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">GQA</span></span><span class="mopen">(</span><span class="mord mathnormal">Q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.4247em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2753em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>K</mi><mi>G</mi></msub></mrow><annotation encoding="application/x-tex">K_G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>V</mi><mi>G</mi></msub></mrow><annotation encoding="application/x-tex">V_G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是共享的分组 KV 投影.</p>
<p>这里的设计权衡非常清晰:GQA 是 MHA 向 MQA(Multi-Query Attention,所有 Query 共享单个 KV 头)的折中.MQA 推理最快但质量下降明显;MHA 质量最好但 KV Cache 最大.GQA 在质量和效率之间取了实用的平衡点.Llama 2 仅在 34B 和 70B 上使用 GQA,因为较小模型的 KV Cache 压力不大——这体现了「按需优化」的工程哲学.</p>
<p>从后续发展看,GQA 被 Llama 3、Gemma、OLMo 等模型广泛采用,成为开源 LLM 的默认选择.后续模型如 DeepSeek-V2/V3 的 MLA 可以视为 GQA 的进一步演进——从「头的维度」共享 KV 扩展到「特征维度的低秩压缩」.</p>
<h3 id="2-3-xljcss-roce-vs-infini-band">2.3 训练基础设施: RoCE  vs. InfiniBand</h3>
<p>Llama 2 的预训练在 Meta 的两个集群上进行:</p>
<table>
<thead>
<tr>
<th>集群</th>
<th>互联类型</th>
<th>每 GPU 功耗</th>
</tr>
</thead>
<tbody><tr>
<td>RSC(Research Super Cluster)</td>
<td>NVIDIA Quantum InfiniBand</td>
<td>400W</td>
</tr>
<tr>
<td>生产集群</td>
<td>RoCE(RDMA over converged Ethernet)</td>
<td>350W</td>
</tr>
</tbody></table>
<p>两种方案都互联 200 Gbps 端点.关键发现是:RoCE 在多达 2000 GPU 时几乎可以像 InfiniBand 一样良好扩展.</p>
<p>这里值得停下来想一下.InfiniBand 一直是高性能计算的黄金标准,但其成本极高(交换机、线缆、网卡都价格不菲).RoCE 使用标准以太网交换机,成本大幅降低.Meta 的实验表明,在 2000 GPU 规模下,RoCE 的性能接近 InfiniBand——这意味着对于绝大多数研究机构和企业,没有必要投资昂贵的 InfiniBand 基础设施来进行 LLM 预训练.这一发现极大地降低了进入 LLM 预训练领域的门槛,也是 Llama 2 论文中一个被低估但影响深远的贡献.</p>
<h3 id="2-4-yxlpgdw">2.4 预训练评估定位</h3>
<p>Llama 2-70B 在预训练后评估中全面领先开源基座模型:</p>
<table>
<thead>
<tr>
<th>类别</th>
<th>Benchmark</th>
<th>Llama 2-70B</th>
<th>LLaMA-1-65B</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>代码</td>
<td>MBPP</td>
<td>37.5</td>
<td>30.7</td>
<td>+6.8</td>
</tr>
<tr>
<td>常识推理</td>
<td>HellaSwag</td>
<td>71.9</td>
<td>70.7</td>
<td>+1.2</td>
</tr>
<tr>
<td>世界知识</td>
<td>TriviaQA</td>
<td>63.6</td>
<td>60.5</td>
<td>+3.1</td>
</tr>
<tr>
<td>阅读理解</td>
<td>SQuAD</td>
<td>69.4</td>
<td>68.6</td>
<td>+0.8</td>
</tr>
<tr>
<td>数学</td>
<td>GSM8K</td>
<td>35.2</td>
<td>30.8</td>
<td>+4.4</td>
</tr>
<tr>
<td>综合知识</td>
<td>MMLU</td>
<td>68.9</td>
<td>63.4</td>
<td>+5.5</td>
</tr>
<tr>
<td>推理</td>
<td>BBH</td>
<td>51.2</td>
<td>43.5</td>
<td>+7.7</td>
</tr>
</tbody></table>
<p>但 Llama 2-70B 与 GPT-4(MMLU 86.4、GSM8K 92.0)和 PaLM-2-L(MMLU 78.3)之间仍有显著差距.特别是在代码生成(HumanEval 29.9 vs GPT-4 67.0)和数学推理(GSM8K 56.8 vs GPT-4 92.0)上,差距最为明显.这说明基础模型能力很强,但专门的优化(如代码微调、数学强化)还有很大提升空间——这也正是 CodeLlama 等后续项目的发力方向.</p>
<hr>
<h2 id="3-rlhf-lsx-sjlmxyddjjcy">3. RLHF 流水线: 双奖励模型与迭代拒绝采样</h2>
<h3 id="3-1-sft-zlyxdsjcl">3.1 SFT: 质量优先的数据策略</h3>
<p>Llama 2 的 SFT 阶段有一个核心发现:<strong>27,540 条高质量标注超越了数百万条低质量第三方数据的效果</strong>.这与 LIMA 论文(&quot;Less Is More for Alignment&quot;)的结论相互印证.</p>
<p>关键细节:</p>
<ul>
<li>学习率: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">2 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>(远低于预训练的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>)</li>
<li>权重衰减: 0.1</li>
<li>Batch size: 64</li>
<li>序列长度: 4096 token</li>
<li>Epoch: 2</li>
<li>损失设计: 用户提示中的 token 损失置零,只反向传播答案 token</li>
</ul>
<p>从工程角度看,这意味着指令微调阶段的投资重点应该是质量控制和标注指南设计,而非盲目扩充数据量.一个有趣的细节是,团队发现 SFT 模型的输出质量经常能与人类手写标注竞争,这促使他们将更多标注资源转向 RLHF 的偏好标注——这是资源分配策略上的重要调整.</p>
<h3 id="3-2-sjlmx-flyyxyaqx">3.2 双奖励模型: 分离有用性与安全性</h3>
<p>Llama 2 训练了两个独立的奖励模型:</p>
<ul>
<li><strong>Helpfulness RM</strong>: 针对有用性优化,在 Meta Helpfulness 数据 + 等量开源数据上训练</li>
<li><strong>Safety RM</strong>: 针对安全性优化,在 Meta Safety + Anthropic Harmless 数据上训练</li>
</ul>
<p>二元排名损失的标准形式:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>ranking</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>σ</mi><mo stretchy="false">(</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>c</mi></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>r</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{ranking}} = -\\log(\\sigma(r_\\theta(x,y_{c}) - r_\\theta(x,y_{r}))) \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ranking</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)))</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>Llama 2 的改进版本引入了 margin:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>ranking</mtext></msub><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>σ</mi><mo stretchy="false">(</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>c</mi></msub><mo stretchy="false">)</mo><mo>−</mo><msub><mi>r</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>r</mi></msub><mo stretchy="false">)</mo><mo>−</mo><mi>m</mi><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{ranking}} = -\\log(\\sigma(r_\\theta(x,y_{c}) - r_\\theta(x,y_{r}) - m(r))) \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ranking</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">m</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)))</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 margin <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo stretchy="false">(</mo><mi>r</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">m(r)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">m</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mclose">)</span></span></span></span> 是人类偏好评级的离散函数:显著更好 → 大 margin,几乎相同 → 小 margin.</p>
<p>这里需要停下来想一下.标准二元排名损失只关心 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">y_c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的分数是否高于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>r</mi></msub></mrow><annotation encoding="application/x-tex">y_r</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,不关心高多少.但人类标注的四级评级(显著更好/更好/稍好/几乎相同)包含了丰富的信号.通过引入与偏好强度成正比的 margin,损失函数强制奖励模型学习「置信度」——不仅知道哪个更好,还知道好多少.这提高了奖励模型的判别能力和稳定性,是一个低成本但高回报的改进.</p>
<p>奖励模型的评估结果也验证了分离策略的有效性:</p>
<table>
<thead>
<tr>
<th>RM</th>
<th>Meta Helpful</th>
<th>Meta Safety</th>
<th>Anthropic Helpful</th>
<th>Anthropic Harmless</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>GPT-4</td>
<td>58.6</td>
<td>58.1</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Safety RM</td>
<td>56.2</td>
<td><strong>64.5</strong></td>
<td>55.4</td>
<td><strong>74.7</strong></td>
<td>64.3</td>
</tr>
<tr>
<td>Helpfulness RM</td>
<td><strong>63.2</strong></td>
<td>62.8</td>
<td><strong>72.0</strong></td>
<td>71.0</td>
<td><strong>70.6</strong></td>
</tr>
</tbody></table>
<p>Helpfulness RM 在平均上超越了 GPT-4,Safety RM 在安全数据集上表现最优.</p>
<h3 id="3-3-dd-rlhf-rejection-sampling-ppo">3.3 迭代 RLHF: Rejection Sampling + PPO</h3>
<p>Llama 2 的 RLHF 不是一次性完成的,而是通过 5 轮迭代(RLHF-V1 到 V5)逐步改进:</p>
<table>
<thead>
<tr>
<th>迭代</th>
<th>主要方法</th>
<th>关键改进</th>
</tr>
</thead>
<tbody><tr>
<td>V1~V4</td>
<td>Rejection Sampling</td>
<td>从模型采样 K 个输出,用奖励模型选择最佳进行微调</td>
</tr>
<tr>
<td>V4~V5</td>
<td>Rejection Sampling + PPO</td>
<td>在 RS Checkpoint上应用 PPO,进一步精细优化</td>
</tr>
</tbody></table>
<p><strong>Rejection Sampling</strong> 的核心机制:</p>
<ul>
<li>对每个提示采样 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 个答案(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi><mo>∈</mo><mo stretchy="false">[</mo><mn>10</mn><mo separator="true">,</mo><mn>100</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">K \\in [10, 100]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">10</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">100</span><span class="mclose">]</span></span></span></span>)</li>
<li>使用当前最佳奖励模型为每个样本打分</li>
<li>选择最高分答案作为新的 gold standard</li>
<li>用选定输出进行 SFT 式微调</li>
</ul>
<p>温度参数在迭代中动态调整:最优温度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>∈</mo><mo stretchy="false">[</mo><mn>1.2</mn><mo separator="true">,</mo><mn>1.3</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">T \\in [1.2, 1.3]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1.2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1.3</span><span class="mclose">]</span></span></span></span>,高于常规采样的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>=</mo><mn>0.7</mn></mrow><annotation encoding="application/x-tex">T=0.7</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.7</span></span></span></span>.更高的温度使采样更多样化,从而增加找到高质量候选的概率.</p>
<p>一个重要的工程细节是:Rejection Sampling 只对最大的 70B 模型执行,较小模型在 70B 模型的拒绝采样数据上微调——这是一种自然的能力蒸馏机制.</p>
<p><strong>PPO</strong> 阶段的目标:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>arg</mi><mo>⁡</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>π</mi></munder><msub><mi mathvariant="double-struck">E</mi><mrow><mi>p</mi><mo>∼</mo><mi mathvariant="script">D</mi><mo separator="true">,</mo><mi>g</mi><mo>∼</mo><mi>π</mi></mrow></msub><mo stretchy="false">[</mo><mi>R</mi><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo stretchy="false">]</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\arg \\max _\\pi \\mathbb{E}_{p \\sim \\mathcal{D}, g \\sim \\pi}[R(g \\mid p)] \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.45em;vertical-align:-0.7em;"></span><span class="mop">ar<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.4em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mrel mtight">∼</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">[</span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)]</span></span><span class="tag"><span class="strut" style="height:1.45em;vertical-align:-0.7em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>最终奖励函数包含 KL 惩罚:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi>R</mi><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mover accent="true"><mi>R</mi><mo>~</mo></mover><mi>c</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>−</mo><mi>β</mi><msub><mi>D</mi><mrow><mi>K</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>∥</mo><msub><mi>π</mi><mn>0</mn></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">R(g \\mid p) = \\tilde{R}_{c}(g \\mid p) - \\beta D_{KL}(\\pi_{\\theta}(g \\mid p) \\parallel \\pi_{0}(g \\mid p)) \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1702em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9202em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span></span><span style="top:-3.6023em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">~</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">D</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">))</span></span><span class="tag"><span class="strut" style="height:1.1702em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>KL 惩罚对训练稳定性和减少 reward hacking 至关重要.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 随模型规模调整:7B/13B 使用 0.01,34B/70B 使用 0.005——更大的模型需要更小的 KL 约束,因为它们的策略空间更复杂,过强的约束会限制优化空间.</p>
<h3 id="3-4-fdjlhs-zsydaq-yyph">3.4 分段奖励函数: 自适应的安全-有用平衡</h3>
<p>Llama 2 的核心创新之一是分段奖励函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mi>c</mi></msub></mrow><annotation encoding="application/x-tex">R_c</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>,它根据提示的安全性自适应地选择使用哪个奖励模型:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mi>c</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>R</mi><mi>s</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mstyle mathcolor="#cc0000"><mtext>\\textsc</mtext></mstyle><mrow><mi>i</mi><mi>s</mi><mi mathvariant="normal">_</mi><mi>s</mi><mi>a</mi><mi>f</mi><mi>e</mi><mi>t</mi><mi>y</mi></mrow><mo stretchy="false">(</mo><mi>p</mi><mo stretchy="false">)</mo><mtext> or </mtext><msub><mi>R</mi><mi>s</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo><mo>&lt;</mo><mn>0.15</mn></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>R</mi><mi>h</mi></msub><mo stretchy="false">(</mo><mi>g</mi><mo>∣</mo><mi>p</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">R_c(g \\mid p) = \\begin{cases}
R_s(g \\mid p) &amp; \\text{if } \\textsc{is\\_safety}(p) \\text{ or } R_s(g \\mid p) &lt; 0.15 \\\\
R_h(g \\mid p) &amp; \\text{otherwise}
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">c</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord text" style="color:#cc0000;"><span class="mord" style="color:#cc0000;">\\textsc</span></span><span class="mord"><span class="mord mathnormal">i</span><span class="mord mathnormal">s</span><span class="mord" style="margin-right:0.0278em;">_</span><span class="mord mathnormal">s</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mord mathnormal">e</span><span class="mord mathnormal">t</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span></span><span class="mopen">(</span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mord text"><span class="mord"> or </span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">p</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0.15</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中阈值 0.15 对应于 Meta Safety 测试集上精确率 0.89、召回率 0.55.</p>
<p>这里的设计权衡值得深入分析.有用性和安全性之间存在根本性 tension:最「有用」的响应可能包含危险信息(如炸弹制作),而最「安全」的响应可能过度拒绝合法请求.通过为对抗性提示优先使用 Safety RM,为正常提示使用 Helpfulness RM,系统实现了自适应的平衡.但阈值 0.15 的选择偏向保守——宁可误杀(将安全响应标记为不安全)也不放过真正的有害内容.这种保守主义虽然提升了安全性,但也导致了后续用户抱怨的「过度拒绝」问题.在后续模型(如 Llama 3)中,Meta 明显降低了误拒率,可以看作是对这一保守策略的修正.</p>
<hr>
<h2 id="4-ghost-attention-dlyzxddcbfa">4. Ghost Attention: 多轮一致性的低成本方案</h2>
<h3 id="4-1-wt-xtxxyw">4.1 问题: 系统消息遗忘</h3>
<p>在对话设置中,初始系统消息(如「扮演某个公众人物」或「用俳句回答」)应在所有轮次中持续生效.但 Llama 2-Chat 的初始 RLHF 模型在几轮对话后就会「遗忘」初始指令.</p>
<h3 id="4-2-gatt-ff">4.2 GAtt 方法</h3>
<p>Ghost Attention(GAtt)是一种受 Context Distillation 启发的数据构造技术:</p>
<ol>
<li><strong>训练时</strong>: 将指令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi><mi>n</mi><mi>s</mi><mi>t</mi></mrow><annotation encoding="application/x-tex">inst</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">in</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span></span></span></span> 添加到所有用户消息中,合成数据为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mi>i</mi><mi>n</mi><mi>s</mi><mi>t</mi><mo>+</mo><msub><mi>u</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>a</mi><mn>1</mn></msub><mo separator="true">,</mo><mi>i</mi><mi>n</mi><mi>s</mi><mi>t</mi><mo>+</mo><msub><mi>u</mi><mn>2</mn></msub><mo separator="true">,</mo><msub><mi>a</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>…</mo><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[inst+u_1, a_1, inst+u_2, a_2, \\ldots]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord mathnormal">in</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">in</span><span class="mord mathnormal">s</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mclose">]</span></span></span></span></li>
<li><strong>损失屏蔽</strong>: 在中间轮次中,将前几轮所有 token 的损失设为 0(包括助手消息)</li>
<li><strong>采样</strong>: 使用最新 RLHF 模型从合成数据中采样,获得一致的对话轨迹</li>
</ol>
<p>GAtt 的巧妙之处在于「幽灵效果」——模型在训练时看到指令无处不在,但只在第一轮显式地优化指令遵循,后续轮次通过注意力机制隐式地保持对指令的「记忆」.</p>
<h3 id="4-3-xg">4.3 效果</h3>
<p>定量分析表明 GAtt 在多达 20+ 轮中保持一致,直到达到最大上下文长度.更有趣的是,即使推理时设置 GAtt 训练中不存在的约束(如「始终用俳句回答」),模型仍然保持一致——这说明 GAtt 学到的不是特定指令的记忆,而是一种「遵循系统指令的元能力」.</p>
<p>从工程角度看,GAtt 是一个零架构改动的解决方案,仅通过巧妙地构造训练数据就解决了多轮一致性问题.这体现了「数据工程即模型工程」的理念——在 Transformer 架构基本固定的情况下,数据构造策略往往比架构修改更能带来实质性的能力提升.</p>
<hr>
<h2 id="5-aqdq-context-distillation-yhdcs">5. 安全对齐: Context Distillation 与红队测试</h2>
<h3 id="5-1-aq-sft-y-rlhf">5.1 安全 SFT 与 RLHF</h3>
<p>Llama 2 的安全对齐流程与有用性对齐并行:</p>
<ul>
<li><strong>安全 SFT</strong>: 收集对抗性提示,要求标注者写安全和不安全的响应,进行监督微调</li>
<li><strong>安全 RLHF</strong>: 使用安全奖励模型在对抗性数据上训练,偏好安全响应</li>
<li><strong>Context Distillation</strong>: 在安全系统提示存在下采样,然后在没有系统提示的情况下微调模型以生成相同输出——将系统提示的约束「蒸馏」到模型本身中</li>
</ul>
<p>Context Distillation 的价值在于:它使模型在没有显式系统提示的情况下也能表现出安全行为.这意味着即使开发者忘记设置安全系统提示,模型仍具有一定的自我保护能力.</p>
<h3 id="5-2-hdcs">5.2 红队测试</h3>
<p>Meta 与外部供应商合作进行红队测试,收集了约 2,000 个对抗性提示.红队测试者被指示尝试使模型产生有害输出,覆盖三个类别:</p>
<ol>
<li>非法和犯罪行为</li>
<li>仇恨和有害活动</li>
<li>不合格的建议</li>
</ol>
<h3 id="5-3-aqpgjg">5.3 安全评估结果</h3>
<p>Llama 2-Chat 在安全性上显著优于开源模型,与 ChatGPT 相当.但论文也承认了局限性:</p>
<blockquote>
<p>「在某些情况下,我们的安全微调可能过度.Llama 2-Chat 的用户可能观察到过于谨慎的方法,模型倾向于拒绝某些请求或用太多安全细节响应.」</p>
</blockquote>
<p>这种「过度安全」是 RLHF 中安全-有用权衡的经典表现.阈值 0.15 的保守设置确保了高召回率(少漏过有害内容),但也导致了高误报率(多拒绝合法请求).后续模型(Llama 3、Claude 3 等)都在努力降低误拒率,同时保持安全性.</p>
<hr>
<h2 id="6-yxfxyjx">6. 涌现发现与局限</h2>
<h3 id="6-1-jdsjbzshjbz">6.1 监督数据不再是黄金标准</h3>
<p>Llama 2 团队的一个重要发现是:<strong>监督数据可能不再是黄金标准</strong>.原因如下:</p>
<ul>
<li>人类标注者写作风格差异显著,SFT 模型学习了这种多样性,包括 poorly executed 标注的尾部</li>
<li>模型性能上限由最熟练标注者的写作能力决定</li>
<li>偏好标注的差异较小,奖励机制能迅速学会给不希望的尾部分配低分</li>
</ul>
<p>这引出了一个深刻的范式转移:在 RLHF 时代,偏好数据(比较哪个更好)可能比监督数据(写出正确答案)更有价值.这也解释了为什么 Llama 2 只使用了 27,540 条 SFT 标注,但收集了超过 290 万条偏好比较.</p>
<h3 id="6-2-gjsydzfyx">6.2 工具使用的自发涌现</h3>
<p>Llama 2-Chat 从未在工具使用数据上训练,却能理解工具的语义、API 参数,并能在 zero-shot 上下文中使用工具序列.在数学数据集上的评估结果:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>ASDiv</th>
<th>SVAMP</th>
<th>MAWPS</th>
</tr>
</thead>
<tbody><tr>
<td>Toolformer</td>
<td>40.4</td>
<td>29.4</td>
<td>44.0</td>
</tr>
<tr>
<td>Llama 2-Chat</td>
<td><strong>67.1</strong></td>
<td><strong>69.2</strong></td>
<td><strong>82.4</strong></td>
</tr>
</tbody></table>
<p>这暗示了一个深刻的可能性:足够强大的语言模型可能不需要专门的工具训练——对齐过程本身就能激发模型利用外部资源的倾向.然而,这也带来了安全担忧:如果模型能自发学会使用工具,它也可能学会使用危险工具或被恶意利用.</p>
<h3 id="6-3-sxwwdzsf">6.3 上下文温度重缩放</h3>
<p>Llama 2 团队观察到温度根据上下文动态重缩放的现象:</p>
<ul>
<li>对于创造性提示(如「写一首诗」),温度升高继续在各 RLHF 迭代中生成多样性</li>
<li>对于事实性提示(如「什么是...的首都」),Self-BLEU 斜率随时间下降,表明尽管温度升高,模型学会对事实性提示始终提供相同响应</li>
</ul>
<p>这说明 RLHF 不仅改变了模型的输出分布,还改变了模型对「何时应该多样化」的元认知.</p>
<hr>
<h2 id="7-kycldhyyx">7. 开源策略的行业影响</h2>
<h3 id="7-1-xkzdsyhzx">7.1 许可证的商业化转向</h3>
<p>Llama 1 的「研究许可证」限制了商用,导致其生态主要局限于学术研究.Llama 2 的新许可证允许月活用户少于 7 亿的公司免费商用——这覆盖了绝大多数初创企业和中小企业.</p>
<p>这一策略变化标志着 Meta 对开源 AI 生态的强力支持.通过降低商用门槛,Meta 实际上在构建一个围绕 Llama 的开源护城河,与 OpenAI 的闭源策略形成鲜明对比.</p>
<h3 id="7-2-dkystdchxy">7.2 对开源生态的催化效应</h3>
<p>Llama 2 发布后,开源 LLM 生态经历了爆发式增长:</p>
<table>
<thead>
<tr>
<th>时间</th>
<th>模型</th>
<th>基于 Llama 2</th>
</tr>
</thead>
<tbody><tr>
<td>2023.07</td>
<td>Llama 2 发布</td>
<td>-</td>
</tr>
<tr>
<td>2023.08</td>
<td>Vicuna v1.5</td>
<td>是</td>
</tr>
<tr>
<td>2023.08</td>
<td>WizardLM 70B</td>
<td>是</td>
</tr>
<tr>
<td>2023.08</td>
<td>CodeLlama</td>
<td>是(Meta 官方)</td>
</tr>
<tr>
<td>2023.09</td>
<td>Llama 2 Long</td>
<td>是</td>
</tr>
<tr>
<td>2023.10</td>
<td>Stable Beluga</td>
<td>是</td>
</tr>
</tbody></table>
<p>在 Llama 2 发布后的 6 个月内,Hugging Face 上基于 Llama 2 的衍生模型超过 10,000 个.这种生态效应是闭源模型无法复制的——即使 GPT-4 能力更强,但开发者无法在它们之上构建和微调.</p>
<hr>
<h2 id="8-jxyhxyj">8. 局限与后续演进</h2>
<h3 id="8-1-yynljx">8.1 语言能力局限</h3>
<p>Llama 2 主要集中于英语数据(占 89.70%),非英语语言的预训练数据量有限.虽然模型在其他语言中获得了一定熟练度,但性能仍然脆弱.这限制了 Llama 2 在全球化应用中的适用性——后续 Llama 3 显著扩展了多语言覆盖.</p>
<h3 id="8-2-csxwjx">8.2 长上下文局限</h3>
<p>4K 上下文长度在 2023 年中虽然比 Llama 1 的 2K 翻倍,但仍远小于 GPT-4(32K)和 Claude(100K).长文档理解和多轮复杂对话仍受限制.后续 Llama 3 扩展到了 128K.</p>
<h3 id="8-3-dmhsxnl">8.3 代码和数学能力</h3>
<p>Llama 2-70B 的 HumanEval 29.9% 和 GSM8K 56.8% 与 GPT-4(67.0% 和 92.0%)差距明显.这促使 Meta 后续发布了 CodeLlama(代码专用版本),并在 Llama 3 中大幅加强了数学和代码预训练.</p>
<h3 id="8-4-gdjj">8.4 过度拒绝</h3>
<p>安全微调的保守阈值导致了用户对「过度拒绝」的广泛抱怨.这是 RLHF 中安全-有用权衡的经典问题,后续模型通过更精细的奖励模型和更低的拒绝阈值进行了改善.</p>
<hr>
<h2 id="9-mxpxdw">9. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: LLaMA-1(架构基础:RMSNorm、SwiGLU、RoPE), InstructGPT/ChatGPT(RLHF 流程设计), LIMA(质量 &gt; 数量的 SFT 理念)</li>
<li><strong>核心创新</strong>:<ul>
<li>GQA(Grouped-Query Attention)在 34B/70B 上的推理优化</li>
<li>双奖励模型分离有用性与安全性</li>
<li>Rejection Sampling + PPO 的迭代 RLHF 流水线</li>
<li>Ghost Attention(GAtt)多轮一致性技术</li>
<li>Context Distillation 安全增强</li>
<li>商用许可证的开源发布策略</li>
</ul>
</li>
<li><strong>同期可比模型</strong>: Falcon-40B、MPT-30B、Vicuna(基于 LLaMA-1 的微调模型)</li>
<li><strong>被后续工作引用</strong>: Llama 3(上下文扩展至 128K、数据量增加、多语言增强), CodeLlama(代码专用版本), 以及数以万计的开源微调模型</li>
<li><strong>行业影响</strong>: 确立了开源 LLM 的「基座 + 微调」生态模式,证明了 RLHF 在开源模型中的可行性和必要性</li>
</ul>
<hr>
<p><em>本文档基于 Llama 2 原始论文(arXiv:2307.09288)及配套开源资源进行技术剖析. 所有数据、公式和实验结论均来自原始论文.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsm-llama-2-syc-kycph-dlcb","text":"1. 设计动机: 为什么 Llama 2 是一次「开源产品化」的里程碑"},{"level":2,"id":"2-yxljgyj-c-llama-1-d-llama-2-dwsgj","text":"2. 预训练架构演进: 从 Llama 1 到 Llama 2 的务实改进"},{"level":3,"id":"2-1-csgmyxlsj","text":"2.1 参数规模与训练数据"},{"level":3,"id":"2-2-gqa-tlxsdgjgj","text":"2.2 GQA: 推理效率的关键改进"},{"level":3,"id":"2-3-xljcss-roce-vs-infini-band","text":"2.3 训练基础设施: RoCE vs. InfiniBand"},{"level":3,"id":"2-4-yxlpgdw","text":"2.4 预训练评估定位"},{"level":2,"id":"3-rlhf-lsx-sjlmxyddjjcy","text":"3. RLHF 流水线: 双奖励模型与迭代拒绝采样"},{"level":3,"id":"3-1-sft-zlyxdsjcl","text":"3.1 SFT: 质量优先的数据策略"},{"level":3,"id":"3-2-sjlmx-flyyxyaqx","text":"3.2 双奖励模型: 分离有用性与安全性"},{"level":3,"id":"3-3-dd-rlhf-rejection-sampling-ppo","text":"3.3 迭代 RLHF: Rejection Sampling + PPO"},{"level":3,"id":"3-4-fdjlhs-zsydaq-yyph","text":"3.4 分段奖励函数: 自适应的安全-有用平衡"},{"level":2,"id":"4-ghost-attention-dlyzxddcbfa","text":"4. Ghost Attention: 多轮一致性的低成本方案"},{"level":3,"id":"4-1-wt-xtxxyw","text":"4.1 问题: 系统消息遗忘"},{"level":3,"id":"4-2-gatt-ff","text":"4.2 GAtt 方法"},{"level":3,"id":"4-3-xg","text":"4.3 效果"},{"level":2,"id":"5-aqdq-context-distillation-yhdcs","text":"5. 安全对齐: Context Distillation 与红队测试"},{"level":3,"id":"5-1-aq-sft-y-rlhf","text":"5.1 安全 SFT 与 RLHF"},{"level":3,"id":"5-2-hdcs","text":"5.2 红队测试"},{"level":3,"id":"5-3-aqpgjg","text":"5.3 安全评估结果"},{"level":2,"id":"6-yxfxyjx","text":"6. 涌现发现与局限"},{"level":3,"id":"6-1-jdsjbzshjbz","text":"6.1 监督数据不再是黄金标准"},{"level":3,"id":"6-2-gjsydzfyx","text":"6.2 工具使用的自发涌现"},{"level":3,"id":"6-3-sxwwdzsf","text":"6.3 上下文温度重缩放"},{"level":2,"id":"7-kycldhyyx","text":"7. 开源策略的行业影响"},{"level":3,"id":"7-1-xkzdsyhzx","text":"7.1 许可证的商业化转向"},{"level":3,"id":"7-2-dkystdchxy","text":"7.2 对开源生态的催化效应"},{"level":2,"id":"8-jxyhxyj","text":"8. 局限与后续演进"},{"level":3,"id":"8-1-yynljx","text":"8.1 语言能力局限"},{"level":3,"id":"8-2-csxwjx","text":"8.2 长上下文局限"},{"level":3,"id":"8-3-dmhsxnl","text":"8.3 代码和数学能力"},{"level":3,"id":"8-4-gdjj","text":"8.4 过度拒绝"},{"level":2,"id":"9-mxpxdw","text":"9. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/02-llama-2/05-llama-2-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/02-llama-2/05-llama-2-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama 2 核心架构与对齐技术剖析</h1>
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
