---
title: "01 · DeepSeek-GRM 对照译稿"
category: "架构与算法"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek-GRM 论文 Inference-Time Scaling for Generalist Reward Modeling 的逐段中英对照, 覆盖正文与附录, 附疑点批注."
---

<!-- page 1 of 44 -->

arXiv:2504.02495v3 [cs.CL] 25 Sep 2025

Preprint. Under review.

# Inference-Time Scaling for Generalist Reward Modeling / 通用奖励建模的 TestingTime 扩展

**Zijun Liu**<sup>1,2†∗</sup>**, Peiyi Wang**<sup>1∗</sup>**, Runxin Xu**<sup>1</sup>**, Shirong Ma**<sup>1</sup>**, Chong Ruan**<sup>1</sup>, **Peng Li**<sup>3</sup>, **Yang Liu**<sup>2,3</sup>, **Yu Wu**<sup>1</sup>

<sup>1</sup>DeepSeek-AI, <sup>2</sup>Dept. of Computer Sci. & Tech., Tsinghua University, <sup>3</sup>Institute for AI Industry Research (AIR), Tsinghua University zj-liu24@mails.tsinghua.edu.cn, wangpeiyi9979@gmail.com

## Abstract

Reinforcement learning (RL) has been widely adopted in post-training for large language models (LLMs) at scale. Recently, the incentivization of reasoning capabilities in LLMs from RL indicates that proper learning methods could enable effective inference-time scalability. A key challenge of RL is to obtain accurate reward signals for LLMs in various domains beyond verifiable questions or artificial rules. In this work, we investigate how to improve reward modeling (RM) with more inference compute for general queries, i.e. the **inference-time scalability of generalist RM**. For the RM approach, we adopt pointwise generative reward modeling (GRM) to enable flexibility for different input types and the potential for inference-time scaling. For the learning method, we propose **Self-Principled Critique Tuning** (SPCT) to foster scalable reward generation behaviors in GRMs through online RL, to generate principles adaptively and critiques accurately, resulting in **DeepSeek-GRM** models. Furthermore, for effective inference-time scaling, we use parallel sampling to expand compute usage, and introduce a meta RM to guide the voting process for better scaling performance. Empirically, we show that SPCT significantly improves the quality and scalability of GRMs, outperforming existing methods and models in various RM benchmarks without severe biases, and it can achieve better performance compared to training-time scaling. DeepSeek-GRM still meets challenges in some tasks, which we believe can be addressed by future efforts in generalist reward systems. The models are released at [Hugging Face](https://huggingface.co/collections/BBQGOD/deepseek-grm-68b4681169dbb97fd30614b5) and [ModelScope](https://www.modelscope.cn/collections/DeepSeek-GRM-ff6a2d8babdd4a).

强化学习 (RL) 已被大规模用于大语言模型 (LLM) 的后训练. 近来用 RL 激发 LLM 推理能力的工作表明, 合适的学习方法能带来有效的 TestingTime 可扩展性. RL 的一个关键难题, 是在可验证问题和人工规则之外的各种领域里为 LLM 拿到准确的奖励信号. 本工作研究如何在通用查询上用更多推理算力改进奖励建模 (RM), 即**通用 RM 的 TestingTime 可扩展性**. RM 方法上, 我们采用 pointwise 生成式奖励建模 (GRM), 让它能灵活处理不同类型的输入, 并具备 TestingTime 扩展的潜力. 学习方法上, 我们提出**自原则评语微调** (Self-Principled Critique Tuning, SPCT), 通过在线 RL 在 GRM 中培养可扩展的奖励生成行为: 自适应地生成原则, 准确地写出评语, 由此得到 **DeepSeek-GRM** 系列模型. 为了让 TestingTime 扩展有效, 我们用并行采样增加算力投入, 并引入一个 meta RM 来引导投票, 获得更好的扩展表现. 实验表明, SPCT 显著提升了 GRM 的质量和可扩展性, 在多个 RM 基准上超过现有方法和模型, 没有严重的偏差, 而且效果可以好于训练侧扩大模型规模. DeepSeek-GRM 在部分任务上仍有困难, 我们相信未来在通用奖励系统上的工作可以解决这些问题. 模型已发布在 [Hugging Face](https://huggingface.co/collections/BBQGOD/deepseek-grm-68b4681169dbb97fd30614b5) 和 [ModelScope](https://www.modelscope.cn/collections/DeepSeek-GRM-ff6a2d8babdd4a).

## 1 Introduction

The remarkable advancements in large language models (LLMs) (DeepSeek-AI, 2024b; OpenAI, 2025b) have catalyzed significant shifts in artificial intelligence research, enabling models to perform tasks that require understanding, generation, and nuanced decision-making capabilities. Recently, reinforcement learning (RL) as a post-training method for LLMs has been widely adopted at scale, and resulting in remarkable improvements in human value alignment (Ouyang et al., 2022; Bai et al., 2022a), long-term reasoning (DeepSeek-AI, 2025; OpenAI, 2025c), and environment adaptation (OpenAI, 2025a) for LLMs. Reward modeling (RM) (Gao et al., 2023), as

![Image block](./images/p01-figure-1-inference-time-scaling-performance-with-different-rms.jpg)

Figure 1: Inference-time scaling performance with different RMs on all tested RM benchmarks. Results are shown with up to 8 samples for each method, and are further scaled to 32 samples for ours. Non-italic font indicates models based on Gemma-2-27B.

\*Equal contribution. <sup>†</sup>Work done during internship at DeepSeek-AI.

\*同等贡献. <sup>†</sup>在 DeepSeek-AI 实习期间完成的工作.

<!-- page 2 of 44 -->

Preprint. Under review.

a crucial component in RL, is essential for generating accurate reward signals for LLM responses. Current studies (Lightman et al., 2024; DeepSeek-AI, 2025) also show that, with high-quality and robust rewards in either training or inference time, LLMs can achieve strong performance in specific domains.

大语言模型 (DeepSeek-AI, 2024b; OpenAI, 2025b) 的显著进步推动了人工智能研究的重大转向, 让模型能完成需要理解, 生成和细致决策的任务. 近来, RL 作为 LLM 的后训练方法被大规模采用, 在人类价值对齐 (Ouyang et al., 2022; Bai et al., 2022a), 长程推理 (DeepSeek-AI, 2025; OpenAI, 2025c) 和环境适应 (OpenAI, 2025a) 上都带来了明显提升. 奖励建模 (RM) (Gao et al., 2023) 是 RL 的关键组件, 负责为 LLM 的回答生成准确的奖励信号. 现有研究 (Lightman et al., 2024; DeepSeek-AI, 2025) 也表明, 只要在训练时或推理时有高质量, 稳健的奖励, LLM 就能在特定领域取得很强的表现.

However, such high-quality rewards in specific domains are mainly obtained from humandesigned environments with clear conditions (Yao et al., 2022; Xie et al., 2024) or from hand-crafted rules for verifiable questions, e.g., mathematical problems (Hendrycks et al., 2021; Veeraboina, 2023) and coding tasks (Jimenez et al., 2024; Zhuo et al., 2025). In general domains, reward generation is more challenging, as the criteria for rewards are more diverse and complex, and there are often no explicit reference or ground truth. Generalist reward modeling is thus crucial for improving the performance of LLMs in broader applications, either from post-training perspectives, e.g., RL at scale, or from inference perspectives, e.g., RM-guided search. Furthermore, RM performance should be improved by increasing both the training compute (Gao et al., 2023) and the inference compute.

但这类特定领域的高质量奖励, 主要来自条件明确的人工设计环境 (Yao et al., 2022; Xie et al., 2024), 或者来自为可验证问题手写的规则, 例如数学题 (Hendrycks et al., 2021; Veeraboina, 2023) 和编程任务 (Jimenez et al., 2024; Zhuo et al., 2025). 在通用领域, 奖励生成难得多: 评判标准更多样, 更复杂, 而且常常没有明确的参考答案或真值. 因此, 大规模 RL 与 RM 引导的搜索若要扩展到更多场景, 都需要能够处理开放标准和无参考答案的通用奖励模型. 此外, RM 的表现应当能随训练算力 (Gao et al., 2023) 和推理算力的增加而提升.

In practice, challenges arise in making RMs both general and effectively scalable in inference time. The former demands (1) flexibility for different input types and (2) accurate reward generation in various domains. We refer to this paradigm as **generalist reward modeling**. Moreover, effective **inference-time scalability** requires the RM (3) to generate higher-quality reward signals with increased inference compute, and (4) to learn scalable behaviors for better performance-compute scaling. Existing research on reward modeling demonstrates several paradigms for reward generation, including scalar (Cobbe et al., 2021; Wang et al., 2024e; Liu et al., 2024), semi-scalar (Ye et al., 2025a; Yu et al., 2025b; Zhang et al., 2025a), and generative (Li et al., 2024a; Kim et al., 2024; Vu et al., 2024; Cao et al., 2024; Arabzadeh et al., 2024; Ye et al., 2025b; Alexandru et al., 2025; Yu et al., 2025a) approaches, and various scoring patterns, such as pointwise (Kendall & Smith, 1940; Gao et al., 2023; Yuan et al., 2024; Winata et al., 2025; Guo et al., 2025) and pairwise (Park et al., 2024; Zheng et al., 2023; Jiang et al., 2023; Wang et al., 2024c; Liu et al., 2025). These approaches inherently determine the input flexibility and the inference-time scalability of RMs ((1)&(3)), as shown in Figure 2. For instance, pairwise RMs only consider the relative preference of paired responses, lacking flexibility to accept single or multiple responses as input; scalar RMs could hardly generate diverse reward signals for the same response, which obstructs getting better rewards through sampling-based inference-time scaling methods (Snell et al., 2025). Also, different learning methods (Wang et al., 2024a; Ankner et al., 2024; Wang et al., 2024c; Mahan et al., 2024) have been proposed to improve the quality of rewards, but few of them focus on inference-time scalability and study the interconnection between the learned reward generation behaviors and the effectiveness of inference-time scaling of RMs, resulting in marginal performance improvement ((2)&(4)). Current research (DeepSeek-AI, 2025) indicates that effective inference-time scalability could be enabled by proper learning methods, which raises the question: Can we design a learning method aiming to enable effective inference-time scaling for generalist reward modeling?

实践中, 要让 RM 既通用又能在推理时有效扩展, 会遇到几个难题. 通用性要求 (1) 能灵活处理不同类型的输入, (2) 在各个领域都能生成准确的奖励. 我们把这种范式称为**通用奖励建模**. 有效的 **TestingTime 可扩展性**则要求 RM (3) 推理算力增加时能生成质量更高的奖励信号, (4) 学到可扩展的行为, 使性能随算力的增长曲线更好. 现有奖励建模研究给出了几种奖励生成范式: 标量 (Cobbe et al., 2021; Wang et al., 2024e; Liu et al., 2024), 半标量 (Ye et al., 2025a; Yu et al., 2025b; Zhang et al., 2025a) 和生成式 (Li et al., 2024a; Kim et al., 2024; Vu et al., 2024; Cao et al., 2024; Arabzadeh et al., 2024; Ye et al., 2025b; Alexandru et al., 2025; Yu et al., 2025a); 以及几种打分模式, 如 pointwise (Kendall & Smith, 1940; Gao et al., 2023; Yuan et al., 2024; Winata et al., 2025; Guo et al., 2025) 和 pairwise (Park et al., 2024; Zheng et al., 2023; Jiang et al., 2023; Wang et al., 2024c; Liu et al., 2025). 如图 2 所示, 这些方法从根本上决定了 RM 的输入灵活性和 TestingTime 可扩展性 ((1)&(3)). 例如, pairwise RM 只考虑一对回答之间的相对偏好, 无法灵活地接受单个或多个回答作为输入; 标量 RM 很难对同一个回答生成不同的奖励信号, 这妨碍了用基于采样的 TestingTime 扩展方法 (Snell et al., 2025) 得到更好的奖励. 另外, 已有不少学习方法 (Wang et al., 2024a; Ankner et al., 2024; Wang et al., 2024c; Mahan et al., 2024) 被提出来提升奖励质量, 但很少有工作关注 TestingTime 可扩展性, 研究学到的奖励生成行为和 RM 的 TestingTime 扩展效果之间的联系, 结果性能提升有限 ((2)&(4)). 现有研究 (DeepSeek-AI, 2025) 表明, 合适的学习方法可以带来有效的 TestingTime 可扩展性, 这就引出一个问题: 能不能设计一种学习方法, 专门让通用奖励建模获得有效的 TestingTime 扩展?

In this work, we investigated different approaches for RM, and found that pointwise generative reward modeling (GRM) could unify the scoring of single, paired, and multiple responses within pure language representation, overcoming challenge (1). We explored that certain principles could guide reward generation within proper criteria for GRMs, improving the quality of rewards, which suggested that inference-time scalability of RM might be achieved by scaling the generation of high-quality principles and accurate critiques. Based on this preliminary, we propose a novel learning method, **Self-Principled Critique Tuning** (SPCT), to foster effective inference-time scalable behaviors in GRMs. By leveraging rulebased online RL, SPCT enables GRMs to learn to adaptively posit principles and critiques based on the input query and responses, leading to better outcome rewards in general domains (challenge (2)). We then come up with **DeepSeek-GRM-27B**, which is post-trained with SPCT based on Gemma-2-27B (Team, 2024). For inference-time scaling, we expand compute usage by sampling multiple times. By sampling in parallel, DeepSeek-GRM could generate different sets of principles and corresponding critiques, and then vote for the final reward. **With larger-scale sampling, DeepSeek-GRM could judge more accurately based on more diverse principles, and output rewards with finer granularity**, which resolves challenge (3)&(4). Furthermore, we train a meta RM in addition to voting for

<!-- page 3 of 44 -->

Preprint. Under review.

![Image block](./images/p03-figure-2-different-paradigms-for-reward-generation-including-a.jpg)

Figure 2: Different paradigms for reward generation, including (a) scalar, (b) semi-scalar, and (c) generative approaches, and different scoring patterns, including (i) pointwise and (ii) pairwise approaches. We list the representative methods for each approach, and corresponding inference-time scalability (whether better rewards could be obtained from multiple sampling) and input flexibility (whether supports rating single and multiple responses).

better scaling performance. Empirically, we show that SPCT significantly improves the quality and scalability of GRMs, outperforming existing methods and models in multiple comprehensive RM benchmarks without severe domain biases. We also compared the inference-time scaling performance of DeepSeek-GRM-27B with larger models up to 671B parameters, and found it could achieve better performance compared to training-time scaling on model sizes. Though the current method meets challenges in efficiency and specific tasks, with efforts beyond SPCT, we believe GRMs with enhanced scalability and efficiency could serve as a versatile interface for generalist reward systems, advancing the frontiers of LLM post-training and inference.

本工作考察了多种 RM 方法, 发现 pointwise 生成式奖励建模 (GRM) 能在纯语言表示内统一单个, 成对和多个回答的打分, 克服难题 (1). 我们还发现, 一定的原则可以把 GRM 的奖励生成约束在合适的标准之内, 提升奖励质量; 这提示 RM 的 TestingTime 可扩展性也许可以通过扩大高质量原则和准确评语的生成来实现. 在这一初步结论的基础上, 我们提出一种新的学习方法: **自原则评语微调** (SPCT), 在 GRM 中培养有效的 TestingTime 可扩展行为. SPCT 借助基于规则的在线 RL, 让 GRM 学会根据输入的查询和回答自适应地提出原则和评语, 在通用领域得到更好的结果奖励 (难题 (2)). 我们由此得到 **DeepSeek-GRM-27B**, 它基于 Gemma-2-27B (Team, 2024) 用 SPCT 后训练得到. 在 TestingTime 扩展上, 我们通过多次采样增加算力投入. 并行采样时, DeepSeek-GRM 能生成多组不同的原则和对应的评语, 再对最终奖励投票. **采样规模越大, DeepSeek-GRM 依据的原则越多样, 判断越准确, 输出的奖励粒度也越细**, 这解决了难题 (3)&(4). 此外, 在投票之外我们还训练了一个 meta RM, 进一步提升扩展表现. 实验表明, SPCT 显著提升了 GRM 的质量和可扩展性, 在多个综合 RM 基准上超过现有方法和模型, 没有严重的领域偏差. 我们还把 DeepSeek-GRM-27B 的 TestingTime 扩展表现与参数量最高 671B 的更大模型做了比较, 发现它可以好于训练侧扩大模型规模. 当前方法在效率和特定任务上仍有困难, 但我们相信, 在 SPCT 之外继续努力, 可扩展性和效率都更强的 GRM 可以成为通用奖励系统的通用接口, 推进 LLM 后训练和推理的前沿.

In general, our main contributions are as follows.

总的来说, 我们的主要贡献如下.

1. We propose a novel approach, **Self-Principled Critique Tuning** (SPCT), to foster effective inference-time scalability for generalist reward modeling, resulting in **DeepSeek-GRM** models. And we further introduce a meta RM to effectively improve the inference-time scaling performance of DeepSeek-GRM beyond voting.

1. 我们提出一种新方法: **自原则评语微调** (SPCT), 为通用奖励建模培养有效的 TestingTime 可扩展性, 由此得到 **DeepSeek-GRM** 系列模型. 我们还引入 meta RM, 在投票之外进一步有效提升 DeepSeek-GRM 的 TestingTime 扩展表现.

2. We empirically show SPCT significantly improves the quality and inference-time scalability of GRMs over existing methods and several strong public models.

2. 实验表明, 相比现有方法和几个强的公开模型, SPCT 显著提升了 GRM 的质量和 TestingTime 可扩展性.

3. We also applied the SPCT training schedule to LLMs with larger sizes and found that inference-time scaling could outperform model size scaling in training time.

3. 我们还把 SPCT 的训练流程用到更大的 LLM 上, 发现 TestingTime 扩展可以好于训练侧扩大模型规模.

## 2 Preliminaries · 预备知识

## 2.1 Comparisons of Different RM approaches · 不同 RM 方法的比较

As shown in Figure 2, RM approaches are mainly determined by reward generation paradigms and scoring patterns, which inherently affect the inference-time scalability and the input flexibility of the RM. For **reward generation paradigms**, we distinguish three main approaches: scalar, semi-scalar, and generative. For **scoring patterns**, we distinguish two main approaches: pointwise and pairwise. To expand compute usage in inference time, we focus on sampling-based methods, which generate multiple sets of rewards for the same query and responses, and then aggregate the final reward. Thus, the inference-time scalability of RMs is determined by whether different rewards could be obtained from multiple sampling, where scalar RMs would fail in most cases due to the invariant generation of rewards; and the input flexibility is defined by whether the RM supports rating single, paired, and

<!-- page 4 of 44 -->

Preprint. Under review.

multiple responses, where pairwise RMs could hardly rate single responses and usually require extra techniques (Jiang et al., 2023; Liu et al., 2025) to handle multiple responses.

如图 2 所示, RM 方法主要由奖励生成范式和打分模式决定, 二者从根本…43087 tokens truncated…timent and voulume of discussion analysis, On-Chain analysis, time series analysis and technical analysis, You will decide which cryptocurrencies is the best to invest. Then show me the best 5 coins that met the all of the conditions. Then show me the real time price of each coin. Then calculate the weekly support and resistance. Then show the best price to buy, for each coin. Then show me the target price. Then insert all of the above in a table and show it to me.Assistant: Based on the given criteria, here are the top 5 relatively obscure coins with potential for significant growth for short-term and mid-term investment. Please note that these recommendations should not be considered as financial advice, and are subject to change.\| Coin \| Real-time Price \| Weekly Support \| Weekly Resistance \| Best Price to Buy \| Target Price \|\|——\|——\|——\|——\|——\|——\|——\|\|XTZ (Tezos) \| $0.70 \| $0.65 \| $0.80 \| $0.68 \| $1.2 \|\| REN (Ren) \| $0.40 \| $0.35 \| $0.48 \| $0.38 \| $0.72 \|\| LRC (Loopring) \| $0.08 \| $0.07 \| $0.10 \| $0.075 \| $0.14 \|\| OCEAN (Ocean Protocol) \| $0.32 \| $0.28 \| $0.38 \| $0.305 \| $0.52 \|\| ZRX (0x) \| $0.96 \| $0.89 \| $1.10 \| $0.94 \| $1.5 \|Please note that the real-time prices mentioned above will change according to the current market rate. It is vital to conduct your due diligence and re-evaluate the investments regularly. The target prices mentioned are speculative estimates based on assessed potential growth and technical analysis. Always exercise caution and consult a financial advisor before making any investment decisions.User: The real time prices aren't correct. |
| --- | --- |
| Response 1 | I apologize for the misunderstanding, as I do not have real-time data access to provide current cryptocurrency prices or market conditions. However, I can guide you on how to find this information and analyze it.\\nTo identify potential investment opportunities in cryptocurrencies priced under $1, you can follow these steps:\\n1. **Use CoinGecko or CoinMarketCap**: These platforms allow you to filter cryptocurrencies by price, market cap, and trading volume. You can set the price filter to under $1.\\n2. **Fundamental Analysis**: Look for coins with strong fundamentals, such as:\\n - Active development teams\\n - Real-world use cases\\n - Partnerships and collaborations\\n - Community support and engagement\\n3. **News and Sentiment Analysis**: Use tools like Google Trends, Twitter, and Reddit to gauge the sentiment around specific coins. Positive news can drive short-term price increases.\\n4. **On-Chain Analysis**: Examine metrics like transaction volume, active addresses, and network growth to assess the health of the blockchain.\\n5. **Technical Analysis**: Use charting tools to identify support and resistance levels, trends, and potential entry and exit points.\\n6. **Volume of Discussion**: Monitor forums and social media platforms to see which coins are being discussed frequently, as this can indicate growing interest.\\nOnce you gather this information, you can create a table similar to the one I provided earlier, but with accurate real-time data.\\nIf you need help with specific analysis techniques or tools, feel free to ask! |

<!-- page 40 of 44 -->

Preprint. Under review.

| Response 2 | I apologize for any confusion in the real-time prices mentioned in the previous response. It is quite challenging to ensure real-time accuracy due to the rapidly changing nature of cryptocurrency prices. Here are the updated real-time prices at the time of this response.\\n \| Coin \| Real-time Price \|\|--\|------\|\| XTZ (Tezos) \| $0.63 \| \| REN (Ren) \| $0.36 \| \| LRC (Loopring) \| $0.08 \| \| OCEAN (Ocean Protocol) \| $0.29 \| \| ZRX (0x) \| $0.93 \|\\n To obtain accurate real-time prices, I recommend using reliable cryptocur-rency tracking websites such as CoinGecko, CoinMarketCap, or Binance. Please note that the table containing other information provided earlier stands, as it is not dependent on real-time prices.\\n Keep in mind that investing in cryptocurrencies always carries risk, and it's essential to do your own research, consider your investment strategy, and exercise cautionbefore making investment decisions. Always consult a financial advisor for professional guidance. |
| --- | --- |
| DeepSeek-GRM- | Specific Criteria: |
| 27B Result | - Real-time Price Accuracy (Weight: 30%): The response must provide accurate real-time prices for the listed coins. - Guidance on Analysis Techniques (Weight: 20%): The response should offer clear guidance on how to conduct the required analyses. - Table Update (Weight: 15%): The response should update the table with the correct real-time prices. - Risk Disclosure (Weight: 10%): The response should include a clear disclaimer about the risks of investing in cryptocurrencies. - Resource Recommendations (Weight: 10%): The response should recommend reliable resources for obtaining real-time data. - Clarity and Structure (Weight: 15%): The response should be clear, well-structured, and easy to follow. Analysis: - **Response 1**: This response acknowledges the lack of real-time data access and provides a comprehensive guide on how to find and analyze cryptocurrency data. It scores well on Guidance on Analysis Techniques and Clarity and Structure but lacks in Real-time Price Accuracy and Table Update. It includes a Risk Disclosure and Resource Recommendations. - **Response 2**: This response attempts to provide updated real-time prices but lacks the comprehensive analysis techniques and detailed guidance offered in Response 1. It scores well on Real-time Price Accuracy and Table Update but poorly on Guidance on Analysis Techniques and Clarity and Structure. It includes a Risk Disclosure and Resource Recommendations. Scores: \\boxed{7, 5} |
| Ground Truth | Response 2 is better than Response 1. |

## F.2 Failure Mode Analysis · 失败模式分析

We randomly sampled 10 incorrect data points from test results of DeepSeek-GRM-27B on each benchmark and summarize the failure modes in Figure 8. Analysis of the failure cases indicates that the challenge lies mainly in the incapability of the model to judge responses that are too complex or within specific domains, such as pattern matching, counting, etc., and the lack of expert knowledge, resulting in incorrect critiques. Although the principles

<!-- page 41 of 44 -->

Preprint. Under review.

![Image block](./images/p41-figure-8-the-distributions-of-failure-modes-of-deepseek.jpg)

Figure 8: The distributions of failure modes of DeepSeek-GRM-27B on different RM benchmarks. We manually examined and categorized the modes into four classes. “Annotation Contradicting the Ground Truth” represents the preference label provided in the benchmark is disagreed by the annotator.

are correctly generated in most cases, the weights assigned by the model for each principle affect the generation of rewards and sometimes cause incorrect results. However, we also found that the ground truths of a few data points in the RM benchmarks are inconsistent with the preference of the human annotator, probably because of the bias from this smallscale human annotation study or potential mistakes in ground truth labeling.

我们在每个基准上从 DeepSeek-GRM-27B 的测试结果中随机抽取 10 个错误数据点, 把失败模式汇总在图 8. 对失败案例的分析表明, 难点主要在于模型无法判断过于复杂或属于特定领域 (如模式匹配, 计数等) 的回答, 以及缺乏专业知识, 从而写出错误的评语. 虽然多数情况下原则生成得正确, 但模型给每条原则分配的权重会影响奖励的生成, 有时导致错误结果. 不过我们也发现, RM 基准中有少数数据点的真值与人工标注者的偏好不一致, 可能来自这次小规模人工标注研究的偏差, 也可能是真值标注本身有误.

## G Prompt Templates · 提示模板

We demonstrate the prompt templates used for DeepSeek-GRM, for DeepSeek-GRM with a single response during training, for the meta-RM, and for LLM-as-a-Judge below. For prompt engineering, we design a few example principles for both in-context learning and basic critique guidance. We use a plainer template for the meta RM to ensure the query, responses, and the generated principles and critiques could fit in the context window. After assembling with the template of the meta RM, we further enclose the content with chat templates designed for DeepSeek-V3-1226 (DeepSeek-AI, 2024b) before input.

下面给出所用的提示模板: DeepSeek-GRM 的模板, 训练时 DeepSeek-GRM 给单个回答打分的模板, meta RM 的模板, 以及 LLM-as-a-Judge 的模板. 提示工程上, 我们设计了几条示例原则, 既用于上下文学习, 也作为基本的评语引导. meta RM 用的模板更简洁, 保证查询, 回答以及生成的原则和评语能放进上下文窗口. 套用 meta RM 的模板后, 我们还会再用为 DeepSeek-V3-1226 (DeepSeek-AI, 2024b) 设计的对话模板把内容包起来, 再输入模型.

以下模板是引用样本, 保留原文.

## DeepSeek-GRM (Default) · 默认模板

You are a skilled little expert at scoring responses. You should evaluate given responses based on the given judging criteria.\n Given the context of the conversation (the last round is the User’s query) and multiple responses from the Assistant, you need to refer to the [General Evaluation Criteria] to score the responses. Based on the general evaluation criteria, state potential other specific criteria to the query, the weights of different criteria, and then provide an overall comprehensive score upon them.\n Each score is an integer between 1 and 10, with a higher score indicating that the response meets the relevant criteria more closely. For example, a score of 1 means the response does not meet the criteria at all, a score of 6 means the response meets only some parts, and a score of 10 means the response perfectly meets the evaluation criteria.\n Before scoring, please analyze step by step. Your scoring needs to be as strict as possible.

## \#### Evaluation Criteria ####

1. Instruction Adherence:\n - Fully Adhered (9-10 points): The response fully complies with all instructions and requirements of the question.\n - Partially Adhered (6-8 points): The response meets most of the instructions but has some omissions or misunderstandings.\n - Basically Adhered (3-5 points): The response meets some instructions, but the main requirements are not fulfilled.\n - Not Adhered (1-2 points): The response does not meet any instructions.\n Example: If the question requires three examples and the response provides only one, it falls under “Partially Adhered.”

2. Usefulness:\n - Highly Useful (9-10 points): The response provides comprehensive and

<!-- page 42 of 44 -->

Preprint. Under review.

accurate information, fully addressing the issue.\n - Useful but Incomplete (6-8 points): The response provides some useful information, but lacks details or accuracy.\n - Limited Usefulness (3-5 points): The response offers little useful information, with most content being irrelevant or incorrect.\n - Useless or Incorrect (1-2 points): The response is completely irrelevant or incorrect.\n Example: If there are factual errors in the response but the overall direction is correct, it falls under “Useful but Incomplete.”

3. Level of Detail:\n - Very Detailed (9-10 points): The response includes ample details covering all aspects of the issue.\n - Detailed but Slightly Lacking (6-8 points): The response is fairly detailed but misses some important details.\n - Basically Detailed (3-5 points): The response provides some details but is not thorough enough overall.\n - Not Detailed (1-2 points): The response is very brief and lacks necessary details.\n Example: If the response provides only a simple conclusion without an explanation, it falls under “Not Detailed.”

4. Relevance:\n - Highly Relevant (9-10 points): The response is highly relevant to the question, with information closely aligned with the topic.\n - Generally Relevant (6-8 points): The response is generally relevant but includes some unnecessary information.\n - Partially Relevant (3-5 points): The response has a lot of content that deviates from the topic.\n - Not Relevant (1-2 points): The response is completely irrelevant.\n Example: If the response strays from the topic but still provides some relevant information, it falls under “Partially Relevant.”

\#### Conversation Context ####\n{conversation context & query}\n

\#### Responses to be Scored ####

[The Begin of Response i]\n{the i-th response}\n[The End of Response i]\n

\#### Output Format Requirements ####

## Output with three lines

Specific Criteria: &lt;Other potential criteria specific to the query and the context, and the weights of each criteria&gt;.

Analysis: &lt;Compare different responses based on given Criteria&gt;.

Scores: &lt;the overall comprehensive score of all responses in order, separate by comma in the boxed, e.g., \boxed{x, x} if there exists 2 responeses&gt;.

## DeepSeek-GRM (Training on Rating Single Response) · 训练时给单个回答打分的模板

You are a skilled little expert at scoring responses. You should evaluate given responses based on the given judging criteria.\nGiven the context of the conversation (the last round is the User’s query) and multiple responses from the Assistant, you need to refer to the [General Evaluation Criteria] to score the responses. Based on the general evaluation criteria, state potential other specific criteria to the query, the weights of different criteria, and then provide an overall comprehensive score upon them. The score is 0 or 1, with 1 indicating that the response is correct.\nBefore scoring, please analyze step by step. Your scoring needs to be as strict as possible.

## \#### Evaluation Criteria ####

1. Instruction Adherence:\n - Fully Adhered: The response fully complies with all instructions and requirements of the question.\n - Partially Adhered: The response meets most of the instructions but has some omissions or misunderstandings.\n - Basically Adhered: The response meets some instructions, but the main requirements are not fulfilled.\n - Not Adhered: The response does not meet any instructions.\n Example: If the question requires three examples and the response provides only one, it falls under “Partially Adhered.”

2. Clarity:\n - Very Clear: The response is fluent, well-structured, and logically clear.\n - Clear but Minor Issues: The response is mostly clear but has some minor language or structural issues.\n - Basically Clear: The response has noticeable language or logic issues but is still understandable.\n - Not Clear: The response is disjointed, illogical, and hard to understand.\n Example: If the response has complex sentence structures and lacks punctuation, it falls under “Basically Clear” or “Not Clear.”

3. Accuracy:\n - Completely Accurate: All information and data are completely accurate.\n - Mostly Accurate: Most information is accurate, with minor errors.\n - Some Errors: There are some noticeable errors affecting comprehension.\n - Mostly Incorrect: There are numerous errors seriously affecting the credibility of the information.\n Example: If a specific data point is incorrectly cited but doesn’t affect the overall conclusion, it falls under “Mostly Accurate.”

\#### Conversation Context ####\n{conversation context & query}\n

<!-- page 43 of 44 -->

Preprint. Under review.

## \#### Responses to be Scored ####

[The Begin of Response]\n{the response}\n[The End of Response]\n #### Output Format Requirements ####

Specific Criteria: &lt;Other potential criteria specific to the query and the context, and the weights of each criteria&gt;. Analysis: &lt;Compare different responses based on given Criteria&gt;. Scores: &lt;the overall comprehensive score of the response, e.g., \boxed{x}&gt;.

## Meta RM · meta RM 模板

## Prompt:

Please score the responses.

\#### Conversation Context ####\n{conversation context & query}\n #### Responses to be Scored #### [The Begin of Response i]\n{the i-th response}\n[The End of Response i]\n

## Response:

{principle & critique}

## LLM-as-a-Judge · LLM-as-a-Judge 模板

You are a skilled little expert at scoring responses. You should evaluate given responses based on the given judging criteria.\nGiven the context of the conversation (the last round is the User’s query) and multiple responses from the Assistant, you need to refer to the [General Evaluation Criteria] to score the responses. Based on the general evaluation criteria, state potential other specific criteria to the query, the weights of different criteria, and then select the best response among all candidates.\nBefore judging, please analyze step by step. Your judgement needs to be as strict as possible.

## \#### Evaluation Criteria ####

1. Instruction Adherence:\n - Fully Adhered: The response fully complies with all instructions and requirements of the question.\n - Partially Adhered: The response meets most of the instructions but has some omissions or misunderstandings.\n - Basically Adhered: The response meets some instructions, but the main requirements are not fulfilled.\n - Not Adhered: The response does not meet any instructions.\n Example: If the question requires three examples and the response provides only one, it falls under “Partially Adhered.”

2. Usefulness:\n - Highly Useful: The response provides comprehensive and accurate information, fully addressing the issue.\n - Useful but Incomplete: The response provides some useful information, but lacks details or accuracy.\n - Limited Usefulness: The response offers little useful information, with most content being irrelevant or incorrect.\n - Useless or Incorrect: The response is completely irrelevant or incorrect.\n Example: If there are factual errors in the response but the overall direction is correct, it falls under “Useful but Incomplete.” 3. Level of Detail:\n - Very Detailed: The response includes ample details covering all aspects of the issue.\n - Detailed but Slightly Lacking: The response is fairly detailed but misses some important details.\n - Basically Detailed: The response provides some details but is not thorough enough overall.\n - Not Detailed: The response is very brief and lacks necessary details.\n Example: If the response provides only a simple conclusion without an explanation, it falls under “Not Detailed.”

4. Relevance:\n - Highly Relevant: The response is highly relevant to the question, with information closely aligned with the topic.\n - Generally Relevant: The response is generally relevant but includes some unnecessary information.\n - Partially Relevant: The response has a lot of content that deviates from the topic.\n - Not Relevant: The response is completely irrelevant.\n Example: If the response strays from the topic but still provides some relevant information, it falls under “Partially Relevant.”

\#### Conversation Context ####\n{conversation context & query}\n

\#### Responses to be Scored ####

[The Begin of Response]\n{the response}\n[The End of Response]\n

<!-- page 44 of 44 -->

Preprint. Under review.

## \#### Output Format Requirements ####

Specific Criteria: &lt;Other potential criteria specific to the query and the context, and the weights of each criteria&gt;

Analysis: &lt;Compare different responses based on given Criteria&gt;.

Scores: &lt;the index of the best response based on the judgement, in the format of \boxed{x}&gt;.
