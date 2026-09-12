"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>MiniCPM-V 2.0 核心技术专题：端侧多模态架构与自适应高分辨率视觉编码</h1>
<blockquote>
<p>🔙 <strong><a href="#broken-link">返回 14.18-MiniCPM 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>本专题基于 MiniCPM-V 系列技术报告(arXiv:2408.01800)及官方技术博客深度解析.
聚焦 V 2.0 的架构设计与工程实现, 不涉及后续 V 2.5/2.6 的升级内容.</p>
</blockquote>
<hr>
<h2 id="1-wtbj-dcdmtdszkj">1. 问题背景：端侧多模态的三重困境</h2>
<p>将多模态大语言模型(MLLM)部署到端侧设备(手机、平板、边缘计算盒)面临三个互相纠缠的工程难题:</p>
<p><strong>困境一：视觉 token 数量爆炸</strong></p>
<p>标准 ViT(Vision Transformer)将输入图像切分为 14x14 像素的 patch. 一张 1344x1344 的高清图像会产生:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mn>1344</mn><mn>14</mn></mfrac><mo>×</mo><mfrac><mn>1344</mn><mn>14</mn></mfrac><mo>=</mo><mn>96</mn><mo>×</mo><mn>96</mn><mo>=</mo><mn>9216</mn><mtext> 个 patch tokens</mtext></mrow><annotation encoding="application/x-tex">\\frac{1344}{14} \\times \\frac{1344}{14} = 96 \\times 96 = 9216 \\text{ 个 patch tokens}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">14</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1344</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">14</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1344</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">96</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">96</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">9216</span><span class="mord text"><span class="mord"> </span><span class="mord cjk_fallback">个</span><span class="mord"> patch tokens</span></span></span></span></span></span><p>加上特殊的 CLS token, 总计约 9,217 个视觉 token. 作为对比, 一个典型的文本查询可能只有 50-100 个 token. 视觉 token 的数量是文本的 50-100 倍, 导致:</p>
<ul>
<li>Self-attention 的计算复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mo stretchy="false">(</mo><msub><mi>T</mi><mrow><mi>t</mi><mi>e</mi><mi>x</mi><mi>t</mi></mrow></msub><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O((T_{text})^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">((</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">x</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 膨胀到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mo stretchy="false">(</mo><msub><mi>T</mi><mrow><mi>t</mi><mi>e</mi><mi>x</mi><mi>t</mi></mrow></msub><mo>+</mo><msub><mi>T</mi><mrow><mi>v</mi><mi>i</mi><mi>s</mi><mi>u</mi><mi>a</mi><mi>l</mi></mrow></msub><msup><mo stretchy="false">)</mo><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O((T_{text} + T_{visual})^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">((</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.2806em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">t</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight">x</span><span class="mord mathnormal mtight">t</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">T</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span><span class="mord mathnormal mtight">i</span><span class="mord mathnormal mtight">s</span><span class="mord mathnormal mtight">u</span><span class="mord mathnormal mtight">a</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose"><span class="mclose">)</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span></li>
<li>KV Cache 的显存占用中, 视觉部分占 90% 以上</li>
<li>首 token 延迟(latency)被视觉编码主导</li>
</ul>
<p><strong>困境二：长宽比失配</strong></p>
<p>ViT 的预训练图像通常是 224x224 或 336x336 的正方形. 真实世界的图像长宽比各异: 手机竖拍照片(3:4)、全景图(1:3)、文档扫描(A4 纸约 1:1.414). 传统做法是将所有图像 resize 到正方形, 导致:</p>
<ul>
<li>宽图被压扁、窄图被拉伸, 内容严重畸变</li>
<li>文字(尤其是横向排列的文本行)在压缩后难以识别</li>
<li>小物体在多轮 resize 中可能完全消失</li>
</ul>
<p><strong>困境三：分辨率与效率的不可兼得</strong></p>
<p>高分辨率意味着更小的 patch(每个 patch 覆盖的像素更少), 可以保留更细粒度的视觉信息(如小字、纹理). 但分辨率每翻倍, patch 数量就翻 4 倍, 计算成本也翻 4 倍. 在端侧设备的有限算力下, 如何在&quot;看得清&quot;和&quot;跑得动&quot;之间取得平衡?</p>
<p>MiniCPM-V 2.0 的解决方案是: <strong>LLaVA-UHD 自适应视觉编码 + Perceiver Resampler token 压缩 + 三阶段渐进训练</strong>.</p>
<hr>
<h2 id="2-zsysjbm-l-la-va-uhd">2. 自适应视觉编码：LLaVA-UHD</h2>
<h3 id="2-1-hxsx">2.1 核心思想</h3>
<p>LLaVA-UHD 的核心洞察是: <strong>不要将整张图像强行塞入 ViT, 而是将图像切分成若干与 ViT 预训练分辨率匹配的切片, 分别编码后再拼接</strong>.</p>
<p>这种方法同时解决了三个问题:</p>
<ol>
<li>切片分辨率接近 ViT 预训练设置 → 避免畸变</li>
<li>切片数量根据图像大小自适应调整 → 灵活支持任意分辨率</li>
<li>原始图像作为全局切片额外输入 → 保留全局上下文</li>
</ol>
<h3 id="2-2-txfpsf">2.2 图像分片算法</h3>
<p><strong>Step 1: 计算理想切片数</strong></p>
<p>给定输入图像 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>W</mi><mi>I</mi></msub><mo separator="true">,</mo><msub><mi>H</mi><mi>I</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(W_I, H_I)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 和 ViT 预训练分辨率 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>W</mi><mi>v</mi></msub><mo separator="true">,</mo><msub><mi>H</mi><mi>v</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(W_v, H_v)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>N</mi><mo>=</mo><mrow><mo fence="true">⌈</mo><mfrac><mrow><msub><mi>W</mi><mi>I</mi></msub><mo>×</mo><msub><mi>H</mi><mi>I</mi></msub></mrow><mrow><msub><mi>W</mi><mi>v</mi></msub><mo>×</mo><msub><mi>H</mi><mi>v</mi></msub></mrow></mfrac><mo fence="true">⌉</mo></mrow></mrow><annotation encoding="application/x-tex">N = \\left\\lceil \\frac{W_I \\times H_I}{W_v \\times H_v} \\right\\rceil</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">⌈</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3603em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0785em;">I</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.836em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">⌉</span></span></span></span></span></span></span><p>这个公式的直觉是: 如果图像面积是 ViT 预训练图像面积的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 倍, 理论上需要 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>k</mi></mrow><annotation encoding="application/x-tex">k</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal" style="margin-right:0.0315em;">k</span></span></span></span> 个切片来覆盖全部像素.</p>
<p><strong>Step 2: 搜索最优行列划分</strong></p>
<p>从候选集合中选择行列数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(m, n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span>, 满足 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi><mo>×</mo><mi>n</mi><mo>∈</mo><mo stretchy="false">{</mo><mi>N</mi><mo>−</mo><mn>1</mn><mo separator="true">,</mo><mi>N</mi><mo separator="true">,</mo><mi>N</mi><mo>+</mo><mn>1</mn><mo stretchy="false">}</mo></mrow><annotation encoding="application/x-tex">m \\times n \\in \\{N-1, N, N+1\\}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.5782em;vertical-align:-0.0391em;"></span><span class="mord mathnormal">n</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">{</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord">1</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord">1</span><span class="mclose">}</span></span></span></span>.</p>
<p>评分函数定义为对数长宽比距离:</p>
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
c-10,0,-16.667,5,-20,15z M410 15 H367 v585 v1200 v585 h43z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span></span></span></span></span><p>最优划分为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msup><mi>m</mi><mo>∗</mo></msup><mo separator="true">,</mo><msup><mi>n</mi><mo>∗</mo></msup><mo>=</mo><munder><mrow><mi mathvariant="normal">arg max</mi><mo>⁡</mo></mrow><mrow><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo><mo>∈</mo><mover accent="true"><mi mathvariant="double-struck">C</mi><mo>ˉ</mo></mover></mrow></munder><mi>S</mi><mo stretchy="false">(</mo><mi>m</mi><mo separator="true">,</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">m^*, n^* = \\operatorname*{arg\\,max}_{(m, n) \\in \\bar{\\mathbb{C}}} S(m, n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.9331em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal">m</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">∗</span></span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">n</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7387em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mbin mtight">∗</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.9634em;vertical-align:-1.2134em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.4306em;"><span style="top:-2.0616em;margin-left:0em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">m</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">n</span><span class="mclose mtight">)</span><span class="mrel mtight">∈</span><span class="mord accent mtight"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8257em;"><span style="top:-2.7em;"><span class="pstrut" style="height:2.7em;"></span><span class="mord mathbb mtight">C</span></span><span style="top:-2.9579em;"><span class="pstrut" style="height:2.7em;"></span><span class="accent-body" style="left:-0.25em;"><span class="mord mtight">ˉ</span></span></span></span></span></span></span></span></span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span><span class="mop"><span class="mord mathrm" style="margin-right:0.0139em;">arg</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathrm">max</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2134em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span></span><p><strong>为什么用对数距离?</strong></p>
<p>在线性空间中, 1:2 和 2:1 的距离是 1.5, 2:3 和 3:2 的距离也是 1.5. 但在感知上, 1:2 和 2:1 是完全不同的方向(横向压缩 vs 纵向压缩), 不应该被等同对待. 对数空间中, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><mn>1</mn><mi mathvariant="normal">/</mi><mn>2</mn><mo stretchy="false">)</mo><mo>=</mo><mo>−</mo><mi>log</mi><mo>⁡</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">\\log(1/2) = -\\log 2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mopen">(</span><span class="mord">1/2</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">2</span></span></span></span>, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>log</mi><mo>⁡</mo><mo stretchy="false">(</mo><mn>2</mn><mi mathvariant="normal">/</mi><mn>1</mn><mo stretchy="false">)</mo><mo>=</mo><mi>log</mi><mo>⁡</mo><mn>2</mn></mrow><annotation encoding="application/x-tex">\\log(2/1) = \\log 2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mopen">(</span><span class="mord">2/1</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord">2</span></span></span></span>, 方向信息被保留. 此外, 对数距离对比例因子更敏感——1:1 到 1:2 的感知差异, 与 1:2 到 1:4 的感知差异, 在对数空间中是对称的.</p>
<p><strong>Step 3: 位置编码插值</strong></p>
<p>划分后的切片尺寸通常不完全等于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><msub><mi>W</mi><mi>v</mi></msub><mo separator="true">,</mo><msub><mi>H</mi><mi>v</mi></msub><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(W_v, H_v)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span>. 例如, 一个 3:4 的图像被划分为 2x2 切片后, 每个切片可能是 1.5:2 的比例, 而 ViT 预训练比例是 1:1.</p>
<p>MiniCPM-V 的解决方案是:</p>
<ol>
<li>将切片按比例 resize, 使面积匹配 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>W</mi><mi>v</mi></msub><mo>×</mo><msub><mi>H</mi><mi>v</mi></msub></mrow><annotation encoding="application/x-tex">W_v \\times H_v</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0813em;">H</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0813em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">v</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span></li>
<li>将 ViT 的 1D 位置编码 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mn>1</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>Q</mi><mo>×</mo><mi>l</mi></mrow></msup></mrow><annotation encoding="application/x-tex">P_1 \\in \\mathbb{R}^{Q \\times l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">Q</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span></span></span></span></span></span></span></span> 重塑为 2D 格式 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mn>2</mn></msub><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mi>q</mi><mo>×</mo><mi>q</mi><mo>×</mo><mi>l</mi></mrow></msup></mrow><annotation encoding="application/x-tex">P_2 \\in \\mathbb{R}^{q \\times q \\times l}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0359em;">q</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span></span></span></span></span></span></span></span></span></li>
<li>对 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>P</mi><mn>2</mn></msub></mrow><annotation encoding="application/x-tex">P_2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.1389em;">P</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.1389em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 进行 2D 双线性插值, 匹配切片的实际尺寸</li>
<li>将插值后的 2D 编码展平回 1D, 输入 ViT</li>
</ol>
<p><strong>工程细节</strong>: 2D 插值位置编码比 1D 插值更精细, 因为它同时考虑了水平和垂直方向的相对位置. 实验表明, 2D 插值在极端长宽比(如 1:9 的横幅图)上的性能显著优于 1D 插值.</p>
<h3 id="2-3-kjms-spatial-schema">2.3 空间模式 (Spatial Schema)</h3>
<p>编码后的切片 token 需要让 LLM 理解它们的空间关系. MiniCPM-V 使用特殊 token 构建空间模式:</p>
<pre><code>&lt;slice&gt; [切片 1 的 64 个 token] &lt;/slice&gt; \\n
&lt;slice&gt; [切片 2 的 64 个 token] &lt;/slice&gt; \\n
&lt;slice&gt; [切片 3 的 64 个 token] &lt;/slice&gt; \\n
&lt;slice&gt; [切片 4 的 64 个 token] &lt;/slice&gt;
</code></pre>
<p>其中 <code>&lt;slice&gt;</code> 和 <code>&lt;/slice&gt;</code> 标记切片的边界, <code>\\n</code> 标记行边界(表示换行). 原始图像作为额外的&quot;全局切片&quot;插入到序列开头, 提供全局上下文.</p>
<hr>
<h2 id="3-token-ys-perceiver-resampler">3. Token 压缩：Perceiver Resampler</h2>
<h3 id="3-1-wsmxyys">3.1 为什么需要压缩</h3>
<p>经过 LLaVA-UHD 分片后, 一张 1344x1344 的图像被分为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>N</mi><mo>≈</mo><mn>9</mn></mrow><annotation encoding="application/x-tex">N \\approx 9</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">9</span></span></span></span> 个切片, 每个切片产生 1,024 个 token(含 CLS), 总计约 9,216 个 token. 这对于端侧设备仍然过多.</p>
<p>Perceiver Resampler 的作用是将每个切片的 1,024 个 token 压缩为 64 个 query tokens, 实现约 16:1 的压缩比.</p>
<h3 id="3-2-sxyl">3.2 数学原理</h3>
<p>Perceiver Resampler 本质上是单层 cross-attention:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mtext>Output</mtext><mo>=</mo><mtext>softmax</mtext><mrow><mo fence="true">(</mo><mfrac><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><msqrt><msub><mi>d</mi><mi>k</mi></msub></msqrt></mfrac><mo fence="true">)</mo></mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">\\text{Output} = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord text"><span class="mord">Output</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4684em;vertical-align:-0.95em;"></span><span class="mord text"><span class="mord">softmax</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.5183em;"><span style="top:-2.2528em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8572em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal">d</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0315em;">k</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.8172em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l0 -0
c5.3,-9.3,12,-14,20,-14
H400000v40H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1828em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span></span><p>其中:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mn>64</mn><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">Q \\in \\mathbb{R}^{64 \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">64</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span>: 64 个可学习的 query 向量</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>K</mi><mo separator="true">,</mo><mi>V</mi><mo>∈</mo><msup><mi mathvariant="double-struck">R</mi><mrow><mn>1024</mn><mo>×</mo><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">K, V \\in \\mathbb{R}^{1024 \\times d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">∈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8491em;"></span><span class="mord"><span class="mord mathbb">R</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1024</span><span class="mbin mtight">×</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span>: 来自 ViT 的视觉 token 作为 key 和 value</li>
<li>输出维度: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>64</mn><mo>×</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">64 \\times d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">64</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span></li>
</ul>
<p><strong>信息瓶颈视角</strong>: 64 个 query 相当于 64 个&quot;信息提取器&quot;, 每个负责从 1,024 个视觉 token 中提取特定类型的信息. 这种压缩是有损的——某些细粒度信息会丢失——但实验表明, 对于 MLLM 的理解任务, 64 个 query 足以保留 95% 以上的有效信息.</p>
<h3 id="3-3-ysbdqh">3.3 压缩比的权衡</h3>
<table>
<thead>
<tr>
<th>配置</th>
<th>queries/slice</th>
<th>视觉 token 总数(9 切片)</th>
<th>显存节省</th>
<th>信息损失</th>
</tr>
</thead>
<tbody><tr>
<td>无压缩</td>
<td>1,024</td>
<td>9,216</td>
<td>0%</td>
<td>0%</td>
</tr>
<tr>
<td>V 1.0/2.0</td>
<td>64</td>
<td>576</td>
<td>~94%</td>
<td>低</td>
</tr>
<tr>
<td>V 2.5</td>
<td>96</td>
<td>864</td>
<td>~91%</td>
<td>更低</td>
</tr>
<tr>
<td>极端压缩</td>
<td>16</td>
<td>144</td>
<td>~98%</td>
<td>高</td>
</tr>
</tbody></table>
<p>MiniCPM-V 2.0 选择 64 queries 是一个经过验证的 sweet spot: 在保持 OCR 能力的前提下, 将视觉 token 数量降到与文本 token 同数量级, 使 attention 计算不再被视觉部分主导.</p>
<hr>
<h2 id="4-sjdyxlcl">4. 三阶段预训练策略</h2>
<h3 id="4-1-jdsjdlljc">4.1 阶段设计的理论基础</h3>
<p>MLLM 的预训练面临一个根本矛盾: 视觉模块(编码器 + 压缩层)需要大量数据来对齐到语言空间, 但 LLM 已经在海量文本上预训练过了, 不应该被低质量的图像-文本对&quot;污染&quot;.</p>
<p>MiniCPM-V 的解决方案是<strong>渐进式解锁</strong>: 从简单到复杂, 逐步增加可训练模块和数据难度.</p>
<h3 id="4-2-stage-1-yscyr">4.2 Stage-1：压缩层预热</h3>
<p><strong>目标</strong>: 让随机初始化的 Perceiver Resampler 学会从视觉特征中提取语言模型可理解的信息.</p>
<p><strong>配置</strong>:</p>
<ul>
<li>可训练: 压缩层(Perceiver Resampler)</li>
<li>冻结: 视觉编码器, LLM</li>
<li>分辨率: 224x224(与 SigLIP 预训练一致)</li>
<li>数据: 200M image captioning 数据</li>
</ul>
<p><strong>为什么只训压缩层?</strong></p>
<p>视觉编码器(SigLIP-400M)已经在数十亿图像-文本对上预训练过, 其特征空间已经具有良好的语义区分度. LLM(MiniCPM-2B)也已经在 1T+ token 上预训练过. 唯一需要从零学习的是&quot;如何将视觉特征映射到 LLM 的输入嵌入空间&quot;——这正是压缩层的职责. 如果同时训练视觉编码器, 低质量的 caption 数据可能破坏 SigLIP 已学到的视觉表征.</p>
<h3 id="4-3-stage-2-fbskz">4.3 Stage-2：分辨率扩展</h3>
<p><strong>目标</strong>: 将视觉编码器从 224x224 扩展到 448x448, 为后续高分辨率编码做准备.</p>
<p><strong>配置</strong>:</p>
<ul>
<li>可训练: 视觉编码器</li>
<li>冻结: 压缩层(已预热), LLM</li>
<li>分辨率: 224→448</li>
<li>数据: 200M image captioning 数据</li>
</ul>
<p><strong>为什么分阶段扩展分辨率?</strong></p>
<p>直接以 448x448 或更高分辨率训练会面临两个问题:</p>
<ol>
<li>位置编码需要大幅外推, 训练不稳定</li>
<li>高分辨率 patch 数量多, 训练成本高</li>
</ol>
<p>先以 224x224 预热压缩层(Stage-1), 再扩展到 448x448(Stage-2), 最后引入自适应高分辨率(Stage-3), 是一种稳健的渐进策略.</p>
<h3 id="4-4-stage-3-gfbs-ocr-qh">4.4 Stage-3：高分辨率 + OCR 强化</h3>
<p><strong>目标</strong>: 训练压缩层和视觉编码器适应自适应高分辨率输入, 同时增强 OCR 能力.</p>
<p><strong>配置</strong>:</p>
<ul>
<li>可训练: 压缩层 + 视觉编码器</li>
<li>冻结: LLM</li>
<li>分辨率: 自适应(up to 1.8M px)</li>
<li>数据: image captioning + OCR 数据</li>
</ul>
<p><strong>为什么 Stage-3 引入 OCR 数据?</strong></p>
<p>高分辨率编码的主要收益领域是细粒度视觉任务, 尤其是 OCR. 在 Stage-1 和 Stage-2, 模型学习的是&quot;图像中有哪些物体、场景是什么&quot;等粗粒度语义. 在 Stage-3, 通过引入 DocVQA、TextVQA、OCR-VQA 等数据, 模型学会&quot;图像中的文字是什么、文字之间的关系是什么、如何从图像中提取结构化文本&quot;. 这是 V 2.0 相比 V 1.0 OCRBench 从 366 跃升到 605 的关键.</p>
<h3 id="4-5-caption-rewriting-sjzlzq">4.5 Caption Rewriting：数据质量增强</h3>
<p>网络爬取的 image caption 普遍存在质量问题: 语法错误、内容不连贯、关键词堆砌. 低质量 caption 会导致训练动态不稳定(loss 震荡、收敛慢).</p>
<p>MiniCPM-V 的 Caption Rewriting 流程:</p>
<ol>
<li>用 GPT-4 标注少量高质量种子样本(原始 caption → 高质量 caption 的映射)</li>
<li>用种子样本微调一个 LLM 作为 rewriter</li>
<li>rewriter 对所有预训练数据进行重写</li>
<li>重写后的 caption 作为最终训练数据</li>
</ol>
<p><strong>效果</strong>: 虽然论文没有给出消融实验, 但这个流程的成本-收益比很高——一次性的 rewriter 训练(约 1 GPU 天)可以提升数百万条数据的质量.</p>
<h3 id="4-6-data-packing-xlxsyh">4.6 Data Packing：训练效率优化</h3>
<p>标准训练中的一个隐藏成本: 批次内样本长度差异导致大量 padding token.</p>
<p>假设批次大小为 32, 其中 16 个样本长度为 100, 16 个样本长度为 500. 统一 pad 到 500 后, 有效 token 比例为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mfrac><mrow><mn>16</mn><mo>×</mo><mn>100</mn><mo>+</mo><mn>16</mn><mo>×</mo><mn>500</mn></mrow><mrow><mn>32</mn><mo>×</mo><mn>500</mn></mrow></mfrac><mo>=</mo><mfrac><mn>9600</mn><mn>16000</mn></mfrac><mo>=</mo><mn>60</mn><mi mathvariant="normal">%</mi></mrow><annotation encoding="application/x-tex">\\frac{16 \\times 100 + 16 \\times 500}{32 \\times 500} = \\frac{9600}{16000} = 60\\%</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:2.0908em;vertical-align:-0.7693em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">32</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">500</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">16</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">100</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">16</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord">500</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.7693em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0074em;vertical-align:-0.686em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">16000</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">9600</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8056em;vertical-align:-0.0556em;"></span><span class="mord">60%</span></span></span></span></span><p>即 40% 的 GPU 算力浪费在 padding 上.</p>
<p>Data Packing 的解决方案:</p>
<ol>
<li>将多个短样本拼接成一个长序列(目标长度固定)</li>
<li>最后一个样本可能需要在边界处截断</li>
<li>修改 position ids 和 attention mask, 确保不同样本之间没有信息泄漏</li>
</ol>
<p><strong>效果</strong>: 论文报告 2<del>3 倍加速. 这意味着同样的计算预算可以多训练 2</del>3 倍的数据, 或者训练时间缩短到 1/3.</p>
<hr>
<h2 id="5-dmtdq-rlhf-v">5. 多模态对齐：RLHF-V</h2>
<h3 id="5-1-dmthjdbz">5.1 多模态幻觉的本质</h3>
<p>MLLM 的幻觉表现为: 模型描述图像中不存在的对象、错误地报告对象属性、或虚构对象之间的关系. 与文本幻觉不同, 多模态幻觉更容易被用户发现(用户可以直接看图验证), 因此在实际应用中危害更大.</p>
<h3 id="5-2-rlhf-v-dhxcx-yzsmfj">5.2 RLHF-V 的核心创新：原子声明分解</h3>
<p>传统 RLHF 对整个响应打偏好分数(好/坏), 粒度太粗. 一个响应可能包含 10 个声明, 其中 9 个正确、1 个错误, 粗粒度反馈无法定位错误.</p>
<p>RLHF-V 的创新:</p>
<ol>
<li><strong>分解</strong>: 将响应分解为原子声明(atomic claims)<ul>
<li>例: &quot;图中有一只黑猫坐在椅子上&quot; → [&quot;图中有一只猫&quot;, &quot;猫是黑色的&quot;, &quot;猫坐在椅子上&quot;]</li>
</ul>
</li>
<li><strong>验证</strong>: 对每个原子声明进行事实性验证<ul>
<li>使用人工标注者(RLHF-V)或开源 MLLM(RLAIF-V)判断每个声明是否与图像一致</li>
</ul>
</li>
<li><strong>评分</strong>: 统计被拒绝的声明数作为响应得分</li>
<li><strong>优化</strong>: 基于得分构建偏好对, 用 DPO(Direct Preference Optimization)训练</li>
</ol>
<h3 id="5-3-dpo-z-mllm-zdyy">5.3 DPO 在 MLLM 中的应用</h3>
<p>DPO 的优化目标:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msub><mi mathvariant="script">L</mi><mrow><mi>D</mi><mi>P</mi><mi>O</mi></mrow></msub><mo>=</mo><mo>−</mo><msub><mi mathvariant="double-struck">E</mi><mrow><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><msub><mi>y</mi><mi>w</mi></msub><mo separator="true">,</mo><msub><mi>y</mi><mi>l</mi></msub><mo stretchy="false">)</mo><mo>∼</mo><mi mathvariant="script">D</mi></mrow></msub><mrow><mo fence="true">[</mo><mi>log</mi><mo>⁡</mo><mi>σ</mi><mrow><mo fence="true">(</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>w</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>w</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>−</mo><mi>β</mi><mi>log</mi><mo>⁡</mo><mfrac><mrow><msub><mi>π</mi><mi>θ</mi></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>l</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub><mo stretchy="false">(</mo><msub><mi>y</mi><mi>l</mi></msub><mi mathvariant="normal">∣</mi><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo fence="true">)</mo></mrow><mo fence="true">]</mo></mrow></mrow><annotation encoding="application/x-tex">\\mathcal{L}_{DPO} = -\\mathbb{E}_{(x, y_w, y_l) \\sim \\mathcal{D}} \\left[ \\log \\sigma \\left( \\beta \\log \\frac{\\pi_\\theta(y_w | x)}{\\pi_{ref}(y_w | x)} - \\beta \\log \\frac{\\pi_\\theta(y_l | x)}{\\pi_{ref}(y_l | x)} \\right) \\right]</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8333em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathcal">L</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3283em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">D</span><span class="mord mathnormal mtight" style="margin-right:0.1389em;">P</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">O</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4221em;vertical-align:-0.9721em;"></span><span class="mord">−</span><span class="mord"><span class="mord mathbb">E</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">x</span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1645em;"><span style="top:-2.357em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.143em;"><span></span></span></span></span></span></span><span class="mpunct mtight">,</span><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.3488em;margin-left:-0.0359em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1512em;"><span></span></span></span></span></span></span><span class="mclose mtight">)</span><span class="mrel mtight">∼</span><span class="mord mathcal mtight" style="margin-right:0.0278em;">D</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">[</span></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">lo<span style="margin-right:0.0139em;">g</span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.427em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mord">∣</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.9721em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">]</span></span></span></span></span></span></span><p>其中:</p>
<ul>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>: 图像 + 问题</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>w</mi></msub></mrow><annotation encoding="application/x-tex">y_w</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0269em;">w</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 高分响应(更少幻觉)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>y</mi><mi>l</mi></msub></mrow><annotation encoding="application/x-tex">y_l</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0197em;">l</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 低分响应(更多幻觉)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mi>θ</mi></msub></mrow><annotation encoding="application/x-tex">\\pi_\\theta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5806em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span>: 当前策略模型</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>π</mi><mrow><mi>r</mi><mi>e</mi><mi>f</mi></mrow></msub></mrow><annotation encoding="application/x-tex">\\pi_{ref}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7167em;vertical-align:-0.2861em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">π</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0278em;">r</span><span class="mord mathnormal mtight">e</span><span class="mord mathnormal mtight" style="margin-right:0.1076em;">f</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span></span></span></span>: 参考模型(SFT 后的模型)</li>
<li><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>β</mi></mrow><annotation encoding="application/x-tex">\\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span>: 温度系数, 控制偏离参考模型的程度</li>
</ul>
<p><strong>为什么 DPO 比 PPO 更适合 MLLM 对齐?</strong></p>
<p>PPO(Proximal Policy Optimization)需要训练一个额外的奖励模型, 并在训练过程中维护价值函数, 实现复杂且不稳定. DPO 直接从偏好数据优化策略, 无需奖励模型, 实现更简单, 训练更稳定. 对于端侧模型的对齐, DPO 的简洁性是一个重要优势.</p>
<h3 id="5-4-rlhf-v-vs-rlaif-v">5.4 RLHF-V vs RLAIF-V</h3>
<table>
<thead>
<tr>
<th>维度</th>
<th>RLHF-V(V 2.0)</th>
<th>RLAIF-V(V 2.5)</th>
</tr>
</thead>
<tbody><tr>
<td>反馈来源</td>
<td>人类</td>
<td>开源 MLLM</td>
</tr>
<tr>
<td>验证器</td>
<td>人工判断</td>
<td>OmniLMM 12B / LLaVA-NeXT-Yi 34B</td>
</tr>
<tr>
<td>成本</td>
<td>高</td>
<td>低(自动化)</td>
</tr>
<tr>
<td>质量上限</td>
<td>高(人类理解深度)</td>
<td>依赖验证器能力</td>
</tr>
<tr>
<td>扩展性</td>
<td>有限</td>
<td>高</td>
</tr>
</tbody></table>
<p>RLAIF-V 的&quot;分而治之&quot;策略: 将响应分解为原子声明后, 验证难度大幅降低. &quot;图中是否有猫?&quot;比&quot;这段描述是否准确?&quot;更容易判断. 但风险在于验证器本身也可能产生幻觉, 导致错误的偏好信号.</p>
<hr>
<h2 id="6-dcbsyh">6. 端侧部署优化</h2>
<h3 id="6-1-jspjfx">6.1 计算瓶颈分析</h3>
<p>在端侧设备上运行 MiniCPM-V 2.0, 计算开销分布大致如下:</p>
<table>
<thead>
<tr>
<th>模块</th>
<th>计算占比</th>
<th>瓶颈因素</th>
</tr>
</thead>
<tbody><tr>
<td>视觉编码器(SigLIP-400M)</td>
<td>~25%</td>
<td>高分辨率图像的 forward pass</td>
</tr>
<tr>
<td>压缩层(Perceiver)</td>
<td>~5%</td>
<td>单层 cross-attention, 计算量小</td>
</tr>
<tr>
<td>LLM(MiniCPM-2B)</td>
<td>~65%</td>
<td>自回归解码, 与文本长度线性相关</td>
</tr>
<tr>
<td>图像预处理</td>
<td>~5%</td>
<td>resize, normalize, 切片</td>
</tr>
</tbody></table>
<p><strong>关键洞察</strong>: LLM 的解码阶段是主要瓶颈, 但视觉编码器的&quot;首 token 延迟&quot;(prefill 阶段)也不可忽视——用户上传图片后需要等待视觉编码完成才能开始生成文本.</p>
<h3 id="6-2-lhcl">6.2 量化策略</h3>
<p>端侧部署通常采用 INT4 或 INT8 量化以减少内存占用:</p>
<table>
<thead>
<tr>
<th>量化方案</th>
<th>视觉编码器</th>
<th>LLM</th>
<th>总显存</th>
</tr>
</thead>
<tbody><tr>
<td>FP16(baseline)</td>
<td>800MB</td>
<td>5GB</td>
<td>~6GB</td>
</tr>
<tr>
<td>INT8</td>
<td>400MB</td>
<td>2.5GB</td>
<td>~3GB</td>
</tr>
<tr>
<td>INT4</td>
<td>200MB</td>
<td>1.25GB</td>
<td>~1.5GB</td>
</tr>
<tr>
<td>INT4 + AWQ</td>
<td>~200MB</td>
<td>~1GB</td>
<td>~1.3GB</td>
</tr>
</tbody></table>
<p><strong>注意</strong>: 视觉编码器对量化比 LLM 更敏感. ViT 的特征动态范围大, INT4 量化可能导致显著的 OCR 性能下降. 实践中, 视觉编码器通常保持 INT8 或 FP16, 仅对 LLM 部分进行 INT4 量化.</p>
<h3 id="6-3-mlc-llm-bskj">6.3 MLC-LLM 部署框架</h3>
<p>mlc-MiniCPM 项目基于 MLC-LLM 框架, 提供了一套完整的 Android 端侧部署方案:</p>
<ol>
<li><strong>TVM 编译优化</strong>: 将 PyTorch 模型编译为针对目标硬件(如 Snapdragon NPU)优化的算子</li>
<li><strong>内存池管理</strong>: 预分配固定大小的内存池, 避免运行时的动态分配开销</li>
<li><strong>量化和压缩</strong>: 支持 INT4/INT8 量化, 以及 group-wise 量化以减小精度损失</li>
<li><strong>异步编码</strong>: 视觉编码和文本生成可以部分并行化</li>
</ol>
<p><strong>小米 14 Pro(Snapdragon 8 Gen 3)实测性能</strong>:</p>
<ul>
<li>图像编码: ~0.8s(1344x1344)</li>
<li>文本 prefill: ~0.4s(96 tokens prompt)</li>
<li>解码速度: ~5 tokens/s</li>
</ul>
<p>对于一般的图像问答任务(输出 50-100 tokens), 总延迟约 2-3 秒, 用户体验可接受.</p>
<hr>
<h2 id="7-yjpdjgdb">7. 与竞品的架构对比</h2>
<h3 id="7-1-sjbmcldb">7.1 视觉编码策略对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>视觉编码器</th>
<th>分辨率策略</th>
<th>视觉 token 数</th>
<th>压缩</th>
</tr>
</thead>
<tbody><tr>
<td>MiniCPM-V 2.0</td>
<td>SigLIP-400M</td>
<td>LLaVA-UHD(自适应, up to 1.8M)</td>
<td>64 x N slices</td>
<td>Perceiver Resampler</td>
</tr>
<tr>
<td>Qwen-VL-Chat</td>
<td>ViT-G/14</td>
<td>固定 448x448</td>
<td>~1,024</td>
<td>MLP 投影</td>
</tr>
<tr>
<td>CogVLM-Chat</td>
<td>EVA2-CLIP-E</td>
<td>固定 490x490</td>
<td>~1,024</td>
<td>无(直接输入)</td>
</tr>
<tr>
<td>Yi-VL-34B</td>
<td>CLIP ViT-L</td>
<td>固定 336x336</td>
<td>~576</td>
<td>MLP 投影</td>
</tr>
<tr>
<td>LLaVA-1.5</td>
<td>CLIP ViT-L</td>
<td>固定 336x336</td>
<td>~576</td>
<td>MLP 投影</td>
</tr>
<tr>
<td>Mini-Gemini</td>
<td>CLIP ViT-L</td>
<td>HD 分块(up to 672)</td>
<td>可变</td>
<td>无</td>
</tr>
</tbody></table>
<p><strong>关键差异</strong>:</p>
<ul>
<li><strong>自适应 vs 固定</strong>: MiniCPM-V 和 Mini-Gemini 支持自适应分辨率, 其他模型使用固定分辨率</li>
<li><strong>压缩 vs 无压缩</strong>: MiniCPM-V 使用 Perceiver Resampler 压缩, 显著减少 token 数; CogVLM 直接将全部视觉 token 输入 LLM, 虽然避免了信息损失, 但效率低</li>
<li><strong>视觉编码器选择</strong>: SigLIP 相比 CLIP 在细粒度视觉任务上表现更好, 这与 SigLIP 使用 sigmoid 对比损失(而非 softmax)有关——sigmoid 损失对 hard negatives 更敏感, 学到的特征更具判别性</li>
</ul>
<h3 id="7-2-ocr-xndb">7.2 OCR 性能对比</h3>
<table>
<thead>
<tr>
<th>模型</th>
<th>规模</th>
<th>OCRBench</th>
<th>TextVQA</th>
<th>DocVQA</th>
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
<td>GPT-4V</td>
<td>-</td>
<td>645</td>
<td>78.0</td>
<td>88.4</td>
</tr>
<tr>
<td>Phi-3-Vision</td>
<td>4.2B</td>
<td>639</td>
<td>70.9</td>
<td>-</td>
</tr>
<tr>
<td>CogVLM-Chat</td>
<td>17.4B</td>
<td>590</td>
<td>70.4</td>
<td>33.3</td>
</tr>
<tr>
<td><strong>MiniCPM-V 2.0</strong></td>
<td><strong>2.8B</strong></td>
<td><strong>605</strong></td>
<td><strong>74.1</strong></td>
<td><strong>71.9</strong></td>
</tr>
<tr>
<td>Qwen-VL-Chat</td>
<td>9.6B</td>
<td>488</td>
<td>61.5</td>
<td>62.6</td>
</tr>
<tr>
<td>DeepSeek-VL-7B</td>
<td>7.3B</td>
<td>435</td>
<td>64.7</td>
<td>47.0</td>
</tr>
</tbody></table>
<p>MiniCPM-V 2.0 在 2.8B 规模下实现了 OCRBench 605 的成绩, 超越所有 7B 以下开源模型, 在 TextVQA 上接近 Gemini Pro. 这证明了&quot;高分辨率自适应编码 + OCR 强化预训练 + 高效 token 压缩&quot;的组合在端侧场景下的有效性.</p>
<hr>
<h2 id="8-jxywlfx">8. 局限与未来方向</h2>
<h3 id="8-1-yzjx">8.1 已知局限</h3>
<ol>
<li><strong>分辨率上限</strong>: 180 万像素对于某些专业场景(如医学影像、卫星图像)仍然不够</li>
<li><strong>视频理解缺失</strong>: V 2.0 仅支持单图输入, 不支持视频或多图序列(后续 V 2.6 解决了这个问题)</li>
<li><strong>多语言能力依赖基座</strong>: V 2.0 的 MiniCPM-2B 基座在多语言上不如 Llama-3-8B, 导致多语言视觉理解能力受限</li>
<li><strong>DocVQA 差距</strong>: 71.9 分虽超越多数开源模型, 但距 Gemini Pro 的 88.1 仍有 16 分差距, 说明复杂文档理解仍是小模型的短板</li>
</ol>
<h3 id="8-2-ktsdgjfx">8.2 可探索的改进方向</h3>
<ol>
<li><strong>更高效的视觉编码器</strong>: 探索 MobileNetV4、EfficientViT 等轻量视觉骨干, 进一步降低视觉编码开销</li>
<li><strong>动态压缩比</strong>: 根据图像内容复杂度自适应调整压缩比——简单图像用更少 queries, 复杂图像用更多</li>
<li><strong>多帧联合推理</strong>: 将 LLaVA-UHD 的切片思想扩展到视频帧, 实现时序一致的视频理解</li>
<li><strong>端侧微调</strong>: 允许用户在端侧设备上用少量私有数据进行个性化微调, 而不需要上传数据到云端</li>
</ol>
<hr>
<h2 id="9-zj">9. 总结</h2>
<p>MiniCPM-V 2.0 的核心技术贡献可以概括为一句话: <strong>用系统工程的方法, 在 2.8B 参数的严格预算下, 实现了超越 10 倍规模模型的 OCR 和多模态理解能力</strong>.</p>
<p>其关键技术杠杆包括:</p>
<ol>
<li><strong>LLaVA-UHD 自适应视觉编码</strong>: 通过图像分片 + 评分函数 + 位置编码插值, 解决了高分辨率 + 任意长宽比的视觉输入问题</li>
<li><strong>Perceiver Resampler token 压缩</strong>: 将视觉 token 数量压缩 16 倍, 使端侧设备的 attention 计算可控</li>
<li><strong>三阶段渐进预训练</strong>: 从压缩层预热到分辨率扩展再到高分辨率 OCR 强化, 逐步解锁能力</li>
<li><strong>RLHF-V 多模态对齐</strong>: 通过原子声明分解和 DPO 优化, 显著降低幻觉率</li>
<li><strong>端到端部署优化</strong>: 从量化策略到 MLC-LLM 编译优化, 实现了真正的手机端实时推理</li>
</ol>
<p>这些技术不仅适用于 MiniCPM-V 系列, 也为整个端侧 MLLM 领域提供了可复用的工程范式.</p>
<hr>
<blockquote>
<p>本文档已同步至知识库: <a href="#broken-link">docs/sections/llm-guide/5-主流模型全解/5.2-国内大模型/面壁智能-MiniCPM/05-MiniCPM-V-2.0-端侧多模态架构与自适应高分辨率视觉编码.md</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-wtbj-dcdmtdszkj","text":"1. 问题背景：端侧多模态的三重困境"},{"level":2,"id":"2-zsysjbm-l-la-va-uhd","text":"2. 自适应视觉编码：LLaVA-UHD"},{"level":3,"id":"2-1-hxsx","text":"2.1 核心思想"},{"level":3,"id":"2-2-txfpsf","text":"2.2 图像分片算法"},{"level":3,"id":"2-3-kjms-spatial-schema","text":"2.3 空间模式 (Spatial Schema)"},{"level":2,"id":"3-token-ys-perceiver-resampler","text":"3. Token 压缩：Perceiver Resampler"},{"level":3,"id":"3-1-wsmxyys","text":"3.1 为什么需要压缩"},{"level":3,"id":"3-2-sxyl","text":"3.2 数学原理"},{"level":3,"id":"3-3-ysbdqh","text":"3.3 压缩比的权衡"},{"level":2,"id":"4-sjdyxlcl","text":"4. 三阶段预训练策略"},{"level":3,"id":"4-1-jdsjdlljc","text":"4.1 阶段设计的理论基础"},{"level":3,"id":"4-2-stage-1-yscyr","text":"4.2 Stage-1：压缩层预热"},{"level":3,"id":"4-3-stage-2-fbskz","text":"4.3 Stage-2：分辨率扩展"},{"level":3,"id":"4-4-stage-3-gfbs-ocr-qh","text":"4.4 Stage-3：高分辨率 + OCR 强化"},{"level":3,"id":"4-5-caption-rewriting-sjzlzq","text":"4.5 Caption Rewriting：数据质量增强"},{"level":3,"id":"4-6-data-packing-xlxsyh","text":"4.6 Data Packing：训练效率优化"},{"level":2,"id":"5-dmtdq-rlhf-v","text":"5. 多模态对齐：RLHF-V"},{"level":3,"id":"5-1-dmthjdbz","text":"5.1 多模态幻觉的本质"},{"level":3,"id":"5-2-rlhf-v-dhxcx-yzsmfj","text":"5.2 RLHF-V 的核心创新：原子声明分解"},{"level":3,"id":"5-3-dpo-z-mllm-zdyy","text":"5.3 DPO 在 MLLM 中的应用"},{"level":3,"id":"5-4-rlhf-v-vs-rlaif-v","text":"5.4 RLHF-V vs RLAIF-V"},{"level":2,"id":"6-dcbsyh","text":"6. 端侧部署优化"},{"level":3,"id":"6-1-jspjfx","text":"6.1 计算瓶颈分析"},{"level":3,"id":"6-2-lhcl","text":"6.2 量化策略"},{"level":3,"id":"6-3-mlc-llm-bskj","text":"6.3 MLC-LLM 部署框架"},{"level":2,"id":"7-yjpdjgdb","text":"7. 与竞品的架构对比"},{"level":3,"id":"7-1-sjbmcldb","text":"7.1 视觉编码策略对比"},{"level":3,"id":"7-2-ocr-xndb","text":"7.2 OCR 性能对比"},{"level":2,"id":"8-jxywlfx","text":"8. 局限与未来方向"},{"level":3,"id":"8-1-yzjx","text":"8.1 已知局限"},{"level":3,"id":"8-2-ktsdgjfx","text":"8.2 可探索的改进方向"},{"level":2,"id":"9-zj","text":"9. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.18-minicpm/05-mini-cpm-v-2.0/05-mini-cpm-v-2.0-dcdmtjgyzsygfbssjbm" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.18-minicpm/05-mini-cpm-v-2.0/05-mini-cpm-v-2.0-dcdmtjgyzsygfbssjbm" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">MiniCPM-V 2.0 核心技术专题：端侧多模态架构与自适应高分辨率视觉编码</h1>
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
