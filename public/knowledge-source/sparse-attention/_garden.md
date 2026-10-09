---
title: "Sparse Attention · 稀疏注意力机制"
description: 从复杂度、拓扑、动态路由到内核实现，理解长上下文注意力为何以及怎样变稀疏
published: true
---
# Sparse Attention · 稀疏注意力机制

第一次算 MHA 的计算量和 KV 读取量，我的反应很朴素：**他娘的这玩意也太贵了吧。** 2017 年的 Transformer 让每层每个 head 都拿自己的 Q、K、V，当前 query 与所有历史 key 做点积，再用 softmax 权重加权所有 value。长度为 $n$，分数配对就是 $n^2$；Decode 虽然每步只有一个新 query，却要把每层历史 K/V 再读一遍。Prompt 从 4K 拉到 128K，长度只多 32 倍，完整分数配对多 1024 倍。

后面近十年的主线，其实一直在追问四件事：**这一层的 Q 从哪来，K/V 是谁算的，Prompt 在 Prefill 到底走哪些层，Decode 时显存到底读了哪几份状态。** “复用”“压缩”“线性”“稀疏”这些词如果不能落到张量生产者、消费者和生命周期上，就还没解释清楚。

## 一条从少存 KV 到少跑 Prompt 的时间线

### 2017–2023: 先别让每个 head 都存一份

[Transformer](https://arxiv.org/abs/1706.03762) 的 MHA 是起点：第 $l$ 层输入 $H_l$ 来自上一层残差流，本层分别计算 $Q_l=H_lW_Q^l$、$K_l=H_lW_K^l$、$V_l=H_lW_V^l$。每层都生产自己的 KV，每个 KV head 都留一份历史。好处是表达最自由，代价是 KV cache 随层数、KV head 数和上下文长度一起增长。

2019 年 11 月提交的 [MQA](https://arxiv.org/abs/1911.02150) 没有删 token，而是让所有 query heads 共用一个 KV head。数据流仍是“本层 hidden state 投影出 Q/K/V”，只是 K/V 不再按 query head 复制。它省的是 Decode 每步要读的 KV 字节，代价是所有 heads 从同一份 K/V 取信息。2023 年 5 月的 [GQA](https://arxiv.org/abs/2305.13245) 把这条线调到中间：若干 query heads 共用一组 KV heads，cache 和带宽介于 MHA 与 MQA 之间。

另一拨人直接问：历史一定要逐 token 留着吗？2020 年 6 月的 [Linear Transformer](https://arxiv.org/abs/2006.16236) 用核特征映射和乘法结合律，把历史压进可递推状态。新 query 不再扫描全部 token KV，而是读固定大小状态。它把长度轴上的读取砍掉了，代价也很明确：状态是有容量上限的压缩，不能像 softmax attention 那样随时精确回看任意旧 token。后来 gated linear attention、DeltaNet 一类工作继续研究怎么写入、遗忘和纠错；混合模型则干脆穿插 softmax 层，让有限状态负责大多数位置，完整 attention 负责精确检索。

### 2024: MLA 先把“每个 token 存什么”压下去

2024 年 5 月的 [DeepSeek-V2](https://arxiv.org/abs/2405.04434) 提出 MLA。它没有直接删历史 token，而是把本来要缓存的高维 K/V 压成每个 token 的低维 latent，再在计算时吸收或恢复投影。和 MQA/GQA 沿 head 轴共享不同，MLA主要沿表示维度压缩；和线性attention把整段历史揉成固定状态也不同，MLA仍给每个历史 token 留一个latent，所以精确token寻址还在，cache仍随长度线性增长。

这一步很关键：后面的稀疏选择不必在最宽的原始 K/V 上做，但它也没解决“百万 token 每层都扫一遍”这个问题。省的是每 token、每层存多少字节，不是每个 query 要看多少历史位置。

### 2025: 不只是压表示，开始认真决定“看哪些块、哪些 token”

2025 年 2 月公开的 [NSA](https://arxiv.org/abs/2502.11089) 把压缩、选择、滑窗做成三个原生训练分支。Prompt进入某层后，压缩分支把重叠 token 块变成少量 compressed KV，并用这条分支已经算出的分数给原始连续块排名；selection分支回读 top blocks 的原始 KV；window分支单独处理最近 token，三路各做attention再门控相加。它省在训练、Prefill与Decode都不必算完整 $n^2$，代价是三套分支、block 粗粒度和离散选择。后来这篇工作拿下了 [ACL 2025 Best Paper](https://2025.aclweb.org/program/awards/)，也算是这一轮稀疏注意力热潮里相当醒目的一个节点。

同在 2025 年 2 月的 [MoBA](./2-动态路由/2.1-粗粒度选择/2.1.3-MoBA.md) 把历史切成 blocks。每个 query 先用块表示路由，再只对 top-k blocks 内的原始 K/V 做attention，并保留因果局部块。它可以把 $k$ 放大到全部blocks退化回full attention，训练迁移更平滑；代价是路由要准确，block越大越容易把无关邻居一起读进来，block越小又越难把GPU喂饱。

2025 年 9 月发布实验版本、12 月报告完整模型的 [DeepSeek-V3.2 / DSA](https://arxiv.org/abs/2512.02556) 又换了一种数据流：每层当前hidden state仍生成自己的主attention query与MLA KV，同时用轻量 Lightning Indexer 扫描历史 index keys，选出 token级top-k，再去主KV中gather。别把“轻量索引”理解成免费，它仍要全历史扫描低维状态；它省的是昂贵主KV的QK与读取，代价是索引器训练、top-k和随机gather。

2025 年 10 月的 [Kimi Linear / KDA](./1-基础/1.2-固定与混合连接/1.2.3-KDA与混合线性注意力.md) 回到有限状态路线。KDA基于delta rule更新矩阵状态，并用更细粒度门控制写入和遗忘；论文模型按层混合KDA与MLA。大多数层不保留全历史token KV，少数MLA层承担精确回看。它省cache和长Decode读取，代价仍是有限状态的信息碰撞，以及混合层留下的完整attention成本。

### 2026: 开始砍“层的副本”和“Prompt 必须走完所有层”

2026 年 6 月的 [DeepSeek-V4](https://arxiv.org/abs/2606.19348) 把token轴先压缩，再分成 HCA 与 CSA。HCA重压缩后读取全部compressed entries，没有top-k漏选，但压缩更狠；CSA用较细压缩表示，再从中选择少量entries做主attention。它们省的是序列轴上的KV与计算，代价分别落在压缩失真，以及“压缩失真+候选漏选”两道关口。

2026 年 9 月的 [HySparse2](https://arxiv.org/abs/2609.26368) 不满足于每层少看一点，它直接问 Prompt 为什么要把后半段网络也完整跑一遍。Self-Decoder先处理Prompt并产生不同深度的hidden states；Cross-Decoder需要的历史memory由这些状态桥接得到，Prompt Prefill可以在Self-Decoder结束。进入生成后，当前token仍沿Cross-Decoder残差流逐层产生各层Q，Cross层读取桥接的历史KV；其内部又保留HySparse式KV Reuse，让一个full层的KV与选择服务后续sparse层。外层省Prompt计算，内层省KV副本；代价是桥接表示必须够用，回滚、prefix cache和跨层状态生命周期更复杂。

同月的 [DeepSeek-V4.1-Flash](https://arxiv.org/abs/2609.19969) 把 CED 与 CSA2 放到一起。因果 encoder 处理 Prompt，产生 decoder 后续读取的 memory；decoder 当前层仍用自己的输入 hidden state 计算 Q。CSA2 又把层分成 Full、Reindex、Reuse：Full 生产主 KV、indexer K 与候选，Reindex 读取同一主 KV，但用当前层 query 重算索引；Reuse 继续沿用候选 positions。这样，多个消费者直接引用同一个生产者状态，无须为每层复制主 KV。CED 省去 Prompt 在传统 decoder 路径中的逐层重演，CSA2 继续减少主 KV、索引 K 与 top-k 结果的重复存算，FP4 则降低每个元素的字节数。代价是层间表示必须对齐，复用的候选可能陈旧，服务状态机也更复杂。

这条主线不是“新论文依次消灭旧论文”。MQA/GQA压head轴，MLA压每token表示，NSA/MoBA/DSA压可见token集合，KDA压成递推状态，HCA/CSA先压token再决定是否选择，HySparse2与CED/CSA2继续压层轴和Prefill执行路径。它们可以叠加，也可能互相冲突。每看到“复用”，都应该追问：**复用的是投影权重、投影后的KV、indexer K，还是最终top-k positions？生产者是谁？当前层自己的Q从哪来？**

回到最初的成本问题。Transformer 把任意两个 token 之间的直接交互写成一个稠密矩阵。训练要保存或重算中间量，Prefill要处理整段Prompt，Decode要逐步读取不断增长的KV cache。于是“支持长上下文”同时受计算、显存容量、显存带宽、通信和信息损失约束, 单个上下文窗口数字无法概括。

**Sparse Attention 是对允许发生的 token 交互施加结构约束，使实际计算的边集合远小于完整的 $n^2$ 条边。** 稀疏可以在训练前固定，也可以由当前输入动态决定；可以删去注意力分数，也可以继续删 KV cache；可以只在部分层使用，也可以与全局 token、局部窗口和低频稠密层组合。不同方法共享“少算一些连接”这一表面特征，却未必降低同一种成本。

设第 $i$ 个 query 允许访问的 key 集合为 $N(i)$，每个 head 的输出是

$$
o_i=\sum_{j\in N(i)}\frac{\exp(q_i^\top k_j/\sqrt{d_h})}{\sum_{r\in N(i)}\exp(q_i^\top k_r/\sqrt{d_h})}v_j.
$$

$q_i,k_j,v_j\in\mathbb{R}^{d_h}$ 分别是 query、key 和 value，$d_h$ 是单个 head 的维度。稠密注意力取 $N(i)=\{1,\ldots,n\}$；因果注意力还要求 $j\le i$；宽度为 $w$ 的滑动窗口令 $N(i)$ 只覆盖最近 $w$ 个位置。所有稀疏设计都可以先问三个问题：谁构造 $N(i)$，构造过程本身花多少代价，未被选中的信息还能否经由多层传播到达 $i$。

## 1. 成本不是一个数字

### 1.1. 训练、prefill 与 decode 的瓶颈不同

训练和 prefill 同时处理整段序列，注意力的矩阵乘法与分数张量通常随 $n^2$ 增长。FlashAttention 可以减少高带宽显存与片上存储之间的读写，并避免物化完整分数矩阵，但它没有改变稠密注意力需要覆盖的配对数量。稀疏拓扑若能由高效内核执行，才会把算术工作量从 $O(n^2d_h)$ 降到 $O(nkd_h)$，其中 $k=|N(i)|$ 是每个 query 的平均可见 key 数。

自回归 decode 每一步通常只有一个新 query。单步不会再生成 $n\times n$ 的分数矩阵，但要从 KV cache 读取此前的 key 和 value。随着上下文增长，decode 越来越受显存带宽限制。此时仅让分数计算稀疏而仍读取全部 KV，收益会很小；系统必须能在计算前确定要访问的块，或直接只保留允许访问的 KV。

### 1.2. 理论稀疏与实际加速

一个二值 mask 把大部分 logits 改成负无穷，并不自动节省计算。若实现仍先完成稠密的 $QK^\top$，再应用 mask，FLOPs、访存和临时张量几乎没有下降。可兑现的稀疏需要块化、规则化或索引结构，使 kernel 跳过无效块。块太小会让索引、分支和调度开销吞掉节省；块太大又会计算许多逻辑上无效的位置。

算法复杂度与硬件可实现性需要分开计算。论文中的边数决定渐近上限，块大小、数据布局、head 维度、batch、序列长度和硬件决定墙钟时间。**「稀疏率 90%」只描述 mask，不等于吞吐提高 10 倍。**

## 2. 拓扑决定信息怎样传播

### 2.1. 局部边、全局边和随机边

滑动窗口让相邻 token 直接交换信息。经过 $L$ 层后，信息最远大致传播 $Lw$ 个位置，因此层数也进入有效感受野。全局 token 同时连接所有位置，可在两层内中转远距离信息，但容量集中在少数向量上。Longformer 组合局部窗口与任务相关的全局位置；BigBird 再加入随机边，并从图连通性与通用逼近角度分析其表达能力。

固定拓扑的优势是索引可以提前生成，训练和推理行为稳定，kernel 容易针对规则块优化。代价是 mask 不看内容：相隔很远但语义相关的 token 可能没有直接边，局部窗口也无法提前知道哪一段历史会在数万 token 以后重新变得关键。

### 2.2. 动态选择与缓存选择

动态稀疏用 query、key 的内容或辅助摘要决定 $N(i)$。路由可以使用 top-k、聚类、哈希、块摘要或两阶段检索。它比静态窗口更可能保留远距离相关内容，却引入路由成本、负载不均衡和离散选择的训练问题。若为了选 top-k 必须先计算全部分数，就没有绕开二次复杂度；真正有效的路由先用便宜代理缩小候选集。

KV cache 压缩与 Sparse Attention 有交集，但两者不相同。淘汰方法改变「哪些历史状态还存在」，查询稀疏方法改变「本步读取哪些仍存在的状态」。已经删除的 KV 无法在后续 query 改变时恢复；只是不读取的 KV 仍可在下一步被选中。这个差别决定了方法能否处理延迟很长的引用。

## 3. 怎样读这座知识库

### 3.1. 从成本模型进入

[基础](./1-基础/1-基础.md)先固定记号和成本口径, 再沿[成本与阶段](./1-基础/1.1-成本与稀疏对象/1.1-成本与稀疏对象.md)、[静态图结构](./1-基础/1.2-固定与混合连接/1.2-固定与混合连接.md)、[混合与流式](./1-基础/1.2-固定与混合连接/1.2.2-混合拓扑.md)三条路线讨论 Longformer、BigBird、滑动窗口、局部—全局混合层与 attention sink。随后依次进入[动态路由](./2-动态路由/2-动态路由.md)、[KV 选择](./3-KV选择/3-KV选择.md)、[训练](./4-训练/4-训练.md)、[内核](./5-内核/5-内核.md)与[评测](./6-评测/6-评测.md)。阅读这些材料时，应把训练、prefill 和 decode 分开，把 FLOPs、峰值显存、KV 容量和 KV 读取分开。静态拓扑是最适合建立参照系的起点，因为选择集合与输入内容无关，哪些边存在可以直接画出并手算。

后续章节将进入内容相关路由、KV 选择、训练方法与稀疏 kernel。动态方法要与静态窗口在相同预算下比较：每个 query 实际读多少 token，路由器额外读取多少数据，召回关键 token 的失败怎样传播。系统章节则检查逻辑 mask 是否真的变成块级跳算，以及加速是否只在特定序列长度和 batch 上成立。

### 3.2. 一条统一的检查路径

遇到一种新方法，先写出其邻接矩阵 $M\in\{0,1\}^{n\times n}$，其中 $M_{ij}=1$ 表示 query $i$ 允许访问 key $j$。再计算每行非零数、跨层路径长度以及路由所需的临时状态。随后分别放进训练、prefill、decode：训练是否还要保存选择结果，prefill 能否块化，decode 能否在读完整 cache 之前得到索引。

正确性边界也要单独检查。局部语言建模收益不能推出长距离检索可靠；形式上的图连通不能推出有限深度模型能学会使用那条路径；缓存固定大小也不能推出长期任务状态被保留。Sparse Attention 的判断必须同时落在算法、模型行为和系统实现上，少一层都容易把局部结果外推成普遍结论。

## 4. 这条路线的边界

### 4.1. 稀疏并非长上下文的唯一轴

位置编码决定模型如何表示距离，训练数据决定模型是否见过长依赖，优化与并行策略决定长序列能否训练，状态空间模型和递归记忆则尝试绕开显式的 token 两两交互。稀疏注意力只改变交互图和相应状态访问，不能替代这些条件。一个 128K mask 若只在 8K 上训练，不会因为图可扩展就自动获得 128K 推理能力。

同样，稠密注意力也不意味着必然低效。FlashAttention 一类精确 kernel 在中等长度上可能比不规则稀疏实现更快；GQA、量化和分页 KV cache 可以降低 decode 的缓存压力，却不改变注意力图。工程选择应比较端到端延迟、吞吐、质量和实现复杂度，而不只比较渐近符号。

### 4.2. 从结构名称还原真实计算

复杂度离不开原始假设, 实验数字也离不开任务、模型规模和上下文长度。硬件吞吐还会随 kernel、精度、batch 和设备改变。脱离这些条件, 单个 benchmark 的提升无法回答另一种负载是否也会受益。

「某模型使用 Sparse Attention」至少包含一组可检验问题：哪几层稀疏，mask 是静态还是动态，每个 query 访问多少块，训练与 decode 是否采用同一拓扑，KV 是否保留，路由错误能否恢复，实际 kernel 是否跳过了无效工作。**邻接关系、状态生命周期和执行路径共同决定这个标签对应的真实设计。**

逻辑 mask 而没有对应 kernel，只能证明模型结构成立；kernel 吞吐而没有长依赖质量，只能证明执行效率。模型证据与系统证据同时成立，才足以判断方法能否用于真实长上下文负载。

## 5. 几类容易混淆的结论

### 5.1. 图结构、实现限制与实测结果

不同资料回答的问题并不相同。[Sparse Transformer](https://arxiv.org/abs/1904.10509)给出特定分解下的 $O(n\sqrt n)$ 复杂度；[Longformer](https://arxiv.org/abs/2004.05150)与[作者实现](https://github.com/allenai/longformer)展示局部、dilation 和任务全局注意力；[BigBird](https://arxiv.org/abs/2007.14062)及其[作者代码](https://github.com/google-research/bigbird)组合了局部、随机和全局块。理论复杂度描述边数如何增长, 代码中的块大小、静态 shape 与 kernel 限制决定这些边怎样落到机器上, 实验结果则只覆盖其给定设置。

[FlashAttention](https://arxiv.org/abs/2205.14135)与[官方实现](https://github.com/Dao-AILab/flash-attention)计算精确 attention, 重点是减少 HBM 访问, 并没有删除合法边。[Mistral 7B](https://arxiv.org/abs/2310.06825)把 GQA、SWA 与 rolling buffer 放进生成模型；[StreamingLLM](https://arxiv.org/abs/2309.17453)和[项目页](https://hanlab.mit.edu/projects/streamingllm)研究 attention sink 与流式推理。把它们放进同一张成本表时, 必须分别填写边数、KV 容量、读写量和 kernel 效率, 不能用其中一个数字替代其余三项。

### 5.2. 同一套公式能算什么

把不同方法写成邻接集合 $N(i)$, 可以直接复算边数、路径长度和状态容量。这些量由结构定义决定, 因而适合跨方法比较。质量、加速和硬件交叉点还受到训练数据、模型规模、kernel 与设备影响, 需要在对应设置中测量。

例如, $|N(i)|$ 可以由 mask 精确算出, 端到端时延却不能只由 $|N(i)|$ 推出；图上存在一条远距路径, 也不等于模型已经学会沿这条路径搬运信息。结构计算负责给出可核对的数量, 任务评测与 profiler 再回答质量和速度。
