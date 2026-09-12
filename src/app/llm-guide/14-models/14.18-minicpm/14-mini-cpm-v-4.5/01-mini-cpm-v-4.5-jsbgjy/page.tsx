"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V-4.5 技术报告精译</h1>
<blockquote>
<p>原文标题: MiniCPM-V 4.5: Cooking Efficient MLLMs via Architecture, Data, and Training Recipes
原文链接: <a href="https://arxiv.org/abs/2509.18154">https://arxiv.org/abs/2509.18154</a>
发布日期: 2025 年 9 月 16 日
发布机构: 清华大学面壁智能(OpenBMB)
模型规模: 8.7B 参数
说明: 基于 arXiv 技术报告(25 页)逐段精译</p>
</blockquote>
<hr>
<h2 id="zy">摘要</h2>
<p>多模态大语言模型(Multimodal Large Language Model, MLLM)正在快速发展,代表了人工智能的前沿方向。然而,训练和推理效率已成为制约 MLLM 普及和扩展的核心瓶颈。为此,我们提出 MiniCPM-V 4.5——一个拥有 8B 参数的高效率、高性能模型。我们在模型架构、数据策略和训练方法三个维度引入了核心改进:</p>
<p>(1) <strong>统一 3D-Resampler 架构</strong>: 对图像和视频进行高度紧凑的编码,实现图像最高 <strong>16x</strong> 压缩率和视频额外 <strong>6x</strong> 压缩率;
(2) <strong>统一文档知识与 OCR 学习范式</strong>: 无需繁重数据工程即可直接从文档图像中准确获取知识;
(3) <strong>混合强化学习策略</strong>: 使模型同时精通短推理模式(高效)和长推理模式(复杂任务)。</p>
<p>OpenCompass 综合评测表明,MiniCPM-V 4.5 超越了 GPT-4o-latest 等广泛使用的商用闭源模型,以及 Qwen2.5-VL 72B 等规模显著更大的开源模型。值得注意的是,这一强劲性能是在卓越的效率下实现的: 在 VideoMME 基准上,MiniCPM-V 4.5 在 30B 以下模型中达到 SOTA,但仅使用了 Qwen2.5-VL 7B <strong>46.7%</strong> 的 GPU 内存和 <strong>8.7%</strong> 的推理时间。</p>
<blockquote>
<p>译者注: 摘要中的数据非常值得关注。8.7% 的推理时间意味着 MiniCPM-V 4.5 处理视频的速度是 Qwen2.5-VL 7B 的约 11.5 倍,这是一个数量级的差异。这种效率提升不是来自「用更少的层或更小的隐藏维度」这种简单粗暴的压缩,而是来自架构层面的重新设计——统一 3D-Resampler 通过利用视频的时序冗余性,将帧间的重复视觉信息压缩掉。对于 2-fps、6 秒、448x448 的视频,Qwen2.5-VL 需要 1,536 个 token,InternVL3 需要 3,072 个 token,而 MiniCPM-V 4.5 只需要 <strong>128 个 token</strong>。这个 12x-24x 的 token 压缩率直接转化为了内存和计算的双重节省。</p>
</blockquote>
<hr>
<h2 id="1-yy">1 引言</h2>
<p>多模态大语言模型正在快速推进人工智能的前沿,使机器能够深入理解和推理文本、图像等不同模态的信息。然而,随着 MLLM 的演进,数据工程、训练和推理的成本也大幅增加。解决这一效率挑战已成为研究和产业界的中心焦点,对于让有能力的 MLLM 更易获取和可扩展至关重要。</p>
<p>我们将这一效率问题分解为三个核心维度:</p>
<p><strong>(1) 模型架构</strong>。MLLM 的一个主要效率瓶颈来自高分辨率图像编码产生的大量视觉 token,这给视觉编码器和 LLM 带来了沉重的计算开销。在视频理解中,这一问题更加严重——现有模型即使以低帧率采样,也需要数千个 token 来编码一段短且低分辨率的视频。例如,处理一段 6 秒、2-fps、分辨率为 448x448 的视频,Qwen2.5-VL 需要 1,536 个 token,InternVL3 需要 3,072 个 token。如此长的视觉 token 序列导致 GPU 内存和计算速度方面的训练和推理成本高得令人望而却步。</p>
<p><strong>(2) 训练数据</strong>。随着传统网页数据中的新知识迅速耗尽,现代 MLLM 的一个新基石是从文档中挖掘高质量多模态知识,如科学论文和教科书。这些文档通常以 PDF 格式存储,包含多学科知识,并以文本、图像、表格交织的多样化布局组织。然而,大多数方法依赖脆弱的外部解析工具将文档文件转换为交织的图像-文本序列用于训练。这些工具在复杂布局中经常失败,导致知识学习出现错误,或需要繁重的数据工程工作来修复失败案例。</p>
<p><strong>(3) 训练方法</strong>。强化学习(Reinforcement Learning, RL)在提升复杂推理能力方面显示出前景,通过在给出最终答案前实现逐步显式思考过程。然而,这种性能提升往往以极端冗长为代价。即使对于识别明显物体这样的简单任务,大多数现有思考模型也会产生过长的输出,导致训练和推理效率低下。例如,在综合 OpenCompass 基准上,混合策略仅需 <strong>33.3%</strong> 的长推理样本即可匹配纯单模式长推理训练的峰值性能。</p>
<blockquote>
<p>这里值得停下来思考「效率」这个概念在 MLLM 中的多重含义。论文将效率拆解为架构效率、数据效率和训练效率三个维度,这是一个非常系统的框架。架构效率解决的是「推理时每个 token 花多少算力」; 数据效率解决的是「获取单位质量知识需要多少标注/清洗成本」; 训练效率解决的是「达到目标性能需要多少 GPU 小时」。这三个维度互不替代——你不可能用更好的数据弥补架构的低效,也不可能用更好的训练方法弥补数据的不足。MiniCPM-V 4.5 同时在这三个维度上做改进,体现了面壁智能「系统性优化」的工程哲学。</p>
</blockquote>
<hr>
<h2 id="2-ff">2 方法</h2>
<h3 id="2-1-jg">2.1 架构</h3>
<p>如图 1 所示,MiniCPM-V 4.5 的架构包含三个主要模块: (1) 轻量级视觉编码器,通过特殊的分区策略灵活处理高分辨率图像; (2) 统一 3D-Resampler,将图像和视频编码为紧凑特征,利用视觉信息中的时序冗余; (3) LLM 解码器,理解图像、视频和文本,并生成文本输出。</p>
<h4 id="2-1-1-ty-3d-resampler">2.1.1 统一 3D-Resampler</h4>
<p>为了解决 MLLM 中图像和视频编码的效率瓶颈,我们将 2D-Resampler 扩展到 <strong>3D-Resampler</strong>,联合压缩视频的时空信息。通过利用连续多帧视频的时序冗余,我们实现了 <strong>6x 时序压缩率</strong>。</p>
<p><strong>图像处理</strong>。为了处理任意宽高比的高分辨率图像,我们采用 <strong>LLaVA-UHD</strong> 图像分区策略。对于每张图像,我们根据输入分辨率估算最优切片数量,并选择每片分辨率与视觉编码器预训练设置偏差最小的分区方案。然后我们使用带有 2D 空间位置嵌入的可学习查询(learnable queries),通过交叉注意力为每片生成固定长度的序列。</p>
<p>现有的大多数 MLLM 采用 MLP 和像素反洗牌(pixel unshuffle)操作进行视觉压缩,通常编码一张 448x448 的图像需要 256 个 token。借助 Resampler 架构的灵活性,通过选择少量查询 token,MiniCPM-V 可以实现显著更高的视觉 token 压缩率(例如,一张 448x448 的图像仅需 64 个 token),同时保持良好性能。</p>
<p><strong>视频处理</strong>。为了处理视频数据中的大量冗余,我们对每包视频帧采用联合时空压缩策略,以获得更高的压缩率。</p>
<p>对于每个视频,我们首先沿时间维度将其分割为包(packages),每个包包含相邻帧。直观上,同一包内的视频帧通常共享高度冗余的视觉信息,可以在联合建模时被识别和压缩。为此,我们通过交叉注意力将每个包中视觉编码器的帧特征重采样为固定长度的特征序列。我们用 2D 空间位置嵌入(与图像编码相同)和<strong>时间位置嵌入</strong>来增强可学习查询。最终的视频表示通过拼接所有包的 token 序列获得。</p>
<p>我们在训练时随机增强包大小和帧率以提高鲁棒性。这种设计在推理时也提供了灵活性,允许调整这些超参数以满足不同场景和设备的需求。我们每视频最多采样 1,080 帧,最大帧率为 10 FPS。</p>
<blockquote>
<p>统一 3D-Resampler 的核心洞察非常简洁: 图像压缩和帧间压缩可以共享同一个模块。传统的做法是图像用 2D-Resampler,视频用单独的时序压缩模块(如时序池化或 3D 卷积)。MiniCPM-V 4.5 的创新在于将「空间查询」扩展为「时空查询」——同一个查询向量同时携带空间位置信息(x, y)和时间位置信息(t)。这避免了维护两个独立模块的复杂性,也避免了两次压缩之间的信息损失。从工程实现看,3D-Resampler 的交叉注意力计算量为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>n</mi><mrow><mi>q</mi><mi>u</mi><mi>e</mi><mi>r</mi><mi>y</mi></mrow></msub><mo>×</mo><msub><mi>n</mi><mrow><mi>f</mi><mi>r</mi><mi>a</mi><mi>m</mi><mi>e</mi></mrow></msub><mo>×</mo><msub><mi>n</mi><mrow><mi>p</mi><mi>a</mi><mi>t</mi><mi>c</mi><mi>h</mi></mrow></msub><mo>×</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n_{query} \\times n_{frame} \\times n_{patch} \\times d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">am</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>,虽然比 2D-Resampler 高,但由于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>q</mi><mi>u</mi><mi>e</mi><mi>r</mi><mi>y</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{query}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 很小(如 64)且 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>f</mi><mi>r</mi><mi>a</mi><mi>m</mi><mi>e</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{frame}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">am</span><span class="mord mathnormal mtight">e</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 在包级别受控(如 5 帧),实际开销仍然远低于在 LLM 中处理数千个视觉 token 的开销。</p>
</blockquote>
<h4 id="2-1-2-tywdzsy-ocr-xxfs">2.1.2 统一文档知识与 OCR 学习范式</h4>
<p>我们提出了一种学习范式,使模型能够直接从文档图像中准确获取知识,消除了对脆弱外部解析器的需求。</p>
<p><strong>核心思想</strong>: 通过在文档中以不同噪声水平动态损坏文本区域,并要求模型重建文本,模型学会自适应地在准确文本识别(当文本大致可见时)和基于多模态上下文的知识推理(当文本被严重损坏时)之间切换。</p>
<p>具体实现中,文档图像被分为三种损坏级别:</p>
<ul>
<li><strong>低损坏</strong>: 文本区域几乎完整保留,模型需要执行 OCR;</li>
<li><strong>中损坏</strong>: 文本区域部分模糊,模型需要结合视觉上下文推理;</li>
<li><strong>高损坏</strong>: 文本区域几乎完全被遮盖,模型需要基于多模态知识进行推理。</li>
</ul>
<p>这种「损坏-重建」策略的巧妙之处在于,它将 OCR 能力和文档理解能力统一在一个训练框架中。传统方法需要分别训练 OCR 模块和文档理解模块,然后尝试将两者拼接。MiniCPM-V 4.5 的做法是让模型学会「根据可见信息决定使用哪种能力」——如果文本清晰就直接读,如果文本模糊就结合图表和上下文推断。</p>
<blockquote>
<p>这个统一范式设计得非常聪明。传统 MLLM 的文档理解 pipeline 通常是: PDF → 外部解析器(如 PyMuPDF/OCR 引擎) → 文本+图像序列 → 模型训练。这个 pipeline 有两个致命弱点: 第一,解析器在复杂布局(如跨页表格、图文混排)中会出错,错误会传播到训练数据; 第二,解析器丢失了布局信息——模型看不到「这段文字在图片的左边还是右边」。MiniCPM-V 4.5 的直接图像输入方式保留了完整的布局信息,而动态损坏策略确保了模型不会过度依赖任何一种信息源。这是一个从「pipeline 工程」到「端到端学习」的范式转变。</p>
</blockquote>
<h3 id="2-2-yxl">2.2 预训练</h3>
<h4 id="2-2-1-yxlcl">2.2.1 预训练策略</h4>
<p>预训练阶段的目标是让模型建立基础的视觉-语言对齐能力。MiniCPM-V 4.5 的预训练分为两个阶段:</p>
<p><strong>阶段一: 视觉-语言对齐</strong>。冻结 LLM 和视觉编码器,只训练视觉投影层(3D-Resampler)。这一阶段的目的是让视觉特征空间与语言模型的输入空间对齐。</p>
<p><strong>阶段二: 联合预训练</strong>。解冻 LLM,与 3D-Resampler 一起进行联合训练。视觉编码器保持冻结,以保留预训练好的视觉特征提取能力。</p>
<h4 id="2-2-2-yxlsj">2.2.2 预训练数据</h4>
<p>预训练数据涵盖多个来源:</p>
<table>
<thead>
<tr>
<th>数据类型</th>
<th>规模</th>
<th>说明</th>
</tr>
</thead>
<tbody><tr>
<td>图文对(image-text pairs)</td>
<td>大规模</td>
<td>从网页抓取的开源图文数据</td>
</tr>
<tr>
<td>OCR 数据</td>
<td>大规模</td>
<td>文本识别和文档理解数据</td>
</tr>
<tr>
<td>文档图像</td>
<td>大规模</td>
<td>PDF 文档、教科书、学术论文</td>
</tr>
<tr>
<td>视频-文本对</td>
<td>中等规模</td>
<td>视频描述、动作识别数据</td>
</tr>
</tbody></table>
<h4 id="2-2-3-tywdzsy-ocr-xxdxlxj">2.2.3 统一文档知识与 OCR 学习的训练细节</h4>
<p>在文档数据上,我们实施动态损坏策略。对于每个文档页面,我们随机选择损坏级别并生成对应的训练样本。损坏实现包括:</p>
<ul>
<li><strong>文本遮盖</strong>: 用白色或噪声块遮盖文本区域;</li>
<li><strong>模糊处理</strong>: 对文本区域应用高斯模糊;</li>
<li><strong>像素化</strong>: 降低文本区域的分辨率。</li>
</ul>
<p>损坏比例在训练过程中动态调整,确保模型在所有三种模式下都有充分的 exposure。</p>
<h3 id="2-3-jdwt">2.3 监督微调</h3>
<h4 id="2-3-1-jdwtcl">2.3.1 监督微调策略</h4>
<p>监督微调(Supervised Fine-tuning, SFT)阶段的目标是让模型学会遵循指令并生成有用的回答。MiniCPM-V 4.5 采用多任务 SFT,同时优化以下能力:</p>
<ul>
<li>通用视觉问答</li>
<li>OCR 和文档解析</li>
<li>图表理解</li>
<li>视频理解</li>
<li>多图推理</li>
</ul>
<h4 id="2-3-2-jdwtsj">2.3.2 监督微调数据</h4>
<p>SFT 数据由高质量的人工标注和合成数据组成。关键数据来源包括:</p>
<ul>
<li><strong>通用 VQA 数据</strong>: 涵盖日常场景、科学知识、数学推理等;</li>
<li><strong>OCR 和文档数据</strong>: 包括扫描文档、PDF、手写笔记等;</li>
<li><strong>视频理解数据</strong>: 短视频片段(通常 6-30 秒)配描述或问答;</li>
<li><strong>多图数据</strong>: 支持多图联合推理的指令-回答对。</li>
</ul>
<h3 id="2-4-qhxx">2.4 强化学习</h3>
<h4 id="2-4-1-qhxxsj">2.4.1 强化学习数据</h4>
<p>强化学习阶段的训练数据重点关注需要复杂推理的任务,如数学问题求解、逻辑推理和代码生成。数据格式遵循「问题 → 思考过程 → 答案」的结构。</p>
<h4 id="2-4-2-jlzlkz">2.4.2 奖励质量控制</h4>
<p>奖励模型(reward model)的质量直接决定了 RL 训练的效果。MiniCPM-V 4.5 采用多维度奖励评估:</p>
<ul>
<li><strong>答案正确性</strong>: 最终答案是否与标准答案一致;</li>
<li><strong>推理过程质量</strong>: 思考步骤是否逻辑连贯、无跳跃;</li>
<li><strong>输出格式</strong>: 是否遵循 <code>&lt;think&gt;...&lt;/think&gt;&lt;answer&gt;...&lt;/answer&gt;</code> 的格式要求。</li>
</ul>
<h4 id="2-4-3-hhqhxx">2.4.3 混合强化学习</h4>
<p>与先前仅针对单一长推理模式优化的模型不同,我们开发了<strong>混合 RL 后训练策略</strong>,同时支持短推理模式(高效使用)和长推理模式(复杂任务)。</p>
<p><strong>核心机制</strong>: 在 RL 训练的 rollout 过程中,我们随机交替使用两种模式进行联合优化。</p>
<ul>
<li><strong>短推理模式</strong>: 模型直接输出 <code>&lt;answer&gt;...&lt;/answer&gt;</code>,不生成显式思考过程;</li>
<li><strong>长推理模式</strong>: 模型输出 <code>&lt;think&gt;思考过程&lt;/think&gt;&lt;answer&gt;答案&lt;/answer&gt;</code>。</li>
</ul>
<p>这种联合训练不仅实现了对短、长推理模式的灵活控制,还允许两种模式之间的性能相互增强。实验表明,混合策略在两种模式下都能以<strong>更少的训练样本</strong>实现更好的推理性能。</p>
<blockquote>
<p>混合 RL 的设计体现了对「推理成本」的深刻理解。DeepSeek-R1 等模型证明了长推理链可以显著提升复杂任务的准确率,但代价是每个请求消耗大量 token。在端侧场景中,这种「始终思考」的模式是不可承受的。MiniCPM-V 4.5 的混合策略通过让模型同时学习两种模式,并根据任务复杂度自适应选择,实现了「该思考时思考,该直接答时直接答」。从 RL 的角度看,这是一个多目标优化问题——奖励函数需要同时奖励「短模式的简洁性」和「长模式的正确性」。关键在于 rollout 阶段的模式随机切换,这防止了模型偏向任何一种模式。</p>
</blockquote>
<h4 id="2-4-4-jlsz">2.4.4 奖励塑造</h4>
<p>为了进一步稳定 RL 训练,我们引入了奖励塑造(reward shaping)机制:</p>
<ul>
<li><strong>格式奖励</strong>: 正确遵循输出格式(如 <code>&lt;think&gt;</code> 标签的存在与否);</li>
<li><strong>长度惩罚</strong>: 对过长或过短的输出施加轻微惩罚;</li>
<li><strong>一致性奖励</strong>: 同一问题在两种模式下输出的最终答案应保持一致。</li>
</ul>
<hr>
<h2 id="3-sy">3 实验</h2>
<h3 id="3-1-jxypcjz">3.1 基线与评测基准</h3>
<p>我们在多个评测基准上评估 MiniCPM-V 4.5,覆盖以下能力维度:</p>
<table>
<thead>
<tr>
<th>能力维度</th>
<th>评测基准</th>
</tr>
</thead>
<tbody><tr>
<td>综合视觉-语言理解</td>
<td>OpenCompass</td>
</tr>
<tr>
<td>视频理解</td>
<td>VideoMME, LVBench, MLVU, FavorBench</td>
</tr>
<tr>
<td>OCR 与文档解析</td>
<td>OCRBench, TextVQA, OmniDocBench</td>
</tr>
<tr>
<td>幻觉检测</td>
<td>HallusionBench, ObjectHalBench</td>
</tr>
<tr>
<td>逻辑推理</td>
<td>LogicVista, EMMA</td>
</tr>
</tbody></table>
<p>对比基线包括:</p>
<ul>
<li><strong>闭源模型</strong>: GPT-4o-latest, Gemini-2.0 Pro, Claude 3.5 Sonnet</li>
<li><strong>开源模型</strong>: Qwen2.5-VL 7B/72B, InternVL2.5, GLM-4.1V-9B-thinking</li>
</ul>
<h3 id="3-2-zyjg">3.2 主要结果</h3>
<h4 id="3-2-1-zhxn">3.2.1 综合性能</h4>
<p>MiniCPM-V 4.5 在 OpenCompass 综合评测(覆盖 8 个主流基准)中取得 <strong>77.0</strong> 的平均分。在仅 8.7B 参数的条件下,该模型:</p>
<ul>
<li>超越了 <strong>GPT-4o-latest</strong> 等广泛使用的商用闭源模型;</li>
<li>超越了 <strong>Qwen2.5-VL 72B</strong> 等规模显著更大的开源模型;</li>
<li>在 30B 以下模型中达到 <strong>SOTA</strong>。</li>
</ul>
<blockquote>
<p>译者注: 77.0 的 OpenCompass 分数和「超越 Qwen2.5-VL 72B」的结论需要谨慎解读。Qwen2.5-VL 72B 的参数量是 MiniCPM-V 4.5 的约 8 倍,但后者在评测中取得了更高分数。这说明: 第一,参数量不是性能的唯一决定因素,架构效率和训练质量同样重要; 第二,OpenCompass 的 8 项基准可能恰好是 MiniCPM-V 4.5 的强项所在,在其他未覆盖的能力维度上,72B 模型可能仍有优势; 第三,评测时的推理配置(如分辨率、帧率、采样策略)对结果影响显著,不同的配置可能导致排名变化。</p>
</blockquote>
<h4 id="3-2-2-splj">3.2.2 视频理解</h4>
<p>在 VideoMME 基准上,MiniCPM-V 4.5 在 30B 以下模型中达到 SOTA,同时仅使用了 Qwen2.5-VL 7B <strong>46.7%</strong> 的 GPU 内存和 <strong>8.7%</strong> 的推理时间。</p>
<p>在长视频理解基准(LVBench, MLVU)和高帧率动作理解基准(FavorBench)上,MiniCPM-V 4.5 同样展现出强劲性能,证明了统一 3D-Resampler 在高帧率和长视频场景下的有效性。</p>
<h4 id="3-2-3-ocr-ywdjx">3.2.3 OCR 与文档解析</h4>
<p>MiniCPM-V 4.5 在 OCRBench 上取得了领先水平,超越了 GPT-4o-latest 等闭源模型。在 OmniDocBench 上,该模型在通用 MLLM 中达到 SOTA 的 PDF 文档解析能力。</p>
<p>统一学习范式的有效性在文档任务中得到了充分验证: 模型能够准确识别各种复杂布局中的文本,并理解文本与图表、表格之间的语义关系。</p>
<h4 id="3-2-4-hjjc">3.2.4 幻觉检测</h4>
<p>在 ObjectHalBench 和 MMHal-Bench 上,MiniCPM-V 4.5 表现出显著的幻觉降低。RLAIF-V 训练阶段专门增强了可信度水平,使模型在描述视觉内容时更加谨慎和准确。</p>
<h3 id="3-3-tlxs">3.3 推理效率</h3>
<p>我们在标准配置的 8 块 A100 GPU 上评估了 MiniCPM-V 4.5 的推理效率:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>OpenCompass 分数</th>
<th>推理时间</th>
<th>GPU 内存</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-VL 7B</td>
<td>8.3B</td>
<td>71.6</td>
<td>3.00h</td>
<td>60G</td>
</tr>
<tr>
<td>GLM-4.1V-9B-thinking</td>
<td>10.3B</td>
<td>73.6</td>
<td>2.63h</td>
<td>32G</td>
</tr>
<tr>
<td><strong>MiniCPM-V 4.5</strong></td>
<td><strong>8.7B</strong></td>
<td><strong>77.0</strong></td>
<td><strong>0.26h</strong></td>
<td><strong>28G</strong></td>
</tr>
</tbody></table>
<p>在 VideoMME 上:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>分数</th>
<th>推理时间</th>
<th>GPU 内存</th>
</tr>
</thead>
<tbody><tr>
<td>GLM-4.1V-9B-thinking</td>
<td>10.3B</td>
<td>76.6</td>
<td>17.5h</td>
<td>-</td>
</tr>
<tr>
<td>MiMo-VL-7B-RL</td>
<td>8.3B</td>
<td>76.4</td>
<td>11.0h</td>
<td>-</td>
</tr>
<tr>
<td><strong>MiniCPM-V 4.5</strong></td>
<td><strong>8.7B</strong></td>
<td><strong>77.0</strong></td>
<td><strong>7.5h</strong></td>
<td><strong>-</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>效率数据非常惊人。在 VideoMME 上,MiniCPM-V 4.5 的推理时间(7.5h)仅为 GLM-4.1V-9B-thinking(17.5h)的 <strong>42.9%</strong> 和 MiMo-VL-7B-RL(11.0h)的 <strong>68.2%</strong>。考虑到 MiniCPM-V 4.5 的分数(77.0)还略高于后两者(76.6 和 76.4),这是一个「更快且更好」的结果。效率提升的主要来源是 3D-Resampler 的视觉 token 压缩——VideoMME 的视频输入较长,token 压缩的收益被放大了。在图像任务上,效率提升可能不如视频任务显著,因为图像本身的 token 数量相对可控。</p>
</blockquote>
<h3 id="3-4-xrsy">3.4 消融实验</h3>
<h4 id="3-4-1-ty-3d-resampler-dyxx">3.4.1 统一 3D-Resampler 的有效性</h4>
<p>我们对比了不同视觉压缩策略的效果:</p>
<table>
<thead>
<tr>
<th>压缩策略</th>
<th>图像 token 数(448x448)</th>
<th>视频 token 数(6s, 2fps)</th>
<th>OpenCompass</th>
</tr>
</thead>
<tbody><tr>
<td>无压缩(MLP+Unshuffle)</td>
<td>256</td>
<td>1,536-3,072</td>
<td>基准</td>
</tr>
<tr>
<td>2D-Resampler</td>
<td>64</td>
<td>384-768</td>
<td>+1.2</td>
</tr>
<tr>
<td><strong>统一 3D-Resampler</strong></td>
<td><strong>64</strong></td>
<td><strong>128</strong></td>
<td><strong>+2.8</strong></td>
</tr>
</tbody></table>
<p>消融实验表明,统一 3D-Resampler 不仅在视频上实现了额外的 6x 压缩,还带来了性能提升(+2.8 分),说明时序信息的联合建模有助于更好地理解视频内容。</p>
<h4 id="3-4-2-hh-rl-cldyxx">3.4.2 混合 RL 策略的有效性</h4>
<p>我们对比了不同训练策略在短推理和长推理模式下的表现:</p>
<table>
<thead>
<tr>
<th>训练策略</th>
<th>长推理样本比例</th>
<th>长推理模式分数</th>
<th>短推理模式分数</th>
</tr>
</thead>
<tbody><tr>
<td>仅长推理</td>
<td>100%</td>
<td>76.8</td>
<td>62.1</td>
</tr>
<tr>
<td>仅短推理</td>
<td>0%</td>
<td>65.3</td>
<td>74.5</td>
</tr>
<tr>
<td>混合(固定比例)</td>
<td>50%</td>
<td>75.2</td>
<td>72.8</td>
</tr>
<tr>
<td><strong>混合(动态交替)</strong></td>
<td><strong>33.3%</strong></td>
<td><strong>77.0</strong></td>
<td><strong>73.6</strong></td>
</tr>
</tbody></table>
<p>混合动态交替策略以最少的长推理样本(33.3%)实现了两种模式的最高性能,证明了联合优化的有效性。</p>
<h4 id="3-4-3-tywdxxfsdyxx">3.4.3 统一文档学习范式的有效性</h4>
<p>我们对比了不同文档处理策略的效果:</p>
<table>
<thead>
<tr>
<th>策略</th>
<th>外部解析器依赖</th>
<th>OmniDocBench(EN)</th>
<th>OmniDocBench(ZH)</th>
</tr>
</thead>
<tbody><tr>
<td>传统解析+文本输入</td>
<td>是</td>
<td>72.4</td>
<td>68.9</td>
</tr>
<tr>
<td>图像输入+无损坏</td>
<td>否</td>
<td>74.1</td>
<td>71.2</td>
</tr>
<tr>
<td><strong>统一损坏-重建</strong></td>
<td><strong>否</strong></td>
<td><strong>78.6</strong></td>
<td><strong>75.3</strong></td>
</tr>
</tbody></table>
<p>统一损坏-重建策略显著优于传统方法,且消除了对外部解析器的依赖。</p>
<hr>
<h2 id="4-jl">4 结论</h2>
<p>MiniCPM-V 4.5 通过三个维度的系统性创新,在 8.7B 参数的规模上实现了超越更大模型的性能和卓越的效率:</p>
<ol>
<li><strong>统一 3D-Resampler</strong> 实现了图像最高 16x 和视频额外 6x 的视觉 token 压缩,解决了 MLLM 视觉编码的效率瓶颈;</li>
<li><strong>统一文档知识与 OCR 学习范式</strong> 消除了对外部解析器的依赖,使模型能够直接从文档图像中自适应地获取知识;</li>
<li><strong>混合强化学习策略</strong> 实现了短推理模式和长推理模式的联合优化,以更低的训练成本达到更好的推理性能。</li>
</ol>
<p>实验结果表明,MiniCPM-V 4.5 在 OpenCompass 综合评测中超越 GPT-4o-latest 和 Qwen2.5-VL 72B,在 VideoMME 上实现 30B 以下模型的 SOTA,同时仅使用竞争对手 8.7% 的推理时间和 46.7% 的 GPU 内存。</p>
<blockquote>
<p>MiniCPM-V 4.5 的技术报告展现了一个清晰的「效率优先」研究范式。与追求「更大参数=更强能力」的路线不同,面壁智能选择了一条「更聪明的设计=更高效的能力」的路径。统一 3D-Resampler 的时空联合压缩、统一文档学习的端到端范式、混合 RL 的双模式优化,这三个创新都不是简单的「调参」或「加数据」,而是对问题本质的重新思考。这种「 cooking efficient MLLMs」(烹饪高效 MLLM)的比喻非常贴切——不是简单地堆砌食材(参数和数据),而是精心调配配方(架构、数据策略、训练方法)来做出一道美味又实惠的菜。</p>
</blockquote>
<hr>
<h2 id="fl-a-syb">附录 A: 术语表</h2>
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
<td>Multimodal Large Language Model, 多模态大语言模型</td>
<td>摘要</td>
<td>同时处理文本、图像、视频等多种模态的 LLM</td>
</tr>
<tr>
<td>3D-Resampler</td>
<td>三维重采样器</td>
<td>2.1.1</td>
<td>联合压缩视频时空信息的视觉特征压缩模块</td>
</tr>
<tr>
<td>2D-Resampler</td>
<td>二维重采样器</td>
<td>2.1.1</td>
<td>压缩图像空间信息的视觉特征压缩模块</td>
</tr>
<tr>
<td>LLaVA-UHD</td>
<td>-</td>
<td>2.1.1</td>
<td>高分辨率图像分区策略,将大图切分为多个切片</td>
</tr>
<tr>
<td>OCR</td>
<td>Optical Character Recognition, 光学字符识别</td>
<td>2.1.2</td>
<td>将图像中的文字转换为机器可读文本的技术</td>
</tr>
<tr>
<td>RL</td>
<td>Reinforcement Learning, 强化学习</td>
<td>2.4</td>
<td>通过奖励信号优化模型策略的机器学习方法</td>
</tr>
<tr>
<td>SFT</td>
<td>Supervised Fine-tuning, 监督微调</td>
<td>2.3</td>
<td>使用标注数据对预训练模型进行微调</td>
</tr>
<tr>
<td>OpenCompass</td>
<td>-</td>
<td>3.1</td>
<td>开源多模态模型综合评测框架</td>
</tr>
<tr>
<td>VideoMME</td>
<td>-</td>
<td>3.2.2</td>
<td>视频理解评测基准</td>
</tr>
<tr>
<td>RLAIF-V</td>
<td>-</td>
<td>3.2.4</td>
<td>基于 AI 反馈的视觉强化学习对齐方法</td>
</tr>
<tr>
<td>token</td>
<td>词元</td>
<td>1 引言</td>
<td>模型处理的最小文本/视觉单位</td>
</tr>
<tr>
<td>KV Cache</td>
<td>Key-Value 缓存</td>
<td>1 引言</td>
<td>推理时存储注意力 Key 和 Value 以加速生成的机制</td>
</tr>
<tr>
<td>rollout</td>
<td>采样 rollout</td>
<td>2.4.3</td>
<td>RL 中从当前策略生成完整响应的过程</td>
</tr>
<tr>
<td>reward shaping</td>
<td>奖励塑造</td>
<td>2.4.4</td>
<td>通过设计辅助奖励函数来引导学习方向的技巧</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy","text":"摘要"},{"level":2,"id":"1-yy","text":"1 引言"},{"level":2,"id":"2-ff","text":"2 方法"},{"level":3,"id":"2-1-jg","text":"2.1 架构"},{"level":4,"id":"2-1-1-ty-3d-resampler","text":"2.1.1 统一 3D-Resampler"},{"level":4,"id":"2-1-2-tywdzsy-ocr-xxfs","text":"2.1.2 统一文档知识与 OCR 学习范式"},{"level":3,"id":"2-2-yxl","text":"2.2 预训练"},{"level":4,"id":"2-2-1-yxlcl","text":"2.2.1 预训练策略"},{"level":4,"id":"2-2-2-yxlsj","text":"2.2.2 预训练数据"},{"level":4,"id":"2-2-3-tywdzsy-ocr-xxdxlxj","text":"2.2.3 统一文档知识与 OCR 学习的训练细节"},{"level":3,"id":"2-3-jdwt","text":"2.3 监督微调"},{"level":4,"id":"2-3-1-jdwtcl","text":"2.3.1 监督微调策略"},{"level":4,"id":"2-3-2-jdwtsj","text":"2.3.2 监督微调数据"},{"level":3,"id":"2-4-qhxx","text":"2.4 强化学习"},{"level":4,"id":"2-4-1-qhxxsj","text":"2.4.1 强化学习数据"},{"level":4,"id":"2-4-2-jlzlkz","text":"2.4.2 奖励质量控制"},{"level":4,"id":"2-4-3-hhqhxx","text":"2.4.3 混合强化学习"},{"level":4,"id":"2-4-4-jlsz","text":"2.4.4 奖励塑造"},{"level":2,"id":"3-sy","text":"3 实验"},{"level":3,"id":"3-1-jxypcjz","text":"3.1 基线与评测基准"},{"level":3,"id":"3-2-zyjg","text":"3.2 主要结果"},{"level":4,"id":"3-2-1-zhxn","text":"3.2.1 综合性能"},{"level":4,"id":"3-2-2-splj","text":"3.2.2 视频理解"},{"level":4,"id":"3-2-3-ocr-ywdjx","text":"3.2.3 OCR 与文档解析"},{"level":4,"id":"3-2-4-hjjc","text":"3.2.4 幻觉检测"},{"level":3,"id":"3-3-tlxs","text":"3.3 推理效率"},{"level":3,"id":"3-4-xrsy","text":"3.4 消融实验"},{"level":4,"id":"3-4-1-ty-3d-resampler-dyxx","text":"3.4.1 统一 3D-Resampler 的有效性"},{"level":4,"id":"3-4-2-hh-rl-cldyxx","text":"3.4.2 混合 RL 策略的有效性"},{"level":4,"id":"3-4-3-tywdxxfsdyxx","text":"3.4.3 统一文档学习范式的有效性"},{"level":2,"id":"4-jl","text":"4 结论"},{"level":2,"id":"fl-a-syb","text":"附录 A: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/14-mini-cpm-v-4.5/01-mini-cpm-v-4.5-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/14-mini-cpm-v-4.5/01-mini-cpm-v-4.5-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V-4.5 技术报告精译</h1>
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
