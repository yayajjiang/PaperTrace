---
title: "01 · DeepSeek-OCR · 对照译稿"
category: "模型技术报告"
tags: ["DeepSeek", "OCR", "对照译稿"]
published: true
excerpt: "DeepSeek-OCR 技术报告的逐段英中对照译稿, 讨论以视觉 token 对文档上下文进行光学压缩."
---
# DeepSeek-OCR: Contexts Optical Compression · 上下文光学压缩

<!-- page 1 of 22 -->

DeepSeek-OCR: Contexts Optical Compression

Haoran Wei, Yaofeng Sun, Yukun Li

DeepSeek-AI

Abstract

We present DeepSeek-OCR as an initial investigation into the feasibility of compressing long contexts via optical 2D mapping. DeepSeek-OCR consists of two components: DeepEncoder and DeepSeek3B-MoE-A570M as the decoder. Specifically, DeepEncoder serves as the core engine, designed to maintain low activations under high-resolution input while achieving high compression ratios to ensure an optimal and manageable number of vision tokens. Experiments show that when the number of text tokens is within 10 times that of vision tokens (i.e., a compression ratio < 10×), the model can achieve decoding (OCR) precision of 97%. Even at a compression ratio of 20×, the OCR accuracy still remains at about 60%. This shows considerable promise for research areas such as historical long-context compression and memory forgetting mechanisms in LLMs. Beyond this, DeepSeek-OCR also demonstrates high practical value. On OmniDocBench, it surpasses GOT-OCR2.0 (256 tokens/page) using only 100 vision tokens, and outperforms MinerU2.0 (6000+ tokens per page on average) while utilizing fewer than 800 vision tokens. In production, DeepSeek-OCR can generate training data for LLMs/VLMs at a scale of 200k+ pages per day (a single A100-40G). Codes and model weights are publicly accessible at http://github.com/deepseek-ai/DeepSeek-OCR.

我们提出 DeepSeek-OCR, 对通过二维光学映射压缩长上下文的可行性进行初步研究. DeepSeek-OCR 由两个组件组成: DeepEncoder, 以及作为解码器的 DeepSeek3B-MoE-A570M. DeepEncoder 是核心引擎, 目标是在高分辨率输入下维持较低的激活量, 同时取得较高压缩比, 从而把视觉 token 数控制在适当且易于处理的范围. 实验表明, 当文本 token 数不超过视觉 token 数的 10 倍时, 即压缩比小于 $10\times$, 模型的 OCR 解码精度可达 97%. 即使压缩比达到 $20\times$, OCR 准确率仍保持在约 60%. 这一结果为历史长上下文压缩和 LLM 记忆遗忘机制等研究方向提供了可能性. DeepSeek-OCR 也有较高实用价值. 在 OmniDocBench 上, 它仅使用 100 个视觉 token 就超过每页使用 256 个 token 的 GOT-OCR2.0; 使用少于 800 个视觉 token 时, 又超过平均每页使用 6000 多个 token 的 MinerU2.0. 在生产环境中, 单张 A100-40G 每天可由 DeepSeek-OCR 生成超过 20 万页 LLM/VLM 训练数据. 代码与模型权重公开于 http://github.com/deepseek-ai/DeepSeek-OCR.



### Figure 1 embedded text (original)

```text
0.1

DeepSeek-OCR (Gundam-M 200dpi)

64 vis toks(left) 100 vis toks(left) 64 vis toks(right) 100 vis toks(right)

dots.ocr (200dpi)

DeepSeek-OCR (Gundam)

100%

98.5% 97.3% 96.8% 96.8%

MinerU2.0

DeepSeek-OCR (Base) DeepSeek-OCR (Large)

19.7

96.5% 93.8%

20x

0.2

dots.ocr

90%

91.5% 89.8% 87.1%

Qwen2.5-VL-72B

17.7

83.8% 85.8%

DeepSeek-OCR (Small)

InternVL3-78B

High Accuracy ED < 0.25 ( better)

16.5

80%

79.3% 76.3%

OCRFlux-3B

15.1

0.3

15x

70%

GOT-OCR2.0

13.2

Qwen2.5-VL-7B

12.6

DeepSeek-OCR (Tiny)

59.1%

11.8

60%

OLMOCR

11.3

0.4

10.6

10.5

InternVL2-76B

9.7

50%

10x

8.5

Precision (%)

arXiv:2510.18234v1  [cs.CV]  21 Oct 2025

Compression (×)

7.5

40%

0.5

6.7

Vison Tokens > 1500 Average per image ( More)

Vision Tokens < 1000 Average per image ( Fewer)

30%

Overall Performance (Edit Distance)

5x

20%

SmolDocling

10%

Encoder Series DeepEncoder Series QwenEncoder Series InternVLEncoder Series Other Encoders

0%

0x

800

600

500

400

300 250 200 150 100

600­700

700­800

800­900

7000

6000

5000

4000

3000

2000 1500

1000

900­1000

1000­1100

1100­1200

1200­1300

Text Tokens in Per Page (Ground­truth)

Average Vision Tokens per Image

(a) Compression on Fox benchmark

(b) Performance on Omnidocbench
```

图 1 说明 Fox 基准中不同文本 token 区间在 64 或 100 个视觉 token 下的压缩比与识别精度, 并对照 OmniDocBench 上各模型的平均视觉 token 数和 OCR edit distance.

Figure 1 | Figure (a) shows the compression ratio (number of text tokens in ground truth/number of vision tokens model used) testing on Fox [21] benchmark; Figure (b) shows performance comparisons on OmniDocBench [27]. DeepSeek-OCR can achieve state-of-the-art performance among end-to-end models enjoying the fewest vision tokens.

<!-- page 2 of 22 -->

Contents

1 Introduction 3

2 Related Works 4

2.1 Typical Vision Encoders in VLMs 4

2.2 End-to-end OCR Models 4

3 Methodology 5

3.1 Architecture 5

3.2 DeepEncoder 5

3.2.1 Architecture of DeepEncoder 5

3.2.2 Multiple resolution support 6

3.3 The MoE Decoder 7

3.4 Data Engine 7

3.4.1 OCR 1.0 data 7

3.4.2 OCR 2.0 data 8

3.4.3 General vision data 9

3.4.4 Text-only data 9

3.5 Training Pipelines 9

3.5.1 Training DeepEncoder 10

3.5.2 Training DeepSeek-OCR 10

4 Evaluation 10

4.1 Vision-text Compression Study 10

4.2 OCR Practical Performance 12

4.3 Qualitative Study 12

4.3.1 Deep parsing 12

4.3.2 Multilingual recognition 16

4.3.3 General vision understanding 17

5 Discussion 18

6 Conclusion 19

<!-- page 3 of 22 -->

## 1. Introduction · 引言

Current Large Language Models (LLMs) face significant computational challenges when processing long textual content due to quadratic scaling with sequence length. We explore a potential solution: leveraging visual modality as an efficient compression medium for textual information. A single image containing document text can represent rich information using substantially fewer tokens than the equivalent digital text, suggesting that optical compression through vision tokens could achieve much higher compression ratios.

当前 LLM 处理长文本内容时面临较大计算压力, 原因是计算量会随序列长度呈平方增长. 我们探索一种可能的解决办法: 把视觉模态作为文本信息的高效压缩介质. 一张包含文档文字的图像可以用远少于等价数字文本的 token 表示丰富信息, 这表明借助视觉 token 的光学压缩可能取得更高的压缩比.

This insight motivates us to reexamine vision-language models (VLMs) from an LLM-centric perspective, focusing on how vision encoders can enhance LLMs’ efficiency in processing textual information rather than basic VQA [12, 16, 24, 32, 41] what humans excel at. OCR tasks, as an intermediate modality bridging vision and language, provide an ideal testbed for this vision-text compression paradigm, as they establish a natural compression-decompression mapping between visual and textual representations while offering quantitative evaluation metrics.

基于这一观察, 我们从以 LLM 为中心的视角重新审视视觉语言模型, 关注视觉编码器怎样提高 LLM 处理文本信息的效率, 而非人类本就擅长的基础 VQA [12, 16, 24, 32, 41]. OCR 任务是连接视觉与语言的中间模态, 为这种视觉文本压缩范式提供了合适试验场: 它在视觉表示与文本表示之间自然建立压缩和解压映射, 同时具有可量化的评价指标.

Accordingly, we present DeepSeek-OCR, a VLM designed as a preliminary proof-of-concept for efficient vision-text compression. Our work makes three primary contributions:

据此, 我们提出 DeepSeek-OCR, 作为高效视觉文本压缩的初步概念验证 VLM. 这项工作有三项主要贡献:

First, we provide comprehensive quantitative analysis of vision-text token compression ratios. Our method achieves 96%+ OCR decoding precision at 9-10× text compression, ∼90% at 10-12× compression, and ∼60% at 20× compression on Fox [21] benchmarks featuring diverse document layouts (with actual accuracy being even higher when accounting for formatting differences between output and ground truth), as shown in Figure 1(a). The results demonstrate that compact language models can effectively learn to decode compressed visual representations, suggesting that larger LLMs could readily acquire similar capabilities through appropriate pretraining design.

第一, 我们对视觉文本 token 压缩比进行了全面的定量分析. 如 Figure 1(a) 所示, 在包含多种文档布局的 Fox [21] 基准上, 我们的方法在 $9$–$10\times$ 文本压缩时取得超过 96% 的 OCR 解码精度, 在 $10$–$12\times$ 压缩时约为 90%, 在 $20\times$ 压缩时约为 60%. 如果计入模型输出与 ground truth 之间的格式差异, 实际准确率还会更高. 结果表明, 小型语言模型能够有效学习压缩视觉表示的解码, 也说明更大的 LLM 可以通过适当预训练设计获得类似能力.

Second, we introduce DeepEncoder, a novel architecture that maintains low activation memory and minimal vision tokens even with high-resolution inputs. It serially connects window attention and global attention encoder components through a 16× convolutional compressor. This design ensures that the window attention component processes a large number of vision tokens, while the compressor reduces vision tokens before they enter the dense global attention component, achieving effective memory and token compression.

第二, 我们提出 DeepEncoder. 该架构即使面对高分辨率输入, 也能维持较低激活显存与较少视觉 token. 它通过一个 $16\times$ 卷积压缩器, 把窗口注意力编码组件与全局注意力编码组件串联起来. 窗口注意力组件先处理大量视觉 token, 压缩器再在 token 进入 dense global attention 组件前缩短序列, 从而有效压缩显存占用和 token 数.

Third, we develop DeepSeek-OCR based on DeepEncoder and DeepSeek3B-MoE [19, 20]. As shown in Figure 1(b), it achieves state-of-the-art performance within end-to-end models on OmniDocBench while using the fewest vision tokens. Additionally, we equip the model with capabilities for parsing charts, chemical formulas, simple geometric figures, and natural images to enhance its practical utility further. In production, DeepSeek-OCR can generate 33 million pages of data per day for LLMs or VLMs using 20 nodes (each with 8 A100-40G GPUs).

第三, 我们基于 DeepEncoder 与 DeepSeek3B-MoE [19, 20] 开发 DeepSeek-OCR. 如 Figure 1(b) 所示, 它在 OmniDocBench 的端到端模型中以最少视觉 token 取得领先表现. 我们还为模型加入图表, 化学式, 简单几何图形和自然图像解析能力, 进一步提高实用性. 在生产环境中, 使用 20 个节点, 每个节点配备 8 张 A100-40G, DeepSeek-OCR 每天可为 LLM 或 VLM 生成 3300 万页数据.

In summary, this work presents a preliminary exploration of using visual modality as an efficient compression medium for textual information processing in LLMs. Through DeepSeek-OCR, we demonstrate that vision-text compression can achieve significant token reduction (7-20×) for different historical context stages, offering a promising direction for addressing long-context challenges in large language models. Our quantitative analysis provides empirical guidelines for VLM token allocation optimization, while the proposed DeepEncoder architecture showcases practical feasibility with real-world deployment capabilities. Although focused on OCR as a proof-of-concept, this paradigm opens new possibilities for rethinking how vision and language modalities can be synergistically combined to enhance computational efficiency in large-scale text processing and agent systems.

这项工作初步探索了用视觉模态作为高效压缩介质, 帮助 LLM 处理文本信息. DeepSeek-OCR 表明, 对不同阶段的历史上下文进行视觉文本压缩, 可以把 token 数减少到原来的约 $1/7$–$1/20$, 为处理大模型长上下文问题提供了一个研究方向. 定量分析为优化 VLM 的 token 分配提供经验依据, DeepEncoder 架构则展示了实际部署的可行性. 尽管 OCR 只是概念验证任务, 这种范式仍为视觉与语言模态协同提高大规模文本处理和 Agent 系统的计算效率提供了新的研究空间.

<!-- page 4 of 22 -->



### Figure 2 embedded text (original)

```text
usually >15

Vary/DeepSeekVL/...

Qwen2(.5)/3VL series...

InternVL series/ DeepSeekVL2/...

w

VITDet

1024

Down- sample VIT

384

1024

h

VIT (navit) LLM Down- sample

Down- sample

384

LLM

224

384

LLM

VIT

224

tokens = (w//14(16))×(h//14(16))

384

[×] unsupported pipeline  parallel

[×] low native resolution [×] overly small patches

[×] too many vision tokens

[×] unsupported extreme resolution

[×] large activations [×] small global view [×] two pre-processes [×] need long sequence length

[×] slow inference speed [×] hard to deployment

[×] too many vision tokens
```

图 2 对比双塔, tile 与自适应分辨率三类视觉编码器, 并标出高分辨率输入下的激活量, 视觉 token 数, 流水线并行与部署限制.

Figure 2 | Typical vision encoders in popular VLMs. Here are three types of encoders commonly used in current open-source VLMs, all of which suffer from their respective deficiencies.

## 2. Related Works · 相关工作

### 2.1. Typical Vision Encoders in VLMs · VLM 中的典型视觉编码器

Current open-source VLMs employ three main types of vision encoders, as illustrated in Figure 2. The first type is a dual-tower architecture represented by Vary [36], which utilizes parallel SAM [17] encoder to increase visual vocabulary parameters for high-resolution image processing. While offering controllable parameters and activation memory, this approach suffers from significant drawbacks: it requires dual image preprocessing that complicates deployment and makes encoder pipeline parallelism challenging during training. The second type is tile-based method exemplified by InternVL2.0 [8], which processes images by dividing them into small tiles for parallel computation, reducing activation memory under high-resolution settings. Although capable of handling extremely high resolutions, this approach has notable limitations due to its typically low native encoder resolution (below 512×512), causing large images to be excessively fragmented and resulting in numerous vision tokens. The third type is adaptive resolution encoding represented by Qwen2-VL [35], which adopts the NaViT [10] paradigm to directly process full images through patch-based segmentation without tile parallelization. While this encoder can handle diverse resolutions flexibly, it faces substantial challenges with large images due to massive activation memory consumption that can cause GPU memory overflow, and sequence packing requires extremely long sequence lengths during training. Long vision tokens will slow down both prefill and generation phases of inference.

如 Figure 2 所示, 当前开源 VLM 主要采用三类视觉编码器. 第一类是以 Vary [36] 为代表的双塔架构, 它并行使用 SAM [17] 编码器, 增加用于高分辨率图像处理的视觉词表参数. 这种方法的参数量和激活显存可控, 但也有明显缺点: 两套图像预处理增加部署复杂度, 训练时也难以对编码器做流水线并行. 第二类是以 InternVL2.0 [8] 为代表的 tile 方法, 它把图像切为小块并行计算, 降低高分辨率设置下的激活显存. 这类方法能够处理很高的分辨率, 但原生编码器分辨率通常低于 512×512, 大图会被过度切碎并产生大量视觉 token. 第三类是以 Qwen2-VL [35] 为代表的自适应分辨率编码, 它采用 NaViT [10] 范式, 不做 tile 并行, 而是按 patch 切分并直接处理完整图像. 这种编码器能灵活处理不同分辨率, 但大图会产生大量激活, 可能导致 GPU 显存溢出; 训练中的序列打包也需要极长序列. 过长的视觉 token 序列还会拖慢推理的 Prefill 与 Decode 阶段.

### 2.2. End-to-end OCR Models · 端到端 OCR 模型

OCR, particularly document parsing task, has been a highly active topic in the image-to-text domain. With the advancement of VLMs, a large number of end-to-end OCR models have emerged, fundamentally transforming the traditional pipeline architecture (which required separate detection and recognition expert models) by simplifying OCR systems. Nougat [6] first employs end-to-end framework for academic paper OCR on arXiv, demonstrating the potential of models in handling dense perception tasks. GOT-OCR2.0 [38] expands the scope of OCR2.0 to include more synthetic image parsing tasks and designs an OCR model with performance-efficiency trade-offs, further highlighting the potential of end-to-end OCR researches. Additionally, general vision models such as Qwen-VL series [35], InternVL series [8], and many their derivatives continuously enhance their document OCR capabilities to explore dense visual perception boundaries. However, a crucial research question that current models have not addressed is: for a document containing 1000 words, how many vision tokens are at least needed for decoding? This question holds significant importance for research in the principle that "a picture is worth a thousand words."

OCR, 特别是文档解析, 一直是图像到文本领域的活跃主题. 随着 VLM 发展, 大量端到端 OCR 模型出现. 它们简化 OCR 系统, 改变了需要独立检测与识别专家模型的传统流水线架构. Nougat [6] 先采用端到端框架处理 arXiv 学术论文 OCR, 展示模型处理密集感知任务的潜力. GOT-OCR2.0 [38] 把 OCR2.0 扩展到更多合成图像解析任务, 并设计在性能与效率之间取舍的 OCR 模型, 进一步展示端到端 OCR 研究的潜力. Qwen-VL 系列 [35], InternVL 系列 [8] 等通用视觉模型及其派生模型也持续增强文档 OCR 能力, 探索密集视觉感知的边界. 然而, 当前模型尚未回答一个关键研究问题: 对含有 1000 个词的文档, 解码至少需要多少视觉 token? 这个问题直接关系到「一图胜千言」所对应的信息容量.

<!-- page 5 of 22 -->



### Figure 3 embedded text (original)

```text
... Output

n/16

Conv

SAM

... ...

16x CLIP   VIT 300M

DeepSeek-3B

VITDET

80M

(MOE-A570M)

global attention down- sample

vision tokens

Decoder

Embedding layer Input

local attention

low activation

n×16×16

Prompt

DeepEncoder

Tokenizer

patches
```

图 3 展示 DeepEncoder 的串联路径: 输入先成为 $n\times16\times16$ 个 patch, 经 80M VITDet/SAM 与 16 倍卷积压缩后进入 300M CLIP ViT, 再与 prompt token 一同交给 DeepSeek-3B-MoE-…8705 tokens truncated…s compression, it enjoys a higher research ceiling.

DeepSeek-OCR 不只是实验模型, 也具有较强实用能力, 可以构建 LLM/VLM 预训练数据. 为量化 OCR 性能, 我们在 OmniDocBench [27] 上测试 DeepSeek-OCR, 结果见 Table 3. DeepSeek-OCR 只需 100 个视觉 token, 即 640×640 分辨率, 就超过使用 256 个 token 的 GOT-OCR2.0 [38]; 使用 400 个 token, 其中 285 个有效 token, 分辨率 1280×1280 时, 达到该基准的领先水平. Gundam 模式使用少于 800 个 token, 超过需要近 7000 个视觉 token 的 MinerU2.0 [34]. 这些结果显示 DeepSeek-OCR 具有实际应用能力, 较高 token 压缩率也提供了更大的研究空间.

As shown in Table 4, some categories of documents require very few tokens to achieve satisfactory performance, such as slides which only need 64 vision tokens. For book and report documents, DeepSeek-OCR can achieve good performance with only 100 vision tokens. Combined with the analysis from Section 4.1, this may be because most text tokens in these document categories are within 1,000, meaning the vision-token compression ratio does not exceed 10×. For newspapers, Gundam or even Gundam-master mode is required to achieve acceptable edit distances, because the text tokens in newspapers are 4-5,000, far exceeding the 10× compression of other modes. These experimental results further demonstrate the boundaries of contexts optical compression, which may provide effective references for researches on the vision token optimization in VLMs and context compression, forgetting mechanisms in LLMs.

如 Table 4 所示, 某些文档类型只需很少 token 就能取得满意性能, 例如幻灯片只需 64 个视觉 token. 对书籍和报告文档, 100 个视觉 token 已可取得较好表现. 结合 Section 4.1, 原因可能是这些文档类型大多不超过 1000 个文本 token, 因而视觉 token 压缩比不超过 $10\times$. 报纸则需要 Gundam 甚至 Gundam-master 才能得到可接受的 edit distance, 因为报纸有 4000–5000 个文本 token, 远超其他模式的 $10\times$ 压缩区间. 这些实验进一步展示上下文光学压缩的边界, 可以为 VLM 视觉 token 优化, LLM 上下文压缩和遗忘机制研究提供参考.

### 4.3. Qualitative Study · 定性研究

#### 4.3.1. Deep parsing · 深度解析

DeepSeek-OCR possesses both layout and OCR 2.0 capabilities, enabling it to further parse images within documents through secondary model calls, a feature we refer to as "deep parsing". As shown in Figures 7, 8, 9, 10, our model can perform deep parsing on charts, geometry, chemical formulas, and even natural images, requiring only a unified prompt.

DeepSeek-OCR 同时具备布局与 OCR 2.0 能力, 可以通过第二次模型调用进一步解析文档内图像, 我们称之为「深度解析」. 如 Figures 7, 8, 9, 10 所示, 只需统一 prompt, 模型就能深度解析图表, 几何图形, 化学式乃至自然图像.

<!-- page 13 of 22 -->

<image>\n<|grounding|>Convert the document to markdown.

Input image Result

<image>\nParse the figure.

Rendering Deep Parsing

Figure 7 | In the field of financial research reports, the deep parsing mode of DeepSeek-OCR can be used to obtain structured results of charts within documents. Charts are a crucial form of data representation in finance and scientific fields, and the chart structured extraction is an indispensable capability for future OCR models.

<!-- page 14 of 22 -->

<image>\n<|grounding|>Convert the document to markdown.

Input image Result

<image>\nParse the figure.

The image depicts an indoor classroom setting with a group of children and an adult. The children are seated on the floor, facing a woman who is standing and appears to be reading or presenting to them. The woman is wearing a brown sweater and blue jeans. The children are dressed in various colors, with some wearing short pants and others in long pants.

The classroom has a green wall with educational posters and a bulletin board. The floor is covered with a gray carpet. To the left, there is a wooden dresser with a drawer partially open, and a chair is visible behind it. On the right side of the image, there is a purple bean bag chair.

The children are engaged with the woman, with some looking at her and others looking down or away. The room is well-lit, and the overall atmosphere seems to be one of attentiveness and learning.

The text "BIBLIOTECA" is visible on the wall, suggesting that the room may be part of a library or a section dedicated to books. The presence of educational materials and the organized layout of the room indicate that this is a space designed for learning and reading.

Rendering

Deep Parsing

Figure 8 | For books and articles, the deep parsing mode can output dense captions for natural images in the documents. With just a prompt, the model can automatically identify what type of image it is and output the required results.

<!-- page 15 of 22 -->

<image>\n<|grounding|>Convert the document to markdown.

Input image Result

<image>\nParse the figure.

Rendering

Deep Parsing

Figure 9 | DeepSeek-OCR in deep parsing mode can also recognize chemical formulas within chemical documents and convert them to SMILES format. In the future, OCR 1.0+2.0 technology may play a significant role in the development of VLM/LLM in STEM fields.

<!-- page 16 of 22 -->

<image>\n<|grounding|>Convert the document to markdown.

Input image Result

<image>\nParse the figure.

Rendering Deep Parsing

Figure 10 | DeepSeek-OCR also possesses the capability to copy (structure) simple planar geometric figures. Due to the intricate interdependencies among line segments in geometric shapes, parsing geometry task is extremely challenging and has a long way to go.

#### 4.3.2. Multilingual recognition · 多语言识别

PDF data on the Internet contains not only Chinese and English, but also a large amount of multilingual data, which is also crucial when training LLMs. For PDF documents, DeepSeek-OCR can handle nearly 100 languages. Like Chinese and English documents, multilingual data also supports both layout and non-layout OCR formats. The visualization results are shown in Figure 11, where we select Arabic and Sinhala languages to demonstrate results.

互联网 PDF 数据不仅包含中文和英文, 也包含大量多语言数据, 这类数据对训练 LLM 同样重要. 对 PDF 文档, DeepSeek-OCR 可以处理近 100 种语言. 与中英文文档一样, 多语言数据也支持带布局和不带布局两种 OCR 格式. Figure 11 展示阿拉伯语与僧伽罗语的可视化结果.

<!-- page 17 of 22 -->

<image>\nFree OCR.

<image>\n<|grounding|>Convert the document to markdown.

Figure 11 | To endow the capability of processing widely crawled PDFs (multilingual data), we train our model with OCR capabilities for nearly 100 languages. Minority language documents can also support both layout and non-layout outputs through different prompts.

#### 4.3.3. General vision understanding · 通用视觉理解

We also provide DeepSeek-OCR with a certain degree of general image understanding capabilities. The related visualization results are shown in Figure 12.

我们也赋予 DeepSeek-OCR 一定程度的一般图像理解能力, 相关可视化结果见 Figure 12.

<!-- page 18 of 22 -->

<image>\nLocate <|ref|>11-2=<|/ref|> in the image.

<image>\nDescribe this image in detail.

<image>\nLocate <|ref|>the teacher<|/ref|> in the image.

<image>\nIdentify all objects in the image and output them in bounding boxes.

<image>\n<|grounding|>OCR the image.



### Figure 12 embedded text (original)

```text
<image>\nLocate <|ref|>11-2=<|/ref|> in the image.

<image>\nDescribe this image in detail.

A green plastic container labeled for food storage purposes. The lid is yellow and appears slightly worn out.

On the front label: - At the top left corner, some Chinese characters. - In bold black letters near the center-top reads "6月香" (June Fragrance). - Below that, smaller white font states "鲜甜咸香" which translates roughly to "Fresh Sweet Salty Fragrant." - Dominating the middle part of the label is large lettering stating "豆瓣酱," meaning "Bean Paste Sauce."

Additional Information includes: - A small circular logo indicating quality assurance ("优质品"). - An illustration showing what seems like a dish made using bean paste sauce. - Text below the main title says "专注25年，只做原酿酱" translating to "Focusing since 1998, only making authentic fermented bean paste." - On the bottom right side, additional product specifications include "净含量：500g".

Overall Style/Type: It looks like commercial packaging designed specifically for preserving food items within the jar. It has clear labeling intended for easy identification and understanding among consumers who read Mandarin.

Note: There might be slight variations due to handwriting styles but overall maintains readability regarding brand identity and contents description.

<image>\nLocate <|ref|>the teacher<|/ref|> in the image.

<image>\nIdentify all objects in the image and output them in bounding boxes.

<image>\n这是一张

<image>\n<|grounding|>OCR the image.

照片，展示了一辆红色的消

君不见，黄河之水天上来

防栓。消防栓上有一个笑

脸，显得非常友好和亲切。

消防栓的顶部有一个黑色的

，奔流到海不复回。君不见，高堂明镜悲白发，

盖子，周围有一些金属铆

朝如青丝暮成雪。人生得意须尽欢，莫使金樽空

钉。在消防栓的底部，有一

对月。天生我材必有用，千金散尽还复来。烹羊

个粉红色的贴纸，上面写着

宰牛且为乐，会须一饮三百杯。岑夫子，丹丘

“bowtie”。背景中可以看

生，将进酒，杯莫停。与君歌一曲，请君为我倾

到一条街道，街道上有几辆

耳听。钟鼓馔玉不足贵，但愿长醉不愿醒。古来

停放的汽车和一些树木。整

圣贤皆寂寞，惟有饮者留其名。陈王昔时宴平

体画面给人一种温馨和友好

乐，斗酒十千恣欢谑。主人何为言少钱，径须沽

的感觉。

取对君酌。五花马，千金裘，呼儿将出换美酒，

与尔同销万古愁。
```

图 12 汇集定位, 描述, 检测与 OCR 示例, 展示模型保留的一般视觉接口和纯文本生成能力; 图中的模型输出按原文保留.

Figure 12 | We retain DeepSeek-OCR’s capabilities in general visual understanding, mainly including image description, object detection, grounding, etc. Meanwhile, due to the inclusion of text-only data, DeepSeek-OCR’s language capabilities are also retained. Note that since we do not include SFT (Supervised Fine-Tuning) stage, the model is not a chatbot, and some capabilities need completion prompts to be activated.

## 5. Discussion · 讨论

Our work represents an initial exploration into the boundaries of vision-text compression, investigating how many vision tokens are required to decode $N$ text tokens. The preliminary results are encouraging: DeepSeek-OCR achieves near-lossless OCR compression at approximately 10× ratios, while 20× compression still retains 60% accuracy. These findings suggest promising directions for future applications, such as implementing optical processing for dialogue histories beyond $k$ rounds in multi-turn conversations to achieve 10× compression efficiency.

这项工作初步探索视觉文本压缩的边界, 研究解码 $N$ 个文本 token 需要多少视觉 token. 初步结果显示, DeepSeek-OCR 在约 $10\times$ 压缩比下实现接近无损的 OCR 压缩, 在 $20\times$ 压缩下仍保持 60% 准确率. 这些发现指向一种潜在应用: 对多轮对话中超过 $k$ 轮的历史进行光学处理, 取得约 $10\times$ 压缩效率.

<!-- page 19 of 22 -->



### Figure 13 embedded text (original)

```text
Very Clear Clear

Blurry Very Blurry Almost Gone

Crystal Clear

Time →

1 hour

1 day 1 week 1 month 1 year

Just happened

Memory

Very Clear Clear

Blurry Very Blurry Almost Gone

Crystal Clear

Distance↑

Vision

50cm

1m 3m 10m 20m

10cm

Very Clear Clear

Blurry Very Blurry Almost Gone

Crystal Clear

Resolution↓

Gundam

Large Base Small Tiny

Text

Text token
```

图 13 把时间增加, 观察距离增加与输入分辨率降低并列, 用 Crystal Clear 到 Almost Gone 的清晰度变化说明 Gundam, Large, Base, Small 与 Tiny 档位所设想的渐进遗忘过程.

Figure 13 | Forgetting mechanisms constitute one of the most fundamental characteristics of human memory. The contexts optical compression approach can simulate this mechanism by rendering previous rounds of historical text onto images for initial compression, then progressively resizing older images to achieve multi-level compression, where token counts gradually decrease and text becomes increasingly blurred, thereby accomplishing textual forgetting.

For older contexts, we could progressively downsizing the rendered images to further reduce token consumption. This assumption draws inspiration from the natural parallel between human memory decay over time and visual perception degradation over spatial distance—both exhibit similar patterns of progressive information loss, as shown in Figure 13. By combining these mechanisms, contexts optical compression method enables a form of memory decay that mirrors biological forgetting curves, where recent information maintains high fidelity while distant memories naturally fade through increased compression ratios.

对更早的上下文, 可以逐步缩小已渲染图像, 进一步降低 token 消耗. 这一设想来自时间上的人类记忆衰减与空间距离增加时的视觉感知退化: 如 Figure 13 所示, 两者都呈现渐进的信息损失. 上下文光学压缩把两种机制结合, 形成近似遗忘曲线的记忆衰减: 近期信息保持较高保真度, 久远信息则随压缩比上升逐渐淡化.

While our initial exploration shows potential for scalable ultra-long context processing, where recent contexts preserve high resolution and older contexts consume fewer resources, we acknowledge this is early-stage work that requires further investigation. The approach suggests a path toward theoretically unlimited context architectures that balance information retention with computational constraints, though the practical implications and limitations of such vision-text compression systems warrant deeper study in future research.

初步探索展示了一种可扩展超长上下文处理的可能性: 近期上下文保持高分辨率, 旧上下文消耗更少资源. 但这仍是需要继续研究的早期工作. 该方法提示了一条通往理论上无限上下文架构的路径, 在信息保留与计算约束之间取舍; 视觉文本压缩系统的实际影响和局限仍需深入研究.

## 6. Conclusion · 结论

In this technical report, we propose DeepSeek-OCR and preliminarily validate the feasibility of contexts optical compression through this model, demonstrating that the model can effectively decode text tokens exceeding 10 times the quantity from a small number of vision tokens. We believe this finding will facilitate the development of VLMs and LLMs in the future. Additionally, DeepSeek-OCR is a highly practical model capable of large-scale pretraining data production, serving as an indispensable assistant for LLMs. Of course, OCR alone is insufficient to fully validate true context optical compression and we will conduct digital-optical text interleaved pretraining, needle-in-a-haystack testing, and other evaluations in the future. From another perspective, optical contexts compression still offers substantial room for research and improvement, representing a promising new direction.

这份技术报告提出 DeepSeek-OCR, 并以该模型初步验证上下文光学压缩的可行性, 说明少量视觉 token 可以有效解码数量超过其 10 倍的文本 token. 我们认为这一发现将推动 VLM 与 LLM 的后续发展. DeepSeek-OCR 也是具有实用性的模型, 能够大规模生产预训练数据并辅助 LLM. 仅靠 OCR 尚不足以完整验证真正的上下文光学压缩, 后续还需要开展数字文本与光学文本交错预训练, needle-in-a-haystack 测试等评测. 上下文光学压缩仍有较大研究和改进空间.

<!-- page 20 of 22 -->

References

[1] Marker. URL https://github.com/datalab-to/marker.

[2] Mathpix. URL https://mathpix.com/.

[3] Ocrflux, 2025. URL https://github.com/chatdoc-com/OCRFlux.

[4] G. AI. Gemini 2.5-pro, 2025. URL https://gemini.google.com/.

[5] S. Bai et al. Qwen2.5-vl technical report. arXiv:2502.13923, 2025.

[6] L. Blecher et al. Nougat: Neural optical understanding for academic documents. arXiv:2308.13418, 2023.

[7] J. Chen et al. Onechart: Purify the chart structural extraction via one auxiliary token. ACM Multimedia, 2024.

[8] Z. Chen et al. How far are we to gpt-4v? arXiv:2404.16821, 2024.

[9] C. Cui et al. Paddleocr 3.0 technical report. arXiv:2507.05595, 2025.

[10] M. Dehghani et al. Patch n’ pack: Navit. NeurIPS, 2023.

[11] H. Feng et al. Dolphin. arXiv:2505.14059, 2025.

[12] Y. Goyal et al. Making the v in vqa matter. CVPR, 2017.

[13] J. Gu et al. Wukong. NeurIPS, 2022.

[14] High-flyer. HAI-LLM, 2023. URL https://www.high-flyer.cn/en/blog/hai-llm.

[15] S. Iyer et al. Opt-iml. arXiv:2212.12017, 2022.

[16] S. Kazemzadeh et al. Referitgame. EMNLP, 2014.

<!-- page 21 of 22 -->

[17] A. Kirillov et al. Segment anything. arXiv:2304.02643, 2023.

[18] Z. Li et al. Monkeyocr. arXiv:2506.05218, 2025.

[19] A. Liu et al. Deepseek-v2. arXiv:2405.04434, 2024.

[20] A. Liu et al. Deepseek-v3 technical report. arXiv:2412.19437, 2024.

[21] C. Liu et al. Focus anywhere for fine-grained multi-page document understanding. arXiv:2405.14295, 2024.

[22] I. Loshchilov and F. Hutter. SGDR. arXiv:1608.03983, 2016.

[23] I. Loshchilov and F. Hutter. Decoupled weight decay regularization. ICLR, 2019.

[24] A. Masry et al. Chartqa. arXiv:2203.10244, 2022.

[25] A. Nassar et al. Smoldocling. arXiv:2503.11576, 2025.

[26] OpenAI. Gpt-4 technical report, 2023.

[27] L. Ouyang et al. Omnidocbench. CVPR, 2025.

[28] J. Poznanski et al. olmocr. arXiv:2502.18443, 2025.

[29] A. Radford et al. Learning transferable visual models from natural language supervision. ICML, 2021.

[30] Rednote. dots.ocr, 2025. URL https://github.com/rednote-hilab/dots.ocr.

[31] C. Schuhmann et al. Laion-400m. arXiv:2111.02114, 2021.

<!-- page 22 of 22 -->

[32] A. Singh et al. Towards vqa models that can read. CVPR, 2019.

[33] T. Sun et al. Pp-doclayout. arXiv:2503.17213, 2025.

[34] B. Wang et al. Mineru. arXiv:2409.18839, 2024.

[35] P. Wang et al. Qwen2-vl. arXiv:2409.12191, 2024.

[36] H. Wei et al. Vary. ECCV, 2024.

[37] H. Wei et al. Small language model meets with reinforced vision vocabulary. arXiv:2401.12503, 2024.

[38] H. Wei et al. General ocr theory. arXiv:2409.01704, 2024.

[39] H. Wei et al. Slow perception. arXiv:2412.20631, 2024.

[40] Z. Wu et al. Deepseek-vl2. arXiv:2412.10302, 2024.

[41] W. Yu et al. Mm-vet. arXiv:2308.02490, 2023.

[42] J. Zhu et al. Internvl3. arXiv:2504.10479, 2025.
