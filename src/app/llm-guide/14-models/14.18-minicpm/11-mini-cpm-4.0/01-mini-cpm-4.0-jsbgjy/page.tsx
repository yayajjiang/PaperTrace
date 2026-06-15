"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM4 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniCPM4: Ultra-Efficient LLMs on End Devices
原文链接: <a href="https://arxiv.org/abs/2506.07900">https://arxiv.org/abs/2506.07900</a>
发布日期: 2025.06.09(v1), 2025.09.04(v2)
发布机构: OpenBMB (面壁智能), 清华大学自然语言处理实验室</p>
</blockquote>
<hr>
<h2 id="y-mxgs">一、模型概述</h2>
<p>MiniCPM4 是 MiniCPM 系列的第四代端侧大语言模型，于 2025 年 6 月发布。该模型在架构、训练数据、训练算法和推理系统四个维度上进行了系统性创新，旨在为端侧设备提供极致效率的 LLM 解决方案。MiniCPM4 提供两个参数版本: 0.5B 和 8B，分别面向超低功耗设备和主流端侧芯片。</p>
<p>与 MiniCPM3-4B 相比，MiniCPM4-8B 的核心变化在于: (1) 引入了 InfLLM v2 可训练稀疏注意力机制，实现了长文本预填充(prefilling)和解码(decoding)阶段的双重加速; (2) 仅需 8 万亿训练 tokens 即可达到与 Qwen3-8B 相当的性能(Qwen3-8B 使用了约 36T tokens); (3) 自研 CPM.cu 推理引擎，在端侧 GPU 上实现了最高 220 倍的推理速度提升; (4) 推出了 MiniCPM4.1 混合推理模型，支持深度思考模式和非思考模式的灵活切换。</p>
<blockquote>
<p>译者注: MiniCPM4 的发布时间点非常微妙。2025 年 6 月，端侧 AI 的竞争已经进入白热化阶段: 苹果的 Apple Intelligence 开始大规模推送，Google 的 Gemini Nano 持续迭代，高通和联发科的 NPU 算力每年翻倍。面壁智能选择在这个时间点推出 MiniCPM4，其战略意图非常清晰——不仅要证明「小模型也能做好通用任务」，更要证明「小模型可以在端侧跑得比大模型更快」。220 倍的提速数字确实令人印象深刻，但需要注意这个「极限场景」的具体定义: 它是在显存极限下(即批量大小为 1、序列长度达到 128K 时)的对比，常规场景下的提速约为 5 倍。即便如此，5 倍的常规提速在端侧场景中也是极具竞争力的。</p>
</blockquote>
<hr>
<h2 id="e-mxjg-inf-llm-v2-kxlxszyl">二、模型架构: InfLLM v2 可训练稀疏注意力</h2>
<h3 id="2-1-bjydj">2.1 背景与动机</h3>
<p>随着 LLM 在长文本处理(如文档分析、代码库理解)和深度推理(如数学证明、代码生成)中的应用日益广泛，模型对长序列的理解和生成能力变得至关重要。然而，标准 Transformer 的自注意力机制的计算复杂度为 O(n^2)，在端侧设备上处理长文档时面临严重的计算和内存瓶颈。</p>
<p>现有的稀疏注意力方法大致可分为两类: (1) <strong>训练无关的稀疏注意力</strong>，如 Longformer、BigBird、StreamingLLM 等，通过在推理时采用固定的稀疏模式来降低计算量，但无法针对具体任务优化稀疏模式; (2) <strong>可训练的稀疏注意力</strong>，如 Sparse Transformer、Reformer 等，但多数方法仅在预填充阶段有效，或需要大量的长文本训练数据才能收敛。</p>
<h3 id="2-2-inf-llm-v2-dztkj">2.2 InfLLM v2 的整体框架</h3>
<p>InfLLM v2 是在 InfLLM(Xiao et al., 2024)动态稀疏注意力架构基础上的全面升级，核心创新包括:</p>
<ol>
<li><p><strong>Token 级稀疏注意力计算</strong>: 在查询(query)级别实现 token 级的稀疏注意力计算，而非传统的块级(block-level)稀疏。这意味着每个查询 token 可以独立选择其关注的关键值(key-value)块，实现更细粒度的注意力分配。</p>
</li>
<li><p><strong>端到端专用训练框架</strong>: 开发了专门针对稀疏注意力的训练框架，通过改进的负载均衡策略和长文本数据高效利用方法，进一步增强了注意力机制的稀疏性和长文本处理能力。</p>
</li>
<li><p><strong>高效的 CUDA Kernel 设计</strong>: 针对稀疏注意力的两阶段计算流程(相关性评分 + 注意力计算)，设计了高度优化的 CUDA Kernel，在 A100 和 RTX 4090 上分别实现了最高 7.4 倍和 9.3 倍的算子级加速。</p>
</li>
</ol>
<p>InfLLM v2 的稀疏注意力计算包含两个阶段:</p>
<p><strong>阶段一: 动态上下文块选择</strong>。对于每个查询 token <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>q</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">q_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>，从上下文块集合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>B</mi></mrow><annotation encoding="application/x-tex">B</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.0502em;">B</span></span></span></span> 中动态选择最相关的块。具体而言，计算查询 token 与每个块的相关性得分 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_{block}(q_i, B_j)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>，然后选择得分最高的 top-k 个块。</p>
<p><strong>阶段二: 注意力计算</strong>。基于阶段一选择的块，计算查询 token 与选中块内所有 token 的注意力。</p>
<blockquote>
<p>译者注: InfLLM v2 的核心洞察在于「注意力是极度稀疏的」这一经验观察。在标准 Transformer 中，每个查询 token 理论上需要与序列中所有先前的 token 计算注意力，但实际上大部分注意力权重接近于零。InfLLM v2 通过显式的块选择机制，只保留真正重要的上下文块，将计算量和内存访问都降到了 O(n) 级别(当序列长度远大于块大小 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 时)。但这里有一个关键问题: 块选择本身需要计算查询与所有块的相关性，这一步的复杂度仍然是 O(n)。论文中的分析指出，当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi><mo>≫</mo><mi>m</mi></mrow><annotation encoding="application/x-tex">l \\gg m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 时，阶段一的计算开销可以降低到约 1/2，但如果想要进一步提升效率，需要在「相关块检索」上做更多优化。实际上，InfLLM v2 的端到端加速比(约 2.1x prefill + 2.3x decode)远低于算子级加速比(7-9x)，这说明块选择和其他非注意力层的开销在总推理时间中占据了相当大的比例。</p>
</blockquote>
<h3 id="2-3-dtsxwkxz">2.3 动态上下文块选择</h3>
<p>InfLLM v2 的块选择机制基于语义核(semantic kernel)表示。具体来说，每个上下文块通过压缩表示(如平均池化或最大池化)生成一个语义核向量，查询 token 与语义核的相关性得分通过点积计算。这种设计的优势在于: (1) 语义核的计算可以在前向传播中复用; (2) 相关性评分的计算开销远小于完整的注意力计算。</p>
<p>为了进一步提升块选择的效率，InfLLM v2 引入了 <strong>LSE(Log-Sum-Exp)近似</strong> 技术。标准的 softmax 注意力计算涉及 LSE 操作，InfLLM v2 发现可以用近似方法快速估计 LSE 值，从而在不显著影响精度的前提下加速块选择过程。消融实验表明，引入 LSE 近似后，块选择阶段在 128K 序列上的延迟从 75.36ms 降至 56.59ms(A100)，加速约 25%。</p>
<h3 id="2-4-kxlxszyldsjyz">2.4 可训练稀疏注意力的设计原则</h3>
<p>InfLLM v2 在训练稀疏注意力时遵循以下设计原则:</p>
<ol>
<li><p><strong>稀疏模式的可学习性</strong>: 稀疏模式不是固定的(如滑动窗口或膨胀模式)，而是由模型根据输入动态学习。这使得模型可以针对不同任务(如代码生成需要关注远处变量定义，对话需要关注近期上下文)自适应调整注意力范围。</p>
</li>
<li><p><strong>预训练与推理的一致性</strong>: 稀疏注意力在预训练阶段就被引入，而非仅在推理时应用。这确保了模型在整个训练过程中学会利用稀疏模式，避免了「训练稠密、推理稀疏」带来的性能损失。</p>
</li>
<li><p><strong>长短序列的统一处理</strong>: InfLLM v2 的稀疏机制在短序列和长序列上都能有效工作。对于短序列，模型可以自然退化为近似稠密注意力; 对于长序列，稀疏性随着长度增加而增强。</p>
</li>
</ol>
<p>实验结果表明，InfLLM v2 在 81% 的注意力稀疏度下，仍能达到与完整注意力机制相当的长文本处理能力。</p>
<hr>
<h2 id="s-xlsj-ultra-clean-y-ultra-chat-v2">三、训练数据: UltraClean 与 UltraChat v2</h2>
<h3 id="3-1-ultra-clean-yxlsjglysc">3.1 UltraClean: 预训练数据过滤与生成</h3>
<p>MiniCPM4 仅使用 8 万亿训练 tokens 就达到了与 Qwen3-8B(约 36T tokens)相当的性能，数据效率提升了约 4.5 倍。这一成果的关键在于 <strong>UltraClean</strong> 数据策略，它包含两个核心组件:</p>
<p><strong>高质量知识密集型数据过滤</strong>: 传统的预训练数据过滤通常基于简单的启发式规则(如去重、长度过滤、语言识别)，这些方法无法精确评估数据的知识密度。UltraClean 提出了更精细的过滤策略，通过多维度质量评估(包括语义连贯性、事实准确性、知识新颖性等)筛选出高价值数据。实验表明，经过 UltraClean 过滤后的数据，在相同训练量下可以显著提升模型的知识问答能力。</p>
<p><strong>高质量推理密集型数据生成</strong>: 除了过滤现有数据，UltraClean 还包含一个推理数据生成模块。该模块利用教师模型生成高质量的推理轨迹(如数学证明步骤、代码调试过程)，并通过自动验证机制确保生成数据的质量。这种「合成数据 + 自动验证」的 pipeline 可以在不依赖人工标注的情况下，大规模扩充推理训练数据。</p>
<h3 id="3-2-ultra-chat-v2-jdwtsjj">3.2 UltraChat v2: 监督微调数据集</h3>
<p>MiniCPM4 的 SFT 阶段使用了 <strong>UltraChat v2</strong>，这是一个全面的监督微调数据集，涵盖三个维度:</p>
<ol>
<li><p><strong>知识密集型数据</strong>: 包含百科问答、事实核查、领域知识查询等任务，增强模型的知识储备和事实准确性。</p>
</li>
<li><p><strong>推理密集型数据</strong>: 包含数学推理、逻辑推理、代码生成等任务，增强模型的逐步推理能力。</p>
</li>
<li><p><strong>指令遵循数据</strong>: 包含多样化的指令格式和约束条件，增强模型对用户意图的理解和遵循能力。</p>
</li>
</ol>
<blockquote>
<p>译者注: UltraClean 和 UltraChat v2 的设计理念反映了 2025 年后 LLM 训练的一个重要趋势: <strong>从「大力出奇迹」(scale is all you need)转向「质量优先」(quality over quantity)</strong>。Qwen3-8B 用 36T tokens 达到的性能，MiniCPM4-8B 仅用 8T tokens 就追平了，这说明数据筛选和合成技术的进步已经可以在很大程度上弥补数据规模的差距。但这里有一个潜在的偏见问题: UltraClean 的过滤标准是由开发者定义的「高质量」，这种标准是否会系统性地偏向某些类型的知识或某些 demographic 的表达方式？论文中没有讨论数据多样性和代表性问题，这是所有「数据筛选」方法的共同盲点。</p>
</blockquote>
<hr>
<h2 id="s-xlsf-model-tunnel-v2-yhxlyh">四、训练算法: ModelTunnel v2 与后训练优化</h2>
<h3 id="4-1-model-tunnel-v2-gxyxlclss">4.1 ModelTunnel v2: 高效预训练策略搜索</h3>
<p>训练大语言模型的成本极高，超参数的选择(如学习率调度、 batch size、优化器配置)对最终性能有重大影响。传统的超参数搜索方法(如网格搜索、随机搜索)需要大量实验，成本不可承受。</p>
<p><strong>ModelTunnel v2</strong> 是一种基于小模型预测大模型性能的高效预训练策略搜索方法。其核心思想是:</p>
<ol>
<li><p><strong>ScalingBench</strong>: 构建了一个可预测的扩展基准，通过在小规模模型(如 0.01B-0.5B)上运行短周期训练实验，量化地预测不同超参数配置下的性能曲线。</p>
</li>
<li><p><strong>小模型探路</strong>: 先用极小模型快速验证多种配置，选出最有潜力的方案。</p>
</li>
<li><p><strong>大模型验证</strong>: 将筛选出的方案应用于目标规模模型(如 8B)的正式训练。</p>
</li>
</ol>
<p>实验表明，ModelTunnel v2 的性能预测准确率显著高于人工调参，且节省了大量训练资源。</p>
<h3 id="4-2-hxlyh">4.2 后训练优化</h3>
<p>MiniCPM4 的后训练阶段包含以下改进:</p>
<p><strong>Chunk-wise Rollout for Load-Balanced RL</strong>: 在强化学习阶段，传统的 rollout 方法可能导致不同样本之间的计算负载不均衡(某些样本需要更多推理步骤)。MiniCPM4 引入了分块 rollout 机制，将长序列分割为固定长度的块进行并行处理，实现了负载均衡的强化学习训练。</p>
<p><strong>BitCPM: 数据高效的三值 LLM</strong>: BitCPM 是 MiniCPM4 提出的一种三值量化模型，将权重限制为 {-1, 0, +1} 三个值。这种极端量化可以大幅降低模型存储和计算需求，但通常会带来显著的性能损失。MiniCPM4 通过专门设计的训练策略(如渐进式量化、知识蒸馏)缓解了这一问题，使得 BitCPM 在保持较高性能的同时实现了极高的压缩比。</p>
<hr>
<h2 id="w-tlxt-cpm-cu-y-fr-spec">五、推理系统: CPM.cu 与 FR-Spec</h2>
<h3 id="5-1-cpm-cu-dcdztlyq">5.1 CPM.cu: 端侧定制推理引擎</h3>
<p>通用推理框架(如 vLLM、SGLang、Transformers)虽然功能全面，但在端侧设备上往往「过重」——它们的设计目标是云端高吞吐量 serving，而非端侧低延迟推理。MiniCPM4 自研了 <strong>CPM.cu</strong>，一个专门为端侧场景定制的 CUDA 推理引擎。</p>
<p>CPM.cu 的核心设计特点:</p>
<ol>
<li><p><strong>稀疏注意力原生支持</strong>: 从内存分配到 Kernel 调用，全部围绕 InfLLM v2 的稀疏注意力结构优化。通用的推理框架需要兼容各种注意力变体，而 CPM.cu 只需支持 InfLLM v2，因此可以做更深度的定制化优化。</p>
</li>
<li><p><strong>量化集成</strong>: 原生支持多种量化格式(包括 BitCPM 的三值量化)，量化/反量化操作与计算 Kernel 深度融合，减少数据搬运开销。</p>
</li>
<li><p><strong>投机采样集成</strong>: CPM.cu 内置了 FR-Spec(Fast Reusable Speculative Decoding)，一种高效的投机解码方案。</p>
</li>
</ol>
<h3 id="5-2-fr-spec-kskfytjjm">5.2 FR-Spec: 快速可复用投机解码</h3>
<p>投机解码(Speculative Decoding)是一种通过「小模型草稿 + 大模型验证」来加速推理的技术。标准的投机解码需要维护两个独立模型(草稿模型和目标模型)，这在端侧设备上引入了额外的内存和切换开销。</p>
<p><strong>FR-Spec</strong> 的创新在于「草稿不全写，大模型快速补全」。具体来说，FR-Spec 的草稿模型只生成部分 token，剩余 token 由大模型在验证阶段快速补全。这种设计带来了两个好处: (1) 草稿模型的运行时间缩短，减轻了端侧设备的负担; (2) 草稿+验证的整体链条更稳定，输出质量不下降。</p>
<h3 id="5-3-ark-infer-kptbssp">5.3 ArkInfer: 跨平台部署适配</h3>
<p>除了 CPM.cu，MiniCPM4 还提供了 <strong>ArkInfer</strong>，一个跨平台调度系统，用于解决端侧部署的碎片化问题。ArkInfer 的核心功能:</p>
<ol>
<li><strong>统一模型调用接口</strong>: 无论底层是 llama.cpp、TensorRT 还是 OpenVINO，上层接口保持一致。</li>
<li><strong>硬件差异封装</strong>: 支持 NVIDIA、Intel、高通(Qualcomm)、联发科(MTK)、昇腾等多种芯片。</li>
<li><strong>一次训练，多端部署</strong>: 模型只需训练一次，通过 ArkInfer 即可适配不同平台。</li>
</ol>
<blockquote>
<p>译者注: CPM.cu + ArkInfer 的组合体现了面壁智能对端侧 AI 生态的深刻理解。通用推理框架的问题在于「为了兼容而牺牲性能」——vLLM 需要支持数百种模型架构，其 Kernel 设计必然是保守的。CPM.cu 只支持 MiniCPM 系列，可以做激进的定制化(如稀疏注意力的专用 Kernel、三值量化的专用指令)。但这也意味着 CPM.cu 的适用范围被限制在 MiniCPM 生态内，无法直接用于其他模型。ArkInfer 的跨平台适配能力则弥补了这一问题，使得 MiniCPM4 可以部署到几乎任何端侧设备上。英特尔与面壁的合作案例(在酷睿 Ultra 处理器上实现 Day 0 支持)证明了这一策略的有效性。</p>
</blockquote>
<hr>
<h2 id="l-pg">六、评估</h2>
<h3 id="6-1-bzpc">6.1 标准评测</h3>
<p>MiniCPM4 在多个标准基准上进行了评估。MiniCPM4-8B 在综合性能上超越了同规模的开源模型，而 MiniCPM4-0.5B 在训练数据仅为 Qwen3-0.6B 的 3% 的情况下，在多个基准上大幅超越对手:</p>
<table>
<thead>
<tr>
<th>评测基准</th>
<th>任务类型</th>
<th>MiniCPM4-0.5B</th>
<th>Qwen3-0.6B</th>
</tr>
</thead>
<tbody><tr>
<td>MMLU</td>
<td>多学科知识</td>
<td>55.55</td>
<td>42.95</td>
</tr>
<tr>
<td>CEval</td>
<td>中文知识</td>
<td>66.11</td>
<td>45.53</td>
</tr>
<tr>
<td>HumanEval</td>
<td>代码生成</td>
<td>46.34</td>
<td>40.85</td>
</tr>
</tbody></table>
<h3 id="6-2-cwbpc">6.2 长文本评测</h3>
<p>MiniCPM4-8B 基于 32K 上下文进行预训练，并通过 YaRN 技术扩展到 128K。在 128K 大海捞针测试中表现全绿(即所有位置的 needle 都能被准确检索)。</p>
<h3 id="6-3-xspc">6.3 效率评测</h3>
<p>在端侧 GPU 上的效率评测结果显示:</p>
<ul>
<li><strong>Jetson AGX Orin</strong>: 在 128K 序列长度下，MiniCPM4-8B 的预填充速度和解码速度均显著超越 Llama-3-8B、GLM-4-9B 和 Qwen3-8B。</li>
<li><strong>RTX 4090</strong>: 同样的趋势，MiniCPM4-8B 在长序列处理上展现出明显的速度优势。</li>
<li><strong>极限场景</strong>: 在显存极限条件下，推理速度最多提升 220 倍(与特定 baseline 对比)。</li>
</ul>
<blockquote>
<p>译者注: 220 倍这个数字需要仔细解读。官方声明这是「显存极限场景」下的对比，具体条件是批量大小为 1、序列长度达到 128K、使用 4-bit 量化。在这个极端条件下，稠密注意力模型由于 KV Cache 溢出而无法运行或频繁发生页交换，而 InfLLM v2 的稀疏注意力由于 KV Cache 占用大幅减少，可以流畅运行。因此，220 倍中的很大一部分可能来自于「能运行 vs 不能运行」的质变，而非单纯的算法加速。常规场景(如 4K-32K 上下文、批量大小适中)下的加速约为 5 倍，这个数字更具实际参考价值。</p>
</blockquote>
<hr>
<h2 id="q-mini-cpm4-1-hhtlmx">七、MiniCPM4.1: 混合推理模型</h2>
<p>基于 MiniCPM4 的基础架构，面壁智能进一步推出了 <strong>MiniCPM4.1</strong>，一个支持混合推理的模型。该模型的核心特点是可以在「深度思考模式」和「非思考模式」之间灵活切换:</p>
<ul>
<li><strong>深度思考模式</strong>: 模型在回答前进行多步推理，适用于数学、代码、复杂逻辑等任务。用户可以通过在查询末尾添加 <code>/think</code> 或在 <code>apply_chat_template</code> 中设置 <code>enable_thinking=True</code> 来启用此模式。</li>
<li><strong>非思考模式</strong>: 模型直接生成回答，响应更快，适用于日常对话、文本摘要等简单任务。用户可以通过添加 <code>/no_think</code> 或设置 <code>enable_thinking=False</code> 来启用此模式。</li>
</ul>
<p>MiniCPM4.1 采用了 InfLLM v2 稀疏注意力和 FR-Spec 投机解码，在 LiveCodeBench 和 AIME 等代码/数学推理任务中，推理速度比同规模开源模型(如 Qwen3-8B)快 3 倍以上。</p>
<hr>
<h2 id="b-yyal">八、应用案例</h2>
<h3 id="8-1-mini-cpm4-survey-kxzssc">8.1 MiniCPM4-Survey: 可信综述生成</h3>
<p>MiniCPM4-Survey 是一个基于 MiniCPM4 的可信综述生成应用。它通过专门的训练策略和数据构造，使模型能够基于多篇文献生成结构化的学术综述。关键特点包括:</p>
<ul>
<li><strong>数据构造</strong>: 从真实学术文献中提取引用关系、论证结构和关键发现，构建训练数据。</li>
<li><strong>训练策略</strong>: 采用多阶段训练，先学习单篇文献的理解，再学习跨文献的综合和对比。</li>
<li><strong>评估</strong>: 在综述质量、事实准确性和引用完整性等维度上进行评估。</li>
</ul>
<h3 id="8-2-mini-cpm4-mcp-gjsyymxsxwxy">8.2 MiniCPM4-MCP: 工具使用与模型上下文协议</h3>
<p>MiniCPM4-MCP 展示了 MiniCPM4 在工具使用方面的能力，基于 Model Context Protocol (MCP) 标准。该应用通过专门的 SFT 和 RL 训练，使模型能够理解和调用外部工具(API、数据库、文件系统等)。</p>
<hr>
<h2 id="j-jlywlgz">九、结论与未来工作</h2>
<p>MiniCPM4 通过 InfLLM v2、UltraClean、ModelTunnel v2、BitCPM 和 CPM.cu 等技术创新，在 8B 参数规模上实现了端侧部署的极致效率。仅用 8T 训练 tokens 达到与 36T tokens 模型相当的性能，证明了「质量优先」数据策略的有效性。</p>
<p>未来工作方向包括:</p>
<ol>
<li>进一步提升 InfLLM v2 的稀疏度，探索 90%+ 稀疏度下的性能边界。</li>
<li>将 CPM.cu 的优化经验扩展到更多模型架构。</li>
<li>探索多模态场景下的端侧效率优化。</li>
</ol>
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
<td>InfLLM v2</td>
<td>-</td>
<td>2.1节</td>
<td>可训练稀疏注意力机制，支持预填充和解码加速</td>
</tr>
<tr>
<td>UltraClean</td>
<td>-</td>
<td>3.1节</td>
<td>预训练数据过滤与生成策略</td>
</tr>
<tr>
<td>UltraChat v2</td>
<td>-</td>
<td>3.2节</td>
<td>全面的监督微调数据集</td>
</tr>
<tr>
<td>ModelTunnel v2</td>
<td>-</td>
<td>4.1节</td>
<td>基于小模型预测的高效预训练策略搜索</td>
</tr>
<tr>
<td>BitCPM</td>
<td>-</td>
<td>4.2节</td>
<td>三值量化 LLM，权重为 {-1, 0, +1}</td>
</tr>
<tr>
<td>CPM.cu</td>
<td>-</td>
<td>5.1节</td>
<td>端侧定制 CUDA 推理引擎</td>
</tr>
<tr>
<td>FR-Spec</td>
<td>-</td>
<td>5.2节</td>
<td>快速可复用投机解码方案</td>
</tr>
<tr>
<td>ArkInfer</td>
<td>-</td>
<td>5.3节</td>
<td>跨平台部署适配系统</td>
</tr>
<tr>
<td>YaRN</td>
<td>-</td>
<td>6.2节</td>
<td>位置编码外推技术，用于扩展上下文长度</td>
</tr>
<tr>
<td>LSE</td>
<td>Log-Sum-Exp</td>
<td>2.3节</td>
<td>对数求和指数，softmax 中的关键操作</td>
</tr>
<tr>
<td>Prefilling</td>
<td>预填充</td>
<td>2.1节</td>
<td>处理输入提示的阶段</td>
</tr>
<tr>
<td>Decoding</td>
<td>解码</td>
<td>2.1节</td>
<td>生成输出 token 的阶段</td>
</tr>
<tr>
<td>MCP</td>
<td>Model Context Protocol</td>
<td>8.2节</td>
<td>模型上下文协议，用于工具调用标准化</td>
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
<td><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>r</mi><mrow><mi>b</mi><mi>l</mi><mi>o</mi><mi>c</mi><mi>k</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>q</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>B</mi><mi>j</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">r_{block}(q_i, B_j)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">r</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span><span class="mord mathnormal mtight">oc</span><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0502em;">B</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0502em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></td>
<td>2.2节</td>
<td>查询 token 与上下文块的相关性得分</td>
</tr>
<tr>
<td>(2)</td>
<td>O(n) 稀疏注意力复杂度</td>
<td>2.2节</td>
<td>当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>l</mi><mo>≫</mo><mi>m</mi></mrow><annotation encoding="application/x-tex">l \\gg m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7335em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.0197em;">l</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≫</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 时，计算复杂度降为线性</td>
</tr>
</tbody></table>
<h3 id="c-mxpxdw">C. 模型谱系定位</h3>
<ul>
<li><strong>直接继承自</strong>: MiniCPM3-4B(第三代端侧基座)</li>
<li><strong>核心创新</strong>: (1) InfLLM v2 可训练稀疏注意力; (2) UltraClean 数据策略; (3) CPM.cu 端侧推理引擎; (4) MiniCPM4.1 混合推理模式</li>
<li><strong>被后续工作引用/影响</strong>: MiniCPM-SALA(2026.02，将 InfLLM v2 与 Lightning Attention 结合，实现 1M+ token 上下文)</li>
<li><strong>同期竞争模型</strong>: Qwen3-8B(Alibaba, 36T tokens)、Gemma-2-9B(Google)、Llama-3.1-8B(Meta)</li>
</ul>
<h3 id="d-gjsysjhz">D. 关键实验数据汇总</h3>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>关键指标</th>
<th>MiniCPM4-8B</th>
<th>MiniCPM4-0.5B</th>
<th>对比基准</th>
</tr>
</thead>
<tbody><tr>
<td>训练数据量</td>
<td>Tokens</td>
<td>8T</td>
<td>1T</td>
<td>Qwen3-8B: 36T</td>
</tr>
<tr>
<td>长文本</td>
<td>上下文窗口</td>
<td>128K</td>
<td>128K</td>
<td>32K 预训练 + YaRN 扩展</td>
</tr>
<tr>
<td>效率</td>
<td>常规提速</td>
<td>~5x</td>
<td>-</td>
<td>vs 稠密注意力</td>
</tr>
<tr>
<td>效率</td>
<td>极限提速</td>
<td>最高 220x</td>
<td>-</td>
<td>显存极限场景</td>
</tr>
<tr>
<td>稀疏度</td>
<td>注意力稀疏度</td>
<td>81%</td>
<td>81%</td>
<td>-</td>
</tr>
<tr>
<td>算子加速</td>
<td>A100</td>
<td>7.4x</td>
<td>-</td>
<td>vs FlashAttention-2</td>
</tr>
<tr>
<td>算子加速</td>
<td>RTX 4090</td>
<td>9.3x</td>
<td>-</td>
<td>vs FlashAttention-2</td>
</tr>
<tr>
<td>端到端加速</td>
<td>Prefill</td>
<td>2.1x</td>
<td>-</td>
<td>vs 稠密模型</td>
</tr>
<tr>
<td>端到端加速</td>
<td>Decode</td>
<td>2.3x</td>
<td>-</td>
<td>vs 稠密模型</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"y-mxgs","text":"一、模型概述"},{"level":2,"id":"e-mxjg-inf-llm-v2-kxlxszyl","text":"二、模型架构: InfLLM v2 可训练稀疏注意力"},{"level":3,"id":"2-1-bjydj","text":"2.1 背景与动机"},{"level":3,"id":"2-2-inf-llm-v2-dztkj","text":"2.2 InfLLM v2 的整体框架"},{"level":3,"id":"2-3-dtsxwkxz","text":"2.3 动态上下文块选择"},{"level":3,"id":"2-4-kxlxszyldsjyz","text":"2.4 可训练稀疏注意力的设计原则"},{"level":2,"id":"s-xlsj-ultra-clean-y-ultra-chat-v2","text":"三、训练数据: UltraClean 与 UltraChat v2"},{"level":3,"id":"3-1-ultra-clean-yxlsjglysc","text":"3.1 UltraClean: 预训练数据过滤与生成"},{"level":3,"id":"3-2-ultra-chat-v2-jdwtsjj","text":"3.2 UltraChat v2: 监督微调数据集"},{"level":2,"id":"s-xlsf-model-tunnel-v2-yhxlyh","text":"四、训练算法: ModelTunnel v2 与后训练优化"},{"level":3,"id":"4-1-model-tunnel-v2-gxyxlclss","text":"4.1 ModelTunnel v2: 高效预训练策略搜索"},{"level":3,"id":"4-2-hxlyh","text":"4.2 后训练优化"},{"level":2,"id":"w-tlxt-cpm-cu-y-fr-spec","text":"五、推理系统: CPM.cu 与 FR-Spec"},{"level":3,"id":"5-1-cpm-cu-dcdztlyq","text":"5.1 CPM.cu: 端侧定制推理引擎"},{"level":3,"id":"5-2-fr-spec-kskfytjjm","text":"5.2 FR-Spec: 快速可复用投机解码"},{"level":3,"id":"5-3-ark-infer-kptbssp","text":"5.3 ArkInfer: 跨平台部署适配"},{"level":2,"id":"l-pg","text":"六、评估"},{"level":3,"id":"6-1-bzpc","text":"6.1 标准评测"},{"level":3,"id":"6-2-cwbpc","text":"6.2 长文本评测"},{"level":3,"id":"6-3-xspc","text":"6.3 效率评测"},{"level":2,"id":"q-mini-cpm4-1-hhtlmx","text":"七、MiniCPM4.1: 混合推理模型"},{"level":2,"id":"b-yyal","text":"八、应用案例"},{"level":3,"id":"8-1-mini-cpm4-survey-kxzssc","text":"8.1 MiniCPM4-Survey: 可信综述生成"},{"level":3,"id":"8-2-mini-cpm4-mcp-gjsyymxsxwxy","text":"8.2 MiniCPM4-MCP: 工具使用与模型上下文协议"},{"level":2,"id":"j-jlywlgz","text":"九、结论与未来工作"},{"level":2,"id":"fl","text":"附录"},{"level":3,"id":"a-syb","text":"A. 术语表"},{"level":3,"id":"b-hxgssy","text":"B. 核心公式索引"},{"level":3,"id":"c-mxpxdw","text":"C. 模型谱系定位"},{"level":3,"id":"d-gjsysjhz","text":"D. 关键实验数据汇总"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/11-mini-cpm-4.0/01-mini-cpm-4.0-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/11-mini-cpm-4.0/01-mini-cpm-4.0-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM4 技术报告精译</h1>
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
