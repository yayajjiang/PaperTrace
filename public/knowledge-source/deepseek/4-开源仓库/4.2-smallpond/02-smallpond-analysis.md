---
title: "02 · smallpond 技术解析: 每个分区一个 DuckDB, 中间数据全落 3FS"
category: "开源仓库"
tags: ["DeepSeek", "技术解析", "开源仓库", "smallpond", "DuckDB", "Ray", "3FS", "数据处理"]
published: true
excerpt: "smallpond 把 PB 级数据处理拆成大量独立的 DuckDB 任务, 分区由用户手动指定, 任务之间只通过 3FS 上的 parquet 文件交接. 按源码梳理逻辑计划, 生产者与消费者两层分区, Ray 与内置调度器两条执行路径, DuckDB 算子的资源设置, GraySort 110.5 TiB 的配置推导, 以及适用边界和代码与文档的出入."
---

# smallpond 技术解析: 每个分区一个 DuckDB, 中间数据全落 3FS

来源: [deepseek-ai/smallpond](https://github.com/deepseek-ai/smallpond), 2025-02-28 随 DeepSeek 开源周第五天与 3FS 一起公开, 首个提交 `770aa41` 日期为 2025-02-25. 唯一的版本 tag 是 `v0.15.0`, 指向首个提交, `pyproject.toml` 的版本号同为 0.15.0; `main` 分支最新提交是 2025-03-05 的 `52ecc5e` (代码格式化), 此后没有更新. 许可证 MIT. 文档的逐段对照见 [smallpond 文档对照译稿](./01-smallpond-bi.md), 底层存储见 [3FS 技术解析](../4.1-3fs/02-3fs-analysis.md). 源码链接均按 `main` 分支核对.

## 1. 定位: 单机 DuckDB 加共享存储

### 1.1 要解决的瓶颈

大模型训练前的数据准备 (去重, 过滤, 打分, 混合, 打乱) 动辄 PB 级. 常见做法是 Spark, 它有完整的 shuffle 服务, 内存管理和容错, 也带来 JVM, 常驻集群和调参成本. DuckDB 是另一端: 单进程, 向量化执行, 读写 parquet 很快, 但只能用一台机器的核和内存. smallpond 的做法是在两者之间取一个最小方案: 数据按用户指定的规则切成很多分区, 每个分区交给一个独立的 DuckDB 进程处理, 任务之间不直接通信, 只通过共享文件系统上的 parquet 文件交接.

这套做法依赖一个前提: 共享存储的带宽足够大, 让「每一步都落盘」的代价可以接受. DeepSeek 内部有 3FS, 计算节点每台可以读写 20 GiB/s 以上, 数百台存储节点的聚合带宽是 TiB/s 量级. 有了这样的存储, 框架可以省掉 Spark 里最复杂的几块: 没有 shuffle 服务 (中间结果就是文件), 没有溢写逻辑 (单个任务的数据量由分区数控制在内存以内), 失败重试也简单 (重跑一个任务只需重新读它的输入文件). README 的三条卖点「DuckDB 带来的性能」「可扩展到 PB 级」「没有常驻服务」都来自这个前提.

### 1.2 两套 API 与组件

仓库里有两套入口, 文档承认是历史原因. 高层 API 以 `DataFrame` 为中心 ([smallpond/dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/dataframe.py)), `smallpond.init()` 建会话, 读入数据后链式调用 `repartition`, `map`, `filter`, `partial_sql`, 遇到 `write_parquet`, `to_pandas` 等操作才执行, 后端是 Ray. 低层 API 由用户手工创建节点组成 `LogicalPlan`, 交给 `Driver().run(plan)`, 后端是内置调度器, 只能一次性执行一张静态图. 文档说低层 API 优化更多, 配置更丰富, 推荐的却是 DataFrame.

两条路径共享同一套中间层: 节点 (`smallpond/logical/node.py`) 描述逻辑操作, 优化器 (`smallpond/logical/optimizer.py`) 做节点合并, 规划器 (`smallpond/logical/planner.py`) 把节点展开成任务, 任务 (`smallpond/execution/task.py`, 约 3200 行) 负责真正读写数据. 差别只在任务怎样被分发: Ray 路径把每个任务包成 `@ray.remote` 函数, 内置路径用文件队列把任务推给执行器进程. 这种分层让低层 API 写的计划也能跑在 Ray 上, `Driver` 的 `ray` 模式就是把计划根节点包成 DataFrame 再调 `compute()`.

### 1.3 和 MapReduce, Spark 放在一起看

从数据流的形态看, smallpond 加 3FS 更接近 MapReduce 加 GFS: 计算节点从分布式文件系统读输入, 写输出, shuffle 的中间数据也写回同一个文件系统. [Eventual 的文章](https://www.eventual.ai/blog/deepseek-smallpond-3fs)指出了两者的一个差别: MapReduce 把 map 端的中间结果写在计算节点本地盘, reduce 端再远程拉取, smallpond 没有这层本地化, 中间数据一律写到 3FS. 这让计算节点完全无状态, 任何一台挂了都不丢中间结果, 代价是 shuffle 流量要过两次网络 (写到存储, 再从存储读出), 对存储带宽的要求翻倍.

和 Spark 比, 最大的功能差距在查询规划. [reata 的源码分析](https://reata.github.io/blog/smallpond-review/)强调, smallpond 不会把一条 SQL 自动拆成带 shuffle 的多阶段任务, `partial_sql` 只在每个分区上各跑一次; 用户选错分区键, 聚合或 join 的结果就是错的, 框架不会报警. [火山引擎的实践文章](https://developer.volcengine.com/articles/7480808856298192934)给了另一个视角: 两套后端里 Ray 明显快于内置调度器, 原因是内置调度器派发任务要把序列化的任务对象写进共享存储的队列目录, 再由执行器轮询读取; 他们还把存储换成 TOS 的 fsspec 或 FUSE 接口跑通了 smallpond, 说明它和 3FS 的耦合很松, 只是换了存储之后速度不同. 在 Spark 的位置上, smallpond 用「用户自己负责分区正确性」换来了极小的代码量: 逻辑层和执行层合计约 1 万行 Python.

## 2. 执行模型: 逻辑计划, 分区与调度

### 2.1 节点, 逻辑计划与 SQL 合并

每个 DataFrame 内部只持有一个节点和会话引用. `read_parquet` 生成 `DataSourceNode`, `repartition` 按参数生成三种分区节点之一, 字符串形式的 `map` / `filter` / `partial_sort` / `partial_sql` 都生成 `SqlEngineNode`, 函数形式的 `map` / `filter` / `flat_map` / `map_batches` 生成 `ArrowBatchNode`, `write_parquet_lazy` 生成 `DataSinkNode`. 节点之间以 `input_deps` 相连, 构成一张 DAG. SQL 节点的查询串里用 `{0}`, `{1}` 引用第几个输入, 执行时替换成 DuckDB 视图名; `filter('a > 1')` 实际是 `select * from {0} where (a > 1)`, `map('a + b as c')` 是 `select a + b as c from {0}`.

求值前, `Optimizer` 遍历计划做唯一一种优化: 若一个 `SqlEngineNode` 的唯一输入也是 `SqlEngineNode`, 就把下层查询塞进上层的 `{0}` 位置成为子查询, 合成一个节点 (`visit_query_engine_node`). 合并后的 CPU 和内存上限取两者较大值, UDF 列表拼接. 这样 `filter` 接 `map` 接 `partial_sort` 只跑一轮 DuckDB, 中间不落盘. lambda 写法生成的 `ArrowBatchNode` 会打断合并. 优化器还接受一个 `exclude_nodes` 集合, 已经求值过的节点不再改写, 让同一会话里后续 DataFrame 复用已有任务 (`Session._node_to_tasks`).

### 2.2 分区: 生产者与消费者两层任务

分区是 smallpond 唯一的数据重分布手段, 而且必须手动指定. `repartition(n)` 按文件均分, `repartition(n, by_rows=True)` 按行区间均分, `repartition(n, hash_by=列)` 按列哈希, `repartition(n, by=列)` 按某列里已经算好的分区号直接分发. 规划器对所有分区节点用同一套展开规则 ([smallpond/logical/planner.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/logical/planner.py) 的 `visit_partition_node`): 先生成若干生产者任务, 每个生产者把自己那份输入切成 $n$ 份写出; 再生成 $n$ 个消费者任务, 第 $i$ 个消费者收集所有生产者的第 $i$ 份. 消费者 (`PartitionConsumerTask`) 只拼文件列表, 不读写数据, 下游任务拿到的就是一串文件路径.

生产者任务数 $P$ 的取法是:

$$
P = \max\left(1, \min\left(P_{\max}, \left\lceil \frac{4096000}{n} \right\rceil, 2 E \left\lceil \frac{C}{c} \right\rceil\right)\right)
$$

式中 $n$ 是分区数, $P_{\max}$ 是节点类型的上限 (`HashPartitionNode` 为 1000, 均匀分区节点为 1, 加载已分区数据为 10), $E$ 是执行器数, $C$ 是每台可用核数, $c$ 是任务的 `cpu_limit`. 常数 4096000 限制 $P \times n$, 也就是这一步产生的中间文件组数. 上游任务数多于 $P$ 时, 规划器把它们按行分成 $P$ 组, 每组一个 `MergeDataSetsTask`; 少于 $P$ 时先合并成一个, 再用 `SplitDataSetTask` 切成 $P$ 份. 均匀分区的 $P_{\max}$ 为 1, 所以 `repartition(n)` 只有一个生产者, 它只改文件列表的归属, 不搬数据. 节点还支持 `nested=True` 的嵌套分区: 在每个已有分区内部再切 $n$ 份, 分区维度叠加, docstring 引用的出处是 SIGMOD 2012 论文 Advanced partitioning techniques for massively distributed computation 的 5.1 节.

### 2.3 Ray 路径: 远程函数与标记文件

高层 API 求值时, 规划器为优化后的计划生成任务列表, 然后对每个任务调 `Task.run_on_ray` ([smallpond/execution/task.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/task.py)). 这个方法递归地对输入任务调 `run_on_ray` 拿到 `ObjectRef`, 再以 `num_cpus=cpu_limit`, `memory=memory_limit` 提交一个 `@ray.remote` 函数 `exec_task`, 依赖关系完全交给 Ray 的对象依赖去排. 任务的返回值是输出数据集对象, 里面只有文件路径和元信息, 经 Ray 对象存储传给下游, 体积很小. 数据本身在共享文件系统上, 所以 Ray 调度时不需要考虑数据局部性.

容错靠两类文件. 执行前, `exec_task` 在 `staging/started_tasks/` 下探测 `<节点>.<任务>.<重试号>` 标记文件, 已存在就把重试号加一, 超过 `DEFAULT_MAX_RETRY_COUNT` (5) 就放弃, 然后创建当前重试号的标记; 执行成功后把输出数据集原子写成 `staging/completed_tasks/<节点>/<任务>.pickle`. 下次 `run_on_ray` 看到这个文件, 直接读出结果, 不再执行, 这就是文档说的任务级检查点. 两点副作用文档没有写: 一是作业目录名由 `job_time.job_id` 组成, 默认每次运行都是新目录, 想续跑必须用 `SP_JOBID` 和 `SP_JOB_TIME` 固定; 二是标记文件跨会话累积, 同一作业目录重跑超过 5 次的任务会直接报错. 另外 `DataFrame._compute` 会捕获 Ray 的 `RuntimeEnvSetupError` 重试 3 次, 间隔 10, 20, 40 秒, 注释写明这是 Ray 2.24 已修的 bug, 因为 Ray 从 2.11 起不再支持 Python 3.8, 项目没法升级.

### 2.4 内置调度器: 文件队列, 推测执行与资源提升

低层 API 的 `Driver` 有三种模式. `scheduler` 模式构造 `JobManager`, 把运行时上下文和执行计划 pickle 到 `config/`, 通过平台拉起执行器, 再在本进程运行 `Scheduler`; `executor` 模式读回上下文, 起执行器轮询队列, 开 NUMA 绑定时每个 NUMA 节点一个进程. 调度器和执行器之间没有 RPC, 每个执行器在 `queue/<执行器 id>/` 下有一对基于文件的工作队列 ([smallpond/execution/workqueue.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/workqueue.py) 的 `WorkQueueOnFilesystem`), 调度器扫描这个目录发现新执行器, 定期往每个队列推一个 `Probe`, 执行器回报 CPU, 内存和负载; 连续丢失的探测数超过阈值就判执行器失败, 其上运行的任务重新入队 ([smallpond/execution/scheduler.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/scheduler.py) 的 `update_executor_states`).

内置调度器比 Ray 路径多了三种优化. 推测执行 (`start_speculative_execution`, 默认开启): 同一逻辑节点已完成 20 个以上任务后, 若某个运行中任务的耗时超过中位数一定阈值, 就在别的执行器上再发一份; 阈值在调度队列较短时取 p95 与 p50 之差, 否则取 p99 与 p50 之差并随重试次数放大, 且不低于探测超时. 资源提升 (`try_boost_resource`): 任务派发时若执行器有空闲, 把它的 CPU 和内存上限各提到原来的两倍以内, 但不超过整机一半. OOM 放宽 (`try_relax_memory_limit`): 任务因内存不足失败后, 内存上限翻倍 (不超过整机) 再试. 此外 `Driver` 的内存分配器默认 mimalloc, 可选 jemalloc; 高层 API 默认用系统分配器, 启动 Ray 时通过环境变量把 Arrow IO, OpenMP, Polars 的线程数压到 2 ([smallpond/session.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/session.py)), 避免同一台机器上的多个任务各自开满线程.

## 3. 算子: 一个任务里的 DuckDB

### 3.1 SqlEngineTask 的资源与输出设置

每个 SQL 任务开一个内存数据库 `duckdb.connect(":memory:")`, 由 `ExecSqlQueryMixin.prepare_connection` 设置: 线程数 `threads` 为 $\lceil c \cdot r_c \rceil$, 内存上限 `memory_limit` 为 $m \cdot r_m$, 其中 $c$, $m$ 是任务的 CPU 和内存上限, $r_c$, $r_m$ 是超额系数 (`SqlEngineNode` 默认 1.0 和 0.9); 同时关闭 `preserve_insertion_order`, 打开 `enable_object_cache`, 默认不设临时目录, 也就是不溢写. 输入数据集展开成视图, parquet 输入是一条 `read_parquet([path1, path2, ...], union_by_name=...)`, 查询结果用 `COPY ... TO ... (FORMAT PARQUET, PER_THREAD_OUTPUT true, ...)` 直接写成 parquet, 默认 ZSTD 3 级压缩, 行组 122880 行 ([smallpond/execution/task.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/task.py) 的 `SqlEngineTask.process_batch`). `PER_THREAD_OUTPUT` 让每个线程各写一个文件, 省去合并, 代价是输出文件数随线程数增加.

默认资源值很保守. `SqlEngineNode` 的 `cpu_limit` 默认 1, `memory_limit` 不指定时按核数比例分配, 即 $m = M \cdot c / C$, $M$ 和 $C$ 是本机可用内存和物理核数. 在 GraySort 用的 192 核, 2.2 TiB 计算节点上, 默认一个 SQL 任务只有 1 个线程和约 11.7 GiB 内存, DuckDB 的多线程能力完全没用上, 并行度全靠任务数. 想让单个分区跑得更快, 要在 `partial_sql` 或 `map` 的 `**kwargs` 里显式传 `cpu_limit`, `memory_limit`. 带 UDF 的查询会被强制降到最多 3 核, 理由是 DuckDB 里 Python UDF 的执行并行度不高.

### 3.2 HashPartitionDuckDbTask: 排序后按分区号并发 COPY

哈希分区是唯一真正搬数据的分区方式, 默认用 DuckDB 实现 (`HashPartitionDuckDbTask`). 分区键的计算是:

$$
k = \text{hash}(\text{concat\_ws}(\text{'\#\#'}, a_1, \dots, a_j)) \bmod n
$$

式中 $a_1, \dots, a_j$ 是 `hash_by` 指定的列, 结果以 UINT64 存进 `__data_partition__` 列. `random_shuffle` 时改用 `random()` 乘一个 $n$ 的整数倍; `by=列` 生成的 `ShuffleNode` 则跳过计算, 直接用该列当分区号. 生产者的输入按 `memory_limit // 6` 分批 (`partition_by_size`), 每批先执行 `CREATE TABLE temp_query_result AS ... ORDER BY __data_partition__` 建一张按分区号排好的临时表, 校验分区号都在 $[0, n)$ 内, 再开 `min(n, cpu_limit)` 个游标, 每个游标负责一部分分区号, 并发执行 `COPY (SELECT ... WHERE __data_partition__ = i) TO '<任务>-<i>.<批>.parquet'`. 先排序再按等值条件过滤, 让每条 `COPY` 只扫临时表里连续的一段.

这个实现有两个直接后果. 每批输入都会给 $n$ 个分区各写一个文件, 中间文件数是「生产者数 × 批数 × 分区数」, 分区数大或单批内存小时, 文件数会膨胀到百万级以上, 这对元数据服务的压力远大于数据量本身, 也是 3FS 用 FoundationDB 做可扩展元数据的现实需求. 另一种选择是 `hive_partitioning=True`, 改用 DuckDB 的 `PARTITION_BY` 一次写出目录分区; 或 `use_parquet_writer=True`, 用 Arrow 的 `ParquetWriter` 把同一分区的数据追加进同一个文件, 文件少但慢. 还有一个 `engine_type="arrow"` 的实现 `HashPartitionArrowTask`. 选择引擎的静态方法 `HashPartitionTask.create` 把 `**kwargs` 误写成了 `*kwargs`, 目前所有调用方只传位置参数, 没有触发.

### 3.3 Python 算子与函数式接口

不用 SQL 时, 有三类 Python 算子. `ArrowComputeNode` / `PandasComputeNode` 一次拿到整个分区的表; `ArrowStreamNode` / `ArrowBatchNode` / `PandasBatchNode` 按批迭代, `map_batches` 默认每批 122880 行, `ArrowStreamNode` 还支持按批做检查点 (文档提到的批级检查点即此); `PythonScriptNode` 最自由, 拿到输入数据集和输出目录, 自己决定读写方式, GraySort 的排序步骤就是它. 这些算子都在任务进程里直接调用用户函数, 函数会随任务一起被 cloudpickle 序列化, 源码在 Ray 路径上专门处理了一个常见错误: 函数捕获了外部导入的 loguru logger 时 pickle 失败, 报错里提示「在任务内部导入」.

DataFrame 的函数式接口 (`map(lambda row: ...)`, `filter(lambda r: ...)`) 建在 `ArrowBatchNode` 上, 实现是 `table.to_pylist()` 逐行转字典, 调函数, 再 `Table.from_pylist` 转回. 每行都要经过 Python 对象构造, 吞吐明显低于在 DuckDB 里向量化执行的 SQL 表达式, docstring 也建议优先用 SQL. `filter` 的函数版先对所有行求布尔值再整体过滤, 内存里同时有整批的 Python 字典. 需要复杂逻辑又在意速度时, 应该用 `map_batches` 直接处理 Arrow 表, 或者把逻辑写成 DuckDB UDF.

## 4. 与 3FS 的配合, 以及 GraySort 110.5 TiB

### 4.1 smallpond 从 3FS 拿到什么

smallpond 对存储的要求只有「所有节点看到同一个 POSIX 目录」, 上游代码通过 3FS 的 FUSE 挂载点读写, 没有调用 USRBIO. 3FS 在这里提供三样东西. 第一是带宽: 所有任务的输入, 中间结果和输出都走共享存储, 任务数上千时的聚合读写由 3FS 的数百块 SSD 和存储网卡分担. 第二是元数据扩展性: 哈希分区一步就能写出数百万个小文件, 列目录, 打开, 删除都落在 3FS 的无状态 meta 服务和 FoundationDB 上. 第三是一个专用的删除入口: [smallpond/io/filesystem.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/io/filesystem.py) 的 `remove_path` 在路径位于 3FS 上时, 在挂载点的 `3fs-virt/rm-rf/` 下建一个指向目标的符号链接, 由 3FS 在服务端递归删除, 失败再退回 `shutil.rmtree`. 作业成功结束时 `queue`, `temp`, `staging` 三个目录都靠它清理.

这个快速删除路径判断「是否在 3FS 上」的方式是检查路径前缀是否为 `/hf3fs`, 这是 DeepSeek 内部的挂载点命名. 按 3FS 部署指南挂在 `/3fs/stage` 的开源集群匹配不上, 所有删除都会退回逐文件的 `rmtree`, 数百万中间文件的清理会慢很多. 输出阶段也依赖同一挂载点: `write_parquet` 的 `DataSinkNode` 类型是 `link_or_copy`, 源和目标在同一挂载点时用硬链接, 否则逐字节复制. 社区的 [open3fs/smallpond-3fs](https://github.com/open3fs/smallpond-3fs) 分支把 DuckDB 的读写改走 USRBIO, 说明上游版本没有用到 3FS 的零拷贝接口.

### 4.2 GraySort 的计划与配置推导

GraySort 要求把一批 100 字节的记录 (10 字节键加 90 字节载荷) 按键全局排序. [`benchmarks/gray_sort_benchmark.py`](https://github.com/deepseek-ai/smallpond/blob/main/benchmarks/gray_sort_benchmark.py) 用低层 API 搭了四步. 第一步, 一个 `ArrowTableDataSet` 列出若干段记录区间 (起始序号, 条数), 按行均分给数据生成任务. 第二步, `ArrowStreamNode` 调 gensort 生成记录, 每批默认 512 MB 写进 `/dev/shm` 再读回, 组装成三列 Arrow 表: `buckets` (键前 2 字节转大端 uint16 后右移, 保留高 13 位), `keys` (前 10 字节), `records` (整条 100 字节), 写成 parquet. 第三步, `ShuffleNode` 以 `buckets` 为分区号把数据分成 8192 份. 第四步, `PythonScriptNode` 读入每个分区, 按 `keys` 排序后把 `records` 列的底层缓冲区原样写成 gensort 格式的 `.dat` 文件. 由于分区号是键的高位, 各分区的键范围互不重叠, 按分区号顺序拼起来就是全局有序.

README 和 3FS 的 GraySort 一节都没有给出运行命令, 但几个关键数字能从脚本默认值推出来. 设执行器数 $E = 50$, 每台 192 物理核, 内存 $M \approx 2.2$ TiB. 不传 `--total_data_nbytes` 时数据量取 $E \cdot M \approx 110$ TiB, 与 110.5 TiB 吻合. 排序任务默认 8 核, 内存按核比例为 $8 \times 2.2\ \text{TiB} / 192 \approx 93.9$ GiB, 排序分区数取:

$$
n = 2^{\lceil \log_2 \max(9600 / 8,\ 110.5\ \text{TiB} / (93.9\ \text{GiB} / 4)) \rceil} = 2^{\lceil \log_2 4821 \rceil} = 8192
$$

与 3FS README 写的 8192 个分区一致. 每个分区约 13.8 GiB, 只占排序任务内存的约 15%, 留给 Polars 或 DuckDB 排序的工作区足够. 数据生成分区数默认取总核数的一半, 即 4800, 记录区间数是它的 10 倍. shuffle 一步的生产者数按 2.2 节的公式为 $\min(1000, \lceil 4096000 / 8192 \rceil, \dots) = 500$, 恰好让 $P \times n$ 顶到 4096000 的上限.

### 4.3 成绩的口径与解读

3.66 TiB/min 合 62.4 GiB/s, 摊到 50 台计算节点每台每秒排序约 1.25 GiB. 从 3FS README 的吞吐图看, 计时 30 分 14 秒对应 shuffle 和排序两个阶段, 生成数据的约 6 分钟不在其中. 每条记录在中间 parquet 里还多存了 2 字节分区号和 10 字节键的副本, 两个阶段各读一遍写一遍, 客户端侧的 IO 总量至少是数据量的 4 倍, 平均每台约 5 GiB/s, 远低于 200 Gbps 网卡的上限. 和 sortbenchmark 上 Spark 2014 年的记录 (206 台 EC2 i2.8xlarge worker, 10 Gbps 网络, 23 分钟 100 TB, 约 4.27 TB/min) 相比, smallpond 的 110.5 TiB 合 121.5 TB, 约 4.02 TB/min, 量级相同. smallpond 用了更多的核 (9600 对 6592) 和快得多的网络, 所以这个成绩说明的是「简单架构也能跑到这个量级」, 而非排序效率更高.

脚本里还有几处配置文档没有交代. 命令行 `-s/--sort_engine` 默认 `duckdb`, 函数 `gray_sort_benchmark` 的参数默认却是 `polars`, 通过 `Driver` 运行时以命令行为准; shuffle 的 `-C` 默认取 `ShuffleNode.default_cpu_limit`, 即 1 核, 函数默认却是 32. 按 1 核, 每个 shuffle 生产者只有约 11.7 GiB 内存, 单批上限约 2 GiB, 要处理约 250 GiB 输入就得分 100 多批, 每批给 8192 个分区各写一个文件, 中间文件会到数亿个. 官方成绩应当调大过 `-C` 或 `-M`, 实际取值和用的是内置调度器还是 Ray, 文档没有给出. 社区文章 (例如 Eventual 的对比) 也只是拿官方数字和 Spark 记录做比较, 没有独立复现这个规模.

## 5. 适用范围, 版本与局限

### 5.1 适合与不适合的场景

smallpond 适合的任务有共同点: 能按某个键拆成互不依赖的分区, 每个分区放得进一台机器的内存, 而且有一套高带宽共享存储. 典型场景列在下面.

- 大规模数据清洗与过滤: 逐文件或逐行的打分, 去重前的哈希分桶, 格式转换, 每一步都是一轮分区内 SQL.
- 按键聚合与等值 join: 两边按同一键, 同一分区数哈希后用 `partial_sql` 处理, 每个分区独立完成.
- 训练数据混合与打乱: `random_shuffle` 先随机分区再分区内 `order by random()`, 输出直接写回 3FS 供数据加载器读取.
- 有现成 DuckDB 或 Python 处理逻辑, 想扩到多机而不改写成 Spark 作业的团队.

不适合的情况同样明显. 数据量在单机内存以内时, 直接用 DuckDB 更快, 社区 ([Definite 的文章](https://www.definite.app/blog/smallpond)) 的判断是 10 TB 以下单机 DuckDB 往往更快, 10 TB 到 1 PB 之间开始有价值, PB 级以上才是它的目标规模. 需要全局排序, 多表复杂 join 或窗口函数跨分区时, 要自己设计分区方式, 框架不会自动规划 shuffle. 没有 3FS 级别的共享存储时, 中间数据落盘成为瓶颈, 普通 NFS 很难承受百万级小文件. 流式, 低延迟或交互式查询也不在设计范围内, 每个任务都要新建 DuckDB 连接, 从共享存储读 parquet 再写回, 固定开销不适合毫秒级响应.

### 5.2 版本历史与代码和文档的出入

公开仓库的演进很短. 2025-02-25 首个提交即 `v0.15.0`, 版本号说明此前在内部已经迭代过多轮; 2025-02-27 更新 README; 2025-02-28 有两处改动 (把 `ArrowBatchNode` 暴露给 DataFrame, 整理 `JobManager` 参数), 但只留在 `wrj/arrow-batch-node` 和 `wrj/scheduler` 两个分支上, 没有合入 `main`; 2025-03-05 合入一次 150 字符行宽的代码格式化 (#18), 之后再无提交. 文档里「正在合并两套 API」的计划没有后续. 依赖上要求 `duckdb >= 1.2.0`, `pyarrow ~= 16.1.0`, `polars ~= 0.20.9`, `ray[default] >= 2.10.0`, pyarrow 和 polars 都锁在 2024 年的版本线.

代码与文档对不上的地方集中在示例. 入门文档的 `repartition(3, by_row=True)` 参数名错了, 代码是 `by_rows`, 原样运行会因多余关键字参数报错. 低层 API 的运行命令 `python script.py -i ... -n 10` 漏了 `Driver` 必填的位置参数 `mode` (`scheduler`, `executor` 或 `ray`), 示例代码也缺 `List` 的导入. 任务文档的 `RuntimeContext(JobId.new(), data_root)` 少传了 `job_time`. README 的 GraySort 成绩来自低层 API 和 `Driver`, 与 README 示例展示的 DataFrame 接口不是同一套代码路径, 脚本的命令行默认值与函数默认值也不一致. 代码自身还有两个文档未提的问题: `DataFrame.is_computed` 拿未优化的节点查任务表, 总返回 `False`; 3FS 快速删除只认 `/hf3fs` 前缀. 这些问题说明开源版本是内部系统的一个快照, 维护投入有限, 生产使用前需要自己补测试和修补.
