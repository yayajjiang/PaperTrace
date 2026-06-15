"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax M2.7 自我进化与多智能体协作剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: MiniMax M2.7: Early Echoes of Self-Evolution (MiniMax Blog, 2026-03-18)
发布日期: 2026-03-18
发布机构: MiniMax
开源协议: 非商业许可(non-commercial license)</p>
</blockquote>
<hr>
<h2 id="1-sjdj-mxyhzsgjl">1. 设计动机:模型优化自身工具链</h2>
<p>M2.7 的核心主张是「自我进化」(self-evolution),但需要精确理解其含义.M2.7 并非修改自己的权重(那将是真正的自修改 AI,目前尚不存在),而是<strong>通过操作外部环境(scaffold/harness)来间接提升自身表现</strong>.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">权重自修改(科幻)</th>
<th align="left">M2.7 自我进化(现实)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">修改对象</td>
<td align="left">模型参数</td>
<td align="left"><strong>Harness 外部组件(skills, memory, workflow)</strong></td>
</tr>
<tr>
<td align="left">技术要求</td>
<td align="left">需解决自指安全问题</td>
<td align="left">基于现有工具链操作</td>
</tr>
<tr>
<td align="left">可验证性</td>
<td align="left">不可预测</td>
<td align="left"><strong>可追踪、可回滚</strong></td>
</tr>
<tr>
<td align="left">当前可行性</td>
<td align="left">不存在</td>
<td align="left"><strong>已部署</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: 这是一个「模型优化自身工具链」的范式,而非「模型改写自身代码」的范式.前者在当前技术栈下可行,后者涉及深层的安全和理论基础问题.这个区分很重要,因为它定义了 M2.7「自我进化」的精确边界.M2.7 的权重从未改变,改变的是 harness 的外部状态(更好的 skills,更好的 memory,更好的 workflow 规则).这意味着改进循环可以在生产环境中持续运行,不需要任何重训练.</p>
</blockquote>
<p>M2.7 的训练过程存在一个精妙的自举循环:较弱版本的 M2.7-early 搭建 harness,较强版本的 M2.7-late 在优化后的 harness 上训练.这与传统的「固定 harness + 训练模型」范式有本质区别.</p>
<hr>
<h2 id="2-hxjg-230b-moe-y-agent-yssj">2. 核心架构:230B MoE 与 Agent 原生设计</h2>
<p>MiniMax M2.7 采用稀疏 Mixture-of-Experts(MoE)架构,总规模约 230B 参数,每 token 激活约 10B 参数.上下文窗口约为 204K tokens.模型为纯文本模型,不支持原生图像、音频或视频输入.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">MiniMax M2.7</th>
<th align="left">Claude Opus 4.6</th>
<th align="left">GLM-5.1</th>
<th align="left">Kimi K2.6</th>
</tr>
</thead>
<tbody><tr>
<td align="left">架构</td>
<td align="left">230B MoE, ~10B active</td>
<td align="left">未知(闭源)</td>
<td align="left">754B MoE, ~40B active</td>
<td align="left">1T MoE, 32B active</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">~204K</td>
<td align="left">200K std, 1M beta</td>
<td align="left">200K</td>
<td align="left">256K</td>
</tr>
<tr>
<td align="left">SWE-Pro</td>
<td align="left">56.22%</td>
<td align="left">~57.3%</td>
<td align="left">58.4%</td>
<td align="left">58.6%</td>
</tr>
<tr>
<td align="left">Terminal Bench 2</td>
<td align="left">57.0%(Claude Code)</td>
<td align="left">~65.4%(Terminus-2)</td>
<td align="left">63.5%(Terminus-2)</td>
<td align="left">50.8%(Terminus-2)</td>
</tr>
<tr>
<td align="left">MLE-Bench Lite 奖牌率</td>
<td align="left">66.6%</td>
<td align="left">75.7%</td>
<td align="left">—</td>
<td align="left">—</td>
</tr>
<tr>
<td align="left">输入定价(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">/1M tokens) | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣</span><span class="mspace nobreak"> </span></span></span></span>0.30</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5.00</mn><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">5.00 | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5.00∣</span><span class="mspace nobreak"> </span></span></span></span>0.80</td>
<td align="left">—</td>
<td align="left"></td>
<td align="left"></td>
</tr>
<tr>
<td align="left">输出定价(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">/1M tokens) | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣</span><span class="mspace nobreak"> </span></span></span></span>1.20</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>25.00</mn><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">25.00 | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">25.00∣</span><span class="mspace nobreak"> </span></span></span></span>2.56</td>
<td align="left">—</td>
<td align="left"></td>
<td align="left"></td>
</tr>
<tr>
<td align="left">许可</td>
<td align="left">非商业</td>
<td align="left">闭源 API</td>
<td align="left">MIT(全开放)</td>
<td align="left">Modified MIT</td>
</tr>
<tr>
<td align="left">模态</td>
<td align="left">纯文本</td>
<td align="left">文本+多模态</td>
<td align="left">纯文本</td>
<td align="left">文本+视觉</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: 在 SWE-Pro 这个核心 coding agent benchmark 上,M2.7(56.22%), Opus 4.6(~57.3%), GLM-5.1(58.4%), K2.6(58.6%) 的差距其实非常小——前两名之间仅 2.4 个百分点.这说明在复杂软件工程任务上,开源模型已经追平了顶级闭源模型.但 M2.7 的定价优势极为悬殊:输入成本是 Opus 4.6 的 1/16,输出成本是 1/20.对于需要大量 tool call 的 agentic 任务,这种成本差异会被进一步放大.</p>
</blockquote>
<hr>
<h2 id="3-gjcx-harness-zzyhydgjh">3. 关键创新:Harness 自主优化与递归进化</h2>
<h3 id="3-1-yj-agent-harness-30-50-gzlzdh">3.1 研究 Agent Harness:30-50% 工作流自动化</h3>
<p>M2.7 构建的研究 agent harness 包含五个核心组件:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">功能</th>
<th align="left">与模型交互方式</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数据流水线</td>
<td align="left">数据获取、清洗、转换</td>
<td align="left">模型编排数据流</td>
</tr>
<tr>
<td align="left">训练环境</td>
<td align="left">实验启动、资源配置</td>
<td align="left">模型触发实验执行</td>
</tr>
<tr>
<td align="left">基础设施</td>
<td align="left">日志读取、调试、指标分析</td>
<td align="left">模型监控并响应异常</td>
</tr>
<tr>
<td align="left">跨团队协作</td>
<td align="left">Merge request、代码评审</td>
<td align="left">模型生成并提交变更</td>
</tr>
<tr>
<td align="left">持久化记忆</td>
<td align="left">实验历史、经验教训</td>
<td align="left">模型读写记忆文件</td>
</tr>
</tbody></table>
<p>M2.7 在 RL 团队日常工作流中处理了 30%-50% 的工作流,但这一数字需要谨慎解读.原文未披露「处理工作流」的精确定义和基线,因此 30-50% 的含金量难以精确评估.如果这是从零搭建的 harness,其意义远大于在已有基础设施上的增量自动化.</p>
<blockquote>
<p><strong>译者注</strong>: 「30-50% 工作流」的量化指标需要谨慎解读.第一,这是一个 vendor self-reported 的数字,缺乏独立验证.第二,「处理工作流」的定义范围不明确——是指 agent 完成了 30-50% 的决策点,还是 30-50% 的工时?如果是前者,agent 可能只做了大量低风险的自动化操作(如日志格式化、指标绘图),而核心的算法设计和超参选择仍然由人类完成.</p>
</blockquote>
<h3 id="3-2-dgjhxh-pdca-dzzsx">3.2 递归进化循环:PDCA 的自主实现</h3>
<p>M2.7 在一个内部 scaffold 上执行了超过 100 轮的自主优化循环:</p>
<pre><code>分析失败轨迹 → 规划变更 → 修改 scaffold 代码 → 运行评测 → 对比结果 → 决定保留或回退
</code></pre>
<p>这是一个经典的「计划-执行-检查-行动」(PDCA)循环,但完全由模型自主驱动.</p>
<table>
<thead>
<tr>
<th align="left">优化方向</th>
<th align="left">具体内容</th>
<th align="left">对应瓶颈</th>
</tr>
</thead>
<tbody><tr>
<td align="left">配置空间探索</td>
<td align="left">系统性搜索 temperature, frequency penalty, presence penalty 最优组合</td>
<td align="left"><strong>采样参数调优</strong></td>
</tr>
<tr>
<td align="left">知识工程</td>
<td align="left">设计更具体的工作流指南(如修复 bug 后自动搜索相同模式)</td>
<td align="left"><strong>知识沉淀</strong></td>
</tr>
<tr>
<td align="left">系统鲁棒性</td>
<td align="left">在 agent 循环中添加 loop detection</td>
<td align="left"><strong>异常处理</strong></td>
</tr>
</tbody></table>
<p>最终,这在内部评测集上实现了 <strong>30% 的性能提升</strong>.</p>
<blockquote>
<p><strong>译者注</strong>: 30% 的提升非常惊人,但限定了「内部评测集」,这意味着评测集的具体构成、难度分布和泛化性都未公开.这个 30% 可能包含了对评测集本身的过拟合风险.最关键的问题是:如果更换一组从未见过的测试任务,30% 的提升是否仍然成立?原文没有提供交叉验证的数据.</p>
</blockquote>
<h3 id="3-3-mle-bench-lite-dzyzzyhyz">3.3 MLE-Bench Lite:低资源自主优化验证</h3>
<table>
<thead>
<tr>
<th align="left">参数</th>
<th align="left">设置</th>
<th align="left">意义</th>
</tr>
</thead>
<tbody><tr>
<td align="left">竞赛数量</td>
<td align="left">22 场</td>
<td align="left">覆盖 ML 工作流所有阶段</td>
</tr>
<tr>
<td align="left">硬件</td>
<td align="left">单张 A30 GPU</td>
<td align="left">低资源设定,排除算力因素</td>
</tr>
<tr>
<td align="left">迭代时间</td>
<td align="left">每批次 24 小时</td>
<td align="left">充足的 trial-and-error 机会</td>
</tr>
<tr>
<td align="left">批次</td>
<td align="left">3 批次</td>
<td align="left">验证可重复性</td>
</tr>
<tr>
<td align="left">指标</td>
<td align="left">M2.7</td>
<td align="left">Opus 4.6</td>
</tr>
<tr>
<td align="left">:---</td>
<td align="left">:---:</td>
<td align="left">:---:</td>
</tr>
<tr>
<td align="left">平均奖牌率</td>
<td align="left"><strong>66.6%</strong></td>
<td align="left">75.7%</td>
</tr>
<tr>
<td align="left">最佳批次</td>
<td align="left">9 金 / 5 银 / 1 铜</td>
<td align="left">—</td>
</tr>
</tbody></table>
<p>平均奖牌率 66.6% 与 Gemini 3.1 持平,仅次于 Opus 4.6 和 GPT-5.4.考虑到 A30 GPU 的低资源设定,这个结果证明了<strong>自主优化能力不依赖海量算力,而依赖算法设计</strong>.</p>
<p>MLE-Bench Lite 的 harness 包含三个核心组件:</p>
<table>
<thead>
<tr>
<th align="left">组件</th>
<th align="left">功能</th>
<th align="left">实现形式</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Short-term memory</td>
<td align="left">记录每轮迭代的状态和经验</td>
<td align="left">Markdown 文件</td>
</tr>
<tr>
<td align="left">Self-feedback</td>
<td align="left">对当前轮次结果进行自我批评</td>
<td align="left">结构化评估文本</td>
</tr>
<tr>
<td align="left">Self-optimization</td>
<td align="left">基于记忆和反馈调整策略</td>
<td align="left">下一轮的执行计划</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: MLE-Bench Lite 是这篇博客中最接近「可独立验证」的证据.OpenAI 开源了竞赛环境,第三方理论上可以复现.但 harness 的具体实现细节(如 memory 格式、self-criticism 的 prompt 设计)对结果影响巨大,原文未披露这些细节,限制了社区复现能力.此外,「最佳批次」9 金 5 银 1 铜并不等于平均批次的表现,三批次的平均值才是更可靠的指标.</p>
</blockquote>
<h3 id="3-4-skill-adherence-97-d-office-zdhkkx">3.4 Skill Adherence:97% 的 Office 自动化可靠性</h3>
<p>M2.7 在与超过 40 个复杂 skills 协作时,每个 skill 超过 2,000 tokens,仍能保持 <strong>97% 的 skill adherence rate</strong>.</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">高 adherence 的意义</th>
<th align="left">低 adherence 的风险</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Office 自动化</td>
<td align="left">严格遵循操作流程,结果可预测</td>
<td align="left">错误切换 skill,遗漏步骤,导致失败</td>
</tr>
<tr>
<td align="left">多轮工具调用</td>
<td align="left">不偏离预定技能路径</td>
<td align="left">在复杂任务中「迷路」</td>
</tr>
<tr>
<td align="left">可交付质量</td>
<td align="left">输出符合专业标准</td>
<td align="left">生成内容虽好但不符合要求</td>
</tr>
</tbody></table>
<p>对于 Office 自动化这类需要严格遵循操作流程的任务,高 adherence rate 比单纯的生成质量更重要.一个模型可能写出很好的 Excel 公式,但如果它在操作过程中错误地切换了 skill 或遗漏了步骤,结果仍然是失败的.97% 的 adherence rate 意味着 M2.7 在 40 个 skills 的复杂 orchestration 中只犯 3% 的路径错误——这是工程可靠性的关键指标.</p>
<hr>
<h2 id="4-hxdb-szcc-agent-lxdfh">4. 横向对比:三种长程 Agent 路线的分化</h2>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">MiniMax M2.7</th>
<th align="left">GLM-5.1</th>
<th align="left">Kimi K2.6</th>
</tr>
</thead>
<tbody><tr>
<td align="left">核心策略</td>
<td align="left"><strong>Harness 自我进化</strong></td>
<td align="left">持续迭代优化</td>
<td align="left">多 Agent 并行编排</td>
</tr>
<tr>
<td align="left">优化对象</td>
<td align="left">外部工具链</td>
<td align="left">模型自身行为</td>
<td align="left">多 Agent 协调策略</td>
</tr>
<tr>
<td align="left">长程机制</td>
<td align="left">递归 harness 改进</td>
<td align="left">数百轮自主诊断</td>
<td align="left">300 子 Agent Swarm</td>
</tr>
<tr>
<td align="left">验证方式</td>
<td align="left">MLE-Bench Lite</td>
<td align="left">VectorDBBench/KernelBench</td>
<td align="left">BrowseComp/Kimi Code Bench</td>
</tr>
<tr>
<td align="left">最佳场景</td>
<td align="left">ML 竞赛,工具链优化</td>
<td align="left">数值优化,代码调优</td>
<td align="left">信息检索,大规模并行</td>
</tr>
</tbody></table>
<p>M2.7 的独特价值在于:<strong>它是第一个将优化对象从「模型权重」扩展到「模型外部工具链」的开源模型</strong>.如果这个范式被验证为可持续,可能对未来 AI 系统的开发方式产生深远影响——即从「训练-部署-维护」的线性流程,转向「训练-进化-再进化」的循环流程.</p>
<hr>
<h2 id="5-jxxyfx">5. 局限性与风险</h2>
<p><strong>非商业许可的生态限制.</strong> M2.7 的非商业许可限制了其作为开源基础设施的采用.如果「自我进化」的核心价值在于 harness 的持续迭代,那么非商业许可限制了 harness 改进的社区参与.这意味着 M2.7 的自我进化可能主要发生在 MiniMax 内部,而非像 Llama 或 Qwen 那样形成开放的进化生态.</p>
<p><strong>30-50% 工作流量化的定义模糊性.</strong> 原文没有精确定义「处理工作流」的度量方式,这限制了数字的可比性和可验证性.更严格的量化需要:明确任务分解结构、记录每个子任务的人机分工、测量各子任务的实际工时.</p>
<p><strong>自我进化的安全边界.</strong> M2.7 的自我进化虽然局限于 harness 层面,但仍存在安全风险:Harness 退化(迭代过程中引入错误)、目标漂移(优化指标与真实目标不一致)、评估过拟合(评测集无法代表真实任务).当前 M2.7 的进化还是在研究者设定的指导下进行的,人类在关键决策点介入.但随着自动化程度的提高,这些安全边界的维护将越来越重要.</p>
<p><strong>角色一致性与情商的评估挑战.</strong> M2.7 展现了「出色的角色一致性和情商」,但这两个能力的评估缺乏标准化基准.这些「软能力」对于产品体验至关重要,但比编程和搜索能力更难量化和比较.</p>
<p><strong>信息来源限制.</strong> M2.7 的信息来源是官方博客而非学术论文,技术细节披露有限.核心主张(如 30% 性能提升、30-50% 工作流自动化)缺乏独立验证,社区应以审慎乐观的态度对待.</p>
<hr>
<h2 id="6-c-rlcy-d-rljd-djhjdl">6. 从「人类参与」到「人类监督」的进化阶段论</h2>
<p>M2.7 的自我进化可以视为一个阶段性演进过程:</p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">人类角色</th>
<th align="left">模型角色</th>
<th align="center">当前状态</th>
</tr>
</thead>
<tbody><tr>
<td align="left">阶段 0: 人工设计</td>
<td align="left">设计 harness,训练模型</td>
<td align="left">执行固定任务</td>
<td align="center">过去</td>
</tr>
<tr>
<td align="left">阶段 1: 人类参与</td>
<td align="left">提出想法,审核变更</td>
<td align="left">协助执行,推荐方案</td>
<td align="center"><strong>M2.7 当前</strong></td>
</tr>
<tr>
<td align="left">阶段 2: 人类监督</td>
<td align="left">设定目标,处理异常</td>
<td align="left">自主优化,定期汇报</td>
<td align="center">近期目标</td>
</tr>
<tr>
<td align="left">阶段 3: 完全自主</td>
<td align="left">设定高层目标</td>
<td align="left">端到端自主进化</td>
<td align="center">远期愿景</td>
</tr>
</tbody></table>
<p>M2.7 目前处于阶段 1 到阶段 2 的过渡期.关键挑战是从「人类在关键决策点介入」过渡到「人类仅在异常情况下介入」.这需要 harness 具备更强的自我诊断和自我修复能力,以及更可靠的异常检测机制.</p>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: MiniMax M2.7: Early Echoes of Self-Evolution, MiniMax Blog, 2026-03-18</li>
<li>前置阅读: <a href="#broken-link">01-MiniMax-M2.7技术博客精译</a></li>
<li>前代模型: MiniMax M2.5 技术报告精译(见 03-MiniMax-M2.5 目录)</li>
<li>对比基准: MLE-Bench Lite (OpenAI), Claude Opus 4.6, GLM-5.1, Kimi K2.6</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-mxyhzsgjl","text":"1. 设计动机:模型优化自身工具链"},{"level":2,"id":"2-hxjg-230b-moe-y-agent-yssj","text":"2. 核心架构:230B MoE 与 Agent 原生设计"},{"level":2,"id":"3-gjcx-harness-zzyhydgjh","text":"3. 关键创新:Harness 自主优化与递归进化"},{"level":3,"id":"3-1-yj-agent-harness-30-50-gzlzdh","text":"3.1 研究 Agent Harness:30-50% 工作流自动化"},{"level":3,"id":"3-2-dgjhxh-pdca-dzzsx","text":"3.2 递归进化循环:PDCA 的自主实现"},{"level":3,"id":"3-3-mle-bench-lite-dzyzzyhyz","text":"3.3 MLE-Bench Lite:低资源自主优化验证"},{"level":3,"id":"3-4-skill-adherence-97-d-office-zdhkkx","text":"3.4 Skill Adherence:97% 的 Office 自动化可靠性"},{"level":2,"id":"4-hxdb-szcc-agent-lxdfh","text":"4. 横向对比:三种长程 Agent 路线的分化"},{"level":2,"id":"5-jxxyfx","text":"5. 局限性与风险"},{"level":2,"id":"6-c-rlcy-d-rljd-djhjdl","text":"6. 从「人类参与」到「人类监督」的进化阶段论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/05-mini-max-m2.7/05-mini-max-m2.7-zwjhydzntxz" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/05-mini-max-m2.7/05-mini-max-m2.7-zwjhydzntxz" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax M2.7 自我进化与多智能体协作剖析</h1>
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
