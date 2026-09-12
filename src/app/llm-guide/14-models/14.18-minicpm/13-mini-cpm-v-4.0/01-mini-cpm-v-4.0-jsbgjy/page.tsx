"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V-4.0 技术报告精译</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>原文来源: OpenBMB GitHub 官方仓库 / HuggingFace 模型卡片 / 官方发布说明
官方链接: <a href="https://github.com/OpenBMB/MiniCPM-V">https://github.com/OpenBMB/MiniCPM-V</a>
HuggingFace: <a href="https://huggingface.co/openbmb/MiniCPM-V-4">https://huggingface.co/openbmb/MiniCPM-V-4</a>
发布日期: 2025 年 8 月 2 日
发布机构: 清华大学面壁智能(OpenBMB)
模型规模: 4.1B 参数(LLM) + 视觉编码器
说明: MiniCPM-V 4.0 无独立技术报告 PDF, 本文基于官方公开信息综合整理精译</p>
</blockquote>
<hr>
<h2 id="1-mxgs">1 模型概述</h2>
<p>MiniCPM-V 4.0 是面壁智能于 2025 年 8 月发布的端侧多模态大语言模型(Multimodal Large Language Model, MLLM),核心语言模型参数量为 4.1B。该模型在保持端侧部署友好性的同时,实现了图像理解能力的显著提升——在官方评测中超越了 GPT-4.1-mini-20250414 的图像理解表现。</p>
<p>与上一代 MiniCPM-V 2.6(8B 参数)相比,V 4.0 进行了两项关键调整: (1) 语言模型基座从 8B 级压缩至 4.1B,大幅降低推理成本和内存占用; (2) 视觉编码与理解 pipeline 进行了效率优化,在保持核心能力的同时提升了端侧实时性。模型同时支持单图理解、多图联合推理和视频理解,延续了 MiniCPM-V 系列「端侧可部署的多模态全能模型」的产品定位。</p>
<blockquote>
<p>这里需要停下来想一下参数缩减的决策逻辑。从 8B 缩到 4.1B,参数量几乎减半,但官方宣称图像理解能力反而超越了 GPT-4.1-mini——这说明参数量的减少并没有以牺牲核心能力为代价。面壁智能在 MiniCPM 系列中一直践行「密度定律」(Law of Density): 模型性能不是单纯由参数量决定的,而是由「参数效率」(每参数能承载多少有效信息)决定的。V 4.0 的 4.1B 规模恰好落在当前主流中端手机(6-8GB RAM)的可部署区间内,而 8B 的 V 2.6 对很多旧款设备来说仍然过重。这个参数调整本质上是一个「产品-技术」协同决策: 不是「我们能做多大」,而是「目标用户手里的设备能跑多大」。</p>
</blockquote>
<hr>
<h2 id="2-hxnl">2 核心能力</h2>
<h3 id="2-1-txlj">2.1 图像理解</h3>
<p>MiniCPM-V 4.0 在 OpenCompass 综合评测(覆盖 8 个主流视觉-语言基准测试)中取得 <strong>69.0</strong> 的平均分。这一成绩在 4.1B 参数规模的端侧模型中处于领先水平,并超越了以下商用闭源模型:</p>
<ul>
<li><strong>GPT-4.1-mini-20250414</strong></li>
</ul>
<p>OpenCompass 的 8 项基准测试覆盖了从通用视觉问答到 OCR、从图表理解到多模态推理的广泛能力维度。69.0 的跨领域综合分数表明 MiniCPM-V 4.0 的能力分布相对均衡,没有出现明显的「偏科」现象。</p>
<blockquote>
<p>译者注: 「超越 GPT-4.1-mini」是一个需要仔细拆解的结论。GPT-4.1-mini 是 OpenAI 在 2025 年 4 月发布的一款轻量级多模态模型,定位与 MiniCPM-V 4.0 类似——都是面向效率优化的中小型模型。但两者有两个关键差异: 第一,GPT-4.1-mini 的具体参数量未公开,业界估计在 10-20B 量级,远大于 MiniCPM-V 4.0 的 4.1B; 第二,OpenCompass 是开源评测框架,其评测集和评分标准与 OpenAI 内部评测不完全一致。因此这个「超越」应理解为「在 OpenCompass 的特定评测条件下,以显著更小的参数规模取得了更高的分数」,而不是「全面超越 GPT-4.1-mini 的所有能力」。</p>
</blockquote>
<h3 id="2-2-dtljysplj">2.2 多图理解与视频理解</h3>
<p>MiniCPM-V 4.0 继承了 MiniCPM-V 2.6 的多图联合推理和视频理解能力。模型支持对多张图像进行联合对话和推理,并能够处理视频输入进行时序理解和动作识别。</p>
<p>在端侧部署场景下,视频理解的工程挑战远大于单图理解。单张 1344x1344 的图像经过视觉编码后通常产生数百个视觉 token,而一段 10 秒、10FPS 的视频包含 100 帧,即使经过帧采样和压缩,视觉 token 数量仍然可能达到数千级别。MiniCPM-V 4.0 通过优化视觉编码效率,使视频理解在端侧设备上成为可能。</p>
<blockquote>
<p>视频理解是端侧 MLLM 从「玩具」走向「工具」的关键能力。但当前端侧视频理解仍存在现实的工程约束: 第一,帧率受限——端侧设备通常无法处理高帧率视频,需要进行大幅度的帧采样(比如从 30FPS 降到 1-2FPS); 第二,分辨率受限——为了控制视觉 token 数量,输入视频往往被缩放到较低分辨率; 第三,上下文长度受限——4K 的默认上下文窗口对于长视频来说非常紧张。MiniCPM-V 4.0 的「视频理解」能力更多适用于短视频片段(数秒到数十秒)的理解,而非长视频的深度分析。</p>
</blockquote>
<h3 id="2-3-ocr-ywdjx">2.3 OCR 与文档解析</h3>
<p>MiniCPM-V 4.0 延续了 MiniCPM-V 系列在 OCR 领域的强势表现。该系列模型从 V 2.0 开始就在 OCRBench 上取得了开源最优成绩,V 2.5 和 V 2.6 进一步将这一优势扩展到多语言和复杂排版场景。V 4.0 在 4.1B 的紧凑规模下保持了这一能力 lineage,支持对文档、表格、手写文字等多种文本形态的识别和理解。</p>
<hr>
<h2 id="3-jgyxs">3 架构与效率</h2>
<h3 id="3-1-mxgg">3.1 模型规格</h3>
<p>MiniCPM-V 4.0 的模型规格与系列其他型号的对比:</p>
<table>
<thead>
<tr>
<th>规格项</th>
<th>MiniCPM-V 2.6</th>
<th>MiniCPM-V 4.0</th>
<th>MiniCPM-V 4.5</th>
<th>MiniCPM-V 4.6</th>
</tr>
</thead>
<tbody><tr>
<td>LLM 参数量</td>
<td>8B</td>
<td>4.1B</td>
<td>8B</td>
<td>1.3B</td>
</tr>
<tr>
<td>视觉编码器</td>
<td>SigLip-400M</td>
<td>未公开</td>
<td>SigLip2-400M</td>
<td>SigLIP2-400M</td>
</tr>
<tr>
<td>LLM 基座</td>
<td>Qwen2-7B</td>
<td>未公开</td>
<td>未公开</td>
<td>Qwen3.5-0.8B</td>
</tr>
<tr>
<td>发布日期</td>
<td>2024.08</td>
<td>2025.08</td>
<td>2025.08</td>
<td>2026.05</td>
</tr>
<tr>
<td>推荐 RAM</td>
<td>≥ 8GB</td>
<td>≥ 6GB</td>
<td>未公开</td>
<td>≥ 6GB</td>
</tr>
<tr>
<td>默认上下文</td>
<td>未公开</td>
<td>4K</td>
<td>未公开</td>
<td>未公开</td>
</tr>
</tbody></table>
<blockquote>
<p>官方未公开 MiniCPM-V 4.0 的视觉编码器型号和 LLM 基座来源。从系列演进规律推断,V 4.0 的视觉编码器可能沿用 SigLip-400M 或类似的轻量级 ViT,而 LLM 基座可能是从 MiniCPM3-4B 或 Qwen2.5-4B 微调而来。但无论具体基座是什么,4.1B 的 LLM 规模决定了其文本理解能力的上限——它不太可能超越同规模的纯文本模型,但在多模态任务中,视觉信息和文本信息的互补可以弥补部分文本能力的不足。</p>
</blockquote>
<h3 id="3-2-dcbsyh">3.2 端侧部署优化</h3>
<p>MiniCPM-V 4.0 的端侧部署参数如下:</p>
<table>
<thead>
<tr>
<th>配置项</th>
<th>数值</th>
</tr>
</thead>
<tbody><tr>
<td>LLM 量化格式(Q4_K_M)</td>
<td>~2.0 GB</td>
</tr>
<tr>
<td>视觉投影层(mmproj, f16)</td>
<td>~0.9 GB</td>
</tr>
<tr>
<td>总下载体积</td>
<td>~2.9 GB</td>
</tr>
<tr>
<td>推荐设备 RAM</td>
<td>≥ 6 GB</td>
</tr>
<tr>
<td>默认上下文窗口</td>
<td>4,096 tokens</td>
</tr>
</tbody></table>
<p>视觉投影层采用 FP16 精度而非量化,是因为视觉编码器的精度对感知质量的影响远大于语言模型。量化 ViT 会导致图像特征的细节丢失,在 OCR 等精细视觉任务中表现为识别准确率下降。</p>
<blockquote>
<p>2.9GB 的总模型体积是一个精心设计的数字。它低于 iOS 应用的典型体积上限(单个 app 通常允许数百 MB 到数 GB),也低于主流中端手机的可用内存(6GB RAM 设备在系统占用后通常有 2-3GB 可用)。这使得 MiniCPM-V 4.0 可以在不依赖云端的情况下,直接在 iPhone/iPad 上运行完整的视觉-语言推理。面壁智能同时开源了 iOS Demo App,这是一个重要的产品化信号——他们不仅开源模型权重,还提供了完整的端侧部署参考实现。</p>
</blockquote>
<hr>
<h2 id="4-pgjg">4 评估结果</h2>
<h3 id="4-1-open-compass-zhpc">4.1 OpenCompass 综合评测</h3>
<p>MiniCPM-V 4.0 在 OpenCompass 8 项基准测试上的平均分为 <strong>69.0</strong>。评测覆盖的维度包括:</p>
<ul>
<li>通用视觉问答(MMBench, MME)</li>
<li>多模态推理(MMMU, MathVista)</li>
<li>OCR 与文本理解(OCRBench, TextVQA)</li>
<li>图表理解(ChartQA)</li>
<li>幻觉检测(HallusionBench)</li>
</ul>
<h3 id="4-2-yxlmxdxnyj">4.2 与系列模型的性能演进</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>OpenCompass 平均分</th>
<th>参数规模</th>
<th>效率定位</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.6</td>
<td>65.2</td>
<td>8B</td>
<td>性能优先</td>
</tr>
<tr>
<td><strong>MiniCPM-V 4.0</strong></td>
<td><strong>69.0</strong></td>
<td><strong>4.1B</strong></td>
<td><strong>平衡型</strong></td>
</tr>
<tr>
<td>MiniCPM-V 4.5</td>
<td>77.0</td>
<td>8.7B</td>
<td>性能优先</td>
</tr>
<tr>
<td>MiniCPM-V 4.6</td>
<td>未公开(业界估计约 60-65)</td>
<td>1.3B</td>
<td>极致效率</td>
</tr>
</tbody></table>
<blockquote>
<p>从这张对比表可以看出 MiniCPM-V 系列的清晰产品矩阵: V 2.6 → V 4.0 → V 4.5 构成了一条「性能 ascending」线,参数量从 8B 降到 4.1B 再升回 8.7B,但 OpenCompass 分数持续上升(65.2 → 69.0 → 77.0)。这说明面壁智能在模型迭代中不仅调整了规模,更重要的是持续改进了训练数据质量和后训练策略。V 4.0 的独特价值在于它是这条线上「参数效率比」最高的点——用 4.1B 参数达到了接近 8B 级模型的性能。</p>
</blockquote>
<hr>
<h2 id="5-tlybs">5 推理与部署</h2>
<h3 id="5-1-kjzc">5.1 框架支持</h3>
<p>MiniCPM-V 4.0 支持以下推理框架:</p>
<table>
<thead>
<tr>
<th>框架</th>
<th>支持状态</th>
<th>备注</th>
</tr>
</thead>
<tbody><tr>
<td>llama.cpp</td>
<td>支持</td>
<td>官方 GGUF 格式,移动端首选</td>
</tr>
<tr>
<td>vLLM</td>
<td>支持</td>
<td>服务端批量推理</td>
</tr>
<tr>
<td>Ollama</td>
<td>支持</td>
<td>本地快速部署</td>
</tr>
<tr>
<td>HuggingFace Transformers</td>
<td>支持</td>
<td>开发调试</td>
</tr>
</tbody></table>
<h3 id="5-2-yddbs">5.2 移动端部署</h3>
<p>面壁智能为 MiniCPM-V 4.0 提供了完整的 iOS 端侧部署方案:</p>
<ul>
<li><strong>iOS Demo App</strong>: 开源 Xcode 项目,支持在 iPhone 和 iPad 上本地运行</li>
<li><strong>模型格式</strong>: GGUF(Q4_K_M) + mmproj(f16)</li>
<li><strong>推理引擎</strong>: llama.cpp (基于开源社区的 MiniCPM-V 适配分支)</li>
<li><strong>功能覆盖</strong>: 单图对话、多图对话、相册选图、相机实时拍摄</li>
</ul>
<p>Android 和 HarmonyOS 平台的部署也通过 MiniCPM-V-Apps 仓库提供了参考实现。</p>
<blockquote>
<p>开源 iOS App 在端侧 AI 领域是一个相对少见但极具价值的举措。大多数开源 MLLM 项目只提供模型权重和 Python 推理脚本,开发者需要自行解决移动端部署的复杂工程问题(模型转换、内存管理、UI 集成、性能优化等)。面壁智能提供完整的 Xcode 项目意味着: 第一,他们已经在内部验证了端侧部署的可行性; 第二,他们希望降低社区开发者的使用门槛,扩大生态; 第三,iOS 平台对内存和性能的要求最为严苛,能在 iPhone 上跑通意味着其他平台(Android、嵌入式 Linux)的部署风险更低。</p>
</blockquote>
<hr>
<h2 id="6-mxpxdw">6 模型谱系定位</h2>
<h3 id="6-1-mini-cpm-v-xlyj">6.1 MiniCPM-V 系列演进</h3>
<table>
<thead>
<tr>
<th>版本</th>
<th>发布时间</th>
<th>核心特征</th>
<th>参数规模</th>
</tr>
</thead>
<tbody><tr>
<td>V 2.0</td>
<td>2024.04</td>
<td>端侧 MLLM 首发, OCRBench SOTA</td>
<td>2.8B</td>
</tr>
<tr>
<td>V 2.5</td>
<td>2024.05</td>
<td>OCR 增强, 30+ 语言</td>
<td>8B</td>
</tr>
<tr>
<td>V 2.6</td>
<td>2024.08</td>
<td>视频理解 + 多图联合推理</td>
<td>8B</td>
</tr>
<tr>
<td><strong>V 4.0</strong></td>
<td><strong>2025.08</strong></td>
<td><strong>4.1B 高效多模态, 超越 GPT-4.1-mini</strong></td>
<td><strong>4.1B</strong></td>
</tr>
<tr>
<td>V 4.5</td>
<td>2025.08</td>
<td>3D-Resampler, 统一文档/OCR 学习</td>
<td>8.7B</td>
</tr>
<tr>
<td>V 4.6</td>
<td>2026.05</td>
<td>1.3B 极致效率, 混合 4x/16x 视觉压缩</td>
<td>1.3B</td>
</tr>
</tbody></table>
<h3 id="6-2-dc-mllm-stdw">6.2 端侧 MLLM 生态定位</h3>
<p>2025 年的端侧 MLLM 生态可以按参数规模和效率分为三个层级:</p>
<table>
<thead>
<tr>
<th>层级</th>
<th>代表模型</th>
<th>参数规模</th>
<th>部署场景</th>
</tr>
</thead>
<tbody><tr>
<td>高性能</td>
<td>MiniCPM-V 4.5, Qwen2.5-VL 7B</td>
<td>7-9B</td>
<td>桌面/高端移动端</td>
</tr>
<tr>
<td><strong>平衡型</strong></td>
<td><strong>MiniCPM-V 4.0</strong></td>
<td><strong>4.1B</strong></td>
<td><strong>主流中端移动端</strong></td>
</tr>
<tr>
<td>极致效率</td>
<td>MiniCPM-V 4.6, Qwen3.5-VL 0.8B</td>
<td>0.8-1.3B</td>
<td>全端侧(含旧设备)</td>
</tr>
</tbody></table>
<p>MiniCPM-V 4.0 的独特 niche 在于:<strong>它是当前端侧 MLLM 中「性能-效率比」最优的平衡点</strong>。4.1B 的参数量使其在主流中端设备(6GB+ RAM)上可流畅运行,同时 69.0 的 OpenCompass 分数确保了其在实际应用中的可用性。对于需要在「足够好用」和「足够轻量」之间取平衡的开发者,V 4.0 是比 V 4.5(更强但更慢)和 V 4.6(更轻但更弱)更务实的选择。</p>
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
<td>1 模型概述</td>
<td>同时处理文本、图像、视频等多种模态的 LLM</td>
</tr>
<tr>
<td>OpenCompass</td>
<td>-</td>
<td>2.1 图像理解</td>
<td>开源多模态模型综合评测框架,覆盖 8+ 基准</td>
</tr>
<tr>
<td>OCRBench</td>
<td>-</td>
<td>2.3 OCR 与文档解析</td>
<td>光学字符识别基准测试</td>
</tr>
<tr>
<td>mmproj</td>
<td>multimodal projector</td>
<td>3.2 端侧部署优化</td>
<td>视觉编码器与 LLM 之间的投影层权重</td>
</tr>
<tr>
<td>GGUF</td>
<td>-</td>
<td>5.2 移动端部署</td>
<td>llama.cpp 使用的模型格式,支持多种量化级别</td>
</tr>
<tr>
<td>Q4_K_M</td>
<td>-</td>
<td>3.2 端侧部署优化</td>
<td>4-bit 量化的一种变体,K-quant 方法,兼顾质量和速度</td>
</tr>
<tr>
<td>FP16</td>
<td>half precision, 半精度浮点</td>
<td>3.2 端侧部署优化</td>
<td>16-bit 浮点数格式,精度高于量化但体积更大</td>
</tr>
<tr>
<td>ViT</td>
<td>Vision Transformer</td>
<td>3.1 模型规格</td>
<td>基于 Transformer 架构的视觉编码器</td>
</tr>
<tr>
<td>SigLip</td>
<td>-</td>
<td>3.1 模型规格</td>
<td>Google 开源的对比学习视觉编码器,支持图像-文本对齐</td>
</tr>
<tr>
<td>LLaVA-UHD</td>
<td>-</td>
<td>2.2 多图理解与视频理解</td>
<td>高分辨率图像处理策略,将大图切分为多个切片</td>
</tr>
</tbody></table>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-mxgs","text":"1 模型概述"},{"level":2,"id":"2-hxnl","text":"2 核心能力"},{"level":3,"id":"2-1-txlj","text":"2.1 图像理解"},{"level":3,"id":"2-2-dtljysplj","text":"2.2 多图理解与视频理解"},{"level":3,"id":"2-3-ocr-ywdjx","text":"2.3 OCR 与文档解析"},{"level":2,"id":"3-jgyxs","text":"3 架构与效率"},{"level":3,"id":"3-1-mxgg","text":"3.1 模型规格"},{"level":3,"id":"3-2-dcbsyh","text":"3.2 端侧部署优化"},{"level":2,"id":"4-pgjg","text":"4 评估结果"},{"level":3,"id":"4-1-open-compass-zhpc","text":"4.1 OpenCompass 综合评测"},{"level":3,"id":"4-2-yxlmxdxnyj","text":"4.2 与系列模型的性能演进"},{"level":2,"id":"5-tlybs","text":"5 推理与部署"},{"level":3,"id":"5-1-kjzc","text":"5.1 框架支持"},{"level":3,"id":"5-2-yddbs","text":"5.2 移动端部署"},{"level":2,"id":"6-mxpxdw","text":"6 模型谱系定位"},{"level":3,"id":"6-1-mini-cpm-v-xlyj","text":"6.1 MiniCPM-V 系列演进"},{"level":3,"id":"6-2-dc-mllm-stdw","text":"6.2 端侧 MLLM 生态定位"},{"level":2,"id":"fl-a-syb","text":"附录 A: 术语表"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/13-mini-cpm-v-4.0/01-mini-cpm-v-4.0-jsbgjy" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/13-mini-cpm-v-4.0/01-mini-cpm-v-4.0-jsbgjy" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V-4.0 技术报告精译</h1>
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
