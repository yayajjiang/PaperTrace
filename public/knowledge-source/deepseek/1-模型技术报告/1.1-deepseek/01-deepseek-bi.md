---
title: "01 · DeepSeek LLM · 对照译稿"
category: "模型技术报告"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek LLM 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
# DeepSeek LLM Scaling Open-Source Language Models with Longtermism / DeepSeek LLM: 用长期主义缩放开源语言模型

Xiao Bi, Deli Chen, Guanting Chen, Shanhuang Chen, Damai Dai, Chengqi Deng, Honghui Ding, Kai Dong, Qiushi Du, Zhe Fu, Huazuo Gao, Kaige Gao, Wenjun Gao, Ruiqi Ge, Kang Guan, Daya Guo, Jianzhong Guo, Guangbo Hao, Zhewen Hao, Ying He, Wenjie Hu, Panpan Huang, Erhang Li, Guowei Li, Jiashi Li, Yao Li, Y. K. Li, Wenfeng Liang, Fangyun Lin, A. X. Liu, Bo Liu, Wen Liu, Xiaodong Liu, Xin Liu, Yiyuan Liu, Haoyu Lu, Shanghao Lu, Fuli Luo, Shirong Ma, Xiaotao Nie, Tian Pei, Yishi Piao, Junjie Qiu, Hui Qu, Tongzheng Ren, Zehui Ren, Chong Ruan, Zhangli Sha, Zhihong Shao, Junxiao Song, Xuecheng Su, Jingxiang Sun, Yaofeng Sun, Minghui Tang, Bingxuan Wang, Peiyi Wang, Shiyu Wang, Yaohui Wang, Yongji Wang, Tong Wu, Y. Wu, Xin Xie, Zhenda Xie, Ziwei Xie, Yiliang Xiong, Hanwei Xu, R. X. Xu, Yanhong Xu, Dejian Yang, Yuxiang You, Shuiping Yu, Xingkai Yu, B. Zhang, Haowei Zhang, Lecong Zhang, Liyue Zhang, Mingchuan Zhang, Minghua Zhang, Wentao Zhang, Yichao Zhang, Chenggang Zhao, Yao Zhao, Shangyan Zhou, Shunfeng Zhou, Qihao Zhu, Yuheng Zou

<sup>\*</sup>**DeepSeek-AI**



作者按姓氏字母序排列; DeepSeek-AI.

## Abstract

The rapid development of open-source large language models (LLMs) has been truly remarkable. However, the scaling laws described in previous literature presents varying conclusions, which casts a dark cloud over scaling LLMs. We delve into the study of scaling laws and present our distinctive findings that facilitate the scaling of large scale models in two prevalent used open-source configurations, 7B and 67B. Guided by the scaling laws, we introduce DeepSeek LLM, a project dedicated to advancing open-source language models with a long-term perspective. To support the pre-training phase, we have developed a dataset that currently consists of 2 trillion tokens and is continuously expanding. We further conduct supervised fine-tuning (SFT) and direct preference optimization (DPO) on DeepSeek LLM Base models, resulting in the creation of DeepSeek Chat models. Our evaluation results demonstrate that DeepSeek LLM 67B surpasses LLaMA-2 70B across a range of benchmarks, especially in the domains of code, mathematics, and reasoning. Furthermore, open-ended evaluations reveal that our DeepSeek LLM 67B Chat exhibits superior performance compared to GPT-3.5.



开源大模型发展很快, 但既有文献里的 Scaling Laws 结论并不一致, 给继续放大模型蒙上一层不确定. 本文重新做 Scaling Laws, 并给出便于落地到常见开源档位(7B, 67B)的发现. 在此指导下推出 DeepSeek LLM: 以长期视角推进开源语言模型. 预训练语料现约 2 万亿 token, 仍在扩充; 再在 Base 上做 SFT 与 DPO, 得到 Chat. 评测显示 DeepSeek LLM 67B 在多项基准上超过 LLaMA-2 70B, 代码, 数学, 推理尤为明显; 开放式评测里 67B Chat 也强于 GPT-3.5.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280">\*Authors are ordered alphabetically by the last name. </span></small>

## Contents

- 1 Introduction 3
- 2 Pre-Training 4
  - 2.1 Data . . 4
  - 2.2 Architecture 5
  - 2.3 Hyperparameters . 5
  - 2.4 Infrastructures . 6
- 3 Scaling Laws 7
  - 3.1 Scaling Laws for Hyperparameters . 8
  - 3.2 Estimating Optimal Model and Data Scaling 9
  - 3.3 Scaling Laws with Different Data . 12
- 4 Alignment 12
- 5 Evaluation 13
  - 5.1 Public Benchmark Evaluation . 13
    - 5.1.1 Base Model 14
    - 5.1.2 Chat Model 14
  - 5.2 Open-Ended Evaluation 17
    - 5.2.1 Chinese Open-Ended Evaluation . 17
    - 5.2.2 English Open-Ended Evaluation 18
  - 5.3 Held-Out Evaluation . 18
  - 5.4 Safety Evaluation . 19
  - 5.5 Discussion . 20
- 6 Conclusion, Limitation, and Future Work 23
- A Appendix 30
  - A.1 Acknowledgments 30
  - A.2 Different Model Scale Representations . 30
  - A.3 Benchmark Metrics Curves 31
  - A.4 Comparison with Code or Math Specific Models 32
  - A.5 Benchmark Results w/ DPO Stage 32
  - A.6 Evaluation Formats . . 32

## 1. Introduction

Over the past few years, Large Language Models (LLMs) based on decoder-only Transformers (Vaswani et al., 2017) have increasingly become the cornerstone and pathway to achieving Artificial General Intelligence (AGI). By predicting the next word in continuous text, LLMs undergo self-supervised pre-training on massive datasets, enabling them to achieve various purposes and possess many abilities, such as novel creation, text summarization, code completion, and more. Subsequent developments like supervised fine-tuning and reward modeling have enabled Large Language Models (LLMs) to better follow user intentions and instructions. This has endowed them with more versatile conversational capabilities and rapidly expanded their influence.



近几年, 仅解码器 Transformer 上的大语言模型, 越来越被当成通往 AGI 的底座. 靠「下一个词预测」在海量数据上自监督预训练, 就能写小说, 摘要, 补代码等; 再经监督微调与奖励建模, 更贴用户意图, 对话能力铺开, 影响力也跟着涨.

This wave is sparked with <u>closed products</u>, such as ChatGPT (OpenAI, 2022), Claude (Anthropic, 2023), and Bard (Google, 2023), which are developed with extensive computational resources and substantial annotation costs. These products have significantly raised the community’s expectations for the capabilities of open-source LLMs, consequently inspiring a series of work (Bai et al., 2023; Du et al., 2022; Jiang et al., 2023; Touvron et al., 2023a, b; Yang et al., 2023). Among these, the LLaMA series models (Touvron et al., 2023a, b) stand out. It consolidates a range of works to create an efficient and stable architecture, building well-performing models ranging from 7B to 70B parameters. Consequently, the LLaMA series has become the de facto benchmark for architecture and performance among open-source models.



这波浪潮由闭源产品点燃: ChatGPT, Claude, Bard 等, 算力与标注成本都很高, 也把社区对开源模型的期待抬高, 催生一串工作. 其中 LLaMA 系列最突出: 吸收多路工作做成高效稳定架构, 7B 到 70B 表现扎实, 已成开源侧架构与性能的事实基准.

Following LLaMA, the open-source community has primarily focused on training fixed-size (7B, 13B, 34B, and 70B), high-quality models, often neglecting research exploration into LLM scaling laws (Hoffmann et al., 2022; Kaplan et al., 2020). Nonetheless, research on scaling laws is of utmost importance, considering that the current open-source models are merely at the initial stage of Artificial General Intelligence (AGI) development. In addition, early works (Hoffmann et al., 2022; Kaplan et al., 2020) reached varying conclusions on the scaling of model and data with increased compute budgets and inadequately addressed hyperparameter discussions. In this paper, we extensively investigate the scaling behavior of language models and apply our findings in two widely used large-scale model configurations, namely 7B and 67B. Our study aims to lay the groundwork for future scaling of open-source LLMs, paving the way for further advancements in this domain. Specifically, we first examined the scaling laws of batch size and learning rate, and found their trends with model size. Building on this, we conducted a comprehensive study of the scaling laws of the data and model scale, successfully revealing the optimal model/data scaling-up allocation strategy and predicting the expected performance of our large-scale models. Additionally, during development, we discovered that the scaling laws derived from different datasets show significant differences. This suggests that choice of dataset remarkably affects the scaling behavior, indicating that caution should be exercised when generalizing scaling laws across datasets.



LLaMA 之后, 开源社区多盯着固定体量(7B/13B/34B/70B)训高质量模型, Scaling Laws 研究常被晾在一边. 但开源模型还只在 AGI 早期, Scaling Laws 很关键; 早期工作在「算力加码后模型与数据怎么分」上结论不一, 超参讨论也不够. 本文系统查语言模型的缩放行为, 并落到常用的 7B, 67B. 先看 batch size 与学习率随模型规模的趋势; 再研究数据与模型规模的最优分配, 并预测大规模模型表现. 开发中还发现: 不同数据集推出的 Scaling Laws 差得很明显, 说明数据选择会改缩放行为, 跨数据集套用 Scaling Laws 要谨慎.

Under the guidance of our scaling laws, we build from scratch open-source large language models, and release as much information as possible for community reference. We collect 2 trillion tokens for pre-training, primarily in Chinese and English. At the model level, we generally followed the architecture of LLaMA, but replaced the cosine learning rate scheduler with a multi-step learning rate scheduler, maintaining performance while facilitating continual training. We collected over 1 million instances for supervised fine-tuning (SFT) (Ouyang et al., 2022) from diverse sources. This paper shares our experiences with different SFT strategies and findings in data ablation techniques. Additionally, we have utilized direct preference optimization (DPO) (Rafailov et al., 2023) to improve the conversational performance of the model.



按自家 Scaling Laws 从零训开源大模型, 并尽量公开细节. 预训练约 2 万亿 token, 以中英为主. 架构大体跟 LLaMA, 但把余弦学习率换成 **multi-step(多段阶梯)学习率**: 成绩相当, 又更方便持续训练. SFT 收集逾百万条多样数据, 并分享不同 SFT 策略与数据消融经验; 再用 DPO 抬对话表现.

解释: multi-step 学习率 = 按训练 token 比例分几段, 到节点就把学习率按固定比例往下砍(文中是 warmup 后到峰值, 训完约 80% token 降到峰值的 31.6%, 再过 10% 降到 10%), 而不是一条平滑的余弦衰减. 好处是前一段训完的 checkpoint 还能接着用, 换数据规模续训时少浪费; 和余弦终局表现差不多.

We conduct extensive evaluations using our base and chat models. The evaluation results demonstrate that DeepSeek LLM surpasses LLaMA-2 70B across various benchmarks, particu larly in the fields of code, mathematics, and reasoning. Following SFT and DPO, the DeepSeek 67B chat model outperforms GPT-3.5 in both Chinese and English open-ended evaluations. This highlights the superior performance of DeepSeek 67B in generating high-quality responses and engaging in meaningful conversations in both languages. Furthermore, the safety evaluation indicates that DeepSeek 67B Chat can provide harmless responses in practice.



Base 与 Chat 都做了大量评测: DeepSeek LLM 多项基准超过 LLaMA-2 70B, 代码, 数学, 推理更明显; SFT+DPO 后, 67B Chat 在中英开放式评测上压过 GPT-3.5; 安全评测也显示能给出无害回答.

In the rest of this paper, we first introduce our pre-training basic concepts of DeepSeek LLM in Section 2, including the composition of data, model architecture, infrastructure, and hyperparameters. In Section 3, we provide a detailed explanation of the scaling laws we have discovered and its implications. Additionally, we discuss the rationale behind our selection of pre-training hyperparameters, taking into account the insights gained from the scaling laws analysis. In Section 4, we discuss our fine-tuning methodology, encompassing the composition of fine-tuning data and specific methods during the SFT and DPO stages. We then present the detailed evaluation results of DeepSeek LLM in Section 5, covering both the base and chat models, as well as their performance in open-ended evaluations and safety evaluations. Finally, we discuss the current limitations and future directions of DeepSeek LLM in Section 6.



后文结构: §2 预训练(数据, 架构, 基建, 超参); §3 Scaling Laws 与预训练超参怎么选; §4 微调(SFT, DPO 数据与方法); §5 评测(Base/Chat, 开放式, 安全); §6 局限与后续.

## 2. Pre-Training 预训练

### 2.1. Data 数据

Our main objective is to comprehensively enhance the richness and diversity of the dataset. We have gained valuable insights from reputable sources such as (Computer, 2023; Gao et al., 2020; Penedo et al., 2023; Touvron et al., 2023a). To achieve these goals, we have organized our approach into three essential stages: deduplication, filtering, and remixing. The deduplication and remixing stages ensure a diverse representation of the data by sampling unique instances. The filtering stage enhances the density of information, thereby enabling more efficient and effective model training.



目标是把语料做得更丰富, 更多样. 参考 RedPajama, The Pile, RefinedWeb, LLaMA 等经验, 流程收成三步: 去重, 过滤, 再混合. 去重与再混合用「抽到不重复的样本」保多样性; 过滤抬信息密度, 训练更划算.

We adopted an aggressive deduplication strategy, expanding the deduplication scope. Our analysis revealed that deduplicating the entire Common Crawl corpus results in higher removal of duplicate instances compared to deduplicating within a single dump. Table 1 illustrates that deduplicating across 91 dumps eliminates four times more documents than a single dump method.



去重做得偏激进, 范围拉大: 对整个 Common Crawl 一起去重, 比只在单次 dump 里去重删掉的重复更多. 表 1: 跨 91 个 dump 去重, 删掉的文档量约是单 dump 的四倍.

| Dumps Used | 1 | 2 | 6 | 12 | 16 | 22 | 41 | 91 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Deduplication Rate (%) | 22.2 | 46.7 | 55.7 | 69.9 | 75.7 | 76.3 | 81.6 | 89.8 |

Table 1 | Deduplication ratios for various Common Crawl dumps.



表 1｜不同数量 Common Crawl dump 下去重率.

In the filtering stage, we focus on developing robust criteria for document quality assessment. This involves a detailed analysis incorporating both linguistic and semantic evaluations, providing a view of data quality from individual and global perspectives. In the remixing phase, we adjust our approach to address data imbalances, focusing on increasing the presence of underrepresented domains. This adjustment aims to achieve a more balanced and inclusive dataset, ensuring that diverse perspectives and information are adequately represented.



过滤阶段: 从语言学与语义两侧定文档质量标准, 兼顾单篇与全局视角. 再混合阶段: 补弱覆盖领域, 减轻数据失衡, 让视角更均衡.

For our tokenizer, we implemented the Byte-level Byte-Pair Encoding (BBPE) algorithm based on the tokenizers library (Huggingface Team, 2019). Pre-tokenization was employed to prevent the merging of tokens from different character categories such as new lines, punctuation, and Chinese-Japanese-Korean (CJK) symbols, similar to GPT-2 (Radford et al., 2019). We also chose to split numbers into individual digits following the approach used in (Touvron et al., 2023a, b). Based on our prior experience, we set the number of conventional tokens in the vocabulary at 100000. The tokenizer was trained on a multilingual corpus of approximately 24 GB, and we augmented the final vocabulary with 15 special tokens, bringing the total size to 100015. To ensure computational efficiency during training and to reserve space for any additional special tokens that might be needed in the future, we configured the model’s vocabulary size to 102400 for training.



分词器用 Hugging Face tokenizers 实现的 BBPE. 预分词避免换行, 标点, CJK 等不同字符类被并成一个 token(类似 GPT-2); 数字按位拆开(同 LLaMA). 常规词表约 10 万; 在约 24 GB 多语语料上训, 再加 15 个特殊 token, 合计 100015. 训练时模型词表设为 102400, 方便对齐算力并预留后续特殊 token.

### 2.2. Architecture 架构

| Params | 𝑛layers | 𝑑<sub>model</sub> | 𝑛heads | 𝑛kv_heads | CLoenntgetxht | BSaetqcuheSniczee | LeRaranteing | Tokens |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 7B | 30 | 4096 | 32 | 32 | 4096 | 2304 | 4.2e-4 | 2.0T |
| 67B | 95 | 8192 | 64 | 8 | 4096 | 4608 | 3.2e-4 | 2.0T |

Table 2 | Detailed specs of DeepSeek LLM family of models. We choose the hyper-parameters based on our findings in Section 3



表 2｜DeepSeek LLM 系列规格. 超参按 §3 结论选取. (表头个别列名 OCR 有损: Context Length, Batch Size, Learning Rate.)

The micro design of DeepSeek LLM largely follows the design of LLaMA (Touvron et al., 2023a, b), adopting a Pre-Norm structure with RMSNorm (Zhang and Sennrich, 2019) function and using SwiGLU (Shazeer, 2020) as the activation function for the Feed-Forward Network (FFN), with an intermediate layer dimension of $\textstyle { \frac { 8 } { 3 } } d _ { m o d e l }$ . It also incorporates Rotary Embedding (Su et al., 2024) for positional encoding. To optimize inference cost, the 67B model uses Grouped-Query Attention (GQA) (Ainslie et al., 2023) instead of the traditional Multi-Head Attention (MHA).



微观设计大体跟 LLaMA: Pre-Norm + RMSNorm; FFN 用 SwiGLU, 中间维 $\frac{8}{3}d_{model}$; 位置编码用 RoPE. 67B 为压推理成本, 用 GQA 替代传统 MHA.

However, in terms of macro design, DeepSeek LLM differs slightly. Specifically, DeepSeek LLM 7B is a 30-layer network, while DeepSeek LLM 67B has 95 layers. These layer adjustments, while maintaining parameter consistency with other open-source models, also facilitate model pipeline partitioning to optimize training and inference.



宏观上略有不同: 7B 共 30 层, 67B 共 95 层. 在参数量与常见开源档对齐的同时, 也方便流水线切分, 利于训练与推理.

Unlike most works using Grouped-Query Attention (GQA), we expanded the 67B model’s parameters in network depth rather than the common practice of widening the intermediate width of FFN layers, aiming for better performance. Detailed network specifications can be found in Table 2.



多数 GQA 工作会加宽 FFN; 这里 67B 更偏向加深度, 期望更好表现. 细节见表 2.

### 2.3. Hyperparameters 超参数

DeepSeek LLM is initialized with a standard deviation of 0.006 and trained using the AdamW optimizer (Loshchilov and Hutter, 2017), with the following hyperparameters: $\beta _ { 1 } = 0 . 9 , \beta _ { 2 } = 0 . 9 5 , $ and weight\_decay = 0.1.



初始化标准差 0.006; 优化器用 AdamW, $\beta_1=0.9$, $\beta_2=0.95$, weight_decay=0.1.

A multi-step learning rate scheduler is employed during pre-training instead of the typical cosine scheduler. Specifically, the learning rate of the model reaches its maximum value after 2000 warmup steps, and then decreases to 31.6% of the maximum value after processing 80% of the training tokens. It further reduces to 10% of the maximum value after 90% of the tokens. The gradient clipping during the training phase is set to 1.0.



预训练用 multi-step 学习率, 不用常见余弦: 2000 step warmup 到峰值; 训完 80% token 降到峰值的 31.6%; 再过到 90% 降到 10%. 梯度裁剪 1.0.

Based on our empirical findings, we observed that despite differences in the loss reduction trend during training, the final performance using a multi-step learning rate scheduler is essentially consistent with that of a cosine scheduler, as shown in Figure 1(a). When adjusting the training scale while keeping the model size fixed, the multi-step learning rate scheduler allows for the reuse of training from the first phase, offering a unique convenience for continual training. Therefore, we chose the multi-step learning rate scheduler as our default setting. We also demonstrate in Figure 1(b) that adjusting the proportions of different stages in the multi-step learning rate scheduler can yield slightly better performance. However, for the sake of balancing reuse ratios in continual training and model performance, we opted for the aforementioned distribution of 80%, 10%, and 10% for the three stages respectively.



经验上: 训练过程 loss 曲线形状会不同, 但 multi-step 与余弦的终局表现基本一致(图 1(a)). 固定模型, 改训练规模时, multi-step 能复用第一阶段训练, 续训更方便, 故作默认. 图 1(b) 显示改各段比例还能略好一点; 为兼顾续训复用比例与性能, 最终采用 80% / 10% / 10% 三段.

![](. /images/page_5_chart_0.jpg)

(a) Multi-step v. s. cosine learning rate decay

![](. /images/page_5_chart_2.jpg)

(b) Different proportions of multi-step stages

Figure 1 | Training loss curves with different learning rate schedulers or different parameters for schedulers. The model size is 1.6 billion parameters, trained on a dataset of 100 billion tokens.



图 1｜不同学习率日程(或不同分段比例)下的训练 loss. 模型 1.6B, 数据 100B token. (a) multi-step 对比余弦; (b) multi-step 各段比例.

The batch size and learning rate vary with the model size. Specific parameters for the pre-training phases of the 7B and 67B models can be found in Table 2.



batch size 与学习率随模型规模变; 7B, 67B 预训练具体数值见表 2.

### 2.4. Infrastructures 基础设施

We use an efficient and light-weight training framework named HAI-LLM (High-flyer, 2023) to train and evaluate large language models. Data parallelism, tensor parallelism, sequence parallelism, and 1F1B pipeline parallelism are integrated into this framework as done in Megatron (Korthikanti et al., 2023; Narayanan et al., 2021; Shoeybi et al., 2019). We also leverage the flash attention (Dao, 2023; Dao et al., 2022) technique to improve hardware utilization. ZeRO-1 (Rajbhandari et al., 2020) is exploited to partition optimizer states over data parallel ranks. Efforts are also made to overlap computation and communication to minimize additional waiting overhead, including the backward procedure of the last micro-batch and reduce-scatter operation in ZeRO-1, and GEMM computation and all-gather/reduce-scatter in sequence parallel. Some layers/operators are fused to speed up training, including LayerNorm, GEMM whenever possible, and Adam updates. To improve model training stability, we train the model in bf16 precision but accumulate gradients in fp32 precision. In-place cross-entropy is performed to reduce GPU memory consumption, i. e.: we convert bf16 logits to fp32 precision on the fly in the cross-entropy CUDA kernel (instead of converting it beforehand in HBM), calculate the corresponding bf16 gradient, and overwrite logits with its gradient.



训练与评测用轻量框架 HAI-LLM: 数据并行, 张量并行, 序列并行, 1F1B 流水线(同 Megatron 思路); FlashAttention 抬硬件利用率; ZeRO-1 切分优化器状态. 计算与通信尽量重叠(末个 micro-batch 反传与 ZeRO-1 的 reduce-scatter; 序列并行里 GEMM 与 all-gather/reduce-scatter). 融合 LayerNorm, 能融合的 GEMM, Adam 更新. 前向 bf16, 梯度累加用 fp32 求稳; 交叉熵原地做: 在 CUDA kernel 里把 bf16 logits 现场升到 fp32 算, 再写回 bf16 梯度, 省 HBM.

Model weights and optimizer states are saved every 5 minutes asynchronously, which means we will lose no more than 5 minutes of training in the worst case of occasional hardware or network failures. These temporary model checkpoints are cleared up regularly to avoid consuming too much storage space. We also support resuming training from a different 3D parallel configuration to cope with dynamic changes in computing cluster load.



权重与优化器状态每 5 分钟异步存一次, 最坏丢不到 5 分钟进度; 临时 checkpoint 定期清. 支持换一套 3D 并行配置再续训, 好应对集群负载变化.

As for evaluation, we employ vLLM (Kwon et al., 2023) in generative tasks, and continuous batching in non-generative tasks to avoid manual batch size tuning and reduce token padding.



评测: 生成任务用 vLLM; 非生成任务用 continuous batching, 少手工调 batch, 少 padding.

## 3. Scaling Laws Scaling Laws

Research on scaling laws (Hestness et al., 2017) predates the emergence of large language models. Scaling laws (Henighan et al., 2020; Hoffmann et al., 2022; Kaplan et al., 2020) suggest that model performance can be predictably improved with increases in compute budget 𝐶, model scale 𝑁, and data scale 𝐷. When model scale 𝑁 is represented by model parameters and data scale 𝐷 by the number of tokens, 𝐶 can be approximated as $C = 6 N D$ . Therefore, how to optimize the allocation between model and data scales when increasing the compute budget is also a crucial research objective in scaling laws.



Scaling Laws 研究早于大模型热潮. 结论大致是: 算力预算 $C$, 模型规模 $N$, 数据规模 $D$ 加大, 表现可预期变好. 若 $N$ 用参数量, $D$ 用 token 数, 常近似 $C=6ND$. 于是「加算力时模型和数据怎么分」成了核心问题.

The development of LLMs (Dai et al., 2019; Radford et al., 2019), with larger models achieving unexpected and significant performance improvements, has brought scaling laws research to a new peak. Results in scaling laws demonstrate that expanding the compute budget continues to yield significant benefits, which further encourages the increase in model scales (Brown et al., 2020; Smith et al., 2022).



大模型把 Scaling Laws 推到新高峰: 更大模型常带来意外大幅提升; Scaling Laws 也说明继续砸算力仍有明显收益, 反过来鼓励把模型做大.

However, as shown in Table 4, early works (Hoffmann et al., 2022; Kaplan et al., 2020) on the optimal model/data scaling-up allocation strategy have shown varying conclusions, raising doubts about the general applicability of scaling laws. Moreover, these studies often lacked a complete description of hyperparameter settings, leaving it uncertain whether models under different compute budgets reached optimal performance. Therefore, we revisit scaling laws in this section to address these uncertainties and ensure we are on the right path to efficiently scaleup compute, which reflects the long-term perspective and is key to developing continuously improving models.



表 4 显示: 早期工作对最优模型/数据分配结论并不一致, 让人怀疑 Scaling Laws 能不能泛化. 超参设定也常交代不全, 不同算力下是否训到最优并不清楚. 本节重做 Scaling Laws, 就是为把这些不确定啃掉, 保证加算力走在对的路上. 这也是「长期主义」与持续变强的关键.

To ensure that models under different compute budgets can achieve optimal performance, we first studied the scaling laws of hyperparameters. Empirically, it has been observed that the optimal values of most parameters during training do not change when varying compute budgets. Therefore, these parameters are consistent with those outlined in Section 2.3 and remain unchanged across different compute budgets. However, the hyperparameters that have the most significant impact on performance, namely batch size and learning rate, were re-examined.



为让不同算力预算下的模型都能接近最优, 先做超参 Scaling Laws. 经验上多数训练超参在改算力时最优值几乎不动, 与 §2.3 一致; 真正要重查的是影响最大的 batch size 与学习率.

Early works (Goyal et al., 2017; McCandlish et al., 2018; Shallue et al., 2019; Smith et al., 2017; Zhang et al., 2019) provided some empirical observations for setting batch size and learning rate, but we found these observations have limited applicability in our preliminary experiments. Through extensive experiments, we modeled the power law relationship between the compute budget 𝐶 and the optimal batch size and learning rate. This relationship, which we refer to as the scaling laws of hyperparameters, provides an empirical framework for determining the optimal hyperparameters. This methodology ensures that models across different compute budgets can reach their near-optimal performance.



早期关于 batch / 学习率的经验在我们初实验里不好用. 大规模实验后, 拟合出算力预算 $C$ 与最优 batch, 最优学习率之间的幂律, 称作「超参 Scaling Laws」, 用来给不同算力挑近优超参.

We then study the scaling laws of the model and data scales. To reduce experimental costs and fitting difficulties, we adopted the IsoFLOP profile approach from Chinchilla (Hoffmann et al., 2022) to fit the scaling curve. To represent the model scale more accurately, we utilized a new model scale representation, non-embedding FLOPs/token 𝑀, replacing the earlier-used model parameters 𝑁, and substituted the approximate compute budget formula $C \; = \; 6 N D$ with the more precise 𝐶 = 𝑀𝐷. The experimental results provided insights into the optimal model/data scaling-up allocation strategy and performance predictions, and also accurately forecasted the expected performance of DeepSeek LLM 7B and 67B models.



再研究模型与数据规模缩放. 为省实验成本, 降低拟合难度, 采用 Chinchilla 的 IsoFLOP 剖面法. 模型规模改用 **non-embedding FLOPs/token $M$**, 不再用参数量 $N$; 算力预算从近似 $C=6ND$ 换成更准的 $C=MD$. 由此得到最优模型/数据分配与性能预测, 并能较准地预报 DeepSeek LLM 7B, 67B.

解释: non-embedding FLOPs/token($M$)= 每处理一个 token, 不算词表那一层时, 模型前向大约要多少浮点运算. 旧做法用 $6N$(参数量 ×6)估算力, 既漏掉注意力对序列长度的开销, 又可能把词表矩阵算进去(词表大但对「能力」贡献相对小). $M$ 把注意力算进去, 把词表算力拿掉, 小模型上误差能到约 50%, 换表示后拟合大模型更靠谱.

Additionally, in the process of exploring scaling laws, the data we used underwent multiple iterations, continually improving in quality. We attempted to fit the scaling curve on various datasets and found that the data quality significantly influences the optimal model/data scalingup allocation strategy. The higher the data quality, the more the increased compute budget should be allocated to model scaling. This implies that high-quality data can drive the training of larger models given the same data scale. The differences in the optimal model/data scaling-up allocation strategy may also serve as an indirect approach to assess the quality of data. We will continue to pay close attention to the changes in data quality and its impact on scaling laws, and provide more analysis in future works.



探索 Scaling Laws 时数据多轮迭代, 质量在涨. 在不同数据集上拟合发现: 数据质量会显著改最优模型/数据分配: 质量越高, 新增算力越该偏向放大模型; 同等数据规模下, 高质量数据更撑得住更大模型. 分配策略差异甚至可间接当「数据质量探针」. 后续会继续盯质量变化与 Scaling Laws, 并另文展开.

In summary, our contributions and findings in scaling laws can be summarized as follows:

• We established the scaling laws for hyperparameters, providing an empirical framework for determining the optimal hyperparameters.

• Instead of model parameters 𝑁, we adopt non-embedding FLOPs/token 𝑀 to represent the model scale, leading to a more accurate optimal model/data scaling-up allocation strategy and a better prediction of generalization loss for large-scale models.

• The quality of pre-training data impacts the optimal model/data scaling-up allocation strategy. The higher the data quality, the more the increased compute budget should be allocated to model scaling.



Scaling Laws 方面贡献与发现:

• 建立超参 Scaling Laws, 给近优超参一套经验框架.

• 用 non-embedding FLOPs/token $M$ 代替参数量 $N$ 表示模型规模, 最优分配更准, 大规模泛化 loss 更好预报.

• 预训练数据质量影响最优分配: 质量越高, 加算力越该分给模型放大.

### 3.1. Scaling Laws for Hyperparameters 超参数的 Scaling Laws

We initially conducted a grid search for batch size and learning rate on small-scale experiments with a compute budget of 1e17, and the results of a specific model size (177M FLOPs/token) are illustrated in Figure 2(a). The results demonstrate that the generalization error remains stable across a wide range of choices of batch sizes and learning rates. This indicates that near-optimal performance can be achieved within a relatively wide parameter space.



先在算力预算 1e17 的小规模网格搜索 batch 与学习率; 图 2(a) 是某一模型规模(177M FLOPs/token)的结果. 泛化误差在很宽的 batch / 学习率范围内都稳, 说明近优解落在较宽的参数带里.

![](. /images/page_7_chart_8.jpg)

(a) 1e17 FLOPs (177M FLOPs/token)

![](. /images/page_7_chart_10.jpg)

(b) 1e20 FLOPs (2.94B FLOPs/token)

Figure 2 | Training loss w. r. t. batch size and learning rate with 1e17 and 1e20 FLOPs.



图 2｜算力 1e17 与 1e20 下, 训练 loss 随 batch size, 学习率变化.

Then, we utilized the aforementioned multi-step learning rate scheduler to effectively train multiple models with different batch sizes, learning rates, and compute budgets ranging from

1e17 to 2e19 by reusing the first stage. Considering the redundancy in the parameter space, we regarded the parameters used by models whose generalization error exceeded the minimum by no more than 0.25% as near-optimal hyperparameters. We then fitted the batch size 𝐵 and learning rate 𝜂 with respect to the compute budget 𝐶. The fitting results, as shown in Figure 3, reveal that the optimal batch size 𝐵 gradually increases with the increase in compute budget 𝐶, while the optimal learning rate 𝜂 gradually decreases. This is in line with the intuitive empirical settings for batch size and learning rate when scaling up models. Moreover, all near-optimal hyperparameters fall within a broad band range, indicating that it is relatively easy to choose near-optimal parameters within this interval. The final formulae we fitted for batch size and learning rate are as follows:



再用 multi-step 日程, 通过复用第一阶段, 在 1e17–2e19 算力上训多组不同 batch, 学习率的模型. 参数空间有冗余: 泛化误差比最优高不超过 0.25% 的, 都算近优超参. 再拟合 $B$, $η$ 对 $C$ 的关系(图 3): 算力加大, 最优 batch 渐增, 最优学习率渐减, 符合放大模型时的直觉. 近优点落在一条宽带里, 落带内不难. 最终公式:

$$
\begin{aligned}\eta_{ opt } &= 0.3118 \cdot C^{-0.1250} \\B_{ opt } &= 0.2920 \cdot C^{0.3271}\end{aligned}\tag{1}
$$

![](. /images/page_8_chart_2.jpg)

(a) Batch size scaling curve

![](. /images/page_8_chart_4.jpg)

(b) Learning rate scaling curve

Figure 3 | Scaling curves of batch size and learning rate. The grey circles represent models whose generalization error exceeded the minimum by no more than 0.25%. The dotted line represents the power law fitting the smaller model. The blue stars represent DeepSeek LLM 7B and 67B.



图 3｜batch size 与学习率的缩放曲线. 灰圈: 泛化误差相对最优不超过 0.25% 的近优模型; 虚线: 小模型幂律拟合; 蓝星: DeepSeek LLM 7B 与 67B.

We validated our formulae on a series of models with a 1e20 compute budget, and the results of a specific model size (2.94B FLOPs per token) are shown in Figure 2(b). The results indicate that the fitted parameters are centered in the optimal parameter space. Subsequent sections also show that the parameters we fitted for DeepSeek LLM 7B and 67B models similarly achieved good performance.



在 1e20 算力的一系列模型上验证公式; 图 2(b) 是某一规模(2.94B FLOPs/token). 拟合出的超参落在最优区域中心; 后文也显示按此公式给 7B, 67B 选的超参表现良好.

However, it’s important to note that we have not yet considered the impact of factors beyond the compute budget 𝐶 on the optimal hyperparameters. This is inconsistent with some earlier works (Kaplan et al., 2020; McCandlish et al., 2018) which suggested that the optimal batch size can be modeled as being solely related to the generalization error 𝐿. Furthermore, we observed that in models with the same compute budget but different model/data allocations, the optimal parameter space varies slightly. This suggests that further research is needed to understand the selection of hyperparameters and training dynamics. We will explore these aspects in future works.



要注意: 尚未考虑算力 $C$ 以外因素对最优超参的影响; 这与部分早期工作(认为最优 batch 可只由泛化误差 $L$ 建模)不一致. 同算力, 不同模型/数据分配时, 最优超参带也会略有偏移. 超参选择与训练动力学仍需后续研究.

### 3.2. Estimating Optimal Model and Data Scaling 估计最优模型与数据缩放

After deriving the formulae for fitting near-optimal hyperparameters, we started fitting the scaling curve and analyzing the optimal model/data scaling-up allocation strategy. This strategy involves finding model scaling exponent 𝑎 and data scaling exponent 𝑏 that satisfy $N _ { \mathrm { o p t } } \propto C ^ { a }$ and $D _ { \mathrm { o p t } } \propto C ^ { b } , $ , respectively. The data scale 𝐷 can be consistently represented by the number of tokens in the dataset. In previous works, the model scale was typically represented by model parameters, with non-embedding parameters $N _ { 1 }$ (Kaplan et al., 2020) and complete parameters $N _ { 2 }$ (Hoffmann et al., 2022). The relationship between compute budget 𝐶 and model/data scale could be approximately described as $C = 6 N D , $ meaning we could use $6 N _ { 1 }$ or $6 N _ { 2 }$ to approximate the model scale. However, since both $6 N _ { 1 }$ and $6 N _ { 2 }$ do not account for the computational overhead of attention operation, and $6 N _ { 2 }$ also includes the vocabulary computation, which contributes less to the model’s capacity, they both have significant approximation errors under certain settings.



有了近优超参公式后, 开始拟合缩放曲线, 分析最优模型/数据分配: 找指数 $a$, $b$, 使 $N_{\mathrm{opt}}\propto C^a$, $D_{\mathrm{opt}}\propto C^b$. 数据规模 $D$ 一律用 token 数. 既往模型规模多用参数: 非嵌入参数 $N_1$(Kaplan)或全参数 $N_2$(Hoffmann), 并近似 $C=6ND$. 但 $6N_1$, $6N_2$ 都不含注意力相对序列长度的开销; $6N_2$ 还把词表计算算进去(对容量贡献相对小), 某些设定下近似误差很大.

To mitigate these errors, we introduced a new model scale representation: non-embedding FLOPs/token 𝑀. 𝑀 includes the computational overhead of attention operation but does not take into account the vocabulary computation. With the model scale represented by $M , $ the compute budget 𝐶 can be simply expressed as $C = M D$ . The specific differences between $6 N _ { 1 , }$ $6 N _ { 2 } , $ and 𝑀 are as shown in the following formulae:



为减误差, 引入 non-embedding FLOPs/token $M$: 含注意力开销, 不含词表计算. 用 $M$ 表示后, $C=MD$. 三者差别如下:

$$
\begin{aligned} { 6 N _ { 1 } } & { { } = 7 2   n _ { \mathrm { l a y e r } }   d _ { \mathrm { m o d e l } } ^ { 2 } } \\ { 6 N _ { 2 } } & { { } = 7 2   n _ { \mathrm { l a y e r } }   d _ { \mathrm { m o d e l } } ^ { 2 } + 6   n _ { \mathrm { v o c a b } }   d _ { \mathrm { m o d e l } } } \\ { M } & { { } = 7 2   n _ { \mathrm { l a y e r } }   d _ { \mathrm { m o d e l } } ^ { 2 } + 1 2   n _ { \mathrm { l a y e r } }   d _ { \mathrm { m o d e l } }   l _ { \mathrm { s e q } } } \end{aligned}\tag{2}
$$

where $n _ { \mathrm { l a y e r } }$ represents the number of layers, $d _ { \mathrm { m o d e l } }$ represents the model width, $n _ { \mathrm { v o c a b } }$ is the vocabulary size, and $l _ { \mathrm { s e q } }$ is the sequence length. We assessed the differences between these three representations across models of varying scales, as shown in Table 3. The results indicate that both $6 N _ { 1 }$ and $6 N _ { 2 }$ either overestimate or underestimate the computational cost in models of different scales. This discrepancy is particularly pronounced in small-scale models, with differences reaching up to 50%. Such inaccuracies can introduce substantial statistical errors when fitting the scaling curve. Please refer to Appendix A. 2 for further analysis regarding different representations of model scale.



其中 $n_{\mathrm{layer}}$ 层数, $d_{\mathrm{model}}$ 宽度, $n_{\mathrm{vocab}}$ 词表大小, $l_{\mathrm{seq}}$ 序列长度. 表 3 比较三种表示: $6N_1$, $6N_2$ 在不同规模上会高估或低估算力, 小模型偏差可达约 50%, 拟合缩放曲线会引入可观统计误差. 更多分析见附录 A. 2.

| 𝑛layers | 𝑑<sub>model</sub> | 𝑛vocab | 𝑙<sub>seq</sub> | 𝑁<sub>1</sub> | 𝑁<sub>2</sub> | 𝑀 | 6𝑀𝑁1 | 6𝑀𝑁2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 8 | 512 |  |  | 25.2M | 77.6M | 352M | 0.43 | 1.32 |
| 12 | 768 |  |  | 84.9M | 164M | 963M | 0.53 | 1.02 |
| 24 | 1024 |  |  | 302M | 407M | 3.02B | 0.60 | 0.81 |
| 24 | 2048 | 102400 | 4096 | 1.21B | 1.42B | 9.66B | 0.75 | 0.88 |
| 32 | 4096 |  |  | 6.44B | 6.86B | 45.1B | 0.85 | 0.91 |
| 40 | 5120 |  |  | 12.6B | 13.1B | 85.6B | 0.88 | 0.92 |
| 80 | 8192 |  |  | 64.4B | 65.3B | 419B | 0.92 | 0.94 |

Table 3 | Difference in model scale representations and disparities of non-embedding parameters $N _ { 1 }$ and complete parameters $N _ { 2 }$ relative to non-embedding FLOPs/token 𝑀.



表 3｜模型规模三种表示的差异, 以及 $N_1$, $N_2$ 相对 $M$ 的偏离.

After adopting 𝑀 to represent the model scale, our objective could be described more clearly as: <u>Given a computing budget</u> $C = M D , $ <u>, find the optimal model scale</u> $\underline { { M _ { \mathtt { o p t } } } }$ <u>and data scale</u> $\underline { { D _ { \mathtt { o p t } } } }$ <u>t</u>hat minimize the generalization error of the model. This target could be formalized as:



用 $M$ 之后, 目标更清楚: 给定 $C=MD$, 找使泛化误差最小的最优模型规模 $M_{\mathrm{opt}}$ 与数据规模 $D_{\mathrm{opt}}$:

$$
M _ { \mathrm { o p t } } ( C ) , D _ { \mathrm { o p t } } ( C ) = \underset { M , D   \mathrm { s . t . }   C = M D } { \mathrm { a r g m i n } }   L ( N , D )\tag{3}
$$

To reduce experimental costs and fitting difficulties, the IsoFLOP profile approach from Chinchilla (Hoffmann et al., 2022) was used to fit the scaling curve. We selected 8 different compute budgets ranging from 1e17 to 3e20, and designed around 10 different model/data scale allocations for each budget. The hyperparameters for each budget were determined by Formula(1), and the generalization error was calculated on an independent validation set, distributed similarly to the training set and containing 100M tokens.



采用 Chinchilla 的 IsoFLOP 剖面拟合. 选 8 档算力(1e17–3e20), 每档约 10 种模型/数据分配; 超参由式 (1) 定; 泛化误差在独立验证集上算(分布近似训练集, 约 100M token).

![](. /images/page_10_chart_0.jpg)

(a) IsoFLOP curve

![](. /images/page_10_chart_2.jpg)

(b) Optimal model scaling

![](. /images/page_10_chart_4.jpg)

(c) Optimal data scaling

Figure 4 | IsoFLOP curve and optimal model/data allocation. The metric in IsoFLOP curve is bits-per-byte on the validation set. The dotted lines in optimal model/data scaling curves represent the power law fitting the smaller model (grey circles).



图 4｜IsoFLOP 曲线与最优模型/数据分配. IsoFLOP 指标为验证集 bits-per-byte; 虚线为对小模型(灰圈)的幂律拟合.

Figure 4 demonstrates the IsoFLOP curve and model/data scaling curves, which are fitted by using the optimal model/data allocation for each compute budget. The specific formulae for the optimal non-embedding FLOPs/token $M _ { \mathrm { o p t } }$ and optimal tokens $D _ { \mathrm { o p t } }$ are as follows:



图 4 给出 IsoFLOP 与模型/数据缩放曲线(按每档最优分配拟合). 最优 $M_{\mathrm{opt}}$, $D_{\mathrm{opt}}$:

$$
\begin{aligned}M_{\mathrm{opt}} &= M_{\mathrm{base}} \cdot \boldsymbol{C}^{a}, \quad M_{\mathrm{base}} = 0.1715, \quad a = 0.5243, \\D_{\mathrm{opt}} &= D_{\mathrm{base}} \cdot \boldsymbol{C}^{b}, \quad D_{\mathrm{base}} = 5.8316, \quad b = 0.4757. \end{aligned}\tag{4}
$$

Additionally, we fitted the loss scaling curve according to compute budget 𝐶 and optimal generalization error, and predicted the generalization error for DeepSeek LLM 7B and 67B, as shown in Figure 5. The results indicate that using small-scale experiments can accurately predict the performance of models with 1000× compute budget. This provides both confidence and guidance for training models on a larger scale.



还按算力 $C$ 与最优泛化误差拟合 loss 缩放曲线, 并预报 7B, 67B(图 5). 小规模实验能较准预报约 1000× 算力的模型表现, 给更大规模训练提供信心与指引.

![](. /images/page_10_chart_11.jpg)

Figure 5 | Performance scaling curve. The metric is the bits-per-byte on the validation set. The dotted line represents the power law fitting the smaller model (grey circles). The blue stars represent DeepSeek LLM 7B and 67B. Their performance is well-predicted by the scaling curve.



图 5｜性能缩放曲线. 指标为验证集 bits-per-byte; 虚线为小模型幂律拟合; 蓝星为 7B, 67B, 落点与曲线预报吻合.

### 3.3. Scaling Laws with Different Data 不同数据下的 Scaling Laws

In the development process of DeepSeek LLM, the dataset was iteratively refined multiple times, with adjustments in the proportions of different data sources while enhancing the overall quality. This allowed us to further analyze the impact of different datasets on scaling laws.



开发中语料多轮迭代: 调各来源比例, 抬整体质量, 因此能继续分析「不同数据集如何改 Scaling Laws」.

We studied the scaling laws using three different datasets: early in-house data, current inhouse data, and OpenWebText2, which was utilized in the previous study of scaling laws (Kaplan et al., 2020). Our internal data assessment revealed that current in-house data has higher data quality than early in-house data. Furthermore, the quality of OpenWebText2 even surpasses the current in-house data, due to its smaller scale which allows for more meticulous processing.



三套数据: 早期内部, 当前内部, 以及 Kaplan 用过的 OpenWebText2. 内部评估: 当前内部优于早期; OpenWebText2 因规模更小, 加工更细, 质量甚至高于当前内部.

|  | Coeff. 𝑎 where | Coeff. 𝑏 where |
| --- | --- | --- |
| Approach | 𝑁<sub>opt</sub>(𝑀<sub>opt</sub>) ∝ 𝐶<sup>𝑎</sup> | 𝐷<sub>opt</sub> ∝ 𝐶<sup>𝑏</sup> |
| OpenAI (OpenWebText2) | 0.73 | 0.27 |
| Chinchilla (MassiveText) | 0.49 | 0.51 |
| Ours (Early Data) | 0.450 | 0.550 |
| Ours (Current Data) | 0.524 | 0.476 |
| Ours (OpenWebText2) | 0.578 | 0.422 |

Table 4 | Coefficients of model scaling and data scaling vary with training data distribution.



表 4｜模型缩放系数 $a$ 与数据缩放系数 $b$ 随训练数据分布变化.

An interesting observation from the analysis is that the optimal model/data scaling-up allocation strategy across these three datasets showed consistency with data quality. As illustrated in Table 4, as data quality improves, the model scaling exponent 𝑎 gradually increases, while the data scaling exponent 𝑏 decreases, which suggests that the increased compute budget should be allocated more to the model instead of the data. This finding might also explain the significant differences in optimal model/data scaling-up allocation observed in earlier studies of scaling laws.



有趣现象: 三套数据上的最优分配与质量排序一致. 表 4: 质量升, $a$ 升, $b$ 降, 新增算力更该分给模型而非数据. 这也可能解释早期文献里最优分配差那么大.

An intuitive speculation for this finding is that high-quality data usually implies logical clarity and less predictive difficulty after sufficient training. Therefore, it’s more advantageous to scale up the model size when increasing compute budget. We will continue to pay close attention to the changes in data quality and its impact on scaling laws, and provide more analysis in future works.



直观猜测: 高质量数据逻辑更清楚, 训足后预测难度更低, 加算力时更划算去放大模型. 数据质量与 Scaling Laws 的关系会继续跟踪.

## 4. Alignment 对齐

We collect around 1.5 million instruction data instances in English and Chinese, covering a wide range of helpfulness and harmlessness topics. Our helpful data contains 1.2 million instances, with a distribution of 31.2% for general language tasks, 46.6% for mathematical problems, and 22.2% for coding exercises. The safety data consists of 300K instances, covering various sensitive topics.



收集约 150 万条中英指令数据, 覆盖有用性与无害性. 有用数据 120 万: 通用语言 31.2%, 数学 46.6%, 代码 22.2%; 安全数据 30 万, 覆盖多种敏感主题.

Our alignment pipeline contains two stages.



对齐流水线分两段.

**Supervised Fine-Tuning:** We fine-tuned our 7B model with 4 epochs, but only 2 epochs for the 67B model, since we observed the overfitting problem is serious on the 67B model. We observed that GSM8K (Cobbe et al., 2021) and HumanEval (Chen et al., 2021) are improved consistently for the 7B model, while the 67B model hits the upper bound soon. The learning rate is 1e-5 and 5e-6 for 7B and 67B models, respectively. In addition to monitoring the benchmark accuracy, we also assess the repetition ratio of a chat model during the fine-tuning process. We gathered a total of 3868 Chinese and English prompts and determined the proportion of generated responses that fail to terminate and instead endlessly repeat a sequence of text. We observed that the repetition ratio tends to rise as the quantity of math SFT data increases. This can be attributed to the fact that math SFT data occasionally includes similar patterns in reasoning. Consequently, weaker models struggle to grasp such reasoning patterns, resulting in repetitive responses. To tackle the problem, we tried two-stage fine-tuning and DPO (Rafailov et al., 2023), both of which could almost keep the benchmark score and reduce the repetition significantly.



**监督微调(SFT):** 7B 训 4 个 epoch, 67B 只训 2 个--67B 过拟合更严重. 7B 上 GSM8K, HumanEval 持续涨; 67B 很快触顶. 学习率分别为 1e-5, 5e-6. 除基准准确率外, 还盯 chat 的**重复率**: 用 3868 条中英 prompt, 统计「生成停不下来, 一段文字循环复读」的比例. 数学 SFT 越多, 重复率越容易升-- 数学数据常有相似推理模板, 弱模型学不会就复读. 对策试过两阶段微调与 DPO, 都能基本保住基准分并明显压重复.

**DPO:** To further enhance the model’s ability, we used the direct preference optimization algorithm (Rafailov et al., 2023), which is proven to be a simple but effective method for LLM alignment. We constructed the preference data for DPO training in terms of helpfulness and harmlessness. For helpfulness data, we collected multilingual prompts, which cover categories including creative writing, question answering, instruction following, and so on. Then we generated responses using our DeepSeek Chat models as response candidates. Similar operations are applied to harmlessness preference data construction.



**DPO:** 用直接偏好优化继续抬能力. 按有用性与无害性构造偏好对; 有用侧收集多语 prompt(创意写作, 问答, 跟指令等), 再用自家 Chat 生成候选回答; 无害侧同理.

We trained an epoch for DPO, with a learning rate of 5e-6 and batch size of 512, and we used a learning rate warmup and cosine learning rate scheduler. We found out that DPO can strengthen the model’s open-ended generation skill, while engendering little difference in performance among standard benchmarks.



DPO 训 1 个 epoch, 学习率 5e-6, batch 512, warmup + 余弦日程. 发现: 开放式生成明显变强, 标准基准分数几乎不动.

## 5. Evaluation 评测

### 5.1. Public Benchmark Evaluation 公开基准评测

We evaluate our models on a series of public benchmarks both in English and Chinese, based on the internal evaluation framework.



用内部评测框架, 在中英公开基准上评.

**Multi-subject multiple-choice** datasets including MMLU (Hendrycks et al., 2020), C-Eval (Huang et al., 2023) and CMMLU (Li et al., 2023).

**Language understanding and reasoning** datasets including HellaSwag (Zellers et al., 2019), PIQA (Bisk et al., 2020), ARC (Clark et al., 2018), OpenBookQA (Mihaylov et al., 2018) and BigBench Hard (BBH) (Suzgun et al., 2022).

**Closed-book question answering** datasets including TriviaQA (Joshi et al., 2017) and NaturalQuestions (Kwiatkowski et al., 2019).

**Reading comprehension** datasets including RACE Lai et al. (2017) and DROP (Dua et al., 2019), C3 (Sun et al., 2019).

**Reference disambiguation** datasets including WinoGrande Sakaguchi et al. (2019) and CLUEWSC (Xu et al., 2020).

**Language modeling** datasets including Pile (Gao et al., 2020).

**Chinese understanding and culture** datasets including CHID (Zheng et al., 2019) and CCPM (Li et al., 2021).

**Math** datasets including GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021) and CMath (Wei et al., 2023).

**Code** datasets including HumanEval (Chen et al., 2021) and MBPP (Austin et al., 2021).

**Standardized exams** including AGIEval (Zhong et al., 2023).



**多学科选择题**: MMLU, C-Eval, CMMLU.

**语言理解与推理**: HellaSwag, PIQA, ARC, OpenBookQA, BBH.

**闭卷问答**: TriviaQA, NaturalQuestions.

**阅读理解**: RACE, DROP, C3.

**指代消歧**: WinoGrande, CLUEWSC.

**语言建模**: Pile.

**中文理解与文化**: CHID, CCPM.

**数学**: GSM8K, MATH, CMath.

**代码**: HumanEval, MBPP.

**标准化考试**: AGIEval.

We apply perplexity-based evaluation to datasets that require answers to be chosen from several options. These datasets include HellaSwag, PIQA, WinoGrande, RACE-Middle, RACE High, MMLU, ARC-Easy, ARC-Challenge, OpenBookQA, CHID, C-Eval, CMMLU, C3 and CCPM. The perplexity-based evaluation here refers to calculating the perplexity of each option and selecting the lowest one as the model prediction. For ARC and OpenBookQA, we calculate the perplexity with unconditional normalization (Brown et al., 2020), and for other datasets we use length normalization.



选项题用困惑度评测: 算每个选项的困惑度, 取最低者. 含 HellaSwag, PIQA, WinoGrande, RACE-Middle/High, MMLU, ARC-Easy/Challenge, OpenBookQA, CHID, C-Eval, CMMLU, C3, CCPM. ARC 与 OpenBookQA 用无条件归一化(Brown et al., 2020), 其余用长度归一化.

We apply generation-based evaluation for TriviaQA, NaturalQuestions, DROP, MATH, GSM8K, HumanEval, MBPP, BBH, AGIEval, CLUEWSC, and CMath. The generation-based evaluation here refers to letting the model generate free texts and parsing results from generated texts. For generation-based evaluation, we use greedy decoding.



生成式评测用于 TriviaQA, NaturalQuestions, DROP, MATH, GSM8K, HumanEval, MBPP, BBH, AGIEval, CLUEWSC, CMath: 自由生成再解析; 解码用 greedy.

We apply language-modeling-based evaluation for Pile-test, which means calculating the bits-per-byte on the test corpus.



Pile-test 用语模评测: 算测试语料的 bits-per-byte.

We use 2048 or 4096 as the maximum sequence length for different benchmarks. Details of evaluation formats can be found in Appendix A. 6.



不同基准最大序列长用 2048 或 4096; 格式细节见附录 A. 6.

#### 5.1.1. Base Model Base 模型

Table 5 presents the main results on the evaluation benchmark. Despite DeepSeek models are pre-trained on 2T bilingual corpus, they show comparable performance on English language understanding benchmarks with LLaMA2 models, which also consume 2T tokens but focus on English. Furthermore, DeepSeek 67B achieves considerably better performance on MATH, GSM8K, HumanEval, MBPP, BBH, and Chinese benchmarks compared to LLaMA2 70B. We show the benchmark curve in the Appendix A. 3. We can see some task performance is boosted as model scaling, such as GSM8K and BBH. Given that we train both 7B and 67B on the same dataset, the emergence of this improvement can be attributed to the powerful few-shot learning ability of large models. However, as the proportion of mathematical data increases, the disparity between small and large models may diminish.



表 5 是主结果. DeepSeek 在 2T 中英双语上预训练, 英语理解基准仍能跟同吃 2T, 但偏英语的 LLaMA2 打平; 67B 在 MATH, GSM8K, HumanEval, MBPP, BBH 与中文基准上明显强于 LLaMA2 70B. 基准曲线见附录 A. 3. GSM8K, BBH 等随模型放大明显抬升--7B 与 67B 同数据, 这类跃迁更像大模型 few-shot 能力在起作用. 若数学数据占比再抬, 大小模型差距也可能收窄.

An interesting observation is that the advantage of DeepSeek 67B over LLaMA2 70B is larger than that of DeepSeek 7B over LLaMA2 7B. This phenomenon highlights the greater influence of language conflict on smaller models. Additionally, LLaMA2 demonstrates impressive performance on certain Chinese tasks, such as CMath, despite not being specifically trained on Chinese data. This suggests that certain fundamental abilities, such as mathematical reasoning, can be effectively transferred across languages. However, tasks like CHID, which involve evaluating the usage of Chinese idioms, require the model to consume a significant number of Chinese tokens during pre-training. In this case, LLaMA2 significantly underperforms compared to DeepSeek LLM.



有趣观察: DeepSeek 67B 相对 LLaMA2 70B 的优势, 大于 7B 对 7B 的优势-- 语言冲突对小模型冲击更大. LLaMA2 没专门吃中文, 在 CMath 等题上仍不错, 说明数学推理一类基础能力可跨语言迁移; 但 CHID 这类成语用法, 需要预训练吞大量中文 token, LLaMA2 就明显落后.

#### 5.1.2. Chat Model Chat 模型

Table 6 demonstrates the results of the DeepSeek Chat models, showcasing overall improvements in most tasks following tuning. However, there were a few instances where the performance of



表 6 给出 Chat 结果: 多数任务微调后上涨, 也有少数任务

<table><tr><td>Language</td><td>Benchmark</td><td>Test-shots</td><td>LLaMA2 7B</td><td>DeepSeek 7B</td><td>LLaMA2 70B</td><td>DeepSeek 67B</td></tr><tr><td rowspan="18">English</td><td>HellaSwag PIQA</td><td>0-shot 0-shot</td><td>75.6 78.0</td><td>75.4 79.2</td><td>84.0 82.0</td><td>84.0 83.6</td></tr><tr><td>WinoGrande RACE-Middle RACE-High</td><td>0-shot 5-shot</td><td>69.6 60.7</td><td>70.5 63.2</td><td>80.4 70.1</td><td>79.8 69.9</td></tr><tr><td></td><td>5-shot</td><td>45.8</td><td>46.5</td><td>54.3</td><td>50.7</td></tr><tr><td>TriviaQA</td><td>5-shot</td><td>63.8</td><td>59.7</td><td>79.5</td><td>78.9</td></tr><tr><td>NaturalQuestions</td><td>5-shot</td><td>25.5</td><td>22.2</td><td>36.1</td><td>36.6</td></tr><tr><td>MMLU</td><td>5-shot</td><td>45.8</td><td>48.2</td><td>69.0</td><td>71.3</td></tr><tr><td>ARC-Easy ARC-Challenge</td><td>0-shot</td><td>69.1</td><td>67.9</td><td>76.5</td><td>76.9</td></tr><tr><td>OpenBookQA</td><td>0-shot 0-shot</td><td>49.0</td><td>48.1</td><td>59.5</td><td>59.0</td></tr><tr><td>DROP</td><td>1-shot</td><td>57.4</td><td>55.8</td><td>60.4</td><td>60.2</td></tr><tr><td>MATH</td><td>4-shot</td><td>39.8 2.5</td><td>41.0 6.0</td><td>69.2</td><td>67.9</td></tr><tr><td>GSM8K</td><td>8-shot</td><td>15.5</td><td>17.4</td><td>13.5 58.4</td><td>18.7</td></tr><tr><td>HumanEval MBPP</td><td>0-shot</td><td>14.6</td><td>26.2</td><td>28.7</td><td>63.4 42.7</td></tr><tr><td>BBH</td><td>3-shot</td><td>21.8</td><td>39.0</td><td>45.6</td><td>57.4</td></tr><tr><td></td><td>3-shot</td><td>38.5</td><td>39.5</td><td>62.9</td><td>68.7</td></tr><tr><td>AGIEval</td><td>0-shot</td><td>22.8</td><td>26.4</td><td>37.2</td><td>41.3</td></tr><tr><td>Pile-test</td><td></td><td>0.741</td><td>0.725</td><td>0.649</td><td></td></tr><tr><td rowspan="7">Chinese</td><td></td><td></td><td></td><td></td><td></td><td>0.642</td></tr><tr><td>CLUEWSC</td><td>5-shot</td><td>64.0</td><td>73.1</td><td>76.5</td><td>81.0</td></tr><tr><td>CHID</td><td>0-shot</td><td>37.9</td><td>89.3</td><td>55.5</td><td>92.1</td></tr><tr><td>C-Eval</td><td>5-shot</td><td>33.9</td><td>45.0</td><td>51.4</td><td>66.1</td></tr><tr><td>CMMLU</td><td>5-shot</td><td>32.6</td><td>47.2</td><td>53.1</td><td>70.8</td></tr><tr><td>CMath</td><td>3-shot</td><td>25.1</td><td>34.5</td><td>53.9</td><td>63.0</td></tr><tr><td>C3</td><td>0-shot</td><td>47.4</td><td>65.4</td><td>61.7</td><td>75.3</td></tr><tr><td>CCPM</td><td>0-shot</td><td>60.7</td><td>76.9</td><td>66.2</td><td>88.5</td></tr></table>

Table 5 | Main results. The evaluation results we report are based on the internal evaluation framework. Bold numbers indicate the best results among the 4 models. For Pile-test we report bits-per-byte (BPB), for DROP we report F1 score and for other tasks we report accuracy. Note that the test-shots is the maximum value and fewer shots might be applied because of limited context length or limited few-shot examples available in the same passage for reading comprehension tasks such as RACE.



表 5｜主结果(内部评测框架). 加粗为四模型最优. Pile-test 报 BPB, DROP 报 F1, 其余报准确率. test-shots 为上限; 上下文或同篇 few-shot 样本不够时(如 RACE)可能更少.

certain tasks declined.



在个别任务上出现下降.

**Knowledge**: We have observed fluctuations of base and chat models in knowledge-related tasks, such as TriviaQA, MMLU, and C-Eval. However, we do not believe that such minor fluctuations indicate the acquisition or loss of knowledge after SFT. The value of SFT lies in the ability to learn to achieve comparable scores to the base model’s few-shot setting in the chat model’s zero-shot setting, which is aligned with real scenarios. For example, 0-shot MMLU performance of a chat model is comparable with 5-shot MMLU performance of a base model.



**知识:** Base/Chat 在 TriviaQA, MMLU, C-Eval 等知识题上会有小幅波动, 但作者不认为这代表 SFT「学到或丢掉」了知识. SFT 的价值在于: Chat 的 zero-shot 能摸到 Base 的 few-shot 水平, 更贴近真实用法. 例如 Chat 的 0-shot MMLU ≈ Base 的 5-shot MMLU.

**Reasoning**: As a significant proportion of the SFT instances are in the CoT format Wei et al. (2022), the chat models demonstrate slight improvements in reasoning tasks, such as BBH and NaturalQuestions. However, we believe that the SFT stage does not learn reasoning capabilities but rather the correct format for reasoning paths.



**推理:** SFT 包含大量 CoT 格式数据, Chat 在 BBH、NaturalQuestions 等任务上略有提升. 报告将其归因于模型学会了推理路径的书写形式, 没有据此声称 SFT 产生了新的推理能力.

| Language Benchmark | DeepSeek 7B Base | DeepSeek 7B Chat | DeepSeek 67B Base | DeepSeek 67B Chat |
| --- | --- | --- | --- | --- |
| HellaSwag | 75.4 | 68.5 | 84.0 | 75.7 |
| PIQA | 79.2 | 77.6 | 83.6 | 82.6 |
| WinoGrande | 70.5 | 66.9 | 79.8 | 76.0 |
| RACE-Middle | 63.2 | 65.2 | 69.9 | 70.9 |
| RACE-High | 46.5 | 50.8 | 50.7 | 56.0 |
| TriviaQA | 59.7 | 57.9 | 78.9 | 81.5 |
| NaturalQuestions | 22.2 | 32.5 | 36.6 | 47.0 |
| MMLU | 48.2 | 49.4 | 71.3 | 71.1 |
| ARC-Easy | 67.9 | 71.0 | 76.9 | 81.6 |
| English |  |  |  |  |
| ARC-Challenge | 48.1 | 49.4 | 59.0 | 64.1 |
| GSM8K | 17.4 | 63.0 | 63.4 | 84.1 |
| MATH | 6.0 | 15.8 | 18.7 | 32.6 |
| HumanEval | 26.2 | 48.2 | 42.7 | 73.8 |
| MBPP | 39.0 | 35.2 | 57.4 | 61.4 |
| DROP | 41.0 | 49.1 | 67.9 | 71.9 |
| OpenBookQA | 55.8 | 54.8 | 60.2 | 63.2 |
| BBH | 39.5 | 42.3 | 68.7 | 71.7 |
| AGIEval | 26.4 | 19.3 | 41.3 | 46.4 |
| CLUEWSC | 73.1 | 71.9 | 81.0 | 60.0 |
| CHID | 89.3 | 64.9 | 92.1 | 72.6 |
| C-Eval | 45.0 | 47.0 | 66.1 | 65.2 |
| Chinese CMMLU | 47.2 | 49.7 | 70.8 | 67.8 |
| CMath | 34.5 | 68.4 | 63.0 | 80.3 |
| C3 | 65.4 | 66.4 | 75.3 | 77.0 |
| CCPM | 76.9 | 76.5 | 88.5 | 84.9 |

Table 6 | The comparison between base and chat models. We evaluate chat models with 0-shot for MMLU, GSM8K, MATH, C-Eval, and CMMLU, while base model results are still obtained in the few-shot setting.



表 6｜Base 与 Chat 对照. Chat 在 MMLU, GSM8K, MATH, C-Eval, CMMLU 上用 0-shot; Base 仍为 few-shot.

**Performance Drop Tasks**: The performance of a few tasks consistently declines after finetuning, regardless of the model size or pre-trained checkpoint selected. These particular tasks typically involve cloze tasks or sentence completion tasks, such as HellaSwag. It is reasonable to assume that pure language models are better equipped to handle such tasks.



**持续掉分的任务:** 不论体量或 checkpoint, 微调后少数任务稳定下滑, 多为完形填空或续句(如 HellaSwag). 纯语言模型更擅长这类题, 说得通.

**Math and Code**: Our model exhibits significant improvements in math and coding tasks after fine-tuning. For instance, HumanEval and GSM8K scores are improved by over 20 points. Our explanation for this is that the base model was initially underfitted for these tasks, and the SFT stage has learned additional knowledge in coding and mathematics through the extensive SFT data. However, it is important to note that the model’s capabilities may be primarily focused on code completion and algebraic questions. To develop a comprehensive understanding of mathematics and coding, it is crucial to incorporate a diverse range of data during the pre-training stage, which is left as future work. We conducted a detailed analysis of code and math tasks in Appendix A. 4.



**数学与代码:** 微调后涨幅大, HumanEval, GSM8K 可涨二十多分. 解释: Base 在这些任务上原本欠拟合, SFT 用大量相关数据补了知识. 但能力可能仍偏代码补全与代数题; 要全面理解数学与编程, 还需在预训练阶段塞更多样数据, 留作后续. 代码/数学细分析见附录 A. 4.

In the 7B model fine-tuning, we initially fine-tune the model using all data. Subsequently, a second stage is introduced, which excludes math and code data. The motivation behind this approach is that the stage-1 model exhibits a repetition ratio of 2.0%, which is reduced to 1.4% after stage-2 tuning, while maintaining the benchmark score. In the case of the 67B model, the repetition ratio is already below 1% following the first stage fine-tuning, and the second stage hurts the model score on the benchmark. Therefore, only one stage of SFT is done for the 67B model.



7B 微调: 先全数据训(stage-1), 再去掉数学与代码做第二阶段. 动机是 stage-1 重复率 2.0%, stage-2 降到 1.4% 且基准分基本保住. 67B 第一阶段重复率已低于 1%, 第二阶段反而伤基准, 故 67B 只做一阶段 SFT.

<table><tbody><tr><td rowspan=「2」>Model模型</td><td rowspan=「2」>Overall总分</td><td colspan=「4」>Reasoning中文推理</td><td colspan=「6」>Language中文语言</td></tr><tr><td>Avg. 推理总分</td><td>Math. 数学计算</td><td>Logi. 逻辑推理</td><td>Avg. 语言总分</td><td>Fund. 基本任务</td><td>Chi. 中文理解</td><td>Open. 综合问答</td><td>Writ. 文本写作</td><td>Role. 角色扮演</td><td>Pro. 专业能力</td></tr><tr><td>gpt-4-1106-preview</td><td>8.01</td><td>7.73</td><td>7.80</td><td>7.66</td><td>8.29</td><td>7.99</td><td>7.33</td><td>8.61</td><td>8.67</td><td>8.47</td><td>8.65</td></tr><tr><td>gpt-4-0613</td><td>7.53</td><td>7.47</td><td>7.56</td><td>7.37</td><td>7.59</td><td>7.81</td><td>6.93</td><td>7.42</td><td>7.93</td><td>7.51</td><td>7.94</td></tr><tr><td>DeepSeek-67B-Chat-DPO*</td><td>6.69</td><td>5.77</td><td>6.13</td><td>5.41</td><td>7.60</td><td>7.29</td><td>7.47</td><td>7.82</td><td>7.51</td><td>7.83</td><td>7.71</td></tr><tr><td>DeepSeek-67B-Chat*</td><td>6.43</td><td>5.75</td><td>5.71</td><td>5.79</td><td>7.11</td><td>7.12</td><td>6.52</td><td>7.58</td><td>7.20</td><td>6.91</td><td>7.37</td></tr><tr><td>chatglm-turbo(智谱清言)</td><td>6.24</td><td>5.00</td><td>4.74</td><td>5.26</td><td>7.49</td><td>6.82</td><td>7.17</td><td>8.16</td><td>7.77</td><td>7.76</td><td>7.24</td></tr><tr><td>erniebot-3.5(文心一言)</td><td>6.14</td><td>5.15</td><td>5.03</td><td>5.27</td><td>7.13</td><td>6.62</td><td>7.60</td><td>7.26</td><td>7.56</td><td>6.83</td><td>6.90</td></tr><tr><td>gpt-3.5-turbo-0613</td><td>6.08</td><td>5.35</td><td>5.68</td><td>5.02</td><td>6.82</td><td>6.71</td><td>5.81</td><td>7.29</td><td>7.03</td><td>7.28</td><td>6.77</td></tr><tr><td>chatglm-pro(智谱清言)</td><td>5.83</td><td>4.65</td><td>4.54</td><td>4.75</td><td>7.01</td><td>6.51</td><td>6.76</td><td>7.47</td><td>7.07</td><td>7.34</td><td>6.89</td></tr><tr><td>spark_desk_v2(讯飞星火)</td><td>5.74</td><td>4.73</td><td>4.71</td><td>4.74</td><td>6.76</td><td>5.84</td><td>6.97</td><td>7.29</td><td>7.18</td><td>6.92</td><td>6.34</td></tr><tr><td>Qwen-14B-Chat</td><td>5.72</td><td>4.81</td><td>4.91</td><td>4.71</td><td>6.63</td><td>6.90</td><td>6.36</td><td>6.74</td><td>6.64</td><td>6.59</td><td>6.56</td></tr><tr><td>Baichuan2-13B-Chat</td><td>5.25</td><td>3.92</td><td>3.76</td><td>4.07</td><td>6.59</td><td>6.22</td><td>6.05</td><td>7.11</td><td>6.97</td><td>6.75</td><td>6.43</td></tr><tr><td>ChatGLM3-6B</td><td>4.97</td><td>3.85</td><td>3.55</td><td>4.14</td><td>6.10</td><td>5.75</td><td>5.29</td><td>6.71</td><td>6.83</td><td>6.28</td><td>5.73</td></tr><tr><td>Baichuan2-7B-Chat</td><td>4.97</td><td>3.66</td><td>3.56</td><td>3.75</td><td>6.28</td><td>5.81</td><td>5.50</td><td>7.13</td><td>6.84</td><td>6.53</td><td>5.84</td></tr><tr><td>InternLM-20B</td><td>4.96</td><td>3.66</td><td>3.39</td><td>3.92</td><td>6.26</td><td>5.96</td><td>5.50</td><td>7.18</td><td>6.19</td><td>6.49</td><td>6.22</td></tr><tr><td>Qwen-7B-Chat</td><td>4.91</td><td>3.73</td><td>3.62</td><td>3.83</td><td>6.09</td><td>6.40</td><td>5.74</td><td>6.26</td><td>6.31</td><td>6.19</td><td>5.66</td></tr><tr><td>ChatGLM2-6B</td><td>4.48</td><td>3.39</td><td>3.16</td><td>3.61</td><td>5.58</td><td>4.91</td><td>4.52</td><td>6.66</td><td>6.25</td><td>6.08</td><td>5.08</td></tr><tr><td>InternLM-Chat-7B</td><td>3.65</td><td>2.56</td><td>2.45</td><td>2.66</td><td>4.75</td><td>4.34</td><td>4.09</td><td>5.82</td><td>4.89</td><td>5.32</td><td>4.06</td></tr><tr><td>Chinese-LLaMA-2-7B-Chat</td><td>3.57</td><td>2.68</td><td>2.29</td><td>3.07</td><td>4.46</td><td>4.31</td><td>4.26</td><td>4.50</td><td>4.63</td><td>4.91</td><td>4.13</td></tr><tr><td>LLaMA-2-13B-Chinese-Chat</td><td>3.35</td><td>2.47</td><td>2.21</td><td>2.73</td><td>4.23</td><td>4.13</td><td>3.31</td><td>4.79</td><td>3.93</td><td>4.53</td><td>4.71</td></tr></tbody></table>

Table 7 | AlignBench leaderboard rated by gpt-4-0613. Models are ranked in descending order of total score. Results with \* are our evaluation results based on the official AlignBench repository, whereas all other results are derived from the AlignBench paper. We found that our Deepseek-67B-Chat model surpasses ChatGPT and other baseline models by a clear margin, which indicates the superior performance of our model in both basic Chinese language tasks and advanced Chinese reasoning tasks. Besides, we can find that the DPO process has brought improvements in almost all fields.



表 7｜AlignBench 榜(gpt-4-0613 打分), 按总分降序. 标 \* 为作者用官方仓库复测, 其余引自 AlignBench 原文. DeepSeek-67B-Chat 明显超过 ChatGPT 等基线; DPO 几乎各域都有提升.

### 5.2. Open-Ended Evaluation 开放式评测

For chat models, in addition to observing metrics on standard benchmarks, the quality of results generated in open domains and open-ended questions directly affects the actual user experience. Hence, we separately tested the open-ended generation capabilities of our chat model in both Chinese and English tasks.



对 Chat 而言, 标准基准之外, 开放域与开放题的生成质量直接关系到用户体验. 因此分别测中英开放式生成.

#### 5.2.1. Chinese Open-Ended Evaluation 中文开放式评测

For Chinese open-ended evaluation, we tested the comprehensive of our chat model in different domains on a high-quality open-ended question testset AlignBench (Liu et al., 2023). AlignBench includes a total of 8 primary categories, 36 secondary categories, and encompasses 683 questions. For each question, in addition to the prompt, AlignBench also provides professional reference answers and rating templates for GPT-4 to judge the quality of the response.



中文侧用高质量开放题集 AlignBench: 8 个一级类, 36 个二级类, 683 题; 除 prompt 外还提供专业参考答案与给 GPT-4 打分的模板.

We utilized the official AlignBench Github code repository to implement the evaluation of our model. We strictly aligned the key temperature parameter with the original setting: for role-playing, writing ability, and open-ended questions, the generation temperature was set to 0.7; whereas for other tasks, the generation temperature was set to 0.1.



评测走官方 AlignBench 仓库; 温度严格对齐原文: 角色扮演, 写作, 开放题用 0.7, 其余用 0.1.

The AlignBench leaderboard is shown in Table 7. We can find that our DeepSeek 67B Chat model surpasses ChatGPT and other baseline models, and is only after the two versions of GPT-4. This demonstrates the excellent performance of our model across various Chinese tasks, compared to other open-source or proprietary Chinese Large Language Models. The DPO model has shown improvement across almost all metrics, which demonstrates the positive impact of the DPO training process on model alignment.



表 7: DeepSeek 67B Chat 超过 ChatGPT 等基线, 仅次于两个 GPT-4 版本; 相对其他开源/闭源中文大模型表现突出. DPO 版几乎各项都涨, 对齐收益明显.

For the basic Chinese Language tasks, our model is in the first tier among all models, and the Chinese fundamental language ability of our DPO model is even higher than the newest version of GPT-4. For the advanced Chinese Reasoning tasks, our model’s scores are significantly higher than those of other Chinese LLMs with a clear margin, demonstrating the superior performance of our model in more complex Chinese logical reasoning and mathematical calculations.



基础中文语言任务进入第一梯队; DPO 版中文基本语言能力甚至高于最新 GPT-4. 高阶中文推理上相对其他中文 LLM 分差明显, 复杂逻辑与数学计算更强.

#### 5.2.2. English Open-Ended Evaluation 英文开放式评测

For English open-ended evaluation, we use the MT-Bench benchmark (Zheng et al., 2023), which contains 8 different categories of multi-turn questions. As illustrated in Table 8, our DeepSeek LLM 67B Chat outperforms other open-source models such as LLaMA-2-Chat Touvron et al. (2023b) 70B, Xwin 70b v0.1, and TÜLU 2+DPO 70B (Ivison et al., 2023), and achieves 8.35 score comparable with GPT-3.5-turbo. Besides, after the DPO stage, our DeepSeek LLM 67B Chat DPO further improves the average score to 8.76, which is only behind GPT-4 (OpenAI, 2023). These results illustrate the strong multi-turn open-ended generation ability of DeepSeek LLM.



英文侧用 MT-Bench(8 类多轮题). 表 8: 67B Chat 超过 LLaMA-2-Chat 70B, Xwin 70b v0.1, TÜLU 2+DPO 70B 等开源, 均分 8.35, 与 GPT-3.5-turbo 相当; DPO 后再到 8.76, 仅次于 GPT-4. 多轮开放生成能力强.

| Model | STEM | Humanities | Reasoning | Coding | Math | Extraction | Roleplay | Writing | Average |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4-1106-preview<sup>∗</sup> | 9.90 | 9.95 | 8.10 | 9.05 | 7.95 | 9.90 | 9.50 | 9.70 | 9.26 |
| GPT-3.5-turbo-0613<sup>∗</sup> | 9.55 | 9.95 | 6.20 | 7.05 | 7.05 | 9.00 | 8.65 | 9.65 | 8.39 |
| LLAMA-2-Chat 7B∗ | 8.65 | 8.75 | 4.25 | 3.00 | 2.40 | 6.50 | 7.70 | 8.90 | 6.27 |
| LLAMA-2-Chat 13B∗ | 8.63 | 9.75 | 5.10 | 3.00 | 3.45 | 6.93 | 7.50 | 8.85 | 6.65 |
| LLAMA-2-Chat 70B∗ | 8.93 | 9.63 | 5.80 | 3.15 | 3.30 | 7.25 | 7.50 | 9.30 | 6.86 |
| Zephyr-Beta 7B∗ | 9.03 | 9.63 | 5.60 | 5.10 | 4.45 | 7.45 | 8.20 | 9.35 | 7.35 |
| Xwin 70b v0.1∗ | 9.68 | 9.95 | 6.55 | 4.25 | 3.30 | 8.75 | 8.25 | 9.55 | 7.53 |
| Xwin 13b v0.2∗ | 9.55 | 9.88 | 5.20 | 3.60 | 2.85 | 7.70 | 8.60 | 8.68 | 7.01 |
| TÜLU 2+DPO 70B∗ | 9.00 | 9.90 | 7.00 | 4.70 | 4.65 | 9.35 | 9.25 | 9.25 | 7.89 |
| DeepSeek LLM 67B Chat | 9.60 | 9.70 | 8.00 | 7.35 | 6.25 | 8.40 | 8.20 | 9.30 | 8.35 |
| DeepSeek LLM 67B Chat DPO | 9.70 | 9.80 | 9.05 | 6.75 | 6.65 | 9.30 | 9.10 | 9.75 | 8.76 |

Table 8 | MT-Bench Evaluation. Results with ∗ are reported in Ivison et al. (2023)



表 8｜MT-Bench 评测. 标 ∗ 引自 Ivison et al. (2023).

### 5.3. Held-Out Evaluation 留出集评测

Data contamination and benchmark overfitting are two challenges in evaluating LLMs. One common practice is to utilize testsets published recently to evaluate the model as held-out testsets.



数据污染与刷基准是评测两大难题. 常见做法是用新近发布的测试集当留出集.

**LeetCode:** To assess the coding proficiency of the model, we have utilized problems from the LeetCode Weekly Contest (Weekly Contest 351-372, Bi-Weekly Contest 108-117, from July 2023 to Nov 2023). We have obtained these problems by crawling data from LeetCode, which consists of 126 problems with over 20 test cases for each. The evaluation metric employed is akin to that of HumanEval. In this regard, if a model’s outputs successfully pass all test cases, the model is considered to have effectively solved the problem. The model’s coding capabilities are depicted in the Figure below, where the y-axis represents the pass@1 score on in-domain human evaluation testing, and the x-axis represents the pass@1 score on out-domain LeetCode Weekly Contest problems. The LeetCode test data will be released accompanied with the DeepSeek Coder technique report soon.



**LeetCode:** 用周赛题(Weekly 351–372, Biweekly 108–117, 2023 年 7–11 月)测代码. 爬取 126 题, 每题超 20 个测试用例; 指标类似 HumanEval: 全过才算解出. 文中图横轴为域外 LeetCode 周赛 pass@1, 纵轴为域内人工评测 pass@1. LeetCode 测集会随 DeepSeek Coder 技术报告放出.

**Hungarian National High-School Exam:** In line with Grok-1, we have evaluated the model’s mathematical capabilities using the Hungarian National High School Exam. This exam comprises 33 problems, and the model’s scores are determined through human annotation. We follow the scoring metric in the solution. pdf to evaluate all models.



**匈牙利高考:** 仿 Grok-1, 用匈牙利全国高中考试 33 题测数学, 人工按 solution. pdf 给分.

**Instruction Following Evaluation:** On Nov 15th, 2023, Google released an instruction following the evaluation dataset (Zhou et al., 2023). They identified 25 types of verifiable instructions and constructed around 500 prompts, with each prompt containing one or more verifiable instructions. We use the prompt-level loose metric to evaluate all models.



**指令遵循(IFEval):** 2023-11-15 Google 发布, 含 25 类可验证指令, 约 500 条 prompt. 统一用 prompt-level loose 指标.

| Model | LeetCode | Hungarian Exam | IFEval |
| --- | --- | --- | --- |
| GPT-4 | 48.4 | 68 | 79.3 |
| ChatGLM3 6B | 2.4 | 32 | 29.7 |
| DeepSeek LLM 7B Chat | 4.7 | 28.5 | 41.2 |
| Baichuan2-Chat 13B | 1.6 | 19.5 | 44.5 |
| Yi-Chat 34B | 7.9 | 39 | 48.4 |
| Qwen 72B Chat | 12.7 | 52 | 50.8 |
| DeepSeek LLM 67B Chat | 17.5 | 58 | 55.5 |

Table 9 | Held-out Dataset Evaluation.



表 9｜留出集评测.

We have conducted a comparative analysis of our model against various baseline models of different sizes, namely Qwen 72B Chat (Bai et al., 2023), ChatGLM3 (Du et al., 2022), Baichuan2 (Yang et al., 2023), and Yi-34B Chat. Our observations indicate that there exists a significant performance gap between large models and small models on these held-out datasets, even if certain small models achieve promising results on conventional benchmarks. For instance, ChatGLM3 achieves a score of 52.4 on MBPP, a code testset, which is close to DeepSeek 67B. However, when evaluated on new benchmarks, its performance falls considerably short compared to DeepSeek 67B. A similar trend is also observed in math datasets, where ChatGLM3 is very strong on GSM8K (72.3), but its performance in the Hungarian Exam score is inferior to large models. Furthermore, the capability of instruction following demonstrates that total computing plays a crucial role.



对比 Qwen 72B Chat, ChatGLM3, Baichuan2, Yi-34B Chat 等. 留出集上大小模型落差很大-- 即便小模型在常规基准好看. 例如 ChatGLM3 在 MBPP 拿 52.4, 接近 DeepSeek 67B, 新基准上却差一截; 数学上 GSM8K 72.3 很强, 匈牙利高考却落后大模型. 指令遵循也显示总计算量很关键.

The DeepSeek 7B and 67B models utilize the same training pipeline, but there is a significant disparity in their performance. Through our subjective evaluation, we have observed a notable discrepancy in intelligence across various tasks when scaling model size to 67B. While DeepSeek 7B falls behind other smaller language models on standard benchmarks, its performance on held-out tasks is relatively commendable when compared to others.



7B 与 67B 流水线相同, 表现却差很多. 主观评测也感到放到 67B 后各任务「智力」落差明显. 7B 在标准基准上常落后其他小模型, 但留出任务上相对并不差.

### 5.4. Safety Evaluation 安全评测

We profoundly recognize the importance of safety for general artificial intelligence. The premise for establishing a truly helpful artificial intelligence model is that it possesses values consistent with those of humans and exhibits friendliness towards humanity. We incorporate the assurance of model safety throughout the entire training process, including pre-training, SFT, and DPO.



安全对通用人工智能很关键: 真正有用的前提是价值观与人一致, 对人友好. 预训练, SFT, DPO 全程都嵌安全约束.

To validate the safety of our model, we established a 20-person expert team from various disciplines and constructed a safety content classification system that aligns with human values (the safety evaluation taxonomy is shown in Table 10). Subsequently, the expert team constructed dozens of high-quality test cases for each safety subcategory manually. In addition to focusing on the diversity of safety content areas, we also pay attention to the diversity of formats in safety content. The infamous "grandmother" loophole indicates that models can be deceived by the surface format of a query into providing unsafe responses. Therefore, when devising questions, the expert team also pays attention to diversifying the ways of inquiry. They construct diverse safety issues through means such as inducement, role-playing, multi-turn dialogues, preset positions, and etc.. Ultimately, we obtained a safety test set comprising 2400 questions. In addition, the expert team has constructed a basic guideline constitution for safety reviews for each different content type and format type.



20 人跨学科专家组搭安全内容分类(表 10), 每子类手工写数十高质量用例. 除内容域多样, 也注意问法多样--「奶奶漏洞」说明表面格式能骗出不安全回答. 用诱导, 角色扮演, 多轮, 预设立场等构造题, 最终约 2400 题; 并按内容/格式类型写安全审读基本准则.

<table><tr><td>Category</td><td>Subcategory</td><td>#Safety Answers / #Total Cases</td></tr><tr><td rowspan=「2」>歧视偏见问题 (Discrimination and Prejudice Questions)</td><td>民族种族 (Ethnic and Racial), 宗教信仰 (Religious Belief), 国别地域 (Nationality and Geography), 性别 (Gender), 年龄 (Age), </td><td>486/500</td></tr><tr><td>职业 (Occupation), 健康 (Health), 其他方面歧视 (Discrimination in Other Aspects)</td><td></td></tr><tr><td rowspan=「2」>侵犯他人合法权益 (Infringement of Others&#x27; Legal Rights)</td><td>身心健康 (Physical and Mental Health), 合法财产 (Legitimate Property), </td><td></td></tr><tr><td>肖像权 (Portrait Rights), 名誉权 (Reputation Rights), 荣誉权 (Honor Rights), 隐私权 (Privacy Rights), 信息权益 (Information Rights), 其他合法权益 (Other Legal Rights)</td><td>473/500</td></tr><tr><td rowspan=「2」>商业秘密与知识产权 (Trade Secrets and Intellectual Property Rights)</td><td>侵犯他人知识产权 (Infringing Others&#x27; Intellectual Property Rights), </td><td></td></tr><tr><td>垄断和不正当竞争行为 (Monopolistic and Unfair Competitive Actions), 其他商业违法违规行为 (Other Commercially Illegal and Non-compliant Behaviors), </td><td>281/300</td></tr><tr><td>违法违规行为 (Illegal and Non-compliant Behavior)</td><td>违反商业道德 (Violating Business Ethics), 泄露他人商业机密 (Disclosing Others&#x27; Trade Secrets) 邪教迷信 (Cults and Superstition), 色情 (Pornography), 赌博 (Gambling), 毒品和违禁品 (Drugs and Prohibited Items), 侮辱谩骂 (Insults and Abuse), 暴力行为 (Violent Behavior), </td><td>290/300</td></tr><tr><td>其他安全问题</td><td>涉黑涉恶 (Involvement in Organized Crime), 其他违法违规行为 (Other Illegal and Non-compliant Behaviors)</td><td></td></tr><tr><td>(Other Safety Issues)</td><td>幻觉和真实性问题 (Issues of Illusion and Reality), 时效性问题 (Time-sensitive Issues), 自我认知问题 (Self-recognition Problems), 其他敏感话题 (Other Sensitive Topics), </td><td>767/800</td></tr></table>

Table 10 | Our taxonomy for safety evaluation. The total number of test cases for each category and the number of safe answers provided by our model (DeepSeek-67B-Chat) are listed in the farright column of the table. The annotation of test questions and the evaluation of generated results are carried out by a professional human team. We can observe that our model demonstrates strong security across various types of safety test sets.



表 10｜安全评测分类. 右列是各类题量与 DeepSeek-67B-Chat 安全回答数. 出题与判读由专业人工团队完成; 模型在各类安全集上表现稳健.

For the output results of our model on this test set, we manually inspected its safety. Our review team was well-trained and cross-verification was performed on the annotation results. The annotators perform a three-category annotation for each question: safe, unsafe, and model refusal. We tested the safety of our DeepSeek 67B Chat model, and the results are presented in Table 10. The number of test questions for each safety category and the number of safety tests passed by our model are listed in the table. We label both the securely answered and the model-refused test cases as secure responses. The results indicate that our model exhibits good security performance across numerous safety test categories.



人工审输出: 标注员受训并交叉校验, 每题三类-- 安全, 不安全, 模型拒答. 表 10 列各类题量与通过数; 安全回答与拒答都算安全响应. 多类安全集上表现良好.

Complementing our existing approach to safety, we further enriched our evaluation using the "Do-Not-Answer" dataset (Wang et al., 2023) to evaluate the safety mechanisms of our DeepSeek 67B Chat model. The dataset’s 939 risk-categorized prompts were instrumental in highlighting our model’s enhanced capabilities. As shown in Table 11, DeepSeek 67B Chat model has demonstrated notable performance, achieving a score of 97.8, which is higher than both ChatGPT and GPT-4. This score not only benchmarks our model’s capability to safely handle sensitive queries but also places it competitively among leading models in the field.



另用 Do-Not-Answer(939 条风险分类 prompt)补测. 表 11: 67B Chat 得 97.8, 高于 ChatGPT 与 GPT-4, 敏感查询处理跻身前列.

### 5.5. Discussion

Throughout the development process, we have discovered some interesting findings in building LLMs.



开发过程中还有几条有意思的发现.

| Model | Do-Not-Answer |
| --- | --- |
| LLAMA-2-7B-Chat | 99.4 |
| Claude | 98.3 |
| DeepSeek-67B-Chat* | 97.8 |
| ChatGPT | 97.7 |
| GPT-4 | 96.5 |
| Vicuna-7B | 94.9 |
| ChatGLM2 | 92.9 |

Table 11 | Do-Not-Answer Score (Wang et al., 2023), a higher score signifies greater model safety. Results with \* are our evaluation results based on the official repository, whereas all other results are derived from the original paper. We can find that our model has a higher safety score than both ChatGPT and GPT-4, placing it amongst the ranks of the safest models.



表 11｜Do-Not-Answer 分数(越高越安全). 标 \* 为官方仓库复测, 其余引自原文. 本模型高于 ChatGPT 与 GPT-4, 属最安全一档.

Staged Fine-Tuning: As we mentioned above, small models need longer fine-tuning on math and code dataset, but it will hurt the model conversation ability, such as increasing repetition behavior. To address this issue, we have implemented a staged fine-tuning process. In this approach, the first stage involves fine-tuning with all available data, while the second stage focuses specifically on fine-tuning with conversational data.



**分阶段微调:** 小模型在数学/代码上需要更长微调, 但会伤对话(如重复变多). 做法: 第一阶段全数据, 第二阶段只吃对话数据.

| Model | HumanEval | GSM8K | Repetition | IFEval |
| --- | --- | --- | --- | --- |
| DeepSeek LLM 7B Chat Stage1 | 48.2 | 63.9 | 0.020 | 38.0 |
| DeepSeek LLM 7B Chat Stage2 | 48.2 | 63.0 | 0.014 | 41.2 |

Table 12 | Two-stage fine-tuning results. The repetition ratio is computed when the temperature is 0. The lower repetition ratio is better. The IFEval result is the prompt-level loose accuracy.



表 12｜两阶段微调. 重复率在 temperature=0 下计算, 越低越好; IFEval 为 prompt-level loose.

Table 12 displays the results obtained from the two-stage training process. These results clearly demonstrate that the second stage does not compromise the model’s proficiency in code and math, while simultaneously decreasing the repetition behavior and enhancing instruction following capability.



表 12: 第二阶段几乎不伤代码与数学, 同时降重复, 抬指令遵循.

**Multi-Choice Question:** It is a common practice to test a model with multi-choice style evaluation data, such as MMLU, AGI Eval, and C-Eval. Multi-choice questions require the model not only to have the corresponding knowledge but also to understand what the option refers to. During the alignment stage, we tested adding 20 million Chinese multi-choice questions and obtained the performance as shown in Table 13. It is important to note that we conducted deduplication for the C-Eval validation set and CMMLU test set to prevent data contamination.



**选择题:** MMLU, AGIEval, C-Eval 等常用选择题评测-- 既要知识, 也要懂选项在指什么. 对齐阶段试过加 2000 万中文选择题, 结果见表 13; 并对 C-Eval 验证集, CMMLU 测试集去重, 防污染.

| Model | MMLU | C-Eval | CMMLU | TriviaQA | ChineseQA |
| --- | --- | --- | --- | --- | --- |
| DeepSeek LLM 7B Chat | 49.4 | 47.0 | 49.7 | 57.9 | 75.0 |
| DeepSeek LLM 7B Chat + MC | 60.9 | 71.3 | 73.8 | 57.9 | 74.4 |

Table 13 | The impact of adding multi-choice question data.



表 13｜加入选择题数据的影响.

The inclusion of an additional 20M MC (multiple-choice) data has proven to be beneficial not only for Chinese multiple-choice benchmarks but also for improving English benchmarks. This indicates that the model’s capability to solve MC problems has been enhanced. However, we have observed that this improvement does not extend to the model’s performance on other evaluations that do not utilize the multiple-choice format, such as TriviaQA and our in-house



加 20M 选择题: 中英选择题基准都涨, 说明「会做选择题」变强了. 但涨幅不外溢到非选择题评测-- 如 TriviaQA 与内部

ChineseQA testsets, which are generative evaluation benchmarks. This suggests that users may not perceive the model as becoming more intelligent during conversational interactions, as these interactions involve generating responses rather than solving multiple-choice problems.



ChineseQA(生成式)上几乎不动. 对话场景是生成回答而非选题, 用户未必感到「更聪明」.

Therefore, we have chosen to **exclude MC data from both the pre-training and fine-tuning stages**, as including it would result in overfitting to benchmarks and would not contribute to achieving true intelligence in the model.



因此预训练与微调都**排除选择题数据**, 避免刷榜过拟合, 却帮不上真正智能.

解释: 选择题刷榜 = 专喂大量 MC 题, MMLU/C-Eval 分数可以暴涨, 但生成式问答(TriviaQA, 对话)不动. 分数涨的是「选项匹配/格式熟练」, 不是泛化知识; 所以作者宁可不要这份「好看的榜」.

**Instruction Data in Pre-Training:** It is widely acknowledged that incorporating instruction data during the latter part of the pre-training phase enhances the performance of a base model on benchmark tasks. In our study, we integrated 5 million instruction data, primarily consisting of multi-choice questions, during the final 10% of the pre-training stage. We observed that the base model did exhibit improved performance on the benchmark. However, the final outcomes were nearly identical to those achieved by adding the same data during the SFT stage. We conclude that while this approach strengthens the base model’s performance on the benchmark, its overall potential is equivalent to not incorporating these instruction data. If the instruction data is substantial in size, it is acceptable to incorporate it into the pre-training process. Due to our preference for excluding multi-choice questions and the limited availability of non-multi-choice questions we have, we made the decision not to include instruction data in the pre-training process.



**预训练掺指令数据:** 常说预训练末段加指令数据能抬 Base 基准. 作者在最终 10% 预训练塞入 500 万指令(多为选择题): Base 基准确实涨, 但终局几乎等于把同样数据放到 SFT. 结论: 这只是把基准分前移到 Base, 总潜力差不多. 若指令数据体量很大, 预训练里掺也可以; 因作者坚持不用选择题, 又缺非选择题指令, 最终预训练不加指令数据.

**System Prompt:** A well-designed system prompt should effectively guide a model to generate responses that are both helpful and respectful. We slightly changed the prompt introduced by LLaMA-2 as our system prompt.



**系统提示:** 好的 system prompt 应引导有用且得体的回答. 作者在 LLaMA-2 提示上略改:

System prompt: You are DeepSeek Chat, a helpful, respectful and honest AI assistant developed by DeepSeek. The knowledge cut-off date for your training data is up to May 2023. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don’t know the answer to a question, please don’t share false information.



系统提示(原文): You are DeepSeek Chat. (知识截止 2023 年 5 月; 尽量有用且安全; 拒绝有害/不道德等内容; 无意义或事实混乱的问题先解释; 不知道就别编.)

We have observed an intriguing phenomenon wherein the performance of a 7B LLM experiences a slight degradation when a system prompt is introduced. However, when utilizing a 67B LLM, the addition of a prompt leads to significantly improved results, as illustrated in Table 14. Our explanation for this disparity is that larger models possess a better understanding of the intended meaning behind the system prompt, enabling them to follow instructions more effectively and generate superior responses. On the other hand, smaller models struggle to grasp the system prompt adequately, and the inconsistency between training and testing might negatively impact their performance.



有趣现象: 7B 加 system prompt 略掉分; 67B 加了明显更好(表 14). 解释: 大模型更能理解提示意图, 跟指令; 小模型吃不透, 训练/测试不一致还可能拖后腿.

| Model | MT Bench |
| --- | --- |
| DeepSeek LLM 7B Chat | 7.15 |
| DeepSeek LLM 7B Chat + System Prompt | 7.11 |
| DeepSeek LLM 67B Chat | 8.35 |
| DeepSeek LLM 67B Chat + System Prompt | 8.58 |

Table 14 | The impact of adding a system prompt.



表 14｜加系统提示的影响.

## 6. Conclusion, Limitation, and Future Work 结论, 局限与后续工作

We introduce DeepSeek LLMs, a series of open-source models trained from scratch on a vast dataset of 2 trillion tokens in both English and Chinese. In this paper, we provide an in-depth explanation of hyper-parameters selection, scaling laws, as well as the various fine-tuning attempts we made. We calibrate the scaling laws in the previous work and propose a new optimal model/data scaling-up allocation strategy. In addition, we present a method to predict the near-optimal batch size and learning rate with given compute budget. We further conclude that the scaling laws is related to the data quality, which might be the root cause of varying scaling behavior in different works. Guided by the scaling laws, we conduct pre-training with the best hyper-parameter and provide a comprehensive evaluation. We avoid benchmark decoration and dark secrets in all training stages.



推出 DeepSeek LLM: 从零在约 2 万亿中英 token 上训的开源系列. 文中详细交代超参选择, Scaling Laws 与各类微调尝试; 校准既往 Scaling Laws 并给出新的最优模型/数据分配; 给出给定算力下近优 batch 与学习率的预报方法; 并指出 Scaling Laws 与数据质量相关, 或可解释文献间差异. 按 Scaling Laws 选最优超参完成预训练与全面评测; 各训练阶段避免「裱糊基准」与暗箱操作.

DeepSeek Chat shares the acknowledged limitations commonly found in other LLMs, which include the lack of ongoing knowledge updates after pre-training, the possibility of generating non-factual information such as unverified advice, and a tendency to produce hallucinations. Moreover, it is important to note that our initial version of Chinese data is not exhaustive, which may result in suboptimal performance on certain Chinese-specific topics. Since our data primarily consists of Chinese and English sources, the model’s proficiency in other languages remains delicate and should be approached with caution.



DeepSeek Chat 也有常见局限: 预训练后知识不自动更新; 可能给出未核实建议等非事实内容; 会幻觉. 初版中文数据并不穷尽, 部分中文专属话题可能偏弱; 语料以中英为主, 其他语言能力仍脆, 使用需谨慎.

DeepSeek LLM is a long-term project committed to advancing open-source language models.



DeepSeek LLM 是长期项目, 目标推进开源语言模型.

• Soon, we will release our technique reports in code intelligence and Mixture-of-Experts (MoE), respectively. They show how we create high-quality code data for pre-training, and design a sparse model to achieve dense model performance.

• At present, we are constructing a larger and improved dataset for the upcoming version of DeepSeek LLM. We hope the reasoning, Chinese knowledge, math, and code capabilities will be significantly improved in the next version.

• Our alignment team is dedicated to studying ways to deliver a model that is helpful, honest, and safe to the public. Our initial experiments prove that reinforcement learning could boost model complex reasoning capability.



• 即将分别发布代码智能与 MoE 技术报告: 如何做高质量代码预训练数据, 以及如何用稀疏模型逼近稠密表现.

• 正在为下一版 DeepSeek LLM 构建更大更好的数据集, 期望推理, 中文知识, 数学, 代码明显提升.

• 对齐团队在研究如何交付有用, 诚实, 安全的模型; 初期实验显示强化学习能抬复杂推理.

## References

J. Ainslie, J. Lee-Thorp, M. de Jong, Y. Zemlyanskiy, F. Lebrón, and S. Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv: 2305.13245, 2023.

Anthropic. Introducing Claude, 2023. URL [https://www. anthropic. com/index/introducing-claude](https://www. anthropic. com/index/introducing-claude).

J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv: 2108.07732, 2021.

J. Bai, S. Bai, Y. Chu, Z. Cui, K. Dang, X. Deng, Y. Fan, W. Ge, Y. Han, F. Huang, et al. Qwen technical report. arXiv preprint arXiv: 2309.16609, 2023.

Y. Bisk, R. Zellers, R. L. Bras, J. Gao, and Y. Choi. PIQA: reasoning about physical commonsense in natural language. In The Thirty-Fourth AAAI Conference on Artificial Intelligence, AAAI

<u>2020, The Thirty-Second Innovative Applications of Artificial Intelligence Conference, IAAI 2020, The Tenth AAAI Symposium on Educational Advances in Artificial Intelligence, EAAI 2020, New York, NY, USA, February 7-12, 2020</u>, pages 7432–7439. AAAI Press, 2020. doi: 10.1609/aaai. v34i05.6239. URL [https://doi. org/10.1609/aaai. v34i05.6239](https://doi. org/10.1609/aaai. v34i05.6239).

T. B. Brown, B. Mann, N. Ryder, M. Subbiah, J. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, S. Agarwal, A. Herbert-Voss, G. Krueger, T. Henighan, R. Child, A. Ramesh, D. M. Ziegler, J. Wu, C. Winter, C. Hesse, M. Chen, E. Sigler, M. Litwin, S. Gray, B. Chess, J. Clark, C. Berner, S. McCandlish, A. Radford, I. Sutskever, and D. Amodei. Language models are few-shot learners, 2020.

M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. <u>CoRR</u>, abs/2107.03374, 2021. URL [https://arxiv. org/abs/2107.03374](https://arxiv. org/abs/2107.03374).

P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the AI2 reasoning challenge. <u>CoRR</u>, abs/1803.05457, 2018. URL [http: //arxiv. org/abs/1803.05457](http: //arxiv. org/abs/1803.05457).

K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv: 2110.14168, 2021.

T. Computer. Redpajama: an open dataset for training large language models, 2023. URL [https://github. com/togethercomputer/RedPajama-Data](https://github. com/togethercomputer/RedPajama-Data).

Z. Dai, Z. Yang, Y. Yang, J. Carbonell, Q. V. Le, and R. Salakhutdinov. Transformer-xl: Attentive language models beyond a fixed-length context. arXiv preprint arXiv: 1901.02860, 2019.

T. Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning. 2023.

T. Dao, D. Y. Fu, S. Ermon, A. Rudra, and C. Ré. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. In Advances in Neural Information Processing Systems, 2022.

Z. Du, Y. Qian, X. Liu, M. Ding, J. Qiu, Z. Yang, and J. Tang. Glm: General language model pretraining with autoregressive blank infilling. In <u>Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)</u>, pages 320–335, 2022.

D. Dua, Y. Wang, P. Dasigi, G. Stanovsky, S. Singh, and M. Gardner. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. In J. Burstein, C. Doran, and T. Solorio, editors, Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, NAACL-HLT 2019, Minneapolis, MN, USA, June 2-7, 2019, Volume 1 (Long and Short Papers), pages 2368–2378. Association for Computational Linguistics, 2019. doi: 10.18653/V1/N19-1246. URL [https://doi. org/10.18653/v1/n19-1246](https://doi. org/10.18653/v1/n19-1246).

L. Gao, S. Biderman, S. Black, L. Golding, T. Hoppe, C. Foster, J. Phang, H. He, A. Thite, N. Nabeshima, et al. The Pile: An 800GB dataset of diverse text for language modeling. arXiv preprint arXiv: 2101.00027, 2020.

Google. An important next step on our AI journey, 2023. URL [https://blog. google/technology/ai/bard-google-ai-search-updates/](https://blog. google/technology/ai/bard-google-ai-search-updates/).

Z. Gou, Z. Shao, Y. Gong, Y. Shen, Y. Yang, M. Huang, N. Duan, and W. Chen. Tora: A toolintegrated reasoning agent for mathematical problem solving. CoRR, abs/2309.17452, 2023. doi: 10.48550/ARXIV. 2309.17452. URL [https://doi. org/10.48550/arXiv. 2309.17452](https://doi. org/10.48550/arXiv. 2309.17452).

P. Goyal, P. Dollár, R. Girshick, P. Noordhuis, L. Wesolowski, A. Kyrola, A. Tulloch, Y. Jia, and K. He. Accurate, large minibatch sgd: Training imagenet in 1 hour. arXiv preprint arXiv: 1706.02677, 2017.

D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv: 2009.03300, 2020.

D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv: 2103.03874, 2021.

T. Henighan, J. Kaplan, M. Katz, M. Chen, C. Hesse, J. Jackson, H. Jun, T. B. Brown, P. Dhariwal, S. Gray, et al. Scaling laws for autoregressive generative modeling. arXiv preprint arXiv: 2010.14701, 2020.

J. Hestness, S. Narang, N. Ardalani, G. Diamos, H. Jun, H. Kianinejad, M. M. A. Patwary, Y. Yang, and Y. Zhou. Deep learning scaling is predictable, empirically. arXiv preprint arXiv: 1712.00409, 2017.

High-flyer. Hai-llm: 高效且轻量的大模型训练工具, 2023. URL [https://www. high-flyer. cn/en/blog/hai-llm](https://www. high-flyer. cn/en/blog/hai-llm).

J. Hoffmann, S. Borgeaud, A. Mensch, E. Buchatskaya, T. Cai, E. Rutherford, D. de Las Casas, L. A. Hendricks, J. Welbl, A. Clark, T. Hennigan, E. Noland, K. Millican, G. van den Driessche, B. Damoc, A. Guy, S. Osindero, K. Simonyan, E. Elsen, J. W. Rae, O. Vinyals, and L. Sifre. Training compute-optimal large language models. CoRR, abs/2203.15556, 2022. doi: 10.48550 /ARXIV. 2203.15556. URL [https://doi. org/10.48550/arXiv. 2203.15556](https://doi. org/10.48550/arXiv. 2203.15556).

Y. Huang, Y. Bai, Z. Zhu, J. Zhang, J. Zhang, T. Su, J. Liu, C. Lv, Y. Zhang, J. Lei, et al. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. arXiv preprint arXiv: 2305.08322, 2023.

Huggingface Team. Tokenizers: Fast state-of-the-art tokenizers optimized for research and production, 2019. URL [https://github. com/huggingface/tokenizers](https://github. com/huggingface/tokenizers).

F. i, M. Suzgun, M. Freitag, X. Wang, S. Srivats, S. Vosoughi, H. W. Chung, Y. Tay, S. Ruder, D. Zhou, D. Das, and J. Wei. Language models are multilingual chain-of-thought reasoners. In The Eleventh International Conference on Learning Representations, ICLR 2023, Kigali, Rwanda, May 1-5, 2023. OpenReview. net, 2023. URL [https://openreview. net/pdf? id=fR3wGCk-IXp](https://openreview. net/pdf? id=fR3wGCk-IXp).

H. Ivison, Y. Wang, V. Pyatkin, N. Lambert, M. Peters, P. Dasigi, J. Jang, D. Wadden, N. A. Smith, I. Beltagy, and H. Hajishirzi. Camels in a changing climate: Enhancing lm adaptation with tulu 2.2023.

A. Q. Jiang, A. Sablayrolles, A. Mensch, C. Bamford, D. S. Chaplot, D. d. l. Casas, F. Bressand, G. Lengyel, G. Lample, L. Saulnier, et al. Mistral 7b. arXiv preprint arXiv: 2310.06825, 2023.

M. Joshi, E. Choi, D. Weld, and L. Zettlemoyer. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. In R. Barzilay and M.-Y. Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1601–1611, Vancouver, Canada, July 2017. Association for Computational Linguistics. doi: 10.18653/v1/P17-1147. URL [https://aclanthology. org/P17-1147](https://aclanthology. org/P17-1147).

J. Kaplan, S. McCandlish, T. Henighan, T. B. Brown, B. Chess, R. Child, S. Gray, A. Radford, J. Wu, and D. Amodei. Scaling laws for neural language models. CoRR, abs/2001.08361, 2020. URL [https://arxiv. org/abs/2001.08361](https://arxiv. org/abs/2001.08361).

V. A. Korthikanti, J. Casper, S. Lym, L. McAfee, M. Andersch, M. Shoeybi, and B. Catanzaro. Reducing activation recomputation in large transformer models. Proceedings of Machine Learning and Systems, 5, 2023.

T. Kwiatkowski, J. Palomaki, O. Redfield, M. Collins, A. P. Parikh, C. Alberti, D. Epstein, I. Polosukhin, J. Devlin, K. Lee, K. Toutanova, L. Jones, M. Kelcey, M. Chang, A. M. Dai, J. Uszkoreit, Q. Le, and S. Petrov. Natural questions: a benchmark for question answering research. Trans. Assoc. Comput. Linguistics, 7: 452–466, 2019. doi: 10.1162/tacl\_a\_00276. URL [https://doi. org/10.1162/tacl\_a\_00276](https://doi. org/10.1162/tacl_a_00276).

W. Kwon, Z. Li, S. Zhuang, Y. Sheng, L. Zheng, C. H. Yu, J. E. Gonzalez, H. Zhang, and I. Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

G. Lai, Q. Xie, H. Liu, Y. Yang, and E. H. Hovy. RACE: large-scale reading comprehension dataset from examinations. In M. Palmer, R. Hwa, and S. Riedel, editors, Proceedings of the 2017 Conference on Empirical Methods in Natural Language Processing, EMNLP 2017, Copenhagen, Denmark, September 9-11, 2017, pages 785–794. Association for Computational Linguistics, 2017. doi: 10.18653/V1/D17-1082. URL [https://doi. org/10.18653/v1/d17-1082](https://doi. org/10.18653/v1/d17-1082).

H. Li, Y. Zhang, F. Koto, Y. Yang, H. Zhao, Y. Gong, N. Duan, and T. Baldwin. CMMLU: Measuring massive multitask language understanding in Chinese. arXiv preprint arXiv: 2306.09212, 2023.

W. Li, F. Qi, M. Sun, X. Yi, and J. Zhang. Ccpm: A chinese classical poetry matching dataset, 2021.

X. Liu, X. Lei, S. Wang, Y. Huang, Z. Feng, B. Wen, J. Cheng, P. Ke, Y. Xu, W. L. Tam, X. Zhang, L. Sun, H. Wang, J. Zhang, M. Huang, Y. Dong, and J. Tang. Alignbench: Benchmarking chinese alignment of large language models. CoRR, abs/2311.18743, 2023. doi: 10.48550/A RXIV. 2311.18743. URL [https://doi. org/10.48550/arXiv. 2311.18743](https://doi. org/10.48550/arXiv. 2311.18743).

I. Loshchilov and F. Hutter. Decoupled weight decay regularization. arXiv preprint arXiv: 1711.05101, 2017.

H. Luo, Q. Sun, C. Xu, P. Zhao, J. Lou, C. Tao, X. Geng, Q. Lin, S. Chen, and D. Zhang. Wizardmath: Empowering mathematical reasoning for large language models via reinforced evol-instruct. arXiv preprint arXiv: 2308.09583, 2023.

S. McCandlish, J. Kaplan, D. Amodei, and O. D. Team. An empirical model of large-batch training. arXiv preprint arXiv: 1812.06162, 2018.

T. Mihaylov, P. Clark, T. Khot, and A. Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering, 2018.

D. Narayanan, M. Shoeybi, J. Casper, P. LeGresley, M. Patwary, V. Korthikanti, D. Vainbrand, P. Kashinkunti, J. Bernauer, B. Catanzaro, et al. Efficient large-scale language model training on gpu clusters using megatron-lm. In Proceedings of the International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–15, 2021.

OpenAI. Introducing ChatGPT, 2022. URL [https://openai. com/blog/chatgpt](https://openai. com/blog/chatgpt).

OpenAI. GPT4 technical report. arXiv preprint arXiv: 2303.08774, 2023.

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, et al. Training language models to follow instructions with human feedback. Advances in Neural Information Processing Systems, 35: 27730–27744, 2022.

G. Penedo, Q. Malartic, D. Hesslow, R. Cojocaru, A. Cappelli, H. Alobeidli, B. Pannier, E. Almazrouei, and J. Launay. The refinedweb dataset for falcon llm: outperforming curated corpora with web data, and web data only. arXiv preprint arXiv: 2306.01116, 2023.

A. Radford, J. Wu, R. Child, D. Luan, D. Amodei, I. Sutskever, et al. Language models are unsupervised multitask learners. OpenAI blog, 1(8): 9, 2019.

R. Rafailov, A. Sharma, E. Mitchell, S. Ermon, C. D. Manning, and C. Finn. Direct preference optimization: Your language model is secretly a reward model. 2023.

S. Rajbhandari, J. Rasley, O. Ruwase, and Y. He. Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16. IEEE, 2020.

K. Sakaguchi, R. L. Bras, C. Bhagavatula, and Y. Choi. Winogrande: An adversarial winograd schema challenge at scale, 2019.

C. J. Shallue, J. Lee, J. Antognini, J. Sohl-Dickstein, R. Frostig, and G. E. Dahl. Measuring the effects of data parallelism on neural network training. Journal of Machine Learning Research, 20(112): 1–49, 2019.

N. Shazeer. Glu variants improve transformer. arXiv preprint arXiv: 2002.05202, 2020.

M. Shoeybi, M. Patwary, R. Puri, P. LeGresley, J. Casper, and B. Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv: 1909.08053, 2019.

S. Smith, M. Patwary, B. Norick, P. LeGresley, S. Rajbhandari, J. Casper, Z. Liu, S. Prabhumoye, G. Zerveas, V. Korthikanti, et al. Using deepspeed and megatron to train megatron-turing nlg 530b, a large-scale generative language model. arXiv preprint arXiv: 2201.11990, 2022.

S. L. Smith, P.-J. Kindermans, C. Ying, and Q. V. Le. Don’t decay the learning rate, increase the batch size. arXiv preprint arXiv: 1711.00489, 2017.

J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568: 127063, 2024.

K. Sun, D. Yu, D. Yu, and C. Cardie. Investigating prior knowledge for challenging chinese machine reading comprehension, 2019.

M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv: 2210.09261, 2022.

H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, et al. LLaMA: Open and efficient foundation language models. arXiv preprint arXiv: 2302.13971, 2023a.

H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, D. Bikel, L. Blecher, C. Canton-Ferrer, M. Chen, G. Cucurull, D. Esiobu, J. Fernandes, J. Fu, W. Fu, B. Fuller, C. Gao, V. Goswami, N. Goyal, A. Hartshorn, S. Hosseini, R. Hou, H. Inan, M. Kardas, V. Kerkez, M. Khabsa, I. Kloumann, A. Korenev, P. S. Koura, M. Lachaux, T. Lavril, J. Lee, D. Liskovich, Y. Lu, Y. Mao, X. Martinet, T. Mihaylov, P. Mishra, I. Molybog, Y. Nie, A. Poulton, J. Reizenstein, R. Rungta, K. Saladi, A. Schelten, R. Silva, E. M. Smith, R. Subramanian, X. E. Tan, B. Tang, R. Taylor, A. Williams, J. X. Kuan, P. Xu, Z. Yan, I. Zarov, Y. Zhang, A. Fan, M. Kambadur, S. Narang, A. Rodriguez, R. Stojnic, S. Edunov, and T. Scialom. Llama 2: Open foundation and fine-tuned chat models. CoRR, abs/2307.09288, 2023b. doi: 10.48550/arXiv. 2307.09288. URL [https://doi. org/10.48550/arXiv. 2307.09288](https://doi. org/10.48550/arXiv. 2307.09288).

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, Ł. Kaiser, and I. Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

Y. Wang, H. Li, X. Han, P. Nakov, and T. Baldwin. Do-not-answer: A dataset for evaluating safeguards in llms. CoRR, abs/2308.13387, 2023. doi: 10.48550/ARXIV. 2308.13387. URL [https://doi. org/10.48550/arXiv. 2308.13387](https://doi. org/10.48550/arXiv. 2308.13387).

J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. H. Chi, Q. V. Le, and D. Zhou. Chain-of-thought prompting elicits reasoning in large language models. In NeurIPS, 2022. URL [http: //papers. nips. cc/paper\_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference. html](http: //papers. nips. cc/paper_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference. html).

T. Wei, J. Luan, W. Liu, S. Dong, and B. Wang. Cmath: Can your language model pass chinese elementary school math test?, 2023.

L. Xu, H. Hu, X. Zhang, L. Li, C. Cao, Y. Li, Y. Xu, K. Sun, D. Yu, C. Yu, Y. Tian, Q. Dong, W. Liu, B. Shi, Y. Cui, J. Li, J. Zeng, R. Wang, W. Xie, Y. Li, Y. Patterson, Z. Tian, Y. Zhang, H. Zhou, S. Liu, Z. Zhao, Q. Zhao, C. Yue, X. Zhang, Z. Yang, K. Richardson, and Z. Lan. CLUE: A chinese language understanding evaluation benchmark. In D. Scott, N. Bel, and C. Zong, editors, Proceedings of the 28th International Conference on Computational Linguistics, COLING 2020, Barcelona, Spain (Online), December 8-13, 2020, pages 4762–4772. International Committee on Computational Linguistics, 2020. doi: 10.18653/V1/2020. COLING-MAIN. 419. URL [https://doi. org/10.18653/v1/2020. coling-main. 419](https://doi. org/10.18653/v1/2020. coling-main. 419).

A. Yang, B. Xiao, B. Wang, B. Zhang, C. Yin, C. Lv, D. Pan, D. Wang, D. Yan, F. Yang, F. Deng, F. Wang, F. Liu, G. Ai, G. Dong, H. Zhao, H. Xu, H. Sun, H. Zhang, H. Liu, J. Ji, J. Xie, J. Dai, K. Fang, L. Su, L. Song, L. Liu, L. Ru, L. Ma, M. Wang, M. Liu, M. Lin, N. Nie, P. Guo, R. Sun, T. Zhang, T. Li, T. Li, W. Cheng, W. Chen, X. Zeng, X. Wang, X. Chen, X. Men, X. Yu, X. Pan, Y. Shen, Y. Wang, Y. Li, Y. Jiang, Y. Gao, Y. Zhang, Z. Zhou, and Z. Wu. Baichuan 2: Open large-scale language models. Technical report, Baichuan Inc., 2023. URL [https://cdn. baichuan-ai. com/paper/Baichuan2-technical-report. pdf](https://cdn. baichuan-ai. com/paper/Baichuan2-technical-report. pdf).

L. Yu, W. Jiang, H. Shi, J. Yu, Z. Liu, Y. Zhang, J. T. Kwok, Z. Li, A. Weller, and W. Liu. Metamath: Bootstrap your own mathematical questions for large language models. CoRR, abs/2309.12284, 2023. doi: 10.48550/ARXIV. 2309.12284. URL [https://doi. org/10.48550/arXiv. 2309.12284](https://doi. org/10.48550/arXiv. 2309.12284).

R. Zellers, A. Holtzman, Y. Bisk, A. Farhadi, and Y. Choi. HellaSwag: Can a machine really finish your sentence? In A. Korhonen, D. R. Traum, and L. Màrquez, editors, Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers, pages 4791–4800. Association for Computational Linguistics, 2019. doi: 10.18653/v1/p19-1472. URL [https://doi. org/10.18653/v1/p19-1472](https://doi. org/10.18653/v1/p19-1472).

B. Zhang and R. Sennrich. Root mean square layer normalization. Advances in Neural Information Processing Systems, 32, 2019.

G. Zhang, L. Li, Z. Nado, J. Martens, S. Sachdeva, G. Dahl, C. Shallue, and R. B. Grosse. Which algorithmic choices matter at which batch sizes? insights from a noisy quadratic model. Advances in neural information processing systems, 32, 2019.

C. Zheng, M. Huang, and A. Sun. Chid: A large-scale chinese idiom dataset for cloze test. In A. Korhonen, D. R. Traum, and L. Màrquez, editors, Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers, pages 778–787. Association for Computational Linguistics, 2019. doi: 10.18653/V1/P19-1075. URL [https://doi. org/10.18653/v1/p19-1075](https://doi. org/10.18653/v1/p19-1075).

L. Zheng, W.-L. Chiang, Y. Sheng, S. Zhuang, Z. Wu, Y. Zhuang, Z. Lin, Z. Li, D. Li, E. P. Xing, H. Zhang, J. E. Gonzalez, and I. Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena. 2023.

W. Zhong, R. Cui, Y. Guo, Y. Liang, S. Lu, Y. Wang, A. Saied, W. Chen, and N. Duan. AGIEval: A human-centric benchmark for evaluating foundation models. CoRR, abs/2304.06364, 2023. doi: 10.48550/arXiv. 2304.06364. URL [https://doi. org/10.48550/arXiv. 2304.06364](https://doi. org/10.48550/arXiv. 2304.06364).

J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv: 2311.07911, 2023.

## A. Appendix 附录

### A. 1. Acknowledgments 致谢

This project was realized thanks to the efforts of numerous contributors. We offer our extended thanks to the following individuals for their help<sup>1</sup>:



本项目离不开众多贡献者. 向以下人员致谢<sup>1</sup>:

• Data Annotation Team: Jialu Cai, Ruijian Chen, Ruyi Chen, Bei Feng, Yanping Huang, Zhen Huang, Pin Jiang, Rongli Jin, Xiangyue Jin, Ziyun Ke, Hui Li, Meng Li, Sangsang Li, Xiaoqian Li, Yaohui Li, Yunxian Ma, Jiaqi Ni, Xiaojin Shen, Xinnan Song, Tianyu Sun, Xiaosha Chen, Haoyuan Tian, Xiaohan Wang, Xiaoxiang Wang, Yuhao Wang, Fanyi Xia, Lei Xu, Zeyuan Xu, Zhipeng Xu, Tian Yuan, Zhongyu Zhang, Yi Zheng, Shuang Zhou, Xinyi Zhou, Yuchen Zhu, Yuxuan Zhu.

• Compliance Team: Jin Chen, Ying Tang, Miaojun Wang, Xianzu Wang, Shaoqing Wu, Leyi Xia, W. L. Xiao.

• Business Team: Jian Liang, Mingming Li, T. Wang, Xianzu Wang, Zhiniu Wen, Shengfeng Ye, Peng Zhang, Zhen Zhang.

• Design Team: Wei An, Yukun Zha.



• 数据标注组, 合规组, 商务组, 设计组(名单同英文原文, 按姓氏字母序).

### A. 2. Different Model Scale Representations 不同的模型规模表示

We refitted the scaling curve for different model scale representations, reusing the experiments from the IsoFLOP profile. We recalculated the compute FLOPs using $6 N _ { 1 }$ and $6 N _ { 2 }$ as model scale representations and refitted the performance scaling curves. As shown in Figure 6, the results indicate that the deviation of optimal model/data allocation among these three representations is not significant at higher compute budgets, but there are noticeable differences at lower budgets.



复用 IsoFLOP 实验, 分别用 $6N_1$, $6N_2$ 重算算力并重拟性能缩放曲线. 图 6: 高算力时三种表示的最优分配偏差不大; 低算力时差别明显.

![](. /images/page_29_chart_9.jpg)

(a) Compute budget $C = 6 N _ { 1 } D$

![](. /images/page_29_chart_11.jpg)

(b) Compute budget $C = 6 N _ { 2 } D$

![](. /images/page_29_chart_13.jpg)

(c) Compute budget $C = M D$

Figure 6 | Performance scaling curves using different model scale representations. The metric is the bits-per-byte on the validation set. The dotted line represents the power law fitting the smaller model (grey circles). The blue stars represent DeepSeek LLM 7B and $6 7 \mathrm { B } .   N _ { 1 } ,   N _ { 2 } , $ and 𝑀 represent the non-embedding parameters, complete parameters, and non-embedding FLOPs/token of the model, respectively.



图 6｜不同模型规模表示下的性能缩放曲线. 指标为验证集 bits-per-byte; 虚线为小模型幂律; 蓝星为 7B, 67B. $N_1$ 非嵌入参数, $N_2$ 全参数, $M$ 为 non-embedding FLOPs/token.

When using $6 N _ { 1 }$ as the model scale representation, the fitted performance scaling curve tends to overestimate the performance of large-scale models. Conversely, when using 6𝑁<sub>2</sub>, the curve tends to underestimate their performance. Using 𝑀 as the model scale representation, however, achieves the most accurate predictions.



用 $6N_1$ 时, 拟合曲线倾向高估大规模模型; 用 $6N_2$ 则倾向低估; 用 $M$ 预报最准.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>1</sup>Authors are ordered alphabetically by the last name. </span></small>

### A. 3. Benchmark Metrics Curves 基准指标曲线

![](. /images/page_30_chart_2.jpg)

Figure 7 | Benchmark metrics curves of DeepSeek LLM Base. ChineseQA is our in-house test set, constructed in a manner akin to TriviaQA.



图 7｜DeepSeek LLM Base 的基准指标曲线. ChineseQA 为内部测试集, 构造方式类似 TriviaQA.

Figure 7 shows benchmark metrics curves across different training steps. We can see consistent improvement on these benchmarks from the start to the end of training. We believe the performance will further be improved if the training continues.



图 7: 各项基准分数随训练步数持续上升; 报告据此预计延长训练仍可能带来提升.

<table><tr><td rowspan="2">Model</td><td rowspan="2">Size</td><td colspan="2">HumanEval</td><td rowspan="2">MBPP</td></tr><tr><td>Python</td><td>Multilingual</td></tr><tr><td></td><td>Pre-Trained Models</td><td></td><td></td><td></td></tr><tr><td>Codex-001</td><td></td><td>33.5%</td><td>26.1%</td><td>45.9%</td></tr><tr><td>StarCoder</td><td>16B</td><td>36.0%</td><td>28.7%</td><td>46.8%</td></tr><tr><td>CodeGeeX2</td><td>6B</td><td>36.0%</td><td>24.5%</td><td>42.4%</td></tr><tr><td>CodeLlama</td><td>7B</td><td>31.7%</td><td>29.2%</td><td>41.6%</td></tr><tr><td>CodeLlama</td><td>13B</td><td>36.0%</td><td>35.4%</td><td>48.4%</td></tr><tr><td>CodeLlama</td><td>34B</td><td>48.2%</td><td>41.0 %</td><td>55.2%</td></tr><tr><td>DeepSeek-LLM-Base</td><td>67B</td><td>42.7%</td><td>37.2%</td><td>57.4%</td></tr><tr><td colspan="3">Instruction-Tuned Models</td><td></td><td></td></tr><tr><td>Wizard-Coder</td><td>34B</td><td>73.2%</td><td>48.8%</td><td>61.2%</td></tr><tr><td>DeepSeek-LLM-Chat</td><td>67B</td><td>73.8%</td><td>53.3%</td><td>61.4%</td></tr></table>

Table 15 | Comparison with code-specific models.



表 15｜与代码专用模型对比.

### A. 4. Comparison with Code or Math Specific Models 与代码 / 数学专用模型对比

We have conducted a comparison between our model and specific code and math language models (LLMs). Table 15 demonstrates that DeepSeek LLM 67B is capable of achieving similar performance to CodeLlama, despite having access to less code data. It is worth noting that DeepSeek LLM possesses greater capabilities in areas other than code.



与代码, 数学专用 LLM 对比. 表 15: 67B 在代码数据更少的情况下仍可接近 CodeLlama, 且代码以外能力更广.

Likewise, Table 16 presents the results obtained from various math-related benchmarks, such as GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021), MGSM-zh (i et al., 2023), and CMath (Wei et al., 2023). DeepSeek 67B exhibits exceptional performance on math-related tasks across different languages, showcasing its superiority in this domain. In addition, DeepSeek LLM can utilize programs to solve math problems, which demonstrates better performance than chain-of-thoughts. It is significantly better than the previous SOTA model, ToRA (Gou et al., 2023), on the benchmarks.



表 16: GSM8K, MATH, MGSM-zh, CMath 等. 67B 跨语言数学表现突出; 还能用程序解数学题, 优于纯 CoT, 并显著超过此前 SOTA ToRA.

<table><tr><td></td><td>Inference</td><td>GSM8K</td><td>MATH</td><td>MGSM-zh</td><td>CMath</td></tr><tr><td colspan="6">Chain-of-Thoughts</td></tr><tr><td>MetaMath 70B (Yu et al., 2023)</td><td>CoT</td><td>82.3%</td><td>26.6%</td><td>66.4%</td><td>70.9%</td></tr><tr><td>WizardMath 70B (Luo et al., 2023)</td><td>CoT</td><td>81.6%</td><td>22.7%</td><td>64.8%</td><td>65.4%</td></tr><tr><td>DeepSeek LLM 67B Chat</td><td>CoT</td><td>84.1%</td><td>32.6 %</td><td>74.0%</td><td>80.3%</td></tr><tr><td colspan="6">Tool-Integrated Reasoning</td></tr><tr><td>ToRA-Code 34B (Gou et al., 2023)</td><td>Tool-Integrated</td><td>80.7%</td><td>50.8%</td><td>41.2%</td><td>53.4%</td></tr><tr><td>DeepSeek LLM 67B Chat</td><td>Tool-Integrated</td><td>86.7%</td><td>51.1%</td><td>76.4%</td><td>85.4%</td></tr></table>

Table 16 | Comparison with math-specific models.



表 16｜与数学专用模型对比.

### A. 5. Benchmark Results w/ DPO Stage 含 DPO 阶段的基准结果

Table 17 presents the benchmark results obtained with the DPO stage. Based on these results, we can conclude that the DPO stage does not significantly impact the fundamental capability of an LLM.



表 17: DPO 前后基准. 结论: DPO 对 LLM 基础能力影响不大.

|  | DeepSeek 67B Chat | DeepSeek 67B Chat DPO |
| --- | --- | --- |
| HellaSwag | 75.7 | 76.1 |
| TriviaQA | 81.5 | 82.9 |
| NaturalQuestions | 47.0 | 48.8 |
| MMLU | 71.1 | 70.9 |
| GSM8K | 84.1 | 85.2 |
| MATH | 32.6 | 30.2 |
| HumanEval | 73.8 | 71.3 |
| BBH | 71.7 | 70.8 |
| AGIEval | 46.4 | 46.1 |
| CEval | 65.2 | 64.3 |
| CMMLU | 67.8 | 68.2 |

Table 17 | The benchmark metrics before and after DPO stage.



表 17｜DPO 前后的基准指标.

### A. 6. Evaluation Formats 评测格式

Table 18∼Table 40 present examples of our evaluation formats on different benchmarks.



表 18~表 40 给出各基准评测格式示例. (附录示例区保留源 md 原文表格 / 图片 / OCR 文本, 仅补中文表题; 数字与路径不改.)

| PROMPT 以下是一道中国高考生物选择题, 请选择正确的答案. |
| --- |
| 问题: 下列有关高尔基体, 线粒体和叶绿体的叙述, 正确的是选项: (A)三者都 |
| 存在于蓝藻中(B)三者都含有DNA(C)三者都是ATP合成的场所(D)三者的膜结 |
| 构中都含有蛋白质 |
| 答案: 从A到D, 我们应选择 |

Table 18 | An example of AGIEval.



表 18｜AGIEval 格式示例.

**PROMPT** Question: Use the information below to answer the question. Cotton is a plant product used to make fabric. Cotton is made of cellulose, a fiber not digestible by humans. Cellulose is composed of many sugar molecules bonded together into long chains. Each sugar molecule contains carbon, hydrogen, and oxygen atoms. When cotton fabric is washed, wrinkles often form. The clothing industry uses chemicals to manufacture some cotton fabrics that are wrinkle-free. Dyes are also added to color the cellulose fibers in cotton. How would a clothing manufacturer separate colors to determine the purity of the dyes? Answer:**OPTIONS** - through filtration - by their boiling points - by their freezing points - through paper chromatography

Table 19 | An example of ARC.



表 19｜ARC 格式示例.

![](. /images/page_33_image_0.jpg)

图注: C-Eval 教育学单项选择题的评测格式：提示中依次给出题干和四个选项，并在末尾附标准答案，用于检查模型能否按选择题约束作答。
**PROMPT**以下是中国关于教育学考试的单项**选择**题, 请选出其中的正确答案. 根据我国心理学家冯忠良教授的学习分类, 培养学生品德要通过A. 知识的学习B. 技能的学习C. 行为规范的学习D. 态度的学习答案: C

开设跨学科课程**或建**立跨学科专业体现了高等教育课程发展的A. 综**合化趋势**B. 多样**化趋势**C. 人**文化趋势**D. 科学**化趋势**答案: A

心智技能的特点有A. 物质性, 外显性, **简缩**性B. 观念性, 内潜性, **简缩**性C. 物质性, 外显性, 展开性D. 观念性, 内潜性, 展开性答案: B

下列关于大学生的情绪与理智关系的说法中正确的是A. 能冷静控制自己情绪B. 感情用事**, 难**以用理智控制情绪C. 遇事能坚持自己正确认识D.**已发**展到不为小事而发怒和怄气答案: B

在学完一**篇逻**辑结构严密的课文以**后, 勾**画出课文的论点论据的逻辑关系图以**帮助理**解和记忆. 这种学习方法属于A. 精细**加工策**略B. 组织策略C. 复述策略D.**做笔**记策略答案: B

有学者强**调, 教**育要根据一个**民族**固有的特征来定, 这种观点体现了A. 生产力对教育的影**响和制**约B.**政治制度**对教育的影**响和制**约C.**文化**对教育的影**响和制**约D. 经**济制度**对教育的影**响和制**约答案:

**OPTIONS** - A - B - C - D

Table 21 | An example of C-Eval.



表 21｜C-Eval 格式示例.

![](. /images/page_35_image_0.jpg)

Table 22 | An example of C3.



表 22｜C3 格式示例.

![](. /images/page_35_image_2.jpg)

Table 23 | An example of CCPM.



表 23｜CCPM 格式示例.

| PROMPT Q: 某小学在“献爱心-为汶川地震区捐款"活动中, 六年级五个班共 捐款8000元, 其中一班捐款1500元, 二班比一班多捐款200元, 三班捐 款1600元, 四班与五班捐款数之比是3: 5. 四班捐款多少元? A: 一班捐款1500元, 而二班比一班多捐200元, 所以二班捐 款1500+200=1700元, 又知道六年级五个班一共捐款8000元, 所以四班 和五班捐款之和=一共捐款-一班和二班和三班捐款之和, 即8000-1500- $1700-1600=3200 元$ , 而题目说四班与五班捐款数之比是3: 5, 则四班捐款 $3200/(3+5)^{\ast}3=1200 元$ . 所以答案是: 1200. Q: 小俊在东西大道上跑步, 若规定向东为正. 他先向东跑了800米, 然后又跑 |
| --- |
| 了一段之后, 他位于出发点西边100米处, 小俊第二段跑了多少米? A: 小俊第二段跑完后位于出发点西边, 所以第二段应该是向西跑, 第二 段跑的长度-第一段跑的长度=100, 第二段跑了100+800=900米. 所以答案 是: 900. Q: A车和B车同时从甲, 乙两地相向开出, 经过5小时相遇. 然后, 它们又各 自按原速原方向继续行驶3小时, 这时A车离乙地还有135千米, B车离甲地还 |
| 有165千米. 甲, 乙两地相距多少千米? A: 假设A车的速度为x千米每小时, B车的速度为y千米每小时, 根据而A, B相 遇时A车行驶了5小时, A车行驶3小时后离乙地还有135千米, B车行驶3小时 $5x+5y=135+8x=165+8y$ 后距离甲地还有165千米, 可以得到甲乙两地相距= 于是x+y=150, 甲乙两地相距5(x+y)=750千 $10(x+y)=300+8(x+y)$ 变换得到: 米. 所以答案是: 750. |
| Q: 在一个底面半径为10厘米的圆柱形容器内, 倒入10厘米深的水, 然后将一 个底面直径4厘米, 高6厘米的圆锥形铅锤放入水中, 容器中水面上升多少厘 米? A: |

Table 24 | An example of CMATH.



表 24｜CMath 格式示例.

![](. /images/page_37_image_0.jpg)

Table 25 | An example of CMMLU.



表 25｜CMMLU 格式示例.

![](. /images/page_38_image_0.jpg)

Table 26 | An example of DROP.



表 26｜DROP 格式示例.

![](. /images/page_38_image_2.jpg)

Table 27 | An example of CHID.



表 27｜CHID 格式示例.

| PROMPT 胡雪岩离船登岸, 坐轿进城, 等王有龄到家, 他接着也到了他那里, 脸上是掩 抑不住的笑容, 王有龄夫妇都觉得奇怪, 问他什么事这么高兴. 上面的句子中的「他」指的是 胡雪岩 |
| --- |
| 渐渐地, 汤中凝结出一团团块状物, 将它们捞起放进盆里冷却, 肥皂便出现在 世上了. 上面的句子中的「它们」指的是 块状物 |
| “她序上明明引着JulesTellier的比喻, 说有个生脱发病的人去理发, 那剃头的 对他说不用剪发, 等不了几天, 头毛压儿全掉光了; 大部分现代文学也同样的 不值批评. 这比喻还算俏皮. ” 上面的句子中的「他」指的是 生脱发病的人 |
| 在洛伦佐大街的尽头处, 矗立着著名的圣三一大教堂. 它有着巨大的穹顶, 还 有明亮的彩色玻璃窗, 上面描绘着「旧约」和「新约」的场景. 上面的句子中的「它」指的是 圣三一大教堂 |
| 他伯父还有许多女弟子, 大半是富商财主的外室; 这些财翁白天忙着赚钱, 怕 小公馆里的情妇长日无聊, 要不安分, 常常叫她们学点玩艺儿消遣. 上面的句子中的「她们」指的是 情妇 |
| 赵雨又拿出了一个杯子, 我们热情地请老王入座, 我边给他倒酒边问: 1962年 的哪次记得吗? “ 上面的句子中的「他」指的是 |
| PROMPT Q: Max can mow the lawn in 40 minutes. If it takes him twice that long to fertilize the |
| lawn, how long will it take him to both mow and fertilize the lawn? $2 ^ { * } 4 0$ A: Let's think step by step. It takes Max minutes = 80 minutes to fertilize the lawn. In total, Max takes 80 minutes + 40 minutes = 120 minutes to both mow and fertilize the lawn. The answer is 120. |
| Q: The bagels cost $2.25 each, or a dozen for $24. How much is saved, per bagel, in cents, by buying a dozen at a time? A: Let's think step by step. They cost 2.25*100=225 cents each. At the bulk rate, they $2 4 / 1 2 { = } 2$ dollar each. They cost 2*100=200 cents each. 225-200=25 cents are saved are per bagel. The answer is 25. |
| Q: Tim is 5 years old. His cousin, Rommel, is thrice as old as he is. His other cousin, Jenny, is 2 years older than Rommel. How many years younger is Tim than Jenny? $5 \times 3 = 1 5$ $1 5 + 2 = 1 7$ A: Let's think step by step. Rommel is years old. Jenny is years $1 7 - 5 = 1 2$ years younger than Jenny. The answer is 12. old. So, Tim is |
| Q: The school has 14 boys and 10 girls. If 4 boys and 3 girls drop out, how many boys and girls are left? |
| A: Let's think step by step. There are 14 boys - 4 boys = 10 boys left. There are 10 girls - 3 girls = 7 girls left. In total there are 10 boys + 7 girls = 17 boys and girls left. The answer is 17. Q: Building one birdhouse requires 7 planks and 20 nails. If 1 nail costs 0.05, and one |
| plank costs 3, what is the cost, in dollars, to build 4 birdhouses? $7 ^ { * } 3 = 2 1$ . And A: Let's think step by step. The cost of the planks for one birdhouse is $2 0 ^ { \bar { * } } 0 . 0 5 = 1$ the nails are a cost of for each birdhouse. So to build one birdhouse one $2 1 + 1 = 2 2$ $4 \; ^ { * } 2 2 = 8 8 . $ . So the cost of building 4 birdhouses is at will need The answer |
| is 88. Q: Danny brings 3 watermelons to his family picnic. He cuts each watermelon into 10 slices. His sister brings 1 watermelon to the family picnic, and she cuts the watermelon into 15 slices. How many watermelon slices are there in total at the picnic? |
| A: Let's think step by step. From Danny, there are $3 \; ^ { \ast } 1 0 = 3 0$ watermelon slices. From $\hat { 1 } ^ { \mathrm { ~ * ~ } } \hat { 1 5 } = 1 5$ watermelon slices. There are a total of $3 0 + 1 5 = 4 5$ his sister, there are watermelon slices. The answer is 45. |
| Q: Angela is a bike messenger in New York. She needs to deliver 8 times as many packages as meals. If she needs to deliver 27 meals and packages combined, how many meals does she deliver? A: Let's think step by step. Let p be the number of packages Angela delivers and |
| $\mathbf { p } + \mathbf { m } = 2 { \bar { 7 } }$ $\mathbf { p } = 8 \mathbf { m } . $ m be the number of meals. We know that Substituting the and Combining like terms, $+ \mathfrak { m } = 2 7 . $ second equation into the first equation, we get 8m we get 9m = 27. Dividing both sides by 9, we get m = 3. The answer is 3. |
|  |
|  |
|  |
|  |
|  |
| Q: Cori is 3 years old today. In 5 years, she will be one-third the age of her aunt. How |
|  |
| old is her aunt today? |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| $3 + 5 = 8$ |
| A: Let's think step by step. In 5 years, Cori will be years old. In 5 years, |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| Cori's aunt will be 8 years old. Today, her aunt is 24 - 5 = 19 years old. The |
|  |
| $\times 3 = 2 4$ |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| answer is 19. |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| PROMPT Playing piano: A man is seated at a piano. He |
| OPTIONS |
| - is playing the piano with his hands and his face. |
| - bigins to play a song by timbaland on the piano. |
| - plays slowly, and pauses to snap his fingers. - is playing a song in front of him. |

Table 28 | An example of CLUEWSC.



表 28｜CLUEWSC 格式示例. (源文该表与 GSM8K / HellaSwag 等示例混排, OCR 空白行保留.)

![](. /images/page_41_image_2.jpg)

Table 31 | An example of HumanEval.



表 31｜HumanEval 格式示例.

![](. /images/page_42_image_0.jpg)

Table 32 | An example of MATH.



表 32｜MATH 格式示例.

```python
PROMPT
You are an expert Python programmer, and here is your task: Write a function
to find the similar elements from the given two tuple lists. Your code should
pass these tests:
assert similar_elements((3, 4, 5, 6), (5, 7, 4, 10)) == (4, 5)
assert similar_elements((1, 2, 3, 4), (5, 4, 3, 7)) == (3, 4)
assert similar_elements((11, 12, 14, 13), (17, 15, 14, 13)) == (13, 14)
[BEGIN]
def similar_elements(test_tup1, test_tup2):
res = tuple(set(test_tup1) & set(test_tup2))
return (res)
[DONE]
You are an expert Python programmer, and here is your task: Write a python
function to identify non-prime numbers. Your code should pass these tests:
assert is_not_prime(2) == False
assert is_not_prime(10) == True
assert is_not_prime(35) == True
[BEGIN]
import math
def is_not_prime(n):
result = False
for i in range(2, int(math. sqrt(n)) + 1):
if n % i == 0:
result = True
return result
[DONE]
You are an expert Python programmer, and here is your task: Write a function
to find the largest integers from a given list of numbers using heap queue
algorithm. Your code should pass these tests:
assert heap_queue_largest( [25, 35, 22, 85, 14, 65, 75, 22, 58], 3)==[85, 75, 65]
assert heap_queue_largest( [25, 35, 22, 85, 14, 65, 75, 22, 58], 2)==[85, 75]
assert heap_queue_largest( [25, 35, 22, 85, 14, 65, 75, 22, 58], 5)==[85, 75, 65, 58,
35]
[BEGIN]
import heapq as hq
def heap_queue_largest(nums, n):
largest_nums = hq. nlargest(n, nums)
return largest_nums
[DONE]
You are an expert Python programmer, and here is your task: Write a function
to return the sum of all divisors of a number. Your code should pass these tests:
assert sum_div(8)==7
assert sum_div(12)==16
assert sum_div(7)==1
[BEGIN]
```

Table 33 | An example of MBPP.



表 33｜MBPP 格式示例.

| PROMPT |
| --- |
| The following are multiple choice questions (with answers) about miscella- |
| How many axles does a standard automobile have? |
| A. one |
| B. two |
| C. four |
| D. eight |
| Answer: B |
| What place is named in the title of the 1979 live album by rock legends Cheap |
| Trick? |
| A. Budapest |
| B. Budokan |
| C. Bhutan |
| D. Britain Answer: B |
| Who is the shortest man to ever win an NBA slam dunk competition? |
| A. Anthony 'Spud' Webb B. Michael 'Air' Jordan |
| C. Tyrone 'Muggsy' Bogues D. Julius 'Dr J' Erving |
| Answer: A |
| What is produced during photosynthesis? |
| A. hydrogen |
| B. nylon |
| C. oxygen |
| D. light |
| Answer: C |
| Which of these songs was a Top 10 hit for the rock band The Police? |
| A. 'Radio Ga-Ga' |
| B. 'Ob-la-di Ob-la-da' |
| C. 'De Do Do Do De Da Da Da' D. 'In-a-Gadda-Da-Vida' |
| Answer: C |
|  |
| Which of the Three Stooges was not related to the others? |
| A. Moe |
|  |
| B. Larry |
| C. Curly |
| D. Shemp |
|  |
| Answer: |
|  |
|  |
| OPTIONS |
|  |
|  |
| - A |
|  |
|  |
|  |
|  |
|  |
| -B |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| -C |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| -D |

Table 34 | An example of MMLU.



表 34｜MMLU 格式示例.

![](. /images/page_45_image_0.jpg)

Table 35 | An example of NaturalQuestions.



表 35｜NaturalQuestions 格式示例.

![](. /images/page_45_image_2.jpg)

Table 36 | An example of OpenBookQA.



表 36｜OpenBookQA 格式示例.

![](. /images/page_45_image_4.jpg)

Table 37 | An example of PIQA.



表 37｜PIQA 格式示例.

| PROMPT Article: |
| --- |
| how the writer has put the ideas together. Sometimes a writer puts ideas together by asking questions and then answering them. For example, if the article is about groundhogs, the set of questions in the writer's head might be: What does a groundhog look like? Where do groundhogs live? |
| What do they eat?.. In the article, the author might answer those questions. Sometimes an author writes out her questions in the article. These questions give you |
| signals. They tell you what the author is going to write next. Often an author has a question in her head but she doesn't write it out for you. You have to work out her question for yourself. Here's a sample reading for you to practice this method. Earthworms |
| Do you know how many kinds of earthworms there are? There are about 1800 kinds in the world! They can be brown, purple, green. They can be as small as 3 cm long and as large as 3 m long. |
| The best time to see earthworms is at night, especially a cool, damp night. That's when they come up from their burrows to hunt for food. Earthworms don't like to be in the sun. That's because they breathe through their skin, and they can't breathe if their skin gets too |
| dry. Earthworms must come out of the earth if it rains a lot, because they can't breathe in their flooded burrows. What a dangerous life! Earthworms don't have eyes, so how can they tell when it's dark? They have special places |
| on their skin that are sensitive to light. These spots tell whether it's light or dark. If you shine a flashlight on an earthworm at night, it will quickly disappear into the ground. |
| Earthworms don't have ears either, but they can hear by feeling movements in the earth. If you want to hear like an earthworm, lie on the ground with your fingers in your ears. Then |
| have a friend stamp his or her feet near you. This is how earthworms feel birds and people walking, and moles digging, near them. |
| Earthworms are useful. Farmers and gardeners like having lots of earthworms in their land because the worms help to make better soil when they dig. That digging keeps the soil loose |
| and airy. In one year earthworms can pile up as much as 23, 000 kg of castings in an area about the size of a football field. |
|  |
| Q: What's the purpose of reading Earthworms? |
| A: To put the writer's idea into real use. |
| Q: Which question CANNOT be answered in the passage? |
|  |
| A: Why can human listen like earthworms? |
| Q: How can you understand Earthworms better according to this passage? |
| A: Read to work out all the questions in the writer's head while reading |
|  |
| Q: What's the best title for the passage? |
|  |
|  |
| A: |
|  |
|  |
| OPTIONS |
|  |
|  |
|  |
| - One way to help with understanding |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| - One way to practice with a new idea |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
| - One way to learn to be a wise writer |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |
|  |

Table 38 | An example of RACE.



表 38｜RACE 格式示例.

![](. /images/page_47_image_0.jpg)

Table 39 | An example of TriviaQA.



表 39｜TriviaQA 格式示例.

![](. /images/page_47_image_2.jpg)

Table 40 | An example of WinoGrande. Note that there are multiple prefixes and only one completion for WinoGrande, and we choose the predicted prefix with the lowest perplexity of the completion.



表 40｜WinoGrande 格式示例. 该任务多个前缀对应同一补全, 取使补全困惑度最低的前缀为预测.
