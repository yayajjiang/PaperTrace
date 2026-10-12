---
title: "01 · DeepGEMM 文档对照译稿"
category: "开源仓库"
tags: ["DeepSeek", "对照译稿", "开源仓库"]
published: true
excerpt: "DeepGEMM 仓库 README 、 scaling factor 格式设计文档与 DeepJIT README 的逐段对照译稿, 覆盖 FP8 / FP4 / BF16 GEMM 、 grouped GEMM 两种布局 、 MQA logits 、 Mega MoE 与 JIT 运行时的接口与约束. "
---

# DeepGEMM 文档对照译稿

本篇对照仓库内三份英文文档: 主仓库 `README.md` 、 scaling factor 格式设计文档 `docs/scaling-factor-format.md` 、 以及 JIT 运行时仓库 `DeepJIT/README.md` . 英文原文在前, 中文意译紧跟其后; 代码块 、 表格 、 命令 、 公式与 scaling factor 布局图保留原文不译.

## README.md

> https://github.com/deepseek-ai/DeepGEMM/blob/main/README.md

DeepGEMM is a unified, high-performance tensor core kernel library that brings together the key computation primitives of modern large language models — GEMMs (FP8, FP4, BF16), fused MoE with overlapped communication (Mega MoE), MQA scoring for the lightning indexer, HyperConnection (HC), and more — into a single, cohesive CUDA codebase. All kernels are compiled at runtime through DeepJIT, requiring no CUDA compilation during installation.

DeepGEMM 是一个统一的高性能 tensor core kernel 库, 把现代大语言模型的关键计算原语 —— GEMM (FP8 、 FP4 、 BF16) 、 带通信重叠的融合 MoE (Mega MoE) 、 lightning indexer 用的 MQA 打分 、 HyperConnection (HC) 等 —— 收进一套内聚的 CUDA 代码里. 所有 kernel 都经 DeepJIT 在运行时编译, 安装期不需要 CUDA 编译.

DeepGEMM leverages some concepts from [CUTLASS](https://github.com/nvidia/cutlass) and [CuTe](https://github.com/NVIDIA/cutlass/tree/main/include/cute), but avoids heavy reliance on their templates or algebras. The library is designed for simplicity, with only a limited number of core kernel functions, making it a clean and accessible resource for learning NVIDIA GPU kernel optimization techniques.

DeepGEMM 借用了 [CUTLASS](https://github.com/nvidia/cutlass) 和 [CuTe](https://github.com/NVIDIA/cutlass/tree/main/include/cute) 的一些概念, 但不重度依赖它们的模板或代数. 这个库以简洁为设计目标, 只有有限几个核心 kernel 函数, 是学习 NVIDIA GPU kernel 优化技术的一份干净 、 易读的材料.

Despite its lightweight design, DeepGEMM's performance matches or exceeds expert-tuned libraries across various matrix shapes.

尽管设计轻量, DeepGEMM 在各种矩阵形状上的性能都能追平或超过专家手调的库.

### News

- 2026.09.30
  - DeepGEMM Ascend is available! Check [DeepGEMM-Ascend](https://github.com/deepseek-ai/DeepGEMM-Ascend/) for more details
  - Add more optimizations, including locality domain features, check [#462](https://github.com/deepseek-ai/DeepGEMM/pull/462) for more details
- 2026.09.10: Sparse Indexer, Mega Gate, Mega mHC, DeepJIT, MoE and Indexer optimizations and more.
    - Please see [#432](https://github.com/deepseek-ai/DeepGEMM/pull/432) for more details.
- 2026.04.16: Mega MoE, FP8xFP4 GEMM, FP4 Indexer, PDL, faster JIT compilation and more.
    - Please see [#304](https://github.com/deepseek-ai/DeepGEMM/pull/304) for more details.
    - For Mega MoE benchmarks, refer to [#316](https://github.com/deepseek-ai/DeepGEMM/pull/316).
- 2025.09.28: DeepGEMM now supports scoring kernels (weighted ReLU MQA logits) for the lightning indexer for DeepSeek v3.2.
    - Please see [#200](https://github.com/deepseek-ai/DeepGEMM/pull/200) for more details.
- 2025.07.20: DeepGEMM now supports both SM90/SM100, and has a full refactor with a low-CPU-overhead JIT CPP module.
    - As NVCC 12.9 will automatically do the FFMA interleaving, all post optimizations will be no longer supported.
    - Please see [#112](https://github.com/deepseek-ai/DeepGEMM/pull/112) for more details.
- 2025.05.14: DeepGEMM now offers weight gradient kernels for dense and MoE backward! See [#95](https://github.com/deepseek-ai/DeepGEMM/pull/95) for details.
- 2025.04.18: DeepGEMM now achieves up to **1550 TFLOPS** on H800! See [#74](https://github.com/deepseek-ai/DeepGEMM/pull/74), [#78](https://github.com/deepseek-ai/DeepGEMM/pull/78), [#81](https://github.com/deepseek-ai/DeepGEMM/pull/81), [#86](https://github.com/deepseek-ai/DeepGEMM/pull/86) and [340d988](https://github.com/deepseek-ai/DeepGEMM/commit/340d9880f4a418d943d34260d20a79f41f4c0526) for details.

更新记录 (保留原文链接, 译要点): 2026.09.30 发布 DeepGEMM Ascend, 并引入 locality domain 等优化 (#462); 2026.09.10 加入 Sparse Indexer 、 Mega Gate 、 Mega mHC 、 DeepJIT 以及 MoE 、 Indexer 优化 (#432); 2026.04.16 引入 Mega MoE 、 FP8xFP4 GEMM 、 FP4 Indexer 、 PDL 与更快的 JIT 编译 (#304, benchmark 见 #316); 2025.09.28 为 DeepSeek v3.2 的 lightning indexer 加入打分 kernel (带权 ReLU MQA logits, #200); 2025.07.20 同时支持 SM90 / SM100, 并把 JIT 重构为低 CPU 开销的 C++ 模块, 由于 NVCC 12.9 会自动做 FFMA interleaving, 原先的后处理优化不再保留 (#112); 2025.05.14 为 dense 与 MoE 反向加入权重梯度 kernel (#95); 2025.04.18 在 H800 上达到最高 **1550 TFLOPS** (#74 、 #78 、 #81 、 #86 与 340d988).

### Quick start

#### Requirements

- NVIDIA SM90 or SM100 architecture GPU
- Python 3.8 or higher
- Compilers and standard libraries with C++20 `<format>` support
- CUDA Toolkit 12.9 or higher
- PyTorch 2.3 or higher
- CUTLASS 4.0 or higher (could be cloned by Git submodule)

环境要求: NVIDIA SM90 或 SM100 架构 GPU; Python 3.8 以上; 支持 C++20 `<format>` 的编译器与标准库; CUDA Toolkit 12.9 以上; PyTorch 2.3 以上; CUTLASS 4.0 以上 (可用 Git submodule 克隆).

#### Development

```bash
# Submodule must be cloned
git clone --recursive git@github.com:deepseek-ai/DeepGEMM.git
cd DeepGEMM

# Link some essential includes and build the C++ extension
cat develop.sh
./develop.sh
```

#### Installation

```bash
cat install.sh
./install.sh
```

Then, import `deep_gemm` in your Python project, and enjoy!

然后在你的 Python 项目里 `import deep_gemm` 即可使用.

### Interfaces

#### Notices

This library provides optimized GEMM kernels for NVIDIA GPUs with a naming convention: `D = C + A @ B`. The input shape layout is NT (non-transposed A, transposed B). While the SM90 implementation supports only the NT memory layout (row-major, col-major), the SM100 implementation supports all memory layouts (NT, TN, NN, TT). For example, `fp8_gemm_nt` will do a `D = C + A @ B.T`

本库为 NVIDIA GPU 提供优化过的 GEMM kernel, 命名约定是 `D = C + A @ B` . 输入形状布局是 NT (A 不转置, B 转置). SM90 实现只支持 NT 内存布局 (行主序 、 列主序), SM100 实现支持全部内存布局 (NT 、 TN 、 NN 、 TT). 例如 `fp8_gemm_nt` 做的是 `D = C + A @ B.T` .

For both architectures, the LHS scaling factor is required to have a TMA-aligned and transposed layout. And the data format for the scaling factor of SM90 and SM100 is different:

两种架构都要求 LHS (即 A) 的 scaling factor 采用 TMA 对齐且转置的布局. SM90 与 SM100 的 scaling factor 数据格式不同:

- SM90 requires scaling factors in FP32 format.
- SM100 requires scaling factors in packed [UE8M0](https://docs.nvidia.com/cuda/parallel-thread-execution/#alternate-floating-point-data-formats) format, which packs 4 UE8M0 into a single `torch.int`.

SM90 要求 scaling factor 为 FP32 格式; SM100 要求打包的 [UE8M0](https://docs.nvidia.com/cuda/parallel-thread-execution/#alternate-floating-point-data-formats) 格式, 把 4 个 UE8M0 打进一个 `torch.int` .

Please note that operations like input transposition or FP8 casting must be handled separately by the user, please implement or fuse them into prior kernels independently. While the library provides some simple PyTorch utility functions, these may result in slower performance, but our primary focus is on optimizing the GEMM kernels themselves.

注意: 输入转置 、 FP8 cast 这类操作要由用户自己处理, 请自行实现或融合进上游 kernel. 本库提供了一些简单的 PyTorch 工具函数, 但它们可能较慢; 本库的首要目标是优化 GEMM kernel 本身.

#### Normal dense GEMMs (non-grouped)

To perform a basic non-grouped FP8 GEMM, call the `fp8_gemm_{nt, nn, tn, tt}` function. For more details, please refer to the function documentation.

要做基础的非分组 FP8 GEMM, 调用 `fp8_gemm_{nt, nn, tn, tt}` 函数, 细节见函数文档.

#### Grouped GEMMs (contiguous layout)

Unlike traditional grouped GEMMs in CUTLASS, DeepGEMM groups only the M-axis, while N and K must remain fixed. This design is tailored for scenarios where experts in an MoE model share the same shape. For training forward passes or inference prefilling, where each expert may process a varying number of tokens, we concatenate these tokens into a single tensor, referred to as the "contiguous" layout. Note that each expert segment must be aligned to the GEMM M block size (`get_mk_alignment_for_contiguous_layout()`).  For more information, please refer to the `m_grouped_fp8_gemm_{nt, nn}_contiguous` function documentation.

与 CUTLASS 传统的 grouped GEMM 不同, DeepGEMM 只在 M 轴分组, N 和 K 必须固定. 这是为 MoE 模型中专家共享同一形状的场景量身设计的. 训练前向或推理 prefill 阶段, 每个专家处理的 token 数不同, 于是把这些 token 拼接成一个 tensor, 称为「contiguous」布局. 注意每个专家段都要对齐到 GEMM 的 M block 大小 (`get_mk_alignment_for_contiguous_layout()`). 细节见 `m_grouped_fp8_gemm_{nt, nn}_contiguous` 函数文档.

> **拆开:** 为什么只在 M 轴分组, 而 N 和 K 必须固定?
> 答: 因为 MoE 的各专家共享同一权重形状 (同样的 N 和 K), 不同的只有分到的 token 数 (M). 调度器 [`scheduler/gemm.cuh`](https://github.com/deepseek-ai/DeepGEMM/blob/main/deep_gemm/include/deep_gemm/scheduler/gemm.cuh) 的 `get_next_block` 对 MGroupedContiguous 把 `num_m_blocks` 按各组 token 数变化 、 N / K 维保持不变, 只需一个 `grouped_layout` 标记 M 方向的组边界, 省去为每组单独配 N / K 分块的开销.

We also provide a K-axis-grouped API for MoE weight backward (with M and N must remain fixed), please refer to `k_grouped_fp8_gemm_tn_contiguous` for more information.

我们还提供了 K 轴分组的 API 用于 MoE 权重反向 (此时 M 和 N 必须固定), 细节见 `k_grouped_fp8_gemm_tn_contiguous` .

#### Grouped GEMMs (masked layout)

During the inference decoding phase, when CUDA graph is enabled and the CPU is unaware of the number of tokens each expert receives, we support masked grouped GEMMs. By providing a mask tensor, the kernel computes only the valid portions.

推理 decode 阶段, 开启 CUDA graph 且 CPU 不知道每个专家收到多少 token 时, 我们支持 masked grouped GEMM. 通过传入一个 mask tensor, kernel 只计算有效的部分.

Use `m_grouped_fp8_gemm_nt_masked` for this purpose and consult the relevant documentation. An example usage is to use the output of low-latency kernels from [DeepEP](https://github.com/deepseek-ai/DeepEP) as input.

这种情况用 `m_grouped_fp8_gemm_nt_masked`, 细节见对应文档. 一个典型用法是把 [DeepEP](https://github.com/deepseek-ai/DeepEP) 低延迟 kernel 的输出作为输入.

#### V3.2 MQA kernels for the indexer

The kernel family has two versions, non-paged (for prefilling) and paged (for decoding).
Take the non-paged version `fp8_fp4_mqa_logits` as an example. Its main inputs are:

这族 kernel 有两个版本: 非分页 (用于 prefill) 和分页 (用于 decode). 以非分页版 `fp8_fp4_mqa_logits` 为例, 主要输入是:

- `q`, a `(q_data, q_sf)` tuple; SM100 accepts MXFP4/MXFP8 data with packed UE8M0 scales
- `kv`, a `(kv_data, kv_sf)` tuple with shape `[seq_len_kv, head_dim]` logically
- `weights`, tensor with shape `[seq_len, num_heads]` (BF16 on SM100)
- `cu_seq_len_k_start` and `cu_seq_len_k_end`, int tensor with shape `[seq_len]`
- `max_seqlen_k`, the maximum valid KV span of any query row

输入含: `q` 是 `(q_data, q_sf)` 元组, SM100 接受带打包 UE8M0 scale 的 MXFP4 / MXFP8 数据; `kv` 是 `(kv_data, kv_sf)` 元组, 逻辑形状 `[seq_len_kv, head_dim]`; `weights` 形状 `[seq_len, num_heads]` (SM100 上为 BF16); `cu_seq_len_k_start` 与 `cu_seq_len_k_end` 是形状 `[seq_len]` 的整型 tensor; `max_seqlen_k` 是任意 query 行的最大有效 KV 跨度.

The output is compressed to `[seq_len, max_seqlen_k]`; row `i` stores its valid KV span starting at column zero.
For each token `i` in `q`, it will iterate all tokens `j` from `[cu_seq_len_k_start[i], cu_seq_len_k_end[i])`,
and calculate the corresponding compressed logit as:

输出压缩成 `[seq_len, max_seqlen_k]`, 第 `i` 行把它的有效 KV 跨度从第 0 列开始存. 对 `q` 中每个 token `i`, 遍历 `[cu_seq_len_k_start[i], cu_seq_len_k_end[i])` 范围内所有 token `j`, 按下式计算对应的压缩 logit:

```python
kv_j = kv[0][j, :] * kv[1][j].unsqueeze(1)  # [head_dim]
out_ij = q[i, :, :] @ kv_j  # [num_heads]
out_ij = out_ij.relu() * weights[i, :]  # [num_heads]
out_ij = out_ij.sum()  # Scalar
```

For more details and the paged version `fp8_fp4_paged_mqa_logits`, please refer to `tests/test_attention.py`.

分页版 `fp8_fp4_paged_mqa_logits` 及更多细节见 `tests/test_attention.py` .

#### Mega MoE

Mega MoE fuses and overlaps EP dispatch, linear 1 and linear 2 (FP8xFP4 or FP8xFP8), SwiGLU, and EP combine into a single mega-kernel, overlapping NVLink communication and tensor core computation. It requires multi-process launch with symmetric memory. Usage:

Mega MoE 把 EP dispatch 、 linear 1 与 linear 2 (FP8xFP4 或 FP8xFP8) 、 SwiGLU 、 EP combine 融合并重叠进一个 mega-kernel, 让 NVLink 通信与 tensor core 计算相互重叠. 它需要带 symmetric memory 的多进程启动. 用法:

```python
# Allocate symmetric memory buffer
# NOTES: requires PyTorch >= 2.9
buffer = deep_gemm.get_symm_buffer_for_mega_moe(
    group, num_experts, num_max_tokens_per_rank, num_topk, hidden, intermediate_hidden,
    mma_type='fp8xfp4',  # Use 'fp8xfp8' for FP8 routed-expert weights
)

# Transform weights (FP4 or FP8 with UE8M0 SF) into the required layout
transformed_l1, transformed_l2 = deep_gemm.transform_weights_for_mega_moe(l1_weights, l2_weights)

# (Optional) Localize weights into locality domains
transformed_l1 = (deep_gemm.localize(transformed_l1[0]), transformed_l1[1])
transformed_l2 = (deep_gemm.localize(transformed_l2[0]), transformed_l2[1])
deep_gemm.destroy_localizer()

# Copy inputs into the buffer before each call
# You may fuse these into previous kernels
buffer.x[:num_tokens].copy_(x_fp8)
buffer.x_sf[:num_tokens].copy_(x_sf)
buffer.topk_idx[:num_tokens].copy_(topk_idx)
buffer.topk_weights[:num_tokens].copy_(topk_weights)

# Run the fused mega MoE kernel
y = torch.empty((num_tokens, hidden), dtype=torch.bfloat16, device='cuda')
deep_gemm.fp8_fp4_mega_moe(y, transformed_l1, transformed_l2, buffer)
```

For the full example with multi-process setup and benchmarking, please refer to `tests/test_mega_moe.py`.

完整的多进程设置与 benchmark 示例见 `tests/test_mega_moe.py` .

#### Utilities

The library provides some utility functions besides the above kernels:

除上述 kernel 外, 本库还提供一些工具函数:

- `deep_gemm.set_num_sms` / `get_num_sms`: set/get the maximum SM count to use
- `deep_gemm.set_tc_util` / `get_tc_util`: set/get an approximated tensor core utilization ratio
- `deep_gemm.set_pdl` / `get_pdl`: enable/disable Programmatic Dependent Launch (PDL)
- `deep_gemm.use_deterministic_algorithms`: enable/disable deterministic algorithms
- `deep_gemm.set_mk_alignment_for_contiguous_layout` / `get_mk_alignment_for_contiguous_layout`: set/get the group-level M/K alignment for contiguous layout
- `deep_gemm.get_theoretical_mk_alignment_for_contiguous_layout`: get the theoretical minimum M/K alignment
- `deep_gemm.set_ignore_compile_dims`: configure dimensions to ignore during JIT compilation
- `deep_gemm.set_block_size_multiple_of`: constrain block sizes to be multiples of a given value
- `deep_gemm.transform_sf_into_required_layout`: transform scaling factors into the required layout
- `deep_gemm.get_tma_aligned_size`: get the required TMA alignment size
- `deep_gemm.get_mn_major_tma_aligned_tensor`: get a MN-major TMA-aligned tensor
- `deep_gemm.get_mn_major_tma_aligned_packed_ue8m0_tensor`: get a MN-major TMA-aligned tensor (with packing FP32 into UE8M0)
- `deep_gemm.get_k_grouped_mn_major_tma_aligned_packed_ue8m0_tensor`: K-grouped GEMM packing kernel

工具函数含: 设置 / 读取可用 SM 数 (`set_num_sms` / `get_num_sms`) 、 近似 tensor core 利用率 (`set_tc_util` / `get_tc_util`) 、 PDL 开关 (`set_pdl` / `get_pdl`) 、 确定性算法开关 (`use_deterministic_algorithms`) 、 contiguous 布局的组级 M/K 对齐 (`set/get_mk_alignment_for_contiguous_layout`, 理论最小值用 `get_theoretical_mk_alignment_for_contiguous_layout`); 以及 JIT 相关的忽略编译维度 (`set_ignore_compile_dims`) 、 约束 block 大小为某值的倍数 (`set_block_size_multiple_of`); 还有 scaling factor 的布局转换与 TMA 对齐工具 (`transform_sf_into_required_layout` 、 `get_tma_aligned_size` 、 `get_mn_major_tma_aligned_tensor` 及其 UE8M0 打包版 、 K 分组打包 kernel).

The library also provides some environment variables, which may be useful:

Each `DG_JIT_*` variable falls back to the corresponding global `DJ_JIT_*` variable when unset.

本库还提供一些可能有用的环境变量. 每个 `DG_JIT_*` 变量在未设置时回退到对应的全局 `DJ_JIT_*` 变量.

- General
    - `DG_JIT_DEBUG`: `0` or `1`, enable JIT debugging features, including compiler command and PTXAS output, load-time reporting, line info, and PTX/SASS dumps; `0` by default
    - `DG_PRINT_CONFIGS`: `0` or `1`, print selected configs for each shape, `0` by default
- JIT cache
    - `DG_JIT_CACHE_DIR`: string, cache directory (or a `:`-separated list of directories) for compiled kernels; lookup searches all paths front-to-back (first hit wins) and a cache miss compiles into the first path, `$HOME/.dj` by default
- Compiler selection
    - `DG_JIT_NVCC_COMPILER`: string, NVCC compiler path; otherwise CUDA is found through `CUDA_HOME`, `CUDA_PATH`, `which nvcc`, then `/usr/local/cuda`
    - `DG_JIT_CPP_STANDARD`: integer, C++ standard version, `20` by default
- Compiler output
    - `DG_JIT_PRINT_COMPILER_COMMAND`: `0` or `1`, print compilation commands, `0` by default
    - `DG_JIT_PTXAS_VERBOSE`: `0` or `1`, show detailed PTXAS output, `0` by default
    - `DG_JIT_CHECK_NO_SPILLS`: `0` or `1`, assert no register spills in compiled kernels, `0` by default
    - `DG_JIT_CHECK_NO_LOCAL_MEMORY`: `0` or `1`, assert no local memory usage in compiled kernels, `0` by default
    - `DG_JIT_PRINT_LOAD_TIME`: `0` or `1`, print kernel load time, `0` by default
- Debug and profiling
    - `DG_JIT_WITH_LINEINFO`: `0` or `1`, embed source line info for profiling tools, `0` by default
    - `DG_JIT_DUMP_ASM`: `0` or `1`, dump both PTX and SASS, `0` by default
    - `DG_JIT_DUMP_PTX`: `0` or `1`, dump PTX output, `0` by default
    - `DG_JIT_DUMP_SASS`: `0` or `1`, dump SASS output, `0` by default
    - `DG_COMM_KERNEL_DEBUG`: `0` or `1`, zero symmetric buffer before each Mega MoE call for debugging, `0` by default
    - `DG_USE_NVIDIA_TOOLS`: `0` or `1`, skip internal profiling when running under external NVIDIA tools, `0` by default
- Build options
    - `DG_SKIP_CUDA_BUILD`: `0` or `1`, skip CUDA extension build during installation, `0` by default
    - `DG_FORCE_BUILD`: `0` or `1`, force local build instead of downloading pre-built wheels, `0` by default

环境变量按用途分组: General 下的 `DG_JIT_DEBUG` 开 JIT 调试 (编译命令 、 PTXAS 输出 、 加载耗时 、 行号 、 PTX / SASS dump), `DG_PRINT_CONFIGS` 打印每个形状选中的 config; JIT cache 下的 `DG_JIT_CACHE_DIR` 指定 kernel 缓存目录 (可用 `:` 分隔多个, 查找从前往后, 未命中编译进第一个, 默认 `$HOME/.dj`); 编译器选择用 `DG_JIT_NVCC_COMPILER` 与 `DG_JIT_CPP_STANDARD`; 编译输出 、 调试与 profiling 、 构建选项各组控制命令打印 、 寄存器 spill / local memory 断言 、 PTX / SASS dump 、 Mega MoE 调试清零 、 跳过 CUDA 构建 、 强制本地构建等, 默认都为 `0` 或各自标注的默认值.

For additional examples and details, please refer to [the test code](tests) or review the corresponding Python documentation.

更多示例与细节见 [测试代码](tests) 或对应的 Python 文档.

### Acknowledgement

DeepGEMM is inspired by the [CUTLASS](https://github.com/nvidia/cutlass) project. Thanks and respect to the developers!

DeepGEMM 受 [CUTLASS](https://github.com/nvidia/cutlass) 项目启发, 向其开发者致谢致敬.

### License

This code repository is released under [the MIT License](LICENSE).

本代码仓库以 [MIT License](LICENSE) 发布.

### Citation

```bibtex
@misc{deepgemm2025,
      title={DeepGEMM: clean and efficient BLAS kernel library on GPU},
      author={Chenggang Zhao and Zhean Xu and Liang Zhao and Jiashi Li and Chenhao Xu and Anyi Xu and Shengyu Liu and Kexing Zhou and Kuai Yu},
      year={2025},
      publisher = {GitHub},
      howpublished = {\url{https://github.com/deepseek-ai/DeepGEMM}},
}
```

## docs/scaling-factor-format.md

> https://github.com/deepseek-ai/DeepGEMM/blob/main/docs/scaling-factor-format.md

This document specifies the scaling factor (SF) tensor contract for DeepGEMM's FP8/FP4 GEMM APIs: required shapes, dtypes, strides, the transform pipeline, and how to call the APIs correctly. Source of truth:

本文规定了 DeepGEMM 的 FP8 / FP4 GEMM API 对 scaling factor (SF) tensor 的契约: 所需的形状 、 dtype 、 stride 、 转换流程, 以及如何正确调用这些 API. 事实源为:

- `csrc/apis/layout.hpp` — SF transform dispatch (`transform_sf_into_required_layout`, `transform_k_grouped_sf_into_required_layout`)
- `csrc/utils/layout.hpp` — SF layout validation (`check_sf_layout`)
- `csrc/apis/gemm.hpp` — GEMM argument checks
- `csrc/apis/attention.hpp`, `csrc/apis/mega_moe.hpp`, `deep_gemm/mega/__init__.py` — attention / mega MoE SF requirements (Section 6)
- `csrc/jit_kernels/impls/smxx_layout.hpp` — host-side transform launchers
- `deep_gemm/include/deep_gemm/impls/smxx_layout.cuh` — transform kernels
- `tests/test_layout.py`, `tests/test_fp8_fp4.py`, `tests/generators.py` — working usage examples

上述文件分别对应 SF 转换分发 、 布局校验 、 GEMM 参数检查 、 attention 与 mega MoE 的 SF 要求 (第 6 节) 、 host 端转换启动器 、 转换 kernel 、 以及可运行的用例.

### 1. Definitions

#### 1.1 Quantization Recipe

`recipe = (gran_m, gran_n, gran_k)` describes the **SF storage** granularity (not the compute granularity): one SF value covers a `gran_m x gran_k` block of A (or `gran_n x gran_k` of B).

`recipe = (gran_m, gran_n, gran_k)` 描述的是 **SF 存储** 的粒度 (不是计算粒度): 一个 SF 值覆盖 A 的一个 `gran_m x gran_k` 块 (或 B 的 `gran_n x gran_k` 块).

Given A of shape `[·, M, K]` and B of shape `[·, N, K]` (the leading `·` batch/group dimension is optional), the untransformed SFs must have:

给定 A 形状 `[·, M, K]` 、 B 形状 `[·, N, K]` (前导 `·` 批 / 组维可选), 未转换的 SF 必须满足:

```
SFA shape: [·, ceil_div(M, gran_m), ceil_div(K, gran_k)]    dtype: float32
SFB shape: [·, ceil_div(N, gran_n), ceil_div(K, gran_k)]    dtype: float32
```

Rules:

- Pass exactly one of `recipe` or the `recipe_a` + `recipe_b` pair. Use `recipe_a = (gran_m, gran_k_a)` / `recipe_b = (gran_n, gran_k_b)` (2-tuples) when A and B use different K granularities.
- Supported `gran_k`: `32` or `128` on SM100; `128` only on SM90.

规则: `recipe` 与 `recipe_a` + `recipe_b` 二选一传入; 当 A 和 B 的 K 粒度不同时, 用二元组 `recipe_a = (gran_m, gran_k_a)` / `recipe_b = (gran_n, gran_k_b)`. 支持的 `gran_k`: SM100 上为 `32` 或 `128`, SM90 上只有 `128`.

#### 1.2 SF Value Constraint

Every `float32` SF value must be an exact power of 2: bit pattern `[0][8-bit exponent][23 mantissa bits = 0]`. Sign bit and mantissa must be zero; this is asserted on device (`DG_TRAP_ONLY_DEVICE_ASSERT((value & 0x807fffffu) == 0)` in `smxx_layout.cuh`).

每个 `float32` 的 SF 值必须是 2 的整数次幂: 位模式为 `[0][8 位指数][23 位尾数 = 0]`. 符号位和尾数必须为零, 这一点在设备侧有断言 (`smxx_layout.cuh` 中的 `DG_TRAP_ONLY_DEVICE_ASSERT((value & 0x807fffffu) == 0)`).

When producing SFs from a quantization cast kernel, pass `round_sf=True` to guarantee this.

从量化 cast kernel 产出 SF 时, 传 `round_sf=True` 来保证这一点.

> **拆开:** 为什么每个 SF 值必须恰好是 2 的整数次幂?
> 答: 因为 SM100 的 SF 用 UE8M0 格式存 (见 7.1), 只有 8 位指数 、 没有尾数, 本来就只能表示 2 的幂; 若 FP32 的 SF 带非零尾数, 打包时会被丢弃造成不一致, 故 `smxx_layout.cuh` 用 `(value & 0x807fffffu) == 0` 在设备侧断言, 并要求 cast 时传 `round_sf=True`.

#### 1.3 Constants

- `packed_sf_dtype` = `int32` (4 UE8M0 exponents packed per element, see Section 7.1)
- `ALIGN_MN` = `16 bytes / sizeof(int32)` = `4` (TMA requires `stride(-1)` to be a multiple of 16 bytes)

常量: `packed_sf_dtype` 为 `int32` (每元素打包 4 个 UE8M0 指数, 见 7.1); `ALIGN_MN` 为 `16 bytes / sizeof(int32)` = `4` (TMA 要求 `stride(-1)` 是 16 字节的倍数).

### 2. Two Ways to Provide SFs

| Path | SF dtype | Extra kernel launch | When to use |
|---|---|---|---|
| A. Untransformed | `float32` | Yes — DeepGEMM launches a transform kernel per GEMM call | Prototyping, correctness testing |
| B. Pre-transformed | `int32` (packed UE8M0) | No — layout is only validated | Production; weights (transform once, cache) and activations (produce directly from the cast kernel) |

提供 SF 有两条路径: 路径 A (未转换, `float32`), 每次 GEMM 调用都会额外启动一个转换 kernel, 适合原型与正确性测试; 路径 B (预转换, 打包 UE8M0 的 `int32`), 不额外启动 kernel 只校验布局, 适合生产 (权重转换一次缓存, 激活直接由 cast kernel 产出).

For path B, the recipe passed to the GEMM must have `gran_m = gran_n = 1` (the transform broadcasts SFs along MN), with `gran_k` unchanged.

对路径 B, 传给 GEMM 的 recipe 必须 `gran_m = gran_n = 1` (转换会沿 MN 广播 SF), `gran_k` 保持不变.

### 3. Pre-transformed SF Format Contract (Path B)

A pre-transformed SF tensor for `mn` rows and `k` columns with granularity `(1, gran_k)` must satisfy (validated by `check_sf_layout` in `csrc/utils/layout.hpp`):

一个 `mn` 行 、 `k` 列 、 粒度 `(1, gran_k)` 的预转换 SF tensor 必须满足以下条件 (由 `csrc/utils/layout.hpp` 的 `check_sf_layout` 校验):

```
dtype:       int32 (packed UE8M0)
shape:       [·, mn, packed_sf_k]          where packed_sf_k = ceil_div(k, gran_k * 4)
stride(-3):  stride(-1) * size(-1)         # outer/group dimension packed tightly
stride(-2):  1                             # contiguous along MN ("MN-major")
stride(-1):  align(mn, 4)                  # TMA 16-byte alignment
```

Note the tensor is **MN-major**: the MN dimension is the contiguous one, so the underlying memory is `packed_sf_k` slices of `align(mn, 4)` elements each (see Section 7.2 for a diagram).

注意该 tensor 是 **MN-major**: MN 维是连续维, 底层内存是 `packed_sf_k` 个切片, 每片 `align(mn, 4)` 个元素 (图见 7.2).

> **核对:** 为什么 SF 要 MN-major 且末维按 `align(mn, 4)` 对齐?
> 答: TMA 要求 `stride(-1)` 是 16 字节的倍数, `int32` 占 4 字节, 故对齐到 4 个元素, 常量 `ALIGN_MN = 16 / sizeof(int32) = 4`; 这条由 [`csrc/utils/layout.hpp`](https://github.com/deepseek-ai/DeepGEMM/blob/main/csrc/utils/layout.hpp) 的 `check_sf_layout` 校验. MN-major 让 kernel 用 TMA 把一个 MN block 的 SF 连续搬进共享内存, 与 A / B 的搬运对齐.

### 4. The Transform: `transform_sf_into_required_layout`

```python
deep_gemm.transform_sf_into_required_layout(
    sf,                        # torch.Tensor, float32 or int32
    mn,                        # int: M (if is_sfa) or N
    k,                         # int
    recipe,                    # (gran_m, gran_n, gran_k) or (gran_mn, gran_k)
    num_groups=None,           # int: set if sf has a leading group dimension
    is_sfa=None,               # bool: REQUIRED with a 3-tuple recipe; FORBIDDEN with a 2-tuple
    disable_ue8m0_cast=False,
    psum_layout=None,          # torch.Tensor: only for SFA under the PSUM layout (skips gap rows)
) -> torch.Tensor
```

Recipe form rules (asserted in `csrc/apis/layout.hpp`):

- 3-tuple `(gran_m, gran_n, gran_k)`: must also pass `is_sfa` (`True` selects `gran_m`, `False` selects `gran_n`).
- 2-tuple `(gran_mn, gran_k)`: must NOT pass `is_sfa`.

recipe 形式规则 (在 `csrc/apis/layout.hpp` 断言): 三元组 `(gran_m, gran_n, gran_k)` 必须同时传 `is_sfa` (`True` 选 `gran_m`, `False` 选 `gran_n`); 二元组 `(gran_mn, gran_k)` 则禁止传 `is_sfa`.

Dispatch table (`csrc/apis/layout.hpp`):

分发表 (`csrc/apis/layout.hpp`):

| Input dtype | `gran_mn` | `gran_k` | Arch | Action |
|---|---|---|---|---|
| `float32` | 1 | 128 | SM90 (or `disable_ue8m0_cast`) | Transpose to MN-major, TMA-aligned `float32` (no packing) |
| `float32` | 128 | 128 | SM90 (or `disable_ue8m0_cast`) | Validate only (no transform) |
| `float32` | any | 32 or 128 | SM100 | Broadcast along MN to `gran_mn=1`, then pack to UE8M0 `int32`, MN-major, TMA-aligned |
| `int32` | 1 | 32 or 128 | SM100 | Validate only (already pre-transformed; must satisfy Section 3) |

分发表要点: SM90 (或关闭 UE8M0 cast) 下 `float32` 粒度 `(1, 128)` 转成 MN-major 、 TMA 对齐的 `float32` (不打包), 粒度 `(128, 128)` 只校验; SM100 下 `float32` 任意 `gran_mn` 、 `gran_k` 为 32 或 128 时先沿 MN 广播到 `gran_mn=1` 再打包成 UE8M0 `int32`, `int32` 输入只校验 (必须满足第 3 节).

For the SM100 `float32` row, the returned tensor is exactly the pre-transformed format defined in Section 3: shape `[·, mn, ceil_div(k, gran_k * 4)]`, dtype `int32`, strides `(align(mn, 4) * ceil_div(k, gran_k * 4), 1, align(mn, 4))`. It can be cached and passed back to later calls, which then hit the `int32` validate-only row.

SM100 的 `float32` 这一行, 返回的 tensor 正是第 3 节定义的预转换格式: 形状 `[·, mn, ceil_div(k, gran_k * 4)]`, dtype `int32`, stride `(align(mn, 4) * ceil_div(k, gran_k * 4), 1, align(mn, 4))`. 它可以缓存并在后续调用中复用, 届时走 `int32` 只校验那一行.

#### Example: transform weight SFs once and cache

```python
import deep_gemm

# Weights for fp8_einsum 'bhr,hdr->bhd': B operand = [h, d, r], so N=d, K=r, batch=h.
# Untransformed SFB: [h, ceil_div(d, 128), ceil_div(r, 128)], float32
sfw = deep_gemm.transform_sf_into_required_layout(
    sf=scale_factor,
    mn=d, k=r,
    recipe=(1, 128, 128),  # (gran_m, gran_n, gran_k) of the ORIGINAL quantization
    is_sfa=False,          # this is SFB, so gran_mn = gran_n = 128
    num_groups=h,
)
# sfw: [h, d, ceil_div(r, 128 * 4)], int32, MN-major, TMA-aligned. Cache and reuse.

deep_gemm.fp8_einsum(
    'bhr,hdr->bhd',
    (x_fp8, sfx),
    (w_fp8, sfw),          # pre-transformed: no transform kernel launched for SFB
    out,
    recipe=(1, 1, 128),    # gran_n is now 1 (broadcast during the transform); gran_k unchanged
)
```

This works for SFB because `'bhr,hdr->bhd'` does not permute the B operand. To also pre-transform the activation SFA, see Section 6.2 — `fp8_einsum` permutes SFs internally, which changes how the transform must be applied.

这段对 SFB 成立, 因为 `'bhr,hdr->bhd'` 不置换 B 操作数. 若要同时预转换激活的 SFA, 见 6.2 —— `fp8_einsum` 内部会置换 SF, 从而改变转换的施加方式.

#### Example: produce pre-transformed SFs directly from a cast kernel

Cast kernels can emit the packed `int32` SF directly, so no transform is ever needed (e.g., `per_token_cast` from `tile_kernels`):

cast kernel 可以直接产出打包的 `int32` SF, 从而完全不需要转换 (例如 `tile_kernels` 的 `per_token_cast`):

```python
from tile_kernels.quant import per_token_cast

a_fp8, sfa = per_token_cast(
    x=activation,                       # [num_tokens, hidden], bf16
    fmt='e4m3',
    num_per_channels=128,               # = gran_k
    round_sf=True,                      # SF values are exact powers of 2 (Section 1.2)
    use_tma_aligned_col_major_sf=True,  # MN-major + TMA-aligned strides (Section 3)
    use_packed_ue8m0=True,              # packed int32 output
)
# a_fp8: [num_tokens, hidden], float8_e4m3fn
# sfa:   [num_tokens, ceil_div(hidden, 128 * 4)], int32, satisfies Section 3

deep_gemm.m_grouped_fp8_fp4_gemm_nt_contiguous(
    a=(a_fp8, sfa),        # int32 SF: validated, not transformed
    b=(b_fp4, sfb),
    d=output,
    grouped_layout=grouped_layout,
    recipe_a=(1, 128),     # (gran_m, gran_k): gran_m must be 1 for pre-transformed SFs
    recipe_b=(1, 32),
    use_psum_layout=True,
)
```

#### Example: simplest path (untransformed float32 SFs)

```python
# A: [m, k] FP8, quantized at 1x128; SFA: [m, ceil_div(k, 128)], float32
# B: [num_groups, n, k] FP4, quantized at 32x32; SFB: [num_groups, ceil_div(n, 32), ceil_div(k, 32)], float32
# grouped_layout: [num_groups], int32, PSUM row boundaries:
#   group i occupies A rows [align(layout[i-1], alignment), layout[i])
deep_gemm.m_grouped_fp8_fp4_gemm_nt_contiguous(
    a=(a_fp8, sfa),
    b=(b_fp4, sfb),
    d=output,
    grouped_layout=grouped_layout,
    recipe_a=(1, 128),
    recipe_b=(32, 32),     # float32 SFs may use any supported granularity
    use_psum_layout=True,
)
# DeepGEMM launches the transform kernel internally for both SFs on every call.
```

以上三个例子分别演示: 权重 SF 转换一次后缓存复用 (SFB 不被置换时直接按操作数自身的 `(num_groups, mn, k)` 转换); 由 cast kernel 直接产出满足第 3 节的打包 `int32` SF, 走只校验路径; 以及最简单的未转换 `float32` SF 路径, 每次调用内部启动转换 kernel.

### 5. K-Grouped Contiguous Layout

K-grouped GEMM concatenates groups along K. The SM100 FP8 TN API uses logical operands `A = [sum_k, m]` and `B = [sum_k, n]`; the SM100 FP4 NT API uses `A = [m, sum_k]` and `B = [n, sum_k]`, backed by packed-byte storage `[m, sum_k / 2]` and `[n, sum_k / 2]`. Both produce `D = [num_groups, m, n]` and share the `grouped_layout` semantics below. APIs:

K 分组 GEMM 沿 K 轴拼接各组. SM100 的 FP8 TN API 逻辑操作数为 `A = [sum_k, m]` 和 `B = [sum_k, n]`; SM100 的 FP4 NT API 为 `A = [m, sum_k]` 和 `B = [n, sum_k]`, 底层按打包字节存储 `[m, sum_k / 2]` 和 `[n, sum_k / 2]`. 两者都产出 `D = [num_groups, m, n]`, 共享下面的 `grouped_layout` 语义.

```python
deep_gemm.k_grouped_fp8_gemm_tn_contiguous(   # SM100; SM90 uses k_grouped_fp8_gemm_nt_contiguous
    a,                       # (tensor, sf) pair
    b,                       # (tensor, sf) pair
    d,
    ks_cpu,                  # List[int] or None: per-group K sizes, on CPU
    grouped_layout,          # torch.Tensor: [num_groups], int32, on device (num_groups <= 128)
    c,                       # although the signature defaults to None, k-grouped asserts c is
                             # not None: pass an FP32 accumulator with the same shape as d
                             # (d = c + sum over groups); passing None fails a DG_HOST_ASSERT.
                             # Prefer passing the SAME tensor as d (c is d): the kernel then
                             # accumulates in place. If c is a different tensor, DeepGEMM first
                             # runs d.copy_(c) before the GEMM (an extra full copy)
    recipe=(1, 1, 128),      # gran_m and gran_n MUST be 1; gran_k in {32, 128} on SM100
    compiled_dims="mn",
    use_psum_layout=False,
)

deep_gemm.k_grouped_fp4_gemm_nt_contiguous(   # SM100 only; same arguments
    a, b, d, ks_cpu, grouped_layout, c,
    recipe=(1, 1, 32), compiled_dims="mn", use_psum_layout=False,
)
```

`k_alignment` below is the global MK alignment for contiguous layouts, set via `deep_gemm.set_mk_alignment_for_contiguous_layout(value)`. It must be a multiple of the kernel's `BLOCK_K`: 128 for FP8 on SM100 (SM90: exactly 128) and 256 for FP4. Every aligned K range must have zero A/B padding and valid corresponding SF padding.

下面提到的 `k_alignment` 是 contiguous 布局的全局 MK 对齐, 由 `deep_gemm.set_mk_alignment_for_contiguous_layout(value)` 设置. 它必须是 kernel `BLOCK_K` 的倍数: SM100 上 FP8 为 128 (SM90 恰为 128), FP4 为 256. 每个对齐后的 K 区间 A/B 必须零填充, 对应的 SF 填充也必须有效.

#### 5.1 `grouped_layout` and `ks_cpu` semantics

The meaning of `grouped_layout` depends on `use_psum_layout`:

`grouped_layout` 的含义取决于 `use_psum_layout`:

| `use_psum_layout` | `grouped_layout[i]` contains | `ks_cpu` | `k_i` constraints |
|---|---|---|---|
| `False` | group `i`'s K size directly | required | each `k_i % k_alignment == 0` and `k_i % gran_k == 0` |
| `True` | cumulative (prefix-sum) end offset; group `i` occupies K range `[align(layout[i-1], k_alignment), layout[i])` | optional | `k_i` needs no alignment |

`False` 时 `grouped_layout[i]` 直接是第 `i` 组的 K 大小, `ks_cpu` 必传, 每个 `k_i` 要被 `k_alignment` 与 `gran_k` 整除; `True` 时 `grouped_layout[i]` 是前缀和的结束偏移, 第 `i` 组占 K 区间 `[align(layout[i-1], k_alignment), layout[i])`, `ks_cpu` 可选, `k_i` 无需对齐.

With `use_psum_layout=True`:

- If `ks_cpu` is provided, it must contain the **aligned** sizes `align(k_i, k_alignment)` (each entry must be a multiple of `k_alignment`); the exact SF shape is then computed on the host.
- If `ks_cpu` is `None` or `[]`, group sizes are read from `grouped_layout` on the device, and the host allocates an upper bound of `(sf_k + 3 * num_groups) / 4` packed rows.

当 `use_psum_layout=True`: 若提供 `ks_cpu`, 必须是 **对齐后** 的大小 `align(k_i, k_alignment)` (每项都是 `k_alignment` 的倍数), host 据此算出精确 SF 形状; 若 `ks_cpu` 为 `None` 或 `[]`, 组大小在设备侧从 `grouped_layout` 读取, host 分配 `(sf_k + 3 * num_groups) / 4` 个打包行的上界.

#### 5.2 K-grouped SF contract

The SF input (per operand) is 2D. Two accepted dtypes:

每个操作数的 SF 输入是 2D, 接受两种 dtype:

**`float32` (DeepGEMM packs it):** shape `[sum_sf_k, mn]` contiguous, where `sum_sf_k` = total SF rows over all groups (`k_i / gran_k` rows per group without PSUM; `align(k_i, k_alignment) / gran_k` with PSUM). Supported for `gran_k` 32 and 128. Requires `mn % 4 == 0`.

**`float32` (由 DeepGEMM 打包):** 形状 `[sum_sf_k, mn]` 连续, `sum_sf_k` 是所有组的 SF 行总数 (无 PSUM 时每组 `k_i / gran_k` 行, 有 PSUM 时 `align(k_i, k_alignment) / gran_k` 行). 支持 `gran_k` 为 32 和 128, 要求 `mn % 4 == 0`.

**`int32` pre-packed (validated only, no kernel):** ONLY accepted on SM100 with `gran_k = 32`. For `gran_k = 128` you must pass `float32`. Contract:

**`int32` 预打包 (只校验, 不启动 kernel):** 仅在 SM100 且 `gran_k = 32` 时接受. `gran_k = 128` 时必须传 `float32`. 契约:

```
shape:  [packed_sf_k, mn] where packed_sf_k >= sum(ceil_div(k_i, gran_k * 4))   # larger is OK, e.g.
        a buffer pre-allocated for the maximum K; unused trailing rows are ignored
stride: [mn, 1] (contiguous); mn % 4 == 0
layout: each group starts at a new packed row; when a group's SF row count is not a
        multiple of 4, the trailing UE8M0 slots of its last packed row are zero-filled
```

Note the k-grouped packed SF is plain contiguous `[packed_sf_k, mn]` — unlike Section 3, no padding is inserted along MN; instead `mn % 4 == 0` is a hard precondition.

注意 K 分组的打包 SF 是普通连续的 `[packed_sf_k, mn]` —— 与第 3 节不同, MN 方向不插填充, 而是把 `mn % 4 == 0` 作为硬前置条件.

#### 5.3 Example: k-grouped with float32 SFs (non-PSUM)

```python
import torch, deep_gemm

gran_k, k_alignment = 32, 128
deep_gemm.set_mk_alignment_for_contiguous_layout(k_alignment)

ks = [2048, 4096, 1024]                    # each a multiple of k_alignment (and gran_k)
sum_k = sum(ks)
grouped_layout = torch.tensor(ks, device='cuda', dtype=torch.int32)  # per-group sizes (non-PSUM)

# a_fp8: [sum_k, m] float8_e4m3fn;  sfa: [sum_k // gran_k, m] float32, contiguous
# b_fp8: [sum_k, n] float8_e4m3fn;  sfb: [sum_k // gran_k, n] float32, contiguous
# m and n must be multiples of 4 (SF packing precondition, Section 5.2)
d = torch.zeros((num_groups, m, n), device='cuda', dtype=torch.float)
deep_gemm.k_grouped_fp8_gemm_tn_contiguous(
    a=(a_fp8, sfa), b=(b_fp8, sfb), d=d,
    ks_cpu=ks, grouped_layout=grouped_layout,
    c=d,                     # same tensor as d: in-place accumulation, no extra copy
    recipe=(1, 1, gran_k),
)
```

#### 5.4 Example: k-grouped with pre-packed int32 SFs

```python
# Pack once with the dedicated helper (or produce packed SFs from your cast kernel):
sfa_packed = deep_gemm.get_k_grouped_mn_major_tma_aligned_packed_ue8m0_tensor(
    sfa,                     # [sum_sf_k, mn] float32, contiguous
    grouped_layout,          # semantics per Section 5.1
    ks_cpu=ks,               # or None/[] with use_psum_layout=True
    gran_k=32,               # int32 pre-packing path requires gran_k == 32
    k_alignment=k_alignment,
    use_psum_layout=False,
)
# sfa_packed: [sum(ceil_div(k_i, 32*4)), mn], int32

deep_gemm.k_grouped_fp8_gemm_tn_contiguous(
    a=(a_fp8, sfa_packed), b=(b_fp8, sfb_packed), d=d,
    ks_cpu=ks, grouped_layout=grouped_layout, c=d,
    recipe=(1, 1, 32),       # gran_k stays 32; layout is validated, no transform kernel runs
)
```

#### 5.5 Example: PSUM layout (dynamic group sizes)

```python
# real_ks may be unaligned; groups are stored padded to k_alignment
def build_psum_layout(real_ks, k_alignment):
    psum, prev_end = [], 0
    for k in real_ks:
        end = (prev_end + k_alignment - 1) // k_alignment * k_alignment + k  # align(prev_end) + k
        psum.append(end)
        prev_end = end
    return psum

real_ks = [1000, 4096, 900]
grouped_layout = torch.tensor(build_psum_layout(real_ks, k_alignment), device='cuda', dtype=torch.int32)
aligned_ks = [(k + k_alignment - 1) // k_alignment * k_alignment for k in real_ks]

deep_gemm.k_grouped_fp8_gemm_tn_contiguous(
    a=(a_fp8, sfa), b=(b_fp8, sfb), d=d,
    ks_cpu=aligned_ks,       # pass ALIGNED sizes; or None if only known on device
    grouped_layout=grouped_layout,
    c=d, recipe=(1, 1, gran_k),
    use_psum_layout=True,
)
```

以上四个 K 分组例子分别演示: 非 PSUM 的 `float32` SF (组大小整除对齐) 、 预打包 `int32` SF (gran_k 必须为 32) 、 以及 PSUM 布局 (组大小动态, 按 `k_alignment` 填充存储, `ks_cpu` 传对齐后的大小).

### 6. SF Requirements Beyond Plain GEMM (Attention, Mega MoE)

Several non-GEMM APIs take SF tensors with **hardcoded** requirements that bypass the recipe/transform pipeline of Section 4. Passing the wrong SF dtype fails a `DG_HOST_ASSERT` immediately.

一些非 GEMM 的 API 对 SF tensor 有 **硬编码** 的要求, 绕开第 4 节的 recipe / 转换流程. 传错 SF dtype 会立刻触发 `DG_HOST_ASSERT`.

#### 6.1 MQA Logits: `fp8_fp4_mqa_logits` / `fp8_fp4_paged_mqa_logits`

Sources: `csrc/apis/attention.hpp` (host checks), `tests/test_attention.py` (SF construction).

来源: `csrc/apis/attention.hpp` (host 检查), `tests/test_attention.py` (SF 构造).

```python
deep_gemm.fp8_fp4_mqa_logits(
    q,                       # (q_fp, q_sf): q_fp [seq_len, num_heads, head_dim]
    kv,                      # (kv_fp, kv_sf):       kv_fp [seq_len_kv, head_dim]
    weights,                 # [seq_len, num_heads]; bf16 on SM100, float32 on SM90
    cu_seq_len_k_start, cu_seq_len_k_end,
    max_seqlen_k=max_seqlen_k,
)
```

**The dtype of `q_sf` and `kv_sf` is COUPLED.** Passing `q_sf` selects "MX mode", which flips the required `kv_sf` dtype (attention.hpp:123: `kv_sf.scalar_type() == (is_mx_sf ? kInt32 : kFloat)`). There is no mixed mode:

**`q_sf` 与 `kv_sf` 的 dtype 是耦合的. ** 传 `q_sf` 即选中「MX 模式」, 它会翻转所需的 `kv_sf` dtype (attention.hpp:123). 没有混合模式:

| Mode | `q_sf` | `kv_sf` | Q/KV data dtype | Arch |
|---|---|---|---|---|
| MX (`q_sf` provided) | `int32` packed UE8M0, contiguous | `int32` packed UE8M0, contiguous | FP8 (MXFP8) or packed FP4 (MXFP4) | SM100 only |
| non-MX (`q_sf=None`) | — | `float32` (one plain scale per token), contiguous | FP8 only | SM90 only |

两种模式: MX 模式 (提供 `q_sf`) 下 `q_sf` 、 `kv_sf` 都是打包 UE8M0 的连续 `int32`, Q/KV 数据为 MXFP8 或打包 MXFP4, 仅 SM100; non-MX 模式 (`q_sf=None`) 下 `kv_sf` 为每 token 一个 `float32` scale, Q/KV 为 FP8, 仅 SM90.

> **问:** 为什么传不传 `q_sf` 会反过来决定 `kv_sf` 的 dtype?
> 答: 因为这两种模式对应两条完全不同的硬件路径, 没有混合模式. 提供 `q_sf` 即进入 MX 模式 (SM100, Q / KV 都带打包 UE8M0 scale), 不提供则是 SM90 的 non-MX 路径 (每 token 一个 float32 scale). [`csrc/apis/attention.hpp`](https://github.com/deepseek-ai/DeepGEMM/blob/main/csrc/apis/attention.hpp) 第 123 行用 `kv_sf.scalar_type() == (is_mx_sf ? kInt32 : kFloat)` 强制这个耦合, 传错即 `DG_HOST_ASSERT` 失败.

Additional rules:

- **FP4 Q/KV data requires MX mode** — `q_sf` must be provided (attention.hpp:92).
- SF shapes: `q_sf` is `[seq_len, num_heads]` (non-paged) or `[batch_size, next_n, num_heads]` (paged); `kv_sf` is 1-D `[seq_len_kv]`. Both contiguous.
- MX SF granularity is per-32-element blocks along `head_dim` — with `head_dim <= 128` all (up to 4) UE8M0 exponents of one token/head fit in exactly **one `int32`**, hence the shapes above have no trailing K dimension.
- The non-paged API returns compressed logits and requires a positive `max_seqlen_k`. Neither API cleans entries beyond each row's valid KV span; callers must mask them.
- Weights and logits are BF16 on SM100 and FP32 on SM90; the output dtype is fixed by the architecture.
- Paged variant: the KV SF is **fused into the byte cache**, not a separate tensor. `kv_cache` is `uint8` of shape `[num_kv_blocks, block_kv, 1, kv_head_dim + 4]` — per token, the value bytes (`head_dim` for FP8, `head_dim/2` for FP4) are followed by 4 SF bytes interpreted as `int32` (MX) or `float32` (non-MX) (attention.hpp:266-285).

补充规则: FP4 的 Q/KV 数据必须用 MX 模式 (须提供 `q_sf`); `q_sf` 形状为 `[seq_len, num_heads]` (非分页) 或 `[batch_size, next_n, num_heads]` (分页), `kv_sf` 是一维 `[seq_len_kv]`, 都连续; MX 的 SF 粒度是沿 `head_dim` 每 32 个元素一块, `head_dim <= 128` 时一个 token / head 的 (至多 4 个) UE8M0 指数正好塞进 **一个 `int32`**, 所以上面形状没有尾随 K 维; 非分页 API 返回压缩 logits 且要求 `max_seqlen_k` 为正, 两个 API 都不清理超出有效 KV 跨度的项, 调用方要自己 mask; weights 与 logits 在 SM100 为 BF16 、 SM90 为 FP32; 分页版把 KV SF **融进字节 cache**, `kv_cache` 为 `uint8` 形状 `[num_kv_blocks, block_kv, 1, kv_head_dim + 4]`, 每 token 的 value 字节后跟 4 个 SF 字节, 按 `int32` (MX) 或 `float32` (non-MX) 解释.

```python
from deep_gemm.utils import per_token_cast_to_fp8, per_custom_dims_cast_to_fp8

# MX mode (SM100): per-token 1x32 quantization, packed UE8M0 for BOTH SFs
q_fp8_2d, q_sf = per_token_cast_to_fp8(q.view(-1, head_dim), use_ue8m0=True, gran_k=32, use_packed_ue8m0=True)
kv_fp8, kv_sf = per_token_cast_to_fp8(kv, use_ue8m0=True, gran_k=32, use_packed_ue8m0=True)
logits = deep_gemm.fp8_fp4_mqa_logits(
    q=(q_fp8_2d.view(seq_len, num_heads, head_dim), q_sf.view(seq_len, num_heads)),  # int32
    kv=(kv_fp8, kv_sf.view(seq_len_kv)),                                             # int32
    weights=weights, cu_seq_len_k_start=ks, cu_seq_len_k_end=ke,
    max_seqlen_k=int((ke - ks).max().item()))

# non-MX mode: q_sf=None forces kv_sf to be plain float32 per-token
kv_fp8, kv_sf = per_custom_dims_cast_to_fp8(kv, (0,), False)   # kv_sf: [seq_len_kv], float32
logits = deep_gemm.fp8_fp4_mqa_logits(
    q=(q.to(torch.float8_e4m3fn), None),
    kv=(kv_fp8, kv_sf),
    weights=weights, cu_seq_len_k_start=ks, cu_seq_len_k_end=ke,
    max_seqlen_k=int((ke - ks).max().item()))
```

#### 6.2 `fp8_einsum`: SFs Are Permuted Internally

`fp8_einsum` hardcodes its expressions and **permutes each operand AND its SF** into `(batch, m, n, k)` order before calling the internal batched GEMM (`csrc/apis/einsum.hpp:209-232`):

`fp8_einsum` 硬编码了它支持的表达式, 在调用内部的批量 GEMM 之前, 会把每个操作数 **及其 SF** 置换成 `(batch, m, n, k)` 顺序 (`csrc/apis/einsum.hpp:209-232`):

| Expression | `(batch, m, n, k)` | SFA permute | SFB permute |
|---|---|---|---|
| `'bhr,hdr->bhd'` | `(h, b, d, r)` | `(1, 0, 2)` | none |
| `'bhd,hdr->bhr'` (SM100) | `(h, b, r, d)` | `(1, 0, 2)` | `(0, 2, 1)` |
| `'bhd,bhr->hdr'` (SM100) | `(h, d, r, b)` | `(1, 2, 0)` | `(1, 2, 0)` |

Consequences for pre-transformed (`int32`) SFs — the Section 3 stride contract is checked on the **post-permute** tensor:

对预转换 (`int32`) SF 的后果 —— 第 3 节的 stride 契约是在 **置换之后** 的张量上检查的:

- If the SF is not permuted (e.g., SFB of `'bhr,hdr->bhd'`, as in the Section 4 weight example), transform it directly with the operand's own `(num_groups, mn, k)`.
- If the SF is permuted, you must transform it **in post-permute coordinates** and permute it back before passing it to `fp8_einsum`. Do NOT `view`/`reshape` a 2-D transform output into 3-D — the transform output is MN-major (non-contiguous), so reshaping destroys the required strides.

若 SF 不被置换 (如 `'bhr,hdr->bhd'` 的 SFB, 即第 4 节权重例子), 直接按操作数自身的 `(num_groups, mn, k)` 转换; 若 SF 被置换, 必须在 **置换后坐标** 里转换, 再置换回来才传给 `fp8_einsum`. 不要把 2D 转换输出 `view` / `reshape` 成 3D —— 转换输出是 MN-major (非连续), reshape 会破坏所需 stride.

```python
# WRONG: 2-D transform + reshape breaks the MN-major strides
sfx_2d = deep_gemm.transform_sf_into_required_layout(sfx_f32.view(b * h, -1), mn=b * h, k=r, recipe=(1, 128))
sfx_int32 = sfx_2d.reshape(b, h, -1)   # silently copies to contiguous strides;
                                       # stride(-2) != 1 after the internal permute -> DG_HOST_ASSERT fails

# CORRECT for 'bhr,hdr->bhd' SFA: fp8_einsum permutes SFA with (1, 0, 2), so the internal
# batched GEMM sees [h, b, packed_sf_k]. Transform with num_groups=h, mn=b, then permute back:
sfx_grouped = deep_gemm.transform_sf_into_required_layout(
    sfx_f32.permute(1, 0, 2).contiguous(),   # [h, b, ceil_div(r, 128)], float32
    mn=b, k=r, recipe=(1, 128), num_groups=h,
)                                            # [h, b, packed_sf_k], int32, Section 3 layout
sfx_int32 = sfx_grouped.permute(1, 0, 2)     # [b, h, packed_sf_k] view; einsum permutes it back
deep_gemm.fp8_einsum('bhr,hdr->bhd', (x_fp8, sfx_int32), (w_fp8, sfw), out, recipe=(1, 1, 128))
```

Untransformed `float32` SFs need no special care — the internal transform handles the permuted layout.

未转换的 `float32` SF 不需要特殊处理 —— 内部转换会处理置换后的布局.

#### 6.3 Mega MoE: `fp8_fp4_mega_moe`

Sources: `csrc/apis/mega_moe.hpp` (host checks), `deep_gemm/mega/__init__.py` (Python wrapper + weight transform), `tests/test_mega_moe.py` (SF construction).

来源: `csrc/apis/mega_moe.hpp` (host 检查), `deep_gemm/mega/__init__.py` (Python 包装与权重转换), `tests/test_mega_moe.py` (SF 构造).

- **Recipe is pinned to `(1, 1, 32)`** (mega.hpp:179); `kGranK = 32` is also hardcoded in the JIT impl (sm100_fp8_fp4_mega_moe.hpp:165).
- **Weight SFs must already be packed `int32`** — unlike the GEMM APIs, there is NO float32 fallback and no auto-transform: `check_sf_layout(..., type_check=torch::kInt)` rejects `float32` outright (mega.hpp:206-209, 229-232). The required layout is exactly the Section 3 contract with `gran_k = 32`:
  - Routed L1 SF: `[num_experts_per_rank, 2*intermediate_hidden, ceil_div(hidden, 128)]`, `int32`, MN-major, TMA-aligned (`stride(-2)==1`, `stride(-1)==align(mn,4)`); routed L2 SF: `[num_experts_per_rank, hidden, ceil_div(intermediate_hidden, 128)]`. (The `/128` is `gran_k * 4 = 32 * 4`.)
  - Shared expert SFs (optional; weights are FP8 instead of FP4): same contract, 2-D without the group dimension.
- **An extra mega-MoE-only layout step is mandatory**: pass weights + SFs through `deep_gemm.transform_weights_for_mega_moe` before the call. It (a) interleaves gate/up rows of L1 (weights AND SF, 8-row granularity) and (b) applies a UTCCP intra-128-row transpose to both L1 and L2 SFs (`reshape(-1, 4, 32, packed_sf_k).transpose(2, 3)`; requires `mn % 128 == 0`) — `deep_gemm/mega/__init__.py:97-149`. The SFs in Section 3 layout alone are NOT directly consumable by the kernel.
- **Activation SFs are internal**: they live in slices of the symmetric buffer (`x_sf` is K-major `[num_max_tokens_per_rank, hidden // 128]` `int32`; the intermediate `l1/l2_acts_sf` are MN-major), produced by the kernel pipeline — not user-supplied arguments (mega.hpp:96-153).

Mega MoE 的 SF 要点: recipe 固定为 `(1, 1, 32)`, `kGranK = 32` 在 JIT 实现里也硬编码; 权重 SF 必须已经是打包 `int32`, 没有 float32 回退也没有自动转换, `float32` 直接被 `check_sf_layout` 拒绝; 所需布局正是第 3 节 `gran_k = 32` 的契约 (routed L1 SF 形状 `[num_experts_per_rank, 2*intermediate_hidden, ceil_div(hidden, 128)]`, routed L2 SF `[num_experts_per_rank, hidden, ceil_div(intermediate_hidden, 128)]`, shared expert SF 同契约但去掉组维且权重为 FP8); 调用前还必须经 `transform_weights_for_mega_moe` 做 mega MoE 专属的布局 (把 L1 的 gate / up 行按 8 行粒度交错, 并对 L1 、 L2 SF 做 UTCCP 的 128 行内转置, 要求 `mn % 128 == 0`), 只有第 3 节布局还不能直接喂给 kernel; 激活 SF 是内部的, 存在 symmetric buffer 的切片里 (`x_sf` 为 K-major, 中间的 `l1/l2_acts_sf` 为 MN-major), 由 kernel 流水产出, 不是用户传入的参数.

```python
from deep_gemm.utils import per_token_cast_to_fp4

# Routed expert weights: [g, n, k] bf16 -> FP4 (1x32) + float32 SF [g, n, k/32]
w = torch.empty((g, n, k // 2), device='cuda', dtype=torch.int8)
w_sf = torch.empty((g, n, k // 32), device='cuda', dtype=torch.float)
for i in range(g):
    w[i], w_sf[i] = per_token_cast_to_fp4(w_bf16[i], use_ue8m0=True, gran_k=32)

# Step 1: pack to the Section 3 int32 layout (mandatory; float32 SFs are rejected)
w_sf = deep_gemm.transform_sf_into_required_layout(w_sf, n, k, (1, 32), num_groups=g)

# Step 2: mega-MoE weight/SF shuffle (gate-up interleave + UTCCP SF transpose; mandatory)
(l1_w, l1_sf), (l2_w, l2_sf) = deep_gemm.transform_weights_for_mega_moe((l1_w, l1_sf), (l2_w, l2_sf))
```

### 7. Internals

Reference for kernel developers and for debugging layout mismatches.

本节是给 kernel 开发者 、 以及排查布局不匹配时的参考.

#### 7.1 UE8M0 Packing

The 8-bit exponents of 4 consecutive K positions are packed into one `int32`, little-endian by K index (`smxx_layout.cuh`):

4 个连续 K 位置的 8 位指数打进一个 `int32`, 按 K 下标小端排列 (`smxx_layout.cuh`):

```cpp
uint32_t packed = 0;
packed |= (values[0] >> 23u);   // exp of sf[4k+0] -> bits [7:0]
packed |= (values[1] >> 15u);   // exp of sf[4k+1] -> bits [15:8]
packed |= (values[2] >>  7u);   // exp of sf[4k+2] -> bits [23:16]
packed |= (values[3] <<  1u);   // exp of sf[4k+3] -> bits [31:24]
```

#### 7.2 Memory Layout of the Transformed Tensor (non-k-grouped)

```
Shape:  [mn, packed_sf_k]    where packed_sf_k = ceil_div(k, gran_k * 4)
Stride: [1, align(mn, 4)]

Diagram (mn=6, packed_sf_k=3, align(6,4)=8), int32 elements:

Offset:   0  1  2  3  4  5  6  7 | 8  9  10 11 12 13 14 15 | 16 ...
Content: m0 m1 m2 m3 m4 m5 __ __ | m0 m1 m2 m3 m4 m5 __ __ | m0 ...
          <--- K-slice 0 ----->    <--- K-slice 1 ----->
```

Each K-slice occupies `align(mn, 4)` elements; the `__` padding exists only for 16-byte TMA alignment and is never read as data.

每个 K 切片占 `align(mn, 4)` 个元素; `__` 填充只为 16 字节 TMA 对齐而存在, 不会被当作数据读取.

#### 7.3 PSUM Gap Row Handling (M-grouped)

Under the M-grouped PSUM layout, gap rows exist between groups:

M 分组的 PSUM 布局下, 组与组之间有空隙行:

```
grouped_layout = [100, 250, 370], alignment = 128
Group 0: rows [0, 100)      valid
Gap:     rows [100, 128)    padding
Group 1: rows [128, 250)    valid
Gap:     rows [250, 256)    padding
Group 2: rows [256, 370)    valid
```

When `psum_layout` is passed to the SF transform, gap rows are not read from the input; the kernel writes `0` for them (a safe finite scale code — UE8M0 `0xff` is NaN). The GEMM kernel never consumes those values.

当把 `psum_layout` 传给 SF 转换时, 空隙行不从输入读取, kernel 为它们写 `0` (一个安全的有限 scale 码 —— UE8M0 的 `0xff` 是 NaN). GEMM kernel 从不消费这些值.

#### 7.4 K-Grouped Packing Algorithm

Each group is packed independently, then concatenated along K (`pack_fp32_into_ue8m0` in `smxx_layout.cuh`):

每组独立打包, 再沿 K 拼接 (`smxx_layout.cuh` 的 `pack_fp32_into_ue8m0`):

1. Determine group `i`'s input SF row range:
   - Non-PSUM: `grouped_layout[i]` is the group K size `k_i` (a multiple of `k_alignment` and `gran_k`), covering `k_i / gran_k` rows.
   - PSUM: `k_i = grouped_layout[i] - align(grouped_layout[i-1], k_alignment)`; the group covers its aligned region, `align(k_i, k_alignment) / gran_k` rows (PSUM data is stored padded to `k_alignment`).
2. Emit `ceil_div(num_group_sf_rows, 4)` packed `int32` rows for the group; if `num_group_sf_rows % 4 != 0`, zero-fill the trailing UE8M0 slots of the last packed row.
3. Concatenate all groups: output shape `[sum(ceil_div(num_group_sf_rows_i, 4)), mn]`, contiguous.

算法三步: 先确定第 `i` 组的输入 SF 行范围 (非 PSUM 时 `grouped_layout[i]` 是组 K 大小 `k_i`, 覆盖 `k_i / gran_k` 行; PSUM 时 `k_i = grouped_layout[i] - align(grouped_layout[i-1], k_alignment)`, 覆盖对齐区域的 `align(k_i, k_alignment) / gran_k` 行); 再为该组产出 `ceil_div(num_group_sf_rows, 4)` 个打包 `int32` 行, 行数不是 4 的倍数时把末行尾部的 UE8M0 槽位零填充; 最终拼接所有组, 输出连续的 `[sum(ceil_div(num_group_sf_rows_i, 4)), mn]`.

## DeepJIT/README.md

> https://github.com/deepseek-ai/DeepJIT/blob/main/README.md

DeepJIT is a lightweight, header-only C++20 JIT runtime for **NVIDIA CUDA GPUs** and **HUAWEI Ascend NPUs**. It gives C++/Python extension authors a shared interface for compiling kernel source at runtime, caching the resulting binaries, loading them onto the device, and launching them with backend-specific options.

DeepJIT 是一个轻量 、 header-only 的 C++20 JIT 运行时, 面向 **NVIDIA CUDA GPU** 与 **华为昇腾 NPU**. 它给 C++ / Python 扩展作者一套共享接口, 用于在运行时编译 kernel 源码 、 缓存产出的二进制 、 把它们加载到设备 、 并用后端专属选项启动.

DeepJIT handles the JIT infrastructure so that kernel libraries can focus on their device code. Both backends share runtime configuration, source and include hashing, in-memory and on-disk caches, and lazy initialization. Kernel source and compiler/launch options remain specific to the selected backend.

DeepJIT 负责 JIT 基础设施, 让 kernel 库专注于设备代码. 两个后端共享运行时配置 、 源码与 include 的哈希 、 内存与磁盘缓存 、 以及惰性初始化. kernel 源码与编译 / 启动选项仍是所选后端专属的.

**Main authors:** [@guyan364](https://github.com/guyan364), [@kurisu6912](https://github.com/kurisu6912), [@LyricZhao](https://github.com/LyricZhao).

主要作者: [@guyan364](https://github.com/guyan364) 、 [@kurisu6912](https://github.com/kurisu6912) 、 [@LyricZhao](https://github.com/LyricZhao).

### Features

- **CUDA and Ascend backends:** use `deep_jit::Runtime<deep_jit::CUDA>` or `deep_jit::Runtime<deep_jit::Ascend>` with the same compile/load/launch workflow.
- **Kernel caching:** reuse loaded kernels in memory and compiled artifacts on disk. Cache keys account for source, tracked includes, compiler versions, effective compiler options, and an application-provided dependency signature.
- **Distributed filesystems and shared caches:** share one cache directory across users, processes, and nodes to reuse compiled kernels. Both backends support local and distributed filesystems with the required POSIX filesystem semantics; see Shared cache for configuration.
- **Lazy initialization:** defer device and compiler discovery until the runtime is first used.
- **PyTorch integration:** use the current PyTorch CUDA or `torch_npu` stream by default, and expose the configured runtime through pybind11 with `get_jit()`.
- **Compilation controls and diagnostics:** configure runtime defaults and per-kernel overrides, inspect compilation metadata, and dump CUDA PTX/SASS or Ascend assembly. CUDA also supports a Python post-compilation hook.

特性: 两个后端用同一套 compile / load / launch 流程 (`deep_jit::Runtime<deep_jit::CUDA>` 或 `<deep_jit::Ascend>`); kernel 缓存既在内存复用已加载 kernel, 也在磁盘复用已编译产物, 缓存键涵盖源码 、 被追踪的 include 、 编译器版本 、 生效的编译选项 、 以及应用提供的依赖签名; 分布式文件系统与共享缓存支持跨用户 、 进程 、 节点共享一个缓存目录 (需满足相应 POSIX 语义); 惰性初始化把设备与编译器探测推迟到首次使用; PyTorch 集成默认用当前 PyTorch CUDA 或 `torch_npu` stream, 并经 pybind11 用 `get_jit()` 暴露运行时; 编译控制与诊断可配置运行时默认值与每 kernel 覆盖 、 查看编译元信息 、 dump CUDA PTX / SASS 或昇腾汇编, CUDA 还支持 Python 的编译后 hook.

#### In development (WIP)

- **Cache warmup from history:** use historical cache entries to anticipate kernels that future runs may need and warm up their cache in advance, reducing compilation delays during execution. This feature is under development and is not yet available.
- **Python compilation API:** pass kernel source code directly from Python to compile CUDA or Ascend kernels. This feature is under development and is not yet available.

开发中 (WIP): 从历史缓存条目预测未来可能用到的 kernel 并提前预热缓存, 以减少执行时的编译延迟; 以及直接从 Python 传 kernel 源码编译 CUDA 或昇腾 kernel 的 Python 编译 API. 两项都还在开发, 暂不可用.

### Supported backends

| Backend | Device toolchain and runtime | Integration requirements |
| --- | --- | --- |
| **CUDA** | NVCC compiles CUDA source to CUBIN; the CUDA Driver API loads and launches kernels. | CUDA headers 12.4+, NVCC 12.9+, and PyTorch with CUDA support. |
| **Ascend** | Bisheng and ld.lld compile and link Ascend kernel source; ACL loads and launches kernels. | CANN with `bin/bisheng`, `bin/ld.lld`, and the Ascend `adv_api` headers; ACL and `torch_npu` headers and runtime. |

The host environment must provide Linux, a C++20 compiler and standard library with `std::format` support, and the dependencies for the selected backend. The default GIL support also requires Python and pybind11; consumers that manage the GIL themselves can disable it as described under Integration. DeepJIT is intended to be embedded into your extension as a header-only dependency. CUDA consumers should compile with `TORCH_TARGET_VERSION=0x020a000000000000` and `USE_CUDA`; this targets PyTorch's stable ABI with PyTorch 2.10 as the minimum runtime version.

host 环境需要 Linux 、 支持 `std::format` 的 C++20 编译器与标准库 、 以及所选后端的依赖. 默认的 GIL 支持还需要 Python 与 pybind11; 自行管理 GIL 的使用方可按 Integration 一节关掉它. DeepJIT 以 header-only 依赖的方式嵌入你的扩展. CUDA 使用方应带 `TORCH_TARGET_VERSION=0x020a000000000000` 与 `USE_CUDA` 编译, 这面向 PyTorch 的稳定 ABI, 最低运行时版本为 PyTorch 2.10.

> **确认:** DeepGEMM 的 `DG_JIT_*` 环境变量为什么在未设置时回退到 `DJ_JIT_*`?
> 答: 因为 DeepGEMM 的运行时编译底座就是 DeepJIT, `DJ` 是 DeepJIT 保留的全局前缀. 每个使用方库在 `Config` 里给一个自己的前缀 (DeepGEMM 用 `DG`), 解析顺序是 `<库前缀>_<SUFFIX>` > `DJ_<SUFFIX>` > 内置默认; 库前缀让单个使用方独立配置, `DJ_` 提供进程级默认.

### Shared cache

CUDA and Ascend use the same disk-cache implementation. It supports local and distributed filesystems that provide atomic directory rename within a filesystem and file/directory `fsync`. Builds use unique temporary directories, synchronize their contents, and publish complete entries through an atomic rename. Concurrent processes can compile the same entry and reuse the published result.

CUDA 与昇腾用同一套磁盘缓存实现. 它支持本地与分布式文件系统 (需提供文件系统内的原子目录 rename 与文件 / 目录 `fsync`). 构建使用唯一的临时目录, 同步其内容, 再通过原子 rename 发布完整条目. 并发进程可以编译同一条目并复用已发布的结果.

Multiple users, processes, and nodes can point to the same cache directory. You can also combine a writable personal cache with a shared lookup cache. DeepJIT searches all roots in order and writes cache misses only to the first root; the shared lookup cache can be read-only.

多个用户 、 进程 、 节点可以指向同一个缓存目录; 也可以把一个可写的个人缓存与一个共享的只读查找缓存组合起来. DeepJIT 按顺序搜索所有根, 未命中只写进第一个根; 共享查找缓存可以是只读的.

```bash
export DJ_JIT_CACHE_DIR="$HOME/.dj:/shared/deep_jit"
```

### Repository layout

| Path | Contents |
| --- | --- |
| [`include/deep_jit/runtime/`](https://github.com/deepseek-ai/DeepJIT/tree/main/include/deep_jit/runtime) | Shared runtime and configuration. |
| [`include/deep_jit/backend/cuda/`](https://github.com/deepseek-ai/DeepJIT/tree/main/include/deep_jit/backend/cuda) | CUDA compiler, device queries, kernel loading, and launch options. |
| [`include/deep_jit/backend/ascend/`](https://github.com/deepseek-ai/DeepJIT/tree/main/include/deep_jit/backend/ascend) | Ascend compiler/linker integration, device queries, kernel loading, and launch options. |
| [`include/deep_jit/cache/`](https://github.com/deepseek-ai/DeepJIT/tree/main/include/deep_jit/cache) | In-memory and on-disk kernel caches. |
| [`include/deep_jit/python_api.hpp`](https://github.com/deepseek-ai/DeepJIT/blob/main/include/deep_jit/python_api.hpp) | pybind11 registration for a consumer library's runtime. |
| [`tests/`](https://github.com/deepseek-ai/DeepJIT/tree/main/tests) | CUDA and Ascend integration tests, example extensions, and device kernels. |

The root `CMakeLists.txt` is for debugging and IDE indexing. Integrate the headers into your own extension as described below; the projects under `tests/test_cuda_proj/` and `tests/test_ascend_proj/` provide working integration examples.

根目录的 `CMakeLists.txt` 用于调试与 IDE 索引. 按下文把头文件集成进你自己的扩展; `tests/test_cuda_proj/` 与 `tests/test_ascend_proj/` 下的项目给出了可运行的集成示例.

### Integration

GIL management is enabled by default and includes pybind11. Consumers that manage the GIL themselves, such as kernels called through `torch.ops`, can compile with `-DDJ_DISABLE_GIL=1` to make `deep_jit::GilScopedRelease` a no-op without including pybind11 or the Python C API from this helper. In CMake, use `target_compile_definitions(my_target PRIVATE DJ_DISABLE_GIL=1)`. Set the macro consistently for every source file compiled into the consumer target.

GIL 管理默认开启并引入 pybind11. 自行管理 GIL 的使用方 (例如经 `torch.ops` 调用的 kernel) 可以用 `-DDJ_DISABLE_GIL=1` 编译, 让 `deep_jit::GilScopedRelease` 变成空操作, 从而不从该辅助层引入 pybind11 或 Python C API. 在 CMake 里用 `target_compile_definitions(my_target PRIVATE DJ_DISABLE_GIL=1)`, 并对编入该目标的每个源文件一致地设置这个宏.

Add `DeepJIT/include` to the include path of the host target, then include exactly one backend entry header. `create_lazy_jit` delays construction of the runtime until its first use, which also delays device and compiler discovery. If configuration is only known during library initialization, start with an empty lazy object and assign its factory later; the lazy object must receive a factory before `jit->...` or Python `get_jit()` is called.

把 `DeepJIT/include` 加进 host 目标的 include 路径, 然后恰好包含一个后端入口头文件. `create_lazy_jit` 把运行时的构造推迟到首次使用, 同时也推迟设备与编译器探测. 若配置只有在库初始化时才知道, 可以先建一个空的 lazy 对象, 之后再给它赋 factory; 在调用 `jit->...` 或 Python 的 `get_jit()` 之前, lazy 对象必须已拿到 factory.

```cpp
#include <deep_jit/backend/cuda/backend.hpp>
using JIT = deep_jit::Runtime<deep_jit::CUDA>;

inline auto jit = deep_jit::create_lazy_jit<deep_jit::CUDA>(
    deep_jit::Config("/absolute/path/to/my_library", "MYLIB"));
```

#### Config

`deep_jit::Config` has the following constructor:

`deep_jit::Config` 的构造函数如下:

```cpp
Config(std::filesystem::path python_library_root,
       std::string env_prefix,
       std::string extra_signature = {},
       std::vector<std::filesystem::path> include_dirs = {},
       std::vector<std::string> include_prefixes = {});
```

- `python_library_root` resolves relative `post_hook` paths. It must be non-empty and absolute.
- `env_prefix` selects the library-specific environment-variable prefix. It must be non-empty and cannot be `DJ`, which is reserved for global defaults.
- `extra_signature` represents dependencies that affect generated code but are not tracked by the include parser. Change it when such a dependency changes, for example `"cutlass-" + std::to_string(CUTLASS_VERSION)`.
- `include_dirs` are passed to the compiler and searched by the include parser. Every path must be absolute.
- `include_prefixes` select which angle-bracket includes are recursively tracked. For example, `"my_library/"` tracks `#include <my_library/kernel.cuh>`.

构造参数含义: `python_library_root` 用于解析相对的 `post_hook` 路径, 必须非空且绝对; `env_prefix` 是该库专属的环境变量前缀, 必须非空且不能是保留给全局默认的 `DJ`; `extra_signature` 代表会影响生成代码却不被 include 解析器追踪的依赖, 这类依赖变了就改它 (例如 `"cutlass-" + std::to_string(CUTLASS_VERSION)`); `include_dirs` 传给编译器并被 include 解析器搜索, 每条路径必须绝对; `include_prefixes` 选择哪些尖括号 include 会被递归追踪 (例如 `"my_library/"` 追踪 `#include <my_library/kernel.cuh>`).

Configuration is snapshotted when `Runtime` is constructed. Do not mutate `config`, `backend`, `parser`, `disk_cache`, or `hash_base` afterward. The supported mutable per-runtime settings are `default_compiler_options` and `default_launch_options`. Compiler, cache, include, and hook paths, as well as free-form compiler flags, are currently passed through a simple shell command and therefore must not contain whitespace or shell metacharacters.

配置在 `Runtime` 构造时被快照. 之后不要改 `config` 、 `backend` 、 `parser` 、 `disk_cache` 或 `hash_base`. 每个运行时支持改的只有 `default_compiler_options` 与 `default_launch_options`. 编译器 、 缓存 、 include 、 hook 路径以及自由格式的编译 flag 目前通过一个简单 shell 命令传递, 因此不能含空白或 shell 元字符.

#### Registering `get_jit()`

For a pybind11 extension, DeepJIT can register the runtime type and `get_jit()` directly. The host library does not need to implement its own `get_jit` binding:

对 pybind11 扩展, DeepJIT 可以直接注册运行时类型与 `get_jit()`, host 库不必自己实现 `get_jit` 绑定:

```cpp
#include <pybind11/pybind11.h>
#include <deep_jit/python_api.hpp>

PYBIND11_MODULE(TORCH_EXTENSION_NAME, module) {
    deep_jit::register_python_api(module, my_library::jit);
}
```

Python can then obtain the same process-local runtime object with `my_library._C.get_jit()`. Calling `get_jit()` initializes the lazy runtime if it has not already been initialized.

Python 随后可以用 `my_library._C.get_jit()` 拿到同一个进程本地的运行时对象. 调用 `get_jit()` 时, 若 lazy 运行时尚未初始化就会初始化它.

### CUDA

The CUDA backend requires CUDA headers 12.4 or newer and NVCC 12.9 or newer. It uses NVCC to generate a CUBIN. Loading through `compile()` requires exactly one CUDA kernel; `compile_without_load()` only builds the artifact and does not perform that check.

CUDA 后端需要 CUDA 头文件 12.4 以上 、 NVCC 12.9 以上, 用 NVCC 生成 CUBIN. 经 `compile()` 加载要求恰好一个 CUDA kernel; `compile_without_load()` 只构建产物, 不做这项检查.

#### Compile and launch

```cpp
const auto kernel = jit->compile("scale", R"(
extern "C" __global__ void scale(float* output, const float* input, int count) {
    const int index = static_cast<int>(blockIdx.x * blockDim.x + threadIdx.x);
    if (index < count)
        output[index] = input[index] * 2.0f;
}
)");

jit->launch(
    kernel,
    {
        .grid_dim = dim3((count + 255) / 256, 1, 1),
        .block_dim = dim3(256, 1, 1),
    },
    output, input, count);
```

The compile tag must contain only letters, digits, and underscores. `compile()` compiles on a cache miss, loads the CUBIN, and returns a process-cached `std::shared_ptr<deep_jit::cuda::Kernel>`. `compile_without_load()` only returns the artifact directory. Unset `deep_jit::cuda::CompilerOptions` fields inherit from the runtime defaults. `nvcc_flags` replaces the default free-form NVCC flag list; structured options such as `optimize_level` are generated separately. `extra_nvcc_flags` appends per-kernel flags such as `-D` definitions.

编译 tag 只能含字母 、 数字 、 下划线. `compile()` 在缓存未命中时编译 、 加载 CUBIN, 返回一个进程内缓存的 `std::shared_ptr<deep_jit::cuda::Kernel>`; `compile_without_load()` 只返回产物目录. `deep_jit::cuda::CompilerOptions` 中未设置的字段继承运行时默认值; `nvcc_flags` 替换默认的自由格式 NVCC flag 列表, `optimize_level` 这类结构化选项单独生成, `extra_nvcc_flags` 追加每 kernel 的 flag (如 `-D` 定义).

CUDA launch options include the stream, dynamic shared-memory size, grid, block, cluster, cooperative-launch, PDL, and non-portable cluster controls. Unset fields inherit from `jit->default_launch_options`. Grid and block dimensions are required and must be positive; dynamic shared-memory size cannot be negative. An unset effective stream uses the current PyTorch CUDA stream. Only one-dimensional clusters are supported. Compile and load kernels before CUDA Graph capture; launching an already loaded kernel is capture-compatible, including when the stream is inherited from the current PyTorch stream.

CUDA launch 选项包括 stream 、 动态共享内存大小 、 grid 、 block 、 cluster 、 协作启动 、 PDL 与 non-portable cluster 控制. 未设置的字段继承 `jit->default_launch_options`. grid 与 block 维度必填且为正; 动态共享内存大小不能为负. 未设置的生效 stream 用当前 PyTorch CUDA stream. 只支持一维 cluster. 要在 CUDA Graph 捕获之前编译并加载 kernel; 启动一个已加载的 kernel 与捕获兼容, 包括 stream 继承自当前 PyTorch stream 时.

#### Post hook

`CompilerOptions::post_hook` selects one optional Python file under `Config::python_library_root`. Only `std::nullopt` disables it; an empty string is still treated as a configured hook. The caller must provide a trusted relative path. When set, it runs after NVCC produces the CUBIN and before the artifact is published; the script receives the absolute CUBIN path as its only argument and must modify that file in place. The configured relative `post_hook` path and file-content hash are included in the kernel cache digest. A hook must be deterministic for a given input CUBIN and tracked signature; represent every hidden dependency in `extra_signature`.

`CompilerOptions::post_hook` 从 `Config::python_library_root` 下选一个可选的 Python 文件. 只有 `std::nullopt` 能禁用它, 空字符串仍被当作已配置的 hook. 调用方必须提供可信的相对路径. 设置后, 它在 NVCC 产出 CUBIN 之后 、 产物发布之前运行; 脚本只收到绝对 CUBIN 路径这一个参数, 必须就地修改该文件. 配置的相对 `post_hook` 路径与文件内容哈希计入 kernel 缓存摘要. 对给定输入与被追踪签名, hook 必须确定; 任何隐藏依赖都要写进 `extra_signature`.

#### Cache-key and artifact rules

The CUDA cache digest is built, in order, from: `Config::extra_signature`; the hash of the complete `nvcc --version` output; the effective compiler flags returned by `CompilerOptions::get_flags()` (paths in `Config::include_dirs` are intentionally excluded, while any `-I...` placed directly in `nvcc_flags` or `extra_nvcc_flags` remains part of the digest); the selected `post_hook` path and file-content hash; and the parser digest of the source and its tracked include tree.

CUDA 缓存摘要按顺序由以下部分构成: `Config::extra_signature`; 完整 `nvcc --version` 输出的哈希; `CompilerOptions::get_flags()` 返回的生效编译 flag (`Config::include_dirs` 里的路径被有意排除, 而直接写进 `nvcc_flags` 或 `extra_nvcc_flags` 的 `-I...` 仍计入摘要); 选中的 `post_hook` 路径与文件内容哈希; 以及源码及其被追踪 include 树的解析器摘要.

Each component is prefixed by its fixed-width byte length before it is added to the two-state FNV-1a hash, so boundaries remain unambiguous even for binary strings containing zero bytes. The final digest is a 32-character hexadecimal string. This is a fast cache checksum, not a cryptographic hash. A disk entry is stored as `<cache-root>/cache/<tag>.<digest>/`; the compile tag is not part of the digest. A directory carrying a `.committed` marker is treated as a completed artifact and its CUBIN may be loaded directly.

每个部分在加入双状态 FNV-1a 哈希前都带固定宽度的字节长度前缀, 因而二进制串即使含有零字节, 各段边界仍然明确. 最终摘要是 32 字符的十六进制快速校验和, 不具备密码学哈希的安全性质. 磁盘条目存为 `<cache-root>/cache/<tag>.<digest>/`, 编译 tag 独立于摘要. 带 `.committed` 标记的目录被视为完成的产物, 其 CUBIN 可直接加载.

#### Include parser

The root source is always hashed. An included file is recursively tracked only when both of the following are true: the directive uses a literal angle-bracket include `#include <...>`; and the included filename starts with one of `Config::include_prefixes`.

根源码总会被哈希. 一个被包含的文件只有在同时满足两条时才被递归追踪: 指令使用字面的尖括号 include `#include <...>`; 且被包含的文件名以 `Config::include_prefixes` 之一开头.

The parser is intentionally a line-oriented scanner, not a C preprocessor. It does not interpret comments between tokens, macro-expanded includes, backslash continuations, or conditional compilation; an include inside `#if 0` is still scanned. Quoted includes such as `#include "kernel.cuh"` are rejected. Tracked include graphs must not contain cycles. Header digests are cached for the lifetime of a runtime, so recreate the runtime after changing tracked header files.

解析器有意是面向行的扫描器, 不是 C 预处理器. 它不解释 token 之间的注释 、 宏展开的 include 、 反斜杠续行或条件编译; `#if 0` 里的 include 仍会被扫描. 带引号的 include (如 `#include "kernel.cuh"`) 被拒绝. 被追踪的 include 图不能有环. 头文件摘要在运行时生命期内缓存, 所以改了被追踪的头文件要重建运行时.

#### Environment variables

For `Config("/absolute/path/to/my_library", "MYLIB")`, every DeepJIT setting is resolved in this order: `MYLIB_<SUFFIX>` > `DJ_<SUFFIX>` > built-in default. For example `MYLIB_JIT_CACHE_DIR` > `DJ_JIT_CACHE_DIR` > `$HOME/.dj`. Boolean values accept `true`/`false`, `yes`/`no`, or any integer, case-insensitively. Only the library-prefixed and `DJ_` forms are read; an unprefixed variable such as `JIT_CACHE_DIR` has no effect.

对 `Config("/absolute/path/to/my_library", "MYLIB")`, 每个 DeepJIT 设置按此顺序解析: `MYLIB_<SUFFIX>` > `DJ_<SUFFIX>` > 内置默认. 例如 `MYLIB_JIT_CACHE_DIR` > `DJ_JIT_CACHE_DIR` > `$HOME/.dj`. 布尔值接受 `true` / `false` 、 `yes` / `no` 或任意整数, 不区分大小写. 只读取带库前缀与 `DJ_` 的形式; 不带前缀的变量 (如 `JIT_CACHE_DIR`) 无效.

Set JIT environment variables before the first runtime construction. Cache roots, compiler selection, C++ standard, and default compiler options are snapshotted then. CUDA toolkit discovery uses `CUDA_HOME` as the first candidate, `CUDA_PATH` as the fallback, then `which nvcc` on `PATH`, then `/usr/local/cuda`. `JIT_NVCC_COMPILER` overrides the executable after CUDA-home discovery, but a valid CUDA root must still be discoverable. SASS dumping additionally requires an executable `cuobjdump` under that discovered toolkit root.

在首次构造运行时之前设置 JIT 环境变量. 缓存根 、 编译器选择 、 C++ 标准 、 默认编译选项都在那时被快照. CUDA toolkit 探测以 `CUDA_HOME` 为首选 、 `CUDA_PATH` 为回退, 再是 `PATH` 上的 `which nvcc`, 再是 `/usr/local/cuda`. `JIT_NVCC_COMPILER` 在 CUDA-home 探测之后覆盖可执行文件, 但仍必须能发现有效的 CUDA 根. dump SASS 还需要探测到的 toolkit 根下有可执行的 `cuobjdump`.

### Ascend

The Ascend backend requires ACL and torch_npu headers plus a CANN toolkit containing `bin/bisheng` and `bin/ld.lld`. It compiles `kernel.asc` to `kernel.rel.o`, links `kernel.o`, parses the unique `.ascend.meta.*` kernel name, and loads it through ACL.

昇腾后端需要 ACL 与 torch_npu 头文件, 以及含 `bin/bisheng` 和 `bin/ld.lld` 的 CANN toolkit. 它把 `kernel.asc` 编译成 `kernel.rel.o`, 链接出 `kernel.o`, 解析唯一的 `.ascend.meta.*` kernel 名, 再经 ACL 加载.

```cpp
inline auto jit = deep_jit::create_lazy_jit<deep_jit::Ascend>(
    deep_jit::Config(
        "/absolute/path/to/my_library", "MYLIB", {},
        {"/absolute/path/to/my_library/include"}, {"my_library/"}));

const auto kernel = jit->compile("scale", source);
jit->launch(kernel, {.num_blocks = num_blocks}, output, input, count);
```

An unset stream uses the current torch_npu stream. `num_blocks` is required. `num_ubuf_bytes` controls dynamic UB size, and `num_launch_timeout_secs` defaults to `JIT_LAUNCH_TIMEOUT`. When `ASCEND_LAUNCH_BLOCKING` is enabled, DeepJIT synchronizes the device after every launch. `deep_jit::ascend::CompilerOptions` supports the optimization level, `dav-*` architecture, debug information, assembly dumping, and replace/append lists for Bisheng and linker flags. The defaults are `-O2`, `--cce-aicore-only`, VF loop unrolling, and `ld.lld -m aicorelinux -Ttext 0 --no-mmap-output-file`. Toolkit discovery checks `ASCEND_HOME_PATH`, `ASCEND_TOOLKIT_HOME`, `/usr/local/Ascend/ascend-toolkit/latest`, and `/usr/local/Ascend/cann`, in that order.

未设置的 stream 用当前 torch_npu stream. `num_blocks` 必填. `num_ubuf_bytes` 控制动态 UB 大小, `num_launch_timeout_secs` 默认取 `JIT_LAUNCH_TIMEOUT`. 开启 `ASCEND_LAUNCH_BLOCKING` 时, DeepJIT 在每次 launch 后同步设备. `deep_jit::ascend::CompilerOptions` 支持优化级别 、 `dav-*` 架构 、 调试信息 、 汇编 dump, 以及 Bisheng 与链接器 flag 的替换 / 追加列表; 默认是 `-O2` 、 `--cce-aicore-only` 、 VF 循环展开, 以及 `ld.lld -m aicorelinux -Ttext 0 --no-mmap-output-file`. toolkit 探测依次检查 `ASCEND_HOME_PATH` 、 `ASCEND_TOOLKIT_HOME` 、 `/usr/local/Ascend/ascend-toolkit/latest` 、 `/usr/local/Ascend/cann`.
