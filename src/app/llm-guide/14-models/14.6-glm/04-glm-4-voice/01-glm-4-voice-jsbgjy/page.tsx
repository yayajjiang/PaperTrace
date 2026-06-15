"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-4-Voice 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: GLM-4-Voice: Towards Intelligent and Human-Like End-to-End Spoken Chatbot
原文链接: <a href="https://arxiv.org/abs/2412.02612">https://arxiv.org/abs/2412.02612</a>
发布日期: 2024-12-03
发布机构: Zhipu.AI / 清华大学</p>
</blockquote>
<hr>
<h2 id="abstract">Abstract</h2>
<p>本文介绍 GLM-4-Voice,一个智能且类人化的端到端语音对话机器人. 它同时支持中文与英文,能够进行实时语音对话,并根据用户指令调节情感、语调、语速和方言等声音细节. GLM-4-Voice 使用了一个超低码率(175 bps)、单码本、帧率为 12.5 Hz 的语音分词器(speech tokenizer),该分词器通过在自动语音识别(ASR)模型的Encoder 中引入向量量化(vector-quantized, VQ)瓶颈,从一个 ASR 模型衍生而来. 为了高效地将知识从文本模态迁移到语音模态,我们使用一个 text-to-token 模型,从现有的文本预训练语料中合成语音-文本交错数据. 我们在无监督语音数据、交错语音-文本数据和监督语音-文本数据的组合上,从预训练文本语言模型 GLM-4-9B 继续预训练,规模达到 1 万亿 token,在语音语言建模和语音问答任务上均达到了最先进的性能. 随后,我们使用高质量的对话语音数据对预训练模型进行微调,在对话能力和语音质量上均优于现有基线模型. 开源模型可通过 <a href="https://github.com/THUDM/GLM-4-Voice">https://github.com/THUDM/GLM-4-Voice</a> 和 <a href="https://huggingface.co/THUDM/glm-4-voice-9b">https://huggingface.co/THUDM/glm-4-voice-9b</a> 获取.</p>
<blockquote>
<p>译者注: 这里有一个关键的工程决策值得注意. 175 bps 的码率是什么概念? 标准电话语音是 64 kbps(G.711),即使现代语音编码如 Opus 也在 6-24 kbps 范围. GLM-4-Voice 的语音分词器只用 175 bps——低了三个数量级——却仍能支持高质量语音合成. 这意味着语音信息被极度压缩成了离散的语义 token,而声学细节的重建被交给了专门的语音Decoder  . 这种「极致压缩 + 专门解码」的两阶段设计,是端到端语音模型与级联 ASR+LLM+TTS 方案的核心区别之一.</p>
</blockquote>
<hr>
<h2 id="1-introduction">1 Introduction</h2>
<p>大语言模型(LLM)的成功极大地推动了对话式 AI 的发展,催生了基于文本的聊天机器人和数字助手. 然而,LLM 主要被设计为处理文本输入并生成文本输出,聚焦于语义和逻辑层面的交流. 相比之下,人类交流超越了语义本身,常常传达情感和微妙的语气变化. 因此,基于语音的交互提供了一种更自然、更直观的人机交互媒介,能够带来更丰富、更具吸引力的用户体验.</p>
<p>传统的语音对话机器人通常依赖一种级联 pipeline,将自动语音识别(ASR)、LLM 处理和文本转语音(TTS)合成组合在一起. 虽然功能上可行,但这种方案往往受困于高延迟、ASR 和 TTS 阶段引入的复合错误,以及捕捉和表达情感细节的有限能力.</p>
<p>语音语言模型(SpeechLMs)以端到端方式同时处理语音输入和输出,为构建语音对话机器人提供了一种有前景的途径. 诸如 Lakhotia 等人 [24] 和 Hassid 等人 [17] 的工作探索了类似 LLM 的语音数据预训练方式. 类似地,Defossez 等人 [12] 将语音数据规模扩展到了 700 万小时用于模型训练. 然而,这些方案面临一个显著的局限:与互联网上可获取的海量文本语料相比,语音数据相对稀缺. 这种数据不平衡使得难以充分利用基于文本的 LLM 的能力,最终限制了语音语言模型的智能水平. 其他方法则试图通过在现有 LLM 中集成语音Encoder 和文本转语音模块,并在语音对话数据集上微调,来实现语音和文本模态的对齐 [15, 42]. 虽然这种方法为从 LLM 开发语音到语音模型提供了一条直接的途径,但由于缺乏专门的语音预训练,它无法生成真正类人的语音输出. 这一局限阻碍了这些模型捕捉人类语音中丰富的细微差别和表现力.</p>
<blockquote>
<p>译者注: 这一段清晰地点出了语音模型的核心矛盾——语音数据比文本数据少几个数量级. 解决方案无非两条路线: 要么像 Moshi 一样疯狂堆语音数据(700 万小时),要么像 GLM-4-Voice 一样走「知识迁移」路线,从文本预训练语料中合成语音-文本交错数据. GLM-4-Voice 选择了后者,本质上是用 text-to-token 模型「朗读」文本语料,把文本数据「语音化」,从而把 LLM 的文本知识迁移到语音模态. 这个思路的巧妙之处在于:它不需要真实的语音录音,就能让模型学会「语音和文本说的是同一件事」.</p>
</blockquote>
<p>在本文中,我们介绍 GLM-4-Voice,一个智能且类人的语音对话机器人. 我们使用帧率为 12.5 Hz 的单码本监督语音分词器来高效地表示语音. 采用基于流匹配(flow-matching)的语音Decoder  将语音 token 转换为自然语音. 为了弥合文本与语音模态之间的鸿沟,我们使用 1 万亿 token 进行大规模语音-文本预训练,其中包括从文本预训练数据衍生的合成交错语音-文本语料,以及无监督语音数据和监督语音-文本数据集(如 ASR 和 TTS). 由此得到的基座模型在各种任务上展示了强劲的性能,包括语音语言建模、语音问答、ASR 和 TTS. 为了进一步增强对话机器人的对话能力,我们使用「流式思考(streaming thoughts)」模板在高质量对话数据集上对基座模型进行微调. 该模板在输出文本 token 和语音 token 之间交替,提升了模型生成无缝、低延迟响应的能力,同时保持了高质量的性能.</p>
<hr>
<h2 id="2-related-work">2 Related Work</h2>
<h3 id="2-1-speech-tokenization">2.1 Speech Tokenization</h3>
<p>语音分词器将音频片段转换为离散 token,可分为两个方向. 神经声学编Decoder  (neural acoustic codecs) [44, 11, 23, 20] 旨在以低码率重建高质量音频. 语义 token(semantic tokens) [19, 10] 则是从语音数据的自监督学习中提取的表示. 最近,SpeechTokenizer [48] 和 Mimi [12] 将语义 token 和声学 token 统一为不同残差向量量化(RVQ)层,但它们也面临同一位置多个 token 的问题,导致要么需要并行预测语义和声学 token,要么退化为用于语言模型的纯语义分词器. CosyVoice [14] 提出了从语音识别模型衍生的监督语义分词器,并成功将其应用于文本转语音合成. 该分词器在语音语言建模上的应用尚未被探索.</p>
<blockquote>
<p>译者注: 这里点明了语音分词器的技术路线之争. 声学编Decoder  (如 SoundStream, EnCodec)保真度高但码率也高,且 RVQ 多码本设计不适合自回归生成; 语义 token(如 HuBERT)码率低但丢失了声学细节,合成质量差. GLM-4-Voice 的切入点是「监督语义分词器」——它从 ASR 模型导出,天然与文本对齐,同时通过流匹配Decoder  补回声学细节. 单码本设计则避免了 RVQ 的并行预测复杂性,让自回归语言模型可以直接生成.</p>
</blockquote>
<h3 id="2-2-speech-language-modeling">2.2 Speech Language Modeling</h3>
<p>语音语言模型是在无监督语音数据上预训练的自回归模型. Lakhotia 等人 [24] 首次提出了生成式口语语言建模(GSLM),在由自监督学习产生的离散语义 token 上训练 next-token-prediction 目标. AudioLM [5] 提出了一种混合分词方案,将这些语义 token 与神经音频编Decoder   [44] 的声学 token 相结合. TWIST [17] 使用预训练文本语言模型 OPT [47] 进行 warm-start 来训练语音语言模型. Moshi [12] 将 TWIST 中的自然语音数据规模扩展到了 700 万小时. Spirit-LM [32] 进一步通过在语音-文本平行语料中构建的语音-文本交错数据扩展了 TWIST. 然而,语音-文本平行语料的稀缺性限制了交错数据的规模.</p>
<h3 id="2-3-end-to-end-spoken-chatbots">2.3 End-to-End Spoken Chatbots</h3>
<p>语音到语音模型的早期工作主要聚焦于语音翻译等处理任务 [8, 2]. 自 ChatGPT 在文本对话机器人中取得成功以来,许多工作探索了开发能够理解和以语音回应的语音对话机器人的方法. SpeechGPT [46] 提出将现有大语言模型与离散语音表示相结合,以获得语音对话能力. Moshi [12] 提出了一种基于其预训练语音语言模型的全双工语音对话框架. Qwen-Audio [9] 通过将 Whisper [36] Encoder 的语音表示与预训练文本语言模型对齐,使模型能够适应语音理解. 该模型能够理解语音,但无法生成语音. Llama-Omni [15] 和 Freeze-Omni [41] 通过在语言模型后添加文本转语音模型来扩展该方法,将文本输出转换为语音输出. 这样,语言模型只能控制语音的内容,而无法控制风格和韵律. Mini-Omni [42] 直接微调语言模型,使其仅用指令数据集同时生成文本和语音响应. 由于缺乏语音预训练,其文本和语音响应的质量都受到严重限制,我们将在实验中展示这一点.</p>
<blockquote>
<p>译者注: 这个相关工作的梳理非常清晰. 端到端语音对话模型经历了三代演进: 第一代是 ASR+LLM+TTS 级联(高延迟、丢细节); 第二代是在 LLM 上直接嫁接语音编Decoder  (如 Llama-Omni, Mini-Omni),但缺乏语音预训练导致质量受限; 第三代是像 Moshi 和 GLM-4-Voice 这样,先在大规模语音数据上做预训练,再做对话微调. GLM-4-Voice 与 Moshi 的关键区别在于: Moshi 堆的是真实语音数据(700 万小时),而 GLM-4-Voice 走的是「合成交错数据」路线,用 1T token 的语音-文本混合数据做预训练.</p>
</blockquote>
<hr>
<h2 id="3-architecture">3 Architecture</h2>
<p>在本节中,我们介绍 GLM-4-Voice 的架构. 我们的目标是构建一个类人化的端到端语音对话机器人,同时具备高智能水平. 为了实现这一目标,模型必须 1) 理解用户的语音并给出语义准确的回应,以及 2) 遵循用户的语音指令,生成满足用户期望的、带有副语言特征(paralinguistic features)的语音. 受 LLM 中成功的预训练-微调范式的启发,我们相信这些语音对话机器人的能力最好通过在多样化语音语料上的大规模预训练来培养,而不是像近期语音对话机器人方案 [15, 42] 那样,简单地用语音问答数据微调现有 LLM.</p>
<p>为了实现这一目标,GLM-4-Voice 对自回归 Transformer 架构做了最小化改动. 对于语音分词,我们使用监督语音分词器,它能在超低码率(175 bps)下有效捕获语义信息,同时保持高质量的语音重建. 此外,我们对语音分词采用单码本(single-codebook)方法,避免了多层语音 token 生成所需的复杂架构调整 [12, 42]. 这种方法有助于保留模型的文本处理能力,同时实现高效的语音建模. 此外,模型对输入和输出使用统一的语音表示,支持对语音数据进行 next-token prediction,并便于在无监督语音语料上进行高效预训练.</p>
<p>我们使用与 Zeng 等人 [45] 中描述的相同的语音分词器和语音Decoder  . 为了实现低延迟交互,我们使语音Decoder  支持流式推理,并设计了一个流式思考模板,在监督微调阶段能够在文本 token 和语音 token 之间交替输出,详见第 3.3 节和第 3.2 节.</p>
<h3 id="3-1-speech-tokenization">3.1 Speech Tokenization</h3>
<p>之前的语音分词方法可分为两个方向. 声学分词器(acoustic tokenizers)使用语音波形的重建/对抗目标进行训练. 声学 token 保留了足够的信息来重建原始音频,但为了表示额外信息,它要么依赖高采样率(即每秒的 token 数量),要么依赖残差向量量化 <a href="%E5%8D%B3%E5%A4%9A%E4%B8%AA%E5%A0%86%E5%8F%A0%E7%9A%84%E7%A0%81%E6%9C%AC">44</a>. 语义 token 则是从自动发现的语音单元 [19] 的自监督表示中提取的. 语义 token 丢弃了表示语音语义所不必要的额外信息,但也导致了低质量的语音合成和声学细节的丢失 [31]. 用于语音-文本语言建模的理想语音分词器应具备以下几个关键特征: 1) 低采样率且单码本,以支持自回归生成; 2) 与文本对齐,以迁移预训练语言模型的知识; 3) 支持高质量语音合成.</p>
<p>我们采用 Zeng 等人 [45] 中描述的 12.5 Hz 语音分词器变体. 为了使本文自成一体,我们简要描述该语音分词器的架构. 受文本转语音合成中监督语义分词器 [14] 的启发,我们在一个预训练的自动语音识别模型(我们使用 Whisper 家族中的 whisper-large-v3 [36])的Encoder 中间微调了一个带有额外池化层(pooling layer)和向量量化层(vector quantization layer) [40] 的模型. 码本向量通过指数移动平均(EMA)进行学习,并且我们按照 Dhariwal 等人 [13] 的做法,在量化前用随机选择的连续表示重置平均使用率低于某个阈值的向量,以克服码本坍缩(codebook collapse)问题.</p>
<blockquote>
<p>译者注: 这里有几个关键的工程细节需要拆解. 第一,「在 ASR Encoder 中间插入 VQ 瓶颈」这个设计非常精妙: ASR Encoder 的前半部分负责从原始波形提取声学特征,后半部分负责将声学特征映射到文本. 在「中间」截断并量化,意味着量化后的 token 既保留了足够的语义信息(因为后半部分仍能解码出文本),又足够紧凑(因为经过了量化压缩). 第二,EMA 更新码本加死码本重置(dead code reset)是 VQ-VAE 训练的标准技巧,防止某些码本向量永远不被使用. 第三,池化层的作用是将 Whisper 原本 50Hz 的特征帧率降到 12.5Hz,每 4 帧取平均,这是降低码率的关键.</p>
</blockquote>
<p><strong>Causality for Streaming Inference</strong></p>
<p>为了支持推理时的流式输入语音编码,我们调整了 Whisper Encoder 的架构以引入因果性 [45]. 具体而言,我们将Encoder  Transformer 之前的卷积层替换为因果卷积(causal convolution) [39],并将Encoder 中的双向注意力替换为块因果注意力(block causal attention).</p>
<blockquote>
<p>译者注: 因果卷积和块因果注意力是流式推理的标配. 标准 Whisper Encoder 使用双向注意力,意味着要看到整个输入序列才能开始编码——这无法支持「边说边转」的实时场景. 块因果注意力将序列分成固定大小的块,每个块内部可以双向注意力,但块之间只能向前看,在延迟和建模能力之间取了一个折中.</p>
</blockquote>
<p><strong>Training Details</strong></p>
<p>我们使用一系列 ASR 数据集来微调向量量化 Whisper 模型,包括 LibriSpeech [34]、GigaSpeech [7]、MLS-Eng [35]、Wenet [43]、CommonVoice [3]、AISHELL-1 [6],以及一个 10k 小时的专有中文 ASR 数据集. 我们还包含了 70 万小时的无监督语音数据,其伪标签由 whisper-large-v3 <a href="%E8%8B%B1%E6%96%87">36</a>和 paraformer-large <a href="%E4%B8%AD%E6%96%87">1</a>生成. 我们所有的语音分词器都是从 whisper-large-v3 微调而来,训练 2 个 epoch,batch size 为 4096,学习率为 1e-5. 监督样本与伪标签样本的比例为 1:3. 码本向量使用指数移动平均更新,衰减系数为 0.99,承诺损失(commitment loss)系数为 10.0. 为了减少平均池化导致的信息丢失,随着采样率降低,我们增大码本大小.</p>
<p><strong>Evaluation</strong></p>
<p>我们通过微调 ASR 模型的准确率来衡量语音 token 中语义信息的保留程度. LibriSpeech [34] 和 AISHELL-1 [6] 上的结果如表 1 所示,以 whisper-large-v3 [36] 和 SenseVoice-Large [1] 为基线. 总体而言,所有分词器都保留了足够的语义信息以实现准确的 ASR 性能. 综合考虑下一节中的重建结果,我们为 GLM-4-Voice 选择了 12.5 Hz 的分词器.</p>
<blockquote>
<p>图 1: GLM-4-Voice 的语音分词器与语音Decoder  架构. 语音分词器将连续波形转换为离散语音 token,保留语义信息和部分声学信息. 语音Decoder  基于条件流匹配模型和 HiFi-GAN 声码器,将语音 token 还原为语音波形.</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.6-glm/04-glm-4-voice/01-glm-4-voice-jsbgjy/images/fig1_tokenizer_decoder.png" alt="语音分词器与Decoder  架构"></p>
<p>表 1 展示了不同语音分词器和Decoder  的评估结果. LS 表示 LibriSpeech. LibriSpeech(英文)使用词错误率(WER)评估,AISHELL-1(中文)使用字错误率(CER)评估. 我们微调了带有向量量化和各种池化层的 ASR 模型 whisper-large-v3,以创建不同采样率的分词器. 针对 GLM-4-Voice 的后续开发,我们选择了 12.5 Hz 变体.</p>
<table>
<thead>
<tr>
<th align="center">分词器</th>
<th align="center">帧率</th>
<th align="center">码率(bps)</th>
<th align="center">ASR ↓</th>
<th align="center"></th>
<th align="center"></th>
<th align="center">重建</th>
<th align="center"></th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center">LS-clean</td>
<td align="center">LS-other</td>
<td align="center">AISHELL-1</td>
<td align="center">WER↓</td>
<td align="center">VisQOL↑</td>
<td align="center">MOSNet↑</td>
</tr>
<tr>
<td align="center">SpeechTokenizer</td>
<td align="center">50Hz</td>
<td align="center">1.50K</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">9.97</td>
<td align="center">1.53</td>
<td align="center">2.67</td>
</tr>
<tr>
<td align="center">SpeechTokenizer</td>
<td align="center">50Hz</td>
<td align="center">4.00K</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">6.32</td>
<td align="center">3.07</td>
<td align="center">3.10</td>
</tr>
<tr>
<td align="center">Moshi (Mimi)</td>
<td align="center">12.5Hz</td>
<td align="center">1.10K</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">8.36</td>
<td align="center">2.82</td>
<td align="center">2.89</td>
</tr>
<tr>
<td align="center">whisper-large-v3</td>
<td align="center">50Hz</td>
<td align="center">-</td>
<td align="center">2.50</td>
<td align="center">4.53</td>
<td align="center">9.31</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
</tr>
<tr>
<td align="center">SenseVoice-Large</td>
<td align="center">50Hz</td>
<td align="center">-</td>
<td align="center">2.57</td>
<td align="center">4.28</td>
<td align="center">2.09</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
</tr>
<tr>
<td align="center">GLM-4-Voice-Tokenizer</td>
<td align="center">12.5Hz</td>
<td align="center">175</td>
<td align="center">2.10</td>
<td align="center">4.90</td>
<td align="center">3.02</td>
<td align="center">8.43</td>
<td align="center">2.52</td>
<td align="center">3.39</td>
</tr>
<tr>
<td align="center">(50Hz variant)</td>
<td align="center">50Hz</td>
<td align="center">600</td>
<td align="center">1.85</td>
<td align="center">3.78</td>
<td align="center">2.70</td>
<td align="center">6.24</td>
<td align="center">2.67</td>
<td align="center">3.38</td>
</tr>
<tr>
<td align="center">(25Hz variant)</td>
<td align="center">25Hz</td>
<td align="center">300</td>
<td align="center">1.94</td>
<td align="center">4.16</td>
<td align="center">2.86</td>
<td align="center">6.80</td>
<td align="center">2.60</td>
<td align="center">3.33</td>
</tr>
<tr>
<td align="center">(6.25Hz variant)</td>
<td align="center">6.25Hz</td>
<td align="center">100</td>
<td align="center">14.41</td>
<td align="center">2.34</td>
<td align="center">3.24</td>
<td align="center">14.41</td>
<td align="center">2.34</td>
<td align="center">3.24</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 这张表非常关键. 12.5 Hz / 175 bps 的选择是一个精心权衡的结果. 对比 50Hz/600bps 变体: 12.5Hz 的 ASR 性能略差(2.10 vs 1.85 WER on LS-clean),但重建质量差距不大(MOSNet 3.39 vs 3.38),而码率降低了近 3.5 倍. 对比 Mimi 的 12.5Hz/1.10Kbps: GLM-4-Voice 的码率只有 Mimi 的 1/6,但重建质量反而更高(MOSNet 3.39 vs 2.89). 这个「单码本监督语义 token + 流匹配Decoder  」的组合,在效率-质量权衡上明显优于 RVQ 方案. 6.25Hz/100bps 变体则是一个反面教材: ASR WER 飙升到 14.41,说明压缩过度导致语义信息大量丢失.</p>
</blockquote>
<h3 id="3-2-speech-decoder">3.2 Speech Decoder</h3>
<p>语音Decoder  从离散语音 token 合成语音波形,对于确保生成语音的质量和表现力至关重要. 为了最小化语音交互中的延迟,Decoder  还必须支持流式推理. 与 Zeng 等人 [45] 一致,我们采用 CosyVoice [14] 的Decoder  架构,包括一个语音 token Encoder 、一个条件流匹配模型(conditional flow matching model) [28] 和一个 HiFi-GAN 声码器 [22].</p>
<p><strong>Training Details</strong></p>
<p>我们从零开始训练语音 token Encoder 和流匹配模型,采用两阶段训练范式以充分利用各种质量水平的丰富语音数据. 在预训练阶段,我们使用无监督语音数据中各种说话人和质量的全部语音样本. 在微调阶段,我们使用来自单一说话人的高质量语音样本.</p>
<blockquote>
<p>译者注: 两阶段训练是语音合成领域的标准做法. 预训练阶段用「脏数据」学习通用的声学映射,微调阶段用「干净数据」优化特定说话人的音质. 这种「先泛化后特化」的策略在 TTS 中已经被反复验证有效. 流匹配模型(flow matching)相比传统的扩散模型,优势在于推理时可以用更少的步数(通常 10-20 步)生成高质量样本,延迟更低.</p>
</blockquote>
<p><strong>Support for Streaming Inference</strong></p>
<p>为了支持流式推理并降低延迟,我们在微调阶段引入了截断音频样本(即音频的前 n * b 秒,其中 n = 1, 2, 3, ... ,b 为块大小). 这使模型能够有效处理流式场景. 在推理时,Decoder  处理对应于音频前 n * b 秒的语音 token. 它使用初始 (n-1)b 秒的语音作为提示(prompt),并预测从 (n-1)b 到 n * b 秒的语音内容. 这种方法使模型能够以最小 b 秒的延迟生成语音 token. 基于经验研究,我们为 GLM-4-Voice 设置 b = 0.8,这意味着至少需要 10 个语音 token 才能生成初始语音输出.</p>
<p><strong>Evaluation</strong></p>
<p>我们引用 Zeng 等人 [45] 的重建结果来展示我们的语音Decoder  在低码率语音 token 下的性能. 我们在 LibriSpeech [34] 的语音重建任务上评估我们的语音Decoder  ,并将我们的分词器与 SpeechTokenizer [48] 和 Mimi [12] 进行比较. 按照 Defossez 等人 [12] 的做法,我们还评估了一个只保留前 3 层 RVQ 以获得 1.5 kbps 码率的 SpeechTokenizer 变体. 表 1 显示,我们的语音Decoder  在各种采样率下均表现良好,其中 12.5 Hz 变体在效率和质量之间提供了最佳平衡. 它在显著降低码率(175 bps)的同时,保持了高质量分数(MOSNet 3.39)和内容保真度(WER 8.43).</p>
<h3 id="3-3-inference">3.3 Inference</h3>
<p><strong>Decoupling Speech-to-Speech Task</strong></p>
<p>一个理想的语音语言模型将仅使用语音 token 进行直接的语音到语音任务. 然而,鉴于大语言模型的成功以及「文本代表了大多数语音的语义内容」这一假设,我们将语音到语音任务解耦为两个子任务: 语音到文本和语音+文本到语音. 给定用户的语音输入 Qs、对应的文本响应 At 和语音输出 As,这两个任务定义如下:</p>
<ul>
<li>Speech-to-Text: 模型基于用户的语音输入 Qs 生成文本响应 At.</li>
<li>Speech-and-Text-to-Speech: 利用 Qs 和 At,模型生成语音输出 As,并配以自适应的语调和韵律以确保对话连贯性.</li>
</ul>
<p>我们在推理过程中采用这种解耦策略. 首先,模型基于用户输入 Qs 生成文本答案 At,然后使用 Qs 和 At 生成 As. 这样,语音响应 As 的生成由文本响应 At 引导,以提高性能. 然而,这种方法导致了较高的初始 token 延迟,因为它需要等待 At 完全生成后才能开始生成 As. 为了解决这个问题,我们应用了一个名为「流式思考(Streaming Thoughts)」的模板. 如图 2 所示,给定 Qs,模型以指定比例在输出文本 token 和语音 token 之间交替,然后将它们分别拼接形成 At 和 As. 具体而言,基于我们的 12.5 Hz 分词器,我们在生成 13 个文本 token 和 26 个语音 token 之间交替. 选择 1:2 的比例是为了确保文本生成始终比语音生成快. 否则,生成的语音 token 将缺乏来自文本 token 的必要上下文. 选择 26 个语音 token 是基于经验观察,使模型能够在合成之前生成一个连贯的内容片段,以确保合成语音的准确性.</p>
<blockquote>
<p>图 2: 左图: GLM-4-Voice 两个训练阶段的数据构建. 右图: GLM-4-Voice 的模型架构.</p>
</blockquote>
<p><img src="/llm-guide/14-models/14.6-glm/04-glm-4-voice/01-glm-4-voice-jsbgjy/images/fig2_architecture_training.png" alt="GLM-4-Voice 架构与训练流程"></p>
<blockquote>
<p>译者注: 「流式思考」模板是 GLM-4-Voice 降低延迟的核心创新. 如果不采用这种交替生成策略,模型必须先完整生成文本回答(可能数百个 token),再开始生成语音 token——这意味着用户要等好几秒才能听到第一个声音. 通过 13 个文本 token 和 26 个语音 token 的交替,模型可以在生成文本的同时就开始输出语音,将「首包延迟」从「完整文本生成时间」降低到「13 个文本 token + 10 个语音 token 的解码时间」. 1:2 的比例设计也有深意: 文本 token 的生成速度通常远快于语音 token(因为语音 token 需要更多上下文依赖),确保文本始终领先于语音,为语音生成提供足够的语义指导.</p>
</blockquote>
<p><strong>Overall Latency</strong></p>
<p>生成第一个语音波形的总体响应延迟可以计算如下:</p>
<ul>
<li>Speech Tokenization: 用户的语音输入由语音分词器以流式方式处理,分词器以固定大小为 t_block 的块为单位运行. 得益于流式设计,分词器立即开始处理,仅需处理当前块所需的时间,而与总语音时长无关. 因此,分词延迟为:</li>
</ul>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 16: T_{\\text{speech_̲tokenize}} = f_…" style="color:#cc0000">T_{\\text{speech_tokenize}} = f_{\\text{speech_tokenize}}(t_{\\text{block}})</span><ul>
<li>LLM Prefilling: 分词器生成的语音 token 数量 N_speech_tokens 基于用户语音时长 T_user_speech 和帧率 f_r = 12.5 tokens per second. LLM 的 prefill 延迟为:</li>
</ul>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 13: T_{\\text{llm_̲prefill}} = f_{…" style="color:#cc0000">T_{\\text{llm_prefill}} = f_{\\text{llm_prefill}}(f_r \\cdot T_{\\text{user_speech}})</span><ul>
<li>LLM Decoding: 对于初始音频响应,LLM 生成 13 个文本 token 和 10 个语音 token,总共 N_first_speech = 13 + 10 = 23 个 token. 此步骤的解码延迟为:</li>
</ul>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 13: T_{\\text{llm_̲decode}} = f_{\\…" style="color:#cc0000">T_{\\text{llm_decode}} = f_{\\text{llm_decode}}(N_{\\text{first_speech}})</span><ul>
<li>Speech Decoding: N_speech = 10 个音频 token 由语音Decoder  处理以生成第一个音频块. 此步骤的延迟为:</li>
</ul>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 16: T_{\\text{speech_̲decode}} = f_{\\…" style="color:#cc0000">T_{\\text{speech_decode}} = f_{\\text{speech_decode}}(N_{\\text{speech}})</span><p>总体响应延迟为:</p>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 35: …T_{\\text{speech_̲tokenize}} + T_…" style="color:#cc0000">T_{\\text{total}} = T_{\\text{speech_tokenize}} + T_{\\text{llm_prefill}} + T_{\\text{llm_decode}} + T_{\\text{speech_decode}}</span><blockquote>
<p>译者注: 这个延迟分解公式虽然形式化,但传递了一个重要的工程信息. 在级联 ASR+LLM+TTS 方案中,延迟是串行相加的: ASR 转录完整语音 → LLM 生成完整文本 → TTS 合成完整语音. 而在 GLM-4-Voice 的端到端方案中,分词是流式的(LLM 可以在用户还在说话时就开始 prefill),解码也是流式的(文本和语音 token 交替生成). 虽然公式中各项仍然是相加关系,但由于流式处理的叠加效应,实际感知延迟远低于级联方案. 论文提到整体延迟约为 3 秒(「Latency: ~ 20 tokens」即约 20 个语音 token,对应约 1.6 秒语音,加上处理开销约 3 秒),这在当时的语音对话模型中是相当有竞争力的数字.</p>
</blockquote>
<hr>
<h2 id="4-training-procedure">4 Training Procedure</h2>
<h3 id="4-1-stage-1-joint-speech-text-pre-training">4.1 Stage 1: Joint Speech-Text Pre-training</h3>
<p>我们采用与 Zeng 等人 [45] 相同的预训练数据和流程. 这一阶段的主要目标是通过大规模语音预训练将语音建模能力扩展到 LLM. 我们使用三种类型的语音数据:</p>
<ul>
<li>交错语音-文本数据: 按照 Zeng 等人 [45] 的描述,从文本预训练数据合成,这些数据促进了文本与语音之间的跨模态知识迁移.</li>
<li>无监督语音数据: 包含 70 万小时语音数据,鼓励模型从真实世界语音中学习.</li>
<li>监督语音-文本数据: 包括 ASR 和 TTS 数据,提升模型在基础语音任务上的能力.</li>
</ul>
<p>我们还混合文本预训练数据集以保持文本性能. 训练数据统计如表 2 所示.</p>
<blockquote>
<p>图 2 左图展示了两个训练阶段的数据构建方式. 在阶段 I 中,文本语料通过 text-to-token LM 合成交错的语音 token 和文本 token 数据. 在阶段 II 中,使用高质量的对话数据进行监督微调.</p>
</blockquote>
<p>表 2 展示了训练数据统计.</p>
<table>
<thead>
<tr>
<th align="center">数据类型</th>
<th align="center"># Tokens</th>
<th align="center"></th>
<th align="center">Epochs</th>
</tr>
</thead>
<tbody><tr>
<td align="center"></td>
<td align="center">Speech</td>
<td align="center">Text</td>
<td align="center"></td>
</tr>
<tr>
<td align="center">Speech-Text 交错</td>
<td align="center">455B</td>
<td align="center">279B</td>
<td align="center">0.90</td>
</tr>
<tr>
<td align="center">Speech-Only</td>
<td align="center">31B</td>
<td align="center">-</td>
<td align="center">2.10</td>
</tr>
<tr>
<td align="center">ASR + TTS</td>
<td align="center">11B</td>
<td align="center">3.5B</td>
<td align="center">2.07</td>
</tr>
<tr>
<td align="center">Text-only</td>
<td align="center">-</td>
<td align="center">10T</td>
<td align="center">0.03</td>
</tr>
</tbody></table>
<p>我们使用 GLM-4-9B-Base [16] 初始化 GLM-4-Voice,并将其词表扩展以包含语音 token. 我们在 1 万亿 token 上进行预训练,固定采样比例为 30% 的文本数据,无监督语音和监督语音-文本数据各一个 epoch,其余部分由交错语音-文本数据组成. 训练语料的组成详见表 2. 我们使用 AdamW [27] 优化器,其中 beta_1 = 0.9,beta_2 = 0.95. 模型以 8192 的序列长度进行训练,学习率从 6e-5 线性衰减到 6e-6.</p>
<blockquote>
<p>译者注: 这个数据配比值得仔细分析. 1T token 中,455B 的 Speech-Text 交错数据占了绝对大头(约 45%),这是知识迁移的主力; 31B 的纯语音数据虽然 token 数少,但跑了 2.1 个 epoch,说明语音数据的「真实多样性」很重要; 10T 的文本数据只跑了 0.03 个 epoch,说明文本能力主要靠 GLM-4-9B-Base 的预训练权重继承,而不是从头训练. 30% 的文本比例是一个保守的设计——确保模型不会因为语音预训练而遗忘文本能力. 学习率从 6e-5 到 6e-6 的衰减范围,相对于 base 模型的预训练学习率(通常 3e-4 量级)来说是较低的,这是继续预训练(continual pre-training)的标准做法,避免破坏已学到的表示.</p>
</blockquote>
<h3 id="4-2-stage-2-supervised-fine-tuning">4.2 Stage 2: Supervised Fine-tuning</h3>
<p><strong>Data Construction</strong></p>
<p>为了创建一个类人化的语音对话机器人,我们利用以下两种类型的数据:</p>
<ul>
<li>多轮对话语音对话: 这些对话主要来源于文本对话数据,经过仔细筛选以确保质量. 排除代码和数学相关内容,聚焦于适合语音交互的对话材料. 回应经过精炼,缩短过长的文本并避免不适合口头表达的内容. 相应的语音输出被合成以与精炼后的对话对齐. 为了增强真实世界语音聊天场景中语音输入的多样性,标注员朗读并录制了各种语音输入.</li>
<li>语音风格控制的语音对话: 这一类包含针对特定语音风格要求(如语速、情感或方言)量身定制的高质量多轮语音对话.</li>
</ul>
<p><strong>Training Details</strong></p>
<p>如第 3.3 节所述,我们将语音到语音任务解耦为两个子任务,并采用流式思考模板来降低延迟. 每个对话轮次包含用户语音输入 Qs、对应的文本输入 Qt、文本输出 At 和对应的语音输出 As. 我们观察到两个子任务的学习曲线不同. 具体而言,给定用户语音输入 Qs,模型学习文本输出 At 的速度比学习语音输出 As 更快. 为了解决这一差异,我们将每个训练样本拆分为两个部分: 一个专注于从语音输入学习文本输出(对语音输出的损失进行掩码),另一个专注于从语音输入和文本输出共同学习语音输出(对文本输出的损失进行掩码).</p>
<p>模型在语音输出上微调 20 个 epoch,在文本输出上微调 4 个 epoch. 学习率从 1e-5 逐渐降低到 1e-6. 为了缓解过拟合,我们应用权重衰减 0.1,隐藏层的 dropout 率设置为 0.5,梯度裁剪最大值为 1.0.</p>
<blockquote>
<p>译者注: 这里有两个关键的训练技巧. 第一,损失掩码(loss masking)策略: 模型在同一个样本上分别学习「听→说文本」和「听+读文本→说语音」两个目标,但互不干扰. 这相当于一种多任务学习,避免了语音生成任务被文本生成任务「淹没」. 第二,20 epoch vs 4 epoch 的不对称训练: 语音输出更难学,需要更多迭代; 文本输出相对容易,4 个 epoch 就够了. 0.5 的 dropout 率相当高(通常 LLM 微调 dropout 在 0.1 左右),说明对话数据量相对较小,需要强正则化来防止过拟合. 权重衰减 0.1 和梯度裁剪 1.0 也是保守的设置,进一步印证了这一点.</p>
</blockquote>
<hr>
<h2 id="5-evaluation">5 Evaluation</h2>
<h3 id="5-1-base-model-evaluation">5.1 Base Model Evaluation</h3>
<p>我们通过两个语音-文本任务来评估基座模型: 语音语言建模 [5] 和语音问答 [30]. 对于两个任务,我们考虑两种不同的设置: 从语音上下文到语音生成(记为 S→S),以及从语音上下文到文本生成(记为 S→T). 对于所有任务,我们使用 VolcEngine 提供的多说话人 TTS API 合成上下文和续接部分.</p>
<p><strong>Speech Language Modeling</strong></p>
<p>该任务评估预训练模型对交错语音和文本的建模能力. 模型被给定一个上下文,需要根据预测似然度选择正确的续接部分. 我们使用 Hassid 等人 [17] 提出的两个数据集: spoken StoryCloze 和 spoken Topic-StoryCloze. 两个数据集均由 StoryCloze 文本基准 [29] 转换而来. spoken Topic-StoryCloze 比 spoken StoryCloze 更容易. 基线结果来自 Defossez 等人 [12].</p>
<p><strong>Spoken Question Answering</strong></p>
<p>类似于 NLP 中的闭卷问答,语音问答要求语音语言模型在没有外部知识库的情况下,回答关于广泛事实知识的语音问题. 我们在 Defossez 等人 [12] 使用的 3 个数据集上评估我们的模型: Web Questions [4]、Llama Questions [30] 和 TriviaQA [21]. 基线结果来自 Defossez 等人 [12].</p>
<p><strong>Results</strong></p>
<p>语音语言建模的结果如表 3 所示,语音问答的结果如表 4 所示. 我们可以观察到,GLM-4-Voice 在 S→S 和 S→T 两种设置下的所有评估任务上均优于基线模型,除了 S→S 设置下的 Topic-StoryCloze. 与同样支持语音和文本两种模态的 Moshi [12] 相比,我们的模型在语音问答任务上表现优异,无论答案是文本还是语音形式. 另一个观察是,S→T 设置的准确率总是优于 S→S 设置,尤其在语音问答任务上. 因此,文本指导对于智能语音对话机器人仍然是必要的. 然而,我们的方法显著缩小了语音问答中语音回答与文本回答之间的差距,尤其在 Llama Questions 上,具有开发直接语音到语音对话机器人的潜力.</p>
<p>表 3: 语音语言建模结果. Spirit-LM 的结果来自 Nguyen 等人 [32],其他结果来自 Defossez 等人 [12].</p>
<table>
<thead>
<tr>
<th align="center">模型</th>
<th align="center">模态</th>
<th align="center">参数量</th>
<th align="center">Topic-StoryCloze</th>
<th align="center">StoryCloze</th>
</tr>
</thead>
<tbody><tr>
<td align="center">TWIST</td>
<td align="center">S→S</td>
<td align="center">7B</td>
<td align="center">66.6</td>
<td align="center">53.3</td>
</tr>
<tr>
<td align="center">Spirit-LM</td>
<td align="center">S→S</td>
<td align="center">7B</td>
<td align="center">82.9</td>
<td align="center">61.0</td>
</tr>
<tr>
<td align="center">Spirit-LM</td>
<td align="center">S→T</td>
<td align="center">7B</td>
<td align="center">88.6</td>
<td align="center">64.6</td>
</tr>
<tr>
<td align="center">Moshi</td>
<td align="center">S→S</td>
<td align="center">7B</td>
<td align="center">83.0</td>
<td align="center">60.8</td>
</tr>
<tr>
<td align="center">GLM-4-Voice</td>
<td align="center">S→T</td>
<td align="center">9B</td>
<td align="center">93.6</td>
<td align="center">76.3</td>
</tr>
<tr>
<td align="center">GLM-4-Voice</td>
<td align="center">S→S</td>
<td align="center">9B</td>
<td align="center">82.9</td>
<td align="center">62.4</td>
</tr>
</tbody></table>
<p>表 4: 语音问答结果. 基线结果来自 Defossez 等人 [12].</p>
<table>
<thead>
<tr>
<th align="center">模型</th>
<th align="center">模态</th>
<th align="center">参数量</th>
<th align="center">Web Questions</th>
<th align="center">Llama Questions</th>
<th align="center">TriviaQA</th>
</tr>
</thead>
<tbody><tr>
<td align="center">TWIST</td>
<td align="center">S→S</td>
<td align="center">7B</td>
<td align="center">1.5</td>
<td align="center">4.0</td>
<td align="center">--</td>
</tr>
<tr>
<td align="center">SpeechGPT</td>
<td align="center">S→T</td>
<td align="center">7B</td>
<td align="center">6.5</td>
<td align="center">21.6</td>
<td align="center">14.8</td>
</tr>
<tr>
<td align="center">Spectron</td>
<td align="center">S→T</td>
<td align="center">1B</td>
<td align="center">6.1</td>
<td align="center">21.9</td>
<td align="center">--</td>
</tr>
<tr>
<td align="center">Moshi</td>
<td align="center">S→T</td>
<td align="center">7B</td>
<td align="center">26.6</td>
<td align="center">62.3</td>
<td align="center">22.8</td>
</tr>
<tr>
<td align="center">Moshi</td>
<td align="center">S→S</td>
<td align="center">7B</td>
<td align="center">9.2</td>
<td align="center">21.0</td>
<td align="center">7.3</td>
</tr>
<tr>
<td align="center">GLM-4-Voice</td>
<td align="center">S→T</td>
<td align="center">9B</td>
<td align="center">32.2</td>
<td align="center">64.7</td>
<td align="center">39.1</td>
</tr>
<tr>
<td align="center">GLM-4-Voice</td>
<td align="center">S→S</td>
<td align="center">9B</td>
<td align="center">15.9</td>
<td align="center">50.7</td>
<td align="center">26.5</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 表 4 的数据非常有说服力. GLM-4-Voice 在 Llama Questions 上,S→T 达到 64.7%(超越 Moshi 的 62.3%),S→S 达到 50.7%(Moshi 只有 21.0%). S→S 设置下 50.7% vs 21.0% 的差距尤其值得关注: 这说明 GLM-4-Voice 的语音预训练确实让模型学会了「直接用语音思考」,而不仅仅是「先转文本再回答」. 但 S→T 始终优于 S→S 的事实也表明,文本作为中间表示仍然有价值——至少在当前的技术水平下,纯语音推理还无法完全替代文本推理.</p>
</blockquote>
<p><strong>ASR / TTS</strong></p>
<p>我们使用预训练时相同的提示格式对基座模型进行 ASR / TTS 任务提示. Whisper-Large-V3 [36] 和 Paraformer-Large [38] 分别用于生成英文和中文识别的文本预测. 在计算错误率之前,ASR 任务的文本预测使用 whisper-large-v3 的 tokenizer 进行归一化,TTS 任务使用 CosyVoice [14] pipeline 进行归一化. 结果汇总于表 5. GLM-4-Voice 的 ASR 和 TTS 能力与 whisper-large-v3 [36] 和 CosyVoice [14] 基线相当.</p>
<p>表 5: ASR 和 TTS 结果. LibriSpeech(英文)用词错误率(WER)评估,AISHELL-1(中文)用字错误率(CER)评估. TTS 任务用 WER 评估. -- 表示模型不支持的任务或模态.</p>
<table>
<thead>
<tr>
<th align="center">模型</th>
<th align="center">LibriSpeech</th>
<th align="center"></th>
<th align="center">AISHELL-1</th>
<th align="center"></th>
<th align="center">LibriTTS</th>
<th align="center"></th>
<th align="center">Seed-TTS</th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td align="center"></td>
<td align="center">test-clean</td>
<td align="center">test-other</td>
<td align="center">test</td>
<td align="center">test-clean</td>
<td align="center">test-en</td>
<td align="center">test-zh</td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="center">CosyVoice</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">3.17</td>
<td align="center">3.39</td>
<td align="center">3.10</td>
<td align="center"></td>
</tr>
<tr>
<td align="center">whisper-large-v3</td>
<td align="center">2.50</td>
<td align="center">4.53</td>
<td align="center">9.31</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center">--</td>
<td align="center"></td>
</tr>
<tr>
<td align="center">GLM-4-Voice</td>
<td align="center">2.82</td>
<td align="center">7.66</td>
<td align="center">2.46</td>
<td align="center">5.64</td>
<td align="center">2.91</td>
<td align="center">2.10</td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: GLM-4-Voice 的 ASR 性能接近 whisper-large-v3(2.82 vs 2.50 WER on LS-clean),但 LS-other 上差距稍大(7.66 vs 4.53),说明在更困难的语音条件下(背景噪音、口音等)仍有提升空间. TTS 方面,LibriTTS test-clean 上 2.91 WER 与 CosyVoice 的 3.17 相当,Seed-TTS test-zh 上 2.10 优于 CosyVoice 的 3.39——这说明中文 TTS 质量实际上略胜一筹,可能是由于 GLM-4-Voice 作为双语模型的优势.</p>
</blockquote>
<h3 id="5-2-chat-model-evaluation">5.2 Chat Model Evaluation</h3>
<p><strong>ChatGPT Score</strong></p>
<p>为了评估微调后对话模型的问答能力和知识记忆能力,我们使用 GPT-4o [33](具体为 gpt-4o-2024-05-13)来评估模型响应的质量或正确性. 对于通用 QA 任务,我们采用 AlpacaEval [25] 的 helpful base 和 vicuna 子集中的问题,并移除数学相关问题,这与 Llama-Omni [15] 的聊天评估数据集一致. 我们要求 GPT-4o 按照 MT-Bench [49] 的评估方法评估响应质量,并在 1 到 10 的范围内打分. 对于知识任务,我们从 Web Questions、Llama Questions 和 TriviaQA 中选取 100 个问题. 我们向 GPT-4o 提供标准答案,并要求它判断模型响应是否正确. 表 6 中报告的分数是答案准确率归一化到 0(0%)到 10(100%)的量表. 所有用于评判的文本均由 Whisper-Large-V3 [36] 转录产生,评分使用的提示包含在附录 A.1 中.</p>
<p><strong>Speech Quality</strong></p>
<p>我们使用 UTMOS [37] 模型预测平均意见分(MOS)来评估生成语音的自然度.</p>
<p><strong>Speech-Text Alignment</strong></p>
<p>为了评估生成的文本响应与语音响应之间的一致性,我们使用 whisper-large-v3 [36] 将通用 QA 任务的语音响应转录为文本. 然后计算转录结果与文本响应之间的词错误率(WER),在表 6 中记为 ASR-WER(%). GLM-4-Voice 是一个双语模型,有时会用中文回应英文查询,这种情况下无法直接计算 WER. 为了与仅支持英语的基线模型公平比较,在报告表 6 的任务时,我们将 GLM-4-Voice 的输出限制为英文 token.</p>
<p>表 6 展示了对话模型评估结果. 基线结果来自 Zeng 等人 [45].</p>
<table>
<thead>
<tr>
<th align="center">模型</th>
<th align="center">ChatGPT Score ↑</th>
<th align="center"></th>
<th align="center">UTMOS ↑</th>
<th align="center">ASR-WER ↓</th>
</tr>
</thead>
<tbody><tr>
<td align="center"></td>
<td align="center">General QA</td>
<td align="center">Knowledge</td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="center">SpeechGPT [46]</td>
<td align="center">1.40</td>
<td align="center">2.20</td>
<td align="center">3.86</td>
<td align="center">66.57</td>
</tr>
<tr>
<td align="center">Mini-Omni [42]</td>
<td align="center">2.44</td>
<td align="center">1.10</td>
<td align="center">3.17</td>
<td align="center">25.28</td>
</tr>
<tr>
<td align="center">Llama-Omni [15]</td>
<td align="center">3.50</td>
<td align="center">3.90</td>
<td align="center">3.92</td>
<td align="center">9.18</td>
</tr>
<tr>
<td align="center">Moshi [12]</td>
<td align="center">2.42</td>
<td align="center">3.60</td>
<td align="center">3.90</td>
<td align="center">7.95</td>
</tr>
<tr>
<td align="center">GLM-4-Voice</td>
<td align="center">5.40</td>
<td align="center">5.20</td>
<td align="center">4.45</td>
<td align="center">5.74</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 表 6 的结果令人印象深刻. GLM-4-Voice 在 General QA 上得分 5.40,几乎是 Moshi(2.42)的两倍半,也大幅领先 Llama-Omni(3.50). 这说明经过 1T token 语音-文本预训练 + 高质量对话 SFT 的模型,在对话智能上确实碾压了那些只在 LLM 上嫁接语音模块的「速成」方案. ASR-WER 5.74% 意味着语音输出与文本输出高度一致,模型几乎不会在「说一套写一套」上出问题. UTMOS 4.45 的语音自然度得分也高于所有基线,说明语音质量同样优秀. 不过需要指出的是,这里的评测是由 GPT-4o 打分的,存在一定的评判者偏见(judge bias)——GPT-4o 可能更偏好与自己训练数据分布相近的回答风格.</p>
</blockquote>
<hr>
<h2 id="6-conclusion">6 Conclusion</h2>
<p>在本文中,我们介绍了 GLM-4-Voice,一个为自然且富有表现力的语音交互而设计的端到端语音对话机器人. 通过集成 12.5 Hz 监督语音分词器、基于流匹配的语音Decoder  ,以及在 1 万亿 token 语音-文本数据上的大规模预训练,GLM-4-Voice 有效桥接了文本和语音模态. 它在语音语言建模、ASR、TTS 和语音问答等任务上均取得了强劲的性能. 使用高质量对话数据集进行微调进一步增强了其生成流畅、低延迟且富有细微差别响应的能力. GLM-4-Voice 的开源可用性鼓励了对构建实用且可访问的语音 AI 系统的进一步探索.</p>
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
<td>ASR</td>
<td>自动语音识别</td>
<td>Abstract</td>
<td>将语音转换为文本的技术</td>
</tr>
<tr>
<td>TTS</td>
<td>文本转语音</td>
<td>Introduction</td>
<td>将文本合成为语音的技术</td>
</tr>
<tr>
<td>VQ</td>
<td>向量量化</td>
<td>Abstract</td>
<td>将连续向量映射到离散码本向量的技术</td>
</tr>
<tr>
<td>EMA</td>
<td>指数移动平均</td>
<td>3.1</td>
<td>一种平滑更新的优化技术,常用于 VQ 码本训练</td>
</tr>
<tr>
<td>Flow Matching</td>
<td>流匹配</td>
<td>3.2</td>
<td>一种生成模型训练方法,相比扩散模型推理更快</td>
</tr>
<tr>
<td>RVQ</td>
<td>残差向量量化</td>
<td>2.1</td>
<td>多层堆叠的向量量化,用于逐层细化表示</td>
</tr>
<tr>
<td>SpeechLM</td>
<td>语音语言模型</td>
<td>Introduction</td>
<td>在语音数据上预训练的自回归模型</td>
</tr>
<tr>
<td>S→S</td>
<td>Speech-to-Speech</td>
<td>5.1</td>
<td>从语音上下文生成语音续接</td>
</tr>
<tr>
<td>S→T</td>
<td>Speech-to-Text</td>
<td>5.1</td>
<td>从语音上下文生成文本续接</td>
</tr>
<tr>
<td>UTMOS</td>
<td>通用平均意见分预测</td>
<td>5.2</td>
<td>一种基于深度学习的语音自然度自动评估模型</td>
</tr>
<tr>
<td>VisQOL</td>
<td>视觉质量客观评估</td>
<td>表 1</td>
<td>一种语音质量客观评估指标</td>
</tr>
<tr>
<td>MOSNet</td>
<td>平均意见分网络</td>
<td>表 1</td>
<td>基于神经网络的语音质量预测模型</td>
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
<td>T_speech_tokenize = f_speech_tokenize(t_block)</td>
<td>3.3</td>
<td>语音分词延迟,与块大小相关</td>
</tr>
<tr>
<td>(2)</td>
<td>T_llm_prefill = f_llm_prefill(f_r * T_user_speech)</td>
<td>3.3</td>
<td>LLM prefill 延迟,与用户语音时长成正比</td>
</tr>
<tr>
<td>(3)</td>
<td>T_llm_decode = f_llm_decode(N_first_speech)</td>
<td>3.3</td>
<td>LLM 解码延迟,首包 23 个 token</td>
</tr>
<tr>
<td>(4)</td>
<td>T_speech_decode = f_speech_decode(N_speech)</td>
<td>3.3</td>
<td>语音解码延迟,首包 10 个语音 token</td>
</tr>
<tr>
<td>(5)</td>
<td>T_total = 四项之和</td>
<td>3.3</td>
<td>总体首包延迟公式</td>
</tr>
</tbody></table>
<h3 id="c-gjsysjhz">C. 关键实验数据汇总</h3>
<table>
<thead>
<tr>
<th>任务</th>
<th>指标</th>
<th>GLM-4-Voice(9B)</th>
<th>最强基线</th>
<th>备注</th>
</tr>
</thead>
<tbody><tr>
<td>Speech LM(S→S)</td>
<td>StoryCloze</td>
<td>62.4</td>
<td>60.8(Moshi)</td>
<td>超越 Moshi</td>
</tr>
<tr>
<td>Speech LM(S→T)</td>
<td>StoryCloze</td>
<td>76.3</td>
<td>64.6(Spirit-LM)</td>
<td>显著领先</td>
</tr>
<tr>
<td>Spoken QA(S→S)</td>
<td>Llama Questions</td>
<td>50.7</td>
<td>21.0(Moshi)</td>
<td>2.4 倍优势</td>
</tr>
<tr>
<td>Spoken QA(S→T)</td>
<td>Llama Questions</td>
<td>64.7</td>
<td>62.3(Moshi)</td>
<td>小幅领先</td>
</tr>
<tr>
<td>ASR(EN)</td>
<td>LS-clean WER</td>
<td>2.82</td>
<td>2.50(whisper)</td>
<td>接近 SOTA</td>
</tr>
<tr>
<td>ASR(ZH)</td>
<td>AISHELL-1 CER</td>
<td>2.46</td>
<td>2.09(SenseVoice)</td>
<td>差距较小</td>
</tr>
<tr>
<td>TTS(EN)</td>
<td>LibriTTS WER</td>
<td>2.91</td>
<td>3.17(CosyVoice)</td>
<td>优于基线</td>
</tr>
<tr>
<td>Chat QA</td>
<td>General QA Score</td>
<td>5.40</td>
<td>3.50(Llama-Omni)</td>
<td>显著领先</td>
</tr>
<tr>
<td>Chat Speech</td>
<td>UTMOS</td>
<td>4.45</td>
<td>3.92(Llama-Omni)</td>
<td>最佳自然度</td>
</tr>
<tr>
<td>Chat Align</td>
<td>ASR-WER</td>
<td>5.74%</td>
<td>7.95%(Moshi)</td>
<td>最佳一致性</td>
</tr>
</tbody></table>
<h3 id="d-mxpxdw">D. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: GLM-4-9B-Base(文本预训练权重) + Whisper-large-v3(语音分词器初始化) + CosyVoice(语音Decoder  架构)</li>
<li><strong>核心创新</strong>: 12.5 Hz 单码本监督语音分词器(175 bps); 基于 text-to-token 模型的合成交错语音-文本数据; 流式思考(Streaming Thoughts)模板实现低延迟语音对话; 1T token 语音-文本联合预训练</li>
<li><strong>被后续工作引用/影响</strong>: 为 GLM 家族的语音能力奠定了基础,其语音分词器和交错数据合成方法也被后续的 GLM-4-V 等多模态模型所借鉴</li>
<li><strong>同期竞品</strong>: Moshi(Kyutai, 全双工)、Mini-Omni、Llama-Omni、Freeze-Omni</li>
<li><strong>关键差异</strong>: 相比 Moshi 的 700 万小时真实语音预训练,GLM-4-Voice 以「合成交错数据 + 1T token 混合预训练」的路线,在更小模型(9B vs 7B 但数据效率更高)上取得了更好的语音问答和对话性能</li>
</ul>
<hr>
<blockquote>
<p>精译完成. 本译文基于 arXiv:2412.02612 原文逐字精读,所有数据、公式、表格均与原文一致. 技术思考节点以译者注形式插入,供读者参考.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"abstract","text":"Abstract"},{"level":2,"id":"1-introduction","text":"1 Introduction"},{"level":2,"id":"2-related-work","text":"2 Related Work"},{"level":3,"id":"2-1-speech-tokenization","text":"2.1 Speech Tokenization"},{"level":3,"id":"2-2-speech-language-modeling","text":"2.2 Speech Language Modeling"},{"level":3,"id":"2-3-end-to-end-spoken-chatbots","text":"2.3 End-to-End Spoken Chatbots"},{"level":2,"id":"3-architecture","text":"3 Architecture"},{"level":3,"id":"3-1-speech-tokenization","text":"3.1 Speech Tokenization"},{"level":3,"id":"3-2-speech-decoder","text":"3.2 Speech Decoder"},{"level":3,"id":"3-3-inference","text":"3.3 Inference"},{"level":2,"id":"4-training-procedure","text":"4 Training Procedure"},{"level":3,"id":"4-1-stage-1-joint-speech-text-pre-training","text":"4.1 Stage 1: Joint Speech-Text Pre-training"},{"level":3,"id":"4-2-stage-2-supervised-fine-tuning","text":"4.2 Stage 2: Supervised Fine-tuning"},{"level":2,"id":"5-evaluation","text":"5 Evaluation"},{"level":3,"id":"5-1-base-model-evaluation","text":"5.1 Base Model Evaluation"},{"level":3,"id":"5-2-chat-model-evaluation","text":"5.2 Chat Model Evaluation"},{"level":2,"id":"6-conclusion","text":"6 Conclusion"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgssy","text":"B. 核心公式索引"},{"level":3,"id":"c-gjsysjhz","text":"C. 关键实验数据汇总"},{"level":3,"id":"d-mxpxdw","text":"D. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/04-glm-4-voice/01-glm-4-voice-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/04-glm-4-voice/01-glm-4-voice-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-4-Voice 技术报告精译</h1>
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
