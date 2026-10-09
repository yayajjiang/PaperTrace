---
title: "01 · A Programming Paradigm for Spatiotemporal Composability 论文中英对照"
category: "DeepSeek"
tags:
  - Agent Harness
  - 动态组合
  - Effect
  - Coeffect
published: true
excerpt: "时空组合性论文中英对照, 形式化定义、证明、算法和参考文献保留原文符号与代码."
---
# A Programming Paradigm for Spatiotemporal Composability · 时空组合性的编程范式

<!-- arXiv 2608.25512; 文字由 PyMuPDF 按页抽取, 公式与表以 data/sources/harness-composability/latex/ 的 LaTeX 源码为准 -->

<!-- page 1 of 92 -->

A Programming Paradigm for Spatiotemporal Composability

Yifan Shi1,2, Wei Zhang1, Tianyi Cui2

1Peking University 2DeepSeek-AI

Abstract

Modern software—from plugin systems to self-evolving agent harnesses—increasingly requires dynamic composition, yet its formal foundations remain underdeveloped. We identify two orthogonal dimensions of the problem: temporal composability, the ability to completely revert a component’s side effects upon removal, and spatial composability, the ability to declare and reactively manage inter-component dependencies. We address the two dimensions by lifting classical effect and coeffect concepts to runtime mechanisms. In particular, we formalize revertible effects, in which every context transformation carries an inverse that the runtime holds, establishing temporal composability local to one component. We formalize reactive coeffects, in which every context change is classified against a component’s coeffect specification to drive its activation and deactivation, establishing spatial composability local to one component. We then unify the effect context and the coeffect context into a single context type and mediate every effect and coeffect through it, yielding a discipline we call the context paradigm; the mediation induces an observational equivalence up to which the effects of distinct components interleave without disturbing one another. Combining these mechanisms into the notion of a component, we give a calculus of dynamic composition whose metatheory carries spatiotemporal compos­ ability from a single component to a whole system of interleaved components. We implement these ideas in Cordis, a meta-framework of spatiotemporal composability that provides a core library with effect tracking and coeffect resolution, as well as a declarative component loader with configuration reconciliation and hot module replacement.

现代软件从插件系统到自演化 agent harness, 越来越依赖动态组合, 相应的形式化基础却尚不成熟. 我们识别出两个相互正交的维度: 时间组合性要求移除组件时完整撤回其副作用, 空间组合性要求声明并响应式管理组件之间的依赖. 我们把经典 effect 与 coeffect 概念提升为运行时机制来处理两项要求. 可撤销 effect 让每次上下文变换都携带由 runtime 保存的 inverse, 建立单组件局部的时间组合性. 响应式 coeffect 将每次上下文变化按组件的 coeffect specification 分类, 据此驱动激活与停用, 建立单组件局部的空间组合性. 随后, 我们把 effect context 与 coeffect context 统一为一种 context type, 所有 effect 和 coeffect 都经它中介, 形成 context paradigm. 这种中介关系诱导出观察等价, 不同组件的 effect 能够在该等价意义下交错而互不干扰. 两套机制组合成 component 后, 我们给出动态组合演算, 其元理论把单组件的时空组合性提升到由交错组件组成的完整系统. Cordis 实现了这些思想: 它是时空组合性元框架, core library 提供 effect tracking 与 coeffect resolution, 声明式 component loader 提供配置协调和 hot module replacement.

1

<!-- page 2 of 92 -->

Contents

1. Introduction . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠4

1.1. Dimensions of Composability . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠4

1.2. Motivating Examples . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠4

1.2.1. Plugin Systems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠4

1.2.2. Self-Evolving Agent Harnesses . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠5

1.2.3. The Coarse-Grained Workaround . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠5

1.3. Contributions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠6

2. Preliminaries . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠7

2.1. Effects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠7

2.2. Coeffects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠7

2.3. Relationship to Dynamic Composability . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠8

3. Revertible Effects and Reactive Coeffects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠9

3.1. Revertible Effects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠9

3.1.1. Effect Context . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠9

3.1.2. Effect Functions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠12

3.1.3. Effect Iterators . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠15

3.2. Reactive Coeffects . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠16

3.2.1. Coeffect Context . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠17

3.2.2. Specification and Notification . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠18

3.2.3. Isolation and Interception . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠19

3.3. The Context Paradigm . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠21

3.3.1. Unified Context . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠21

3.3.2. Observational Equivalence . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠23

3.4. Attaining Independence . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠26

3.4.1. Effect Independence . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠26

3.4.2. Coeffect Commutativity . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠28

4. A Calculus of Dynamic Composition . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠31

4.1. Components and Fibers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠31

4.2. The Calculus . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠34

4.2.1. Orchestration . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠34

4.2.2. Lifecycle . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠35

4.2.3. Confinement . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠38

4.3. Metatheory . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠39

2

<!-- page 3 of 92 -->

4.3.1. Preservation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠43

4.3.2. Temporal Composability . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠44

4.3.3. Spatial Composability . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠47

4.3.4. Progress . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠49

4.3.5. Confluence . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠51

4.4. Extensions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠55

5. Implementation and Case Study . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠57

5.1. Core Library . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠57

5.1.1. Effect Tracking . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠59

5.1.2. Coeffect Operations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠60

5.1.3. Component Lifecycle . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠61

5.1.4. Context Access . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠64

5.2. Component Loader . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠64

5.2.1. Declarative Configuration . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠65

5.2.2. Hot Module Replacement . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠67

5.3. Case Study: Koishi . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠69

6. Discussion . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠70

6.1. System Boundary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠70

6.2. Service Multiplexing . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠71

6.3. Access Control and Sandboxing . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠72

6.4. Language Independence and Selection . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠73

6.5. Mutual Dependencies and Component Granularity . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠74

6.6. Dependency Typing and Versioning . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠75

6.7. Co-Design with Languages and Operating Systems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠76

7. Related Work . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠77

7.1. Effect and Coeffect Systems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠77

7.2. Programming Paradigms . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠78

7.3. Temporal Composability . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠79

7.4. Spatial Composability . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠81

8. Conclusion . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠82

References . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ⁠83

3

<!-- page 4 of 92 -->

1. Introduction

1. 引言

Composition—assembling complex systems from simpler parts—is a foundational principle of software engineering [1]. Traditionally, composition is static: function calls, module imports, and class inheritance are resolved at compile time and remain fixed throughout execution. However, modern software increasingly demands dynamic composition, where components are loaded, unloaded, and reconfigured at runtime. Plugin architectures [2] and self-evolving agent harnesses both require systems that can safely add and remove functionality on the fly, yet current practice defers to coarse-grained mechanisms [3] that reconfigure only by restarting, discarding runtime state. Despite the growing practical importance of dynamic composition, its theoretical foundations remain underdeveloped, compared to the rich formal frameworks available for static composition.

组合是用简单部件构造复杂系统, 属于软件工程的基本原则 [1]. 传统组合是静态的: 函数调用, 模块导入与类继承在编译时解析, 执行期间保持固定. 现代软件则日益需要动态组合, 即运行时装载, 卸载和重配组件. 插件架构 [2] 与自演化 agent harness 都需要安全地即时增删功能, 现有实践却多依赖粗粒度机制 [3], 只能通过重启重配并丢弃运行时状态. 动态组合的实践重要性持续上升, 其理论基础却远弱于静态组合已有的形式体系.

1.1. Dimensions of Composability

1.1. 组合性的两个维度

To characterize the requirements of dynamic composition, we identify two orthogonal dimen­ sions beyond the well-studied algebraic aspects of composition:

为刻画动态组合的要求, 我们在已经得到充分研究的组合代数性质之外, 识别出两个正交维度:

• Temporal composability addresses the time dimension: upon removal of a component, the modifications the component made to the shared environment must be completely and safely reversed. This requires tracking every resource allocation, event registration, and state mutation the component performs, and guaranteeing their orderly reclamation upon removal. • Spatial composability addresses the space dimension: components must be able to declare, discover, and resolve their dependencies on one another in a structured and verifiable manner. This requires managing dependency topology and coordinating com­ ponent lifecycles in response to dependency changes.

• 时间组合性处理时间维度: 移除组件时, 组件对共享环境所做的修改必须被完整且安全地撤销. 系统需要追踪组件执行的每次资源分配, 事件注册与状态变更, 并保证移除时有序回收. • 空间组合性处理空间维度: 组件必须能够以结构化且可验证的方式声明, 发现和解析彼此依赖. 系统需要管理依赖拓扑, 并随依赖变化协调组件生命周期.

In the static setting, temporal composability reduces to lexical scoping (e.g., RAII [4], bracket patterns [5]), and spatial composability reduces to module import resolution [6]. In the dynamic setting, where components arrive and depart at runtime, both dimensions become significantly harder: temporal composability must handle long-lived, stateful effects whose scope is not lexically bounded; and spatial composability must handle dependencies that appear, disappear, or change identity during execution.

静态场景中的时间组合性可归约为词法作用域, 如 RAII [4] 和 bracket pattern [5], 空间组合性可归约为模块导入解析 [6]. 组件在运行时加入和离开的动态场景使两者都更困难: 时间组合性必须处理没有词法边界的长寿命有状态 effect; 空间组合性必须处理执行期间出现, 消失或改变身份的依赖.

1.2. Motivating Examples

1.2.1. Plugin Systems

1.2.1. 插件系统

Plugin systems are a canonical instance of dynamic composition. We use Visual Studio Code (VSCode), one of the most widely-used extensible IDEs, as a representative example.

Temporal limitation. VSCode runs all extensions in a shared process called the extension host. Although extensions can be installed dynamically, this host provides no mechanism to unload an individual extension’s code at runtime. Once an extension’s activate function has executed, disabling or uninstalling it requires restarting the entire host, affecting all loaded extensions. Purely declarative extensions such as themes, keybindings, and snippets carry no

4

<!-- page 5 of 92 -->

code and can be removed freely. Among the top 100 extensions by install count, however, 87 contain executable code1 and will therefore require such a restart upon removal. Although VSCode provides a deactivate hook, it serves only as a graceful shutdown callback during the host process’ termination, and thus does not enable live removal. Moreover, the hook separates effect disposal from effect creation (in activate), violating locality of concern and making complete cleanup difficult to verify.

插件系统是动态组合的典型实例, 本文以广泛使用的可扩展 IDE Visual Studio Code (VSCode) 为代表. 时间维度上, VSCode 在共享的 extension host 进程中运行所有扩展. 扩展可以动态安装, 但 host 无法在运行时卸载单个扩展代码. 一旦 `activate` 已执行, 禁用或卸载扩展就要重启整个 host, 并影响其他扩展. 纯声明式 theme, keybinding 与 snippet 没有代码, 可以自由移除; 安装量前 100 的扩展中有 87 个包含可执行代码, 因而移除时需要重启. `deactivate` 只是 host 终止时的优雅关闭回调, 不能实现在线移除; 它还把 effect disposal 与 `activate` 中的 effect creation 分开, 难以核验清理是否完整.

Spatial limitation. VSCode does provide extensionDependencies for declaring dependen­ cies between extensions, but it sees little use: among the top 100 extensions by install count, only 7 declare extensionDependencies on non-built-in extensions.1 This scarcity reflects the shape of the extension API, which exposes fixed, surface-level extension points such as com­ mands, views, and language features. Extensions contribute to the host through these points rather than depending on one another, so inter-extension dependencies rarely arise. Moreover, VSCode’s mechanism for inter-extension interaction provides no structural contract: it exposes an extension’s functionality to others through vscode.extensions.getExtension(...).exports, but the returned value is untyped (any by default), so the dependent cannot rely on a checked interface. In short, VSCode steers extensions toward a fixed set of host-provided extension points, and offers no safe, structured way for them to depend on one another.

These two limitations are not unique to VSCode; they recur across plugin systems generally [2, 7], differing only in degree.

空间维度上, VSCode 提供 `extensionDependencies` 声明扩展依赖, 但使用很少: 安装量前 100 的扩展中, 只有 7 个声明对非内建扩展的依赖. 扩展 API 主要暴露 command, view 与 language feature 等固定入口, 扩展通常通过这些入口向 host 提供功能, 很少直接互相依赖. 扩展间交互也没有结构化契约: `vscode.extensions.getExtension(...).exports` 返回的值默认是无类型的 `any`, dependent 不能依赖经过检查的接口. 这些限制在各类插件系统中反复出现, 只是程度不同.

1.2.2. Self-Evolving Agent Harnesses

1.2.2. 自演化 Agent Harness

Modern AI agents rely on runtime agent harnesses [8–10]. These systems may compose diverse tool suites [11] and execution environments, govern permissions and sandboxing, maintain session state and persistence, provide context management and memory systems [12], orches­ trate subagents and multi-agent workflows [13], and expose interfaces to users and automation. A future harness may generate and deploy modifications to its own components while contin­ uously serving requests. Model-synthesized reusable tools provide a narrower precursor to component-level self-modification [14]. Each such modification is itself an instance of dynamic composition.

现代 AI agent 依赖运行时 harness [8–10]. Harness 可以组合工具集 [11] 与执行环境, 管理权限和沙箱, 维护 session state 与 persistence, 提供 context management 与 memory [12], 编排 subagent 和 multi-agent workflow [13], 并向用户与自动化系统提供接口. 未来 harness 可能在持续服务请求时生成并部署对自身 component 的修改; 模型生成可复用工具 [14] 是 component 级自修改的早期形式. 每次修改都属于动态组合.

Because these modifications occur continuously and with limited or no human oversight, dynamic composability becomes indispensable. Without temporal composability, each self- modification forces a full restart that discards all process-local accumulated state; at such frequency the cumulative unavailability becomes substantial, and in-flight tasks are disrupted repeatedly; even worse, a faulty self-modification can disable the very process needed to recover. Without spatial composability, each module must itself detect and adapt to changes in the modules it depends on as they appear, disappear, or change identity, and can do so only by ad hoc means; even worse, a naive code-replacement strategy may silently break dependents or introduce circular dependencies that surface only at reload time.

这类修改持续发生且人工监督有限, 因此动态组合性不可缺少. 没有时间组合性, 每次自修改都会强制完整重启, 丢弃进程内累计状态, 反复中断进行中任务, 错误修改甚至可能破坏用于恢复的进程. 没有空间组合性, 每个 module 都要自行检测 dependent module 的出现, 消失与身份变化, 只能采用临时机制; 直接替换代码还可能静默破坏 dependent, 或在 reload 时才暴露循环依赖.

1.2.3. The Coarse-Grained Workaround

1.2.3. 粗粒度替代方案

One reason dynamic composability has received limited formal attention is that operating systems and container orchestrators already provide a coarse-grained substitute. Operating systems yield temporal composability at the granularity of a process; container orchestrators

1Data retrieved from the Visual Studio Code Marketplace on June 9, 2026.

5

<!-- page 6 of 92 -->

[3] yield spatial composability at the granularity of a service. In practice, most software toler­ ates the lack of fine-grained composability by deferring to these coarse-grained mechanisms: a misbehaving module is handled by restarting the process, and a service dependency is managed by the container orchestrator.

动态组合缺少形式研究的原因之一, 是操作系统与容器 orchestrator 已提供粗粒度替代. 操作系统在 process 粒度提供时间组合性, container orchestrator [3] 在 service 粒度提供空间组合性. 许多软件通过重启 process 处理异常 module, 通过 orchestrator 管理 service dependency.

However, this workaround imposes substantial costs. Temporally, each restart discards all process-local accumulated state (e.g., caches, connections, partial computations), and rebuild­ ing it takes seconds to minutes [15]; maintaining availability in the interim requires redundant replicas, incurring resource overhead to compensate for the inability to recover a single component. Spatially, container-level orchestration cannot express dependencies between com­ ponents sharing an address space, and introduces network overhead for interactions that could be local function calls. Both mechanisms operate at the boundary of processes and containers, yet modern systems increasingly compose at a finer level. This granularity mismatch demands a compositional abstraction that manages effects and dependencies at the same level as the components themselves.

这种替代成本明显. 时间上, 每次重启都丢弃 cache, connection 与 partial computation 等进程内状态, 重建需要数秒至数分钟 [15]; 为维持可用性还要保留冗余 replica. 空间上, container 级编排不能表达同一地址空间内 component 的依赖, 并把原本可用本地函数调用的交互变成网络开销. 进程和容器边界比现代系统的组合单位更粗, 因而需要在 component 同一粒度管理 effect 与 dependency.

1.3. Contributions

1.3. 贡献

The two dimensions of dynamic composability concern, respectively, how computations modify and how they depend on their environment. These two directions are what effect systems [16, 17] and coeffect systems [18, 19] formalize: effects provide the formal vocabulary for reasoning about environmental modifications, and coeffects for reasoning about environmental require­ ments. However, existing formulations restrict reasoning to compile-time analysis over lexically fixed scopes, and do not extend to dynamic scenarios where components arrive and depart at runtime. By lifting effects to a revertible runtime model and coeffects to a reactive dependency resolution mechanism, we obtain a unified formal foundation for dynamic composability, one that is language-agnostic and applicable to any software architecture requiring dynamic composition. We make the following contributions:

动态组合的两个维度分别涉及 computation 怎样修改环境以及怎样依赖环境. Effect system [16, 17] 为环境修改提供形式词汇, coeffect system [18, 19] 为环境需求提供形式词汇. 现有形式仅对词法作用域固定的程序进行编译期分析, 不能处理运行时 component 加入与离开. 本文把 effect 提升为可撤销 runtime model, 把 coeffect 提升为响应式 dependency resolution, 得到与语言无关的动态组合基础.

1. We formalize revertible effects (Section 3.1): every context transformation carries an explicit inverse that the runtime holds, and both tracking and recovery preserve com­ position, so the context is recovered upon component removal. This establishes local temporal composability. 2. We formalize reactive coeffects (Section  3.2): a component declares the coeffects it requires as a specification, and each change of the context is classified against that speci­ fication as activating, deactivating, or neutral, driving the component’s activation and deactivation. This establishes local spatial composability. 3. We introduce the context paradigm (Section 3.3): the effect context and the coeffect con­ text are unified into a single context type, every effect and coeffect is mediated through it, and the mediation induces an observational equivalence up to which the effects of distinct components attain independence. 4. We develop a calculus of dynamic composition (Section 4), which combines the two mechanisms into the notion of a component and gives them an operational semantics. The metatheory then carries spatiotemporal composability from a single component to a whole system of interleaved components. 5. We implement these ideas in Cordis (Section 5), a meta-framework of spatiotemporal composability that provides a core library realizing the formal model with effect tracking and coeffect resolution, as well as a declarative component loader with configuration reconciliation and hot module replacement.

贡献包括五项: 形式化可撤销 effect, 让每次 context transformation 携带 runtime 保存的 inverse; 形式化响应式 coeffect, 按 specification 将 context change 分成 activating, deactivating 或 neutral; 引入统一 effect 与 coeffect context 的 context paradigm; 构造 dynamic composition calculus 并证明单组件保证可提升到交错 component system; 在 Cordis 中实现 effect tracking, coeffect resolution, 声明式 component loader, 配置协调与 HMR.

6

<!-- page 7 of 92 -->

2. Preliminaries

2. 预备知识

This section provides a concise overview of effect and coeffect systems—the two theoretical pillars underlying our work. We assume familiarity with basic type theory and category theory; the goal here is to fix notation and introduce the key abstractions that Section 3 will operationalize as runtime mechanisms.

本节简要回顾 effect 与 coeffect system, 它们是全文的两项理论基础. 读者应熟悉基础类型论与范畴论; 本节用于固定记号, 并介绍第 3 节将变成运行时机制的核心抽象.

2.1. Effects

In the simply typed lambda calculus (STLC) [20, 21], a typing judgment Γ ⊢𝑡: 𝑇 states that term 𝑡 has type 𝑇 under context Γ. An effect system refines the type to describe what side effects a computation may produce, yielding judgments of the form

Γ ⊢𝑡: 𝑇effect (1)

Here, the result type is annotated with an element of an effect algebra that describes which side effects the computation may produce, enabling compositional reasoning about stateful computations. This approach originates with Lucassen and Gifford [22], who introduced a kinded type system distinguishing types, effects, and regions to discover scheduling constraints in parallel programs.

Monadic effects. Moggi [16] first modeled computational effects categorically via monads; Wadler [23] popularized the approach in Haskell. A monad (𝑇, 𝜂, 𝜇) on a category 𝒞︀ encap­ sulates an effectful computation as a value of type 𝑇(𝐴), with 𝜂: 𝐴→𝑇(𝐴) lifting pure values and 𝜇: 𝑇(𝑇(𝐴)) →𝑇(𝐴) sequencing nested computations. Classic instances include the Maybe monad (for partiality), State monad (for mutable state), and IO monad (for external interaction).

Algebraic effects. Plotkin and Power [17, 24] showed that algebraic operations determine monads, establishing a framework in which effect interfaces are decoupled from their imple­ mentations. An effect signature Σ declares a set of operations (e.g., get : () →𝑆, put : 𝑆→() for state); programs invoke operations freely without committing to a particular interpretation. Plotkin and Pretnar [25] subsequently introduced effect handlers, which interpret operations by providing continuation semantics:

handle 𝑒with { op(𝑣, 𝜅) ↦… } (2)

The handler receives the operation argument 𝑣 and the delimited continuation 𝜅, which it may invoke zero, one, or multiple times, enabling exceptions, coroutines, and non-determinism within a uniform framework [26]. Languages such as Koka [27, 28], Eff [29], and OCaml 5 [30] have adopted algebraic effects with varying design trade-offs.

2.2. Coeffects

Dually to effects, a coeffect system [18, 31] enriches the context rather than the type, yielding judgments of the form

Γcoeffect ⊢𝑡: 𝑇 (3)

Here, the context is annotated with an element of a coeffect algebra describing what the computation requires from its environment, such as resources to access, permissions to hold,

### 第 7 页中文对照

在简单类型 λ 演算（STLC）[20, 21] 中，类型判断 Γ ⊢ 𝑡 : 𝑇 表示项 𝑡 在上下文 Γ 下具有类型 𝑇。Effect system 进一步细化类型，用来描述计算可能产生哪些副作用，因此得到式（1）所示的判断。

这里，结果类型由 effect algebra 的元素标注；该元素描述计算可能产生的副作用，从而能够组合式地推理有状态计算。这一方法源于 Lucassen 与 Gifford [22]：他们提出区分 type、effect 与 region 的 kinded type system，以发现并行程序中的调度约束。

**单子式 effect。** Moggi [16] 先用 monad 从范畴论角度为计算 effect 建模，Wadler [23] 随后在 Haskell 中推广了这一方法。范畴 𝒞 上的 monad (𝑇, 𝜂, 𝜇) 把带 effect 的计算封装为 𝑇(𝐴) 类型的值，其中 𝜂 把纯值提升到 𝑇(𝐴)，𝜇 则把嵌套计算顺序化。典型实例包括表示部分性的 Maybe monad、表示可变状态的 State monad，以及表示外部交互的 IO monad。

**代数 effect。** Plotkin 与 Power [17, 24] 证明代数操作能够确定 monad，由此建立了一套将 effect 接口与实现解耦的框架。Effect signature Σ 声明一组操作；程序可以自由调用这些操作，而无需预先绑定具体解释。Plotkin 与 Pretnar [25] 进一步提出 effect handler，通过 continuation semantics 解释操作。

Handler 接收操作参数 𝑣 和定界 continuation 𝜅；它可以调用 continuation 零次、一次或多次，从而在统一框架中表达异常、协程和非确定性 [26]。Koka [27, 28]、Eff [29] 与 OCaml 5 [30] 等语言以不同设计取舍采用了代数 effect。

与 effect 对偶，coeffect system [18, 31] 细化的是上下文而非类型，由此得到式（3）所示的判断。这里，上下文由 coeffect algebra 的元素标注，用来描述计算对环境提出的要求，例如需要访问的资源、必须持有的权限，

7

<!-- page 8 of 92 -->

or services to depend on. While effects model a program’s impact on the world, coeffects model the world’s constraints on the program.

Comonadic coeffects. The idea of using comonads to structure context-dependent computation was first developed by Uustalu and Vene [32], who proposed symmetric (semi)monoidal comonads as the dual of Moggi’s monadic framework for effects, capturing notions such as dataflow and attribute evaluation. Petricek et al. [18] built on this foundation to propose coeffects as a unified static analysis of context-dependence. A comonad (𝐷, 𝜀, 𝛿) captures context-dependent computation: 𝜀: 𝐷(𝐴) →𝐴 extracts the current value from a con­ text, and 𝛿: 𝐷(𝐴) →𝐷(𝐷(𝐴)) duplicates context for nested access. The Environment comonad 𝐷(𝑋) = 𝐸× 𝑋 models dependence on a fixed environment 𝐸; the Stream comonad 𝐷(𝑋) = ℕ→𝑋 models dependence on temporal data.

Graded coeffects. For finer-grained tracking, graded coeffect systems use a pre-ordered semiring 𝒮︀= (𝑆, ≤, +, ×, 0, 1) as the coeffect algebra [33], a discipline later unified with graded effects by Gaboardi et al. [19]. Elements of 𝑆 annotate each variable binding to quantify its usage: 0 for unused, 1 for linear use, 𝑛 for bounded use, ∞ for unrestricted use. The semiring operations compose coeffects sequentially (×) and in parallel (+), enabling precise resource tracking, sensitivity analysis [34], and information-flow control [35, 36] within a unified alge­ braic framework [37].

2.3. Relationship to Dynamic Composability

Effect and coeffect systems organize reasoning about computation along two complementary directions: effects describe how a computation modifies its environment, whereas coeffects describe how it depends on its environment. These two directions correspond to the two dimen­ sions of dynamic composability identified in Section 1:

• Temporal composability demands that a component’s modifications to the shared envi­ ronment be revertible upon unloading. The relevant effects are the stateful ones, which durably transform that environment; undoing such a transformation requires it to admit an inverse. • Spatial composability demands that inter-component dependencies be declared and managed reactively. Such dependencies are the very thing coeffects capture, and manag­ ing them amounts to resolving each against what the environment supplies.

However, classical effect and coeffect systems are static instruments: effects are tracked within lexically fixed scopes and discharged by compile-time handlers; coeffect annotations are verified against contexts determined before execution. Dynamic composition, by contrast, requires these guarantees to hold for components that arrive and depart at runtime, against contexts that evolve continuously. No fixed lexical scope can delimit a plugin loaded after deployment; no compile-time context can anticipate dependencies that emerge from runtime configuration.

This motivates a shift in perspective: rather than extending static type systems with more annotations, we reify the conceptual structures of effects and coeffects so that a runtime can operate on them directly, establishing dynamically the guarantees these systems provide stat­ ically.

### 第 8 页中文对照

或所依赖的服务。Effect 描述程序对世界造成的影响，而 coeffect 描述世界对程序施加的约束。

**余单子式 coeffect。** Uustalu 与 Vene [32] 最早用 comonad 组织依赖上下文的计算，并以对称（半）幺半 comonad 作为 Moggi 单子式 effect 框架的对偶，用来刻画 dataflow、attribute evaluation 等概念。Petricek 等人 [18] 在此基础上把 coeffect 提炼为上下文依赖的统一静态分析。Comonad (𝐷, 𝜀, 𝛿) 表示依赖上下文的计算：𝜀 从上下文中提取当前值，𝛿 为嵌套访问复制上下文。Environment comonad 表示对固定环境的依赖，Stream comonad 表示对时序数据的依赖。

**分级 coeffect。** 为进行更细粒度的追踪，graded coeffect system 使用预序半环作为 coeffect algebra [33]，Gaboardi 等人 [19] 后来将其与 graded effect 统一。半环元素标注每个变量绑定，以量化其使用方式：0 表示不用，1 表示线性使用，𝑛 表示有界使用，∞ 表示无限制使用。半环运算分别按顺序和并行组合 coeffect，从而在统一代数框架 [37] 下支持精确资源追踪、敏感度分析 [34] 与信息流控制 [35, 36]。

Effect 与 coeffect system 沿两个互补方向组织计算推理：effect 描述计算怎样修改环境，coeffect 描述计算怎样依赖环境。这两个方向正对应第 1 节识别出的动态组合性维度。

时间组合性要求组件卸载时能够撤销它对共享环境的修改。相关 effect 是会持久改变环境的有状态 effect；撤销这种变换要求它具有逆。空间组合性要求以声明方式表达组件间依赖，并进行响应式管理。依赖正是 coeffect 所刻画的对象；管理依赖，就是把每项需求与环境所提供的内容进行解析匹配。

然而，经典 effect 与 coeffect system 都是静态工具：effect 在词法固定的作用域内追踪，并由编译期 handler 消解；coeffect 标注则根据执行前确定的上下文验证。动态组合要求这些保证也适用于运行时加入和离开的组件，以及持续演化的上下文。部署后才加载的插件没有固定词法作用域可以界定，编译期上下文也无法预见运行时配置产生的依赖。

因此需要改变视角：不再只给静态类型系统增加标注，而是把 effect 与 coeffect 的概念结构具体化，使运行时可以直接操作它们，从而动态建立这些体系原本静态提供的保证。

8

<!-- page 9 of 92 -->

3. Revertible Effects and Reactive Coeffects

3. 可撤销 Effect 与响应式 Coeffect

This section lifts the concepts of effects and coeffects introduced in Section  2 to runtime mechanisms, constructing a theory of dynamic composition. The central idea is to turn the typing contexts carrying effects and coeffects into context types, runtime-operable types that reify the context as a first-class entity. Section 3.1 models an effect as a context transformation paired with an inverse that the runtime holds, establishing temporal composability local to one component; Section 3.2 models a coeffect as a declared dependency against which every context change is classified, establishing its spatial counterpart. Each local guarantee stops where other components enter. Toward the global form of both, Section 3.3 unifies the two contexts into one and introduces the context paradigm: every effect and coeffect is mediated through the unified context, and the mediation induces the observational equivalence up to which every later equality is read. Section 3.4 then establishes effect independence and coeffect commutativity, under which the effects of distinct components interleave without disturbing one another.

本节把第 2 节的 effect 与 coeffect 提升成运行时机制, 建立动态组合理论. 核心做法是把携带 effect 与 coeffect 的 typing context 变成 context type, 即把上下文具体化成 runtime 可操作的一等实体. 第 3.1 节把 effect 建模为 context transformation 与 runtime 持有的 inverse, 建立单组件局部时间组合性. 第 3.2 节把 coeffect 建模为声明式依赖, 每次 context change 都按它分类, 建立对应的局部空间组合性. 局部保证在其他组件进入时截止. 为获得全局形式, 第 3.3 节统一两种 context, 引入 context paradigm: 所有 effect 和 coeffect 都经统一 context 中介, 中介操作诱导出后续等式采用的 observational equivalence. 第 3.4 节再建立 effect independence 与 coeffect commutativity, 使不同组件的 effect 可以交错而互不扰动.

3.1. Revertible Effects

Temporal composability is the ability to load and unload components at runtime such that, upon unloading, the shared environment is recovered to its pre-composition state. This requires that every modification a component makes to the environment be both trackable and recoverable. We therefore model an effect as a function of type Γ →Γ × (Γ →Γ): applied to the current context, it yields the modified context together with an explicit inverse. Supplying that inverse is what lets the effect be reverted, and returning it to the runtime is what makes the effect trackable. We call such effects revertible: by composing these inverses during execution, local temporal composability becomes a structural guarantee.

3.1.1. Effect Context

Given any impure function 𝑓: 𝑋⇝𝑌, we transform it into a pure form 𝑓: Γ × 𝑋→Γ × 𝑌, where Γ is the context type. On this pure form, all possible side effects can be represented as transformations on Γ: for any fixed input 𝑥: 𝑋, the induced map 𝛾↦pr1(𝑓(𝛾, 𝑥)) : Γ →Γ captures the side effect of 𝑓 independently of the return value. Effects on Γ therefore live in the monoid of transformations Γ →Γ under composition ∘, where each monoid axiom has a direct reading as a property of effects:

• Closure: the sequential composition of two effects is again an effect; • Associativity: a composite effect is independent of how it is bracketed; • Identity: idΓ, the identity function on Γ, acts as the unit of composition.

To model effects that can be undone, we pair each transformation 𝑓 with another transfor­ mation 𝑔 that undoes 𝑓, and call 𝑔 a left inverse of 𝑓, abbreviated to inverse throughout the paper. Undoing is one-sided: what an inverse is held to is 𝑔∘𝑓 and never 𝑓∘𝑔. Pairs of transformations carry a multiplication of their own:

Definition 1. Define the twisted composition of pairs of context transformations by

(𝑓1, 𝑔1) ∘(𝑓2, 𝑔2) ≔(𝑓1 ∘𝑓2, 𝑔2 ∘𝑔1) (4)

As for ∘ itself, the left operand acts after the right, and the inverses accumulate in the opposite order. It makes (Γ →Γ) × (Γ →Γ) a monoid with unit (idΓ, idΓ), the product of the monoid of transformations with its opposite, which we call the twisted composition monoid 𝔗Γ over Γ.

### 第 9 页中文对照

时间组合性意味着组件能够在运行时装载和卸载，并且卸载后共享环境恢复到组合前的状态。这要求组件对环境所做的每项修改都可追踪、可恢复。因此，我们把 effect 建模为 Γ → Γ × (Γ → Γ) 类型的函数：它作用于当前上下文后，返回修改后的上下文以及一个显式 inverse。提供 inverse 使 effect 可以撤销，把 inverse 交给运行时则使 effect 可以追踪。我们称这类 effect 为可撤销 effect；执行期间组合这些 inverse，就能从结构上保证组件局部的时间组合性。

给定任意非纯函数 𝑓 : 𝑋 ⇝ 𝑌，我们将其转换为纯形式 𝑓 : Γ × 𝑋 → Γ × 𝑌，其中 Γ 是 context type。在这一纯形式上，所有副作用都可表示为 Γ 上的变换。固定输入后，由 𝑓 诱导出的映射只捕获其副作用，与返回值无关。因此，Γ 上的 effect 属于以函数复合为运算的变换幺半群：封闭性表示两个 effect 的顺序组合仍是 effect；结合律表示复合 effect 不依赖括号方式；单位元 idΓ 表示恒等变换。

为给可撤销 effect 建模，我们把每个变换 𝑓 与另一个撤销它的变换 𝑔 配对，并称 𝑔 为 𝑓 的左逆，全文简称 inverse。这里撤销是单向的：只要求 𝑔 ∘ 𝑓，而不要求 𝑓 ∘ 𝑔。变换对还具有定义 1 给出的自身乘法。

和普通复合一样，左操作数后执行；inverse 则以相反顺序累积。这使变换对的集合成为以 (idΓ, idΓ) 为单位元的幺半群，也就是变换幺半群与其反幺半群的乘积。本文称之为 Γ 上的扭曲复合幺半群 𝔗Γ。

9

<!-- page 10 of 92 -->

To track effects within the context itself, we introduce the following definition:

Definition 2. Given a context Γ, define its effect context as:

𝜕Γ ≔Γ × (Γ →Γ) (5)

It can be understood as a pair (𝛾, 𝜑), where:

• 𝛾: Γ is the current context state; • 𝜑: Γ →Γ is the accumulator, the composite of the inverses of the effects performed so far, and the function that recovers the context to its initial state. In particular, the initial effect context can be represented as (𝛾0, idΓ).

We also write 𝜕2Γ for 𝜕(𝜕Γ) = 𝜕Γ × (𝜕Γ →𝜕Γ); iterating 𝜕 this way yields the tower Γ, 𝜕Γ, 𝜕2Γ, ⋯.

Given the presence of the accumulator 𝜑, all effects performed on 𝜕Γ can be tracked and the context can be recovered. We now give the concrete constructions for tracking and recovery.

Definition 3. Define the transformation trackΓ on pairs of context functions:

trackΓ : (Γ →Γ) × (Γ →Γ) → 𝜕Γ → 𝜕Γ

(6)

trackΓ = (𝑓, 𝑔) ↦(𝛾, 𝜑) ↦(𝑓(𝛾), 𝜑∘𝑔)

This transformation converts a forward function 𝑓 together with a candidate inverse 𝑔 into a transformation of the effect context 𝜕Γ. Applying trackΓ(𝑓, 𝑔) to a state (𝛾, 𝜑) transforms 𝛾 by 𝑓 and composes the inverse 𝑔 onto 𝜑, thereby tracking the effect of 𝑓 in the context.

Theorem 4. For every (𝑓, 𝑔) ∈(Γ →Γ) × (Γ →Γ), write 𝑓′ ≔trackΓ(𝑓, 𝑔); then the following diagram commutes, that is,

pr1 ∘𝑓′ = 𝑓∘pr1 (7)

𝑓

Γ Γ

pr1 pr1 track

𝜕Γ 𝜕Γ

𝑓′

Proof. For all (𝛾, 𝜑) ∈𝜕Γ:

(pr1 ∘trackΓ(𝑓, 𝑔))(𝛾, 𝜑) = pr1(𝑓(𝛾), 𝜑∘𝑔)

= 𝑓(𝛾)

= (𝑓∘pr1)(𝛾, 𝜑) □

Theorem 4 ensures that tracking leaves the forward behavior untouched: on the context state, trackΓ(𝑓, 𝑔) acts as 𝑓 does, whatever candidate inverse it carries.

Theorem 5. trackΓ is a monoid homomorphism from 𝔗Γ into 𝜕Γ →𝜕Γ. That is,

1. trackΓ(idΓ, idΓ) = id𝜕Γ; 2. for all (𝑓1, 𝑔1), (𝑓2, 𝑔2) ∈𝔗Γ, trackΓ((𝑓1, 𝑔1) ∘(𝑓2, 𝑔2)) = trackΓ(𝑓1, 𝑔1) ∘trackΓ(𝑓2, 𝑔2) (8)

### 第 10 页中文对照

为了在上下文本身中追踪 effect，我们引入定义 2。Effect context 可以理解为二元组 (𝛾, 𝜑)：𝛾 是当前上下文状态；𝜑 是 accumulator，即截至目前执行过的 effect 的 inverse 复合，也是把上下文恢复到初始状态的函数。初始 effect context 因而可写为 (𝛾0, idΓ)。重复应用 ∂ 会得到 Γ、∂Γ、∂²Γ 等层级。

有了 accumulator 𝜑，作用于 ∂Γ 的全部 effect 都能被追踪，上下文也能恢复。定义 3 给出具体的追踪构造：trackΓ 把前向函数 𝑓 及其候选 inverse 𝑔 转换为 effect context 上的变换。将它应用于 (𝛾, 𝜑) 时，𝑓 变换状态 𝛾，同时把 𝑔 复合到 𝜑 上，由此在上下文中记录 𝑓 的 effect。

定理 4 保证追踪不会改变前向行为：在 context state 上，trackΓ(𝑓, 𝑔) 的作用始终与 𝑓 相同，不受其携带的候选 inverse 影响。

10

<!-- page 11 of 92 -->

Proof.

1. The unit is carried to the unit, since trackΓ(idΓ, idΓ)(𝛾, 𝜑) = (𝛾, 𝜑∘idΓ) = (𝛾, 𝜑). 2. For the multiplication, take any (𝛾, 𝜑) ∈𝜕Γ: (trackΓ(𝑓1, 𝑔1) ∘trackΓ(𝑓2, 𝑔2))(𝛾, 𝜑) = trackΓ(𝑓1, 𝑔1)(𝑓2(𝛾), 𝜑∘𝑔2)

= (𝑓1(𝑓2(𝛾)), 𝜑∘𝑔2 ∘𝑔1)

= trackΓ(𝑓1 ∘𝑓2, 𝑔2 ∘𝑔1)(𝛾, 𝜑) □

Theorem  5 ensures that tracking one pair at a time agrees with tracking their twisted composite at once, so a sequence of tracked effects can be reasoned about as a single tracked effect.

Definition 6. Define the transformation recoverΓ on 𝜕Γ:

recoverΓ : 𝜕Γ → 𝜕Γ

(9)

recoverΓ = (𝛾, 𝜑) ↦(𝜑(𝛾), idΓ)

This transformation applies the recovery function 𝜑 to the current state 𝛾 and resets 𝜑 to the identity. The following diagram illustrates how recover recovers the context to its initial state after a sequence of effects 𝑓′

𝑖≔trackΓ(𝑓𝑖, 𝑔𝑖), 𝑖= 1, ⋯, 𝑛, has been applied to 𝜕Γ:

𝑓1 𝑓𝑛

Γ Γ Γ Γ

track track track

𝜕Γ 𝜕Γ 𝜕Γ 𝜕Γ

𝑓′

1 𝑓′

𝑛

recover

The diagram shows that the tracked effects followed by recover carry the initial effect context back to itself. Each tracking step in fact preserves the result of recovery itself, from whatever state it is taken:

Theorem 7. For every (𝛾, 𝜑) ∈𝜕Γ and every pair (𝑓, 𝑔) with 𝑔(𝑓(𝛾)) = 𝛾,

recoverΓ(trackΓ(𝑓, 𝑔)(𝛾, 𝜑)) = recoverΓ(𝛾, 𝜑) (10)

Proof.

recoverΓ(trackΓ(𝑓, 𝑔)(𝛾, 𝜑)) = recoverΓ(𝑓(𝛾), 𝜑∘𝑔)

= (𝜑(𝑔(𝑓(𝛾))), idΓ)

= (𝜑(𝛾), idΓ) = recoverΓ(𝛾, 𝜑) □

Theorem 7 ensures that a tracked effect whose inverse reverts it does not move the result of recovery: recovering after the step returns what recovering before it would have. Recovery reads a state through the quantity 𝜑(𝛾) alone, so the guarantee amounts to preserving 𝜑(𝛾); we refer to 𝜑(𝛾) = 𝛾0 as the soundness invariant of a state in 𝜕Γ. In particular, starting from the initial effect context (𝛾0, idΓ), every state reached by tracked effects whose inverses revert them satisfies the invariant, and recovery carries each such state back to (𝛾0, idΓ).

### 第 11 页中文对照

定理 5 表明，逐个追踪一组变换对，与一次追踪它们的扭曲复合相一致。因此，一串被追踪的 effect 可以作为单个被追踪 effect 来推理。

定义 6 的 recoverΓ 把恢复函数 𝜑 应用于当前状态 𝛾，并把 𝜑 重置为恒等函数。图中展示了若干 effect 依次作用于 ∂Γ 后，recover 怎样把上下文恢复到初始状态。被追踪的 effect 后接 recover，会将初始 effect context 带回自身。更强的是，从任意状态出发，每一步追踪都保持恢复结果不变。

定理 7 保证：如果被追踪 effect 的 inverse 能够撤销该 effect，那么这一步不会改变最终恢复结果；在该步之后恢复，与在该步之前恢复得到相同结果。恢复只通过 𝜑(𝛾) 观察状态，因此这项保证等价于保持 𝜑(𝛾)。本文把 𝜑(𝛾) = 𝛾0 称为 ∂Γ 中状态的健全性不变量。特别地，从初始 effect context (𝛾0, idΓ) 出发，经由 inverse 能正确撤销的 tracked effect 到达的每个状态都满足此不变量；recover 会把每个这样的状态带回 (𝛾0, idΓ)。

11

<!-- page 12 of 92 -->

The preservation along a sequence follows from Theorem  5 in one application. Let (𝑓1, 𝑔1), ⋯, (𝑓𝑛, 𝑔𝑛) be applied in order from (𝛾, 𝜑), and write 𝛿0 = 𝛾 and 𝛿𝑖= 𝑓𝑖(𝛿𝑖−1) for the intermediate context states. By Theorem 5, the composite trackΓ(𝑓𝑛, 𝑔𝑛) ∘⋯∘trackΓ(𝑓1, 𝑔1) is a single tracking step, trackΓ of the twisted composite (𝑓𝑛∘⋯∘𝑓1, 𝑔1 ∘⋯∘𝑔𝑛). If each inverse reverts its own step, 𝑔𝑖(𝛿𝑖) = 𝛿𝑖−1, then the composite inverse carries 𝛿𝑛 back to the start: (𝑔1 ∘ ⋯∘𝑔𝑛)(𝛿𝑛) = 𝛿0 = 𝛾. The twisted composite therefore meets the hypothesis of Theorem 7 at 𝛾, and one application of the theorem gives

recoverΓ((trackΓ(𝑓𝑛, 𝑔𝑛) ∘⋯∘trackΓ(𝑓1, 𝑔1))(𝛾, 𝜑)) = recoverΓ(𝛾, 𝜑) (11)

A pair with 𝑔∘𝑓= idΓ meets the hypothesis at every state.

3.1.2. Effect Functions

The track/recover model of the previous section has two limitations:

1. trackΓ(𝑓, 𝑔) fixes 𝑔 before any context state is seen, so one uniform 𝑔 has to meet the hypothesis of Theorem 7 at every state the effect is applied at. Reverting needs less: an inverse for the one state where 𝑓 is applied, which may differ from state to state. A per- state inverse cannot be fixed in the argument position before the state is seen; it has to be returned at the point of application. 2. recoverΓ is all-or-nothing: it cannot selectively undo one effect while retaining others.

To address the two issues, we enhance the model at the input and output sides respectively:

1. On the input side, we not only transform Γ but also return an inverse function alongside it, so that the inverse is supplied where the effect is applied: Γ →Γ × (Γ →Γ), i.e., Γ → 𝜕Γ; 2. On the output side, we not only transform 𝜕Γ but also return an inverse function along­ side it, so that one effect can be undone while the others are retained: 𝜕Γ →𝜕Γ × (𝜕Γ → 𝜕Γ), i.e., 𝜕Γ →𝜕2Γ.

The two changes give the input and the output the same shape, i.e., a map from a context to the transformed context paired with an inverse: Γ →𝜕Γ on the input side and 𝜕Γ →𝜕2Γ on the output side. One type family therefore covers both levels, and we define it at each context as the effect function type 𝔈Γ, refined by a witness to 𝔈∗

Γ:

Definition 8. Define the effect function 𝔈Γ and witnessed effect function 𝔈∗

Γ as:

𝔈Γ ≔Γ →Γ × (Γ →Γ)

𝔈∗

(12)

Γ ≔(𝑒: Γ →Γ × (Γ →Γ))

× ((𝛾: Γ) →(𝛿: Γ) →(𝑔: Γ →Γ) →((𝛿, 𝑔) = 𝑒(𝛾) →𝑔(𝛿) = 𝛾))

where 𝑒(𝛾) yields a pair (𝛿, 𝑔) representing:

• 𝛿: Γ is the new context; • 𝑔: Γ →Γ is the inverse function of the current effect.

The witness holds each returned inverse to one equation, 𝑔(𝛿) = 𝛾: the inverse is required to revert the effect only at the state where it was applied. An element of 𝔈∗

Γ may therefore choose a different inverse at every state. A single 𝑔 with 𝑔∘𝑓= idΓ meets the equation at every state at once, so the assignment (𝑓, 𝑔) ↦𝛾↦(𝑓(𝛾), 𝑔) carries such a pair into 𝔈∗

Γ, and Theorem 11 shows this assignment to be a homomorphism. The following commutative diagram states

### 第 12 页中文对照

对一串 effect 的保持性可以由定理 5 一次推出。若每个 inverse 都能撤销它自己的那一步，那么复合 inverse 会把最终状态带回起点。因此，扭曲复合满足定理 7 的前提，一次应用定理即可得到式（11）。若一对变换满足 𝑔 ∘ 𝑓 = idΓ，则它在所有状态上都满足该前提。

上一节的 track/recover 模型有两个限制。第一，trackΓ(𝑓, 𝑔) 在看到任何 context state 前就固定了 𝑔，因此同一个 𝑔 必须在 effect 可能作用的所有状态上满足定理 7。实际上，只需对 𝑓 真正作用的那个状态提供 inverse，而且 inverse 可以因状态而异；所以它必须在应用点返回。第二，recoverΓ 只能全部恢复，无法选择性撤销一个 effect 而保留其他 effect。

为解决这两个问题，我们分别增强输入侧与输出侧。输入侧不仅变换 Γ，还同时返回 inverse，使 inverse 在 effect 应用时提供；输出侧不仅变换 ∂Γ，也同时返回 inverse，从而可以只撤销一个 effect 并保留其余 effect。

这两项改变使输入和输出具有相同形状：都是从一个上下文映射到“变换后的上下文与 inverse 的二元组”。因此，一个类型族可以覆盖两个层级。定义 8 在每个上下文上定义 effect function 类型 𝔈Γ，并用 witness 将其细化为 𝔈∗Γ。

其中，𝑒(𝛾) 返回新上下文 𝛿 与当前 effect 的 inverse 𝑔。Witness 只要求返回的 inverse 满足一个等式 𝑔(𝛿) = 𝛾，也就是只需在该 effect 实际应用的状态上撤销它。因此，𝔈∗Γ 的元素可以在每个状态选择不同 inverse。若单个 𝑔 满足 𝑔 ∘ 𝑓 = idΓ，它便同时满足所有状态上的等式；定理 11 将证明相应赋值是同态。随后交换图表达的是同一条件：𝑒 返回的 inverse 能在 𝑒 的应用点撤销该变换。

12

<!-- page 13 of 92 -->

the same condition: the inverse 𝑒 returns reverts the transformation at the state where 𝑒 was applied:

𝑓

Γ Γ

𝑔

𝑒 pr1 pr2

𝜕Γ

Since effect functions 𝔈Γ are no longer endomorphisms on the context, they cannot be directly composed. We therefore define a new operation for effect composition:

Definition 9. Given functions 𝑓, 𝑔∈𝔈Γ, define their effect composition 𝑓⋄𝑔 as:

𝑓⋄𝑔 : Γ → 𝜕Γ

(13)

𝑓⋄𝑔= 𝛾 ↦

𝐥𝐞𝐭(𝛿, 𝑠) = 𝑔(𝛾) 𝐢𝐧 𝐥𝐞𝐭(𝜀, 𝑡) = 𝑓(𝛿) 𝐢𝐧 (𝜀, 𝑠∘𝑡)

Theorem 10. Effect composition carries the monoid structure of 𝔗Γ over to 𝔈Γ. That is,

1. (𝔈Γ, ⋄) is a monoid with unit 𝜂Γ ≔𝛾↦(𝛾, idΓ); 2. the assignment (𝑓, 𝑔) ↦𝛾↦(𝑓(𝛾), 𝑔) is a monoid homomorphism from 𝔗Γ into 𝔈Γ.

Proof.

1. Associativity and the unit laws follow componentwise from those of ∘. 2. Write 𝑒𝑖= 𝛾↦(𝑓𝑖(𝛾), 𝑔𝑖); then (𝑒1 ⋄𝑒2)(𝛾) = (𝑓1(𝑓2(𝛾)), 𝑔2 ∘𝑔1), which is the image of (𝑓1, 𝑔1) ∘(𝑓2, 𝑔2), and (idΓ, idΓ) maps to 𝜂Γ. □

Theorem 11. Witnessing survives effect composition, and a uniform inverse witnesses at every state. That is,

1. 𝔈∗ Γ is a submonoid of 𝔈Γ; 2. the homomorphism of Theorem 10 carries every pair with 𝑔∘𝑓= idΓ into 𝔈∗ Γ.

Proof.

1. The unit lies in 𝔈∗ Γ since idΓ(𝛾) = 𝛾. For closure, take 𝑓, 𝑔∈𝔈∗

Γ and any 𝛾∈Γ, and let (𝛿, 𝑠) = 𝑔(𝛾), (𝜀, 𝑡) = 𝑓(𝛿), so that (𝑓⋄𝑔)(𝛾) = (𝜀, 𝑠∘𝑡). Then 𝑠(𝛿) = 𝛾 and 𝑡(𝜀) = 𝛿, therefore (𝑠∘𝑡)(𝜀) = 𝑠(𝛿) = 𝛾. 2. 𝑔∘𝑓= idΓ gives 𝑔(𝑓(𝛾)) = 𝛾 at every 𝛾, so the image of such a pair is witnessed at every state. □

Just as track lifts a pair of transformations on Γ to 𝜕Γ, we define effect to lift 𝔈Γ to 𝔈𝜕Γ:

Definition 12. Define the effect function transformation effectΓ as:

effectΓ : 𝔈Γ → 𝜕Γ → 𝜕2Γ

(14)

effectΓ = 𝑒 ↦(𝛾, 𝜑) ↦𝐥𝐞𝐭(𝛿, 𝑔) = 𝑒(𝛾) 𝐢𝐧

((𝛿, 𝜑∘𝑔), trackΓ(𝑔, pr1 ∘𝑒))

Since effectΓ(𝑒) is itself 𝔈𝜕Γ, what it returns is an inverse in the sense of Definition 8 read one level up. That inverse is itself a track of the pair obtained by swapping the two directions of the effect. The ordinary tracking rule applies once more: undoing the effect is an effect in its

### 第 13 页中文对照

由于 effect function 不再是上下文上的自同态，因此不能直接复合。定义 9 为此引入新的 effect composition 运算。

定理 10 表明，effect composition 会把 𝔗Γ 的幺半群结构带到 𝔈Γ 上。其结合律和单位律逐分量继承自普通函数复合；相应赋值把扭曲复合映射为 effect composition，并把单位元映射为 𝜂Γ。

定理 11 表明 witness 在 effect composition 下保持，而且统一 inverse 可以在所有状态上提供 witness。单位元显然满足条件；闭包性来自两个局部 inverse 的顺序复合。若 𝑔 ∘ 𝑓 = idΓ，则对每个 𝛾 都有 𝑔(𝑓(𝛾)) = 𝛾，因而该变换对的像在每个状态上都有 witness。

正如 track 把 Γ 上的一对变换提升到 ∂Γ，定义 12 用 effectΓ 把 𝔈Γ 提升到 𝔈∂Γ。EffectΓ(𝑒) 本身属于更高一层的 effect function，因此它返回的是定义 8 在上一层意义下的 inverse。这个 inverse 仍由 track 构造，不过交换了 effect 的两个方向。普通追踪规则再次适用：撤销 effect 本身也是一个 effect，它用 𝑔 变换状态；要撤销这个撤销，就再次执行原 effect，也就是 pr1 ∘ 𝑒。因此，inverse 会像 track 所规定的那样复合到接收的 accumulator 上。

13

<!-- page 14 of 92 -->

own right, transforming the state by 𝑔, and the way to undo that is to perform the effect again, which is what pr1 ∘𝑒 does. The inverse therefore composes onto the accumulator it is handed, exactly as track prescribes.

We can now prove properties for effect analogous to those of track.

Theorem 13. effect preserves the ⋄ operation. That is, ∀𝑓, 𝑔∈𝔈Γ:

effectΓ(𝑓) ⋄effectΓ(𝑔) = effectΓ(𝑓⋄𝑔) (15)

Proof. Take any (𝛾, 𝜑) ∈𝜕Γ, and let (𝛿, 𝑠) = 𝑔(𝛾) and (𝜀, 𝑡) = 𝑓(𝛿), so that (𝑓⋄𝑔)(𝛾) = (𝜀, 𝑠∘𝑡) and pr1 ∘(𝑓⋄𝑔) = (pr1 ∘𝑓) ∘(pr1 ∘𝑔). Then

(effectΓ(𝑓) ⋄effectΓ(𝑔))(𝛾, 𝜑) = ((𝜀, 𝜑∘𝑠∘𝑡), trackΓ(𝑠, pr1 ∘𝑔) ∘trackΓ(𝑡, pr1 ∘𝑓))

= ((𝜀, 𝜑∘𝑠∘𝑡), trackΓ(𝑠∘𝑡, (pr1 ∘𝑓) ∘(pr1 ∘𝑔)))

= effectΓ(𝑓⋄𝑔)(𝛾, 𝜑)

where the first step unfolds Definition 12 at (𝛾, 𝜑) and at (𝛿, 𝜑∘𝑠), the second is Theorem 5, and the third folds Definition 12. □

How the two levels relate is what the following diagram shows. Its upper triangle is the witness condition of 𝑒, according to Definition  8, and its lower triangle is the question of whether 𝑒′ is witnessed the way 𝑒 is.

𝑓

Γ Γ

𝑔

𝑒

pr2

pr1

effect

𝑓′

𝜕Γ 𝜕Γ

𝑔′

𝑒′

pr2

pr1

𝜕2Γ

Between the levels, the projection pr1 relates each lifted map to the map it lifts, as it does for trackΓ in Theorem 4.

Theorem 14. Let 𝑒∈𝔈Γ, write 𝑓≔pr1 ∘𝑒, and let 𝑒′ ≔effectΓ(𝑒) with forward map 𝑓′ ≔pr1 ∘ 𝑒′. Then

1. pr1 ∘𝑓′ = 𝑓∘pr1; 2. for each (𝛾, 𝜑) ∈𝜕Γ, the lifted inverse 𝑔′ ≔pr2(𝑒′(𝛾, 𝜑)) and the inverse 𝑔≔pr2(𝑒(𝛾)) witnessed there satisfy pr1 ∘𝑔′ = 𝑔∘pr1.

Proof.

1. By Definition 12, 𝑓′(𝛾, 𝜑) = (𝑓(𝛾), 𝜑∘𝑔), whose state is 𝑓(𝛾) = (𝑓∘pr1)(𝛾, 𝜑). 2. This is Theorem 4 applied to 𝑔′ = trackΓ(𝑔, 𝑓). □

Whether the lower triangle closes is settled by computing what the lifted inverse returns:

Theorem 15. Let 𝑒∈𝔈∗

Γ and write 𝑓≔pr1 ∘𝑒. Fix (𝛾, 𝜑) ∈𝜕Γ, let (𝛿, 𝑔) = 𝑒(𝛾), and write (Δ, 𝑔′) for the value of effectΓ(𝑒) at (𝛾, 𝜑). Then

### 第 14 页中文对照

现在可以为 effect 证明与 track 类似的性质。定理 13 表明 effect 保持 ⋄ 运算；证明依次展开定义 12、应用定理 5，再折叠回定义 12。

图展示了两个层级之间的关系：上三角是定义 8 所规定的 𝑒 的 witness 条件，下三角询问提升后的 𝑒′ 是否以同样方式获得 witness。在层级之间，投影 pr1 把每个提升后的映射与其原映射联系起来，正如定理 4 对 trackΓ 所做的那样。

定理 14 说明，提升后的前向映射经 pr1 投影后等于原前向映射作用于投影；同样，提升后的 inverse 经投影后等于原 inverse 作用于投影。下三角是否闭合，则取决于提升后的 inverse 实际返回什么，定理 15 对此进行计算。

14

<!-- page 15 of 92 -->

𝑔′(Δ) = (𝛾, 𝜑∘𝑔∘𝑓) (16)

The state is recovered exactly. The accumulator is restored as well, equivalently effectΓ(𝑒) ∈ 𝔈∗

𝜕Γ, if and only if 𝑔∘𝑓= idΓ; and in every case (𝜑∘𝑔∘𝑓)(𝛾) = 𝜑(𝛾), so the soundness invariant is preserved.

Proof. By Definition 12, Δ = (𝛿, 𝜑∘𝑔) and 𝑔′ = trackΓ(𝑔, 𝑓), so

𝑔′(Δ) = (𝑔(𝛿), 𝜑∘𝑔∘𝑓) = (𝛾, 𝜑∘𝑔∘𝑓)

using 𝑔(𝛿) = 𝛾. Membership in 𝔈∗

𝜕Γ requires this to equal (𝛾, 𝜑) at every input; taking 𝜑= idΓ turns the equality of accumulators into 𝑔∘𝑓= idΓ, and that condition conversely gives the equality of accumulators for every 𝜑. Finally (𝜑∘𝑔∘𝑓)(𝛾) = 𝜑(𝑔(𝛿)) = 𝜑(𝛾). □

The lower triangle therefore closes only when the inverse witnessed at 𝛾 reverts 𝑓 at every state, so effectΓ does not carry 𝔈∗

Γ into 𝔈∗

𝜕Γ. What holds in every case is agreement at 𝛾: recoverΓ(𝑔′(Δ)) = recoverΓ(𝛾, 𝜑), which is the whole of what Theorem 7 assumes of an accumulator, so reverting leaves the recovery target untouched.

3.1.3. Effect Iterators

What a component loads by is not one effect but a sequence of them, and what its unloading reverts is the whole sequence. Reverting effects in the reverse order of application requires nothing further, because each inverse then meets the state its own application produced:

Theorem 16. Let 𝑒1, ⋯, 𝑒𝑛∈𝔈∗

Γ be applied in order from (𝛾0, idΓ) and reverted in the reverse order. Then

1. each revert recovers the context state its application ran against; 2. every intermediate state satisfies the soundness invariant.

Proof. Each step is an application or a revert. An application carries (𝛾, 𝜑) to (𝛿, 𝜑∘𝑔) with 𝑔(𝛿) = 𝛾, so it preserves 𝜑(𝛾) by Theorem 7, whose hypothesis is exactly the witness of 𝔈∗

Γ. Reverting in the reverse order hands each inverse the state its own application produced, so by Theorem 15 that revert recovers the preceding state exactly and preserves 𝜑(𝛾) as well; neither conclusion depends on the accumulator the inverse receives. □

The sequence itself deserves a reification. An effect iterator performs it one effect at a time, each of whose iterations yields the modified context, an inverse, and a continuation:

Definition 17. Define the effect iterator ℑΓ and witnessed effect iterator ℑ∗

Γ as the following recursive types:

ℑΓ ≔𝜇ℑ. Γ →Γ × (Γ →Γ) × 𝖬𝖺𝗒𝖻𝖾(ℑ)

ℑ∗

(17)

Γ ≔𝜇ℑ. (𝑒: Γ →Γ × (Γ →Γ) × 𝖬𝖺𝗒𝖻𝖾(ℑ))

× ((𝛾: Γ) →(𝛿: Γ) →(𝑔: Γ →Γ) →(𝑜: 𝖬𝖺𝗒𝖻𝖾(ℑ)) →((𝛿, 𝑔, 𝑜) = 𝑒(𝛾) →𝑔(𝛿) = 𝛾))

where 𝑒(𝛾) yields a triple (𝛿, 𝑔, 𝑜) representing:

• 𝛿 is the new context; • 𝑔 is the inverse function of the current effect; • 𝑜 indicates the continuation: ‣ 𝖭𝗈𝗍𝗁𝗂𝗇𝗀 signals iteration termination; ‣ 𝖩𝗎𝗌𝗍(𝑖) provides the next iteration.

### 第 15 页中文对照

状态能够被精确恢复。Accumulator 也能同时恢复——等价地，effectΓ(𝑒) 属于 𝔈∗∂Γ——当且仅当 𝑔 ∘ 𝑓 = idΓ。无论这一条件是否成立，健全性不变量始终保持。

因此，只有在 𝛾 处得到 witness 的 inverse 能在每个状态撤销 𝑓 时，下三角才闭合；effectΓ 并不会一般地把 𝔈∗Γ 映入 𝔈∗∂Γ。始终成立的是它们在 𝛾 处的一致：撤销不会改变恢复目标。

组件加载时会依次执行一串 effect, 卸载时则按相反顺序撤销整串 effect. 这样每个 inverse 都会遇到对应 effect 刚执行完时留下的状态, 无须增加额外条件.

定理 16 表明，若一组有 witness 的 effect 从初始状态依次应用并逆序撤销，那么每次撤销都会恢复该 effect 应用前的 context state，而且每个中间状态都满足健全性不变量。

这条序列本身也应具体化。Effect iterator 每次执行一个 effect，每轮迭代返回修改后的上下文、inverse 和 continuation。Continuation 若为 Nothing 表示迭代结束，若为 Just(𝑖) 则给出下一轮迭代。

15

<!-- page 16 of 92 -->

The witness holds each iteration to the constraint Definition 8 places on a single effect, and the continuation a witnessed iterator yields is again witnessed.

The effect iterator transformation effectiter

Γ extends effectΓ to the iterator structure through recursive invocation:

Definition 18. Define the effect iterator transformation effectiter

Γ as:

effectiter

Γ : ℑΓ → 𝜕Γ → 𝜕2Γ

(18)

𝐥𝐞𝐭(𝛿, 𝑔, 𝑜) = 𝑖(𝛾) 𝐢𝐧 𝐥𝐞𝐭𝑡= trackΓ(𝑔, pr1 ∘𝑖) 𝐢𝐧 𝐦𝐚𝐭𝐜𝐡𝑜

effectiter

Γ = 𝑖 ↦(𝛾, 𝜑) ↦

| 𝖭𝗈𝗍𝗁𝗂𝗇𝗀⇒((𝛿, 𝜑∘𝑔), 𝑡) | 𝖩𝗎𝗌𝗍(𝑖′) ⇒𝐥𝐞𝐭(𝑠, 𝑟) = effectiter

Γ (𝑖′)(𝛿, 𝜑∘𝑔) 𝐢𝐧 (𝑠, 𝑡∘𝑟)

At each iteration, the inverse 𝑔 is composed onto 𝜑 in application order, so the accumulator 𝜑∘𝑔1 ∘⋯∘𝑔𝑘 reverts the effects in LIFO order when applied (Theorem 16). Because effectiter

Γ lands in the same 𝜕Γ →𝜕2Γ as effectΓ does, an iterator is an effect in its own right and can be used wherever an effect can, and Section  4 reads a component’s whole loading as one iterator. The 𝖬𝖺𝗒𝖻𝖾(ℑ) continuation makes a boundary available between any two consecutive iterations, at which the context is whatever the iterations so far have made it and the accumu­ lator recovers those and nothing more. In this sense the effect iterator is a reified delimited continuation, the structure that mainstream languages expose through the yield operator [38], so the model maps directly onto the generators they already provide.

A plain effect function is the degenerate case: an 𝑒∈𝔈Γ embeds as the iterator whose first iteration already yields 𝖭𝗈𝗍𝗁𝗂𝗇𝗀,

𝛾↦𝐥𝐞𝐭(𝛿, 𝑔) = 𝑒(𝛾) 𝐢𝐧(𝛿, 𝑔, 𝖭𝗈𝗍𝗁𝗂𝗇𝗀) (19)

and the embedding carries 𝔈∗

Γ into ℑ∗

Γ, the two witnesses asking the same equation. Every notion defined at iterators below is read at an effect function through this embedding.

Together, these constructions constitute revertible effects: each effect function in 𝔈∗

Γ explicitly provides its own inverse, effect tracks the effect on 𝜕Γ, and the ⋄ operation composes effect functions while preserving revertibility. What they deliver is local temporal composability, local in that the guarantee is read of one component’s effects taken by themselves. We take that to be the following criterion: for every sequence of effect functions a component applies, the accumulator recovers the context it began at (Theorem 7), and reverting the sequence hands each inverse the state its own application ran against (Theorem 16). Loading a component is running one iterator and accumulating its inverses in 𝜑; unloading it is applying 𝜑. Two things the criterion leaves out, and both arrive once several components are in play: reverting out of the order the accumulator imposes, and a sequence that interleaves the effects of others. Both are supplied by independence, a condition on the effects rather than a property of the construction (Section 3.4).

3.2. Reactive Coeffects

Spatial composability is the ability for components to declare dependencies on one another and for the system to resolve, provide, and withdraw those dependencies at runtime. This requires

### 第 16 页中文对照

Witness 对每轮迭代施加与定义 8 对单个 effect 相同的约束；有 witness 的 iterator 返回的 continuation 仍然有 witness。

Effect iterator transformation 通过递归调用把 effectΓ 扩展到 iterator 结构。每轮中，inverse 𝑔 按应用顺序复合到 𝜑 上，所以 accumulator 在真正应用时以 LIFO 顺序撤销 effect。由于 effectiterΓ 与 effectΓ 具有相同的目标类型，iterator 本身就是一个 effect，可用于任何接受 effect 的位置；第 4 节把组件的整个加载过程视为一个 iterator。Maybe continuation 在任意相邻迭代之间提供边界：此时上下文是之前迭代产生的状态，accumulator 恰好恢复这些迭代而不恢复更多。因而 effect iterator 是具体化的定界 continuation，对应主流语言通过 yield 暴露的结构 [38]，可以直接映射到现有 generator。

普通 effect function 是退化情形：它嵌入为第一轮就返回 Nothing 的 iterator。该嵌入把 𝔈∗Γ 映入 ℑ∗Γ，因为两者的 witness 要求同一等式。下文在 iterator 上定义的每个概念，都可通过此嵌入解释到 effect function 上。

这些构造共同组成可撤销 effect：每个 𝔈∗Γ 中的 effect function 显式提供自己的 inverse，effect 在 ∂Γ 上追踪它，⋄ 则组合 effect function 并保持可撤销性。它们给出局部时间组合性：对组件独立执行的每串 effect，accumulator 都能恢复起始上下文，逆序撤销则让每个 inverse 遇到自身应用时的状态。加载组件就是运行一个 iterator 并在 𝜑 中累积 inverse；卸载就是应用 𝜑。多组件场景还缺少两点：打破 accumulator 顺序的撤销，以及与其他组件 effect 交错的序列。两者都由 independence 补足；这是 effect 上的条件，而非本构造自动具有的性质。

空间组合性是组件声明相互依赖，并由系统在运行时解析、提供和撤回这些依赖的能力。这要求共享上下文每次变化时重新判断依赖是否满足，使组件在依赖可用时激活、依赖撤回时停用。因此，我们把组件依赖建模为 specification，并相对该 specification 把每次 context change 分类为 activating、deactivating 或 neutral。

16

<!-- page 17 of 92 -->

that dependency satisfaction be re-evaluated whenever the shared context changes, so that a component activates when its dependencies become available and deactivates when they are withdrawn. We therefore model dependencies of a component as a specification and classify each change to the context, against that specification, as activating, deactivating, or neutral. Classifying against the specification is what detects a change in satisfaction; responding to that classification is what drives activation and deactivation. We call such coeffects reactive: by classifying context changes and driving activation and deactivation from them, local spatial composability becomes a structural guarantee.

3.2.1. Coeffect Context

Traditional inversion-of-control (IoC) containers [39] typically model dependencies as simple key-value mappings. This section formalizes IoC as a coeffect context that synergizes with revertible effects to provide a mathematical foundation for dynamic composition.

Definition 19. Given a type family 𝒱︀: 𝐾→Type, define the coeffect context as the dependent partial function type:

Σ ≔(𝑘: 𝐾) ⇀𝒱︀𝑘 (20)

where 𝜎: Σ is a finite partial function assigning to each 𝑘∈dom(𝜎) ⊆𝐾 a value of type 𝒱︀𝑘. We write:

• 𝜎(𝑘) for application (defined when 𝑘∈dom(𝜎)); • 𝜎[𝑘↦𝑣] for the table binding 𝑣 at 𝑘 and agreeing with 𝜎 elsewhere; • 𝜎∖𝑘 for restriction (defined when 𝑘∈dom(𝜎)); • 𝑘∈dom(𝜎) for membership.

The use of a type family 𝒱︀ ensures that each dependency key 𝑘 is associated with a specific value type 𝒱︀𝑘, providing static type safety for dependency access. Extension and restriction carry preconditions, imposed by the operations below: a dependency cannot be provided twice (𝑘∉dom(𝜎) for extension) nor revoked if absent (𝑘∈dom(𝜎) for restriction). A violated precondition is signaled as an error and produces no transition, so the effect algebra, which describes the transitions that do occur, applies to these operations unchanged. A reader prefer­ ring to internalize the failure may read every Σ ⇀Σ below as Σ →𝖬𝖺𝗒𝖻𝖾(Σ) and compose in the 𝖬𝖺𝗒𝖻𝖾 monad (Section 2.1), at the cost of replacing each identity by the partial identity on the operation’s domain. Based on this context structure, we define two core operations:

Definition 20. The get and set operations on Σ are defined as:

get : (𝑘: 𝐾) →Σ ⇀ 𝒱︀𝑘 get = 𝑘 ↦ 𝜎 ↦ 𝜎(𝑘)

(21)

set : (𝑘: 𝐾) × 𝒱︀𝑘 →Σ ⇀ Σ × (Σ ⇀Σ)

set = (𝑘, 𝑣) ↦ 𝜎 ↦(𝜎[𝑘↦𝑣], 𝜆𝜎′.𝜎′ ∖𝑘)

where get(𝑘) requires 𝑘∈dom(𝜎) and set(𝑘, 𝑣) requires 𝑘∉dom(𝜎) as preconditions.

Notably, set(𝑘, 𝑣) has type 𝔈∗

Σ, i.e., an effect function on the coeffect context. We can there­ fore directly apply the effect machinery from Section 3.1: effectΣ provides automatic tracking and recovery of dependency registrations. This is the synergy between reactive coeffects and revertible effects: coeffect operations are effects, and effects are revertible.

### 第 17 页中文对照

针对 specification 进行分类，可以检测满足状态的变化；响应这一分类，则驱动激活与停用。我们称这类 coeffect 为响应式 coeffect：通过分类 context change 并据此驱动生命周期，局部空间组合性成为结构性保证。

传统控制反转（IoC）容器 [39] 通常把依赖建模为简单键值映射。这里把 IoC 形式化为 coeffect context，并令其与可撤销 effect 协同，为动态组合提供数学基础。

定义 19 使用依赖偏函数表示 coeffect context。类型族 𝒱︀ 确保每个依赖键都对应特定值类型，从而为依赖访问提供静态类型安全。扩展和限制带有前置条件：依赖不能重复提供，也不能在不存在时撤回。违反前置条件会报错且不产生转移，因此描述实际转移的 effect algebra 无需改变。若希望把失败内化，可以把偏函数理解为返回 Maybe 的函数，并在 Maybe monad 中复合，代价是将恒等映射改成操作定义域上的偏恒等映射。

定义 20 给出 get 与 set 两项核心操作。这里的关键是，set(𝑘, 𝑣) 属于 𝔈∗Σ，也就是 coeffect context 上的 effect function。因此可以直接应用第 3.1 节的 effect 机制：effectΣ 自动追踪和恢复依赖注册。这正是响应式 coeffect 与可撤销 effect 的协同关系：coeffect operation 是 effect，而 effect 可撤销。

17

<!-- page 18 of 92 -->

3.2.2. Specification and Notification

The preceding definitions describe how individual dependencies are registered and accessed. Accessing an absent dependency, however, is a runtime failure. A component should therefore activate only once all the dependencies it declares are present, rather than accessing them opti­ mistically and failing when one is missing. This raises two questions: whether a component’s declared dependencies are jointly satisfied, and how the system should respond when that status changes. The coeffect context Σ carries a natural observational structure that makes both questions tractable: for any coeffect specification 𝑑⊆𝐾, define the satisfaction predicate:

𝜎⊧𝑑≔∀𝑘∈𝑑. 𝑘∈dom(𝜎) (22)

This predicate is decidable (since dom(𝜎) is finite). Since all mutations to 𝜎 pass through effect functions (whose inverses recover the previous domain), changes to satisfaction are detectable at each effect boundary. This is the algebraic basis of reactivity: the effect system guarantees that every coeffect change is observed.

Definition 21. A coeffect specification is:

𝔇Σ ≔𝖲𝖾𝗍(𝐾) (23)

representing the set of dependencies a component declares from the environment.

What makes this specification reactive is how it classifies state transitions. Any effect that transforms 𝜎 to 𝜎′ can be classified by a specification 𝑑∈𝔇Σ according to whether 𝑑’s satis­ faction status is altered:

Definition 22. Given a coeffect specification 𝑑⊆𝐾 and states 𝜎, 𝜎′ ∈Σ, define:

(24)

notify𝑑(𝜎, 𝜎′) ≔

activating if 𝜎⊭𝑑∧𝜎′ ⊧𝑑 deactivating if 𝜎⊧𝑑∧𝜎′ ⊭𝑑 neutral otherwise

{

An activating transition triggers the execution of the component’s effects, tracked as Sec­ tion 3.1 prescribes, and a deactivating transition triggers recovery by applying the accumulator. The activation and deactivation so triggered receive their operational semantics in Section 4.

What set and notify deliver together is local spatial composability, local in the same sense as before, the guarantee being read of one component’s coeffects taken by themselves. We take that to be the following criterion: a component activates only at a state satisfying its specification, so it never reads a binding that is absent, and every change to the context is classified against that specification, so a loss of satisfaction is detected where it happens and drives a deactiva­ tion. Both halves are immediate from the definitions above, satisfaction being a precondition checked where the component would activate and notify𝑑 being defined at every transition; one direction of the coeffect ordering comes with the first half, a component activating only after the components that provide its declared keys. Two things the criterion leaves out, and both arrive once several components are in play: withdrawing a binding only after the deacti­ vations it causes have finished, and keeping the bindings an activation reads unmoved while the activation runs. Both are conditions on other components rather than on the one acting, so they belong to the global form of the guarantee, which Section 4.3.3 establishes.

### 第 18 页中文对照

前面的定义说明怎样注册和访问单项依赖，但访问缺失依赖会导致运行时失败。因此，组件应在其声明的全部依赖都存在之后才激活，而不是乐观访问并在缺失时失败。这引出两个问题：组件声明的依赖是否共同满足，以及满足状态变化时系统应如何响应。Coeffect context Σ 具有天然的观察结构：对任意 coeffect specification，可用式（22）定义满足谓词。

该谓词是可判定的，因为 dom(𝜎) 有限。对 𝜎 的所有修改都经过 effect function，而其 inverse 会恢复先前定义域，因此每个 effect 边界都能检测满足状态变化。这构成响应性的代数基础：effect system 保证每次 coeffect change 都被观察到。

定义 21 将 coeffect specification 定义为组件从环境声明的依赖集合。使 specification 具有响应性的关键，是它对状态转移的分类方式：任意把 𝜎 变为 𝜎′ 的 effect，都可依其是否改变 specification 的满足状态而分类。

Activating 转移触发组件 effect 的执行，并按第 3.1 节追踪；deactivating 转移通过应用 accumulator 触发恢复。第 4 节给出这两种生命周期动作的操作语义。

Set 与 notify 共同提供局部空间组合性。判据是：组件只在满足其 specification 的状态激活，因此不会读取缺失绑定；每次上下文变化都按该 specification 分类，因此依赖丢失会在发生处被检测并驱动停用。这也给出 coeffect 顺序的一个方向：组件只会在提供其声明键的组件之后激活。多组件场景仍缺少两项全局条件：只有由绑定撤回触发的停用都完成后才能真正撤回绑定，以及激活过程运行期间不能移动它所读取的绑定。第 4.3.3 节将建立这种全局保证。

18

<!-- page 19 of 92 -->

3.2.3. Isolation and Interception

The basic coeffect context Σ models a flat dependency table. In practice, however, the system may need to bind distinct values to the same logical dependency for different components. This section extends the coeffect context with two mechanisms: coeffect isolation (the same key resolves differently in different contexts) and coeffect interception (cross-cutting behavior on dependency access).

Realization. The two mechanisms differ from get and set in what they act on. A provision writes the shared table every component reads, so it is an effect on that table and carries an inverse to withdraw it. Isolation and interception instead adjust how a key is resolved for the components under one context, leaving the table itself as it stands. Typing an operation as an effect fixes its denotation, a successor state paired with an inverse, but not its realization, which determines how that inverse is carried out.

Definition 23. An effect function on a context admits two realizations:

• In-place realization mutates the context and returns a nontrivial inverse; the successor aliases the input, and recovery runs the inverse to undo the mutation. • Derived realization leaves the input intact and returns a fresh context deriving from it, with the identity as its inverse; recovery discards the derived context. A context derived from another is what the recursive structure of Definition 28 carries.

In a purely functional setting the two coincide, and an imperative host may choose either per operation; Section  5.1.2 implements both. Isolation and interception are given derived realization outright: each produces a fresh context whose own table differs from the inherited one, so each is typed below as a map from context to context rather than as an effect function. Nothing in the shared table changes, so there is no effect to track and nothing for Definition 12 to lift, and recovery discards the derived context along with the adjustment it carried. Assignment on a derived table overrides whatever the inherited table held at the key, which is why neither operation carries a precondition.

Coeffect Isolation. By introducing isolation realms, coeffect isolation allows the same depen­ dency to bind to different values in different contexts. This has broad applications in multi- tenant systems, testing environments, and component sandboxes.

Definition 24. Define the coeffect context with isolation as:

Σiso ≔(𝐾⇀𝑅) × ((𝑟: 𝑅) ⇀𝒱︀𝑟) (25)

It can be represented as a pair (𝜌, 𝜎), where:

• 𝜌: 𝐾⇀𝑅 is the isolation realm table, assigning a realm identifier to each isolated key; a key outside dom(𝜌) resolves to its own realm, so we write 𝜌(𝑘) = 𝑘 there (𝑅⊇𝐾); • 𝜎: (𝑟: 𝑅) ⇀𝒱︀𝑟 is the dependency table, a partial dependent function from realm identi­ fiers to typed values.

The two-layer mapping structure decouples the logical layer from the storage layer, making dependency access context-aware. When accessing a key 𝑘, the system first resolves 𝜌(𝑘) to obtain a realm identifier 𝑟, then accesses 𝜎(𝑟) for the actual value.

Definition 25. The get, set, and isolate operations on Σiso are:

### 第 19 页中文对照

基础 coeffect context Σ 是一张扁平依赖表。实际系统可能需要让同一个逻辑依赖在不同组件中绑定不同值。本节扩展出两项机制：coeffect isolation 让同一键在不同上下文中解析为不同值；coeffect interception 则在依赖访问时注入横切行为。

这两项机制与 get、set 的作用对象不同。Provision 写入所有组件共享读取的表，因此是表上的 effect，并携带撤回它的 inverse。Isolation 与 interception 只调整某个上下文下组件解析键的方式，不改变共享表本身。把操作类型化为 effect 只确定其指称——后继状态和 inverse——而 realization 决定 inverse 具体怎样执行。

定义 23 给出两种 realization。原地 realization 修改上下文并返回非平凡 inverse，后继状态与输入别名，恢复时运行 inverse 撤销修改。派生 realization 保持输入不变，返回从输入派生的新上下文，并以恒等映射作为 inverse；恢复只需丢弃派生上下文。在纯函数场景两者重合；命令式宿主可以逐操作选择。Isolation 与 interception 明确采用派生 realization：它们产生拥有不同局部表的新上下文，既不改变共享表，也无需追踪 effect；恢复时丢弃派生上下文即可。派生表上的赋值会覆盖继承值，因此两项操作都无需前置条件。

Coeffect isolation 通过 isolation realm 让同一依赖在不同上下文绑定不同值，适用于多租户系统、测试环境和组件沙箱。定义 24 中，realm table 把隔离键映射到 realm identifier；未隔离键解析到自身 realm。Dependency table 再从 realm identifier 映射到有类型值。两层映射把逻辑层与存储层解耦，使依赖访问具备上下文感知能力：访问键时先解析 realm，再从依赖表读取实际值。

19

<!-- page 20 of 92 -->

get : (𝑘: 𝐾) → Σiso ⇀ 𝒱︀𝜌(𝑘) get = 𝑘 ↦(𝜌, 𝜎) ↦ 𝜎(𝜌(𝑘))

set : (𝑘: 𝐾) × 𝒱︀𝜌(𝑘) → Σiso ⇀ Σiso × (Σiso ⇀Σiso)

(26)

set = (𝑘, 𝑣) ↦(𝜌, 𝜎) ↦((𝜌, 𝜎[𝜌(𝑘) ↦𝑣]), 𝜆(𝜌′, 𝜎′).(𝜌′, 𝜎′ ∖𝜌′(𝑘)))

isolate : 𝐾× 𝑅 → Σiso → Σiso

isolate = (𝑘, 𝑟) ↦(𝜌, 𝜎) ↦ (𝜌[𝑘↦𝑟], 𝜎)

where get and set carry the preconditions of Definition 20 transported along 𝜌, namely 𝜌(𝑘) ∈ dom(𝜎) and 𝜌(𝑘) ∉dom(𝜎). The context that isolate(𝑘, 𝑟) derives assigns the realm 𝑟 to 𝑘 and inherits the dependency table unchanged, so a key already isolated is reassigned rather than refused.

The coeffect isolation mechanism essentially implements a runtime ad-hoc polymorphism system. Through isolation realm identifiers, the same dependency key can resolve to entirely different values in different contexts, and this polymorphism can be dynamically adjusted at runtime. Compared to traditional dependency injection, coeffect isolation provides finer- grained control, enabling customized isolation for specific components; set remains an effect function (𝔈∗

Σiso) and thus inherits revertibility, whereas isolate needs none, deriving a context instead of writing the shared table.

Coeffect Interception. The second mechanism, coeffect interception, attaches cross-cutting metadata to dependency access, adding behavior without modifying the dependency value. This metadata can be either context-carried or component-declared, so we extend both the coeffect context and the coeffect specification:

Definition 26. Define the coeffect context and specification with interception as:

Σinter ≔((𝑘: 𝐾) →ℳ︀𝑘) × ((𝑘: 𝐾) ⇀(ℳ︀𝑘→𝒱︀𝑘))

(27)

𝔇inter ≔(𝑘: 𝐾) ⇀ℳ︀𝑘

The context Σinter is a pair (𝜄, 𝜎): 𝜄 is the context-carried metadata installed on the context itself, empty (𝜖𝑘) by default; and 𝜎 maps each key 𝑘 to a provider function from metadata ℳ︀𝑘 to value 𝒱︀𝑘. A specification 𝑑∈𝔇inter carries the component-declared metadata, assigning each key its metadata 𝑑(𝑘), with dom(𝑑) serving as the dependency set. Each key equips its metadata with a monoid (ℳ︀𝑘, ⊕𝑘, 𝜖𝑘): the merge ⊕𝑘 is associative with identity 𝜖𝑘 (the empty metadata).

Definition 27. The get, set, and intercept operations on Σinter are:

get : (𝑘: 𝐾) × ℳ︀𝑘 →Σinter ⇀ 𝒱︀𝑘 get = (𝑘, 𝜇) ↦(𝜄, 𝜎) ↦ 𝜎(𝑘)(𝜇⊕𝑘𝜄(𝑘))

set : (𝑘: 𝐾) × (ℳ︀𝑘→𝒱︀𝑘) →Σinter ⇀ Σinter × (Σinter ⇀Σinter)

(28)

set = (𝑘, 𝜓) ↦(𝜄, 𝜎) ↦((𝜄, 𝜎[𝑘↦𝜓]), 𝜆(𝜄′, 𝜎′).(𝜄′, 𝜎′ ∖𝑘))

intercept : (𝑘: 𝐾) × ℳ︀𝑘 →Σinter → Σinter

intercept = (𝑘, 𝜈) ↦(𝜄, 𝜎) ↦ (𝜄[𝑘↦𝜄(𝑘) ⊕𝑘𝜈], 𝜎)

where get and set carry the preconditions of Definition 20 on the provider table, namely 𝑘∈ dom(𝜎) and 𝑘∉dom(𝜎). The context that intercept(𝑘, 𝜈) derives merges 𝜈 onto the metadata inherited at 𝑘 and inherits the provider table unchanged.

### 第 20 页中文对照

定义 25 给出 isolation context 上的 get、set 与 isolate。Get 和 set 沿 realm 映射搬运定义 20 的前置条件。Isolate 派生出的上下文把键分配给指定 realm，并原样继承依赖表；已经隔离的键会被重新分配，而不是拒绝操作。

Coeffect isolation 本质上实现了运行时 ad-hoc polymorphism。借助 realm identifier，同一依赖键可在不同上下文中解析为完全不同的值，而且这种多态关系能在运行时动态调整。与传统依赖注入相比，它提供更细粒度的控制，可针对具体组件定制隔离。Set 仍是 effect function，因而继承可撤销性；isolate 不写共享表，而是派生上下文，所以无需 inverse。

第二项机制 coeffect interception 为依赖访问附加横切元数据，在不修改依赖值的前提下增加行为。元数据既可由上下文携带，也可由组件声明，因此定义 26 同时扩展 coeffect context 与 specification。

Σinter 中，𝜄 是安装在上下文本身的元数据，默认值为空；𝜎 把每个键映射为“从元数据到值”的 provider function。Specification 𝑑 携带组件声明的元数据，其定义域就是依赖集合。每个键的元数据形成一个幺半群，合并运算满足结合律，空元数据是单位元。

定义 27 给出 interception context 上的 get、set 与 intercept。Get 和 set 对 provider table 使用定义 20 的前置条件。Intercept 派生出的上下文把新元数据合并到继承元数据上，同时原样继承 provider table。

20

<!-- page 21 of 92 -->

When a component with specification 𝑑 accesses key 𝑘, the system evaluates 𝜎(𝑘)(𝑑(𝑘) ⊕𝑘 𝜄(𝑘)): the component-declared metadata is merged with the context-carried metadata 𝜄, and the provider function is applied to the result. This merge follows each key’s own semantics (e.g. scalar fields are overwritten, set-valued fields unioned) and is right-biased, so 𝜄(𝑘) takes priority and can override the component’s declaration, letting an enclosing context constrain how a component uses a coeffect without modifying that component (e.g. Section 6.3).

3.3. The Context Paradigm

Section 3.1 and Section 3.2 each act on a context, the first as the carrier of effects and the second as the carrier of coeffects. Section 3.3.1 constructs a unified context carrying both, gives each of its keys a set of operations, and establishes the context paradigm by constraining the stages of an effect iterator (Definition 30). Section 3.3.2 then makes the operations the standard of comparison: two context states are observationally equivalent when no sequence of operations distinguishes them, and every equality of Section 3.1 is re-read up to that equivalence.

3.3.1. Unified Context

For a context Γ, the effect context 𝜕Γ (Section 3.1) provides a higher-level abstraction, carrying the previous-level context and that level’s accumulator (Definition 2). Making this structure recursive and combining it with the coeffect context Σ yields the following type:

Definition 28. The context type Γ∞ is defined as:

Γ∞≔𝜇Γ. Γ × (Γ →Γ) × Σ (29)

where the three projections are:

• Γ: the current context state (recursive); • Γ →Γ: the accumulator, which reverts this level’s effects; • Σ: the coeffect context carrying dependency information.

Under this definition, effect maps 𝔈Γ∞ to itself, unifying the 𝜕-tower into a single self- similar type. The coeffect context Σ is structurally integrated: dependency operations (set, get) act on Σ, and the accumulator holds their inverses. Since the type family 𝒱︀ underlying Σ is unconstrained, any state the system needs to share across components can be encoded as a dependency with an appropriate value type—Σ subsumes all shared mutable states, not just inter-component dependencies. Every interaction between a component and its environment passes through this single entity.

Passing through one entity is a discipline only where there is nothing else to pass through, so what a component may do with a bound value has to be fixed as well. A key therefore carries more than a value type:

Definition 29. A coeffect at a key 𝑘 is a pair (𝒱︀𝑘, 𝒜︀𝑘), where 𝒱︀𝑘 is the value type of Definition 19 and 𝒜︀𝑘 is a set of coeffect operations, the operations the value bound at 𝑘 provides to a component holding it. An operation 𝑎∈𝒜︀𝑘 carries an argument type 𝑋𝑎 and an outcome type 𝐵𝑎, and acts on the value alone:

𝑎: 𝑋𝑎→𝒱︀𝑘⇀𝒱︀𝑘× (𝒱︀𝑘⇀𝒱︀𝑘) × 𝐵𝑎 (30)

### 第 21 页中文对照

具有 specification 𝑑 的组件访问键 𝑘 时，系统会合并组件声明的元数据与上下文携带的元数据，再把结果传给 provider function。合并遵循各键自己的语义，例如标量字段覆盖、集合字段取并集；它采用右侧优先，因此上下文元数据可以覆盖组件声明，让外层上下文无需修改组件就能约束组件怎样使用 coeffect。

第 3.1 节与第 3.2 节各自作用于一个上下文：前者把它视为 effect 的载体，后者把它视为 coeffect 的载体。第 3.3.1 节构造同时携带两者的统一上下文，为每个键赋予一组操作，并通过约束 effect iterator 的 stage 建立 context paradigm。第 3.3.2 节再以这些操作作为比较标准：若没有任何操作序列能够区分两个 context state，它们便观察等价；第 3.1 节的所有等式都将在这种等价意义下重新解释。

Effect context ∂Γ 是 Γ 上的高层抽象，携带前一层上下文与该层 accumulator。把这一结构递归化并与 coeffect context Σ 结合，得到定义 28 的统一 context type Γ∞。在该定义下，effect 把 Γ∞ 映射到自身，将整个 ∂ 层级统一成自相似类型。Coeffect context 在结构上集成其中：依赖操作作用于 Σ，accumulator 保存它们的 inverse。由于 Σ 的底层类型族不受限制，系统需要在组件间共享的任意状态都能编码成带适当值类型的依赖；Σ 因而涵盖所有共享可变状态，而不只是组件间依赖。组件与环境的每次交互都通过这个单一实体进行。

只有不存在旁路时，“经过一个实体”才真正成为纪律，所以组件能对绑定值执行的操作也必须固定。为此，一个键不仅携带值类型，还携带 definition 29 所述的一组 coeffect operation。

21

<!-- page 22 of 92 -->

its first two constituents forming an effect function on 𝒱︀𝑘 witnessed as Definition 8 requires, and its third an outcome. The operations induce the equivalence ≃𝑘 on 𝒱︀𝑘 up to which values at 𝑘 are compared (Section 3.3.2). An operation acts on the coeffect context through its lift

𝑎Σ(𝑥)(𝜎) ≔𝐥𝐞𝐭(𝑣, 𝑔, 𝑏) = 𝑎(𝑥)(𝜎(𝑘)) 𝐢𝐧(𝜎[𝑘↦𝑣], 𝜆𝜎′.𝜎′[𝑘↦𝑔(𝜎′(𝑘))], 𝑏) (31)

defined when 𝑘∈dom(𝜎), whose first two constituents are an effect function on Σ.

Typing an operation of 𝑘 on 𝒱︀𝑘 is what confines it to the binding at 𝑘: the lift reads and writes that binding and leaves every other key as it stands, so no side condition is needed to say so. Where isolation is in force the binding it reaches is the one the realm resolves to (Definition 24), two keys sharing a realm sharing one binding. An operation whose behavior turns on another key reads that key’s value into its argument 𝑋𝑎, and the reactive discipline of Section 3.2.2 is what holds the binding in place for as long as the component that read it runs (Theorem 70), the value moving only by operations of that key. The pair is not yet the whole of a coeffect: once the independence of two operations has been defined, Section 3.4.2 completes the pair with a third constituent, a witness certifying that the operations of 𝒜︀𝑘 are pairwise independent.

What a component performs is a sequence of stages in which each may depend on what the ones before it yielded: an operation on a value some key binds, or the provision of a binding of its own. Iterators of that shape, one stage per iteration, are the form the discipline takes at an effect function.

Definition 30. For key sets 𝑃⊆𝑆⊆𝐾, the context-mediated iterators ℑ𝒜︀

Σ(𝑆, 𝑃) form the least set of iterators on Σ that contains the unit 𝜎↦(𝜎, idΣ, 𝖭𝗈𝗍𝗁𝗂𝗇𝗀) and, whenever each named continuation is 𝖭𝗈𝗍𝗁𝗂𝗇𝗀 or 𝖩𝗎𝗌𝗍 of a member, contains

(32)

𝜎↦𝐥𝐞𝐭(𝛿, 𝑠, 𝑏) = 𝑎Σ(𝑥)(𝜎) 𝐢𝐧(𝛿, 𝑠, 𝑐𝑏) for 𝑘∈𝑆, 𝑎∈𝒜︀𝑘, 𝑥: 𝑋𝑎, (𝑐𝑏)𝑏∈𝐵𝑎 𝜎↦𝐥𝐞𝐭(𝛿, 𝑠) = set(𝑘, 𝑣)(𝜎) 𝐢𝐧(𝛿, 𝑠, 𝑐) for 𝑘∈𝑃, 𝑣: 𝒱︀𝑘, 𝑐

An operation stage performs one coeffect operation and chooses what follows it by the outcome, so an argument may depend on the outcomes already obtained. A provision stage installs one binding, at a key no operation can create, an operation presupposing the binding it acts on, and yields the restriction set pairs with the extension (Definition 20). The stages occurring in a member are its own and those of every iterator its continuations reach.

Membership in this class is the formal content of mediating every interaction through the context. What falls outside it is a map reading anything else, whether a key it performs no stage at or a location no key binds; an allocator drawing handles from a counter the context does not carry is the second case, and becomes context-mediated once the counter is bound at a key of its own.

Hierarchical composition. The recursive structure of Γ∞ supports hierarchical control: a parent context aggregates multiple child-level effects, forming a tree-shaped control structure that maintains modularity while enabling unified cross-level management. The effect transfor­ mation realizes a literal “plug-in” metaphor:

• Loading a component corresponds to executing its effects (plugging in); • Unloading a component corresponds to reverting its effects (unplugging, without affect­ ing other running components);

### 第 22 页中文对照

Coeffect operation 的前两个分量构成值类型上的有 witness effect function，第三个分量是 outcome。操作会诱导该键值类型上的等价关系，键上的值依此比较。操作通过 lift 作用于 coeffect context，其前两个分量构成 Σ 上的 effect function。

把键 𝑘 的操作类型化在 𝒱︀𝑘 上，就把它限制在该键的绑定内：lift 只读写该绑定，其余键保持不变。启用 isolation 时，它到达的是 realm 解析出的绑定，共享 realm 的两个键共享同一绑定。若操作行为取决于另一个键，则把另一个键的值作为参数传入；响应式纪律会保证读取该值的组件运行期间绑定不动，值只能通过该键自身的操作改变。第 3.4.2 节还会加入第三项内容：证明同一键的操作两两独立的 witness。

组件执行的是一串 stage，后续 stage 可以依赖之前 stage 的结果：或者操作某个键绑定的值，或者提供自己的绑定。定义 30 给出这种 context-mediated iterator，每轮正好一个 stage。

Operation stage 执行一个 coeffect operation，并根据 outcome 选择后续 continuation，因此参数可以依赖之前获得的 outcome。Provision stage 安装一个绑定；操作本身不能创建绑定，只能以绑定已经存在为前提。一个成员中出现的 stage 包括它自身以及 continuation 可达 iterator 中的所有 stage。

属于这一类别，就是“每次交互都经上下文中介”的形式含义。任何读取其他内容的映射都不在其中，无论它读取了未执行相应 stage 的键，还是读取了没有任何键绑定的位置。若 allocator 从上下文外部计数器分配 handle，它就属于后一种；把计数器绑定到专门的键后，它才成为 context-mediated。

Γ∞ 的递归结构支持层级控制：父上下文聚合多个子层 effect，形成树形控制结构，在保持模块性的同时实现统一跨层管理。加载组件对应执行 effect，卸载对应撤销 effect；不同层级组件可以独立装卸；父上下文聚合并管理全部子组件 effect，支持任意嵌套组合。

22

<!-- page 23 of 92 -->

• Components at different levels of the hierarchy are independently loadable and unload­ able; a parent context aggregates and manages the effects of all its children, enabling arbitrarily nested composition.

3.3.2. Observational Equivalence

The recovery guarantee of Section 3.1 asserts an equality of states (Theorem 7), which is an idealization, because the physical state cannot be recovered as it stood. For example, free releases a block to the allocator without restoring the layout the heap had before malloc; and a generative name is not restored by the inverse that discards it, since the next creation draws a fresh one [40]. The equalities of Section 3 are therefore to be read up to an equivalence ≃, and we take ≃ to be an observational equivalence: two states are related when no observer can distinguish them. Comparing behavior rather than representation is the established route to program equivalence [41], and the relation such a comparison yields depends on what the observer is given to work with [42]. What an observer of a context is given is the coeffects it carries, and what an observer of a value is given is the operations of its key (Definition 29), so the relation at each key is generated from those operations, and the relation on a context is assembled from the relations at its keys. Both constructions are the business of this subsection, and quotienting by the result is what makes the independence of Section 3.4.1 attainable.

An observer of a value runs the operations of its key and reads their outcomes.

Definition 31. Let 𝑉 carry a set 𝒜︀ of operations in the sense of Definition 29. A test over 𝒜︀ is a finite word whose letters are forward maps and yielded inverses of the effect functions 𝑎(𝑥), over every 𝑎∈𝒜︀ and every argument 𝑥: 𝑋𝑎, each letter applied to the value the letters before it left; its outcomes are those the letters that are forward maps yield along the way, and it is undefined where a precondition fails. Values 𝑣, 𝑣′ : 𝑉 are indistinguishable, written 𝑣≈𝒜︀𝑣′, when every test over 𝒜︀ is defined at both or at neither and yields the same outcomes at both. The equivalence at a key is indistinguishability under its own operations:

≃𝑘 ≔ ≈𝒜︀𝑘 (33)

An operation respects an equivalence when, at related values, it is defined at both or at neither and, where defined, yields related successors, inverses carrying related values to related values, and equal outcomes.

Lemma 32. Each ≃𝑘 is an equivalence that every operation of 𝒜︀𝑘 respects, and it is the coarsest such relation. That is,

1. ≈𝒜︀ is an equivalence, and every operation of 𝒜︀ respects it; 2. every equivalence that every operation of 𝒜︀ respects is contained in ≈𝒜︀.

Proof.

1. Agreement of tests, in definedness and in outcomes, is reflexive, symmetric, and transi­ tive. Let 𝑣≈𝒜︀𝑣′ and let 𝑎∈𝒜︀ be applied to an argument. Prefixing a test by one letter is again a test, so the values the forward map reaches are indistinguishable, as are the values any one yielded inverse reaches from indistinguishable arguments; the one-letter test gives definedness at both or neither and equality of the outcome. 2. Let 𝑅 be such an equivalence and 𝑣𝑅𝑣′. Each letter of a test is a forward map or a yielded inverse of an operation, and respect carries 𝑅 along either, keeping the values reached related and the outcomes equal at every letter. Hence every test agrees at 𝑣 and 𝑣′. □

### 第 23 页中文对照

第 3.1 节的恢复保证断言状态相等，但物理状态通常不可能原样恢复。例如 free 把内存块交还 allocator，却不恢复 malloc 前的 heap layout；丢弃生成式名称的 inverse 也不会恢复该名称，因为下一次创建会生成新名称 [40]。因此，第 3 节的等式应理解为某个等价关系 ≃ 下的相等。本文采用观察等价：若任何 observer 都无法区分两个状态，它们便相关。按行为而非表示比较，是程序等价的成熟方法 [41]；所得关系取决于 observer 可使用什么 [42]。上下文 observer 能使用其 coeffect，值 observer 能使用该键的操作。因此，每个键上的关系由其操作生成，context 上的关系再由各键关系组装。对所得关系取商，才能使第 3.4.1 节的 independence 可达到。

值的 observer 运行该键的操作并读取 outcome。定义 31 把 test 定义为由前向映射及各操作返回的 inverse 构成的有限序列；每个字母作用于前面字母留下的值。若两个值上的每个 test 要么都定义、要么都未定义，并产生相同 outcome，则二者不可区分。键上的等价关系就是相对自身操作的不可区分性。

若一个操作在相关值上同时有定义或同时无定义，并在有定义时产生相关后继、把相关值带到相关值的 inverse，以及相同 outcome，就称该操作尊重该等价关系。

引理 32 表明，每个 ≃𝑘 都是该键所有操作尊重的等价关系，而且是满足这一条件的最粗关系。证明基于 test 在定义性与 outcome 上的一致具有自反、对称与传递性；在 test 前加一个操作仍是 test，因此前向映射和 inverse 都保持不可区分性。反过来，若关系 𝑅 被全部操作尊重，那么 test 的每个字母都会沿前向或 inverse 保持 𝑅，并保持 outcome 相同，所以任何 test 都无法区分 𝑅 相关的值。

23

<!-- page 24 of 92 -->

Clause (2) doubles as the proof principle for ≃𝑘: to relate two values, exhibit an equivalence the operations respect that contains the pair.

Definition 33. Two coeffect contexts are related at a set 𝑆⊆𝐾 of keys when they bind the same keys of 𝑆 to related values, and two states of a context when their coeffect projections are:

𝜎≃𝑆𝜎′ ≔ dom(𝜎) ∩𝑆= dom(𝜎′) ∩𝑆∧∀𝑘∈dom(𝜎) ∩𝑆. 𝜎(𝑘) ≃𝑘𝜎′(𝑘)

𝛾≃𝑆𝛾′ ≔ 𝜎𝛾≃𝑆𝜎𝛾′ (34)

writing 𝜎𝛾 for the coeffect projection of 𝛾 (Definition 28). Each ≃𝑘 is an equivalence on 𝒱︀𝑘 by Lemma 32, so ≃𝑆 is an equivalence on coeffect contexts and on states, each of the three properties holding key by key. The subscript is dropped where 𝑆= 𝐾, so that ≃ is the finest of these relations and ≃𝑆 forgets the keys outside 𝑆 as well.

The part of a state that no key binds is thereby forgotten, and forgetting it is what lets Theorem 7 be read up to ≃ at all: the heap layout and the generative name of the examples above lie outside the relation unless some key binds them. A restriction forgets more, comparing only what the keys of 𝑆 bind, and Section 4 reads each claim about one component at the restriction that component’s own declarations name (Definition 48). What Section 3.2.2 needs of ≃ follows rather than being assumed. Related states have the same domain, so they agree on the satisfaction predicate 𝜎⊧𝑑 and on the classification notify𝑑 of Definition 22, and reactivity is a property of Σ/ ≃.

Substituting ≃ for = throughout is not by itself enough, because an effect function returns an inverse as well as a state, and two states that ≃ identifies have to yield inverses ≃ identifies as well.

Definition 34. The relation of Definition 33 on states and each ≃𝑘 on the values of its key are the base cases, and on any other base type ≃𝑆 is equality. The relation extends along the type formers:

for 𝑓, 𝑔: 𝑋→𝑌, 𝑓≃𝑆𝑔 ≔ (𝛾: 𝑋) →(𝛾′ : 𝑋) →(𝛾≃𝑆𝛾′ →𝑓(𝛾) ≃𝑆𝑔(𝛾′))

for 𝑎, 𝑏: 𝑋1 × ⋯× 𝑋𝑛, 𝑎≃𝑆𝑏 ≔ (𝑎1 ≃𝑆𝑏1) ∧⋯∧(𝑎𝑛≃𝑆𝑏𝑛)

(35)

for 𝑥, 𝑦: 𝖬𝖺𝗒𝖻𝖾(𝑋), 𝑥≃𝑆𝑦 ≔

𝑧≃𝑆𝑧′ if 𝑥= 𝖩𝗎𝗌𝗍(𝑧) and 𝑦= 𝖩𝗎𝗌𝗍(𝑧′) ⊤ if 𝑥= 𝑦= 𝖭𝗈𝗍𝗁𝗂𝗇𝗀 ⊥ otherwise

{

On a recursive type the clauses are read coinductively, ≃𝑆 being the greatest relation satisfying its unfolding, as on ℑΓ. A map or an iterator respects ≃𝑆 when it is related to itself, written 𝑓≃𝑆𝑓.

Lemma 35. On maps and on iterators ≃𝑆 is a partial equivalence: it is symmetric and transitive, so two related members each respect it.

Proof. On the base types ≃𝑆 is an equivalence, by Definition 33 and Lemma 32. For functions, symmetry is symmetry of the base relations applied at input and output, and transitivity reads the middle map at 𝛾′ ≃𝑆𝛾′: from 𝑓≃𝑆𝑔, 𝑔≃𝑆ℎ, and 𝛾≃𝑆𝛾′ follow 𝑓(𝛾) ≃𝑆𝑔(𝛾′) and 𝑔(𝛾′) ≃𝑆ℎ(𝛾′), whence 𝑓(𝛾) ≃𝑆ℎ(𝛾′); products inherit both componentwise and 𝖬𝖺𝗒𝖻𝖾 by cases. For iterators, the inverse 𝑅−1 and the composite 𝑅∘𝑅 of the greatest relation 𝑅 satisfy the unfolding again, by the two arguments above read coinductively, so both are contained in 𝑅. Then 𝑓≃𝑆𝑔 gives 𝑓≃𝑆𝑓 by symmetry and transitivity, which is respect. □

### 第 24 页中文对照

引理 32 的第二条也给出了证明 ≃𝑘 的原则：要关联两个值，只需构造一个被所有操作尊重、且包含这对值的等价关系。

定义 33 把键上的关系提升到 coeffect context 与 context state：在键集 𝑆 上，两张表必须绑定相同的键，并在每个绑定键上具有相关值。由于每个 ≃𝑘 都是等价关系，逐键定义的 ≃𝑆 也分别是 coeffect context 与 state 上的等价关系。省略下标表示 𝑆 = 𝐾；限制到 𝑆 则进一步忘掉 𝑆 外的键。

没有任何键绑定的 state 部分会被遗忘；这使定理 7 能够在 ≃ 意义下阅读，因为前述 heap layout 与生成式名称若不由键绑定，就不进入关系。限制到 𝑆 会忘掉更多，只比较 𝑆 中键的绑定。第 4 节关于单个组件的命题，都限制在该组件自身声明所命名的键上。相关状态具有相同定义域，因而对满足谓词和 notify 分类达成一致；响应性于是成为商空间 Σ/≃ 上的性质，而非额外假设。

仅把所有等号替换为 ≃ 还不够，因为 effect function 除了 state 还返回 inverse；被 ≃ 识别的 state 也必须产生被 ≃ 识别的 inverse。定义 34 因此从 state、键值及其他基础类型出发，将关系沿函数、积与 Maybe 类型扩展；递归类型上的条款按余归纳解释。映射或 iterator 与自身相关时，称其尊重 ≃𝑆。

引理 35 表明，映射与 iterator 上的 ≃𝑆 是偏等价关系：它具有对称性和传递性，因此两个相关成员各自都尊重该关系。基础类型上的结论来自定义 33 与引理 32；函数、积和 Maybe 逐结构继承这些性质，iterator 则按余归纳得到。

24

<!-- page 25 of 92 -->

A map respecting ≃𝑆 is one that descends to Γ/ ≃𝑆, and two maps related by ≃𝑆 are two that descend to the same map there, each respecting it by Lemma 35. Reflexivity is the one property the function former does not preserve: 𝑓≃𝑆𝑓 demands related outputs at every pair of related inputs and not at the equal ones alone, so it holds of a map exactly where the map descends, which is why respect is a condition rather than a given. Respect at two key sets is two conditions of which neither implies the other, since ≃⊆≃𝑆 weakens the hypothesis and the conclusion together. A map that branches on a key outside 𝑆 is the case that separates them, respecting ≃ and failing to respect ≃𝑆.

Definition 36. Define the effect function witnessed up to ≃𝑆 as:

𝔈𝑆

Γ ≔(𝑒: Γ →Γ × (Γ →Γ)) × (𝑒≃𝑆𝑒)

× ((𝛾: Γ) →(𝛿: Γ) →(𝑔: Γ →Γ) →((𝛿, 𝑔) = 𝑒(𝛾) →𝑔(𝛿) ≃𝑆𝛾)) (36)

The clause 𝑒≃𝑆𝑒 carries every constituent’s respect, its instance at 𝛾≃𝑆𝛾 relating each yielded inverse to itself. We write 𝔈∗

Γ for 𝔈𝐾

Γ , and taking ≃ to be equality on Γ recovers Definition 8, every map being equal to itself. The key set is where a component’s declarations enter: what Section 4 holds an effect function to is 𝔈𝑆

Γ at the keys that component names (Definition 48).

The iterator of Section 3.1.3 is witnessed the same way, its continuation compared by Defin­ ition 34 and witnessed again by the recursion:

Definition 37. Define the effect iterator witnessed up to ≃𝑆 as:

ℑ𝑆

Γ ≔𝜇ℑ. (𝑒: Γ →Γ × (Γ →Γ) × 𝖬𝖺𝗒𝖻𝖾(ℑ)) × (𝑒≃𝑆𝑒)

× ((𝛾: Γ) →(𝛿: Γ) →(𝑔: Γ →Γ) →(𝑜: 𝖬𝖺𝗒𝖻𝖾(ℑ)) →((𝛿, 𝑔, 𝑜) = 𝑒(𝛾) →𝑔(𝛿) ≃𝑆𝛾)) (37)

The embedding of Section 3.1.3 carries 𝔈𝑆

Γ into ℑ𝑆

Γ, and taking ≃ to be equality on Γ and 𝑆= 𝐾 recovers the witnessed ℑ∗

Γ of Definition 17.

Lemma 38. With 𝔈∗

Γ read as in Definition 36, every equality of states asserted in Section 3.1 holds with = replaced by ≃, and the accumulator of every state reachable from (𝛾0, idΓ) respects ≃. The same holds of any equivalence substituted for ≃, the proof using no property of the relation beyond transitivity and respect.

Proof. An accumulator is a composition of inverses, each respecting ≃, the clause 𝑒≃𝑒 of Definition 36 read at 𝛾≃𝛾, and a composition of maps respecting ≃ respects ≃, the base case being idΓ. The proofs of Section 3.1 then go through unchanged, respect being what carries a relation through an inverse: from 𝑔2(𝛿2) ≃𝛿1 and 𝑔1(𝛿1) ≃𝛾 respect gives (𝑔1 ∘𝑔2)(𝛿2) ≃𝛾, which is the step each composition of inverses takes, and the soundness invariant of Theorem 7 reads 𝜑(𝛾) ≃𝛾0 by that step. □

The stage shape of Definition 30 settles which readings of ≃ a member admits, and with them its membership in the witnessed iterators, which is what lets a claim about one component be read at the keys that component names.

Lemma 39. Let 𝑖∈ℑ𝒜︀

Σ(𝑆′, 𝑃) and let 𝑆⊆𝐾 contain every key at which a stage of 𝑖 occurs. Then 𝑖 lies in ℑ𝑆

Σ (Definition 37); in particular 𝑖 and every inverse it yields respect ≃𝑆, and the witnesses hold at equality.

### 第 25 页中文对照

尊重 ≃𝑆 的映射可以下降到商空间 Γ/≃𝑆；两个由 ≃𝑆 关联的映射会下降成同一个映射。函数类型构造不自动保持自反性：𝑓 ≃𝑆 𝑓 要求在每对相关输入上都得到相关输出，而不仅是相等输入，因此“尊重关系”是一项条件而非默认事实。在两个键集上尊重关系是彼此都不蕴含的两项条件；根据 𝑆 外键分支的映射能区分它们。

定义 36 给出在 ≃𝑆 意义下有 witness 的 effect function。𝑒 ≃𝑆 𝑒 条款携带所有组成部分对关系的尊重，而 witness 只要求 inverse 把后继带回与起点相关的状态。键集正是组件声明进入模型的位置：第 4 节只在组件命名的键上要求其 effect function 满足这一类型。

定义 37 以同样方式为 effect iterator 加 witness，并递归比较 continuation。第 3.1.3 节的嵌入把 𝔈𝑆Γ 带入 ℑ𝑆Γ；若把 ≃ 取为 Γ 上的相等且 𝑆 = 𝐾，就恢复此前的 witnessed iterator。

引理 38 表明，把 𝔈∗Γ 按定义 36 解读后，第 3.1 节断言的每个状态相等式都可把等号替换为 ≃；从初始状态可达的每个 accumulator 也尊重 ≃。证明只依赖关系的传递性和各映射对关系的尊重：accumulator 是 inverse 的复合，故仍尊重关系；随后原证明逐步照搬即可。

定义 30 的 stage 形状决定一个成员允许哪些 ≃ 解读，从而决定它属于哪些 witnessed iterator；这使单组件命题能够在组件命名的键集上成立。

引理 39 说明：若 context-mediated iterator 的所有 stage 所在键都包含于 𝑆，则该 iterator 属于 ℑ𝑆Σ；特别地，它及其返回的每个 inverse 都尊重 ≃𝑆，并在相等输入上满足 witness。

25

<!-- page 26 of 92 -->

Proof. By induction on the construction of Definition 30. The unit yields its argument, idΣ, and 𝖭𝗈𝗍𝗁𝗂𝗇𝗀 everywhere. At an operation stage performing 𝑎∈𝒜︀𝑘, let 𝜎≃𝑆𝜎′; then 𝑘∈𝑆, so 𝜎(𝑘) ≃𝑘𝜎′(𝑘). 𝑎 respects ≃𝑘 (Lemma 32), so it is defined at both or at neither and yields ≃𝑘- related values, equal outcomes, and inverses carrying ≃𝑘-related values to ≃𝑘-related values, and its lift reads and writes 𝑘 alone; the states reached are therefore ≃𝑆-related, the inverses are ≃𝑆-related and respect ≃𝑆, and the equal outcomes select one continuation, to which the induction hypothesis applies. At a provision stage at 𝑘∈𝑃⊆𝑆, the precondition 𝑘∉dom(𝜎) holds at both or at neither, the states reached bind 𝑘 to the one value the stage carries, and the restriction it yields respects ≃𝑆, two related states binding 𝑘 alike. The witness of each stage holds at equality, the lift of an operation’s inverse restoring the value Definition 29 witnesses it to and the restriction reverting the extension (Definition 20), and equality gives ≃𝑆. □

A stage reads the key it performs at and nothing else, so the hypothesis is met by taking 𝑆 to be the keys the member names.

3.4. Attaining Independence

On the strength of Section  3.3, this section supplies the condition that extends the local guarantees to a system of interleaved components. Section 3.4.1 defines the condition, namely independence of two effect functions: every transformation of one commutes with every trans­ formation of the other, forward maps and yielded inverses alike. Section 3.4.2 then reduces independence of context-mediated effect functions to commutativity at single coeffects and refines the coeffect with a witness of that commutativity, parallel to the witness of an effect function.

3.4.1. Effect Independence

Reverting an effect at the state its own application produced is what Theorem  16 covers; reverting one at any other state is what this subsection covers. Two situations call for the latter. An inverse may be run while later effects are still in place, which is what removing one component from a running system amounts to; and one sequence may interleave the effects of several components, each holding the inverses of its own, so that the inverses of one component are separated by the applications of another. In both an inverse meets a state that foreign effects have moved, and whether it still reverts what it was built to revert is a question of commutation: what has to commute is every transformation one effect can perform with every transformation the other can perform, forward map and yielded inverse alike. A single accumulator settles neither situation, 𝜑 being a composite that runs every inverse it holds in one order and all at once.

An iterator gives rise to several maps: the forward map of each iteration it can reach, and the inverse each yields at each context state. Commutation of two iterators relates the two collections rather than two single maps, and those collections are what the definitions below quantify over.

Definition 40. For an iterator 𝑖∈ℑΓ, let reach(𝑖) be the least set of iterators containing 𝑖 and closed under continuation. The transformation monoid 𝔐(𝑖) is the submonoid of Γ →Γ generated by the forward maps and the yielded inverses of every iterator in reach(𝑖), and the generators of 𝔐(𝑖) are the elements of that generating set:

### 第 26 页中文对照

引理 39 的证明对定义 30 的构造归纳。Unit 显然保持状态；operation stage 因其操作尊重键上的等价而在相关输入上同时有定义，并产生相关值、相同 outcome 与保持关系的 inverse；provision stage 则在相关输入上同时满足前置条件，并把同一值绑定到同一键。每个 stage 的 witness 在相等输入上成立。由于 stage 只读取它执行所在的键，只要取 𝑆 为成员命名的键集，假设自然满足。

基于第 3.3 节，本节给出把局部保证扩展到多组件交错系统的条件。第 3.4.1 节定义两个 effect function 的 independence：一方能够执行的每个变换，都与另一方能够执行的每个变换交换，前向映射和返回的 inverse 都包括在内。第 3.4.2 节再把 context-mediated effect function 的 independence 归约为单个 coeffect 上的交换性，并像 effect function 的 witness 一样，把交换性 witness 加入 coeffect。

定理 16 只覆盖在 effect 自己产生的状态上撤销它；本小节处理在其他状态上撤销。两种情况需要后者：撤销某 effect 时，后续 effect 可能仍然存在；或者多个组件 effect 交错，各自保存自己的 inverse，使某组件的 inverse 被另一组件的应用隔开。此时 inverse 遇到的是被外来 effect 移动过的状态，它还能否只撤销自身贡献取决于交换性。单个 accumulator 无法解决，因为它只能按固定顺序一次运行全部 inverse。

Iterator 会产生多个映射：每个可达迭代的前向映射，以及它在每个 context state 返回的 inverse。两个 iterator 的交换性比较的是两组映射，而不是两个单独映射。

定义 40 用 continuation 可达闭包定义 reach(𝑖)，并把 transformation monoid 定义为由所有可达 iterator 的前向映射和返回 inverse 生成的子幺半群。普通 effect function 可经嵌入得到相同解释；由变换对诱导的 effect，其生成元就是该对中的前向与 inverse。

26

<!-- page 27 of 92 -->

reach(𝑖) ≔⋂{𝑆| 𝑖∈𝑆∧∀𝑖′ ∈𝑆, 𝛾∈Γ. 𝑖′(𝛾) = (−, −, 𝖩𝗎𝗌𝗍(𝑖″)) ⇒𝑖″ ∈𝑆}

(38)

𝔐(𝑖) ≔⟨{pr1 ∘𝑖′ | 𝑖′ ∈reach(𝑖)} ∪{pr2(𝑖′(𝛾)) | 𝑖′ ∈reach(𝑖), 𝛾∈Γ}⟩

Write len(𝑖) for the supremum of |𝐶| over the chains 𝐶⊆reach(𝑖) that continuation orders. Through the embedding of Section 3.1.3, 𝔐(𝑒) at an effect function 𝑒 is generated by the forward map of 𝑒 together with every inverse 𝑒 yields; an effect induced by a pair (𝑓, 𝑔) ∈𝔗Γ has 𝑓 and 𝑔 for its generators, the inverse it yields being 𝑔 at every state.

Lemma 41. Commutation is settled on the generators, and ⋄ enlarges no transformation monoid. That is,

1. if every generator of 𝔐(𝑒1) commutes with every generator of 𝔐(𝑒2), then every element of 𝔐(𝑒1) commutes with every element of 𝔐(𝑒2); 2. 𝔐(𝑒1 ⋄𝑒2) ⊆⟨𝔐(𝑒1) ∪𝔐(𝑒2)⟩.

Proof.

1. The maps commuting with every generator of 𝔐(𝑒2) form a submonoid of Γ →Γ, since idΓ lies in it and 𝑓∘𝑓′ does where 𝑓 and 𝑓′ do. That submonoid contains the generators of 𝔐(𝑒1) by hypothesis and hence contains 𝔐(𝑒1). Fixing 𝑓∈𝔐(𝑒1), the maps commuting with 𝑓 likewise form a submonoid containing the generators of 𝔐(𝑒2) and hence 𝔐(𝑒2). 2. By Definition 9 the forward map of 𝑒1 ⋄𝑒2 is (pr1 ∘𝑒1) ∘(pr1 ∘𝑒2) and the inverse it yields at any state is 𝑠∘𝑡 for an 𝑠 yielded by 𝑒2 and a 𝑡 yielded by 𝑒1. Every generator of 𝔐(𝑒1 ⋄ 𝑒2) is therefore a composite of generators of the two. □

Definition 42. Iterators 𝑖, 𝑗∈ℑΓ are independent when

1. every transformation of one commutes with every transformation of the other, ∀𝑓∈𝔐(𝑖), 𝑔∈𝔐(𝑗). 𝑓∘𝑔= 𝑔∘𝑓 (39) 2. neither one’s transformations disturb what the other yields, inverse and continuation alike,

∀𝑖′ ∈reach(𝑖), 𝑔∈𝔐(𝑗), 𝛾∈Γ. pr2,3(𝑖′(𝑔(𝛾))) = pr2,3(𝑖′(𝛾)) (40)

and the same with 𝑖 and 𝑗 exchanged. A family (𝑖𝑙)𝑙∈𝐿 is pairwise independent when 𝑖𝑙 and 𝑖𝑙′ are independent for every 𝑙≠𝑙′. A family may repeat an iterator, and holding one independent of itself is holding 𝔐(𝑖) commutative.

Read at effect functions through the embedding of Section 3.1.3, clause (2) compares the inverse alone, the continuation being 𝖭𝗈𝗍𝗁𝗂𝗇𝗀 at every state, and the result below is given at effect functions; Section 4 applies the definition at the iterators themselves. For effects induced by pairs (𝑓1, 𝑔1) and (𝑓2, 𝑔2), clause (1) is by Lemma 41(1) the commutation of the four pairs 𝑓1, 𝑓2; 𝑔1, 𝑔2; 𝑓1, 𝑔2; and 𝑔1, 𝑓2, and clause (2) holds outright, an induced effect yielding one inverse at every state. Commutation under ⋄ is a different property. What 𝑒1 ⋄𝑒2 = 𝑒2 ⋄𝑒1 equates is the composite forward map of the two orders with each other and the composite inverse of the two orders with each other, each inverse entering the composite at the state its own application produced; independence instead relates each transformation of one effect to each transformation of the other, a forward map paired with a foreign inverse included.

Under independence an inverse may be run at a state later effects have moved, and it with­ draws there its own contribution and nothing else, whatever order the inverses are applied in:

### 第 27 页中文对照

引理 41 表明，交换性只需在生成元上验证，而且 ⋄ 不会扩大 transformation monoid。若两边每对生成元都交换，则由它们生成的所有复合也都交换；复合 effect 的每个生成元也只是两侧生成元的复合。

定义 42 规定两个 iterator 独立，当且仅当满足两项条件。第一，一方 transformation monoid 的每个变换都与另一方的每个变换交换。第二，一方的变换不会扰动另一方返回的 inverse 与 continuation；交换双方后也同样成立。一个族若任意两个不同成员独立，就称两两独立。族中可以重复同一 iterator，此时要求它与自身独立，就是要求其 transformation monoid 可交换。

通过第 3.1.3 节的嵌入解释到 effect function 时，第二条只需比较 inverse，因为 continuation 始终为 Nothing。对于由两对固定变换诱导的 effect，第一条等价于四种前向与 inverse 配对都交换，第二条则自动成立，因为每个 effect 在所有状态返回同一个 inverse。

Independence 与 ⋄ 下的交换性不同。等式 𝑒1 ⋄ 𝑒2 = 𝑒2 ⋄ 𝑒1 只比较两种次序下的复合前向映射和复合 inverse，并且每个 inverse 都在自身应用产生的状态进入复合；independence 则逐一比较一方的每个变换与另一方的每个变换，包括前向映射与外来 inverse 的组合。

在 independence 下，inverse 可以作用于被后续 effect 移动过的状态，并只撤回自身贡献，而不影响其他 effect；inverse 采用什么顺序都不改变这一点。

27

<!-- page 28 of 92 -->

Theorem 43. Let 𝑒1, ⋯, 𝑒𝑛∈𝔈∗

Γ be pairwise independent and applied in order from 𝛾0, and let each 𝑔𝑖 be the inverse 𝑒𝑖 yields where it is applied. Applying the 𝑛 inverses at the state the sequence reaches, in the order of any permutation of {1, ⋯, 𝑛}, reaches 𝛾0.

Proof. Write 𝑓𝑖≔pr1 ∘𝑒𝑖, let 𝛿𝑖≔𝑓𝑖(𝛿𝑖−1) with 𝛿0 ≔𝛾0, so that 𝑔𝑖= pr2(𝑒𝑖(𝛿𝑖−1)). Fix 𝑗 and write 𝛿′

𝑖≔(𝑓𝑖∘⋯∘𝑓𝑗+1)(𝛿𝑗−1) for the states of the sequence with 𝑒𝑗 omitted, so that 𝛿′

𝑗= 𝛿𝑗−1. Two claims hold for every 𝑢 with 𝑗≤𝑢≤𝑛.

(1) 𝛿𝑢= 𝑓𝑗(𝛿′

𝑢) and 𝑔𝑗(𝛿𝑢) = 𝛿′

𝑢. The first equation is an induction on 𝑢: at 𝑢= 𝑗 it reads 𝛿𝑗= 𝑓𝑗(𝛿𝑗−1), which is the definition of 𝛿𝑗, and for the inductive step, 𝛿𝑢+1 = 𝑓𝑢+1(𝛿𝑢) = 𝑓𝑢+1(𝑓𝑗(𝛿′

𝑢)) = 𝑓𝑗(𝑓𝑢+1(𝛿′

𝑢)) = 𝑓𝑗(𝛿′

𝑢+1), the middle equality being clause (1) of Definition 42 for 𝑒𝑢+1 and 𝑒𝑗, which are distinct effects of the family since 𝑢+ 1 > 𝑗. For the second equation, clause (1) carries 𝑔𝑗 out through the forward maps applied after 𝑒𝑗, leaving the witness of 𝑒𝑗 to be used at the one state it holds at:

𝑔𝑗(𝛿𝑢) = (𝑔𝑗∘𝑓𝑢∘⋯∘𝑓𝑗+1)(𝛿𝑗) = (𝑓𝑢∘⋯∘𝑓𝑗+1)(𝑔𝑗(𝑓𝑗(𝛿𝑗−1))) = 𝛿′

𝑢

the last equality resting on 𝑔𝑗(𝑓𝑗(𝛿𝑗−1)) = 𝛿𝑗−1, which is the witness Definition 8 requires of 𝑒𝑗 at 𝛿𝑗−1.

(2) Each 𝑒𝑖 with 𝑖> 𝑗 yields at 𝛿′

𝑖−1 the same inverse 𝑔𝑖 it yields at 𝛿𝑖−1: by (1) the state 𝛿𝑖−1 is 𝑓𝑗(𝛿′

𝑖−1), and 𝑓𝑗∈𝔐(𝑒𝑗), so clause (2) of Definition 42 for 𝑒𝑖 and 𝑒𝑗 gives pr2(𝑒𝑖(𝑓𝑗(𝛿′

𝑖−1))) = pr2(𝑒𝑖(𝛿′

𝑖−1)).

The theorem follows by downward induction on 𝑛. Let the permutation begin with 𝑗. By (1) applying 𝑔𝑗 at 𝛿𝑛 reaches 𝛿′

𝑛, the state the sequence with 𝑒𝑗 omitted reaches, and by (2) the inverses the remaining effects yielded there are the 𝑔𝑖 in hand. That sequence is pairwise independent, being a subfamily, so the induction hypothesis applies to it and to the rest of the permutation; the empty sequence reaches 𝛾0. □

Section 4.3.2 carries this conclusion to a trace of a whole system, where the steps of other fibers intervene between an effect and its revert.

3.4.2. Coeffect Commutativity

The commutation Definition 42 requires is read up to ≃ by Lemma 38, a yielded continuation compared as Definition 34 compares two iterators, and reading it that way is what makes it attainable at all: two operations may leave values that ≃𝑘 identifies and still count as commut­ ing. Of two operations it requires one thing more than of the effect functions their lifts induce, an operation yielding an outcome as well.

Definition 44. Operations 𝑎 and 𝑎′ are independent when their lifts are independent as effect functions (Definition 42) at every pair of arguments, and neither one’s transformations disturb the outcome the other yields:

∀𝑥: 𝑋𝑎, 𝑔∈𝔐(𝑎′Σ), 𝜎∈Σ. pr3(𝑎Σ(𝑥)(𝑔(𝜎))) = pr3(𝑎Σ(𝑥)(𝜎)) (41)

and the same with 𝑎 and 𝑎′ exchanged, writing 𝔐(𝑎Σ) for the submonoid generated by the forward maps and yielded inverses of the lifts 𝑎Σ(𝑥) over every argument, as Definition 40 generates 𝔐. A key 𝑘 is commutative when any two operations of 𝒜︀𝑘 are independent, an operation being held independent of itself as well.

### 第 28 页中文对照

定理 43 表明，若一组有 witness 的 effect 两两独立，按顺序从 𝛾0 应用，那么在最终状态上按任意排列应用它们各自返回的 inverse，都能回到 𝛾0。

证明固定其中一个 effect 𝑒𝑗，并考虑省略它后的序列。交换性保证 𝑒𝑗 的前向映射可以穿过其后的所有前向映射，因此在最终状态应用 𝑔𝑗，恰好到达省略 𝑒𝑗 的序列所到达的状态。同时，independence 的第二条保证其他 effect 在该状态返回的 inverse 与原先保存的 inverse 相同。于是可对 effect 数量向下归纳：先撤销排列中的首个 effect，再对剩余两两独立的子族应用归纳假设，最终到达 𝛾0。第 4.3.2 节会把这一结论提升到整个系统的 trace，其中其他 fiber 的步骤可以插在某 effect 与其 revert 之间。

定义 42 所需的交换性，依据引理 38 应在 ≃ 意义下解读；continuation 则按定义 34 比较。只有如此，这一条件才真正可达到：两个操作即使留下由 ≃𝑘 识别的不同表示，仍可算作交换。对 operation 而言，还需比它们 lift 后的 effect function 多要求一项，因为 operation 还返回 outcome。

定义 44 规定两个 operation 独立，当且仅当它们对每对参数所诱导的 lift 都作为 effect function 独立，而且一方的变换不会扰动另一方返回的 outcome；交换双方后同样成立。若某键的任意两个 operation 都独立，并且每个 operation 与自身也独立，则称该键可交换。

28

<!-- page 29 of 92 -->

Across distinct keys the condition holds outright.

Theorem 45. Operations at distinct keys are independent.

Proof. Let 𝑎 lie in 𝒜︀𝑘 and 𝑎′ in 𝒜︀𝑘′ with 𝑘≠𝑘′. By Definition 29 every generator of 𝔐(𝑎Σ) is of the form 𝜎↦𝜎[𝑘↦𝑢(𝜎(𝑘))] for a map 𝑢 on 𝒱︀𝑘, being either the lift of a forward map or the lift of a yielded inverse, and likewise for 𝑎′ at 𝑘′. Two such maps commute, each reading and writing one key alone and the two keys differing, and Lemma 41(1) extends the commutation from the generators to the two monoids. For the second condition, what 𝑎Σ yields at 𝜎, inverse and outcome alike, is determined by 𝜎(𝑘), which every generator of 𝔐(𝑎′Σ) leaves as it stands.□

The condition therefore turns on the pairs at one key, and the proof of their independence is made a constituent of the coeffect itself, as the proof that an inverse reverts is a constituent of the effect function (Definition 8):

Definition 46. A coeffect at 𝑘 (Definition 29) is witnessed when it carries, as a third constituent beside 𝒱︀𝑘 and 𝒜︀𝑘, a proof that 𝑘 is commutative (Definition 44).

The two witnesses are parallel: each certifies the condition its consumers would otherwise have to assume, the returned inverse reverting there and the operations commuting here, and each is supplied where the definition is written rather than checked where it is used. By Theorem 45 the proof concerns the operations of 𝑘 alone, so the obligation falls on the compo­ nent providing the key and on no component consuming it; the examples below are how it is discharged. From here on every coeffect is witnessed, and Section 4 reads every key of 𝐾 so.

A key whose value is a table of entries is commutative when each registration takes an entry of its own, registration of a route or of an event listener being the representative case. The operation draws an identifier for the entry it adds and the inverse it yields removes that entry, so two registrations name two entries whatever they register: either order leaves a table that answers every test alike, and either registration can be withdrawn while the other stands. Replicated data types are designed to this condition and attach a unique tag to each addition for this very reason, a set whose additions and removals name a bare element having no such property [43]. A key whose value is an ordered chain is not commutative, since a middleware inserted before another sees a different request, and neither order can be withdrawn without disturbing the other.

The allocator of the opening example divides by what its interface publishes. Where the handles it hands out are compared by no operation of the key, no test observes them, so ≃𝑘 relates two heaps up to a renaming of handles and allocation is commutative; a renaming is an equivalence the operations respect, contained in ≃𝑘 by Lemma 32(2), and it is how CompCert relates the memory states of a program and of its translation [44]. Where the addresses are outcomes compared by equality, the outcome of a further allocation separates the two orders of allocation, and the key is not commutative. POSIX draws the same line across its own allocators:

mmap may return any unused address and creat may assign any unused inode, whereas open is required to return the lowest available descriptor, and that requirement alone is what stops two descriptor allocations from commuting [45].

Definition 31 turns each of these divisions into a design choice. ≃𝑘 is indistinguishability under the tests the operations of 𝑘 generate, so an interface publishing fewer outcomes admits fewer tests and coarsens the relation, and withholding an outcome its callers do not need can carry a key from one side of a division to the other. The scalable commutativity rule applies

29

对于不同的键，该条件直接成立。

定理 45：不同键上的操作彼此独立。

证明。设 a∈𝒜k、a′∈𝒜k′ 且 k≠k′。根据定义 29，𝔐(aΣ) 的每个生成元都只读取并写回键 k，a′ 的生成元则只作用于 k′，所以任意两个生成元可交换；引理 41(1) 把这种交换性推广到两个幺半群。第二项条件也成立，因为 aΣ 在 σ 上产生的逆操作与结果只由 σ(k) 决定，而 𝔐(a′Σ) 的生成元不改变它。□

因此，问题归结为同一键上的操作对；它们独立性的证明成为协效本身的组成部分，正如“逆操作确实能够回退”的证明是效果函数的组成部分（定义 8）。

定义 46：键 k 上的协效（定义 29）若除 𝒱k 与 𝒜k 外还携带 k 满足交换性（定义 44）的证明，就称其得到见证。

两类见证相互平行：一个证明返回的逆操作能够回退，另一个证明操作彼此交换；它们都在定义处提供，而不是让使用者逐次检查。定理 45 表明证明只涉及 k 自身的操作，因此义务只落在提供该键的组件上，与消费者无关。下文示例说明如何履行这一义务。此后所有协效都视为已见证，第 4 节也据此理解 K 中每个键。

若键的值是一张条目表，并且每次注册都占用独立条目，则该键具有交换性；路由和事件监听器注册是典型例子。操作为新增条目取得标识符，产生的逆操作删除该条目，所以两次注册始终指向不同条目：无论顺序如何，得到的表在所有测试下都相同，撤回任一注册也不会影响另一个。复制数据类型正是为满足这种条件而设计，因此会给每次添加附加唯一标签；仅以裸元素命名添加与删除的集合不具备该性质 [43]。若键的值是有序链，它就不具有交换性，因为插在另一个中间件之前会看到不同请求，撤回任一顺序也会扰动另一项。

开篇的分配器应依据接口公开的内容区分。如果键上的任何操作都不比较发出的句柄，测试也无法观察句柄，则 ≃k 允许堆状态在句柄重命名下等价，分配因而可交换；重命名是操作所尊重的等价关系，并由引理 32(2) 包含在 ≃k 中，CompCert 也用它关联程序及其翻译后的内存状态 [44]。如果地址作为结果公开并可按相等性比较，后续分配的结果就能区分两种分配顺序，该键不再可交换。POSIX 对自身分配器也作同样区分：mmap 可以返回任何未用地址，creat 可以分配任何未用 inode，而 open 必须返回最小可用描述符；仅这一要求就足以阻止两次描述符分配交换 [45]。

定义 31 把这些区分转化为设计选择。≃k 是通过键操作所生成测试观察到的不可区分性；接口公开的结果越少，允许的测试越少，等价关系也越粗。隐藏调用者不需要的结果，可能把一个键从不可交换的一侧移到可交换的一侧。可扩展交换性规则把同样的方法用于 POSIX 接口，并把交换性理解为“通过接口不可区分”，而不是内部状态完全相等 [45]。

<!-- page 30 of 92 -->

the same move across the POSIX interface, and reads commutativity as indistinguishability through an interface rather than equality of internal states [45].

Independence of two context-mediated iterators (Definition 30) turns on their keys alone:

Theorem 47. Let 𝑖1 ∈ℑ𝒜︀

Σ(𝑆1, 𝑃1) and 𝑖2 ∈ℑ𝒜︀

Σ(𝑆2, 𝑃2) with 𝑃1 ∩𝑆2 = 𝑃2 ∩𝑆1 = ⌀, and let every key at which operations of both occur be commutative (Definition 44). Then 𝑖1 and 𝑖2 are independent (Definition 42).

Proof. Every iterator reach(𝑖𝑙) contains is the unit or a stage, whose forward map and yielded inverses are the constituents of the operation or the set its head performs, so the generators of 𝔐(𝑖𝑙) are among those of the stages occurring in 𝑖𝑙, together with idΣ.

For clause (1) of Definition 42 it is enough, by Lemma 41(1), that those generators commute pairwise. Each is key-local: defined by the binding at one key alone, presence included, and writing that binding alone, being the lift of an operation’s forward map or of an inverse it yields (Definition 29), the extension a provision stage takes, or the restriction it yields (Definition 20). Two key-local maps at distinct keys commute, each leaving what the other reads and writes as it stands. This settles every pair involving a provision-stage generator, whose key lies in one 𝑃𝑙 and hence outside the other member’s every key by hypothesis, and every pair of operation generators at distinct keys, which is Theorem 45; a pair of operation generators at one key is covered by that key’s commutativity.

For clause (2), take 𝑖′ ∈reach(𝑖1), 𝑔∈𝔐(𝑖2), and 𝜎∈Σ. The unit yields (idΣ, 𝖭𝗈𝗍𝗁𝗂𝗇𝗀) every­ where. A provision stage at 𝑘∈𝑃1 yields the restriction at 𝑘 and its one continuation whatever the state, and is defined at 𝜎 and 𝑔(𝜎) alike, its precondition reading the presence of 𝑘, which every generator of 𝔐(𝑖2) leaves as it stands. An operation stage at 𝑘∈𝑆1 yields what 𝑎Σ(𝑥) yields at 𝜎(𝑘), inverse and outcome; where no operation of 𝑖2 occurs at 𝑘 the generators of 𝔐(𝑖2) leave 𝜎(𝑘) as it stands, and where one does the key is commutative by hypothesis, and independence of its operations, applied to one generator of 𝑔 at a time, yields the same inverse and the same outcome at 𝑔(𝜎). Equal outcomes select one continuation, so the yields agree. □

With every coeffect witnessed, the commutativity hypothesis of Theorem 47 is supplied at every key (Definition 46), and only the disjointness 𝑃1 ∩𝑆2 = 𝑃2 ∩𝑆1 = ⌀ remains to be checked of a pair; Section 4 reads that disjointness off the two components’ declarations.

A component’s effect function is the lift of a context-mediated iterator along the coeffect projection (Definition 56), and independence transfers to that lift, whose transformations move the projection alone. The assumption Section 3.4.1 leaves open is met that way, the witness of each coeffect supplying the commutativity Theorem 47 consumes, and with it the temporal composability of a whole system of components.

What the decomposition divides is a computation’s commuting part from its order-sensitive part. The commuting part is carried by the effects: a component performs them in whatever order its task calls for, and Theorem 43 reverts them in whatever order the system finds conve­ nient, no two components constraining each other. The order-sensitive part is carried by the coeffects, since a key whose operations do not commute is one whose order has to be imposed from outside the effects, and two places are available for imposing it. Within one component the accumulator imposes it, reverting in LIFO order whatever the effects (Theorem 16). Across components a declared coeffect imposes it, one component providing what another declares and the provision preceding the declaration’s satisfaction (Section 3.2.2). Composability is

30

两个经上下文介导的迭代器（定义 30）是否独立，只取决于它们所用的键。

定理 47：设 i1∈ℑ𝒜Σ(S1,P1)、i2∈ℑ𝒜Σ(S2,P2)，且 P1∩S2=P2∩S1=∅；若两者共同操作的每个键都具有交换性（定义 44），则 i1 与 i2 独立（定义 42）。

证明要点如下。每个迭代器的 reach 只包含单位元或某个阶段，𝔐(il) 的生成元因此来自其中各阶段，再加 idΣ。对于定义 42 的第（1）项，由引理 41(1)，只需证明生成元两两交换。每个生成元都是键局部的：只读取一个键的绑定（包括是否存在），也只写该绑定。不同键上的局部映射显然交换；提供阶段的键由集合不交条件覆盖，同键上的操作则由该键的交换性覆盖。对于第（2）项，单位元处处产生相同结果；提供阶段的前置条件只读取键是否存在，而另一迭代器不改变它；操作阶段的逆与结果只由 σ(k) 决定，另一迭代器若不操作 k 就保持它不变，若也操作 k，则由该键上的独立性逐生成元推出在 g(σ) 上产生同一逆与结果。相等结果会选择同一后继，因此产出一致。□

所有协效都得到见证后，定理 47 在每个键所需的交换性假设已由定义 46 提供，只需检查 P1∩S2=P2∩S1=∅；第 4 节可直接从两个组件的声明读出这一点。

组件的效果函数，是把经上下文介导的迭代器沿协效投影提升得到的（定义 56）；独立性也会转移到这种只改变该投影的提升。于是第 3.4.1 节留下的假设得到满足：每个协效的见证提供定理 47 所需的交换性，进而保证整个组件系统的时间可组合性。

这种分解把计算中可交换的部分与顺序敏感的部分分开。可交换部分由效果承载：组件按任务需要的顺序执行效果，而定理 43 允许系统按方便的顺序回退它们，组件之间互不约束。顺序敏感部分由协效承载：键上操作若不可交换，就必须从效果之外施加顺序。组件内部由累加器按后进先出顺序回退效果（定理 16）；组件之间则由声明的协效规定顺序，一个组件提供另一个所声明的内容，提供必须先于声明得到满足（第 3.2.2 节）。因此，可组合性落在组件粒度而非单个效果粒度上，这正是第 4 节采用的尺度。

<!-- page 31 of 92 -->

thereby had at the grain of components rather than of single effects, which is the scale Section 4 works at.

One limit of the theorem is worth naming, and it is the hypothesis this section opened on: binding every shared location at a key is the paradigm’s discipline and not a property of the construction, so a location the system cannot reify as a coeffect lies outside the boundary of Section 6.1 and outside the theorem with it.

4. A Calculus of Dynamic Composition

4. 动态组合演算

This section gives the theory of Section 3 an operational semantics. It decomposes a running system into components, each a triple of a coeffect specification, a provision, and a witnessed effect function. The instantiations of components are fibers, and the calculus supplies the rules that move them: orchestration rules, by which the orchestrator inserts and retires fibers, and lifecycle rules, by which the system activates and deactivates them unprompted. The metathe­ ory then establishes temporal and spatial composability in their global form, the guarantees Section 3 reads of one component holding of every fiber of an arbitrary interleaving.

4.1. Components and Fibers

This section fixes the objects the rules act on: the component; the fiber, an instantiation of a component carrying a lifecycle state of its own; and the registry, which holds the fibers a state carries and from which the coeffect context is read off.

Components. A component is given as a triple, its coeffect side split into what it reads from the environment and what it provides to it.

Definition 48. A component over a context Γ carrying both effects and coeffects (Definition 28) is defined as:

Γ (42)

ℭΓ ≔(𝑑: 𝔇Γ) × (𝑝: 𝔓Γ) × ℑ𝑑∪𝑝

representing a triple (𝑑, 𝑝, 𝑒), where:

• 𝑑: 𝔇Γ is the coeffect specification of Definition 21, declaring the dependencies required from the environment; • 𝑝: 𝔓Γ ≔𝖲𝖾𝗍(𝐾) is the coeffect provision, declaring the coeffect keys the component may provide, and no key outside 𝑝 is one its effect function installs a binding at; • 𝑒: ℑ𝑑∪𝑝 Γ is the witnessed effect function, an effect iterator (Definition 17) witnessed up to ≃𝑑∪𝑝 (Definition 37), defining the effects contributed when the component is active together with the inverses that withdraw them; a plain effect function enters through the embedding of Section 3.1.3. Subscripts are taken on Γ throughout, the coeffect context being one of its projections (Defin­ ition 28), so the 𝔇Σ of Definition 21 is written 𝔇Γ here.

Fibers. One component may be instantiated many times over, and each instantiation is activated and deactivated over time, carrying a lifecycle state of its own. We name such an instantiation a fiber. A fiber records the component that produced it, the fiber it was instantiated under, the coeffects it provides, and where in its lifecycle it stands.

31

该定理有一个必须明确的限制，也就是本节开头的假设：把每个共享位置绑定到某个键，是该范式要求遵守的纪律，并非构造自身自动保证的性质。系统无法具体化为协效的位置，既落在第 6.1 节的边界之外，也落在本定理之外。

4. 动态组合演算

本节为第 3 节理论给出操作语义。运行系统被分解成组件，每个组件由协效规格、提供项和得到见证的效果函数三部分组成。组件的实例称为纤程。演算提供推动纤程的规则：编排规则由编排器插入和退役纤程；生命周期规则则由系统自动激活与停用纤程。元理论随后建立全局形式的时间与空间可组合性，把第 3 节针对单个组件的保证推广到任意交错执行中的所有纤程。

4.1. 组件与纤程

本节确定规则操作的对象：组件；组件的实例纤程，它拥有自己的生命周期状态；以及保存状态中各纤程并据此读出协效上下文的注册表。

组件。组件由一个三元组给出，其协效侧分成从环境读取的内容与向环境提供的内容。

定义 48：在同时承载效果与协效的上下文 Γ（定义 28）上，组件由三元组 (d,p,e) 表示。其中 d 是定义 21 的协效规格，声明环境必须提供的依赖；p 是协效提供集合，声明组件可能提供哪些键，效果函数不得在 p 之外安装绑定；e 是在 d∪p 上得到见证的效果迭代器（定义 17、37），定义组件活动时贡献的效果及撤回它们的逆操作。普通效果函数可通过第 3.1.3 节的嵌入进入该形式。全文下标均取在 Γ 上，协效上下文只是其投影之一（定义 28）。

纤程。同一组件可以实例化多次，每个实例随时间激活和停用，并拥有独立生命周期状态。这样的实例称为纤程。纤程记录产生它的组件、其所属父纤程、它提供的协效，以及当前生命周期位置。

<!-- page 32 of 92 -->

Definition 49. Fix a set 𝔑 of fiber names. A fiber instantiating the component (𝑑, 𝑝, 𝑒) ∈ℭΓ is a tuple ⟨𝑑, 𝑝, 𝑒, 𝜋, 𝜎, 𝜏, 𝜃⟩, where

• 𝑑: 𝔇Γ, 𝑝: 𝔓Γ, and 𝑒: ℑ𝑑∪𝑝 Γ are the coeffect specification, provision, and effect function of Definition 48; • 𝜋: 𝔑∪{𝗋𝗈𝗈𝗍} is the parent, the fiber this one was instantiated under, or the root marker 𝗋𝗈𝗈𝗍; • 𝜎: Σ is the fiber’s own coeffect table (Definition 19), empty until it activates and written by its effects as they run; • 𝜏: {⊥, ⊤} is the retirement flag, ⊥ in a fresh fiber and ⊤ once the orchestrator has retired the fiber; • 𝜃: ΘΓ is the lifecycle state: ΘΓ ≔𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾| 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) | 𝖠𝖼𝗍𝗂𝗏𝖾(𝑔, 𝜔) | 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔, 𝜔) (43) where 𝑖: ℑ𝑑∪𝑝

Γ is the remaining effect iterator, 𝑔: Γ →Γ the accumulator built so far, and 𝜔: 𝑑→𝔑 the committed view. A fiber is installed when its lifecycle state carries an accumulator and a committed view:

installed𝑛(𝛾) ≔𝜃𝑛≠𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 (44)

and an installed fiber resolves 𝑘 to 𝑚 when 𝜔𝑛(𝑘) = 𝑚.

A transition is what moves a fiber from one lifecycle state to another, and between transitions the fiber rests at one of the two settled states, 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 or 𝖠𝖼𝗍𝗂𝗏𝖾, contributing nothing at the first and its effects at the second. A transition runs in one of two directions: an activation executes 𝑒, accumulating side effects on the context, and a deactivation applies the accumulator to recover the context. A transition in a real runtime is spread over an interval rather than taken in one step, so each direction has a state of its own that the fiber occupies while the transition runs, 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 for an activation and 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 for a deactivation. The committed view 𝜔 sends each key the fiber declares to the name of the fiber that provided it when the transition committed. Section 4.2 draws the four states as a state machine (Figure 1) and supplies the rules on its edges.

Registry. A state holds its fibers under their names, and both the identity of a fiber and the coeffect context of Section 3.2 are read off that arrangement.

Definition 50. Write 𝔉Γ for the set of fibers over Γ. A state 𝛾∈Γ carries a registry

𝐹𝛾: 𝔑⇀𝔉Γ (45)

a finite partial function whose parent pointers form a tree rooted at 𝗋𝗈𝗈𝗍, together with whatever else in Γ no fiber’s 𝜎 names. We write 𝛾(𝑛) for 𝐹𝛾(𝑛), and abbreviate a field of 𝛾(𝑛) by subscripting it with 𝑛 where the state is clear, so that 𝑑𝑛, 𝑝𝑛, 𝑒𝑛, 𝜋𝑛, 𝜎𝑛, 𝜏𝑛, 𝜃𝑛 are the fields of Definition 49 and 𝑔𝑛, 𝜔𝑛 the accumulator and committed view that 𝜃𝑛 carries; 𝛾[𝜃𝑛↦𝜃′], 𝛾[𝑛↦ ⟨⋯⟩], and 𝛾∖𝑛 are the states differing from 𝛾 in one field, one fiber, and the presence of one fiber respectively.

A fiber’s name is what gives it an identity that survives its own mutation: every rule below rewrites the lifecycle state of one fiber and leaves the others alone, so the rule has to say which one, and two fields refer to fibers rather than describe them, the parent 𝜋 and the committed view 𝜔. Names are atoms: no rule computes one, inspects its structure, or relates two of them by anything but equality, and introducing a fiber simply draws one not already in use. This is the discipline of dynamically created local names [40], used here for fiber identity.

32

定义 49：固定纤程名集合 𝔑。实例化组件 (d,p,e) 的纤程是元组 ⟨d,p,e,π,σ,τ,θ⟩。其中 d、p、e 分别是协效规格、提供集合和效果函数；π 是父纤程名或根标记 root；σ 是纤程自己的协效表，激活前为空，运行效果时写入；τ 是退役标志，新纤程为 ⊥，编排器退役后为 ⊤；θ 是生命周期状态，可为 Inactive、Reloading(i,g,ω)、Active(g,ω) 或 Unloading(g,ω)。i 是尚未执行完的效果迭代器，g 是当前累积器，ω 是从依赖键到提供它的纤程名的已提交视图。生命周期状态携带累积器和已提交视图时，该纤程称为已安装；已安装纤程在 ωn(k)=m 时把 k 解析到 m。

转换推动纤程从一个生命周期状态进入另一个状态。转换之间，纤程停留在 Inactive 或 Active 两个稳定状态：前者不贡献任何内容，后者贡献其效果。转换有两个方向：激活执行 e 并在上下文上累积副作用；停用应用累积器恢复上下文。真实运行时中的转换持续一段时间，因此两个方向各有过渡状态：激活期间为 Reloading，停用期间为 Unloading。已提交视图 ω 把纤程声明的每个键映射到转换提交时提供它的纤程名。第 4.2 节用状态机（图 1）展示四个状态，并给出边上的规则。

注册表。状态按名称保存纤程，纤程身份以及第 3.2 节的协效上下文都从这种排列中读出。

定义 50：记 𝔉Γ 为 Γ 上的纤程集合。状态 γ∈Γ 携带有限偏函数注册表 Fγ，其父指针形成以 root 为根的树；此外 Γ 还包含所有不由任何纤程 σ 命名的内容。γ(n) 表示 Fγ(n)，字段可用 n 作下标简写；状态更新、替换纤程与删除纤程也使用相应记法。

纤程名赋予纤程一种能够跨越自身变化而持续的身份：后续每条规则都只改写一个纤程的生命周期状态，并保持其他纤程不变，所以必须明确目标；父指针 π 与已提交视图 ω 也引用纤程而不是描述纤程。名称是原子：规则不计算名称、不检查其结构，也不以相等性之外的关系比较名称；引入纤程只需选取一个尚未使用的名称。这正是动态创建局部名称的纪律 [40]，此处用于纤程身份。

<!-- page 33 of 92 -->

Each fiber owning a table means the coeffect context is derived rather than stored: it is what the active fibers jointly provide.

𝜎𝛾≔⋃{𝜎𝑚| 𝑚∈dom(𝐹𝛾), 𝜃𝑚= 𝖠𝖼𝗍𝗂𝗏𝖾(−, −)} (46)

The union is well defined because a fiber’s own table holds only the keys of its provision, dom(𝜎𝑛) ⊆𝑝𝑛 (Definition 48), and the provisions of distinct fibers are disjoint, O-Insert admit­ ting no fiber whose provision meets an existing one (Section 4.2.1), so each 𝑘∈dom(𝜎𝛾) lies in the table of exactly one 𝖠𝖼𝗍𝗂𝗏𝖾 fiber, whose name we write provider𝑘(𝛾) ∈𝔑 and call the provider of 𝑘. Each key therefore has one possible provider, fixed by the provisions and not by the state. No rule writes a table directly: the bindings a fiber provides are the provision stages its own effect function performs, which land in 𝜎𝑛 and so are already part of the state 𝑒𝑛 returns, and they leave again with the accumulator, and the operations it performs at a declared key act on the value its provider’s table holds (Definition 56). An effect function is built from such stages and from nothing else, so a location no key binds is one no fiber touches.

The disjointness the union rests on is where this chapter parts company with Section 3.2.3, and it simplifies the formalization rather than the systems it models. The isolation of Defin­ ition 24 lets one key resolve through a realm table, so that two fibers may provide the same key in different realms; a calculus carrying realms would relax disjointness to disjointness within a realm, resolving a declared key against the realm of the fiber declaring it (Section 4.4 supplies that reading). We read every key at one shared realm instead, and a system that wants several providers of one key keeps two routes: realms, and the broker of Section 6.2, one fiber providing the key and dispatching among implementations registered with it. Within the calculus, the disjointness restricts how often a component may be instantiated: one with a non- empty provision has one fiber at a time, so the many instantiations below are of components providing nothing, which is the common case of a component that only consumes, or that instantiates others.

With 𝜎𝛾 in hand, the satisfaction relation of Section 3.2.2 applies unchanged, 𝛾⊧𝑑 abbrevi­ ating 𝜎𝛾⊧𝑑. A key lies in dom(𝜎𝛾) exactly when some 𝖠𝖼𝗍𝗂𝗏𝖾 fiber has installed it, its provision being the keys it may install rather than the ones it has, so 𝛾⊧𝑑 already requires that every declared key have an 𝖠𝖼𝗍𝗂𝗏𝖾 provider. Taking the union over 𝖠𝖼𝗍𝗂𝗏𝖾 fibers alone is what lets a fiber cease to provide before it has withdrawn anything, which Section 4.2.2 turns into the ordering discipline, and it fixes how a transition in progress reads: a 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 or 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 fiber reads its coeffects through the 𝜔 it holds and provides none of its own, so a key its transition has already written is not yet one a dependent may activate against.

The two declarations of Definition  48 are the two directions of one interface, 𝑑 what a component reads from the environment and 𝑝 what it writes to it, and the superscript on the effect function’s type holds the witness to that interface. A fiber holds its own bindings whether or not they are published, so the projection the witness is read at is a second reading of the same tables.

Definition 51. Write

𝜎𝑆

𝛾≔⋃{𝜎𝑚|𝑆| 𝑚∈dom(𝐹𝛾)} (47)

for the bindings the registry records at a set 𝑆⊆𝐾 of keys, over every fiber and not the 𝖠𝖼𝗍𝗂𝗏𝖾 ones alone; disjointness of provisions makes it a function, and 𝜎𝛾 is the restriction of 𝜎𝐾

𝛾 to the 𝖠𝖼𝗍𝗂𝗏𝖾 fibers. This is the coeffect projection Definition 33 is read at throughout this section, so that 𝛾≃𝑆𝛿 is 𝜎𝑆

𝛾≃𝜎𝑆

Γ (Definition 37) is the effect functions witnessed at those keys.

𝛿 and ℑ𝑆

33

每个纤程拥有自己的表，因此协效上下文是派生值而非存储值：它由所有活动纤程共同提供。

该并集定义良好，因为纤程表只保存其提供集合中的键（定义 48），不同纤程的提供集合又互不相交；O-Insert 不允许新纤程的提供集合与现有集合相交（第 4.2.1 节）。所以 σγ 中每个键恰好来自一个 Active 纤程，记其名称为 providerk(γ)，称为 k 的提供者。每个键只有一个由提供声明确定、与状态无关的候选提供者。规则不会直接写表：纤程通过自身效果函数中的提供阶段安装绑定，绑定进入 σn，随累加器撤回；声明键上的操作则作用于提供者表中的值（定义 56）。效果函数只由这些阶段构成，因此没有键绑定的位置不会被任何纤程触及。

该并集依赖的不相交性，是本章与第 3.2.3 节不同之处；它简化的是形式化，而非可建模系统。定义 24 的隔离允许同一键经域表解析，使不同域的两个纤程可提供同一键。包含域的演算只需把“不相交”放宽为“域内不相交”，并按声明方所在域解析键（第 4.4 节）。本文把所有键视为处于一个共享域；需要同键多个提供者的系统可使用域，或使用第 6.2 节的代理：由一个纤程提供键，再分派到向它注册的多个实现。在当前演算中，这限制了组件实例化次数：提供集合非空的组件同时只能有一个纤程；可多次实例化的通常是不提供内容、只消费或继续实例化其他组件的组件。

得到 σγ 后，第 3.2.2 节的满足关系可原样使用。键属于 dom(σγ)，当且仅当某个 Active 纤程已安装它；提供集合表示可能安装的键而非已经安装的键，所以 γ⊧d 已要求每个声明键都有 Active 提供者。只合并 Active 纤程，使纤程能在尚未撤回任何内容前先停止“对外提供”，第 4.2.2 节据此建立顺序纪律。这也规定了过渡中的读取方式：Reloading 或 Unloading 纤程通过所持 ω 读取协效，不提供自身内容；其过渡已写入的键尚不能供依赖方激活。

定义 48 的两个声明是同一接口的两个方向：d 表示从环境读取，p 表示写入环境；效果函数类型的上标保存该接口的见证。无论绑定是否已发布，纤程都持有自身绑定，因此见证所读取的投影是对相同表的另一种观察。

定义 51：σSγ 表示注册表在键集合 S 上记录的绑定，合并所有纤程而非仅 Active 纤程；提供集合不相交保证它仍是函数。它是本节解释定义 33 时使用的协效投影，因此 γ≃Sδ 表示这些投影等价，ℑSΓ 表示在这些键上得到见证的效果函数。

<!-- page 34 of 92 -->

The keys of both declarations are read off the tables rather than off 𝜎𝛾, and the witness condition is why: a binding a transition has written stays in the fiber’s table before the fiber is 𝖠𝖼𝗍𝗂𝗏𝖾, and that binding is what the inverse is held to remove, so the projection the witness is read at has to hold it wherever the fiber’s lifecycle stands. The same reading keeps the relation where the control fields cannot move it: a write to a lifecycle state can move a table into or out of 𝜎𝛾 with every binding left as it stands, whereas 𝜎𝑆

𝛾 moves only where some binding does. What the witness is thereby held to restore is the two declarations and nothing else.

4.2. The Calculus

This section gives the calculus: nine rules generating two relations. An orchestration rule, prefixed O- and written 𝛾⇒𝛿, is an action the orchestrator may perform; its premises say when the action is legal, not when it occurs. A lifecycle rule, prefixed L- and written 𝛾⟶𝛿, is a step the system takes unprompted whenever its premises hold. A sequence of steps interleaves the two. Eight of the nine lie on the edges of Figure 1; O-Retire writes the retirement flag alone and applies at every lifecycle state, so it would be a self-loop at each of the four nodes, and the figure omits it.

L-Iter

L-Begin L-Finish

𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀

O-Insert

L-Divert 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 𝖠𝖼𝗍𝗂𝗏𝖾

O-Remove

L-Leave L-Unload

𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀

Figure 1 | The component lifecycle, with the empty node marking a fiber absent from the registry

4.2.1. Orchestration

Insertion and retirement are the only external inputs: the orchestrator requests that a fiber exist or stop existing, and never sets its lifecycle state directly.

O-Insert

𝑛∉dom(𝐹𝛾) 𝜋∈dom(𝐹𝛾) ∪{𝗋𝗈𝗈𝗍} (𝑑, 𝑝, 𝑒) ∈ℭΓ ∀𝑚∈dom(𝐹𝛾). 𝑝∩𝑝𝑚= ⌀ 𝛾⇒𝛾[𝑛↦⟨𝑑, 𝑝, 𝑒, 𝜋, ⌀, ⊥, 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾⟩]

O-Retire

𝑛∈dom(𝐹𝛾) 𝛾⇒𝛾[𝜏𝑛↦⊤]

O-Remove

𝜏𝑛= ⊤ 𝜃𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 𝜎𝑛= ⌀ ∀𝑚. 𝜋𝑚≠𝑛 𝛾⇒𝛾∖𝑛

O-Retire is unconditional on the fiber’s state because retiring is a request, and the lifecycle rules are what carry it out. Retirement is separated from removal for the same reason: a retired fiber that is still 𝖠𝖼𝗍𝗂𝗏𝖾 must first be deactivated, and removing it earlier would discard the accumulator and leak. The premise ∀𝑚. 𝜋𝑚≠𝑛 keeps the tree well-formed by removing children before their parent, and 𝜎𝑛= ⌀ admits only an entry holding no bindings, so that a removal discards none: a deactivation leaves the entry so (Corollary 69), and it is what lets Theorem 68 count a removal as no change to the tables. The last premise of O-Insert is where the

34

两个声明的键从所有表读取，而不只从 σγ 读取，原因在于见证条件：过渡写入的绑定在纤程进入 Active 前已经留在自身表中，而逆操作必须移除的正是它，所以无论生命周期处于何处，见证投影都必须包含它。这种读取也避免控制字段影响等价关系：生命周期字段变化可能在不改变任何绑定的情况下让整张表进出 σγ，而 σSγ 只随绑定本身变化。见证被要求恢复的恰是两个声明，不包括其他内容。

4.2. 演算

本节给出九条规则，生成两种关系。以 O- 开头、写作 γ⇒δ 的编排规则，是编排器可以执行的动作；前提只说明动作何时合法，不规定何时发生。以 L- 开头、写作 γ⟶δ 的生命周期规则，只要前提成立，系统就会自动执行。步骤序列可交错两类规则。九条中有八条位于图 1 的边上；O-Retire 只写退役标志，可作用于任意生命周期状态，相当于四个节点各自的自环，图中省略。

4.2.1. 编排

插入与退役是仅有的外部输入：编排器请求纤程存在或停止存在，从不直接设置其生命周期状态。

O-Retire 不受纤程状态限制，因为退役只是请求，真正执行由生命周期规则负责。退役与移除分离也是同一原因：仍处于 Active 的退役纤程必须先停用，提前移除会丢弃累加器并造成泄漏。O-Remove 要求先移除子纤程以保持树结构，并要求 σn 为空，确保移除不会丢弃绑定；停用会把表清空（推论 69），这也让定理 68 可把移除视作表不变。O-Insert 的末个前提施加单一来源纪律：编排器不得接纳声明同一键的第二个组件。

<!-- page 35 of 92 -->

single-source discipline is imposed: a key has one possible provider because the orchestrator may not admit a second component declaring it.

Instantiation. A component may instantiate another while installing its effects, which is what a plugin host does when a plugin loads plugins of its own. The rules so far leave the registry to the orchestration rules alone, so such an instantiation has nowhere to happen. One primitive gives it somewhere.

Definition 52. An iteration of 𝑒𝑛 may instantiate a component (𝑑, 𝑝, 𝑒) ∈ℭΓ. In place of a state map it takes the O-Insert of that component with 𝜋= 𝑛, and it yields as its inverse the O-Retire of the fiber so instantiated. The rule draws the name, subject to the freshness premise of O- Insert, and hands it to the effect function.

The inverse retires rather than removes, and the reason is that an inverse has to apply wherever it is reached. O-Remove carries premises, so an inverse built from it can fail to: a parent whose child is still 𝖠𝖼𝗍𝗂𝗏𝖾 could not run its accumulator, and no rule would move the child, since Definition 53 does not read the fiber tree. O-Retire has 𝑛∈dom(𝐹𝛾) as its only premise. The entry it leaves behind at the state the instantiation was taken is retired, 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾, and holds an empty table, which is the vestigial entry of Lemma 62: it differs from the absence of the fiber in control fields alone, and no rule tells the two apart.

Retiring a child sets 𝜏 and so takes its target view to ⊥, after which the ordinary rules carry it back to 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾. The parent is not made to wait, O-Retire being unconditional, so L-Unload applies to the parent whether or not the child has left. A grandchild is reached one level at a time, the child’s own accumulator retiring what the child instantiated. Theorem 73 covers this cascade and the one the guard of Section 4.2.2 imposes along coeffects together.

4.2.2. Lifecycle

The six lifecycle rules divide by the direction they move a fiber in: an activation carries a fiber toward a target view it does not yet hold, and a deactivation carries one away from a committed view that is no longer its target.

Target views. The rules compare each fiber against a target, namely whether it ought to be running and against which resolution of its dependencies. The target is not a property of the fiber alone, since the keys a fiber declares are resolved against the whole state, so it is a predicate on that state.

Definition 53. The target view of 𝑛 at 𝛾 maps each declared key to its provider, so it is a total map 𝑑𝑛→𝔑, and is ⊥ when 𝑛 ought not to be running at all:

target𝑛(𝛾) ≔{⊥ if 𝜏𝑛∨¬(𝛾⊧𝑑𝑛) (𝑘∈𝑑𝑛) ↦provider𝑘(𝛾) otherwise (48)

A state is quiescent when every fiber has settled at its target view, no transition left in progress:

(49)

quiet(𝛾) ≔∀𝑛∈dom(𝐹𝛾).

target𝑛(𝛾) = ⊥ if 𝜃𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 target𝑛(𝛾) = 𝜔𝑛 if 𝜃𝑛= 𝖠𝖼𝗍𝗂𝗏𝖾(−, 𝜔𝑛) ⊥ otherwise

{

35

实例化。组件在安装效果时可以实例化另一个组件，就像插件宿主在插件加载其子插件时所做的那样。此前规则只允许编排规则修改注册表，所以需要一个原语容纳这种实例化。

定义 52：en 的一次迭代可以实例化组件 (d,p,e)。它不采用普通状态映射，而执行以 π=n 插入该组件的 O-Insert，并把新纤程的 O-Retire 作为逆操作返回。规则在满足 O-Insert 新鲜性前提下选取名称，并把名称交给效果函数。

逆操作选择退役而非移除，因为逆必须在执行抵达的任何状态下都可应用。O-Remove 有额外前提，可能失败：若父纤程的子纤程仍 Active，父纤程的累加器就无法运行，而定义 53 又不读取纤程树，因而没有规则会推动子纤程。O-Retire 只要求纤程仍在注册表中。它在实例化发生时留下的条目已退役、Inactive 且表为空，即引理 62 的残余条目：与纤程不存在相比只差控制字段，没有规则能区分二者。

退役子纤程会设置 τ，使目标视图变为 ⊥，随后普通规则把它带回 Inactive。父纤程无需等待，因为 O-Retire 无条件，所以无论子纤程是否离开，L-Unload 都可用于父纤程。孙纤程逐层处理，由子纤程自身累加器退役它实例化的内容。定理 73 同时覆盖这条级联，以及第 4.2.2 节守卫沿协效产生的级联。

4.2.2. 生命周期

六条生命周期规则按移动方向分组：激活把纤程带向尚未持有的目标视图，停用则让它离开已不再是目标的已提交视图。

目标视图。规则把每个纤程与目标比较：它是否应该运行，以及应针对哪种依赖解析运行。目标不是纤程自身属性，因为声明键要针对整个状态解析，所以它是状态上的谓词。

定义 53：n 在 γ 中的目标视图把每个声明键映射到其提供者，是从 dn 到 𝔑 的全映射；若 n 根本不应运行，则为 ⊥。状态在所有纤程都稳定于目标视图、没有过渡进行时称为静止。

<!-- page 36 of 92 -->

The target answers to two things and to nothing else: retirement, through 𝜏𝑛, and coeffect resolution, through 𝛾⊧𝑑𝑛 and provider𝑘, each declared key being read off 𝜎𝛾 at the one shared realm of Section 4.1.

The committed view of Definition 49 has the same type as the target view, and the lifecycle is driven by comparing them: 𝜔𝑛 is the resolution 𝑛 activated against, target𝑛(𝛾) the one it should be running against, and every rule below fires on their agreeing or differing. This is the reactive discipline of Section 3.2: a transition is initiated whenever the target view changes, regardless of which of the two moved it. Recording a provider rather than a value is what makes the comparison usable, since a different fiber providing an equal value would otherwise compare equal. The value a component reads is reached through the view, since the provider’s table holds that value, and the implementation holds the map in fiber.committed and a hash of it in

fiber.target (Section 5.1.3).

Activation. An activation may execute multiple effects in sequence, and the deactivation must revert them. The effect iterator 𝑒𝑛 models such an activation (Section 3.1.3), each of its iterations yielding the modified context, an inverse, and a continuation, and a component’s whole activation is one run of 𝑒𝑛: L-Begin enters 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀, L-Iter takes one iteration, and L- Finish lands the last.

L-Begin

𝜃𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 𝜔= target𝑛(𝛾) ≠⊥ 𝛾⟶𝛾[𝜃𝑛↦𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑒𝑛, idΓ, 𝜔)]

L-Iter

𝜃𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) target𝑛(𝛾) = 𝜔 𝑖(𝛾) = (𝛿, ℎ, 𝖩𝗎𝗌𝗍(𝑖′)) 𝛾⟶𝛿[𝜃𝑛↦𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖′, 𝑔∘ℎ, 𝜔)]

L-Finish

𝜃𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) target𝑛(𝛾) = 𝜔 𝑖(𝛾) = (𝛿, ℎ, 𝖭𝗈𝗍𝗁𝗂𝗇𝗀) 𝛾⟶𝛿[𝜃𝑛↦𝖠𝖼𝗍𝗂𝗏𝖾(𝑔∘ℎ, 𝜔)]

Each iteration composes the newly yielded inverse onto the accumulator as 𝑔∘ℎ, following Definition 18, so that the accumulator applies the inverses in last-in-first-out order.

Deactivation. A deactivation enters from either stage of the lifecycle: L-Divert takes out a fiber whose transition is still in progress, and L-Leave one that is 𝖠𝖼𝗍𝗂𝗏𝖾. It cannot be taken in one step. A component being torn down because its provider is going away is running its own teardown code, which may need the very coeffect that is being withdrawn; closing a connection pool typically means handing the connections back to whatever provided them. The consumer must therefore still be able to read the key throughout its own deactivation, and the provider’s withdrawal must take effect only afterwards, which gives content to the ordering Section 3.2 requires of dependencies and dependents. A deactivation taken in one step would remove the provisions and run the inverse together, with no interval between them for a consumer’s teardown to occupy. The rules below therefore separate the decision from the act, and the act is guarded by the following condition.

Definition 54. The fiber 𝑛 is relied upon at 𝛾 when some other installed fiber resolves a key to it:

relied𝑛(𝛾) ≔∃𝑚∈dom(𝐹𝛾), 𝑘∈𝑑𝑚. 𝑚≠𝑛∧installed𝑚(𝛾) ∧𝜔𝑚(𝑘) = 𝑛 (50)

36

目标只取决于两件事：通过 τn 表示的退役状态，以及通过 γ⊧dn 和 providerk 表示的协效解析；每个声明键都从第 4.1 节单一共享域中的 σγ 读取。

定义 49 的已提交视图与目标视图类型相同，生命周期由比较二者驱动：ωn 是 n 激活时采用的解析，targetn(γ) 是当前应采用的解析，后续规则都依据二者相等或不同触发。这正是第 3.2 节的反应式纪律：无论由何种变化引起，只要目标视图变化就启动转换。记录提供者而非值，使不同纤程提供相等值时也能检测变化。组件通过视图抵达值，因为值保存在提供者表中；实现把该映射保存在 fiber.committed，并把其哈希保存在 fiber.target（第 5.1.3 节）。

激活。一次激活可顺序执行多个效果，停用必须将其全部回退。效果迭代器 en 建模整个激活（第 3.1.3 节），每次迭代产生修改后的上下文、一个逆操作和后继。L-Begin 进入 Reloading，L-Iter 执行一步，L-Finish 完成收尾步骤并进入 Active。每次迭代按 g∘h 把新逆操作组合进累加器，遵循定义 18，使累加器按后进先出顺序应用逆操作。

停用。停用可从生命周期两个阶段进入：L-Divert 中止仍在进行的转换，L-Leave 离开 Active，但停用不能一步完成。若组件因提供者即将离开而拆卸，它的拆卸代码可能仍需使用正在撤回的协效；例如关闭连接池通常要把连接交还给提供它们的对象。因此，消费者在自身停用全过程中必须仍能读取该键，提供者只能在此后撤回。这赋予第 3.2 节要求的依赖顺序以实际含义。若停用一步完成，提供项移除与逆操作执行之间没有可供消费者拆卸占据的区间。所以下述规则把决定与执行分开，并用一个条件守卫执行。

定义 54：若另一个已安装纤程的已提交视图把某个声明键解析到 n，则称 n 在 γ 中正被依赖。

<!-- page 37 of 92 -->

L-Divert

𝜃𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) target𝑛(𝛾) ≠𝜔 (𝛿, ℎ) = (𝛾, idΓ) ∨𝑖(𝛾) = (𝛿, ℎ, −) 𝛾⟶𝛿[𝜃𝑛↦𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔∘ℎ, 𝜔)]

L-Leave

𝜃𝑛= 𝖠𝖼𝗍𝗂𝗏𝖾(𝑔, 𝜔) target𝑛(𝛾) ≠𝜔 𝛾⟶𝛾[𝜃𝑛↦𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔, 𝜔)]

L-Unload

𝜃𝑛= 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔, 𝜔) ¬ relied𝑛(𝛾) 𝑔(𝛾) = 𝛿 𝛾⟶𝛿[𝜃𝑛↦𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾]

L-Divert may fall between any two consecutive iterations of a transition, routing the fiber into 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 with the inverses accumulated so far rather than applying them on the spot. Routing through 𝖠𝖼𝗍𝗂𝗏𝖾 instead would let the fiber provide its coeffects for the length of one step and oblige its dependents to activate against a component that is already leaving. The first of L-Divert’s two alternatives aborts the iteration the fiber is holding, which only an iteration boundary makes possible, so the granularity at which a divert may fall is that of the iterator; the second lets that iteration land, serving the host Section 4.4 admits, in which an iteration in flight cannot be declined.

L-Leave records the decision to deactivate without acting on it, which stops the fiber providing its coeffects while leaving its own committed view and everyone else’s intact. L- Unload applies the accumulator, discards the committed view, and leaves the fiber 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾; it is the only rule in the calculus that applies an accumulator, an L-Divert routing here rather than applying one of its own.

The two requirements are then carried by different parts of the form: the consumer’s reading by the committed view, which L-Unload discards as its last act, and the deferral of the withdrawal by the premise ¬ relied𝑛(𝛾), which we call the guard and which holds a provider’s withdrawal back until every consumer that resolves a key to 𝑛 has gone. For a fiber L-Divert takes out of its first transition the guard is vacuous, a fiber that has never been 𝖠𝖼𝗍𝗂𝗏𝖾 providing nothing and appearing in no committed view. Theorem 70 establishes both requirements.

The guard is imposed per binding rather than per fiber: relied𝑛(𝛾) tests whether some committed view names 𝑛, so a fiber that declares none of 𝑛’s keys is no obstacle, and neither is one that resolved a key of 𝑛’s in another realm (Section 3.2.3). Under the single-source discipline of O-Insert the per-binding reading coincides with the coarser test ∃𝑚≠𝑛, 𝑘∈ 𝑑𝑚. installed𝑚(𝛾) ∧𝑘∈𝑝𝑛, a key having one possible provider there.

A guard of this kind ordinarily deadlocks. What keeps it from doing so is 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 together with 𝜎𝛾 being the union over 𝖠𝖼𝗍𝗂𝗏𝖾 fibers alone: once L-Leave or L-Divert has marked 𝑛, its table leaves 𝜎𝛾, so no target view can name 𝑛 any longer, and every consumer that committed to 𝑛 is itself on its way out. Theorem 73 turns that into the claim that the guard always releases.

The guard orders deactivations along coeffects and not along the fiber tree: a parent may run its inverse while a child of it is still 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀, since relied speaks only of committed views. Parent and child are accordingly ordered more weakly than Theorem 70 orders a provider and its consumer, and a parent and a child whose effects meet at a shared key are governed by the pairwise independence of Lemma 66 instead.

The rules are nondeterministic: several fibers may hold a committed view differing from their target view, and the relation commits to no order among them. They are also reactive only, in that no rule mentions a scheduler; the steps are any sequence of rule applications, so a theorem proved over all such sequences holds for every scheduling policy a runtime might adopt.

37

L-Divert 可落在转换的任意两次相邻迭代之间，把纤程连同当前已累积的逆操作导向 Unloading，而不是立即应用逆操作。若经 Active 绕行，纤程会短暂提供协效，迫使依赖方针对一个已在离开的组件激活。L-Divert 的第一种选择中止当前迭代，因此只能在迭代边界转向；第二种选择允许该迭代落地，以适应第 4.4 节允许的、进行中迭代无法拒绝的宿主。

L-Leave 只记录停用决定而暂不执行，使纤程停止提供协效，同时保留自身已提交视图及其他纤程的视图。L-Unload 应用累加器、丢弃已提交视图并进入 Inactive；它是演算中唯一应用累加器的规则，L-Divert 只负责导向这里。

两个要求由不同结构承担：消费者持续读取依赖由已提交视图保证，L-Unload 最终才丢弃它；提供者延后撤回由 ¬reliedn(γ) 前提保证，该守卫会等待所有把键解析到 n 的消费者离开。首次激活尚未完成就被 L-Divert 导出的纤程从未提供内容，也未出现在已提交视图中，所以守卫自然满足。定理 70 证明两项要求。

守卫按绑定而非按整条纤程判断：reliedn(γ) 检查是否有已提交视图指向 n；未声明 n 的键的纤程不会阻塞，在其他域解析同键的纤程也不会阻塞。O-Insert 的单一来源纪律下，这与检查已安装纤程是否声明 pn 中的键等价。

这种守卫通常会死锁。避免死锁的是 Unloading 状态，以及 σγ 只合并 Active 纤程：L-Leave 或 L-Divert 标记 n 后，其表立即离开 σγ，新的目标视图不再能指向 n，所有已提交到 n 的消费者也会开始离开。定理 73 证明守卫最终总会释放。

守卫沿协效而非父子树安排停用顺序；父纤程可在子纤程仍 Unloading 时执行逆操作。父子间的顺序弱于提供者与消费者间的顺序；若它们的效果在共享键相遇，则由引理 66 的成对独立性治理。

规则是非确定的：多个纤程的已提交视图可能同时偏离目标，关系不规定处理顺序。规则也只描述反应性，不指定调度器；因此对所有步骤序列成立的定理，对运行时采用的任意调度策略都成立。

<!-- page 38 of 92 -->

4.2.3. Confinement

With instantiation the one exception in hand, the discipline an effect function is held to can be given. It bounds what an application of an iteration writes, so that the rule applying it accounts for every other change, and what it reads, so that a fiber sees the coeffects it declared and no more of the registry. Bounding the writes is what lets Section 4.3 read Table 1 as a complete inventory of them.

Definition 55. A map 𝑓: Γ →Γ is confined to 𝑛 when for every 𝛾∈Γ with 𝑛∈dom(𝐹𝛾), writing 𝛿= 𝑓(𝛾),

1. (Writes.) dom(𝐹𝛿) = dom(𝐹𝛾), 𝛿(𝑚) and 𝛾(𝑚) differ at most in 𝜎𝑚|𝑑𝑛 for every 𝑚∈ dom(𝐹𝛾) with 𝑚≠𝑛, and 𝛿(𝑛) and 𝛾(𝑛) differ in 𝜎 alone; 2. (Reads.) two states agreeing on 𝜎𝑛 and on the restrictions 𝜎𝑚|𝑑𝑛 for every 𝑚∈dom(𝐹𝛾) are carried by 𝑓 to states agreeing on the same two. An effect function 𝑒 is confined to 𝑛 when every iterator 𝑖∈reach(𝑒) either instantiates a compo­ nent (Definition 52) or has both its state map pr1 ∘𝑖 and every inverse it yields confined to 𝑛.

An instantiation writes the entry O-Insert writes, at the one name it draws, and nothing else; the O-Retire it yields as its inverse writes the 𝜏 of that name and nothing else. An application of either kind therefore writes no control field of a fiber already present, save that one 𝜏, and reads none at all.

Clause (1) permits a write outside the fiber’s own table, and there is exactly one kind: the value at a declared key lives in the provider’s table, so a component operating on a coeffect it declared moves 𝜎𝑚|𝑑𝑛 for the 𝑚 providing it. Clause (2) is why a component may read the values it declared as well: an effect function that reads no table but 𝜎𝑛 would be unable to use its own coeffects. What it may neither read nor write is a table outside the two declarations, any control field, or anything no table holds, which is what keeps a component from branching on the lifecycle state of a fiber it did not declare.

The context paradigm fixes the form of an effect function — a sequence of stages, each a coeffect operation, a provision, or an instantiation — and confinement is a consequence of that form.

Definition 56. A stage of Definition 30 lifts along the coeffect projection: it acts on the one table that holds the binding at its key, over every fiber and not the 𝖠𝖼𝗍𝗂𝗏𝖾 ones alone as Definition 51 reads the tables, an extension landing in the table of the fiber acting, and it leaves the rest of the state as it stands. The context-mediated iterators for 𝑛 form the least set ℑ𝒜︀

Γ (𝑛) of iterators on Γ that contains the unit and, each continuation drawn from 𝖭𝗈𝗍𝗁𝗂𝗇𝗀 and the members, contains three iteration forms: the lift of an operation stage at a key of 𝑑𝑛∪𝑝𝑛, the lift of a provision stage at a key of 𝑝𝑛, and an instantiation (Definition 52). Every fiber’s effect function is required to lie in ℑ𝒜︀

Γ (𝑛) at that fiber.

Lemma 57. A member of ℑ𝒜︀

Γ (𝑛) is confined to 𝑛, and it lies in ℑ𝑑𝑛∪𝑝𝑛

Γ (Definition 37) at the projection Definition 51 fixes, which is the witness Definition 48 requires of it.

Proof. For confinement, by induction on the construction. An instantiation is the exception Definition 55 carves out. The lift of a stage at 𝑘 writes the binding at 𝑘 and nothing else: at 𝑘∈ 𝑝𝑛 that binding lies in 𝜎𝑛, by disjointness of provisions, and at 𝑘∈𝑑𝑛 it lies in some 𝜎𝑚|𝑑𝑛, which is clause (1); the inverse it yields, the lift of the operation’s inverse or the restriction at 𝑘∈𝑝𝑛, writes the same binding or removes it from 𝜎𝑛. For clause (2), a stage reads the binding

38

4.2.3. 限域

除实例化这一例外外，现在可以明确效果函数必须遵守的纪律。它限制一次迭代可写什么，使应用该迭代的规则能完整解释其余变化；也限制可读内容，使纤程只能看到自己声明的协效。写边界使第 4.3 节能够把表 1 当作完整写入清单。

定义 55：映射 f 在只改变 n 自身的 σ，以及其他纤程中属于 dn 的表值，并且其读取也只依赖这些部分时，称其限域于 n。效果函数 e 若 reach(e) 中每个迭代器要么执行定义 52 的实例化，要么其状态映射及产生的每个逆操作都限域于 n，则 e 限域于 n。

实例化只写 O-Insert 新增的条目，逆操作 O-Retire 也只写该名称的 τ；二者不写已有纤程的其他控制字段，也不读取控制字段。

第（1）项允许写自身表之外的一类位置：声明键的值保存在提供者表中，组件操作协效会改变提供者的 σm|dn。第（2）项同样允许组件读取声明值；若只能读 σn，它就无法使用自身协效。它不能读写两个声明之外的表、任何控制字段或表外位置，因此组件不能根据未声明纤程的生命周期分支。

上下文范式把效果函数限定为由协效操作、提供或实例化阶段组成的序列，限域由此自然推出。

定义 56：定义 30 的阶段沿协效投影提升，作用于保存目标键绑定的那张表；提供扩展写入执行纤程的表，其余状态不变。n 的上下文介导迭代器由单位元、dn∪pn 上的操作阶段、pn 上的提供阶段和实例化组成；每个纤程的效果函数都必须属于该集合。

引理 57：该集合中的成员都限域于 n，并在定义 51 的投影上属于得到见证的效果函数集合，满足定义 48 的要求。证明按构造归纳：阶段只写目标键，逆操作也只写或删除同一绑定；读取只依赖 σn 与声明依赖所在的表。引理 39 的归纳逐阶段提升到 Γ；实例化只增加空表条目并产生仅写 τ 的逆操作，对相应等价关系不可见。□

<!-- page 39 of 92 -->

at its key and its presence, both determined by 𝜎𝑛 together with the 𝜎𝑚|𝑑𝑛, and writes what it read into the same two parts.

For membership, the induction of Lemma 39 carries over stage by stage: at an operation or provision stage the argument there applies as it stands, the lift moving the tables that jointly carry 𝜎𝑑𝑛∪𝑝𝑛 𝛾 as the stage moves the projection and moving nothing else, so respect and witness at ≃𝑑𝑛∪𝑝𝑛 on Σ read as the same conditions on Γ at the projection of Definition 51; an instan­ tiating iteration adds an entry holding an empty table and yields the O-Retire writing one 𝜏, both invisible to ≃𝑑𝑛∪𝑝𝑛, so its clauses hold outright. □

4.3. Metatheory

This section establishes the metatheory of the calculus: that every rule preserves the well- formedness of the registry (Section 4.3.1); that temporal and spatial composability hold in their global form, one fiber’s guarantee surviving whatever the other fibers do in between (Section 4.3.2, Section 4.3.3); that the system quiesces (Section 4.3.4); and that it quiesces where a load of the same configuration from scratch would have left it (Section 4.3.5).

Every property below is a property of a sequence of steps, so we index the steps and read the fields of a state off that index.

Definition 58. Index the steps by 𝑡, so that 𝛾𝑡 is the state the first 𝑡 of them reach, and write

step𝑡≔𝑟(𝑛) (51)

for the step taken at 𝛾𝑡: the rule 𝑟 it applies, one of the nine, and the name 𝑛∈𝔑 it applies that rule at. The sequence starts at a 𝛾0 with dom(𝐹0) = ⌀, so every fiber comes into existence by an O-Insert, whether the orchestrator’s or one an iteration takes (Definition 52). A field of 𝛾𝑡 carries the index as a superscript, so that 𝜃𝑡

𝑛, 𝜔𝑡

𝑛, 𝜎𝑡

𝑛, 𝑔𝑡

𝑛, and 𝑖𝑡

𝑛 are the lifecycle state, committed view, table, accumulator, and remaining iterator of 𝑛 at 𝛾𝑡, and 𝐹𝑡 and 𝜎𝑡 the registry and coeffect context of 𝛾𝑡 itself, the 𝐹𝛾 and 𝜎𝛾 of Definition 50 read there. Predicates take the state as their argument and everything else as a subscript, so installed𝑡

𝑛, target𝑡

𝑛, relied𝑡

𝑛, and quiet𝑡 are the predicates of Definition 49, Definition 53, and Definition 54 at 𝛾𝑡. An episode of 𝑛 is a maximal interval [𝑏, 𝑢] of indices throughout which installed𝑡

𝑛 holds. It opens at 𝑏, where 𝑏> 0 and ¬ installed𝑏−1 𝑛 , the empty 𝐹0 leaving no fiber installed at the outset; it closes at 𝑢 when installed𝑢

𝑛 and not installed𝑢+1

𝑛 , which a final episode need not do.

Every rule of Section 4.2 concludes in the shape 𝛾⟶𝛿[⋯], where the premises compute 𝛿 from 𝛾 and leave it as 𝛾 where they compute nothing, and the bracket edits named fields of the registry. The two halves are named separately, and both are maps on all of Γ. The state map of a step taken at 𝛾𝑡 by a rule acting on 𝑛 is

Ψ𝑡≔

(52)

pr1 ∘𝑖 at L-Iter, L-Finish, and a landing L-Divert 𝑔 at L-Unload idΓ at every other rule

{

where 𝑖 and 𝑔 are the iterator and the accumulator that 𝜃𝑡

𝑛 carries, and the edit edit𝑡: Γ →Γ is the bracket read as a function, assigning to the fields it names the values the premises computed at 𝛾𝑡. Both are therefore fixed by step𝑡 together with 𝛾𝑡 and defined at every state, which is what lets Theorem 68 and Lemma 78 evaluate them away from 𝛾𝑡. Each step factors as

39

4.3. 元理论

本节证明演算的元理论：每条规则保持注册表良构（第 4.3.1 节）；时间与空间可组合性以全局形式成立，一个纤程的保证经得住其他纤程在其间任意行动（第 4.3.2、4.3.3 节）；系统最终静止（第 4.3.4 节）；且静止结果与从头加载同一配置一致（第 4.3.5 节）。

以下性质都针对步骤序列，因此为步骤编号，并按编号读取状态字段。

定义 58：以 t 标记步骤，γt 是前 t 步到达的状态，stept=r(n) 表示在 γt 对名称 n 应用九条规则之一。初始注册表为空，所以每个纤程都由 O-Insert 创建。字段用上标 t 表示该状态下的值。n 的 episode 是 installedn 持续成立的极大索引区间；它从未安装变为已安装处开始，在已安装变为未安装处结束，末个 episode 可以不闭合。

每条规则的结论都可分成两部分：前提从 γ 计算出的状态映射 Ψt，以及随后对注册表命名字段的编辑 editt。Ψt 在 L-Iter、L-Finish 和允许当前迭代落地的 L-Divert 中是迭代状态映射，在 L-Unload 中是累加器，其余规则为恒等映射。于是每一步都分解为 γt+1=editt(Ψt(γt))。两部分也划分字段职责：表只由 Ψt 改变（新条目初始空表除外），控制字段只由 edit 改变（实例化原语除外）。

<!-- page 40 of 92 -->

𝛾𝑡+1 = edit𝑡(Ψ𝑡(𝛾𝑡)) (53)

At L-Unload, for instance, edit𝑡 is [𝜃𝑛↦𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾], and at O-Remove it is the removal ∖𝑛, which is why the second half is an edit rather than an assignment. The fields divide along the same seam: the tables 𝜎𝑚, which no edit𝑡 writes once the O-Insert creating 𝑚 has set it empty, and the control fields 𝜃𝑚, 𝜏𝑚, 𝜋𝑚, 𝑑𝑚, 𝑝𝑚, 𝑒𝑚 together with dom(𝐹𝛾), which no Ψ𝑡 writes save through the primitive of Definition 52.

A rule reads the control fields to decide whether it applies, so the relation two whole states are compared at has to keep them. It is Definition 33 over the registry conjoined with agreement on the registry’s domain and on every control field of every fiber:

𝛾≃𝛿 ≔ 𝜎𝐾

𝛾≃𝜎𝐾

𝛿∧dom(𝐹𝛾) = dom(𝐹𝛿) ∧∀𝑛, 𝑐∈{𝜃, 𝜏, 𝜋, 𝑑, 𝑝, 𝑒}. 𝑐(𝛾(𝑛)) ≃𝑐(𝛿(𝑛))(54)

A field of function type, as 𝑒𝑛 and the 𝑔 inside 𝜃𝑛 are, is compared as Definition 34 compares maps and iterators, and a field of any other type by equality. The results below compare states at the coarser readings Definition 51 gives, ≃𝐾 where every table is in question and ≃𝑑𝑛∪𝑝𝑛 where one fiber’s is, and the three are nested rather than crosswise, ≃ implying ≃𝐾 and ≃𝐾 implying ≃𝑆 at every 𝑆. Lemma 60 establishes the first once for all nine rules.

Table 1 is the nine rules of Section 4.2 read as such writes. The accumulator, the committed view, and the remaining iterator are constituents of 𝜃𝑛, so the third column records the writes to them as well, and ℎ there names the inverse the iteration of the fourth column yields, idΓ where L-Divert aborts that iteration. Where a Ψ𝑡 built from an iterator instantiates a fiber (Definition 52), that instantiation carries the writes of the O-Insert row at the name it draws, and an L-Unload whose accumulator retires one carries those of the O-Retire row. Every case analysis below is a lookup in the table, and five lookups recur often enough to name.

rule 𝜃𝑡

𝑛 𝜃𝑡+1

𝑛 Ψ𝑡 control fields edited

O-Insert undefined 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 idΓ dom(𝐹𝛾)

O-Retire unconstrained unchanged idΓ 𝜏𝑛 O-Remove 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 undefined idΓ dom(𝐹𝛾)

L-Begin 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑒𝑛, idΓ, 𝜔) idΓ 𝜃𝑛 L-Iter 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖′, 𝑔∘ℎ, 𝜔) pr1 ∘𝑖 𝜃𝑛 L-Finish 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) 𝖠𝖼𝗍𝗂𝗏𝖾(𝑔∘ℎ, 𝜔) pr1 ∘𝑖 𝜃𝑛 L-Divert 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑖, 𝑔, 𝜔) 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔∘ℎ, 𝜔) idΓ or pr1 ∘𝑖 𝜃𝑛 L-Leave 𝖠𝖼𝗍𝗂𝗏𝖾(𝑔, 𝜔) 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔, 𝜔) idΓ 𝜃𝑛 L-Unload 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(𝑔, 𝜔) 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 𝑔 𝜃𝑛

Table 1 | The rules as writes on the fiber 𝑛 they act on, where step𝑡 is that rule applied at 𝑛.

Lemma 59. Reading Table 1 together with Definition 55, for every step 𝑡 and all fibers 𝑚, 𝑛 present at 𝛾𝑡:

1. a table moves only inside a Ψ𝑡: 𝜎𝑡+1 𝑚 ≠𝜎𝑡

𝑚 only where step 𝑡 acts on 𝑚, or acts on an 𝑛≠ 𝑚 with dom(𝜎𝑡

𝑚) ∩𝑑𝑛≠⌀, in which case the two tables differ in values at keys of 𝑑𝑛 alone and dom(𝜎𝑚) is unchanged; 2. 𝜔𝑛 comes into existence only where step𝑡= L-Begin(𝑛) and ceases only where step𝑡= L-Unload(𝑛), so 𝜔𝑡

𝑛 is constant for 𝑡 in an episode of 𝑛; 3. Ψ𝑡= 𝑔𝑡 𝑛 only where step𝑡= L-Unload(𝑛), and no other step applies 𝑔𝑛 to the state;

40

规则会读取控制字段来判断能否应用，因此整体状态等价关系还必须保留注册表域与每个纤程的全部控制字段；函数类型字段按定义 34 比较映射与迭代器，其他字段按相等比较。后续结果也使用定义 51 给出的更粗投影，这些关系逐层包含。引理 60 将为九条规则统一建立最细等价关系的不变性。

表 1 把第 4.2 节九条规则重写为写入清单。累加器、已提交视图和剩余迭代器都属于 θn，所以控制字段列也涵盖它们；若 Ψt 中的迭代实例化纤程，它还携带 O-Insert 的写入，若 L-Unload 的累加器退役纤程，则携带 O-Retire 的写入。后续案例分析都只是查表。

引理 59 汇总五项直接结论：（1）表只在 Ψt 内变化，并且只能改变执行纤程自身的表或其声明依赖在其他表中的值；（2）ωn 只由 L-Begin 创建、由 L-Unload 删除，所以在一个 episode 内恒定；（3）gn 只在 L-Unload 中应用；（4）未安装到已安装只能由 L-Begin 导致，反向只能由 L-Unload 导致；（5）πn、dn、pn、en 随条目创建后不再变化，τn 只会由 O-Retire 单调写为 ⊤。

<!-- page 41 of 92 -->

4. ¬ installed𝑡 𝑛∧installed𝑡+1

𝑛 ⇒step𝑡= L-Begin(𝑛), and installed𝑡

𝑛∧¬ installed𝑡+1

𝑛 ⇒ step𝑡= L-Unload(𝑛); 5. 𝜋𝑛, 𝑑𝑛, 𝑝𝑛, and 𝑒𝑛 come into existence with the entry of 𝑛 and are never written again, and 𝜏𝑛 is monotone, written only at ⊤ and only by an O-Retire.

Proof. Let step 𝑡 apply 𝑟 at 𝑛. By Definition 58 it factors as edit𝑡∘Ψ𝑡, where edit𝑡 writes the fields the fifth column of Table 1 names and nothing else, and Ψ𝑡 is idΓ, an application of one of 𝑛’s iterations, or the accumulator 𝑔𝑡

𝑛, which is a composite of the inverses those iterations yielded. Each of the three is confined to 𝑛 by Lemma 57, so Ψ𝑡 writes no field of a fiber present at 𝛾𝑡 but 𝜎𝑛 and the values other tables hold at keys of 𝑑𝑛, their domains untouched, together with the entry an instantiation adds and the 𝜏 its inverse writes. The two halves therefore partition the writes, and each clause is that partition read at one field. One reading of the second and third columns is used twice: 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 is the one lifecycle state carrying no committed view, L-Begin the one rule leading out of it, and L-Unload the one rule leading into it, while every other row carries the 𝜔 of its premise into its conclusion unchanged.

(1) An edit𝑡 writes no table, the fifth column naming none, and what a Ψ𝑡 writes outside 𝜎𝑛 is values at keys of 𝑑𝑛 in the tables holding them, the domains unchanged. So 𝜎𝑚 can move only inside a Ψ𝑡, at the acting fiber or at the keys of 𝑑𝑛 its table holds.

(2) 𝜔𝑛 is a constituent of 𝜃𝑛, which only an edit𝑡 writes and only at the fiber the step acts on, so by the reading above 𝜔𝑛 comes into existence at an L-Begin of 𝑛 and ceases at an L-Unload of 𝑛. An episode of 𝑛 is an interval on which installed𝑛 holds, hence one throughout which 𝜔𝑛 is defined, so neither rule falls in its interior.

(3) The fourth column, where an accumulator appears at L-Unload alone: the other rules take a forward map pr1 ∘𝑖 or idΓ, and no edit𝑡 applies a map to the state at all.

(4) installed𝑛 is 𝜃𝑛≠𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾, and by the reading above L-Begin and L-Unload are the only rules whose premise and conclusion differ in whether 𝜃𝑛 is 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾. A step acting on some 𝑚≠ 𝑛 writes no 𝜃𝑛, and the entry an instantiation adds is at a name not present at 𝛾𝑡.

(5) No row of the fifth column names a 𝜋, 𝑑, 𝑝, or 𝑒; those come into existence with the entry O-Insert adds, which its conclusion writes, as does the O-Insert an instantiation takes. Only O- Retire writes a 𝜏, at ⊤, whether taken by the orchestrator or as the inverse of an instantiation (Definition 52); O-Insert sets 𝜏= ⊥ at a name not already present, so no step returns a 𝜏 to ⊥.□

Three further lookups say what the rules cannot see. The first is that they read the state only through the observations above, so that the whole calculus descends to Γ/ ≃.

Lemma 60. (≃-invariance.) Let 𝛾≃𝛾′ as read above. Then a rule of Section 4.2 applies at 𝛾 acting on 𝑛 if and only if it applies at 𝛾′ acting on 𝑛, and the states the two applications reach are again related by ≃.

Proof. Every premise of Section 4.2 is of one of four kinds, and each reads a constituent the relation keeps. A premise matching 𝜃𝑛 or 𝜏𝑛 against a pattern, and the premise ∀𝑚. 𝜋𝑚≠𝑛 of O-Remove, read control fields. The premises (𝑑, 𝑝, 𝑒) ∈ℭΓ and ∀𝑚. 𝑝∩𝑝𝑚= ⌀ of O-Insert read 𝑑, 𝑝, and 𝑒. A premise mentioning target𝑛 or relied𝑛 reads 𝜏𝑛, the committed views inside the 𝜃𝑚, and dom(𝜎𝛾), which Definition 50 computes from the 𝜃𝑚 and the dom(𝜎𝑚), and Definition 33 relates two coeffect contexts only where their domains agree. The remaining premises read dom(𝐹𝛾). Two ≃-related states have ≃-related 𝜎𝛾, the relation comparing every table and the control fields deciding which of them 𝜎𝛾 unions, and no premise reads a value 𝜎𝛾(𝑘) otherwise than up to ≃𝑘, so no premise separates two ≃-related states.

41

证明把每步分成 edit 与 Ψ 两部分。edit 只写表 1 末列列出的字段；Ψ 为恒等、n 的某次迭代或其累加器，依引理 57 都限域于 n。因此两部分完整划分写入，五个结论分别是对对应字段的直接读取。具体而言，表不被 edit 修改；ω 只能随 θ 在 L-Begin/L-Unload 创建或消失；累加器只出现在 L-Unload；installed 等价于 θ 非 Inactive；组件静态字段没有任何规则重写，而 τ 只会被退役操作设为真。□

还需三个“规则看不见什么”的查表结果。第一个说明规则只通过上述观察读取状态，所以整个演算可下降到 Γ/≃。

引理 60（≃ 不变性）：若 γ≃γ′，则第 4.2 节任一规则在 γ 对 n 可用，当且仅当它在 γ′ 对 n 可用；两次应用的结果仍由 ≃ 关联。

证明。规则前提只读取关系保留的内容：生命周期与退役标志、父指针、组件三元组、提供集合不相交性、目标与 relied 所用的已提交视图和表域，以及注册表域。等价状态在所有这些观察下不可区分。结论方面，edit 写入的是前提中已匹配的相关值；Ψ 为恒等、得到见证的迭代或累加器，均保持声明键上的等价，而限域性保持其余绑定与控制字段不变。□

<!-- page 42 of 92 -->

For the conclusion, 𝛾𝑡+1 = edit𝑡(Ψ𝑡(𝛾𝑡)) by Definition 58. The values an edit𝑡 assigns are the constituents of the premises it matched, related at the two states by the paragraph above and by the clause 𝑒≃𝑒 of Definition 37, which relates the triples an iterator yields at related states. And Ψ𝑡 carries ≃-related states to ≃-related states: it is idΓ, an iteration of 𝑒𝑛, or the accumulator inside 𝜃𝑛, and the latter two respect ≃𝑑𝑛∪𝑝𝑛 by Lemma 57, which ≃ implies, while confinement leaves every binding outside the two declarations and every control field as they stand. □

The names a state carries are read by two of those observations, dom(𝐹𝛾) and the indexing of the control fields, and the rule that draws a name draws any name not already in use (Definition 52). Reading the results below up to ≃ therefore also calls for reading them up to a renaming, which is the discipline of Section 4.1 cashed out.

Lemma 61. (Equivariance.) Let 𝜒: 𝔑→𝔑 be a bijection and let 𝜒⋅𝛾 be the state carrying the registry 𝐹𝛾∘𝜒−1, with every name occurring in a 𝜋𝑚 or an 𝜔𝑚 replaced by its image. Then 𝜒⋅ 𝛾 is a state, well formed where 𝛾 is, and step𝑡= 𝑟(𝑛) carries 𝛾𝑡 to 𝛾𝑡+1 if and only if 𝑟(𝜒(𝑛)) carries 𝜒⋅𝛾𝑡 to 𝜒⋅𝛾𝑡+1.

Proof. A premise reads a name only by comparing it with another, whether directly, as in the freshness 𝑛∉dom(𝐹𝛾) of O-Insert and the ∀𝑚. 𝜋𝑚≠𝑛 of O-Remove, or through a table of names, as target𝑛 and relied𝑛 read the 𝜋𝑚 and the 𝜔𝑚. A bijection preserves each such compar­ ison. The only names a rule writes are the 𝜋 that O-Insert sets and the 𝜔 that L-Begin sets, both taken from what its premises read, so the writes commute with 𝜒; an effect function writes no name at all, drawing one only through the primitive of Definition 52, which Definition 55 confines to the entry that primitive adds. Well-formedness (Definition 63) is four conditions comparing names with names. □

A sequence and its renaming therefore take the same rules in the same order and reach states differing by 𝜒 alone. Two sequences agreeing save in the names their instantiations draw are accordingly identified, and the results below are read up to the renaming that identifies them.

The second lookup is that an entry stripped of everything but its name is invisible to the rules, which is what lets Definition 52 retire a fiber where the state it recovers has none, and Lemma 79 remove the fibers a deleted episode instantiated.

Lemma 62. (Vestigial entries.) Call 𝑛 vestigial at 𝛾 when 𝜏𝑛= ⊤, 𝜃𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾, 𝜎𝑛= ⌀, and no 𝑚 has 𝜋𝑚= 𝑛; a vestigial entry satisfies 𝛾≃𝐾𝛾∖𝑛. If 𝑛 is vestigial at 𝛾 then for every rule and every 𝑚≠𝑛:

1. a rule applying at 𝛾 acting on 𝑚 applies at 𝛾∖𝑛 acting on 𝑚, and the states the two reach differ in the entry at 𝑛 alone, which stays vestigial; 2. conversely a rule applying at 𝛾∖𝑛 acting on 𝑚 applies at 𝛾, unless it is an O-Insert drawing the name 𝑛 or claiming a key of 𝑝𝑛.

Proof. A vestigial 𝑛 contributes to no observation a premise of a rule acting on 𝑚≠𝑛 reads. It is not 𝖠𝖼𝗍𝗂𝗏𝖾, so 𝜎𝑛 enters no 𝜎𝛾 and 𝑛 is the provider of no key, leaving 𝛾⊧𝑑𝑚 and target𝑚 unmoved; installed𝑛 fails, so 𝑛 contributes no disjunct to relied𝑚; no 𝜋𝑚′ names 𝑛, so the premise ∀𝑚′. 𝜋𝑚′ ≠𝑚 of an O-Remove of 𝑚 is unmoved; and 𝜃𝑛, 𝜏𝑛, and 𝜋𝑛 are read by rules acting on 𝑛 alone. The two premises clause (2) excepts are the two the removal relaxes, an absent name being fresh and an absent provision meeting every other. By Lemma 59 no rule acting on 𝑚≠𝑛 writes a field of 𝑛 save values at keys of 𝑑𝑚 that 𝜎𝑛 holds, of which the empty 𝜎𝑛 holds none, so the entry survives vestigial. □

42

状态通过注册表域和控制字段中的引用观察名称；创建规则只选未使用名称。因此，以下结果除了按 ≃ 阅读，也应忽略一致重命名。

引理 61（等变性）：对纤程名任意双射 χ，把注册表索引、父指针与已提交视图中的名称一致替换后，状态仍良构；r(n) 推动原状态，当且仅当 r(χ(n)) 推动重命名状态，结果也相应重命名。

证明。规则只以相等性比较名称，双射保持这些比较；规则写入的父指针和已提交视图都来自前提读取的名称，因此与 χ 交换。效果函数不直接写名称，实例化原语只在新增条目中使用所选名称。良构性的四个条件也都只是名称间比较。□

所以，两个只在实例化选名上不同的序列被视为相同。

第二个查表结果说明，只剩名称而无有效内容的条目对规则不可见。这使定义 52 能以“退役纤程”恢复原本没有该纤程的状态，也使引理 79 能删除被删 episode 所实例化的纤程。

引理 62（残余条目）：若 n 已退役、Inactive、表为空且没有子纤程，则称它在 γ 中为残余；γ 与 γ\n 在所有表上等价。对任意作用于 m≠n 的规则：（1）若规则可用于 γ，则也可用于 γ\n，结果只差仍为残余的 n；（2）反向也成立，除非规则是使用名称 n 或占用 pn 中键的 O-Insert。

证明。残余 n 不处于 Active，因而不进入 σγ，也不提供键；它未安装，不影响 relied；没有子指针指向它；其控制字段只会被作用于 n 的规则读取。移除它仅放宽了名称新鲜性和提供集合不相交两个前提。依据引理 59，其他纤程的规则也不会把空表 n 改成非空，因此残余性保持。□

<!-- page 43 of 92 -->

4.3.1. Preservation

Definition 50 fixes the shape of a registry, and the rules have to be checked against it before the results below can add to it. This subsection identifies the invariant the rules preserve, of which the first clause is that shape and the rest what those results assume.

Definition 63. A registry 𝐹𝛾 is well formed when, for all 𝑚, 𝑛∈dom(𝐹𝛾) and all 𝑘∈𝐾,

1. 𝜋𝑛∈dom(𝐹𝛾) ∪{𝗋𝗈𝗈𝗍}; 2. 𝑚≠𝑛⇒𝑝𝑚∩𝑝𝑛= ⌀; 3. installed𝑛(𝛾) ⇒𝜔𝑛 is total on 𝑑𝑛 and valued in dom(𝐹𝛾); 4. installed𝑛(𝛾) ∧𝑘∈𝑑𝑛∧𝜔𝑛(𝑘) = 𝑚⇒installed𝑚(𝛾). Clause (1) is the tree of Definition 50 read one edge at a time, keeping a parent pointer landing in the registry. The acyclicity that definition also requires needs no clause, since the fiber a pointer names is introduced before the fiber naming it.

Theorem 64. (Preservation.) If 𝐹𝑡 is well formed then so is 𝐹𝑡+1, whichever rule step 𝑡 applies. Each clause is established at 𝛾𝑡+1 from all four at 𝛾𝑡.

Proof. Let step 𝑡 act on 𝑛.

(1) By Table 1 only O-Insert and O-Remove write a 𝜋 or dom(𝐹𝛾). O-Insert has 𝜋𝑛∈dom(𝐹𝑡) ∪ {𝗋𝗈𝗈𝗍} as a premise, which is the clause for the fiber it adds, and it leaves every other 𝜋 alone while enlarging dom(𝐹𝛾). O-Remove has ∀𝑚. 𝜋𝑚≠𝑛, so no surviving 𝜋𝑚 names the fiber it takes away.

(2) The last premise of O-Insert is ∀𝑚. 𝑝𝑛∩𝑝𝑚= ⌀, which is the clause for the fiber it adds, and by Table 1 no other rule writes a 𝑝 or enlarges dom(𝐹𝛾). Two consequences are used below: dom(𝜎𝑚) ⊆𝑝𝑚 by Definition 48, so distinct tables are disjoint and 𝜎𝛾 is a function; and 𝑘∈𝑝𝑚∩ 𝑝𝑚′ forces 𝑚= 𝑚′, so 𝑘 has at most one possible provider.

(3) By Lemma 59(2) the only rule that writes an 𝜔𝑛 is L-Begin, whose premise 𝜔= target𝑡

𝑛≠⊥ makes it total on 𝑑𝑛 and valued in dom(𝐹𝑡), target naming providers. By Table 1 the only rule that shrinks dom(𝐹𝛾) is O-Remove, whose premise 𝜃𝑡

𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 gives ¬ installed𝑡

𝑛, whence by clause (4) at 𝛾𝑡 no 𝑚 has 𝜔𝑡

𝑚(𝑘) = 𝑛 for a 𝑘∈𝑑𝑚 while installed𝑡

𝑚; and 𝑛 itself carries no 𝜔.

(4) By Lemma 59(2) and (4) the clause can fail at 𝛾𝑡+1 only where some installed has fallen, some 𝜔 has been written, or a fiber some 𝜔 names has left dom(𝐹𝛾). The last is an O-Remove, whose removed fiber is not installed and hence, by clause (4) at 𝛾𝑡, is named by no 𝜔𝑡

𝑚 of an installed 𝑚. The first is an L-Unload of 𝑛, whose premise ¬ relied𝑡

𝑛 reads

∀𝑚≠𝑛, 𝑘∈𝑑𝑚. installed𝑡

𝑚⇒𝜔𝑡

𝑚(𝑘) ≠𝑛

and which writes no 𝜔𝑚 for 𝑚≠𝑛 and leaves ¬ installed𝑡+1

𝑛 , so the clause holds of 𝑛 as well. The second is an L-Begin of 𝑛, writing target𝑡

𝑛, whose values are the providers of the keys of 𝑑𝑛 and hence 𝖠𝖼𝗍𝗂𝗏𝖾 at 𝛾𝑡; the step alters no other fiber’s 𝜃, so they are installed at 𝛾𝑡+1 too. □

The guard on L-Unload is what carries clauses (3) and (4). The premise ∀𝑚. 𝜋𝑚≠𝑛 of O- Remove speaks only of parent pointers; what keeps a committed view from naming a removed fiber is the guard, imposed several steps earlier and for a different reason. Two things follow. A name freed by O-Remove may be reissued by O-Insert, since no stale committed view can name

43

4.3.1. 保持性

定义 50 规定注册表形状。在继续证明前，必须确认规则保持这一形状及后续结果依赖的不变量。

定义 63：注册表良构，当且仅当：（1）每个父指针指向注册表内名称或 root；（2）不同纤程的提供集合不相交；（3）已安装纤程的 ω 在 dn 上全定义，值都在注册表中；（4）已安装纤程的已提交视图指向的提供者也已安装。父指针无环无需另列，因为被指向的父纤程总早于子纤程创建。

定理 64（保持性）：若 Ft 良构，则无论 stept 应用哪条规则，Ft+1 仍良构。

证明按四项进行。（1）只有 O-Insert 与 O-Remove 改变父指针或注册表域；插入前提保证父存在，移除前提保证无子指向被删项。（2）O-Insert 的最终前提保证新增提供集合与现有集合不交，其他规则不改提供集合。这也保证不同表不交且每个键至多有一个候选提供者。（3）ω 只由 L-Begin 写入，其目标视图前提保证在 dn 上全定义且指向现有提供者；O-Remove 只能删未安装纤程，而第（4）项保证它未被任何已安装视图引用。（4）可能破坏该项的只有提供者停止安装、写入新 ω 或删除被引用纤程。删除项由既有第（4）项排除；L-Unload 受 ¬relied 守卫，确保没有其他已安装视图引用 n；L-Begin 写入的目标只指向当时 Active、因而仍已安装的提供者。□

L-Unload 的守卫正是第（3）、（4）项成立的关键。O-Remove 只检查父指针；已提交视图不会指向被删纤程，是数步之前因另一目的设置的守卫所保证的。因此，被移除名称可以安全复用，纤程一旦 Inactive 也无需另查是否仍有依赖就可移除。

<!-- page 44 of 92 -->

it; and a fiber may be removed as soon as it is 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾, without a separate check that nobody depends on it.

4.3.2. Temporal Composability

Local temporal composability reverts one sequence of effects with one accumulator (Sec­ tion 3.1.2). The registry holds one accumulator per fiber and the fibers interleave: between the moment 𝑛 composes an inverse onto 𝑔𝑛 and the moment 𝑔𝑛 runs, other fibers have moved the state. Whether 𝑔𝑛 still undoes what it was built to undo there is what the global form of the guarantee asserts, and the condition it turns on is that the intervening steps commute with 𝑔𝑛.

Definition 65. Two iterators 𝑖, 𝑗 over Γ are independent when they are so in the sense of Definition 42, reading ≃ on maps, triples, and continuations as Definition 34 does, and an instantiating iteration (Definition 52) as agreement of the component it names. Fibers 𝑚 and 𝑛 are entangled when one’s provision meets the other’s declarations, 𝑝𝑚∩(𝑑𝑛∪𝑝𝑛) ≠⌀ or 𝑝𝑛∩ (𝑑𝑚∪𝑝𝑚) ≠⌀. A sequence of steps is pairwise independent when for every two names 𝑚≠𝑛 it ever holds — one for each fiber the orchestrator inserts and each fiber an iteration instantiates — either 𝑒𝑚 and 𝑒𝑛 are independent, or 𝑚 and 𝑛 are entangled and every key at which operations of both occur is commutative (Definition 44).

Independence in this sense is what trace theory takes as primitive: commuting actions gen­ erate an equivalence on sequences under which reordering two adjacent independent actions preserves the endpoint [46], and Lemma 78 is that reordering for these rules. Quantifying over names rather than iterators is what keeps two fibers of one component in scope: such a pair requires that component’s effect function to be independent of itself, which is to require that 𝔐(𝑖) be commutative. Clause (1) of Definition 42 is what Theorem 68 uses and clause (2) what Theorem 80 needs in addition: reordering the steps of two fibers evaluates an iterator at a state the other fiber moved, and commuting the maps does not by itself say that the iterator yields the same inverse and the same continuation there. Checking clause (1) calls for no more than the iterations themselves, since Lemma 41(1) carries commutation from the generators to the monoids they generate.

The paradigm supplies both disjuncts:

Lemma 66. (Pairwise independence.) Every sequence of steps is pairwise independent.

Proof. Every key is commutative, its coeffect carrying the proof as its witness (Definition 46), which settles the second disjunct at an entangled pair. A pair that is not entangled has each member’s provision outside the other’s every key, which is the hypothesis 𝑃1 ∩𝑆2 = 𝑃2 ∩𝑆1 = ⌀ of Theorem 47 read at the underlying members of Definition 30, so those members are independent, the commutativity of every shared operation key again supplied by the witness; independence transfers along the lift of Definition 56, whose transformations move the tables as the stages move the projection, an instantiating iteration adding an entry no table map reads. Two fibers of one component fall under the same two cases, Theorem 47 holding at 𝑖1 = 𝑖2 as well. □

Entangled fibers are the pairs independence cannot cover, and could not be expected to: a consumer’s operation acts on the very value the provider’s extension installs, so the two orders differ at every state the binding is absent from, whichever equivalence the difference is read up to. What stands in for independence there is the rules themselves, which never interleave the

44

4.3.2. 时间可组合性

局部时间可组合性用一个累加器回退一段效果序列（第 3.1.2 节）。注册表则为每个纤程保存累加器，多个纤程彼此交错：n 把逆操作加入 gn 后，到 gn 真正运行前，其他纤程可能已经改变状态。全局保证要回答的是 gn 在此时是否仍能撤销原效果，关键条件是其间步骤是否与 gn 交换。

定义 65：Γ 上两个迭代器按定义 42 的意义独立；实例化迭代还要求它们命名同一组件。若一方提供集合与另一方的声明或提供相交，则两个纤程纠缠。步骤序列成对独立，是指其中任意两个名称对应的效果函数要么独立，要么二者纠缠且共同操作的每个键都具有交换性。

这种独立性正是迹理论的原语：交换动作生成序列等价关系，交换相邻独立动作不改变终点 [46]，引理 78 将为本文规则建立这种重排。按名称量化可覆盖同一组件的两个实例；这要求效果函数与自身独立，即其生成的幺半群可交换。定义 42 的第（1）项供定理 68 使用，第（2）项还供定理 80 使用，因为重排会让迭代器在被另一纤程改变过的状态上求值，仅有映射交换不足以保证它产生相同的逆与后继。

引理 66（成对独立性）：每个步骤序列都成对独立。

证明。每个键都由协效见证其交换性，因此纠缠对满足第二个分支。非纠缠对的提供集合落在对方所有键之外，满足定理 47 的集合不交前提；共享操作键的交换性仍由见证提供，独立性再沿定义 56 的提升转移。实例化只添加任何表映射都不读取的条目。同一组件的两个纤程也落入相同两种情况。□

纠缠纤程正是独立性无法也不应覆盖的组合：消费者操作的就是提供者扩展所安装的值，在绑定缺失的状态上，两种执行顺序必然不同。这里替代独立性的是生命周期规则本身，它们禁止不安全交错。

<!-- page 45 of 92 -->

two maps in the order that separates them. Throughout the argument, a lift applied where its precondition fails produces no transition, per the convention of Section 3.2.1, so a map meeting a state its key has left is read as the identity.

按能将两张映射分离的顺序处理它们. 在整个论证中, 依照第 3.2.1 节的约定, 若 lift 的前置条件不成立, 应用它不会产生转移; 因此, 当映射遇到其 key 已经离开的状态时, 该映射按恒等映射理解.

Lemma 67. (Entangled steps.) Let an episode of 𝑛 open at 𝑏, and let step 𝑡≥𝑏 in the episode act on an 𝑚≠𝑛 entangled with 𝑛. Then

1. where 𝑝𝑚∩(𝑑𝑛∪𝑝𝑛) ≠⌀, Ψ𝑡= idΓ; 2. otherwise 𝑔𝑡 𝑛(Ψ𝑡(𝛾𝑡)) ≃𝐾Ψ𝑡(𝑔𝑡

𝑛(𝛾𝑡)); 3. where moreover 𝜃𝑡 𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −, −), Ψ𝑡= idΓ in either case.

Proof. (1) A key of 𝑝𝑚∩𝑝𝑛 would put two registered provisions in conflict with the premise of O-Insert, so some 𝑘∈𝑝𝑚∩𝑑𝑛, and 𝑚 is the one registered fiber whose provision carries 𝑘. The premise of 𝑛’s L-Begin at 𝑏−1 resolves 𝑘 to an 𝖠𝖼𝗍𝗂𝗏𝖾 provider, so 𝜔𝑏

𝑛(𝑘) = 𝑚 and 𝜃𝑏−1

𝑚 = 𝖠𝖼𝗍𝗂𝗏𝖾(−, −); 𝜔𝑛 holds 𝑚 for as long as the episode is open (Lemma 59(2)) while installed𝑛 holds, which is relied𝑚(𝛾𝑡) at every such 𝑡. The guard therefore blocks every L-Unload of 𝑚 there, so 𝑚 never reaches 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾, and a fiber standing at 𝖠𝖼𝗍𝗂𝗏𝖾 or 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 is acted on only by L-Leave, O-Retire, and the blocked L-Unload, of which the first two have Ψ𝑡= idΓ (Table 1).

(2) Here 𝑝𝑚∩(𝑑𝑛∪𝑝𝑛) = ⌀ and some 𝑘∈𝑝𝑛∩𝑑𝑚. Ψ𝑡 is one of 𝑚’s iterations or the accumula­ tor 𝑔𝑡

𝑚, in either case a composite of the maps Definition 56 admits for 𝑚: lifts of operation maps, forward or inverse, at keys of 𝑑𝑚∪𝑝𝑚, extensions and restrictions at keys of 𝑝𝑚, instantiations, and the O-Retires those yield. The constituents of 𝑔𝑡

𝑛 are the inverses Definition 56 admits for 𝑛: lifts of operation inverses at keys of 𝑑𝑛∪𝑝𝑛, restrictions at keys of 𝑝𝑛, and O-Retires. Commute the constituents of Ψ𝑡 past those of 𝑔𝑡

𝑛 one pair at a time. A pair at distinct keys is a pair of key- local maps and commutes; an instantiation or an O-Retire writes a fresh entry or a control field, which no table map reads, and commutes with every constituent in sight; a pair of operation maps at one shared key is covered by that key’s commutativity, which the witness of its coeffect supplies (Definition 46), read at the tables through the lift of Definition 56. What remains is an operation map of 𝑚 at a key 𝑘∈𝑝𝑛∩𝑑𝑚 against the extension or restriction of 𝑛 at 𝑘. Such a map exists in Ψ𝑡 only under a committed view of 𝑚 resolving 𝑘 (Lemma 59(2)), whose L- Begin required an 𝖠𝖼𝗍𝗂𝗏𝖾 provider of 𝑘; the commitment pins that provider for as long as 𝑚 is installed, by the argument of (1) read at 𝑚, and two registered provisions cannot share 𝑘, so the provider is 𝑛 and 𝑛 was 𝖠𝖼𝗍𝗂𝗏𝖾 within the open episode. Its transition had therefore finished by 𝑡, and 𝑔𝑡

𝑛 carries the restriction at 𝑘 the extension 𝑚 resolved yielded, composed to the left of 𝑛’s operation inverses at 𝑘 by the LIFO order of Definition 18. On one side the operation map of 𝑚 commutes leftward, past constituents at other keys and, by commutativity of 𝑘, past 𝑛’s operation inverses at 𝑘, until the restriction absorbs it, a write to the value at 𝑘 followed by the removal of 𝑘 being the removal alone; on the other side it meets a state 𝑔𝑡

𝑛 has removed 𝑘 from and produces no transition. Both composites therefore agree at 𝛾𝑡.

(3) The provider case is (1). In the consumer case, a consumer of 𝑛 is not installed while 𝑛 is 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀: its commitment resolving a key to 𝑛 would have held relied𝑛 and blocked the L- Unload closing 𝑛’s previous episode, and a new commitment requires an 𝖠𝖼𝗍𝗂𝗏𝖾 provider. An uninstalled fiber is acted on only by L-Begin and the orchestration rules; the orchestration rules have Ψ𝑡= idΓ, and L-Begin is inapplicable, the key 𝑛 provides lying outside dom(𝜎𝛾𝑡) and the target of a fiber declaring it therefore ⊥. □

With every pair so covered, the single-accumulator invariant of Theorem 7 survives the interleaving, in the form that gives temporal composability its content: running an inverse withdraws the fiber’s contribution and nothing else.

所有映射对都得到上述覆盖后, 定理 7 的单 accumulator 不变量在交错执行中仍然成立. 它也给出了时间组合性的实质含义: 运行 inverse 只撤回该 fiber 的贡献, 不会撤回其他内容.

45

<!-- page 46 of 92 -->

Theorem 68. (Recovery exactness.) Let an episode of 𝑛 open at 𝑏, let 𝑢≥𝑏 lie in it, and let 𝑡1 < ⋯< 𝑡𝑙 be the indices in [𝑏, 𝑢) at which the acting fiber is not 𝑛. Then

𝑔𝑢

𝑛(𝛾𝑢) ≃𝐾(Ψ𝑡𝑙∘⋯∘Ψ𝑡1)(𝛾𝑏) (55)

That is, applying 𝑛’s accumulator at 𝛾𝑢 leaves every fiber’s table where those same steps would have left it from 𝛾𝑏, the control fields lying outside the comparison. Reading the right side as the state reached had 𝑛 never begun assumes that no fiber 𝑛 instantiates take a step in [𝑏, 𝑢), since a fiber 𝑛 instantiates is one that would not be there to take it.

也就是说, 在 𝛾𝑢 应用 𝑛 的 accumulator 后, 每个 fiber 的 table 都处于从 𝛾𝑏 执行同一批其他步骤后应处的位置, control field 不在比较范围内. 若把右侧理解为 𝑛 从未开始时到达的状态, 还需假设 𝑛 实例化的 fiber 没有在 [𝑏, 𝑢) 中执行步骤, 因为若 𝑛 从未开始, 这些 fiber 根本不会存在.

Proof. By induction on 𝑢, over the indices 𝑢 with 𝑢+ 1 in the episode. At 𝑢= 𝑏 the step at 𝑏− 1 is an L-Begin, the episode opening by Definition 58, so 𝑔𝑏 𝑛= idΓ by Table 1, the index set is empty, and the claim is 𝛾𝑏≃𝐾𝛾𝑏. Two facts are used at each step. An edit𝑡 writes control fields alone, and the two rules that write dom(𝐹𝛾) leave the tables as they stand, an O-Insert adding an entry with an empty table and an O-Remove taking one away by its premise, so

𝛾𝑡+1 ≃𝐾Ψ𝑡(𝛾𝑡)

and, for every fiber 𝑚, every map in 𝔐(𝑒𝑚) carries ≃𝐾-related states to ≃𝐾-related states, since ≃𝐾 implies ≃𝑑𝑚∪𝑝𝑚, at which Lemma 57 makes such a map respect the relation, and since confinement leaves it moving no binding outside the two declarations, so that the keys outside the interface stay as related as it found them; an instantiation adds an empty entry by Definition 52.

Let step 𝑢 act on 𝑛. Since the episode is open at 𝑢 and 𝑢+ 1, Lemma 59(4) excludes an L-Begin and an L-Unload of 𝑛, and O-Insert and O-Remove read a 𝜃𝑛 that installed𝑢

𝑛 denies, leaving two cases. Where the rule is L-Iter, L-Finish, or a landing L-Divert, Table 1 gives Ψ𝑢= pr1 ∘𝑖𝑢

𝑛 and 𝑔𝑢+1

𝑛 = 𝑔𝑢

𝑛∘ℎ for the inverse ℎ that iteration yields. The witness condition of Definition 37 reads ℎ(Ψ𝑢(𝛾𝑢)) ≃𝑑𝑛∪𝑝𝑛𝛾𝑢, which is ≃𝐾 once Lemma 57 adds that neither map moves a binding outside the two declarations, and the instantiating iteration is the case where the two states differ in an entry with an empty table that ≃𝐾 does not compare. Since 𝑔𝑢

𝑛 carries ≃𝐾 by the paragraph above,

𝑔𝑢+1

𝑛 (𝛾𝑢+1) ≃𝐾(𝑔𝑢

𝑛∘ℎ)(Ψ𝑢(𝛾𝑢)) ≃𝐾𝑔𝑢

𝑛(𝛾𝑢)

Where the rule is L-Leave, an aborting L-Divert, or an O-Retire of 𝑛, Table 1 gives Ψ𝑢= idΓ and 𝑔𝑢+1

𝑛 = 𝑔𝑢

𝑛, so the same equation holds with ℎ= idΓ. Either way the induction hypothesis carries over with the index set unchanged, which is the computation of Theorem 7 one step at a time.

Let step 𝑢 act on 𝑚≠𝑛. Then 𝑔𝑢+1

𝑛 = 𝑔𝑢

𝑛 by Table 1, and Ψ𝑢∈𝔐(𝑒𝑚), or Ψ𝑢= idΓ where the rule is an orchestration rule. Where 𝑚 and 𝑛 are not entangled, Lemma 66 makes 𝑒𝑚 and 𝑒𝑛 independent, and clause (1) of Definition 42, read at the finer ≃ of Definition 58 and hence at ≃𝐾, commutes 𝑔𝑢

𝑛 with Ψ𝑢; where they are entangled, Lemma 67 commutes the two at 𝛾𝑢, its first case outright. Either way

𝑔𝑢

𝑛(𝛾𝑢+1) ≃𝐾𝑔𝑢

𝑛(Ψ𝑢(𝛾𝑢)) ≃𝐾Ψ𝑢(𝑔𝑢

𝑛(𝛾𝑢))

which is the induction hypothesis with Ψ𝑢 appended, Ψ𝑢 carrying ≃𝐾-related states to ≃𝐾- related states by the paragraph above. □

Corollary 69. (Terminal recovery.) Let an episode of 𝑛 open at 𝑏 and close at 𝑢. Then, with 𝑡1 < ⋯< 𝑡𝑙 as in Theorem 68,

46

<!-- page 47 of 92 -->

𝛾𝑢+1 ≃𝐾(Ψ𝑡𝑙∘⋯∘Ψ𝑡1)(𝛾𝑏) (56)

In particular 𝜎𝑢+1

𝑛 = ⌀, which is the premise an O-Remove of 𝑛 carries.

特别地, 有 𝜎𝑢+1_n=⌀, 这正是对 𝑛 执行 O-Remove 所要求的前提.

Proof. By Lemma 59(4) step 𝑢 is an L-Unload of 𝑛, whose Ψ𝑢 is 𝑔𝑢

𝑛 by Lemma 59(3), so 𝛾𝑢+1 ≃𝐾 𝑔𝑢

𝑛(𝛾𝑢) and Theorem 68 applies. For the table, the fiber enters the episode with 𝜎𝑛 empty, and the keys of 𝑝𝑛 enter dom(𝜎𝑛) only by 𝑛’s own extensions (Definition 56), of which the right side applies none, so the right side leaves 𝜎𝑛 empty; Definition 33 relates two coeffect contexts only where their domains agree, so a table it relates to the empty one is empty. □

What the two results compare is the tables, so what they assert is bounded by what the keys of a state bind, and inside each binding by the ≃𝑘 the key’s operations induce: each binding is restored only up to what its key’s equivalence forgets, so a monotone allocator is not rewound, a heap’s layout free does not restore, and a message already sent stays sent. This is the bound Section 3.3.2 takes on Theorem 7 and for the same reason, the physical state not being recoverable as it stood; a location the system reifies at no key lies outside the calculus altogether (Definition 56), and Section 6.1 is where a system decides what to reify.

这两个结果比较的是 table, 因而其断言范围受状态 key 所绑定的内容限制; 在每个 binding 内部, 又受该 key 的操作诱导出的 ≃k 限制. 每个 binding 只能恢复到 key 的等价关系所忽略的差异为止: 单调 allocator 不会倒退, heap 的布局在 free 后不会复原, 已发送的消息也不会被收回. 这与第 3.3.2 节对定理 7 设置的边界相同, 原因同样是物理状态无法原样恢复. 系统没有通过任何 key 具体化的位置完全处于本演算之外（定义 56）; 系统应具体化哪些内容由第 6.1 节讨论.

The results above therefore assume nothing of the sequence. The witness and respect conditions of ℑ𝑑∪𝑝

Γ are Lemma 57, pairwise independence is Lemma 66, and both rest on the components alone: Definition 56 fixes the form of every effect function, the effect function’s witness holds each returned inverse to reverting, and the coeffect’s witness holds each key to commutativity (Definition  46), an interface property Definition  31 turns into a design procedure.

因此, 上述结果不对步骤序列作额外假设. ℑΓ 的 witness 与 respect 条件由引理 57 给出, 成对 independence 由引理 66 给出, 而两者都只依赖组件本身: 定义 56 固定每个 effect function 的形式; effect function 的 witness 保证每个返回的 inverse 确实执行撤销; coeffect 的 witness 保证每个 key 满足交换性（定义 46）. 定义 31 又把这一接口性质转化为设计流程.

4.3.3. Spatial Composability

Local spatial composability holds a component to its own specification, activating it only where its dependencies are provided and classifying every context change against them (Section 3.2.2). The global form adds what quantifies over other fibers: a provider withdraws a binding only after every dependent that resolved it has deactivated, and the resolution a transition installs its effects against does not shift under it. Two properties of the coeffect side deliver the two, and they are proved together, being two halves of one invariant, namely the fixity of 𝜔𝑛 over an episode that Lemma 59(2) establishes. The ordering theorem is what that fixity delivers over the part of the episode in which 𝑛 is 𝖠𝖼𝗍𝗂𝗏𝖾 and then 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀, and the coherence theorem what it delivers over the part in which 𝑛 is installing its effects.

局部空间组合性要求组件遵守自身 specification: 只有依赖得到提供时才激活, 并依据这些依赖对每次 context 变化分类（第 3.2.2 节）. 全局形式还加入对其他 fiber 的量化要求: provider 只有在所有解析到它的 dependent 都停用后才能撤回 binding; transition 安装 effect 时所依据的 resolution 不能在过程中发生漂移. coeffect 一侧的两个性质分别提供这两项保证, 且二者作为同一不变量的两半一并证明, 即引理 59(2) 建立的 episode 内 𝜔n 固定性. ordering theorem 给出该固定性在 𝑛 先处于 Active、再处于 Unloading 的 episode 区间内的后果; coherence theorem 则给出它在 𝑛 安装 effect 的区间内的后果.

Theorem 70. (Ordering.) A fiber begins a transition only where its dependencies are provided:

step𝑡= L-Begin(𝑚) ⇒𝛾𝑡⊧𝑑𝑚 (57)

Let further [𝑏′, 𝑢′] be an episode of 𝑚 with 𝜔𝑏′

𝑚(𝑘) = 𝑛 for some 𝑚≠𝑛 and 𝑘∈𝑑𝑚, let [𝑏, 𝑢] be the episode of 𝑛 containing 𝑏′, and let 𝑡 range over [𝑏′, 𝑢′]. Then

1. 𝜔𝑡 𝑚(𝑘) = 𝑛; 2. 𝑏< 𝑏′, and 𝑢′ < 𝑢 if [𝑏, 𝑢] closes; 3. 𝑘∈dom(𝜎𝑡 𝑛), and 𝜎𝑡

𝑛(𝑘) moves only by operations at 𝑘 of fibers declaring 𝑘.

Proof. The first claim is the premise target𝑡

𝑚≠⊥ of L-Begin, which by Definition 53 gives 𝛾𝑡⊧ 𝑑𝑚.

(1) is Lemma 59(2).

47

<!-- page 48 of 92 -->

For (2), the L-Begin at 𝑏′ −1 writes 𝜔𝑏′

𝑚= target𝑏′−1

𝑚 , whose values are providers, so 𝜃𝑏′

𝑛= 𝖠𝖼𝗍𝗂𝗏𝖾(−, −); the L-Begin at 𝑏−1 leaves 𝜃𝑏

𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −, −), so 𝑏≠𝑏′ and hence 𝑏< 𝑏′, both episodes opening by Definition 58. Let [𝑏, 𝑢] close and suppose 𝑢≤𝑢′. Then 𝑢∈[𝑏′, 𝑢′], so installed𝑢

𝑚 and, by (1), 𝜔𝑢

𝑚(𝑘) = 𝑛; that is relied𝑢

𝑛, which the L-Unload at 𝑢 denies. Hence 𝑢′ < 𝑢.

For (3), 𝑛 is the provider of 𝑘 at 𝛾𝑏′, so 𝑘∈dom(𝜎𝑏′

𝑛). No L-Unload of 𝑛 falls in [𝑏′, 𝑢′]: where [𝑏, 𝑢] closes it falls at 𝑢> 𝑢′ by (2), and where it does not, Lemma 59(4) leaves 𝑛 with no L-Unload at all. Since 𝜃𝑏′

𝑛= 𝖠𝖼𝗍𝗂𝗏𝖾(−, −), Table 1 therefore leaves L-Leave as the only rule 𝑛 can be acted on by within [𝑏′, 𝑢′], and its Ψ𝑡 is idΓ, so 𝑛 withdraws nothing and dom(𝜎𝑛) is constant there by Lemma 59(1). What a step of another fiber may move is values at keys its own declarations name (Definition 56), so a write to 𝜎𝑛(𝑘) is an operation at 𝑘 of a fiber with 𝑘 in its specification. □

A transition spread over steps could otherwise install effects computed against a resolu­ tion that has changed under it, and two premises prevent that. L-Iter and L-Finish carry target𝑛(𝛾) = 𝜔, so a transition proceeds only while its committed view is still its target view, and L-Divert carries the negation, so any change to the target view takes the fiber out of the transition. The two directions of change are not distinguished: a component whose dependency has gone and one whose dependency has been replaced leave by the same route, because a target view that has become ⊥ and one that has become some other fiber are equally unequal to 𝜔.

否则, 一个跨越多个步骤的 transition 可能安装基于旧 resolution 计算的 effect, 而该 resolution 已在执行期间改变. 两个前提防止这种情况. L-Iter 与 L-Finish 带有 targetn(γ)=ω, 所以只有 committed view 仍等于 target view 时 transition 才继续; L-Divert 带有其否定条件, 因而 target view 的任何变化都会让 fiber 离开当前 transition. 两种变化方向不作区分: 依赖消失与依赖被替换的组件都沿同一路径退出, 因为 target view 变成 ⊥ 或变成另一个 fiber 都同样不等于 ω.

The landing alternative of L-Divert is what stops this from being a guarantee about every step: the iteration it lands installs an effect computed against a resolution that no longer holds. What the rules deliver is therefore a disjunction, and the second branch is what makes the first safe.

L-Divert 的 landing 分支使上述性质不能成为对每一步的绝对保证: 它所落地的 iteration 会安装一个根据已不再成立的 resolution 计算出的 effect. 因此, 规则给出的是一个析取结论, 而第二个分支正是保障第一个分支安全的机制.

Theorem 71. (Resolution coherence.) Let an episode [𝑏, 𝑢] of 𝑛 open at 𝑏 with 𝜔𝑏

𝑛= 𝜔. Then 𝜃𝑛 is 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −, −) on an initial interval [𝑏, 𝑟] of the episode, and every iteration of the transition runs against the one resolution 𝜔:

∀𝑡∈[𝑏, 𝑟]. step𝑡∈{L-Iter(𝑛), L-Finish(𝑛)} ⇒target𝑡

𝑛= 𝜔 (58)

Where the fiber leaves that interval, so that 𝑟< 𝑢, exactly one of the following holds:

1. step𝑟= L-Finish(𝑛) and 𝜃𝑟+1 𝑛 = 𝖠𝖼𝗍𝗂𝗏𝖾(−, 𝜔); 2. step𝑟= L-Divert(𝑛), and the episode closes at some 𝑢> 𝑟 with 𝛾𝑢+1 ≃𝐾(Ψ𝑡𝑙∘⋯∘ Ψ𝑡1)(𝛾𝑏) as in Corollary 69.

Proof. The L-Begin at 𝑏−1 writes 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀, and by Table 1 it is the one rule leading into that lifecycle state; its premise 𝜃𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 and Lemma 59(4) put any second application of it outside the episode. So 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 occupies an initial interval [𝑏, 𝑟] of [𝑏, 𝑢] and is not re-entered. The first claim is then the premise target𝑛(𝛾) = 𝜔′ that Table  1 gives L-Iter and L-Finish, together with 𝜔′ = 𝜔 by Lemma 59(2).

For the dichotomy, step𝑟 is a rule whose premise has 𝜃𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −, −) and whose conclusion does not, of which Table 1 offers L-Finish and L-Divert; the first lands in 𝖠𝖼𝗍𝗂𝗏𝖾(−, 𝜔) and the second in 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, 𝜔), from which Lemma 59(4) makes an L-Unload the only exit and Corollary 69 supplies the equation. The iteration a landing L-Divert contributes is one of 𝑛’s own, hence among the maps that accumulator withdraws. Where instead 𝑟= 𝑢, the sequence ends with the transition still in flight and the first claim is all that is asserted. □

48

<!-- page 49 of 92 -->

4.3.4. Progress

A guard that defers a provider’s withdrawal until its dependents are gone delivers Theorem 70 only if it eventually releases. One relation on the fibers of a registry carries the argument.

把 provider 的撤回推迟到 dependent 全部离开之后的 guard, 只有最终能够解除时才能实现定理 70. 证明依靠 registry 中 fiber 之间的一种关系.

Definition 72. The precedence relation on the names of a registry is

𝑛≺𝑚≔𝑝𝑛∩𝑑𝑚≠⌀ (59)

so that 𝑛 may provide a key 𝑚 declares. It reads 𝑑 and 𝑝 alone, which by Lemma 59(5) come into existence with a fiber’s entry and are never written again.

这表示 𝑛 可以提供 𝑚 所声明的 key. 该关系只读取 d 与 p; 根据引理 59(5), 二者随 fiber entry 一同产生, 此后不再改写.

Theorem 73 and Theorem 80 are established on the hypothesis that ≺ is acyclic, which is an assumption and not something the definition delivers, 𝑛≺𝑛 holding of a component that declares a key it provides itself. What ≺ orders is the two fibers’ activations and not their lifetimes: 𝑛≺𝑚 says that 𝑛 has to become 𝖠𝖼𝗍𝗂𝗏𝖾 before 𝑚 can, whereas that a provider outlives its consumer is Theorem 70(2), a theorem about the guarded calculus.

定理 73 与定理 80 都以 ≺ 无环为前提. 这是额外假设, 并非定义本身能够保证; 若组件声明自己提供的 key, 就会出现 𝑛≺𝑛. ≺ 排列的是两个 fiber 的激活顺序, 而不是生命周期: 𝑛≺𝑚 表示 𝑛 必须先于 𝑚 进入 Active; provider 比 consumer 活得更久则来自定理 70(2), 是关于带 guard 演算的结论.

A fiber’s target view answers to the fiber that created it as well as to its providers. What a creator writes is 𝜏𝑛, through the primitive of Definition 52, and 𝜏 is monotone by Lemma 59(5). A creator can therefore turn its child’s target view at most once over that child’s whole existence.

fiber 的 target view 同时响应创建它的 fiber 与它的 provider. creator 通过定义 52 的 primitive 写入 τn, 且由引理 59(5), τ 是单调的. 因此, 在 child 的整个存续期间, creator 最多只能使其 target view 改变一次.

Progress is a claim that some rule applies, so it is formulated over the rules a host must offer: L-Begin, L-Leave, L-Unload, the landing rules L-Iter and L-Finish, and L-Divert. It appeals to the aborting alternative of L-Divert nowhere, which Section 4.4 puts to use.

Progress 声称总有某条规则可以应用, 因此它基于 host 必须提供的规则表述: L-Begin、L-Leave、L-Unload、负责落地的 L-Iter 与 L-Finish, 以及 L-Divert. 证明完全不依赖 L-Divert 的 aborting 分支, 第 4.4 节将利用这一点.

Theorem 73. (Progress.) Assume ≺ acyclic, len(𝑒𝑛) ≤𝐾 for every 𝑛, and the set 𝑁 of names the sequence ever holds (Definition 65) finite; and let every step apply a lifecycle rule. Write 𝑆(𝑛) for the number of steps acting on 𝑛 and

𝑉(𝑛) ≔|{𝑡: target𝑡

𝑛≠target𝑡+1

𝑛 }| (60)

for the number of times its target view turns. Then

1. (No deadlock.) ¬ quiet𝑡 implies that some lifecycle rule applies at 𝛾𝑡; 2. (Termination.) 𝑆(𝑛) ≤(𝐾+ 3)(𝑉(𝑛) + 1), and both 𝑉(𝑛) and ∑𝑛𝑆(𝑛) are finite. Consequently every maximal sequence of lifecycle steps ends in a quiescent state.

Proof. No deadlock. Let ¬ quiet𝑡, so some fiber 𝑛 satisfies neither clause of the quiet of Defini­ tion 53. Reading Table 1 against the four kinds it can then be:

• 𝜃𝑡 𝑛= 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 with target𝑡

𝑛≠⊥: L-Begin applies; • 𝜃𝑡 𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −, 𝜔𝑛) with target𝑡

𝑛= 𝜔𝑛: whichever of L-Iter and L-Finish the value of 𝑖𝑡

𝑛(𝛾𝑡) selects applies; • 𝜃𝑡 𝑛= 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −, 𝜔𝑛) with target𝑡

𝑛≠𝜔𝑛: L-Divert applies, landing that iteration rather than aborting it; • 𝜃𝑡 𝑛= 𝖠𝖼𝗍𝗂𝗏𝖾(−, 𝜔𝑛) with target𝑡

𝑛≠𝜔𝑛: L-Leave applies. Let no fiber be of any of these kinds, leaving some 𝑚0 with 𝜃𝑡

𝑚0 = 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀(−, −). Construct 𝑚0, 𝑚1, … as follows: given 𝑚𝑗 in 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀, either ¬ relied𝑡

𝑚𝑗, in which case L-Unload applies to 𝑚𝑗 and the construction stops, or there are 𝑚𝑗+1 ≠𝑚𝑗 and 𝑘𝑗 with installed𝑡

𝑚𝑗+1 and 𝜔𝑡

𝑚𝑗+1(𝑘𝑗) = 𝑚𝑗. In the latter case

𝑘𝑗∈𝑑𝑚𝑗+1 ∩dom(𝜎𝑡

𝑚𝑗) ⊆𝑑𝑚𝑗+1 ∩𝑝𝑚𝑗

49

<!-- page 50 of 92 -->

the second membership being Theorem 70(3) at the episode of 𝑚𝑗+1 that 𝑡 lies in, so that 𝑚𝑗≺ 𝑚𝑗+1. Moreover target𝑡

𝑚𝑗+1 ≠𝜔𝑡

𝑚𝑗+1: an 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 fiber is outside the union defining 𝜎𝛾, so 𝑘𝑗 at 𝛾𝑡 is unprovided or provided by a fiber other than 𝑚𝑗. Were 𝑚𝑗+1 in 𝖠𝖼𝗍𝗂𝗏𝖾 or 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 it would then be of one of the four kinds excluded, so it is in 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 and the construction continues. The 𝑚𝑗 are ≺-increasing, hence distinct by acyclicity, and dom(𝐹𝑡) is finite, so the construction stops.

Termination. Two claims bound 𝑆(𝑛).

(A) Over a maximal interval on which target𝑡

𝑛 is constant at 𝜔∗, at most 𝐾+ 3 steps act on 𝑛. Reading the 𝜃𝑛 columns of Table 1, from 𝖠𝖼𝗍𝗂𝗏𝖾(−, 𝜔) with 𝜔≠𝜔∗ the fiber takes an L-Leave and an L-Unload and then, if 𝜔∗≠⊥, an L-Begin and at most len(𝑒𝑛) ≤𝐾 landings; from 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 against an 𝜔≠𝜔∗ it takes an L-Divert in place of the L-Leave, and from any other state a suffix of that sequence. No further L-Divert or L-Leave falls in the interval, the 𝜔 that the L-Begin writes being target𝑡

𝑛= 𝜔∗ itself, and at 𝖠𝖼𝗍𝗂𝗏𝖾(−, 𝜔∗) and at 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 with 𝜔∗= ⊥ no rule applies at all.

(B) If target𝑡

𝑛≠target𝑡+1

𝑛 and step 𝑡 acts on 𝑚, then either 𝑚≺𝑛 or step 𝑡 writes 𝜏𝑛. By Definition 53 the value of target𝑛 is a function of 𝜏𝑛, of the lifecycle states, and of the domains of the providers’ tables, never of a bound value; a provider satisfies 𝑘∈dom(𝜎𝑚) ∩𝑑𝑛 and hence 𝑚≺𝑛, and a table’s domain changes only at a step acting on its own fiber by Lemma 59(1). Acyclicity gives 𝑚≠𝑛 in the first case, and the monotonicity of Lemma 59(5) admits the second at one 𝑡 per fiber.

By (A) the interval count bounds 𝑆(𝑛) as 𝑆(𝑛) ≤(𝐾+ 3)(𝑉(𝑛) + 1), and by (B) each turn of target𝑛 either consumes a step of a fiber strictly ≺-below 𝑛 or is the one turn 𝜏𝑛 affords, so 𝑉(𝑛) ≤1 + ∑𝑚≺𝑛𝑆(𝑚). Since ≺ is acyclic and 𝑁 is finite, the recursion

𝐵(𝑛) ≔(𝐾+ 3)(2 + ∑

𝐵(𝑚))

𝑚≺𝑛

is well founded and defines 𝐵 with 𝑆(𝑛) ≤𝐵(𝑛); hence 𝑉(𝑛) is finite and ∑𝑛𝑆(𝑛) ≤∑𝑛𝐵(𝑛). By (1) a sequence that cannot be extended is quiescent. □

Finiteness of 𝑁 is assumed rather than derived, and one condition on the components delivers it. The components a host holds are finitely many programs given before anything runs, so if no component can instantiate, however indirectly, a fiber of a component that instantiates one of its own, the instantiations form a tree of bounded depth, and len(𝑒𝑛) ≤𝐾 bounds its branching. What the assumption rules out is a component that instantiates itself without bound.

N 的有限性是一个假设, 不是推导结果, 但可以由组件条件保证. host 持有的是运行前给定的有限程序集合; 若任何组件都不能直接或间接实例化一个最终回到自身组件的 fiber, 实例化关系就形成有界深度的树, 而 len(en)≤K 限制其分支数. 该假设排除的是组件无界地实例化自身.

The target records the providing fiber rather than a boolean, and under the single-source discipline of O-Insert the two drive the same transitions, a key having one possible provider there. The view supplies the vocabulary of the results above, Theorem 70 and Theorem 71 both speaking of the resolution a fiber activated against, and it is what makes those results survive the scoped resolution of Section 3.2.3, under which one key resolves to different providers in different realms and the provisions no longer force the view. The implementation carries that scoping and holds the view in fiber.committed (Section 5.1.3).

target 记录具体的 providing fiber, 而不是 boolean. 在 O-Insert 的单一来源纪律下, 二者驱动相同的 transition, 因为一个 key 只可能有一个 provider. view 为上述结果提供了表达方式: 定理 70 与定理 71 都讨论 fiber 激活时采用的 resolution. 它也使这些结果在第 3.2.3 节的 scoped resolution 下仍然成立; 在该机制中, 同一 key 可在不同 realm 解析到不同 provider, provision 不再唯一决定 view. 实现保留这种 scope, 并把 view 存放在 `fiber.committed` 中（第 5.1.3 节）.

50

<!-- page 51 of 92 -->

4.3.5. Confluence

The results so far are about individual fibers. The property that characterizes the system as a whole is that its dynamic history leaves no trace: whatever sequence of activations and deacti­ vations a running system has been through, the state it quiesces at is the one the same insertions and retirements would have produced had each component that ends up active been loaded once, in dependency order, and none ever unloaded. The lifecycle relation is confluent, and the normal form it converges on is the statically assembled one. This is the analogue, for dynamic composition, of the consistency with a from-scratch evaluation that change propagation estab­ lishes for incremental computation [47].

截至目前的结果都针对单个 fiber. 刻画整个系统的性质是动态历史不留下痕迹: 无论运行系统经历怎样的激活与停用序列, 它最终静止的状态都等于如下静态过程的结果——保持相同的 insertion 与 retirement, 按依赖顺序把最终活跃的每个组件只装载一次, 且从不卸载. lifecycle relation 是 confluent 的, 其收敛到的 normal form 就是静态组装形式. 对动态组合而言, 这对应于 change propagation 为增量计算建立的“与从头求值一致”性质 [47].

The claim is about ⟶ alone. Orchestration steps are inputs, and two sequences given different inputs land in different places for no interesting reason; what is at issue is whether the lifecycle rules, which are nondeterministic in which fiber steps next and in which exit a 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 fiber takes, can be made to disagree. Which fiber provides a key is not among the choices, a key having one possible provider (Definition 50), so the schedule picks orders and exits and nothing else.

该结论只针对转移关系 ⟶. orchestration step 是输入, 输入不同的两个序列自然会到达不同位置, 这并非关注点. 真正的问题是 lifecycle rule 是否会因下一步选择哪个 fiber、或 Reloading fiber 选择哪个出口的非确定性而产生不一致. 哪个 fiber 提供 key 并不属于可选项, 因为一个 key 只有一个可能的 provider（定义 50）; 调度只选择顺序与出口.

Three lemmas are needed first. The first fixes the set of fibers that end up 𝖠𝖼𝗍𝗂𝗏𝖾 without reference to any sequence of steps, which is what makes it a function of the input rather than of the schedule.

先需要三个引理. 第一个引理在不引用任何具体步骤序列的情况下确定最终进入 Active 的 fiber 集合, 从而使该集合成为输入的函数, 而不是调度顺序的函数.

Definition 74. A fiber is supported at 𝛾 when it is not retired, the fiber instantiating it is supported, and every key it declares is provided by a supported fiber. The support relation on dom(𝐹𝛾) is the union of the two relations those clauses read,

𝑚⊲𝑛≔𝑚≺𝑛∨𝜋𝑛= 𝑚 (61)

and where it is well founded (Lemma 75) we write 𝐴 for the support set, the fibers supported at 𝛾:

𝑛∈𝐴≔¬𝜏𝑛∧(𝜋𝑛= 𝗋𝗈𝗈𝗍∨𝜋𝑛∈𝐴) ∧∀𝑘∈𝑑𝑛. ∃𝑚∈𝐴. 𝑘∈𝑝𝑚 (62)

where 𝜋𝑛= 𝗋𝗈𝗈𝗍 marks a fiber the orchestrator inserted and 𝜋𝑛 otherwise the fiber whose activation instantiates 𝑛. The clauses read no field but 𝜏, 𝜋, 𝑑, 𝑝. Both halves relate a fiber to one immediately below it, a parent rather than an ancestor and a direct provider rather than a transitive one, since that is what the clauses read; where the results below want an order they take the transitive closure, whose minimal elements, maximal elements, and linearizations are those of ⊲.

其中, πn=root 表示该 fiber 由 orchestrator 插入; 否则 πn 表示其 activation 实例化 𝑛 的 fiber. 这些 clause 只读取 τ、π、d、p. 两部分都把 fiber 与紧邻其下的一项关联: parent 而非任意 ancestor, direct provider 而非 transitive provider. 后文需要顺序时取该关系的传递闭包, 其极小元素、极大元素与线性化即 ⊲ 的对应结果.

The clauses refer to 𝐴 itself, so the definition is a recursion along ⊲, and it is the following that makes it one with a solution.

这些 clause 又引用 A 自身, 因此该定义是沿 ⊲ 的递归; 下面的结果保证这一递归存在唯一解.

Lemma 75. (Support is well founded.) Let ≺ be acyclic and let 𝛾 be reached by a sequence of steps. Then ⊲ is well founded, and 𝐴 is the one solution of Definition 74, a function of 𝜏, 𝜋, 𝑑, and 𝑝 alone.

Proof. Order the names of dom(𝐹𝛾) by the index of the O-Insert that introduced each, which Definition 58 supplies by starting the sequence at an empty registry. The parent half of ⊲ descends in that index: an O-Insert has 𝜋∈dom(𝐹𝛾) as a premise, so a parent pointer names a fiber introduced earlier, and iterating it reaches the whole ancestry of a name in finitely many steps. A cycle therefore has to use ≺, and since ≺ is acyclic it has to mix the two, which needs some 𝑚 to declare a key that a fiber of 𝑚’s own subtree may provide. Such a fiber is instantiated

51

<!-- page 52 of 92 -->

by an activation of 𝑚 or of one of 𝑚’s descendants, hence at a step after the L-Begin of 𝑚; that L-Begin has 𝛾⊧𝑑𝑚 as a premise, so a fiber providing the key is 𝖠𝖼𝗍𝗂𝗏𝖾 already before it, and clause (2) of Definition 63 leaves the key no second possible provider. The fiber that would close the cycle is therefore never introduced, and the edge is absent from dom(𝐹𝛾). A well- founded recursion has one solution, and the clauses read the four fields alone. □

The last clause reads 𝑝, the keys a component may provide, whereas the target reads dom(𝜎𝛾), the keys its fibers have installed, and Definition 48 relates the two by dom(𝜎𝑛) ⊆ 𝑝𝑛 alone. The support set therefore over-approximates the 𝖠𝖼𝗍𝗂𝗏𝖾 fibers in general, and the condition that closes the gap is the following.

末个 clause 读取 p, 即组件可能提供的 key; target 则读取 dom(σγ), 即 fiber 实际安装的 key. 定义 48 只通过 dom(σn)⊆pn 关联二者. 因此 support set 通常是 Active fiber 的过近似, 下面的条件将弥合这一差距.

Definition 76. A component (𝑑, 𝑝, 𝑒) is total on its provision when an activation of it that finishes has installed every key of 𝑝, so that dom(𝜎𝑛) = 𝑝𝑛 at every 𝖠𝖼𝗍𝗂𝗏𝖾 fiber instantiating it.

This is a condition on the components alone, mentioning no lifecycle state and no step, and independence (Lemma 66) already bounds how far it can fail: were a component to install a key only at context states another component’s effects reach, its forward map would not commute with that component’s, so the keys a fiber installs are fixed by its component rather than by the schedule. What totality adds is that the fixed set is all of 𝑝 rather than a proper subset of it.

这是只针对组件的条件, 不涉及 lifecycle state 或步骤. independence（引理 66）已经限制了它的失败程度: 若某组件只在另一组件 effect 能触及的 context state 上安装 key, 它的 forward map 就不会与另一组件的 map 交换. 因而 fiber 安装哪些 key 由组件固定, 而非由调度决定. totality 进一步要求这个固定集合等于整个 p, 而不是其真子集.

Lemma 77. (Support at quiescence.) Let ≺ be acyclic, let quiet(𝛾), and let every component of 𝛾 be total on its provision (Definition 76). Then the support set is the set of 𝖠𝖼𝗍𝗂𝗏𝖾 fibers:

𝐴= {𝑛: 𝜃𝑛= 𝖠𝖼𝗍𝗂𝗏𝖾(−, −)} (63)

Proof. Write 𝐴′ for the right-hand side. The quiet of Definition 53 leaves 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 and 𝖠𝖼𝗍𝗂𝗏𝖾 as the only states and reads

𝑛∈𝐴′ ⟺target𝑛(𝛾) ≠⊥

By Definition 53 the right side holds exactly when ¬𝜏𝑛 and every 𝑘∈𝑑𝑛 lies in dom(𝜎𝛾), and dom(𝜎𝛾) = ⋃𝑚∈𝐴′ 𝑝𝑚 by Definition 76. The middle clause is the one the target no longer carries, and instantiation supplies it: a fiber with 𝜋𝑛≠𝗋𝗈𝗈𝗍 is instantiated only by an activation of 𝜋𝑛, and if 𝜋𝑛∉𝐴′ then 𝜋𝑛 is not 𝖠𝖼𝗍𝗂𝗏𝖾, so its accumulator has run and retired 𝑛 by Definition 52, giving 𝜏𝑛. Hence 𝐴′ satisfies the clauses of Definition  74, and Lemma  75 gives them one solution, so 𝐴= 𝐴′. □

Lemma 78. (Transposition.) Let 𝐹𝑡 be well formed and let steps 𝑡 and 𝑡+ 1 act on distinct fibers 𝑚 and 𝑛.

1. If both apply an activation rule, namely L-Begin, L-Iter, or L-Finish, 𝑒𝑚 and 𝑒𝑛 are independent (Definition 65), and step 𝑡+ 1 is applicable at 𝛾𝑡, then step 𝑡 is applicable at the state step 𝑡+ 1 produces from 𝛾𝑡, and the two orders reach the same 𝛾𝑡+2. 2. If step 𝑡 applies an activation rule at 𝑚, step 𝑡+ 1 an orchestration rule at 𝑛, and step 𝑡 does not instantiate 𝑛, then the same holds of the two.

Proof. For (1), by Table 1 the step of 𝑚 writes 𝜃𝑚 and, within Ψ𝑡∈𝔐(𝑒𝑚), the tables at keys of 𝑑𝑚∪𝑝𝑚. It therefore leaves 𝜃𝑛 and 𝑖𝑛 alone, and by clause (2) of Definition 42 leaves the inverse and the continuation that 𝑖𝑛 yields alone as well, so only the premises of step 𝑡+ 1 that mention target𝑛 remain to be checked. Its retirement half cannot fall, no activation rule writing a 𝜏. Its resolution half cannot move either: target𝑛 reads lifecycle states and table domains, of which Ψ𝑡 moves dom(𝜎𝑚) alone (Lemma 59(1)); step 𝑡+ 1 being applicable at 𝛾𝑡 puts every

52

<!-- page 53 of 92 -->

𝑘∈𝑑𝑛 in dom(𝜎𝑡), and clause (2) of Definition 63 makes the fiber providing such a 𝑘 the only one that can, so 𝑘∉𝑝𝑚 and no domain at a key of 𝑑𝑛 moves. The same argument in the other direction leaves step 𝑡 applicable. Finally Ψ𝑡∈𝔐(𝑒𝑚) and Ψ𝑡+1 ∈𝔐(𝑒𝑛) commute by clause (1) of Definition 42, and the two edits write control fields of distinct fibers, so the composite is the same in either order.

For (2), the orchestration step has Ψ𝑡+1 = idΓ by Table 1, so the two state maps commute outright, and its edit𝑡+1 writes 𝜏𝑛 or dom(𝐹𝛾) at 𝑛 alone, which the activation step neither reads nor writes: the premises of the latter read 𝜃𝑚, 𝑖𝑚, 𝜏𝑚, and target𝑚, and an O-Insert of a fresh 𝑛 moves no target, a fresh fiber providing nothing, whereas an O-Retire or O-Remove of 𝑛 leaves 𝜎𝛾 where it was, 𝑛 being 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 in the one case and unaffected in its table in the other. So step 𝑡 remains applicable. Conversely each premise of the orchestration step is either read at 𝑛, which step 𝑡 does not write, or is one of the two premises of O-Insert that a smaller registry only relaxes, whence its applicability at 𝛾𝑡+1 gives its applicability at 𝛾𝑡; here step 𝑡 not instantiating 𝑛 is what keeps 𝑛 present at 𝛾𝑡 where O-Retire and O-Remove require it. □

Lemma 79. (Deletion.) Let every component be total on its provision (Definition 76), let the sequence of steps reach a quiescent 𝛾𝑇, let [𝑏, 𝑢] be an episode of 𝑛 that closes, let no episode of any 𝑚 with 𝑛≺𝑚 close in the sequence, and let no fiber 𝑛 instantiates during [𝑏, 𝑢] have an episode. Write 𝑅 for the names those instantiations draw. Then deleting the steps that act on 𝑛 in [𝑏, 𝑢], together with every step acting on a name of 𝑅, leaves a sequence of steps reaching a state ≃𝐾-equal to 𝛾𝑇 and ≃-equal to it outside 𝑅.

Proof. The deleted steps leave the state where they found it. Let 𝑡1 < ⋯< 𝑡𝑙 be the steps of [𝑏, 𝑢] that act on fibers other than 𝑛. Corollary 69 reads

𝛾𝑢+1 ≃𝐾(Ψ𝑡𝑙∘⋯∘Ψ𝑡1)(𝛾𝑏)

whose right side is what the surviving steps of [𝑏, 𝑢] produce on their own, 𝛾𝑏−1 ≃𝐾𝛾𝑏 and their edits writing control fields of fibers other than 𝑛 that the deletion does not touch. By Table 1 the deleted steps of 𝑛 edit no field but 𝜃𝑛, which Lemma 59(4) restores to 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 at 𝑢 and which it held at 𝛾𝑏−1.

An invariant carries the suffix. Write 𝛾′𝑡 for the state the surviving steps reach at the point corresponding to 𝑡. We claim, for every 𝑡> 𝑢, that 𝛾𝑡≃𝐾𝛾′𝑡, that every name of 𝑅 is vestigial at 𝛾𝑡 and absent from 𝛾′𝑡, and that the two states agree on every field of every name outside 𝑅. At 𝑡= 𝑢+ 1 this is the paragraph above together with Definition 52, which leaves each name of 𝑅 retired by the accumulator that ran at 𝑢, 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 and holding an empty table, the fibers of 𝑅 having no episode by hypothesis. The induction step is Lemma 62(1) applied at each name of 𝑅 in turn: a step acting outside 𝑅 has the same premises at the two states, reaches states again ≃𝐾-equal, and leaves the entries of 𝑅 vestigial. A step acting on a name of 𝑅 is one of the deleted ones, and Lemma 62(2) is why it has to be deleted rather than kept, an O-Retire or O-Remove of an absent name having no fiber to act on; by (1) again such a step moves no field outside 𝑅, so dropping it preserves the invariant. Hence the final states are ≃𝐾-equal, and equal outside 𝑅.

No surviving step loses a premise. A step acting on 𝑚∉𝑅∪{𝑛} reads 𝑛 only through target𝑚(𝛾) or relied𝑚(𝛾). The first depends on 𝑛 when 𝑚 declares a key 𝑛 provides, hence 𝑛≺𝑚, and when 𝑛 instantiated 𝑚, which puts 𝑚∈𝑅. In the first case 𝑚’s episode does not close, by hypothesis, so it is open at 𝛾𝑇, where quiet gives 𝜔𝑚= target𝑇

𝑚 and Lemma 77 puts its values among the 𝖠𝖼𝗍𝗂𝗏𝖾 fibers, which 𝑛 is not; since a key has at most one possible provider, 𝑛 provided no key

53

<!-- page 54 of 92 -->

of 𝑑𝑚 at 𝑚’s L-Begin either. The second reads 𝑛 only through the values of 𝜔𝑛, and deleting the episode can only make relied false, which relaxes the guard on L-Unload rather than blocking it. What such a step reads of a name of 𝑅 is covered by the invariant. □

Theorem 80. (Confluence.) Let a sequence of steps reach a quiescent 𝛾𝑇, let every component be total on its provision (Definition 76), and let 𝐴 be as in Definition 74. Then

1. (Canonical form.) 𝛾𝑇 is reached, up to the names whose entries the reduction withdraws, from 𝛾0 by a sequence that takes the same orchestration steps in their original order, those at a fiber the orchestrator inserted preceding every lifecycle step and each of the rest following the step that instantiated the fiber it acts on, and that takes, for an enumeration 𝑛1, …, 𝑛𝑘 of 𝐴 linearizing ⊲, one episode of each 𝑛𝑖 in that order. 2. (Confluence.) Any two such sequences from 𝛾0 taking the same orchestration steps reach states related, after a renaming as in Lemma 61, by the ≃ of Definition 58 and hence by ≃𝐾.

Proof. For (1), the episodes of the sequence are of two kinds: those that close and those still open at 𝛾𝑇, which by quiet𝑇 and Lemma 77 are one episode of each fiber of 𝐴.

Closing episodes go first, by induction on their number. At each stage pick a closing episode of a fiber 𝑛 that is ⊲-maximal among the fibers whose episodes still close; one exists by Lemma 75 and the finiteness of 𝑁. The three hypotheses of Lemma 79 are then met. No 𝑚 with 𝑛≺𝑚 has a closing episode, by maximality. And no fiber 𝑛 instantiates during [𝑏, 𝑢] has an episode: such a fiber is retired by the accumulator that ran at 𝑢 (Definition 52) and by Lemma 59(5) stays retired, so its target view is ⊥ and Lemma 77 puts it outside 𝐴, whence it has no episode open at 𝛾𝑇; and ⊲ relates it to 𝑛 through its parent pointer, so by maximality it has no closing one either. The lemma removes the episode, together with the steps of the names it instantiated, leaving 𝛾𝑇 where it was up to those names. The measure drops by one, so no closing episode remains.

A fiber outside 𝐴 takes no lifecycle step. It has no open episode at 𝛾𝑇, by Lemma 77 and quiet𝑇, and no closing one now remains, so it has no episode at all and is 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 throughout; L-Begin is the only rule that applies there, and applying it would open an episode.

Orchestration steps go next. An orchestration step at a fiber the orchestrator inserted moves one place earlier past a lifecycle step of a different fiber by Lemma 78(2), which applies because a step of a fiber of 𝐴 instantiates no such name: instantiations draw fresh names, whereas the name here is one an O-Insert of the original sequence introduced. With a lifecycle step of the same fiber there is nothing to exchange, an O-Insert of 𝑛 already preceding every step of 𝑛 and an O-Retire or O-Remove of 𝑛 applying only outside 𝐴, which takes no lifecycle step. Moving each to the front in turn preserves their relative order. An orchestration step at a fiber some activation instantiated cannot go to the front, its premises requiring that fiber to be present, so it stays where the instantiation put it; it acts outside 𝐴 by the paragraph above and therefore commutes with everything between it and the instantiation by the same clause of Lemma 78.

Episodes are sorted and made contiguous, by induction on |𝐴|. Let 𝑛1 be ⊲-minimal in 𝐴. Then 𝑑𝑛1 = ⌀ and 𝜋𝑛1 = 𝗋𝗈𝗈𝗍, since Definition 74 puts a provider of a key of 𝑑𝑛1 and the fiber instantiating 𝑛1 in 𝐴 while ⊲ puts both below 𝑛1. So target𝑛1 reads no field of another fiber and, no orches­ tration step remaining to write 𝜏𝑛1 and no fiber below 𝑛1 remaining to retire it, is constant. Every step acting on 𝑛1 is an activation step, no episode closing, and its remaining premises read 𝜃𝑛1 and 𝑖𝑛1, which by Table 1 only 𝑛1 writes; each is therefore applicable at every earlier state, and Lemma 78 moves it one place earlier without moving the endpoint. Its independence

54

<!-- page 55 of 92 -->

hypothesis is met because no fiber entangled with 𝑛1 takes a step in the region crossed — 𝑑𝑛1 = ⌀ leaves 𝑛1 no provider, and a fiber declaring a key of 𝑝𝑛1 has target ⊥ until 𝑛1 is 𝖠𝖼𝗍𝗂𝗏𝖾, so its steps all follow the last step of 𝑛1 — and Lemma 66 makes every other pair independent. The number of steps of other fibers preceding a step of 𝑛1 drops by one at each application, so the episode of 𝑛1 becomes an initial contiguous block. The argument repeats on 𝐴∖{𝑛1} over the suffix that follows the block, where 𝑛1 is 𝖠𝖼𝗍𝗂𝗏𝖾 throughout and takes no further step, so it too contributes a constant target; the providers a later 𝑛𝑗 declares lie in earlier blocks and take no step in the suffix, so the entanglement argument above holds at every stage. The enumeration this produces linearizes ⊲ by construction.

For (2), both sequences reduce by (1) to a canonical one, and the two reductions run over the same 𝐴 up to a renaming. Definition 74 reads 𝜏, 𝜋, 𝑑, and 𝑝, of which the last three are written once with a fiber’s entry (Lemma 59(5)), so what has to be seen is that the same names come into existence carrying the same 𝑑, 𝑝, and 𝜋, and that the same names are retired. Insertions the two sequences share by hypothesis. Instantiations they share as well: an activation of a fiber of 𝐴 instantiates, at each of its iterations, the component the iterator names there, which the interleaved steps hold fixed — clause (2) of Definition 42 for a fiber not entangled with the activating one (Lemma 66), and Lemma 67(3) leaving an entangled fiber no Ψ ≠idΓ while the activation runs — so the tree of instantiations below an 𝐴-fiber is a function of that fiber’s component; the names those instantiations draw are not shared, and it is here that Lemma 61 is applied, matching the two trees by a bijection. And a retirement is either an orchestration step, shared, or the O-Retire an accumulator takes, which retires exactly the names the same activation instantiated. Two enumerations linearizing ⊲ differ by transpositions of incompa­ rable episodes; Lemma 78 leaves each endpoint unchanged up to the ≃ of Definition 58, and Lemma 60 carries the steps that follow across that relation, so the two canonical sequences agree. With the termination of Theorem 73, the lifecycle relation therefore has unique normal forms. □

The theorem is what licenses reasoning about a Cordis application as though it were statically assembled. An orchestrator that adds a component, removes it, replaces a provider, and undoes the replacement is guaranteed to arrive at the state it would have obtained by writing the final composition down at the outset, and a component author reasoning about which coeffects are in scope may reason about the quiescent state alone. It also delimits the guarantee: it speaks of the state, not of the emissions the system produced along the way, which is the distinction Section 6.1 draws between an acquisition, tracked inside the boundary, and an emission, which crosses it.

该定理使我们可以像分析静态组装系统一样分析 Cordis 应用. orchestrator 即使依次添加组件、移除组件、替换 provider, 再撤销替换, 也保证到达与一开始直接写下最终组合时相同的状态. 组件作者判断哪些 coeffect 位于 scope 内时, 只需考虑 quiescent state. 定理也划定了保证边界: 它讨论的是状态, 而不是系统在过程中产生的 emission. 第 6.1 节据此区分在边界内追踪的 acquisition 与穿过边界的 emission.

4.4. Extensions

We give four extensions of the calculus, each realized by the implementation of Section 5 and each leaving the results of Section 4.3 intact.

下面给出演算的四项扩展. 每项都由第 5 节的实现支持, 且不改变第 4.3 节的结果.

Asynchrony. The rules are synchronous: the state map Ψ𝑡 of a step (Definition  58) is applied whole at that step, and the environment moves only between one map and the next. In an asynchronous host the iterations and the inverses yield futures, so a map in flight runs to completion whether or not it is still wanted, and the aborting alternative of L-Divert is not one such a host can offer. Such a host is inertial: of L-Divert it takes the landing alternative alone, and a fiber whose target view turns during an iteration deactivates after that iteration lands, from 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀, holding the inverse it produced. Inertia is therefore a restriction on which alternative of L-Divert a host may take; every result of Section 4.3 quantifies over all sequences

55

<!-- page 56 of 92 -->

of steps and so covers the inertial ones, and Theorem 73 appeals to the aborting alternative nowhere, so a host bound by inertia still quiesces. An inverse in flight calls for no counterpart of inertia: the rules never decline a deactivation, 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 being left by L-Unload alone with no premise on the target view, and a step of another fiber falling within the accumulator’s application commutes with the inverses not yet applied, by the arguments Theorem 68 rests on (Definition 65, Lemma 67, Lemma 66), so an application spread over an interval reaches the state the one-step application reaches, up to ≃𝐾. A deactivation may also chain straight back into an activation: the accumulator runs whatever the target view has become, and from 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 an L-Begin may immediately follow, which is the mutual chaining of reload and unload in the implementation (Section 5.1.3).

**异步性.** 这些规则本来是同步的: 一个步骤的状态映射 Ψt 在该步骤中整体应用, 环境只在相邻映射之间变化. 异步 host 中, iteration 与 inverse 会产生 future, 已在执行的映射即使不再需要也会运行完成, 因而 host 无法采用 L-Divert 的 aborting 分支. 这种 host 具有 inertia: L-Divert 只能采用 landing 分支; 若 fiber 的 target view 在 iteration 期间变化, 它会先让该 iteration 落地并持有所得 inverse, 再从 Unloading 状态停用. 第 4.3 节的结果量化全部步骤序列, 因此覆盖这类 inertial 序列; 定理 73 也不依赖 aborting 分支, 所以受 inertia 限制的 host 仍会达到 quiescence. 正在执行的 inverse 不需要对称的 inertia 规则: 系统不会拒绝 deactivation, Unloading 只通过不检查 target view 的 L-Unload 离开; accumulator 应用期间插入的其他 fiber 步骤, 与尚未应用的 inverse 可交换. 因此跨一个时间区间完成的 application, 在 ≃K 意义下与一步完成到达同一状态. deactivation 还可立即接回 activation: accumulator 针对当前 target view 运行后, fiber 进入 Inactive, 随即可以执行 L-Begin. 这对应实现中 reload 与 unload 的相互链式调用（第 5.1.3 节）.

Failure. The effects a component installs reach outside the context that tracks them, and a location they reach may refuse: a port already bound, a file that is not there, a peer that does not answer. Refine the iterator so that an iteration may raise an error in place of yielding a triple, Γ →𝖤𝗂𝗍𝗁𝖾𝗋(Ξ, Γ × (Γ →Γ) × 𝖬𝖺𝗒𝖻𝖾(ℑ)) for a set Ξ of errors, the witness constraining the 𝖱𝗂𝗀𝗁𝗍 case alone, a raise having nothing to undo. A raise exits 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 by the route of an aborting L-Divert whose premise on the target view is dropped, the iteration rather than the environment choosing the abort: the fiber routes into 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 with the accumulator built up to the failing iteration, arrives at 𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝖾 having installed nothing (Corollary 69), and the exit writes the error as an outcome on the fiber. The outcome withholds re-entry: L-Begin is read as requiring an error-free fiber, so an effect function that raised is not retried against an unchanged environment, and quiet admits a failed fiber whatever its target view; the failure likewise stays on the fiber rather than propagating to its parent, leaving siblings running. A retry is a revision: the reinserted fiber of the Configuration paragraph starts without an outcome. Preservation and recovery hold unchanged, a raise leaving by the same 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 route every deactivation takes. Confluence excludes failed fibers, and has to: whether an iteration raises depends on the state it meets, so one schedule may fail a fiber where another completes it, and the two quiescent states then differ in that fiber’s lifecycle state and, by Corollary 69, in nothing else. The FAILED state of the implementation carries this outcome (Section 5.1.3).

**失败.** 组件安装的 effect 会越过追踪它的 context, 外部位置可能拒绝操作, 例如端口已被占用、文件不存在或 peer 无响应. 可以扩展 iterator, 允许 iteration 不返回 triple 而是抛出错误. witness 只约束 Right 情况, 因为抛错没有新 effect 可撤销. 抛错会沿去掉 target-view 前提的 aborting L-Divert 路径离开 Reloading; 此时是 iteration 而非环境选择 abort. fiber 带着失败前已积累的 accumulator 进入 Unloading, 撤销后在未安装任何内容的情况下到达 Inactive（推论 69）, 并把错误写为 fiber outcome. outcome 阻止重新进入: L-Begin 要求 fiber 无错误, 所以抛错的 effect function 不会在未改变环境中反复重试; quiet 也接受任意 target view 下的失败 fiber. 失败保留在当前 fiber, 不向 parent 传播, sibling 可以继续运行. retry 被视为 revision, 重新插入的 fiber 不带旧 outcome. preservation 与 recovery 不变, 因为 raise 仍沿所有 deactivation 采用的 Unloading 路径离开. confluence 必须排除失败 fiber: iteration 是否抛错取决于它遇到的状态, 不同调度可能使一个 fiber 在一边失败、另一边完成; 两个 quiescent state 此时只在该 fiber 的 lifecycle state 上不同. 实现中的 FAILED 状态承载这一 outcome（第 5.1.3 节）.

Isolation. Section  4.1 reads every key at one shared realm and names the relaxation a calculus carrying realms would make: provisions disjoint within a realm rather than outright, each declared key resolved against the realm of the fiber declaring it. For realms fixed at a fiber’s insertion, the relaxed calculus is the present one read at a larger key set. Take the key set to be 𝐾× 𝑅, each pair (𝑘, 𝑟) carrying the value set 𝒱︀𝑘 and the operations 𝒜︀𝑘 of its underlying key, so that ≃(𝑘,𝑟) is ≃𝑘, a key commutative in the sense of Definition 44 is commutative at every realm, and the coeffect at a pair inherits the witness of its underlying key (Definition 46). A fiber inserted under a realm table 𝜌 then declares and provides pairs, a key 𝑘 of its interface standing for (𝑘, 𝜌(𝑘)); the last premise of O-Insert, read at pairs, is disjointness within a realm, two fibers providing one key in different realms provide different pairs, and the one shared realm is the diagonal (𝑘, 𝑘), a key outside dom(𝜌) resolving to its own realm (Definition 24). Keys are as atomic to the rules as names: no rule computes one, inspects its structure, or relates two of them by anything but equality, so the rules and the results of Section 4.3 apply at 𝐾× 𝑅 as they stand. The reading stops at isolate itself (Definition 25), which reassigns 𝜌 on a running context: under the pairing a reassignment moves a declaration from one pair to another, and 𝑑𝑛 and 𝑝𝑛 are written once with a fiber’s entry (Lemma 59(5)), so a fiber whose realm turns at runtime is one whose interface has changed, a revision the Configuration paragraph carries. Interception (Definition 26) calls for no extension: metadata adjusts how a binding is used rather than what a key resolves to, is consulted when the binding is accessed, and is discarded with the context that carries it, so no premise reads it and no field of a fiber holds it.

**隔离.** 第 4.1 节把所有 key 放在一个共享 realm 中, 并指出带 realm 的演算可将“provision 全局互斥”放宽为“同一 realm 内互斥”, 每个声明 key 都相对于声明它的 fiber 所在 realm 解析. 若 realm 在 fiber 插入时固定, 放宽后的演算等价于在更大 key 集 K×R 上解释现有演算. pair (k,r) 继承底层 key 的 value set、operation、等价关系、交换性与 coeffect witness. 在 realm table ρ 下插入的 fiber 声明和提供 pair, 接口 key k 表示 (k,ρ(k)); O-Insert 的末个前提据此变成 realm 内互斥. 不同 realm 中提供同一 key 的两个 fiber 实际提供不同 pair, 单一共享 realm 则是对角形式 (k,k). 规则把 key 与 name 一样视为原子: 不计算 key、不检查其结构, 也不建立等式之外的关系, 因而第 4.3 节的规则与结果可原样应用于 K×R. 这一解释不覆盖 isolate 自身, 因为 isolate 会在运行中的 context 上重设 ρ, 相当于把声明从一个 pair 移到另一个 pair; 而 dn 与 pn 随 fiber entry 只写一次, 所以运行时 realm 改变意味着接口改变, 应由 Configuration 所述 revision 处理. interception 不需要扩出演算: metadata 只改变 binding 的使用方式, 不改变 key 的解析目标; 它在访问 binding 时读取, 并随承载它的 context 丢弃, 因而没有前提或 fiber field 需要持有它.

56

<!-- page 57 of 92 -->

Configuration. A component of the implementation takes a configuration, and instantiation binds the payload into the effect function the fiber runs (Section 5.1.3). The calculus therefore carries configuration inside 𝑒: one such component bound to two payloads is two components of Definition 48, differing in their effect functions. The declarative layer of Section 5.2.1 further lets the orchestrator revise a running fiber, replacing its configuration, reassigning its realms, or disabling and later re-enabling it. Each revision is a composite of the rules: disabling is an O-Retire, and every other revision retires the fiber, lets the lifecycle rules deactivate it, removes the entry, children before parent as O-Remove requires, and reinserts the fiber at the same name, with the new effect function, the new realm pairs, or, at a re-enablement, the component unchanged; the name may be reissued, no stale committed view naming a removed fiber (Section 4.3.1). Dependents follow unprompted: the guard on L-Unload orders the withdrawal after the deactivations it causes, and the target-view comparison reactivates each dependent once the reinserted fiber provides the keys again. Re-enablement takes the composite rather than a rule writing 𝜏 back to ⊥, for two reasons: Theorem 80 rests on a fiber an accumulator retires staying retired (Lemma 59(5)), and Definition 53 reads no parent pointer, so a fiber un- retired after the accumulator of the fiber that instantiated it has run would activate with its creator gone. The implementation keeps the same division: re-enabling an entry instantiates a fresh fiber, the entry being the identity that survives revision and the fiber the identity of one enablement. The composite is held to its endpoint rather than to its steps: by Theorem 80 the system quiesces where a load of the revised configuration from scratch would have left it, and that endpoint is what the loader’s shorter routes answer to, a new payload handed to a component that reloads only on a material change, a realm moved without reloading its provider (Section 5.2.1).

配置。实现中的组件接收一份配置，实例化会将载荷绑定到 fiber 运行的 effect 函数中（第 5.1.3 节）。因此，该演算体将配置携带在 𝑒 中：同一组件绑定两个载荷，就构成定义 48 中的两个组件，它们的 effect 函数不同。第 5.2.1 节的声明式层还允许编排器修改正在运行的 fiber：替换配置、重新分配 realm，或禁用后再启用它。每次修改都是若干规则的组合：禁用对应 O-Retire；其他修改则会 retire fiber，由生命周期规则将其停用，按 O-Remove 要求以子先于父的顺序删除条目，然后在同一名称下重新插入 fiber，使用新的 effect 函数、新的 realm 对；如果是重新启用，则组件保持不变。该名称可以重新发放，因为不会有指向已删除 fiber 的过时 committed view（第 4.3.1 节）。依赖项会自动跟随：L-Unload 的守卫条件使 withdrawal 排在它所引发的停用之后；当重新插入的 fiber 再次提供这些 key 时，target-view 比较会重新激活每个依赖项。重新启用采用这一组合过程，而不是用一条规则把 𝜏 写回 ⊥，原因有二：定理 80 依赖于被 accumulator retire 的 fiber 保持 retired（引理 59(5)）；而定义 53 不读取 parent 指针，因此，如果实例化该 fiber 的 fiber 已运行完 accumulator，再取消 retire 会让它在创建者已消失的情况下激活。实现保留了同样的划分：重新启用条目会实例化一个新 fiber；条目是经历修改后仍保留的身份，fiber 则是某次启用的身份。组合过程以终点而非中间步骤为准：根据定理 80，系统最终会静止在从零加载修改后配置所到达的状态；加载器的较短路径也以该终点为目标，例如将新载荷交给只在发生实质变化时才重载的组件，或在不重载 provider 的情况下移动 realm（第 5.2.1 节）。

5. Implementation and Case Study

5. 实现与案例

This section presents Cordis, which realizes the formal models of Section  3 as a practical programming abstraction. Cordis is a meta-framework of spatiotemporal composability: unlike application frameworks that target a specific domain (e.g., web routing, ORM, UI rendering), it prescribes no concrete scenario; its sole responsibility is to supply universal dynamic compo­ sition semantics. The implementation is layered into three tiers: (1) the core library (Section 5.1) implements the effect and coeffect systems directly; (2) the component loader (Section  5.2) extends the core with configuration reconciliation and hot module replacement; and (3) appli­ cation frameworks such as Koishi (Section 5.3) build domain-specific functionality on top of the former two tiers.

本节介绍 Cordis, 它把第 3 节的形式模型实现为实用编程抽象. Cordis 是时空组合性元框架. 它不同于面向 Web 路由, ORM 或 UI 渲染等领域的应用框架, 不规定具体场景, 唯一职责是提供通用动态组合语义. 实现分三层: (1) core library 直接实现 effect 与 coeffect system; (2) component loader 在 core 上加入配置协调与 hot module replacement; (3) Koishi 等应用框架在前两层上构建领域功能.

5.1. Core Library

5.1. 核心库

Table  2 summarizes the correspondence between theoretical constructs and their runtime counterparts. In particular, we use the runtime names introduced below throughout this section, reserving the theoretical symbols for the formal correspondence. We also write @@name for a framework-internal symbol key, so the brackets in ctx[@@store] denote symbol-keyed access to an opaque slot on the context, rather than indexing into a string-keyed map.

表 2 总结了理论构造与其运行时对应物之间的关系。本节以下统一使用下文引入的运行时名称，理论符号则仅用于表示形式对应。我们还用 @@name 表示框架内部的 symbol key，因此 ctx[@@store] 中的方括号表示通过 symbol key 访问 context 上的不透明 slot，而不是索引以字符串为 key 的 map。

57

<!-- page 58 of 92 -->

Theory (Section 3, Section 4) Implementation

Γ∞ ctx, the first-class context 𝛾∈Γ the context tree together with everything the running system has touched 𝔈Γ, ℑΓ Effect callback returning / yielding inverses effectΓ(𝑒) ctx.effect(callback)

Σ, Σiso, Σinter ctx[@@store], ctx[@@isolate], ctx[@@intercept] get(𝑘), set(𝑘, 𝑣) ctx.get(key), ctx.set(key, value) isolate(𝑘, 𝑟) ctx.isolate(key, realm)

intercept(𝑘, 𝜈) ctx.intercept(key, metadata)

⟨𝑑, 𝑝, 𝑒, 𝜋, 𝜎, 𝜏, 𝜃⟩ fiber, the instantiation of a component in ℭΓ dom(𝐹𝛾) enumerated through ctx.registry 𝑛: 𝔑 fiber.uid

𝑑: 𝔇Γ fiber.inject

𝑝: 𝔓Γ the component’s provide 𝑒: ℑ𝑑∪𝑝

Γ fiber.apply

𝜋: 𝔑 fiber.parent.fiber.uid, the fiber owning the context it was instantiated on derived realization (Definition 23) fiber.ctx, the child context the fiber runs in 𝜃 (Definition 49) fiber.state, the lifecycle state, whose LOADING is 𝖱𝖾𝗅𝗈𝖺𝖽𝗂𝗇𝗀 and whose FAILED carries the error outcome of Section 4.4 recover, accumulator 𝑔 fiber.dispose, the accumulator 𝜔 (Definition 49) fiber.committed, the committed view provider𝑘(𝛾) an Impl whose provider fiber is ACTIVE target(𝛾, 𝑛) fiber.target, recomputed by refresh (Algorithm 5), where ⊥ is INACTIVE 𝖥𝗎𝗍𝗎𝗋𝖾, inertia (Section 4.4) fiber.inertia, the handle of the transition in flight

O-Insert, O-Retire (Definition 52) ctx.use and the inverse of its callback (Algorithm 4) O-Remove the fiber dropped from its runtime, with uid cleared L-Begin, L-Iter, L-Finish execute’s iteration loop (Algorithm 1) L-Divert the guard failing at an iteration boundary (Algorithm 1), or

reload chaining into unload L-Leave refresh marking the fiber UNLOADING (Line 10) L-Unload unload and its inertial chaining (Algorithm 5) guard on L-Unload unload awaiting the notified dependents (Line 25) failure (Section 4.4) the error recorded on the fiber, with its target set to ⊥

Table 2 | Theory-to-implementation correspondence

The remainder of this section builds the core library from the bottom up. Section 5.1.1 realizes revertible effects, the sole primitive through which a context is mutated; Section 5.1.2 realizes reactive coeffects over it; Section 5.1.3 composes both into the component lifecycle; and Section 5.1.4 exposes the context-level operations built on them.

本节余下部分将自底向上构建核心库。第 5.1.1 节实现可撤销 effect，它是修改 context 的唯一原语；第 5.1.2 节在此基础上实现响应式 coeffect；第 5.1.3 节将两者组合为组件生命周期；第 5.1.4 节则公开建立在它们之上的 context 级操作。

58

<!-- page 59 of 92 -->

5.1.1. Effect Tracking

5.1.1. Effect 追踪

本节实现第 3.1 节的可撤销 effect. Cordis 的所有 context mutation 都经过唯一原语 `ctx.effect`: coeffect provision, component instantiation 及其他修改 context 的操作最终都归约成一次 `ctx.effect` 调用, 因而能在组件卸载时自动追踪并撤回. Runtime 不验证调用者给出的 inverse 是否正确; 这是 component author 必须履行的义务.

This section realizes revertible effects (Section 3.1). Every context mutation in Cordis flows through a single primitive, ctx.effect: coeffect provision, component instantiation, and every other context-mutating operation reduces to a ctx.effect call, so any operation performed through the context is automatically tracked and reverted upon component unloading. Oper­ ationally, ctx.effect is the realization of effectiter

Γ (Definition 18): it takes a callback of type ℑΓ and lifts it to ℑ𝜕Γ, yielding a dispose closure that, when invoked, reverts the effect. Cordis accepts both 𝔈Γ and ℑΓ through this one operation (ad-hoc polymorphism); we take the iterator form as representative, since a plain effect function is the degenerate iterator that yields a single inverse. What the operation does not check is the witness that 𝔈∗

Γ carries: the callback supplies an inverse, and that the inverse reverts the effect it accompanies is an obligation on the component author rather than a property the runtime verifies. Theorem 68 is where the calculus appeals to it, and Section 6.1 is where the obligation is delimited. The witness of a coeffect (Definition 46) is unchecked in the same way: that the operations published at a key commute is an obligation on the component providing it, discharged by the representation choice of Section 3.4.2.

Algorithm 1 shows the construction of ctx.effect. We write 𝑓∘𝑔 for the disposer that runs 𝑓 after 𝑔, and id for the no-op; prepending each new inverse therefore yields LIFO recovery.

Algorithm 1 Effect tracking

1 async function execute(callback, guard)

2 iter ← callback()

3 inverse ← id

4 while guard()

5 (value, done) ← await iter.next()

6 if value then inverse ← value ∘ inverse

7 if done then break

8 return inverse

9 function effect(ctx, callback)

10 armed ← true

11 task ← execute(callback, () ↦ armed)

12 async function dispose()

13 if not armed then return

14 armed ← false

15 recover ← await task

16 recover()

17 ctx.dispose ← dispose ∘ ctx.dispose

18 return dispose

The engine execute drives the callback as an effect iterator (ℑΓ, Definition 17) and folds the inverse yielded at each step into a single composite. Before each step it consults a caller- supplied guard; once the guard trips, iteration stops and only the inverses accumulated so far remain. This is the step-boundary interruption of Section 4.2.2: the 𝖬𝖺𝗒𝖻𝖾(ℑ) continuation is realized by the iterator’s done flag together with guard.

ctx.effect is a thin wrapper over execute that adds two things. First, self-disposal: the guard reports the armed flag, and the returned dispose flips armed to false, which simultaneously

59

`ctx.effect` 在操作语义上实现 Definition 18 的 effect iterator: callback 每次 yield 一个 inverse, `execute` 按 LIFO 顺序把它们折叠成 composite disposer. 每一步之前检查 guard; guard 失效便停止迭代, 只撤回已完成步骤. `ctx.effect` 再加入 self-disposal 与 parent composition. `armed` 同时中断 in-flight iterator 并保证 recovery 最多执行一次; dispose 被前置到 parent context 的 `ctx.dispose`, 让 child inverse 成为 parent 上的 tracked effect. Runtime 不验证 inverse 是否正确, 也不验证同一 coeffect key 上发布的操作是否交换, 这些都是 component author 必须满足的 witness obligation.

<!-- page 60 of 92 -->

halts any in-flight iteration and makes recovery fire at most once. Firing twice would apply an inverse at a state no application of the effect produced, where nothing holds it to reverting anything. Second, parent composition: dispose is prepended to the enclosing context’s accu­ mulated inverse ctx.dispose, so a child effect’s inverse is itself an effect on the parent, which is the recursive structure of 𝜕2Γ. The component level (Section 5.1.3) reuses the same execute with a guard that tests the stability of fiber.target instead of armed.

5.1.2. Coeffect Operations

5.1.2. Coeffect 操作

响应式 coeffect 由 context 上三个 symbol-keyed slot 实现: `@@store` 保存 realm 到 value 的 binding, `@@isolate` 保存 key 到 realm symbol 的映射, `@@intercept` 保存每个 key 的 metadata. `ctx.get(key)` 先解析 realm 再读取 value; provision 和 withdrawal 都通知 dependent 重新计算 target.

This section realizes reactive coeffects (Section 3.2). All coeffect operations act on three symbol- keyed slots that each context carries:

• @@store: the value store 𝜎: (𝑟: 𝑅) ⇀𝒱︀𝑟 from realm symbols to typed values; • @@isolate: the realm table 𝜌: Map(𝐾, 𝑅) from coeffect keys to realm symbols; • @@intercept: the interception table 𝜄: (𝑘: 𝐾) →ℳ︀𝑘 assigning each key its metadata.

The first two compose into the two-layer resolution 𝑘→𝜌(𝑘) →𝜎(𝜌(𝑘)): ctx.get(key) (Algorithm 2) reads the realm symbol 𝜌(𝑘) from @@isolate, then the bound value 𝜎(𝜌(𝑘)) from

@@store. The 𝜌 indirection lets isolation redirect a key to an independent binding, whereas

@@intercept is consulted only when a binding is accessed, adjusting how it is used rather than what it resolves to. We realize these operations in two parts: (1) provision and notification, which install or withdraw bindings and propagate the change to dependents; and (2) isolation and interception, which reshape how a key resolves.

Provision and notification. Since set(𝑘, 𝑣) has type 𝔈Σ (Section 3.1), coeffect provision is a ctx.effect call and inherits its automatic tracking and recovery. Algorithm 2 implements

ctx.set(key, value), the concrete set(𝑘, 𝑣): the callback binds a value into the store under the realm symbol 𝜌(𝑘), and the returned dispose function removes it. Both installation and removal invoke notify to propagate the change to dependent components.

Algorithm 2 Coeffect operations

1 function get(ctx, key)

2 realm ← ctx[@@isolate][key] ▷ 𝜌(𝑘)

3 return ctx[@@store][realm] ▷ 𝜎(𝜌(𝑘))

4 function set(ctx, key, value)

5 function callback()

6 realm ← ctx[@@isolate][key] ▷ 𝜌(𝑘)

7 ctx[@@store][realm] ← value ▷ 𝜎[𝜌(𝑘) ↦𝑣]

8 notify(ctx, [key])

9 return function()

10 delete ctx[@@store][realm] ▷ 𝜎∖𝜌(𝑘)

11 notify(ctx, [key])

12 return ctx.effect(callback)

Algorithm 3 propagates each binding change to dependents by testing, for each live fiber, whether a changed key appears in its fiber.inject and resolves to the same realm; if so, it calls

refresh (Section 5.1.3) to re-evaluate that fiber against the new state, and it returns the fibers it re-evaluated so that a caller can wait for them. This is the reactive classification of Definition 22: a change that flips satisfaction activates or deactivates the fiber, and refresh’s idempotence

60

`ctx.effect` 的第二项行为是 parent composition. child disposer 前置到外围 context 的累计 inverse, 形成递归 recovery 结构. component lifecycle 复用同一个 `execute`, 但 guard 从 `armed` 改为检查 `fiber.target` 稳定性.

coeffect 的 `@@store` 与 `@@isolate` 形成两层解析 $k\to\rho(k)\to\sigma(\rho(k))$. realm indirection 允许 isolation 把相同 key 指向独立 binding; `@@intercept` 只在读取时改变使用方式, 不改变解析目标. `ctx.set` 是 tracked effect: callback 安装 binding, inverse 删除 binding, 两边都调用 `notify`. `notify` 遍历 live fiber, 对声明 changed key 且解析到同一 realm 的 dependent 调用 `refresh`. satisfaction 翻转会激活或停用 fiber, 中性变化因 refresh 幂等而无害.

binding 只有在 provider fiber 为 ACTIVE 时才可用. provider 一进入 UNLOADING 就停止 providing, dependent 会在 binding 真正删除前计算出 unsatisfied target 并开始 teardown. isolation 与 interception 都派生 child context 并覆盖 inherited table, parent 不变, 所以丢弃 child 即完成 recovery, 不需要显式 inverse.

<!-- page 61 of 92 -->

renders a neutral change harmless. The interaction of this re-evaluation with diverse control flows is developed in Section 5.1.3.

Algorithm 3 Reactive notification

1 function notify(ctx, keys)

2 affected ← ⌀

3 for fiber in all_fibers do

4 for key in keys do

5 if key ∈ fiber.inject and fiber.ctx[@@isolate][key] = ctx[@@isolate][key] then

6 refresh(fiber)

7 affected ← affected ∪ {fiber}

8 break

9 return affected

A binding counts as available to a dependent only while the fiber that installed it is ACTIVE, so refresh resolves each declared key against an active provider rather than against the store alone. This is the provided by relation of Definition  53, and it is what makes a withdrawal visible to dependents one step before it happens: a provider that has entered UNLOADING has stopped providing, so its dependents recompute an unsatisfied target view and begin their own teardown while its bindings are all still in place.

Isolation and interception. The two operations do structurally the same thing: each derives a child context that adjusts one inherited table for key, leaving the parent untouched, so recovery is implicit: discarding the child context suffices, with no explicit inverse to run.

ctx.isolate(key, realm) overrides the realm mapping 𝜌 with realm, or a freshly generated symbol by default (realizing isolate, Definition  25), so two contexts that assign different symbols to the same key resolve to independent bindings. ctx.intercept(key, metadata) merges metadata into the interception table 𝜄 (realizing intercept, Definition 27): following that definition, the new metadata is combined with whatever the context already carries for key and takes priority over it.

5.1.3. Component Lifecycle

5.1.3. Component 生命周期

`ctx.use` 把 component 实例化成 fiber. Fiber 以 `parent` 形成 context tree, 以 `inertia` 保存正在进行的异步 transition. Component 的 inject specification 决定依赖, config 被绑定进 effect function. 实例化本身也是父 fiber 的 tracked effect, 因而父组件卸载时会把子 fiber 的 target 设为不可满足并触发 unload.

A component is instantiated as a fiber by ctx.use. This section gives the fiber (introduced in Section 5.1) operational meaning as the inertial state machine of Section 4.4. Two fields drive the algorithm below: fiber.parent, the parent context of fiber.ctx that forms the component hierarchy (the recursive structure of Γ∞, Section 3.3.1), and fiber.inertia, a handle to the in- flight asynchronous transition (or null if idle).

Algorithm  4 shows component instantiation. A component pairs a coeffect specification

component.inject (𝑑) with an effect function component.apply; instantiation binds the component’s config into fiber.apply (Line 9), the config-applied effect function (𝑒) that the lifecycle then runs. The callback function (Line 2) is the effect tracked in the parent fiber: when executed, it initiates the child’s lifecycle by calling refresh (Algorithm 5); when reverted, it forces the child’s target to ⊥ and triggers unload. This is the instantiation primitive of Defin­ ition  52, with callback as its O-Insert and the closure callback returns as its O-Retire: an instantiation is an ordinary tracked effect of the parent, so unloading a parent cascades to its children.

61

`ctx.use` 把 component 的 inject specification 与 apply function 实例化为 fiber. callback 启动 child lifecycle; callback 返回的 inverse 把 child target 设为 $\bot$ 并触发 unload. 因此 instantiation 本身就是 parent fiber 的普通 tracked effect, parent 卸载会自然级联到 children. `fiber.parent` 形成 context hierarchy, `fiber.inertia` 保存正在运行的 asynchronous transition.

<!-- page 62 of 92 -->

Algorithm 4 Component instantiation

1 function use(ctx, component, config)

2 function callback()

3 refresh(fiber)

4 return function()

5 fiber.target ← ⊥

6 unload(fiber)

7 fiber ← Fiber(parent: ctx, inject: component.inject)

8 fiber.ctx ← ctx[fiber ↦ fiber]

9 fiber.apply ← () ↦ component.apply(fiber.ctx, config)

10 ctx.effect(callback)

11 return fiber

Algorithm 5 realizes the inertial state machine of Section 4.4, in which reload and unload are inertial: once entered, a transition runs to completion before the system responds to a target- state change. It uses two auxiliary lookups over the coeffect store: resolve(inject) returns the bindings the declared keys currently resolve to, and provided(fiber) returns the keys whose binding this fiber installed. The refresh function recomputes fiber.target from the coeffect store and, if the fiber is not already in a transition, initiates either a reload or unload task2. The

reload function records the current target and executes the component’s effect function apply. Upon completion, it checks whether the target still matches: if so, the fiber enters ACTIVE; if not (regardless of whether the new target is ⊥ or a different set of providers), it chains into unload. Symmetrically, unload reverts all tracked effects in LIFO order and then either enters INACTIVE or chains into reload. This mutual recursion implements the inertial property: once a transition begins, it completes before any new transition can start.

Algorithm 5 Component lifecycle

1 function refresh(fiber)

2 target ← target(𝛾, 𝑛)

3 if target = fiber.target then return

4 fiber.target ← target

5 if fiber.inertia then return

6 if target ≠ ⊥ then

7 fiber.state ← LOADING

8 fiber.inertia ← create_task(reload(fiber))

9 else

10 fiber.state ← UNLOADING ▷ out of service before any inverse is scheduled

11 fiber.inertia ← create_task(unload(fiber))

12 async function reload(fiber)

13 target0 ← fiber.target

14 fiber.committed ← resolve(fiber.inject) ▷ commit the view

15 recover ← await execute(fiber.apply, () ↦ fiber.target = target0)

16 fiber.dispose ← recover ∘ fiber.dispose

2create_task schedules an async function to run concurrently and returns a handle to it (stored in fiber.inertia). We write it explicitly for language independence: with eager scheduling (e.g., TypeScript promises), the call is implicit and the returned promise is the handle, whereas with lazy scheduling (e.g., Python coroutines, Rust futures) the host must spawn the task for it to progress.

62

Algorithm 5 实现 inertial state machine. `refresh` 重新解析 inject keys 并计算 target; 若 fiber 不在 transition 中, target 可满足便启动 reload, 否则启动 unload. `reload` 先 commit 当前 resolved view, 再执行 component effect. 完成后 target 若未变则进入 ACTIVE, 已变化则串接 unload. `unload` 以 LIFO 撤回全部 tracked effect, 然后根据最新 target 进入 INACTIVE 或串接 reload. 已开始的 transition 总会完成, 新变化只决定下一段 transition.

<!-- page 63 of 92 -->

17 if fiber.target = target0 then

18 fiber.state ← ACTIVE

19 notify(fiber.ctx, provided(fiber))

20 fiber.inertia ← null

21 else

22 fiber.state ← UNLOADING

23 fiber.inertia ← create_task(unload(fiber))

24 async function unload(fiber)

25 await all(notify(fiber.ctx, provided(fiber)).map(f ↦ f.await())) ▷ drain dependents

26 await fiber.dispose()

27 fiber.dispose ← id

28 fiber.committed ← ⊥

29 if fiber.target = ⊥ then

30 fiber.state ← INACTIVE

31 fiber.inertia ← null

32 else

33 fiber.state ← LOADING

34 fiber.inertia ← create_task(reload(fiber))

fiber.target is computed by resolving each declared key against the current coeffect store and tupling the uid of the fiber that provides it, so it is a digest of target(𝛾, 𝑛) (Definition 53). Identifying a binding by its provider rather than by its value is what makes a single comparison against the recorded target sufficient: a uid is drawn fresh and never reused, so a provider that is replaced cannot be mistaken for the one it replaced, even when the two provide equal values. Since notify (Section 5.1.2) recomputes the target on every coeffect change, a fiber reloads precisely when one of its declared keys comes to be provided by a different fiber. A provider that overwrites its own binding in place is therefore not observed; a component that wants its replacement to propagate withdraws the binding and installs it afresh.

The algorithm operates at two complementary levels. At the transition level, reload and

unload check the target at completion, enabling inertial chaining across transitions. At the iteration level within each transition, the effect execution (Algorithm 1) checks the target at each iteration boundary, enabling partial rollback within a single transition. These two mechanisms correspond to the inter-transition chaining of Section 4.4 and the intra-transition staleness check that Theorem 71 rests on.

Three lines carry the coeffect ordering of Theorem 70, and where each of them sits is what makes the ordering hold. reload commits the resolved view at Line 14 and unload discards it only after every inverse has run, so a fiber reads the same bindings for as long as it is loaded, its own teardown included. refresh marks the fiber UNLOADING at Line 10 before the transition task is created, which is the L-Leave step: the fiber stops providing, and the dependents recompute against that before any of its inverses is scheduled. unload then waits at Line 25 for each notified dependent to reach INACTIVE, which is the guard on L-Unload; notify admits a dependent only when its declared key resolves to the same realm symbol as the provider’s, which is the runtime form of the guard’s demand that the dependent see the key from this fiber rather than merely declare it. The wait sits ahead of the whole recovery rather than inside one of the inverses being waited on, since fiber.dispose initiates a fiber’s effects concurrently and a wait placed within one of them would leave the rest unordered. Termination follows Theorem 73: a fiber only ever waits on dependents that have already stopped being satisfiable, and a dependent that is itself

63

`fiber.target` 记录每个 declared key 的 provider uid, 而不是 value. uid 新生成且不复用, 所以 provider 即使提供相等 value, 替换后仍会触发 reload. provider 在原位覆盖自己的 binding 不会被当成替换; 若需要传播, 应先 withdraw 再 install.

算法在两个粒度处理 stale state. transition 完成时, reload/unload 再检查 target, 实现 transition 之间的 inertial chaining; transition 内部的 effect iterator 每一步检查 target, 能对部分完成的 effect 进行 rollback. coeffect ordering 依靠三处顺序: reload 开始时 commit view, 全部 inverse 完成后才丢弃; refresh 在创建 unload task 前先标记 UNLOADING; unload 在 recovery 前等待 notified dependent 到 INACTIVE. 这样 dependent teardown 期间仍能读到原 binding, provider 则在 dependent 退出后才撤回资源.

<!-- page 64 of 92 -->

a provider waits the same way for its own, so the provider graph is traversed on demand rather than analyzed in advance.

5.1.4. Context Access

5.1.4. Context 访问

组件只能读取声明过的 coeffect. Resolution 从当前 fiber 沿 parent 链向上查找 committed view; 如果 key 在当前 fiber 的 inject 中却没有 active provider, 抛出 inactive access; 若走到 root 仍未声明则抛出 undeclared access. 该规则防止组件在 teardown 期间切换到新 provider.

The coeffect operations of Section  5.1.2 form a reflective API: a coeffect is written with

ctx.set(key, value) and read with ctx.get(key), both keyed by name. Cordis layers a second, more native way to extend and consume the context on top of this reflective API: property access. A component can access a coeffect as the property ctx[key], as if it were native structure of the context, rather than through a method call. In TypeScript, Cordis realizes this with a Proxy whose get trap mediates every property access. Algorithm 6 shows how a context resolves such an access to a coeffect, atop the primitive get of Section 5.1.2.

Algorithm 6 Proxy-mediated context access

1 function resolve(ctx, key)

2 fiber ← ctx.fiber

3 repeat

4 if key ∈ fiber.committed then return fiber.committed[key]

5 if key ∈ fiber.inject then throw INACTIVE_ACCESS

6 if fiber = root then throw UNDECLARED_ACCESS

7 fiber ← fiber.parent.fiber

Algorithm 6 walks the fiber chain upward from the accessing context: at the first fiber whose committed view binds key, the access is authorized and that binding is returned; if the walk reaches a fiber that declares key without having committed it, the fiber is not loaded and the access fails; and if it reaches the root without any declaration, the access is rejected as undeclared. This is where the proxy differs from the bare ctx.get: ctx.get(key) is a lookup against the store that returns the bound value or nothing and never fails, whereas the proxy resolves against the accessing fiber’s own view and enforces the coeffect specification 𝑑 at the point of use. Reading the view rather than the store is also what Theorem 70 rests on, since it is what keeps a dependency readable to a component whose teardown was triggered by that dependency going away.

This rejection is a runtime check performed at the point of access. Because a component’s coeffect specification 𝑑 is declared statically, the same violation is in principle detectable at compile time, by resolving each ctx[key] against the declared 𝑑 before execution; Section 6.4 discusses how a host language’s type-level dependency declarations and compile-time metaprogramming can carry out exactly this mediation.

5.2. Component Loader

5.2. Component Loader

Loader 在 core lifecycle 之上处理声明式 configuration, isolation 变化与 HMR. Entry 是配置层身份, fiber 是某次 enablement 的运行时身份. 修改配置会 retire 旧 fiber 并创建新 fiber, dependent 依据 provider uid 变化自动重载.

The core library equips component developers with imperative primitives for dynamic compo­ sition, such as ctx.effect, ctx.use, and ctx.set. A separate concern arises for application orchestrators, who assemble pre-existing components into a running system and adjust the composition over its lifetime. The component loader addresses this concern by introducing a de­ clarative configuration layer: the orchestrator specifies the desired composition as a persistent data structure, and the loader translates changes to this specification into the corresponding imperative fiber operations.

64

property access 通过 Proxy 把 `ctx[key]` 中介到 coeffect resolution. resolver 从当前 fiber 沿 parent chain 向上: 第一个 committed view 含 key 时返回 binding; 若某 fiber 声明了 key 却未 commit, 表示 component 未 loaded, 抛出 INACTIVE_ACCESS; 到 root 都没有声明则抛出 UNDECLARED_ACCESS. 与裸 `ctx.get` 不同, Proxy 按访问者自己的 view 强制 inject specification. teardown 被依赖消失触发后, committed view 仍让 component 在清理期间读取原依赖. 该检查当前在 runtime 执行, 静态 inject declaration 也允许 host language 在 compile time 提前检查.

component loader 在 imperative core 之上加入 declarative configuration. orchestrator 保存期望 composition 的 persistent structure, loader 把配置变化转成 fiber operation. Entry 是配置层的稳定身份, fiber 是一次 runtime enablement. 配置变化会在尽量小的范围内 retire 或更新 fiber, provider uid 变化会让 dependent 自动 reload.

<!-- page 65 of 92 -->

5.2.1. Declarative Configuration

Section 4 decomposes a running system into fibers, each an instantiation of one component. Everything an instantiation needs can be declared, so an orchestrator can describe a whole system as a declarative configuration: a persistent record that the loader realizes as fibers and keeps in step with them.

Entries. A configuration consists of entries. Each entry specifies a fiber and manages it, and the binding runs in both directions: the loader responds to a change in an entry’s fields by adjusting the fiber, and a component that revises its own configuration or disables itself has the change written back to its entry.

Definition 81. An entry declares a single fiber, recording:

• id — a stable identifier, used as the reconciliation key when its group’s child list changes; • url — the URL of the component module to instantiate; • isolate — an isolation annotation applied to the entry’s context; • intercept — an interception annotation applied to the entry’s context; • config — the configuration bound into the component to form its effect function apply; • disabled — whether the entry is administratively turned off.

An entry can serve as a faithful specification because what supports a fiber is exactly what an entry records. The support set of Definition 74 reads 𝜏, 𝜋, 𝑑, and 𝑝 and nothing else, and an entry gives all four: disabled gives 𝜏, the entry’s parent in the tree gives 𝜋, and url selects the component which declares 𝑑 and 𝑝. The fields the support set leaves unread are the fiber’s runtime state, which an instantiation does not need either, and Lemma 77 identifies the support set with the 𝖠𝖼𝗍𝗂𝗏𝖾 fibers of a quiescent state (Definition 53) as far as each component installs every key it declares (Definition 76).

These entries form a configuration tree that is the authoritative record of what the system loads. An entry may be a leaf mapping to a single fiber, or its component may in turn load further components, making the entry a branch node. Cordis provides components for such grouped and nested loading: @cordisjs/group takes a list of child entries as its configuration and loads them as a subgroup, and @cordisjs/include loads an external configuration file (YAML or JSON) and grafts its entries in as a nested subtree. Both are ordinary components resting on the instantiation primitive of Definition 52 (Algorithm 4), so a nested tree stays within the calculus and the results below hold of it.

Reconciliation. When an entry’s record changes, the loader reconciles incrementally rather than tearing the fiber down and rebuilding it wholesale. Reconciling this way is sound for reasons the metatheory supplies.

• Theorem 80 makes the quiescent state a function of the final configuration alone: what­ ever instantiations and retirements the loader performs on the way, and in whatever order, the system quiesces where a load of the final configuration from scratch would have left it. Which components end up loaded is read off the declarations only as far as each of them installs every key it declares (Definition 76); a component that declares a key and installs it under some configurations alone is one the loader can still reconcile, but the set of loaded components then answers to those configurations as well. • Theorem 73 proves that the system does quiesce, so a reconciliation is complete once its instantiations and retirements have been issued. • Corollary 69 puts a departing fiber’s contribution to the state at nothing, so rebuilding one entry withdraws what its fiber installed and leaves the fibers around it as they were.

65

每个 entry 记录 id, component module URL, isolation, interception, config 与 disabled. 配置 tree 是系统应加载内容的 authoritative record. leaf 对应单个 fiber, group/include component 可以产生 nested subtree, 它们仍通过相同 instantiation primitive 工作.

reconciliation 根据 final configuration 增量调整, 不整体重建. metatheory 保证 quiescent state 只由最终配置决定, 操作最终终止, departing fiber 的贡献归零, dependency 约束 activation 而不约束 module fetch 顺序. 因此 module 可以并发加载. id/url 变化重建 entry; isolate 重新分配 realm; intercept 原位更新; config 交给 component 自行 diff; disabled 切换 unload/reload.

<!-- page 66 of 92 -->

• Theorem 70 lets the entries be instantiated together, with no load order for the orches­ trator to arrange: a fiber whose declared keys are not yet provided waits at its L-Begin, and one whose provider leaves is deactivated ahead of it. A dependency therefore constrains when a fiber activates rather than when its module is fetched and evaluated, so the loader loads modules concurrently, where bringing up a large configuration spends its time.

On top of the fiber that an entry declares, the loader dispatches on which of the entry’s fields changed and applies the least disruptive operation for each.

• id, url — rebuilds the entry, since its identity or its component has changed; • isolate — reassigns the entry’s realms (Algorithm 7); • intercept — updated in place, as interception metadata is consulted at read time and needs no reload; • config — handed to the component, which decides how to apply the new payload, typically by diffing it against the previous one and reloading only on a material change. In particular, an @cordisjs/group entry’s config is its list of child entries, so it applies the update as a keyed diff over child ids, creating, removing, or updating each child; since updating a surviving child re-enters this same per-field dispatch, group reconciliation and entry update recurse together down the tree; • disabled — unloads the fiber when set and reloads it when cleared.

Managed realms. Isolation in the core derives a child context overriding the realm table 𝜌 at one key (Section 5.1.2), which suffices while the context tree stands still. An entry may be moved between groups at runtime, so the loader manages realms of its own, and the isolate field selects between two scoping rules per key. A value of true selects a local realm, private to the entry and tagged by its id, which the entry carries with it wherever it moves; a string selects a global realm shared by every entry naming that string, so moving such an entry changes which entries it shares a binding with rather than which realm it belongs to. A realm is discarded once no entry names it.

Reassigning an entry’s realms turns on which keys changed realm, whether the entry is itself the provider at a changed key, and which dependents to notify. The middle question is the hard one, since a realm symbol may be shared by several fibers of which only one is the provider. The loader answers it with delimiters: one symbol 𝛿𝑘 per key, under which each context stores a tag of its own. A delimiter is written on a context and inherited by its descendants, so the entry’s tag and the provider’s agree exactly when the two were derived within one isolate scope for 𝑘, which is the case in which the binding at 𝑘 is the entry’s own and has to move with it.

Algorithm 7 Isolation realm reassignment

1 function patch_isolation(entry, 𝜌′)

2 𝜌 ← entry.ctx[@@isolate]

3 store ← entry.ctx[@@store]

4 Δ ← {𝑘| 𝜌(𝑘) ≠𝜌′(𝑘)} ▷ keys whose realm changes

5 for 𝑘 in Δ do

6 entry.ctx[𝛿𝑘] ← fresh tag

7 diff[𝑘] ← (𝜌(𝑘), 𝜌′(𝑘), entry.ctx[𝛿𝑘], store[𝜌(𝑘)].fiber.ctx[𝛿𝑘])

8 entry.ctx[@@isolate] ← 𝜌′

9 reload(entry.fiber)

10 for 𝑘 in Δ do

66

loader 管理两种 realm. `isolate: true` 选择随 entry 移动的 local realm, 以 entry id 标记; string 选择由同名 entry 共享的 global realm. entry 移动 group 时, local realm 跟随 entry, global realm 身份不变但共享对象可能改变. 无 entry 引用的 realm 被丢弃.

realm reassignment 的难点是判断 changed key 的 binding 是否由该 entry 自己提供. delimiter 为每个 key 在 context 写入可继承 tag. entry 与 provider 的 tag 相同, 当且仅当二者从同一 isolate scope 派生. Algorithm 7 只在 provider 属于 entry 自己的 scope 且新 realm 没有 binding 时移动 binding. dependent 与 provider 一起移动时可见性不变; 二者被 realm change 分开时, dependent 才获得或失去 binding, 因而只通知这些 affected fibers.

<!-- page 67 of 92 -->

11 (𝑠1, 𝑠2, 𝑑1, 𝑑2) ← diff[𝑘]

12 if 𝑑1 = 𝑑2 and store[𝑠1] and not store[𝑠2] then ▷ the binding is the entry’s own

13 store[𝑠2] ← store[𝑠1]

14 delete store[𝑠1]

15 function affected(fiber, 𝑘)

16 (𝑠1, 𝑠2, 𝑑1, 𝑑2) ← diff[𝑘]

17 return fiber.ctx[@@isolate][𝑘] ∈ {𝑠1, 𝑠2} and (fiber.ctx[𝛿𝑘] = 𝑑1) ≠ (𝑑2 = 𝑑1)

18 notify(entry.ctx, Δ, affected) ▷ in place of the realm test of Algorithm 3

The test turns on one property of delimiters. The tag under 𝛿𝑘 is written on the entry’s context and inherited by every context derived from it, and it is drawn afresh at each reassign­ ment, so for a context 𝛾′

𝛾′[𝛿𝑘] = 𝑑1 ⟺ 𝛾′ is derived from the entry's context (64)

Write own(𝛾′) for that condition, of which 𝑑2 = 𝑑1 is the instance at the provider. The reassignment moves the contexts satisfying own from 𝑠1 to 𝑠2 and leaves the others where they are, and by the loop above it moves the binding to 𝑠2 exactly when the provider satisfies own. A dependent sees the binding while its own realm at 𝑘 is the realm the binding sits in. Where own agrees on the dependent and the provider, both move or neither does, so the dependent sees the binding afterwards exactly when it saw it before. Where own separates them, one side moves and the other stays, so the dependent gains or loses the binding. The inequality is that separation, and the membership test drops the dependents resolving 𝑘 in neither realm, which no part of the move reaches.

5.2.2. Hot Module Replacement

Hot module replacement (HMR) applies the revertible-effect pattern at the module level: when source files change, typically during development, the system replaces the affected modules in-place without restarting the process. Because a fiber already bounds all of its component’s effects and coeffects, a module that is itself a component can be replaced through fiber opera­ tions alone: disposing the old fiber recovers everything the component installed, and a new fiber instantiated from the reloaded module reinstalls it. HMR therefore needs no developer- annotated acceptance boundaries, as opposed to Webpack [48] or Vite [49] HMR.

The @cordisjs/hmr component provides the HMR engine, which operates in three phases.

Phase 1: Module classification. The engine takes two inputs: the stashed set (file URLs whose contents have changed since the last reload) and the externals set (modules that cannot be hot-replaced and instead trigger a full restart). Writing get_imports(url) for the modules that url directly imports, it classifies the changes’ dependency subgraph, marking each module

accepted or declined:

Algorithm 8 Module classification

1 function classify(stashed, externals)

2 accepted ← stashed

3 declined ← externals

4 pending ← ⌀

5 for url in stashed do

67

HMR 把 revertible effect pattern 提升到 module 层. fiber 已经圈定 component 的全部 effect/coeffect, 因此 dispose old fiber 可以完整撤回安装内容, 从 reloaded module 创建 new fiber 再安装. 与 Webpack/Vite 不同, 不要求 developer 标注 acceptance boundary.

第一阶段做 module classification. stashed 是内容发生变化的 URL, externals 是不能热替换、必须 full restart 的 module. fixed point 从 stashed imports 出发: 一个 module 的任意 import accepted 时它 accepted; 全部 import declined 时它 declined; import cycle 中仍 undecided 的 module 最终默认 declined.

<!-- page 68 of 92 -->

6 pending ← pending ∪ (get_imports(url) ∖ (accepted ∪ declined))

7 repeat

8 progress ← false

9 for url in pending do

10 if get_imports(url) ∩ accepted ≠ ⌀ then

11 accepted ← accepted ∪ {url}

12 pending ← pending ∖ {url}

13 progress ← true

14 else if get_imports(url) ⊆ declined then

15 declined ← declined ∪ {url}

16 pending ← pending ∖ {url}

17 progress ← true

18 else

19 pending ← pending ∪ (get_imports(url) ∖ (accepted ∪ declined))

20 until not progress

21 declined ← declined ∪ pending

22 return (accepted, declined)

Seeded with the imports of the stashed files, the fixed point accepts a module once one of its imports is accepted and declines one once all of its imports are declined; any module left undecided, caught in an import cycle, defaults to declined.

Phase 2: Stale-entry detection. Using accepted and declined, the engine then filters the component entries down to the stale ones, whose dependency tree reaches a changed module. It walks each entry’s tree with get_dependencies, which collects the transitive imports of a module while respecting declined as a boundary:

Algorithm 9 Stale-entry detection

1 function get_dependencies(root, declined)

2 deps ← ⌀

3 function traverse(url)

4 if url ∈ deps or url ∈ declined then return

5 deps ← deps ∪ {url}

6 for child in get_imports(url) do traverse(child)

7 traverse(root)

8 return deps

9 function detect(entries, accepted, declined)

10 stale_entries ← ⌀

11 for entry in entries do

12 tree ← get_dependencies(entry.url, declined)

13 if tree ∩ accepted ≠ ⌀ then

14 accepted ← accepted ∪ tree

15 stale_entries ← stale_entries ∪ {entry}

16 return stale_entries

An entry is stale exactly when its tree intersects accepted; that tree is then folded into

accepted, so every stale module along it is invalidated in the next phase.

68

第二阶段检测 stale entry. `get_dependencies` 在 declined boundary 前收集 module transitive imports. entry dependency tree 与 accepted 相交时标为 stale, 同时把该 tree 合入 accepted, 供下一阶段统一 invalidate.

<!-- page 69 of 92 -->

Phase 3: Transactional reload. Finally, the engine reloads the stale entries. It invalidates the accepted modules’ caches3, backing up each removed module to enable rollback, then re- imports each stale entry’s component module by its url and swaps in a fresh fiber:

Algorithm 10 Transactional module reload

1 function reload(ctx, accepted, stale_entries)

2 backup ← invalidate_caches(accepted)

3 try

4 for entry in stale_entries do

5 entry.fiber.dispose()

6 entry.fiber ← ctx.use(import(entry.url), entry.config)

7 catch error

8 restore_caches(backup)

9 for entry in stale_entries do

10 entry.fiber.dispose()

11 entry.fiber ← ctx.use(backup[entry.url], entry.config)

12 throw error

The transactional guarantee ensures that the system never enters a half-reloaded state: if any module fails to import (e.g., due to a syntax error), the caches are restored and every stale entry is rebuilt from backup[entry.url], the previous component whose cache was just restored, undoing the swaps already made.

5.3. Case Study: Koishi

5.3. 案例: Koishi

Koishi 将 Cordis 用作插件基础. 论文称其社区已有超过 4000 个插件, 用实际生态验证 context API 能承载命令, 服务, 配置与插件热重载. 案例验证功能适用性, 没有提供性能基准.

Koishi is an open-source chatbot application framework built on Cordis4. Over four years of development, it has accumulated over 4000 community-contributed plugins5, ranging from instant-messaging (IM) adapters and database drivers to administrative consoles and end- user features. Its scale and diversity make it a representative validation of Cordis’s dynamic composability in a production setting.

Expressiveness and generality of the meta-framework. Koishi runs as a server-side bot whose every feature is realized as a plugin over the context primitives of Section 5.1; Koishi itself contributes only the chatbot-domain vocabulary. The same model reappears in a wholly different runtime: Koishi’s web console is a second, independent Cordis application whose plugins compose the primitives of the browser and its user interface rather than those of the server. The disparate settings above establish two properties of the model of Section 3. (1) It is expressive: its primitives suffice to carry a complete production system, the host framework supplying only domain vocabulary. (2) It is general: it fixes how effects and coeffects compose while leaving their meaning to each application, and so presupposes neither a particular domain nor a particular runtime.

Temporal composability without cognitive overhead. The plugin systems surveyed in Section 1.2.1 cannot unload an individual extension’s effects without restarting the extension

3On Node.js, this means clearing the caches of both the ES module and CommonJS module systems, since a module imported through the ES loader can appear in both.

4Koishi currently uses Cordis v3. This paper presents Cordis v4, which refines the effect and coeffect semantics and redesigns the loader; the core compositional model is shared across both versions.

5Koishi uses the term plugin for the concept this paper formalizes as component.

第三阶段 transactional reload. engine 先 invalidate accepted module cache 并备份被移除 module, 然后逐个 dispose stale fiber, 重新 import URL 并创建 fresh fiber. 任何 import 失败时, cache 从 backup 恢复, 所有 stale entry 再用 backup module 重建, 最终重新抛出 error. 因而系统不会停在只替换一半 module 的状态.

Koishi 是建立在 Cordis 上的开源 chatbot framework, 四年积累超过 4000 个 community plugin, 涵盖 IM adapter, database driver, admin console 与用户功能. server 侧的每项能力都由 context primitive 上的 plugin 实现, Koishi 只提供 chatbot domain vocabulary; web console 则是另一个独立 Cordis application, 组合 browser 与 UI primitive. 这说明模型既足以承载完整 production system, 又不预设特定 domain 或 runtime.

Koishi 的插件系统还验证 temporal composability 无需把 cleanup 逻辑分散给 developer. component effect 和 inverse 由相同 context mechanism 追踪, individual plugin 可以卸载而不重启整个 process. 论文案例说明功能表达力与生态规模, 没有给出 throughput, reload latency 或 memory overhead 的 performance benchmark.

69

<!-- page 70 of 92 -->

host. Koishi routinely performs this operation: an orchestrator disables a plugin from the console and its effects are reverted in place; during development, the HMR engine re-applies edited plugins on save while preserving cache state and live connections elsewhere in the system. Cordis makes such removal not merely possible but effortless for the plugin author. Because effects performed through the context are tracked and their inverses composed auto­ matically (Section 3.1), even an inexperienced author obtains ordered cleanup for a plugin’s context-mediated effects without writing an uninstall path. This achieves the locality of concern whose absence Section 1.2.1 identifies: correctness that would otherwise rest on each author’s diligence is instead discharged once, by the abstraction.

Spatial composability across an open ecosystem. In contrast to the plugin systems of Section 1.2.1, where inter-plugin dependencies are largely absent, Koishi’s ecosystem exhibits a genuine dependency topology: IM adapters provide access to each messaging platform, database drivers provide persistent storage, and functional plugins declare these as coeffects and access them. Reconfiguring a provider at runtime, such as switching the storage backend or reconnecting an adapter, reactivates only the dependents whose resolved dependency changed (Section 3.2); a plugin whose dependency is unavailable stays inactive until it appears, without erroring. What the case study substantiates is that this composition holds across independently authored code: a plugin and its dependencies are typically written by different authors who coordinate on nothing beyond the coeffect that connects them, so reactive coeffects keep the assembly consistent across an open ecosystem of independent contributors.

Threats to validity. The evidence here is drawn from a single ecosystem in a single host lan­ guage, so it cannot separate the merits of the paradigm from those of its TypeScript realization or of Koishi’s particular domain, and it is observational rather than a controlled comparison against an alternative architecture. What the case study establishes is thus an existence-and- adoption result rather than a quantitative one; measuring the abstraction’s overhead and its effect on developer productivity against a baseline remains future work.

6. Discussion

6. 讨论

The formal model and implementation presented in the preceding sections introduce a programming paradigm for dynamic composability. This section examines how the paradigm extends to broader engineering concerns, and discusses the design tensions and open prob­ lems.

6.1. System Boundary

6.1. 系统边界

保证只覆盖通过 context mediation 执行的操作. Runtime 负责保存和调用 inverse, 不验证 inverse 的语义正确性; 组件绕开 context 直接修改宿主全局状态时, 这些 effect 不受模型约束.

Every effect in Section 3.1 carries an inverse, and what that inverse amounts to is settled by the system boundary. The boundary divides the environment a system runs against into two parts. (1) A location lies inside when the system is able to modify it exclusively and to restore the state before that modification, so an operation on it is tracked in Γ and can be reverted later. (2) A location lies outside when either ability fails, so an operation on it acts as idΓ and is therefore neither tracked nor reverted. This section develops the properties of this boundary and their consequences for recovery.

Boundaries from coeffects. A coeffect moves the boundary by reifying an external location: it confines every access to that location to a set of operations it provides, each of which it can supply an inverse for, so operations that acted as idΓ come to be tracked in Γ and reverted. The

70

在不增加认知负担的前提下实现时间可组合性。前文所考察的插件系统无法在不重启扩展宿主的情况下，单独卸载某个扩展所产生的影响。Koishi 却经常执行这种操作：编排器可以从控制台禁用一个插件，并在原地回退它的影响；开发过程中，HMR 引擎会在保存修改后重新应用已编辑的插件，同时保留系统其他位置的缓存状态与活动连接。Cordis 不仅让这种移除成为可能，也让插件作者几乎无需额外付出。由于经由上下文执行的效果会被跟踪，其逆操作也会自动组合（第 3.1 节），即便经验不足的作者没有编写卸载路径，也能让插件通过上下文介导的效果按正确顺序完成清理。这实现了第 1.2.1 节所指出的关注点局部性：原本依赖每位作者谨慎自律才能保证的正确性，现在由抽象统一承担一次即可。

开放生态中的空间可组合性。与第 1.2.1 节中插件之间几乎不存在依赖关系的插件系统不同，Koishi 生态呈现出真实的依赖拓扑：即时通信适配器提供各消息平台的访问能力，数据库驱动提供持久化存储，功能插件则把这些能力声明为协效并加以使用。运行时重新配置提供者，例如切换存储后端或重新连接适配器，只会重新激活那些已解析依赖发生变化的依赖方（第 3.2 节）；依赖暂不可用的插件会保持非活动状态，等待依赖出现，而不会报错。该案例研究证明，这种组合能够跨越彼此独立编写的代码成立：插件及其依赖通常由不同作者开发，他们除了连接双方的协效之外无需进行其他协调，因此，反应式协效能够让由独立贡献者构成的开放生态始终保持组装一致性。

有效性威胁。这里的证据来自单一宿主语言中的单一生态，因而无法把该范式本身的优点，与其 TypeScript 实现或 Koishi 特定领域的优势区分开来；而且这些证据属于观察结果，并非针对替代架构的受控比较。因此，本案例研究确立的是“确实存在且已被采用”的结论，而不是定量结论。相对于基线测量该抽象的开销及其对开发者生产力的影响，仍是未来工作。

6. 讨论

前几节给出的形式模型与实现提出了一种面向动态可组合性的编程范式。本节考察该范式如何扩展到更广泛的工程问题，并讨论其中的设计张力与开放问题。

6.1. 系统边界

第 3.1 节中的每个效果都携带一个逆操作，而这个逆操作究竟意味着什么，由系统边界决定。边界把系统所面对的环境分为两部分。（1）如果系统能够独占地修改某个位置，并能恢复修改前的状态，该位置就在边界之内；对它的操作会记录在 Γ 中，之后可以回退。（2）如果这两项能力有任一项不成立，该位置就在边界之外；对它的操作表现为 idΓ，因此既不被跟踪，也不被回退。本节进一步说明这条边界的性质及其对恢复的影响。

由协效形成的边界。协效通过把外部位置具体化来移动边界：它把对该位置的一切访问限制在自己提供的一组操作内，而每个操作都能提供逆操作。这样，原本表现为 idΓ 的操作就会被记录进 Γ，并能够回退。

<!-- page 71 of 92 -->

boundary is therefore drawn per location rather than per medium, since both aforementioned abilities are properties of a location, and reification changes how a location is accessed while leaving its medium as it was. For example, a memory region lies inside when the system alone writes it, and outside when other processes write it too; a file lies inside when only the system can reach it, as with a scratch file under a private path, and outside when it is a path other programs read or write. Moving the boundary is itself a trade-off, between whether the environment provides revertible semantics for a location and what supplying those semantics costs on every access. We take up the co-design this suggests in Section 6.7.

Acquisition and emission. An operation that reaches outside the boundary generally proceeds in two stages. (1) In the acquisition stage, the operation obtains access and installs a record inside the boundary: open installs a descriptor that close removes, malloc reserves a block that free releases, fork starts a child process that kill terminates. The record itself is part of the coeffect that reifies the location, e.g. an entry in a map it keeps, and installing that entry is a revertible effect. That record is at the same time the channel along which data can leave. (2) In the emission stage, the operation pushes data through that channel, as with the bytes a write hands to the file or the datagram a send puts on the wire, and the push acts as idΓ, leaving the data where other parties may read and write it. The two stages therefore fall on opposite sides of the boundary: the acquisition stays inside it, whereas the emission crosses to the outside.

Withholding and compensation. A system that must nonetheless recover from an emission has two approaches available. One is to withhold an emission until the state that produced it is certain to persist, which is the output commit problem of rollback-recovery [50]. The other is compensation [51]: an action that restores the state up to an equivalence the application supplies, coarser than the ≃ of Definition 33, as in deleting a file that was created or refunding a charge that was made. Such actions compose in the same LIFO order as inverses do, so the composition of Section 3.1 transfers to them. The metatheory does not: the commutation of Definition 65 is proved against ≃ and has to be re-established against the coarser one.

6.2. Service Multiplexing

6.2. 服务复用

同一服务可由多个 provider 版本滚动替换. 新 provider 接收新请求, 旧 provider 先停止对新 dependent 可见, 等待已提交视图上的请求排空后卸载. 跨进程扩展需要把网络故障映射成 service withdrawal.

Dynamic component platforms such as OSGi [52] organize composition around services: units of functionality that a provider publishes under an interface and a consumer binds to. The Cordis coeffect model echoes this notion, with a service corresponding to the interface behind a key. Components that provide a service are its providers, and components that inject a service are its consumers. A single service may be implemented by multiple providers, and this multiplicity can be realized in two forms. (1) Exclusive binding: several implementations share one interface but at most one is bound at a time; the orchestrator selects which implementation is bound, and switching between them requires unloading one provider and loading another, momentarily perturbing every consumer’s dependency. (2) Service broker: a central service that acts as the entrypoint for the interface is injected by both the backing providers and the consumers, so that multiple providers coexist and the broker dispatches each request among them. Compared to exclusive binding, the broker absorbs this perturbation: updating a backing provider leaves the broker in place, so consumers see no change to their dependency and no reload is triggered.

The service broker underlies three capabilities: load balancing, rolling updates, and cross- process invocation.

Load balancing. When several providers coexist, the broker distributes requests among them according to a configurable policy (e.g., round-robin, least-loaded, latency-weighted) or

71

因此，边界是针对具体位置而不是针对介质划分的，因为前述两项能力都属于位置的属性，而具体化改变的是访问位置的方式，并不改变位置所在的介质。例如，当某块内存只有系统自身写入时，它位于边界之内；当其他进程也会写入时，它就在边界之外。类似地，只有系统能够访问的文件（例如私有路径下的临时文件）位于边界之内，而其他程序也能读写的路径则位于边界之外。移动边界本身是一种权衡：一边是环境能否为某个位置提供可回退语义，另一边是每次访问都要为这种语义付出的成本。第 6.7 节将讨论由此引出的协同设计。

获取与发射。越过边界的操作通常分为两个阶段。（1）获取阶段获得访问能力，并在边界内建立一条记录：open 创建由 close 移除的描述符，malloc 保留由 free 释放的内存块，fork 启动由 kill 终止的子进程。该记录本身是把位置具体化的协效的一部分，例如它维护的映射中的一项；安装这条记录就是一个可回退效果。同时，这条记录也是数据能够离开系统的通道。（2）发射阶段通过该通道推出数据，例如 write 交给文件的字节，或 send 放到网络上的数据报；这种推出表现为 idΓ，把数据留在其他参与方可以读写的位置。因此，这两个阶段分处边界两侧：获取留在边界之内，而发射跨向边界之外。

扣留与补偿。如果系统仍然需要从一次发射中恢复，有两种做法。一种是扣留输出，直到产生它的状态确定会持久存在；这就是回滚恢复中的输出提交问题 [50]。另一种是补偿 [51]：执行一个动作，把状态恢复到应用给出的等价关系下，这种等价关系比定义 33 中的 ≃ 更粗，例如删除已创建的文件或退还已经收取的款项。这些动作与逆操作一样按后进先出的顺序组合，因此第 3.1 节的组合方法同样适用。但其元理论不能直接沿用：定义 65 的交换性是相对于 ≃ 证明的，必须针对这个更粗的等价关系重新建立。

6.2. 服务多路复用

OSGi [52] 等动态组件平台围绕服务组织组合：提供者以某个接口发布功能单元，消费者再绑定到该单元。Cordis 的协效模型与此相呼应，其中服务对应一个键背后的接口。提供服务的组件是提供者，注入服务的组件是消费者。单个服务可以由多个提供者实现，而这种多重性有两种实现形式。（1）独占绑定：多个实现共享同一接口，但任一时刻最多只能绑定一个；编排器选择绑定哪个实现，在它们之间切换时必须卸载一个提供者并加载另一个，因此会短暂扰动所有消费者的依赖。（2）服务代理：一个中央服务充当该接口的入口，后端提供者与消费者都注入它，从而允许多个提供者共存，由代理在它们之间分派每个请求。与独占绑定相比，代理吸收了这种扰动：更新后端提供者时代理仍然存在，消费者看到的依赖没有变化，也就不会触发重新加载。

服务代理支撑三种能力：负载均衡、滚动更新和跨进程调用。

负载均衡。当多个提供者共存时，代理会依据可配置策略（例如轮询、最少负载、延迟加权）或消费者明确指定的目标来分配请求。

<!-- page 72 of 92 -->

an explicit target named by the consumer. Because providers are ordinary components, they can be added or removed to scale capacity up or down; each provider registers with the broker through a revertible effect, so unloading it reverts the registration and drops it from the broker’s routing set automatically.

Rolling updates. Upgrading a service implementation at runtime reduces to a controlled provider transition [53, 54]. To carry out the transition, the new provider is loaded as an additional fiber and registers with the broker; once it becomes ACTIVE, traffic is gradually shifted from the old providers to the new one (e.g., by adjusting selection weights), and the old providers are unloaded once they no longer carry in-flight requests. This provider transition turns what is traditionally an infrastructure-level operation (e.g., container orchestration, blue- green deployment) into an application-level composition pattern.

Cross-process invocation. The service broker can also be applied across process boundaries [55]. Each process hosts its own Cordis context with local providers; a coordinating compo­ nent links them, treating each as a remote provider. Cross-process service access is mediated by an RPC mechanism that preserves the interface, making the distribution transparent to consumers. One caveat is that a cross-process call incurs latency and may fail mid-flight, so exposing it synchronously would block the caller. An interface intended to be exposed across processes must therefore be designed against an asynchronous contract.

6.3. Access Control and Sandboxing

6.3. 访问控制与沙箱

Context mediation 提供集中权限入口, 但不是操作系统级隔离. 不可信组件仍需要 capability restriction, process sandbox 或容器边界; 形式模型本身不能阻止绕开 API 的文件和网络访问.

Given an application assembled from independent components, securing the application calls for two complementary mechanisms: (1) constraining what dependencies a component may access, and (2) sandboxing untrusted code from the host environment. Cordis supports the first through dependency declarations and interception; the second requires an external sandbox.

Capability-based access control. The dependency access mechanism (Section  5.1.4) already constitutes a form of access control over proxy-mediated properties: a component can only access dependencies it has declared; an undeclared access raises an error. This is structurally similar to capability-based security [56–58], where authority is conferred by possession of a reference rather than by ambient authority. The inject declaration acts as a capability request, and the context proxy acts as a capability mediator. Since these requests are declared statically, the complete set of proxy-mediated capabilities a component requires is known before it runs, letting the orchestrator review and approve them at load time rather than discovering accesses as they happen.

This mediation generalizes to fine-grained policy through the interception mechanism. Access-control metadata can be carried by contexts or declared by components (Definition 26), and the provider consults it when the dependency is invoked to decide whether a request is permitted. For example, a filesystem dependency may carry metadata declaring which paths a component may read or write, and the provider checks each call against the metadata. Because this interception lives on the context rather than in either party’s code, an orchestrator can adjust it to constrain any component’s access to a dependency without modifying the provider, e.g., granting read-only database access to a community component whereas a core component retains full access. Moreover, since interception affects only how a dependency is invoked, not whether it is satisfied, it can be installed, reconfigured, or removed at runtime without triggering any reload or perturbing the dependency graph.

72

由于提供者都是普通组件，可以通过增删它们来扩缩容量；每个提供者都通过可回退效果向代理注册，因此卸载提供者会自动回退这次注册，并把它从代理的路由集合中移除。

滚动更新。在运行时升级服务实现，可以归结为一次受控的提供者转换 [53, 54]。执行转换时，新提供者作为额外纤程加载并向代理注册；当它进入 ACTIVE 状态后，流量会从旧提供者逐步转移到新提供者（例如调整选择权重），待旧提供者不再承载进行中的请求后再将其卸载。这样的提供者转换，把传统上属于基础设施层的操作（例如容器编排、蓝绿部署）变成了应用层的组合模式。

跨进程调用。服务代理还可以跨越进程边界使用 [55]。每个进程都承载自己的 Cordis 上下文与本地提供者，由一个协调组件把它们连接起来，并把每个进程视作远程提供者。跨进程服务访问由保持接口不变的 RPC 机制介导，因此分布位置对消费者透明。需要注意的是，跨进程调用会引入延迟，也可能在途中失败；若以同步方式暴露，调用方就会被阻塞。因此，计划跨进程暴露的接口必须采用异步契约设计。

6.3. 访问控制与沙箱

对于由独立组件组装而成的应用，安全保障需要两种互补机制：（1）限制组件可以访问哪些依赖；（2）把不受信任的代码与宿主环境隔离。Cordis 通过依赖声明和拦截支持前者，后者则需要外部沙箱。

基于能力的访问控制。依赖访问机制（第 5.1.4 节）已经对代理介导的属性构成了一种访问控制：组件只能访问自己声明过的依赖，访问未声明的依赖会引发错误。这在结构上类似基于能力的安全模型 [56–58]，其中权限来自持有某个引用，而不是来自环境权力。inject 声明相当于能力请求，上下文代理则充当能力中介。由于这些请求是静态声明的，组件需要的全部代理介导能力在运行前就已知，编排器可以在加载时审查并批准，而不必等访问实际发生后才发现。

这种中介还能通过拦截机制推广为细粒度策略。访问控制元数据可以由上下文携带，也可以由组件声明（定义 26）；依赖被调用时，提供者查阅这些元数据来决定是否允许请求。例如，文件系统依赖可以携带元数据，声明组件能够读写哪些路径，提供者据此检查每次调用。由于拦截位于上下文上，而不在任一方的代码中，编排器无需修改提供者，就能调整约束任意组件访问依赖的方式，例如只授予社区组件数据库只读权限，而核心组件仍保留完整权限。此外，拦截只影响依赖的调用方式，不影响依赖是否得到满足，因此可以在运行时安装、重新配置或移除，而不会触发重新加载，也不会扰动依赖图。

<!-- page 73 of 92 -->

Sandboxing untrusted components. When a component’s code cannot be trusted, lan­ guage-level access control is insufficient, since a malicious component with access to the host runtime can reach the underlying objects directly, rendering such checks moot. Sandboxing requires an execution boundary beyond the reach of language-level means, such as software fault isolation [59], a separate language runtime, a sandboxed process, or a virtualized con­ tainer [60]. Whatever the mechanism, the untrusted component runs in its own sandboxed context and reaches host-provided dependencies through a bridge, generalizing the cross- process invocation of Section 6.2: the same transparency argument renders this bridged access indistinguishable from local injection. On the host side, the bridge is an ordinary fiber whose capabilities can be attenuated by the access control described above.

6.4. Language Independence and Selection

6.4. 语言独立性与选择

演算不依赖 TypeScript. 宿主语言需要异步 iterator 或等价分步 effect, first-class closure 与可控 context API. 不同语言在 eager promise, lazy future, ownership 和异常语义上需要不同实现.

Although Cordis is implemented in TypeScript, the context paradigm is language-agnostic: spatiotemporal composability is defined only by its two composability dimensions, and thus can be realized in any language that meets certain requirements along both. We analyze these requirements along each dimension in turn.

Temporal composability. At its most basic, temporal composability requires closures: a revertible effect pairs an action with an inverse, and that inverse must be captured as a value, along with the state it restores, so it can be replayed on teardown. Beyond this, a component’s code and the side effects of loading it must be introducible and retractable at runtime.

How a language meets this second requirement depends on its execution model. In managed runtimes, this takes the form of a programmatic module registry, where a loaded module can be evicted from the registry and garbage-collected once unreferenced; Node.js, for instance, exposes such a registry.6 Native code exposes no module registry, so introduction and retraction take the form of explicit dynamic linking and unlinking (e.g., dlopen/dlclose on Unix, LoadLibrary/FreeLibrary on Windows) [61], i.e., loading object code into a running process and later detaching it. WebAssembly takes one path or the other depending on its embedder: a module instance is reclaimed by the host’s collector under a managed embedder (e.g., a JavaScript host), or released when a native embedder drops it (e.g., Wasmtime). Across these mechanisms, the revertible effects model treats loading as an effect on the context, with inverses that undo the registration of symbols, types, or handlers the module introduced.

Spatial composability. Spatial composability requires a mechanism for components to declare their dependencies and for the runtime to provide and inject these dependencies. This reduces to a dependency injection (DI) problem [39], which manifests at two levels that differ across languages: how dependencies are typed and how their access is mediated.

At the type level, the language should provide a way for developers to express well-typed dependency access. A consumer obtains a coeffect by reading its key from the context, so the context type (Section 3.2.1) must record each key’s coeffect. Typeclasses (Haskell) [62] and traits (Rust) [63] achieve this by letting a provider extend the context type from its own module through an instance or impl [64]. TypeScript’s module augmentation [65] likewise lets a provider module merge declarations into the context type.

At the runtime level, dependency access must be dynamically mediated: the coeffect behind a key may change as providers are loaded and unloaded, and may be resolved differently across

6CommonJS exposes the module cache via require.cache; ES modules provide no public eviction API, though modules can still be managed through engine-internal interfaces.

73

对不受信任组件进行沙箱隔离。如果组件代码不可信，仅靠语言层访问控制并不充分，因为恶意组件一旦能够接触宿主运行时，就可能直接访问底层对象，使这些检查失去意义。沙箱需要一道超出语言层手段触及范围的执行边界，例如软件故障隔离 [59]、独立语言运行时、沙箱进程或虚拟化容器 [60]。无论采用哪种机制，不可信组件都在自己的沙箱上下文中运行，并通过桥接访问宿主提供的依赖；这可视为第 6.2 节跨进程调用的推广：同样的透明性论证使桥接访问与本地注入不可区分。在宿主侧，这条桥是普通纤程，其能力可以通过上述访问控制进行削减。

6.4. 语言独立性与选择

虽然 Cordis 使用 TypeScript 实现，但上下文范式与语言无关：时空可组合性只由两个可组合性维度定义，因此任何在这两方面满足特定要求的语言都能实现它。下面分别分析两个维度的要求。

时间可组合性。最基本的要求是语言支持闭包：可回退效果把动作与逆操作配对，逆操作及其要恢复的状态必须能够被捕获为值，以便拆卸时重放。除此之外，组件代码以及加载它所产生的副作用，还必须能够在运行时引入和撤回。

语言如何满足第二项要求，取决于其执行模型。在托管运行时中，通常使用可编程模块注册表：已加载模块可以从注册表中移除，并在不再被引用后由垃圾收集器回收；例如 Node.js 就暴露了这样的注册表。原生代码没有模块注册表，因此引入和撤回表现为显式动态链接与取消链接（例如 Unix 的 dlopen/dlclose、Windows 的 LoadLibrary/FreeLibrary）[61]，即把目标代码加载进运行中的进程，之后再将其分离。WebAssembly 走哪条路径取决于嵌入器：在托管嵌入器（如 JavaScript 宿主）中，模块实例由宿主收集器回收；在原生嵌入器（如 Wasmtime）中，则在宿主释放实例时回收。无论采用哪种机制，可回退效果模型都把加载视为对上下文的效果，其逆操作会撤销模块引入的符号、类型或处理器注册。

空间可组合性。空间可组合性要求组件能够声明依赖，并由运行时提供和注入这些依赖。它可以归结为依赖注入（DI）问题 [39]，并在不同语言中体现为两个层次：依赖如何获得类型，以及依赖访问如何被介导。

在类型层，语言应让开发者能够表达类型正确的依赖访问。消费者通过从上下文读取键来获得协效，因此上下文类型（第 3.2.1 节）必须记录每个键对应的协效。类型类（Haskell）[62] 和 trait（Rust）[63] 允许提供者通过 instance 或 impl [64]，从自身模块扩展上下文类型。TypeScript 的模块扩充 [65] 同样允许提供者模块把声明合并进上下文类型。

在运行时层，依赖访问必须受到动态介导：键背后的协效会随着提供者的加载与卸载而变化，在不同上下文中也可能得到不同解析。

<!-- page 74 of 92 -->

contexts. The language therefore needs a way to interpose on access transparently, leaving the consumer’s code unchanged, e.g., via JavaScript’s Proxy object [66] or Python’s descriptor protocol (__get__) [67]. Absent such a primitive, runtime reflection [68, 69] can mediate access dynamically, at the cost of type safety and developer experience.

Across both levels, metaprogramming facilities supply the typing and the mediation together. Annotations [70] and decorators attach metadata to a declaration, which a processor expands into the accessor that mediates access; compile-time metaprogramming (e.g., Rust procedural macros, Scala macros [71], Zig comptime) emits, for each dependency, a typed declaration together with such an accessor, dispensing with a general-purpose interception primitive.

6.5. Mutual Dependencies and Component Granularity

6.5. 相互依赖与组件粒度

互相把对方列为启动前依赖的 component 会同时保持 inactive. 模型不猜测激活顺序, 设计者需要拆出共同 provider, 调整组件边界, 或把部分关系改成激活后的可选访问.

In the reactive coeffect model, a dependency cycle simply leaves the involved components permanently inactive: given two components 𝐴 and 𝐵, if 𝐴 requires a key provided by 𝐵 and 𝐵 a key provided by 𝐴, neither’s satisfaction predicate can ever become true. Unlike deadlock in concurrent systems, which depends on the schedule and must be detected as it happens, this condition is predictable from the dependency declarations alone, so a runtime can report it when components are loaded.

In practice, most apparently mutual dependencies can be decomposed into finer-grained components that eliminate the cycle. Consider two components: a server (providing a network interface) and an access controller (enforcing authorization policies). The two components interact bidirectionally: the access controller mediates requests arriving at the server, and the server exposes an endpoint for modifying access-control policies. A monolithic design would make each component depend on the other. However, the two interaction directions are logi­ cally independent concerns. Decomposing them yields four components: server-core, access- control-core, request-mediation (depending on both cores to apply access control to incoming requests), and policy-management (depending on both cores to expose policy modification via the server). Through this approach, the cycle is eliminated because neither core depends on the other; only the integration components depend on both.

This decomposition is always possible in principle, since every bidirectional interaction can be factored into independent unidirectional bindings, but it increases the number of components: in the general case, given 𝑛 mutually interacting components, the number of integration components can grow quadratically with 𝑛, since each pair of interacting compo­ nents may require a distinct component for each direction of interaction. This does not affect correctness or runtime performance (components are lightweight), and finer granularity can be beneficial: users gain the ability to load only the specific integration bindings they need, effectively increasing the system’s composability. However, it may affect developer experience: more components require more configuration, more naming, and more cognitive overhead in understanding the dependency graph.

Mitigating this granularity cost is an engineering concern rather than a theoretical one. Practical strategies include package bundling (i.e., grouping related fine-grained components into a single installable unit), convention-based wiring (i.e., automatically connecting compo­ nents whose names or types match a pattern), and scaffold tooling (i.e., generating boilerplate integration components from declarative specifications). These strategies preserve the formal guarantees of the acyclic model while reducing the authoring burden to something closer to the monolithic case.

74

因此，语言需要一种透明拦截访问的方式，让消费者代码保持不变，例如 JavaScript 的 Proxy 对象 [66] 或 Python 的描述符协议（__get__）[67]。如果缺少这类原语，可以通过运行时反射 [68, 69] 动态介导访问，但代价是类型安全和开发体验受损。

在这两个层次上，元编程设施可以同时提供类型标注与访问介导。注解 [70] 和装饰器把元数据附加到声明上，再由处理器展开为介导访问的访问器；编译期元编程（例如 Rust 过程宏、Scala 宏 [71]、Zig comptime）则为每个依赖生成类型化声明及其访问器，从而无需通用拦截原语。

6.5. 相互依赖与组件粒度

在反应式协效模型中，依赖环只会使相关组件永久保持非活动状态：若组件 A 需要 B 提供的键，而 B 又需要 A 提供的键，双方的满足谓词都永远无法为真。它不同于并发系统中的死锁；死锁依赖调度，必须在发生时检测，而这里的条件仅凭依赖声明就能预知，因此运行时可在加载组件时报告。

实践中，大多数看似相互依赖的关系都可以拆成更细粒度的组件，从而消除环。以服务器（提供网络接口）和访问控制器（执行授权策略）为例。二者存在双向交互：访问控制器介导到达服务器的请求，服务器又公开修改访问控制策略的端点。单体设计会让两个组件彼此依赖，但两个交互方向其实是逻辑上独立的关注点。将其拆分后可得到四个组件：server-core、access-control-core、request-mediation（依赖两个核心，用于为入站请求应用访问控制）以及 policy-management（依赖两个核心，用于通过服务器公开策略修改能力）。这样，两个核心互不依赖，只有集成组件同时依赖二者，环就被消除了。

原则上，这种拆分总是可行，因为每种双向交互都能分解为相互独立的单向绑定；但它会增加组件数量。一般情况下，若有 n 个相互交互的组件，集成组件数量可能随 n 呈二次增长，因为每对交互组件的每个交互方向都可能需要一个独立组件。这不影响正确性或运行时性能（组件很轻量），而且更细的粒度也可能有益：用户可以只加载实际需要的集成绑定，从而提高系统的可组合性。不过，它可能影响开发体验：组件越多，配置和命名越多，理解依赖图的认知负担也越大。

缓解这种粒度成本属于工程问题，而非理论问题。可行策略包括包级捆绑（把相关细粒度组件组合为一个可安装单元）、基于约定的接线（自动连接名称或类型符合某种模式的组件），以及脚手架工具（根据声明式规格生成集成组件样板）。这些策略保留了无环模型的形式保证，同时把编写负担降低到更接近单体方案的水平。

<!-- page 75 of 92 -->

6.6. Dependency Typing and Versioning

6.6. 依赖类型与版本

当前 key 表达能力身份, 接口类型与版本仍要由宿主类型系统或 metadata 管理. Provider uid 能发现替换, 不能证明新 provider 与 dependent 在协议上兼容.

In the formal model, a dependency link is established purely by key identity: a component providing key 𝑘 satisfies any component declaring 𝑘 in its dependency set. The type family 𝒱︀𝑘 ensures type-level agreement within a single compilation unit, but this guarantee breaks down when components are developed and built independently, which is a common scenario in component ecosystems. This breakage leads to two distinct problems.

Interface drift. A provider may modify the interface associated with 𝑘 (adding fields, changing method signatures, altering behavioral contracts) between versions, while a con­ sumer compiled against an earlier interface continues to declare the same key 𝑘. The dependency is satisfied at the coeffect level (𝑘∈dom(𝜎)), yet the runtime value no longer conforms to the consumer’s expectations, leading to type errors, method-not-found failures, or silent behavioral divergence [72].

Key collision. Two independently developed providers may use the same key name 𝑘 to denote entirely unrelated interfaces. Since key identity alone establishes the link, a consumer expecting one provider’s interface will accept the other’s value without any compatibility check. Unlike interface drift, where the provider and consumer at least share a common lineage, key collision involves no relationship whatsoever between the expected and actual types, making the resulting failures unpredictable and difficult to diagnose.

Both problems point to the same gap: the coeffect model provides only nominal linking (by key name) but no versioned or structural linking (by interface compatibility) [73]. We discuss three approaches to the gap, from most infrastructure-coupled to most language-agnostic.

Key namespacing. Extending the key space from 𝐾 to 𝐾× 𝑃, where 𝑃 identifies the interface-defining package, eliminates key collision by construction: independently developed interfaces with the same local name occupy distinct keys. This is the most direct solution but also the most coupled: it embeds the package namespace into the formal model itself, making the system dependent on an external package registry for key identity.

Peer dependencies. A lighter coupling is to declare version constraints through the host- language package manager [74]. This is the approach Cordis currently adopts. Component dependencies are semantically peer dependencies: a component does not bundle its dependen­ cies internally but expects the runtime context to supply them. Package managers with peer dependency support (e.g., npm) can enforce version compatibility: if the version of the package providing a key falls outside a consumer’s declared peer range, the incompatibility is caught at install time rather than surfacing as a runtime failure. However, this approach has two limitations: (1) it depends on providers faithfully adhering to semantic versioning, which is an unenforceable convention; (2) package managers typically resolve each dependency to a single version, which prevents loading components from multiple versions of the same package within one application.

Structural compatibility. A fully language-agnostic approach would replace the member­ ship check 𝑘∈dom(𝜎) with a compatibility predicate that verifies the provider’s actual interface structurally subsumes the consumer’s expectation. This is analogous to structural subtyping [75]: a provider satisfies a consumer if the provided interface is a subtype of the re­ quired interface. The challenge lies in defining this predicate language-agnostically: structural compatibility is straightforward for record types (width subtyping) but becomes complex for behavioral contracts (e.g., pre/postconditions [76], effect specifications [22]), and undecidable once parametric polymorphism introduces bounded quantification [77].

75

6.6. 依赖类型与版本管理

在形式模型中，依赖链接完全由键的身份建立：提供键 k 的组件能够满足任何在依赖集合中声明 k 的组件。类型族 𝒱︀k 保证单个编译单元内的类型一致，但当组件彼此独立开发和构建时，这项保证就会失效；而这在组件生态中很常见。由此会产生两个不同问题。

接口漂移。提供者可能在版本之间修改与 k 关联的接口，例如增加字段、改变方法签名或变更行为契约，而针对旧接口编译的消费者仍声明同一个键 k。依赖在协效层面已得到满足（k∈dom(σ)），但运行时值不再符合消费者预期，最终导致类型错误、找不到方法，或难以察觉的行为偏离 [72]。

键冲突。两个独立开发的提供者可能用同一个键名 k 表示完全无关的接口。由于链接只依赖键身份，期待其中一种接口的消费者会在没有兼容性检查的情况下接受另一种值。接口漂移中的双方至少具有共同谱系，而键冲突中预期类型与实际类型毫无关系，因此故障更不可预测，也更难诊断。

两个问题都指向同一处缺口：协效模型只提供按键名连接的名义链接，却没有按接口兼容性连接的版本化或结构化链接 [73]。下面从与基础设施耦合最深到最具语言无关性的顺序讨论三种方案。

键命名空间。把键空间从 K 扩展为 K×P，其中 P 标识定义接口的包，可以从构造上消除键冲突：局部名称相同但独立开发的接口会落入不同键。这是最直接的方案，却也是耦合最深的方案，因为它把包命名空间嵌入形式模型，使键身份依赖外部包注册表。

对等依赖。耦合较轻的做法是通过宿主语言的包管理器声明版本约束 [74]，Cordis 目前采用的就是这种方案。组件依赖在语义上属于对等依赖：组件不在内部捆绑依赖，而期待运行时上下文提供它们。支持对等依赖的包管理器（如 npm）可以强制版本兼容；若提供某个键的包版本落在消费者声明范围之外，不兼容性会在安装时被发现，而不会演变为运行时故障。但该方案有两个局限：（1）它依赖提供者忠实遵循无法强制执行的语义化版本约定；（2）包管理器通常把每项依赖解析为单一版本，因而无法在一个应用中加载同一包的多个版本组件。

结构兼容。完全与语言无关的方案，会用兼容性谓词取代成员检查 k∈dom(σ)，验证提供者实际接口是否在结构上涵盖消费者预期。这类似结构子类型 [75]：若提供的接口是所需接口的子类型，提供者就能满足消费者。难点在于以语言无关方式定义该谓词：记录类型的结构兼容很直接（宽度子类型），但行为契约（如前置/后置条件 [76]、效果规格 [22]）会使它变得复杂；一旦参数多态引入有界量化 [77]，问题甚至不可判定。

<!-- page 76 of 92 -->

These three approaches address different aspects of the problem. Designing a unified dependency model that combines these approaches while preserving the dynamic composition guarantees of the coeffect model remains an open problem.

6.7. Co-Design with Languages and Operating Systems

6.7. 与语言和操作系统协同设计

语言可把 inverse obligation, effect confinement 与 coeffect type 编进类型系统; 操作系统可把 runtime 不认识的文件, socket 和线程资源纳入可追踪接口. 论文将这些方向留作进一步协同设计.

Section 6.4 identifies the minimum a host language must supply for the context paradigm. This section takes up the converse question, what a language or operating system co-designed with the paradigm can offer beyond that minimum.

Co-design with languages. A language designed around the context paradigm can improve on a library in two respects: the semantics it gives to contexts, and the primitives it gives to effects and coeffects.

Such a language can make the context implicit again while preserving the context semantics of Section 3.3. An imperative language already runs every statement against an implicit context, and that single context neither tracks effects nor resolves coeffects. The context paradigm instead distinguishes multiple contexts, where an operation either modifies the context it runs against or derives another from it (Definition 23). An in-place realization modifies the ambient context, just as an imperative language does. A derived realization instead introduces a separate context, for which the language must provide a construct. Making the context implicit brings both an ergonomic and a safety benefit. (1) In a library realization, every function involving effects or coeffects takes the context as an ordinary argument or a receiver, as in Section 5.1. Where the language supplies the context implicitly, functions no longer need to take it. (2) Every context carries its own lifecycle state and committed view (Section 4.1). A library realization passes a context as an ordinary variable, so a component may reach another component’s context by mistake, through a closure or a global variable. An effect it installs there then leaks out of its own lifecycle, and a coeffect it reads there escapes its dependency specification. Making the context implicit closes both.

Such a language can also make effects and coeffects known to its compiler. (1) For effects, an effect iterator (Definition 17) allocates a closure at every step to hold the inverse together with the state it restores. With syntax for performing an effect, a compiler can emit a single state machine for the whole iteration and hold those inverses in its frame. (2) For coeffects, the coeffect specification can be admitted into the type system, with two benefits. First, a dependency cycle is reported at compile time instead of being left to the runtime (Section 6.5). Second, a dependency can be compared by the structure of its type rather than by key identity alone, as row types do [28], which is type-level support for the structural compatibility of Section 6.6.

Co-design with operating systems. Section 1.2.3 observes a coarse-grained substitute for dynamic composability, where the operating system supplies temporal composability at the granularity of a process, and the container orchestrator above it supplies spatial composability at the granularity of a service. An operating system co-designed with the paradigm would support fine-grained composition, by making the coeffect specification a component declares the whole of what it can reach, and by providing its own resources as coeffects.

Such an operating system can supply the sandbox that Section 6.3 defers to a mechanism outside the language. It does so by bounding a component to the dependencies it declares, supplying them when the component is loaded and leaving nothing else reachable from within it, as a WebAssembly module receives its imports from its embedder at instantiation [78]. It

76

这三种方案分别处理问题的不同侧面。如何设计统一依赖模型，把它们结合起来，同时保留协效模型的动态组合保证，仍是开放问题。

6.7. 与语言和操作系统协同设计

第 6.4 节指出了宿主语言支持上下文范式必须提供的最低能力。本节反过来考察：若语言或操作系统与该范式协同设计，除最低能力外还能提供什么。

与语言协同设计。围绕上下文范式设计的语言可以从两方面超越库实现：赋予上下文的语义，以及赋予效果和协效的原语。

这种语言可以在保留第 3.3 节上下文语义的同时，再次把上下文变为隐式。命令式语言本就让每条语句在隐式上下文中运行，但该单一上下文既不跟踪效果，也不解析协效。上下文范式则区分多个上下文：操作要么修改自己运行其上的上下文，要么从中派生另一个上下文（定义 23）。原地实现像命令式语言一样修改环境上下文；派生实现则引入独立上下文，语言必须提供相应构造。隐式上下文同时带来易用性与安全性。（1）在库实现中，每个涉及效果或协效的函数都把上下文作为普通参数或接收者，如第 5.1 节所示；由语言隐式提供后，函数不再需要显式接收它。（2）每个上下文都有自己的生命周期状态和已提交视图（第 4.1 节）。库实现把上下文当普通变量传递，组件可能通过闭包或全局变量误触其他组件的上下文；它在那里安装的效果会逸出自身生命周期，读取的协效也会越过依赖规格。隐式上下文可以同时封闭这两种漏洞。

这种语言还可以让编译器理解效果与协效。（1）对于效果，效果迭代器（定义 17）每一步都要分配闭包，把逆操作与要恢复的状态绑在一起。若有执行效果的专用语法，编译器可以为整个迭代生成单一状态机，并在其帧中保存这些逆操作。（2）对于协效，可把协效规格纳入类型系统，从而获得两个好处：第一，依赖环会在编译时报告，而不必留给运行时（第 6.5 节）；第二，依赖可以像行类型 [28] 那样按类型结构比较，而不仅按键身份比较，这正是第 6.6 节结构兼容性的类型级支持。

与操作系统协同设计。第 1.2.3 节观察到一种粗粒度的动态可组合性替代方案：操作系统在进程粒度提供时间可组合性，其上的容器编排器在服务粒度提供空间可组合性。与该范式协同设计的操作系统，可以让组件声明的协效规格完整限定它所能访问的一切，并把自身资源作为协效提供，从而支持细粒度组合。

这种操作系统可以提供第 6.3 节留给语言外机制实现的沙箱。它把组件限制在声明的依赖之内，在组件加载时提供这些依赖，并确保组件内部除此之外不可访问任何东西，就像 WebAssembly 模块实例化时从嵌入器接收导入项一样 [78]。

<!-- page 77 of 92 -->

can also provide the coeffect isolation and interception of Section 3.2.3 as abilities of its own, binding a key differently for each component and mediating the accesses it supplies.

Such an operating system can also provide its own resources as coeffects. A resource lying outside the boundary is made revertible where the runtime records each acquisition against the component that made it (Section 6.1), and every runtime keeps a record of its own. An operating system that provides the resource as a coeffect keeps that record once, since it is the party that hands the resource out and can attribute it to the component that asked. Memory and file descriptors are the immediate candidates, and tracking them for the sake of recovery has been done at the kernel interface [79, 80]. Furthermore, an operating system can make revertible some of the operations Section 6.1 can only withhold or compensate for. A system that performs a write to persistent storage transactionally can roll it back [81], and one built on copy-on-write or immutable storage reaches an earlier state by moving a pointer [82, 83].

7. Related Work

7. 相关工作

Dynamic composability intersects several established research areas. We survey the most relevant lines of work and distinguish our contribution from each of them.

7.1. Effect and Coeffect Systems

Section 2 reviewed effects and coeffects as the theoretical pillars underlying our work. We first situate the monadic effect systems now common in industrial practice, then survey three research lines that extend effects and coeffects in directions relevant to Cordis: recasting algebraic effects as capabilities, giving effects a reversible semantics, and unifying effects and coeffects under a single graded discipline.

Monadic effect systems. One family of libraries encodes effects in the type systems of existing general-purpose languages, representing them as monadic values that a runtime executes. ZIO in Scala [84] models a computation as ZIO[R,E,A] and Effect-TS in TypeScript [85] as Effect<A,E,R>, a generic type whose parameters describe its result, its typed errors, and the services its context must supply; the fp-ts library [86] encodes the same error and requirement channels through Reader-based monad transformers. Two traits separate these systems from Cordis. First, the tracking costs a monadic embedding: a program obtains it only by being written inside the effect type, whereas Cordis tracks effects as an overlay over ordinary host code. Second, a requirement is discharged by interpretation, an installed service that supplies its operations, and when that service is withdrawn what its operations performed remains in place; Cordis instead pairs each effect with an inverse and re-resolves requirements as providers come and go (Section 3.1, Section 3.2).

Algebraic effects as capabilities. Algebraic effects (Section 2.1) make effect operations visi­ ble to the type system. The extension closest to our work is Brachthäuser et al.‘s Effekt language, which reinterprets effect types as capabilities [87, 88]: an effect type expresses what a compu­ tation requires from its context rather than what side effects it may produce. This perspective, like ours, treats the context as a mediator of capabilities. Cordis and Effekt differ in two respects. (1) In purpose, algebraic effects make effects visible to enable modular interpretation, giving one operation many handler semantics, whereas Cordis makes them visible to enable tracking and reversion, pairing every context transformation with an inverse. (2) In setting, Effekt disciplines effects statically at the type level, defaulting to scope-based reasoning in which capabilities are

77

它还可以原生提供第 3.2.3 节的协效隔离与拦截，为每个组件分别绑定键，并介导自己提供的访问。

这种操作系统也能把自身资源作为协效。若运行时记录每次资源获取及其所属组件，边界之外的资源就能变得可回退（第 6.1 节）；每个运行时本来都会维护自己的记录。操作系统若把资源作为协效提供，只需统一记录一次，因为正是它分发资源，也能把资源归因到提出请求的组件。内存和文件描述符是最直接的候选项，内核接口已有为恢复目的跟踪它们的实践 [79, 80]。此外，操作系统还能把第 6.1 节中只能扣留或补偿的部分操作变为可回退。以事务方式写入持久存储的系统可以回滚写入 [81]；基于写时复制或不可变存储的系统则可通过移动指针回到更早状态 [82, 83]。

7. 相关工作

动态可组合性与多个成熟研究领域相交。下面回顾最相关的研究脉络，并说明本文贡献与它们的区别。

7.1. 效果与协效系统

第 2 节回顾了作为本文理论支柱的效果与协效。这里先定位工业界常见的单子效果系统，再考察与 Cordis 相关的三条扩展路线：把代数效果重新解释为能力、赋予效果可逆语义，以及在统一的分级纪律下整合效果与协效。

单子效果系统。一类库在现有通用语言的类型系统中编码效果，把效果表示为由运行时执行的单子值。Scala 的 ZIO [84] 把计算建模为 ZIO[R,E,A]，TypeScript 的 Effect-TS [85] 建模为 Effect<A,E,R>，泛型参数分别描述结果、类型化错误和上下文必须提供的服务；fp-ts [86] 则通过基于 Reader 的单子变换器编码相同的错误与需求通道。这些系统与 Cordis 有两个区别。第一，跟踪需要单子式嵌入：程序只有写在效果类型内部才能获得跟踪，而 Cordis 把效果跟踪作为普通宿主代码之上的覆盖层。第二，需求通过解释来满足，即由已安装服务提供操作；当服务撤回时，它此前执行的操作仍然保留。Cordis 则为每个效果配对逆操作，并随着提供者出现或消失重新解析需求（第 3.1、3.2 节）。

作为能力的代数效果。代数效果（第 2.1 节）让效果操作对类型系统可见。与本文最接近的扩展，是 Brachthäuser 等人的 Effekt 语言 [87, 88]，它把效果类型重新解释为能力：效果类型表达计算从上下文需要什么，而不是可能产生什么副作用。与本文一样，这一视角把上下文看作能力中介。Cordis 与 Effekt 有两点差异。（1）目的不同：代数效果让效果可见，是为了支持模块化解释，让一个操作拥有多种处理器语义；Cordis 让效果可见，是为了跟踪与回退，把每次上下文变换与逆操作配对。（2）环境不同：Effekt 在类型层静态约束效果，默认采用基于作用域的推理，能力是二等值并受词法作用域限制；它通过装箱恢复一等使用，并在类型中跟踪捕获的能力。

<!-- page 78 of 92 -->

second-class and confined to their lexical scope, and recovering first-class use through boxing, which lifts that restriction by tracking captured capabilities in types; Cordis instead disciplines effects at runtime, aiming at complete resource recovery on component removal; Section 6.7 takes up what a language that made the context second class in this sense would offer.

Reversible effect semantics. A parallel line gives effects a reversible semantics rather than an interpretive one. Heunen et al. [89] model side effects in a reversible setting by adapting Hughes’ arrows to dagger arrows and inverse arrows, capturing effects such as serialization and mutable store whose operations admit inverses. This is the formal account closest to our revertible effects: both pair each effect with the means to undo it rather than discharging it through a handler. The two differ in where reversibility resides, and in how much of it they demand. Heunen et al. work in a denotational, categorical setting where reversibility is a global property, guaranteed by construction since every computation is invertible, and the inverse is two-sided and recovered from the categorical structure. Cordis tracks inverses at runtime and requires less of them: not that the whole computation be reversible, but that each atomic effect admit a one-sided inverse, supplied by the caller at the point of application rather than derived, from which the inverse of any composite follows by composition (Section 3.1).

Graded types as unified effects and coeffects. Orchard et al. [90] proposed graded modal types as an umbrella notion encompassing both effect reasoning (via graded monads) and co­ effect reasoning (via graded comonads), realized in the Granule language, demonstrating that a single type system can track both what a computation does and what it needs; more recent work extends coeffects to imperative Java-like languages [91, 92] and to call-by-push-value [93]. All of these operate at the type level: effects and coeffects are static annotations checked at compile time over lexically fixed scopes. Our contribution is orthogonal to this analysis: we lift the same two notions to runtime mechanisms, which lets Cordis handle dynamic composition. Temporal retraction and spatial dependency are re-resolved as the set of loaded components evolves, instead of being settled once over a fixed program text.

7.2. Programming Paradigms

The context paradigm (Section  3.3) mediates every effect and coeffect through an explicit context. This section first compares it with the functional and imperative treatments of side effects, and then with two established paradigms, one sharing our terminology and the other our treatment of crosscutting concerns.

Explicit threading and implicit mutation. Purely functional languages make effects explicit in types: the State monad 𝑆→(𝐴, 𝑆) [23] threads the environment through every computa­ tion, securing equational reasoning at the cost of the threading itself, every function on the call path accepting and returning the state whether or not it touches it; the monadic effect systems of Section 7.1 are this pole in industrial form. Imperative languages leave effects and dependencies implicit at the call site, so reading what a call does to the system means reading its implementation transitively, and moving or removing a call may silently break distant invari­ ants. The context paradigm takes the traceability of the first treatment and the ergonomics of the second: effects and coeffects pass through a context the component holds, so each operation is attributable to the context it was invoked on and hence to the component, and everything else stays ordinary host code. The paradigm is in this sense an overlay, realizable atop a language of either style: it fixes each operation’s denotation and leaves its realization to the host language, in place where the host mutates and derived where it stays pure (Definition 23).

78

Cordis 则在运行时约束效果，目标是在组件移除时完整回收资源；第 6.7 节讨论了让上下文在这种意义上成为二等值的语言能带来什么。

可逆效果语义。另一条研究路线不赋予效果解释语义，而赋予其可逆语义。Heunen 等人 [89] 通过把 Hughes 箭头改造成 dagger 箭头和逆箭头，在可逆环境中建模副作用，涵盖序列化、可变存储等操作具有逆元的效果。这是最接近本文可回退效果的形式模型：二者都把每个效果与撤销手段配对，而不是借助处理器满足它。差别在于可逆性位于何处，以及要求程度。Heunen 等人在指称式范畴环境中工作，可逆性是全局属性；每个计算都按构造保证可逆，逆是双侧的，并从范畴结构中恢复。Cordis 在运行时跟踪逆操作，要求更弱：不要求整个计算可逆，只要求每个原子效果有一个单侧逆，并由调用方在应用效果时提供；任何复合操作的逆都由此通过组合得到（第 3.1 节）。

用分级类型统一效果与协效。Orchard 等人 [90] 提出分级模态类型，作为同时涵盖效果推理（通过分级单子）和协效推理（通过分级余单子）的总括概念，并在 Granule 语言中实现，证明一个类型系统可以同时跟踪计算做了什么、需要什么。较新的工作把协效扩展到命令式类 Java 语言 [91, 92] 和按值推入调用 [93]。这些工作都处于类型层：效果与协效是编译时检查的静态标注，作用于词法上固定的范围。本文贡献与这种分析正交：我们把相同的两个概念提升为运行时机制，使 Cordis 能处理动态组合。时间撤回和空间依赖会随已加载组件集合的演化重新解析，而不是在固定程序文本上一次决定。

7.2. 编程范式

上下文范式（第 3.3 节）通过显式上下文介导每个效果与协效。本节先将其与函数式和命令式语言处理副作用的方式比较，再与两种成熟范式比较：一种与本文共享术语，另一种与本文共享对横切关注点的处理方式。

显式穿线与隐式修改。纯函数式语言在类型中显式表示效果：State 单子 S→(A,S) [23] 让环境穿过每次计算，以所有调用路径上的函数都必须接收并返回状态为代价，换取等式推理；第 7.1 节的单子效果系统是这种做法的工业形式。命令式语言在调用点隐去效果和依赖，因此要理解一次调用对系统的影响，就必须传递地阅读其实现；移动或删除调用也可能悄然破坏远处的不变量。上下文范式兼得前者的可追踪性与后者的易用性：效果与协效通过组件持有的上下文传递，每个操作都可归因到调用它的上下文，进而归因到组件，其他代码仍是普通宿主代码。从这个意义上说，该范式是可覆盖在任一风格语言之上的一层：它固定每项操作的指称，把实现方式留给宿主语言——宿主采用修改时就原地实现，保持纯函数时就派生实现（定义 23）。

<!-- page 79 of 92 -->

Context-oriented programming. COP [94, 95] equips a language with layers—partial method and class definitions that are activated and deactivated at runtime according to the execution context, so that behavior adapts without the base code naming its context depen­ dencies [96]. COP and Cordis coincide in treating context as a first-class, runtime-mutable entity and in activating and deactivating behavior dynamically, but the resemblance is nominal. In COP, “context” denotes the ambient execution situation (e.g., location, user, mode), and activation changes method dispatch within a dynamically scoped extent; a layer neither tracks the side effects it induces nor reverts them, and activation is not governed by dependency satisfaction. In Cordis, the context is the Γ∞ entity mediating effects and coeffects: activation runs a component’s revertible effects and is driven by reactive coeffect satisfaction (Section 3.2), and deactivation reverts them in full. COP varies what behavior runs; Cordis composes and reverts what effects and dependencies a component installs. Their difference is one of trade-off. COP folds activation into the host language’s method dispatch, gaining dynamically-scoped layer extents at the cost of language specificity, whereas Cordis, as a language-agnostic overlay, resolves activation reactively over a shared context. Cordis can thus express as a coeffect only COP’s global, value-driven fragment: context-dependent selection among implementations, but not dynamically-scoped activation.

Aspect-oriented programming. AOP [97, 98] modularizes a crosscutting concern into an aspect: a pointcut that quantifies over join points selected in the base program, and advice woven in at each. Cordis addresses the same problem of contextual behavior that would otherwise scatter across components, but its analogue of an aspect is a coeffect: a shared point of media­ tion many components declare a dependence on, so that crosscutting behavior can be reshaped there without editing any of them. The two paradigms then differ on two axes. (1) Declaration versus obliviousness: an AOP pointcut is oblivious and quantified, matching arbitrary join points whose code is unaware it is advised, whereas Cordis confines crosscutting to the coeffects each component declares, so its reach is exactly that declared surface. This yields determinacy and traceability: an application orchestrator can inspect and govern what cross-cuts a component at the configuration layer, without reading or analyzing its source, whereas an AOP concern is legible only through the aspects that quantify over it. (2) Lifecycle integration: a crosscutting change in Cordis is carried by a component’s effects, reverted when the component unloads and propagated reactively to its dependents, so it is one move within the dynamic composition model; dynamic-AOP systems [99, 100] can also weave and unweave at runtime, but as a standalone operation, neither bound to a component’s lifecycle nor triggering re-resolution among the advised code.

7.3. Temporal Composability

Temporal composability concerns replacing or removing a component in a running program while recovering the effects it installed. Prior approaches divide by how they treat a departing component’s state and effects: carrying state forward to a successor version, recovering effects through developer-authored cleanup, reversing effects automatically within a scope fixed in advance, or reclaiming resources from a record the runtime accumulates by interposing on an interface.

Stateful forward migration. A broad family of systems replaces components in a running program without downtime by carrying their state forward across versions. All observe the same timing discipline: a component may be swapped only once it reaches a safe, interaction- free point. Kramer and Magee established this criterion as quiescence [53], which Vandewoude et al. later relaxed to the less disruptive tranquility [54]; our rolling-update pattern (Section 6.2)

79

面向上下文编程。COP [94, 95] 为语言加入“层”——可以依据执行上下文在运行时激活和停用的局部方法与类定义，使行为无需由基础代码点名上下文依赖就能自适应 [96]。COP 与 Cordis 都把上下文视为一等、可在运行时修改的实体，也都动态激活和停用行为，但相似仅停留在名称层面。COP 中的“上下文”指环境执行情境（如位置、用户、模式），激活会在动态作用域内改变方法分派；层既不跟踪自己引起的副作用，也不回退它们，激活也不由依赖满足情况控制。Cordis 中的上下文则是介导效果与协效的 Γ∞ 实体：激活执行组件的可回退效果，并由反应式协效满足状态驱动（第 3.2 节）；停用则完整回退效果。COP 改变运行哪种行为，Cordis 则组合并回退组件安装的效果与依赖。二者体现不同权衡：COP 把激活融入宿主语言的方法分派，以语言专属性换得动态作用域的层范围；Cordis 作为语言无关的覆盖层，在共享上下文上反应式解析激活。因此，Cordis 只能用协效表达 COP 中全局、由值驱动的部分，即依据上下文选择实现，而不能表达动态作用域激活。

面向切面编程。AOP [97, 98] 把横切关注点模块化为切面：切点量化选择基础程序中的连接点，并在每处织入通知。Cordis 处理的是同一种上下文行为散落问题，但与切面对应的是协效：许多组件声明依赖的共享介导点，横切行为可在该处重塑而无需编辑任何组件。两种范式在两个维度上不同。（1）声明与无感知：AOP 切点无感知且经过量化，会匹配任意连接点，被匹配代码不知道自己受到通知；Cordis 则把横切范围限制在组件声明的协效内，其影响恰好等于声明面。这带来确定性和可追踪性：应用编排器无需阅读或分析源码，就能在配置层检查并治理哪些行为横切组件；AOP 关注点则只能通过量化它的切面来理解。（2）生命周期集成：Cordis 中的横切变化由组件效果承载，随组件卸载回退，并反应式传播给依赖方，因此是动态组合模型中的一步；动态 AOP 系统 [99, 100] 也能在运行时织入和解除织入，但它是独立操作，既不绑定组件生命周期，也不触发被通知代码间的重新解析。

7.3. 时间可组合性

时间可组合性关注如何在运行程序中替换或移除组件，并恢复它安装的效果。既有方法可按如何处理离开组件的状态与效果分为四类：把状态向前迁移到后继版本；依靠开发者编写的清理恢复效果；在预先固定的范围内自动逆转效果；或由运行时在受控接口上拦截并累积记录，据此回收资源。

有状态前向迁移。一大类系统通过跨版本向前携带状态，在不中断服务的情况下替换运行中的组件。它们遵循共同的时序纪律：组件只有到达安全、无交互点才能交换。Kramer 和 Magee 将该条件定义为静止 [53]，Vandewoude 等人随后放宽为干扰更小的平静 [54]；本文滚动更新模式（第 6.2 节）通过在卸载提供者前排空进行中的请求来满足它。

<!-- page 80 of 92 -->

enforces it by draining in-flight requests before unloading a provider. Dynamic software updating (DSU) then migrates state forward through hand-written transformation functions: Hicks et al.‘s general-purpose DSU for C [101], Stoyle et al.’s type-safe update points via con-freeness analysis [102], and Hayden et al.‘s Kitsune [103] all map old-version data to new- version representations, inheriting heap objects, open files, and connections in place while re-initializing whatever is left unmigrated. The same discipline extends to persistent state: Overeem et al. [104] convert a running event store’s data between schema versions through hand-written upgrade operations while keeping the system available. Erlang/OTP [15] takes the same stance at the process level, migrating state through code_change/3 and recovering from faults by restarting supervised processes rather than reverting their effects; JavaScript’s Hot Module Replacement (e.g., webpack [48], Vite [49]) does the same at the module level, handing state forward through the module.hot or import.meta.hot API across a reload. Com­ pared with Cordis’s module replacement (Section 5.2), these approaches migrate in-memory state more gracefully: Cordis reverts the old component’s tracked effects and reapplies the new component’s from a clean slate, so a component’s own in-memory state does not survive a reload unless placed in a longer-lived dependency, and layering DSU-style forward migration atop revertible effects is future work. Cordis’s approach is nonetheless more general in two respects: it needs no hand-written migration functions of the kind DSU and HMR require, and it supports unloading a component entirely and recovering its resources, not merely updating one in place.

Developer-authored recovery. A second family recovers a component’s effects through cleanup or compensation logic that the developer writes by hand. Plugin lifecycle conventions (e.g., OSGi [52], Eclipse’s extension points, IntelliJ and VSCode) delegate cleanup to developer- written unload callbacks; the Command pattern [105] encapsulates an operation together with an undo method for undo/redo stacks; the saga model [51] structures a long-lived transaction as steps each paired with a compensating action; algebraic effect handlers can attach finalizers that run on teardown [106]; and event sourcing [107] retracts state by appending compensating events rather than executing an inverse at all. In all of them the inverse is an unenforced duty, decoupled from the operation, so that a forgotten one leaks resources silently (as documented empirically in Section 1.2.1). React’s useEffect hook [108] comes closest to pairing an effect with its inverse structurally, returning a cleanup the runtime invokes before each re-execution and on unmount. Its shortfall is composability: a hook may be called only at the top level of a component or another hook, never inside a conditional, loop, or nested function, and its effect body accepts neither an async function nor an iterator. Effects thus cannot be assembled from other effects or interleaved with control flow, leaving nothing from which a composite inverse could be derived. Cordis effects carry no such restriction: they are ordinary operations that compose freely and may run asynchronously, and require a hand-written inverse only for each atomic effect, from which the inverse of any composite is derived by composition, so that assembling existing effects requires writing no inverses at all. This structural pairing of every effect with its inverse makes complete recovery an invariant of the system rather than a matter of developer discipline.

Statically scoped reversal. A third family reverses effects automatically, by construction, but confines reversal to a scope fixed in advance. Software transactional memory [109, 110], descended from hardware transactional memory [111], records a read/write log so that a group of memory operations either commits or aborts, rolling memory back to its pre-trans­ action state. Reversible computing, from Landauer and Bennett’s thermodynamic analyses [112, 113] to reversible languages such as Janus [114], goes further and makes every step of a whole computation globally invertible. Reversible process calculi build backtracking into the

80

动态软件更新（DSU）再通过手写转换函数向前迁移状态：Hicks 等人的通用 C 语言 DSU [101]、Stoyle 等人基于 con-freeness 分析的类型安全更新点 [102]，以及 Hayden 等人的 Kitsune [103]，都把旧版本数据映射到新版本表示，原地继承堆对象、打开的文件与连接，并重新初始化未迁移部分。同样的纪律也扩展到持久状态：Overeem 等人 [104] 通过手写升级操作在模式版本间转换运行中事件存储的数据，同时保持系统可用。Erlang/OTP [15] 在进程层采取同样立场，通过 code_change/3 迁移状态，并通过重启受监督进程从故障中恢复，而非回退其效果；JavaScript 热模块替换（如 webpack [48]、Vite [49]）在模块层也如此，通过 module.hot 或 import.meta.hot API 在重载间向前传递状态。与 Cordis 的模块替换（第 5.2 节）相比，这些方法能更平滑地迁移内存状态：Cordis 会回退旧组件的已跟踪效果，再从干净状态重新应用新组件，因此组件自身的内存状态不会跨重载存续，除非存放在生命周期更长的依赖中；在可回退效果之上叠加 DSU 式迁移仍属未来工作。不过 Cordis 在两方面更通用：它不需要 DSU 与 HMR 所要求的手写迁移函数，也支持彻底卸载组件并回收资源，而不只是原地更新。

开发者编写的恢复。第二类方法通过开发者手写的清理或补偿逻辑恢复组件效果。插件生命周期约定（如 OSGi [52]、Eclipse 扩展点、IntelliJ 和 VSCode）把清理交给开发者编写的卸载回调；命令模式 [105] 把操作与 undo 方法封装起来，用于撤销/重做栈；Saga 模型 [51] 把长事务组织成各自配有补偿动作的步骤；代数效果处理器可附加拆卸时运行的终结器 [106]；事件溯源 [107] 则通过追加补偿事件撤回状态，而不执行逆操作。这些方法中的逆操作都是未被强制的职责，并与原操作分离，遗忘任何一项都会静默泄漏资源（第 1.2.1 节有实证记录）。React useEffect 钩子 [108] 最接近从结构上把效果与逆操作配对：它返回清理函数，运行时在每次重新执行前和卸载时调用。其不足在于可组合性：钩子只能在组件或另一钩子的顶层调用，不能位于条件、循环或嵌套函数内；效果体也不能接受异步函数或迭代器。因此效果无法由其他效果组装，也无法与控制流交错，更无法据此推导复合逆操作。Cordis 效果没有这些限制：它们是可自由组合、可异步运行的普通操作，只需为每个原子效果手写逆操作，复合操作的逆即可自动组合；组装既有效果无需再写任何逆操作。每个效果与逆操作的结构化配对，使完整恢复成为系统不变量，而不是开发者纪律。

静态作用域逆转。第三类方法按构造自动逆转效果，但把逆转限制在预先固定的作用域。软件事务内存 [109, 110] 源自硬件事务内存 [111]，记录读写日志，使一组内存操作要么提交，要么中止并回滚到事务前状态。可逆计算从 Landauer 与 Bennett 的热力学分析 [112, 113] 延伸到 Janus 等可逆语言 [114]，进一步让整个计算的每一步都全局可逆。可逆进程演算则把回溯写进语义本身。

<!-- page 81 of 92 -->

semantics itself: RCCS [115] carries a memory alongside each process and admits a step to be taken back when the past it leads to is causally equivalent, and Phillips and Ulidowski [116] derive reversible operators for CCS, ACP, and CSP uniformly while preserving their forward operational semantics. Their causal-consistency criterion is the concurrent counterpart of the order Cordis’s recovery follows, an accumulator applying a component’s own inverses in last- in-first-out order and the guard of Section 4.2.2 deferring a provider’s withdrawal until its consumers have deactivated (Theorem 70). The reach, however, is fixed by the semantics, every action performed remaining undoable, whereas a Cordis component supplies an inverse for each atomic effect and its accumulator brings the context back to where its composition began. Linear types [117], RAII [4], and Rust’s ownership system [63] tie a resource’s release to a lexical region. Each fixes the scope and reach of reversal statically; Cordis, by contrast, fixes no such scope in advance: it reverts arbitrary context operations over a component’s lifecycle, and treats lexical resource management as complementary, appropriate for local resources within a single component. Verification supplies the same pairing at the granularity of a data structure. Kim and Rinard specify and verify an inverse for every state-changing operation of a collection of set and map implementations, together with the conditions under which two operations commute, reasoning on abstract state so that orders leaving equivalent rather than identical structures count as commuting [118]. Both of the ingredients Section 3.4 requires of a coeffect are therefore mechanically checkable at the interfaces most keys publish, and their reason for preferring an inverse to a saved copy of the state is the one Section 3.1 acts on. Their inverses do not compose, each being verified for one operation, whereas a Cordis accumulator carries the inverses of a whole lifecycle.

Interposed reclamation. A fourth family reclaims what a component acquired without the component itself supplying the inverses, by recording its acquisitions at an interface the runtime controls. Nooks [79] wraps every call crossing the boundary between the Linux kernel and its loadable extensions, so that the kernel objects an extension touches pass through an object tracker whose record tells the recovery manager what to release when the extension fails; shadow drivers [80] tap the same calls from the other side, recording the requests and configuration that determine a driver’s state so that a restarted instance can be restored to it. Akeso [119] obtains the record by compiler instrumentation instead, dividing kernel execution into nestable recovery domains that log their state changes and cross-thread dependencies, and rolling a faulting request back together with every domain that depends on it. Reclamation thus follows from a record the runtime maintains rather than from cleanup the developer remem­ bers to write, which makes this family the closest systems-level precedent for revertible effects. It differs from Cordis in vocabulary and in reach. The platform fixes what can be recorded, whether as release code per kernel object type, one shadow per driver class, or an inverse per instrumented allocator, so a component may hold only resources the platform already knows how to release; a Cordis component instead introduces effects of its own and supplies an inverse for each atomic one (Section 3.1). Reclamation is likewise bounded by a request that commits or a restart of the same extension, whereas Cordis reverts over a component’s whole lifetime and propagates removal to its dependents, which release their own effects in turn (Section 3.2).

7.4. Spatial Composability

Spatial composability concerns how a component’s dependencies on others are declared and bound. Prior mechanisms divide by how binding responds to change: wiring dependencies once at initialization, reacting to the availability of whole components, or propagating change at the granularity of individual values.

81

RCCS [115] 为每个进程携带一份记忆；只要某一步通向的过去在因果上等价，就允许撤回该步。Phillips 和 Ulidowski [116] 在保留前向操作语义的同时，为 CCS、ACP、CSP 统一推导可逆算子。它们的因果一致性准则，是 Cordis 恢复顺序在并发环境下的对应形式：累加器按后进先出顺序应用组件自身的逆操作，第 4.2.2 节的守卫则把提供者撤回推迟到其消费者全部停用之后（定理 70）。但其作用范围由语义固定，执行过的每个动作始终可撤销；Cordis 组件则为每个原子效果提供逆操作，累加器把上下文带回该组件组合开始的位置。线性类型 [117]、RAII [4] 和 Rust 所有权系统 [63] 把资源释放绑定到词法区域，都静态固定逆转的范围与触及面。Cordis 不预先固定这种作用域：它在组件整个生命周期内回退任意上下文操作，把词法资源管理视为互补机制，适合管理单个组件内部的局部资源。验证工作在数据结构粒度提供同样的配对。Kim 和 Rinard 为一组集合与映射实现的每个状态变更操作规定并验证逆操作，同时给出两个操作可交换的条件；他们在抽象状态上推理，因此产生等价而非完全相同结构的顺序也可视为交换 [118]。因此，第 3.4 节要求协效具备的两个要素，都能在多数键所发布的接口上接受机械验证；他们选择逆操作而不是保存状态副本的理由，也正是第 3.1 节采用的理由。不过，他们的逆操作彼此不组合，每个只针对一个操作验证；Cordis 累加器则携带整个生命周期中所有操作的逆。

拦截式回收。第四类方法不要求组件提供逆操作，而是在运行时控制的接口上记录组件获取的资源，据此回收。Nooks [79] 包装 Linux 内核与可加载扩展之间的每次边界调用，使扩展接触的内核对象都经过对象跟踪器；扩展失败时，恢复管理器根据记录决定释放什么。影子驱动 [80] 从另一侧截取相同调用，记录决定驱动状态的请求和配置，从而把重启实例恢复到原状态。Akeso [119] 则通过编译器插桩取得记录，把内核执行划分为可嵌套恢复域，记录状态变化与跨线程依赖，并同时回滚故障请求及依赖它的所有域。资源回收由运行时维护的记录推导，而不是依靠开发者记得编写清理，因此这是可回退效果最接近的系统级先例。它与 Cordis 的差别在术语和覆盖范围。平台预先固定能记录什么：可能是每种内核对象的释放代码、每类驱动的一份影子，或每个插桩分配器的一项逆操作；因此组件只能持有平台已经知道如何释放的资源。Cordis 组件则可引入自己的效果，并为每个原子效果提供逆操作（第 3.1 节）。回收同样受限于提交的请求或同一扩展的重启；Cordis 则覆盖组件完整生命周期，并把移除传播给依赖方，让它们依次释放自身效果（第 3.2 节）。

7.4. 空间可组合性

空间可组合性关注如何声明并绑定组件对其他组件的依赖。既有机制可按绑定如何响应变化分为三类：初始化时一次性接线；响应整个组件的可用性；或在单个值的粒度上传播变化。

<!-- page 82 of 92 -->

Initialization-time dependency wiring. Two established mechanisms wire components to­ gether at initialization time. Dependency injection frameworks [39] (e.g., Spring [120], Guice, Angular, Inversify) inject dependencies into components at initialization, and UI framework context (e.g., Vue.js’s provide/inject and React’s Context API) passes them along a component tree. Some support dynamic scoping (e.g., Spring’s prototype/request scopes, Angular’s hier­ archical injectors), but neither re-resolves reactively: when a provider is replaced or removed at runtime, existing dependents are neither deactivated nor re-initialized, and none offers lifecycle management of the kind our component state machine provides. Cordis’s reactive coeffects (Section 3.2) supply this: the notification mechanism triggers lifecycle transitions whenever the satisfaction predicate changes.

Availability-reactive component models. The closest precedent to our reactive coeffects reacts to service availability. OSGi’s Declarative Services and iPOJO [121, 122] let components declare provided and required services, with the runtime automatically activating and deacti­ vating them as services appear and disappear; iPOJO’s Gravity project [122] explicitly targets autonomous runtime adaptation to changing service availability, and its provide/require model directly prefigures Cordis’s ctx.provide/ctx.get pattern. R-OSGi [55] extends the same abstraction transparently to distributed settings via RPC, mapping network failures to service- withdrawal events, a pattern Section 6.2 discusses as an extension of the Cordis model. All these systems recover through a deactivation callback, which is limited in two ways. First, the callback is hand-written, so resource safety rests on developer discipline and a forgotten one leaks silently. Second, the callback is synchronous: should teardown require an asynchronous exchange with the departing dependency, the frameworks offer no protocol to await it, forcing a blocking wait against a reference that may already be stale. Cordis’s reactive coeffects close both gaps: deactivation reverts the dependents’ accumulated effects, and its inertial 𝖴𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 state (Section 4.4) runs asynchronous teardown to completion before acting on further change.

Value-level reactivity. Functional reactive programming (FRP) [123] and its modern incar­ nations (e.g., signals [124, 125] in SolidJS, Vue’s reactivity system, Angular Signals) propagate change at a value-level granularity: when a signal changes, derived computations are re-evalu­ ated synchronously or under a scheduler [126]. Cordis’s reactive coeffects act at a component- level granularity, adding asynchronous lifecycle semantics that value-level propagation does not model. The same granularity difference runs the other way for consistency: propagating in a turn, in an order the dependency graph fixes, lets FRP require that no derived computation read a mixture of updated and stale inputs, which is glitch freedom [127], whereas Cordis has no counterpart of a turn, orchestration actions arriving one at a time, and guarantees only that no single transition straddles two resolutions of its coeffects (Theorem 71). The two are complementary rather than competing: a Cordis coeffect can itself carry reactive values, and a component updates on only the parts it actually consumes, refining component-level reactivity into finer-grained reactive coeffects that span both levels.

8. Conclusion

8. 结论

We have presented a formal foundation for dynamic composability by lifting the classical concepts of effects and coeffects to runtime mechanisms. Revertible effects address local temporal composability: every context transformation carries an inverse that the runtime holds, and both tracking and recovery preserve composition, so the context is recovered upon component removal. Reactive coeffects address local spatial composability: every context change is classified against a component’s coeffect specification as activating, deactivating, or neutral, and the

我们把经典 effect 与 coeffect 概念提升成运行时机制, 为动态组合建立了形式基础. 可撤销 effect 处理局部时间组合性: 每个 context transformation 都携带 runtime 保存的 inverse, tracking 与 recovery 都保持组合结构, 因此移除组件时能够恢复 context. 响应式 coeffect 处理局部空间组合性: 每次 context change 都相对组件的 coeffect specification 被分类为激活, 停用或中性, 并且

82

初始化时依赖接线。两种成熟机制会在初始化时连接组件。依赖注入框架 [39]（如 Spring [120]、Guice、Angular、Inversify）在初始化时向组件注入依赖；UI 框架上下文（如 Vue.js provide/inject 和 React Context API）则沿组件树传递依赖。部分框架支持动态作用域（如 Spring prototype/request 作用域、Angular 分层注入器），但二者都不会反应式重新解析：提供者在运行时被替换或移除时，现有依赖方既不会停用，也不会重新初始化；它们也都不提供本文组件状态机那样的生命周期管理。Cordis 的反应式协效（第 3.2 节）补足了这一点：只要满足谓词改变，通知机制就触发生命周期转换。

可用性反应式组件模型。与反应式协效最接近的先例，是响应服务可用性的机制。OSGi Declarative Services 与 iPOJO [121, 122] 允许组件声明提供和需要的服务，运行时会随服务出现或消失自动激活和停用组件；iPOJO 的 Gravity 项目 [122] 明确以根据服务可用性变化自主适应运行时为目标，其 provide/require 模型直接预示了 Cordis 的 ctx.provide/ctx.get 模式。R-OSGi [55] 通过 RPC 把同一抽象透明扩展到分布式环境，将网络故障映射为服务撤回事件；第 6.2 节也把它作为 Cordis 模型的扩展模式讨论。这些系统都通过停用回调恢复，但有两项局限。第一，回调由人工编写，资源安全依赖开发者纪律，遗漏会静默泄漏。第二，回调是同步的；若拆卸需要与正在离开的依赖进行异步交互，框架没有等待协议，只能针对可能已经失效的引用阻塞等待。Cordis 的反应式协效补上了两个缺口：停用会回退依赖方累积的效果，而惰性的 Unloading 状态（第 4.4 节）会在处理后续变化前把异步拆卸运行至完成。

值级反应性。函数反应式编程（FRP）[123] 及其现代实现（如 SolidJS、Vue 反应系统和 Angular Signals 中的 signal [124, 125]）在值粒度传播变化：signal 改变时，派生计算会同步或在调度器下重新求值 [126]。Cordis 的反应式协效在组件粒度工作，加入值级传播没有建模的异步生命周期语义。对于一致性，粒度差异又体现为相反方向：FRP 在一个轮次中按依赖图确定的顺序传播，因此可以要求任何派生计算都不读取新旧输入混合值，即无毛刺性 [127]；Cordis 没有轮次对应物，编排动作逐一到达，只保证单次转换不会横跨协效的两次解析（定理 71）。二者互补而非竞争：Cordis 协效本身可以承载反应式值，组件只针对实际消费的部分更新，从而把组件级反应性细化为横跨两个层次的细粒度反应式协效。

8. 结论

本文把经典的效果与协效概念提升为运行时机制，为动态可组合性给出了形式基础。可回退效果处理局部时间可组合性：每次上下文变换都携带由运行时保存的逆操作，跟踪与恢复都保持组合，因此组件移除时上下文能够恢复。反应式协效处理局部空间可组合性：每次上下文变化都依据组件的协效规格，被分类为激活、停用或中性变化，并且……

<!-- page 83 of 92 -->

classification drives its activation and deactivation. We then unify the effect context and the coeffect context into a single context type and mediate every effect and coeffect through it, yielding a discipline we call the context paradigm; the mediation induces an observational equivalence up to which the effects of distinct components attain independence. Combining these mechanisms into the notion of a component, we give a calculus of dynamic composition whose metatheory carries spatiotemporal composability from a single component to a whole system of interleaved components. We realize this paradigm as the Cordis meta-framework, with a core library providing effect tracking and coeffect resolution, as well as a declarative component loader with configuration reconciliation and hot module replacement. The Koishi case study validates the design of Cordis in a production system with over 4000 community plugins.

该分类驱动组件激活与停用. 随后, 我们把 effect context 和 coeffect context 统一为一个 context type, 所有 effect 与 coeffect 都经它中介, 形成 context paradigm. 中介机制诱导出 observational equivalence, 不同组件的 effect 在该等价意义下获得独立性. 两种机制组合成 component 后, 我们给出动态组合演算, 其元理论把时空组合性从单个组件提升到交错组件的完整系统. Cordis 元框架实现了该范式: core library 提供 effect tracking 与 coeffect resolution, 声明式 component loader 提供配置协调和 hot module replacement. Koishi 案例在超过 4000 个社区插件的生产系统中验证了 Cordis 设计.

Beyond human-curated plugin ecosystems, a compelling direction for future validation is self-evolving agent harnesses (Section  1.2.2), where an AI agent generates and replaces its own harness components continuously and with little human oversight. Applying Cordis in such a setting would validate the temporal guarantees of complete recovery under rapid component replacement, as well as the spatial guarantees of dependency coordination under frequent topological change. Such validation would demonstrate the paradigm’s applicability as a foundation for recoverable, coordinated, and continuous self-evolution in agent harnesses and other autonomous systems.

除人工维护的插件生态外, 自演化 agent harness 是重要的后续验证方向. 在这类系统中, AI agent 持续生成和替换自身 harness component, 人工监督很少. 将 Cordis 用于该场景, 可以验证快速替换时完整恢复的时间保证, 也可以验证依赖拓扑频繁变化时协调依赖的空间保证. 这类验证将说明该范式能否成为 agent harness 与其他自主系统进行可恢复, 协调且连续自演化的基础.

References

[1] D. L. Parnas, “On the criteria to be used in decomposing systems into modules,” Com­ munications of the ACM, vol. 15, no. 12, pp. 1053–1058, 1972, doi: 10.1145/361598.361623.

[2] D. Birsan, “On Plug-ins and Extensible Architectures,” ACM Queue, vol. 3, no. 2, pp. 40– 46, 2005, doi: 10.1145/1053331.1053345.

[3] B. Burns, B. Grant, D. Oppenheimer, E. Brewer, and J. Wilkes, “Borg, Omega, and Kuber­ netes,” Communications of the ACM, vol. 59, no. 5, pp. 50–57, 2016, doi: 10.1145/2890784.

[4] B. Stroustrup, The Design and Evolution of C++. Addison-Wesley, 1994.

[5] S. Marlow, S. Peyton Jones, A. Moran, and J. Reppy, “Asynchronous Exceptions in Haskell,” in Proceedings of the ACM SIGPLAN 2001 Conference on Programming Language Design and Implementation, in PLDI '01. New York, NY, USA: Association for Computing Machinery,  2001, pp. 274–285. doi: 10.1145/378795.378858.

[6] L. Cardelli, “Program Fragments, Linking, and Modularization,” in Proceedings of the 24th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages (POPL 1997), ACM Press,  1997, pp. 266–277. doi: 10.1145/263699.263735.

[7] C. Szyperski, Component Software: Beyond Object-Oriented Programming, 2nd ed. Addison- Wesley, 2002.

[8] R. Lopopolo, “Harness Engineering: Leveraging Codex in an Agent-First World.” [On­ line]. Available: https://openai.com/index/harness-engineering/

[9] Anthropic, “Harness Design for Long-Running Application Development.” [Online]. Available: https://www.anthropic.com/engineering/harness-design-long- running-apps

83

<!-- page 84 of 92 -->

[10] L. Wang et al., “A Survey on Large Language Model Based Autonomous Agents,” Fron­ tiers of Computer Science, vol. 18, no. 6, p. 186345, 2024, doi: 10.1007/s11704-024-40231-1.

[11] Y. Qin et al., “Tool Learning with Foundation Models,” ACM Computing Surveys, 2025, doi: 10.1145/3704435.

[12] C. Packer, V. Fang, S. G. Patil, K. Lin, S. Wooders, and J. E. Gonzalez, “MemGPT: Towards LLMs as Operating Systems,” CoRR, vol. abs/2310.08560, 2023.

[13] T. Guo et al., “Large Language Model Based Multi-Agents: A Survey of Progress and Challenges,” in Proceedings of the Thirty-Third International Joint Conference on Artificial Intelligence, in IJCAI 2024.  2024, pp. 8048–8057. doi: 10.24963/ijcai.2024/890.

[14] T. Cai, X. Wang, T. Ma, X. Chen, and D. Zhou, “Large Language Models as Tool Makers,” in Proceedings of the Twelfth International Conference on Learning Representations, in ICLR 2024.  2024. [Online].  Available: https://openreview.net/forum?id=qV83K9d5WB

[15] J. Armstrong, “Making Reliable Distributed Systems in the Presence of Software Errors,” Doctoral dissertation, 2003. [Online].  Available: https://erlang.org/download/ armstrong_thesis_2003.pdf

[16] E. Moggi, “Notions of computation and monads,” Information and Computation, vol. 93, no. 1, pp. 55–92, 1991, doi: 10.1016/0890-5401(91)90052-4.

[17] G. Plotkin and J. Power, “Adequacy for Algebraic Effects,” in Foundations of Software Science and Computation Structures, F. Honsell and M. Miculan, Eds., Berlin, Heidelberg: Springer Berlin Heidelberg,  2001, pp. 1–24.

[18] T. Petricek, D. Orchard, and A. Mycroft, “Coeffects: unified static analysis of context- dependence,” in Proceedings of the 40th International Conference on Automata, Languages, and Programming - Volume Part II, in ICALP'13. Riga, Latvia: Springer-Verlag,  2013, pp. 385–397. doi: 10.1007/978-3-642-39212-2_35.

[19] M. Gaboardi, S.-ya Katsumata, D. Orchard, F. Breuvart, and T. Uustalu, “Combining effects and coeffects via grading,” in Proceedings of the 21st ACM SIGPLAN International Conference on Functional Programming, in ICFP 2016. Nara, Japan: Association for Com­ puting Machinery,  2016, pp. 476–489. doi: 10.1145/2951913.2951939.

[20] A. Church, “A Formulation of the Simple Theory of Types,” The Journal of Symbolic Logic, vol. 5, no. 2, pp. 56–68, 1940, doi: 10.2307/2266170.

[21] B. C. Pierce, Types and Programming Languages. MIT Press, 2002.

[22] J. M. Lucassen and D. K. Gifford, “Polymorphic Effect Systems,” in Proceedings of the 15th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages, in POPL '88. San Diego, California, USA: Association for Computing Machinery,  1988, pp. 47–57. doi: 10.1145/73560.73564.

[23] P. Wadler, “Monads for functional programming,” in Program Design Calculi, M. Broy, Ed., Berlin, Heidelberg: Springer Berlin Heidelberg,  1993, pp. 233–264.

[24] G. Plotkin and J. Power, “Notions of Computation Determine Monads,” in Foundations of Software Science and Computation Structures, Berlin, Heidelberg: Springer Berlin Heidel­ berg,  2002, pp. 342–356. doi: 10.1007/3-540-45931-6_24.

84

<!-- page 85 of 92 -->

[25] G. Plotkin and M. Pretnar, “Handlers of Algebraic Effects,” in Programming Languages and Systems (ESOP), Berlin, Heidelberg: Springer Berlin Heidelberg,  2009, pp. 80–94. doi: 10.1007/978-3-642-00590-9_7.

[26] M. Pretnar, “An Introduction to Algebraic Effects and Handlers. Invited tutorial paper,” Electron. Notes Theor. Comput. Sci., vol. 319, no. C, pp. 19–35, Dec. 2015, doi: 10.1016/ j.entcs.2015.12.003.

[27] D. Leijen, “Koka: Programming with Row Polymorphic Effect Types,” Electronic Proceed­ ings in Theoretical Computer Science, vol. 153, pp. 100–126, Jun. 2014, doi: 10.4204/ eptcs.153.8.

[28] D. Leijen, “Type directed compilation of row-typed algebraic effects,” in Proceedings of the 44th ACM SIGPLAN Symposium on Principles of Programming Languages, in POPL '17. Paris, France: Association for Computing Machinery,  2017, pp. 486–499. doi: 10.1145/3009837.3009872.

[29] A. Bauer and M. Pretnar, “Programming with algebraic effects and handlers,” Journal of Logical and Algebraic Methods in Programming, vol. 84, no. 1, pp. 108–123, Jan. 2015, doi: 10.1016/j.jlamp.2014.02.001.

[30] K. Sivaramakrishnan et al., “Retrofitting parallelism onto OCaml,” Proc. ACM Program. Lang., vol. 4, no. ICFP, Aug. 2020, doi: 10.1145/3408995.

[31] T. Petricek, D. Orchard, and A. Mycroft, “Coeffects: a calculus of context-dependent computation,” in Proceedings of the 19th ACM SIGPLAN International Conference on Functional Programming, in ICFP '14. Gothenburg, Sweden: Association for Computing Machinery,  2014, pp. 123–135. doi: 10.1145/2628136.2628160.

[32] T. Uustalu and V. Vene, “Comonadic Notions of Computation,” Electronic Notes in Theo­ retical Computer Science, vol. 203, no. 5, pp. 263–284, 2008, doi: 10.1016/j.entcs.2008.05.029.

[33] A. Brunel, M. Gaboardi, D. Mazza, and S. Zdancewic, “A Core Quantitative Coeffect Calculus,” in Proceedings of the 23rd European Symposium on Programming Languages and Systems - Volume 8410, Berlin, Heidelberg: Springer-Verlag,  2014, pp. 351–370. doi: 10.1007/978-3-642-54833-8_19.

[34] J. Reed and B. C. Pierce, “Distance makes the types grow stronger: a calculus for differential privacy,” SIGPLAN Not., vol. 45, no. 9, pp. 157–168, Sep. 2010, doi: 10.1145/1932681.1863568.

[35] M. Abadi, A. Banerjee, N. Heintze, and J. G. Riecke, “A core calculus of dependency,” in Proceedings of the 26th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages, in POPL '99. San Antonio, Texas, USA: Association for Computing Machinery, 1999, pp. 147–160. doi: 10.1145/292540.292555.

[36] D. E. Denning, “A lattice model of secure information flow,” Commun. ACM, vol. 19, no. 5, pp. 236–243, May 1976, doi: 10.1145/360051.360056.

[37] U. Dal Lago and F. Gavazzo, “A relational theory of effects and coeffects,” Proc. ACM Program. Lang., vol. 6, no. POPL, Jan. 2022, doi: 10.1145/3498692.

[38] R. P. James and A. Sabry, “Yield: Mainstream Delimited Continuations,” in First Interna­ tional Workshop on the Theory and Practice of Delimited Continuations (TPDC 2011),  2011, pp. 20–32. [Online].  Available: https://homes.luddy.indiana.edu/sabry/files/yield.pdf

85

<!-- page 86 of 92 -->

[39] M. Fowler, “Inversion of Control Containers and the Dependency Injection pattern.” [Online]. Available: https://martinfowler.com/articles/injection.html

[40] A. M. Pitts and I. D. B. Stark, “Observable Properties of Higher Order Functions that Dynamically Create Local Names, or What's New?,” in Mathematical Foundations of Computer Science 1993 (MFCS 1993), in Lecture Notes in Computer Science, vol. 711. Springer,  1993, pp. 122–141. doi: 10.1007/3-540-57182-5\_8.

[41] G. D. Plotkin, “LCF Considered as a Programming Language,” Theoretical Computer Science, vol. 5, no. 3, pp. 223–255, 1977, doi: 10.1016/0304-3975(77)90044-5.

[42] D. R. Ghica, K. Muroya, and T. Waugh Ambridge, “A Robust Graph-Based Approach to Observational Equivalence,” Logical Methods in Computer Science, vol. 21, no. 2, p. 8:1– 8:95, 2025, doi: 10.46298/LMCS-21(2:8)2025.

[43] M. Shapiro, N. Preguiça, C. Baquero, and M. Zawirski, “A Comprehensive Study of Convergent and Commutative Replicated Data Types,” technical report RR-7506, 2011.

[44] X. Leroy and S. Blazy, “Formal Verification of a C-like Memory Model and Its Uses for Verifying Program Transformations,” Journal of Automated Reasoning, vol. 41, no. 1, pp. 1–31, 2008, doi: 10.1007/s10817-008-9099-0.

[45] A. T. Clements, M. F. Kaashoek, N. Zeldovich, R. T. Morris, and E. Kohler, “The Scalable Commutativity Rule: Designing Scalable Software for Multicore Processors,” in Proceedings of the 24th ACM Symposium on Operating Systems Principles,  2013, pp. 1–17. doi: 10.1145/2517349.2522712.

[46] A. W. Mazurkiewicz, “Trace Theory,” in Petri Nets: Applications and Relationships to Other Models of Concurrency, Advances in Petri Nets 1986, Part II, in Lecture Notes in Computer Science, vol. 255. Springer,  1987, pp. 279–324. doi: 10.1007/3-540-17906-2_30.

[47] U. A. Acar, G. E. Blelloch, and R. Harper, “Adaptive functional programming,” ACM Transactions on Programming Languages and Systems, vol. 28, no. 6, pp. 990–1034, 2006, doi: 10.1145/1186632.1186634.

[48] webpack, “Hot Module Replacement.” [Online]. Available: https://webpack.js.org/api/ hot-module-replacement/

[49] Vite, “HMR API.” [Online]. Available: https://vite.dev/guide/api-hmr

[50] E. N. (M. Elnozahy, L. Alvisi, Y.-M. Wang, and D. B. Johnson, “A Survey of Rollback- Recovery Protocols in Message-Passing Systems,” ACM Computing Surveys, vol. 34, no. 3, pp. 375–408, 2002, doi: 10.1145/568522.568525.

[51] H. Garcia-Molina and K. Salem, “Sagas,” in Proceedings of the 1987 ACM SIGMOD International Conference on Management of Data, in SIGMOD '87.  1987, pp. 249–259. doi: 10.1145/38713.38742.

[52] OSGi Alliance, OSGi Core Release 8. OSGi Alliance, 2020. [Online].  Available: https:// docs.osgi.org/specification/osgi.core/8.0.0/

[53] J. Kramer and J. Magee, “The Evolving Philosophers Problem: Dynamic Change Man­ agement,” IEEE Transactions on Software Engineering, vol. 16, no. 11, pp. 1293–1306, 1990, doi: 10.1109/32.60317.

86

<!-- page 87 of 92 -->

[54] Y. Vandewoude, P. Ebraert, Y. Berbers, and T. D'Hondt, “Tranquility: A Low Disruptive Alternative to Quiescence for Ensuring Safe Dynamic Updates,” IEEE Transactions on Software Engineering, vol. 33, no. 12, pp. 856–868, 2007, doi: 10.1109/tse.2007.70733.

[55] J. S. Rellermeyer, G. Alonso, and T. Roscoe, “R-OSGi: Distributed Applications Through Software Modularization,” in Proceedings of the ACM/IFIP/USENIX 8th International Middleware Conference, in Middleware '07.  2007, pp. 1–20. doi: 10.1007/978-3-540-76778-7_1.

[56] J. B. Dennis and E. C. Van Horn, “Programming Semantics for Multiprogrammed Computations,” Communications of the ACM, vol. 9, no. 3, pp. 143–155, 1966, doi: 10.1145/365230.365252.

[57] M. S. Miller, K.-P. Yee, and J. Shapiro, “Capability Myths Demolished,” technical report SRL2003–2, 2003. [Online].  Available: http://zesty.ca/capmyths/usenix.pdf

[58] R. N. M. Watson, J. Anderson, B. Laurie, and K. Kennaway, “Capsicum: Practical Capa­ bilities for UNIX,” in Proceedings of the 19th USENIX Security Symposium,  2010, pp. 29–46. [Online].  Available: https://www.usenix.org/legacy/events/sec10/tech/full_papers/ Watson.pdf

[59] R. Wahbe, S. Lucco, T. E. Anderson, and S. L. Graham, “Efficient Software-Based Fault Isolation,” in Proceedings of the 14th ACM Symposium on Operating Systems Principles, in SOSP '93.  1993, pp. 203–216. doi: 10.1145/168619.168635.

[60] A. Barth, A. P. Felt, P. Saxena, and A. Boodman, “Protecting Browsers from Extension Vulnerabilities,” in Proceedings of the 17th Annual Network and Distributed System Security Symposium, in NDSS '10.  2010. [Online].  Available: https://www.ndss-symposium.org/ ndss2010/protecting-browsers-extension-vulnerabilities/

[61] W. W. Ho and R. A. Olsson, “An Approach to Genuine Dynamic Linking,” Software: Practice and Experience, vol. 21, no. 4, pp. 375–390, 1991, doi: 10.1002/SPE.4380210404.

[62] P. Wadler and S. Blott, “How to Make Ad-hoc Polymorphism Less Ad Hoc,” in Proceedings of the 16th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages, in POPL '89.  1989, pp. 60–76. doi: 10.1145/75277.75283.

[63] F. Klock and N. Matsakis, “The Rust Language and Type System,” in ACM SIGPLAN ML Family Workshop, Gothenburg, Sweden, Sep. 2014.

[64] D. Dreyer, R. Harper, M. M. T. Chakravarty, and G. Keller, “Modular Type Classes,” in Proceedings of the 34th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages, in POPL '07.  2007, pp. 63–70. doi: 10.1145/1190216.1190229.

[65] Microsoft, “Declaration Merging.” [Online]. Available: https://www.typescriptlang. org/docs/handbook/declaration-merging.html

[66] T. Van Cutsem and M. S. Miller, “Proxies: Design Principles for Robust Object-oriented Intercession APIs,” in Proceedings of the 6th Symposium on Dynamic Languages, in DLS '10. 2010, pp. 59–72. doi: 10.1145/1869631.1869638.

[67] R. Hettinger, “Descriptor HowTo Guide.” [Online]. Available: https://docs.python.org/ 3/howto/descriptor.html

87

<!-- page 88 of 92 -->

[68] P. Maes, “Concepts and Experiments in Computational Reflection,” in Conference on Object-Oriented Programming Systems, Languages, and Applications (OOPSLA),  1987, pp. 147–155. doi: 10.1145/38765.38821.

[69] G. Bracha and D. M. Ungar, “Mirrors: design principles for meta-level facilities of object- oriented programming languages,” in Proceedings of the 19th Annual ACM SIGPLAN Conference on Object-Oriented Programming, Systems, Languages, and Applications (OOP­ SLA),  2004, pp. 331–344. doi: 10.1145/1028976.1029004.

[70] R. Rouvoy and P. Merle, “Leveraging component-based software engineering with Fraclet,” Annals of Telecommunications, vol. 64, no. 1–2, pp. 65–79, 2009, doi: 10.1007/ s12243-008-0072-z.

[71] E. Burmako, “Scala Macros: Let Our Powers Combine!,” in Proceedings of the 4th Workshop on Scala, in SCALA@ECOOP '13.  2013, p. 3:1–3:10. doi: 10.1145/2489837.2489840.

[72] S. Raemaekers, A. van Deursen, and J. Visser, “Semantic Versioning and Impact of Breaking Changes in the Maven Repository,” Journal of Systems and Software, vol. 129, pp. 140–158, 2017, doi: 10.1016/j.jss.2016.04.008.

[73] P. Lam, J. Dietrich, and D. J. Pearce, “Putting the Semantics into Semantic Versioning,” in Proceedings of the 2020 ACM SIGPLAN International Symposium on New Ideas, New Paradigms, and Reflections on Programming and Software, in Onward! '20.  2020, pp. 157– 179. doi: 10.1145/3426428.3426922.

[74] P. Abate, R. Di Cosmo, R. Treinen, and S. Zacchiroli, “Dependency Solving: A Separate Concern in Component Evolution Management,” Journal of Systems and Software, vol. 85, no. 10, pp. 2228–2240, 2012, doi: 10.1016/j.jss.2012.02.018.

[75] L. Cardelli, “Structural Subtyping and the Notion of Power Type,” in Proceedings of the 15th ACM SIGPLAN-SIGACT Symposium on Principles of Programming Languages, in POPL '88.  1988, pp. 70–79. doi: 10.1145/73560.73566.

[76] B. Meyer, “Applying "Design by Contract",” Computer, vol. 25, no. 10, pp. 40–51, 1992, doi: 10.1109/2.161279.

[77] B. C. Pierce, “Bounded Quantification is Undecidable,” Information and Computation, vol. 112, no. 1, pp. 131–165, 1994, doi: 10.1006/inco.1994.1055.

[78] A. Haas et al., “Bringing the web up to speed with WebAssembly,” in Proceedings of the 38th ACM SIGPLAN Conference on Programming Language Design and Implementation (PLDI), ACM,  2017, pp. 185–200. doi: 10.1145/3062341.3062363.

[79] M. M. Swift, B. N. Bershad, and H. M. Levy, “Improving the reliability of commodity operating systems,” in Proceedings of the 19th ACM Symposium on Operating Systems Principles (SOSP), ACM,  2003, pp. 207–222. doi: 10.1145/945445.945466.

[80] M. M. Swift, M. Annamalai, B. N. Bershad, and H. M. Levy, “Recovering device drivers,” ACM Transactions on Computer Systems, vol. 24, no. 4, pp. 333–360, 2006, doi: 10.1145/1189256.1189257.

[81] D. E. Porter, O. S. Hofmann, C. J. Rossbach, A. Benn, and E. Witchel, “Operating System Transactions,” in Proceedings of the 22nd ACM Symposium on Operating Systems Principles (SOSP), ACM,  2009, pp. 161–176. doi: 10.1145/1629575.1629591.

88

<!-- page 89 of 92 -->

[82] O. Kiselyov and C.-chieh Shan, “Delimited Continuations in Operating Systems,” in Modeling and Using Context (CONTEXT 2007), in Lecture Notes in Computer Science, vol. 4635. Springer,  2007, pp. 291–302. doi: 10.1007/978-3-540-74255-5_22.

[83] E. Dolstra and A. Löh, “NixOS: a purely functional Linux distribution,” in Proceedings of the 13th ACM SIGPLAN International Conference on Functional Programming (ICFP), ACM, 2008, pp. 367–378. doi: 10.1145/1411204.1411255.

[84] ZIO, “ZIO: Type-safe, composable asynchronous and concurrent programming for Scala.” [Online]. Available: https://zio.dev/

[85] Effect, “Effect: A TypeScript library for building robust applications.” [Online]. Avail­ able: https://effect.website/

[86] G. Canti, “fp-ts: Functional programming in TypeScript.” [Online]. Available: https:// github.com/gcanti/fp-ts

[87] J. I. Brachthäuser, P. Schuster, and K. Ostermann, “Effects as capabilities: effect handlers and lightweight effect polymorphism,” Proc. ACM Program. Lang., vol. 4, no. OOPSLA, 2020, doi: 10.1145/3428194.

[88] J. I. Brachthäuser, P. Schuster, E. Lee, and A. Boruch-Gruszecki, “Effects, capabilities, and boxes: from scope-based reasoning to type-based reasoning and back,” Proc. ACM Program. Lang., vol. 6, no. OOPSLA1, 2022, doi: 10.1145/3527320.

[89] C. Heunen, R. Kaarsgaard, and M. Karvonen, “Reversible Effects as Inverse Arrows,” in Proceedings of the Thirty-Fourth Conference on the Mathematical Foundations of Programming Semantics (MFPS XXXIV), in Electronic Notes in Theoretical Computer Science, vol. 341. 2018, pp. 179–199. doi: 10.1016/j.entcs.2018.11.009.

[90] D. Orchard, V.-B. Liepelt, and H. Eades III, “Quantitative program reasoning with graded modal types,” Proc. ACM Program. Lang., vol. 3, no. ICFP, 2019, doi: 10.1145/3341714.

[91] R. Bianchini, F. Dagnino, P. Giannini, E. Zucca, and M. Servetto, “Coeffects for sharing and mutation,” Proc. ACM Program. Lang., vol. 6, no. OOPSLA2, Oct. 2022, doi: 10.1145/3563319.

[92] R. Bianchini, F. Dagnino, P. Giannini, and E. Zucca, “A Java-like calculus with hetero­ geneous coeffects,” Theoretical Computer Science, vol. 971, p. 114063, 2023, doi: 10.1016/ j.tcs.2023.114063.

[93] C. Torczon, E. Suárez Acevedo, S. Agrawal, J. Velez-Ginorio, and S. Weirich, “Effects and Coeffects in Call-by-Push-Value,” Proc. ACM Program. Lang., vol. 8, no. OOPSLA2, Oct. 2024, doi: 10.1145/3689750.

[94] R. Hirschfeld, P. Costanza, and O. Nierstrasz, “Context-oriented Programming,” Journal of Object Technology, vol. 7, no. 3, pp. 125–151, 2008, doi: 10.5381/jot.2008.7.3.a4.

[95] P. Costanza and R. Hirschfeld, “Language constructs for context-oriented programming: an overview of ContextL,” in Proceedings of the 2005 Symposium on Dynamic Languages (DLS '05), ACM,  2005, pp. 1–10. doi: 10.1145/1146841.1146842.

[96] G. Salvaneschi, C. Ghezzi, and M. Pradella, “Context-oriented programming: A software engineering perspective,” Journal of Systems and Software, vol. 85, no. 8, pp. 1801–1817, 2012, doi: 10.1016/j.jss.2012.03.024.

89

<!-- page 90 of 92 -->

[97] G. Kiczales et al., “Aspect-Oriented Programming,” in ECOOP'97 — Object-Oriented Programming, 11th European Conference, in Lecture Notes in Computer Science, vol. 1241. Springer,  1997, pp. 220–242. doi: 10.1007/BFb0053381.

[98] G. Kiczales, E. Hilsdale, J. Hugunin, M. Kersten, J. Palm, and W. G. Griswold, “An Overview of AspectJ,” in ECOOP 2001 — Object-Oriented Programming, 15th European Conference, in Lecture Notes in Computer Science, vol. 2072. Springer,  2001, pp. 327–353. doi: 10.1007/3-540-45337-7_18.

[99] A. Popovici, T. Gross, and G. Alonso, “Dynamic Weaving for Aspect-Oriented Program­ ming,” in Proceedings of the 1st International Conference on Aspect-Oriented Software Development (AOSD 2002), ACM,  2002, pp. 141–147. doi: 10.1145/508386.508404.

[100] J. Bonér, “What Are the Key Issues for Commercial AOP Use: How Does AspectWerkz

Address Them?,” in Proceedings of the 3rd International Conference on Aspect-Oriented Software Development (AOSD 2004), ACM,  2004, pp. 5–6. doi: 10.1145/976270.976273.

[101] M. Hicks, J. T. Moore, and S. Nettles, “Dynamic Software Updating,” in Proceedings of

the ACM SIGPLAN 2001 Conference on Programming Language Design and Implementation, in PLDI '01.  2001, pp. 13–23. doi: 10.1145/378795.378798.

[102] G. Stoyle, M. Hicks, G. Bierman, P. Sewell, and I. Neamtiu, “Mutatis Mutandis: Safe

and Predictable Dynamic Software Updating,” in Proceedings of the 32nd ACM SIGPLAN- SIGACT Symposium on Principles of Programming Languages, in POPL '05.  2005, pp. 183– 194. doi: 10.1145/1040305.1040321.

[103] C. M. Hayden, K. Saur, E. K. Smith, and M. Hicks, “Kitsune: Efficient, General-Purpose

Dynamic Software Updating for C,” ACM Trans. Program. Lang. Syst., vol. 36, no. 4, 2014, doi: 10.1145/2629460.

[104] M. Overeem, M. Spoor, and S. Jansen, “The Dark Side of Event Sourcing: Managing

Data Conversion,” in IEEE 24th International Conference on Software Analysis, Evolution and Reengineering, in SANER '17.  2017, pp. 193–204. doi: 10.1109/SANER.2017.7884621.

[105] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, Design Patterns: Elements of Reusable

Object-Oriented Software. Boston, MA: Addison-Wesley, 1994.

[106] D. Leijen, “Algebraic Effect Handlers with Resources and Deep Finalization,” technical

report MSR-TR-2018-10, Apr. 2018. [Online].  Available: https://www.microsoft.com/ en-us/research/publication/algebraic-effect-handlers-resources-deep-finalization/

[107] M. Fowler, “Event Sourcing.” 2005.

[108] J. Lee, J. Ahn, and K. Yi, “React-tRace: A Semantics for Understanding React Hooks,”

Proc. ACM Program. Lang., vol. 9, no. OOPSLA2, pp. 471–498, 2025, doi: 10.1145/3763067.

[109] N. Shavit and D. Touitou, “Software Transactional Memory,” in Proceedings of the Four­

teenth Annual ACM Symposium on Principles of Distributed Computing, in PODC '95.  1995, pp. 204–213. doi: 10.1145/224964.224987.

[110] T. Harris, S. Marlow, S. Peyton Jones, and M. Herlihy, “Composable Memory Transac­

tions,” in Proceedings of the Tenth ACM SIGPLAN Symposium on Principles and Practice of Parallel Programming, in PPoPP '05.  2005, pp. 48–60. doi: 10.1145/1065944.1065952.

90

<!-- page 91 of 92 -->

[111] M. Herlihy and J. E. B. Moss, “Transactional Memory: Architectural Support for Lock-

Free Data Structures,” in Proceedings of the 20th Annual International Symposium on Computer Architecture, in ISCA '93.  1993, pp. 289–300. doi: 10.1145/165123.165164.

[112] R. Landauer, “Irreversibility and Heat Generation in the Computing Process,” IBM Jour­

nal of Research and Development, vol. 5, no. 3, pp. 183–191, 1961, doi: 10.1147/rd.53.0183.

[113] C. H. Bennett, “Logical Reversibility of Computation,” IBM Journal of Research and Devel­

opment, vol. 17, no. 6, pp. 525–532, 1973, doi: 10.1147/rd.176.0525.

[114] T. Yokoyama and R. Glück, “A Reversible Programming Language and its Invertible

Self-Interpreter,” in Proceedings of the 2007 ACM SIGPLAN Workshop on Partial Evalua­ tion and Semantics-Based Program Manipulation, in PEPM '07.  2007, pp. 144–153. doi: 10.1145/1244381.1244404.

[115] V. Danos and J. Krivine, “Reversible Communicating Systems,” in CONCUR 2004 —

Concurrency Theory, 15th International Conference, in Lecture Notes in Computer Science, vol. 3170. Springer,  2004, pp. 292–307. doi: 10.1007/978-3-540-28644-8_19.

[116] I. Phillips and I. Ulidowski, “Reversing Algebraic Process Calculi,” in Foundations of

Software Science and Computation Structures, 9th International Conference (FOSSACS 2006), in Lecture Notes in Computer Science, vol. 3921. Springer,  2006, pp. 246–260. doi: 10.1007/11690634_17.

[117] P. Wadler, “Linear Types Can Change the World!,” in Programming Concepts and Methods:

Proceedings of the IFIP Working Group 2.2/2.3 Working Conference, North-Holland,  1990, pp. 561–581. [Online].  Available: https://homepages.inf.ed.ac.uk/wadler/papers/ linear/linear.ps

[118] D. Kim and M. C. Rinard, “Verification of Semantic Commutativity Conditions and

Inverse Operations on Linked Data Structures,” in Proceedings of the 32nd ACM SIGPLAN Conference on Programming Language Design and Implementation,  2011, pp. 528–541. doi: 10.1145/1993498.1993561.

[119] A. Lenharth, V. S. Adve, and S. T. King, “Recovery domains: an organizing principle

for recoverable operating systems,” in Proceedings of the 14th International Conference on Architectural Support for Programming Languages and Operating Systems (ASPLOS), ACM, 2009, pp. 49–60. doi: 10.1145/1508244.1508251.

[120] C. Walls, Spring in Action, 6th ed. Manning Publications, 2022. [Online].  Available:

https://www.manning.com/books/spring-in-action-sixth-edition

[121] C. Escoffier, R. S. Hall, and P. Lalanda, “iPOJO: an Extensible Service-Oriented Compo­

nent Framework,” in IEEE International Conference on Services Computing,  2007, pp. 474– 481. doi: 10.1109/SCC.2007.74.

[122] H. Cervantes and R. S. Hall, “Autonomous Adaptation to Dynamic Availability Using a

Service-Oriented Component Model,” in Proceedings of the 26th International Conference on Software Engineering, in ICSE '04.  2004, pp. 614–623. doi: 10.1109/ICSE.2004.1317483.

[123] C. Elliott and P. Hudak, “Functional Reactive Animation,” in Proceedings of the Second

ACM SIGPLAN International Conference on Functional Programming, in ICFP '97.  1997, pp. 263–273. doi: 10.1145/258948.258973.

91

<!-- page 92 of 92 -->

[124] G. H. Cooper and S. Krishnamurthi, “Embedding Dynamic Dataflow in a Call-by-Value

Language,” in Programming Languages and Systems (ESOP 2006), in Lecture Notes in Computer Science, vol. 3924. Springer,  2006, pp. 294–308. doi: 10.1007/11693024_20.

[125] I. Maier and M. Odersky, “Deprecating the Observer Pattern with Scala.React,” technical

report EPFL-REPORT-176887, 2012. [Online].  Available: https://infoscience.epfl.ch/ record/176887

[126] E. Bainomugisha, A. L. Carreton, T. Van Cutsem, W. De Meuter, and others, “A

Survey on Reactive Programming,” ACM Comput. Surv., vol. 45, no. 4, 2013, doi: 10.1145/2501654.2501666.

[127] A. Margara and G. Salvaneschi, “On the Semantics of Distributed Reactive Program­

ming: The Cost of Consistency,” IEEE Trans. Software Eng., vol. 44, no. 7, pp. 689–711, 2018, doi: 10.1109/TSE.2018.2833109.

92
