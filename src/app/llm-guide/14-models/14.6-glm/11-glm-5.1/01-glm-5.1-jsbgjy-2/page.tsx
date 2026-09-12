"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5.1 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: GLM-5.1: Towards Long-Horizon Tasks
原文链接: <a href="https://z.ai/blog/glm-5.1">https://z.ai/blog/glm-5.1</a>
发布日期: 2026-04-07
发布机构: Z.ai (Zhipu AI, 智谱 AI)
许可协议: MIT License</p>
</blockquote>
<h2 id="mxdwyhxzz">模型定位与核心主张</h2>
<p>GLM-5.1 是 Z.ai 面向 agentic engineering 推出的下一代旗舰模型，在编码能力上较前代有显著提升。它在 SWE-Bench Pro 上取得了开源模型中的最佳成绩，并在 NL2Repo(代码仓库生成)和 Terminal-Bench 2.0(真实终端任务)两项 benchmark 上大幅领先 GLM-5。</p>
<p>但最有意义的飞跃并不止于首过性能(first-pass performance)。此前的模型,包括 GLM-5 在内,往往在早期就耗尽了它们的「手段库」:它们应用熟悉的技术快速获取初始增益,然后陷入平台期。给它们更多时间也无济于事。</p>
<p>相比之下,GLM-5.1 被构建为能够在更长的 time horizon 内保持对 agentic 任务的有效性。我们发现,该模型在处理模糊问题时表现出更好的判断力,并在更长的会话中保持生产力。它会将复杂问题分解,运行实验,读取结果,并以真正的精确度识别阻塞点。通过反复迭代来重新审视推理过程并修正策略,GLM-5.1 能够在数百轮迭代和数千次 tool call 中持续优化。运行时间越长,结果越好。</p>
<blockquote>
<p>这里的设计动机值得停下来想一想。当前业界对 coding agent 的评测范式仍然以「单次通过率」为核心指标,例如 SWE-Bench 的 Pass@1。这个指标衡量的是模型在第一次尝试中解决问题的概率,但它完全忽略了真实软件工程中一个至关重要的维度:时间。人类工程师解决复杂 bug 往往不是一次写对,而是在调试-测试-修复的循环中逐步逼近正确解。GLM-5.1 的核心主张恰恰是挑战这个范式——它不再问「一次能做多好」,而是问「给你八小时,你能持续改进到什么地步」。这本质上是在推动 benchmark 从「瞬时智能」向「持续智能」的范式转移。不过需要注意,这种能力的评测目前缺乏标准化框架,不同厂商的 harness 设置差异很大,横向对比时需要特别谨慎。</p>
</blockquote>
<p>我们在三个任务上展示了这一能力,这三个任务的反馈结构 progressively less structured:一个是向量搜索优化问题,由单一数值指标评分;一个是 GPU kernel benchmark,对每个问题有逐题 speedup 测量;最后是一个开放性的 Web 应用构建任务,没有任何 metric,只有模型自己对「下一步该改进什么」的判断。</p>
<h2 id="cjy-600-lddyhxlsjk">场景一: 600 轮迭代优化向量数据库</h2>
<p>VectorDBBench 是一个开源编码挑战,用于评估模型构建高性能数据库以执行近似最近邻搜索(Approximate Nearest Neighbor Search, ANN)的能力。模型被给予一个带有 HTTP API endpoint 和空实现 stub 的 Rust 骨架代码,然后使用基于 tool-call 的 agent 来读写文件、编译、测试和分析——全部在 50-turn tool-call budget 内完成。最终结果在 SIFT-1M 数据集上进行 benchmark:模型按 QPS(Queries Per Second)排名,约束条件是 Recall &gt;= 95%。在此设定下,此前最好的结果是 Claude Opus 4.6 达到的 3,547 QPS。</p>
<p>一个自然的问题是:这个 50-turn budget 是否是瓶颈。我们将评测重构为一个 outer optimization loop,使用 Claude Code 框架:在每次迭代中,模型可以根据需要使用任意多次的 tool call 来编辑代码、编译、测试和分析,然后提交一个新版本进行 benchmark。模型自主决定何时提交以及下一步尝试什么。</p>
<p>GLM-5.1 没有在 50 或 100 次提交后陷入平台期,而是在 600+ 次迭代和 6,000+ 次 tool call 中持续找到有意义的改进,最终达到 21.5k QPS——大约是单次 50-turn session 中达到的最佳结果的 6 倍。</p>
<p>优化轨迹呈现出一种特征性的阶梯模式(staircase pattern):在固定策略内进行增量调优的周期,被结构性变化打断,每次结构性变化都将性能前沿(performance frontier)推向更高。</p>
<p>两个 transition 可以说明这一模式。大约在第 90 次迭代,模型从全量扫描(full-corpus scanning)转向 IVF cluster probing,并配合 f16 vector compression,跳跃至 6.4k QPS。大约在第 240 次迭代,它引入了两阶段流水线——u8 prescoring 后接 f16 reranking——达到 13.4k QPS。在整个运行过程中共发生了六次这样的结构性 transition,每次都是由模型在分析自己的 benchmark log 并识别当前瓶颈后自主发起的。图表中的红色叉号标记了 Recall 低于 95% 的迭代——这些叉号集中在每次 major transition 周围,因为模型在探索新方向时暂时打破了约束条件,然后调整以恢复它。</p>
<p>具体的优化步骤按时间顺序如下:</p>
<table>
<thead>
<tr>
<th>迭代区间</th>
<th>优化策略</th>
<th>QPS</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>初始</td>
<td>全量序列扫描</td>
<td>~3,500</td>
<td>基线,与此前最佳结果相当</td>
</tr>
<tr>
<td>~90</td>
<td>IVF Cutover</td>
<td>6.4k</td>
<td>从全量扫描转向基于 cluster 的扫描;使用 f16 压缩,将每向量带宽从 512B 降至 256B</td>
</tr>
<tr>
<td>~180</td>
<td>Nested Parallelism Removed</td>
<td>10.4k</td>
<td>并行性重设计:每查询单线程 + 外部并发,消除嵌套并行;降低调度开销并改善 cache locality</td>
</tr>
<tr>
<td>~240</td>
<td>Two-stage Search</td>
<td>13.4k</td>
<td>两阶段流水线:u8 prescore(粗筛) + f16 rerank(精排);仅少量候选进入第二阶段</td>
</tr>
<tr>
<td>~350</td>
<td>Budget Trim</td>
<td>15.5k</td>
<td>候选 budget 调优:减少 Phase 1 输出;降低 Phase 2 rerank 工作量</td>
</tr>
<tr>
<td>~450</td>
<td>Two-level Routing</td>
<td>18.4k</td>
<td>分层路由:引入 super-cluster 实现 coarse-to-fine 路由;仅展开 top N_SUPER_PROBE=33 区域</td>
</tr>
<tr>
<td>~520</td>
<td>u8 Routing + Probe</td>
<td>20.3k</td>
<td>量化路由:centroid 和 super-centroid 评分通过 u8 + VNNI;参数补偿:略微增加 N_PROBE 以恢复 recall</td>
</tr>
<tr>
<td>~580</td>
<td>Early Pruning</td>
<td>21.5k</td>
<td>Cluster 剪枝:在 Phase 1 扫描前跳过低质量 cluster;消除不必要的向量评分和内存访问</td>
</tr>
<tr>
<td>最终</td>
<td>无进一步改进</td>
<td>21.5k</td>
<td>达到平台期,655/655 次提交完成</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: VectorDBBench 的这段优化轨迹是我见过的最详细的「模型自主长程优化」案例之一。六个结构性 transition 每一个都对应着工程上一个合理的优化方向,且顺序大致符合人类工程师的优化直觉(先做 IVF 降维,再做并行优化,再做分层路由)。但关键差异在于:人类工程师通常需要 days 或 weeks 来逐步尝试这些方向,而 GLM-5.1 在数百轮迭代中自主完成了这一过程。一个值得警惕的点是,图表中红色叉号(recall &lt; 95%)的分布模式——它们集中在每次 transition 附近,说明模型在探索新策略时愿意暂时打破约束,然后再修复。这种「先破后立」的策略在真实工程中有风险:如果约束是硬性的(如生产环境的 SLA),临时打破约束可能导致不可逆后果。</p>
</blockquote>
<h2 id="cje-1000-turn-yhjqxxfz">场景二: 1000+ Turn 优化机器学习负载</h2>
<p>KernelBench 评估模型能否将参考 PyTorch 实现转换为更快的 GPU kernel,同时保持输出一致。Benchmark 按优化范围和系统复杂度分为三个级别:Level 1 覆盖单算子,Level 2 覆盖融合算子序列,Level 3 覆盖完整模型的端到端优化,包括 MobileNet, VGG, MiniGPT 和 Mamba 等完整架构,共 50 个问题。作为参考,torch.compile 在默认设置下在这些问题上实现 1.15x speedup;在 max-autotune 模式下为 1.49x。我们在 Level 3 上运行了四个模型,报告所有 50 个问题的几何平均 speedup 作为 tool-use turn 数的函数。</p>
<p><img src="/llm-guide/14-models/14.6-glm/11-glm-5.1/01-glm-5.1-jsbgjy-2/images/kernelbench-comparison.jpeg" alt="KernelBench Level 3 各模型长程优化轨迹对比"></p>
<blockquote>
<p>图 1: KernelBench Level 3 长程优化轨迹对比。横轴为 tool-use turn 数,纵轴为几何平均 speedup。GLM-5.1(绿色)持续优化至 3.6x,GLM-5(蓝色)较早平台期,Claude Opus 4.6(橙色)以 4.2x 领先。</p>
</blockquote>
<p>各模型的轨迹突显了长程优化行为的差异。GLM-5 初期改进很快,但相对较早达到平台期。Claude Opus 4.5 持续时间稍长,但其增益也在后期逐渐衰减。GLM-5.1 将这一前沿推得更远,实现了 3.6x speedup,并在运行后期持续取得进展。虽然其改进速率也随时间放缓,但它在有用优化方面的持续时间显著长于 GLM-5。Claude Opus 4.6 在此设定下仍然是最强的模型,以 4.2x 完成,并且在结束时仍显示出余量(headroom)。</p>
<blockquote>
<p>译者注: KernelBench 的结果揭示了一个有趣的规律:所有模型的改进速率都随时间呈对数衰减,但衰减速率不同。GLM-5.1 的衰减速率比 GLM-5 更慢,意味着它能在更长的时间范围内保持有效优化。Claude Opus 4.6 的绝对性能仍然领先,但 GLM-5.1 缩小了差距。从工程角度看,这种「长程优化能力」的度量比单次 Pass@1 更能反映真实开发场景,但它也引入了一个新的变量:harness 的质量。如果 harness 不能给模型提供足够丰富的反馈(如 profiling 数据、编译错误信息等),模型即使有能力也无法发挥。因此 GLM-5.1 的表现既是模型能力的体现,也是 Z.ai 在 harness 工程上的投入体现。</p>
</blockquote>
<h2 id="cjs-8-xsgj-linux-zm">场景三: 8 小时构建 Linux 桌面</h2>
<p>前两个场景有明确的数值目标——QPS、speedup——模型可以针对这些目标进行 benchmark。网站生成本质上更加主观:给定自然语言 prompt,生成一个可用的 Web 应用。没有单一指标可以优化;「好」取决于完整性、视觉精致度和交互质量。</p>
<p>我们用一个有意的 ambitious prompt 测试了这一点:构建一个 Linux 风格的桌面环境作为 Web 应用。没有 starter code,没有设计 mockup,没有中间指导。在单次运行中,大多数模型——包括 GLM 的早期版本——很快就会放弃:它们生成一个带有静态 taskbar 和一两个 placeholder window 的基本骨架,然后声明任务完成。模型没有机制来退后一步并思考缺少了什么。</p>
<p>我们为 GLM-5.1 包装了一个简单的 harness 来改变这一点:在每轮执行后,模型审查自己的输出,识别可以改进的地方——缺失的功能、粗糙的样式、破损的交互——然后继续。这个循环运行了 8 小时,差异是显著的。</p>
<p>早期,GLM-5.1 交付了一个带有 taskbar 和简单窗口的基本布局——与短会话会产生的结果类似。但它没有就此停止。随着它继续,系统逐步充实:file browser, terminal, text editor, system monitor, calculator, games——每个新功能都被整合到一个连贯的 UI 中,而不是作为事后补充 bolted on。样式变得更加精致,交互更加流畅,边界情况得到处理。最终,结果是一个完整的、视觉上统一的桌面环境,在浏览器中运行——当模型被给予时间和能力来持续改进时,什么变得可能的一个具体示例。</p>
<blockquote>
<p>译者注: 这个 8 小时 Linux 桌面案例是 GLM-5.1 最有说服力的演示,也是最有争议的。说它最有说服力,是因为它展示了一个没有任何数值反馈的开放-ended 任务中,模型如何通过自我评估持续迭代。说它最有争议,是因为「完整的 Linux 桌面环境」这个描述缺乏可量化的标准——我们无法知道这个「桌面」的功能完备性达到什么程度,代码质量如何,是否存在安全漏洞。与 VectorDBBench 和 KernelBench 不同,这个场景没有第三方可复现的 benchmark 框架。此外,harness 的设计(让模型在每轮后审查自己的输出)对结果的影响可能不亚于模型本身的能力。这是一个精彩的演示,但作为技术报告中的「证据」,其严谨性弱于前两个场景。</p>
</blockquote>
<h2 id="ccyhdkfqy">长程优化的开放前沿</h2>
<p>在所有三个设定中,关键变量不是运行时间本身,而是额外的运行时间是否仍然有用。GLM-5.1 将这一 productive horizon 有意义地扩展到了 GLM-5 之外,而在 KernelBench 等任务上剩余的差距表明,长程优化仍然是一个开放的前沿。仍然存在重大挑战:当增量调优停止带来回报时,更早地逃离局部最优;在跨越数千次 tool call 的执行轨迹中保持连贯性;以及——或许最重要的——为没有数值指标可以优化的任务开发可靠的自我评估。GLM-5.1 是我们朝这个方向迈出的第一步,我们将继续在这些方面推进。</p>
<blockquote>
<p>译者注: 作者在这里的坦诚值得肯定。他们没有将 GLM-5.1 描述为「解决了长程优化问题」,而是明确指出了三个 remaining challenges:局部最优逃逸、长轨迹连贯性、无指标任务的自我评估。这三个问题确实是当前 agentic AI 的核心瓶颈。特别值得注意的是第三点:当没有外部 metric 时,模型的自我评估质量直接决定了迭代的上限。如果模型高估了自己的输出(overconfidence),它会陷入「自我满足」的循环;如果低估(underconfidence),它会过度修改而引入 regressions。GLM-5.1 在 8 小时桌面案例中展示了初步能力,但这距离「可靠」还有相当距离。</p>
</blockquote>
<h2 id="pcjzyhxdb">评测基准与横向对比</h2>
<p>以下表格汇总了 GLM-5.1 在 Reasoning, Coding 和 Agentic 三大类共 16 项 benchmark 上的表现,并与 GLM-5, Qwen3.6-Plus, MiniMax M2.7, DeepSeek-V3.2, Kimi K2.5, Claude Opus 4.6, Gemini 3.1 Pro 和 GPT-5.4 进行了横向对比。</p>
<table>
<thead>
<tr>
<th align="left">Benchmark</th>
<th align="center">GLM-5.1</th>
<th align="center">GLM-5</th>
<th align="center">Qwen3.6-Plus</th>
<th align="center">MiniMax M2.7</th>
<th align="center">DeepSeek-V3.2</th>
<th align="center">Kimi K2.5</th>
<th align="center">Claude Opus 4.6</th>
<th align="center">Gemini 3.1 Pro</th>
<th align="center">GPT-5.4</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Reasoning</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HLE</td>
<td align="center">31.0</td>
<td align="center">30.5</td>
<td align="center">28.8</td>
<td align="center">28.0</td>
<td align="center">25.1</td>
<td align="center">31.5</td>
<td align="center">36.7</td>
<td align="center">45.0</td>
<td align="center">39.8</td>
</tr>
<tr>
<td align="left">HLE w/ Tools</td>
<td align="center">52.3</td>
<td align="center">50.4</td>
<td align="center">50.6</td>
<td align="center">-</td>
<td align="center">40.8</td>
<td align="center">51.8</td>
<td align="center">53.1*</td>
<td align="center">51.4*</td>
<td align="center">52.1*</td>
</tr>
<tr>
<td align="left">AIME 2026</td>
<td align="center">95.3</td>
<td align="center">95.4</td>
<td align="center">95.1</td>
<td align="center">89.8</td>
<td align="center">95.1</td>
<td align="center">94.5</td>
<td align="center">95.6</td>
<td align="center">98.2</td>
<td align="center">98.7</td>
</tr>
<tr>
<td align="left">HMMT Nov. 2025</td>
<td align="center">94.0</td>
<td align="center">96.9</td>
<td align="center">94.6</td>
<td align="center">81.0</td>
<td align="center">90.2</td>
<td align="center">91.1</td>
<td align="center">96.3</td>
<td align="center">94.8</td>
<td align="center">95.8</td>
</tr>
<tr>
<td align="left">HMMT Feb. 2026</td>
<td align="center">82.6</td>
<td align="center">82.8</td>
<td align="center">87.8</td>
<td align="center">72.7</td>
<td align="center">79.9</td>
<td align="center">81.3</td>
<td align="center">84.3</td>
<td align="center">87.3</td>
<td align="center">91.8</td>
</tr>
<tr>
<td align="left">IMOAnswerBench</td>
<td align="center">83.8</td>
<td align="center">82.5</td>
<td align="center">83.8</td>
<td align="center">66.3</td>
<td align="center">78.3</td>
<td align="center">81.8</td>
<td align="center">75.3</td>
<td align="center">81.0</td>
<td align="center">91.4</td>
</tr>
<tr>
<td align="left">GPQA-Diamond</td>
<td align="center">86.2</td>
<td align="center">86.0</td>
<td align="center">90.4</td>
<td align="center">87.0</td>
<td align="center">82.4</td>
<td align="center">87.6</td>
<td align="center">91.3</td>
<td align="center">94.3</td>
<td align="center">92.0</td>
</tr>
<tr>
<td align="left"><strong>Coding</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">SWE-Bench Pro</td>
<td align="center">58.4</td>
<td align="center">55.1</td>
<td align="center">56.6</td>
<td align="center">56.2</td>
<td align="center">-</td>
<td align="center">53.8</td>
<td align="center">57.3</td>
<td align="center">54.2</td>
<td align="center">57.7</td>
</tr>
<tr>
<td align="left">NL2Repo</td>
<td align="center">42.7</td>
<td align="center">35.9</td>
<td align="center">37.9</td>
<td align="center">39.8</td>
<td align="center">-</td>
<td align="center">32.0</td>
<td align="center">49.8</td>
<td align="center">33.4</td>
<td align="center">41.3</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0 (Terminus-2)</td>
<td align="center">63.5</td>
<td align="center">56.2</td>
<td align="center">61.6</td>
<td align="center">-</td>
<td align="center">39.3</td>
<td align="center">50.8</td>
<td align="center">65.4</td>
<td align="center">68.5</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0 (Best harness)</td>
<td align="center">69.0 (Claude Code)</td>
<td align="center">56.2 (Claude Code)</td>
<td align="center">-</td>
<td align="center">57.0 (Claude Code)</td>
<td align="center">46.4 (Claude Code)</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">75.1 (Codex)</td>
</tr>
<tr>
<td align="left">CyberGym</td>
<td align="center">68.7</td>
<td align="center">48.3</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">17.3</td>
<td align="center">41.3</td>
<td align="center">66.6</td>
<td align="center">38.8</td>
<td align="center">66.3</td>
</tr>
<tr>
<td align="left"><strong>Agentic</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">BrowseComp</td>
<td align="center">68.0</td>
<td align="center">62.0</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">51.4</td>
<td align="center">60.6</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">BrowseComp w/ Context Manage</td>
<td align="center">79.3</td>
<td align="center">75.9</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">67.6</td>
<td align="center">74.9</td>
<td align="center">84.0</td>
<td align="center">85.9</td>
<td align="center">82.7</td>
</tr>
<tr>
<td align="left">tau^3-Bench</td>
<td align="center">70.6</td>
<td align="center">69.2</td>
<td align="center">70.7</td>
<td align="center">67.6</td>
<td align="center">69.2</td>
<td align="center">66.0</td>
<td align="center">72.4</td>
<td align="center">67.1</td>
<td align="center">72.9</td>
</tr>
<tr>
<td align="left">MCP-Atlas (Public Set)</td>
<td align="center">71.8</td>
<td align="center">69.2</td>
<td align="center">74.1</td>
<td align="center">48.8</td>
<td align="center">62.2</td>
<td align="center">63.8</td>
<td align="center">73.8</td>
<td align="center">69.2</td>
<td align="center">67.2</td>
</tr>
<tr>
<td align="left">Tool-Decathlon</td>
<td align="center">40.7</td>
<td align="center">38.0</td>
<td align="center">39.8</td>
<td align="center">46.3</td>
<td align="center">35.2</td>
<td align="center">27.8</td>
<td align="center">47.2</td>
<td align="center">48.8</td>
<td align="center">54.6</td>
</tr>
<tr>
<td align="left">Vending Bench 2</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo separator="true">,</mo><mn>634.41</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">5,634.41 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">634.41∣</span></span></span></span>4,432.12</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo separator="true">,</mo><mn>114.87</mn><mi mathvariant="normal">∣</mi><mo>−</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">5,114.87 | - |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">114.87∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∣</span></span></span></span>1,034.00</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo separator="true">,</mo><mn>198.46</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">1,198.46 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">198.46∣</span></span></span></span>8,017.59</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>911.21</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">911.21 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">911.21∣</span></span></span></span>6,144.18</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<blockquote>
<p>*注: 带 * 号的结果来自完整数据集(full set),其余为 text-only subset。</p>
</blockquote>
<blockquote>
<p>译者注: 这张表格的信息密度很高,值得逐类分析。在 Reasoning 类别中,GLM-5.1 与 GLM-5 的差距很小(HLE 31.0 vs 30.5, AIME 2026 95.3 vs 95.4),说明后训练(post-training)对纯推理能力的提升有限——这与 Kimi K2.6 的情况类似,架构不变,后训练主要针对特定任务分布。Coding 类别是 GLM-5.1 的主要战场:SWE-Bench Pro 58.4% 超过 GLM-5 的 55.1%,CyberGym 68.7% 更是大幅领先 GLM-5 的 48.3%。Agentic 类别的 BrowseComp 68.0% 和 Vending Bench 2 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo separator="true">,</mo><mn>634</mn><mtext>也显示出</mtext><mi>a</mi><mi>g</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>i</mi><mi>c</mi><mtext>能力的增强。一个有趣的对照是</mtext><mi>C</mi><mi>l</mi><mi>a</mi><mi>u</mi><mi>d</mi><mi>e</mi><mi>O</mi><mi>p</mi><mi>u</mi><mi>s</mi><mn>4.6</mn><mtext>在</mtext><mi>V</mi><mi>e</mi><mi>n</mi><mi>d</mi><mi>i</mi><mi>n</mi><mi>g</mi><mi>B</mi><mi>e</mi><mi>n</mi><mi>c</mi><mi>h</mi><mn>2</mn><mtext>上高达</mtext></mrow><annotation encoding="application/x-tex">5,634 也显示出 agentic 能力的增强。一个有趣的对照是 Claude Opus 4.6 在 Vending Bench 2 上高达</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">5</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">634</span><span class="mord cjk_fallback">也显示出</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal">c</span><span class="mord cjk_fallback">能力的增强。一个有趣的对照是</span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">a</span><span class="mord mathnormal">u</span><span class="mord mathnormal">d</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mord mathnormal">p</span><span class="mord mathnormal">u</span><span class="mord mathnormal">s</span><span class="mord">4.6</span><span class="mord cjk_fallback">在</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">d</span><span class="mord mathnormal">in</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">c</span><span class="mord mathnormal">h</span><span class="mord">2</span><span class="mord cjk_fallback">上高达</span></span></span></span>8,017 的成绩,说明在需要复杂经济决策的 agentic 任务上,闭源模型仍有优势。另外,部分 benchmark 存在 harness 差异(如 Terminal-Bench 2.0 同时报告了 Terminus-2 和 Claude Code 两种 harness 的结果),横向对比时需要注意 harness 的一致性。</p>
</blockquote>
<h2 id="ky-bsystjr">开源、部署与生态接入</h2>
<p>GLM-5.1 以 MIT License 开源发布。模型权重已在 HuggingFace 和 ModelScope 上公开。本地部署方面,GLM-5.1 支持 vLLM 和 SGLang 等推理框架。完整的部署指南可在官方 GitHub 仓库获取。</p>
<p>GLM-5.1 也可通过 Z.ai 开发者平台 api.z.ai 和 BigModel.cn 访问,并兼容 Claude Code 和 OpenClaw。</p>
<h3 id="glm-coding-plan-dj">GLM Coding Plan 定价</h3>
<p>GLM-5.1 已集成至 GLM Coding Plan。订阅用户可以在常用的 coding agent 中启用 GLM-5.1,包括 Claude Code, OpenCode, Kilo Code, Roo Code, Cline, Droid 等。作为 Z.ai 当前最强的模型,GLM-5.1 在高峰时段按 3x 配额消耗,非高峰时段按 2x 消耗。限时促销期间(截至 4 月底),非高峰时段按 1x 计费。高峰时段为每日 UTC+8(北京时间)14:00-18:00。</p>
<p>Z.ai 同时提供 Z Code——一个统一界面,支持多个 agent 协同工作。用户可以通过 SSH 在远程机器上开发,或从手机发起任务后稍后查看结果。</p>
<blockquote>
<p>译者注: GLM-5.1 的定价策略透露了一个有趣的信号。高峰时段 3x 配额消耗意味着模型推理成本显著高于 GLM-5,这与它 754B MoE / 40B active 的架构一致——虽然 active 参数只有 40B,但长程 agentic 任务中 tool call 的频次和上下文长度都会大幅增加 token 消耗。MIT License 的开源发布是 Z.ai 的一个重要差异化策略,在与 Claude Opus 4.6(闭源,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">5/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5/</span></span></span></span>25 per 1M tokens)和 GPT-5.4(闭源)的竞争中,开源权重为企业自托管提供了选项。不过,754B 总参数对自托管硬件的要求极高(通常需要多卡 A100/H100 或同等国产芯片),实际落地成本不一定低于 API 调用。</p>
</blockquote>
<h2 id="fl">附录</h2>
<h3 id="a-syb">A. 术语表</h3>
<table>
<thead>
<tr>
<th>英文术语</th>
<th>中文译名</th>
<th>首次出现位置</th>
<th>简要解释</th>
</tr>
</thead>
<tbody><tr>
<td>Agentic engineering</td>
<td>智能体工程</td>
<td>开头段落</td>
<td>以自主 agent 为核心范式进行软件工程的方法论,强调模型在长时间内自主规划、执行和迭代</td>
</tr>
<tr>
<td>ANN</td>
<td>近似最近邻搜索</td>
<td>场景一</td>
<td>Approximate Nearest Neighbor,在高维空间中快速找到与查询向量相近的向量,牺牲少量精度换取大幅速度提升</td>
</tr>
<tr>
<td>Cluster probing</td>
<td>Cluster 探测</td>
<td>场景一</td>
<td>IVF(Inverted File Index)索引中的查询策略,仅搜索最相关的 cluster 而非全量数据</td>
</tr>
<tr>
<td>f16 / u8</td>
<td>16-bit 浮点 / 8-bit 无符号整数</td>
<td>场景一</td>
<td>量化精度,f16 为半精度浮点,u8 为 8-bit 无符号整数,用于降低内存带宽和计算量</td>
</tr>
<tr>
<td>VNNI</td>
<td>向量神经网络指令</td>
<td>场景一</td>
<td>Vector Neural Network Instructions,Intel 和 ARM 处理器中的 SIMD 指令集,用于加速低精度矩阵运算</td>
</tr>
<tr>
<td>Cache locality</td>
<td>Cache 局部性</td>
<td>场景一</td>
<td>数据访问模式的空间/时间局部性,良好的 cache locality 减少缓存未命中,提升性能</td>
</tr>
<tr>
<td>Kernel</td>
<td>GPU Kernel</td>
<td>场景二</td>
<td>在 GPU 上执行的计算函数,通常由 CUDA 或 Triton 编写,用于替代 PyTorch 的 eager execution</td>
</tr>
<tr>
<td>Speedup</td>
<td>加速比</td>
<td>场景二</td>
<td>优化后执行时间与基线执行时间的比值,speedup = baseline_time / optimized_time</td>
</tr>
<tr>
<td>Geometric mean</td>
<td>几何平均</td>
<td>场景二</td>
<td>对一组 speedup 值取几何平均而非算术平均,避免个别极端值(过高或过低)主导结果</td>
</tr>
<tr>
<td>Tool call / Turn</td>
<td>Tool 调用 / 轮次</td>
<td>场景二</td>
<td>模型调用外部工具(如文件读写、编译、执行命令)的一次交互,turn 数是衡量 agent 交互复杂度的指标</td>
</tr>
<tr>
<td>Harness</td>
<td>执行框架 /  harness</td>
<td>场景二</td>
<td>围绕模型构建的执行环境,包括 tool 注册、状态管理、反馈循环等基础设施</td>
</tr>
<tr>
<td>Recall</td>
<td>召回率</td>
<td>场景一</td>
<td>在 ANN 中,返回的最近邻中真正属于 top-k  nearest neighbors 的比例</td>
</tr>
<tr>
<td>QPS</td>
<td>每秒查询数</td>
<td>场景一</td>
<td>Queries Per Second,数据库或搜索引擎的吞吐量指标</td>
</tr>
<tr>
<td>HLE</td>
<td>Humanity&#39;s Last Exam</td>
<td>评测表格</td>
<td>高难度推理 benchmark,包含跨学科的极难题目</td>
</tr>
<tr>
<td>SWE-Bench Pro</td>
<td>软件工程基准(专业版)</td>
<td>评测表格</td>
<td>基于真实 GitHub issue 的代码修复 benchmark,Pro 版增加了任务难度和多样性</td>
</tr>
<tr>
<td>NL2Repo</td>
<td>自然语言到代码仓库</td>
<td>评测表格</td>
<td>从自然语言描述生成完整代码仓库的 benchmark</td>
</tr>
<tr>
<td>tau^3-Bench</td>
<td>多领域对话代理基准</td>
<td>评测表格</td>
<td>评估模型在多轮对话中完成复杂任务(如银行业务、旅行预订)的能力</td>
</tr>
<tr>
<td>MCP-Atlas</td>
<td>模型上下文协议图谱</td>
<td>评测表格</td>
<td>评估模型使用 MCP(Model Context Protocol)工具完成多样化任务的能力</td>
</tr>
<tr>
<td>Vending Bench</td>
<td>自动售货机基准</td>
<td>评测表格</td>
<td>模拟复杂经济决策环境的 agentic benchmark,以最终获利金额评分</td>
</tr>
</tbody></table>
<h3 id="b-pcszxq">B. 评测设置详情</h3>
<p>以下评测设置均取自原文 footnote,逐字翻译以保留可复现性。</p>
<p><strong>Humanity&#39;s Last Exam(HLE)及其他推理任务</strong>: 使用最大生成长度 163,840 tokens(temperature=1.0, top_p=0.95, max_new_tokens=163840)。默认报告 text-only subset 结果;带 * 号的结果来自 full set。使用 GPT-5.2(medium)作为 judge 模型。HLE-with-tools 使用最大上下文长度 202,752 tokens。</p>
<p><strong>SWE-Bench Pro</strong>: 使用 OpenHands 运行 SWE-Bench Pro 套件,配合定制的 instruction prompt。设置: temperature=1, top_p=0.95, max_new_tokens=32768,上下文窗口 200K。</p>
<p><strong>NL2Repo</strong>: 在 200K 上下文下使用 temperature=1.0, top_p=1.0, max_new_tokens=32768 进行评估。为防止作弊,使用基于规则的预检测拦截恶意命令(如未授权的 pip 或 curl 操作),随后进行基于模型的判断。恶意行为被立即拦截。</p>
<p><strong>BrowseComp</strong>: 无上下文管理时,保留最近 5 轮的细节。有上下文管理时,使用与 GLM-5 和 DeepSeek-V3.2 相同的 discard-all 策略。</p>
<p><strong>Terminal-Bench 2.0(Terminus-2)</strong>: 使用 Terminus 框架评估,设置 timeout=3h, temperature=1.0, top_p=1.0, max_new_tokens=8192,上下文窗口 200K。资源限制为 16 CPUs 和 32 GB RAM。</p>
<p><strong>Terminal-Bench 2.0(Claude Code)</strong>: 在 Claude Code 2.1.69(think mode)中评估,设置 temperature=1.0, top_p=0.95, max_new_tokens=131072。通过透明代理将 max_new_tokens 覆盖为 128k,绕过 64k CLI cap 以恢复 CLAUDE_CODE_MAX_OUTPUT_TOKENS 的可配置性。移除 wall-clock 时间限制,同时保留每任务的 CPU 和内存约束。修复 Claude Code 引入的环境问题。分数取 5 次运行的平均值。</p>
<p><strong>CyberGym</strong>: GLM-5.1 在 Claude Code 2.1.56(think mode, no web tools)中评估,设置 temperature=1.0, top_p=1.0, max_new_tokens=32000;Gemini 3.1 Pro 在 Gemini CLI 0.36.0 中评估(默认 temperature, top_p 和 max_new_tokens=32000);GPT-5.4 在 Codex CLI 0.118.0 中评估(默认 temperature, top_p 和高推理 effort)。所有评测在 250 分钟每任务超时限制下进行,结果为 1,507 个任务的单次运行 Pass@1。在 Gemini 3.1 Pro 和 GPT-5.4 的评测中,两个模型有时会将任务识别为存在安全风险并拒绝继续,这可能降低了它们的分数。</p>
<p><strong>MCP-Atlas</strong>: 所有模型在 think mode 下在 500-task public subset 上评估,每任务 10 分钟超时。使用 Gemini-3.0-Pro 作为 judge 模型。</p>
<p><strong>tau^3-bench</strong>: 在所有领域中为用户模拟器添加了额外 prompt,以避免用户过早结束交互导致的失败模式。Banking 领域使用基于 terminal 的 agentic search retrieval(terminal_use)。用户模拟器: GPT-5.2(reasoning_effort: low),4 trials。</p>
<p><strong>Vending Bench 2</strong>: 由 Andon Labs 独立运行。</p>
<p><strong>KernelBench Level 3</strong>: 每个问题在隔离的 Docker 容器中运行,配备一块 H100 GPU,限制 1,200 tool-use turns。正确性(atol=rtol=1e-4)和性能在独立的 CUDA context 中针对 PyTorch eager baseline 进行评估。所有解决方案均由 Claude Opus 4.6(max effort)和 GPT-5.4(xhigh)独立审计 benchmark exploitation:每次审计验证优化是否利用了 benchmark 特定的行为、是否适用于任意新输入、以及是否将所有计算保留在默认 CUDA stream 上。采用两次审计中较低的 speedup,并设置 50x 硬上限以限制异常值的影响。</p>
<blockquote>
<p>译者注: 这些 footnote 的技术细节值得特别关注。第一,多个 benchmark 使用了不同的 harness(Claude Code, Terminus, Codex CLI, Gemini CLI),这意味着横向对比存在 harness 变量——同样的模型在不同 harness 下表现可能差异显著。第二,CyberGym 的评测中 Gemini 3.1 Pro 和 GPT-5.4 存在「安全拒绝」现象,说明 benchmark 设计可能触发了模型的安全过滤器,这提示 benchmark 本身也需要迭代。第三,KernelBench 的审计机制(Claude Opus 4.6 + GPT-5.4 双重审计)是一个值得推广的做法,它防止了模型通过「作弊」(如利用 benchmark 特定行为)来获取虚高 speedup。但审计本身也引入了主观性:两个 judge 模型对「是否 exploitation」的判断可能不一致。</p>
</blockquote>
<h3 id="c-mxpxdw">C. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: GLM-5(arXiv:2602.15763)。GLM-5.1 与 GLM-5 共享相同的 754B MoE 架构(256 experts, 8 activated per token, ~40B active),相同的 200K 上下文窗口,相同的 DeepSeek Sparse Attention(DSA)注意力机制,以及相同的 28.5T tokens 预训练数据。</li>
<li><strong>核心创新</strong>: 后训练(post-training)阶段针对长程 agentic 任务进行了重新定向。通过 multi-turn SFT, RL 和 process-quality evaluation framework,显著提升了模型在长时间运行中的稳定性、一致性和 tool use 能力。关键差异不是架构,而是训练目标函数和任务分布的重新设计。</li>
<li><strong>被后续工作引用</strong>: 截至 2026-05-18,尚无直接引用 GLM-5.1 的公开学术工作。但其「长程优化」评测范式(VectorDBBench outer loop, KernelBench long-horizon tracking)已被社区关注和讨论。</li>
<li><strong>技术谱系中的位置</strong>: GLM-5.1 属于 GLM 家族的后训练迭代路线,与 GLM-5-Turbo(侧重吞吐量和稳定性), GLM-5V-Turbo(多模态 agent)形成互补的产品矩阵。在同期的开源模型中,GLM-5.1 的长程 agentic 能力与 MiniMax M2.7(自我进化)和 Kimi K2.6(Agent Swarm)构成三种不同的技术路线:GLM-5.1 强调「持续迭代优化」,MiniMax M2.7 强调「harness 自我进化」,Kimi K2.6 强调「多 agent 协作 orchestration」。</li>
</ul>
<blockquote>
<p>译者注: GLM-5.1 的发布节奏反映了 Z.ai 在 2026 年 IPO 后的加速态势:GLM-5(2026-02-11) -&gt; GLM-5-Turbo(2026-03-15) -&gt; GLM-5.1 API(2026-03-27) -&gt; GLM-5.1 开源权重(2026-04-07)。六周内三个重大发布,这种 cadence 在业界极为罕见。但快速迭代也带来了技术债务的风险:GLM-5.1 的「长程能力」是否经过了充分的独立验证?其 benchmark 结果是否能在社区复现?这些都是需要时间回答的问题。从更宏观的视角看,GLM-5.1, MiniMax M2.7 和 Kimi K2.6 在 2026 年 Q1-Q2 的密集发布,标志着国产开源模型从「追赶闭源 SOTA」转向了「差异化竞争」——不再单纯比拼 benchmark 分数,而是在 agentic 能力、长程优化、自我进化等维度上建立独特的技术叙事。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"mxdwyhxzz","text":"模型定位与核心主张"},{"level":2,"id":"cjy-600-lddyhxlsjk","text":"场景一: 600 轮迭代优化向量数据库"},{"level":2,"id":"cje-1000-turn-yhjqxxfz","text":"场景二: 1000+ Turn 优化机器学习负载"},{"level":2,"id":"cjs-8-xsgj-linux-zm","text":"场景三: 8 小时构建 Linux 桌面"},{"level":2,"id":"ccyhdkfqy","text":"长程优化的开放前沿"},{"level":2,"id":"pcjzyhxdb","text":"评测基准与横向对比"},{"level":2,"id":"ky-bsystjr","text":"开源、部署与生态接入"},{"level":3,"id":"glm-coding-plan-dj","text":"GLM Coding Plan 定价"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-pcszxq","text":"B. 评测设置详情"},{"level":3,"id":"c-mxpxdw","text":"C. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/11-glm-5.1/01-glm-5.1-jsbgjy-2" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/11-glm-5.1/01-glm-5.1-jsbgjy-2" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5.1 技术报告精译</h1>
          <p className="text-paper-800/50">{t("From LLM Guide", "来自 LLM 指南")}</p>
        </header>
        <article
          className="paper-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-paper-200 dark:border-slate-700 bg-paper-50 dark:bg-slate-900">
        <LlmGuideToc items={toc} />
      </aside>
    </div>
  );
}
