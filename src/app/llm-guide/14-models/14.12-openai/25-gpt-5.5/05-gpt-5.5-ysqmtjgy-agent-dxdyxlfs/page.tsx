"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GPT-5.5：原生全模态架构与 Agent 导向的预训练范式</h1>
<h2 id="y-fbbjyzldw">一、发布背景与战略定位</h2>
<p>2026 年 4 月 23 日, OpenAI 正式发布 GPT-5.5(内部代号 &quot;Spud&quot;), 距离上一代 GPT-5.4(2026 年 3 月 5 日)仅 7 周, 延续了 OpenAI 惊人的六周迭代节奏。然而, GPT-5.5 并非又一次后训练微调——而是<strong>自 GPT-4.5 以来首次完整的预训练重跑</strong>, 耗资约 2 亿美元级别, 标志着 GPT-5.x 系列从&quot;渐进补丁&quot;模式转向&quot;架构重构&quot;模式。</p>
<p>OpenAI 总裁 Greg Brockman 将其定位为&quot;真实工作的新型智能&quot;(A new kind of intelligence for real work)。这一表述背后隐含了 GPT-5.5 的核心战略转向：<strong>从&quot;对话助手&quot;进化为&quot;自主执行者&quot;</strong>。此前的 GPT-5.0 至 5.4 共享同一预训练基座, 通过 RLHF、指令微调、蒸馏等后训练手段迭代; 而 GPT-5.5 从数据筛选、架构决策到损失函数设计, 全部围绕一个目标重新构建——让模型能够理解复杂目标、调用工具、自我检查、穿越模糊地带, 并将多步骤任务执行到底。</p>
<table>
<thead>
<tr>
<th>规格</th>
<th>GPT-5.4</th>
<th>GPT-5.5</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2026.03.05</td>
<td>2026.04.23</td>
</tr>
<tr>
<td>基座性质</td>
<td>后训练迭代</td>
<td>全新预训练</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>1.05M tokens</td>
<td>1M (API) / 400K (Codex)</td>
</tr>
<tr>
<td>模态支持</td>
<td>文本 + 图像 + 音频</td>
<td><strong>原生全模态(含视频)</strong></td>
</tr>
<tr>
<td>计算机操控</td>
<td>实验性</td>
<td>生产可用级</td>
</tr>
<tr>
<td>Agent 能力</td>
<td>偏好单次触发</td>
<td>全自主循环</td>
</tr>
<tr>
<td>API 定价(输入/输出)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2.50</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">2.50 /</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2.50/</span></span></span></span>15</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5.00</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">5.00 /</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5.00/</span></span></span></span>30</td>
</tr>
<tr>
<td>首 Token 延迟</td>
<td>基准</td>
<td>&lt; 200ms(与 5.4 持平)</td>
</tr>
<tr>
<td>底层硬件</td>
<td>H100 集群</td>
<td><strong>GB200/GB300 NVL72</strong></td>
</tr>
</tbody></table>
<p>值得注意的是, 尽管 GPT-5.5 的 API 定价翻倍, 但其 Token 效率提升了约 40%——完成相同 Codex 任务所需的输出 Token 更少。这意味着实际成本增幅可能低于名义定价增幅。</p>
<h2 id="e-hxjszby-ysqmtjg">二、核心技术转变一：原生全模态架构</h2>
<h3 id="2-1-c-quot-dmtpj-quot-d-quot-ysqmt-quot">2.1 从&quot;多模态拼接&quot;到&quot;原生全模态&quot;</h3>
<p>传统多模态大模型(包括 GPT-4o)本质上属于<strong>后期融合架构</strong>：文本走一个 Transformer 主干, 图像走一个 ViT 编码器, 音频走一个语音编码器, 各模态在中间层或输出层拼接。这种架构的局限在于：</p>
<ol>
<li><strong>信息损耗</strong>：图像特征被压缩为固定数量的视觉 token(如 1024 个), 高分辨率细节丢失; </li>
<li><strong>模态鸿沟</strong>：文本和视觉表征处于不同的语义空间, 跨模态推理需要额外的&quot;桥接&quot;层; </li>
<li><strong>时序断裂</strong>：视频被抽帧为静态图像序列, 帧间动态关系建模能力有限。</li>
</ol>
<p>GPT-5.5 的<strong>原生全模态(Native Omnimodal)<strong>架构实现了质变：所有模态(文本、图像、音频、视频)在预训练阶段就共享</strong>同一套 Token 空间</strong>, 通过统一的 Transformer 主干端到端处理。这意味着：</p>
<ul>
<li>图像不再被编码为离散的视觉 token, 而是与文本 token 一样被嵌入到统一的连续空间中; </li>
<li>视频的时间维度被建模为 token 序列的内在属性, 而非外部拼接的帧序列; </li>
<li>音频的频谱特征直接与文本语义对齐, 无需中间 ASR(自动语音识别)转换。</li>
</ul>
<h3 id="2-2-ty-token-kjdjstzyjjfa">2.2 统一 Token 空间的技术挑战与解决方案</h3>
<p>将图像、音频、视频映射到与文本共享的 Token 空间面临根本性的表征密度差异。以图像为例：一张 1024×1024 的 RGB 图像包含约 300 万个数值(3×1024²), 而等效语义复杂度的文本仅需数十个 token。如果直接将像素值展平为 token, 序列长度将爆炸; 如果过度压缩, 则会丢失细节。</p>
<p>GPT-5.5 采用**分层自适应 Token 化(Hierarchical Adaptive Tokenization)**策略：</p>
<p><strong>(1)图像：从 patch 到语义 Token</strong></p>
<p>图像首先通过轻量级 CNN 编码器提取多尺度特征图(类似 FPN 结构), 然后在特征图层面进行自适应聚类。高信息密度区域(如人脸、文字、小物体)分配更多 token, 低信息密度区域(如天空、墙面)分配更少。Token 分配由一个小型门控网络动态决定：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>N</mi><mtext>patches</mtext></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">⌈</mo><mi>α</mi><mo>⋅</mo><mi>σ</mi><mo stretchy="false">(</mo><mi>W</mi><mo>⋅</mo><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>+</mo><mi>b</mi><mo stretchy="false">)</mo><mo fence="true">⌉</mo></mrow></mrow><annotation encoding="application/x-tex">N_{\\text{patches}}(x, y) = \\left\\lceil \\alpha \\cdot \\sigma(W \\cdot F(x, y) + b) \\right\\rceil</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.109em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">patches</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">⌈</span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">b</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">⌉</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>F</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">F(x, y)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">F</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span></span></span></span> 是位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(x, y)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span></span></span></span> 处的特征向量, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi></mrow><annotation encoding="application/x-tex">\\sigma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span></span></span> 是 sigmoid, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 是全局缩放系数。实验表明, 这种自适应策略在保持图像理解精度的同时, 将视觉序列长度减少了 40-60%。</p>
<p><strong>(2)视频：时空联合 Token 化</strong></p>
<p>视频的处理是 GPT-5.5 最具技术野心的部分。传统方案将视频视为&quot;图像序列 + 时序编码&quot;, 而 GPT-5.5 将视频视为<strong>四维时空张量</strong>(高度 × 宽度 × 时间 × 通道), 通过 3D 卷积 + 时间池化直接提取时空联合特征。关键设计是<strong>可变帧率采样</strong>：模型根据视频内容的动态复杂度自动调整采样帧率——静态场景(如讲座)降低至 1 fps, 动态场景(如体育赛事)提高至 30 fps。</p>
<p><strong>(3)音频：频谱-语义对齐</strong></p>
<p>音频信号通过 Mel 频谱图转换后, 不再经过独立的语音编码器, 而是直接输入与图像共享的 CNN 前端。这一设计的理论基础是：Mel 频谱图在结构上与图像特征图相似(二维时频表示), 可以复用视觉编码器的参数初始化。在预训练中, 模型通过大量&quot;音频-文本对&quot;(如播客、有声书)学习频谱特征到语义概念的映射。</p>
<h3 id="2-3-ysqmtdtlys">2.3 原生全模态的推理优势</h3>
<p>原生全模态架构在以下场景中展现出结构性优势：</p>
<table>
<thead>
<tr>
<th>场景</th>
<th>传统拼接架构</th>
<th>GPT-5.5 原生全模态</th>
</tr>
</thead>
<tbody><tr>
<td>视频问答</td>
<td>抽帧→图像编码→文本融合, 丢失时序因果</td>
<td>端到端时空推理, 理解&quot;因为…所以…&quot;动态</td>
</tr>
<tr>
<td>图像中的文字理解</td>
<td>OCR 模块提取文字→文本模型处理, 两步误差累积</td>
<td>视觉-文本统一表征, 直接回答图中文字问题</td>
</tr>
<tr>
<td>音频+视觉联合理解</td>
<td>ASR 转文字→与视觉拼接, 口语化信息丢失</td>
<td>音频频谱直接入模, 捕捉语气、情绪、背景音</td>
</tr>
<tr>
<td>跨模态一致性检验</td>
<td>各模态独立编码后对比, 对齐困难</td>
<td>统一空间中直接计算模态间距离</td>
</tr>
</tbody></table>
<p>在 MMMU-Pro(大学级多学科多模态推理基准)上, GPT-5.5 取得 76 分, 较 GPT-5.4 的 69.2 分提升显著, 验证了原生全模态在复杂推理任务上的优势。</p>
<h2 id="s-hxjszbe-agent-dxdyxlmb">三、核心技术转变二：Agent 导向的预训练目标</h2>
<h3 id="3-1-c-quot-ycxyg-token-quot-d-quot-ghbzhmb-quot">3.1 从&quot;预测下一个 Token&quot;到&quot;规划并执行目标&quot;</h3>
<p>传统大语言模型的预训练目标是<strong>因果语言建模(CLM)</strong>：给定前缀 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">x_{&lt;t}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6079em;vertical-align:-0.1774em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span></span></span></span>, 预测下一个 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">x_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的概率分布。这一目标本质上是一种<strong>被动响应机制</strong>——模型学习的是&quot;什么样的文本是连贯的&quot;, 而非&quot;如何主动完成目标&quot;。</p>
<p>GPT-5.5 在预训练阶段引入了<strong>Agent 导向的多任务目标(Agent-Oriented Multi-Task Objective, AOMTO)</strong>, 将预训练从&quot;文本续写&quot;扩展为&quot;目标驱动规划&quot;。AOMTO 包含三个子目标：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>AOMTO</mtext></msub><mo>=</mo><msub><mi>λ</mi><mn>1</mn></msub><mo>⋅</mo><msub><mi mathvariant="script">L</mi><mtext>CLM</mtext></msub><mo>+</mo><msub><mi>λ</mi><mn>2</mn></msub><mo>⋅</mo><msub><mi mathvariant="script">L</mi><mtext>plan</mtext></msub><mo>+</mo><msub><mi>λ</mi><mn>3</mn></msub><mo>⋅</mo><msub><mi mathvariant="script">L</mi><mtext>tool</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{AOMTO}} = \\lambda_1 \\cdot \\mathcal{L}_{\\text{CLM}} + \\lambda_2 \\cdot \\mathcal{L}_{\\text{plan}} + \\lambda_3 \\cdot \\mathcal{L}_{\\text{tool}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">AOMTO</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">CLM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">plan</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tool</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p><strong>(1)规划目标 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>plan</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{plan}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">plan</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></strong></p>
<p>模型接收一个高层目标描述(如&quot;帮我策划一场 50 人的产品发布会&quot;), 需要生成完整的执行计划：</p>
<pre><code>目标：策划 50 人产品发布会
计划：
1. [调研] 查询场地信息(工具：搜索引擎)
2. [决策] 根据预算选择场地(工具：计算器)
3. [执行] 发送邀请函(工具：邮件 API)
4. [验证] 确认回复人数(工具：邮件 API)
5. [调整] 若回复 &gt; 50, 扩大场地或分批
</code></pre>
<p>训练数据来源于合成：使用 GPT-5.4 生成 1000 万条&quot;目标-计划&quot;对, 然后由人类标注员审核并修正。规划目标迫使模型学习<strong>任务分解(Task Decomposition)<strong>和</strong>依赖关系建模(Dependency Modeling)</strong>——识别哪些步骤可以并行、哪些必须串行、哪些存在条件分支。</p>
<p><strong>(2)工具调用目标 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>tool</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{tool}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">tool</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></strong></p>
<p>模型学习在适当的时候&quot;停下文本生成&quot;并&quot;发起工具调用&quot;。具体实现上, 预训练语料中穿插了大量工具调用记录：</p>
<pre><code>用户：北京今天天气如何？
助手：我来查询一下。&lt;tool_call&gt;{&quot;name&quot;: &quot;weather_api&quot;, &quot;params&quot;: {&quot;city&quot;: &quot;北京&quot;, &quot;date&quot;: &quot;today&quot;}}&lt;/tool_call&gt;
&lt;tool_result&gt;{&quot;temperature&quot;: &quot;25°C&quot;, &quot;condition&quot;: &quot;晴&quot;}&lt;/tool_result&gt;
北京今天晴天, 气温 25°C, 适合外出。
</code></pre>
<p>工具调用目标采用特殊的损失掩码策略：对于 <code>&lt;tool_call&gt;</code> 和 <code>&lt;/tool_result&gt;</code> 之间的内容, 模型只学习&quot;何时调用&quot;和&quot;如何解析结果&quot;, 而不学习工具内部的实现细节(因为不同工具的输出格式不同)。</p>
<p><strong>(3)自我验证目标 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>verify</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{verify}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">verify</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></strong></p>
<p>这是 AOMTO 中最具创新性的部分。模型被训练在执行多步任务后, 主动检查中间结果的正确性：</p>
<pre><code>[步骤 3 执行后]
验证：已发送 50 封邀请函, 但仅收到 32 封回复。
判断：回复率 64%, 低于预期的 80%。
修正：扩大邀请范围至 70 人, 或调整活动日期。
</code></pre>
<p>自我验证目标的数据来源于&quot;失败案例挖掘&quot;：收集 GPT-5.4 在实际任务中的失败轨迹, 人工标注&quot;错误点&quot;和&quot;修正策略&quot;, 然后让 GPT-5.5 在预训练中学习这些&quot;从错误中恢复&quot;的模式。</p>
<h3 id="3-2-bhzh-cghdwcdzzxh">3.2 闭环执行：从规划到完成的自主循环</h3>
<p>GPT-5.5 的 Agent 能力不仅体现在预训练目标上, 更体现在<strong>推理时的闭环执行机制</strong>。当用户提交一个复杂任务时, 模型进入&quot;自主循环&quot;模式：</p>
<pre><code>while task_not_complete:
    1. 评估当前状态(State Assessment)
    2. 选择下一步行动(Action Selection)
       - 选项 A：继续文本生成(回答用户)
       - 选项 B：调用工具(查询、计算、执行)
       - 选项 C：请求澄清(信息不足时)
    3. 执行行动并观察结果
    4. 更新状态并检查完成条件
</code></pre>
<p>与传统 ReAct 框架(Reasoning + Acting)不同, GPT-5.5 的闭环机制是<strong>内生的</strong>——模型在预训练阶段就学习了&quot;循环控制&quot;的语义表示, 而非通过外部提示工程或工作流编排实现。这使得 GPT-5.5 在处理模糊需求时表现出色：即使用户输入&quot;帮我搞定下周一的汇报材料&quot;这样不明确的指令, 模型也能自主推断所需步骤(确定汇报主题→收集数据→制作 PPT→发送邮件)。</p>
<p>在 OSWorld-Verified 基准(真实计算机环境操作评测)上, GPT-5.5 达到 78.7%, 较 GPT-5.4 的约 72% 有显著提升, 证明其 Agent 闭环执行能力已达到生产可用级别。</p>
<h2 id="s-hxjszbs-yjxtsjytlxs">四、核心技术转变三：硬件协同设计与推理效率</h2>
<h3 id="4-1-gb200-gb300-nvl72-lhsj">4.1 GB200/GB300 NVL72 联合设计</h3>
<p>GPT-5.5 是与 NVIDIA GB200 和 GB300 NVL72 机架系统<strong>联合设计</strong>的。这并非简单的&quot;在最新硬件上训练&quot;, 而是从架构到部署的端到端协同优化：</p>
<p><strong>(1)稀疏注意力与硬件对齐</strong></p>
<p>GPT-5.5 采用**动态稀疏注意力(Dynamic Sparse Attention)**机制。与传统 Full Attention 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度不同, 稀疏注意力对每个 query 只选择最相关的 key/value 子集进行计算。GPT-5.5 的稀疏策略与 GB200 的 Tensor Core 特性深度对齐：</p>
<ul>
<li>选择粒度为 128×128 的块(block), 匹配 Tensor Core 的矩阵乘法单元尺寸; </li>
<li>通过 Lightning Indexer 进行 Top-k 块选择, 将索引计算 offload 到 GPU 的专用单元; </li>
<li>利用 NVLink 72 的高带宽(1.8 TB/s), 在节点间快速交换 KV Cache。</li>
</ul>
<p><strong>(2)动态负载均衡与分区启发式</strong></p>
<p>传统推理服务的负载均衡采用静态区块分配——将请求拆分为固定数量的块以平衡计算核心。GPT-5.5 团队使用 Codex(OpenAI 的编程 Agent)分析了数周的生产流量模式, 编写了<strong>定制化的动态分区启发式算法</strong>：</p>
<pre><code class="language-python"># 概念性伪代码(基于 OpenAI 博客描述)
def adaptive_partition(requests, gpu_capacity):
    # 分析请求的特征：输入长度、预期输出长度、模态类型
    features = extract_features(requests)
    # 使用学习到的启发式规则动态调整分区大小
    partition_sizes = learned_heuristic(features, gpu_capacity)
    # 确保同一 GPU 上的请求互补(长输入+短输出 vs 短输入+长输出)
    return balanced_pack(partition_sizes)
</code></pre>
<p>这一优化将 Token 生成速度提升了 <strong>20% 以上</strong>, 使得 GPT-5.5 在参数量大幅增加的情况下, 保持了与 GPT-5.4 相当的单 Token 延迟(&lt; 200ms)。</p>
<p><strong>(3)推理-训练反馈循环</strong></p>
<p>OpenAI 在博客中提到一个有趣的细节：&quot;GPT-5.5 甚至亲自参与了系统底层栈的改进与实现。&quot;具体而言, 团队使用 GPT-5.5 自身辅助生成 CUDA 内核优化代码和调度策略, 然后在新硬件上验证, 将有效的优化反哺到推理服务中。这种<strong>模型辅助基础设施优化</strong>的闭环, 可能成为未来大模型部署的标准范式。</p>
<h3 id="4-2-cbxsfx">4.2 成本效率分析</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>GPT-5.4</th>
<th>GPT-5.5</th>
<th>变化</th>
</tr>
</thead>
<tbody><tr>
<td>API 输入价格 (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">/M tokens) |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣</span></span></span></span>2.50</td>
<td>\$5.00</td>
<td>+100%</td>
<td></td>
</tr>
<tr>
<td>API 输出价格 (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">/M tokens) |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣</span></span></span></span>15.00</td>
<td>\$30.00</td>
<td>+100%</td>
<td></td>
</tr>
<tr>
<td>完成相同任务的平均 Token 数</td>
<td>基准</td>
<td>-40%</td>
<td>-40%</td>
</tr>
<tr>
<td>实际有效成本(归一化)</td>
<td>1.0</td>
<td><strong>~0.9</strong></td>
<td><strong>-10%</strong></td>
</tr>
<tr>
<td>每兆瓦每秒 Token 输出</td>
<td>基准</td>
<td>50×</td>
<td>+4900%</td>
</tr>
</tbody></table>
<p>从上表可见, 尽管名义定价翻倍, 但由于 Token 效率提升 40%, 实际有效成本反而略有下降。更重要的是, 每兆瓦的吞吐量提升了 50 倍, 这意味着在数据中心级别, GPT-5.5 的能源效率远超前代。</p>
<h2 id="w-xnpgyhxdb">五、性能评估与横向对比</h2>
<h3 id="5-1-bcy-agent-nl">5.1 编程与 Agent 能力</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>GPT-5.4</th>
<th>GPT-5.5</th>
<th>DeepSeek-V4</th>
<th>Claude-Sonnet-4.5</th>
</tr>
</thead>
<tbody><tr>
<td>Terminal-Bench 2.0</td>
<td>75.1%</td>
<td><strong>82.7%</strong></td>
<td>79.3%</td>
<td>80.5%</td>
</tr>
<tr>
<td>SWE-Bench Pro</td>
<td>57.7%</td>
<td><strong>58.6%</strong></td>
<td>55.2%</td>
<td>56.8%</td>
</tr>
<tr>
<td>Expert-SWE (内部)</td>
<td>68.5%</td>
<td><strong>73.1%</strong></td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>OSWorld-Verified</td>
<td>~72%</td>
<td><strong>78.7%</strong></td>
<td>75.4%</td>
<td>76.2%</td>
</tr>
</tbody></table>
<p>GPT-5.5 在编程 Agent 任务上全面领先。Terminal-Bench 2.0 测试的是复杂命令行流程处理(如&quot;在 Docker 中构建项目、运行测试、修复失败的测试用例&quot;), GPT-5.5 的 82.7% 意味着它能在超过 4/5 的场景中独立完成终端级开发任务。</p>
<h3 id="5-2-kxtlysx">5.2 科学推理与数学</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>GPT-5.4</th>
<th>GPT-5.5</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>FrontierMath</td>
<td>39.6%</td>
<td><strong>51.7%</strong></td>
<td>前沿数学难题, Tier 3/4 达 35.4%</td>
</tr>
<tr>
<td>AIME 2025</td>
<td>65.4</td>
<td><strong>81.2</strong></td>
<td>美国数学邀请赛</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>78.3%</td>
<td><strong>84.9%</strong></td>
<td>博士级科学问答</td>
</tr>
<tr>
<td>Humanity&#39;s Last Exam</td>
<td>39.8%</td>
<td><strong>57.2%</strong></td>
<td>人类最后考试</td>
</tr>
</tbody></table>
<p>FrontierMath 是 OpenAI 内部设立的高难度数学基准, Tier 3/4 题目接近研究前沿。GPT-5.5 的 51.7% 意味着它已能解决约一半的前沿数学问题, 这对于辅助数学研究具有实际价值。</p>
<h3 id="5-3-aqxydq">5.3 安全性与对齐</h3>
<p>GPT-5.5 在发布时同步强化了安全评估：</p>
<ul>
<li><strong>CyberGym</strong>：81.8%, 测试模型在网络安全场景中的防御性能力(如识别漏洞、编写安全补丁); </li>
<li><strong>生物化学能力评估</strong>：限制模型获取可能被滥用的生化知识; </li>
<li><strong>红队测试</strong>：由外部安全专家进行对抗性测试, 针对越狱、提示注入等攻击向量; </li>
<li><strong>幻觉率</strong>：OpenAI 自测降低 60%, 在医疗、法律、金融等敏感领域提供更可靠的输出。</li>
</ul>
<h2 id="l-jxyzy">六、局限与争议</h2>
<h3 id="6-1-jsjx">6.1 技术局限</h3>
<ol>
<li><strong>闭源与透明度</strong>：GPT-5.5 的架构细节(参数量、层数、注意力机制的具体设计)完全未公开, 学术界无法复现或验证其宣称的性能; </li>
<li><strong>视频理解的边界</strong>：尽管宣称&quot;原生全模态&quot;, 但 OpenAI 未公布视频理解的详细基准。业界猜测长视频(&gt; 10 分钟)的时序推理仍可能存在挑战; </li>
<li><strong>Agent 循环的可靠性</strong>：自主循环在处理开放域任务时仍可能陷入无限循环或错误累积, 需要人类监督; </li>
<li><strong>上下文窗口的实用限制</strong>：1M token 的理论上下文在实际使用中受限于推理成本和注意力衰减, 有效利用窗口可能仅为理论值的 30-50%。</li>
</ol>
<h3 id="6-2-syzy">6.2 商业争议</h3>
<ul>
<li><strong>定价策略</strong>：API 价格翻倍引发开发者社区争议, 部分中小企业可能转向更具性价比的替代方案(如 DeepSeek-V4、Claude-Haiku); </li>
<li><strong>Pro 版本分层</strong>：GPT-5.5 Pro 仅限最高档订阅用户, 进一步加剧了 AI 能力的&quot;数字鸿沟&quot;; </li>
<li><strong>能源消耗</strong>：尽管每兆瓦效率提升, 但更大规模的模型训练和推理仍带来显著的碳足迹。</li>
</ul>
<h2 id="q-zj">七、总结</h2>
<p>GPT-5.5 是 OpenAI 从&quot;语言模型&quot;向&quot;通用智能体&quot;演进的关键一步。其三大核心技术转变——<strong>原生全模态架构</strong>、<strong>Agent 导向预训练目标</strong>、<strong>硬件协同设计</strong>——分别解决了多模态融合、自主执行、推理效率三大瓶颈。</p>
<p>原生全模态架构通过统一 Token 空间和分层自适应 Token 化, 实现了真正的端到端跨模态理解; Agent 导向预训练目标将&quot;规划-执行-验证&quot;的内生能力注入模型, 使其从被动响应者进化为主动执行者; 与 NVIDIA GB200/GB300 的联合设计则在硬件层面确保了性能跃升不以延迟为代价。</p>
<p>对于开发者和企业用户, GPT-5.5 的价值主张是明确的：它能在更少人工干预的情况下完成更复杂的真实工作——无论是编写代码、操作计算机、还是进行深度研究。但其闭源性质和高昂定价也意味着, OpenAI 正在将技术领先优势转化为商业护城河。在开源模型(如 DeepSeek-V4、Qwen3.5)快速追赶的背景下, GPT-5.5 能否维持其市场地位, 将取决于其后续迭代速度和生态建设能力。</p>
<hr>
<blockquote>
<p>📚 <strong>延伸阅读</strong></p>
<ul>
<li><a href="https://openai.com/zh-Hans-CN/index/introducing-gpt-5-5/">OpenAI GPT-5.5 官方发布博客</a></li>
<li><a href="https://openai.com/index/introducing-codex/">OpenAI Codex 官方文档</a></li>
<li><a href="https://www.nvidia.com/en-us/data-center/gb200-nvl72/">NVIDIA GB200 NVL72 技术白皮书</a></li>
<li><a href="https://arxiv.org/abs/2304.07954">OSWorld 基准测试论文</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.3-国外大模型/OpenAI/05-GPT-5.5-原生全模态架构与Agent导向的预训练范式.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyzldw","text":"一、发布背景与战略定位"},{"level":2,"id":"e-hxjszby-ysqmtjg","text":"二、核心技术转变一：原生全模态架构"},{"level":3,"id":"2-1-c-quot-dmtpj-quot-d-quot-ysqmt-quot","text":"2.1 从&quot;多模态拼接&quot;到&quot;原生全模态&quot;"},{"level":3,"id":"2-2-ty-token-kjdjstzyjjfa","text":"2.2 统一 Token 空间的技术挑战与解决方案"},{"level":3,"id":"2-3-ysqmtdtlys","text":"2.3 原生全模态的推理优势"},{"level":2,"id":"s-hxjszbe-agent-dxdyxlmb","text":"三、核心技术转变二：Agent 导向的预训练目标"},{"level":3,"id":"3-1-c-quot-ycxyg-token-quot-d-quot-ghbzhmb-quot","text":"3.1 从&quot;预测下一个 Token&quot;到&quot;规划并执行目标&quot;"},{"level":3,"id":"3-2-bhzh-cghdwcdzzxh","text":"3.2 闭环执行：从规划到完成的自主循环"},{"level":2,"id":"s-hxjszbs-yjxtsjytlxs","text":"四、核心技术转变三：硬件协同设计与推理效率"},{"level":3,"id":"4-1-gb200-gb300-nvl72-lhsj","text":"4.1 GB200/GB300 NVL72 联合设计"},{"level":3,"id":"4-2-cbxsfx","text":"4.2 成本效率分析"},{"level":2,"id":"w-xnpgyhxdb","text":"五、性能评估与横向对比"},{"level":3,"id":"5-1-bcy-agent-nl","text":"5.1 编程与 Agent 能力"},{"level":3,"id":"5-2-kxtlysx","text":"5.2 科学推理与数学"},{"level":3,"id":"5-3-aqxydq","text":"5.3 安全性与对齐"},{"level":2,"id":"l-jxyzy","text":"六、局限与争议"},{"level":3,"id":"6-1-jsjx","text":"6.1 技术局限"},{"level":3,"id":"6-2-syzy","text":"6.2 商业争议"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.12-openai/25-gpt-5.5/05-gpt-5.5-ysqmtjgy-agent-dxdyxlfs" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.12-openai/25-gpt-5.5/05-gpt-5.5-ysqmtjgy-agent-dxdyxlfs" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GPT-5.5：原生全模态架构与 Agent 导向的预训练范式</h1>
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
