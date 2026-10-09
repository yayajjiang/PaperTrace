---
title: "01 · smallpond 文档对照译稿"
category: "开源仓库"
tags: ["DeepSeek", "对照译稿", "开源仓库"]
published: true
excerpt: "smallpond 仓库 README 与 docs/source 下全部 rst 文档的逐段英中对照, 覆盖 DataFrame 接口, 手动分区, 数据根目录结构, 失败恢复, 高低两层 API, Driver 与平台扩展, 节点, 任务与数据集类型, 疑惑处落回源码核对."
---

# smallpond 文档对照译稿

对照稿收录 [deepseek-ai/smallpond](https://github.com/deepseek-ai/smallpond) 仓库的英文文档: 根目录 `README.md`, 以及 `docs/source/` 下的 `index.rst`, `getstarted.rst`, `internals.rst`, `api.rst` 和 `api/` 目录里的 `dataframe.rst`, `execution.rst`, `nodes.rst`, `tasks.rst`, `dataset.rst`. rst 文件里的 `autosummary` 列表由 Sphinx 从源码 docstring 生成页面, 对照稿保留列表原样, 不翻译类名. 英文原段在前, 中文意译紧跟其后; 代码块, 命令保持原样. 疑惑块的答案按 `main` 分支最新提交 `52ecc5e` (2025-03-05) 核对, 源码给 GitHub 链接. 配套的技术解析见 [smallpond 技术解析](./02-smallpond-analysis.md).

## README.md

### smallpond · 概述

A lightweight data processing framework built on [DuckDB](https://duckdb.org/) and [3FS](https://github.com/deepseek-ai/3FS).

一个构建在 [DuckDB](https://duckdb.org/) 和 [3FS](https://github.com/deepseek-ai/3FS) 之上的轻量级数据处理框架.

- High-performance data processing powered by DuckDB
- Scalable to handle PB-scale datasets
- Easy operations with no long-running services

- 由 DuckDB 驱动的高性能数据处理
- 可扩展到 PB 级数据集
- 运维简单, 没有常驻服务

> **想:** 「没有常驻服务」是说完全不需要后台进程吗?
> 答: 不需要预先部署的集群服务, 但运行期间仍会拉起进程. 调用 `smallpond.init()` 时, [smallpond/session.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/session.py) 的 `SessionBase.__init__` 用 `ray.init(address="local")` 在本机起一个新的 Ray head, 若指定了 `num_executors` 再通过平台接口拉起 worker 进程, 系统里装了 prometheus 和 grafana 也会顺带启动. 这些进程都随会话结束而关闭, 作业之间不共享任何服务.

### Installation · 安装

Python 3.8 to 3.12 is supported.

支持 Python 3.8 到 3.12.

```bash
pip install smallpond
```

### Quick Start · 快速上手

```bash
# Download example data
wget https://duckdb.org/data/prices.parquet
```

```python
import smallpond

# Initialize session
sp = smallpond.init()

# Load data
df = sp.read_parquet("prices.parquet")

# Process data
df = df.repartition(3, hash_by="ticker")
df = sp.partial_sql("SELECT ticker, min(price), max(price) FROM {0} GROUP BY ticker", df)

# Save results
df.write_parquet("output/")
# Show results
print(df.to_pandas())
```

> **拆开:** 这段示例里哪几步真正触发计算?
> 答: 前面四步只构造逻辑计划, `write_parquet` 和 `to_pandas` 才执行. `repartition(3, hash_by="ticker")` 生成 `HashPartitionNode`, `partial_sql` 生成 `SqlEngineNode`, 两者都只是图上的节点 ([smallpond/dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/dataframe.py)). `write_parquet` 内部是 `write_parquet_lazy(path).compute()`, 在 `DataSinkNode` 上调 Ray 执行; 随后的 `to_pandas` 基于另一个 DataFrame (`partial_sql` 的结果), 它的任务已经在 `Session._node_to_tasks` 里缓存过, 不会重算, 直接读取已落盘的 parquet 拼成 pandas 表. 分组聚合能按分区算的前提是同一个 `ticker` 都落在同一个分区, 这正是先按 `ticker` 哈希分区的原因.

### Documentation · 文档

For detailed guides and API reference:
- [Getting Started](https://github.com/deepseek-ai/smallpond/blob/main/docs/source/getstarted.rst)
- [API Reference](https://github.com/deepseek-ai/smallpond/blob/main/docs/source/api.rst)

详细指南与 API 参考:
- 入门指南
- API 参考

### Performance · 性能

We evaluated smallpond using the [GraySort benchmark](https://sortbenchmark.org/) ([script](https://github.com/deepseek-ai/smallpond/blob/main/benchmarks/gray_sort_benchmark.py)) on a cluster comprising 50 compute nodes and 25 storage nodes running [3FS](https://github.com/deepseek-ai/3FS). The benchmark sorted 110.5TiB of data in 30 minutes and 14 seconds, achieving an average throughput of 3.66TiB/min.

我们用 [GraySort 基准](https://sortbenchmark.org/) ([脚本](https://github.com/deepseek-ai/smallpond/blob/main/benchmarks/gray_sort_benchmark.py)) 评测了 smallpond, 集群由 50 台计算节点和 25 台运行 [3FS](https://github.com/deepseek-ai/3FS) 的存储节点组成. 这次测试在 30 分 14 秒内排完 110.5TiB 数据, 平均吞吐 3.66TiB/min.

Details can be found in [3FS - Gray Sort](https://github.com/deepseek-ai/3FS?tab=readme-ov-file#2-graysort).

详情见 [3FS README 的 GraySort 一节](https://github.com/deepseek-ai/3FS?tab=readme-ov-file#2-graysort).

> **核对:** GraySort 脚本用的是 README 示例里的 DataFrame API 吗?
> 答: 不是同一套接口. [benchmarks/gray_sort_benchmark.py](https://github.com/deepseek-ai/smallpond/blob/main/benchmarks/gray_sort_benchmark.py) 手工搭 `DataSourceNode`, `ArrowStreamNode`, `ShuffleNode`, `PythonScriptNode` 组成 `LogicalPlan`, 由低层 API 的 `Driver().run(plan)` 提交, 按命令行选择内置调度器或 Ray. 110.5TiB 这个数也能从脚本默认值推出来: 不指定 `--total_data_nbytes` 时数据量取「执行器数 × 每台内存」, 50 台 × 约 2.2TiB 正好在 110TiB 附近; 排序分区数取 `max(总核数 / 8, 数据量 / (单任务内存 / 4))` 再向上取 2 的幂, 代入 50 × 192 核和 2.2TiB 内存得到约 4800, 取幂后是 8192, 与 3FS README 写的 8192 个分区一致.

### Development · 开发

```bash
pip install .[dev]

# run unit tests
pytest -v tests/test*.py

# build documentation
pip install .[docs]
cd docs
make html
python -m http.server --directory build/html
```

### License · 许可证

This project is licensed under the [MIT License](https://github.com/deepseek-ai/smallpond/blob/main/LICENSE).

项目以 [MIT 许可证](https://github.com/deepseek-ai/smallpond/blob/main/LICENSE) 发布.

## docs/source/index.rst

### smallpond · 首页

Smallpond is a lightweight distributed data processing framework. It uses [duckdb](https://duckdb.org/) as the compute engine and stores data in [parquet](https://parquet.apache.org/) format on a distributed file system (e.g. [3FS](https://github.com/deepseek-ai/3fs)).

smallpond 是一个轻量级分布式数据处理框架. 它用 [duckdb](https://duckdb.org/) 做计算引擎, 把数据以 [parquet](https://parquet.apache.org/) 格式存在分布式文件系统上 (例如 [3FS](https://github.com/deepseek-ai/3fs)).

### Why smallpond? · 为什么用 smallpond

- **Performance**: Smallpond uses DuckDB to deliver native-level performance for efficient data processing.
- **Scalability**: Leverages high-performance distributed file systems for intermediate storage, enabling PB-scale data handling without memory bottlenecks.
- **Simplicity**: No long-running services or complex dependencies, making it easy to deploy and maintain.

- **性能**: smallpond 借助 DuckDB 获得接近原生代码的处理性能.
- **可扩展性**: 中间数据存放在高性能分布式文件系统上, 处理 PB 级数据时不受内存容量限制.
- **简单**: 没有常驻服务, 也没有复杂依赖, 部署和维护都容易.

> **问:** 中间数据全部落共享存储, 不会比内存 shuffle 慢很多吗?
> 答: 慢多少取决于存储. smallpond 的每个任务都把输出写成 parquet 文件放到数据根目录的 `staging` 下, 下游任务按路径读取 ([smallpond/execution/task.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/task.py) 的 `RuntimeContext`), 任务之间不走网络直连. 在 3FS 这种每台客户端能读写 20GiB/s 以上的存储上, 落盘代价被带宽摊薄, 换来的是任务可以单独重试, 内存不够时不用溢写. 换成普通 NFS 或对象存储, 中间数据的读写会成为瓶颈, 文档没有给出这种环境下的数字.

```
.. toctree::
   :maxdepth: 1

   getstarted
   internals

.. toctree::
   :maxdepth: 3

   api
```

## docs/source/getstarted.rst

### Installation · 安装

Python 3.8+ is required.

需要 Python 3.8 及以上.

```bash
pip install smallpond
```

### Initialization · 初始化

The first step is to initialize the smallpond session:

第一步是初始化 smallpond 会话:

```python
import smallpond

sp = smallpond.init()
```

> **看表:** `init()` 不带参数时, 数据写到哪里, 用几台机器?
> 答: [smallpond/session.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/session.py) 的 `Config.from_args_and_env` 依次看 `SP_` 前缀环境变量, 函数参数, 平台默认值. 默认平台的数据根目录是 `~/.smallpond/data` ([smallpond/platform/base.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/platform/base.py) 的 `default_data_root`), 执行器数默认 0, 即只用本机的 Ray head 跑全部任务; 系统里能找到 `mpirun` 时自动选 MPI 平台. 想用 3FS, 要把 `SP_DATA_ROOT` 或 `data_root` 指到 3FS 挂载点下.

### Loading Data · 加载数据

Create a DataFrame from a set of files:

从一组文件创建 DataFrame:

```python
df = sp.read_parquet("path/to/dataset/*.parquet")
```

To learn more about loading data, please refer to `loading_data`.

加载数据的更多方式见 API 参考的 Loading Data 一节.

### Partitioning Data · 数据分区

Smallpond requires users to manually specify data partitions for now.

smallpond 目前要求用户手动指定数据分区.

```python
df = df.repartition(3)                 # repartition by files
df = df.repartition(3, by_row=True)    # repartition by rows
df = df.repartition(3, hash_by="host") # repartition by hash of column
```

To learn more about partitioning data, please refer to `partitioning_data`.

分区的更多用法见 API 参考的 Partitioning Data 一节.

> **对一下:** 第二行的 `by_row=True` 能直接运行吗?
> 答: 不能. [smallpond/dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/dataframe.py) 的 `DataFrame.repartition` 参数名是 `by_rows`, 写成 `by_row` 会落进 `**kwargs`, 再原样传给 `EvenlyDistributedPartitionNode.__init__`, 后者没有这个参数, 构造时抛 `TypeError`. 正确写法是 `df.repartition(3, by_rows=True)`. 另外 `repartition` 还有一个文档没列的 `by` 参数, 按某一列已有的分区号直接分发 (生成 `ShuffleNode`), GraySort 脚本走的就是这条路.

### Transforming Data · 数据变换

Apply python functions or SQL expressions to transform data.

用 Python 函数或 SQL 表达式变换数据.

```python
df = df.map('a + b as c')
df = df.map(lambda row: {'c': row['a'] + row['b']})
```

To learn more about transforming data, please refer to `transformations`.

变换的更多用法见 API 参考的 Transformations 一节.

> **拆开:** 两种写法执行时有什么差别?
> 答: 字符串会拼成 `select a + b as c from {0}`, 生成 `SqlEngineNode`, 在 DuckDB 里向量化执行; lambda 生成 `ArrowBatchNode`, 每批数据先 `to_pylist()` 转成 Python 字典列表, 逐行调用函数, 再 `Table.from_pylist` 转回 Arrow ([smallpond/dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/dataframe.py) 的 `DataFrame.map`). 后者每行都过一次 Python 解释器, docstring 也写了 SQL 表达式更高效. 两种写法都只保留表达式产出的列, 想保留原有列要写成 `'*, a + b as c'`.

### Saving Data · 保存数据

Save the transformed data to a set of files:

把变换后的数据存成一组文件:

```python
df.write_parquet("path/to/output")
```

To learn more about saving data, please refer to `consuming_data`.

保存数据的更多方式见 API 参考的 Consuming Data 一节.

### Monitoring · 监控

Smallpond uses [Ray Core](https://docs.ray.io/en/latest/ray-core/walkthrough.html) as the task scheduler. You can use [Ray Dashboard](https://docs.ray.io/en/latest/ray-observability/getting-started.html) to monitor the task execution.

smallpond 用 [Ray Core](https://docs.ray.io/en/latest/ray-core/walkthrough.html) 做任务调度器. 可以用 [Ray Dashboard](https://docs.ray.io/en/latest/ray-observability/getting-started.html) 监控任务执行.

When smallpond starts, it will print the Ray Dashboard URL:

smallpond 启动时会打印 Ray Dashboard 的地址:

```bash
... Started a local Ray instance. View the dashboard at http://127.0.0.1:8008
```

> **再看:** 除了 Dashboard, 运行中还有哪些可观测的产物?
> 答: 会话启动后有一个后台线程每 60 秒做三件事: 用 graphviz 把逻辑计划画成 `log/graph.png`, 用 `ray.timeline` 导出两份时间线 (按 worker 分组的 `timeline_exec` 和按节点重新分组的 `timeline_plan`), 并在日志里打印「已完成任务数 / 总任务数」的进度, 见 [smallpond/session.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/session.py) 的 `_dump_periodically`. Dashboard 端口 8008, grafana 端口 8122, 都写在同一文件里.

## docs/source/internals.rst

### Data Root · 数据根目录

Smallpond stores all data in a single directory called data root.

smallpond 把所有数据存在一个叫数据根目录 (data root) 的目录里.

This directory has the following structure:

目录结构如下:

```bash
data_root
└── 2024-12-11-12-00-28.2cc39990-296f-48a3-8063-78cf6dca460b # job_time.job_id
    ├── config  # configuration and state
    │   ├── exec_plan.pickle
    │   ├── logical_plan.pickle
    │   └── runtime_ctx.pickle
    ├── log     # logs
    │   ├── graph.png
    │   └── scheduler.log
    ├── queue   # message queue between scheduler and workers
    ├── output  # output data
    ├── staging # intermediate data
    │   ├── DataSourceTask.000001
    │   ├── EvenlyDistributedPartitionProducerTask.000002
    │   ├── completed_tasks  # output dataset of completed tasks
    │   └── started_tasks    # used for checkpoint
    └── temp    # temporary data
        ├── DataSourceTask.000001
        └── EvenlyDistributedPartitionProducerTask.000002
```

> **确认:** `queue` 目录在 Ray 模式下也有用吗?
> 答: `queue` 只服务内置调度器. 低层 API 的调度器和执行器之间没有 RPC, 而是在 `queue/<执行器 id>/` 下用文件做工作队列 ([smallpond/execution/workqueue.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/workqueue.py) 的 `WorkQueueOnFilesystem`), 调度器扫描这个目录发现新执行器 ([smallpond/execution/scheduler.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/scheduler.py) 的 `probe_executors`). Ray 模式由 Ray 自己传递任务, 只用到 `staging/started_tasks` 和 `staging/completed_tasks` 两个子目录记录任务状态. 作业成功结束后, `queue`, `temp`, `staging` 会被删掉 (`RuntimeContext.cleanup`), 默认连 `output` 也删, 用户通过 `write_parquet` 指定的路径不受影响.

### Failure Recovery · 失败恢复

Smallpond can recover from failure and resume execution from the last checkpoint. Checkpoint is task-level. A few tasks, such as `ArrowBatchTask`, support checkpointing at the batch level.

smallpond 能从失败中恢复, 从上一个检查点继续执行. 检查点以任务为粒度. 少数任务 (例如 `ArrowBatchTask`) 支持按批次做检查点.

> **回看:** 重新运行脚本时, 怎样才能接上上次的检查点?
> 答: 要让新会话指向同一个作业目录. Ray 模式下, 任务执行前先看 `staging/completed_tasks/<节点 id>/<任务名>.pickle` 是否存在, 存在就直接读出输出数据集, 跳过执行 ([smallpond/execution/task.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/task.py) 的 `Task.run_on_ray`). 但作业目录名由 `job_time.job_id` 组成, 两者默认取当前时间和新的 UUID, 每次运行都是新目录, 检查点自然找不到. 想续跑, 需要用 `SP_JOBID` 和 `SP_JOB_TIME` 环境变量 (或 `init()` 的同名参数) 固定这两个值. 文档没有提这一点.

## docs/source/api.rst

### API Reference · API 参考

Smallpond provides both high-level and low-level APIs.

smallpond 同时提供高层和低层两套 API.

Currently, smallpond provides two different APIs, supporting dynamic and static construction of data flow graphs respectively. Due to historical reasons, these two APIs use different scheduler backends and support different configuration options.

目前 smallpond 有两套不同的 API, 分别支持动态构建和静态构建数据流图. 由于历史原因, 两套 API 使用不同的调度后端, 支持的配置项也不同.

- The High-level API currently uses Ray as the backend, supporting dynamic construction and execution of data flow graphs.
- The Low-level API uses a built-in scheduler and only supports one-time execution of static data flow graphs. However, it offers more performance optimizations and richer configuration options.

- 高层 API 目前以 Ray 为后端, 支持动态构建并执行数据流图.
- 低层 API 使用内置调度器, 只支持静态数据流图的一次性执行. 它的性能优化更多, 配置项也更丰富.

We are working to merge them so that in the future, you can use a unified high-level API and freely choose between Ray or the built-in scheduler.

我们正在合并两者, 将来可以用统一的高层 API, 在 Ray 和内置调度器之间自由选择.

> **看表:** 低层 API 多出的「性能优化」具体是哪些?
> 答: 对比 [smallpond/execution/driver.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/driver.py) 的命令行参数和 [smallpond/execution/scheduler.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/scheduler.py), 内置调度器独有的有: 推测执行 (`--speculative_exec`, 默认开启, 按同节点任务耗时的 p50, p95, p99 判定慢任务并重发), 资源提升 (`try_boost_resource`, 执行器空闲时把任务的 CPU 与内存翻倍), OOM 后放宽内存重试 (`try_relax_memory_limit`), NUMA 绑定, 内存分配器默认 mimalloc. Ray 路径只按 `cpu_limit` 和 `memory_limit` 向 Ray 申请资源, 重试靠标记文件计数, 上限 5 次. 合并两套后端的工作在公开仓库里没有后续提交: `main` 分支 2025-02-27 之后只有一次代码格式化 (2025-03-05), 2025-02-28 的两处改动 (把 `ArrowBatchNode` 暴露给 DataFrame, JobManager 参数整理) 停留在 `wrj/arrow-batch-node` 和 `wrj/scheduler` 分支上.

### High-level API · 高层 API

The high-level API is centered around `dataframe`. It allows dynamic construction of data flow graphs, execution, and result retrieval.

高层 API 以 DataFrame 为中心, 可以动态构建数据流图, 执行并取回结果.

A typical workflow looks like this:

典型流程如下:

```python
import smallpond

sp = smallpond.init()

df = sp.read_parquet("path/to/dataset/*.parquet")
df = df.repartition(10)
df = df.map("x + 1")
df.write_parquet("path/to/output")
```

```
.. toctree::
   :maxdepth: 2

   api/dataframe
```

It is recommended to use the DataFrame API.

推荐使用 DataFrame API.

### Low-level API · 低层 API

In the low-level API, users manually create `nodes` to construct static data flow graphs, then submit them to smallpond to generate `tasks` and wait for all tasks to complete.

使用低层 API 时, 用户手动创建节点 (Node) 搭出静态数据流图, 提交给 smallpond 生成任务 (Task), 并等待全部任务完成.

A complete example is shown below.

完整示例如下.

```python
from smallpond.logical.dataset import ParquetDataSet
from smallpond.logical.node import Context, DataSourceNode, DataSetPartitionNode, SqlEngineNode, LogicalPlan
from smallpond.execution.driver import Driver

def my_pipeline(input_paths: List[str], npartitions: int):
   ctx = Context()
   dataset = ParquetDataSet(input_paths)
   node = DataSourceNode(ctx, dataset)
   node = DataSetPartitionNode(ctx, (node,), npartitions=npartitions)
   node = SqlEngineNode(ctx, (node,), "SELECT * FROM {0}")
   return LogicalPlan(ctx, node)

if __name__ == "__main__":
   driver = Driver()
   driver.add_argument("-i", "--input_paths", nargs="+")
   driver.add_argument("-n", "--npartitions", type=int, default=10)

   plan = my_pipeline(**driver.get_arguments())
   driver.run(plan)
```

To run this script:

运行这个脚本:

```bash
python script.py -i "path/to/*.parquet" -n 10
```

> **停一下:** 这条运行命令能直接跑起来吗?
> 答: 缺一个位置参数. `Driver` 的参数解析器第一个参数是 `mode`, 取值 `executor`, `scheduler`, `ray`, 定义为普通位置参数, 写了 `default` 但没有 `nargs="?"`, argparse 仍把它当必填 ([smallpond/execution/driver.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/driver.py) 的 `_create_driver_args_parser`). 实际要写成 `python script.py scheduler -i ... -n 10` 或 `python script.py ray ...`. 另外示例用了 `List` 却没有 `from typing import List`, 直接复制会报 `NameError`. 示例里的 `DataSetPartitionNode` 是一个工厂函数: 默认返回 `EvenlyDistributedPartitionNode`, `npartitions=1` 时再包一层 `ConsolidateNode`, 指定 `data_partition_column` 时改返回 `LoadPartitionedDataSetNode`.

```
.. toctree::
   :maxdepth: 2

   api/dataset
   api/nodes
   api/tasks
   api/execution
```

## docs/source/api/dataframe.rst

### DataFrame · 数据帧

DataFrame is the main class in smallpond. It represents a lazily computed, partitioned data set.

DataFrame 是 smallpond 的核心类, 表示一个惰性计算, 带分区的数据集.

A typical workflow looks like this:

典型流程如下:

```python
import smallpond

sp = smallpond.init()

df = sp.read_parquet("path/to/dataset/*.parquet")
df = df.repartition(10)
df = df.map("x + 1")
df.write_parquet("path/to/output")
```

> **问:** 连续多次 `map` 或 `filter`, 会生成多轮任务, 每轮都落盘吗?
> 答: 连续的 SQL 节点会被合并. 第一次求值时, [smallpond/logical/optimizer.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/logical/optimizer.py) 的 `Optimizer.visit_query_engine_node` 发现一个 `SqlEngineNode` 的唯一输入也是 `SqlEngineNode`, 就把下层查询作为子查询嵌进上层, 例如 `select a, b from (select * from {0})`, CPU 与内存上限取两者较大值, UDF 列表合并. 所以 `filter('a > 1').map('a + b as c')` 只生成一轮 DuckDB 任务. lambda 写法生成的 `ArrowBatchNode` 不参与合并, 会打断这条链.

### Initialization · 初始化

```
.. autosummary::
   :toctree: ../generated

   smallpond.init
```

### Loading Data · 加载数据

```
.. autosummary::
   :toctree: ../generated

   Session.from_items
   Session.from_arrow
   Session.from_pandas
   Session.read_csv
   Session.read_json
   Session.read_parquet
```

### Partitioning Data · 数据分区

```
.. autosummary::
   :toctree: ../generated

   DataFrame.repartition
```

### Transformations · 变换

Apply transformations and return a new DataFrame.

执行变换并返回一个新的 DataFrame.

```
.. autosummary::
   :toctree: ../generated

   Session.partial_sql
   DataFrame.map
   DataFrame.map_batches
   DataFrame.flat_map
   DataFrame.filter
   DataFrame.limit
   DataFrame.partial_sort
   DataFrame.random_shuffle
```

> **核对:** 列表里没有 join 和全局排序, 这两种操作怎么写?
> 答: join 要用 `Session.partial_sql` 传入两个 DataFrame, 前提是两边按 join 键做了相同分区数的哈希分区, docstring 给的例子就是两次 `repartition(10, hash_by="id")` 后再 `select * from {0} join {1}`. 全局排序没有现成算子: `partial_sort` 只在每个分区内 `order by`, 想要全局有序得自己先按键的范围分区 (`RangePartitionNode` 在源码里注明尚未实现), 再分区内排序, GraySort 脚本就是用键的前 13 位当分区号实现的. 见 [smallpond/dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/dataframe.py) 与 [smallpond/logical/node.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/logical/node.py).

### Consuming Data · 消费数据

These operations will trigger execution of the lazy transformations performed on this DataFrame.

下面这些操作会触发 DataFrame 上惰性变换的执行.

```
.. autosummary::
   :toctree: ../generated

   DataFrame.count
   DataFrame.take
   DataFrame.take_all
   DataFrame.to_arrow
   DataFrame.to_pandas
   DataFrame.write_parquet
   DataFrame.write_parquet_lazy
```

### Execution · 执行

DataFrames are lazily computed. You can use these methods to manually trigger computation.

DataFrame 是惰性计算的. 可以用下面这些方法手动触发计算.

```
.. autosummary::
   :toctree: ../generated

   DataFrame.compute
   DataFrame.is_computed
   DataFrame.recompute
   Session.wait
```

> **确认:** `is_computed` 能可靠判断数据是否已经算好吗?
> 答: 实现有两处可疑. [smallpond/dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/dataframe.py) 的 `is_computed` 用 `self.plan` 去查 `_node_to_tasks`, 而任务登记时用的键是优化后的 `self.optimized_plan`; `Optimizer.generic_visit` 对每个节点都 `copy.copy` 一份, `Node` 又没有自定义 `__eq__` 与 `__hash__`, 所以两者永远是不同的键, 查询总落空, 方法总返回 `False`. 即便查到, 它把 `Task` 对象列表直接交给 `ray.wait`, 后者只接受 `ObjectRef`, Ray 会抛 `TypeError`. 实际影响是 `take` 每次都多构造一个 `LimitNode`, 多跑一轮 limit 任务; 上游已登记的任务仍会经 `_node_to_tasks` 复用, 不会整条重算. 仓库测试 [tests/test_dataframe.py](https://github.com/deepseek-ai/smallpond/blob/main/tests/test_dataframe.py) 没有覆盖这个方法.

## docs/source/api/execution.rst

### Submit a Job · 提交作业

After constructing the LogicalPlan, you can use the JobManager to create a Job in the cluster to execute it. However, in most cases, you only need to use the Driver as the entry point of the entire script and then submit the plan. The Driver is a simple wrapper around the JobManager. It reads the configuration from the command line arguments and passes it to the JobManager.

构造好 LogicalPlan 后, 可以用 JobManager 在集群上建一个作业来执行它. 不过多数情况下, 只需要把 Driver 当作整个脚本的入口, 再提交计划即可. Driver 是 JobManager 的简单封装, 它从命令行参数读取配置, 转交给 JobManager.

```python
from smallpond.execution.driver import Driver

if __name__ == "__main__":
   driver = Driver()
   # add your own arguments
   driver.add_argument("-i", "--input_paths", nargs="+")
   driver.add_argument("-n", "--npartitions", type=int, default=10)
   # build and run logical plan
   plan = my_pipeline(**driver.get_arguments())
   driver.run(plan)
```

```
.. autosummary::
   :toctree: ../generated

   ~driver.Driver
   ~manager.JobManager
```

> **拆开:** Driver 在三种 mode 下分别做什么?
> 答: `scheduler` 模式构造 `JobManager`, 由它序列化运行时上下文与执行计划, 通过平台拉起执行器进程, 再在本进程跑内置调度器; `executor` 模式从 `--runtime_ctx_path` 读出上下文, 起一个执行器去轮询文件队列, 开了 NUMA 绑定时每个 NUMA 节点一个进程; `ray` 模式直接 `smallpond.init()` 后把计划根节点包成 DataFrame 调 `compute()`, 也就是走高层 API 的 Ray 后端. 三条分支都在 [smallpond/execution/driver.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/driver.py) 的 `Driver.run` 里. 所以低层 API 的计划也能跑在 Ray 上, 只是失去内置调度器的那些优化.

### Scheduler and Executor · 调度器与执行器

Scheduler and Executor are lower-level APIs. They are directly responsible for scheduling and executing tasks, respectively. Generally, users do not need to use them directly.

调度器 (Scheduler) 和执行器 (Executor) 属于更底层的 API, 分别直接负责调度任务和执行任务. 一般用户不需要直接使用.

```
.. autosummary::
   :toctree: ../generated

   ~scheduler.Scheduler
   ~executor.Executor
```

### Customize Platform · 自定义平台

Smallpond supports user-defined task execution platforms. A Platform includes methods for submitting jobs and a series of default configurations. By default, smallpond automatically detects the current environment and selects the most suitable platform. If it cannot detect one, it uses the default platform.

smallpond 支持用户自定义任务执行平台. 一个 Platform 包含提交作业的方法和一组默认配置. 默认情况下 smallpond 会自动探测当前环境, 选择最合适的平台; 探测不到时使用默认平台.

You can specify a built-in platform via parameters:

可以用参数指定一个内置平台:

```bash
# run with your platform
python script.py --platform mpi
```

Or implement your own Platform class:

也可以实现自己的 Platform 类:

```python
# path/to/my/platform.py
from smallpond.platform import Platform

class MyPlatform(Platform):
   def start_job(self, ...) -> List[str]:
      ...
```

```bash
# run with your platform
# if using Driver
python script.py --platform path.to.my.platform

# if using smallpond.init
SP_PLATFORM=path.to.my.platform python script.py
```

```
.. autosummary::
   :toctree: ../generated

   ~platform.Platform
   ~platform.MPI
```

> **想:** 默认平台和 MPI 平台怎样把 worker 放到多台机器上?
> 答: 默认平台做不到. [smallpond/platform/base.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/platform/base.py) 的 `Platform.start_job` 在本机用 `subprocess.Popen` 起 `num_nodes` 个 `python <entrypoint>` 进程, 全在同一台机器上. MPI 平台 ([smallpond/platform/mpi.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/platform/mpi.py)) 用 `mpirun -n <num_nodes>` 分发, 由 MPI 的主机文件决定落在哪些机器上, 但它的 `start_job` 返回空列表, 会话结束时 `stop_job` 无从调用, worker 进程需要靠 MPI 自己回收. 内置的只有这两个平台, DeepSeek 内部用的集群平台没有开源, 多机部署通常要自己写一个 Platform 子类.

## docs/source/api/nodes.rst

### Nodes · 节点

Nodes represent the fundamental building blocks of a data processing pipeline. Each node encapsulates a specific operation or transformation that can be applied to a dataset. Nodes can be chained together to form a logical plan, which is a directed acyclic graph (DAG) of nodes that represent the overall data processing workflow.

节点是数据处理流水线的基本构件. 每个节点封装一种可作用于数据集的操作或变换. 节点串起来构成逻辑计划, 即一张有向无环图 (DAG), 表示整条数据处理流程.

A typical workflow to create a logical plan is as follows:

创建逻辑计划的典型流程如下:

```python
# Create a global context
ctx = Context()

# Create a dataset
dataset = ParquetDataSet("path/to/dataset/*.parquet")

# Create a data source node
node = DataSourceNode(ctx, dataset)

# Partition the data
node = DataSetPartitionNode(ctx, (node,), npartitions=2)

# Create a SQL engine node to transform the data
node = SqlEngineNode(ctx, (node,), "SELECT * FROM {0}")

# Create a logical plan from the root node
plan = LogicalPlan(ctx, node)
```

You can then create tasks from the logical plan, see `tasks`.

之后可以从逻辑计划生成任务, 见 Tasks 一节.

Notable properties of Node:

节点的几个要点:

1. Nodes are partitioned. Each Node generates a series of tasks, with each task processing one partition of data.
2. The input and output of a Node are a series of partitioned Datasets. A Node may write data to shared storage and return a new Dataset, or it may simply recombine the input Datasets.

1. 节点是分区的. 每个节点生成一组任务, 每个任务处理一个数据分区.
2. 节点的输入和输出都是一组分区后的数据集 (Dataset). 节点可以把数据写到共享存储并返回新的数据集, 也可以只是把输入数据集重新组合.

> **看表:** 一个 `HashPartitionNode` 会生成多少个任务?
> 答: 分两层. [smallpond/logical/planner.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/logical/planner.py) 的 `visit_partition_node` 先算生产者任务数: 取 `min(节点的 max_num_producer_tasks, ceil(4096000 / npartitions))` 与 `2 × 执行器数 × ceil(可用核数 / cpu_limit)` 中较小者; `HashPartitionNode` 的上限是 1000, 均匀分区节点是 1. 每个生产者把自己那份输入切成 `npartitions` 份写出, 然后再生成 `npartitions` 个消费者任务, 每个消费者收集所有生产者的同号分区. 4096000 这个常数限制的是「生产者数 × 分区数」, 也就是中间文件的总数. 第二种性质「只是重新组合」说的就是消费者任务: `PartitionConsumerTask` 只拼文件列表, 不读写数据.

### Context · 上下文

```
.. autosummary::
   :toctree: ../generated

   Context
   NodeId
```

### LogicalPlan · 逻辑计划

```
.. autosummary::
   :toctree: ../generated

   LogicalPlan
   LogicalPlanVisitor
   .. Planner
```

### Nodes · 节点列表

```
.. autosummary::
   :toctree: ../generated

   Node
   DataSetPartitionNode
   ArrowBatchNode
   ArrowComputeNode
   ArrowStreamNode
   ConsolidateNode
   DataSinkNode
   DataSourceNode
   EvenlyDistributedPartitionNode
   HashPartitionNode
   LimitNode
   LoadPartitionedDataSetNode
   PandasBatchNode
   PandasComputeNode
   PartitionNode
   ProjectionNode
   PythonScriptNode
   RangePartitionNode
   RepeatPartitionNode
   RootNode
   ShuffleNode
   SqlEngineNode
   UnionNode
   UserDefinedPartitionNode
   UserPartitionedDataSourceNode
```

## docs/source/api/tasks.rst

### Tasks · 任务

```python
# create a runtime context
runtime_ctx = RuntimeContext(JobId.new(), data_root)
runtime_ctx.initialize(socket.gethostname(), cleanup_root=True)

# create a logical plan
plan = create_logical_plan()

# create an execution plan
planner = Planner(runtime_ctx)
exec_plan = planner.create_exec_plan(plan)
```

You can then execute the tasks in a scheduler, see `execution`.

之后可以在调度器里执行这些任务, 见 Execution 一节.

> **对一下:** `RuntimeContext(JobId.new(), data_root)` 的参数顺序和构造函数一致吗?
> 答: 构造函数前两个参数是 `job_id` 和 `job_time`, `data_root` 排第三 ([smallpond/execution/task.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/task.py) 的 `RuntimeContext.__init__`, 会话代码 [smallpond/session.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/session.py) 也是按 `job_id=..., job_time=..., data_root=...` 传的). 照示例位置传参, `data_root` 会被当成 `job_time`, 第三个必填参数缺失, 构造时直接抛 `TypeError`. 要补上作业时间, 写成 `RuntimeContext(JobId.new(), datetime.now(), data_root)`. `create_exec_plan` 会在根节点外再包一层 `DataSinkNode` 和 `RootNode`, 所以任务数比节点自己生成的多两个.

### RuntimeContext · 运行时上下文

```
.. autosummary::
   :toctree: ../generated

   RuntimeContext
   JobId
   TaskId
   TaskRuntimeId
   PartitionInfo
   PerfStats
```

### ExecutionPlan · 执行计划

```
.. autosummary::
   :toctree: ../generated

   ExecutionPlan
```

### Tasks · 任务列表

```
.. autosummary::
   :toctree: ../generated

   Task
   ArrowBatchTask
   ArrowComputeTask
   ArrowStreamTask
   DataSinkTask
   DataSourceTask
   EvenlyDistributedPartitionProducerTask
   HashPartitionArrowTask
   HashPartitionDuckDbTask
   HashPartitionTask
   LoadPartitionedDataSetProducerTask
   MergeDataSetsTask
   PandasBatchTask
   PandasComputeTask
   PartitionConsumerTask
   PartitionProducerTask
   ProjectionTask
   PythonScriptTask
   RangePartitionTask
   RepeatPartitionProducerTask
   RootTask
   SplitDataSetTask
   SqlEngineTask
   UserDefinedPartitionProducerTask
```

> **核对:** `HashPartitionDuckDbTask` 和 `HashPartitionArrowTask` 由谁选择, 选择逻辑有没有问题?
> 答: `HashPartitionNode` 的 `engine_type` 默认 `"duckdb"`, 由静态方法 `HashPartitionTask.create` 分派 ([smallpond/execution/task.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/execution/task.py)). 这个方法把关键字参数写成了 `*kwargs` 而非 `**kwargs`, 关键字参数会被当成位置参数传进去 (只传进键名). 现在所有调用方都只用位置参数, 所以没有出错, 但只要有人改成关键字调用就会错位. DuckDB 版的分区键是 `CAST(hash(concat_ws('##', 列...)) AS UINT64) % npartitions`, 先整体按分区键排序建临时表, 再按分区号并发 `COPY` 出去.

## docs/source/api/dataset.rst

### Dataset · 数据集

Dataset represents a collection of files.

数据集 (Dataset) 表示一组文件.

To create a dataset:

创建数据集:

```python
dataset = ParquetDataSet("path/to/dataset/*.parquet")
```

```
.. autosummary::
   :toctree: ../generated

   DataSet
   FileSet
   ParquetDataSet
   CsvDataSet
   JsonDataSet
   ArrowTableDataSet
   PandasDataSet
   PartitionedDataSet
   SqlQueryDataSet
```

> **回看:** 任务之间传递的数据集里到底装了什么?
> 答: 装的是文件路径和元信息, 不是数据本身. `ParquetDataSet` 保存路径列表, 可选的列投影和按行切分时的行区间 (`RowRange`); 下游 DuckDB 任务把它展开成 `read_parquet([path1, path2, ...], union_by_name=...)` 视图来读 ([smallpond/logical/dataset.py](https://github.com/deepseek-ai/smallpond/blob/main/smallpond/logical/dataset.py) 的 `sql_query_fragment`). Ray 模式下任务的返回值就是这个对象, 经 Ray 对象存储交给下游, 体积很小; 真正的数据始终在共享文件系统上. `ArrowTableDataSet` 和 `PandasDataSet` 是例外, 它们把内存表整个放进对象, 适合 `from_pandas` 这类小数据入口.
