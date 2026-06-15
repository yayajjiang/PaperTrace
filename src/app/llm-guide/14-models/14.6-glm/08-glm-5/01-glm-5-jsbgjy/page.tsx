"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>GLM-5: from Vibe Coding to Agentic Engineering 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.6-glm/14.6-glm">返回 14.6-GLM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: GLM-5: from Vibe Coding to Agentic Engineering
原文链接: <a href="https://arxiv.org/abs/2602.15763">https://arxiv.org/abs/2602.15763</a>
发布日期: 2026.02.17
发布机构: Zhipu AI &amp; Tsinghua University, GLM-5 Team
开源协议: MIT</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%BC%95%E8%A8%80">1 引言</a></li>
<li><a href="#2-%E9%A2%84%E8%AE%AD%E7%BB%83">2 预训练</a><ul>
<li><a href="#21-%E6%9E%B6%E6%9E%84">2.1 架构</a><ul>
<li><a href="#211-%E6%A8%A1%E5%9E%8B%E8%A7%84%E6%A8%A1%E6%89%A9%E5%B1%95">2.1.1 模型规模扩展</a></li>
<li><a href="#212-multi-latent-attention">2.1.2 Multi-latent Attention</a></li>
<li><a href="#213-multi-token-prediction-with-parameter-sharing">2.1.3 Multi-token Prediction with Parameter Sharing</a></li>
</ul>
</li>
<li><a href="#22-%E5%9F%BA%E4%BA%8E-dsa-%E7%9A%84%E6%8C%81%E7%BB%AD%E9%A2%84%E8%AE%AD%E7%BB%83">2.2 基于 DSA 的持续预训练</a></li>
<li><a href="#23-%E9%AB%98%E6%95%88%E6%B3%A8%E6%84%8F%E5%8A%9B%E5%8F%98%E4%BD%93%E7%9A%84%E6%B6%88%E8%9E%8D%E5%AE%9E%E9%AA%8C">2.3 高效注意力变体的消融实验</a></li>
<li><a href="#24-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%95%B0%E6%8D%AE">2.4 预训练数据</a></li>
<li><a href="#25-mid-training">2.5 Mid-Training</a></li>
<li><a href="#26-%E8%AE%AD%E7%BB%83%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD">2.6 训练基础设施</a></li>
</ul>
</li>
<li><a href="#3-%E5%90%8E%E8%AE%AD%E7%BB%83">3 后训练</a><ul>
<li><a href="#31-%E7%9B%91%E7%9D%A3%E5%BE%AE%E8%B0%83sft">3.1 监督微调(SFT)</a></li>
<li><a href="#32-reasoning-rl">3.2 Reasoning RL</a></li>
<li><a href="#33-agentic-rl">3.3 Agentic RL</a></li>
<li><a href="#34-general-rl">3.4 General RL</a></li>
<li><a href="#35-on-policy-cross-stage-distillation">3.5 On-Policy Cross-Stage Distillation</a></li>
<li><a href="#36-slime-%E6%A1%86%E6%9E%B6-rl-%E8%AE%AD%E7%BB%83%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD">3.6 slime 框架: RL 训练基础设施</a></li>
</ul>
</li>
<li><a href="#4-agentic-engineering">4 Agentic Engineering</a><ul>
<li><a href="#41-%E9%9D%A2%E5%90%91-agentic-%E4%BB%BB%E5%8A%A1%E7%9A%84%E5%BC%82%E6%AD%A5-rl">4.1 面向 Agentic 任务的异步 RL</a></li>
<li><a href="#42-agent-%E7%8E%AF%E5%A2%83%E6%89%A9%E5%B1%95">4.2 Agent 环境扩展</a></li>
<li><a href="#43-%E6%90%9C%E7%B4%A2-agent-%E7%9A%84%E6%8E%A8%E7%90%86%E4%B8%8E%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AE%A1%E7%90%86">4.3 搜索 Agent 的推理与上下文管理</a></li>
<li><a href="#44-%E5%B9%BB%E7%81%AF%E7%89%87%E7%94%9F%E6%88%90">4.4 幻灯片生成</a></li>
</ul>
</li>
<li><a href="#5-%E5%9B%BD%E4%BA%A7%E8%8A%AF%E7%89%87%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD%E9%80%82%E9%85%8D">5 国产芯片基础设施适配</a></li>
<li><a href="#6-%E8%AF%84%E4%BC%B0">6 评估</a><ul>
<li><a href="#61-arc-%E5%9F%BA%E5%87%86%E8%AF%84%E4%BC%B0">6.1 ARC 基准评估</a></li>
<li><a href="#62-%E7%9C%9F%E5%AE%9E%E4%B8%96%E7%95%8C-agentic-%E5%B7%A5%E7%A8%8B%E4%BD%93%E9%AA%8C%E8%AF%84%E4%BC%B0">6.2 真实世界 Agentic 工程体验评估</a></li>
<li><a href="#63-%E7%9C%9F%E5%AE%9E%E4%B8%96%E7%95%8C%E9%80%9A%E7%94%A8%E8%83%BD%E5%8A%9B%E8%AF%84%E4%BC%B0">6.3 真实世界通用能力评估</a></li>
</ul>
</li>
<li><a href="#7-%E7%BB%93%E8%AE%BA">7 结论</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a><ul>
<li><a href="#a-%E8%B6%85%E5%8F%82%E6%95%B0">A. 超参数</a></li>
<li><a href="#b-%E5%9F%BA%E5%BA%A7%E6%A8%A1%E5%9E%8B%E8%AF%84%E4%BC%B0">B. 基座模型评估</a></li>
</ul>
</li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们推出 GLM-5,这是一款下一代基础模型,旨在将「vibe coding」范式过渡到「agentic engineering」.在继承前代模型 agentic、reasoning 和 coding(ARC)能力的基础上,GLM-5 采用 DSA(DeepSeek Sparse Attention)显著降低训练和推理成本,同时保持长上下文保真度.为推进模型对齐与自主性,我们实现了一种新的异步强化学习基础设施,通过解耦生成与训练大幅提升后训练效率.此外,我们提出了新颖的异步 Agent RL 算法,进一步提升 RL 质量,使模型能够从复杂的长期交互中更有效地学习.通过这些创新,GLM-5 在主要开放基准上取得了 SOTA 性能.最关键的是,GLM-5 在真实世界编码任务中展示了前所未有的能力,在端到端软件工程挑战中超越了先前基线.代码和模型可在 <a href="https://github.com/zai-org/GLM-5">https://github.com/zai-org/GLM-5</a> 获取.</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>追求通用人工智能(AGI)不仅需要扩展模型参数,还需要从根本上重新思考智能的效率架构和自主改进机制.随着 GLM-4.5 的发布,我们证明了将 Agentic、Reasoning 和 Coding(ARC)能力统一到单一 MoE(Mixture-of-Experts,混合专家)架构中,可以在多样化基准上取得 SOTA 结果.然而,随着大语言模型(LLM)从被动知识库转变为主动问题解决者,计算成本和真实世界适应性(特别是在复杂软件工程中)的双重挑战已成为主要瓶颈.</p>
<p>我们推出 GLM-5,这是我们的下一代旗舰模型,旨在克服这些障碍.GLM-5 在性能和效率上实现了范式转变,在主要开放排行榜(包括 ArtificialAnalysis.ai、LMArena Text 和 LMArena Code)上达到了 SOTA 地位.更重要的是,GLM-5 重新定义了真实世界编码的标准,展示了处理复杂端到端软件开发任务的空前能力,远超传统静态基准(如 SWE-bench)的范畴.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么从「vibe coding」到「agentic engineering」?</p>
<p>「vibe coding」指人类通过提示让 AI 模型写代码;而「agentic engineering」指 AI agent 自主规划、实现和迭代代码.这一范式转变反映了 AI 能力边界的根本变化:从「辅助工具」到「自主执行者」.GLM-5 将这一理念作为核心定位,意味着其训练目标不再是最大化单轮回复质量,而是优化多步任务完成率和长期一致性.这要求模型具备规划、工具调用、错误纠正和上下文维护的综合能力,而非单纯的代码生成能力.</p>
</blockquote>
<p><strong>结果.</strong> 图 1 展示了 GLM-5、GLM-4.7、Claude Opus 4.5、Gemini 3 Pro 和 GPT-5.2(xhigh)在 8 个 agentic、reasoning 和 coding 基准上的结果:Humanity&#39;s Last Exam、SWE-bench Verified、SWE-bench Multilingual、Terminal-Bench 2.0、BrowseComp、MCP-Atlas、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>τ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\tau^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-Bench、Vending Bench 2.平均而言,GLM-5 相比上一代 GLM-4.7 提升约 20%,与 Claude Opus 4.5 和 GPT-5.2(xhigh)相当,优于 Gemini 3 Pro.</p>
<blockquote>
<p>图 1: GLM-5 与前沿模型在 8 个 ARC 基准上的对比结果.数据来源:原文 Figure 1.</p>
</blockquote>
<p>GLM-5 在 Artificial Analysis Intelligence Index v4.0 上得分 50,成为新的开放权重领导者(参见图 2),较 GLM-4.7 的 42 分提升了 8 分,这一提升由 agentic 性能和知识/幻觉的改进共同驱动.这是开放权重模型首次在该指数上达到 50 分.</p>
<blockquote>
<p>图 2: Artificial Analysis Intelligence Index v4.0 综合 10 项评估的结果.数据来源:原文 Figure 2.</p>
</blockquote>
<p>LMArena 由 UC Berkeley 发起,是一个透明的共享空间,通过人类判断以数百万真实任务评估和比较前沿 AI 能力,包括写作、编码、推理、设计、搜索和创作.大量的人类交互产生了真实世界实用性的信号,使其不同于其他静态基准.图 3 显示 GLM-5 在 Text Arena 和 Code Arena 中均为 #1 开放模型,总体上与 Claude-Opus-4.5 和 Gemini-3-pro 持平.</p>
<blockquote>
<p>图 3: LMArena 上 GLM-5 为 Text Arena 和 Code Arena 的 #1 开放模型.数据来源:原文 Figure 3.</p>
</blockquote>
<p>Agent 的长期一致性越来越重要.编码 agent 现在可以自主写代码数小时,AI 模型能够完成的任务的长度和广度可能会增加.我们使用 Vending-Bench 2 和 CC-Bench-V2 两个基准来评估 GLM-5 完成长期任务的能力.Vending-Bench 2 是一个衡量 AI 模型在长时间范围内经营业务表现的基准,模型被要求经营一个模拟自动售货机业务一年,并根据最终银行账户余额评分.图 4(左)显示 GLM-5 在所有开源模型中排名第一,最终账户余额为 \$4,432,接近 Claude Opus 4.5,展示了强大的长期规划和资源管理能力.图 4(右)进一步展示了 GLM-5 在内部评估套件 CC-Bench-V2 上的结果,GLM-5 在前端、后端和长期任务上均显著优于 GLM-4.7,缩小了与 Claude Opus 4.5 的差距.</p>
<blockquote>
<p>图 4: 长期任务评估结果.左:Vending-Bench 2;右:CC-Bench-V2.数据来源:原文 Figure 4.</p>
</blockquote>
<p><strong>方法.</strong> 图 5 展示了 GLM-5 的整体训练流水线.</p>
<blockquote>
<p>图 5: GLM-5 的整体训练流水线.数据来源:原文 Figure 5.</p>
</blockquote>
<p>我们的基座模型训练始于一个 massive 的 27 万亿 token 语料库,早期优先关注代码和推理.然后我们采用了一个 distinct 的 Mid-training 阶段,逐步将上下文长度从 4K 扩展到 200K,专门针对长上下文 agentic 数据,以确保复杂工作流的稳定性.</p>
<p>在后训练中,我们超越了标准 SFT.我们实现了一个顺序强化学习流水线——从 Reasoning RL 开始,然后是 Agentic RL,最后以 General RL 收尾.至关重要的是,我们在整个过程中利用 On-Policy Cross-Stage Distillation 来防止灾难性遗忘,确保模型在成为 robust 通才的同时保持其敏锐的推理优势.</p>
<p>总之,GLM-5 性能飞跃由以下技术贡献驱动:</p>
<p>第一,我们采用 DSA(DeepSeek Sparse Attention),这是一种新颖的架构创新,显著降低了训练和推理成本.虽然 GLM-4.5 通过标准 MoE 架构提升了效率,但 DSA 允许 GLM-5 基于 token 重要性动态分配注意力资源,在不牺牲长上下文理解或推理深度的情况下大幅降低计算开销.借助 DSA,我们将模型参数扩展到 744B,并将训练 token 预算扩展到约 28.5T.</p>
<blockquote>
<p><strong>[架构细节]</strong> DSA 的本质是什么?</p>
<p>DSA(DeepSeek Sparse Attention)的核心洞察是:在长序列中,约 90% 的注意力条目是冗余的.DSA 通过一个「lightning indexer」和「token selector」的两阶段过程,将注意力计算从二次复杂度降低到线性复杂度.indexer 为每个查询 token 检索最相关的 top-k 个 key-value 条目,然后 attention 仅在检索到的子集上稀疏计算.这与固定模式(如滑动窗口)不同,DSA 是内容感知的——它「看」内容来决定哪些 token 重要.更重要的是,DSA 通过持续预训练从稠密基座模型迁移而来,避免了从头训练的天文成本.</p>
</blockquote>
<p>第二,我们设计了一种新的异步强化学习基础设施.基于 GLM-4.5 初始化的「slime」框架和解耦 rollout 引擎,我们的新基础设施进一步解耦生成与训练以最大化 GPU 利用率.该系统允许大规模探索 agent 轨迹,而不会因为同步瓶颈阻碍迭代速度,显著提升了 RL 后训练流水线的效率.</p>
<p>第三,我们提出了新颖的异步 Agent RL 算法,旨在增强自主决策质量.在 GLM-4.5 中,我们利用迭代自蒸馏和结果监督来训练 agent.对于 GLM-5,我们开发了允许模型持续从多样化长期交互中学习的异步算法.这些算法专门优化以提升模型在动态环境中的规划和自我纠正能力,直接促成了我们在真实世界编码场景中的主导地位.</p>
<p>最后,GLM-5 从第一天起就全栈适配国产 GPU 生态.我们已成功完成从底层内核到上层推理框架的深度优化,跨越七个主流国产芯片平台,包括华为昇腾、摩尔线程、海光、寒武纪、昆仑芯、天数智芯和燧原.</p>
<hr>
<h2 id="2-yxl">2 预训练</h2>
<p>与 GLM-4.5 类似,GLM-5 的基座模型经历两个阶段:预训练以获得通用语言和编码能力,mid-training 以获得 agentic 和长上下文能力.我们扩展了 GLM-5 所有训练阶段的训练 token 预算,基座模型总计 28.5 万亿 token.</p>
<h3 id="2-1-jg">2.1 架构</h3>
<h4 id="2-1-1-mxgmkz">2.1.1 模型规模扩展</h4>
<p>GLM-5 扩展到 256 个专家,并将层数减少到 80 以最小化专家并行通信开销.这导致一个 744B 参数的模型(40B 激活参数),是 GLM-4.5(355B 总参数,32B 激活参数)总大小的两倍.</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="left">GLM-4.5</th>
<th align="left">GLM-5</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">355B</td>
<td align="left">744B</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">32B</td>
<td align="left">40B</td>
</tr>
<tr>
<td align="left">稠密层数</td>
<td align="left">3</td>
<td align="left">3</td>
</tr>
<tr>
<td align="left">MoE 层数</td>
<td align="left">89</td>
<td align="left">75</td>
</tr>
<tr>
<td align="left">MTP 层数</td>
<td align="left">1</td>
<td align="left">1</td>
</tr>
<tr>
<td align="left">隐藏维度</td>
<td align="left">5120</td>
<td align="left">6144</td>
</tr>
<tr>
<td align="left">稠密中间维度</td>
<td align="left">12288</td>
<td align="left">12288</td>
</tr>
<tr>
<td align="left">MoE 中间维度</td>
<td align="left">1536</td>
<td align="left">2048</td>
</tr>
<tr>
<td align="left">QK 头维度</td>
<td align="left">128</td>
<td align="left">192</td>
</tr>
<tr>
<td align="left">V 头维度</td>
<td align="left">128</td>
<td align="left">256</td>
</tr>
<tr>
<td align="left">Q LoRA 维度</td>
<td align="left">--</td>
<td align="left">2048</td>
</tr>
<tr>
<td align="left">KV LoRA 维度</td>
<td align="left">--</td>
<td align="left">512</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="left">96</td>
<td align="left">64</td>
</tr>
<tr>
<td align="left">Key-Value 头数</td>
<td align="left">8</td>
<td align="left">--</td>
</tr>
<tr>
<td align="left">Indexer 注意力头数</td>
<td align="left">--</td>
<td align="left">32</td>
</tr>
<tr>
<td align="left">Indexer 头维度</td>
<td align="left">--</td>
<td align="left">128</td>
</tr>
<tr>
<td align="left">专家总数</td>
<td align="left">160</td>
<td align="left">256</td>
</tr>
<tr>
<td align="left">路由专家数</td>
<td align="left">8</td>
<td align="left">8</td>
</tr>
<tr>
<td align="left">共享专家数</td>
<td align="left">1</td>
<td align="left">1</td>
</tr>
<tr>
<td align="left">词表大小</td>
<td align="left">151552</td>
<td align="left">154880</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[架构思考]</strong> 为什么增加专家数同时减少层数?</p>
<p>GLM-5 将专家数从 160 增加到 256,但层数从 92 减少到 80.这一权衡的核心是通信开销与计算效率的平衡.MoE 的 All-to-All 通信成本随专家数量增加而上升,但减少层数可以缩短每次前向传播的路径长度,从而降低整体延迟.此外,80 层配合 256 专家的配置使每层路由到约 3.2 个专家(256/80),保持了合理的专家利用率.从参数分配看,GLM-5 的隐藏维度从 5120 增加到 6144,QK 头维度从 128 增加到 192,这些变化提升了单层的表示能力,补偿了层数减少可能带来的深度损失.</p>
</blockquote>
<h4 id="2-1-2-multi-latent-attention">2.1.2 Multi-latent Attention</h4>
<p>通过使用压缩的 key-value 向量,Multi-latent Attention(MLA,多头潜在注意力)达到了与 GQA(Grouped-Query Attention,分组查询注意力)相当的效果,但为长上下文序列提供了更优的 GPU 内存节省和更快的处理速度.</p>
<p>然而,在使用 Muon optimizer 的实验中,我们发现维度为 576 的 MLA 潜在 KV-cache 无法匹配 8 个查询组的 GQA(记为 GQA-8,2048 维 KV-cache)的性能.为克服这一性能差距,我们对 GLM-4.5 的 Muon optimizer 配方进行了适配.</p>
<p>在原始配方中,我们对多头 query、key 和 value 的上投影矩阵 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>W</mi><mrow><mi>U</mi><mi>Q</mi></mrow></msup><mo separator="true">,</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>K</mi></mrow></msup><mo separator="true">,</mo><msup><mi>W</mi><mrow><mi>U</mi><mi>V</mi></mrow></msup></mrow><annotation encoding="application/x-tex">W^{UQ}, W^{UK}, W^{UV}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight">Q</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">U</span><span class="mord mathnormal mtight" style="margin-right:0.2222em;">V</span></span></span></span></span></span></span></span></span></span></span></span> 应用矩阵正交化.取而代之的是,我们将这些矩阵拆分为更小的矩阵(对应不同头),并对这些独立矩阵分别应用矩阵正交化.这种方法记为 Muon Split,它使得不同注意力头的投影权重可以以不同尺度更新.如表 2 所示,该方法有效提升了 MLA 的性能以匹配 GQA-8.在实践中,我们还发现使用 Muon Split 后,GLM-5 的注意力 logits 尺度在预训练期间保持稳定,无需任何裁剪策略.</p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">Hellaswag</th>
<th align="center">MMLU</th>
<th align="center">C-Eval</th>
<th align="center">RACE</th>
<th align="center">BBH</th>
<th align="center">GSM8K</th>
<th align="center">HumanEval</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GQA-8</td>
<td align="center">77.3</td>
<td align="center">61.2</td>
<td align="center">60.0</td>
<td align="center">79.6</td>
<td align="center"><strong>53.3</strong></td>
<td align="center"><strong>47.6</strong></td>
<td align="center"><strong>38.5</strong></td>
</tr>
<tr>
<td align="left">MLA</td>
<td align="center">77.3</td>
<td align="center">61.5</td>
<td align="center">59.7</td>
<td align="center">77.8</td>
<td align="center">48.9</td>
<td align="center">46.2</td>
<td align="center">33.5</td>
</tr>
<tr>
<td align="left">MLA + Muon Split</td>
<td align="center"><strong>77.8</strong></td>
<td align="center"><strong>62.5</strong></td>
<td align="center"><strong>62.1</strong></td>
<td align="center"><strong>79.9</strong></td>
<td align="center">51.8</td>
<td align="center">45.0</td>
<td align="center">36.7</td>
</tr>
<tr>
<td align="left">MLA-256 + Muon Split</td>
<td align="center">77.4</td>
<td align="center">62.0</td>
<td align="center">59.9</td>
<td align="center">79.6</td>
<td align="center">51.3</td>
<td align="center">47.5</td>
<td align="center">36.6</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[技术细节]</strong> Muon Split 的工程洞察</p>
<p>Muon optimizer 通过对权重矩阵进行正交化来加速收敛,但标准 Muon 将所有注意力头共享同一组投影矩阵.这意味着所有头被迫以相同尺度更新,忽略了个别头的学习需求差异.Muon Split 的核心洞察是:不同注意力头可能负责不同的语义模式(如局部语法 vs 远距离指代),因此需要不同的更新步长.通过为每个头维护独立的投影矩阵并分别正交化,Muon Split 允许更细粒度的优化.从结果看,MLA + Muon Split 在 7 个基准中的 4 个上超越了 GQA-8,验证了该方法的有效性.这同时说明 MLA 的原始性能差距并非架构固有缺陷,而是优化策略的适配问题.</p>
</blockquote>
<p>MLA 的另一个缺点是其解码阶段的高计算成本.在解码中,MLA 执行 576 维的点积,高于 GQA 的 128 维计算.虽然 DeepSeek-V3 的注意力头数是根据 H800 的 roofline 选择的,但这不适用于其他硬件.鉴于 MLA 在训练和预填充阶段的 MHA(Multi-Head Attention)风格,我们将头维度从 192 增加到 256,并将注意力头数减少 1/3.这保持了训练计算量和参数数量不变,同时降低了解码计算量.表 2 中记为 MLA-256 的变体在 Muon Split 下匹配了 MLA 的性能.</p>
<h4 id="2-1-3-multi-token-prediction-with-parameter-sharing">2.1.3 Multi-token Prediction with Parameter Sharing</h4>
<p>Multi-token Prediction(MTP,多 token 预测)提升了基座模型性能,并作为 speculative decoding 的 draft 模型.然而,在训练期间,为了预测接下来的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 个 token,需要 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 个 MTP 层.因此,MTP 参数和 KV cache 的内存使用量随推测步数线性增长.</p>
<p>DeepSeek-V3 使用单个 MTP 层训练,在推理时预测接下来的 2 个 token.训练-推理差异降低了第二个 token 的接受率.因此,我们提出在训练期间共享 3 个 MTP 层的参数.这保持了 draft 模型的内存成本与 DeepSeek-V3 一致,同时提高了接受率.表 3 显示,在相同的推测步数(4)下,GLM-5 的接受长度优于 DeepSeek-V3.2.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">接受长度</th>
</tr>
</thead>
<tbody><tr>
<td align="left">DeepSeek-V3.2</td>
<td align="center">2.55</td>
</tr>
<tr>
<td align="left">GLM-5</td>
<td align="center"><strong>2.76</strong></td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[工程分析]</strong> MTP 参数共享的收益</p>
<p>MTP 的基本思想是:除了预测下一个 token,模型还同时预测第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>t</mi><mo>+</mo><mn>2</mn><mo separator="true">,</mo><mi>t</mi><mo>+</mo><mn>3</mn><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">t+2, t+3, ...</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6984em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">3</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span></span></span></span> 个 token.这些额外预测在推理时可用于 speculative decoding——用一个小的 draft 模型快速生成候选 token,然后由主模型验证.接受长度(accept length)衡量每个推测步骤平均接受多少个 token.更高的接受长度意味着更少的验证步骤,从而更低的延迟.GLM-5 通过共享 3 个 MTP 层的参数,在保持内存成本不变的前提下,将接受长度从 2.55 提升到 2.76(相对提升 8.2%).这意味着在相同推理预算下,GLM-5 的 speculative decoding 可以产生更多有效 token,直接转化为用户感知的更低延迟.</p>
</blockquote>
<h3 id="2-2-jy-dsa-dcxyxl">2.2 基于 DSA 的持续预训练</h3>
<p>我们在训练中使用 DSA.DSA 的核心思想是用动态的细粒度选择机制取代传统的稠密 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>L</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(L^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">L</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 注意力——在 128K 上下文下这种注意力变得 prohibitively 昂贵.与固定模式(如滑动窗口)不同,DSA 「看」内容来决定哪些 token 重要.</p>
<p>DSA 特别有趣的一点在于它如何通过持续预训练从稠密基座模型引入.这避免了从头训练的「天文」成本.迁移遵循两阶段「稠密预热和稀疏训练适配」策略.DeepSeek-V3.2-Exp 保持与其稠密前代相同的基准性能,证明了长上下文中约 90% 的注意力条目确实是冗余的.DSA 将长序列的注意力计算减少约 1.5-2 倍,这对于我们正在构建的推理密集型 agent 非常重要,能够以一半的 GPU 成本处理 128K 上下文.</p>
<p>DSA 训练从中训练结束时的基座模型开始.预热阶段经过 1000 步,每步在 14 个长度为 202,752 token 的序列上训练,最大学习率为 5e-3.稀疏适配阶段遵循 mid-training 的训练数据和超参数,经过 20B token.虽然训练预算远小于 DeepSeek-V3.2(943.7B token),但我们发现这足以适配 DSA 模型以匹配原始 MLA 模型的性能.如表 4 所示,DSA 模型的长上下文性能接近 MLA 模型.为进一步验证 DSA 训练的有效性,我们分别用相同的 SFT 数据微调 DSA 和 MLA 模型,发现两个模型在训练损失和评估基准上持平.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">MQ-NIAH-128k</th>
<th align="center">MV-NIAH-128k</th>
<th align="center">SQuAD-128k</th>
<th align="center">HotpotQA-128k</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MLA</td>
<td align="center"><strong>100.0</strong></td>
<td align="center">95.5</td>
<td align="center">79.7</td>
<td align="center"><strong>66.3</strong></td>
</tr>
<tr>
<td align="left">DSA</td>
<td align="center"><strong>100.0</strong></td>
<td align="center"><strong>97.0</strong></td>
<td align="center"><strong>86.0</strong></td>
<td align="center">63.0</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[设计比较]</strong> DSA vs 其他高效注意力机制</p>
<p>GLM-5 在 GLM-9B 上进行了系统的高效注意力消融实验,比较了滑动窗口注意力(SWA)、Gated DeltaNet(GDN)、SimpleGDN 和 DSA.结果显示:</p>
<ul>
<li>朴素交错的 SWA 在长上下文任务上造成灾难性退化(RULER@128K 下降 30.35 分)</li>
<li>基于搜索的 SWA 层选择显著缩小了差距(RULER@128K 仅下降 5.69 分)</li>
<li>GDN 和 SimpleGDN 作为线性注意力变体,在部分任务上表现良好,但在细粒度检索任务上存在固有精度损失</li>
<li>DSA 是无损的:其 lightning indexer 实现了 token 级稀疏性而不丢弃任何长距离依赖</li>
</ul>
<p>这一对比验证了 DSA 的核心优势:它不是用固定模式近似注意力,而是用内容感知的动态选择来实现真正的稀疏计算.这使得 DSA 可以应用于所有层而无需担心质量退化,而 SWA 和 GDN 即使在一半层保留全注意力的情况下仍有精度损失.</p>
</blockquote>
<h3 id="2-3-gxzylbtdxrsy">2.3 高效注意力变体的消融实验</h3>
<p>除 DSA 外,我们在 GLM-9B 上探索了几种替代高效注意力机制.GLM-9B 基线在所有 40 层使用分组查询注意力,并用 128K token 上下文窗口微调.我们评估了以下方法:</p>
<ul>
<li><strong>Sliding Window Attention(SWA)Interleave</strong>: 在网络中统一应用全注意力和窗口注意力层的固定交替模式.</li>
<li><strong>Gated DeltaNet(GDN)</strong>: 一种线性注意力变体,用门控线性递替代替二次 softmax 注意力计算,将注意力的计算成本从序列长度的二次降低到线性.</li>
</ul>
<p>在此基础上,我们提出了两种改进:</p>
<ul>
<li><p><strong>SWA Pattern(Search-Based)</strong>: 受 PostNAS 启发,我们引入了一种基于搜索的适配方法,识别 SWA 转换的最优层子集,同时在剩余层中保留全注意力.我们使用束搜索策略确定在长上下文下游任务上最大化性能的配置.为减轻计算成本,我们仅在 16K 上下文长度下进行搜索,并将所得模式推广到所有其他输入长度.具体而言,我们使用束大小 8,每步优化两层;对于 GLM-9B(40 层),过程在大约 10 步内收敛.每步中,候选模式在 RULER 基准的 16K 上下文上评估,保留前 8 名候选用于后续步骤.最终导出的模式为 <code>SFSSFFSSSFFFFSSFSFFFFFFSFSFSSFSSFSFSSFSSS</code>,其中 <code>S</code> 和 <code>F</code> 分别表示 SWA 和全注意力层.</p>
</li>
<li><p><strong>SimpleGDN</strong>: 一种最小化的线性化策略,旨在最大程度上重用预训练权重,改进 GDN 以适配持续训练.我们完全移除 <code>Conv1d</code> 和显式门控模块,直接将预训练的 Query、Key 和 Value 投影权重映射到线性递推公式中.这种简化消除了额外参数的需求,同时保留了线性注意力的效率优势.</p>
</li>
</ul>
<p>我们在四个长上下文基准上评估了所有方法:RULER、MRCR、HELMET-ICL 和 RepoQA.结果汇总于附录表 12.每种方法在 64K 上下文长度上持续训练 190B token,保持高效注意力层与全注意力层的 1:1 比例.</p>
<p>结果揭示了高效注意力方法之间的清晰权衡层次.朴素交错的滑动窗口注意力(SWA)导致长上下文任务的灾难性退化(如 RULER@128K 下降 30.35 分),而基于搜索的层选择通过在最关键的位置保留全注意力大幅缩小了这一差距.线性注意力变体如 GDN 进一步提升了质量,但代价是额外参数;SimpleGDN 通过最大重用预训练权重达到了最佳平衡.然而,所有这些方法在细粒度检索任务上都存在固有的精度差距——即使在持续训练适配中一半层保留全注意力,RULER@128K 上最高下降 5.69 分,RepoQA@128K 上最高下降 7.33 分——这是高效注意力机制引入的不可避免的信息损失.相比之下,DSA 在构造上是无损的:其 lightning indexer 实现了 token 级稀疏性而不丢弃任何长距离依赖,使其可以应用于所有层而无需质量退化.</p>
<p>为验证这一点,我们在带有 MLA 的 GLM-4.7-Flash 上进行了小规模 DSA 实验.遵循标准 DSA 配方,训练分为两个阶段:(i)仅训练 indexer 的 warmup 阶段(1000 步,batch size 16),同时冻结所有基座模型权重;(ii)模型和 indexer 联合训练的 joint-training 阶段(150B token).表 6 总结了 RULER 上从 4K 到 128K 上下文长度的结果.即使是仅 warmup 的变体,也已经保留了绝大多数基线性能;下降是适度的且集中在最长上下文窗口(128K: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>79.21</mn><mo>→</mo><mn>71.35</mn></mrow><annotation encoding="application/x-tex">79.21 \\to 71.35</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">79.21</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">71.35</span></span></span></span>),而较短上下文几乎不受影响.经过完整的 150B token 联合训练阶段后,GLM-4.7-Flash + DSA 几乎完全弥合了这一残余差距:在 16K(+0.86)、32K(+0.49)和 64K(+1.72)上超越基线,仅在 128K 上有 0.35 分的微小差距.</p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">4K</th>
<th align="center">8K</th>
<th align="center">16K</th>
<th align="center">32K</th>
<th align="center">64K</th>
<th align="center">128K</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GLM-4.7-Flash</td>
<td align="center">97.44</td>
<td align="center">96.72</td>
<td align="center">95.83</td>
<td align="center">92.96</td>
<td align="center">85.34</td>
<td align="center">79.21</td>
</tr>
<tr>
<td align="left">GLM-4.7-Flash + DSA warmup</td>
<td align="center">97.51</td>
<td align="center">96.54</td>
<td align="center">95.40</td>
<td align="center">90.09</td>
<td align="center">84.05</td>
<td align="center">71.35</td>
</tr>
<tr>
<td align="left">GLM-4.7-Flash + DSA</td>
<td align="center">96.77</td>
<td align="center">96.25</td>
<td align="center">96.69</td>
<td align="center">93.45</td>
<td align="center">87.06</td>
<td align="center">78.86</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[实验解读]</strong> DSA warmup 的惊人效率</p>
<p>DSA 实验中最引人注目的发现是:仅训练 indexer 1000 步(约 3.2M token)就能保留 90%+ 的长上下文性能.这意味着 DSA 的 indexer 非常容易学习——它不需要大规模重新训练整个模型.这一发现具有重要的工程意义:对于已经部署的稠密模型,可以通过极低的成本(几天训练)为其增加 DSA 能力,而无需从头训练.联合训练 150B token 后,性能几乎完全恢复,证实了 DSA 的稀疏注意力不会损失表示能力,只是需要少量适配来重新校准注意力分布.</p>
</blockquote>
<h3 id="2-4-yxlsj">2.4 预训练数据</h3>
<p><strong>Web.</strong> 在 GLM-4.5 数据管道基础上,我们优化了大规模 web 数据集的选择标准.我们引入了另一个基于句子嵌入的 DCLM 分类器,以识别和聚合标准分类器之外的高质量数据.为解决长尾知识挑战,我们利用 World Knowledge 分类器——通过 Wikipedia 条目和 LLM 标注数据优化——从原本中低质量数据中蒸馏有价值的信息.</p>
<p><strong>Code.</strong> 我们使用主要代码托管平台的更新快照和更大规模的含代码网页集合扩展了代码预训练语料库,模糊去重后的唯一 token 增加了 28%.为提高语料库完整性并减少噪声,我们修复了 Software Heritage 代码文件中的元数据对齐问题,并采用更精确的语言分类管道.我们遵循 GLM-4.5 的质量感知采样策略处理源代码和代码相关 web 文档.此外,我们为更广泛的低资源编程语言(如 Scala、Swift、Lua 等)训练了专用分类器,提升了这些语言的采样质量.</p>
<p><strong>Math &amp; Science.</strong> 我们从网页、书籍和论文中收集高质量数学和科学数据,进一步提升推理能力.具体而言,我们优化了网页的内容提取管道和书籍/论文的 PDF 解析机制以提高数据质量.我们采用大语言模型为候选文档评分,仅保留最具教育价值的内容.对于长上下文文档,我们开发了分块-聚合评分算法以提高评分准确性.过滤管道严格执行,避免使用合成、AI 生成或基于模板的数据.</p>
<h3 id="2-5-mid-training">2.5 Mid-Training</h3>
<p>在 GLM-4.5 引入的 mid-training 框架基础上,我们扩大了 GLM-5 的训练量和最大上下文长度,以进一步增强模型的推理、长上下文和 agentic 能力.</p>
<p><strong>扩展上下文和训练规模.</strong> 我们在三个阶段逐步扩展上下文窗口:32K(1T token)、128K(500B token)和 200K(50B token).相比 GLM-4.5 的 128K 最大值,额外的 200K 阶段显著提升了模型处理超长文档和复杂多文件代码库的能力.长文档和合成 agent 轨迹在后续阶段相应地进行上采样.</p>
<p><strong>软件工程数据.</strong> 我们保留了将仓库级代码文件、commit diff、GitHub issue、pull request 和相关源文件拼接为统一训练序列的范式.在 GLM-5 中,我们放宽了仓库级过滤标准以扩大合格仓库池,产生约 1000 万个 issue-PR 对,同时加强了个体 issue 级别的质量过滤以减少噪声.我们还为每个 issue-PR 对检索更大范围的相关文件,从而产生更丰富的开发上下文和更广泛的现实世界软件工程场景覆盖.过滤后,数据集的 issue-PR 部分包含约 160B 唯一 token.</p>
<p><strong>长上下文数据.</strong> 我们的长上下文训练集包含自然数据和合成数据.自然数据从书籍、学术论文和通用预训练语料库中精选,采用多阶段过滤(PPL、去重、长度)和知识密集型领域的上采样.在合成数据构建中,受 NextLong 和 EntropyLong 启发,我们采用多样化技术构建长距离依赖.高度相似的文本通过交错打包聚合为序列,旨在缓解 lost-in-the-middle 现象并提升一系列长上下文任务的性能.在 200K 阶段,我们额外加入了少量 MRCR-like 数据,设计了多种变体以扩展 OpenAI 的原始范式,加强扩展多轮对话中的召回能力.经验上,我们发现增加数据多样性逐步增强了模型的长上下文性能;值得注意的是,在初始 128K 阶段之后的后续 200K mid-training 阶段,进一步提升了模型在 128K 上下文窗口内的性能.</p>
<h3 id="2-6-xljcss">2.6 训练基础设施</h3>
<h4 id="2-6-1-ncxs">2.6.1 内存效率</h4>
<p><strong>灵活的 MTP 放置.</strong> 在交错流水线并行下,模型组件被灵活分配到不同阶段.MTP 模块跨越嵌入、transformer 和输出组件.它的内存使用量远高于其他模块,导致阶段级不平衡.我们将 MTP 输出层与主输出层共置于最后阶段以实现参数共享,同时将其嵌入和 transformer 组件放置在前一阶段.这降低了最后阶段的内存压力并改善了流水线 rank 间的平衡.</p>
<p><strong>Pipeline ZeRO2 梯度分片.</strong> 每个流水线 rank 维护多个阶段,朴素地每个阶段需要完整的梯度缓冲区用于累积和优化器更新.受 ZeRO2 启发,我们在数据并行 rank 间分片梯度,使得每个阶段仅存储完整梯度的 1/dp 部分.此外,我们一次仅保留两个阶段的完整累积缓冲区,并通过双缓冲重用它们.当一个阶段缓冲区在连续微批次上累积梯度时,前一阶段缓冲区的梯度同步并行执行.这将持久梯度内存减少到每阶段分片缓冲区加两个用于滚动累积的完整缓冲区,在实践中没有额外的同步开销.</p>
<p><strong>Muon 分布式优化器的零冗余通信.</strong> 朴素 Muon 实现在每个数据并行 rank 上 all-gather 完整模型参数,导致瞬时内存峰值和冗余通信.我们将 all-gather 限制为每个 rank 拥有的参数分片,并将本地计算与分片通信重叠.这消除了冗余通信并显著降低了优化器相关的峰值内存开销.</p>
<p><strong>流水线激活卸载.</strong> 在流水线预热期间,前向执行领先于反向传播,延长了中间激活的生命周期.我们在前向执行后将激活卸载到主机内存,在反向执行前重新加载.卸载以层粒度应用以进一步降低峰值内存.结合细粒度重计算,这基本消除了将激活驻留在 GPU 内存中的需求.卸载和重新加载被调度以与计算重叠,同时避免与点对点通信和 MoE token 路由(分发和组合)争用.这大幅降低了激活内存占用,开销接近零.</p>
<p><strong>序列分块输出投影以降低峰值内存.</strong> 输出投影和交叉熵损失因存储反向传播的激活并将其提升为更高精度以进行损失计算而产生瞬时内存开销.为降低这一开销,我们将输入序列划分为更小的块,在每个块上独立计算投影和损失,完成前向和反向传播并释放激活后再继续.因此,峰值内存使用量随块数增加而降低.通过适当的块数,这种方法在保持与未分块执行相当性能的同时,缓解了输出层内存压力.</p>
<h4 id="2-6-2-bhxs">2.6.2 并行效率</h4>
<p><strong>高效的延迟权重梯度计算.</strong> 为减少流水线气泡,我们将关键路径上的部分权重梯度计算延迟.细粒度延迟配合优化的存储和通信重叠,在保持内存开销有界的同时提升吞吐量.</p>
<p><strong>高效的长序列训练.</strong> 更长的序列加剧了数据并行和流水线并行组间的负载不平衡.我们通过工作负载感知的序列重排序、注意力计算的动态重分配,以及将数据并行 rank 灵活划分为不同大小的上下文并行组来解决.层次化 all-to-all 重叠节点内和节点间通信以降低 QKV 张量的延迟.</p>
<h4 id="2-6-3-int4-lhgzxl">2.6.3 INT4 量化感知训练</h4>
<p>为在低精度下提供更好的精度,我们在 SFT 阶段应用 INT4 QAT(Quantization-Aware Training,量化感知训练).此外,为进一步减轻训练时间开销,我们开发了适用于训练和离线权重量化的量化内核,确保训练与推理之间的逐位一致行为.</p>
<blockquote>
<p><strong>[工程视角]</strong> GLM-5 训练基础设施的系统性优化</p>
<p>GLM-5 的训练基础设施优化覆盖了内存、通信和计算三个维度,形成了一套完整的工程解决方案:</p>
<ol>
<li><strong>内存维度</strong>:MTP 灵活放置、ZeRO2 梯度分片、激活卸载、序列分块输出投影——将峰值内存从「模型参数+激活+优化器状态」的叠加降低到可管理的水平</li>
<li><strong>通信维度</strong>:Muon 零冗余 all-gather、延迟梯度计算、层次化 all-to-all——将通信开销隐藏在计算之后</li>
<li><strong>计算维度</strong>:动态负载重平衡、上下文并行——确保长序列训练时的 GPU 利用率</li>
</ol>
<p>特别值得注意的是 INT4 QAT 的「逐位一致」保证.这意味着训练时模拟的 INT4 量化与推理时的实际 INT4 量化产生完全相同的比特模式,消除了训练-推理精度差异.对于需要在国产芯片(如华为昇腾)上部署的模型,这种一致性至关重要,因为这些平台的量化方案可能与 NVIDIA 不同.</p>
</blockquote>
<hr>
<h2 id="3-hxl">3 后训练</h2>
<p>GLM-5 的后训练阶段旨在将基座模型转变为具备 robust 推理、编码和 agentic 能力的高性能助手.如图 5 所示,我们的流水线遵循渐进对齐策略:从引入复杂交错思考模式的多任务 SFT(Supervised Fine-Tuning,监督微调)开始,然后是针对推理和 agentic 任务的专门 RL(Reinforcement Learning,强化学习)阶段,最后以 General RL 阶段完成人类风格对齐.通过利用 on-policy cross-stage distillation 作为最终精修,GLM-5 有效缓解了能力退化,同时 harness 了每个训练阶段的性能增益.</p>
<h3 id="3-1-jdwt-sft">3.1 监督微调(SFT)</h3>
<p>与 GLM-4.5 相比,GLM-5 在 SFT 阶段显著扩展了 Agent 和 Coding 数据的规模.GLM-5 的 SFT 语料覆盖三大类别:</p>
<ul>
<li><strong>General Chat</strong>: 问答、写作、角色扮演、翻译、多轮对话和长上下文交互</li>
<li><strong>Reasoning</strong>: 数学、编程和科学推理</li>
<li><strong>Coding &amp; Agent</strong>: 前端和后端工程代码、工具调用、编码 agent、搜索 agent 和通用 agent</li>
</ul>
<p>此外,GLM-5 在 SFT 期间将最大上下文长度扩展到 202,752 token.配合更新的 chat template,模型支持三种不同的思考特性(参见图 6):</p>
<blockquote>
<p>图 6: 交错思考(Interleaved Thinking)和保留思考(Preserved Thinking)示意图.数据来源:原文 Figure 6.</p>
</blockquote>
<ul>
<li><strong>Interleaved Thinking</strong>: 模型在每次回复和工具调用前进行思考,改善指令遵循和生成质量.</li>
<li><strong>Preserved Thinking</strong>: 在编码 agent 场景中,模型自动保留多轮对话中的所有思考块,复用现有推理而非从头重新推导.这减少了信息损失和不一致,非常适合长期复杂任务.</li>
<li><strong>Turn-level Thinking</strong>: 模型支持在会话中按轮次控制推理——对轻量级请求禁用思考以降低延迟/成本,对复杂任务启用思考以提高准确性和稳定性.</li>
</ul>
<p>通过在动作之间思考并在轮次间保持一致性,GLM-5 在复杂任务上实现了更稳定且可控的行为.</p>
<p>对于 <strong>General Chat</strong>,我们优化回复风格使其比 GLM-4.5 更逻辑化和简洁.对于角色扮演任务,我们收集和构建了覆盖多种语言和角色配置的更广泛多样化数据集.特别地,我们定义了几个评估维度——包括指令遵循、语言表达力、创造力、逻辑连贯性和长对话一致性——并应用自动和人工过滤来精选和优化数据.</p>
<p>对于 <strong>Reasoning</strong> 任务,我们进一步增强模型推理的深度.具体而言,对于逻辑推理,我们构建可验证问题并使用拒绝采样合成高质量数据.对于数学和科学问题,应用基于难度的过滤流程,仅保留对 GLM-4.7 模型来说罕见地正确或始终无法解决的难题.</p>
<p>对于 <strong>Coding</strong> 和 <strong>Agent</strong> 任务,与 GLM-4.5 相比,GLM-5 构建了大量执行环境以获取高质量轨迹,特别强调真实世界场景和长期任务.我们进一步使用专家强化学习和拒绝采样改进 SFT 数据.轨迹中的错误段被保留但在损失函数中 mask 掉,允许模型学习错误纠正行为而不强化错误动作.</p>
<blockquote>
<p><strong>[训练策略]</strong> 为什么保留错误但 mask 损失?</p>
<p>这是一个精心设计的训练策略.传统的 SFT 通常只使用「正确」的轨迹,但这导致模型从未见过「如何从错误中恢复」.GLM-5 的做法是:保留完整的轨迹(包括错误段),但在计算损失时 mask 掉错误段的 token.这意味着模型仍然「看到」了错误(通过注意力机制),但不会为预测错误而获得负向梯度.这种方式使模型学会了「识别错误并纠正」的能力,而非简单地「避免错误」.这在 agentic 场景中特别重要,因为 agent 不可避免地会犯错,关键是能否自我纠正.</p>
</blockquote>
<h3 id="3-2-reasoning-rl">3.2 Reasoning RL</h3>
<p><strong>RL 算法骨干.</strong> 我们的 RL 算法建立在 GRPO(Group Relative Policy Optimization,组相对策略优化)基础之上,并引入 IcePop 技术来缓解训练-推理不匹配问题——即 RL 优化期间推理分布与训练分布之间的差异.我们明确区分用于梯度更新的训练策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>π</mi><mtext>train</mtext></msup></mrow><annotation encoding="application/x-tex">\\pi^{\\text{train}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8305em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8305em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span></span></span></span></span></span></span></span> 和用于轨迹采样的推理策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>π</mi><mtext>infer</mtext></msup></mrow><annotation encoding="application/x-tex">\\pi^{\\text{infer}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">infer</span></span></span></span></span></span></span></span></span></span></span></span></span>.与原始 IcePop 公式相比,我们移除了 KL 正则化项以加速 RL 改进.</p>
<p>最终优化损失为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="script">L</mi><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>x</mi><mo>∼</mo><mi mathvariant="script">D</mi><mo separator="true">,</mo><mo stretchy="false">{</mo><msub><mi>y</mi><mi>i</mi></msub><msubsup><mo stretchy="false">}</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></msubsup><mo>∼</mo><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub><mtext>infer</mtext></msubsup><mo stretchy="false">(</mo><mo>⋅</mo><mo>∣</mo><mi>x</mi><mo stretchy="false">)</mo></mrow></msub><mo fence="false" stretchy="true" minsize="3em" maxsize="3em">[</mo><mfrac><mn>1</mn><mi>G</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>G</mi></munderover><mfrac><mn>1</mn><mrow><mi mathvariant="normal">∣</mi><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi></mrow></mfrac><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi mathvariant="normal">∣</mi><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi></mrow></munderover><mi mathvariant="normal">pop</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>ρ</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><mn>1</mn><mi mathvariant="normal">/</mi><mi>β</mi><mo separator="true">,</mo><mi>β</mi><mo stretchy="false">)</mo><mo>⋅</mo><mi>min</mi><mo>⁡</mo><mtext> ⁣</mtext><mrow><mo fence="true">(</mo><msub><mi>r</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><mi mathvariant="normal">clip</mi><mo>⁡</mo><mtext> ⁣</mtext><mrow><mo fence="true">(</mo><msub><mi>r</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><mn>1</mn><mo>−</mo><msub><mi>ϵ</mi><mtext>low</mtext></msub><mo separator="true">,</mo><mn>1</mn><mo>+</mo><msub><mi>ϵ</mi><mtext>high</mtext></msub><mo fence="true">)</mo></mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo fence="true">)</mo></mrow><mo fence="false" stretchy="true" minsize="3em" maxsize="3em">]</mo></mrow><annotation encoding="application/x-tex">\\mathcal{L}(\\theta) = -\\mathbb{E}_{x \\sim \\mathcal{D}, \\{y_i\\}_{i=1}^{G} \\sim \\pi^{\\text{infer}}_{\\theta_{\\text{old}}}(\\cdot \\mid x)} \\Bigg[ \\frac{1}{G} \\sum_{i=1}^{G} \\frac{1}{|y_i|} \\sum_{t=1}^{|y_i|} \\operatorname{pop}(\\rho_{i,t}, 1/\\beta, \\beta) \\cdot \\min\\!\\left( r_{i,t}\\hat{A}_{i,t}, \\operatorname{clip}\\!\\left( r_{i,t}, 1-\\epsilon_{\\text{low}}, 1+\\epsilon_{\\text{high}} \\right) \\hat{A}_{i,t} \\right) \\Bigg]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathcal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.2387em;vertical-align:-1.2777em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.4562em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span><span class="mpunct mtight">,</span><span class="mopen mtight">{</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight"><span class="mclose mtight">}</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8329em;"><span style="top:-2.1777em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-2.8448em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3223em;"><span></span></span></span></span></span></span><span class="mrel mtight">∼</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8408em;"><span style="top:-2.1528em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0278em;margin-right:0.1em;"><span class="pstrut" style="height:2.6944em;"></span><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3496em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-2.8448em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">infer</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.597em;"><span></span></span></span></span></span></span><span class="mopen mtight">(</span><span class="mord mtight">⋅</span><span class="mrel mtight">∣</span><span class="mord mathnormal mtight">x</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.6617em;"><span></span></span></span></span></span></span><span class="mord"><span class="delimsizing size4">[</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">G</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">G</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.961em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.386em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">∣</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight">∣</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop"><span class="mord mathrm">pop</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">ρ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1/</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mop">min</span><span class="mspace" style="margin-right:-0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">(</span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop"><span class="mord mathrm">clip</span></span><span class="mspace" style="margin-right:-0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">low</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">high</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;">)</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="delimsizing size4">]</span></span></span></span></span></span><p>其中训练-推理不匹配比率定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>ρ</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>=</mo><mfrac><mrow><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub><mtext>train</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub><mtext>infer</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\rho_{i,t} = \\frac{\\pi_{\\theta_{\\text{old}}}^{\\text{train}}(y_{i,t} \\mid x, y_{i,&lt;t})}{\\pi_{\\theta_{\\text{old}}}^{\\text{infer}}(y_{i,t} \\mid x, y_{i,&lt;t})}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">ρ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.7375em;vertical-align:-1.1281em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6095em;"><span style="top:-2.2791em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8309em;"><span style="top:-2.3987em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">infer</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4072em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.779em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8305em;"><span style="top:-2.4169em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.389em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1281em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">pop</mi><mo>⁡</mo><mo stretchy="false">(</mo><mo>⋅</mo><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\operatorname{pop}(\\cdot)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop"><span class="mord mathrm">pop</span></span><span class="mopen">(</span><span class="mord">⋅</span><span class="mclose">)</span></span></span></span> 算子抑制不匹配比率偏离过度的样本:<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">pop</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>ρ</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo><mn>1</mn><mi mathvariant="normal">/</mi><mi>β</mi><mo separator="true">,</mo><mi>β</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>ρ</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mn>1</mn><mi mathvariant="normal">/</mi><mi>β</mi><mo>≤</mo><msub><mi>ρ</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>≤</mo><mi>β</mi><mo separator="true">,</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mn>0</mn><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>otherwise</mtext><mi mathvariant="normal">.</mi></mrow></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">\\operatorname{pop}(\\rho_{i,t}, 1/\\beta, \\beta) = \\begin{cases} \\rho_{i,t}, &amp; 1/\\beta \\le \\rho_{i,t} \\le \\beta, \\\\ 0, &amp; \\text{otherwise}. \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mop"><span class="mord mathrm">pop</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">ρ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1/</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">ρ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord">0</span><span class="mpunct">,</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord">1/</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord"><span class="mord mathnormal">ρ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mpunct">,</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span><span class="mord">.</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>PPO-style 重要性比率和组归一化优势遵循原始 GRPO 定义:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>=</mo><mfrac><mrow><msubsup><mi>π</mi><mi>θ</mi><mtext>train</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub><mtext>train</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo separator="true">,</mo><mspace width="1em"/><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>=</mo><mfrac><mrow><msub><mi>R</mi><mi>i</mi></msub><mo>−</mo><mi mathvariant="normal">mean</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>R</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>R</mi><mi>G</mi></msub><mo stretchy="false">)</mo></mrow><mrow><mi mathvariant="normal">std</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>R</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>R</mi><mi>G</mi></msub><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">r_{i,t} = \\frac{\\pi_\\theta^{\\text{train}}(y_{i,t}\\mid x,y_{i,&lt;t})}{\\pi_{\\theta_{\\text{old}}}^{\\text{train}}(y_{i,t}\\mid x,y_{i,&lt;t})}, \\quad \\hat{A}_{i,t} = \\frac{R_i - \\operatorname{mean}(R_1,\\dots,R_G)}{\\operatorname{std}(R_1,\\dots,R_G)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.617em;vertical-align:-1.1095em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5075em;"><span style="top:-2.2977em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8123em;"><span style="top:-2.3987em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4072em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8305em;"><span style="top:-2.4169em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2831em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1095em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.363em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mord mathrm">std</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop"><span class="mord mathrm">mean</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">G</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>训练期间,我们设置超参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi><mo>=</mo><mn>2</mn><mo separator="true">,</mo><msub><mi>ϵ</mi><mtext>low</mtext></msub><mo>=</mo><mn>0.2</mn><mo separator="true">,</mo><msub><mi>ϵ</mi><mtext>high</mtext></msub><mo>=</mo><mn>0.28</mn></mrow><annotation encoding="application/x-tex">\\beta=2, \\epsilon_{\\text{low}}=0.2, \\epsilon_{\\text{high}}=0.28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">low</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9305em;vertical-align:-0.2861em;"></span><span class="mord">0.2</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">high</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.28</span></span></span></span>.训练完全以 on-policy 方式进行,组大小为 32,batch size 为 32.</p>
<blockquote>
<p><strong>[算法分析]</strong> IcePop 的简化与代价</p>
<p>GLM-5 对 IcePop 的一个关键修改是移除了 KL 正则化项.KL 散度在标准 RLHF 中用于防止策略偏离参考模型太远,但 GLM-5 发现移除它可以加速 RL 改进.这是一个有意识的取舍:更快的收敛速度 vs 更大的策略漂移风险.GLM-5 通过 <code>pop</code> 算子(将不匹配比率限制在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>1</mn><mi mathvariant="normal">/</mi><mi>β</mi><mo separator="true">,</mo><mi>β</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[1/\\beta, \\beta]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1/</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mclose">]</span></span></span></span> 范围内)和裁剪机制( clip 范围 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>0.8</mn><mo separator="true">,</mo><mn>1.28</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[0.8, 1.28]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">0.8</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1.28</span><span class="mclose">]</span></span></span></span> )来替代 KL 的约束作用.从工程角度看,这种简化减少了每次梯度更新的计算量(无需计算 KL 项),同时通过更宽松的 clip 上限(1.28 vs 标准 PPO 的 1.2)允许更大的策略更新步长.代价是训练可能对超参数更敏感,需要更仔细的 early stopping.</p>
</blockquote>
<p><strong>DSA RL 洞察.</strong> 我们在基于 DSA 架构的模型上进行了非常大规模的 RL 训练.与 MLA 相比,DSA 引入了一个额外的 indexer,检索 top-k 个最相关的 key-value 条目并在检索到的子集上稀疏计算注意力.</p>
<p>检索到的 top-k 结果对 RL 稳定性至关重要.这类似于 MoE 模型如何使用路由重放(routing replay)来保留激活的 top-k 专家以确保训练-推理一致性.然而,直接将此策略适配到 indexer 重放——即存储每个 token 位置的 indexer top-k 索引——显然不切实际,因为 indexer 使用的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>2048</mn></mrow><annotation encoding="application/x-tex">k=2048</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2048</span></span></span></span> 远大于 MoE 中典型的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span>,存储所有这些索引将产生巨大的存储成本以及训练引擎和推理引擎之间的显著通信开销.</p>
<p>我们发现采用确定性 top-k 算子有效解决了 DSA indexer token 选择中的训练-推理不匹配.与 SGLang 的 DSA Indexer 中使用的非确定性 CUDA-based top-k 实现相比,直接使用朴素的 <code>torch.topk</code> 虽然稍慢但具有确定性.它产生更一致的输出并带来 substantial 的 RL 收益.相比之下,其他非确定性 top-k 算子(如 CUDA 或 TileLang 实现)在 RL 仅几步后就导致性能急剧下降,伴随熵的 sharp drop.因此,在我们的 RL 阶段中,我们在训练引擎的 DSA Indexer 中使用 <code>torch.topk</code> 作为默认 top-k 算子.我们还在 RL 期间默认冻结 indexer 参数以加速训练并防止 indexer 中的不稳定学习.</p>
<blockquote>
<p><strong>[工程细节]</strong> 确定性 top-k 的意外重要性</p>
<p>这是一个出人意料的工程发现:在 RL 训练中,top-k 算子的确定性比速度更重要.原因是 RL 对分布偏移极其敏感——如果 indexer 在训练和推理之间产生不同的 top-k 选择,模型学习的注意力模式就会在部署时失效.GLM-5 的经验表明,非确定性 CUDA top-k 在 RL 几步后就导致「性能急剧下降+熵 sharp drop」,这是典型的训练崩溃信号.使用 <code>torch.topk</code>(确定性但较慢)完全解决了这个问题.这提醒我们:在 RL 基础设施中,看似微不足道的实现细节(如 top-k 的确定性)可能是训练成败的关键.</p>
</blockquote>
<p><strong>混合域推理 RL.</strong> 在 Reasoning RL 阶段,我们在四个域上进行混合 RL 训练:数学、科学、代码和工具集成推理(TIR,Tool-Integrated Reasoning).对于数学和科学,我们从开源数据集和与外部标注供应商共同开发的集合中精选数据.我们进一步应用难度过滤,将训练集中在 GLM-4.7 很少正确解决或始终失败的难题上,同时这些问题仍然可被更强的教师模型(如 GPT-5.2 xhigh 和 Gemini 3 Pro Preview)解决.对于代码,我们涵盖竞技编程风格任务和科学编码任务.前者主要来自 Codeforces 和代表性数据集如 TACO 和 SYNTHETIC-2-RL,后者通过将问题分解为正确解决方案所需的最小代码实现从内部问题池构建.对于 TIR,我们重用数学和科学 RL 数据中更具挑战性的子集,并额外与标注供应商共同构建明确设计为需用外部工具回答的 STEM 问题.在 RL 训练期间,我们为每个域和来源分配特定的 judge 模型或评估系统以产生二元结果奖励.我们保持四个域的整体混合大致平衡,并始终在混合 RL 设置下观察到每个域稳定且显著的增益.</p>
<h3 id="3-3-agentic-rl">3.3 Agentic RL</h3>
<p>为提升 GLM-5 的 agentic 性能,我们开发了一个完全异步且解耦的 RL 框架,并在编码和搜索 agent 任务上优化 GLM-5.朴素的同步 RL 在长期 agent rollout 期间遭受严重的 GPU 空闲时间.通过通过中央多任务 Rollout Orchestrator 解耦推理和训练引擎,我们在多样化 agentic 工作负载上实现了高吞吐量联合训练.</p>
<p>为在异步 off-policy 条件下保持训练稳定性,我们引入了两个关键机制.首先,Token-in-Token-out(TITO)网关通过保留精确的动作级对应关系消除了重新 token 化不匹配.其次,我们采用 Direct Double-sided Importance Sampling,对 rollout log-probabilities 应用 token 级裁剪机制(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>1</mn><mo>−</mo><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub><mo separator="true">,</mo><mn>1</mn><mo>+</mo><msub><mi>ϵ</mi><mi>h</mi></msub><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[1-\\epsilon_\\ell, 1+\\epsilon_h]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">]</span></span></span></span>),同时高效控制 off-policy 偏差而无需追踪历史策略Checkpoint.我们还采用 DP-aware 路由以在大规模 MoE 模型的长上下文推理期间最大化 KV-cache 复用以加速.为扩展 agentic 环境,我们在三个域中扩展可验证训练环境:超过 10K 真实世界软件工程(SWE)任务、终端任务和高难度多跳搜索任务.更多 agentic RL 细节见第 4 节.</p>
<h3 id="3-4-general-rl">3.4 General RL</h3>
<p><strong>多维度优化目标.</strong> 我们将 General RL 的优化目标分解为三个互补维度:基础正确性(foundational correctness)、情感智能(emotional intelligence)和任务特定质量(task-specific quality).</p>
<p>基础正确性维度作为回复质量的基石.它针对削弱模型输出可用性的广泛错误类型,包括指令遵循失败、逻辑不一致、事实不准确、知识幻觉和语言不流畅.目标是最小化错误率,使回复达到「可用」基线.我们认为这是所有后续优化的先决条件:包含事实错误或误解用户意图的回复,无论多么精致,都可能主动误导用户.</p>
<p>情感智能维度优化超越核心正确性的用户体验.它旨在产生富有同理心、有洞察力且风格接近自然人类交流的回复,使与模型的交互感觉更自然和吸引人.</p>
<p>任务特定质量维度针对各种特定任务的细粒度优化.在基础正确性建立的可用性之上,它旨在将回复从仅仅正确提升到每个任务类别内真正高质量.该维度涵盖广泛任务,包括写作、文本处理、主观和客观问答、角色扮演和翻译.每个任务域需要不同的奖励信号, necessitating 混合奖励系统.</p>
<p><strong>混合奖励系统.</strong> 为监督上述多样化目标,我们构建了一个混合奖励系统,整合三种互补的奖励信号:基于规则的奖励函数、结果奖励模型(ORMs)和生成奖励模型(GRMs).每种都有 distinct 的优缺点,它们的组合是稳定、高效和可扩展的 General RL 训练过程的关键.</p>
<p>基于规则的奖励提供精确且可解释的信号,但仅限于可表达为确定性规则的方面.ORMs 提供低方差信号和高训练效率,但更容易受到奖励黑客攻击——策略利用表面模式而非真正提升核心能力.GRMs 利用语言模型产生标量或结构化评估,对这类利用更 robust,但倾向于表现出更高方差.通过混合这三种信号类型,我们获得了平衡精度、效率和 robustness 的奖励系统,缓解了任何单一组件的弱点.</p>
<p><strong>Human-in-the-loop 风格对齐.</strong> 我们 General RL 流水线的一个 distinctive 方面是明确纳入高质量人类撰写的回复.而非仅依赖模型生成的回复,我们引入专家人类回复作为风格和质量的锚点.这 motivated by 观察:纯粹的模型生成优化倾向于收敛到可识别的「模型式」模式——通常冗长、公式化或缺乏熟练人类写作的细微差别.通过让模型接触人类撰写的范例,我们鼓励它采用更自然、更对齐人类的回复模式.</p>
<h3 id="3-5-on-policy-cross-stage-distillation">3.5 On-Policy Cross-Stage Distillation</h3>
<p>在我们的多阶段 RL 流水线中,顺序优化不同目标可能导致先前获得的能力累积退化.为缓解这一问题,我们在最终阶段执行 on-policy cross-stage distillation,采用 on-policy distillation 算法迅速恢复早期 SFT 和 RL 阶段(Reasoning RL 和 General RL)获得的技能.具体而言,前面训练阶段的最终Checkpoint作为教师模型,其中训练提示从相应教师的 RL 训练集中采样并按适当比例混合.训练损失可通过将式 (1) 中的优势项替换为以下公式获得(<code>sg</code> 表示 stop gradient 操作,如 <code>detach()</code>):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>=</mo><mtext>sg</mtext><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>teacher</mtext></msub><mtext>infer</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msubsup><mi>π</mi><mi>θ</mi><mtext>train</mtext></msubsup><mo stretchy="false">(</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub><mo>∣</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mi>i</mi><mo separator="true">,</mo><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\hat{A}_{i,t} = \\text{sg}\\left[\\log\\frac{\\pi_{\\theta_{\\text{teacher}}}^{\\text{infer}}(y_{i,t}\\mid x,y_{i,&lt;t})}{\\pi_\\theta^{\\text{train}}(y_{i,t}\\mid x,y_{i,&lt;t})}\\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2329em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="mord text"><span class="mord">sg</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6281em;"><span style="top:-2.2977em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8123em;"><span style="top:-2.3987em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.779em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4169em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">teacher</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">infer</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.389em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.0036em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">]</span></span></span></span></span></span></span><p>目前,我们利用推理引擎获取教师的 logits.未来,我们计划将推理后端迁移到训练引擎,并统一采用 MLA 的 MQA(Multi-Query Attention)模式进行推理(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>teacher</mtext></msub><mtext>infer</mtext></msubsup><mo>→</mo><msubsup><mi>π</mi><msub><mi>θ</mi><mtext>teacher</mtext></msub><mtext>train</mtext></msubsup></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{\\text{teacher}}}^{\\text{infer}}\\rightarrow\\pi_{\\theta_{\\text{teacher}}}^{\\text{train}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2381em;vertical-align:-0.389em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4169em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">teacher</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">infer</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.389em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">→</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2195em;vertical-align:-0.389em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8305em;"><span style="top:-2.4169em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">teacher</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">train</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.389em;"><span></span></span></span></span></span></span></span></span></span>).</p>
<p>训练期间,GRPO 算法中的组大小配置为 1 以增加数据吞吐量,batch size 设置为 1024.在此阶段这是可行的,因为不再需要维护每个提示的大组样本来估计优势;优势直接从与教师模型的差距计算.</p>
<blockquote>
<p><strong>[设计动机]</strong> Cross-Stage Distillation 的必要性</p>
<p>多阶段 RL 的一个经典问题是「对齐税」(alignment tax):每轮 RL 优化新目标时,之前阶段获得的能力会退化.GLM-5 的解决方案是在最后阶段用 on-policy distillation「恢复」所有先前能力.这与传统 distillation 不同:传统方法通常用离线数据(教师生成,学生学习),而 on-policy distillation 使用学生自己采样的提示,教师实时生成回复.优势项 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>i</mi><mo separator="true">,</mo><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\hat{A}_{i,t}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2329em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 衡量的是教师模型对学生模型输出概率的「惊讶程度」——如果教师对学生输出的概率远高于学生自己,说明学生在这个 token 上「不自信」,需要加强学习.组大小为 1 的设计意味着不再需要 group-based advantage 估计,简化了训练并提升了吞吐量.</p>
</blockquote>
<h3 id="3-6-slime-kj-rl-xljcss">3.6 slime 框架: RL 训练基础设施</h3>
<p>我们继续使用 slime 作为 GLM-5 的统一后训练基础设施,实现大规模端到端强化学习.slime 不是引入新系统组件,而是充分利用其能力来(1)通过自由形式的 rollout 定制和基于服务器的执行模型扩展任务覆盖,(2)通过混合精度训练/rollout 以及 MTP 和 Prefill-Decode(PD)解聚大幅提升吞吐量——特别是对于多轮 RL 工作负载,(3)通过心跳驱动的 rollout 容错和路由器级服务器生命周期管理提升 robustness.</p>
<h4 id="3-6-1-kz-tggdkdzd-rollout-sxlhxl">3.6.1 扩展:通过高度可定制的 Rollout 实现灵活训练</h4>
<p>GLM-5 的后训练跨越多样化的目标谱系.为支持这种多样性而无需任务特定分支,GLM-5 利用 slime 的高度可定制 rollout 接口及其基于服务器的 rollout 执行.</p>
<p><strong>高度可定制的 rollouts.</strong> slime 提供灵活的接口用于实现任务特定的 rollout 逻辑——包括多轮交互循环、工具调用、环境反馈处理和验证器引导分支——而无需修改底层基础设施.GLM-5 利用此能力在统一训练栈内支持广泛的域和训练范式,包括但不限于推理 RL、通用 RL、agentic RL 和 on-policy distillation.</p>
<p><strong>基于服务器的 rollouts via HTTP APIs.</strong> slime 通过标准 HTTP APIs 暴露其 rollout 服务器和推理路由器,允许用户以与常规推理引擎相同的方式与 slime 的服务层交互.这将 rollout 逻辑与训练过程边界解耦:外部 agent 框架和环境可以直接调用服务器/路由器端点,而优化后端对短视距单轮训练和长视距多轮轨迹保持不变.</p>
<h4 id="3-6-2-kz-rl-rollout-dwycyh">3.6.2 扩展:RL Rollout 的尾延迟优化</h4>
<p>对于 RL rollouts,优化目标不是聚合吞吐量而是端到端延迟——由每步最慢的(长尾)样本主导.实践中,单个 straggling 轨迹可能阻塞同步点(如 batch 完成、缓冲区就绪、训练器更新)并直接决定 wall-clock 进度.GLM-5 因此充分利用 slime 的面向延迟的服务和调度机制来最小化中位延迟,更重要的是,最小化尾延迟.</p>
<p><strong>面向无队列服务的 MLA 多节点推理 with DP-attention.</strong> 为避免队列延迟,rollout 请求必须在突发流量下得到及时服务,这需要大量的 KV-cache 容量.GLM-5 采用多节点推理部署(如 8 节点上的 EP64 和 DP64)以提供足够的分布式 KV-cache.DP-attention 主要引入以防止在不同 rank 间复制 KV.</p>
<p><strong>FP8 rollouts 和 MTP 降低尾延迟.</strong> GLM-5 使用 FP8 进行 rollout 推理以降低每 token 延迟并缩短长轨迹的完成时间.此外,GLM-5 利用 slime 对 MTP 的支持,这在 RL rollouts 典型的小 batch decoding 制度下特别有效.由于尾延迟通常由小 BS stragglers 驱动(如罕见的长上下文、复杂多轮推理、工具密集型轨迹),MTP 在长尾上提供了不成比例的大收益,改善了最慢样本的完成时间,从而降低步级阻塞时间.</p>
<p><strong>PD 解聚以防止多轮 RL 中的预填充-解码干扰.</strong> 在多轮设置中,长前缀预填充频繁发生(对话历史、工具轨迹、代码上下文).在 DP-attention 下,在同一服务资源上混合预填充和解码会产生严重干扰:沉重的预填充可能抢占或中断服务器上正在进行的解码,阻止其他样本持续进展并急剧恶化尾延迟.因此,GLM-5 利用 slime 的 Prefill-Decode(PD)解聚.通过在专用资源上运行预填充和解码,解码保持稳定且不受干扰,使长视距样本持续进展并显著改善多轮 agentic RL 中的尾部行为.</p>
<h4 id="3-6-3-rollout-robustness-xtqddrc">3.6.3 Rollout Robustness: 心跳驱动的容错</h4>
<p>在大规模下,瞬时故障(如单个服务器崩溃、网络问题或性能退化)不可避免.GLM-5 利用 slime 的心跳驱动容错确保此类事件下的训练连续性:rollout 服务器定期发出由编排层监控的心跳,不健康的服务器被主动终止并从推理路由器注销.结果,重试自动从失败或降级的服务器路由到健康的服务器,防止单服务器事件中断 rollouts 并保持不间断的端到端 RL 训练.</p>
<blockquote>
<p><strong>[系统架构]</strong> slime 的设计哲学</p>
<p>slime 框架的设计体现了 RL 基础设施的三个核心原则:</p>
<ol>
<li><strong>解耦</strong>:推理引擎和训练引擎物理分离,通过 HTTP API 通信,使两者可以独立扩展和优化</li>
<li><strong>延迟优先</strong>:不以吞吐量为唯一优化目标,而是关注尾延迟——因为 RL 的同步瓶颈由最慢样本决定</li>
<li><strong>容错</strong>:将故障视为常态而非异常,通过心跳监控和自动故障转移保持训练连续性</li>
</ol>
<p>PD 解聚特别值得注意.在多轮 agentic RL 中,预填充(处理长上下文历史)和解码(生成回复)的混合会严重干扰彼此.GLM-5 将两者分配到专用资源,类似于现代推理服务中的 PD 分离架构.这种设计对于 agentic RL 至关重要,因为 agent 的上下文长度随轮次累积,预填充成本呈线性增长.</p>
</blockquote>
<hr>
<h2 id="4-agentic-engineering">4 Agentic Engineering</h2>
<p>我们描述从 <strong>vibe coding</strong>(人类提示)到 <strong>agentic engineering</strong> 的过渡.在 vibe coding 中,人类提示 AI 模型写代码.在 agentic engineering 中,AI agent 自己写代码.它们规划、实现和迭代.为支持这些长期任务,GLM-5 利用完全异步且解耦的 RL 框架,通过减少 agent rollout 期间的 GPU 空闲时间显著提升 GPU 利用率.为扩展 agent 环境,我们开发了环境构建管道.对于编码任务,我们通过创建超过 10,000 个可验证训练场景来设置真实世界软件工程问题和终端任务.对于搜索 agent,我们开发了一个自动且可扩展的复杂多步推理数据合成管道来构建 agentic 训练数据.</p>
<h3 id="4-1-mx-agentic-rwdyb-rl">4.1 面向 Agentic 任务的异步 RL</h3>
<p>为对 agent 任务进行 RL,我们设计了一个完全异步且解耦的 RL 基础设施,高效处理长期 agent rollout 并支持跨多样化 agent 框架的灵活多任务 RL 训练.</p>
<p>我们采用组级策略优化算法进行 RL 训练.对于每个问题 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>,我们从先前策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mtext>old</mtext></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\text{old}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 采样 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 个 agent 轨迹 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">{</mo><msub><mi>y</mi><mn>1</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>y</mi><mi>K</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\{y_1,\\dots,y_K\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span>,并优化模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 以最大化以下目标:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>x</mi><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mtext> ⁣</mtext><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mi>K</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></munderover><mrow><mo fence="true">(</mo><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>−</mo><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">L(\\theta) = \\mathbb{E}_{x\\sim\\mathcal{D}}\\!\\left[ \\frac{1}{K}\\sum_{i=1}^{K} \\left( r(x,y_i) - \\bar{r}(x) \\right) \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:-0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">[</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">]</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mi>K</mi></mfrac><msubsup><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></msubsup><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\bar{r}(x) = \\frac{1}{K}\\sum_{i=1}^{K} r(x,y_i)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3262em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9812em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 是采样回复的平均奖励.注意只有模型生成的 token 用于优化,环境反馈在损失计算中被忽略.</p>
<h4 id="4-1-1-mx-agentic-xldyb-rl-sj">4.1.1 面向 Agentic 训练的异步 RL 设计</h4>
<p>由于 rollout 过程的长尾性质,朴素的同步 RL 训练在 rollout 阶段引入大量气泡,因为 agentic 任务的生成严重不平衡,导致大量 GPU 空闲时间.为提高训练吞吐量,我们为 Agentic RL 采用完全异步训练范式以提升 GPU 利用率和训练效率.</p>
<p>具体而言,我们将训练引擎和推理引擎解耦到不同的 GPU 设备上.推理引擎持续生成轨迹.一旦生成的轨迹数量达到预定义阈值,batch 就被发送到训练引擎以更新模型.为减少策略滞后并保持训练近似 on-policy,rollout 引擎使用的模型权重定期与训练引擎的权重同步.训练引擎每 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 个梯度更新后将新权重推回推理引擎.</p>
<p>虽然异步可以显著提升整体训练效率,但也意味着不同轨迹可能由不同版本的模型生成,引入严重的 off-policy 问题.由于权重更新考虑了因 rollout 策略变化而导致的不同优化问题,我们在推理引擎每次权重更新后也重置优化器.</p>
<p><strong>基于服务器的多任务训练设计.</strong> 为解决多任务 RL 中轨迹生成的异构性——不同任务通常依赖不同的工具集和任务特定 rollout 逻辑——我们引入了基于服务器的 Multi-Task Rollout Orchestrator 进行多任务 RL 训练.该组件旨在通过具有多个注册任务服务的中央编排器确保 slime RL 训练框架与多样化下游任务之间的无缝兼容性.具体而言,每个任务将自己的 rollout 和奖励逻辑实现为独立的微服务,向中央编排器注册以进行管理和调度.</p>
<p>在 rollout 阶段,中央编排器控制每任务的 rollout 比例和生成速度以实现跨任务的平衡数据收集.至关重要的是,我们将所有 agentic 任务的轨迹标准化为统一的消息列表表示.这支持复杂 agentic 框架(如软件工程任务)的联合训练,同时支持异构工作负载的集中后处理和日志记录.该设计将任务特定逻辑与核心训练循环 cleanly 隔离,实现与多任务 RL 训练的无缝集成.作为 GLM-5 训练基础设施的骨干,该编排器支持超过 1k 个并发 rollouts,并能够自动动态调整任务采样比例以及细粒度监控任务进度.</p>
<h4 id="4-1-2-yhybxlwdx">4.1.2 优化异步训练稳定性</h4>
<p><strong>Token-in-Token-out vs. Text-in-Text-out.</strong> 在 RL rollout 设置中,token-in-token-out(TITO)意味着训练管道消费推理引擎产生的精确 tokenization 和解码 token 流,并直接用于构建学习轨迹.相比之下,text-in-text-out 将 rollout 引擎视为返回最终文本的黑盒;训练器然后重新 token 化该文本(并经常重新推导边界和截断)再计算损失.</p>
<p>这个看似微小的选择具有重要影响:重新 token 化可能在 token 边界、空白/规范化处理、截断或特殊 token 放置方面引入微妙的不匹配,进而可能破坏动作与奖励/优势之间的步骤对齐——特别是当 rollouts 被流式传输、截断或在多个 actor 间交错时.我们发现 TITO 对异步 RL 训练至关重要,因为它保留了采样内容与优化内容之间的精确动作级对应关系,同时允许 actor 立即发射轨迹片段(token IDs + 元数据)而无需有损的文本往返,也无需等待 learner 侧的重新 token 化.</p>
<p>实践中,我们实现了一个 TITO Gateway,拦截来自 rollout 任务的所有生成请求并记录每个轨迹的 token IDs 和元数据.该设计将繁琐的 token ID 处理与下游 agent rollout 逻辑隔离,同时避免 RL 训练期间的重新 token 化不匹配.</p>
<blockquote>
<p><strong>[工程细节]</strong> TITO 为什么比 TITO 更重要?</p>
<p>在异步 RL 中,推理引擎和训练引擎是物理分离的.如果采用 Text-in-Text-out,推理引擎生成文本,通过网络传输到训练引擎,训练引擎再 token 化.这个过程中:1)不同引擎可能使用不同版本的 tokenizer;2)文本解码-再编码可能改变特殊 token 的位置;3)截断策略可能不一致.GLM-5 的 TITO 直接传输 token IDs,完全消除了这些不匹配.从延迟角度看,TITO 也更快,因为无需等待完整文本生成和重新 token 化.对于多轮 agentic 任务(每轮可能有数百个工具调用),这种不一致的累积可能导致训练完全失败.</p>
</blockquote>
<p><strong>Direct double-sided importance sampling for token clipping.</strong> 与第 3 节中的同步 RL 训练设置不同,在异步设置中,rollout 引擎可能在单次轨迹生成期间经历多次更新,这使得追踪精确行为概率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{\\text{old}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6864em;vertical-align:-0.2559em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span></span></span></span> 在计算上 prohibitive.否则,我们必须维护一个庞大的模型Checkpoint历史 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">{</mo><msub><mi>π</mi><msubsup><mi>θ</mi><mtext>old</mtext><mrow><mo stretchy="false">(</mo><mn>1</mn><mo stretchy="false">)</mo></mrow></msubsup></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>π</mi><msubsup><mi>θ</mi><mtext>old</mtext><mrow><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow></msubsup></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\{\\pi_{\\theta_{\\text{old}}^{(1)}}, \\dots, \\pi_{\\theta_{\\text{old}}^{(N)}}\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.3896em;vertical-align:-0.6396em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7414em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0591em;"><span style="top:-2.1885em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5357em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span><span style="top:-3.0591em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5357em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mtight">1</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3472em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.6396em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3448em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7414em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0591em;"><span style="top:-2.1885em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5357em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span><span style="top:-3.0591em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5357em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3472em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.6396em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span>,这在实际实现中不可行.</p>
<p>为解决此问题,我们首先采用简化的 token 级重要性采样机制,重用 rollout 期间生成的 log-probabilities 作为直接的行为代理.通过将重要性采样比率计算为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>t</mi></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><msub><mi>π</mi><mi>θ</mi></msub><msub><mi>π</mi><mtext>rollout</mtext></msub></mfrac></mrow><annotation encoding="application/x-tex">r_t(\\theta) = \\frac{\\pi_{\\theta}}{\\pi_{\\text{rollout}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1681em;vertical-align:-0.4509em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7173em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rollout</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4159em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4509em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 并丢弃传统的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{\\text{old}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6864em;vertical-align:-0.2559em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span></span></span></span>,我们消除了单独旧策略推理的计算开销.其次,我们采用双边校准 token 级掩码策略.与标准 PPO 中使用的不对称裁剪不同,我们将信任区域限制在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>1</mn><mo>−</mo><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub><mo separator="true">,</mo><mn>1</mn><mo>+</mo><msub><mi>ϵ</mi><mi>h</mi></msub><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[1-\\epsilon_\\ell, 1+\\epsilon_h]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">]</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub></mrow><annotation encoding="application/x-tex">\\epsilon_\\ell</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>ϵ</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">\\epsilon_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是裁剪超参数.落在此区间外的 token 完全从梯度计算中 mask 掉,以防止极端策略分歧导致的不稳定.这与 IcePop 机制有相似之处,但我们的策略更简单——进一步移除了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><msub><mi>θ</mi><mtext>old</mtext></msub></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\theta_{\\text{old}}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6864em;vertical-align:-0.2559em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0278em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2559em;"><span></span></span></span></span></span></span></span></span></span> ——并实现了更稳定的训练.</p>
<p>形式上,带 token 级裁剪的优化目标可写为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>L</mi><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mi>t</mi></msub><mrow><mo fence="true">[</mo><mi>f</mi><mo stretchy="false">(</mo><msub><mi>r</mi><mi>t</mi></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><msub><mi>ϵ</mi><mi>l</mi></msub><mo separator="true">,</mo><msub><mi>ϵ</mi><mi>h</mi></msub><mo stretchy="false">)</mo><msub><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi></msub><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>s</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">L(\\theta) = \\mathbb{E}_t \\left[ f(r_t(\\theta), \\epsilon_l, \\epsilon_h) \\hat{A}_t \\log \\pi_{\\theta}(a_t|s_t) \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">[</span></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">]</span></span></span></span></span></span></span><p>重要性采样比率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>t</mi></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_t(\\theta)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span></span></span></span> 计算为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mi>t</mi></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mi>exp</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>s</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mtext>rollout</mtext></msub><mo stretchy="false">(</mo><msub><mi>a</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><msub><mi>s</mi><mi>t</mi></msub><mo stretchy="false">)</mo><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">r_t(\\theta) = \\exp\\left( \\log \\pi_\\theta(a_t|s_t) - \\log \\pi_{\\text{rollout}}(a_t|s_t) \\right)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">exp</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">rollout</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">)</span></span></span></span></span></span><p>稳定性通过校准函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">;</mo><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub><mo separator="true">,</mo><msub><mi>ϵ</mi><mi>h</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">f(x; \\epsilon_\\ell, \\epsilon_h)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 强制执行:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">;</mo><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub><mo separator="true">,</mo><msub><mi>ϵ</mi><mi>h</mi></msub><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>x</mi><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mtext>if </mtext><mn>1</mn><mo>−</mo><msub><mi>ϵ</mi><mi mathvariant="normal">ℓ</mi></msub><mo>&lt;</mo><mi>x</mi><mo>&lt;</mo><mn>1</mn><mo>+</mo><msub><mi>ϵ</mi><mi>h</mi></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mn>0</mn><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>otherwise</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">f(x; \\epsilon_\\ell, \\epsilon_h) = \\begin{cases} x, &amp; \\text{if } 1-\\epsilon_\\ell &lt; x &lt; 1+\\epsilon_h \\\\ 0, &amp; \\text{otherwise} \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="mpunct">,</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord">0</span><span class="mpunct">,</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">if </span></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">ℓ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">ϵ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">otherwise</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>实验中,我们发现重用 rollout log-probabilities 接受受控程度的 off-policy 偏差,以规避历史策略追踪的需求,同时提升训练稳定性.</p>
<p><strong>丢弃 off-policy 和噪声样本.</strong> 在异步 RL 中,过长的轨迹可能变得高度 off-policy,可能 destabilize 训练.为过滤这些严重 off-policy 的样本,我们记录 rollout 引擎在生成时使用的策略权重版本.具体而言,对于每个回复我们记录涉及的模型版本序列 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>w</mi><mn>0</mn></msub><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><msub><mi>w</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(w_0, \\ldots, w_k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>w</mi><mn>0</mn></msub><mo>&lt;</mo><mo>⋯</mo><mo>&lt;</mo><msub><mi>w</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">w_0 &lt; \\cdots &lt; w_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>.令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>w</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup></mrow><annotation encoding="application/x-tex">w&#x27;</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7519em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span></span></span></span> 表示当前策略版本.如果最旧的 rollout 版本过于陈旧,即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>w</mi><mo mathvariant="normal" lspace="0em" rspace="0em">′</mo></msup><mo>−</mo><msub><mi>w</mi><mn>0</mn></msub><mo>&gt;</mo><mi>τ</mi></mrow><annotation encoding="application/x-tex">w&#x27; - w_0 &gt; \\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8352em;vertical-align:-0.0833em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">′</span></span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6891em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 为预定义阈值),我们丢弃该样本.这移除了滞后当前策略太远的轨迹.</p>
<p>此外,编码 agent 沙箱可能 inherently 不稳定,可能因与模型无关的原因失败(如环境崩溃).此类失败引入噪声训练信号,因为它们反映环境不稳定性而非模型能力.为缓解此问题,我们记录每个样本的失败原因,并排除因环境崩溃而失败的样本.对于基于组的采样方法(如 GRPO),移除失败样本可能留下不完整的组.在这种情况下,如果有效样本数超过组大小的一半,我们通过重复有效样本来填充组;否则,我们丢弃整个组.该程序减少了虚假奖励噪声并改善了训练稳定性.</p>
<p><strong>DP-aware routing for acceleration.</strong> 我们提出 DP-aware 路由机制以在 Data Parallelism(DP,数据并行)下保持大规模 MoE 推理的 KV cache 局部性.在多轮 agentic 工作负载中,来自同一 rollout 的顺序请求共享相同的前缀.为最大化 KV 复用,我们强制执行 rollout 级亲和性:属于给定 agent 实例的所有请求被路由到相同的 DP rank.具体而言,我们引入一个有状态路由层,使用一致性哈希将每个 rollout ID 映射到固定的 DP rank.该映射在轮次间保持稳定,消除跨 rank cache miss.为防止长期不平衡,我们将哈希与哈希空间上的轻量级动态负载再平衡结合.该设计避免了跨 DP rank 的 KV 同步所需的冗余预填充计算.随着 rollout 长度增加,预填充成本保持与增量 token 成比例而非总上下文长度.结果是改善了端到端延迟和更高的长上下文 agentic 推理有效吞吐量.</p>
<h3 id="4-2-agent-hjkz">4.2 Agent 环境扩展</h3>
<p>为支持跨多样化 agentic 任务的强化学习,我们构建可验证、可执行的环境,为以代码为中心和内容生成工作流提供 grounded 反馈.</p>
<h4 id="4-2-1-rjgc-swe-hj">4.2.1 软件工程(SWE)环境</h4>
<p>在构建可执行环境之前,我们收集大量真实世界 Issue-Pull Request(PR)对,并应用严格的基于规则和 LLM-based 过滤以确保获取真实、高质量的 issue 陈述.我们将这些实例分类为不同任务类型——bug 修复、功能实现、重构等——并包含必要的任务要求以确保模型的实现与测试补丁一致.我们采用基于 RepoLaunch 框架的环境设置管道,从真实世界 SWE 问题扩展可执行环境的构建.该管道自动分析仓库的安装和依赖设置以构建可执行环境并生成测试命令,然后利用 LLM 从测试输出生成语言感知的日志解析函数,实现 Fail-to-Pass(F2P)和 Pass-to-Pass(P2P)测试用例的提取.使用该管道,我们在跨越 9 种编程语言的数千个仓库中构建了超过 10k 个可验证环境,包括 Python、Java、Go、C、C++、JavaScript、TypeScript、PHP 和 Ruby.</p>
<h4 id="4-2-2-zdhj">4.2.2 终端环境</h4>
<p><strong>从种子数据合成.</strong> 为大规模构建可验证的终端 agent 环境,我们设计了一个包含三个阶段的 agentic 数据合成管道:任务草稿生成、具体任务实现和迭代任务优化.从真实世界软件工程和基于终端的计算机使用场景中收集的一组种子任务开始,我们利用 LLM 头脑风暴并生成大量可验证的终端任务草稿.然后,这些草稿由构建 agent 实例化为 Harbor 格式的具体任务,包括结构化任务描述、Dockerized 执行环境和相应的测试脚本.随后,一个 refine agent 根据手动定义的评分标准检查和迭代优化生成的任务,确保 Docker 镜像可以可靠构建、测试用例与任务规范一致,且环境对潜在利用或捷径具有 robustness.总体而言,该管道产生了数千个多样化且可验证的终端 agent 环境,Docker 构建准确率超过 90%.</p>
<p><strong>从网络语料合成.</strong> 我们开发了一个可扩展的自动化管道,基于网络语料构建 LLM 验证的基于终端的编码任务,使用闭环设计,其中构建 agent 也作为其自己的第一遍评估器.</p>
<p>首先,我们收集大规模的代码相关网页语料库并应用数据质量分类器以仅保留高质量内容,丢弃主要非技术性或缺乏实质性代码内容的页面.从过滤后的子集中,我们进一步识别适合终端风格任务制定的网页.然后我们跨主题类别和难度级别应用分层采样,以确保结果任务池的分布平衡和多样性.</p>
<p>其次,我们提示一个编码 agent 使用 Harbor 任务构建规范,包括任务模式、格式要求和示例任务,以及每个选定的源网页.agent 被指示(i)基于网页内容合成一个完整的终端任务,(ii)对其自己的输出执行 Harbor 验证脚本.验证失败时,agent 迭代诊断和修订任务直到通过所有自动检查.只有通过此自验证循环的任务才被纳入最终数据集.</p>
<h4 id="4-2-3-ssrw">4.2.3 搜索任务</h4>
<p>对于深度搜索信息检索任务,我们构建了一个数据合成管道,产生具有挑战性的多跳 QA 对.每个问题需要来自多个网络来源聚合证据的多步推理.</p>
<p><strong>Web Knowledge Graph(WKG)构建和问题生成.</strong> 从早期搜索 agent 的轨迹开始,我们收集和去重所有遇到的 URL,保留跨多样化领域的超过 200 万个高信息网页.LLM 执行语义解析进行实体识别、噪声过滤和结构化信息提取.WKG 通过实体对齐、属性归一化、关系整合和语义一致性修正,使用下游验证信号持续更新和优化.</p>
<p>基于 WKG,我们采样中低频实体作为种子节点并扩展其多跳邻域以形成完整子图,同时控制扩展以减少重叠.使用针对高难度、多领域推理的提示,我们将每个子图转换为隐式编码多实体关系链的问题.</p>
<p><strong>高难度问题过滤和验证.</strong> 我们应用三阶段管道来平衡难度和正确性:
(1) 移除无工具推理模型在八次独立尝试中至少一次正确回答的问题.
(2) 过滤掉早期 agent 通过基本搜索、浏览和计算在几步内可解决的问题.
(3) 应用验证 agent 进行双向验证:我们收集阶段 2 搜索轨迹中的候选答案,然后独立验证候选答案和标注真值的问题-答案一致性,拒绝具有非唯一答案、不一致证据或错误标签的样本.</p>
<p>这产生了高质量、高难度、可靠的多跳 QA 对.</p>
<h3 id="4-3-ss-agent-dtlysxwgl">4.3 搜索 Agent 的推理与上下文管理</h3>
<p>我们发现 BrowseComp 上的性能对 judge prompt 和 judge model 都敏感,开源 judges 可能引入系统性偏差.为确保一致性和可复现性,我们使用官方 OpenAI 评估提示和专有模型 o3-mini 作为 judge 标准化所有基于 judge 的组件.我们的案例研究表明此配置最符合人类标注的真值,因此我们采用它进行所有搜索 agent 评估.</p>
<p>先前工作引入了上下文管理,其中 <em>Discard-all</em> 通过移除整个工具调用历史来重置上下文.我们进一步观察到模型准确率在有极长上下文(如超过 100k token)时显著下降.受此启发,我们采用简单的 <em>Keep-recent-k</em> 策略.当交互历史超过阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 时,早于最近 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 轮的内容将被折叠以控制上下文长度.</p>
<p>令轨迹为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>q</mi><mo separator="true">,</mo><msub><mi>r</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>a</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>o</mi><mn>1</mn></msub><mo separator="true">,</mo><msub><mi>r</mi><mn>2</mn></msub><mo separator="true">,</mo><msub><mi>a</mi><mn>2</mn></msub><mo separator="true">,</mo><msub><mi>o</mi><mn>2</mn></msub><mo separator="true">,</mo><mo>⋯</mo><mtext> </mtext><mo separator="true">,</mo><msub><mi>r</mi><mi>n</mi></msub><mo separator="true">,</mo><msub><mi>a</mi><mi>n</mi></msub><mo separator="true">,</mo><msub><mi>o</mi><mi>n</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(q,r_1,a_1,o_1,r_2,a_2,o_2,\\cdots,r_n,a_n,o_n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">⋯</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi></mrow><annotation encoding="application/x-tex">q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span> 表示问题,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">r_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 轮的推理,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>a</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">a_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示动作(我们设计了 <em>search</em>、<em>open</em>、<em>find</em> 和 <em>python</em> 4 个工具),<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>o</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">o_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示工具观察.我们仅折叠早于最近 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 轮的观察:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>o</mi><mi>i</mi></msub><mo>←</mo><mtext>Tool result is omitted to save tokens.</mtext><mspace width="1em"/><mi>i</mi><mo>=</mo><mn>1</mn><mo separator="true">,</mo><mo>…</mo><mo separator="true">,</mo><mi>n</mi><mo>−</mo><mi>k</mi></mrow><annotation encoding="application/x-tex">o_i \\leftarrow \\text{Tool result is omitted to save tokens.}\\quad i=1, \\ldots, n-k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">Tool result is omitted to save tokens.</span></span><span class="mspace" style="margin-right:1em;"></span><span class="mord mathnormal">i</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner">…</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span></span><p>实验中,我们设置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>5</mn></mrow><annotation encoding="application/x-tex">k=5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">5</span></span></span></span>,这带来了稳定的提升并将 GLM-5 从 55.3%(无 keep-recent-k)提升到 62.0%(有 keep-recent-k).我们还发现使用不同的 keep-recent <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 值,或者在上下文长度达到预定义 token 阈值时触发 keep-recent,导致相同的结果.</p>
<p>在此基础上,我们将 keep-recent 与 Discard-all 结合形成混合的 <em>Hierarchical Context Management</em> 策略.在使用 keep-recent 的推理期间,如果总上下文长度超过阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi></mrow><annotation encoding="application/x-tex">T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span></span></span></span>,我们丢弃整个工具调用历史并以全新上下文重新开始,同时继续应用 keep-recent 策略.我们通过参数搜索选择 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>=</mo><mn>32</mn><mi>k</mi></mrow><annotation encoding="application/x-tex">T=32k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">32</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span>.</p>
<p>如图 7 所示,在不同计算预算下,该策略有效释放上下文空间,使模型能够执行更多步骤并持续改进性能.与单独使用 Discard-all 相比,结合 keep-recent-k 在所有预算下都取得了持续增益,最终达到 75.9 分,超越了所有配备上下文管理的开源模型.</p>
<blockquote>
<p>图 7: GLM-4.7(灰色基线)到 GLM-5(彩色策略)在不同上下文管理策略下的 BrowseComp 准确率.数据来源:原文 Figure 7.</p>
</blockquote>
<blockquote>
<p><strong>[工程思考]</strong> Hierarchical Context Management 的设计智慧</p>
<p>搜索 agent 的上下文管理是一个经典的速度-质量权衡.Discard-all 每轮清空历史,保证上下文长度可控但丢失了累积知识.keep-recent-k 保留了最近 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 轮的完整信息,但老信息被折叠为占位符.Hierarchical 策略结合了两者的优点:在「正常」情况下用 keep-recent-k 保留近期细节;在上下文即将溢出时用 Discard-all 彻底重置,给 agent 「重新开始」的机会.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>=</mo><mn>5</mn></mrow><annotation encoding="application/x-tex">k=5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">5</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mo>=</mo><mn>32</mn><mi>k</mi></mrow><annotation encoding="application/x-tex">T=32k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">32</span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 的选择体现了工程实践中的经验主义——这些值不是理论推导的,而是通过参数搜索找到的 sweet spot.从 55.3% 到 75.9% 的提升(相对提升 37%)表明,上下文管理策略对 agent 性能的影响可能大于模型本身的容量提升.</p>
</blockquote>
<h3 id="4-4-hdpsc">4.4 幻灯片生成</h3>
<p>我们采用一个自改进管道,旨在通过强化学习和拒绝采样微调系统性地提升幻灯片生成性能,训练一个专门的幻灯片生成专家.我们首先用监督微调(SFT)初始化模型以提供基本的幻灯片生成能力,然后使用基于常见审美和结构属性的多级奖励公式进行强化学习.该阶段带来了生成质量的 substantial 改进.我们进一步进行拒绝采样微调和 mask 微调,允许 RL 期间获得的知识被注入回训练语料库.该程序以协调和迭代的方式联合提升数据质量和模型能力.</p>
<p>我们提出一个 <strong>多级奖励公式</strong>,将基于 HTML 的幻灯片生成过程中的奖励信号划分为三个级别:</p>
<p><strong>Level-1: 静态标记属性.</strong> 该级别关注生成 HTML 中的声明性属性,包括定位、间距、颜色、排版、饱和度和其他风格属性.基于专业设计原则,我们设计了一套规则来规范模型生成此类声明时的行为.这些规则确保生成 HTML 的语法可解析性,同时将设计空间在标记级别约束为针对表达力、结构清晰度、视觉和谐性和可读性优化的子空间.此外,我们引入幻觉图像和重复图像检测机制以抑制幻觉或冗余图形.</p>
<p><strong>Level-2: 运行时渲染属性.</strong> 与静态检查不同,该级别评估渲染期间 DOM 节点的运行时属性,如元素宽度和高度、边界框和其他几何布局指标.通过约束这些属性,我们鼓励生成的幻灯片在空间组织上更紧密对齐人类审美偏好.我们开发了一个分布式渲染服务,能够以高吞吐量执行渲染作业同时提取所需的运行时属性.训练期间,我们观察到多种形式的奖励黑客行为,如硬截断过长内容或过度操纵间距(参见图 8).为缓解这些问题,我们优化渲染器实现以消除可利用的漏洞,确保奖励信号真正激励审美连贯的布局而非对几何指标的肤浅遵从.</p>
<blockquote>
<p>图 8: 幻灯片 RL 训练中的奖励黑客示例.运行时渲染获取 grounded 属性值,使评估对此类黑客行为具有 robustness.数据来源:原文 Figure 8.</p>
</blockquote>
<p><strong>Level-3: 视觉感知特征.</strong> 超越运行时渲染约束,我们纳入渲染幻灯片的感知级评估.例如,我们检测异常空白模式作为辅助信号以进一步改善整体构图平衡和视觉美学.</p>
<p><strong>训练策略.</strong> 这些信号在 RL 期间联合优化以改进生成 HTML 的结构有效性、增强布局组织并提升整体视觉美学质量.除奖励设计外,我们通过动态采样重塑训练分布.具体而言,结构平凡样本的一部分被概率性丢弃,使优化聚焦于更具挑战性的页面并改善复杂构图场景下的 robustness.我们还采用 token 级策略梯度损失以稳定优化.此外,我们引入平衡策略,将同一样本的不同 rollout 结果分布到多个训练 batch 中,减少优化偏差并改善训练稳定性.</p>
<p><strong>拒绝采样.</strong> 在拒绝采样阶段,RL 中使用的奖励函数被转移到数据过滤管道以构建高质量训练子集.在页面级别,过滤标准包括代码有效性和编译可行性.在轨迹级别,我们进一步强制执行工具执行正确性和全局内容多样性约束,确保结构一致性.</p>
<p>我们采用 Best-of-<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span> 选择策略,从多个独立生成的候选中保留最高质量样本.该机制有效地将分布重新加权向更高质量实例,改善了样本效率和训练稳定性.</p>
<p><strong>基于 Mask 的精修.</strong> 虽然拒绝采样移除了大多数低质量输出,但有些轨迹的缺陷仅局限于少量页面.丢弃此类样本会降低有效数据利用率并增加生成成本.为解决此问题,我们引入 mask-based 修正机制,自动识别缺陷页面并应用 masking,同时保留同一轨迹中的高质量内容.这种选择性精修保留了有价值的监督信号,改善了有效数据效率并减少了冗余再生开销,从而提升了整体训练效率.</p>
<p><strong>经验改进.</strong> 严格符合 16:9 宽高比的生成页面比例从 40% 增加到 92%,同时页面溢出情况大幅减少.人工评估进一步显示,与 GLM-4.5 相比,GLM-5 在内容质量上取得 60% 胜率,布局合理性 57.5%,视觉美学 65%,总体胜率 67.5%.这些结果为所提出的多级奖励设计和自改进框架的有效性提供了经验证据.</p>
<hr>
<h2 id="5-gcxpjcsssp">5 国产芯片基础设施适配</h2>
<p>将 GLM-5 适配到多样化的国产芯片基础设施面临显著挑战,因为硬件生态的异构性常常使高性能部署复杂化.尽管存在这些障碍,我们通过与七个主流国产芯片平台的紧密合作成功实现了 GLM-5 的全栈适配,包括华为昇腾、摩尔线程、海光、寒武纪、昆仑芯、天数智芯和燧原.本节以昇腾 Atlas 系列为案例研究展示我们的适配方法,聚焦于三个核心支柱:极端量化、高性能内核融合和先进推理引擎调度.</p>
<p><strong>混合精度 W4A8 量化.</strong> 为将 750B 参数的 GLM-5 模型装入单台 Atlas 800T A3 机器,我们实现了复杂的 W4A8 混合精度量化策略.使用 msModelSlim 工具,我们对不同模型组件应用特定精度:标准 Attention 和 MLP 块使用 W8A8(INT8),而 MoE 专家被压缩到 W4A8(INT4)以大幅降低内存占用而不显著损失精度.采用了 QuaRot 等高级算法进行 outlier 抑制和 <code>Flex_AWQ_SSZ</code> 进行缩放校准,以维持低比特部署的稳定性.</p>
<p><strong>高性能融合内核.</strong> 为克服昇腾 NPU 上稀疏注意力的计算瓶颈,我们开发了一套定制融合内核:Lightning Indexer、Sparse Flash Attention 和 MLAPO(Multi-head Latent Attention Pre-processing Optimization).Lightning Indexer 将分数计算、ReLU 和 TopK 操作融合到单个内核中,允许 NPU 在计算与内存访问之间重叠.对于 Sparse Flash Attention 内核,我们专门为 GLM-5 的稀疏模式优化.该内核并行处理从 KV cache 中选择 TopK token 和稀疏注意力计算.最后,MLAPO 将 13 个小预处理算子融合为一个「超级算子」,利用 Vector 和 Cube 单元之间的并行处理提升端到端效率.</p>
<p><strong>专用推理引擎优化.</strong> 我们适配了两个领先推理引擎 vLLM-Ascend 和 SGLang 以最大化硬件利用率:</p>
<ul>
<li><strong>异步调度</strong>: 在 vLLM 内,我们实现了重叠「Device-to-Host」(D2H)采样复制与下一步解码准备的机制,有效消除了调度「气泡」.</li>
<li><strong>上下文管理</strong>: RadixCache(前缀共享)和 Prefix Cache(将 KV 存储扩展到系统内存)等功能实现了 KV 条目的高效复用,这对长上下文性能至关重要.</li>
<li><strong>并行策略</strong>: 我们利用结合 Attention Data Parallelism(DP)和 MoE Expert Parallelism(EP)的混合方法,以及 FlashComm,将 AllReduce 操作拆分以将通信延迟隐藏在计算之后.</li>
<li><strong>Multi-Token Prediction(MTP)</strong>: 通过每推理步生成多个 token,我们显著增加了 NPU 计算密度并减少了总序列生成时间.</li>
</ul>
<p>通过这些硬件级协同优化,GLM-5 在单个国产节点上实现了与双 GPU 国际集群相当的性能,同时在长序列场景下将部署成本降低 50%.</p>
<blockquote>
<p><strong>[战略意义]</strong> 国产芯片适配的技术自主</p>
<p>GLM-5 的国产芯片全栈适配是中国 AI 基础设施自主化的一个重要里程碑.七个平台的适配不仅涉及「能跑」,更涉及「跑得好&quot;:从 W4A8 混合精度量化到定制融合内核,从异步调度到并行策略优化,每一项都是深度工程工作.特别值得注意的是 QuaRot 和 Flex_AWQ_SSZ 的使用——这些前沿量化技术原本主要研究于 NVIDIA 生态,GLM-5 将其成功移植到昇腾平台.单节点性能达到双国际 GPU 集群水平、长序列成本降低 50% 的数据,表明国产芯片在大模型推理场景下的竞争力已显著提升.这对于受国际供应链限制的部署场景具有战略价值.</p>
</blockquote>
<hr>
<h2 id="6-pg">6 评估</h2>
<h3 id="6-1-arc-jzpg">6.1 ARC 基准评估</h3>
<p>我们在表 7 中报告了 ARC 基准的主要结果,比较 GLM-5 与 GLM-4.7、DeepSeek-V3.2、Kimi-K2.5、Claude Opus 4.5、Gemini 3 Pro 和 GPT-5.2(xhigh).总体而言,GLM-5 相比 GLM-4.7 实现了显著提升,在开源模型中达到 SOTA 性能,缩小了与 Claude Opus 4.5 等专有模型的差距.</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GLM-5</th>
<th align="center">GLM-4.7</th>
<th align="center">DeepSeek-V3.2</th>
<th align="center">Kimi-K2.5</th>
<th align="center">Claude Opus 4.5</th>
<th align="center">Gemini 3 Pro</th>
<th align="center">GPT-5.2(xhigh)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">HLE</td>
<td align="center">30.5</td>
<td align="center">24.8</td>
<td align="center">25.1</td>
<td align="center">31.5</td>
<td align="center">28.4</td>
<td align="center"><strong>37.2</strong></td>
<td align="center"><u>35.4</u></td>
</tr>
<tr>
<td align="left">HLE(w/ Tools)</td>
<td align="center"><u>50.4</u></td>
<td align="center">42.8</td>
<td align="center">40.8</td>
<td align="center"><strong>51.8</strong></td>
<td align="center">43.4*</td>
<td align="center">45.8*</td>
<td align="center">45.5*</td>
</tr>
<tr>
<td align="left">AIME 2026 I</td>
<td align="center">92.7</td>
<td align="center"><u>92.9</u></td>
<td align="center">92.7</td>
<td align="center">92.5</td>
<td align="center"><strong>93.3</strong></td>
<td align="center">90.6</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">HMMT Feb. 2025</td>
<td align="center"><u>97.9</u></td>
<td align="center">97.1</td>
<td align="center">92.5</td>
<td align="center">95.4</td>
<td align="center">92.9</td>
<td align="center">97.3</td>
<td align="center"><strong>99.4</strong></td>
</tr>
<tr>
<td align="left">HMMT Nov. 2025</td>
<td align="center"><u>96.9</u></td>
<td align="center">93.5</td>
<td align="center">90.2</td>
<td align="center">91.1</td>
<td align="center">91.7</td>
<td align="center">93.0</td>
<td align="center"><strong>97.1</strong></td>
</tr>
<tr>
<td align="left">IMO-AnswerBench</td>
<td align="center">82.5</td>
<td align="center">82.0</td>
<td align="center">78.3</td>
<td align="center">81.8</td>
<td align="center">78.5</td>
<td align="center"><u>83.3</u></td>
<td align="center"><strong>86.3</strong></td>
</tr>
<tr>
<td align="left">GPQA-Diamond</td>
<td align="center">86.0</td>
<td align="center">85.7</td>
<td align="center">82.4</td>
<td align="center">87.6</td>
<td align="center">87.0</td>
<td align="center"><u>91.9</u></td>
<td align="center"><strong>92.4</strong></td>
</tr>
<tr>
<td align="left">LongBench v2</td>
<td align="center"><u>64.5</u></td>
<td align="center">59.1</td>
<td align="center">59.8</td>
<td align="center">61.0</td>
<td align="center">64.4</td>
<td align="center"><strong>68.2</strong></td>
<td align="center">59.8</td>
</tr>
<tr>
<td align="left">SWE-bench Verified</td>
<td align="center">77.8</td>
<td align="center">73.8</td>
<td align="center">73.1</td>
<td align="center">76.8</td>
<td align="center"><strong>80.9</strong></td>
<td align="center">76.2</td>
<td align="center"><u>80.0</u></td>
</tr>
<tr>
<td align="left">SWE-bench Multilingual</td>
<td align="center"><u>73.3</u></td>
<td align="center">66.7</td>
<td align="center">70.2</td>
<td align="center">73.0</td>
<td align="center"><strong>77.5</strong></td>
<td align="center">65.0</td>
<td align="center">72.0</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0(Terminus-2)</td>
<td align="center"><u>56.2</u>/60.7+</td>
<td align="center">41.0</td>
<td align="center">39.3</td>
<td align="center">50.8</td>
<td align="center"><strong>59.3</strong></td>
<td align="center">54.2</td>
<td align="center">54.0</td>
</tr>
<tr>
<td align="left">Terminal-Bench 2.0(Claude Code)</td>
<td align="center"><u>56.2</u>/61.1+</td>
<td align="center">32.8</td>
<td align="center">46.4</td>
<td align="center">-</td>
<td align="center"><strong>57.9</strong></td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">CyberGym</td>
<td align="center"><u>43.2</u></td>
<td align="center">23.5</td>
<td align="center">17.3</td>
<td align="center">41.3</td>
<td align="center"><strong>50.6</strong></td>
<td align="center">39.9</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">BrowseComp</td>
<td align="center"><strong>62.0</strong></td>
<td align="center">52.0</td>
<td align="center">51.4</td>
<td align="center"><u>60.6</u></td>
<td align="center">37.0</td>
<td align="center">37.8</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">BrowseComp(w/ CM)</td>
<td align="center"><strong>75.9</strong></td>
<td align="center">67.5</td>
<td align="center">67.6</td>
<td align="center"><u>74.9</u></td>
<td align="center">57.8</td>
<td align="center">59.2</td>
<td align="center">65.8</td>
</tr>
<tr>
<td align="left">BrowseComp-ZH</td>
<td align="center"><u>72.7</u></td>
<td align="center">66.6</td>
<td align="center">65.0</td>
<td align="center">62.3</td>
<td align="center">62.4</td>
<td align="center">66.8</td>
<td align="center"><strong>76.1</strong></td>
</tr>
<tr>
<td align="left"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>τ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\tau^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-Bench</td>
<td align="center">89.7</td>
<td align="center">87.4</td>
<td align="center">85.3</td>
<td align="center">80.2</td>
<td align="center"><strong>91.6</strong></td>
<td align="center"><u>90.7</u></td>
<td align="center">85.5</td>
</tr>
<tr>
<td align="left">MCP-Atlas(Public)</td>
<td align="center"><u>67.8</u></td>
<td align="center">52.0</td>
<td align="center">62.2</td>
<td align="center">63.8</td>
<td align="center">65.2</td>
<td align="center">66.6</td>
<td align="center"><strong>68.0</strong></td>
</tr>
<tr>
<td align="left">Tool-Decathlon</td>
<td align="center">39.2</td>
<td align="center">23.8</td>
<td align="center">35.2</td>
<td align="center">27.8</td>
<td align="center"><u>43.5</u></td>
<td align="center">36.4</td>
<td align="center"><strong>46.3</strong></td>
</tr>
<tr>
<td align="left">Vending-Bench 2</td>
<td align="center">\$4,432</td>
<td align="center">\$2,377</td>
<td align="center">\$1,034</td>
<td align="center">\$1,198</td>
<td align="center"><u>\$4,967</u></td>
<td align="center"><strong>\$5,478</strong></td>
<td align="center">\$3,591</td>
</tr>
<tr>
<td align="left">GDPval-AA Elo</td>
<td align="center"><u>1,409</u></td>
<td align="center">1,198</td>
<td align="center">1,195</td>
<td align="center">1,288</td>
<td align="center">1,400</td>
<td align="center">1,201</td>
<td align="center"><strong>1,462</strong></td>
</tr>
</tbody></table>
<p><em>注:标 * 的结果来自 HLE 完整集.标 + 的结果在修正了部分模糊指令的 Terminal-Bench 2.0 验证版本上评估.GDPval-AA Elo 分数记录于 2026 年 2 月 15 日.每行最高分加粗,次高分下划线.</em></p>
<p><strong>推理与通用基准.</strong> 对于 HLE,仅评估基于文本的子集,GPT-5.2(medium)作为 judge 模型.大多数推理任务以最大生成长度 131,072 token 评估,HLE-with-tools 使用 202,752 最大 token.</p>
<p>从表 7 看,GLM-5 在推理任务上取得了与强开源基线 Kimi-K2.5 相当的性能.与专有模型相比,GLM-5 在 HLE(with tools)上超越了 Claude Opus 4.5 和 Gemini 3 Pro.GLM-5 相比前代 GLM-4.7 在 HLE 基准(无论是否使用工具)上都取得了显著提升.在 HMMT Feb./Nov. 2025 基准上,GLM-5 优于 Claude Opus 4.5 和 Gemini 3 Pro.GLM-5 在长上下文任务上也取得了重大进步,在长上下文推理基准 LongBench v2 上取得了最高分,仅次于 Gemini 3 Pro.</p>
<p><strong>编码基准.</strong> 对于 SWE-bench Verified &amp; Multilingual,我们使用 OpenHands 框架并配合为 GLM-5 定制的指令提示.对于 Terminal-Bench 2.0,使用了两个 agent 框架(Terminus-2 和 Claude Code),我们还报告了修正部分模糊指令后的 Terminal-Bench 2.0 性能.CyberGym 基准在 Claude Code 2.1.18 中评估.</p>
<p>从表 7 看,GLM-5 在开源 LLM 中实现了编码基准的 SOTA 性能.与专有 LLM 相比,GLM-5 在 SWE-bench Verified 上优于 Gemini 3 Pro,在 SWE-bench Multilingual 上击败了 Gemini 3 Pro 和 GPT-5.2(xhigh).在 Terminal-Bench 2.0 上,GLM-5 取得了与 Claude Opus 4.5 相当的结果,修正该基准的模糊指令后甚至更好.为展示编码能力的泛化性,我们使用两个 agent 框架评估 Terminal-Bench 2.0,GLM-5 在两个框架上都展示了 consistent 的性能.在网络安全编码基准 CyberGym 上,GLM-5 相比 GLM-4.7 取得了显著提升,仅次于 Claude Opus 4.5.</p>
<p><strong>Agentic 能力基准.</strong> 对于 agentic 基准,我们在 BrowseComp、BrowseComp-ZH、<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>τ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\tau^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-Bench、MCP-Atlas、Tool-Decathlon、Vending-Bench 2 和 GDPval-AA 上评估 GLM-5 和前沿模型.BrowseComp 衡量语言 agent 如何通过浏览网页解决挑战性 problem.BrowseComp-ZH 主要面向中文网页.我们对 BrowseComp 使用 discard-all 策略作为上下文管理,与 DeepSeek-V3.2 和 Kimi K2.5 相同.<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>τ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\tau^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-Bench 评估对话 agent 在双控环境中的能力.MCP-Atlas 是真实世界工具使用基准,评估 LLM 在 MCP 服务器环境中的多步工作流表现.Tool-Decathlon 也是工具使用基准,但针对真实世界长期任务.Vending-Bench 2 衡量 LLM 在模拟环境中长期经营业务的 agentic 能力.GDPval 聚焦 AI agent 在经济有价值任务上的表现.</p>
<p>从表 7 看,GLM-5 相比 GLM-4.7 在 agentic 基准上显著提升.在 BrowseComp 上,GLM-5 在有无上下文管理的情况下都取得了前沿 LLM 中的 SOTA 性能.在 BrowseComp-ZH 上,GLM-5 也击败了 Claude Opus 4.5 和 Gemini 3 Pro.对于三个工具使用 agentic 任务(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>τ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\tau^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>-Bench、MCP-Atlas 和 Tool-Decathlon),GLM-5 取得了与 Claude Opus 4.5 相当的性能,展示了 GLM-5 强大的工具使用能力.GLM-5 在 Vending-Bench 2 上的表现(\$4,432)进一步展示了其商业任务的长期能力.在经济场景中,GLM-5 在 GDPval-AA 上优于 Claude Opus 4.5,仅次于 GPT-5.2(xhigh).</p>
<blockquote>
<p><strong>[性能解读]</strong> GLM-5 的 agentic 优势</p>
<p>从表 7 可以识别出 GLM-5 的几个显著优势领域:</p>
<ol>
<li><strong>BrowseComp</strong>: 62.0%(无 CM)和 75.9%(有 CM)均为 SOTA,远超 Claude Opus 4.5 的 37.0%/57.8%.这验证了 GLM-5 在搜索 agent 领域的训练投入(超过 10K 可验证环境、多层次上下文管理)的有效性.</li>
<li><strong>SWE-bench Multilingual</strong>: 73.3%,击败所有其他模型.这表明 GLM-5 的软件工程能力具有跨语言泛化性.</li>
<li><strong>CyberGym</strong>: 43.2%,显著领先 GLM-4.7(23.5%)和 DeepSeek-V3.2(17.3%).网络安全编码是一个 specialized 领域,GLM-5 的提升表明其编码训练覆盖了更广泛的安全相关场景.</li>
<li><strong>Terminal-Bench 2.0</strong>: 在修正模糊指令后达到 60.7-61.1%,接近 Claude Opus 4.5 的 59.3%.这说明 GLM-5 的终端操作能力已达到前沿水平.</li>
</ol>
<p>同时,GLM-5 在纯推理基准(AIME、GPQA-Diamond)上仍略低于 GPT-5.2(xhigh)和 Gemini 3 Pro,表明其优化重点偏向 agentic 和编码能力而非纯知识推理.</p>
</blockquote>
<h3 id="6-2-zssj-agentic-gctypg">6.2 真实世界 Agentic 工程体验评估</h3>
<p>真实世界体验比排行榜更重要.我们将内部 CC-Bench 升级到 CC-Bench-V2 以评估模型在真实 agentic 工程环境中跨前端、后端和长期任务完成端到端任务的能力.CC-Bench-V2 完全移除了人工标注,通过 Claude Code 和其他 agent harness 配合单元测试和 Agent-as-a-Judge 技术实现完全自动化.</p>
<p><strong>前端.</strong> 我们使用管道首先构建 agent 生成的前端项目并检查任何语法、依赖和兼容性错误.然后使用 Agent-as-a-Judge 通过 GUI agent 模拟用户交互来验证端到端正确性,GUI agent 配备 Playwright 和 bash 工具.</p>
<p><strong>后端.</strong> 任务来自 C++、Rust、Go、Java、TypeScript 和 Python 的真实世界开源项目,涵盖功能实现、bug 修复、回归修复和性能优化.每项变更必须在真实工程约束下通过完整的单元测试.</p>
<p><strong>长期.</strong> 我们首先评估模型在大型代码库上的信息检索能力——这是定位正确文件和理解项目上下文的前提,如同人类开发者一样.然后我们通过挖掘具有广泛 commit 历史的已合并 Pull Request 并将其 commit 聚类为连贯任务链来评估端到端正确性.Agent 顺序执行这些链,测试其维持上下文和解决阶段间依赖的能力.评估结合单元测试和 Agent-as-a-Judge 来验证功能正确性和语义遵循.</p>
<table>
<thead>
<tr>
<th align="left">类别</th>
<th align="left">任务</th>
<th align="center">指标</th>
<th align="center">GLM-5</th>
<th align="center">GLM-4.7</th>
<th align="center">Claude Opus 4.5</th>
</tr>
</thead>
<tbody><tr>
<td align="left">前端</td>
<td align="left">HTML</td>
<td align="center">ISR</td>
<td align="center">38.9</td>
<td align="center">35.4</td>
<td align="center"><strong>52.2</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">CSR</td>
<td align="center">76.3</td>
<td align="center">64.9</td>
<td align="center"><strong>82.2</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">React</td>
<td align="center">ISR</td>
<td align="center">34.6</td>
<td align="center">17.2</td>
<td align="center"><strong>39.7</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">CSR</td>
<td align="center"><strong>71.0</strong></td>
<td align="center">49.4</td>
<td align="center">70.7</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Vue</td>
<td align="center">ISR</td>
<td align="center">32.7</td>
<td align="center">24.5</td>
<td align="center"><strong>46.9</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">CSR</td>
<td align="center"><strong>77.1</strong></td>
<td align="center">53.8</td>
<td align="center">74.3</td>
</tr>
<tr>
<td align="left">构建</td>
<td align="left">React</td>
<td align="center">BSR</td>
<td align="center"><strong>100</strong></td>
<td align="center">65.0</td>
<td align="center">95.0</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Vue</td>
<td align="center">BSR</td>
<td align="center"><strong>100</strong></td>
<td align="center">70.0</td>
<td align="center"><strong>100</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Svelte</td>
<td align="center">BSR</td>
<td align="center"><strong>100</strong></td>
<td align="center">60.0</td>
<td align="center">90.0</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Next.js</td>
<td align="center">BSR</td>
<td align="center">95.0</td>
<td align="center">70.0</td>
<td align="center">80.0</td>
</tr>
<tr>
<td align="left">后端</td>
<td align="left">Engineering</td>
<td align="center">Pass@1</td>
<td align="center">25.8</td>
<td align="center">19.6</td>
<td align="center"><strong>26.9</strong></td>
</tr>
<tr>
<td align="left">长期</td>
<td align="left">Repo Exploration</td>
<td align="center">Pass@1</td>
<td align="center"><strong>65.6</strong></td>
<td align="center">47.8</td>
<td align="center">64.5</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Chained Tasks</td>
<td align="center">Pass@1</td>
<td align="center">52.3</td>
<td align="center">43.0</td>
<td align="center"><strong>61.6</strong></td>
</tr>
</tbody></table>
<p><em>BSR: Build Success Rate; ISR: Instance Success Rate; CSR: Check-item Success Rate.</em></p>
<h4 id="6-2-1-qdpg-agent-as-a-judge">6.2.1 前端评估 -- Agent-as-a-Judge</h4>
<p>我们开发了一个全面的自动化评估基准,专门为前端开发场景设计.该基准覆盖开发者日常构建的多样化应用,包括落地页、管理仪表盘、数据可视化、图形和动画、在线生产力工具、交互式游戏和表单驱动工作流,跨越主流技术栈包括 HTML、React、Vue、Svelte 和 Next.js.</p>
<p>每个测试用例由一个包含多个具体可实施规范的 <em>Task</em> 和一个 <em>Checklist</em> 组成,其中每个检查项直接派生自相应规范.评估过程遵循两阶段管道:1) <strong>静态验证</strong>: 我们首先验证生成的代码是否成功构建和运行. 2) <strong>Agent-as-a-Judge</strong>: 对于正确执行的代码,我们使用 GUI agent 模拟人类测试行为来交互式验证每个检查项并根据需求满足度评分.</p>
<p>我们定义以下指标: <em>Build Success Rate(BSR)</em> 衡量成功初始化和运行的项目比例. <em>Instance Success Rate(ISR)</em> 衡量通过所有相关规范的项目比例. <em>Check-item Success Rate(CSR)</em> 衡量所有检查项的细粒度完成率.</p>
<p><strong>Agent-as-a-Judge.</strong> 前端正确性 inherently 是视觉和交互性的——bug 通常只在用户点击按钮或调整窗口大小时才会显现,使得静态分析和固定测试套件不足.因此我们引入 Agent-as-a-Judge(图 9):每个生成的项目在 Docker 容器中部署并构建以验证静态正确性.成功构建的实例然后交给一个自主 Judge Agent(配备 Playwright MCP 工具的 Claude Code with Claude Sonnet 4.5),该 agent 在闭环循环中操作:对于每个检查项,agent 读取源代码、与实时 UI 交互(点击、按键、截图)、检查终端输出并渲染通过/失败裁决.</p>
<blockquote>
<p>图 9: Agent-as-a-Judge 评估管道.数据来源:原文 Figure 9.</p>
</blockquote>
<p>为验证可靠性,我们将 Agent-as-a-Judge 裁决与独立人类专家判断沿两个维度进行比较.对于 <em>点级一致性</em>,我们采样 130 个检查项,让人类专家独立评分并与 agent 裁决比较:两者在 94% 的项上达成一致,分歧集中在主观视觉质量标准而非功能规范.对于 <em>排序一致性</em>,我们使用自动化框架和人类专家评估 8 个前沿模型(Claude Sonnet 4.5、Claude Opus 4.5、Gemini 3 Pro、GLM-4.7、DeepSeek-V3.2 等).结果模型排序达到 85.7% 的 Spearman 相关性,表明强正相关.</p>
<p>如表 8 所示,GLM-5 实现 98.0% BSR 并在 CSR 上与 Claude Opus 4.5 竞争,但所有三个技术栈上都存在显著的 ISR 差距,表明 GLM-5 满足大多数单独要求,但在端到端完成整个任务方面仍落后于 Claude Opus 4.5.</p>
<h4 id="6-2-2-hdpg">6.2.2 后端评估</h4>
<p>后端评估衡量编码 agent 是否能在真实工程约束下对真实世界服务端代码库做出正确、测试通过的修改.我们精选了 85 个任务,跨越六种语言(Python、Go、C++、Rust、Java 和 TypeScript),涵盖搜索引擎、数据库引擎、web 框架、AI 推理服务、知识管理系统和独立算法与系统编程挑战等域.任务类型包括功能实现、bug 修复、回归修复和性能优化,反映了日常后端开发的多样性.</p>
<p>为实现完全自动化评估,每个任务配备人工设计的单元测试(每任务 5-10 个),验证功能正确性和边界情况处理.任务以 terminal-bench 风格打包:每个在从项目实际构建环境初始化的 Docker 容器中运行,agent 接收描述所需变更的自然语言问题陈述.我们报告 Pass@1,其中任务仅当所有相关单元测试通过时才被视为解决.严格的 all-or-nothing 标准使该基准特别具有挑战性:GLM-5 和 Claude Opus 4.5 表现相当(表 8),两者都显著领先 GLM-4.7.</p>
<h4 id="6-2-3-cqpg">6.2.3 长期评估</h4>
<p>长期评估针对区分生产级 agentic 工程与单轮 vibe coding 的能力:在大型代码库中导航和执行多步开发,其中每个动作重塑后续动作的上下文.我们将其分解为两个互补任务.</p>
<p><strong>大型仓库探索.</strong> 任何非平凡编码任务的前提是在大型、不熟悉的仓库中定位正确的源文件.我们在包含数万个文件的真实高星 GitHub 仓库上构建自动化基准.每个问题以自然、面向用户的语言在业务语义层面表述,严格避免提及任何文件名、类名或函数名.此外,问题需要从面向用户的描述到实际实现的一到两跳逻辑推理——例如,关于生成视频中唇形同步不一致的问题映射到视频生成后端内部的参数调优块.目标文件被选择以最大化导航难度:它们位于至少三层目录深度之下,携带抵抗基于关键词搜索的晦涩名称,实现仓库中其他地方未重复的独特功能,且位于其主要功能表面之外.我们报告三次运行的平均 Pass@1,其中问题仅在 agent 探索期间成功读取目标文件时才被视为解决.在此任务中,GLM-5 优于 Claude Opus 4.5(表 8),两者都远领先 GLM-4.7.结果表明有效的仓库探索更少依赖原始代码生成能力,更多依赖策略性搜索——即通过目录级推理和语义关联迭代缩小文件空间——GLM-5 在 agentic 工具使用轨迹上的训练提供了明显优势.</p>
<p><strong>多步链式任务.</strong> 主流编码基准如 SWE-bench 将评估简化为单提交、孤立编辑,因此无法评估 agent 执行增量开发的能力——其中每一步改变代码库状态以影响后续步骤.为解决此问题,我们通过挖掘高质量仓库的已合并 Pull Request 并通过以下管道组装任务链来构建长期基准:</p>
<ol>
<li><strong>PR 过滤</strong>: 仅保留包含测试、包含 3-15 个 commit、遵循线性(非合并)历史的已合并 PR.</li>
<li><strong>语义分组</strong>: LLM 对相邻 commit 的成对语义相关性评分;动态规划找到最优分区为连贯任务组,在保持 commit 顺序的同时最大化组内一致性.</li>
<li><strong>补丁分类</strong>: 每个任务的累积 diff 分为三类: <em>golden patch</em>(agent 必须产生的核心代码)、<em>test patch</em>(验证测试)和 <em>auto-apply patch</em>(自动应用的配置和 fixtures).</li>
<li><strong>问题陈述生成</strong>: LLM 从每个任务的补丁和 commit 消息生成自然语言问题陈述.</li>
<li><strong>任务分类</strong>: 任务被自动分类(功能/bug 修复/重构/测试/配置)并沿三个轴评估:错误消除、关键路径准确性和测试通过.</li>
<li><strong>环境验证</strong>: 构建 Docker 环境并应用 golden patch 以验证整个链上的零回归.</li>
</ol>
<p>给定 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 个任务链,agent 从基线 commit 开始顺序工作:完成任务 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 后,其变更被提交,任务 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">k+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 的 auto-apply patch 被应用,因此代码库状态累积演化.评估依次检查每个 commit 并在运行完整测试套件前累积应用任务 1 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 的测试补丁,捕获当前任务的失败和早期任务的回归.我们报告单个任务的 Pass@1.这种链式和状态递归设计直接评估了单提交基准未测试的长期上下文跟踪、规划和增量开发能力.如表 8 所示,GLM-5 相比 GLM-4.7 有 substantial 提升,但与 Claude Opus 4.5 仍有显著差距.这是因为错误在链中累积:一个任务中的次优编辑可能 silently 破坏后续任务中的测试.缩小这一差距需要长期上下文一致性和长期自我纠正的进展,两者都是我们正在进行的研究的活跃领域.</p>
<h4 id="6-2-4-yh-swe-rwpg">6.2.4 演化 SWE 任务评估</h4>
<p>我们在 SWE-rebench 上评估,因为 SWE-bench Verified 是静态、公开的、人工验证的测试集,已发布超过 2 年.相比之下,SWE-rebench 基于自动化管道持续挖掘新的、真实的 GitHub issue-fixing 任务,实现了去污染的、时间稳健的评估,更好地衡量对新软件工程问题的泛化能力而非对静态基准的性能.表 9 显示了 GLM-5 在 SWE-rebench 上的官方性能,我们观察到 GLM-5 能有效泛化到新的 SWE 问题.</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">解决率(%)</th>
<th align="center">解决率 SEM(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>±</mo></mrow><annotation encoding="application/x-tex">\\pm</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord">±</span></span></span></span>,%)</th>
<th align="center">Pass@5(%)</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Claude Opus 4.6</td>
<td align="center">52.9%</td>
<td align="center">1.06%</td>
<td align="center">70.8%</td>
</tr>
<tr>
<td align="left">GPT-5.2(xhigh)</td>
<td align="center">51.7%</td>
<td align="center">1.21%</td>
<td align="center">58.3%</td>
</tr>
<tr>
<td align="left">Claude Sonnet 4.5</td>
<td align="center">47.1%</td>
<td align="center">1.69%</td>
<td align="center">60.4%</td>
</tr>
<tr>
<td align="left">Gemini 3 Pro</td>
<td align="center">46.7%</td>
<td align="center">2.04%</td>
<td align="center">58.3%</td>
</tr>
<tr>
<td align="left">Claude Opus 4.5</td>
<td align="center">43.8%</td>
<td align="center">0.93%</td>
<td align="center">58.3%</td>
</tr>
<tr>
<td align="left">GLM-5</td>
<td align="center">42.1%</td>
<td align="center">1.21%</td>
<td align="center">50.0%</td>
</tr>
<tr>
<td align="left">GLM-4.7</td>
<td align="center">41.3%</td>
<td align="center">2.12%</td>
<td align="center">56.3%</td>
</tr>
<tr>
<td align="left">Kimi K2.5</td>
<td align="center">37.9%</td>
<td align="center">1.21%</td>
<td align="center">50.0%</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[数据实验]</strong> SWE-rebench 的启示</p>
<p>SWE-rebench 的结果揭示了一个重要现象:在静态 SWE-bench Verified 上领先的模型(如 GLM-5 的 77.8%),在持续更新的 SWE-rebench 上排名下降(42.1%,第 6 名).这种差距反映了数据污染问题:SWE-bench Verified 的测试集已存在 2 年以上,许多开源模型的预训练数据可能包含了这些仓库的代码和 issue.GLM-4.7 在 SWE-rebench 上的 Pass@5(56.3%)甚至高于 GLM-5(50.0%),这是一个异常信号——可能表明 GLM-5 在静态基准上的优化某种程度上牺牲了泛化能力,或者 GLM-4.7 的训练数据时间分布更接近 SWE-rebench 的 2026 年 1 月采样点.无论如何,SWE-rebench 的结果提醒我们:静态基准分数需要谨慎解读,真实世界的泛化能力才是最终检验.</p>
</blockquote>
<h3 id="6-3-zssjtynlpg">6.3 真实世界通用能力评估</h3>
<p>虽然标准化学术基准提供有用信号,但它们未完全捕捉模型在实践中的使用方式.为识别这一差距,我们在从部署设置中观察到的高频用户交互模式衍生的一组真实世界通用能力上评估 GLM-5.这些能力包括机器翻译、多语言对话、指令遵循、世界知识和工具调用.</p>
<p>不同于传统以基准为中心的评估,我们的目标是衡量直接转化为用户感知质量提升的改进.对于每项能力,我们采用内部人工评估、内部自动化评估、外部人工评估和外部自动化基准的组合,确保诊断粒度和跨模型可比性.使用外部基准时,我们优先选择反映真实交互模式而非 narrowly 构建测试分布的数据集.</p>
<p>图 10 呈现了 GLM-5 和 GLM-4.7 在五个真实世界能力域上的对比结果.在所有评估维度上,GLM-5 在机器翻译、多语言对话、指令遵循、世界知识和工具调用方面展示了 consistent 的改进.</p>
<blockquote>
<p>图 10: GLM-4.7 和 GLM-5 在五个真实世界通用能力域上的性能对比.数据来源:原文 Figure 10.</p>
</blockquote>
<p><strong>机器翻译.</strong> ZMultiTransBench 内部数据集包含 1,220 个样本,涵盖七个语言对:中到西(300)、俄(250)、法(220)、韩(200)、日(150)、阿(50)和德(50).MENT-SNS 采用 MENT 的源句子,包含 753 个英-中句对,跨越社交网络、跨文化、诗歌和文学四个域.</p>
<p><strong>多语言对话.</strong> LMArena Elo 评分来自大规模社区提交的两两比较.ZMultiDialBench 内部多语言对话基准包含 141 个精选实例.</p>
<p><strong>指令遵循.</strong> IF-Badcase 从生产环境中真实用户报告的指令遵循失败案例构建,包含 450 个测试实例.IF-Bench 评估 LLM 遵循复杂客观约束的能力.MultiChallenge 通过真实多轮对话场景考察 LLM.</p>
<p><strong>世界知识.</strong> SimpleQA 使用具有单一无可争议答案的挑战性问题测量短形式事实性.Chinese SimpleQA 将方法适配到中文语境,跨越六个主要域和 99 个子主题.</p>
<p><strong>工具调用.</strong> ToolCall-Badcase 从生产环境中用户报告的工具调用失败案例构建,包含 200 个精选测试案例.</p>
<hr>
<h2 id="7-jl">7 结论</h2>
<p>在本报告中,我们介绍了 GLM-5,这是一款下一代基础模型,从根本上桥接了高性能推理与极端计算效率之间的差距.通过从「vibe coding」范式过渡到真正的「agentic engineering」,GLM-5 证明了开放权重模型现在可以在复杂、真实世界工作流中媲美顶级专有系统的能力.</p>
<p>GLM-5 代表了实用 AI 效用的范式转变.通过开源模型,我们旨在赋能社区超越静态基准,探索高效、agentic 通用智能的前沿, foster 一个新时代,其中 AI agent 自主规划、实现和迭代复杂任务.</p>
<blockquote>
<p><strong>[局限性]</strong> GLM-5 的已知局限</p>
<p>尽管 GLM-5 取得了显著进步,仍存在一些值得关注的局限:</p>
<ol>
<li><strong>端到端任务完成率</strong>: 在前端开发中,GLM-5 的 ISR(Instance Success Rate)仍显著低于 Claude Opus 4.5(如 React ISR 34.6% vs 39.7%),表明在完整实现复杂需求方面仍有差距.</li>
<li><strong>链式任务误差累积</strong>: 在多步链式任务中,GLM-5(52.3%)与 Claude Opus 4.5(61.6%)存在显著差距,误差在链中累积的问题尚未解决.</li>
<li><strong>纯推理基准</strong>: 在 AIME 2026、GPQA-Diamond 等纯推理基准上,GLM-5 仍略低于 GPT-5.2(xhigh)和 Gemini 3 Pro,表明其优化重点偏向 agentic 能力.</li>
<li><strong>SWE-rebench 泛化</strong>: 在持续更新的 SWE-rebench 上,GLM-5 的排名低于静态 SWE-bench Verified,提示可能存在一定程度的静态基准过拟合.</li>
</ol>
</blockquote>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-ccs">A. 超参数</h3>
<p>GLM-5 模型架构相关超参数见上文表 1(GLM-4.5 vs GLM-5 架构对比).</p>
<p>训练方面,我们遵循 GLM-4.5 的设置,包括 Muon optimizer、cosine decay 和 batch size warmup.学习率从 0 经过 warmup 阶段到 2e-4,然后衰减阶段到 4e-5 直到预训练阶段结束.在 mid-training 阶段,学习率从 4e-5 线性下降到 1e-5.其他超参数与 GLM-4.5 相同.DSA warmup 阶段,学习率从 5e-3 下降到 2e-4.DSA 稀疏适配阶段,我们使用 1e-5 的恒定学习率.</p>
<h3 id="b-jzmxpg">B. 基座模型评估</h3>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GLM-5-Base</th>
<th align="center">GLM-4.5-Base</th>
<th align="center">Qwen3-235B-A22B</th>
<th align="center">DeepSeek-V3-Base</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">81.4</td>
<td align="center">77.6</td>
<td align="center">81.5</td>
<td align="center">75.4</td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">78.9</td>
<td align="center">74.0</td>
<td align="center">76.7</td>
<td align="center">66.1</td>
</tr>
<tr>
<td align="left">CMMLU</td>
<td align="center">78.6</td>
<td align="center">76.2</td>
<td align="center">76.8</td>
<td align="center">68.1</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">89.7</td>
<td align="center">82.4</td>
<td align="center">90.1</td>
<td align="center">83.2</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">56.2</td>
<td align="center">48.8</td>
<td align="center">55.3</td>
<td align="center">48.4</td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">84.8</td>
<td align="center">79.3</td>
<td align="center">82.5</td>
<td align="center">77.4</td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">80.5</td>
<td align="center">75.0</td>
<td align="center">79.2</td>
<td align="center">75.4</td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">79.3</td>
<td align="center">73.2</td>
<td align="center">77.5</td>
<td align="center">71.5</td>
</tr>
</tbody></table>
<hr>
<h2 id="syb">术语表</h2>
<table>
<thead>
<tr>
<th align="left">术语</th>
<th align="left">解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">ARC</td>
<td align="left">Agentic, Reasoning, Coding — GLM-5 的三大核心能力维度</td>
</tr>
<tr>
<td align="left">DSA</td>
<td align="left">DeepSeek Sparse Attention, DeepSeek 稀疏注意力机制</td>
</tr>
<tr>
<td align="left">MLA</td>
<td align="left">Multi-latent Attention, 多头潜在注意力</td>
</tr>
<tr>
<td align="left">GQA</td>
<td align="left">Grouped-Query Attention, 分组查询注意力</td>
</tr>
<tr>
<td align="left">MTP</td>
<td align="left">Multi-token Prediction, 多 token 预测</td>
</tr>
<tr>
<td align="left">Muon Split</td>
<td align="left">将投影矩阵按头拆分并分别正交化的优化技术</td>
</tr>
<tr>
<td align="left">TITO</td>
<td align="left">Token-in-Token-out, 训练管道直接消费 token ID 而非文本</td>
</tr>
<tr>
<td align="left">PD 解聚</td>
<td align="left">Prefill-Decode Disaggregation, 将预填充和解码分配到专用资源</td>
</tr>
<tr>
<td align="left">IcePop</td>
<td align="left">缓解训练-推理不匹配的 RL 技术</td>
</tr>
<tr>
<td align="left">GRPO</td>
<td align="left">Group Relative Policy Optimization, 组相对策略优化</td>
</tr>
<tr>
<td align="left">ORM</td>
<td align="left">Outcome Reward Model, 结果奖励模型</td>
</tr>
<tr>
<td align="left">GRM</td>
<td align="left">Generative Reward Model, 生成奖励模型</td>
</tr>
<tr>
<td align="left">SWE</td>
<td align="left">Software Engineering, 软件工程</td>
</tr>
<tr>
<td align="left">WKG</td>
<td align="left">Web Knowledge Graph, 网络知识图谱</td>
</tr>
<tr>
<td align="left">CM</td>
<td align="left">Context Management, 上下文管理</td>
</tr>
<tr>
<td align="left">BSR/ISR/CSR</td>
<td align="left">Build/Instance/Check-item Success Rate, 构建/实例/检查项成功率</td>
</tr>
<tr>
<td align="left">QAT</td>
<td align="left">Quantization-Aware Training, 量化感知训练</td>
</tr>
<tr>
<td align="left">slime</td>
<td align="left">GLM-5 的统一后训练基础设施框架</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>Pony Alpha 彩蛋</strong></p>
<p>GLM-5 团队进行了一个名为 <strong>「Pony Alpha」</strong> 的实验:匿名在 OpenRouter 上发布 GLM-5,让模型本身的能力说话.几天内,Pony Alpha 成为 sensation.开发者注意到其在复杂编码任务、agentic 工作流和角色扮演场景中的卓越表现.猜测四起,25% 的用户猜测是 Claude Sonnet 5,20% 猜测是 DeepSeek,10% 猜测是 Grok.GLM-5 的确认有效消除了对中国 LLM 能否竞争前沿水平的怀疑.Pony Alpha 的成功不仅关乎原始基准;它标志着向工程级可靠性的焦点转移.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-yxl","text":"2 预训练"},{"level":3,"id":"2-1-jg","text":"2.1 架构"},{"level":4,"id":"2-1-1-mxgmkz","text":"2.1.1 模型规模扩展"},{"level":4,"id":"2-1-2-multi-latent-attention","text":"2.1.2 Multi-latent Attention"},{"level":4,"id":"2-1-3-multi-token-prediction-with-parameter-sharing","text":"2.1.3 Multi-token Prediction with Parameter Sharing"},{"level":3,"id":"2-2-jy-dsa-dcxyxl","text":"2.2 基于 DSA 的持续预训练"},{"level":3,"id":"2-3-gxzylbtdxrsy","text":"2.3 高效注意力变体的消融实验"},{"level":3,"id":"2-4-yxlsj","text":"2.4 预训练数据"},{"level":3,"id":"2-5-mid-training","text":"2.5 Mid-Training"},{"level":3,"id":"2-6-xljcss","text":"2.6 训练基础设施"},{"level":4,"id":"2-6-1-ncxs","text":"2.6.1 内存效率"},{"level":4,"id":"2-6-2-bhxs","text":"2.6.2 并行效率"},{"level":4,"id":"2-6-3-int4-lhgzxl","text":"2.6.3 INT4 量化感知训练"},{"level":2,"id":"3-hxl","text":"3 后训练"},{"level":3,"id":"3-1-jdwt-sft","text":"3.1 监督微调(SFT)"},{"level":3,"id":"3-2-reasoning-rl","text":"3.2 Reasoning RL"},{"level":3,"id":"3-3-agentic-rl","text":"3.3 Agentic RL"},{"level":3,"id":"3-4-general-rl","text":"3.4 General RL"},{"level":3,"id":"3-5-on-policy-cross-stage-distillation","text":"3.5 On-Policy Cross-Stage Distillation"},{"level":3,"id":"3-6-slime-kj-rl-xljcss","text":"3.6 slime 框架: RL 训练基础设施"},{"level":4,"id":"3-6-1-kz-tggdkdzd-rollout-sxlhxl","text":"3.6.1 扩展:通过高度可定制的 Rollout 实现灵活训练"},{"level":4,"id":"3-6-2-kz-rl-rollout-dwycyh","text":"3.6.2 扩展:RL Rollout 的尾延迟优化"},{"level":4,"id":"3-6-3-rollout-robustness-xtqddrc","text":"3.6.3 Rollout Robustness: 心跳驱动的容错"},{"level":2,"id":"4-agentic-engineering","text":"4 Agentic Engineering"},{"level":3,"id":"4-1-mx-agentic-rwdyb-rl","text":"4.1 面向 Agentic 任务的异步 RL"},{"level":4,"id":"4-1-1-mx-agentic-xldyb-rl-sj","text":"4.1.1 面向 Agentic 训练的异步 RL 设计"},{"level":4,"id":"4-1-2-yhybxlwdx","text":"4.1.2 优化异步训练稳定性"},{"level":3,"id":"4-2-agent-hjkz","text":"4.2 Agent 环境扩展"},{"level":4,"id":"4-2-1-rjgc-swe-hj","text":"4.2.1 软件工程(SWE)环境"},{"level":4,"id":"4-2-2-zdhj","text":"4.2.2 终端环境"},{"level":4,"id":"4-2-3-ssrw","text":"4.2.3 搜索任务"},{"level":3,"id":"4-3-ss-agent-dtlysxwgl","text":"4.3 搜索 Agent 的推理与上下文管理"},{"level":3,"id":"4-4-hdpsc","text":"4.4 幻灯片生成"},{"level":2,"id":"5-gcxpjcsssp","text":"5 国产芯片基础设施适配"},{"level":2,"id":"6-pg","text":"6 评估"},{"level":3,"id":"6-1-arc-jzpg","text":"6.1 ARC 基准评估"},{"level":3,"id":"6-2-zssj-agentic-gctypg","text":"6.2 真实世界 Agentic 工程体验评估"},{"level":4,"id":"6-2-1-qdpg-agent-as-a-judge","text":"6.2.1 前端评估 -- Agent-as-a-Judge"},{"level":4,"id":"6-2-2-hdpg","text":"6.2.2 后端评估"},{"level":4,"id":"6-2-3-cqpg","text":"6.2.3 长期评估"},{"level":4,"id":"6-2-4-yh-swe-rwpg","text":"6.2.4 演化 SWE 任务评估"},{"level":3,"id":"6-3-zssjtynlpg","text":"6.3 真实世界通用能力评估"},{"level":2,"id":"7-jl","text":"7 结论"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-ccs","text":"A. 超参数"},{"level":3,"id":"b-jzmxpg","text":"B. 基座模型评估"},{"level":2,"id":"syb","text":"术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.6-glm/08-glm-5/01-glm-5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.6-glm/08-glm-5/01-glm-5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">GLM-5: from Vibe Coding to Agentic Engineering 技术报告精译</h1>
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
