"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V-2.6 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文来源: OpenBMB GitHub 官方仓库 / HuggingFace 模型卡片 / 官方发布说明
官方链接: <a href="https://github.com/OpenBMB/MiniCPM-V">https://github.com/OpenBMB/MiniCPM-V</a>
HuggingFace: <a href="https://huggingface.co/openbmb/MiniCPM-V-2_6">https://huggingface.co/openbmb/MiniCPM-V-2_6</a>
发布日期: 2024 年 8 月 6 日
发布机构: 清华大学面壁智能(OpenBMB)
模型规模: 8B 参数(SigLip-400M 视觉编码器 + Qwen2-7B 语言模型)
说明: MiniCPM-V 2.6 无独立技术报告 PDF, 本文基于官方公开信息综合整理精译</p>
</blockquote>
<hr>
<h2 id="1-mxgs">1 模型概述</h2>
<p>MiniCPM-V 2.6 是面壁智能于 2024 年 8 月发布的端侧多模态大语言模型(Multimodal Large Language Model, MLLM),总参数量为 8B。该模型在单图理解、多图联合推理和视频理解三个维度上同时取得了超越 GPT-4V 的表现,成为当时开源社区中首个在端侧设备(iPad)上支持实时视频理解的 MLLM。</p>
<p>与上一代 MiniCPM-Llama3-V 2.5 相比,MiniCPM-V 2.6 进行了三项关键升级: (1) 语言基座从 Llama3-8B 切换为 Qwen2-7B; (2) 新增原生视频理解能力; (3) 进一步优化了视觉 token 密度,使 180 万像素图像的视觉编码 token 数降至 640 个,比业界主流方案减少约 75%。</p>
<blockquote>
<p>这里需要注意一个工程决策: 为什么从 Llama3-8B 换到 Qwen2-7B？Llama3-8B 在英文任务上确实很强,但 MiniCPM-V 系列的核心定位是&quot;端侧中文多模态&quot;。Qwen2-7B 在中文语料上的覆盖度和指令跟随能力在 2024 年上半年的评测中已超越同级别的 Llama3,且 Qwen2 的 tokenizer 对中文更友好(相同的汉字序列对应的 token 数更少,直接降低了推理成本)。此外,Qwen2-7B 的上下文窗口为 128K,为后续的长视频理解留出了空间。这个基座切换不是简单的&quot;换壳&quot;,而是对目标用户群体(中文端侧用户)的精准适配。</p>
</blockquote>
<hr>
<h2 id="2-hxnl">2 核心能力</h2>
<h3 id="2-1-dtlj">2.1 单图理解</h3>
<p>MiniCPM-V 2.6 在 OpenCompass 综合评测(覆盖 8 个主流基准测试)中取得 <strong>65.2</strong> 的平均分。在仅 8B 参数的条件下,该模型在单图理解任务上超越了以下商用闭源模型:</p>
<ul>
<li>GPT-4o mini</li>
<li>GPT-4V</li>
<li>Gemini 1.5 Pro</li>
<li>Claude 3.5 Sonnet</li>
</ul>
<p>这一结果延续了 MiniCPM 系列&quot;以小博大&quot;的产品哲学。值得注意的是,上述对比模型的参数规模均未公开,但业界普遍估计 GPT-4V 级别的模型参数量在数百 B 量级。</p>
<p>在专项能力方面,MiniCPM-V 2.6 在 OCRBench(光学字符识别基准测试)上取得了开源模型中的最优成绩,超越了 GPT-4o、GPT-4V 和 Gemini 1.5 Pro 等闭源模型。该模型支持任意长宽比、最高 <strong>180 万像素</strong>(如 1344x1344 分辨率)的图像输入。</p>
<blockquote>
<p>译者注: 65.2 的 OpenCompass 平均分是一个值得仔细拆解的数字。OpenCompass 的评测集包含 MMBench、MME、MMMU、MathVista、OCRBench、TextVQA 等 8 个基准,覆盖了从通用视觉问答到数学推理再到 OCR 的广泛能力。单一高分可能意味着模型在某几项上&quot;偏科&quot;,但 65.2 作为一个跨领域综合分数,说明 MiniCPM-V 2.6 的能力分布相对均衡。OCRBench 的 SOTA 尤其值得关注——OCR 是端侧场景中最高频的刚需之一(拍照翻译、文档扫描、菜单识别),这项能力直接决定了产品的可用性。</p>
</blockquote>
<h3 id="2-2-dtljysxwxx">2.2 多图理解与上下文学习</h3>
<p>MiniCPM-V 2.6 支持对多张图像进行联合对话和推理。在多图基准测试上,该模型取得了以下成绩:</p>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>能力维度</th>
<th>表现</th>
</tr>
</thead>
<tbody><tr>
<td>Mantis-Eval</td>
<td>多图视觉问答</td>
<td>SOTA(开源)</td>
</tr>
<tr>
<td>BLINK</td>
<td>多图细粒度理解</td>
<td>SOTA(开源)</td>
</tr>
<tr>
<td>Mathverse mv</td>
<td>多图数学推理</td>
<td>SOTA(开源)</td>
</tr>
<tr>
<td>Sciverse mv</td>
<td>科学多图理解</td>
<td>SOTA(开源)</td>
</tr>
</tbody></table>
<p>此外,模型展现出 promising 的<strong>上下文学习</strong>(in-context learning)能力: 通过在 prompt 中提供示例图像-文本对,模型可以在不经过额外训练的情况下适应新任务或新格式。</p>
<blockquote>
<p>多图理解是 VLM 从&quot;玩具&quot;走向&quot;工具&quot;的关键分水岭。单图 VLM 只能回答&quot;这张图里有什么&quot;,多图 VLM 可以回答&quot;对比这两张设计稿的差异&quot;、&quot;根据这几张参考图生成风格一致的插画&quot;。上下文学习能力则进一步降低了使用门槛——用户不需要写复杂的 system prompt,只需要给几个例子,模型就能&quot;看懂&quot;想要什么。这在端侧场景中尤其有价值,因为移动端用户不太可能像开发者一样精心设计 prompt。</p>
</blockquote>
<h3 id="2-3-splj">2.3 视频理解</h3>
<p>MiniCPM-V 2.6 最显著的升级是<strong>原生视频理解能力</strong>。模型可以直接接收视频输入,进行时序-空间信息的联合对话和密集字幕生成(dense captioning)。</p>
<p>在 Video-MME(视频多模态评估基准,含字幕/不含字幕两种设置)上,MiniCPM-V 2.6 超越了:</p>
<ul>
<li>GPT-4V</li>
<li>Claude 3.5 Sonnet</li>
<li>LLaVA-NeXT-Video-34B(一个 34B 参数的专门视频理解模型)</li>
</ul>
<blockquote>
<p>译者注: 视频理解的技术挑战与单图理解有本质区别。单图 VLM 只需要处理空间信息,而视频 VLM 需要同时建模时间维度(动作、事件因果、时序关系)和空间维度(场景、物体、人物)。MiniCPM-V 2.6 在 Video-MME 上超越 LLaVA-NeXT-Video-34B(一个比它大 4 倍的专门视频模型),说明其视频编码策略非常高效。但这里有一个重要的限定条件需要注意: Video-MME 的测试视频长度相对较短(数秒到数十秒),对于更长视频(分钟级)的理解能力,官方未给出明确数据。</p>
</blockquote>
<h3 id="2-4-kxhwydyy">2.4 可信行为与多语言</h3>
<p>基于最新的 RLAIF-V 和 VisCPM 技术,MiniCPM-V 2.6 具有以下可信行为特征:</p>
<ul>
<li><strong>低幻觉率</strong>: 在 Object HalBench(对象幻觉基准测试)上,幻觉率显著低于 GPT-4o 和 GPT-4V</li>
<li><strong>多语言能力</strong>: 支持英语、中文、德语、法语、意大利语、韩语等多种语言的视觉-语言理解</li>
</ul>
<blockquote>
<p>RLAIF-V 是面壁智能在 CVPR 2025 Highlights 上被接收的工作,核心思想是用 AI 生成的反馈(而非昂贵的人工标注)来进行多模态偏好对齐。具体的对齐流水线是: 生成多个候选回答 → 用 AI verifier 评估每个回答中的原子声明 → 根据验证结果构建偏好对 → 用 DPO 优化。这种&quot;可扩展 AI 反馈&quot;的思路,使得多模态对齐不再受限于人工标注的规模和成本。关于 RLAIF-V 的详细技术原理,请参阅 MiniCPM-Llama3-V 2.5 的 D5 专题分析。</p>
</blockquote>
<hr>
<h2 id="3-jgsj">3 架构设计</h2>
<h3 id="3-1-ztjg">3.1 整体架构</h3>
<p>MiniCPM-V 2.6 采用经典的三模块架构:</p>
<ol>
<li><strong>视觉编码器</strong>: SigLip-400M(Sigmoid Loss for Language Image Pre-training,一种基于 sigmoid 对比损失的视觉-语言预训练模型)</li>
<li><strong>连接器/重采样器</strong>: Perceiver Resampler(感知器重采样器,将变长视觉特征压缩为固定数量的视觉 token)</li>
<li><strong>语言模型</strong>: Qwen2-7B</li>
</ol>
<p>总参数量约 8B,其中视觉编码器 400M,语言模型 7B,连接器参数量相对较小。</p>
<h3 id="3-2-sj-token-yscl">3.2 视觉 token 压缩策略</h3>
<p>MiniCPM-V 2.6 的核心效率优势来自于<strong>极高的视觉 token 密度</strong>(visual token density,即每个视觉 token 编码的像素数)。</p>
<p>对于一张 <strong>180 万像素</strong>(如 1344x1344)的图像,模型仅产生 <strong>640 个视觉 token</strong>。作为对比:</p>
<table>
<thead>
<tr>
<th>模型/方案</th>
<th>180 万像素图像的视觉 token 数</th>
<th>相对 MiniCPM-V 2.6</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.6</td>
<td>640</td>
<td>1.0×(baseline)</td>
</tr>
<tr>
<td>业界主流方案</td>
<td>~2560</td>
<td>4.0×</td>
</tr>
</tbody></table>
<p>这意味着 MiniCPM-V 2.6 的视觉编码 token 数比大多数模型减少了 <strong>75%</strong>。</p>
<blockquote>
<p>这里需要理解视觉 token 数量对推理成本的直接影响。在 VLM 中,视觉 token 和文本 token 共享同一个语言模型的上下文窗口和计算流程。180 万像素的图像如果编码为 2560 个视觉 token,那么一个 4K 上下文窗口中就只能放下不到 1500 个文本 token(还要预留系统 prompt 的空间)。640 个视觉 token 则释放了将近 2000 个文本 token 的空间,这对于多轮对话和长文本回答至关重要。从计算量角度看,视觉 token 数量直接决定了注意力层的计算复杂度(O(n^2)),640 vs 2560 意味着注意力计算量减少了约 94%(因为 (2560/640)^2 = 16)。这是 MiniCPM-V 2.6 能在端侧实现实时视频理解的架构基础。</p>
</blockquote>
<h3 id="3-3-c-llama3-8b-d-qwen2-7b-djzqh">3.3 从 Llama3-8B 到 Qwen2-7B 的基座切换</h3>
<p>MiniCPM-V 2.6 将语言基座从 Llama3-8B 更换为 Qwen2-7B,主要考虑因素包括:</p>
<ul>
<li><strong>中文能力</strong>: Qwen2-7B 在中英文混合场景下的指令跟随和生成质量优于 Llama3-8B</li>
<li><strong>Token 效率</strong>: Qwen2 的 tokenizer 对中文压缩率更高,相同汉字序列的 token 数更少</li>
<li><strong>上下文窗口</strong>: Qwen2-7B 原生支持 128K 上下文,为长视频帧序列提供了充足空间</li>
<li><strong>生态兼容</strong>: Qwen2 系列在中文开源社区有广泛的微调框架和部署工具支持</li>
</ul>
<blockquote>
<p>基座切换是一项重大的工程决策。虽然 VLM 的视觉能力主要由视觉编码器和连接器决定,但语言基座的质量直接影响了模型对视觉信息的&quot;描述能力&quot;和&quot;推理深度&quot;。从 Llama3 切换到 Qwen2,意味着面壁智能将目标市场从&quot;全球英文用户&quot;进一步聚焦到&quot;中文端侧用户&quot;。这个选择在 2024 年的中国市场是合理的——国内手机厂商、AI 眼镜、教育硬件等端侧场景的核心用户都是中文使用者。</p>
</blockquote>
<hr>
<h2 id="4-xlydq">4 训练与对齐</h2>
<h3 id="4-1-xlsj">4.1 训练数据</h3>
<p>MiniCPM-V 2.6 的训练延续了 MiniCPM-Llama3-V 2.5 的数据策略,并针对视频理解进行了扩展:</p>
<ul>
<li><strong>图文预训练数据</strong>: 大规模图文对,用于视觉-语言对齐</li>
<li><strong>多图对话数据</strong>: 多图联合理解和推理数据</li>
<li><strong>视频-文本数据</strong>: 新增的视频帧序列与描述/问答对</li>
<li><strong>OCR 专项数据</strong>: 文档、场景文字、表格等结构化文本图像</li>
<li><strong>多语言数据</strong>: 覆盖中英德法意韩等语言的视觉-语言数据</li>
</ul>
<h3 id="4-2-dqjs">4.2 对齐技术</h3>
<p>模型采用两阶段对齐策略:</p>
<ol>
<li><strong>SFT(Supervised Fine-Tuning,监督微调)</strong>: 在高质量指令数据上进行微调,学习遵循用户指令</li>
<li><strong>RLAIF-V(Reinforcement Learning from AI Feedback for Vision,基于 AI 反馈的视觉强化学习)</strong>: 用 AI 生成的偏好反馈进行对齐,降低幻觉率并提升回答的可信度</li>
</ol>
<blockquote>
<p>译者注: RLAIF-V 的核心创新在于&quot;可扩展的 AI 反馈&quot;。传统的 RLHF 需要大量人工标注的偏好对,成本高昂且难以扩展。RLAIF-V 的做法是: 让模型生成多个候选回答,然后用一个 AI verifier(通常是一个更强的语言模型)来检查每个回答中的原子声明是否成立。这个 verifier 会逐句分析,标记出哪些陈述与图像内容一致、哪些是幻觉。基于 verifier 的评分,可以自动构建高质量的偏好对,然后用 DPO(Direct Preference Optimization,直接偏好优化)进行训练。整个过程不需要人工标注,成本降低了数个数量级。这是 MiniCPM 系列能在端侧规模上实现低幻觉率的关键技术。</p>
</blockquote>
<hr>
<h2 id="5-dcbstx">5 端侧部署特性</h2>
<h3 id="5-1-tlxs">5.1 推理效率</h3>
<p>MiniCPM-V 2.6 的端侧部署效率体现在多个维度:</p>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值/特征</th>
</tr>
</thead>
<tbody><tr>
<td>180 万像素图像视觉 token</td>
<td>640</td>
</tr>
<tr>
<td>相比主流方案 token 削减</td>
<td>75%</td>
</tr>
<tr>
<td>注意力计算量削减</td>
<td>~94%</td>
</tr>
<tr>
<td>首 token 延迟</td>
<td>显著降低</td>
</tr>
<tr>
<td>内存占用</td>
<td>友好(8B 规模)</td>
</tr>
<tr>
<td>功耗</td>
<td>适合移动设备</td>
</tr>
</tbody></table>
<h3 id="5-2-bskjzc">5.2 部署框架支持</h3>
<p>MiniCPM-V 2.6 支持以下主流推理和微调框架:</p>
<ul>
<li><strong>llama.cpp</strong>: 官方原生支持,提供 GGUF 量化版本</li>
<li><strong>vLLM</strong>: 服务端高效批量推理</li>
<li><strong>Ollama</strong>: 本地一键部署</li>
<li><strong>SWIFT</strong>: 模型微调和推理</li>
<li><strong>LLaMA-Factory</strong>: 全栈微调生态</li>
</ul>
<p>此外,模型提供多种量化格式:</p>
<ul>
<li>GGUF(用于 llama.cpp CPU/GPU 推理)</li>
<li>BNB(bitsandbytes INT4)</li>
<li>AWQ(Activation-aware Weight Quantization)</li>
<li>GPTQ(General-purpose Post-Training Quantization)</li>
</ul>
<h3 id="5-3-sssplj">5.3 实时视频理解</h3>
<p>MiniCPM-V 2.6 是首个在 iPad 等端侧设备上实现<strong>实时视频理解</strong>的开源 MLLM。这一能力的实现依赖于:</p>
<ol>
<li><strong>高效的视觉编码</strong>: 640 token/帧 的压缩率,使每帧的处理延迟极低</li>
<li><strong>帧采样策略</strong>: 不需要处理视频的每一帧,通过智能采样关键帧即可捕捉时序信息</li>
<li><strong>流式推理架构</strong>: 支持连续帧的增量处理,而非每次重新编码整个视频</li>
</ol>
<blockquote>
<p>实时视频理解是端侧 AI 的&quot;杀手级应用&quot;之一。想象一下:iPad 上的相机实时捕捉画面,模型实时回答&quot;这是什么&quot;、&quot;这个怎么操作&quot;、&quot;识别画面中的文字并翻译&quot;。这些场景在教育(识别课本内容)、旅游(实时翻译路牌)、工业(设备巡检)等领域都有直接价值。但&quot;实时&quot;的定义需要明确: 这里的实时指的是&quot;每帧处理延迟足够低,使得用户体验流畅&quot;,而不是&quot;逐帧 30FPS 全精度处理&quot;。实际的工程实现中,通常会结合帧间差异检测和自适应采样,只在画面变化显著时触发完整推理。</p>
</blockquote>
<hr>
<h2 id="6-xnpcxb">6 性能评测详表</h2>
<h3 id="6-1-open-compass-zhpc">6.1 OpenCompass 综合评测</h3>
<p>MiniCPM-V 2.6 在 OpenCompass v2.0(8 个基准测试)上的平均分:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>参数量</th>
<th>OpenCompass 平均分</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.6</td>
<td>8B</td>
<td><strong>65.2</strong></td>
</tr>
<tr>
<td>GPT-4o mini</td>
<td>未公开</td>
<td>&lt; 65.2</td>
</tr>
<tr>
<td>GPT-4V</td>
<td>未公开</td>
<td>&lt; 65.2</td>
</tr>
<tr>
<td>Gemini 1.5 Pro</td>
<td>未公开</td>
<td>&lt; 65.2</td>
</tr>
<tr>
<td>Claude 3.5 Sonnet</td>
<td>未公开</td>
<td>&lt; 65.2</td>
</tr>
</tbody></table>
<h3 id="6-2-zxjzcs">6.2 专项基准测试</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>能力维度</th>
<th>MiniCPM-V 2.6</th>
<th>对比</th>
</tr>
</thead>
<tbody><tr>
<td>OCRBench</td>
<td>光学字符识别</td>
<td>SOTA(开源)</td>
<td>超越 GPT-4o/GPT-4V/Gemini 1.5 Pro</td>
</tr>
<tr>
<td>Video-MME(有字幕)</td>
<td>视频理解</td>
<td>SOTA</td>
<td>超越 GPT-4V/Claude 3.5 Sonnet/LLaVA-NeXT-Video-34B</td>
</tr>
<tr>
<td>Video-MME(无字幕)</td>
<td>视频理解</td>
<td>SOTA</td>
<td>同上</td>
</tr>
<tr>
<td>Mantis-Eval</td>
<td>多图问答</td>
<td>SOTA(开源)</td>
<td>—</td>
</tr>
<tr>
<td>BLINK</td>
<td>多图细粒度理解</td>
<td>SOTA(开源)</td>
<td>—</td>
</tr>
<tr>
<td>Object HalBench</td>
<td>幻觉检测</td>
<td>低幻觉</td>
<td>幻觉率低于 GPT-4o/GPT-4V</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-y-mini-cpm-xldgx">7 与 MiniCPM 系列的关系</h2>
<p>MiniCPM-V 2.6 在系列中的定位:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>发布时间</th>
<th>语言基座</th>
<th>核心特性</th>
<th>与 2.6 的关系</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.0</td>
<td>2024.04</td>
<td>MiniCPM-2.4B</td>
<td>高分辨率 OCR, OCRBench 开源最优</td>
<td>前代基座模型</td>
</tr>
<tr>
<td>MiniCPM-Llama3-V 2.5</td>
<td>2024.05</td>
<td>Llama3-8B</td>
<td>OCR SOTA, 30+ 语言, RLAIF-V 对齐</td>
<td>直接前代,2.6 继承并升级</td>
</tr>
<tr>
<td><strong>MiniCPM-V 2.6</strong></td>
<td><strong>2024.08</strong></td>
<td><strong>Qwen2-7B</strong></td>
<td><strong>视频理解, 多图推理, 实时端侧</strong></td>
<td><strong>本模型</strong></td>
</tr>
<tr>
<td>MiniCPM-V 4.0</td>
<td>2025.08</td>
<td>未公开</td>
<td>效率大幅提升,iOS App</td>
<td>后续迭代</td>
</tr>
<tr>
<td>MiniCPM-V 4.5</td>
<td>2025.09</td>
<td>未公开</td>
<td>超越 GPT-4o-latest</td>
<td>后续迭代</td>
</tr>
</tbody></table>
<p>从演进路线看,MiniCPM-V 系列经历了以下发展阶段:</p>
<ol>
<li><strong>V 2.0</strong>: 验证端侧高分辨率 OCR 的可行性</li>
<li><strong>Llama3-V 2.5</strong>: 引入 RLAIF-V 对齐和多语言支持,达到 GPT-4V 级别</li>
<li><strong>V 2.6</strong>: 基座切换到 Qwen2,新增视频理解,实现实时端侧部署</li>
<li><strong>V 4.x</strong>: 架构重构(如 LLaVA-UHD v4),进一步压榨效率</li>
</ol>
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
<td>MLLM</td>
<td>多模态大语言模型</td>
<td>第 1 节</td>
<td>能同时处理文本和视觉输入的大语言模型</td>
</tr>
<tr>
<td>SigLip</td>
<td>—</td>
<td>第 3.1 节</td>
<td>基于 sigmoid 对比损失的视觉-语言预训练模型</td>
</tr>
<tr>
<td>Perceiver Resampler</td>
<td>感知器重采样器</td>
<td>第 3.1 节</td>
<td>将变长视觉特征压缩为固定数量 token 的模块</td>
</tr>
<tr>
<td>Visual Token Density</td>
<td>视觉 token 密度</td>
<td>第 3.2 节</td>
<td>每个视觉 token 编码的像素数,密度越高越高效</td>
</tr>
<tr>
<td>Dense Captioning</td>
<td>密集字幕生成</td>
<td>第 2.3 节</td>
<td>对视频/图像内容进行详细、逐帧的描述</td>
</tr>
<tr>
<td>RLAIF-V</td>
<td>—</td>
<td>第 2.4 节</td>
<td>基于 AI 反馈的视觉强化学习对齐方法</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>第 4.2 节</td>
<td>直接用偏好对训练模型,无需显式训练奖励模型</td>
</tr>
<tr>
<td>GGUF</td>
<td>—</td>
<td>第 5.2 节</td>
<td>llama.cpp 使用的量化模型格式</td>
</tr>
</tbody></table>
<h3 id="b-mxpxdw">B. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: MiniCPM-Llama3-V 2.5(视觉架构、RLAIF-V 对齐、多语言策略)</li>
<li><strong>核心创新</strong>: (1) 基座从 Llama3-8B 切换到 Qwen2-7B; (2) 原生视频理解能力; (3) 640 token/180 万像素的高效视觉编码</li>
<li><strong>被后续工作引用/影响</strong>: MiniCPM-V 4.0/4.5 继承了 2.6 的视觉编码策略并进一步升级至 LLaVA-UHD v4; MiniCPM-o 2.6 在 2.6 基础上扩展了音频和实时流式交互</li>
<li><strong>技术定位</strong>: 端侧 MLLM 从&quot;单图理解&quot;向&quot;视频+多图+实时&quot;演进的关键节点</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxgs","text":"1 模型概述"},{"level":2,"id":"2-hxnl","text":"2 核心能力"},{"level":3,"id":"2-1-dtlj","text":"2.1 单图理解"},{"level":3,"id":"2-2-dtljysxwxx","text":"2.2 多图理解与上下文学习"},{"level":3,"id":"2-3-splj","text":"2.3 视频理解"},{"level":3,"id":"2-4-kxhwydyy","text":"2.4 可信行为与多语言"},{"level":2,"id":"3-jgsj","text":"3 架构设计"},{"level":3,"id":"3-1-ztjg","text":"3.1 整体架构"},{"level":3,"id":"3-2-sj-token-yscl","text":"3.2 视觉 token 压缩策略"},{"level":3,"id":"3-3-c-llama3-8b-d-qwen2-7b-djzqh","text":"3.3 从 Llama3-8B 到 Qwen2-7B 的基座切换"},{"level":2,"id":"4-xlydq","text":"4 训练与对齐"},{"level":3,"id":"4-1-xlsj","text":"4.1 训练数据"},{"level":3,"id":"4-2-dqjs","text":"4.2 对齐技术"},{"level":2,"id":"5-dcbstx","text":"5 端侧部署特性"},{"level":3,"id":"5-1-tlxs","text":"5.1 推理效率"},{"level":3,"id":"5-2-bskjzc","text":"5.2 部署框架支持"},{"level":3,"id":"5-3-sssplj","text":"5.3 实时视频理解"},{"level":2,"id":"6-xnpcxb","text":"6 性能评测详表"},{"level":3,"id":"6-1-open-compass-zhpc","text":"6.1 OpenCompass 综合评测"},{"level":3,"id":"6-2-zxjzcs","text":"6.2 专项基准测试"},{"level":2,"id":"7-y-mini-cpm-xldgx","text":"7 与 MiniCPM 系列的关系"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-mxpxdw","text":"B. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/08-mini-cpm-v-2.6/01-mini-cpm-v-2.6-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/08-mini-cpm-v-2.6/01-mini-cpm-v-2.6-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V-2.6 技术报告精译</h1>
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
