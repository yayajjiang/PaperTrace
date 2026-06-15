"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h3 id="1-yy">1. 引言</h3>
<p>OCR(Optical Character Recognition)长期以来以“字符识别”或“文本识别”为核心, 其典型流程是先检测文字区域、再识别字符、最后做后处理. 随着文档种类、版式复杂性、长上下文需求(例如整本书、长表格、文献档案)急剧提升, 传统以token(子词、字符)为单位的OCR技术逐渐遇到瓶颈. 最近“像素级”“视觉压缩”“视觉token替代文本token”路径兴起, 被称为OCR-2.0. 本文分阶段回顾这一演进, 聚焦“像素级 / 视觉压缩OCR-2.0”直接相关工作逐一展开.</p>
<h3 id="2-ocr-yjdsgjd">2. OCR演进的三个阶段</h3>
<p><img src="/llm-guide/10-surveys/c-ocr-d-ocr-2.0-dyj/c-ocr-d-ocr-2.0-dyj/images/image_0.png" alt=""></p>
<h4 id="jdy-ct-ocr-ocr-1-0-jllqs"><strong>阶段一: 传统OCR (OCR-1.0) 及理论前身</strong></h4>
<p>这一阶段的技术核心是“字符识别”, 并包含了为后续发展奠定跨领域基础的理论探索. 传统流程遵循分步处理: 检测文字区域、识别单个字符、最后进行语言学纠错. 同时, 一些开创性研究展示了将非视觉信号转换为图像进行处理的巨大潜力.</p>
<ul>
<li><p><strong>代表工作</strong>:</p>
</li>
<li><p><strong>论文</strong>: <strong>Gradient-based learning applied to document recognition</strong></p>
</li>
<li><p><strong>作者</strong>: Y. LeCun, L. Bottou, Y. Bengio, P. Haffner- <strong>发表</strong>: <em>Proceedings of the IEEE</em>, 1998    - <strong>核心思想</strong>:  这篇论文正式提出了 <strong>LeNet-5</strong> 卷积神经网络,是最早证明“视觉信号可通过端到端神经网络直接学习”的工作.论文首次在手写数字识别任务中展示了 CNN 自动提取局部视觉特征的强大能力,为 “端到端视觉特征学习”奠定了基础,推动了后来“多类型数据图像化”趋势间接发展</p>
</li>
</ul>
<p>这是我读研期间做故障诊断时期读到的一篇论文,一千多引用,那时候还不知道 Yann 这位大佬,一查吓一跳,卧槽,图灵奖大佬的论文我居然能看懂.整理 OCR 领域论文的时候突然想起来了这一篇也是把时间序列可视化然后用 CNN 做,就也放进来了</p>
<ul>
<li><p><strong>论文</strong>: <strong>Imaging Time-Series to Improve Classification and Imputation</strong></p>
</li>
<li><p><strong>作者</strong>: Zhiguang Wang- <strong>发表</strong>:  IJCAI 2015  - <strong>核心思想</strong>: 该研究是“信号图像化”思想的现代延续和扩展. 它系统性地将时间序列数据绘制成图像, 再利用CNN提取其形状和纹理特征来完成分类与缺失值插补任务. 实验结果在30个UCR标准数据集上击败了多种专门为时序数据设计的模型, 进一步证明了该思路的普适性和有效性.</p>
</li>
</ul>
<h4 id="jde-ddd-wdlj-ocr-kz"><strong>阶段二: 端到端 + 文档理解OCR扩展</strong></h4>
<p>为克服传统流程的局限性, 研究重点转向了对整个文档页面的综合理解. “端到端”模型成为主流, 它们能够直接从原始图像生成最终的结构化输出, 避免了多阶段流程中错误的累积, 并开始融合文本、布局与图像等多模态信息.</p>
<ul>
<li><p><strong>代表工作</strong>:</p>
</li>
<li><p><strong>论文</strong>: <strong>LayoutLM: Pre-training of Text and Layout for Document Image Understanding</strong></p>
</li>
<li><p><strong>作者</strong>: Yiheng Xu et al.</p>
</li>
<li><p><strong>发表</strong>: ACL 2020- <strong>核心思想</strong>: 这项工作旨在让BERT这样强大的语言模型能够理解文档的二维空间布局. 它通过将文字的包围盒(bbox)坐标与图像块、文本token一起进行预训练, 开启了统一“文本+位置+图像”三模态信息进行文档理解的先河.</p>
</li>
<li><p><strong>论文</strong>: <strong>TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models</strong></p>
</li>
<li><p><strong>作者</strong>: Minghao Li et al.</p>
</li>
<li><p><strong>发表</strong>: ICDAR 2021- <strong>核心思想</strong>: 该模型旨在用一个更简洁的架构统一OCR流程. 它完全摒弃了传统的CNN和CTC模块, 构建了一个纯粹基于Transformer的端到端OCR系统, 并直接使用预训练语言模型的权重进行初始化, 刷新了当时多项文字识别任务的性能记录.</p>
</li>
<li><p><strong>论文</strong>: <strong>Donut: OCR-free Document Understanding Transformer</strong></p>
</li>
<li><p><strong>作者</strong>: Geewook Kim et al.</p>
</li>
<li><p><strong>发表</strong>: ICML 2022- <strong>核心思想</strong>: 本文提出了一个激进的“无OCR”文档理解范式. 模型能够将整页扫描图像作为输入, 通过自回归的方式直接生成结构化的JSON输出, 完全跳过了中间的字符识别步骤. 它首次证明了从“像素→答案”的路径是可行的, 能够彻底摆脱对词汇表的依赖.</p>
</li>
<li><p><strong>论文</strong>: <strong>Pix2Struct: Screenshot Parsing as Pretraining for Visual Language Understanding</strong></p>
</li>
<li><p><strong>作者</strong>: Kenton Lee et al.</p>
</li>
<li><p><strong>发表</strong>: NeurIPS 2022- <strong>核心思想</strong>: 该研究专注于让模型理解网页、图表截图等复杂视觉界面. 它设计了一种新颖的预训练任务, 即从一张截图图像重建其背后的HTML结构, 并为此设计了可变分辨率的图像栅格化方法. 这迫使模型必须同时理解布局、文字与图形三者间的关系.</p>
</li>
<li><p><strong>论文</strong>: <strong>Nougat: Neural Optical Understanding for Academic Documents</strong></p>
</li>
<li><p><strong>作者</strong>: Lukas Blecher et al.</p>
</li>
<li><p><strong>发表</strong>: NeurIPS 2023- <strong>核心思想</strong>: 这项工作专注于解决一个极具挑战性的任务: 将包含复杂数学公式和表格的扫描版学术论文转换为结构化的LaTeX代码. 模型在百万页级的arXiv论文数据上进行训练, 实现了从像素到代码的直接转换, 是首个将“像素→结构化数学文档”理念做到生产级别的系统.</p>
</li>
</ul>
<h4 id="jds-xsj-sjys-ocr-2-0"><strong>阶段三: 像素级 / 视觉压缩 OCR-2.0</strong></h4>
<p>这是OCR演进的最新阶段, 其核心是彻底摆脱文本token的束缚, 转向“视觉原生”的处理方式. 通过将文本渲染成图像, 用视觉token替代文本token, 实现了无词汇表、高压缩率和对超长上下文的卓越支持. OCR的范畴也从“识别文字”扩展到“理解所有人造光学信号”.</p>
<ul>
<li><p><strong>代表工作</strong>:</p>
</li>
<li><p><strong>奠基性工作与理论框架</strong></p>
</li>
<li><p><strong>论文</strong>: <strong>Language Modeling with Pixels</strong></p>
</li>
<li><p><strong>作者</strong>: Phillip Rust et al.</p>
</li>
<li><p><strong>发表</strong>: ICLR 2023- <strong>核心思想</strong>: 该论文是像素级语言模型的奠基之作. 它将文本渲染成图像, 再用ViT模型通过掩码像素回归的方式进行学习, 而非预测离散的token. 仅用86M参数, 模型就在非拉丁语脚本上的表现超越了BERT, 成功开辟了这条新路线.</p>
</li>
<li><p><strong>论文</strong>: <strong>See the Text: From Tokenization to Visual Reading</strong></p>
</li>
<li><p><strong>作者</strong>: Zhiyuan Liu et al.</p>
</li>
<li><p><strong>发表</strong>: arXiv 2025 (arXiv:2510.18840)</p>
</li>
<li><p><strong>核心思想</strong>: 这篇论文为OCR-2.0的“像素路线”提供了坚实的理论框架. 它系统性地对比了token路线与像素路线的优劣, 并提出了“视觉阅读三原则”: <strong>无词汇表、可压缩、可渲染</strong>. 实验证明, 3B参数的像素模型在扫描书任务上的BLEU得分显著高于同规模的token模型, 印证了该框架的优越性.</p>
</li>
<li><p><strong>核心模型与系统</strong></p>
</li>
<li><p><strong>论文</strong>: <strong>Vary: Scaling up the Vision Vocabulary for Large Vision-Language Models</strong></p>
</li>
<li><p><strong>作者</strong>: Haoran Wei et al.</p>
</li>
<li><p><strong>发表</strong>: arXiv 2023- <strong>核心思想</strong>: 该工作为视觉语言模型在OCR-2.0时代如何演进提供了思路. 它提出了一种动态扩展视觉词表的方法, 增加了8000个新的图像token来统一多模态符号的表示. 这为OCR-2.0模型提供了灵活、可扩展的视觉词汇表机制.  虽非OCR专项工作,但提供了视觉词表扩展机制,对OCR-2.0中的视觉 token 空间构建具有启发  </p>
</li>
<li><p><strong>论文</strong>: <strong>General OCR Theory: Towards OCR-2.0 via a Unified End-to-End Model</strong> (综合与)</p>
</li>
<li><p><strong>作者</strong>: Haoran Wei et al.</p>
</li>
<li><p><strong>发表</strong>: arXiv 2025 (arXiv:2409.01704)</p>
</li>
<li><p><strong>核心思想</strong>: 该论文明确定义了OCR-2.0的范式, 提出了“通用OCR理论”, 即将乐谱、公式、几何图等所有人造光学信号统一视为“字符”. 其580M参数的GOT模型, 采用高压缩视觉Encoder 和长上下文Decoder  , 能够端到端地输出可渲染的格式(如markdown, tikz), 首次在单个模型内完成了OCR-2.0的全任务闭环.</p>
</li>
<li><p><strong>论文</strong>: <strong>Glyph: Scaling Context Windows via Visual-Text Compression</strong></p>
</li>
<li><p><strong>作者</strong>: Zhipu AI Team- <strong>发表</strong>: ICML 2025- <strong>核心思想</strong>: 该模型展示了视觉压缩在处理超长文档上的惊人能力. 它通过高达<strong>64:1</strong>的视觉压缩比, 能将一个128k token的超长文档压缩到仅2k视觉token的窗口内进行处理, 实现了对中文百页扫描文档的一次性理解, 完美兼顾了高分辨率细节与超长上下文.</p>
</li>
</ul>
<p>智谱这篇<em>Glyph</em>真是苍了天,和 DeepSeek 同一天发布,结果完全没热度，希望这团队能多点关注和钱，能把免费 API 继续持续下去</p>
<ul>
<li><p><strong>论文</strong>: <strong>DeepSeek-OCR: Contexts Optical Compression</strong></p>
</li>
<li><p><strong>作者</strong>: DeepSeek Team- <strong>发表</strong>: arXiv 2025- <strong>核心思想</strong>: 这是一项工业级的OCR-2.0实践, 同样采用了<strong>64:1</strong>的视觉token压缩技术. 其3B参数的模型能以2500 tok/s的速度处理长文档, 先将其高效压缩为视觉token序列, 然后一次性生成包含完整排版信息的markup, 兼具速度与质量.</p>
</li>
<li><p><strong>论文</strong>: <strong>Qianfan-VL-OCR: A 5B Vision-Language Model for Extreme-Long Chinese Document Understanding</strong></p>
</li>
<li><p><strong>作者</strong>: Baidu Team- <strong>发表</strong>: arXiv 2025- <strong>核心思想</strong>: 该模型专注于攻克中文超长扫描文档这一极具挑战的场景. 它通过行块对齐预训练和8k-64k的滑动窗口机制, 在5B参数规模和2500 token/s的高吞吐量下, 取得了公开评测榜单的SOTA成绩.</p>
</li>
<li><p><strong>论文</strong>: <strong>DocLLM: A Layout-Aware Generative Language Model for Multimodal Document Understanding</strong></p>
</li>
<li><p><strong>作者</strong>: D. S. Wang et al.</p>
</li>
<li><p><strong>发表</strong>: ACL 2025 (arXiv:2409.12191)</p>
</li>
<li><p><strong>核心思想</strong>: 该工作解决了高压缩视觉token与文本token对齐困难的问题. 它提出了一种“布局感知”生成模型, 即使在<strong>64:1</strong>的视觉压缩后, 依然保留了bbox的相对位置嵌入, 从而在长文档问答和结构化还原任务上表现出色, 在超长中文档案数据集上效果优于同类模型.</p>
</li>
<li><p><strong>能力扩展与理论支撑</strong></p>
</li>
<li><p><strong>论文</strong>: <strong>Grasp Any Region: Towards Precise, Contextual Pixel Understanding for Multimodal LLMs</strong></p>
</li>
<li><p><strong>作者</strong>: GAR Team- <strong>发表</strong>: CVPR 2025- <strong>核心思想</strong>: 这项工作为OCR-2.0模型提供了更精细的局部理解能力. 通过引入可学习的“区域token”, 多模态大模型能够精确地指代和理解图像中的任意微小像素区域, 极大地增强了模型在复杂文档中进行区域-语义对齐的能力.</p>
</li>
<li><p><strong>论文</strong>: <strong>Dynamics of Subjective Contour Formation in Early Visual Cortex</strong></p>
</li>
<li><p><strong>作者</strong>: Lee &amp; Nguyen- <strong>发表</strong>: PNAS 2001- <strong>核心思想</strong>: 这篇经典的脑科学论文为“生成式视觉”提供了神经科学基石. 通过记录V1视皮层的电极阵列活动, 它揭示了大脑在感知物理上不存在的“主观轮廓”时, 高层脑区的预测信号会反向“写入”并影响低层神经元的活动.</p>
</li>
<li><p><strong>论文</strong>: <strong>Oscillatory Activation Networks: A New Mechanism for Visual Predictive Coding</strong></p>
</li>
<li><p><strong>作者</strong>: Daniel K. Wójcik &amp; J. M. Bekkers- <strong>发表</strong>: TPAMI 2022- <strong>核心思想</strong>: 该研究为视觉预测编码提供了一个新的数学框架. 它使用耦合振子网络来建模视觉皮层的预测编码过程, 为“自上而下”的反馈机制提供了一种基于振荡动力学的、可解释的数学模型, 对生成式视觉模型的构建具有理论指导意义.</p>
</li>
<li><p><strong>论文</strong>: <strong>A Detailed Theory of Thalamic and Cortical Microcircuits for Predictive Visual Inference</strong></p>
</li>
<li><p><strong>作者</strong>: Dileep George et al.</p>
</li>
<li><p><strong>发表</strong>: bioRxiv 2025- <strong>核心思想</strong>: 这篇论文从计算神经科学的角度, 提出了一个精细的丘脑-皮层环路计算模型. 该模型旨在解释视觉系统“先猜测后验证”的预测性推理机制, 为像素级的生成式模型和视觉理解提供了坚实的神经科学理论底座.</p>
</li>
</ul>
<h3 id="3-zjyzw">3. 总结与展望</h3>
<ul>
<li><p><strong>核心转变</strong>: 从OCR-1.0到OCR-2.0的演进, 是从“字符识别”向“视觉原生理解”的根本性转变.</p>
</li>
<li><p><strong>技术核心</strong>: OCR-2.0路径的核心在于摆脱词汇表和文本token的限制, 转向视觉token或像素级处理, 实现<strong>高压缩比</strong>和对<strong>长上下文、复杂结构</strong>的深度理解.</p>
</li>
<li><p><strong>发展现状</strong>: 学术界已涌现出如GOT、See the Text等定义范式和理论框架的工作, 而工业界则迅速推出了如Glyph、DeepSeek-OCR等生产级模型, 显示出巨大的发展潜力.</p>
</li>
<li><p><strong>未来挑战</strong>: 未来仍需在多语言/手写/低资源脚本处理、极端长文档的效率与精度、复杂跨模态信息的融合、工业部署成本以及建立标准化评测基准等方面持续探索.</p>
</li>
</ul>
<h3 id="4-grdyw">4. 个人的疑问</h3>
<p>当前OCR的benchmark主要关注字符级别的准确率. 然而, 尤其对于中文(英文也类似), 即便达到96%的准确率, 剩下的4%错误可能包含关键信息. 比如, 两个形近字识别错误, 尽管准确率只相差一点, 但语义可能完全改变. 如果结合上下文, 这种错误又是可以被理解和纠正的. 那么, 未来的benchmark是否可以引入“语义还原度”作为评价指标？但这又是一个极具挑战性的问题, 因为语义的量化非常困难. 是否可以借鉴类似稀疏注意力机制(如NSA/MoBA)的思路, 在评估时给予关键语义部分更高的权重？这是一个值得探讨的方向.</p>
<h3 id="zh-acl-fgd-motivation">(整活) ACL 风格的 Motivation</h3>
<p>当前 OCR 基准通常以字符级指标(如 CER、字符准确率)作为主要评估手段.但在真实应用场景中,这类表面级别的度量往往无法充分反映系统的实用价值——尤其在中文等高字形相似度语言中,即便整体字符准确率达到 96%,剩余的 4% 错误也可能包含关键信息,导致语义被严重扭曲.举例来说,形近字的替换常常会把一句话的含义彻底改变,而按字符计分则只反映微小差别.另一方面,许多此类错误在上下文存在时对人类仍是可恢复的(即语义可通过上下文纠正或补偿),这说明“字面正确”与“语义正确”之间存在显著差异.</p>
<p>因此,我们提出应在未来 OCR 基准中加入语义还原度(semantic fidelity)类指标,用以衡量识别结果在语义层面相对于参考文本的保真性.对语义的自动量化仍具挑战性,但自然语言处理领域已有基于上下文嵌入的语义度量(如 BERTScore、MoverScore)与更复杂的语义/结构化对齐框架,可为 OCR 语义评估提供直接工具与设计灵感.与此同时,衡量中应关注“关键语义单元”(key tokens / entities)的相对重要性:借鉴稀疏注意力与 token-importance 的思想,可以对那些对最终语义有高影响力的 token 赋予更高权重,从而使评测更贴近人类感知和下游任务需求.最后,考虑到文档解析与下游检索/问答任务间的级联效应(OCR 错误会放大并影响 RAG/知识库构建等应用),一个结合语义相似度与关键性加权的综合指标将更能揭示模型在实际部署中的表现与风险. (<a href="https://arxiv.org/abs/1904.09675?utm_source=chatgpt.com">arXiv</a>)</p>
<h4 id="zb-semantic-ocr-score-soc-score-gsysxxj">指标:Semantic OCR Score(SOC-Score)—— 公式与实现细节</h4>
<h5 id="1-jbdy">1) 基本定义</h5>
<p>令文本长度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi></mrow><annotation encoding="application/x-tex">N</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span></span></span></span>.定义 SOC-Score 为加权语义相似度的加权和:</p>
<p>\$\\text{SOC} = \\sum_{i=1}^{N} w_i \\cdot s_i,
\\qquad s_i \\in [0,1],; w_i \\in [0,1],; \\sum_{i} w_i = 1\$</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">s_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>:第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个 token 的**语义相似度**,衡量识别出的 token(或其上下文)与参考 token 在语义空间的接近度.
</li>
<li><p>建议计算方式:用上下文化语言模型(如中文/多语 BERT/CLIP-text/语言模型嵌入)得到参考与预测的 token/短语嵌入,取余弦相似度或基于 Earth Mover Distance 的对齐聚合(MoverScore 风格).这与 BERTScore / MoverScore 的思想一致,能捕捉同义/重述而非严格字符匹配. (<a href="https://arxiv.org/abs/1904.09675?utm_source=chatgpt.com">arXiv</a>)</p>
</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>w</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">w_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>:第 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>i</mi></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6595em;"></span><span class="mord mathnormal">i</span></span></span></span> 个 token 的**重要性权重**,反映该 token 对总体语义的贡献与敏感度.
</li>
<li><p>建议计算方式(可组合):</p>
</li>
</ul>
<ol>
<li>基于命名实体 / 语义单元:若 token 属于实体(人名、数值、关键名词)则 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>a</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">a_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 增大; 2. 基于上下文依赖/注意力:使用一个预训练模型在 reference 上计算 token-level attention / gradient-based importance(或用可解释性方法估计重要性),得到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>a</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">a_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>; 3. 基于任务启发:对特定下游任务(如表格抽取、法律文本)预设某些类别权重(例如数值/单位权重更高).</li>
</ol>
<ul>
<li>将原始重要性分数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>a</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">a_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 归一化为概率分布(softmax with sparsity):</li>
</ul>
<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>w</mi><mi>i</mi></msub><mo>=</mo><mfrac><mrow><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>α</mi><mtext> </mtext><msub><mi>a</mi><mi>i</mi></msub><mo stretchy="false">)</mo></mrow><mrow><msubsup><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mi>N</mi></msubsup><mi>exp</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>α</mi><mtext> </mtext><msub><mi>a</mi><mi>j</mi></msub><mo stretchy="false">)</mo></mrow></mfrac></mrow><annotation encoding="application/x-tex">w_i = \\frac{\\exp(\\alpha \\, a_i)}{\\sum_{j=1}^{N} \\exp(\\alpha \\, a_j)}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.7619em;vertical-align:-0.7519em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.01em;"><span style="top:-2.5703em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mop op-symbol small-op mtight" style="position:relative;top:0em;">∑</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8852em;"><span style="top:-2.1786em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-2.8971em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.4603em;"><span></span></span></span></span></span></span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mop mtight"><span class="mtight">e</span><span class="mtight">x</span><span class="mtight">p</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0572em;">j</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2819em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.485em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mop mtight"><span class="mtight">e</span><span class="mtight">x</span><span class="mtight">p</span></span><span class="mopen mtight">(</span><span class="mord mathnormal mtight" style="margin-right:0.0037em;">α</span><span class="mspace mtight" style="margin-right:0.1952em;"></span><span class="mord mtight"><span class="mord mathnormal mtight">a</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3281em;"><span style="top:-2.357em;margin-left:0em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7519em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi><mo>≥</mo><mn>0</mn></mrow><annotation encoding="application/x-tex">\\alpha\\ge0</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7719em;vertical-align:-0.136em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≥</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0</span></span></span></span> 控制稀疏性(<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>α</mi></mrow><annotation encoding="application/x-tex">\\alpha</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal" style="margin-right:0.0037em;">α</span></span></span></span> 大 → 权重更集中于少数关键 token).该思路类似于 token-importance / TI-DPO 中对关键 token 赋高权的做法. (<a href="https://arxiv.org/html/2505.19653v1?utm_source=chatgpt.com">arXiv</a>)</p>
<h5 id="2-yyxsd-s-i-s-i-s-i-djtjs-lzkhfa">2) 语义相似度 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">s_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 的具体计算(两种可行方案)</h5>
<ul>
<li><p><strong>Token 对 token(BERTScore 风格)</strong> :把参考与预测文本分别用预训练模型编码为上下文 token 嵌入,计算每个参考 token 与预测 token 之间的相似度矩阵,再按最大匹配/soft-alignment 聚合得到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>s</mi><mi>i</mi></msub></mrow><annotation encoding="application/x-tex">s_i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal">s</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>.(BERTScore 原理) (<a href="https://arxiv.org/abs/1904.09675?utm_source=chatgpt.com">arXiv</a>)</p>
</li>
<li><p><strong>片段 / 意图对齐(MoverScore 风格)</strong> :先做碎片化(n-gram / phrase),用 Earth Mover Distance 对两组嵌入做最优运输,得到整体或局部的相似度,便于处理位置/重排导致的局部偏差. (<a href="https://arxiv.org/abs/1909.02622?utm_source=chatgpt.com">arXiv</a>)</p>
</li>
</ul>
<h5 id="3-gyhysc">3) 归一化与输出</h5>
<ul>
<li>为了便于跨文档长短比较,建议对 SOC 做长度归一化(已经用 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>∑</mo><msub><mi>w</mi><mi>i</mi></msub><mo>=</mo><mn>1</mn></mrow><annotation encoding="application/x-tex">\\sum w_i =1</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop op-symbol small-op" style="position:relative;top:0em;">∑</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0269em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">1</span></span></span></span> 处理),输出范围在 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">[</mo><mn>0</mn><mo separator="true">,</mo><mn>1</mn><mo stretchy="false">]</mo></mrow><annotation encoding="application/x-tex">[0,1]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">[</span><span class="mord">0</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">1</span><span class="mclose">]</span></span></span></span>.- 可同时报告(a)全局 SOC、(b)关键 token SOC(只对 top-k 权重 token 计算),(c)传统 CER/WER 以便对比.</li>
</ul>
<h4 id="xggz">相关工作</h4>
<p><strong>1) SROIE: Scanned Receipt OCR and Information Extraction</strong></p>
<p><strong>Task</strong>: 文档 OCR → 信息抽取 → 用语义字段衡量结果质量</p>
<p><em>SROIE: The Scanned Receipts OCR and Information Extraction Challenge Dataset</em>
Huang et al., ICDAR 2019</p>
<p><strong>关联点</strong></p>
<ul>
<li>不是看字符是否一致，而是看<strong>语义字段是否保真</strong>(店名、金额、日期)- 说明 OCR 评估 <strong>必须引入语义理解</strong>- 该工作表明，字符级准确率无法完全反映真实任务性能，语义级字段提取更具应用意义.</li>
</ul>
<p><strong>2) FUNSD: Form Understanding in Noisy Scanned Documents</strong></p>
<p><strong>Task</strong>: 表单 OCR → 语义实体抽取和关系理解</p>
<p><em>FUNSD: A Dataset for Form Understanding in Noisy Scanned Documents</em>
Jaume et al., ICDAR 2019</p>
<p><strong>关联点</strong></p>
<ul>
<li>强调<strong>OCR后语义结构恢复</strong>- 评估指标不止文本，还包括<strong>实体正确率、关系一致性</strong>- 该数据集强调 OCR 输出需承担语义理解职责，而非仅字符识别.</li>
</ul>
<p><strong>3) DocVQA: Document Visual Question Answering</strong></p>
<p><strong>Task</strong>: OCR + 理解 → 回答语义问题</p>
<p><em>Text Reading and Understanding in the Wild: A Survey of Current Datasets</em></p>
<ul>
<li><strong>DocVQA Benchmark</strong> (Mathew et al., CVPR 2021)</li>
</ul>
<p><strong>关联点</strong></p>
<ul>
<li>模型必须“读懂”文档，而不是只转字符- 直接用<strong>问答正确率衡量语义保真</strong></li>
</ul>
<h3 id="bc-jxzh">补充(继续整活)</h3>
<h4 id="hxczddb-ai-s-99-y-gemini2-5pro-h-gpt5-pro-rgjdxgec">核心侧重点对比(AI 率 99%, 由 Gemini2.5Pro 和 GPT5-Pro + 人工简单修改而成)</h4>
<p>简单来说, 这四个会议可以这样区分:</p>
<ul>
<li><p><strong>ICLR</strong>: <strong>关注表征</strong>. 如何学习到好的数据表示? 核心是深度学习和表示学习本身.</p>
</li>
<li><p><strong>ICML</strong>: <strong>关注算法和理论</strong>. 你的机器学习方法在数学和统计上是否严谨?</p>
</li>
<li><p><strong>AAAI</strong>: <strong>关注AI系统和应用</strong>. 你的技术如何构成一个智能系统, 或解决一个实际的AI问题?</p>
</li>
<li><p><strong>ACL</strong>: <strong>关注语言</strong>. 你的方法如何解决一个具体的、有语言学背景的自然语言问题?</p>
</li>
</ul>
<h4 id="1-iclr-international-conference-on-learning-representations">1. ICLR (International Conference on Learning Representations)</h4>
<ul>
<li><p><strong>核心侧重点</strong>: <strong>表示学习 (Representation Learning)</strong> . ICLR 是深度学习领域的顶级盛会, 它的灵魂在于“表示”. 它关心的是如何通过神经网络或其他方法, 将原始数据 (如图像, 文本, 声音) 转换成更有用、更鲁棒、更具泛化能力的<strong>特征表示 (feature representation)</strong> .</p>
</li>
<li><p><strong>关键词</strong>: 深度学习, 表示学习, 新型网络架构 (如 Transformer), 无监督/自监督学习, 生成模型 (GANs, VAEs), 学习理论, 优化算法的理论分析.</p>
</li>
<li><p><strong>偏好的研究风格</strong>:</p>
</li>
<li><p><strong>思想新颖</strong>: 特别欢迎提出全新概念、颠覆性想法的论文. 即使实验结果不是在所有数据集上都达到 SOTA (State-of-the-Art), 但只要想法本身有启发性、优雅且深刻, 就有很大机会被接受.</p>
</li>
<li><p><strong>理论与实践结合</strong>: 既欢迎纯理论的深刻洞见, 也喜欢那些能解释“为什么这个模型会工作”的实验性论文.</p>
</li>
<li><p><strong>关注学习本身</strong>: 讨论模型是如何“学习”的, 而不仅仅是它达到了什么结果.</p>
</li>
<li><p>与Motivation 的关联:</p>
</li>
<li><p>开篇就直击<strong>表征的根本局限</strong> (“离散的符号序列” vs. “连续的语义空间”).- 核心论点是呼吁从“符号复制”的范式, 转向“学习<strong>鲁棒语义表征</strong>”的新范式.- 引入 SRD 的目的是为了更好地<strong>度量表征的质量</strong>.- 整个论述非常 high-level, 强调的是一种<strong>思想和范式的转变</strong>, 这正是 ICLR 的口味.</p>
</li>
<li></li>
</ul>
<h4 id="2-icml-international-conference-on-machine-learning">2. ICML (International Conference on Machine Learning)</h4>
<ul>
<li><p><strong>核心侧重点</strong>: <strong>机器学习的算法与理论 (Algorithms &amp; Theory)</strong> . ICML 是机器学习领域最负盛名的会议之一, 它非常强调数学上的严谨性. 相比于 ICLR 的“新潮”, ICML 更像是“学院派”.</p>
</li>
<li><p><strong>关键词</strong>: 统计学习理论, 优化, 算法的收敛性/复杂度分析, 核方法, 贝叶斯方法, 强化学习理论, 可解释性, 公平性.</p>
</li>
<li><p><strong>偏好的研究风格</strong>:</p>
</li>
<li><p><strong>数学严谨</strong>: 论文中通常包含大量的数学公式、定理和证明. 提出一个新算法, 最好能从理论上证明它的优越性 (比如收敛更快, 泛化误差更低).</p>
</li>
<li><p><strong>可复现性与可靠性</strong>: 非常注重实验的设置是否公平, 结果是否可靠. 统计显著性检验是家常便饭.</p>
</li>
<li><p><strong>基础性与通用性</strong>: 偏爱那些对整个机器学习领域都有影响的基础算法或理论, 而不仅仅是针对某个特定应用的技巧.</p>
</li>
<li><p>与Motivation 的关联:</p>
</li>
<li><p>没有停留在“SRD 是个好主意”上, 而是立刻将其拔高到<strong>统计学的层面</strong>.- 关键概念是“<strong>统计估计量</strong>”. 我们讨论了它的<strong>方差</strong>, 用 <strong>Delta 方法</strong>进行理论分析, 并提出了用 <strong>Bootstrap</strong> 进行置信区间估计和假设检验.- 整个论述的重点在于: 我们提出的新指标 SRD, 在统计学上是<strong>可靠的 (reliable)</strong> 和<strong>可信赖的 (trustworthy)</strong> . 这完全是对标 ICML 审稿人的思维方式.</p>
</li>
<li></li>
</ul>
<h4 id="3-aaai-aaai-conference-on-artificial-intelligence">3. AAAI (AAAI Conference on Artificial Intelligence)</h4>
<ul>
<li><p><strong>核心侧重点</strong>: <strong>人工智能系统与应用 (AI Systems &amp; Applications)</strong> . AAAI 是一个历史悠久且非常综合的人工智能会议. 它覆盖面极广, 从传统AI (搜索, 规划, 知识表示) 到现代机器学习无所不包. 它的一大特色是关注“<strong>智能体 (Agent)</strong> ”和<strong>系统的构建</strong>.</p>
</li>
<li><p><strong>关键词</strong>: AI 系统集成, 规划, 推理, 知识图谱, 多智能体系统, 人机交互, AI 应用 (医疗, 交通, 金融), AI 伦理.</p>
</li>
<li><p><strong>偏好的研究风格</strong>:</p>
</li>
<li><p><strong>系统性</strong>: 喜欢看到一个完整的系统, 而不是单一的组件. 你的技术如何在一个更大的 AI 管道 (pipeline) 中发挥作用?</p>
</li>
<li><p><strong>问题驱动</strong>: 从一个实际的 AI 问题出发, 提出一个有效的解决方案.</p>
</li>
<li><p><strong>可操作性</strong>: 强调技术的可行性和实用性. 比如, 我们提出的 SRD, 能不能不只作为评估指标, 而是反过来<strong>指导模型的训练</strong>?</p>
</li>
<li><p>与Motivation 的关联:</p>
</li>
<li><p>核心是<strong>将 SRD 从一个被动的评估工具, 变成一个主动的优化目标</strong>.- 提出了“<strong>可微 SRD</strong>”和“<strong>联合训练框架</strong>”, 这本质上是在设计一个更智能的<strong>AI 训练系统</strong>.- 论述的落脚点是解决“<strong>代理鸿沟</strong>” (surrogate gap), 这是一个典型的系统工程问题, 即训练目标与最终目标不一致. 这非常符合 AAAI 的口味.</p>
</li>
<li></li>
</ul>
<h4 id="4-acl-association-for-computational-linguistics">4. ACL (Association for Computational Linguistics)</h4>
<ul>
<li><p><strong>核心侧重点</strong>: <strong>自然语言处理与计算语言学 (NLP &amp; Computational Linguistics)</strong> . ACL 是 NLP 领域的绝对顶会. 它的一切都围绕着<strong>人类语言</strong>. 无论你的技术多花哨 (数学, 深度学习), 都必须最终落脚到解决一个具体的语言问题上.</p>
</li>
<li><p><strong>关键词</strong>: 机器翻译, 文本摘要, 情感分析, 问答系统, 句法分析, 命名实体识别, 语言模型, 语料库, 语言学理论.</p>
</li>
<li><p><strong>偏好的研究风格</strong>:</p>
</li>
<li><p><strong>语言学洞察</strong>: 非常看重你的方法是否包含了对语言本身特性的理解. 为什么要这样设计模型? 因为语言有某种特性.</p>
</li>
<li><p><strong>细致的错误分析</strong>: 你的模型在哪些语言现象上做得好, 在哪些上做得差? (比如, 对比喻的理解, 对否定词的处理等).</p>
</li>
<li><p><strong>任务导向</strong>: 紧密围绕一个公认的 NLP 任务, 并展示你的方法在该任务上的提升.</p>
</li>
<li><p>与Motivation 的关联:</p>
</li>
<li><p>开篇就指出了现有指标的“<strong>语言学盲视</strong>”问题.- 解决方案不是一个通用的数学公式, 而是<strong>注入了大量语言学先验知识</strong>的加权模型, 明确列出了 <strong>NER, POS, 句法依赖, Surprisal</strong> 等特征.- 强调了要用包含“<strong>实体混淆</strong>”、“<strong>否定词丢失</strong>”等语言现象的<strong>挑战集</strong>来做案例分析.- 整个论述充满了语言学的“味道”, 表明作者是“自己人”.</p>
</li>
<li></li>
</ul>
<p><strong>​</strong></p>
<p><strong>(发了记得挂我八作)</strong> <strong>🤭</strong></p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":3,"id":"1-yy","text":"1. 引言"},{"level":3,"id":"2-ocr-yjdsgjd","text":"2. OCR演进的三个阶段"},{"level":4,"id":"jdy-ct-ocr-ocr-1-0-jllqs","text":"阶段一: 传统OCR (OCR-1.0) 及理论前身"},{"level":4,"id":"jde-ddd-wdlj-ocr-kz","text":"阶段二: 端到端 + 文档理解OCR扩展"},{"level":4,"id":"jds-xsj-sjys-ocr-2-0","text":"阶段三: 像素级 / 视觉压缩 OCR-2.0"},{"level":3,"id":"3-zjyzw","text":"3. 总结与展望"},{"level":3,"id":"4-grdyw","text":"4. 个人的疑问"},{"level":3,"id":"zh-acl-fgd-motivation","text":"(整活) ACL 风格的 Motivation"},{"level":4,"id":"zb-semantic-ocr-score-soc-score-gsysxxj","text":"指标:Semantic OCR Score(SOC-Score)—— 公式与实现细节"},{"level":5,"id":"1-jbdy","text":"1) 基本定义"},{"level":5,"id":"2-yyxsd-s-i-s-i-s-i-djtjs-lzkhfa","text":"2) 语义相似度 s i s_i s i ​ 的具体计算(两种可行方案)"},{"level":5,"id":"3-gyhysc","text":"3) 归一化与输出"},{"level":4,"id":"xggz","text":"相关工作"},{"level":3,"id":"bc-jxzh","text":"补充(继续整活)"},{"level":4,"id":"hxczddb-ai-s-99-y-gemini2-5pro-h-gpt5-pro-rgjdxgec","text":"核心侧重点对比(AI 率 99%, 由 Gemini2.5Pro 和 GPT5-Pro + 人工简单修改而成)"},{"level":4,"id":"1-iclr-international-conference-on-learning-representations","text":"1. ICLR (International Conference on Learning Representations)"},{"level":4,"id":"2-icml-international-conference-on-machine-learning","text":"2. ICML (International Conference on Machine Learning)"},{"level":4,"id":"3-aaai-aaai-conference-on-artificial-intelligence","text":"3. AAAI (AAAI Conference on Artificial Intelligence)"},{"level":4,"id":"4-acl-association-for-computational-linguistics","text":"4. ACL (Association for Computational Linguistics)"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="10-surveys/c-ocr-d-ocr-2.0-dyj/c-ocr-d-ocr-2.0-dyj" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="10-surveys/c-ocr-d-ocr-2.0-dyj/c-ocr-d-ocr-2.0-dyj" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">从OCR到OCR 2.0的演进</h1>
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
