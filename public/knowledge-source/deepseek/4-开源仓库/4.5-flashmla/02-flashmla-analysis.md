---
title: "02 · FlashMLA: MLA 解码为什么受计算限制, 以及 seesaw、FP8 KV 与稀疏化怎么落到 kernel"
category: "开源仓库"
tags: ["DeepSeek", "技术解析", "开源仓库", "MLA", "FlashMLA"]
published: true
excerpt: "以代码为准讲清 FlashMLA: 矩阵吸收后 MLA 退化成 head dim 576/512 的 MQA, 解码阶段因此落入计算受限区间; seesaw 双 warpgroup 调度绕开寄存器约束, FP8/FP4 KV 把访存与显存压下去, DSA top-k 把注意力复杂度从平方降到近线性."
---

# FlashMLA: MLA 解码为什么受计算限制, 以及 seesaw、FP8 KV 与稀疏化怎么落到 kernel

[FlashMLA](https://github.com/deepseek-ai/FlashMLA) 于 2025-02-24 在 DeepSeek 开源周第一天公开, 作者包括 Jiashi Li、Shengyu Liu、Yuanhang Sun, 采用 MIT 许可证. 2026-09-30 的 main 版本加入昇腾 kernel, 同时移除了 Hopper 与 V3/V3.2/V4.0 支持并修改 KV cache 格式. 早期 Hopper 解码 kernel 对应提交 [ba89a34](https://github.com/deepseek-ai/FlashMLA/tree/ba89a3466e9470ad08ab39738d4e7bb66989e1e7), 当前 SM100 稀疏 kernel 则对应 main 分支; 两代实现需要按提交区分, 不能混用接口和缓存布局.

FlashMLA 对外只做一件事: 注意力核那一截 $\mathrm{softmax}(QK^\top)V$ 的高性能实现, 不含前后的线性投影. 它支撑的模型从 2025 年的 DeepSeek-V3, 到 V3.2 的稀疏注意力, 再到 2026 年的 V4.1. 这条演进线上, kernel 的形态换过三轮: 先是 bfloat16 稠密 MLA 解码, 再是配 FP8 KV 的稀疏解码, 最终是把 norm、RoPE、cast 融进来的 fused kernel. 底层硬件也从 Hopper (SM90) 换到 Blackwell (SM100), 随后增加华为昇腾实现. 每次变化都同时改动数据布局、调度方式和可支持的模型版本.

## 1. 它解决的瓶颈: 解码阶段 MLA 为什么受计算限制

把 FlashMLA 和普通的 FlashAttention 分开看, 关键在一个反直觉的事实: 自回归解码阶段, 注意力一般受访存带宽限制, 而 MLA 的解码 kernel 却落在计算受限区间. 这个差别决定了整套优化的方向, 也决定了 kernel 的形状. 要讲明白, 得先看矩阵吸收把 MLA 变成了什么.

两类瓶颈需要不同的优化手段. 受访存限制的 kernel 要减少读写并提高带宽利用率, 例如加快 KV 搬运、提高缓存命中; 受计算限制的 kernel 卡在 Tensor Core 的矩阵乘吞吐, 要让标量运算与矩阵乘重叠, 尽量缩短 Tensor Core 的空闲时间. MLA 解码属于后者, 当时主流解码注意力 kernel 则主要围绕省带宽调优, 因此 FlashMLA 采用了独立实现.

### 1.1. 矩阵吸收后 MLA 退化成 MQA, 以及 576/512 的形状从哪来

MLA 的低秩潜变量与解耦 RoPE 推导见 llm-guide 的 [03-MLA-低秩潜变量与解耦RoPE](../../../LargeLanguageModelGuide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md), 矩阵吸收的工程实现见 [04-MLA-矩阵吸收与工程实现](../../../LargeLanguageModelGuide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/04-MLA-矩阵吸收与工程实现/04-MLA-矩阵吸收与工程实现.md). FlashMLA 接收的形状由这两项设计直接决定: MLA 把每个 token 的 KV 压成一个低秩潜变量 $\mathbf c^{KV}_t$ (维度 $d_c=512$), 再加一段解耦 RoPE 的 key $\mathbf k^R_t$ (维度 $d^R_h=64$). 推理时, 原本要为每个 head 还原出 $\mathbf k, \mathbf v$ 的上投影 $W_{UK}, W_{UV}$ 可以被「吸收」进 query 侧和输出侧的矩阵: $W_{UK}$ 并进 $W_{UQ}$, $W_{UV}$ 并进 $W_O$. 吸收后, 注意力分数可以由 query 直接与潜变量做内积, 无须先展开成每个 head 的 key.

吸收的结果是形状塌缩. 社区里 [杨文博的分析](https://yangwenbo.com/articles/understand-flashmla-in-deepseek-mla-formulas.html) 把这步讲得很直接: q 的形状从 $128\times192$ 变成 $128\times576$, k 从每 head 一份变成一份共享的 $576$ 维, v 变成 $512$ 维, 而且 v 就是 k 的前 $512$ 维, 第二份 KV 不再单独存在. 这里的 $576 = 512 + 64$ 是潜变量 $d_c$ 加 RoPE 的 $d^R_h$, $512$ 是潜变量本身. 一旦所有 query head 共享同一份 $576$ 维的 key、同一份 $512$ 维的 value, 这就退化成了 Multi-Query Attention. FlashMLA 的接口如实反映了这点: `flash_mla_with_kvcache` 的 docstring 写明 `head_dim` 必须 512、`num_heads_k` 必须 1 (只支持 MQA), 见 [`flash_mla_interface.py`](https://github.com/deepseek-ai/FlashMLA/blob/main/flash_mla/flash_mla_interface.py).

需要划清一条边界: 矩阵吸收这步发生在模型建模代码里, 不在 FlashMLA 里. 开源推理框架约定的 attention 算子只负责 $\mathrm{softmax}(QK^\top)V$ 那一行, 前后的 $W_{UQ}, W_{UK}, W_{UV}, W_O$ 投影由框架的 MLA 模块 (如 SGLang 的 `DeepseekV2AttentionMLA`) 实现. 所以 FlashMLA 收到的 q 已经是吸收后的 $576$ 维 latent query, kv 已经是 $576$ 维的 latent. 这条边界解释了一个容易误解的点: 库名叫 FlashMLA, 但它导出的 `flash_mla_with_kvcache` 本质是个输入形状特殊的 MQA 算子, MLA 的灵魂 (低秩压缩) 在它上游已经做完了.

这条边界也顺带解释了 KV cache 为什么能小到可以放进显存. 吸收前, 每个 token 要为 128 个 head 各存一份 key 和 value, 若按 MHA 的 $d_h=128$ 算, 一个 token 的 KV 是 $128\times128\times2 = 32768$ 个元素; 吸收后只存一份 $576$ 维的 latent, 一个 token 是 $576$ 个元素, 两者差约 57 倍. 正是这个压缩比让 128K 上下文的单请求 KV 从不可接受降到 GiB 量级, 也正是它让后面 FP8 量化的收益 (再省一半字节) 变得有意义: 先靠低秩把量级压下来, 再靠量化抠细节, 两步叠在一起才撑得起长上下文的大 batch 推理.

### 1.2. 计算访存比约 $2 h_q s_q$ 与 128 这个阈值

把形状代进 roofline 分析, 就能看出为什么解码阶段也会计算受限. 官方 [20250422 deep-dive](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250422-new-kernel-deep-dive.md) 给了完整推导: 设 q 头数 $h_q$, 每请求 q token 数 $s_q$, kv token 数 $s_k \gg h_q s_q$, K 与 V 的头维 $d_k, d_v$. 浮点运算量约 $2 h_q s_q s_k (d_k + d_v)$, 访存量 (字节) 约 $2 s_k d_k$ (因为 $s_k$ 份 kv 占大头, 每份 $d_k$ 个 bfloat16). 两者相除, 计算访存比约 $h_q s_q \cdot \frac{d_k + d_v}{d_k} \approx 2 h_q s_q$.

这个比值是普通 MHA 解码的几十倍. 普通 MHA 每个 query head 自带一份 KV, 读一份 KV 只喂一个 head 算, 计算访存比接近 1, 所以解码受带宽限制. MLA 退化成 MQA 后, 一份 $576$ 维的 latent 要喂 $h_q = 128$ 个 query head 一起算, 访存被这 128 个头摊薄, 算力这边却实打实地算了 128 遍. 代进 H800 的数字: 峰值带宽 $3.35$ TB/s, 降频后实际峰值算力约 $865$ TFlops, 临界点在 $h_q s_q \ge \frac{1}{2}\cdot\frac{865}{3.35} = 128$. DeepSeek 的线上推理系统在解码实例上不开张量并行, 所以 $h_q$ 就是满的 $128$, 正好压在计算受限这一侧.

这解释了为什么整套 kernel 的优化目标是「让 Tensor Core 一直忙」, 而不是「省带宽」. 一个受计算限制的 kernel, 瓶颈在 Tensor Core 的 GEMM 吞吐; 要提速, 就得让 CUDA Core 上的 softmax、缩放这些标量运算与 Tensor Core 的矩阵乘重叠起来, 别让 Tensor Core 停下来等 softmax. 下面的 seesaw 调度就是冲这个目标设计的. 这里也埋了一个伏笔: 一旦 KV 用 FP8 存, 反量化又要占 CUDA Core, 计算受限的瓶颈会从「softmax 挡路」变成「反量化挡路」, 这是第 4 节 Hopper crossover 要解决的问题.

## 2. 解码 kernel 的数据流: paged KV、split-KV、tile 调度与 combine

受计算限制的 kernel 要跑满, 前提是把活均匀铺到所有 SM 上, 并且让每个 SM 的输入数据按需、按时到位. FlashMLA 解码路径的数据流由三件事拼成: 分页的 KV 缓存与 indices 寻址、把长 KV 序列切成多段的 split-KV、以及负责分配与合并的 tile scheduler 加 combine kernel. 这三件事从 2025-02 的首发版一直延续到现在, 接口细节随版本改过, 但骨架没变.

这三件事各管一段. 分页 KV 管「数据在显存里怎么放、怎么按下标取」, 解决的是长序列、变长 batch 下的显存碎片问题; split-KV 管「一条长请求怎么拆给多个 SM 并行」, 解决的是单 SM 串行扫 128K token 太慢、又喂不满 SM 的问题; tile scheduler 加 combine 管「谁算哪一段、算完怎么拼回去」, 解决的是负载均衡和部分结果的正确合并. 三者配合才让计算受限的 kernel 既不空闲也不算错. 下面分两块讲: 先是 KV 的组织与寻址, 再是调度与合并.

### 2.1. paged KV 块与 indices 寻址

首发版 (2025-02) 的 README 写明 KV 缓存采用 BF16 分页 (paged) 布局, 块大小为 64. KV 被切成每块 64 个 token 的固定 block, `block_table` 记录每条序列对应的物理 block. 这套布局来自 vLLM 的 PagedAttention, 不同长度的序列可以共享物理显存, 无须按最长序列预留连续空间. 历史 kernel 代码中的断言 `FLASH_ASSERT(params.page_block_size == Kernel_traits::kBlockN)` 要求页大小等于 kernel 的 N 维 tile, 见 [`flash_fwd_mla_kernel.h` (b31bfe7)](https://github.com/deepseek-ai/FlashMLA/blob/b31bfe72a83ea205467b3271a5845440a03ed7cb/csrc/flash_fwd_mla_kernel.h).

到了稀疏版 (2025-09 之后), 寻址方式变了. 稀疏 kernel 不再用 `block_table` 做间接寻址, 而是让调用方把 page block 下标直接编进 `indices`. 当前接口的契约写得很细: `indices_in_kvcache[i][j][k] = (token t 所在 page block 的下标) * page_block_size + (token t 在该 block 内的偏移)`, 其中 $t$ 是第 $i$ 个 batch、第 $j$ 条 query 序列的第 $k$ 个 token. 因为物理地址已经算进 `indices`, kernel 内部不再需要 `block_table`, 但为兼容旧签名仍要求传 (传 `None` 即可). 仓库提供了 `abs_indices2indices_in_kvcache` 做这步转换, 把逻辑下标 (0 到 $s_k-1$) 映射成带 page block 的物理下标, 见 [tests/quant.py](https://github.com/deepseek-ai/FlashMLA/blob/main/tests/quant.py).

无效项的处理是个容易踩的坑. 解码 kernel 只把恰好等于 $-1$ 的下标当无效, 不做任何上界检查; 任何其他越界正值都会产生越界的 TMA 地址, 直接非法访存. 这条在 `flash_mla_with_kvcache` 的 docstring 里专门标了出来. prefill kernel 宽松一些, 无效项可以是 $-1$ 或任意 $\ge s_{kv}$ 的数. 这个差异来自两条路径的实现: decode 为了省掉边界判断的分支把检查外包给了调用方, prefill 则在 gather 前做了 mask. 对接模型时, 调用方必须保证 decode 的无效位严格填 $-1$.

页大小选 64 不是随手定的. 块越大, `block_table` 越短、寻址间接层越薄, 但显存碎片越多 (一条序列的尾部不满一块也要占整块); 块越小碎片越少, 但寻址表变长、每次 gather 的随机访存更碎. 64 是在这两端之间的折中, 也和 kernel 里 N 维 tile 的粒度对齐, 让一块 KV 正好是一次 TMA 搬运的单位. 稀疏化之后这层的意义又变了: 因为 top-k 下标本来就是随机分布的, 稀疏 kernel 每次只按 `indices` 取少量 token, 页大小更多是影响 `indices` 编码时 block 下标乘以多少, 而不再决定连续扫描的粒度.

### 2.2. tile scheduler、split-KV 与 combine

单条请求的 KV 可能很长 (128K token), 一个 SM 串行扫完太慢, 也喂不满所有 SM. split-KV 的做法是把一条请求的 KV 序列沿 token 维切成若干段, 每段分给一个 SM 算出部分的注意力输出和对应的 log-sum-exp, 最终再合并. FlashMLA 用一个 tile scheduler 来决定怎么切、怎么分. 首发接口里 `get_mla_metadata(cache_seqlens, num_heads_per_head_k, num_heads_k)` 在解码循环前跑一次, 根据各请求的序列长算出 `tile_scheduler_metadata` (形状 `(num_sm_parts, TileSchedulerMetaDataSize)`) 和 `num_splits` (形状 `(batch_size + 1)`), 目标是让各 SM 的负载尽量均衡.

当前接口把这步做成了惰性的. `get_mla_metadata()` 不再带参数, 只返回一个空的 `FlashMLASchedMeta` 占位对象, 真正的调度元数据在第一次调用 `flash_mla_with_kvcache` 时由 C++ 侧 `sparse_decode_fwd` 生成并写回. 元数据对象里带了一份 `Config` (记录 `b`、`s_q`、`h_q`、`page_block_size`、`topk` 等), 后续调用会断言形状一致, 复用同一份元数据能省掉重算. 文档特别提醒: `topk_length` 和 `extra_topk_length` 的值不在校验范围内, 复用带不同 `topk_length` 的元数据会静默沿用过时的 split-KV 调度. 还有一个 `enable_batch_invariant` 开关, 置 True 会关掉 split-KV 路径, 让结果不依赖 batch 怎么切分, 代价是放弃 split 带来的并行度, 见 [`flash_mla_interface.py`](https://github.com/deepseek-ai/FlashMLA/blob/main/flash_mla/flash_mla_interface.py).

合并由一个独立的 combine kernel 完成. 历史代码里 `flash_fwd_splitkv_mla_combine_kernel` 以 `dim3(params.b * params.h * params.seqlen_q)` 的网格启动, 每个线程块负责一个 (batch, head, q token) 的输出, 把各 split 的部分结果按 log-sum-exp 重新归一后相加, 见 [`flash_fwd_mla_kernel.h` (b31bfe7)](https://github.com/deepseek-ai/FlashMLA/blob/b31bfe72a83ea205467b3271a5845440a03ed7cb/csrc/flash_fwd_mla_kernel.h). split 产出的 kernel 和 combine kernel 之间用 programmatic dependent launch 重叠: combine 不必等 split 全部结束, 可以在 split 快写完时提前启动, 省掉一次 kernel 启动的串行等待. `num_splits` 的分桶上限也随版本调过, 2026-07 的提交把 decode-combine 的 `num_splits` 桶扩到了 256, 对应极长序列下更细的切分.

合并的正确性靠 log-sum-exp 的可组合性撑着. 每个 split 独立算自己那段 KV 的在线 softmax, 产出一个部分输出和一个部分 lse; 合并时, 两段的 lse 决定各自的权重, 按 $\exp(lse_i - lse_{\max})$ 重新归一后相加, 等价于把两段当成一段从头算. 这就是为什么 kernel 既返回 `out` 也返回 `lse`: lse 不只是给上层看的调试量, 它是 split-KV 合并的必要中间态. `enable_batch_invariant` 开关关掉 split 路径, 换来的是结果不依赖 batch 怎么切, 用在需要逐位复现的场景 (比如对拍、调试数值问题); 代价是放弃了 split 的并行度, 长序列下会变慢. 这是一个明确的正确性与速度的取舍, 放在接口上让调用方按场景选.

## 3. seesaw 双 warpgroup 流水

seesaw 是 2025-04-22 性能更新的核心, 把 H800 计算受限场景从 580 TFlops 推到 660 TFlops. 它要解决的问题很具体: 在寄存器放不下两份输出矩阵的约束下, 怎么让 CUDA Core 的标量运算 (softmax、缩放) 和 Tensor Core 的矩阵乘重叠起来. 这一节先讲约束为什么卡死了常规做法, 再把 12 步调度拆开看它怎么绕过去.

重叠这件事为什么难, 得回到注意力的两类运算. QK 内积和 score-V 乘积是矩阵乘, 跑在 Tensor Core 上; 求行最大、减最大、取指数、归一化、按新最大缩放旧累加器, 这些是逐元素的标量运算, 跑在 CUDA Core 上. 一个 KV 块的处理里, 这两类运算有先后依赖: 要先算完 QK 才能做 softmax, 做完 softmax 才能算 score-V. 如果串行走, Tensor Core 在做 softmax 时就闲着, CUDA Core 在做 GEMM 时也闲着. 要让两种单元都忙, 就得同时处理两个 KV 块, 让一个块的 softmax 和另一个块的 GEMM 错开进行, 而这正好撞上寄存器放不下两份累加器的墙.

### 3.1. 寄存器约束: 为什么不能照搬 FlashAttention-3 的 ping-pong

FlashAttention-3 的提速靠两招: warpgroup 间的 ping-pong 调度, 和 warpgroup 内的 GEMM-softmax 流水. ping-pong 的前提是手上有两份独立的输出累加器, 让两个 warpgroup 一个做 GEMM、一个做 softmax, 轮流占用 Tensor Core 和 CUDA Core. 但 MLA 这里有个硬约束: WGMMA 指令要求输出矩阵必须在寄存器里. 一个 $64\times512$ 的输出矩阵占 32768 个 32 位寄存器, 而每个 SM 只有 65536 个. 也就是说, 一个 SM 的寄存器只够放一份输出矩阵, 放不下两份. 没有第二份累加器, 经典 ping-pong 就没法直接搬过来.

官方 deep-dive 在这里留了一句「你可以先停下来想想有没有比我们更好的方案」. DeepSeek 的解法是在 FlashAttention 的在线 softmax 之上再加一步数学变换: 既然放不下两份完整的输出矩阵, 就把一份 $64\times512$ 的输出竖切成两半 $O_L$ 和 $O_R$ (各 $64\times256$), 分别交给两个 warpgroup 维护; 对应地, 每一步取两个 KV 块 $K_0, K_1$ (在 MLA 里 $K$ 和 $V$ 是同一份 latent, 名字不同), 把 $V_0, V_1$ 也各切成左右两半. 这样两个 warpgroup 各自只扛半份输出, 寄存器压力减半, 又能互相错开占用 Tensor Core 和 CUDA Core.

### 3.2. 12 步 seesaw 与细粒度 TMA 流水

seesaw 的 12 步 (编号 0 到 11) 可以这样读: warpgroup 0 维护 $\vec o_L$, warpgroup 1 维护 $\vec o_R$, 两者共享一个运行最大值 $m$. 步骤 1、2 两个 warpgroup 并行算各自的注意力分数 $\vec p_0 = \vec q K_0^\top / qk\_scale$ 和 $\vec p_1 = \vec q K_1^\top / qk\_scale$ (Tensor Core 上的 GEMM). 步骤 3 到 5, warpgroup 0 算 $\vec p_0$ 的行最大、更新 $m$ 和缩放因子 $scale_0 = \exp(m\_new_0 - m)$、做 softmax、再把 $\vec o_L$ 缩放后累加 $\vec p_0 V_{0L}$. 步骤 6 到 8, warpgroup 1 对 $\vec p_1$ 做同样的事, 并把 $\vec o_R$ 按 $scale_0 \cdot scale_1$ 缩放后累加 $\vec p_1 V_{1R}$. 步骤 9 到 11 是交叉补账: $\vec p_0$ 再乘 $scale_1$, warpgroup 1 把 $\vec p_0 V_{0R}$ 补进 $\vec o_R$, warpgroup 0 把 $\vec o_L$ 缩放后累加 $\vec p_1 V_{1L}$.

这套调度数学上和 FlashAttention 的在线 softmax 完全等价, 省了什么也看得出来: 当一个 warpgroup 在 CUDA Core 上做 softmax 和缩放时, 另一个 warpgroup 的 Tensor Core 正在做下一块的 GEMM, 两种单元交错占用, Tensor Core 不空转. 跨 warpgroup 的同步量是两个: 共享的运行最大值 $m$, 和交叉传递的缩放因子 $scale_0, scale_1$. 社区的 [源码走读](https://blog.gitcode.com/250939d29a456621b1025f60e4be53fb.html) 把它定位到历史文件 `splitkv_mla.cuh` 的 `flash_fwd_splitkv_mla_kernel`, 两个分支 `wg0_subroutine` / `wg1_subroutine` 分别对应两个 warpgroup, 共享内存里的 `sScale0`/`sScale1` 存缩放因子、`sM` 存运行最大值, 用 `NamedBarrier` (如 `sScale0Ready`、`sP0Ready`) 和 `cute::warpgroup_wait` 精确编排依赖. 这些细节是社区转述, 核心的 12 步算法以官方 deep-dive 为准.

交叉补账的那三步 (9 到 11) 是整套调度最容易看错的地方, 值得单独讲明白它为什么必须存在. $\vec o_L$ 本该收 $\vec p_0 V_{0L}$ 和 $\vec p_1 V_{1L}$, $\vec o_R$ 本该收 $\vec p_0 V_{0R}$ 和 $\vec p_1 V_{1R}$. 按 warpgroup 的分工, warpgroup 0 先把本块的 $\vec p_0 V_{0L}$ 加进 $\vec o_L$、warpgroup 1 先把 $\vec p_1 V_{1R}$ 加进 $\vec o_R$, 这是两个 warpgroup 各自手里的数据, 不用等对方. 但 $\vec p_0 V_{0R}$ 和 $\vec p_1 V_{1L}$ 是交叉项: $\vec o_R$ 要用到 warpgroup 0 算出的 $\vec p_0$, $\vec o_L$ 要用到 warpgroup 1 算出的 $\vec p_1$. 这两项只能等对方的 softmax 结果就绪后再补, 补的时候还要带上这期间 $m$ 更新引入的 $scale_1$ 修正. 这就是步骤 9 到 11 的来历, 也是 seesaw 比直白的双缓冲多出来的那点数学代价 — 换来的是只用一份输出矩阵的寄存器就能跑两路流水.

seesaw 调度仍要处理访存延迟, 数据没有就绪时 Tensor Core 只能等待. 实现采用两项优化. 第一项是细粒度 TMA 拷贝与 GEMM 流水: 一个 $64\times576$ 的 K 块拆成 9 次 TMA 拷贝, 每次搬运 $64\times64$; 第一块到达后立即启动 GEMM, 后续搬运与计算并行. 第二项是缓存提示: TMA 拷贝使用 `cute::TMA::CacheHintSm90::EVICT_FIRST`, 实验显示可以提高 L2 命中率. 两项优化配合 seesaw, 在 H800 SXM5 上达到最高 80% 的 Tensor Core 利用率(相对降频后的理论峰值)和 3 TB/s 带宽. 访存受限场景比旧的 ping-pong 缓冲版慢约 2%, 官方认为线上解码主要受计算限制, 因而接受这项取舍.

## 4. FP8 / FP4 KV 量化与反量化瓶颈

V3.2 把上下文从 64K 翻到 128K, 显存压力立刻顶上来: 单个 128K token 的请求, MLA KVCache 约 $576\times2\times62\times128\times1024 = 8.72$ GiB (出自 [20250929 Hopper FP8 deep-dive](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250929-hopper-fp8-sparse-deep-dive.md)). 这会直接 OOM, 或者逼小 batch 导致 GPU 吃不满. FP8 KV 缓存是应对这个的直接手段, 但它带来一个新瓶颈: 反量化要占 CUDA Core, 把本来计算受限的 kernel 变成反量化受限. 这一节讲量化格式怎么演进、反量化瓶颈怎么绕过去.

KV 量化同时影响存储格式和计算路径. 显存中的量化格式决定每个 token 占多少字节; kernel 内的反量化则决定要消耗多少 CUDA Core 周期, 以及 Tensor Core 能否持续获得输入. FlashMLA 的三代格式变化与 Hopper 上的 crossover 优化都围绕这两个约束展开.

### 4.1. 量化格式: 从 656 到 528 / 288 字节

Hopper FP8 版 (2025-09) 的格式是每 token 656 字节. 做法是细粒度量化: 对每 token KV 的前 512 维 (NoPE 部分) 做 tile 级量化, tile 大小 $1\times128$, 得到 512 个 `float8_e4m3` 值和 4 个 `float32` scale (每 128 个值共用一个). 剩下 64 维 (RoPE 部分) 对精度敏感, 不量化, 保留 bfloat16. 合计 $512 + 4\times4 + 64\times2 = 512 + 16 + 128 = 656$ 字节. 反量化在 kernel 内做: 512 个 `float8_e4m3` 先转成 512 个 bfloat16, 再和 RoPE 的 64 个原始 bfloat16 拼接, 最终用 bfloat16 精度的 MMA 做 MQA (QK gemm 与 score-V gemm 的输入都是 bfloat16, 输出 float32).

V4.1 版 (2026-09) 改了格式, 也是 2026-09-30 那次不兼容变更的一部分. 当前 README 和 `quant.py` 给了两种: V4.1 每 token 528 字节, V4.1 fp4 每 token 288 字节. 528 字节版把全部 512 维 (含 RoPE 的 64 维) 都量化成 `float8_e4m3`, scale 改用 16 个 `float8_e8m0` (每 32 个连续值一个), 合计 $512 + 16 = 528$, 不再有 bfloat16 部分. 288 字节版更激进: 512 个值用 `e2m1` (fp4) 编码, 每字节装 2 个 (偶数下标在低半字节), 占 256 字节; scale 用 32 个 `float8_e4m3` (每 16 个连续值一个), 合计 $256 + 32 = 288$. fp4 格式只在主 cache 是 V4.1 fp8 格式时用于 `extra_k_cache`. 这些口径和量化步骤见 [tests/quant.py](https://github.com/deepseek-ai/FlashMLA/blob/main/tests/quant.py) 的 `quantize_k_cache`, 里面 NoPE 的 scale 按 amax/448 取、fp4 的 scale 按 amax/6 取 (6 是 e2m1 的最大幅值), 并处理了 NaN tile 的边界.

格式从 656 到 528 的变化不只是省了 128 字节的 RoPE. `quant.py` 的 `KVCacheLayout` 把 V4.1 fp8 描述成「14 个 NoPE tile 加 2 个 RoPE tile」, tile 大小 32、共 16 个 tile; fp4 则是「28 个 NoPE tile 加 4 个 RoPE tile」, tile 大小 16、共 32 个. 把 scale 从 `float32` 换成 `float8_e8m0` (一个字节表示 2 的幂次) 是关键: 它把 scale 的开销从每 128 值 4 字节压到每 32 值 1 字节, 又因为 e8m0 只存指数, 配合 CUDA 13.2 的原生 `cvt.rn.bf16x2` 能更快地还原. 这也是 README 为什么推荐 CUDA 13.2 以上: 13.1 上这个转换要退回经 FP32 的较慢加宽路径.

fp4 版把精度推到了更极端的一端. e2m1 只有 2 位指数、1 位尾数, 能表示的幅值只有 $\{0, 0.5, 1, 1.5, 2, 3, 4, 6\}$ 这 8 个 (含符号位共 16 个码), `quant.py` 的 `_E2M1_MAGNITUDES` 把它们列了出来, scale 取 amax 除以 6 (6 是 e2m1 的最大幅值). 这么粗的量化只敢用在 `extra_k_cache` 上, 即主 KV 用 fp8、额外一段 KV 用 fp4, 而不是整个 cache 都 fp4. 代码里还处理了一个边界: 某个 tile 里只要有一个 NaN, 整个 tile 的 scale 就被标成 NaN (fp4 本身没有 NaN 编码, NaN 只能藏在 scale 里), 反量化时这个 tile 整体失效. 从 656 到 528 再到 288, 每一步都是拿精度换字节, 换来的是同样显存能放下更大 batch 或更长上下文.

### 4.2. 反量化受限与 Hopper 的 crossover

反量化为什么会成为瓶颈, Hopper FP8 deep-dive 算了一笔周期账. 每个 SM 每周期能做 4096 次 MMA Flops (H800 上按 $989\ \text{TFlops} / 1830\ \text{MHz} / 132\ \text{SMs}$ 算). 若每个 CTA 处理 64 个 query head, 每个 K/V token 的 MMA 只要约 $64\times(576+512)\times2 / 4096 \approx 34$ 周期. 但 H800 不能直接把 `float8_e4m3` 转 bfloat16, 要走四步: e4m3 转 half、half 转 float32、float32 转 bfloat16、再乘 float32 scale. 按 NVIDIA 文档的吞吐, 每 token 反量化至少 $(\frac{1}{64}+\frac{1}{64}+\frac{1}{16}+\frac{1}{256})\times512 \approx 50$ 周期. 50 比 34 大, 意味着 Tensor Core 要停下来等 CUDA Core 反量化, kernel 落到反量化受限.

crossover 利用了 MQA 的一个事实: 同一个 query token 内的每个 query head 都看同一批 key. V3.2 有 128 个 query head, 而每个 CTA 只处理 64 个. 如果两个处理不同 query head 子集的 CTA 能共享反量化后的 K/V, 每个 CTA 就只需反量化一半. 实现靠 Hopper 的分布式共享内存 (DSM): 以 cluster 大小 2 启动 CTA, 每个 CTA 加载一半量化 K/V、在 CUDA Core 上反量化自己那一半、存进自己的共享内存, 同时用 `st.async` 把结果写进另一个 CTA 的共享内存, 用 cluster transaction barrier 同步. 交换完成后两个 CTA 的共享内存里都有完整的反量化 K 与 V. 这个名字来自减数分裂里的染色体交叉.

效果是把反量化的 50 周期砍半, Tensor Core 不再空等. H800 SXM5 的计算受限配置 (`batch_size=128, num_heads=128, s_q=2, topk=2048`) 下拿到 410 TFLOPS, 相比没有 crossover 的上一版 250 TFLOPS 是明显提升. 这个 410 仍低于 bfloat16 稠密解码的 640 TFLOPS 峰值, 一个原因是它是稀疏 kernel 且 topk 只有 2048, topk 越小前导收尾的相对开销越大; 把 topk 设到 32768, 该 kernel 最高能到 460 TFLOPS. 换个口径看: 上述配置下它的执行时间与序列长约 3000 时的稠密解码相当, 超过 3000, 稀疏的优势越来越明显. crossover 依赖 Hopper 的 DSM 和 CTA cluster. 2026-09-30 后主分支移除了 Hopper 支持; 转到 SM100 后, 反量化改走 Blackwell 原生的 fp8 转换路径, 原先的 crossover 调度也就不再适用.

## 5. 稀疏化: DSA 的 top-k 怎么配进 kernel

FlashMLA 的稀疏 kernel 支撑 DeepSeek Sparse Attention (DSA). 要讲清它和 DSA 怎么配合, 得先分清职责: 挑哪些 token (打分、取 top-k) 不在 FlashMLA 里, FlashMLA 只吃已经挑好的 `indices`. 这条边界决定了 kernel 的接口形状, 也决定了它能把复杂度从平方降到近线性的原因.

模型侧的 lightning indexer 负责算分并取 top-k, 产出一张下标表; FlashMLA 根据这张表, 只在指定位置上计算完整注意力. token 选择不进入注意力 kernel, 所以接口只接收 `indices`, 没有 indexer 参数. `indices` 的共享约束以及 prefill、decode、fused 三条路径, 共同决定不同 query 如何访问各自选中的 token.

### 5.1. indices 契约与 MQA 共享

DSA 的机制在 llm-guide 和 V3.2 解析里有完整推导, 见 [deepseek-v3-2-analysis](../../1-模型技术报告/1.7-deepseek-v3-2/02-deepseek-v3-2-analysis.md), 这里只讲和 kernel 对接的部分. DSA 分两步: lightning indexer 给每个 query token 和它之前的每个 token 算一个索引分 $I_{t,s}=\sum_{j=1}^{H^I} w^I_{t,j}\cdot\mathrm{ReLU}(\mathbf q^I_{t,j}\cdot\mathbf k^I_s)$, 这是个多头查询、单头键的小注意力, 头少 (V3.2 里 $H^I=64$)、可用 FP8、不做 softmax 也不取 value; 第二步按索引分取 top-k ($k=2048$) 个位置, 只在这些位置上做完整 MLA 注意力. 主注意力复杂度从 $O(L^2)$ 降到 $O(L\cdot k)$, 其中 $k=2048 \ll L=128\text{K}$.

indexer 这步 (打分加取 top-k) 在 V3.2 的模型代码里 (如 `fp8_index_kernel`), 不在 FlashMLA 里. FlashMLA 收到的是 indexer 输出的 top-k 下标, 装进 `indices` 张量. 解码路径的 `indices` 形状是 $(\text{batch\_size}, \text{seq\_len\_q}, \text{topk})$, prefill 路径是 $[s_q, h_{kv}, \text{topk}]$. 注意 prefill 的 $h_{kv}$ 维: DSA 基于 MLA 的 MQA 模式实例化, 每个 latent (KV 条目) 被该 query token 的所有 query head 共享, 所以 $h_{kv}$ 必须是 1, kernel 里会 squeeze 掉这一维. 这正好对上第 1 节的结论: 吸收后所有 head 共享一份 latent, 稀疏选择也就只需为每个 query token 选一套 KV, 不必为每个 head 各选一套. 这是 DSA 能做 kernel 级加速的前提, V3.2 论文里把它写成每个 KV 条目必须被多个 query 复用.

训练侧有一个容易忽略的细节, 和 kernel 的职责边界呼应: indexer 的输入从主模型的计算图里 detach 出来单独优化, 它的训练信号只来自 indexer 自己的损失, 主模型按语言建模损失优化 (据 V3.2 技术报告, 稀疏训练阶段学习率 7.3e-6, 每 query 选 2048 个 KV token, 主模型与 indexer 训 15000 步, 每步 480 条 128K 序列, 合计 943.7B token). 把挑选逻辑从主注意力里拆出来、又在计算图上断开, 正好让 FlashMLA 这种只吃下标的算子能独立优化: kernel 不关心下标怎么来的, 只保证在给定下标上把注意力算快算对.

### 5.2. prefill / decode / fused 三条路径与可选项

prefill 路径 `flash_mla_sparse_fwd` 最直白, README 给了等价 PyTorch: 按 `indices` 从 kv 里 gather 出 `focused_kv` ($[s_q, \text{topk}, d_{qk}]$), 算 $P = Q\,\text{focused\_kv}^\top \cdot sm\_scale$, 对无效位填 $-\infty$, softmax 后 $S\,\text{focused\_kv}$ 得输出. 它不支持 batch 维, 多 batch 要 reshape 输入并调整 `indices` 来模拟. 一个边界被单列出来: 完全没有有效下标的 query token, kernel 返回 $max\_logits = -\infty$、$lse = +\infty$ 和全零输出, 而朴素伪代码会产出 NaN. decode 路径 `flash_mla_with_kvcache` 吃分页的量化 KV cache, 要求 $head\_dim$ 为 512、$num\_heads\_q$ 为 64 或 128、KV cache 连续可访问 (不能是分散的内存块), 其余契约见第 2 节.

两条路径都有两个可选项值得点出. `attn_sink` ($[h_q]$, float32) 给定后, 输出再乘 $\exp(lse) / (\exp(lse) + \exp(attn\_sink))$, 相当于给 softmax 分母加一个固定的 sink 项, 对 lse 和 `max_logits` 没影响; $+\infty$ 会让对应输出变零, $-\infty$ 无效果. `topk_length` ($[s_q]$, int32) 给定后, 第 $i$ 个 query token 只看前 $\text{topk\_length}[i]$ 个下标, 用来处理不同 query 的实际 topk 不等的情况, 比起用 mask 填充能省掉后面的计算. 这两个可选项把不同 query 看不同数量的 token 这件事做进了 kernel, 省掉上层的对齐开销.

fused kernel (2026-09, V4.1) 是第三条路径, 把 Q-norm (只在 V4 用, V4.1 不用)、Q-RoPE、核心注意力、O-RoPE (共轭) 与 cast-to-FP8 融进一个 kernel, 去掉这些小 kernel 的启动与往返开销, 代价是要事先置换 `Q_b` 和 `Wv` 权重 (README 给了 `permute_q_b_proj` / `permute_wv_proj` 的用法). 它的输出直接是 FP8, 由下游的 Wv 投影用 DeepGEMM 的 `fp8_einsum` 消费, 省掉一次 cast. 官方建议优先用这条路径: B200 加 CUDA 13.3 上 prefill 最高 1460 TFlops、decoding 最高 950 TFlops, 其中 prefill 的数字甚至高于纯稀疏 prefill 的 1350. 它目前只支持 CUDA, 不支持昇腾. 此外仓库还保留一条稠密 MHA prefill 与反向路径 (`flash_attn_varlen_func` 一族), 用于 V4 系列里仍需稠密注意力的部分, 反向目前不支持 GQA, 只实例化了 (192, 128) 和 (128, 128) 两对 head dim.

## 6. 版本演进、性能数字口径与局限

FlashMLA 从 2025-02 首发到 2026-09 换了几轮形态, 性能数字也跟着跳. 把这些数字放一起看, 要先对齐口径: 哪张硬件、什么形状、对谁作基线、出自哪个版本. 不对齐口径, 660、640、410、1024、1460 这些 TFlops 会互相打架. 这一节按时间线把演进和数字理一遍, 再讲清适用边界.

性能数字必须同时标明硬件、形状、基线和版本. 「稀疏解码」在 Hopper 上为 410、在 B200 上为 1024, 差异第一步来自硬件代际; 同一张 B200 上, 稀疏 prefill 为 1350、fused prefill 为 1460, 后者还计入了额外融合算子. 缺少这些条件时, 数字之间没有可比性.

### 6.1. 从 2025-02 到 2026-09 的演进与性能表

演进的主线是三轮. 第一轮 (2025-02 到 2025-04) 是 bfloat16 稠密 MLA 解码: 首发版块大小 64 的分页 BF16 KV, 访存受限约 3000 GB/s、计算受限约 580 TFlops; 2025-04 的 seesaw 更新把计算受限推到 660 TFlops, 接口向后兼容. 第二轮 (2025-09) 随 V3.2 加稀疏: token 级稀疏 prefill 与配 FP8 KV 的稀疏解码, Hopper 上 prefill 640、decode 410 TFlops, crossover 是关键. 第三轮 (2026-09) 随 V4.1 换到 Blackwell: 新的 528/288 字节 KV 格式、fused norm-RoPE-attn-RoPE-cast kernel, 并在 2026-09-30 移除 Hopper 与 V3/V3.2/V4.0 支持、加上华为昇腾 kernel.

下面这张表把 README 里散落的数字按口径归拢. 同一行才可比, 跨行不可直接比大小.

| 数字 | 版本 / 日期 | 硬件 | 形状 / 配置 | 对比基线 | 出处 |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 3000 GB/s · 580 TFlops | 首发, 2025-02 | H800 SXM5, CUDA 12.6 | BF16 稠密解码, 访存受限 / 计算受限 | — | 首发 README |
| 660 TFlops | seesaw, 2025-04 | H800 SXM5 | BF16 稠密解码, 计算受限 | 旧版 580 | 20250422 deep-dive |
| 410 TFlops | 稀疏, 2025-09 | H800 SXM5 | FP8 稀疏解码, batch=128, heads=128, $s_q=2$, topk=2048 | 无 crossover 版 250 | 20250929 deep-dive |
| 640 TFlops | 稀疏, 2025-09 | H800 SXM5 | 稀疏 prefill | — | 2025-09 README |
| 1024 TFlops | V4.1, 2026-09 | B200, CUDA 13.3 | 稀疏解码单测 | — | 当前 README |
| 1350 · 1460 TFlops | V4.1, 2026-09 | B200, CUDA 13.3 | 稀疏 prefill / fused prefill | — | 当前 README |
| 410 · 360 TFlops | 昇腾, 2026-09 | Ascend 950 NPU | 稀疏 prefill / decode (硬件峰值 95% / 83%) | — | 2026-09 README |

读这张表要抓两个口径陷阱. 一是「访存受限」和「计算受限」是两种配置下的两个数, 3000 GB/s 是带宽、580/660 是算力, 不能换算. 二是稀疏解码的 410 (Hopper) 和 1024 (B200) 不同代硬件不同版本, B200 的峰值本就高得多, 1024 不是「crossover 又快了一倍」的意思. fused kernel 的 950 (decode) 低于稀疏解码单测的 1024, 是因为 fused 把 norm、RoPE、cast 一起算进端到端, 分母里多了这些融合项, 这个在第 2 节对照译稿的疑惑块里也点过.

### 6.2. 局限与适用条件

适用条件很硬. 当前 main 分支只跑 NVIDIA SM100 / SM103 (Blackwell) 或华为昇腾 950, CUDA 要 13.1 以上 (推荐 13.2 以上, 否则 fp8 转 bf16 退回慢路径). 解码只支持 FP8 / FP4 KV、只支持稀疏 (`is_fp8_kvcache` 必须 True、`causal` 必须 False、必须传 `indices`), 不再支持未量化的 bfloat16 KV, 也不再支持稠密因果解码. 形状被钉在 MLA 的 MQA 模式: `head_dim` 512、`head_dim_v` 512、`num_heads_q` 为 64 或 128、`num_heads_k` 为 1. 稠密 MHA prefill 只实例化了 (`head_dim_qk`, `head_dim_vo`) 为 (192, 128) 和 (128, 128) 两对, 反向还不支持 GQA. 要跑 Hopper 或前代模型, 只能回退到 2026-09-15 的那个提交.

还有几条使用上的坑. 复用 `tile_scheduler_metadata` 时, `topk_length` / `extra_topk_length` 的值不被校验, 换了值而复用会静默用过时的 split-KV 调度, 结果错而不报错. 解码路径对 `indices` 不做上界检查, 只认 $-1$ 为无效, 其他越界正值直接非法访存, 这把边界检查的责任完全推给了调用方. fused kernel 要求事先置换 $W_{Q_b}$ 和 $W_V$ 权重, 接入成本不低, 且只支持 CUDA. 服务重启后这些都是无状态的纯算子, 没有续跑问题, 但上游的 KV cache 和 indices 需要调用方自己维护一致性.

把这些放到更大的图景里看: FlashMLA 是 DeepSeek 推理栈里专门啃「注意力核那一截」的件, 它的每一次形态变化都对着一个具体的模型需求 — 580 到 660 对着 V3 解码要吃满算力, FP8 稀疏对着 V3.2 的 128K 长上下文要压显存, fused kernel 对着 V4.1 要省小算子开销. MLA 的压缩思路见 [deepseek-v2-analysis](../../1-模型技术报告/1.3-deepseek-v2/02-deepseek-v2-analysis.md), DSA 的稀疏思路见 [deepseek-v3-2-analysis](../../1-模型技术报告/1.7-deepseek-v3-2/02-deepseek-v3-2-analysis.md). FlashMLA 的角色始终是把这些模型侧的设计翻译成能喂满硬件的 kernel, 它的局限也正来自这种专一: 形状、精度、硬件卡得越死, 单点性能越高, 通用性越弱.

## 参考文献

- [FlashMLA 仓库](https://github.com/deepseek-ai/FlashMLA) (deepseek-ai/FlashMLA, MIT, 2025-02 首发)
- [A Deep-Dive Into the New Flash MLA Kernel](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250422-new-kernel-deep-dive.md) (seesaw 调度, 2025-04-22)
- [A Deep Dive Into The Flash MLA FP8 Decoding Kernel on Hopper](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20250929-hopper-fp8-sparse-deep-dive.md) (FP8 KV 与 crossover, 2025-09-29)
- [A Deep Dive Into the Ascend Sparse Attention Forward Kernel](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20260930-ascend-prefill-deep-dive.md) (昇腾实现, 2026-09-30)
- 杨文博, [理解 FlashMLA 在 DeepSeek MLA 计算过程中的位置和作用](https://yangwenbo.com/articles/understand-flashmla-in-deepseek-mla-formulas.html)
- AtomGit / GitCode, [FlashMLA 新内核深度解析: Seesaw 调度、细粒度 TMA 流水线与 H800 上的 660 TFlops MLA 解码](https://blog.gitcode.com/250939d29a456621b1025f60e4be53fb.html)
