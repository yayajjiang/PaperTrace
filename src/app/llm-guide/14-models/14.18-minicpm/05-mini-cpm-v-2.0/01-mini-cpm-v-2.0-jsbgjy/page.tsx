"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V 2.0 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文标题: MiniCPM-V: A GPT-4V Level MLLM on Your Phone
原文链接: <a href="https://arxiv.org/abs/2408.01800">https://arxiv.org/abs/2408.01800</a>
发布日期: 2024-04-20(模型发布), 2024-08-03(技术报告 arXiv)
发布机构: OpenBMB(面壁智能), Tsinghua University(清华大学 NLP 实验室)
模型规模: 2.8B 总参数(MiniCPM-2.4B + SigLIP-400M)
开源协议: Apache 2.0
备注: 本文基于 MiniCPM-V 系列技术报告(arXiv:2408.01800)精译, 该报告系统介绍了 MiniCPM-V 1.0/2.0/2.5 三代模型的架构与训练方法. 本节聚焦 V 2.0 的技术细节与实验结果.</p>
</blockquote>
<hr>
<h2 id="zy-abstract">摘要 (Abstract)</h2>
<p>近年来, 多模态大语言模型(Multimodal Large Language Models, MLLMs)的迅猛发展从根本上重塑了 AI 研究与产业的格局, 为下一个 AI 里程碑指明了有希望的方向. 然而, 显著的挑战仍然阻碍着 MLLMs 在实际应用中的落地. 最突出的挑战来自于运行一个拥有庞大参数量和大量计算的 MLLM 所带来的巨大成本. 因此, 大多数 MLLM 只能部署在高性能的云服务器上, 这极大地限制了它们的应用范围, 例如移动设备、离线场景、能耗敏感场景以及隐私保护场景.</p>
<p>在这项工作中, 我们提出了 MiniCPM-V, 一系列可部署在端侧设备上的高效 MLLM. 通过整合架构、预训练和对齐方面的最新 MLLM 技术, MiniCPM-V 系列具有若干显著特性: (1) 强大的性能, 在 OpenCompass 综合评测的 11 个主流基准上超越更大规模的模型; (2) 强大的 OCR 能力和 180 万像素任意长宽比的高分辨率图像感知; (3) 可信的行为, 具有较低的幻觉率; (4) 多语言支持; (5) 高效的端侧部署. 更重要的是, MiniCPM-V 可以被视为一个代表趋势的典型案例: 达到可用性能水平(如 GPT-4V 级别)所需的模型规模正在迅速缩小, 而端侧设备的计算能力正在快速增长. 这两个趋势的交汇表明, 在端侧设备上部署 GPT-4V 级别的 MLLM 正变得越来越可行, 在不久的将来解锁更广泛的现实世界 AI 应用.</p>
<blockquote>
<p>译者注: MiniCPM-V 2.0 的发布时间是 2024 年 4 月, 比这篇综合技术报告(arXiv:2408.01800)早了约 4 个月. 这意味着 V 2.0 的技术细节实际上在论文发表前就已经固定, 论文中的架构描述(Section 3)和训练方法(Section 4)对 V 2.0 同样适用. 值得注意的是, V 2.0 使用的是 RLHF-V 对齐技术, 而论文中重点介绍的 RLAIF-V 是后续在 V 2.5 上采用的改进方案. 这一点在理解两代模型的差异时需要特别留意.</p>
</blockquote>
<hr>
<h2 id="1-yy-introduction">1 引言 (Introduction)</h2>
<p>多模态大语言模型(MLLMs)的快速发展在理解、推理和交互方面带来了令人印象深刻的多模态能力激增. 这不仅从根本上重塑了 AI 研究和产业的格局, 也为下一个 AI 里程碑指明了有希望的路径. 然而, 当前的 MLLMs 在实际应用中仍远未成熟. 一个最主要的挑战是, 当前的 MLLM 通常需要大量的参数并施加沉重的计算负担. 因此, 大多数 MLLM 只能部署在高性能的云服务器上, 导致显著的能源消耗和碳排放. 这种限制严重制约了潜在的应用范围, 例如移动设备、能耗敏感场景、没有稳定网络连接的离线场景, 以及个人和工业用户的隐私/安全保护场景.</p>
<p>鉴于这些限制, 探索更高效的轻量化 MLLM 以在端侧设备上运行越来越引起人们的兴趣. 端侧场景涵盖更广泛的设备, 包括移动电话、个人电脑、车辆和机器人等, 这些设备在用户日常生活中无处不在, 且计算能力正在快速提升. 端侧 MLLM 由于其更广泛的使用范围、更好的计算效率、更 robust 的离线行为以及更好的隐私/安全保护, 为更实际的应用提供了有希望的解决方案.</p>
<p>然而, 开发有能力的端侧 MLLM 是具有挑战性的, 因为参数和推理计算预算受到显著限制. 因此, 需要更仔细的架构设计和训练配方来充分释放端侧 MLLM 的潜力. 在这项工作中, 我们提出了 MiniCPM-V, 一系列可部署在端侧设备上的高效 MLLM.</p>
<p>MiniCPM-V 的哲学是在性能和效率之间取得良好的平衡, 这是实际应用中更重要的目标. 截至 2024 年, 我们已推出了三代模型:</p>
<ol>
<li><strong>2024 年 2 月</strong>: MiniCPM-V 1.0 2B 发布, 是首批为手机设计的 MLLM 之一.</li>
<li><strong>2024 年 4 月</strong>: MiniCPM-V 2.0 2B 发布, 在性能上超越了强大的更大规模 MLLM, 如 Qwen-VL 9B、CogVLM 17B 和 Yi-VL 34B. 这一代还引入了对高分辨率图像输入的支持, 并展现出 promising 的 OCR 能力.</li>
<li><strong>2024 年 5 月</strong>: MiniCPM-Llama3-V 2.5 8B 发布, 在 OpenCompass 评测上超越了 GPT-4V-1106、Gemini Pro 和 Claude 3.</li>
</ol>
<blockquote>
<p>译者注: 从时间线上看, MiniCPM-V 的迭代速度非常快——从 1.0 到 2.0 仅用了 2 个月, 从 2.0 到 2.5 又只用了 1 个月. 这种快速迭代并非简单的参数堆砌, 而是每一步都有明确的技术聚焦: 1.0 验证端侧多模态的可行性, 2.0 通过 LLaVA-UHD 技术解决高分辨率 OCR 的痛点, 2.5 通过 RLAIF-V 和更强的 LLM 基座(Llama-3 8B)将性能推到 GPT-4V 级别. 这种&quot;小步快跑&quot;的策略与面壁智能在基座模型上的方法论一致: 先验证核心假设, 再快速迭代优化.</p>
</blockquote>
<hr>
<h2 id="2-xggz-related-work">2 相关工作 (Related Work)</h2>
<h3 id="2-1-dmtdyymx">2.1 多模态大语言模型</h3>
<p>LLMs 的发展显著推动了 MLLMs 的进展. Flamingo 首次提出将预训练的视觉编码器与 Chinchilla 70B LLM 连接, 并展示了 MLLM 在一系列视觉语言任务上的 zero-shot 和 few-shot 能力.</p>
<p>在 ChatGPT 出现后, 许多开源模型被提出, 包括 BLIP-2、Kosmos-1、MiniGPT-4、LLaVA 和 VPGTrans. 其中, 大多数基于现有的预训练 LLM 如 Llama 和 Vicuna 构建, 而 Kosmos-1 尝试从头训练 LLM.</p>
<p>后来, 研究人员继续扩展 MLLMs 的功能范围并提升视觉感知能力. Kosmos-2、CogVLM、Shikra 和 NExT-Chat 进一步将定位能力整合到 MLLMs 中. Qwen-VL-Chat、Yi-VL、DeepSeek-VL、InternVL 和 Intern-XComposer 则更注重通过高分辨率输入、更多训练数据和更好的数据比例来提升模型能力.</p>
<h3 id="2-2-dcdmtdyymx">2.2 端侧多模态大语言模型</h3>
<p>MLLMs 庞大的参数量在训练和部署中都带来了过高的计算成本, 极大地限制了广泛应用. 最近, 构建参数量更少的较小 LLM 成为一种趋势, 代表性模型包括 Phi、Gemma、MobileLLM 和 MiniCPM 等. 这些模型的中等规模使它们适用于端侧设备.</p>
<p>通过优化的训练策略, 端侧 LLM 如 MiniCPM 2B 可以达到与强大的 7B 模型如 Llama2-7B 相当的性能. 类似的趋势也出现在 MLLMs 中. 例如, Mini-Gemini 和 PaliGemma 基于 Gemma 2B 构建, MobileVLM V2 基于 MobileLlama 构建.</p>
<p>然而, 端侧 MLLM 的参数较少特性给构建一个有能力的模型带来了显著挑战. MiniCPM-V 系列旨在通过架构、训练、推理和部署方面的精心设计来解决关键瓶颈问题, 从而推进端侧 MLLM 的潜力.</p>
<blockquote>
<p>译者注: 端侧 MLLM 的&quot;参数焦虑&quot;比端侧 LLM 更严重. 一个 2B 的 LLM 可以接受, 但加上一个 400M 的视觉编码器和额外的投影层后, 总参数量达到 2.8B, 内存占用和推理开销会显著增加. 更棘手的是视觉 token 的数量: 一张 1344x1344 的图像如果直接输入 ViT, 可能产生数万个 patch token, 远超文本 token 的数量, 导致 attention 计算的二次方复杂度爆炸. MiniCPM-V 的核心创新之一——Perceiver Resampler 压缩层——正是为了解决这个痛点.</p>
</blockquote>
<hr>
<h2 id="3-mxjg-model-architecture">3 模型架构 (Model Architecture)</h2>
<h3 id="3-1-ztjg">3.1 整体结构</h3>
<p>模型包含三个关键模块: 视觉编码器(visual encoder)、压缩层(compression layer)和 LLM. 输入图像首先通过视觉编码器进行编码, 采用自适应视觉编码方法. 具体而言, 我们使用 SigLIP SoViT-400m/14 作为视觉编码器. 视觉 token 随后通过压缩层进行压缩, 该压缩层采用具有单层 cross-attention 的 perceiver resampler 结构. 最后, 压缩后的视觉 token 与文本输入一起送入 LLM 进行条件文本生成.</p>
<table>
<thead>
<tr>
<th>组件</th>
<th>V 1.0</th>
<th>V 2.0</th>
<th>Llama3-V 2.5</th>
</tr>
</thead>
<tbody><tr>
<td>LLM</td>
<td>MiniCPM-2B</td>
<td>MiniCPM-2B</td>
<td>Llama-3-8B-Instruct</td>
</tr>
<tr>
<td>视觉编码器</td>
<td>SigLIP-400M</td>
<td>SigLIP-400M</td>
<td>SigLIP-400M</td>
</tr>
<tr>
<td>压缩层 queries</td>
<td>64</td>
<td>64</td>
<td>96</td>
</tr>
<tr>
<td>最大分辨率</td>
<td>224x224</td>
<td>180 万像素</td>
<td>180 万像素</td>
</tr>
<tr>
<td>任意长宽比</td>
<td>否</td>
<td>是</td>
<td>是</td>
</tr>
<tr>
<td>总参数</td>
<td>2.8B</td>
<td>2.8B</td>
<td>8.5B</td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: MiniCPM-V 系列三代模型的关键配置对比. V 2.0 相比 1.0 的核心升级在于引入了 LLaVA-UHD 技术支持的高分辨率任意长宽比图像输入.</p>
</blockquote>
<h3 id="3-2-zsysjbm-adaptive-visual-encoding">3.2 自适应视觉编码 (Adaptive Visual Encoding)</h3>
<p>最近, 越来越多的共识认为视觉编码在 MLLM 性能中扮演着基础性的角色, 尤其对于 OCR 等细粒度能力. 为了有效性, 一个好的视觉编码策略应该既尊重输入的原始长宽比, 又保留足够的视觉细节(高分辨率). 为了效率, 来自图像编码的视觉 token 数量应该适中, 以便在端侧设备上可承受.</p>
<p>为此, 我们采用了 LLaVA-UHD 提出的自适应视觉编码方法.</p>
<h4 id="txfp-image-partition">图像分片 (Image Partition)</h4>
<p>为了处理不同长宽比的高分辨率图像, 我们将图像划分为多个切片, 每个切片在分辨率和长宽比方面更好地匹配 ViT 的预训练设置.</p>
<p>具体而言, 我们首先根据输入图像大小计算理想的切片数量. 给定分辨率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>W</mi><mi>I</mi></msub><mo separator="true">,</mo><msub><mi>H</mi><mi>I</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(W_I, H_I)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的图像和预训练在分辨率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>W</mi><mi>v</mi></msub><mo separator="true">,</mo><msub><mi>H</mi><mi>v</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(W_v, H_v)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的图像上的 ViT, 我们计算理想切片数:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>N</mi><mo>=</mo><mrow><mo fence="true">⌈</mo><mfrac><mrow><msub><mi>W</mi><mi>I</mi></msub><mo>×</mo><msub><mi>H</mi><mi>I</mi></msub></mrow><mrow><msub><mi>W</mi><mi>v</mi></msub><mo>×</mo><msub><mi>H</mi><mi>v</mi></msub></mrow></mfrac><mo fence="true">⌉</mo></mrow></mrow><annotation encoding="application/x-tex">N = \\left\\lceil \\frac{W_I \\times H_I}{W_v \\times H_v} \\right\\rceil</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">⌈</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">⌉</span></span></span></span></span></span></span><p>然后, 我们从集合 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi mathvariant="double-struck">C</mi><mi>N</mi></msub><mo>=</mo><mo stretchy="false">{</mo><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo><mo>∣</mo><mi>m</mi><mo>×</mo><mi>n</mi><mo>=</mo><mi>N</mi><mo separator="true">,</mo><mi>m</mi><mo>∈</mo><mi mathvariant="double-struck">N</mi><mo separator="true">,</mo><mi>n</mi><mo>∈</mo><mi mathvariant="double-struck">N</mi><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">\\mathbb{C}_N = \\{(m, n) \\mid m \\times n = N, m \\in \\mathbb{N}, n \\in \\mathbb{N}\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbb">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∣</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8833em;vertical-align:-0.1944em;"></span><span class="mord mathbb">N</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathbb">N</span><span class="mclose">}</span></span></span></span> 中选择行列组合. 一个好的划分 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(m, n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 应该使切片与 ViT 预训练设置良好匹配. 为此, 我们使用评分函数评估每个候选划分:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>S</mi><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><mrow><mo fence="true">∥</mo><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>W</mi><mi>I</mi></msub><mi mathvariant="normal">/</mi><mi>m</mi></mrow><mrow><msub><mi>H</mi><mi>I</mi></msub><mi mathvariant="normal">/</mi><mi>n</mi></mrow></mfrac><mo>−</mo><mi>log</mi><mo>⁡</mo><mfrac><msub><mi>W</mi><mi>v</mi></msub><msub><mi>H</mi><mi>v</mi></msub></mfrac><mo fence="true">∥</mo></mrow></mrow><annotation encoding="application/x-tex">S(m, n) = -\\left\\| \\log \\frac{W_I / m}{H_I / n} - \\log \\frac{W_v}{H_v} \\right\\|</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.45em;"><span class="pstrut" style="height:4.4em;"></span><span style="width:0.556em;height:2.4em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.556em" height="2.4em" viewBox="0 0 556 2400"><path d="M145 15 v585 v1200 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-1200 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M188 15 H145 v585 v1200 v585 h43z
M367 15 v585 v1200 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-1200 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M410 15 H367 v585 v1200 v585 h43z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">/</span><span class="mord mathnormal">n</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">/</span><span class="mord mathnormal">m</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.45em;"><span class="pstrut" style="height:4.4em;"></span><span style="width:0.556em;height:2.4em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.556em" height="2.4em" viewBox="0 0 556 2400"><path d="M145 15 v585 v1200 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-1200 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M188 15 H145 v585 v1200 v585 h43z
M367 15 v585 v1200 v585 c2.667,10,9.667,15,21,15
c10,0,16.667,-5,20,-15 v-585 v-1200 v-585 c-2.667,-10,-9.667,-15,-21,-15
c-10,0,-16.667,5,-20,15z M410 15 H367 v585 v1200 v585 h43z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span></span></span></span></span><p>我们选择得分最高的划分:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>m</mi><mo>∗</mo></msup><mo separator="true">,</mo><msup><mi>n</mi><mo>∗</mo></msup><mo>=</mo><munder><mrow><mi mathvariant="normal">arg max</mi><mo>⁡</mo></mrow><mrow><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo><mo>∈</mo><mover accent="true"><mi mathvariant="double-struck">C</mi><mo>ˉ</mo></mover></mrow></munder><mi>S</mi><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">m^*, n^* = \\operatorname*{arg\\,max}_{(m, n) \\in \\bar{\\mathbb{C}}} S(m, n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9331em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">∗</span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">∗</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.9634em;vertical-align:-1.2134em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.0616em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">m</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">n</span><span class="mclose mtight">)</span><span class="mrel mtight">∈</span><span class="mord accent mtight"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8257em;"><span style="top:-2.7em;"><span class="pstrut" style="height:2.7em;"></span><span class="mord mathbb mtight">C</span></span><span style="top:-2.9579em;"><span class="pstrut" style="height:2.7em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord mtight">ˉ</span></span></span></span></span></span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop"><span class="mord mathrm" style="margin-right:0.0139em;">arg</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathrm">max</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2134em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mover accent="true"><mi mathvariant="double-struck">C</mi><mo>ˉ</mo></mover><mo>=</mo><msub><mi mathvariant="double-struck">C</mi><mrow><mi>N</mi><mo>−</mo><mn>1</mn></mrow></msub><mo>∪</mo><msub><mi mathvariant="double-struck">C</mi><mi>N</mi></msub><mo>∪</mo><msub><mi mathvariant="double-struck">C</mi><mrow><mi>N</mi><mo>+</mo><mn>1</mn></mrow></msub></mrow><annotation encoding="application/x-tex">\\bar{\\mathbb{C}} = \\mathbb{C}_{N-1} \\cup \\mathbb{C}_N \\cup \\mathbb{C}_{N+1}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8257em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8257em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathbb">C</span></span><span style="top:-3.2579em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8972em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathbb">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∪</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8389em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathbb">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">∪</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8972em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathbb">C</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span></span>. 实践中, 我们设置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>&lt;</mo><mn>10</mn></mrow><annotation encoding="application/x-tex">N &lt; 10</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7224em;vertical-align:-0.0391em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10</span></span></span></span>, 在编码时最多支持 180 万像素(例如 1344 x 1344 分辨率).</p>
<blockquote>
<p>译者注: 这个评分函数的设计非常精巧. 核心洞察是: ViT 在预训练时对特定长宽比(通常是 1:1)有最优表现, 强行将非 1:1 的图像 resize 到正方形会导致内容畸变. 评分函数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">S(m, n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span> 实际上度量的是划分后每个切片的长宽比与 ViT 预训练长宽比的对数距离——距离越小(得分越高), 切片越&quot;像&quot; ViT 预训练时见过的图像. 通过搜索 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>−</mo><mn>1</mn><mo separator="true">,</mo><mi>N</mi><mo separator="true">,</mo><mi>N</mi><mo>+</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">N-1, N, N+1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 三种切片数, 系统可以在&quot;覆盖全部像素&quot;和&quot;保持切片比例匹配&quot;之间取得平衡. 这是一个典型的工程 trade-off: 用略多于理论值的切片数换取每个切片的更好编码质量.</p>
</blockquote>
<h4 id="qpbm-slice-encoding">切片编码 (Slice Encoding)</h4>
<p>虽然图像分片可以确保切片与 ViT 预训练设置良好匹配, 但每个切片的大小并不精确等于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>W</mi><mi>v</mi></msub><mo separator="true">,</mo><msub><mi>H</mi><mi>v</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(W_v, H_v)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. 为了将切片输入 ViT, 我们首先按比例调整每个切片的大小, 使结果面积匹配 ViT 预训练面积 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>v</mi></msub><mo>×</mo><msub><mi>H</mi><mi>v</mi></msub></mrow><annotation encoding="application/x-tex">W_v \\times H_v</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>. 这种调整有助于防止编码 patch 数量与 ViT 预训练设置之间出现显著差距.</p>
<p>随后, 我们对 ViT 的位置编码进行插值以适应切片的比例. 这涉及将 ViT 的 1D 嵌入 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mn>1</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>Q</mi><mo>×</mo><mi>l</mi></mrow></msup></mrow><annotation encoding="application/x-tex">P_1 \\in \\mathbb{R}^{Q \\times l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">Q</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span></span></span></span></span></span></span></span> 重塑回其 2D 格式 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mn>2</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>q</mi><mo>×</mo><mi>q</mi><mo>×</mo><mi>l</mi></mrow></msup></mrow><annotation encoding="application/x-tex">P_2 \\in \\mathbb{R}^{q \\times q \\times l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span></span></span></span></span></span></span></span>, 其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo>=</mo><mi>q</mi><mo>×</mo><mi>q</mi></mrow><annotation encoding="application/x-tex">Q = q \\times q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span>. 然后, 我们通过 2D 插值将 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">P_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 拟合到每个切片的大小. 我们还包含原始图像作为一个额外的切片, 以提供关于整个图像的全局信息.</p>
<h4 id="token-ys-token-compression">Token 压缩 (Token Compression)</h4>
<p>视觉编码后, 每个切片被编码为 1,024 个 token, 10 个切片总共可产生超过 10k 个 token. 为了管理这一高 token 数量, 我们采用了一个压缩模块, 包含单层 cross-attention 和适量的 queries. 在实践中, V 1.0 和 V 2.0 的每个切片视觉 token 通过该层被压缩为 64 个 queries.</p>
<p>与其他具有竞争性能的 MLLM 相比, MiniCPM-V 系列显著更少的视觉 token 数量在 GPU 内存消耗、推理速度、首 token 延迟和功耗方面实现了 superior 的效率, 使其对更广泛的应用范围和社区更友好.</p>
<blockquote>
<p>译者注: 64 queries 压缩 1,024 tokens 意味着约 16:1 的压缩比. 这背后的直觉是: 视觉信息是高度冗余的——相邻 patch 的特征通常高度相关, 大量 token 携带的是重复的空间信息. Perceiver Resampler 通过一组可学习的 queries 从密集的视觉特征中&quot;提取&quot;关键信息, 类似于信息瓶颈(information bottleneck)的作用. 但代价是: (1) 压缩是 lossy 的, 某些细粒度信息可能在压缩中丢失;(2) cross-attention 引入了额外的计算开销, 尽管单层的设计将这个开销控制在可接受范围内. 对于端侧部署, 显存和推理延迟的节省远超压缩计算的代价.</p>
</blockquote>
<h4 id="kjms-spatial-schema">空间模式 (Spatial Schema)</h4>
<p>为了指示每个切片相对于整幅图像的位置, 我们引入了一个空间模式. 我们首先用两个特殊 token <code>&lt;slice&gt;</code> 和 <code>&lt;/slice&gt;</code> 包裹每个切片的 token, 然后使用特殊 token <code>&quot;\\n&quot;</code> 分隔不同行的切片.</p>
<hr>
<h2 id="4-xl-training">4 训练 (Training)</h2>
<p>模型训练包含 3 个阶段: 预训练阶段、监督微调阶段和 RLHF-V 对齐阶段.</p>
<h3 id="4-1-yxl-pre-training">4.1 预训练 (Pre-training)</h3>
<p>在这个阶段, 我们利用大规模的图像-文本对进行 MLLM 预训练. 此阶段的主要目标是将视觉模块(即视觉编码器和压缩层)与 LLM 的输入空间对齐, 并学习基础的多模态知识. 预训练阶段进一步分为 3 个子阶段.</p>
<h4 id="stage-1">Stage-1</h4>
<p>Stage-1 的作用是预热压缩层, 主要连接视觉编码器和 LLM.</p>
<ul>
<li><strong>可训练模块</strong>: 我们随机初始化压缩层并在此阶段训练该模块, 保持其他参数冻结. 视觉编码器的分辨率设置为 224 x 224, 与视觉编码器的预训练设置相同.</li>
<li><strong>数据</strong>: 为了预热压缩层, 我们从图像描述数据中随机选择 200M 数据. 执行数据清洗以去除相关性差的图像-文本对和格式不良的文本数据.</li>
</ul>
<h4 id="stage-2">Stage-2</h4>
<p>在压缩层预热训练后, Stage-2 的作用是将预训练视觉编码器的输入分辨率扩展.</p>
<ul>
<li><strong>可训练模块</strong>: 在 Stage-2 中, 我们将图像分辨率从 224 x 224 扩展到 448 x 448. 整个视觉编码器参与训练, 其他参数冻结.</li>
<li><strong>数据</strong>: 为了扩展预训练分辨率, 我们额外从图像描述数据中选择 200M 数据.</li>
</ul>
<h4 id="stage-3">Stage-3</h4>
<p>在扩展了视觉编码器的主要输入分辨率后, 我们最终使用自适应视觉编码策略训练视觉模块, 该策略可以进一步适应任意长宽比的高分辨率输入.</p>
<ul>
<li><strong>可训练模块</strong>: 在 Stage-3 训练期间, 压缩层和视觉编码器都被训练以适应语言模型的嵌入空间. LLM 保持冻结, 以避免来自相对低质量预训练数据的干扰.</li>
<li><strong>数据</strong>: 与之前仅使用图像描述数据的阶段不同, 在此高分辨率预训练阶段, 我们额外引入 OCR 数据以增强视觉编码器的 OCR 能力.</li>
</ul>
<table>
<thead>
<tr>
<th>类别</th>
<th>来源</th>
<th>规模</th>
</tr>
</thead>
<tbody><tr>
<td>图像描述(英文)</td>
<td>COCO, VG, CC3M, CC12M, LAION-COCO, COYO, LAION-2B 等</td>
<td>410M</td>
</tr>
<tr>
<td>图像描述(中文)</td>
<td>AIC, LAION-2B-Chinese, WuKong, Zero-Chinese 等</td>
<td>110M</td>
</tr>
<tr>
<td>OCR+知识(英文)</td>
<td>WIT, IDL, SynthText, SynthDoG-en, ArxivCap 等</td>
<td>39M</td>
</tr>
<tr>
<td>OCR+知识(中文)</td>
<td>WIT, LAION-2B-OCR</td>
<td>11M</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: 预训练数据来源与规模. 总计约 570M 图像-文本对.</p>
</blockquote>
<h4 id="caption-rewriting">Caption Rewriting</h4>
<p>来自网络的图像-文本对可能存在描述数据的质量问题, 包括内容不流畅、语法错误和重复词语. 这些低质量数据可能导致不稳定的训练动态.</p>
<p>为了解决这个问题, 我们引入了一个辅助模型进行低质量描述重写. 重写模型以原始描述为输入, 被要求将其转换为问答对. 此过程的答案被用作更新后的描述. 实践中, 我们利用 GPT-4 标注少量种子样本, 然后用于微调一个 LLM 完成重写任务.</p>
<h4 id="data-packing">Data Packing</h4>
<p>来自不同数据源的样本通常具有不同的长度. 批次间样本长度的高方差会导致内存使用效率低下和 OOM 错误风险.</p>
<p>为了解决这个问题, 我们将多个样本 pack 到单个固定长度的序列中. 通过截断序列中的最后一个样本, 我们确保序列长度的一致性, 促进更一致的内存消耗和计算效率. 同时, 我们修改 position ids 和 attention masks 以避免不同样本之间的干扰. 在我们的实验中, data packing 策略可以带来预训练阶段 2~3 倍的加速.</p>
<blockquote>
<p>译者注: Data packing 是一个常被忽视但非常实用的工程技巧. 在标准的 MLLM 预训练中, 每个批次内样本长度差异巨大(一张图配 10 个词的描述 vs 一张图配 200 个词的详细说明), 导致大量 padding token 的浪费. 通过将多个短样本拼接成一个长序列, 并用 attention mask 隔离, 可以将 GPU 利用率从 30-40% 提升到 80-90%. 这种技术在 NLP 预训练中已被广泛使用(如 GPT-3 的训练), 但在 MLLM 领域的普及度还不够高. 2<del>3 倍的加速意味着同样的计算预算可以训练 2</del>3 倍的数据, 或者将训练时间缩短到 1/3.</p>
</blockquote>
<h3 id="4-2-jdwt-supervised-fine-tuning">4.2 监督微调 (Supervised Fine-tuning)</h3>
<p>在从预训练学习基础能力后, 我们在高质量的视觉问答数据集上进行监督微调(SFT), 以进一步从人工标注中学习知识和交互能力.</p>
<p><strong>可训练模块</strong>: 与主要使用网络爬取数据的预训练阶段相比, SFT 阶段主要利用由人工标注者或 GPT-4 等强模型标注的高质量数据集. 因此, 我们解锁所有模型参数以更好地利用数据并在 SFT 阶段学习丰富的知识.</p>
<p><strong>数据</strong>: 近期研究表明, 训练末尾的数据在塑造模型能力和响应风格方面起着更重要的作用. 我们将 SFT 数据分为两部分. Part-1 侧重于增强模型的基础识别能力, Part-2 旨在增强模型生成详细响应和遵循人类指令的能力.</p>
<p>具体而言, Part-1 数据由响应长度相对较短的传统 QA/描述数据集组成, 有助于增强模型的基础识别能力. Part-2 则包含具有长响应和复杂交互的数据集.</p>
<p>在 SFT 期间, 这两部分数据被拼接并依次输入模型.</p>
<table>
<thead>
<tr>
<th>类别</th>
<th>来源</th>
<th>规模</th>
</tr>
</thead>
<tbody><tr>
<td>Part-1 短描述</td>
<td>Flickr-30K, COCO</td>
<td>560K</td>
</tr>
<tr>
<td>Part-1 VQA</td>
<td>FM-IQA, VGQA, IconQA, GQA, VQAv2, CLEVR 等</td>
<td>1.4M</td>
</tr>
<tr>
<td>Part-1 知识</td>
<td>OKVQA, A-OKVQA, KVQA, ScienceQA</td>
<td>60K</td>
</tr>
<tr>
<td>Part-1 Grounding</td>
<td>RefCOCO</td>
<td>570K</td>
</tr>
<tr>
<td>Part-1 推理</td>
<td>COMVINT, VCR, NLVR, LRV</td>
<td>135K</td>
</tr>
<tr>
<td>Part-1 数学</td>
<td>GeoQA, SMART-101</td>
<td>125K</td>
</tr>
<tr>
<td>Part-1 OCR</td>
<td>DocVQA, TextVQA, OCR-VQA, ST-VQA, ChartQA 等</td>
<td>1.7M</td>
</tr>
<tr>
<td>Part-1 对话</td>
<td>FSVQA, Visual-Dialog</td>
<td>780K</td>
</tr>
<tr>
<td>Part-2(采样+增强)</td>
<td>Part-1 采样 + 更多 OCR/Instruct 数据</td>
<td>约 3M</td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: SFT 数据来源与规模. 数据分为 Part-1(基础能力)和 Part-2(高级能力)两部分顺序训练.</p>
</blockquote>
<blockquote>
<p>译者注: SFT 数据的&quot;两部分顺序&quot;策略是一个值得关注的细节. 这与传统的&quot;将所有 SFT 数据 shuffle 后一起训练&quot;不同——MiniCPM-V 刻意将&quot;短答案的基础识别数据&quot;放在前面, &quot;长答案的复杂交互数据&quot;放在后面. 这种设计的理论基础是: 训练后期的数据对模型能力和风格的影响更大. 先学&quot;看到什么说什么&quot;, 再学&quot;详细解释、遵循指令&quot;, 符合认知上的从简单到复杂的渐进过程. 这也暗示了一个实用的调参技巧: 如果你的模型在 SFT 后过于啰嗦或指令遵循不稳定, 可以尝试调整不同数据类型的训练顺序.</p>
</blockquote>
<h3 id="4-3-rlhf-v-dq">4.3 RLHF-V 对齐</h3>
<p>MLLMs 通常容易产生幻觉问题, 生成与输入图像不事实相符的响应. 这个问题极大地限制了 MLLMs 的广泛应用, 尤其是在高风险场景中, 如自动驾驶和视障群体辅助. 为了解决幻觉问题, MiniCPM-V 2.0 采用了 RLHF-V 技术(CVPR 2024).</p>
<p>RLHF-V 的核心思想是从细粒度的人类反馈中对齐 MLLM 行为. 与传统 RLHF 使用整个响应的粗粒度偏好不同, RLHF-V 将响应分解为原子声明(atomic claims), 并对每个声明进行事实性验证. 这种方法使得反馈更精确, 对齐更有效.</p>
<p>基于 RLHF-V, MiniCPM-V 2.0 在 Object HalBench 上达到了与 GPT-4V 相当的幻觉水平, 成为首个通过多模态 RLHF 对齐的端侧多模态大模型.</p>
<blockquote>
<p>译者注: 多模态幻觉(MLLM hallucination)比文本幻觉更危险, 因为视觉信息是&quot;客观的&quot;——模型说&quot;图中有一只猫&quot;, 用户可以直接看图验证. 传统 RLHF 对整段响应打好评/差评, 但一个响应可能包含 10 个声明, 其中 9 个正确、1 个错误, 粗粒度反馈无法精确定位错误. RLHF-V 的原子声明分解解决了这个问题, 使反馈粒度从&quot;段落级&quot;降到&quot;事实级&quot;. 但这要求标注者或验证器能够精确地分解和验证每个视觉声明, 标注成本显著增加. V 2.0 使用人类反馈, 而后续 V 2.5 升级为 RLAIF-V(使用 AI 反馈), 正是为了降低这一成本.</p>
</blockquote>
<hr>
<h2 id="5-sy-experiments">5 实验 (Experiments)</h2>
<h3 id="5-1-pcjz">5.1 评测基准</h3>
<p>我们采用以下评测基准全面评估 MiniCPM-V 2.0:</p>
<ul>
<li><strong>通用多模态基准</strong>: OpenCompass 综合评测, 覆盖 MMBench、MMMU、MathVista、LLaVA Bench、RealWorldQA 等 11 个主流基准.</li>
<li><strong>OCR 基准</strong>: OCRBench(综合 OCR 能力)、TextVQA(场景图片文字识别)、DocVQA(文档理解).</li>
<li><strong>幻觉基准</strong>: Object HalBench(响应级/提及级幻觉率).</li>
</ul>
<h3 id="5-2-ocr-xn">5.2 OCR 性能</h3>
<p>MiniCPM-V 2.0 在 OCR 方面展现出强大的能力, 包括场景文字、文档和截图理解.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>OCRBench</th>
<th>TextVQA val</th>
<th>DocVQA test</th>
</tr>
</thead>
<tbody><tr>
<td>Gemini Pro</td>
<td>-</td>
<td>680</td>
<td>74.6</td>
<td>88.1</td>
</tr>
<tr>
<td>GPT-4V(2023.11.06)</td>
<td>-</td>
<td>645</td>
<td>78.0</td>
<td>88.4</td>
</tr>
<tr>
<td>Yi-VL-34B</td>
<td>34B</td>
<td>290</td>
<td>43.4*</td>
<td>16.9*</td>
</tr>
<tr>
<td>CogVLM-Chat</td>
<td>17.4B</td>
<td>590</td>
<td>70.4</td>
<td>33.3*</td>
</tr>
<tr>
<td>Qwen-VL-Chat</td>
<td>9.6B</td>
<td>488</td>
<td>61.5</td>
<td>62.6</td>
</tr>
<tr>
<td>MiniCPM-V 1.0</td>
<td>2.8B</td>
<td>366</td>
<td>60.6</td>
<td>38.2</td>
</tr>
<tr>
<td><strong>MiniCPM-V 2.0</strong></td>
<td><strong>2.8B</strong></td>
<td><strong>605</strong></td>
<td><strong>74.1</strong></td>
<td><strong>71.9</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: OCR 基准评测结果. * 表示使用官方 checkpoint 由我们测试的结果. MiniCPM-V 2.0 在 OCRBench 上刷新开源模型 SOTA, TextVQA 接近 Gemini Pro.</p>
</blockquote>
<blockquote>
<p>译者注: 这张表的信息量非常大. 首先, V 2.0 相比 V 1.0 的 OCRBench 分数从 366 跃升到 605, 提升幅度高达 65%——这主要归功于 Stage-3 引入的 OCR 预训练数据和高分辨率自适应编码. 其次, 2.8B 参数的 V 2.0 在 OCRBench 上超越了 17.4B 的 CogVLM-Chat(590)和 9.6B 的 Qwen-VL-Chat(488), 在 TextVQA 上超越了 34B 的 Yi-VL(43.4). 这种&quot;以小博大&quot;的效果在文档理解(DocVQA)上尤为明显: V 2.0 的 71.9 远超 Qwen-VL-Chat 的 62.6. 但需要注意的是, DocVQA test 上的 71.9 距离 GPT-4V 的 88.4 仍有明显差距, 说明在复杂文档理解上, 小模型仍有天花板.</p>
</blockquote>
<h3 id="5-3-tydmtnl">5.3 通用多模态能力</h3>
<p>在 OpenCompass 综合评测中, MiniCPM-V 2.0 凭借 2.8B 的小体量, 在多个基准上超越了参数规模更大的模型.</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>OpenCompass</th>
<th>MMBench</th>
<th>MMMU</th>
<th>MathVista</th>
</tr>
</thead>
<tbody><tr>
<td>Yi-VL-34B</td>
<td>34B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>CogVLM-Chat</td>
<td>17.4B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>Qwen-VL-Chat</td>
<td>9.6B</td>
<td>-</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>
<tr>
<td>MiniCPM-V 2.0</td>
<td>2.8B</td>
<td>领先 7B 以下模型</td>
<td>超越同级</td>
<td>超越同级</td>
<td>超越同级</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: OpenCompass 综合评测的详细分数在论文中主要报告了 V 2.5 的结果, V 2.0 的绝对分数在官方博客中有更详细的记载. 根据面壁智能官方技术博客的数据, V 2.0 在 OpenCompass 综合评测中超越了 Qwen-VL-Chat-10B、CogVLM-Chat-17B 和 Yi-VL-34B 等更大参数规模的模型. 这一结果再次验证了 MiniCPM 的核心方法论: 通过精细的架构设计和充分的训练, 小模型可以达到远超其参数规模暗示的能力水平.</p>
</blockquote>
<h3 id="5-4-hjykxhw">5.4 幻觉与可信行为</h3>
<p>在 Object HalBench 上, MiniCPM-V 2.0 达到了与 GPT-4V 相当的幻觉水平, 在开源模型中表现最优.</p>
<p>这一成果主要归功于 RLHF-V 多模态对齐技术. 通过细粒度的人类反馈, 模型学会了生成与图像内容严格一致的响应, 显著减少了&quot;无中生有&quot;的幻觉现象.</p>
<blockquote>
<p>译者注: 幻觉率是 MLLM 实际落地时最关键的指标之一, 但也是最常被评测数据&quot;美化&quot;的指标. Object HalBench 的设计相对 robust: 它要求模型描述图像中的对象, 然后通过自动化的视觉 grounding 检查每个提及的对象是否真实存在于图像中. 但即便如此, 实验室评测与真实场景仍有差距——真实用户的问题可能更开放、图像可能更模糊、边界情况更多. MiniCPM-V 2.0 的&quot;与 GPT-4V 持平&quot;是一个 strong 的声明, 建议在实际部署时仍保留人工审核或置信度阈值机制.</p>
</blockquote>
<h3 id="5-5-dcbs">5.5 端侧部署</h3>
<p>MiniCPM-V 2.0 可以高效部署在大多数消费级显卡、个人电脑以及移动手机等终端设备.</p>
<p>基于 MLC-LLM 框架, MiniCPM-V 2.0 已被成功部署在 Android 手机端. 在小米 14 Pro(Snapdragon 8 Gen 3)上的测试显示, 模型可以实现流畅的图像理解和推理.</p>
<table>
<thead>
<tr>
<th>部署平台</th>
<th>推理框架</th>
<th>典型性能</th>
</tr>
</thead>
<tbody><tr>
<td>NVIDIA GPU</td>
<td>Transformers / vLLM</td>
<td>标准推理</td>
</tr>
<tr>
<td>Android 手机</td>
<td>MLC-LLM</td>
<td>端侧实时推理</td>
</tr>
<tr>
<td>Mac(MPS)</td>
<td>Transformers</td>
<td>Apple Silicon 兼容</td>
</tr>
</tbody></table>
<blockquote>
<p>译者注: 端侧部署 MLLM 的挑战比端侧 LLM 更复杂. 除了 LLM 部分的内存和计算开销, 视觉编码器(SigLIP-400M)也需要占用显存, 且图像预处理(resize、normalize、切片)引入了额外的 CPU 开销. MLC-LLM 通过 TVM 编译优化和量化(如 INT4/INT8)将模型压缩到手机可承受的内存范围. 但量化对视觉编码器的影响需要仔细评估——ViT 对量化通常比 LLM 更敏感, 因为视觉特征的动态范围更大. 面壁智能团队开源了 mlc-MiniCPM 项目, 提供了完整的 Android 部署方案, 这对社区的实际落地非常有价值.</p>
</blockquote>
<hr>
<h2 id="6-jl-conclusion">6 结论 (Conclusion)</h2>
<p>本文介绍了 MiniCPM-V 2.0, 一个 2.8B 参数的端侧多模态大语言模型. 通过基于 LLaVA-UHD 的自适应高分辨率视觉编码、三阶段预训练策略、RLHF-V 多模态对齐和高效的 token 压缩, MiniCPM-V 2.0 在 OCR 能力上达到开源模型最优水平, 在通用多模态理解上超越了参数规模大 3~10 倍的模型.</p>
<p>MiniCPM-V 2.0 展示了端侧多模态 AI 的巨大潜力: 在有限的参数预算下, 通过精细的架构设计和训练配方, 小模型可以实现与其规模不相称的强大能力. 我们相信, 随着端侧计算能力的持续增长和模型效率的不断提升, GPT-4V 级别的多模态 AI 将在端侧设备上越来越普及.</p>
<hr>
<h2 id="fl-syb">附录: 术语表</h2>
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
<td>MLLM</td>
<td>多模态大语言模型</td>
<td>摘要</td>
<td>融合视觉和语言能力的 AI 模型</td>
</tr>
<tr>
<td>ViT</td>
<td>视觉 Transformer</td>
<td>第 3.2 节</td>
<td>将图像切分为 patch 序列进行编码的模型</td>
</tr>
<tr>
<td>SigLIP</td>
<td>Sigmoid 对比语言-图像预训练</td>
<td>第 3.1 节</td>
<td>Google 提出的 CLIP 改进版, 使用 sigmoid 损失</td>
</tr>
<tr>
<td>Perceiver Resampler</td>
<td>感知器重采样器</td>
<td>第 3.2 节</td>
<td>用 cross-attention 将变长输入压缩为固定长度表示</td>
</tr>
<tr>
<td>LLaVA-UHD</td>
<td>LLaVA 超高分辨率</td>
<td>第 3.2 节</td>
<td>支持任意长宽比高分辨率图像输入的视觉编码方法</td>
</tr>
<tr>
<td>OCR</td>
<td>光学字符识别</td>
<td>摘要</td>
<td>从图像中识别和提取文字的技术</td>
</tr>
<tr>
<td>RLHF-V</td>
<td>基于人类反馈的视觉强化学习</td>
<td>第 4.3 节</td>
<td>从细粒度人类反馈中对齐多模态模型行为</td>
</tr>
<tr>
<td>RLAIF-V</td>
<td>基于 AI 反馈的视觉强化学习</td>
<td>引言译者注</td>
<td>从开源模型获取 AI 反馈进行多模态对齐</td>
</tr>
<tr>
<td>DPO</td>
<td>直接偏好优化</td>
<td>论文引用</td>
<td>不依赖奖励模型, 直接用偏好数据优化策略</td>
</tr>
<tr>
<td>Data Packing</td>
<td>数据打包</td>
<td>第 4.1 节</td>
<td>将多个样本拼接为固定长度序列以提升训练效率</td>
</tr>
<tr>
<td>Object HalBench</td>
<td>对象幻觉基准</td>
<td>第 5.1 节</td>
<td>评测模型生成描述中幻觉率的基准测试</td>
</tr>
<tr>
<td>OCRBench</td>
<td>OCR 综合基准</td>
<td>第 5.2 节</td>
<td>综合评测 OCR 能力的权威基准</td>
</tr>
<tr>
<td>TextVQA</td>
<td>场景文字 VQA</td>
<td>第 5.2 节</td>
<td>要求模型读取场景图片中文字来回答问题的基准</td>
</tr>
<tr>
<td>DocVQA</td>
<td>文档 VQA</td>
<td>第 5.2 节</td>
<td>要求模型理解文档图像内容并回答问题的基准</td>
</tr>
<tr>
<td>OpenCompass</td>
<td>开放评测平台</td>
<td>第 5.3 节</td>
<td>综合评测基础模型能力的统一平台</td>
</tr>
<tr>
<td>MLC-LLM</td>
<td>机器学习编译器 LLM</td>
<td>第 5.5 节</td>
<td>将 LLM 编译部署到 diverse 硬件的框架</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p>本文档为 MiniCPM-V 2.0 技术报告的精译. D1 PDF 已归档(arXiv:2408.01800, 26 页). D3 因 MinerU Windows 环境不稳定改用 arXiv HTML 替代. D4 基于 D3 内容整理.</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy-abstract","text":"摘要 (Abstract)"},{"level":2,"id":"1-yy-introduction","text":"1 引言 (Introduction)"},{"level":2,"id":"2-xggz-related-work","text":"2 相关工作 (Related Work)"},{"level":3,"id":"2-1-dmtdyymx","text":"2.1 多模态大语言模型"},{"level":3,"id":"2-2-dcdmtdyymx","text":"2.2 端侧多模态大语言模型"},{"level":2,"id":"3-mxjg-model-architecture","text":"3 模型架构 (Model Architecture)"},{"level":3,"id":"3-1-ztjg","text":"3.1 整体结构"},{"level":3,"id":"3-2-zsysjbm-adaptive-visual-encoding","text":"3.2 自适应视觉编码 (Adaptive Visual Encoding)"},{"level":4,"id":"txfp-image-partition","text":"图像分片 (Image Partition)"},{"level":4,"id":"qpbm-slice-encoding","text":"切片编码 (Slice Encoding)"},{"level":4,"id":"token-ys-token-compression","text":"Token 压缩 (Token Compression)"},{"level":4,"id":"kjms-spatial-schema","text":"空间模式 (Spatial Schema)"},{"level":2,"id":"4-xl-training","text":"4 训练 (Training)"},{"level":3,"id":"4-1-yxl-pre-training","text":"4.1 预训练 (Pre-training)"},{"level":4,"id":"stage-1","text":"Stage-1"},{"level":4,"id":"stage-2","text":"Stage-2"},{"level":4,"id":"stage-3","text":"Stage-3"},{"level":4,"id":"caption-rewriting","text":"Caption Rewriting"},{"level":4,"id":"data-packing","text":"Data Packing"},{"level":3,"id":"4-2-jdwt-supervised-fine-tuning","text":"4.2 监督微调 (Supervised Fine-tuning)"},{"level":3,"id":"4-3-rlhf-v-dq","text":"4.3 RLHF-V 对齐"},{"level":2,"id":"5-sy-experiments","text":"5 实验 (Experiments)"},{"level":3,"id":"5-1-pcjz","text":"5.1 评测基准"},{"level":3,"id":"5-2-ocr-xn","text":"5.2 OCR 性能"},{"level":3,"id":"5-3-tydmtnl","text":"5.3 通用多模态能力"},{"level":3,"id":"5-4-hjykxhw","text":"5.4 幻觉与可信行为"},{"level":3,"id":"5-5-dcbs","text":"5.5 端侧部署"},{"level":2,"id":"6-jl-conclusion","text":"6 结论 (Conclusion)"},{"level":2,"id":"fl-syb","text":"附录: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/05-mini-cpm-v-2.0/01-mini-cpm-v-2.0-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/05-mini-cpm-v-2.0/01-mini-cpm-v-2.0-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V 2.0 技术报告精译</h1>
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
