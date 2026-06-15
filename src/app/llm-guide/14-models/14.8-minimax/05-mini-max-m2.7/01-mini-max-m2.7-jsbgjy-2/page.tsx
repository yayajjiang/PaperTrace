"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniMax M2.7 技术博客精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.8-minimax/14.8-minimax">返回 14.8-MiniMax 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniMax M2.7: Early Echoes of Self-Evolution
原文链接: <a href="https://www.minimax.io/news/minimax-m27-en">https://www.minimax.io/news/minimax-m27-en</a>
发布日期: 2026-03-18
发布机构: MiniMax</p>
</blockquote>
<h2 id="mxdw-scsdcyzsjhdmx">模型定位: 首次深度参与自身进化的模型</h2>
<p>在 M2 系列模型首次发布后的数月里,我们收到了来自热心用户和开发者的大量反馈与建议,这推动我们进一步加速模型迭代的效率. 在人类生产力已经充分释放的情况下,自然而然的下一步是启动模型和组织两者的自我进化. M2.7 是我们第一个深度参与自身进化的模型. </p>
<p>M2.7 能够构建复杂的 agent harness,并完成高度精细的生产力任务,其能力依托于 Agent Teams, complex Skills 和 dynamic tool search 等机制. 例如,在开发 M2.7 的过程中,我们让模型更新自己的记忆,并在其 harness 中构建数十个复杂 skills 以辅助强化学习实验. 我们进一步让模型基于实验结果改进自己的学习过程和 harness. 这一过程开启了模型自我进化的循环. </p>
<blockquote>
<p>译者注: 这里的核心主张是「自我进化」(self-evolution),但需要精确理解其含义. MiniMax 所描述的并非模型修改自己的权重(那将是真正的自修改AI,目前尚不存在),而是模型通过操作外部环境(scaffold/harness)来间接提升自身表现. harness 包含 skills, memory, MCP 实现等外部模块,模型通过修改这些外部组件来优化训练流程——这是一个「模型优化自身工具链」的范式,而非「模型改写自身代码」的范式. 这个区分很重要,因为前者在当前技术栈下是可行的,后者则涉及深层的安全和理论基础问题. </p>
</blockquote>
<h2 id="sxhxnl">三项核心能力</h2>
<h3 id="rjgc">软件工程</h3>
<p>M2.7 在真实世界的软件工程中表现出色,包括端到端的全项目交付、日志分析、bug 排查、代码安全、机器学习等领域. 在 SWE-Pro benchmark 上,M2.7 取得了 56.22% 的成绩,接近 Opus 的最佳水平. 这一能力也延伸至端到端的全项目交付场景(VIBE-Pro 55.6%)以及在 Terminal Bench 2 上对复杂工程系统的深度理解(57.0%). </p>
<blockquote>
<p>译者注: SWE-Pro 56.22% 这个数字需要放在上下文中理解. 根据同期数据,Claude Opus 4.6 在 SWE-Pro 上的成绩约为 57.3%,GLM-5.1 为 58.4%. M2.7 的 56.22% 处于第一梯队,但尚未登顶. VIBE-Pro 55.6% 衡量的是端到端项目交付能力,Terminal Bench 2 57.0% 则反映 DevOps 自动化场景下的表现. 这三个 benchmark 的共同点是:它们都测量多步骤、长程的 agentic 能力,而非单次代码生成的准确率. M2.7 在这些指标上的强劲表现,与其「从训练阶段就融入 agentic 反馈」的方法论是一致的. </p>
</blockquote>
<h3 id="zybgrj">专业办公软件</h3>
<p>我们还增强了模型在专业办公软件各领域的专业知识和任务交付能力. 其在 GDPval-AA 上的 ELO 分数为 1495,是开源模型中的最高值. M2.7 在 Office 套件(Excel, PPT, Word)的复杂编辑能力上表现出显著提升,能够更好地处理多轮修订和高保真编辑. M2.7 能够与复杂环境交互:在与超过 40 个复杂 skills 协作时,每个 skill 超过 2,000 tokens,它仍能保持 97% 的 skill adherence rate. </p>
<blockquote>
<p>译者注: GDPval-AA(Gaussian Process Document Validation - Agent Arena)是一个评估文档自动化处理能力的 benchmark,涵盖 Excel 公式、PPT 排版、Word 格式等任务. ELO 1495 意味着 M2.7 在该基准上击败了绝大多数对手. 97% 的 skill adherence rate 是一个关键指标——它衡量的是模型在多轮工具调用中「不偏离预定技能路径」的能力. 对于 Office 自动化这类需要严格遵循操作流程的任务,高 adherence rate 比单纯的生成质量更重要. 一个模型可能写出很好的 Excel 公式,但如果它在操作过程中错误地切换了 skill 或遗漏了步骤,结果仍然是失败的. </p>
</blockquote>
<h3 id="jsyzxyqs">角色一致性与情商</h3>
<p>M2.7 展现出出色的角色一致性和情商,为产品创新开辟了更多空间. </p>
<p>基于这些能力,M2.7 也正在显著加速我们自身向 AI-native 组织的进化. </p>
<h2 id="gjmxzwjhd-agent">构建模型自我进化的 Agent</h2>
<p>我们首先分享一个使 M2 系列模型能够自我进化的内部工作流. 这个工作流同时也作为对模型 agentic 能力边界的一次探索. </p>
<p>现代 agent harness 利用复杂 skills, memory 和其他外部模块的组合,来提升其对各种工作环境的适应性. 在 MiniMax,我们的 agent  routinely 面临着跨越多个部门的非常复杂且迥异的工作环境. 因此,为了提升我们的 agent 在这些异构环境中的鲁棒性,我们指派了一个内部版本的 M2.7 来构建一个研究 agent harness,该 harness 与不同的研究项目组互动协作. 这个 harness 支持数据流水线、训练环境、基础设施、跨团队协作和持久化记忆——使研究者能够驱动它交付更好的模型. 研究 agent harness 在研究者设定的指导下驱动产生下一代模型的迭代循环. </p>
<blockquote>
<p>译者注: 这里有一个值得深挖的工程细节. 「内部版本的 M2.7」这个说法暗示了 M2.7 在训练过程中存在多个 checkpoint 或版本,早期版本被用来构建 harness,后期版本在优化后的 harness 上继续训练. 这实际上形成了一个「引导式自举」(bootstrapping)过程:较弱版本的模型先搭建基础设施,较强版本在更好的基础设施上进一步提升. 这与传统的「固定 harness + 训练模型」范式有本质区别——harness 本身也是动态演化的. 从系统设计的角度看,这意味着 MiniMax 的 RL 基础设施不仅需要支持模型训练,还需要支持 harness 的版本管理和回滚,复杂度显著高于标准训练 pipeline. </p>
</blockquote>
<p><img src="/llm-guide/14-models/14.8-minimax/05-mini-max-m2.7/01-mini-max-m2.7-jsbgjy-2/images/fig1_research_harness.jpg" alt="研究 agent harness 架构示意"></p>
<blockquote>
<p>图 1: MiniMax 研究 agent harness 架构示意,展示 harness 与数据流水线、训练环境、基础设施、跨团队协作和持久化记忆的交互关系. </p>
</blockquote>
<p>一个典范性的工作流体现在我们 RL 团队的日常工作中. 一位研究者首先与 agent 讨论一个实验想法,agent 协助文献综述,跟踪预设的实验 spec,编排数据和其他产物,并启动实验. 在实验过程中,agent 监测和分析实验进度,自动触发日志读取、调试、指标分析、代码修复、merge request 和 smoke test,识别并配置细微但关键的变更. 这些工作此前可能需要来自不同团队的多个研究者协作完成,而现在人类研究者仅在关键决策和讨论环节参与交互. 这加速了问题发现和实验迭代,更快地交付模型. 在这里,M2.7 能够处理 30%-50% 的工作流. </p>
<p><img src="/llm-guide/14-models/14.8-minimax/05-mini-max-m2.7/01-mini-max-m2.7-jsbgjy-2/images/fig2_rl_workflow.png" alt="RL 团队日常工作流"></p>
<blockquote>
<p>图 2: RL 团队与 agent 协作的日常工作流示意. 研究者提出实验想法,agent 协助文献综述、数据编排、实验启动、监控调试和代码修复,人类仅在关键决策点介入. </p>
</blockquote>
<blockquote>
<p>译者注: 这个「30%-50% 工作流」的量化指标需要谨慎解读. 第一,这是一个 vendor self-reported 的数字,缺乏独立验证. 第二,「处理工作流」的定义范围不明确——是指 agent 完成了 30-50% 的决策点,还是 30-50% 的工时?如果是前者,agent 可能只做了大量低风险的自动化操作(如日志格式化、指标绘图),而核心的算法设计和超参选择仍然由人类完成. 第三,harness 的质量和工具链的完备性对这个数字的影响可能不亚于模型本身的能力. 在一个已经高度自动化的 MLops 环境中,30-50% 的自动化率并不算特别惊人;但如果这是从零搭建的 harness,则意义更大. 原文没有披露基线,因此这个数字的含金量难以精确评估. </p>
</blockquote>
<p>在迭代过程中,我们意识到模型递归进化自身 harness 的能力同样至关重要. 我们的内部 harness 自主收集反馈,为内部任务构建评测集,并基于此持续迭代自身的架构、skills/MCP 实现和记忆机制,以更好更高效地完成任务. </p>
<p>例如,我们让 M2.7 在一个内部 scaffold 上优化模型的编程性能. M2.7 完全自主地运行,执行了一个迭代循环——「分析失败轨迹 → 规划变更 → 修改 scaffold 代码 → 运行评测 → 对比结果 → 决定保留或回退变更」——持续了超过 100 轮. 在这个过程中,M2.7 发现了对模型有效的优化:系统性地搜索 temperature, frequency penalty 和 presence penalty 等采样参数的最优组合;为模型设计更具体的工作流指南(例如,在修复一个 bug 后自动搜索其他文件中相同的 bug 模式);以及在 scaffold 的 agent 循环中添加 loop detection 等优化. 最终,这在内部评测集上实现了 30% 的性能提升. </p>
<blockquote>
<p>译者注: 这是整篇博客中最具技术深度的段落,值得逐点拆解. 第一,优化循环的结构非常清晰:分析-规划-修改-评测-对比-决策,这是一个经典的「计划-执行-检查-行动」(PDCA)循环,但完全由模型自主驱动. 第二,M2.7 发现的三个优化方向各有侧重:采样参数搜索属于「配置空间探索」,workflow 指南设计属于「知识工程」,loop detection 属于「系统鲁棒性」. 这三个方向恰好对应了 agentic 系统中三个常见的瓶颈——配置调优、知识沉淀和异常处理. 第三,「30% 性能提升」这个数字本身非常惊人,但原文明确限定了「内部评测集」,这意味着该评测集的具体构成、难度分布和泛化性都未公开. 这个 30% 可能包含了对评测集本身的过拟合风险. 第四,最关键的区分:这个循环中模型的权重从未改变. 改变的是 scaffold/harness 的外部状态(更好的 skills,更好的 memory,更好的 workflow 规则). 这意味着这个改进循环可以在生产环境中持续运行,不需要任何重训练——这是与「模型自我训练」的根本差异. </p>
</blockquote>
<p>我们相信,未来的 AI 自我进化将逐步走向完全自主,协调数据构建、模型训练、推理架构、评测等阶段,无需人类参与. </p>
<p>为此,我们在低资源场景中进行了初步的探索性测试. 我们让 M2.7 参与了 OpenAI 开源的 MLE Bench Lite 级别的 22 场机器学习竞赛. 这些竞赛可以在单张 A30 GPU 上运行,但几乎覆盖了机器学习工作流的所有阶段. </p>
<p><img src="/llm-guide/14-models/14.8-minimax/05-mini-max-m2.7/01-mini-max-m2.7-jsbgjy-2/images/fig3_mle_bench.png" alt="MLE-Bench Lite 奖牌率进化曲线"></p>
<blockquote>
<p>图 3: MLE-Bench Lite 三批次实验的奖牌率进化曲线. 横轴为迭代轮次,纵轴为奖牌率. ML 模型训练的 medal rate 随时间持续提升,最佳批次最终达到 9 金 5 银 1 铜. </p>
</blockquote>
<p>我们设计并实现了一个简单的 harness 来引导 agent 进行自主优化. 核心模块包括三个组件:short-term memory, self-feedback 和 self-optimization. 具体来说,在每一轮迭代后,agent 生成一个 short-term memory markdown 文件,同时对当前轮次的结果进行自我批评(self-criticism),从而为下一轮提供潜在的优化方向. 下一轮则基于此前所有轮次的 memory 和 self-feedback 链进行进一步的自我优化. 我们共运行了三批次实验,每批次有 24 小时进行迭代进化. 从图中可以看出,M2.7 训练的 ML 模型持续实现了更高的奖牌率. 最终,最佳批次获得了 9 枚金牌、5 枚银牌和 1 枚铜牌. 三批次的平均奖牌率为 66.6%,这一结果仅次于 Opus-4.6(75.7%)和 GPT-5.4(71.2%),与 Gemini-3.1(66.6%)持平. </p>
<blockquote>
<p>译者注: MLE-Bench Lite 的实验设计是这篇博客中最接近「可独立验证」的证据. OpenAI 开源了 MLE-Bench Lite 的竞赛环境,这意味着第三方理论上可以复现这个实验. 三批次实验的平均 medal rate 66.6% 与 Gemini-3.1 持平,这是一个非常有竞争力的结果. 但需要注意几个细节:第一,「最佳批次」9 金 5 银 1 铜并不等于平均批次的表现,三批次的平均值才是更可靠的指标. 第二,每批次 24 小时的迭代意味着模型有大量的 trial-and-error 机会,这与单次 Pass@1 的评测范式不同. 第三,harness 的三组件设计(short-term memory + self-feedback + self-optimization)虽然被描述为「简单」,但具体实现细节(如 memory 的格式、self-criticism 的 prompt 设计、optimization 的搜索空间)对结果的影响可能非常大. 原文没有披露这些细节,这限制了社区的复现能力. 第四,A30 GPU 的低资源设定值得关注——它表明这个实验的核心挑战不是算力,而是算法的自主优化能力. </p>
</blockquote>
<h2 id="bcxx-jg-bsyst">补充信息: 架构、部署与生态</h2>
<blockquote>
<p>以下信息来自 MiniMax 官方 Model Card、API 文档及第三方技术评测,作为对博客原文的补充,帮助读者形成对 M2.7 的完整技术画像. </p>
</blockquote>
<h3 id="mxgg">模型规格</h3>
<p>MiniMax M2.7 采用稀疏 Mixture-of-Experts(MoE)架构,总规模约 230B 参数,每 token 激活约 10B 参数. 上下文窗口约为 204K tokens(部分 API 文档标注为 197K). 模型为纯文本模型,不支持原生图像、音频或视频输入. 开源权重发布于 Hugging Face(MiniMaxAI/MiniMax-M2.7),提供多种量化版本和 GGUF 转换. </p>
<h3 id="api-djykyx">API 定价与可用性</h3>
<p>MiniMax M2.7 通过 MiniMax API 平台和第三方提供商(如 OpenRouter、AIMLAPI)提供服务. 参考定价约为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>0.30</mn><mi>p</mi><mi>e</mi><mi>r</mi><mi>m</mi><mi>i</mi><mi>l</mi><mi>l</mi><mi>i</mi><mi>o</mi><mi>n</mi><mi>i</mi><mi>n</mi><mi>p</mi><mi>u</mi><mi>t</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo separator="true">,</mo></mrow><annotation encoding="application/x-tex">0.30 per million input tokens,</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">0.30</span><span class="mord mathnormal">p</span><span class="mord mathnormal" style="margin-right:0.0278em;">er</span><span class="mord mathnormal">mi</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mord mathnormal">i</span><span class="mord mathnormal">o</span><span class="mord mathnormal">nin</span><span class="mord mathnormal">p</span><span class="mord mathnormal">u</span><span class="mord mathnormal">tt</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mpunct">,</span></span></span></span>1.20 per million output tokens. 作为对比,Claude Opus 4.6 的定价为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5.00</mn><mi mathvariant="normal">/</mi></mrow><annotation encoding="application/x-tex">5.00/</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5.00/</span></span></span></span>25.00 per million tokens,MiniMax M2.7 的成本约为前者的 1/40 到 1/20. 部分平台提供自动 prompt caching,重复长上下文在首次使用后以折扣费率计费. </p>
<h3 id="xkysyxz">许可与使用限制</h3>
<p>M2.7 的开源权重采用非商业许可(non-commercial license),允许研究和非商业用途的使用与修改,但限制商业部署. 这与 GLM-5.1 的 MIT License 形成对比——后者允许无限制的商业使用. 开发者在选择自托管方案时需要注意这一许可差异. </p>
<blockquote>
<p>译者注: 非商业许可是一个重大限制. 对于希望将 M2.7 集成到商业产品中的企业,这意味着要么通过 API(受 rate limit 和数据隐私约束),要么选择其他开源模型(如 GLM-5.1 或 Llama-4). 从战略角度看,MiniMax 选择非商业许可可能是为了保护其 API 业务的收入来源,这在开源模型领域并不罕见(GPT-2 早期也采用类似策略). 但对于开源社区而言,这一限制会降低 M2.7 作为「开源基础设施」的采用率. </p>
</blockquote>
<h3 id="yjpmxdhxdb">与竞品模型的横向对比</h3>
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
<td align="left">-</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">输入定价(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">/1M tokens) | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣</span><span class="mspace nobreak"> </span></span></span></span>0.30</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5.00</mn><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">5.00 | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">5.00∣</span><span class="mspace nobreak"> </span></span></span></span>0.80</td>
<td align="left">-</td>
<td align="left"></td>
<td align="left"></td>
</tr>
<tr>
<td align="left">输出定价(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mn>1</mn><mi>M</mi><mi>t</mi><mi>o</mi><mi>k</mi><mi>e</mi><mi>n</mi><mi>s</mi><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">/1M tokens) | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">/1</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal">t</span><span class="mord mathnormal">o</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mord mathnormal">e</span><span class="mord mathnormal">n</span><span class="mord mathnormal">s</span><span class="mclose">)</span><span class="mord">∣</span><span class="mspace nobreak"> </span></span></span></span>1.20</td>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>25.00</mn><mi mathvariant="normal">∣</mi><mtext> </mtext></mrow><annotation encoding="application/x-tex">25.00 | ~</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">25.00∣</span><span class="mspace nobreak"> </span></span></span></span>2.56</td>
<td align="left">-</td>
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
<p>数据来源: 各厂商官方 benchmark 披露、OpenRouter 定价页面、第三方评测聚合. 带 ~ 号为估算或不同 harness 下的结果,横向对比时需谨慎. </p>
</blockquote>
<blockquote>
<p>译者注: 这张对比表揭示了几个有趣的模式. 第一,在 SWE-Pro 这个核心 coding agent benchmark 上,M2.7(56.22%), Opus 4.6(~57.3%), GLM-5.1(58.4%), K2.6(58.6%) 的差距其实非常小——前两名之间仅 2.4 个百分点. 这说明在复杂软件工程任务上,开源模型已经追平了顶级闭源模型. 第二,定价差异极为悬殊:M2.7 的输入成本是 Opus 4.6 的 1/16,输出成本是 1/20. 对于需要大量 tool call 的 agentic 任务,这种成本差异会被进一步放大(因为每次 tool call 都需要重新生成上下文). 第三,许可策略的分化值得注意:GLM-5.1 和 Kimi K2.6 选择了更宽松的 MIT 系许可,MiniMax M2.7 则保留了商业限制. 这种分化反映了不同厂商对「开源」战略的不同理解——Z.ai 和 Moonshot 将开源视为生态构建手段,MiniMax 则将其视为研究社区关系维护手段,同时保护核心商业利益. </p>
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
<td>Agent harness</td>
<td>Agent 执行框架</td>
<td>模型定位</td>
<td>围绕模型构建的执行环境,包含 skills, memory, tool 注册、状态管理和反馈循环等基础设施</td>
</tr>
<tr>
<td>Agent Teams</td>
<td>Agent 团队</td>
<td>模型定位</td>
<td>多个 agent 协作完成复杂任务的组织形式</td>
</tr>
<tr>
<td>Dynamic tool search</td>
<td>动态工具搜索</td>
<td>模型定位</td>
<td>模型在运行时根据任务需求动态发现和调用合适工具的能力</td>
</tr>
<tr>
<td>Skill adherence rate</td>
<td>Skill 依从率</td>
<td>专业办公软件</td>
<td>模型在多轮工具调用中不偏离预定技能路径的比例</td>
</tr>
<tr>
<td>Scaffold</td>
<td>脚手架</td>
<td>递归进化</td>
<td>围绕模型构建的外部代码框架,定义工具调用、技能执行和状态流转逻辑</td>
</tr>
<tr>
<td>Self-criticism</td>
<td>自我批评</td>
<td>MLE-Bench Lite</td>
<td>模型对自身输出进行评价和反思,识别问题并提出改进方向</td>
</tr>
<tr>
<td>Short-term memory</td>
<td>短期记忆</td>
<td>MLE-Bench Lite</td>
<td>Agent 在单次会话或迭代周期内维护的状态信息,通常以结构化文本(如 markdown)形式存储</td>
</tr>
<tr>
<td>Self-feedback</td>
<td>自我反馈</td>
<td>MLE-Bench Lite</td>
<td>模型基于自身执行结果生成的反馈信号,用于指导下一次迭代</td>
</tr>
<tr>
<td>Self-optimization</td>
<td>自我优化</td>
<td>MLE-Bench Lite</td>
<td>模型基于记忆和反馈链调整自身行为策略的过程</td>
</tr>
<tr>
<td>OpenClaw</td>
<td>OpenClaw</td>
<td>补充信息</td>
<td>MiniMax 内部使用的 agent harness 框架名称(第三方来源披露)</td>
</tr>
<tr>
<td>MLE-Bench Lite</td>
<td>MLE-Bench Lite</td>
<td>MLE-Bench Lite</td>
<td>OpenAI 开源的机器学习竞赛 benchmark,涵盖数据清洗、特征工程、模型训练、调参等完整 ML 工作流</td>
</tr>
<tr>
<td>Medal rate</td>
<td>奖牌率</td>
<td>MLE-Bench Lite</td>
<td>在竞赛 benchmark 中获得金/银/铜牌的比例,综合反映模型在多样化任务上的能力</td>
</tr>
<tr>
<td>Frequency penalty</td>
<td>频率惩罚</td>
<td>递归进化</td>
<td>采样参数,降低已生成 token 的重复概率,防止模型陷入循环输出</td>
</tr>
<tr>
<td>Presence penalty</td>
<td>存在惩罚</td>
<td>递归进化</td>
<td>采样参数,降低任何已出现 token 的生成概率,鼓励模型引入新内容</td>
</tr>
<tr>
<td>Loop detection</td>
<td>循环检测</td>
<td>递归进化</td>
<td>检测并打断 agent 执行循环的机制,防止无限重复相同的错误操作</td>
</tr>
<tr>
<td>GDPval-AA</td>
<td>GDPval-Agent Arena</td>
<td>专业办公软件</td>
<td>评估模型在 Excel, PPT, Word 等办公软件中完成复杂文档处理任务的 benchmark</td>
</tr>
<tr>
<td>VIBE-Pro</td>
<td>VIBE-Pro</td>
<td>软件工程</td>
<td>评估模型端到端交付完整代码项目的 benchmark</td>
</tr>
<tr>
<td>SWE-Pro</td>
<td>SWE-Pro</td>
<td>软件工程</td>
<td>SWE-Bench 的专业版,基于真实 GitHub issue 的代码修复 benchmark,难度高于 SWE-Bench Verified</td>
</tr>
<tr>
<td>Terminal Bench 2</td>
<td>Terminal Bench 2</td>
<td>软件工程</td>
<td>评估模型通过命令行终端解决复杂工程问题的 benchmark</td>
</tr>
</tbody></table>
<h3 id="b-gjsysjhz">B. 关键实验数据汇总</h3>
<table>
<thead>
<tr>
<th>实验</th>
<th>指标</th>
<th>M2.7 结果</th>
<th>对比基准</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>SWE-Pro</td>
<td>Pass@1</td>
<td>56.22%</td>
<td>Opus 4.6 ~57.3%, GLM-5.1 58.4%</td>
<td>真实 GitHub issue 修复</td>
</tr>
<tr>
<td>VIBE-Pro</td>
<td>Pass@1</td>
<td>55.6%</td>
<td>-</td>
<td>端到端项目交付</td>
</tr>
<tr>
<td>Terminal Bench 2(Claude Code)</td>
<td>Pass@1</td>
<td>57.0%</td>
<td>Opus 4.6 ~65.4%(Terminus-2)</td>
<td>命令行工程任务</td>
</tr>
<tr>
<td>GDPval-AA</td>
<td>ELO</td>
<td>1495</td>
<td>开源模型最高</td>
<td>办公软件自动化</td>
</tr>
<tr>
<td>Skill adherence</td>
<td>依从率</td>
<td>97%</td>
<td>-</td>
<td>40+ skills, 每 skill &gt;2K tokens</td>
</tr>
<tr>
<td>内部 scaffold 优化</td>
<td>性能提升</td>
<td>+30%</td>
<td>基线 scaffold</td>
<td>100+ 轮自主迭代</td>
</tr>
<tr>
<td>MLE-Bench Lite</td>
<td>平均奖牌率</td>
<td>66.6%</td>
<td>Opus 4.6 75.7%, GPT-5.4 71.2%, Gemini-3.1 66.6%</td>
<td>22 场 ML 竞赛, 3 批次, 每批 24h</td>
</tr>
<tr>
<td>MLE-Bench Lite(最佳批次)</td>
<td>奖牌分布</td>
<td>9 金 / 5 银 / 1 铜</td>
<td>-</td>
<td>单 A30 GPU 运行</td>
</tr>
</tbody></table>
<h3 id="c-mxpxdw">C. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: MiniMax M2 / M2.5 系列. M2.7 沿用了 M2 系列的 MoE 架构和 agentic 训练基础设施,但在后训练阶段引入了「模型参与自身进化」的新范式. </li>
<li><strong>核心创新</strong>: <ol>
<li><strong>训练期 agentic 反馈闭环</strong>: 不同于传统「先训练模型,再适配 agent」的两阶段方法,M2.7 在训练阶段就让模型参与 harness 的构建和优化,使 tool-use 行为从底层结构上更稳定. </li>
<li><strong>三组件自主优化 harness</strong>: short-term memory + self-feedback + self-optimization 的轻量级设计,使模型能在无人类干预的情况下持续改进外部 scaffold. </li>
<li><strong>低资源场景验证</strong>: MLE-Bench Lite 在单 A30 GPU 上的成功表明,自主优化能力不依赖海量算力,而依赖算法设计.</li>
</ol>
</li>
<li><strong>被后续工作引用</strong>: 截至 2026-05-18,M2.7 的「自我进化」方法论已被社区广泛讨论,但尚未见公开的学术引用. OpenClaw harness 框架(第三方披露)在开发者社区中有一定关注度. </li>
<li><strong>技术谱系中的位置</strong>: M2.7 代表了开源模型中「agent-native training」路线的早期探索. 与 GLM-5.1 的「长程持续优化」和 Kimi K2.6 的「Agent Swarm 多智能体协作」相比,M2.7 的独特之处在于将优化对象从「模型权重」转向了「模型外部工具链」. 这一范式转变如果被验证为可持续,可能对未来 AI 系统的开发方式产生深远影响——即从「训练-部署-维护」的线性流程,转向「训练-进化-再进化」的循环流程. 但需要指出的是,M2.7 目前披露的实验规模和可复现性仍然有限,其「自我进化」叙事中的部分主张(如 30% 性能提升)缺乏独立验证,社区应以审慎乐观的态度对待.</li>
</ul>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"mxdw-scsdcyzsjhdmx","text":"模型定位: 首次深度参与自身进化的模型"},{"level":2,"id":"sxhxnl","text":"三项核心能力"},{"level":3,"id":"rjgc","text":"软件工程"},{"level":3,"id":"zybgrj","text":"专业办公软件"},{"level":3,"id":"jsyzxyqs","text":"角色一致性与情商"},{"level":2,"id":"gjmxzwjhd-agent","text":"构建模型自我进化的 Agent"},{"level":2,"id":"bcxx-jg-bsyst","text":"补充信息: 架构、部署与生态"},{"level":3,"id":"mxgg","text":"模型规格"},{"level":3,"id":"api-djykyx","text":"API 定价与可用性"},{"level":3,"id":"xkysyxz","text":"许可与使用限制"},{"level":3,"id":"yjpmxdhxdb","text":"与竞品模型的横向对比"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-gjsysjhz","text":"B. 关键实验数据汇总"},{"level":3,"id":"c-mxpxdw","text":"C. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.8-minimax/05-mini-max-m2.7/01-mini-max-m2.7-jsbgjy-2" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.8-minimax/05-mini-max-m2.7/01-mini-max-m2.7-jsbgjy-2" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniMax M2.7 技术博客精译</h1>
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
