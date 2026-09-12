"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiMo-V2-Flash 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.9-mimo/14.9-mimo">返回 14.9-MiMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiMo-V2-Flash Technical Report
原文链接: <a href="https://arxiv.org/abs/2601.02780">https://arxiv.org/abs/2601.02780</a>
发布日期: 2026-01-08
发布机构: 小米 LLM-Core 团队
模型规模: 309B 总参数 / 15B 激活参数 (MoE, 256 路由专家, 8 专家/Token)
上下文窗口: 原生 32K, 扩展至 256K
训练数据量: 27T tokens</p>
</blockquote>
<hr>
<h2 id="1-yy-introduction">1 引言 (Introduction)</h2>
<p>迈向通用人工智能(AGI)的最新进展正由两条前沿赛道共同推动: 高级推理链与自主智能体工作流(Agentic Workflows). 这两条赛道都建立在规模化强化学习(RL)的基础之上. 然而, 构建可扩展的推理模型和智能体模型面临着一个共同的瓶颈: 长上下文建模必须同时做到「快」和「强」.</p>
<p>本工作介绍 MiMo-V2-Flash, 一款高效且具成本效益的大语言模型(LLM), 具备强大的推理和智能体能力. MiMo-V2-Flash 是一个拥有 309B 总参数的 MoE(Mixture-of-Experts, 混合专家)模型, 每 Token 激活 15B 参数. 为缓解全注意力(Full Attention)的二次复杂度问题, MiMo-V2-Flash 采用了一种混合注意力机制, 将局部滑动窗口注意力(Sliding Window Attention, SWA)与全局注意力(Global Attention, GA)交错排列. 滑动窗口大小为 128 个 Token, 局部与全局的混合比例为 5:1, 在长上下文场景下可将 KV Cache 存储量和注意力计算量降低约 6 倍. 借助可学习的注意力 Sink Bias(Agarwal et al., 2025), 这种混合架构即使在激进的滑动窗口尺寸和混合比例下, 仍能保持强大的建模能力, 包括在长上下文场景中.</p>
<p>MiMo-V2-Flash 还引入了 MTP(Multi-Token Prediction, 多 Token 预测)来提升训练性能并加速推理解码. 特别地, MTP 在加速 RL 的 Rollout 阶段方面具有巨大潜力, 这有助于将 LLM 推向更高的智能水平. MTP Block 采用轻量化的 Dense FFN(Dense Feed-Forward Network, 全连接前馈网络)和滑动窗口注意力, 在实际部署中实现了高接受率下的显著解码加速.</p>
<p>MiMo-V2-Flash 的预训练配方 largely follows MiMo-7B(Xia et al., 2025), 并做了若干增强. 训练采用 FP8 混合精度, 在 27T tokens 上高效完成大规模训练. 模型首先以原生 32K 上下文进行预训练, 随后扩展至 256K. 最终得到的预训练模型 MiMo-V2-Flash-Base 与 Kimi-K2-Base(Kimi Team, 2025c)和 DeepSeek-V3.2-Exp-Base(Liu et al., 2025)等领先开源基座模型进行了对比评估. MiMo-V2-Flash-Base 在通用基准上表现具有竞争力, 并在推理导向的任务上超越了同类模型. 在长上下文检索方面, 混合注意力架构在 32K 到 256K 的上下文长度范围内实现了接近 100% 的成功率. 在极端长上下文推理基准 GSM-Infinite(Zhou et al., 2025)上, MiMo-V2-Flash 展现出稳健的性能, 从 16K 扩展到 128K 时性能衰减极小.</p>
<p>在后训练阶段, 我们聚焦于高效扩展 RL 计算量以提升推理和智能体能力. 为此, MiMo-V2-Flash 提出了一种新的后训练范式, 称为 MOPD(Multi-Teacher On-Policy Distillation, 多教师在线策略蒸馏). 该框架通过一个三阶段流程解决学习效率低下和能力失衡问题: (1) 通用 SFT(Supervised Fine-Tuning, 监督微调); (2) 通过专门的 RL/SFT 训练领域专用教师模型; (3) MOPD 阶段, 学生模型从两个互补信号中学习: 来自跨领域专用教师的密集 Token 级奖励, 以及可验证的基于结果的奖励. 通过这种方式整合多样化的专家知识, MiMo-V2-Flash 在同时掌握各领域教师峰值能力的同时, 受益于稳定且高效的学习动态.</p>
<p>MiMo-V2-Flash 在大多数推理基准上取得了与 Kimi-K2-Thinking 和 DeepSeek-V3.2-Thinking 相当的性能. 在长上下文评估(如 LongBench V2 和 MRCR)中, MiMo-V2-Flash 持续超越更大的全注意力模型, 证实了其混合 SWA 架构的稳健性. 值得注意的是, 该模型在 SWE-Bench Verified 上达到 73.4%, 在 SWE-Bench Multilingual 上达到 71.7%, 确立了其作为软件工程任务领先开源模型的地位. 模型权重(含 3 层 MTP 权重)已开源, 可在 <a href="https://github.com/XiaomiMiMo/MiMo-V2-Flash">https://github.com/XiaomiMiMo/MiMo-V2-Flash</a> 获取.</p>
<blockquote>
<p>译者注: MiMo-V2-Flash 的核心定位非常清晰——用更小的激活参数量(15B vs Kimi-K2 的 32B 和 DeepSeek-V3.2 的 37B)和更稀疏的总参数量(309B vs 1043B/671B), 通过架构创新(Hybrid SWA + Lightweight MTP)和后训练创新(MOPD)来实现对标甚至超越更大模型的效果. 这不是简单的&quot;缩小版大模型&quot;, 而是一次围绕效率与效果的系统级重新设计.</p>
</blockquote>
<hr>
<h2 id="2-mimo-v2-flash-mxjg">2 MiMo-V2-Flash 模型架构</h2>
<h3 id="2-1-ztjg">2.1 整体架构</h3>
<p>如图 2 所示, MiMo-V2-Flash 遵循标准的 Transformer(Vaswani et al., 2017)骨干架构, 并辅以 MoE(Shazeer et al., 2017)和混合注意力机制(Brown et al., 2020; Gemma Team, 2024, 2025; Kimi Team, 2025a; Li et al., 2025; Qwen Team, 2025). MiMo-V2-Flash 主要由重复的 Hybrid Blocks(混合块)组成, 每个混合块交错排列局部滑动窗口注意力(SWA)层和全局注意力(GA)层. 模型堆叠了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>=</mo><mn>8</mn></mrow><annotation encoding="application/x-tex">N = 8</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">8</span></span></span></span> 个混合块, 每个混合块由 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>M</mi><mo>=</mo><mn>5</mn></mrow><annotation encoding="application/x-tex">M = 5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">5</span></span></span></span> 个连续的 SWA 层后接一个 GA 层构成. 唯一的例外是第一个 Transformer Block, 它使用全局注意力配合 Dense FFN 以稳定早期表征学习. MiMo-V2-Flash 中使用的滑动窗口大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>W</mi></mrow><annotation encoding="application/x-tex">W</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span></span></span></span> 为 128. SWA 层和 GA 层均采用稀疏 MoE FFN. 每个 MoE 层共包含 256 个专家, 每 Token 激活 8 个专家, 且不设置共享专家(Shared Experts).</p>
<p>MiMo-V2-Flash 还集成了 MTP(Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025)来提升模型性能(质量和效率). 值得注意的是, MTP Block 使用 Dense FFN 而非 MoE, 并采用 SWA 而非 GA, 使其在投机解码(Speculative Decoding)中保持轻量化. 每个 MTP Block 的参数仅为 0.33B.</p>
<p>表 1 汇总了 MiMo-V2-Flash 的详细配置. 模型共 48 层, 其中 39 层为 SWA, 9 层为 GA. SWA 和 GA 均采用 GQA(Grouped-Query Attention, 分组查询注意力)(Ainslie et al., 2023). 具体而言, SWA 有 64 个 Query 头和 8 个 KV 头, GA 有 64 个 Query 头和 4 个 KV 头. 两种注意力的每头维度相同(Q 和 K 为 192, V 为 128). RoPE(Rotary Positional Embedding, 旋转位置编码)(Su et al., 2024)部分应用于 Query 和 Key 的前 64 个维度.</p>
<p>遵循近期最佳实践, 我们采用类似于 DeepSeek-V3(Liu et al., 2024)的 FP8 混合精度框架. 具体而言, 注意力输出投影、Embedding 和输出头参数保留 BF16 精度, MoE Router 参数保持 FP32 精度. 这种混合精度配置在不影响训练效率或内存占用的前提下, 提高了数值稳定性.</p>
<table>
<thead>
<tr>
<th>配置项</th>
<th>Main Block</th>
<th>MTP Block</th>
</tr>
</thead>
<tbody><tr>
<td>层数 (Total/SWA/GA)</td>
<td>48/39/9</td>
<td>-</td>
</tr>
<tr>
<td>SWA Heads (Q/KV)</td>
<td>64/8</td>
<td>64/8</td>
</tr>
<tr>
<td>滑动窗口大小</td>
<td>128</td>
<td>128</td>
</tr>
<tr>
<td>GA Heads (Q/KV)</td>
<td>64/4</td>
<td>-</td>
</tr>
<tr>
<td>Head 维度 (QK/V)</td>
<td>192/128</td>
<td>192/128</td>
</tr>
<tr>
<td>专家数 (Total/Activated)</td>
<td>256/8</td>
<td>-</td>
</tr>
<tr>
<td>参数量</td>
<td>309B (总) / 15B (激活)</td>
<td>0.33B</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: MiMo-V2-Flash 的详细模型配置.</p>
</blockquote>
<h3 id="2-2-hhhdckzyljg">2.2 混合滑动窗口注意力架构</h3>
<p>滑动窗口注意力(Beltagy et al., 2020)将每个 Token 的注意力范围限制在一个局部窗口内, 而非整个序列, 从而大幅降低计算和内存复杂度. 这自然催生了将滑动窗口注意力与全局注意力交错的混合注意力架构. 然而, 先前工作表明, 过度激进的 SWA 使用(如过小的滑动窗口尺寸或过高的 SWA:GA 比例)会导致模型性能显著下降(Gemma Team, 2025), 尤其在长上下文任务中. 近期, 可学习注意力 Sink Bias 的引入允许模型在需要时对 Token 分配很少或零注意力, 这极大增强了基于 SWA 架构的建模能力(Agarwal et al., 2025). 尽管注意力 Sink 机制的精确理论基础仍是活跃的研究方向(Gu et al., 2024b; Qiu et al., 2025; Sun et al., 2024; Xiao et al., 2023), 我们在实验中观察到, 可学习注意力 Sink Bias 显著提升了混合 SWA 模型的性能, 达到甚至超越了全 GA 层的基线.</p>
<p>在 MiMo-V2-Flash 中, 我们的实现遵循 gpt-oss(Agarwal et al., 2025)中使用的设计, 对每个注意力头在 Softmax 的分母上施加一个可学习的 Sink Bias <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>η</mi><mo>∈</mo><mi mathvariant="double-struck">R</mi></mrow><annotation encoding="application/x-tex">\\eta \\in \\mathbb{R}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6889em;"></span><span class="mord mathbb">R</span></span></span></span>. 具体而言, 设单个头中 Token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>j</mi></mrow><annotation encoding="application/x-tex">j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span></span></span></span> 之间的注意力 Logit 为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>e</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><msub><mi>q</mi><mi>i</mi></msub><msubsup><mi>k</mi><mi>j</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>h</mi></msub></msqrt></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(1)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">e_{ij} = \\frac{q_i k_j^\\top}{\\sqrt{d_h}} \\tag{1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5639em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6339em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.7848em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.4413em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3948em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.5639em;vertical-align:-0.93em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">1</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">q_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>k</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">k_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9805em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 分别表示 Token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的 Query 和 Token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>j</mi></mrow><annotation encoding="application/x-tex">j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0572em;">j</span></span></span></span> 的 Key, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>d</mi><mi>h</mi></msub></mrow><annotation encoding="application/x-tex">d_h</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 为头维度. 注意力权重为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>α</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>−</mo><msub><mi>m</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><mrow><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>j</mi></munderover><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>k</mi></mrow></msub><mo>−</mo><msub><mi>m</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>+</mo><mi>η</mi></mrow></mfrac></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(2)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\alpha_{ij} = \\frac{\\exp(e_{ij} - m_i)}{\\sum_{k=1}^{j} \\exp(e_{ik} - m_i) + \\eta} \\tag{2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5813em;vertical-align:-1.1543em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.1454em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9646em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.2029em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">ik</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">exp</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1543em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span><span class="tag"><span class="strut" style="height:2.5813em;vertical-align:-1.1543em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">2</span></span><span class="mord">)</span></span></span></span></span></span><p>其中:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>m</mi><mi>i</mi></msub><mo>=</mo><mi>max</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>k</mi><mo>≤</mo><mi>j</mi></mrow></munder><msub><mi>e</mi><mrow><mi>i</mi><mi>k</mi></mrow></msub><mo separator="true">,</mo><mtext> </mtext><mn>0</mn><mo fence="true">)</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(3)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">m_i = \\max\\left(\\max_{k \\leq j} e_{ik}, \\ 0\\right) \\tag{3}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mop">max</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.3479em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mrel mtight">≤</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.8882em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">ik</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace"> </span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span><span class="tag"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">3</span></span><span class="mord">)</span></span></span></span></span></span><p>最后, Query <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 的注意力输出通过对 Value 进行加权求和获得:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi>o</mi><mi>i</mi></msub><mo>=</mo><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>i</mi></munderover><msub><mi>α</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><msub><mi>v</mi><mi>j</mi></msub></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(4)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">o_i = \\sum_{j=1}^{i} \\alpha_{ij} v_j \\tag{4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.2254em;vertical-align:-1.4138em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8117em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.4138em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:3.2254em;vertical-align:-1.4138em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">4</span></span><span class="mord">)</span></span></span></span></span></span><blockquote>
<p>译者注: 式 (2) 中的 Sink Bias <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>η</mi></mrow><annotation encoding="application/x-tex">\\eta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span></span></span></span> 是关键设计. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>η</mi></mrow><annotation encoding="application/x-tex">\\eta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">η</span></span></span></span> 较大时, 分母被一个固定常数&quot;垫高&quot;, 相当于给每个头增加了一个虚拟的&quot;Sink Token&quot;, 模型可以在这个虚拟 Token 上&quot;倾倒&quot;不需要关注的注意力权重. 这解决了标准 SWA 的一个根本问题: 滑动窗口截断后, 窗口外的信息完全丢失, 而 Sink Bias 提供了一种软性的信息聚合出口. 从工程实现看, 这只是一个标量加法, 计算开销几乎为零, 但效果非常显著——后文的消融实验证实了这一点.</p>
</blockquote>
<h4 id="2-2-1-mxjgsy">2.2.1 模型架构实验</h4>
<p>为验证设计选择的有效性, 我们在一个 32B 的 Dense 模型上进行了探索性和实证研究, 保持 Query-Key 维度和旋转 Embedding 配置与上述描述一致.</p>
<p><strong>基线与基准</strong> 我们在对比设置中评估了四种模型架构变体: 全全局注意力(All GA)基线、带 128-token 窗口但不使用注意力 Sink Bias 的混合 SWA 模型、以及使用注意力 Sink Bias 且窗口大小分别为 128 和 512 的两种混合 SWA 模型. 所有变体共享相同的训练流程: 在 250B tokens 上以 8192 序列长度预训练, 额外 40B tokens 扩展至 32768 长上下文, 随后进行长上下文 SFT 和带思维链监督的推理 SFT.</p>
<p>我们在覆盖通用能力、长上下文理解和复杂推理的基准上评估模型变体. 通用域结果(表 2)来自未经长上下文扩展的预训练基座模型, 评估通用知识和推理能力. 长上下文结果(表 3)评估长上下文扩展后的基座模型. 复杂推理结果(表 4)评估推理 SFT 模型.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>MMLU</th>
<th>BBH</th>
<th>TriviaQA</th>
<th>GSM8K</th>
<th>MATH</th>
<th>CMMLU</th>
<th>MBPP</th>
</tr>
</thead>
<tbody><tr>
<td>All GA</td>
<td>57.3</td>
<td>54.7</td>
<td>53.2</td>
<td>34.2</td>
<td>9.5</td>
<td>50.3</td>
<td>54.7</td>
</tr>
<tr>
<td>Hybrid SWA(W=128, w/o sink)</td>
<td>54.9</td>
<td>52.4</td>
<td>52.8</td>
<td>36.9</td>
<td>8.9</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Hybrid SWA(W=128, w/ sink)</td>
<td>58.3</td>
<td>56.1</td>
<td>53.7</td>
<td>36.9</td>
<td>10.3</td>
<td>53.3</td>
<td>56.3</td>
</tr>
<tr>
<td>Hybrid SWA(W=512, w/ sink)</td>
<td>58.3</td>
<td>54.9</td>
<td>54.9</td>
<td>37.9</td>
<td>10.0</td>
<td>52.3</td>
<td>53.2</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 不同注意力配置的通用基准结果.</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>GSM-Infinite</th>
<th>NoLiMa</th>
<th>RULER-32k</th>
<th>MRCR</th>
</tr>
</thead>
<tbody><tr>
<td>All GA</td>
<td>12.3</td>
<td>49.7</td>
<td>89.4</td>
<td>32.5</td>
</tr>
<tr>
<td>Hybrid SWA(W=128, w/ sink)</td>
<td>17.3</td>
<td>51.2</td>
<td>89.4</td>
<td>34.4</td>
</tr>
<tr>
<td>Hybrid SWA(W=512, w/ sink)</td>
<td>17.2</td>
<td>38.5</td>
<td>84.7</td>
<td>19.6</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: 不同注意力配置的长上下文基准结果.</p>
</blockquote>
<table>
<thead>
<tr>
<th>模型</th>
<th>AIME24/25</th>
<th>LiveCodebench</th>
<th>GPQA-Diamond</th>
<th>平均</th>
</tr>
</thead>
<tbody><tr>
<td>All GA</td>
<td>45.5</td>
<td>40.0</td>
<td>41.7</td>
<td>42.4</td>
</tr>
<tr>
<td>Hybrid SWA(W=128, w/ sink)</td>
<td>47.1</td>
<td>43.9</td>
<td>48.1</td>
<td>46.3</td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: 不同注意力配置的复杂推理基准结果.</p>
</blockquote>
<p><strong>注意力 Sink Bias 消融</strong> 如表 2 所示, 不使用 Sink Bias 的混合 SWA(W=128, w/o sink)在通用基准上遭受明显性能下降, 而引入注意力 Sink Bias 后, 性能相对于全 GA 基线得到一致恢复甚至提升. 因此, 在后续实验中, 我们默认使用注意力 Sink Bias.</p>
<p><strong>滑动窗口注意力尺寸</strong> 混合 SWA(W=128)和混合 SWA(W=512)在通用基准上表现相近(表 2). 然而, 经过长上下文扩展和长上下文 SFT 后, 混合 SWA(W=128)超越了全 GA 基线, 而 SWA(W=512)则出现显著下降(表 3).</p>
<p><strong>推理能力</strong> 如表 4 所示, 混合 SWA(W=128)在不同挑战性推理基准上超越了全 GA 基线, 在复杂推理能力上展现出清晰的改进.</p>
<h4 id="2-2-2-zjytl">2.2.2 总结与讨论</h4>
<p>我们的实验表明, 混合 SWA(W=128)不仅优于混合 SWA(W=512), 甚至能超越全 GA 基线, 这可能看似违反直觉. 我们假设这源于更好的正则化和有效的稀疏性共同作用. 较小的窗口迫使模型聚焦局部上下文, 作为一种归纳偏置, 缓解了对虚假模式的过拟合. 此外, 更紧凑的窗口(W=128)迫使 SWA 建模局部信息, 同时将长距离依赖委托给全局注意力层, 产生了更清晰的分工和更准确高效的学习. 相比之下, 更大的窗口(W=512)会模糊这种区分, 导致 SWA 自身部分处理长距离依赖, 稀释了局部与全局信息的分离, 从而导致次优性能.</p>
<blockquote>
<p>这里的设计权衡值得注意. 传统直觉认为&quot;更大的注意力窗口总是更好&quot;, 但 MiMo-V2-Flash 的消融实验提供了一个反直觉却有力的证据: 在 Hybrid Architecture 中, 窗口大小不是越大越好, 存在一个&quot;甜蜜点&quot;使得 SWA 和 GA 的职责边界最清晰. W=128 是一个相当激进的选择——相比之下 Gemma-3 的滑动窗口是 1024, Llama-4 是 8192. 但关键在于, MiMo-V2-Flash 通过 5:1 的高 SWA:GA 比例(每 5 个 SWA 层配 1 个 GA 层)来补偿, 确保每 6 层就有一次全局信息聚合的机会. 这种&quot;小窗口 + 高比例&quot;的组合, 在工程上意味着 KV Cache 的节省是真实的: 对于 128K 上下文, SWA 的 KV Cache 只有全 GA 的 1/6(加上 Sink Bias 的微小开销).</p>
</blockquote>
<p>我们强调, 这些观察和发现是基于我们特定的实验设置(包括模型规模、数据集和训练流程)得出的经验性结论. 尽管如此, 我们希望这些观察能为推理和智能体 AI 时代高效注意力架构的持续讨论提供额外的视角, 并激励社区进一步研究高效架构.</p>
<h3 id="2-3-qljd-token-yc-mtp">2.3 轻量级多 Token 预测 (MTP)</h3>
<h4 id="2-3-1-sy-mtp-ddj">2.3.1 使用 MTP 的动机</h4>
<p>先前工作表明, MTP 是一种强大的训练目标, 能够提升训练效率和模型质量(Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025). 除了这些训练收益外, 我们更强调将 MTP 作为原生 Draft Model(草稿模型)用于自投机解码(Self-Speculative Decoding), 以在实际部署中实现加速. 下面从两个角度阐述 MTP 如何加速推理: 通用 LLM 解码加速和 RL 训练加速.</p>
<p><strong>加速 LLM 解码</strong> LLM 解码本质上是内存受限的(Memory-bound), 因为算术强度较低. 批次级并行(Batch-level Parallelism)常用于提高 FFN 的算术强度, 但无法惠及注意力计算, 因为每个请求维护自己的 KV Cache. 相比之下, MTP 通过生成多个草稿 Token, 再由主模型并行验证, 提升了 FFN 和注意力的算术强度. 这种方法实现了 Token 级并行, 且不增加 KV Cache I/O.</p>
<p><strong>加速 RL 训练</strong> MTP 加速特别适用于 RL 训练(RadixArk Team, 2025), 其中 Rollout 阶段因推理和解码成本而成为主导瓶颈. MTP 解决了 RL 训练中的两个关键挑战:</p>
<ul>
<li>它使得小批次的高效有效 RL 成为可能. 当前 RL 训练依赖大批次、离线策略(Off-policy)算法来最大化吞吐量(Liu et al., 2025; Schulman et al., 2017; Zheng et al., 2025). 然而, 在线策略(On-policy)训练通常更稳定、更有效, 但其小批次会欠利用 GPU 资源. MTP 通过扩展 Token 级并行而非批次大小来缓解这一限制, 使小批次在线策略 RL 训练更加实用.</li>
</ul>
<blockquote>
<p>译者注: MTP 在 RL 场景下的价值被 MiMo-V2-Flash 特别强调, 这是一个容易被忽视但极其重要的洞察. 在 RL 训练中, Rollout 阶段通常占 70%-90% 的总训练时间, 因为需要让每个样本走完完整的推理链. MTP 通过一次生成多个 Token, 本质上是把&quot;时间并行&quot;转化为&quot;空间并行&quot;, 在不增加批次的条件下提高了 GPU 利用率. 这对于 On-policy 算法(如 PPO、GRPO)尤为关键, 因为这些算法要求 Rollout 和训练使用同一策略, 无法通过增大 Replay Buffer 来折中. MiMo-V2-Flash 的 MTP Block 刻意使用 Dense FFN + SWA(而非主模型的 MoE + GA), 正是为了在 Draft 阶段保持极低延迟.</p>
</blockquote>
<h4 id="2-3-2-mimo-v2-flash-zdqlj-mtp-sj">2.3.2 MiMo-V2-Flash 中的轻量级 MTP 设计</h4>
<p>MTP Block 采用 Dense FFN 替代 MoE, 并应用 SWA 而非 GA, 使其对投机解码保持轻量化. 每个 MTP Block 的参数量为 0.33B, 相对于主模型的 309B 总参数而言几乎可以忽略.</p>
<hr>
<h2 id="3-yxl-pre-training">3 预训练 (Pre-Training)</h2>
<p>MiMo-V2-Flash 的预训练语料由 27 万亿 Token 组成, 来源包括公开网页内容、书籍、学术论文、代码、数学和更广泛的 STEM 材料. 数据处理流程 largely follows MiMo-7B(Xia et al., 2025), 并刻意向具有长距离依赖的数据倾斜. 具体而言, 我们强调长格式网页文档和精心策划的代码语料(如仓库级代码、Pull Request、Issue 和 Commit 历史), 以增强模型捕获扩展上下文关系和执行复杂多步推理的能力.</p>
<h3 id="3-1-sjtdq">3.1 数据调度器</h3>
<p>MiMo-V2-Flash 的预训练分为三个顺序阶段:</p>
<ul>
<li><strong>Stage 1 (预训练, 0-22T)</strong>: 模型在多样化、高质量的通用语料上训练, 使用 32K 的上下文长度, 以建立强大的基础语言能力.</li>
<li><strong>Stage 2 (中训练, 22-26T)</strong>: 我们修改数据混合比例, 上采样(Upsample)以代码为中心的数据, 并引入约 5% 的合成推理数据, 以进一步增强逻辑推理和程序合成能力.</li>
<li><strong>Stage 3 (上下文扩展, 26-27T)</strong>: 在 Stage 2 的数据分布基础上, 将模型上下文窗口扩展至 256K tokens, 并上采样具有长距离依赖的数据, 以实现更有效的扩展上下文建模和长程推理.</li>
</ul>
<h3 id="3-2-ccs">3.2 超参数</h3>
<p><strong>模型超参数</strong> MiMo-V2-Flash 配置为 48 层 Transformer, 包含 39 层滑动窗口注意力层和 9 层全局注意力层. Hidden Dimension 设为 4096. 除第一层外, 所有层均配备稀疏 MoE. 每个 MoE 层包含 256 个路由专家, 每 Token 激活 8 个专家, 每个专家的中间 Hidden Dimension 为 2048. Dense 层 FFN 的中间 Hidden Dimension 设为 16384. 所有可学习参数以标准差 0.006 随机初始化. 模型在预训练期间使用单个 MTP 层. 总体而言, MiMo-V2-Flash 拥有 309B 总参数, 其中 15B 为激活参数.</p>
<p><strong>训练超参数</strong> 我们使用 AdamW 优化器, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn></mrow><annotation encoding="application/x-tex">\\beta_1 = 0.9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.9</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_2 = 0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>, 权重衰减为 0.1. 梯度裁剪应用最大范数 1.0. 学习率调度分为两个阶段. Stage 1 中, 学习率从 0 线性预热至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.2 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, 持续前 50B tokens, 随后恒定 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.2 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 持续 12T tokens, 最后以余弦衰减至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, 持续 10T tokens. Stage 2 从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 开始, 以余弦衰减至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>, 持续 4T tokens. 批次大小线性预热至 2048, 持续前 500B tokens, 之后保持恒定. 关于辅助损失, MoE 序列辅助损失系数在所有阶段设为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>. 专家 Bias 更新因子在 Stage 1 和 Stage 2 设为 0.001. MTP 损失权重在 Stage 1 设为 0.3, Stage 2 和 Stage 3 设为 0.1.</p>
<p><strong>长上下文扩展</strong> Stage 1 中, 预训练序列长度设为 32,768, GA 的 RoPE Base Frequency 为 640,000, SWA 为 10,000. Stage 3 中, 序列长度扩展至 262,144, GA 的 RoPE Base Frequency 调整为 5,000,000. Stage 3 的学习率从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 以余弦衰减至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>, 固定批次大小 256. Stage 3 的专家 Bias 更新因子降至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span>.</p>
<blockquote>
<p>译者注: 预训练的学习率调度非常保守. 预热期长达 50B tokens(约占 Stage 1 的 2.3%), 峰值学习率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3.2</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">3.2 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3.2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span> 并不算高. 更值得注意的是, 在 22T tokens 处进入 Stage 2 时, 学习率已经衰减到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, 这相当于在模型已经&quot;收敛&quot;的情况下继续训练, 但通过调整数据分布(上采样代码 + 合成推理数据)来重新&quot;激活&quot;学习. 这种&quot;数据切换 + 低学习率延续&quot;的策略, 避免了在高学习率下切换数据分布可能导致的灾难性遗忘. 上下文扩展放在最后 1T tokens(Stage 3)也是一个精打细算的安排——长序列训练的通信开销极大, 只在最后阶段做可以最大化效率.</p>
</blockquote>
<h3 id="3-3-pg">3.3 评估</h3>
<h4 id="3-3-1-pgsz">3.3.1 评估设置</h4>
<p>我们在一系列基准上评估 MiMo-V2-Flash-Base, 涵盖多种能力: (1) 通用语言理解与推理, 包括 BBH, MMLU, MMLU-Redux, MMLU-Pro, DROP, ARC, HellaSwag, WinoGrande, TriviaQA, GPQA-Diamond, SuperGPQA, SimpleQA. (2) 数学推理: GSM8K, MATH, AIME(2024 &amp; 2025). (3) 代码: HumanEval+, MBPP+, CRUXEval, MultiPL-E, BigCodeBench, LiveCodeBench-v6, SWE-Bench( few-shot Agentless Repair). (4) 中文理解: C-Eval, CMMLU, C-SimpleQA. (5) 多语言理解: GlobalMMLU, INCLUDE. (6) 长上下文: NIAH-Multi, GSM-Infinite(5-shot, Hard Ops-{2,4,6,8,10}).</p>
<h4 id="3-3-2-pgjg">3.3.2 评估结果</h4>
<p>表 5 展示了 MiMo-V2-Flash-Base 与领先开源基座模型的全面比较.</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>MiMo-V2-Flash Base (15B/309B)</th>
<th>Kimi-K2 Base (32B/1043B)</th>
<th>DeepSeek-V3.1 Base (37B/671B)</th>
<th>DeepSeek-V3.2 Exp Base (37B/671B)</th>
</tr>
</thead>
<tbody><tr>
<td>BBH</td>
<td>88.5</td>
<td>88.7</td>
<td>88.2</td>
<td>88.7</td>
</tr>
<tr>
<td>MMLU</td>
<td>86.7</td>
<td>87.8</td>
<td>87.4</td>
<td>87.8</td>
</tr>
<tr>
<td>MMLU-Redux</td>
<td>90.6</td>
<td>90.2</td>
<td>90.0</td>
<td>90.4</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>73.2</td>
<td>69.2</td>
<td>58.8</td>
<td>62.1</td>
</tr>
<tr>
<td>GPQA-Diamond</td>
<td>55.1</td>
<td>48.1</td>
<td>51.0</td>
<td>52.0</td>
</tr>
<tr>
<td>SimpleQA</td>
<td>20.6</td>
<td>35.3</td>
<td>26.3</td>
<td>27.0</td>
</tr>
<tr>
<td>GSM8K</td>
<td>92.3</td>
<td>92.1</td>
<td>91.4</td>
<td>91.1</td>
</tr>
<tr>
<td>MATH</td>
<td>71.0</td>
<td>70.2</td>
<td>62.6</td>
<td>62.5</td>
</tr>
<tr>
<td>AIME 24&amp;25</td>
<td>35.3</td>
<td>31.6</td>
<td>21.6</td>
<td>24.8</td>
</tr>
<tr>
<td>HumanEval+</td>
<td>70.7</td>
<td>84.8</td>
<td>64.6</td>
<td>67.7</td>
</tr>
<tr>
<td>MBPP+</td>
<td>71.4</td>
<td>73.8</td>
<td>72.2</td>
<td>69.8</td>
</tr>
<tr>
<td>LiveCodeBench v6</td>
<td>30.8</td>
<td>26.3</td>
<td>24.8</td>
<td>24.9</td>
</tr>
<tr>
<td>SWE-Bench (Agentless)</td>
<td>30.8</td>
<td>28.2</td>
<td>24.8</td>
<td>9.4</td>
</tr>
<tr>
<td>C-Eval</td>
<td>87.9</td>
<td>92.5</td>
<td>90.0</td>
<td>91.0</td>
</tr>
<tr>
<td>CMMLU</td>
<td>87.4</td>
<td>90.9</td>
<td>88.8</td>
<td>88.9</td>
</tr>
<tr>
<td>GlobalMMLU</td>
<td>76.6</td>
<td>80.7</td>
<td>81.9</td>
<td>82.0</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: MiMo-V2-Flash 与其他开源基座模型的比较. 标注 * 表示模型未遵循少样本示例格式.</p>
</blockquote>
<p>MiMo-V2-Flash-Base 在大多数基准上提供了具有竞争力的性能, 并在推理任务(MMLU-Pro, GPQA-Diamond, AIME)上一致性地超越同类模型. 在 SWE-Bench 上, 它甚至超越了参数量大得多的 Kimi-K2-Base, 同时使用的参数量不到后者的三分之一, 凸显了我们方法在真实代码智能体任务上的优势. 然而, 受限于有限的参数量, 我们观察到 MiMo-V2-Flash 相比更大模型展现出较低的知识容量, 反映在 SimpleQA 上.</p>
<p>表 6 展示了各模型的长上下文能力. 在长上下文检索方面, 我们的模型架构在 32K 到 256K 范围内实现了接近 100% 的成功率. 在极端压力长上下文推理基准 GSM-Infinite 上, MiMo-V2-Flash 也展现出强劲性能, 从 16K 到 128K 的性能衰减极小. 相比之下, DeepSeek-V3.2-Exp(一种稀疏注意力 LLM)在 32K 以下取得最高分, 但在 64K 和 128K 显著下降, 表明其在嘈杂输入下的长上下文推理存在内在劣势. 这些结果强有力地证明了混合 SWA 架构、原生 32K 预训练和上下文扩展训练的有效性和可扩展性.</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>MiMo-V2-Flash Base</th>
<th>Kimi-K2 Base</th>
<th>DeepSeek-V3.1 Base</th>
<th>DeepSeek-V3.2 Exp Base</th>
</tr>
</thead>
<tbody><tr>
<td>NIAH-Multi 32K</td>
<td>99.3</td>
<td>99.8</td>
<td>99.7</td>
<td>85.6</td>
</tr>
<tr>
<td>NIAH-Multi 64K</td>
<td>99.9</td>
<td>100.0</td>
<td>98.6</td>
<td>85.9</td>
</tr>
<tr>
<td>NIAH-Multi 128K</td>
<td>98.6</td>
<td>99.5</td>
<td>97.2</td>
<td>94.3</td>
</tr>
<tr>
<td>NIAH-Multi 256K</td>
<td>96.7</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>GSM-Infinite 16K</td>
<td>37.7</td>
<td>34.6</td>
<td>41.5</td>
<td>50.4</td>
</tr>
<tr>
<td>GSM-Infinite 32K</td>
<td>33.7</td>
<td>26.1</td>
<td>38.8</td>
<td>45.2</td>
</tr>
<tr>
<td>GSM-Infinite 64K</td>
<td>31.5</td>
<td>16.0</td>
<td>34.7</td>
<td>32.6</td>
</tr>
<tr>
<td>GSM-Infinite 128K</td>
<td>29.0</td>
<td>8.8</td>
<td>28.7</td>
<td>25.7</td>
</tr>
</tbody></table>
<blockquote>
<p>表 6: MiMo-V2-Flash 与其他开源基座模型的长上下文性能. 标注 * 表示模型可能未遵循提示格式. 所有基线模型的最大上下文长度均短于 256K.</p>
</blockquote>
<blockquote>
<p>译者注: 两个表格传递了一个明确信号: MiMo-V2-Flash-Base 在推理和代码任务上以 15B 激活参数实现了对 32B-37B 激活参数对手的超越, 但在知识密集型任务(SimpleQA)和多语言(GlobalMMLU)上仍有差距. 这不是缺陷, 而是资源约束下的理性取舍——将有限的参数预算集中在推理和代码能力上. 长上下文评估尤其值得关注: 在 GSM-Infinite 上, MiMo-V2-Flash 从 16K 到 128K 只下降了 8.7 个百分点(37.7% -&gt; 29.0%), 而 DeepSeek-V3.2-Exp 下降了 24.7 个百分点(50.4% -&gt; 25.7%). 这说明 Hybrid SWA 在&quot;长序列 + 复杂推理&quot;的双重压力下, 比稀疏注意力更稳健.</p>
</blockquote>
<hr>
<h2 id="4-hxl-post-training">4 后训练 (Post-Training)</h2>
<h3 id="4-1-djszxclzl-mopd-yzxdhxlfs">4.1 多教师在线策略蒸馏 (MOPD): 一种新的后训练范式</h3>
<p>现代语言模型越来越依赖大规模后训练来提升智能和能力. 然而, 当前后训练流程面临根本性挑战: <strong>能力失衡</strong>, 即提升一项技能会导致其他技能退化(&quot;跷跷板效应&quot;); 以及<strong>学习效率低下</strong>, 现有方法在整合多个专用模型的知识时未能充分利用训练信号.</p>
<p>我们提出 MOPD(Multi-Teacher On-Policy Distillation, 多教师在线策略蒸馏), 一种统一的后训练范式, 通过三阶段框架解决这些挑战:</p>
<ul>
<li><strong>Stage 1: 监督微调 (SFT)</strong> 通过在高质量指令-响应对上进行监督学习, 建立基础的指令遵循能力, 使模型能够理解和执行跨领域的用户请求.</li>
<li><strong>Stage 2: 领域专用训练</strong> 通过在聚焦任务上进行独立的 RL 优化, 训练一系列领域专用教师模型, 包括智能体能力(搜索、编码、通用工具使用)和非智能体任务(数学推理、通用推理、安全对齐). 每个教师通过领域特定奖励信号的目标优化, 在其 respective domain 中实现卓越性能.</li>
<li><strong>Stage 3: 多教师在线策略蒸馏</strong> 不同于合并模型参数或从专家生成静态离线数据集, 我们将多教师知识整合表述为一个在线策略强化学习过程. 学生模型从自身演化的分布中采样, 并通过 KL 散度奖励(Agarwal et al., 2023; Gu et al., 2024c; Lu and Lab, 2025)从领域专用教师接收 Token 级监督, 有效结合专用能力而不产生传统权衡(表 7).</li>
</ul>
<table>
<thead>
<tr>
<th>基准</th>
<th>MOPD 前学生</th>
<th>最佳教师</th>
<th>MOPD 后学生</th>
<th>(学生-教师)差距</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2025</td>
<td>89.3</td>
<td>93.9 (RL)</td>
<td>94.1</td>
<td>+0.2</td>
</tr>
<tr>
<td>HMMT Feb. 2025</td>
<td>76.9</td>
<td>82.6 (RL)</td>
<td>84.4</td>
<td>+1.8</td>
</tr>
<tr>
<td>LiveCodeBench</td>
<td>77.5</td>
<td>82.6 (RL)</td>
<td>83.2</td>
<td>+0.6</td>
</tr>
<tr>
<td>MMLU-Pro</td>
<td>84.7</td>
<td>84.7 (Self)</td>
<td>84.9</td>
<td>+0.2</td>
</tr>
<tr>
<td>GPQA-Diamond</td>
<td>84.9</td>
<td>84.9 (Self)</td>
<td>84.3</td>
<td>-0.6</td>
</tr>
<tr>
<td>HLE (w/o Tool)</td>
<td>21.2</td>
<td>21.2 (Self)</td>
<td>22.1</td>
<td>+0.9</td>
</tr>
<tr>
<td>Arena-Hard (Hard)</td>
<td>50.0</td>
<td>50.0 (Self)</td>
<td>54.1</td>
<td>+4.1</td>
</tr>
<tr>
<td>Arena-Hard (Creative)</td>
<td>90.1</td>
<td>90.1 (Self)</td>
<td>86.2</td>
<td>-3.9</td>
</tr>
<tr>
<td>SWE-Bench Verified</td>
<td>67.8</td>
<td>74.2 (RL)</td>
<td>73.4</td>
<td>-0.8</td>
</tr>
<tr>
<td>Tau2-Bench</td>
<td>75.9</td>
<td>79.6 (RL)</td>
<td>80.3</td>
<td>+0.7</td>
</tr>
<tr>
<td>Tau2-Bench (Telecom)</td>
<td>92.7</td>
<td>95.0 (RL)</td>
<td>95.3</td>
<td>+0.3</td>
</tr>
<tr>
<td>BrowseComp</td>
<td>42.5</td>
<td>51.7 (SFT)</td>
<td>45.4</td>
<td>-6.3</td>
</tr>
</tbody></table>
<blockquote>
<p>表 7: MOPD 的基准结果. 最佳教师类型标注为 RL、SFT 或学生模型自身.</p>
</blockquote>
<p>这一统一框架相比传统后训练方法提供了若干关键优势:</p>
<ul>
<li><strong>有效且高效</strong>. 不同于参数合并或顺序训练(常常需要权衡能力), MOPD 在所有领域保留了最强教师的峰值性能. 此外, 使用来自教师 Logits 的密集 Token 级奖励进行在线策略蒸馏, 确保了稳定的信用分配和快速收敛. 通过从自身分布中学习, 学生避免了离线方法在静态数据集上训练时常见的暴露偏差(Exposure Bias)和分布不匹配.</li>
<li><strong>模块化且可扩展</strong>. 教师模型的选择高度灵活: 可以是具有强大能力的专用 RL 模型、不同的 SFT 模型, 甚至学生模型自身. 解耦设计使得无需重构整个流程即可轻松集成新教师. 此外, 该框架与现有的结果奖励模型(ORMs)无缝协作, 对于复杂智能体任务尤为有利, 否则为这些任务建立独立训练流程会非常繁琐.</li>
<li><strong>迭代协同进化</strong>. MOPD 天然支持教师-学生协同进化循环. 蒸馏后的学生模型可以重新进入专用 RL 阶段以产生更强的教师, 这些教师反过来为下一代学生提供更高质量的监督, 形成一个自我强化的改进循环, 实现持续的能力扩展.</li>
</ul>
<blockquote>
<p>译者注: MOPD 的洞察非常深刻. 传统多教师蒸馏的常见做法有两种: (1) 参数合并(Model Soup/Merge), 简单粗暴但会抹平各教师的专长; (2) 离线蒸馏, 用教师生成静态数据集再训练学生, 但存在 Exposure Bias——学生在训练时看到的是教师分布, 推理时却是自身分布, 这种 mismatch 会随着训练加剧. MOPD 的核心创新是将蒸馏重新定义为&quot;在线策略 RL 问题&quot;: 学生从自己的分布采样, 教师提供 Token 级的 Reverse KL 奖励. 这意味着学生每一步都在学习&quot;如何更像教师&quot;, 但始终基于自己的策略——没有分布漂移. 从表 7 可以看到一个有趣的现象: MOPD 后学生在 4 个基准上超越了最佳教师(如 HMMT +1.8, Arena-Hard Hard +4.1, Tau2-Bench +0.7), 说明多教师知识的整合产生了&quot;1+1&gt;2&quot;的协同效应. 但在 BrowseComp 上差距达 -6.3, 可能是因为搜索智能体的教师是 SFT 而非 RL 训练, 其分布与 RL 优化后的学生不够兼容.</p>
</blockquote>
<h3 id="4-2-jdwt-sft">4.2 监督微调 (SFT)</h3>
<p>SFT 阶段是我们后训练流程的基础, 将基座模型转变为能够在多样化任务中遵循指令并有效响应的助手. 这一阶段对于激活模型在预训练期间获得的潜在能力, 并将其输出与期望的格式和风格对齐至关重要.</p>
<p>为此, 我们策划了数百万训练样本, 涵盖通用对话、推理、编码和智能体任务等多个领域. 这些样本覆盖思考模式(Thinking Mode)和非思考模式(Non-thinking Mode), 响应由我们内部的领域专用模型Checkpoint生成. 这种多样化的训练混合确保了模型在其预期用例中的全面能力激活.</p>
<p>通过初步实验, 我们识别出一个 MoE SFT 训练的关键稳定性指标: 零梯度参数数量(num-zeros). 该指标为训练不稳定性提供早期预警信号: num-zeros 增加表明专家间的负载均衡恶化, num-zeros 减少则表明模型显著过拟合于训练数据. 在整个训练过程中保持稳定的 num-zeros 对于成功的 SFT 至关重要. 此外, 这种稳定性对于确保后续 RL 阶段的稳健性和收敛性也至关重要.</p>
<p>我们的实验揭示, num-zeros 的稳定性关键取决于两个超参数: 专家 Bias 更新率和 AdamW 优化器的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\beta_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 参数. 基于这些发现, 我们配置训练如下: 使用从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>5</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5.0 \\times 10^{-5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">5</span></span></span></span></span></span></span></span></span></span></span></span> 到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>5.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">5.0 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">5.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 的余弦衰减学习率调度, 批次大小 128, AdamW <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>8</mn></mrow></msup></mrow><annotation encoding="application/x-tex">\\beta_2 = 1.0 \\times 10^{-8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">8</span></span></span></span></span></span></span></span></span></span></span></span>. MoE 专家 Bias 更新率设为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>4</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-4}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">4</span></span></span></span></span></span></span></span></span></span></span></span>, 序列辅助损失系数为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1.0</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">1.0 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1.0</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span>.</p>
<h3 id="4-3-gmhqhxx-rl">4.3 规模化强化学习 (RL)</h3>
<p>强化学习将模型能力推至 SFT 单独无法达到的高度. 我们根据任务是否涉及智能体行为采用不同的 RL 策略, 同时扩展非智能体和智能体 RL 训练以最大化跨领域性能.</p>
<h4 id="4-3-1-fznt-rl-xl">4.3.1 非智能体 RL 训练</h4>
<p>非智能体 RL 训练聚焦于提升模型在单轮任务上的性能, 模型生成完整响应而无需交互反馈或多步执行. 主要目标是在可验证领域(如数学、编码、逻辑)增强推理准确性, 同时在开放式对话中对齐有用性和安全性输出.</p>
<p>我们生成奖励信号的方法因任务特性而异. 对于具有可验证结果的领域, 我们采用混合验证系统, 结合程序化工具与 LLM Judge, 自动对照策划的问题-解对评估正确性. 对于有用性和安全性等主观质量, 我们实现基于评分标准(Rubric)的框架, 由高级 LLM Judge 根据详细评分标准和参考答案评估响应, 产生细粒度的奖励信号, 引导模型朝向期望行为.</p>
<h4 id="4-3-2-znt-rl-xl">4.3.2 智能体 RL 训练</h4>
<p>非智能体 RL 聚焦单轮推理和生成, 而智能体 RL 训练模型在交互式、多轮环境中运行, 需要规划、动作执行和基于反馈的适应. 我们沿着两个关键维度扩展智能体 RL: 环境多样性和计算资源.</p>
<p><strong>扩展智能体环境多样性</strong> 我们构建了一套多样化的智能体训练环境, 涵盖代码调试、终端操作、网页开发和通用工具使用(表 8).</p>
<table>
<thead>
<tr>
<th>智能体类型</th>
<th>任务数量</th>
<th>环境</th>
<th>提示来源</th>
</tr>
</thead>
<tbody><tr>
<td>Code Agent</td>
<td>90K</td>
<td>真实</td>
<td>真实</td>
</tr>
<tr>
<td>Terminal Agent</td>
<td>30K</td>
<td>真实</td>
<td>合成</td>
</tr>
<tr>
<td>Search Agent</td>
<td>150K</td>
<td>真实</td>
<td>合成</td>
</tr>
<tr>
<td>General Agent</td>
<td>50K</td>
<td>合成</td>
<td>合成</td>
</tr>
</tbody></table>
<blockquote>
<p>表 8: 不同智能体类型的训练数据组成摘要. 我们同时利用真实世界和合成生成的数据.</p>
</blockquote>
<p>每个环境针对不同的能力, 同时共享多步推理和执行的共同要求. 以下详述各智能体环境:</p>
<p><strong>Code Agent</strong> 我们在大规模代码智能体任务上进行训练, 这些任务源自真实 GitHub Issue, 模型在智能体循环中运行以读取和编辑文件、执行命令, 并根据可验证的单元测试获得奖励. 我们的核心洞察是, 持续扩展可用任务能够驱动代码智能的持续提升. 为在超过 100,000 个代码任务上实现高效 RL 训练, 我们开发了两个基础设施组件. 首先, 我们构建了一个自动化环境设置流程, 从仓库快照配置开发环境并打包为容器化镜像, 在 8 种编程语言上实现 70% 的成功率, 由运行超过 10,000 个并发 Pod 的大规模 Kubernetes 集群支持. 其次, 我们实现了一个轻量级智能体脚手架, 无缝集成 Kubernetes、Docker 或本地后端, 暴露三个原子工具(bash, str_replace, finish), 仅通过 Shell 命令与执行后端交互. 这种设计消除了基于服务器的工具实现, 采用最小化的系统提示且无预定义工作流, 允许模型在训练期间自行发现最佳实践.</p>
<p><strong>Terminal Agent</strong> 除 GitHub Issue 外, 我们使用来自 Stack Overflow 和 Stack Exchange 的任务强化基于终端的问题解决能力. 我们选择需要高级技术专长的材料, 将其转化为带有相应查询、Dockerfile 和测试用例的计算任务. 在验证环境安装并按难度和可靠性过滤后, 我们获得约 30,000 个带有验证执行环境的查询. 基于通过率的额外过滤移除了正确性判断不可靠或复杂度不足以进行有效 RL 训练的任务.</p>
<p><strong>Web Development Agent</strong> 为提升网页开发代码生成, 我们构建了一个基于真实世界网页的合成数据集, 并配合多模态验证器. 我们收集高质量的用户编写网页, 使用 Playwright 执行生成的代码以获取渲染视频, 并应用多模态视觉判别器仅保留高质量样本, 其中基于视频的评估相比静态截图减少了视觉幻觉. 我们从策划的网页反向工程用户查询作为种子提示, 合成覆盖八个网页类别的大规模 RL 数据. 我们的基于视觉的验证器从录制的视频中为 Rollout 执行评分, 联合评估视觉质量、功能正确性和可执行性, 确保奖励同时反映外观和行为.</p>
<p><strong>General Agent</strong> 我们开发两种通用智能体能力. 我们的 Search Agent 采用提供三个核心工具(search, open, find)的脚手架进行自主网页探索. 我们通过从种子实体进行递归事实图扩展来构建查询, 难度随关系链深度和细节混淆程度而增加, 实现可验证答案的挑战性搜索问题的自动化生成. 我们的 Function-Calling Agent 在具有自定义工具集的合成应用环境上训练, 通过生成基于显式数据依赖(直接输入-输出关系)和隐式逻辑依赖(推理隐藏系统状态)的工具调用图来构建, 要求同时具备数据传播和状态推断能力.</p>
<p><strong>扩展智能体计算</strong> 在前述多样化智能体环境上训练(表 8), 我们发现扩展智能体 RL 计算不仅提升了代码智能体性能, 还有效泛化到其他任务类型. 图 4 展示了代码智能体的 RL 训练曲线, 模型在约 120K 个环境中进行了在线策略 Rollout 和更新. 这种扩展显著提升了 SFT 基座模型在 SWE-Bench-Verified 和 SWE-Bench-Multilingual 上的表现. 此外, 图 5 表明大规模代码智能体 RL 训练有效泛化到其他智能体任务, 以及数学、编码和通用推理基准, 表明智能体训练发展了广泛可迁移的问题解决能力.</p>
<blockquote>
<p>译者注: 智能体 RL 训练的数据规模和基础设施投入令人印象深刻. 100K+ 代码任务、10K+ 并发 Kubernetes Pod、覆盖 8 种编程语言的自动化环境设置——这已经不是&quot;实验室规模&quot;的研究, 而是工业级 RL 训练系统. 特别值得注意的是 Code Agent 的脚手架设计: 只有三个原子工具(bash, str_replace, finish), 没有预定义工作流. 这与许多框架(如 AutoGPT、OpenDevin)的&quot;重型工具链&quot;思路形成鲜明对比. MiMo-V2-Flash 的洞察是: 给模型最小化的工具集, 让它在 RL 训练中自行发现最佳实践. 这与 AlphaGo 的&quot;少规则、多搜索&quot;哲学一脉相承. 另一个细节是 Web Development Agent 使用视频而非截图做视觉验证——这是对静态截图容易被&quot;视觉欺骗&quot;问题的直接回应.</p>
</blockquote>
<h3 id="4-4-mopd-djsxsh">4.4 MOPD 的技术形式化</h3>
<p>在通过 SFT 建立基础并通过领域专用 RL 训练专用教师之后, 我们现在形式化多教师在线策略蒸馏机制, 将这些专用能力整合到统一的学生模型中.</p>
<p>具体而言, 我们将多教师蒸馏表述为一个在线策略强化学习目标. 设 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示训练引擎中优化的目标学生策略, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mtext>sample</mtext></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\text{sample}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sample</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 表示推理引擎中采用的学生采样策略, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mtext>domain</mtext></msub></mrow><annotation encoding="application/x-tex">\\pi_{\\text{domain}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示针对提示 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span> 所属领域专用的教师策略(从分布 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">D</mi></mrow><annotation encoding="application/x-tex">\\mathcal{D}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0278em;">D</span></span></span></span> 采样). 令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mtext>sg</mtext><mo stretchy="false">[</mo><mo>⋅</mo><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">\\text{sg}[\\cdot]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">sg</span></span><span class="mopen">[</span><span class="mord">⋅</span><span class="mclose">]</span></span></span></span> 表示 Stop-Gradient 算子. 学生与教师之间的 Reverse KL 散度损失定义为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>reverse-KL</mtext></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi mathvariant="script">D</mi><mo separator="true">,</mo><msub><mi>π</mi><mtext>sample</mtext></msub></mrow></msub><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mtext>domain</mtext></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">]</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(5)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{reverse-KL}}(\\theta) = -\\mathbb{E}_{\\mathcal{D}, \\pi_{\\text{sample}}} \\left[ \\log \\frac{\\pi_{\\text{domain}}(y | x, y_{&lt;t})}{\\pi_\\theta(y | x, y_{&lt;t})} \\right] \\tag{5}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reverse-KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sample</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2901em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3531em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span></span><span class="tag"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">5</span></span><span class="mord">)</span></span></span></span></span></span><p>其梯度为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="normal">∇</mi><mi>θ</mi></msub><msub><mi mathvariant="script">L</mi><mtext>reverse-KL</mtext></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi mathvariant="script">D</mi><mo separator="true">,</mo><msub><mi>π</mi><mtext>sample</mtext></msub></mrow></msub><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mtext>domain</mtext></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo>⋅</mo><msub><mi mathvariant="normal">∇</mi><mi>θ</mi></msub><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><mi>y</mi><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo><mo fence="true">]</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(6)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\nabla_\\theta \\mathcal{L}_{\\text{reverse-KL}}(\\theta) = -\\mathbb{E}_{\\mathcal{D}, \\pi_{\\text{sample}}} \\left[ \\log \\frac{\\pi_{\\text{domain}}(y | x, y_{&lt;t})}{\\pi_\\theta(y | x, y_{&lt;t})} \\cdot \\nabla_\\theta \\log \\pi_\\theta(y | x, y_{&lt;t}) \\right] \\tag{6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord">∇</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reverse-KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sample</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2901em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3531em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord">∇</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span></span><span class="tag"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">6</span></span><span class="mord">)</span></span></span></span></span></span><p>遵循 Zhao et al. (2025), 我们应用训练-推理重要性采样并丢弃差异过大的 Token. 随后定义 MOPD 的替代损失(Surrogate Loss):</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msub><mi mathvariant="script">L</mi><mtext>MOPD</mtext></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mi mathvariant="script">D</mi><mo separator="true">,</mo><msub><mi>π</mi><mtext>sample</mtext></msub></mrow></msub><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mrow><mi mathvariant="normal">∣</mi><mi>y</mi><mi mathvariant="normal">∣</mi></mrow></mfrac><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi mathvariant="normal">∣</mi><mi>y</mi><mi mathvariant="normal">∣</mi></mrow></munderover><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>MOPD</mtext></msubsup><mo>⋅</mo><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo><mo fence="true">]</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(7)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{MOPD}}(\\theta) = -\\mathbb{E}_{\\mathcal{D}, \\pi_{\\text{sample}}} \\left[ \\frac{1}{|y|} \\sum_{t=1}^{|y|} \\hat{A}_{t}^{\\text{MOPD}} \\cdot \\log \\pi_\\theta(y_t | x, y_{&lt;t}) \\right] \\tag{7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.6em;vertical-align:-1.55em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sample</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2901em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3531em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.05em;"><span class="pstrut" style="height:5.6em;"></span><span style="width:0.667em;height:3.6em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.667em" height="3.6em" viewBox="0 0 667 3600"><path d="M403 1759 V84 H666 V0 H319 V1759 v0 v1759 h347 v-84
H403z M403 1759 V0 H319 V1759 v0 v1759 h84z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.961em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.386em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">∣</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mtight">∣</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.05em;"><span style="top:-4.05em;"><span class="pstrut" style="height:5.6em;"></span><span style="width:0.667em;height:3.6em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.667em" height="3.6em" viewBox="0 0 667 3600"><path d="M347 1759 V0 H0 V84 H263 V1759 v0 v1759 H0 v84 H347z
M347 1759 V0 H263 V1759 v0 v1759 h84z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.55em;"><span></span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:3.6em;vertical-align:-1.55em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">7</span></span><span class="mord">)</span></span></span></span></span></span><p>其中:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>MOPD</mtext></msubsup><mo>=</mo><mtext>sg</mtext><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mtext>domain</mtext></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">]</mo></mrow><mo>⋅</mo><mi>min</mi><mo>⁡</mo><mrow><mo fence="true">(</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mtext>sample</mtext></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mrow><mo>&lt;</mo><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow></mfrac><mo separator="true">,</mo><mtext> clip</mtext><mo fence="true">)</mo></mrow></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(8)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\hat{A}_{t}^{\\text{MOPD}} = \\text{sg}\\left[ \\log \\frac{\\pi_{\\text{domain}}(y_t | x, y_{&lt;t})}{\\pi_\\theta(y_t | x, y_{&lt;t})} \\right] \\cdot \\min\\left( \\frac{\\pi_\\theta(y_t | x, y_{&lt;t})}{\\pi_{\\text{sample}}(y_t | x, y_{&lt;t})}, \\ \\text{clip} \\right) \\tag{8}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">sg</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.4221em;vertical-align:-0.9721em;"></span><span class="mop">min</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sample</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mrel mtight">&lt;</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1774em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mpunct">,</span><span class="mspace"> </span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">clip</span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span><span class="tag"><span class="strut" style="height:2.4221em;vertical-align:-0.9721em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">8</span></span><span class="mord">)</span></span></span></span></span></span><p>其中 Clip 操作用于限制重要性采样比率. 默认情况下, 我们将 MOPD 的优势与其他类型优势(如使用 ORM 计算的优势, 包括 GRPO(Shao et al., 2024))结合. 令 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>ORM</mtext></msubsup></mrow><annotation encoding="application/x-tex">\\hat{A}_{t}^{\\text{ORM}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ORM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span> 表示 ORM 计算的优势; 最终优势为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mtable width="100%"><mtr><mtd width="50%"></mtd><mtd><mrow><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>final</mtext></msubsup><mo>=</mo><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>MOPD</mtext></msubsup><mo>+</mo><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>ORM</mtext></msubsup></mrow></mtd><mtd width="50%"></mtd><mtd><mtext>(9)</mtext></mtd></mtr></mtable><annotation encoding="application/x-tex">\\hat{A}_{t}^{\\text{final}} = \\hat{A}_{t}^{\\text{MOPD}} + \\hat{A}_{t}^{\\text{ORM}} \\tag{9}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">final</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ORM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span><span class="tag"><span class="strut" style="height:1.1968em;vertical-align:-0.25em;"></span><span class="mord text"><span class="mord">(</span><span class="mord"><span class="mord">9</span></span><span class="mord">)</span></span></span></span></span></span><p>图 6 展示了 MOPD 相比传统后训练方法的有效性. 在数学推理(AIME 2025)和编码(LiveCodeBench)基准上, MOPD 成功保留并整合了来自多个教师的专用能力, 在大多数领域达到或超越了最强教师的性能.</p>
<blockquote>
<p>译者注: 式 (5)-(9) 构成了 MOPD 的完整数学框架. 核心设计选择是 Reverse KL 而非 Forward KL: Forward KL 会强制学生覆盖教师的所有支持(Support), 包括教师自身也不太确定的区域, 容易导致学生&quot;过度扩散&quot;; Reverse KL 则让学生在自身高概率区域去匹配教师, 保留了学生的个性同时吸收教师的知识. 式 (8) 中的重要性采样比率裁剪(Clip)是从 PPO 借鉴的标准技巧, 防止策略更新步长过大. 将 MOPD 优势与 ORM 优势相加(式 9)意味着: Token 级教师信号负责&quot;如何更好地表达&quot;, 而结果级奖励负责&quot;最终答案是否正确&quot;——两者互补, 前者提供密集监督, 后者提供稀疏但可靠的验证.</p>
</blockquote>
<h3 id="4-5-pg">4.5 评估</h3>
<h4 id="4-5-1-pgsz">4.5.1 评估设置</h4>
<p>我们在以下基准上评估 MiMo-V2-Flash: MMLU-Pro, GPQA-Diamond, HLE Text-only, AIME 2025, LiveCodeBench(2024.08-2025.04), HMMT Feb. 2025, Arena-Hard, LongBench V2, MRCR({2,4,8}-needles, 最大 128K), SWE-Bench Verified, SWE-Bench Multilingual, Terminal-Bench, BrowseComp, Tau2-Bench(Barres et al., 2025).</p>
<h4 id="4-5-2-pgjg">4.5.2 评估结果</h4>
<p>表 9 展示了 MiMo-V2-Flash 与开源/闭源模型的对比评估结果.</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>MiMo-V2-Flash</th>
<th>Kimi-K2 Thinking</th>
<th>DeepSeek-V3.2 Thinking</th>
<th>Gemini-3.0 Pro</th>
<th>Claude Sonnet 4.5</th>
<th>GPT-5 High</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU-Pro</td>
<td>84.9</td>
<td>84.6</td>
<td>85.0</td>
<td>90.1</td>
<td>88.2</td>
<td>87.5</td>
</tr>
<tr>
<td>GPQA-Diamond</td>
<td>84.3</td>
<td>84.5</td>
<td>82.4</td>
<td>91.9</td>
<td>83.4</td>
<td>85.7</td>
</tr>
<tr>
<td>HLE (no tools)</td>
<td>22.1</td>
<td>23.9</td>
<td>25.1</td>
<td>37.5</td>
<td>13.7</td>
<td>26.3</td>
</tr>
<tr>
<td>AIME 2025</td>
<td>94.1</td>
<td>94.5</td>
<td>93.1</td>
<td>95.0</td>
<td>87.0</td>
<td>94.6</td>
</tr>
<tr>
<td>HMMT Feb. 2025</td>
<td>84.4</td>
<td>89.4</td>
<td>92.5</td>
<td>97.5</td>
<td>79.2</td>
<td>88.3</td>
</tr>
<tr>
<td>LiveCodeBench-v6</td>
<td>85.1</td>
<td>83.1</td>
<td>83.3</td>
<td>90.7</td>
<td>64.0</td>
<td>84.5</td>
</tr>
<tr>
<td>Arena-Hard (Hard)</td>
<td>54.1</td>
<td>71.9</td>
<td>53.4</td>
<td>72.6</td>
<td>63.3</td>
<td>71.9</td>
</tr>
<tr>
<td>Arena-Hard (Creative)</td>
<td>86.2</td>
<td>80.1</td>
<td>88.8</td>
<td>93.6</td>
<td>76.7</td>
<td>92.2</td>
</tr>
<tr>
<td>LongBench V2</td>
<td>60.6</td>
<td>48.1</td>
<td>58.4</td>
<td>65.6</td>
<td>61.8</td>
<td>-</td>
</tr>
<tr>
<td>MRCR</td>
<td>45.7</td>
<td>44.2</td>
<td>55.5</td>
<td>89.7</td>
<td>55.4</td>
<td>-</td>
</tr>
<tr>
<td>SWE-Bench Verified</td>
<td>73.4</td>
<td>71.3</td>
<td>73.1</td>
<td>76.2</td>
<td>77.2</td>
<td>74.9</td>
</tr>
<tr>
<td>SWE-Bench Multilingual</td>
<td>71.7</td>
<td>61.1</td>
<td>70.2</td>
<td>-</td>
<td>68.0</td>
<td>55.3</td>
</tr>
<tr>
<td>Terminal-Bench Hard</td>
<td>30.5</td>
<td>30.6</td>
<td>35.4</td>
<td>-</td>
<td>33.3</td>
<td>30.5</td>
</tr>
<tr>
<td>Tau2-Bench</td>
<td>80.3</td>
<td>-</td>
<td>80.3</td>
<td>-</td>
<td>-</td>
<td>80.2</td>
</tr>
<tr>
<td>BrowseComp</td>
<td>45.4</td>
<td>60.2</td>
<td>51.4</td>
<td>59.2</td>
<td>24.1</td>
<td>54.9</td>
</tr>
<tr>
<td>BrowseComp (w/ Context Manage)</td>
<td>58.3</td>
<td>74.3</td>
<td>67.6</td>
<td>85.4</td>
<td>-</td>
<td>-</td>
</tr>
</tbody></table>
<blockquote>
<p>表 9: MiMo-V2-Flash 与开源/闭源模型的对比.</p>
</blockquote>
<p>MiMo-V2-Flash 在大多数推理基准上取得了与 Kimi-K2-Thinking 和 DeepSeek-V3.2-Thinking 相当的性能. 该模型还保持了具有竞争力的通用写作能力, 能够在开放式任务上生成高质量响应. 在长上下文评估中, 我们的模型超越了 Kimi-K2-Thinking——一个参数量大得多的全注意力 LLM——凸显了我们混合 SWA 架构的强长上下文能力.</p>
<p>值得注意的是, MiMo-V2-Flash 在 SWE-Bench Verified 上达到 73.4%, 超越了所有开源竞争对手, 接近 GPT-5-High 的性能. 在 SWE-Bench Multilingual 上, 我们的模型解决了 71.7% 的问题, 确立了其作为软件工程任务最强开源 LLM 的地位. 这些结果凸显了我们超大规模智能体 RL 训练的有效性. 在 Terminal Bench 上, 模型也取得了具有竞争力的分数.</p>
<p>在搜索智能体评估中, MiMo-V2-Flash 在 BrowseComp 上得分 45.4, 通过附录 C 中概述的上下文管理方法进一步提升至 58.3. 对于 Tau2-Bench 上的通用工具使用, 我们使用 DeepSeek-V3.2 作为用户智能体, 实现了分类得分 95.3(电信)、79.5(零售)、66.0(航空).</p>
<p>这些结果共同验证了我们 MOPD 后训练范式中超大规模 RL 训练的有效性, 并凸显了模型在真实世界编码、推理和智能体工作流中的强大潜力.</p>
<blockquote>
<p>译者注: 表 9 的结果值得逐项审视. MiMo-V2-Flash 在 SWE-Bench Verified(73.4%)和 SWE-Bench Multilingual(71.7%)上确实建立了开源模型的领先地位, 这两项都是真实的软件工程任务, 不是靠刷题能刷出来的. 但在 BrowseComp(45.4% 原生, 58.3% 带上下文管理)上与 Claude Sonnet 4.5(24.1%)和 GPT-5-High(54.9%)相比仍有差距, 说明搜索智能体能力仍是短板. 另一个有趣的数据点是 Arena-Hard: MiMo-V2-Flash 在 Hard Prompt 上仅 54.1, 远低于 Kimi-K2-Thinking(71.9)和 GPT-5-High(71.9), 但在 Creative Writing 上达到 86.2, 超越了 Kimi-K2-Thinking(80.1). 这可能反映了 MOPD 中各教师能力的分配偏向——推理和编码教师很强, 但通用对话/创意写作教师相对较弱.</p>
</blockquote>
<h3 id="4-6-rl-jcss">4.6 RL 基础设施</h3>
<p>我们的 RL(及 MOPD)基础设施使用 SGLang(Zheng et al., 2024)作为推理引擎, Megatron-LM(Shoeybi et al., 2019)作为训练引擎. 我们在训练和推理中均采用 FP8. 为实现稳定、高效且灵活的 RL 训练, 我们实现了三个扩展模块: Rollout Routing Replay(R3)(Ma et al., 2025)、数据调度器、以及工具箱(Toolbox)与工具管理器(Tool Manager)的组合.</p>
<h4 id="4-6-1-tg-rollout-routing-replay-r3-wdxl">4.6.1 通过 Rollout Routing Replay (R3) 稳定训练</h4>
<p>MoE 模型在 Rollout 和训练之间因数值精度问题遭受不一致的专家路由(He and Lab, 2025; Yao et al., 2025). 我们提出 Rollout Routing Replay(R3)(Ma et al., 2025), 在训练 RL 时使用 Rollout 阶段相同的路由专家, 通过优化的数据类型和通信重叠使其开销可忽略. 对于多轮智能体训练, 我们在 Rollout 期间采用请求级前缀缓存(Request-level Prefix Cache). 该缓存存储先前轮次的 KV Cache 和 MoE 路由专家, 允许它们在相同请求的后续生成步骤中被复用. 与当前推理引擎中常用的 Radix Cache 不同, 我们的请求级前缀缓存避免了重新预填充(Re-prefilling)或跨请求输出缓存共享, 确保了路由专家的采样一致性.</p>
<h4 id="4-6-2-sjtdq">4.6.2 数据调度器</h4>
<p>对于 MiMo-V2-Flash, 我们扩展了 Seamless Rollout Engine(Xia et al., 2025)并实现了一个数据调度器, 以细粒度序列而非微批次(Micro-batches)进行无缝调度, 解决分布式 MoE 训练中的 GPU 空闲问题. 在动态采样中, 当序列返回进行奖励计算时, 我们参考历史通过率, 如有必要, 将新提示分配给负载均衡的 GPU. 我们集成部分 Rollout(Partial Rollout)(Fu et al., 2025; Kimi Team, 2025b)以将过长轨迹跨步骤划分, 同时限制陈旧性(Staleness)和每批次中部分样本的比例. 通过对部分 Rollout 采用陈旧性感知截断重要性采样, 我们在不牺牲模型质量的前提下显著加速了 RL 训练.</p>
<p>数据调度器支持数据源特定配置(样本配额、调度优先级、长度限制、温度)并按配置比率拟合通过率来接受样本. 基于优先级的调度在不同时间模式的数据源间重叠奖励计算和推理, 确保高 GPU 利用率.</p>
<h4 id="4-6-3-gjxygjglq">4.6.3 工具箱与工具管理器</h4>
<p>我们实现 Toolbox 和 Tool Manager 来解决 RL 智能体训练中的全局资源竞争和局部低效问题. 这些模块利用 Ray(Moritz et al., 2018)进行高效调度. Toolbox 充当集中式资源分配器, 对跨并发任务的工具实施资源配额和 QPS 限制. 它采用容错 Ray Actor Pool, 消除冷启动延迟. 与 Rollout 引擎集成, Tool Manager 与 Toolbox 协调, 通过环境预热(Environment Pre-warming)和序列级异步奖励计算来加速训练. 它通过超时恢复和实时监控维持训练稳定性. 通过将工具管理和 Rollout 工作流解耦, Toolbox 将任务特定逻辑与系统级策略隔离, 实现模块化可扩展性而不损害稳定性.</p>
<blockquote>
<p>译者注: RL 基础设施的三个模块各有针对性. R3 解决的是 MoE 特有的&quot;路由不一致&quot;问题——推理和训练使用不同的精度(FP8 vs BF16/FP32), 导致同一输入在不同阶段路由到不同专家, 这使得 PPO/MOPD 中&quot;用 Rollout 的 Log Prob 计算 Advantage&quot;的前提被打破. R3 的解决方案很工程化: 把 Rollout 的路由决策记录下来, 训练时重放. 数据调度器的 Partial Rollout 是另一个工程亮点: 智能体任务的长尾分布很严重(有的几步就完成, 有的需要上百步), 如果等所有轨迹完成再更新, 短轨迹的 GPU 会被长尾任务拖累. Partial Rollout 允许把长轨迹切成多段, 每段独立参与训练, 但引入了 Staleness(策略在训练时已经更新了几轮). 截断重要性采样就是用来校正这种 Staleness 的偏差的.</p>
</blockquote>
<hr>
<h2 id="5-mtp-js">5 MTP 加速</h2>
<h3 id="5-1-mtp-jscd">5.1 MTP 接受长度</h3>
<p>我们分析了模型预测不确定性(以 Next Token 交叉熵衡量)与 MTP 模块效率之间的关系. 如图 7 所示, 我们在不同基准上评估了 3 层 MTP 的平均接受长度(Average Acceptance Length), 范围从代码生成(如 WebDev, LiveCodeBench)到复杂推理任务(如 AIME25, MMLU Pro).</p>
<p>结果揭示了强烈的负相关: 较低熵的上下文(如 WebDev)允许显著更长的接受序列, 达到约 3.6 个 Token. 相反, 具有较高内在不确定性的任务(如 MMLU Pro)因预测分歧增加而展现出较短的接受长度. 这种行为被对数变换拟合(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>y</mi><mo>=</mo><mn>4</mn><mo stretchy="false">(</mo><mn>1</mn><mo>−</mo><msup><mn>0.58</mn><mrow><mn>0.58</mn><mi>x</mi></mrow></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">y = 4(1 - 0.58^{0.58x})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">4</span><span class="mopen">(</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord">0.5</span><span class="mord"><span class="mord">8</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">0.58</span><span class="mord mathnormal mtight">x</span></span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>)精确建模, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">R^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span> 达 0.995, 表明 Next Token 交叉熵是 MTP 吞吐量的首要决定因素.</p>
<blockquote>
<p>译者注: 这个 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>R</mi><mn>2</mn></msup><mo>=</mo><mn>0.995</mn></mrow><annotation encoding="application/x-tex">R^2 = 0.995</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.995</span></span></span></span> 的拟合曲线非常有价值, 它提供了一个简单但强大的工程预测工具: 给定一个任务的数据集, 只需测量其 Next Token 交叉熵, 就能预测 MTP 在该任务上的实际加速比. 对于低熵任务(如结构化代码生成), 3 层 MTP 可以实现 3.6 的接受长度; 对于高熵任务(如开放式问答), 接受长度可能只有 2.8-3.0. 这意味着 MTP 的加速效果不是&quot;一刀切&quot;的, 而是与任务特性强相关. 在实际部署中, 应该根据工作负载的熵分布来调优 MTP 层数——对于以代码和数学为主的推理服务, 3 层 MTP 收益最大; 对于通用对话服务, 可能需要权衡 MTP 的额外计算开销.</p>
</blockquote>
<h3 id="5-2-mtp-tljs">5.2 MTP 推理加速</h3>
<p>我们测量了 MiMo-V2-Flash 配备 3 层 MTP 在不同批次大小(每节点)和接受长度下的解码加速, 使用 16K 输入和 1K 输出长度. 表 10 的结果表明, MTP 在不增加额外硬件成本的情况下始终优于基线.</p>
<table>
<thead>
<tr>
<th>批次大小</th>
<th>无 MTP</th>
<th>接受长度 2.8</th>
<th>接受长度 3.0</th>
<th>接受长度 3.2</th>
<th>接受长度 3.4</th>
<th>接受长度 3.6</th>
<th>接受长度 3.8</th>
</tr>
</thead>
<tbody><tr>
<td>32</td>
<td>1.00x</td>
<td>1.86x</td>
<td>1.99x</td>
<td>2.12x</td>
<td>2.25x</td>
<td>2.39x</td>
<td>2.52x</td>
</tr>
<tr>
<td>48</td>
<td>1.00x</td>
<td>1.82x</td>
<td>1.95x</td>
<td>2.08x</td>
<td>2.21x</td>
<td>2.34x</td>
<td>2.47x</td>
</tr>
<tr>
<td>64</td>
<td>1.00x</td>
<td>1.97x</td>
<td>2.11x</td>
<td>2.25x</td>
<td>2.39x</td>
<td>2.53x</td>
<td>2.67x</td>
</tr>
<tr>
<td>96</td>
<td>1.00x</td>
<td>1.99x</td>
<td>2.13x</td>
<td>2.28x</td>
<td>2.42x</td>
<td>2.56x</td>
<td>2.70x</td>
</tr>
<tr>
<td>128</td>
<td>1.00x</td>
<td>1.82x</td>
<td>1.94x</td>
<td>2.07x</td>
<td>2.20x</td>
<td>2.33x</td>
<td>2.46x</td>
</tr>
</tbody></table>
<blockquote>
<p>表 10: MiMo-V2-Flash 配备 3 层 MTP 与无 MTP 的解码加速对比, 在不同批次大小和接受长度下, 使用 16K 输入和 1K 输出.</p>
</blockquote>
<p>值得注意的是, 加速比与接受长度呈线性关系. 在不同批次大小下, MTP 展现出不同的加速效果, 这取决于相应的计算和 I/O 需求以及 Kernel 效率. 在实践中, 研究人员和工程师应基于硬件 Roofline 模型同时调优批次大小和 MTP 层数, 以优化速度-成本权衡.</p>
<hr>
<h2 id="6-jl-jxxywlgz">6 结论、局限性与未来工作</h2>
<p>MiMo-V2-Flash 通过混合滑动窗口注意力架构、轻量级多 Token 预测和 MOPD 后训练范式, 实现了强大的推理和智能体能力以及快速的推理速度. 凭借这些优势, MiMo-V2-Flash 能够与更大的开源权重模型(如 DeepSeek-V3.2 和 Kimi-K2)竞争. 然而, 与最强的闭源权重模型之间仍存在明显差距, 我们计划通过扩展模型规模和训练计算来缩小这一差距. 此外, 我们当前的架构探索仍处于初步阶段, 对设计权衡的分析有限. 未来工作将聚焦于设计更稳健、更高效的面向智能体的模型架构. 此外, 我们计划扩展 MOPD 中教师和学生的迭代协同进化计算量, 以充分释放其潜力.</p>
<blockquote>
<p>译者注: 作者的自省是诚恳的. 309B 总参数/15B 激活参数的规模确实让 MiMo-V2-Flash 在知识密集型任务上受限(SimpleQA 20.6% vs Kimi-K2-Base 35.3%). 与 Gemini-3.0 Pro 和 GPT-5-High 等闭源模型的差距(如 HLE 22.1% vs 37.5%/26.3%)也表明, 参数规模仍然是能力天花板的重要决定因素. 但 MiMo-V2-Flash 的价值不在于&quot;全面碾压&quot;, 而在于证明了: 通过架构创新(Hybrid SWA + Lightweight MTP)和后训练创新(MOPD), 可以用 1/2 到 1/3 的参数量达到相近的推理和智能体性能. 这为资源受限的团队提供了一条可行的路径.</p>
</blockquote>
<hr>
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
<td>MoE</td>
<td>混合专家</td>
<td>引言</td>
<td>将模型划分为多个专家子网络, 每 Token 仅激活部分专家</td>
</tr>
<tr>
<td>SWA</td>
<td>滑动窗口注意力</td>
<td>2.1</td>
<td>将注意力限制在局部窗口内, 降低长序列计算复杂度</td>
</tr>
<tr>
<td>GA</td>
<td>全局注意力</td>
<td>2.1</td>
<td>标准自注意力, 每个 Token  attend 到整个序列</td>
</tr>
<tr>
<td>MTP</td>
<td>多 Token 预测</td>
<td>2.3</td>
<td>一次预测多个未来 Token, 用于训练和投机解码加速</td>
</tr>
<tr>
<td>MOPD</td>
<td>多教师在线策略蒸馏</td>
<td>4.1</td>
<td>学生从多个领域教师接收 Token 级奖励的在线策略蒸馏框架</td>
</tr>
<tr>
<td>SFT</td>
<td>监督微调</td>
<td>4.1</td>
<td>在指令-响应对上微调以激活指令遵循能力</td>
</tr>
<tr>
<td>RL</td>
<td>强化学习</td>
<td>4.1</td>
<td>通过环境反馈优化模型策略</td>
</tr>
<tr>
<td>ORM</td>
<td>结果奖励模型</td>
<td>4.1</td>
<td>评估最终输出正确性的奖励模型</td>
</tr>
<tr>
<td>GQA</td>
<td>分组查询注意力</td>
<td>2.1</td>
<td>Query 头分组共享 KV 头, 平衡质量和效率</td>
</tr>
<tr>
<td>RoPE</td>
<td>旋转位置编码</td>
<td>2.1</td>
<td>通过旋转矩阵编码位置信息的位置编码方案</td>
</tr>
<tr>
<td>R3</td>
<td>Rollout 路由重放</td>
<td>4.6.1</td>
<td>在训练时重放 Rollout 阶段路由决策以保持 MoE 一致性</td>
</tr>
<tr>
<td>Sink Bias</td>
<td>注意力 Sink 偏置</td>
<td>2.2</td>
<td>在 Softmax 分母添加可学习常数, 提供虚拟注意力汇聚点</td>
</tr>
<tr>
<td>Exposure Bias</td>
<td>暴露偏差</td>
<td>4.1</td>
<td>训练时看到教师分布、推理时看到自身分布的不匹配问题</td>
</tr>
<tr>
<td>FP8</td>
<td>8 位浮点</td>
<td>2.1</td>
<td>一种低精度数值格式, H100 Tensor Core 原生支持</td>
</tr>
</tbody></table>
<h3 id="b-hxgssy">B. 核心公式索引</h3>
<table>
<thead>
<tr>
<th>编号</th>
<th>公式</th>
<th>所在章节</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>(1)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>e</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><msub><mi>q</mi><mi>i</mi></msub><msubsup><mi>k</mi><mi>j</mi><mi mathvariant="normal">⊤</mi></msubsup></mrow><msqrt><msub><mi>d</mi><mi>h</mi></msub></msqrt></mfrac></mrow><annotation encoding="application/x-tex">e_{ij} = \\frac{q_i k_j^\\top}{\\sqrt{d_h}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.7943em;vertical-align:-0.538em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2563em;"><span style="top:-2.5864em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord sqrt mtight"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8622em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mtight" style="padding-left:0.833em;"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">h</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8222em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail mtight" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1778em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.6074em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.927em;"><span style="top:-2.214em;margin-left:-0.0315em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight">⊤</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4249em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.538em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></td>
<td>2.2</td>
<td>注意力 Logit 计算</td>
</tr>
<tr>
<td>(2)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>α</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>=</mo><mfrac><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><mo>−</mo><msub><mi>m</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><mrow><msub><mo>∑</mo><mi>k</mi></msub><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mi>e</mi><mrow><mi>i</mi><mi>k</mi></mrow></msub><mo>−</mo><msub><mi>m</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo>+</mo><mi>η</mi></mrow></mfrac></mrow><annotation encoding="application/x-tex">\\alpha_{ij} = \\frac{\\exp(e_{ij} - m_i)}{\\sum_{k} \\exp(e_{ik} - m_i) + \\eta}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.6023em;vertical-align:-0.57em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0323em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mop op-symbol small-op mtight" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1746em;"><span style="top:-2.1786em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3214em;"><span></span></span></span></span></span></span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mop mtight"><span class="mtight">e</span><span class="mtight">x</span><span class="mtight">p</span></span><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">ik</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span><span class="mbin mtight">−</span><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">η</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.5073em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">e</span><span class="mtight">x</span><span class="mtight">p</span></span><span class="mopen mtight">(</span><span class="mord mtight"><span class="mord mathnormal mtight">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mbin mtight">−</span><span class="mord mtight"><span class="mord mathnormal mtight">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.57em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></td>
<td>2.2</td>
<td>带 Sink Bias 的注意力权重</td>
</tr>
<tr>
<td>(3)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>m</mi><mi>i</mi></msub><mo>=</mo><mi>max</mi><mo>⁡</mo><mo stretchy="false">(</mo><msub><mrow><mi>max</mi><mo>⁡</mo></mrow><mrow><mi>k</mi><mo>≤</mo><mi>j</mi></mrow></msub><msub><mi>e</mi><mrow><mi>i</mi><mi>k</mi></mrow></msub><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">m_i = \\max(\\max_{k \\leq j} e_{ik}, 0)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mop">max</span><span class="mopen">(</span><span class="mop"><span class="mop">max</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mrel mtight">≤</span><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">ik</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">)</span></span></span></span></td>
<td>2.2</td>
<td>数值稳定的最大值偏移</td>
</tr>
<tr>
<td>(4)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>o</mi><mi>i</mi></msub><mo>=</mo><msub><mo>∑</mo><mi>j</mi></msub><msub><mi>α</mi><mrow><mi>i</mi><mi>j</mi></mrow></msub><msub><mi>v</mi><mi>j</mi></msub></mrow><annotation encoding="application/x-tex">o_i = \\sum_{j} \\alpha_{ij} v_j</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">o</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1858em;vertical-align:-0.4358em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.162em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4358em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0037em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">ij</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">v</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></td>
<td>2.2</td>
<td>注意力输出加权求和</td>
</tr>
<tr>
<td>(5)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>reverse-KL</mtext></msub><mo>=</mo><mo>−</mo><mi mathvariant="double-struck">E</mi><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><msub><mi>π</mi><mtext>domain</mtext></msub><msub><mi>π</mi><mi>θ</mi></msub></mfrac><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{reverse-KL}} = -\\mathbb{E}\\left[\\log \\frac{\\pi_{\\text{domain}}}{\\pi_\\theta}\\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reverse-KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord">−</span><span class="mord mathbb">E</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7173em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4159em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4509em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">]</span></span></span></span></span></span></td>
<td>4.4</td>
<td>Reverse KL 散度损失</td>
</tr>
<tr>
<td>(6)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="normal">∇</mi><mi>θ</mi></msub><msub><mi mathvariant="script">L</mi><mtext>reverse-KL</mtext></msub></mrow><annotation encoding="application/x-tex">\\nabla_\\theta \\mathcal{L}_{\\text{reverse-KL}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord">∇</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">reverse-KL</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的展开式</td>
<td>4.4</td>
<td>Reverse KL 梯度表达式</td>
</tr>
<tr>
<td>(7)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="script">L</mi><mtext>MOPD</mtext></msub><mo>=</mo><mo>−</mo><mi mathvariant="double-struck">E</mi><mrow><mo fence="true">[</mo><mfrac><mn>1</mn><mrow><mi mathvariant="normal">∣</mi><mi>y</mi><mi mathvariant="normal">∣</mi></mrow></mfrac><msub><mo>∑</mo><mi>t</mi></msub><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>MOPD</mtext></msubsup><mi>log</mi><mo>⁡</mo><msub><mi>π</mi><mi>θ</mi></msub><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{\\text{MOPD}} = -\\mathbb{E}\\left[\\frac{1}{|y|}\\sum_{t} \\hat{A}_{t}^{\\text{MOPD}} \\log \\pi_\\theta\\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord">−</span><span class="mord mathbb">E</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">[</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">∣</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="mord mtight">∣</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.52em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop"><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1308em;"><span style="top:-2.4003em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2997em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">]</span></span></span></span></span></span></td>
<td>4.4</td>
<td>MOPD 替代损失</td>
</tr>
<tr>
<td>(8)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>MOPD</mtext></msubsup><mo>=</mo><mtext>sg</mtext><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mfrac><msub><mi>π</mi><mtext>domain</mtext></msub><msub><mi>π</mi><mi>θ</mi></msub></mfrac><mo fence="true">]</mo></mrow><mo>⋅</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mtext>ratio</mtext><mo separator="true">,</mo><mtext>clip</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">\\hat{A}_{t}^{\\text{MOPD}} = \\text{sg}\\left[\\log \\frac{\\pi_{\\text{domain}}}{\\pi_\\theta}\\right] \\cdot \\min(\\text{ratio}, \\text{clip})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="mord text"><span class="mord">sg</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7173em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4159em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">domain</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4509em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">]</span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord text"><span class="mord">ratio</span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord text"><span class="mord">clip</span></span><span class="mclose">)</span></span></span></span></td>
<td>4.4</td>
<td>MOPD 优势函数(含重要性采样裁剪)</td>
</tr>
<tr>
<td>(9)</td>
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>final</mtext></msubsup><mo>=</mo><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>MOPD</mtext></msubsup><mo>+</mo><msubsup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mi>t</mi><mtext>ORM</mtext></msubsup></mrow><annotation encoding="application/x-tex">\\hat{A}_{t}^{\\text{final}} = \\hat{A}_{t}^{\\text{MOPD}} + \\hat{A}_{t}^{\\text{ORM}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">final</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">MOPD</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1938em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">ORM</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span></span></span></span></td>
<td>4.4</td>
<td>最终优势 = MOPD 优势 + ORM 优势</td>
</tr>
</tbody></table>
<h3 id="c-gjsjsc">C. 关键数据速查</h3>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>总参数量</td>
<td>309B</td>
</tr>
<tr>
<td>激活参数量</td>
<td>15B</td>
</tr>
<tr>
<td>Transformer 层数</td>
<td>48 (39 SWA + 9 GA)</td>
</tr>
<tr>
<td>MoE 专家总数/激活数</td>
<td>256 / 8</td>
</tr>
<tr>
<td>滑动窗口大小</td>
<td>128</td>
</tr>
<tr>
<td>混合比例 (SWA:GA)</td>
<td>5:1</td>
</tr>
<tr>
<td>预训练数据量</td>
<td>27T tokens</td>
</tr>
<tr>
<td>上下文窗口 (原生/扩展)</td>
<td>32K / 256K</td>
</tr>
<tr>
<td>MTP Block 参数量</td>
<td>0.33B</td>
</tr>
<tr>
<td>MTP 接受长度 (WebDev)</td>
<td>~3.6</td>
</tr>
<tr>
<td>MTP 推理加速 (最佳配置)</td>
<td>2.70x</td>
</tr>
<tr>
<td>SWE-Bench Verified</td>
<td>73.4%</td>
</tr>
<tr>
<td>SWE-Bench Multilingual</td>
<td>71.7%</td>
</tr>
<tr>
<td>AIME 2025</td>
<td>94.1%</td>
</tr>
<tr>
<td>LiveCodeBench-v6</td>
<td>85.1%</td>
</tr>
<tr>
<td>BrowseComp (原生/带上下文管理)</td>
<td>45.4% / 58.3%</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-yy-introduction","text":"1 引言 (Introduction)"},{"level":2,"id":"2-mimo-v2-flash-mxjg","text":"2 MiMo-V2-Flash 模型架构"},{"level":3,"id":"2-1-ztjg","text":"2.1 整体架构"},{"level":3,"id":"2-2-hhhdckzyljg","text":"2.2 混合滑动窗口注意力架构"},{"level":4,"id":"2-2-1-mxjgsy","text":"2.2.1 模型架构实验"},{"level":4,"id":"2-2-2-zjytl","text":"2.2.2 总结与讨论"},{"level":3,"id":"2-3-qljd-token-yc-mtp","text":"2.3 轻量级多 Token 预测 (MTP)"},{"level":4,"id":"2-3-1-sy-mtp-ddj","text":"2.3.1 使用 MTP 的动机"},{"level":4,"id":"2-3-2-mimo-v2-flash-zdqlj-mtp-sj","text":"2.3.2 MiMo-V2-Flash 中的轻量级 MTP 设计"},{"level":2,"id":"3-yxl-pre-training","text":"3 预训练 (Pre-Training)"},{"level":3,"id":"3-1-sjtdq","text":"3.1 数据调度器"},{"level":3,"id":"3-2-ccs","text":"3.2 超参数"},{"level":3,"id":"3-3-pg","text":"3.3 评估"},{"level":4,"id":"3-3-1-pgsz","text":"3.3.1 评估设置"},{"level":4,"id":"3-3-2-pgjg","text":"3.3.2 评估结果"},{"level":2,"id":"4-hxl-post-training","text":"4 后训练 (Post-Training)"},{"level":3,"id":"4-1-djszxclzl-mopd-yzxdhxlfs","text":"4.1 多教师在线策略蒸馏 (MOPD): 一种新的后训练范式"},{"level":3,"id":"4-2-jdwt-sft","text":"4.2 监督微调 (SFT)"},{"level":3,"id":"4-3-gmhqhxx-rl","text":"4.3 规模化强化学习 (RL)"},{"level":4,"id":"4-3-1-fznt-rl-xl","text":"4.3.1 非智能体 RL 训练"},{"level":4,"id":"4-3-2-znt-rl-xl","text":"4.3.2 智能体 RL 训练"},{"level":3,"id":"4-4-mopd-djsxsh","text":"4.4 MOPD 的技术形式化"},{"level":3,"id":"4-5-pg","text":"4.5 评估"},{"level":4,"id":"4-5-1-pgsz","text":"4.5.1 评估设置"},{"level":4,"id":"4-5-2-pgjg","text":"4.5.2 评估结果"},{"level":3,"id":"4-6-rl-jcss","text":"4.6 RL 基础设施"},{"level":4,"id":"4-6-1-tg-rollout-routing-replay-r3-wdxl","text":"4.6.1 通过 Rollout Routing Replay (R3) 稳定训练"},{"level":4,"id":"4-6-2-sjtdq","text":"4.6.2 数据调度器"},{"level":4,"id":"4-6-3-gjxygjglq","text":"4.6.3 工具箱与工具管理器"},{"level":2,"id":"5-mtp-js","text":"5 MTP 加速"},{"level":3,"id":"5-1-mtp-jscd","text":"5.1 MTP 接受长度"},{"level":3,"id":"5-2-mtp-tljs","text":"5.2 MTP 推理加速"},{"level":2,"id":"6-jl-jxxywlgz","text":"6 结论、局限性与未来工作"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgssy","text":"B. 核心公式索引"},{"level":3,"id":"c-gjsjsc","text":"C. 关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.9-mimo/02-mimo-v2-flash/01-mimo-v2-flash-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.9-mimo/02-mimo-v2-flash/01-mimo-v2-flash-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiMo-V2-Flash 技术报告精译</h1>
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
