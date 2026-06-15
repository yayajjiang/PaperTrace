"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi K2.5 推理架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">返回 14.5-Kimi 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Kimi K2.5: Visual Agentic Intelligence (arXiv:2602.02276)
发布日期: 2026-01-27
发布机构: Moonshot AI, Kimi Team
开源协议: 后训练 Checkpoint 开源</p>
</blockquote>
<hr>
<h2 id="1-sjdj-c-wbtl-d-ysdmtznt">1. 设计动机:从「文本推理」到「原生多模态智能体」</h2>
<p>Kimi K2.5 的核心定位并非 K2 的「多模态升级版」,而是一个根本性的范式转移:从「先训文本、后加视觉」的适配思路,转向「文本与视觉从头共同演化」的原生多模态智能体.这一转移的驱动力来自 K2.5 团队的一项反直觉发现:在固定视觉-文本 token 总预算下,Early Fusion 配合低视觉比例(约 10%)全面优于 Late Fusion 配合高视觉比例(50% 乃至 80%).</p>
<p>传统多模态预训练的主流做法(如 LLaVA、Qwen-VL 的早期版本)通常遵循「后期补课」策略:先用大规模文本数据预训练一个强大的语言模型,再在训练后期以高比例视觉数据注入视觉能力.然而,K2.5 的消融实验表明,Late Fusion 在注入视觉数据时会引发显著的模态域迁移冲击——文本能力先显著下降再逐渐恢复,形成典型的「dip-and-recover」曲线.相比之下,Early Fusion 从预训练第一天就以约 10% 的比例混入视觉数据,训练曲线保持平稳,两种模态同步增长而非此消彼长.</p>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="left">视觉注入时机</th>
<th align="center">视觉比例</th>
<th align="center">视觉知识</th>
<th align="center">视觉推理</th>
<th align="center">文本知识</th>
<th align="center">文本推理</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Early Fusion</td>
<td align="left">从头</td>
<td align="center">10%</td>
<td align="center">25.8</td>
<td align="center">43.8</td>
<td align="center">45.5</td>
<td align="center">58.5</td>
</tr>
<tr>
<td align="left">Mid Fusion</td>
<td align="left">中期</td>
<td align="center">50%</td>
<td align="center">25.0</td>
<td align="center">40.7</td>
<td align="center">43.9</td>
<td align="center">58.6</td>
</tr>
<tr>
<td align="left">Late Fusion</td>
<td align="left">末期</td>
<td align="center">80%</td>
<td align="center">24.2</td>
<td align="center">39.0</td>
<td align="center">43.1</td>
<td align="center">57.8</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: 表中的实验有一个关键约束——三种策略消耗的视觉 token 总量相同.Late Fusion 在训练后 80% 才注入视觉数据,为了消化相同总量的视觉 token,必须将视觉比例提升到 50%;而 Early Fusion 从头就混入视觉数据,10% 的比例即可覆盖相同的总量.这意味着该结论的前提是「固定视觉 token 总预算」.如果视觉数据预算不受限,Late Fusion 配合更高比例是否可能取得更好结果,论文未予回答.对于拥有充足计算资源的团队,这一开放问题值得进一步探索.</p>
</blockquote>
<p>这一发现揭示了一个深层原则:多模态能力的获取不是「后期追加视觉课程」,而是「两种模态从头共同演化」.它直接挑战了整个多模态预训练领域的传统认知,对后续模型的数据配比策略具有指导意义.</p>
<hr>
<h2 id="2-hxjg-szjtydmtxt">2. 核心架构:三组件统一多模态系统</h2>
<p>Kimi K2.5 的多模态架构由三个组件组成,遵循 Kimi-VL 确立的设计原则,但在视觉-时序统一性上做了关键升级.</p>
<h3 id="2-1-moon-vi-t-3d-txyspdjjty">2.1 MoonViT-3D:图像与视频的极简统一</h3>
<p>传统视频理解模型通常使用独立的视频 Encoder(如 TimeSformer、Video Swin Transformer),导致图像和视频的知识无法共享.MoonViT-3D 的解决方案极其简洁:</p>
<ul>
<li><strong>图像处理</strong>: 单张图像被划分为 patches,展平并拼接成 1D 序列,采用 NaViT packing 策略支持可变分辨率输入</li>
<li><strong>视频处理</strong>: 最多四个连续帧被视为一个时空体,patches 联合展平并打包成单个 1D 序列</li>
<li><strong>参数共享</strong>: 图像和视频使用完全相同的注意力机制,无需专用视频模块</li>
<li><strong>时序压缩</strong>: 轻量级时间池化在每个时间块内聚合 patches,产生 4 倍时间压缩</li>
</ul>
<p>这种设计的工程洞察在于:将视频视为「多帧图像」——4 个连续帧的 patches 被打包进同一个 1D 序列,用同一个 Transformer 处理,最后通过时间池化压缩 4 倍.优势在于图像预训练的权重直接适用于视频,无需微调;架构简单,维护成本低;时间池化是可学习的,模型可以自适应地决定哪些时间信息需要保留.代价是对于需要精细时间建模的任务(如毫秒级动作识别),简单的 patch-level 平均可能丢失关键信息.但从评估结果来看(VideoMMMU 86.6%、LVBench 75.9%),这种权衡在实践中是有效的.</p>
<h3 id="2-2-mlp-projector-y-moe-yymx">2.2 MLP Projector 与 MoE 语言模型</h3>
<p>视觉特征经过 MLP projector 投影到语言模型的 token 空间后,输入 Kimi K2 MoE 语言模型.该基座模型规格如下:</p>
<table>
<thead>
<tr>
<th align="left">维度</th>
<th align="left">规格</th>
</tr>
</thead>
<tbody><tr>
<td align="left">总参数</td>
<td align="left">1.04T</td>
</tr>
<tr>
<td align="left">激活参数</td>
<td align="left">32B / token</td>
</tr>
<tr>
<td align="left">专家数</td>
<td align="left">384(每 token 激活 8 个 + 1 共享专家)</td>
</tr>
<tr>
<td align="left">稀疏比</td>
<td align="left">48x</td>
</tr>
<tr>
<td align="left">上下文窗口</td>
<td align="left">256K tokens</td>
</tr>
<tr>
<td align="left">优化器</td>
<td align="left">MuonClip(带 QK-Clip)</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: 1T 总参数 / 32B 激活参数的 MoE 配置在 2026 年已成为旗舰开源模型的标准配方.384 个专家中选 8 个 + 1 共享的设计,与 DeepSeek-V3 的 256 专家 + 1 共享、GLM-5 的 256 专家 + 1 共享属于同一技术谱系,但专家总数更多.共享专家的作用是提供跨任务的通用知识,维持模型输出的一致性.</p>
</blockquote>
<h3 id="2-3-decoupled-encoder-process-dep-xljcsscx">2.3 Decoupled Encoder Process(DEP):训练基础设施创新</h3>
<p>传统多模态训练中,视觉 Encoder 和文本嵌入共置于流水线并行(PP)的第一阶段,导致 Stage-0 的负载严重不均衡——有图像的 batch 与纯文本 batch 在计算量和内存使用上差异巨大.DEP 将视觉 Encoder 从 PP 中「剥离」,形成三阶段流程:</p>
<ol>
<li><strong>均衡视觉前向</strong>: 在所有 GPU 上复制视觉 Encoder,基于负载指标(如图像或 patch 数量)均匀分布计算</li>
<li><strong>主干训练</strong>: 用标准 PP 处理文本主干,复用 K2 的优化策略</li>
<li><strong>视觉重计算与反向</strong>: 重新计算视觉 Encoder 前向传播,计算其梯度</li>
</ol>
<p>DEP 实现 90% 的多模态训练效率(相对于纯文本训练),意味着 15T token 的联合预训练几乎不增加额外开销.这对于大规模多模态训练具有重大工程价值.</p>
<hr>
<h2 id="3-gjcx-hxljddfzjfx">3. 关键创新:后训练阶段的反直觉发现</h2>
<h3 id="3-1-zero-vision-sft-cwbjhsjnl">3.1 Zero-Vision SFT:纯文本激活视觉能力</h3>
<p>K2.5 后训练中最反直觉的发现是:仅用文本 SFT 数据即可激活视觉推理和工具使用.传统方法通过人工标注的视觉轨迹来教模型「看懂图像并操作」,但 K2.5 证明,纯文本 SFT(所有图像操作通过 IPython 代码代理)效果更好.</p>
<p>其机制可能是:联合预训练已建立视觉-文本的强对齐,代码作为桥梁提供精确的操作语义——<code>cv2.inRange</code> 就是精确的颜色过滤,不存在歧义.纯文本 SFT 数据更丰富多样,避免了人工视觉数据的风格过拟合.这也解释了为什么「文本-视觉 SFT」(加入人工视觉轨迹)反而更差:有限的人工视觉数据不仅多样性不足,还可能导致模型过拟合于特定的标注风格.</p>
<blockquote>
<p><strong>译者注</strong>: Zero-Vision SFT 的有效性高度依赖于「前期联合预训练足够强」的前提.对于预训练阶段视觉数据不足或对齐质量较差的模型,Zero-Vision SFT 可能无法生效.这个结论的普适性需要谨慎对待——它可能只适用于像 K2.5 这样经历了 15T token 联合预训练的强基座模型.</p>
</blockquote>
<h3 id="3-2-lhdmtqhxx-kmtsxzq">3.2 联合多模态强化学习:跨模态双向增强</h3>
<p>Zero-Vision SFT 之后,模型在三个视觉领域进行基于结果的 RL:视觉定位与计数、图表与文档理解、视觉关键型 STEM 问题.令人惊讶的是,视觉 RL 不仅提升了视觉任务,还提升了纯文本基准:</p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">视觉 RL 之前</th>
<th align="center">视觉 RL 之后</th>
<th align="center">提升</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU-Pro</td>
<td align="center">84.7</td>
<td align="center">86.4</td>
<td align="center">+1.7</td>
</tr>
<tr>
<td align="left">GPQA-Diamond</td>
<td align="center">84.3</td>
<td align="center">86.4</td>
<td align="center">+2.1</td>
</tr>
<tr>
<td align="left">LongBench v2</td>
<td align="center">56.7</td>
<td align="center">58.9</td>
<td align="center">+2.2</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>译者注</strong>: 这一现象在 RL 文献中极少被报道.可能的解释是:视觉任务强迫模型学会「仔细检查输入、提取关键信息、结构化推理」的模式,而这些模式恰好也是文本推理任务所需要的.这与 K2.5 按能力维度(知识/推理/代码/智能体)而非输入模态来组织 RL 领域的设计选择一致——同一能力维度下的文本和视觉任务共享 reward 信号,最大化了跨模态迁移.</p>
</blockquote>
<h3 id="3-3-agent-swarm-bhzntbp">3.3 Agent Swarm:并行智能体编排</h3>
<p>现有智能体系统的主要瓶颈在于顺序执行:推理和工具调用步骤线性展开,延迟随任务复杂度线性增长.K2.5 引入 Agent Swarm 和 PARL(Parallel Agent Reinforcement Learning)范式,通过动态任务分解、子智能体实例化和并行子任务调度来克服这一瓶颈.</p>
<p>PARL 采用解耦架构:编排器(可训练)负责动态任务分解和并行调度,子智能体(冻结,从固定中间策略 Checkpoint 实例化)执行具体子任务.这种设计刻意避免端到端协同优化,以规避两个根本性挑战:信用分配模糊(最终答案正确不能保证每个子智能体都执行完美)和训练不稳定性(多智能体联合优化的高维策略空间难以收敛).</p>
<p>PARL 的奖励设计包含三个组件:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mrow><mi>P</mi><mi>A</mi><mi>R</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>λ</mi><mn>1</mn></msub><mo>⋅</mo><msub><mi>r</mi><mrow><mi>p</mi><mi>a</mi><mi>r</mi><mi>a</mi><mi>l</mi><mi>l</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>+</mo><msub><mi>λ</mi><mn>2</mn></msub><mo>⋅</mo><msub><mi>r</mi><mrow><mi>f</mi><mi>i</mi><mi>n</mi><mi>i</mi><mi>s</mi><mi>h</mi></mrow></msub><mo>+</mo><msub><mi>r</mi><mrow><mi>p</mi><mi>e</mi><mi>r</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_{PARL}(x, y) = \\lambda_1 \\cdot r_{parallel} + \\lambda_2 \\cdot r_{finish} + r_{perf}(x, y)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight">A</span><span class="mord mathnormal mtight" style="margin-right:0.0077em;">R</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">ini</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>p</mi><mi>e</mi><mi>r</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{perf}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 评估任务完成质量,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>p</mi><mi>a</mi><mi>r</mi><mi>a</mi><mi>l</mi><mi>l</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{parallel}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 防止编排器默认回退到单智能体执行(序列崩溃),<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>f</mi><mi>i</mi><mi>n</mi><mi>i</mi><mi>s</mi><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{finish}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">ini</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 防止编排器生成大量无意义子智能体(虚假并行).超参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\lambda_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\lambda_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 在训练过程中退火至零,确保最终策略优化主要目标.</p>
<p>为衡量并行智能体的计算时间成本,K2.5 引入 Critical Steps 指标:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>CriticalSteps</mtext><mo>=</mo><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mi>T</mi></munderover><msubsup><mi>S</mi><mrow><mi>m</mi><mi>a</mi><mi>i</mi><mi>n</mi></mrow><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup><mo>+</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>i</mi></munder><msubsup><mi>S</mi><mrow><mi>s</mi><mi>u</mi><mi>b</mi><mo separator="true">,</mo><mi>i</mi></mrow><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup></mrow><annotation encoding="application/x-tex">\\text{CriticalSteps} = \\sum_{t=1}^{T} S_{main}^{(t)} + \\max_i S_{sub,i}^{(t)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">CriticalSteps</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4231em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">main</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.7725em;vertical-align:-0.7277em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.3723em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7277em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.3987em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">b</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4374em;"><span></span></span></span></span></span></span></span></span></span></span><p>这与计算图中的关键路径长度一致,迫使编排器关注「瓶颈子任务」——那些执行时间最长的分支.Agent Swarm 在 WideSearch 基准上,相较单智能体基线将延迟降低 3-4.5 倍,同时将 Item-level F1 从 72.8% 提升至 79.0%.</p>
<h3 id="3-4-toggle-xsysddjtyh">3.4 Toggle:效率与深度的交替优化</h3>
<p>K2.5 提出 Toggle,一种在推理时扩展和预算约束优化之间交替的训练启发式,解决的核心矛盾是:「预算约束」可以让模型学会简洁推理,但「过度约束」会导致 length-overfitting——模型在测试时无法利用额外的 token 预算来解决更困难的问题.</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>r</mi><mo>~</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>⋅</mo><mi mathvariant="double-struck">I</mi><mrow><mo fence="true">[</mo><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo>≥</mo><mi>τ</mi><mtext> 或 </mtext><mi mathvariant="normal">∣</mi><mi>y</mi><mi mathvariant="normal">∣</mi><mo>≤</mo><mtext>budget</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo fence="true">]</mo></mrow></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>Phase0</mtext></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>Phase1</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">\\tilde{r}(x, y) = \\begin{cases}
r(x, y) \\cdot \\mathbb{I}\\left[\\bar{r} \\geq \\tau \\text{ 或 } |y| \\leq \\text{budget}(x)\\right] &amp; \\text{Phase0} \\\\
r(x, y) &amp; \\text{Phase1}
\\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6679em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3.35em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">~</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathbb">I</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">[</span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">或</span><span class="mord"> </span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord text"><span class="mord">budget</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">]</span></span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">Phase0</span></span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">Phase1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><ul>
<li><strong>Phase0(预算限制)</strong>: 模型被训练在任务相关的 token 预算内解决问题.约束有条件应用:仅当平均准确率超过阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 时才强制执行</li>
<li><strong>Phase1(标准扩展)</strong>: 模型生成响应直至最大 token 限制,鼓励利用计算获得更好的推理</li>
</ul>
<p>问题相关的预算从正确响应子集的 token 长度的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 百分位数估计.Toggle 平均减少输出 token 25-30%,对性能影响可忽略.</p>
<blockquote>
<p><strong>译者注</strong>: Toggle 暗示了一个更一般的原则:对于测试时扩展模型,「效率」和「深度」不是互斥的,而是可以通过交替训练同时获得的.但两个阶段的交替频率(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span>)和预算阈值(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span>)是关键超参,论文未披露具体值,这是复现时的一个关键未知量.</p>
</blockquote>
<hr>
<h2 id="4-hxdb-dmt-agent-d-sota-jzgj">4. 横向对比:多模态 Agent 的 SOTA 竞争格局</h2>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">Kimi K2.5</th>
<th align="center">GPT-5.2(xhigh)</th>
<th align="center">Claude Opus 4.5</th>
<th align="center">Gemini 3 Pro</th>
<th align="center">DeepSeek-V3.2</th>
</tr>
</thead>
<tbody><tr>
<td align="left">AIME 2025</td>
<td align="center"><strong>96.1</strong></td>
<td align="center">100</td>
<td align="center">92.8</td>
<td align="center">95.0</td>
<td align="center">93.1</td>
</tr>
<tr>
<td align="left">HMMT 2025(Feb)</td>
<td align="center"><strong>95.4</strong></td>
<td align="center">99.4</td>
<td align="center">92.9</td>
<td align="center">97.3</td>
<td align="center">92.5</td>
</tr>
<tr>
<td align="left">IMO-AnswerBench</td>
<td align="center"><strong>81.8</strong></td>
<td align="center">86.3</td>
<td align="center">78.5</td>
<td align="center">83.1</td>
<td align="center">78.3</td>
</tr>
<tr>
<td align="left">GPQA-Diamond</td>
<td align="center">87.6</td>
<td align="center"><strong>92.4</strong></td>
<td align="center">87.0</td>
<td align="center">91.9</td>
<td align="center">82.4</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">87.1</td>
<td align="center">86.7</td>
<td align="center">89.3</td>
<td align="center"><strong>90.1</strong></td>
<td align="center">85.0</td>
</tr>
<tr>
<td align="left">LiveCodeBench v6</td>
<td align="center">85.0</td>
<td align="center">—</td>
<td align="center">82.2</td>
<td align="center">87.4</td>
<td align="center">83.3</td>
</tr>
<tr>
<td align="left">SWE-Bench Verified</td>
<td align="center">76.8</td>
<td align="center">80.0</td>
<td align="center"><strong>80.9</strong></td>
<td align="center">76.2</td>
<td align="center">73.1</td>
</tr>
<tr>
<td align="left">BrowseComp</td>
<td align="center"><strong>60.6</strong></td>
<td align="center">65.8</td>
<td align="center">37.0</td>
<td align="center">37.8</td>
<td align="center">59.2</td>
</tr>
<tr>
<td align="left">BrowseComp(Swarm)</td>
<td align="center"><strong>78.4</strong></td>
<td align="center">77.9(Pro)</td>
<td align="center">—</td>
<td align="center">—</td>
<td align="center">—</td>
</tr>
<tr>
<td align="left">MMMU-Pro</td>
<td align="center"><strong>78.5</strong></td>
<td align="center">79.5</td>
<td align="center">74.0</td>
<td align="center"><strong>81.0</strong></td>
<td align="center">—</td>
</tr>
</tbody></table>
<p>K2.5 在严格 STEM 基准(AIME、HMMT、IMO)上与顶级闭源模型取得竞争性性能,在 BrowseComp 上大幅领先 Claude Opus 4.5 和 Gemini 3 Pro.Agent Swarm 在 BrowseComp 上带来 17.8% 的绝对提升(60.6% → 78.4%),甚至超越 GPT-5.2 Pro(77.9%).</p>
<p>但在 SWE-Bench Verified 上略低于 Claude Opus 4.5(76.8% vs 80.9%),在 MMLU-Pro 上低于 Gemini 3 Pro(87.1% vs 90.1%).这表明 K2.5 的优势领域在于多模态推理和智能体任务,而非纯知识问答.</p>
<hr>
<h2 id="5-jxxyxxlyxz">5. 局限性与信息来源限制</h2>
<p><strong>纯推理仍有差距.</strong> K2.5 在 GPQA-Diamond(87.6% vs GPT-5.2 的 92.4%)和 MMLU-Pro(87.1% vs Gemini 3 Pro 的 90.1%)上落后于部分闭源模型.对于需要高单轮知识推理准确率的任务,这一差距是相关的.</p>
<p><strong>Token 消耗较高.</strong> 表 5 显示 K2.5 的平均输出 token 数(如 AIME 2025 的 25k)高于 Gemini 3 Pro(15k)和 DeepSeek-V3.2(16k).虽然 Toggle 已减少 25-30% 的输出长度,但 K2.5 的推理风格仍偏「 verbose」.</p>
<p><strong>第一方评估数据的可信度边界.</strong> 大多数基准分数由 Moonshot 自行报告,独立第三方的复现结果仍然有限.BrowseComp 的 Swarm 模式提升(+17.8%)是唯一公开报告的、能直接隔离 Swarm 架构收益的基准.对于其他基准,建议等待独立第三方的复现结果后再做最终判断.</p>
<p><strong>信息来源限制.</strong> K2.5 的技术报告(arXiv:2602.02276)是一份完整的学术论文,数据和方法论披露相对充分.但部分关键超参(如 Toggle 的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span>、PARL 的退火 schedule)未公开,限制了社区的精确复现.</p>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Kimi K2.5: Visual Agentic Intelligence, arXiv:2602.02276</li>
<li>前置阅读: <a href="/llm-guide/14-models/14.5-kimi/03-kimi-k2.5/01-kimi-k2.5-jsbgjy">01-Kimi-K2.5技术报告精译</a></li>
<li>架构总览: <a href="/llm-guide/14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-architecture-overview">05-Kimi-K2.5-Architecture-Overview</a></li>
<li>后续模型: Kimi K2.6 技术博客精译(见 04-Kimi-K2.6 目录)</li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-c-wbtl-d-ysdmtznt","text":"1. 设计动机:从「文本推理」到「原生多模态智能体」"},{"level":2,"id":"2-hxjg-szjtydmtxt","text":"2. 核心架构:三组件统一多模态系统"},{"level":3,"id":"2-1-moon-vi-t-3d-txyspdjjty","text":"2.1 MoonViT-3D:图像与视频的极简统一"},{"level":3,"id":"2-2-mlp-projector-y-moe-yymx","text":"2.2 MLP Projector 与 MoE 语言模型"},{"level":3,"id":"2-3-decoupled-encoder-process-dep-xljcsscx","text":"2.3 Decoupled Encoder Process(DEP):训练基础设施创新"},{"level":2,"id":"3-gjcx-hxljddfzjfx","text":"3. 关键创新:后训练阶段的反直觉发现"},{"level":3,"id":"3-1-zero-vision-sft-cwbjhsjnl","text":"3.1 Zero-Vision SFT:纯文本激活视觉能力"},{"level":3,"id":"3-2-lhdmtqhxx-kmtsxzq","text":"3.2 联合多模态强化学习:跨模态双向增强"},{"level":3,"id":"3-3-agent-swarm-bhzntbp","text":"3.3 Agent Swarm:并行智能体编排"},{"level":3,"id":"3-4-toggle-xsysddjtyh","text":"3.4 Toggle:效率与深度的交替优化"},{"level":2,"id":"4-hxdb-dmt-agent-d-sota-jzgj","text":"4. 横向对比:多模态 Agent 的 SOTA 竞争格局"},{"level":2,"id":"5-jxxyxxlyxz","text":"5. 局限性与信息来源限制"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/03-kimi-k2.5/02-kimi-k2.5-tljgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/03-kimi-k2.5/02-kimi-k2.5-tljgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi K2.5 推理架构剖析</h1>
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
