"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2-Audio 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Qwen2-Audio Technical Report
原文链接: <a href="https://arxiv.org/abs/2407.10759">https://arxiv.org/abs/2407.10759</a>
发布日期: 2024 年 7 月
发布机构: Qwen Team, Alibaba Group</p>
</blockquote>
<hr>
<h2 id="abstract">Abstract</h2>
<p>我们介绍了 Qwen-Audio 的最新进展——Qwen2-Audio，一个大规模音频-语言模型(Large-scale Audio-Language Model)。该模型能够接受多种音频信号输入，并执行音频分析或直接针对语音指令生成文本回复。与复杂的层次化标签(hierarchical tags)相比，我们通过使用自然语言提示(natural language prompts)来处理不同的数据和任务，从而简化了预训练过程，并进一步扩大了数据规模。</p>
<p>我们提升了 Qwen2-Audio 的指令遵循能力，并实现了两种截然不同的音频交互模式：语音聊天(voice chat)和音频分析(audio analysis)。在语音聊天模式下，用户无需文本输入即可与 Qwen2-Audio 自由地进行语音交互。在音频分析模式下，用户可以在交互过程中提供音频和文本指令以进行分析。值得注意的是，我们并未使用任何系统提示(system prompts)来切换语音聊天和音频分析模式。Qwen2-Audio 能够智能地理解音频中的内容并遵循语音指令做出适当的回应。例如，在一个同时包含声音、多说话人对话和语音指令的音频片段中，Qwen2-Audio 能够直接理解指令并对音频做出解释和回应。</p>
<p>此外，DPO(Direct Preference Optimization，直接偏好优化)在事实性(factuality)和期望行为遵循度(adherence to desired behavior)方面进一步优化了模型的表现。根据 AIR-Bench 的评测结果，Qwen2-Audio 在以音频为中心的指令遵循能力测试中超越了此前的 SOTA 模型，例如 Gemini-1.5-pro。Qwen2-Audio 已开源，旨在推动多模态语言社区的发展。</p>
<blockquote>
<p>译者注：这里需要停下来想一下 Qwen2-Audio 与 Qwen-Audio 的关键差异。前代 Qwen-Audio 使用层次化标签来区分不同任务(如 <code>&lt;|ASR|&gt;</code>、<code>&lt;|S2TT|&gt;</code> 等专用 token)，这本质上是一种&quot;硬编码&quot;的任务路由机制。Qwen2-Audio 将其替换为自然语言提示，这意味着预训练阶段的所有任务都通过统一的自然语言指令来描述。这个改动的工程意义在于：它消除了预训练与后训练之间的格式鸿沟——SFT 阶段的人类指令本来就用自然语言写的，如果预训练也使用自然语言提示，模型就不需要再学习从专用 token 到自然语言的映射转换。这是一种&quot;预训练-后训练一致性&quot;的设计哲学，与 Qwen2-VL 中统一图像/视频表示的思路一脉相承。</p>
</blockquote>
<hr>
<h2 id="1-introduction">1 Introduction</h2>
<p>音频是人类及其他生物之间交互与通信的重要媒介，承载着丰富的信息内容。全面理解各种形式的音频信号对于实现通用人工智能(AGI)至关重要。近年来，大规模音频-语言模型(LALMs, Large Audio-Language Models)的发展取得了显著进展，在理解多样化语音信号、执行语音信号分析和复杂推理方面展现出了卓越的成就。</p>
<p>在本报告中，我们开发了 Qwen2-Audio，其核心目标是增强模型的指令遵循能力。Qwen2-Audio 是一个大规模音频-语言模型(LALM)，旨在处理音频和文本输入并生成文本输出。与之前的模型相比，Qwen2-Audio 显著扩大了训练数据集的规模。为了缩小预训练阶段与后训练阶段之间的差距，我们简化了预训练过程，直接对各种数据和任务使用自然语言提示，如图 1 所示。遵循大语言模型(LLMs)中的实践，我们进一步进行了指令微调(instruction tuning)和直接偏好优化(DPO)，以使模型输出与人类偏好对齐。</p>
<p>Qwen2-Audio 在两种截然不同的模式下运行：音频分析(Audio Analysis)和语音聊天(Voice Chat)。这两种模式在功能上有所区别，但用户在使用时无需刻意区分它们。</p>
<p>在音频分析模式下，用户可以利用 Qwen2-Audio 分析多种类型的音频，包括语音、声音、音乐或各种混合音频形式。指令可以通过音频或文本发出，Qwen2-Audio 将自主识别音频中的指令片段。相反，在语音聊天模式下，用户可以将 Qwen2-Audio 视为对话代理，进行无限制的对话。音频交互可用，用户可以随时切换为文本交互。</p>
<p>例如，如果用户输入一个音频片段，其中前半部分是敲击键盘的声音，随后用户用语音提问 &quot;What is this sound?&quot;，Qwen2-Audio 应直接回应 &quot;This is the sound of a keyboard.&quot;。</p>
<p>如图 1 所示，广泛的评测表明，Qwen2-Audio 在无需任何任务特定微调的情况下，在多种任务上超越了此前的 LALMs。其中，Qwen2-Audio 在 Aishell2、FLUERS-zh、VocalSound 和 AIR-Bench 聊天基准测试集上取得了 SOTA 性能。</p>
<blockquote>
<p>译者注：两种模式&quot;无缝切换&quot;是一个关键的工程洞察。作者明确强调&quot;不使用任何系统提示来切换模式&quot;，这意味着模型必须通过理解输入内容的语义来自主判断当前应该进入哪种交互模式。这要求预训练数据必须覆盖大量&quot;混合场景&quot;——即音频中同时包含待分析内容和指令的样本。这种设计的用户体验优势显而易见：用户不需要记住特定的系统提示词或手动切换模式。但从工程实现角度看，这也增加了训练难度，因为模型必须学会从音频信号本身提取&quot;意图&quot;，而不是依赖外部标记。</p>
</blockquote>
<hr>
<h2 id="2-methodology">2 Methodology</h2>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/framework.pdf" alt="Qwen2-Audio 三阶段训练流程概览"></p>
<blockquote>
<p>图 1: Qwen2-Audio 三阶段训练流程概览。阶段一：使用自然语言提示的预训练; 阶段二：基于两种交互模式(Audio Analysis / Voice Chat)的监督微调; 阶段三：直接偏好优化(DPO)。音频Encoder 基于 Whisper-large-v3 初始化，LLM 基于 Qwen-7B。</p>
</blockquote>
<h3 id="2-1-model-architecture">2.1 Model Architecture</h3>
<p>Qwen2-Audio 的训练过程如图 1 所示，包含一个音频Encoder (audio encoder)和一个大语言模型(large language model)。给定配对数据 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi mathvariant="bold-italic">a</mi><mo separator="true">,</mo><mi mathvariant="bold-italic">x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(\\bm{a}, \\bm{x})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord boldsymbol">a</span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="mclose">)</span></span></span></span>，其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold-italic">a</mi></mrow><annotation encoding="application/x-tex">\\bm{a}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">a</span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold-italic">x</mi></mrow><annotation encoding="application/x-tex">\\bm{x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span></span></span></span> 分别表示音频序列和文本序列，训练目标是在给定音频表示和前序文本序列的条件下最大化下一个文本 token 的概率：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">P</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>x</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi mathvariant="bold-italic">x</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><msub><mtext>Encoder</mtext><mi>ϕ</mi></msub><mo stretchy="false">(</mo><mi mathvariant="bold-italic">a</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mo separator="true">,</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{P}_{\\theta}(x_t | \\bm{x}_{&lt;t}, \\text{Encoder}_{\\phi}(\\bm{a})),
\\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Encoder</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ϕ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord boldsymbol">a</span></span></span><span class="mclose">))</span><span class="mpunct">,</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>θ</mi></mrow><annotation encoding="application/x-tex">\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ϕ</mi></mrow><annotation encoding="application/x-tex">\\phi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">ϕ</span></span></span></span> 分别表示 LLM 和音频Encoder 的可训练参数，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold-italic">x</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\bm{x}_{&lt;t}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6218em;vertical-align:-0.1774em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span></span></span></span> 表示前序文本序列。</p>
<p>与 Qwen-Audio 不同，Qwen2-Audio 的音频Encoder 初始化基于 Whisper-large-v3 模型。为了预处理音频数据，我们将其重采样(resample)至 16kHz 频率，并使用 25ms 窗口大小和 10ms 跳跃步长(hop size)将原始波形转换为 128 通道 mel-频谱图(mel-spectrogram)。此外，我们引入了一个步长为 2 的池化层(pooling layer)来缩短音频表示的长度。因此，Encoder 输出的每一帧大约对应原始音频信号的 40ms 片段。Qwen2-Audio 仍然采用大语言模型 Qwen-7B 作为其基础组件。Qwen2-Audio 的总参数量为 8.2B。</p>
<blockquote>
<p>译者注：这里有两个值得关注的工程细节。第一，音频Encoder 从 Qwen-Audio 的自定义设计切换到了 Whisper-large-v3。Whisper 是 OpenAI 开源的多语言语音识别模型，其Encoder 已经在 68 万小时的多语言/多任务音频数据上预训练过，拥有强大的通用音频表示能力。选择 Whisper 而非从头训练，本质上是&quot;站在巨人肩膀上&quot;的策略——利用已经成熟的音频表示，将工程资源集中在 LLM 与音频的融合上。第二，池化层将序列长度减半，这是控制计算成本的关键设计：原始音频 16kHz，每 10ms 一帧，1 秒音频就有 100 帧; 经过池化后降至 50 帧/秒，30 秒音频约 1500 帧，恰好与 Qwen-7B 的上下文窗口兼容。</p>
</blockquote>
<h3 id="2-2-pre-training">2.2 Pre-training</h3>
<p>在预训练阶段，我们用自然语言提示替代了层次化标签。如图 1 所示，我们发现使用语言提示能够带来更好的泛化能力和更强的指令遵循能力。</p>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/pretrain_hours.png" alt="预训练数据集统计(小时)"></p>
<blockquote>
<p>图 2: 预训练数据集统计(小时)。覆盖语音(ASR、S2TT、OSR、方言识别、说话人验证等)、声音(音频描述、声音事件分类、声学场景分类等)和音乐(歌手识别、音乐描述、乐器分类、音乐流派识别等)三大类任务。</p>
</blockquote>
<p>预训练数据集涵盖了极为丰富的任务类型。在语音(Speech)类别中，包括自动语音识别(ASR)、语音到文本翻译(S2TT)、重叠语音识别(OSR)、方言语音识别、带词级时间戳的语音识别(SRWT)、方言识别(DID)、口语语言识别(LID)、说话人性别识别(SGC)、情感识别(ER)、说话人验证(SV)、说话人分割(SD)、语音实体识别(SER)、关键词检测(KS)、意图分类(IC)、槽位填充(SF)、说话人年龄预测(SAP)以及人声分类(VSC)等。在声音(Sound)类别中，包括自动音频描述(AAC)、声音事件分类(SEC)、声学场景分类(ASC)、带时间戳的声音事件检测(SED)和音频问答(AQA)。在音乐与歌曲(Music &amp; Song)类别中，包括歌手识别(SID)、歌手与音乐情感识别(SMER)、音乐描述(MC)、乐器分类(MIC)、音乐音符分析(MNA)、音乐流派识别(MGR)、音乐识别(MR)和音乐问答(MQA)。</p>
<blockquote>
<p>译者注：预训练数据的广度令人印象深刻——覆盖 30 余种音频任务。这与 Qwen-Audio 的核心设计思想一致：通过大规模多任务学习让模型获得&quot;通用音频理解能力&quot;而非单一任务能力。但这里作者提到了一个关键改进：用自然语言提示替代层次化标签。Qwen-Audio 的做法是为每个任务设计专用 token(如 <code>&lt;|ASR|&gt;</code>、<code>&lt;|S2TT|&gt;</code>)，模型需要先识别任务类型再生成对应格式输出。Qwen2-Audio 将所有任务的输入输出都统一为自然语言形式，例如 &quot;Transcribe the following audio to text: [audio]&quot; 或 &quot;What emotion does the speaker express? [audio]&quot;。这种统一的本质是将&quot;任务识别&quot;从显式 token 转换为隐式语义理解，让模型更像是在做&quot;通用语言理解&quot;而非&quot;多任务切换&quot;。</p>
</blockquote>
<h3 id="2-3-supervised-fine-tuning">2.3 Supervised Fine-tuning</h3>
<p>Qwen2-Audio 经过充分的预训练，已具备对音频内容的全面理解能力。在此基础上，我们采用基于指令的微调技术来提升模型与人类意图对齐的能力，从而得到一个可交互的聊天模型。</p>
<p>我们的初步研究强调了 SFT 数据的质量和复杂性对模型性能的关键影响。因此，我们精心收集了一套高质量的 SFT 数据，并实施了严格的质量控制流程。</p>
<p>我们考虑两种截然不同的人类交互模式：</p>
<ul>
<li><p><strong>音频分析(Audio Analysis)</strong>：在音频分析模式下，用户可以灵活地让 Qwen2-Audio 分析多种音频。用户指令可以通过音频或文本给出。此模式通常用于离线分析音频文件。</p>
</li>
<li><p><strong>语音聊天(Voice Chat)</strong>：在语音聊天模式下，我们鼓励用户与 Qwen2-Audio 进行语音对话，提出各种问题。请随意将其视为您的语音聊天助手。此模式通常用于与 LALM 的在线交互。</p>
</li>
</ul>
<p>为了一致性和模型统一性，两种交互模式进行了联合训练(jointly trained)，因此用户在使用过程中不会感受到模式差异，也无需使用单独的系统提示在不同模式之间切换。两种模式在实际使用中被无缝集成。</p>
<blockquote>
<p>译者注：联合训练(joint training)两种模式是一个重要的工程决策。这意味着同一份 SFT 数据中同时包含音频分析样本和语音聊天样本，模型在同一次训练迭代中同时学习两种行为。与之相对的替代方案是&quot;分阶段训练&quot;：先训练音频分析，再训练语音聊天。联合训练的优势在于模型能够自然地处理&quot;混合场景&quot;——比如用户先发送一段环境声音，然后语音提问&quot;这是什么声音?&quot;——这类场景在分阶段训练中可能会出现模式切换的&quot;断层&quot;。但联合训练也对数据配比提出了更高要求：如果音频分析数据占比过高，模型可能过于&quot;分析导向&quot;而缺乏对话的流畅性; 反之则可能丢失专业分析能力。作者提到&quot;精心收集&quot;和&quot;严格质量控制&quot;，暗示了数据配比和筛选的重要性。</p>
</blockquote>
<h3 id="2-4-direct-preference-optimization">2.4 Direct Preference Optimization</h3>
<p>我们采用 DPO 来进一步优化模型以遵循人类偏好。通过获取包含三元组数据 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi mathvariant="bold-italic">x</mi><mo separator="true">,</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">w</mi></msub></mi><mo separator="true">,</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">l</mi></msub></mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(\\bm{x}, \\bm{y_w}, \\bm{y_l})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1611em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0278em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0088em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的数据集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">D</mi></mrow><annotation encoding="application/x-tex">\\mathcal{D}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0278em;">D</span></span></span></span>，其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold-italic">x</mi></mrow><annotation encoding="application/x-tex">\\bm{x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span></span></span></span> 是包含输入音频的输入序列，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">w</mi></msub></mi></mrow><annotation encoding="application/x-tex">\\bm{y_w}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1611em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0278em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">l</mi></msub></mi></mrow><annotation encoding="application/x-tex">\\bm{y_l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0088em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></span> 分别是人工标注的优质回复和劣质回复，我们按照以下方式优化模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">P</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{P}_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>DPO</mtext></msub><mo stretchy="false">(</mo><msub><mi mathvariant="script">P</mi><mi>θ</mi></msub><mo separator="true">;</mo><msub><mi mathvariant="script">P</mi><mtext>ref</mtext></msub><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mo stretchy="false">(</mo><mi mathvariant="bold-italic">x</mi><mo separator="true">,</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">w</mi></msub></mi><mo separator="true">,</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">l</mi></msub></mi><mo stretchy="false">)</mo><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mi>σ</mi><mrow><mo fence="true">(</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi mathvariant="script">P</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">w</mi></msub></mi><mo>∣</mo><mi mathvariant="bold-italic">x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi mathvariant="script">P</mi><mtext>ref</mtext></msub><mo stretchy="false">(</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">w</mi></msub></mi><mo>∣</mo><mi mathvariant="bold-italic">x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>−</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi mathvariant="script">P</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">l</mi></msub></mi><mo>∣</mo><mi mathvariant="bold-italic">x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi mathvariant="script">P</mi><mtext>ref</mtext></msub><mo stretchy="false">(</mo><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">l</mi></msub></mi><mo>∣</mo><mi mathvariant="bold-italic">x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow><mo separator="true">,</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{DPO}}(\\mathcal{P}_\\theta; \\mathcal{P}_{\\text{ref}}) = -\\mathbb{E}_{(\\bm{x}, \\bm{y_w}, \\bm{y_l}) \\sim \\mathcal{D}} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\mathcal{P}_\\theta(\\bm{y_w} \\mid \\bm{x})}{\\mathcal{P}_{\\text{ref}}(\\bm{y_w} \\mid \\bm{x})} - \\beta \\log \\frac{\\mathcal{P}_\\theta(\\bm{y_l} \\mid \\bm{x})}{\\mathcal{P}_{\\text{ref}}(\\bm{y_l} \\mid \\bm{x})} \\right) \\right],
\\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">DPO</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mtight"><span class="mord boldsymbol mtight">x</span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord boldsymbol mtight" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1745em;"><span style="top:-2.357em;margin-left:-0.037em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0278em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord boldsymbol mtight" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.037em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0088em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span><span class="mclose mtight">)</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1611em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0278em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1611em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0278em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0088em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0088em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span></span><span class="tag"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">P</mi><mtext>ref</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{P}_{\\text{ref}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示以 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">P</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\mathcal{P}_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 初始化的参考模型，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>σ</mi></mrow><annotation encoding="application/x-tex">\\sigma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span></span></span> 表示 sigmoid 函数，<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 是一个超参数。</p>
<p>图 1 展示了 Qwen2-Audio 的三阶段训练过程。</p>
<blockquote>
<p>译者注：DPO 的公式值得仔细理解。与 PPO(Proximal Policy Optimization) 不同，DPO 不需要训练单独的奖励模型(reward model)。它将偏好学习直接转化为一个分类问题：对于同一个输入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="bold-italic">x</mi></mrow><annotation encoding="application/x-tex">\\bm{x}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4444em;"></span><span class="mord"><span class="mord"><span class="mord boldsymbol">x</span></span></span></span></span></span>，模型对优质回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">w</mi></msub></mi></mrow><annotation encoding="application/x-tex">\\bm{y_w}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1611em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0278em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></span> 的相对对数概率应该高于对劣质回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi><msub><mi mathvariant="bold-italic">y</mi><mi mathvariant="bold-italic">l</mi></msub></mi></mrow><annotation encoding="application/x-tex">\\bm{y_l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord"><span class="mord"><span class="mord boldsymbol" style="margin-right:0.037em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord boldsymbol mtight" style="margin-right:0.0088em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span></span> 的相对对数概率，且差距越大越好。分母中的参考模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">P</mi><mtext>ref</mtext></msub></mrow><annotation encoding="application/x-tex">\\mathcal{P}_{\\text{ref}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0822em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ref</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 起到&quot;锚定&quot;作用，防止模型偏离 SFT 基座太远——<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span> 控制这一约束的强度。从工程落地角度看，DPO 的训练流程比 RLHF(PPO) 简单得多：不需要维护奖励模型、不需要采样生成多个回复、不需要复杂的 advantage 估计。但代价是 DPO 对偏好数据的质量要求极高，因为模型直接从成对比较中学习，如果偏好标注有噪声，模型会快速过拟合到错误的偏好上。</p>
</blockquote>
<hr>
<h2 id="3-experiments">3 Experiments</h2>
<h3 id="3-1-evaluation">3.1 Evaluation</h3>
<p>在实践中，我们发现许多此前的测试数据集局限性很大，无法充分反映真实场景中的性能，例如某些 SLU(Spoken Language Understanding，口语语言理解)和 SER(Speech Emotion Recognition，语音情感识别)数据集。因此，我们主要在 AIR-Bench 上评测性能。我们发现 AIR-Bench 的分数与用户实际交互体验更为吻合。</p>
<p>与此同时，为了评估 Qwen2-Audio 的通用理解能力，如表 1 所示，我们仍进行了涵盖多种任务的全面评测，包括自动语音识别(ASR)、语音到文本翻译(S2TT)、语音情感识别(SER)和人声分类(VSC)。评测跨越 13 个数据集。评测数据集被严格排除在训练数据之外，以避免数据泄漏。我们对比的模型包括开源模型和可调用 API，例如 Gemini。</p>
<p><strong>表 1: Qwen2-Audio 评测基准汇总</strong></p>
<table>
<thead>
<tr>
<th>任务</th>
<th>描述</th>
<th>数据集</th>
<th>划分</th>
<th>评测指标</th>
</tr>
</thead>
<tbody><tr>
<td>ASR</td>
<td>自动语音识别</td>
<td>Fleurs / Aishell2 / Librispeech / Common Voice</td>
<td>dev | test</td>
<td>WER</td>
</tr>
<tr>
<td>S2TT</td>
<td>语音到文本翻译</td>
<td>CoVoST2</td>
<td>test</td>
<td>BLEU</td>
</tr>
<tr>
<td>SER</td>
<td>语音情感识别</td>
<td>Meld</td>
<td>test</td>
<td>ACC</td>
</tr>
<tr>
<td>VSC</td>
<td>人声分类</td>
<td>VocalSound</td>
<td>test</td>
<td>ACC</td>
</tr>
<tr>
<td>AIR-Bench Chat</td>
<td>聊天基准-语音</td>
<td>Fisher / SpokenWOZ / IEMOCAP / Common Voice</td>
<td>dev | test</td>
<td>GPT-4 Eval</td>
</tr>
<tr>
<td>AIR-Bench Chat</td>
<td>聊天基准-声音</td>
<td>Clotho</td>
<td>dev | test</td>
<td>GPT-4 Eval</td>
</tr>
<tr>
<td>AIR-Bench Chat</td>
<td>聊天基准-音乐</td>
<td>MusicCaps</td>
<td>dev | test</td>
<td>GPT-4 Eval</td>
</tr>
<tr>
<td>AIR-Bench Chat</td>
<td>聊天基准-混合音频</td>
<td>Common Voice / AudioCaps / MusicCaps</td>
<td>dev | test</td>
<td>GPT-4 Eval</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：评测基准的选择本身就传递了作者的技术立场。传统的 SLU/SER 基准通常使用固定的分类标签(如&quot;愤怒&quot;、&quot;高兴&quot;等 7-8 种情感类别)，这在真实交互中过于简化——人类表达情感的方式远比几个离散标签复杂。AIR-Bench 使用 GPT-4 作为评判标准，虽然引发了&quot;用模型评判模型&quot;的循环依赖争议，但它确实能捕捉到更 nuanced 的交互质量。值得注意的是，AIR-Bench 的四个维度(语音、声音、音乐、混合音频)覆盖了音频理解的完整光谱，而不仅仅局限于语音识别。这种评测设计反映了 Qwen2-Audio 从&quot;语音工具&quot;向&quot;音频通用助手&quot;的定位升级。</p>
</blockquote>
<h3 id="3-2-main-results">3.2 Main Results</h3>
<p>在本节中，我们对 Qwen2-Audio 模型进行全面评测，评估其在无需任何任务特定微调的情况下在各任务上的性能。我们首先考察其英语自动语音识别(ASR)结果，如表 2 所示，Qwen2-Audio 展现出比之前多任务学习模型更优越的性能。具体而言，其在 Librispeech test-clean 和 test-other 数据集上分别取得了 1.6% 和 3.6% 的 WER。与 Whisper-large-v3 在 Fleurs 中文子集上的结果相比，我们的表现优于 Whisper-large-v3。需要注意的是，Qwen2-Audio 在 Common Voice 15 数据集上并非以零样本(zero-shot)方式评测，而 Whisper 的结果是在零样本条件下获得的。然而，在 Fleurs 数据集上，Qwen2-Audio 和 Whisper 均以零样本方式评测。</p>
<p>此外，我们在 CoVoST2 数据集上评测了 Qwen2-Audio 的语音翻译性能。结果显示，Qwen2-Audio 在所有七个翻译方向上都大幅超越了基线模型。对于声音任务，我们分析了 Qwen2-Audio 在 SER 和 VSC 上的性能，如表 2 所示。在这些任务上，Qwen2-Audio 始终显著超越基线模型。</p>
<p>最后，为了客观评估 Qwen2-Audio 的聊天能力，我们在 AIR-Bench 的聊天基准上测量了其性能。需要注意的是，由于 Gemini-1.5 在测试期间因安全(SAFETY)原因无法正确返回部分测试样本，Gemini-1.5 在 AIR-Bench-chat 上的样本数量减少了约 1/5。如表 2 所示，Qwen2-Audio 在语音、声音、音乐和混合音频子集上均展现出 SOTA 的指令遵循能力。与 Qwen-Audio 相比有显著提升，并大幅超越了其他 LALMs。</p>
<p><strong>表 2: ASR、S2TT、SER、VSC 和 AIR-Bench 聊天基准测试结果</strong></p>
<table>
<thead>
<tr>
<th>任务</th>
<th>数据集</th>
<th>模型</th>
<th>指标</th>
<th>结果</th>
</tr>
</thead>
<tbody><tr>
<td>ASR</td>
<td>Librispeech (dev-clean | dev-other | test-clean | test-other)</td>
<td>SpeechT5</td>
<td>WER</td>
<td>2.1 | 5.5 | 2.4 | 5.8</td>
</tr>
<tr>
<td></td>
<td></td>
<td>SLM-FT</td>
<td>WER</td>
<td>- | - | 2.6 | 5.0</td>
</tr>
<tr>
<td></td>
<td></td>
<td>SALMONN</td>
<td>WER</td>
<td>- | - | 2.1 | 4.9</td>
</tr>
<tr>
<td></td>
<td></td>
<td>SpeechVerse</td>
<td>WER</td>
<td>- | - | 2.1 | 4.4</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>WER</td>
<td>1.8 | 4.0 | 2.0 | 4.2</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>WER</td>
<td><strong>1.3 | 3.4 | 1.6 | 3.6</strong></td>
</tr>
<tr>
<td>ASR</td>
<td>Common Voice 15 (en | zh | yue | fr)</td>
<td>Whisper-large-v3</td>
<td>WER</td>
<td>9.3 | 12.8 | 10.9 | 10.8</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>WER</td>
<td><strong>8.6 | 6.9 | 5.9 | 9.6</strong></td>
</tr>
<tr>
<td>ASR</td>
<td>Fleurs (zh)</td>
<td>Whisper-large-v3</td>
<td>WER</td>
<td>7.7</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>WER</td>
<td><strong>7.5</strong></td>
</tr>
<tr>
<td>ASR</td>
<td>Aishell2 (Mic | iOS | Android)</td>
<td>MMSpeech-base</td>
<td>WER</td>
<td>4.5 | 3.9 | 4.0</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Paraformer-large</td>
<td>WER</td>
<td>- | <strong>2.9</strong> | -</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>WER</td>
<td>3.3 | 3.1 | 3.3</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>WER</td>
<td><strong>3.0 | 3.0 | 2.9</strong></td>
</tr>
<tr>
<td>S2TT</td>
<td>CoVoST2 (en-de | de-en | en-zh | zh-en)</td>
<td>SALMONN</td>
<td>BLEU</td>
<td>18.6 | - | 33.1 | -</td>
</tr>
<tr>
<td></td>
<td></td>
<td>SpeechLLaMA</td>
<td>BLEU</td>
<td>- | 27.1 | - | 12.3</td>
</tr>
<tr>
<td></td>
<td></td>
<td>BLSP</td>
<td>BLEU</td>
<td>14.1 | - | - | -</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>BLEU</td>
<td>25.1 | 33.9 | 41.5 | 15.7</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>BLEU</td>
<td><strong>29.9 | 35.2 | 45.2 | 24.4</strong></td>
</tr>
<tr>
<td>S2TT</td>
<td>CoVoST2 (es-en | fr-en | it-en)</td>
<td>SpeechLLaMA</td>
<td>BLEU</td>
<td>27.9 | 25.2 | 25.9</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>BLEU</td>
<td>39.7 | <strong>38.5</strong> | 36.0</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>BLEU</td>
<td><strong>40.0 | 38.5 | 36.3</strong></td>
</tr>
<tr>
<td>SER</td>
<td>Meld</td>
<td>WavLM-large</td>
<td>ACC</td>
<td>0.542</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>ACC</td>
<td><strong>0.557</strong></td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen2-Audio</td>
<td>ACC</td>
<td>0.553</td>
</tr>
<tr>
<td>VSC</td>
<td>VocalSound</td>
<td>CLAP</td>
<td>ACC</td>
<td>0.4945</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Pengi</td>
<td>ACC</td>
<td>0.6035</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>ACC</td>
<td>0.9289</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>ACC</td>
<td><strong>0.9392</strong></td>
</tr>
<tr>
<td>AIR-Bench Chat</td>
<td>Speech | Sound | Music | Mixed-Audio</td>
<td>SALMONN</td>
<td>GPT-4</td>
<td>6.16 | 6.28 | 5.95 | 6.08</td>
</tr>
<tr>
<td></td>
<td></td>
<td>BLSP</td>
<td>GPT-4</td>
<td>6.17 | 5.55 | 5.08 | 5.33</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Pandagpt</td>
<td>GPT-4</td>
<td>3.58 | 5.46 | 5.06 | 4.25</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Macaw-LLM</td>
<td>GPT-4</td>
<td>0.97 | 1.01 | 0.91 | 1.01</td>
</tr>
<tr>
<td></td>
<td></td>
<td>SpeechGPT</td>
<td>GPT-4</td>
<td>1.57 | 0.95 | 0.95 | 4.13</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Next-gpt</td>
<td>GPT-4</td>
<td>3.86 | 4.76 | 4.18 | 4.13</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Qwen-Audio</td>
<td>GPT-4</td>
<td>6.47 | 6.95 | 5.52 | 6.08</td>
</tr>
<tr>
<td></td>
<td></td>
<td>Gemini-1.5-pro</td>
<td>GPT-4</td>
<td>6.97 | 5.49 | 5.06 | 5.27</td>
</tr>
<tr>
<td></td>
<td></td>
<td><strong>Qwen2-Audio</strong></td>
<td>GPT-4</td>
<td><strong>7.18 | 6.99 | 6.79 | 6.77</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>译者注：结果表中有几个值得深挖的点。第一，Qwen2-Audio 在 SER(Meld) 上的准确率(0.553)略低于 Qwen-Audio(0.557)。作者没有解释这一&quot;倒退&quot;，但一个可能的解释是：Qwen2-Audio 的训练目标更侧重于指令遵循和对话流畅性，而 Meld 是一个传统的分类基准，可能与新优化的目标不完全对齐。这反映了&quot;通用能力&quot;与&quot;专用基准&quot;之间的张力——当模型被优化为更好的&quot;助手&quot;时，某些狭窄任务上的分数可能反而下降。第二，AIR-Bench 上的提升非常明显：Qwen2-Audio 在四个维度上都超越了 Gemini-1.5-pro，而 Gemini-1.5-pro 是一个闭源商业 API。这证明了开源模型在特定领域(音频理解)上追上甚至超越商业模型的可行性。第三，Common Voice 15 上粤语(yue)的 WER 从 Whisper 的 10.9% 降至 5.9%，几乎腰斩——这暗示了训练数据中粤语覆盖的显著增加，或者多语言联合训练带来的跨语言迁移效应。</p>
</blockquote>
<hr>
<h2 id="4-cases">4 Cases</h2>
<p>在此，我们展示部分案例以说明 Qwen2-Audio 基于音频的交互能力。更多示例请参阅 <a href="https://github.com/QwenLM/Qwen2-Audio%E3%80%82">https://github.com/QwenLM/Qwen2-Audio。</a></p>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-1.pdf" alt="案例 1：围绕语音的自由聊天能力"></p>
<blockquote>
<p>图 3: 案例展示——围绕语音的自由聊天能力。用户发送语音&quot;你好，请问你能做些什么?&quot;，Qwen2-Audio 以文本回复并介绍自身能力。</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-2.pdf" alt="案例 2：围绕语音的自由聊天能力"></p>
<blockquote>
<p>图 4: 案例展示——围绕语音的自由聊天能力。用户发送语音&quot;你好，今天过得怎么样?&quot;，模型以自然对话方式回应。</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-3.pdf" alt="案例 3：围绕语音和环境声音的自由聊天能力"></p>
<blockquote>
<p>图 5: 案例展示——围绕语音和环境声音的自由聊天能力。音频中包含键盘敲击声，用户语音提问&quot;这是什么声音?&quot;，模型准确识别并回应。</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-4.pdf" alt="案例 4：语音分析能力"></p>
<blockquote>
<p>图 6: 案例展示——语音分析能力。用户提供一段多人对话音频并文本指令&quot;说话人 1 和说话人 2 分别说了什么?&quot;，模型准确转录并区分说话人。</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-5.pdf" alt="案例 5：声音分析能力"></p>
<blockquote>
<p>图 7: 案例展示——声音分析能力。用户提供一段鸟叫声并文本指令&quot;这是什么鸟的叫声?&quot;，模型识别出&quot;北美白喉莺(White-throated Sparrow)&quot;并提供详细描述。</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-6.pdf" alt="案例 6：音乐分析能力"></p>
<blockquote>
<p>图 8: 案例展示——音乐分析能力。用户提供一段音乐并文本指令&quot;这是什么歌曲?&quot;，模型识别出&quot;Bohemian Rhapsody&quot;并提供演唱者和发行信息。</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy/images/paper-demo-7.pdf" alt="案例 7：混合音频分析的鲁棒性"></p>
<blockquote>
<p>图 9: 案例展示——混合音频分析的鲁棒性。音频中同时包含环境声(雨声)、音乐和语音指令，用户语音提问&quot;背景里在下雨吗?&quot;，模型正确理解并确认。</p>
</blockquote>
<blockquote>
<p>译者注：案例 7 特别值得关注——它展示了一个&quot;三重混合&quot;场景：环境声(雨声) + 背景音乐 + 语音指令。模型需要从混合音频中区分出三个声源，理解语音指令的语义(&quot;背景里在下雨吗?&quot;)，然后从环境声中提取答案(&quot;是的，背景中确实在下雨&quot;)。这种能力要求模型不仅具备声源分离(source separation)的感知能力，还需要跨模态(音频内容 → 文本语义 → 音频内容)的推理能力。值得注意的是，作者没有使用任何显式的声源分离模块，这种能力完全从大规模多任务预训练中涌现出来。</p>
</blockquote>
<hr>
<h2 id="5-conclusion">5 Conclusion</h2>
<p>在本文中，我们介绍了 Qwen2-Audio，它在 Qwen-Audio 分析各类音频的能力基础上，进一步赋予了语音交互能力。在预训练阶段，我们对不同数据和任务使用了自然语言提示，并进一步扩大了数据规模。在 SFT 阶段，我们通过增加 SFT 数据的数量、质量和复杂性，增强了 Qwen2-Audio 与人类交互的对齐程度，从而实现了无缝的语音和文本交互。此外，我们通过 DPO 阶段进一步提升了 Qwen2-Audio 的回复质量。在多样化基准测试上的客观指标证明了 Qwen2-Audio 在音频理解和对话能力方面的 proficiency。文中展示的案例也说明了 Qwen2-Audio 流畅而灵活的语音交互能力。</p>
<blockquote>
<p>译者注：报告全文没有提到一个关键限制——输入音频长度限制。根据社区反馈和第三方实现分析，Qwen2-Audio 的音频Encoder 设置了最大位置编码长度为 1500，对应约 30 秒的音频输入。超过此时长的音频会导致内存访问越界。这一限制在论文中未被讨论，但对于实际部署至关重要。对于需要处理长音频(如会议记录、播客转录)的场景，开发者必须自行实现音频分段和结果拼接逻辑。这个 omission 提醒我们：技术报告通常展示&quot;能力上限&quot;，而工程落地时必须额外关注&quot;约束边界&quot;。</p>
</blockquote>
<hr>
<h2 id="acknowledgements">Acknowledgements</h2>
<p>我们向 Jinze Bai、Shuai Bai、Peng Wang、Sinan Tan、Shijie Wang、Kai Dang 致以诚挚的感谢，感谢他们富有洞见的讨论。</p>
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
<td>LALM</td>
<td>大规模音频-语言模型</td>
<td>Abstract</td>
<td>Large Audio-Language Model，接受音频输入并生成文本输出的多模态模型</td>
</tr>
<tr>
<td>ASR</td>
<td>自动语音识别</td>
<td>Abstract</td>
<td>Automatic Speech Recognition，将语音转换为文本</td>
</tr>
<tr>
<td>S2TT</td>
<td>语音到文本翻译</td>
<td>Introduction</td>
<td>Speech-to-Text Translation，将一种语言的语音翻译为另一种语言的文本</td>
</tr>
<tr>
<td>SER</td>
<td>语音情感识别</td>
<td>Introduction</td>
<td>Speech Emotion Recognition，识别语音中表达的情感</td>
</tr>
<tr>
<td>VSC</td>
<td>人声分类</td>
<td>Introduction</td>
<td>Vocal Sound Classification，对人类发出的非语言声音进行分类</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>Abstract</td>
<td>Direct Preference Optimization，直接从成对偏好数据优化模型，无需奖励模型</td>
</tr>
<tr>
<td>WER</td>
<td>词错误率</td>
<td>Table 2</td>
<td>Word Error Rate，语音识别中衡量识别结果与参考文本差异的指标</td>
</tr>
<tr>
<td>BLEU</td>
<td>双语评估替补</td>
<td>Table 2</td>
<td>Bilingual Evaluation Understudy，机器翻译中衡量输出与参考译文相似度的指标</td>
</tr>
<tr>
<td>mel-spectrogram</td>
<td>mel-频谱图</td>
<td>Section 2.1</td>
<td>基于 mel 频率尺度的频谱表示，模拟人耳对频率的非线性感知</td>
</tr>
<tr>
<td>pooling layer</td>
<td>池化层</td>
<td>Section 2.1</td>
<td>通过降采样减少序列长度的神经网络层</td>
</tr>
<tr>
<td>zero-shot</td>
<td>零样本</td>
<td>Section 3.2</td>
<td>模型在未经特定任务训练的情况下直接评测</td>
</tr>
<tr>
<td>SLU</td>
<td>口语语言理解</td>
<td>Section 3.1</td>
<td>Spoken Language Understanding，理解语音中的语义和意图</td>
</tr>
</tbody></table>
<h3 id="b-hxgssy">B. 核心公式索引</h3>
<table>
<thead>
<tr>
<th>编号</th>
<th>公式</th>
<th>所在章节</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>(1)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>x</mi><mi>t</mi></msub><mi mathvariant="normal">∥</mi><msub><mi>x</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><msub><mtext>Encoder</mtext><mi>ϕ</mi></msub><mo stretchy="false">(</mo><mi>a</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">P_\\theta(x_t \\| x_{&lt;t}, \\text{Encoder}_\\phi(a))</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord text"><span class="mord">Encoder</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">ϕ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">a</span><span class="mclose">))</span></span></span></span></td>
<td>Section 2.1</td>
<td>训练目标：在给定音频表示和前序文本条件下，最大化下一个文本 token 的概率</td>
</tr>
<tr>
<td>(2)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>L</mi><mtext>DPO</mtext></msub><mo>=</mo><mo>−</mo><mi mathvariant="double-struck">E</mi><mo stretchy="false">[</mo><mi>log</mi><mo>⁡</mo><mi>σ</mi><mo stretchy="false">(</mo><mi>β</mi><msub><mi mathvariant="normal">Δ</mi><mi>w</mi></msub><mo>−</mo><mi>β</mi><msub><mi mathvariant="normal">Δ</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">L_{\\text{DPO}} = -\\mathbb{E}[\\log \\sigma(\\beta \\Delta_{w} - \\beta \\Delta_{l})]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">DPO</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">−</span><span class="mord mathbb">E</span><span class="mopen">[</span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord">Δ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord"><span class="mord">Δ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)]</span></span></span></span></td>
<td>Section 2.4</td>
<td>DPO 损失函数：通过最大化优质回复与劣质回复之间的相对对数概率差距来优化模型偏好对齐</td>
</tr>
</tbody></table>
<h3 id="c-gjsysjhz">C. 关键实验数据汇总</h3>
<table>
<thead>
<tr>
<th>基准测试</th>
<th>Qwen2-Audio 结果</th>
<th>对比最优基线</th>
<th>提升幅度</th>
</tr>
</thead>
<tbody><tr>
<td>Librispeech test-clean WER</td>
<td>1.6%</td>
<td>Qwen-Audio 2.0%</td>
<td>-0.4%</td>
</tr>
<tr>
<td>Librispeech test-other WER</td>
<td>3.6%</td>
<td>Qwen-Audio 4.2%</td>
<td>-0.6%</td>
</tr>
<tr>
<td>Aishell2 Android WER</td>
<td>2.9%</td>
<td>Paraformer-large 2.9%</td>
<td>持平</td>
</tr>
<tr>
<td>Fleurs zh WER</td>
<td>7.5%</td>
<td>Whisper-large-v3 7.7%</td>
<td>-0.2%</td>
</tr>
<tr>
<td>CoVoST2 en-zh BLEU</td>
<td>45.2</td>
<td>Qwen-Audio 41.5</td>
<td>+3.7</td>
</tr>
<tr>
<td>VocalSound ACC</td>
<td>93.92%</td>
<td>Qwen-Audio 92.89%</td>
<td>+1.03%</td>
</tr>
<tr>
<td>AIR-Bench Speech</td>
<td>7.18</td>
<td>Gemini-1.5-pro 6.97</td>
<td>+0.21</td>
</tr>
<tr>
<td>AIR-Bench Sound</td>
<td>6.99</td>
<td>Qwen-Audio 6.95</td>
<td>+0.04</td>
</tr>
<tr>
<td>AIR-Bench Music</td>
<td>6.79</td>
<td>Gemini-1.5-pro 5.06</td>
<td>+1.73</td>
</tr>
<tr>
<td>AIR-Bench Mixed-Audio</td>
<td>6.77</td>
<td>Gemini-1.5-pro 5.27</td>
<td>+1.50</td>
</tr>
</tbody></table>
<h3 id="d-mxpxdw">D. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: Qwen-Audio(2023 年 11 月发布，arXiv:2311.07919)</li>
<li><strong>核心创新</strong>:<ul>
<li>用自然语言提示替代层次化任务标签，统一预训练格式</li>
<li>引入语音聊天模式，实现 Audio Analysis 与 Voice Chat 的无缝融合</li>
<li>引入 DPO 阶段优化事实性和行为一致性</li>
<li>音频Encoder 从自定义设计切换为 Whisper-large-v3 初始化</li>
</ul>
</li>
<li><strong>被后续工作引用</strong>: Qwen2.5-Omni(2025 年 3 月，arXiv:2503.20215)在此基础上扩展为全模态(文本/图像/音频/视频)统一模型</li>
<li><strong>技术定位</strong>: 从&quot;通用音频理解工具&quot;向&quot;音频通用助手&quot;转型的关键节点模型</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"abstract","text":"Abstract"},{"level":2,"id":"1-introduction","text":"1 Introduction"},{"level":2,"id":"2-methodology","text":"2 Methodology"},{"level":3,"id":"2-1-model-architecture","text":"2.1 Model Architecture"},{"level":3,"id":"2-2-pre-training","text":"2.2 Pre-training"},{"level":3,"id":"2-3-supervised-fine-tuning","text":"2.3 Supervised Fine-tuning"},{"level":3,"id":"2-4-direct-preference-optimization","text":"2.4 Direct Preference Optimization"},{"level":2,"id":"3-experiments","text":"3 Experiments"},{"level":3,"id":"3-1-evaluation","text":"3.1 Evaluation"},{"level":3,"id":"3-2-main-results","text":"3.2 Main Results"},{"level":2,"id":"4-cases","text":"4 Cases"},{"level":2,"id":"5-conclusion","text":"5 Conclusion"},{"level":2,"id":"acknowledgements","text":"Acknowledgements"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgssy","text":"B. 核心公式索引"},{"level":3,"id":"c-gjsysjhz","text":"C. 关键实验数据汇总"},{"level":3,"id":"d-mxpxdw","text":"D. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/04-qwen2-audio/01-qwen2-audio-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2-Audio 技术报告精译</h1>
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
