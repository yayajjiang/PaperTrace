"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Gemini 3.1 Pro：动态测试时计算与原生多模态生成引擎</h1>
<h2 id="y-fbbjyzldw">一、发布背景与战略定位</h2>
<p>2026 年 2 月 19 日，Google DeepMind 发布 Gemini 3.1 Pro，这是 Gemini 系列首次采用&quot;.1&quot;中期版本命名——此前谷歌习惯用&quot;.5&quot;标识中期更新。命名规则的改变本身即传递了信号：3.1 Pro 的推理和智能体性能跃升幅度，堪比一次主版本升级。</p>
<p>Gemini 3.1 Pro 的核心定位是&quot;普惠式高性能旗舰&quot;——在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi mathvariant="normal">/</mi><mtext>百万输入</mtext><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mtext>、</mtext></mrow><annotation encoding="application/x-tex">2/百万输入 token、</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2/</span><span class="mord cjk_fallback">百万输入</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord cjk_fallback">、</span></span></span></span>12/百万输出 token 的定价下(与 3.0 Pro 持平)，提供比肩顶级模型的推理实力。这一性价比策略使 Gemini 3.1 Pro 的输入价格仅为 Claude Opus 4.6 的 1/7.5，却能在多项基准上超越后者。</p>
<table>
<thead>
<tr>
<th>规格</th>
<th>Gemini 3.0 Pro</th>
<th>Gemini 3.1 Pro</th>
</tr>
</thead>
<tbody><tr>
<td>发布日期</td>
<td>2025.11.18</td>
<td>2026.02.19</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>1M tokens</td>
<td><strong>1M 输入 / 64K 输出</strong></td>
</tr>
<tr>
<td>核心架构</td>
<td>稀疏 MoE</td>
<td>稀疏 MoE + 动态测试时计算</td>
</tr>
<tr>
<td>思考模式</td>
<td>三级(Low/Med/High)</td>
<td>三级 + <strong>Deep Think Mini</strong></td>
</tr>
<tr>
<td>原生多模态生成</td>
<td>文本+图像+音频</td>
<td><strong>+ 视频(Veo 引擎)</strong></td>
</tr>
<tr>
<td>ARC-AGI-2</td>
<td>~35%</td>
<td><strong>77.1%</strong></td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td>~91.9%</td>
<td><strong>94.3%</strong></td>
</tr>
<tr>
<td>MCP Atlas</td>
<td>—</td>
<td><strong>69.2%</strong></td>
</tr>
<tr>
<td>API 定价(输入/输出)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">2 /</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2/</span></span></span></span>12</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">2 /</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2/</span></span></span></span>12</td>
</tr>
</tbody></table>
<p>ARC-AGI-2 从约 35% 飙升至 77.1%——两倍以上的提升——标志着 Gemini 3.1 Pro 在抽象推理和模式识别能力上实现了质变。这一基准专门测试模型对全新模式的泛化能力(而非记忆训练数据)，77.1% 的成绩意味着模型已具备接近人类水平的抽象归纳能力。</p>
<h2 id="e-hxjsy-dtcssjsjg">二、核心技术一：动态测试时计算架构</h2>
<h3 id="2-1-c-quot-gdsl-quot-d-quot-axsl-quot">2.1 从&quot;固定算力&quot;到&quot;按需算力&quot;</h3>
<p>传统大模型的推理过程是&quot;固定算力消耗&quot;——无论问题简单还是复杂，每个 token 的计算量是恒定的。这导致两种浪费：简单问题消耗了过多的冗余计算，复杂问题又因算力受限而得不到充分推理。</p>
<p>Gemini 3.1 Pro 引入了<strong>动态测试时计算(Dynamic Test-Time Compute)<strong>架构，核心思想是：<strong>让模型根据任务复杂度自主决定投入多少计算资源</strong>。这不是简单的&quot;思考时间更长&quot;，而是</strong>在推理过程中动态调整计算路径的深度和宽度</strong>。</p>
<h3 id="2-2-sjskxtdgcsx">2.2 三级思考系统的工程实现</h3>
<p>Gemini 3.1 Pro 的三级思考系统通过 <code>thinking_level</code> 参数暴露给开发者：</p>
<p><strong>LOW 模式：快速响应</strong></p>
<ul>
<li>激活专家数量：约 5-8 个(总专家池的 3-5%)</li>
<li>注意力层数：仅使用前 60% 的 Transformer 层</li>
<li>适用场景：翻译、分类、简单问答</li>
<li>延迟：&lt; 500ms</li>
</ul>
<p><strong>MEDIUM 模式：均衡默认</strong></p>
<ul>
<li>激活专家数量：约 15-20 个(总专家池的 10-12%)</li>
<li>注意力层数：使用全部 Transformer 层，但局部注意力窗口较小</li>
<li>适用场景：日常对话、文档摘要、代码补全</li>
<li>延迟：1-2s</li>
</ul>
<p><strong>HIGH 模式：Deep Think Mini</strong></p>
<ul>
<li>激活专家数量：约 30-40 个(总专家池的 20-25%)</li>
<li>注意力层数：全部层 + 扩展的全局注意力窗口</li>
<li>核心机制：<strong>并行多路径推理 + 内部评估筛选</strong></li>
<li>适用场景：数学证明、复杂代码架构设计、研究级逻辑推理</li>
<li>延迟：5-30s(取决于问题复杂度)</li>
</ul>
<h3 id="2-3-deep-think-mini-bhdljtl">2.3 Deep Think Mini：并行多路径推理</h3>
<p>HIGH 模式的核心是 Deep Think Mini——一种受 Gemini Deep Think 启发的轻量级多步推理机制。与传统 Chain-of-Thought 的线性推理不同，Deep Think Mini 采用<strong>树状并行推理</strong>：</p>
<pre><code>问题输入
    ↓
生成 3-5 个初始假设(Hypotheses)
    ↓
并行展开每条假设的推理链
    ├─→ 假设 A → 推理 A1 → 推理 A2 → 结果 A
    ├─→ 假设 B → 推理 B1 → 推理 B2 → 结果 B
    └─→ 假设 C → 推理 C1 → 推理 C2 → 结果 C
    ↓
内部评估器(Internal Evaluator)对每条链打分
    ↓
选择得分最高的链作为最终输出
</code></pre>
<p>内部评估器是一个小型神经网络， trained on 大量&quot;推理链-正确性&quot;对，学会识别逻辑漏洞、计算错误和概念混淆。在 AIME 2025 数学竞赛基准上，启用 Deep Think Mini 使准确率从 MEDIUM 模式的 72% 提升至 <strong>88%</strong>。</p>
<h3 id="2-4-swqmjz-jjtlpy">2.4 思维签名机制：解决推理漂移</h3>
<p>在长时间的多步 Agent 任务中，模型经常出现<strong>推理漂移(Reasoning Drift)</strong>——随着步骤推进，模型逐渐偏离原始目标，陷入无关细节的纠缠。Gemini 3.1 Pro 引入了**思维签名(Thought Signature)**机制来对抗这一问题：</p>
<p>在每个推理步骤后，模型生成一个&quot;签名向量&quot; <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>t</mi></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mn>128</mn></msup></mrow><annotation encoding="application/x-tex">s_t \\in \\mathbb{R}^{128}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">128</span></span></span></span></span></span></span></span></span></span></span></span>，该向量压缩了当前步骤的核心语义。签名向量与初始目标的签名 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mn>0</mn></msub></mrow><annotation encoding="application/x-tex">s_0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 进行余弦相似度比较：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>DriftScore</mtext><mi>t</mi></msub><mo>=</mo><mn>1</mn><mo>−</mo><mi>cos</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>s</mi><mi>t</mi></msub><mo separator="true">,</mo><msub><mi>s</mi><mn>0</mn></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{DriftScore}_t = 1 - \\cos(s_t, s_0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">DriftScore</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">cos</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></span><p>当 DriftScore 超过阈值(如 0.3)时，模型触发<strong>回溯机制(Backtracking)</strong>：回退到最近的高相似度步骤，重新选择推理方向。实验表明，思维签名机制将多步 Agent 任务的成功率提升了 <strong>18%</strong>。</p>
<h2 id="s-hxjse-ysdmtscyq">三、核心技术二：原生多模态生成引擎</h2>
<h3 id="3-1-c-quot-cjty-quot-d-quot-dcys-quot">3.1 从&quot;插件调用&quot;到&quot;底层原生&quot;</h3>
<p>Gemini 3.0 Pro 的多模态生成依赖于外部模型的插件调用——图像生成调用 Imagen，视频生成调用 Veo，音频生成调用 Lyria。这种模式存在明显的<strong>模态鸿沟</strong>：各生成模型独立训练，输出结果在语义空间中对齐困难，导致&quot;文不对图&quot;或&quot;音画不同步&quot;的问题。</p>
<p>Gemini 3.1 Pro 将多模态生成能力<strong>内化到模型底层</strong>，实现了真正的&quot;原生多模态生成引擎&quot;：</p>
<p><strong>Nano Banana：高保真图像生成</strong></p>
<p>替代了前代的 Imagen 插件，Nano Banana 是 Gemini 3.1 Pro 内置的视觉生成模块。核心改进：</p>
<ul>
<li><strong>文本渲染精度</strong>：解决了前代模型生成图像中文字&quot;乱码&quot;的顽疾，能够准确渲染指定拼写的文字(如指示牌、海报内容); </li>
<li><strong>多图组合与局部重绘</strong>：支持通过多轮对话迭代修改图像的局部区域，保持全局一致性; </li>
<li><strong>分辨率自适应</strong>：根据输出用途自动选择分辨率(社交媒体的 512×512 到印刷级的 2048×2048)。</li>
</ul>
<p><strong>Veo：原生视频生成</strong></p>
<p>Gemini 3.1 Pro 最显著的架构升级是接入 Veo 视频生成引擎。不同于前代的低帧率 GIF 生成，Veo 支持：</p>
<ul>
<li><strong>视听同步</strong>：生成视频画面的同时，根据文本提示生成匹配的<strong>原生环境音</strong>; </li>
<li><strong>参考图像引导</strong>：输入参考图像引导视频的风格、色调和构图走向; </li>
<li><strong>视频延长</strong>：在现有 Veo 视频基础上延长时长，保持风格和内容的连贯性。</li>
</ul>
<p><strong>Lyria 3：多模态音乐生成</strong></p>
<p>Lyria 3 是 Gemini 3.1 Pro 内置的音乐生成引擎，支持：</p>
<ul>
<li><strong>文本到音乐</strong>：根据风格描述生成完整音轨; </li>
<li><strong>视觉到音乐</strong>：解析用户上传的图像或视频，将其视觉氛围转换为听觉变量; </li>
<li><strong>自动歌词编写</strong>：生成多语言的真实人声歌词; </li>
<li><strong>SynthID 水印</strong>：所有产出音频强制嵌入不可感知的水印，用于版权追溯。</li>
</ul>
<h3 id="3-2-ty-token-kjdkmtsc">3.2 统一 Token 空间的跨模态生成</h3>
<p>原生多模态生成的技术基础是<strong>统一 Token 空间</strong>。文本、图像、音频、视频在模型内部被转化为同质的 Token 序列：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mtext>Token</mtext><mtext>unified</mtext></msub><mo>=</mo><msub><mtext>Encoder</mtext><mtext>modality</mtext></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>d</mi><mo>×</mo><mi>n</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\text{Token}_{\\text{unified}} = \\text{Encoder}_{\\text{modality}}(x) \\in \\mathbb{R}^{d \\times n}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord text"><span class="mord">Token</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">unified</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord text"><span class="mord">Encoder</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">modality</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8991em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">n</span></span></span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 可以是文本字符串、图像张量、音频波形或视频帧序列。所有模态共享同一套 Transformer 解码器进行自回归生成，这意味着：</p>
<ul>
<li>模型可以在生成文本的过程中&quot;无缝切换&quot;到图像生成(如&quot;下面我画个示意图&quot;); </li>
<li>视频生成不再是&quot;先生成图像再串成视频&quot;，而是在 Token 级别直接建模时序依赖; </li>
<li>跨模态编辑变得自然——&quot;把刚才生成的图片中的天空改成黄昏色调，同时配乐换成爵士乐&quot;。</li>
</ul>
<h2 id="s-hxjss-xs-moe-y-tpu-xtyh">四、核心技术三：稀疏 MoE 与 TPU 协同优化</h2>
<h3 id="4-1-wyjxs-moe-jg">4.1 万亿级稀疏 MoE 架构</h3>
<p>Gemini 3.1 Pro 采用稀疏混合专家(Sparse MoE)架构，总参数量达万亿级，但每次推理仅激活约 10-25% 的专家子网络(取决于思考级别)。门控网络根据输入语义动态路由 token 到最合适的专家：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mtext>TopK</mtext><mo stretchy="false">(</mo><mtext>softmax</mtext><mo stretchy="false">(</mo><msub><mi>W</mi><mi>g</mi></msub><mo>⋅</mo><mi>x</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mi>k</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">g(x) = \\text{TopK}(\\text{softmax}(W_g \\cdot x), k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">TopK</span></span><span class="mopen">(</span><span class="mord text"><span class="mord">softmax</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mclose">)</span></span></span></span></span><span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Output</mtext><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>g</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow></munder><msub><mi>g</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>⋅</mo><msub><mi>E</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\text{Output} = \\sum_{i \\in g(x)} g_i(x) \\cdot E_i(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Output</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.566em;vertical-align:-1.516em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">)</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.516em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个专家网络，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>g</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">g_i(x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span> 是该专家的路由权重。Gemini 3.1 Pro 的专家数量较前代有所增加，且专家专业化程度更高——部分专家专门处理数学推理，部分专门处理代码生成，部分专门处理视觉理解。</p>
<h3 id="4-2-tpu-v6-xtsj">4.2 TPU v6 协同设计</h3>
<p>Gemini 3.1 Pro 与 Google 自研的 TPU v6(Trillium)进行了深度协同优化：</p>
<ul>
<li><strong>专家并行</strong>：不同专家分布在不同的 TPU 芯片上，通过高速互连(ICI，Inter-Chip Interconnect)进行通信; </li>
<li><strong>动态负载均衡</strong>：TPU 的调度器根据门控网络的输出预测，提前将相关专家加载到计算核心，减少冷启动延迟; </li>
<li><strong>稀疏计算加速</strong>：TPU v6 的矩阵乘法单元针对稀疏矩阵进行了特化优化，将稀疏 MoE 的计算效率提升了 40%。</li>
</ul>
<h3 id="4-3-nxbx">4.3 能效表现</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>Tokens / kWh</th>
<th>定位</th>
</tr>
</thead>
<tbody><tr>
<td>Gemini 3.0-Flash-Lite</td>
<td>6,100,000</td>
<td>超轻量</td>
</tr>
<tr>
<td>Gemini 3.0-Flash</td>
<td>4,300,000</td>
<td>轻量/高速</td>
</tr>
<tr>
<td>Gemini 3.0-Pro</td>
<td>620,000</td>
<td>超大型</td>
</tr>
<tr>
<td>Gemini 3.0-Ultra</td>
<td>350,000</td>
<td>旗舰</td>
</tr>
</tbody></table>
<p>Gemini 3.1 Pro 的能效介于 3.0-Pro 和 3.0-Ultra 之间，通过动态测试时计算避免了&quot;一刀切&quot;的算力浪费——简单任务消耗接近 Flash 级别的能耗，复杂任务才启用全量计算。</p>
<h2 id="w-xnpgyjpdb">五、性能评估与竞品对比</h2>
<h3 id="5-1-cxtlykxtl">5.1 抽象推理与科学推理</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Gemini 3.1 Pro</th>
<th>Claude Opus 4.6</th>
<th>GPT-5.4</th>
</tr>
</thead>
<tbody><tr>
<td>ARC-AGI-2</td>
<td><strong>77.1%</strong></td>
<td>68.8%</td>
<td>73.3%</td>
</tr>
<tr>
<td>GPQA Diamond</td>
<td><strong>94.3%</strong></td>
<td>91.3%</td>
<td>92.8%</td>
</tr>
<tr>
<td>Humanity&#39;s Last Exam</td>
<td><strong>37.5%</strong></td>
<td>—</td>
<td>—</td>
</tr>
</tbody></table>
<p>ARC-AGI-2 是专门测试全新模式识别能力的基准，Gemini 3.1 Pro 的 77.1% 是公开模型中的最高分，验证了动态测试时计算在抽象推理上的有效性。</p>
<h3 id="5-2-bcygjsy">5.2 编程与工具使用</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Gemini 3.1 Pro</th>
<th>Claude Opus 4.6</th>
<th>GPT-5.4</th>
</tr>
</thead>
<tbody><tr>
<td>LiveCodeBench Pro</td>
<td><strong>2887 Elo</strong></td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>MCP Atlas</td>
<td><strong>69.2%</strong></td>
<td>59.5%</td>
<td>68.1%</td>
</tr>
<tr>
<td>SWE-bench Verified</td>
<td>80.6%</td>
<td><strong>80.8%</strong></td>
<td>~75%</td>
</tr>
</tbody></table>
<p>在工具协调(MCP Atlas)上，Gemini 3.1 Pro 领先 Claude Opus 4.6 近 10 个百分点，证明其原生 Agent 架构在多工具编排上的优势。</p>
<h3 id="5-3-dmtlj">5.3 多模态理解</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Gemini 3.1 Pro</th>
<th>Gemini 3.0 Pro</th>
<th>GPT-5.5</th>
</tr>
</thead>
<tbody><tr>
<td>Video-MMMU</td>
<td><strong>~90%+</strong></td>
<td>87.6%</td>
<td>—</td>
</tr>
<tr>
<td>ScreenSpot-Pro</td>
<td><strong>72.7%</strong></td>
<td>—</td>
<td>—</td>
</tr>
<tr>
<td>MMMU-Pro</td>
<td><strong>75.8%</strong></td>
<td>—</td>
<td>76.0%</td>
</tr>
</tbody></table>
<h3 id="5-4-cbxsdb">5.4 成本效率对比</h3>
<p>| 模型 | 输入 (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mi>M</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mtext>输出</mtext><mo stretchy="false">(</mo></mrow><annotation encoding="application/x-tex">/M) | 输出 (</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mclose">)</span><span class="mord">∣</span><span class="mord cjk_fallback">输出</span><span class="mopen">(</span></span></span></span>/M) | ARC-AGI-2 | 每分性能成本 |
|------|-----------|-----------|-----------|-------------|
| Gemini 3.1 Pro | <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">2 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2∣</span></span></span></span>12 | 77.1% | <strong>最优</strong> |
| Claude Opus 4.6 | <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>15</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">15 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">15∣</span></span></span></span>75 | 68.8% | 高 |
| GPT-5.4 | <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2.50</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">2.50 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">2.50∣</span></span></span></span>15 | 73.3% | 中等 |</p>
<p>Gemini 3.1 Pro 在性能-价格比上具有显著优势。以 ARC-AGI-2 为例，达到相同准确率所需的成本仅为 Claude Opus 4.6 的约 1/10。</p>
<h2 id="l-jxytz">六、局限与挑战</h2>
<h3 id="6-1-jsjx">6.1 技术局限</h3>
<ol>
<li><strong>长上下文定价陷阱</strong>：超过 200K token 的输入价格翻倍至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mi mathvariant="normal">/</mi><mi>M</mi><mtext>，输出</mtext></mrow><annotation encoding="application/x-tex">4/M，输出</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">4/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord cjk_fallback">，输出</span></span></span></span>18/M，实际长文档处理成本可能超出预期; </li>
<li><strong>视频生成限制</strong>：Veo 引擎生成的视频时长和帧率仍有限制(通常 &lt; 10 秒、&lt; 30 fps)，长视频生成需要分段拼接; </li>
<li><strong>闭源不透明</strong>：MoE 架构的具体设计(专家数量、路由机制、激活策略)完全未公开; </li>
<li><strong>中文优化有限</strong>：虽然支持中文，但在成语理解、古诗词赏析等文化密集型任务上仍逊于国产模型。</li>
</ol>
<h3 id="6-2-aqyll">6.2 安全与伦理</h3>
<p>Gemini 3.1 Pro 的多模态生成能力带来了新的安全风险：</p>
<ul>
<li><strong>深度伪造</strong>：高保真视频+音频生成可能被用于制造虚假新闻; </li>
<li><strong>SynthID 的局限性</strong>：虽然音频强制嵌入水印，但图像和视频的水印可被对抗性攻击移除; </li>
<li><strong>推理不可解释性</strong>：Deep Think Mini 的并行多路径推理使得最终输出的&quot;决策路径&quot;难以追溯。</li>
</ul>
<h2 id="q-zj">七、总结</h2>
<p>Gemini 3.1 Pro 是 Google DeepMind 在&quot;推理效率&quot;方向上的一次重要探索。其三大核心技术——<strong>动态测试时计算</strong>、<strong>原生多模态生成引擎</strong>、<strong>稀疏 MoE + TPU 协同优化</strong>——分别解决了&quot;算力浪费&quot;、&quot;模态鸿沟&quot;和&quot;能效瓶颈&quot;三大行业痛点。</p>
<p>动态测试时计算通过三级思考系统和 Deep Think Mini，让模型首次实现了&quot;按需智能&quot;——简单问题快速响应，复杂问题深度推理。原生多模态生成引擎通过 Nano Banana、Veo、Lyria 3 的底层集成，打破了传统&quot;插件调用&quot;模式的模态壁垒。稀疏 MoE 与 TPU v6 的协同设计，则在万亿级参数规模下保持了可控的推理成本。</p>
<p>在竞争格局中，Gemini 3.1 Pro 以&quot;性价比旗舰&quot;的定位找到了差异化空间：它不是最强的单一模型(GPT-5.5 在通用能力上仍领先)，也不是最专业的垂直模型(Claude Opus 4.7 在代码生成上仍有优势)，但它在&quot;用最少的钱办最多的事&quot;这一维度上建立了明显优势。对于预算敏感但需要高质量推理的开发者和企业，Gemini 3.1 Pro 是一个极具吸引力的选择。</p>
<hr>
<blockquote>
<p>📚 <strong>延伸阅读</strong></p>
<ul>
<li><a href="https://storage.googleapis.com/deepmind-media/gemini/gemini_v3_1_report.pdf">Gemini 3.1 Pro 官方技术报告</a></li>
<li><a href="https://antigravity.codes/">Google Antigravity 代理开发平台</a></li>
<li><a href="https://arcprize.org/">ARC-AGI-2 基准测试</a></li>
<li><a href="https://modelcontextprotocol.io/">MCP 协议规范</a></li>
</ul>
</blockquote>
<hr>
<blockquote>
<p>🔄 <strong>知识库同步</strong></p>
<ul>
<li>本文件已同步至 <code>5-主流模型全解/5.3-国外大模型/Google-Gemini/05-Gemini-3.1-Pro-动态测试时计算与原生多模态生成引擎.md</code></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-fbbjyzldw","text":"一、发布背景与战略定位"},{"level":2,"id":"e-hxjsy-dtcssjsjg","text":"二、核心技术一：动态测试时计算架构"},{"level":3,"id":"2-1-c-quot-gdsl-quot-d-quot-axsl-quot","text":"2.1 从&quot;固定算力&quot;到&quot;按需算力&quot;"},{"level":3,"id":"2-2-sjskxtdgcsx","text":"2.2 三级思考系统的工程实现"},{"level":3,"id":"2-3-deep-think-mini-bhdljtl","text":"2.3 Deep Think Mini：并行多路径推理"},{"level":3,"id":"2-4-swqmjz-jjtlpy","text":"2.4 思维签名机制：解决推理漂移"},{"level":2,"id":"s-hxjse-ysdmtscyq","text":"三、核心技术二：原生多模态生成引擎"},{"level":3,"id":"3-1-c-quot-cjty-quot-d-quot-dcys-quot","text":"3.1 从&quot;插件调用&quot;到&quot;底层原生&quot;"},{"level":3,"id":"3-2-ty-token-kjdkmtsc","text":"3.2 统一 Token 空间的跨模态生成"},{"level":2,"id":"s-hxjss-xs-moe-y-tpu-xtyh","text":"四、核心技术三：稀疏 MoE 与 TPU 协同优化"},{"level":3,"id":"4-1-wyjxs-moe-jg","text":"4.1 万亿级稀疏 MoE 架构"},{"level":3,"id":"4-2-tpu-v6-xtsj","text":"4.2 TPU v6 协同设计"},{"level":3,"id":"4-3-nxbx","text":"4.3 能效表现"},{"level":2,"id":"w-xnpgyjpdb","text":"五、性能评估与竞品对比"},{"level":3,"id":"5-1-cxtlykxtl","text":"5.1 抽象推理与科学推理"},{"level":3,"id":"5-2-bcygjsy","text":"5.2 编程与工具使用"},{"level":3,"id":"5-3-dmtlj","text":"5.3 多模态理解"},{"level":3,"id":"5-4-cbxsdb","text":"5.4 成本效率对比"},{"level":2,"id":"l-jxytz","text":"六、局限与挑战"},{"level":3,"id":"6-1-jsjx","text":"6.1 技术局限"},{"level":3,"id":"6-2-aqyll","text":"6.2 安全与伦理"},{"level":2,"id":"q-zj","text":"七、总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.11-gemini/13-gemini-3.1-pro/05-gemini-3.1-pro-dtcssjsyysdmtscyq" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.11-gemini/13-gemini-3.1-pro/05-gemini-3.1-pro-dtcssjsyysdmtscyq" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gemini 3.1 Pro：动态测试时计算与原生多模态生成引擎</h1>
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
