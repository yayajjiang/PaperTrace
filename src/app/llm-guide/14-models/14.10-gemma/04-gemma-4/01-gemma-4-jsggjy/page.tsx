"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemma 4 技术规格精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.10-gemma/14.10-gemma">返回 14.10-Gemma 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Gemma 4: Byte for byte, the most capable open models
原文链接: <a href="https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/">https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/</a>
Model Card: <a href="https://ai.google.dev/gemma/docs/core/model_card_4">https://ai.google.dev/gemma/docs/core/model_card_4</a>
发布日期: 2026.04.02
发布机构: Google DeepMind
许可证: Apache 2.0</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%8F%91%E5%B8%83%E8%83%8C%E6%99%AF%E4%B8%8E%E5%AE%9A%E4%BD%8D">1 发布背景与定位</a></li>
<li><a href="#2-%E6%A8%A1%E5%9E%8B%E5%AE%B6%E6%97%8F%E6%80%BB%E8%A7%88">2 模型家族总览</a></li>
<li><a href="#3-%E6%9E%B6%E6%9E%84%E5%88%9B%E6%96%B0">3 架构创新</a><ul>
<li><a href="#31-per-layer-embeddings-ple">3.1 Per-Layer Embeddings (PLE)</a></li>
<li><a href="#32-mixture-of-experts-moe">3.2 Mixture-of-Experts (MoE)</a></li>
<li><a href="#33-%E5%A4%9A%E6%A8%A1%E6%80%81%E8%AE%BE%E8%AE%A1">3.3 多模态设计</a></li>
<li><a href="#34-%E9%95%BF%E4%B8%8A%E4%B8%8B%E6%96%87%E6%89%A9%E5%B1%95">3.4 长上下文扩展</a></li>
</ul>
</li>
<li><a href="#4-%E8%AE%AD%E7%BB%83%E4%B8%8E%E6%95%B0%E6%8D%AE">4 训练与数据</a></li>
<li><a href="#5-%E5%90%8E%E8%AE%AD%E7%BB%83%E4%B8%8E%E8%83%BD%E5%8A%9B">5 后训练与能力</a></li>
<li><a href="#6-%E6%80%A7%E8%83%BD%E8%AF%84%E4%BC%B0">6 性能评估</a><ul>
<li><a href="#61-%E6%A0%87%E5%87%86%E5%9F%BA%E5%87%86%E6%B5%8B%E8%AF%95">6.1 标准基准测试</a></li>
<li><a href="#62-arena-ai-%E6%8E%92%E5%90%8D">6.2 Arena AI 排名</a></li>
</ul>
</li>
<li><a href="#7-%E9%83%A8%E7%BD%B2%E4%B8%8E%E7%A1%AC%E4%BB%B6">7 部署与硬件</a></li>
<li><a href="#8-%E8%AE%B8%E5%8F%AF%E8%AF%81%E4%B8%8E%E7%94%9F%E6%80%81">8 许可证与生态</a></li>
<li><a href="#9-%E8%AE%A8%E8%AE%BA%E4%B8%8E%E7%BB%93%E8%AE%BA">9 讨论与结论</a></li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>2026 年 4 月 2 日,Google DeepMind 发布 Gemma 4,这是 Gemma 开放模型家族迄今为止最智能的版本.Gemma 4 专为高级推理与 agentic 工作流设计,在「每参数智能密度」(intelligence-per-parameter) 上达到前所未有的水平.整个家族包含四个尺寸:E2B(Effective 2B)、E4B(Effective 4B)、26B A4B(MoE)和 31B Dense,覆盖从数十亿台 Android 手机到开发者工作站的完整硬件谱系.所有模型均采用 Apache 2.0 许可证发布,这是 Gemma 家族首次使用标准开源许可,标志着 Google 开放模型战略的重大转向.</p>
<hr>
<h2 id="1-fbbjydw">1 发布背景与定位</h2>
<p>Gemma 4 与 Gemini 3 共享世界级的研究基础与技术栈,但定位为「可在本地硬件上运行的最强模型家族」.自 2024 年 2 月首代 Gemma 发布以来,开发者已下载 Gemma 模型超过 4 亿次,衍生出超过 10 万个社区变体.Gemma 4 是 Google 对这一社区反馈的直接回应:更强的推理能力、更开放的使用条款、更广泛的多模态支持,以及对 agentic 工作流的原生支持.</p>
<blockquote>
<p><strong>[战略思考]</strong> 为什么 Gemma 4 改用 Apache 2.0?</p>
<p>Gemma 1/2/3 均采用自定义的 Gemma Terms of Use,包含月活跃用户(MAU)上限、可接受使用政策等商业限制.这些条款虽然比闭源模型宽松,但仍给企业在 redistribution、合规审查和长期部署灵活性方面带来不确定性.Gemma 4 改用 Apache 2.0,意味着:无 MAU 上限、无商业用途限制、可自由修改和再分发.对许多实践者而言,这一许可证变更的重要性几乎与基准测试提升相当.它直接将 Gemma 4 置于与 Llama、Qwen、DeepSeek 同一竞争平面,消除了法律层面的入场障碍.</p>
</blockquote>
<p>Gemma 4 的发布也反映了 Google 对开放模型生态的重新定位:不再将开放模型视为专有模型的「降级版」,而是作为互补战略——Gemini 负责云端前沿能力,Gemma 负责端侧可部署性与开发者自由度.</p>
<hr>
<h2 id="2-mxjzzl">2 模型家族总览</h2>
<p>Gemma 4 家族按部署场景分为两个层级:边缘层(edge)和工作站层(workstation).</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>有效/激活参数</th>
<th>总参数</th>
<th>上下文窗口</th>
<th>支持模态</th>
<th>目标硬件</th>
</tr>
</thead>
<tbody><tr>
<td>E2B</td>
<td>2.3B</td>
<td>5.1B(含 PLE embeddings)</td>
<td>128K</td>
<td>文本、图像、音频</td>
<td>手机、Raspberry Pi、Jetson Orin Nano</td>
</tr>
<tr>
<td>E4B</td>
<td>4.5B</td>
<td>8B(含 PLE embeddings)</td>
<td>128K</td>
<td>文本、图像、音频</td>
<td>笔记本电脑、T4 GPU</td>
</tr>
<tr>
<td>26B A4B</td>
<td>3.8B</td>
<td>25.2B</td>
<td>256K</td>
<td>文本、图像、视频</td>
<td>RTX 4090/5090、消费级 GPU</td>
</tr>
<tr>
<td>31B Dense</td>
<td>30.7B</td>
<td>30.7B</td>
<td>256K</td>
<td>文本、图像、视频</td>
<td>H100 80GB、工作站</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[命名解码]</strong> E、A、Dense 分别代表什么?</p>
<ul>
<li><strong>E(Effective)</strong>: E2B/E4B 的 &quot;E&quot; 表示「有效参数」,即推理时实际参与计算的参数量.这些模型采用 Per-Layer Embeddings(PLE)技术,每层拥有独立的嵌入表,因此总参数量(含 embeddings)远大于有效参数,但推理 FLOPs 与有效参数一致.</li>
<li><strong>A(Active)</strong>: 26B A4B 的 &quot;A&quot; 表示「激活参数」.该模型为 MoE 架构,总参数量 25.2B,但每 token 仅激活 3.8B 参数.「26B」告诉你存储需求,「A4B」告诉你计算成本.</li>
<li><strong>Dense</strong>: 31B 为传统稠密架构,每个前向传播激活全部 30.7B 参数.行为最简单,质量天花板最高,微调预期最清晰.</li>
</ul>
</blockquote>
<h3 id="2-1-byc-e2b-y-e4b">2.1 边缘层:E2B 与 E4B</h3>
<p>E2B 和 E4B 是专为端侧计算从头设计的模型,与 Google Pixel 团队及移动硬件领导者 Qualcomm、MediaTek 深度合作优化.它们支持 128K 上下文窗口,可完全离线运行,延迟接近零.</p>
<blockquote>
<p><strong>[架构细节]</strong> PLE 的工程本质</p>
<p>标准 Transformer 在每个 token 进入 decoder 前计算一次嵌入,之后所有层共享该表示.PLE(Per-Layer Embeddings)为每一层 decoder 增加一个专用的条件向量(conditioning vector),通过残差连接注入该层的计算.这些 per-layer embedding tables 在磁盘上占用较大空间(因此总参数量达到 5.1B/8B),但在推理时仅读取当前层所需的一小部分,计算开销极低.这使得 E2B 在 2-bit 量化下可运行在 1.5GB 内存内,同时携带比纯 2B 模型更深的表征能力.</p>
</blockquote>
<p>音频能力是边缘模型独有的:E2B/E4B 支持原生音频输入(语音识别与音频理解),最长 30 秒.这是 Gemma 家族首次支持音频模态.</p>
<h3 id="2-2-gzzc-26b-a4b-y-31b-dense">2.2 工作站层:26B A4B 与 31B Dense</h3>
<p>工作站层模型面向开发者 GPU 和云基础设施,提供前沿级推理能力.</p>
<p><strong>26B A4B(MoE)</strong> 是延迟敏感场景的最优解.它采用 128 个小型专家(expert)加 1 个共享专家(shared expert)的设计,每 token 路由激活 8 个专家.这意味着:</p>
<ul>
<li>存储需求:约 25.2B 参数(约 50GB bfloat16)</li>
<li>计算需求:每 token 仅 3.8B 激活参数,推理速度接近 4B 稠密模型</li>
<li>质量:在多数基准上达到 31B Dense 的 95%+ 水平</li>
</ul>
<blockquote>
<p><strong>[技术权衡]</strong> MoE 的「内存-计算」双账单问题</p>
<p>MoE 模型常被误解为「免费午餐」:总参数大但激活参数小,似乎同时获得大模型质量和小模型速度.但实际情况更复杂:虽然每 token 的计算 FLOPs 确实由激活参数决定,但<strong>存储全部专家权重所需的 GPU 内存并未减少</strong>.26B A4B 需要约 50GB bfloat16 显存(或约 16-18GB 4-bit 量化),与加载一个 26B 稠密模型的成本相当.真正的收益在于<strong>计算延迟</strong>而非<strong>内存占用</strong>.对于 latency-sensitive 应用(如交互式编程助手、实时 OCR 流水线),这是正确的优化方向;但对于 memory-constrained 部署(如单卡 24GB 消费级 GPU),MoE 的优势被削弱.</p>
</blockquote>
<p><strong>31B Dense</strong> 是家族中的质量旗舰.无路由、无 tricks,每个层每次前向传播全部参与.在 Arena AI 文本排行榜上位列全球开放模型第 3 名,与云侧前沿模型的对话质量相当.未量化的 bfloat16 权重可高效装入单张 80GB NVIDIA H100 GPU.</p>
<hr>
<h2 id="3-jgcx">3 架构创新</h2>
<h3 id="3-1-per-layer-embeddings-ple">3.1 Per-Layer Embeddings (PLE)</h3>
<p>PLE 是 Gemma 4 边缘模型的核心架构创新.设标准 Transformer 的输入嵌入为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>E</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>V</mi><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">E \\in \\mathbb{R}^{V \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 为词表大小,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi></mrow><annotation encoding="application/x-tex">d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 为隐藏维度.在标准架构中,token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 的嵌入为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>e</mi><mi>t</mi></msub><mo>=</mo><mi>E</mi><mo stretchy="false">[</mo><mi>t</mi><mo stretchy="false">]</mo><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mi>d</mi></msup></mrow><annotation encoding="application/x-tex">e_t = E[t] \\in \\mathbb{R}^d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mopen">[</span><span class="mord mathnormal">t</span><span class="mclose">]</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span>,之后该向量通过 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>L</mi></mrow><annotation encoding="application/x-tex">L</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">L</span></span></span></span> 层 decoder,每层执行:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mrow><mi>l</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>+</mo><mtext>FFN</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">x_{l+1} = x_l + \\text{Attention}(\\text{LN}(x_l)) + \\text{FFN}(\\text{LN}(x_l))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">FFN</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span></span></span></span><p>PLE 为每一层 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi></mrow><annotation encoding="application/x-tex">l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span> 引入独立的嵌入表 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>l</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>V</mi><mo>×</mo><msub><mi>d</mi><mi>l</mi></msub></mrow></msup></mrow><annotation encoding="application/x-tex">E_l \\in \\mathbb{R}^{V \\times d_l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span><span class="mbin mtight">×</span><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>l</mi></msub></mrow><annotation encoding="application/x-tex">d_l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 通常较小.在第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi></mrow><annotation encoding="application/x-tex">l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span></span></span></span> 层,token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 的条件向量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>c</mi><mrow><mi>t</mi><mo separator="true">,</mo><mi>l</mi></mrow></msub><mo>=</mo><msub><mi>E</mi><mi>l</mi></msub><mo stretchy="false">[</mo><mi>t</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">c_{t,l} = E_l[t]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">[</span><span class="mord mathnormal">t</span><span class="mclose">]</span></span></span></span>,通过残差连接注入:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>x</mi><mrow><mi>l</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>=</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><mtext>Attention</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><msub><mi>c</mi><mrow><mo>:</mo><mo separator="true">,</mo><mi>l</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo>+</mo><mtext>FFN</mtext><mo stretchy="false">(</mo><mtext>LN</mtext><mo stretchy="false">(</mo><msub><mi>x</mi><mi>l</mi></msub><mo>+</mo><msub><mi>c</mi><mrow><mo>:</mo><mo separator="true">,</mo><mi>l</mi></mrow></msub><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">x_{l+1} = x_l + \\text{Attention}(\\text{LN}(x_l + c_{:,l})) + \\text{FFN}(\\text{LN}(x_l + c_{:,l}))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Attention</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">:</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">FFN</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">LN</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">c</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">:</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">))</span></span></span></span></span><blockquote>
<p><strong>[工程分析]</strong> 为什么 PLE 不是简单的参数膨胀?</p>
<p>PLE 的关键洞察在于<strong>计算-存储分离</strong>.embedding tables 是 lookup 操作,不依赖输入序列长度,且每层仅读取当前层所需的一小部分权重.相比增加隐藏维度或层数,PLE 以极低的推理开销换取了表征能力的深度.这类似于 MoE 的「存储大、计算小」哲学,但应用于嵌入层而非 FFN 层.对于边缘设备,这种设计特别有价值:闪存(存储)通常比算力更充裕.</p>
</blockquote>
<h3 id="3-2-mixture-of-experts-moe">3.2 Mixture-of-Experts (MoE)</h3>
<p>26B A4B 的 MoE 设计遵循现代稀疏 Transformer 的标准范式.设输入 token 的隐藏状态为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mi>d</mi></msup></mrow><annotation encoding="application/x-tex">h \\in \\mathbb{R}^d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">h</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span>:</p>
<ol>
<li><p><strong>路由(Router)</strong>: 学习的路由网络计算每个专家的门控分数:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>g</mi><mo>=</mo><mtext>Softmax</mtext><mo stretchy="false">(</mo><msub><mi>W</mi><mi>r</mi></msub><mo>⋅</mo><mi>h</mi><mo stretchy="false">)</mo><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><msub><mi>N</mi><mi>e</mi></msub></msup></mrow><annotation encoding="application/x-tex">g = \\text{Softmax}(W_r \\cdot h) \\in \\mathbb{R}^{N_e}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Softmax</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">h</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8913em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>N</mi><mi>e</mi></msub><mo>=</mo><mn>128</mn></mrow><annotation encoding="application/x-tex">N_e = 128</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">128</span></span></span></span> 为专家总数,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>r</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><msub><mi>N</mi><mi>e</mi></msub><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">W_r \\in \\mathbb{R}^{N_e \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.109em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span>.</p>
</li>
<li><p><strong>专家选择</strong>: 选择 top-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 专家(此处 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">k=8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span>),并应用负载均衡(load balancing):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>g</mi><mi>i</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msubsup><mo>=</mo><msub><mi>g</mi><mi>i</mi></msub><mo>⋅</mo><msub><mn mathvariant="double-struck">1</mn><mrow><mi>i</mi><mo>∈</mo><mtext>top-</mtext><mi>k</mi><mo stretchy="false">(</mo><mi>g</mi><mo stretchy="false">)</mo></mrow></msub></mrow><annotation encoding="application/x-tex">g&#x27;_i = g_i \\cdot \\mathbb{1}_{i \\in \\text{top-}k(g)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0489em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9996em;vertical-align:-0.3552em;"></span><span class="mord"><span class="mord">1</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord text mtight"><span class="mord mtight">top-</span></span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span></span></span>
</li>
<li><p><strong>共享专家</strong>: 1 个共享专家始终激活,确保基础语言知识不依赖路由决策.</p>
</li>
<li><p><strong>输出聚合</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>h</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>=</mo><mtext>SharedExpert</mtext><mo stretchy="false">(</mo><mi>h</mi><mo stretchy="false">)</mo><mo>+</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mtext>top-</mtext><mi>k</mi></mrow></munder><msubsup><mi>g</mi><mi>i</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msubsup><mo>⋅</mo><msub><mtext>Expert</mtext><mi>i</mi></msub><mo stretchy="false">(</mo><mi>h</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">h&#x27; = \\text{SharedExpert}(h) + \\sum_{i \\in \\text{top-}k} g&#x27;_i \\cdot \\text{Expert}_i(h)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8019em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">SharedExpert</span></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4882em;vertical-align:-1.4382em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8479em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord text mtight"><span class="mord mtight">top-</span></span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4382em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8019em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord text"><span class="mord">Expert</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2175em;"><span style="top:-2.4559em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2441em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">h</span><span class="mclose">)</span></span></span></span></span></li>
</ol>
<blockquote>
<p><strong>[设计比较]</strong> Gemma 4 MoE vs DeepSeekMoE vs OLMoE</p>
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
<td>路由粒度</td>
<td>token-level</td>
<td>token-level</td>
<td>token-level</td>
</tr>
<tr>
<td>负载均衡</td>
<td>隐式(未公开细节)</td>
<td>辅助损失</td>
<td>辅助损失 + Z-loss</td>
</tr>
<tr>
<td>dropless</td>
<td>未明确</td>
<td>是</td>
<td>是</td>
</tr>
</tbody></table>
<p>Gemma 4 的 MoE 规模介于 OLMoE(研究导向)和 DeepSeek-V3(生产级)之间.一个值得注意的细节是 Google 未公开其负载均衡机制的具体实现(是否有显式辅助损失、容量因子等),这与 DeepSeek 和 OLMoE 的完全透明形成对比.</p>
</blockquote>
<h3 id="3-3-dmtsj">3.3 多模态设计</h3>
<p>Gemma 4 继承了 Gemma 3 的多模态基础,并在工作站层扩展了视频支持.</p>
<p><strong>视觉</strong>:所有模型均原生处理图像,支持变量分辨率,擅长 OCR 和图表理解.视觉Encoder 细节未在公开材料中完整披露,但基于 Gemma 3 的技术 lineage,推测仍基于 SigLIP 400M 视觉Encoder ,将图像压缩为固定数量的视觉 token.</p>
<p><strong>音频(仅 E2B/E4B)</strong>:边缘模型支持原生音频输入,最长 30 秒.这代表 Gemma 家族首次进入音频模态, likely 通过轻量化的音频Encoder (如 SoundStream 或更简单的频谱特征提取)将音频转换为与文本共享的嵌入空间.</p>
<p><strong>视频(仅 26B/31B)</strong>:工作站层模型支持视频输入,推测采用「视频作为帧序列」的策略:将视频采样为关键帧,每帧由视觉Encoder 独立处理,然后在时间维度上拼接为长序列.这与 Gemma 3 的 Pan &amp; Scan 自适应分辨率方法兼容.</p>
<blockquote>
<p><strong>[架构思考]</strong> 为什么音频仅支持边缘模型?</p>
<p>一个有趣的模态分配策略:音频能力仅限于 E2B/E4B,而工作站层(26B/31B)不支持音频.这与通常的「大模型支持更多模态」直觉相反.可能的原因包括:(1)音频-文本对齐在较小模型上更容易实现高质量;(2)边缘场景(语音助手、实时转录)对音频需求更强烈;(3)工作站层的目标用例(代码生成、长文档分析)对音频需求较低.这种「按需分配模态」的策略比「一刀切全模态」更具工程理性.</p>
</blockquote>
<h3 id="3-4-csxwkz">3.4 长上下文扩展</h3>
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
<p>Gemma 4 工作站层模型的 256K 上下文窗口是 Gemma 3(128K)的两倍.在长上下文检索基准上,Gemma 4 31B 达到 66.4%,而 Gemma 3 27B 仅为 13.5%,表明长上下文能力不仅是窗口尺寸的增加,更是注意力机制或位置编码的根本改进.</p>
<hr>
<h2 id="4-xlysj">4 训练与数据</h2>
<p>Gemma 4 基于 Gemini 3 的研究基础训练,具体训练数据细节未完全公开,但 Model Card 提供了以下关键信息:</p>
<ul>
<li><strong>数据截止</strong>: 2025 年 1 月</li>
<li><strong>语言覆盖</strong>: 140+ 语言原生训练</li>
<li><strong>知识蒸馏</strong>: 推测延续 Gemma 2/3 的蒸馏策略,以 Gemini 3 或更大的内部模型作为教师</li>
<li><strong>预训练规模</strong>: 未公开具体 token 数(Gemma 3 为 2T-14T 视模型大小而定)</li>
</ul>
<blockquote>
<p><strong>[数据思考]</strong> 训练数据透明度仍是 Gemma 的弱项</p>
<p>与 OLMo 家族(公开完整数据管道、去重策略、质量过滤代码)和 DeepSeek(公开数据构成比例)相比,Gemma 4 在训练数据方面仍保持较高的黑盒性. Model Card 仅提供数据截止时间和语言数量,未披露数据来源、去重方法、数据混合比例或质量过滤策略.对于研究社区而言,这意味着难以复现训练结果或深入分析模型行为的根源.</p>
</blockquote>
<hr>
<h2 id="5-hxlynl">5 后训练与能力</h2>
<p>Gemma 4 引入了多项后训练能力,这些能力在所有尺寸上均可用:</p>
<p><strong>原生 Function Calling</strong>:模型可直接输出结构化工具调用,支持构建与外部 API、数据库和工具交互的 autonomous agent.这不同于通过 prompt engineering 模拟的 function calling,而是模型在训练阶段就学会的行为模式.</p>
<p><strong>结构化 JSON 输出</strong>:原生支持约束解码生成符合 JSON Schema 的输出,无需外部验证器或重试机制.</p>
<p><strong>Thinking Mode(推理模式)</strong>:可配置的思考模式允许用户在速度和深度推理之间做 trade-off.推测这通过训练时的「思考 token」(如 <code>&lt;think&gt;</code> 标签)或 test-time compute scaling 实现,类似于 DeepSeek-R1 的推理链生成,但可能更轻量.</p>
<p><strong>系统指令</strong>:原生支持系统级指令,可在不污染用户提示的前提下设定模型行为准则、安全约束和角色定义.</p>
<blockquote>
<p><strong>[能力分析]</strong> Agentic 能力的代际跨越</p>
<p>在 τ2-bench(agentic 工具使用基准)上,Gemma 3 27B 仅得分 6.6%,而 Gemma 4 31B 达到 86.4%.这不是渐进式改进,而是能力涌现.这一跨越可能源于:(1)训练数据中有意增加了多步工具调用轨迹;(2)后训练阶段引入了专门针对 agentic 场景的 RL;(3)Function calling 的原生支持消除了 prompt 模拟的误差累积.Google 在博客中明确将 agentic workflows 列为 Gemma 4 的核心定位,这一基准结果验证了其训练投入的有效性.</p>
</blockquote>
<hr>
<h2 id="6-xnpg">6 性能评估</h2>
<h3 id="6-1-bzjzcs">6.1 标准基准测试</h3>
<p>下表汇总 Gemma 4 全家族在主要基准上的表现,并与 Gemma 3 27B 对比:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>测试类型</th>
<th>Gemma 3 27B</th>
<th>Gemma 4 E2B</th>
<th>Gemma 4 E4B</th>
<th>Gemma 4 26B A4B</th>
<th>Gemma 4 31B</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2026</td>
<td>数学推理</td>
<td>20.8%</td>
<td>37.5%</td>
<td>42.5%</td>
<td>88.3%</td>
<td>89.2%</td>
</tr>
<tr>
<td>LiveCodeBench v6</td>
<td>代码生成</td>
<td>29.1%</td>
<td>44.0%</td>
<td>52.0%</td>
<td>77.1%</td>
<td>80.0%</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>科学问答</td>
<td>42.4%</td>
<td>-</td>
<td>-</td>
<td>82.3%</td>
<td>84.3%</td>
</tr>
<tr>
<td>MMLU Pro</td>
<td>综合知识</td>
<td>-</td>
<td>~60.0%</td>
<td>~69.4%</td>
<td>82.6%</td>
<td>85.2%</td>
</tr>
<tr>
<td>MMMU Pro</td>
<td>多模态推理</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>73.8%</td>
<td>76.9%</td>
</tr>
<tr>
<td>MATH-Vision</td>
<td>视觉数学</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>82.4%</td>
<td>85.6%</td>
</tr>
<tr>
<td>τ2-bench</td>
<td>Agentic 工具使用</td>
<td>6.6%</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>86.4%</td>
</tr>
<tr>
<td>长上下文检索</td>
<td>128K/256K</td>
<td>13.5%</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>66.4%</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[性能解读]</strong> 三个显著的模式</p>
<ol>
<li><p><strong>推理能力的代际飞跃</strong>:AIME 2026 从 Gemma 3 27B 的 20.8% 提升到 Gemma 4 31B 的 89.2%,提升超过 4 倍.这一跨越远超参数规模增长所能解释的范围(27B → 31B 仅增加 15% 参数),表明训练方法论(可能包括 test-time scaling、更优的蒸馏策略或专门的多步推理数据)发生了根本性变化.</p>
</li>
<li><p><strong>MoE 的效率验证</strong>:26B A4B 在 AIME 2026(88.3% vs 89.2%)、LiveCodeBench v6(77.1% vs 80.0%)、MMLU Pro(82.6% vs 85.2%)上均接近 31B Dense 的水平,但激活参数仅为后者的 12.4%(3.8B vs 30.7B).这验证了 MoE 「以存储换计算」的效率承诺——在实际质量损失 &lt;5% 的前提下,计算成本降低约 87%.</p>
</li>
<li><p><strong>边缘模型的可用性突破</strong>:E4B 的 AIME 2026 得分(42.5%)已超过 Gemma 3 27B(20.8%)的两倍,尽管其有效参数仅为 4.5B.PLE 架构的有效性在此得到验证:一个 4.5B 有效参数的模型通过更聪明的嵌入设计,击败了 27B 的传统稠密模型.</p>
</li>
</ol>
</blockquote>
<h3 id="6-2-arena-ai-pm">6.2 Arena AI 排名</h3>
<p>Arena AI 是人类评估者通过盲测对战评分的行业标杆,测量的是模型的对话质量、指令遵循能力和创造性输出.</p>
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
<td>1452</td>
<td>#3</td>
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
<td>约 320B MoE</td>
</tr>
<tr>
<td>Gemma 3 27B</td>
<td>1365</td>
<td>-</td>
<td>27B</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[竞争分析]</strong> 参数效率的重新定义</p>
<p>Gemma 4 31B 的 ELO 1452 不仅超过了参数规模相当的 Qwen 3.5 27B(ELO 1403),也逼近了参数量 10 倍以上的 DeepSeek-V3.2(~1425).在性能-参数散点图上,Gemma 4 的两个工作站模型位于「左上」最优区域:高 ELO、低参数.这一定位验证了 Google 的「intelligence-per-parameter」策略——不追求最大模型,追求最高效率.对于本地部署者和中小型企业而言,这意味着可以用消费级硬件获得接近前沿模型的对话体验.</p>
</blockquote>
<hr>
<h2 id="7-bsyyj">7 部署与硬件</h2>
<h3 id="7-1-bybs">7.1 边缘部署</h3>
<p>E2B 和 E4B 通过与 Google Pixel、Qualcomm、MediaTek 的深度合作,实现了跨平台优化:</p>
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
<p>Android 开发者可通过 AICore Developer Preview 在设备端 prototype agentic 工作流,并确保与 Gemini Nano 4 的前向兼容性.</p>
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
<td>26B A4B</td>
<td>NVFP4</td>
<td>~16GB</td>
<td>H100/B200</td>
</tr>
<tr>
<td>31B</td>
<td>4-bit</td>
<td>~20GB</td>
<td>RTX 4090(24GB)</td>
</tr>
<tr>
<td>31B</td>
<td>8-bit</td>
<td>~34GB</td>
<td>H100 40GB</td>
</tr>
<tr>
<td>31B</td>
<td>bfloat16</td>
<td>~62GB</td>
<td>H100 80GB</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[部署建议]</strong> 如何选择模型?</p>
<ul>
<li><strong>手机/IoT/语音助手</strong> → E2B:唯一支持音频且能在 &lt;2GB 内存运行的选项</li>
<li><strong>笔记本/本地助手</strong> → E4B:如果硬件支持 5-8GB,选择 E4B 而非 E2B,推理能力提升显著</li>
<li><strong>开发工作站/消费级 GPU</strong> → 26B A4B:性价比最优解,在 24GB 显存内运行,质量接近 31B</li>
<li><strong>研究/微调/最高质量</strong> → 31B Dense:最佳微调基底,行为最可预测,质量天花板最高</li>
<li><strong>latency 敏感型应用</strong> → 26B A4B:MoE 的激活参数优势在交互式场景(代码补全、实时对话)中最为明显</li>
</ul>
</blockquote>
<hr>
<h2 id="8-xkzyst">8 许可证与生态</h2>
<h3 id="8-1-apache-2-0-dzlyy">8.1 Apache 2.0 的战略意义</h3>
<p>Gemma 4 是 Gemma 家族首次采用 Apache 2.0 许可证.与此前 Gemma Terms 的关键差异:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>Gemma 1/2/3 Terms</th>
<th>Gemma 4 Apache 2.0</th>
</tr>
</thead>
<tbody><tr>
<td>商业使用</td>
<td>允许,但受 MAU 上限约束</td>
<td>完全自由,无上限</td>
</tr>
<tr>
<td>Redistribution</td>
<td>允许,但需遵守使用政策</td>
<td>完全自由</td>
</tr>
<tr>
<td>修改与衍生</td>
<td>允许,但需保留声明</td>
<td>完全自由</td>
</tr>
<tr>
<td>专利授权</td>
<td>未明确</td>
<td>明确包含</td>
</tr>
<tr>
<td>合规审查</td>
<td>需评估可接受使用政策</td>
<td>标准 Apache 2.0 条款</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[生态影响]</strong> 许可证变更的涟漪效应</p>
<p>开放模型的许可证选择直接影响其生态系统的广度和深度.Llama 系列(社区许可)和 Qwen 系列(多许可证)的成功部分归功于许可条款的清晰度.Gemma 1/2/3 的自定义条款曾阻碍部分企业和云服务提供商(如某些 AWS/Azure 托管服务)无缝集成 Gemma.Apache 2.0 消除了这些摩擦,预计将加速 Gemma 4 在以下领域的采用:(1)企业私有化部署;(2)云服务商的托管模型即服务;(3)开源社区的二次开发(如 Unsloth 微调、Candle 推理引擎);(4)垂直领域微调(如医疗、法律、金融).</p>
</blockquote>
<h3 id="8-2-stxtzc">8.2 生态系统支持</h3>
<p>Gemma 4 发布当天即获得广泛的工具链支持:</p>
<ul>
<li><strong>推理引擎</strong>: vLLM、llama.cpp、MLX(Ollama、LM Studio)、SGLang、LiteRT-LM</li>
<li><strong>微调框架</strong>: Hugging Face TRL、Unsloth、NVIDIA NeMo、MaxText</li>
<li><strong>云服务</strong>: Google Cloud Vertex AI、Cloud Run、GKE、TPU 加速推理</li>
<li><strong>硬件优化</strong>: NVIDIA Jetson(Orin Nano 到 Blackwell)、AMD ROCm、Google TPU(Trillium/Ironwood)</li>
<li><strong>开发者工具</strong>: Google AI Studio(31B/26B)、AI Edge Gallery(E4B/E2B)、Android Studio Agent Mode、ML Kit GenAI Prompt API</li>
</ul>
<hr>
<h2 id="9-tlyjl">9 讨论与结论</h2>
<h3 id="9-1-gemma-4-dsg-dy">9.1 Gemma 4 的四个「第一」</h3>
<ol>
<li><strong>首个 Apache 2.0 Gemma</strong>:许可证变更消除了 Gemma 在企业级部署中的最大障碍.</li>
<li><strong>首个音频 Gemma</strong>:E2B/E4B 的原生音频支持将开放模型带入语音交互领域.</li>
<li><strong>首个 MoE Gemma</strong>:26B A4B 引入 MoE 架构,在 Gemma 家族中首次实现「存储-计算分离」.</li>
<li><strong>首个视频工作站 Gemma</strong>:26B/31B 支持视频输入,将多模态从图像扩展到时间维度.</li>
</ol>
<h3 id="9-2-jxx">9.2 局限性</h3>
<ul>
<li><strong>无独立技术报告</strong>:Gemma 4 仅有 Model Card 和博客发布,未发布如 Gemma 3(arXiv:2503.19786)那样的独立技术报告.这导致许多架构细节(如 PLE 的确切实现、MoE 的路由算法、训练数据构成)无法完全验证.</li>
<li><strong>数据透明度不足</strong>:训练数据来源、混合比例、过滤策略未公开,限制了研究复现.</li>
<li><strong>边缘模型无视频</strong>:E2B/E4B 不支持视频,工作站模型不支持音频,模态分配存在断层.</li>
<li><strong>长上下文机制未公开</strong>:256K 窗口的具体实现(是否采用 YaRN、NTK-aware 插值或其他技术)未在公开材料中说明.</li>
</ul>
<h3 id="9-3-zj">9.3 总结</h3>
<p>Gemma 4 代表了 Google 开放模型战略的成熟化:从「轻量级 Gemini 衍生品」进化为「独立定位的开放模型家族」.其核心价值主张可概括为三个关键词:</p>
<ul>
<li><strong>密度</strong>(Density):在 31B 参数内实现全球开放模型第 3 名的对话质量,在 3.8B 激活参数内实现接近 31B 的推理能力.</li>
<li><strong>覆盖</strong>(Coverage):从 1.5GB 内存的 Raspberry Pi 到 80GB H100,四个模型覆盖完整的部署谱系.</li>
<li><strong>开放</strong>(Openness):Apache 2.0 许可证终于让 Gemma 与 Llama、Qwen、DeepSeek 站在同一起跑线.</li>
</ul>
<p>对于实践者,Gemma 4 的最重要启示是:<strong>模型选择应基于激活参数和部署约束,而非总参数</strong>.26B A4B 的「26B」是存储标签,「A4B」才是计算真相;E2B 的「2.3B」是推理标签,「5.1B」才是能力深度.理解这些命名背后的工程权衡,是正确使用 Gemma 4 家族的前提.</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
<table>
<thead>
<tr>
<th>术语</th>
<th>解释</th>
</tr>
</thead>
<tbody><tr>
<td>PLE</td>
<td>Per-Layer Embeddings,每层独立的嵌入表技术</td>
</tr>
<tr>
<td>MoE</td>
<td>Mixture-of-Experts,混合专家架构</td>
</tr>
<tr>
<td>E(Effective)</td>
<td>有效参数,推理时实际参与计算的参数量</td>
</tr>
<tr>
<td>A(Active)</td>
<td>激活参数,MoE 模型每 token 实际路由到的专家参数量</td>
</tr>
<tr>
<td>Dense</td>
<td>稠密架构,所有参数在每轮前向传播中均激活</td>
</tr>
<tr>
<td>Arena AI</td>
<td>LMSYS Chatbot Arena,基于人类偏好对战的模型排名平台</td>
</tr>
<tr>
<td>Agentic</td>
<td>具备自主规划、工具调用和多步执行能力的 AI 系统</td>
</tr>
<tr>
<td>τ2-bench</td>
<td>评估模型 agentic 工具使用能力的基准测试</td>
</tr>
</tbody></table>
<h3 id="b-cklj">B. 参考链接</h3>
<ul>
<li>官方博客: <a href="https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/">https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/</a></li>
<li>Model Card: <a href="https://ai.google.dev/gemma/docs/core/model_card_4">https://ai.google.dev/gemma/docs/core/model_card_4</a></li>
<li>DeepMind 页面: <a href="https://deepmind.google/models/gemma/gemma-4/">https://deepmind.google/models/gemma/gemma-4/</a></li>
<li>Hugging Face 发布: <a href="https://huggingface.co/blog/gemma4">https://huggingface.co/blog/gemma4</a></li>
<li>Google Developers Blog: <a href="https://developers.googleblog.com/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/">https://developers.googleblog.com/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/</a></li>
<li>Function Calling 文档: <a href="https://ai.google.dev/gemma/docs/capabilities/text/function-calling-gemma4">https://ai.google.dev/gemma/docs/capabilities/text/function-calling-gemma4</a></li>
<li>Thinking Mode 文档: <a href="https://ai.google.dev/gemma/docs/capabilities/thinking">https://ai.google.dev/gemma/docs/capabilities/thinking</a></li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-fbbjydw","text":"1 发布背景与定位"},{"level":2,"id":"2-mxjzzl","text":"2 模型家族总览"},{"level":3,"id":"2-1-byc-e2b-y-e4b","text":"2.1 边缘层:E2B 与 E4B"},{"level":3,"id":"2-2-gzzc-26b-a4b-y-31b-dense","text":"2.2 工作站层:26B A4B 与 31B Dense"},{"level":2,"id":"3-jgcx","text":"3 架构创新"},{"level":3,"id":"3-1-per-layer-embeddings-ple","text":"3.1 Per-Layer Embeddings (PLE)"},{"level":3,"id":"3-2-mixture-of-experts-moe","text":"3.2 Mixture-of-Experts (MoE)"},{"level":3,"id":"3-3-dmtsj","text":"3.3 多模态设计"},{"level":3,"id":"3-4-csxwkz","text":"3.4 长上下文扩展"},{"level":2,"id":"4-xlysj","text":"4 训练与数据"},{"level":2,"id":"5-hxlynl","text":"5 后训练与能力"},{"level":2,"id":"6-xnpg","text":"6 性能评估"},{"level":3,"id":"6-1-bzjzcs","text":"6.1 标准基准测试"},{"level":3,"id":"6-2-arena-ai-pm","text":"6.2 Arena AI 排名"},{"level":2,"id":"7-bsyyj","text":"7 部署与硬件"},{"level":3,"id":"7-1-bybs","text":"7.1 边缘部署"},{"level":3,"id":"7-2-gzzbs","text":"7.2 工作站部署"},{"level":2,"id":"8-xkzyst","text":"8 许可证与生态"},{"level":3,"id":"8-1-apache-2-0-dzlyy","text":"8.1 Apache 2.0 的战略意义"},{"level":3,"id":"8-2-stxtzc","text":"8.2 生态系统支持"},{"level":2,"id":"9-tlyjl","text":"9 讨论与结论"},{"level":3,"id":"9-1-gemma-4-dsg-dy","text":"9.1 Gemma 4 的四个「第一」"},{"level":3,"id":"9-2-jxx","text":"9.2 局限性"},{"level":3,"id":"9-3-zj","text":"9.3 总结"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-cklj","text":"B. 参考链接"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.10-gemma/04-gemma-4/01-gemma-4-jsggjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.10-gemma/04-gemma-4/01-gemma-4-jsggjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemma 4 技术规格精译</h1>
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
