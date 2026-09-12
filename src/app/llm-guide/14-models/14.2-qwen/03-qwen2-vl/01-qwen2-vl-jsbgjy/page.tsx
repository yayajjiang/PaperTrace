"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Qwen2-VL 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.2-qwen/14.2-qwen">返回 14.2-Qwen 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p><strong>原文</strong>: Qwen2-VL: Enhancing Vision-Language Model&#39;s Perception of the World at Any Resolution (arXiv:2409.12191)
<strong>发布机构</strong>: Qwen Team, Alibaba Group
<strong>翻译说明</strong>: 以下内容为技术报告全文逐段精译,保留所有公式、表格结构与实验数据.英文术语首次出现时附原文,后续直接使用缩写.</p>
</blockquote>
<hr>
<h2 id="zy-abstract">摘要 (Abstract)</h2>
<p>我们推出 Qwen2-VL 系列,这是对前代 Qwen-VL 模型的高级升级,重新定义了视觉处理中传统的预定分辨率方法.Qwen2-VL 引入了 Naive Dynamic Resolution 机制,使模型能够动态处理不同分辨率的图像,将其转换为不同数量的视觉 token.这种方法让模型能够生成更高效和准确的视觉表示,紧密对齐人类的感知过程.</p>
<p>该模型还整合了 Multimodal Rotary Position Embedding (M-RoPE, 多模态旋转位置编码),促进跨文本、图像和视频的位置信息有效融合.我们采用统一的范式处理图像和视频,增强模型的视觉感知能力.为探索大型多模态模型的潜力,Qwen2-VL 研究了大型视觉语言模型(LVLMs)的 scaling laws.通过扩展模型尺寸——提供 2B、8B 和 72B 参数版本——以及训练数据量,Qwen2-VL 系列实现了极具竞争力的性能.</p>
<p>值得注意的是,Qwen2-VL-72B 模型在各项多模态基准上取得了与 GPT-4o 和 Claude3.5-Sonnet 等领先模型相当的结果,超越了其他通用模型.</p>
<hr>
<h2 id="1-yy-introduction">1. 引言 (Introduction)</h2>
<p>在人工智能领域,大型视觉语言模型(LVLMs)代表了重大飞跃,建立在传统大语言模型强大的文本处理能力之上.这些先进模型现在涵盖了解读和分析更广泛数据谱系的能力,包括图像、音频和视频.这种能力的扩展已将 LVLMs 转变为应对各种现实世界挑战不可或缺的工具.</p>
<p>通过整合多样化的数据形式,LVLMs 旨在更紧密地模仿人类感知和与环境交互的细微方式.这使这些模型能够更准确地表示我们如何参与和感知环境.</p>
<p>近期大型视觉语言模型的进步在较短时间内带来了显著提升.这些模型通常遵循「视觉Encoder  → 跨模态连接器 → LLM」的通用方法.这种设置结合以 next-token prediction 为主要训练方法,以及高质量数据集的可用性,推动了大部分进展.更大的模型架构、更高分辨率的图像,以及 MoE、模型集成和更复杂的跨模态连接器等先进技术也在提升 LVLMs 有效处理复杂视觉和文本信息的能力方面发挥了关键作用.</p>
<p>然而,当前大型视觉语言模型通常受限于固定的图像输入尺寸.标准 LVLMs 将输入图像编码为固定分辨率(如 224×224),通常通过下采样或上采样图像,或采用「先缩放再填充」的方法.虽然这种「一刀切」的策略能够以一致的分辨率处理图像,但它也限制了模型捕捉不同尺度信息的能力,特别是在高分辨率图像中导致详细信息的显著丢失.因此,这类模型在感知视觉信息的尺度和细节敏感度方面无法达到人类视觉的水平.</p>
<p>此外,大多数 LVLM 依赖静态的、冻结的 CLIP 风格视觉Encoder ,这引发了对这种预训练模型产生的视觉表示是否足够的担忧,特别是对于复杂推理任务和处理图像中复杂细节.近期工作尝试通过在 LVLM 训练过程中微调 ViT 来解决这些局限,已显示出改进效果.为进一步增强模型对不同分辨率的适应性,我们在 LVLM 训练过程中引入了动态分辨率训练.具体而言,我们在 ViT 中采用 2D Rotary Position Embedding (RoPE),从而使模型能够更好地跨不同空间尺度捕捉信息.</p>
<p><img src="/llm-guide/14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy/images/qwen2_vl_example.jpg" alt="Qwen2-VL 能力概览"></p>
<blockquote>
<p><strong>图 1</strong>: Qwen2-VL 能力:多语言图像文本理解、代码/数学推理、视频分析、实时对话、智能体潜力等.详见附录.</p>
</blockquote>
<p>谈到视频内容——本质上是一系列帧——许多现有模型继续将其视为独立模态.然而,理解视频中体现的现实动态特性,对于旨在把握现实世界复杂性的模型至关重要.与本质上是一维的文本不同,现实环境存在于三维空间中.当前模型中使用的一维位置嵌入显著限制了其有效建模三维空间和时间动态的能力.为弥合这一差距,我们开发了 M-RoPE,它采用独立的组件来表示时间和空间信息.这使模型能够自然地理解动态内容(如视频或流数据),提升其理解和交互世界的能力.</p>
<p>此外,与大语言模型的 scaling 相比,当前 LVLMs 仍处于探索训练数据和模型参数规模影响的早期阶段.LVLMs scaling laws 的探索——模型和数据规模的增加如何影响性能——仍然是一个开放且充满前景的研究领域.</p>
<p>在本工作中,我们介绍 Qwen 家族大型视觉语言模型的最新成员:Qwen2-VL 系列,包含三个总参数分别为 20 亿、80 亿和 720 亿的开放权重模型.如图 1 所示,Qwen2-VL 的关键进展包括:</p>
<ul>
<li><strong>跨各种分辨率和长宽比的 SOTA 理解能力</strong>: Qwen2-VL 在视觉基准上取得领先性能,包括 DocVQA、InfoVQA、RealWorldQA、MTVQA、MathVista 等.</li>
<li><strong>理解延长时长视频(20 分钟+)</strong>: Qwen2-VL 能够理解超过 20 分钟的视频,增强其执行高质量基于视频的问答、对话、内容创作等能力.</li>
<li><strong>用于设备操作的稳健智能体能力</strong>: 凭借先进的推理和决策能力,Qwen2-VL 可与手机、机器人等设备集成,基于视觉输入和文本指令实现自主操作.</li>
<li><strong>多语言支持</strong>: 为服务全球用户,除英语和中文外,Qwen2-VL 现支持图像内的多语言上下文理解,包括大多数欧洲语言、日语、韩语、阿拉伯语、越南语等.</li>
</ul>
<p><strong>表 1: Qwen2-VL 模型描述</strong></p>
<table>
<thead>
<tr>
<th align="left">模型名称</th>
<th align="center">视觉Encoder</th>
<th align="center">LLM</th>
<th align="left">模型描述</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Qwen2-VL-2B</td>
<td align="center">675M</td>
<td align="center">1.5B</td>
<td align="left">最高效的模型,设计用于端侧运行.在资源有限的大多数场景中提供足够的性能.</td>
</tr>
<tr>
<td align="left">Qwen2-VL-7B</td>
<td align="center">675M</td>
<td align="center">7.6B</td>
<td align="left">性价比优化的模型,文本识别和视频理解能力显著升级.在广泛的视觉任务中提供显著性能.</td>
</tr>
<tr>
<td align="left">Qwen2-VL-72B</td>
<td align="center">675M</td>
<td align="center">72B</td>
<td align="left">最强大的模型,在视觉推理、指令遵循、决策和智能体能力方面进一步改进.在大多数复杂任务上提供最优性能.</td>
</tr>
</tbody></table>
<p><img src="/llm-guide/14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy/images/qwen2_vl_frame.jpg" alt="Qwen2-VL 模型结构示意"></p>
<blockquote>
<p><strong>图 2</strong>: Qwen2-VL 能够准确识别和理解图像中的内容,无论其清晰度、分辨率或极端长宽比如何.</p>
</blockquote>
<hr>
<h2 id="2-ff-approach">2. 方法 (Approach)</h2>
<p>Qwen2-VL 系列包含三种尺寸的模型:Qwen2-VL-2B、Qwen2-VL-7B 和 Qwen2-VL-72B.表 1 列出了超参数和重要信息.值得注意的是,Qwen2-VL 在各种规模的 LLM 中均采用 675M 参数的 ViT,确保无论 LLM 的规模如何,ViT 的计算负载保持恒定.</p>
<h3 id="2-1-mxjg-model-architecture">2.1 模型架构 (Model Architecture)</h3>
<p>图 2 展示了 Qwen2-VL 的完整结构.我们保留了 Qwen-VL 的框架,整合视觉Encoder 和语言模型.为适应各种规模,我们实现了一个约 6.75 亿参数的 Vision Transformer (ViT), adept at 处理图像和视频输入.在语言处理方面,我们选择了更强大的 Qwen2 系列语言模型.为进一步增强模型有效感知和理解视频中视觉信息的能力,我们引入了以下几项关键升级:</p>
<h4 id="2-1-1-naive-dynamic-resolution">2.1.1 Naive Dynamic Resolution</h4>
<p>Qwen2-VL 的一项关键架构改进是引入了 naive dynamic resolution 支持.与 Qwen-VL 不同,Qwen2-VL 现在可以处理任意分辨率的图像,动态将其转换为可变数量的视觉 token.</p>
<blockquote>
<p>译者注: 这项技术此前已在内部迭代版本 Qwen-VL Plus 和 Qwen-VL MAX 中实现.我们在 Qwen2-VL 中对其进行了进一步升级.</p>
</blockquote>
<p>为支持这一特性,我们通过移除原始绝对位置嵌入并引入 2D-RoPE 来捕捉图像的二维位置信息,从而修改了 ViT.在推理阶段,不同分辨率的图像被打包成单个序列,打包长度被控制以限制 GPU 显存使用.此外,为减少每张图像的视觉 token,在 ViT 后使用一个简单的 MLP 层将相邻的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">2\\times2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> token 压缩为单个 token,并在压缩后的视觉 token 开头和结尾放置特殊的 <code>&lt;|vision_start|&gt;</code> 和 <code>&lt;|vision_end|&gt;</code> token.因此,一张分辨率为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>224</mn><mo>×</mo><mn>224</mn></mrow><annotation encoding="application/x-tex">224\\times224</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">224</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">224</span></span></span></span> 的图像,使用 patch_size=14 的 ViT 编码后,在输入 LLM 前将被压缩至 66 个 token.</p>
<p>这里需要理解的是,「naive」这个词的选择是有意的——相比复杂的自适应分辨率策略,Qwen2-VL 的做法极其简单:直接按原生分辨率处理,然后用 MLP 做 4× 压缩.这种朴素性的工程价值在于:不需要为不同分辨率设计复杂的采样或金字塔结构,训练时也不需要对齐不同尺度的特征.代价是序列长度随图像分辨率线性增长,但 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">2\\times2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> 的压缩已经将这个增长降低了 4 倍.以 4K 图像(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>3840</mn><mo>×</mo><mn>2160</mn></mrow><annotation encoding="application/x-tex">3840\\times2160</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">3840</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2160</span></span></span></span>)为例,经 patchify 后产生 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mn>3840</mn><mi mathvariant="normal">/</mi><mn>14</mn><mo stretchy="false">)</mo><mo>×</mo><mo stretchy="false">(</mo><mn>2160</mn><mi mathvariant="normal">/</mi><mn>14</mn><mo stretchy="false">)</mo><mo>≈</mo><mn>276</mn><mo>×</mo><mn>154</mn></mrow><annotation encoding="application/x-tex">(3840/14)\\times(2160/14) \\approx 276\\times154</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">3840/14</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord">2160/14</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">276</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">154</span></span></span></span> 个 patch,再经 4× 压缩后约为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>138</mn><mo>×</mo><mn>77</mn><mo>≈</mo><mn>10626</mn></mrow><annotation encoding="application/x-tex">138\\times77 \\approx 10626</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">138</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">77</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10626</span></span></span></span> 个视觉 token——虽然仍很长,但在现代 LLM 的上下文窗口内是可管理的.</p>
<h4 id="2-1-2-multimodal-rotary-position-embedding-m-rope">2.1.2 Multimodal Rotary Position Embedding (M-RoPE)</h4>
<p>另一项关键架构增强是 M-RoPE 的创新.与仅限于编码一维位置信息的传统 1D-RoPE 不同,M-RoPE 有效建模多模态输入的位置信息.这是通过将原始旋转嵌入解构为三个组件实现的:时间(temporal)、高度(height)和宽度(width).</p>
<p>对于文本输入,这些组件使用相同的位置 ID,使 M-RoPE 在功能上等同于 1D-RoPE.处理图像时,每个视觉 token 的时间 ID 保持恒定,而高度和宽度组件根据 token 在图像中的位置分配不同的 ID.对于视频(被视为帧序列),时间 ID 随每帧递增,而高度和宽度组件遵循与图像相同的 ID 分配模式.在模型输入涵盖多种模态的场景中,每种模态的位置编号通过将前一种模态的最大位置 ID 加一来初始化.</p>
<p><img src="/llm-guide/14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy/images/mrope.png" alt="M-RoPE 示意图"></p>
<blockquote>
<p><strong>图 3</strong>: M-RoPE 演示.通过将旋转嵌入分解为时间、高度和宽度组件,M-RoPE 可以显式建模 LLM 中文本、图像和视频的位置信息.</p>
</blockquote>
<p>M-RoPE 不仅增强了位置信息的建模,还降低了图像和视频的位置 ID 值,使模型能够在推理时外推到更长的序列.</p>
<blockquote>
<p>这里值得停一下.M-RoPE 的设计洞察非常深刻:传统 1D-RoPE 把文本、图像、视频都塞进同一个一维位置轴上,导致一张大图像会「挤占」大量位置 ID,留给后续文本的空间就少了.M-RoPE 的三维分解相当于为每种模态开辟了独立的位置坐标系:文本只用时间轴(即传统的一维序列),图像用「恒定时间+二维空间」,视频用「递增时间+二维空间」.这不仅让位置编码的语义更清晰,还带来一个意外的好处——外推能力.由于图像的「时间」ID 恒定为 0(或某个小值),不会消耗大量位置编号,模型在推理时可以处理比训练时更长的序列(实验证明可外推到 80K token).</p>
</blockquote>
<h4 id="2-1-3-tydtxhsplj-unified-image-and-video-understanding">2.1.3 统一的图像和视频理解 (Unified Image and Video Understanding)</h4>
<p>Qwen2-VL 采用混合训练方案,同时纳入图像和视频数据,确保在图像理解和视频理解方面的熟练度.为尽可能完整地保留视频信息,我们以每秒两帧的速率采样每个视频.此外,我们整合了深度为二的 3D 卷积来处理视频输入,使模型能够处理 3D tubes 而非 2D patches,从而在不增加序列长度的情况下处理更多视频帧.为保持一致性,每张图像被视为两个相同的帧.为平衡长视频处理的计算需求与整体训练效率,我们动态调整每个视频帧的分辨率,将每视频的总 token 数限制为 16384.这种训练方法在模型理解长视频的能力与训练效率之间取得了平衡.</p>
<blockquote>
<p>统一处理图像和视频是一个优雅的设计决策.传统方法是「图像Encoder  + 视频Encoder 」双轨制,导致两个模态的特征空间不对齐.Qwen2-VL 的洞察是:一张图像可以视为「只有一帧、FPS 为 0」的视频,两者可以用完全相同的 pipeline 处理.3D 卷积(深度为 2)将相邻两帧组合成一个 3D tube,既保留了时间信息,又没有显著增加 token 数.对于纯图像,只需复制一帧即可——这相当于为图像添加了「空的时间维度」.这种统一范式的工程优势在于:代码实现更简洁,预训练数据可以更灵活地混合图像和视频,模型学到的特征表示天然跨模态对齐.</p>
</blockquote>
<h3 id="2-2-xl-training">2.2 训练 (Training)</h3>
<p>遵循 Qwen-VL,我们采用三阶段训练方法.第一阶段,我们专注于单独训练 Vision Transformer (ViT) 组件,利用大量图像-文本对语料来增强 LLM 内的语义理解.第二阶段,我们解冻所有参数,用更广泛的数据进行更全面的学习.最后阶段,我们锁定 ViT 参数,仅使用指令数据集对 LLM 进行微调.</p>
<p>模型在包含图像-文本对、OCR 数据、交错图文文章、视觉问答数据集、视频对话和图像知识数据集的多样化数据上预训练.我们的数据来源主要包括清洗后的网页、开源数据集和合成数据.我们的数据知识截止日期为 2023 年 6 月.</p>
<p><strong>第一阶段预训练</strong>: Qwen2-VL 在约 6000 亿 token 的语料上预训练.LLM 组件使用 Qwen2 的参数初始化,视觉Encoder 使用源自 DFN 的 ViT 初始化.然而,原始 DFN ViT 中的固定位置嵌入被 RoPE-2D 替代.这一阶段主要专注于学习图像-文本关系、通过 OCR 识别图像中的文本内容,以及图像分类任务.</p>
<p><strong>第二阶段预训练</strong>: 涉及额外的 8000 亿 token 图像相关数据.此阶段引入更多混合图文内容,促进对视觉和文本信息之间交互的更细致理解.视觉问答数据集的加入提升了模型回答图像相关查询的能力.纯文本数据继续在维持和提升模型语言能力方面发挥关键作用.</p>
<p>整个预训练阶段,Qwen2-VL 累计处理了 1.4 万亿 token.这些 token 不仅包括文本 token,还包括图像 token.然而,在训练过程中,我们仅对文本 token 提供监督.</p>
<p><strong>指令微调阶段</strong>: 我们采用 ChatML 格式构建指令遵循数据.该数据集不仅包括纯文本对话数据,还包括多模态对话数据.多模态组件包括图像问答、文档解析、多图像比较、视频理解、视频流对话和基于智能体的交互.</p>
<blockquote>
<p>训练数据的 1.4T token 构成值得分析.第一阶段 600B(仅 ViT)使用「图像-文本对+OCR+知识」数据,目标是让视觉Encoder 学会提取与语言对齐的特征.第二阶段 800B(全部参数)加入「交错图文+VQA+视频+纯文本」,目标是建立视觉和语言的深度关联.值得注意的是,纯文本数据在两个阶段都持续存在——这是维持模型语言能力不被多模态数据「稀释」的关键设计.数据知识截止于 2023 年 6 月,这意味着模型对 2023 年下半年之后的事件和知识没有直接了解(除非通过指令微调的更新数据).</p>
</blockquote>
<h4 id="2-2-1-sjgs-data-format">2.2.1 数据格式 (Data Format)</h4>
<p>与 Qwen-VL 一致,Qwen2-VL 也采用特殊 token 来区分视觉和文本输入.<code>&lt;|vision_start|&gt;</code> 和 <code>&lt;|vision_end|&gt;</code> token 插入图像特征序列的开头和结尾以界定图像内容.</p>
<p><strong>对话数据格式示例</strong>:</p>
<pre><code>&lt;|im_start|&gt;user
&lt;|vision_start|&gt;Picture1.jpg&lt;|vision_end|&gt;
&lt;|vision_start|&gt;Picture2.jpg&lt;|vision_end|&gt;
What do the two pictures have in common?&lt;|im_end|&gt;

&lt;|im_start|&gt;assistant
Both pictures are of SpongeBob SquarePants. &lt;|im_end|&gt;
</code></pre>
<p><strong>视觉定位 (Visual Grounding)</strong>:</p>
<p>为赋予模型视觉定位能力,边界框坐标在 [0, 1000) 范围内归一化,表示为 &quot;<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>X</mi><mrow><mi>t</mi><mi>o</mi><mi>p</mi><mi>l</mi><mi>e</mi><mi>f</mi><mi>t</mi></mrow></msub><mo separator="true">,</mo><msub><mi>Y</mi><mrow><mi>t</mi><mi>o</mi><mi>p</mi><mi>l</mi><mi>e</mi><mi>f</mi><mi>t</mi></mrow></msub><mo stretchy="false">)</mo><mo separator="true">,</mo><mo stretchy="false">(</mo><msub><mi>X</mi><mrow><mi>b</mi><mi>o</mi><mi>t</mi><mi>t</mi><mi>o</mi><mi>m</mi><mi>r</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi>t</mi></mrow></msub><mo separator="true">,</mo><msub><mi>Y</mi><mrow><mi>b</mi><mi>o</mi><mi>t</mi><mi>t</mi><mi>o</mi><mi>m</mi><mi>r</mi><mi>i</mi><mi>g</mi><mi>h</mi><mi>t</mi></mrow></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(X_{top left}, Y_{top left}), (X_{bottom right}, Y_{bottom right})</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">pl</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">pl</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0785em;">X</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0785em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">tt</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.2222em;">Y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.2222em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">b</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">tt</span><span class="mord mathnormal mtight">o</span><span class="mord mathnormal mtight">m</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">g</span><span class="mord mathnormal mtight">h</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>&quot;.<code>&lt;|box_start|&gt;</code> 和 <code>&lt;|box_end|&gt;</code> token 用于界定边界框文本.为准确链接边界框与其文本描述,我们引入 <code>&lt;|object_ref_start|&gt;</code> 和 <code>&lt;|object_ref_end|&gt;</code> token 来指示边界框引用的内容.</p>
<p><strong>视觉智能体 (Visual Agent)</strong>:</p>
<p>为将 Qwen2-VL 开发为通用 VL-Agent,我们将各种智能体任务(如 UI 操作、机器人控制、游戏和导航)视为顺序决策问题,使 Qwen2-VL 能够通过多步动作执行任务.对于每个任务,我们首先定义一组允许的动作和关键词模式(underline)用于功能调用.Qwen2-VL 然后分析观察结果、执行推理和规划、执行选定的动作,并与环境交互以获取新的观察结果.这个循环迭代重复直到任务成功完成.</p>
<h3 id="2-3-dmtmxjcss-multimodal-model-infrastructure">2.3 多模态模型基础设施 (Multimodal Model Infrastructure)</h3>
<p>Qwen2-VL 模型在阿里云 PAI-Lingjun 智算服务上训练,具备可扩展计算、自动恢复和掉队检测能力.</p>
<p><strong>存储</strong>: 使用阿里云 CPFS 构建存储系统.文本数据存储在 CPFS 上并使用 mmap 高效访问.视觉数据使用 OSS 持久化存储,训练时通过 OSS 的 python-client 并发访问.视频数据解码是主要瓶颈,我们采用缓存解码技术.Checkpoint 保存每个 GPU 的优化器和模型状态到 CPFS.</p>
<p><strong>并行策略</strong>: 使用 3D 并行(数据并行 DP + 张量并行 TP + 流水线并行 PP).利用 DeepSpeed 的 zero-1 冗余优化器进行显存节省.序列并行 SP 配合选择性激活Checkpoint减少显存使用.启用 TP 训练时,视觉Encoder 和 LLM 一起分片,但视觉合并器(Merger)不分片(参数较少).发现 TP 训练会因卷积算子的非确定性行为导致共享权重不同,通过离线 reduce 共享权重解决.72B 训练使用 1F1B PP,将视觉Encoder 、视觉适配器和若干 LLM Decoder  层组合为一个 stage,剩余Decoder  层均匀分配.注意视觉和文本序列长度对每个数据点是动态的,在启动 1F1B 前广播动态序列长度.</p>
<p><strong>软件</strong>: PyTorch 2.1.2 + CUDA 11.8.使用 flash-attention 进行视觉Encoder 和 LLM 的高效训练.利用融合算子(LayerNorm、RMSNorm、Adam).在矩阵乘法过程中重叠通信和计算.</p>
<blockquote>
<p>基础设施部分的细节非常丰富,体现了大规模多模态训练的工程复杂性.几个值得注意的点: (1) 视频解码瓶颈通过「缓存解码」解决——长视频的解码开销巨大,预缓存解码结果避免了训练时的重复解码; (2) 卷积算子的非确定性导致 TP 下共享权重不一致,这是一个容易被忽视的 corner case,离线 reduce 的方案巧妙避开了额外的 all-reduce 通信; (3) 动态序列长度下 1F1B PP 的实现需要在启动前广播长度信息,这对 PP 调度器提出了额外要求.</p>
</blockquote>
<hr>
<h2 id="3-sy-experiments">3. 实验 (Experiments)</h2>
<h3 id="3-1-y-sota-mxbj">3.1 与 SOTA 模型比较</h3>
<p><strong>表 2: Qwen2-VL 模型与 SOTA 性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">前代 SOTA</th>
<th align="center">Claude-3.5 Sonnet</th>
<th align="center">GPT-4o</th>
<th align="center">Qwen2-VL-72B</th>
<th align="center">Qwen2-VL-7B</th>
<th align="center">Qwen2-VL-2B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MMMU_val</td>
<td align="center">66.1</td>
<td align="center">68.3</td>
<td align="center"><strong>69.1</strong></td>
<td align="center">64.5</td>
<td align="center">54.1</td>
<td align="center">41.1</td>
</tr>
<tr>
<td align="left">DocVQA_test</td>
<td align="center">94.1</td>
<td align="center">95.2</td>
<td align="center">92.8</td>
<td align="center"><strong>96.5</strong></td>
<td align="center">94.5</td>
<td align="center">90.1</td>
</tr>
<tr>
<td align="left">InfoVQA_test</td>
<td align="center">82.0</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center"><strong>84.5</strong></td>
<td align="center">76.5</td>
<td align="center">65.5</td>
</tr>
<tr>
<td align="left">AI2D</td>
<td align="center">87.6</td>
<td align="center">80.2(94.7)</td>
<td align="center">84.6(94.2)</td>
<td align="center"><strong>88.1</strong></td>
<td align="center">83.0</td>
<td align="center">74.7</td>
</tr>
<tr>
<td align="left">ChartQA_test</td>
<td align="center">88.4</td>
<td align="center"><strong>90.8</strong></td>
<td align="center">85.7</td>
<td align="center">88.3</td>
<td align="center">83.0</td>
<td align="center">73.5</td>
</tr>
<tr>
<td align="left">TextVQA_val</td>
<td align="center">84.4</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center"><strong>85.5</strong></td>
<td align="center">84.3</td>
<td align="center">79.7</td>
</tr>
<tr>
<td align="left">OCRBench</td>
<td align="center">852</td>
<td align="center">788</td>
<td align="center">736</td>
<td align="center"><strong>877</strong></td>
<td align="center">866</td>
<td align="center">809</td>
</tr>
<tr>
<td align="left">MTVQA</td>
<td align="center">23.2</td>
<td align="center">25.7</td>
<td align="center">27.8</td>
<td align="center"><strong>30.9</strong></td>
<td align="center">25.6</td>
<td align="center">18.1</td>
</tr>
<tr>
<td align="left">VCR_en easy</td>
<td align="center">84.7</td>
<td align="center">63.9</td>
<td align="center">91.6</td>
<td align="center"><strong>91.9</strong></td>
<td align="center">89.7</td>
<td align="center">81.5</td>
</tr>
<tr>
<td align="left">VCR_zh easy</td>
<td align="center">22.1</td>
<td align="center">1.0</td>
<td align="center">14.9</td>
<td align="center"><strong>65.4</strong></td>
<td align="center">59.9</td>
<td align="center">46.2</td>
</tr>
<tr>
<td align="left">RealWorldQA</td>
<td align="center">72.2</td>
<td align="center">60.1</td>
<td align="center">75.4</td>
<td align="center"><strong>77.8</strong></td>
<td align="center">70.1</td>
<td align="center">62.9</td>
</tr>
<tr>
<td align="left">MME_sum</td>
<td align="center">2414.7</td>
<td align="center">1920.0</td>
<td align="center">2328.7</td>
<td align="center"><strong>2482.7</strong></td>
<td align="center">2326.8</td>
<td align="center">1872.0</td>
</tr>
<tr>
<td align="left">MMBench-EN_test</td>
<td align="center"><strong>86.5</strong></td>
<td align="center">79.7</td>
<td align="center">83.4</td>
<td align="center"><strong>86.5</strong></td>
<td align="center">83.0</td>
<td align="center">74.9</td>
</tr>
<tr>
<td align="left">MMBench-CN_test</td>
<td align="center">86.3</td>
<td align="center">80.7</td>
<td align="center">82.1</td>
<td align="center"><strong>86.6</strong></td>
<td align="center">80.5</td>
<td align="center">73.5</td>
</tr>
<tr>
<td align="left">MMBench-V1.1_test</td>
<td align="center">85.5</td>
<td align="center">78.5</td>
<td align="center">82.2</td>
<td align="center"><strong>85.9</strong></td>
<td align="center">80.7</td>
<td align="center">72.2</td>
</tr>
<tr>
<td align="left">MMT-Bench_test</td>
<td align="center">63.4</td>
<td align="center">-</td>
<td align="center">65.5</td>
<td align="center"><strong>71.7</strong></td>
<td align="center">63.7</td>
<td align="center">54.5</td>
</tr>
<tr>
<td align="left">MMStar</td>
<td align="center">67.1</td>
<td align="center">62.2</td>
<td align="center">63.9</td>
<td align="center"><strong>68.3</strong></td>
<td align="center">60.7</td>
<td align="center">48.0</td>
</tr>
<tr>
<td align="left">MMVet</td>
<td align="center">67.5</td>
<td align="center">66.0</td>
<td align="center">69.1</td>
<td align="center"><strong>74.0</strong></td>
<td align="center">62.0</td>
<td align="center">49.5</td>
</tr>
<tr>
<td align="left">HallBench_avg</td>
<td align="center">55.2</td>
<td align="center">49.9</td>
<td align="center">55.0</td>
<td align="center"><strong>58.1</strong></td>
<td align="center">50.6</td>
<td align="center">41.7</td>
</tr>
<tr>
<td align="left">MathVista_testmini</td>
<td align="center">69.0</td>
<td align="center">67.7</td>
<td align="center">63.8</td>
<td align="center"><strong>70.5</strong></td>
<td align="center">58.2</td>
<td align="center">43.0</td>
</tr>
<tr>
<td align="left">MathVision</td>
<td align="center">30.3</td>
<td align="center">-</td>
<td align="center"><strong>30.4</strong></td>
<td align="center">25.9</td>
<td align="center">16.3</td>
<td align="center">12.4</td>
</tr>
<tr>
<td align="left">MMMU-Pro</td>
<td align="center">46.9</td>
<td align="center">51.5</td>
<td align="center"><strong>51.9</strong></td>
<td align="center">46.2</td>
<td align="center">43.5</td>
<td align="center">37.6</td>
</tr>
</tbody></table>
<p>我们通过多种视觉基准、视频任务和基于智能体的评估来评估模型的视觉能力.Qwen2-VL 在相同规模下展现出极具竞争力的性能,创造了新的 SOTA 结果.总体而言,我们的 72B 模型在大多数评估指标上持续提供顶级性能,频繁超越 GPT-4o 和 Claude 3.5-Sonnet 等闭源模型.值得注意的是,它在文档理解任务上表现出显著优势.然而,在 MMMU 基准上,我们的模型仍在一定程度上落后于 GPT-4o,表明 Qwen2-VL-72B 在处理更复杂和具有挑战性的问题时仍有改进空间.</p>
<blockquote>
<p>从表 2 可以看出,Qwen2-VL-72B 在文档相关任务(DocVQA 96.5、InfoVQA 84.5、TextVQA 85.5、OCRBench 877)上全面领先,这是其动态分辨率和专门 OCR 数据训练的直接结果.在多语言 OCR(MTVQA 30.9)和中文视觉推理(VCR_zh 65.4)上的优势尤为突出——VCR_zh 上从 GPT-4o 的 14.9 跃升到 65.4,说明模型对中文场景的适应能力远超闭源竞品.但在 MMMU(64.5 vs GPT-4o 69.1)和 MathVision(25.9 vs GPT-4o 30.4)上仍有差距,这反映了大学级科学推理和复杂数学视觉推理仍是通用 LVLMs 的短板.</p>
</blockquote>
<p><strong>表 3: Qwen2-VL 与 GPT-4o 在内部多语言 OCR 基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">语言</th>
<th align="center">韩语</th>
<th align="center">日语</th>
<th align="center">法语</th>
<th align="center">德语</th>
<th align="center">意大利语</th>
<th align="center">俄语</th>
<th align="center">越南语</th>
<th align="center">阿拉伯语</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4o</td>
<td align="center">87.8</td>
<td align="center">88.3</td>
<td align="center">89.7</td>
<td align="center">88.3</td>
<td align="center">74.1</td>
<td align="center">96.8</td>
<td align="center">72.0</td>
<td align="center"><strong>75.9</strong></td>
</tr>
<tr>
<td align="left">Qwen2-VL-72B</td>
<td align="center"><strong>94.5</strong></td>
<td align="center"><strong>93.4</strong></td>
<td align="center"><strong>94.1</strong></td>
<td align="center"><strong>91.5</strong></td>
<td align="center"><strong>89.8</strong></td>
<td align="center"><strong>97.2</strong></td>
<td align="center"><strong>73.0</strong></td>
<td align="center">70.7</td>
</tr>
</tbody></table>
<p><strong>表 4: Qwen2-VL 与其他模型在视频基准上的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">基准</th>
<th align="center">前代 SOTA</th>
<th align="center">Gemini 1.5-Pro</th>
<th align="center">GPT-4o</th>
<th align="center">Qwen2-VL-72B</th>
<th align="center">Qwen2-VL-7B</th>
<th align="center">Qwen2-VL-2B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">MVBench</td>
<td align="center">69.6</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center"><strong>73.6</strong></td>
<td align="center">67.0</td>
<td align="center">63.2</td>
</tr>
<tr>
<td align="left">PerceptionTest_test</td>
<td align="center">66.9</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center"><strong>68.0</strong></td>
<td align="center">62.3</td>
<td align="center">53.9</td>
</tr>
<tr>
<td align="left">EgoSchema_test</td>
<td align="center">62.0</td>
<td align="center">63.2</td>
<td align="center">72.2</td>
<td align="center"><strong>77.9</strong></td>
<td align="center">66.7</td>
<td align="center">54.9</td>
</tr>
<tr>
<td align="left">Video-MME (wo/w subs)</td>
<td align="center">66.3/69.6</td>
<td align="center"><strong>75.0</strong>/<strong>81.3</strong></td>
<td align="center">71.9/77.2</td>
<td align="center">71.2/77.8</td>
<td align="center">63.3/69.0</td>
<td align="center">55.6/60.4</td>
</tr>
</tbody></table>
<p><strong>表 5: Qwen2-VL-72B 在各类智能体基准上与 GPT-4o 的性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">类别</th>
<th align="left">基准</th>
<th align="center">指标</th>
<th align="center">前代 SOTA</th>
<th align="center">GPT-4o</th>
<th align="center">Qwen2-VL-72B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">通用</td>
<td align="left">FnCall</td>
<td align="center">TM</td>
<td align="center">-</td>
<td align="center">90.2</td>
<td align="center"><strong>93.1</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">EM</td>
<td align="center">-</td>
<td align="center">50.0</td>
<td align="center"><strong>53.2</strong></td>
</tr>
<tr>
<td align="left">UI 操作</td>
<td align="left">AITZ</td>
<td align="center">TM</td>
<td align="center">83.0</td>
<td align="center">70.0</td>
<td align="center"><strong>89.6</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">EM</td>
<td align="center">47.7</td>
<td align="center">35.3</td>
<td align="center"><strong>72.1</strong></td>
</tr>
<tr>
<td align="left">卡牌游戏</td>
<td align="left">Number Line</td>
<td align="center">SR</td>
<td align="center">89.4</td>
<td align="center">91.5</td>
<td align="center"><strong>100.0</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">BlackJack</td>
<td align="center">SR</td>
<td align="center">40.2</td>
<td align="center">34.5</td>
<td align="center"><strong>42.6</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">EZPoint</td>
<td align="center">SR</td>
<td align="center">50.0</td>
<td align="center">85.5</td>
<td align="center"><strong>100.0</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Point24</td>
<td align="center">SR</td>
<td align="center">2.6</td>
<td align="center">3.0</td>
<td align="center"><strong>4.5</strong></td>
</tr>
<tr>
<td align="left">机器人控制</td>
<td align="left">ALFRED</td>
<td align="center">SR</td>
<td align="center">67.7</td>
<td align="center">-</td>
<td align="center"><strong>67.8</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="center">GC</td>
<td align="center">75.3</td>
<td align="center">-</td>
<td align="center"><strong>75.8</strong></td>
</tr>
<tr>
<td align="left">导航</td>
<td align="left">R2R</td>
<td align="center">SR</td>
<td align="center"><strong>79.0</strong></td>
<td align="center">43.7</td>
<td align="center">51.7</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">REVERIE</td>
<td align="center">SR</td>
<td align="center"><strong>61.0</strong></td>
<td align="center">31.6</td>
<td align="center">31.0</td>
</tr>
</tbody></table>
<h3 id="3-2-dljg">3.2 定量结果</h3>
<h4 id="3-2-1-tysjwd">3.2.1 通用视觉问答</h4>
<p>为严格评估模型在通用视觉问答任务中的能力,我们在多种 SOTA 基准上进行了广泛评估.Qwen2-VL 系列在这些基准上表现出色,72B 模型持续达到或超越 SOTA 结果,而 7B 和 2B 变体也展现出稳健的能力.</p>
<p>在评估真实世界空间理解的 RealWorldQA 上,Qwen2-VL-72B 取得 77.8 分,超越前代 SOTA(72.2)和 GPT-4o(75.4).在评估真正多模态能力的 MMStar 上,取得 68.3 分,超越前代最佳 67.1.在评估 16 项复杂多模态任务核心能力整合的 MMVet 上,取得 74.0 分,显著超越 GPT-4V(67.5).在评估 32 项核心元任务和 162 项子任务高级推理的 MMT-Bench 上,取得 71.7 分,大幅超越前代最佳 63.4.</p>
<h4 id="3-2-2-wdytbyd">3.2.2 文档与图表阅读</h4>
<p>我们在 DocVQA、ChartQA、InfoVQA、TextVQA、AI2D 数据集上测试了模型的 OCR 和文档/图表理解能力.实验结果表明,我们的模型在多个指标上达到 SOTA 水平,包括对 DocVQA、InfoVQA、TextVQA 和 OCRBench,证明模型对多领域图像中的文本内容具有良好的理解能力.</p>
<h4 id="3-2-3-dyywbsbylj">3.2.3 多语言文本识别与理解</h4>
<p>我们的模型在所有现有通用 LVLM 中 surpasses 多语言 OCR.模型不仅在公开的 MTVQA 数据集上超越现有 LVLM(包括 GPT-4o、Claude 3.5 Sonnet 等专有模型),在内部基准上也超越了 GPT-4o 的所有外语(阿拉伯语除外).</p>
<h4 id="3-2-4-sxtl">3.2.4 数学推理</h4>
<p>我们在 MathVista 和 MathVision 数据集上评估数学推理能力.Qwen2-VL 系列在 MathVista 上展现出卓越性能,取得 70.5 分,超越其他 LVLM.此外,它以 25.9 的分数在 MathVision 上创造了新的开源基准.</p>
<h4 id="3-2-5-zdbdlj-referring-expression-comprehension">3.2.5 指代表达理解 (Referring Expression Comprehension)</h4>
<p>关于视觉定位任务,我们在 RefCOCO、RefCOCO+ 和 RefCOCOg 数据集上评估 Qwen2-VL.</p>
<p><strong>表 6: 指代表达理解任务性能对比</strong></p>
<table>
<thead>
<tr>
<th align="left">类型</th>
<th align="left">模型</th>
<th align="center">RefCOCO val</th>
<th align="center">RefCOCO testA</th>
<th align="center">RefCOCO testB</th>
<th align="center">RefCOCO+ val</th>
<th align="center">RefCOCO+ testA</th>
<th align="center">RefCOCO+ testB</th>
<th align="center">RefCOCOg val</th>
<th align="center">RefCOCOg test</th>
</tr>
</thead>
<tbody><tr>
<td align="left">专用</td>
<td align="left">Grounding DINO</td>
<td align="center">89.6</td>
<td align="center">92.5</td>
<td align="center">88.3</td>
<td align="center">85.2</td>
<td align="center">89.6</td>
<td align="center">80.3</td>
<td align="center">90.4</td>
<td align="center">90.1</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Shikra</td>
<td align="center">87.0</td>
<td align="center">90.6</td>
<td align="center">80.2</td>
<td align="center">81.8</td>
<td align="center">87.2</td>
<td align="center">74.4</td>
<td align="center">84.3</td>
<td align="center">85.1</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Ferret</td>
<td align="center">89.5</td>
<td align="center">92.4</td>
<td align="center">84.4</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">88.1</td>
<td align="center">89.2</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Qwen-VL</td>
<td align="center">85.5</td>
<td align="center">89.3</td>
<td align="center">80.4</td>
<td align="center">79.5</td>
<td align="center">84.1</td>
<td align="center">72.2</td>
<td align="center">82.7</td>
<td align="center">83.5</td>
</tr>
<tr>
<td align="left">通用</td>
<td align="left">GPT-4V</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">LLaVA-1.5</td>
<td align="center">73.5</td>
<td align="center">80.9</td>
<td align="center">69.1</td>
<td align="center">65.7</td>
<td align="center">74.3</td>
<td align="center">59.0</td>
<td align="center">64.7</td>
<td align="center">65.8</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">MiniGPT-v2</td>
<td align="center">78.2</td>
<td align="center">83.9</td>
<td align="center">71.4</td>
<td align="center">72.8</td>
<td align="center">79.6</td>
<td align="center">65.0</td>
<td align="center">70.3</td>
<td align="center">71.6</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">InternVL-Chat</td>
<td align="center">92.1</td>
<td align="center">93.4</td>
<td align="center">87.0</td>
<td align="center">88.5</td>
<td align="center">91.5</td>
<td align="center">81.4</td>
<td align="center">89.9</td>
<td align="center">89.8</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Qwen2-VL-72B</td>
<td align="center"><strong>92.7</strong></td>
<td align="center"><strong>94.3</strong></td>
<td align="center"><strong>89.2</strong></td>
<td align="center"><strong>89.4</strong></td>
<td align="center"><strong>92.5</strong></td>
<td align="center"><strong>83.4</strong></td>
<td align="center"><strong>90.0</strong></td>
<td align="center"><strong>90.3</strong></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Qwen2-VL-7B</td>
<td align="center">90.0</td>
<td align="center">92.5</td>
<td align="center">85.4</td>
<td align="center">84.2</td>
<td align="center">89.1</td>
<td align="center">76.9</td>
<td align="center">87.2</td>
<td align="center">87.2</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">Qwen2-VL-2B</td>
<td align="center">89.1</td>
<td align="center">91.7</td>
<td align="center">84.0</td>
<td align="center">82.4</td>
<td align="center">88.0</td>
<td align="center">74.1</td>
<td align="center">85.2</td>
<td align="center">85.7</td>
</tr>
</tbody></table>
<p>Qwen2-VL 在通用模型中达到顶级结果.得益于更合理的结构设计,Qwen2-VL 能够感知高分辨率图像中的细节,相比 Qwen-VL 有显著提升.</p>
<h3 id="3-3-xrsy-ablation-study">3.3 消融实验 (Ablation Study)</h3>
<h4 id="3-3-1-dtfbs-dynamic-resolution">3.3.1 动态分辨率 (Dynamic Resolution)</h4>
<p><strong>表 7: Qwen2-VL-7B 在固定/动态图像 token 下的性能</strong></p>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="center">平均图像 token 数</th>
<th align="center">InfoVQA_val</th>
<th align="center">RealWorldQA</th>
<th align="center">OCRBench</th>
<th align="center">MMMU</th>
</tr>
</thead>
<tbody><tr>
<td align="left">固定 64 token</td>
<td align="center">64</td>
<td align="center">28.85</td>
<td align="center">56.47</td>
<td align="center">572</td>
<td align="center">53.33</td>
</tr>
<tr>
<td align="left">固定 576 token</td>
<td align="center">576</td>
<td align="center">65.72</td>
<td align="center">65.88</td>
<td align="center">828</td>
<td align="center">52.78</td>
</tr>
<tr>
<td align="left">固定 1600 token</td>
<td align="center">1600</td>
<td align="center">74.99</td>
<td align="center">69.54</td>
<td align="center">824</td>
<td align="center">52.89</td>
</tr>
<tr>
<td align="left">固定 3136 token</td>
<td align="center">3136</td>
<td align="center">77.27</td>
<td align="center">70.59</td>
<td align="center">786</td>
<td align="center">53.44</td>
</tr>
<tr>
<td align="left"><strong>动态 token</strong></td>
<td align="center"><strong>1924</strong></td>
<td align="center"><strong>75.89</strong></td>
<td align="center"><strong>70.07</strong></td>
<td align="center"><strong>866</strong></td>
<td align="center"><strong>53.44</strong></td>
</tr>
</tbody></table>
<p>如表 7 所示,我们比较了动态分辨率与固定分辨率的性能.对于固定分辨率,我们调整图像大小以确保输入模型的图像 token 数量恒定.对于动态分辨率,我们仅设置 min_pixels=<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>100</mn><mo>×</mo><mn>28</mn><mo>×</mo><mn>28</mn></mrow><annotation encoding="application/x-tex">100\\times28\\times28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">100</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">28</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">28</span></span></span></span> 和 max_pixels=<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>16384</mn><mo>×</mo><mn>28</mn><mo>×</mo><mn>28</mn></mrow><annotation encoding="application/x-tex">16384\\times28\\times28</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">16384</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">28</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">28</span></span></span></span>,允许图像 token 数量主要取决于图像的原生分辨率.</p>
<p>调整图像大小仅导致性能的小幅波动,证明模型对不同图像尺寸的稳健性.此外,动态分辨率方法更高效.没有单一固定分辨率在所有基准上达到最优性能.相比之下,动态分辨率方法持续达到顶级性能,同时平均消耗更少的 token.</p>
<p><img src="/llm-guide/14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy/images/minpixels_resolution.png" alt="不同 min_pixels 下 Qwen2-VL-7B 的性能"></p>
<blockquote>
<p><strong>图 4</strong>: 不同 min_pixels 下 Qwen2-VL-7B 的性能.小图像被上采样以超过指定的 min_pixels 阈值,然后输入模型.在合理范围内增加图像大小在 InfoVQA、HallusionBench 和 OCRBench 等感知任务上显示出增强的性能.</p>
</blockquote>
<p>此外,我们观察到仅增加图像大小并不总是带来性能提升.为不同图像选择合适的分辨率更为重要.如图 4 所示,我们将小图像上采样以超过指定的 min_pixels 阈值.上采样图像的评估在 InfoVQA、HallusionBench 和 OCRBench 等感知任务上显示出增强的性能.我们将这些增益归因于增加的计算负载.然而,对于 OCRBench,过高的 min_pixels 值导致严重的性能下降.这可能是因为 OCRBench 包含大量极小的图像,过度放大使这些图像偏离训练数据分布,变成 out-of-distribution 样本.相比之下,增加 min_pixels 对 MMMU 基准的影响可以忽略.我们假设 MMMU 中的性能瓶颈更多与模型的推理能力相关,而非图像分辨率.</p>
<blockquote>
<p>这个消融实验揭示了一个重要洞察:动态分辨率的价值不仅在于「保留原生信息」,更在于「为每张图像选择合适的工作量」.固定 3136 token 在 InfoVQA 上达到 77.27,但 OCRBench 只有 786;而动态分辨率以平均 1924 token 同时在 InfoVQA(75.89)和 OCRBench(866)上都达到接近最优——这是用更少的计算资源获得更好的综合性能.图 4 中 OCRBench 随 min_pixels 增加而下降的现象则提醒我们:数据增强的边界——过度放大小图像会改变其分布特性,反而损害识别性能.</p>
</blockquote>
<h4 id="3-3-2-m-rope">3.3.2 M-RoPE</h4>
<p><strong>表 8: M-RoPE 消融实验</strong></p>
<table>
<thead>
<tr>
<th align="left"></th>
<th align="center">MathVista</th>
<th align="center">MMB</th>
<th align="center">MMStar</th>
<th align="center">RWQ</th>
<th align="center">DocVQA</th>
<th align="center">ChartQA</th>
<th align="center">InfoVQA</th>
<th align="center">TextVQA</th>
<th align="center">PerceptionTest</th>
<th align="center">NextQA</th>
<th align="center">STAR</th>
</tr>
</thead>
<tbody><tr>
<td align="left">1D-RoPE</td>
<td align="center">39.2</td>
<td align="center">58.6</td>
<td align="center"><strong>36.7</strong></td>
<td align="center"><strong>54.5</strong></td>
<td align="center">82.5</td>
<td align="center">68.0</td>
<td align="center"><strong>50.8</strong></td>
<td align="center">71.3</td>
<td align="center">46.6</td>
<td align="center">43.9</td>
<td align="center">55.5</td>
</tr>
<tr>
<td align="left">M-RoPE</td>
<td align="center"><strong>43.4</strong></td>
<td align="center"><strong>60.6</strong></td>
<td align="center"><strong>36.7</strong></td>
<td align="center">53.7</td>
<td align="center"><strong>82.8</strong></td>
<td align="center"><strong>68.4</strong></td>
<td align="center">50.3</td>
<td align="center"><strong>71.8</strong></td>
<td align="center"><strong>47.4</strong></td>
<td align="center"><strong>46.0</strong></td>
<td align="center"><strong>57.9</strong></td>
</tr>
</tbody></table>
<p>我们验证了 M-RoPE 在各种下游任务上的能力.使用 Qwen2-1.5B 和 ViT-L 作为主干网络,报告预训练模型的结果.如表 8 所示,与 1D-RoPE 相比,M-RoPE 在下游任务上取得了更好的性能,特别是在视频基准上.</p>
<p>此外,我们在 Video-MME 中等长度视频上评估了 M-RoPE 的长度外推能力.尽管训练时将每视频最大 token 限制为 16K,模型在最大推理长度为 80K token 时仍展现出卓越性能.</p>
<blockquote>
<p>M-RoPE 在视频基准上的提升尤为显著:PerceptionTest 从 46.6 到 47.4,NextQA 从 43.9 到 46.0,STAR 从 55.5 到 57.9.这说明将时间维度从「文本位置轴」中独立出来,对视频理解有直接的正面影响.而长度外推能力——从 16K 训练到 80K 推理——则是一个惊喜发现.传统 1D-RoPE 在长序列上的注意力稀释问题在 M-RoPE 中被缓解,因为图像 token 的「时间」维度恒定为 0,不占用位置编号预算,使模型可以将更多位置 ID 分配给后续内容.</p>
</blockquote>
<h4 id="3-3-3-mxsf-model-scaling">3.3.3 模型缩放 (Model Scaling)</h4>
<p><img src="/llm-guide/14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy/images/scale.jpg" alt="模型性能随能力和训练进度的缩放"></p>
<blockquote>
<p><strong>图 5</strong>: 模型性能随能力和训练进度的缩放.随着模型规模和训练数据量的增加,性能在一系列能力和基准上持续提升.</p>
</blockquote>
<p>我们在多个能力维度上评估了不同规模模型的性能.具体而言,我们将这些维度分为复杂大学级问题求解、数学能力、文档和表格理解、通用场景问答,以及视频理解.</p>
<p>如图 5(a)所示,随着模型规模的增加,性能持续提升,特别是数学能力,与模型参数数量呈正相关.另一方面,对于 OCR 相关任务,即使较小规模的模型也展现出相对强劲的性能.</p>
<p>如图 5(b)所示,我们可视化了 Qwen2-VL-7B 第二阶段预训练期间模型性能与训练 token 数量之间的关系.随着训练 token 数量的增加,模型性能提升;然而,视觉问答(VQA)任务的性能表现出一些波动.相比之下,对于 AI2D 和 InfoVQA 等涉及理解图像中文本和图形信息的任务,模型性能随着训练数据的增加而稳步提升.</p>
<blockquote>
<p>模型缩放实验揭示了两个规律: (1) 数学能力对参数规模高度敏感,72B 相比 7B 和 2B 有质的飞跃; (2) OCR 能力在小模型上就已经很强,说明文本识别更多是「感知」问题而非「推理」问题,不需要大量参数; (3) 训练数据量增加时,VQA 性能有波动而文档理解稳步提升——这可能是因为 VQA 数据中的问题类型更多样化,新增数据可能引入与已有能力冲突的分布,而文档数据的结构化特征使其更稳定地受益于数据扩展.</p>
</blockquote>
<hr>
<h2 id="4-jl-conclusion">4. 结论 (Conclusion)</h2>
<p>我们推出了 Qwen2-VL 系列——通用的大型视觉语言模型,包括三个总参数分别为 20 亿、80 亿和 720 亿的开放权重模型.Qwen2-VL 在一系列多模态场景中与 GPT-4o 和 Claude3.5-Sonnet 等顶级模型匹敌,超越了所有其他开放权重 LVLM 模型.</p>
<p>Qwen2-VL 系列引入了 naive dynamic resolution 和 multimodal rotary position embedding (M-RoPE),以有效融合跨模态信息,并能够理解超过 20 分钟的视频.凭借先进的推理和决策能力,Qwen2-VL 可与手机、机器人等设备集成.此外,Qwen2-VL 现支持理解图像中的多语言文本,包括大多数欧洲语言、日语、韩语、阿拉伯语、越南语等.</p>
<p>我们已公开 Qwen2-VL 模型权重,使研究人员和开发者能够在各种应用和研究项目中充分利用其潜力.我们致力于通过这些努力推进 AI 技术并增强其对社会的有益影响.</p>
<hr>
<h2 id="5-fl-mxnlydxsl">5. 附录: 模型能力与定性示例</h2>
<p>本附录展示 Qwen2-VL 的实用示例.</p>
<h3 id="5-1-tydhy-ocr">5.1 通用对话与 OCR</h3>
<p>Qwen2-VL 模型现在更擅长准确描述和识别图像中的复杂信息,以及提供详细的背景信息和回答相关问题.此外,Qwen2-VL 模型的文本处理能力显著提升,特别是在识别图像中的中英文文本方面.</p>
<p><strong>多物体识别</strong>: 模型能够识别图像中堆叠的彩色方块,并准确报告每个方块的颜色和数字(从顶部的蓝色 9 到底部的红色 0/橙色 1/黄色 2/浅绿色 3).</p>
<p><strong>文档解析(含密集公式)</strong>: 模型可以将包含复杂数学公式的学术论文截图转换为 Markdown 格式,保留 LaTeX 公式和章节结构.</p>
<p><strong>多语言文本识别</strong>: 模型能够同时识别图像中的中文、日语和韩语文本,并正确标注每种语言.</p>
<h3 id="5-2-sjdw-visual-grounding">5.2 视觉定位 (Visual Grounding)</h3>
<p><strong>定位任意目标</strong>: 当要求检测「红色汽车」的边界框时,模型准确输出 <code>(701,531),(869,675)</code>.</p>
<p><strong>视觉指向提示</strong>: 当用户指向网页截图中的某条新闻时,模型能够识别出这是关于 OpenAI ChatGPT 新功能的文章,并用法语标题进行描述.</p>
<h3 id="5-3-gnty-function-calling">5.3 功能调用 (Function Calling)</h3>
<p><strong>基础功能调用</strong>: 用户上传航班信息截图并询问「几点到达,到的时候目的地天气怎么样」.模型识别出目的地(北京)和到达时间(20:30),调用 24 小时天气查询功能,正确输入目的地,从查询结果中提取到达时间的天气,最终回答「预计 20:30 抵达北京首都机场,届时有中雨,温度约 27℃」.</p>
<p><strong>代码解释器</strong>: 用户上传流程图要求实现代码.模型识别流程图中的模块,编写对应的 Python 函数结构(无具体实现),并在代码解释器中成功执行验证.</p>
<h3 id="5-4-sjznt-visual-agent">5.4 视觉智能体 (Visual Agent)</h3>
<p><strong>UI 操作</strong>: Qwen2-VL 作为智能体理解 UI 操作查询,利用系统消息中预定义的动作(点击、输入、滑动、返回、主页、确认、完成),逐步完成任务.例如在手机上查找圣迭戈的好餐厅:从邮件设置页面返回主页 → 打开 Chrome → 清除错误搜索词 → 输入正确查询 → 执行搜索 → 查看结果 → 标记完成.</p>
<p><strong>卡牌游戏</strong>: Qwen2-VL 识别 21 点游戏中的牌面,利用 Hit 和 Stand 动作进行游戏.当手牌为 4+4+7+2=17 点,庄家为 10 点时,模型正确判断 Stand,最终庄家爆牌(25&gt;21),玩家获胜.</p>
<hr>
<h2 id="6-jsskjd-technical-thinking-nodes">6. 技术思考节点 (Technical Thinking Nodes)</h2>
<h3 id="6-1-sjdj-design-rationale">6.1 设计动机 (Design Rationale)</h3>
<blockquote>
<p><strong>思考 1: 为什么「naive」动态分辨率反而有效?</strong></p>
</blockquote>
<p>Qwen2-VL 的动态分辨率策略被刻意命名为「naive」(朴素),与复杂的金字塔编码或自适应采样形成对比.其核心洞察是:对于视觉语言模型而言,保持原生分辨率的收益大于计算开销的增加.人类视觉系统本身就是「动态分辨率」的——我们看一张图时,注意力会集中在关键区域,而非均匀处理每个像素.ViT 的自注意力机制天然具有类似特性:重要区域(如文本、小物体)会产生更强的注意力权重.因此,不需要人为设计复杂的区域选择策略,直接让模型在完整分辨率上学习即可.MLP 的 4× 压缩则作为计算与精度的平衡点,将视觉 token 数控制在合理范围.</p>
<blockquote>
<p><strong>思考 2: M-RoPE 的「位置编号预算」视角</strong></p>
</blockquote>
<p>如果将 LLM 的位置编码视为一种「预算」——模型只能为有限数量的 token 分配唯一位置 ID——那么 1D-RoPE 的问题就很明显了:一张大图像可能消耗数千个位置 ID,留给文本的预算所剩无几.M-RoPE 的三维分解相当于为每种模态设立了独立账户:图像的「时间账户」恒定为 0(或极小值),只在「空间账户」上记账;视频的时间账户随帧递增,但增长速度远低于 1D-RoPE 下每帧 token 的累积.这使得模型在处理完一张大图后,仍有充足的位置预算处理长文本或后续图像.实验证明的 80K token 外推能力,本质上就是位置预算管理的胜利.</p>
<h3 id="6-2-sjsy-data-experiments">6.2 数据实验 (Data Experiments)</h3>
<blockquote>
<p><strong>思考 3: 固定 vs 动态分辨率的效率-精度权衡</strong></p>
</blockquote>
<table>
<thead>
<tr>
<th align="left">策略</th>
<th align="center">平均 token</th>
<th align="center">InfoVQA</th>
<th align="center">RealWorldQA</th>
<th align="center">OCRBench</th>
<th align="center">MMMU</th>
<th align="left">综合评价</th>
</tr>
</thead>
<tbody><tr>
<td align="left">固定 64</td>
<td align="center">64</td>
<td align="center">28.85</td>
<td align="center">56.47</td>
<td align="center">572</td>
<td align="center">53.33</td>
<td align="left">信息严重不足</td>
</tr>
<tr>
<td align="left">固定 576</td>
<td align="center">576</td>
<td align="center">65.72</td>
<td align="center">65.88</td>
<td align="center">828</td>
<td align="center">52.78</td>
<td align="left">感知任务尚可,推理略降</td>
</tr>
<tr>
<td align="left">固定 1600</td>
<td align="center">1600</td>
<td align="center">74.99</td>
<td align="center">69.54</td>
<td align="center">824</td>
<td align="center">52.89</td>
<td align="left">感知最优,但 OCR 下降</td>
</tr>
<tr>
<td align="left">固定 3136</td>
<td align="center">3136</td>
<td align="center">77.27</td>
<td align="center">70.59</td>
<td align="center">786</td>
<td align="center">53.44</td>
<td align="left">过度放大损害 OCR</td>
</tr>
<tr>
<td align="left">动态</td>
<td align="center">1924</td>
<td align="center">75.89</td>
<td align="center">70.07</td>
<td align="center">866</td>
<td align="center">53.44</td>
<td align="left">各项指标均接近最优</td>
</tr>
</tbody></table>
<p>动态分辨率以平均 1924 token 的代价,在 InfoVQA(75.89,接近 3136 的 77.27)、RealWorldQA(70.07,接近 3136 的 70.59)、OCRBench(866,显著优于所有固定策略)和 MMMU(53.44,持平最优)上均达到或接近最优.这说明「为每张图像匹配合适的分辨率」比「为所有图像使用统一分辨率」更高效.图 4 中 OCRBench 随 min_pixels 增加而下降的现象进一步证明:分辨率不是越高越好,匹配训练分布才是关键.</p>
<h3 id="6-3-jgxj-architecture-details">6.3 架构细节 (Architecture Details)</h3>
<blockquote>
<p><strong>思考 4: 675M ViT 的「固定成本」设计哲学</strong></p>
</blockquote>
<p>Qwen2-VL 在所有三个尺寸(2B/7B/72B)中使用完全相同的 675M ViT.这种「固定成本」设计意味着:视觉感知的计算开销不随模型规模增长.对于 2B 模型,ViT 占总体参数的 25%;对于 72B 模型,ViT 仅占约 0.9%.这带来了两个工程优势: (1) 小模型可以在端侧运行而不必担心视觉Encoder 的计算负担; (2) 大模型的额外参数全部投入到语言推理能力上,视觉感知能力保持一致.代价是 72B 模型可能「浪费」了部分语言推理能力——如果给它一个更大的 ViT,是否能在视觉细节上取得突破? Qwen2.5-VL 的答案是肯定的:其 ViT 升级为 1280 hidden size × 32 层,虽然参数规模增加,但为更精细的文档解析和定位能力奠定了基础.</p>
<blockquote>
<p><strong>思考 5: 3D 卷积在视频处理中的工程意义</strong></p>
</blockquote>
<p>Qwen2-VL 使用深度为 2 的 3D 卷积将相邻两帧组合为一个 3D tube.从数学上看,这相当于在时间维度上做了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>1</mn><mo>×</mo><mn>1</mn><mo>×</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">1\\times1\\times2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">1</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">2</span></span></span></span> 的「预聚合」.这种设计的工程意义在于:它把「帧间关系」从 attention 层下沉到了 patchify 层.传统方法需要 attention 层学习「这两帧是相关的」,而 3D 卷积在特征提取阶段就强制建立了相邻帧的连接.这降低了 attention 层的负担,使模型可以用更少的 video token 表达相同的时间信息.以 2fps 采样为例,一分钟视频有 120 帧,经 3D 卷积后变为 60 个 tube,token 数减半——这是对长视频理解的直接支持.</p>
<h3 id="6-4-jxyfx-limitations-amp-risks">6.4 局限与风险 (Limitations &amp; Risks)</h3>
<blockquote>
<p><strong>思考 6: 视频理解的「伪长视频」问题</strong></p>
</blockquote>
<p>Qwen2-VL 声称能够理解超过 20 分钟的视频,但每视频 token 被限制为 16384.以 2fps 采样、每帧经 4× 压缩后约 256 token(假设 448×448)计算,16384 token 最多容纳 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>16384</mn><mi mathvariant="normal">/</mi><mn>256</mn><mo>=</mo><mn>64</mn></mrow><annotation encoding="application/x-tex">16384/256 = 64</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">16384/256</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">64</span></span></span></span> 帧,即 32 秒的视频内容.这意味着「20 分钟视频理解」实际上是通过关键帧选择或时间采样实现的,而非真正处理全部内容.虽然 M-RoPE 的绝对时间编码让模型能够定位事件在视频中的时间位置,但信息的稀疏采样 inevitably 导致细节丢失.对于需要精确理解每一帧的任务(如动作识别、细粒度视频编辑),这种采样策略可能成为瓶颈.</p>
<blockquote>
<p><strong>思考 7: 智能体能力的「实验室 vs 真实世界」差距</strong></p>
</blockquote>
<p>表 5 中 Qwen2-VL-72B 在 AITZ(TM 89.6)和卡牌游戏(Number Line 100%)上表现出色,但在导航任务 R2R(51.7)和 REVERIE(31.0)上明显落后于前代 SOTA(79.0 和 61.0).这种差异揭示了一个关键问题:结构化环境(如手机 UI、卡牌规则)中的智能体任务与开放式环境(如室内导航)中的任务对模型能力的要求完全不同.前者主要依赖视觉定位 + 规则推理,后者需要空间记忆、路径规划和长期目标跟踪——这些能力在当前的 LVLMs 中仍然薄弱.从实验室基准到真实世界部署,还有相当长的距离.</p>
<h3 id="6-5-jspx-lineage">6.5 技术谱系 (Lineage)</h3>
<blockquote>
<p><strong>思考 8: Qwen2-VL 在 LVLM 架构演进中的位置</strong></p>
</blockquote>
<p>Qwen2-VL 的架构谱系:</p>
<pre><code>LLaVA(2023): CLIP ViT + 线性投影 + Vicuna LLM
    ↓
Qwen-VL(2023): 微调的 ViT + Q-Former + Qwen LLM
    ↓
Qwen2-VL(2024): 2D-RoPE ViT + MLP Merger + Qwen2 LLM + M-RoPE + 动态分辨率
    ↓
Qwen2.5-VL(2025): Window Attention ViT + 动态 FPS + 绝对时间 MRoPE
</code></pre>
<p>与同期竞争架构相比:InternVL 采用更大的 ViT(6B)和更强的连接器,但在相同 LLM 规模下,Qwen2-VL 通过更高效的 ViT 设计和更优质的数据策展实现了匹敌甚至更优的性能.MiniGPT-v2 采用单一模型处理多种任务,但 Qwen2-VL 的统一图像/视频处理范式在工程实现上更为简洁.从后续影响看,Qwen2-VL 的动态分辨率和 M-RoPE 设计直接影响了 Qwen2.5-VL 的架构演进,也成为其他开源 LVLM(如 MiniMax、GLM 视觉系列)的重要参考.</p>
<blockquote>
<p><strong>思考 9: Scaling Law 在多模态领域的特殊性</strong></p>
</blockquote>
<p>图 5 显示了一个有趣的现象:数学能力随模型规模线性增长,而 OCR 能力在 2B 模型上就已经接近饱和.这与 LLM 领域的 Scaling Law 不同——在纯文本领域,几乎所有能力都随参数规模增长.多模态领域的特殊性在于:不同能力对应不同的「能力类型」.OCR 主要是「感知」任务,需要识别字符模式和空间关系,这些模式在较小模型中就可以被有效编码;数学推理则是「认知」任务,需要多步逻辑推导和符号操作,对模型容量要求更高.这提示我们:多模态模型的 scaling 不是均匀的,为特定应用场景选择模型时,应关注目标能力的 scaling 曲线而非总体参数规模.</p>
<hr>
<h2 id="7-hxsyb">7. 核心术语表</h2>
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
<td align="left">Naive Dynamic Resolution</td>
<td align="left">朴素动态分辨率</td>
<td align="left">摘要</td>
<td align="left">按图像原生分辨率处理,动态转换为可变长度视觉 token</td>
</tr>
<tr>
<td align="left">M-RoPE</td>
<td align="left">多模态旋转位置编码</td>
<td align="left">摘要</td>
<td align="left">将位置编码分解为时间/高度/宽度三个组件</td>
</tr>
<tr>
<td align="left">3D Convolution</td>
<td align="left">三维卷积</td>
<td align="left">方法</td>
<td align="left">将相邻帧组合为 3D tube 处理视频输入</td>
</tr>
<tr>
<td align="left">ViT</td>
<td align="left">视觉Transformer</td>
<td align="left">方法</td>
<td align="left">基于Transformer架构的视觉Encoder</td>
</tr>
<tr>
<td align="left">RefCOCO</td>
<td align="left">指代表达理解基准</td>
<td align="left">实验</td>
<td align="left">评估模型根据文本描述定位图像中物体的能力</td>
</tr>
<tr>
<td align="left">ChatML</td>
<td align="left">对话标记语言</td>
<td align="left">训练</td>
<td align="left">用于构建指令遵循数据的对话格式</td>
</tr>
<tr>
<td align="left">1F1B PP</td>
<td align="left">一进一出流水线并行</td>
<td align="left">基础设施</td>
<td align="left">减少流水线气泡的调度策略</td>
</tr>
<tr>
<td align="left">Scaling Law</td>
<td align="left">缩放定律</td>
<td align="left">消融</td>
<td align="left">模型/数据规模与性能之间的定量关系</td>
</tr>
</tbody></table>
<hr>
<blockquote>
<p><strong>参考引用</strong></p>
<ul>
<li>原文: Qwen2-VL: Enhancing Vision-Language Model&#39;s Perception of the World at Any Resolution, arXiv:2409.12191</li>
<li>代码与模型: <a href="https://github.com/QwenLM/Qwen2-VL">https://github.com/QwenLM/Qwen2-VL</a></li>
</ul>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"zy-abstract","text":"摘要 (Abstract)"},{"level":2,"id":"1-yy-introduction","text":"1. 引言 (Introduction)"},{"level":2,"id":"2-ff-approach","text":"2. 方法 (Approach)"},{"level":3,"id":"2-1-mxjg-model-architecture","text":"2.1 模型架构 (Model Architecture)"},{"level":4,"id":"2-1-1-naive-dynamic-resolution","text":"2.1.1 Naive Dynamic Resolution"},{"level":4,"id":"2-1-2-multimodal-rotary-position-embedding-m-rope","text":"2.1.2 Multimodal Rotary Position Embedding (M-RoPE)"},{"level":4,"id":"2-1-3-tydtxhsplj-unified-image-and-video-understanding","text":"2.1.3 统一的图像和视频理解 (Unified Image and Video Understanding)"},{"level":3,"id":"2-2-xl-training","text":"2.2 训练 (Training)"},{"level":4,"id":"2-2-1-sjgs-data-format","text":"2.2.1 数据格式 (Data Format)"},{"level":3,"id":"2-3-dmtmxjcss-multimodal-model-infrastructure","text":"2.3 多模态模型基础设施 (Multimodal Model Infrastructure)"},{"level":2,"id":"3-sy-experiments","text":"3. 实验 (Experiments)"},{"level":3,"id":"3-1-y-sota-mxbj","text":"3.1 与 SOTA 模型比较"},{"level":3,"id":"3-2-dljg","text":"3.2 定量结果"},{"level":4,"id":"3-2-1-tysjwd","text":"3.2.1 通用视觉问答"},{"level":4,"id":"3-2-2-wdytbyd","text":"3.2.2 文档与图表阅读"},{"level":4,"id":"3-2-3-dyywbsbylj","text":"3.2.3 多语言文本识别与理解"},{"level":4,"id":"3-2-4-sxtl","text":"3.2.4 数学推理"},{"level":4,"id":"3-2-5-zdbdlj-referring-expression-comprehension","text":"3.2.5 指代表达理解 (Referring Expression Comprehension)"},{"level":3,"id":"3-3-xrsy-ablation-study","text":"3.3 消融实验 (Ablation Study)"},{"level":4,"id":"3-3-1-dtfbs-dynamic-resolution","text":"3.3.1 动态分辨率 (Dynamic Resolution)"},{"level":4,"id":"3-3-2-m-rope","text":"3.3.2 M-RoPE"},{"level":4,"id":"3-3-3-mxsf-model-scaling","text":"3.3.3 模型缩放 (Model Scaling)"},{"level":2,"id":"4-jl-conclusion","text":"4. 结论 (Conclusion)"},{"level":2,"id":"5-fl-mxnlydxsl","text":"5. 附录: 模型能力与定性示例"},{"level":3,"id":"5-1-tydhy-ocr","text":"5.1 通用对话与 OCR"},{"level":3,"id":"5-2-sjdw-visual-grounding","text":"5.2 视觉定位 (Visual Grounding)"},{"level":3,"id":"5-3-gnty-function-calling","text":"5.3 功能调用 (Function Calling)"},{"level":3,"id":"5-4-sjznt-visual-agent","text":"5.4 视觉智能体 (Visual Agent)"},{"level":2,"id":"6-jsskjd-technical-thinking-nodes","text":"6. 技术思考节点 (Technical Thinking Nodes)"},{"level":3,"id":"6-1-sjdj-design-rationale","text":"6.1 设计动机 (Design Rationale)"},{"level":3,"id":"6-2-sjsy-data-experiments","text":"6.2 数据实验 (Data Experiments)"},{"level":3,"id":"6-3-jgxj-architecture-details","text":"6.3 架构细节 (Architecture Details)"},{"level":3,"id":"6-4-jxyfx-limitations-amp-risks","text":"6.4 局限与风险 (Limitations &amp; Risks)"},{"level":3,"id":"6-5-jspx-lineage","text":"6.5 技术谱系 (Lineage)"},{"level":2,"id":"7-hxsyb","text":"7. 核心术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.2-qwen/03-qwen2-vl/01-qwen2-vl-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Qwen2-VL 技术报告精译</h1>
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
