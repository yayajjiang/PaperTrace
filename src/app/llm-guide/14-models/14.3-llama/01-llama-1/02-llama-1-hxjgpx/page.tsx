"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>Llama-1 核心架构剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.3-llama/14.3-llama">返回 14.3-LLaMA 家族总览</a></strong>
⏱️ <strong>更新时间</strong>: 2026-05-24
🎯 <strong>核心聚焦</strong>: Base Dense Route、超大规模数据清洗、Scaling Laws (推理优先)、极限工程优化。</p>
</blockquote>
<h2 id="yy-zxdykymxdbzx">引言：重新定义开源模型的标准线</h2>
<p>在 Llama-1(Large Language Model Meta AI)问世之前，大模型(LLM)的发展存在一个明显的割裂：以 OpenAI (GPT-3/4) 和 Google (PaLM) 为代表的闭源巨头不断推高参数量(千亿甚至万亿级别)，而开源社区的模型在能力上存在显著代差。2023年2月，Meta 发布的 Llama-1 彻底打破了这一局面。</p>
<p>Llama-1 最具颠覆性的贡献并不在于发明了某种革命性的全新架构，而在于它通过**“极致的工程优化 + 极其讲究的数据清洗 + 超前训练(Over-training)”**，证明了：在纯公开数据集上，一个小参数量模型(7B/13B)通过增加训练 Tokens 数量，完全可以在性能上匹敌甚至超越千亿参数的巨兽(如 GPT-3 175B)。</p>
<p>本报告将全方位、深层次地拆解 Llama-1 的核心技术栈，探究其如何在算法、数据和算力工程之间取得完美的平衡。</p>
<hr>
<h2 id="1-jccmjg-base-dense-route">1 基础稠密架构(Base Dense Route)</h2>
<p>在参数膨胀与稀疏化(如 MoE，Mixture of Experts)大行其道的背景下，Meta 团队为 Llama-1 坚守了<strong>标准的稠密(Dense)Decoder-only Transformer 架构</strong>。</p>
<h3 id="1-1-jccmjgdsjdj">1.1 坚持稠密架构的设计动机</h3>
<p>尽管 MoE 架构(如后来的 Mixtral)能够以较低的推理算力换取巨大的参数容量，但在 2023 年初，Dense 架构具备以下不可替代的优势：</p>
<ol>
<li><strong>收敛可预测性</strong>：稠密模型的 Scaling Laws 极其稳定，训练期间的 Loss 下降轨迹在小规模实验中可被精确预测。</li>
<li><strong>极简的部署生态</strong>：Dense 架构不需要复杂的显存路由和专家负载均衡机制，对底层硬件(单卡或双卡消费级 GPU)的适配极其友好，这也为后来 <code>llama.cpp</code> 引发的开源生态大爆炸奠定了基础。</li>
<li><strong>通信开销最小化</strong>：MoE 在分布式训练中存在严重的 All-to-All 通信瓶颈，而 Dense 模型结合 Megatron-LM 的标准 3D 并行已经非常成熟。</li>
</ol>
<h3 id="1-2-hxzjgjyyltd">1.2 核心组件改进与原理推导</h3>
<p>虽然 Llama-1 总体沿用了 GPT-3 的经典架构，但为了提升训练稳定性和收敛速度，它从 PaLM、GPT-NeoX 等优秀模型中吸取了三个关键改进。</p>
<h4 id="1-2-1-ygyh-pre-normalization-y-rms-norm">1.2.1 预归一化(Pre-normalization)与 RMSNorm</h4>
<p>为了提升训练稳定性，Llama-1 没有使用传统的 Post-normalization，而是采用 <strong>Pre-normalization</strong>。更重要的是，为了提高计算效率，它将标准 LayerNorm 替换为了 <strong>RMSNorm(Root Mean Square Normalization)</strong>。</p>
<p><strong>原理推导：</strong>
标准的 LayerNorm 需要计算均值 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>μ</mi></mrow><annotation encoding="application/x-tex">\\mu</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">μ</span></span></span></span> 和方差 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi>σ</mi><mn>2</mn></msup></mrow><annotation encoding="application/x-tex">\\sigma^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8141em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span></span></span></span>：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mi>x</mi><mo>−</mo><mi>μ</mi></mrow><msqrt><mrow><msup><mi>σ</mi><mn>2</mn></msup><mo>+</mo><mi>ϵ</mi></mrow></msqrt></mfrac><mo>⊙</mo><mi>γ</mi><mo>+</mo><mi>β</mi></mrow><annotation encoding="application/x-tex">y = \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}} \\odot \\gamma + \\beta</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.1903em;vertical-align:-0.93em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.2603em;"><span style="top:-2.1966em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9134em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord" style="padding-left:0.833em;"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7401em;"><span style="top:-2.989em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">ϵ</span></span></span><span style="top:-2.8734em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1266em;"><span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mord mathnormal">μ</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.93em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊙</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.7778em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span></span></span></span></span><p>RMSNorm 的作者(Biao Zhang et al., 2019)发现，LayerNorm 带来的收益大部分来自于平移不变性(均值中心化)和缩放不变性(方差归一化)中的<strong>缩放不变性</strong>。因此，直接移除均值计算，不仅不会降低性能，反而能减少 10%-40% 的计算开销。</p>
<p>RMSNorm 的公式极简：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>R</mi><mi>M</mi><mi>S</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><msqrt><mrow><mfrac><mn>1</mn><mi>d</mi></mfrac><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>d</mi></munderover><msubsup><mi>x</mi><mi>i</mi><mn>2</mn></msubsup></mrow></msqrt></mrow><annotation encoding="application/x-tex">RMS(x) = \\sqrt{\\frac{1}{d}\\sum_{i=1}^{d}x_i^2}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:3.3415em;vertical-align:-1.2777em;"></span><span class="mord sqrt"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:2.0639em;"><span class="svg-align" style="top:-5.3015em;"><span class="pstrut" style="height:5.3015em;"></span><span class="mord" style="padding-left:1.056em;"><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.3214em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">d</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.686em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop op-limits"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.8361em;"><span style="top:-1.8723em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">i</span><span class="mrel mtight">=</span><span class="mord mtight">1</span></span></span></span><span style="top:-3.05em;"><span class="pstrut" style="height:3.05em;"></span><span><span class="mop op-symbol large-op">∑</span></span></span><span style="top:-4.3em;margin-left:0em;"><span class="pstrut" style="height:3.05em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.7959em;"><span style="top:-2.4231em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span><span style="top:-3.0448em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2769em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0239em;"><span class="pstrut" style="height:5.3015em;"></span><span class="hide-tail" style="min-width:0.742em;height:3.3815em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="3.3815em" viewBox="0 0 400000 3381" preserveAspectRatio="xMinYMin slice"><path d="M702 80H40000040
H742v3247l-4 4-4 4c-.667.7 -2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1
h-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170
c-4-3.333-8.333-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667
219 661 l218 661zM702 80H400000v40H742z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.2777em;"><span></span></span></span></span></span></span></span></span></span>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mover accent="true"><mi>x</mi><mo>ˉ</mo></mover><mo>=</mo><mfrac><mi>x</mi><mrow><mi>R</mi><mi>M</mi><mi>S</mi><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo></mrow></mfrac><mo>⊙</mo><mi>γ</mi></mrow><annotation encoding="application/x-tex">\\bar{x} = \\frac{x}{RMS(x)} \\odot \\gamma</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.5678em;"></span><span class="mord accent"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.5678em;"><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mathnormal">x</span></span><span style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="accent-body" style="left:-0.2222em;"><span class="mord">ˉ</span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.0436em;vertical-align:-0.936em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.1076em;"><span style="top:-2.314em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="mord mathnormal" style="margin-right:0.109em;">M</span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.677em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord mathnormal">x</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.936em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊙</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0556em;">γ</span></span></span></span></span><p><strong>工程实现(PyTorch 伪代码)：</strong></p>
<pre><code class="language-python">import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def _norm(self, x):
        # 计算特征维度上的均方根，并保持维度不变以支持广播
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)

    def forward(self, x):
        output = self._norm(x.float()).type_as(x)
        return output * self.weight
</code></pre>
<h4 id="1-2-2-swi-glu-jhhs-yz-palm">1.2.2 SwiGLU 激活函数(源自 PaLM)</h4>
<p>Llama-1 放弃了常用的 ReLU 及其变体(如 GeLU)，转而采用 <strong>SwiGLU (Swish-Gated Linear Unit)</strong> 替代 FFN (Feed Forward Network) 中的激活函数。为了保持参数量与之前架构一致，Meta 在使用 SwiGLU 时，将隐藏层维度从传统的 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span> 缩小到了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>2</mn><mn>3</mn></mfrac><mo>×</mo><mn>4</mn><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{2}{3} \\times 4d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord">4</span><span class="mord mathnormal">d</span></span></span></span>。</p>
<p><strong>原理推导：</strong>
Swish 激活函数定义为：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>S</mi><mi>w</mi><mi>i</mi><mi>s</mi><msub><mi>h</mi><mi>β</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mo stretchy="false">)</mo><mo>=</mo><mi>x</mi><mo>⋅</mo><mi>σ</mi><mo stretchy="false">(</mo><mi>β</mi><mi>x</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">Swish_\\beta(x) = x \\cdot \\sigma(\\beta x)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">i</span><span class="mord mathnormal">s</span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.4445em;"></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⋅</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="mord mathnormal">x</span><span class="mclose">)</span></span></span></span>。
GLU (Gated Linear Unit) 的标准形式是：<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>G</mi><mi>L</mi><mi>U</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>W</mi><mo separator="true">,</mo><mi>V</mi><mo separator="true">,</mo><mi>b</mi><mo separator="true">,</mo><mi>c</mi><mo stretchy="false">)</mo><mo>=</mo><mi>σ</mi><mo stretchy="false">(</mo><mi>x</mi><mi>W</mi><mo>+</mo><mi>b</mi><mo stretchy="false">)</mo><mo>⊗</mo><mo stretchy="false">(</mo><mi>x</mi><mi>V</mi><mo>+</mo><mi>c</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">GLU(x, W, V, b, c) = \\sigma(xW + b) \\otimes (xV + c)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">G</span><span class="mord mathnormal" style="margin-right:0.109em;">LU</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">b</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">c</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">σ</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">b</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">c</span><span class="mclose">)</span></span></span></span>。</p>
<p>结合两者，SwiGLU 的公式为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>S</mi><mi>w</mi><mi>i</mi><mi>G</mi><mi>L</mi><mi>U</mi><mo stretchy="false">(</mo><mi>x</mi><mo separator="true">,</mo><mi>W</mi><mo separator="true">,</mo><mi>V</mi><mo stretchy="false">)</mo><mo>=</mo><mi>S</mi><mi>w</mi><mi>i</mi><mi>s</mi><msub><mi>h</mi><mi>β</mi></msub><mo stretchy="false">(</mo><mi>x</mi><mi>W</mi><mo stretchy="false">)</mo><mo>⊗</mo><mo stretchy="false">(</mo><mi>x</mi><mi>V</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">SwiGLU(x, W, V) = Swish_\\beta(xW) \\otimes (xV)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">i</span><span class="mord mathnormal">G</span><span class="mord mathnormal" style="margin-right:0.109em;">LU</span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.0361em;vertical-align:-0.2861em;"></span><span class="mord mathnormal" style="margin-right:0.0576em;">S</span><span class="mord mathnormal" style="margin-right:0.0269em;">w</span><span class="mord mathnormal">i</span><span class="mord mathnormal">s</span><span class="mord"><span class="mord mathnormal">h</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.0528em;">β</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2861em;"><span></span></span></span></span></span></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord mathnormal" style="margin-right:0.1389em;">W</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">x</span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mclose">)</span></span></span></span></span>
<p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo>⊗</mo></mrow><annotation encoding="application/x-tex">\\otimes</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6667em;vertical-align:-0.0833em;"></span><span class="mord">⊗</span></span></span></span> 为逐元素相乘。SwiGLU 引入了门控机制(Gating Mechanism)，允许网络动态地决定哪些信息应该被向前传递，这种乘法交互相较于传统的加法交互(如 ResNet)具有更强的表达能力。</p>
<p><strong>工程实现(PyTorch 伪代码)：</strong></p>
<pre><code class="language-python">import torch.nn.functional as F

class SwiGLU(nn.Module):
    def __init__(self, dim_in, dim_out):
        super().__init__()
        # 将参数拆分为两部分用于门控相乘
        self.w1 = nn.Linear(dim_in, dim_out, bias=False)
        self.w2 = nn.Linear(dim_in, dim_out, bias=False)
        self.w3 = nn.Linear(dim_out, dim_in, bias=False)

    def forward(self, x):
        # 门控相乘：Swish(x * W1) 乘以 (x * W2)
        x = F.silu(self.w1(x)) * self.w2(x)
        return self.w3(x)
</code></pre>
<h4 id="1-2-3-xzwzbm-rope-yz-gpt-neox">1.2.3 旋转位置编码 RoPE(源自 GPT-NeoX)</h4>
<p>大模型对序列中 Token 位置的感知能力至关重要。Llama-1 摒弃了绝对位置编码(Absolute PE)，选择了由 Su et al. (2021) 提出的 <strong>RoPE (Rotary Positional Embeddings)</strong>。</p>
<p><strong>核心思想：</strong>
RoPE 的绝妙之处在于它通过<strong>绝对位置的旋转操作，实现了相对位置编码的效果</strong>。它将词嵌入向量映射到复数平面，通过旋转一定的角度来赋予位置信息。</p>
<p>给定位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 的词向量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>q</mi></mrow><annotation encoding="application/x-tex">q</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span></span></span></span>，其在复平面上的旋转可表示为：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mi>f</mi><mo stretchy="false">(</mo><mi>q</mi><mo separator="true">,</mo><mi>m</mi><mo stretchy="false">)</mo><mo>=</mo><mo stretchy="false">(</mo><msub><mi>q</mi><mn>0</mn></msub><mo>+</mo><mi>i</mi><msub><mi>q</mi><mn>1</mn></msub><mo stretchy="false">)</mo><msup><mi>e</mi><mrow><mi>i</mi><mi>m</mi><mi>θ</mi></mrow></msup></mrow><annotation encoding="application/x-tex">f(q, m) = (q_0 + i q_1) e^{i m \\theta}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.1076em;">f</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mclose">)</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1.1491em;vertical-align:-0.25em;"></span><span class="mord mathnormal">i</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mclose">)</span><span class="mord"><span class="mord mathnormal">e</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">im</span><span class="mord mathnormal mtight" style="margin-right:0.0278em;">θ</span></span></span></span></span></span></span></span></span></span></span></span></span>
<p>转换为实数矩阵表示：</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msubsup><mi>q</mi><mn>0</mn><mrow><mo stretchy="false">(</mo><mi>m</mi><mo stretchy="false">)</mo></mrow></msubsup></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msubsup><mi>q</mi><mn>1</mn><mrow><mo stretchy="false">(</mo><mi>m</mi><mo stretchy="false">)</mo></mrow></msubsup></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>=</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>m</mi><mi>θ</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><mi>sin</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>m</mi><mi>θ</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>m</mi><mi>θ</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mo stretchy="false">(</mo><mi>m</mi><mi>θ</mi><mo stretchy="false">)</mo></mrow></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>q</mi><mn>0</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>q</mi><mn>1</mn></msub></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">\\begin{pmatrix} q_0^{(m)} \\\\ q_1^{(m)} \\end{pmatrix} =
\\begin{pmatrix} \\cos(m\\theta) &amp; -\\sin(m\\theta) \\\\ \\sin(m\\theta) &amp; \\cos(m\\theta) \\end{pmatrix}
\\begin{pmatrix} q_0 \\\\ q_1 \\end{pmatrix}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:3em;vertical-align:-1.25em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size4">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.6548em;"><span style="top:-3.6548em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4337em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">m</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2663em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.25em;"><span class="pstrut" style="height:3.0448em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.0448em;"><span style="top:-2.4337em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span><span style="top:-3.2198em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mopen mtight">(</span><span class="mord mathnormal mtight">m</span><span class="mclose mtight">)</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2663em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:1.1548em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size4">)</span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:2.4em;vertical-align:-0.95em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">cos</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">sin</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span><span class="arraycolsep" style="width:0.5em;"></span><span class="arraycolsep" style="width:0.5em;"></span><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord">−</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mop">sin</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mop">cos</span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="mclose">)</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span><span class="mspace" style="margin-right:0.1667em;"></span><span class="minner"><span class="mopen delimcenter" style="top:0em;"><span class="delimsizing size3">(</span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:1.45em;"><span style="top:-3.61em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">0</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.41em;"><span class="pstrut" style="height:3em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.95em;"><span></span></span></span></span></span></span></span><span class="mclose delimcenter" style="top:0em;"><span class="delimsizing size3">)</span></span></span></span></span></span></span><p>当计算注意力分数 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msubsup><mi>q</mi><mi>m</mi><mi>T</mi></msubsup><msub><mi>k</mi><mi>n</mi></msub></mrow><annotation encoding="application/x-tex">q_m^T k_n</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0883em;vertical-align:-0.247em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0359em;">q</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-2.453em;margin-left:-0.0359em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">m</span></span></span><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.247em;"><span></span></span></span></span></span></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0315em;">k</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.1514em;"><span style="top:-2.55em;margin-left:-0.0315em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">n</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span> 时，内积结果仅依赖于相对位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo stretchy="false">(</mo><mi>m</mi><mo>−</mo><mi>n</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">(m - n)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mopen">(</span><span class="mord mathnormal">m</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">−</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal">n</span><span class="mclose">)</span></span></span></span>，这极大地增强了模型对长文本和相对语境的泛化能力。</p>
<hr>
<h2 id="2-cdgmsjqxgx-data-cleaning-pipeline">2 超大规模数据清洗管线(Data Cleaning Pipeline)</h2>
<p>算法决定了模型的上限，而数据决定了模型到底能达到多高。Llama-1 证明了：纯依靠高质量的开源数据集，足以打败依赖私有数据集的模型。</p>
<h3 id="2-1-xlylfb">2.1 训练语料分布</h3>
<p>Llama-1 训练集总计包含 <strong>1.4T Tokens</strong>。其数据来源极度多元，且完全开源：</p>
<table>
<thead>
<tr>
<th align="left">数据源</th>
<th align="left">占比</th>
<th align="left">规模 (Tokens)</th>
<th align="left">用途与特性</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>CommonCrawl</strong></td>
<td align="left">67%</td>
<td align="left">3.3 TB</td>
<td align="left">网页快照(经严格过滤重采样)</td>
</tr>
<tr>
<td align="left"><strong>C4</strong></td>
<td align="left">15%</td>
<td align="left">783 GB</td>
<td align="left">经过高度清洗的 CommonCrawl</td>
</tr>
<tr>
<td align="left"><strong>Github</strong></td>
<td align="left">4.5%</td>
<td align="left">328 GB</td>
<td align="left">增强逻辑推理与编程能力</td>
</tr>
<tr>
<td align="left"><strong>Wikipedia</strong></td>
<td align="left">4.5%</td>
<td align="left">83 GB</td>
<td align="left">提供高质量的事实性知识</td>
</tr>
<tr>
<td align="left"><strong>Gutenberg / Books3</strong></td>
<td align="left">4.5%</td>
<td align="left">85 GB</td>
<td align="left">增强长文本依赖与故事性叙事能力</td>
</tr>
<tr>
<td align="left"><strong>ArXiv</strong></td>
<td align="left">2.5%</td>
<td align="left">92 GB</td>
<td align="left">提供深度数理逻辑与科研知识</td>
</tr>
<tr>
<td align="left"><strong>StackExchange</strong></td>
<td align="left">2%</td>
<td align="left">78 GB</td>
<td align="left">高质量 Q&amp;A 问答格式数据</td>
</tr>
</tbody></table>
<h3 id="2-2-gyjqzyqxcl">2.2 工业级去重与清洗策略</h3>
<p>大模型训练中最可怕的陷阱是“数据污染”与“语料重复”(会导致模型对某些特定句子产生严重过拟合，或陷入复读机困境)。Meta 构建了一条极度严苛的数据清洗 Pipeline：</p>
<pre><code class="language-mermaid">graph TD
    A[Raw Web Data (CommonCrawl)] --&gt; B{Heuristic Filtering}
    B --&gt;|URL/Length/Keyword| C[N-gram Language Modeling]
    C --&gt; D{LSH MinHash Deduplication}
    D --&gt;|Remove Near-duplicates| E[FastText Classifier]
    E --&gt;|Trained on Wikipedia| F[High-Quality Filtered Text]
    
    X[Github/ArXiv/Books] --&gt; Y{Exact Match Deduplication}
    Y --&gt; F
    
    F --&gt; G[SentencePiece BPE Tokenization]
    G --&gt; H[Final Training Tokens (1.4T)]
</code></pre>
<p><strong>关键技术解析：</strong></p>
<ol>
<li><strong>启发式过滤 (Heuristic Filtering)</strong>：剔除短页面、无明显主体内容的网页、充斥导航栏/广告词的页面(通常通过 N-gram 困惑度过滤，剔除那些非自然语言或重复性极高的机器生成文本)。</li>
<li><strong>MinHash 局部敏感哈希去重</strong>：对于网页数据，直接的字符串匹配(Exact Match)不够。Llama-1 使用 MinHash 算法计算文档间的 Jaccard 相似度，去除了大规模网页中存在的“近似重复”(如带有不同时间戳的同一篇新闻)。</li>
<li><strong>线性分类器 (FastText) 知识蒸馏</strong>：Meta 训练了一个轻量级的 FastText 线性分类器。他们以维基百科等高质量文本作为正样本，随机网页作为负样本。使用该分类器对 CommonCrawl 进行打分，剔除那些得分过低的网页，确保留下的数据具备类似百科全书的高质量特征。</li>
</ol>
<h3 id="2-3-zjj-bpe-fcq-tokenizer">2.3 字节级 BPE 分词器 (Tokenizer)</h3>
<p>Llama 采用 <strong>SentencePiece</strong> 实现的 Byte-Pair Encoding (BPE)。为了解决 OOV (Out-of-Vocabulary) 问题和特殊符号渲染问题：</p>
<ul>
<li><strong>Byte Fallback</strong>：遇到不在词表中的罕见字符时，模型会自动回退到以字节(UTF-8 编码)粒度进行分割。</li>
<li><strong>数字拆分(Digit Splitting)</strong>：所有数字被拆分为独立的数字 Token(例如 <code>1024</code> 被拆分为 <code>1</code>, <code>0</code>, <code>2</code>, <code>4</code>)，这一细节极大地增强了模型在算术运算和数学推理时的位阶对齐能力。</li>
</ul>
<hr>
<h2 id="3-sfdly-chinchilla-zy-scaling-laws">3 缩放定律与 Chinchilla 最优(Scaling Laws)</h2>
<p>Llama-1 最大的贡献在于它通过实际行动打破了当时的理论教条，提出了**“推理优先”**的 Scaling 范式。</p>
<h3 id="3-1-kaplan-vs-hoffmann-chinchilla">3.1 Kaplan vs. Hoffmann (Chinchilla)</h3>
<ul>
<li><strong>Kaplan 定律 (OpenAI, 2020)</strong>：认为模型性能主要取决于参数量。因此产生了一股不计代价做大参数量(如 GPT-3 175B)的风潮，而训练的数据量并未跟上。</li>
<li><strong>Hoffmann/Chinchilla 定律 (DeepMind, 2022)</strong>：指出 OpenAI 之前的模型是“严重训练不足”的。Chinchilla 指出计算最优(Compute-optimal)的分配是：<strong>模型参数量每翻一倍，训练所需的 Token 数也必须翻一倍</strong>。按照 Chinchilla 定律，一个 10B 参数的模型，最优训练 Token 数大约为 200B。</li>
</ul>
<h3 id="3-2-llama-1-dpj-cqxl-over-training">3.2 Llama-1 的破局：超前训练 (Over-training)</h3>
<p>Chinchilla 定律的假设是：给定一笔固定的<strong>训练算力</strong>预算，如何分配参数量和 Token 数才能让 Loss 降到最低。</p>
<p>但 Meta 的工程师意识到一个关键的工程经济学问题：<strong>对于一个被广泛使用的模型而言，其生命周期内的“推理成本”远大于“训练成本”</strong>。</p>
<p>如果按照 Chinchilla 标准：我们要达到特定的性能，可能会训练一个 50B 的模型并在 1T tokens 上停止。这虽然节省了训练算力，但 50B 模型的推理极度昂贵，无法在单张消费级显卡上运行。</p>
<p><strong>Llama-1 的逆向思维：</strong>
为了达到同样的性能，Meta 故意违背了 Chinchilla 的“训练期算力最优”，选择了去训练一个极其小(7B/13B)的模型，但是给它喂了惊人的 <strong>1T / 1.4T Tokens</strong>(远远超过 Chinchilla 建议的 140B tokens)。</p>
<ul>
<li><strong>Llama 7B</strong> 训练了 1.0T Tokens。</li>
<li><strong>Llama 13B</strong> 训练了 1.4T Tokens。</li>
</ul>
<p>这种**“过度训练(Over-training)”**榨干了每一滴参数的潜力。结果是：Llama 13B 的性能超越了 175B 的 GPT-3，不仅做到了更聪明，而且在推理阶段的速度是 GPT-3 的十几倍，使得大规模部署和单机本地运行成为现实。</p>
<hr>
<h2 id="4-qkjqdgcjxyxlxj">4 千卡集群的工程极限与训练细节</h2>
<p>在 2048 张 80GB A100 GPU(基于 Nvidia 的大规模集群)上连续训练数周，容错率极低。Meta 在分布式工程上做到了当时的极致。</p>
<h3 id="4-1-3d-bhclyttl">4.1 3D 并行策略与吞吐量</h3>
<p>Llama-1 虽然未发布详细的代码库，但其实现大量借鉴了 Megatron-LM 的 3D 并行哲学以最大化吞吐量：</p>
<ol>
<li><strong>数据并行 (Data Parallelism)</strong>：主要用于小模型(如 7B)，模型可被完整装入，仅需同步梯度。</li>
<li><strong>张量并行 (Tensor Parallelism)</strong>：用于切分 QKV 权重矩阵和 FFN 矩阵，降低单卡显存占用。</li>
<li><strong>流水线并行 (Pipeline Parallelism)</strong>：对于 65B 模型，单节点无法容纳所有层，因此按层切割到不同节点。</li>
</ol>
<p>Llama 65B 实现了极高的硬件利用率：单张 A100 处理约 <strong>380 tokens/sec/GPU</strong>，训练 1.4T Tokens 耗时约 21 天。</p>
<h3 id="4-2-xcjjyh-activation-checkpointing">4.2 显存激进优化：Activation Checkpointing</h3>
<p>随着序列长度增加，前向传播保存的激活值(Activations)会撑爆显存。Llama-1 采用了激进的 <strong>重计算(Rematerialization / Activation Checkpointing)</strong> 策略：</p>
<ul>
<li>在前向传播时，不保存所有的中间激活层。</li>
<li>在反向传播时，只保留少量关键断点(Checkpoints)，其余的中间激活在反向计算到该层时<strong>重新计算一次</strong>。
用额外的计算时间换取了宝贵的显存空间，并利用 PyTorch 源码深度的融合(Kernel Fusion)降低了开销。</li>
</ul>
<h3 id="4-3-xcgxzyl-memory-efficient-attention">4.3 显存高效注意力(Memory Efficient Attention)</h3>
<p>Llama-1 集成了由 <code>xFormers</code> 库提供的内存高效注意力机制(类似 FlashAttention 的变体)。
传统的自注意力需要计算 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>Q</mi><msup><mi>K</mi><mi>T</mi></msup></mrow><annotation encoding="application/x-tex">Q K^T</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0358em;vertical-align:-0.1944em;"></span><span class="mord mathnormal">Q</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0715em;">K</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8413em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight" style="margin-right:0.1389em;">T</span></span></span></span></span></span></span></span></span></span></span> 产生 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 的中间矩阵。通过 Tiling 和重计算技巧，xFormers 将注意力机制的显存复杂度从 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><msup><mi>N</mi><mn>2</mn></msup><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N^2)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0641em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8141em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mclose">)</span></span></span></span> 降低到了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi><mo stretchy="false">(</mo><mi>N</mi><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">O(N)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1em;vertical-align:-0.25em;"></span><span class="mord mathnormal" style="margin-right:0.0278em;">O</span><span class="mopen">(</span><span class="mord mathnormal" style="margin-right:0.109em;">N</span><span class="mclose">)</span></span></span></span>，彻底消灭了序列长度带来的显存墙。</p>
<h3 id="4-4-yhqyxlwdx">4.4 优化器与训练稳定性</h3>
<ul>
<li><strong>优化器</strong>：AdamW (<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>β</mi><mn>1</mn></msub><mo>=</mo><mn>0.9</mn><mo separator="true">,</mo><msub><mi>β</mi><mn>2</mn></msub><mo>=</mo><mn>0.95</mn></mrow><annotation encoding="application/x-tex">\\beta_1=0.9, \\beta_2=0.95</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.8889em;vertical-align:-0.1944em;"></span><span class="mord">0.9</span><span class="mpunct">,</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0528em;">β</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0528em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">0.95</span></span></span></span>)。</li>
<li><strong>权重衰减 (Weight Decay)</strong>：设定为 0.1，以防止模型过拟合。</li>
<li><strong>梯度裁剪 (Gradient Clipping)</strong>：设置为 1.0，当梯度范数超过此值时强行截断，防止由于少数“脏数据”导致 Loss 突刺(Loss Spike)。</li>
<li><strong>学习率调度</strong>：采用经典的余弦退火(Cosine Annealing)策略，带有 2000 步的 Warmup 阶段，最终学习率衰减到峰值的 10%。</li>
</ul>
<hr>
<h2 id="5-ytljsdb-hxpj">5 与同类技术对比 (横向评价)</h2>
<table>
<thead>
<tr>
<th align="left">特性</th>
<th align="left">Llama-1 (2023)</th>
<th align="left">GPT-3 (2020)</th>
<th align="left">PaLM (2022)</th>
<th align="left">Chinchilla (2022)</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><strong>参数量</strong></td>
<td align="left">7B - 65B</td>
<td align="left">175B</td>
<td align="left">540B</td>
<td align="left">70B</td>
</tr>
<tr>
<td align="left"><strong>训练数据量</strong></td>
<td align="left"><strong>1T - 1.4T Tokens</strong></td>
<td align="left">300B Tokens</td>
<td align="left">780B Tokens</td>
<td align="left">1.4T Tokens</td>
</tr>
<tr>
<td align="left"><strong>开源状态</strong></td>
<td align="left">权重开源(非商用)</td>
<td align="left">闭源 (API)</td>
<td align="left">闭源 (API)</td>
<td align="left">闭源</td>
</tr>
<tr>
<td align="left"><strong>激活函数</strong></td>
<td align="left">SwiGLU</td>
<td align="left">GeLU</td>
<td align="left">SwiGLU</td>
<td align="left">GeLU</td>
</tr>
<tr>
<td align="left"><strong>位置编码</strong></td>
<td align="left">RoPE</td>
<td align="left">Absolute</td>
<td align="left">RoPE</td>
<td align="left">Relative</td>
</tr>
<tr>
<td align="left"><strong>推理成本</strong></td>
<td align="left"><strong>极低 (7B 单卡可跑)</strong></td>
<td align="left">极高</td>
<td align="left">极其高昂</td>
<td align="left">高</td>
</tr>
</tbody></table>
<hr>
<h2 id="6-jxxylsfx">6 局限性与历史风险</h2>
<ol>
<li><strong>多语言能力羸弱</strong>：由于 67% 的数据是英文，Llama-1 的中文和其他语言支持非常薄弱，往往会出现严重的幻觉或直接退化为英文输出(这促使了后来 Chinese-LLaMA 等二次预训练项目的诞生)。</li>
<li><strong>缺乏对齐微调 (RLHF)</strong>：Llama-1 仅仅是一个预训练的基础模型(Base Model)，没有任何指令微调(SFT)和人类偏好对齐(RLHF)。因此它不会“像助手一样对话”，而是单纯地补全文本(续写)。这催生了随后斯坦福的 Alpaca 项目。</li>
<li><strong>长文本窗口受限</strong>：最大上下文窗口(Context Window)仅有 2048 Tokens，无法处理长篇文档。</li>
</ol>
<h2 id="7-jy-kydhhsddkq">7 结语：开源大航海时代的开启</h2>
<p>Llama-1 虽然禁止了直接的商业化应用，但它将大模型的接力棒交到了数以百万计的全球开发者手中。它证明了小参数量模型的巨大潜力，其后出现的 Alpaca、Vicuna 等衍生模型，都是站在 Llama-1 这个巨人的肩膀上。Llama-1 是 LLM 发展史上的一个分水岭——从此以后，大语言模型不再是几家硅谷巨头锁在实验室里的昂贵玩具，而是真正走向了千行百业。</p>
<hr>
<blockquote>
<p><strong>关联阅读</strong>: <a href="/llm-guide/14-models/14.3-llama/14.3-llama">14.3-LLaMA 家族总览</a> | <a href="../02-Llama-2">Llama-2：全面走向商用与 RLHF 的飞跃</a></p>
</blockquote>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"yy-zxdykymxdbzx","text":"引言：重新定义开源模型的标准线"},{"level":2,"id":"1-jccmjg-base-dense-route","text":"1 基础稠密架构(Base Dense Route)"},{"level":3,"id":"1-1-jccmjgdsjdj","text":"1.1 坚持稠密架构的设计动机"},{"level":3,"id":"1-2-hxzjgjyyltd","text":"1.2 核心组件改进与原理推导"},{"level":4,"id":"1-2-1-ygyh-pre-normalization-y-rms-norm","text":"1.2.1 预归一化(Pre-normalization)与 RMSNorm"},{"level":4,"id":"1-2-2-swi-glu-jhhs-yz-palm","text":"1.2.2 SwiGLU 激活函数(源自 PaLM)"},{"level":4,"id":"1-2-3-xzwzbm-rope-yz-gpt-neox","text":"1.2.3 旋转位置编码 RoPE(源自 GPT-NeoX)"},{"level":2,"id":"2-cdgmsjqxgx-data-cleaning-pipeline","text":"2 超大规模数据清洗管线(Data Cleaning Pipeline)"},{"level":3,"id":"2-1-xlylfb","text":"2.1 训练语料分布"},{"level":3,"id":"2-2-gyjqzyqxcl","text":"2.2 工业级去重与清洗策略"},{"level":3,"id":"2-3-zjj-bpe-fcq-tokenizer","text":"2.3 字节级 BPE 分词器 (Tokenizer)"},{"level":2,"id":"3-sfdly-chinchilla-zy-scaling-laws","text":"3 缩放定律与 Chinchilla 最优(Scaling Laws)"},{"level":3,"id":"3-1-kaplan-vs-hoffmann-chinchilla","text":"3.1 Kaplan vs. Hoffmann (Chinchilla)"},{"level":3,"id":"3-2-llama-1-dpj-cqxl-over-training","text":"3.2 Llama-1 的破局：超前训练 (Over-training)"},{"level":2,"id":"4-qkjqdgcjxyxlxj","text":"4 千卡集群的工程极限与训练细节"},{"level":3,"id":"4-1-3d-bhclyttl","text":"4.1 3D 并行策略与吞吐量"},{"level":3,"id":"4-2-xcjjyh-activation-checkpointing","text":"4.2 显存激进优化：Activation Checkpointing"},{"level":3,"id":"4-3-xcgxzyl-memory-efficient-attention","text":"4.3 显存高效注意力(Memory Efficient Attention)"},{"level":3,"id":"4-4-yhqyxlwdx","text":"4.4 优化器与训练稳定性"},{"level":2,"id":"5-ytljsdb-hxpj","text":"5 与同类技术对比 (横向评价)"},{"level":2,"id":"6-jxxylsfx","text":"6 局限性与历史风险"},{"level":2,"id":"7-jy-kydhhsddkq","text":"7 结语：开源大航海时代的开启"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.3-llama/01-llama-1/02-llama-1-hxjgpx" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.3-llama/01-llama-1/02-llama-1-hxjgpx" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Llama-1 核心架构剖析</h1>
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
