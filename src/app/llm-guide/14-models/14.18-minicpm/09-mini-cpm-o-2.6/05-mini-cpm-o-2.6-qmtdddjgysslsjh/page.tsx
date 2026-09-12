"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-o-2.6 核心技术专题: 全模态端到端架构与实时流式交互</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文基于 OpenBMB 官方发布信息、GitHub 技术文档及社区评测资料综合整理。</p>
</blockquote>
<hr>
<h2 id="1-bj-c-quot-sj-wb-quot-d-quot-qmt-ss-quot">1 背景: 从&quot;视觉+文本&quot;到&quot;全模态+实时&quot;</h2>
<p>多模态大语言模型(MLLM)的发展经历了三个明显的阶段:</p>
<p><strong>阶段一: 视觉-语言模型(VLM)</strong></p>
<ul>
<li>代表: LLaVA、MiniGPT-4、Qwen-VL、MiniCPM-V 系列</li>
<li>输入: 图像/视频 + 文本</li>
<li>输出: 文本</li>
<li>核心挑战: 如何将高维视觉信息高效压缩为与文本兼容的 token 序列</li>
</ul>
<p><strong>阶段二: 音频-语言模型(ALM)</strong></p>
<ul>
<li>代表: Qwen-Audio、SALMONN</li>
<li>输入: 音频 + 文本</li>
<li>输出: 文本</li>
<li>核心挑战: 音频的时序特征建模和语义提取</li>
</ul>
<p><strong>阶段三: 全模态模型(Omni-modal Model)</strong></p>
<ul>
<li>代表: GPT-4o、Qwen2.5-Omni、MiniCPM-o 2.6</li>
<li>输入: 图像 + 视频 + 音频 + 文本</li>
<li>输出: 文本 + 语音</li>
<li>核心挑战: 多模态统一表示、端到端训练、实时流式交互</li>
</ul>
<p>MiniCPM-o 2.6 的定位是<strong>端侧全模态模型的先驱</strong>。在 8.7B 参数的约束下,它实现了与 GPT-4o-202405 相当的全模态能力,并在 StreamingBench 等实时交互评测中超越了多个闭源竞品。</p>
<blockquote>
<p>全模态不是&quot;1+1+1=3&quot;的简单叠加,而是&quot;1+1+1&gt;3&quot;的涌现。当模型能同时&quot;看到&quot;画面、&quot;听到&quot;声音、&quot;理解&quot;文字时,不同模态之间的信息可以相互印证和补充。例如,一个视频中有人微笑(视觉)同时语调欢快(音频),模型可以更确定地判断这个人&quot;开心&quot;; 如果视觉是微笑但音频是哭泣,模型则能识别出这种&quot;矛盾&quot;并给出更 nuanced 的分析。这种跨模态推理能力是单一模态模型无法具备的。</p>
</blockquote>
<hr>
<h2 id="2-dddjg-wsmgdsbgl">2 端到端架构: 为什么管道式不够了</h2>
<h3 id="2-1-gdsjgdpj">2.1 管道式架构的瓶颈</h3>
<p>传统的多模态语音交互系统采用<strong>级联管道</strong>(cascaded pipeline):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>音频</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>ASR</mtext></mpadded></mover><mtext>文本</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>LLM</mtext></mpadded></mover><mtext>回复文本</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>TTS</mtext></mpadded></mover><mtext>语音</mtext></mrow><annotation encoding="application/x-tex">\\text{音频} \\xrightarrow{\\text{ASR}} \\text{文本} \\xrightarrow{\\text{LLM}} \\text{回复文本} \\xrightarrow{\\text{TTS}} \\text{语音}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">音频</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ASR</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">文本</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LLM</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">回复文本</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">TTS</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">语音</span></span></span></span></span></span><p>这种架构在工程上简单直观,但存在根本性缺陷:</p>
<p><strong>误差累积</strong>: ASR 的每个识别错误都会传递到 LLM,LLM 的每个推理偏差都会传递到 TTS。假设 ASR 的 WER 为 5%,LLM 的理解准确率为 95%,TTS 的自然度评分为 4.0/5.0,那么整个系统的端到端质量会显著低于各环节单独的表现。</p>
<p><strong>信息损失</strong>: ASR 将丰富的声学信号(基频、共振峰、语速变化、情感韵律、环境音)压缩为扁平的文本 token。LLM 永远无法知道用户是&quot;愤怒地吼叫&quot;还是&quot;温柔地低语&quot;,除非在文本中显式描述。</p>
<p><strong>延迟累积</strong>: 每个环节都需要完整的推理时间。一个典型的管道式语音对话系统的延迟构成:</p>
<table>
<thead>
<tr>
<th>环节</th>
<th>典型延迟</th>
</tr>
</thead>
<tbody><tr>
<td>音频采集 + VAD(语音活动检测)</td>
<td>200-500ms</td>
</tr>
<tr>
<td>ASR 编码</td>
<td>100-300ms</td>
</tr>
<tr>
<td>LLM 首 token 生成</td>
<td>200-500ms</td>
</tr>
<tr>
<td>LLM 完整回复生成</td>
<td>500-2000ms</td>
</tr>
<tr>
<td>TTS 合成</td>
<td>200-800ms</td>
</tr>
<tr>
<td><strong>总延迟</strong></td>
<td><strong>1.2-4.1s</strong></td>
</tr>
</tbody></table>
<p>1.2 到 4.1 秒的延迟对于语音对话来说是不可接受的——人类对话的自然间隔通常在 200-500ms。</p>
<p><strong>交互不自然</strong>: 管道式系统必须等用户说完一句话(由 VAD 判定),才能开始 ASR 处理。这意味着模型无法做到&quot;边听边说&quot;,无法实现真正实时的对话。</p>
<h3 id="2-2-dddjgdyl">2.2 端到端架构的原理</h3>
<p>MiniCPM-o 2.6 的端到端架构可以用一个统一的公式表示:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mtext>Output</mtext><mo>=</mo><msub><mi>f</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mtext>Image</mtext><mo separator="true">,</mo><mtext>Video</mtext><mo separator="true">,</mo><mtext>Audio</mtext><mo separator="true">,</mo><mtext>Text</mtext><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\text{Output} = f_{\\theta}(\\text{Image}, \\text{Video}, \\text{Audio}, \\text{Text}) \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Output</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord text"><span class="mord">Image</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Video</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Audio</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">Text</span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>f</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">f_{\\theta}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1076em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是一个单一的神经网络,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span> 是所有模态共享的参数集合。输出同时包含文本 token 和音频 token(或声学特征)。</p>
<p>具体实现上,模型包含以下模块:</p>
<p><strong>多模态编码器层</strong>: </p>
<ul>
<li>视觉编码器(SigLip-400M): 将图像/视频帧转换为视觉 token</li>
<li>音频编码器: 将音频波形或频谱转换为音频 token</li>
<li>文本编码器(语言模型的 embedding 层): 将文本转换为文本 token</li>
</ul>
<p><strong>统一投影层</strong>:
将所有模态的 token 映射到同一个语义空间,形成统一的 multimodal token 序列:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi mathvariant="bold">H</mi><mo>=</mo><mo stretchy="false">[</mo><msubsup><mi mathvariant="bold">h</mi><mtext>vis</mtext><mrow><mo stretchy="false">(</mo><mn>1</mn><mo stretchy="false">)</mo></mrow></msubsup><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msubsup><mi mathvariant="bold">h</mi><mtext>vis</mtext><mrow><mo stretchy="false">(</mo><msub><mi>n</mi><mi>v</mi></msub><mo stretchy="false">)</mo></mrow></msubsup><mo separator="true">;</mo><msubsup><mi mathvariant="bold">h</mi><mtext>aud</mtext><mrow><mo stretchy="false">(</mo><mn>1</mn><mo stretchy="false">)</mo></mrow></msubsup><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msubsup><mi mathvariant="bold">h</mi><mtext>aud</mtext><mrow><mo stretchy="false">(</mo><msub><mi>n</mi><mi>a</mi></msub><mo stretchy="false">)</mo></mrow></msubsup><mo separator="true">;</mo><msubsup><mi mathvariant="bold">h</mi><mtext>text</mtext><mrow><mo stretchy="false">(</mo><mn>1</mn><mo stretchy="false">)</mo></mrow></msubsup><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msubsup><mi mathvariant="bold">h</mi><mtext>text</mtext><mrow><mo stretchy="false">(</mo><msub><mi>n</mi><mi>t</mi></msub><mo stretchy="false">)</mo></mrow></msubsup><mo stretchy="false">]</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbf{H} = [\\mathbf{h}_{\\text{vis}}^{(1)}, ..., \\mathbf{h}_{\\text{vis}}^{(n_v)}; \\mathbf{h}_{\\text{aud}}^{(1)}, ..., \\mathbf{h}_{\\text{aud}}^{(n_a)}; \\mathbf{h}_{\\text{text}}^{(1)}, ..., \\mathbf{h}_{\\text{text}}^{(n_t)}] \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6861em;"></span><span class="mord mathbf">H</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3461em;vertical-align:-0.3013em;"></span><span class="mopen">[</span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4173em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">vis</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight">1</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2827em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4173em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">vis</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2827em;"><span></span></span></span></span></span></span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.3987em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aud</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight">1</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.3987em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aud</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">a</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4542em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">text</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight">1</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2458em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4542em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">text</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2963em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2458em;"><span></span></span></span></span></span></span><span class="mclose">]</span></span><span class="tag"><span class="strut" style="height:1.3461em;vertical-align:-0.3013em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">h</mi><mtext>vis</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathbf{h}_{\\text{vis}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3175em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">vis</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">h</mi><mtext>aud</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathbf{h}_{\\text{aud}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">aud</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">h</mi><mtext>text</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathbf{h}_{\\text{text}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">text</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 分别是视觉、音频、文本的隐藏状态,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>v</mi></msub></mrow><annotation encoding="application/x-tex">n_v</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>a</mi></msub></mrow><annotation encoding="application/x-tex">n_a</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">a</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">n_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是对应的 token 数量。</p>
<p><strong>中央推理引擎</strong>(Qwen2-7B):
对统一的多模态 token 序列进行自注意力计算和 FFN 变换,生成多模态理解表示。</p>
<p><strong>多模态解码器层</strong>:</p>
<ul>
<li>文本解码头: 将隐藏状态映射为文本 token 的概率分布</li>
<li>语音解码头: 将隐藏状态映射为音频 token 或声学特征</li>
</ul>
<blockquote>
<p>这里的关键设计决策是&quot;共享推理引擎&quot;。视觉 token、音频 token 和文本 token 共用同一个 Qwen2-7B 的 Transformer 层,而不是为每个模态单独设计推理模块。这种设计的优势是: (1) 参数量高效——不需要为每个模态复制一套注意力层; (2) 跨模态融合自然——在自注意力层中,视觉 token 可以直接 attend 到音频 token,无需显式的跨模态对齐机制; (3) 训练稳定——语言模型的预训练权重为所有模态提供了良好的初始化。代价是不同模态的 token 需要在同一语义空间中&quot;对齐&quot;,这对投影层的设计提出了高要求。</p>
</blockquote>
<h3 id="2-3-ypbmdjsxj">2.3 音频编码的技术细节</h3>
<p>音频编码是 MiniCPM-o 2.6 架构中未完全公开的部分,但从行业实践推测,可能采用以下方案之一:</p>
<p><strong>方案 A: 频谱图 + ViT</strong></p>
<ul>
<li>将音频波形转换为 mel 频谱图(类似于图像的像素网格)</li>
<li>用 ViT(Vision Transformer)风格的 patch 编码器处理频谱图</li>
<li>优势: 可以复用视觉编码器的技术栈</li>
<li>劣势: 时序分辨率受频谱图帧长限制</li>
</ul>
<p><strong>方案 B: 离散音频 token(如 SoundStream / EnCodec)</strong></p>
<ul>
<li>用神经音频编码器将波形压缩为离散 token 序列</li>
<li>这些离散 token 与文本 token 共享同一个词表</li>
<li>优势: 可以与文本 token 完全统一处理</li>
<li>劣势: 需要额外的音频编解码器,可能引入音质损失</li>
</ul>
<p><strong>方案 C: 连续特征 + Perceiver</strong></p>
<ul>
<li>用预训练的音频模型(如 Whisper 编码器)提取连续特征</li>
<li>用 Perceiver Resampler 压缩为固定数量的音频 token</li>
<li>优势: 保留了丰富的声学信息</li>
<li>劣势: Perceiver 的压缩可能丢失细粒度信息</li>
</ul>
<p>无论采用哪种方案,核心目标都是: 在保留足够声学信息的前提下,将音频压缩为与视觉 token 数量级相当的序列长度(数百个 token),以便与语言模型高效对接。</p>
<hr>
<h2 id="3-yysc-cwbdsy">3 语音生成: 从文本到声音</h2>
<h3 id="3-1-yyscdjslj">3.1 语音生成的技术路径</h3>
<p>MiniCPM-o 2.6 的语音生成功能包括: 实时对话、情感控制、语速调节、风格切换、语音克隆、角色扮演。这些功能的背后是一个端到端的语音生成模块。</p>
<p>语音生成通常有两种技术路径:</p>
<p><strong>自回归路径</strong>(AR): 模型逐个生成音频 token(或声学特征),类似于文本的自回归生成</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="bold">a</mi><mi>t</mi></msub><mo>=</mo><mtext>Decoder</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">h</mi><mtext>LM</mtext></msub><mo separator="true">,</mo><msub><mi mathvariant="bold">a</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbf{a}_t = \\text{Decoder}(\\mathbf{h}_{\\text{LM}}, \\mathbf{a}_{&lt;t}) \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Decoder</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">a</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">\\mathbf{a}_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 个音频 token,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">h</mi><mtext>LM</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathbf{h}_{\\text{LM}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是语言模型输出的隐藏状态。</p>
<p>优势: 与文本生成统一框架,训练简单
劣势: 生成速度慢(必须逐 token 生成),可能出现音频不连贯</p>
<p><strong>非自回归路径</strong>(NAR): 模型一次性生成整段音频的特征表示,再用声码器(vocoder)转换为波形</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi mathvariant="bold">A</mi><mo>=</mo><mtext>Decoder</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">h</mi><mtext>LM</mtext></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbf{A} = \\text{Decoder}(\\mathbf{h}_{\\text{LM}}) \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6861em;"></span><span class="mord mathbf">A</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Decoder</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">A</mi></mrow><annotation encoding="application/x-tex">\\mathbf{A}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6861em;"></span><span class="mord mathbf">A</span></span></span></span> 是整段音频的声学特征矩阵。</p>
<p>优势: 生成速度快(一次前向传播),音频连贯性好
劣势: 与文本生成的训练方式不同,需要额外的声码器</p>
<p>MiniCPM-o 2.6 很可能采用了<strong>混合方案</strong>: 语言模型先生成离散的音频 token(类似文本),然后用一个轻量级的声码器或音频解码器将这些 token 快速转换为波形。这种方案在速度和质量之间取得了平衡。</p>
<h3 id="3-2-yyklyjsbydyl">3.2 语音克隆与角色扮演的原理</h3>
<p>语音克隆(让模型模仿特定说话人的声音)的实现依赖于<strong>说话人条件化</strong>(speaker conditioning):</p>
<ol>
<li><strong>参考编码</strong>: 用户提供 3-10 秒的参考语音,音频编码器提取其说话人特征 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">s</mi></mrow><annotation encoding="application/x-tex">\\mathbf{s}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">s</span></span></span></span></li>
<li><strong>条件注入</strong>: 在语音生成过程中,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">s</mi></mrow><annotation encoding="application/x-tex">\\mathbf{s}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">s</span></span></span></span> 作为条件向量注入到解码器的每一层</li>
<li><strong>风格迁移</strong>: 解码器学习将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">s</mi></mrow><annotation encoding="application/x-tex">\\mathbf{s}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">s</span></span></span></span> 映射为对应的声学特征分布</li>
</ol>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi mathvariant="bold">A</mi><mo>=</mo><mtext>Decoder</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">h</mi><mtext>LM</mtext></msub><mo separator="true">,</mo><mi mathvariant="bold">s</mi><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathbf{A} = \\text{Decoder}(\\mathbf{h}_{\\text{LM}}, \\mathbf{s}) \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6861em;"></span><span class="mord mathbf">A</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">Decoder</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathbf">s</span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><p>情感控制和语速调节的原理类似,只是条件向量的来源不同:</p>
<ul>
<li>情感控制: 条件向量来自离散的&quot;情感标签&quot;(如&quot;开心&quot;、&quot;悲伤&quot;)</li>
<li>语速调节: 条件向量来自连续的&quot;语速因子&quot;</li>
<li>角色扮演: 本质上是预设一组说话人特征,每个角色对应一个固定的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold">s</mi></mrow><annotation encoding="application/x-tex">\\mathbf{s}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord mathbf">s</span></span></span></span></li>
</ul>
<blockquote>
<p>语音克隆的&quot;端到端&quot;特性是 MiniCPM-o 2.6 的一大亮点。传统方案需要三阶段: (1) 用专门的 speaker encoder 提取说话人嵌入; (2) 在 TTS 训练时注入该嵌入; (3) 推理时用新说话人的嵌入替换。MiniCPM-o 2.6 的端到端方案可能是: 将参考语音直接作为模型的输入上下文的一部分,模型通过自注意力机制自动&quot;学习&quot;参考语音的说话人特征,并在生成回复时复现该特征。这不需要显式的 speaker embedding 提取,也不需要额外的说话人编码器网络——一切都发生在统一的 Transformer 架构内部。</p>
</blockquote>
<hr>
<h2 id="4-sslsjh-gctzyjjfa">4 实时流式交互: 工程挑战与解决方案</h2>
<h3 id="4-1-lscldbz">4.1 流式处理的本质</h3>
<p>实时流式交互的核心要求是:<strong>模型在处理当前输入的同时,能够持续接收新的输入,并在适当的时候输出响应</strong>。</p>
<p>这与传统的&quot;请求-响应&quot;模式有本质区别:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>传统模式</th>
<th>流式模式</th>
</tr>
</thead>
<tbody><tr>
<td>输入</td>
<td>离散的完整查询</td>
<td>连续的数据流</td>
</tr>
<tr>
<td>处理时机</td>
<td>收到完整输入后开始</td>
<td>边接收边处理</td>
</tr>
<tr>
<td>输出时机</td>
<td>推理完成后一次性输出</td>
<td>可增量输出</td>
</tr>
<tr>
<td>延迟</td>
<td>秒级</td>
<td>毫秒级</td>
</tr>
<tr>
<td>交互体验</td>
<td>类似搜索/聊天</td>
<td>类似真人对话</td>
</tr>
</tbody></table>
<h3 id="4-2-streaming-bench-pcwd">4.2 StreamingBench 评测维度</h3>
<p>StreamingBench 是评估多模态实时流式理解能力的综合基准,包含三个维度:</p>
<p><strong>实时视频理解(Real-Time Video Understanding)</strong></p>
<ul>
<li>评测模型对连续视频流的理解能力</li>
<li>测试场景: 动作识别、事件检测、时序推理</li>
<li>关键指标: 准确率、响应延迟</li>
</ul>
<p><strong>全源理解(Omni-Source Understanding)</strong></p>
<ul>
<li>评测模型同时融合视频和音频信息的能力</li>
<li>测试场景: &quot;视频中的人在说什么？&quot;、&quot;这个声音是从画面中的哪个物体发出的？&quot;</li>
<li>关键指标: 跨模态关联准确率</li>
</ul>
<p><strong>上下文理解(Contextual Understanding)</strong></p>
<ul>
<li>评测模型将对话历史与实时输入联合推理的能力</li>
<li>测试场景: 多轮对话中的指代消解、隐含意图理解</li>
<li>关键指标: 对话连贯性、指代准确率</li>
</ul>
<p>MiniCPM-o 2.6 在三个维度上均超越了 GPT-4o-202408 和 Claude 3.5 Sonnet,达到开源社区最佳水平。</p>
<h3 id="4-3-lscldgcsx">4.3 流式处理的工程实现</h3>
<p>实现真正的实时流式交互需要解决以下工程问题:</p>
<p><strong>增量编码</strong>: 视频流和音频流是连续到达的,不能每次都对全部历史重新编码。解决方案是:</p>
<ul>
<li>维护一个滑动窗口的帧缓冲区</li>
<li>新帧到达时,只编码新帧,复用已有帧的编码结果</li>
<li>对于变化很小的帧(如静止画面),跳过编码</li>
</ul>
<p><strong>分块生成</strong>: 语音回复不需要等全部文本生成完再开始合成。解决方案是:</p>
<ul>
<li>语言模型采用&quot;流式解码&quot;: 每生成几个文本 token,就立即触发对应的音频 token 生成</li>
<li>音频合成也采用流式: 先合成已生成音频 token 对应的声音片段,后续片段随到随合</li>
</ul>
<p><strong>注意力优化</strong>: 长流式会话中,token 序列长度会快速增长,注意力计算量呈 O(n^2) 增长。解决方案包括:</p>
<ul>
<li>滑动窗口注意力: 只保留最近 N 个 token 的上下文</li>
<li>分层注意力: 将历史内容压缩为&quot;摘要 token&quot;,减少活跃上下文长度</li>
<li>KV Cache 管理: 定期清理不再需要的 KV 缓存</li>
</ul>
<blockquote>
<p>流式交互的&quot;全双工&quot;能力(同时听和说)是 MiniCPM-o 4.5 才实现的,o 2.6 的流式模式更接近&quot;半双工&quot;: 模型可以连续接收输入流,但在生成回复时可能暂时停止接收新输入(或新输入被缓冲)。真正的全双工需要模型在&quot;生成当前回复&quot;和&quot;理解新的用户打断&quot;之间快速切换,这对推理框架的调度能力提出了极高要求。从工程实现角度看,o 2.6 的流式架构为后续的全双工升级奠定了基础——核心的增量编码和分块生成机制可以直接复用。</p>
</blockquote>
<hr>
<h2 id="5-yjpddb">5 与竞品的对比</h2>
<h3 id="5-1-dcqmtmxdb">5.1 端侧全模态模型对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>视觉</th>
<th>音频理解</th>
<th>语音生成</th>
<th>实时流式</th>
<th>端侧部署</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-o 2.6</td>
<td>8.7B</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>✅(半双工)</td>
<td>✅</td>
</tr>
<tr>
<td>GPT-4o</td>
<td>未公开</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>✅(全双工)</td>
<td>❌</td>
</tr>
<tr>
<td>Qwen2.5-Omni-7B</td>
<td>7B</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>部分</td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td>未公开</td>
<td>✅</td>
<td>✅</td>
<td>❌</td>
<td>❌</td>
<td>❌</td>
</tr>
<tr>
<td>Claude 3.5 Sonnet</td>
<td>未公开</td>
<td>✅</td>
<td>❌</td>
<td>❌</td>
<td>❌</td>
<td>❌</td>
</tr>
</tbody></table>
<h3 id="5-2-gjcyfx">5.2 关键差异分析</h3>
<p><strong>vs GPT-4o</strong>: GPT-4o 是 OpenAI 的旗舰全模态模型,支持全双工实时交互,但只能在云端 API 调用。MiniCPM-o 2.6 在能力上接近 GPT-4o-202405 水平(StreamingBench 甚至超越了 GPT-4o-202408),但可以在 iPad 等端侧设备本地运行,无需网络连接。</p>
<p><strong>vs Qwen2.5-Omni-7B</strong>: 阿里云同期发布的竞品,同样基于 Qwen2-7B,架构和定位高度相似。MiniCPM-o 2.6 的优势在于更激进的视觉 token 压缩(640 vs ~1024)和更早的开源时间(2025.01 vs 2025.03)。</p>
<p><strong>vs Gemini/Claude</strong>: 这两个模型在视觉理解上很强,但不支持语音生成和实时流式交互,定位与 MiniCPM-o 2.6 不同。</p>
<hr>
<h2 id="6-jxyzw">6 局限与展望</h2>
<h3 id="6-1-dqjx">6.1 当前局限</h3>
<p><strong>模态覆盖</strong>: 虽然支持视觉、音频、语音、文本,但不支持&quot;生成图像/视频&quot;。模型只能&quot;理解&quot;视觉输入,不能&quot;创造&quot;视觉输出。</p>
<p><strong>全双工限制</strong>: o 2.6 的流式交互是&quot;半双工&quot;模式——模型在说的时候可能无法同时听。真正的全双工(边说边听、随时打断)在 o 4.5 中才实现。</p>
<p><strong>语音质量</strong>: 端侧 8.7B 模型的语音生成质量虽然接近 GPT-4o,但在复杂音乐生成、多说话人分离等任务上仍有差距。</p>
<p><strong>长视频处理</strong>: 对于分钟级以上的长视频,帧采样后的视觉 token 总数仍可能超出上下文窗口限制。</p>
<h3 id="6-2-wlfx">6.2 未来方向</h3>
<p><strong>全双工实时交互</strong>: 这是 MiniCPM-o 4.5 已经实现的方向——模型可以同时看、听、说,输出流和输入流互不阻塞。</p>
<p><strong>视觉生成</strong>: 将文本到图像/视频生成能力整合进全模态模型,实现&quot;听得见、说得出、看得见、画得出来&quot;。</p>
<p><strong>更强的语音控制</strong>: 更细粒度的情感控制(如&quot;带着一丝嘲讽的语气&quot;)、更自然的对话韵律(如适时的停顿、语气词)、更精准的方言支持。</p>
<p><strong>端侧 AI Agent</strong>: 全模态能力是 AI Agent 的感知基础。未来的端侧 Agent 可以&quot;看屏幕、听用户说话、点击按钮、语音汇报结果&quot;,完成复杂的自动化任务。</p>
<hr>
<h2 id="7-xj">7 小结</h2>
<p>MiniCPM-o 2.6 的核心技术贡献在于证明了:<strong>在端侧设备上实现端到端全模态实时交互是可行的</strong>。</p>
<p>这一可行性的技术基础是四重创新的叠加:</p>
<ol>
<li><strong>端到端统一架构</strong>: 将 ASR、LLM、TTS 三个传统环节融合为单一神经网络,消除误差累积和信息损失</li>
<li><strong>高效的多模态编码</strong>: 视觉 640 token/180 万像素 + 音频高效压缩,为语言模型释放充足的上下文空间</li>
<li><strong>语音生成模块</strong>: 支持实时对话、情感控制、语音克隆等高级语音功能</li>
<li><strong>流式推理引擎</strong>: 增量编码 + 分块生成,将端到端延迟控制在可接受范围内</li>
</ol>
<p>从算法演进的角度看,MiniCPM-o 2.6 标志着端侧 MLLM 从&quot;多模态理解&quot;进入了&quot;全模态交互&quot;的新阶段。后续的 MiniCPM-o 4.5 进一步突破了全双工实时交互的技术壁垒,而整个系列始终坚守&quot;端侧可用&quot;的产品底线。这一系列迭代勾勒出端侧 AI 的终极愿景: <strong>一个能看、能听、能说、能思考的智能体,常驻于每个人的手机、平板和眼镜中</strong>。</p>
<hr>
<blockquote>
<p>本文档与 <code>docs/sections/llm-guide/5-主流模型全解/5.2-国内大模型/面壁智能-MiniCPM/05-MiniCPM-o-2.6-全模态端到端架构与实时流式交互.md</code> 保持双向同步。如更新,请同时修改两个文件。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-bj-c-quot-sj-wb-quot-d-quot-qmt-ss-quot","text":"1 背景: 从&quot;视觉+文本&quot;到&quot;全模态+实时&quot;"},{"level":2,"id":"2-dddjg-wsmgdsbgl","text":"2 端到端架构: 为什么管道式不够了"},{"level":3,"id":"2-1-gdsjgdpj","text":"2.1 管道式架构的瓶颈"},{"level":3,"id":"2-2-dddjgdyl","text":"2.2 端到端架构的原理"},{"level":3,"id":"2-3-ypbmdjsxj","text":"2.3 音频编码的技术细节"},{"level":2,"id":"3-yysc-cwbdsy","text":"3 语音生成: 从文本到声音"},{"level":3,"id":"3-1-yyscdjslj","text":"3.1 语音生成的技术路径"},{"level":3,"id":"3-2-yyklyjsbydyl","text":"3.2 语音克隆与角色扮演的原理"},{"level":2,"id":"4-sslsjh-gctzyjjfa","text":"4 实时流式交互: 工程挑战与解决方案"},{"level":3,"id":"4-1-lscldbz","text":"4.1 流式处理的本质"},{"level":3,"id":"4-2-streaming-bench-pcwd","text":"4.2 StreamingBench 评测维度"},{"level":3,"id":"4-3-lscldgcsx","text":"4.3 流式处理的工程实现"},{"level":2,"id":"5-yjpddb","text":"5 与竞品的对比"},{"level":3,"id":"5-1-dcqmtmxdb","text":"5.1 端侧全模态模型对比"},{"level":3,"id":"5-2-gjcyfx","text":"5.2 关键差异分析"},{"level":2,"id":"6-jxyzw","text":"6 局限与展望"},{"level":3,"id":"6-1-dqjx","text":"6.1 当前局限"},{"level":3,"id":"6-2-wlfx","text":"6.2 未来方向"},{"level":2,"id":"7-xj","text":"7 小结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/09-mini-cpm-o-2.6/05-mini-cpm-o-2.6-qmtdddjgysslsjh" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/09-mini-cpm-o-2.6/05-mini-cpm-o-2.6-qmtdddjgysslsjh" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-o-2.6 核心技术专题: 全模态端到端架构与实时流式交互</h1>
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
