---
title: "02 · Harness Composability 技术解析: 用可撤销 effect 与响应式 coeffect 管理动态组件"
category: "DeepSeek"
tags:
  - Agent Harness
  - 编程语言
  - 动态组合
  - Cordis
published: true
excerpt: "论文将 effect 和 coeffect 从静态类型概念提升为运行时机制, 为插件与自演化 agent harness 建立可卸载、可重载且依赖一致的组件模型."
---
# Harness Composability 技术解析: 用可撤销 effect 与响应式 coeffect 管理动态组件

《A Programming Paradigm for Spatiotemporal Composability》由北京大学与 DeepSeek-AI 的 Yifan Shi, Wei Zhang, Tianyi Cui 完成, arXiv 编号 2608.25512. 论文提出 Cordis 元框架, 目标是在同一进程内动态装载, 卸载和重配组件, 同时保证组件造成的状态变化能够撤回, 依赖变化能够触发生命周期调整. 全文 92 页, 前半部分给出 effect/coeffect 的运行时形式化与动态组合演算, 后半部分把演算对应到 Cordis 的 effect tracking, coeffect resolution, component loader 和 HMR 实现.

## 1. 动态组合缺少的两项保证

动态组合至少要保证两件事: 组件能完整退出, 依赖变化能正确传播.

### 1.1. 时间组合性要求完整撤回

插件执行以后会注册事件, 打开连接, 写入共享表, 创建子组件. 传统插件系统通常给一个 `deactivate` 回调, 清理由作者手工维护. 创建行为和清理行为分散在两个位置, 新增一项资源时很容易忘记补清理. VSCode 扩展 host 甚至无法在运行中卸载单个含代码扩展, 禁用或卸载需要重启整个 host. 论文将这类问题称为 temporal composability: 移除组件时, 组件对共享环境造成的修改必须完整且有序地撤回.

Cordis 把每个原子 effect 写成上下文变换和左逆. 正向操作返回修改后的上下文, 同时把 inverse 交给 runtime. 多个 effect 顺序执行时, inverse 按相反顺序组合, 形成 LIFO accumulator. 组件卸载只需执行 accumulator, 无需另写一份覆盖全部资源的集中清理函数. 这项保证仍有边界: runtime 能保证 inverse 被记录并按序调用, 不能验证作者提供的 inverse 在语义上确实撤回了正向操作.

### 1.2. 空间组合性要求依赖响应变化

组件还需要声明自己依赖哪些能力. 静态 module import 在程序启动前解析, 无法表达 provider 在运行中出现, 消失或替换. 容器编排能够处理 service 粒度的依赖, 却不能处理同一地址空间内函数与状态的细粒度关系. 论文将依赖的声明, 解析和生命周期响应称为 spatial composability.

Cordis 让组件以 coeffect specification 声明所需 key. 上下文中的 binding 每次改变, runtime 重新判断依赖是否满足. 未满足变为满足时激活组件, 满足变为未满足时卸载组件, provider 身份改变时先卸载再重载. 依赖者不需要轮询或订阅每个 provider 的自定义事件, 生命周期由统一上下文变化驱动.

### 1.3. 两个维度必须在同一上下文相遇

只做可撤销 effect, 组件仍要自行处理依赖变化; 只做响应式 coeffect, 卸载时仍可能泄漏资源. 论文将 effect context 与 coeffect context 合并成统一 context type, 要求组件的修改和依赖都经过它. 上下文既保存当前状态和 inverse accumulator, 也保存 key 到 realm, realm 到 value 的解析结构.

统一上下文还是组件归属的记录面. 操作在哪个 context 上调用, runtime 就能把其 inverse 归入对应 fiber. 子组件实例化也被视为父组件的一项 effect, 所以卸载父组件会沿 accumulator 移除子组件. 这种递归关系把单个 effect 的撤回扩展为组件树的生命周期撤回.

## 2. 可撤销 effect 的运行时结构

### 2.1. Effect context 保存状态与 accumulator

论文从上下文 $\Gamma$ 出发, 定义 effect context $\partial\Gamma=\Gamma\times(\Gamma\rightarrow\Gamma)$. 第一项是当前上下文状态 $\gamma$, 第二项 $\varphi$ 是至今所有 inverse 的复合. 初始状态为 $(\gamma_0,id_\Gamma)$. 当正向变换 $f$ 与 inverse $g$ 执行时, `track` 将状态改为 $f(\gamma)$, accumulator 改为 $\varphi\circ g$.

逆序是组合正确性的条件. 如果先做 $f_1$ 再做 $f_2$, 恢复必须先执行 $g_2$ 再执行 $g_1$. 论文用 twisted composition monoid 表达正向函数和 inverse 的相反组合顺序. `recover` 应用 accumulator 后将其重置, 从而让恢复操作自身可以继续参与更高一层 effect context.

### 2.2. Effect function 在应用点生成 inverse

同一个操作在不同状态上可能需要不同 inverse. 向 map 写入 key 时, inverse 必须知道此前是没有值还是有旧值, 以及旧值是什么. 因此 Cordis 不要求调用前固定一个全局逆函数, 而让 effect function 在看到当前状态并完成操作时返回此次应用专属的 inverse.

这也解释了为什么 effect 适合写成 iterator. 长时间异步初始化可能分几步获得资源, 每步完成后立即 yield 一个 inverse. 如果依赖在中途失效, runtime 停止 iterator, 只撤回已经完成的步骤. 未执行步骤没有 inverse, 已执行步骤不会因初始化未完成而泄漏.

### 2.3. 实现中的 `ctx.effect`

论文算法 1 的 `execute(callback, guard)` 驱动 effect iterator. 每次 `iter.next()` 得到一个 inverse, 就将它前置进复合恢复函数. 每步之前检查 guard, guard 失效便停止继续执行. `ctx.effect` 维护 `armed` 标志, 返回幂等 `dispose`: 第一次调用关闭 guard, 等待执行任务停在边界, 再执行已经积累的恢复; 后续调用直接返回.

组件 effect 的 inverse 又被加入父 context 的 `ctx.dispose`. 因而“创建子组件”与“写入共享 key”在撤回模型里没有特例, 都是父组件生命周期内的 effect. 这种收拢减少了分散清理入口, 但前提是所有环境修改都必须通过 context. 绕开 context 的全局变量, 原生计时器或第三方单例不受 accumulator 管理.

## 3. 响应式 coeffect 与生命周期状态机

### 3.1. Key, realm 与 value 的两层解析

Cordis 不让 key 直接指向 value. `@@isolate` 保存 key 到 realm symbol 的映射 $\rho$, `@@store` 保存 realm 到 value 的映射 $\sigma$. `ctx.get(key)` 先取 $\rho(k)$, 再取 $\sigma(\rho(k))$. 多一层 realm 允许子 context 把相同 key 重定向到独立 binding, 实现隔离域.

`ctx.intercept` 则不改变 key 解析到哪个值, 只合并访问该 key 时使用的 metadata. isolation 改变“找到谁”, interception 改变“怎样使用”. 两者通过派生 child context 实现, 丢弃 child 即恢复父视图, 不需要对父表执行反向修改.

### 3.2. Provider 身份比 value 相等更重要

Fiber 的 target 保存每个 key 对应的 provider fiber uid 元组, 并不直接保存依赖值. uid 新鲜且不复用. 即使新 provider 给出与旧 provider 深度相等的值, target 仍然变化, dependent 会重载. 相同值可能属于不同生命周期, 连接句柄和服务对象背后的资源也可能已经更换.

相反, 同一 provider 原地覆写 binding 不会触发 provider 身份变化. 需要传播替换语义的组件应撤回旧 binding 再安装新 binding. 该边界避免普通内部状态更新导致整个依赖图重载, 同时把“服务替换”表达成明确生命周期事件.

### 3.3. Inertial 状态机处理连续变化

Fiber 包含 target, committed view, state 与 inertia. `refresh` 重新计算 target. 若没有 transition 在运行, target 可满足便进入 LOADING, 不满足便进入 UNLOADING. 如果 transition 已在运行, 只更新 target, 不并行启动第二个 transition. 当前 reload 或 unload 必须完成, 结束时再根据最新 target 串联下一次转换.

这种 inertial 语义避免两个异步 teardown 或 initialize 同时修改同一 context. Reload 开始时提交依赖视图, effect iterator 每一步检查 target 是否仍等于起始值. 发生变化后停止继续初始化, 将已完成步骤的 inverse 加入 dispose, 随后进入 unload. Unload 完整执行 inverse 后, 若此时 target 又可满足, 再重新 load.

### 3.4. Provider 必须等 dependent 排空

Provider 开始卸载时先标记 UNLOADING, 从依赖解析角度立即停止提供服务, 但 binding 暂不删除. Notification 让 dependents 进入卸载, provider 等待所有受影响 dependent 的 transition 完成, 才执行自己的 dispose. 这样 dependent 的 teardown 仍可读取此前 committed 的 provider.

顺序解决了常见的关闭竞态. 如果先删除 provider, dependent 的清理代码可能无法归还连接或注销回调; 如果 provider 等待期间仍对新 dependent 可见, 又会产生新的使用者. “先离开可提供集合, 后保留资源到消费者排空”把发现状态与物理撤回分成两个时点.

## 4. 从局部机制到系统组合性

### 4.1. 独立性要求 effect 交换且不扰动结果

多个组件的 effect 交错执行时, 仅有各自 inverse 还不够. 组件 A 修改的状态如果改变组件 B 的 inverse 含义, 先撤 A 或先撤 B 可能得到不同结果. 论文定义 effect independence: 两边可达的正向变换和 inverse 需要交换, 且一方的变换不能改变另一方生成的 inverse 与 continuation.

要求按统一 context 的 observational equivalence 解释. 两个底层状态即使字节不同, 只要 context 暴露的所有操作和测试都无法区分, 就被视为相等. 这允许内部实现采用不同对象身份或表布局, 仍在公开操作层获得组合定律.

### 4.2. Coeffect 操作需要交换律

共享 key 上的操作如果顺序敏感, 不同组件交错就会破坏 confluence. 论文通过 isolation 将互不相关组件写入不同 realm, 或要求同一 coeffect 的公开操作满足交换. 典型实现可以让 key 暴露集合式注册, 每个组件增删自己的条目, 而不是让多个组件覆盖一个标量.

运行时不会证明这些交换律. 与 inverse 正确性一样, 它是 provider 作者对 key 表示的义务. 形式化定理说明满足义务后系统具有什么性质, Cordis 实现负责记录和调度, 没有动态验证任意 JavaScript 操作是否真正交换.

### 4.3. 演算证明的范围

第四章把 component 表示为包含 coeffect 需求, effect function, parent, lifecycle state 与 committed view 的 fiber. Orchestration rules 负责插入, retire 和移除, lifecycle rules 负责 begin, iterate, finish, divert, leave 与 unload. Confinement 约束组件只写自己的状态以及声明允许的共享区域.

在假设 inverse 正确, effect 独立, coeffect 交换且 orchestrator 动作有限的条件下, 论文证明 preservation, temporal composability, spatial composability, progress 与 confluence. Progress 不是说组件代码必然终止, 论文显式假设 effect iterator 和 inverse 最终返回. Confluence 也只针对相同 orchestration 动作序列, 并在 fiber 重命名与观察等价意义下成立.

## 5. Cordis 工程实现与实际边界

Cordis 把 effect 撤销、coeffect 解析和组件生命周期收进同一个 runtime.

### 5.1. 三层结构

Cordis core library 直接实现 `ctx.effect`, `ctx.get`, `ctx.set`, `ctx.isolate`, `ctx.intercept` 与 fiber lifecycle. Component loader 在 core 上增加声明式配置协调和 HMR. Koishi 再把消息, 命令, 数据库与插件等领域能力构建在前两层之上. Cordis 因而是 meta-framework, 不规定 Web, ORM 或 agent 业务接口.

配置项是跨重载保持的 entry 身份, fiber 则代表一次 enablement. 禁用 entry 会 retire 当前 fiber; 重启会创建新 fiber, 不把 retired fiber 重新改回可用. 这与形式化假设一致: 已进入 accumulator 的 fiber 保持退休, 防止创建者消失以后旧 fiber 再次激活.

### 5.2. 声明式配置协调

Loader 根据配置增删和修改 entry. 普通修改可以 retire 旧 fiber, 等 dependent 卸载, 再用新 payload 或 realm 建立新 fiber. 论文还给出 realm 就地迁移优化: 当隔离映射改变而 binding 确认属于该 entry 时, 可以把 store 中的 value 从旧 realm symbol 移到新 symbol, 只通知解析视图真正改变的 fiber.

该优化依赖 delta tag 判断 context 是否继承同一隔离分支. 它缩短 reload 路径, 但必须与从头卸载再装载的最终静止状态一致. 论文以形式化 confluence 作为短路径正确性的参照, 工程上仍需测试异常中断和多 key 同时迁移.

### 5.3. HMR 处理模块依赖闭包

HMR 先将改动模块分类为 accepted, declined 与 pending, 再沿 import graph 扩展. 一个 entry 的依赖树若接触 accepted 模块, 该 entry 需要重载; 接触 declined 边界则停止向下接纳. 重载前备份模块 cache, dispose 旧 fiber, 清 cache 并 import 新模块. 失败时恢复 cache 和旧模块, 重新实例化 entry.

这套 HMR 不迁移组件内部内存状态. 旧组件的 tracked effects 被撤回, 新组件从干净状态运行. 需要跨版本保存的数据应放在更长寿命 provider 中. 与 DSU 将旧对象转换成新结构相比, Cordis 少写迁移函数, 代价是组件局部 cache 和进行中计算默认不延续.

**5.4. Koishi 案例说明成熟度, 不构成性能评测:** 论文以 Koishi 插件生态作为案例, 展示 effect tracking 和 coeffect resolution 已用于实际框架. 案例能证明 API 可以承载真实插件, 配置与热重载, 也提供了从形式符号到 TypeScript 对象的对应表.

论文没有给出装卸延迟, notification 复杂度, 大规模依赖图吞吐或内存开销的量化基准. `notify` 伪代码遍历 live fibers 与 changed keys, 实际规模扩大后需要索引. 因此论文贡献主要是语义与实现结构, 不能据此判断 Cordis 相对重启进程或其他插件框架的性能优势.

## 6. 对 agent harness 的意义与限制

**6.1. 自修改需要可恢复控制面:** Agent harness 可能动态生成工具, 修改配置, 更换 memory provider 或加载子 agent 协议. 如果每次修改都重启进程, session 内状态与进行中任务会被中断; 如果直接替换代码, dependent 可能继续持有陈旧对象. Cordis 的 fiber 生命周期提供细粒度替换单位, 让 provider 退出可见性以后先排空 dependents, 再撤回资源.

这套机制不会自动判断模型生成的组件是否安全. Access control 与 sandboxing 仍需宿主系统提供. Context 可以成为权限检查的单一入口, 但组件若能绕开 context 访问文件系统, 网络或进程全局, 形式化保证不覆盖这些副作用. 对 agent 场景, capability API 与操作系统隔离仍不可缺少.

**6.2. 服务复用与分布式边界:** 一个 provider 可以在新版本启动后接收新请求, 旧版本等待已有请求排空再卸载, 形成 rolling update. 这要求请求本身以 tracked effect 或可等待资源表示. 若调用跨进程, 网络断开需要映射成 coeffect withdrawal, RPC client 也要在 inverse 中关闭.

论文核心演算针对单一 context 管理下的组件. 分布式系统中的消息延迟, 分区与重复通知会破坏“一个 orchestration action 接一个”的简化假设. 将模型扩展到服务编排需要版本化事件, 幂等 transition 和明确的一致性边界, 不能仅把本地 key 换成远程发现结果.

**6.3. 循环依赖由粒度设计解决:** 如果 A 依赖 B 才能激活, B 又依赖 A, 两者都会停在 INACTIVE. 论文不通过状态机猜测顺序打破循环, 而建议调整组件粒度, 提取共同 provider 或把某些依赖降为运行后可选能力. 这是空间组合性的建模要求: dependency graph 必须表达实际的启动前置条件.

版本约束同样不在当前 key 模型中自动解决. Key 主要表达能力身份, provider 与 dependent 还需在类型或 metadata 中协商版本. 如果同一 key 的接口发生不兼容修改, 仅凭 provider uid 变化只能触发重载, 不能保证新 dependent 调用正确.

**6.4. 论文自身问题与开放变量:** 形式化证明依赖多项由开发者承担而 runtime 不验证的义务: atomic inverse 正确, coeffect 操作交换, effect confinement 成立, iterator 与 inverse 最终返回. 这些条件在 JavaScript/TypeScript 中无法由普通类型系统完整表达. 论文将它们清楚地列为系统边界, 但真实插件违反条件时会得到怎样的诊断与隔离, 缺少实验.

工程评估没有量化结果. VSCode Top 100 扩展统计来自 2026 年 6 月 9 日, 论文给出 87 个含可执行代码, 7 个声明非内建 extensionDependencies, 但未公开抓取脚本和完整扩展列表. Koishi 案例没有报告插件数量, 热重载成功率, 平均恢复时间或资源泄漏对照.

92 页正文的主要篇幅用于演算与证明, 实现部分使用语言无关伪代码. Cordis 实际源码版本, commit, 测试矩阵与异常注入结果未在论文文本中形成可复核基准. HMR 回滚伪代码在恢复 cache 后重新实例化旧 entry, 但外部不可逆 effect, 模块顶层副作用和新模块 import 已触发的宿主副作用是否完全撤回, 仍取决于边界纪律.

尽管存在这些限制, 论文给出了一个清晰的不变量: 组件卸载只撤回通过自身 context 登记的 effect, dependent 使用 committed provider view 完成 teardown, provider 在 dependent 排空后才撤回 binding. 这一不变量比零散的 unload hook 和事件监听更容易测试. 对本地单进程 agent harness, 它提供了把动态工具, memory 和插件生命周期收拢进统一状态机的可执行方向.

这个不变量还明确区分了“目标状态变化”和“正在执行的 transition”. `refresh` 可以随时更新 target, 却不能中断后立刻并行执行相反 transition. 当前 reload 若发现 target 变化, 先停止 iterator, 保存已经产生的 inverse, 再完整 unload; 当前 unload 若结束时发现依赖恢复, 再启动 reload. 状态变化可以高频到达, 资源操作始终串行. 这与在回调中加入延迟或重复检查不同, 顺序由 fiber 状态机直接强制.

失败路径仍需宿主实现给出明确语义. 论文扩展部分允许 FAILED state 携带 error outcome, 但算法主体更关注依赖变化和正常撤回. 如果 effect callback 在 yield inverse 之前已经修改外部状态便抛错, runtime 没有可调用的 inverse; 如果 inverse 自身抛错, 后续 inverse 是否继续执行也会影响泄漏范围. 工程实现应要求 atomic effect 先准备恢复信息再暴露修改, 并采用聚合错误或 `finally` 策略继续尽可能多地清理. 这些规则没有由演算自动推出.

Notification 的实现成本同样值得单独测量. 算法 3 对所有 live fiber 和 changed key 进行检查, 朴素复杂度随 fiber 数量与 key 数量相乘. 实际框架可以维护 `(realm,key)` 到 dependent fiber 的反向索引, 把通知限制在相关集合; 但索引本身也必须作为 tracked state 随 fiber 装卸更新, 否则会留下陈旧 dependent. 论文伪代码选择全表扫描, 优先表达语义而非给出可扩展数据结构.

Committed view 的作用接近一次 lifecycle transaction 的依赖快照. Fiber 在 reload 开始时提交 provider 集合, 整个 active 周期和 teardown 都沿该集合解析. 新 provider 到来只改变 target, 不会让正在运行的清理逻辑半途读到新对象. 等旧 transition 结束以后, 下一次 reload 才提交新 view. 这种粒度比数据库事务长, 也意味着 provider 必须容忍 dependent 在排空期继续持有旧引用.

Context tree 为权限与隔离提供结构, 但 realm 不是安全边界. `ctx.isolate` 能让同一 key 在不同子树解析到不同 binding, 适合测试实例, 租户或插件局部服务; 如果不可信代码能取得父 context 或直接访问 store, 隔离便失效. Agent harness 使用该模型时, context capability 必须按最小权限传递, 内部 symbol slot 不应暴露给普通 component.

论文与自演化 agent 的联系主要是架构推论, 尚无对应实验. 完整的自修改流程还涉及新代码审查, 版本签名, 权限批准, 持久状态迁移和失败回滚. Cordis 解决的是已获准组件进入同一 runtime 后的生命周期组合, 不负责判断模型生成的代码是否应当执行. 将两者分开有助于避免把可卸载误当成安全执行.

从维护角度看, context paradigm 还提供了统一审计面. 每项 provider 安装, dependent 激活与 inverse 执行都能关联到 fiber uid 和 entry identity. 如果实现保留 transition 事件, 管理界面可以显示组件为何 inactive, 当前等待哪个 dependent, 哪个 inverse 失败. 论文没有规定 observability protocol, 但其状态机已经给出了稳定事件来源. 对长时间运行的 harness, 这种可解释性与自动恢复同样重要, 因为操作者需要区分依赖缺失, 初始化失败和正常排空.

后续验证可以构造三类压力测试. 第一类随机改变依赖拓扑并注入初始化延迟, 检查最终 quiescent state 是否与从头加载一致. 第二类在每个 yield 和 inverse 边界注入失败, 检查资源计数是否回到基线. 第三类反复 HMR 含共享 provider 的组件树, 记录 dependent 是否读到跨版本混合视图. 这些测试分别对应 confluence, temporal composability 与 spatial composability, 能把形式定理映射成工程可观测量.

还应增加长时间稳定性测试, 反复装卸同一组件并观察 registry, listener, timer, socket 与 heap 是否持续增长. 形式上的 accumulator 只能覆盖已经登记的 effect, 泄漏曲线能发现绕开 context 的资源. 将 fiber transition log 与资源快照关联后, 可以定位哪一次 effect 没有产生 inverse, 或哪一个 inverse 执行后状态没有回到基线. 这类证据会补足论文目前缺少的量化工程评估.

验证报告还应同时记录每次生命周期转换的目标视图与已提交视图，避免只看最终资源计数而遗漏过渡期读取了错误提供者的时序问题。
