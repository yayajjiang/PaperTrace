---
title: "01 · FlashMLA 文档对照译稿"
category: "开源仓库"
tags: ["DeepSeek", "对照译稿", "开源仓库"]
published: true
excerpt: "FlashMLA 的 README 与四篇官方 deep-dive 的逐段中英对照, 覆盖 MLA 解码为何计算受限、seesaw 调度、FP8 / FP4 KV 格式、DSA 稀疏 kernel 与昇腾实现."
---

# FlashMLA 文档对照译稿

本稿对照 FlashMLA 仓库的 `README.md` 与 `docs/` 下的设计文档. 英文段落在前, 中文意译紧跟其后; 代码块、表格、命令、公式不译. 源码引用写 GitHub 链接. 覆盖文件: `README.md`, `docs/20250422-new-kernel-deep-dive.md`, `docs/20250929-hopper-fp8-sparse-deep-dive.md`, `docs/20260930-ascend-prefill-deep-dive.md` (另有同名 `-zh.md` 为该文的官方中文版, 内容对应, 不再重复对照).

## README.md

> Breaking change notice (2026.09.30): In the 2026.09.30 release, we removed support for the Hopper architecture and for earlier models (including DeepSeek V3 / V3.2 / V4.0), and we changed the FP8 / FP4 KV cache format. This version is therefore not compatible with previous ones. If you need to run those models or use the old KV cache format, please switch to this commit.

> 重大变更提示 (2026.09.30): 在 2026.09.30 这个版本里, 我们移除了对 Hopper 架构以及更早模型 (含 DeepSeek V3 / V3.2 / V4.0) 的支持, 并改动了 FP8 / FP4 KV 缓存格式. 因此这个版本与之前不兼容. 若要运行那些模型或使用旧的 KV 缓存格式, 请切换到 [这个 commit](https://github.com/deepseek-ai/FlashMLA/tree/ba89a3466e9470ad08ab39738d4e7bb66989e1e7).

### Introduction · 介绍

FlashMLA is DeepSeek's library of optimized attention kernels, powering inference of the DeepSeek-V4.1 model on NVIDIA GPUs and Huawei Ascend NPUs. This repo contains token-level sparse attention kernels for prefill and for decoding with an FP8 / FP4 KV cache, a fused kernel that combines Q-norm, Q-RoPE, attention, O-RoPE (conjugate) and the cast to FP8, and dense attention kernels for prefill and backward. The sparse kernels power DeepSeek Sparse Attention (DSA).

FlashMLA 是 DeepSeek 的高性能注意力算子库, 支撑 DeepSeek-V4.1 模型在 NVIDIA GPU 与华为昇腾 NPU 上的推理. 仓库包含: 用于 prefill 的 token 级稀疏注意力 kernel, 用于 decoding 且配 FP8 / FP4 KV 缓存的稀疏 kernel, 一个把 Q-norm、Q-RoPE、核心注意力、O-RoPE (共轭) 与 cast-to-FP8 融在一起的 fused kernel, 以及 prefill 与反向的稠密注意力 kernel. 这些稀疏 kernel 支撑模型的 DeepSeek Sparse Attention (DSA).

> **想:** README 把库定位成「注意力算子库」, 但 MLA 的核心权重吸收 (W_UQ / W_UK / W_UV) 不在这里, 它到底算到哪一步?
> 答: 算子只做 softmax(QK^T)V 那一截. 从 `flash_mla_sparse_fwd` 的签名看 (`q: [s_q, h_q, d_qk]`, `kv: [s_kv, h_kv, d_qk]`, `d_qk` 必须 512), 它收到的已经是吸收后的 latent 形状, 前后的 Q_a / Q_b / Wv / Wo 投影由模型侧完成. 见 [flash_mla/flash_mla_interface.py](https://github.com/deepseek-ai/FlashMLA/blob/main/flash_mla/flash_mla_interface.py) 的 `flash_mla_sparse_fwd` docstring.

### News · 动态

- **30 Release of Ascend Attention Kernels**: We've released sparse attention prefill and decoding kernels for the Huawei Ascend 950 NPU, which achieve up to 410 TFlops (95% hardware peak) and 360 TFlops (83% of hardware peak) during prefill and decoding, respectively. We've also released a deep-dive technical report on the algorithms and optimization techniques behind these kernels.

  2026.09.30 发布昇腾注意力 kernel: 面向华为昇腾 950 NPU 发布了稀疏注意力的 prefill 与 decoding kernel, prefill 最高 410 TFlops (硬件峰值的 95%), decoding 最高 360 TFlops (硬件峰值的 83%). 同时发布了一篇讲这些 kernel 背后算法与优化技术的 deep-dive 报告.

  We also optimize the performance of the fused norm-RoPE-attn-RoPE-cast kernel under decoding settings by around 10% - 15%.

  还把 fused norm-RoPE-attn-RoPE-cast kernel 在 decoding 设置下的性能优化了约 10% - 15%.

  Note that this release removes support for the Hopper architecture and for earlier models (including DeepSeek V3 / V3.2 / V4.0), and changes the FP8 / FP4 KV cache format, so it is not compatible with previous versions.

  注意这个版本移除了对 Hopper 架构与前代模型 (含 DeepSeek V3 / V3.2 / V4.0) 的支持, 并改了 FP8 / FP4 KV 缓存格式, 因此与旧版本不兼容.

- **10 Release of DeepSeek v4.1's Attention Kernels**: We've released attention kernels for DeepSeek-V4.1, including both prefill and decoding (with FP8 or FP4 KV cache). We've also released a fused-norm-rope-attn-rope-cast kernel which fuses Q-norm (only used in V4, not V4.1), Q-RoPE, core attention, O-RoPE (conjugate), and cast-to-fp8, while retaining the same performance.

  2026.09.10 发布 DeepSeek v4.1 的注意力 kernel: 发布了 DeepSeek-V4.1 的注意力 kernel, 含 prefill 与 decoding (配 FP8 或 FP4 KV 缓存). 还发布了一个 fused-norm-rope-attn-rope-cast kernel, 它把 Q-norm (只在 V4 用, V4.1 不用)、Q-RoPE、核心注意力、O-RoPE (共轭) 与 cast-to-fp8 融在一起, 同时保持相同性能.

- **29 Release of Sparse Attention Kernels**: With the launch of DeepSeek-V3.2, we are releasing the corresponding token-level sparse attention kernels. These kernels power the model's DeepSeek Sparse Attention (DSA) and achieve up to 640 TFlops during prefilling and 410 TFlops during decoding. We also release a deep-dive blog for our new FP8 sparse decoding kernel.

  2025.09.29 发布稀疏注意力 kernel: 随 DeepSeek-V3.2 发布, 放出对应的 token 级稀疏注意力 kernel. 它们支撑模型的 DeepSeek Sparse Attention (DSA), prefill 最高 640 TFlops, decoding 最高 410 TFlops. 同时为新的 FP8 稀疏 decoding kernel 发布了一篇 deep-dive.

- **01 Kernels for MHA on SM100**: Thanks to NVIDIA's PR for MHA forward / backward kernels on SM100!

  2025.08.01 SM100 上的 MHA kernel: 感谢 NVIDIA 贡献 SM100 上 MHA 前向 / 反向 kernel 的 PR.

- **22 Deep-Dive Blog**: We'd love to share the technical details behind the new FlashMLA kernel! Check out our deep-dive write-up here.

  2025.04.22 Deep-Dive 博客: 分享新 FlashMLA kernel 背后的技术细节.

- **22 Performance Update**: We're excited to announce the new release of Flash MLA, which delivers 5% ~ 15% performance improvement for compute-bound workloads, achieving up to 660 TFlops on NVIDIA H800 SXM5 GPUs. The interface of the new version is fully compatible with the old one.

  2025.04.22 性能更新: 新版 Flash MLA 在计算受限工作负载上带来 5% ~ 15% 的性能提升, 在 NVIDIA H800 SXM5 GPU 上最高达 660 TFlops. 新版接口与旧版完全兼容.

### Performance · 性能

#### Test & benchmark the fused norm RoPE attn RoPE cast kernel (Sparse)

```bash
python tests/test-fused-norm-rope-attn-rope-cast.py
```

TileLang, Tile-Kernels, and DeepGEMM are required to run this test script.

运行该测试脚本需要 TileLang、Tile-Kernels 与 DeepGEMM.

This kernel fuses Q-norm (only used in V4, not V4.1), Q-RoPE, core attention, O-RoPE (conjugate) and the cast to FP8 into a single kernel, which saves the overhead of those small kernels. Although it fuses many small operations, it still achieves the same or even slightly higher TFlops, at the cost of having to permute the Q_b and Wv weights in advance. It achieves up to 1460 TFlops during prefill and 950 TFlops during decoding on B200 with CUDA 13.3.

该 kernel 把 Q-norm (只在 V4 用, V4.1 不用)、Q-RoPE、核心注意力、O-RoPE (共轭) 与 cast-to-FP8 融进一个 kernel, 省掉这些小 kernel 的开销. 尽管融了很多小算子, 它仍能达到相同甚至略高的 TFlops, 代价是必须事先对 Q_b 与 Wv 权重做置换. 在 B200 + CUDA 13.3 上, prefill 最高 1460 TFlops, decoding 最高 950 TFlops.

This kernel currently supports CUDA only; Ascend is not supported.

该 kernel 目前只支持 CUDA, 不支持昇腾.

#### Test & benchmark MLA prefill (Sparse)

```bash
python tests/test-sparse-prefill.py
```

It achieves up to 1350 TFlops on B200 with CUDA 13.3. In practice, we highly recommend using the fused-norm-rope-attn-rope-cast kernel for better performance.

在 B200 + CUDA 13.3 上最高 1350 TFlops. 实践中强烈建议用 fused-norm-rope-attn-rope-cast kernel 以获得更好性能.

On the Huawei Ascend 950 NPU, it achieves up to 410 TFlops, which is 95% of the theoretical hardware peak.

在华为昇腾 950 NPU 上最高 410 TFlops, 为理论硬件峰值的 95%.

#### Test & benchmark MLA decoding (Sparse)

```bash
python tests/test-sparse-decode.py
```

It achieves up to 1024 TFlops on B200 with CUDA 13.3. On the Huawei Ascend 950 NPU, it achieves up to 360 TFlops, which is 83% of the theoretical hardware peak.

在 B200 + CUDA 13.3 上最高 1024 TFlops. 在华为昇腾 950 NPU 上最高 360 TFlops, 为理论硬件峰值的 83%.

#### Test & benchmark MHA prefill (Dense)

```bash
python tests/test_fmha_sm100.py
```

It achieves up to 1460 TFlops in forward and 1000 TFlops in backward computation on B200, as reported by NVIDIA. This kernel currently supports CUDA only; Ascend is not supported.

据 NVIDIA 报告, 在 B200 上前向最高 1460 TFlops, 反向最高 1000 TFlops. 该 kernel 目前只支持 CUDA, 不支持昇腾.

> **看表:** 同一张 B200 上, fused kernel 的 prefill (1460) 比纯 sparse prefill (1350) 高, decoding (950) 却远低于 sparse decode 单测的 1024, 怎么理解?
> 答: 两个数不是同一口径. sparse decode 单测 1024 是只算核心注意力; fused decode 950 是把 Q-norm、RoPE、cast 一起算进去的端到端数. README 明说 fused kernel 把小算子的时间省掉后仍保持「相同甚至略高」的 TFlops, 但 decoding 的绝对值受这些融合项分母影响. 口径差异见 [README.md](https://github.com/deepseek-ai/FlashMLA/blob/main/README.md) 的 Performance 小节.

### Requirements · 环境要求

For the NVIDIA platform:

NVIDIA 平台:

- NVIDIA SM100 / SM103 GPU
- CUDA 13.1 and above (CUDA 13.2 and above is recommended, since it provides the native `cvt.rn.bf16x2` conversions that the quantized decoding kernels use; on CUDA 13.1 they fall back to a slower widening through FP32)
- PyTorch 2.0 and above

- NVIDIA SM100 / SM103 GPU.
- CUDA 13.1 及以上 (推荐 13.2 及以上: 它提供量化 decoding kernel 用到的原生 `cvt.rn.bf16x2` 转换; 在 13.1 上会退回到经 FP32 的较慢加宽路径).
- PyTorch 2.0 及以上.

For the Huawei platform:

华为平台:

- Huawei Ascend 950 NPU
- CANN 9.2.0 and above (provides the `bisheng` compiler and the Ascend C headers used at build time)
- `torch_npu`
- PyTorch 2.0 and above

- 华为昇腾 950 NPU.
- CANN 9.2.0 及以上 (提供构建期用到的 `bisheng` 编译器与 Ascend C 头文件).
- `torch_npu`.
- PyTorch 2.0 及以上.

### Installation · 安装

```bash
git clone https://github.com/deepseek-ai/FlashMLA.git flash-mla
cd flash-mla
git submodule update --init --recursive
pip install -v . --no-build-isolation
```

`--no-build-isolation` is required: `setup.py` imports `torch` (and `torch_npu` on the Ascend platform) while building, and this repository does not declare them as PEP 518 build requirements.

必须加 `--no-build-isolation`: `setup.py` 在构建时会 import `torch` (昇腾平台还会 import `torch_npu`), 而本仓库没有把它们声明为 PEP 518 构建依赖.

The build target platform is detected automatically (`/dev/davinci_manager` means Ascend, anything else means CUDA) and can be overridden with `FLASH_MLA_BUILD_TARGET_PLATFORM=CUDA` or `FLASH_MLA_BUILD_TARGET_PLATFORM=ASCEND`.

构建目标平台自动检测 (有 `/dev/davinci_manager` 判为昇腾, 否则判为 CUDA), 可用 `FLASH_MLA_BUILD_TARGET_PLATFORM=CUDA` 或 `=ASCEND` 覆盖.

After the CUDA extension is built, a register-spill check runs over the produced `.so`. The CUTLASS FMHA kernels are exempt, but if any kernel defined by this repository spills registers the build fails with "Register spilling detected. Build failed!"; export `FLASH_MLA_SKIP_REG_SPILL_CHECK=1` to skip the check.

CUDA 扩展编译完后, 会对产出的 `.so` 做一次寄存器溢出检查. CUTLASS FMHA kernel 豁免, 但只要本仓库定义的任何 kernel 溢出寄存器, 构建就以「Register spilling detected. Build failed!」失败; 设 `FLASH_MLA_SKIP_REG_SPILL_CHECK=1` 可跳过该检查.

### Usage · 用法

#### DeepSeek Sparse Attention (DSA) Decoding · DSA 解码

To use the DSA decoding kernels, call get_mla_metadata once before the decoding loop to get the tile scheduler metadata. Then, call flash_mla_with_kvcache in each decoding step.

要用 DSA 解码 kernel, 在解码循环前调用一次 get_mla_metadata 拿到 tile scheduler 元数据, 之后每个解码步调用 flash_mla_with_kvcache.

```python
from flash_mla import get_mla_metadata, flash_mla_with_kvcache

tile_scheduler_metadata, num_splits = get_mla_metadata()    # A placeholder only. The actual scheduling metadata is generated on the first call to flash_mla_with_kvcache

for i in range(num_layers):
    ...
    o_i, lse_i = flash_mla_with_kvcache(
        q_i, kvcache_i, block_table, cache_seqlens, dv,
        tile_scheduler_metadata, num_splits,
        indices=indices,
    )
    ...
```

Where `s_q` is the number of q tokens per q sequence (1 if MTP / speculative decoding is disabled), `h_kv` is the number of key-value heads, and `h_q` is the number of query heads.

其中 `s_q` 是每条 q 序列的 q token 数 (关闭 MTP / 投机解码时为 1), `h_kv` 是 key-value 头数, `h_q` 是 query 头数.

> **拆开:** 这里 `get_mla_metadata()` 不带任何参数, 和旧接口差别很大, 元数据到底什么时候算出来?
> 答: 新接口里 `get_mla_metadata` 只返回一个空的 `FlashMLASchedMeta` 占位对象, 真正的 split-KV 调度元数据在第一次调用 `flash_mla_with_kvcache` 时, 由 C++ 侧 `sparse_decode_fwd` 生成并写回 `sched_meta.tile_scheduler_metadata`. 旧接口则要在循环前传入 `cache_seqlens` 当场算好. 见 [flash_mla_interface.py](https://github.com/deepseek-ai/FlashMLA/blob/main/flash_mla/flash_mla_interface.py) 的 `get_mla_metadata` 与 `flash_mla_with_kvcache`.

**FP8 / FP4 KV Cache Format · FP8 / FP4 KV 缓存格式:** For decoding, this kernel currently supports only the FP8 and FP4 KV cache formats. Unquantized (bfloat16) KV cache format is not supported.

解码阶段, 该 kernel 目前只支持 FP8 与 FP4 KV 缓存格式, 不支持未量化 (bfloat16) 的 KV 缓存.

For DeepSeek V4.1 (`head_dim` = 512), the format is detected from the last dimension of `k_cache` (i.e. the bytes per token): 528 (V4.1) or 288 (V4.1 fp4). In both formats, each **token** stores its quantized raw data first, followed immediately by its scales:

对 DeepSeek V4.1 (`head_dim` = 512), 格式由 `k_cache` 的末维 (即每 token 的字节数) 判定: 528 (V4.1) 或 288 (V4.1 fp4). 两种格式里, 每个 **token** 先存量化后的原始数据, 紧跟其 scale:

- **V4.1 (528 bytes per token):** the first 512 bytes are `float8_e4m3` values covering all 512 dimensions. The 64 RoPE dimensions are quantized as well, so there is no `bfloat16` part. The last 16 bytes are `float8_e8m0` scales, one for every 32 consecutive `float8_e4m3` values.
- **V4.1 fp4 (288 bytes per token):** the first 256 bytes contain 512 `e2m1` values, 2 values per byte, the even-indexed one in the low nibble. The last 32 bytes are `float8_e4m3` scales, one for every 16 consecutive `e2m1` values. This format is only valid for `extra_k_cache` when `k_cache` is in the V4.1 format.

- V4.1 (每 token 528 字节): 前 512 字节是覆盖全部 512 维的 `float8_e4m3` 值, 64 个 RoPE 维也被量化, 所以没有 `bfloat16` 部分. 末 16 字节是 `float8_e8m0` scale, 每 32 个连续 `float8_e4m3` 共用一个.
- V4.1 fp4 (每 token 288 字节): 前 256 字节装 512 个 `e2m1` 值, 每字节 2 个, 偶数下标在低半字节. 末 32 字节是 `float8_e4m3` scale, 每 16 个连续 `e2m1` 共用一个. 这个格式只在 `k_cache` 为 V4.1 格式时用于 `extra_k_cache`.

See `tests/quant.py` for quantization and dequantization details.

量化与反量化细节见 [tests/quant.py](https://github.com/deepseek-ai/FlashMLA/blob/main/tests/quant.py).

**`indices` Tensor · `indices` 张量:** The `indices` tensor enables token-level sparse attention by instructing the kernel to compute attention only for specified tokens.

`indices` 张量开启 token 级稀疏注意力, 让 kernel 只对指定 token 算注意力.

- **Shape:** `indices` should be a 3D tensor of shape `(batch_size, seq_len_q, topk)`.
- **Format:** `indices_in_kvcache[i][j][k] = (the index of the page block where token t resides) * page_block_size + (the offset of token t within the page block)`, where `t` is the k-th token for the j-th query sequence in the i-th batch. Since the index of the page block has already been encoded into `indices_in_kvcache`, the kernel does not use the `block_table` parameter; you still have to pass it, since it is a required positional argument (`None` is fine).
- **Invalid entries:** Set invalid indices to `-1`.

- 形状: `indices` 是 `(batch_size, seq_len_q, topk)` 的三维张量.
- 格式: `indices_in_kvcache[i][j][k] = (token t 所在 page block 的下标) * page_block_size + (token t 在该 block 内的偏移)`, 其中 `t` 是第 i 个 batch、第 j 条 query 序列的第 k 个 token. 因为 page block 下标已编进 `indices_in_kvcache`, kernel 不再用 `block_table` 参数; 但仍须传入它, 因为它是必填位置参数 (传 `None` 即可).
- 无效项: 无效下标置为 `-1`.

**Return Values · 返回值:** The kernel returns `(out, lse)`, where `out` is the attention result `[batch_size, seq_len_q, h_q, head_dim_v]`, bfloat16; `lse` is the log-sum-exp of the attention scores for each query head, `[batch_size, h_q, seq_len_q]`, float32. Its shape is transposed with respect to `out`.

kernel 返回 `(out, lse)`: `out` 是注意力结果 `[batch_size, seq_len_q, h_q, head_dim_v]`, bfloat16; `lse` 是每个 query 头的注意力分数 log-sum-exp, `[batch_size, h_q, seq_len_q]`, float32, 其形状相对 `out` 做了转置.

#### DeepSeek Sparse Attention (DSA) Prefill · DSA 预填充

For the DSA prefill kernel, call `flash_mla_sparse_fwd` directly with the following parameters:

DSA prefill kernel 直接调用 `flash_mla_sparse_fwd`, 参数如下:

- `q`: Query tensor of shape `[s_q, h_q, d_qk]`
- `kv`: Key-Value tensor of shape `[s_kv, h_kv, d_qk]`
- `indices`: Indices tensor of shape `[s_q, h_kv, topk]`
- `sm_scale`: A scalar value
- `d_v`: Optional, the dimension of the value vectors. Can only be 512, which is also the default.
- `attn_sink`: Optional, `[h_q]`, float32. If provided, the output is additionally scaled by `exp(lse) / (exp(lse) + exp(attn_sink))`.
- `topk_length`: Optional, `[s_q]`, int32. If provided, the i-th query token only attends to the first `topk_length[i]` indices.

- `q`: 形状 `[s_q, h_q, d_qk]` 的 query 张量.
- `kv`: 形状 `[s_kv, h_kv, d_qk]` 的 key-value …3812 tokens truncated…错两个 warpgroup, 它让 CUDA Core 与 Tensor Core 运算重叠; 又因为数据一旦不再需要就能立刻发对应的 TMA 指令, 它也让访存与计算重叠.

The complete schedule is shown below (remember that in MLA, $K$ and $V$ are the same with different names).

完整调度如下图 (记住在 MLA 里 $K$ 与 $V$ 是同一份数据, 只是名字不同). 原图见 [docs/assets/MLA Kernel Sched.drawio.svg](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/assets/MLA%20Kernel%20Sched.drawio.svg).

#### Discussion of Technical Details · 实现细节讨论

First, although the kernel targets compute-bound scenarios, we can't ignore memory latency. If the data is not ready when we want to use it, we have to wait. To solve this problem, we employ the following techniques:

先, 尽管 kernel 面向计算受限场景, 也不能忽视访存延迟. 要用的数据没就绪就得等. 为此用了以下技术:

- **Fine-grained TMA copy - GEMM pipelining:** For a $64 \times 576$ K block, we launch 9 TMA copies (each moving a $64 \times 64$ block). GEMM operations begin as soon as each TMA copy completes, improving memory latency tolerance.
- **Cache hints:** Using `cute::TMA::CacheHintSm90::EVICT_FIRST` for TMA copies improves L2 cache hit rates, as shown by experiments.

- 细粒度 TMA 拷贝与 GEMM 流水: 对 $64 \times 576$ 的 K 块, 发 9 次 TMA 拷贝 (每次搬 $64 \times 64$). 每次 TMA 拷贝一完成就开始对应的 GEMM, 提升对访存延迟的容忍度.
- 缓存提示: TMA 拷贝用 `cute::TMA::CacheHintSm90::EVICT_FIRST`, 实验表明能提升 L2 命中率.

These optimizations achieve up to 80% Tensor Core utilization (of the throttled theoretical peak) and 3 TB/s memory bandwidth on an H800 SXM5 GPU. While slightly slower (~2%) than the old ping-pong buffer version in memory-bound settings, this is acceptable.

这些优化在 H800 SXM5 上拿到最高 80% 的 Tensor Core 利用率 (相对降频后的理论峰值) 与 3 TB/s 带宽. 在访存受限场景比旧的 ping-pong 缓冲版慢约 2%, 可以接受.

Other performance improvements include programmatic dependent launch (to overlap `splitkv_mla` and `combine` kernels) and a tile scheduler (to allocate requests and blocks to SMs for balanced load).

其他性能改进包括: programmatic dependent launch (重叠 `splitkv_mla` 与 `combine` kernel), 以及一个 tile scheduler (把请求与块分配到各 SM, 均衡负载).

## docs/20250929-hopper-fp8-sparse-deep-dive.md

### A Deep Dive Into The Flash MLA FP8 Decoding Kernel on Hopper · Hopper 上 FP8 解码 kernel 深入剖析

With the release of DeepSeek-V3.2, we have doubled the context length of our models from 64K tokens to 128K tokens. This puts significant pressure on GPU memory (a single request with 128K tokens requires a KVCache of size $576 \times 2 \times 62 \times 128 \times 1024 = 8.72\ \mathrm{GiB}$), which can lead to OOM errors or under-utilized GPUs due to small batch sizes. To address this, we introduced FP8 KVCache for DeepSeek-V3.2.

随 DeepSeek-V3.2 发布, 我们把模型上下文从 64K 翻倍到 128K. 这给显存很大压力 (单个 128K token 的请求需要 $576 \times 2 \times 62 \times 128 \times 1024 = 8.72\ \mathrm{GiB}$ 的 KVCache), 会导致 OOM 或因 batch 太小而 GPU 利用率低. 为此我们为 DeepSeek-V3.2 引入了 FP8 KVCache.

#### The FP8 KVCache Format · FP8 KVCache 格式

Recall that the decoding phase of the MLA algorithm operates similarly to MQA, with 128 query heads and 1 key head, where `head_dim_k = 576` and `head_dim_v = 512`. To reduce the size of the KVCache while maintaining accuracy, we use a fine-grained quantization method. Specifically, we apply tile-level quantization (with a tile size of $1 \times 128$) to the first 512 elements in each token's KV Cache. This results in 512 `float8_e4m3` values and 4 `float32` scale factors. For the remaining 64 elements (the RoPE part), we do not apply quantization as they are sensitive to precision loss. Therefore, in GPU memory, each token's KVCache occupies 656 bytes, consisting of 512 `float8_e4m3`s, 4 `float32`s, and 64 `bfloat16`s.

回忆一下, MLA 的解码阶段行为类似 MQA: 128 个 query 头、1 个 key 头, `head_dim_k = 576`、`head_dim_v = 512`. 为在保精度的同时缩小 KVCache, 用细粒度量化: 对每个 token KV Cache 的前 512 个元素做 tile 级量化 (tile 大小 $1 \times 128$), 得到 512 个 `float8_e4m3` 值与 4 个 `float32` scale. 剩下 64 个元素 (RoPE 部分) 对精度敏感, 不量化. 因此显存中每 token 的 KVCache 占 656 字节: 512 个 `float8_e4m3`、4 个 `float32`、64 个 `bfloat16`.

Inside the kernel, we first dequantize the 512 `float8_e4m3` values into 512 `bfloat16`s. We then concatenate them with the 64 original `bfloat16` values from the RoPE part. Finally, we perform the MQA calculation using MMA operations in `bfloat16` precision.

kernel 内先把 512 个 `float8_e4m3` 反量化成 512 个 `bfloat16`, 再与 RoPE 部分原始的 64 个 `bfloat16` 拼接, 最终用 `bfloat16` 精度的 MMA 做 MQA 计算 (QK gemm 与 attention-score-V gemm 的输入都是 bfloat16, 输出 float32).

> **再看:** 2025.09 的 Hopper FP8 格式是每 token 656 字节, 2026.09 的 V4.1 格式却是 528 字节, 差别在哪?
> 答: 656 字节版只量化前 512 维 (NoPE), scale 用 4 个 float32 (16 字节), RoPE 的 64 维留 bfloat16 (128 字节), 合计 512+16+128=656. V4.1 的 528 字节版把全部 512 维 (含 RoPE) 都量化成 float8_e4m3, scale 改成 16 个 float8_e8m0 (每 32 个值一个), 合计 512+16=528, 不再有 bfloat16 部分. 两者口径见 [README.md](https://github.com/deepseek-ai/FlashMLA/blob/main/README.md) 与 [tests/quant.py](https://github.com/deepseek-ai/FlashMLA/blob/main/tests/quant.py).

#### Theoretical Analysis of Clock Cycles · 时钟周期的理论分析

The main challenge is that Tensor Cores are extremely fast, while the dequantization process, performed on CUDA Cores, struggles to keep up.

主要挑战是: Tensor Core 极快, 而在 CUDA Core 上做的反量化跟不上.

Each SM can process 4096 MMA Flops per clock cycle (calculated as `989 TFlops / 1830 MHz / 132 SMs` on H800). In our kernel, each CTA runs on one SM. If we assign each CTA to process 64 query heads, it only requires $64 \times (576+512) \times 2 / 4096 \approx 34$ cycles for MMA operations per K/V token.

每个 SM 每周期能处理 4096 次 MMA Flops (H800 上按 `989 TFlops / 1830 MHz / 132 SMs` 算). 本 kernel 中每个 CTA 跑在一个 SM 上. 若每个 CTA 处理 64 个 query 头, 每个 K/V token 的 MMA 只需约 $64 \times (576+512) \times 2 / 4096 \approx 34$ 周期.

However, because the H800 cannot directly cast `float8_e4m3` to `bfloat16`, dequantizing one token needs: convert `float8_e4m3` to `half`, `half` to `float32`, `float32` to `bfloat16`, then multiply by the `float32` scale. According to NVIDIA's documentation, we need at least $(\frac{1}{64} + \frac{1}{64} + \frac{1}{16} + \frac{1}{256}) \times 512 \approx 50$ cycles for dequantizing each token! This is more than the 34 cycles for MMA, meaning the kernel is **dequantization-bound**.

但 H800 不能直接把 `float8_e4m3` 转 `bfloat16`, 反量化一个 token 要: `float8_e4m3` 转 `half`、`half` 转 `float32`、`float32` 转 `bfloat16`, 再乘 `float32` scale. 按 NVIDIA 文档, 每 token 反量化至少要约 $(\frac{1}{64} + \frac{1}{64} + \frac{1}{16} + \frac{1}{256}) \times 512 \approx 50$ 周期. 这超过 MMA 的 34 周期, 所以 kernel 受反量化限制.

#### Crossover · 交叉

Before we continue, it's important to note a key fact: every query head within the same query token attends to the same key heads, because this is MQA.

继续前先记一个关键事实: 同一个 query token 内的每个 query 头都看同一批 key 头, 因为这是 MQA.

Recall that each CTA processes 64 query heads, while DeepSeek-V3.2 has 128 query heads. If we can "share" the dequantized K/V values between two CTAs that are processing different sets of query heads, then each CTA would only need to dequantize **half** of the KV cache. We call this method "crossover".

每个 CTA 处理 64 个 query 头, 而 DeepSeek-V3.2 有 128 个 query 头. 若能让处理不同 query 头子集的两个 CTA「共享」反量化后的 K/V, 每个 CTA 就只需反量化一半 KV cache. 我们把这个方法叫 crossover (交叉).

#### Distributed Shared Memory to the Rescue · 分布式共享内存解围

Distributed Shared Memory (DSM) is a feature introduced with Hopper, alongside the CTA Cluster. CTAs within the same cluster can directly access each other's shared memory.

分布式共享内存 (DSM) 是 Hopper 随 CTA Cluster 一起引入的特性, 同一 cluster 内的 CTA 可直接访问彼此的共享内存.

We launch CTAs in clusters of size 2. Each CTA is responsible for 64 query heads from the same query token. Each CTA loads *half* of the quantized K/V, dequantizes its assigned half on CUDA Cores, stores the result into its own shared memory, and simultaneously uses `st.async` to write the dequantized K/V into the other CTA's shared memory. Synchronization relies on the cluster transaction barrier. After the exchange, each CTA has the *full* set of dequantized K and V in its own shared memory.

我们以 cluster 大小 2 启动 CTA. 每个 CTA 负责同一 query token 的 64 个 query 头. 每个 CTA 加载一半量化 K/V, 在 CUDA Core 上反量化自己那一半, 存进自己的共享内存, 同时用 `st.async` 把反量化结果写进另一个 CTA 的共享内存. 同步靠 cluster transaction barrier. 交换完成后, 每个 CTA 的共享内存里都有完整的反量化 K 与 V.

#### Performance · 性能

Using these techniques, we achieved 410 TFLOPS in a compute-bound configuration (batch_size=128, num_heads=128, s_q=2, topk=2048) on H800 SXM5 GPUs. This is a significant improvement over the 250 TFLOPS achieved by our previous FP8 sparse decoding kernel without the crossover technique.

用这些技术, 在 H800 SXM5 的计算受限配置 (batch_size=128, num_heads=128, s_q=2, topk=2048) 下拿到 410 TFLOPS, 相比没有 crossover 的上一版 FP8 稀疏解码 kernel 的 250 TFLOPS 是明显提升.

Although this number is still below the 640 TFLOPS peak of our previous bfloat16 dense decoding kernel, one reason is that it's a **sparse** kernel, and its topk is only 2048. With a smaller topk, the relative overhead of the kernel's prologue and epilogue becomes larger. If we set topk to 32768, this kernel can achieve up to 460 TFLOPS. From another perspective, the execution time in the configuration above is comparable to the dense decoding kernel at a sequence length around 3000; beyond 3000, the new kernel's advantage grows.

虽然这个数仍低于上一版 bfloat16 稠密解码 kernel 的 640 TFLOPS 峰值, 一个原因是它是稀疏 kernel 且 topk 只有 2048. topk 越小, kernel 前导与收尾的相对开销越大. 若把 topk 设成 32768, 该 kernel 最高可达 460 TFLOPS. 换个角度: 上述配置下它的执行时间与序列长约 3000 时的稠密解码 kernel 相当; 超过 3000, 新 kernel 优势越来越大.

## docs/20260930-ascend-prefill-deep-dive.md

本文另有官方中文版 `docs/20260930-ascend-prefill-deep-dive-zh.md`, 两者内容对应, 下面以英文版为准做对照.

### A Deep Dive Into the Ascend Sparse Attention Forward Kernel · 昇腾稀疏注意力前向 kernel 深入剖析

On September 30, 2026, DeepSeek open-sourced its inference infrastructure and core components for the Huawei Ascend platform, including the Ascend sparse attention prefill and decoding kernels in this repository. Under typical workloads of the DeepSeek V4.1 model, this kernel reaches 410 TFlops during prefill and 360 TFlops during decoding, i.e. 95% and 83% of the hardware's theoretical peak, respectively.

2026 年 9 月 30 日, DeepSeek 开源了面向华为昇腾平台的推理基础设施与核心组件, 包括本仓库里的昇腾稀疏注意力 prefill 与 decoding kernel. 在 DeepSeek V4.1 的典型负载下, 该 kernel prefill 达 410 TFlops、decoding 达 360 TFlops, 分别为硬件理论峰值的 95% 与 83%.

#### Algorithm Recap · 算法回顾

This kernel computes the forward pass of the attention in the DSA architecture used by DeepSeek V4.1, covering both prefill and decoding. It takes a number of q tokens and kv tokens and, following the indices table, lets each q token attend to only the "most important" kv tokens, saving compute while preserving quality.

该 kernel 算 DeepSeek V4.1 所用 DSA 架构里注意力的前向, 覆盖 prefill 与 decoding. 它吃一批 q token 与 kv token, 按 indices 表让每个 q token 只看「最重要」的 kv token, 省算力又保质量.

Because softmax has a global dependency, we compute it with the same online softmax algorithm as Flash Attention, dynamically updating the per-row maximum of P, the per-row lse, and the output accumulator. The topk indices are split into blocks of size `B_TOPK` (usually 64 or 96). We maintain `running_max`, `running_max_for_softmax`, and `running_sumexp` (shape `[h_q]`) plus an `out_accum` (`[h_q, d_v]`), all float32.

因为 softmax 有全局依赖, 我们用和 Flash Attention 一样的在线 softmax, 动态更新 P 的逐行最大值、逐行 lse 与输出累加器. topk 下标按 `B_TOPK` (通常 64 或 96) 切块. 维护 `running_max`、`running_max_for_softmax`、`running_sumexp` (形状 `[h_q]`) 以及 `out_accum` (`[h_q, d_v]`), 全是 float32.

A key optimization is "skip scale": only when some row satisfies `running_max[i] - running_max_for_softmax[i] > RESCALE_THRES` (usually 6) do we rescale `out_accum` and `running_sumexp` and update `running_max_for_softmax`; otherwise the rescale is skipped.

一个关键优化是 skip scale: 只有当某行满足 `running_max[i] - running_max_for_softmax[i] > RESCALE_THRES` (通常 6) 时, 才对 `out_accum` 与 `running_sumexp` 做 rescale 并更新 `running_max_for_softmax`; 否则跳过这次 rescale.

> **对一下:** 昇腾版的 skip-scale 和 CUDA 版在线 softmax 每块都 rescale 有什么本质区别?
> 答: 标准在线 softmax 每遇到更大的 max 就把累加器乘 $\exp(\text{old}-\text{new})$. 昇腾上 scale-O 很贵 (要 FixPipe 把 O 从 L0C 搬到 UB、再用 VF 累加), 所以只在 max 漂移超过阈值 6 时才做一次, 平时攒着. 因为 $\exp(\text{running\_max}-\text{running\_max\_for\_softmax})$ 始终 $\le \exp(6)$, 精度可控. 见 [20260930-ascend-prefill-deep-dive.md](https://github.com/deepseek-ai/FlashMLA/blob/main/docs/20260930-ascend-prefill-deep-dive.md).

#### Discussion · 设计方向讨论

**How many q heads per AI Core?** By computing the compute-to-memory ratio (assuming 4096 FMA/cycle/AI Core and 5 TB/s total L2 bandwidth), the kernel is compute-bound only when head >= 64; at head=64 compute and memory are roughly balanced. Taking 128 heads would fill L0C with O ($128 \times 512$ float32 = 256KB), forcing the accumulator onto the VECTOR Core and a hard-to-write fine-grained pipeline. Micro-benchmarks also show MMAD with M=64 already saturates CUBE Core throughput.

每个 AI Core 处理多少 q 头? 算计算访存比 (设每 AI Core 每周期 4096 FMA、L2 总带宽 5 TB/s), 只有 head >= 64 时计算受限; head=64 时计算与访存大致平衡. 取 128 头会让 O ($128 \times 512$ float32 = 256KB) 填满 L0C, 逼得累加器放到 VECTOR Core 并写很难的细粒度流水. 微基准也显示 M=64 的 MMAD 已能打满 CUBE Core 吞吐.

**Where should the FA output accumulator live?** Data in L0C can only be moved out by the FixPipe or used as a CUBE accumulator, and cannot be scaled in place. Keeping the accumulator on the CUBE Core and pulling it up for every rescale costs too much CUBE throughput (and forces HF32 off, dropping to 256 FMA/cycle). So the accumulator lives on the VECTOR Core.

FA 输出累加器放哪? L0C 里的数据只能由 FixPipe 搬出或当 CUBE 累加器用, 不能就地缩放. 把累加器留在 CUBE Core、每次 rescale 都拉上来, 太费 CUBE 吞吐 (还得关 HF32, 掉到 256 FMA/周期). 所以累加器放 VECTOR Core.

**Can we use 1C1V?** No. Three bounds force 1C2V (one CUBE Core paired with two VECTOR Cores): the MTE2 issue queue holds at most 16 outstanding copies (even with gather2 only 32 tokens in flight); dequantization can't keep up with 1C1V; and the FixPipe (128 Byte/cycle/AI Core) would need `B_TOPK > 73.14` to avoid becoming the bottleneck, pushing `B_TOPK` to 96 or 128 and worsening UB/MTE2 pressure.

能用 1C1V 吗? 不能. 三条瓶颈逼着上 1C2V (一个 CUBE Core 配两个 VECTOR Core): MTE2 发射队列最多 16 个未完成拷贝 (即便用 gather2 也只有 32 token 在途); 1C1V 下反量化跟不上 CUBE Core; FixPipe (128 Byte/周期/AI Core) 要 `B_TOPK > 73.14` 才不成瓶颈, 把 `B_TOPK` 推到 96 或 128 又加重 UB/MTE2 压力.

**When should the ND2NZ layout conversion of KV happen?** KV is stored in ND format but the CUBE Core needs NZ. Sparse per-token MTE2 copies prevent on-the-fly ND2NZ. Experiments show the BIU coalesces accesses only when both source and destination are contiguous, so the only option is to copy KV to UB, convert ND->NZ with a SIMD VF, then copy to L1.

KV 的 ND2NZ 布局转换何时做? KV 以 ND 格式存, 但 CUBE Core 要 NZ. 逐 token 的稀疏 MTE2 拷贝使得没法在搬运时顺带 ND2NZ. 实验显示 BIU 只在源与目的都连续时才合并访存, 所以只能先把 KV 搬到 UB, 用 SIMD VF 做 ND->NZ, 再拷到 L1.

#### Pipeline Schedule & Optimizations · 流水调度与优化

The final direction is: 64 heads/AI Core, 1C2V, accumulator in UB, KV routed through UB and a SIMD VF for ND2NZ. The CUBE Core defers each block's `O += S @ V` to leave ~1024 cycles for FixPipe, softmax, and the UB->L1 copy of S. The VECTOR Core interleaves index reads, ND2NZ, softmax, O-scale, skip-scale signalling (via an SS buffer and cross-core flags), and MTE2 copies across blocks `i` through `i+5`.

最终方向: 每 AI Core 64 头、1C2V、累加器在 UB、KV 经 UB 与 SIMD VF 做 ND2NZ. CUBE Core 把每块的 `O += S @ V` 延后, 留约 1024 周期给 FixPipe、softmax 与 S 的 UB->L1 拷贝. VECTOR Core 在块 `i` 到 `i+5` 之间交错做 index 读取、ND2NZ、softmax、O-scale、skip-scale 信号传递 (经 SS buffer 与跨核 flag) 与 MTE2 拷贝.

Key optimization techniques include: **gather2** (one MTE2 request with `burst_count=2` copies two KV tokens, cutting request count below the issue-queue depth of 16); a **decoding KV cache layout** that places each token's data and scale adjacently (the old FlashMLA stored all data then all scales, needing two copies per token); **fast ND2NZ** (using `asc_loadalign`/`vsstb`, padding one NZ row to avoid UB bank conflicts, auto-increment pointers); controlling code size for the small **icache** (32K/16K/8K); **L1 bank balancing** (splitting each tensor across the two 256K banks); and **skip-scale** (cutting FixPipe/UB/VF work and power).

关键优化包括: gather2 (一次 `burst_count=2` 的 MTE2 请求拷两个 KV token, 把请求数压到发射队列深度 16 以下); 解码 KV cache 布局 (把每 token 的数据与 scale 相邻存放; 旧 FlashMLA 先存全部数据再存全部 scale, 每 token 要两次拷贝); 快速 ND2NZ (用 `asc_loadalign`/`vsstb`, NZ 输出多填一行避免 UB bank 冲突, 指针自增); 控制代码体积以适配小 icache (32K/16K/8K); L1 bank 均衡 (把每个张量切到两个 256K bank); 以及 skip-scale (减少 FixPipe/UB/VF 的工作与功耗).
