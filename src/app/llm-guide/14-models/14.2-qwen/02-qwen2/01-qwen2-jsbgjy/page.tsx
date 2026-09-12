"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2 Technical Report 精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文: An Yang, Baosong Yang, Binyuan Hui, et al. &quot;Qwen2 Technical Report&quot;. arXiv:2407.10671, 2024.
原文链接: <a href="https://arxiv.org/abs/2407.10671">https://arxiv.org/abs/2407.10671</a></p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>本报告介绍了 Qwen2 系列, 这是我们大型语言模型与大型多模态模型的最新成员. 我们发布了一套全面的基础语言模型与指令微调语言模型, 参数范围从 0.5B 到 72B, 涵盖稠密模型与混合专家(Mixture-of-Experts, MoE)模型. Qwen2 超越了大多数先前的开源权重模型, 包括其前代 Qwen1.5, 并在语言理解、生成、多语言能力、编程、数学与推理等多样化基准测试上展现出与闭源模型相竞争的性能.</p>
<p>旗舰模型 Qwen2-72B 展现了卓越的性能: 作为基础语言模型, 其在 MMLU 上达到 84.2, GPQA 上 37.9, HumanEval 上 64.6, GSM8K 上 89.5, BBH 上 82.4. 指令微调变体 Qwen2-72B-Instruct 在 MT-Bench 上达到 9.1, Arena-Hard 上 48.1, LiveCodeBench 上 35.7. 此外, Qwen2 展现出强大的多语言能力, 精通约 30 种语言, 涵盖英语、中文、西班牙语、法语、德语、阿拉伯语、俄语、韩语、日语、泰语、越南语等, 凸显了其多功能性与全球覆盖范围.</p>
<p>为促进社区创新与可及性, 我们已在 Hugging Face 与 ModelScope 上公开提供 Qwen2 模型权重, 并在 GitHub 上提供了包括示例代码在内的补充材料. 这些平台还包含量化、微调与部署资源, 便于广泛的应用与研究.</p>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>自 ChatGPT 问世以来, 全球对大型语言模型(LLM)的热情持续高涨. Llama 系列的发布进一步点燃了开源社区对 GPT 级别本地 LLM 的兴趣. 近期, Claude-3 Opus 与 GPT-4o(omni)相继登顶 Chatbot Arena——一个备受认可的 LLM 人工评估平台. 此外, Llama-3 已成为最先进的开源权重模型系列, 缩小了与领先闭源模型的性能差距, 并被广泛认可为 GPT-4 级别.</p>
<p>越来越多的竞争性 LLM 正在追求类似 OpenAI GPT 系列的进步. 其中许多模型, 包括 Qwen、Mistral、Gemma 等, 均以开源权重方式发布.</p>
<p>近几个月来, 我们陆续推出了 Qwen 系列并演进至 Qwen1.5. 与此同时, 我们发布了视觉-语言模型 Qwen-VL 与音频-语言模型 Qwen-Audio. 在本工作中, 我们介绍 Qwen 大型语言模型与大型多模态模型家族的最新成员: <strong>Qwen2</strong>.</p>
<p>Qwen2 是一系列基于 Transformer 架构、采用 next-token prediction 训练的大型语言模型. 该系列包含基础语言模型(即预训练但未对齐人类偏好的模型)与指令微调模型(使用单轮与多轮指令遵循数据集进行微调, 适用于对话与 agent 场景). 我们的发布包含四个参数规模分别为 0.5B、1.5B、7B 与 72B 的稠密模型, 以及一个 57B 参数、每 token 激活 14B 参数的 MoE 模型. 较小的模型(Qwen2-0.5B 与 Qwen2-1.5B)专为智能手机、耳机、智能眼镜等便携设备上的轻量部署而设计. 较大的模型则适用于不同规模 GPU 上的部署.</p>
<p>所有模型均在包含超过 7 万亿 token 的高质量大规模数据集上进行预训练, 涵盖广泛的领域与语言. 相较于 Qwen 的早期版本, Qwen2 包含了更广泛的语言数据, 并提升了代码与数学内容的数量与质量. 这种丰富性被认为能够增强 LLM 的推理能力. 在后训练方面, 所有模型均经历了监督微调(SFT)与直接偏好优化(DPO, Rafailov et al., 2024), 通过与人类反馈学习来对齐人类偏好, 赋予模型有效遵循指令的能力.</p>
<p>我们对 Qwen2 与一系列基线模型(包括开源权重模型与可通过 API 访问的闭源模型)进行了全面评估. Qwen2 在基础语言能力与指令微调功能的评估中均超越了竞争模型. 具体而言, 我们的指令微调变体 Qwen2-72B-Instruct 在 MT-Bench 上得分 9.1, Arena-Hard 上 48.1, LiveCodeBench 上 35.7. 同时, 基础语言模型 Qwen2-72B 在 MMLU 上达到 84.2, GPQA 上 37.9, HumanEval 上 64.6, GSM8K 上 89.5, BBH 上 82.4.</p>
<blockquote>
<p><strong>技术思考 1.1 | 设计动机</strong>: Qwen2 的定位是「全尺寸覆盖 + 多语言能力」的通用 LLM 系列. 与 Llama-3 的「大力出奇迹」(405B 单一稠密模型)不同, Qwen2 选择了从端侧(0.5B)到服务器级(72B)的完整尺寸矩阵, 并专门强化中文与多语言能力. 这种策略的优势在于生态覆盖广度——从边缘设备到云端均可部署同一技术栈模型; 代价是单点性能上限可能不及集中全部资源训练的单一超大模型. Qwen2 的 MoE 变体(57B-A14B)也反映了当时业界对 MoE 效率的探索——以 14B 激活参数量对标 30B 稠密模型.</p>
</blockquote>
<blockquote>
<p><strong>技术思考 1.2 | 技术谱系</strong>: Qwen2 处于 Qwen1.5 与 Qwen2.5 之间的承上启下节点. 其核心技术选择——GQA、SwiGLU、RoPE、RMSNorm——均继承自 Qwen1.5 的架构传统, 而 MoE 设计中的细粒度专家与共享专家概念则受到 DeepSeek-MoE 的启发. 后训练中的 DPO + Online Merging Optimizer 策略则为后续 Qwen2.5 的规模化 RLHF 奠定了基础.</p>
</blockquote>
<hr>
<h2 id="2-tokenizer-ymxjg">2 Tokenizer 与模型架构</h2>
<p>本节介绍 Qwen2 的 tokenizer 与模型设计, 详述不同模型规模的架构与配置.</p>
<h3 id="2-1-tokenizer">2.1 Tokenizer</h3>
<p>沿用 Qwen 的设计, 我们采用基于 byte-level byte-pair encoding 的相同 tokenizer. 值得注意的是, 该 tokenizer 展现出高效的编码效率, 相较于替代方案具有更好的压缩率, 从而促进了 Qwen2 的多语言能力.</p>
<p>所有尺寸的模型共享一个包含 151,643 个常规 token 与 3 个控制 token 的词表. 由于分布式训练中的考虑, embedding 的有效尺寸更大.</p>
<blockquote>
<p><strong>技术思考 2.1 | 架构细节</strong>: Qwen 的词表设计(约 15 万 token)在当时的开源模型中属于较大规模. 相比之下, Llama-3 使用了 128K tokenizer, Gemma 使用 256K. 较大的词表意味着更细粒度的语义单元, 对中文、日文等字符集密度高的语言有天然优势——单个汉字可能就是一个 token, 而 Llama 的 BPE 通常需要将汉字拆成 2-3 个 token. 这直接解释了 Qwen2 在 C-Eval 与 CMMLU 上大幅领先 Llama-3-70B 的现象(91.0 vs 65.2). 代价是 embedding 层参数量更大, 但 Qwen2 对 embedding 层使用了参数共享(0.5B 与 1.5B)来部分缓解这一问题.</p>
</blockquote>
<h3 id="2-2-mxjg">2.2 模型架构</h3>
<p>Qwen2 系列本质上是基于 Transformer 架构的大型语言模型, 采用带因果掩码的自注意力机制. 该系列包含 4 种规模的稠密语言模型与一种 MoE 模型. 我们先介绍稠密模型的细节, 再深入 MoE 模型的独特属性.</p>
<h4 id="2-2-1-qwen2-cmmx">2.2.1 Qwen2 稠密模型</h4>
<p>Qwen2 稠密模型的架构由多个 Transformer 层组成, 每层配备因果注意力机制与 FFN. 与 Qwen 的关键差异如下:</p>
<p><strong>分组查询注意力(GQA)</strong>. 我们采用分组查询注意力(GQA, Ainslie et al., 2023)替代传统多头注意力(MHA). GQA 在推理过程中优化 KV cache 的使用, 显著提升吞吐量. 不同模型规模的 KV head 配置详见第 2.2.3 节.</p>
<p><strong>双块注意力与 YARN</strong>. 为扩展 Qwen2 的上下文窗口, 我们实现了双块注意力(DCA, An et al., 2024), 将长序列分割为可管理长度的块. 若输入可在单个块内处理, DCA 产生与原始注意力相同的结果; 否则, DCA 有效捕获块内与跨块 token 间的相对位置信息, 从而提升长上下文性能. 此外, 我们还采用 YARN(Peng et al., 2023)来重新缩放注意力权重以获得更好的长度外推能力.</p>
<p>此外, 我们沿用 Qwen 的设计: SwiGLU 激活函数、RoPE 位置编码、QKV 偏置、RMSNorm 与预归一化以保证训练稳定性.</p>
<h4 id="2-2-2-qwen2-hhzjmx">2.2.2 Qwen2 混合专家模型</h4>
<p>Qwen2 MoE 模型的架构与 Qwen1.5-MoE-A2.7B  closely mirrors. 作为原始 FFN 的替代, MoE FFN 由 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 个独立的 FFN 组成, 每个作为一个专家. 每个 token 根据门控网络 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi></mrow><annotation encoding="application/x-tex">G</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal">G</span></span></span></span> 分配的概率被定向到特定专家 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>E</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">E_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 进行计算:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi mathvariant="bold">p</mi><mo>=</mo><mrow><mi mathvariant="normal">s</mi><mi mathvariant="normal">o</mi><mi mathvariant="normal">f</mi><mi mathvariant="normal">t</mi><mi mathvariant="normal">m</mi><mi mathvariant="normal">a</mi><mi mathvariant="normal">x</mi></mrow><mrow><mo fence="true">(</mo><mi>G</mi><mrow><mo fence="true">(</mo><mi mathvariant="bold">x</mi><mo fence="true">)</mo></mrow><mo fence="true">)</mo></mrow><mo separator="true">,</mo><mspace width="1em"/><mi mathvariant="bold">y</mi><mo>=</mo><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><msub><mtext>top</mtext><mi>k</mi></msub><mrow><mo fence="true">(</mo><mtext mathvariant="bold">p</mtext><mo fence="true">)</mo></mrow></mrow></munder><msub><mi mathvariant="bold">p</mi><mi>i</mi></msub><msub><mi>E</mi><mi>i</mi></msub><mo stretchy="false">(</mo><mi mathvariant="bold">x</mi><mo stretchy="false">)</mo><mi mathvariant="normal">.</mi></mrow><annotation encoding="application/x-tex">\\mathbf{p} = \\mathrm{softmax}\\left(G\\left(\\mathbf{x}\\right)\\right), \\quad \\mathbf{y} = \\sum_{i \\in \\text{top}_k\\left({\\textbf{p}}\\right)} \\mathbf{p}_i E_i(\\mathbf{x}).</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6389em;vertical-align:-0.1944em;"></span><span class="mord mathbf">p</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathrm">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord mathnormal">G</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;">(</span><span class="mord mathbf">x</span><span class="mclose delimcenter" style="top:0em;">)</span></span><span class="mclose delimcenter" style="top:0em;">)</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mpunct">,</span><span class="mspace" style="margin-right:1em;"></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathbf" style="margin-right:0.016em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.5771em;vertical-align:-1.5271em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.05em;"><span style="top:-1.809em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">∈</span><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">top</span></span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2302em;"><span style="top:-2.2341em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2659em;"><span></span></span></span></span></span></span><span class="minner mtight"><span class="mopen mtight delimcenter" style="top:0em;"><span class="mtight">(</span></span><span class="mord mtight"><span class="mord text mtight"><span class="mord textbf mtight">p</span></span></span><span class="mclose mtight delimcenter" style="top:0em;"><span class="mtight">)</span></span></span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.5271em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0576em;">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0576em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathbf">x</span><span class="mclose">)</span><span class="mord">.</span></span></span></span></span><p>以下呈现 Qwen2 MoE 的关键设计考量.</p>
<p><strong>专家粒度</strong>. MoE 模型与稠密模型的关键结构差异在于 MoE 层包含多个 FFN, 每个作为一个独立专家. 因此, 从稠密架构迁移到 MoE 架构的一个直接策略是将每个专家的参数设置为原始稠密模型单个 FFN 的参数. 例如, 从 Mistral-7B 到 Mixtral 8x7B 的迁移, 涉及每次从 8 个专家中激活 2 个. 不同地, 我们的模型采用细粒度专家(DeepSeek-MoE), 创建更小规模的专家同时激活更多专家. 在总专家参数量与激活参数量相等的前提下, 细粒度专家提供更丰富的专家组合. 通过利用这些细粒度专家, Qwen2 MoE 促进更多样化与动态的专家利用, 从而增强整体性能与适应性.</p>
<p><strong>专家路由</strong>. 专家路由机制的设计对提升 MoE 模型性能至关重要. 近期, 在 MoE 层中同时整合共享专家与路由专用专家的趋势日益明显(Deepspeed-MoE, DeepSeek-MoE). 我们采用这一方法, 因为它便于跨任务应用共享专家, 同时为特定路由场景保留其他专家. 共享专家与专用专家的引入提供了一种更灵活高效的 MoE 路由机制开发方法.</p>
<p><strong>专家初始化</strong>. 我们以类似于 upcycling(Komatsuzaki et al., 2023)的方式初始化专家, 利用稠密模型的权重. 不同地, 我们的方法强调细粒度专家之间的多样化以增强模型的表征广度. 给定指定的专家中间维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>E</mtext></msub></mrow><annotation encoding="application/x-tex">h_{\\text{E}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">E</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>、专家数量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>n</mi></mrow><annotation encoding="application/x-tex">n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span></span></span></span> 与原始 FFN 中间维度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>h</mi><mtext>FFN</mtext></msub></mrow><annotation encoding="application/x-tex">h_{\\text{FFN}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 将 FFN 复制 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo fence="true">⌈</mo><mfrac><mrow><mi>n</mi><mo>×</mo><msub><mi>h</mi><mtext>E</mtext></msub></mrow><msub><mi>h</mi><mtext>FFN</mtext></msub></mfrac><mo fence="true">⌉</mo></mrow><annotation encoding="application/x-tex">\\left\\lceil \\frac{n \\times h_{\\text{E}}}{h_{\\text{FFN}}} \\right\\rceil</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.8em;vertical-align:-0.65em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size2">⌈</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8964em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">FFN</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4103em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">n</span><span class="mbin mtight">×</span><span class="mord mtight"><span class="mord mathnormal mtight">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3567em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord text mtight"><span class="mord mtight">E</span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1433em;"><span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4453em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size2">⌉</span></span></span></span></span></span> 次. 为促进每个 FFN 副本内部的多样性, 参数沿中间维度进行 shuffle. 随后, 从这些 FFN 副本中提取专家, 丢弃剩余维度. 对于每个细粒度专家, 50% 的参数被随机重新初始化. 此过程为专家初始化引入额外的随机性, 可能增强模型在训练期间的探索能力.</p>
<blockquote>
<p><strong>技术思考 2.2 | 架构细节</strong>: Qwen2 MoE 的设计体现了当时 MoE 研究的三条主线融合: (1) <strong>细粒度专家</strong> 来自 DeepSeek-MoE 的观察——小专家 × 多激活 &gt; 大专家 × 少激活; (2) <strong>共享专家</strong> 来自 Deepspeed-MoE 与 DeepSeek-MoE 的观察——固定一部分专家处理通用特征, 减少路由负载; (3) <strong>upcycling + shuffle + 50% 重初始化</strong> 是一种务实的初始化策略——从 7B 稠密模型出发, 复制并打乱权重来制造多样性, 再用 50% 随机初始化引入探索空间. 这一策略的核心假设是: 稠密模型已学到良好的通用表征, MoE 的任务是在此基础上学习「如何分工」, 而非从零开始.</p>
</blockquote>
<h4 id="2-2-3-mxpz">2.2.3 模型配置</h4>
<p>Qwen2 系列包含 5 种规模的模型: Qwen2-0.5B、Qwen2-1.5B、Qwen2-7B、Qwen2-57B-A14B 与 Qwen2-72B. 表 1 列出了超参数与重要信息(如预训练 token 数). 特别地, Qwen2-57B-A14B 由 Qwen2-7B 上采样而来. 值得注意的是, Qwen2 模型的每 token KV 尺寸相较于 Qwen1.5 模型显著降低, 这一特性在长上下文推理任务中尤为有利.</p>
<p><strong>表 1 | Qwen2 稠密与 MoE 模型的架构配置</strong></p>
<table>
<thead>
<tr>
<th align="left">Configuration</th>
<th align="center">0.5B</th>
<th align="center">1.5B</th>
<th align="center">7B</th>
<th align="center">72B</th>
<th align="center">57B-A14B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Hidden Size</td>
<td align="center">896</td>
<td align="center">1,536</td>
<td align="center">3,584</td>
<td align="center">8,192</td>
<td align="center">3,584</td>
</tr>
<tr>
<td align="left"># Layers</td>
<td align="center">24</td>
<td align="center">28</td>
<td align="center">28</td>
<td align="center">80</td>
<td align="center">28</td>
</tr>
<tr>
<td align="left"># Query Heads</td>
<td align="center">14</td>
<td align="center">12</td>
<td align="center">28</td>
<td align="center">64</td>
<td align="center">28</td>
</tr>
<tr>
<td align="left"># KV Heads</td>
<td align="center">2</td>
<td align="center">2</td>
<td align="center">4</td>
<td align="center">8</td>
<td align="center">4</td>
</tr>
<tr>
<td align="left">Head Size</td>
<td align="center">64</td>
<td align="center">128</td>
<td align="center">128</td>
<td align="center">128</td>
<td align="center">128</td>
</tr>
<tr>
<td align="left">Intermediate Size</td>
<td align="center">4,864</td>
<td align="center">8,960</td>
<td align="center">18,944</td>
<td align="center">29,568</td>
<td align="center">2,560</td>
</tr>
<tr>
<td align="left"># Routed Experts</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">64</td>
</tr>
<tr>
<td align="left"># Activated Experts</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">8</td>
</tr>
<tr>
<td align="left"># Shared Experts</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">8</td>
</tr>
<tr>
<td align="left">Embedding Tying</td>
<td align="center">True</td>
<td align="center">True</td>
<td align="center">False</td>
<td align="center">False</td>
<td align="center">False</td>
</tr>
<tr>
<td align="left">Vocabulary Size</td>
<td align="center">151,646</td>
<td align="center">151,646</td>
<td align="center">151,646</td>
<td align="center">151,646</td>
<td align="center">151,646</td>
</tr>
<tr>
<td align="left"># Trained Tokens</td>
<td align="center">12T</td>
<td align="center">7T</td>
<td align="center">7T</td>
<td align="center">7T</td>
<td align="center">4.5T</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>技术思考 2.3 | 数据实验</strong>: Qwen2-0.5B 使用 12T token 训练而其余稠密模型使用 7T, 这是一个有趣的设计选择. 论文解释称: 尝试放宽质量阈值得到 12T 数据集后, 模型性能并未显著优于 7T 模型, 因此大模型选用更高质量的 7T 数据集. 但 0.5B 小模型反而使用 12T——这可能是因为小模型的容量有限, 需要更多「遍历次数」来充分吸收数据. 从 scaling law 的角度看, 小模型通常处于「数据饥渴」区域, 增加 token 数比提升数据质量收益更大; 而大模型(72B)处于「质量敏感」区域, 低质量数据反而引入噪声.</p>
</blockquote>
<blockquote>
<p><strong>技术思考 2.4 | 局限性</strong>: Qwen2 的 MoE 模型仅训练了 4.5T token, 显著少于稠密模型的 7T. 论文中承认 MoE 模型在知识理解方面不及预期, 归因于预训练 token 不足. 这揭示了一个关键工程约束: MoE 的训练效率虽高(每次前向仅激活 14B), 但其收敛所需的总计算量未必低于稠密模型——因为专家路由机制需要更多 token 才能稳定学习. 这也解释了为何 DeepSeek-V2(236B-A21B)使用 8.1T token 且采用了更激进的负载均衡策略.</p>
</blockquote>
<hr>
<h2 id="3-yxl">3 预训练</h2>
<p>Qwen2 的预训练聚焦于数据集精修与扩展上下文长度的有效方法探索.</p>
<h3 id="3-1-yxlsj">3.1 预训练数据</h3>
<p>Qwen2 模型的预训练涉及构建一个全新的大规模高质量多语言数据集. 该数据集在 Qwen 与 Qwen1.5 所用语料的基础上进行了多维度提升:</p>
<ul>
<li><strong>质量提升</strong>: 过滤算法通过额外的启发式与基于模型的方法进行了精修, 包括使用 Qwen 模型过滤低质量数据, 并利用这些模型合成高质量预训练数据.</li>
<li><strong>数据扩展</strong>: 相较于 Qwen1.5, 我们收集了大量高质量的代码、数学与多语言数据, 增强模型在相应领域的能力. 新数据集支持约 30 种语言, 包括英语、中文、西班牙语、法语、德语、阿拉伯语、俄语、韩语、日语、泰语、越南语等.</li>
<li><strong>分布改善</strong>: 为确保模型学习类似于人类学习的分布, 我们对缩小规模模型进行实验, 优化来自不同来源与领域的数据混合比例.</li>
</ul>
<p>基于这些增强, 预训练数据从 Qwen1.5 的 3 万亿 token 扩展至 7 万亿 token. 尝试进一步放宽质量阈值得到 12 万亿 token 数据集后, 模型性能并未显著优于 7 万亿 token 模型. 推测增加数据量未必有利于模型预训练. 考虑训练成本, 我们选择使用更高质量的 7 万亿 token 数据集训练较大模型, 将进一步探索留给未来迭代.</p>
<p>所有 Qwen2 稠密模型(除 Qwen2-0.5B 外)均在此超过 7 万亿 token 的大规模数据集上预训练. Qwen2-0.5B 使用 12 万亿 token 数据集预训练. MoE 模型遵循 upcycling 原则额外接收 4.5 万亿 token 预训练. 与先前 Qwen 模型类似, 高质量多任务指令数据被整合进 Qwen2 预训练过程以增强上下文学习与指令遵循能力.</p>
<h3 id="3-2-csxwxl">3.2 长上下文训练</h3>
<p>为增强 Qwen2 的长上下文能力, 我们在预训练的最后阶段将上下文长度从 4,096 token 扩展至 32,768 token, 并引入大量高质量长数据. 同时, 我们将 RoPE 的基频从 10,000 修改为 1,000,000 以优化长上下文场景性能.</p>
<p>为充分利用模型的长度外推潜力, 我们采用 YARN 机制与双块注意力机制. 这些策略使模型能够处理长达 131,072 token 的序列, 同时保持高性能, 初步实验中最小化困惑度衰减.</p>
<blockquote>
<p><strong>技术思考 3.1 | 架构细节</strong>: Qwen2 的长上下文方案是「预训练阶段扩长 + 推理阶段外推」的组合策略. 预训练阶段仅扩展到 32K, 但通过 YARN(注意力温度缩放)与 DCA(块间相对位置编码)在推理时扩展到 128K. 这与 Llama-3.1 的「预训练直接到 128K」策略形成对比. Qwen2 的保守之处在于: 预训练到 128K 的算力成本极高, 而 YARN+DCA 的插值+外推组合可以在较低成本下实现可用性能. 实测显示 Qwen2-72B-Instruct 在 128K Needle in a Haystack 上达到近乎完美, NeedleBench 上 128K 仅下降 2 个点(91.9→90.3), 证明该策略的有效性.</p>
</blockquote>
<hr>
<h2 id="4-hxl">4 后训练</h2>
<p>大规模预训练之后, Qwen2 进入后训练阶段. 这一过程对于提升模型在编程、数学、逻辑推理、指令遵循与多语言理解等广泛领域的熟练度至关重要. 此外, 它确保模型生成与人类价值观一致, 做到有益、诚实与无害. 与传统严重依赖大量人工监督的方法不同, 我们的方法聚焦于可扩展对齐, 最小化人工标注(Cao et al., 2024). 具体而言, 我们探索获取高质量演示数据与偏好数据的方法, 用于 SFT 与 RLHF, 旨在最小化人工标注需求的同时最大化数据质量与可靠性.</p>
<h3 id="4-1-hxlsj">4.1 后训练数据</h3>
<p>后训练数据主要由两部分组成: 演示数据 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">D</mi><mo>=</mo><mo stretchy="false">{</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><mo separator="true">,</mo><msub><mi>y</mi><mi>i</mi></msub><mo stretchy="false">)</mo><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\mathcal{D} = \\{(x_i, y_i)\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0278em;">D</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)}</span></span></span></span> 与偏好数据 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">P</mi><mo>=</mo><mo stretchy="false">{</mo><mo stretchy="false">(</mo><msub><mi>x</mi><mi>i</mi></msub><mo separator="true">,</mo><msubsup><mi>y</mi><mi>i</mi><mo>+</mo></msubsup><mo separator="true">,</mo><msubsup><mi>y</mi><mi>i</mi><mo>−</mo></msubsup><mo stretchy="false">)</mo><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\mathcal{P} = \\{(x_i, y_i^+, y_i^-)\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0822em;">P</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mopen">{(</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">+</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">−</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mclose">)}</span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">x_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示指令, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">y_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 表示满意回复, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>y</mi><mi>i</mi><mo>+</mo></msubsup></mrow><annotation encoding="application/x-tex">y_i^+</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">+</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span> 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>y</mi><mi>i</mi><mo>−</mo></msubsup></mrow><annotation encoding="application/x-tex">y_i^-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">−</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span> 是对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>x</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">x_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的两个回复, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>y</mi><mi>i</mi><mo>+</mo></msubsup></mrow><annotation encoding="application/x-tex">y_i^+</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">+</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span> 优于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>y</mi><mi>i</mi><mo>−</mo></msubsup></mrow><annotation encoding="application/x-tex">y_i^-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">−</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span>. 集合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">D</mi></mrow><annotation encoding="application/x-tex">\\mathcal{D}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0278em;">D</span></span></span></span> 用于 SFT, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">P</mi></mrow><annotation encoding="application/x-tex">\\mathcal{P}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0822em;">P</span></span></span></span> 用于 RLHF.</p>
<p>数据构建包含两步: 协同数据标注与自动化数据合成. 首先, 我们从大规模指令语料中提取数据本体, 得到广泛多样且高质量的指令集. 这些指令被系统性地增强以纳入更大复杂性. 通过人工标注, 我们获得目标回复 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">y_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 及其正负对应物 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msubsup><mi>y</mi><mi>i</mi><mo>+</mo></msubsup><mo separator="true">,</mo><msubsup><mi>y</mi><mi>i</mi><mo>−</mo></msubsup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(y_i^+, y_i^-)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">+</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">−</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. 随后, 采用多种自动化对齐策略在代码、数学、指令遵循、创作、角色扮演与安全等领域合成大量人工标注数据.</p>
<h4 id="4-1-1-xtsjbz">4.1.1 协同数据标注</h4>
<ul>
<li><strong>自动本体提取</strong>: 使用 InsTag(Lu et al., 2023)——一个开放集细粒度标签器——从大规模指令数据集中提取底层本体, 随后进行人工精修以确保准确性.</li>
<li><strong>指令选择</strong>: 每个带标签的指令根据标签多样性、语义丰富度、复杂度与意图完整性进行评估. 基于这些标准, 我们选择一组代表性指令.</li>
<li><strong>指令演化</strong>: 为丰富指令数据集, 采用自演化策略(Zhao et al., 2024), 提示 Qwen 模型为现有指令添加约束或要求, 从而增加复杂度并确保数据集内难度范围的多样性.</li>
<li><strong>人工标注</strong>: 使用多样化生成策略与不同规模的 Qwen 模型获取多个回复. 标注者根据偏好对这些回复排序, 确保最佳回复满足既定标准, 同时产出演示数据与偏好数据.</li>
</ul>
<h4 id="4-1-2-zdhsjhc">4.1.2 自动化数据合成</h4>
<p>大规模上维持回复标注质量面临显著挑战, 特别是那些需要专业知识、经验、细心或耐心的指令. 为解决这些挑战, 我们设计了多种自动化对齐策略来大规模合成数据.</p>
<ul>
<li><strong>拒绝采样(Rejection Sampling)</strong>: 对于具有确定性最终答案的数学等任务, 应用拒绝采样(Yuan et al., 2023)来提升解答质量. LLM 为每个指令生成多个回复(即推理路径), 保留得出正确结论且被模型认为合理的路径作为演示数据. 偏好数据通过对比正确与错误路径生成.</li>
<li><strong>执行反馈(Execution Feedback)</strong>: 对于编程任务, 使用 LLM 生成解答与相关测试用例. 通过编译执行解答并针对测试用例评估其有效性, 创建演示数据与偏好数据. 该方法也可用于评估指令遵循(Dong et al., 2024): 对每个带约束的指令(如长度限制), 要求 LLM 生成 Python 验证函数以确保回复符合指令要求.</li>
<li><strong>数据再利用(Data Repurposing)</strong>: 为文学写作任务创建高质量回复对未经专业训练的标注者颇具挑战. 我们聚合公共领域的高质量文学作品, 使用 LLM 开发不同详细程度的指令. 这些指令与原始作品配对作为演示数据. 例如, 为汇编生动吸引人的角色扮演数据, 我们从 Wikipedia 等知识库获取详细角色档案, 指示 LLM 生成相应指令与回复(Lu et al., 2024). 这一过程类似于阅读理解任务, 确保角色档案的完整性得以保持.</li>
<li><strong>宪法反馈(Constitutional Feedback)</strong>: 宪法 AI 指引导 LLM 基于预定义原则集生成回复的过程(Bai et al., 2022). 为确保遵循安全与价值观等准则, 我们编制了宪法数据集, 明确应遵循与应避免的原则. 用于指示 LLM 生成符合或偏离这些准则的回复, 作为演示数据与偏好数据的参考.</li>
</ul>
<blockquote>
<p><strong>技术思考 4.1 | 数据实验</strong>: Qwen2 的后训练数据构建策略体现了「人机协同 + 自动化闭环」的工业化思路. 四种自动化策略各有侧重: 拒绝采样面向可验证任务(数学), 执行反馈面向可编译任务(代码), 数据再利用面向创造性任务(写作/角色扮演), 宪法反馈面向价值对齐任务(安全). 这种分类并非随意——它对应了 LLM 数据合成的四种验证信号: 答案正确性、编译/执行正确性、参考文本一致性、原则符合性. 这一框架的通用性很强, 后续 Qwen2.5 与 DeepSeek-R1 的数据合成流水线均可视为其扩展.</p>
</blockquote>
<h3 id="4-2-jdwt">4.2 监督微调</h3>
<p>我们汇编了一个包含超过 500,000 条示例的广泛指令数据集, 涵盖指令遵循、编程、数学、逻辑推理、角色扮演、多语言与安全等技能. 模型以 32,768 token 的序列长度微调两个 epoch. 为优化学习, 学习率从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>6</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7 \\times 10^{-6}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">6</span></span></span></span></span></span></span></span></span></span></span></span> 逐步降低至 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>7</mn><mo>×</mo><msup><mn>10</mn><mrow><mo>−</mo><mn>7</mn></mrow></msup></mrow><annotation encoding="application/x-tex">7 \\times 10^{-7}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">7</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord">1</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">7</span></span></span></span></span></span></span></span></span></span></span></span>. 为应对过拟合, 我们施加 0.1 的权重衰减并将梯度裁剪至最大值 1.0.</p>
<h3 id="4-3-jyrlfkdqhxx-rlhf">4.3 基于人类反馈的强化学习(RLHF)</h3>
<p>我们的 RLHF 训练包含两个顺序阶段: 离线训练与在线训练. 在离线训练阶段, 我们使用预编译的偏好数据集 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="script">P</mi></mrow><annotation encoding="application/x-tex">\\mathcal{P}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathcal" style="margin-right:0.0822em;">P</span></span></span></span>, 通过直接偏好优化(DPO, Rafailov et al., 2024)最大化 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>y</mi><mi>i</mi><mo>+</mo></msubsup></mrow><annotation encoding="application/x-tex">y_i^+</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">+</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span> 与 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>y</mi><mi>i</mi><mo>−</mo></msubsup></mrow><annotation encoding="application/x-tex">y_i^-</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.2769em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8115em;"><span style="top:-2.4231em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.1031em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">−</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span></span> 之间的似然差异. 在线训练阶段, 模型实时迭代优化性能, 利用奖励模型提供即时反馈. 具体而言, 我们从当前策略模型采样多个回复, 奖励模型选择最偏好与最不偏好的回复, 形成偏好对用于每轮 DPO. 此外, 我们采用 Online Merging Optimizer(Lu et al., 2024)来缓解对齐税(alignment tax), 即模型生成与人类偏好对齐相关的性能下降.</p>
<blockquote>
<p><strong>技术思考 4.2 | 架构细节</strong>: Qwen2 的 RLHF 采用「离线 DPO → 在线 DPO」的两阶段策略, 与 DeepSeek-R1 的纯 RL(无 SFT)形成有趣对比. 离线 DPO 利用人工标注的偏好对建立基础对齐; 在线 DPO 则通过奖励模型自动产生新的偏好对, 实现持续迭代. Online Merging Optimizer 的作用是约束策略模型不偏离参考模型太远——这类似于 PPO 中的 KL 散度惩罚, 但实现更轻量. 这种设计的关键假设是: 对齐税主要来源于策略模型在优化人类偏好时遗忘预训练知识, 通过定期与参考模型合并可保持知识稳定性.</p>
</blockquote>
<hr>
<h2 id="5-sy">5 实验</h2>
<p>为全面评估 Qwen2 模型(包括基础与指令微调模型), 我们实施了一套全面的评估方案. 该方案考察一系列能力, 包括通用知识理解、语言理解、生成、编程、数学、推理与其他专长领域. 基础模型通过 few-shot 提示在基准数据集上评估(另有说明除外). 指令微调模型除基准评估外, 还优先考虑人类偏好评估.</p>
<h3 id="5-1-jcyymx">5.1 基础语言模型</h3>
<p>本节展示 Qwen2 系列基础语言模型的评估. 具体而言, 我们在知识与基础能力基准数据集上评估模型, 并应用多语言基准数据集评估其语言支持. 由于存在多种模型规模, 我们与规模相似或更大的 SOTA 模型进行比较.</p>
<h4 id="5-1-1-hxnl">5.1.1 核心能力</h4>
<p><strong>基准与评估协议</strong>. 评估基础语言模型核心能力的常见做法是通过 few-shot 或 zero-shot 提示在基准数据集上评估. 评估主要聚焦于自然语言理解、通用问答、编程、数学、科学知识、推理等模型性能. 评估数据集包括: MMLU(5-shot)、MMLU-Pro(5-shot)、GPQA(5-shot)、Theorem QA(5-shot)、BBH(3-shot)、HellaSwag(10-shot)、Winogrande(5-shot)、TruthfulQA(0-shot)、ARC-C(25-shot)、HumanEval(0-shot)、MBPP(0-shot)、EvalPlus(0-shot)、MultiPL-E(0-shot, Python/C++/Java/PHP/TypeScript/C#/Bash/JavaScript)、GSM8K(5-shot)、MATH(4-shot)、C-Eval(5-shot)、CMMLU(5-shot). 多语言数据集分为四类: (a) 考试: M3Exam(5-shot, 仅选无需图像的示例)、IndoMMLU(3-shot)、ruMMLU(5-shot)、翻译版 MMLU(5-shot, 阿拉伯语/西班牙语/法语/葡萄牙语/德语/意大利语/日语/韩语); (b) 理解: BELEBELE(5-shot)、XCOPA(5-shot)、XWinograd(5-shot)、XStoryCloze(0-shot)、PAWS-X(5-shot); (c) 数学: MGSM(8-shot CoT); (d) 翻译: Flores-101(5-shot).</p>
<p><strong>Qwen2-72B</strong>. 作为 Qwen2 的最大模型, 我们将 Qwen2-72B 与 Mixtral-8x22B、Llama-3-70B、Qwen1.5-72B 及 Qwen1.5-110B 进行比较. 结果见表 2.</p>
<p><strong>表 2 | 70B+ 模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Mixtral-8x22B</th>
<th align="center">Llama-3-70B</th>
<th align="center">Qwen1.5-72B</th>
<th align="center">Qwen1.5-110B</th>
<th align="center">Qwen2-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>English</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">77.8</td>
<td align="center">79.5</td>
<td align="center">77.5</td>
<td align="center">80.4</td>
<td align="center"><strong>84.2</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">49.5</td>
<td align="center">52.8</td>
<td align="center">45.8</td>
<td align="center">49.4</td>
<td align="center"><strong>55.6</strong></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">34.3</td>
<td align="center">36.3</td>
<td align="center">36.3</td>
<td align="center">35.9</td>
<td align="center"><strong>37.9</strong></td>
</tr>
<tr>
<td align="left">Theorem QA</td>
<td align="center">35.9</td>
<td align="center">32.3</td>
<td align="center">29.3</td>
<td align="center">34.9</td>
<td align="center"><strong>43.1</strong></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">78.9</td>
<td align="center">81.0</td>
<td align="center">65.5</td>
<td align="center">74.8</td>
<td align="center"><strong>82.4</strong></td>
</tr>
<tr>
<td align="left">HellaSwag</td>
<td align="center"><strong>88.7</strong></td>
<td align="center">88.0</td>
<td align="center">86.0</td>
<td align="center">87.5</td>
<td align="center">87.6</td>
</tr>
<tr>
<td align="left">Winogrande</td>
<td align="center">85.0</td>
<td align="center"><strong>85.3</strong></td>
<td align="center">83.0</td>
<td align="center">83.5</td>
<td align="center">85.1</td>
</tr>
<tr>
<td align="left">ARC-C</td>
<td align="center"><strong>70.7</strong></td>
<td align="center">68.8</td>
<td align="center">65.9</td>
<td align="center">69.6</td>
<td align="center">68.9</td>
</tr>
<tr>
<td align="left">TruthfulQA</td>
<td align="center">51.0</td>
<td align="center">45.6</td>
<td align="center"><strong>59.6</strong></td>
<td align="center">49.6</td>
<td align="center">54.8</td>
</tr>
<tr>
<td align="left"><strong>Coding</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">46.3</td>
<td align="center">48.2</td>
<td align="center">46.3</td>
<td align="center">54.3</td>
<td align="center"><strong>64.6</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">71.7</td>
<td align="center">70.4</td>
<td align="center">66.9</td>
<td align="center">70.9</td>
<td align="center"><strong>76.9</strong></td>
</tr>
<tr>
<td align="left">EvalPlus</td>
<td align="center">54.1</td>
<td align="center">54.8</td>
<td align="center">52.9</td>
<td align="center">57.7</td>
<td align="center"><strong>65.4</strong></td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">46.7</td>
<td align="center">46.3</td>
<td align="center">41.8</td>
<td align="center">52.7</td>
<td align="center"><strong>59.6</strong></td>
</tr>
<tr>
<td align="left"><strong>Mathematics</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">83.7</td>
<td align="center">83.0</td>
<td align="center">79.5</td>
<td align="center">85.4</td>
<td align="center"><strong>89.5</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">41.7</td>
<td align="center">42.5</td>
<td align="center">34.1</td>
<td align="center">49.6</td>
<td align="center"><strong>51.1</strong></td>
</tr>
<tr>
<td align="left"><strong>Chinese</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">54.6</td>
<td align="center">65.2</td>
<td align="center">84.1</td>
<td align="center">89.1</td>
<td align="center"><strong>91.0</strong></td>
</tr>
<tr>
<td align="left">CMMLU</td>
<td align="center">53.4</td>
<td align="center">67.2</td>
<td align="center">83.5</td>
<td align="center">88.3</td>
<td align="center"><strong>90.1</strong></td>
</tr>
<tr>
<td align="left"><strong>Multilingual</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Exam</td>
<td align="center">63.5</td>
<td align="center">70.0</td>
<td align="center">66.4</td>
<td align="center">75.6</td>
<td align="center"><strong>76.6</strong></td>
</tr>
<tr>
<td align="left">Understanding</td>
<td align="center">77.7</td>
<td align="center">79.9</td>
<td align="center">78.2</td>
<td align="center">78.2</td>
<td align="center"><strong>80.7</strong></td>
</tr>
<tr>
<td align="left">Mathematics</td>
<td align="center">62.9</td>
<td align="center">67.1</td>
<td align="center">61.7</td>
<td align="center">64.4</td>
<td align="center"><strong>76.0</strong></td>
</tr>
<tr>
<td align="left">Translation</td>
<td align="center">23.3</td>
<td align="center"><strong>38.0</strong></td>
<td align="center">35.6</td>
<td align="center">36.2</td>
<td align="center">37.8</td>
</tr>
</tbody></table>
<p>Qwen2-72B 在通用知识理解(MMLU +4.7 vs Llama-3-70B)、科学评估(GPQA +1.6, Theorem QA +9.8)、编程(HumanEval +18.3 vs Qwen1.5-72B, MBPP +10.0)、数学(GSM8K +10.0, MATH +17.0)、推理(BBH)与中文(C-Eval +25.8 vs Llama-3-70B)方面均展现优势.</p>
<p><strong>Qwen2-57B-A14B</strong>. MoE 模型与 Mixtral-8x7B、Jamba、Yi-1.5-34B 及 Qwen1.5-32B 比较, 结果见表 3. Qwen2-57B-A14B 在自然语言理解方面与 Yi-1.5-34B 相当, 在编程与数学任务上超越基线模型, 中文理解能力媲美更大的 Qwen2-72B. 本质上, Qwen2-57B-A14B 是一个高效模型, 每次前向仅激活 14B 参数, 却维持 30B 稠密模型的性能水平.</p>
<p><strong>表 3 | 30B+ 稠密模型与 40B+ MoE 模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Jamba</th>
<th align="center">Mixtral-8x7B</th>
<th align="center">Yi-1.5-34B</th>
<th align="center">Qwen1.5-32B</th>
<th align="center">Qwen2-57B-A14B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Architecture</td>
<td align="center">MoE</td>
<td align="center">MoE</td>
<td align="center">Dense</td>
<td align="center">Dense</td>
<td align="center">MoE</td>
</tr>
<tr>
<td align="left"># Act Params</td>
<td align="center">12B</td>
<td align="center">12B</td>
<td align="center">32B</td>
<td align="center">34B</td>
<td align="center">14B</td>
</tr>
<tr>
<td align="left"># Params</td>
<td align="center">52B</td>
<td align="center">47B</td>
<td align="center">32B</td>
<td align="center">34B</td>
<td align="center">57B</td>
</tr>
<tr>
<td align="left"><strong>English</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">67.4</td>
<td align="center">71.8</td>
<td align="center"><strong>77.1</strong></td>
<td align="center">74.3</td>
<td align="center">76.5</td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">-</td>
<td align="center">41.0</td>
<td align="center"><strong>48.3</strong></td>
<td align="center">44.0</td>
<td align="center">43.0</td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">-</td>
<td align="center">29.2</td>
<td align="center">-</td>
<td align="center">30.8</td>
<td align="center"><strong>34.3</strong></td>
</tr>
<tr>
<td align="left">Theorem QA</td>
<td align="center">-</td>
<td align="center">23.2</td>
<td align="center">-</td>
<td align="center">28.8</td>
<td align="center"><strong>33.5</strong></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">45.4</td>
<td align="center">50.3</td>
<td align="center"><strong>76.4</strong></td>
<td align="center">66.8</td>
<td align="center">67.0</td>
</tr>
<tr>
<td align="left">HellaSwag</td>
<td align="center"><strong>87.1</strong></td>
<td align="center">86.5</td>
<td align="center">85.9</td>
<td align="center">85.0</td>
<td align="center">85.2</td>
</tr>
<tr>
<td align="left">Winogrande</td>
<td align="center">82.5</td>
<td align="center">81.9</td>
<td align="center"><strong>84.9</strong></td>
<td align="center">81.5</td>
<td align="center">79.5</td>
</tr>
<tr>
<td align="left">ARC-C</td>
<td align="center">64.4</td>
<td align="center"><strong>66.0</strong></td>
<td align="center">65.6</td>
<td align="center">63.6</td>
<td align="center">64.1</td>
</tr>
<tr>
<td align="left">TruthfulQA</td>
<td align="center">46.4</td>
<td align="center">51.1</td>
<td align="center">53.9</td>
<td align="center">57.4</td>
<td align="center"><strong>57.7</strong></td>
</tr>
<tr>
<td align="left"><strong>Coding</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">29.3</td>
<td align="center">37.2</td>
<td align="center">46.3</td>
<td align="center">43.3</td>
<td align="center"><strong>53.0</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">-</td>
<td align="center">63.9</td>
<td align="center">65.5</td>
<td align="center">64.2</td>
<td align="center"><strong>71.9</strong></td>
</tr>
<tr>
<td align="left">EvalPlus</td>
<td align="center">-</td>
<td align="center">46.4</td>
<td align="center">51.9</td>
<td align="center">50.4</td>
<td align="center"><strong>57.2</strong></td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">-</td>
<td align="center">39.0</td>
<td align="center">39.5</td>
<td align="center">38.5</td>
<td align="center"><strong>49.8</strong></td>
</tr>
<tr>
<td align="left"><strong>Mathematics</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">59.9</td>
<td align="center">62.5</td>
<td align="center"><strong>82.7</strong></td>
<td align="center">76.8</td>
<td align="center">80.7</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">-</td>
<td align="center">30.8</td>
<td align="center">41.7</td>
<td align="center">36.1</td>
<td align="center"><strong>43.0</strong></td>
</tr>
<tr>
<td align="left"><strong>Chinese</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">83.5</td>
<td align="center"><strong>87.7</strong></td>
</tr>
<tr>
<td align="left">CMMLU</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">84.8</td>
<td align="center">82.3</td>
<td align="center"><strong>88.5</strong></td>
</tr>
<tr>
<td align="left"><strong>Multilingual</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Exam</td>
<td align="center">-</td>
<td align="center">56.1</td>
<td align="center">58.3</td>
<td align="center">61.6</td>
<td align="center"><strong>65.5</strong></td>
</tr>
<tr>
<td align="left">Understanding</td>
<td align="center">-</td>
<td align="center">70.7</td>
<td align="center">73.9</td>
<td align="center">76.5</td>
<td align="center"><strong>77.0</strong></td>
</tr>
<tr>
<td align="left">Mathematics</td>
<td align="center">-</td>
<td align="center">45.0</td>
<td align="center">49.3</td>
<td align="center">56.1</td>
<td align="center"><strong>62.3</strong></td>
</tr>
<tr>
<td align="left">Translation</td>
<td align="center">-</td>
<td align="center">29.8</td>
<td align="center">30.0</td>
<td align="center">33.5</td>
<td align="center"><strong>34.5</strong></td>
</tr>
</tbody></table>
<p><strong>Qwen2-7B</strong>. 7B 模型广泛使用, 因其可在配备 16GB 显存的加速器上以 16 位浮点数运行. 我们与 Llama-3-8B、Mistral-7B-v0.2、Gemma-7B 及 Qwen1.5-7B 比较, 结果见表 4. Qwen2-7B 在大多数数据集上表现优异, 尤其在编程、数学与中文任务上.</p>
<p><strong>表 4 | 7B+ 模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Mistral-7B</th>
<th align="center">Gemma-7B</th>
<th align="center">Llama-3-8B</th>
<th align="center">Qwen1.5-7B</th>
<th align="center">Qwen2-7B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>English</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">64.2</td>
<td align="center">64.6</td>
<td align="center">66.6</td>
<td align="center">61.0</td>
<td align="center"><strong>70.3</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">30.9</td>
<td align="center">33.7</td>
<td align="center">35.4</td>
<td align="center">29.9</td>
<td align="center"><strong>40.0</strong></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">24.7</td>
<td align="center">25.7</td>
<td align="center">25.8</td>
<td align="center">26.7</td>
<td align="center"><strong>31.8</strong></td>
</tr>
<tr>
<td align="left">Theorem QA</td>
<td align="center">19.2</td>
<td align="center">21.5</td>
<td align="center">22.1</td>
<td align="center">14.2</td>
<td align="center"><strong>31.1</strong></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center">56.1</td>
<td align="center">55.1</td>
<td align="center">57.7</td>
<td align="center">40.2</td>
<td align="center"><strong>62.6</strong></td>
</tr>
<tr>
<td align="left">HellaSwag</td>
<td align="center"><strong>83.2</strong></td>
<td align="center">82.2</td>
<td align="center">82.1</td>
<td align="center">78.5</td>
<td align="center">80.7</td>
</tr>
<tr>
<td align="left">Winogrande</td>
<td align="center">78.4</td>
<td align="center"><strong>79.0</strong></td>
<td align="center">77.4</td>
<td align="center">71.3</td>
<td align="center">77.0</td>
</tr>
<tr>
<td align="left">ARC-C</td>
<td align="center">60.0</td>
<td align="center"><strong>61.1</strong></td>
<td align="center">59.3</td>
<td align="center">54.2</td>
<td align="center">60.6</td>
</tr>
<tr>
<td align="left">TruthfulQA</td>
<td align="center">42.2</td>
<td align="center">44.8</td>
<td align="center">44.0</td>
<td align="center">51.1</td>
<td align="center"><strong>54.2</strong></td>
</tr>
<tr>
<td align="left"><strong>Coding</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">29.3</td>
<td align="center">37.2</td>
<td align="center">33.5</td>
<td align="center">36.0</td>
<td align="center"><strong>51.2</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">51.1</td>
<td align="center">50.6</td>
<td align="center">53.9</td>
<td align="center">51.6</td>
<td align="center"><strong>65.9</strong></td>
</tr>
<tr>
<td align="left">EvalPlus</td>
<td align="center">36.4</td>
<td align="center">39.6</td>
<td align="center">40.3</td>
<td align="center">40.0</td>
<td align="center"><strong>54.2</strong></td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">29.4</td>
<td align="center">29.7</td>
<td align="center">22.6</td>
<td align="center">28.1</td>
<td align="center"><strong>46.3</strong></td>
</tr>
<tr>
<td align="left"><strong>Mathematics</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">52.2</td>
<td align="center">46.4</td>
<td align="center">56.0</td>
<td align="center">62.5</td>
<td align="center"><strong>79.9</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">13.1</td>
<td align="center">24.3</td>
<td align="center">20.5</td>
<td align="center">20.3</td>
<td align="center"><strong>44.2</strong></td>
</tr>
<tr>
<td align="left"><strong>Chinese</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">47.4</td>
<td align="center">43.6</td>
<td align="center">49.5</td>
<td align="center">74.1</td>
<td align="center"><strong>83.2</strong></td>
</tr>
<tr>
<td align="left">CMMLU</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">50.8</td>
<td align="center">73.1</td>
<td align="center"><strong>83.9</strong></td>
</tr>
<tr>
<td align="left"><strong>Multilingual</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Exam</td>
<td align="center">47.1</td>
<td align="center">42.7</td>
<td align="center">52.3</td>
<td align="center">47.7</td>
<td align="center"><strong>59.2</strong></td>
</tr>
<tr>
<td align="left">Understanding</td>
<td align="center">63.3</td>
<td align="center">58.3</td>
<td align="center">68.6</td>
<td align="center">67.6</td>
<td align="center"><strong>72.0</strong></td>
</tr>
<tr>
<td align="left">Mathematics</td>
<td align="center">26.3</td>
<td align="center">39.1</td>
<td align="center">36.3</td>
<td align="center">37.3</td>
<td align="center"><strong>57.5</strong></td>
</tr>
<tr>
<td align="left">Translation</td>
<td align="center">23.3</td>
<td align="center">31.2</td>
<td align="center"><strong>31.9</strong></td>
<td align="center">28.4</td>
<td align="center">31.5</td>
</tr>
</tbody></table>
<p><strong>Qwen2-1.5B &amp; Qwen2-0.5B</strong>. 小模型与 Phi-2、Gemma-2B 及 Qwen1.5-1.8B 比较, 结果见表 5. Qwen2-1.5B 在语言理解上超越 Phi-2. 编程方面, Qwen2-0.5B 与 Gemma-2B 和 Qwen1.5-1.8B 相当, Qwen2-1.5B 超越这些基线(除 Phi-2 外). 数学方面, 两个 Qwen2 模型均优于竞品. 中文理解上, 两个 Qwen2 模型均超越其他所有模型.</p>
<p><strong>表 5 | 小模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Phi-2</th>
<th align="center">Gemma-2B</th>
<th align="center">Qwen1.5-1.8B</th>
<th align="center">Qwen2-0.5B</th>
<th align="center">Qwen2-1.5B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"># Non-Emb Params</td>
<td align="center">2.5B</td>
<td align="center">2.0B</td>
<td align="center">1.2B</td>
<td align="center">0.3B</td>
<td align="center">1.2B</td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">52.7</td>
<td align="center">42.3</td>
<td align="center">46.8</td>
<td align="center">45.4</td>
<td align="center"><strong>56.5</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">-</td>
<td align="center">15.9</td>
<td align="center">-</td>
<td align="center">14.7</td>
<td align="center">21.8</td>
</tr>
<tr>
<td align="left">Theorem QA</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">8.9</td>
<td align="center"><strong>15.0</strong></td>
</tr>
<tr>
<td align="left">BBH</td>
<td align="center"><strong>43.4</strong></td>
<td align="center">35.2</td>
<td align="center">24.2</td>
<td align="center">28.4</td>
<td align="center">37.2</td>
</tr>
<tr>
<td align="left">HellaSwag</td>
<td align="center"><strong>73.1</strong></td>
<td align="center">71.4</td>
<td align="center">61.4</td>
<td align="center">49.3</td>
<td align="center">66.6</td>
</tr>
<tr>
<td align="left">Winogrande</td>
<td align="center"><strong>74.4</strong></td>
<td align="center">66.8</td>
<td align="center">60.3</td>
<td align="center">56.8</td>
<td align="center">66.2</td>
</tr>
<tr>
<td align="left">ARC-C</td>
<td align="center"><strong>61.1</strong></td>
<td align="center">48.5</td>
<td align="center">37.9</td>
<td align="center">31.5</td>
<td align="center">43.9</td>
</tr>
<tr>
<td align="left">TruthfulQA</td>
<td align="center">44.5</td>
<td align="center">33.1</td>
<td align="center">39.4</td>
<td align="center">39.7</td>
<td align="center"><strong>45.9</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center"><strong>47.6</strong></td>
<td align="center">22.0</td>
<td align="center">20.1</td>
<td align="center">22.0</td>
<td align="center">31.1</td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center"><strong>55.0</strong></td>
<td align="center">29.2</td>
<td align="center">18.0</td>
<td align="center">22.0</td>
<td align="center">37.4</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">57.2</td>
<td align="center">17.7</td>
<td align="center">38.4</td>
<td align="center">36.5</td>
<td align="center"><strong>58.5</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">3.5</td>
<td align="center">11.8</td>
<td align="center">10.1</td>
<td align="center">10.7</td>
<td align="center"><strong>21.7</strong></td>
</tr>
<tr>
<td align="left">C-Eval</td>
<td align="center">23.4</td>
<td align="center">28.0</td>
<td align="center">59.7</td>
<td align="center">58.2</td>
<td align="center"><strong>70.6</strong></td>
</tr>
<tr>
<td align="left">CMMLU</td>
<td align="center">24.2</td>
<td align="center">-</td>
<td align="center">57.8</td>
<td align="center">55.1</td>
<td align="center"><strong>70.3</strong></td>
</tr>
</tbody></table>
<p>总体而言, Qwen2 系列在不同模型规模上均展现优于基线的性能. 值得注意的是, Qwen2-72B 在所有 Qwen2 模型中性能最高, 凸显了模型规模扩展的有效性.</p>
<h3 id="5-2-zlwtmx">5.2 指令微调模型</h3>
<p>为批判性评估指令微调模型, 我们实施多维度方法. 基础技能与人类偏好评估通过开放数据集与基准进行. 详细的内部检验进一步探测模型在关键领域的能力. 特别关注长上下文能力评估. 安全措施包括多语言安全评估与 red teaming 演练.</p>
<h4 id="5-2-1-kfjzpg">5.2.1 开放基准评估</h4>
<p>为全面评估指令微调模型质量, 我们结合自动评估与人工评估来评估能力与人类偏好. 基础能力评估使用与预训练模型评估相似的数据集, 针对自然语言理解、编程、数学与推理. 此外, 我们通过 MT-Bench、Arena-Hard、AlignBench、MixEval 与 IFEval(报告 strict-prompt 子集结果)来评估人类偏好对齐与指令遵循性能.</p>
<p><strong>表 6 | 70B+ 指令微调模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Mixtral-8x22B</th>
<th align="center">Llama-3-70B</th>
<th align="center">Qwen1.5-72B</th>
<th align="center">Qwen1.5-110B</th>
<th align="center">Qwen2-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>English</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU</td>
<td align="center">74.0</td>
<td align="center">82.0</td>
<td align="center">75.6</td>
<td align="center">76.5</td>
<td align="center"><strong>82.3</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">56.1</td>
<td align="center">56.2</td>
<td align="center">51.7</td>
<td align="center">50.5</td>
<td align="center"><strong>64.4</strong></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center"><strong>49.7</strong></td>
<td align="center">41.9</td>
<td align="center">39.4</td>
<td align="center">32.8</td>
<td align="center">42.4</td>
</tr>
<tr>
<td align="left">Theorem QA</td>
<td align="center">40.8</td>
<td align="center">42.5</td>
<td align="center">28.8</td>
<td align="center">18.8</td>
<td align="center"><strong>44.4</strong></td>
</tr>
<tr>
<td align="left"><strong>Coding</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">56.1</td>
<td align="center">77.4</td>
<td align="center">69.5</td>
<td align="center">69.5</td>
<td align="center"><strong>86.0</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">62.4</td>
<td align="center">69.6</td>
<td align="center">55.4</td>
<td align="center">61.0</td>
<td align="center"><strong>80.2</strong></td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">46.9</td>
<td align="center">54.9</td>
<td align="center">43.7</td>
<td align="center">47.7</td>
<td align="center"><strong>62.6</strong></td>
</tr>
<tr>
<td align="left">LiveCodeBench</td>
<td align="center">18.9</td>
<td align="center">27.8</td>
<td align="center">24.4</td>
<td align="center">28.6</td>
<td align="center"><strong>35.7</strong></td>
</tr>
<tr>
<td align="left"><strong>Mathematics</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">78.6</td>
<td align="center">83.7</td>
<td align="center">81.1</td>
<td align="center">82.3</td>
<td align="center"><strong>93.2</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">28.4</td>
<td align="center">42.2</td>
<td align="center">37.5</td>
<td align="center">39.6</td>
<td align="center"><strong>69.0</strong></td>
</tr>
<tr>
<td align="left"><strong>Human Preference</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MT-Bench</td>
<td align="center">8.7</td>
<td align="center">9.0</td>
<td align="center">7.8</td>
<td align="center">8.2</td>
<td align="center"><strong>9.1</strong></td>
</tr>
<tr>
<td align="left">Arena-Hard</td>
<td align="center">46.2</td>
<td align="center">41.3</td>
<td align="center">26.8</td>
<td align="center">31.3</td>
<td align="center"><strong>48.1</strong></td>
</tr>
<tr>
<td align="left">AlignBench</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">7.6</td>
<td align="center">7.8</td>
<td align="center"><strong>8.0</strong></td>
</tr>
<tr>
<td align="left">MixEval</td>
<td align="center">65.7</td>
<td align="center">75.9</td>
<td align="center">69.1</td>
<td align="center">71.6</td>
<td align="center"><strong>77.2</strong></td>
</tr>
<tr>
<td align="left">IFEval strict-prompt</td>
<td align="center">56.6</td>
<td align="center">76.0</td>
<td align="center">56.2</td>
<td align="center">58.6</td>
<td align="center"><strong>69.2</strong></td>
</tr>
</tbody></table>
<p>Qwen2-72B-Instruct 在核心能力与人类偏好对齐方面均展现优势. 与 Llama-3-70B-Instruct 相比, 在知识(MMLU +0.3)、数学(GSM8K +9.5, MATH +26.8)与编程(HumanEval +8.6, LiveCodeBench +7.9)方面均有显著提升. 在人工偏好评估中, MT-Bench(+0.1)、Arena-Hard(+6.8)与 IFEval(-6.8)各有优劣.</p>
<p><strong>表 7 | 7B+ 指令微调模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Mistral-7B</th>
<th align="center">Gemma-7B</th>
<th align="center">Llama-3-8B</th>
<th align="center">Qwen1.5-7B</th>
<th align="center">Qwen2-7B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">60.7</td>
<td align="center">53.0</td>
<td align="center">68.4</td>
<td align="center">62.2</td>
<td align="center"><strong>70.5</strong></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">34.3</td>
<td align="center">22.9</td>
<td align="center">37.5</td>
<td align="center">29.4</td>
<td align="center"><strong>43.5</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">33.5</td>
<td align="center">25.0</td>
<td align="center">60.4</td>
<td align="center">44.5</td>
<td align="center"><strong>79.9</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">45.7</td>
<td align="center">33.1</td>
<td align="center">57.6</td>
<td align="center">46.0</td>
<td align="center"><strong>67.2</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">40.0</td>
<td align="center">24.3</td>
<td align="center">77.6</td>
<td align="center">60.9</td>
<td align="center"><strong>85.7</strong></td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">12.6</td>
<td align="center">11.8</td>
<td align="center">29.9</td>
<td align="center">22.4</td>
<td align="center"><strong>52.9</strong></td>
</tr>
<tr>
<td align="left">MT-Bench</td>
<td align="center">7.2</td>
<td align="center">6.2</td>
<td align="center">8.0</td>
<td align="center">7.2</td>
<td align="center"><strong>8.3</strong></td>
</tr>
<tr>
<td align="left">Arena-Hard</td>
<td align="center">19.4</td>
<td align="center">6.0</td>
<td align="center">21.2</td>
<td align="center">11.7</td>
<td align="center"><strong>35.2</strong></td>
</tr>
<tr>
<td align="left">IFEval strict-prompt</td>
<td align="center">38.2</td>
<td align="center">27.4</td>
<td align="center">57.8</td>
<td align="center">42.4</td>
<td align="center"><strong>54.7</strong></td>
</tr>
</tbody></table>
<p>Qwen2-7B-Instruct 在所有基准上均大幅领先, 尤其在数学(MATH +23.0 vs Llama-3-8B)与编程(HumanEval +19.5)方面.</p>
<p><strong>表 8 | 小指令微调模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">Qwen1.5-0.5B</th>
<th align="center">Qwen2-0.5B</th>
<th align="center">Qwen1.5-1.8B</th>
<th align="center">Qwen2-1.5B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMLU</td>
<td align="center">29.2</td>
<td align="center"><strong>38.5</strong></td>
<td align="center">44.1</td>
<td align="center"><strong>52.4</strong></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">10.4</td>
<td align="center"><strong>29.9</strong></td>
<td align="center">27.4</td>
<td align="center"><strong>47.0</strong></td>
</tr>
<tr>
<td align="left">MBPP</td>
<td align="center">14.5</td>
<td align="center"><strong>37.8</strong></td>
<td align="center">28.6</td>
<td align="center"><strong>51.9</strong></td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">11.3</td>
<td align="center"><strong>40.1</strong></td>
<td align="center">35.3</td>
<td align="center"><strong>61.6</strong></td>
</tr>
<tr>
<td align="left">IFEval strict-prompt</td>
<td align="center">14.6</td>
<td align="center"><strong>20.0</strong></td>
<td align="center">16.8</td>
<td align="center"><strong>29.0</strong></td>
</tr>
</tbody></table>
<p>Qwen2 小模型在核心能力与指令遵循任务上均显著优于前代. 这主要归因于预训练数据的扩展——数据缩放即使在亚十亿参数模型领域仍是提升性能的有效策略.</p>
<h4 id="5-2-2-nbzdpg">5.2.2 内部自动评估</h4>
<p>尽管存在众多开放基准数据集, 我们认为这远不足以全面理解 LLM 的能力. 因此, 我们制作了一系列内部数据集评估模型的不同能力(知识理解、文本生成、编程等), 评估涵盖中文与英文, 结果分别见表 9 与表 10.</p>
<p><strong>表 9 | Qwen2-Instruct 模型在内部中文自动评估基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">Models</th>
<th align="center">Knowledge</th>
<th align="center">Exam</th>
<th align="center">Comprehension</th>
<th align="center">Coding</th>
<th align="center">Math</th>
<th align="center">Reasoning</th>
<th align="center">Avg.</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Proprietary LLMs</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GPT-4o-2024-05-13</td>
<td align="center">66.68</td>
<td align="center">69.04</td>
<td align="center">76.85</td>
<td align="center">59.58</td>
<td align="center">71.16</td>
<td align="center">69.94</td>
<td align="center">68.87</td>
</tr>
<tr>
<td align="left">Qwen-Max-0428</td>
<td align="center">76.65</td>
<td align="center">74.80</td>
<td align="center">73.66</td>
<td align="center">49.48</td>
<td align="center">66.01</td>
<td align="center">70.84</td>
<td align="center">68.57</td>
</tr>
<tr>
<td align="left"><strong>Qwen1.5 Series</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Qwen1.5-0.5B-Chat</td>
<td align="center">28.55</td>
<td align="center">36.99</td>
<td align="center">29.70</td>
<td align="center">3.82</td>
<td align="center">13.10</td>
<td align="center">25.47</td>
<td align="center">22.94</td>
</tr>
<tr>
<td align="left">Qwen1.5-1.8B-Chat</td>
<td align="center">30.31</td>
<td align="center">44.98</td>
<td align="center">44.81</td>
<td align="center">6.86</td>
<td align="center">29.85</td>
<td align="center">34.61</td>
<td align="center">31.90</td>
</tr>
<tr>
<td align="left">Qwen1.5-7B-Chat</td>
<td align="center">56.77</td>
<td align="center">59.36</td>
<td align="center">55.50</td>
<td align="center">18.85</td>
<td align="center">46.41</td>
<td align="center">48.77</td>
<td align="center">47.61</td>
</tr>
<tr>
<td align="left">Qwen1.5-32B-Chat</td>
<td align="center">68.63</td>
<td align="center">67.59</td>
<td align="center">64.67</td>
<td align="center">35.28</td>
<td align="center">60.62</td>
<td align="center">62.87</td>
<td align="center">59.94</td>
</tr>
<tr>
<td align="left">Qwen1.5-72B-Chat</td>
<td align="center">71.52</td>
<td align="center">70.04</td>
<td align="center">66.70</td>
<td align="center">38.22</td>
<td align="center">63.09</td>
<td align="center">61.30</td>
<td align="center">61.81</td>
</tr>
<tr>
<td align="left">Qwen1.5-110B-Chat</td>
<td align="center">76.26</td>
<td align="center">74.00</td>
<td align="center">71.25</td>
<td align="center">44.25</td>
<td align="center">64.92</td>
<td align="center">64.47</td>
<td align="center">65.86</td>
</tr>
<tr>
<td align="left"><strong>Qwen2 Series</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Qwen2-0.5B-Instruct</td>
<td align="center">28.18</td>
<td align="center"><strong>38.09</strong></td>
<td align="center"><strong>35.90</strong></td>
<td align="center"><strong>9.40</strong></td>
<td align="center"><strong>21.20</strong></td>
<td align="center"><strong>25.61</strong></td>
<td align="center"><strong>26.40</strong></td>
</tr>
<tr>
<td align="left">Qwen2-1.5B-Instruct</td>
<td align="center"><strong>35.46</strong></td>
<td align="center"><strong>51.93</strong></td>
<td align="center">44.70</td>
<td align="center"><strong>14.05</strong></td>
<td align="center"><strong>34.58</strong></td>
<td align="center"><strong>35.94</strong></td>
<td align="center"><strong>36.11</strong></td>
</tr>
<tr>
<td align="left">Qwen2-7B-Instruct</td>
<td align="center"><strong>61.54</strong></td>
<td align="center"><strong>66.66</strong></td>
<td align="center"><strong>59.63</strong></td>
<td align="center"><strong>34.74</strong></td>
<td align="center"><strong>60.99</strong></td>
<td align="center"><strong>58.22</strong></td>
<td align="center"><strong>56.96</strong></td>
</tr>
<tr>
<td align="left">Qwen2-57B-A14B-Instruct</td>
<td align="center">64.15</td>
<td align="center"><strong>73.67</strong></td>
<td align="center"><strong>67.52</strong></td>
<td align="center"><strong>40.66</strong></td>
<td align="center"><strong>63.90</strong></td>
<td align="center">59.89</td>
<td align="center"><strong>61.63</strong></td>
</tr>
<tr>
<td align="left">Qwen2-72B-Instruct</td>
<td align="center"><strong>76.19</strong></td>
<td align="center"><strong>75.65</strong></td>
<td align="center"><strong>74.72</strong></td>
<td align="center"><strong>49.53</strong></td>
<td align="center"><strong>70.80</strong></td>
<td align="center"><strong>70.59</strong></td>
<td align="center"><strong>69.58</strong></td>
</tr>
</tbody></table>
<p>中文评估中, Qwen2-72B-Instruct 超越参数大得多的 Qwen1.5-110B-Chat. MoE 模型在大多数领域优于 Qwen1.5-32B-Chat, 知识理解除外——这可能归因于预训练 token 不足.</p>
<p><strong>表 10 | Qwen2-Instruct 模型在内部英文自动评估基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">Models</th>
<th align="center">Knowledge</th>
<th align="center">Comprehension</th>
<th align="center">Coding</th>
<th align="center">Math</th>
<th align="center">Avg.</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Proprietary LLMs</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GPT-4o-2024-05-13</td>
<td align="center">87.29</td>
<td align="center">76.30</td>
<td align="center">55.87</td>
<td align="center">84.99</td>
<td align="center">76.11</td>
</tr>
<tr>
<td align="left">Qwen-Max-0428</td>
<td align="center">80.73</td>
<td align="center">71.63</td>
<td align="center">48.76</td>
<td align="center">79.12</td>
<td align="center">70.06</td>
</tr>
<tr>
<td align="left"><strong>Qwen1.5 Series</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Qwen1.5-0.5B-Chat</td>
<td align="center">30.12</td>
<td align="center">25.44</td>
<td align="center">1.78</td>
<td align="center">15.48</td>
<td align="center">18.21</td>
</tr>
<tr>
<td align="left">Qwen1.5-7B-Chat</td>
<td align="center">64.86</td>
<td align="center">58.61</td>
<td align="center">20.79</td>
<td align="center">54.24</td>
<td align="center">49.62</td>
</tr>
<tr>
<td align="left">Qwen1.5-32B-Chat</td>
<td align="center">76.38</td>
<td align="center">64.70</td>
<td align="center">37.39</td>
<td align="center">73.04</td>
<td align="center">62.88</td>
</tr>
<tr>
<td align="left">Qwen1.5-72B-Chat</td>
<td align="center">77.59</td>
<td align="center">67.58</td>
<td align="center">37.30</td>
<td align="center">73.76</td>
<td align="center">64.06</td>
</tr>
<tr>
<td align="left"><strong>Llama-3 Series</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Llama-3-8B-Instruct</td>
<td align="center">71.01</td>
<td align="center">64.71</td>
<td align="center">42.56</td>
<td align="center">65.82</td>
<td align="center">61.03</td>
</tr>
<tr>
<td align="left">Llama-3-70B-Instruct</td>
<td align="center">83.06</td>
<td align="center">76.31</td>
<td align="center">57.18</td>
<td align="center">79.70</td>
<td align="center">74.06</td>
</tr>
<tr>
<td align="left"><strong>Qwen2 Series</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Qwen2-0.5B-Instruct</td>
<td align="center"><strong>43.19</strong></td>
<td align="center"><strong>29.57</strong></td>
<td align="center"><strong>6.95</strong></td>
<td align="center"><strong>31.52</strong></td>
<td align="center"><strong>27.81</strong></td>
</tr>
<tr>
<td align="left">Qwen2-1.5B-Instruct</td>
<td align="center"><strong>56.03</strong></td>
<td align="center"><strong>45.08</strong></td>
<td align="center"><strong>17.61</strong></td>
<td align="center"><strong>50.44</strong></td>
<td align="center"><strong>42.29</strong></td>
</tr>
<tr>
<td align="left">Qwen2-7B-Instruct</td>
<td align="center"><strong>73.75</strong></td>
<td align="center">63.09</td>
<td align="center">36.41</td>
<td align="center"><strong>75.67</strong></td>
<td align="center"><strong>62.23</strong></td>
</tr>
<tr>
<td align="left">Qwen2-57B-A14B-Instruct</td>
<td align="center"><strong>76.80</strong></td>
<td align="center"><strong>67.92</strong></td>
<td align="center"><strong>42.37</strong></td>
<td align="center"><strong>77.04</strong></td>
<td align="center"><strong>66.03</strong></td>
</tr>
<tr>
<td align="left">Qwen2-72B-Instruct</td>
<td align="center">83.00</td>
<td align="center">73.58</td>
<td align="center">53.03</td>
<td align="center"><strong>82.15</strong></td>
<td align="center">72.94</td>
</tr>
</tbody></table>
<p>英文评估中, Qwen2 与 Qwen1.5 和 Llama-3 进行比较. Qwen2 小模型显著超越 Qwen1.5 对应模型. 然而, 与 Llama-3-70B-Instruct 相比, Qwen2-72B-Instruct 在理解与编程方面略逊. 我们推测英语预训练 token 数量与后训练数据的数量和多样性导致了英文性能差距.</p>
<blockquote>
<p><strong>技术思考 5.1 | 局限性</strong>: Qwen2-72B-Instruct 在英文理解(Comprehension: 73.58 vs Llama-3-70B-Instruct 76.31)与编程(Coding: 53.03 vs 57.18)上略逊于 Llama-3-70B-Instruct, 尽管其在数学上反超(82.15 vs 79.70). 论文坦诚地将此归因于「英语预训练 token 数量与后训练数据多样性」. 这是一个关键洞察: 多语言模型在「非母语」上的表现不仅取决于总 token 数, 更取决于该语言在预训练与后训练中的占比与质量. Llama-3 以英语为中心设计(虽支持多语言但重心在英语), 而 Qwen2 的中英双语平衡策略在中文上获得了巨大收益(C-Eval 91.0 vs 65.2), 但在纯英语任务上付出了一定代价. 这种权衡是语言模型设计的根本张力之一.</p>
</blockquote>
<h4 id="5-2-3-csxwnl">5.2.3 长上下文能力</h4>
<p>采用三种方法评估长上下文能力: Needle in a Haystack(NIAH)、NeedleBench 与 LV-Eval.</p>
<p><strong>Needle in a Haystack</strong>. 本实验评估模型在大量文本中定位事实的能力. 构造了 8K、16K、...、128K token 长度的文本, 事实被策略性地置于不同深度. 每个深度区间(如 0% 到 10%)包含两个实例. 超过 32K 的上下文使用 YARN. 如图 1 所示, Qwen2-72B-Instruct 在整个 128K 上下文中展现出卓越的信息检索准确性. 同系列模型中, Qwen2-7B-Instruct 可高精度处理 128K 上下文, Qwen2-57B-A14B-Instruct 可熟练处理 64K 上下文, 两个更小模型支持 32K 上下文.</p>
<p><img src="/llm-guide/14-models/14.2-qwen/02-qwen2/01-qwen2-jsbgjy/images/needle_in_haystack.pdf" alt="图 1 | Qwen2 指令微调模型在 Needle in a Haystack 测试上的性能. 所有支持超过 32K 上下文长度的模型均集成了 YARN 机制."></p>
<p><strong>表 11 | Qwen2-72B-Instruct 与 Qwen2-7B-Instruct 在 NeedleBench 与 LV-Eval 上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">Datasets</th>
<th align="center">NeedleBench</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
<th align="center">LV-Eval</th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td align="left"></td>
<td align="center">8k</td>
<td align="center">32k</td>
<td align="center">128k</td>
<td align="center">256k</td>
<td align="center">16k</td>
<td align="center">32k</td>
<td align="center">64k</td>
<td align="center">128k</td>
<td align="center">256k</td>
</tr>
<tr>
<td align="left">ChatGLM4-9B-1M</td>
<td align="center">56.61</td>
<td align="center">49.15</td>
<td align="center">44.30</td>
<td align="center">45.29</td>
<td align="center">46.40</td>
<td align="center">43.23</td>
<td align="center">42.92</td>
<td align="center">40.41</td>
<td align="center">36.95</td>
</tr>
<tr>
<td align="left">Qwen2-7B-Instruct</td>
<td align="center">87.07</td>
<td align="center">73.64</td>
<td align="center">38.77</td>
<td align="center">2.92</td>
<td align="center">49.77</td>
<td align="center">46.93</td>
<td align="center">28.03</td>
<td align="center">11.01</td>
<td align="center">0.55</td>
</tr>
<tr>
<td align="left">Qwen2-7B + YARN + DCA</td>
<td align="center"></td>
<td align="center"></td>
<td align="center">66.32</td>
<td align="center">60.71</td>
<td align="center"></td>
<td align="center"></td>
<td align="center">42.14</td>
<td align="center">36.64</td>
<td align="center">34.72</td>
</tr>
<tr>
<td align="left">Qwen2-72B-Instruct</td>
<td align="center"><strong>91.90</strong></td>
<td align="center"><strong>92.01</strong></td>
<td align="center">73.05</td>
<td align="center">17.13</td>
<td align="center"><strong>58.82</strong></td>
<td align="center"><strong>56.70</strong></td>
<td align="center">42.92</td>
<td align="center">31.79</td>
<td align="center">2.88</td>
</tr>
<tr>
<td align="left">Qwen2-72B + YARN + DCA</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"><strong>90.27</strong></td>
<td align="center"><strong>85.21</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"><strong>53.03</strong></td>
<td align="center"><strong>48.83</strong></td>
<td align="center"><strong>42.35</strong></td>
</tr>
</tbody></table>
<p><strong>NeedleBench</strong>. NeedleBench 提升了 NIAH 的挑战性, 在段落中包含多个事实(2-5 个), 要求同时识别并进行多跳推理. 表 11 显示 YARN 与 DCA 的整合显著提升了 Qwen2 模型的长上下文能力. Qwen2-7B-Instruct 超越声称 1M 上下文长度的 ChatGLM4-9B-1M.</p>
<p><strong>LV-Eval</strong>. LV-Eval 包含 11 个多样化的 QA 数据集, 要求同时理解多个证据片段. 为修正原始指标过于严格导致高假阴性率的问题, 我们采用关键词召回率作为报告分数. 如表 11 所示, YARN 与 DCA 的整合大幅增强了 Qwen2 模型在 LV-Eval 上的长上下文能力. Qwen2-72B-Instruct 在所有长度上均表现强劲, 确认其处理长上下文任务的能力.</p>
<h4 id="5-2-4-dyypg">5.2.4 多语言评估</h4>
<p>多语言评估实施全面的人工评估. 具体而言, 我们设计多样化的测试用例评估 LLM 的不同能力, 测试用例涵盖多种语言. 每个语言邀请一名专业标注者进行评估. 每个测试用例中, 标注者对模型回复进行 1-5 分评分.</p>
<p><strong>表 12 | Qwen2-72B-Instruct 与闭源 LLM 在多语言人工评估中的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">Language</th>
<th align="center">GPT-3.5-Turbo</th>
<th align="center">GPT-4-Turbo</th>
<th align="center">GPT-4o</th>
<th align="center">Claude-3-Opus</th>
<th align="center">Qwen2-72B-Instruct</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Arabic</td>
<td align="center">2.52</td>
<td align="center">3.44</td>
<td align="center">3.55</td>
<td align="center">4.15</td>
<td align="center">3.86</td>
</tr>
<tr>
<td align="left">French</td>
<td align="center">3.47</td>
<td align="center">4.19</td>
<td align="center">4.16</td>
<td align="center">4.23</td>
<td align="center">4.01</td>
</tr>
<tr>
<td align="left">Indonesian</td>
<td align="center">3.56</td>
<td align="center">4.09</td>
<td align="center">4.39</td>
<td align="center">4.40</td>
<td align="center">3.83</td>
</tr>
<tr>
<td align="left">Japanese</td>
<td align="center">2.75</td>
<td align="center">3.68</td>
<td align="center">3.72</td>
<td align="center">3.85</td>
<td align="center">3.63</td>
</tr>
<tr>
<td align="left">Korean</td>
<td align="center">2.37</td>
<td align="center">4.24</td>
<td align="center">4.40</td>
<td align="center">4.23</td>
<td align="center">4.14</td>
</tr>
<tr>
<td align="left">Portuguese</td>
<td align="center">3.37</td>
<td align="center">3.86</td>
<td align="center">3.89</td>
<td align="center">4.09</td>
<td align="center">3.97</td>
</tr>
<tr>
<td align="left">Russian</td>
<td align="center">3.24</td>
<td align="center">4.27</td>
<td align="center">4.32</td>
<td align="center">4.25</td>
<td align="center">4.15</td>
</tr>
<tr>
<td align="left">Spanish</td>
<td align="center">4.07</td>
<td align="center">4.08</td>
<td align="center">4.26</td>
<td align="center">4.31</td>
<td align="center">4.10</td>
</tr>
<tr>
<td align="left">Thai</td>
<td align="center">3.38</td>
<td align="center">4.11</td>
<td align="center">4.09</td>
<td align="center">4.01</td>
<td align="center">3.75</td>
</tr>
<tr>
<td align="left">Vietnamese</td>
<td align="center">3.90</td>
<td align="center">3.84</td>
<td align="center">4.14</td>
<td align="center">3.98</td>
<td align="center">3.91</td>
</tr>
<tr>
<td align="left"><strong>Average</strong></td>
<td align="center"><strong>3.16</strong></td>
<td align="center"><strong>3.98</strong></td>
<td align="center"><strong>4.09</strong></td>
<td align="center"><strong>4.15</strong></td>
<td align="center"><strong>3.93</strong></td>
</tr>
</tbody></table>
<p>平均而言, Qwen2-72B-Instruct 显著优于 GPT-3.5-Turbo, 与 GPT-4-Turbo 相当, 略逊于 Claude-3-Opus. 这表明多语言预训练与指令微调数据对 Qwen2-72B-Instruct 的多语言能力有所贡献, 使其与大多数最先进的闭源 LLM 具有竞争力.</p>
<h4 id="5-2-5-aqyzr">5.2.5 安全与责任</h4>
<p>开源权重 LLM 有效加速了研究与应用的发展. 此外, 我们认为构建安全负责的 LLM 至关重要, 以显著减轻 AI 技术误用的影响.</p>
<p>我们实施多语言安全评估, 在不同语言中测试 LLM. 具体而言, 我们在非法行为、欺诈、色情与隐私等主题上评估模型的安全性能. 我们收集了易于 jail-breaking 的提示, 测试模型是否能通过拒绝提供安全回复.</p>
<p><strong>表 13 | 模型在安全评估中的性能(越低越好)</strong></p>
<table>
<thead>
<tr>
<th align="left">Risk Category</th>
<th align="center">GPT-4</th>
<th align="center">Mixtral-8x22B</th>
<th align="center">Qwen2-72B-Instruct</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Illegal</td>
<td align="center">0.00</td>
<td align="center">6.87</td>
<td align="center">0.00</td>
</tr>
<tr>
<td align="left">Fraud</td>
<td align="center">3.40</td>
<td align="center">8.49</td>
<td align="center">2.41</td>
</tr>
<tr>
<td align="left">Pornography</td>
<td align="center">23.63</td>
<td align="center">33.82</td>
<td align="center">22.91</td>
</tr>
<tr>
<td align="left">Privacy</td>
<td align="center">3.37</td>
<td align="center">15.03</td>
<td align="center">2.47</td>
</tr>
</tbody></table>
<p>Qwen2-72B-Instruct 优于闭源模型 GPT-4, 显著优于开源权重模型 Mixtral-8x22B-Instruct. 然而, 我们认为模型在成为更安全更负责的模型方面仍有很大提升空间, 尤其在色情方面——这是一个传统上即使对人类也难以区分的类别.</p>
<h4 id="5-2-6-sjwrfx">5.2.6 数据污染分析</h4>
<p>对于 LLM, 何谓污染以及如何运行污染分析仍是活跃的研究领域. 以下先介绍我们如何尝试对训练语料进行去污染, 再估计剩余污染对基准分数的影响程度.</p>
<p>在构建预训练与后训练数据集时, 我们使用 n-gram 匹配排除潜在污染数据. 然而, 我们发现该方法可能导致高假阴性率, 因为可能存在常见表达(尤其在数学与代码数据中). 因此, 我们还应用了基于最长公共子序列(LCS)的另一约束: 对训练序列 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">s</mi><mi>t</mi></msub></mrow><annotation encoding="application/x-tex">\\mathbf{s}_t</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>, 若存在测试序列 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="bold">s</mi><mi>e</mi></msub></mrow><annotation encoding="application/x-tex">\\mathbf{s}_e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5944em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 使得 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∣</mi><mtext>LCS</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">s</mi><mi>t</mi></msub><mo separator="true">,</mo><msub><mi mathvariant="bold">s</mi><mi>e</mi></msub><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mo>≥</mo><mn>13</mn></mrow><annotation encoding="application/x-tex">|\\text{LCS}(\\mathbf{s}_t, \\mathbf{s}_e)| \\geq 13</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∣</span><span class="mord text"><span class="mord">LCS</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">13</span></span></span></span> 且 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">∣</mi><mtext>LCS</mtext><mo stretchy="false">(</mo><msub><mi mathvariant="bold">s</mi><mi>t</mi></msub><mo separator="true">,</mo><msub><mi mathvariant="bold">s</mi><mi>e</mi></msub><mo stretchy="false">)</mo><mi mathvariant="normal">∣</mi><mo>≥</mo><mn>0.6</mn><mo>×</mo><mi>min</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi mathvariant="normal">∣</mi><msub><mi mathvariant="bold">s</mi><mi>t</mi></msub><mi mathvariant="normal">∣</mi><mo separator="true">,</mo><mi mathvariant="normal">∣</mi><msub><mi mathvariant="bold">s</mi><mi>e</mi></msub><mi mathvariant="normal">∣</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">|\\text{LCS}(\\mathbf{s}_t, \\mathbf{s}_e)| \\geq 0.6 \\times \\min(|\\mathbf{s}_t|, |\\mathbf{s}_e|)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">∣</span><span class="mord text"><span class="mord">LCS</span></span><span class="mopen">(</span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord">∣</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">0.6</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">min</span><span class="mopen">(</span><span class="mord">∣</span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">t</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">∣</span><span class="mord"><span class="mord mathbf">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">e</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mclose">)</span></span></span></span>, 则移除该训练序列.</p>
<p>为评估数据泄露对测试性能的潜在影响, 我们构建「严格非污染」测试集: 排除与预训练或后训练数据有 13-gram 重叠的任何样本(不对 LCS 施加约束), 然后计算相应指标.</p>
<p><strong>表 14 | 数据污染分析</strong></p>
<table>
<thead>
<tr>
<th align="left">Test set</th>
<th align="center">Contamination %</th>
<th align="center">Qwen2-72B-Instruct</th>
<th align="center"></th>
<th align="center"></th>
<th align="center">Qwen2-7B-Instruct</th>
<th align="center"></th>
<th align="center"></th>
</tr>
</thead>
<tbody><tr>
<td align="left"></td>
<td align="center"></td>
<td align="center">Original</td>
<td align="center">Non-Conta.</td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
</tbody></table>
<p>| Delta | Original | Non-Conta.</p>
<p>| Delta |
| MMLU | 11.2% | 82.3 | 83.2 | 0.9 | 70.5 | 71.3 | 0.8 |
| MMLU-Pro | 11.6% | 64.4 | 65.6 | 1.2 | 44.1 | 46.5 | 2.4 |
| GPQA | 1.0% | 42.4 | 41.8 | -0.6 | 34.3 | 34.1 | -0.2 |
| HumanEval | 75.0% | 86.0 | 87.0 | 1.0 | 79.9 | 87.8 | 7.9 |
| MBPP | 29.6% | 80.2 | 79.7 | -0.5 | 67.2 | 69.0 | 1.8 |
| MultiPL-E | 37.7% | 69.2 | 69.2 | 0.0 | 59.1 | 58.9 | -0.2 |
| GSM8K | 0.7% | 93.2 | 92.8 | -0.4 | 85.7 | 85.6 | -0.1 |
| MATH | 31.7% | 69.0 | 74.6 | 5.6 | 52.9 | 57.6 | 4.7 |
| IFEval | 0.9% | 77.6 | 77.4 | -0.2 | 54.7 | 53.7 | -1.0 |</p>
<p>尽管某些数据集在严格标准下表现出高污染率, 但我们注意到大多数被识别的「污染」样本是假阳性, 主要源于数学与代码数据集. 某些代码片段与数学公式极为常见, 并未在解决测试数据时提供任何有意义的帮助.  furthermore, 分析显示 Qwen2 模型在原始测试数据与非污染测试数据上的性能保持一致, 表明数据污染问题并未显著影响模型性能.</p>
<blockquote>
<p><strong>技术思考 5.2 | 数据实验</strong>: 污染分析表中最引人注目的数据是 HumanEval 的 75%「污染率」. 这看似惊人, 但论文解释这些主要是假阳性——常见代码片段(如函数签名、标准库导入)被匹配到训练数据中. 更有说服力的是 GPQA(1.0% 污染, 性能变化 -0.6)与 GSM8K(0.7% 污染, 变化 -0.4), 这些极低污染率且性能变化微小的数据集表明, Qwen2 的核心能力并非来自数据记忆. MATH 的 31.7% 污染率伴随 5.6 点的性能提升(去污染后从 69.0 升到 74.6), 这可能暗示部分 MATH 训练数据与测试题有实质性重叠——但考虑到 MATH 是难度极高的竞赛数学数据集, 即使存在少量泄露, 69.0 的原始分数本身已是当时 SOTA 级别.</p>
</blockquote>
<hr>
<h2 id="6-jl">6 结论</h2>
<p>本技术报告介绍了 Qwen2 系列, 一套参数范围从 0.5B 到 72B 的基础与指令微调语言模型, 涵盖稠密与 MoE 架构. Qwen2 超越了先前的开源权重模型, 尤其是其前代 Qwen1.5, 并在语言理解、生成、多语言能力、编程、数学与推理等广泛基准测试中展现出与闭源模型相竞争的性能.</p>
<p>本次更新特别聚焦于长上下文、多语言、编程、数学能力与安全责任. 为致力于促进社区创新与可及性, 我们已公开提供 Qwen2 模型权重, 使研究人员与开发者能够在各种应用与研究项目中充分发挥 Qwen2 的潜力. 通过这些努力, 我们旨在为 AI 技术的进步及其对社会的积极影响做出贡献.</p>
<blockquote>
<p><strong>技术思考 6.1 | 技术谱系</strong>: Qwen2 的技术遗产可沿三条主线追溯: (1) <strong>架构</strong>: GQA + SwiGLU + RoPE + RMSNorm 构成当代 LLM 的标准配方, Qwen2 的贡献在于将其系统性地应用于从 0.5B 到 72B 的全尺寸矩阵, 并引入 DCA+YARN 解决长上下文问题; (2) <strong>MoE</strong>: 细粒度专家 + 共享/路由专家 + upcycling 初始化构成一套完整的 MoE 工程方案, 直接影响了后续 Qwen2.5 的 MoE 设计; (3) <strong>数据与对齐</strong>: 7T 高质量多语言数据 + 四种自动化合成策略(拒绝采样/执行反馈/数据再利用/宪法反馈) + 离线/在线 DPO 两阶段 RLHF, 形成了工业化后训练的完整流水线. 这些技术选择共同定义了 Qwen2 在 2024 年中期的开源 LLM 标杆地位.</p>
</blockquote>
<hr>
<p><em>本文件为 Qwen2 技术报告(arXiv:2407.10671)的中文精译, 遵循逐段翻译、信息零增删原则. 原文 PDF 见 <code>pdfs/Qwen2-Technical-Report.pdf</code>.</em></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-tokenizer-ymxjg","text":"2 Tokenizer 与模型架构"},{"level":3,"id":"2-1-tokenizer","text":"2.1 Tokenizer"},{"level":3,"id":"2-2-mxjg","text":"2.2 模型架构"},{"level":4,"id":"2-2-1-qwen2-cmmx","text":"2.2.1 Qwen2 稠密模型"},{"level":4,"id":"2-2-2-qwen2-hhzjmx","text":"2.2.2 Qwen2 混合专家模型"},{"level":4,"id":"2-2-3-mxpz","text":"2.2.3 模型配置"},{"level":2,"id":"3-yxl","text":"3 预训练"},{"level":3,"id":"3-1-yxlsj","text":"3.1 预训练数据"},{"level":3,"id":"3-2-csxwxl","text":"3.2 长上下文训练"},{"level":2,"id":"4-hxl","text":"4 后训练"},{"level":3,"id":"4-1-hxlsj","text":"4.1 后训练数据"},{"level":4,"id":"4-1-1-xtsjbz","text":"4.1.1 协同数据标注"},{"level":4,"id":"4-1-2-zdhsjhc","text":"4.1.2 自动化数据合成"},{"level":3,"id":"4-2-jdwt","text":"4.2 监督微调"},{"level":3,"id":"4-3-jyrlfkdqhxx-rlhf","text":"4.3 基于人类反馈的强化学习(RLHF)"},{"level":2,"id":"5-sy","text":"5 实验"},{"level":3,"id":"5-1-jcyymx","text":"5.1 基础语言模型"},{"level":4,"id":"5-1-1-hxnl","text":"5.1.1 核心能力"},{"level":3,"id":"5-2-zlwtmx","text":"5.2 指令微调模型"},{"level":4,"id":"5-2-1-kfjzpg","text":"5.2.1 开放基准评估"},{"level":4,"id":"5-2-2-nbzdpg","text":"5.2.2 内部自动评估"},{"level":4,"id":"5-2-3-csxwnl","text":"5.2.3 长上下文能力"},{"level":4,"id":"5-2-4-dyypg","text":"5.2.4 多语言评估"},{"level":4,"id":"5-2-5-aqyzr","text":"5.2.5 安全与责任"},{"level":4,"id":"5-2-6-sjwrfx","text":"5.2.6 数据污染分析"},{"level":2,"id":"6-jl","text":"6 结论"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/02-qwen2/01-qwen2-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/02-qwen2/01-qwen2-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2 Technical Report 精译</h1>
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
