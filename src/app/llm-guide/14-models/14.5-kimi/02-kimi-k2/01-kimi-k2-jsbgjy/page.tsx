"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi K2: Open Agentic Intelligence 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">返回 14.5-Kimi 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: Kimi K2: Open Agentic Intelligence (arXiv:2507.20534v2)
原文链接: <a href="https://arxiv.org/abs/2507.20534">https://arxiv.org/abs/2507.20534</a>
发布日期: 2025.07 (v1), 2026.02 (v2)
发布机构: Moonshot AI, Kimi Team
开源协议: 模型权重开放下载 (MIT-style)</p>
</blockquote>
<hr>
<h2 id="ml">目录</h2>
<ul>
<li><a href="#%E6%91%98%E8%A6%81">摘要</a></li>
<li><a href="#1-%E5%BC%95%E8%A8%80">1 引言</a></li>
<li><a href="#2-%E9%A2%84%E8%AE%AD%E7%BB%83">2 预训练</a><ul>
<li><a href="#21-muonclip-%E5%9F%BA%E4%BA%8E%E6%9D%83%E9%87%8D%E8%A3%81%E5%89%AA%E7%9A%84%E7%A8%B3%E5%AE%9A%E8%AE%AD%E7%BB%83">2.1 MuonClip: 基于权重裁剪的稳定训练</a></li>
<li><a href="#22-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%95%B0%E6%8D%AE-%E9%80%9A%E8%BF%87%E6%94%B9%E5%86%99%E6%8F%90%E5%8D%87-token-%E6%95%88%E7%94%A8">2.2 预训练数据: 通过改写提升 Token 效用</a></li>
<li><a href="#23-%E6%A8%A1%E5%9E%8B%E6%9E%B6%E6%9E%84">2.3 模型架构</a></li>
<li><a href="#24-%E8%AE%AD%E7%BB%83%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD">2.4 训练基础设施</a></li>
<li><a href="#25-%E8%AE%AD%E7%BB%83%E9%85%8D%E6%96%B9">2.5 训练配方</a></li>
</ul>
</li>
<li><a href="#3-%E5%90%8E%E8%AE%AD%E7%BB%83">3 后训练</a><ul>
<li><a href="#31-%E7%9B%91%E7%9D%A3%E5%BE%AE%E8%B0%83sft">3.1 监督微调(SFT)</a><ul>
<li><a href="#311-%E9%9D%A2%E5%90%91%E5%B7%A5%E5%85%B7%E4%BD%BF%E7%94%A8%E5%AD%A6%E4%B9%A0%E7%9A%84%E5%A4%A7%E8%A7%84%E6%A8%A1-agentic-%E6%95%B0%E6%8D%AE%E5%90%88%E6%88%90">3.1.1 面向工具使用学习的大规模 Agentic 数据合成</a></li>
</ul>
</li>
<li><a href="#32-%E5%BC%BA%E5%8C%96%E5%AD%A6%E4%B9%A0rl">3.2 强化学习(RL)</a><ul>
<li><a href="#321-%E5%8F%AF%E9%AA%8C%E8%AF%81%E5%A5%96%E5%8A%B1%E8%AE%AD%E7%BB%83%E5%9C%BAverifiable-rewards-gym">3.2.1 可验证奖励训练场(Verifiable Rewards Gym)</a></li>
<li><a href="#322-%E8%B6%85%E8%B6%8A%E9%AA%8C%E8%AF%81-%E8%87%AA%E6%89%B9%E5%88%A4%E8%AF%84%E5%88%86%E5%A5%96%E5%8A%B1self-critique-rubric-reward">3.2.2 超越验证: 自批判评分奖励(Self-Critique Rubric Reward)</a></li>
<li><a href="#323-rl-%E7%AE%97%E6%B3%95">3.2.3 RL 算法</a></li>
</ul>
</li>
<li><a href="#33-rl-%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD">3.3 RL 基础设施</a></li>
</ul>
</li>
<li><a href="#4-%E8%AF%84%E4%BC%B0">4 评估</a><ul>
<li><a href="#41-%E5%90%8E%E8%AE%AD%E7%BB%83%E8%AF%84%E4%BC%B0">4.1 后训练评估</a></li>
<li><a href="#42-%E9%A2%84%E8%AE%AD%E7%BB%83%E8%AF%84%E4%BC%B0">4.2 预训练评估</a></li>
<li><a href="#43-%E5%AE%89%E5%85%A8%E8%AF%84%E4%BC%B0">4.3 安全评估</a></li>
</ul>
</li>
<li><a href="#5-%E5%B1%80%E9%99%90%E6%80%A7">5 局限性</a></li>
<li><a href="#6-%E7%BB%93%E8%AE%BA">6 结论</a></li>
<li><a href="#%E8%87%B4%E8%B0%A2">致谢</a></li>
<li><a href="#%E5%8F%82%E8%80%83%E6%96%87%E7%8C%AE">参考文献</a></li>
<li><a href="#%E9%99%84%E5%BD%95">附录</a></li>
</ul>
<hr>
<h2 id="zy">摘要</h2>
<p>我们推出 Kimi K2,一款 Mixture-of-Experts (MoE,混合专家) 大语言模型,拥有 320 亿激活参数和 1 万亿总参数.我们提出 MuonClip 优化器,它在 Muon 的基础上引入了一种新颖的 QK-Clip 技术,在保留 Muon 先进 token 效率的同时解决了训练不稳定性问题.基于 MuonClip,K2 在 15.5 万亿 token 上完成预训练,全程零损失尖峰.在后训练阶段,K2 经历了一个多阶段的后训练流程,其核心亮点在于一个大规模的 agentic 数据合成流水线和一个联合强化学习(RL)阶段,模型通过与真实和合成环境的交互来提升自身能力.</p>
<p>Kimi K2 在非思考模型中取得了 SOTA 性能,尤其在 agentic 能力方面表现突出.具体而言,K2 在 Tau2-Bench 上获得 66.1 分,在 ACEBench (En) 上获得 76.5 分,在 SWE-Bench Verified 上获得 65.8 分,在 SWE-Bench Multilingual 上获得 47.3 分——在非思考设置下超越了大多数开源和闭源基线模型.它在编程、数学和推理任务上也展现出强劲能力:LiveCodeBench v6 得分 53.7,AIME 2025 得分 49.5,GPQA-Diamond 得分 75.1,OJBench 得分 27.1,均无需扩展思考模式.这些结果使 Kimi K2 成为迄今为止能力最强的开源大语言模型之一,尤其在软件工程和 agentic 任务方面.我们开放了基座模型和后训练Checkpoint,以促进 agentic 智能的未来研究和应用.</p>
<blockquote>
<p><strong>[数据与实验]</strong> 性能数字的横向对比视角</p>
<p>摘要中给出的数字需要放在正确的比较维度下理解.论文强调「非思考设置」(non-thinking setting),这意味着模型不进行链式思考(Chain-of-Thought)或测试时计算扩展.在这个约束下,K2 的 SWE-bench Verified 65.8% 和 SWE-bench Multilingual 47.3% 确实显著超越了 DeepSeek-V3-0324(38.8% / 25.8%)和 Qwen3-235B-A22B(34.4% / 20.9%).但值得注意的是,Claude 4 Sonnet 在 SWE-bench Verified 上仍领先(72.7%),说明闭源模型在 agentic 软件工程上仍有一定优势.K2 的真正突破在于将开源模型的 agentic 能力提升到接近闭源前沿的水平.</p>
</blockquote>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>大语言模型(LLM)的发展正在经历一场深刻的范式转变,朝向 Agentic Intelligence(智能体智能)演进——即模型在复杂动态环境中自主感知、规划、推理和行动的能力.这一转变标志着从静态模仿学习向主动通过交互学习的模型的过渡,模型能够获取超越训练分布的新技能,并通过经验调整行为.人们相信,这种方法使 AI 智能体能够超越静态人类生成数据的局限,通过自身的探索和利用获得超人类能力.Agentic 智能正迅速成为下一代基础模型的标志性能力,在工具使用、软件开发和真实世界自主任务中具有广泛影响.</p>
<p>实现 agentic 智能在预训练和后训练阶段都带来了挑战.预训练必须在有限的高质量数据约束下赋予模型广泛的通用先验,这使得 token 效率——每个 token 产生的学习信号——成为一个关键的缩放系数.后训练必须将这些先验转化为可执行的行为,但 agentic 能力如多步推理、长期规划和工具使用在自然数据中稀少且难以规模化扩展.结构化、高质量的 agentic 轨迹的可扩展合成,结合融合偏好和自我批评的通用强化学习(RL)技术,是弥合这一鸿沟的关键.</p>
<p>在本工作中,我们推出 Kimi K2,一个拥有 1.04 万亿参数和 320 亿激活参数的 MoE LLM,专门设计以应对核心挑战并推动 agentic 能力的边界.我们的贡献横跨预训练和后训练两个前沿:</p>
<ul>
<li>我们提出 MuonClip,一种将 token 高效的 Muon 算法与稳定性增强机制 QK-Clip 相结合的新型优化器.使用 MuonClip,我们成功地在 15.5 万亿 token 上预训练 Kimi K2,全程没有出现一次损失尖峰.</li>
<li>我们引入了一个大规模的 agentic 数据合成流水线,通过模拟和真实世界环境系统地生成工具使用演示.该系统构建多样化的工具、智能体、任务和轨迹,以大规模创建高保真、可验证正确的 agentic 交互.</li>
<li>我们设计了一个通用强化学习框架,结合可验证奖励(RLVR)与自批判评分奖励机制.模型不仅从外部定义的任务中学习,还从评估自身输出中学习,将对齐从静态领域扩展到开放领域.</li>
</ul>
<p>Kimi K2 在广泛的 agentic 和前沿基准测试中展现出强劲性能.它在 Tau2-bench 上获得 66.1 分,ACEBench (en) 上获得 76.5 分,SWE-bench Verified 上获得 65.8 分,SWE-bench Multilingual 上获得 47.3 分,在非思考评估设置下超越了大多数开源和闭源基线模型,缩小了与 Claude 4 Opus 和 Sonnet 的差距.在编程、数学和更广泛的 STEM 领域,Kimi K2 在 LiveCodeBench v6 上获得 53.7 分,OJBench 上获得 27.1 分,AIME 2025 上获得 49.5 分,GPQA-Diamond 上获得 75.1 分,进一步突显了其在通用任务上的能力.在 LMSYS Arena 排行榜上(2025 年 7 月 17 日),Kimi K2 位列开源模型第一名、总榜第五名,基于超过 3,000 个用户投票.</p>
<p>为推动 agentic 智能的进一步进展,我们开源了基座模型和后训练Checkpoint,使社区能够大规模探索、改进和部署 agentic 智能.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么 Agentic Intelligence 成为下一代 LLM 的核心方向?</p>
<p>引言中提出的核心论点是:静态模仿学习已经触及天花板.Agentic 范式的本质转变在于从「复制人类标注数据中的模式」转向「通过与环境交互自主学习」.这意味着模型不再仅仅是「知道什么」,而是「能做什么」——自主使用工具、在错误中迭代、在复杂环境中规划多步行动.这种转变的驱动力是双重的:一方面,高质量人类标注数据的供给日益受限;另一方面,真实世界的任务(如软件工程、数据分析)天然需要多步交互,而非单轮问答.Kimi K2 将 agentic 能力作为核心设计目标,而非后训练的附加功能,这体现在预训练的数据配比(大量代码和工具相关数据)、后训练的专门 agentic 数据合成流水线,以及 RL 框架中对工具使用轨迹的显式优化.</p>
</blockquote>
<hr>
<h2 id="2-yxl">2 预训练</h2>
<p>Kimi K2 的基座模型是一个万亿参数规模的 MoE Transformer 模型,在 15.5 万亿高质量 token 上预训练.鉴于高质量人类数据的日益稀缺,我们认为 token 效率正在成为大语言模型缩放中的关键系数.为此,我们引入了一套专门用于最大化 token 效率的预训练技术.具体而言,我们采用 token 高效的 Muon 优化器,并通过引入 QK-Clip 来缓解其训练不稳定性.此外,我们引入合成数据生成以进一步从可用的高质量 token 中压榨智能.模型架构遵循一种超稀疏 MoE,采用类似于 DeepSeek-V3 的多头潜在注意力(MLA),其设计源于经验性的缩放定律分析.底层基础设施旨在同时优化训练效率和研究效率.</p>
<blockquote>
<p><strong>[谱系与影响]</strong> Kimi K2 在 MoE 架构家族中的位置</p>
<p>Kimi K2 的架构设计明确继承自 DeepSeek-V3: MLA 注意力、MoE 路由机制、超稀疏专家设计.但 K2 在几个关键维度上做了差异化选择:(1)总参数从 671B 扩展到 1.04T,激活参数反而从 37B 降到 32.6B——用更高的稀疏度换取更强的容量;(2)专家数从 256 增加到 384,稀疏度达到 48:1;(3)注意力头数从 128 减半到 64,以降低长上下文推理开销.这些选择反映了 Moonshot AI 对「agentic 场景需要长上下文高效推理」这一判断的优先级,与 DeepSeek-V3 更侧重训练吞吐量的设计哲学形成对比.</p>
</blockquote>
<h3 id="2-1-muon-clip-jyqzcjdwdxl">2.1 MuonClip: 基于权重裁剪的稳定训练</h3>
<p>我们使用 token 高效的 Muon 优化器训练 Kimi K2,并引入权重衰减和一致的更新 RMS 缩放.我们在先前工作 Moonlight 中的实验表明,在相同的计算预算和模型规模下——因此也是相同数量的训练数据——Muon 显著优于 AdamW,这使其成为提升大语言模型训练 token 效率的有效选择.</p>
<p><strong>扩展 Muon 时的训练不稳定性.</strong> 尽管 Muon 效率很高,但扩展 Muon 训练揭示了一个挑战:由于注意力 logits 爆炸导致的训练不稳定性,这一问题在 Muon 训练中比在 AdamW 中更频繁出现.现有缓解策略并不充分.例如,logit soft-cap 直接裁剪注意力 logits,但 Query 和 Key 之间的点积在应用上限之前仍可能过度增长.另一方面,Query-Key Normalization (QK-Norm) 不适用于多头潜在注意力(MLA),因为其 Key 矩阵在推理期间并未完全物化.</p>
<p><strong>用 QK-Clip 驯服 Muon.</strong> 为解决这一问题,我们提出一种新颖的权重裁剪机制 QK-Clip,以显式约束注意力 logits.QK-Clip 的工作原理是在每次更新后对 Query 和 Key 投影权重进行重新缩放,以限制注意力 logits 的增长.</p>
<p>设 Transformer 层的输入表示为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>X</mi></mrow><annotation encoding="application/x-tex">X</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span></span></span></span>.对于每个注意力头 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>h</mi></mrow><annotation encoding="application/x-tex">h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">h</span></span></span></span>,其 Query、Key 和 Value 投影计算为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>Q</mi><mi>h</mi></msub><mo>=</mo><mi>X</mi><msubsup><mi>W</mi><mi>h</mi><mi>q</mi></msubsup><mo separator="true">,</mo><mspace width="1em"/><msub><mi>K</mi><mi>h</mi></msub><mo>=</mo><mi>X</mi><msubsup><mi>W</mi><mi>h</mi><mi>k</mi></msubsup><mo separator="true">,</mo><mspace width="1em"/><msub><mi>V</mi><mi>h</mi></msub><mo>=</mo><mi>X</mi><msubsup><mi>W</mi><mi>h</mi><mi>v</mi></msubsup></mrow><annotation encoding="application/x-tex">Q_h = XW_h^q, \\quad K_h = XW_h^k, \\quad V_h = XW_h^v</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0836em;vertical-align:-0.3013em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7823em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1461em;vertical-align:-0.247em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.9614em;vertical-align:-0.247em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub><mo separator="true">,</mo><msub><mi>W</mi><mi>k</mi></msub><mo separator="true">,</mo><msub><mi>W</mi><mi>v</mi></msub></mrow><annotation encoding="application/x-tex">W_q, W_k, W_v</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 是模型参数.注意力输出为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>O</mi><mi>h</mi></msub><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mn>1</mn><msqrt><mi>d</mi></msqrt></mfrac><msub><mi>Q</mi><mi>h</mi></msub><msubsup><mi>K</mi><mi>h</mi><mi mathvariant="normal">⊤</mi></msubsup><mo fence="true">)</mo></mrow><msub><mi>V</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">O_h = \\text{softmax}\\left(\\frac{1}{\\sqrt{d}} Q_h K_h^\\top\\right) V_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.1778em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">d</span></span></span><span style="top:-2.8922em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1078em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></span><p>我们定义最大 logit——一个每头的标量——为该批次 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 中 softmax 输入的最大值:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>S</mi><mi>max</mi><mo>⁡</mo><mi>h</mi></msubsup><mo>=</mo><mfrac><mn>1</mn><msqrt><mi>d</mi></msqrt></mfrac><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>X</mi><mo>∈</mo><mi>B</mi></mrow></munder><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow></munder><msubsup><mi>Q</mi><mi>h</mi><mi>i</mi></msubsup><msubsup><mi>K</mi><mi>h</mi><mrow><mi>j</mi><mi mathvariant="normal">⊤</mi></mrow></msubsup></mrow><annotation encoding="application/x-tex">S_{\\max}^h = \\frac{1}{\\sqrt{d}} \\max_{X \\in B} \\max_{i,j} Q_h^i K_h^{j\\top}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1461em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.2514em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.1778em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9322em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord mathnormal">d</span></span></span><span style="top:-2.8922em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1078em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.3557em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">X</span><span class="mrel mtight">∈</span><span class="mord mathnormal mtight" style="margin-right:0.0502em;">B</span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7717em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.3723em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8638em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8747em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.967em;"><span style="top:-2.3987em;margin-left:-0.0715em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mord mtight">⊤</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow><annotation encoding="application/x-tex">i, j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">i</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span></span></span></span> 是训练样本 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>X</mi></mrow><annotation encoding="application/x-tex">X</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0785em;">X</span></span></span></span> 中不同 token 的索引.</p>
<p>QK-Clip 的核心思想是:每当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>S</mi><mi>max</mi><mo>⁡</mo><mi>h</mi></msubsup></mrow><annotation encoding="application/x-tex">S_{\\max}^h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0961em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span> 超过目标阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 时,就对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>k</mi></msub><mo separator="true">,</mo><msub><mi>W</mi><mi>q</mi></msub></mrow><annotation encoding="application/x-tex">W_k, W_q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 进行重新缩放.重要的是,这一操作不改变当前步骤的前向/反向计算——我们仅使用最大 logit 作为指导信号来控制权重增长的强度.</p>
<p>一种朴素的实现方式是一次性裁剪所有头:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>W</mi><mi>h</mi><mi>q</mi></msubsup><mo>←</mo><msup><mi>γ</mi><mi>α</mi></msup><msubsup><mi>W</mi><mi>h</mi><mi>q</mi></msubsup><mo separator="true">,</mo><mspace width="1em"/><msubsup><mi>W</mi><mi>h</mi><mi>k</mi></msubsup><mo>←</mo><msup><mi>γ</mi><mrow><mn>1</mn><mo>−</mo><mi>α</mi></mrow></msup><msubsup><mi>W</mi><mi>h</mi><mi>k</mi></msubsup></mrow><annotation encoding="application/x-tex">W_h^q \\leftarrow \\gamma^\\alpha W_h^q, \\quad W_h^k \\leftarrow \\gamma^{1-\\alpha} W_h^k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0836em;vertical-align:-0.3013em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7823em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.2004em;vertical-align:-0.3013em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7144em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7823em;"><span style="top:-2.3987em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.1809em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3013em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1461em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8641em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span></span></span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>γ</mi><mo>=</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mn>1</mn><mo separator="true">,</mo><mi>τ</mi><mi mathvariant="normal">/</mi><msub><mi>S</mi><mi>max</mi><mo>⁡</mo></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\gamma = \\min(1, \\tau / S_{\\max})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>,而 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>max</mi><mo>⁡</mo></msub><mo>=</mo><msub><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>h</mi></msub><msubsup><mi>S</mi><mi>max</mi><mo>⁡</mo><mi>h</mi></msubsup></mrow><annotation encoding="application/x-tex">S_{\\max} = \\max_h S_{\\max}^h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0961em;vertical-align:-0.247em;"></span><span class="mop"><span class="mop">max</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span>,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 是平衡参数,通常设为 0.5,对 Query 和 Key 应用相等的缩放.</p>
<p>然而,我们观察到在实践中,只有一小部分头表现出 logits 爆炸.为最小化对模型训练的干预,我们确定每头的缩放因子 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>γ</mi><mi>h</mi></msub><mo>=</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mn>1</mn><mo separator="true">,</mo><mi>τ</mi><mi mathvariant="normal">/</mi><msubsup><mi>S</mi><mi>max</mi><mo>⁡</mo><mi>h</mi></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\gamma_h = \\min(1, \\tau / S_{\\max}^h)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0991em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mord">/</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>,并选择应用每头 QK-Clip.这种裁剪对于常规的多头注意力(MHA)是直接的.对于 MLA,我们仅对非共享的注意力头组件应用裁剪:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>q</mi><mi>C</mi></msup></mrow><annotation encoding="application/x-tex">q^C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">C</span></span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>k</mi><mi>C</mi></msup></mrow><annotation encoding="application/x-tex">k^C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">C</span></span></span></span></span></span></span></span></span></span></span>(头特定组件): 每个缩放 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msqrt><msub><mi>γ</mi><mi>h</mi></msub></msqrt></mrow><annotation encoding="application/x-tex">\\sqrt{\\gamma_h}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.04em;vertical-align:-0.3369em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7031em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.6631em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3369em;"><span></span></span></span></span></span></span></span></span></li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>q</mi><mi>R</mi></msup></mrow><annotation encoding="application/x-tex">q^R</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0077em;">R</span></span></span></span></span></span></span></span></span></span></span>(头特定旋转): 缩放 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>γ</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">\\gamma_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0556em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>k</mi><mi>R</mi></msup></mrow><annotation encoding="application/x-tex">k^R</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8413em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0077em;">R</span></span></span></span></span></span></span></span></span></span></span>(共享旋转): 保持不变,以避免跨头影响</li>
</ul>
<p><strong>MuonClip: 新优化器.</strong> 我们将 Muon 与权重衰减、一致 RMS 匹配和 QK-Clip 整合为一个单一优化器,称为 MuonClip(见算法 1).</p>
<pre><code>算法 1 MuonClip 优化器

1:  for 每个训练步骤 t do
2:    // 1. Muon 优化器步骤
3:    for 每个权重 W ∈ R^{n×m} do
4:      M_t = μ M_{t-1} + G_t        ▷ M_0 = 0, G_t 是 W_t 的梯度, μ 是动量
5:      O_t = Newton-Schulz(M_t) · √(max(n,m)) · 0.2   ▷ 匹配 Adam RMS
6:      W_t = W_{t-1} - η (O_t + λ W_{t-1})             ▷ 学习率 η, 权重衰减 λ
7:    end for
8:    // 2. QK-Clip
9:    for 模型每个注意力层中的每个注意力头 h do
10:     获取前向中已计算的 S_max^h
11:     if S_max^h &gt; τ then
12:       γ ← τ / S_max^h
13:       W_h^{qc} ← W_h^{qc} · √γ
14:       W_h^{kc} ← W_h^{kc} · √γ
15:       W_h^{qr} ← W_h^{qr} · γ
16:     end if
17:   end for
18: end for
</code></pre>
<p>我们从几个缩放实验展示了 MuonClip 的有效性.首先,我们使用原始 Muon 训练一个中等规模的 MoE 模型(9B 激活 / 53B 总参数).如图 2(左)所示,我们观察到最大注意力 logits 迅速超过 1000 的量级,表明在此规模的 Muon 训练中,注意力 logits 爆炸已经很明显.这种量级的最大 logits 通常会导致训练不稳定,包括显著的损失尖峰和偶尔的散度.</p>
<blockquote>
<p>图 2: 左图:在中等规模训练中,注意力 logits 迅速超过 1000,可能导致数值不稳定性甚至训练散度.右图:Kimi K2 使用 MuonClip 且 τ=100 时整个训练过程中的最大 logits.最大 logits 迅速增长到被限制的 100 值,直到约 30% 的训练步骤后才衰减到稳定范围,展示了 QK-Clip 的有效调节作用.数据来源:原文 Figure 2.</p>
</blockquote>
<p>接下来,我们证明 QK-Clip 不会降低模型性能,并确认 MuonClip 优化器保留了 Muon 的优化特性,不会对损失轨迹产生不利影响.实验设计和发现的详细讨论见附录 D.</p>
<p>最后,我们使用 MuonClip 且 τ=100 训练大规模 MoE 模型 Kimi K2,并监控整个训练过程中的最大注意力 logits(图 2(右)).初始阶段,由于 QK-Clip,logits 被限制在 100.在训练过程中,最大 logits 逐渐衰减到典型操作范围,无需对 τ 进行任何调整.重要的是,训练损失保持平滑稳定,没有可观察到的尖峰,如图 3 所示,验证了 MuonClip 在大规模语言模型训练中为注意力动态提供了鲁棒且可扩展的控制.</p>
<blockquote>
<p>图 3: Kimi K2 的每步训练损失曲线,未经平滑或子采样.整个训练过程中没有出现尖峰.为清晰起见,我们省略了训练的最初阶段.数据来源:原文 Figure 3.</p>
</blockquote>
<blockquote>
<p><strong>[架构细节]</strong> 为什么 Muon 比 AdamW 更容易导致 logit 爆炸?</p>
<p>附录 E 给出了一个深刻的数学解释.Muon 的更新矩阵来自 <code>msign</code> 操作,导致所有奇异值相等——其有效秩是满的.相比之下,Adam 产生的更新矩阵呈现偏斜谱:少数大奇异值主导,有效秩低.从 SVD 角度看,Muon 的权重和更新都有更高的有效秩,这意味着奇异向量对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>u</mi><mi>i</mi></msub><msubsup><mi>v</mi><mi>i</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">u_i v_i^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1078em;vertical-align:-0.2587em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4413em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2587em;"><span></span></span></span></span></span></span></span></span></span> 与更新矩阵的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>u</mi><mo>ˉ</mo></mover><mi>j</mi></msub><msubsup><mover accent="true"><mi>v</mi><mo>ˉ</mo></mover><mi>j</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">\\bar{u}_j \\bar{v}_j^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2439em;vertical-align:-0.3948em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">u</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4413em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span></span></span></span> 对齐的概率更高,导致对应奇异值叠加增长.而注意力 logits 的计算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>k</mi><mi>j</mi></msub><mo>=</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><msub><mi>W</mi><mi>q</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>j</mi></msub><msub><mi>W</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">q_i \\cdot k_j = (x_i W_q) \\cdot (x_j W_k)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 中,乘积 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub><msubsup><mi>W</mi><mi>k</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">W_q W_k^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1352em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4169em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2831em;"><span></span></span></span></span></span></span></span></span></span> 将谱范数平方化,Muon 扩大奇异值的趋势因此被复合放大,转化为更高的 logit 爆炸风险.QK-Clip 的巧妙之处在于它不是一个「训练时干预」,而是一个「更新后修正」——它不改变前向/反向传播,只在优化步骤结束后对权重做重新缩放,因此是一种零开销的稳定化手段.</p>
</blockquote>
<h3 id="2-2-yxlsj-tggxts-token-xy">2.2 预训练数据: 通过改写提升 Token 效用</h3>
<p>预训练中的 token 效率指的是训练期间每个消耗 token 所带来的性能提升程度.增加 token 效用——即每个 token 贡献的有效学习信号——增强了每个 token 对模型更新的影响,从而直接提升 token 效率.这在高质量 token 供应有限且必须最大化利用时尤为重要.一种增加 token 效用的朴素方法是通过重复曝光相同 token,但这可能导致过拟合和泛化能力下降.</p>
<p>Kimi K2 预训练数据相对于 Kimi K1.5 的一个关键进步是引入了合成数据生成策略以提升 token 效用.具体而言,我们采用了一个精心设计的改写流水线,在不引起显著过拟合的情况下扩大高质量 token 的体积.在本报告中,我们描述了两种分别面向知识和数学领域的专业化改写技术,实现了这种受控的数据增强.</p>
<p><strong>知识数据改写.</strong> 在自然、知识密集的文本上进行预训练面临一个权衡:单轮训练不足以全面吸收知识,而多轮重复训练则收益递减并增加过拟合风险.为提升高质量知识 token 的效用,我们提出了一个由以下关键组件构成的合成改写框架:</p>
<ul>
<li><strong>风格与视角多样的提示</strong>: 受 WRAP 启发,我们应用一系列精心设计的提示来增强语言多样性同时保持事实完整性.这些提示指导大语言模型以不同风格和不同视角生成对原文的忠实改写.</li>
<li><strong>分块自回归生成</strong>: 为保持长文档的全局连贯性并避免信息损失,我们采用基于分块的自回归重写策略.文本被分割为片段,分别改写,然后拼接回完整的段落.这种方法缓解了 LLM 通常存在的隐式输出长度限制.该流水线的概览见图 4.</li>
<li><strong>保真度验证</strong>: 为确保改写内容与原始内容的一致性,我们对每个改写段落与其来源进行语义对齐的保真度检查.这作为训练前的初步质量控制步骤.</li>
</ul>
<p>我们通过对 SimpleQA 的准确率测试来比较数据改写与多轮重复训练.我们使用 K2 的早期Checkpoint进行实验,评估三种训练策略:(1)将原始数据集重复 10 个 epoch;(2)将数据改写一次并重复 10 个 epoch;(3)将数据改写 10 次并单轮训练.如表 1 所示,准确率在这些策略中持续提升,展示了我们基于改写的增强的有效性.我们将此方法扩展到其他大规模知识语料库,观察到同样令人鼓舞的结果,每个语料库最多改写两次.</p>
<table>
<thead>
<tr>
<th align="center">改写次数</th>
<th align="center">Epoch 数</th>
<th align="center">SimpleQA 准确率</th>
</tr>
</thead>
<tbody><tr>
<td align="center">0 (原始 wiki 文本)</td>
<td align="center">10</td>
<td align="center">23.76</td>
</tr>
<tr>
<td align="center">1</td>
<td align="center">10</td>
<td align="center">27.39</td>
</tr>
<tr>
<td align="center">10</td>
<td align="center">1</td>
<td align="center">28.94</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: 三种改写-epoch 配置下的 SimpleQA 准确率.数据来源:原文 Table 1.</p>
</blockquote>
<blockquote>
<p>图 4: 长输入摘录的自回归分块改写流水线.输入被分割为保留上下文的小块,按顺序重写,然后拼接为完整改写段落.数据来源:原文 Figure 4.</p>
</blockquote>
<p><strong>数学数据改写.</strong> 为增强数学推理能力,我们将高质量数学文档改写为「学习笔记」风格,遵循 SwallowMath 中介绍的方法论.此外,我们通过将其他语言的高质量数学材料翻译为英语来增加数据多样性.</p>
<p>尽管对数据集改写子集的初步实验显示出有希望的结果,但将合成数据作为持续扩展策略的使用仍是一个活跃的研究领域.关键挑战包括:将方法推广到不同来源领域而不损害事实准确性、最小化幻觉和意外毒性、以及确保对大规模数据集的扩展性.</p>
<p><strong>预训练数据总体概况.</strong> Kimi K2 的预训练语料库包含 15.5 万亿经过筛选的高质量 token,涵盖四个主要领域:Web 文本、代码、数学和知识.大多数数据处理流水线遵循 Kimi K1.5 中概述的方法论.对于每个领域,我们进行了严格的正确性和质量验证,并设计了针对性的数据实验以确保筛选后的数据集同时具备高多样性和高效能.</p>
<blockquote>
<p><strong>[数据与实验]</strong> 改写 vs 重复: 为什么改写能提升 21% 的 SimpleQA 准确率?</p>
<p>表 1 的结果耐人寻味:原始数据重复 10 个 epoch 仅获得 23.76% 准确率,而改写 10 次后单轮训练达到 28.94%——相对提升约 21%.这说明了两个关键洞察.第一,简单重复导致过拟合:模型记住了训练数据的表面形式而非底层知识,因此在测试集上表现不佳.第二,改写通过引入语言多样性「强迫」模型学习更抽象的知识表示——无论事实如何表达,模型都需要识别其语义核心.这比重复训练的「记忆-提取」模式更接近真正的理解.但这里有一个重要限定:改写质量至关重要.如果改写引入事实错误或语义漂移,收益可能为负.K2 的保真度验证步骤正是为了控制这一风险.</p>
</blockquote>
<h3 id="2-3-mxjg">2.3 模型架构</h3>
<p>Kimi K2 是一个拥有 1.04 万亿参数的 MoE Transformer 模型,激活参数为 320 亿.架构遵循与 DeepSeek-V3 类似的设计,采用 Multi-head Latent Attention (MLA,多头潜在注意力) 作为注意力机制,模型隐藏维度为 7168,MoE 专家隐藏维度为 2048.我们的缩放定律分析揭示,稀疏度的持续提升带来了显著的性能改进,这促使我们将专家数量增加到 384,相比 DeepSeek-V3 的 256 个专家.为降低推理期间的计算开销,我们将注意力头数削减到 64,而非 DeepSeek-V3 的 128 个.表 2 给出了 Kimi K2 与 DeepSeek-V3 架构参数的详细对比.</p>
<table>
<thead>
<tr>
<th align="left">指标</th>
<th align="center">DeepSeek-V3</th>
<th align="center">Kimi K2</th>
<th align="center">变化</th>
</tr>
</thead>
<tbody><tr>
<td align="left">层数</td>
<td align="center">61</td>
<td align="center">61</td>
<td align="center">=</td>
</tr>
<tr>
<td align="left">总参数</td>
<td align="center">671B</td>
<td align="center">1.04T</td>
<td align="center">增加 54%</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="center">37B</td>
<td align="center">32.6B</td>
<td align="center">减少 13%</td>
</tr>
<tr>
<td align="left">专家总数</td>
<td align="center">256</td>
<td align="center">384</td>
<td align="center">增加 50%</td>
</tr>
<tr>
<td align="left">每 token 激活专家数</td>
<td align="center">8</td>
<td align="center">8</td>
<td align="center">=</td>
</tr>
<tr>
<td align="left">共享专家数</td>
<td align="center">1</td>
<td align="center">1</td>
<td align="center">=</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="center">128</td>
<td align="center">64</td>
<td align="center">减少 50%</td>
</tr>
<tr>
<td align="left">稠密层数</td>
<td align="center">3</td>
<td align="center">1</td>
<td align="center">减少 67%</td>
</tr>
<tr>
<td align="left">专家分组</td>
<td align="center">是</td>
<td align="center">否</td>
<td align="center">-</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: Kimi K2 与 DeepSeek-V3 的架构对比.数据来源:原文 Table 2.</p>
</blockquote>
<p><strong>稀疏度缩放定律.</strong> 我们开发了一个针对使用 Muon 的 MoE 模型家族的稀疏度缩放定律.稀疏度定义为专家总数与激活专家数的比值.通过精心控制的小规模实验,我们观察到——在固定激活参数数量(即恒定 FLOPs)的情况下——增加专家总数(即增加稀疏度)一致地降低了训练和验证损失,从而提升整体模型性能(图 5).具体而言,在计算最优稀疏度缩放定律下,达到相同的验证损失 1.5,稀疏度 48 相比稀疏度 8、16 和 32 分别减少 FLOPs 1.69 倍、1.39 倍和 1.15 倍.尽管增加稀疏度带来更好的性能,但这种收益伴随着基础设施复杂性的增加.为平衡模型性能与成本,我们为 Kimi K2 采用稀疏度 48,每次前向传播激活 8 个专家(共 384 个).</p>
<blockquote>
<p>图 5: 稀疏度缩放定律.增加稀疏度可提升模型性能.我们固定激活专家数为 8、共享专家数为 1,变化专家总数,从而产生不同稀疏度水平的模型.数据来源:原文 Figure 5.</p>
</blockquote>
<p><strong>注意力头数.</strong> DeepSeek-V3 将注意力头数设为约模型层数的两倍,以更好地利用内存带宽并提升计算效率.然而,随着上下文长度增加,加倍注意力头数导致显著的推理开销,在长序列长度下降低效率.这在 agentic 应用中成为主要限制,因为高效的长上下文处理至关重要.例如,在 128K 序列长度下,将注意力头数从 64 增加到 128,同时保持专家总数固定为 384,会导致推理 FLOPs 增加 83%.为评估这一设计的影响,我们在不同训练 FLOPs 下进行了控制实验,比较注意力头数等于层数的配置与头数加倍的配置.在等 token 训练条件下,我们观察到加倍注意力头数仅在验证损失上产生微小改进(范围从 0.5% 到 1.2%) across 不同计算预算(图 6).鉴于稀疏度 48 已经提供了强劲性能,加倍注意力头数的边际收益不足以弥补推理成本.因此我们选择 64 个注意力头.</p>
<blockquote>
<p>图 6: 注意力头数等于层数的模型及其头数加倍对照版本的缩放曲线.加倍注意力头数使验证损失降低约 0.5% 到 1.2%.数据来源:原文 Figure 6.</p>
</blockquote>
<blockquote>
<p><strong>[架构细节]</strong> 头数减半的权衡: 0.5%-1.2% 质量损失换 83% 推理效率提升</p>
<p>这是一个经典的工程权衡案例.K2 团队在等 token 条件下证明:将注意力头从 128 减半到 64,验证损失仅增加 0.5%-1.2%(相对值),但在 128K 上下文下推理 FLOPs 减少 83%.这意味着每单位 FLOPs 的「质量产出」实际上提升了——因为质量损失不成比例地小.从 agentic 场景的实际需求看,长上下文推理的效率往往比绝对质量更重要:一个 agent 可能需要处理数万 token 的代码库、多轮对话历史或工具调用结果,推理延迟直接影响用户体验.这个设计选择也反映了 Moonshot AI 对产品场景的深刻理解:与其追求 benchmark 上的微小提升,不如确保模型在真实 agentic 工作流中可部署、可扩展.</p>
</blockquote>
<h3 id="2-4-xljcss">2.4 训练基础设施</h3>
<h4 id="2-4-1-jsjq">2.4.1 计算集群</h4>
<p>Kimi K2 在配备 NVIDIA H800 GPU 的集群上训练.H800 集群中的每个节点包含 2TB RAM 和 8 块通过 NVLink 和 NVSwitch 连接的 GPU.跨节点之间,采用 8×400 Gbps RoCE 互联来促进通信.</p>
<h4 id="2-4-2-mxsfdbhcl">2.4.2 模型缩放的并行策略</h4>
<p>大语言模型的训练通常在动态资源可用性下进行.我们不为特定资源量优化单一并行策略,而是追求一种灵活策略,允许 Kimi K2 在任意 32 的倍数节点上训练.我们的策略结合了 16 路流水线并行(PP)与虚拟阶段、16 路专家并行(EP)和 ZeRO-1 数据并行.</p>
<p>在此配置下,以 BF16 存储模型参数和以 FP32 存储梯度累积缓冲区需要约 6TB GPU 内存,分布在 256 个 GPU 的模型并行组上.优化器状态的放置取决于训练配置.当训练节点总数较大时,优化器状态被分散,将其每设备内存占用降低到可忽略的水平.当训练节点总数较小(例如 32)时,我们可以将部分优化器状态卸载到 CPU.</p>
<p>这种方法允许我们在小规模和大规模实验中使用相同的并行配置,同时让每个 GPU 为所有状态持有约 30GB GPU 内存.剩余的 GPU 内存用于激活,如第 2.4.3 节所述.这种一致的设计对研究效率很重要,因为它简化了系统并显著加速了实验迭代.</p>
<p><strong>EP 通信与交错 1F1B 的重叠.</strong> 通过增加预热微批次的数量,我们可以在标准交错 1F1B 调度下将 EP all-to-all 通信与计算重叠.相比之下,DualPipe 会使参数和梯度所需的内存加倍,需要增加并行度来补偿.增加 PP 引入更多气泡,而增加 EP 则产生更高开销(如下所述).对于训练超过 1 万亿参数的大模型,这些额外成本过高,因此我们选择不使用 DualPipe.</p>
<p>然而,交错 1F1B 将模型分割为更多阶段,引入不可忽视的 PP 通信开销.为缓解这一成本,我们将权重梯度计算从每个微批次的反向传播中解耦,并在对应的 PP 通信期间并行执行.因此,除预热阶段外,所有 PP 通信都能被有效重叠.</p>
<p><strong>更小的 EP 规模.</strong> 为确保 1F1B 阶段期间完全的计算-通信重叠,K2 中减少的注意力计算时间(相比 DeepSeek-V3 的 128 头,K2 仅有 64 头)要求最小化 EP 操作的时间.这通过采用最小可行的 EP 并行策略实现,具体为 EP=16.使用更小的 EP 组还放松了专家平衡约束,允许在不进一步调优的情况下达到接近最优的速度.</p>
<h4 id="2-4-3-jhsj">2.4.3 激活缩减</h4>
<p>在为参数、梯度缓冲区和优化器状态预留空间后,每个设备上剩余的 GPU 内存不足以容纳完整的 MoE 激活.为确保激活内存符合约束,尤其对于在 1F1B 预热阶段累积最大激活的初始流水线阶段,采用以下技术.</p>
<p><strong>选择性重计算.</strong> 重计算应用于廉价但高占用的阶段,包括 LayerNorm、SwiGLU 和 MLA 上投影.此外,MoE 下投影在训练期间被重计算以进一步减少激活内存.虽然可选,但这种重计算保持了足够的 GPU 内存,防止早期训练阶段因专家不平衡导致的崩溃.</p>
<p><strong>FP8 存储不敏感激活.</strong> MoE 上投影和 SwiGLU 的输入被压缩为 FP8-E4M3,以 1×128 的 tile 配合 FP32 缩放因子.小规模实验显示没有可测量的损失增加.由于初步研究中观察到的潜在性能退化风险,我们不将 FP8 应用于计算.</p>
<p><strong>激活 CPU 卸载.</strong> 所有剩余激活被卸载到 CPU RAM.一个拷贝引擎负责流式传输卸载和加载,与计算和通信内核重叠.在 1F1B 阶段,我们在 prefetch 下一微批次反向激活的同时,卸载上一微批次的前向激活.预热和冷却阶段以类似方式处理,整体模式见图 7.尽管卸载可能因 PCIe 流量拥塞略微影响 EP 通信,但我们的测试显示 EP 通信仍保持完全重叠.</p>
<blockquote>
<p>图 7: 不同 PP 阶段中计算、通信和卸载的重叠.数据来源:原文 Figure 7.</p>
</blockquote>
<blockquote>
<p><strong>[架构细节]</strong> 为什么不用 DualPipe? 为什么选 EP=16?</p>
<p>K2 的基础设施选择揭示了一个关键工程约束:对于 1T+ 参数的模型,DualPipe 的内存开销(参数和梯度各加倍)过于昂贵.交错 1F1B + EP=16 的组合是一种务实的替代方案:1F1B 的额外气泡被权重梯度计算的延迟所抵消,而 EP=16 是满足「计算-通信完全重叠」条件的最小规模.更小的 EP 组还有一个意外好处:放松了专家负载均衡约束.在 MoE 训练中,如果某些专家被过度使用,需要容量因子(capacity factor)来容纳溢出 token,这会浪费计算.EP=16 使得 token 在更小的组内分布更均匀,接近理想的负载均衡,无需复杂的辅助损失调参.这是「简单设计优于复杂优化」的典型案例.</p>
</blockquote>
<h3 id="2-5-xlpf">2.5 训练配方</h3>
<p>我们以 4,096 token 的上下文窗口使用 MuonClip 优化器(算法 1)和 WSD 学习率调度进行预训练,共处理 15.5T token.前 10T token 以恒定学习率 2e-4 训练(经过 500 步预热),随后 5.5T token 以余弦衰减从 2e-4 到 2e-5.权重衰减全程设为 0.1,全局 batch size 保持 67M token.整体训练曲线见图 3.</p>
<p>在预训练末期,我们进行了一个退火阶段 followed by 长上下文激活阶段.Batch size 保持 67M token 不变,学习率从 2e-5 衰减到 7e-6.在此阶段,模型以 4K 序列长度训练 400B token,随后以 32K 序列长度额外训练 60B token.为将上下文窗口扩展到 128K,我们采用 YaRN 方法.</p>
<hr>
<h2 id="3-hxl">3 后训练</h2>
<h3 id="3-1-jdwt">3.1 监督微调</h3>
<p>我们在后训练中使用 Muon 优化器,并推荐其用于 K2 的微调.这源于我们先前工作的结论:Muon 预训练的Checkpoint与 Muon 微调配合时产生最佳性能.</p>
<p>我们构建了一个覆盖多样化领域的大规模指令微调数据集,遵循两个核心原则:最大化提示多样性并确保高回复质量.为此,我们开发了一套针对不同任务领域的数据生成流水线,每个流水线结合人工标注、提示工程和验证流程.我们采用 K1.5 和其他内部领域专业化专家模型为各种任务生成候选回复,随后由 LLM 或人工评判者执行自动化质量评估和过滤.对于 agentic 数据,我们创建了一个数据合成流水线,通过多步交互式推理教授模型工具使用能力.</p>
<h4 id="3-1-1-mxgjsyxxddgm-agentic-sjhc">3.1.1 面向工具使用学习的大规模 Agentic 数据合成</h4>
<p>现代 LLM 智能体的一个关键能力是自主使用不熟悉的工具、与外部环境交互,并通过推理、执行和错误纠正迭代改进其行动.Agentic 工具使用能力对于解决需要与真实世界系统动态交互的复杂多步任务至关重要.近期基准测试如 ACEBench 和 τ-bench 强调了全面工具使用评估的重要性,而 ToolLLM 和 ACEBench 等框架展示了有效教授模型使用数千种工具的潜力.</p>
<p>然而,规模化训练此类能力面临重大挑战:虽然真实世界环境提供丰富且真实的交互信号,但由于成本、复杂性、隐私和可访问性约束,它们往往难以大规模构建.近期合成数据生成工作(AgentInstruct、Self-Instruct、StableToolBench、ZeroSearch)展示了在不依赖真实世界交互的情况下创建大规模数据的前景.基于这些进展并受 ACEBench 综合数据合成框架的启发,我们开发了一个大规模模拟真实世界工具使用场景的流水线,能够生成数万个多样化且高质量的训练样本.</p>
<p>我们的数据合成流水线包含三个阶段,如图 8 所示:</p>
<ul>
<li><strong>工具规格生成</strong>: 我们首先从真实世界工具和 LLM 合成工具中构建一个大型工具规格仓库;</li>
<li><strong>智能体与任务生成</strong>: 对于从工具仓库中采样的每个工具集,我们生成一个使用该工具集的智能体和相应的任务;</li>
<li><strong>轨迹生成</strong>: 对于每个智能体和任务,我们生成智能体通过调用工具完成任务的轨迹.</li>
</ul>
<blockquote>
<p>图 8: 工具使用的数据合成流水线.(a) 工具规格来自真实世界工具和 LLM;智能体和任务从工具仓库生成.(b) 多智能体流水线,通过工具调用生成和过滤轨迹.数据来源:原文 Figure 8.</p>
</blockquote>
<p><strong>领域演化与工具生成.</strong> 我们通过两种互补方法构建了一个全面的工具仓库.首先,我们直接从 GitHub 仓库获取 3000+ 真实 MCP(Model Context Protocol)工具,利用现有高质量工具规格.其次,我们通过层次化领域生成过程系统地演化合成工具:从关键类别(如金融交易、软件应用、机器人控制)开始,然后在每个类别中演化多个特定应用领域.为每个领域合成专门的工具,具有清晰的接口、描述和操作语义.这一演化过程产生了超过 20,000 个合成工具.图 9 通过 t-SNE 嵌入可视化展示了工具集合的多样性,表明 MCP 和合成工具覆盖了工具空间中互补的区域.</p>
<blockquote>
<p>图 9: 工具嵌入的 t-SNE 可视化.(a) 真实 MCP 工具基于其原始来源类别呈现自然聚类.(b) 合成工具被组织到预定义的领域类别中,提供对工具空间的系统性覆盖.两者共同确保跨不同工具功能的全面表示.数据来源:原文 Figure 9.</p>
</blockquote>
<p><strong>智能体多样化.</strong> 我们通过合成各种系统提示并为它们配备来自仓库的不同工具组合来生成数千个不同的智能体.这创建了一个具有多样化能力、专业领域和行为模式的智能体群体,确保对潜在用例的广泛覆盖.</p>
<p><strong>基于评分标准的任务生成.</strong> 对于每个智能体配置,我们生成从简单到复杂操作的任务.每个任务配有一个明确的评分标准(rubric),规定成功标准、预期工具使用模式和评估Checkpoint.这种基于评分标准的方法确保了智能体性能的一致和客观评估.</p>
<p><strong>多轮轨迹生成.</strong> 我们通过以下组件模拟真实的工具使用场景:</p>
<ul>
<li><strong>用户模拟</strong>: LLM 生成的具有不同沟通风格和偏好的用户角色与智能体进行多轮对话,创建自然的交互模式.</li>
<li><strong>工具执行环境</strong>: 一个复杂的工具模拟器(功能上等价于世界模型)执行工具调用并提供真实的反馈.模拟器在每次工具执行后维护和更新状态,支持具有持久效果的复杂多步交互.它引入受控的随机性以产生包括成功、部分失败和边缘案例在内的多样化结果.</li>
</ul>
<p><strong>质量评估与过滤.</strong> 一个基于 LLM 的评判者根据任务评分标准评估每个轨迹.仅保留满足成功标准的轨迹用于训练,在允许任务完成策略自然变化的同时确保高质量数据.</p>
<p><strong>与真实执行环境的混合方法.</strong> 虽然模拟提供了可扩展性,但我们承认模拟保真度的固有局限性.为解决这一问题,我们用真实执行沙箱补充模拟环境,用于真实性至关重要的场景,尤其是编码和软件工程任务.这些真实沙箱执行实际代码,与真实的开发环境交互,并通过测试套件通过率等客观指标提供真实反馈.这种组合确保我们的模型既从模拟场景的多样性中学习,也从真实执行的真实性中学习,显著增强了实际 agentic 能力.</p>
<p>通过利用这种结合可扩展模拟与针对性真实世界执行的混合流水线,我们生成了多样化、高质量的工具使用演示,在覆盖范围和真实性之间取得平衡.合成数据生成的规模和自动化,加上真实执行环境提供的 grounding,通过我们的质量过滤流程有效地实现了大规模拒绝采样.这种高质量的合成数据,当用于监督微调时,在模型跨广泛真实世界应用的工具使用能力方面展现出显著改进.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么需要 20,000+ 合成工具 + 3,000+ 真实 MCP 工具?</p>
<p>K2 的数据合成策略揭示了 agentic 训练的一个核心难题:真实工具的数量和多样性永远不够.即使 3,000 个 MCP 工具已经覆盖了几十个领域,但对于 LLM 需要泛化到「从未见过的工具」这一目标而言,这仍然太少.合成工具的 20,000+ 规模提供了三个关键价值:第一,它扩展了工具空间的覆盖密度,使模型见过更多类型的 API 模式(REST、GraphQL、gRPC、函数调用等);第二,层次化生成确保了工具之间的结构多样性——从简单计算器到复杂数据库查询;第三,合成环境允许创建真实世界中不存在的极端案例和边缘条件,增强模型的鲁棒性.但仅有合成数据不够:真实执行沙箱(尤其是代码相关)提供了不可替代的 ground truth.没有真实编译器和测试套件的反馈,模型可能学会「看起来正确」但无法执行的代码.这种「合成多样性 + 真实验证」的混合策略正在成为 agentic 数据合成的行业最佳实践.</p>
</blockquote>
<h3 id="3-2-qhxx">3.2 强化学习</h3>
<p>强化学习被认为在 token 效率和泛化能力方面优于 SFT.基于 K1.5 的工作,我们在 K2 中继续扩展 RL 的任务多样性和训练 FLOPs.为支持这一点,我们开发了一个类似 Gym 的可扩展框架,促进跨广泛场景的 RL.我们用大量具有可验证奖励的任务扩展了该框架.对于依赖主观偏好的任务(如创意写作和开放式问答),我们引入自批判奖励,模型通过成对比较来评判自己的输出.这种方法使来自各个领域的任务都能从 RL 范式中受益.</p>
<h4 id="3-2-1-kyzjlxlc-verifiable-rewards-gym">3.2.1 可验证奖励训练场(Verifiable Rewards Gym)</h4>
<p><strong>数学、STEM 和逻辑任务.</strong> 对于数学、STEM 和逻辑推理领域,我们的 RL 数据准备遵循两个关键原则:多样化覆盖和适中难度.</p>
<p><em>多样化覆盖.</em> 对于数学和 STEM 任务,我们结合专家标注、内部 QA 提取流水线和开源数据集收集高质量 QA 对.在收集过程中,我们利用标签系统刻意增加欠覆盖领域的覆盖.对于逻辑任务,我们的数据集包含多种格式,包括结构化数据任务(如多跳表格推理、跨表聚合)和逻辑谜题(如 24 点游戏、数独、谜语、密码算术和摩斯电码解码).</p>
<p><em>适中难度.</em> RL 提示集不应太简单也不应太难,两者都可能产生微弱信号并降低学习效率.我们使用 SFT 模型的 pass@k 准确率评估每个问题的难度,仅选择难度适中的问题.</p>
<p><strong>复杂指令遵循.</strong> 有效的指令遵循不仅需要理解显式约束,还需要处理隐式要求、应对边缘案例,并在扩展对话中保持一致性.我们通过结合自动化验证和对抗检测的混合验证框架,配合可扩展的课程生成流水线来解决这些挑战.我们的方法采用双路径系统以确保精确性和鲁棒性:</p>
<p><em>混合规则验证.</em> 我们实现两种验证机制:(1)通过代码解释器对具有可验证输出的指令(如长度、风格约束)进行确定性评估;(2)对需要 nuanced 约束理解的指令采用 LLM-as-judge 评估.为解决模型可能声称已遵循指令但实际未遵守的潜在对抗行为,我们增加了一个额外的 hack-check 层,专门检测此类欺骗性声明.</p>
<p><em>多源指令生成.</em> 为构建训练数据,我们采用三种不同的生成策略以确保全面覆盖:(1)由数据团队开发的专家手工复杂条件提示和评分标准;(2)受 AutoIF 启发的 agentic 指令增强;(3)一个专门用于生成探测特定失败模式或边缘案例的额外指令的微调模型.这种多管齐下确保了指令覆盖的广度和深度.</p>
<p><strong>忠实性(Faithfulness).</strong> 忠实性对于在多轮工具使用、自生成推理链和开放环境交互等场景中运行的 agentic 模型至关重要.受 FACTS Grounding 评估框架的启发,我们训练了一个句子级忠实性评判模型来执行自动化验证.该评判模型有效检测在上下文中做出事实声明但无支持证据的句子.它作为奖励模型来增强整体忠实性性能.</p>
<p><strong>编码与软件工程.</strong> 为提升解决竞赛级编程问题的能力,我们从开源数据集和合成来源收集问题及其评判器.为确保合成数据的多样性和奖励信号的正确性,我们整合了从预训练数据中检索的高质量人工编写单元测试.</p>
<p>对于软件工程任务,我们从 GitHub 收集大量 pull request 和 issue 来构建软件开发环境,包含用户提示/issue 和可执行单元测试.该环境建立在由 Kubernetes 驱动的健壮沙箱基础设施上,支持超过 10,000 个并发沙箱实例的稳定性能,非常适合竞技编程和软件工程任务.</p>
<p><strong>安全性.</strong> 我们增强安全性的工作始于人工筛选的种子提示集,手工设计以涵盖暴力、欺诈和歧视等普遍风险类别.</p>
<p>为模拟复杂的越狱尝试(如角色扮演、文学叙事和学术论述),我们采用包含三个关键组件的自动化提示演化流水线:</p>
<ul>
<li><strong>攻击模型</strong>: 迭代生成旨在从目标 LLM 引出不安全回复的对抗性提示.</li>
<li><strong>目标模型</strong>: 对这些提示生成回复,模拟潜在漏洞.</li>
<li><strong>评判模型</strong>: 评估交互以确定对抗性提示是否成功绕过安全机制.</li>
</ul>
<p>每个交互使用任务特定的评分标准进行评估,使评判模型能够提供二元成功/失败标签.</p>
<h4 id="3-2-2-cyyz-zpppfjl-self-critique-rubric-reward">3.2.2 超越验证: 自批判评分奖励(Self-Critique Rubric Reward)</h4>
<p>为将模型对齐扩展到具有可验证奖励的任务之外,我们引入了一个基于自批判反馈的通用强化学习框架.该方法旨在通过将可验证场景中习得的能力扩展到更广泛的主观任务,使 LLM 与细腻的人类偏好对齐,包括 helpfulness、creativity、推理深度、事实性和安全性.框架使用自批判评分奖励机制运作,模型评估自己的输出以生成偏好信号.为使 K2 成为有能力的评判者,我们精选了开源和内部偏好数据集的混合物,并在 SFT 阶段初始化其批判能力.</p>
<p><strong>自批判策略优化.</strong> 在学习循环的第一个核心过程中,K2 actor 为涵盖广泛用例的通用提示生成回复.K2 critic 随后通过对评分标准组合执行成对评估来对所有结果进行排序,该组合包括核心评分标准(附录 F.1)——代表我们 AI 助手 Kimi 所珍视的基本价值观、处方性评分标准(附录 F.2)——旨在消除奖励黑客攻击,以及由数据团队为特定指令情境手工制作的评分标准.虽然某些评分标准可被指定为强制性的,但 K2 保留根据内部先验权衡它们的灵活性.这种能力使其能够与不断演化的 on-policy 行为进行动态且持续的对齐,确保模型回复在适应特定指令的同时保持与其核心身份的一致性.</p>
<p><strong>闭环评判者精炼与对齐.</strong> 在 RL 训练期间,评判模型使用可验证信号进行精炼.来自可验证奖励提示的 on-policy rollout 被用于持续更新评判者,这是将 RLVR 的客观性能信号直接蒸馏到其评估模型中的关键步骤.这种迁移学习过程将其更主观的判断基于可验证数据,允许可验证任务的性能增益增强评判者在缺乏明确奖励信号的复杂任务上的判断.这种闭环过程确保评判者持续与策略的演化同步重新校准其评估标准.通过将主观评估基于可验证数据,该框架实现了与复杂、不可验证人类目标的鲁棒且可扩展的对齐.</p>
<p>因此,这种整体对齐在广泛领域产生了全面的性能提升,包括用户意图理解、创意写作、复杂推理和细腻语言理解.</p>
<blockquote>
<p><strong>[设计动机]</strong> 为什么需要「自批判」而不仅是「可验证奖励」?</p>
<p>这是 RL 对齐领域的一个深刻洞察.可验证奖励(如单元测试通过、数学答案正确)只能覆盖有限的任务类型——代码、数学、逻辑谜题.但真实世界的用户请求大多是「不可验证」的:写一篇创意故事、提供情感支持、解释一个复杂概念.这些任务没有客观正确答案,传统 RL 无法直接优化.K2 的解决方案是训练模型成为自己的评判者:通过成对比较自己的多个输出,模型学习生成符合人类偏好的回复.更巧妙的是「闭环评判者精炼」机制:模型在可验证任务上获得的客观反馈,被用来持续更新其评判标准,然后将这些更新的标准应用到主观任务上.这实现了从「客观正确」到「主观偏好」的能力迁移.但这里有一个风险:如果评判者本身存在偏见(如偏好更自信的回复),这种偏见会被 RL 放大.附录 F.3 明确承认了这一局限性,体现了作者对系统风险的清醒认识.</p>
</blockquote>
<h4 id="3-2-3-rl-sf">3.2.3 RL 算法</h4>
<p>我们采用 K1.5 中引入的策略优化算法作为 K2 的基础.对于每个问题 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>,我们从先前策略 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mtext>old</mtext></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\text{old}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 采样 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi></mrow><annotation encoding="application/x-tex">K</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span></span> 个回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">{</mo><msub><mi>y</mi><mn>1</mn></msub><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>K</mi></msub><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\{y_1, ..., y_K\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">}</span></span></span></span>,并相对于以下目标优化模型 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>RL</mtext></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi>x</mi><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mi>K</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></munderover><msup><mrow><mo fence="true">(</mo><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>−</mo><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>−</mo><mi>τ</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mtext>old</mtext></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>i</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">)</mo></mrow><mn>2</mn></msup><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{RL}}(\\theta) = \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ \\frac{1}{K} \\sum_{i=1}^{K} \\left( r(x, y_i) - \\bar{r}(x) - \\tau \\log \\frac{\\pi_\\theta(y_i|x)}{\\pi_{\\text{old}}(y_i|x)} \\right)^2 \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">RL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.106em;vertical-align:-1.2777em;"></span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">[</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">old</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.654em;"><span style="top:-3.9029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">]</span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mfrac><mn>1</mn><mi>K</mi></mfrac><msubsup><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>K</mi></msubsup><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\bar{r}(x) = \\frac{1}{K} \\sum_{i=1}^{K} r(x, y_i)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3262em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9812em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0715em;">K</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 是采样回复的平均奖励,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi><mo>&gt;</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\tau &gt; 0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&gt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span> 是促进稳定学习的正则化参数.与 SFT 一样,我们采用 Muon 优化器来最小化这一目标.随着我们将 RL 训练扩展到涵盖 K2 中更广泛的任务,一个主要挑战是在所有领域实现一致的性能提升.为解决这一问题,我们对 RL 算法引入了几项补充.</p>
<p><strong>预算控制.</strong> 广泛观察到 RL 通常导致模型生成回复长度大幅增加.虽然更长的回复可以使模型利用额外的测试时计算来改进复杂推理任务的性能,但在非推理领域,其收益往往无法证明推理成本的合理性.为鼓励模型合理分配推理预算,我们在整个 RL 训练中强制执行每样本最大 token 预算,预算根据任务类型确定.超过此 token 预算的回复被截断并分配惩罚,激励模型在指定限制内生成解决方案.经验上,这种方法显著提升了模型的 token 效率,鼓励在所有领域生成简洁而有效的解决方案.</p>
<p><strong>PTX 损失.</strong> 为防止在联合 RL 训练中潜在遗忘宝贵的高质量数据,我们精选了一个包含手工筛选的高质量样本的数据集,并通过辅助 PTX 损失将其整合到 RL 目标中.该策略不仅利用了高质量数据的优势,还缓解了过拟合到训练方案中明确存在的有限任务集的风险.这种增强大幅提升了模型在更广泛领域的泛化能力.</p>
<p><strong>温度衰减.</strong> 对于创意写作和复杂推理等任务,我们发现通过在训练初始阶段使用高采样温度促进探索至关重要.高温度允许模型生成多样化且创新的回复,从而促进发现有效策略并降低过早收敛到次优解的风险.然而,在训练后期保留高温度或在评估期间使用可能是有害的,因为它引入过度的随机性并损害模型输出的可靠性和一致性.为解决这一问题,我们采用温度衰减调度,在整个训练中从探索转向利用.该策略确保模型在最有利时利用探索,同时最终收敛于稳定且高质量的输出.</p>
<blockquote>
<p><strong>[算法分析]</strong> 预算控制: 解决 RL 的「回复膨胀」问题</p>
<p>RL 训练中模型输出长度失控是一个众所周知的工程难题.DeepSeek-R1 的推理模式也面临类似问题——模型倾向于生成极长的思考链.K2 的预算控制策略是一个简单而有效的解决方案:根据任务类型设置不同的 token 上限,超限回复被截断并受罚.这本质上是在 RL 目标中引入了一个「资源约束」——模型必须学会在有限预算内完成任务.从经济学角度看,这迫使模型学习「帕累托最优」的回复策略:在质量与长度之间找到最佳平衡点.值得注意的是,K2 没有采用全局统一的预算,而是「基于任务类型」设置——这意味着编码任务可能有更长预算(需要多步推理),而简单问答有较短预算.这种差异化预算反映了对任务复杂度的先验知识,比一刀切的截断更合理.</p>
</blockquote>
<h3 id="3-3-rl-jcss">3.3 RL 基础设施</h3>
<h4 id="3-3-1-tdjg">3.3.1 同地架构</h4>
<p>与 K1.5 类似,我们采用混合同地架构进行同步 RL 训练,训练和推理引擎位于同一组 worker 上.当一个引擎 actively 工作时,另一个引擎释放或卸载其 GPU 资源以 accommodate.在 RL 训练的每次迭代中,中央控制器首先调用推理引擎生成新训练数据,然后通知训练引擎在新数据上训练,并将更新后的参数发送给推理引擎用于下一次迭代.</p>
<p>每个引擎都针对吞吐量进行了重度优化.此外,随着模型扩展到 K2 的规模,引擎切换和故障恢复的延迟变得显著.我们在这些方面介绍系统设计考量.</p>
<h4 id="3-3-2-gxyqqh">3.3.2 高效引擎切换</h4>
<p>在 rollout 期间,训练引擎的参数被卸载到 DRAM.因此启动训练引擎只是一个简单的 H2D 传输.然而,启动推理引擎是一个更大的挑战,因为它必须从具有不同分片范式的训练引擎获取更新后的参数.</p>
<p>鉴于 K2 的规模和涉及的设备数量之庞大,使用网络文件系统进行参数重新分片和广播是不切实际的.为保持开销较低所需的聚合带宽达到每秒数 PB.为应对这一挑战,我们开发了一个分布在训练节点上的分布式Checkpoint引擎来管理参数状态.为执行参数更新,每个Checkpoint引擎 worker 从训练引擎获取参数的本地副本,然后在所有Checkpoint引擎 worker 之间广播完整参数集.随后,推理引擎仅从Checkpoint引擎获取其需要的参数分片.此过程见图 10.为实现 1T 模型的这一目标,更新以逐参数的方式进行流水线化,最小化内存占用(见附录 G).</p>
<blockquote>
<p>图 10: 利用Checkpoint引擎进行参数更新.数据来源:原文 Figure 10.</p>
</blockquote>
<p>我们选择在整个集群中广播完整参数集,无论每个推理 worker 的具体分片方案如何.虽然这比理论最优方法传输了数倍的数据,但它提供了一个更简单的系统设计,对训练和推理引擎的侵入性更小.我们选择权衡这一微小开销以完全解耦训练引擎和推理引擎,显著简化了维护和测试.</p>
<p>值得注意的是,这种方法由于减少的同步开销和更高的网络带宽利用率,优于「按需传输」方法.我们的系统可以在不到 30 秒内完成 Kimi K2 的完整参数更新,对于典型的 RL 训练迭代而言这是一个可忽略的时间.Checkpoint引擎的源代码已在 Github 上开源.</p>
<h4 id="3-3-3-gxxtqd">3.3.3 高效系统启动</h4>
<p>由于大规模训练容易发生系统故障,优化启动时间对于 Kimi K2 这种规模的模型至关重要.为启动训练引擎,我们让每个训练 worker 选择性地从磁盘读取部分参数或不读取,并向对等节点广播必要参数.设计目标是确保所有 worker 集体仅读取Checkpoint一次,最小化昂贵的磁盘 IO.</p>
<p>由于推理引擎是独立的副本,我们希望避免在它们之间引入额外的同步屏障.因此,我们选择复用Checkpoint引擎进行启动:我们让Checkpoint引擎集体从磁盘读取Checkpoint,类似于训练引擎的启动方式.然后它使用上一节介绍的方法更新未初始化推理引擎的状态.通过利用专用Checkpoint引擎,系统还对单点故障具有鲁棒性,因为推理副本可以在不与其他副本通信的情况下重新启动.</p>
<h4 id="3-3-4-agentic-rollout">3.3.4 Agentic Rollout</h4>
<p>我们的 RL 基础设施支持长程、多轮 agentic 任务的训练.在 rollout 期间,这些任务呈现 distinct 挑战,如复杂的环境交互和延长的 rollout 持续时间.这里我们介绍几项优化来缓解这些问题.</p>
<p>由于环境的多样性,某些交互可能因等待环境反馈(如虚拟机或代码解释器)而被阻塞,导致 GPU 空闲.我们采用两种策略来最大化 GPU 利用率:(i)我们将重量级环境部署为可更容易扩展的专用服务;(ii)我们采用大量并发 rollout 来摊销某些昂贵交互带来的延迟.</p>
<p>Agentic rollout 中的另一个挑战是个别 rollout 轨迹可能极长.为防止长尾轨迹阻塞整个 rollout 过程,我们采用 partial rollout 技术.该策略允许长尾未完成任务被暂停,并在下一次 RL 迭代中恢复.</p>
<p>为提高研究效率,我们还设计了一个受 OpenAI Gym 框架启发的统一接口,以简化新环境的集成.我们希望将 RL 基础设施扩展到更多样化的交互环境.</p>
<blockquote>
<p><strong>[工程视角]</strong> 30 秒参数更新: Checkpoint引擎的工程巧思</p>
<p>对于 1T 参数的模型,在数百个 GPU 之间同步参数更新是一个巨大的工程挑战.K2 的解决方案——「广播全量参数而非按需传输」——看似反直觉(多传输了数倍数据),但实践证明它更快.原因在于:按需传输需要推理 worker 和训练 worker 之间复杂的协调(「我需要哪个分片?」「哪个 worker 有它?」),同步开销远超额外传输的带宽成本.而广播全量参数让每个推理 worker 从最近的Checkpoint引擎独立获取所需分片,完全消除了跨 worker 协调.这是一种「以带宽换延迟」的经典分布式系统策略.更值得注意的是,Checkpoint引擎被设计为可复用——既用于参数同步,也用于故障恢复时的快速启动.这种「一物多用」的设计减少了系统组件数量,降低了维护复杂度.开源Checkpoint引擎的决策也值得称赞:它使社区能够复现和验证 K2 的训练基础设施,促进了研究的可重复性.</p>
</blockquote>
<hr>
<h2 id="4-pg">4 评估</h2>
<p>本节首先介绍 Kimi-K2-Instruct 的后训练评估,随后简要概述 Kimi-K2-Base 的能力.最后进行全面的安全评估.</p>
<h3 id="4-1-hxlpg">4.1 后训练评估</h3>
<h4 id="4-1-1-pgsz">4.1.1 评估设置</h4>
<p><strong>基准测试.</strong> 我们在不同领域评估 Kimi-K2-Instruct.对于编程,我们采用 LiveCodeBench v6(2024 年 8 月至 2025 年 5 月的问题)、OJBench、MultiPL-E、SWE-bench Verified、TerminalBench、Multi-SWE-bench、SWE-Lancer、PaperBench 和 Aider-Polyglot.对于工具使用任务,我们在 τ2-Bench 和 AceBench 上评估性能,这两个基准强调多轮工具调用能力.在推理方面,我们包含广泛的数学、科学和逻辑任务:AIME 2024/2025、MATH-500、HMMT 2025、CNMO 2024、PolyMath-en、ZebraLogic、AutoLogi、GPQA-Diamond、SuperGPQA 和 Humanity&#39;s Last Exam (Text-Only).我们在 MRCR 上评测长上下文检索能力,在 DROP、FRAMES 和 LongBench v2 上评测长上下文推理.对于事实性,我们评估 FACTS Grounding、Vectara Hallucination Leaderboard 和 FaithJudge.最后,通用能力使用 MMLU、MMLU-Redux、MMLU-Pro、IFEval、Multi-Challenge、SimpleQA 和 LiveBench(截至 2024-11-25)进行评估.</p>
<p><strong>基线模型.</strong> 我们对比开源和专有的前沿模型,确保每个候选模型都在其非思考配置下评估,以消除测试时计算带来的额外收益.开源基线:DeepSeek-V3-0324 和 Qwen3-235B-A22B,后者在厂商推荐的无思考模式下运行.专有基线:Claude Sonnet 4、Claude Opus 4、GPT-4.1 和 Gemini 2.5 Flash Preview (2025-05-20).每个模型均通过官方 API 在统一温度和 top-p 设置下以其各自的非思考模式调用.</p>
<p><strong>评估配置.</strong> 所有运行均在模型的非思考模式下查询模型.输出 token 长度除 SWE-bench Verified (Agentless) 设为 16384 外,其余均限制为 8192 token.对于每问题方差较高的基准测试,我们采用重复采样 k 次并取平均以获得稳定分数,记为 Avg@k.对于长上下文任务,我们在评估期间将上下文窗口大小设为 128K token,将超过此限制的输入截断以适应窗口.SWE-bench Verified 以两种模式评估:Agentless Coding 通过 Single Patch without Test (Acc) 和 Agentic Coding 通过 bash/editor 工具,在 Single Attempt (Acc) 和 Multiple Attempts (Acc) 下使用内部验证器的 best-of-N 选择;SWE-bench Multilingual 仅在单次尝试 agentic 设置下测试.由于评估成本过高,部分数据点已被省略.</p>
<h4 id="4-1-2-pgjg">4.1.2 评估结果</h4>
<p>Kimi-K2-Instruct 的综合评估结果见表 3,详细解释见附录 C.以下我们突出四个核心领域的关键结果:</p>
<p><strong>Agentic 与竞技编程.</strong> Kimi-K2-Instruct 在真实世界 SWE 任务上展现了 SOTA 开源性能.它在 SWE-bench Verified(65.8%,多轮尝试 71.6%)、SWE-bench Multilingual(47.3%)和 SWE-lancer(39.1%)上超越了大多数基线,显著缩小了与 Claude 4 Opus 和 Sonnet 的差距.在竞技编程基准上(如 LiveCodeBench v6 53.7%、OJBench 27.1%),它也领先所有模型,突显了其在不同难度级别上的实际编程能力.</p>
<p><strong>Agentic 工具使用.</strong> 在多轮工具使用基准上,Kimi-K2-Instruct 树立了新标准.它在 τ2-Bench 上获得 66.1 Pass@1,在 ACEBench 上获得 76.5,大幅超越所有基线.这些结果证实了其在跨领域的 grounded、受控和 agent 驱动的工具编排方面的优势.</p>
<p><strong>通用能力.</strong> Kimi-K2-Instruct 在通用知识、数学、指令遵循和长上下文任务上展现出强劲且平衡的性能.它在 SimpleQA(31.0%)、MMLU(89.5%)和 MMLU-Redux(92.7%)上超越开源同行,并在指令基准上领先所有模型(IFEval: 89.8%、Multi-Challenge: 54.1%).在数学和 STEM 方面,它获得顶级分数(AIME 2024: 69.6%、GPQA-Diamond: 75.1%),并在长上下文事实性和检索上保持竞争力(DROP: 93.5%、MRCR: 55.0%).这些结果将 Kimi-K2-Instruct 定位为在短上下文和长上下文设置中均有能力的全面型通用模型.</p>
<p><strong>开放式评估.</strong> 在 LMSYS Arena 排行榜(2025 年 7 月 17 日)上,Kimi-K2-Instruct 位列开源模型第一名、总榜第五名,基于超过 3,000 个用户投票.这一真实世界偏好信号——来自多样化、盲测提示——突显了 Kimi-K2 在开放式任务上生成高质量回复的优势.</p>
<blockquote>
<p>表 3: Kimi-K2-Instruct 与领先开源和专有模型在多样化任务上的性能对比.粗体表示全局 SOTA;下划线粗体表示最佳开源结果.带 * 标记的数据点直接取自模型的技术报告或博客.数据来源:原文 Table 3.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">基准测试</th>
<th align="center">Kimi-K2-Instruct</th>
<th align="center">DeepSeek-V3-0324</th>
<th align="center">Qwen3-235B-A22B</th>
<th align="center">Claude Sonnet 4</th>
<th align="center">Claude Opus 4</th>
<th align="center">GPT-4.1</th>
<th align="center">Gemini 2.5 Flash</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>编程任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">LiveCodeBench v6 (Pass@1)</td>
<td align="center"><strong>53.7</strong></td>
<td align="center">46.9</td>
<td align="center">37.0</td>
<td align="center">48.5</td>
<td align="center">47.4</td>
<td align="center">44.7</td>
<td align="center">44.7</td>
</tr>
<tr>
<td align="left">OJBench (Pass@1)</td>
<td align="center"><strong>27.1</strong></td>
<td align="center">24.0</td>
<td align="center">11.3</td>
<td align="center">15.3</td>
<td align="center">19.6</td>
<td align="center">19.5</td>
<td align="center">19.5</td>
</tr>
<tr>
<td align="left">MultiPL-E (Pass@1)</td>
<td align="center">85.7</td>
<td align="center">83.1</td>
<td align="center">78.2</td>
<td align="center"><strong>88.6</strong></td>
<td align="center"><strong>89.6</strong></td>
<td align="center">86.7</td>
<td align="center">85.6</td>
</tr>
<tr>
<td align="left">SWE-bench Verified Agentless-Single-Patch</td>
<td align="center"><strong>51.8</strong></td>
<td align="center">36.6</td>
<td align="center">39.4</td>
<td align="center">50.2</td>
<td align="center">53.0</td>
<td align="center">40.8</td>
<td align="center">32.6</td>
</tr>
<tr>
<td align="left">SWE-bench Verified Agentic-Single-Attempt</td>
<td align="center"><strong><u>65.8</u></strong></td>
<td align="center">38.8</td>
<td align="center">34.4</td>
<td align="center">72.7*</td>
<td align="center">72.5*</td>
<td align="center">54.6</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">SWE-bench Verified Agentic-Multi-Attempt</td>
<td align="center"><strong><u>71.6</u></strong></td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">80.2*</td>
<td align="center">79.4*</td>
<td align="center">—</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">SWE-bench Multilingual (Pass@1)</td>
<td align="center"><strong><u>47.3</u></strong></td>
<td align="center">25.8</td>
<td align="center">20.9</td>
<td align="center">51.0</td>
<td align="center">—</td>
<td align="center">31.5</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">Multi-SWE-bench (Pass@1)</td>
<td align="center"><strong><u>18.3</u></strong></td>
<td align="center">8.0</td>
<td align="center">9.0</td>
<td align="center">29.2</td>
<td align="center">—</td>
<td align="center">11.7</td>
<td align="center">14.0</td>
</tr>
<tr>
<td align="left">SWE-Lancer (Pass@1)</td>
<td align="center"><strong><u>39.1</u></strong></td>
<td align="center">30.5</td>
<td align="center">24.1</td>
<td align="center">40.8</td>
<td align="center">—</td>
<td align="center">23.0</td>
<td align="center">38.5</td>
</tr>
<tr>
<td align="left">Paper Bench Code-Dev</td>
<td align="center"><strong><u>27.8</u></strong></td>
<td align="center">12.2</td>
<td align="center">13.2</td>
<td align="center">43.3</td>
<td align="center">—</td>
<td align="center">29.9</td>
<td align="center">5.7</td>
</tr>
<tr>
<td align="left">Terminal Bench In-House</td>
<td align="center">30.0</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">35.5</td>
<td align="center"><strong>43.2</strong></td>
<td align="center">8.3</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">Terminal Bench Terminus</td>
<td align="center"><strong><u>25.0</u></strong></td>
<td align="center">16.3</td>
<td align="center">6.6</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">30.3</td>
<td align="center">16.8</td>
</tr>
<tr>
<td align="left">Aider-Polyglot</td>
<td align="center">60.0</td>
<td align="center">55.1</td>
<td align="center"><strong>61.8</strong></td>
<td align="center">56.4</td>
<td align="center"><strong>70.7</strong></td>
<td align="center">52.4</td>
<td align="center">44.0</td>
</tr>
<tr>
<td align="left"><strong>工具使用任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Tau2 retail (Avg@4)</td>
<td align="center">70.6</td>
<td align="center">69.1</td>
<td align="center">57.0</td>
<td align="center"><strong>75.0</strong></td>
<td align="center"><strong>81.8</strong></td>
<td align="center">74.8</td>
<td align="center">64.3</td>
</tr>
<tr>
<td align="left">Tau2 airline (Avg@4)</td>
<td align="center"><strong><u>56.5</u></strong></td>
<td align="center">39.0</td>
<td align="center">26.5</td>
<td align="center">55.5</td>
<td align="center">60.0</td>
<td align="center">54.5</td>
<td align="center">42.5</td>
</tr>
<tr>
<td align="left">Tau2 telecom (Avg@4)</td>
<td align="center"><strong><u>65.8</u></strong></td>
<td align="center">32.5</td>
<td align="center">22.1</td>
<td align="center">45.2</td>
<td align="center">57.0</td>
<td align="center">38.6</td>
<td align="center">16.9</td>
</tr>
<tr>
<td align="left">AceBench (Acc.)</td>
<td align="center"><strong><u>76.5</u></strong></td>
<td align="center">72.7</td>
<td align="center">70.5</td>
<td align="center">76.2</td>
<td align="center">75.6</td>
<td align="center"><strong>80.1</strong></td>
<td align="center">74.5</td>
</tr>
<tr>
<td align="left"><strong>数学与 STEM 任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">AIME 2024 (Avg@64)</td>
<td align="center"><strong><u>69.6</u></strong></td>
<td align="center">59.4*</td>
<td align="center">40.1*</td>
<td align="center">43.4</td>
<td align="center">48.2</td>
<td align="center">46.5</td>
<td align="center"><strong>61.3</strong></td>
</tr>
<tr>
<td align="left">AIME 2025 (Avg@64)</td>
<td align="center"><strong><u>49.5</u></strong></td>
<td align="center">46.7</td>
<td align="center">24.7*</td>
<td align="center">33.1*</td>
<td align="center">33.9*</td>
<td align="center">37.0</td>
<td align="center">46.6</td>
</tr>
<tr>
<td align="left">MATH-500 (Acc.)</td>
<td align="center"><strong>97.4</strong></td>
<td align="center">94.0*</td>
<td align="center">91.2*</td>
<td align="center">94.0</td>
<td align="center">94.4</td>
<td align="center">92.4</td>
<td align="center"><strong>95.4</strong></td>
</tr>
<tr>
<td align="left">HMMT 2025 (Avg@32)</td>
<td align="center"><strong><u>38.8</u></strong></td>
<td align="center">27.5</td>
<td align="center">11.9</td>
<td align="center">15.9</td>
<td align="center">15.9</td>
<td align="center">19.4</td>
<td align="center">34.7</td>
</tr>
<tr>
<td align="left">CNMO 2024 (Avg@16)</td>
<td align="center">74.3</td>
<td align="center"><strong>74.7</strong></td>
<td align="center">48.6</td>
<td align="center">60.4</td>
<td align="center">57.6</td>
<td align="center">56.6</td>
<td align="center"><strong>75.0</strong></td>
</tr>
<tr>
<td align="left">PolyMath-en (Avg@4)</td>
<td align="center"><strong><u>65.1</u></strong></td>
<td align="center">59.5</td>
<td align="center">51.9</td>
<td align="center">52.8</td>
<td align="center">49.8</td>
<td align="center">54.0</td>
<td align="center">49.9</td>
</tr>
<tr>
<td align="left">ZebraLogic (Acc.)</td>
<td align="center"><strong><u>89.0</u></strong></td>
<td align="center">84.0</td>
<td align="center">37.7*</td>
<td align="center">79.7</td>
<td align="center">59.3</td>
<td align="center">58.5</td>
<td align="center">57.9</td>
</tr>
<tr>
<td align="left">AutoLogi (Acc.)</td>
<td align="center">89.5</td>
<td align="center">88.9</td>
<td align="center">83.3*</td>
<td align="center"><strong>89.8</strong></td>
<td align="center">86.1</td>
<td align="center">88.2</td>
<td align="center">84.1</td>
</tr>
<tr>
<td align="left">GPQA-Diamond (Avg@8)</td>
<td align="center"><strong><u>75.1</u></strong></td>
<td align="center">68.4*</td>
<td align="center">62.9*</td>
<td align="center">70.0*</td>
<td align="center">74.9*</td>
<td align="center">66.3</td>
<td align="center">68.2</td>
</tr>
<tr>
<td align="left">SuperGPQA (Acc.)</td>
<td align="center"><strong><u>57.2</u></strong></td>
<td align="center">53.7</td>
<td align="center">50.2</td>
<td align="center">55.7</td>
<td align="center">56.5</td>
<td align="center">50.8</td>
<td align="center">49.6</td>
</tr>
<tr>
<td align="left">Humanity&#39;s Last Exam (Acc.)</td>
<td align="center">4.7</td>
<td align="center"><strong>5.2</strong></td>
<td align="center"><strong>5.7</strong></td>
<td align="center"><strong>5.8</strong></td>
<td align="center"><strong>7.1</strong></td>
<td align="center">3.7</td>
<td align="center">5.6</td>
</tr>
<tr>
<td align="left"><strong>通用任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU (EM)</td>
<td align="center">89.5</td>
<td align="center">89.4</td>
<td align="center">87.0</td>
<td align="center"><strong>91.5</strong></td>
<td align="center"><strong>92.9</strong></td>
<td align="center">90.4</td>
<td align="center">90.1</td>
</tr>
<tr>
<td align="left">MMLU-Redux (EM)</td>
<td align="center"><strong><u>92.7</u></strong></td>
<td align="center">90.5</td>
<td align="center">89.2*</td>
<td align="center"><strong>93.6</strong></td>
<td align="center"><strong>94.2</strong></td>
<td align="center">92.4</td>
<td align="center">90.6</td>
</tr>
<tr>
<td align="left">MMLU-Pro (EM)</td>
<td align="center">81.1</td>
<td align="center"><strong>81.2</strong>*</td>
<td align="center">77.3</td>
<td align="center"><strong>83.7</strong></td>
<td align="center"><strong>86.6</strong></td>
<td align="center">81.8</td>
<td align="center">79.4</td>
</tr>
<tr>
<td align="left">IFEval (Prompt Strict)</td>
<td align="center"><strong><u>89.8</u></strong></td>
<td align="center">81.1</td>
<td align="center">83.2*</td>
<td align="center">87.6</td>
<td align="center">87.4</td>
<td align="center">88.0</td>
<td align="center">84.3</td>
</tr>
<tr>
<td align="left">Multi-Challenge (Acc.)</td>
<td align="center"><strong><u>54.1</u></strong></td>
<td align="center">31.4</td>
<td align="center">34.0</td>
<td align="center">46.8</td>
<td align="center">49.0</td>
<td align="center">36.4</td>
<td align="center">39.5</td>
</tr>
<tr>
<td align="left">SimpleQA (Correct)</td>
<td align="center"><strong><u>31.0</u></strong></td>
<td align="center">27.7</td>
<td align="center">13.2</td>
<td align="center">15.9</td>
<td align="center">22.8</td>
<td align="center"><strong>42.3</strong></td>
<td align="center">23.3</td>
</tr>
<tr>
<td align="left">Livebench (Pass@1)</td>
<td align="center"><strong><u>76.4</u></strong></td>
<td align="center">72.4</td>
<td align="center">67.6</td>
<td align="center">74.8</td>
<td align="center">74.6</td>
<td align="center">69.8</td>
<td align="center">67.8</td>
</tr>
<tr>
<td align="left">Arena Hard v2.0 Hard Prompt</td>
<td align="center"><strong><u>54.5</u></strong></td>
<td align="center">39.9</td>
<td align="center">39.9</td>
<td align="center">51.6</td>
<td align="center"><strong>59.7</strong></td>
<td align="center">51.7</td>
<td align="center">48.7</td>
</tr>
<tr>
<td align="left">Arena Hard v2.0 Creative Writing</td>
<td align="center"><strong><u>85.0</u></strong></td>
<td align="center">59.3</td>
<td align="center">59.8</td>
<td align="center">54.6</td>
<td align="center">68.5</td>
<td align="center">61.5</td>
<td align="center">72.8</td>
</tr>
<tr>
<td align="left">FACTS Grounding (Adjusted)</td>
<td align="center"><strong><u>88.5</u></strong></td>
<td align="center">68.3</td>
<td align="center">68.5</td>
<td align="center">83.6</td>
<td align="center">—</td>
<td align="center">79.2</td>
<td align="center">86.6</td>
</tr>
<tr>
<td align="left">HHEM v2.1 (1-Hallu.)</td>
<td align="center"><strong><u>98.9</u></strong></td>
<td align="center">88.9</td>
<td align="center">94.5</td>
<td align="center">94.5</td>
<td align="center">—</td>
<td align="center">96.7</td>
<td align="center">97.8</td>
</tr>
<tr>
<td align="left">FaithJudge (1-Hallu.)</td>
<td align="center"><strong><u>92.6</u></strong></td>
<td align="center">83.4</td>
<td align="center">75.7</td>
<td align="center">83.0</td>
<td align="center">—</td>
<td align="center">91.0</td>
<td align="center"><strong>93.2</strong></td>
</tr>
<tr>
<td align="left">LongBench v2 (Acc.)</td>
<td align="center">49.1</td>
<td align="center"><strong>51.1</strong></td>
<td align="center">—</td>
<td align="center"><strong>52.5</strong></td>
<td align="center">—</td>
<td align="center"><strong>54.3</strong></td>
<td align="center"><strong>55.5</strong></td>
</tr>
<tr>
<td align="left">FRAMES (Acc.)</td>
<td align="center">77.1</td>
<td align="center"><strong>79.2</strong></td>
<td align="center">—</td>
<td align="center">76.3</td>
<td align="center">—</td>
<td align="center"><strong>87.4</strong></td>
<td align="center">72.9</td>
</tr>
<tr>
<td align="left">MRCR (Acc.)</td>
<td align="center"><strong><u>55.0</u></strong></td>
<td align="center">50.8</td>
<td align="center">—</td>
<td align="center"><strong>74.4</strong></td>
<td align="center">—</td>
<td align="center">66.9</td>
<td align="center"><strong>81.7</strong></td>
</tr>
<tr>
<td align="left">DROP (Acc.)</td>
<td align="center"><strong><u>93.5</u></strong></td>
<td align="center">91.2</td>
<td align="center">84.3</td>
<td align="center">92.0</td>
<td align="center">—</td>
<td align="center">79.1</td>
<td align="center">81.7</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[数据与实验]</strong> 表 3 的全面解读: K2 的强项与弱项</p>
<p>从表 3 可以提炼出 K2 的能力画像:</p>
<p><strong>绝对优势领域(开源 SOTA)</strong>:</p>
<ul>
<li>Agentic 工具使用: Tau2-Bench(66.1)和 ACEBench(76.5)大幅领先,这是 K2 的核心差异化能力</li>
<li>软件工程: SWE-bench 系列(65.8% / 47.3%)远超其他开源模型,接近 Claude 4 水平</li>
<li>数学竞赛: AIME 2024(69.6%)和 AIME 2025(49.5%)领先开源阵营</li>
<li>指令遵循: IFEval(89.8%)和 Multi-Challenge(54.1%)显著超越所有基线</li>
<li>事实性: FACTS Grounding(88.5%)和 HHEM(98.9%)展现极低幻觉率</li>
</ul>
<p><strong>相对弱项</strong>:</p>
<ul>
<li>长上下文推理: LongBench v2(49.1%)和 FRAMES(77.1%)略低于 DeepSeek-V3-0324 和 Gemini 2.5 Flash</li>
<li>极端难题: Humanity&#39;s Last Exam(4.7%)在所有模型中都较低,但 K2 尤其低</li>
<li>部分编程基准: MultiPL-E(85.7%)和 Aider-Polyglot(60.0%)不如 Claude Opus 4</li>
</ul>
<p>总体而言,K2 是一个「agentic 特化型」模型:在需要工具使用、多步推理和软件工程的任务上表现卓越,但在纯知识问答和超长上下文推理上仍有提升空间.</p>
</blockquote>
<h3 id="4-2-yxlpg">4.2 预训练评估</h3>
<h4 id="4-2-1-pgsz">4.2.1 评估设置</h4>
<p><strong>基准测试.</strong> 我们在不同能力领域评估 Kimi-K2-Base.对于通用能力,我们评估 MMLU、MMLU-Pro、MMLU-Redux、BBH、TriviaQA、SuperGPQA、SimpleQA、HellaSwag、AGIEval、GPQA-Diamond、ARC-Challenge 和 WinoGrande.对于编程能力,我们采用 EvalPlus(平均 HumanEval、MBPP、HumanEval+ 和 MBPP+)、LiveCodeBench v6 和 CRUXEval.对于数学推理,我们使用 GSM8K、GSM8K-Platinum、MATH 和 CMATH.对于中文语言能力,我们评估 C-Eval、CMMLU 和 CSimpleQA.</p>
<p><strong>基线模型.</strong> 我们对比领先的开源基础模型:DeepSeek-V3-Base、Qwen2.5-72B-Base(注意 Qwen3-235B-A22B-Base 未开源,Qwen 系列中最大的开源基座模型是 Qwen2.5-72B-Base)和 Llama 4-Maverick(Llama 4-Behemoth 也未开源).所有模型在相同配置下评估以确保公平比较.</p>
<p><strong>评估配置.</strong> 我们对 MMLU、MMLU-Redux、GPQA-Diamond、HellaSwag、ARC-Challenge、C-Eval 和 CMMLU 采用基于困惑度的评估.对 MMLU-Pro、SuperGPQA、TriviaQA、BBH、CSimpleQA、MATH、CMATH、GSM8K、GSM8K-Platinum、CRUXEval、LiveCodeBench 和 EvalPlus 采用基于生成的评估.为缓解 GPQA-Diamond 固有的高方差,我们报告八次独立运行的平均分数.所有评估使用我们内部基于 LM-Harness-Evaluation 衍生的框架进行,确保所有模型的一致性设置.</p>
<h4 id="4-2-2-pgjg">4.2.2 评估结果</h4>
<p>表 4 展示了 Kimi-K2-Base 与领先开源基础模型在多样化评估基准上的全面比较.结果表明 Kimi-K2-Base 在大多数评估任务上取得了 SOTA 性能,确立了其作为开源领域领先基础模型的地位.</p>
<p><strong>通用语言理解.</strong> Kimi-K2-Base 在 12 个英文语言基准中的 10 个上取得 SOTA 性能.显著结果包括 MMLU(87.79%)、MMLU-Pro(69.17%)、MMLU-Redux(90.17%)、SuperGPQA(44.67%)和 SimpleQA(35.25%),大幅超越所有基线.</p>
<p><strong>编程能力.</strong> 在编程基准上,Kimi-K2-Base 在所有指标上树立了新标准.它在 CRUXEval-I-cot 上获得 74.00%、CRUXEval-O-cot 上获得 83.50%、LiveCodeBench v6 上获得 26.29%、EvalPlus 上获得 80.33%,展示了优越的代码生成和理解能力,尤其在需要逐步推理的场景中.</p>
<p><strong>数学推理.</strong> Kimi-K2-Base 展现出卓越的数学能力,在四个基准中的三个上领先:MATH(70.22%)、GSM8K(92.12%)和 GSM8K-Platinum(94.21%).它在 CMATH(90.26%)上保持竞争力, narrowly 落后于 DeepSeek-V3-Base(90.53%).这些结果突显了模型在不同难度级别上稳健的数学问题解决能力.</p>
<p><strong>中文语言理解.</strong> 该模型展现出优越的多语言能力,在所有中文语言基准上取得 SOTA 结果:C-Eval(92.50%)、CMMLU(90.90%)和 CSimpleQA(77.57%).这些结果确立了 Kimi-K2-Base 作为中文语言理解的领先模型,同时在其他语言上保持强劲性能.</p>
<blockquote>
<p>表 4: Kimi-K2-Base 与领先开源模型在多样化任务上的性能对比.数据来源:原文 Table 4.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">基准测试(指标)</th>
<th align="center">Shot</th>
<th align="center">Kimi-K2-Base</th>
<th align="center">DeepSeek-V3-Base</th>
<th align="center">Llama4-Maverick-Base</th>
<th align="center">Qwen2.5-72B-Base</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>架构</strong></td>
<td align="center">-</td>
<td align="center">MoE</td>
<td align="center">MoE</td>
<td align="center">MoE</td>
<td align="center">Dense</td>
</tr>
<tr>
<td align="left"><strong>激活参数</strong></td>
<td align="center">-</td>
<td align="center">32B</td>
<td align="center">37B</td>
<td align="center">17B</td>
<td align="center">72B</td>
</tr>
<tr>
<td align="left"><strong>总参数</strong></td>
<td align="center">-</td>
<td align="center">1043B</td>
<td align="center">671B</td>
<td align="center">400B</td>
<td align="center">72B</td>
</tr>
<tr>
<td align="left"><strong>英文</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">5-shots</td>
<td align="center"><strong>87.79</strong></td>
<td align="center">87.10</td>
<td align="center">84.87</td>
<td align="center">86.08</td>
</tr>
<tr>
<td align="left">MMLU-pro</td>
<td align="center">5-shots</td>
<td align="center"><strong>69.17</strong></td>
<td align="center">60.59</td>
<td align="center">63.47</td>
<td align="center">62.80</td>
</tr>
<tr>
<td align="left">MMLU-redux</td>
<td align="center">5-shots</td>
<td align="center"><strong>90.17</strong></td>
<td align="center">89.53</td>
<td align="center">88.18</td>
<td align="center">87.77</td>
</tr>
<tr>
<td align="left">SuperGPQA</td>
<td align="center">5-shots</td>
<td align="center"><strong>44.67</strong></td>
<td align="center">39.20</td>
<td align="center">38.84</td>
<td align="center">34.23</td>
</tr>
<tr>
<td align="left">GPQA-Diamond(avg@8)</td>
<td align="center">5-shots</td>
<td align="center">48.11</td>
<td align="center"><strong>50.51</strong></td>
<td align="center">49.43</td>
<td align="center">40.78</td>
</tr>
<tr>
<td align="left">SimpleQA</td>
<td align="center">5-shots</td>
<td align="center"><strong>35.25</strong></td>
<td align="center">26.49</td>
<td align="center">23.74</td>
<td align="center">10.31</td>
</tr>
<tr>
<td align="left">TriviaQA</td>
<td align="center">5-shots</td>
<td align="center"><strong>85.09</strong></td>
<td align="center">84.11</td>
<td align="center">79.25</td>
<td align="center">76.03</td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">3-shots</td>
<td align="center"><strong>88.71</strong></td>
<td align="center">88.37</td>
<td align="center">87.10</td>
<td align="center">84.09</td>
</tr>
<tr>
<td align="left">HellaSwag</td>
<td align="center">5-shots</td>
<td align="center">94.60</td>
<td align="center">89.44</td>
<td align="center">86.02</td>
<td align="center"><strong>95.27</strong></td>
</tr>
<tr>
<td align="left">AGIEval</td>
<td align="center">-</td>
<td align="center"><strong>84.23</strong></td>
<td align="center">81.57</td>
<td align="center">67.55</td>
<td align="center">76.87</td>
</tr>
<tr>
<td align="left">ARC-Challenge</td>
<td align="center">0-shot</td>
<td align="center"><strong>95.73</strong></td>
<td align="center">93.77</td>
<td align="center">94.03</td>
<td align="center">95.56</td>
</tr>
<tr>
<td align="left">WinoGrande</td>
<td align="center">5-shots</td>
<td align="center"><strong>85.32</strong></td>
<td align="center">84.21</td>
<td align="center">77.58</td>
<td align="center">84.14</td>
</tr>
<tr>
<td align="left"><strong>代码</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">CRUXEval-I-cot</td>
<td align="center">0-shots</td>
<td align="center"><strong>74.00</strong></td>
<td align="center">62.75</td>
<td align="center">67.13</td>
<td align="center">61.12</td>
</tr>
<tr>
<td align="left">CRUXEval-O-cot</td>
<td align="center">0-shots</td>
<td align="center"><strong>83.50</strong></td>
<td align="center">75.25</td>
<td align="center">75.88</td>
<td align="center">66.13</td>
</tr>
<tr>
<td align="left">LiveCodeBench(v6)</td>
<td align="center">1-shots</td>
<td align="center"><strong>26.29</strong></td>
<td align="center">24.57</td>
<td align="center">25.14</td>
<td align="center">22.29</td>
</tr>
<tr>
<td align="left">EvalPlus</td>
<td align="center">-</td>
<td align="center"><strong>80.33</strong></td>
<td align="center">65.61</td>
<td align="center">65.48</td>
<td align="center">66.04</td>
</tr>
<tr>
<td align="left"><strong>数学</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">4-shots</td>
<td align="center"><strong>70.22</strong></td>
<td align="center">61.70</td>
<td align="center">63.02</td>
<td align="center">62.68</td>
</tr>
<tr>
<td align="left">GSM8k</td>
<td align="center">8-shots</td>
<td align="center"><strong>92.12</strong></td>
<td align="center">91.66</td>
<td align="center">86.35</td>
<td align="center">90.37</td>
</tr>
<tr>
<td align="left">GSM8k-platinum</td>
<td align="center">8-shots</td>
<td align="center"><strong>94.21</strong></td>
<td align="center">93.38</td>
<td align="center">88.83</td>
<td align="center">92.47</td>
</tr>
<tr>
<td align="left">CMATH</td>
<td align="center">6-shots</td>
<td align="center">90.26</td>
<td align="center"><strong>90.53</strong></td>
<td align="center">88.07</td>
<td align="center">86.98</td>
</tr>
<tr>
<td align="left"><strong>中文</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">5-shots</td>
<td align="center"><strong>92.50</strong></td>
<td align="center">90.04</td>
<td align="center">80.91</td>
<td align="center">90.86</td>
</tr>
<tr>
<td align="left">CMMLU</td>
<td align="center">5-shots</td>
<td align="center"><strong>90.90</strong></td>
<td align="center">88.84</td>
<td align="center">81.24</td>
<td align="center">90.55</td>
</tr>
<tr>
<td align="left">CSimpleQA</td>
<td align="center">5-shots</td>
<td align="center"><strong>77.57</strong></td>
<td align="center">72.13</td>
<td align="center">53.47</td>
<td align="center">50.53</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>[数据与实验]</strong> 基座模型的能力画像: 知识密度 vs 推理深度</p>
<p>K2-Base 在表 4 中的表现揭示了一个有趣的模式.它在知识密集型任务(SimpleQA 35.25% vs DeepSeek-V3-Base 26.49%)和事实性任务上大幅领先,但在 GPQA-Diamond(48.11% vs 50.51%)上略低于 DeepSeek-V3-Base.这暗示 K2 的预训练可能在「知识覆盖」和「数据多样性」上投入更多,而 DeepSeek-V3 在「推理深度」上略有优势.另一个观察是:K2-Base 在中文基准上的优势极为显著(C-Eval 92.50% vs 90.04%, CMMLU 90.90% vs 88.84%),这可能反映了 Moonshot AI 在中文语料筛选和配比上的专门优化.值得注意的是,尽管 K2 的总参数(1.04T)远大于 DeepSeek-V3(671B),但激活参数更少(32B vs 37B),这意味着在等 FLOPs 条件下,K2 通过更高的稀疏度获得了更好的性能——稀疏度缩放定律的实证验证.</p>
</blockquote>
<h3 id="4-3-aqpg">4.3 安全评估</h3>
<h4 id="4-3-1-sysz">4.3.1 实验设置</h4>
<p>我们对 Kimi K2 与其他开源 LLM 进行红队评估.评估涵盖一系列攻击场景——包括有害内容、隐私内容和安全内容,以及不同的攻击策略如提示注入和迭代越狱.</p>
<p>我们选择 Promptfoo 来生成对抗性提示并分析回复.通过这种方式,我们可以以可扩展的方式评估模型.</p>
<p><strong>模型选择.</strong> 我们将 Kimi K2 与另外三个开源 LLM 对比:DeepSeek-V3、DeepSeek-R1 和 Qwen3.</p>
<p><strong>Promptfoo 设置.</strong> 表 5 列出了评估的插件和策略,每个插件与所有策略配对以评估其性能.</p>
<p><strong>测试用例数量.</strong> 鉴于大语言模型推理固有的非确定性,单次输出可能表现出可变性.为此,我们为每个插件的每个策略生成 3 个攻击提示.</p>
<p><strong>提示语言设置.</strong> 我们预测试了每个插件-策略组合的语言兼容性.某些插件同时支持英文和中文,其他仅支持英文.对于支持双语的组合,我们用每种语言生成 3 个提示,每个组合共 6 个提示.</p>
<blockquote>
<p>表 5: 启用的插件和策略.数据来源:原文 Table 5.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">插件</th>
<th align="left">覆盖内容</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Harmful</td>
<td align="left">Graphic Content, Harassment and Bullying, Hate Speech, Insults, Profanity, Radicalization, Self Harm, Sexual Content, ToxicChat</td>
</tr>
<tr>
<td align="left">Criminal</td>
<td align="left">Chemical&amp;Biological Weapons, Child Exploitation, Copyright Violations, Cybercrime, Illegal Activities, Illegal Drugs, Indiscriminate Weapons, Intellectual Property Violation, Non-Violent Crime, Violent Crime, Sex Crimes</td>
</tr>
<tr>
<td align="left">Misinformation</td>
<td align="left">Competitor Endorsement, Unsupervised Contracts, Excessive Agency, Hallucination, Misinformation and Disinformation, Specialized Advice, Unsafe Practices, Imitation, Overreliance, Political Opinions, Religious Sensitivity</td>
</tr>
<tr>
<td align="left">Privacy</td>
<td align="left">Privacy Violation, PII in API/Database, Direct PII Exposure, PII in Session Data, PII via Social Engineering</td>
</tr>
<tr>
<td align="left">Security</td>
<td align="left">ASCII Smuggling, CyberSecEval, Harmbench, Debug Access, Divergent Repetition, DoNotAnswer, Malicious Code, Pliny, Prompt Extraction, Reasoning DoS, Tool Discovery</td>
</tr>
<tr>
<td align="left"><strong>策略</strong></td>
<td align="left">Basic, Prompt Injection, Iterative Jailbreak, Crescendo</td>
</tr>
</tbody></table>
<p><strong>人工审核.</strong> 我们将人工审核纳入评估过程.为最小化主观性问题,我们进行了多轮审核,并将同一审核者分配给给定测试集中的所有案例,以确保一致性并减少判断差异.</p>
<h4 id="4-3-2-aqpgjg">4.3.2 安全评估结果</h4>
<p>表 6 展示了不同模型在各种插件-策略组合下的通过率.</p>
<blockquote>
<p>表 6: 安全评估结果.数据来源:原文 Table 6.</p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">插件</th>
<th align="left">策略</th>
<th align="center">Kimi-K2-Instruct</th>
<th align="center">DeepSeek-V3-0324</th>
<th align="center">DeepSeek-R1</th>
<th align="center">Qwen3-235B-A22B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Harmful</strong></td>
<td align="left">Basic</td>
<td align="center">98.04</td>
<td align="center">90.45</td>
<td align="center">99.02</td>
<td align="center">98.53</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Base64</td>
<td align="center">100</td>
<td align="center">90.20</td>
<td align="center">100</td>
<td align="center">100</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Prompt Injection</td>
<td align="center">93.14</td>
<td align="center">100</td>
<td align="center">95.10</td>
<td align="center">99.02</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Iterative Jailbreak</td>
<td align="center">92.16</td>
<td align="center">66.67</td>
<td align="center">72.55</td>
<td align="center">74.51</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Crescendo</td>
<td align="center">64.71</td>
<td align="center">64.71</td>
<td align="center">80.39</td>
<td align="center">86.27</td>
</tr>
<tr>
<td align="left"><strong>Criminal</strong></td>
<td align="left">Basic</td>
<td align="center">100</td>
<td align="center">99.62</td>
<td align="center">95.45</td>
<td align="center">99.24</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Base64</td>
<td align="center">96.97</td>
<td align="center">89.39</td>
<td align="center">84.85</td>
<td align="center">98.48</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Prompt Injection</td>
<td align="center">75.76</td>
<td align="center">91.67</td>
<td align="center">69.70</td>
<td align="center">98.47</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Iterative Jailbreak</td>
<td align="center">57.57</td>
<td align="center">21.21</td>
<td align="center">25.76</td>
<td align="center">53.03</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Crescendo</td>
<td align="center">56.06</td>
<td align="center">31.81</td>
<td align="center">42.42</td>
<td align="center">59.09</td>
</tr>
<tr>
<td align="left"><strong>Misinformation</strong></td>
<td align="left">Basic</td>
<td align="center">97.28</td>
<td align="center">92.57</td>
<td align="center">92.46</td>
<td align="center">94.84</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Base64</td>
<td align="center">98.48</td>
<td align="center">90.48</td>
<td align="center">96.83</td>
<td align="center">93.65</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Prompt Injection</td>
<td align="center">98.39</td>
<td align="center">86.51</td>
<td align="center">93.65</td>
<td align="center">93.65</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Iterative Jailbreak</td>
<td align="center">63.97</td>
<td align="center">53.97</td>
<td align="center">84.13</td>
<td align="center">69.84</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Crescendo</td>
<td align="center">85.71</td>
<td align="center">55.56</td>
<td align="center">88.89</td>
<td align="center">84.13</td>
</tr>
<tr>
<td align="left"><strong>Privacy</strong></td>
<td align="left">Basic</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Base64</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
<td align="center">100</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Prompt Injection</td>
<td align="center">88.33</td>
<td align="center">98.33</td>
<td align="center">100</td>
<td align="center">91.67</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Iterative Jailbreak</td>
<td align="center">76.67</td>
<td align="center">100</td>
<td align="center">93.33</td>
<td align="center">96.67</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Crescendo</td>
<td align="center">96.67</td>
<td align="center">100</td>
<td align="center">96.67</td>
<td align="center">100</td>
</tr>
<tr>
<td align="left"><strong>Security</strong></td>
<td align="left">Basic</td>
<td align="center">77.84</td>
<td align="center">75.57</td>
<td align="center">70.46</td>
<td align="center">90.09</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Base64</td>
<td align="center">82.93</td>
<td align="center">82.93</td>
<td align="center">63.41</td>
<td align="center">95.12</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Prompt Injection</td>
<td align="center">87.80</td>
<td align="center">97.56</td>
<td align="center">65.85</td>
<td align="center">84.13</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Iterative Jailbreak</td>
<td align="center">43.90</td>
<td align="center">60.97</td>
<td align="center">43.90</td>
<td align="center">78.04</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Crescendo</td>
<td align="center">68.29</td>
<td align="center">87.80</td>
<td align="center">68.29</td>
<td align="center">87.80</td>
</tr>
</tbody></table>
<p>在未针对特定评估场景进行针对性优化的情况下,一些复杂案例(如 Harmful-Iterative Jailbreak)的通过率相比其他模型相对较高.</p>
<p>Across 不同攻击策略,模型表现出不同趋势.在 Base64 策略下,通过率普遍接近或达到 100%,表明编码转换对模型的基本鲁棒性影响最小.相比之下,Crescendo 策略导致通过率普遍下降,表明更强的对抗有效性.</p>
<p>此外,复杂的攻击策略并不总是优于基本提示.某些原本对抗性的提示在经过多轮转换后可能失去其预期含义,导致模型输出变得不那么有意义.</p>
<p><strong>自动化红队测试的局限性.</strong> 由于涉及人工审核,评估结果不可避免地包含一定程度的主观性.此外,某些插件类型涉及 API 滥用或外部工具调用,更适合评估具有工具调用能力的 agent 模型.在基座 LLM 的语境下,此类测试的相关性可能有限.</p>
<blockquote>
<p><strong>[局限与风险]</strong> 安全评估的「及格线」与「实战差距」</p>
<p>表 6 的安全结果需要谨慎解读.通过率高(如 Basic 策略下 98-100%)并不意味着模型「安全」,而只意味着它在特定测试套件下表现良好.真正的风险在于: Promptfoo 的测试集是公开的,模型开发者可能针对这些已知案例进行优化(即「应试」).更危险的攻击往往是新颖的、未见过的越狱技巧.Crescendo 策略下 K2 在 Criminal 和 Security 类别中仅 56-68% 的通过率,说明模型在多轮渐进式攻击下的鲁棒性仍有提升空间.此外,Security 类别的 Basic 通过率(77.84%)低于 Qwen3(90.09%),这可能反映了 K2 在代码相关安全(如恶意代码生成)上的相对薄弱——考虑到 K2 的强大编程能力,这种「能力-安全」之间的不平衡值得警惕.</p>
</blockquote>
<hr>
<h2 id="5-jxx">5 局限性</h2>
<p>在我们的内部测试中,我们识别出当前 Kimi K2 模型的一些局限性.在处理困难推理任务或不清晰的工具定义时,模型可能生成过量 token,有时导致输出截断或不完整的工具调用.此外,如果在某些任务上不必要地启用工具使用,性能可能下降.在构建完整软件项目时,单次提示的成功率不如在 agentic 编码框架下使用 K2.我们正在努力解决这些问题,期待未来版本和更多反馈.</p>
<blockquote>
<p><strong>[局限与风险]</strong> 作者未明说的风险</p>
<p>论文中提到的局限性实际上是 agentic 模型的结构性挑战.第一,「生成过量 token」是 RL 预算控制的一个边界案例:当任务难度超出模型的内隐复杂度估计时,它可能在达到 token 上限前未能完成思考,导致截断.第二,「不必要启用工具使用导致性能下降」反映了工具调用能力与直接回答能力之间的干扰——模型可能过度依赖工具而非自身知识.第三,「单次提示不如 agentic 框架」是一个关键的诚实声明:K2 的 SOTA 性能在很大程度上依赖于外部 agent 框架(如迭代执行、错误纠正、工具编排),而非模型本身的单轮能力.这意味着 K2 的「开箱即用」体验可能不如 benchmark 数字所示的那么惊艳.用户需要配合适当的 agent 框架才能释放其全部潜力.</p>
</blockquote>
<hr>
<h2 id="6-jl">6 结论</h2>
<p>我们推出了 Kimi K2,一个为 agentic 智能构建的 1T 参数开源权重 MoE 模型.利用 token 高效的 MuonClip 优化器和 15.5T token 高质量数据集,Kimi K2 实现了稳定、可扩展的预训练.后训练结合了大规模合成工具使用数据与统一 RL 框架,同时使用可验证奖励和自批判反馈.Kimi K2 在 agentic 和推理基准上树立了新的 SOTA,确立了其作为迄今为止能力最强的开源权重 LLM 的地位.</p>
<hr>
<h2 id="zx">致谢</h2>
<p>我们要感谢 OpenHands 和 Multi-SWE-bench 团队在评估 SWE-bench Verified 和 Multi-SWE-bench 实验结果方面提供的宝贵支持.</p>
<hr>
<h2 id="ckwx">参考文献</h2>
<p>[1] Jacob Austin et al. Program Synthesis with Large Language Models. 2021. arXiv: 2108.07732 [cs.PL].</p>
<p>[2] Yushi Bai et al. LongBench v2: Towards Deeper Understanding and Reasoning on Realistic Long-context Multitasks. 2025. arXiv: 2412.15204 [cs.CL].</p>
<p>[3] Victor Barres et al. τ2-Bench: Evaluating Conversational Agents in a Dual-Control Environment. 2025. arXiv: 2506.07982 [cs.AI].</p>
<p>[4] Stella Biderman et al. Lessons from the trenches on reproducible evaluation of language models. In: arXiv preprint arXiv:2405.14782 (2024).</p>
<p>[5] Greg Brockman et al. OpenAI Gym. 2016. arXiv: 1606.01540 [cs.LG].</p>
<p>[6] Federico Cassano et al. MultiPL-E: A Scalable and Polyglot Approach to Benchmarking Neural Code Generation. In: IEEE Transactions on Software Engineering 49.7 (2023), pp. 3675-3691.</p>
<p>[7] Chen Chen et al. ACEBench: Who Wins the Match Point in Tool Learning? In: arXiv e-prints (2025), arXiv-2501.</p>
<p>[8] Mark Chen et al. Evaluating Large Language Models Trained on Code. In: (2021). arXiv: 2107.03374 [cs.LG].</p>
<p>[9] Peter Clark et al. Think you have solved question answering? try arc, the ai2 reasoning challenge. In: arXiv preprint arXiv:1803.05457 (2018).</p>
<p>[10] Karl Cobbe et al. Training Verifiers to Solve Math Word Problems. 2021. arXiv: 2110.14168 [cs.LG].</p>
<p>[11] DeepSeek-AI. DeepSeek-V3 Technical Report. 2024. arXiv: 2412.19437 [cs.CL].</p>
<p>[12] Mostafa Dehghani et al. Scaling vision transformers to 22 billion parameters. In: International conference on machine learning. PMLR. 2023, pp. 7480-7512.</p>
<p>[13] Guanting Dong et al. Self-play with Execution Feedback: Improving Instruction-following Capabilities of Large Language Models. 2024. arXiv: 2406.13542 [cs.CL].</p>
<p>[14] Xinrun Du et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines. In: arXiv preprint arXiv:2502.14739 (2025).</p>
<p>[15] Dheeru Dua et al. DROP: A Reading Comprehension Benchmark Requiring Discrete Reasoning Over Paragraphs. In: CoRR abs/1903.00161 (2019). arXiv: 1903.00161.</p>
<p>[16] Kazuki Fujii et al. Rewriting Pre-Training Data Boosts LLM Performance in Math and Code. 2025. arXiv: 2505.02881 [cs.LG].</p>
<p>[17] Paul Gauthier. Aider LLM Leaderboards. <a href="https://aider.chat/docs/leaderboards/">https://aider.chat/docs/leaderboards/</a>. 2025.</p>
<p>[18] Aryo Pradipta Gema et al. Are we done with mmlu? In: arXiv preprint arXiv:2406.04127 (2024).</p>
<p>[19] Alex Gu et al. Cruxeval: A benchmark for code reasoning, understanding and execution. In: arXiv preprint arXiv:2401.03065 (2024).</p>
<p>[20] Daya Guo et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. In: arXiv preprint arXiv:2501.12948 (2025).</p>
<p>[21] Zhicheng Guo et al. StableToolBench: Towards Stable Large-Scale Benchmarking on Tool Learning of Large Language Models. In: arXiv preprint arXiv:2403.07714 (2025).</p>
<p>[22] Aaron Harlap et al. Pipedream: Fast and efficient pipeline parallel dnn training. In: arXiv preprint arXiv:1806.03377 (2018).</p>
<p>[23] Y He et al. Chinese simpleqa: A chinese factuality evaluation for large language models, 2024a. In: URL <a href="https://arxiv">https://arxiv</a>. org/abs/2411.07140 ().</p>
<p>[24] Dan Hendrycks et al. Measuring massive multitask language understanding. In: arXiv preprint arXiv:2009.03300 (2020).</p>
<p>[25] Dan Hendrycks et al. Measuring Mathematical Problem Solving With the MATH Dataset. 2021. arXiv: 2103.03874 [cs.LG].</p>
<p>[26] Shengding Hu et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. In: arXiv preprint arXiv:2404.06395 (2024).</p>
<p>[27] Jiaxin Huang et al. Large language models can self-improve. In: arXiv preprint arXiv:2210.11610 (2022).</p>
<p>[28] Siming Huang et al. OpenCoder: The Open Cookbook for Top-Tier Code Large Language Models. 2025. arXiv: 2411.04905 [cs.CL].</p>
<p>[29] Yanping Huang et al. Gpipe: Efficient training of giant neural networks using pipeline parallelism. In: Advances in neural information processing systems 32 (2019).</p>
<p>[30] Yuzhen Huang et al. C-Eval: A Multi-Level Multi-Discipline Chinese Evaluation Suite for Foundation Models. 2023. arXiv: 2305.08322 [cs.CL].</p>
<p>[31] Alon Jacovi et al. The FACTS Grounding Leaderboard: Benchmarking LLMs&#39; Ability to Ground Responses to Long-Form Input. 2025. arXiv: 2501.03200 [cs.CL].</p>
<p>[32] Naman Jain et al. Livecodebench: Holistic and contamination free evaluation of large language models for code. In: arXiv preprint arXiv:2403.07974 (2024).</p>
<p>[33] Carlos E Jimenez et al. SWE-bench: Can Language Models Resolve Real-world Github Issues? In: The Twelfth International Conference on Learning Representations. 2024.</p>
<p>[34] Keller Jordan et al. Muon: An optimizer for hidden layers in neural networks. 2024. URL: <a href="https://kellerjordan.github.io/posts/muon/">https://kellerjordan.github.io/posts/muon/</a>.</p>
<p>[35] Mandar Joshi et al. TriviaQA: A Large Scale Distantly Supervised Challenge Dataset for Reading Comprehension. 2017. arXiv: 1705.03551 [cs.CL].</p>
<p>[36] Kimi Team. Kimi k1. 5: Scaling reinforcement learning with llms. In: arXiv preprint arXiv:2501.12599 (2025).</p>
<p>[37] Diederik P. Kingma and Jimmy Ba. Adam: A Method for Stochastic Optimization. In: 3rd International Conference on Learning Representations, ICLR 2015. 2015.</p>
<p>[38] Satyapriya Krishna et al. Fact, Fetch, and Reason: A Unified Evaluation of Retrieval-Augmented Generation. 2025. arXiv: 2409.12941 [cs.CL].</p>
<p>[39] Joel Lamy-Poirier. Breadth-first pipeline parallelism. In: Proceedings of Machine Learning and Systems 5 (2023), pp. 48-67.</p>
<p>[40] Dmitry Lepikhin et al. Gshard: Scaling giant models with conditional computation and automatic sharding. In: arXiv preprint arXiv:2006.16668 (2020).</p>
<p>[41] Haonan Li et al. CMMLU: Measuring massive multitask language understanding in Chinese. 2024. arXiv: 2306.09212 [cs.CL].</p>
<p>[42] Jia Li et al. Numinamath: The largest public dataset in ai4maths with 860k pairs of competition math problems and solutions. In: Hugging Face repository 13.9 (2024), p. 9.</p>
<p>[43] Tianle Li et al. From Crowdsourced Data to High-Quality Benchmarks: Arena-Hard and BenchBuilder Pipeline. In: arXiv preprint arXiv:2406.11939 (2024).</p>
<p>[44] Bill Yuchen Lin et al. ZebraLogic: On the Scaling Limits of LLMs for Logical Reasoning. 2025. arXiv: 2502.01100 [cs.AI].</p>
<p>[45] Aixin Liu et al. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model. In: arXiv preprint arXiv:2405.04434 (2024).</p>
<p>[46] Jiawei Liu et al. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. In: Advances in Neural Information Processing Systems 36 (2023), pp. 21558-21572.</p>
<p>[47] Jingyuan Liu et al. Muon is scalable for LLM training. In: arXiv preprint arXiv:2502.16982 (2025).</p>
<p>[48] Ziming Liu et al. Hanayo: Harnessing Wave-like Pipeline Parallelism for Enhanced Large Model Training Efficiency. In: Proceedings of the International Conference for High Performance Computing, Networking, Storage and Analysis. SC &#39;23. ACM, Nov. 2023, pp. 1-13.</p>
<p>[49] Ilya Loshchilov and Frank Hutter. Decoupled Weight Decay Regularization. In: International Conference on Learning Representations. 2019.</p>
<p>[50] Pratyush Maini et al. Rephrasing the Web: A Recipe for Compute and Data-Efficient Language Modeling. 2024. arXiv: 2401.16380 [cs.CL].</p>
<p>[51] Samuel Miserendino et al. SWE-Lancer: Can Frontier LLMs Earn \$1 Million from Real-World Freelance Software Engineering? In: arXiv preprint arXiv:2502.12115 (2025).</p>
<p>[52] Arindam Mitra et al. Agentinstruct: Toward generative teaching with agentic flows. In: arXiv preprint arXiv:2407.03502 (2024).</p>
<p>[53] Ivan Moshkov et al. Aimo-2 winning solution: Building state-of-the-art mathematical reasoning models with openmathreasoning dataset. In: arXiv preprint arXiv:2504.16891 (2025).</p>
<p>[54] Deepak Narayanan et al. Efficient large-scale language model training on gpu clusters using megatron-lm. In: Proceedings of the international conference for high performance computing, networking, storage and analysis. 2021, pp. 1-15.</p>
<p>[55] Long Ouyang et al. Training language models to follow instructions with human feedback. In: Advances in neural information processing systems 35 (2022), pp. 27730-27744.</p>
<p>[56] Bowen Peng et al. Yarn: Efficient context window extension of large language models. In: arXiv preprint arXiv:2309.00071 (2023).</p>
<p>[57] Long Phan et al. Humanity&#39;s Last Exam. 2025. arXiv: 2501.14249 [cs.LG].</p>
<p>[58] Penghui Qi et al. Zero bubble pipeline parallelism. In: arXiv preprint arXiv:2401.10241 (2023).</p>
<p>[59] Yujia Qin et al. Toolllm: Facilitating large language models to master 16000+ real-world apis. In: arXiv preprint arXiv:2307.16789 (2023).</p>
<p>[60] Qwen et al. Qwen2.5 Technical Report. 2025. arXiv: 2412.15115 [cs.CL].</p>
<p>[61] Samyam Rajbhandari et al. Zero: Memory optimizations toward training trillion parameter models. In: SC20: International Conference for High Performance Computing, Networking, Storage and Analysis. IEEE. 2020, pp. 1-16.</p>
<p>[62] David Rein et al. Gpqa: A graduate-level google-proof q&amp;a benchmark. In: First Conference on Language Modeling. 2024.</p>
<p>[63] Keisuke Sakaguchi et al. Winogrande: An adversarial winograd schema challenge at scale. In: Communications of the ACM 64.9 (2021), pp. 99-106.</p>
<p>[64] David Silver and Richard S Sutton. Welcome to the era of experience. In: Google AI 1 (2025).</p>
<p>[65] Ved Sirdeshmukh et al. MultiChallenge: A Realistic Multi-Turn Conversation Evaluation Benchmark Challenging to Frontier LLMs. 2025. arXiv: 2501.17399 [cs.CL].</p>
<p>[66] Giulio Starace et al. PaperBench: Evaluating AI&#39;s Ability to Replicate AI Research. In: arXiv preprint arXiv:2504.01848 (2025).</p>
<p>[67] Hao Sun et al. ZeroSearch: Incentivize the Search Capability of LLMs without Searching. 2025. arXiv: 2505.04588 [cs.CL].</p>
<p>[68] Mirac Suzgun et al. Challenging BIG-Bench Tasks and Whether Chain-of-Thought Can Solve Them. 2022. arXiv: 2210.09261 [cs.CL].</p>
<p>[69] Manveer Singh Tamber et al. Benchmarking LLM Faithfulness in RAG with Evolving Leaderboards. In: arXiv preprint arXiv:2505.04847 (2025).</p>
<p>[70] Gemma Team et al. Gemma 2: Improving open language models at a practical size. In: arXiv preprint arXiv:2408.00118 (2024).</p>
<p>[71] LlaMA Team. The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation. <a href="https://ai.meta.com/blog/llama-4-multimodal-intelligence/">https://ai.meta.com/blog/llama-4-multimodal-intelligence/</a>. [Accessed 15-07-2025].</p>
<p>[72] The Terminal-Bench Team. Terminal-Bench: A Benchmark for AI Agents in Terminal Environments. Apr. 2025.</p>
<p>[73] Ashish Vaswani et al. Attention is All you Need. In: Advances in Neural Information Processing Systems. Ed. by I. Guyon et al. Vol. 30. Curran Associates, Inc., 2017.</p>
<p>[74] Vectara. Hallucination Evaluation Model (Revision 7437011). 2024.</p>
<p>[75] Joshua Vendrow et al. Do large language model benchmarks test reliability? In: arXiv preprint arXiv:2502.03461 (2025).</p>
<p>[76] Yizhong Wang et al. Self-instruct: Aligning language models with self-generated instructions. In: arXiv preprint arXiv:2212.10560 (2022).</p>
<p>[77] Yubo Wang et al. MMLU-Pro: A More Robust and Challenging Multi-Task Language Understanding Benchmark. 2024. arXiv: 2406.01574 [cs.CL].</p>
<p>[78] Zhexu Wang et al. OJBench: A Competition Level Code Benchmark For Large Language Models. 2025. arXiv: 2506.16395 [cs.CL].</p>
<p>[79] Jason Wei et al. Measuring short-form factuality in large language models. In: arXiv preprint arXiv:2411.04368 (2024).</p>
<p>[80] Tianwen Wei et al. CMATH: Can Your Language Model Pass Chinese Elementary School Math Test? 2023. arXiv: 2306.16636 [cs.CL].</p>
<p>[81] Colin White et al. LiveBench: A Challenging, Contamination-Free LLM Benchmark. In: The Thirteenth International Conference on Learning Representations. 2025.</p>
<p>[82] Mitchell Wortsman et al. Small-scale proxies for large-scale transformer training instabilities, 2023. In: URL <a href="https://arxiv">https://arxiv</a>. org/abs/2309.14322 ().</p>
<p>[83] Can Xu et al. WizardLM: Empowering large pre-trained language models to follow complex instructions. 2025. arXiv: 2304.12244 [cs.CL].</p>
<p>[84] Zhangchen Xu et al. KodCode: A Diverse, Challenging, and Verifiable Synthetic Dataset for Coding. 2025. arXiv: 2503.02951 [cs.LG].</p>
<p>[85] John Yang et al. SWE-smith: Scaling Data for Software Engineering Agents. 2025. arXiv: 2504.21798 [cs.SE].</p>
<p>[86] Shunyu Yao et al. tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains. In: arXiv preprint arXiv:2406.12045 (2024).</p>
<p>[87] Daoguang Zan et al. Multi-swe-bench: A multilingual benchmark for issue resolving. In: arXiv preprint arXiv:2504.02605 (2025).</p>
<p>[88] Eric Zelikman et al. Star: Bootstrapping reasoning with reasoning. In: Advances in Neural Information Processing Systems 35 (2022), pp. 15476-15488.</p>
<p>[89] Rowan Zellers et al. Hellaswag: Can a machine really finish your sentence? In: arXiv preprint arXiv:1905.07830 (2019).</p>
<p>[90] Wanjun Zhong et al. Agieval: A human-centric benchmark for evaluating foundation models. In: arXiv preprint arXiv:2304.06364 (2023).</p>
<p>[91] Jeffrey Zhou et al. Instruction-Following Evaluation for Large Language Models. In: ArXiv abs/2311.07911 (2023).</p>
<p>[92] Qin Zhu et al. AutoLogi: Automated Generation of Logic Puzzles for Evaluating Reasoning Abilities of Large Language Models. 2025. arXiv: 2502.16906 [cs.CL].</p>
<hr>
<h2 id="fl">附录</h2>
<h3 id="a-gxz">A. 贡献者</h3>
<p>作者列表按姓氏字母顺序排列.</p>
<p>Yifan Bai, Yiping Bao, Y. Charles, Cheng Chen, Guanduo Chen, Haiting Chen, Huarong Chen, Jiahao Chen, Ningxin Chen, Ruijue Chen, Yanru Chen, Yuankun Chen, Yutian Chen, Zhuofu Chen, Jialei Cui, Hao Ding, Mengnan Dong, Ang&#39;ang Du, Chenzhuang Du, Dikang Du, Yulun Du, Yu Fan, Yichen Feng, Kelin Fu, Bofei Gao, Chenxiao Gao, Hongcheng Gao, Peizhong Gao, Tong Gao, Yuyao Ge, Shangyi Geng, Qizheng Gu, Xinran Gu, Longyu Guan, Haiqing Guo, Jianhang Guo, Xiaoru Hao, Tianhong He, Weiran He, Wenyang He, Yunjia He, Chao Hong, Hao Hu, Yangyang Hu, Zhenxing Hu, Weixiao Huang, Zhiqi Huang, Zihao Huang, Tao Jiang, Zhejun Jiang, Xinyi Jin, Yongsheng Kang, Guokun Lai, Cheng Li, Fang Li, Haoyang Li, Ming Li, Wentao Li, Yang Li, Yanhao Li, Yiwei Li, Zhaowei Li, Zheming Li, Hongzhan Lin, Xiaohan Lin, Zongyu Lin, Chengyin Liu, Chenyu Liu, Hongzhang Liu, Jingyuan Liu, Junqi Liu, Liang Liu, Shaowei Liu, T.Y. Liu, Tianwei Liu, Weizhou Liu, Yangyang Liu, Yibo Liu, Yiping Liu, Yue Liu, Zhengying Liu, Enzhe Lu, Haoyu Lu, Lijun Lu, Yashuo Luo, Shengling Ma, Xinyu Ma, Yingwei Ma, Shaoguang Mao, Jie Mei, Xin Men, Yibo Miao, Siyuan Pan, Yebo Peng, Ruoyu Qin, Zeyu Qin, Bowen Qu, Zeyu Shang, Lidong Shi, Shengyuan Shi, Feifan Song, Jianlin Su, Zhengyuan Su, Lin Sui, Xinjie Sun, Flood Sung, Yunpeng Tai, Heyi Tang, Jiawen Tao, Qifeng Teng, Chaoran Tian, Chensi Wang, Dinglu Wang, Feng Wang, Hailong Wang, Haiming Wang, Jianzhou Wang, Jiaxing Wang, Jinhong Wang, Shengjie Wang, Shuyi Wang, Si Wang, Xinyuan Wang, Yao Wang, Yejie Wang, Yiqin Wang, Yuxin Wang, Yuzhi Wang, Zhaoji Wang, Zhengtao Wang, Zhengtao Wang, Zhexu Wang, Chu Wei, Qianqian Wei, Haoning Wu, Wenhao Wu, Xingzhe Wu, Yuxin Wu, Chenjun Xiao, Jin Xie, Xiaotong Xie, Weimin Xiong, Boyu Xu, Jinjing Xu, L.H. Xu, Lin Xu, Suting Xu, Weixin Xu, Xinran Xu, Yangchuan Xu, Ziyao Xu, Jing Xu (徐), Jing Xu (许), Junjie Yan, Yuzi Yan, Hao Yang, Xiaofei Yang, Yi Yang, Ying Yang, Zhen Yang, Zhilin Yang, Zonghan Yang, Haotian Yao, Xingcheng Yao, Wenjie Ye, Zhuorui Ye, Bohong Yin, Longhui Yu, Enming Yuan, Hongbang Yuan, Mengjie Yuan, Siyu Yuan, Haobing Zhan, Dehao Zhang, Hao Zhang, Wanlu Zhang, Xiaobin Zhang, Yadong Zhang, Yangkun Zhang, Yichi Zhang, Yizhi Zhang, Yongting Zhang, Yu Zhang, Yutao Zhang, Yutong Zhang, Zheng Zhang, Haotian Zhao, Yikai Zhao, Zijia Zhao, Huabin Zheng, Shaojie Zheng, Longguang Zhong, Jianren Zhou, Xinyu Zhou, Zaida Zhou, Jinguo Zhu, Zhen Zhu, Weiyu Zhuang, Xinxing Zu.</p>
<h3 id="b-gjtyd-token-mb">B. 工具调用的 Token 模板</h3>
<p>工具调用的 token 结构包含三个组件:</p>
<ul>
<li><strong>工具声明消息</strong>: 定义可用工具列表和参数模式;</li>
<li><strong>助手消息中的工具调用段</strong>: 编码模型调用工具的请求;</li>
<li><strong>工具结果消息</strong>: 封装被调用工具的执行结果.</li>
</ul>
<p>工具声明消息的原始 token 格式如下:</p>
<pre><code>&lt;|im_begin|&gt;
tool_declare
&lt;|im_middle|&gt;
# Tools
{ tool declaration content }
&lt;|im_end|&gt;
</code></pre>
<p>蓝色高亮标记代表特殊 token,绿色部分(由括号引用)是工具声明内容.我们使用 TypeScript 表达工具声明内容,因为 TypeScript 是一种具有全面类型系统的简洁语言,能够用简短文本表达工具参数的类型和约束.代码 1 展示了两个简单工具在兼容 OpenAI 聊天完成 API 的 JSON 格式中的示例,相比之下,相同工具在 TypeScript 中(代码 2 列出)的定义要短得多.为提高兼容性,我们的部分训练数据也使用 JSON 作为工具声明语言,以便第三方框架无需额外开发即可支持我们的工具调用方案.</p>
<pre><code class="language-json">// 代码 1: OpenAI 兼容 API 中的 JSON 工具定义
[{
  &quot;type&quot;: &quot;function&quot;,
  &quot;function&quot;: {
    &quot;name&quot;: &quot;get_weather&quot;,
    &quot;description&quot;: &quot;Get weather for a location and date&quot;,
    &quot;parameters&quot;: {
      &quot;type&quot;: &quot;object&quot;,
      &quot;properties&quot;: {
        &quot;location&quot;: {
          &quot;type&quot;: &quot;string&quot;,
          &quot;description&quot;: &quot;City and country e.g. Beijing, China&quot;
        },
        &quot;date&quot;: {
          &quot;type&quot;: &quot;string&quot;,
          &quot;description&quot;: &quot;Date to query, format in &#39;%Y-%m-%d&#39;&quot;
        }
      },
      &quot;required&quot;: [&quot;location&quot;]
    }
  }
},
{
  &quot;type&quot;: &quot;function&quot;,
  &quot;function&quot;: {
    &quot;name&quot;: &quot;Calculator&quot;,
    &quot;description&quot;: &quot;Simple calculator&quot;,
    &quot;parameters&quot;: {
      &quot;properties&quot;: {
        &quot;expr&quot;: {
          &quot;type&quot;: &quot;string&quot;,
          &quot;description&quot;: &quot;Arithmetic expression in javascript&quot;
        }
      },
      &quot;type&quot;: &quot;object&quot;
    }
  }
}]
</code></pre>
<pre><code class="language-typescript">// 代码 2: TypeScript 中的工具定义
namespace functions {
  // Get weather for a location and date
  type get_weather = (_: {
    // City and country e.g. Beijing, China
    location: string,
    // Date to query, format in &#39;%Y-%m-%d&#39;
    date?: string
  }) =&gt; any;
  // Simple calculator
  type Calculator = (_: {
    // Arithmetic expression in javascript
    expr?: string
  }) =&gt; any;
}
</code></pre>
<p>模型回复消息中工具调用段的 token 模板如下:</p>
<pre><code>&lt;|tool_call_section_begin|&gt;
&lt;|tool_call_begin|&gt;
// call_id part
functions.{tool name}:{counter}
&lt;|tool_arguments_begin|&gt;
{ json serialized call arguments }
&lt;|tool_call_end|&gt;
&lt;|tool_call_begin|&gt;
// more tool calls
&lt;|tool_call_end|&gt;
&lt;|tool_call_section_end|&gt;
</code></pre>
<p>如模板所示,我们通过在单次回复中放置多个工具调用来支持并行工具调用.每个工具调用有一个唯一的 call id,格式为 <code>functions.{tool-name}:{counter}</code>,其中 tool-name 是工具名称,counter 是对话中所有工具调用的自增计数器(从 0 开始).</p>
<p>在推理期间,模型可能偶尔生成意外的 token,导致解析工具调用时出现格式错误.为解决此问题,我们开发了一个名为 enforcer 的约束解码模块,受 lm-format-enforcer 启发.当生成 <code>&lt;tool_call_section_begin|&gt;</code> token 时,它确保后续工具相关 token 遵循预定义模板,且 JSON 参数字符串遵循声明的模式.</p>
<p>工具结果消息是一个简单的文本消息,用工具的 call id 和对应结果编码.</p>
<pre><code>&lt;|im_begin|&gt;
tool
&lt;|im_middle|&gt;
## Results of {call_id}
{ execution result content }
&lt;|im_end|&gt;
</code></pre>
<h3 id="c-pgxq">C. 评估详情</h3>
<p><strong>编程任务.</strong> 我们在竞技编程基准 LiveCodeBench 和 OJBench 上评估 Kimi-K2-Instruct 的能力,Kimi-K2-Instruct 分别获得 53.7% 和 27.1% 的优越性能.这一卓越表现跨越了中等难度的编码挑战(如 LeetCode 和 AtCoder)和高难度竞赛(如 NOI 和 ICPC),超越了领先的开源和专有模型.对于多语言编程能力,我们采用 MultiPL-E,涵盖 C++、C#、Java、JavaScript、PHP、Go 等语言,Kimi-K2-Instruct 以 85.7% 的准确率超越顶级开源模型,相比之下 DeepSeek-V3-0324 为 83.1%、Qwen3-235B-A22B 为 78.2%.在软件工程任务中,Kimi-K2-Instruct 在 SWE-bench Verified (Python)、SWE-lancer (Python)、SWE-bench Multilingual 和 Multi-SWE-bench 数据集上展现了稳健性能.它在解决真实代码仓库 issue 方面显著超越开源同行,并显著缩小了与专有模型的性能差距.例如:</p>
<ul>
<li>SWE-bench Verified (多轮尝试): 71.6% (Kimi-K2-Instruct) vs. 80.2% (Claude 4 Sonnet)</li>
<li>SWE-bench Multilingual: 47.3% (Kimi-K2-Instruct) vs. 51.0% (Claude 4 Sonnet)</li>
<li>SWE-lancer: 39.1% (Kimi-K2-Instruct) vs. 40.8% (Claude 4 Sonnet)</li>
</ul>
<p>在 PaperBench 上,Kimi-K2-Instruct 获得 27.8% 的准确率,与 GPT-4.1 接近,并以大幅优势超越 DeepSeek-V3-0324(12.2%)和 Qwen3-235B-A22B(8.2%).在 TerminalBench 评测的终端交互任务中,Kimi-K2-Instruct 使用默认 Terminus 框架获得 25.0%,在 Moonshot 内部 agentic 框架下提升至 30%,突显了其在真实世界 agentic 编程场景中的能力.此外,在 Aider-Polyglot 基准上,Kimi-K2-Instruct 在采用严格去污染程序的情况下获得 60.0% 准确率,进一步展示了其在多样化编码环境中的强度和可靠性.</p>
<p><strong>工具使用任务.</strong> 我们用两个互补套件评估多轮工具使用: τ2-Bench 和 ACEBench. τ2-Bench 将原始 τ-bench 的单控制设置扩展为双控制环境,其中 agent 和 LLM 模拟用户都对共享状态具有受限的工具权限,增加了真实的电信故障排查域以及原有的航空/零售 TAU 任务,并支持协调 vs 纯推理的分析.ACEBench 是一个大型双语(英/中)API 基准(8 个领域 4.5K API;2K 注释评估项),分为 NORMAL(基础/个性化/原子)、SPECIAL(不完美或超出范围的输入)和 AGENT(场景驱动的多轮、多步沙箱)轨道,对调用和结果进行自动评分.所有模型在非思考模式下运行;我们将温度设为 0.0,使用确定性工具适配器,在 4 个种子下以 Pass@1/4 评分 τ2 航空/零售/电信(Avg@4),并报告 ACEBench 英文的整体结果.Kimi-K2-Instruct 在 τ2 上平均获得 66.1 micro Pass@1,相比 DeepSeek-V3-0324 的 48.8 和 Qwen3-235B-A22B 的 37.3.在 ACEBench Overall 上,Kimi-K2-Instruct 得分 76.5,相比 DeepSeek 的 72.7 和 Qwen 的 70.5,并与 GPT-4.1(80.1)保持竞争力.</p>
<p><strong>数学与 STEM 和逻辑任务.</strong> 对于数学任务,Kimi-K2-Instruct 展现出持续强劲的性能,平均超越 Gemini-2.5-Flash 5.3 个百分点,超越 DeepSeek-V3-0324 5.5 个百分点,超越 GPT-4.1 15.8 个百分点.例如,在 AIME 2024 上,Kimi-K2-Instruct 得分 69.6%,以大幅优势超越另外两个顶级开源模型——DeepSeek-V3-0324 10.2 个百分点和 Qwen3-235B-A22B 29.5 个百分点.在 STEM 评估中,Kimi-K2-Instruct 在 GPQA-Diamond 上获得 75.1%,超越 DeepSeek-V3-0324(68.4%)和所有非思考基线至少 5 个百分点.在 SuperGPQA 上,它也超越此前最佳开源模型 DeepSeek-V3-0324 3.5 个百分点.Kimi-K2-Instruct 在逻辑推理方面也 surpass 另外两个领先模型.它在 ZebraLogic 上获得 89.0%、AutoLogi 上获得 89.5%,超越 DeepSeek-V3-0324(84.0%、88.9%),并以大幅优势超越 Qwen3-235B-A22B(37.7%、83.3%).</p>
<p><strong>通用任务.</strong> Kimi-K2-Instruct 在 MMLU 和 MMLU-Pro 上与 DeepSeek-V3-0324 持平,并在 MMLU-Redux 上以 92.7 EM 分领先——略高于 GPT-4.1(92.4),仅落后 Claude-Opus-4 1.5 分.在多项选择任务之外,模型在短答案 SimpleQA 上获得 31.0% 准确率——比 DeepSeek-V3-0324 高 3.3 个百分点,是 Qwen3-235B-A22B 的两倍多——尽管仍低于 GPT-4.1(42.3%).在对抗性自由回复 LiveBench(2024-11-25 快照)上,它达到 76.4%,超越 Claude-Sonnet 4(74.8%)并领先 Gemini 2.5 Flash Preview 8.6 个百分点.在这个衡量世界知识广度、深度和鲁棒性的挑战性三元组中,Kimi-K2-Instruct 在开源模型中 secured 顶级位置.我们用 IFEval 和 Multi-Challenge 评估指令遵循.在 IFEval 上,Kimi-K2-Instruct 得分 89.8%,高于 DeepSeek-V3-0324(81.1%)和 GPT-4.1(88.0%).在 Multi-Challenge 上——涉及多轮对话中的冲突指令——它获得 54.1%,超越 DeepSeek-V3-0324(31.4%)、GPT-4.1(36.4%)和 Claude-Opus-4(49.0%).这些结果表明 Kimi-K2-Instruct 将强事实知识与单轮和多轮设置中的一致指令遵循相结合,支持稳健可靠的真实世界部署.</p>
<p><strong>长上下文和事实性任务.</strong> 为评估 Kimi-K2-Instruct 的事实性,我们采用三个基准:FACTS Grounding——使用专有模型 GPT-4o、Gemini 1.5 Pro 和 Claude 3.5 Sonnet 衡量对提供文档的遵循度;HHEM——通过开源 HHEM-2.1-Open 评判器评估摘要质量;FaithJudge——使用 o3-mini 作为评判器分析 RAG 任务中的忠实性.Kimi-K2-Instruct 在 FACTS Grounding 上得分 88.5,大幅超越所有开源对手,甚至超越闭源 Gemini 2.5 Flash.使用 HHEM-2.1-Open 的幻觉率为 1.1%,在表中报告为 1 减幻觉率即 98.9.在 FaithJudge 的 RAG 任务上幻觉率为 7.4%,同样以 92.6 呈现以保持表一致性.</p>
<p>对于长上下文能力,Kimi-K2-Instruct 在 DROP(93.5%)上超越所有开源和专有模型,并在检索任务 MRCR(55.0% vs 50.8%)上超越 DeepSeek-V3-0324.对于长上下文推理任务 FRAMES 和 LongBench v2,Kimi-K2-Instruct(77.1%、49.1%)略低于 DeepSeek-V3-0324 约 2%.</p>
<p><strong>开放式评估.</strong> 除了静态闭卷基准外,我们评估模型在开放式、细腻任务上的表现,这些任务更接近真实世界使用.</p>
<p>对于英文场景,我们利用 Arena-Hard-Auto v2.0 基准,该基准使用 LLM-as-a-judge 协议评估多样化开放式提示的生成质量.这些评估涵盖广泛的高难度提示,在研究界得到广泛认可.在 Arena-Hard-Auto v2.0 上,Kimi-K2-Instruct 在困难提示(54.5%)和创意写作任务(85.0%)上均取得 SOTA 胜率,超越所有开源模型,并与 GPT-4.1 和 Claude Sonnet 等顶级专有系统相匹敌.这些结果突显了模型在多样化、无约束设置下处理复杂推理和细腻生成的优势.</p>
<p>然而,Arena-Hard-Auto 对中文特定任务的覆盖有限.为解决这一差距,我们开发了一个基于真实用户查询的内部保留基准.为保护评估完整性,基准数据受访问限制,从而消除过拟合风险.</p>
<p>如图 11 所示,Kimi-K2-Instruct 在中文内部基准的所有对比中展现出强劲性能.它以 65.4% 的胜率超越 ChatGPT-4o-latest,以 64.6% 超越 Claude Sonnet 4,以 59.6% 超越 DeepSeek-V3-0324.在所有情况下,失败率保持在较低水平(约 17%),表明 Kimi-K2-Instruct 很少落后.高胜率和一致的差距展示了其在开放式中文任务上的强劲能力.</p>
<blockquote>
<p>图 11: 中文内部基准评估.Kimi-K2-Instruct 在对比中展现出强劲性能,胜率超过 59%,失败率约 17%.数据来源:原文 Figure 11.</p>
</blockquote>
<p>除受控评估外,我们还考虑通过公开人工评估的真实世界用户偏好.截至 2025 年 7 月 17 日,Kimi-K2-Instruct 在 LMSYS Arena 排行榜上位列开源模型第一名、总榜第五名,基于超过 3,000 个真实用户的盲测投票.与 LLM-as-a-judge 协议不同,该排行榜反映了对多样化用户提交提示的直接人类偏好,为实际模型性能提供了互补视角.</p>
<p>Arena-Hard-Auto、我们的内部基准和 LMSYS Arena 的投票结果共同为 Kimi-K2-Instruct 的开放式能力提供了全面视角,表明它在英文和中文的真实世界用户体验中都是一个 highly preferred 的模型.</p>
<h3 id="d-qk-clip-bshmxzl">D. QK-Clip 不损害模型质量</h3>
<p>QK-Clip 设计遵循最小干预原则:仅在必要时激活,在训练稳定后停用.实证证据和分析汇聚于其可忽略的质量影响.</p>
<p><strong>小规模消融实验.</strong> 我们训练两个小规模 MoE 模型(0.5B 激活 / 3B 总参数),一个使用原始 Muon,另一个使用 MuonClip 且裁剪阈值较低(τ=30).如图 12 所示,应用 MuonClip 对损失曲线的影响可忽略,表明即使激进的裁剪也不会损害 MuonClip 的收敛或训练动态.这证明 MuonClip 是一种安全且有效的限制注意力 logits 的方法,不会降低模型性能.此外,下游任务评估显示没有统计显著的性能退化.这些结果共同证明 MuonClip 是一种安全且有效的限制注意力 logits 的方法,不会损害模型质量.</p>
<blockquote>
<p>图 12: 在小规模设置中将 QK-Clip 应用于 Muon 且采用激进阈值(τ=30)对损失影响可忽略,表明它是约束注意力 logits 的安全有效方法.数据来源:原文 Figure 12.</p>
</blockquote>
<p><strong>自停用.</strong> 在 Kimi K2 中,QK-Clip 仅是瞬态活跃的:</p>
<ul>
<li>初始 70,000 步: 12.7% 的注意力头至少触发一次 QK-Clip,将 S_max 限制在 100.</li>
<li>70,000 步之后: 所有头在某个时刻将其 S_max 降低到 100 以下,使 QK-Clip 失活.</li>
</ul>
<p>当 QK-Clip 活跃时,它以每头(而非每层)的方式应用,以最小化对其他头的潜在过度正则化.训练稳定后,QK-Clip 停用且完全不起作用.</p>
<h3 id="e-wsm-muon-grydz-logit-bz">E. 为什么 Muon 更容易导致 Logit 爆炸</h3>
<p>Logit 爆炸发生在最大预 softmax 注意力分数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>S</mi><mi>max</mi><mo>⁡</mo></msub><mo>=</mo><msub><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>i</mi><mo separator="true">,</mo><mi>j</mi></mrow></msub><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>k</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">S_{\\max} = \\max_{i,j} q_i \\cdot k_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">m</span><span class="mtight">a</span><span class="mtight">x</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7306em;vertical-align:-0.2861em;"></span><span class="mop"><span class="mop">max</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 在训练期间无界增长时.由于:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="normal">∣</mi><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>k</mi><mi>j</mi></msub><mi mathvariant="normal">∣</mi><mo>≤</mo><mi mathvariant="normal">∥</mi><msub><mi>q</mi><mi>i</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>k</mi><mi>j</mi></msub><mi mathvariant="normal">∥</mi><mo>≤</mo><mi mathvariant="normal">∥</mi><msub><mi>x</mi><mi>i</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>x</mi><mi>j</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>W</mi><mi>q</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>W</mi><mi>k</mi></msub><mi mathvariant="normal">∥</mi></mrow><annotation encoding="application/x-tex">|q_i \\cdot k_j| \\leq \\|q_i\\| \\|k_j\\| \\leq \\|x_i\\| \\|x_j\\| \\|W_q\\| \\|W_k\\|</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∣</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∥</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥</span></span></span></span></span><p>且 RMS-Norm 保持 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∥</mi><msub><mi>x</mi><mi>i</mi></msub><mi mathvariant="normal">∥</mi><mi mathvariant="normal">∥</mi><msub><mi>x</mi><mi>j</mi></msub><mi mathvariant="normal">∥</mi></mrow><annotation encoding="application/x-tex">\\|x_i\\| \\|x_j\\|</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord">∥</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∥∥</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord">∥</span></span></span></span> 有界,该现象主要由 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub></mrow><annotation encoding="application/x-tex">W_q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 或 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>k</mi></msub></mrow><annotation encoding="application/x-tex">W_k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 增长的谱范数驱动.实证上,我们发现 Muon 更容易发生 logit 爆炸.以下给出我们的假设.</p>
<p><strong>更新中的结构差异.</strong> Muon 产生的权重更新来自 <code>msign</code> 操作;因此,更新矩阵的所有奇异值相等——其有效秩是满的.相比之下,Adam 产生的典型更新矩阵呈现偏斜谱:少数大奇异值主导,有效秩低.Adam 的这种低秩假设并不新鲜;higher-order muP 也做出相同假设.</p>
<p>这种现象在 16B Moonlight 模型上得到验证,显示 Muon 训练的权重表现出比 Adam 训练更高的奇异值熵(即更高的有效秩),印证了理论直觉.</p>
<p><strong>SVD 表述.</strong> 设步骤 t-1 的参数矩阵具有奇异值分解:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>W</mi><mrow><mi>t</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>=</mo><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>σ</mi><mi>i</mi></msub><msub><mi>u</mi><mi>i</mi></msub><msubsup><mi>v</mi><mi>i</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">W_{t-1} = \\sum_i \\sigma_i u_i v_i^\\top \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8917em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3277em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:2.3277em;vertical-align:-1.2777em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>我们将更新矩阵写为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><mi mathvariant="normal">Δ</mi><msub><mi>W</mi><mi>t</mi></msub><mo>=</mo><munder><mo>∑</mo><mi>j</mi></munder><mover accent="true"><mi>σ</mi><mo>ˉ</mo></mover><msub><mover accent="true"><mi>u</mi><mo>ˉ</mo></mover><mi>j</mi></msub><msubsup><mover accent="true"><mi>v</mi><mo>ˉ</mo></mover><mi>j</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\Delta W_t = \\sum_j \\bar{\\sigma} \\bar{u}_j \\bar{v}_j^\\top \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord">Δ</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4638em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">u</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:2.4638em;vertical-align:-1.4138em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>因此下一步的参数更新为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>W</mi><mi>t</mi></msub><mo>←</mo><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>σ</mi><mi>i</mi></msub><msub><mi>u</mi><mi>i</mi></msub><msubsup><mi>v</mi><mi>i</mi><mi mathvariant="normal">⊤</mi></msubsup><mo>+</mo><munder><mo>∑</mo><mi>j</mi></munder><mover accent="true"><mi>σ</mi><mo>ˉ</mo></mover><msub><mover accent="true"><mi>u</mi><mo>ˉ</mo></mover><mi>j</mi></msub><msubsup><mover accent="true"><mi>v</mi><mo>ˉ</mo></mover><mi>j</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">W_t \\leftarrow \\sum_i \\sigma_i u_i v_i^\\top + \\sum_j \\bar{\\sigma} \\bar{u}_j \\bar{v}_j^\\top \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">←</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.3277em;vertical-align:-1.2777em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4638em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">u</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:2.4638em;vertical-align:-1.4138em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>在 Muon 中,由于权重和更新都具有比 Adam 更高的有效秩,我们假设奇异向量对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>u</mi><mi>i</mi></msub><msubsup><mi>v</mi><mi>i</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">u_i v_i^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1078em;vertical-align:-0.2587em;"></span><span class="mord"><span class="mord mathnormal">u</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4413em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2587em;"><span></span></span></span></span></span></span></span></span></span> 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>u</mi><mo>ˉ</mo></mover><mi>j</mi></msub><msubsup><mover accent="true"><mi>v</mi><mo>ˉ</mo></mover><mi>j</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">\\bar{u}_j \\bar{v}_j^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2439em;vertical-align:-0.3948em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">u</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">v</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4413em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span></span></span></span> 对齐的概率更高.这可能导致 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">W_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 对应奇异值的叠加增长.</p>
<p><strong>注意力特定的放大.</strong> 注意力 logits 通过双线性形式计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>q</mi><mi>i</mi></msub><mo>⋅</mo><msub><mi>k</mi><mi>j</mi></msub><mo>=</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><msub><mi>W</mi><mi>q</mi></msub><mo stretchy="false">)</mo><mo>⋅</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>j</mi></msub><msub><mi>W</mi><mi>k</mi></msub><mo stretchy="false">)</mo></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">q_i \\cdot k_j = (x_i W_q) \\cdot (x_j W_k) \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span><span class="tag"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><p>乘积 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>q</mi></msub><msubsup><mi>W</mi><mi>k</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><annotation encoding="application/x-tex">W_q W_k^\\top</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1352em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4169em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2831em;"><span></span></span></span></span></span></span></span></span></span> 将谱范数平方化,因此任一矩阵中奇异值的增加都会被复合.Muon 扩大奇异值的趋势因此转化为更高的 logit 爆炸风险.</p>
<h3 id="f-k2-ppzdty-rl-pfbz">F. K2 评判者的通用 RL 评分标准</h3>
<h4 id="f-1-hxpfbz">F.1 核心评分标准</h4>
<ul>
<li><strong>清晰性与相关性</strong>: 评估回复在充分回应用户意图的同时保持简洁的程度.重点是消除不必要的细节,保持与核心查询的对齐,并使用高效的格式如简短段落或紧凑列表.除非特别要求,应避免长条目化列举.当需要做出选择时,回复应清晰提供单一、明确的答案.</li>
<li><strong>对话流畅性与参与度</strong>: 评估回复对自然、流畅对话的贡献,超越简单问答.这包括保持连贯性、展示对话题的适当参与、提供相关观察或见解、在适当时建设性地引导对话、审慎使用跟进问题、优雅处理假设性或个人类比查询,以及根据对话情境有效调整语气(如同理心、正式、随意).</li>
<li><strong>客观与 grounded 交互</strong>: 评估回复保持客观和 grounded 语气的能力,聚焦于用户请求的核心内容.它评估避免元评论(分析查询结构、主题组合、感知到的怪异性或交互本身的性质)以及不适当的奉承或对用户的过度赞美.优秀的回复以尊重但中性的方式交互,优先直接、任务导向的协助,而非对对话动态的 commentary 或通过赞美来讨好.</li>
</ul>
<h4 id="f-2-cfxpfbz">F.2 处方性评分标准</h4>
<ul>
<li><strong>初始赞美</strong>: 回复不得以针对用户或问题的赞美开头(如「这是一个好问题」、「问得好!」).</li>
<li><strong>显式辩护</strong>: 任何解释回复为何好或如何成功满足用户请求的句子或从句.这与单纯描述内容不同.</li>
</ul>
<h4 id="f-3-jxx">F.3 局限性</h4>
<p>该评估框架的一个潜在副作用是可能 favor 显得自信和果断的回复,即使在涉及模糊性或主观性的情境中.这源于当前评分标准中的两个关键约束:</p>
<ul>
<li><strong>避免自我限定</strong>: 处方性规则禁止自我评估、显式免责声明或 hedging 语言(如「这可能不准确」、「我可能错了」).虽然这些短语可以反映认识论谦逊,但它们常被惩罚为非信息性或表演性的.</li>
<li><strong>偏好清晰与单一性</strong>: 评分标准奖励在用户要求推荐或解释时的直接、果断回答.在复杂或开放式情境中,这可能 disincentivize 适当的谨慎或多视角回复.</li>
</ul>
<p>因此,模型可能在模糊性、细腻性或认识论谦逊更合适的领域偶尔过度陈述确定性.框架的未来迭代可能纳入更细粒度的校准不确定性处理.</p>
<blockquote>
<p><strong>[局限与风险]</strong> 自批判评分标准的隐性偏见</p>
<p>附录 F.3 是整篇论文中最诚实的一段.作者明确指出:当前评分标准 favor「自信、果断」的回复,惩罚 hedging 和免责声明.这意味着 RL 训练后的模型可能在不确定时仍表现得过于确定——因为它被奖励为这样做.这与 GPT-4 早期版本中观察到的「过度自信」问题如出一辙.更深层的问题是:如果模型学会了「表现得 confident」而非「准确评估自身不确定性」,它在高风险场景(如医疗建议、法律解释)中可能产生危险误导.这是一个尚未解决的系统性挑战,需要未来在评分标准设计中纳入「校准不确定性」的显式奖励.</p>
</blockquote>
<h3 id="g-rl-xldyqqhlsx">G. RL 训练的引擎切换流水线</h3>
<p>Checkpoint引擎在每个 GPU 上管理三个等大小的设备缓冲区:一个用于加载卸载模型参数的 H2D 缓冲区,以及两个用于 GPU-to-GPU 广播的 IPC 缓冲区.IPC 缓冲区被共享给推理引擎,允许它直接访问相同的物理内存.这三个缓冲区使我们能够以流水线方式安排三个步骤.</p>
<p><strong>理论三阶段流水线.</strong> 如图 13a 所示,引入三阶段流水线:(1) H2D: 最新权重的分片被异步拷贝到 H2D 缓冲区.(2) 广播: 拷贝完成后,分片被拷贝到一个 IPC 缓冲区并广播到所有设备.(3) 重载: 推理引擎同时从另一个 IPC 缓冲区加载参数.</p>
<blockquote>
<p>图 13: RL 权重更新的流水线.(a) 理论完美三阶段流水线权重更新;(b) 受 PCIe 限制的三阶段流水线;(c) 固定两阶段流水线.数据来源:原文 Figure 13.</p>
</blockquote>
<p><strong>由于 PCIe 饱和导致的双阶段流水线.</strong> 在 NVIDIA H800 集群上,并发的 H2D 和广播使共享 PCIe  fabric 饱和,将三个阶段压缩为顺序过程(图 13b).因此我们采用更简单的双阶段方案(图 13c):(1) 所有设备执行单次同步 H2D 传输.(2) 广播和重载并行进行.</p>
<p>双阶段流水线将受多个同步 H2D 拷贝操作的限制.但在大规模设备中,模型被分割为小分片,整个参数集可在一次传输中放入 H2D 缓冲区,开销将消失.</p>
<p>通过重叠 H2D、广播和重载权重,我们可以获得高带宽以将权重从训练引擎重新分片到所有推理引擎.</p>
<hr>
<blockquote>
<p>文档版本: v1.0
翻译完成日期: 2026-05-18
译者注: 本文档为 Moonshot AI 发布的 Kimi K2 (arXiv:2507.20534v2) 技术报告的完整中文精译.所有技术细节、实验数据和公式均忠实于原文,并已在关键节点插入技术思考供读者参考.由于原文 Figure 1-13 为图表,建议读者对照原 PDF 查看完整可视化内容.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"ml","text":"目录"},{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-yxl","text":"2 预训练"},{"level":3,"id":"2-1-muon-clip-jyqzcjdwdxl","text":"2.1 MuonClip: 基于权重裁剪的稳定训练"},{"level":3,"id":"2-2-yxlsj-tggxts-token-xy","text":"2.2 预训练数据: 通过改写提升 Token 效用"},{"level":3,"id":"2-3-mxjg","text":"2.3 模型架构"},{"level":3,"id":"2-4-xljcss","text":"2.4 训练基础设施"},{"level":4,"id":"2-4-1-jsjq","text":"2.4.1 计算集群"},{"level":4,"id":"2-4-2-mxsfdbhcl","text":"2.4.2 模型缩放的并行策略"},{"level":4,"id":"2-4-3-jhsj","text":"2.4.3 激活缩减"},{"level":3,"id":"2-5-xlpf","text":"2.5 训练配方"},{"level":2,"id":"3-hxl","text":"3 后训练"},{"level":3,"id":"3-1-jdwt","text":"3.1 监督微调"},{"level":4,"id":"3-1-1-mxgjsyxxddgm-agentic-sjhc","text":"3.1.1 面向工具使用学习的大规模 Agentic 数据合成"},{"level":3,"id":"3-2-qhxx","text":"3.2 强化学习"},{"level":4,"id":"3-2-1-kyzjlxlc-verifiable-rewards-gym","text":"3.2.1 可验证奖励训练场(Verifiable Rewards Gym)"},{"level":4,"id":"3-2-2-cyyz-zpppfjl-self-critique-rubric-reward","text":"3.2.2 超越验证: 自批判评分奖励(Self-Critique Rubric Reward)"},{"level":4,"id":"3-2-3-rl-sf","text":"3.2.3 RL 算法"},{"level":3,"id":"3-3-rl-jcss","text":"3.3 RL 基础设施"},{"level":4,"id":"3-3-1-tdjg","text":"3.3.1 同地架构"},{"level":4,"id":"3-3-2-gxyqqh","text":"3.3.2 高效引擎切换"},{"level":4,"id":"3-3-3-gxxtqd","text":"3.3.3 高效系统启动"},{"level":4,"id":"3-3-4-agentic-rollout","text":"3.3.4 Agentic Rollout"},{"level":2,"id":"4-pg","text":"4 评估"},{"level":3,"id":"4-1-hxlpg","text":"4.1 后训练评估"},{"level":4,"id":"4-1-1-pgsz","text":"4.1.1 评估设置"},{"level":4,"id":"4-1-2-pgjg","text":"4.1.2 评估结果"},{"level":3,"id":"4-2-yxlpg","text":"4.2 预训练评估"},{"level":4,"id":"4-2-1-pgsz","text":"4.2.1 评估设置"},{"level":4,"id":"4-2-2-pgjg","text":"4.2.2 评估结果"},{"level":3,"id":"4-3-aqpg","text":"4.3 安全评估"},{"level":4,"id":"4-3-1-sysz","text":"4.3.1 实验设置"},{"level":4,"id":"4-3-2-aqpgjg","text":"4.3.2 安全评估结果"},{"level":2,"id":"5-jxx","text":"5 局限性"},{"level":2,"id":"6-jl","text":"6 结论"},{"level":2,"id":"zx","text":"致谢"},{"level":2,"id":"ckwx","text":"参考文献"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-gxz","text":"A. 贡献者"},{"level":3,"id":"b-gjtyd-token-mb","text":"B. 工具调用的 Token 模板"},{"level":3,"id":"c-pgxq","text":"C. 评估详情"},{"level":3,"id":"d-qk-clip-bshmxzl","text":"D. QK-Clip 不损害模型质量"},{"level":3,"id":"e-wsm-muon-grydz-logit-bz","text":"E. 为什么 Muon 更容易导致 Logit 爆炸"},{"level":3,"id":"f-k2-ppzdty-rl-pfbz","text":"F. K2 评判者的通用 RL 评分标准"},{"level":4,"id":"f-1-hxpfbz","text":"F.1 核心评分标准"},{"level":4,"id":"f-2-cfxpfbz","text":"F.2 处方性评分标准"},{"level":4,"id":"f-3-jxx","text":"F.3 局限性"},{"level":3,"id":"g-rl-xldyqqhlsx","text":"G. RL 训练的引擎切换流水线"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/02-kimi-k2/01-kimi-k2-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/02-kimi-k2/01-kimi-k2-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi K2: Open Agentic Intelligence 技术报告精译</h1>
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
