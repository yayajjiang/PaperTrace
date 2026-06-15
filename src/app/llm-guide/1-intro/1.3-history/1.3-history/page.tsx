"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>1.3 · 发展历程与趋势展望: 从 Seq2Seq 到世界模型</h1>
<h2 id="1-wsmxyjsssj">1. 为什么需要技术史视角</h2>
<p>在深度学习领域，不理解历史的人往往会重复发明轮子，或者更糟——他们会把已经被证明无效的方向当成创新. 大模型技术的每一次重大跃迁，都不是孤立的天才灵光一闪，而是对上一代范式核心痛点的系统性回应.</p>
<p>理解技术演进脉络的价值在于:</p>
<p><strong>第一，建立「问题驱动」的思维模式.</strong> RNN 被 Transformer 取代，不是因为 Transformer 更酷，而是因为 RNN 的串行计算结构在 GPU 上无法并行，导致训练速度成为瓶颈. Transformer 的二次注意力复杂度又被线性注意力机制所挑战，因为长上下文需求在真实业务中真实存在. 每一代技术都是为了解决上一代在<strong>特定约束</strong>下的失效问题.</p>
<p><strong>第二，识别真正的范式转移 vs. 渐进改进.</strong> 预训练-微调范式的确立(BERT/GPT-1)是范式转移; 从 GPT-3 到 GPT-4 主要是规模扩展加多模态，属于渐进改进; 而 o1 引入的测试时计算扩展(Test-Time Scaling)则可能是新的范式转移. 区分这两者，对于技术投资和研发优先级判断至关重要.</p>
<p><strong>第三，预判未来的技术方向.</strong> 历史不会简单重复，但历史的驱动力会. 理解过去十年推动技术演进的核心动力(算力增长、数据规模、算法效率)，能帮助你判断下一个十年哪些方向值得押注.</p>
<p>本节将从 2014 年的 Seq2Seq 讲起，穿越 RNN/LSTM 的黄昏、Transformer 的黎明、GPT 系列的崛起、BERT 的辉煌、国内模型的追赶，一直延伸到 2026 年的技术前沿. 最后，我们将基于当前的技术信号，对五个关键趋势做出有理有据的展望.</p>
<h2 id="2-q-transformer-sd-rnn-y-lstm-dyc">2. 前 Transformer 时代: RNN 与 LSTM 的遗产</h2>
<h3 id="2-1-seq2-seq-ysjjqfydqm">2.1 Seq2Seq 与神经机器翻译的启蒙</h3>
<p>2014 年，Google Brain 团队的论文「Sequence to Sequence Learning with Neural Networks」开启了神经网络处理序列数据的新纪元. Seq2Seq 架构由两个 RNN 组成: 一个Encoder (Encoder)将输入序列压缩成一个固定长度的上下文向量(Context Vector)，一个Decoder  (Decoder)基于这个向量逐步生成输出序列.</p>
<p>这一架构在机器翻译任务上取得了突破性进展，迅速取代了基于统计方法的 SMT(Statistical Machine Translation). 但 Seq2Seq 有一个致命缺陷: <strong>信息瓶颈</strong>. 无论输入序列多长，Encoder 都必须把它压缩成一个固定维度的向量. 当处理长句时，靠前的信息会在压缩过程中被稀释甚至丢失.</p>
<h3 id="2-2-zyljzdyy">2.2 注意力机制的预演</h3>
<p>为了解决信息瓶颈，Dzmitry Bahdanau 等人在 2015 年提出了「神经机器翻译中的注意力机制」. 核心思想很简单: Decoder  在生成每个输出词时，不应该只盯着那个固定的上下文向量，而应该「回头看」输入序列的所有位置，并为每个位置分配不同的注意力权重.</p>
<p>这一机制显著提升了长句翻译的质量，但它仍然是 RNN 的附庸——注意力计算发生在 RNN 的隐藏状态之上，模型的基本计算单元仍然是串行的.</p>
<h3 id="2-3-lstm-ytdgsgl">2.3 LSTM 与梯度高速公路</h3>
<p>RNN 的串行结构带来了另一个更深层的问题: <strong>梯度消失与梯度爆炸</strong>. 在反向传播时，误差信号需要穿过整个时间步链. 当序列较长时，梯度会指数级衰减(消失)或膨胀(爆炸)，导致模型无法学习到长距离依赖关系.</p>
<p>LSTM(Long Short-Term Memory，1997 年由 Hochreiter 和 Schmidhuber 提出，2010 年代被重新发现)通过引入门控机制(输入门、遗忘门、输出门)和细胞状态(Cell State)，为梯度流动构建了一条「高速公路」，极大缓解了梯度消失问题. GRU(Gated Recurrent Unit)则是 LSTM 的简化版，用更少的参数达到了相近的效果.</p>
<p>LSTM 在 2014-2017 年间统治了 NLP 领域. 但它始终无法摆脱一个根本性的物理约束: <strong>序列计算</strong>. 在第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi></mrow><annotation encoding="application/x-tex">t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6151em;"></span><span class="mord mathnormal">t</span></span></span></span> 步的计算完成之前，第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">t+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6984em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 步无法开始. 这意味着无论你的 GPU 有多少个 CUDA core，RNN/LSTM 都只能使用其中一个时间步对应的计算单元，其余全部闲置.</p>
<p>在 ImageNet 上，CNN 已经展示了数据并行训练的巨大威力——一个 batch 的图像可以被同时处理. NLP 领域迫切需要一种能够打破序列依赖、实现完全并行的架构.</p>
<h2 id="3-transformer-gm-bhdsl">3. Transformer 革命: 并行的胜利</h2>
<h3 id="3-1-attention-is-all-you-need">3.1 Attention Is All You Need</h3>
<p>2017 年 6 月，Google 的机器翻译团队在 arXiv 上发布了一篇后来被引用超过十万次的论文. 这篇论文的标题极其嚣张——「Attention Is All You Need」——它宣称你不需要 RNN，不需要 CNN，只需要注意力机制，就能做出最好的序列到序列模型.</p>
<p>Transformer 的核心创新可以概括为三点:</p>
<p><strong>第一，自注意力机制(Self-Attention)</strong> . 在 RNN 中，每个位置的信息只能通过隐藏状态间接地影响其他位置. 在自注意力中，任意两个位置之间的交互通过一个直接的注意力权重实现，计算路径长度恒为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mn>1</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(1)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord">1</span><span class="mclose">)</span></span></span></span>. 这彻底改变了信息流动的拓扑结构.</p>
<p><strong>第二，多头注意力(Multi-Head Attention)</strong> . 将输入的表征空间投影到多个子空间，在每个子空间中独立计算注意力，然后将结果拼接. 这相当于让模型从多个「视角」同时观察输入序列，捕捉不同类型的依赖关系(如句法关系、语义关系、指代关系).</p>
<p><strong>第三，完全并行化</strong>. 自注意力的计算只涉及矩阵乘法，没有循环依赖. 这意味着整个序列可以被打包成一个矩阵，在 GPU 上一次性完成计算. 训练速度相比 LSTM 提升了数十倍甚至上百倍.</p>
<p>Transformer 的代价是<strong>二次复杂度</strong>: 自注意力的计算量和内存占用随序列长度呈 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 增长. 但在 2017 年，主流 NLP 任务的序列长度很少超过 512，这个代价完全在可接受范围内. 更重要的是，并行化带来的训练加速，使得用更大的数据和更长的训练时间换取更好模型成为可能.</p>
<h3 id="3-2-wzbm-gwxdzylfysx">3.2 位置编码: 给无序的注意力赋予顺序</h3>
<p>自注意力有一个隐含的假设: 输入序列的位置信息对计算没有本质影响. 无论你把词放在第 1 位还是第 100 位，注意力权重的计算方式是一样的. 但语言可以看出是有顺序的——「狗咬人」和「人咬狗」含义完全不同.</p>
<p>Transformer 通过<strong>位置编码(Positional Encoding)</strong> 解决这个问题. 原始论文使用正弦/余弦函数生成位置向量，将其与词嵌入相加. 后续研究提出了可学习的位置编码、相对位置编码(Relative PE)、旋转位置编码(RoPE)等改进方案. 位置编码的演化史，本质上是一部「如何在并行计算中保留顺序信息」的探索史.</p>
<h3 id="3-3-ccljycgyh-sdwldwdq">3.3 残差连接与层归一化: 深度网络的稳定器</h3>
<p>Transformer 堆叠了 6-12 个相同的层. 训练如此深的网络需要稳定的梯度流. 残差连接(Residual Connection)让每一层的输入可以直接绕过该层到达输出，避免了梯度在深层网络中消失. 层归一化(Layer Normalization)则稳定了每层的输入分布，使得学习率可以设得更大，训练速度更快.</p>
<p>这些组件并非 Transformer 原创(残差来自 ResNet，层归一化来自 2016 年的独立研究)，但 Transformer 将它们与自注意力组合在一起，构成了一个极其稳定且可扩展的基础架构. 这个架构的「扩展性」——即增加层数和宽度能持续带来性能提升——是它后来统治大模型领域的根本原因.</p>
<h2 id="4-yxlfsdszx-gpt-y-bert">4. 预训练范式的双子星: GPT 与 BERT</h2>
<p>Transformer 解决了「如何高效训练」的问题，但没有回答「训练目标是什么」. 2018 年，OpenAI 和 Google 分别给出了两个截然不同的答案，它们共同定义了此后六年的 NLP 技术格局.</p>
<h3 id="4-1-gpt-1-scsyxldxy">4.1 GPT-1: 生成式预训练的宣言</h3>
<p>2018 年 6 月，OpenAI 发布 GPT(Generative Pre-Training). 它的方法出奇地简单:</p>
<ol>
<li><strong>预训练阶段</strong>: 在一个巨大的无标注文本语料上，用自回归语言建模目标(Autoregressive Language Modeling)训练 Transformer Decoder  . 即，给定前面的所有词，预测下一个词. <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>P</mi><mo stretchy="false">(</mo><msub><mi>w</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>w</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>w</mi><mn>2</mn></msub><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msub><mi>w</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">P(w_t | w_1, w_2, ..., w_{t-1})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>.</li>
<li><strong>微调阶段</strong>: 在特定下游任务(情感分类、问答、文本蕴含)的有标注数据上，用一个轻量级的任务特定输出层进行微调.</li>
</ol>
<p>GPT-1 只有 1.17 亿参数，在当时的 benchmark 上并没有碾压所有对手. 但它验证了一个极其重要的假设: <strong>无监督预训练 + 有监督微调</strong>的范式，可以将在大规模语料中学到的通用语言表示迁移到各种下游任务上.</p>
<h3 id="4-2-bert-sxljdwz">4.2 BERT: 双向理解的王者</h3>
<p>2018 年 10 月，Google 发布 BERT(Bidirectional Encoder Representations from Transformers). BERT 采用了与 GPT 完全不同的预训练目标:</p>
<ol>
<li><strong>掩码语言建模(MLM, Masked Language Modeling)</strong> : 随机遮蔽输入序列中 15% 的 token，让模型根据上下文预测被遮蔽的词. 这使得模型能够同时利用左侧和右侧的上下文信息——即「双向」理解.</li>
<li><strong>下一句预测(NSP, Next Sentence Prediction)</strong> : 判断句子 B 是否是句子 A 的真实下一句. 这个任务旨在让模型学习句子级别的关系.</li>
</ol>
<p>BERT 在发布时横扫了 11 项 NLP benchmark，在 GLUE、SQuAD 等核心任务上刷新了记录. 它的成功证明了两件事: 第一，双向上下文对于语言理解至关重要; 第二，预训练-微调的范式具有惊人的通用性.</p>
<h3 id="4-3-gpt-2-gmjzy">4.3 GPT-2: 规模即正义</h3>
<p>2019 年 2 月，OpenAI 发布了 GPT-2. 参数规模从 GPT-1 的 1.17 亿增长到 15 亿——一个数量级的提升. 更重要的是，OpenAI 发现: 当模型足够大、数据足够多时，它展现出了<strong>零样本能力(Zero-Shot Capability)</strong> . 即，无需在下游任务上微调，仅仅通过给模型一个任务描述(prompt)，它就能生成合理的答案.</p>
<p>GPT-2 的发布在当时引发了争议. OpenAI 最初以「模型可能被滥用生成假新闻」为由，分阶段释放模型权重. 今天回头看，这更像是精心策划的 PR 策略——它成功地将「大模型的潜在威力」植入了公众认知.</p>
<h3 id="4-4-gpt-3-yxnldsg">4.4 GPT-3: 涌现能力的曙光</h3>
<p>2020 年 5 月，OpenAI 发布了 GPT-3，参数规模达到 1750 亿——比 GPT-2 又提升了两个数量级. GPT-3 的论文标题「Language Models are Few-Shot Learners」宣告了一个新时代的来临.</p>
<p>GPT-3 展示了多个里程碑式的现象:</p>
<ul>
<li><strong>少样本学习(Few-Shot Learning)</strong> : 在 prompt 中给出几个示例，模型就能理解任务模式并给出高质量回答;</li>
<li><strong>涌现能力(Emergent Abilities)</strong> : 某些能力(如算术、代码生成、跨语言翻译)在模型规模达到某个阈值之前完全不存在，一旦跨过阈值就突然出现;</li>
<li><strong>上下文学习(In-Context Learning)</strong> : 模型不需要更新参数，仅仅通过阅读 prompt 中的信息就能「学习」新任务.</li>
</ul>
<p>GPT-3 还验证了一个后来被命名为「Scaling Law」的经验规律: 模型性能随计算量、参数规模和数据量呈幂律增长. 这个发现为后续「越大越好」的训练哲学提供了理论依据.</p>
<h3 id="4-5-t5-y-ul2-tykjdts">4.5 T5 与 UL2: 统一框架的探索</h3>
<p>在 GPT 和 BERT 的双峰并立之际，Google 提出了另一种思路: 能否用一个统一的框架同时处理理解和生成任务？</p>
<p>T5(Text-to-Text Transfer Transformer, 2019)将所有 NLP 任务都转化为「文本到文本」的格式. 无论是分类、翻译、摘要还是问答，输入和输出都是文本字符串. 这种统一框架极大地简化了多任务学习的工程实现.</p>
<p>UL2(Unifying Language Learning Paradigms, 2022)则更进一步，提出了「去噪器混合」(Mixture of Denoisers)的统一预训练目标，试图将自回归生成(GPT 风格)和双向理解(BERT 风格)纳入同一个框架. 这些工作虽然未像 GPT-3 那样引发公众轰动，但在学术界和工业界的多任务系统中产生了深远影响.</p>
<h2 id="5-gpt-xldcxjh-cltdtl">5. GPT 系列的持续进化: 从聊天到推理</h2>
<h3 id="5-1-instruct-gpt-y-rlhf-dqjsdds">5.1 InstructGPT 与 RLHF: 对齐技术的诞生</h3>
<p>GPT-3 是一个强大的文本生成器，但它不是一个好用的助手. 它可能会生成有害内容、编造事实、或者用一种令人不适的语气回答问题. 2022 年 3 月，OpenAI 发布了 InstructGPT，首次系统性地展示了<strong>基于人类反馈的强化学习(RLHF)</strong> 如何将一个「会说话的模型」转化为「听话的助手」.</p>
<p>RLHF 的核心 pipeline 包含三步:</p>
<ol>
<li><strong>SFT(Supervised Fine-Tuning)</strong> : 在人类标注的指令-回答对上进行监督微调，让模型学会遵循指令的基本格式;</li>
<li><strong>Reward Model 训练</strong>: 让人类标注者对模型的多个回答进行排序，训练一个能预测人类偏好的奖励模型;</li>
<li><strong>PPO 强化学习</strong>: 使用 PPO 算法，以奖励模型的打分为优化目标，进一步微调策略模型，同时用 KL 散度约束防止模型偏离太远.</li>
</ol>
<p>RLHF 的引入标志着大模型研发的重点从「提升语言能力」转向「控制模型行为」. 这一技术后来成为 ChatGPT 体验远超 GPT-3 的核心原因.</p>
<h3 id="5-2-chat-gpt-dzscdybd">5.2 ChatGPT: 大众市场的引爆点</h3>
<p>2022 年 11 月 30 日，OpenAI 发布了 ChatGPT——一个基于 GPT-3.5 进行对话优化的产品. 它采用了与 InstructGPT 相同的 RLHF pipeline，但针对对话场景进行了大量工程优化(如多轮上下文管理、安全过滤、拒绝策略).</p>
<p>ChatGPT 的用户增长速度史无前例: 五天破百万，两个月破亿. 它让全世界第一次直观地感受到大模型的威力——不是通过学术论文，而是通过一次流畅、有用、甚至充满惊喜的对话体验.</p>
<h3 id="5-3-gpt-4-dmtykkx">5.3 GPT-4: 多模态与可靠性</h3>
<p>2023 年 3 月，OpenAI 发布了 GPT-4. 官方技术报告刻意隐去了模型规模、架构细节和训练数据等关键信息，但披露了以下几个重要事实:</p>
<ul>
<li><strong>多模态输入</strong>: GPT-4 能够接受文本和图像作为输入，在图文理解任务上表现卓越;</li>
<li><strong>可靠性提升</strong>: 在模拟律师资格考试中，GPT-4 得分位于前 10%，而 GPT-3.5 仅位于后 10%;</li>
<li><strong>可操纵性</strong>: 通过系统消息(System Message)，用户可以更精细地控制模型的行为风格、角色和约束.</li>
</ul>
<p>GPT-4 的发布确立了闭源大模型的领先地位，同时也加剧了开源社区对「可媲美 GPT-4 的开源模型」的渴望.</p>
<h3 id="5-4-gpt-4o-ysdmtyssjh">5.4 GPT-4o: 原生多模态与实时交互</h3>
<p>2024 年 5 月，OpenAI 发布 GPT-4o(「o」代表 Omni，即「全能」). 这是第一个真正意义上「原生多模态」的 GPT 模型——文本、音频、图像的输入和输出都由同一个神经网络处理，而非拼接多个独立模块.</p>
<p>GPT-4o 最引人注目的特性是<strong>实时语音交互</strong>. 用户可以与模型进行接近人类对话延迟的语音交流，模型能够理解语气、停顿、背景噪音，甚至能「感知」用户的情绪. 这预示着人机交互正在从「打字聊天」向「自然对话」进化.</p>
<h3 id="5-5-o1-cssjskzymsk">5.5 o1: 测试时计算扩展与慢思考</h3>
<p>2024 年 9 月，OpenAI 发布了 o1-preview，随后又发布了正式版 o1. 这标志着大模型领域一个潜在的<strong>范式转移</strong>: 从「在训练时堆砌更多算力和数据」，转向「在推理时让模型花更多时间思考」.</p>
<p>o1 的核心创新在于<strong>测试时计算扩展(Test-Time Scaling)</strong> . 传统的 GPT-4 在回答问题时几乎瞬间生成结果，而 o1 会在内部生成一条长长的思维链(Chain-of-Thought)，反复自我质疑、验证、修正，最终才输出答案. 这个过程可能需要几十秒甚至几分钟，但换来的是在数学竞赛(AIME)、代码竞赛(Codeforces)和科学推理任务上的质的飞跃.</p>
<p>o1 的存在证明了一个重要命题: **模型的智能不仅取决于训练时的参数规模，还取决于推理时的计算预算. ** 这为那些在训练阶段无法与巨头比拼算力的团队提供了一条替代路径——通过更聪明的推理策略来换取性能提升.</p>
<h2 id="6-gndmx-czgzdbpz">6. 国内大模型: 从追赶者到并跑者</h2>
<p>中国的大模型发展虽然起步略晚于美国，但凭借庞大的工程师群体、丰富的中文语料和强烈的政策驱动，迅速从「追赶」走向了「并跑」，在某些细分方向上甚至实现了「领跑」.</p>
<h3 id="6-1-wxyy-zzdcphcs">6.1 文心一言: 最早的产品化尝试</h3>
<p>百度是国内最早布局大模型的科技巨头. 2019 年发布的 Ernie 1.0 就尝试了知识增强预训练，将知识图谱的结构化信息融入语言模型. 2023 年 3 月，百度率先发布文心一言(ERNIE Bot)，成为国内第一个正式对公众开放的大模型对话产品.</p>
<p>文心一言的优势在于与百度搜索、百度文库、百度地图等产品的深度整合. 用户可以直接让模型基于搜索结果生成回答，或调用地图 API 规划路线. 这种「模型即平台」的思路，体现了百度独特的生态位.</p>
<h3 id="6-2-tyqw-kystdylz">6.2 通义千问: 开源生态的引领者</h3>
<p>阿里巴巴的通义千问(Qwen)系列是国内开源生态最活跃的大模型家族. 从 Qwen-7B/14B 到 Qwen2.5、Qwen3，阿里持续发布覆盖全尺寸谱系的开源模型，并在多项国际 benchmark 上超越同规模竞品.</p>
<p>Qwen 的技术特色包括:</p>
<ul>
<li><strong>多语言能力强</strong>: 训练数据中有大量非英语语料，在阿拉伯语、法语、日语等语言上的表现优于多数开源模型;</li>
<li><strong>代码能力突出</strong>: CodeQwen 系列在 HumanEval 等代码 benchmark 上长期处于开源模型的第一梯队;</li>
<li><strong>后训练投入深</strong>: Qwen3 的技术报告显示，阿里在 RLHF 和 DPO 阶段使用了极其精细的数据筛选和训练策略.</li>
</ul>
<h3 id="6-3-xh-czcjdsgz">6.3 星火: 垂直场景的深耕者</h3>
<p>科大讯飞的星火大模型选择了一条差异化路径: 深度整合到教育、医疗、办公等垂直场景中. 讯飞在语音识别和合成领域有二十余年的积累，这使得星火在多模态交互(语音输入、语音输出)上有独特优势.</p>
<h3 id="6-4-chat-glm-xsjyygch">6.4 ChatGLM: 学术基因与国产化</h3>
<p>智谱 AI 的 ChatGLM 系列源自清华 KEG 实验室的 GLM 架构. GLM 的核心创新是「自回归填空」——它用统一的自回归目标来处理双向理解和单向生成，试图弥合 BERT 和 GPT 之间的分裂.</p>
<p>ChatGLM 在国产化适配上有积极布局，支持昇腾、寒武纪等国产 AI 芯片的训练和推理. 这在国内「自主可控」的政策环境下是一个重要优势.</p>
<h3 id="6-5-kimi-csxwdbg">6.5 Kimi: 长上下文的标杆</h3>
<p>月之暗面的 Kimi 以「超长上下文」作为核心差异化卖点. 2024 年初，Kimi 率先在国内实现了 200 万字无损上下文的支持，随后 Claude 3 才跟进到 200K tokens. 长上下文的背后是一系列技术创新: 改进的位置编码外推策略、上下文压缩算法、以及高效的推理基础设施.</p>
<p>Kimi 的产品形态更偏向个人知识管理和文档处理，与 ChatGPT 的通用对话定位形成差异.</p>
<h3 id="6-6-deep-seek-xsgmddfz">6.6 DeepSeek: 效率革命的颠覆者</h3>
<p>DeepSeek 可能是 2024-2025 年全球大模型领域最具影响力的名字. 这家源自中国量化私募幻方量化的研究机构，用一系列工程创新证明了「大模型训练不一定需要天价预算」.</p>
<p>DeepSeek-V2(2024 年 5 月)引入了 <strong>MLA(Multi-head Latent Attention)</strong> ，通过低秩压缩将 KV cache 的显存占用降低到传统多头注意力的几分之一. 这一创新直接影响了后续 Qwen、LLaMA 等模型在注意力机制上的设计选择.</p>
<p>DeepSeek-V3(2024 年 12 月)以仅 557.6 万美元的训练成本(使用 2048 张 H800 训练约 55 天)，在多项 benchmark 上达到了与 GPT-4o 和 Claude 3.5 Sonnet 相近的水平. 其关键技术包括 aux-loss-free 负载均衡的 MoE、FP8 混合精度训练、以及极致的流水线并行优化.</p>
<p>DeepSeek-R1(2025 年 1 月)则在推理能力上逼近 OpenAI o1，且完全开源. R1 展示了通过大规模强化学习(GRPO 算法)和自举式数据生成(Self-Bootstrapping)，模型可以在没有人类标注思维链的情况下，自主发展出复杂的推理策略.</p>
<p>DeepSeek 的成功对全球 AI 产业产生了深远冲击: 它证明了通过极致的工程优化和算法创新，中小团队也能训练出世界一流的模型. 这在一定程度上打破了「只有科技巨头才能做大模型」的迷信.</p>
<h2 id="7-wlqszw">7. 未来趋势展望</h2>
<p>基于当前的技术信号和产业动态，我们认为以下五个方向将在未来三到五年内定义大模型技术的演进主线.</p>
<h3 id="7-1-tlnl-ckskdmsk">7.1 推理能力: 从快思考到慢思考</h3>
<p>o1 和 DeepSeek-R1 已经证明，<strong>测试时计算扩展</strong>是一条与「扩大模型规模」并行的有效路径. 未来的模型将不再是「一问一答」的即时反应器，而是具备「慢思考」能力的推理系统.</p>
<p>这种「慢思考」可能包括:</p>
<ul>
<li><strong>自我验证(Self-Verification)</strong> : 模型在输出最终答案前，主动检查中间步骤的正确性;</li>
<li><strong>多路径探索(Multi-Path Exploration)</strong> : 同时生成多个候选推理路径，评估每条路径的可靠性，选择最优解;</li>
<li><strong>工具辅助推理(Tool-Augmented Reasoning)</strong> : 在推理过程中主动调用计算器、搜索引擎、代码执行器来验证假设;</li>
<li><strong>元认知(Metacognition)</strong> : 模型能够评估自己对某个问题的把握程度，在不确定时主动说「我不知道」或请求更多信息.</li>
</ul>
<p>这一趋势对计算架构提出了新要求: 推理不再是一次性的前向传播，而是一个可能需要多轮交互、动态扩展计算图的复杂过程. 这将为推理基础设施(如 vLLM、SGLang 等框架)带来新的设计空间.</p>
<h3 id="7-2-dmtysrh-cpjzxty">7.2 多模态原生融合: 从拼接走向统一</h3>
<p>当前的多模态大模型大多采用「拼接式」架构: 一个视觉Encoder  + 一个投影层 + 一个语言模型. 这种方式的局限在于，视觉和语言信息只在浅层对齐，模型无法真正理解「一个红色球从桌子上滚下来」所蕴含的物理过程.</p>
<p><strong>原生多模态融合</strong>是指从预训练阶段起，就在同一个架构中统一处理文本、图像、音频、视频甚至 3D 点云信号. GPT-4o 和 Gemini 已经在这条路上迈出了重要一步，但距离真正的「跨模态深层推理」还有距离.</p>
<p>未来的关键突破可能来自:</p>
<ul>
<li><strong>统一的 token 表示</strong>: 将所有模态的数据转化为同一种离散 token(如 Google 的 VideoPoet 将视频转化为离散 token)，从而复用自回归语言建模的全部技术栈;</li>
<li><strong>世界模型(World Model)</strong> : 不仅能理解多模态输入，还能在内部构建对物理世界的因果模型，预测动作的后果. 这是具身智能(Embodied AI)和自动驾驶等场景的核心需求.</li>
</ul>
<h3 id="7-3-dcbs-ai-dmzh">7.3 端侧部署: AI 的民主化</h3>
<p>目前最强大的大模型仍然依赖云端 GPU 集群运行，这带来了延迟、隐私和成本三重约束. 端侧部署——在手机、PC、汽车甚至 IoT 设备上运行大模型——正在从「不可能」走向「可行」.</p>
<p>推动这一趋势的技术包括:</p>
<ul>
<li><strong>模型压缩</strong>: 知识蒸馏(用云端大模型训练端侧小模型)、剪枝(移除不重要的权重)、量化(INT4/INT2 甚至二进制表示);</li>
<li><strong>高效架构</strong>: 为端侧设计的轻量级架构(如 MobileLLM、Gemma 2B/4B、Phi 系列)，在保持较小参数量的同时最大化每参数的信息密度;</li>
<li><strong>专用芯片</strong>: Apple Neural Engine、高通 Hexagon、联发科 NPU 等端侧 AI 加速器的算力正在快速提升;</li>
<li><strong>推理优化</strong>: 动态推理(根据输入难度调整计算深度)、投机采样(用草稿模型加速主模型)、以及针对端侧内存限制的 KV cache 管理策略.</li>
</ul>
<p>端侧 AI 的成熟将带来应用场景的爆发: 离线可用的智能助手、保护隐私的个人知识管理、实时响应的车载语音交互、低延迟的 AR/VR 内容生成.</p>
<h3 id="7-4-agent-czxt-cgjdst">7.4 Agent 操作系统: 从工具到生态</h3>
<p>当前的 Agent 大多是为特定任务设计的孤立系统——一个客服 Agent、一个编程 Agent、一个数据分析 Agent. 未来的趋势是向<strong>通用 Agent 平台</strong>和<strong>Agent 操作系统</strong>演进.</p>
<p>一个 Agent 操作系统应该具备:</p>
<ul>
<li><strong>任务调度</strong>: 将用户的高层次目标拆解为子任务，分配给不同的专业 Agent;</li>
<li><strong>资源管理</strong>: 管理计算资源、工具访问权限、API 配额，确保系统在高负载下稳定运行;</li>
<li><strong>记忆与状态</strong>: 维护跨会话的长期记忆，管理多 Agent 之间的共享状态;</li>
<li><strong>错误恢复</strong>: 当某个 Agent 失败时，自动重试、回滚或调用备用方案;</li>
<li><strong>安全隔离</strong>: 确保不同 Agent 之间的操作不会互相干扰，防止恶意工具调用.</li>
</ul>
<p>这类似于从「单个应用程序」到「操作系统 + 应用程序生态」的跃迁. AutoGen、LangGraph、OpenAI 的 Assistant API 都在向这个方向探索，但距离成熟的多 Agent 协作操作系统还有相当距离.</p>
<h3 id="7-5-sjmx-cyymndwlmn">7.5 世界模型: 从语言模拟到物理模拟</h3>
<p>世界模型(World Model)是 Yann LeCun 等研究者长期倡导的愿景: AI 系统不仅能处理符号和语言，还能在内部构建对物理世界的因果理解，预测行动的 consequences，并基于此进行规划和决策.</p>
<p>Sora 的发布(2024 年 2 月)让世界模型的讨论再度升温. Sora 能够根据文本描述生成长达一分钟的连贯视频，这暗示它可能学到了某种关于物理规律(重力、碰撞、流体动力学)的隐式表示. 但学术界对 Sora 是否真正具备「物理理解」仍有激烈争议——它可能只是记住了训练数据中的统计模式，而非理解了背后的因果机制.</p>
<p>真正的世界模型需要解决:</p>
<ul>
<li><strong>因果推理</strong>: 区分相关性(Correlation)和因果性(Causation);</li>
<li><strong>组合泛化</strong>: 将已知的物理规则组合应用到全新的场景中;</li>
<li><strong>反事实推理</strong>: 回答「如果当时我做了不同的选择，结果会怎样」这类问题;</li>
<li><strong>持续学习</strong>: 在与物理世界的交互中不断更新和修正内部模型.</li>
</ul>
<p>世界模型被认为是通往通用人工智能(AGI)的关键一步，因为它将 AI 的能力从「处理信息」扩展到「理解并作用于世界」.</p>
<h2 id="8-zj">8. 总结</h2>
<p>从 2014 年 Seq2Seq 开启神经机器翻译的新纪元，到 2017 年 Transformer 用并行计算打破 RNN 的序列诅咒，再到 2020 年 GPT-3 展示涌现能力、2022 年 ChatGPT 点燃大众热情、2024 年 o1 开启测试时计算扩展的新范式——大模型技术在短短十年间经历了数次范式跃迁.</p>
<p>国内模型的发展轨迹同样令人瞩目: 从文心一言的率先产品化，到通义千问的开源引领，再到 DeepSeek 以极致工程效率挑战全球巨头，中国的大模型产业已经从「跟随者」成长为「并跑者」甚至「领跑者」.</p>
<p>展望未来，五个技术方向将定义下一个十年的竞争格局: <strong>推理能力的慢思考化</strong>将改变我们对模型智能的定义; <strong>多模态原生融合</strong>将打破感官边界; <strong>端侧部署</strong>将让 AI 触达每一个人; <strong>Agent 操作系统</strong>将重塑软件的生产方式; <strong>世界模型</strong>将为通用人工智能铺设最后的基石.</p>
<p>作为这个时代的从业者，我们既是历史的见证者，也是历史的塑造者. 理解过去，是为了更好地创造未来.</p>
<p><img src="/llm-guide/1-intro/1.3-history/1.3-history/images/llm_evolution_timeline.png" alt="大模型技术演进时间轴"></p>
<blockquote>
<p><strong>图 1.2 大模型技术演进与范式转移时间轴(2014 - 2026+)</strong></p>
<ul>
<li><strong>RNN/LSTM 时代(灰色虚线)</strong>：从 2014 年 Seq2Seq 起步，2015 - 2016 年达到顶峰，2017 年后随着 Transformer 的出现迅速被替代. </li>
<li><strong>Transformer &amp; GPT 系列(蓝色实线)</strong>：自 2017 年 Attention 起步，经历 GPT-1/2/3 的量变到质变，在 2022 年底(ChatGPT)迎来爆发，目前在云端大模型和通用智能中占据绝对主导地位. </li>
<li><strong>BERT 及双向理解家族(绿色实线)</strong>：自 2018 年 BERT 发布，在 2019 - 2020 年因微调范式的易用性极度繁荣，但随后在生成式大模型趋势下逐步淡出主流视野. </li>
<li><strong>国内大模型(红色实线)</strong>：自 2019 年百度的早期 Ernie 探索，到 2023 年“百模大战”快速拉升，并在 2024 - 2026 年(以 Qwen 系列、DeepSeek 为代表)成功追平并部分领跑全球开源生态. </li>
<li><strong>测试时计算扩展分支(紫色点线)</strong>：在 2024 年底由 OpenAI o1 和 DeepSeek-R1 开启，模型在推理时分配更多计算预算进行“慢思考”，成为推理能力演进的新分叉点.</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wsmxyjsssj","text":"1. 为什么需要技术史视角"},{"level":2,"id":"2-q-transformer-sd-rnn-y-lstm-dyc","text":"2. 前 Transformer 时代: RNN 与 LSTM 的遗产"},{"level":3,"id":"2-1-seq2-seq-ysjjqfydqm","text":"2.1 Seq2Seq 与神经机器翻译的启蒙"},{"level":3,"id":"2-2-zyljzdyy","text":"2.2 注意力机制的预演"},{"level":3,"id":"2-3-lstm-ytdgsgl","text":"2.3 LSTM 与梯度高速公路"},{"level":2,"id":"3-transformer-gm-bhdsl","text":"3. Transformer 革命: 并行的胜利"},{"level":3,"id":"3-1-attention-is-all-you-need","text":"3.1 Attention Is All You Need"},{"level":3,"id":"3-2-wzbm-gwxdzylfysx","text":"3.2 位置编码: 给无序的注意力赋予顺序"},{"level":3,"id":"3-3-ccljycgyh-sdwldwdq","text":"3.3 残差连接与层归一化: 深度网络的稳定器"},{"level":2,"id":"4-yxlfsdszx-gpt-y-bert","text":"4. 预训练范式的双子星: GPT 与 BERT"},{"level":3,"id":"4-1-gpt-1-scsyxldxy","text":"4.1 GPT-1: 生成式预训练的宣言"},{"level":3,"id":"4-2-bert-sxljdwz","text":"4.2 BERT: 双向理解的王者"},{"level":3,"id":"4-3-gpt-2-gmjzy","text":"4.3 GPT-2: 规模即正义"},{"level":3,"id":"4-4-gpt-3-yxnldsg","text":"4.4 GPT-3: 涌现能力的曙光"},{"level":3,"id":"4-5-t5-y-ul2-tykjdts","text":"4.5 T5 与 UL2: 统一框架的探索"},{"level":2,"id":"5-gpt-xldcxjh-cltdtl","text":"5. GPT 系列的持续进化: 从聊天到推理"},{"level":3,"id":"5-1-instruct-gpt-y-rlhf-dqjsdds","text":"5.1 InstructGPT 与 RLHF: 对齐技术的诞生"},{"level":3,"id":"5-2-chat-gpt-dzscdybd","text":"5.2 ChatGPT: 大众市场的引爆点"},{"level":3,"id":"5-3-gpt-4-dmtykkx","text":"5.3 GPT-4: 多模态与可靠性"},{"level":3,"id":"5-4-gpt-4o-ysdmtyssjh","text":"5.4 GPT-4o: 原生多模态与实时交互"},{"level":3,"id":"5-5-o1-cssjskzymsk","text":"5.5 o1: 测试时计算扩展与慢思考"},{"level":2,"id":"6-gndmx-czgzdbpz","text":"6. 国内大模型: 从追赶者到并跑者"},{"level":3,"id":"6-1-wxyy-zzdcphcs","text":"6.1 文心一言: 最早的产品化尝试"},{"level":3,"id":"6-2-tyqw-kystdylz","text":"6.2 通义千问: 开源生态的引领者"},{"level":3,"id":"6-3-xh-czcjdsgz","text":"6.3 星火: 垂直场景的深耕者"},{"level":3,"id":"6-4-chat-glm-xsjyygch","text":"6.4 ChatGLM: 学术基因与国产化"},{"level":3,"id":"6-5-kimi-csxwdbg","text":"6.5 Kimi: 长上下文的标杆"},{"level":3,"id":"6-6-deep-seek-xsgmddfz","text":"6.6 DeepSeek: 效率革命的颠覆者"},{"level":2,"id":"7-wlqszw","text":"7. 未来趋势展望"},{"level":3,"id":"7-1-tlnl-ckskdmsk","text":"7.1 推理能力: 从快思考到慢思考"},{"level":3,"id":"7-2-dmtysrh-cpjzxty","text":"7.2 多模态原生融合: 从拼接走向统一"},{"level":3,"id":"7-3-dcbs-ai-dmzh","text":"7.3 端侧部署: AI 的民主化"},{"level":3,"id":"7-4-agent-czxt-cgjdst","text":"7.4 Agent 操作系统: 从工具到生态"},{"level":3,"id":"7-5-sjmx-cyymndwlmn","text":"7.5 世界模型: 从语言模拟到物理模拟"},{"level":2,"id":"8-zj","text":"8. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="1-intro/1.3-history/1.3-history" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="1-intro/1.3-history/1.3-history" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">1.3 · 发展历程与趋势展望: 从 Seq2Seq 到世界模型</h1>
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
