"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Ling 2.0 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.16-Ling 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>原文</strong>: <em>Every Activation Boosted: Scaling General Reasoner to 1 Trillion Open Language Foundation</em><br><strong>arXiv</strong>: 2510.22115 | <strong>机构</strong>: Ling Team, Inclusion AI | <strong>日期</strong>: 2025-10-24<br><strong>开源</strong>: <a href="https://github.com/inclusionAI/Ling-V2">GitHub</a> | <a href="https://huggingface.co/collections/inclusionAI/ling-v2">HuggingFace</a></p>
</blockquote>
<hr>
<h2 id="y-mxglydw">一、模型概览与定位</h2>
<p>Ling 2.0 是由 Inclusion AI 团队发布的<strong>推理导向型开源语言基座模型系列</strong>，核心设计哲学是 <strong>&quot;Every Activation Boosted&quot;</strong>(每一次激活都用于提升推理能力)。该系列在统一的 MoE(混合专家)范式下，从 160 亿参数扩展到 <strong>1 万亿参数</strong>，包含三个非思考型(non-thinking / instruct)模型：</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>总参数量</th>
<th>激活参数量</th>
<th>激活率</th>
<th>层数</th>
<th>注意力头</th>
</tr>
</thead>
<tbody><tr>
<td>Ling-mini-2.0</td>
<td>16B</td>
<td>1.4B</td>
<td>~8.8%</td>
<td>20</td>
<td>16</td>
</tr>
<tr>
<td>Ling-flash-2.0</td>
<td>103B</td>
<td>6.1B</td>
<td>~5.9%</td>
<td>32</td>
<td>32</td>
</tr>
<tr>
<td><strong>Ling-1T</strong></td>
<td><strong>1,000B</strong></td>
<td><strong>51B</strong></td>
<td><strong>~5.1%</strong></td>
<td>80</td>
<td>64</td>
</tr>
</tbody></table>
<p>所有模型均采用 <strong>256 个路由专家 + 1 个共享专家</strong> 的设计，每 token 激活 <strong>8 个路由专家 + 1 个共享专家</strong>，整体激活率仅 <strong>~3.5%</strong>。根据 Ling Scaling Law 的预测，这种高稀疏度、细粒度的 MoE 配置可实现 <strong>约 7× 的效率杠杆</strong>(即相同推理精度下，MoE 的计算开销仅为 dense 模型的 1/7)。</p>
<p><strong>关键定位</strong>：Ling 2.0 是&quot;反射级&quot;(reflex-grade)非思考模型——它在不输出显式思维链的情况下，仍然具备强大的多步推理能力。这与同团队后续发布的 Ring 系列(深度思考模型)形成互补。</p>
<hr>
<h2 id="e-hxjg-gxsd-moe-ling-scaling-laws">二、核心架构：高稀疏度 MoE + Ling Scaling Laws</h2>
<h3 id="2-1-gxsdxld-moe-sj">2.1 高稀疏度细粒度 MoE 设计</h3>
<p>Ling 2.0 在架构上延续了 DeepSeek-V3 的 MoE 路线，但进行了系统性的扩展定律验证和优化：</p>
<ul>
<li><strong>256 路由专家 / 8 激活专家 / 1 共享专家</strong>：通过超过 300 个模型的 IsoFLOPs 实验验证，8–12 个激活专家是训练速度与模型性能的最优平衡点。</li>
<li><strong>无辅助损失负载均衡(aux-loss-free)</strong>：借鉴 DeepSeek-V3 的 bias-update 策略，但将 bias 保持在零附近(<code>b_i = b_i + u × (sign(e_i) - mean(sign(e)))</code>)，并引入 gate scaling(因子 2.5)稳定输出。</li>
<li><strong>dropless routing + group routing</strong>：保证性能不降的同时提升训练效率。</li>
<li><strong>First-K-Dense 策略</strong>：Ling-mini 和 Ling-flash 的首层为 dense，Ling-1T 的前 4 层为 dense——在不损失性能的前提下减少总参数量并改善路由均衡。</li>
</ul>
<h3 id="2-2-multi-token-prediction-mtp">2.2 Multi-Token Prediction (MTP)</h3>
<p>每个模型引入 1 层 MTP 作为辅助训练目标。实验表明 MTP 对代码和数学任务有持续提升。为缓解 MTP 带来的计算开销，Ling 2.0 在 Megatron 框架内实现了<strong>细粒度的 Pipeline Parallelism 分区</strong>，将 MTP 模块独立调度，最终几乎消除了性能损耗。</p>
<h3 id="2-3-ling-scaling-laws-cjydkycdwycssj">2.3 Ling Scaling Laws：从经验到可预测的万亿参数设计</h3>
<p>Ling 2.0 的核心方法论贡献之一是建立了<strong>统一的 MoE 扩展定律体系</strong>，包含三个层面：</p>
<p><strong>① 最优超参数扩展定律</strong>(图 1a)：基于近 1000 次实验(最高至 3e20 FLOPs)，拟合出最优学习率和 batch size 与计算预算的幂律关系。关键发现：MoE 在大规模计算下倾向于使用<strong>更大的 batch size 和更低的学习率</strong>——这是因为稀疏梯度更新需要更多样本才能稳定收敛。</p>
<p><strong>② 最优模型-数据分配定律</strong>(图 1b)：在固定计算预算下，最优 MoE 模型比 dense 模型拥有<strong>更少的参数但更多的训练数据</strong>。MoE 的有效容量更大，能在更少参数下高效吸收更多数据。</p>
<p><strong>③ MoE 架构效率扩展定律</strong>(图 2)：提出<strong>效率杠杆(Efficiency Leverage, EL)</strong> 作为核心指标——达到相同性能时 dense 模型与 MoE 模型的计算成本之比。通过系统分析激活率、专家粒度、共享专家比例等维度，推导出统一公式：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>E</mi><mi>L</mi><mo stretchy="false">(</mo><mi>A</mi><mo separator="true">,</mo><mi>G</mi><mo separator="true">,</mo><mi>C</mi><mo stretchy="false">)</mo><mo>=</mo><msup><mover accent="true"><mi>A</mi><mo>^</mo></mover><mrow><mi>α</mi><mo>+</mo><mi>γ</mi><mo stretchy="false">(</mo><mi>log</mi><mo>⁡</mo><mi>G</mi><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>+</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mi>G</mi></mrow></msup></mrow><annotation encoding="application/x-tex">EL(A, G, C) = \\hat{A}^{\\alpha + \\gamma(\\log G)^2 + \\beta \\log G}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="mord mathnormal">L</span><span class="mopen">(</span><span class="mord mathnormal">A</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">G</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0369em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:1.0369em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0556em;">γ</span><span class="mopen mtight">(</span><span class="mop mtight"><span class="mtight">l</span><span class="mtight">o</span><span class="mtight" style="margin-right:0.0139em;">g</span></span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mathnormal mtight">G</span><span class="mclose mtight"><span class="mclose mtight">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8913em;"><span style="top:-2.931em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mop mtight"><span class="mtight">l</span><span class="mtight">o</span><span class="mtight" style="margin-right:0.0139em;">g</span></span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mathnormal mtight">G</span></span></span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi>A</mi><mo>^</mo></mover></mrow><annotation encoding="application/x-tex">\\hat{A}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9468em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">A</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1111em;"><span class="mord">^</span></span></span></span></span></span></span></span></span></span> 是激活率的饱和变换，指数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>=</mo><mi>a</mi><mo>+</mo><mi>d</mi><mo>⋅</mo><mi>log</mi><mo>⁡</mo><mi>C</mi></mrow><annotation encoding="application/x-tex">\\alpha = a + d \\cdot \\log C</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">a</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">C</span></span></span></span> 建模了计算预算的放大效应。四大核心发现：</p>
<ol>
<li><strong>激活率是效率的首要驱动因素</strong>——EL 与激活率呈稳健的幂律关系，即使低至 1/128 仍然成立</li>
<li><strong>专家粒度是非线性调节器</strong>——8–12 个激活专家为最优区间</li>
<li><strong>计算预算具有放大效应</strong>——EL 随训练计算量增长而增长，MoE 在大规模预训练中优势更明显</li>
<li><strong>其他架构因素为次要效应</strong>——共享专家排列、MoE 层分布等只需粗略设置即可</li>
</ol>
<h3 id="2-4-ling-wind-tunnel-dcb-gbzdcxyzxt">2.4 Ling Wind Tunnel：低成本、高保真的创新验证系统</h3>
<p>基于上述扩展定律，Ling 团队设计了 <strong>&quot;Ling 风洞实验&quot;</strong> 系统——用 5 个从 500M 到 8B 参数的小模型(按幂律分布)，严格遵循扩展定律确定架构、数据和超参数，以仅 <strong>35% 的传统消融实验成本</strong>，实现 100 倍规模的可靠外推。该系统能将验证成本压缩到完整训练运行的 <strong>1% 以下</strong>，并将最终训练 loss 的预测误差控制在 <strong>0.01</strong> 以内。</p>
<hr>
<h2 id="s-yxl-tlnldqzjh">三、预训练：推理能力的前置激活</h2>
<h3 id="3-1-sjgc-zlytlbz">3.1 数据构成：质量与推理并重</h3>
<p>Ling 2.0 的预训练语料总规模达 <strong>20T tokens</strong>，在数据工程上有三大亮点：</p>
<p><strong>通用知识数据</strong>：</p>
<ul>
<li>多层级清洗管道：trafilatura 提取 → 广告/URL/符号过滤 → HTML/PDF 解析器持续迭代</li>
<li>自动化低质量数据检测：多通道召回(分类器 + 轻量 LLM 评分 + PPL)→ LLM 问题分析 → LLM 规则生成 → 规则泛化</li>
<li>高质量过滤与知识重写：按数据类型训练特征模型评估质量、教育水平、知识密度; 对复杂/稀有知识进行半合成重写(维基百科风格结构化、QA 转换、精简摘要)</li>
</ul>
<p><strong>推理数据(Ling Code Corpus + Ling Math Corpus)</strong>：</p>
<ul>
<li><strong>Ling Code Corpus</strong>：覆盖 660 种编程语言，包含源码、commit 历史、开发者讨论、编程竞赛数据; 通过 1B 小模型从头训练验证，2T tokens + 300B annealing 即达到 Qwen2.5-Coder-1.5B 水平</li>
<li><strong>Ling Math Corpus</strong>：多阶段处理(解析 → 召回 → 过滤 → 重写 → 合成)，构建大规模数学概念图扩展知识边界; 1B 模型持续训练 1.8T tokens 后在主流数学基准上超越 Qwen2.5-Math-1.5B</li>
</ul>
<p><strong>多语言与长文本</strong>：</p>
<ul>
<li>词表从 128K 扩展到 <strong>156K</strong>，新增多语言 token</li>
<li>约 2TB 高质量多语言数据，覆盖约 30 种语言，占总预训练数据的 4%</li>
<li>长文本数据通过 &quot;检索-合成-验证&quot; 管道产出约 <strong>1.2T tokens</strong>，质量控制包括语言卫生检查、语义一致性检测、长窗口 PPL 评分</li>
</ul>
<p><strong>数据基础设施</strong>：</p>
<ul>
<li><strong>Data-as-Code</strong>：基于 Git 版本控制的自动化 CI/CD 数据管道，50+ 数据算子，迭代周期从月缩短到日</li>
<li><strong>统一数据湖仓</strong>：宽表架构聚合网页、代码等核心域，弹性扩展无需全表重建，I/O 吞吐达 <strong>20TB/小时</strong></li>
</ul>
<h3 id="3-2-xlpf-djdjj-wsm-tdq">3.2 训练配方：多阶段渐进 + WSM 调度器</h3>
<p><strong>多阶段策略</strong>(图 5)：</p>
<ol>
<li><strong>通用预训练(20T tokens，4K 上下文)</strong>：分两阶段各 10T tokens，推理数据比例从 <strong>32% 提升到 46%</strong></li>
<li><strong>中期训练(750B tokens)</strong>：<ul>
<li>前 150B tokens：20% 为 32K 长文本，上下文从 4K 扩展到 32K，再用 YaRN 扩展至 128K</li>
<li>后 600B tokens：维持高比例推理数据，<strong>引入 CoT(思维链)数据预激活推理能力</strong></li>
</ul>
</li>
</ol>
<p><strong>WSM(Warmup-Stable-Merge)调度器</strong>(图 7)：</p>
<p>传统 LLM 训练依赖学习率衰减(LR decay)进行中期训练，但衰减时机和长度的选择缺乏灵活性。Ling 2.0 采用 WSM 调度器，<strong>用 checkpoint 合并替代 LR 衰减</strong>。</p>
<p>理论等价性证明：将一组 checkpoint <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><msub><mi>θ</mi><mi>n</mi></msub><mo separator="true">,</mo><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mi mathvariant="normal">.</mi><mo separator="true">,</mo><msub><mi>θ</mi><mrow><mi>n</mi><mo>+</mo><mi>k</mi></mrow></msub><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[\\theta_n, ..., \\theta_{n+k}]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">...</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mclose">]</span></span></span></span> 加权平均为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mover accent="true"><mi>θ</mi><mo>^</mo></mover><mrow><mi>n</mi><mo>+</mo><mi>k</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\hat{\\theta}_{n+k}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1662em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9579em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span></span><span style="top:-3.2634em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mbin mtight">+</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span></span>，等价于对过去梯度进行重新加权——即任何 LR 衰减策略都可以通过后验的 checkpoint 合并来模拟。</p>
<p>实践优势：</p>
<ul>
<li>无需预先决定衰减策略，支持训练的无缝延续</li>
<li>相比 WSD(Warmup-Stable-Decay)基线，WSM 在各任务上平均提升 <strong>1–2 分</strong></li>
<li>优势持续到后训练阶段(SFT 后仍保持)</li>
<li>最终采用 top-32 checkpoint 平均进一步提升稳定性</li>
</ul>
<h3 id="3-3-yxlpc-7-xsggyz">3.3 预训练评测：7× 效率杠杆验证</h3>
<p>基准测试覆盖数学、代码、推理、知识、多语言共 33 个数据集。核心结论：</p>
<ul>
<li><strong>Ling-mini-2.0-base</strong>(1.4B 激活)与 Qwen3-8B-base 和 Seed-OSS-36B-base 整体性能相当——确认 <strong>7× 效率杠杆</strong></li>
<li><strong>Ling-1T-base</strong> 在 MathBench、CollegeMath、OmniMath、HumanEval-Plus 等基准上领先 DeepSeek-V3.1-base 和 Kimi-K2-base</li>
<li><strong>CoT 数据预激活效果显著</strong>：引入 CoT 后，MATH 从 61.96% → 82.52%(mini)、AIME25 从 2.08% → 43.75%(mini)，且优势持续到 SFT 和 RL 阶段</li>
</ul>
<hr>
<h2 id="s-hxl-c-dft-d-evo-cot-dtljhtx">四、后训练：从 DFT 到 Evo-CoT 的推理进化体系</h2>
<h3 id="4-1-jowt-dft-smscsh">4.1 解耦微调(DFT)：双模式初始化</h3>
<p>为了让非思考模型同时具备快速响应和深度推理能力，DFT 定义了两种系统提示模式：</p>
<table>
<thead>
<tr>
<th>模式</th>
<th>系统提示</th>
<th>输出格式</th>
</tr>
</thead>
<tbody><tr>
<td>Instant Response(即时响应)</td>
<td><code>detailed think off</code></td>
<td>直接输出答案</td>
</tr>
<tr>
<td>In-Depth Reasoning(深度推理)</td>
<td><code>detailed think on</code></td>
<td><code>&lt;think&gt;{长思维链}&lt;/think&gt;&lt;answer&gt;{答案}&lt;/answer&gt;</code></td>
</tr>
</tbody></table>
<p>SFT 数据集覆盖三大领域：</p>
<ul>
<li><strong>推理</strong>：数学解题、STEM 与逻辑推理、代码生成、运筹学、科学探究</li>
<li><strong>通用</strong>：创意写作、共情对话、社会哲学讨论</li>
<li><strong>工业</strong>：金融、医疗健康、生产规划、供应链、运输优化</li>
</ul>
<p><strong>ApexEval</strong>：为筛选 RL 初始 checkpoint，ApexEval 使用 <strong>pass@k 最高分</strong>(而非贪婪或平均分)来估计模型的推理潜力上限，并用 LLM-as-Judge(如 Math-Verify、XVerify)减少格式偏差导致的误判。</p>
<h3 id="4-2-evo-cot-jhstlqhxx">4.2 Evo-CoT：进化式推理强化学习</h3>
<p>在 DFT 初始化策略的基础上，Evo-CoT(Evolutionary Chain-of-Thought)让&quot;反射级&quot;模型能够<strong>根据问题复杂度自适应调整推理深度</strong>。</p>
<p>奖励函数设计包含四个组件：</p>
<ol>
<li><strong>正确性奖励</strong> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mrow><mi>c</mi><mi>o</mi><mi>r</mi><mi>r</mi><mi>e</mi><mi>c</mi><mi>t</mi><mi>n</mi><mi>e</mi><mi>s</mi><mi>s</mi></mrow></msub></mrow><annotation encoding="application/x-tex">R_{correctness}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">cor</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">ec</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight">ess</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>：答案正确 +1，否则 0</li>
<li><strong>动态长度控制</strong> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mrow><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">R_{length}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：对超过难度特定长度限制的响应进行惩罚，系数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 随任务难度降低(难题允许更长推理)</li>
<li><strong>格式惩罚</strong> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mrow><mi>f</mi><mi>o</mi><mi>r</mi><mi>m</mi><mi>a</mi><mi>t</mi></mrow></msub></mrow><annotation encoding="application/x-tex">R_{format}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">or</span><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：若即时响应模式中出现 <code>&lt;think&gt;</code> 标记，惩罚 −0.5</li>
<li><strong>任务特定奖励</strong> <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>R</mi><mrow><mi>t</mi><mi>a</mi><mi>s</mi><mi>k</mi><mo>−</mo><mi>s</mi><mi>p</mi><mi>e</mi><mi>c</mi><mi>i</mi><mi>f</mi><mi>i</mi><mi>c</mi></mrow></msub></mrow><annotation encoding="application/x-tex">R_{task-specific}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">ec</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">c</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>：如前端工程的视觉奖励</li>
</ol>
<p>动态长度控制公式：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi>R</mi><mrow><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi></mrow></msub><mo>=</mo><mi>α</mi><mo>⋅</mo><msub><mover accent="true"><mi>R</mi><mo>^</mo></mover><mrow><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi></mrow></msub><mo separator="true">,</mo><mspace width="1em"/><msub><mover accent="true"><mi>R</mi><mo>^</mo></mover><mrow><mi>l</mi><mi>e</mi><mi>n</mi><mi>g</mi><mi>t</mi><mi>h</mi></mrow></msub><mo>=</mo><mrow><mo fence="true">{</mo><mtable rowspacing="0.36em" columnalign="left left" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>p</mi><mo stretchy="false">(</mo><mi>l</mi><mo stretchy="false">)</mo><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>r</mi><mrow><mi>a</mi><mi>c</mi><mi>c</mi></mrow></msub><mo>=</mo><mn>1</mn></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>p</mi><mo stretchy="false">(</mo><mi>l</mi><mo stretchy="false">)</mo><mo separator="true">,</mo><mn>0</mn><mo stretchy="false">)</mo><mo separator="true">,</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><msub><mi>r</mi><mrow><mi>a</mi><mi>c</mi><mi>c</mi></mrow></msub><mo>=</mo><mn>0</mn></mrow></mstyle></mtd></mtr></mtable></mrow></mrow><annotation encoding="application/x-tex">R_{length} = \\alpha \\cdot \\hat{R}_{length}, \\quad \\hat{R}_{length} = \\begin{cases} p(l), &amp; r_{acc}=1 \\\\ \\min(p(l), 0), &amp; r_{acc}=0 \\end{cases}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.2329em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.9468em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span></span><span style="top:-3.2523em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.1667em;"><span class="mord">^</span></span></span></span></span></span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">n</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">{</span></span><span class="mord"><span class="mtable"><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord mathnormal">p</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mclose">)</span><span class="mpunct">,</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mop">min</span><span class="mopen">(</span><span class="mord mathnormal">p</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">0</span><span class="mclose">)</span><span class="mpunct">,</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:1em;"></span><span class="col-align-l"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.69em;"><span style="top:-3.69em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">cc</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">1</span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.008em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">cc</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mord">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.19em;"><span></span></span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>p</mi><mo stretchy="false">(</mo><mi>l</mi><mo stretchy="false">)</mo><mo>=</mo><mn>0.5</mn><mo>−</mo><mfrac><mrow><mi>l</mi><mo>−</mo><msub><mi mathvariant="normal">ℓ</mi><mrow><mi>m</mi><mi>i</mi><mi>n</mi></mrow></msub></mrow><mrow><msub><mi mathvariant="normal">ℓ</mi><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub><mo>−</mo><msub><mi mathvariant="normal">ℓ</mi><mrow><mi>m</mi><mi>i</mi><mi>n</mi></mrow></msub><mo>+</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>9</mn></mrow></msup></mrow></mfrac></mrow><annotation encoding="application/x-tex">p(l) = 0.5 - \\frac{l - \\ell_{min}}{\\ell_{max} - \\ell_{min} + 10^{-9}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">p</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">0.5</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.3413em;vertical-align:-0.4451em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8962em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mtight">ℓ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">ma</span><span class="mord mathnormal mtight">x</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mbin mtight">−</span><span class="mord mtight"><span class="mord mtight">ℓ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">min</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mbin mtight">+</span><span class="mord mtight">1</span><span class="mord mtight"><span class="mord mtight">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7463em;"><span style="top:-2.786em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">9</span></span></span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4101em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mbin mtight">−</span><span class="mord mtight"><span class="mord mtight">ℓ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">min</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4451em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>，实现了&quot;简单题快答、难题深想&quot;的自适应策略。</p>
<h3 id="4-3-lpo-jzjclyh">4.3 LPO：句子级策略优化</h3>
<p>Ling 2.0 提出 <strong>Linguistic-unit Policy Optimization (LPO)</strong>，将<strong>句子</strong>作为策略更新的基本动作单元，解决传统 token 级和序列级方法在粒度上的失配问题。</p>
<p>核心设计：</p>
<ul>
<li><strong>句子粒度重要性采样</strong>：每个句子的重要性比率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>i</mi><mo separator="true">,</mo><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><mi>θ</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_{i,k}(\\theta)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span></span></span></span> 均匀应用于该句子的所有 token</li>
<li><strong>Token 级归一化</strong>：基于总 token 长度的组优势估计，保证跨样本尺度不变性</li>
<li><strong>裁剪策略</strong>：比率在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>1</mn><mo>−</mo><mi>ε</mi><mo separator="true">,</mo><mn>1</mn><mo>+</mo><mi>ε</mi><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[1-\\varepsilon, 1+\\varepsilon]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">ε</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">ε</span><span class="mclose">]</span></span></span></span> 内裁剪(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>ε</mi><mo>=</mo><mn>0.03</mn></mrow><annotation encoding="application/x-tex">\\varepsilon=0.03</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">ε</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.03</span></span></span></span>)，比序列级裁剪更精细</li>
</ul>
<p>实验表明(图 10)，LPO 相比 GRPO、GSPO 基线：</p>
<ul>
<li>奖励曲线更平滑，无严重平台期或崩溃</li>
<li>AIME 2025 上收敛更快、泛化更好</li>
<li>复杂推理基准上比 token 级和序列级基线提升约 <strong>10%</strong></li>
</ul>
<h3 id="4-4-gar-rubri-x-kfyphdq">4.4 GAR + RubriX：开放域偏好对齐</h3>
<p><strong>Group Arena Reward (GAR)</strong>：针对开放域主观任务，用&quot;竞技场&quot;式的组内相对比较替代独立绝对评分。同一策略的多个响应进入竞技场，生成式奖励模型进行循环赛 pairwise 比较，累积结果形成最终奖励。这有效降低了主观评价的方差和噪声。</p>
<p><strong>RubriX</strong>：细粒度多维度奖励评估框架，覆盖清晰度、连贯性、创造力、情感共鸣、指令遵循、领域准确性等维度，为写作、翻译、长文本 QA、情感对话等任务提供结构化评估标准。</p>
<h3 id="4-5-hxlpc-jzjbx">4.5 后训练评测：竞争级表现</h3>
<p>Ling-1T 在 36 个后训练基准上与 DeepSeek-V3.1-Teminus、Kimi-K2、GPT-5-main、Gemini 2.5 Pro 对比(表 8)：</p>
<ul>
<li><strong>代码</strong>：LiveCodeBench 61.68%、CodeForces 1901 分(超越所有对比模型)、Aider-Edit 83.65%</li>
<li><strong>数学</strong>：AIME24 80.21%、AIME25 70.42%、CNMO 2024 79.25%(均达到或接近 SOTA)</li>
<li><strong>推理</strong>：BBEH、KOR-Bench、ZebraLogic 等推理基准领先</li>
<li><strong>效率</strong>：在 AIME-25 上，Ling-1T 以更低的平均 token 消耗达到更高的准确率，体现了 <strong>&quot;高效思考、精准推理&quot;</strong> 的设计目标(图 13)</li>
</ul>
<hr>
<h2 id="w-jcss-qgm-fp8-yglsx">五、基础设施：全规模 FP8 + 异构流水线</h2>
<h3 id="5-1-qgm-fp8-xl">5.1 全规模 FP8 训练</h3>
<p>Ling 2.0 是<strong>目前最大的全 FP8 精度训练的开源模型</strong>。采用细粒度块级量化：</p>
<ul>
<li>激活/梯度：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>1</mn><mo separator="true">,</mo><mn>128</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[1, 128]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">128</span><span class="mclose">]</span></span></span></span> 块级量化</li>
<li>权重：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>128</mn><mo separator="true">,</mo><mn>128</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[128, 128]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">128</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">128</span><span class="mclose">]</span></span></span></span> 块级量化</li>
</ul>
<p>稳定性保障：</p>
<ul>
<li><strong>QKNorm</strong>：抑制 attention 层的异常值，减少逐层放大的量化误差</li>
<li><strong>FP8 Training Safeguard System</strong>：实时追踪每层每个操作的 underflow 比例和 distortion(余弦相似度)，首次将低精度训练安全性量化为可测指标</li>
<li>在 Ling-1T 的 900B token 训练中，FP8 与 BF16 的 loss 相对差异 <strong>≤ 0.25%</strong>(平均约 0.1%)，基准榜单无显著差异</li>
</ul>
<p>效率优化：</p>
<ul>
<li><strong>FP8 Padding Routing Map</strong>：在路由前调整路由图，消除 MoE 动态分配导致的 FP8 GEMM 对齐 padding 开销</li>
<li><strong>FP8 On-Demand Transpose Weight</strong>：高性能按需转置内核，消除权重缓存的转置副本，显存占用降低 <strong>50%</strong></li>
<li>综合带来 <strong>+15% MFU</strong> 提升</li>
</ul>
<h3 id="5-2-ygxldlsxbh">5.2 异构细粒度流水线并行</h3>
<p>Ling 2.0 引入了 First-K-Dense 和 MTP 等异构模块，传统 1F1B 流水线策略面临负载不均和气泡增加的问题。解决方案：</p>
<ul>
<li><strong>可配置的 VPP 阶段层数分配</strong>：支持每 VPP 阶段灵活的 Transformer 层数配置(含空阶段)</li>
<li><strong>MTP 独立调度</strong>：MTP 不再与 MoE 层或 loss 计算层绑定</li>
<li><strong>MTP 部分重计算</strong>：反向传播时仅重计算 MTP 中的 Transformer 层，logits 计算不重算</li>
<li><strong>MTP 细粒度分区</strong>：将 MTP 中的 MoE 层和 loss 计算层拆分为独立调度单元</li>
</ul>
<p>在 MTP 层计算成本约为标准 MoE 层 1.7× 的观察基础上，逐步优化 PP 分区策略，最终实现 <strong>约 40%</strong> 的端到端性能提升。 balanced routing 下 VPP 从 2 提升到 4 可再获 <strong>5%</strong> 增益。</p>
<h3 id="5-3-fbsxlkjyh">5.3 分布式训练框架优化</h3>
<table>
<thead>
<tr>
<th>优化项</th>
<th>效果</th>
</tr>
</thead>
<tbody><tr>
<td>FP8 基线</td>
<td>MFU 16.9%</td>
</tr>
<tr>
<td>异构细粒度流水线</td>
<td>23.8% (+6.9%)</td>
</tr>
<tr>
<td>节点内 DeepEP</td>
<td>27.1% (+3.3%)</td>
</tr>
<tr>
<td>融合算子(RoPE、Router、GroupGemm)</td>
<td>29.4% (+2.3%)</td>
</tr>
<tr>
<td>快速专家全重计算</td>
<td>31.4% (+2.0%)</td>
</tr>
<tr>
<td><strong>综合优化后</strong></td>
<td><strong>32.8%</strong></td>
</tr>
</tbody></table>
<ul>
<li><strong>节点内 DeepEP</strong>：虽然 Ling 2.0 不涉及跨节点 EP，但节点内部署 DeepEP 仍带来 2% 通信优化 + 13% 算子融合增益</li>
<li><strong>快速专家全重计算</strong>：将专家概率加权求和前移，消除 linear_fc2 和 unpermute 对前序结果的依赖，重计算延迟降低约一半，小模型端到端提升 10%，大模型约 7%</li>
<li><strong>长上下文训练</strong>：修复了 MTP 与 TP/CP 组合时的 loss/梯度不对齐问题; 解决跨样本 attention mask 的 all-padding NaN 问题; 优化 RoPE fusion 在可变子序列数下的性能波动</li>
</ul>
<h3 id="5-4-jcmxrjgc-4c-yz">5.4 基础模型软件工程：4C 原则</h3>
<p>Ling 2.0 提出将传统软件工程原则适配到基础模型开发，形成 <strong>4C 原则</strong>：</p>
<ul>
<li><strong>Correct(正确性)</strong>：精度对齐和验证工具集</li>
<li><strong>Consistent(一致性)</strong>：跨平台可复现性</li>
<li><strong>Complete(完整性)</strong>：端到端覆盖训练-评测-部署</li>
<li><strong>Co-Design(协同设计)</strong>：算法-系统-硬件的联合优化</li>
</ul>
<p>实践中的迭代升级工作流：渐进估计 → 发布审批 → 任务监控与采样分析 → 经验积累。整个训练周期中，约 <strong>3%</strong> 的实际训练资源用于验证性实验。此外：</p>
<ul>
<li>分布式 checkpoint 保存时间从 269s 降至 30s(Ling-1T)</li>
<li>启动预热使首步时间降低约 30%</li>
<li>最优故障恢复策略：checkpoint 间隔 48 分钟</li>
</ul>
<hr>
<h2 id="l-sjqsyjspx">六、设计启示与技术谱系</h2>
<h3 id="6-1-hxsjzx">6.1 核心设计哲学</h3>
<p>Ling 2.0 的核心洞见可以用一句话概括：<strong>&quot;推理能力不是后验的补丁，而是可以从预训练阶段就开始系统性注入的先天属性。&quot;</strong></p>
<p>具体体现在三个层面：</p>
<ol>
<li><strong>数据层面</strong>：预训练阶段就将推理数据比例提升到 46%，并在中期训练引入 CoT 数据进行&quot;预激活&quot;</li>
<li><strong>架构层面</strong>：通过扩展定律将稀疏度推到极限(3.5% 激活率)，用 7× 效率杠杆换取同等推理能力</li>
<li><strong>训练层面</strong>：DFT 建立双模式基础，Evo-CoT + LPO 在 RL 阶段让模型自适应地&quot;学会何时该深想&quot;</li>
</ol>
<h3 id="6-2-yxggzdgx">6.2 与相关工作的关系</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>Ling 2.0</th>
<th>DeepSeek-V3</th>
<th>Kimi-K2</th>
<th>Qwen3</th>
</tr>
</thead>
<tbody><tr>
<td>总参数</td>
<td>1T</td>
<td>671B</td>
<td>1T</td>
<td>235B (max)</td>
</tr>
<tr>
<td>激活参数</td>
<td>51B</td>
<td>37B</td>
<td>~100B</td>
<td>~20B</td>
</tr>
<tr>
<td>激活率</td>
<td>~3.5%</td>
<td>~5.5%</td>
<td>~10%</td>
<td>~8.5%</td>
</tr>
<tr>
<td>模型类型</td>
<td>non-thinking</td>
<td>non-thinking</td>
<td>non-thinking</td>
<td>dual-mode</td>
</tr>
<tr>
<td>核心特色</td>
<td>Evo-CoT + LPO</td>
<td>MLA + MTP</td>
<td>Agentic</td>
<td>思考/非思考切换</td>
</tr>
<tr>
<td>推理预激活</td>
<td>✓(中期 CoT)</td>
<td>✗</td>
<td>✗</td>
<td>✗</td>
</tr>
<tr>
<td>全 FP8 训练</td>
<td>✓</td>
<td>✓</td>
<td>?</td>
<td>?</td>
</tr>
</tbody></table>
<h3 id="6-3-kygx">6.3 开源贡献</h3>
<p>Ling 2.0 的完整代码和权重已开源，包括：</p>
<ul>
<li>三个规模的基座模型和指令微调模型</li>
<li>完整的训练和推理框架</li>
<li>为开源社区提供了首个经过 trillion-scale 验证的 FP8 全链路训练方案</li>
</ul>
<hr>
<h2 id="q-gjsjsc">七、关键数据速查</h2>
<table>
<thead>
<tr>
<th>指标</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>预训练数据总量</td>
<td>20T tokens</td>
</tr>
<tr>
<td>中期训练数据</td>
<td>750B tokens</td>
</tr>
<tr>
<td>推理数据比例(后期)</td>
<td>46%</td>
</tr>
<tr>
<td>CoT 预激活数据</td>
<td>600B tokens</td>
</tr>
<tr>
<td>FP8 vs BF16 loss 差异</td>
<td>≤ 0.25%</td>
</tr>
<tr>
<td>效率杠杆(EL)</td>
<td>~7×</td>
</tr>
<tr>
<td>WSM 相比 WSD 提升</td>
<td>+1–2 分</td>
</tr>
<tr>
<td>LPO 相比 GRPO 提升</td>
<td>~10%</td>
</tr>
<tr>
<td>异构流水线提升</td>
<td>~40%</td>
</tr>
<tr>
<td>Ling-1T MFU</td>
<td>32.8%</td>
</tr>
<tr>
<td>AIME25 (Ling-1T)</td>
<td>70.42%</td>
</tr>
<tr>
<td>CodeForces (Ling-1T)</td>
<td>1901 分</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxglydw","text":"一、模型概览与定位"},{"level":2,"id":"e-hxjg-gxsd-moe-ling-scaling-laws","text":"二、核心架构：高稀疏度 MoE + Ling Scaling Laws"},{"level":3,"id":"2-1-gxsdxld-moe-sj","text":"2.1 高稀疏度细粒度 MoE 设计"},{"level":3,"id":"2-2-multi-token-prediction-mtp","text":"2.2 Multi-Token Prediction (MTP)"},{"level":3,"id":"2-3-ling-scaling-laws-cjydkycdwycssj","text":"2.3 Ling Scaling Laws：从经验到可预测的万亿参数设计"},{"level":3,"id":"2-4-ling-wind-tunnel-dcb-gbzdcxyzxt","text":"2.4 Ling Wind Tunnel：低成本、高保真的创新验证系统"},{"level":2,"id":"s-yxl-tlnldqzjh","text":"三、预训练：推理能力的前置激活"},{"level":3,"id":"3-1-sjgc-zlytlbz","text":"3.1 数据构成：质量与推理并重"},{"level":3,"id":"3-2-xlpf-djdjj-wsm-tdq","text":"3.2 训练配方：多阶段渐进 + WSM 调度器"},{"level":3,"id":"3-3-yxlpc-7-xsggyz","text":"3.3 预训练评测：7× 效率杠杆验证"},{"level":2,"id":"s-hxl-c-dft-d-evo-cot-dtljhtx","text":"四、后训练：从 DFT 到 Evo-CoT 的推理进化体系"},{"level":3,"id":"4-1-jowt-dft-smscsh","text":"4.1 解耦微调(DFT)：双模式初始化"},{"level":3,"id":"4-2-evo-cot-jhstlqhxx","text":"4.2 Evo-CoT：进化式推理强化学习"},{"level":3,"id":"4-3-lpo-jzjclyh","text":"4.3 LPO：句子级策略优化"},{"level":3,"id":"4-4-gar-rubri-x-kfyphdq","text":"4.4 GAR + RubriX：开放域偏好对齐"},{"level":3,"id":"4-5-hxlpc-jzjbx","text":"4.5 后训练评测：竞争级表现"},{"level":2,"id":"w-jcss-qgm-fp8-yglsx","text":"五、基础设施：全规模 FP8 + 异构流水线"},{"level":3,"id":"5-1-qgm-fp8-xl","text":"5.1 全规模 FP8 训练"},{"level":3,"id":"5-2-ygxldlsxbh","text":"5.2 异构细粒度流水线并行"},{"level":3,"id":"5-3-fbsxlkjyh","text":"5.3 分布式训练框架优化"},{"level":3,"id":"5-4-jcmxrjgc-4c-yz","text":"5.4 基础模型软件工程：4C 原则"},{"level":2,"id":"l-sjqsyjspx","text":"六、设计启示与技术谱系"},{"level":3,"id":"6-1-hxsjzx","text":"6.1 核心设计哲学"},{"level":3,"id":"6-2-yxggzdgx","text":"6.2 与相关工作的关系"},{"level":3,"id":"6-3-kygx","text":"6.3 开源贡献"},{"level":2,"id":"q-gjsjsc","text":"七、关键数据速查"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.16-ling/03-ling-2.0/01-ling-2.0-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.16-ling/03-ling-2.0/01-ling-2.0-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ling 2.0 技术报告精译</h1>
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
