---
title: "01 · DeepEP 文档对照译稿"
category: "开源仓库"
tags: ["DeepSeek", "对照译稿", "开源仓库"]
published: true
excerpt: "DeepEP 仓库 README 与 docs/ 下两份设计文档的逐段中英对照: V2.5 的 EPBuffer 接口, 环境变量与网络配置, V1 的 normal 与 low-latency kernel 性能表, 以及 NVSHMEM 安装指南."
---
# DeepEP 文档对照译稿

本稿对照三份文件: 仓库根目录的 `README.md` (V2.5, 对应提交 `93eb6eb`, 2026-09-30), 以及 V2 时期保留的 `docs/legacy.md` 与 `docs/nvshmem.md` (对应提交 `a56d615`, 2026-09-16). 后两份文档在 V2.5 里随 V1 一并删除, 但 V1 的 normal 与 low-latency kernel 设计只有这里有完整描述. 代码块, 表格, 命令与 bibtex 不译. 原文里指向仓库内文件的相对链接, 这里统一改成 GitHub 上的绝对链接.

## README.md

DeepEP (DeepEveryParallel) is a high-performance communication library for machine learning training and inference. It provides high-throughput and low-latency expert-parallel (EP) all-to-all GPU kernels for MoE dispatch and combine, including FP8 dispatch, and NVLink weight and gradient exchange for redundant experts. It also offers experimental primitives for pipeline parallelism (PP), context parallelism (CP), data parallelism (DP), and remote memory access (Engram). Communication kernels are compiled at runtime via [DeepJIT](https://github.com/deepseek-ai/DeepJIT), with the supporting extension built during installation.

DeepEP (DeepEveryParallel) 是面向机器学习训练与推理的高性能通信库. 它提供高吞吐与低延迟的专家并行 (EP) all-to-all GPU kernel, 用于 MoE 的 dispatch 与 combine, 包括 FP8 dispatch, 以及冗余专家在 NVLink 上的权重与梯度交换. 它还提供几种实验性原语: 流水并行 (PP), 上下文并行 (CP), 数据并行 (DP) 与远程内存访问 (Engram). 通信 kernel 由 [DeepJIT](https://github.com/deepseek-ai/DeepJIT) 在运行时编译, 配套的扩展在安装时构建.

### News

- **Ascend version release**
  - Same API and full performance on HUAWEI Ascend 950 NPUs
  - Check [DeepEP-Ascend](https://github.com/deepseek-ai/DeepEP-Ascend) for more details

- **V2.5 release**:
  - Split `ElasticBuffer` into `EPBuffer`, `EngramBuffer`, `PPBuffer`, and `BucketBuffer`, sharing the `BufferBase` lifecycle
  - Add `BufferAllocator` for planning symmetric tensor allocations before buffer construction
  - Add batched all-gather, reduce-scatter, and all-reduce through `BucketBuffer`, with sessions for ordinary PyTorch tensors
  - Add `EPBuffer.lb_prefetch_weights` and `EPBuffer.lb_reduce_grads` for dynamic redundant experts: prefetch expert weights and quantization scales over NVLink before expert computation, then accumulate redundant experts' FP32 gradients into the original experts during backward. These primitives support the expert-replication approach explored by [MoonEP](https://github.com/MoonshotAI/MoonEP) and [UltraEP](https://github.com/Dots-Infra/UltraEP); see [Expert load balancing](https://github.com/deepseek-ai/DeepEP/blob/main/README.md#expert-load-balancing) for the API and integration requirements
  - Support deferred EP epilogues, cached expanded layouts, and zero padding between experts
  - Support multi-layer Engram storage on GPU or CPU, with one wait hook per layer
  - Fully remove V1, including its APIs, NVSHMEM backend, and legacy documentation. NVSHMEM is no longer a dependency

- **V2 release**: A complete refactoring of expert parallelism, with support for larger scale-up and scale-out domains and the lightweight **NCCL Gin backend**.

动态. 昇腾版发布: 在华为 Ascend 950 NPU 上提供相同的 API 与完整性能, 详见 DeepEP-Ascend 仓库.

V2.5 发布, 改动有七项. 一是把 `ElasticBuffer` 拆成 `EPBuffer`, `EngramBuffer`, `PPBuffer` 与 `BucketBuffer`, 共用 `BufferBase` 的生命周期. 二是新增 `BufferAllocator`, 在构造 buffer 之前规划对称张量的分配. 三是经 `BucketBuffer` 提供批量的 all-gather, reduce-scatter 与 all-reduce, 并用 session 支持普通 PyTorch 张量. 四是为动态冗余专家新增 `EPBuffer.lb_prefetch_weights` 与 `EPBuffer.lb_reduce_grads`: 专家计算之前经 NVLink 预取专家权重与量化 scale, 反向时把冗余专家的 FP32 梯度累加回原专家; 这两个原语服务于 MoonEP 与 UltraEP 探索的专家复制方案, 接口与集成要求见「专家负载均衡」一节. 五是支持延后执行的 EP epilogue, 缓存的展开布局, 以及专家之间的零填充. 六是支持放在 GPU 或 CPU 上的多层 Engram 存储, 每层一个等待 hook. 七是彻底移除 V1, 包括其 API, NVSHMEM 后端与旧版文档, NVSHMEM 不再是依赖.

V2 发布: 对专家并行的完整重构, 支持更大的 scale-up 与 scale-out 域, 以及轻量的 **NCCL Gin 后端**.

#### New features

- **JIT-compiled communication kernels** via DeepJIT
- **NCCL Gin backend**
  - Lightweight device-side communication APIs
  - Able to reuse existing NCCL communicators
- **EPv2**
  - High-throughput and low-latency APIs unified into a single `EPBuffer` interface, with an expanded layout for grouped expert GEMMs
  - Larger scale-up & scale-out domain support
  - Analytical SM & QP count calculation — no more auto-tuning needed
  - Both hybrid & direct modes remain supported
- **Engram** (experimental, with RDMA)
- **PP** (experimental, with RDMA)
- **Bucket collectives** (experimental) for CP and DP (all-gather, reduce-scatter, and all-reduce)

新特性. 通信 kernel 经 DeepJIT 做 JIT 编译. NCCL Gin 后端提供轻量的设备侧通信 API, 并能复用已有的 NCCL communicator. EPv2 把高吞吐与低延迟两套 API 统一到一个 `EPBuffer` 接口里, 并为分组专家 GEMM 提供展开布局; 支持更大的 scale-up 与 scale-out 域; SM 数与 QP 数用解析方式算出, 不再需要自动调参; hybrid 与 direct 两种模式都保留. 另有三项实验特性: 基于 RDMA 的 Engram, 基于 RDMA 的 PP, 以及面向 CP 与 DP 的 bucket 集合通信 (all-gather, reduce-scatter 与 all-reduce).

#### Notes

- EP dispatch and combine require GPU SMs; zero-SM RDMA EP is not supported
- Bucket, Engram, and PP are experimental features
- Engram requires a NCCL build providing `ncclGinOptFlagsWarpGet`

注意事项: EP 的 dispatch 与 combine 需要占用 GPU SM, 不支持零 SM 的 RDMA EP; Bucket, Engram 与 PP 是实验特性; Engram 需要提供 `ncclGinOptFlagsWarpGet` 的 NCCL 构建.

> **核对:** V1 文档说 hook 式重叠「不占用任何 SM 资源」, 这里却写「不支持零 SM 的 RDMA EP」, 两处矛盾吗?
> 答: 两句话分别描述不同阶段. V1 的 low-latency kernel 在 [`csrc/deep_ep.cpp`](https://github.com/deepseek-ai/DeepEP/blob/567632d/csrc/deep_ep.cpp) 里拆成两次 launch: `return_recv_hook=true` 时只跑 `LOW_LATENCY_SEND_PHASE`, 接收阶段包成 `recv_hook` 留给调用方. 发送阶段要用 SM 做 FP8 转换并提交 IBGDA 请求, 这几微秒占满 SM; 提交后数据在网卡上传输, 这段时间不占 SM, 「不占 SM」指的就是网卡传输阶段. V2.5 讨论 dispatch 与 combine 整体: [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 的 `get_theoretical_num_sms` 将下限设为 4 个 SM, 没有返回 0 的分支. [issue 179](https://github.com/deepseek-ai/DeepEP/issues/179) 也给出了相同解释.

### Quick start

#### Requirements

- Linux
- Python 3.10 and above
- NVIDIA Hopper or newer GPUs
- CUDA Toolkit 13.1 and above for DeepJIT compilation, with support for the target GPU
- A C++20 compiler and standard library with `std::format` support
- PyTorch 2.10 and above, with CUDA support
- NCCL 2.32.3 and above
- NVLink for intranode communication
- RDMA network for internode communication

环境要求: Linux; Python 3.10 及以上; NVIDIA Hopper 或更新的 GPU; DeepJIT 编译需要 CUDA Toolkit 13.1 及以上, 且支持目标 GPU; 支持 `std::format` 的 C++20 编译器与标准库; 带 CUDA 的 PyTorch 2.10 及以上; NCCL 2.32.3 及以上; 节点内通信要有 NVLink; 跨节点通信要有 RDMA 网络.

Installation builds the host C++ extension against the CUDA and NCCL libraries. GPU kernels are compiled by DeepJIT for the current device at runtime, so installation does not require a visible GPU or `TORCH_CUDA_ARCH_LIST`. Keep the CUDA toolkit and host compiler available at runtime. Automatic bandwidth detection uses `nvidia-smi` and `ibstat`; `BucketBuffer` currently requires both NVLink and RDMA bandwidth to be detectable, even for a group using only one transport.

安装时只针对 CUDA 与 NCCL 库构建主机侧的 C++ 扩展. GPU kernel 在运行时由 DeepJIT 针对当前设备编译, 所以安装时不需要能看到 GPU, 也不需要 `TORCH_CUDA_ARCH_LIST`. 运行时要保证 CUDA toolkit 与主机编译器可用. 带宽自动探测用的是 `nvidia-smi` 与 `ibstat`; `BucketBuffer` 目前要求 NVLink 与 RDMA 两侧带宽都能探测到, 即使这个通信组只用其中一种传输.

#### Install NCCL dependency

Install the NCCL package matching your CUDA environment so DeepEP can locate its headers and library:

安装与 CUDA 环境匹配的 NCCL 包, 让 DeepEP 能找到它的头文件与库:

```bash
# CUDA 13.x
python -m pip install "nvidia-nccl-cu13>=2.32.3" --no-deps
# For CUDA 12.x, use nvidia-nccl-cu12 instead
```

For a custom NCCL installation, set `EP_NCCL_ROOT_DIR` to a directory containing `include/` and `lib/`. PyTorch and DeepEP must load the same NCCL shared library. Builds using NCCL headers older than 2.31 additionally require an exact compile-time/runtime NCCL version match.

如果是自行安装的 NCCL, 把 `EP_NCCL_ROOT_DIR` 设成包含 `include/` 与 `lib/` 的目录. PyTorch 与 DeepEP 必须加载同一个 NCCL 共享库. 用低于 2.31 的 NCCL 头文件构建时, 编译期与运行期的 NCCL 版本还必须完全一致.

#### Installation

```bash
# Initialize the DeepJIT submodule
git submodule update --init --recursive

# Build a wheel and install it into the current Python environment
bash install.sh
```

Then import `deep_ep` in your Python project.

之后在 Python 项目里 import `deep_ep` 即可.

#### Development and tests

```bash
# Build and link the extension into the source tree
bash develop.sh

# Run test cases
python tests/ep/test_ep.py
python tests/bucket/test_all_gather.py
python tests/bucket/test_reduce_scatter.py
python tests/bucket/test_all_reduce.py
python tests/buffer/test_allocation.py
python tests/ep/test_prefetch_weights.py
python tests/ep/test_reduce_grads.py
python tests/engram/test_engram.py
python tests/pp/test_pp.py
```

The test scripts require NumPy and spawn local GPU workers. For multi-node tests, launch the same script on each node with a shared `MASTER_ADDR` and `MASTER_PORT`, setting `WORLD_SIZE` to the number of nodes and `RANK` to the node index. These are the conventions of `init_dist` in [deep_ep/utils/envs.py](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/utils/envs.py); adapt it to your cluster if needed. The tests default to `NCCL_IB_SL=1` and `EP_OVERRIDE_RDMA_SL=1` unless already set. Weight-prefetch and gradient-reduction tests use a single NVLink domain; PP tests require an RDMA-only group.

测试脚本需要 NumPy, 会在本机拉起 GPU worker 进程. 跑多节点测试, 要在每个节点上启动同一个脚本, 共用同一组 `MASTER_ADDR` 与 `MASTER_PORT`, `WORLD_SIZE` 设为节点数, `RANK` 设为节点序号. 这是 `deep_ep/utils/envs.py` 里 `init_dist` 的约定, 需要的话按自己的集群改. 如果没有预先设置, 测试默认用 `NCCL_IB_SL=1` 与 `EP_OVERRIDE_RDMA_SL=1`. 权重预取与梯度归约的测试只用一个 NVLink 域; PP 测试需要一个纯 RDMA 的通信组.

### Interfaces and examples

#### Buffer initialization

High-throughput and low-latency EP operations share a single `EPBuffer` interface. Initialize the buffer with MoE settings directly; SM and QP counts are estimated analytically and can be overridden per call.

高吞吐与低延迟两类 EP 操作共用一个 `EPBuffer` 接口. 直接用 MoE 配置初始化 buffer 即可; SM 数与 QP 数由解析公式估算, 每次调用时也可以覆盖.

Create and reuse a buffer for each EP group. All ranks must agree on `num_max_tokens_per_rank`; choose a common capacity covering the intended training, prefill, and decoding batches. The example below manages one EP group. Finish outstanding operations before replacing its buffer.

每个 EP 组建一个 buffer 并复用. 所有 rank 的 `num_max_tokens_per_rank` 必须一致, 取一个能覆盖训练, prefill 与 decode 各自批大小的公共容量. 下面的示例只管理一个 EP 组. 替换 buffer 之前, 先等进行中的操作完成.

```python
import torch.distributed as dist
from typing import Optional

from deep_ep import EPBuffer

# Communication buffer (will allocate at runtime)
_buffer: Optional[EPBuffer] = None

# Number of SMs to use for communication kernels (will be set at buffer creation)
_num_comm_sms: int = 0


def get_buffer(group: dist.ProcessGroup,
               num_max_tokens_per_rank: int,
               hidden: int,
               num_topk: int,
               num_experts: int,
               use_fp8_dispatch: bool = False) -> EPBuffer:
    """Initialize or retrieve the EPBuffer for EP communication."""
    global _buffer, _num_comm_sms

    # Check if we can reuse the existing buffer
    required_bytes = EPBuffer.get_buffer_size_hint(
        group, num_max_tokens_per_rank, hidden,
        num_topk=num_topk, use_fp8_dispatch=use_fp8_dispatch,
    )
    if _buffer is not None and _buffer.group == group and _buffer.num_bytes >= required_bytes:
        _num_comm_sms = _buffer.get_theoretical_num_sms(num_experts, num_topk)
        return _buffer

    # Allocate a new buffer with MoE settings
    _buffer = EPBuffer(
        group,
        num_max_tokens_per_rank=num_max_tokens_per_rank,
        hidden=hidden,
        num_topk=num_topk,
        use_fp8_dispatch=use_fp8_dispatch,
    )

    # Estimate the SM count from the topology and communication volume
    # You may also specify `num_sms` manually in dispatch/combine calls to override
    _num_comm_sms = _buffer.get_theoretical_num_sms(num_experts, num_topk)

    return _buffer
```

#### Example use in model training and inference

Training, inference prefilling, and inference decoding use the same `EPBuffer` dispatch and combine APIs. The example uses an expanded layout for grouped expert GEMMs and defers the forward epilogues until the framework waits for their results. Set `expert_alignment` to the grouped GEMM's token alignment; for DeepGEMM, use `deep_gemm.get_mk_alignment_for_contiguous_layout()`.

训练, 推理 prefill 与推理 decode 用的是同一套 `EPBuffer` dispatch 与 combine API. 示例为分组专家 GEMM 使用展开布局, 并把前向的 epilogue 延后到框架等待结果的时刻. `expert_alignment` 设成分组 GEMM 要求的 token 对齐; 用 DeepGEMM 的话取 `deep_gemm.get_mk_alignment_for_contiguous_layout()`.

`do_cpu_sync=True` obtains exact output sizes and CPU-side expert counts, commonly used for training and prefill. Set it to `False` when using GPU-side receive counts, as in decoding: outputs are allocated to the configured capacity, and the expert GEMMs must use `handle.psum_num_recv_tokens_per_expert` to identify valid expert ranges. A new routing decision needs a fresh dispatch; decoding alone does not make an old routing handle reusable.

`do_cpu_sync=True` 会拿到准确的输出大小与 CPU 侧的各专家计数, 训练与 prefill 通常这样用. 如果用 GPU 侧的接收计数, 比如 decode, 就设为 `False`: 输出按配置的容量分配, 专家 GEMM 必须用 `handle.psum_num_recv_tokens_per_expert` 确定每个专家的有效区间. 路由结果变了就要重新 dispatch; 处在 decode 阶段并不意味着旧的路由 handle 可以复用.

```python
import torch
from typing import Optional, Tuple, Union

from deep_ep import EPBuffer, EPHandle, EventHandle, EventOverlap


def dispatch_forward(x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     topk_idx: torch.Tensor, topk_weights: torch.Tensor,
                     num_experts: int,
                     num_max_tokens_per_rank: int,
                     expert_alignment: int = 1,
                     do_cpu_sync: bool = True,
                     previous_event: Optional[EventHandle] = None) -> EventOverlap:
    """
    MoE dispatch: route tokens to the corresponding experts across all ranks.
    Supports both BF16 and FP8 (x as a tuple of [data, scale_factors]) inputs.
    Wait on the returned event to obtain the expanded tensors and routing handle.
    """
    global _buffer, _num_comm_sms

    return _buffer.dispatch(
        x,
        topk_idx=topk_idx,
        topk_weights=topk_weights,
        num_experts=num_experts,
        num_max_tokens_per_rank=num_max_tokens_per_rank,
        expert_alignment=expert_alignment,
        num_sms=_num_comm_sms,
        previous_event=previous_event,
        async_with_compute_stream=True,
        allocate_on_comm_stream=previous_event is not None,
        do_cpu_sync=do_cpu_sync,
        do_expand=True,
        do_zero_padding=True,
        use_tma_aligned_col_major_sf=True,
        defer_epilogue=True,
    )


def dispatch_backward(grad_recv_x: torch.Tensor,
                      grad_recv_topk_weights: torch.Tensor,
                      handle: EPHandle,
                      bias: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor, EventOverlap]:
    """The backward pass of MoE dispatch is actually a combine."""
    global _buffer, _num_comm_sms

    combined_grad_x, combined_grad_topk_weights, event = _buffer.combine(
        grad_recv_x,
        handle=handle,
        bias=bias,
        topk_weights=grad_recv_topk_weights,
        num_sms=_num_comm_sms,
        async_with_compute_stream=True,
    )

    return combined_grad_x, combined_grad_topk_weights, event


def combine_forward(x: torch.Tensor,
                    handle: EPHandle,
                    bias: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]] = None,
                    previous_event: Optional[EventHandle] = None) -> EventOverlap:
    """MoE combine: reduce expert outputs back to their original ranks."""
    global _buffer, _num_comm_sms

    return _buffer.combine(
        x,
        handle=handle,
        bias=bias,
        num_sms=_num_comm_sms,
        previous_event=previous_event,
        async_with_compute_stream=True,
        allocate_on_comm_stream=previous_event is not None,
        defer_epilogue=True,
    )


def combine_backward(grad_combined_x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     handle: EPHandle) -> \
        Tuple[Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]], EventOverlap]:
    """The backward pass of MoE combine is actually a dispatch."""
    global _buffer, _num_comm_sms

    grad_x, _, _, _, event = _buffer.dispatch…12397 tokens truncated…topk_idx: torch.Tensor, topk_weights: torch.Tensor,
                     num_experts: int, previous_event: Optional[EventOverlap] = None) -> \
        Tuple[Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]], torch.Tensor, torch.Tensor, List, Tuple, EventOverlap]:
    # NOTES: an optional `previous_event` means a CUDA event captured that you want to make it as a dependency
    # of the dispatch kernel, it may be useful with communication-computation overlap. For more information, please
    # refer to the docs of `Buffer.dispatch`
    global _buffer

    # Calculate layout before actual dispatch
    num_tokens_per_rank, num_tokens_per_rdma_rank, num_tokens_per_expert, is_token_in_rank, previous_event = \
        _buffer.get_dispatch_layout(topk_idx, num_experts,
                                    previous_event=previous_event, async_finish=True,
                                    allocate_on_comm_stream=previous_event is not None)
    # Do MoE dispatch
    # NOTES: the CPU will wait for GPU's signal to arrive, so this is not compatible with CUDA graph
    # Unless you specify `num_worst_tokens`, but this flag is for intranode only
    # For more advanced usages, please refer to the docs of the `dispatch` function
    recv_x, recv_topk_idx, recv_topk_weights, num_recv_tokens_per_expert_list, handle, event = \
        _buffer.dispatch(x, topk_idx=topk_idx, topk_weights=topk_weights,
                         num_tokens_per_rank=num_tokens_per_rank, num_tokens_per_rdma_rank=num_tokens_per_rdma_rank,
                         is_token_in_rank=is_token_in_rank, num_tokens_per_expert=num_tokens_per_expert,
                         previous_event=previous_event, async_finish=True,
                         allocate_on_comm_stream=True)
    # For event management, please refer to the docs of the `EventOverlap` class
    return recv_x, recv_topk_idx, recv_topk_weights, num_recv_tokens_per_expert_list, handle, event


def dispatch_backward(grad_recv_x: torch.Tensor, grad_recv_topk_weights: torch.Tensor, handle: Tuple) -> \
        Tuple[torch.Tensor, torch.Tensor, EventOverlap]:
    global _buffer

    # The backward process of MoE dispatch is actually a combine
    # For more advanced usages, please refer to the docs of the `combine` function
    combined_grad_x, combined_grad_recv_topk_weights, event = \
        _buffer.combine(grad_recv_x, handle, topk_weights=grad_recv_topk_weights, async_finish=True)

    # For event management, please refer to the docs of the `EventOverlap` class
    return combined_grad_x, combined_grad_recv_topk_weights, event


def combine_forward(x: torch.Tensor, handle: Tuple, previous_event: Optional[EventOverlap] = None) -> \
        Tuple[torch.Tensor, EventOverlap]:
    global _buffer

    # Do MoE combine
    # For more advanced usages, please refer to the docs of the `combine` function
    combined_x, _, event = _buffer.combine(x, handle, async_finish=True, previous_event=previous_event,
                                           allocate_on_comm_stream=previous_event is not None)

    # For event management, please refer to the docs of the `EventOverlap` class
    return combined_x, event


def combine_backward(grad_combined_x: Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]],
                     handle: Tuple, previous_event: Optional[EventOverlap] = None) -> \
        Tuple[Union[torch.Tensor, Tuple[torch.Tensor, torch.Tensor]], EventOverlap]:
    global _buffer

    # The backward process of MoE combine is actually a dispatch
    # For more advanced usages, please refer to the docs of the `dispatch` function
    grad_x, _, _, _, _, event = _buffer.dispatch(grad_combined_x, handle=handle, async_finish=True,
                                                 previous_event=previous_event,
                                                 allocate_on_comm_stream=previous_event is not None)

    # For event management, please refer to the docs of the `EventOverlap` class
    return grad_x, event
```

Moreover, inside the dispatch function, we may not know how many tokens to receive for the current rank. So an implicit CPU wait for GPU received count signal will be involved, as the following figure shows.

另外, 在 dispatch 函数内部, 当前 rank 事先并不知道自己要收多少 token, 因此会隐式地让 CPU 等一个 GPU 发来的接收计数信号, 流程见仓库里的 [normal 示意图](https://github.com/deepseek-ai/DeepEP/blob/a56d615/figures/normal.png).

#### Example use in inference decoding

The low latency kernels can be used in the inference decoding phase as the below example code shows.

low-latency kernel 可以用在推理 decode 阶段, 用法见下面的示例代码.

```python
import torch
import torch.distributed as dist
from typing import Tuple, Optional

from deep_ep import Buffer

# Communication buffer (will allocate at runtime)
# NOTES: there is no SM control API for the low-latency kernels
_buffer: Optional[Buffer] = None


# You may call this function at the framework initialization
def get_buffer(group: dist.ProcessGroup, num_max_dispatch_tokens_per_rank: int, hidden: int, num_experts: int) -> Buffer:
    # NOTES: the low-latency mode will consume much more space than the normal mode
    # So we recommend that `num_max_dispatch_tokens_per_rank` (the actual batch size in the decoding engine) should be less than 256
    global _buffer
    num_rdma_bytes = Buffer.get_low_latency_rdma_size_hint(num_max_dispatch_tokens_per_rank, hidden, group.size(), num_experts)

    # Allocate a buffer if not existed or not enough buffer size
    if _buffer is None or _buffer.group != group or not _buffer.low_latency_mode or _buffer.num_rdma_bytes < num_rdma_bytes:
        # NOTES: for the best performance, the QP number **must** be equal to the number of the local experts
        assert num_experts % group.size() == 0
        _buffer = Buffer(group, 0, num_rdma_bytes, low_latency_mode=True, num_qps_per_rank=num_experts // group.size())
    return _buffer


def low_latency_dispatch(hidden_states: torch.Tensor, topk_idx: torch.Tensor, num_max_dispatch_tokens_per_rank: int, num_experts: int):
    global _buffer

    # Do MoE dispatch, compatible with CUDA graph (but you may restore some buffer status once you replay)
    recv_hidden_states, recv_expert_count, handle, event, hook = \
        _buffer.low_latency_dispatch(hidden_states, topk_idx, num_max_dispatch_tokens_per_rank, num_experts,
                                     async_finish=False, return_recv_hook=True)

    # NOTES: the actual tensor will not be received only if you call `hook()`,
    # it is useful for double-batch overlapping, but **without any SM occupation**
    # If you don't want to overlap, please set `return_recv_hook=False`
    # Later, you can use our GEMM library to do the computation with this specific format
    return recv_hidden_states, recv_expert_count, handle, event, hook


def low_latency_combine(hidden_states: torch.Tensor,
                        topk_idx: torch.Tensor, topk_weights: torch.Tensor, handle: Tuple):
    global _buffer

    # Do MoE combine, compatible with CUDA graph (but you may restore some buffer status once you replay)
    combined_hidden_states, event_overlap, hook = \
        _buffer.low_latency_combine(hidden_states, topk_idx, topk_weights, handle,
                                    async_finish=False, return_recv_hook=True)

    # NOTES: the same behavior as described in the dispatch kernel
    return combined_hidden_states, event_overlap, hook
```

For two-micro-batch overlapping, you can refer to the following figure. With our receiving hook interface, the RDMA network traffic is happening in the background, without costing any GPU SMs from the computation part. But notice, the overlapped parts can be adjusted, i.e., the 4 parts of attention/dispatch/MoE/combine may not have the exact same execution time. You may adjust the stage settings according to your workload.

双 micro-batch 重叠的做法见仓库里的 [low-latency 示意图](https://github.com/deepseek-ai/DeepEP/blob/a56d615/figures/low-latency.png). 有了接收 hook 接口, RDMA 的网络流量在后台进行, 不占用计算那一侧的任何 GPU SM. 但要注意重叠的分段是可以调的: attention, dispatch, MoE, combine 这四段的执行时间不一定完全相等, 可以按自己的负载调整分段设置.

### Roadmap (V1)

- [x] AR support
- [x] Refactor low-latency mode AR code
- [x] A100 support (intranode only)
- [x] Support BF16 for the low-latency dispatch kernel
- [x] Support NVLink protocol for intranode low-latency kernels
- [ ] TMA copy instead of LD/ST
    - [x] Intranode kernels
    - [ ] Internode kernels
    - [ ] Low-latency kernels
- [ ] SM-free kernels and refactors
- [ ] Fully remove undefined-behavior PTX instructions

V1 路线图里已完成的是: 自适应路由支持与低延迟模式下相关代码的重构, A100 的节点内支持, 低延迟 dispatch 的 BF16, 以及节点内低延迟 kernel 的 NVLink 协议. 未完成的是: 把 LD/ST 全换成 TMA 拷贝 (节点内已完成, 跨节点与低延迟未完成), 免 SM 的 kernel 与相应重构, 以及彻底去掉未定义行为的 PTX 指令.

### Notices (V1)

#### Easier potential overall design

The V1 implementation uses queues for communication buffers which save memory but introduce complexity and potential deadlocks. If you're implementing your own version based on DeepEP V1, consider using fixed-size buffers allocated to maximum capacity for simplicity and better performance. For a detailed discussion of this alternative approach, see https://github.com/deepseek-ai/DeepEP/issues/39.

V1 的实现用队列来管理通信 buffer, 省内存, 但带来了复杂度和潜在的死锁. 如果要基于 V1 自己实现一版, 可以考虑直接按最大容量分配定长 buffer, 更简单也更快. 这个替代方案的详细讨论见 issue 39.

#### Undefined-behavior PTX usage

- For extreme performance, we discover and use an undefined-behavior PTX usage: using read-only PTX `ld.global.nc.L1::no_allocate.L2::256B` to **read volatile data**. The PTX modifier `.nc` indicates that a non-coherent cache is used. But the correctness is tested to be guaranteed with `.L1::no_allocate` on Hopper architectures, and performance will be much better. The reason we guess may be: the non-coherent cache is unified with L1, and the L1 modifier is not just a hint but a strong option, so that the correctness can be guaranteed by no dirty data in L1.
- Initially, because NVCC could not automatically unroll volatile read PTX, we tried using `__ldg` (i.e., `ld.nc`). Even compared to manually unrolled volatile reads, it was significantly faster (likely due to additional compiler optimizations). However, the results could be incorrect or dirty. After consulting the PTX documentation, we discovered that L1 and non-coherent cache are unified on Hopper architectures. We speculated that `.L1::no_allocate` might resolve the issue, leading to this discovery.
- If you find kernels not working on some other platforms, you may add `DISABLE_AGGRESSIVE_PTX_INSTRS=1` to `setup.py` and disable this, or file an issue.

这一段讲的是一处未定义行为的 PTX 用法. 为了极致性能, 作者用只读的 `ld.global.nc.L1::no_allocate.L2::256B` 去**读 volatile 数据**. `.nc` 修饰符表示走非一致性缓存, 但在 Hopper 架构上配合 `.L1::no_allocate` 实测能保证正确性, 性能也好很多. 作者的猜测是: 非一致性缓存与 L1 是统一的, 而 L1 修饰符不只是提示而是强约束, L1 里不会有脏数据, 正确性因此得到保证.

起因是 NVCC 无法自动展开 volatile 读的 PTX, 于是改试 `__ldg` (即 `ld.nc`). 即便与手工展开的 volatile 读相比, 它也明显更快 (很可能来自额外的编译器优化), 但结果可能不正确或是脏数据. 查了 PTX 文档发现 Hopper 上 L1 与非一致性缓存统一, 推测 `.L1::no_allocate` 能解决问题, 于是有了这个发现. 如果在别的平台上 kernel 跑不通, 可以在 `setup.py` 里加 `DISABLE_AGGRESSIVE_PTX_INSTRS=1` 把它关掉, 或者提 issue.

#### Auto-tuning on your cluster

For better performance on your cluster, we recommend to run all the tests and use the best auto-tuned configuration. The default configurations are optimized on the DeepSeek's internal cluster.

为了在自己的集群上拿到更好的性能, 建议把所有测试跑一遍, 用自动调出来的最佳配置. 默认配置是在 DeepSeek 内部集群上调的.

> **回看:** V1 说要自动调参, V2 说「解析式算出 SM 与 QP 数, 不再需要自动调参」, 中间被换掉的是什么?
> 答: 被换掉的是 V1 [`deep_ep/buffer.py`](https://github.com/deepseek-ai/DeepEP/blob/567632d/deep_ep/buffer.py) 里 `get_dispatch_config` 与 `get_combine_config` 那两张按 EP 规模预设的表, 每项是一个 `Config`, 除 SM 数外给出 NVLink 与 RDMA 两侧的 chunk 发送与接收 token 数共四个参数, 从 EP2 一直列到 EP160. V2 的 [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 用 `get_theoretical_num_sms` 取代: 它先用组合数算出每个 token 期望命中的 scale-out 与 scale-up rank 数, 再按 RDMA 与 NVLink 的实测带宽 (由 `ibstat` 与 `nvidia-smi nvlink -s` 探测) 判断哪一侧是瓶颈, 最终用「每 SM 的读写带宽」把 SM 数解出来. QP 数由 `get_theoretical_num_qps` 给出: direct 模式取 `min(num_sms, 9)`, hybrid 模式取 `num_sms * 16 + 1`.

## docs/nvshmem.md

### Important notices

**This project is neither sponsored nor supported by NVIDIA:** **Use of NVIDIA NVSHMEM is governed by the terms at [NVSHMEM Software License Agreement](https://docs.nvidia.com/nvshmem/api/sla.html).**

重要声明: 本项目既不由 NVIDIA 赞助, 也不由其提供支持. 使用 NVIDIA NVSHMEM 须遵守 NVSHMEM 软件许可协议的条款.

### Prerequisites

Hardware requirements:
   - GPUs inside one node needs to be connected by NVLink
   - GPUs across different nodes needs to be connected by RDMA devices, see [GPUDirect RDMA Documentation](https://docs.nvidia.com/cuda/gpudirect-rdma/)
   - InfiniBand GPUDirect Async (IBGDA) support, see [IBGDA Overview](https://developer.nvidia.com/blog/improving-network-performance-of-hpc-systems-using-nvidia-magnum-io-nvshmem-and-gpudirect-async/)
   - For more detailed requirements, see [NVSHMEM Hardware Specifications](https://docs.nvidia.com/nvshmem/release-notes-install-guide/install-guide/abstract.html#hardware-requirements)

Software requirements:
   - NVSHMEM v3.3.9 or later

硬件要求: 节点内 GPU 之间要有 NVLink; 跨节点 GPU 之间要有 RDMA 设备; 要支持 InfiniBand GPUDirect Async (IBGDA); 更详细的要求见 NVSHMEM 硬件规格文档. 软件要求是 NVSHMEM v3.3.9 或更新版本.

### Installation procedure

#### 1. Install NVSHMEM binaries

NVSHMEM 3.3.9 binaries are available in several formats:
   - Tarballs for  [x86_64](https://developer.download.nvidia.com/compute/nvshmem/redist/libnvshmem/linux-x86_64/libnvshmem-linux-x86_64-3.3.9_cuda12-archive.tar.xz) and [aarch64](https://developer.download.nvidia.com/compute/nvshmem/redist/libnvshmem/linux-sbsa/libnvshmem-linux-sbsa-3.3.9_cuda12-archive.tar.xz)
   - RPM and deb packages: instructions can be found on the [NVSHMEM installer page](https://developer.nvidia.com/nvshmem-downloads?target_os=Linux)
   - Conda packages through conda-forge
   - pip wheels through PyPI: `pip install nvidia-nvshmem-cu12`

DeepEP is compatible with upstream NVSHMEM 3.3.9 and later.

NVSHMEM 3.3.9 的二进制有几种形式: x86_64 与 aarch64 的 tarball; RPM 与 deb 包; conda-forge 上的 conda 包; PyPI 上的 pip wheel. DeepEP 与上游 NVSHMEM 3.3.9 及更新版本兼容.

#### 2. Enable NVSHMEM IBGDA support

NVSHMEM Supports two modes with different requirements. Either of the following methods can be used to enable IBGDA support.

NVSHMEM 支持两种要求不同的模式, 用下面任一种方法都能打开 IBGDA 支持.

##### 2.1 Configure NVIDIA driver

This configuration enables traditional IBGDA support.

Modify `/etc/modprobe.d/nvidia.conf`:

这种配置打开的是传统的 IBGDA 支持. 修改 `/etc/modprobe.d/nvidia.conf`:

```bash
options nvidia NVreg_EnableStreamMemOPs=1 NVreg_RegistryDwords="PeerMappingOverride=1;"
```

Update kernel configuration:

更新内核配置:

```bash
sudo update-initramfs -u
sudo reboot
```

##### 2.2 Install GDRCopy and load the gdrdrv kernel module

This configuration enables IBGDA through asynchronous post-send operations assisted by the CPU. More information about CPU-assisted IBGDA can be found in [this blog](https://developer.nvidia.com/blog/enhancing-application-portability-and-compatibility-across-new-platforms-using-nvidia-magnum-io-nvshmem-3-0/#cpu-assisted_infiniband_gpu_direct_async%C2%A0).
It comes with a small performance penalty, but can be used when modifying the driver regkeys is not an option.

这种配置靠 CPU 协助的异步 post-send 操作来打开 IBGDA, CPU 协助版 IBGDA 的更多信息见 NVIDIA 的博客. 它有一点性能损失, 但在不便改驱动注册键的环境下可以用.

Download GDRCopy. GDRCopy is available as prebuilt deb and rpm packages [here](https://developer.download.nvidia.com/compute/redist/gdrcopy/). or as source code on the [GDRCopy github repository](https://github.com/NVIDIA/gdrcopy).

Install GDRCopy following the instructions on the [GDRCopy github repository](https://github.com/NVIDIA/gdrcopy?tab=readme-ov-file#build-and-installation).

下载 GDRCopy: 既有预编译的 deb 与 rpm 包, 也可以从 GDRCopy 的 GitHub 仓库取源码. 按该仓库的说明安装.

### Post-installation configuration

When not installing NVSHMEM from RPM or deb packages, set the following environment variables in your shell configuration:

如果不是用 RPM 或 deb 包安装 NVSHMEM, 在 shell 配置里设好下面这些环境变量:

```bash
export NVSHMEM_DIR=/path/to/your/dir/to/install  # Use for DeepEP installation
export LD_LIBRARY_PATH="${NVSHMEM_DIR}/lib:$LD_LIBRARY_PATH"
export PATH="${NVSHMEM_DIR}/bin:$PATH"
```

### Verification

```bash
nvshmem-info -a # Should display details of nvshmem
```

安装完成后用 `nvshmem-info -a` 验证, 正常情况下会打印 NVSHMEM 的详细信息.

> **确认:** 这份安装文档要求配驱动的 `NVreg_EnableStreamMemOPs=1` 与 `PeerMappingOverride=1`, 这两项在 V2.5 之后还需要吗?
> 答: 不需要. V2.5 的发布说明写明「Fully remove V1, including its APIs, NVSHMEM backend, and legacy documentation. NVSHMEM is no longer a dependency」, 当前 README 的依赖列表里只剩 NCCL 2.32.3 及以上, 部署前置从「改驱动注册键并重启」变成「装一个与 CUDA 匹配的 NCCL 包」. QP 规划随之换了地方: [`deep_ep/buffers/ep.py`](https://github.com/deepseek-ai/DeepEP/blob/main/deep_ep/buffers/ep.py) 的 `EPBuffer` 在 `allow_hybrid_mode` 下默认分配 65 或 129 个 QP (取决于 `check_fast_rdma_atomic_support` 的结果), 关掉 hybrid 时分配 17 个; 这个数在 [`csrc/kernels/comm/context.cpp`](https://github.com/deepseek-ai/DeepEP/blob/main/csrc/kernels/comm/context.cpp) 里写进 NCCL 的 `ginContextCount`, 取代了 V1 通过 `NVSHMEM_IBGDA_NUM_RC_PER_PE` 环境变量传给 NVSHMEM 的做法.
