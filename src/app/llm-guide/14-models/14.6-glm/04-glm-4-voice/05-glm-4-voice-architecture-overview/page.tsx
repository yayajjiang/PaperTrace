"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4-Voice 端到端语音对话架构与低延迟设计剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: GLM-4-Voice: Towards Intelligent and Human-Like End-to-End Spoken Chatbot (arXiv:2412.02612)
发布日期: 2024-12-03
发布机构: Zhipu.AI / 清华大学
开源协议: 模型权重开源 (GLM-4-Voice-9B)</p>
</blockquote>
<hr>
<h2 id="1-sjdj-wsmxydddyydh">1. 设计动机: 为什么需要端到端语音对话</h2>
<p>传统语音对话机器人采用级联 pipeline:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>语音输入</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>ASR</mtext></mpadded></mover><mtext>文本</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>LLM</mtext></mpadded></mover><mtext>文本回复</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>TTS</mtext></mpadded></mover><mtext>语音输出</mtext></mrow><annotation encoding="application/x-tex">\\text{语音输入} \\xrightarrow{\\text{ASR}} \\text{文本} \\xrightarrow{\\text{LLM}} \\text{文本回复} \\xrightarrow{\\text{TTS}} \\text{语音输出}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">语音输入</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ASR</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
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
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">文本回复</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">TTS</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">语音输出</span></span></span></span></span></span><p>这一方案有三个结构性缺陷:</p>
<table>
<thead>
<tr>
<th>缺陷</th>
<th>具体表现</th>
<th>影响</th>
</tr>
</thead>
<tbody><tr>
<td>高延迟</td>
<td>ASR、LLM、TTS 串行执行</td>
<td>首包延迟通常 3-5 秒</td>
</tr>
<tr>
<td>复合错误</td>
<td>ASR 误识别导致 LLM 理解偏差</td>
<td>错误逐级放大</td>
</tr>
<tr>
<td>情感丢失</td>
<td>TTS 无法还原 LLM 的语气和情感</td>
<td>交互机械化</td>
</tr>
</tbody></table>
<p>端到端语音模型(SpeechLM)将语音直接映射到语音,消除了中间文本表示的瓶颈. 但面临一个核心矛盾:<strong>语音数据比文本数据少几个数量级</strong>. 互联网上可获取的文本语料以万亿计,而高质量语音录音仅数百万小时.</p>
<p>GLM-4-Voice 的解决方案是**「合成交错数据 + 知识迁移」**: 用 text-to-token 模型将文本预训练语料「语音化」,生成语音-文本交错数据,从而让模型在 1T token 规模上学习语音-文本对齐. 这避免了像 Moshi 那样堆叠 700 万小时真实语音数据的成本,同时保留了文本 LLM 的知识.</p>
<p>这里需要停下来想一下. GLM-4-Voice 的路线选择与 Moshi 形成了鲜明的工程哲学对比. Moshi 信奉「数据即一切」——用 700 万小时真实语音数据训练 7B 模型,证明暴力 scaling 在语音领域同样有效. GLM-4-Voice 则信奉「知识迁移」——用 1T token 的合成交错数据,将 GLM-4-9B 的文本知识「翻译」到语音模态. 两种路线各有优劣: Moshi 的语音更自然(真实数据保真度高),但知识深度受限; GLM-4-Voice 的知识更丰富(继承了 10T 文本预训练),但合成语音的自然度取决于 text-to-token 模型的质量. 从评估结果看,GLM-4-Voice 在语音问答(Llama Questions S→S: 50.7% vs Moshi 21.0%)和对话质量(General QA: 5.40 vs 2.42)上大幅领先,验证了知识迁移路线的有效性.</p>
<hr>
<h2 id="2-yyfcq-175-bps-djzys">2. 语音分词器: 175 bps 的极致压缩</h2>
<h3 id="2-1-jslxzz">2.1 技术路线之争</h3>
<p>语音分词器的技术路线可分为三类:</p>
<table>
<thead>
<tr>
<th>路线</th>
<th>代表</th>
<th>码率</th>
<th>优势</th>
<th>劣势</th>
</tr>
</thead>
<tbody><tr>
<td>声学编解码器</td>
<td>SoundStream, EnCodec</td>
<td>6-24 kbps</td>
<td>重建质量高</td>
<td>RVQ 多码本,不适合自回归</td>
</tr>
<tr>
<td>语义 token</td>
<td>HuBERT</td>
<td>&lt;1 kbps</td>
<td>与文本对齐好</td>
<td>丢失声学细节,合成质量差</td>
</tr>
<tr>
<td>监督语义 token</td>
<td>CosyVoice, GLM-4-Voice</td>
<td>175 bps</td>
<td>语义+声学平衡,单码本</td>
<td>需从 ASR 模型衍生</td>
</tr>
</tbody></table>
<p>GLM-4-Voice 选择「监督语义 token」路线: 在预训练 ASR 模型(Whisper-large-v3)的Encoder 中间插入向量量化(VQ)瓶颈,通过池化层将帧率从 50Hz 降到 12.5Hz.</p>
<h3 id="2-2-zj-vq-pjdsjzx">2.2 中间 VQ 瓶颈的设计哲学</h3>
<p>ASR Encoder 的结构可以抽象为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>波形</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>前半部分</mtext></mpadded></mover><mtext>声学特征</mtext><mover><mo stretchy="true" minsize="3.0em">→</mo><mpadded width="+0.6em" lspace="0.3em"><mtext>后半部分</mtext></mpadded></mover><mtext>文本</mtext></mrow><annotation encoding="application/x-tex">\\text{波形} \\xrightarrow{\\text{前半部分}} \\text{声学特征} \\xrightarrow{\\text{后半部分}} \\text{文本}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">波形</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">前半部分</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1113em;vertical-align:-0.011em;"></span><span class="mord text"><span class="mord cjk_fallback">声学特征</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel x-arrow"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1003em;"><span style="top:-3.322em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight x-arrow-pad"><span class="mord mtight"><span class="mord text mtight"><span class="mord cjk_fallback mtight">后半部分</span></span></span></span></span><span class="svg-align" style="top:-2.689em;"><span class="pstrut" style="height:2.7em;"></span><span class="hide-tail" style="height:0.522em;min-width:1.469em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="0.522em" viewBox="0 0 400000 522" preserveAspectRatio="xMaxYMin slice"><path d="M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.011em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord text"><span class="mord cjk_fallback">文本</span></span></span></span></span></span><p>在「中间」截断并量化,意味着量化后的 token 既保留了足够的语义信息(后半部分仍能解码出文本),又足够紧凑(经过了量化压缩). 这是一种「语义锚定」策略——token 的语义内容由 ASR 模型的训练目标保证,而非像 HuBERT 那样通过自监督学习「发现」语音单元.</p>
<p>关键工程细节:</p>
<ul>
<li><strong>池化层</strong>: 将 50Hz 降到 12.5Hz,每 4 帧取平均,降低码率的关键</li>
<li><strong>EMA 更新码本</strong>: 衰减系数 0.99,防止码本坍缩</li>
<li><strong>死码本重置</strong>: 使用率低于阈值的向量被随机重置,确保码本利用率</li>
<li><strong>因果卷积 + 块因果注意力</strong>: 支持流式推理,块大小决定延迟-质量权衡</li>
</ul>
<h3 id="2-3-12-5-hz-175-bps-dqh">2.3 12.5 Hz / 175 bps 的权衡</h3>
<p>表 1 展示了不同帧率变体的对比:</p>
<table>
<thead>
<tr>
<th>分词器</th>
<th>帧率</th>
<th>码率</th>
<th>ASR (LS-clean)</th>
<th>重建 (MOSNet)</th>
</tr>
</thead>
<tbody><tr>
<td>50Hz 变体</td>
<td>50Hz</td>
<td>600 bps</td>
<td>1.85 WER</td>
<td>3.38</td>
</tr>
<tr>
<td>12.5Hz 变体</td>
<td>12.5Hz</td>
<td>175 bps</td>
<td>2.10 WER</td>
<td>3.39</td>
</tr>
<tr>
<td>6.25Hz 变体</td>
<td>6.25Hz</td>
<td>100 bps</td>
<td>14.41 WER</td>
<td>3.24</td>
</tr>
</tbody></table>
<p>这里值得停下来想一下. 12.5Hz/175bps 的选择是一个精心权衡的结果. 对比 50Hz/600bps: ASR 性能仅下降 0.25 WER,但码率降低近 3.5 倍. 对比 Mimi 的 12.5Hz/1.1Kbps: GLM-4-Voice 的码率只有 1/6,但重建质量反而更高(MOSNet 3.39 vs 2.89). 这说明「单码本监督语义 token + 流匹配Decoder 」的组合,在效率-质量权衡上明显优于 RVQ 方案. 6.25Hz/100bps 则是一个反面教材: ASR WER 飙升到 14.41,说明压缩过度导致语义信息大量丢失——存在一个「压缩极限」,低于此极限后语义保真度断崖式下降.</p>
<hr>
<h2 id="3-yy-decoder-lppylstl">3. 语音Decoder: 流匹配与流式推理</h2>
<h3 id="3-1-jg">3.1 架构</h3>
<p>GLM-4-Voice 的语音Decoder  采用三组件设计:</p>
<ol>
<li><strong>语音 token Encoder</strong>: 将离散语音 token 映射到连续嵌入空间</li>
<li><strong>条件流匹配模型</strong>: 将嵌入映射到声学特征(如梅尔频谱)</li>
<li><strong>HiFi-GAN 声码器</strong>: 将声学特征转换为原始波形</li>
</ol>
<p>流匹配(flow matching)相比传统扩散模型的优势在于推理效率: 扩散模型通常需要 50-1000 步去噪,而流匹配仅需 10-20 步即可生成高质量样本,延迟显著降低.</p>
<h3 id="3-2-ljdxl">3.2 两阶段训练</h3>
<ul>
<li><strong>预训练阶段</strong>: 使用无监督语音数据(各种说话人、各种质量),学习通用的声学映射</li>
<li><strong>微调阶段</strong>: 使用单一说话人的高质量语音样本,优化特定说话人的音质</li>
</ul>
<p>这种「先泛化后特化」的策略是 TTS 领域的标准做法. 预训练阶段的「脏数据」让模型见过足够多的声学变化,微调阶段的「干净数据」则收敛到目标音质.</p>
<h3 id="3-3-lstl">3.3 流式推理</h3>
<p>为支持实时交互,Decoder  采用块级流式推理:</p>
<ul>
<li>音频分块: 每块 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>b</mi><mo>=</mo><mn>0.8</mn></mrow><annotation encoding="application/x-tex">b = 0.8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">b</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.8</span></span></span></span> 秒</li>
<li>自回归生成: 第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 块使用前 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>n</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(n-1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">)</span></span></span></span> 块作为 prompt,预测第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 块内容</li>
<li>最小延迟: 需要 10 个语音 token 才能生成初始输出(对应约 0.8 秒语音)</li>
</ul>
<hr>
<h2 id="4-lssk-dycyydhdgccx">4. 流式思考: 低延迟语音对话的工程创新</h2>
<h3 id="4-1-ycfj">4.1 延迟分解</h3>
<p>如果不采用流式策略,端到端语音模型的延迟为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>T</mi><mtext>total</mtext></msub><mo>=</mo><msub><mi>T</mi><mtext>ASR</mtext></msub><mo>+</mo><msub><mi>T</mi><mtext>LLM_full</mtext></msub><mo>+</mo><msub><mi>T</mi><mtext>TTS</mtext></msub></mrow><annotation encoding="application/x-tex">T_{\\text{total}} = T_{\\text{ASR}} + T_{\\text{LLM\\_full}} + T_{\\text{TTS}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">total</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ASR</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0503em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LLM_full</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">TTS</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>T</mi><mtext>LLM_full</mtext></msub></mrow><annotation encoding="application/x-tex">T_{\\text{LLM\\_full}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0503em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">LLM_full</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span></span></span></span> 是生成完整文本回复的时间(可能数百个 token). GLM-4-Voice 的「流式思考(Streaming Thoughts)」模板将延迟降低到:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>T</mi><mtext>total</mtext></msub><mo>=</mo><msub><mi>T</mi><mtext>speech_tokenize</mtext></msub><mo>+</mo><msub><mi>T</mi><mtext>llm_prefill</mtext></msub><mo>+</mo><msub><mi>T</mi><mtext>llm_decode</mtext></msub><mo stretchy="false">(</mo><mn>23</mn><mo stretchy="false">)</mo><mo>+</mo><msub><mi>T</mi><mtext>speech_decode</mtext></msub><mo stretchy="false">(</mo><mn>10</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">T_{\\text{total}} = T_{\\text{speech\\_tokenize}} + T_{\\text{llm\\_prefill}} + T_{\\text{llm\\_decode}}(23) + T_{\\text{speech\\_decode}}(10)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">total</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0503em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">speech_tokenize</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0503em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">llm_prefill</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.117em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">llm_decode</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord">23</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.117em;vertical-align:-0.367em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">speech_decode</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.367em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord">10</span><span class="mclose">)</span></span></span></span></span><h3 id="4-2-jtsccl">4.2 交替生成策略</h3>
<p>核心设计: 模型以固定比例在文本 token 和语音 token 之间交替生成:</p>
<ul>
<li>生成 13 个文本 token → 生成 26 个语音 token → 生成 13 个文本 token → ...</li>
</ul>
<p>文本 token 和语音 token 分别拼接形成完整的文本回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">A_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和语音回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>s</mi></msub></mrow><annotation encoding="application/x-tex">A_s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>.</p>
<p>这里的设计权衡非常清晰:</p>
<ol>
<li><strong>1:2 的比例</strong>: 确保文本生成始终比语音生成快,为语音 token 提供必要的语义上下文</li>
<li><strong>26 个语音 token</strong>: 对应约 2 秒语音(12.5Hz × 26 / 1000 ≈ 2.08s),使模型能在合成前生成一个连贯的内容片段</li>
<li><strong>首包延迟</strong>: 仅需 13 文本 token + 10 语音 token = 23 个 token 即可输出第一个音频块</li>
</ol>
<p>这里需要停下来想一下. 流式思考模板的巧妙之处在于它把「文本生成」和「语音生成」从串行关系变成了交错关系. 在传统方案中,模型必须先「想好」完整回答,再开始「说」;而在流式思考中,模型可以「边想边说」——每生成一段文本,就立即将其转换为语音输出. 这与人类对话的自然模式更接近: 我们不会先在脑中写完整篇演讲稿再开口,而是边说边组织语言. 1:2 的比例也经过精心设计: 文本 token 的生成速度通常远快于语音 token(因为语音 token 需要更多上下文依赖),确保文本始终领先于语音,为语音生成提供足够的语义指导.</p>
<hr>
<h2 id="5-yxl-1t-token-dsjgc">5. 预训练: 1T Token 的数据工程</h2>
<h3 id="5-1-sjpb">5.1 数据配比</h3>
<p>GLM-4-Voice 在 1T token 上的预训练数据组成:</p>
<table>
<thead>
<tr>
<th>数据类型</th>
<th>Speech Token</th>
<th>Text Token</th>
<th>Epochs</th>
</tr>
</thead>
<tbody><tr>
<td>Speech-Text 交错</td>
<td>455B</td>
<td>279B</td>
<td>0.90</td>
</tr>
<tr>
<td>Speech-Only</td>
<td>31B</td>
<td>-</td>
<td>2.10</td>
</tr>
<tr>
<td>ASR + TTS</td>
<td>11B</td>
<td>3.5B</td>
<td>2.07</td>
</tr>
<tr>
<td>Text-only</td>
<td>-</td>
<td>10T</td>
<td>0.03</td>
</tr>
</tbody></table>
<h3 id="5-2-hcjcsjdsc">5.2 合成交错数据的生成</h3>
<p>核心创新: 使用 <strong>text-to-token 模型</strong> 从文本预训练数据合成语音-文本交错数据. 具体流程:</p>
<ol>
<li>取一段文本语料</li>
<li>用 text-to-token 模型将文本转换为对应的语音 token 序列</li>
<li>将语音 token 和文本 token 按固定模式交错排列</li>
<li>形成「语音-文本-语音-文本...」的交错序列用于预训练</li>
</ol>
<p>这种方法的本质是<strong>用 text-to-token 模型「朗读」文本语料</strong>,让模型在预训练阶段就建立「语音和文本说的是同一件事」的跨模态对齐. 由于不需要真实的语音录音,可以无限扩展数据规模——仅受限于文本语料的规模.</p>
<p>这里值得停下来想一下. 合成交错数据的巧妙之处在于它解决了语音数据稀缺的根本矛盾. 传统方法需要收集真实的语音-文本平行语料(如 LibriSpeech 的有声书),成本高、规模有限. text-to-token 模型则可以将任意文本语料「语音化」,相当于一个无限规模的语音数据集生成器. 但代价是合成语音的质量和自然度取决于 text-to-token 模型的能力——如果合成质量差,模型可能学到「错误的语音-文本映射」. GLM-4-Voice 的实验表明,即使使用合成数据,模型在真实语音任务上的表现仍达到 SOTA,说明合成数据的质量足够高.</p>
<h3 id="5-3-jxyxldcl">5.3 继续预训练的策略</h3>
<p>GLM-4-Voice 从 GLM-4-9B-Base 初始化,词表扩展以包含语音 token. 关键训练参数:</p>
<ul>
<li><strong>学习率</strong>: 6e-5 → 6e-6(远低于 base 预训练的 3e-4 量级)</li>
<li><strong>文本比例</strong>: 固定 30%,防止语音预训练遗忘文本能力</li>
<li><strong>序列长度</strong>: 8192</li>
<li><strong>优化器</strong>: AdamW, β1=0.9, β2=0.95</li>
</ul>
<p>低学习率是继续预训练的标准做法——避免破坏已学到的文本表示. 30% 的文本比例是保守设计,确保模型在获得语音能力的同时保持文本能力.</p>
<hr>
<h2 id="6-jdwt-ssymybdcxl">6. 监督微调: 损失掩码与不对称训练</h2>
<h3 id="6-1-rwjo">6.1 任务解耦</h3>
<p>GLM-4-Voice 将语音到语音任务解耦为两个子任务:</p>
<ul>
<li><strong>Speech-to-Text</strong>: 基于用户语音 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>Q</mi><mi>s</mi></msub></mrow><annotation encoding="application/x-tex">Q_s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 生成文本回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">A_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></li>
<li><strong>Speech-and-Text-to-Speech</strong>: 基于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>Q</mi><mi>s</mi></msub></mrow><annotation encoding="application/x-tex">Q_s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">A_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 生成语音回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>A</mi><mi>s</mi></msub></mrow><annotation encoding="application/x-tex">A_s</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">A</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">s</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></li>
</ul>
<h3 id="6-2-ssymcl">6.2 损失掩码策略</h3>
<p>模型学习两个子任务的速度不同——文本生成比语音生成快得多. 为解决这一差异,GLM-4-Voice 采用损失掩码:</p>
<ul>
<li><strong>样本 A</strong>: 只计算文本输出的损失(语音输出被掩码)</li>
<li><strong>样本 B</strong>: 只计算语音输出的损失(文本输出被掩码)</li>
</ul>
<p>这相当于一种多任务学习,避免了语音生成任务被文本生成任务「淹没」.</p>
<h3 id="6-3-bdcxlzq">6.3 不对称训练周期</h3>
<table>
<thead>
<tr>
<th>目标</th>
<th>训练 Epoch</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>语音输出</td>
<td>20</td>
<td>更难学,需要更多迭代</td>
</tr>
<tr>
<td>文本输出</td>
<td>4</td>
<td>相对容易,快速收敛</td>
</tr>
</tbody></table>
<p><strong>正则化</strong>: Dropout 0.5(相当高,说明对话数据量相对较小),权重衰减 0.1,梯度裁剪 1.0.</p>
<hr>
<h2 id="7-xndw-dddyydhd-sota">7. 性能定位: 端到端语音对话的 SOTA</h2>
<h3 id="7-1-yywd">7.1 语音问答</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>S→S (Llama Questions)</th>
<th>S→T (Llama Questions)</th>
</tr>
</thead>
<tbody><tr>
<td>Moshi (7B)</td>
<td>21.0%</td>
<td>62.3%</td>
</tr>
<tr>
<td>GLM-4-Voice (9B)</td>
<td><strong>50.7%</strong></td>
<td><strong>64.7%</strong></td>
</tr>
</tbody></table>
<p>S→S 设置下 50.7% vs 21.0% 的差距尤为关键: 这说明 GLM-4-Voice 的语音预训练让模型学会了「直接用语音思考」,而不仅仅是「先转文本再回答」. 但 S→T 始终优于 S→S 的事实也表明,<strong>文本作为中间表示仍然有价值</strong>——至少在当前技术水平下,纯语音推理还无法完全替代文本推理.</p>
<h3 id="7-2-dhzl">7.2 对话质量</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>General QA</th>
<th>Knowledge</th>
<th>UTMOS</th>
<th>ASR-WER</th>
</tr>
</thead>
<tbody><tr>
<td>Moshi</td>
<td>2.42</td>
<td>3.60</td>
<td>3.90</td>
<td>7.95%</td>
</tr>
<tr>
<td>Llama-Omni</td>
<td>3.50</td>
<td>3.90</td>
<td>3.92</td>
<td>9.18%</td>
</tr>
<tr>
<td>GLM-4-Voice</td>
<td><strong>5.40</strong></td>
<td><strong>5.20</strong></td>
<td><strong>4.45</strong></td>
<td><strong>5.74%</strong></td>
</tr>
</tbody></table>
<p>GLM-4-Voice 在对话智能(General QA 5.40)、知识准确性(Knowledge 5.20)、语音自然度(UTMOS 4.45)和语音-文本一致性(ASR-WER 5.74%)上全面领先. ASR-WER 5.74% 意味着语音输出与文本输出高度一致,模型几乎不会在「说一套写一套」上出问题.</p>
<h3 id="7-3-asr-tts-nl">7.3 ASR/TTS 能力</h3>
<p>GLM-4-Voice 同时具备强大的 ASR 和 TTS 能力:</p>
<table>
<thead>
<tr>
<th>任务</th>
<th>指标</th>
<th>GLM-4-Voice</th>
<th>专业基线</th>
</tr>
</thead>
<tbody><tr>
<td>ASR (EN)</td>
<td>LS-clean WER</td>
<td>2.82%</td>
<td>Whisper: 2.50%</td>
</tr>
<tr>
<td>ASR (ZH)</td>
<td>AISHELL-1 CER</td>
<td>2.46%</td>
<td>SenseVoice: 2.09%</td>
</tr>
<tr>
<td>TTS (EN)</td>
<td>LibriTTS WER</td>
<td>2.91%</td>
<td>CosyVoice: 3.17%</td>
</tr>
<tr>
<td>TTS (ZH)</td>
<td>Seed-TTS WER</td>
<td>2.10%</td>
<td>CosyVoice: 3.39%</td>
</tr>
</tbody></table>
<p>ASR 接近专业模型水平,TTS 在中文上甚至优于 CosyVoice——体现了双语模型的优势.</p>
<hr>
<h2 id="8-mxpxdw">8. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: GLM-4-9B-Base(文本预训练权重) + Whisper-large-v3(语音分词器初始化) + CosyVoice(语音Decoder  架构)</li>
<li><strong>核心创新</strong>:<ul>
<li>12.5 Hz 单码本监督语音分词器(175 bps),从 ASR 模型中间 VQ 瓶颈衍生</li>
<li>基于 text-to-token 模型的合成交错语音-文本数据,解决语音数据稀缺</li>
<li>流式思考(Streaming Thoughts)模板,13:26 文本-语音交替生成降低延迟</li>
<li>1T token 语音-文本联合继续预训练,30% 文本比例防止遗忘</li>
<li>损失掩码与不对称训练(20 epoch 语音 vs 4 epoch 文本)</li>
</ul>
</li>
<li><strong>同期竞品</strong>:<ul>
<li>Moshi(Kyutai, 700 万小时真实语音,全双工)</li>
<li>Llama-Omni(在 LLM 后嫁接 TTS,缺乏语音预训练)</li>
<li>Mini-Omni(直接微调 LLM 生成语音,质量受限)</li>
</ul>
</li>
<li><strong>路线对比</strong>:<ul>
<li>Moshi: 真实数据 scaling(700 万小时) → 语音自然度高,知识深度受限</li>
<li>GLM-4-Voice: 合成数据 + 知识迁移(1T token) → 知识丰富,数据效率更高</li>
</ul>
</li>
<li><strong>开源影响</strong>:<ul>
<li>GLM-4-Voice-9B 开源,促进端到端语音模型研究</li>
<li>语音分词器和交错数据合成方法被后续 GLM-4-V 等多模态模型借鉴</li>
</ul>
</li>
</ul>
<hr>
<p><em>本文档基于 GLM-4-Voice 技术报告(arXiv:2412.02612)进行系统性架构剖析.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-wsmxydddyydh","text":"1. 设计动机: 为什么需要端到端语音对话"},{"level":2,"id":"2-yyfcq-175-bps-djzys","text":"2. 语音分词器: 175 bps 的极致压缩"},{"level":3,"id":"2-1-jslxzz","text":"2.1 技术路线之争"},{"level":3,"id":"2-2-zj-vq-pjdsjzx","text":"2.2 中间 VQ 瓶颈的设计哲学"},{"level":3,"id":"2-3-12-5-hz-175-bps-dqh","text":"2.3 12.5 Hz / 175 bps 的权衡"},{"level":2,"id":"3-yy-decoder-lppylstl","text":"3. 语音Decoder: 流匹配与流式推理"},{"level":3,"id":"3-1-jg","text":"3.1 架构"},{"level":3,"id":"3-2-ljdxl","text":"3.2 两阶段训练"},{"level":3,"id":"3-3-lstl","text":"3.3 流式推理"},{"level":2,"id":"4-lssk-dycyydhdgccx","text":"4. 流式思考: 低延迟语音对话的工程创新"},{"level":3,"id":"4-1-ycfj","text":"4.1 延迟分解"},{"level":3,"id":"4-2-jtsccl","text":"4.2 交替生成策略"},{"level":2,"id":"5-yxl-1t-token-dsjgc","text":"5. 预训练: 1T Token 的数据工程"},{"level":3,"id":"5-1-sjpb","text":"5.1 数据配比"},{"level":3,"id":"5-2-hcjcsjdsc","text":"5.2 合成交错数据的生成"},{"level":3,"id":"5-3-jxyxldcl","text":"5.3 继续预训练的策略"},{"level":2,"id":"6-jdwt-ssymybdcxl","text":"6. 监督微调: 损失掩码与不对称训练"},{"level":3,"id":"6-1-rwjo","text":"6.1 任务解耦"},{"level":3,"id":"6-2-ssymcl","text":"6.2 损失掩码策略"},{"level":3,"id":"6-3-bdcxlzq","text":"6.3 不对称训练周期"},{"level":2,"id":"7-xndw-dddyydhd-sota","text":"7. 性能定位: 端到端语音对话的 SOTA"},{"level":3,"id":"7-1-yywd","text":"7.1 语音问答"},{"level":3,"id":"7-2-dhzl","text":"7.2 对话质量"},{"level":3,"id":"7-3-asr-tts-nl","text":"7.3 ASR/TTS 能力"},{"level":2,"id":"8-mxpxdw","text":"8. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/04-glm-4-voice/05-glm-4-voice-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/04-glm-4-voice/05-glm-4-voice-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4-Voice 端到端语音对话架构与低延迟设计剖析</h1>
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
