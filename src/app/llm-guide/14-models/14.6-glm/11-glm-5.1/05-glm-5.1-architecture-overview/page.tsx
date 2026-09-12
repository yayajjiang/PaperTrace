"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5.1 长程任务与 Agent 架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: GLM-5.1: Toward Long-Horizon Tasks (Z.ai Blog, 2026-04-07)
<strong>剖析角度</strong>: 长程优化范式、三场景深度拆解、后训练重新定向、 harness 工程
<strong>面向读者</strong>: 已阅读 GLM-5.1 技术报告精译,希望深入理解长程 Agent 能力构建方法论的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-hxfszy-c-sszn-quot-d-cxzn-quot">1. 核心范式转移:从「瞬时智能&quot;到「持续智能&quot;</h2>
<p>GLM-5.1 的核心主张不是「单次做得更好&quot;,而是「给你八小时,你能持续改进到什么地步&quot;.这本质上是在推动 Agent 评测从「瞬时智能&quot;向「持续智能&quot;的范式转移.</p>
<table>
<thead>
<tr>
<th align="left">评测维度</th>
<th align="left">传统范式(Pass@1)</th>
<th align="left">GLM-5.1 范式(长程优化)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">核心指标</td>
<td align="left">单次尝试成功率</td>
<td align="left">持续迭代后的最终性能</td>
</tr>
<tr>
<td align="left">时间尺度</td>
<td align="left">秒级/分钟级</td>
<td align="left">小时级(8 小时)</td>
</tr>
<tr>
<td align="left">交互轮次</td>
<td align="left">1-50 turn</td>
<td align="left">600-1000+ turn</td>
</tr>
<tr>
<td align="left">Tool call 数量</td>
<td align="left">数十次</td>
<td align="left">数千次</td>
</tr>
<tr>
<td align="left">反馈结构</td>
<td align="left">明确数值指标</td>
<td align="left">从数值到主观判断的渐进</td>
</tr>
<tr>
<td align="left">能力要求</td>
<td align="left">一次性正确推理</td>
<td align="left">持续诊断、调整、突破局部最优</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 传统 Pass@1 指标衡量的是模型在第一次尝试中解决问题的概率,但它完全忽略了真实软件工程中一个至关重要的维度——时间.人类工程师解决复杂 bug 往往不是一次写对,而是在调试-测试-修复的循环中逐步逼近正确解.</p>
</blockquote>
<hr>
<h2 id="2-jgjz-y-glm-5-gxd-754b-moe">2. 架构基座:与 GLM-5 共享的 754B MoE</h2>
<p>GLM-5.1 与 GLM-5 共享完全相同的架构基座,差异仅在 post-training 阶段:</p>
<table>
<thead>
<tr>
<th align="left">配置项</th>
<th align="left">规格</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">754B MoE</td>
</tr>
<tr>
<td align="left">Expert 数量</td>
<td align="left">256</td>
</tr>
<tr>
<td align="left">每 token 激活专家数</td>
<td align="left">8</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">~40B</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">200K</td>
</tr>
<tr>
<td align="left">注意力机制</td>
<td align="left">DeepSeek Sparse Attention (DSA)</td>
</tr>
<tr>
<td align="left">预训练数据</td>
<td align="left">28.5T tokens</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>重要含义</strong>: GLM-5.1 的能力提升不是来自架构创新,而是来自训练目标函数和任务分布的重新设计.这意味着「长程 Agent 能力&quot;主要是一个「后训练问题&quot;而非「架构问题&quot;——同样的 754B MoE 基座,通过不同的 SFT 和 RL 任务分布,可以被塑造为擅长长程优化的模型.</p>
</blockquote>
<hr>
<h2 id="3-cjy-vector-db-bench-jghszyhdjx">3. 场景一:VectorDBBench —— 结构化数值优化的极限</h2>
<h3 id="3-1-rwsd">3.1 任务设定</h3>
<p>VectorDBBench 评估模型构建高性能 ANN(Approximate Nearest Neighbor)数据库的能力.模型获得 Rust 骨架代码,通过 tool-call agent 在每次迭代中编辑代码、编译、测试和分析,自主决定何时提交以及下一步尝试什么.</p>
<table>
<thead>
<tr>
<th align="left">对比维度</th>
<th align="left">原始设定</th>
<th align="left">GLM-5.1 重构设定</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Tool-call budget</td>
<td align="left">50 turn(固定)</td>
<td align="left">无限制(outer optimization loop)</td>
</tr>
<tr>
<td align="left">迭代次数</td>
<td align="left">单次 session</td>
<td align="left">600+ 次提交</td>
</tr>
<tr>
<td align="left">Tool call 总量</td>
<td align="left">~50 次</td>
<td align="left">6,000+ 次</td>
</tr>
<tr>
<td align="left">此前最佳</td>
<td align="left">Claude Opus 4.6: 3,547 QPS</td>
<td align="left">GLM-5.1: <strong>21,500 QPS</strong> (6x 提升)</td>
</tr>
</tbody></table>
<h3 id="3-2-yhgjdjtms">3.2 优化轨迹的阶梯模式</h3>
<p>GLM-5.1 的优化轨迹呈现出特征性的「阶梯模式&quot;:在固定策略内进行增量调优的周期,被结构性变化打断,每次结构性变化都将性能前沿推向更高.</p>
<table>
<thead>
<tr>
<th align="center">迭代区间</th>
<th align="left">优化策略</th>
<th align="center">QPS</th>
<th align="center">策略类型</th>
</tr>
</thead>
<tbody><tr>
<td align="center">初始</td>
<td align="left">全量序列扫描</td>
<td align="center">~3,500</td>
<td align="center">基线</td>
</tr>
<tr>
<td align="center">~90</td>
<td align="left">IVF Cutover: cluster 扫描 + f16 压缩</td>
<td align="center">6,400</td>
<td align="center"><strong>结构性 transition</strong></td>
</tr>
<tr>
<td align="center">~180</td>
<td align="left">嵌套并行性移除:单线程 + 外部并发</td>
<td align="center">10,400</td>
<td align="center"><strong>结构性 transition</strong></td>
</tr>
<tr>
<td align="center">~240</td>
<td align="left">两阶段搜索:u8 prescore + f16 rerank</td>
<td align="center">13,400</td>
<td align="center"><strong>结构性 transition</strong></td>
</tr>
<tr>
<td align="center">~350</td>
<td align="left">Budget Trim:减少 Phase 1 输出</td>
<td align="center">15,500</td>
<td align="center">增量调优</td>
</tr>
<tr>
<td align="center">~450</td>
<td align="left">两级路由:super-cluster coarse-to-fine</td>
<td align="center">18,400</td>
<td align="center"><strong>结构性 transition</strong></td>
</tr>
<tr>
<td align="center">~520</td>
<td align="left">u8 路由 + VNNI 量化</td>
<td align="center">20,300</td>
<td align="center"><strong>结构性 transition</strong></td>
</tr>
<tr>
<td align="center">~580</td>
<td align="left">早期剪枝:跳过低质量 cluster</td>
<td align="center">21,500</td>
<td align="center"><strong>结构性 transition</strong></td>
</tr>
<tr>
<td align="center">最终</td>
<td align="left">无进一步改进</td>
<td align="center">21,500</td>
<td align="center">平台期</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键发现</strong>: 六个结构性 transition 每一个都对应着工程上合理的优化方向,且顺序大致符合人类工程师的优化直觉:先做 IVF 降维(~90),再做并行优化(~180),再做分层路由(~450-520).但关键差异在于,人类工程师通常需要数天或数周来逐步尝试这些方向,而 GLM-5.1 在数百轮迭代中自主完成了这一过程.</p>
</blockquote>
<h3 id="3-3-xphl-quot-dysgl">3.3 「先破后立&quot;的约束管理</h3>
<p>图表中的红色叉号标记了 Recall 低于 95% 的迭代——这些叉号集中在每次 major transition 周围.这说明模型在探索新策略时愿意暂时打破约束,然后再修复.这种「先破后立&quot;的策略在工程探索中有价值,但在生产环境中有风险:如果约束是硬性的(如 SLA),临时打破约束可能导致不可逆后果.</p>
<hr>
<h2 id="4-cje-kernel-bench-yjddccyh">4. 场景二:KernelBench —— 有监督的长程优化</h2>
<h3 id="4-1-rwsd">4.1 任务设定</h3>
<p>KernelBench 评估模型将 PyTorch 实现转换为更快 GPU kernel 的能力,同时保持输出一致.Level 3 覆盖完整模型(MobileNet, VGG, MiniGPT, Mamba 等)的端到端优化,共 50 个问题.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">几何平均 Speedup</th>
<th align="left">长程行为特征</th>
</tr>
</thead>
<tbody><tr>
<td align="left">torch.compile (默认)</td>
<td align="center">1.15x</td>
<td align="left">基线</td>
</tr>
<tr>
<td align="left">torch.compile (max-autotune)</td>
<td align="center">1.49x</td>
<td align="left">基线</td>
</tr>
<tr>
<td align="left">GLM-5</td>
<td align="center">~2.5x</td>
<td align="left">初期改进快,较早达到平台期</td>
</tr>
<tr>
<td align="left"><strong>GLM-5.1</strong></td>
<td align="center"><strong>3.6x</strong></td>
<td align="left"><strong>持续时间显著更长,后期仍有进展</strong></td>
</tr>
<tr>
<td align="left">Claude Opus 4.6</td>
<td align="center"><strong>4.2x</strong></td>
<td align="left">绝对最强,结束时仍有余量</td>
</tr>
</tbody></table>
<h3 id="4-2-gjssddssjgl">4.2 改进速率的对数衰减规律</h3>
<p>所有模型的改进速率都随时间呈对数衰减,但衰减速率不同:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="left">衰减特征</th>
<th align="left">含义</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM-5</td>
<td align="left">衰减快,早期平台期</td>
<td align="left">容易陷入局部最优</td>
</tr>
<tr>
<td align="left">GLM-5.1</td>
<td align="left">衰减慢,持续时间长</td>
<td align="left">更晚达到平台期,更有可能找到更优解</td>
</tr>
<tr>
<td align="left">Claude Opus 4.6</td>
<td align="left">衰减慢,绝对性能最高</td>
<td align="left">当前长程优化的天花板</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: GLM-5.1 的衰减速率比 GLM-5 更慢,意味着它能在更长的时间范围内保持有效优化.但这种差异的来源不仅是模型本身,还包括 harness 的质量——如果 harness 不能提供足够丰富的反馈(如 profiling 数据、编译错误信息),模型即使有能力也无法发挥.</p>
</blockquote>
<hr>
<h2 id="5-cjs-8-xsgj-linux-zm-wzbdzwqdyh">5. 场景三:8 小时构建 Linux 桌面 —— 无指标的自我驱动优化</h2>
<h3 id="5-1-rwsd">5.1 任务设定</h3>
<p>构建一个 Linux 风格的桌面环境作为 Web 应用.没有 starter code,没有设计 mockup,没有中间指导,没有任何数值指标可以优化.</p>
<table>
<thead>
<tr>
<th align="left">对比</th>
<th align="left">短会话模型</th>
<th align="left">GLM-5.1(8 小时)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">初始输出</td>
<td align="left">基本骨架(taskbar + placeholder window)</td>
<td align="left">类似:taskbar + 简单窗口</td>
</tr>
<tr>
<td align="left">迭代行为</td>
<td align="left">声明任务完成,停止</td>
<td align="left">持续审查输出,识别改进点,继续迭代</td>
</tr>
<tr>
<td align="left">最终产出</td>
<td align="left">静态原型</td>
<td align="left"><strong>完整桌面:file browser, terminal, text editor, system monitor, calculator, games</strong></td>
</tr>
<tr>
<td align="left">质量演进</td>
<td align="left">无</td>
<td align="left">样式精致化,交互流畅化,边界情况处理</td>
</tr>
</tbody></table>
<h3 id="5-2-zwpgqdddd">5.2 自我评估驱动的迭代</h3>
<p>这个场景的核心机制是一个简单的 harness:在每轮执行后,模型审查自己的输出,识别可以改进的地方——缺失的功能、粗糙的样式、破损的交互——然后继续.</p>
<blockquote>
<p><strong>关键洞察</strong>: 这是三个场景中反馈结构最弱的一个,但也是最能体现「持续智能&quot;本质的一个.VectorDBBench 有明确的 QPS 指标,KernelBench 有逐题 speedup,而 Linux 桌面没有任何外部 metric——模型的自我评估质量直接决定了迭代的上限.如果模型高估自己的输出(overconfidence),它会陷入「自我满足&quot;的循环;如果低估(underconfidence),它会过度修改而引入 regressions.</p>
</blockquote>
<h3 id="5-3-yjxjx">5.3 严谨性局限</h3>
<p>与 VectorDBBench 和 KernelBench 不同,这个场景没有第三方可复现的 benchmark 框架.「完整的 Linux 桌面环境&quot;缺乏可量化的标准——我们无法知道功能完备性达到什么程度,代码质量如何,是否存在安全漏洞.harness 的设计(让模型在每轮后审查自己的输出)对结果的影响可能不亚于模型本身的能力.</p>
<hr>
<h2 id="6-ccyhdhxtz">6. 长程优化的核心挑战</h2>
<p>GLM-5.1 的论文坦诚指出了三个 remaining challenges:</p>
<table>
<thead>
<tr>
<th align="left">挑战</th>
<th align="left">描述</th>
<th align="left">当前状态</th>
</tr>
</thead>
<tbody><tr>
<td align="left">局部最优逃逸</td>
<td align="left">当增量调优停止带来回报时,如何更早地逃离局部最优</td>
<td align="left">GLM-5.1 通过结构性 transition 部分解决,但 transition 的时机选择仍依赖模型自主判断</td>
</tr>
<tr>
<td align="left">长轨迹连贯性</td>
<td align="left">在跨越数千次 tool call 的执行轨迹中保持连贯性</td>
<td align="left">6000+ tool call 的 VectorDBBench 已展示初步能力,但更长的轨迹仍是挑战</td>
</tr>
<tr>
<td align="left">无指标任务的自我评估</td>
<td align="left">为没有数值指标可以优化的任务开发可靠的自我评估</td>
<td align="left">8 小时桌面案例展示了初步能力,但距离「可靠&quot;还有相当距离</td>
</tr>
</tbody></table>
<hr>
<h2 id="7-xnhxdb-16-x-benchmark-fx">7. 性能横向对比:16 项 Benchmark 分析</h2>
<h3 id="7-1-reasoning-lb">7.1 Reasoning 类别</h3>
<table>
<thead>
<tr>
<th align="left">Benchmark</th>
<th align="center">GLM-5.1</th>
<th align="center">GLM-5</th>
<th align="center">Claude Opus 4.6</th>
<th align="center">GPT-5.4</th>
<th align="left">趋势</th>
</tr>
</thead>
<tbody><tr>
<td align="left">HLE</td>
<td align="center">31.0</td>
<td align="center">30.5</td>
<td align="center">36.7</td>
<td align="center">39.8</td>
<td align="left">后训练对纯推理提升有限</td>
</tr>
<tr>
<td align="left">HLE w/ Tools</td>
<td align="center">52.3</td>
<td align="center">50.4</td>
<td align="center">53.1*</td>
<td align="center">52.1*</td>
<td align="left">工具使用显著提升推理</td>
</tr>
<tr>
<td align="left">AIME 2026</td>
<td align="center">95.3</td>
<td align="center">95.4</td>
<td align="center">95.6</td>
<td align="center">98.7</td>
<td align="left">数学竞赛已接近饱和</td>
</tr>
<tr>
<td align="left">GPQA-Diamond</td>
<td align="center">86.2</td>
<td align="center">86.0</td>
<td align="center">91.3</td>
<td align="center">92.0</td>
<td align="left">科学知识推理仍有差距</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>分析</strong>: GLM-5.1 与 GLM-5 在 Reasoning 上的差距很小(HLE 31.0 vs 30.5,AIME 95.3 vs 95.4),说明后训练主要针对特定任务分布,对纯推理能力提升有限.这与 GLM-5.1 的核心定位一致:它不是「更聪明的模型&quot;,而是「更能持续优化的模型&quot;.</p>
</blockquote>
<h3 id="7-2-coding-lb">7.2 Coding 类别</h3>
<table>
<thead>
<tr>
<th align="left">Benchmark</th>
<th align="center">GLM-5.1</th>
<th align="center">GLM-5</th>
<th align="center">Claude Opus 4.6</th>
<th align="center">GPT-5.4</th>
<th align="center">提升幅度</th>
</tr>
</thead>
<tbody><tr>
<td align="left">SWE-Bench Pro</td>
<td align="center"><strong>58.4</strong></td>
<td align="center">55.1</td>
<td align="center">57.3</td>
<td align="center">57.7</td>
<td align="center">+3.3 vs GLM-5</td>
</tr>
<tr>
<td align="left">NL2Repo</td>
<td align="center"><strong>42.7</strong></td>
<td align="center">35.9</td>
<td align="center">49.8</td>
<td align="center">41.3</td>
<td align="center">+6.8 vs GLM-5</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0</td>
<td align="center"><strong>63.5</strong></td>
<td align="center">56.2</td>
<td align="center">65.4</td>
<td align="center">—</td>
<td align="center">+7.3 vs GLM-5</td>
</tr>
<tr>
<td align="left">CyberGym</td>
<td align="center"><strong>68.7</strong></td>
<td align="center">48.3</td>
<td align="center">66.6</td>
<td align="center">66.3</td>
<td align="center">+20.4 vs GLM-5</td>
</tr>
</tbody></table>
<p>Coding 是 GLM-5.1 的主要战场.特别是 CyberGym(68.7% vs GLM-5 的 48.3%),提升了 20.4 个百分点,说明后训练对网络安全和系统编程类任务的增益显著.</p>
<h3 id="7-3-agentic-lb">7.3 Agentic 类别</h3>
<table>
<thead>
<tr>
<th align="left">Benchmark</th>
<th align="center">GLM-5.1</th>
<th align="center">GLM-5</th>
<th align="center">Claude Opus 4.6</th>
<th align="center">GPT-5.4</th>
<th align="left">说明</th>
</tr>
</thead>
<tbody><tr>
<td align="left">BrowseComp</td>
<td align="center">68.0</td>
<td align="center">62.0</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="left">信息检索代理</td>
</tr>
<tr>
<td align="left">tau^3-Bench</td>
<td align="center">70.6</td>
<td align="center">69.2</td>
<td align="center">72.4</td>
<td align="center">72.9</td>
<td align="left">多领域对话代理</td>
</tr>
<tr>
<td align="left">MCP-Atlas</td>
<td align="center">71.8</td>
<td align="center">69.2</td>
<td align="center">73.8</td>
<td align="center">67.2</td>
<td align="left">MCP 工具使用</td>
</tr>
<tr>
<td align="left">Vending Bench 2</td>
<td align="center">**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5</mn><mo separator="true">,</mo><mn>634</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">5,634** |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">5</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">634</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span></span></span></span>4,432</td>
<td align="center">**<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo separator="true">,</mo><mn>018</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">8,018** |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">8</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">018</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span></span></span></span>6,144</td>
<td align="center">经济决策代理</td>
<td align="center"></td>
<td align="left"></td>
</tr>
</tbody></table>
<p>Vending Bench 2 上 Claude Opus 4.6 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>8</mn><mo separator="true">,</mo><mn>018</mn><mtext>远超</mtext><mi>G</mi><mi>L</mi><mi>M</mi><mo>−</mo><mn>5.1</mn><mtext>的</mtext></mrow><annotation encoding="application/x-tex">8,018 远超 GLM-5.1 的</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord">8</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">018</span><span class="mord cjk_fallback">远超</span><span class="mord mathnormal">G</span><span class="mord mathnormal">L</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">5.1</span><span class="mord cjk_fallback">的</span></span></span></span>5,634,说明在需要复杂经济决策的 agentic 任务上,闭源模型仍有优势.</p>
<hr>
<h2 id="8-harness-ys-bdgdbl">8. Harness 因素:被低估的变量</h2>
<p>GLM-5.1 的多个 benchmark 使用了不同的 harness,这引入了显著的对比复杂性:</p>
<table>
<thead>
<tr>
<th align="left">Benchmark</th>
<th align="left">GLM-5.1 使用的 Harness</th>
<th align="left">其他模型使用的 Harness</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Terminal-Bench 2.0</td>
<td align="left">Terminus-2(63.5%) / Claude Code(69.0%)</td>
<td align="left">Claude Code, Codex CLI</td>
</tr>
<tr>
<td align="left">CyberGym</td>
<td align="left">Claude Code 2.1.56</td>
<td align="left">Gemini CLI, Codex CLI</td>
</tr>
<tr>
<td align="left">KernelBench</td>
<td align="left">自研 harness</td>
<td align="left">统一 harness(所有模型)</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 同样的模型在不同 harness 下表现可能差异显著.GLM-5.1 在 Terminal-Bench 2.0 上使用 Claude Code harness(69.0%)比使用 Terminus-2 harness(63.5%)高出 5.5 个百分点.这验证了 GLM-5V-Turbo 论文中提出的「模型与 harness 共生&quot;观点:有效的能力边界由模型和 harness 共同塑造.</p>
</blockquote>
<p>对于横向对比,理想情况下应在相同的 harness 下比较不同模型,或者至少在 harness 设计透明的前提下进行解读.</p>
<hr>
<h2 id="9-jsskjd">9. 技术思考节点</h2>
<h3 id="9-1-sjdj">9.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么从 Pass@1 转向长程优化范式?</strong></p>
</blockquote>
<p>传统 Pass@1 指标衡量的是模型在第一次尝试中解决问题的概率,但它完全忽略了真实软件工程中一个至关重要的维度——时间.人类工程师解决复杂 bug 不是在第一次写对,而是在调试-测试-修复的循环中逐步逼近正确解.GLM-5.1 的核心主张是挑战这个范式:不再问「一次能做多好&quot;,而是问「给你八小时,你能持续改进到什么地步&quot;.这种范式转移的代价是评测复杂度大幅提升:需要设计 outer optimization loop,需要处理数千次 tool call 的轨迹,需要定义「持续改进&quot;的度量标准.但收益也很明显:它更贴近真实工程场景,能区分「一次性聪明&quot;和「持续有效&quot;的模型.</p>
<blockquote>
<p><strong>思考 2: 后训练重新定向 vs 架构创新的权衡</strong></p>
</blockquote>
<p>GLM-5.1 与 GLM-5 共享完全相同的 754B MoE 架构,差异仅在 post-training.这揭示了一个重要事实:长程 Agent 能力主要是一个「后训练问题&quot;而非「架构问题&quot;.同样的基座,通过不同的 SFT 和 RL 任务分布,可以被塑造为擅长长程优化的模型.这意味着:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">架构创新</th>
<th align="left">后训练重新定向</th>
</tr>
</thead>
<tbody><tr>
<td align="left">成本</td>
<td align="left">高(需要重新预训练)</td>
<td align="left">中(只需后训练)</td>
</tr>
<tr>
<td align="left">风险</td>
<td align="left">高(架构改动可能破坏已有能力)</td>
<td align="left">低(基座能力保留)</td>
</tr>
<tr>
<td align="left">迭代速度</td>
<td align="left">慢(月级)</td>
<td align="left">快(周级)</td>
</tr>
<tr>
<td align="left">能力上限</td>
<td align="left">取决于架构设计</td>
<td align="left">取决于基座容量和任务覆盖</td>
</tr>
</tbody></table>
<p>GLM-5.1 的选择是务实的:在架构不变的前提下,通过后训练快速迭代,验证长程优化的可行性.未来如果后训练的收益遇到瓶颈,可能需要回到架构层面(如更大的上下文窗口、更高效的注意力机制)来突破.</p>
<h3 id="9-2-sjsy">9.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: VectorDBBench 优化轨迹的工程可解释性</strong></p>
</blockquote>
<p>GLM-5.1 在 VectorDBBench 上的六个结构性 transition 每一个都对应着工程上合理的优化方向:</p>
<table>
<thead>
<tr>
<th align="left">Transition</th>
<th align="left">工程原理</th>
<th align="left">人类工程师通常所需时间</th>
</tr>
</thead>
<tbody><tr>
<td align="left">IVF Cutover</td>
<td align="left">降维 + 压缩,减少扫描量</td>
<td align="left">数小时</td>
</tr>
<tr>
<td align="left">嵌套并行性移除</td>
<td align="left">消除调度开销,改善 cache locality</td>
<td align="left">半天</td>
</tr>
<tr>
<td align="left">两阶段搜索</td>
<td align="left">粗筛 + 精排,减少计算量</td>
<td align="left">1-2 天</td>
</tr>
<tr>
<td align="left">Budget Trim</td>
<td align="left">减少候选数量,降低 rerank 工作量</td>
<td align="left">数小时</td>
</tr>
<tr>
<td align="left">两级路由</td>
<td align="left">coarse-to-fine,减少随机访问</td>
<td align="left">1-2 天</td>
</tr>
<tr>
<td align="left">u8 路由 + VNNI</td>
<td align="left">量化加速,利用 SIMD</td>
<td align="left">数小时</td>
</tr>
<tr>
<td align="left">早期剪枝</td>
<td align="left">跳过低质量 cluster</td>
<td align="left">数小时</td>
</tr>
</tbody></table>
<p>模型在 600+ 迭代中自主完成了这些优化,总时间尺度可能在数小时到一天.与人类工程师相比,模型的优势在于「尝试速度&quot;——它可以在短时间内尝试大量方向,而人类需要更长的思考和实现时间.但模型的劣势在于「深度理解&quot;——当优化涉及到对硬件架构(HBM 带宽、SM 利用率)的深入理解时,人类工程师的直觉仍然领先.</p>
<blockquote>
<p><strong>思考 4: KernelBench 的对数衰减规律与 harness 质量的关系</strong></p>
</blockquote>
<p>所有模型在 KernelBench 上的改进速率都随时间呈对数衰减.这反映了一个普遍规律:优化收益随时间递减.但衰减速率的差异揭示了 harness 质量的重要性:</p>
<table>
<thead>
<tr>
<th align="left">因素</th>
<th align="left">对衰减速率的影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">反馈丰富度</td>
<td align="left">profiling 数据越详细,模型越能找到新的优化方向,衰减慢</td>
</tr>
<tr>
<td align="left">错误信息质量</td>
<td align="left">编译/运行错误信息越精确,模型修复越快,衰减慢</td>
</tr>
<tr>
<td align="left">搜索空间大小</td>
<td align="left">可选优化策略越多,模型越不容易耗尽方向,衰减慢</td>
</tr>
<tr>
<td align="left">验证可靠性</td>
<td align="left">正确性验证越严格,模型越敢于尝试激进优化,衰减慢</td>
</tr>
</tbody></table>
<p>GLM-5.1 衰减慢于 GLM-5,既是因为模型本身更善于利用反馈,也可能是因为 harness 提供了更丰富的反馈.这再次说明:区分「模型能力&quot;和「harness 能力&quot;是评测中的核心难题.</p>
<h3 id="9-3-jgxj">9.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: 754B MoE / 40B active 架构对长程任务的适配性</strong></p>
</blockquote>
<p>GLM-5.1 的 754B MoE(256 experts, 8 activated, ~40B active)架构对长程任务有天然的适配性:</p>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">对长程任务的价值</th>
</tr>
</thead>
<tbody><tr>
<td align="left">大总参数(754B)</td>
<td align="left">丰富的专家组合,可以编码大量不同的优化策略</td>
</tr>
<tr>
<td align="left">小激活参数(40B)</td>
<td align="left">推理成本低,支持高频率的 tool call(6000+ 次)</td>
</tr>
<tr>
<td align="left">MoE 路由</td>
<td align="left">不同任务类型激活不同专家,支持多模态工具使用的灵活切换</td>
</tr>
<tr>
<td align="left">200K 上下文</td>
<td align="left">长轨迹保持,可以回顾数百轮前的决策</td>
</tr>
</tbody></table>
<p>但 MoE 架构也有局限:专家负载均衡在长序列上可能变得不稳定,特别是在 token 分布高度不均匀的场景(如代码编辑中大量重复的结构).DSA(DeepSeek Sparse Attention)缓解了注意力计算的复杂度,但在 200K 上下文下,KV Cache 的内存占用仍然是一个挑战.</p>
<blockquote>
<p><strong>思考 6: DSA 注意力机制在长程任务中的作用</strong></p>
</blockquote>
<p>DeepSeek Sparse Attention(DSA)是 GLM-5 系列的核心注意力机制,通过稀疏化注意力模式降低计算复杂度.对于长程 Agent 任务,DSA 的价值在于:</p>
<ul>
<li><strong>长上下文支持</strong>: 200K 的上下文窗口使模型可以回顾数百轮前的决策和中间结果</li>
<li><strong>计算效率</strong>: 稀疏注意力在长序列上的计算量显著低于标准注意力</li>
<li><strong>轨迹连贯性</strong>: 通过保留关键位置的注意力连接,模型可以在长轨迹中保持对重要信息的关注</li>
</ul>
<p>但 DSA 的局限也很明显:稀疏模式是固定的,无法根据任务动态调整.在长程优化中,某些早期的决策可能在后期变得至关重要,但 DSA 的固定稀疏模式可能无法保证这些信息始终被保留.</p>
<h3 id="9-4-jxyfx">9.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: 8 小时 Linux 桌面案例的严谨性边界</strong></p>
</blockquote>
<p>这个案例是 GLM-5.1 最有说服力的演示,也是最受争议的.其价值在于展示了一个没有任何数值反馈的开放任务中,模型如何通过自我评估持续迭代.但其严谨性弱于前两个场景:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">VectorDBBench / KernelBench</th>
<th align="left">8 小时 Linux 桌面</th>
</tr>
</thead>
<tbody><tr>
<td align="left">评测标准</td>
<td align="left">明确的数值指标(QPS, speedup)</td>
<td align="left">主观判断(「完整&quot;、「精致&quot;)</td>
</tr>
<tr>
<td align="left">可复现性</td>
<td align="left">第三方可复现的 benchmark 框架</td>
<td align="left">依赖特定 harness 设计</td>
</tr>
<tr>
<td align="left">横向对比</td>
<td align="left">可直接与其他模型对比</td>
<td align="left">无法直接对比</td>
</tr>
<tr>
<td align="left">验证严谨性</td>
<td align="left">自动化的正确性验证</td>
<td align="left">无外部验证</td>
</tr>
</tbody></table>
<p>这提示我们:在评估长程 Agent 能力时,需要开发新的评测方法论——既能覆盖开放任务,又能保持可量化和可复现.</p>
<blockquote>
<p><strong>思考 8: 自我评估中的 overconfidence 与 underconfidence 风险</strong></p>
</blockquote>
<p>当没有外部 metric 时,模型的自我评估质量直接决定了迭代上限:</p>
<table>
<thead>
<tr>
<th align="left">偏差类型</th>
<th align="left">表现</th>
<th align="left">后果</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Overconfidence</td>
<td align="left">高估自己的输出,认为已经「足够好&quot;</td>
<td align="left">提前停止迭代,错过进一步优化机会</td>
</tr>
<tr>
<td align="left">Underconfidence</td>
<td align="left">低估自己的输出,过度寻找问题</td>
<td align="left">过度修改,引入 regressions,破坏已有功能</td>
</tr>
<tr>
<td align="left">系统性偏差</td>
<td align="left">对某些类型的错误不敏感</td>
<td align="left">反复出现同类问题,无法根除</td>
</tr>
</tbody></table>
<p>GLM-5.1 在 8 小时桌面案例中的成功表明它至少部分克服了 overconfidence 问题——它没有像短会话模型那样「宣布完成&quot;.但 underconfidence 的风险仍然存在:如果模型过度修改,可能在一个已足够好的状态上浪费大量时间.</p>
<blockquote>
<p><strong>思考 9: 「先破后立&quot;策略在生产环境中的风险</strong></p>
</blockquote>
<p>VectorDBBench 中的红色叉号(Recall &lt; 95%)集中在每次 transition 周围,说明模型愿意暂时打破约束再修复.这种策略在工程探索中有价值,但在生产环境中有风险:</p>
<ul>
<li><strong>硬性约束</strong>: 如果约束是 SLA 或安全要求,临时打破可能导致不可逆后果</li>
<li><strong>状态依赖</strong>: 某些优化可能是 stateful 的,一旦进入「破&quot;的状态,可能需要大量工作才能恢复到「立&quot;</li>
<li><strong>时间成本</strong>: 在实时系统中,每次「破&quot;都意味着服务降级的时间窗口</li>
</ul>
<p>这提示我们:长程优化能力需要与「安全边界意识&quot;结合——模型不仅需要知道如何优化,还需要知道何时不应该优化.</p>
<h3 id="9-5-jspx">9.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: GLM-5.1 在长程 Agent 演进中的位置与竞争格局</strong></p>
</blockquote>
<p>2026 年 Q1-Q2,国产开源模型在长程 Agent 领域形成了三种差异化路线:</p>
<table>
<thead>
<tr>
<th align="left">路线</th>
<th align="left">代表模型</th>
<th align="left">核心策略</th>
<th align="left">优势场景</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>持续迭代优化</strong></td>
<td align="left">GLM-5.1</td>
<td align="left">模型在长时间内自主诊断、调整、突破局部最优</td>
<td align="left">数值优化、代码生成、系统调优</td>
</tr>
<tr>
<td align="left"><strong>Harness 自我进化</strong></td>
<td align="left">MiniMax M2.7</td>
<td align="left">Harness 自身随模型能力提升而动态调整</td>
<td align="left">开放环境探索、自适应工具链</td>
</tr>
<tr>
<td align="left"><strong>多 Agent 协作</strong></td>
<td align="left">Kimi K2.6</td>
<td align="left">多个 specialist agent 协同完成复杂任务</td>
<td align="left">大规模并行、多领域交叉</td>
</tr>
</tbody></table>
<p>GLM-5.1 的「持续迭代优化&quot;路线与另外两条不是互斥的,而是互补的.未来的长程 Agent 系统可能同时需要:模型自身的持续优化能力(GLM-5.1)、harness 的动态适应能力(MiniMax M2.7)和多 agent 的协作 orchestration(Kimi K2.6).</p>
<blockquote>
<p><strong>思考 11: 长程优化评测范式的社区影响</strong></p>
</blockquote>
<p>GLM-5.1 提出的长程优化评测范式(VectorDBBench outer loop, KernelBench long-horizon tracking)对社区有潜在影响:</p>
<ul>
<li><strong>评测维度扩展</strong>: 从「能否解决&quot;扩展到「需要多长时间解决&quot;、「能优化到什么程度&quot;</li>
<li><strong>Harness 标准化需求</strong>: 长程评测对 harness 的依赖更强,需要建立 harness 设计标准和隔离方法</li>
<li><strong>成本问题</strong>: 长程评测(600+ 迭代,8 小时运行)的计算成本远高于传统 Pass@1,可能限制社区复现</li>
<li><strong>新 metric 需求</strong>: 需要定义「优化效率&quot;(speedup per turn)、「平台期到达时间&quot;等新指标</li>
</ul>
<p>这一范式的推广可能改变 Agent 模型的开发节奏:从追求「单次通过率&quot;转向追求「持续优化能力&quot;,从「静态 benchmark 分数&quot;转向「动态能力曲线&quot;.</p>
<hr>
<h2 id="10-bssj-harness-xzycbfx">10. 部署视角:Harness 选择与成本分析</h2>
<h3 id="10-1-harness-cjpp">10.1 Harness-场景匹配</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐 Harness</th>
<th align="left">理由</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数据库/系统性能优化</td>
<td align="left">自研 outer loop + benchmark</td>
<td align="left">需要自定义优化目标和约束条件</td>
</tr>
<tr>
<td align="left">GPU kernel 优化</td>
<td align="left">KernelBench harness</td>
<td align="left">标准化的 correctness + performance 验证</td>
</tr>
<tr>
<td align="left">软件工程(SWE-Bench)</td>
<td align="left">OpenHands / Claude Code</td>
<td align="left">成熟的代码修复框架</td>
</tr>
<tr>
<td align="left">网络安全(CyberGym)</td>
<td align="left">Claude Code 2.1.56</td>
<td align="left">已验证的 68.7% 性能</td>
</tr>
<tr>
<td align="left">终端任务(Terminal-Bench)</td>
<td align="left">Claude Code</td>
<td align="left">69.0% 优于 Terminus-2 的 63.5%</td>
</tr>
<tr>
<td align="left">开放任务(如网站构建)</td>
<td align="left">自研 review loop</td>
<td align="left">需要模型自我评估驱动</td>
</tr>
</tbody></table>
<h3 id="10-2-tlcbfx">10.2 推理成本分析</h3>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">规格</th>
</tr>
</thead>
<tbody><tr>
<td align="left">模型参数</td>
<td align="left">754B MoE / 40B active</td>
</tr>
<tr>
<td align="left">高峰时段定价</td>
<td align="left">3x 配额消耗</td>
</tr>
<tr>
<td align="left">非高峰时段定价</td>
<td align="left">2x 配额消耗(促销期 1x)</td>
</tr>
<tr>
<td align="left">高峰时段</td>
<td align="left">UTC+8 14:00-18:00</td>
</tr>
<tr>
<td align="left">自托管硬件需求</td>
<td align="left">多卡 A100/H100 或同等国产芯片</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>成本洞察</strong>: 754B 总参数对自托管硬件的要求极高.虽然激活参数只有 40B,但长程 agentic 任务中 tool call 的频次和上下文长度都会大幅增加 token 消耗.以 VectorDBBench 的 6000+ tool call 为例,每次 tool call 可能涉及 10K-50K token 的上下文,总 token 消耗可能达到数千万甚至上亿.这意味着长程 Agent 能力的实际使用成本可能远超单次对话的成本.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: GLM-5.1: Toward Long-Horizon Tasks, Z.ai Blog, 2026-04-07</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.6-glm/11-glm-5.1/01-glm-5.1-jsbgjy-2">01-GLM-5.1技术报告精译</a></li>
<li>基座模型: GLM-5 技术报告精译(见 06-GLM-5 目录)</li>
<li>相关模型: GLM-5V-Turbo 多模态 Agent 架构剖析(见 08-GLM-5V-Turbo 目录)</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxfszy-c-sszn-quot-d-cxzn-quot","text":"1. 核心范式转移:从「瞬时智能&quot;到「持续智能&quot;"},{"level":2,"id":"2-jgjz-y-glm-5-gxd-754b-moe","text":"2. 架构基座:与 GLM-5 共享的 754B MoE"},{"level":2,"id":"3-cjy-vector-db-bench-jghszyhdjx","text":"3. 场景一:VectorDBBench —— 结构化数值优化的极限"},{"level":3,"id":"3-1-rwsd","text":"3.1 任务设定"},{"level":3,"id":"3-2-yhgjdjtms","text":"3.2 优化轨迹的阶梯模式"},{"level":3,"id":"3-3-xphl-quot-dysgl","text":"3.3 「先破后立&quot;的约束管理"},{"level":2,"id":"4-cje-kernel-bench-yjddccyh","text":"4. 场景二:KernelBench —— 有监督的长程优化"},{"level":3,"id":"4-1-rwsd","text":"4.1 任务设定"},{"level":3,"id":"4-2-gjssddssjgl","text":"4.2 改进速率的对数衰减规律"},{"level":2,"id":"5-cjs-8-xsgj-linux-zm-wzbdzwqdyh","text":"5. 场景三:8 小时构建 Linux 桌面 —— 无指标的自我驱动优化"},{"level":3,"id":"5-1-rwsd","text":"5.1 任务设定"},{"level":3,"id":"5-2-zwpgqdddd","text":"5.2 自我评估驱动的迭代"},{"level":3,"id":"5-3-yjxjx","text":"5.3 严谨性局限"},{"level":2,"id":"6-ccyhdhxtz","text":"6. 长程优化的核心挑战"},{"level":2,"id":"7-xnhxdb-16-x-benchmark-fx","text":"7. 性能横向对比:16 项 Benchmark 分析"},{"level":3,"id":"7-1-reasoning-lb","text":"7.1 Reasoning 类别"},{"level":3,"id":"7-2-coding-lb","text":"7.2 Coding 类别"},{"level":3,"id":"7-3-agentic-lb","text":"7.3 Agentic 类别"},{"level":2,"id":"8-harness-ys-bdgdbl","text":"8. Harness 因素:被低估的变量"},{"level":2,"id":"9-jsskjd","text":"9. 技术思考节点"},{"level":3,"id":"9-1-sjdj","text":"9.1 设计动机"},{"level":3,"id":"9-2-sjsy","text":"9.2 数据实验"},{"level":3,"id":"9-3-jgxj","text":"9.3 架构细节"},{"level":3,"id":"9-4-jxyfx","text":"9.4 局限与风险"},{"level":3,"id":"9-5-jspx","text":"9.5 技术谱系"},{"level":2,"id":"10-bssj-harness-xzycbfx","text":"10. 部署视角:Harness 选择与成本分析"},{"level":3,"id":"10-1-harness-cjpp","text":"10.1 Harness-场景匹配"},{"level":3,"id":"10-2-tlcbfx","text":"10.2 推理成本分析"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/11-glm-5.1/05-glm-5.1-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/11-glm-5.1/05-glm-5.1-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5.1 长程任务与 Agent 架构剖析</h1>
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
