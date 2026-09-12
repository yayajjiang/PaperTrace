"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Kimi K2.5 原生多模态智能体与 Agent Swarm 编排体系剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.5-kimi/14.5-kimi">返回 14.5-Kimi 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>信息来源: Kimi K2.5: Visual Agentic Intelligence (arXiv:2602.02276)
发布日期: 2026-01-27
发布机构: Moonshot AI, Kimi Team
开源协议: 后训练Checkpoint开源</p>
</blockquote>
<hr>
<h2 id="1-sjdj-c-wbtl-d-ysdmtznt">1. 设计动机: 从「文本推理」到「原生多模态智能体」</h2>
<p>Kimi K2.5 不是 K2 的「多模态升级版」,而是一个根本性的范式转移: 从「先训文本、后加视觉」的适配思路,转向「文本与视觉从头共同演化」的原生多模态智能体.</p>
<p>这一转移的驱动力是 K2.5 团队的一个反直觉发现: 在固定视觉-文本 token 总预算下,<strong>Early Fusion + 低视觉比例(10%)全面优于 Late Fusion + 高视觉比例(50%)</strong>.</p>
<table>
<thead>
<tr>
<th>策略</th>
<th>视觉注入时机</th>
<th>视觉比例</th>
<th>视觉知识</th>
<th>视觉推理</th>
<th>文本知识</th>
<th>文本推理</th>
</tr>
</thead>
<tbody><tr>
<td>Early Fusion</td>
<td>从头</td>
<td>10%</td>
<td>25.8</td>
<td>43.8</td>
<td>45.5</td>
<td>58.5</td>
</tr>
<tr>
<td>Mid Fusion</td>
<td>中期</td>
<td>50%</td>
<td>25.0</td>
<td>40.7</td>
<td>43.9</td>
<td>58.6</td>
</tr>
<tr>
<td>Late Fusion</td>
<td>末期</td>
<td>80%</td>
<td>24.2</td>
<td>39.0</td>
<td>43.1</td>
<td>57.8</td>
</tr>
</tbody></table>
<p>Late Fusion 在注入视觉数据时,文本能力会先显著下降再逐渐恢复(模态域迁移冲击),而 Early Fusion 的训练曲线保持平稳. 这揭示了一个深层原则:<strong>多模态能力的获取不是「后期追加视觉课程」,而是「两种模态从头共同演化」</strong>.</p>
<p>这里需要停下来想一下. 这一发现挑战了整个多模态预训练领域的传统认知. 此前的主流做法(如 LLaVA、Qwen-VL)都是在强大的文本 LLM 基础上,后期加入视觉适配层和高比例视觉数据. K2.5 证明这种「后期补课」策略实际上损害了文本能力,因为模态切换引入了域迁移冲击. 相反,从预训练第一天就以 10% 的比例混入视觉数据,模型可以在学习语言的同时自然建立视觉-文本联合表示,两种能力同步增长而非此消彼长. 但这里有一个前提条件: 这个结论基于「固定视觉 token 总预算」. 如果视觉数据预算不受限,Late Fusion 配合更高比例是否可能更好? 论文没有回答这个问题,但这为后续研究留下了开放问题.</p>
<hr>
<h2 id="2-jg-moon-vi-t-3d-ygxqrkj">2. 架构: MoonViT-3D 与共享嵌入空间</h2>
<h3 id="2-1-szjjg">2.1 三组件架构</h3>
<p>K2.5 的多模态架构由三个组件组成:</p>
<ol>
<li><strong>MoonViT-3D</strong>: 原生分辨率视觉Encoder,从 SigLIP-SO-400M 初始化</li>
<li><strong>MLP Projector</strong>: 将视觉特征投影到语言模型的 token 空间</li>
<li><strong>Kimi K2 MoE 语言模型</strong>: 1.04T 总参数/32B 激活,384 专家</li>
</ol>
<h3 id="2-2-moon-vi-t-3d-txyspdjjty">2.2 MoonViT-3D: 图像与视频的极简统一</h3>
<p>传统视频理解模型通常使用独立的视频Encoder(如 TimeSformer、Video Swin Transformer),导致图像和视频的知识无法共享. MoonViT-3D 的解决方案极其简洁:</p>
<ul>
<li><strong>图像</strong>: 单张图像被划分为 patches,展平并拼接成 1D 序列(NaViT packing)</li>
<li><strong>视频</strong>: 最多四个连续帧被视为一个时空体,patches 联合展平并打包成单个 1D 序列</li>
<li><strong>共享机制</strong>: 图像和视频使用完全相同的注意力机制,无需专用视频模块</li>
<li><strong>时间压缩</strong>: 轻量级时间池化在每个时间块内聚合 patches,产生 4 倍时间压缩</li>
</ul>
<p>这里值得停下来想一下. MoonViT-3D 的设计体现了「极简主义」的工程哲学. 将视频视为「多帧图像」——4 个连续帧的 patches 被打包进同一个 1D 序列,用同一个 Transformer 处理——这种设计的优势是: 图像预训练的权重直接适用于视频,无需微调;架构简单,维护成本低;时间池化是可学习的,模型可以自适应地决定哪些时间信息需要保留. 代价是对于需要精细时间建模的任务(如毫秒级动作识别),简单的 patch-level 平均可能丢失关键信息. 但从评估结果(VideoMMMU 86.6%、LVBench 75.9%)来看,这种权衡在实践中是有效的. 这也验证了一个更一般的原则: 在工程上,「简单且足够好」往往优于「复杂且理论上更优」.</p>
<hr>
<h2 id="3-yxl-15t-token-dlhyh">3. 预训练: 15T Token 的联合优化</h2>
<h3 id="3-1-sjdlsx">3.1 三阶段流水线</h3>
<table>
<thead>
<tr>
<th>阶段</th>
<th>数据</th>
<th>序列长度</th>
<th>Token 量</th>
<th>可训练组件</th>
</tr>
</thead>
<tbody><tr>
<td>ViT 训练</td>
<td>Alt text, Caption, Grounding, OCR, Video</td>
<td>4096</td>
<td>1T</td>
<td>ViT</td>
</tr>
<tr>
<td>联合预训练</td>
<td>+ Text, Knowledge, Interleaving, Video, OS Screenshot</td>
<td>4096</td>
<td>15T</td>
<td>ViT &amp; LLM</td>
</tr>
<tr>
<td>长上下文中期训练</td>
<td>+ 高质量文本与多模态,长文本,长视频</td>
<td>32K/256K</td>
<td>500B/200B</td>
<td>ViT &amp; LLM</td>
</tr>
</tbody></table>
<h3 id="3-2-sjld">3.2 数据亮点</h3>
<p><strong>文本语料</strong>扩展了三个新维度:</p>
<ul>
<li>仓库级代码(跨文件推理和架构理解)</li>
<li>Issues、Code Reviews、Commit Histories(真实开发模式)</li>
<li>代码相关文档(PDF 和 webtext)</li>
</ul>
<p><strong>视觉数据</strong>包含七类: caption、interleaving、OCR、knowledge、video、agent、grounding. 特别值得注意的是 <strong>image-code paired data</strong>——HTML/React/SVG 等代码格式与其渲染截图配对,使模型能将抽象结构逻辑与具体视觉几何对齐.</p>
<h3 id="3-3-xljcss-dep">3.3 训练基础设施: DEP</h3>
<p>Decoupled Encoder Process(DEP)是 K2.5 训练基础设施的核心创新. 传统多模态训练中,视觉Encoder 和文本嵌入共置于 PP 的第一阶段,导致 Stage-0 负载严重不均衡. DEP 将视觉Encoder 从 PP 中「剥离」:</p>
<ol>
<li><strong>均衡视觉前向</strong>: 在所有 GPU 上复制视觉Encoder,基于负载指标均匀分布</li>
<li><strong>主干训练</strong>: 用标准 PP 处理文本主干,复用 K2 的优化</li>
<li><strong>视觉重计算与反向</strong>: 重新计算视觉Encoder 前向,计算其梯度</li>
</ol>
<p>DEP 实现 90% 的多模态训练效率(相对于纯文本训练),意味着 15T token 的联合预训练几乎不增加额外开销.</p>
<hr>
<h2 id="4-zero-vision-sft-cwbjhsjnl">4. Zero-Vision SFT: 纯文本激活视觉能力</h2>
<p>K2.5 后训练中最反直觉的发现: <strong>仅用文本 SFT 数据即可激活视觉推理和工具使用</strong>.</p>
<p>传统方法通过人工标注的视觉轨迹来教模型「看懂图像并操作」,但 K2.5 证明纯文本 SFT(所有图像操作通过 IPython 代码代理)效果更好. 其机制是:</p>
<ol>
<li>联合预训练已建立视觉-文本的强对齐</li>
<li>代码作为桥梁提供精确的操作语义——<code>cv2.inRange</code> 就是精确的颜色过滤,不存在歧义</li>
<li>纯文本 SFT 数据更丰富多样,避免了人工视觉数据的风格过拟合</li>
</ol>
<p>这里需要停下来想一下. Zero-Vision SFT 的有效性高度依赖于「前期联合预训练足够强」的前提. 对于预训练阶段视觉数据不足或对齐质量较差的模型,Zero-Vision SFT 可能无法生效. 这也解释了为什么「文本-视觉 SFT」(加入人工视觉轨迹)反而更差: 有限的人工视觉数据不仅多样性不足,还可能导致模型过拟合于特定的标注风格. 但这个结论的普适性需要谨慎对待——它可能只适用于像 K2.5 这样经历了 15T token 联合预训练的强基座模型.</p>
<hr>
<h2 id="5-lhdmtqhxx-kmtsxzq">5. 联合多模态强化学习: 跨模态双向增强</h2>
<h3 id="5-1-jyjgdsj-rl">5.1 基于结果的视觉 RL</h3>
<p>Zero-Vision SFT 之后,模型在三个视觉领域进行基于结果的 RL:</p>
<ul>
<li>视觉定位与计数</li>
<li>图表与文档理解</li>
<li>视觉关键型 STEM 问题</li>
</ul>
<h3 id="5-2-sj-rl-tswbnl">5.2 视觉 RL 提升文本能力</h3>
<p>表 2 展示了一个在 RL 文献中极少被报道的现象:</p>
<table>
<thead>
<tr>
<th>基准</th>
<th>视觉 RL 之前</th>
<th>视觉 RL 之后</th>
<th>提升</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU-Pro</td>
<td>84.7</td>
<td>86.4</td>
<td>+1.7</td>
</tr>
<tr>
<td>GPQA-Diamond</td>
<td>84.3</td>
<td>86.4</td>
<td>+2.1</td>
</tr>
<tr>
<td>LongBench v2</td>
<td>56.7</td>
<td>58.9</td>
<td>+2.2</td>
</tr>
</tbody></table>
<p>视觉 RL 不仅提升了视觉任务,还提升了纯文本基准. 可能的解释是: 视觉任务强迫模型学会「仔细检查输入、提取关键信息、结构化推理」的模式,而这些模式恰好也是文本推理任务所需要的. 这与 K2.5 按能力维度(知识/推理/代码/智能体)而非输入模态来组织 RL 领域的设计选择一致——同一能力维度下的文本和视觉任务共享 reward 信号,最大化了跨模态迁移.</p>
<hr>
<h2 id="6-agent-swarm-bhzntbp">6. Agent Swarm: 并行智能体编排</h2>
<h3 id="6-1-hxwt-sxzhdpj">6.1 核心问题: 顺序执行的瓶颈</h3>
<p>现有智能体系统的主要挑战在于依赖推理和工具调用步骤的顺序执行. 当任务演变为包含广泛信息收集和复杂多分支推理时,顺序系统的延迟随任务复杂度线性增长.</p>
<h3 id="6-2-parl-djzznt-kxlbpq">6.2 PARL: 冻结子智能体 + 可训练编排器</h3>
<p>PARL(Parallel Agent Reinforcement Learning)采用解耦架构:</p>
<ul>
<li><strong>编排器(可训练)</strong>: 负责动态任务分解、子智能体实例化和并行调度</li>
<li><strong>子智能体(冻结)</strong>: 从固定中间策略Checkpoint实例化,执行具体子任务</li>
</ul>
<p>这种设计刻意避免端到端协同优化,以规避两个根本性挑战:</p>
<ol>
<li><strong>信用分配模糊</strong>: 最终答案正确不能保证每个子智能体都执行完美</li>
<li><strong>训练不稳定性</strong>: 多智能体联合优化的高维策略空间难以收敛</li>
</ol>
<h3 id="6-3-parl-jlsj">6.3 PARL 奖励设计</h3>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>r</mi><mrow><mi>P</mi><mi>A</mi><mi>R</mi><mi>L</mi></mrow></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>=</mo><msub><mi>λ</mi><mn>1</mn></msub><mo>⋅</mo><msub><mi>r</mi><mrow><mi>p</mi><mi>a</mi><mi>r</mi><mi>a</mi><mi>l</mi><mi>l</mi><mi>e</mi><mi>l</mi></mrow></msub><mo>+</mo><msub><mi>λ</mi><mn>2</mn></msub><mo>⋅</mo><msub><mi>r</mi><mrow><mi>f</mi><mi>i</mi><mi>n</mi><mi>i</mi><mi>s</mi><mi>h</mi></mrow></msub><mo>+</mo><msub><mi>r</mi><mrow><mi>p</mi><mi>e</mi><mi>r</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_{PARL}(x, y) = \\lambda_1 \\cdot r_{parallel} + \\lambda_2 \\cdot r_{finish} + r_{perf}(x, y)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight">A</span><span class="mord mathnormal mtight" style="margin-right:0.0077em;">R</span><span class="mord mathnormal mtight">L</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">ini</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span></span></span></span></span><p>三个组件的分工:</p>
<ul>
<li><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>p</mi><mi>e</mi><mi>r</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{perf}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></strong>: 最终目标,评估任务解决方案的整体成功和质量</li>
<li><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>p</mi><mi>a</mi><mi>r</mi><mi>a</mi><mi>l</mi><mi>l</mi><mi>e</mi><mi>l</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{parallel}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></strong>: 探索激励,防止编排器默认回退到单智能体执行(序列崩溃)</li>
<li><strong><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>f</mi><mi>i</mi><mi>n</mi><mi>i</mi><mi>s</mi><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{finish}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">ini</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span></strong>: 可行性约束,防止编排器生成大量无意义子智能体(虚假并行)</li>
</ul>
<p>超参数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\lambda_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\lambda_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 在训练过程中退火至零,确保最终策略优化主要目标.</p>
<p>这里值得停下来想一下. PARL 奖励设计中的「退火」机制是关键. 如果 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mn>1</mn></msub></mrow><annotation encoding="application/x-tex">\\lambda_1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 和 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>λ</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">\\lambda_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">λ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 退火太快,编排器可能还没学会并行就只剩 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>p</mi><mi>e</mi><mi>r</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">r_{perf}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>; 如果退火太慢,最终策略可能被辅助奖励主导而偏离任务质量最优. 这种「主目标 + 辅助探索奖励 + 逐步减少辅助信号」的设计思路与课程学习一致. 但更深层的问题是: 为什么冻结子智能体而非联合训练? 答案是「以能力换稳定性」. 冻结子智能体将问题从「多智能体联合优化」降级为「单智能体(编排器)在动态环境中的 RL」,虽然子智能体的能力上限被固定,但训练稳定性大幅提升. 这是一种务实的工程选择——在复杂系统中,可控性往往比理论最优更重要.</p>
<h3 id="6-4-critical-steps-bhjsdgjljdl">6.4 Critical Steps: 并行计算的关键路径度量</h3>
<p>为衡量并行智能体的计算时间成本,Agent Swarm 引入 Critical Steps:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>CriticalSteps</mtext><mo>=</mo><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>1</mn></mrow><mi>T</mi></munderover><msubsup><mi>S</mi><mtext>main</mtext><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup><mo>+</mo><munder><mrow><mi>max</mi><mo>⁡</mo></mrow><mi>i</mi></munder><msubsup><mi>S</mi><mrow><mtext>sub</mtext><mo separator="true">,</mo><mi>i</mi></mrow><mrow><mo stretchy="false">(</mo><mi>t</mi><mo stretchy="false">)</mo></mrow></msubsup></mrow><annotation encoding="application/x-tex">\\text{CriticalSteps} = \\sum_{t=1}^{T} S_{\\text{main}}^{(t)} + \\max_i S_{\\text{sub},i}^{(t)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">CriticalSteps</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.0954em;vertical-align:-1.2671em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8283em;"><span style="top:-1.8829em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2671em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4173em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">main</span></span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2827em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.7725em;vertical-align:-0.7277em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.3723em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop">max</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7277em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.3987em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">sub</span></span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">i</span></span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">t</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4374em;"><span></span></span></span></span></span></span></span></span></span></span><p>即每个阶段的持续时间由该并行组中最长运行的子智能体决定. 这与计算图中的关键路径长度一致,迫使编排器关注「瓶颈子任务」——那些执行时间最长的分支.</p>
<p>Agent Swarm 在 WideSearch 基准上,将延迟降低 3-4.5 倍,同时将 Item-level F1 从 72.8% 提升至 79.0%.</p>
<h3 id="6-5-zdssxwgl">6.5 主动式上下文管理</h3>
<p>Agent Swarm 通过显式编排实现主动式上下文控制: 长程任务被分解为并行的、语义隔离的子任务,每个由具有受限局部上下文的专业化子智能体执行. 子智能体保持独立工作记忆,仅任务相关的输出被选择性路由回编排器. 这相当于<strong>上下文分片</strong>而非上下文截断,使系统能够沿额外的架构维度扩展有效上下文长度.</p>
<hr>
<h2 id="7-toggle-xsysddjtyh">7. Toggle: 效率与深度的交替优化</h2>
<p>K2.5 提出 Toggle,一种在推理时扩展和预算约束优化之间交替的训练启发式:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>r</mi><mo>~</mo></mover><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo><mo>⋅</mo><mi mathvariant="double-struck">I</mi><mrow><mo fence="true">[</mo><mover accent="true"><mi>r</mi><mo>ˉ</mo></mover><mo>≥</mo><mi>τ</mi><mtext> 或 </mtext><mi mathvariant="normal">∣</mi><mi>y</mi><mi mathvariant="normal">∣</mi><mo>≤</mo><mtext>budget</mtext><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo fence="true">]</mo></mrow></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>Phase0</mtext></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>r</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>y</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mtext>Phase1</mtext></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">\\tilde{r}(x, y) = \\begin{cases} r(x, y) \\cdot \\mathbb{I}\\left[\\bar{r} \\geq \\tau \\text{ 或 } |y| \\leq \\text{budget}(x)\\right] &amp; \\text{Phase0} \\\\ r(x, y) &amp; \\text{Phase1} \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.6679em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3.35em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">~</span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathbb">I</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">[</span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">r</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1944em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">或</span><span class="mord"> </span></span><span class="mord">∣</span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≤</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord text"><span class="mord">budget</span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mclose delimcenter" style="top:0em;">]</span></span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">Phase0</span></span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord text"><span class="mord">Phase1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><ul>
<li><strong>Phase0(预算限制)</strong>: 模型被训练在任务相关的 token 预算内解决问题. 约束有条件应用: 仅当平均准确率超过阈值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span> 时才强制执行</li>
<li><strong>Phase1(标准扩展)</strong>: 模型生成响应直至最大 token 限制,鼓励利用计算获得更好的推理</li>
</ul>
<p>问题相关的预算从正确响应子集的 token 长度的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 百分位数估计. Toggle 平均减少输出 token 25-30%,对性能影响可忽略.</p>
<p>这里需要停下来想一下. Toggle 解决的核心矛盾是: 「预算约束」可以让模型学会简洁推理,但「过度约束」会导致 length-overfitting——模型在测试时无法利用额外的 token 预算来解决更困难的问题. Toggle 的解决方案是交替进行两个阶段的训练: Phase0 教模型「如何在有限预算内高效解决问题」,Phase1 教模型「如何在充足预算内深入推理」. 这暗示了一个更一般的原则: 对于测试时扩展模型,「效率」和「深度」不是互斥的,而是可以通过交替训练同时获得的. 但两个阶段的交替频率(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span>)和预算阈值(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>τ</mi></mrow><annotation encoding="application/x-tex">\\tau</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.1132em;">τ</span></span></span></span>)是关键超参,论文未披露具体值,这是复现时的一个关键未知量.</p>
<hr>
<h2 id="8-xndw-dmt-agent-d-sota">8. 性能定位: 多模态 Agent 的 SOTA</h2>
<h3 id="8-1-tlybc">8.1 推理与编程</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>K2.5</th>
<th>GPT-5.2</th>
<th>Claude Opus 4.5</th>
</tr>
</thead>
<tbody><tr>
<td>AIME 2025</td>
<td>96.1%</td>
<td>100%</td>
<td>92.8%</td>
</tr>
<tr>
<td>HMMT 2025</td>
<td>95.4%</td>
<td>99.4%</td>
<td>92.9%</td>
</tr>
<tr>
<td>LiveCodeBench v6</td>
<td>85.0%</td>
<td>-</td>
<td>82.2%</td>
</tr>
<tr>
<td>SWE-Bench Verified</td>
<td>76.8%</td>
<td>80.0%</td>
<td><strong>80.9%</strong></td>
</tr>
</tbody></table>
<p>K2.5 在严格 STEM 基准上接近或超越顶级闭源模型,仅在 SWE-Bench Verified 上略低于 Claude Opus 4.5.</p>
<h3 id="8-2-zntnl">8.2 智能体能力</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>K2.5</th>
<th>GPT-5.2</th>
<th>Claude Opus 4.5</th>
</tr>
</thead>
<tbody><tr>
<td>BrowseComp</td>
<td><strong>60.6%</strong></td>
<td>65.8%</td>
<td>37.0%</td>
</tr>
<tr>
<td>BrowseComp + Swarm</td>
<td><strong>78.4%</strong></td>
<td>77.9%(Pro)</td>
<td>-</td>
</tr>
<tr>
<td>OSWorld-Verified</td>
<td><strong>63.3%</strong></td>
<td>42.9%</td>
<td>66.3%</td>
</tr>
</tbody></table>
<p>Agent Swarm 在 BrowseComp 上带来 17.8% 的绝对提升(60.6% → 78.4%),甚至超越 GPT-5.2 Pro(77.9%).</p>
<h3 id="8-3-sjysp">8.3 视觉与视频</h3>
<table>
<thead>
<tr>
<th>基准</th>
<th>K2.5</th>
<th>次优开源</th>
</tr>
</thead>
<tbody><tr>
<td>MMMU-Pro</td>
<td>78.5%</td>
<td>-</td>
</tr>
<tr>
<td>VideoMMMU</td>
<td>86.6%</td>
<td>-</td>
</tr>
<tr>
<td>LVBench</td>
<td><strong>75.9%</strong></td>
<td>-</td>
</tr>
<tr>
<td>LongVideoBench</td>
<td><strong>79.8%</strong></td>
<td>-</td>
</tr>
</tbody></table>
<p>K2.5 在长视频理解(LVBench 75.9%、LongVideoBench 79.8%)上创造全球 SOTA,输入超过 2000 帧.</p>
<hr>
<h2 id="9-mxpxdw">9. 模型谱系定位</h2>
<ul>
<li><strong>直接继承自</strong>: Kimi K2(1T MoE, 15.5T 文本预训练, MuonClip, 256K 上下文)</li>
<li><strong>核心创新</strong>:<ul>
<li>原生多模态预训练(Early Fusion, 10% 视觉比例, 15T 混合 token)</li>
<li>MoonViT-3D(原生分辨率 + 3D 时序压缩 4x, 图像视频共享参数)</li>
<li>Zero-Vision SFT(纯文本激活视觉推理和工具使用)</li>
<li>跨模态联合 RL(视觉 RL 提升文本 MMLU-Pro/GPQA 2+ 分)</li>
<li>Agent Swarm + PARL(冻结子智能体, 只训编排器, Critical Steps 度量)</li>
<li>Toggle(交替预算限制/标准扩展, -25~30% token)</li>
<li>DEP(解耦视觉Encoder, 90% 多模态训练效率)</li>
</ul>
</li>
<li><strong>被后续工作影响</strong>:<ul>
<li>Kimi K2.6(300 智能体协调, Claw Groups, 2026-04)</li>
</ul>
</li>
<li><strong>同期竞争</strong>:<ul>
<li>GPT-5.2(xhigh, 闭源)</li>
<li>Claude Opus 4.5(扩展思考, 闭源)</li>
<li>Gemini 3 Pro(高思考级别, 闭源)</li>
<li>DeepSeek-V3.2(思考模式, 开源)</li>
</ul>
</li>
<li><strong>技术定位</strong>: K2.5 是 Kimi 家族从「文本推理模型」向「原生多模态智能体」演进的关键节点,证明了多模态联合训练中的反共识发现、纯文本 SFT 可以激活视觉能力、以及并行智能体编排可以通过 RL 学习而非预设规则</li>
</ul>
<hr>
<p><em>本文档基于 Kimi K2.5 技术报告(arXiv:2602.02276)进行系统性架构剖析.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjdj-c-wbtl-d-ysdmtznt","text":"1. 设计动机: 从「文本推理」到「原生多模态智能体」"},{"level":2,"id":"2-jg-moon-vi-t-3d-ygxqrkj","text":"2. 架构: MoonViT-3D 与共享嵌入空间"},{"level":3,"id":"2-1-szjjg","text":"2.1 三组件架构"},{"level":3,"id":"2-2-moon-vi-t-3d-txyspdjjty","text":"2.2 MoonViT-3D: 图像与视频的极简统一"},{"level":2,"id":"3-yxl-15t-token-dlhyh","text":"3. 预训练: 15T Token 的联合优化"},{"level":3,"id":"3-1-sjdlsx","text":"3.1 三阶段流水线"},{"level":3,"id":"3-2-sjld","text":"3.2 数据亮点"},{"level":3,"id":"3-3-xljcss-dep","text":"3.3 训练基础设施: DEP"},{"level":2,"id":"4-zero-vision-sft-cwbjhsjnl","text":"4. Zero-Vision SFT: 纯文本激活视觉能力"},{"level":2,"id":"5-lhdmtqhxx-kmtsxzq","text":"5. 联合多模态强化学习: 跨模态双向增强"},{"level":3,"id":"5-1-jyjgdsj-rl","text":"5.1 基于结果的视觉 RL"},{"level":3,"id":"5-2-sj-rl-tswbnl","text":"5.2 视觉 RL 提升文本能力"},{"level":2,"id":"6-agent-swarm-bhzntbp","text":"6. Agent Swarm: 并行智能体编排"},{"level":3,"id":"6-1-hxwt-sxzhdpj","text":"6.1 核心问题: 顺序执行的瓶颈"},{"level":3,"id":"6-2-parl-djzznt-kxlbpq","text":"6.2 PARL: 冻结子智能体 + 可训练编排器"},{"level":3,"id":"6-3-parl-jlsj","text":"6.3 PARL 奖励设计"},{"level":3,"id":"6-4-critical-steps-bhjsdgjljdl","text":"6.4 Critical Steps: 并行计算的关键路径度量"},{"level":3,"id":"6-5-zdssxwgl","text":"6.5 主动式上下文管理"},{"level":2,"id":"7-toggle-xsysddjtyh","text":"7. Toggle: 效率与深度的交替优化"},{"level":2,"id":"8-xndw-dmt-agent-d-sota","text":"8. 性能定位: 多模态 Agent 的 SOTA"},{"level":3,"id":"8-1-tlybc","text":"8.1 推理与编程"},{"level":3,"id":"8-2-zntnl","text":"8.2 智能体能力"},{"level":3,"id":"8-3-sjysp","text":"8.3 视觉与视频"},{"level":2,"id":"9-mxpxdw","text":"9. 模型谱系定位"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.5-kimi/03-kimi-k2.5/05-kimi-k2.5-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Kimi K2.5 原生多模态智能体与 Agent Swarm 编排体系剖析</h1>
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
