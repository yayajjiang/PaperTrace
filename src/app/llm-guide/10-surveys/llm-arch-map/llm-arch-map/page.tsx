"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<p><em><strong>作者: 北方的郎</strong></em></p>
<pre><code>      ***原文: ***[***https://zhuanlan.zhihu.com/p/14943417217***](https://zhuanlan.zhihu.com/p/14943417217)
</code></pre>
<p>前一段时间忙于项目,文档看的少. 这两天集中看了一些文档,给自己充充电,感觉这篇大模型纽约大学研究者发表的综述写的不错,挺全、挺细致的. </p>
<pre><code>    论文地址: [Survey of different Large Language Model Architectures: Trends, Benchmarks, and Challenges](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2412.03220)
    
    
      ![](./images/image_0.jpg)
</code></pre>
<p>以下为论文的关键信息整理: </p>
<h2 id="i-jj">I. 简介</h2>
<p>LLM在多个NLP任务中展现出卓越的技能,包括: </p>
<pre><code>      - 文本生成:  根据相关指令从结构化输入生成连贯的文本. 
      - 逻辑推理:  基于给定场景的逻辑进行分析和推理. 
      - 机器翻译:  在不同语言框架之间进行翻译. 
      - 摘要:  对内容进行上下文缩减. 
      - 多模态支持:  除了文本内容,LLM还能处理和输出各种格式,包括图像、视频和机器人环境中的交互. 
</code></pre>
<p>LLM的发展可追溯到2018年GPT和BERT的出现. 这些模型以其独特的架构服务于LLM的不同领域. 当代LLM主要基于Transformer架构,可以分为以下几类: </p>
<pre><code>      - 自编码:  主要基于Encoder ,适用于上下文NLP任务,例如BERT及其衍生物. 
      - 自回归:  以Decoder  为中心,适用于生成任务,例如GPT系列. 
      - Encoder-Decoder:  结合了Encoder 和Decoder  结构,兼顾了前两种类型的优势,但也有一些妥协,例如Pangu系列(Pangu-α和Pangu-Σ). 
</code></pre>
<h2 id="ii-bj">II. 背景</h2>
<p>LLM主要包含三种架构类别: Decoder-Only、Encoder-Only和Encoder-Decoder. 每种类别都有其独特的优势和限制,并在各种应用和环境中找到其相关性. 本节解释了现代LLM背后的架构,从通用的Transformer架构开始,然后探索基于该架构的三个类别. </p>
<h3 id="a-transformer">A. Transformer</h3>
<pre><code>      ![](./images/image_1.jpg)
</code></pre>
<p>Transformer架构由Vaswani等人于2017年提出,它通过并行处理标记的能力,打破了传统循环序列到序列模型(如LSTM网络和RNN)的顺序处理限制. Transformer的关键创新在于其多头自注意力机制,它允许模型并行训练. 概念上,Transformer架构由Encoder 和Decoder  两部分组成. Encoder 将输入序列映射到更高维的嵌入空间,而Decoder  则从这些嵌入中生成输出序列. 通常,Transformer模型包含多个Encoder 和Decoder  层. 图2展示了Transformer模型的架构. </p>
<p>与其他传统模型不同,Transformer能够通过同时处理输入数据的所有部分,实现更快速和更高效的并行处理. 为了解决在没有内在顺序处理的情况下保持序列信息的问题,Transformer使用了一种称为位置编码的技术. 该机制允许每个标记(例如句子中的单词)编码其在序列中的相对位置. 位置编码至关重要; 没有它,Transformer会将句子视为一个词袋,完全忽略了单词的顺序. </p>
<pre><code>      ![](./images/image_2.jpg)
</code></pre>
<p>位置编码使用涉及正弦和余弦函数的特定数学公式. 该公式确保序列中的每个位置都获得唯一的编码. 通过将此编码附加到标记的嵌入中,模型可以了解标记在序列中的位置. 精确的公式如下: </p>
<p>E(pos, 2i) = sin(pos / 10000^(2i/dim))</p>
<p>E(pos, 2i + 1) = cos(pos / 10000^(2i/dim))</p>
<p>其中pos表示序列中的标记位置,i从0到dim/2,分别表示偶数和奇数位置. </p>
<p>正弦和余弦函数的选择特别有利,因为它们为嵌入空间中的位置信息提供了独特且一致的方式. 这种设置不仅简化了模型根据相对位置进行注意力的学习,而且还使模型能够泛化到训练期间遇到的序列长度之外的长度. 这种方法的美妙之处在于它赋予模型从数据中识别模式的能力,并增加了位置上下文. 这种简单而深刻的方法对于Transformer模型在从文本生成和语言翻译到图像识别等语言之外的领域的成功至关重要. </p>
<h3 id="b-zbmmx">B. 自编码模型</h3>
<p>自编码模型,也称为“Decoder-Only模型”,主要针对以理解为中心的自然语言处理任务,例如BERT、ERNIE和ALBERT. 它们通过双向学习和掩码等训练技术,在上下文理解方面表现出色. 然而,它们也存在一些局限性: </p>
<pre><code>      - 受限于固定长度的输入序列. 
      - 内在的上下文依赖性可能会阻碍文本生成. 
      - 由于其组成缺乏Decoder  ,下游任务适应性需要微调. 
</code></pre>
<h3 id="c-zhgmx">C. 自回归模型</h3>
<p>这些模型,包括GPT和LLaMA系列,近年来备受关注. 它们的自回归设计意味着标记生成依赖于先前标记,这使得它们非常适合生成任务. 这些模型提供了: </p>
<pre><code>      - 接受不同输入长度的灵活性,使其擅长扩展数据生成. 
      - 在少样本或零样本任务中的熟练程度,避免了特定微调的需求. 
      - 然而,它们无法捕获整体上下文,因此在生成过程中只能从前置标记中获取洞察. 
</code></pre>
<h3 id="d-xldxlmx">D. 序列到序列模型</h3>
<p>T5和GLM等模型结合了前两种类型的优势,擅长将输入序列映射到固定长度的嵌入,使Decoder  能够生成上下文相关的输出. 这使得它们特别适用于条件生成任务,例如摘要、翻译和问答,其中输出紧密依赖于提供的输入. </p>
<p>Encoder 和Decoder  组件的集成使Seq2Seq模型能够处理复杂的输入,但也带来了以下缺点: </p>
<p>组合增加了参数数量,可能影响效率. </p>
<p>训练此类模型需要大量的计算资源,因为对齐输入和输出序列很复杂. </p>
<h3 id="e-bfz-encoder-variational-auto-encoder">E. 变分自Encoder (<em>Variational auto-encoder</em>)</h3>
<p>变分自Encoder (VAE)是一种复杂的生成模型,它通过整合概率建模来发展一个有意义且通用的潜在空间,从而从传统的自Encoder (AE)中演变而来. 与标准的AE不同,VAE的Encoder 产生由均值和方差定义的概率分布,而不是单个确定性点. </p>
<pre><code>      ![](./images/image_3.jpg)
</code></pre>
<p>VAE使用概率编码来创建一个动态和可适应的潜在空间,不仅允许数据重建,而且还允许通过从学习的概率分布中采样来生成新数据. 这增强了模型的泛化能力,并确保潜在空间中的平滑过渡,这对于数据生成和增强等任务至关重要. 它利用重参数化技巧,在反向传播过程中保持梯度流动,使潜在变量保持可微性,从而实现传统的训练. VAE的目标函数在重建损失和Kullback-Leibler(KL)散度之间进行权衡,重建损失评估Decoder  样本与原始输入的准确性,而KL散度通过鼓励后验接近标准高斯分布来促进潜在分布的逼近. 这种双重关注确保了精确的输入重建和平滑、连续的潜在空间,使VAE成为图像生成、数据增强和异常检测等应用的强大工具. </p>
<h3 id="f-scdkwl-generative-adversarial-network">F. 生成对抗网络(<em>Generative Adversarial Network</em>)</h3>
<p>生成对抗网络(GAN)是Goodfellow等人于2014年提出的一类深度学习框架. GAN由两个神经网络组成,即生成器和判别器,它们通过对抗过程同时进行训练. 生成器的目标是创建类似于真实数据的合成数据,而判别器的角色是区分真实和合成数据. 随着时间的推移,随着训练的进行,生成器越来越擅长创建真实数据,而判别器越来越擅长区分真实和假数据,如图所示. </p>
<pre><code>      ![](./images/image_4.jpg)
      

      ![](./images/image_5.jpg)
</code></pre>
<h2 id="iii-yqjylyd-llm-zs-previous-domain-based-llm-surveys">III. 以前基于领域的LLM综述(Previous Domain-based LLM Surveys)</h2>
<p>本节对现有的大语言模型(LLM)调查进行综合分析. 我们根据这些调查论文所涉及的主题对它们进行比较评估. 调查按时间顺序排列,使读者能够跟踪研究重点随时间的演变. 通过检查这些调查中的内容,读者可以深入了解高级LLM开发所取得的进展. 类别包括: </p>
<pre><code>      - 架构:  讨论的LLM的架构设计细节,包括模型类型和配置,包括Encoder-Only、Decoder-Only和Decoder  -Encoder 模型. 
      - 数据集:  用于训练和评估LLM的数据集信息. 
      - 预训练:  用于训练基础LLM的方法和技术. 
      - 微调:  将预训练LLM适应特定任务或领域的策略,以提高特定领域的性能. 
      - 基准:  评估LLM/MLLM性能的评估指标和基准数据集. 
      - 挑战:  识别挑战和优化LLM开发和部署的技术. 
      - MLLM:  讨论多语言语言模型及其特定考虑因素. 
      - 应用:  最先进LLM的现实世界应用和用例. 
</code></pre>
<h2 id="iv-llms-dbjfx">IV. LLMS的比较分析</h2>
<p>本节使用各种基准对主要语言模型进行比较分析,这些基准评估了模型在语言理解、推理和多模态任务中的能力. 这些基准旨在评估语言理解和认知能力的各个方面. </p>
<h3 id="a-zyjz">A. 主要基准</h3>
<p>MMLU(大量多任务语言理解):  包含57个任务,涵盖从人类概念到高中考试的各种主题,评估语言模型在广泛主题上的全面理解和泛化能力. </p>
<pre><code>      ![](./images/image_6.jpg)
</code></pre>
<p>SuperGLUE:  设计为高级基准,用于评估和促进AI模型在推理和预测能力方面的改进,这些能力超越了GLUE基准. </p>
<pre><code>      ![](./images/image_7.jpg)
</code></pre>
<p>HellaSwag:  设计用于测试模型的一般知识和使用日常知识完成场景的能力. </p>
<pre><code>      ![](./images/image_8.jpg)
</code></pre>
<p>ARC(AI2推理挑战):  提供小学水平的多项选择题,测试模型理解和应用推理技能的能力. </p>
<pre><code>      ![](./images/image_9.jpg)
</code></pre>
<p>WinoGrande:  包含大量winograd方案,用于测试AI模型的常识推理能力</p>
<pre><code>      ![](./images/image_10.jpg)
</code></pre>
<h3 id="b-dmt-llm-jz">B. 多模态LLM基准</h3>
<p>NLVR2(真实世界视觉推理):  评估AI模型使用自然语言进行视觉推理的能力. 它要求模型确定给定的自然语言陈述是否准确地描述了图像对. </p>
<pre><code>      ![](./images/image_11.jpg)
</code></pre>
<p>视觉问答(VQA)基准:  评估AI系统回答与给定图像相关问题的能力. 该多模态基准结合了自然语言处理和图像识别,以测试模型对视觉内容的全面理解,以及与概念和事实查询相关联的能力. </p>
<pre><code>      ![](./images/image_12.jpg)
</code></pre>
<h2 id="v-llms-dwtjs">V. LLMS的微调技术</h2>
<p>LLM的微调方法在各种应用中使用,包括领域专业化、性能改进和偏差缓解. 本文详细介绍了两种关键的微调方法: 低秩适应(LoRA)和持续学习(CL). </p>
<h3 id="a-llms-zddzsy-low-rank-adaptation-in-llms">A. LLMS中的低秩适应(<em>LOW-RANK ADAPTATION IN LLMS</em>)</h3>
<pre><code>      ![](./images/image_13.jpg)
</code></pre>
<p>LoRA提供了一种有效的方法来微调基于Transformer的语言模型. 该技术通过将原始权重矩阵分解为低秩更新来减少可训练参数的数量,从而显著降低计算开销. 它还推广了全微调,理论上允许模型通过选择合适的r来逼近全秩权重矩阵的表示能力. </p>
<h3 id="b-cxxx">B. 持续学习</h3>
<p>CL是一种方法,它专注于随着时间的推移使模型适应新任务,同时避免先前学习信息的灾难性遗忘. 它利用PEFT方法引入最小的、任务特定的更新到模型的参数中. 这些策略通过包含基于熵的分类器用于适配器选择和确保任务之间知识转移的策略,帮助模型在一系列任务中保持性能. </p>
<h3 id="c-sxwckkz-context-window-extension">C. 上下文窗口扩展(<em>CONTEXT WINDOW EXTENSION</em>)</h3>
<p>上下文窗口扩展是指将LLM适应处理超过其最初定义的上下文长度的输入序列. 通过PEFT,例如LongLoRA,LLM可以高效地微调以扩展其上下文窗口,使其能够处理更长的输入序列而不会显着增加计算需求. </p>
<h3 id="d-sjzlwt-visual-instruction-tuning">D. 视觉指令微调(<em>VISUAL INSTRUCTION TUNING</em>)</h3>
<p>一种引人注目的PEFT技术是视觉指令微调,其中LLM(传统上基于文本)被适应以处理视觉输入,使其能够执行图像字幕和视觉问答等任务. 通过视觉指令微调将视觉和语言处理集成到LLM中,代表了多模态AI能力的重大飞跃. 该过程涉及使用LLM(如GPT-4)生成语言-图像指令遵循数据,然后使用这些数据微调一个能够理解和交互文本和视觉输入的模型. 生成的模型被称为LLaVA(大型语言和视觉助手),展示了令人印象深刻的跨模态对话能力,并在科学问答等任务上设置了新的准确率基准. </p>
<h2 id="vi-zxjd-llm">VI. 最先进的LLM</h2>
<p>本节概述了基于其架构和所属系列的大语言模型(LLM). 这将提供对各种LLM及其各自设计框架的全面理解. </p>
<pre><code>      ![](./images/image_14.jpg)
      

      ![](./images/image_15.jpg)
      

      ![](./images/image_16.jpg)
</code></pre>
<h3 id="a-zbmmx">A. 自编码模型</h3>
<p>BERT:  2018年发布的先驱模型,利用Decoder-Only架构,显著提高了自然语言理解模型的能力. </p>
<pre><code>      ![](./images/image_17.jpg)
</code></pre>
<p>BERT变体:  包括BERT-wwm、BERT-wwm-ext、SpanBERT、DistillBERT、TinyBERT、VisualBERT和MacBERT等,针对不同任务和效率进行了改进. </p>
<pre><code>      ![](./images/image_18.jpg)
</code></pre>
<p>RoBERTa:  通过动态掩码策略增强了BERT的训练过程的鲁棒性,并采用更大的批量大小、更大的训练语料库和更深的训练迭代来优化性能. </p>
<pre><code>      ![](./images/image_19.jpg)
</code></pre>
<p>ERNIE:  采用多级掩码策略来优化中文语言的性能,并引入了对话语言模型(DLM)技术. </p>
<pre><code>      ![](./images/image_20.jpg)
</code></pre>
<p>ALBERT:  通过因式分解嵌入参数化来优化训练,并引入了句子顺序预测(SOP)任务来替代BERT中的NSP任务. </p>
<pre><code>      ![](./images/image_21.jpg)
</code></pre>
<p>ELECTRA:  采用生成对抗网络(GAN)技术,通过预测所有单词而不是仅预测掩码的单词来提高效率. </p>
<pre><code>      ![](./images/image_22.jpg)
</code></pre>
<p>DeBERTa:  引入了解耦注意力机制,以解决传统自编码模型中掩码语言模型(MLM)的局限性. </p>
<p>Transformer-XL:  通过引入段级递归和状态重用以解决处理长序列的挑战. </p>
<h3 id="b-zhgmx">B. 自回归模型</h3>
<p>GPT:  2018年发布的先驱模型,引入了自回归技术,并采用了无监督学习和上下文学习训练策略. </p>
<pre><code>      ![](./images/image_23.jpg)
</code></pre>
<p>Pathways和PaLM:  基于Pathways架构,PaLM是第一个使用该架构训练的语言模型,拥有高达540B的参数. PaLM-E是PaLM的扩展,集成了语言路径和视觉路径,使其能够理解和处理文本和图像. </p>
<pre><code>      ![](./images/image_24.jpg)
      

      ![](./images/image_25.jpg)
      

      ![](./images/image_26.jpg)
</code></pre>
<p>Microsoft KOSMOS-1:  基于magneto transformer架构,KOSMOS-1使用CLIP ViT-L/14模型来捕获图像特征,并采用XPOS技术来协调训练标记和预测标记之间的长度差异. </p>
<pre><code>      ![](./images/image_27.jpg)
</code></pre>
<p>Megatron:  Nvidia提出的框架,用于解决LLM训练中的并行计算问题,通过层内并行、层间并行和数据并行来加速模型训练. </p>
<pre><code>    LLaMA:  Meta开发的模型,旨在提高模型能力的同时保持较小的尺寸,适用于本地部署. LLaMA系列包括LLaMA、Alpaca、Guanaco、Vicuna、Dolly、LLaMA
      2和Video-LLaMA等,针对不同参数大小和模态支持进行了改进. 
</code></pre>
<p>Gopher和DeepMind:  Gopher是DeepMind开发的模型,拥有从44M到280B不等的参数. Chinchilla是Gopher的继任者,目标是提高模型大小和训练数据之间的比例. DeepMind还开发了视觉模型Flamingo,用于少样本学习. </p>
<p>其他自回归模型:  包括Jurassic系列、Claude系列、Falcon、DALL-E、Whisper和Codex等,涵盖了图像生成、音频到文本转换和代码生成等领域. </p>
<p>Google模型:  包括Meena、LaMDA、ALIGN、GaLM和Gemini等,针对特定领域和任务进行了优化. </p>
<p>Microsoft模型:  包括Phi系列和mPLUG系列,Phi系列专注于小模型和高精度,mPLUG系列专注于多模态支持. </p>
<p>其他模型:  包括AlexaTM、PLATO系列、WuDao系列、Cogview、Lawformer、OPT、YaLM、BLOOM和Galactica等,展示了LLM在各个领域的应用潜力. </p>
<p>C. 序列到序列模型</p>
<p>BART:  结合了BERT的双向Encoder 特征和GPT的自回归Decoder  特征,在序列生成任务中表现出色. </p>
<p>基于T5:  包括T5、mT5和T0等,提供了一种通用的预训练模型框架,并针对机器翻译和提示工程进行了改进. </p>
<pre><code>      ![](./images/image_28.jpg)
</code></pre>
<p>Pangu:  包括Pangu-α、Pangu-Coder和Pangu-Σ,针对中文语料库和代码生成进行了优化. </p>
<pre><code>      ![](./images/image_29.jpg)
</code></pre>
<p>Switch Transformer:  利用LLM中的稀疏性来加速训练和推理,通过混合专家(MoE)和简化的稀疏路由来减少计算复杂性. </p>
<p>GLM:  引入了自动回归空白填充来改进掩码和填充技术,并以其较小的参数数量在SuperGLUE基准上优于BERT. </p>
<p>ChatGLM和VisualGLM:  分别为BART和GLM的对话和视觉对话版本,展示了LLM在交互和多模态任务中的潜力. </p>
<h2 id="vii-llms-dyxlff">VII. LLMS的预训练方法</h2>
<p>预训练是LLM开发的关键阶段,涉及使用大量文本数据训练模型以学习语言模式、结构和上下文细微差别. 本文介绍了各种最先进的预训练方法,包括训练数据减少、神经架构搜索、渐进学习和混合精度训练. </p>
<h2 id="viii-llms-dtz">VIII. LLMS的挑战</h2>
<p>LLM面临着一些挑战,包括数据问题、模型压缩、分布式计算和多模态支持. </p>
<h3 id="a-sjwt">A. 数据问题</h3>
<p>数据质量:  数据的相关性、丰富性和冗余性对LLM的性能至关重要. 数据质量问题可能会导致模型学习到不准确或不可靠的知识. </p>
<pre><code>      ![](./images/image_30.jpg)
</code></pre>
<p>数据偏差:  训练数据中经常存在人类语言或其他数据输入形式中的偏差,这可能会导致模型对特定主题的偏见理解. </p>
<pre><code>      ![](./images/image_31.jpg)
</code></pre>
<p>数据规模:  LLM需要大量数据来提高准确性和对提示的理解,这给数据收集、处理和存储带来了挑战. </p>
<h3 id="b-mxys">B. 模型压缩</h3>
<p>模型压缩技术旨在优化模型的内部结构以提高效率,同时不显着降低性能. 三种主要技术包括剪枝、量化和知识蒸馏. </p>
<pre><code>      ![](./images/image_32.jpg)
      

      ![](./images/image_33.jpg)
</code></pre>
<h3 id="c-fbsjs">C. 分布式计算</h3>
<p>由于LLM的规模巨大,传统的单设备训练或部署方法不足以处理与这些模型相关的巨大数据集和参数规模. 分布式计算已成为解决这些挑战的关键解决方案. 目前,三种主要的分布式计算方法被用于解决这些挑战: 数据并行、张量并行和流水线并行. </p>
<h3 id="d-dmtzc">D. 多模态支持</h3>
<p>多模态支持是LLM面临的一个重大挑战,特别是在视觉Transformer (ViT)的出现之后,它展示了变换器在视觉任务中的潜力. 与传统的LLM不同,训练具有多模态支持的模型更复杂,因为需要在不同模态之间对齐表示. 这为这些多模态LLM引入了不同的训练任务. </p>
<h3 id="e-tsgc">E. 提示工程</h3>
<p>提示工程是一种技术,通过策略性地制定包含内容和指令的输入查询来加快LLM在上下文中的理解速度. 该技术比预训练和微调更简单,并允许用户与LLM交互以控制标记数据流. </p>
<pre><code>      ![](./images/image_34.jpg)
</code></pre>
<h2 id="ix-llms-dyy">IX. LLMS的应用</h2>
<p>LLM通过利用其理解和生成人类语言的能力,改变了各个领域. 它们的应用范围很广,包括文本生成、代码生成、视觉内容理解和设计自动化. </p>
<pre><code>      ![](./images/image_35.jpg)
</code></pre>
<h2 id="x-jl">X. 结论</h2>
<p>本文全面回顾了LLM及其在NLP领域的演变. 它探索了LLM在各个NLP任务中的各种技能,包括文本</p>
<pre><code>      作者: 北方的郎
</code></pre>
<p>链接: undefined</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"i-jj","text":"I. 简介"},{"level":2,"id":"ii-bj","text":"II. 背景"},{"level":3,"id":"a-transformer","text":"A. Transformer"},{"level":3,"id":"b-zbmmx","text":"B. 自编码模型"},{"level":3,"id":"c-zhgmx","text":"C. 自回归模型"},{"level":3,"id":"d-xldxlmx","text":"D. 序列到序列模型"},{"level":3,"id":"e-bfz-encoder-variational-auto-encoder","text":"E. 变分自Encoder ( Variational auto-encoder )"},{"level":3,"id":"f-scdkwl-generative-adversarial-network","text":"F. 生成对抗网络( Generative Adversarial Network )"},{"level":2,"id":"iii-yqjylyd-llm-zs-previous-domain-based-llm-surveys","text":"III. 以前基于领域的LLM综述(Previous Domain-based LLM Surveys)"},{"level":2,"id":"iv-llms-dbjfx","text":"IV. LLMS的比较分析"},{"level":3,"id":"a-zyjz","text":"A. 主要基准"},{"level":3,"id":"b-dmt-llm-jz","text":"B. 多模态LLM基准"},{"level":2,"id":"v-llms-dwtjs","text":"V. LLMS的微调技术"},{"level":3,"id":"a-llms-zddzsy-low-rank-adaptation-in-llms","text":"A. LLMS中的低秩适应( LOW-RANK ADAPTATION IN LLMS )"},{"level":3,"id":"b-cxxx","text":"B. 持续学习"},{"level":3,"id":"c-sxwckkz-context-window-extension","text":"C. 上下文窗口扩展( CONTEXT WINDOW EXTENSION )"},{"level":3,"id":"d-sjzlwt-visual-instruction-tuning","text":"D. 视觉指令微调( VISUAL INSTRUCTION TUNING )"},{"level":2,"id":"vi-zxjd-llm","text":"VI. 最先进的LLM"},{"level":3,"id":"a-zbmmx","text":"A. 自编码模型"},{"level":3,"id":"b-zhgmx","text":"B. 自回归模型"},{"level":2,"id":"vii-llms-dyxlff","text":"VII. LLMS的预训练方法"},{"level":2,"id":"viii-llms-dtz","text":"VIII. LLMS的挑战"},{"level":3,"id":"a-sjwt","text":"A. 数据问题"},{"level":3,"id":"b-mxys","text":"B. 模型压缩"},{"level":3,"id":"c-fbsjs","text":"C. 分布式计算"},{"level":3,"id":"d-dmtzc","text":"D. 多模态支持"},{"level":3,"id":"e-tsgc","text":"E. 提示工程"},{"level":2,"id":"ix-llms-dyy","text":"IX. LLMS的应用"},{"level":2,"id":"x-jl","text":"X. 结论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/llm-arch-map/llm-arch-map" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/llm-arch-map/llm-arch-map" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">大语言模型架构全景图</h1>
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
