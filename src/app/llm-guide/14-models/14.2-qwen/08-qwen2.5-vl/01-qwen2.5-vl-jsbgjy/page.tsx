"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2.5-VL 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>原文</strong>: Qwen2.5-VL Technical Report (arXiv:2502.13923)
<strong>发布机构</strong>: Qwen Team, Alibaba Group
<strong>翻译说明</strong>: 以下内容为技术报告全文逐段精译,保留所有公式、表格结构与实验数据.英文术语首次出现时附原文,后续直接使用缩写.</p>
</blockquote>
<hr>
<h2 id="zy-abstract">摘要 (Abstract)</h2>
<p>我们推出 Qwen2.5-VL,这是 Qwen 视觉语言系列的最新旗舰模型,在基础能力和创新功能两方面均实现了显著提升.Qwen2.5-VL 通过增强的视觉识别、精确的物体定位、稳健的文档解析和长视频理解,在理解与交互世界方面实现了重大飞跃.</p>
<p>Qwen2.5-VL 的一个突出特性是其能够使用边界框或点精确地定位物体.它能够从发票、表单和表格中稳健地提取结构化数据,并对图表、图示和版式进行详细分析.为处理复杂输入,Qwen2.5-VL 引入了动态分辨率处理和绝对时间编码,使其能够处理各种尺寸的图像和长达数小时的视频,并实现秒级的事件定位.这使得模型能够原生地感知空间尺度和时间动态,而无需依赖传统的归一化技术.</p>
<p>通过从头训练一个原生动态分辨率的 Vision Transformer (ViT) 并引入 Window Attention,我们在保持原生分辨率的同时显著降低了计算开销.因此,Qwen2.5-VL 不仅在静态图像和文档理解方面表现出色,还能作为交互式视觉智能体,在操作计算机和移动设备等真实场景中具备推理、工具使用和任务执行能力.该模型在不依赖任务特定微调的情况下实现了强大的跨领域泛化能力.</p>
<p>Qwen2.5-VL 提供三种尺寸,覆盖从端侧 AI 到高性能计算的多样化应用场景.旗舰模型 Qwen2.5-VL-72B 可与 GPT-4o 和 Claude 3.5 Sonnet 等顶尖模型匹敌,尤其在文档和图表理解方面表现突出.较小的 Qwen2.5-VL-7B 和 Qwen2.5-VL-3B 模型超越了同等规模的竞品,即使在资源受限的环境中也能提供强大的能力.此外,Qwen2.5-VL 保持了稳健的语言性能,保留了 Qwen2.5 LLM 的核心语言能力.</p>
<hr>
<h2 id="1-yy-introduction">1. 引言 (Introduction)</h2>
<p>大型视觉语言模型(Large Vision-Language Models, LVLMs)代表了人工智能领域的突破性进展,标志着多模态理解与交互方式的变革.通过将视觉感知与自然语言处理无缝整合,这些先进模型正在从根本上重塑机器如何跨领域解读和分析复杂信息.</p>
<p>尽管多模态大语言模型取得了显著进步,但目前这些模型的能力可以被比喻为「三明治饼干的中间层」——在各种任务上表现尚可,但远未达到卓越.细粒度视觉任务构成了这个比喻的底层.在 Qwen2.5-VL 的本次迭代中,我们致力于探索细粒度感知能力,旨在为 LVLMs 建立坚实的基础,并为真实应用场景创建一个智能体增强器(Agentic Amplifier).这个框架的顶层是多模态推理,通过利用最新的 Qwen2.5 LLM 并采用多模态 QA 数据构建来增强.</p>
<p>一系列工作推动了多模态大模型的发展,其特征体现在架构设计、视觉输入处理和数据策展三个方面.LVLMs 进步的主要驱动力之一是架构的持续创新.Flamingo、BLIP、BLIP-2、LLaVA、LLaVA-1.5、Emu3、InternLM、InternImage 等研究逐步塑造了当前的范式,通常由视觉Encoder 、跨模态投影器和 LLM 组成.细粒度感知模型成为另一个关键领域,Florence-2、Grounding DINO、Ferret-v2、OMG-LLaVA、Kosmos-2、Molmo 等模型在推动详细视觉理解的边界方面取得了进展.Omni 和 MoE 的架构也启发了 LVLMs 的未来演进.视觉Encoder 的增强和分辨率扩展在提升实际视觉理解质量方面发挥了关键作用.策展具有更多样化场景和更高质量的数据是训练先进 LVLM 的关键步骤.</p>
<p>然而,尽管取得了显著进步,视觉语言模型目前仍面临发展瓶颈,包括计算复杂度、有限的上下文理解、较差的细粒度视觉感知,以及在不同序列长度下表现不一致.</p>
<p>在本报告中,我们介绍最新工作 Qwen2.5-VL,它延续了 Qwen 系列的开源理念,在各项基准上达到甚至超越了顶级闭源模型.技术上,我们的贡献包括四个方面:</p>
<ol>
<li>我们在视觉Encoder 中实现了 Window Attention,以优化推理效率.</li>
<li>我们引入了动态 FPS 采样,将动态分辨率扩展到时间维度,实现对不同采样率的全面视频理解.</li>
<li>我们通过将 MRoPE 对齐到绝对时间来升级时间域,从而促进更复杂的时间序列学习.</li>
<li>我们在预训练和监督微调的优质数据策展方面做出了重大努力,将预训练语料从 1.2 万亿 token 进一步扩展到 4.1 万亿 token.</li>
</ol>
<p>Qwen2.5-VL 的突出特性如下:</p>
<ul>
<li><strong>强大的文档解析能力</strong>: Qwen2.5-VL 将文本识别升级为全文档解析,擅长处理多场景、多语言和各类内置元素(手写、表格、图表、化学式和乐谱)的文档.</li>
<li><strong>跨格式的精确物体定位</strong>: Qwen2.5-VL 在检测、指向和计数物体方面实现了更高的精度,支持绝对坐标和 JSON 格式以满足高级空间推理需求.</li>
<li><strong>超长视频理解和细粒度视频定位</strong>: 我们的模型将原生动态分辨率扩展到时间维度,增强了对长达数小时的视频的理解能力,同时能够以秒级精度提取事件片段.</li>
<li><strong>增强的计算机和移动设备智能体功能</strong>: 利用先进的定位、推理和决策能力,提升模型在智能手机和计算机上的智能体功能.</li>
</ul>
<hr>
<h2 id="2-ff-approach">2. 方法 (Approach)</h2>
<p>本节首先概述 Qwen2.5-VL 系列模型的架构更新,然后介绍数据和训练细节的总体概况.</p>
<p><img src="/llm-guide/14-models/14.2-qwen/08-qwen2.5-vl/01-qwen2.5-vl-jsbgjy/images/qwen2.5vl_arc.jpeg" alt="Qwen2.5-VL 框架架构图"></p>
<blockquote>
<p><strong>图 1</strong>: Qwen2.5-VL 框架展示了视觉Encoder 与语言模型Decoder  的集成,用于处理包括图像和视频在内的多模态输入.视觉Encoder 设计用于处理原生分辨率输入并支持动态 FPS 采样.不同尺寸的图像和不同 FPS 率的视频帧被动态映射为不同长度的 token 序列.值得注意的是,MRoPE 将时间 ID 与绝对时间对齐,使模型能够更好地理解时间动态,如事件节奏和精确时刻定位.处理后的视觉数据随后输入 Qwen2.5 LM Decoder  .我们重新设计了 ViT 架构,引入了 SwiGLU 激活的 FFN、RMSNorm 归一化和基于窗口的注意力机制以提升性能和效率.</p>
</blockquote>
<h3 id="2-1-mxjg-model-architecture">2.1 模型架构 (Model Architecture)</h3>
<p>Qwen2.5-VL 的整体模型架构由三个组件组成:</p>
<p><strong>大语言模型 (Large Language Model)</strong></p>
<p>Qwen2.5-VL 系列采用大语言模型作为其基础组件.模型使用预训练好的 Qwen2.5 LLM 权重进行初始化.为更好地满足多模态理解的需求,我们将 1D RoPE (Rotary Position Embedding, 旋转位置编码) 修改为 MRoPE (Multimodal Rotary Position Embedding Aligned to Absolute Time, 对齐绝对时间的多模态旋转位置编码).</p>
<p><strong>视觉Encoder  (Vision Encoder)</strong></p>
<p>Qwen2.5-VL 的视觉Encoder 采用了重新设计的 Vision Transformer (ViT) 架构.结构上,我们引入了 2D-RoPE 和 Window Attention 以支持原生输入分辨率,同时加速整个视觉Encoder 的计算.在训练和推理期间,输入图像的高度和宽度被调整为 28 的倍数后再输入 ViT.视觉Encoder 以 14 的步长将图像分割为 patch,生成一组图像特征.</p>
<p><strong>基于 MLP 的视觉-语言合并器 (MLP-based Vision-Language Merger)</strong></p>
<p>为解决长序列图像特征带来的效率挑战,我们采用了一种简单但有效的方法来压缩特征序列,然后再将其输入大语言模型.具体而言,我们不直接使用 ViT 提取的原始 patch 特征,而是先将空间上相邻的四个 patch 特征分组,然后将这些分组后的特征拼接并通过一个两层 MLP 投影到与 LLM 中使用的文本嵌入维度对齐的维度.这种方法不仅降低了计算成本,还提供了一种灵活的方式来动态压缩不同长度的图像特征序列.</p>
<p><strong>表 1: Qwen2.5-VL 配置</strong></p>
<table>
<thead>
<tr>
<th align="left">配置项</th>
<th align="center">Qwen2.5-VL-3B</th>
<th align="center">Qwen2.5-VL-7B</th>
<th align="center">Qwen2.5-VL-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>Vision Transformer (ViT)</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Hidden Size</td>
<td align="center">1280</td>
<td align="center">1280</td>
<td align="center">1280</td>
</tr>
<tr>
<td align="left">层数</td>
<td align="center">32</td>
<td align="center">32</td>
<td align="center">32</td>
</tr>
<tr>
<td align="left">注意力头数</td>
<td align="center">16</td>
<td align="center">16</td>
<td align="center">16</td>
</tr>
<tr>
<td align="left">Intermediate Size</td>
<td align="center">3456</td>
<td align="center">3456</td>
<td align="center">3456</td>
</tr>
<tr>
<td align="left">Patch Size</td>
<td align="center">14</td>
<td align="center">14</td>
<td align="center">14</td>
</tr>
<tr>
<td align="left">Window Size</td>
<td align="center">112</td>
<td align="center">112</td>
<td align="center">112</td>
</tr>
<tr>
<td align="left">全局注意力层索引</td>
<td align="center">{7, 15, 23, 31}</td>
<td align="center">{7, 15, 23, 31}</td>
<td align="center">{7, 15, 23, 31}</td>
</tr>
<tr>
<td align="left"><strong>视觉-语言合并器</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">输入通道</td>
<td align="center">1280</td>
<td align="center">1280</td>
<td align="center">1280</td>
</tr>
<tr>
<td align="left">输出通道</td>
<td align="center">2048</td>
<td align="center">3584</td>
<td align="center">8192</td>
</tr>
<tr>
<td align="left"><strong>大语言模型 (LLM)</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Hidden Size</td>
<td align="center">2048</td>
<td align="center">3584</td>
<td align="center">8192</td>
</tr>
<tr>
<td align="left">层数</td>
<td align="center">36</td>
<td align="center">28</td>
<td align="center">80</td>
</tr>
<tr>
<td align="left">KV 头数</td>
<td align="center">2</td>
<td align="center">4</td>
<td align="center">8</td>
</tr>
<tr>
<td align="left">头维度</td>
<td align="center">128</td>
<td align="center">128</td>
<td align="center">128</td>
</tr>
<tr>
<td align="left">Intermediate Size</td>
<td align="center">4864</td>
<td align="center">18944</td>
<td align="center">29568</td>
</tr>
<tr>
<td align="left">Embedding Tying</td>
<td align="center">是</td>
<td align="center">否</td>
<td align="center">否</td>
</tr>
<tr>
<td align="left">词表大小</td>
<td align="center">151646</td>
<td align="center">151646</td>
<td align="center">151646</td>
</tr>
<tr>
<td align="left">训练 token 总量</td>
<td align="center">4.1T</td>
<td align="center">4.1T</td>
<td align="center">4.1T</td>
</tr>
</tbody></table>
<blockquote>
<p>这里值得停一下.Qwen2.5-VL 的架构设计体现了「视觉Encoder 统一、语言Decoder  分层」的策略:ViT 和 Merger 在所有尺寸中保持完全一致的配置,只有 LLM 部分随规模缩放.这意味着 3B 和 72B 模型看到的视觉特征表示是相同的,差异仅在于语言推理能力的深度.这种设计的工程优势在于:小模型上验证的视觉预训练策略可以直接迁移到大模型,无需重新调优.代价是 72B 模型的 Merger 输出维度(8192)需要与 LLM 的 hidden size 匹配,而 3B 模型只有 2048——如果未来需要更细粒度的视觉表示,Merger 的压缩可能会成为瓶颈.</p>
</blockquote>
<h4 id="2-1-1-ksgxdsj-encoder">2.1.1 快速高效的视觉Encoder</h4>
<p>视觉Encoder 在多模态大语言模型(MLLMs)中扮演着关键角色.为解决原生分辨率输入带来的训练和推理中计算负载不均衡的挑战,我们重新设计了 ViT 架构.一个关键问题来自处理不同尺寸图像时的二次计算复杂度.为缓解这一问题,我们在大多数层中引入了 Window Attention,确保计算成本随 patch 数量线性增长而非二次增长.在我们的架构中,只有四层使用全局自注意力,其余层使用最大窗口尺寸为 112×112(对应 8×8 个 patch)的 Window Attention.小于 112×112 的区域不经填充直接处理,保留其原始分辨率.这种设计允许模型在输入分辨率下原生运行,避免不必要的缩放或失真.</p>
<p>对于位置编码,我们采用 2D RoPE 来有效捕捉二维空间中的空间关系.此外,为更好地处理视频输入,我们将方法扩展到 3D patch 划分.具体而言,我们使用 14×14 的图像 patch 作为基本单元,与静态图像的传统 ViT 保持一致.对于视频数据,两个连续帧被分组在一起,显著减少了输入语言模型的 token 数量.这种设计不仅保持了与现有架构的兼容性,还增强了处理序列视频数据时的效率.</p>
<p>为简化整体网络结构,我们将 ViT 架构与大语言模型(LLM)的设计原则更紧密地对齐.具体而言,我们采用 RMSNorm 进行归一化,SwiGLU 作为激活函数.这些选择提升了计算效率以及模型视觉和语言组件之间的兼容性.</p>
<p>在训练方面,我们从头训练重新设计的 ViT.训练过程包括多个阶段,包括 CLIP 预训练、视觉-语言对齐和端到端微调.为确保在不同输入分辨率下的稳健性,我们在训练期间采用原生分辨率的动态采样.图像根据其原始长宽比随机采样,使模型能够有效泛化到不同分辨率的输入.这种方法不仅提高了模型的适应性,还确保了在不同尺寸视觉数据上的稳定和高效训练.</p>
<blockquote>
<p>Window Attention 在视觉Encoder 中的引入是一个务实的工程选择.原生分辨率输入的 ViT 面临的核心问题是:一张 4K 图像可能产生数千个 patch,全局注意力的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>n</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 复杂度会让计算量爆炸.Window Attention 将注意力限制在 112×112 的局部窗口内,把复杂度降到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>n</mi><mo>⋅</mo><mi>w</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n \\cdot w)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mclose">)</span></span></span></span>(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>w</mi></mrow><annotation encoding="application/x-tex">w</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span></span></span></span> 为窗口大小).但代价是模型需要通过「全注意力层」(第 7/15/23/31 层)来聚合全局信息——这类似于 Swin Transformer 的 shifted window 设计,但更加简化:不需要复杂的窗口偏移,而是直接间隔插入全局注意力层.从表 1 可以看到,所有三个尺寸的 ViT 配置完全相同,这说明视觉感知能力在不同模型规模间被统一了,差异化主要来自 LLM 的推理深度.</p>
</blockquote>
<h4 id="2-1-2-ysdtfbsyzs">2.1.2 原生动态分辨率与帧率</h4>
<p>Qwen2.5-VL 在空间和时间维度上均引入了进展,以有效处理多样化的多模态输入.</p>
<p>在空间域,Qwen2.5-VL 将不同尺寸的图像动态转换为对应长度的 token 序列.与传统方法归一化坐标不同,我们的模型直接使用输入图像的实际尺寸来表示边界框、点和其他空间特征.这使得模型能够固有地学习尺度信息,提升其跨不同分辨率处理图像的能力.</p>
<p>对于视频输入,Qwen2.5-VL 整合了动态帧率(FPS)训练和绝对时间编码.通过适应可变的帧率,模型能够更好地捕捉视频内容的时间动态.与其他方法引入文本时间戳或使用额外头来实现时间定位不同,我们引入了一种新颖且高效的策略:直接将 MRoPE ID 与时间戳对齐.这种方法允许模型通过时间维度 ID 之间的间隔来理解时间节奏,无需任何额外的计算开销.</p>
<blockquote>
<p>这里的设计取舍很有意思.传统的视频理解模型通常采用「固定帧采样」策略——比如每秒取 1 帧或 2 帧,所有视频都被统一到相同的帧率.这会导致两个问题:一是慢动作视频被过度采样,产生大量冗余 token;二是快动作视频被欠采样,丢失关键信息.Qwen2.5-VL 的「动态 FPS 采样」让模型在训练时接触不同帧率的视频样本,学会了根据内容密度自适应地处理时间信息.而「绝对时间编码」则是将 MRoPE 的时间维度从「第几帧」升级为「第几秒」,这使得模型能够直接理解真实世界的时间概念——比如「视频第 3 分 15 秒发生了什么」——而不需要将秒数转换为帧数再输入模型.</p>
</blockquote>
<h4 id="2-1-3-dqjdsjddmtxzwzbm-m-ro-pe">2.1.3 对齐绝对时间的多模态旋转位置编码 (MRoPE)</h4>
<p>位置嵌入对于建模视觉和语言模态中的序列数据至关重要.在 Qwen2-VL 引入的 MRoPE 基础上,我们扩展了其能力以更好地处理视频中的时间信息.</p>
<p>Qwen2-VL 中的 MRoPE 将位置嵌入分解为三个不同组件:时间、高度和宽度,以有效建模多模态输入.对于文本输入,所有三个组件使用相同的位置 ID,使 MRoPE 在功能上等同于传统的 1D RoPE.对于图像,时间 ID 在视觉 token 间保持恒定,而高度和宽度组件根据每个 token 在图像中的空间位置分配唯一 ID.处理视频时(视频被视为帧序列),时间 ID 随每帧递增,而高度和宽度组件遵循与静态图像相同的分配模式.</p>
<p>然而,在 Qwen2-VL 中,MRoPE 的时间位置 ID 与输入帧数绑定,这没有考虑内容变化的速度或视频中事件的绝对时间.为解决这一局限,Qwen2.5-VL 引入了一项关键改进:将 MRoPE 的时间组件与绝对时间对齐.如图 1 所示,通过利用时间 ID 之间的间隔,模型能够学习跨不同 FPS 采样率视频的一致时间对齐.</p>
<blockquote>
<p>MRoPE 的时间对齐升级是从「相对帧位置」到「绝对时间戳」的质变.在 Qwen2-VL 中,如果时间 ID 是 [0, 1, 2, 3],模型只知道「这是第 0/1/2/3 帧」,但不知道每帧之间间隔多少秒.如果两个视频的帧率不同(一个 24fps,一个 60fps),相同的帧序列对应的真实时间长度完全不同,但模型无法区分.Qwen2.5-VL 通过将时间 ID 直接与秒数对齐——比如 [0, 2, 4, 6] 表示「第 0/2/4/6 秒」——模型可以直接从 ID 间隔推断事件节奏.这不仅提升了视频理解的精度,还为秒级事件定位提供了数学基础.</p>
</blockquote>
<h3 id="2-2-yxl-pre-training">2.2 预训练 (Pre-Training)</h3>
<h4 id="2-2-1-yxlsj">2.2.1 预训练数据</h4>
<p>与 Qwen2-VL 相比,我们显著扩展了预训练数据的规模,从 1.2 万亿 token 增加到约 4 万亿 token.我们的预训练数据集通过多种方法构建,包括清洗原始网页数据、合成数据等.数据集涵盖多种多模态数据,如图像描述、交错图文数据、OCR 数据、视觉知识(如名人、地标、动植物识别)、多模态学术问题、定位数据、文档解析数据、视频描述、视频定位和基于智能体的交互数据.在训练过程中,我们在不同阶段仔细调整了这些数据类型的组成和比例以优化学习效果.</p>
<p><strong>交错图文数据 (Interleaved Image-Text Data)</strong></p>
<p>交错图文数据对多模态学习至关重要,提供三个关键优势: (1) 实现带有同时视觉和文本线索的上下文学习; (2) 在图像缺失时保持强大的纯文本能力; (3) 包含广泛的通用信息.然而,许多可用的交错数据缺乏有意义的图文关联且往往带有噪声,限制了其在复杂推理和创意生成中的实用性.</p>
<p>为解决这些问题,我们开发了一个数据打分和清洗流程.我们的流程包括两步:标准数据清洗,随后使用内部评估模型进行四阶段打分系统.打分标准包括: (1) 纯文本质量; (2) 图文相关性; (3) 图文互补性; (4) 信息密度平衡.</p>
<ul>
<li><strong>图文相关性</strong>: 分数越高表示图像与文本之间的联系越强,图像有意义地补充、解释或扩展文本,而非仅仅装饰.</li>
<li><strong>信息互补性</strong>: 分数越高反映图像与文本之间的互补信息越多.每者应提供独特的细节,共同构成完整的叙述.</li>
<li><strong>信息密度平衡</strong>: 分数越高意味着图像与文本之间的信息分布越均衡,避免文本或图像信息过度冗余,确保两者之间适当的平衡.</li>
</ul>
<p><strong>基于绝对位置坐标的定位数据 (Grounding Data)</strong></p>
<p>我们采用原生分辨率训练,旨在实现更准确的世界感知.相比之下,相对坐标无法有效表示图像中物体的原始大小和位置.为解决这一局限,Qwen2.5-VL 在训练时使用基于输入图像实际尺寸的坐标值来表示边界框和点.这种方法确保模型能够更好地捕捉物体的真实世界尺度和空间关系,从而在物体检测和定位等任务上提升性能.</p>
<p>为提升定位能力的泛化性,我们开发了一个涵盖边界框和点及其指代表达的综合性数据集,利用公开数据集和专有数据.我们的方法涉及将数据合成为多种格式,包括 XML、JSON 和自定义格式,采用 copy-paste augmentation 等技术以及使用 Grounding DINO 和 SAM 等现成模型进行合成.为提升模型在开放词汇检测上的性能,我们将训练数据集扩展到超过 1 万个物体类别.此外,为提升模型在极端物体检测场景中的效果,我们在查询中合成了不存在的物体类别,并构建了包含每个物体多个实例的图像数据.</p>
<p>为确保卓越的基于点的物体定位能力,我们构建了一个包含公开数据和合成数据的综合性指向数据集.具体而言,数据来源包括 PixMo 的公开指向和计数数据、公开可获取的物体定位数据(来自物体检测和实例分割任务),以及通过自动化流程生成的精确指向特定图像细节的合成数据.</p>
<p><strong>文档全能解析数据 (Document Omni-Parsing Data)</strong></p>
<p>为训练 Qwen2.5-VL,我们合成了大量文档数据.传统的文档内容解析方法通常依赖单独的模型来处理版面分析、文本提取、图表解读和插图处理.相比之下,Qwen2.5-VL 旨在赋予通用模型全面的解析、理解和转换文档格式的能力.具体而言,我们在文档中整合了多种元素,如表格、图表、公式、自然或合成图像、乐谱和化学式.这些元素统一以 HTML 格式表示,将版面框信息和插图描述整合到 HTML 标签结构中.我们还根据典型阅读顺序丰富了文档版面,并在基于 HTML 的 ground truth 中包含了每个模块(如段落和图表)对应的坐标.这种创新方法使得任何文档的完整信息——包括其版面、文本、图表和插图——都能以标准化和统一的方式表示.因此,Qwen2.5-VL 实现了多模态文档元素的无缝整合,从而促进更高效和准确的文档理解和转换.</p>
<p><strong>QwenVL HTML 格式示例</strong>:</p>
<pre><code class="language-html">&lt;html&gt;&lt;body&gt;
&lt;!-- paragraph --&gt;
&lt;p data-bbox=&quot;x1 y1 x2 y2&quot;&gt; content &lt;/p&gt;
&lt;!-- table --&gt;
&lt;style&gt;table{id} style&lt;/style&gt;
&lt;table data-bbox=&quot;x1 y1 x2 y2&quot; class=&quot;table{id}&quot;&gt; table content &lt;/table&gt;
&lt;!-- chart --&gt;
&lt;div class=&quot;chart&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;table&gt; chart content &lt;/table&gt;
&lt;/div&gt;
&lt;!-- formula --&gt;
&lt;div class=&quot;formula&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;div&gt; formula content &lt;/div&gt;
&lt;/div&gt;
&lt;!-- image caption --&gt;
&lt;div class=&quot;image caption&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;p&gt; image caption &lt;/p&gt;
&lt;/div&gt;
&lt;!-- image ocr --&gt;
&lt;div class=&quot;image ocr&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;p&gt; image ocr &lt;/p&gt;
&lt;/div&gt;
&lt;!-- music sheet --&gt;
&lt;div class=&quot;music sheet&quot; format=&quot;abc notation&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;div&gt; music sheet content &lt;/div&gt;
&lt;/div&gt;
&lt;!-- chemical formula --&gt;
&lt;div class=&quot;chemical formula&quot; format=&quot;smile&quot; data-bbox=&quot;x1 y1 x2 y2&quot;&gt;
  &lt;img data-bbox=&quot;x1 y1 x2 y2&quot; /&gt;
  &lt;div&gt; chemical formula content &lt;/div&gt;
&lt;/div&gt;
&lt;/html&gt;&lt;/body&gt;
</code></pre>
<blockquote>
<p>这个 HTML 格式的选择体现了「统一表示」的工程思想.传统文档解析是 pipeline 式的:先 OCR 提取文字,再版面分析确定区域关系,再图表识别转换数据——每个环节独立,误差会累积.Qwen2.5-VL 的 HTML 格式将所有信息(文本、坐标、图表内容、公式)编码在一个结构化文档中,模型可以端到端地学习「从像素到结构化输出」的映射.这类似于网页浏览器渲染 HTML 的方式——模型本质上被训练成了一个「视觉浏览器」,能够「渲染」图像内容为结构化标记.但挑战在于 HTML 的序列长度:一个复杂文档的 HTML 表示可能包含数千个 token,这对训练和推理的序列长度管理提出了更高要求.</p>
</blockquote>
<p><strong>OCR 数据</strong></p>
<p>我们从不同来源收集和整理数据以增强 OCR 性能,包括合成数据、开源数据和内部收集数据.合成数据通过视觉文本生成引擎产生高质量的野外文本图像.为支持更广泛的语言并增强多语言能力,我们整合了一个大规模多语言 OCR 数据集.该数据集支持法语、德语、意大利语、西班牙语、葡萄牙语、阿拉伯语、俄语、日语、韩语和越南语等多种语言.数据集经过精心整理以确保多样性和质量,利用高质量合成图像和真实世界自然场景图像的结合.对于图表类数据,我们使用 matplotlib、seaborn 和 plotly 等可视化库合成了 100 万个样本,涵盖条形图、关系图和热图等图表类别.关于表格数据,我们通过离线端到端表格识别模型处理了 600 万个真实样本,随后过滤掉低置信度表格、重叠表格和单元格密度不足的表格.</p>
<p><strong>视频数据</strong></p>
<p>为确保对具有不同帧率(FPS)的视频数据具备更强的鲁棒性理解,我们在训练期间动态采样 FPS,以实现训练数据集中 FPS 的更均匀分布.此外,对于超过半小时的视频,我们通过定向合成流程合成多帧描述来构建一组长视频描述.关于视频定位数据,我们以秒制格式和时分秒帧(hmsf)格式构建时间戳,确保模型能够准确理解和以各种格式输出时间.</p>
<p><strong>智能体数据 (Agent Data)</strong></p>
<p>我们增强感知和决策能力以构建 Qwen2.5-VL 的智能体能力.在感知方面,我们收集移动端、Web 端和桌面端的截图.使用合成数据引擎生成截图描述和 UI 元素定位标注.描述任务帮助 Qwen2.5-VL 理解图形界面,而定位任务帮助它对齐元素的外观和功能.在决策方面,我们首先将移动端、Web 端和桌面端的操作统一为具有共享动作空间的功能调用格式.一组来自开源数据和通过智能体框架在虚拟环境中合成的带标注多步轨迹被重新格式化为功能格式.我们进一步通过人类和模型标注者为每一步生成推理过程.具体而言,给定一个 ground-truth 操作,我们在截图上高亮显示它.然后,我们向标注者提供全局查询以及操作前后的截图,要求他们撰写推理内容来解释该操作背后的意图.使用基于模型的过滤器筛选低质量的推理内容.这种推理内容防止 Qwen2.5-VL 对 ground-truth 操作过拟合,使其在真实场景中更加鲁棒.</p>
<p><strong>表 2: 不同阶段的训练数据量和组成</strong></p>
<table>
<thead>
<tr>
<th align="left">阶段</th>
<th align="left">视觉预训练</th>
<th align="left">多模态预训练</th>
<th align="left">长上下文预训练</th>
</tr>
</thead>
<tbody><tr>
<td align="left">数据</td>
<td align="left">图像描述、知识、OCR</td>
<td align="left">+ 纯文本、交错数据、VQA、视频、定位、智能体</td>
<td align="left">+ 长视频、长智能体、长文档</td>
</tr>
<tr>
<td align="left">Token 量</td>
<td align="left">1.5T</td>
<td align="left">2T</td>
<td align="left">0.6T</td>
</tr>
<tr>
<td align="left">序列长度</td>
<td align="left">8192</td>
<td align="left">8192</td>
<td align="left">32768</td>
</tr>
<tr>
<td align="left">训练对象</td>
<td align="left">ViT</td>
<td align="left">ViT &amp; LLM</td>
<td align="left">ViT &amp; LLM</td>
</tr>
</tbody></table>
<blockquote>
<p>预训练数据从 1.2T 扩展到 4.1T 是一个巨大的飞跃,但更重要的是数据构成的质变.第一阶段仅训练 ViT,使用「图像描述+知识+OCR」这类「视觉基础任务」数据,目的是让视觉Encoder 学会提取与语言对齐的特征.第二阶段解锁所有参数,引入交错数据、VQA、视频、定位和智能体数据——这些是需要视觉和语言深度交互的「高级任务」.第三阶段专门处理长序列(32K),加入长视频、长智能体和长文档数据.这种分阶段策略的洞察是:如果一开始就训练长序列,模型会在学习基础视觉表示的同时承担长距离注意力的负担,导致两方面都学不好.先让模型学好「看」,再让它学会「看懂并推理」,最后再训练「长时间看懂并推理」——这是一个由浅入深的渐进式学习路径.</p>
</blockquote>
<h4 id="2-2-2-xlpf-training-recipe">2.2.2 训练配方 (Training Recipe)</h4>
<p>我们使用 DataComp 和一些内部数据集从头训练 Vision Transformer (ViT) 作为视觉Encoder 的初始化,同时利用预训练的 Qwen2.5 大语言模型作为 LLM 组件的初始化.如表 2 所示,预训练过程分为三个不同的阶段,每个阶段采用不同的数据配置和训练策略以逐步增强模型能力.</p>
<p><strong>第一阶段</strong>: 仅训练 Vision Transformer (ViT) 以提升其与语言模型的对齐,为多模态理解奠定坚实基础.该阶段的主要数据源包括图像描述、视觉知识和 OCR 数据.这些数据集经过精心选择,以培养 ViT 提取可与文本信息有效整合的有意义视觉表示的能力.</p>
<p><strong>第二阶段</strong>: 解冻所有模型参数,模型在多样化的多模态图像数据上训练以增强其处理复杂视觉信息的能力.该阶段引入了更复杂和需要推理的数据集,如交错数据、多任务学习数据集、视觉问答(VQA)、多模态数学、基于智能体的任务、视频理解和纯文本数据集.这些数据集增强了模型在视觉和语言模态之间建立更深连接的能力,使其能够处理日益复杂的任务.</p>
<p><strong>第三阶段</strong>: 为进一步增强模型在长序列上的推理能力,引入了视频和基于智能体的数据,同时增加了序列长度.这使模型能够以更高精度处理更先进和复杂的多模态任务.通过扩展序列长度,模型获得了处理扩展上下文的能力,这对于需要长距离依赖和复杂推理的任务尤为有益.</p>
<p>为应对不同图像尺寸和文本长度带来的计算负载不均衡问题,我们采用了优化训练效率的策略.主要计算成本来自 LLM 和视觉Encoder .鉴于视觉Encoder 参数相对较少,且我们引入了 Window Attention 进一步降低其计算需求,我们专注于平衡不同 GPU 上 LLM 的计算负载.具体而言,我们根据输入 LLM 的序列长度动态打包数据样本,确保一致的计算负载.在第一和第二阶段,数据被统一打包到 8192 的序列长度;在第三阶段,序列长度增加到 32768 以适应模型处理更长序列的增强能力.</p>
<h3 id="2-3-hxl-post-training">2.3 后训练 (Post-training)</h3>
<p>Qwen2.5-VL 的后训练对齐框架采用双阶段优化范式,包括监督微调(SFT)和 Direct Preference Optimization (DPO, 直接偏好优化).这种分层对齐策略协同了参数高效的领域适应与人类偏好蒸馏,通过不同的优化目标同时解决表示 grounding 和行为细化.</p>
<p>监督微调(SFT)旨在通过有针对性的指令优化来弥合预训练表示与下游任务需求之间的差距.在此阶段,我们采用 ChatML 格式来构建指令遵循数据,刻意偏离预训练数据模式,同时保持与 Qwen2-VL 的架构一致性.这种格式转换实现了三个关键适应: (1) 用于多模态轮次转换的显式对话角色标记; (2) 视觉嵌入与文本指令的结构化注入; (3) 通过格式感知打包保留跨模态位置关系.通过让模型在这种增强模式下接触精心策划的多模态指令-响应对,SFT 实现了高效的知识迁移,同时保持了预训练特征的完整性.</p>
<h4 id="2-3-1-zlsj-instruction-data">2.3.1 指令数据 (Instruction Data)</h4>
<p>SFT 阶段采用了一个精心策划的数据集,旨在增强模型在多样化模态上的指令遵循能力.该数据集包含约 200 万个条目,在纯文本数据(50%)和多模态数据(50%,包括图文和视频-文本组合)之间均匀分布.多模态数据的 inclusion 使模型能够有效处理复杂输入.值得注意的是,虽然纯文本和多模态条目的数量相等,但由于嵌入的视觉和时间信息,多模态条目在训练期间消耗的 token 和计算资源明显更多.数据集主要由中文和英文数据组成,辅以多语言条目以支持更广泛的语言多样性.</p>
<p>数据集被构建为反映不同层次的对话复杂性,包括单轮和多轮交互.这些交互进一步通过从单图像输入到多图像序列的场景进行上下文化,从而模拟真实的对话动态.查询来源主要来自开源仓库,辅以策划的购买数据集和在线查询数据.这种组合确保了广泛的覆盖范围并增强了数据集的代表性.</p>
<p>为应对广泛的应用场景,数据集包括通用视觉问答(VQA)、图像描述、数学解题、编码任务和安全相关查询的专门子集.此外,还构建了用于文档和 OCR、定位、视频分析和智能体交互的专门数据集以增强领域特定的熟练度.</p>
<h4 id="2-3-2-sjgllc-data-filtering-pipeline">2.3.2 数据过滤流程 (Data Filtering Pipeline)</h4>
<p>训练数据的质量是影响视觉语言模型性能的关键因素.开源和合成数据集通常表现出显著的差异性,往往包含噪声、冗余或低质量样本.因此,严格的清洗和过滤流程对于解决这些问题至关重要.</p>
<p>我们实现了一个两阶段数据过滤流程,旨在系统性地提升 SFT 数据集的质量:</p>
<p><strong>阶段 1: 领域特定分类</strong></p>
<p>在初始阶段,我们使用 Qwen2-VL-Instag(从 Qwen2-VL-72B 派生的专门分类模型)对问答(QA)对进行层次分类.该模型将 QA 对组织为八个主要领域(如 Coding 和 Planning),进一步细分为 30 个细分子类别.例如,Coding 主领域被细分为 Code_Debugging、Code_Generation、Code_Translation 和 Code_Understanding 等子类别.这种层次结构促进了领域感知和子领域感知的过滤策略,使流程能够针对每个类别的特定特征优化数据清洗过程.</p>
<p><strong>阶段 2: 领域定制过滤</strong></p>
<p>第二阶段涉及领域定制过滤,整合基于规则和基于模型的方法以全面提升数据质量.鉴于文档处理、OCR 和视觉定位等领域性质多样,每个领域可能需要独特的过滤策略.</p>
<ul>
<li><strong>基于规则的过滤</strong>: 采用预定义的启发式方法消除低质量或有问题的条目.具体而言,对于与文档处理、OCR 和视觉定位任务相关的数据集,识别并移除重复模式以防止扭曲模型的学习过程并确保最优性能.此外,排除包含不完整、截断或格式不当响应的条目——这在合成数据集和多模态上下文中很常见.为保持相关性并维护伦理标准,还丢弃不相关或可能导致有害输出的查询和答案.</li>
<li><strong>基于模型的过滤</strong>: 利用在 Qwen2.5-VL 系列上训练的奖励模型来评估多模态 QA 对.查询根据复杂性和相关性进行评估,仅保留适当具有挑战性和上下文相关的示例.答案根据正确性、完整性、清晰性、与查询的相关性和有用性进行评估.在视觉定位任务中,特别注意验证视觉信息的准确解读和利用.这种多维评分确保只有高质量数据进入 SFT 阶段.</li>
</ul>
<blockquote>
<p>这个数据过滤 pipeline 体现了「从通用到专用」的渐进式质量控制思想.第一阶段用分类模型(Instag)把数据分到 8 大领域 30 细分类别,这意味着后续过滤策略可以「对症下药」——数学题的过滤标准(答案是否正确)与文档解析的过滤标准(HTML 格式是否完整)完全不同.第二阶段的双轨制(规则+模型)则兼顾了效率和精度:规则过滤快速剔除明显的垃圾数据,模型过滤则处理更微妙的质量问题.值得注意的是,这里使用的奖励模型是在 Qwen2.5-VL 系列上训练的,这意味着数据过滤和模型训练形成了一个闭环:更好的模型产生更好的过滤标准,更好的过滤标准产出更好的训练数据.</p>
</blockquote>
<h4 id="2-3-3-jjcyzqtl-rejection-sampling-for-enhanced-reasoning">2.3.3 拒绝采样增强推理 (Rejection Sampling for Enhanced Reasoning)</h4>
<p>为补充结构化的数据过滤流程,我们采用拒绝采样作为精炼数据集和增强视觉语言模型推理能力的策略.这种方法对于需要复杂推理的任务尤为关键,如数学解题、代码生成和领域特定的视觉问答(VQA).先前研究表明,引入 Chain-of-Thought (CoT, 思维链)推理显著提升了模型的推理性能.我们的后训练实验证实了这一点,强调了结构化推理过程对于实现高质量结果的重要性.</p>
<p>拒绝采样流程从包含 ground truth 标注的数据集开始.这些数据集经过精心策划,包括需要多步推理的任务,如数学解题、代码生成和领域特定 VQA.使用 Qwen2.5-VL 的中间版本,我们将生成的响应与 ground truth 进行评估.仅保留模型输出与预期答案匹配的样本,确保数据集仅由高质量、准确的示例组成.</p>
<p>为进一步提升数据质量,我们应用额外的约束来过滤掉不良输出.具体而言,我们排除表现出代码切换(code-switching)、过长或重复模式的响应.这些标准确保 CoT 推理过程的清晰性和连贯性,这对下游应用至关重要.</p>
<p>将 CoT 推理应用于视觉语言模型的一个关键挑战是它们对文本和视觉模态的依赖.中间推理步骤可能无法充分整合视觉信息,要么忽略相关视觉线索,要么误解它们.为解决这一问题,我们开发了基于规则和模型驱动的过滤策略来验证中间推理步骤的准确性.这些机制确保 CoT 过程中的每一步都有效整合视觉和文本模态.尽管做出了这些努力,实现最优的模态对齐仍然是一个持续的挑战,需要进一步的进步.</p>
<p>通过拒绝采样生成的数据显著增强了模型的推理能力.通过迭代精炼数据集并移除低质量或错误样本,我们使模型能够从强调准确和连贯推理的高质量示例中学习.这种方法不仅增强了模型处理复杂任务的能力,还为视觉语言建模的未来改进奠定了基础.</p>
<h4 id="2-3-4-hxlpf-training-recipe">2.3.4 后训练配方 (Training Recipe)</h4>
<p>Qwen2.5-VL 的后训练过程包括两个阶段:监督微调(SFT)和 Direct Preference Optimization (DPO),两个阶段均冻结 Vision Transformer (ViT) 参数.在 SFT 阶段,模型在多样化的多模态数据上微调,包括图文对、视频和纯文本,数据来源包括通用 VQA、拒绝采样和专门数据集(如文档和 OCR、定位、视频和智能体相关任务).DPO 阶段专注于图文和纯文本数据,利用偏好数据将模型与人类偏好对齐,每个样本仅处理一次以确保高效优化.这一精简流程增强了模型的跨模态推理和任务特定性能,同时保持与用户意图的对齐.</p>
<blockquote>
<p>后训练冻结 ViT 是一个重要的工程决策.预训练阶段已经让 ViT 学会了「如何看」,后训练的目标是让 LLM 学会「如何基于视觉信息推理和回应」.如果同时微调 ViT,模型可能会在 SFT 阶段过度适应指令数据的特定视觉模式,损害预训练阶段学到的通用视觉表示.DPO 阶段仅使用图文和纯文本数据(不含视频和智能体数据),这可能是因为偏好数据的收集成本较高,而视频和智能体任务的偏好标注尤其困难——如何定义「更好的视频理解」或「更好的智能体操作」缺乏统一标准.</p>
</blockquote>
<hr>
<h2 id="3-sy-experiments">3. 实验 (Experiments)</h2>
<h3 id="3-1-y-sota-mxdbj">3.1 与 SOTA 模型的比较</h3>
<p><strong>表 3: Qwen2.5-VL 与 SOTA 模型性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">前代开源 SOTA</th>
<th align="center">Claude-3.5 Sonnet-0620</th>
<th align="center">GPT-4o-0513</th>
<th align="center">InternVL2.5-78B</th>
<th align="center">Qwen2-VL-72B</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="center">Qwen2.5-VL-7B</th>
<th align="center">Qwen2.5-VL-3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>大学级问题</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMMU_val</td>
<td align="center">70.1</td>
<td align="center">68.3</td>
<td align="center">69.1</td>
<td align="center">70.1</td>
<td align="center">64.5</td>
<td align="center"><strong>70.2</strong></td>
<td align="center">58.6</td>
<td align="center">53.1</td>
</tr>
<tr>
<td align="left">MMMU-Pro_overall</td>
<td align="center">48.6</td>
<td align="center">51.5</td>
<td align="center"><strong>51.9</strong></td>
<td align="center">48.6</td>
<td align="center">46.2</td>
<td align="center">51.1</td>
<td align="center">38.3</td>
<td align="center">31.56</td>
</tr>
<tr>
<td align="left"><strong>数学</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MathVista_mini</td>
<td align="center">72.3</td>
<td align="center">67.7</td>
<td align="center">63.8</td>
<td align="center">72.3</td>
<td align="center">70.5</td>
<td align="center"><strong>74.8</strong></td>
<td align="center">68.2</td>
<td align="center">62.3</td>
</tr>
<tr>
<td align="left">MATH-Vision_full</td>
<td align="center">32.2</td>
<td align="center">-</td>
<td align="center">30.4</td>
<td align="center">32.2</td>
<td align="center">25.9</td>
<td align="center"><strong>38.1</strong></td>
<td align="center">25.1</td>
<td align="center">21.2</td>
</tr>
<tr>
<td align="left">MathVerse_mini</td>
<td align="center">51.7</td>
<td align="center">-</td>
<td align="center">50.2</td>
<td align="center">51.7</td>
<td align="center">-</td>
<td align="center"><strong>57.6</strong></td>
<td align="center">49.2</td>
<td align="center">47.6</td>
</tr>
<tr>
<td align="left"><strong>通用视觉问答</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MegaBench</td>
<td align="center">47.4</td>
<td align="center">52.1</td>
<td align="center"><strong>54.2</strong></td>
<td align="center">45.6</td>
<td align="center">46.8</td>
<td align="center">51.3</td>
<td align="center">36.8</td>
<td align="center">28.9</td>
</tr>
<tr>
<td align="left">MMBench-EN_test</td>
<td align="center">88.3</td>
<td align="center">82.6</td>
<td align="center">83.4</td>
<td align="center">88.3</td>
<td align="center">86.9</td>
<td align="center"><strong>88.6</strong></td>
<td align="center">83.5</td>
<td align="center">79.1</td>
</tr>
<tr>
<td align="left">MMBench-CN_test</td>
<td align="center">88.5</td>
<td align="center">83.5</td>
<td align="center">82.1</td>
<td align="center"><strong>88.5</strong></td>
<td align="center">86.7</td>
<td align="center">87.9</td>
<td align="center">83.4</td>
<td align="center">78.1</td>
</tr>
<tr>
<td align="left">MMBench-V1.1-EN_test</td>
<td align="center">87.4</td>
<td align="center">80.9</td>
<td align="center">83.1</td>
<td align="center">87.4</td>
<td align="center">86.1</td>
<td align="center"><strong>88.4</strong></td>
<td align="center">82.6</td>
<td align="center">77.4</td>
</tr>
<tr>
<td align="left">MMStar</td>
<td align="center">69.5</td>
<td align="center">65.1</td>
<td align="center">64.7</td>
<td align="center">69.5</td>
<td align="center">68.3</td>
<td align="center"><strong>70.8</strong></td>
<td align="center">63.9</td>
<td align="center">55.9</td>
</tr>
<tr>
<td align="left">MME_sum</td>
<td align="center"><strong>2494</strong></td>
<td align="center">1920</td>
<td align="center">2328</td>
<td align="center"><strong>2494</strong></td>
<td align="center">2483</td>
<td align="center">2448</td>
<td align="center">2347</td>
<td align="center">2157</td>
</tr>
<tr>
<td align="left">MuirBench</td>
<td align="center">63.5</td>
<td align="center">-</td>
<td align="center">68.0</td>
<td align="center">63.5</td>
<td align="center">-</td>
<td align="center"><strong>70.7</strong></td>
<td align="center">59.6</td>
<td align="center">47.7</td>
</tr>
<tr>
<td align="left">BLINK_val</td>
<td align="center">63.8</td>
<td align="center">-</td>
<td align="center"><strong>68.0</strong></td>
<td align="center">63.8</td>
<td align="center">-</td>
<td align="center">64.4</td>
<td align="center">56.4</td>
<td align="center">47.6</td>
</tr>
<tr>
<td align="left">CRPE_relation</td>
<td align="center">78.8</td>
<td align="center">-</td>
<td align="center">76.6</td>
<td align="center">78.8</td>
<td align="center">-</td>
<td align="center"><strong>79.2</strong></td>
<td align="center">76.4</td>
<td align="center">73.6</td>
</tr>
<tr>
<td align="left">HallBench_avg</td>
<td align="center"><strong>58.1</strong></td>
<td align="center">55.5</td>
<td align="center">55.0</td>
<td align="center">57.4</td>
<td align="center"><strong>58.1</strong></td>
<td align="center">55.2</td>
<td align="center">52.9</td>
<td align="center">46.3</td>
</tr>
<tr>
<td align="left">MTVQA_test</td>
<td align="center"><strong>31.9</strong></td>
<td align="center">25.7</td>
<td align="center">27.8</td>
<td align="center">31.9</td>
<td align="center">30.9</td>
<td align="center">31.7</td>
<td align="center">29.2</td>
<td align="center">24.8</td>
</tr>
<tr>
<td align="left">RealWorldQA_avg</td>
<td align="center">78.7</td>
<td align="center">60.1</td>
<td align="center">75.4</td>
<td align="center"><strong>78.7</strong></td>
<td align="center">77.8</td>
<td align="center">75.7</td>
<td align="center">68.5</td>
<td align="center">65.4</td>
</tr>
<tr>
<td align="left">MME-RealWorld_en</td>
<td align="center">62.9</td>
<td align="center">51.6</td>
<td align="center">45.2</td>
<td align="center">62.9</td>
<td align="center">-</td>
<td align="center"><strong>63.2</strong></td>
<td align="center">57.4</td>
<td align="center">53.1</td>
</tr>
<tr>
<td align="left">MMVet_turbo</td>
<td align="center">74.0</td>
<td align="center">70.1</td>
<td align="center">69.1</td>
<td align="center">72.3</td>
<td align="center">74.0</td>
<td align="center"><strong>76.2</strong></td>
<td align="center">67.1</td>
<td align="center">61.8</td>
</tr>
<tr>
<td align="left">MM-MT-Bench</td>
<td align="center">7.4</td>
<td align="center">7.5</td>
<td align="center"><strong>7.72</strong></td>
<td align="center">-</td>
<td align="center">6.59</td>
<td align="center">7.6</td>
<td align="center">6.3</td>
<td align="center">5.7</td>
</tr>
</tbody></table>
<p>实验部分在多种数据集上评估了 Qwen2.5-VL 的性能,与当前 SOTA 模型进行了比较,包括 Claude-3.5-Sonnet-0620、GPT-4o-0513、InternVL2.5 和不同尺寸的 Qwen2-VL.</p>
<p>在大学级问题中,Qwen2.5-VL-72B 在 MMMU 上取得 70.2 分.对于 MMMU-Pro,Qwen2.5-VL-72B 得分 51.1,超越了前代开源 SOTA 模型,达到了与 GPT-4o 相当的性能.</p>
<p>在数学相关任务中,Qwen2.5-VL-72B 展现出强大能力.在 MathVista 上取得 74.8 分,超越了前代开源 SOTA 的 72.3 分.在 MATH-Vision 上得分 38.1,MathVerse 上得分 57.6,与其他领先模型相比均展现出竞争力.</p>
<p>在通用视觉问答方面,Qwen2.5-VL-72B 在多个基准上表现出色.在 MMBench-EN 上取得 88.6 分,略微超越了前代最佳分数 88.3.模型在 MuirBench 上得分 70.7,BLINK 上得分 64.4.在多语言能力评估 MTVQA 上,Qwen2.5-VL-72B 取得 31.7 分,展示了其强大的多语言文本识别能力.在主观评估如 MMVet 和 MM-MT-Bench 上,Qwen2.5-VL-72B 分别得分 76.2 和 7.6,展示了出色的自然对话体验和用户满意度.</p>
<blockquote>
<p>从表 3 可以观察到几个有趣的模式.首先,Qwen2.5-VL-72B 在 MathVista(74.8)和 MATH-Vision(38.1)上相比 Qwen2-VL-72B(70.5 和 25.9)有巨大提升,尤其是 MATH-Vision 提升了 12.2 分.这反映了 4.1T token 预训练语料中数学和视觉推理数据的贡献.其次,在 MME 上 Qwen2.5-VL-72B(2448)略低于 Qwen2-VL-72B(2483)和 InternVL2.5-78B(2494),说明在某些细粒度感知任务上前代模型仍有优势.最后,7B 和 3B 小模型在 MMBench 系列上的分数(83.5/82.6)已经非常接近 72B 模型的水平(88.6/88.4),说明通用 VQA 能力在一定程度上可以「压缩」到更小的模型中.</p>
</blockquote>
<h3 id="3-2-cwbrwxn">3.2 纯文本任务性能</h3>
<p>为严格评估指令微调模型在纯文本任务上的性能,我们选择了多个代表性基准来评估模型在通用任务、数学与科学任务、编码任务和对齐任务方面的能力.</p>
<p><strong>表 4: 70B+ Instruct 模型与 Qwen2.5-VL 的纯文本任务性能</strong></p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">Llama-3.1-70B</th>
<th align="center">Llama-3.1-405B</th>
<th align="center">Qwen2-72B</th>
<th align="center">Qwen2.5-72B</th>
<th align="center">Qwen2.5-VL-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>通用任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">MMLU-Pro</td>
<td align="center">66.4</td>
<td align="center"><strong>73.3</strong></td>
<td align="center">64.4</td>
<td align="center">71.1</td>
<td align="center">71.2</td>
</tr>
<tr>
<td align="left">MMLU-redux</td>
<td align="center">83.0</td>
<td align="center">86.2</td>
<td align="center">81.6</td>
<td align="center"><strong>86.8</strong></td>
<td align="center">85.9</td>
</tr>
<tr>
<td align="left">LiveBench-0831</td>
<td align="center">46.6</td>
<td align="center">53.2</td>
<td align="center">41.5</td>
<td align="center">52.3</td>
<td align="center"><strong>57.0</strong></td>
</tr>
<tr>
<td align="left"><strong>数学与科学</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">GPQA</td>
<td align="center">46.7</td>
<td align="center"><strong>51.1</strong></td>
<td align="center">42.4</td>
<td align="center">49.0</td>
<td align="center">49.0</td>
</tr>
<tr>
<td align="left">MATH</td>
<td align="center">68.0</td>
<td align="center">73.8</td>
<td align="center">69.0</td>
<td align="center"><strong>83.1</strong></td>
<td align="center">83.0</td>
</tr>
<tr>
<td align="left">GSM8K</td>
<td align="center">95.1</td>
<td align="center"><strong>96.8</strong></td>
<td align="center">93.2</td>
<td align="center">95.8</td>
<td align="center">95.3</td>
</tr>
<tr>
<td align="left"><strong>编码任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">HumanEval</td>
<td align="center">80.5</td>
<td align="center"><strong>89.0</strong></td>
<td align="center">86.0</td>
<td align="center">86.6</td>
<td align="center">87.8</td>
</tr>
<tr>
<td align="left">MultiPL-E</td>
<td align="center">68.2</td>
<td align="center">73.5</td>
<td align="center">69.2</td>
<td align="center">75.1</td>
<td align="center"><strong>79.5</strong></td>
</tr>
<tr>
<td align="left"><strong>对齐任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">IFEval</td>
<td align="center">83.6</td>
<td align="center">86.0</td>
<td align="center">77.6</td>
<td align="center">84.1</td>
<td align="center"><strong>86.3</strong></td>
</tr>
</tbody></table>
<p>结果表明,Qwen2.5-VL 不仅在多模态任务上达到 SOTA 性能,在纯文本任务上也展现出领先表现,展示了其在多样化评估标准上的通用性和稳健性.特别值得注意的是,Qwen2.5-VL-72B 在 LiveBench(57.0)和 MultiPL-E(79.5)上甚至超越了其语言基座 Qwen2.5-72B(52.3 和 75.1).这可能是因为多模态预训练增强了模型的结构化推理能力,而这种能力迁移到了纯文本的代码生成任务中.</p>
<blockquote>
<p>一个关键发现是 Qwen2.5-VL-72B 在纯文本任务上几乎完全保留了 Qwen2.5-72B 的能力:MMLU-Pro 71.2 vs 71.1,MATH 83.0 vs 83.1.这说明多模态训练并没有「侵蚀」语言能力的「灾难性遗忘」问题.在 IFEval(指令遵循)上,Qwen2.5-VL-72B 甚至以 86.3 超越了 Qwen2.5-72B 的 84.1,这可能是因为 SFT 阶段的指令数据(50% 纯文本)对指令遵循能力进行了额外强化.</p>
</blockquote>
<h3 id="3-3-dljg">3.3 定量结果</h3>
<h4 id="3-3-1-tysjwd">3.3.1 通用视觉问答</h4>
<p>为全面评估模型在通用视觉问答(VQA)和对话方面的能力,我们在多种数据集上进行了广泛实验.如表 3 所示,Qwen2.5-VL 在各种 VQA 任务、主观评估、多语言场景和多图像问题中展现出 SOTA 性能.具体而言,它在 MMBench 系列、MMStar、MME、MuirBench、BLINK、CRPE、HallBench、MTVQA、MME-RealWorld、MMVet 和 MM-MT-Bench 等基准数据集上表现出色.</p>
<p>在视觉细节理解和推理领域,Qwen2.5-VL-72B 在 MMBench-EN-V1.1 数据集上达到 88.4% 的准确率,超越了 InternVL2.5(78B)和 Claude-3.5 Sonnet-0620 等前代 SOTA 模型.类似地,在 MMStar 数据集上,Qwen2.5-VL 获得 70.8% 的分数,超越了该基准上的其他领先模型.这些结果凸显了模型在不同语言上下文中的稳健性和适应性.</p>
<p>此外,在高分辨率真实世界场景中,特别是在 MME-RealWorld 基准上,Qwen2.5-VL 以 63.2 的分数展现了 SOTA 性能,展示了其对真实环境的广泛适应性.在多图像理解任务(在 MuirBench 数据集上评估)中,Qwen2.5-VL 以 70.7 的领先分数进一步凸显了卓越的泛化能力.</p>
<p>值得注意的是,即使是较小规模的 Qwen2.5-VL 版本——Qwen2.5-VL-7B 和 Qwen2.5-VL-3B——也展现出极具竞争力的性能.例如,在 MMStar 数据集上,Qwen2.5-VL-7B 达到 63.9%,Qwen2.5-VL-3B 达到 55.9%.这证明 Qwen2.5-VL 的架构不仅强大而且可扩展,即使参数更少也能保持强劲性能.</p>
<h4 id="3-3-2-wdljy-ocr">3.3.2 文档理解与 OCR</h4>
<p><strong>表 5: Qwen2.5-VL 与其他模型在 OCR、图表和文档理解基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">Claude-3.5 Sonnet</th>
<th align="center">Gemini 1.5 Pro</th>
<th align="center">GPT-4o</th>
<th align="center">InternVL2.5-78B</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="center">Qwen2.5-VL-7B</th>
<th align="center">Qwen2.5-VL-3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>OCR 相关解析任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">CC-OCR</td>
<td align="center">62.5</td>
<td align="center">73.0</td>
<td align="center">66.9</td>
<td align="center">64.7</td>
<td align="center"><strong>79.8</strong></td>
<td align="center">77.8</td>
<td align="center">74.5</td>
</tr>
<tr>
<td align="left">OmniDocBench_edit (en/zh, 越低越好)</td>
<td align="center">0.330/0.381</td>
<td align="center">0.230/<strong>0.281</strong></td>
<td align="center">0.265/0.435</td>
<td align="center">0.275/0.324</td>
<td align="center"><strong>0.226</strong>/0.324</td>
<td align="center">0.308/0.398</td>
<td align="center">0.409/0.543</td>
</tr>
<tr>
<td align="left"><strong>OCR 相关理解任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">AI2D (w. M.)</td>
<td align="center">81.2</td>
<td align="center">88.4</td>
<td align="center">84.6</td>
<td align="center"><strong>89.1</strong></td>
<td align="center">88.7</td>
<td align="center">83.9</td>
<td align="center">81.6</td>
</tr>
<tr>
<td align="left">TextVQA_val</td>
<td align="center">76.5</td>
<td align="center">78.8</td>
<td align="center">77.4</td>
<td align="center">83.4</td>
<td align="center">83.5</td>
<td align="center"><strong>84.9</strong></td>
<td align="center">79.3</td>
</tr>
<tr>
<td align="left">DocVQA_test</td>
<td align="center">95.2</td>
<td align="center">93.1</td>
<td align="center">91.1</td>
<td align="center">95.1</td>
<td align="center"><strong>96.4</strong></td>
<td align="center">95.7</td>
<td align="center">93.9</td>
</tr>
<tr>
<td align="left">InfoVQA_test</td>
<td align="center">74.3</td>
<td align="center">81.0</td>
<td align="center">80.7</td>
<td align="center">84.1</td>
<td align="center"><strong>87.3</strong></td>
<td align="center">82.6</td>
<td align="center">77.1</td>
</tr>
<tr>
<td align="left">ChartQA_test (Avg.)</td>
<td align="center"><strong>90.8</strong></td>
<td align="center">87.2</td>
<td align="center">86.7</td>
<td align="center">88.3</td>
<td align="center">89.5</td>
<td align="center">87.3</td>
<td align="center">84.0</td>
</tr>
<tr>
<td align="left">CharXiv (RQ/DQ)</td>
<td align="center"><strong>60.2</strong>/84.3</td>
<td align="center">43.3/72.0</td>
<td align="center">47.1/84.5</td>
<td align="center">42.4/82.3</td>
<td align="center">49.7/<strong>87.4</strong></td>
<td align="center">42.5/73.9</td>
<td align="center">31.3/58.6</td>
</tr>
<tr>
<td align="left">SEED-Bench-2-Plus</td>
<td align="center">71.7</td>
<td align="center">70.8</td>
<td align="center">72.0</td>
<td align="center">71.3</td>
<td align="center"><strong>73.0</strong></td>
<td align="center">70.4</td>
<td align="center">67.6</td>
</tr>
<tr>
<td align="left">OCRBench</td>
<td align="center">788</td>
<td align="center">754</td>
<td align="center">736</td>
<td align="center">854</td>
<td align="center"><strong>885</strong></td>
<td align="center">864</td>
<td align="center">797</td>
</tr>
<tr>
<td align="left">VCR_En-Hard-EM</td>
<td align="center">41.7</td>
<td align="center">28.1</td>
<td align="center">73.2</td>
<td align="center">-</td>
<td align="center">79.8</td>
<td align="center"><strong>80.5</strong></td>
<td align="center">37.5</td>
</tr>
<tr>
<td align="left"><strong>OCR 相关综合任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">OCRBench_v2 (en/zh)</td>
<td align="center">45.2/39.6</td>
<td align="center">51.9/43.1</td>
<td align="center">46.5/32.2</td>
<td align="center">49.8/52.1</td>
<td align="center"><strong>61.5</strong>/<strong>63.7</strong></td>
<td align="center">56.3/57.2</td>
<td align="center">54.3/52.1</td>
</tr>
</tbody></table>
<p>我们在多种 OCR、图表和文档理解基准上评估了模型.对于多场景、多语言和各类内置元素(手写、表格、图表、化学式和数学表达式)文档的元素解析基准,如 CC-OCR 和 OmniDocBench,Qwen2.5-VL-72B 模型凭借精心策划的训练数据和 LLM 的出色能力创造了新的 SOTA.</p>
<p>对于场景文本、图表、图示和文档的 OCR 相关理解基准,Qwen2.5-VL 模型展现出令人印象深刻的性能和良好的理解能力.值得注意的是,在综合 OCR 相关理解基准上——如 OCRBench、聚焦信息图的 InfoVQA,以及涵盖图表、地图和网页等文本丰富场景的 SEED-Bench-2-Plus——Qwen2.5-VL-72B 取得了卓越的结果,显著超越了 InternVL2.5-78B 等强劲竞争对手.</p>
<p>此外,在 OCR 相关综合基准 OCRBench_v2 上(涵盖广泛的 OCR 相关解析和理解任务),Qwen2.5-VL 模型也取得了顶级性能,英文赛道超越最佳模型 Gemini 1.5-Pro 9.6%,中文赛道超越 20.6%.</p>
<blockquote>
<p>Qwen2.5-VL 在 OCR 和文档理解上的表现令人瞩目.在 CC-OCR 上 79.8 分比 Gemini 1.5 Pro(73.0)高出 6.8 分,在 OCRBench_v2 中文赛道(63.7)比 Gemini 1.5 Pro(43.1)高出 20.6 分——这是一个巨大的差距.这种优势的来源可以从数据策展中找到答案:600 万真实表格样本、100 万合成图表样本、支持 10+ 语言的多语言 OCR 数据集,以及 QwenVL HTML 格式的统一结构化表示.相比之下,GPT-4o 在 DocVQA 上只有 91.1,而 Qwen2.5-VL-72B 达到 96.4,说明专用文档解析数据的规模和质量差异直接转化为了性能差距.</p>
</blockquote>
<h4 id="3-3-3-kjlj-spatial-understanding">3.3.3 空间理解 (Spatial Understanding)</h4>
<p>理解空间关系对于开发能够像人类一样解读和交互世界的 AI 模型至关重要.在大型视觉语言模型中,视觉定位允许基于自然语言查询或描述精确定位和识别图像中的特定物体、区域或元素.这种能力超越了传统的物体检测,通过在视觉内容和语言语境之间建立语义关系,实现更细致和上下文感知的视觉推理.</p>
<p>我们在指代表达理解基准(RefCOCO 系列)、野外物体检测(ODinW)、自建的点定位基准和 CountBench 上评估了 Qwen2.5-VL 的定位能力.我们将 Qwen2.5-VL 的视觉定位能力与 Gemini、Grounding-DINO、Molmo 和 InternVL2.5 等其他领先 LVLM 进行了比较.</p>
<p><strong>表 6: Qwen2.5-VL 与其他模型在定位任务上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">Gemini 1.5 Pro</th>
<th align="center">Grounding DINO</th>
<th align="center">Molmo 72B</th>
<th align="center">InternVL2.5-78B</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="center">Qwen2.5-VL-7B</th>
<th align="center">Qwen2.5-VL-3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">RefCOCO_val</td>
<td align="center">73.2</td>
<td align="center">90.6</td>
<td align="center">-</td>
<td align="center">93.7</td>
<td align="center">92.7</td>
<td align="center">90.0</td>
<td align="center">89.1</td>
</tr>
<tr>
<td align="left">RefCOCO_testA</td>
<td align="center">72.9</td>
<td align="center">93.2</td>
<td align="center">-</td>
<td align="center">95.6</td>
<td align="center">94.6</td>
<td align="center">92.5</td>
<td align="center">91.7</td>
</tr>
<tr>
<td align="left">RefCOCO_testB</td>
<td align="center">74.6</td>
<td align="center">88.2</td>
<td align="center">-</td>
<td align="center">92.5</td>
<td align="center">89.7</td>
<td align="center">85.4</td>
<td align="center">84.0</td>
</tr>
<tr>
<td align="left">RefCOCO+_val</td>
<td align="center">62.5</td>
<td align="center">88.2</td>
<td align="center">-</td>
<td align="center">90.4</td>
<td align="center">88.9</td>
<td align="center">84.2</td>
<td align="center">82.4</td>
</tr>
<tr>
<td align="left">RefCOCO+_testA</td>
<td align="center">63.9</td>
<td align="center">89.0</td>
<td align="center">-</td>
<td align="center">94.7</td>
<td align="center">92.2</td>
<td align="center">89.1</td>
<td align="center">88.0</td>
</tr>
<tr>
<td align="left">RefCOCO+_testB</td>
<td align="center">65.0</td>
<td align="center">75.9</td>
<td align="center">-</td>
<td align="center">86.9</td>
<td align="center">83.7</td>
<td align="center">76.9</td>
<td align="center">74.1</td>
</tr>
<tr>
<td align="left">RefCOCOg_val</td>
<td align="center">75.2</td>
<td align="center">86.1</td>
<td align="center">-</td>
<td align="center">92.7</td>
<td align="center">89.9</td>
<td align="center">87.2</td>
<td align="center">85.2</td>
</tr>
<tr>
<td align="left">RefCOCOg_test</td>
<td align="center">76.2</td>
<td align="center">87.0</td>
<td align="center">-</td>
<td align="center">92.2</td>
<td align="center">90.3</td>
<td align="center">87.2</td>
<td align="center">85.7</td>
</tr>
<tr>
<td align="left">ODinW</td>
<td align="center">36.7</td>
<td align="center">55.0</td>
<td align="center">-</td>
<td align="center">31.7</td>
<td align="center">43.1</td>
<td align="center">37.3</td>
<td align="center">37.5</td>
</tr>
<tr>
<td align="left">PointGrounding</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">69.2</td>
<td align="center">-</td>
<td align="center">67.5</td>
<td align="center">67.3</td>
<td align="center">58.3</td>
</tr>
</tbody></table>
<p><strong>表 7: Qwen2.5-VL 与其他模型在计数任务上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">Gemini 1.5-Pro</th>
<th align="center">GPT-4o</th>
<th align="center">Claude-3.5 Sonnet</th>
<th align="center">Molmo-72B</th>
<th align="center">InternVL2.5-78B</th>
<th align="center">Qwen2.5-VL-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">CountBench</td>
<td align="center">85.5</td>
<td align="center">87.9</td>
<td align="center">89.7</td>
<td align="center">91.2</td>
<td align="center">72.1</td>
<td align="center"><strong>93.6</strong></td>
</tr>
</tbody></table>
<p>Qwen2.5-VL 在不同基准上从框定位、点定位到计数均取得了领先性能.通过为 Qwen2.5-VL 配备框和点定位能力,它能够理解、定位并推理图像某些部分的细节.对于开放词汇物体检测,Qwen2.5-VL 在 ODinW-13 上达到 43.1 mAP 的良好性能,超越了大多数 LVLM,快速缩小了通用模型和专用模型之间的差距.此外,Qwen2.5-VL 解锁了基于点的定位能力,能够精确定位某个物体的细节——这在过去是难以用边界框表示的.Qwen2.5-VL 的计数能力也取得了巨大进步,Qwen2.5-VL-72B 使用「detect then count」风格的提示在 CountBench 上达到 93.6 的领先准确率.</p>
<blockquote>
<p>Qwen2.5-VL 在定位任务上有一个有趣的权衡:在 RefCOCO 系列上,它略低于 InternVL2.5-78B 和 Grounding DINO 等专用模型,但在 ODinW(开放词汇检测)上却以 43.1 mAP 大幅超越了 InternVL2.5-78B(31.7).这说明 Qwen2.5-VL 的定位能力更注重「泛化性」而非「特定基准的极致精度」.超过 1 万个物体类别的训练数据和 copy-paste augmentation 等合成策略,使模型学会了更通用的物体-文本关联,而不是过拟合到 RefCOCO 的特定语言模式.在计数任务上 93.6 的分数(超越 Molmo-72B 的 91.2)则表明,当模型同时具备检测和计数能力时,可以通过「先检测再计数」的策略有效解决传统 VLM 在计数上的幻觉问题.</p>
</blockquote>
<h4 id="3-3-4-spljydw">3.3.4 视频理解与定位</h4>
<p>我们在多种视频理解和定位任务上评估了模型,使用的基准包含从几秒到数小时长度的视频.</p>
<p><strong>表 8: Qwen2.5-VL 与其他模型在视频基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">数据集</th>
<th align="center">Gemini 1.5-Pro</th>
<th align="center">GPT-4o</th>
<th align="center">Qwen2.5-VL-72B</th>
<th align="center">Qwen2.5-VL-7B</th>
<th align="center">Qwen2.5-VL-3B</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>视频理解任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Video-MME (w/o sub.)</td>
<td align="center"><strong>75.0</strong></td>
<td align="center">71.9</td>
<td align="center">73.3</td>
<td align="center">65.1</td>
<td align="center">61.5</td>
</tr>
<tr>
<td align="left">Video-MME (w/ sub.)</td>
<td align="center"><strong>81.3</strong></td>
<td align="center">77.2</td>
<td align="center">79.1</td>
<td align="center">71.6</td>
<td align="center">67.6</td>
</tr>
<tr>
<td align="left">Video-MMMU</td>
<td align="center">53.9</td>
<td align="center"><strong>61.2</strong></td>
<td align="center">60.2</td>
<td align="center">47.4</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">MMVU_val</td>
<td align="center">65.4</td>
<td align="center"><strong>67.4</strong></td>
<td align="center">62.9</td>
<td align="center">50.1</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">MVBench</td>
<td align="center">60.5</td>
<td align="center">64.6</td>
<td align="center"><strong>70.4</strong></td>
<td align="center">69.6</td>
<td align="center">67.0</td>
</tr>
<tr>
<td align="left">MMBench-Video</td>
<td align="center">1.30</td>
<td align="center">1.63</td>
<td align="center"><strong>2.02</strong></td>
<td align="center">1.79</td>
<td align="center">1.63</td>
</tr>
<tr>
<td align="left">LongVideoBench_val</td>
<td align="center">64.0</td>
<td align="center"><strong>66.7</strong></td>
<td align="center">60.7</td>
<td align="center">56.0</td>
<td align="center">54.2</td>
</tr>
<tr>
<td align="left">LVBench</td>
<td align="center">33.1</td>
<td align="center">30.8</td>
<td align="center"><strong>47.3</strong></td>
<td align="center">45.3</td>
<td align="center">43.3</td>
</tr>
<tr>
<td align="left">EgoSchema_test</td>
<td align="center">71.2</td>
<td align="center">72.2</td>
<td align="center"><strong>76.2</strong></td>
<td align="center">65.0</td>
<td align="center">64.8</td>
</tr>
<tr>
<td align="left">PerceptionTest_test</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center"><strong>73.2</strong></td>
<td align="center">70.5</td>
<td align="center">66.9</td>
</tr>
<tr>
<td align="left">MLVU (M-Avg)</td>
<td align="center">-</td>
<td align="center">64.6</td>
<td align="center"><strong>74.6</strong></td>
<td align="center">70.2</td>
<td align="center">68.2</td>
</tr>
<tr>
<td align="left">TempCompass (Avg)</td>
<td align="center">67.1</td>
<td align="center">73.8</td>
<td align="center"><strong>74.8</strong></td>
<td align="center">71.7</td>
<td align="center">64.4</td>
</tr>
<tr>
<td align="left"><strong>视频定位任务</strong></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
<td align="center"></td>
</tr>
<tr>
<td align="left">Charades-STA (mIoU)</td>
<td align="center">-</td>
<td align="center">35.7</td>
<td align="center"><strong>50.9</strong></td>
<td align="center">43.6</td>
<td align="center">38.8</td>
</tr>
</tbody></table>
<p>值得注意的是,在评估长视频理解能力的 LVBench 和 MLVU 上,Qwen2.5-VL-72B 取得了显著成果,大幅超越 GPT-4o 等强劲竞争对手.通过利用同步 MRoPE,Qwen2.5-VL 增强了在时间敏感视频理解方面的能力,具有改进的时间戳引用、时间定位、密集描述和额外功能.在评估精确时间戳定位事件或活动能力的 Charades-STA 数据集上,Qwen2.5-VL-72B 取得了令人印象深刻的 50.9 mIoU 分数,从而超越了 GPT-4o 的性能.</p>
<p>对于所有评估的基准,我们将每视频最大分析帧数限制为 768,总视频 token 数不超过 24576.</p>
<blockquote>
<p>Qwen2.5-VL 在视频任务上的表现呈现「长视频强、短视频中等」的格局.在 LVBench(长视频)上 47.3 大幅超越 GPT-4o(30.8)和 Gemini 1.5 Pro(33.1);在 MLVU 上 74.6 也显著领先 GPT-4o(64.6).但在 Video-MME(标准长度视频)上 73.3/79.1 仍低于 Gemini 1.5 Pro 的 75.0/81.3.这种差异的原因可能是:Gemini 1.5 Pro 的 Native Multimodality 架构在常规视频理解上有深厚积累,而 Qwen2.5-VL 的 MRoPE 绝对时间编码和动态 FPS 策略在长视频场景下更具优势.限制每视频最大 768 帧和 24576 个视频 token 的做法也说明了当前 LVLMs 的视频处理仍受限于序列长度——即使使用动态分辨率,长视频的信息量仍需要大量 token 来表示.</p>
</blockquote>
<h4 id="3-3-5-znt-agent">3.3.5 智能体 (Agent)</h4>
<p>多模态模型中的智能体能力对于使这些模型能够有效交互真实设备至关重要.我们通过多个方面评估 Qwen2.5-VL 的智能体能力.UI 元素定位通过 ScreenSpot 和 ScreenSpot Pro 评估.离线评估在 Android Control 上进行,在线评估在 AndroidWorld、MobileMiniWob++ 和 OSWorld 平台上进行.</p>
<p><strong>表 9: Qwen2.5-VL 与其他模型在 GUI Agent 基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">GPT-4o</th>
<th align="center">Gemini 2.0</th>
<th align="center">Claude</th>
<th align="center">Aguvis-72B</th>
<th align="center">Qwen2-VL-72B</th>
<th align="center">Qwen2.5-VL-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">ScreenSpot</td>
<td align="center">18.1</td>
<td align="center">84.0</td>
<td align="center">83.0</td>
<td align="center"><strong>89.2</strong></td>
<td align="center">-</td>
<td align="center">87.1</td>
</tr>
<tr>
<td align="left">ScreenSpot Pro</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">17.1</td>
<td align="center">23.6</td>
<td align="center">1.6</td>
<td align="center"><strong>43.6</strong></td>
</tr>
<tr>
<td align="left">Android Control High_EM</td>
<td align="center">20.8</td>
<td align="center">28.5</td>
<td align="center">12.5</td>
<td align="center">66.4</td>
<td align="center">59.1</td>
<td align="center"><strong>67.36</strong></td>
</tr>
<tr>
<td align="left">Android Control Low_EM</td>
<td align="center">19.4</td>
<td align="center">60.2</td>
<td align="center">19.4</td>
<td align="center">84.4</td>
<td align="center">59.2</td>
<td align="center"><strong>93.7</strong></td>
</tr>
<tr>
<td align="left">AndroidWorld_SR</td>
<td align="center">34.5% (SoM)</td>
<td align="center">26% (SoM)</td>
<td align="center">27.9%</td>
<td align="center">26.1%</td>
<td align="center">6% (SoM)</td>
<td align="center"><strong>35%</strong></td>
</tr>
<tr>
<td align="left">MobileMiniWob++_SR</td>
<td align="center">61%</td>
<td align="center">42% (SoM)</td>
<td align="center">61% (SoM)</td>
<td align="center">66%</td>
<td align="center">50% (SoM)</td>
<td align="center"><strong>68%</strong></td>
</tr>
<tr>
<td align="left">OSWorld</td>
<td align="center">5.03</td>
<td align="center">4.70</td>
<td align="center"><strong>14.90</strong></td>
<td align="center">10.26</td>
<td align="center">2.42</td>
<td align="center">8.83</td>
</tr>
</tbody></table>
<p>Qwen2.5-VL-72B 的性能展现了在 GUI 定位基准上的卓越进步.它在 ScreenSpot 上达到 87.1% 的准确率,与 Gemini 2.0(84.0%)和 Claude(83.0%)竞争激烈,同时在 ScreenSpot Pro 上以 43.6% 的准确率树立了新标准——大幅超越 Aguvis-72B(23.6%)及其基础模型 Qwen2-VL-72B(1.6%).</p>
<p>利用这些卓越的定位能力,Qwen2.5-VL-72B 在所有离线评估基准上以巨大优势显著超越基线.在线评估中,由于定位能力有限,一些基线难以完成任务.因此,我们对这些模型的输入应用了 Set-of-Mark (SoM).结果显示,Qwen2.5-VL-72B 在 AndroidWorld 和 MobileMiniWob++ 上能够超越基线,在 OSWorld 上也达到了可比的性能,且无需辅助标记.这表明 Qwen2.5-VL-72B 能够在真实和动态环境中作为智能体运行.</p>
<blockquote>
<p>ScreenSpot Pro 从 Qwen2-VL-72B 的 1.6% 跃升到 Qwen2.5-VL-72B 的 43.6% 是一个惊人的进步(27 倍提升).ScreenSpot Pro 评估的是模型在复杂 UI 界面中定位小尺寸、高密度元素的能力,1.6% 意味着前代模型几乎无法完成这类任务,而 43.6% 意味着模型已经具备了实用的 UI 自动化潜力.这种飞跃的来源是专门的智能体数据策展:合成数据引擎生成截图描述和 UI 元素定位标注,以及多步轨迹的推理过程标注.但 OSWorld 上 8.83 相比 Claude 的 14.90 仍有差距,说明在复杂的开放式桌面操作系统任务上,Qwen2.5-VL 仍有提升空间.</p>
</blockquote>
<hr>
<h2 id="4-jl-conclusion">4. 结论 (Conclusion)</h2>
<p>我们提出 Qwen2.5-VL,这是一个在视觉语言模型系列中达到 SOTA 的模型,在多模态理解和交互方面取得了重大进展.凭借在视觉识别、物体定位、文档解析和长视频理解方面的增强能力,Qwen2.5-VL 在静态和动态任务中均表现出色.其原生动态分辨率处理和绝对时间编码使其能够稳健地处理多样化输入,而 Window Attention 在保持分辨率保真度的同时降低了计算开销.</p>
<p>Qwen2.5-VL 适用于广泛的应用,从端侧 AI 到高性能计算.旗舰模型 Qwen2.5-VL-72B 与 GPT-4o 和 Claude 3.5 Sonnet 等领先模型匹敌或超越,尤其在文档和图表理解方面,同时在纯文本任务上保持强劲性能.较小的 Qwen2.5-VL-7B 和 Qwen2.5-VL-3B 变体超越了同等规模的竞争对手,提供了效率和通用性.</p>
<p>Qwen2.5-VL 为视觉语言模型树立了新的基准,展示了跨领域的卓越泛化和任务执行能力.其创新为更智能和交互式的系统铺平了道路,架起了感知与真实世界应用之间的桥梁.</p>
<hr>
<h2 id="5-jsskjd-technical-thinking-nodes">5. 技术思考节点 (Technical Thinking Nodes)</h2>
<p>以下按「设计动机」「数据实验」「架构细节」「局限与风险」「技术谱系」五类整理本报告中的关键技术思考节点.</p>
<h3 id="5-1-sjdj-design-rationale">5.1 设计动机 (Design Rationale)</h3>
<blockquote>
<p><strong>思考 1: 「三明治饼干」比喻背后的产品哲学</strong></p>
</blockquote>
<p>报告将当前 LVLM 的能力比喻为「三明治饼干的中间层」——底层是细粒度视觉感知,顶层是多模态推理,而中间层「在各种任务上表现尚可,但远未达到卓越」.这个比喻揭示了一个关键洞察:视觉语言模型的瓶颈不在「语言」也不在「简单视觉」,而在「精细视觉感知与语言推理的桥接」. Qwen2.5-VL 选择从底层(细粒度感知)和顶层(多模态推理)同时发力,而非仅仅增强中间层的通用能力.这种策略的产品化体现就是:模型不仅能「看懂图」,还能「指出图中哪个物体的哪个部分」——这是从「被动回答」到「主动交互」的质变.</p>
<blockquote>
<p><strong>思考 2: 为什么坚持原生动态分辨率而非统一 resize?</strong></p>
</blockquote>
<p>传统视觉模型通常将所有图像 resize 到固定尺寸(如 224×224 或 448×448),这会导致两个问题:一是小物体在 resize 后可能只占据几个像素,细节完全丢失;二是不同长宽比的图像被强行拉伸变形.Qwen2.5-VL 的原生动态分辨率策略让模型在训练时接触各种尺寸的图像,学会了「尺度感知」——一个边界框的坐标值直接对应像素位置,模型知道 100×100 的框在小图像中占据很大比例,但在 4K 图像中可能只是角落的一小块.这种设计使模型在物体定位和文档解析等需要精确坐标的任务上具有天然优势,但代价是 batch 内的序列长度差异巨大,需要动态打包策略来平衡 GPU 负载.</p>
<h3 id="5-2-sjsy-data-experiments">5.2 数据实验 (Data Experiments)</h3>
<blockquote>
<p><strong>思考 3: 4.1T token 的数据构成质变分析</strong></p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">数据类型</th>
<th align="left">规模/特点</th>
<th align="left">关键作用</th>
</tr>
</thead>
<tbody><tr>
<td align="left">交错图文</td>
<td align="left">四维度评分(相关性/互补性/密度平衡/文本质量)</td>
<td align="left">保持纯文本能力+上下文学习</td>
</tr>
<tr>
<td align="left">定位数据</td>
<td align="left">1万+物体类别,绝对坐标</td>
<td align="left">开放词汇检测+精细定位</td>
</tr>
<tr>
<td align="left">文档解析</td>
<td align="left">HTML 统一格式,600万表格+100万图表</td>
<td align="left">端到端结构化输出</td>
</tr>
<tr>
<td align="left">OCR</td>
<td align="left">10+语言,合成+真实场景</td>
<td align="left">多语言文本识别</td>
</tr>
<tr>
<td align="left">视频</td>
<td align="left">动态 FPS,半小时+长视频</td>
<td align="left">时间动态理解</td>
</tr>
<tr>
<td align="left">智能体</td>
<td align="left">截图+UI定位+多步轨迹推理</td>
<td align="left">GUI 自动化能力</td>
</tr>
</tbody></table>
<p>从 1.2T 到 4.1T 的增长不仅是量的扩展,更是质的重构.最值得注意的是「智能体数据」的引入——这是前代 Qwen2-VL 所没有的全新数据维度.专门收集移动端/Web/桌面截图、合成 UI 元素定位标注、构建多步操作轨迹的推理过程,这些数据直接转化为了 ScreenSpot Pro 上 27 倍的性能提升.</p>
<blockquote>
<p><strong>思考 4: 数据过滤 pipeline 的闭环设计</strong></p>
</blockquote>
<p>Instag 分类模型(8 领域 30 子类) → 领域定制过滤(规则+模型) → 奖励模型评分 → SFT 训练 → 更好的模型 → 更好的过滤标准.这个闭环的自我增强特性意味着:随着模型能力提升,数据质量筛选标准也会自动提升,形成「数据质量↑ → 模型能力↑ → 筛选标准↑ → 数据质量↑」的正向循环.但风险在于,如果初始的奖励模型有系统性偏差(比如对某种语言或某种文档类型评分偏低),这种偏差会在循环中被放大.</p>
<h3 id="5-3-jgxj-architecture-details">5.3 架构细节 (Architecture Details)</h3>
<blockquote>
<p><strong>思考 5: Window Attention 层的「全局-局部」交替设计</strong></p>
</blockquote>
<p>Qwen2.5-VL 的 ViT 在 32 层中仅使用 4 层全局注意力(第 7/15/23/31 层),其余 28 层均使用 Window Attention.这种「每隔 8 层来一次全局聚合」的策略类似于通信网络中的「分层汇聚」:局部窗口处理细节,全局层整合上下文.与 Swin Transformer 的 shifted window 相比,这种设计更简单(无需复杂的窗口偏移和 mask),但可能损失一些跨窗口的细粒度交互.在工程实现上,Window Attention 配合 2D-RoPE 可以在不增加额外参数的情况下实现局部感知,这是对计算资源的极致利用.</p>
<blockquote>
<p><strong>思考 6: MRoPE 从「帧ID」到「秒ID」的数学含义</strong></p>
</blockquote>
<p>Qwen2-VL 的 MRoPE 时间维度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>i</mi></msub><mo>=</mo><mi>i</mi></mrow><annotation encoding="application/x-tex">t_i = i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> (第 i 帧).
Qwen2.5-VL 的 MRoPE 时间维度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>t</mi><mi>i</mi></msub><mo>=</mo><mi>t</mi><mi>i</mi><mi>m</mi><mi>e</mi><mi>s</mi><mi>t</mi><mi>a</mi><mi>m</mi><msub><mi>p</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">t_i = timestamp_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.854em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">t</span><span class="mord mathnormal">im</span><span class="mord mathnormal">es</span><span class="mord mathnormal">t</span><span class="mord mathnormal">am</span><span class="mord"><span class="mord mathnormal">p</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> (第 i 帧对应的秒数).</p>
<p>这个变化看似简单,但数学上意味着模型学到的时间表示从「离散帧索引」变为「连续时间轴」.当两个视频的帧率不同时,相同帧数的片段对应的真实时间长度不同,但 Qwen2.5-VL 可以通过时间 ID 的间隔(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi><mo>=</mo><msub><mi>t</mi><mrow><mi>i</mi><mo>+</mo><mn>1</mn></mrow></msub><mo>−</mo><msub><mi>t</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">\\Delta t = t_{i+1} - t_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8234em;vertical-align:-0.2083em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mbin mtight">+</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7651em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">t</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>)直接感知节奏差异——<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi><mo>=</mo><mn>0.5</mn></mrow><annotation encoding="application/x-tex">\\Delta t = 0.5</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.5</span></span></span></span> 表示 2fps,<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">Δ</mi><mi>t</mi><mo>=</mo><mn>0.04</mn></mrow><annotation encoding="application/x-tex">\\Delta t = 0.04</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">Δ</span><span class="mord mathnormal">t</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.04</span></span></span></span> 表示 25fps.这种绝对时间对齐为秒级事件定位提供了直接的数学基础,无需额外的「帧→秒」转换头.</p>
<h3 id="5-4-jxyfx-limitations-amp-risks">5.4 局限与风险 (Limitations &amp; Risks)</h3>
<blockquote>
<p><strong>思考 7: 长视频理解的「帧数天花板」</strong></p>
</blockquote>
<p>报告明确限制每视频最大 768 帧、总视频 token 不超过 24576.以 14×14 的 patch size 计算,一帧 448×448 的图像产生 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>448</mn><mi mathvariant="normal">/</mi><mn>14</mn><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo>=</mo><mn>1024</mn></mrow><annotation encoding="application/x-tex">(448/14)^2 = 1024</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">448/14</span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1024</span></span></span></span> 个 patch,经 Merger 压缩 4×后变为 256 个 token.768 帧即 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>768</mn><mo>×</mo><mn>256</mn><mo>=</mo><mn>196608</mn></mrow><annotation encoding="application/x-tex">768 \\times 256 = 196608</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">768</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">256</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">196608</span></span></span></span> 个 token——远超 24576 的限制.这意味着实际处理时,视频帧会被进一步降采样或 resize 到更低分辨率.对于一小时的视频(3600 秒),即使以 1fps 采样也需要 3600 帧,远超 768 帧的上限.因此,当前模型对「数小时视频」的理解实际上依赖于关键帧的选择,而非真正处理全部内容.如何实现真正的「全帧长视频理解」仍是开放问题.</p>
<blockquote>
<p><strong>思考 8: 纯文本能力的「隐性代价」</strong></p>
</blockquote>
<p>表 4 显示 Qwen2.5-VL-72B 在纯文本任务上几乎完全保留了 Qwen2.5-72B 的能力,但这是否意味着没有代价? 实际上,多模态预训练占用了 4.1T token 的计算预算,如果这些资源全部用于纯文本训练,语言基座可能会更强.此外,视觉 token 的引入增加了推理时的序列长度——对于纯文本任务,模型仍需加载 ViT 和 Merger 的权重,增加了部署时的内存开销.对于纯文本为主的应用场景,Qwen2.5-VL 相比同尺寸 LLM 并无优势,这是架构通用性带来的必然权衡.</p>
<blockquote>
<p><strong>思考 9: Agent 能力的「真实世界鸿沟」</strong></p>
</blockquote>
<p>虽然 Qwen2.5-VL 在 ScreenSpot 和 Android Control 等基准上表现出色,但这些基准是高度结构化的测试环境.真实的 GUI 自动化面临更多挑战:动态加载的网页元素、需要登录态的账户操作、跨应用的复杂工作流、以及操作失败后的恢复策略.OSWorld 上 8.83 的分数(远低于 Claude 的 14.90)恰恰暴露了模型在开放式桌面环境中的局限.从「基准高分」到「真实可用」之间,还有相当长的工程距离.</p>
<h3 id="5-5-jspx-lineage">5.5 技术谱系 (Lineage)</h3>
<blockquote>
<p><strong>思考 10: Qwen2.5-VL 在多模态架构家族中的位置</strong></p>
</blockquote>
<p>Qwen2.5-VL 的架构继承关系:</p>
<pre><code>Flamingo(2022) 交错图文 → BLIP-2(2023) Q-Former 桥接 → LLaVA(2023) 线性投影
                                                                ↓
Qwen-VL(2023) 统一训练 → Qwen2-VL(2024) MRoPE + 动态分辨率 → Qwen2.5-VL(2025) 绝对时间 + Window Attention
</code></pre>
<p>与同期竞争架构相比:</p>
<ul>
<li><strong>vs Gemini 1.5 Pro</strong>: Gemini 采用 Native Multimodality(原生多模态,从预训练即融合),Qwen2.5-VL 采用「ViT + LLM」的分体式架构.Gemini 在长视频理解(Video-MME)上仍有优势,但 Qwen2.5-VL 在文档解析和定位精度上反超.</li>
<li><strong>vs InternVL2.5</strong>: InternVL2.5 采用更大规模的 ViT(InternViT-6B)和更强的 LLM(InternLM2.5),Qwen2.5-VL 则通过更高效的 ViT 设计和更优质的数据策展实现了同等甚至更优的性能.</li>
<li><strong>vs GPT-4o</strong>: GPT-4o 的架构细节未公开,但从 OCR 和文档理解的表现看,Qwen2.5-VL 已经在这两个垂直领域建立了明显优势.</li>
</ul>
<blockquote>
<p><strong>思考 11: 动态分辨率策略的行业影响</strong></p>
</blockquote>
<p>Qwen2-VL 率先引入的动态分辨率策略已被多家后续工作采纳或变体化,包括 MiniMax 的多模态模型和 GLM 的视觉系列.Qwen2.5-VL 进一步将其扩展到时间维度(动态 FPS),这可能会成为未来视频理解模型的标准做法.从更广泛的视角看,「不 resize、不 normalize、用原始像素坐标」的理念正在改变视觉模型设计的基本假设——从「固定尺寸输入」转向「原生分辨率处理」.</p>
<hr>
<h2 id="6-hxsyb">6. 核心术语表</h2>
<table>
<thead>
<tr>
<th align="left">英文术语</th>
<th align="left">中文译名</th>
<th align="left">首次出现</th>
<th align="left">简要解释</th>
</tr>
</thead>
<tbody><tr>
<td align="left">LVLM</td>
<td align="left">大型视觉语言模型</td>
<td align="left">引言</td>
<td align="left">整合视觉感知和语言理解的多模态模型</td>
</tr>
<tr>
<td align="left">ViT</td>
<td align="left">视觉Transformer</td>
<td align="left">摘要</td>
<td align="left">基于Transformer架构的视觉Encoder</td>
</tr>
<tr>
<td align="left">Window Attention</td>
<td align="left">窗口注意力</td>
<td align="left">方法</td>
<td align="left">将注意力限制在局部窗口内以降低计算复杂度</td>
</tr>
<tr>
<td align="left">MRoPE</td>
<td align="left">多模态旋转位置编码</td>
<td align="left">方法</td>
<td align="left">将位置编码分解为时间/高度/宽度三个组件</td>
</tr>
<tr>
<td align="left">Dynamic Resolution</td>
<td align="left">动态分辨率</td>
<td align="left">方法</td>
<td align="left">根据输入图像实际尺寸处理,不做统一resize</td>
</tr>
<tr>
<td align="left">Dynamic FPS</td>
<td align="left">动态帧率</td>
<td align="left">方法</td>
<td align="left">训练时采样不同帧率的视频以学习时间节奏</td>
</tr>
<tr>
<td align="left">Merger</td>
<td align="left">视觉-语言合并器</td>
<td align="left">方法</td>
<td align="left">通过MLP压缩视觉特征序列的模块</td>
</tr>
<tr>
<td align="left">DPO</td>
<td align="left">直接偏好优化</td>
<td align="left">后训练</td>
<td align="left">利用偏好数据对齐模型与人类偏好的优化方法</td>
</tr>
<tr>
<td align="left">SoM</td>
<td align="left">标记集合</td>
<td align="left">Agent实验</td>
<td align="left">在图像上叠加数字标记以辅助定位的方法</td>
</tr>
<tr>
<td align="left">Grounding</td>
<td align="left">视觉定位</td>
<td align="left">空间理解</td>
<td align="left">根据文本描述定位图像中特定物体的能力</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Qwen2.5-VL Technical Report, arXiv:2502.13923</li>
<li>代码与模型: <a href="https://github.com/QwenLM/Qwen2.5-VL">https://github.com/QwenLM/Qwen2.5-VL</a></li>
<li>在线体验: <a href="https://chat.qwenlm.ai">https://chat.qwenlm.ai</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy-abstract","text":"摘要 (Abstract)"},{"level":2,"id":"1-yy-introduction","text":"1. 引言 (Introduction)"},{"level":2,"id":"2-ff-approach","text":"2. 方法 (Approach)"},{"level":3,"id":"2-1-mxjg-model-architecture","text":"2.1 模型架构 (Model Architecture)"},{"level":4,"id":"2-1-1-ksgxdsj-encoder","text":"2.1.1 快速高效的视觉Encoder"},{"level":4,"id":"2-1-2-ysdtfbsyzs","text":"2.1.2 原生动态分辨率与帧率"},{"level":4,"id":"2-1-3-dqjdsjddmtxzwzbm-m-ro-pe","text":"2.1.3 对齐绝对时间的多模态旋转位置编码 (MRoPE)"},{"level":3,"id":"2-2-yxl-pre-training","text":"2.2 预训练 (Pre-Training)"},{"level":4,"id":"2-2-1-yxlsj","text":"2.2.1 预训练数据"},{"level":4,"id":"2-2-2-xlpf-training-recipe","text":"2.2.2 训练配方 (Training Recipe)"},{"level":3,"id":"2-3-hxl-post-training","text":"2.3 后训练 (Post-training)"},{"level":4,"id":"2-3-1-zlsj-instruction-data","text":"2.3.1 指令数据 (Instruction Data)"},{"level":4,"id":"2-3-2-sjgllc-data-filtering-pipeline","text":"2.3.2 数据过滤流程 (Data Filtering Pipeline)"},{"level":4,"id":"2-3-3-jjcyzqtl-rejection-sampling-for-enhanced-reasoning","text":"2.3.3 拒绝采样增强推理 (Rejection Sampling for Enhanced Reasoning)"},{"level":4,"id":"2-3-4-hxlpf-training-recipe","text":"2.3.4 后训练配方 (Training Recipe)"},{"level":2,"id":"3-sy-experiments","text":"3. 实验 (Experiments)"},{"level":3,"id":"3-1-y-sota-mxdbj","text":"3.1 与 SOTA 模型的比较"},{"level":3,"id":"3-2-cwbrwxn","text":"3.2 纯文本任务性能"},{"level":3,"id":"3-3-dljg","text":"3.3 定量结果"},{"level":4,"id":"3-3-1-tysjwd","text":"3.3.1 通用视觉问答"},{"level":4,"id":"3-3-2-wdljy-ocr","text":"3.3.2 文档理解与 OCR"},{"level":4,"id":"3-3-3-kjlj-spatial-understanding","text":"3.3.3 空间理解 (Spatial Understanding)"},{"level":4,"id":"3-3-4-spljydw","text":"3.3.4 视频理解与定位"},{"level":4,"id":"3-3-5-znt-agent","text":"3.3.5 智能体 (Agent)"},{"level":2,"id":"4-jl-conclusion","text":"4. 结论 (Conclusion)"},{"level":2,"id":"5-jsskjd-technical-thinking-nodes","text":"5. 技术思考节点 (Technical Thinking Nodes)"},{"level":3,"id":"5-1-sjdj-design-rationale","text":"5.1 设计动机 (Design Rationale)"},{"level":3,"id":"5-2-sjsy-data-experiments","text":"5.2 数据实验 (Data Experiments)"},{"level":3,"id":"5-3-jgxj-architecture-details","text":"5.3 架构细节 (Architecture Details)"},{"level":3,"id":"5-4-jxyfx-limitations-amp-risks","text":"5.4 局限与风险 (Limitations &amp; Risks)"},{"level":3,"id":"5-5-jspx-lineage","text":"5.5 技术谱系 (Lineage)"},{"level":2,"id":"6-hxsyb","text":"6. 核心术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/08-qwen2.5-vl/01-qwen2.5-vl-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/08-qwen2.5-vl/01-qwen2.5-vl-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2.5-VL 技术报告精译</h1>
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
