---
title: "02 · DeepSeek-OCR 2: 用因果 query 重排文档视觉 token"
category: "模型技术报告"
tags: ["DeepSeek", "OCR", "视觉编码器", "因果注意力", "文档解析"]
published: true
excerpt: "DeepSeek-OCR 2 以双向视觉 token 和因果 flow query 组成 DeepEncoder V2, 在固定 token 预算内学习文档阅读顺序."
---
# DeepSeek-OCR 2: 用因果 query 重排文档视觉 token

论文 [DeepSeek-OCR 2: Visual Causal Flow](https://arxiv.org/abs/2601.20552) 于 2026 年 1 月公开, 代码和权重见 [deepseek-ai/DeepSeek-OCR-2](https://github.com/deepseek-ai/DeepSeek-OCR-2). 模型沿用 DeepSeek-OCR 的 16 倍视觉压缩与 3B MoE decoder, 把 encoder 中的 CLIP ViT 换成由 Qwen2-0.5B 初始化的 LLM 风格结构. visual token 继续双向建模全局图像, 后接等数量 learnable query 按 causal mask 逐个读取视觉信息, 只有 query 输出进入语言 decoder.

## 1. 固定 raster 顺序为何成为文档理解限制

固定 raster 顺序把二维文档结构预先压成了一条不可调整的一维路径.

### 1.1. 2D patch 展平会把坐标顺序当成语义顺序

ViT 通常把图像切成 patch, 按从左到右, 从上到下展平, 再加 position encoding. 对自然照片, 邻近 patch 的空间关系往往足够稳定; 对文档, 视觉坐标与阅读顺序经常不同. 双栏论文要先读完左栏再到右栏, 表格可能按表头与行列依赖读取, 公式包含分式, 上下标与多行对齐, 这些关系无法由单一 raster path 完整表达.

普通 encoder 使用双向 self-attention 后, 每个 visual token 已能看到全图, 所以问题不在感受野缺失. 难点是送入自回归 LLM 的压缩 token 仍按固定坐标排列. decoder 要一边恢复阅读顺序, 一边识别内容并生成 Markdown. DeepEncoder V2 把顺序选择提前到 encoder, 让输出 token 的先后受图像语义影响.

### 1.2. 人类扫描只是设计动机, 不是机制证明

论文用人类 foveal fixation 和追踪螺旋线解释 visual causal flow. 人眼的下一次注视受此前语义影响, 因而模型 query 也按前序 query 条件化. 这说明为何采用因果 query, 不能证明模型学到与人类相同的眼动路径. 训练没有眼动标签, query 顺序由 next-token prediction 间接塑造.

更准确的机制描述是: 每个 query 能读取全部 visual token 与此前 query, 不能读取未来 query. query 序列因此构成有方向的条件分解. 若任务要求先输出标题再输出正文, 梯度会推动前部 query 捕获标题相关特征, 后部 query 在此前表示上继续组织后续内容. 所谓 reading order 是由生成损失诱导的 latent order.

### 1.3. OCR 是适合验证顺序建模的任务

文档输出可以直接比较字符, 公式, 表格结构与 reading order, 比开放式图像问答更容易把顺序收益单独观察. OmniDocBench 同时给文本 edit distance, formula CDM, table TEDS 和 reading-order edit distance. DeepSeek-OCR 到 OCR 2 的主要数据源和 decoder 保持接近, encoder 变化更容易与指标改善对应.

该试验场也有限制. 文档的目标顺序通常由标注 parser 规定, 不一定等于唯一合理的人类阅读路径. reading-order edit distance 下降表明输出更接近 benchmark 顺序, 不能证明 query 形成通用 2D reasoning. 对物体交互, 空间导航和图形推理的效果仍待后续实验.

## 2. DeepEncoder V2 的 token 流怎样计算

### 2.1. vision tokenizer 先做 16 倍压缩

输入图像先经过约 80M 参数的 SAM-base 与两个 convolution layer. 最终 convolution 输出维从上一代的 1024 调成 896, 与后续 Qwen2 encoder hidden dimension 对齐. window attention 在局部范围聚合 patch, token 数减少 16 倍. 对 1024×1024 global view, 压缩后得到 256 个 visual token; 对 768×768 local crop, 每个得到 144 个.

这一级 tokenizer 不是理论上必需, 普通 patch embedding 也可接入后续结构. 团队保留它是为了降低全局 attention 的序列长度和 activation memory. 约 80M 参数也接近大型 LLM 的 text embedding 参数量. 压缩发生在因果重排之前, 被局部 tokenizer 丢掉的细节无法由后续 query 恢复.

### 2.2. visual prefix 与 causal query 共用 Transformer

压缩后的 $m$ 个 visual token 放在序列前部, 后接 $n$ 个 learnable causal query, 论文设置 $m=n$. visual token 之间使用全双向 attention, 能看到整个视觉 prefix; visual token 不能读取 query. 每个 query 可以读取全部 $m$ 个 visual token, 也可读取此前 query, 但不能读取未来 query.

attention mask 可写成四个 block:

$$
M=\begin{bmatrix}
\mathbf{1}_{m\times m} & \mathbf{0}_{m\times n}\\
\mathbf{1}_{n\times m} & \operatorname{LowerTri}(n)
\end{bmatrix},\qquad m=n.
$$

左上 block 保留 ViT 式全局视觉建模, 左下 block 让每个 query 读取全部视觉信息, 右下 block 让 query 形成自回归序列, 右上 block 阻止 visual token 被 query 反向改变. 最终投影算子 $\pi_Q$ 丢弃前 $m$ 个 visual output, 只保留后 $n$ 个 query output 给 decoder.

### 2.3. 等数量 query 没有进一步压缩 token

Q-former 常用少量 query 压缩大量 CLIP token. DeepEncoder V2 刻意让 query 数量等于视觉 token 数, 因为输入含 padding, border 与重复区域, 模型需要足够 slot 对信息重新注视和排序. token compression 已由前面的 SAM-conv tokenizer 完成, LLM encoder 的职责是重组和蒸馏, 不是再次减少数量.

global view 固定使用 256 query. 每个 local crop 使用共享的 144 query embedding, crop 数 $k$ 为 0–6. 最终 token 数为 $256+144k$, 即 256–1120. local crop 共享 query 参数, 但每个 crop 的视觉输入不同. 最大 1120 略低于 DeepSeek-OCR Gundam mode 的 1156, 便于在相近预算下比较.

## 3. 两级因果流的能力和代价

DeepEncoder V2 用两级一维因果过程生成可重排的视觉 token 流.

### 3.1. encoder 重排, decoder 生成

第一级因果过程发生在 encoder query. query $q_i$ 根据全图 visual prefix 与 $q_{<i}$ 生成新的视觉 representation. 第二级发生在 DeepSeek-MoE decoder, decoder 在这些 ordered representation 和文本 prompt 上自回归输出 OCR 内容. 两层都是 1D causal computation, 中间 representation 则来自 2D 图像.

该设计没有显式 permutation matrix, 也没有把每个 query 对应到唯一 patch. query 可以对全部 visual token 做 soft attention, 所以“重排”更接近顺序化的信息聚合. 一个 query 可以混合多个区域, 同一区域也可被多个 query 反复读取. 这比 hard sorting 灵活, 也使 latent order 难以直接解释.

### 3.2. prefix decoder-only 比 cross-attention 更稳定

视觉 encoder 用 Qwen2-0.5B 初始化, 参数约 500M, 比 300M CLIP ViT 大但仍属相近量级. 团队还试过 mBART 式 encoder-decoder 与 cross-attention, 训练没有收敛. 论文推测, visual token 被隔离在独立 encoder 后, 与 query 的交互不足; prefix concatenation 让它们在每一层共同参与 self-attention.

该对照只报告失败, 没给 loss curve, 具体超参数和多次重试. 因此能确定最终采用 prefix 结构, 不能据此断言所有 cross-attention 视觉 encoder 都不适合因果 query. 初始化兼容性, mask 实现和优化设置也可能影响收敛.

### 3.3. decoder 保持不变有助于隔离 encoder 收益

语言 decoder 沿用 DeepSeek-OCR 的 3B MoE, 每 token 激活约 500M 参数. 核心前向可以理解为 vision tokenizer $E$ 生成 $V$, query $Q_0$ 与 $V$ 拼接, LLM encoder $T_L$ 在 mask $M$ 下计算, $\pi_Q$ 抽取 query representation, decoder $D$ 输出词表 logits.

decoder 不升级让 baseline 更可比. 但 encoder 从 300M CLIP 换到 500M Qwen2 风格网络, 总参数和训练过程仍变化, 3.73 个百分点不能只归因于 causal mask. 要严格分解贡献, 还需要同参数双向 Qwen encoder, 不等量 query, 不同 mask 等消融. 报告没有提供这些完整组合.

## 4. 三阶段训练为什么要逐步冻结

### 4.1. encoder 预训练先建立视觉语言接口

第一阶段把 DeepEncoder V2 配轻量 decoder, 用 next-token prediction 联合训练. 768 与 1024 两个 dataloader 分别覆盖 local/global 尺寸. vision tokenizer 从上一代初始化, LLM encoder 从 Qwen2-0.5B-base 初始化. AdamW 学习率从 $10^{-4}$ cosine 衰减至 $10^{-6}$, 使用 160 张 A100, batch 640, 40k iteration, 8K sequence packing, 总量约 100M image-text pair.

这一阶段同时改变 tokenizer, LLM encoder 与轻量 decoder, 让原本处理文本的 Qwen2 attention 适应视觉 prefix 和定制 mask. 训练后只保留 encoder 参数, 轻量 decoder 是提供语言建模监督的临时 readout. encoder 学到 feature extraction, token compression 后的信息利用和初步 query order.

### 4.2. query enhancement 联合对齐最终 decoder

第二阶段接入 DeepSeek-3B-A500M decoder. SAM-conv tokenizer 冻结, LLM encoder 与 decoder 联合更新. multi-crop 把两种分辨率合进同一 dataloader. 4-stage pipeline parallelism 中, tokenizer 在 PP0, LLM encoder 在 PP1, decoder layer 分配到 PP2–3.

160 张 40GB GPU 组成 40 个 data parallel replica, 每个 replica 用 4 张卡, global batch 1280. 学习率从 $5\times10^{-5}$ 降到 $10^{-6}$, 训练 15k iteration. tokenizer 冻结避免低层视觉特征在联合训练中漂移, encoder query 与最终 decoder 同时适应, 使 reordered representation 更适合下游生成.

### 4.3. 冻结 encoder 后扩大数据吞吐

第三阶段冻结整个 DeepEncoder V2, 只训练 decoder. 同 global batch 下训练速度超过翻倍, 学习率从 $10^{-6}$ 降至 $5\times10^{-8}$, 训练 20k iteration. encoder 输出分布固定后, decoder 学习更好解释 reordered visual token, 并能以较低 FLOPs 消耗更多训练数据.

冻结也意味着后续 decoder 发现的新错误无法反向修改 visual order. 三阶段顺序在适应能力和吞吐之间取舍: 前两阶段允许 encoder 学到任务需要的表示, 最终阶段把计算集中到语言生成. 报告没有给各阶段单独指标, 无法量化每一步的边际收益.

## 5. 结果支持什么, 还缺什么

### 5.1. 总分与 reading order 同时改善

OmniDocBench v1.5 有 1355 页中英文文档, 覆盖 9 类. OCR 2 使用最多 1120 visual token, overall 为 91.09%; baseline 使用 1156 token, overall 为 87.36%. 文本 edit distance 从 0.073 降至 0.048, formula CDM 从 84.14 升至 90.31, reading-order edit distance 从 0.085 降至 0.057.

reading-order 改善与 causal flow 目标一致, 文本和公式也同步提升, 说明重排没有用内容识别换顺序. 然而训练 sampling 和 layout label 同时调整, encoder 参数也增加. 论文将数据差异描述为小改动, 它们仍是混杂变量. 缺少严格 ablation 时, 结果支持整套 OCR 2 方案有效, 不能精确归因每个组件.

### 5.2. newspaper 揭示 token 与数据两种瓶颈

分文档类型看, OCR 2 多数文字 edit distance 更低, newspaper 仍为 0.139, 略差于 baseline 的 0.131. 报纸文字密度高, 1120 token 上限可能压缩过强; 增加 local crop 能提高细节预算. 训练中 newspaper 只有约 250k 样本, 新 encoder 也可能没有学到稳定布局模式.

两种原因没有通过独立实验拆分. 若只增加 crop 而不补数据, 可以检验 resolution/token bottleneck; 固定 crop 增加报纸数据, 可检验分布瓶颈. 论文把它们列为后续改进方向, 没有报告实验数值. reading order 在报纸上从 0.101 到 0.100, 改善也很小.

### 5.3. 生产 repetition rate 不是完整准确率

在线用户图像 repetition 从 6.25% 降至 4.17%, PDF 预训练数据从 3.69% 降至 2.88%. 无 ground truth 时, 重复输出易于自动统计, 能发现 decoder loop 与阅读顺序异常. 下降说明新模型在真实流量上更少出现这类明显退化.

repetition rate 看不到遗漏, 错字, 公式错误和错误表格结构. 一个不重复但内容错误的输出仍会被记为正常. 生产 readiness 还需要人工抽检, 下游数据质量与 latency/throughput. 报告没有给推理速度, 显存和线上样本量, 不能仅从 repetition 推断完整生产优势.

### 5.4. “真正 2D 推理”仍是研究假设

串联两个 1D causal reasoner 的设想很有吸引力: encoder 推理阅读逻辑, decoder 推理任务输出. 当前证据来自 OCR 与 document parsing, 任务本来就有可线性化的目标序列. 更一般的 2D reasoning 可能要求来回观察, 多跳空间关系和不止一次重排.

论文提出让 causal flow token 长于 visual token, 以支持多次 re-examination. 这会增加 encoder attention 成本, 也打破 $m=n$ 的简洁设置. 未来还需比较更多 query, recurrent query, sparse attention 与显式 layout graph. 当前结果证明 causal query 对文档有效, 尚未证明双 1D 结构足以覆盖通用二维视觉推理.

**5.5. omni-modal encoder 需要跨模态实验证据:** LLM 风格 encoder 可以理论上共享 $W_k$, $W_v$, attention 和 FFN, 只为图像, 音频, 文本使用不同 learnable query. 统一参数空间有机会复用 MoE, efficient attention 和训练基础设施. query 充当各模态的读取接口, 输出统一长度和 hidden dimension 的 representation.

DeepSeek-OCR 2 只验证视觉文档. 音频的时间连续性, 文本的离散 token 和图像的二维空间有不同局部结构, 共享 encoder 是否产生负迁移尚未知. 模态专用 tokenizer, query 数量, mask 与采样比例仍需设计. 因此 native multimodality 是由架构自然引出的方向, 不是论文已经完成的能力.

从 attention 计算看, DeepEncoder V2 的 LLM encoder 序列长度为 $m+n=2m$. visual token 与 query 等量后, 全局层处理的 token 数比只输入 visual token 更长. 定制 mask 虽然禁止一部分连接, 常规 dense attention kernel 未必按 mask 稀疏性减少 FLOPs. 16 倍 tokenizer compression 因而是控制成本的关键, 否则双流序列会显著放大全局 attention 计算.

只有 query output 进入 decoder, 所以 decoder 的视觉上下文仍为 $n$, 没有因 encoder 内部拼接翻倍. 额外成本集中在 encoder, 自回归 OCR 生成的 KV cache 不保存原始 visual token. 对长文档输出, decoder token 数通常远大于视觉 token, encoder 增量在端到端延迟中的占比需要实测. 论文没有报告速度, 不能从结构直接判断线上吞吐是否持平.

mask 中 visual token 不能看到 query, 让视觉 prefix representation 与 query 读取过程单向分离. 如果允许 visual token 反向读取 query, 各层会把顺序状态写回视觉特征, 可能增强迭代交互, 也会破坏视觉全局表示的稳定性. 当前 block mask 选择一次编码, 多步读取的结构, 与 decoder-only prefix language model 接近.

query embedding 在不同图像间共享, 不对应固定语义类别. 第一个 query 不必总是标题, 后一个也不必总是页脚; 位置只提供因果槽位, 实际读取内容由图像和训练目标共同决定. local crop 又共享同一组 144 query, 让各 crop 采用一致读取接口. 这种参数共享提高泛化, 也可能难以区分同页不同 crop 的全局位置, 需要 global view 提供整体布局.

multi-crop 把高分辨率细节与全局布局分开. global 1024 view 产生 256 token, 保留整页结构; local 768 crop 每块产生 144 token, 补充小字和公式. $k$ 增加时 token 线性增长, 最大 6 crop. 报纸失败说明固定上限下, 超密集页面仍可能有局部内容没有足够 representation slot.

论文称最大预算与 Gemini-3 Pro 的 1120 token 相同, 这只对齐 token 数量, 不对齐 token 信息量. 不同 tokenizer 的 patch 尺寸, compression 和 hidden dimension 不同, 一个视觉 token 携带的空间范围也不同. Table 2 在相同计数下比较 overall edit distance有参考价值, 不能把 token 数直接解释为等 FLOPs 或等视觉带宽.

overall 91.09 的聚合方式来自 OmniDocBench, 各子指标方向不同. Text edit 越低越好, formula CDM 与 table TEDS 越高越好, reading-order edit 在 Table 1 的箭头标注还存在版面抽取歧义. 解析成绩时应回到官方 evaluator, 不能把所有列当成相同百分比. analysis 只比较论文明确给出的同列数字.

DeepSeek-OCR baseline 与 OCR 2 使用相同主要数据源, 但 OCR 1.0 sampling 改为 3:1:1, layout label 也被合并. 更均衡的 formula/table 数据可能直接改善对应指标, label 合并可能减少 layout 分类冲突. 若要证明 causal flow 单独贡献 3.73, 至少需要在新数据方案上训练旧 encoder, 或在旧数据方案上训练新 encoder.

Qwen2-0.5B 初始化还带来文本模型中的顺序先验. 虽然输入变成视觉 embedding, layer normalization, attention 与 FFN 已经学习处理因果序列. 定制 mask 把前半段改成双向, 后半段保留 causal pattern. 性能提升可能同时来自更大参数, LLM pretrained weights 和 mask 结构, 当前报告没有三者消融.

mBART 式 cross-attention 未收敛的观察提示优化路径敏感. cross-attention 通常让 query 读取固定 encoder memory, prefix self-attention 则让 visual token 与 query 每层共同变换. 两者初始化和梯度路径不同. 仅一次失败不足以归纳 cross-attention 上限, 但对本文训练预算而言, prefix 方案已被实验证明可训练且有效.

三阶段学习率逐步降低, 从第一阶段峰值 $10^{-4}$ 到第二阶段 $5\times10^{-5}$, 最终从 $10^{-6}$ 降到 $5\times10^{-8}$. 这与冻结范围扩大相配合: 初始化差异最大的 encoder 先获得较大更新, 接入成熟 decoder 后减小步幅, 最终只微调 decoder 适应固定视觉 distribution. 报告没有给 warm-up 和 weight decay 等全部参数, 复现仍需代码配置.

约 100M image-text pair 是第一阶段经过 packing 的样本暴露量, 不等于独立图像数量. 两个 resolution dataloader 和 OCR/general mixture 会重复采样. 第二与第三阶段只给 iteration 和 batch, 没给去重样本总量. 因而不能把 100M 与后两阶段直接相加, 也无法从论文计算每份文档经历多少 epoch.

生产 repetition 降低可能来自 reading order 改善, 也可能来自 decoder 第三阶段继续训练. decoder 在固定 encoder 上多训 20k iteration, 输出稳定性会改变. 若要隔离 encoder 对 repetition 的贡献, 应让两个模型使用等量 decoder training 或交换 encoder. 论文把 production 结果作为整套系统验证, 没有声称是严格消融.

文档 parser 为 LLM 预训练生产数据时, 错误会进入下一轮语言模型语料. repetition 容易造成大段重复 token, 对训练损失和数据体积影响明显, 因而即使它不是完整准确率, 也是重要运行指标. text omission 和 table corruption则需要更昂贵的抽样检查或可合成 ground truth 数据监控.

公式识别提升 6.17 个百分点, 可能与 causal order 对二维公式结构的建模相关. 分式应先关联分子分母, 矩阵按行列组织, 上下标依赖基符号. query 能从全图读取并按前序 query 条件化, 比固定 patch 顺序更容易形成局部表达式序列. 论文没有提供公式专属 attention 可视化, 该解释仍属于结构上的合理推断.

表格 TEDS 与 reading order 也共享层次关系. 输出一个 cell 前, 模型需要知道表头, 所在行列与相邻 cell; raster order 在合并单元格和多级表头中经常偏离语义. causal query 允许后续 slot 依赖此前聚合的表头信息. 但 query 使用 soft attention, 没有显式行列坐标, 极复杂表格仍可能需要 layout graph 或结构 decoder.

从失败模式看, query 数量等于 visual token 只是保守容量选择. 如果减少 query, 可以进一步压缩 decoder context, 但可能丢失高密度文本; 增加 query, 可以多次读取同一视觉区域, encoder 与 decoder 成本都会上升. 最有价值的消融是固定输入 token, 扫描 query/visual ratio, 分别报告准确率, reading order 与 latency. 论文只评价 $m=n$.

所谓两级因果流也不同于显式视觉搜索. query 不会调用裁剪工具, 放大新区域或根据中间结果重新运行 tokenizer. 所有信息在第一次前向时已存在于 visual prefix. 多次 re-examination 只是在 representation 中反复 attend, 无法恢复 tokenizer 未保留的细节. 真正主动视觉可能还要加入动态 crop 或 recurrent perception.

对一般 VLM, 输出不总是文档顺序. 图像问答可能先查看问题相关区域, 空间推理可能需要在物体之间往返. 固定 query causal order能否适应 prompt 条件取决于 encoder 是否看到文本 prompt. 本文公式中 prompt 主要进入 decoder, encoder 重排更像图像固有顺序. 若任务顺序依赖问题, 可能需要把文本条件也送进 query encoder.

模型名称中的 visual causal flow 容易被误解为严格因果发现. 这里的 causal 指 attention 可见性方向, 不是统计因果推断或干预关系. query $q_i$ 依赖 $q_{<i}$, 形成计算图上的因果顺序; 模型没有识别图像元素之间的因果机制. 使用时应把它理解为 autoregressive visual ordering.

综合来看, 报告给出的最强证据是同一 OCR 家族在更低最大 token 数下, overall, 文字, 公式, 表格与 reading order 同时改善, 并在两类生产流量中减少重复. 最主要证据缺口是 encoder 组件消融, 速度与显存测量, 以及文档之外的视觉任务. DeepEncoder V2 已证明是一种有效文档 encoder, 通用 2D reasoner 与 omni-modal encoder 仍是待验证方向.

Table 1 还同时列出 pipeline OCR 与 end-to-end VLM. pipeline 系统通常把 layout detection, recognition, formula 和 table parser 分开优化, end-to-end 模型用一个生成接口处理整页. DeepSeek-OCR 2 属于后者, 91.09 接近强 pipeline 的 92.86. 两类系统的 token 成本和模块数量不同, overall 可以比较输出质量, 不能据此断言端到端方案在吞吐和维护成本上全面占优.

Table 2 把 text, formula, table, reading order 的 edit distance聚合为 overall edit. Gemini-3 Pro 与 Seed-1.8 只报告 overall, 缺少分项, 所以无法判断 OCR 2 的优势来自文字还是布局. DeepSeek 两代的分项完整, 是分析 causal flow 机制更可靠的对照. 与闭源模型的比较只能支持相同 evaluator 下的总结果.

训练数据 80% 为 OCR, 剩余通用视觉数据用于维持较宽的视觉表示. 高 OCR 比例与文档基准匹配, 也可能限制自然图像泛化. 若未来把同一 encoder 用于通用 VLM, 需要重新平衡数据, 检查 causal query 是否仍会形成有用顺序. 文档上的 token arrangement 不一定适合物体密集的自然场景.

layout label 合并例如 figure caption 与 figure title, 会减少类别边界, 让 detection supervision 更稳定. 对最终 Markdown 而言, 两者可能采用相同输出结构, 合并不会明显损失信息. 但需要细粒度版面语义的下游任务可能需要重新区分. 数据标签简化是面向 OCR 输出目标的取舍, 不是通用 layout ontology.

如果要复现架构, 最关键的实现检查有四项: query 与 visual token 数必须对齐; mask 四个 block 的方向不能写反; projection 只能取后半 query output; multi-crop 的 global/local query 与位置组织必须和训练一致. 任一处错误都可能让 visual token 泄露未来 query, 或把未重排的 prefix 送入 decoder. 这些属于结构不变量, 应用小矩阵单测验证.

如果要复现实验, 还要锁定 OmniDocBench v1.5 evaluator, visual token 上限与 crop policy. 不同 image resize, OCR prompt 和停止条件会改变 edit distance. production repetition 的数据不可公开复算, 因而只能作为作者内部运行证据. 公共基准结果与开源权重才是外部复核的主要入口.

在部署监控中, 可以按文档类别分别记录字符 edit proxy, 空输出率, 重复率, token 使用量和 decoder 截断率. newspaper 与 research paper 的密度差异很大, 总体均值会掩盖特定类别退化. crop 数也应作为可观测字段, 便于判断错误来自视觉预算不足还是生成阶段. 论文的九类明细已经说明分类监控比单一 overall 更有诊断价值.

这些指标应与定期人工抽检共同使用, 防止自动代理指标遗漏新的失败类型.

## 6. 因果查询的计算结构与验证方法

**四块 mask 决定信息流方向.** 将视觉 token 写成 $V=(v_1,\ldots,v_m)$,query 写成 $Q=(q_1,\ldots,q_n)$. 每层注意力前的拼接序列为 $S=[V;Q]$. 对 query $q_i$,可见集合为

$$
\mathcal A(q_i)=\{v_1,\ldots,v_m,q_1,\ldots,q_i\};
$$

对视觉 token $v_j$,可见集合只有全部 $V$. 这使视觉表征先在全图双向聚合,query 再按一维因果顺序读取. query 的状态递推可以抽象为

$$
h_i=F_\theta(q_i,V,h_{<i}).
$$

$F_\theta$ 不是普通 RNN,因为每层 query 同时对全部视觉位置做注意力;因果性来自可见域,并不要求状态压缩为单个向量. 右上 mask 为零保证视觉 token 不受 query 影响. 若该块误开,第 $j$ 个视觉位置会读取未来 query 的可学习 embedding,视觉分支不再是独立全局记忆. 左下全一保证每个 query 都能查看完整图像;若错误改成下三角,query 只能读取部分 raster prefix,模型会重新受到固定空间顺序限制. **Query 顺序是一种条件分解.** 输出给 decoder 的 query representation 可写成联合条件分布

$$
p(H_Q\mid V)=\prod_{i=1}^{n}p(h_i\mid V,h_{<i}).
$$

模型没有显式监督 $h_i$ 应对应页面哪个区域. next-token loss 只要求整段 $H_Q$ 足以让 decoder 生成目标. 因而 latent order 具有不可辨识性:若同时改变 query 内部编码与 decoder 读取方式,多种顺序都可能得到相同输出概率. 所谓重排不能按硬 permutation 理解. 硬重排要求存在置换矩阵 $P$,使 $H_Q=PV$;实际注意力允许

$$
h_i=\sum_{j=1}^{m}\alpha_{ij}W_Vv_j+g(h_{<i}),
$$

一个 query 可混合多个位置,同一位置也可被反复读取. 更准确的称呼是「顺序化视觉摘要」:query 序列按因果槽位逐步形成可供 decoder 使用的视觉状态. **因果 query 为什么可能学习阅读顺序.** 假设 decoder 要生成标题 token $y_{1:r}$,随后生成正文 $y_{r+1:}$. 若前部 query 更早聚合标题区域,decoder 可以用较短注意路径获得标题信息;若视觉信息完全无序,decoder 仍可搜索全部 query,但要自己学习布局到输出的映射. 端到端梯度会偏好降低解码难度的 encoder 表示. 这种偏好不是唯一解. decoder 足够强时,它可能忽略 query 顺序,把 $H_Q$ 当作集合重新检索. reading-order 指标改善说明整套表示有利于顺序恢复,没有直接观测 query 与页面区域的一一对应. 要证明顺序形成,需可视化各 $q_i$ 的注意重心,测它与 ground-truth reading order 的秩相关,论文没有提供该分析. **双向视觉 prefix 提供静态记忆.**

每个 $v_j$ 经多层双向注意力后都含全图上下文. query 即使主要关注一个位置,读取到的也是已经融合布局的表示，而非孤立 patch. 这让前部 query 有机会判断某块是标题还是页脚,不必等待遍历整页. 代价是所有视觉位置在 encoder 中先做全局交互. 16 倍卷积压缩使 $m$ 控制在 256 或每 crop 144,否则 $m^2$ 成本很高. DeepEncoder V2 的顺序建模建立在「先全局理解,后因果读取」上,与人眼逐次注视原始高分辨率区域并不相同. **等量 query 是容量保守点.** $n=m$ 保证输出槽位数量不低于压缩后视觉位置. 这不会保证无损,因为每个 query hidden dimension 固定,attention 还会混合信息. 它至少避免在 query 层再次显式缩短序列.

若 $n<m$,query 层承担额外压缩,decoder KV 更短;若 $n>m$,多个 query 可从同一视觉记忆提取不同关系,适合反复阅读. 设 ratio $\rho=n/m$,encoder 拼接长度为 $(1+\rho)m$,dense attention 二次项随 $(1+\rho)^2m^2$ 增长,decoder 视觉前缀随 $\rho m$ 线性增长. 扩 query 会同时增加两段成本. 论文只用 $\rho=1$,因此不能判断最优点. 普通段落可能适合 $\rho<1$,复杂表格或几何图可能从 $\rho>1$ 受益. 动态 $\rho$ 需要页面难度路由. **query embedding 共享带来位置先验.** 第 $i$ 个 learnable query 在所有页面中共享参数,因果位置也固定. 即使没有显式监督,训练可能让早期 query 偏好标题和左上区域,后期 query 偏好尾部. 这是一种数据分布先验.

对阅读顺序异常的页面,固定 query 位置偏好可能造成错误. 例如海报中央标题先读,或表格需要先读顶部和左侧两个表头. 全图 attention 允许内容覆盖位置先验,能否覆盖取决于训练样本. 按文档类型测 query attention 可判断模型是动态重排还是复用了常见模板. **local crop 共享 query 不代表共享页面坐标.** 每个 768 crop 使用同一组 144 query embedding. 局部坐标原点在各 crop 内部重置,第一个 query 可能都偏向每块左上. 若 crop 在页面中的绝对位置没有显式编码,合并时需依靠输入排列或 global view 恢复位置. 局部块提供细节,global 256 token 提供坐标和整体阅读顺序. 若去掉 global view,各块内容仍可识别,拼接顺序可能退化. 一个关键消融应比较 local-only,global-only 与二者结合,论文只给完整动态模式. **Qwen2 初始化提供序列归纳偏置.**

Qwen2-0.5B 的 causal attention,RoPE,RMSNorm 与 FFN 已适应语言序列. DeepEncoder V2 将前 $m$ 个位置改为双向可见,后 $n$ 个继续因果. 权重初始化同时带来顺序处理能力和文本预训练统计. 视觉 embedding 分布与词嵌入不同,第一阶段必须重新对齐. 性能提升可能来自三部分:参数从 CLIP 约 300M 增到 Qwen2 encoder 约 500M,语言模型初始化,hybrid mask. 缺少等参数双向 Qwen 和随机初始化 causal Qwen 对照时,不能把 3.73 点全部归给 mask. **Prefix self-attention 与 cross-attention 的梯度路径.** prefix 结构中,V 与 Q 在每一层进入同一个 self-attention 投影. query loss 可通过 $K,V$ 投影回传到视觉状态,视觉状态自身又经多层双向更新. cross-attention 结构常先独立编码 V,query 再通过独立模块读取,两套参数和残差路径分开.

论文的 mBART 式方案未收敛,可能来自接口初始化,学习率或信息瓶颈,也可能来自视觉 memory 与 query 交互不足. 该负结果能说明作者配方下 prefix 更稳定,不能建立所有 cross-attention 的一般劣势. BLIP-2 等模型已经证明少量 query cross-attention 可以训练,任务与初始化不同. **Dense kernel 未必利用 block 稀疏性.** 四块 mask 中有右上 $m\times n$ 禁止区和 query 上三角禁止区. 若实现仍计算完整 $(m+n)^2$ score 再填 $-\infty$,FLOPs 不会按可见边数减少. 可见边数为

$$
m^2+nm+\frac{n(n+1)}{2}.
$$

当 $n=m$,约为 $2.5m^2$,完整矩阵为 $4m^2$,理论可跳过 37.5%. 是否实际节省取决于 kernel. 官方实现使用定制 Qwen2 encoder 与 FlashAttention/SDPA 路径,论文没有报告 mask 稀疏带来的速度. **Encoder 成本与 decoder 成本分开.** encoder 内部处理 $2m$ 位置,输出只保留 $m$ query. decoder 因而与上一代接收相近视觉长度,KV cache 不翻倍. 新增计算主要是 500M encoder 对混合序列的前向. 文档输出可能有数千文本 token,decoder 自回归成本占比较大;短 OCR 输出中,encoder 占比更高. 官方仓库称 PDF 并发速度与上一代相当,但没有同硬件完整表. 结构上不能直接推出等速,还要看 kernel,encoder 参数和生成长度. **视觉因果不等于统计因果.** 这里的 causal 表示 query attention 遵守时间方向,$h_i$ 不读取 $h_{>i}$. 它没有定义干预 $do(X=x)$,没有识别图像元素的因果图,也没有排除混杂. 「Visual Causal Flow」应理解为视觉表示的自回归信息流.

例如 query 先读标题再读正文,只说明计算依赖顺序,不说明标题导致正文. 如果把该模型用于因果问答,仍需专门数据和目标. 术语边界写清后,方法的新意仍然成立:视觉 encoder 首次显式加入可学习的因果读取序列. **Raster 顺序并非完全无效.** 大多数文档采用从左到右,从上到下或固定栏序,raster 提供强空间局部性. 双向 ViT 后的 token 虽按 raster 进入 decoder,每个 token 已含全局信息,decoder 也可重新注意. baseline 87.36 已说明固定顺序能完成大量任务. causal flow 的收益更可能集中在 raster 与语义顺序冲突的页面:多栏,表格,公式,混合图文. 若在单栏纯文本上提升也很大,原因可能包括更强 encoder 或训练数据变化. 按布局复杂度分层的消融比 overall 更能验证动机. **Reading-order edit distance 测的是输出顺序.**

指标比较预测元素序列与 ground-truth order. 从 0.085 降到 0.057 表明输出更接近标注顺序. 它没有直接测 query attention 顺序. decoder 自身改进,layout label 合并和更多训练也能影响输出. 因果 query 与指标方向一致,属于机制与结果的关联证据. 严格因果归因需固定数据和 decoder,只替换 mask 或 query. 论文没有完整消融,所以应将结论落在整套 DeepEncoder V2 上. **公式改善可以由树形依赖解释.** 二维公式包含基符号,上下标,分子分母和矩阵格. LaTeX 输出是一维深度优先或语法顺序. query 序列可以先聚合结构锚点,后续 query 根据此前状态读取从属区域. 以分式为例,先识别分数线和整体边界,再分别读取分子分母比单纯 raster 更接近 LaTeX 生成依赖. 但模型没有显式语法树监督,是否真的采用这一顺序未知. Formula CDM 从 84.14 到 90.31 支持表示更适合结构恢复,不能单独证明 attention 路径.

视觉 token 数为 $n=256+144k$,其中 $k\in[0,6]$. 每增加一块,token 增加 144,encoder 对相应 crop 单独运行,decoder 前缀也增长. 页面密度路由决定质量与成本. 固定最多 6 块会使超大或超密页面仍被压缩. 允许更多块可提高覆盖,也可能超过训练分布和上下文预算. 自适应策略应在模型见过的范围内选择,并监控截断. **三阶段训练对应三个坐标系对齐.** 第一阶段让 Qwen2 encoder 接受视觉 token 并让 query 可由轻量 decoder 解码,解决视觉—序列接口. 第二阶段接入最终 MoE decoder,让 query 表示进入目标语言空间. 第三阶段固定 encoder,让 decoder 在稳定输入上吸收更多数据. 每次冻结都把一侧变成参照坐标. 若所有模块始终共同移动,loss 可以下降,中间表示却可能持续漂移,后续大规模 decoder 训练更难复用缓存或稳定收敛. 冻结降低适应自由度,换取吞吐和目标稳定.

**第一阶段的轻量 decoder 是训练探针.** 轻量 decoder 不进入最终模型,职责是把 query 表示变成可监督文本. 如果 query 不能承载阅读内容,next-token loss 会直接推动 encoder 修正. 使用完整 3B decoder 从头对齐成本更高,强 decoder 还可能用语言先验掩盖 encoder 缺陷. 轻量 readout 能否迫使视觉表示更忠实,取决于容量. 太弱会限制训练上限,太强又失去探针作用. 论文没有给轻量 decoder 规模和消融,只能确认两阶段接口预训练是最终配方的一部分. **冻结 tokenizer 固定了局部信息上限.** 第二阶段开始 SAM-conv tokenizer 冻结. 后续 reading-order loss 能调整 query encoder,不能改变低层 patch 与下采样. 若报纸小字在 tokenizer 中已丢失,增加 query 也无法恢复.

冻结的好处是低层视觉分布稳定,训练内存降低. OCR 2 重点研究顺序而非重新学习字符感知,沿用上一代 tokenizer有利于比较. 新布局或更高分辨率任务可能需要解冻或重新训练前端. **第三阶段吞吐翻倍来自反向图缩短.** 冻结 encoder 后,无需保存其大部分反向激活,也不计算 encoder 参数梯度. 在相同硬件和 batch 下,训练速度超过两倍符合这一结构. forward 仍必须生成视觉 token,所以提升不等于 encoder 成本消失. decoder 数据量增加能改善语言展开,重复和格式. 因此 production repetition 下降可能部分来自第三阶段,不能单独视为 query 重排证据. reading-order benchmark 与架构动机更直接,仍受数据变化影响. **数据 sampling 改动影响分项权重.**

OCR 1.0 sampling 调成 3:1:1,意味着不同文档或任务子集的训练曝光改变. formula,table 和 layout label 合并也会改变优化目标. 若恰好增加结构数据,公式和表格提升不全来自 encoder. 严格消融应形成 2×2:旧/新 encoder 与旧/新数据配方. 只比较旧+旧和新+新时,能证明产品迭代有效,不能分解架构与数据贡献. 论文对数据变化作了说明,阅读结果时应保留这项混杂. **Overall 91.09 的组合不能当作单一准确率.** OmniDocBench 汇总文字 ED,公式 CDM,表格 TEDS 与 order 等异质指标. 各指标尺度和方向不同,overall 由 evaluator 规范聚合. 91.09 不表示每 100 字识别 91 个. 模型选择应查看自身文档类型. 普通合同关心文字与表格,科研论文关心公式,报纸关心小字和多栏. Overall 提供共同排名,分项决定是否满足任务. **Table 方向标注也需要以 evaluator 为准.**

reading-order edit distance 按定义越低越好,论文文字也把 0.085 降到 0.057 解释为改善. 若版面抽取中的箭头与此冲突,应以指标定义和官方 evaluator 行为判断. 不应为了表格符号强行反转结论. 类似地,CDM 与 TEDS 通常越高越好,文字 ED 越低越好. 将它们直接平均前必须按规范转换. analysis 引用同列变化,不自行重算 overall. **Repetition rate 反映一种明确失效.** 自回归 decoder 进入循环时,会重复行,段落或标签. reading-order representation 更清楚可能减少模型在页面位置上迷失,第三阶段 decoder 训练也可能增强终止. 在线从 6.25% 到 4.17%,PDF 从 3.69% 到 2.88% 是实用改进. 该指标只标记重复,漏段,错字和错序仍可能存在. 线上无 ground truth 时选择它是因为可自动观察,不表示其覆盖完整质量. 应把它放在健康监控而非准确率位置. **query attention 可解释性需要防止过度解读.**
