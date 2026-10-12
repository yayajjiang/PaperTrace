---
title: "01 · DeepSeek-Coder-V2 · 对照译稿"
category: "模型技术报告"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek-Coder-V2 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 19 -->

(第 1 / 19 页)

# DeepSeek-Coder-V2: Breaking the Barrier of Closed-Source Models in Code Intelligence # DeepSeek-Coder-V2: 打破代码智能领域的闭源壁垒

Qihao Zhu\*, Daya Guo\*, Zhihong Shao\*, Dejian Yang\*, Peiyi Wang, Runxin Xu, Y. Wu Yukun Li, Huazuo Gao, Shirong Ma, Wangding Zeng, Xiao Bi, Zihui Gu, Hanwei Xu, Damai Dai Kai Dong, Liyue Zhang, Yishi Piao, Zhibin Gou, Zhenda Xie, Zhewen Hao, Bingxuan Wang Junxiao Song, Deli Chen, Xin Xie, Kang Guan, Yuxiang You, Aixin Liu, Qiushi Du, Wenjun Gao Xuan Lu, Qinyu Chen, Yaohui Wang, Chengqi Deng, Jiashi Li, Chenggang Zhao Chong Ruan, Fuli Luo, Wenfeng Liang

作者列表同原文(＊为核心贡献者).

DeepSeek-AI

DeepSeek-AI

https://github. com/deepseek-ai/DeepSeek-Coder-V2

https://github. com/deepseek-ai/DeepSeek-Coder-V2

## Abstract

We present DeepSeek-Coder-V2, an open-source Mixture-of-Experts (MoE) code language model that achieves performance comparable to GPT4-Turbo in code-specific tasks. Specifically, DeepSeek-Coder-V2 is further pre-trained from an intermediate checkpoint of DeepSeek-V2 with additional 6 trillion tokens. Through this continued pre-training, DeepSeek-Coder-V2 substantially enhances the coding and mathematical reasoning capabilities of DeepSeek-V2, while maintaining comparable performance in general language tasks. Compared to DeepSeek-Coder-33B, DeepSeek-Coder-V2 demonstrates significant advancements in various aspects of code-related tasks, as well as reasoning and general capabilities. Additionally, DeepSeek-Coder-V2 expands its support for programming languages from 86 to 338, while extending the context length from 16K to 128K. In standard benchmark evaluations, DeepSeek-Coder-V2 achieves superior performance compared to closed-source models such as GPT4-Turbo, Claude 3 Opus, and Gemini 1.5 Pro in coding and math benchmarks.

DeepSeek-Coder-V2 是开源 **Mixture-of-Experts(MoE)** 代码语言模型, 代码专项任务上接近 GPT4-Turbo. 它从 DeepSeek-V2 的中间 checkpoint 继续预训练, 再喂 6 万亿 token, 显著抬高代码与数学推理, 通用语言能力大体还在. 相对 DeepSeek-Coder-33B, 代码, 推理与通用面都有明显进步; 支持语言从 86 种扩到 338 种, 上下文从 16K 拉到 128K. 标准基准上, 代码与数学评测超过 GPT4-Turbo, Claude 3 Opus, Gemini 1.5 Pro 等闭源模型.

![Chart block](. /images/p01-figure-1-the-performance-of-deepseek-coder-v2-on-math.png)

![图](. /images/p01-figure-1-the-performance-of-deepseek-coder-v2-on-math.png)

Figure 1 | The Performance of DeepSeek-Coder-V2 on math and code benchmarks.

图 1｜DeepSeek-Coder-V2 在数学与代码基准上的表现.

arXiv: 2406.11931v1 [cs. SE] 17 Jun 2024

arXiv: 2406.11931v1 [cs. SE] 17 Jun 2024

Qdeepseek

(页眉/水印残留)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280">\*Core contributors</span></small>

＊主要贡献者

<!-- page 2 of 19 -->

(第 2 / 19 页)

## 1. Introduction

The open-source community has made significant strides in advancing code intelligence through the development of open-source code models such as StarCoder (Li et al., 2023b; Lozhkov et al., 2024), CodeLlama (Roziere et al., 2023), DeepSeek-Coder (Guo et al., 2024), and Codestral (MistralAI, 2024). These models have steadily approached the performance levels of closedsource counterparts, contributing to the progress of code intelligence. However, there remains a discernible gap when comparing them to state-of-the-art closed-source models like GPT4-Turbo (OpenAI, 2023), Claude 3 Opus (Anthropic, 2024), and Gemini 1.5 Pro (Reid et al., 2024). To bridge this gap and further propel the development of open-source code models, we introduce the DeepSeek-Coder-V2 series. These models are built upon the foundation of DeepSeek-V2 (DeepSeek-AI, 2024) and are further pre-trained with an additional corpus with 6 trillion tokens.

开源社区靠 StarCoder, CodeLlama, DeepSeek-Coder, Codestral 等代码模型把代码智能往前推了一大截, 已逐步逼近闭源, 但相对 GPT4-Turbo, Claude 3 Opus, Gemini 1.5 Pro 仍有可见差距. 为补上这截差距, 团队推出 DeepSeek-Coder-V2 系列: 在 DeepSeek-V2 之上, 再用额外约 6 万亿 token 继续预训练.

In the pre-training phase, the dataset of DeepSeek-Coder-V2 is created with a composition of 60% source code, 10% math corpus, and 30% natural language corpus. The source code consists of 1, 170B code-related tokens sourced from GitHub and CommonCrawl, using the same pipeline as DeepSeekMath (Shao et al., 2024). This corpus expands from 86 to 338 programming languages compared to the code corpus used to train DeepSeek-Coder. To demonstrate the effectiveness of the new code corpus, we conduct ablation studies with the 1B parameter model and observe improvements of 6.7% and 9.4% in accuracy across both HumanEval (from 30.5% to 37.2%) and MBPP (from 44.6% to 54.0%) benchmarks (Austin et al., 2021a; Chen et al., 2021), respectively. For the math corpus, we collect 221B math-related tokens sourced from CommonCrawl using the same pipeline, which approximately doubles the size of the 120B DeepSeekMath corpus (Shao et al., 2024), while for the natural language corpus, we directly sample from the training corpus in DeepSeek-V2. In total, DeepSeek-Coder-V2 has been exposed to 10.2T training tokens, where 4.2 trillion tokens originate from the DeepSeek V2 dataset, while the remaining 6 trillion tokens come from the DeepSeek-Coder-V2 dataset.

预训练数据配比是 **60% 源码, 10% 数学, 30% 自然语言**. 源码侧共 1, 170B 代码相关 token, 来自 GitHub 与 CommonCrawl, 管道与 DeepSeekMath 相同; 相对 DeepSeek-Coder 的语料, 语言覆盖从 86 种扩到 338 种. 用 1B 模型做消融: HumanEval 从 30.5% 到 37.2%(+6.7%), MBPP 从 44.6% 到 54.0%(+9.4%). 数学语料从 CommonCrawl 捞到 221B token, 大约是 DeepSeekMath 120B 的两倍; 自然语言直接从 DeepSeek-V2 训练语料采样. 合计见过 10.2T token: 4.2T 来自 DeepSeek-V2, 6T 来自 Coder-V2 新数据.

To accommodate longer code inputs and enhance applicability across various programming scenarios, we extend the context length from 16K to 128K tokens, allowing our models to handle more complex and extensive coding tasks. After continuous pre-training DeepSeek V2 on this multi-source corpora, we find that DeepSeek-Coder-V2 significantly enhances the model’s capabilities in coding and mathematical reasoning while maintaining comparable general language performance.

为适配更长代码输入, 上下文从 16K 扩到 128K. 在多源语料上继续预训练后, 代码与数学推理明显变强, 通用语言表现大体与 DeepSeek-V2 相当.

In the alignment phase, we first construct an instruction training dataset that includes code and math data from DeepSeek-Coder (Guo et al., 2024) and DeepSeek-Math (Shao et al., 2024), as well as general instruction data from DeepSeek-V2 (DeepSeek-AI, 2024). This dataset is used to fine-tune the base model. Then, in the reinforcement learning phase, we employ Group Relative Policy Optimization (GRPO) algorithm to align its behavior with human preferences. Preference data is collected in the coding domain using compiler feedback and test cases, and a reward model is developed to guide the training of the policy model. This approach ensures that the model’s responses are optimized for correctness and human preference in coding tasks. To enable the model to support code completion after alignment, we also utilize Fill-In-Middle approach (Guo et al., 2024) during the fine-tuning of the base model with 16B parameters.

对齐阶段: 先用 DeepSeek-Coder, DeepSeek-Math 的代码与数学指令, 加上 DeepSeek-V2 的通用指令, 微调基座; 再用 **GRPO** 做强化学习, 对齐人类偏好. 代码域偏好数据靠编译器反馈与测试用例收集, 并训奖励模型指导策略. 16B 基座微调时还保留 **Fill-In-Middle(FIM)**, 对齐后仍能做代码补全.

## 1.1. Contributions ## 1.1. 贡献

In summary, our main contributions are:

主要贡献如下:

• We introduce DeepSeek-Coder-V2 with 16B and 236B parameters based on the DeepSeek-

• 推出基于 DeepSeek-MoE 的 DeepSeek-Coder-V2, 含 16B 与 236B 两档,

2

(页码 2)

<!-- page 3 of 19 -->

(第 3 / 19 页)

MoE framework, which has activation parameters of only 2.4B and 21B, efficiently supporting diverse computational and application needs. Additionally, DeepSeek-Coder-V2 supports 338 programming languages and a maximum context length of 128K tokens.

激活参数仅 2.4B / 21B, 兼顾不同算力需求; 并支持 338 种编程语言, 最长 128K 上下文.

• We make the first attempt to develop an open-source hundred-billion-parameter code model to advance the field of code intelligence. Experimental results indicate that DeepSeek-Coder-V2 236B outperforms state-of-the-art closed-source models, such as GPT4-Turbo, Claude 3 Opus, and Gemini 1.5 Pro, in both coding and mathematics tasks.

• 首次尝试开源千亿参数量级代码模型; 实验显示 236B 版在代码与数学上超过 GPT4-Turbo, Claude 3 Opus, Gemini 1.5 Pro 等当时顶尖闭源模型.

• DeepSeek-Coder-V2 models are released publicly under a permissive license, allowing for both research and unrestricted commercial use.

• 以宽松许可公开发布, 研究与无限制商用均可.

## 1.2. Summary of Evaluations and Metrics ## 1.2. 评测与指标摘要

• Code: Regarding code generation benchmark evaluation, DeepSeek-Coder-V2 demonstrates remarkable superiority over all open source models while exhibiting performance on par with the leading closed-source models, such as GPT4-Turbo, Claude 3 Opus, and Gemini 1.5 Pro. Notably, we achieve a 90.2% score on HumanEval (Chen et al., 2021), a 76.2% score on MBPP (Austin et al., 2021a) (establishing a new state-of-the-art result with EvalPlus evaluation pipeline), and a 43.4% score on LiveCodeBench (Jain et al., 2024) (questions from Dec. 2023 to June. 2024). Additionally, DeepSeek-Coder-V2 is the first open-source model that surpasses a score of 10% on SWEBench (Jimenez et al., 2023).

• **代码**: 生成基准上全面压过开源, 并与 GPT4-Turbo, Claude 3 Opus, Gemini 1.5 Pro 等顶尖闭源持平或接近. HumanEval 90.2%, MBPP 76.2%(EvalPlus 管线下新 SOTA), LiveCodeBench 43.4%(2023-12 至 2024-06 题目). 也是首个在 SWE-Bench 上超过 10% 的开源模型.

• Math: DeepSeek-Coder-V2 exhibits strong mathematical reasoning abilities, rivaling top closed-source models such as GPT-4o, Gemini 1.5 Pro, and Claude 3 Opus on both elementary benchmarks like GSM8K (Cobbe et al., 2021) and advanced competition-level benchmarks including MATH (Hendrycks et al., 2021), AIME (MAA, 2024), and Math Odyssey (Netmind. AI, 2024). Notably, DeepSeek-Coder-V2 attains an accuracy of 75.7% on the MATH benchmark, nearly matching the state-of-the-art accuracy of 76.6% achieved by GPT-4o. Furthermore, it surpasses the performance of these closed-source models in the AIME 2024 competition.

• **数学**: 小学难度 GSM8K 到竞赛级 MATH, AIME, Math Odyssey 上, 都能跟 GPT-4o, Gemini 1.5 Pro, Claude 3 Opus 较劲. MATH 准确率 75.7%, 接近 GPT-4o 的 76.6%; AIME 2024 上超过这些闭源模型.

• Natural Language: DeepSeek-Coder-V2 maintains comparable general language performance to DeepSeek-V2. For example, DeepSeek-Coder-V2 achieves 79.2% on MMLU with OpenAI simple-eval pipeline. Regarding subjective evaluation with GPT-4 as a judger, DeepSeek-Coder-V2 achieves 65.0 on arena-hard (Li et al., 2024), 8.77 on MT-bench (Zheng et al., 2023) and 7.84 on alignbench (Liu et al., 2023c). These scores are significantly better than other code-specific models, even comparable with general open source models.

• **自然语言**: 通用能力与 DeepSeek-V2 大体相当. OpenAI simple-eval 下 MMLU 79.2%; GPT-4 作裁判时 arena-hard 65.0, MT-bench 8.77, alignbench 7.84-- 明显好于其他代码专用模型, 也接近通用开源模型.

## 2. Data Collection ## 2. 数据收集

The pre-training data for DeepSeek-Coder-V2 primarily consists of 60% source code, 10% math corpus, and 30% natural language corpus. Since the natural language corpus is directly sampled from the training dataset of DeepSeek-V2, this section focuses on the collection, cleaning, and filtering processes of the code and math data. Meanwhile, we further validate the quality of this data through comparative analysis experiments.

预训练主配比: 60% 源码, 10% 数学, 30% 自然语言. 自然语言直接采自 DeepSeek-V2 训练数据, 故本节集中讲代码与数学的采集, 清洗, 过滤, 并用对比实验验证质量.

We collect public repositories created before November 2023 on GitHub. We first apply the same filtering rules and near-deduplication as those used in the DeepSeek-Coder (Guo et al., 2024) to filter out lower-quality and duplicated source code. To make the paper self-contained, we briefly describe the filtering rules. Firstly, we filter out files with an average line length exceeding 100 characters or a maximum line length surpassing 1000 characters. Additionally, we remove files with fewer than 25% alphabetic characters. Except for the XSLT programming language, we further filter out files where the string "<? xml version=" appears in the first 100

GitHub 上取创建时间不晚于 2023 年 11 月的公开仓库, 过滤规则与近重复去重与 DeepSeek-Coder 一致. 规则概要: 平均行长 >100 或最大行长 >1000 的文件去掉; 字母字符占比 <25% 的去掉; 除 XSLT 外, 前 100 字符含 `<? xml version=` 的去掉; HTML 要求可见文本至少占代码 20% 且不少于 100 字符; JSON/YAML 只留 50–5000 字符, 以甩掉数据堆文件. 过滤与近重复去重后得到 821B 代码(338 种语言)和 185B 代码相关文本(markdown, issues 等). 语言列表见附录 A; 分词器与 DeepSeek-V2 相同.

3

(页码 3)

<!-- page 4 of 19 -->

(第 4 / 19 页)

characters. For HTML files, we consider the ratio of visible text to HTML code. We retain files where the visible text constitutes at least 20% of the code and is no less than 100 characters. For JSON and YAML files, which typically contain more data, we only keep files that have a character count ranging from 50 to 5000 characters. This effectively removes most data-heavy files. By applying these filtering rules and near-deduplication, we obtain 821B code encompassing 338 programming languages and 185B code-related text, such as markdown and issues. The list of supported programming languages can be found in the Appendix A. We use the same tokenizer as DeepSeekV2, detailed in (DeepSeek-AI, 2024).

GitHub 上取创建时间不晚于 2023 年 11 月的公开仓库, 过滤规则与近重复去重与 DeepSeek-Coder 一致. 规则概要: 平均行长 >100 或最大行长 >1000 的文件去掉; 字母字符占比 <25% 的去掉; 除 XSLT 外, 前 100 字符含 `<? xml version=` 的去掉; HTML 要求可见文本至少占代码 20% 且不少于 100 字符; JSON/YAML 只留 50–5000 字符, 以甩掉数据堆文件. 过滤与近重复去重后得到 821B 代码(338 种语言)和 185B 代码相关文本(markdown, issues 等). 语言列表见附录 A; 分词器与 DeepSeek-V2 相同.

To collect code-related and math-related web texts from Common Crawl, we follow the same pipeline as DeepSeekMath (Shao et al., 2024). Specifically, we select coding forums such as StackOverflow<sup>1</sup>, library sites such as PyTorch documentation<sup>2</sup>, and mathematics website such as StackExchange<sup>3</sup> as our initial seed corpus. Using this seed corpus, we train a fastText model (Joulin et al., 2016) to recall more coding-related and math-related web pages. Since tokenization for languages like Chinese cannot be done through spaces, we use the Byte Pair Encoding (BPE) tokenizer from DeepSeek-V2, which significantly improves the recall accuracy of fastText. For each domain, we calculate the percentage of web pages collected in the first iteration. Domains with over 10% of web pages collected are classified as code-related or math-related. We then annotate the URLs associated with code-related or math-related content within these identified domains. Uncollected web pages linked to these URLs are added to the seed corpus. After three iterations of data collection, we gather 70 billion code-related tokens and 221B math-related tokens from web pages. To further collect high-quality source code from GitHub, we also apply the same pipeline on GitHub with two iterations of data collection and collect 94B source code. The initial seed corpus is constructed by manually collecting high-quality source code, such as those containing detailed descriptions. Finally, the new code corpus consists of 1, 170B code-related tokens sourced from GitHub and CommonCrawl.

Common Crawl 上采代码/数学网页, 流程同 DeepSeekMath: 以 StackOverflow, PyTorch 文档, StackExchange 等为种子, 训 **fastText** 召回更多页面. 中文等不能靠空格切词, 故用 DeepSeek-V2 的 BPE, 召回更准. 每个域名算首轮召回占比, 超过 10% 标为代码或数学相关; 再标注这些域名下相关 URL, 把未入库页面补进种子. 三轮后从网页得到 70B 代码相关 token, 221B 数学相关 token. GitHub 上再跑两轮同类管道, 捞到 94B 高质量源码(种子为人工精选, 含详细说明的代码). 最终新代码语料合计 1, 170B 代码相关 token(GitHub + CommonCrawl).

To demonstrate the effectiveness of the new code corpus, we conducted ablation studies (see Table 1) using a 1B parameter model, comparing it with the corpus used to train DeepSeek-Coder. Pre-training the 1B model on the new code corpus using 1T tokens resulted in improvements of 5.5% and 4.4% in accuracy on the HumanEval (from 30.5% to 36.0%) and MBPP (from 44.6% to 49.0%) benchmarks, respectively. Further training the 1B model with 2T tokens led to additional improvements, with HumanEval and MBPP scores rising to 37.2% and 54.0%, respectively. Therefore, the new code corpus is superior to the code corpus used to train DeepSeek-Coder.

用 1B 模型消融(表 1): 新语料训 1T token, HumanEval 30.5%→36.0%(+5.5%), MBPP 44.6%→49.0%(+4.4%); 再训到 2T, 分别到 37.2% 与 54.0%. 结论: 新代码语料优于 DeepSeek-Coder 所用语料.

| Model | Tokens | Python | C++ | Java | PHP | TS | C# | Bash | JS | Avg | MBPP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DeepSeek-Coder-1B | 1T | 30.5% | 28.0% | 31.7% | 23.0% | 30.8% | 31.7% | 9.5% | 28.6% | 26.7% | 44.6% |
| DeepSeek-Coder-V2-1B | 1T | 36.0% | 34.8% | 31.7% | 27.3% | 37.7% | 34.2% | 6.3% | 38.5% | 31.2% | 49.0% |
| DeepSeek-Coder-V2-1B | 2T | 37.2% | 39.1% | 32.3% | 31.7% | 34.6% | 36.7% | 12.0% | 32.9% | 32.0% | 54.0% |

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 1 | Performance of 1B base model between DeepSeek-Coder and DeepSeek-Coder-V2.

表 1｜1B 基座模型上 DeepSeek-Coder 与 DeepSeek-Coder-V2 的对比.

## 3. Training Policy ## 3. 训练策略

## 3.1. Training Strategy ## 3.1. 训练策略

We use two training objectives for DeepSeek-Coder-v2 16B: Next-Token-Prediction and Fill-In-Middle (FIM) (Bavarian et al., 2022; Guo et al., 2024; Li et al., 2023b). For DeepSeek-Coder-v2

DeepSeek-Coder-V2 16B 使用 Next-Token-Prediction 与 Fill-In-Middle(FIM)两个训练目标(Bavarian et al., 2022; Guo et al., 2024; Li et al., 2023b). 对 DeepSeek-Coder-V2

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>1</sup>https://stackoverflow. com</span></small>

¹ https://stackoverflow. com

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>2</sup>https://pytorch. org/docs</span></small>

² https://pytorch. org/docs

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>3</sup>https://math. stackexchange. com</span></small>

³ https://math. stackexchange. com

4

(页码 4)

<!-- page 5 of 19 -->

(第 5 / 19 页)

236B, we only utilize the Next-Token-Prediction objective. Here we give a brief introduction of the FIM training policy. We adopt the FIM training approach for the development of DeepSeek-Coder-v2-16B, leveraging the PSM (Prefix, Suffix, Middle) mode. This method structures the content reconstruction in the sequence: Prefix, Suffix, and Middle, as illustrated below:

236B 则只用 Next-Token-Prediction. 下面简述 FIM 策略: 16B 采用 PSM(Prefix, Suffix, Middle)模式, 按前缀, 后缀, 中间的顺序重构内容, 示意如下:

$$
<   | \text { fim\_begin } | > f _ {p r e} <   | \text { fim\_hole } | > f _ {s u f} <   | \text { fim\_end } | > f _ {m i d d l e} <   | \text { eos\_token } | >
$$

(表格/公式结构同原文; 数字, 符号, URL 不改.)

This structure is applied at the document level as part of the pre-packing process. The FIM is utilized at a rate of 0.5, consistent with the PSM framework, to enhance the training efficacy and model performance.

该结构在文档级, 预打包阶段施加; FIM 比例 0.5, 与 PSM 设定一致.

## 3.2. Model Architecture ## 3.2. 模型架构

Our architecture aligns with that of DeepSeekV2 (DeepSeek-AI, 2024). The hyperparameters settings, 16B and 236B, correspond to those used in DeepSeek-V2-Lite and DeepSeek-V2, respectively. Notably, we encountered instability during training and spikes in gradient values, which we attributed to the exponential normalization technique. To address this, we reverted to the conventional normalization method.

架构对齐 DeepSeek-V2; 16B, 236B 的超参分别对应 V2-Lite 与 V2. 训练中出现不稳定与梯度尖峰, 归因于指数归一化, 遂改回常规归一化.

## 3.3. Training Hyper-Parameters ## 3.3. 训练超参数

Consistent with the DeepSeek V2 methodology (DeepSeek-AI, 2024), we utilize the AdamW optimizer (Loshchilov and Hutter, 2019), configured with$\beta _ { 1 } = 0 . 9 , \beta _ { 2 } = 0 . 9 5 , $, and a weight decay of 0.1. Batch sizes and learning rates are adjusted according to DeepSeek-V2 specifications. For learning rate scheduling, we employ a cosine decay strategy, starting with 2000 warm-up steps and gradually reducing the learning rate to 10% of its initial value.

沿用 DeepSeek-V2: AdamW, $\beta_1=0.9$, $\beta_2=0.95$, weight decay 0.1; batch 与学习率按 V2 规格. 学习率余弦衰减, 2000 步 warmup, 最终降到初值的 10%.

Both DeepSeek-Coder-V2 and DeepSeek-Coder-V2-Lite are trained using the same methodology. To maintain robust natural language understanding capabilities in DeepSeek-Coder-V2, we continue the pre-training process from an intermediate checkpoint of DeepSeek-V2. The intermediate checkpoint was initially trained on 4.2T tokens. Consequently, DeepSeek-Coder-V2 has been exposed to a total of 10.2T high-quality tokens during the pre-training phase.

Coder-V2 与 Lite 训练方法相同. 为保住自然语言理解, 从已训过 4.2T token 的 DeepSeek-V2 中间 checkpoint 继续训, 预训练阶段合计见过 10.2T 高质量 token.

| Model | DeepSeek-Coder-V2-Lite | DeepSeek-Coder-V2 |
| --- | --- | --- |
| # Total Parameters (#TP) | 16B | 236B |
| # Active Parameters (#AP) | 2.4B | 21B |
| Pre-training Tokens | 4.2T+6T | 4.2T+6T |
| LR Scheduler | Cosine | Cosine |
| FIM | Enable | Disable |

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 2 | Training Setting of DeepSeek-Coder-V2.

表 2｜DeepSeek-Coder-V2 的训练设置.

## 3.4. Long Context Extension ## 3.4. 长上下文扩展

Following DeepSeek-V2, we extend the context length of DeepSeek-Coder-V2 to 128K using YaRN (Peng et al., 2023). The hyper-parameters of YaRN are the same as DeepSeek-V2: the scale $s$ is set to 40, $\alpha$ to 1, and $\beta$ to 32. We further continue training the model using two stages to enhance its capability for handling long contexts. In the first stage, we utilize a sequence length of 32K and a batch size of 1152 for 1000 steps. In the second stage, we train the model for an additional 1000 steps, employing a sequence length of 128K and a batch size of 288 sequences.

沿用 DeepSeek-V2, 用 **YaRN** 扩到 128K: scale=40, beta 为 1 与 32. 再分两阶段续训: 第一阶段序列长 32K, batch 1152, 1000 步; 第二阶段序列长 128K, batch 288, 再 1000 步.

5

(页码 5)

<!-- page 6 of 19 -->

(第 6 / 19 页)

![Chart block](. /images/p06-figure-2-evaluation-results-on-the-needle-in-a-haystack.png)

![图](. /images/p06-figure-2-evaluation-results-on-the-needle-in-a-haystack.png)

Figure 2 | Evaluation results on the “Needle In A Haystack” (NIAH) tests. DeepSeek-Coder-V2 performs well across all context window lengths up to 128K.

图 2｜“Needle In A Haystack”(NIAH)测试结果. DeepSeek-Coder-V2 在直至 128K 的各上下文窗口长度上表现良好.

It should be noted here we upsample long context data ratio during long context extension. As shown in Figure 2, the results on the “Needle In A Haystack” (NIAH) tests indicate that DeepSeek-Coder-V2 performs well across all context window lengths up to 128K.

长上下文扩展阶段会上采样长上下文数据比例. 如图 2, “Needle In A Haystack”(NIAH)结果显示, DeepSeek-Coder-V2 在直至 128K 的各窗口长度上表现良好.

## 3.5. Alignment ## 3.5. 对齐

## 3.5.1. Supervised Fine-Tuning ## 3.5.1. 监督微调

To build DeepSeek-Coder-V2 Chat, we construct the instruction training dataset mixed with code and math data. We first collect 20k code-related instruction data and 30k math related data from DeepSeek-Coder and DeepSeek-Math. To maintain the general ability, we also sample several data from the instruction data of DeepSeek-V2. Finally, we use a instruction dataset of 300M tokens. For training, we use a cosine schedule with 100 warm-up steps and an initial learning rate$5 e ^ { - 6 }$. We also use a batch size of 1M tokens and 1B tokens in total.

为得到 Chat: 从 DeepSeek-Coder / DeepSeek-Math 取约 20k 代码指令, 30k 数学指令, 再从 DeepSeek-V2 指令数据采样以保通用能力, 合计约 300M token. 训练: 余弦日程, 100 步 warmup, 初学习率 $5\times10^{-6}$; batch 约 1M token, 总共约 1B token.

## 3.5.2. Reinforcement Learning ## 3.5.2. 强化学习

We further employ Reinforcement Learning (RL) techniques to fully simulate the capabilities of DeepSeek-Coder-V2, which is proven to be quite effective.

再用强化学习进一步拉满能力, 经验上很有效.

Prompts Considerable effort was spent collecting prompts related to code and math from various sources, and each code prompt comes with corresponding test cases. After filtering the prompts, there are approximately 40k data in total.

**提示**: 多方收集代码与数学相关 prompt, 代码题均配测试用例; 过滤后约 40k 条.

Reward Modeling Reward models play crucial roles in the RL training. In terms of mathematical preference data, we obtain them using the ground-truth labels. In terms of code preference data, although the code compiler itself can already provide 0-1 feedback (whether the code pass all test cases or not), some code prompts may have a limited number of test cases, and do not provide full coverage, and hence directly using 0-1 feedback from the compiler may be noisy and sub-optimal. Therefore, we still decide to train a reward model on the data provided by the compiler, and use the reward model to provide signal during RL training, which is more robust

**奖励建模** 奖励模型在 RL 中很关键. 数学偏好数据用 ground-truth 标签; 代码侧虽有编译器 0-1 反馈(是否通过全部测试), 但部分题测试覆盖不足, 直接用编译器信号可能噪声大, 并非最优. 因此仍在编译器数据上训练奖励模型, 用它在 RL 中给信号, 更稳健

6

(页码 6)

<!-- page 7 of 19 -->

(第 7 / 19 页)

and has better generalization ability, in comparison with raw compiler signal. As illustrated in Figure 3, in our in-house test sets (Leetcode and Leetcode-zh), using a reward model to provide RL training signal clearly outperforms using raw compiler signal. Hence, we use reward model signal rather than compiler signal in all subsequent experiments.

且泛化通常好于原始编译器信号. 如图 3, 在内部测试集(Leetcode 与 Leetcode-zh)上, 奖励模型信号明显优于原始编译器信号; 后续实验一律用奖励模型信号.

Reinforcement Learning Algorithm We employ Group Relative Policy Optimization (GRPO) Shao et al. (2024) as our RL algorithm, which is the same as what DeepSeek-V2 uses. Notably, GRPO is proven to be quite effective and has less cost compared with PPO, since there is no need to maintain an additional critic model.

**RL 算法**: 采用与 DeepSeek-V2 相同的 **GRPO**. 相对 PPO 更省: 不必再维护 critic.

![Chart block](. /images/p07-chart.png)

![图](. /images/p07-chart.png)

![Chart block](. /images/p07-figure-3-performances-of-different-methods.png)

![图](. /images/p07-figure-3-performances-of-different-methods.png)

Figure 3 | Performances of Different Methods

图 3｜不同方法的表现

## 4. Experimental Results ## 4. 实验结果

In this section, we evaluate DeepSeek-Coder-V2 on three types of tasks, including coding, mathematics, and general natural language. We compare DeepSeek-Coder-V2 with the previous state-of-the-art large language models.

本节在代码, 数学, 通用自然语言三类任务上评测 DeepSeek-Coder-V2, 并与先前顶尖大模型对照.

• CodeLlama (Roziere et al., 2023) consists of a series of code language models based on Llama2 (Touvron et al., 2023), and continue pre-training on datasets ranging from 500 to 1000 billion code tokens. These models are available in four sizes: 7B, 13B, 34B, and 70B.

• **CodeLlama**: 基于 Llama2 的代码系列, 在约 500–1000B 代码 token 上继续预训练; 规格 7B / 13B / 34B / 70B.

• StarCoder (Lozhkov et al., 2024) is a publicly accessible model with 15 billion parameters. It is specifically trained on a meticulously curated subset of the Stack dataset (Kocetkov et al., 2022), covering 86 programming languages.

• **StarCoder**: 15B 公开模型, 在精选 Stack 子集上训, 覆盖 86 种语言.

• StarCoder2 (Lozhkov et al., 2024) consists of 3B, 7B, and 15B parameters models trained on 3.3 to 4.3 trillion tokens of the Stack2 dataset (Lozhkov et al., 2024), spanning 619 programming languages.

• **StarCoder2**: 3B / 7B / 15B, 在 Stack2 的 3.3–4.3T token 上训, 覆盖 619 种语言.

• DeepSeek-Coder (Guo et al., 2024) comprises a series of code language models, ranging from 1 billion to 33 billion parameters. Each model is trained from scratch on 2 trillion tokens, with a composition of 87% code and 13% natural language in both English and Chinese. These models are pre-trained on a project-level code corpus using a window size of 16K and an additional fill-in-the-blank task, enabling support for project-level code completion and infilling.

• **DeepSeek-Coder**: 1B–33B, 从零训 2T token(87% 代码 + 13% 中英自然语言); 项目级语料, 16K 窗口, 并含填空任务, 支持项目级补全与中间填充.

• Codestral (MistralAI, 2024) is a 22B parameter model developed by Mistral. It is trained on a diverse dataset of over 80 programming languages, including popular ones such as Python, Java, and JavaScript, as well as more specialized languages like Swift and Fortran.

• **Codestral**: Mistral 的 22B 模型, 训练覆盖 80+ 语言(含 Python / Java / JavaScript, 以及 Swift, Fortran 等).

7

(页码 7)

<!-- page 8 of 19 -->

(第 8 / 19 页)

• General language models that we compare include Llama3 70B (Meta, 2024), GPT-4 (OpenAI, 2023), Claude 3 Opus (Anthropic, 2024), and Gemini 1.5 Pro (Reid et al., 2024). While they are not specifically trained on large code corpora, they achieve state-of-the-art performance in coding.

• **通用模型对照**: Llama3 70B, GPT-4, Claude 3 Opus, Gemini 1.5 Pro-- 虽非专为海量代码语料而训, 代码表现仍处顶尖.

## 4.1. Code Generation ## 4.1. 代码生成

HumanEval and MBPP Benchmarks. The HumanEval (Chen et al., 2021) <sup>4</sup> and MBPP (Austin et al., 2021b) benchmarks are commonly utilized for assessing the performance of code-generating Large Language Models (LLMs). HumanEval comprises 164 Python tasks that are verified through test cases to evaluate the performance of Code LLMs in a zero-shot scenario. For MBPP, we use the MBPP-Plus version (Liu et al., 2023a) to evaluate the models. To test the multilingual abilities of models, we extended the HumanEval benchmark problems into seven additional languages: C++, Java, PHP, TypeScript, C#, Bash, JavaScript, Swift, R, Julia, D, Rust and Racket. For both benchmarks, we employed a greedy search strategy and recreated the baseline results using identical scripts and environments to ensure a fair comparison.

**HumanEval 与 MBPP.** HumanEval(Chen et al., 2021)⁴ 与 MBPP(Austin et al., 2021b)常用来评测代码生成 LLM. HumanEval 含 164 个带测试用例的 Python 题, 零样本评测; MBPP 用 MBPP-Plus(Liu et al., 2023a). 为测多语言能力, 把 HumanEval 题扩展到 C++, Java, PHP, TypeScript, C#, Bash, JavaScript, Swift, R, Julia, D, Rust, Racket 等. 两端均用 greedy search, 并用同一脚本与环境复现基线以保证公平.

<table><tr><td></td><td>#TP</td><td>#AP</td><td>Python</td><td>Java</td><td>C++</td><td>C#</td><td>TS</td><td>JS</td><td>PHP</td><td>Bash</td></tr><tr><td colspan="11">Closed-Source Models</td></tr><tr><td>Gemini-1.5-Pro</td><td>-</td><td>-</td><td>83.5%</td><td>81.0%</td><td>78.3%</td><td>75.3%</td><td>77.4%</td><td>80.8%</td><td>74.5%</td><td>39.9%</td></tr><tr><td>Claude-3-Opus</td><td>-</td><td>-</td><td>84.2%</td><td>78.5%</td><td>81.4%</td><td>74.7%</td><td>76.1%</td><td>75.8%</td><td>78.3%</td><td>48.7%</td></tr><tr><td>GPT-4-1106</td><td>-</td><td>-</td><td>87.8%</td><td>82.3%</td><td>78.9%</td><td>80.4%</td><td>81.8%</td><td>80.1%</td><td>77.6%</td><td>55.7%</td></tr><tr><td>GPT-4-Turbo-0409</td><td>-</td><td>-</td><td>88.2%</td><td>81.7%</td><td>78.3%</td><td>79.1%</td><td>79.3%</td><td>80.8%</td><td>78.9%</td><td>55.1%</td></tr><tr><td>GPT-4o-0513</td><td>-</td><td>-</td><td>91.0%</td><td>80.4%</td><td>87.0%</td><td>82.9%</td><td>86.2%</td><td>87.6%</td><td>79.5%</td><td>53.8%</td></tr><tr><td colspan="11">Open-Source Models</td></tr><tr><td>Codestral</td><td>22B</td><td>22B</td><td>78.1%</td><td>71.5%</td><td>71.4%</td><td>77.2%</td><td>72.3%</td><td>73.9%</td><td>69.6%</td><td>47.5%</td></tr><tr><td>DS-Coder-instruct</td><td>33B</td><td>33B</td><td>79.3%</td><td>73.4%</td><td>68.9%</td><td>74.1%</td><td>67.9%</td><td>73.9%</td><td>72.7%</td><td>43.0%</td></tr><tr><td>Llama3-Instruct</td><td>70B</td><td>70B</td><td>81.1%</td><td>67.7%</td><td>64.0%</td><td>69.6%</td><td>69.8%</td><td>70.2%</td><td>65.8%</td><td>36.1%</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>16B</td><td>2.4B</td><td>81.1%</td><td>76.6%</td><td>75.8%</td><td>76.6%</td><td>80.5%</td><td>77.6%</td><td>74.5%</td><td>43.0%</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>236B</td><td>21B</td><td>90.2%</td><td>82.3%</td><td>84.8%</td><td>82.3%</td><td>83.0%</td><td>84.5%</td><td>79.5%</td><td>52.5%</td></tr><tr><td></td><td>#TP</td><td>#AP</td><td>Swift</td><td>R</td><td>Julia</td><td>D</td><td>Rust</td><td>Racket</td><td>MBPP+</td><td>Average</td></tr><tr><td colspan="11">Closed-Source Models</td></tr><tr><td>Gemini-1.5-Pro</td><td>-</td><td>-</td><td>66.5%</td><td>53.4%</td><td>71.7%</td><td>55.8%</td><td>73.1%</td><td>48.4%</td><td>74.6%</td><td>68.9%</td></tr><tr><td>Claude-3-Opus</td><td>-</td><td>-</td><td>63.9%</td><td>55.9%</td><td>76.1%</td><td>60.3%</td><td>71.2%</td><td>64.6%</td><td>72.0%</td><td>70.8%</td></tr><tr><td>GPT-4-1106</td><td>-</td><td>-</td><td>62.7%</td><td>57.8%</td><td>69.2%</td><td>60.9%</td><td>78.8%</td><td>64.0%</td><td>69.3%</td><td>72.5%</td></tr><tr><td>GPT-4-Turbo-0409</td><td>-</td><td>-</td><td>63.9%</td><td>56.5%</td><td>69.8%</td><td>61.5%</td><td>78.8%</td><td>63.4%</td><td>72.2%</td><td>72.3%</td></tr><tr><td>GPT-4o-0513</td><td>-</td><td>-</td><td>75.9%</td><td>65.2%</td><td>78.0%</td><td>60.9%</td><td>80.1%</td><td>64.6%</td><td>73.5%</td><td>76.4%</td></tr><tr><td colspan="11">Open-Source Models</td></tr><tr><td>Codestral</td><td>22B</td><td>22B</td><td>63.3%</td><td>49.7%</td><td>67.9%</td><td>32.1%</td><td>67.3%</td><td>37.3%</td><td>68.2%</td><td>63.2%</td></tr><tr><td>DS-Coder-instruct</td><td>33B</td><td>33B</td><td>61.4%</td><td>44.7%</td><td>53.5%</td><td>31.4%</td><td>68.6%</td><td>46.0%</td><td>70.1%</td><td>61.9%</td></tr><tr><td>Llama3-Instruct</td><td>70B</td><td>70B</td><td>55.1%</td><td>46.0%</td><td>62.9%</td><td>48.1%</td><td>58.3%</td><td>46.0%</td><td>68.8%</td><td>60.6%</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>16B</td><td>2.4B</td><td>64.6%</td><td>47.8%</td><td>67.3%</td><td>45.5%</td><td>62.2%</td><td>41.6%</td><td>68.8%</td><td>65.6%</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>236B</td><td>21B</td><td>72.2%</td><td>64.0%</td><td>72.3%</td><td>64.1%</td><td>78.2%</td><td>63.4%</td><td>76.2%</td><td>75.3%</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 3 | Performance Metrics for Various Models on HumanEval and MBPP Benchmarks

表 3｜各模型在 HumanEval 与 MBPP 基准上的指标.

Table 3 provides an extensive overview of the performance metrics for various models across multiple programming languages on the HumanEval and MBPP<sup>+</sup> Benchmarks. The DeepSeek Coder-V2-Instruct demonstrates exceptional performance, securing the second-highest average

表 3 汇总了各模型在 HumanEval 与 MBPP+ 多语言上的指标. DeepSeek-Coder-V2-Instruct 表现突出, 平均分位列第二,

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>4</sup>We use the template "Please complete the python function below. The final complete version of your function must be returned within a code block. Here is the unfinished function: \n \`\`\`python\n{problem\_description}\n\n" to build the instruction prompt. </span></small>

⁴ HumanEval 指令模板: 请完成下方 Python 函数, 最终完整版本须放在代码块中返回(原文模板见上).

8

(页码 8)

<!-- page 9 of 19 -->

(第 9 / 19 页)

score of 75.3%. This performance is notable as it breaks the dominance typically seen from closed-source models, standing out as a leading open-source contender. It is surpassed only by GPT-4o, which leads with an average score of 76.4%. DeepSeek-Coder-V2-Instruct shows top-tier results across a variety of languages, including the highest scores in Java and PHP, and strong performances in Python, C++, C#, TypeScript, and JavaScript, underscoring its robustness and versatility in handling diverse coding challenges.

达 75.3%. 在闭源模型长期占优的格局里, 它是开源侧的有力竞争者, 仅次于平均 76.4% 的 GPT-4o. Java, PHP 最高, Python, C++, C#, TypeScript, JavaScript 也很强, 说明多语言代码能力扎实.

Furthermore, the DeepSeek-Coder-V2-Lite-Instruct also performs impressively, surpassing the larger 33B model. With a considerable margin in average performance (65.6% vs. 61.9%), it highlights the effectiveness of the 16B model in delivering competitive results despite its smaller size. This underscores the model’s efficiency and the advancements in model architecture and training methodologies that allow it to outperform larger counterparts.

Lite-Instruct(16B / 激活 2.4B)平均 65.6%, 超过更大的 DeepSeek-Coder-Instruct 33B(61.9%), 说明架构与训练方法让小激活规模也能打过更大稠密模型.

Competitive Programming. To further validate the model’s capability in real-world competitive programming problems, we utilize the LiveCodeBench (Jain et al., 2024) and USACO benchmark (Shi et al., 2024) to estimate the effectiveness of DeepSeek-Coder-V2. LiveCodeBench is a meticulous and contamination-free assessment of Large Language Models (LLMs) for code generation, systematically gathering novel challenges over time from three prominent competitive programming platforms: LeetCode, AtCoder, and CodeForces. Since the cut-off of the training data is before November 2023, we use the subset (1201-0601) of Livecodebench. USACO benchmark contains 307 problems from the USA Computing Olympiad, along with high-quality unit tests, reference code, and official analyses for each problem.

**竞赛编程**. 用 LiveCodeBench 与 USACO 检验实战题能力. LiveCodeBench 持续从 LeetCode / AtCoder / CodeForces 收集新题, 尽量无污染; 训练数据截止于 2023-11 之前, 故取子集 1201–0601. USACO 含 307 道美国信息学奥赛题, 配高质量单测, 参考代码与官方解析.

<table><tr><td rowspan="2">Model</td><td rowspan="2">#TP</td><td rowspan="2">#AP</td><td colspan="4">LiveCodeBench</td><td rowspan="2">USACO</td></tr><tr><td>Easy (82)</td><td>Medium (87)</td><td>Hard (57)</td><td>Overall (226)</td></tr><tr><td colspan="8">Closed-Source Models</td></tr><tr><td>Gemini-1.5-Pro</td><td>-</td><td>-</td><td>74.9%</td><td>16.8%</td><td>1.8%</td><td>34.1%</td><td>4.9%</td></tr><tr><td>Claude-3-Opus</td><td>-</td><td>-</td><td>77.2%</td><td>16.7%</td><td>0.7%</td><td>34.6%</td><td>7.8%</td></tr><tr><td>GPT-4-1106</td><td>-</td><td>-</td><td>78.4%</td><td>20.2%</td><td>3.5%</td><td>37.1%</td><td>11.1%</td></tr><tr><td>GPT-4-Turbo-0409</td><td>-</td><td>-</td><td>84.1%</td><td>35.4%</td><td>6.1%</td><td>45.7%</td><td>12.3%</td></tr><tr><td>GPT-4o-0513</td><td>-</td><td>-</td><td>87.4%</td><td>27.5%</td><td>4.9%</td><td>43.4%</td><td>18.8%</td></tr><tr><td colspan="8">Open-Source Models</td></tr><tr><td>Codestral</td><td>22B</td><td>22B</td><td>66.5%</td><td>17.7%</td><td>0.2%</td><td>31.0%</td><td>4.6%</td></tr><tr><td>DS-Coder-instruct</td><td>33B</td><td>33B</td><td>51.6%</td><td>9.7%</td><td>0.4%</td><td>22.5%</td><td>4.2%</td></tr><tr><td>Llama3-Instruct</td><td>70B</td><td>70B</td><td>62.4%</td><td>14.4%</td><td>2.1%</td><td>28.7%</td><td>3.3%</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>16B</td><td>2.4B</td><td>58.5%</td><td>8.0%</td><td>0.0%</td><td>24.3%</td><td>6.5%</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>236B</td><td>21B</td><td>84.1%</td><td>29.9%</td><td>5.3%</td><td>43.4%</td><td>12.1%</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 4 | Performance on the LiveCodeBench (LCB) and USACO benchmarks.

表 4｜LiveCodeBench(LCB)与 USACO 基准上的表现.

Table 4 showcases the performance of various language models on the two benchmarks. Notably, DeepSeek-Coder-V2-Instruct delivers a standout performance, tying for the highest score among large models at 43.4%, on par with GPT-4o. This exceptional result places it second overall, just behind GPT-4-Turbo-0409, which leads with an overall performance of 45.7%. DeepSeek-Coder-V2-Instruct’s impressive ability to handle complex coding challenges firmly establishes it as a top contender, closely trailing the leading GPT-4-Turbo variant.

表 4: V2-Instruct 总体 43.4%, 与 GPT-4o 并列大模型高分, 仅次于 GPT-4-Turbo-0409(45.7%), 复杂竞赛题上站稳第一梯队.

9

(页码 9)

<!-- page 10 of 19 -->

(第 10 / 19 页)

## 4.2. Code Completion ## 4.2. 代码补全

## 4.2.1. Repository-Level Code Completion Evaluation ## 4.2.1. 仓库级代码补全评测

We use RepoBench (Liu et al., 2023b) to evaluate the capabilities of currently available open-source code models with sizes below 35B in repository-level code completion tasks. This dataset is constructed from a diverse set of real-world, open-sourced, permissively licensed repositories in two popular programming languages: Python and Java. Notably, the latest version (v1.1) of RepoBench sources its data from GitHub repositories created between October 6th and December 31st, 2023, while our pre-training data includes code created before November 2023. To ensure this dataset was not present in our pre-training data and avoid data leakage, we only use data from December 2023.

用 RepoBench(Liu et al., 2023b)评测 35B 以下开源代码模型的仓库级补全. 数据来自真实, 宽松许可的 Python/Java 仓库. v1.1 取自 2023-10-06 至 2023-12-31 新建仓库, 而预训练含 2023-11 前代码; 为防泄漏, 只用 2023-12 的数据.

Our evaluation includes five context length levels-2k, 4k, 8k, 12k, and 16k tokens-across three settings: cross-file-first, cross-file-random, and in-file. We use greedy search for all models under evaluation. The models were constrained to generate a maximum of 64 new tokens per prompt, and the first non-empty and non-comment line of the output was selected as the prediction. The maximum token length for prompts was set to 15, 800 by truncating excess cross-file context. We report the average exact match for the different context length levels.

五种上下文长度(2k–16k), 三种设定(跨文件优先 / 跨文件随机 / 文件内); 贪婪解码; 每题最多 64 新 token, 取首个非空非注释行; prompt 最长 15, 800(截断多余跨文件上下文); 报告各长度的平均 exact match.

<table><tr><td rowspan="2">Model</td><td rowspan="2">#TP</td><td rowspan="2">#AP</td><td colspan="6">Python</td><td colspan="6">Java</td></tr><tr><td>2k</td><td>4k</td><td>8k</td><td>12k</td><td>16k</td><td>Avg</td><td>2k</td><td>4k</td><td>8k</td><td>12k</td><td>16k</td><td>Avg</td></tr><tr><td>StarCoder2-Base</td><td>15B</td><td>15B</td><td>35.7%</td><td>36.7%</td><td>34.6%</td><td>27.4%</td><td>25.1%</td><td>32.1%</td><td>46.2%</td><td>45.0%</td><td>39.8%</td><td>30.5%</td><td>30.7%</td><td>38.7%</td></tr><tr><td>CodeLlama-Base</td><td>7B</td><td>7B</td><td>32.0%</td><td>34.4%</td><td>35.3%</td><td>33.3%</td><td>32.2%</td><td>33.5%</td><td>43.1%</td><td>42.1%</td><td>40.4%</td><td>37.0%</td><td>40.3%</td><td>40.6%</td></tr><tr><td>CodeLlama-Base</td><td>13B</td><td>13B</td><td>33.0%</td><td>36.5%</td><td>37.0%</td><td>34.6%</td><td>35.0%</td><td>35.2%</td><td>43.5%</td><td>44.8%</td><td>40.7%</td><td>38.6%</td><td>41.1%</td><td>41.8%</td></tr><tr><td>CodeLlama-Base</td><td>34B</td><td>34B</td><td>35.3%</td><td>37.5%</td><td>39.5%</td><td>34.9%</td><td>35.6%</td><td>36.6%</td><td>45.9%</td><td>45.4%</td><td>42.5%</td><td>41.0%</td><td>41.2%</td><td>43.3%</td></tr><tr><td>DS-Coder-Base</td><td>6.7B</td><td>6.7B</td><td>36.1%</td><td>37.5%</td><td>38.2%</td><td>34.0%</td><td>35.0%</td><td>36.2%</td><td>46.8%</td><td>46.4%</td><td>42.9%</td><td>38.8%</td><td>40.8%</td><td>43.3%</td></tr><tr><td>DS-Coder-Base</td><td>33B</td><td>33B</td><td>39.7%</td><td>40.1%</td><td>40.0%</td><td>36.9%</td><td>38.5%</td><td>39.1%</td><td>47.9%</td><td>47.7%</td><td>43.3%</td><td>40.9%</td><td>43.6%</td><td>44.8%</td></tr><tr><td>Codestral</td><td>22B</td><td>22B</td><td>42.1%</td><td>44.3%</td><td>46.6%</td><td>46.6%</td><td>51.5%</td><td>46.1%</td><td>48.3%</td><td>47.8%</td><td>46.0%</td><td>42.2%</td><td>43.9%</td><td>45.7%</td></tr><tr><td>DS-Coder-V2-Lite-Base</td><td>16B</td><td>2.4B</td><td>38.3%</td><td>38.6%</td><td>40.6%</td><td>38.3%</td><td>38.7%</td><td>38.9%</td><td>48.8%</td><td>45.7%</td><td>42.4%</td><td>38.1%</td><td>41.1%</td><td>43.3%</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 5 | Performance of different models on December subset of RepoBench v1.1.

表 5｜各模型在 RepoBench v1.1 十二月子集上的表现.

As shown in Table 5, the results indicate that the DeepSeek-Coder-V2-Lite-Base model, despite having only 2.4 billion active parameters, achieves code completion capabilities in Python comparable to the DeepSeek-Coder-Base 33B model and in Java comparable to the DeepSeek-Coder-Base 7B model. Compared to CodeStral, the DeepSeek-Coder-V2-Lite-Base model has only one-tenth of the active parameters of CodeStral, resulting in lower performance in code completion tasks. However, we believe that the smaller number of active parameters in DeepSeek-Coder-V2 makes it faster for code completion scenarios.

表 5: Lite-Base 仅 **2.4B 激活**, Python 补全接近 DS-Coder-Base 33B, Java 接近 7B; 相对 Codestral 激活约十分之一, 补全分数更低, 但激活少, 补全场景推理更快.

## 4.2.2. Fill-in-the-Middle Code Completion ## 4.2.2. Fill-in-the-Middle 代码补全

DeepSeek-Coder-V2-Lite is trained with a unique approach that includes a 0.5 Fill-In-the-Middle (FIM) rate during their pre-training phase. This method allows the model to adeptly complete code by filling in blanks using the surrounding context, which includes both the preceding and following code segments. This ability is particularly advantageous for code completion tools. Several open-source models, such as SantaCoder (Allal et al., 2023), StarCoder (Li et al., 2023b), and CodeLlama (Roziere et al., 2023), also leverage similar capabilities and have established high standards in the domain of code generation and completion.

Lite 预训练 FIM 率 0.5, 能用前后文填空, 适合 IDE 类补全. SantaCoder, StarCoder, CodeLlama 等也有类似能力.

To evaluate the performance of DeepSeek-Coder-V2 models, we conducted a comparative analysis against leading models. The assessment was based on the Single-Line Infilling bench marks, covering three different programming languages as described by Allal et al. (2023). The

对比评测用 Allal 等人的单行填充基准(三门语言), 主指标为行级 exact match.

10

(页码 10)

<!-- page 11 of 19 -->

(第 11 / 19 页)

main metric for this evaluation was the line exact match accuracy<sup>5</sup>.

主指标为行级 exact match 准确率⁵.

| Model | #TP | #AP | python | java | javascript | Mean |
| --- | --- | --- | --- | --- | --- | --- |
| $StarCoder^6$ | 16B | 16B | 71.5% | 82.3% | 83.0% | 80.2% |
| CodeLlama-Base | 7B | 7B | 58.6% | 70.6% | 70.7% | 68.0% |
| CodeLlama-Base | 13B | 13B | 60.7% | 74.3% | 78.5% | 73.1% |
| DS-Coder-Base | 1B | 1B | 74.1% | 85.1% | 82.9% | 81.8% |
| DS-Coder-Base | 7B | 7B | 79.8% | 89.6% | 86.3% | 86.1% |
| DS-Coder-Base | 33B | 33B | 80.5% | 88.4% | 86.6% | 86.4% |
| Codestral | 22B | 22B | 77.2% | 83.2% | 85.9% | 83.0% |
| DS-Coder-V2-Lite-Base | 16B | 2.4B | 80.0% | 89.1% | 87.2% | 86.4% |

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 6 | Performance of different approaches on the FIM-Tasks.

表 6｜各方法在 FIM 任务上的表现.

The table presents the performance of various coding models on FIM (Fill-in-the-Middle) tasks across three programming languages: Python, Java, and JavaScript, with a Mean score indicating overall effectiveness. Among the compared models, DeepSeek-Coder-V2-Lite-Base, with a configuration of 2.4B active parameters, achieves outstanding results. It scores 80.0% in Python, 89.1% in Java, and 87.2% in JavaScript, leading to a top Mean score of 86.4%. This demonstrates the superior effectiveness of DeepSeek-Coder-V2-Lite-Base, particularly in handling FIM tasks across different programming languages, achieving comparable performance with other bigger models in the evaluation.

表中 Lite-Base(2.4B 激活)Python 80.0%, Java 89.1%, JavaScript 87.2%, 均值 86.4%, FIM 上与更大模型持平甚至领先.

## 4.3. Code Fixing ## 4.3. 代码修复

To evaluate the bug-fixing capabilities of the model, we used the Defects4J <sup>7</sup>, SWE-bench (Jimenez et al., 2023), and Aider <sup>8</sup> datasets for testing. Defects4J is a widely used dataset in the field of software engineering, specifically designed for the purpose of evaluating and testing program repair techniques. It consists of a collection of real-world software bugs from various open-source projects, including but not limited to Apache Commons, JFreeChart, and Closure Compiler. Each bug in the dataset is accompanied by test suites that can be used to validate the effectiveness of program repair tools. Since the original bugs in Defec4J may need modify several files in the repository resulting in a long context, we collect 238 bugs that only need to modify one method from this benchmark.

代码修复用 Defects4J⁷, SWE-bench(Jimenez et al., 2023)与 Aider⁸. Defects4J 是常用程序修复数据集, 含 Apache Commons, JFreeChart, Closure Compiler 等真实缺陷及测试套件. 原题常需改多文件, 上下文很长, 故从中筛出只需改一个方法的 238 个 bug.

SWE-bench is a comprehensive benchmark designed to evaluate the performance of large language models in addressing real-world software issues sourced from GitHub. The benchmark presents a codebase alongside a specific issue, challenging the language model to generate a patch that effectively resolves the described problem. This rigorous evaluation framework ensures that the language model’s ability to understand and fix real-world software issues is thoroughly tested, providing a clear measure of its practical utility and effectiveness in software development tasks.

SWE-Bench: 给代码库 + GitHub issue, 要求生成能修好问题的 patch, 测真实软件修复能力.

Aider’s code editing benchmark evaluates the LLM’s ability to modify Python source files, completing 133 distinct coding tasks. This benchmark not only tests the LLM’s coding skills but also checks its consistency in producing code edits according to the specifications in the prompt.

Aider: 133 道改 Python 源文件的任务, 既考编码, 也考是否按提示规格稳定产出编辑.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>5</sup>We use the first generated line rather than the whole generated chunk, thus the result is slightly different with DeepSeek-Coder. </span></small>

⁵ 评测取首行生成结果而非整块, 故与 DeepSeek-Coder 结果略有差异.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>7</sup>https://github. com/rjust/defects4j</span></small>

⁷ https://github. com/rjust/defects4j

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>8</sup>https://github. com/paul-gauthier/aider</span></small>

⁸ https://github. com/paul-gauthier/aider

11

(页码 11)

<!-- page 12 of 19 -->

(第 12 / 19 页)

For DeepSeek-Coder-V2 models, we use whole format to evaluate.

DeepSeek-Coder-V2 系列评测采用 **whole format**.

<table><tr><td>Model</td><td>#TP</td><td>#AP</td><td>Defects4J</td><td>SWE-Bench</td><td>Aider</td></tr><tr><td colspan="6">Closed-Source Models</td></tr><tr><td>Gemini-1.5-Pro</td><td>-</td><td>-</td><td>18.6%</td><td>19.3%</td><td>57.1%</td></tr><tr><td>Claude-3-Opus</td><td>-</td><td>-</td><td>25.5%</td><td>11.7%</td><td>68.4%</td></tr><tr><td>GPT-4-1106</td><td>-</td><td>-</td><td>22.8%</td><td>22.7%</td><td>65.4%</td></tr><tr><td>GPT-4-Turbo-0409</td><td>-</td><td>-</td><td>24.3%</td><td>18.3%</td><td>63.9%</td></tr><tr><td>GPT-4o-0513</td><td>-</td><td>-</td><td>26.1%</td><td>26.7%</td><td>72.9%</td></tr><tr><td colspan="6">Open-Source Models</td></tr><tr><td>Codestral</td><td>22B</td><td>22B</td><td>17.8%</td><td>2.7%</td><td>51.1%</td></tr><tr><td>DS-Coder-Instruct</td><td>33B</td><td>33B</td><td>11.3%</td><td>0.0%</td><td>54.5%</td></tr><tr><td>Llama3-Instruct</td><td>70B</td><td>70B</td><td>16.2%</td><td>-</td><td>49.2%</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>16B</td><td>2.4B</td><td>9.2%</td><td>0.0%</td><td>44.4%</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>236B</td><td>21B</td><td>21.0%</td><td>12.7%</td><td>73.7%</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 7 | Performances of different models on repair benchmarks. We do not evaluate Llama3-Instruct on SWE-Bench as it just supports 8K context length.

表 7｜各模型在修复基准上的表现. 未评测 Llama3-Instruct 的 SWE-Bench, 因其仅支持 8K 上下文.

Table 7 outlines the performances of different language models on software repair benchmarks, including Defects4J, SWE-Bench, and Aider. Among open-source models, DeepSeek-Coder-Instruct emerges as a standout, achieving the best performance within the open source models. It scores 21% in Defects4J and 12.7% in SWE-Bench, closely approaching the results of leading closed-source models and demonstrating significant capability in handling longer code sequences. Notably, DeepSeek-Coder-V2-Instruct achieves the highest score of 73.7% in Aider, surpassing all other models listed, including closed-source counterparts. This superior performance highlights its efficiency and robustness in automated code repair tasks, positioning DeepSeek-Coder-V2-Instruct as the top open-source model and a formidable competitor to closed-source alternatives in the field.

表 7: 开源里 V2-Instruct 最突出--Defects4J 21%, SWE-Bench 12.7%, 逼近顶尖闭源; Aider 73.7% 全表最高(含闭源).

## 4.4. Code Understanding and Reasoning ## 4.4. 代码理解与推理

To assess the code reasoning capabilities of our models, we utilize the CRUXEval benchmark. This benchmark comprises 800 Python functions paired with corresponding input-output examples. It is divided into two distinct tasks: CRUXEval-I, which requires the large language model (LLM) to predict the output based on the given input, and CRUXEval-O, where the model must predict the input from the known output. This structure challenges the model’s ability to understand and reason through Python code in both forward and reverse directions. Table 8 presents the performance of various language models on the CruxEval benchmark, which assesses models on two metrics: CruxEval-I-COT and CruxEval-O-COT. Among the open-source models, DeepSeek-Coder-V2-Instruct stands out significantly. It scores 70.0% on CruxEval-I-COT and 75.1% on CruxEval-O-COT, showcasing its superior capability within the open-source domain. However, when compared to larger closed-source models, there is a performance gap. This performance gap may largely be attributed to the fact that DeepSeek-Coder-V2-Instruct operates with only 21 billion activation parameters, which is considerably fewer than those in larger, more advanced closed-source models like GPT-4o. This limitation in model complexity could restrict its learning and problem-solving capacities.

CRUXEval: 800 个 Python 函数 + 输入输出对. **CRUXEval-I** 给输入猜输出, **CRUXEval-O** 给输出猜输入, 正反双向测代码推理. 表 8 报 I-COT / O-COT: 开源中 V2-Instruct 最高(70.0% / 75.1%), 相对 GPT-4o 等大闭源仍有差距, 文中归因于仅 21B 激活参数.

12

(页码 12)

<!-- page 13 of 19 -->

(第 13 / 19 页)

<table><tr><td>Model</td><td>#TP</td><td>#AP</td><td>CruxEval-I-COT</td><td>CruxEval-O-COT</td></tr><tr><td colspan="5">Closed-Source Models</td></tr><tr><td>Gemini-1.5-Pro</td><td>-</td><td>-</td><td>67.0%</td><td>77.5%</td></tr><tr><td>Claude-3-Opus</td><td>-</td><td>-</td><td>73.4%</td><td>82.0%</td></tr><tr><td>GPT-4-1106</td><td>-</td><td>-</td><td>75.5%</td><td>77.1%</td></tr><tr><td>GPT-4-Turbo-0409</td><td>-</td><td>-</td><td>75.7%</td><td>82.0%</td></tr><tr><td>GPT-4o-0513</td><td>-</td><td>-</td><td>77.4%</td><td>88.7%</td></tr><tr><td colspan="5">Open-Source Models</td></tr><tr><td>Codestral</td><td>22B</td><td>22B</td><td>48.0%</td><td>60.6%</td></tr><tr><td>DS-Coder-Instruct</td><td>33B</td><td>33B</td><td>47.3%</td><td>50.6%</td></tr><tr><td>Llama3-Instruct</td><td>70B</td><td>70B</td><td>61.1%</td><td>64.3%</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>16B</td><td>2.4B</td><td>53.0%</td><td>52.9%</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>236B</td><td>21B</td><td>70.0%</td><td>75.1%</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 8 | Performance of different models on the CruxEval benchmark.

表 8｜各模型在 CruxEval 基准上的表现.

## 4.5. Mathematical Reasoning ## 4.5. 数学推理

To assess the mathematical reasoning capabilities of DeepSeekCoder-V2, we utilized the popular grade-school benchmark GSM8K (Cobbe et al., 2021), along with advanced competition-level benchmarks including MATH (Hendrycks et al., 2021), the American Invitational Mathematics Examination (AIME) 2024 (MAA, 2024), and Math Odyssey (Netmind. AI, 2024)<sup>9</sup>.

数学评测: 小学级 GSM8K, 以及竞赛级 MATH, AIME 2024, Math Odyssey.

<table><tr><td>Model</td><td>#TP</td><td>#AP</td><td>GSM8K</td><td>MATH</td><td>AIME 2024</td><td>Math Odyssey</td></tr><tr><td colspan="7">Closed-Source Models</td></tr><tr><td>Gemini 1.5 Pro</td><td>-</td><td>-</td><td>90.8%</td><td>67.7%</td><td>2/30</td><td>45.0%</td></tr><tr><td>Claude-3-Opus</td><td>-</td><td>-</td><td>95.0%</td><td>60.1%</td><td>2/30</td><td>40.6%</td></tr><tr><td>GPT-4-1106</td><td>-</td><td>-</td><td>91.4%</td><td>64.3%</td><td>1/30</td><td>49.1%</td></tr><tr><td>GPT-4-Turbo-0409</td><td>-</td><td>-</td><td>93.7%</td><td>73.4%</td><td>3/30</td><td>46.8%</td></tr><tr><td>GPT-4o-0513</td><td>-</td><td>-</td><td>95.8%</td><td>76.6%</td><td>2/30</td><td>53.2%</td></tr><tr><td colspan="7">Open-Source Models</td></tr><tr><td>Llama3-Instruct</td><td>70B</td><td>70B</td><td>93.0%</td><td>50.4%</td><td>1/30</td><td>27.9%</td></tr><tr><td>DS-Coder-V2-Lite-Instruct</td><td>16B</td><td>2.4B</td><td>86.4%</td><td>61.8%</td><td>0/30</td><td>44.4%</td></tr><tr><td>DS-Coder-V2-Instruct</td><td>236B</td><td>21B</td><td>94.9%</td><td>75.7%</td><td>4/30</td><td>53.7%</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 9 | Performance of different models on the mathematical reasoning. DeepSeek-Coder-V2-Instruct can achieve 5/30 on AIME 2024 with maj@64.

表 9｜各模型的数学推理表现. DeepSeek-Coder-V2-Instruct 在 AIME 2024 上用 maj@64 可达 5/30.

The results, presented in Table 9, were obtained using greedy decoding without the aid of tools or voting techniques, unless otherwise specified. DeepSeek-Coder-V2 achieved an accuracy of 75.7% on the MATH benchmark and 53.7% on Math Odyssey, comparable to the state-of-the-art GPT-4o. Additionally, DeepSeek-Coder-V2 solves more problems from AIME 2024 than the other models, demonstrating its strong mathematical reasoning capabilities.

表 9 默认贪婪解码, 不用工具与投票(另有说明除外). MATH 75.7%, Math Odyssey 53.7%, 接近 GPT-4o; AIME 2024 解出题数多于表中其他模型.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>9</sup>The performance of DeepSeek-Coder-V2 on the four mathematical benchmarks was obtained with zero-shot chain-of-thought prompting; each test question was concatenated with the instruction: "\nPlease reason step by step, and put vour final answer within \boxed{}. </span></small>

⁹ 四个数学基准均用 zero-shot chain-of-thought; 题后拼接: 请逐步推理, 并把最终答案放在 \boxed{} 中.

13

(页码 13)

<!-- page 14 of 19 -->

(第 14 / 19 页)

## 4.6. General Natural Language ## 4.6. 通用自然语言

As DeepSeek-Coder-V2 is built upon DeepSeek-V2, it inherits the strong natural language capability, even surpassing DeepSeek-V2 on reasoning-related benchmarks. We compare DeepSeek-Coder-V2 Instruct with DeepSeek-V2 Chat on standard benchmarks, which covers both English and Chinese benchmarks, including BigBench Hard (BBH) (Suzgun et al., 2022), MMLU (Hendrycks et al., 2020), ARC (Clark et al., 2018), TriviaQA (Joshi et al., 2017), NaturalQuestions (Kwiatkowski et al., 2019), AGIEval (Zhong et al., 2023)<sup>, </sup>CLUEWSC (Xu et al., 2020), C-Eval (Huang et al., 2023), and CMMLU (Li et al., 2023a). Besides, we also evaluate the open-ended generation ability of models, including Arena-Hard (Li et al., 2024), AlpacaEval2.0 (Dubois et al., 2024), MT-Bench (Zheng et al., 2023), and Alignbench (Liu et al., 2023c). The evaluation pipeline and metrics are the same as in DeepSeek-V2, where the MMLU are evaluated using OpenAI simple-eval package https://github. com/openai/simple-evals.

Coder-V2 建立在 V2 上, 继承强自然语言能力, 推理类基准甚至超过 V2. 对照 V2 Chat: 英文 / 中文标准集(BBH, MMLU, ARC, TriviaQA, NaturalQuestions, AGIEval, CLUEWSC, C-Eval, CMMLU)以及开放生成(Arena-Hard, AlpacaEval 2.0, MT-Bench, Alignbench). 流程与指标同 V2; MMLU 用 OpenAI simple-eval(https://github. com/openai/simple-evals).

<table><tr><td></td><td>Benchmark (Metric)</td><td># Shots</td><td>DeepSeek-V2-Lite Chat</td><td>DeepSeek-Coder-V2-Lite Instruct</td><td>DeepSeek-V2 Chat</td><td>DeepSeek-Coder-V2 Instruct</td></tr><tr><td rowspan="3"></td><td># Active Params</td><td>-</td><td>2.4B</td><td>2.4B</td><td>21B</td><td>21B</td></tr><tr><td># Total Params</td><td>-</td><td>16B</td><td>16B</td><td>236B</td><td>236B</td></tr><tr><td># Training Tokens</td><td>-</td><td>5.7T</td><td>10.2T</td><td>8.1T</td><td>10.2T</td></tr><tr><td rowspan="7">English</td><td>BBH (EM)</td><td>3-shot</td><td>48.1</td><td>61.2</td><td>79.7</td><td>83.9</td></tr><tr><td>MMLU (Acc.)</td><td>5-shot</td><td>55.7</td><td>60.1</td><td>78.1</td><td>79.2</td></tr><tr><td>ARC-Easy (Acc.)</td><td>25-shot</td><td>86.1</td><td>88.9</td><td>98.1</td><td>97.4</td></tr><tr><td>ARC-Challenge (Acc.)</td><td>25-shot</td><td>73.4</td><td>77.4</td><td>92.3</td><td>92.8</td></tr><tr><td>TriviaQA (EM)</td><td>5-shot</td><td>65.2</td><td>59.5</td><td>86.7</td><td>82.3</td></tr><tr><td>NaturalQuestions (EM)</td><td>5-shot</td><td>35.5</td><td>30.8</td><td>53.4</td><td>47.5</td></tr><tr><td>AGIEval (Acc.)</td><td>0-shot</td><td>42.8</td><td>28.7</td><td>61.4</td><td>60.0</td></tr><tr><td rowspan="3">Chinese</td><td>CLUEWSC (EM)</td><td>5-shot</td><td>80.0</td><td>76.5</td><td>89.9</td><td>85.9</td></tr><tr><td>C-Eval (Acc.)</td><td>5-shot</td><td>60.1</td><td>61.6</td><td>78.0</td><td>79.4</td></tr><tr><td>CMMLU (Acc.)</td><td>5-shot</td><td>62.5</td><td>62.7</td><td>81.6</td><td>80.9</td></tr><tr><td rowspan="4">Open-ended</td><td>Arena-Hard</td><td>-</td><td>11.40</td><td>38.10</td><td>41.60</td><td>65.00</td></tr><tr><td>AlpacaEval 2.0</td><td>-</td><td>16.85</td><td>17.74</td><td>38.90</td><td>36.92</td></tr><tr><td>MT-Bench</td><td>-</td><td>7.37</td><td>7.81</td><td>8.97</td><td>8.77</td></tr><tr><td>Alignbench</td><td>-</td><td>6.02</td><td>6.83</td><td>7.91</td><td>7.84</td></tr></table>

(表格/公式结构同原文; 数字, 符号, URL 不改.)

Table 10 | A Comparison of DeepSeek-Coder-V2 Instruct with DeepSeek-V2 Chat.

表 10｜DeepSeek-Coder-V2 Instruct 与 DeepSeek-V2 Chat 的对比.

When comparing the performance of 16B models, it is evident that DeepSeek-Coder-V2- Lite-Instruct outperforms DeepSeek-V2-Lite-Chat in benchmarks like BBH and Arena-Hard. These benchmarks place a high demand on the model’s reasoning ability, which DeepSeek-Coder-V2-Lite-Instruct excels at. However, DeepSeek-Coder-V2-Lite Instruct falls behind in knowledge-intensive benchmarks like TriviaQA, primarily due to the relatively smaller amount of web data used during pre-training.

16B 档: Lite-Instruct 在 BBH, Arena-Hard 等偏推理的集上超过 V2-Lite-Chat; TriviaQA 等知识密集集落后, 主因预训练网页数据相对更少.

Moving on to 236B models, DeepSeek-Coder-V2 Instruct exhibits greater strength in reasoning benchmarks, particularly in Arena-Hard, which comprises a substantial proportion of code, math, and reasoning questions. On the other hand, DeepSeek-V2 Chat demonstrates slightly better results in benchmarks such as MT-bench (Zheng et al., 2023), AlpacaEval 2.0 (Dubois et al., 2024), and AlignBench (Liu et al., 2023c). This advantage can be attributed to the general-purpose alignment stage of DeepSeek-V2 Chat.

236B 档: Coder-V2 Instruct 在推理向(尤其含大量代码 / 数学题的 Arena-Hard)更强; V2 Chat 在 MT-Bench, AlpacaEval 2.0, AlignBench 略好, 得益于其通用对齐阶段.

## 5. Conclusion

In this paper, we introduce DeepSeek-Coder-V2 to further advance the field of code intelligence, which is continually pre-trained from DeepSeek-V2 with 6 trillion tokens sourced from a highquality and multi-source corpus. Through this continued pre-training, we find that DeepSeek-

本文介绍 DeepSeek-Coder-V2: 从 DeepSeek-V2 出发, 用高质量多源语料再继续预训练 6 万亿 token, 以推进代码智能. 持续预训练后发现, DeepSeek-

14

(页码 14)

<!-- page 15 of 19 -->

(第 15 / 19 页)

Coder-V2 significantly enhances the model’s capabilities in coding and mathematical reasoning while maintaining comparable general language performance to DeepSeek-V2. Compared to DeepSeek-Coder, DeepSeek-Coder-V2 supports a significantly larger number of programming languages, increasing from 86 to 338, and extends the maximum context length from 16K to 128K tokens. Experimental results demonstrate that DeepSeek-Coder-V2 achieves performance comparable to state-of-the-art closed-source models such as GPT-4 Turbo, Claude 3 Opus, and Gemini 1.5 Pro in code and math-specific tasks.

本文介绍 DeepSeek-Coder-V2: 从 DeepSeek-V2 用高质量多源语料继续预训练约 6 万亿 token. 代码与数学推理明显增强, 通用语言与 V2 大体相当; 相对 DeepSeek-Coder, 语言覆盖 86→338, 上下文 16K→128K. 实验显示代码与数学专项上可与 GPT-4 Turbo, Claude 3 Opus, Gemini 1.5 Pro 等顶尖闭源比肩.

Although DeepSeek-Coder-V2 achieves impressive performance on standard benchmarks, we find that there is still a significant gap in instruction-following capabilities compared to current state-of-the-art models like GPT-4 Turbo. This gap leads to poor performance in complex scenarios and tasks such as those in SWEbench. Therefore, we believe that a code model needs not only strong coding abilities but also exceptional instruction-following capabilities to handle real-world complex programming scenarios. In the future, we will focus more on improving the model’s instruction-following capabilities to better handle real-world complex programming scenarios and enhance the productivity of the development process.

标准基准虽强, **指令遵循**仍明显落后于 GPT-4 Turbo 等, 复杂场景与 SWE-Bench 类任务因此吃亏. 好的代码模型既要写代码硬, 也要跟指令稳; 后续会更侧重指令遵循, 以应对真实复杂编程场景, 抬高开发效率.

## References

L. B. Allal, R. Li, D. Kocetkov, C. Mou, C. Akiki, C. M. Ferrandis, N. Muennighoff, M. Mishra, A. Gu, M. Dey, et al. Santacoder: don’t reach for the stars! arXiv preprint arXiv: 2301.03988, 2023.

SantaCoder: 别急着追星.

A. Anthropic. The claude 3 model family: Opus, sonnet, haiku. Claude-3 Model Card, 2024.

A. Anthropic. The claude 3 model family: Opus, sonnet, haiku. Claude-3 Model Card, 2024. (文献条目同原文)

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, and C. Sutton. Program synthesis with large language models, 2021a.

大语言模型做程序合成(2021a).

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv: 2108.07732, 2021b.

大语言模型做程序合成(2021b, arXiv).

M. Bavarian, H. Jun, N. Tezak, J. Schulman, C. McLeavey, J. Tworek, and M. Chen. Efficient training of language models to fill in the middle. arXiv preprint arXiv: 2207.14255, 2022.

高效训练语言模型做中间填充(FIM).

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. d. O. Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv: 2107.03374, 2021.

评测在代码上训练的大语言模型(HumanEval).

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the AI2 reasoning challenge. CoRR, abs/1803.05457, 2018. URL http: //arxiv. org/abs/1803.05457.

ARC: AI2 推理挑战.

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv: 2110.14168, 2021.

训验证器解数学应用题(GSM8K).

DeepSeek-AI. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model, 2024.

DeepSeek-AI

Y. Dubois, B. Galambosi, P. Liang, and T. B. Hashimoto. Length-controlled alpacaeval: A simple way to debias automatic evaluators. arXiv preprint arXiv: 2404.04475, 2024.

长度控制的 AlpacaEval: 给自动评测去偏.

15

(页码 15)

<!-- page 16 of 19 -->

(第 16 / 19 页)

D. Guo, Q. Zhu, D. Yang, Z. Xie, K. Dong, W. Zhang, G. Chen, X. Bi, Y. Wu, Y. Li, et al. Deepseekcoder: When the large language model meets programming–the rise of code intelligence. arXiv preprint arXiv: 2401.14196, 2024.

DeepSeek-Coder: 大模型遇上编程.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv: 2009.03300, 2020.

大规模多任务语言理解(MMLU).

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv: 2103.03874, 2021.

用 MATH 数据集测数学解题.

Y. Huang, Y. Bai, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, Y. Zhang, J. Lei, et al. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. arXiv preprint arXiv: 2305.08322, 2023.

C-Eval: 中文基础模型多级多科评测.

N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code, 2024.

LiveCodeBench: 整体, 无污染的代码 LLM 评测.

C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. Narasimhan. Swe-bench: Can language models resolve real-world github issues? arXiv preprint arXiv: 2310.06770, 2023.

SWE-Bench: 语言模型能否修好真实 GitHub issue.

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, July 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL https://aclanthology. org/P17-1147.

TriviaQA: 大规模远监督阅读理解挑战集.

A. Joulin, E. Grave, P. Bojanowski, M. Douze, H. Jégou, and T. Mikolov. Fasttext. zip: Compressing text classification models. arXiv preprint arXiv: 1612.03651, 2016.

fastText. zip: 压缩文本分类模型.

D. Kocetkov, R. Li, L. Jia, C. Mou, Y. Jernite, M. Mitchell, C. M. Ferrandis, S. Hughes, T. Wolf, D. Bahdanau, et al. The stack: 3 tb of permissively licensed source code. Transactions on Machine Learning Research, 2022.

The Stack: 约 3TB 宽松许可源码.

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. P. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: a benchmark for question answering research. Trans. Assoc. Comput. Linguistics, 7: 452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL https://doi. org/10.1162/tacl\_a\_00276.

Natural Questions: 问答研究基准.

H. Li, Y. Zhang, F. Koto, Y. Yang, H. Zhao, Y. Gong, N. Duan, and T. Baldwin. CMMLU: Measuring massive multitask language understanding in Chinese. arXiv preprint arXiv: 2306.09212, 2023a.

CMMLU: 中文大规模多任务语言理解.

R. Li, L. B. Allal, Y. Zi, N. Muennighoff, D. Kocetkov, C. Mou, M. Marone, C. Akiki, J. Li, J. Chim, et al. Starcoder: may the source be with you! arXiv preprint arXiv: 2305.06161, 2023b.

StarCoder: 愿源码与你同在.

T. Li, W.-L. Chiang, E. Frick, L. Dunlap, B. Zhu, J. E. Gonzalez, and I. Stoica. From live data to high-quality benchmarks: The arena-hard pipeline, April 2024. URL https://lmsys. org/blog/2024-04-19-arena-hard/.

Arena-Hard 管线: 从实时数据到高质量基准.

J. Liu, C. S. Xia, Y. Wang, and L. Zhang. Is your code generated by chatGPT really correct? rigorous evaluation of large language models for code generation. In Thirty-seventh Conference

J. Liu 等. Is your code generated by chatGPT really correct? . In Thirty-seventh Conference

16

(页码 16)

<!-- page 17 of 19 -->

(第 17 / 19 页)

on Neural Information Processing Systems, 2023a. URL https://openreview. net/forum? id=1qvx610Cu7.

on Neural Information Processing Systems, 2023a. URL https://openreview. net/forum? id=1qvx610Cu7.

T. Liu, C. Xu, and J. McAuley. Repobench: Benchmarking repository-level code auto-completion systems. In The Twelfth International Conference on Learning Representations, 2023b.

RepoBench: 仓库级代码自动补全基准.

X. Liu, X. Lei, S. Wang, Y. Huang, Z. Feng, B. Wen, J. Cheng, P. Ke, Y. Xu, W. L. Tam, X. Zhang, L. Sun, H. Wang, J. Zhang, M. Huang, Y. Dong, and J. Tang. Alignbench: Benchmarking chinese alignment of large language models. CoRR, abs/2311.18743, 2023c. doi: 10.48550/A RXIV. 2311.18743. URL https://doi. org/10.48550/arXiv. 2311.18743.

AlignBench: 大模型中文对齐基准.

I. Loshchilov and F. Hutter. Decoupled weight decay regularization, 2019.

解耦权重衰减正则(AdamW).

A. Lozhkov, R. Li, L. B. Allal, F. Cassano, J. Lamy-Poirier, N. Tazi, A. Tang, D. Pykhtar, J. Liu, Y. Wei, et al. Starcoder 2 and the stack v2: The next generation. arXiv preprint arXiv: 2402.19173, 2024.

A. Lozhkov 等. Starcoder 2 and the stack v2: The next generation. arXiv: 2402.19173, 2024.

MAA. American invitational mathematics examination - aime. American Invitational Mathematics Examination - AIME 2024, 2024. URL https://maa. org/math-competitions/american-invitational-mathematics-examination-aime.

AIME 2024: 美国数学邀请赛.

Meta. Introducing meta llama 3: The most capable openly available llm to date. https://ai. meta. com/blog/meta-llama-3/, April 2024.

Meta. Introducing meta llama 3. https://ai. meta. com/blog/meta-llama-3/, April 2024.

MistralAI. Codestral. https://mistral. ai/news/codestral/, 2024. Accessed: 2024-05-29.

Mistral Codestral 发布页.

Netmind. AI. Odyssey-math. https://github. com/protagolabs/odyssey-math/tree/main, 2024. Accessed: April 22, 2024.

Netmind. AI. Odyssey-math. https://github. com/protagolabs/odyssey-math/tree/main, 2024. Accessed: April 22, 2024.

OpenAI. Gpt-4 technical report, 2023.

GPT-4 技术报告.

B. Peng, J. Quesnelle, H. Fan, and E. Shippole. Yarn: Efficient context window extension of large language models. arXiv preprint arXiv: 2309.00071, 2023.

YaRN: 高效扩展大模型上下文窗口.

M. Reid, N. Savinov, D. Teplyashin, D. Lepikhin, T. Lillicrap, J.-b. Alayrac, R. Soricut, A. Lazaridou, O. Firat, J. Schrittwieser, et al. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv: 2403.05530, 2024.

Gemini 1.5: 百万级上下文的多模态理解.

B. Roziere, J. Gehring, F. Gloeckle, S. Sootla, I. Gat, X. E. Tan, Y. Adi, J. Liu, T. Remez, J. Rapin, et al. Code llama: Open foundation models for code. arXiv preprint arXiv: 2308.12950, 2023.

Code Llama: 开源代码基础模型.

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, M. Zhang, Y. Li, Y. Wu, and D. Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv: 2402.03300, 2024.

DeepSeekMath: 推开源模型数学推理上限.

Q. Shi, M. Tang, K. Narasimhan, and S. Yao. Can language models solve olympiad programming? arXiv preprint arXiv: 2404.10952, 2024.

语言模型能否解奥赛编程题(USACO 相关).

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv: 2210.09261, 2022.

挑战 Big-Bench 难任务与 CoT 能否奏效(BBH).

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv: 2307.09288, 2023.

Llama 2: 开源基础与微调对话模型.

17

(页码 17)

<!-- page 18 of 19 -->

(第 18 / 19 页)

L. Xu, H. Hu, X. Zhang, L. Li, C. Cao, Y. Li, Y. Xu, K. Sun, D. Yu, C. Yu, Y. Tian, Q. Dong, W. Liu, B. Shi, Y. Cui, J. Li, J. Zeng, R. Wang, W. Xie, Y. Li, Y. Patterson, Z. Tian, Y. Zhang, H. Zhou, S. Liu, Z. Zhao, Q. Zhao, C. Yue, X. Zhang, Z. Yang, K. Richardson, and Z. Lan. CLUE: A chinese language understanding evaluation benchmark. In D. Scott, N. Bel, and C. Zong, editors, Proceedings of the 28th International Conference on Computational Linguistics, COLING 2020, Barcelona, Spain (Online), December 8-13, 2020, pages 4762–4772. International Committee on Computational Linguistics, 2020. doi: 10.18653/V1/2020. COLING-MAIN. 419. URL https://doi. org/10.18653/v1/2020. coling-main. 419.

CLUE: 中文语言理解评测基准.

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. P. Xing, H. Zhang, J. E. Gonzalez, and I. Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena, 2023.

用 MT-Bench 与 Chatbot Arena 评「LLM 当裁判」.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric benchmark for evaluating foundation models. CoRR, abs/2304.06364, 2023. doi: 10.48550/arXiv. 2304.06364. URL https://doi. org/10.48550/arXiv. 2304.06364.

AGIEval: 以人为中心的基础模型评测.

18

(页码 18)

<!-- page 19 of 19 -->

(第 19 / 19 页)

## A. Supported Programming Languages ## A. 支持的编程语言

ABAP, ActionScript, Ada, Agda, AGS Script, Alloy, AmbientTalk, AMD GPU, AMPL, ANSYS Parametric Design Language, ANTLR, Apache Configuration, APL, AppleScript, Arc, Arduino, ASP, AspectJ, Assembly, Asymptote, Augeas, AutoHotkey, AutoIt, AWK, BC, Berry, BitBake, BlitzBasic, BlitzMax, Bluespec, BNF, Boo, Boogie, Brainfuck, BrightScript, Bro, BST, C, C#, C2HS Haskell, CADL, CapDL, Ceylon, Chapel, ChucK, Cirru, Click, Clojure, CMake, COBOL, COBOLFree, CoffeeScript, ColdFusion CFC, Common Lisp, C++, Crystal, Csound, Csound Score, CSS, CUDA, Cypher, Cython, Darcs Patch, Dart, DASM16, Debian Control File, DeviceTree, Diff, DM, Docker, Dockerfile, Dylan, EBNF, eC, Eiffel, Elixir, Elm, ELPi, Emacs Lisp, EmberScript, Erlang, Execline, F#, Factor, Fancy, Fantom, Felix, Fennel, Fish, Flux, Fortran, Fortran Fixed Form, FoxPro, FreeFem, FreeMarker, F\*, Futhark, G-Code, GAP, GAS, GDScript, Genshi, Gentoo Ebuild, Gentoo Eclass, Gettext Catalog, GLSL, Glyph, Gnuplot, Go, Gosu, Grace, Gradle, Grammatical Framework, GraphQL, Graphviz DOT, Groff, Groovy, Groovy Server Pages, GSQL, Handlebars, Haskell, Haxe, HCL, HLSL, HTML, HTML Django, HTML ERB, HTML PHP, HTTP, Hy, Idris, IGOR Pro, Inform 6 Template, Inno Setup, Io, Isabelle, J, Jade, JAGS, Jasmin, Java, Java Server Pages, JavaScript, JavaScript MozPreproc, JCL, JFlex, JSON, JSONiq, JSX, Julia, Jupyter Notebook, K, Kconfig, Koka, Kotlin, KRL, Lean, Less, Lex, LFE, Lighttpd Configuration File, LilyPond, Limbo, Linker Script, Liquid, Literate Agda, Literate CoffeeScript, LLVM, Logtalk, LSL, Lua, M4, Makefile, Mako, Mason, MATLAB, Maxima, Meson, Metal, MiniScript, Mirah, Mizar, Modelica, Modula-2, Monkey, MooCode, MoonScript, Mosel, MQL, MUF, MuPAD, NASM, NCL, NetLinx, Nginx Configuration File, Nimrod, Ninja, Nit, Nix, NSIS, Nu, NuSMV, Objdump, Objective-C, Objective-C++, OCaml, Octave, Odin, OMG Interface Definition Language, ooc, Opa, OpenCL, OpenEdge ABL, OpenSCAD, Ox, Oz, Papyrus, Parrot Internal Representation, Pascal, PAWN, PEG, Perl, Perl 6, PHP, Pike, PkgConfig, POD, Pony, POV-Ray, PowerShell, Praat, Processing, Propeller Spin, Protocol Buffer, Pug, Puppet, PureBasic, PureScript, Python, Q, QML, QVTO, R, Racket, Ragel in Ruby Host, RAML, RConsole, Rd, REALbasic, ReasonML, Red, RenderScript, Ren’Py, REXX, RHTML, Ride, Robot Framework, Rouge, Ruby, Rust, S, Sage, SARL, SAS, Sass, Scala, Scheme, Scilab, SCSS, Self, Shell, ShExC, Sieve, Silver, Singularity, Slim, Smali, Smarty, Smithy, SMT, Solidity, SourcePawn, SPARQL, SQF, SQL, Squirrel, Stan, Standard ML, Stata, Stylus, SuperCollider, Swift, SWIG, SystemVerilog, Tcl, Tcsh, Tea, Terminfo, TeX, Thrift, Transact-SQL, Treetop, Turing, Twig, TypeScript, TypoScript, Unity3D Asset, Uno, UnrealScript, UrWeb, USD, Vala, VBScript, VCL, Velocity, Verilog, VHDL, VimL, Visual Basic, Vue, WebAssembly, Web IDL, Whiley, X10, XBase, XC, XML, XML Lasso, XQuery, XS, XSLT, Xtend, Xtlang, YANG, Zeek, Zephir, Zig, Zimpl

附录 A: 支持的编程语言列表(与原文相同, 不另译各名称).

19

(页码 19)
