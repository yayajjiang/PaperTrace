---
title: "01 · DSec 对照译稿"
category: "基础设施"
tags: ["DeepSeek", "对照译稿"]
published: true
excerpt: "DeepSeek 与清华的沙箱平台论文 DSec 的逐段中英对照译稿, 覆盖四类沙箱后端, 分层环境, 3FS 按需加载, 高密度超卖, 与 RL 框架的协同和评测, 并附读稿时的疑问块."
---
<!-- page 1 of 31 -->

arXiv:2609.22978v1 [cs.DC] 19 Sep 2026

Qdeepseek

# DeepSeek Elastic Compute (DSec): A Sandbox Infrastructure for Effective Agentic Training at Scale / DeepSeek 弹性计算 (DSec): 支撑大规模 Agent 训练的沙箱基础设施

Jialiang Huang<sup>†‡</sup>, Hongxuan Tang<sup>†</sup>, Jingchang Chen†, Yuxuan Liu†, Yixiao Chen†, Yuan Cheng<sup>†</sup>, Yi Tao†, Jingli Zhou†, Yupeng Chen†, Haoyu Chen†, Jiarui Wang<sup>†</sup>, Shengkai Lin†, Chuqi Zhang<sup>†</sup>, Bryan Lee Teng<sup>†</sup>, Lian Guo†, Zhe Fu, Wenjun Gao, Yisong Wang, Liang Zhao, Zehao Wang, Ziwei Xie, Yongqiang Guo, Peixin Cong, Ziyi Gao, Shuiping Yu, Hanwei Xu, Zuofan Wu, Zhizhou Ren, Yuyang Zhou, Bowei Zhang, Zhihuan Huang, Qihao Zhu, Lei Wang, Tianle Lin, Han Yu, Jiewen Hu, Dejian Yang, Shuo Yang, Shanghao Lu, Shaoyuan Chen, Junjie Qiu, Zhangli Sha, Yinmin Zhong, Yongtong Wu, Shiyu Wang, Wei Liu, Bingzheng Xu, Longhao Chen, Qiushi Du, Yuzhen Huang, Shirong Ma, Yaohui Wang, Mingshu Chen, Tongrui Xiong, Y.C. Yan, Haowen Luo, Haofen Liang, Xiaokang Zhang, Weihao Zeng, Runxin Xu, Peiyi Wang, Jinhua Zhu, Ruoyu Zhang, Wenkai Yang, Qi Tang, Jiping Yu, Tian Ye, Ruizhe Pan, Honghui Ding, Xiaodong Liu, Lingxiao Luo, Zhihong Shao, Yuhan Wu, Jibai Lu, Wen Liu, Haoling Zhang, Jingcheng Hu, Yaoyang Ye, Chaofan Lin, Zhaochen Zhang, Jianan Tong, Hengxu Wu, Zhihao Li, Yicheng Wang, Luyao Wang, Yuzhuo Bai, Lingyue Fu, Ruifan Xu, Y.Z. Wang, Zonglin Li, Mingqi Wei, Haiyang Shen, Chengyuan Zhang, Chao Jin, Zili Zhang, R.H. Yang, Xinbo Xu, Jian Zhou, Ruidong Zhu, Yuzhe Guo, Zelun Pan, Shaoheng Nie, Erhang Li, Shuhan Lin, Zheng Liu, Anshuo Chen, Zilong Lyu, Sinuo Cao, Rui Yu, Chuhao Wang, Junyi Guo, Junxiao Song, Kaifeng Chen, Menghao Ye, Junxian Li, Di Wu, Haiyang Ma, Yilun Wang, Haoran Yang, Yizai Cai, Shichun Liu, Yiping Wang, Junbo Sun, Shicheng Xu, Xiao Bi, Ying He, Yichao Zhang, Mingxing Zhang<sup>‡</sup>, Liyue Zhang<sup>∗†</sup>, Panpan Huang, Wenfeng Liang

**DeepSeek-AI** ‡**Tsinghua University**

### research@deepseek.com

## Abstract

Large-scale agentic training and evaluation with large language models (LLMs) rely on isolated, stateful execution environments in which models inspect repositories, invoke tools, execute commands, and interact with task-specific services. These workloads create sandboxes in large bursts, span heterogeneous functionality and isolation requirements, retain state across long interactions, and draw from large image corpora with limited reuse. Supporting them therefore requires an elastic execution platform rather than a single sandbox runtime.

用大语言模型 (LLM) 做大规模 Agent 训练和评测, 离不开隔离且有状态的执行环境: 模型要在里面查看代码仓库, 调用工具, 执行命令, 与任务专属的服务交互. 这类负载成批地突发创建沙箱, 对功能和隔离强度的要求各不相同, 状态要在很长的交互里一直保留, 镜像又取自一个庞大而复用率很低的库. 支撑它们需要的是一个弹性的执行平台, 单一的沙箱运行时撑不起来.

This report presents DeepSeek Elastic Compute (DSec), a production sandbox platform that exposes FnCall, container, microVM, and full-VM sandbox backends through a unified SDK. DSec coordinates placement and lifecycle management across the cluster, composes environments from independently versioned layers, combines memory sharing, reclamation, and CPU scheduling for high-density execution, and loads image data on demand from Fire-Flyer File System (3FS), a cluster-wide distributed filesystem. DSec is co-designed with the reinforcement learning (RL) framework, decouples stateful rollout execution from preemptible GPU training, coordinates sandbox lifecycle with training to preserve rollout state while reclaiming idle resources, and mitigates agent misbehavior such as reward hacking.

本报告介绍 DeepSeek Elastic Compute (DSec), 一个已投入生产的沙箱平台. 它通过一套统一的 SDK 提供 FnCall, 容器, microVM 和完整虚拟机四类沙箱后端. DSec 在集群范围内统筹放置和生命周期管理, 用各自独立版本化的层来拼装环境, 把内存共享, 内存回收和 CPU 调度结合起来支撑高密度执行, 并从集群级分布式文件系统 Fire-Flyer File System (3FS) 按需加载镜像数据. DSec 与强化学习 (RL) 框架协同设计: 有状态的 rollout 执行与可被抢占的 GPU 训练解耦; 沙箱生命周期与训练节奏配合, 既保住 rollout 状态又回收闲置资源; 同时抑制 reward hacking 一类的 Agent 不当行为.

A single production-scale unit of DSec spans around 160 nodes, serving about 3 million sandboxes per day; in production, it supports over 380,000 concurrent sandboxes and sustains over 5,000 sandbox creations per second. Our evaluation and deployment experience show that these mechanisms reduce environment setup and image-distribution overhead, improve memory efficiency, and preserve latency-sensitive performance under high-density overcommit.

DSec 的一个生产规模单元约有 160 个节点, 每天服务约 300 万个沙箱; 生产中它支撑超过 38 万个并发沙箱, 并能持续每秒创建 5,000 个以上的沙箱. 评测和部署经验表明, 这些机制降低了环境准备和镜像分发的开销, 提高了内存效率, 并在高密度超卖下保住了延迟敏感任务的性能.

∗Corresponding author. <sup>†</sup>DSec project developers. <sup>‡</sup>Tsinghua University. Jialiang Huang is a Ph.D. student advised by Mingxing Zhang. He contributed to this work during an internship at DeepSeek-AI under the mentorship of Liyue Zhang.

∗ 通讯作者. † DSec 项目开发者. ‡ 清华大学. Jialiang Huang 是 Mingxing Zhang 指导的博士生, 这项工作是他在 DeepSeek-AI 实习期间, 由 Liyue Zhang 指导完成的.

<!-- page 2 of 31 -->

## 1. Introduction

Recent advances in frontier LLMs have made agentic workflows practical and widely adopted (Guo et al., 2025; Jimenez et al., 2024; OpenAI et al., 2024). Instead of producing a single text answer, an agentic model interacts with an execution environment: it may navigate codebases, call tools, execute commands, inspect failures, and modify files, or operate browsers and desktop applications through graphical interfaces in computer-use tasks (Xie et al., 2024; Zhou et al., 2024). Across these workloads, the model iterates based on feedback until a task is solved. This execution model has led to a growing ecosystem of agent tools and orchestration harnesses, such as DeepSeek Harness (DSH) (Shi et al., 2026), OpenCode (Anomaly, 2025), and multi-agent training harnesses. Training reliable agents requires reinforcement learning (RL) at scale, in which models learn through interaction with real, isolated execution environments rather than solely from static input-output examples.

前沿 LLM 的进展让 Agent 工作流变得可用, 并已广泛落地 (Guo et al., 2025; Jimenez et al., 2024; OpenAI et al., 2024). Agent 模型不只给出一段文本答案, 而是与执行环境交互: 它会浏览代码库, 调用工具, 执行命令, 检查失败原因, 修改文件; 在 computer-use 任务里还会通过图形界面操作浏览器和桌面应用 (Xie et al., 2024; Zhou et al., 2024). 这些负载的共同点是模型根据反馈反复迭代, 直到任务完成. 这种执行方式催生了一批 Agent 工具和编排 harness, 例如 DeepSeek Harness (DSH) (Shi et al., 2026), OpenCode (Anomaly, 2025), 以及多 Agent 训练 harness. 要训出可靠的 Agent, 需要大规模强化学习 (RL), 让模型在真实, 隔离的执行环境里通过交互学习, 而不只靠静态的输入输出样例.

The agentic training pipeline encompasses environment and data construction, RL rollouts, reward computation, policy updates, and periodic evaluation. Among these stages, RL rollout and evaluation impose the highest pressure on the sandbox platform because they are largescale, concurrent, and tightly coupled with the training loop. In RL (Guo et al., 2025; Ouyang et al., 2022), training proceeds as a feedback loop with three stages. First, during rollout, the current model interacts with the sandboxed environment: it reads files, issues tool calls, executes commands, observes outputs, and produces a trajectory for each task. Second, during reward computation, the framework scores the trajectory using native execution signals such as exit codes, stdout, test pass rates, or task-specific verifiers. Third, during policy update, the RL algorithm updates the model parameters from the collected trajectories and rewards. Periodic evaluation follows a similar execution path, except that the resulting trajectories are used to measure model capability rather than to update parameters. Recent systems further pipeline generation and policy optimization through asynchronous rollouts, continuously replenishing completed samples to maintain high concurrency and mitigate long-tail stragglers (DeepSeek-AI, 2026). For agentic workloads, this design keeps many stateful sandbox sessions in flight and may interrupt and resume their associated rollouts across policy updates or scheduler preemptions, further increasing the platform's concurrency, lifecycle-management, and state-consistency requirements.

Agent 训练流水线包括环境与数据构建, RL rollout, 奖励计算, 策略更新和定期评测. 其中 RL rollout 和评测对沙箱平台的压力最大, 因为它们规模大, 并发高, 又与训练循环紧密耦合. RL (Guo et al., 2025; Ouyang et al., 2022) 的训练是一个三阶段的反馈循环. 第一步 rollout: 当前模型与沙箱环境交互, 读文件, 发工具调用, 执行命令, 观察输出, 为每个任务产出一条轨迹. 第二步奖励计算: 框架用执行本身给出的信号给轨迹打分, 例如退出码, stdout, 测试通过率或任务专属的验证器. 第三步策略更新: RL 算法用收集到的轨迹和奖励更新模型参数. 定期评测走的执行路径类似, 只是产出的轨迹用来衡量模型能力, 不用来更新参数. 近来的系统还用异步 rollout 把生成和策略优化流水化, 不断补入已完成的样本, 维持高并发并减轻长尾拖慢 (DeepSeek-AI, 2026). 对 Agent 负载来说, 这种设计让大量有状态的沙箱会话同时在途, 相关 rollout 还可能在策略更新或调度器抢占时被打断再恢复, 进一步抬高了平台在并发, 生命周期管理和状态一致性上的要求.

For each rollout or evaluation task, the platform must materialize an isolated task-specific environment, including its repositories, dependencies, services, evaluation scripts, and coding harnesses. The environment must be close enough to a real machine to run unmodified software stacks, package managers, build tools, browsers, emulators, and task-specific services. A robust, high-throughput sandbox runtime is therefore foundational for obtaining accurate and verifiable RL and evaluation results.

每个 rollout 或评测任务, 平台都要实例化一个隔离的, 任务专属的环境, 包括代码仓库, 依赖, 服务, 评测脚本和编码 harness. 这个环境要足够接近真实机器, 能跑未经修改的软件栈, 包管理器, 构建工具, 浏览器, 模拟器和任务专属服务. 所以, 稳健且高吞吐的沙箱运行时, 是拿到准确, 可验证的 RL 与评测结果的基础.

Agentic sandbox workloads have several properties that shape the platform design:

Agent 沙箱负载有几项性质决定了平台的设计:

(1) **Rollout and evaluation jobs create sandboxes in a bursty manner.** A single job may request up to 32K sandbox instances, so the platform must accept and place many sandboxes concurrently. Such bursts make horizontal scalability a system-wide requirement and require shared services, such as scheduling and image distribution, to avoid centralized bottlenecks.

(1) **Rollout 和评测作业突发式地创建沙箱.** 单个作业最多可能申请 32K 个沙箱实例, 平台必须同时接纳并放置大量沙箱. 这种突发让水平扩展成为全系统的要求, 调度, 镜像分发这类共享服务也必须避开中心化瓶颈.

(2) **Sandboxes must run at high density.** During agent interaction, a sandbox often waits for the LLM to generate the next action, so CPU usage is sparse and naturally suitable for overcommit. For instance, in production, this allows a single node to host up to 800 microVMs or 3,200 containers, but only if the platform can safely overcommit resources and manage lifecycle pressure at node scale.

(2) **沙箱必须高密度运行.** Agent 交互期间, 沙箱经常在等 LLM 生成下一步动作, CPU 使用很稀疏, 天然适合超卖. 例如在生产中, 单个节点最多可承载 800 个 microVM 或 3,200 个容器, 前提是平台能在节点粒度上安全地超卖资源并处理生命周期压力.

<!-- page 3 of 31 -->

(3) **Agent sandboxes are stateful and long-lived.** The model may modify files, install dependencies, and start services, and later tool calls depend on this accumulated state. Since a sandbox can stay alive across many LLM interaction turns, memory footprint, guest page cache, host page cache, and writable state may remain pinned long after the CPU becomes idle. Under high-density overcommit, these resident costs directly limit cluster capacity, so memory sharing and reclamation become important platform requirements.

(3) **Agent 沙箱有状态且寿命长.** 模型会修改文件, 安装依赖, 启动服务, 之后的工具调用依赖这些累积下来的状态. 沙箱要跨越许多轮 LLM 交互一直存活, 所以在 CPU 闲下来之后很久, 内存占用, guest 页缓存, host 页缓存和可写状态仍可能一直驻留. 在高密度超卖下, 这些常驻开销直接限制集群容量, 内存共享与回收因此成为平台的重要需求.

(4) **Agent workloads are highly heterogeneous.** The platform must cover OJ-like script execution, software-engineering tasks over full repositories, security tasks, computer-use workloads, mobile development environments (e.g., Android), and other full-system environments. These workloads differ substantially in CPU and memory demand, dependency footprint, required system functionality, and isolation strength. A single sandbox abstraction cannot cover all of them efficiently. For example, lightweight function calls are preferable for short stateless tasks, whereas virtual machines (VMs) are better suited to workloads that require a complete commercial off-the-shelf operating system.

(4) **Agent 负载高度异构.** 平台要覆盖 OJ 式的脚本执行, 基于完整仓库的软件工程任务, 安全任务, computer-use 负载, 移动开发环境 (如 Android) 以及其他完整系统环境. 这些负载在 CPU 与内存需求, 依赖体量, 所需系统功能和隔离强度上差别很大, 单一的沙箱抽象没法高效地全部覆盖. 例如, 短小无状态的任务更适合轻量的函数调用, 需要完整商用现成操作系统的负载则更适合虚拟机 (VM).

(5) **Environment diversity is high even within the same workload class.** Training and evaluation corpora contain many tasks, and each task may require its own repository, dependency versions, services, toolkits, evaluation scripts, or VM snapshots. As a result, the platform must serve a large number of distinct images and environment artifacts, with limited reuse for many of them. Under bursty startup, fetching these diverse task images from a registry would concentrate load on the distribution path, inflate startup latency, and introduce extra I/O that interferes with already-running sandboxes. In our ablation, eager image pulling stretches completion time by 1.7×, while on-demand loading reduces cumulative disk writes by 57%.

(5) **同一类负载内部的环境多样性也很高.** 训练和评测语料里有大量任务, 每个任务可能需要自己的仓库, 依赖版本, 服务, 工具包, 评测脚本或 VM 快照. 结果是平台要提供数量庞大的不同镜像和环境制品, 其中很多复用很少. 突发启动时, 如果从镜像仓库拉取这些各不相同的任务镜像, 负载会集中到分发路径上, 拉长启动延迟, 并带来额外 I/O, 干扰已经在跑的沙箱. 在我们的消融里, 预先全量拉取镜像让完成时间变长到 1.7 倍, 按需加载则把累计磁盘写入量减少 57%.

(6) **Agent execution is untrustworthy.** Agents may corrupt filesystems, exhaust resources, or interfere with system components, potentially disrupting rollouts or other co-located workloads. The platform therefore requires fine-grained access control and misbehavior analysis to contain and diagnose agent-induced failures.

(6) **Agent 的执行不可信.** Agent 可能损坏文件系统, 耗尽资源或干扰系统组件, 进而打断 rollout 或同机的其他负载. 平台因此需要细粒度访问控制和不当行为分析, 来圈住并诊断 Agent 引发的故障.

(7) **Agent execution is interruptible.** GPU training jobs may be preempted while longrunning rollouts are still in progress. The platform must therefore preserve execution state and support efficient recovery across interruptions.

(7) **Agent 的执行会被打断.** 长时间运行的 rollout 还没结束, GPU 训练作业就可能被抢占. 平台必须保住执行状态, 并支持跨中断的高效恢复.

These properties define the role of an agent sandbox platform. DSec provides elastic service scaling, high-density resource management, memory sharing and reclamation, multiple isolation mechanisms for different workload classes, scalable image distribution, and explicit integration with the training framework for preemption-safe resumption, task-specific network policy, and agent misbehaving mitigation.

这些性质界定了 Agent 沙箱平台要承担的角色. DSec 提供弹性的服务扩展, 高密度资源管理, 内存共享与回收, 面向不同负载类别的多种隔离机制, 可扩展的镜像分发, 并与训练框架显式集成, 实现抢占安全的恢复, 任务专属的网络策略和 Agent 不当行为的缓解.

The rest of this report presents DSec from platform abstraction to implementation and evaluation. §2 introduces DSec from the user perspective, including supported workloads, sandbox backends, and operating scale. §3 describes the end-to-end platform architecture. §4 characterizes the production workload and the platform challenges it creates. §5 presents the core system mechanisms for environment composition, image distribution, and high-density resource management. §6 describes co-design with the RL framework for environment construction, state preservation, resource reclamation across preemption, and the analysis of agent misbehavior with targeted access-control mitigations. §7 summarizes additional implementation details. §8 evaluates the effectiveness of the design, and §9 discusses related works.

报告其余部分从平台抽象讲到实现和评测. §2 从用户视角介绍 DSec, 包括支持的负载, 沙箱后端和运行规…31668 tokens truncated…ess, 2024. ISBN 9798350352917. doi: 10.1109/SC41406.2024.00089. URL [https://doi.org/10.1109/SC41406.2024.00089](https://doi.org/10.1109/SC41406.2024.00089).

<!-- page 26 of 31 -->

Anomaly. OpenCode, 2025. URL [https://opencode.ai/](https://opencode.ai/).

F. Bellard. QEMU, a fast and portable dynamic translator. In 2005 USENIX Annual Technical Conference (USENIX ATC 05), Anaheim, CA, Apr. 2005. USENIX Association. URL [https://www.usenix.org/conference/2005-usenix-annual-technical-conference/qemu-fast-and-portable-dynamic-translator](https://www.usenix.org/conference/2005-usenix-annual-technical-conference/qemu-fast-and-portable-dynamic-translator).

J. Cadden, T. Unger, Y. Awad, H. Dong, O. Krieger, and J. Appavoo. Seuss: skip redundant paths to make serverless fast. In Proceedings of the Fifteenth European Conference on Computer Systems, EuroSys ’20, New York, NY, USA, 2020. Association for Computing Machinery. ISBN 9781450368827. doi: 10.1145/3342195.3392698. URL [https://doi.org/10.1145/3342195.3392698](https://doi.org/10.1145/3342195.3392698).

C. che Tsai, D. E. Porter, and M. Vij. Graphene-SGX: A practical library OS for unmodified applications on SGX. In 2017 USENIX Annual Technical Conference (USENIX ATC 17), pages 645–658, Santa Clara, CA, July 2017. USENIX Association. ISBN 978-1-931971-38-6. URL [https://www.usenix.org/conference/atc17/technical-sessions/presentation/tsai](https://www.usenix.org/conference/atc17/technical-sessions/presentation/tsai).

N. Dautenhahn, T. Kasampalis, W. Dietz, J. Criswell, and V. Adve. Nested kernel: An operating system architecture for intra-kernel privilege separation. In Proceedings of the Twentieth International Conference on Architectural Support for Programming Languages and Operating Systems, ASPLOS ’15, New York, NY, USA, 2015. Association for Computing Machinery. ISBN 9781450328357. doi: 10.1145/2694344.2694386. URL [https://doi.org/10.1145/2694344.2694386](https://doi.org/10.1145/2694344.2694386).

DeepSeek-AI. Fire-flyer file sytem. URL [https://github.com/deepseek-ai/3fs](https://github.com/deepseek-ai/3fs).

DeepSeek-AI. Deepseek-v3.2: Pushing the frontier of open large language models, 2025. URL [https://arxiv.org/abs/2512.02556](https://arxiv.org/abs/2512.02556).

DeepSeek-AI. Deepseek-v4.1-flash: Pushing the limits of kv cache compression, 2026. URL [https://arxiv.org/abs/2609.19969](https://arxiv.org/abs/2609.19969).

Dragonfly Community. Nydus: Dragonfly container image service, 2020. URL [https://github.com/dragonflyoss/nydus](https://github.com/dragonflyoss/nydus).

DXVK. DXVK: A vulkan-based implementation of direct3d 8/9/10/11. [https://github.com/doitsujin/dxvk](https://github.com/doitsujin/dxvk), 2018.

E2B. E2B: Open-source secure sandboxes for AI code execution, 2024. URL [https://github.com/e2b-dev/E2B](https://github.com/e2b-dev/E2B).

P. K. Gadepalli, S. McBride, G. Peach, L. Cherkasova, and G. Parmer. Sledge: a serverlessfirst, light-weight wasm runtime for the edge. In Proceedings of the 21st International Middleware Conference, Middleware ’20, page 265–279, New York, NY, USA, 2020. Association for Computing Machinery. ISBN 9781450381536. doi: 10.1145/3423211.3425680. URL [https://doi.org/10.1145/3423211.3425680](https://doi.org/10.1145/3423211.3425680).

X. Gao, M. Dong, X. Miao, W. Du, C. Yu, and H. Chen. EROFS: A compression-friendly readonly file system for resource-scarce devices. In 2019 USENIX Annual Technical Conference (USENIX ATC 19), pages 149–162, Renton, WA, July 2019. USENIX Association. ISBN 978-1-939133-03-8. URL [http://www.usenix.org/conference/atc19/presentation/gao](http://www.usenix.org/conference/atc19/presentation/gao).

<!-- page 27 of 31 -->

D. Guo, D. Yang, H. Zhang, J. Song, P. Wang, Q. Zhu, R. Xu, R. Zhang, S. Ma, X. Bi, X. Zhang, X. Yu, Y. Wu, Z. F. Wu, Z. Gou, Z. Shao, Z. Li, Z. Gao, A. Liu, B. Xue, B. Wang, B. Wu, B. Feng, C. Lu, C. Zhao, C. Deng, C. Ruan, D. Dai, D. Chen, D. Ji, E. Li, F. Lin, F. Dai, F. Luo, G. Hao, G. Chen, G. Li, H. Zhang, H. Xu, H. Ding, H. Gao, H. Qu, H. Li, J. Guo, J. Li, J. Chen, J. Yuan, J. Tu, J. Qiu, J. Li, J. L. Cai, J. Ni, J. Liang, J. Chen, K. Dong, K. Hu, K. You, K. Gao, K. Guan, K. Huang, K. Yu, L. Wang, L. Zhang, L. Zhao, L. Wang, L. Zhang, L. Xu, L. Xia, M. Zhang, M. Zhang, M. Tang, M. Zhou, M. Li, M. Wang, M. Li, N. Tian, P. Huang, P. Zhang, Q. Wang, Q. Chen, Q. Du, R. Ge, R. Zhang, R. Pan, R. Wang, R. J. Chen, R. L. Jin, R. Chen, S. Lu, S. Zhou, S. Chen, S. Ye, S. Wang, S. Yu, S. Zhou, S. Pan, S. S. Li, S. Zhou, S. Wu, T. Yun, T. Pei, T. Sun, T. Wang, W. Zeng, W. Liu, W. Liang, W. Gao, W. Yu, W. Zhang, W. L. Xiao, W. An, X. Liu, X. Wang, X. Chen, X. Nie, X. Cheng, X. Liu, X. Xie, X. Liu, X. Yang, X. Li, X. Su, X. Lin, X. Q. Li, X. Jin, X. Shen, X. Chen, X. Sun, X. Wang, X. Song, X. Zhou, X. Wang, X. Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Y. Zhang, Y. Xu, Y. Li, Y. Zhao, Y. Sun, Y. Wang, Y. Yu, Y. Zhang, Y. Shi, Y. Xiong, Y. He, Y. Piao, Y. Wang, Y. Tan, Y. Ma, Y. Liu, Y. Guo, Y. Ou, Y. Wang, Y. Gong, Y. Zou, Y. He, Y. Xiong, Y. Luo, Y. You, Y. Liu, Y. Zhou, Y. X. Zhu, Y. Huang, Y. Li, Y. Zheng, Y. Zhu, Y. Ma, Y. Tang, Y. Zha, Y. Yan, Z. Z. Ren, Z. Ren, Z. Sha, Z. Fu, Z. Xu, Z. Xie, Z. Zhang, Z. Hao, Z. Ma, Z. Yan, Z. Wu, Z. Gu, Z. Zhu, Z. Liu, Z. Li, Z. Xie, Z. Song, Z. Pan, Z. Huang, Z. Xu, Z. Zhang, and Z. Zhang. Deepseek-r1 incentivizes reasoning in llms through reinforcement learning. <u>Nature</u>, 645(8081):633–638, Sep 2025. ISSN 1476-4687. doi: 10.1038/s41586-025-09422-z. URL [https://doi.org/10.1038/s41586-025-09422-z](https://doi.org/10.1038/s41586-025-09422-z).

J. Hu. Reinforce++: A simple and efficient approach for aligning large language models. arXiv preprint arXiv:2501.03262, 2026.

J. Hu, X. Wu, W. Shen, J. K. Liu, Z. Zhu, W. Wang, S. Jiang, H. Wang, H. Chen, B. Chen, W. Fang, Xianyu, Y. Cao, H. Xu, and Y. Liu. Openrlhf: An easy-to-use, scalable and high-performance rlhf framework, 2025. URL [https://arxiv.org/abs/2405.11143](https://arxiv.org/abs/2405.11143).

H. Huang, J. Lai, J. Rao, H. Lu, W. Hou, H. Su, Q. Xu, J. Zhong, J. Zeng, X. Wang, Z. He, W. Han, J. Liu, T. Ma, and S. Wu. Pvm: Efficient shadow paging for deploying secure containers in cloud-native environment. In Proceedings of the 29th Symposium on Operating Systems Principles, SOSP ’23, page 515–530, New York, NY, USA, 2023. Association for Computing Machinery. ISBN 9798400702297. doi: 10.1145/3600006.3613158. URL [https://doi.org/10.1145/3600006.3613158](https://doi.org/10.1145/3600006.3613158).

J. Huang, M. Zhang, T. Ma, Z. Liu, S. Lin, K. Chen, J. Jiang, X. Liao, Y. Shan, N. Zhang, M. Lu, T. Ma, H. Gong, and Y. Wu. Trenv: Transparently share serverless execution environments across different functions and nodes. In Proceedings of the ACM SIGOPS 30th Symposium on Operating Systems Principles, SOSP ’24, page 421–437, New York, NY, USA, 2024. Association for Computing Machinery. ISBN 9798400712517. doi: 10.1145/3694715.3695967. URL [https://doi.org/10.1145/3694715.3695967](https://doi.org/10.1145/3694715.3695967).

C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. R. Narasimhan. Swe-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

Kata Containers. Kata Containers: Secure Containers with Lightweight Virtual Machines. [https://katacontainers.io/](https://katacontainers.io/), 2017.

Kimi Team. Kimi K2.5: Visual agentic intelligence, 2026.

<!-- page 28 of 31 -->

H. Lai, X. Liu, Y. Zhao, H. Xu, H. Zhang, B. Jing, Y. Ren, S. Yao, Y. Dong, and J. Tang. ComputerRL: Scaling end-to-end online reinforcement learning for computer use agents, 2025.

H. Li, Y. Yuan, R. Du, K. Ma, L. Liu, and W. Hsu. DADI: Block-Level image service for agile and elastic application deployment. In 2020 USENIX Annual Technical Conference (USENIX ATC 20), pages 727–740. USENIX Association, July 2020. ISBN 978-1-939133-14-4. URL [https://www.usenix.org/conference/atc20/presentation/li-huiba](https://www.usenix.org/conference/atc20/presentation/li-huiba).

Z. Li, J. Cheng, Q. Chen, E. Guan, Z. Bian, Y. Tao, B. Zha, Q. Wang, W. Han, and M. Guo. RunD: A lightweight secure container runtime for high-density deployment and high-concurrency startup in serverless computing. In 2022 USENIX Annual Technical Conference (USENIX ATC 22), pages 53–68, Carlsbad, CA, July 2022. USENIX Association. ISBN 978-1-939133-29-27. URL [https://www.usenix.org/conference/atc22/presentation/li-zijun-rund](https://www.usenix.org/conference/atc22/presentation/li-zijun-rund).

LiteBox. Litebox: A security-focused library os supporting kernel- and user-mode execution. [https://github.com/microsoft/litebox](https://github.com/microsoft/litebox), 2025.

M. A. Merrill, A. G. Shaw, N. Carlini, B. Li, H. Raj, I. Bercovich, L. Shi, J. Y. Shin, T. Walshe, E. K. Buchanan, J. Shen, G. Ye, H. Lin, J. Poulos, M. Wang, M. Nezhurina, J. Jitsev, D. Lu, O. M. Mastromichalakis, Z. Xu, Z. Chen, Y. Liu, R. Zhang, L. L. Chen, A. Kashyap, J.-L. Uslu, J. Li, J. Wu, M. Yan, S. Bian, V. Sharma, K. Sun, S. Dillmann, A. Anand, A. Lanpouthakoun, B. Koopah, C. Hu, E. Guha, G. H. S. Dreiman, J. Zhu, K. Krauth, L. Zhong, N. Muennighoff, R. Amanfu, S. Tan, S. Pimpalgaonkar, T. Aggarwal, X. Lin, X. Lan, X. Zhao, Y. Liang, Y. Wang, Z. Wang, C. Zhou, D. Heineman, H. Liu, H. Trivedi, J. Yang, J. Lin, M. Shetty, M. Yang, N. Omi, N. Raoof, S. Li, T. Y. Zhuo, W. Lin, Y. Dai, Y. Wang, W. Chai, S. Zhou, D. Wahdany, Z. She, J. Hu, Z. Dong, Y. Zhu, S. Cui, A. Saiyed, A. Kolbeinsson, J. Hu, C. M. Rytting, R. Marten, Y. Wang, A. Dimakis, A. Konwinski, and L. Schmidt. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces, 2026. URL [https://arxiv.org/abs/2601.11868](https://arxiv.org/abs/2601.11868).

M. Mitzenmacher. The power of two choices in randomized load balancing. IEEE Transactions on Parallel and Distributed Systems, 12(10):1094–1104, 2001. doi: 10.1109/71.963420.

Moby Project. The Moby Project, 2026. URL [https://github.com/moby/moby](https://github.com/moby/moby).

Open Container Initiative. Open Container Initiative Image Format Specification, 2026. URL [https://github.com/opencontainers/image-spec](https://github.com/opencontainers/image-spec).

OpenAI. Code interpreter: Agent harness and sandbox for code execution, 2025. URL [https://platform.openai.com/docs/guides/code-interpreter](https://platform.openai.com/docs/guides/code-interpreter).

OpenAI, J. Achiam, S. Adler, S. Agarwal, L. Ahmad, I. Akkaya, F. L. Aleman, D. Almeida, J. Altenschmidt, S. Altman, S. Anadkat, R. Avila, I. Babuschkin, S. Balaji, V. Balcom, P. Baltescu, H. Bao, M. Bavarian, J. Belgum, I. Bello, J. Berdine, G. Bernadett-Shapiro, C. Berner, L. Bogdonoff, O. Boiko, M. Boyd, A.-L. Brakman, G. Brockman, T. Brooks, M. Brundage, K. Button, T. Cai, R. Campbell, A. Cann, B. Carey, C. Carlson, R. Carmichael, B. Chan, C. Chang, F. Chantzis, D. Chen, S. Chen, R. Chen, J. Chen, M. Chen, B. Chess, C. Cho, C. Chu, H. W. Chung, D. Cummings, J. Currier, Y. Dai, C. Decareaux, T. Degry, N. Deutsch, D. Deville, A. Dhar, D. Dohan, S. Dowling, S. Dunning, A. Ecoffet, A. Eleti, T. Eloundou, D. Farhi, L. Fedus, N. Felix, S. P. Fishman, J. Forte, I. Fulford, L. Gao, E. Georges, C. Gibson, V. Goel, T. Gogineni, G. Goh, R. Gontijo-Lopes, J. Gordon, M. Grafstein, S. Gray, R. Greene, J. Gross, S. S. Gu, Y. Guo, C. Hallacy, J. Han, J. Harris, Y. He, M. Heaton, J. Heidecke, C. Hesse, A. Hickey,

<!-- page 29 of 31 -->

W. Hickey, P. Hoeschele, B. Houghton, K. Hsu, S. Hu, X. Hu, J. Huizinga, S. Jain, S. Jain, J. Jang, A. Jiang, R. Jiang, H. Jin, D. Jin, S. Jomoto, B. Jonn, H. Jun, T. Kaftan, Ł. Kaiser, A. Kamali, I. Kanitscheider, N. S. Keskar, T. Khan, L. Kilpatrick, J. W. Kim, C. Kim, Y. Kim, J. H. Kirchner, J. Kiros, M. Knight, D. Kokotajlo, Ł. Kondraciuk, A. Kondrich, A. Konstantinidis, K. Kosic, G. Krueger, V. Kuo, M. Lampe, I. Lan, T. Lee, J. Leike, J. Leung, D. Levy, C. M. Li, R. Lim, M. Lin, S. Lin, M. Litwin, T. Lopez, R. Lowe, P. Lue, A. Makanju, K. Malfacini, S. Manning, T. Markov, Y. Markovski, B. Martin, K. Mayer, A. Mayne, B. McGrew, S. M. McKinney, C. McLeavey, P. McMillan, J. McNeil, D. Medina, A. Mehta, J. Menick, L. Metz, A. Mishchenko, P. Mishkin, V. Monaco, E. Morikawa, D. Mossing, T. Mu, M. Murati, O. Murk, D. Mély, A. Nair, R. Nakano, R. Nayak, A. Neelakantan, R. Ngo, H. Noh, L. Ouyang, C. O’Keefe, J. Pachocki, A. Paino, J. Palermo, A. Pantuliano, G. Parascandolo, J. Parish, E. Parparita, A. Passos, M. Pavlov, A. Peng, A. Perelman, F. de Avila Belbute Peres, M. Petrov, H. P. de Oliveira Pinto, Michael, Pokorny, M. Pokrass, V. H. Pong, T. Powell, A. Power, B. Power, E. Proehl, R. Puri, A. Radford, J. Rae, A. Ramesh, C. Raymond, F. Real, K. Rimbach, C. Ross, B. Rotsted, H. Roussez, N. Ryder, M. Saltarelli, T. Sanders, S. Santurkar, G. Sastry, H. Schmidt, D. Schnurr, J. Schulman, D. Selsam, K. Sheppard, T. Sherbakov, J. Shieh, S. Shoker, P. Shyam, S. Sidor, E. Sigler, M. Simens, J. Sitkin, K. Slama, I. Sohl, B. Sokolowsky, Y. Song, N. Staudacher, F. P. Such, N. Summers, I. Sutskever, J. Tang, N. Tezak, M. B. Thompson, P. Tillet, A. Tootoonchian, E. Tseng, P. Tuggle, N. Turley, J. Tworek, J. F. C. Uribe, A. Vallone, A. Vijayvergiya, C. Voss, C. Wainwright, J. J. Wang, A. Wang, B. Wang, J. Ward, J. Wei, C. Weinmann, A. Welihinda, P. Welinder, J. Weng, L. Weng, M. Wiethoff, D. Willner, C. Winter, S. Wolrich, H. Wong, L. Workman, S. Wu, J. Wu, M. Wu, K. Xiao, T. Xu, S. Yoo, K. Yu, Q. Yuan, W. Zaremba, R. Zellers, C. Zhang, M. Zhang, S. Zhao, T. Zheng, J. Zhuang, W. Zhuk, and B. Zoph. Gpt-4 technical report, 2024. URL [https://arxiv.org/abs/2303.08774](https://arxiv.org/abs/2303.08774).

L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. L. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, J. Schulman, J. Hilton, F. Kelton, L. Miller, M. Simens, A. Askell, P. Welinder, P. Christiano, J. Leike, and R. Lowe. Training language models to follow instructions with human feedback. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS ’22, Red Hook, NY, USA, 2022. Curran Associates Inc. ISBN 9781713871088.

S. Park, J. Ahn, H. Y. Kim, and Y. Lee. Profiling dynamic data access patterns with controlled overhead and quality. In Proceedings of the 20th International Middleware Conference Industrial Track (Middleware ’19), pages 29–30, 2019. doi: 10.1145/3366626.3368125.

QEMU Project. VirtIO Persistent Memory, 2026. URL [https://www.qemu.org/docs/master/system/devices/virtio/virtio-pmem.html](https://www.qemu.org/docs/master/system/devices/virtio/virtio-pmem.html).

R. Qin, W. He, W. Huang, Y. Zhang, Y. Zhao, B. Pang, X. Xu, Y. Shan, Y. Wu, and M. Zhang. Seer: Online context learning for fast synchronous llm reinforcement learning, 2026. URL [https://arxiv.org/abs/2511.14617](https://arxiv.org/abs/2511.14617).

G. Sheng, C. Zhang, Z. Ye, X. Wu, W. Zhang, R. Zhang, Y. Peng, H. Lin, and C. Wu. Hybridflow: A flexible and efficient rlhf framework. In Proceedings of the Twentieth European Conference on Computer Systems, EuroSys ’25, page 1279–1297, New York, NY, USA, 2025. Association for Computing Machinery. ISBN 9798400711961. doi: 10.1145/3689031.3696075. URL [https://doi.org/10.1145/3689031.3696075](https://doi.org/10.1145/3689031.3696075).

Y. Shi, W. Zhang, and T. Cui. A programming paradigm for spatiotemporal composability, 2026. URL [https://arxiv.org/abs/2608.25512](https://arxiv.org/abs/2608.25512).

<!-- page 30 of 31 -->

S. Shillaker and P. Pietzuch. Faasm: Lightweight isolation for efficient stateful serverless computing. In 2020 USENIX Annual Technical Conference (USENIX ATC 20), pages 419–433. USENIX Association, July 2020. ISBN 978-1-939133-14-4. URL [https://www.usenix.org/conference/atc20/presentation/shillaker](https://www.usenix.org/conference/atc20/presentation/shillaker).

J. Skalse, N. H. R. Howe, D. Krasheninnikov, and D. Krueger. Defining and characterizing reward hacking. In Proceedings of the 36th International Conference on Neural Information Processing Systems, NIPS ’22, Red Hook, NY, USA, 2022. Curran Associates Inc. ISBN 9781713871088.

D. Ustiugov, P. Petrov, M. Kogias, E. Bugnion, and B. Grot. Benchmarking, analysis, and optimization of serverless function snapshots. In Proceedings of the 26th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, ASPLOS ’21, page 559–572, New York, NY, USA, 2021. Association for Computing Machinery. ISBN 9781450383172. doi: 10.1145/3445814.3446714. URL [https://doi.org/10.1145/3445814.3446714](https://doi.org/10.1145/3445814.3446714).

C. A. Waldspurger. Memory resource management in VMware ESX server. In 5th Symposium on Operating Systems Design and Implementation (OSDI 02), Boston, MA, Dec. 2002. USENIX Association. URL [https://www.usenix.org/conference/osdi-02/memory-resource-management-vmware-esx-server](https://www.usenix.org/conference/osdi-02/memory-resource-management-vmware-esx-server).

A. Wang, S. Chang, H. Tian, H. Wang, H. Yang, H. Li, R. Du, and Y. Cheng. FaaSNet: Scalable and fast provisioning of custom serverless container runtimes at alibaba cloud function compute. In 2021 USENIX Annual Technical Conference (USENIX ATC 21), pages 443–457. USENIX Association, July 2021. ISBN 978-1-939133-23-6. URL [https://www.usenix.org/conference/atc21/presentation/wang-ao](https://www.usenix.org/conference/atc21/presentation/wang-ao).

L. Wang, J. Du, Y. Yang, Q. Wu, T. Liu, and H. Wu. CoFS: A filesystem for fast container startup. In 24th USENIX Conference on File and Storage Technologies (FAST 26), pages 415–423, Santa Clara, CA, Feb. 2026. USENIX Association. ISBN 978-1-939133-53-3. URL [https://www.usenix.org/conference/fast26/presentation/wang-li](https://www.usenix.org/conference/fast26/presentation/wang-li).

Xiaomi LLM-Core Team. MiMo-V2-Flash technical report, 2026.

T. Xie, D. Zhang, J. Chen, X. Li, S. Zhao, R. Cao, T. J. Hua, Z. Cheng, D. Shin, F. Lei, Y. Liu, Y. Xu, S. Zhou, S. Savarese, C. Xiong, V. Zhong, and T. Yu. Osworld: Benchmarking multi-modal agents for open-ended tasks in real computer environments. In Advances in Neural Information Processing Systems, 2024. doi: 10.52202/079017-1650.

C. Zhang, R. Priolkar, Y. Jiang, Y. Xiao, M. Vij, Z. Liang, and A. Ahmad. Erebor: A drop-in sandbox solution for private data processing in untrusted confidential virtual machines. In Proceedings of the Twentieth European Conference on Computer Systems, EuroSys ’25, New York, NY, USA, 2025. Association for Computing Machinery. ISBN 9798400711961. doi: 10.1145/3689031.3717464. URL [https://doi.org/10.1145/3689031.3717464](https://doi.org/10.1145/3689031.3717464).

S. Zhou, F. F. Xu, H. Zhu, X. Zhou, R. Lo, A. Sridhar, X. Cheng, T. Ou, Y. Bisk, D. Fried, U. Alon, and G. Neubig. Webarena: A realistic web environment for building autonomous agents. In International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=oKn9c6ytLx](https://openreview.net/forum?id=oKn9c6ytLx).

Z. Zhu, C. Xie, X. Lv, and slime Contributors. slime: An llm post-training framework for rl scaling. [https://github.com/THUDM/slime](https://github.com/THUDM/slime), 2025.

<!-- page 31 of 31 -->

P. Zijlstra, J. Fernandes, and V. Pillai. Core scheduling, 2021. URL [https://docs.kernel.org/admin-guide/hw-vuln/core-scheduling.html](https://docs.kernel.org/admin-guide/hw-vuln/core-scheduling.html).
