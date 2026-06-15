"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax-M2.5 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniMax M2.5: Built for Real-World Productivity.
原文链接: <a href="https://www.minimax.io/news/minimax-m25">https://www.minimax.io/news/minimax-m25</a>
发布日期: 2026-02-12
发布机构: MiniMax</p>
</blockquote>
<hr>
<h2 id="0-hxzbydw">0. 核心指标与定位</h2>
<p>MiniMax-M2.5 是 MiniMax 于 2026 年 2 月 12 日发布的最新文本模型,基于在数十万个复杂真实世界环境中进行的大规模强化学习训练,在编程、agentic 工具使用与搜索、办公工作以及一系列其他具有经济价值的任务上达到 SOTA.</p>
<p><strong>关键性能指标</strong>:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>分数</th>
<th>备注</th>
</tr>
</thead>
<tbody><tr>
<td>SWE-Bench Verified</td>
<td>80.2%</td>
<td>Claude Code scaffold, avg@4</td>
</tr>
<tr>
<td>Multi-SWE-Bench</td>
<td>51.3%</td>
<td>Claude Code scaffold, avg@4</td>
</tr>
<tr>
<td>BrowseComp (w/ Ctx Manage)</td>
<td>76.3%</td>
<td>WebExplorer agent, discard-all @ 30% ctx</td>
</tr>
<tr>
<td>SWE-Bench Verified (Droid)</td>
<td>79.7</td>
<td>&gt; Opus 4.6 的 78.9</td>
</tr>
<tr>
<td>SWE-Bench Verified (OpenCode)</td>
<td>76.1</td>
<td>&gt; Opus 4.6 的 75.9</td>
</tr>
<tr>
<td>Terminal Bench 2</td>
<td>68.5</td>
<td>Claude Code 2.0.64, avg@4</td>
</tr>
<tr>
<td>VIBE-Pro (Aggregate)</td>
<td>88.6</td>
<td>Agent-as-a-Verifier, avg@3</td>
</tr>
<tr>
<td>GDPval-MM</td>
<td>59.0% 胜率</td>
<td>pairwise LLM judge</td>
</tr>
<tr>
<td>AIME 2025</td>
<td>90.2</td>
<td>—</td>
</tr>
</tbody></table>
<p><strong>效率与成本</strong>:</p>
<table>
<thead>
<tr>
<th>指标</th>
<th>M2.5</th>
<th>M2.5-Lightning</th>
<th>对比基准</th>
</tr>
</thead>
<tbody><tr>
<td>推理吞吐</td>
<td>50 TPS</td>
<td>100 TPS</td>
<td>Opus ~50 TPS</td>
</tr>
<tr>
<td>Input 价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.15/MTok |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord">∣</span></span></span></span>0.30/MTok</td>
<td>Opus \$5/MTok</td>
<td></td>
</tr>
<tr>
<td>Output 价格</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.20</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">1.20/MTok |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1.20/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord">∣</span></span></span></span>2.40/MTok</td>
<td>Opus \$25/MTok</td>
<td></td>
</tr>
<tr>
<td>连续运行 1h 成本</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.30</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.30 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.30∣</span></span></span></span>1.00</td>
<td>—</td>
<td></td>
</tr>
<tr>
<td>SWE 每任务 token</td>
<td>3.52M</td>
<td>—</td>
<td>M2.1 3.72M</td>
</tr>
<tr>
<td>SWE 端到端时间</td>
<td>22.8 min</td>
<td>—</td>
<td>M2.1 31.3 min, Opus 4.6 22.9 min</td>
</tr>
</tbody></table>
<p>M2.5 在 SWE-Bench Verified 上的端到端运行时间为 22.8 分钟,与 Claude Opus 4.6 的 22.9 分钟持平,但每任务总成本仅为 Opus 4.6 的 10%.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: MiniMax 对 M2 系列的核心设计目标不是单纯追求 benchmark 分数,而是破解 agentic 应用的&quot;不可能三角&quot;——性能、价格、速度三者不可兼得.从 M2 到 M2.5 的迭代中,这个三角被不断压缩:M2 的定价已是 Claude Sonnet 的 8%,M2.5 进一步将输出价格压到 Opus 的 1/20.这背后的工程选择是:用 MoE 架构保持大模型容量,但通过极致的激活参数效率控制(约 10B active / ~200B total)和推理优化,将单次推理成本降到近乎可忽略.这种&quot;intelligence too cheap to meter&quot;的愿景,本质上是把模型从&quot;按调用付费的奢侈品&quot;转变为&quot;按使用时长计费的基础设施&quot;.</p>
</blockquote>
<hr>
<h2 id="1-bcnl">1. 编程能力</h2>
<p>在编程评估中,MiniMax-M2.5 相比前代取得了实质性提升,达到 SOTA 水平.其在多语言编程任务上的表现尤为突出.</p>
<p>相比前代的一个显著改进是 M2.5 具备了&quot;像架构师一样思考和规划&quot;的能力.这种 Spec-writing 倾向在训练过程中自然涌现:在编写任何代码之前,M2.5 会主动从经验丰富的软件架构师视角分解和规划项目的功能、结构与 UI 设计.</p>
<p>M2.5 在超过 10 种编程语言上进行了训练,包括 Go、C、C++、TypeScript、Rust、Kotlin、Python、Java、JavaScript、PHP、Lua、Dart 和 Ruby,覆盖超过 200,000 个真实世界环境.远不止 bug 修复,M2.5 在复杂系统的完整开发生命周期中都能提供可靠性能:从 0-to-1 系统设计与环境搭建,到 1-to-10 系统开发,到 10-to-90 功能迭代,再到 90-to-100 全面代码审查与系统测试.它覆盖跨多个平台的全栈项目,包括 Web、Android、iOS 和 Windows,涵盖服务端 API、业务逻辑、数据库等,而不仅仅是前端网页 demo.</p>
<p>为评估这些能力,团队还将 VIBE 基准升级到了更复杂、更具挑战性的 Pro 版本,显著增加了任务复杂度、领域覆盖度和评估准确度.总体而言,M2.5 的表现与 Opus 4.5 相当.</p>
<p>团队重点关注了模型在分布外 harness 上的泛化能力,使用不同的 coding agent scaffold 在 SWE-Bench Verified 评估集上测试了性能:</p>
<ul>
<li>在 Droid 上: 79.7(M2.5) &gt; 78.9(Opus 4.6)</li>
<li>在 OpenCode 上: 76.1(M2.5) &gt; 75.9(Opus 4.6)</li>
</ul>
<blockquote>
<p><strong>思考节点-数据实验</strong>: 跨 scaffold 泛化是 agentic 模型评估中最容易被忽视也最关键的维度.许多模型在单一 scaffold(如 Claude Code)上优化过度,换到 Droid 或 OpenCode 后性能断崖下跌.M2.5 在 Droid 和 OpenCode 上均超越 Opus 4.6,说明其能力不是 scaffold 特化的&quot;过拟合&quot;,而是 genuinely 的代码理解能力.但需要注意,SWE-Bench Verified 的测试数据来自真实 GitHub issue,如果训练数据中包含了这些仓库的代码,则存在数据污染风险.MiniMax 未在博客中披露训练数据截止日期和来源范围,这是评估可信度的一个缺失环节.</p>
</blockquote>
<hr>
<h2 id="2-ssygjty">2. 搜索与工具调用</h2>
<p>有效的工具调用和搜索是模型能够自主处理更复杂任务的前提.在 BrowseComp、Wide Search 等基准的评估中,M2.5 取得了行业领先的性能.同时,模型的泛化能力也有所提升——在面对不熟悉的 scaffold 环境时,M2.5 展现出更稳定的性能.</p>
<p>在专业人类专家执行的研究任务中,使用搜索引擎只是过程的一小部分;大部分工作涉及跨信息密集型网页的深度探索.为此,MiniMax 构建了 RISE(Realistic Interactive Search Evaluation)来衡量模型在真实世界专业任务上的搜索能力.结果表明 M2.5 在真实世界专家级搜索任务上表现卓越.</p>
<p>相比前代,M2.5 在处理 agentic 任务时也展现出更好的决策能力:它学会了用更精确的搜索轮次和更好的 token 效率来解决问题.例如,在包括 BrowseComp、Wide Search 和 RISE 在内的多个 agentic 任务中,M2.5 以更少的轮次取得了更好的结果,相比 M2.1 使用了约少 20% 的搜索轮次.这表明模型不再仅仅是&quot;得到正确答案&quot;,而是能够以更高效的路径推理出结果.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: RISE 的构建思路值得注意.现有的搜索基准(如 BrowseComp)大多设计为&quot;能否找到答案&quot;的二元判断,但真实世界的研究任务中,&quot;找到答案&quot;只是起点,更关键的是&quot;如何找到&quot;——搜索策略的质量、信息筛选的效率、多源交叉验证的严谨性.RISE 使用真实人类专家提出的问题,并基于 Playwright 浏览器工具套件评估完整的多步交互轨迹,这比传统的 pass/fail 指标更能反映模型的实际研究能力.M2.5 在 RISE 上的表现,配合其比 M2.1 少 20% 搜索轮次的数据,说明 RL 训练不仅提升了结果质量,还优化了搜索策略本身的效率.</p>
</blockquote>
<hr>
<h2 id="3-bgcj">3. 办公场景</h2>
<p>M2.5 被训练用于在办公场景中产出真正可交付的输出.为此,MiniMax 与金融、法律和社会科学等领域的高级专业人士进行了深入协作.他们设计需求、提供反馈、参与定义标准,并直接贡献于数据构建,将行业的隐性知识带入模型的训练管道.</p>
<p>基于此,M2.5 在 Word、PowerPoint 和 Excel 金融建模等高价值 workspace 场景中实现了显著的能力提升.在评估方面,MiniMax 构建了内部 Cowork Agent 评估框架 GDPval-MM,通过 pairwise 对比评估可交付成果的质量与 agent 轨迹的专业性,同时监控整个工作流的 token 成本以估算模型在现实世界中的生产力增益.在与其他主流模型的对比中,M2.5 取得了 59.0% 的平均胜率.</p>
<p>此外,MiniMax 还构建了基于 MEWC(Microsoft Excel World Championship)的内部基准,包含 2021-2026 年主赛区及其他地区赛区的 179 道题目,评估模型理解竞赛级 Excel 电子表格并使用 Excel 工具完成题目的能力.得分通过逐个比较输出单元格与答案单元格的值来计算.</p>
<p>在金融建模方面,MiniMax 构建了主要由行业专家构造的金融建模问题内部基准,涉及通过 Excel 工具执行的端到端研究与分析任务.每道题目使用专家设计的 rubric 评分,最终结果取 3 次运行的平均.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: GDPval-MM 的评估设计非常务实.它不只评估最终输出质量,还评估&quot;agent 轨迹的专业性&quot;——这意味着模型在完成任务过程中的行为模式(如是否遵循标准流程、是否进行充分的交叉验证)也被纳入评分.同时监控 token 成本来估算生产力增益,这是少有的将经济效率直接纳入模型评估的做法.59.0% 的平均胜率意味着 M2.5 在 pairwise 对比中略优于对手,但这个数字距离&quot;碾压&quot;还很远,说明办公场景的 agentic 能力仍然处于激烈竞争的阶段,尚未出现像 SWE-Bench 上那样的明显领跑者.</p>
</blockquote>
<hr>
<h2 id="4-xs">4. 效率</h2>
<p>因为真实世界充满截止期限和时间约束,任务完成速度是实际需求.模型完成任务的时间取决于其任务分解效率、token 效率和推理速度.M2.5 原生以 100 tokens/s 的速率 serving,这几乎是其他前沿模型的两倍.此外,强化学习设置激励模型高效推理和最优分解任务.由于这三个因素,M2.5 在复杂任务完成中实现了显著的时间节省.</p>
<p>例如,在运行 SWE-Bench Verified 时,M2.5 平均每任务消耗 352 万 token.相比之下,M2.1 消耗 372 万 token.同时,得益于并行工具调用等能力的改进,端到端运行时间从平均 31.3 分钟降至 22.8 分钟,提速 37%.此运行时间与 Claude Opus 4.6 的 22.9 分钟持平,而每任务总成本仅为 Claude Opus 4.6 的 10%.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: 100 tokens/s 的 serving 速度在当前的 MoE 大模型中属于顶尖水平.考虑到 M2.5 基于 MoE 架构(总参数约 200B,激活约 10B),在标准 8-GPU 节点上实现 100 TPS 需要极高的推理优化.这通常涉及:EP(Expert Parallelism)将专家分散到不同 GPU 以减少内存瓶颈;对 attention 和 MoE 的 fused kernel 优化;以及可能的投机解码(speculative decoding).MiniMax 将推理速度作为产品级指标而非单纯的工程副产品,这反映了其&quot;agent-native&quot;的产品哲学——agentic 任务通常涉及数百轮交互,每轮的延迟累积直接决定用户体验.</p>
</blockquote>
<hr>
<h2 id="5-cb">5. 成本</h2>
<p>MiniMax 设计 M2 系列基础模型的目标是:为复杂 agent 提供动力,而无需担心成本.团队认为 M2.5 已接近实现这一目标.</p>
<p>M2.5 发布两个版本:M2.5 和 M2.5-Lightning,两者能力相同但速度不同.M2.5-Lightning 稳定吞吐为 100 tokens/s,是其他前沿模型的两倍,定价为每百万 input token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.3</mn><mtext>、每百万</mtext><mi>o</mi><mi>u</mi><mi>t</mi><mi>p</mi><mi>u</mi><mi>t</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi></mrow><annotation encoding="application/x-tex">0.3、每百万 output token</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">0.3</span><span class="mord cjk_fallback">、每百万</span><span class="mord mathnormal">o</span><span class="mord mathnormal">u</span><span class="mord mathnormal">tp</span><span class="mord mathnormal">u</span><span class="mord mathnormal">tt</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span></span></span></span>2.4.M2.5 吞吐为 50 tokens/s,价格减半.两个版本均支持 caching.基于 output 价格,M2.5 的成本是 Opus、Gemini 3 Pro 和 GPT-5 的 1/10 到 1/20.</p>
<p>以 100 output tokens/s 的速率连续运行 M2.5 一小时成本为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.</mn><mtext>以</mtext><mn>50</mn><mi>T</mi><mi>P</mi><mi>S</mi><mtext>的速率</mtext><mo separator="true">,</mo><mtext>价格降至</mtext></mrow><annotation encoding="application/x-tex">1.以 50 TPS 的速率,价格降至</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord">1.</span><span class="mord cjk_fallback">以</span><span class="mord">50</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mord cjk_fallback">的速率</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord cjk_fallback">价格降至</span></span></span></span>0.3.作为参考,四个 M2.5 实例连续运行一整年的成本为 \$10,000.</p>
<blockquote>
<p><strong>思考节点-设计动机</strong>: M2.5 的定价策略是对当前 frontier API 定价结构的一次直接挑战.Claude Opus 4.6 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>25</mn><mi mathvariant="normal">/</mi><mi>M</mi><mi>T</mi><mi>o</mi><mi>k</mi><mi>o</mi><mi>u</mi><mi>t</mi><mi>p</mi><mi>u</mi><mi>t</mi><mtext>价格</mtext><mo separator="true">,</mo><mtext>对于需要数百轮交互的</mtext><mi>a</mi><mi>g</mi><mi>e</mi><mi>n</mi><mi>t</mi><mi>i</mi><mi>c</mi><mtext>任务来说</mtext><mo separator="true">,</mo><mtext>单次任务成本可达数美元</mtext><mi mathvariant="normal">.</mi><mi>M</mi><mn>2.5</mn><mtext>将</mtext><mi>o</mi><mi>u</mi><mi>t</mi><mi>p</mi><mi>u</mi><mi>t</mi><mtext>价格压到</mtext></mrow><annotation encoding="application/x-tex">25/MTok output 价格,对于需要数百轮交互的 agentic 任务来说,单次任务成本可达数美元.M2.5 将 output 价格压到</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">25/</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">o</span><span class="mord mathnormal">u</span><span class="mord mathnormal">tp</span><span class="mord mathnormal">u</span><span class="mord mathnormal">t</span><span class="mord cjk_fallback">价格</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord cjk_fallback">对于需要数百轮交互的</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.0359em;">g</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">t</span><span class="mord mathnormal">i</span><span class="mord mathnormal">c</span><span class="mord cjk_fallback">任务来说</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord cjk_fallback">单次任务成本可达数美元</span><span class="mord">.</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord">2.5</span><span class="mord cjk_fallback">将</span><span class="mord mathnormal">o</span><span class="mord mathnormal">u</span><span class="mord mathnormal">tp</span><span class="mord mathnormal">u</span><span class="mord mathnormal">t</span><span class="mord cjk_fallback">价格压到</span></span></span></span>1.20/MTok,意味着同样的 agentic 任务成本降低 20 倍.这不是简单的&quot;降价竞争&quot;,而是基于架构效率的结构性成本优势——MoE 的稀疏激活天然适合降低单次 forward 的计算成本.MiniMax 将&quot;四个实例运行一整年 \$10,000&quot;作为卖点,这在传统企业软件采购语境中极具说服力:一年的 AI agent 基础设施成本相当于一个初级工程师一到两个月的薪水.</p>
</blockquote>
<hr>
<h2 id="6-gjsd">6. 改进速度</h2>
<p>从 2025 年 10 月下旬至今的三个半月内,MiniMax 相继发布了 M2、M2.1 和 M2.5,模型改进速度超出最初预期.例如,在备受关注的 SWE-Bench Verified 基准上,M2 系列的进步速度显著快于 Claude、GPT 和 Gemini 等同行模型家族.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: M2 系列在 3.5 个月内从 M2 到 M2.5 实现了 SWE-Bench Verified 的跨越式提升,这个迭代速度确实惊人.但需要谨慎看待&quot;进步速度&quot;的比较:Claude/GPT/Gemini 的迭代周期通常以季度或半年为单位,而 M2 系列作为新进入者,其早期迭代受益于快速试错和 RL 环境的快速积累.更关键的问题是这种改进速度是否可持续——当 SWE-Bench Verified 接近 80% 后,进一步的提升空间变小,且需要解决越来越边缘的 corner case.MiniMax 自己也承认&quot;M2 系列唯一剩下的问题是如何持续推动模型能力前沿&quot;,这暗示了边际收益递减的现实.</p>
</blockquote>
<hr>
<h2 id="7-rl-gmh">7. RL 规模化</h2>
<p>上述发展的关键驱动因素之一是强化学习的规模化.在训练模型的同时,MiniMax 也从模型的能力中受益.公司日常运营中的大多数任务和工作空间已被转化为 RL 的训练环境.迄今为止,已有数十万个这样的环境.</p>
<p>同时,MiniMax 在 agentic RL 框架、算法、奖励信号和基础设施工程方面做了大量工作,以支持 RL 训练的持续规模化.</p>
<h3 id="7-1-forge-agent-native-rl-kj">7.1 Forge: Agent-Native RL 框架</h3>
<p>MiniMax 内部设计了名为 Forge 的 agent-native RL 框架,引入中间层将底层训练-推理引擎与 agent 完全解耦,支持集成任意 agent,并能够优化模型在 agent scaffold 和工具上的泛化能力.</p>
<p>为提升系统吞吐量,团队优化了异步调度策略以平衡系统吞吐量与样本 off-policyness,并设计了树状结构化的样本合并策略,实现了约 40 倍的训练加速.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: Forge 框架的中间层设计是解决 agentic RL 中&quot;训练-推理不匹配&quot;问题的关键工程创新.在传统 RL 中,训练框架(如 PyTorch)和推理框架(如 vLLM)通常是紧耦合的——每次策略更新后需要同步权重,这在 agentic 场景中尤为痛苦,因为 agent 的执行可能涉及外部工具调用、网络等待等不可预测的延迟.Forge 通过中间层将两者解耦,意味着训练可以基于稍旧的策略版本(off-policy)进行,而不必等待每次 agent 执行的完成.异步调度策略和树状样本合并进一步提升了吞吐量.40 倍的训练加速不是来自算法创新,而是来自系统工程的重新设计——这再次验证了&quot;在规模化 RL 中,基础设施优化的回报可能超过算法优化&quot;的行业共识.</p>
</blockquote>
<h3 id="7-2-agentic-rl-sfyjlsj">7.2 Agentic RL 算法与奖励设计</h3>
<p>在算法层面,MiniMax 继续使用去年年初提出的 CISPO(Confidence-Informed Self-Play Optimization)算法,以确保 MoE 模型在大规模训练期间的稳定性.为应对 agent rollout 中长上下文带来的 credit assignment 挑战,团队引入了过程奖励机制(process reward),对生成质量进行端到端监控.此外,为深度对齐用户体验,团队通过 agent 轨迹评估任务完成时间,实现了模型智能与响应速度的最优权衡.</p>
<p>MiniMax 表示将在单独的技术博客中发布更全面的 RL 规模化介绍.</p>
<blockquote>
<p><strong>思考节点-架构细节</strong>: CISPO 是 MiniMax 去年提出的针对 MoE 的 RL 稳定算法,其核心思路是利用置信度信息来指导自对弈优化,缓解 MoE 中专家路由不稳定导致的训练震荡.过程奖励机制(process reward)的引入是为了解决长 horizon agent 任务中的 credit assignment 问题:在一个 100 步的 agent 轨迹中,最终结果的成败难以归因到具体哪一步的决策.过程奖励通过对中间步骤的质量进行评分,提供了更细粒度的学习信号.但过程奖励的设计本身就是一项挑战——如果奖励模型不准确,可能会引入新的偏差.MiniMax 将&quot;任务完成时间&quot;也纳入优化目标,这是一个有趣的多目标 RL 设置:不仅追求做对,还追求做得快.</p>
</blockquote>
<hr>
<h2 id="8-mini-max-agent-m2-5-zwzyyg">8. MiniMax Agent: M2.5 作为专业员工</h2>
<p>M2.5 已全面部署于 MiniMax Agent,提供最佳的 agentic 体验.</p>
<p>MiniMax 将核心信息处理能力提炼为标准化的 Office Skills,深度集成于 MiniMax Agent 中.在 MAX 模式下,处理 Word 排版、PowerPoint 编辑和 Excel 计算等任务时,MiniMax Agent 会根据文件类型自动加载对应的 Office Skills,提升任务输出质量.</p>
<p>此外,用户可以将 Office Skills 与领域特定的行业 expertise 结合,创建针对特定任务场景的可复用 Experts.以行业研究为例:将成熟的研究框架 SOP 与 Word Skills 融合,Agent 可以严格遵循既定框架自动获取数据、组织分析逻辑并输出格式规范的研究报告——而非仅仅生成一段原始文本.在金融建模场景中,将机构专有的建模标准与 Excel Skills 结合,Agent 可以遵循特定的风控逻辑和计算标准自动生成并验证复杂的金融模型,而非简单输出一个基础电子表格.</p>
<p>截至目前,用户已在 MiniMax Agent 上构建了超过 10,000 个 Experts,且这一数字仍在快速增长.MiniMax 还在 MiniMax Agent 上为办公、金融和编程等高频场景构建了多套深度优化、开箱即用的 Expert 套件.</p>
<p>MiniMax 自身也已率先从 M2.5 的能力中获益.在整个公司的日常运营中,30% 的整体任务由 M2.5 自主完成,涵盖研发、产品、销售、人力资源和财务等职能——且渗透率仍在持续上升.编码场景中的表现尤为突出,M2.5 生成的代码占新提交代码的 80%.</p>
<blockquote>
<p><strong>思考节点-局限风险</strong>: &quot;30% 的任务由 M2.5 自主完成&quot;和&quot;80% 的新提交代码由 M2.5 生成&quot;这两个数字需要谨慎解读.首先,未披露这些任务的复杂度分布——如果 30% 中大部分是简单的数据整理、邮件回复等低复杂度任务,则这个数字的商业意义有限.其次,80% 的代码生成比例未说明代码审查和修改的后续流程——如果这 80% 的代码在提交前经过了大量人工修改,则实际的生产力增益远低于表面数字.最后,MiniMax 作为模型开发者,其内部使用场景可能与外部用户的真实需求存在偏差,这些内部指标的外推有效性有待验证.</p>
</blockquote>
<hr>
<h2 id="9-fl-pgff">9. 附录: 评估方法</h2>
<p>M2.5 的进一步基准测试结果及其评估方法如下.</p>
<p><strong>SWE benchmark</strong>: SWE-bench Verified、SWE-bench Multilingual、SWE-bench-pro 和 Multi-SWE-bench 均使用 Claude Code 作为 scaffold 在内部基础设施上测试,默认系统提示被覆盖,结果取 4 次运行的平均.此外,SWE-bench Verified 还在 Droid 和 Opencode scaffold 上使用默认提示进行了评估.</p>
<p><strong>Terminal Bench 2</strong>: 使用 Claude Code 2.0.64 作为评估 scaffold.修改了部分问题的 Dockerfile 以确保问题本身的正确性,统一将 sandbox 规格扩展至 8 核 CPU 和 16GB 内存,统一设置超时为 7,200 秒,并为每道题目配备了基础工具集(ps、curl、git 等).不在超时后重试,但增加了对空 scaffold 响应的检测机制,对最终响应为空的任务进行重试以处理各种异常中断场景.最终结果取 4 次运行的平均.</p>
<p><strong>VIBE-Pro</strong>: 内部基准.使用 Claude Code 作为 scaffold 自动验证程序的交互逻辑与视觉效果.所有分数通过包含需求集、容器化部署和动态交互环境的统一流水线计算.最终结果取 3 次运行的平均.</p>
<p><strong>BrowseComp</strong>: 使用与 WebExplorer(Liu et al., 2025)相同的 agent 框架.当 token 使用量超过最大上下文的 30% 时,丢弃全部历史.</p>
<p><strong>Wide Search</strong>: 使用与 WebExplorer(Liu et al., 2025)相同的 agent 框架.</p>
<p><strong>RISE</strong>: 内部基准.包含来自人类专家的真实问题,评估模型结合复杂网页交互时的多步信息检索与推理能力.在 WebExplorer(Liu et al., 2025) agent 框架之上添加了基于 Playwright 的浏览器工具套件.</p>
<p><strong>GDPval-MM</strong>: 内部基准.基于开源 GDPval 测试集,使用自定义 agentic 评估框架,由 LLM-as-a-judge 对完整轨迹进行 pairwise 胜/平/负判断.每任务的平均 token 成本根据各厂商官方 API 定价(不含 caching)计算.</p>
<p><strong>MEWC</strong>: 内部基准.基于 MEWC(Microsoft Excel World Championship),包含 2021-2026 年主赛区及其他地区赛区的 179 道题目.评估模型理解竞赛级 Excel 电子表格并使用 Excel 工具完成题目的能力.得分通过逐个比较输出单元格与答案单元格的值来计算.</p>
<p><strong>Finance Modeling</strong>: 内部基准.主要由行业专家构造的金融建模问题,涉及通过 Excel 工具执行的端到端研究与分析任务.每道题目使用专家设计的 rubric 评分.最终结果取 3 次运行的平均.</p>
<p><strong>AIME25 ~ AA-LCR</strong>: 通过基于 Artificial Analysis Intelligence Index 排行榜覆盖的公开评估集和评估方法的内部测试获得.</p>
<blockquote>
<p><strong>思考节点-数据实验</strong>: 评估方法的透明度是这篇博客的一个亮点.MiniMax 不仅给出了数字,还详细披露了评估配置——scaffold 类型、硬件规格、超时设置、重试策略、平均次数等.这使得第三方复现成为可能.但需要注意的是, BrowseComp 使用了&quot;当 token 使用量超过 30% 时丢弃全部历史&quot;的 context management 策略,这实际上是一种 test-time pass@k 变体:模型有多次从头开始的机会.BrowseComp 的分数在这种策略下会显著高于单次尝试的分数,直接与其他模型的单次尝试分数对比可能不公平.此外,多个内部基准(RISE、GDPval-MM、MEWC、Finance Modeling)使用专家设计的问题和 rubric,虽然更贴近真实场景,但也引入了评估者自身的偏好偏差,独立第三方的验证尚未完成.</p>
</blockquote>
<hr>
<h2 id="10-mxpxdw">10. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: MiniMax-M2(2025-10) / M2.1(2025-12)</li>
<li><strong>核心创新</strong>: Forge agent-native RL 框架(训练-推理解耦、异步调度、树状样本合并)、CISPO MoE 稳定算法、过程奖励机制、Expert-Skill 双层 agent 架构</li>
<li><strong>被后续工作引用</strong>: MiniMax-M2.7(2026-03) 在 M2.5 基础上引入了自我进化机制(OpenClaw harness)和 RL 团队自动化</li>
<li><strong>技术定位</strong>: M2.5 是&quot;为真实世界生产力而生&quot;的 agent-native 模型,其设计哲学与 DeepSeek-V3.2(工程优化)和 Step-3.5-Flash(推理延迟优化)形成差异化竞争——M2.5 的核心差异化是极致的成本效率和办公场景深度优化</li>
</ul>
<hr>
<p><em>本文档基于 MiniMax 官方博客逐段精译,所有数据与评估方法均忠实于原文.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"0-hxzbydw","text":"0. 核心指标与定位"},{"level":2,"id":"1-bcnl","text":"1. 编程能力"},{"level":2,"id":"2-ssygjty","text":"2. 搜索与工具调用"},{"level":2,"id":"3-bgcj","text":"3. 办公场景"},{"level":2,"id":"4-xs","text":"4. 效率"},{"level":2,"id":"5-cb","text":"5. 成本"},{"level":2,"id":"6-gjsd","text":"6. 改进速度"},{"level":2,"id":"7-rl-gmh","text":"7. RL 规模化"},{"level":3,"id":"7-1-forge-agent-native-rl-kj","text":"7.1 Forge: Agent-Native RL 框架"},{"level":3,"id":"7-2-agentic-rl-sfyjlsj","text":"7.2 Agentic RL 算法与奖励设计"},{"level":2,"id":"8-mini-max-agent-m2-5-zwzyyg","text":"8. MiniMax Agent: M2.5 作为专业员工"},{"level":2,"id":"9-fl-pgff","text":"9. 附录: 评估方法"},{"level":2,"id":"10-mxpxdw","text":"10. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/01-mini-max-m2.5-jsbgjy-2" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/01-mini-max-m2.5-jsbgjy-2" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax-M2.5 技术报告精译</h1>
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
