"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V-4.0 端侧多模态模型的内存与计算优化</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本文件为 MiniCPM-V 4.0 的深度技术解析,聚焦端侧多模态大语言模型(MLLM)在内存占用和计算效率方面的工程优化策略。
对应精译文档: <code>14.18-MiniCPM/13-MiniCPM-V-4.0/01-MiniCPM-V-4.0-技术报告精译.md</code></p>
</blockquote>
<hr>
<h2 id="1-dc-mllm-dxskj">1 端侧 MLLM 的效率困境</h2>
<p>多模态大语言模型(MLLM)在端侧部署时面临一个双重效率困境: <strong>视觉编码器</strong>和<strong>语言模型</strong>各自都是资源消耗大户,而两者的叠加使问题更加严重。</p>
<p>以一个典型的 MLLM 推理流程为例:</p>
<pre><code>输入图像 → 视觉编码器(ViT) → 视觉投影层 → 与文本 token 拼接 → LLM 推理
</code></pre>
<p>在这个流程中,资源消耗分布在三个环节:</p>
<table>
<thead>
<tr>
<th>环节</th>
<th>主要开销</th>
<th>端侧约束</th>
</tr>
</thead>
<tbody><tr>
<td>视觉编码</td>
<td>ViT 前向传播, 计算密集型</td>
<td>移动设备 NPU/GPU 算力有限</td>
</tr>
<tr>
<td>视觉投影</td>
<td>线性层/交叉注意力, 内存密集型</td>
<td>新增权重增加模型体积</td>
</tr>
<tr>
<td>LLM 推理</td>
<td>自注意力 + FFN, 计算+内存双重密集</td>
<td>KV Cache 随序列长度线性增长</td>
</tr>
</tbody></table>
<p>MiniCPM-V 4.0 的解决思路是「系统性压缩」——不是单独优化某一个环节,而是在视觉编码、模型体积和推理内存三个维度上同时做减法,使总资源占用落入端侧设备的可接受范围内。</p>
<hr>
<h2 id="2-sjbmqdxsyh">2 视觉编码器的效率优化</h2>
<h3 id="2-1-sj-token-dslzz">2.1 视觉 Token 的数量战争</h3>
<p>MLLM 的效率瓶颈很大程度上取决于「一张图产生多少视觉 token」。视觉 token 数量直接影响:</p>
<ul>
<li><strong>预填充(prefill)时间</strong>: 视觉 token 需要与文本 token 一起参与自注意力计算,token 越多,prefill 越长;</li>
<li><strong>KV Cache 占用</strong>: 每个视觉 token 都对应一组 Key 和 Value,存储在 KV Cache 中;</li>
<li><strong>上下文窗口消耗</strong>: 视觉 token 挤占了文本 token 的可用空间。</li>
</ul>
<p>业界主流方案的视觉 token 数量对比:</p>
<table>
<thead>
<tr>
<th>模型</th>
<th>视觉编码器</th>
<th>448x448 图像的 token 数</th>
<th>压缩策略</th>
</tr>
</thead>
<tbody><tr>
<td>LLaVA-1.5</td>
<td>CLIP ViT-L/14</td>
<td>256</td>
<td>无压缩</td>
</tr>
<tr>
<td>Qwen2.5-VL</td>
<td>ViT + MLP</td>
<td>256</td>
<td>Pixel Unshuffle</td>
</tr>
<tr>
<td>InternVL2</td>
<td>InternViT + MLP</td>
<td>256</td>
<td>Pixel Unshuffle</td>
</tr>
<tr>
<td>MiniCPM-V 2.6</td>
<td>SigLip-400M + Resampler</td>
<td>64 (约 4x 压缩)</td>
<td>Resampler 交叉注意力</td>
</tr>
<tr>
<td><strong>MiniCPM-V 4.0</strong></td>
<td><strong>未公开</strong></td>
<td><strong>未公开</strong></td>
<td><strong>推测沿用 Resampler 架构</strong></td>
</tr>
</tbody></table>
<p>Resampler 是一种通过可学习查询(learnable queries)将变长视觉特征压缩为固定长度序列的模块。与 MLP + Pixel Unshuffle 方案相比,Resampler 的优势在于可以通过调整查询数量灵活控制压缩率——MiniCPM-V 2.6 用 64 个查询实现了 4x 压缩,V 4.0 很可能沿用这一策略。</p>
<blockquote>
<p>Resampler 的压缩是有代价的。交叉注意力的计算复杂度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msub><mi>n</mi><mrow><mi>q</mi><mi>u</mi><mi>e</mi><mi>r</mi><mi>y</mi></mrow></msub><mo>×</mo><msub><mi>n</mi><mrow><mi>p</mi><mi>a</mi><mi>t</mi><mi>c</mi><mi>h</mi></mrow></msub><mo>×</mo><mi>d</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(n_{query} \\times n_{patch} \\times d)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8694em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">d</span><span class="mclose">)</span></span></span></span>,其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>q</mi><mi>u</mi><mi>e</mi><mi>r</mi><mi>y</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{query}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是查询数量(如 64),<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>p</mi><mi>a</mi><mi>t</mi><mi>c</mi><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{patch}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span> 是图像块数量(如 256),<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi></mrow><annotation encoding="application/x-tex">d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 是特征维度。虽然 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>n</mi><mrow><mi>q</mi><mi>u</mi><mi>e</mi><mi>r</mi><mi>y</mi></mrow></msub><mo>&lt;</mo><msub><mi>n</mi><mrow><mi>p</mi><mi>a</mi><mi>t</mi><mi>c</mi><mi>h</mi></mrow></msub></mrow><annotation encoding="application/x-tex">n_{query} &lt; n_{patch}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8252em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">er</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">&lt;</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">p</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">c</span><span class="mord mathnormal mtight">h</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>,但 Resampler 仍然需要一次性处理整张图像的所有 patch,这在端侧设备上仍然是一个不小的计算负担。此外,Resampler 引入了额外的可训练参数(查询向量和投影矩阵),增加了模型体积。从工程角度看,Resampler 是「用少量额外参数和计算换取大量 KV Cache 节省」的经典权衡。</p>
</blockquote>
<h3 id="2-2-gfbstxdclcl">2.2 高分辨率图像的处理策略</h3>
<p>端侧 MLLM 面临的另一个挑战是<strong>高分辨率图像</strong>。用户上传的照片通常是 1920x1080 甚至更高,而视觉编码器的预训练分辨率通常只有 224x224 或 448x448。直接缩放会丢失细节,原分辨率编码会产生过多 token。</p>
<p>MiniCPM-V 系列从 V 2.5 开始采用 <strong>LLaVA-UHD</strong> 图像分区策略:</p>
<ol>
<li>根据输入图像的分辨率,估算最优切片数量;</li>
<li>选择一种网格划分方式(如 1x2、2x2、2x3 等),使每片的分辨率尽可能接近视觉编码器的预训练设置;</li>
<li>对每片分别进行视觉编码,然后将所有片的特征拼接起来。</li>
</ol>
<p>这种策略的关键优势是<strong>保留了高分辨率图像的细节</strong>,同时<strong>避免了单张超大图的 token 爆炸</strong>。例如,一张 1344x1344 的图像如果用 448x448 的切片,会产生 3x3=9 片,每片 256 个 token(无压缩时),总计 2304 个 token。但如果使用 Resampler 压缩到每片 64 个 token,则总计只有 576 个 token,在 4K 上下文窗口中仍然留有很大余量给文本。</p>
<blockquote>
<p>LLaVA-UHD 策略有一个隐含的工程假设: 图像的不同区域通常是「局部相关」的,即左上角的细节与右下角的细节在语义上相对独立。这个假设对大多数自然照片成立,但对某些特殊场景(如全景图、长卷轴文档)可能失效——切片边界处的信息断裂会影响模型对整体布局的理解。MiniCPM-V 4.0 在 OCR 和文档解析任务上的强势表现说明,团队可能在 LLaVA-UHD 基础上做了额外的优化,比如在切片间引入位置编码的连续性,或针对文本密集的文档设计了特殊的切片策略。</p>
</blockquote>
<hr>
<h2 id="3-mxtjdyscl">3 模型体积的压缩策略</h2>
<h3 id="3-1-hhjdlh">3.1 混合精度量化</h3>
<p>MiniCPM-V 4.0 的端侧部署采用了一种<strong>混合精度量化</strong>策略:</p>
<table>
<thead>
<tr>
<th>组件</th>
<th>精度</th>
<th>体积</th>
<th>量化原因</th>
</tr>
</thead>
<tbody><tr>
<td>LLM</td>
<td>Q4_K_M (~4-bit)</td>
<td>~2.0 GB</td>
<td>参数量最大,量化收益最高</td>
</tr>
<tr>
<td>视觉投影层(mmproj)</td>
<td>FP16</td>
<td>~0.9 GB</td>
<td>精度敏感,量化导致感知质量下降</td>
</tr>
<tr>
<td>ViT 视觉编码器</td>
<td>FP16</td>
<td>包含在 mmproj 中</td>
<td>同上</td>
</tr>
</tbody></table>
<p><strong>为什么 LLM 可以激进量化,而视觉组件不行？</strong></p>
<p>语言模型对量化的容忍度较高,原因在于:</p>
<ul>
<li>LLM 的权重分布相对均匀,4-bit 量化后的信息损失可以通过激活的动态范围补偿;</li>
<li>LLM 的推理是「序列生成」任务,单步的微小误差不会累积为显著的质量下降;</li>
<li>Q4_K_M 采用了分组量化和混合精度策略,对异常值(outliers)有特殊处理。</li>
</ul>
<p>视觉组件对量化的敏感度更高:</p>
<ul>
<li>ViT 的特征表示需要保留图像的细节信息(边缘、纹理、颜色),低精度量化会导致特征空间的「模糊化」;</li>
<li>视觉投影层直接决定了 LLM 能「看到」什么,投影质量下降会导致幻觉增加;</li>
<li>在 OCR 任务中,字符级别的细节识别对特征精度要求极高。</li>
</ul>
<blockquote>
<p>混合精度量化的一个有趣观察是: mmproj 的 FP16 精度使视觉组件的体积(~0.9GB)接近甚至超过 Q4 量化后的 LLM(~2.0GB 的 45%)。这意味着在 MLLM 的端侧部署中,「视觉部分」并不是可以忽略的小开销。未来如果视觉编码器也能实现高质量量化(比如针对 ViT 设计的专用 8-bit 量化方案),端侧 MLLM 的总体积还有进一步压缩的空间。</p>
</blockquote>
<h3 id="3-2-sxwcky-kv-cache-gl">3.2 上下文窗口与 KV Cache 管理</h3>
<p>MiniCPM-V 4.0 的默认上下文窗口为 <strong>4K tokens</strong>。这个设置看似保守,但实际上是端侧部署的理性选择:</p>
<p>KV Cache 的内存占用公式:</p>
<span class="katex-error" title="ParseError: KaTeX parse error: Expected &#x27;EOF&#x27;, got &#x27;_&#x27; at position 99: …mes \\text{bytes_̲per_param}" style="color:#cc0000">\\text{KV Cache} = 2 \\times n_{layers} \\times d_{head} \\times n_{heads} \\times L \\times \\text{bytes_per_param}</span><p>对于 4.1B 的模型,假设 32 层、32 个注意力头、head 维度 128、FP16 精度:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>KV Cache</mtext><mo>=</mo><mn>2</mn><mo>×</mo><mn>32</mn><mo>×</mo><mn>128</mn><mo>×</mo><mn>32</mn><mo>×</mo><mn>4096</mn><mo>×</mo><mn>2</mn><mtext> bytes</mtext><mo>≈</mo><mn>2.1</mn><mtext> GB</mtext></mrow><annotation encoding="application/x-tex">\\text{KV Cache} = 2 \\times 32 \\times 128 \\times 32 \\times 4096 \\times 2 \\text{ bytes} \\approx 2.1 \\text{ GB}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord text"><span class="mord">KV Cache</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">128</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">32</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">2</span><span class="mord text"><span class="mord"> bytes</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord">2.1</span><span class="mord text"><span class="mord"> GB</span></span></span></span></span></span><p>这 2.1 GB 的 KV Cache 加上模型权重(~2.9 GB)和激活值(~0.5 GB),总内存占用约为 5.5 GB,恰好落在 6 GB 设备的可用内存上限边缘。如果将上下文扩展到 8K,KV Cache 将翻倍至 4.2 GB,总占用超过 7 GB,对 6 GB 设备来说已经不可行。</p>
<blockquote>
<p>4K 上下文窗口对于纯文本任务来说非常紧张,但对于视觉-语言任务来说通常够用。一张图片经过压缩后产生 64-576 个视觉 token,剩余的 3400+ token 足够容纳多轮对话和中等长度的回答。真正受限的场景是「多图长对话」和「视频理解」——前者因为每张图都消耗视觉 token,后者因为视频帧数多。MiniCPM-V 4.0 的 4K 窗口实际上隐含了一个产品定位: 它更适合「单图短对话」和「少量图片的中等对话」,而不是「批量图像分析」或「长视频理解」。</p>
</blockquote>
<hr>
<h2 id="4-yddbsdgctz">4 移动端部署的工程挑战</h2>
<h3 id="4-1-ios-bsdtsx">4.1 iOS 部署的特殊性</h3>
<p>面壁智能为 MiniCPM-V 4.0 提供了完整的 iOS 部署方案,这在开源 MLLM 社区中并不常见。iOS 部署面临以下特殊挑战:</p>
<p><strong>内存限制</strong>: iOS 对单个应用的内存使用有严格限制。在旧款 iPhone(6GB RAM)上,应用通常只能使用 2-3GB 内存,超出后会被系统强制终止。MiniCPM-V 4.0 的 5.5GB 总内存需求意味着它只能运行在新款设备(iPhone 15 Pro 及以后,8GB RAM)上。</p>
<p><strong>Metal 性能</strong>: iOS 的 GPU 计算通过 Metal 框架实现。llama.cpp 的 Metal 后端对 MLLM 的支持仍在完善中,特别是视觉编码器的 Metal 内核优化是一个活跃的开源贡献领域。</p>
<p><strong>App Store 审核</strong>: 2.9GB 的模型文件可以通过 App Store 的「按需下载资源」(On-Demand Resources)或首次启动时从服务器下载来解决,但这引入了网络依赖,与「纯端侧」的理念相矛盾。</p>
<h3 id="4-2-yyd-mllm-djgcy">4.2 与云端 MLLM 的架构差异</h3>
<p>端侧 MLLM 和云端 MLLM 在架构选择上有系统性差异:</p>
<table>
<thead>
<tr>
<th>维度</th>
<th>云端 MLLM (如 GPT-4o)</th>
<th>端侧 MLLM (如 MiniCPM-V 4.0)</th>
</tr>
</thead>
<tbody><tr>
<td>视觉编码器</td>
<td>大 ViT(&gt;1B 参数), 高分辨率</td>
<td>小 ViT(~400M), 中分辨率</td>
</tr>
<tr>
<td>视觉压缩</td>
<td>可选(算力充足时可直接用全 token)</td>
<td>强制(必须压缩到 &lt;1000 token)</td>
</tr>
<tr>
<td>LLM 规模</td>
<td>数百 B</td>
<td>数 B</td>
</tr>
<tr>
<td>量化策略</td>
<td>FP16/BF16(算力充足)</td>
<td>INT4/INT8(内存受限)</td>
</tr>
<tr>
<td>上下文长度</td>
<td>128K+</td>
<td>4K-32K</td>
</tr>
<tr>
<td>批处理</td>
<td>大 batch, 高吞吐</td>
<td>单用户, 低延迟</td>
</tr>
</tbody></table>
<p>这种差异不是「端侧模型做小了」,而是「端侧模型重新设计了」。云端模型追求的是「在固定成本下最大化能力」,端侧模型追求的是「在固定资源约束下最大化可用性」。两个目标的优化方向完全不同。</p>
<hr>
<h2 id="5-ytldc-mllm-ddb">5 与同类端侧 MLLM 的对比</h2>
<h3 id="5-1-csxsdb">5.1 参数效率对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>LLM 参数</th>
<th>视觉编码器</th>
<th>总模型体积(Q4)</th>
<th>OpenCompass</th>
<th>每分性能所需体积</th>
</tr>
</thead>
<tbody><tr>
<td>Qwen2.5-VL-3B</td>
<td>3B</td>
<td>约 400M</td>
<td>~1.8 GB</td>
<td>~62</td>
<td>29 MB/分</td>
</tr>
<tr>
<td><strong>MiniCPM-V 4.0</strong></td>
<td><strong>4.1B</strong></td>
<td><strong>约 400M</strong></td>
<td><strong>~2.9 GB</strong></td>
<td><strong>69.0</strong></td>
<td><strong>42 MB/分</strong></td>
</tr>
<tr>
<td>MiniCPM-V 4.5</td>
<td>8B</td>
<td>约 400M</td>
<td>~5.0 GB</td>
<td>77.0</td>
<td>65 MB/分</td>
</tr>
<tr>
<td>Qwen2.5-VL-7B</td>
<td>7B</td>
<td>约 400M</td>
<td>~4.2 GB</td>
<td>~71</td>
<td>59 MB/分</td>
</tr>
</tbody></table>
<blockquote>
<p>「每分性能所需体积」是一个我自创的指标,用来衡量模型的「参数效率」。从这张表可以看出,MiniCPM-V 4.0 的参数效率(42 MB/分)优于 Qwen2.5-VL-7B(59 MB/分)和 MiniCPM-V 4.5(65 MB/分),但不如 Qwen2.5-VL-3B(29 MB/分)。这说明 3B 规模可能是当前端侧 MLLM 的「甜蜜点」——但 3B 模型的能力上限(62 分)可能无法满足很多实际应用的需求。MiniCPM-V 4.0 的 4.1B + 69 分组合,在「足够好用」和「足够轻量」之间取了一个务实的平衡。</p>
</blockquote>
<h3 id="5-2-bsyhddb">5.2 部署友好度对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>iOS 原生支持</th>
<th>Android 支持</th>
<th>开源 Demo App</th>
<th>推荐 RAM</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 4.0</td>
<td>✅ 官方 Xcode 项目</td>
<td>✅</td>
<td>✅</td>
<td>6GB</td>
</tr>
<tr>
<td>Qwen2.5-VL-3B</td>
<td>❌(社区适配)</td>
<td>✅</td>
<td>❌</td>
<td>未公开</td>
</tr>
<tr>
<td>Gemma 3 4B-IT</td>
<td>❌</td>
<td>✅</td>
<td>❌</td>
<td>未公开</td>
</tr>
<tr>
<td>Phi-4-multimodal</td>
<td>❌</td>
<td>✅</td>
<td>❌</td>
<td>未公开</td>
</tr>
</tbody></table>
<p>MiniCPM-V 4.0 在「开发者友好度」上的优势非常明显。官方提供的 iOS Demo App 不仅是「能用」的证明,更是一个完整的产品化参考——开发者可以直接基于这个 Xcode 项目构建自己的端侧视觉应用,而不需要从零解决模型转换、推理集成和 UI 开发等问题。</p>
<hr>
<h2 id="6-jxywlfx">6 局限与未来方向</h2>
<h3 id="6-1-dqjx">6.1 当前局限</h3>
<ul>
<li><strong>上下文长度</strong>: 4K 的默认窗口限制了多图对话和视频理解的深度;</li>
<li><strong>视频帧率</strong>: 端侧设备的算力约束意味着视频理解需要大幅降低帧率和分辨率;</li>
<li><strong>语言覆盖</strong>: 官方未明确公开 V 4.0 的多语言能力,继承自 V 2.6 的 30+ 语言支持可能需要验证;</li>
<li><strong>量化精度</strong>: Q4_K_M 虽然在大多数任务上表现良好,但在需要精细数值推理的场景(如图表数据分析)中可能出现精度损失。</li>
</ul>
<h3 id="6-2-wlyjfx">6.2 未来演进方向</h3>
<ul>
<li><strong>视觉编码器轻量化</strong>: 用更小的 ViT(如 SigLIP2-100M 甚至更轻)替代 400M 的 ViT,进一步压缩视觉部分;</li>
<li><strong>动态分辨率</strong>: 根据输入图像的复杂度自动调整编码分辨率,简单图像用低分辨率、复杂图像用高分辨率;</li>
<li><strong>端侧投机解码</strong>: 利用视觉-语言任务中常见的重复模式(如 OCR 中的固定句式)加速生成;</li>
<li><strong>跨模态缓存复用</strong>: 在视频理解中复用相邻帧的视觉特征,避免每帧都重新编码。</li>
</ul>
<hr>
<blockquote>
<p><strong>双向同步声明</strong></p>
<p>本文档为 <code>14.18-MiniCPM/13-MiniCPM-V-4.0/05-MiniCPM-V-4.0-端侧多模态模型的内存与计算优化.md</code> 的知识库同步版本。
源文件更新日期: 2025-05-22
如需查看最新版本,请访问源文件所在目录。</p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-dc-mllm-dxskj","text":"1 端侧 MLLM 的效率困境"},{"level":2,"id":"2-sjbmqdxsyh","text":"2 视觉编码器的效率优化"},{"level":3,"id":"2-1-sj-token-dslzz","text":"2.1 视觉 Token 的数量战争"},{"level":3,"id":"2-2-gfbstxdclcl","text":"2.2 高分辨率图像的处理策略"},{"level":2,"id":"3-mxtjdyscl","text":"3 模型体积的压缩策略"},{"level":3,"id":"3-1-hhjdlh","text":"3.1 混合精度量化"},{"level":3,"id":"3-2-sxwcky-kv-cache-gl","text":"3.2 上下文窗口与 KV Cache 管理"},{"level":2,"id":"4-yddbsdgctz","text":"4 移动端部署的工程挑战"},{"level":3,"id":"4-1-ios-bsdtsx","text":"4.1 iOS 部署的特殊性"},{"level":3,"id":"4-2-yyd-mllm-djgcy","text":"4.2 与云端 MLLM 的架构差异"},{"level":2,"id":"5-ytldc-mllm-ddb","text":"5 与同类端侧 MLLM 的对比"},{"level":3,"id":"5-1-csxsdb","text":"5.1 参数效率对比"},{"level":3,"id":"5-2-bsyhddb","text":"5.2 部署友好度对比"},{"level":2,"id":"6-jxywlfx","text":"6 局限与未来方向"},{"level":3,"id":"6-1-dqjx","text":"6.1 当前局限"},{"level":3,"id":"6-2-wlyjfx","text":"6.2 未来演进方向"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/13-mini-cpm-v-4.0/05-mini-cpm-v-4.0-dcdmtmxdncyjsyh" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/13-mini-cpm-v-4.0/05-mini-cpm-v-4.0-dcdmtmxdncyjsyh" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V-4.0 端侧多模态模型的内存与计算优化</h1>
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
