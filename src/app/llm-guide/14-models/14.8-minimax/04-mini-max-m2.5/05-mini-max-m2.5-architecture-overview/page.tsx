"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax M2.5 真实世界生产力与 Agent 原生 RL 框架剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>分析基础</strong>: MiniMax M2.5: Built for Real-World Productivity (MiniMax Blog, 2026-02-12)
<strong>剖析角度</strong>: Agentic 不可能三角、Forge RL 框架、真实世界评估、成本效率
<strong>面向读者</strong>: 已阅读 MiniMax M2.5 技术报告精译,希望深入理解 Agent 原生训练与真实世界生产力优化的研究者与工程师</p>
</blockquote>
<hr>
<h2 id="1-hxdw-ys-agentic-bknsj">1. 核心定位:压缩 Agentic 不可能三角</h2>
<p>MiniMax M2.5 的设计目标不是单纯追求 benchmark 分数,而是破解 agentic 应用的「不可能三角&quot;——性能、价格、速度三者不可兼得.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="center">M2.5</th>
<th align="center">M2.5-Lightning</th>
<th align="center">Claude Opus 4.6</th>
<th align="center">成本比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">SWE-Bench Verified</td>
<td align="center">80.2%</td>
<td align="center">—</td>
<td align="center">~78.9%</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">推理吞吐</td>
<td align="center">50 TPS</td>
<td align="center"><strong>100 TPS</strong></td>
<td align="center">~50 TPS</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">Input 价格(\$/MTok)</td>
<td align="center">0.15</td>
<td align="center">0.30</td>
<td align="center">5.00</td>
<td align="center"><strong>1/33</strong></td>
</tr>
<tr>
<td align="left">Output 价格(\$/MTok)</td>
<td align="center">1.20</td>
<td align="center">2.40</td>
<td align="center">25.00</td>
<td align="center"><strong>1/21</strong></td>
</tr>
<tr>
<td align="left">SWE 端到端时间</td>
<td align="center">22.8 min</td>
<td align="center">—</td>
<td align="center">22.9 min</td>
<td align="center">持平</td>
</tr>
<tr>
<td align="left">SWE 每任务成本</td>
<td align="center">~<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.30</mn><mi mathvariant="normal">∣</mi><mtext>—</mtext><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">0.30 | — | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.30∣—∣</span><span class="mspace nobreak"> </span></span></span></span>3.00</td>
<td align="center"><strong>1/10</strong></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: M2.5 在 SWE 端到端时间上持平 Opus 4.6,但每任务成本仅为 10%.这不是简单的降价竞争,而是基于 MoE 稀疏激活和极致推理优化的结构性成本优势.MiniMax 将「四个实例运行一整年 \$10,000&quot;作为卖点,这在企业软件采购语境中极具说服力.</p>
</blockquote>
<hr>
<h2 id="2-bcnl-cdmbqdjgssw">2. 编程能力:从代码补全到架构师思维</h2>
<h3 id="2-1-qsmzqfg">2.1 全生命周期覆盖</h3>
<p>M2.5 的编程能力覆盖软件工程的完整生命周期:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">能力</th>
<th align="left">训练覆盖</th>
</tr>
</thead>
<tbody><tr>
<td align="left">0-to-1</td>
<td align="left">系统设计与环境搭建</td>
<td align="left">200,000+ 真实环境</td>
</tr>
<tr>
<td align="left">1-to-10</td>
<td align="left">系统开发</td>
<td align="left">10+ 编程语言</td>
</tr>
<tr>
<td align="left">10-to-90</td>
<td align="left">功能迭代</td>
<td align="left">Web/Android/iOS/Windows</td>
</tr>
<tr>
<td align="left">90-to-100</td>
<td align="left">代码审查与系统测试</td>
<td align="left">服务端 API/业务逻辑/数据库</td>
</tr>
</tbody></table>
<h3 id="2-2-k-scaffold-fh">2.2 跨 Scaffold 泛化</h3>
<p>M2.5 在不同 coding agent scaffold 上的 SWE-Bench Verified 表现:</p>
<table>
<thead>
<tr>
<th align="left">Scaffold</th>
<th align="center">M2.5</th>
<th align="center">Opus 4.6</th>
<th align="left">评价</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Claude Code</td>
<td align="center">80.2</td>
<td align="center">~78.9</td>
<td align="left">基线</td>
</tr>
<tr>
<td align="left">Droid</td>
<td align="center"><strong>79.7</strong></td>
<td align="center">78.9</td>
<td align="left"><strong>超越</strong></td>
</tr>
<tr>
<td align="left">OpenCode</td>
<td align="center"><strong>76.1</strong></td>
<td align="center">75.9</td>
<td align="left"><strong>超越</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 跨 scaffold 泛化是 agentic 模型评估中最容易被忽视也最关键的维度.许多模型在单一 scaffold 上优化过度,换到不同 scaffold 后性能断崖下跌.M2.5 在三种 scaffold 上均持平或超越 Opus 4.6,说明其能力不是 scaffold 特化的「过拟合&quot;,而是 genuinely 的代码理解能力.</p>
</blockquote>
<h3 id="2-3-spec-writing-qx">2.3 Spec-Writing 倾向</h3>
<p>M2.5 的一个独特行为特征是「像架构师一样思考和规划&quot;——在编写任何代码之前,主动分解和规划项目的功能、结构与 UI 设计.这种 Spec-writing 倾向在训练过程中自然涌现,而非通过显式提示工程注入.</p>
<hr>
<h2 id="3-ssygjty-rise-zssjpg">3. 搜索与工具调用:RISE 真实世界评估</h2>
<h3 id="3-1-ssxsts">3.1 搜索效率提升</h3>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="center">M2.1</th>
<th align="center">M2.5</th>
<th align="center">提升</th>
</tr>
</thead>
<tbody><tr>
<td align="left">搜索轮次</td>
<td align="center">基线</td>
<td align="center"><strong>-20%</strong></td>
<td align="center">更少轮次,更好结果</td>
</tr>
<tr>
<td align="left">BrowseComp</td>
<td align="center">—</td>
<td align="center"><strong>76.3%</strong></td>
<td align="center">行业领先</td>
</tr>
</tbody></table>
<p>M2.5 学会了用更精确的搜索轮次和更好的 token 效率来解决问题——不再仅仅是「得到正确答案&quot;,而是以更高效的路径推理出结果.</p>
<h3 id="3-2-rise-zssjzjjss">3.2 RISE:真实世界专家级搜索</h3>
<p>RISE(Realistic Interactive Search Evaluation)与现有搜索基准的关键区别:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">BrowseComp 等传统基准</th>
<th align="left">RISE</th>
</tr>
</thead>
<tbody><tr>
<td align="left">问题来源</td>
<td align="left">人工构造</td>
<td align="left"><strong>真实人类专家提出的问题</strong></td>
</tr>
<tr>
<td align="left">评估焦点</td>
<td align="left">能否找到答案</td>
<td align="left"><strong>搜索策略质量、信息筛选效率、多源交叉验证</strong></td>
</tr>
<tr>
<td align="left">评估方式</td>
<td align="left">Pass/fail</td>
<td align="left"><strong>基于 Playwright 的完整多步交互轨迹评估</strong></td>
</tr>
<tr>
<td align="left">场景复杂度</td>
<td align="left">单轮搜索</td>
<td align="left"><strong>跨信息密集型网页的深度探索</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: 传统搜索基准设计为「能否找到答案&quot;的二元判断,但真实世界的研究任务中,「找到答案&quot;只是起点.RISE 的评估更接近实际研究能力——模型不仅要找到信息,还要以高效、严谨的方式找到.</p>
</blockquote>
<hr>
<h2 id="4-bgcj-expert-skill-scjg">4. 办公场景:Expert-Skill 双层架构</h2>
<h3 id="4-1-gd-pval-mm-pgsj">4.1 GDPval-MM 评估设计</h3>
<p>GDPval-MM 的评估维度超越了单纯的输出质量:</p>
<table>
<thead>
<tr>
<th align="left">评估维度</th>
<th align="left">内容</th>
<th align="left">意义</th>
</tr>
</thead>
<tbody><tr>
<td align="left">最终输出质量</td>
<td align="left">可交付成果的准确性</td>
<td align="left">传统评估</td>
</tr>
<tr>
<td align="left">Agent 轨迹专业性</td>
<td align="left">是否遵循标准流程、充分交叉验证</td>
<td align="left"><strong>过程质量</strong></td>
</tr>
<tr>
<td align="left">Token 成本</td>
<td align="left">每任务的经济消耗</td>
<td align="left"><strong>经济效率</strong></td>
</tr>
</tbody></table>
<p>59.0% 的平均胜率意味着 M2.5 在 pairwise 对比中略优于对手,但这个数字距离「碾压&quot;还很远,说明办公场景的 agentic 能力仍处于激烈竞争阶段.</p>
<h3 id="4-2-expert-skill-jg">4.2 Expert-Skill 架构</h3>
<p>MiniMax Agent 的 Office Skills 体系:</p>
<table>
<thead>
<tr>
<th align="left">层级</th>
<th align="left">功能</th>
<th align="left">示例</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Skills</td>
<td align="left">标准化的信息处理能力</td>
<td align="left">Word 排版、PPT 编辑、Excel 计算</td>
</tr>
<tr>
<td align="left">Experts</td>
<td align="left">Skills + 领域特定 expertise</td>
<td align="left">行业研究框架 SOP + Word Skills = 自动研究报告生成</td>
</tr>
</tbody></table>
<p>用户已构建超过 10,000 个 Experts,说明这种「模块化组合&quot;的架构具有良好的可扩展性和用户接受度.</p>
<hr>
<h2 id="5-forge-agent-native-rl-kj">5. Forge:Agent-Native RL 框架</h2>
<h3 id="5-1-xl-tljo">5.1 训练-推理解耦</h3>
<p>Forge 框架的核心创新是引入中间层将底层训练-推理引擎与 agent 完全解耦:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">传统 RL</th>
<th align="left">Forge</th>
</tr>
</thead>
<tbody><tr>
<td align="left">训练-推理关系</td>
<td align="left">紧耦合,每次策略更新后同步权重</td>
<td align="left"><strong>解耦,训练基于稍旧策略版本(off-policy)</strong></td>
</tr>
<tr>
<td align="left">Agent 延迟容忍</td>
<td align="left">低(等待每次 agent 执行完成)</td>
<td align="left"><strong>高(异步调度)</strong></td>
</tr>
<tr>
<td align="left">吞吐量</td>
<td align="left">受 agent 执行延迟限制</td>
<td align="left"><strong>约 40 倍训练加速</strong></td>
</tr>
<tr>
<td align="left">scaffold 泛化</td>
<td align="left">固定 scaffold</td>
<td align="left"><strong>支持集成任意 agent</strong></td>
</tr>
</tbody></table>
<h3 id="5-2-cispo-ygcjl">5.2 CISPO 与过程奖励</h3>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">功能</th>
<th align="left">解决的问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left">CISPO</td>
<td align="left">置信度信息指导自对弈优化</td>
<td align="left">MoE 专家路由不稳定导致的训练震荡</td>
</tr>
<tr>
<td align="left">过程奖励</td>
<td align="left">对生成质量进行端到端监控</td>
<td align="left">长 horizon agent 任务的 credit assignment</td>
</tr>
<tr>
<td align="left">时间优化</td>
<td align="left">将任务完成时间纳入奖励</td>
<td align="left">智能与响应速度的最优权衡</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: CISPO 是 MiniMax 去年提出的针对 MoE 的 RL 稳定算法.过程奖励的引入是为了解决长 horizon agent 任务中的 credit assignment 问题——在一个 100 步的 agent 轨迹中,最终结果的成败难以归因到具体哪一步的决策.过程奖励通过对中间步骤的质量进行评分,提供了更细粒度的学习信号.</p>
</blockquote>
<hr>
<h2 id="6-xsycb-100-tps-djjx">6. 效率与成本:100 TPS 的经济学</h2>
<h3 id="6-1-sdjcb">6.1 速度即成本</h3>
<p>M2.5-Lightning 的 100 TPS 在 MoE 大模型中属于顶尖水平.这意味着:</p>
<table>
<thead>
<tr>
<th align="left">场景</th>
<th align="center">50 TPS (M2.5)</th>
<th align="center">100 TPS (Lightning)</th>
<th align="left">影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">SWE 端到端时间</td>
<td align="center">22.8 min</td>
<td align="center">~11.4 min</td>
<td align="left">任务完成速度翻倍</td>
</tr>
<tr>
<td align="left">连续运行 1h 成本</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.30</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.30 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.30∣</span></span></span></span>1.00</td>
<td align="center">Lightning 速度优先,成本略高</td>
<td align="left"></td>
</tr>
<tr>
<td align="left">用户体验</td>
<td align="center">可接受</td>
<td align="center">接近实时</td>
<td align="left">交互式 agent 场景差距显著</td>
</tr>
</tbody></table>
<h3 id="6-2-cbjgfx">6.2 成本结构分析</h3>
<p>以 SWE-Bench Verified 任务为例:</p>
<table>
<thead>
<tr>
<th align="left">成本项</th>
<th align="center">M2.5</th>
<th align="center">Opus 4.6</th>
<th align="center">比率</th>
</tr>
</thead>
<tbody><tr>
<td align="left">每任务 token 消耗</td>
<td align="center">3.52M</td>
<td align="center">~3.5M</td>
<td align="center">持平</td>
</tr>
<tr>
<td align="left">Input 成本</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.53</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.53 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.53∣</span></span></span></span>17.50</td>
<td align="center">1/33</td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Output 成本</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4.22</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">4.22 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">4.22∣</span></span></span></span>87.50</td>
<td align="center">1/21</td>
<td align="center"></td>
</tr>
<tr>
<td align="left"><strong>每任务总成本</strong></td>
<td align="center"><strong>~<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4.75</mn><mo>∗</mo><mo>∗</mo><mi mathvariant="normal">∣</mi><mo>∗</mo><mo>∗</mo><mtext> </mtext></mrow><annotation encoding="application/x-tex">4.75** | **~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4.75</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∗</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4653em;"></span><span class="mord">∗</span><span class="mspace nobreak"> </span></span></span></span>105.00</strong></td>
<td align="center"><strong>1/22</strong></td>
<td align="center"></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>关键洞察</strong>: Token 消耗量与 Opus 4.6 基本持平,但单价差距巨大.M2.5 的成本优势完全来自架构效率(MoE 稀疏激活)和推理优化,而非通过牺牲质量来减少 token 使用.</p>
</blockquote>
<hr>
<h2 id="7-jsskjd">7. 技术思考节点</h2>
<h3 id="7-1-sjdj">7.1 设计动机</h3>
<blockquote>
<p><strong>思考 1: 为什么「真实世界生产力&quot;应该是 Agentic 模型的北极星指标?</strong></p>
</blockquote>
<p>当前 agentic 模型评估存在严重的「benchmark 通胀&quot;问题:模型在 SWE-Bench、BrowseComp 等学术基准上追求高分,但这些基准的设计往往与真实使用场景脱节.MiniMax 选择将「真实世界生产力&quot;作为核心目标,其评估体系反映了这一哲学:</p>
<table>
<thead>
<tr>
<th align="left">评估类型</th>
<th align="left">学术基准</th>
<th align="left">MiniMax 内部基准</th>
<th align="left">真实世界对应</th>
</tr>
</thead>
<tbody><tr>
<td align="left">编程</td>
<td align="left">SWE-Bench</td>
<td align="left">VIBE-Pro, 跨 scaffold 测试</td>
<td align="left">端到端项目交付</td>
</tr>
<tr>
<td align="left">搜索</td>
<td align="left">BrowseComp</td>
<td align="left">RISE</td>
<td align="left">专家级研究任务</td>
</tr>
<tr>
<td align="left">办公</td>
<td align="left">—</td>
<td align="left">GDPval-MM, MEWC, Finance Modeling</td>
<td align="left">金融建模、文档处理</td>
</tr>
</tbody></table>
<p>这种评估体系的构建成本远高于标准学术基准——需要领域专家参与、真实环境搭建、长期数据积累.但只有这样训练出的模型才能真正解决用户的实际问题,而非在 leaderboard 上刷分.</p>
<blockquote>
<p><strong>思考 2: Agentic「不可能三角&quot;的压缩路径</strong></p>
</blockquote>
<p>Agentic 应用的传统困境:</p>
<table>
<thead>
<tr>
<th align="left">选择</th>
<th align="center">性能</th>
<th align="center">成本</th>
<th align="center">速度</th>
<th align="left">代表</th>
</tr>
</thead>
<tbody><tr>
<td align="left">闭源旗舰</td>
<td align="center">高</td>
<td align="center">极高</td>
<td align="center">中</td>
<td align="left">Claude Opus, GPT-4</td>
</tr>
<tr>
<td align="left">小模型</td>
<td align="center">低</td>
<td align="center">低</td>
<td align="center">快</td>
<td align="left">GPT-3.5</td>
</tr>
<tr>
<td align="left">自托管大模型</td>
<td align="center">高</td>
<td align="center">中</td>
<td align="center">慢</td>
<td align="left">Llama-70B</td>
</tr>
</tbody></table>
<p>M2.5 的压缩路径:</p>
<ul>
<li><strong>性能</strong>: MoE 保持大模型容量(200B total),激活参数效率(10B active)保证质量</li>
<li><strong>成本</strong>: 稀疏激活 + 极致推理优化 → 单价降至 Opus 的 1/20</li>
<li><strong>速度</strong>: 100 TPS serving + RL 优化的任务分解 → 端到端时间与 Opus 持平</li>
</ul>
<p>这不是在三角形的某条边上做取舍,而是通过架构创新将整个三角形向内压缩.</p>
<h3 id="7-2-sjsy">7.2 数据实验</h3>
<blockquote>
<p><strong>思考 3: 跨 scaffold 泛化的可信度边界</strong></p>
</blockquote>
<p>M2.5 在 Claude Code、Droid、OpenCode 三种 scaffold 上的表现确实证明了泛化能力.但需要审视几个潜在问题:</p>
<table>
<thead>
<tr>
<th align="left">问题</th>
<th align="left">表现</th>
<th align="left">影响</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数据污染</td>
<td align="left">训练数据截止日期和来源范围未披露</td>
<td align="left">SWE-Bench 测试数据可能泄露</td>
</tr>
<tr>
<td align="left">Scaffold 相似性</td>
<td align="left">三种 scaffold 都基于类似的 agent 循环</td>
<td align="left">泛化到更异构的 scaffold 仍未知</td>
</tr>
<tr>
<td align="left">评估偏差</td>
<td align="left">内部基础设施评估,非第三方独立验证</td>
<td align="left">环境配置差异可能影响结果</td>
</tr>
</tbody></table>
<p>更严格的验证需要:公开的训练数据截止日期、第三方在不同云环境中的复现、以及对抗性 scaffold(故意设计为难模型的交互模式)的测试.</p>
<blockquote>
<p><strong>思考 4: BrowseComp 的 Context Management 策略对分数的影响</strong></p>
</blockquote>
<p>M2.5 在 BrowseComp 上使用了「当 token 使用量超过 30% 时丢弃全部历史&quot;的策略:</p>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="left">效果</th>
<th align="left">公平性问题</th>
</tr>
</thead>
<tbody><tr>
<td align="left">丢弃全部历史</td>
<td align="left">模型有多次从头开始的机会</td>
<td align="left">相当于 test-time pass@k 变体</td>
</tr>
<tr>
<td align="left">分数提升</td>
<td align="left">显著高于单次尝试</td>
<td align="left">与其他模型的单次尝试分数不可直接对比</td>
</tr>
</tbody></table>
<p>这种 context management 在真实应用中可能是合理的——如果模型发现上下文膨胀导致性能下降,主动重置是明智的.但在 benchmark 比较中,需要明确标注评估策略的差异.</p>
<h3 id="7-3-jgxj">7.3 架构细节</h3>
<blockquote>
<p><strong>思考 5: Forge 框架的「40 倍训练加速&quot;来自哪里?</strong></p>
</blockquote>
<p>40 倍的加速不是来自算法创新,而是来自系统工程的重新设计:</p>
<table>
<thead>
<tr>
<th align="left">优化点</th>
<th align="left">传统 RL</th>
<th align="left">Forge</th>
<th align="left">加速来源</th>
</tr>
</thead>
<tbody><tr>
<td align="left">训练-推理同步</td>
<td align="left">每次更新后同步权重</td>
<td align="left">解耦,允许 off-policy</td>
<td align="left">消除等待延迟</td>
</tr>
<tr>
<td align="left">样本收集</td>
<td align="left">顺序执行 agent</td>
<td align="left">异步调度,并行收集</td>
<td align="left">提高 GPU 利用率</td>
</tr>
<tr>
<td align="left">样本合并</td>
<td align="left">简单拼接</td>
<td align="left">树状结构化合并</td>
<td align="left">减少 I/O 瓶颈</td>
</tr>
<tr>
<td align="left">scaffold 切换</td>
<td align="left">固定 scaffold</td>
<td align="left">动态集成任意 agent</td>
<td align="left">更广泛的数据分布</td>
</tr>
</tbody></table>
<p>这验证了「在规模化 RL 中,基础设施优化的回报可能超过算法优化&quot;的行业共识.但 40 倍的数字也可能包含了从「未优化基线&quot;到「优化系统&quot;的比较,如果基线本身效率很低,40 倍的提升虽然真实,但可能不代表行业领先.</p>
<blockquote>
<p><strong>思考 6: 过程奖励的设计困境</strong></p>
</blockquote>
<p>过程奖励(process reward)为长 horizon agent 任务提供了更细粒度的学习信号,但其设计面临固有困境:</p>
<table>
<thead>
<tr>
<th align="left">困境</th>
<th align="left">表现</th>
<th align="left">风险</th>
</tr>
</thead>
<tbody><tr>
<td align="left">奖励模型准确性</td>
<td align="left">对中间步骤的评分可能引入偏差</td>
<td align="left">错误的过程奖励会误导策略</td>
</tr>
<tr>
<td align="left">粒度选择</td>
<td align="left">太粗无法区分关键步骤,太细增加标注成本</td>
<td align="left">最优粒度难以确定</td>
</tr>
<tr>
<td align="left">与结果奖励的权衡</td>
<td align="left">过程奖励可能牺牲最终结果优化</td>
<td align="left">模型学会「看起来对&quot;而非「真正对&quot;</td>
</tr>
</tbody></table>
<p>MiniMax 将「任务完成时间&quot;也纳入优化目标,这是一个有趣的多目标 RL 设置.但多目标优化本身也增加了复杂度——如何在「做对&quot;、「做得快&quot;和&quot;做得省&quot;之间找到帕累托最优,是一个开放问题.</p>
<h3 id="7-4-jxyfx">7.4 局限与风险</h3>
<blockquote>
<p><strong>思考 7: 「30% 任务自主完成&quot;和「80% 代码生成&quot;的内部指标外推风险</strong></p>
</blockquote>
<p>MiniMax 披露的内部使用指标需要谨慎解读:</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">潜在问题</th>
<th align="left">需要的补充信息</th>
</tr>
</thead>
<tbody><tr>
<td align="left">30% 任务自主完成</td>
<td align="left">任务复杂度分布未知</td>
<td align="left">简单任务占比?</td>
</tr>
<tr>
<td align="left">80% 新提交代码由 M2.5 生成</td>
<td align="left">人工审查和修改比例未知</td>
<td align="left">生成后修改率?</td>
</tr>
<tr>
<td align="left">渗透率持续上升</td>
<td align="left">饱和点在哪里?</td>
<td align="left">当前趋势是否线性?</td>
</tr>
</tbody></table>
<p>内部指标与外部用户场景的差异也需要考虑:MiniMax 作为模型开发者,其内部工具链和 harness 可能比外部用户的更完善,这些指标的外推有效性有待验证.</p>
<blockquote>
<p><strong>思考 8: M2 系列快速迭代的可持续性</strong></p>
</blockquote>
<p>M2 系列在 3.5 个月内从 M2 到 M2.5 实现了 SWE-Bench Verified 的跨越式提升:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">时间</th>
<th align="left">进步</th>
</tr>
</thead>
<tbody><tr>
<td align="left">M2</td>
<td align="left">2025-10</td>
<td align="left">基准</td>
</tr>
<tr>
<td align="left">M2.1</td>
<td align="left">2025-12</td>
<td align="left">初步提升</td>
</tr>
<tr>
<td align="left">M2.5</td>
<td align="left">2026-02</td>
<td align="left">大幅跃升</td>
</tr>
</tbody></table>
<p>这种迭代速度确实惊人,但可持续性面临挑战:</p>
<ul>
<li>SWE-Bench Verified 接近 80% 后,进一步提升空间变小</li>
<li>边际收益递减:解决越来越边缘的 corner case 需要不成比例的资源投入</li>
<li>评估通胀:随着模型能力提升,benchmark 可能需要更新以保持区分度</li>
</ul>
<p>MiniMax 自己也承认「M2 系列唯一剩下的问题是如何持续推动模型能力前沿&quot;,这暗示了边际收益递减的现实.</p>
<blockquote>
<p><strong>思考 9: 非商业许可对开源生态的影响</strong></p>
</blockquote>
<p>M2.7(及 M2 系列)采用非商业许可,这与 GLM-5.1 的 MIT License 形成对比:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">非商业许可(M2.7)</th>
<th align="left">MIT License(GLM-5.1)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">研究使用</td>
<td align="left">允许</td>
<td align="left">允许</td>
</tr>
<tr>
<td align="left">商业部署</td>
<td align="left"><strong>禁止</strong></td>
<td align="left">允许</td>
</tr>
<tr>
<td align="left">社区贡献</td>
<td align="left">受限(无法商业 fork)</td>
<td align="left">自由</td>
</tr>
<tr>
<td align="left">生态网络效应</td>
<td align="left">弱</td>
<td align="left">强</td>
</tr>
</tbody></table>
<p>从战略角度看,MiniMax 选择非商业许可可能是为了保护 API 业务.但对于开源社区,这降低了模型作为「开源基础设施&quot;的采用率.企业在选择自托管方案时,可能倾向于许可更宽松的替代方案.</p>
<h3 id="7-5-jspx">7.5 技术谱系</h3>
<blockquote>
<p><strong>思考 10: M2.5 在 Agent-Native 训练路线中的位置</strong></p>
</blockquote>
<p>当前 agentic 模型训练形成了三条路线:</p>
<table>
<thead>
<tr>
<th align="left">路线</th>
<th align="left">代表</th>
<th align="left">核心策略</th>
<th align="left">优势场景</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Agent-Native RL</strong></td>
<td align="left"><strong>MiniMax M2.5</strong></td>
<td align="left">从训练阶段就融入 agentic 反馈</td>
<td align="left">真实世界生产力任务</td>
</tr>
<tr>
<td align="left">后训练 Agent 适配</td>
<td align="left">Kimi K2.6</td>
<td align="left">基础模型 + Agent 框架后训练</td>
<td align="left">编码 Agent,多 Agent 协作</td>
</tr>
<tr>
<td align="left">推理优化 Agent</td>
<td align="left">Step 3.5 Flash</td>
<td align="left">低延迟 + 工具使用</td>
<td align="left">交互式对话,实时 Agent</td>
</tr>
</tbody></table>
<p>M2.5 的独特之处在于其「训练即 Agent&quot;的哲学——模型不是在训练后被套上 agent 的 harness,而是在训练过程中就学会了如何作为 agent 行动.这种内化的 agentic 行为可能比后训练的适配更稳定、更泛化.</p>
<blockquote>
<p><strong>思考 11: 从「按调用付费&quot;到「按使用时长计费&quot;的商业模式转移</strong></p>
</blockquote>
<p>M2.5 的定价策略(\$0.30/小时连续运行)暗示了一种商业模式转移:</p>
<table>
<thead>
<tr>
<th align="left">模式</th>
<th align="left">计费单位</th>
<th align="left">适用场景</th>
<th align="left">用户感知</th>
</tr>
</thead>
<tbody><tr>
<td align="left">按 token</td>
<td align="left">\$/MTok</td>
<td align="left">单次查询</td>
<td align="left">难以预估总成本</td>
</tr>
<tr>
<td align="left">按调用</td>
<td align="left">\$/request</td>
<td align="left">API 集成</td>
<td align="left">与调用频率挂钩</td>
</tr>
<tr>
<td align="left"><strong>按时长</strong></td>
<td align="left"><strong>\$/hour</strong></td>
<td align="left"><strong>Agent 持续运行</strong></td>
<td align="left"><strong>类似于人力成本</strong></td>
</tr>
</tbody></table>
<p>「四个实例运行一整年 \$10,000&quot;的表述将 AI agent 成本锚定到「一个初级工程师一到两个月的薪水&quot;.这种锚定效应在企业采购决策中极具说服力——它让 CFO 可以直观比较「雇人&quot;和&quot;雇 AI&quot;的成本.</p>
<p>如果按使用时长计费成为行业标准,将深刻改变模型的设计和优化目标:不再是「单次生成质量最高&quot;,而是「单位时间内的总产出最高&quot;.这可能推动模型向更快的推理速度、更高效的任务分解和更低的 token 消耗优化.</p>
<hr>
<h2 id="8-bssj-cjspycbyh">8. 部署视角:场景适配与成本优化</h2>
<h3 id="8-1-cj-mxpp">8.1 场景-模型匹配</h3>
<table>
<thead>
<tr>
<th align="left">应用场景</th>
<th align="left">推荐版本</th>
<th align="left">关键能力</th>
<th align="left">注意事项</th>
</tr>
</thead>
<tbody><tr>
<td align="left">软件工程(SWE)</td>
<td align="left">M2.5</td>
<td align="left">SWE 80.2%,端到端 22.8min</td>
<td align="left">跨 scaffold 泛化已验证</td>
</tr>
<tr>
<td align="left">实时交互 Agent</td>
<td align="left">M2.5-Lightning</td>
<td align="left">100 TPS,接近实时</td>
<td align="left">成本略高</td>
</tr>
<tr>
<td align="left">搜索研究</td>
<td align="left">M2.5</td>
<td align="left">BrowseComp 76.3%,RISE</td>
<td align="left">需要搜索 API</td>
</tr>
<tr>
<td align="left">办公自动化</td>
<td align="left">M2.5</td>
<td align="left">GDPval 59%,MEWC</td>
<td align="left">需要 Office 工具集成</td>
</tr>
<tr>
<td align="left">成本敏感批处理</td>
<td align="left">M2.5</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.15</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">0.15/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.15/</span></span></span></span>1.20 per MTok</td>
<td align="left">支持 caching</td>
</tr>
<tr>
<td align="left">商业产品集成</td>
<td align="left">API 调用</td>
<td align="left">非商业许可限制自托管</td>
<td align="left">注意许可条款</td>
</tr>
</tbody></table>
<h3 id="8-2-cbjsq">8.2 成本计算器</h3>
<p>以典型 agentic 任务为例:</p>
<table>
<thead>
<tr>
<th align="left">任务</th>
<th align="center">Token 消耗</th>
<th align="center">M2.5 成本</th>
<th align="center">Opus 4.6 成本</th>
<th align="center">节省</th>
</tr>
</thead>
<tbody><tr>
<td align="left">SWE-Bench 单次</td>
<td align="center">3.5M</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4.75</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">4.75 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">4.75∣</span></span></span></span>105.00</td>
<td align="center"><strong>95%</strong></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">1 小时 Agent 运行(100 TPS)</td>
<td align="center">~360K output</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.43</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.43 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.43∣</span></span></span></span>9.00</td>
<td align="center"><strong>95%</strong></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">100 次 API 调用(平均 2K in/4K out)</td>
<td align="center">600K</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.81</mn><mi mathvariant="normal">∣</mi></mrow><annotation encoding="application/x-tex">0.81 |</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">0.81∣</span></span></span></span>15.00</td>
<td align="center"><strong>95%</strong></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">1 年 4 实例持续运行</td>
<td align="center">—</td>
<td align="center"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10</mn><mo separator="true">,</mo><mn>000</mn><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">10,000 | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">10</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">000∣</span><span class="mspace nobreak"> </span></span></span></span>200,000</td>
<td align="center"><strong>95%</strong></td>
<td align="center"></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>建议</strong>: 对于需要大规模 agentic 部署的企业,M2.5 的成本优势极为显著.但需要注意非商业许可限制——如果业务场景涉及商业产品集成,建议通过 API 调用而非自托管权重.</p>
</blockquote>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: MiniMax M2.5: Built for Real-World Productivity, MiniMax Blog, 2026-02-12</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.8-minimax/04-mini-max-m2.5/01-mini-max-m2.5-jsbgjy-2">01-MiniMax-M2.5技术报告精译</a></li>
<li>后续模型: <a href="#broken-link">MiniMax M2.7 剖析</a></li>
<li>对比基准: Claude Opus 4.6, Kimi K2.6, GLM-5.1</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-hxdw-ys-agentic-bknsj","text":"1. 核心定位:压缩 Agentic 不可能三角"},{"level":2,"id":"2-bcnl-cdmbqdjgssw","text":"2. 编程能力:从代码补全到架构师思维"},{"level":3,"id":"2-1-qsmzqfg","text":"2.1 全生命周期覆盖"},{"level":3,"id":"2-2-k-scaffold-fh","text":"2.2 跨 Scaffold 泛化"},{"level":3,"id":"2-3-spec-writing-qx","text":"2.3 Spec-Writing 倾向"},{"level":2,"id":"3-ssygjty-rise-zssjpg","text":"3. 搜索与工具调用:RISE 真实世界评估"},{"level":3,"id":"3-1-ssxsts","text":"3.1 搜索效率提升"},{"level":3,"id":"3-2-rise-zssjzjjss","text":"3.2 RISE:真实世界专家级搜索"},{"level":2,"id":"4-bgcj-expert-skill-scjg","text":"4. 办公场景:Expert-Skill 双层架构"},{"level":3,"id":"4-1-gd-pval-mm-pgsj","text":"4.1 GDPval-MM 评估设计"},{"level":3,"id":"4-2-expert-skill-jg","text":"4.2 Expert-Skill 架构"},{"level":2,"id":"5-forge-agent-native-rl-kj","text":"5. Forge:Agent-Native RL 框架"},{"level":3,"id":"5-1-xl-tljo","text":"5.1 训练-推理解耦"},{"level":3,"id":"5-2-cispo-ygcjl","text":"5.2 CISPO 与过程奖励"},{"level":2,"id":"6-xsycb-100-tps-djjx","text":"6. 效率与成本:100 TPS 的经济学"},{"level":3,"id":"6-1-sdjcb","text":"6.1 速度即成本"},{"level":3,"id":"6-2-cbjgfx","text":"6.2 成本结构分析"},{"level":2,"id":"7-jsskjd","text":"7. 技术思考节点"},{"level":3,"id":"7-1-sjdj","text":"7.1 设计动机"},{"level":3,"id":"7-2-sjsy","text":"7.2 数据实验"},{"level":3,"id":"7-3-jgxj","text":"7.3 架构细节"},{"level":3,"id":"7-4-jxyfx","text":"7.4 局限与风险"},{"level":3,"id":"7-5-jspx","text":"7.5 技术谱系"},{"level":2,"id":"8-bssj-cjspycbyh","text":"8. 部署视角:场景适配与成本优化"},{"level":3,"id":"8-1-cj-mxpp","text":"8.1 场景-模型匹配"},{"level":3,"id":"8-2-cbjsq","text":"8.2 成本计算器"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/05-mini-max-m2.5-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/04-mini-max-m2.5/05-mini-max-m2.5-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax M2.5 真实世界生产力与 Agent 原生 RL 框架剖析</h1>
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
