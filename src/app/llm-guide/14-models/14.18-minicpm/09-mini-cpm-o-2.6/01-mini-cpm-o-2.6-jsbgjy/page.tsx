"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-o-2.6 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文来源: OpenBMB GitHub 官方仓库 / Notion 技术报告 / 社区评测资料
官方链接: <a href="https://github.com/OpenBMB/MiniCPM-o">https://github.com/OpenBMB/MiniCPM-o</a>
技术报告: <a href="https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone">https://openbmb.notion.site/MiniCPM-o-2-6-A-GPT-4o-Level-MLLM-for-Vision-Speech-and-Multimodal-Live-Streaming-on-Your-Phone</a>
发布日期: 2025 年 1 月 13 日(开源), 2025 年 1 月 24 日(技术报告)
发布机构: 清华大学面壁智能(OpenBMB)
模型规模: 8.7B 参数(SigLip-400M 视觉编码器 + Qwen2-7B 语言模型 + 语音模块)
说明: MiniCPM-o 2.6 无独立 arXiv PDF, 技术报告为 Notion 页面形式, 本文基于官方公开信息综合整理精译</p>
</blockquote>
<hr>
<h2 id="1-mxgs">1 模型概述</h2>
<p>MiniCPM-o 2.6 是面壁智能于 2025 年 1 月发布的<strong>全模态端侧大语言模型</strong>(Omni-modal Large Language Model),总参数量为 <strong>8.7B</strong>。该模型是 MiniCPM 系列中首个实现<strong>端到端全模态交互</strong>的模型: 能够同时接收图像、视频、音频和文本输入,并生成高质量的文本和语音输出。在视觉、语音和多模态实时流式理解三个维度上,MiniCPM-o 2.6 均达到了 GPT-4o-202405 级别,部分指标甚至超越了商用闭源模型。</p>
<p>与上一代 MiniCPM-V 2.6 相比,o 2.6 进行了两项关键扩展: (1) <strong>新增音频理解和语音生成能力</strong>,使模型从&quot;视觉-语言&quot;升级为&quot;视觉-语音-语言&quot;全模态; (2) <strong>支持多模态实时流式交互</strong>(multimodal live streaming),能够处理连续的视频和音频流,并进行实时语音对话。</p>
<blockquote>
<p>这里需要理解&quot;o&quot;系列的定位转变。MiniCPM-V 系列聚焦&quot;看得懂&quot;,而 MiniCPM-o 系列追求&quot;听得见、说得出、看得懂&quot;的全模态覆盖。从工程角度看,这不是简单的功能叠加——语音模态的引入涉及全新的编码器设计、音频-文本对齐训练、以及端到端的语音生成管线。最核心的是&quot;端到端&quot;三个字: 传统方案通常将 ASR(语音识别) → LLM(文本推理) → TTS(语音合成) 串联成管道(pipeline),每个环节独立优化,误差累积严重。MiniCPM-o 2.6 的端到端架构意味着音频信号直接进入模型,模型内部完成&quot;听到→理解→生成语音回复&quot;的完整流程,中间不需要显式的文本转录步骤。这直接带来了更低的延迟和更自然的交互体验。</p>
</blockquote>
<hr>
<h2 id="2-hxnl">2 核心能力</h2>
<h3 id="2-1-sjlj">2.1 视觉理解</h3>
<p>MiniCPM-o 2.6 继承了 MiniCPM-V 2.6 的视觉能力,并在性能上进一步提升。在 OpenCompass 综合评测(覆盖 8 个主流基准测试)中取得 <strong>70.2</strong> 的平均分(相比 V 2.6 的 65.2 有显著提升)。在仅 8.7B 参数的条件下:</p>
<ul>
<li><strong>单图理解</strong>: 超越 GPT-4o-202405、Gemini 1.5 Pro、Claude 3.5 Sonnet</li>
<li><strong>多图理解</strong>: 超越 GPT-4V 和 Claude 3.5 Sonnet</li>
<li><strong>视频理解</strong>: 超越 GPT-4V 和 Claude 3.5 Sonnet</li>
<li><strong>上下文学习</strong>: 展现出 promising 的 in-context learning 能力</li>
</ul>
<p>在 OCRBench 上,o 2.6 取得了 <strong>889</strong> 分的成绩,在 25B 参数以下的模型中达到 SOTA,超越了 GPT-4o-202405 等闭源模型。模型支持任意长宽比、最高 <strong>180 万像素</strong>的图像输入,且处理 180 万像素图像仅产生 <strong>640 个视觉 token</strong>。</p>
<blockquote>
<p>译者注: 70.2 的 OpenCompass 平均分是一个跨越式的提升——从 V 2.6 的 65.2 到 o 2.6 的 70.2,5 个百分点的增幅在竞争激烈的 MLLM 领域非常显著。这 5 分的提升很可能来自两方面: 一是模型训练数据的扩充和质量提升,二是语音/音频模态的对齐训练对视觉表示产生了&quot;正向迁移&quot;效应。多模态联合训练的一个常见发现是: 不同模态之间可以相互增强——音频中蕴含的语义信息(如说话内容、情感语调)可以帮助模型更好地理解视觉场景中的&quot;事件含义&quot;(如一个人微笑+欢快的语调=开心)。</p>
</blockquote>
<h3 id="2-2-yynl">2.2 语音能力</h3>
<p>MiniCPM-o 2.6 的语音能力是其相对于 V 系列最大的差异化特征,具体包括:</p>
<p><strong>语音理解</strong>: </p>
<ul>
<li><strong>ASR(自动语音识别)</strong>: 在 Librispeech test-clean 等标准评测上,词错误率(Word Error Rate, WER)显著低于基线</li>
<li><strong>STT 翻译</strong>: 语音到文本翻译性能超越 GPT-4o-realtime</li>
<li><strong>音频理解</strong>: 支持对非语音音频(如环境音、音乐)的理解</li>
</ul>
<p><strong>语音生成</strong>:</p>
<ul>
<li><strong>双语实时语音对话</strong>: 支持英语和中文的实时语音交互,用户可以用语音提问,模型用语音回答</li>
<li><strong>可配置音色</strong>: 支持调整说话人的音色特征</li>
<li><strong>情感/语速/风格控制</strong>: 可以控制生成语音的情感色彩(开心/悲伤/愤怒等)、语速快慢、说话风格(正式/随意等)</li>
<li><strong>端到端语音克隆</strong>: 只需提供少量参考语音样本,模型即可克隆该音色</li>
<li><strong>角色扮演</strong>: 模型可以用不同角色的声音进行对话</li>
</ul>
<blockquote>
<p>语音克隆和角色扮演是 MiniCPM-o 2.6 中最&quot;有趣&quot;的功能,但从技术角度看也最有挑战性。传统的语音克隆通常分为两步: 先提取参考语音的 speaker embedding(说话人嵌入),再在 TTS 阶段注入这个 embedding 来指导音色生成。MiniCPM-o 2.6 的&quot;端到端语音克隆&quot;意味着用户只需给模型听一段语音,模型就能在后续的对话中模仿这个声音——整个过程没有显式的 speaker embedding 提取步骤,模型直接从原始音频波形中学习音色特征。这需要语音编码器具备强大的说话人判别能力,同时语言模型需要学会将&quot;说话人风格&quot;作为生成条件之一。</p>
</blockquote>
<h3 id="2-3-dmtsslsjh">2.3 多模态实时流式交互</h3>
<p>MiniCPM-o 2.6 最具前瞻性的能力是<strong>多模态实时流式交互</strong>(multimodal live streaming)。模型可以:</p>
<ul>
<li>接收<strong>连续的视频流</strong>和<strong>音频流</strong>(不依赖于用户的离散查询)</li>
<li>进行<strong>实时语音交互</strong>(边听边说,无需等待用户说完再回答)</li>
<li>在 StreamingBench 综合评测上,超越 GPT-4o-202408 和 Claude 3.5 Sonnet,达到开源社区最佳水平</li>
</ul>
<p>StreamingBench 的评测维度包括:</p>
<ul>
<li><strong>实时视频理解</strong>: 对连续视频流的内容理解</li>
<li><strong>全源理解</strong>(Omni-source Understanding): 同时融合视频和音频信息的理解</li>
<li><strong>上下文理解</strong>(Contextual Understanding): 对对话历史和实时输入的联合推理</li>
</ul>
<blockquote>
<p>实时流式交互是端侧 AI 从&quot;工具&quot;走向&quot;伙伴&quot;的关键一步。想象一个场景: iPad 上的摄像头对着一桌菜,用户一边夹菜一边问&quot;这道菜有什么营养？&quot;,同时背景音乐在播放。传统模型需要用户先拍照、再提问、再等回答; 而流式模型可以实时&quot;看着&quot;画面、&quot;听着&quot;问题、&quot;感知着&quot;环境音,自然地加入对话。这种体验的差距不是量变,而是质变。但技术挑战也极大: 流式处理要求模型在毫秒级延迟内完成&quot;编码→理解→生成&quot;的完整循环,且不能占用过多功耗——否则设备会很快发热或耗尽电量。</p>
</blockquote>
<h3 id="2-4-kxhwydyy">2.4 可信行为与多语言</h3>
<p>基于 RLAIF-V 和 VisCPM 技术,MiniCPM-o 2.6 具有以下特征:</p>
<ul>
<li><strong>低幻觉率</strong>: 在 MMHal-Bench(多模态幻觉基准测试)上,幻觉率低于 GPT-4o 和 Claude 3.5 Sonnet</li>
<li><strong>多语言能力</strong>: 支持 <strong>30+ 种语言</strong>的视觉-语言理解和语音交互</li>
</ul>
<hr>
<h2 id="3-jgsj">3 架构设计</h2>
<h3 id="3-1-ztjg">3.1 整体架构</h3>
<p>MiniCPM-o 2.6 采用<strong>端到端全模态架构</strong>,核心组件包括:</p>
<ol>
<li><strong>视觉编码器</strong>: SigLip-400M</li>
<li><strong>音频/语音编码器</strong>: 专用的音频编码器(具体架构未完全公开,推测基于 Whisper 或类似的语音预训练模型)</li>
<li><strong>连接器</strong>: Perceiver Resampler(感知器重采样器,将变长视觉/音频特征压缩为固定数量的 token)</li>
<li><strong>语言模型</strong>: Qwen2-7B(作为中央推理引擎)</li>
<li><strong>语音生成器</strong>: 端到端的语音解码模块(将语言模型的隐藏状态直接转换为音频波形或声学特征)</li>
</ol>
<p>总参数量约 8.7B。</p>
<h3 id="3-2-ddd-vs-gdsjg">3.2 端到端 vs 管道式架构</h3>
<p>传统的多模态语音交互系统通常采用<strong>管道式架构</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>音频输入</mtext><mo>→</mo><mtext>ASR</mtext><mo>→</mo><mtext>文本</mtext><mo>→</mo><mtext>LLM</mtext><mo>→</mo><mtext>文本回复</mtext><mo>→</mo><mtext>TTS</mtext><mo>→</mo><mtext>音频输出</mtext></mrow><annotation encoding="application/x-tex">\\text{音频输入} \\rightarrow \\text{ASR} \\rightarrow \\text{文本} \\rightarrow \\text{LLM} \\rightarrow \\text{文本回复} \\rightarrow \\text{TTS} \\rightarrow \\text{音频输出}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">音频输入</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">ASR</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">文本</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">LLM</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">文本回复</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">TTS</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">音频输出</span></span></span></span></span></span><p>这种架构的问题是:</p>
<ul>
<li><strong>误差累积</strong>: ASR 的错误会传递到 LLM,LLM 的错误会传递到 TTS</li>
<li><strong>延迟高</strong>: 每个环节都需要完整的推理时间,总延迟是各环节之和</li>
<li><strong>信息损失</strong>: ASR 将丰富的声学信息(语调、情感、环境音)压缩为纯文本,LLM 无法利用这些线索</li>
<li><strong>交互不自然</strong>: 必须等用户说完才能开始处理,无法做到&quot;边听边想&quot;</li>
</ul>
<p>MiniCPM-o 2.6 的<strong>端到端架构</strong>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>音频/视频/文本输入</mtext><mo>→</mo><mtext>统一编码</mtext><mo>→</mo><mtext>LLM</mtext><mo>→</mo><mtext>文本+音频输出</mtext></mrow><annotation encoding="application/x-tex">\\text{音频/视频/文本输入} \\rightarrow \\text{统一编码} \\rightarrow \\text{LLM} \\rightarrow \\text{文本+音频输出}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord cjk_fallback">音频</span><span class="mord">/</span><span class="mord cjk_fallback">视频</span><span class="mord">/</span><span class="mord cjk_fallback">文本输入</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">统一编码</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord">LLM</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord text"><span class="mord cjk_fallback">文本</span><span class="mord">+</span><span class="mord cjk_fallback">音频输出</span></span></span></span></span></span><p>优势:</p>
<ul>
<li>音频信号直接进入模型,保留完整的声学信息</li>
<li>模型可以学习&quot;语调→情感→语义&quot;的直接映射</li>
<li>延迟显著降低(无需 ASR + TTS 的中间步骤)</li>
<li>支持流式处理(边接收音频边生成回复)</li>
</ul>
<blockquote>
<p>端到端语音交互的核心理念与端到端自动驾驶类似: 把中间的人工设计环节全部去掉,让模型直接从原始输入学到原始输出。但挑战也同样巨大——语音信号的频率范围(20Hz-20kHz)和动态范围远超文本 token,如何高效编码音频是一个关键问题。MiniCPM-o 2.6 的方案很可能是将音频转换为频谱图(spectrogram)或 mel 频谱,再用类似 ViT 的 patch 编码方式处理,最终与视觉 token 一起输入语言模型。语音生成端则可能是基于离散音频 token(如 SoundStream 或 EnCodec 的码本)的自回归生成,或者是基于扩散模型的声学特征生成。</p>
</blockquote>
<h3 id="3-3-sjyyp-token-dlhbm">3.3 视觉与音频 token 的联合编码</h3>
<p>MiniCPM-o 2.6 的视觉编码延续了 V 2.6 的高效策略: 180 万像素图像仅产生 640 个视觉 token。新增的音频编码需要满足类似的效率要求:</p>
<ul>
<li>对于 1 秒的音频(采样率 16kHz),原始波形有 16000 个采样点</li>
<li>经音频编码器压缩后,通常产生数十到数百个音频 token</li>
<li>视觉 token 和音频 token 在语言模型的输入层进行拼接,形成统一的 multimodal token 序列</li>
</ul>
<p>这种联合编码的效率直接决定了模型能处理的视频长度和音频时长。</p>
<hr>
<h2 id="4-xlydq">4 训练与对齐</h2>
<h3 id="4-1-xlsj">4.1 训练数据</h3>
<p>MiniCPM-o 2.6 的训练数据覆盖了全部四种模态:</p>
<ul>
<li><strong>图文数据</strong>: 大规模图文对,用于视觉-语言对齐</li>
<li><strong>视频-文本数据</strong>: 视频帧序列与描述/问答对</li>
<li><strong>音频-文本数据</strong>: 语音转录对(ASR 训练)、音频事件标注</li>
<li><strong>语音对话数据</strong>: 高质量的语音问答和对话数据</li>
<li><strong>多模态对齐数据</strong>: 视频+音频+文本的三模态联合数据</li>
</ul>
<h3 id="4-2-xlcl">4.2 训练策略</h3>
<p>模型的训练分为多个阶段:</p>
<ol>
<li><strong>模态预训练</strong>: 各编码器(视觉、音频、语音)分别在大规模单模态数据上预训练</li>
<li><strong>多模态对齐</strong>: 将预训练好的编码器与语言模型连接,在图文、音文对齐数据上进行联合训练</li>
<li><strong>指令微调(SFT)</strong>: 在多模态指令数据上微调,学习遵循用户指令</li>
<li><strong>RLAIF-V 对齐</strong>: 用 AI 生成的偏好反馈进行多模态对齐,降低幻觉率</li>
</ol>
<blockquote>
<p>RLAIF-V 对齐对全模态模型尤为重要。传统 RLHF 的偏好标注通常是基于文本回答的,但全模态模型的输出包含语音——如何评判两段语音哪个&quot;更好&quot;？RLAIF-V 的解决方案是先将语音输出转录为文本(或用 ASR 模型提取语义内容),然后对文本内容进行原子声明验证。这个 verifier 会检查语音回复中的每个事实性声明是否与输入的多模态上下文(图像+音频)一致。通过这种方式,即使输出是语音形式,也能构建高质量的偏好对用于 DPO 训练。</p>
</blockquote>
<hr>
<h2 id="5-dcbsyxs">5 端侧部署与效率</h2>
<h3 id="5-1-tlxs">5.1 推理效率</h3>
<p>MiniCPM-o 2.6 在端侧设备上的部署效率:</p>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值/特征</th>
</tr>
</thead>
<tbody><tr>
<td>总参数量</td>
<td>8.7B</td>
</tr>
<tr>
<td>视觉 token(180 万像素)</td>
<td>640</td>
</tr>
<tr>
<td>音频处理</td>
<td>实时流式</td>
</tr>
<tr>
<td>语音生成</td>
<td>实时流式</td>
</tr>
<tr>
<td>上下文窗口</td>
<td>128K(Qwen2-7B 原生支持)</td>
</tr>
</tbody></table>
<h3 id="5-2-bskj">5.2 部署框架</h3>
<p>MiniCPM-o 2.6 支持以下推理框架(截至发布时,部分框架需使用官方 fork):</p>
<ul>
<li><strong>llama.cpp</strong>: 官方 fork 支持,提供 GGUF 量化版本</li>
<li><strong>Ollama</strong>: 官方 fork 支持,本地一键部署</li>
<li><strong>vLLM</strong>: 官方 fork 支持,服务端高效推理</li>
<li><strong>SWIFT</strong>: 微调和推理</li>
</ul>
<p>注意: 2025 年 1 月发布时,官方正在将 MiniCPM-o 2.6 的支持合并到上述框架的官方仓库中。在合并完成前,需要使用 OpenBMB 提供的 fork 版本。</p>
<hr>
<h2 id="6-xnpcxb">6 性能评测详表</h2>
<h3 id="6-1-open-compass-zhpc">6.1 OpenCompass 综合评测</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>OpenCompass 平均分</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-o 2.6</td>
<td>8.7B</td>
<td><strong>70.2</strong></td>
</tr>
<tr>
<td>MiniCPM-V 2.6</td>
<td>8B</td>
<td>65.2</td>
</tr>
<tr>
<td>GPT-4o-202405</td>
<td>未公开</td>
<td>&lt; 70.2</td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td>未公开</td>
<td>&lt; 70.2</td>
</tr>
<tr>
<td>Claude 3.5 Sonnet</td>
<td>未公开</td>
<td>&lt; 70.2</td>
</tr>
</tbody></table>
<h3 id="6-2-zxjzcs">6.2 专项基准测试</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>能力维度</th>
<th>MiniCPM-o 2.6</th>
<th>对比</th>
</tr>
</thead>
<tbody><tr>
<td>OCRBench</td>
<td>光学字符识别</td>
<td>889(SOTA, &lt;25B)</td>
<td>超越 GPT-4o-202405</td>
</tr>
<tr>
<td>StreamingBench</td>
<td>实时多模态流</td>
<td>SOTA(开源)</td>
<td>超越 GPT-4o-202408/Claude 3.5 Sonnet</td>
</tr>
<tr>
<td>Librispeech test-clean</td>
<td>语音识别(ASR)</td>
<td>低 WER</td>
<td>超越 GPT-4o-realtime</td>
</tr>
<tr>
<td>MMHal-Bench</td>
<td>幻觉检测</td>
<td>低幻觉</td>
<td>超越 GPT-4o/Claude 3.5 Sonnet</td>
</tr>
<tr>
<td>Video-MME</td>
<td>视频理解</td>
<td>SOTA</td>
<td>超越 GPT-4V/Claude 3.5 Sonnet</td>
</tr>
</tbody></table>
<h3 id="6-3-streaming-bench-xf">6.3 StreamingBench 细分</h3>
<p>StreamingBench 的评测维度及 MiniCPM-o 2.6 的表现:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>说明</th>
<th>MiniCPM-o 2.6 相对表现</th>
</tr>
</thead>
<tbody><tr>
<td>实时视频理解</td>
<td>对连续视频流的理解</td>
<td>超越 GPT-4o-202408</td>
</tr>
<tr>
<td>全源理解</td>
<td>视频+音频联合理解</td>
<td>超越 Claude 3.5 Sonnet</td>
</tr>
<tr>
<td>上下文理解</td>
<td>对话历史+实时输入</td>
<td>开源社区最佳</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-y-mini-cpm-xldgx">7 与 MiniCPM 系列的关系</h2>
<p>MiniCPM-o 2.6 在系列中的定位:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>语言基座</th>
<th>输入模态</th>
<th>输出模态</th>
<th>与 o 2.6 的关系</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.6</td>
<td>2024.08</td>
<td>Qwen2-7B</td>
<td>图+视频+文</td>
<td>文</td>
<td>视觉前代,o 2.6 继承并扩展</td>
</tr>
<tr>
<td><strong>MiniCPM-o 2.6</strong></td>
<td><strong>2025.01</strong></td>
<td><strong>Qwen2-7B</strong></td>
<td><strong>图+视频+音频+文</strong></td>
<td><strong>文+语音</strong></td>
<td><strong>本模型,首个全模态版本</strong></td>
</tr>
<tr>
<td>MiniCPM-V 4.0</td>
<td>2025.08</td>
<td>未公开</td>
<td>图+视频+文</td>
<td>文</td>
<td>后续视觉迭代</td>
</tr>
<tr>
<td>MiniCPM-o 4.5</td>
<td>2026.02</td>
<td>未公开</td>
<td>图+视频+音频+文</td>
<td>文+语音</td>
<td>后续全模态迭代,支持全双工</td>
</tr>
</tbody></table>
<p>从演进路线看,MiniCPM 系列经历了:</p>
<ol>
<li><strong>V 2.0-2.6</strong>: 验证端侧视觉-语言理解的可行性,逐步提升分辨率和效率</li>
<li><strong>o 2.6</strong>: 引入音频和语音模态,实现端到端全模态交互,验证实时流式处理</li>
<li><strong>V 4.x / o 4.5</strong>: 架构重构(LLaVA-UHD v4, Omni-Flow),支持全双工实时交互</li>
</ol>
<blockquote>
<p>译者注: MiniCPM-o 2.6 在系列中的历史意义在于,它是面壁智能从&quot;视觉语言模型&quot;向&quot;全模态智能体&quot;转型的标志性产品。o 2.6 证明了一个关键命题: 在端侧设备上运行全模态、端到端、实时交互的 AI 是可行的。这为后续的 o 4.5(全双工实时交互)和更远的端侧 AI Agent 奠定了技术和市场基础。从商业角度看,o 2.6 的发布时机(2025 年 1 月)恰逢 GPT-4o 发布后的半年,市场对&quot;多模态实时交互&quot;的需求已经被 OpenAI 教育,而 MiniCPM-o 2.6 以开源+端侧的形式提供了可替代方案,这个定位非常精准。</p>
</blockquote>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>首次出现位置</th>
<th>简要解释</th>
</tr>
</thead>
<tbody><tr>
<td>Omni-modal</td>
<td>全模态</td>
<td>第 1 节</td>
<td>同时处理多种输入/输出模态(视觉、音频、语音、文本)</td>
</tr>
<tr>
<td>End-to-End</td>
<td>端到端</td>
<td>第 1 节</td>
<td>从原始输入直接到最终输出,无中间人工设计环节</td>
</tr>
<tr>
<td>ASR</td>
<td>自动语音识别</td>
<td>第 2.2 节</td>
<td>将语音信号转换为文本的技术</td>
</tr>
<tr>
<td>STT</td>
<td>语音到文本</td>
<td>第 2.2 节</td>
<td>Speech-to-Text,同 ASR</td>
</tr>
<tr>
<td>TTS</td>
<td>文本到语音</td>
<td>第 3.2 节</td>
<td>Text-to-Speech,将文本合成为语音</td>
</tr>
<tr>
<td>WER</td>
<td>词错误率</td>
<td>第 2.2 节</td>
<td>Word Error Rate,语音识别准确率指标</td>
</tr>
<tr>
<td>Speaker Embedding</td>
<td>说话人嵌入</td>
<td>第 2.2 节</td>
<td>表征说话人音色特征的低维向量</td>
</tr>
<tr>
<td>Live Streaming</td>
<td>实时流式</td>
<td>第 2.3 节</td>
<td>连续接收输入流并实时处理,非离散查询</td>
</tr>
<tr>
<td>StreamingBench</td>
<td>—</td>
<td>第 2.3 节</td>
<td>实时多模态流式理解评测基准</td>
</tr>
<tr>
<td>RLAIF-V</td>
<td>—</td>
<td>第 4.2 节</td>
<td>基于 AI 反馈的视觉强化学习对齐</td>
</tr>
</tbody></table>
<h3 id="b-mxpxdw">B. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: MiniCPM-V 2.6(视觉架构、RLAIF-V 对齐、Qwen2-7B 基座、640 token 视觉压缩)</li>
<li><strong>核心创新</strong>: (1) 端到端全模态架构,统一处理视觉+音频+语音+文本; (2) 实时多模态流式交互能力; (3) 语音克隆/情感控制/角色扮演等高级语音功能; (4) 双语实时语音对话</li>
<li><strong>被后续工作引用/影响</strong>: MiniCPM-o 4.5 在 o 2.6 基础上引入全双工(real-time full-duplex)能力,实现同时看、听、说; 端侧全模态模型成为 2025-2026 年开源社区的重要方向(Qwen2.5-Omni、Gemini 等竞品陆续跟进)</li>
<li><strong>技术定位</strong>: 端侧 MLLM 从&quot;视觉+文本&quot;向&quot;全模态+实时流式&quot;演进的关键节点,首个在端侧实现 GPT-4o 级别全模态能力的开源模型</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxgs","text":"1 模型概述"},{"level":2,"id":"2-hxnl","text":"2 核心能力"},{"level":3,"id":"2-1-sjlj","text":"2.1 视觉理解"},{"level":3,"id":"2-2-yynl","text":"2.2 语音能力"},{"level":3,"id":"2-3-dmtsslsjh","text":"2.3 多模态实时流式交互"},{"level":3,"id":"2-4-kxhwydyy","text":"2.4 可信行为与多语言"},{"level":2,"id":"3-jgsj","text":"3 架构设计"},{"level":3,"id":"3-1-ztjg","text":"3.1 整体架构"},{"level":3,"id":"3-2-ddd-vs-gdsjg","text":"3.2 端到端 vs 管道式架构"},{"level":3,"id":"3-3-sjyyp-token-dlhbm","text":"3.3 视觉与音频 token 的联合编码"},{"level":2,"id":"4-xlydq","text":"4 训练与对齐"},{"level":3,"id":"4-1-xlsj","text":"4.1 训练数据"},{"level":3,"id":"4-2-xlcl","text":"4.2 训练策略"},{"level":2,"id":"5-dcbsyxs","text":"5 端侧部署与效率"},{"level":3,"id":"5-1-tlxs","text":"5.1 推理效率"},{"level":3,"id":"5-2-bskj","text":"5.2 部署框架"},{"level":2,"id":"6-xnpcxb","text":"6 性能评测详表"},{"level":3,"id":"6-1-open-compass-zhpc","text":"6.1 OpenCompass 综合评测"},{"level":3,"id":"6-2-zxjzcs","text":"6.2 专项基准测试"},{"level":3,"id":"6-3-streaming-bench-xf","text":"6.3 StreamingBench 细分"},{"level":2,"id":"7-y-mini-cpm-xldgx","text":"7 与 MiniCPM 系列的关系"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-mxpxdw","text":"B. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/09-mini-cpm-o-2.6/01-mini-cpm-o-2.6-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/09-mini-cpm-o-2.6/01-mini-cpm-o-2.6-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-o-2.6 技术报告精译</h1>
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
