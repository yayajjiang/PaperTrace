---
title: "02 · DeepGEMM 技术解析: Hopper FP8 GEMM 的二级累加 、 细粒度 scale 布局与持久化调度"
category: "开源仓库"
tags: ["DeepSeek", "技术解析", "开源仓库", "FP8", "GEMM", "Hopper"]
published: true
excerpt: "从代码出发讲清 DeepGEMM 怎么绕开 Hopper FP8 tensor core 的 14 位截断累加, 用 CUDA core 做二级累加恢复精度, 以及 UE8M0 scale 布局 、 TMA warp 专精 、 持久化 block swizzle 、 grouped GEMM 两种布局分别服务训练 prefill 与 decode. "
---

# DeepGEMM 技术解析: Hopper FP8 GEMM 的二级累加 、 细粒度 scale 布局与持久化调度

仓库 [deepseek-ai/DeepGEMM](https://github.com/deepseek-ai/DeepGEMM) 采用 MIT 许可证, 2025-02-25 作为 DeepSeek 开源周第三天的项目发布. 初始提交 `a6d97a1` 只支持 Hopper (SM90) FP8; 到 2026-09-30 的 `057ca59` (Public release 26/09/30), DeepGEMM 已从单一 FP8 GEMM 扩成统一的 tensor core kernel 库, 覆盖 FP8 / FP4 / BF16 GEMM、带通信重叠的 Mega MoE、为 lightning indexer 服务的 MQA 打分 kernel, 以及 HyperConnection 相关 kernel, 全部经 DeepJIT 在运行时编译. 具体实现分布在 `deep_gemm/include/` 的 kernel、`csrc/apis/` 的 host 接口与 `docs/scaling-factor-format.md`. 训练侧需求与量化原理可结合[DeepSeek-V3 技术报告解析](../../1-模型技术报告/1.4-deepseek-v3/02-deepseek-v3-analysis.md)和[FP8 混合精度训练详解](../../../LargeLanguageModelGuide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/02-FP8混合精度训练详解/02-FP8混合精度训练详解.md)阅读; DeepGEMM 接收的是已经量化的张量和 scale, 其主要工作是安排这些数据进入具体的 kernel 路径.

## 1. 它解决的瓶颈与版本演进

### 1.1 为 DeepSeek-V3 的 FP8 训练与推理提供干净的 GEMM

DeepSeek-V3 把线性层的前向与反向大量放到 FP8 上算, 用的是细粒度分块量化: 激活按 $1\times128$ 一组 、 权重按 $128\times128$ 一组, 每组一个 FP32 scale. 这套方案把离群值的影响限制在它所在的小块内, 其他块可以用更合适的 scale, 从而在 8 位尾数的前提下保住数值范围. 量化本身的动机与误差分析在上面两篇已有文章里讲过, DeepGEMM 处在它们的下游: 它不负责量化 cast, 只消费已经量化好的 FP8 张量和对应的 scale, 把 $D = C + A @ B$ 这步算快算准. README 的 Notices 一节明确写了这一分工, 输入转置和 FP8 cast 要调用方自己融进上游 kernel.

把 GEMM 单独拎出来做一个库, 原因在于 FP8 GEMM 在 Hopper 上有两个绕不开的难点, 都不是通用 BLAS 库会专门处理的. 一是 tensor core 的 FP8 累加精度不够, 直接用会让训练发散, 需要在 kernel 内部补一层高精度累加; 二是细粒度 scale 让每个 $128$ 长的 K 片都要乘一个不同的因子, 这打断了 tensor core 连续累加的节奏, 要用额外的调度把乘 scale 的开销藏起来. 这两点正是第 2 节的主题. 初始版本的 README 自述核心 kernel 只有约 300 行, 目标是作为学习 Hopper FP8 矩阵乘优化的干净样本, 这个定位一直保留到今天.

### 1.2 从 Hopper FP8 到统一 kernel 库的演进

DeepGEMM 的能力随 DeepSeek 自身模型和系统需求分批加入. README 的 News 与对应 PR 记录了这些主要节点:

- 2025-02-25 首发: 只支持 Hopper (SM90) FP8, 稠密 GEMM 加 MoE 的 contiguous / masked 两种 grouped GEMM.
- 2025-05-14 (#95): 为 dense 与 MoE 反向加入权重梯度 kernel, 对应 K 轴分组的需求.
- 2025-07-20 (#112): 同时支持 SM90 与 SM100, 并把 JIT 重构成低 CPU 开销的 C++ 模块; 由于 NVCC 12.9 会自动做 FFMA interleaving, 原先的 SASS 后处理脚本退役.
- 2025-09-28 (#200): 为 DeepSeek-V3.2 的 lightning indexer 加入带权 ReLU 的 MQA 打分 kernel.
- 2026-04-16 (#304) 与 2026-09-30 (#462): 引入 Mega MoE 、 FP8xFP4 GEMM 、 FP4 indexer 、 PDL, 以及 locality domain 等优化, 并发布昇腾移植版 DeepGEMM-Ascend.

这条线索有一个清楚的方向: 早期是「把 V3 训练用到的 FP8 GEMM 做到极致」, 中期是「把反向和新架构 (SM100) 补齐」, 后期是「把 MoE 的通信和计算融成一个 mega-kernel, 并支持 V3.2 的稀疏 attention 打分」. 对读代码的人来说, 一个现实的影响是: 2025-07 的重构把文件结构从单个 `fp8_gemm.cuh` 拆成了 `deep_gemm/include/deep_gemm/impls/` 下按架构和数据类型分的多个文件 (如 [`sm90_fp8_gemm_1d1d.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/impls/sm90_fp8_gemm_1d1d.cuh)), 社区里 2025 年初那批解读文章引用的行号和文件名已经对不上当前代码, 但核心数据流没变.

## 2. Hopper FP8 累加精度与 CUDA core 二级累加

### 2.1 FP8 tensor core 的定点累加只保留 14 位

README 提到的「imprecise FP8 tensor core accumulation」在官方 issue [#50](https://github.com/deepseek-ai/DeepGEMM/issues/50) 中有具体说明. Hopper 的 FP8 GEMM 在 tensor core 内部使用定点累加: 各个尾数乘积按最大指数右移对齐后相加. DeepSeek 的实验发现, 符号位填充右移后只保留每个尾数乘积的最高 14 位, 其余位被截断. 沿 K 方向累加大量 FP8 乘积时, tensor core 因而产生约 14 位尾数精度的中间值, issue 将其记作 FP22, 低于完整 FP32 累加精度. 长 K 下累积的截断误差可能影响训练收敛.

这里的额外精度损失来自累加器, 与 FP8 输入的量化误差是两件事. 把 K 轴切成较短的分段后, tensor core 只负责段内累加, 每段结果再进入 FP32 累加器, 截断误差便被限制在段内. DeepGEMM 取 scale 的 K 粒度 $128$ 作为段长: 每 $128$ 个 K 元素完成一次 tensor core 累加, 取出结果、乘 scale, 随后累加到 FP32. 反量化与二级累加因此落在同一个位置.

### 2.2 二级累加的实现: `accum` 与 `final_accum` 两个累加器

在 [`sm90_fp8_gemm_1d1d.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/impls/sm90_fp8_gemm_1d1d.cuh) 的 math warp group 里, 每个线程持有两组寄存器累加器: `accum[WGMMA::kNumAccum]` 接 tensor core 的 WGMMA 输出, `final_accum[WGMMA::kNumAccum]` 做最终的 FP32 累加, 初值为 $0$. 内层对一个 $128$ 长的 K block 发若干条 WGMMA, 结果落在 `accum`; 等 `warpgroup_wait<0>()` 确认这批 WGMMA 完成后, 代码读入这一 block 对应的 A scale ($\text{scale\_a\_0}$ 、 $\text{scale\_a\_1}$, 对应该线程负责的两行) 和 B scale, 然后做一步 promotion:

```cpp
final_accum[i * 4 + 0] += scale_a_0 * scale_b_0 * accum[i * 4 + 0];
final_accum[i * 4 + 1] += scale_a_0 * scale_b_1 * accum[i * 4 + 1];
final_accum[i * 4 + 2] += scale_a_1 * scale_b_0 * accum[i * 4 + 2];
final_accum[i * 4 + 3] += scale_a_1 * scale_b_1 * accum[i * 4 + 3];
```

这段 FFMA 跑在 CUDA core 上, 乘的是两个 FP32 scale 的积, 加到 FP32 的 `final_accum`. 下一轮 K block 会把 `accum` 覆盖重算, 而 `final_accum` 持续累加. 这就是「二级累加」: 第一级是 tensor core 内部对一截 K 的低精度定点累加 (每 $128$ 个 K 出一个 FP22 级中间结果), 第二级是 CUDA core 把每截的结果乘 scale 后以 FP32 累加. 它不是 FP8 到 BF16 再到 FP32 的类型转换链, 这一点 issue #50 的提问者一开始就问错了方向, 官方作了纠正.

值得单独点出的是读 scale 的位置. 代码注释写明, 所有对共享内存的 scale 读取必须排在 `warpgroup_arrive()` 之前, 否则下一个被调度的 block 可能污染结果. A scale 由 math warp 自己从共享内存读 (`smem_sfa`), B scale 也在 math warp 读 (`smem_sfb`), 而 A 、 B 、 A 的 scale 由 TMA warp 负责搬入. 社区解读把这解释成一种负载均衡: 不把所有搬运都压给生产者 warp, 让消费者分担一点 scale 的加载.

### 2.3 细粒度 scale 的两种粒度与 1d1d / 1d2d 的分叉

DeepGEMM 对 scale 粒度的处理分成两套 kernel. [`sm90_fp8_gemm_1d1d.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/impls/sm90_fp8_gemm_1d1d.cuh) 对应 A 、 B 都是一维 scale 的情形 (A 按 $1\times128$ 、 B 也按每 $128$ 一个), 它的 promotion 里 B scale 对一个 N 方向的 block 是均匀的, 两行 A scale 乘同一个 B scale 即可. [`sm90_fp8_gemm_1d2d.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/impls/sm90_fp8_gemm_1d2d.cuh) 对应 B 用二维 $128\times128$ 块 scale 的情形, 这正是 V3 权重的量化方式. 此时一个 `BLOCK_N` 内可能跨越两个不同的 B scale, promotion 要区分前半和后半.

代码里用 `kMustUseUniformedScaleB` 和 `num_former_iters` 处理这个分叉. 当 `BLOCK_N` 是 `BLOCK_K`(即 $128$) 的整数倍且不需要非均匀 scale 时, `kMustUseUniformedScaleB` 为真, 一个 block 只读一个 B scale; 否则读两个 ($\text{scale\_b\_0}$ 和 $\text{scale\_b\_1}$), 并用一个编译期能定下来的 `num_former_iters` 决定前多少个累加分量用前一个 scale 、 其余用后一个. 源码注释特别强调「把它做成谓词 (predicate) 对性能很重要, 比写成两个循环好」, 因为谓词配合 `num_former_iters` 的编译期常量化, 让编译器能把分支消成无分支的选择. 这是细粒度 scale 布局在 kernel 内部留下的痕迹: 不规整的 $128\times128$ 边界要靠编译期常量和谓词化来消化, 而不能在运行时用普通分支.

## 3. 细粒度 scale 的布局与对齐要求

### 3.1 UE8M0 打包与 MN-major 的 TMA 对齐

`docs/scaling-factor-format.md` 把 scale 张量的契约写得很细, 核心是两件事: SM100 上 scale 用 UE8M0 格式打包, 以及 scale 张量必须是 MN-major 且 TMA 对齐. UE8M0 是只有 8 位指数 、 没有尾数和符号的格式, 代表一个 $2$ 的整数次幂. 文档 1.2 节要求每个 FP32 scale 值必须恰好是 $2$ 的幂 (位模式 `[0][8 位指数][23 位尾数全 0]`), 设备侧用 `DG_TRAP_ONLY_DEVICE_ASSERT((value & 0x807fffffu) == 0)` 断言. 打包时把 K 方向连续 4 个位置的 8 位指数塞进一个 `int32`, 按 K 下标小端排列, 于是 $4$ 个 UE8M0 占一个 `torch.int`.

MN-major 和对齐是为 TMA 服务的. 文档 7.2 节给出的内存图里, 转换后的张量形状是 $[\text{mn}, \text{packed\_sf\_k}]$, stride 是 $[1, \text{align}(\text{mn}, 4)]$, 即 MN 维连续, 每个 K 切片占 $\text{align}(\text{mn}, 4)$ 个 `int32`. 这里的 $4$ 来自常量 `ALIGN_MN = 16 bytes / sizeof(int32)`, 因为 TMA 要求末尾一维的 stride 是 $16$ 字节的倍数. 切片之间多出来的填充槽 (图里的 `__`) 只为对齐存在, 永远不会被当数据读. 对 M 分组的 PSUM 布局, 组与组之间还有 gap 行, 转换时不读这些行的输入, kernel 为它们写 $0$ (一个安全的有限 scale 码, 因为 UE8M0 的 `0xff` 是 NaN), GEMM 永不消费这些值.

### 3.2 两条提供路径与 recipe 的广播语义

文档第 2 节给了两条提供 scale 的路径, 分别服务原型和生产. 路径 A 传未转换的 `float32` scale, 每次 GEMM 调用内部都会启动一个转换 kernel 把它变成所需布局, 适合调试和正确性测试. 路径 B 传已经打包好的 `int32` scale, kernel 只校验布局不再转换, 适合生产: 权重转换一次缓存复用, 激活直接从量化 cast kernel 产出满足契约的 `int32`. `transform_sf_into_required_layout` 是这两条路径的统一入口, 它的分发表 (文档第 4 节) 按输入 dtype 、 粒度和架构决定是转置 、 打包还是只校验.

一个容易踩的点是 recipe 在两条路径下的差异. 路径 B 要求传给 GEMM 的 recipe 满足 $\text{gran\_m} = \text{gran\_n} = 1$, 因为转换过程已经沿 MN 把 scale 广播开了, 只剩 K 粒度有意义. 文档 6.2 节还给出一个更隐蔽的坑: `fp8_einsum` 会在内部把每个操作数及其 scale 置换成 $(\text{batch}, m, n, k)$ 顺序再调批量 GEMM, 所以第 3 节的 stride 契约是在置换之后的张量上检查的. 如果某个 scale 会被置换, 必须在置换后的坐标里做转换再置换回来, 而不能把二维转换结果 reshape 成三维 (因为 MN-major 的输出是非连续的, reshape 会悄悄拷成连续从而破坏 stride, 触发 `DG_HOST_ASSERT`). 这类约束解释了为什么库要专门写一份 scale 格式文档: 布局错了不会算错数, 而是直接在 host 侧断言失败.

### 3.3 K 分组与 Mega MoE 的额外布局

K 轴分组的 GEMM (用于 MoE 权重反向) 的 scale 契约与普通 GEMM 不同. 文档第 5 节说明, K 分组沿 K 拼接各组, scale 输入是二维的 $[\text{sum\_sf\_k}, \text{mn}]$, 且 `int32` 预打包路径只在 SM100 且 $\text{gran\_k} = 32$ 时接受, $\text{gran\_k} = 128$ 时必须传 `float32`. 与第 3 节不同, K 分组的打包 scale 是普通连续布局, 不在 MN 方向插填充, 而是把 $\text{mn} \bmod 4 = 0$ 作为硬前置条件. 每组独立打包再拼接: 组内 scale 行数不是 $4$ 的倍数时, 末尾一个打包行尾部的 UE8M0 槽位零填充. PSUM 布局还支持组大小动态, 按 `k_alignment` 填充存储, `ks_cpu` 传对齐后的大小.

Mega MoE 的要求更严, 文档 6.3 节列得很清楚. 它的 recipe 固定为 $(1, 1, 32)$, 权重 scale 必须已经是打包 `int32`, 没有 `float32` 回退也没有自动转换, 传 `float32` 直接被 `check_sf_layout` 拒绝. 而且在满足第 3 节布局之后, 还必须经 `transform_weights_for_mega_moe` 做一步 mega MoE 专属的重排: 把 L1 的 gate / up 行按 8 行粒度交错, 并对 L1 、 L2 的 scale 做一个 UTCCP 的 $128$ 行内转置 (要求 $\text{mn} \bmod 128 = 0$). 激活的 scale 则完全是内部的, 活在 symmetric memory buffer 的切片里, 由 kernel 流水产出, 不作为用户参数. 这说明随着融合程度加深, scale 的布局约束也从「GEMM 通用契约」收紧成「某个 mega-kernel 专用的物理排布」.


## 4. 执行骨架: warp 专精 、 TMA 、 持久化调度与底层技巧

### 4.1 warp specialization 与 setmaxnreg 的寄存器再分配

DeepGEMM 的 kernel 按 CUTLASS 的思路做 warp specialization: 把一个 block 里的 warp 分成生产者和消费者两类. 在 [`sm90_fp8_gemm_1d1d.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/impls/sm90_fp8_gemm_1d1d.cuh) 里, `warp_idx >= kNumMathThreads / 32` 的 warp 进 TMA 分支负责搬数据, 其余进 math 分支执行 WGMMA. 两类 warp 通过一组 full / empty barrier 配对: 生产者等 empty barrier 后发 TMA, 到达 full barrier; 消费者等 full barrier 后算 WGMMA, 算完到达 empty barrier 通知这一级共享内存可以覆盖. 这样数据搬运和矩阵乘在流水的不同级上重叠, 而不是串行等待.

寄存器分配是这套设计能跑起来的关键. 生产者只需要很少的寄存器 (TMA 把数据直接搬进共享内存, 不过寄存器), 消费者 WGMMA 需要很多. 代码用 `warpgroup_reg_dealloc` 和 `warpgroup_reg_alloc` (底层是 `setmaxnreg.aligned` 指令) 做再分配: 当前实现里, 不展开流水时生产者分 $40$ 个 、 消费者分 $232$ 个寄存器, 全展开时分别是 $24$ 和 $240$. 按老版本代码计算，一个 SM 共 $65536$ 个寄存器，$256 \times 232 + 128 \times 40 = 64512$，再加上每个 block 保留的约 1K，恰好容纳两个消费者 warp group 和一个生产者 warp group. 这解释了线程数的约束: 生产者要是 $128$ 的倍数, 消费者要是 WGMMA 的 warp group ($128$) 的倍数, `BLOCK_M` 为 $64$ 时 blockDim 常见是 $256$ 或 $384$. 没有 `setmaxnreg` 的话, 消费者最多只能有 $128$ 个线程.

### 4.2 TMA 的几种用途与 multicast

TMA (Tensor Memory Accelerator) 是 Hopper 引入的异步数据搬运硬件, DeepGEMM 把它用在几个地方. 加载侧, A 、 B 以及 A 的 scale 都用 `tma::copy` 从全局内存异步搬进共享内存, kernel 开头还用 `prefetch_tma_descriptor` 预取 TMA 描述符. 存储侧, 输出用 TMA 写回; 在带累加的路径里用 `SM90_TMA_REDUCE_ADD_2D` 做「写回时顺带加到已有值」, 这对 $D = C + A @ B$ 的 $C$ 项和 K 分组的跨组累加有用. 初始版 README 还列了一条: TMA multicast 只用在 LHS (即 A) 上, 让多个 CTA 共享同一份 A 数据的搬运.

multicast 的边界处理藏在调度器里. [`scheduler/gemm.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/scheduler/gemm.cuh) 的 `get_swizzled_block_idx` 对 SM90 有一段专门代码: 当 multicast 数大于 $1$ 且一组里的块数是奇数时, 把尾组截掉一个 、 单独起一个单块组, 避免两个本应配对 multicast 的 CTA 一个有一个没有. `is_tma_multicast_valid` 进一步检查: 对 M 分组的 contiguous 布局, 若 M 相邻的两个参与 multicast 的 CTA 落在不同专家组, 就禁用 multicast. SM100 用 2-CTA 的方式, 不能像 SM90 那样动态关掉 multicast, 所以这段带 `__CUDA_ARCH__ < 1000` 的条件编译只给 SM90. 这些细节是把一个理论上整齐的 multicast 落到不规则 token 数的 MoE 上必须补的边界.

### 4.3 持久化调度 、 block swizzle 与非 2 次幂 block 尺寸

调度器是整个库复用最高的一块, 一个 `Scheduler` 结构同时服务稠密和各种 grouped kernel. 它走持久化调度: 每个 CTA 常驻, 循环调用 `get_next_block`, 用 `(++ current_iter) * kNumSMs + blockIdx.x` 算出下一个输出 tile 的一维任务号, 直到任务号越界返回 false. 这样可以省去「一个 tile 启动一个 CTA」的开销, 寄存器和共享内存也只在 kernel 生命周期开始时分配. 任务号到 $(m, n)$ 的映射走 `get_swizzled_block_idx`: 它按一个 group 大小分块, 候选值为 $8$ 或 $16$, 由 `get_num_1d_blocks_per_group` 根据访存量选择. 同组 CTA 可以复用同一方向的 A 或 B tile, 这些 tile 留在 L2 里跨 CTA 复用. swizzle 的方向取非 multicast 的那一维.

非 $2$ 次幂的 block 尺寸是一个容易被忽略的优化. 初始版 README 举了个例子: $M=256, N=7168$ 时, 若用常规的 $\text{BLOCK\_M}=128, \text{BLOCK\_N}=128$, 只有 $(256/128)\times(7168/128)=112$ 个 block, 用不满 $132$ 个 SM; 改用 $\text{BLOCK\_N}=112$ 就有 $(256/128)\times(7168/112)=128$ 个 block, 让更多 SM 干活. 当前库把这类能力沉淀成工具函数 `set_block_size_multiple_of`, 约束 block 尺寸是某个值的倍数, 配合 JIT 把 block 尺寸当编译期常量来选. README 强调, 把这种不对齐的 block 尺寸和细粒度 scale 一起实现需要仔细优化, 但确实能换来性能, 第 2.3 节的 `num_former_iters` 谓词化就是为了在不规整 block 下仍能消掉分支.

### 4.4 FFMA SASS interleaving: 一个退役的底层技巧

初始版 README 里有一条很有代表性的底层技巧, 虽然已经退役, 但值得记录它揭示的问题. DeepSeek 对比 NVCC 12.2 和 12.3 编出来的 CUTLASS FP8 kernel 的 SASS, 发现一串 FADD 指令里有一位被按交错模式翻转. 对照开源 CUDA 汇编器后, 他们判断这位控制 `yield` (让当前 warp 在该指令后让出, 使 warp scheduler 能调度别的 warp 掩盖延迟). 据此写了 `interleave_ffma.py`, 对编译出的二进制里的 FFMA 指令按对定位 $16$ 字节机器码, XOR `0x0800200000000000` 同时翻 `yield` 位和 `reuse` 位 (寄存器复用位, 因为 warp 一旦让出, 下一个执行的可能是别的 warp, 寄存器状态可能被改, 所以 yield 时必须清掉 reuse).

这个后处理给 WGMMA 和第 2.2 节的 promotion FFMA 创造更多重叠窗口, README 自述在某些细粒度 scale 的 FP8 GEMM 上提速 $10\%$ 以上. 2025-07 的重构 (#112) 将其退役: News 说明 NVCC 12.9 已能自动完成 FFMA interleaving, 无须继续修改 SASS. 这段历史反映了 DeepGEMM 的优化深度曾到达机器码层; 编译器补上相同能力后, 手工后处理也随之退出.

## 5. grouped GEMM 两种布局与 V3.2 的 MQA logits

### 5.1 contiguous 布局服务训练前向与 prefill

DeepGEMM 的 grouped GEMM 与 CUTLASS 传统做法不同: 它只在 M 轴分组, N 和 K 必须固定. 这是为 MoE 里所有专家共享同一形状 ($N, K$ 相同) 的场景设计的. contiguous 布局把各专家的 token 沿 M 拼成一个大张量, 每个专家段对齐到 GEMM 的 M block 大小 (由 `get_mk_alignment_for_contiguous_layout` 给出). 对应 API 是 `m_grouped_fp8_gemm_{nt, nn}_contiguous`. 训练前向和推理 prefill 阶段, 每个专家处理的 token 数不同但在一次调用里是已知的, 把它们拼接后用一个 `grouped_layout` 张量标记每个专家的边界即可.

这种布局的好处是和上游通信库零拷贝对接. 社区在 sglang 集成 DeepEP V2 的 issue [#370](https://github.com/deepseek-ai/DeepGEMM/issues/370) 里记录了实际用法: prefill 路径关闭 CUDA graph, DeepEP 以 `do_expand=True` 产出已按专家排好序的二维布局, 直接当 contiguous GEMM 的输入, 用 `handle.psum_num_recv_tokens_per_expert` 作为组偏移, 不需要额外的 scatter / gather. 这里的 contiguous 对齐和 DeepEP 的 token 对齐用同一个 `get_mk_alignment_for_contiguous_layout` 对齐值, 两边才能对上.

### 5.2 masked 布局服务 decode, K 分组服务权重反向

decode 阶段的约束不同: 开启 CUDA graph 后, CPU 不知道每个专家收到多少 token, 形状必须静态可捕获. 这时用 masked grouped GEMM: 输入是三维的 $[E_{\text{local}}, \text{expected\_m}, K]$, 加一个 mask (或每专家有效 token 数) 张量, kernel 只计算有效部分, 对应 API 是 `m_grouped_fp8_gemm_nt_masked`. README 举的典型用法是把 DeepEP 低延迟 kernel 的输出直接当输入. issue #370 也点出代价: DeepEP V2 的非扩展输出是二维未排序的, 要接 masked GEMM 得补 scatter / reverse-scatter 等转换 kernel, 这是两种布局在工程落地时真实存在的摩擦.

K 轴分组是第三种布局, 服务 MoE 权重反向. 反向时 $M$ 和 $N$ 固定, 要沿 K 把不同样本的贡献分组累加, 对应 `k_grouped_fp8_gemm_tn_contiguous` (SM100) 或 `k_grouped_fp8_gemm_nt_contiguous` (SM90). 文档第 5 节说明它的 $C$ 累加器约束: 签名虽然默认 $C$ 为 None, 但 K 分组强制 $C$ 非空, 推荐直接把 $C$ 传成和 $D$ 同一个张量做原地累加, 否则 DeepGEMM 会先 `d.copy_(c)` 多一次全量拷贝. 三种布局合起来覆盖了 MoE 的前向 (contiguous) 、 decode (masked) 和反向 (K 分组) 全链路, 共用同一个调度器和同一套二级累加.

### 5.3 lightning indexer 的 MQA 打分 kernel

2025-09 (#200) 加入的 MQA logits kernel 服务 DeepSeek-V3.2 的 lightning indexer, 这是 V3.2 稀疏 attention 里给 KV 打分 、 选 top-k 的那一步. kernel 有非分页 (prefill) 和分页 (decode) 两个版本, 以 `fp8_fp4_mqa_logits` 为例, 它对每个 query token $i$ 遍历 $[\text{cu\_seq\_len\_k\_start}[i], \text{cu\_seq\_len\_k\_end}[i])$ 范围内的 KV token $j$, 算 $\text{out}_{ij} = \text{relu}(q_i @ (kv_j \cdot \text{kv\_sf}_j)) \cdot \text{weights}_i$ 再对 head 求和, 得到一个标量 logit. 带权 ReLU 是这里和普通注意力打分不同的地方, README 的伪代码把这步写得很直白.

这个 kernel 的 scale 契约在文档 6.1 节, 和普通 GEMM 不同, 是硬编码的. $q$ 的 scale 和 $kv$ 的 scale dtype 耦合: 传 $q\_sf$ 即选中 MX 模式, 两者都要是打包 UE8M0 的连续 `int32` (仅 SM100); 不传 $q\_sf$ 则 $kv\_sf$ 是每 token 一个 `float32` (仅 SM90), 没有混合模式. MX 的 scale 粒度是沿 `head_dim` 每 $32$ 个元素一块, `head_dim` 不超过 $128$ 时一个 token / head 的至多 $4$ 个 UE8M0 指数正好塞进一个 `int32`. 分页版把 KV 的 scale 融进字节 cache (每 token 的 value 字节后跟 $4$ 个 scale 字节), 而不是单独一个张量. 两个 API 都不清理超出有效 KV 跨度的项, 调用方要自己 mask. 这说明 DeepGEMM 已经从「只做 GEMM」扩展到承载 V3.2 attention 里计算密度最高的打分步.

## 6. 性能口径 、 周边仓库与局限

### 6.1 性能数字的口径

初始版 README 的性能表给了最清楚的口径: 在 H800 上用 NVCC 12.8 测, 覆盖 DeepSeek-V3/R1 推理 (prefill 与 decode, 不含张量并行) 可能用到的形状, 加速比是相对 DeepSeek 内部基于 CUTLASS 3.6 精调的实现算的. 稠密 GEMM 一列里, 大形状如 $M=4096, N=7168, K=16384$ 达到 $1358$ TFLOPS, 加速比约 $1.2\times$; 小 M (如 $M=64$) 的形状加速比更高 (到 $2.7\times$), 因为 JIT 把形状当编译期常量 、 全展开流水对小形状收益大. News 里 2025-04-18 的 $1550$ TFLOPS 是后续几个 PR 优化后的峰值, 对应 H800. 这里要分清: $1358$ 是初版表格里某个具体形状的实测, $1550$ 是优化后的峰值, 两者口径不同.

当前主仓库 README 已经删掉了这张表, 只保留一句「性能追平或超过专家手调的库」, 具体数字散在各 PR 里. 相对地, DeepGEMM-Ascend 的 README 给了完整的昇腾性能表, 口径是 Ascend 950DT (CANN 9.20) 、 用 `bench_msprof` 冷 L2 测, 形状跟随 DeepGEMM 测试套件: 稠密 GEMM 对各类型达到最高 $99.8\%$ 的硬件上限 (BF16 的 $431$ TFLOPS 对上限 $432$), MQA logits 则是 FIX-pipe 瓶颈而非算力瓶颈, FIX pipe 利用率 $99\%$. 两个仓库的性能表硬件不同 (H800 对 Ascend 950DT) 、 基线不同 (CUTLASS 对硬件理论上限), 引用时要带上这些前提.

**6.2 DeepGEMM-Ascend 与主仓库的关系:** [DeepGEMM-Ascend](https://github.com/deepseek-ai/DeepGEMM-Ascend) 是 DeepGEMM 到华为昇腾平台的移植, 2026-09-30 首发, 支持 Ascend 950 系列. 它的定位是完全兼容 DeepGEMM 的 API: 用同一个包名 `deep_gemm`, 支持 BF16 、 FP8 、 FP4 GEMM 、 MQA logits 和 MegaMoE, 用户在昇腾上装这个包就能沿用其他平台的 API 和开发流程. 它对昇腾的 MAD (矩阵乘加) 原语做了一层轻量抽象, 隐藏分形矩阵布局 、 对齐约束 、 地址计算等细节, 并用昇腾特有的稀疏数据加载 、 基于协程的流水线等技巧逼近硬件极限.

两者在 scale 格式上有一处明确差异, 对照时要注意. DeepGEMM-Ascend 的 README 的 NOTE 写明: 昇腾上每对 (两个) UE8M0 scale 沿 K 打进一个 `int16`, 并按 MN-major 存储; 而 NVIDIA 侧是 $4$ 个 UE8M0 打进一个 `int32` (本文 3.1 节). 这是为适配昇腾硬件效率做的物理排布调整, 接口层保持一致, 底层打包不同. 其余接口 (`set_num_sms`, contiguous 对齐, `transform_sf_into_required_layout` 等) 都对齐主仓库, 并额外提供 `set_npu_arch` 、 ACLNN 参考 GEMM 等昇腾专属工具.

**6.3 DeepJIT 与主仓库的关系:** [DeepJIT](https://github.com/deepseek-ai/DeepJIT) 是从 DeepGEMM 里抽出来的 JIT 运行时, 2025-09-08 首发公开版, header-only 的 C++20 库, 同时支持 NVIDIA CUDA 和华为昇腾两个后端. DeepGEMM 和 DeepGEMM-Ascend 都把它当底座: 「安装期不编译 、 kernel 全部运行时编译」这个贯穿两仓库的设计, 实现就在 DeepJIT. 它给扩展作者一套共享接口来编译 kernel 源码 、 缓存二进制 、 加载到设备 、 用后端专属选项启动, 并处理源码与 include 哈希 、 内存与磁盘缓存 、 惰性初始化这些基础设施. DeepGEMM README 里 `DG_JIT_*` 环境变量在未设置时回退到全局 `DJ_JIT_*`, 正是因为底层是 DeepJIT (前缀 `DJ`).

从主仓库的角度看, DeepJIT 解释了几个 README 现象. 其一, 缓存目录默认 `$HOME/.dj` 、 支持 `:` 分隔的多根查找, 这是 DeepJIT 的共享缓存设计, 多用户 、 多进程 、 多节点可共享一个缓存目录复用编译产物. 其二, DeepGEMM 把 GEMM 形状 、 block 尺寸 、 流水级数当编译期常量 (本文 4.3 节), 靠的就是 DeepJIT 对每种 config 单独编译一个 kernel 并按源码 、 include 、 编译器版本 、 选项 、 依赖签名算缓存键. 其三, `DG_JIT_DUMP_SASS` 这类 dump 开关 、 以及 `DG_JIT_CHECK_NO_SPILLS` 的 spill 断言, 都是 DeepJIT 的编译诊断能力透出到 DeepGEMM 的环境变量. DeepJIT 的缓存键用的是双状态 FNV-1a, 每个组成部分带字节长度前缀, 最终是 $32$ 字符十六进制, README 明确这是快速校验和而非密码学哈希.

**6.4 局限与适用条件:** DeepGEMM 的适用边界在 README 的 Notices 和各处约束里写得比较清楚. 它只做 GEMM 本身, 量化 cast 和输入转置要调用方自己融进上游 kernel, 用库里提供的 PyTorch 工具函数会慢. scale 必须是 $2$ 的整数次幂, 这由 UE8M0 格式和设备断言强制, 产 scale 时要传 `round_sf=True`. 硬件上只支持 SM90 和 SM100 (昇腾走单独的 DeepGEMM-Ascend 仓库), 需要 CUDA Toolkit 12.9 以上和支持 C++20 `<format>` 的编译器. grouped GEMM 只在 M (或反向的 K) 轴分组, N 和 K 必须固定, 这对专家形状不一致的 MoE 不适用.

还有两点来自底层机制. 一是 FP8 tensor core 的累加精度 (第 2.1 节) 是硬件特性, 二级累加能缓解但不能消除 FP8 本身的量化误差; 细粒度分块量化决定输入误差, DeepGEMM 负责按既定格式消费量化结果. 二是 JIT 不做 auto-tuning, 而是按形状确定性地选择 block 尺寸、warp group 数、流水级数和 TMA cluster 大小. 选择逻辑位于 `csrc/jit_kernels/heuristics/`, 未充分覆盖的形状可能得不到最优配置; 初始版 README 也明确记录了部分形状表现不佳. 2025-07 的重构还调整了文件与命名, 例如 `gemm_fp8_fp8_bf16_nt` 在新版中改名为 `fp8_gemm_nt`; 旧接口名称不能直接套到当前版本.

## 参考资料

- [从混合精度训练到 DeepGEMM — AIInfra](https://infrasys-ai.github.io/aiinfra-docs/04Train03TrainAcceler/03DSGEMM.html)
- [浅读 DeepGEMM — wu-kan](https://wu-kan.cn/2025/03/03/%E6%B5%85%E8%AF%BB-DeepGEMM/)
- [The DeepGEMM Scheduler Struct — Kingsley Kim](https://kingsleykim.dev/blog/deepgemm-scheduler/)
- [GitHub issue #50: two-level accumulation](https://github.com/deepseek-ai/DeepGEMM/issues/50)
- [GitHub issue #370: DeepEP V2 与 grouped GEMM 布局](https://github.com/deepseek-ai/DeepGEMM/issues/370)
