---
title: "02 · DeepSeekMath: 从网页里挖数学语料, 再用 GRPO 把答题分布拧稳"
category: "模型技术报告"
tags: ["DeepSeek", "技术解析"]
published: true
excerpt: "DeepSeekMath 常被记成「GRPO 的出处」, 但按投入和收益看, 这篇报告的主体是数据."
---
# DeepSeekMath: 从网页里挖数学语料, 再用 GRPO 把答题分布拧稳

来源: [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300) (arXiv: 2402.03300v3, 2024-04-27). 仓库: https://github.com/deepseek-ai/DeepSeek-Math

DeepSeekMath 常被记成「GRPO 的出处」, 但按投入和收益看, 这篇报告的主体是数据. 一个 7B 模型在竞赛级 MATH 上压过 Minerva 540B, 靠的是从 Common Crawl 里迭代召回的约 120B 数学 token, 加上从代码模型出发的初始化; SFT 和 RL 是在这个底座上再加两截. GRPO 在报告里只占一节, 设计动机也很朴素: 省掉 PPO 的 critic. 它后来成为 V2, V3, R1 共同的 RL 算法, 这是谱系上的意外收获. 下面按「数据怎么来, 底座怎么选, 后训练改变了什么」来读, 算法放在它实际所处的位置上.

## 1. 问题与语料

### 1.1. 问题设定: 7B 能不能靠数据追上 540B

2024 年初的格局是: 闭源的 GPT-4, Gemini Ultra 在 MATH 上约 53%, 开源最好的数学模型(Llemma, WizardMath, MetaMath 一类)停在 20% 到 30% 多. 此前的主流做法是在大底座上继续训数学文本, 数学文本主要来自 arXiv 和证明仓库, 比如 Minerva 在 540B 的 PaLM 上续训, Llemma 在 Proof-Pile-2 上续训. DeepSeek 的问题是反过来的: 不加参数, 只改数据, 7B 能走多远.

整体路径分三段. 预训练: 从 **DeepSeek-Coder-Base-v1.5 7B** 出发续训 500B token, 主料是新挖的 DeepSeekMath Corpus. SFT: 776K 条数学指令, 覆盖 CoT, program-of-thought 和工具集成三种解法. RL: 用 **GRPO** 只在 GSM8K 和 MATH 的 CoT 题上训. 最终 DeepSeekMath-RL 7B 在不用工具, 不投票的设定下 MATH 51.7%, 64 条样本 self-consistency 到 60.9%. 分数的来源可以大致拆开: Base 已经到 MATH 36.2%, SFT 推到 46.8%, RL 再加 4.9 个点. 三段里数据和 SFT 贡献了大头, 这是读后文时需要记住的比例感.

### 1.2. 语料流水: fastText 召回, 按域补种子, 四轮收敛

数据流水的思路是「用分类器在全网召回, 用人工标注补盲区」. 第一轮以 OpenWebMath 为种子: 抽 50 万正例, 再从 Common Crawl 抽 50 万负例, 训一个 **fastText** 分类器(向量维 256, 学习率 0.1, 词 n-gram 最长 3, 最小词频 3, 训 3 epoch). Common Crawl 先做 URL 去重和近似去重, 剩约 400 亿个 HTML 页, 分类器给每页打分, 按分数排序截断. 保留多少不靠拍脑袋: 他们在 top 40B, 80B, 120B, 160B token 上分别做预训练实验, 首轮只留 top 40B.

分类器召回的弱点是只认得像种子的东西. 种子多样性不够, 很多数学页就召不回来. 补救办法是按 base URL 把 Common Crawl 切成互不相交的域, 某个域里已收集页的占比超过 10%, 就把整个域标成数学相关(报告的例子是 mathoverflow.net), 再人工标出域内哪些 URL 路径是数学内容(比如 `/questions`), 把还没收进来的对应页面并进种子, 重训分类器. 人工只标「域和路径」这一层, 不逐页标注, 人工投入被分类器放大到整个 Common Crawl. 四轮之后得到约 **3550 万**页, 120B token; 第四轮收集的数据约 98% 在第三轮已经出现, 于是停止.

选择 fastText 主要受规模约束. 约 400 亿个页面需要逐一打分, 单页分类成本必须足够低; fastText 是基于词 n-gram 的线性模型, CPU 即可完成全量推理. 它只看词面特征, 很难区分「讲数学」和「提到数学」, 所以还需要排序截断和预训练实验来控制质量. 后来的网页过滤流水常用大模型生成标签、再由小分类器推理, 延续了同样的两级结构, 只是提高了打标模型的表达能力.

去污染按 Coder 报告的规则: 与 GSM8K, MATH, CMATH, AGIEval 等评测集有完全相同 10-gram 的文本剔除; 测试文本短于 10-gram 但至少 3-gram 的, 用精确匹配过滤. 这套流水社区常拿来和 OpenWebMath, FineWeb-Edu 一类「分类器过滤网页」的做法放在一起讨论. 区别在于 DeepSeek 多了**按域回补**这一步, 专门对付分类器召回偏窄的问题. 报告自己也说同样的流水能套到代码等其他领域. 分类器阈值, 每轮具体召回多少页, 人工标了多少个域, 报告没有给.

### 1.3. 语料质量怎么证明: 1.3B 上的对照实验

有了语料, 还要证明它比现有数学语料好, 而不只是大. 验证用 DeepSeek-LLM 1.3B, 在每份语料上各训 150B token, 用 few-shot CoT 测八个中英基准. 对照组是 MathPile(8.9B token, 超过 85% 来自 arXiv), OpenWebMath(13.6B), Proof-Pile-2(51.9B, 按 arXiv:Web:Code = 2:4:1 混). 训练超参对齐 DeepSeek LLM: 峰值学习率 5.3e-4, batch 4M token, 上下文 4K, 这样语料差异不会和优化差异混在一起. 结果(Table 1): DeepSeekMath Corpus 在 GSM8K 23.8%, MATH 13.6%, SAT 56.3%, CMATH 41.5% 等项全面领先.

两个细节比最终分数更有说服力. 一是 Figure 3 的学习曲线: 训到约 50B token, 也就是 Proof-Pile-2 刚好过一轮时, DeepSeekMath Corpus 的曲线已经在上方, 说明优势来自平均质量, 不全是规模(读图). 规模也有作用: 小语料很快多轮重复, 曲线走平, 120B 级语料的曲线更陡, 涨得更久. 二是中文: 已有数学语料以英文为主, 在中文基准上提升有限甚至倒退; DeepSeekMath Corpus 中英都有, 两边一起涨. 这和 DeepSeek LLM 的双语路线一脉相承, 也解释了后面 CMATH, 高考题上的大幅领先. 需要注意, 1.3B 实验只用来比较语料排序, 绝对分数不能外推到 7B.

Table 1 还有一行容易被忽略的基线: 不做数学训练的 1.3B, GSM8K 2.9%, CMATH 12.3%, 高考选择 17.9%. MathPile 训完, CMATH 掉到 1.2%, 高考选择掉到 2.8%, 比不训还差, 这就是正文说的「已有语料可能伤害中文数学」. 这组对照还混着一个变量: 每份语料都训 150B token, MathPile 8.9B 要重复约 17 轮, OpenWebMath 约 11 轮, Proof-Pile-2 约 3 轮, DeepSeekMath Corpus 约 1.25 轮. 小语料的分数一部分输在反复重复上. Figure 3 比较了训练到 50B token 时的结果, 此时 Proof-Pile-2 刚好一轮, 但 MathPile 和 OpenWebMath 已经重复多轮, 仍然不是严格的等轮次对照.

### 1.4. 为什么从代码模型出发, 以及 arXiv 为什么不灵

Base 模型不从 DeepSeek LLM 7B 出发, 而从 **DeepSeek-Coder-Base-v1.5 7B** 出发, 这个选择在讨论节有消融支撑. 在 1.3B 上比较两阶段训练(Table 6, Table 7): 「代码 400B 再数学 150B」相对「通用 400B 再数学 150B」, 不用工具的 GSM8K, MATH, CMATH 和用 Python 的 GSM8K, MATH 都更好. 只训代码的第一阶段, 就已经把 GSM8K+Python 从接近零抬到 12.4%, MATH+Python 到 10.0%. 把 400B 代码和 150B 数学一次混训, 能保住代码能力(HumanEval 29.3%, MBPP 39.4%), 两阶段则会把代码能力冲掉, 但混训的无工具数学略逊于先代码后数学. 报告猜测是 1.3B 容量有限, 同时吃不下两种数据.

这组消融直接决定了 500B 续训的配比: DeepSeekMath Corpus 56%, AlgebraicStack 4%, arXiv 10%, GitHub 代码 20%, 中英 Common Crawl 自然语言 10%. 代码占两成, 就是为了不让代码能力在数学续训中流失. 训练超参沿用 DeepSeek LLM 的 multi-step 调度, 峰值学习率改成 4.2e-4, batch 10M token, 上下文 4K. 用来初始化的是 Coder 学习率衰减之前的 checkpoint. 「代码能不能提升推理」在社区里争论了很久, 这张表至少在数学域给了一个部分肯定的回答, 而且区分了用工具和不用工具两种情况.

这些消融有两个适用边界. 第一, 讨论节的预训练实验使用第二轮收集的 89B token 版本, 结论并非来自最终的 120B 语料. 第二, 代码先验的证据全部来自 1.3B, 7B 主实验直接采用该结论, 没有重做「从通用模型出发」的对照. 1.3B 的消融与 7B 的最终成绩方向一致, 但无法证明 Coder 起点在 7B 上仍然占优. 这种「小模型消融, 大模型沿用」的做法在家族后续报告里也很常见, V3 的 MTP 和负载均衡消融同样先在小档上完成.

arXiv 的消融方向相反(Table 8, Table 9). MathPile 和 ArXiv-RedPajama 分别在 1.3B(各 150B token)和 Coder-v1.5 7B(各 40B token)上单独训练, GSM8K, MATH, OCW, SAT, MMLU-STEM, CMATH, 高考题几乎没有提升, 部分变差; miniF2F 上的非形式到形式证明也下降. 报告列了三条没测的边界: 对定理非形式化这类任务的影响, 和其他数据混合时的效果, 更大模型上是否会显现收益. 主配比仍保留 10% arXiv, 可以看作习惯和保险, 不能反过来当作 arXiv 有效的证据. 这组结果在当时有点反直觉, 因为 Minerva, Llemma 都把 arXiv 当主料, 社区后来讨论这篇时, 「网页数学胜过论文」是被引用最多的结论之一.

## 2. Base 与 SFT

### 2.1. Base 7B 的成绩, 以及它说明了什么

不用工具的逐步推理(Table 2): DeepSeekMath-Base 7B 在 GSM8K 64.2%, MATH 36.2%, OCW 15.4%, SAT 84.4%, MMLU-STEM 56.5%, CMATH 71.7%, 高考数学填空 20.3%, 选择 35.3%. 八项都高于同期开源 base, 包括通用的 Mistral 7B 和在 Proof-Pile-2 上训过的 Llemma 7B, 34B; MATH 上相对开源 base 领先 10 个点以上, 也超过了约大 77 倍的 Minerva 540B. 用 Python 解题(Table 3): GSM8K 66.9%, MATH 31.4%. 形式数学用 informal-to-formal 流程, 先 few-shot 生成 Isabelle 证明草稿, 再交给 Sledgehammer 补全, miniF2F 验证集和测试集分别为 25.8% 和 24.6%.

和 Minerva 的对比要看清口径. Table 2 里 Minerva 的数字引自原论文, 不是 DeepSeek 自己跑的: Minerva 540B 的 GSM8K 58.8%, MATH 33.6%, OCW 17.6%, MMLU-STEM 63.9%. DeepSeekMath-Base 在 GSM8K 和 MATH 上更高, OCW 和 MMLU-STEM 上仍低于 540B. 所以「7B 超过 540B」成立的范围是竞赛级和小学应用题这两项, 在大学课程题和多学科选择题上还没追上. 评测全部用 few-shot CoT, 八个基准覆盖从小学应用题到大学水平, 既有自由作答(GSM8K, MATH, CMATH)也有选择题(MMLU-STEM, 高考 MathQA). 形式证明那一项则是给定非形式陈述, 形式陈述和非形式证明, 让模型写 Isabelle 证明草稿, 缺的细节交给 Sledgehammer, 考的是「把人写的证明翻成机器能查的证明」.

Table 3 的两组对照采用不同口径. 工具解题使用 few-shot program-of-thought: 模型生成可调用 `math` 和 `sympy` 的 Python 程序, 以执行结果作答. DeepSeekMath-Base 7B 的 66.9% 和 31.4% 高于 Llemma 34B(64.6%, 26.3%)、CodeLlama 34B(52.7%, 23.5%), 同尺寸 CodeLlama 7B 则为 27.1% 和 17.2%, 说明代码能力仍需数学语料配合. 形式证明一栏的模型差距较小, 最好的 Llemma 约为 21% 到 22%, DeepSeekMath 高 3 到 4 个点; Sledgehammer 为所有模型补全细节, 会压缩模型间差距. 训练预算可粗略换算为 500B token 除以每批 10M token, 即约 5 万步; 报告没有 GPU 小时, 无法继续计算硬件成本.

通用能力是否被数学续训挤掉, 看 Table 4. 比较的基准是用来初始化的那个衰减前 checkpoint(MMLU 42.9%, BBH 42.9%, HumanEval 40.2%, MBPP 52.6%). Math-Base 的 MMLU 和 BBH 升到 54.9% 和 59.5%, HumanEval 40.9%, MBPP 52.6%, 代码能力基本保住; 但和训完整的 Coder-Base-v1.5(HumanEval 43.2%, MBPP 60.4%)比还是低一些, MMLU 也仍低于 Mistral 7B 的 62.4%. 这组对照把「专用模型必然偏科」这个担心压了下去, 数学训练甚至抬高了语言理解和推理, 至少在 7B 规模和这套配比上成立. 更重要的是它说明了一件事: 在当时的设定下, 数学能力的上限主要由预训练数据决定, 参数量排在后面. 这个判断后来在 Prover 系列上继续使用, Prover 和 Prover-V1.5 都以 DeepSeekMath-Base 为起点.

### 2.2. SFT: 同一道题给三种写法

指令数据 776K 条. 英文部分给 GSM8K 和 MATH 标注工具集成解法, 并收入 MathInstruct 子集和 Lila-OOD 训练集中用 CoT 或 PoT 解的题, 覆盖代数, 概率, 数论, 微积分, 几何. 中文部分是 K-12 数学, 横跨 76 个子主题, 同一道题同时标 CoT 和工具集成两种格式. 训练设定很朴素: 样本拼接到 4K token, 500 step, batch 256, 学习率恒定 5e-5. 这里没有新方法, 价值在于同一道题允许走多条解题通道: 写步骤, 写程序, 或者在自然语言和工具之间切换. SFT 的总量不大: 500 步 × 256 条 × 4K token, 约 5.2 亿 token; 776K 条样本如果都过一遍, 平均每条约 670 token, 报告没给 epoch 数. 和 500B 的续训相比, SFT 只占千分之一, 却贡献了 10 个点的 MATH, 这和 DeepSeek LLM 里「SFT 教格式和解法通道, 知识在预训练里」的判断一致.

Table 5 要分两栏读, 灰格是 32 候选多数票, 其余是 Top1. 不用工具时, DeepSeekMath-Instruct 7B 在 GSM8K 82.9%, MATH 46.8%, MGSM-zh 73.2%, CMATH 84.6%, 高于 Qwen 72B, MetaMath 70B, DeepSeek-LLM-Chat 67B, 以及做过过程监督 PPO 的 Math-Shepherd-Mistral 7B(MATH 33.0%). MATH 仍低于 GPT-4 的 52.9% 和 Gemini Ultra 的 53.2%. 允许用工具时 Instruct 的 MATH 到 57.4%, 超过所有开源对照, 离 GPT-4 Code Interpreter 的 69.7% 还有距离. 从 Base 的 36.2% 到 Instruct 的 46.8%, SFT 一步就涨了 10 个点, 比后面 RL 的增量大一倍.

放回家族里看更清楚. 一个月前的 DeepSeek LLM 67B Chat 在附录里用工具集成推理拿到 MATH 51.1%, 纯 CoT 是 32.6%. 现在 7B 的 Instruct 纯 CoT 就到 46.8%, 用工具到 57.4%, 参数小了近十倍, 两种设定都更高. 67B 的 SFT 数据里数学占近一半, 但预训练阶段没有专门的数学语料; 7B 这边预训练吃了 120B 数学 token, SFT 同时教三种解法. 两边的差距几乎全部可以归到预训练数据上, 这正是 DeepSeek LLM 报告里「要全面提升数学, 得在预训练阶段加数据」那句话的兑现.

## 3. GRPO 与 RL

### 3.1. GRPO: 用同题多答的均值替掉 critic

PPO 在 LLM 上的负担主要来自 critic. 价值网络和策略差不多大, 显存和算力翻倍; 而奖励通常只打在末尾一个 token 上, 要训出一个每个 token 都准的价值函数也不容易. **GRPO** 的做法是对同一道题 $q$ 从旧策略采一组输出 $\{o_1,\ldots,o_G\}$, 用组内奖励的均值当基线, 不再学价值函数(式 3, Figure 4):

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)=\mathbb{E}\,\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\left\{\min\left[\rho_{i,t}\hat A_{i,t},\ \mathrm{clip}(\rho_{i,t},1-\varepsilon,1+\varepsilon)\hat A_{i,t}\right]-\beta\,\mathbb{D}_{KL}[\pi_\theta\|\pi_{ref}]\right\},\qquad \rho_{i,t}=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{old}}(o_{i,t}\mid q,o_{i,<t})}.
$$

和 PPO 的式 1 逐项比: 裁剪项的形状一样, 都是逐 token 的概率比; 差别在 $\hat A_{i,t}$ 从哪来, 以及 KL 放在哪. PPO 的优势由 GAE 从价值网络算出, 每个 token 的奖励是 $r_t=r_\varphi(q,o_{\le t})-\beta\log\frac{\pi_\theta(o_t\mid q,o_{<t})}{\pi_{ref}(o_t\mid q,o_{<t})}$(式 2), KL 被扣进奖励, 再经 GAE 传到前面的 token. GRPO 把 KL 从奖励里拿出来, 作为独立的一项直接加进损失, 用 Schulman 的无偏估计 $\frac{\pi_{ref}}{\pi_\theta}-\log\frac{\pi_{ref}}{\pi_\theta}-1$ 保证非负(式 4). 外层先按 $1/|o_i|$ 在每条输出内平均, 再按 $1/G$ 在组内平均. 报告给的另一个理由是结构上的: 奖励模型本来就是在同题多答的比较数据上训的, 组内相对优势正好和它的比较性质对上. GRPO 与 PPO 的完整对照见 [02-GRPO](../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 和 [04-PPO](../../../LargeLanguageModelGuide/4-后训练/4.4-强化学习基础/04-PPO/04-PPO.md).

优势有两种定义. **结果监督**: 奖励模型给整条输出一个分, 组内减均值再除以标准差, 这个值广播到该输出的所有 token, $\hat A_{i,t}=\tilde r_i=\frac{r_i-\mathrm{mean}(\mathbf r)}{\mathrm{std}(\mathbf r)}$. **过程监督**: 过程奖励模型在每一步结尾打分, 第 $i$ 条输出第 $j$ 步结尾的 token 位置记作 $\mathrm{index}(j)$, 奖励 $r_i^{\mathrm{index}(j)}$; 归一化在整组所有输出的所有步上一起做,

$$
\tilde r_i^{\mathrm{index}(j)}=\frac{r_i^{\mathrm{index}(j)}-\mathrm{mean}(\mathbf R)}{\mathrm{std}(\mathbf R)},\qquad \hat A_{i,t}=\sum_{\mathrm{index}(j)\ge t}\tilde r_i^{\mathrm{index}(j)},
$$

即 token $t$ 的优势等于它之后(含所在步)所有步的归一化奖励之和. 落到同一条答错的输出上看两者的差别: 结果监督下, 前面推对的步骤和后面推错的步骤里, 每个 token 拿到同一个负优势; 过程监督下, 推对的步骤奖励高于组均值, 贡献正值, 推错的步骤贡献负值, 同一条输出里不同位置的 token 优势不再相同. 出错步之前的 token 既累加自己那几步的正值, 也累加出错那步的负值; 出错步之后的 token 只累加之后各步. 所以前半段推对的 token 受罚更轻, 甚至可能为正. 迭代版(算法 1)处理的是「策略变强后, 旧奖励模型不够用」: 用策略采样的新结果给奖励模型造训练集, 混 10% 历史数据回放继续训奖励模型, 再把参考模型换成当前策略. 需要强调, 这里的奖励来自神经网络奖励模型, 训练集按 Math-Shepherd 的方法构造, 初始奖励模型从 DeepSeekMath-Base 7B 训出, 学习率 2e-5. 这和一年后 R1-Zero 改用规则奖励, 明确拒绝神经奖励模型, 是两条不同的路.

附录 A.1.6 把 GRPO 的梯度系数写了出来(式 21): $\hat A_{i,t}+\beta\left(\frac{\pi_{ref}}{\pi_\theta}-1\right)$. 第二项就是 KL 约束的作用方式: 某个 token 在当前策略下的概率高于参考模型时, 这一项为负, 把它往回拉; 低于参考模型时为正, 往上推. 和 PPO 把 KL 扣进每个 token 的奖励(式 2)再经 GAE 传播相比, 这种写法让 KL 只作用于当前 token, 不会混进优势估计. 过程监督的优势则有一个副作用: token 的优势等于其后所有步骤归一化奖励之和, 而归一化是在整组所有步骤上做的, 步骤越多的回答, 靠前 token 的优势绝对值越大. 报告没有讨论这一点, 因为 1024 token 上限下步骤数差别有限. 算法 1 里每批样本还可以做 $\mu$ 次 GRPO 内循环更新, 主实验取的是 1 次.

主实验的超参: 策略学习率 1e-6, KL 系数 0.04, 每题采 64 条, 最长 1024 token, batch 1024, 每轮探索后策略只更新一次. 每轮只更新一次意味着新旧策略几乎相同, clip 基本不起作用, 目标函数退化成带组内基线的策略梯度. 社区后来对 GRPO 的两个归一化提过批评. 一是每条输出按 $1/|o_i|$ 做长度平均, 错误的长回答每个 token 受到的惩罚被摊薄, 被认为和 R1 类训练里回答越来越长有关; 二是除以组内标准差, 会让全对或全错附近的题, 也就是很简单和很难的题, 获得更大权重. Dr. GRPO 把两项都去掉, 后续又有工作指出去掉长度归一化会带来另一种长度偏差, 两者无法同时兼顾. 这些讨论见 [03-DrGR…1773 tokens truncated…题目, 更好的采样, 抗噪声的算法和更便宜的过程奖励. 这些局限和正文证据对得上: 网页语料擅长小学到竞赛级的定量题, 不擅长图形和形式证明; GRPO 擅长把已有的正确路径采稳, 推不开能力边界.

谱系上, DeepSeekMath 坐在 Coder-v1.5 和后面的推理线之间, 往下分出两条. 数据和底座这条: DeepSeekMath-Base 成为 Prover 和 Prover-V1.5 的起点, 形式证明短板正是 Prover 要补的地方; 「分类器召回网页加按域补种子」的流水也成了后续数学和代码数据的常规做法. 算法这条: GRPO 几个月后就用进了 V2 的对齐阶段, 再到 V3 和 R1. R1-Zero 保留了 GRPO 的组相对基线, 换掉了神经奖励模型, 把回答长度从 1024 放开到上万 token, 于是本篇没暴露的长度偏差问题才浮上来. 从 DeepSeek LLM 结尾那句「RL 能提升复杂推理」到这里, 家族第一次把 RL 做成了可复现的实验, 虽然主要贡献仍在数据上.

## 5. 从 DeepSeekMath 到 R1：同一算法怎样进入多阶段训练

DeepSeekMath 证明了 GRPO 能在数学题上工作，R1 将它放进更大的底座和更长的训练流水。两篇论文共享算法骨架，却拥有不同的数据、奖励与阶段设计。下面按时间顺序比较，避免用 R1 的结果替 DeepSeekMath 补证据。

**起点与算法：** **起点: V3-Base 和「不做 SFT」的假设：** R1 的底座是 DeepSeek-V3-Base, 671B 总参, 37B 激活, 经过 14.8T token 预训练. 补充材料 A.1 说明, 预训练数据来自普通网页和电子书, 没有主动加入合成数据; 不过部分网页含有 OpenAI 模型生成的回答, 底座仍可能间接接触这类内容. 预训练末段同样没有刻意加入 OpenAI 生成的数据. 数学和代码内容在语料中占有相当比例, 底座已经见过大量推理过程. 因而 RL 更像是在底座能够生成的候选解中强化有效路径, 而非从零建立推理能力.

报告的出发点是一个假设: 人写的推理示范会限制模型的探索, 跳过 SFT, 只给结果奖励, 模型可能找到不同于人类的推理方式. 补充材料 G.1 给出了这个假设成立的前提: 他们先在 7B 稠密模型和 16B MoE 上试过, AIME 上没有有意义的提升, 回答变长后小模型开始重复, 无法利用长 CoT; 换到 32B 稠密, 230B MoE 和 671B MoE 才看到纯 RL 带来的大幅提升. 结论是纯 RL 的效果高度依赖底座的容量. 这个前提比「跳过 SFT」本身更重要, 后来的复现工作大多也是在 7B 以上的强底座上才看到类似现象.

### 5.1. GRPO: 不要 critic, 用组内均值当基线

R1-Zero 和 R1 都用 **GRPO**(式 1–3):

$$
\mathcal{J}_{\mathrm{GRPO}}(\theta)=\mathbb{E}_{q,\{o_i\}\sim\pi_{\theta_{old}}}\frac{1}{G}\sum_{i=1}^{G}\left(\min\left(\rho_iA_i,\ \mathrm{clip}(\rho_i,1-\varepsilon,1+\varepsilon)A_i\right)-\beta\,\mathbb{D}_{KL}(\pi_\theta\|\pi_{ref})\right),\qquad A_i=\frac{r_i-\mathrm{mean}(\{r_j\})}{\mathrm{std}(\{r_j\})},
$$

$\rho_i=\pi_\theta(o_i|q)/\pi_{\theta_{old}}(o_i|q)$. 每道题从旧策略采样 $G=16$ 个回答, 用这组回答奖励的均值和标准差把每个奖励标准化, 得到优势 $A_i$; 目标函数是 PPO 式的截断比率项, 减去对参考策略的 KL 惩罚. 结果奖励是 0/1 时, 组内标准化的效果可以直接算出来. 16 个里答对 4 个: 均值 0.25, 标准差 $\sqrt{0.25\times0.75}\approx0.433$, 答对的 $A=1.73$, 答错的 $A=-0.58$. 16 个里只答对 1 个: 均值 0.0625, 标准差约 0.242, 那一个答对的 $A\approx$ **3.87**, 其余各 $-0.26$. 也就是说, 越难的题, 偶然答对的那条轨迹拿到的正优势越大, 答错的轨迹受罚越轻; 16 个全对或全错时优势全为 0, 这道题只剩 KL 项. 这就是 GRPO 把底座「偶尔能走通」的路径放大的具体方式(以上按总体标准差算, 报告没写用总体还是样本标准差).

与 PPO 的区别有两处(补充材料 A.3). 第一, PPO 用 GAE 计算优势, 需要一个与策略同规模的价值模型; 价值模型要根据已生成的前缀预测最终奖励, 在只有结果奖励, 回答又长又会中途推翻自己的长 CoT 场景里, 这种预测尤其困难. 第二, PPO 通常把逐 token 的 KL 惩罚作为稠密奖励加在每一步上, 累积起来相当于惩罚回答长度;

GRPO 把 KL 的无偏估计 $\pi_{ref}/\pi_\theta - \log(\pi_{ref}/\pi_\theta) - 1$ 直接加进损失, 不随长度累积, 回答才有机会变长. GRPO 的推导见 [GRPO](../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md), 与 PPO 的对照见 [PPO](../../../LargeLanguageModelGuide/4-后训练/4.4-强化学习基础/04-PPO/04-PPO.md).

Figure 4 用 DeepSeek-Coder-V2-Lite(16B MoE, 2.4B 激活)在 MATH 上比较两者: GAE 的 $\lambda$ 取开源实现常用的 0.95 时, PPO 明显不如 GRPO; 调到 1.0 后接近 GRPO(读图). $\lambda=1$ 意味着 GAE 退化为蒙特卡洛回报减价值基线, 不再依赖价值模型的逐步估计, 这恰好说明在结果奖励场景下价值模型的中间估计帮不上忙. 报告的结论是 PPO 调好也能用, 但要多花调参成本, 还要多训一个价值模型.

训练中每 400 步把参考模型换成最新策略, 因为几千步之后策略会离初始模型很远, 固定参考会过度约束后续探索.

图注: 报告 Figure 4: 数学题上 GRPO 相对 PPO 的优势。
*报告 Figure 4: 数学题上 GRPO 相对 PPO 的优势*

式 1 的比率写成整条回答的概率比 $\pi_\theta(o_i|q)/\pi_{\theta_{old}}(o_i|q)$, 没有写出按 token 平均的项; 但 §3.2.1 又说截断系数太小「会截断大量 token 的梯度」, 说明实现里比率是逐 token 计算的. 社区后来的分析(Understanding R1-Zero-Like Training, 提出 Dr. GRPO)指出, DeepSeekMath 原式里按回答长度 $1/|o_i|$ 平均, 以及按组内标准差归一化, 会让长的错误回答受罚更轻, 人为推高回答长度. 报告未说明 R1 的实现是否带有长度平均项; 按式 3 的写法, 标准差归一化是存在的. 这一偏置的讨论见 [Dr. GRPO 去标准差](../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/02-DrGRPO-去标准差/02-DrGRPO-去标准差.md).

**R1-Zero: 只用规则奖励的 RL：** **R1-Zero 的奖励与模板：** R1-Zero 的奖励全部是规则(§2.2): **准确率奖励**加**格式奖励**, 两者权重相同, 即 $\mathrm{Reward}_{\mathrm{rule}}=\mathrm{Reward}_{\mathrm{acc}}+\mathrm{Reward}_{\mathrm{format}}$(式 4). 数学题要求把最终答案写在指定格式里(如方框中)再与标准答案比对, 代码题用编译器跑预设测试用例; 格式奖励要求推理过程放在 think 标签里. 报告明确不用神经网络奖励模型, 不论是结果奖励还是过程奖励, 理由是大规模 RL 中神经奖励模型容易被 reward hacking, 重训奖励模型又增加成本和复杂度. 模板(Table 1)只规定先在 think 标签里写推理过程, 再在 answer 标签里写答案, 刻意不加任何内容上的引导, 以便观察模型自己的演化.

RL 数据在补充材料 B.3.1 和 Table 4. 数学 26K 题, 平均提示 122 个 token, 不含证明题, 因为证明的对错难以自动判断, 答对得 1 分否则 0 分; 代码 17K 道算法竞赛题, 另有 8K 道从 GitHub issue 提取的修 bug 题, 要通过全部单元测试; STEM 22K 道四到八个选项的选择题, 化学占 46.5%, 生物 30.7%, 物理 15.5%; 逻辑 15K 题, 包括网上的脑筋急转弯, 经典逻辑题, 以及合成的 code-IO 题和密码, 斑马谜题, 24 点等题目. 所有题目都是中文或英文. 通用数据 66K 题用于 R1 的第二轮 RL, R1-Zero 不用. 这套数据的特点是答案都能自动验证, 数学只要最终数值或表达式, STEM 和部分逻辑题是选择题. 选择题只有四到八个选项, 随机猜也有 12.5% 到 25% 的正确率, 模型可能靠排除法而不是完整推理拿到奖励.

### 5.2. R1-Zero 的训练日程

超参在 §2.1: 学习率 3e-6, KL 系数 0.001, 采样温度 1, 每题采样 16 个回答. 最大长度在第 8.2K 步之前是 32,768 token, 之后改为 65,536; 总共训 10,400 步, 相当于 1.6 个 epoch. 每步 32 道题, 即 512 个回答. 每次 rollout 生成 8,192 个回答(512 道题乘 16), 随机分成 16 个 mini-batch, 每个 mini-batch 更新一次, 只过一个内层 epoch. 所以一次 rollout 对应 16 个训练步, 10,400 步约 650 次 rollout, 参考模型每 400 步即每 25 次 rollout 更新一次. 同一次 rollout 的后几个 mini-batch 用的数据已落后策略十几次更新, 这也是截断比率仍然必要的原因.

用步数反推数据量, 会发现一处对不上. 10,400 步乘 32 道题约 33.3 万题次, 除以 1.6 个 epoch, 训练集约 **20.8 万**道题. 而 Table 4 列出的推理类 RL 题目合计约 8 万到 8.8 万道. 两者差两倍多, 可能 R1-Zero 用的题库比 Table 4 更大, Table 4 描述的是 R1 阶段的数据, 也可能 epoch 的算法不同, 报告没有说明. 训练成本见补充材料 Table 7: R1-Zero 用 64 个节点共 512 张 H800, 约 198 小时, 合 101K GPU 小时. 每步平均约 69 秒, 其中大部分时间花在生成几万 token 长的回答上.

**R1-Zero 的结果和「顿悟」：** Figure 1 显示, AIME 2024 的 pass@1 从 15.6% 升到 77.9%, 用 16 次采样多数投票(cons@16)可达 86.7%, 超过人类参赛者的平均水平. 训练集上的平均回答长度持续增长, 从开始时约 500 token 涨到结束时约 **1.35 万** token, 第 8K 步以前大致线性上升, 此后曲线明显抬高, 波动也变大(读图). 在第 8.2K 步最大长度从 32K 放宽到 64K 时, 分数和长度都出现一次明显跳升, 报告自己也写了这一点. 这说明在此之前有相当一部分回答被长度上限截断, 截断的回答拿不到答案分; 放宽上限本身就会带来提升, 不能全部归功于模型「学会了思考」.

图注: 报告 Figure 1: R1-Zero 训练过程中 AIME 准确率随步数的变化。
*报告 Figure 1: R1-Zero 训练过程中 AIME 准确率随步数的变化*

补充材料 C 做了行为分析. 在 MATH 按难度分层, 1 到 3 级很快达到 0.90 到 0.95, 4 级从约 0.78 升到 0.95, 5 级从约 0.55 升到 0.90(读图); 1 级只有 43 题, 95% 到 97% 的正确率意味着只错一两道, 多是几何题. 三位专家选了 wait, mistake, however, but, retry, error, verify, wrong, evaluate, check 等反思词, 训练中这些词的出现频率涨了 **5 到 7 倍**. 其中 wait 在训练早期几乎没有, 4000 到 7000 步偶尔出现, 8000 步之后骤增. Table 2 的「aha moment」就是模型在推导中写出「Wait, wait. Wait. That's an aha moment I can flag here」然后重新检查.

「顿悟」的解读后来受到质疑. Understanding R1-Zero-Like Training 一文检查了包括 V3-Base 在内的多个底座, 发现 V3-Base 在 RL 之前就会出现 aha moment 式的自我反思; 另一项 oat-zero 的研究发现小底座在第 0 步就有这类表达, 其中不少是「表面反思」, 反思之后答案并没有变对. 结合第 1.2 节的长度偏置, 回答变长和反思词增多, 有一部分可能来自优化目标本身, 而不是全新能力的涌现. 报告附录也承认底座见过大量推理数据. 现有证据支持 RL 提高已有反思行为的频率和有效性, 但不足以证明这些行为由 RL 凭空产生.

**R1 的多阶段流水：** **R1 的第一步: 冷启动数据：** R1-Zero 有两个问题: 可读性差, 同一段 CoT 里中英混杂. R1 的流程(Figure 2)先收集几千条**冷启动数据**, 微调 V3-Base 作为 RL 的初始策略. 补充材料 B.3.2 说这一步的动机主要是产品层面的: 用户更容易接受第一人称的思考过程. R1-Zero 倾向用「we」或者不用人称, R1 更多用「I」. 报告同时提醒, 这种生动的推理风格反映的是 DeepSeek 设计的启发式规则, 不代表模型具备了类人的智能, 可能让用户产生不必要的信任. 冷启动数据的风格要求是: 先理解问题, 再详细推理并带反思和验证, 全程第一人称, 语言与提问一致.

图注: 报告 Figure 2: R1 多阶段训练流程——冷启动 SFT、推理 RL、拒绝采样、全场景 RL。
*报告 Figure 2: R1 多阶段训练流程——冷启动 SFT、推理 RL、拒绝采样、全场景 RL*

制作流程是: 先请人工标注员把 R1-Zero 的推理轨迹改写成自然的对话风格, 再用这些改写样例提示一个 LLM 按同样风格改写更多数据, 随后对 LLM 的输出做第二轮人工核验.

冷启动 SFT 训 2 到 3 个 epoch, 学习率余弦从 5e-5 降到 5e-6, 最大长度 32,768, batch 128(补充材料 B.4.2).

冷启动之后的 R1-Dev1(Table 3)指令跟随明显变好: IF-Eval 从 R1-Zero 的 46.6 升到 71.7, ArenaHard 从 53.6 升到 77.0, AlpacaEval 2.0 从 24.7 升到 50.1. 代价是推理下降: AIME 从 77.9 降到 59.0, CNMO 从 88.1 降到 58.0, GPQA 从 75.8 降到 66.1. 报告归因于冷启动数据量太小. 几千条人改的数据就能把 AIME 拉低近 19 分, 说明 SFT 对长推理行为的扰动很大, 这也从反面支持了报告「人写的示范会限制探索」的判断.

### 5.3. 第一轮 RL 和语言一致性奖励

第一轮 RL 的超参与 R1-Zero 基本相同: 学习率 3e-6, KL 系数 0.001, 温度 1, 每题 16 个回答, 最大长度 32,768, 每步 32 道题, 每 400 步更新参考模型. 报告写 GRPO 截断系数 $\varepsilon=10$, 并解释系数太小会截断大量 token 的梯度, 太大又不稳定. 常见的 PPO 截断系数约为 0.2; $\varepsilon=10$ 要求比率超过 11 才触发上界, 下界 $1-10$ 又为负数, 在通常定义下几乎等同于不截断. 公开材料无法判断这是笔误, 还是 R1 实现采用了不同于式 1 的截断定义.

这一轮新增了**语言一致性奖励**(式 7): $\mathrm{Reward}_{\mathrm{language}}=\mathrm{Num}(\mathrm{Words}_{\mathrm{target}})/\mathrm{Num}(\mathrm{Words})$, 即 CoT 中目标语言词数占总词数的比例, 取值 0 到 1, 直接加到最终奖励上, 推理和非推理数据都加.

它和 0/1 的准确率奖励同权相加, 放进同一组里比较: 答对但 CoT 只有一半是目标语言的回答得 $1+1+0.5=2.5$(准确率, 格式, 语言), 答错但语言纯净的回答得 $0+1+1=2$, 答对仍然占优, 但只多 0.5 分. 半个准确率的差距足以在组内标准化后改变优势的正负分布, 代码题的轻微下降可以从这里理解.

补充材料 B.6 在 DeepSeek-R1-Distill-Qwen-7B 上做了消融, 该模型用同样的冷启动数据, RL 中同样出现语言混杂. 不加这项奖励, 语言一致性随训练步数逐渐变差; 加上后一直稳定. 数学基准基本不变, 代码基准略有下降(读图). 报告的态度是接受这点性能损失, 换取可读性. 第一轮 RL 之后的 Dev2 推理大幅回升: AIME 74.0, CNMO 73.9, LiveCodeBench 63.5, Codeforces 评分从 Dev1 的 1534 升到 1687; AlpacaEval 只从 50.1 到 55.8, 说明面向推理的 RL 对用户偏好类评测帮助有限.

**万条 SFT 数据：** 第二轮 SFT 的数据约 **80 万**条(补充材料 B.3.3). 推理数据约 60 万条, 从第一轮 RL 的 checkpoint **拒绝采样**得到: 每题采样多个回答, 只保留正确的. 这一轮不再限于能用规则判分的题, 一部分题把标准答案和模型预测一起交给 DeepSeek-V3 判断, 即生成式奖励模型. 还过滤掉了语言混杂, 段落过长, 含代码块的 CoT. 非推理数据约 20 万条, 包括写作, 事实问答, 自我认知, 翻译, 复用了 V3 的部分 SFT 数据, 并加入程序修复, 前端开发等软件工程数据. 部分非推理任务先让 V3 生成一段 CoT 再回答, 像「hello」这样的简单问题则不给 CoT.

Table 5 给出分领域统计: 数学 395,285 条, 平均 6094 token; 代码 211,129 条, 平均 7436 token; STEM 10,124 条; 逻辑 10,395 条; 通用 177,812 条, 平均 1420 token; 合计 804,745 条, 平均 5355 token. 按条数乘平均长度, 一个 epoch 约 **43 亿** token, 其中数学约 56%, 代码约 36%, 通用只占约 6%. 条数上通用数据占 22%, 按 token 算却只有 6%, 模型在 SFT 中看到的绝大部分内容是长推理. 平均轮数 1.0 到 1.1, 几乎全是单轮, 报告承认这会限制多轮对话能力. 这一轮 SFT 之后的 Dev3 在 AlpacaEval 上到 62.1, Aider-Polyglot 从 25.6 跳到 44.8, 对应新加的非推理数据和软件工程数据. SFT 数据质量筛选的一般做法见 [SFT 数据质量筛选与训练技巧](../../../LargeLanguageModelGuide/4-后训练/4.2-SFT/4.2.2-SFT数据质量筛选与训练技巧/4.2.2-SFT数据质量筛选与训练技巧.md).

**奖励模型和第二轮 RL：** 第二轮 RL 需要给通用数据打分, 所以训了两个奖励模型(§3.1). **有用性奖励模型**: 用 Arena-Hard 的提示格式让 DeepSeek-V3 比较一对回答, 每对问 4 次并随机交换 A, B 位置以消除位置偏差, 取 4 次平均, 只保留分差 Δ 大于 1 的对; 还让整个数据集中被选和被拒回答的长度相当, 以减少长度偏差. 共 66,000 对, 提示都是非推理问题. 模型结构与 R1 相同, 加一个标量奖励头; batch 256, 学习率 6e-6, 训一个 epoch, 训练最大长度 8192, 推理时不限长度. 有用性只评最终总结, 不评推理过程, 避免干扰推理.

**安全奖励模型**用 106,000 条标注为安全或不安全的回答, 按单点方式训练; 安全性评估整个回答, 包括推理过程.

第二轮 RL 的总奖励是

$$
\mathrm{Reward}=\mathrm{Reward}_{\mathrm{reasoning}}+\mathrm{Reward}_{\mathrm{general}}+\mathrm{Reward}_{\mathrm{language}},\quad \mathrm{Reward}_{\mathrm{reasoning}}=\mathrm{Reward}_{\mathrm{rule}},\quad \mathrm{Reward}_{\mathrm{general}}=\mathrm{Reward}_{\mathrm{reward\_model}}+\mathrm{Reward}_{\mathrm{format}}.
$$

一道题只属于一类: 推理题拿规则奖励, 通用题按它属于有用性集还是安全集, 拿对应奖励模型的分数, 再加格式奖励; 语言项两类都加. 有用性奖励在式 5 里写成 $RM_{\mathrm{helpful}}(\mathrm{Response}_A,\mathrm{Response}_B)$, 输入是一对回答, 奖励头输出的标量是这一对的偏好分, 而 GRPO 需要给组里 16 个回答各一个标量; 报告没写 RL 时怎么把成对打分变成单个回答的分数.

温度从 1 降到 0.7, 因为高温下生成不连贯. 共 1,700 步, 通用指令数据和偏好奖励只在末尾 400 步加入. 原因写在补充材料 B.5: 用有用性奖励模型训练更多步会出现 reward hacking, Figure 6 显示奖励持续上升的同时 Codeforces 成绩下降(读图). 所以偏好 RL 在这里被刻意限制在几百步. R1 相对 Dev3 的主要提升在用户偏好类评测: AlpacaEval 2.0 从 62.1 升到 87.6, ArenaHard 从 75.6 升到 92.3, IF-Eval 从 78.1 升到 83.3.

图注: 报告 Figure 6: 奖励持续上升、真实表现 plateau——reward hacking 的实证。
*报告 Figure 6: 奖励持续上升、真实表现 plateau——reward hacking 的实证*

报告把这一阶段的代码和数学提升概括为小幅变化, 表中不同基准的幅度并不一致. Codeforces 评分从 Dev3 的 1746 升到 2029, 百分位从 92.1 升到 96.3, 是整个流程中最大的一次单步提升; Aider-Polyglot 也从 44.8 升到 53.3. 「小幅」更符合 AIME 和 MATH 的变化, 代码指标还可能受前 1,300 步推理 RL 影响. R1 阶段训练成本为 41K GPU 小时. 报告同时写了「512 张卡约 4 天」和「约 80 小时」; 4 天等于 96 小时, 41K 除以 512 则约为 80 小时, 两种表述并不一致. 整个 R1 系列(R1-Zero 101K, SFT 数据制作 5K, R1 41K)合计 147K GPU 小时, 约 29.4 万美元, 不含 V3-Base 的预训练.
