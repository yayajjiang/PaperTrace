"use client";

import { useLang } from "@/lib/i18n";
import { LlmGuideChapterBar } from "@/components/LlmGuideChapterBar";
import { LlmGuideNav } from "@/components/LlmGuideNav";
import { LlmGuideToc } from "@/components/LlmGuideToc";

export default function Page() {
  const { t } = useLang();
  const html = `<h1>OLMo 核心架构与全开放生态剖析</h1>
<blockquote>
<p>🔙 <strong><a href="/llm-guide/14-models/14.4-olmo/14.4-olmo">返回 14.4-OLMo 家族总览</a></strong></p>
</blockquote>
<blockquote>
<p>对应精译: <a href="/llm-guide/14-models/14.4-olmo/01-olmo/01-olmo-jsbgjy">01-OLMo技术报告精译</a>
原文: Groeneveld et al., &quot;OLMo: Accelerating the Science of Language Models&quot;, arXiv:2402.00838 (2024)
分析范围: OLMo-1B 与 OLMo-7B (2024.02 发布)</p>
</blockquote>
<hr>
<h2 id="1-sjln-kysnq-efxnjsxs">1. 设计理念: 科研使能器, 而非性能竞赛选手</h2>
<p>OLMo 的底层设计哲学与同期几乎所有开源模型都不同. 2024 年初, Llama 2、Mistral、Falcon 等模型在开放程度上各有侧重, 但有一个共同点: 它们的核心目标是发布一个「可用的好模型」. OLMo 则选择了一条截然不同的路——它要回答的问题不是「我能做出性能最好的模型吗?&quot;, 而是「我能做出一个让研究社区完全理解其内部运作的模型吗?&quot;</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="center">权重</th>
<th align="center">训练代码</th>
<th align="center">训练数据</th>
<th align="center">中间Checkpoint</th>
<th align="center">训练日志</th>
</tr>
</thead>
<tbody><tr>
<td align="left">GPT-4</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
<td align="center">-</td>
</tr>
<tr>
<td align="left">LLaMA 2</td>
<td align="center">yes</td>
<td align="center">inference</td>
<td align="center">no</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">Mistral</td>
<td align="center">yes</td>
<td align="center">brief</td>
<td align="center">no</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">Falcon</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">partial</td>
<td align="center">no</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">Pythia</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left">BLOOM</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">yes</td>
<td align="center">no</td>
</tr>
<tr>
<td align="left"><strong>OLMo</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
<td align="center"><strong>yes</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 1: OLMo 与同期主流模型的开放程度对比.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: 这种极端开放的代价是明确的. AI2 作为非营利机构, 没有商业竞争压力, 可以承受「竞争对手直接复制训练方案&quot;的风险. 但对于绝大多数商业实验室来说, 这种级别的开放在经济上是不理性的——训练数据、中间Checkpoint和训练日志构成了模型竞争力的核心壁垒. OLMo 的开放策略因此具有不可复制的独特性: 它不是「商业开源&quot;(open-washing), 而是「科学开源&quot;. 这种定位决定了 OLMo 在架构选择上不需要追求原创突破, 而是追求可复现性、可分析性和工程稳健性.</p>
</blockquote>
<p>这一理念直接体现在 OLMo 的两大支柱设计上. 第一是<strong>数据开放</strong>: Dolma 数据集不仅公开了 2.7T token 的完整语料, 还公开了数据整理的完整流水线代码, 并且在发布中保持各数据来源的物理分离——研究者可以精确控制训练数据中网页、代码、学术论文、书籍的比例, 从而系统性地研究数据构成对模型能力的影响. 第二是<strong>过程开放</strong>: 超过 500 个中间Checkpoint(每 1000 步保存一个)和完整的训练日志(WandB metrics、loss curves、learning rate schedule)被一并发布, 使得研究者可以追踪模型能力从随机初始化到最终状态的演化轨迹.</p>
<blockquote>
<p><strong>Thinking (Design Motivation)</strong>: 中间Checkpoint的科研价值常被低估. 对于黑盒模型, 研究者只能看到「训练前&quot;和「训练后」两个快照; 而 OLMo 提供了数百个中间状态, 使得以下研究成为可能: (1) 模型在什么时候「学会」某种能力? (2) 不同能力(如常识推理 vs 代码生成)的习得曲线是否同步? (3) 训练后期的 loss spike 是否与特定能力的退化相关? 这些问题的答案对于理解语言模型的涌现机制至关重要, 但此前没有任何主流模型提供过如此丰富的纵向数据.</p>
</blockquote>
<hr>
<h2 id="2-jggl-wsgszjsj">2. 架构概览: 务实跟随最佳实践</h2>
<p>OLMo 采用标准的 decoder-only Transformer 架构, 提供 1B 和 7B 两种规模. 其架构选择的核心原则是「跟随经过验证的最佳实践&quot;, 而非追求原创创新.</p>
<table>
<thead>
<tr>
<th align="left">配置</th>
<th align="center">OLMo-1B</th>
<th align="center">OLMo-7B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">层数 L</td>
<td align="center">16</td>
<td align="center">32</td>
</tr>
<tr>
<td align="left">隐藏维度 D</td>
<td align="center">2048</td>
<td align="center">4096</td>
</tr>
<tr>
<td align="left">注意力头数 H</td>
<td align="center">16</td>
<td align="center">32</td>
</tr>
<tr>
<td align="left">每头维度 d_head</td>
<td align="center">128</td>
<td align="center">128</td>
</tr>
<tr>
<td align="left">FFN 中间维度</td>
<td align="center">~5461 (取整至 128 倍数: 5504)</td>
<td align="center">~10922 (取整至 128 倍数: 11008)</td>
</tr>
<tr>
<td align="left">词表大小 V</td>
<td align="center">50,304 (实际 50,280 + 填充)</td>
<td align="center"></td>
</tr>
<tr>
<td align="left">位置编码</td>
<td align="center">RoPE</td>
<td align="center"></td>
</tr>
<tr>
<td align="left">归一化</td>
<td align="center">非参数化 Layer Norm</td>
<td align="center"></td>
</tr>
<tr>
<td align="left">激活函数</td>
<td align="center">SwiGLU</td>
<td align="center"></td>
</tr>
<tr>
<td align="left">偏置项</td>
<td align="center">无</td>
<td align="center"></td>
</tr>
<tr>
<td align="left">训练 Token</td>
<td align="center">2T</td>
<td align="center">2.46T</td>
</tr>
<tr>
<td align="left">全局 Batch Size</td>
<td align="center">~4M tokens</td>
<td align="center">~4M tokens</td>
</tr>
<tr>
<td align="left">序列长度</td>
<td align="center">2048</td>
<td align="center">2048</td>
</tr>
<tr>
<td align="left">峰值学习率</td>
<td align="center">4.0E-4</td>
<td align="center">3.0E-4</td>
</tr>
<tr>
<td align="left">权重共享</td>
<td align="center">是 (embedding ↔ LM head)</td>
<td align="center">否</td>
</tr>
</tbody></table>
<blockquote>
<p>表 2: OLMo 模型架构与训练配置.</p>
</blockquote>
<h3 id="2-1-wpzjg">2.1 无偏置架构</h3>
<p>OLMo 从架构中移除了所有偏置项(bias), 包括线性层、Layer Norm 和注意力层中的偏置. 这一设计直接继承自 PaLM 和 LLaMA 家族.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 移除偏置项的理论依据来自 PaLM 的观察: 在大规模训练中, 偏置项容易成为数值不稳定性的来源, 尤其是在使用混合精度(bfloat16)训练时, 偏置的梯度更新可能因为数值范围过小而下溢为零. 从参数量角度看, 移除偏置对 7B 模型仅减少约 0.1% 的参数, 几乎可以忽略. 但移除偏置有一个隐性好处: 它使得权重的量化(如 INT8/INT4)更加均匀, 因为偏置的分布通常与权重不同, 会给量化校准带来额外的复杂度. 不过, 无偏置设计并非没有争议: 一些研究表明, 在某些任务(如代码生成)上, 偏置项对捕获特定的语法模式有帮助. OLMo 的作者选择保守地跟随 PaLM/LLaMA 的做法, 这与他们「稳健优先」的整体设计理念一致.</p>
</blockquote>
<h3 id="2-2-fcsh-layer-norm-ygsjdxz">2.2 非参数化 Layer Norm: 一个少见的选择</h3>
<p>OLMo 使用 Layer Norm 的非参数化形式(non-parametric Layer Norm), 即不引入可学习的增益(gain)和偏置(bias)参数, 仅执行标准化操作: <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>y</mi><mo>=</mo><mfrac><mrow><mi>x</mi><mo>−</mo><mi>μ</mi></mrow><msqrt><mrow><msup><mi>σ</mi><mn>2</mn></msup><mo>+</mo><mi>ϵ</mi></mrow></msqrt></mfrac></mrow><annotation encoding="application/x-tex">y = \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.625em;vertical-align:-0.1944em;"></span><span class="mord mathnormal" style="margin-right:0.0359em;">y</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:1.3924em;vertical-align:-0.538em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8544em;"><span style="top:-2.5445em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord sqrt mtight"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.9221em;"><span class="svg-align" style="top:-3em;"><span class="pstrut" style="height:3em;"></span><span class="mord mtight" style="padding-left:0.833em;"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.0359em;">σ</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.7463em;"><span style="top:-2.786em;margin-right:0.0714em;"><span class="pstrut" style="height:2.5em;"></span><span class="sizing reset-size3 size1 mtight"><span class="mord mtight">2</span></span></span></span></span></span></span></span><span class="mbin mtight">+</span><span class="mord mathnormal mtight">ϵ</span></span></span><span style="top:-2.8821em;"><span class="pstrut" style="height:3em;"></span><span class="hide-tail mtight" style="min-width:0.853em;height:1.08em;"><svg xmlns="http://www.w3.org/2000/svg" width="400em" height="1.08em" viewBox="0 0 400000 1080" preserveAspectRatio="xMinYMin slice"><path d="M95,702
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
M834 80h400000v40h-400000z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.1179em;"><span></span></span></span></span></span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.4461em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">x</span><span class="mbin mtight">−</span><span class="mord mathnormal mtight">μ</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.538em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span>.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 这是一个在 2024 年相当少见的选择. 同期主流模型几乎全部使用 RMSNorm(LLaMA 2/3、Qwen2/3、DeepSeek-V3)或参数化 Layer Norm(GPT-3、PaLM). RMSNorm 比标准 Layer Norm 更快(省去了均值计算), 且被证明在大模型上具有更好的训练稳定性; 参数化 Layer Norm 则保留了增益参数, 理论上给予模型更多的表达能力灵活性. OLMo 选择非参数化 Layer Norm 有两个原因. 第一, 速度: 作者明确提到这是「考虑过的变体中最快的&quot;. 实际上, 非参数化 LN 的计算量略小于参数化 LN(少两次元素级乘法), 在 7B 规模上这个差距微乎其微, 但在大规模集群训练中, 每一层微秒级的节省都会累积. 第二, 保守性: 作者称其为「最安全的选择&quot;. 在训练稳定性方面, 移除可学习参数意味着少了一层可能出错的变量——在 2.5T token 的长训练过程中, 任何超参数的不稳定性都会被放大. 这个选择体现了 OLMo 的务实: 不在归一化方法上做实验, 而是选择一个经过充分验证、最不可能出问题的方案.</p>
</blockquote>
<h3 id="2-3-swi-glu-yttlyh">2.3 SwiGLU 与吞吐量优化</h3>
<p>OLMo 使用 SwiGLU 激活函数替代 ReLU, 并遵循 LLaMA 的设计将 FFN 中间维度设为约 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mi>d</mi></mrow><annotation encoding="application/x-tex">\\frac{8}{3}d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mord mathnormal">d</span></span></span></span>. 但 OLMo 在此基础上增加了一个细节优化: 将中间维度向上取整到最接近的 128 的倍数. 对于 7B 模型, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>8</mn><mn>3</mn></mfrac><mo>×</mo><mn>4096</mn><mo>≈</mo><mn>10922</mn></mrow><annotation encoding="application/x-tex">\\frac{8}{3} \\times 4096 \\approx 10922</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">3</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">8</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10922</span></span></span></span>, 取整后为 11008.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 这个取整操作看似微不足道, 实则是一个重要的 GPU 效率优化. NVIDIA GPU 的 Tensor Core 在处理矩阵乘法时, 对维度为 128 的倍数(或 64/256 的倍数, 取决于具体 GPU 架构)的张量有最优的内存访问模式和计算效率. 当 FFN 的输入维度为 4096、中间维度为 11008 时, <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4096</mn><mo>×</mo><mn>11008</mn></mrow><annotation encoding="application/x-tex">4096 \\times 11008</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">11008</span></span></span></span> 的 GEMM 运算在 A100/H100 上的吞吐量会显著高于 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>4096</mn><mo>×</mo><mn>10922</mn></mrow><annotation encoding="application/x-tex">4096 \\times 10922</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10922</span></span></span></span>. 代价是增加了约 0.8% 的参数量(从 10922 到 11008), 对于 7B 模型来说这个开销完全可以接受. 这种「硬件对齐」的维度设计在大模型训练中已成为标准实践, 但 OLMo 在论文中明确提及这一点, 体现了其对工程细节的重视. 值得注意的是, SwiGLU 是门控激活函数, 其输出维度是输入的一半, 因此实际的 SwiGLU 输入维度为 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>2</mn><mo>×</mo><mn>11008</mn><mo>=</mo><mn>22016</mn></mrow><annotation encoding="application/x-tex">2 \\times 11008 = 22016</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">2</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">11008</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">22016</span></span></span></span>.</p>
</blockquote>
<h3 id="2-4-xzwzbm-rope">2.4 旋转位置编码(RoPE)</h3>
<p>OLMo 采用旋转位置编码(Rotary Position Embedding, RoPE)替代绝对位置编码, 与 LLaMA、PaLM 等保持一致. RoPE 通过将查询和键向量旋转一个与位置相关的角度, 使得注意力分数天然编码了相对位置信息.</p>
<p>RoPE 的数学表达为: 对于位置 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>m</mi></mrow><annotation encoding="application/x-tex">m</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">m</span></span></span></span> 的向量 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.4306em;"></span><span class="mord mathnormal">x</span></span></span></span>, 其旋转后的表示为:</p>
<span class="katex-display"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><semantics><mrow><msubsup><mi>R</mi><mrow><mi mathvariant="normal">Θ</mi><mo separator="true">,</mo><mi>m</mi></mrow><mi>d</mi></msubsup><mi>x</mi><mo>=</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>1</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>2</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>3</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>4</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mrow><mi>d</mi><mo>−</mo><mn>1</mn></mrow></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mi>d</mi></msub></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>⊗</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>cos</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>+</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><msub><mi>x</mi><mn>2</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>1</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><msub><mi>x</mi><mn>4</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mn>3</mn></msub></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mo>−</mo><msub><mi>x</mi><mi>d</mi></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><msub><mi>x</mi><mrow><mi>d</mi><mo>−</mo><mn>1</mn></mrow></msub></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow><mo>⊗</mo><mrow><mo fence="true">(</mo><mtable rowspacing="0.16em" columnalign="center" columnspacing="1em"><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>1</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mn>2</mn></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi mathvariant="normal">⋮</mi><mpadded height="0em" voffset="0em"><mspace mathbackground="black" width="0em" height="1.5em"></mspace></mpadded></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd></mtr><mtr><mtd><mstyle scriptlevel="0" displaystyle="false"><mrow><mi>sin</mi><mo>⁡</mo><mi>m</mi><msub><mi>θ</mi><mrow><mi>d</mi><mi mathvariant="normal">/</mi><mn>2</mn></mrow></msub></mrow></mstyle></mtd></mtr></mtable><mo fence="true">)</mo></mrow></mrow><annotation encoding="application/x-tex">R_{\\Theta, m}^d x = \\begin{pmatrix} x_1 \\\\ x_2 \\\\ x_3 \\\\ x_4 \\\\ \\vdots \\\\ x_{d-1} \\\\ x_d \\end{pmatrix} \\otimes \\begin{pmatrix} \\cos m\\theta_1 \\\\ \\cos m\\theta_1 \\\\ \\cos m\\theta_2 \\\\ \\cos m\\theta_2 \\\\ \\vdots \\\\ \\cos m\\theta_{d/2} \\\\ \\cos m\\theta_{d/2} \\end{pmatrix} + \\begin{pmatrix} -x_2 \\\\ x_1 \\\\ -x_4 \\\\ x_3 \\\\ \\vdots \\\\ -x_d \\\\ x_{d-1} \\end{pmatrix} \\otimes \\begin{pmatrix} \\sin m\\theta_1 \\\\ \\sin m\\theta_1 \\\\ \\sin m\\theta_2 \\\\ \\sin m\\theta_2 \\\\ \\vdots \\\\ \\sin m\\theta_{d/2} \\\\ \\sin m\\theta_{d/2} \\end{pmatrix}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.2822em;vertical-align:-0.3831em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0077em;">R</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8991em;"><span style="top:-2.453em;margin-left:-0.0077em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">Θ</span><span class="mpunct mtight">,</span><span class="mord mathnormal mtight">m</span></span></span></span><span style="top:-3.113em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3831em;"><span></span></span></span></span></span></span><span class="mord mathnormal">x</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:9.06em;vertical-align:-4.28em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1
c-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,
-36,557 l0,5484c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,
949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9
c0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,
-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189
l0,-5492c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,
-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">4</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,
63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5
c11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0,5409
c-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664
c-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11
c0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17
c242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558
l0,-5544c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,
-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:9.06em;vertical-align:-4.28em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1
c-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,
-36,557 l0,5484c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,
949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9
c0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,
-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189
l0,-5492c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,
-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">cos</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,
63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5
c11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0,5409
c-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664
c-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11
c0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17
c242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558
l0,-5544c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,
-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">+</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:9.06em;vertical-align:-4.28em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1
c-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,
-36,557 l0,5484c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,
949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9
c0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,
-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189
l0,-5492c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,
-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">−</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">−</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">4</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">3</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord">−</span><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">d</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord mathnormal">x</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3361em;"><span style="top:-2.55em;margin-left:0em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mbin mtight">−</span><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.2083em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,
63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5
c11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0,5409
c-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664
c-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11
c0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17
c242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558
l0,-5544c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,
-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">⊗</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:9.06em;vertical-align:-4.28em;"></span><span class="minner"><span class="mopen"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1
c-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,
-36,557 l0,5484c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,
949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9
c0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,
-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189
l0,-5492c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,
-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span><span class="mord"><span class="mtable"><span class="col-align-c"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.78em;"><span style="top:-7.6275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-6.4275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">1</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-5.2275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-4.0275em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3011em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight">2</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span></span></span><span style="top:-2.1675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mord"><span class="mord">⋮</span><span class="mord rule" style="border-right-width:0em;border-top-width:1.5em;bottom:0em;"></span></span></span></span><span style="top:-0.9675em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span><span style="top:0.2325em;"><span class="pstrut" style="height:3.6875em;"></span><span class="mord"><span class="mop">sin</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">m</span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3448em;"><span style="top:-2.5198em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight">d</span><span class="mord mtight">/2</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.3552em;"><span></span></span></span></span></span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.28em;"><span></span></span></span></span></span></span></span><span class="mclose"><span class="delimsizing mult"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:4.7499em;"><span style="top:-6.7499em;"><span class="pstrut" style="height:11em;"></span><span style="width:0.875em;height:9em;"><svg xmlns="http://www.w3.org/2000/svg" width="0.875em" height="9em" viewBox="0 0 875 9000"><path d="M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,
63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5
c11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0,5409
c-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664
c-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11
c0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17
c242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558
l0,-5544c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,
-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z"/></svg></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:4.2501em;"><span></span></span></span></span></span></span></span></span></span></span></span><p>其中 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msub><mi>θ</mi><mi>i</mi></msub><mo>=</mo><msup><mn>10000</mn><mrow><mo>−</mo><mn>2</mn><mo stretchy="false">(</mo><mi>i</mi><mo>−</mo><mn>1</mn><mo stretchy="false">)</mo><mi mathvariant="normal">/</mi><mi>d</mi></mrow></msup></mrow><annotation encoding="application/x-tex">\\theta_i = 10000^{-2(i-1)/d}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.8444em;vertical-align:-0.15em;"></span><span class="mord"><span class="mord mathnormal" style="margin-right:0.0278em;">θ</span><span class="msupsub"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.3117em;"><span style="top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">i</span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.15em;"><span></span></span></span></span></span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.888em;"></span><span class="mord">1000</span><span class="mord"><span class="mord">0</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">−</span><span class="mord mtight">2</span><span class="mopen mtight">(</span><span class="mord mathnormal mtight">i</span><span class="mbin mtight">−</span><span class="mord mtight">1</span><span class="mclose mtight">)</span><span class="mord mtight">/</span><span class="mord mathnormal mtight">d</span></span></span></span></span></span></span></span></span></span></span></span> 为旋转角频率.</p>
<p>OLMo-1/7B 的上下文长度为 2048, 在这个尺度下 RoPE 的基频(base frequency) <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>10000</mn></mrow><annotation encoding="application/x-tex">10000</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">10000</span></span></span></span> 不需要像后来的 LLaMA 3 那样扩展到 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>500000</mn></mrow><annotation encoding="application/x-tex">500000</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">500000</span></span></span></span>.</p>
<h3 id="2-5-cbsj-c-pii-zbdyjdq">2.5 词表设计: 从 PII 遮蔽到硬件对齐</h3>
<p>OLMo 使用 GPT-NeoX-20B 的 BPE 分词器的修改版本, 添加了用于遮蔽个人身份信息(PII)的额外 token. 最终词表大小为 50,280. 但为了提高训练吞吐量, 嵌入矩阵的大小被填充到 50,304(128 的倍数).</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 词表填充(padding vocabulary size to a multiple of 128)是一个典型的「工程微优化」. 在 embedding 层的矩阵乘法中, 输入是 one-hot 或索引形式的 token ID, 输出是 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi><mo>×</mo><mi>d</mi></mrow><annotation encoding="application/x-tex">V \\times d</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7667em;vertical-align:-0.0833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6944em;"></span><span class="mord mathnormal">d</span></span></span></span> 的嵌入向量. 当 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>V</mi></mrow><annotation encoding="application/x-tex">V</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.2222em;">V</span></span></span></span> 不是 128 的倍数时, GPU 的 warp 调度会产生不均匀的负载, 导致部分计算单元闲置. 填充到 50,304 意味着浪费了 24 个 token 位置的嵌入参数, 但对于 7B 模型, 这仅增加了 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mn>24</mn><mo>×</mo><mn>4096</mn><mo>≈</mo><mn>98304</mn></mrow><annotation encoding="application/x-tex">24 \\times 4096 \\approx 98304</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.7278em;vertical-align:-0.0833em;"></span><span class="mord">24</span><span class="mspace" style="margin-right:0.2222em;"></span><span class="mbin">×</span><span class="mspace" style="margin-right:0.2222em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">4096</span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">≈</span><span class="mspace" style="margin-right:0.2778em;"></span></span><span class="base"><span class="strut" style="height:0.6444em;"></span><span class="mord">98304</span></span></span></span> 个参数, 占总数不到 0.0014%, 完全可以忽略. 而吞吐量的提升是实实在在的. 另一个值得注意的点是 PII 遮蔽 token: 这是 OLMo 在数据安全方面的一个具体措施, 通过在分词阶段将姓名、地址、电话号码等 PII 替换为特殊 token, 降低了模型记忆和输出敏感信息的风险. 这种在分词器层面处理 PII 的方法比后处理过滤更根本, 因为被遮蔽的 PII 不会进入模型的训练目标.</p>
</blockquote>
<hr>
<h2 id="3-xlgc-kyjyzyjdcl">3. 训练工程: 跨硬件验证与精度策略</h2>
<h3 id="3-1-fbsxlkj">3.1 分布式训练框架</h3>
<p>OLMo 使用 PyTorch 的 FSDP(Fully Sharded Data Parallel)框架, 结合 ZeRO 优化器状态分片策略. 在 7B 规模上, FSDP 将模型权重和优化器状态分片到所有 GPU 上, 使得每个 GPU 只需存储 <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mfrac><mn>1</mn><mi>N</mi></mfrac></mrow><annotation encoding="application/x-tex">\\frac{1}{N}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.1901em;vertical-align:-0.345em;"></span><span class="mord"><span class="mopen nulldelimiter"></span><span class="mfrac"><span class="vlist-t vlist-t2"><span class="vlist-r"><span class="vlist" style="height:0.8451em;"><span style="top:-2.655em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mathnormal mtight" style="margin-right:0.109em;">N</span></span></span></span><span style="top:-3.23em;"><span class="pstrut" style="height:3em;"></span><span class="frac-line" style="border-bottom-width:0.04em;"></span></span><span style="top:-3.394em;"><span class="pstrut" style="height:3em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mtight"><span class="mord mtight">1</span></span></span></span></span><span class="vlist-s">​</span></span><span class="vlist-r"><span class="vlist" style="height:0.345em;"><span></span></span></span></span></span><span class="mclose nulldelimiter"></span></span></span></span></span> 的模型参数(N 为 GPU 数量).</p>
<p>全局 batch size 恒定为约 4M tokens(2048 个实例, 每个序列长度 2048). 在 7B 模型上, 这使得每个 GPU 可以使用 4096 token 的 micro-batch size.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 固定全局 batch size 是一个重要的设计决策. 在超大规模训练中, 有些工作(如 GPT-3)采用逐渐增大 batch size 的策略, 以在训练初期利用更大的梯度噪声帮助逃离局部最优, 在训练后期使用大 batch 提高吞吐量. OLMo 选择固定 batch size 的理由是简化复现: 变化的 batch size 会使得学习率调度和优化器动态更加复杂, 增加复现难度. 约 4M tokens 的 batch size 在 2024 年是中等规模——比 GPT-3(3.2M)略大, 但远小于 LLaMA 2(4M, 但使用了更长的上下文)和后来的 LLaMA 3(15M+). 这个选择反映了 OLMo 在「训练效率」和「复现简单性&quot;之间的权衡.</p>
</blockquote>
<h3 id="3-2-hhjdxldwdxcs">3.2 混合精度训练的稳定性措施</h3>
<p>OLMo 采用 bfloat16 混合精度训练, 但有两个关键的稳定性措施:</p>
<ol>
<li><strong>权重在 optimizer step 期间保持 FP32</strong>: 每个 Transformer 块内的权重仅在 forward 和 backward pass 期间临时转换为 bfloat16, 优化器状态(一阶/二阶动量)始终在全精度下维护.</li>
<li><strong>梯度 all-reduce 使用 FP32</strong>: 梯度在 GPU 间聚合时使用全精度, 避免 bfloat16 的数值误差在跨设备通信中累积.</li>
</ol>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 这两个措施是混合精度训练中「稳定性防线&quot;的经典配置. bfloat16 的动态范围(8 位指数)与 FP32 相同, 但精度(7 位尾数)只有 FP32 的一半. 在 optimizer step 中, 如果权重和梯度都是 bfloat16, 小量级的权重更新可能因为尾数精度不足而被「吞没」(underflow), 导致某些参数在整个训练过程中几乎不更新. 保持 FP32 的优化器状态确保每次更新都精确执行. 同样, 梯度 all-reduce 使用 FP32 是为了防止多 GPU 场景下的数值误差累积: 当 256 个 GPU 的梯度被聚合时, 即使每个 GPU 的梯度误差很小, 累积后的偏差可能显著影响收敛. 这些措施在 A100/H100 上是标准做法, 但 OLMo 明确文档化了这些选择, 为复现者提供了清晰的参考.</p>
</blockquote>
<h3 id="3-3-yhqpz">3.3 优化器配置</h3>
<p>OLMo 使用 AdamW 优化器, 具体超参数如下:</p>
<table>
<thead>
<tr>
<th align="left">超参数</th>
<th align="center">OLMo-7B</th>
</tr>
</thead>
<tbody><tr>
<td align="left">峰值学习率</td>
<td align="center">3.0E-4</td>
</tr>
<tr>
<td align="left">最小学习率</td>
<td align="center">3.0E-5 (峰值的 1/10)</td>
</tr>
<tr>
<td align="left">Warmup 步数</td>
<td align="center">5000 (~21B tokens)</td>
</tr>
<tr>
<td align="left">LR Schedule</td>
<td align="center">线性衰减</td>
</tr>
<tr>
<td align="left">权重衰减</td>
<td align="center">0.1</td>
</tr>
<tr>
<td align="left">Beta1 / Beta2</td>
<td align="center">0.9 / 0.95</td>
</tr>
<tr>
<td align="left">Epsilon</td>
<td align="center">1.0E-5</td>
</tr>
<tr>
<td align="left">梯度裁剪</td>
<td align="center">全局 L2 norm ≤ 1.0</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 这个优化器配置有几个值得注意的点. 第一, Beta2=0.95 比 Adam 的默认值 0.999 小很多, 这意味着二阶动量的衰减更快, 优化器对近期梯度的权重更高. 在超长训练(2.5T tokens)中, 如果 Beta2 过大, 早期的梯度信息会持续影响当前的参数更新, 可能导致收敛变慢或陷入平坦区域. 第二, 线性衰减(vs 余弦衰减)的选择同样出于复现简单性: 线性衰减的公式更简单, 不依赖于总训练步数的精确估计. 第三, 学习率衰减至峰值的 1/10 而非 0, 这是 OLMo 的一个特色: 作者在实验中发现, 在 2.46T token 训练结束后, 额外用衰减至 0 的 1000 步「退火&quot;(annealing)可以提升最终性能. 这说明模型在名义上的训练终点并未完全收敛, 仍有微调空间.</p>
</blockquote>
<h3 id="3-4-kyjptxlyz">3.4 跨硬件平台训练验证</h3>
<p>OLMo 在两个不同的计算集群上训练模型, 以验证代码的可移植性和结果一致性:</p>
<table>
<thead>
<tr>
<th align="left">集群</th>
<th align="left">GPU</th>
<th align="right">节点数</th>
<th align="left">节点配置</th>
<th align="center">互连带宽</th>
</tr>
</thead>
<tbody><tr>
<td align="left">LUMI</td>
<td align="left">AMD MI250X</td>
<td align="right">256</td>
<td align="left">4 GPU/节点 (8 逻辑设备)</td>
<td align="center">800 Gbps</td>
</tr>
<tr>
<td align="left">MosaicML</td>
<td align="left">NVIDIA A100-40GB</td>
<td align="right">27</td>
<td align="left">8 GPU/节点</td>
<td align="center">800 Gbps</td>
</tr>
</tbody></table>
<blockquote>
<p><strong>Thinking (Infrastructure)</strong>: 跨硬件平台验证是 OLMo 的一个标志性工程决策. 在 2024 年, 大规模语言模型训练几乎被 NVIDIA GPU 垄断, AMD 的软件栈(ROCm)在 PyTorch 生态中的成熟度明显落后于 CUDA. AI2 选择在 LUMI(欧洲最大的超算, 全部采用 AMD GPU)和 MosaicML(NVIDIA A100)上同时训练, 并验证两个运行的评估结果「几乎相同」, 具有双重意义. 对研究社区而言, 这证明了在 7B 规模上, 硬件选择对最终模型质量的影响是次要的——这为考虑使用非 NVIDIA 硬件(尤其是欧洲的 LUMI、美国的 Frontier 等超算)的研究机构提供了信心. 对工程实践而言, 这验证了 OLMo 代码库的可移植性: 如果代码硬编码了 CUDA 特定的 kernel 或假设, 跨平台训练就会失败. 当然, 这里有一个重要的 caveat: 7B 规模相对较小, 通信开销在总训练时间中的占比不高. 在更大规模(如 70B+)上, AMD 和 NVIDIA 之间在通信库效率、kernel 优化深度上的差距可能会放大, 导致训练速度差异显著. 此外, MI250X 是双芯片模块, 每个物理 GPU 对应两个逻辑设备, 这增加了编程复杂度——作者需要显式处理 chip-to-chip 的通信, 而 NVIDIA A100 是单芯片设计.</p>
</blockquote>
<hr>
<h2 id="4-dolma-kfsjjdkysj">4. Dolma: 开放数据集的科研设计</h2>
<h3 id="4-1-sjgc">4.1 数据构成</h3>
<p>Dolma 是 OLMo 的预训练数据集, 总规模为 3 万亿 token, 由 7 个来源组成:</p>
<table>
<thead>
<tr>
<th align="left">来源</th>
<th align="left">类型</th>
<th align="right">Token 数 (十亿)</th>
<th align="right">占比</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Common Crawl</td>
<td align="left">网页</td>
<td align="right">2,180</td>
<td align="right">81.7%</td>
</tr>
<tr>
<td align="left">GitHub</td>
<td align="left">代码</td>
<td align="right">342</td>
<td align="right">12.8%</td>
</tr>
<tr>
<td align="left">Reddit</td>
<td align="left">社交媒体</td>
<td align="right">80</td>
<td align="right">3.0%</td>
</tr>
<tr>
<td align="left">Semantic Scholar</td>
<td align="left">学术论文</td>
<td align="right">57</td>
<td align="right">2.1%</td>
</tr>
<tr>
<td align="left">Project Gutenberg</td>
<td align="left">书籍</td>
<td align="right">5.2</td>
<td align="right">0.2%</td>
</tr>
<tr>
<td align="left">Wikipedia</td>
<td align="left">百科全书</td>
<td align="right">3.7</td>
<td align="right">0.1%</td>
</tr>
<tr>
<td align="left"><strong>Total</strong></td>
<td align="left"></td>
<td align="right"><strong>2,668</strong></td>
<td align="right"><strong>100%</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 3: Dolma 数据集构成 (基于 GPT-NeoX 分词器).</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Common Crawl 占比高达 81.7%, 这与 LLaMA 1(约 67%)和 LLaMA 2(约 80%)类似, 但显著高于一些更近期的模型(如 Llama 3 专门将 CC 占比降低到 50% 以下). 高 CC 占比的好处是数据获取成本低、规模巨大; 坏处是网页数据质量参差不齐, 包含大量重复、低质、噪声内容. OLMo 对此的应对是一套完整的数据整理流水线: 语言过滤、质量过滤、内容过滤、去重、多来源混合、分词. 但更重要的是, Dolma 在发布中保持了各来源的物理分离——研究者可以精确控制训练数据中各来源的比例, 从而系统性地研究「如果我将 CC 占比从 80% 降到 50%、同时增加代码和书籍的占比, 模型在代码生成和知识密集型任务上的表现会如何变化?&quot;. 这种「数据消融&quot;能力在黑盒模型上完全不可能实现, 是 OLMo 科学价值的核心来源之一.</p>
</blockquote>
<h3 id="4-2-sjzllsx">4.2 数据整理流水线</h3>
<p>Dolma 的构建流水线包括六个阶段: (1) 语言过滤, (2) 质量过滤, (3) 内容过滤, (4) 去重, (5) 多来源混合, (6) 分词. 每个阶段的代码都随数据集一起开源.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 数据整理流水线的开源具有独立的价值. 此前, 即使数据集被公开(如 The Pile、RedPajama), 其整理代码通常不随数据集一起发布, 导致研究者无法复现数据构建过程, 也无法在相同流水线上做消融实验. Dolma 的做法是: 不仅给鱼, 还给渔具. 整理工具包(<code>dolma</code> Python 包)可以被用于快速构建新的预训练语料库, 降低了开放语言模型研究的门槛. 此外, AI2 还发布了 WIMBD(What&#39;s In My Big Data)工具, 用于大规模数据集的分析和审计, 帮助研究者理解训练数据的分布特征.</p>
</blockquote>
<hr>
<h2 id="5-pgtx-zxfxyqwr">5. 评估体系: 纵向分析与去污染</h2>
<h3 id="5-1-szpgkj">5.1 双重评估框架</h3>
<p>OLMo 采用两个互补的评估工具:</p>
<ul>
<li><strong>Catwalk</strong>: 用于下游任务评估, 支持广泛的 zero-shot 和 few-shot 任务.</li>
<li><strong>Paloma</strong>: 用于内在语言建模评估, 包含 585 个不同的文本领域, 以分层样本抽取, 避免被网页主导的语料库偏见所主导.</li>
</ul>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: Paloma 的设计理念非常值得称赞. 传统困惑度评估通常报告一个 aggregate 数字(如在 C4 上的 perplexity), 但这个数字会被数据量最大的领域(网页)主导, 掩盖模型在稀有领域(如学术论文、诗歌)上的表现. Paloma 将 585 个领域平等呈现, 每个领域独立计算 bits per byte, 从而提供了一个更全面的语言建模能力画像. 这种设计使得研究者可以回答诸如「模型在正式写作(如学术论文)和口语化文本(如 Reddit 帖子)上的拟合能力是否有显著差异?」这样的问题. 评估结果显示, OLMo 在 C4(88.8% CC 训练数据)上表现最好, 但在 WikiText-103 和学术文献上相对落后——这揭示了一个 fundamental tension: 大规模预训练天然偏向网页文本(因为它最 abundant 且 cheapest to acquire), 但高质量来源(如 Wikipedia、arXiv)的知识密度更高. 随着模型规模增大, 这种「网页偏见」可能导致模型在需要精确知识或结构化推理的任务上表现不佳.</p>
</blockquote>
<h3 id="5-2-xsqwr">5.2 显式去污染</h3>
<p>OLMo 对 Paloma 评估进行了显式去污染(decontamination): 从预训练数据中移除了任何包含 Paloma 评估数据段落的文档. 这是当时最大规模的语言模型去污染实践.</p>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: 去污染的重要性常被低估. 如果预训练数据中包含了评估任务的测试样本, 模型在评估时实际上是在「开卷考试&quot;, 分数会被虚高. 此前的大多数开源模型(包括 LLaMA 1/2)并未明确披露是否进行了去污染, 或去污染的粒度如何(是整个文档移除, 还是仅移除重叠段落?). OLMo 的做法是段落级别的去污染: 如果预训练文档中的任何段落与 Paloma 评估数据有 n-gram 重叠, 整个文档被移除. 这可能导致预训练数据量的轻微减少, 但确保了评估结果的可靠性. 这种对评估严谨性的追求, 与 OLMo 整体的科学严谨定位一致.</p>
</blockquote>
<h3 id="5-3-zxpgqdjgjc">5.3 在线评估驱动架构决策</h3>
<p>在整个训练过程中, OLMo 每 1000 步骤(约 4B tokens)执行一次循环内评估(in-loop evaluation), 在 8 个核心下游任务上评估当前Checkpoint的性能. 这些评估结果直接用于指导架构、初始化、优化器、学习率调度和数据混合的决策.</p>
<blockquote>
<p><strong>Thinking (Architecture Details)</strong>: 在线评估在工程实践中很常见, 但 OLMo 将其系统化并文档化. 每 1000 步评估一次意味着在 2.5T token 的训练中, 会有约 625 次评估Checkpoint. 这些Checkpoint不仅用于监控训练健康度(loss spikes、梯度爆炸等), 还用于回答「这个超参数调整是否真的有效?」的科学问题. 例如, 作者通过在线评估发现: 将学习率衰减 schedule 从余弦改为线性, 在大部分任务上没有显著差异, 但线性 schedule 更简单、更易于复现, 因此最终选择了线性. 这种「数据驱动决策&quot;的方法论, 只有在完全开放的训练过程中才能实现.</p>
</blockquote>
<hr>
<h2 id="6-xndw-jzleflx">6. 性能定位: 竞争力而非领先</h2>
<h3 id="6-1-xyrwpg">6.1 下游任务评估</h3>
<p>OLMo-7B 在 8 个核心 zero-shot 任务上的表现如下:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="right">arc challenge</th>
<th align="right">arc easy</th>
<th align="right">boolq</th>
<th align="right">hellaswag</th>
<th align="right">openbookqa</th>
<th align="right">piqa</th>
<th align="right">sciq</th>
<th align="right">winogrande</th>
<th align="right">平均</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Falcon-7B</td>
<td align="right">47.5</td>
<td align="right">70.4</td>
<td align="right">74.6</td>
<td align="right">75.9</td>
<td align="right">53.0</td>
<td align="right">78.5</td>
<td align="right">93.9</td>
<td align="right">68.9</td>
<td align="right">70.3</td>
</tr>
<tr>
<td align="left">LLaMA 7B</td>
<td align="right">44.5</td>
<td align="right">67.9</td>
<td align="right">75.4</td>
<td align="right">76.2</td>
<td align="right">51.2</td>
<td align="right">77.2</td>
<td align="right">93.9</td>
<td align="right">70.5</td>
<td align="right">69.6</td>
</tr>
<tr>
<td align="left">Llama 2 7B</td>
<td align="right">48.5</td>
<td align="right">69.5</td>
<td align="right">80.2</td>
<td align="right">76.8</td>
<td align="right">48.4</td>
<td align="right">76.7</td>
<td align="right">94.5</td>
<td align="right">69.4</td>
<td align="right">70.5</td>
</tr>
<tr>
<td align="left">MPT-7B</td>
<td align="right">46.5</td>
<td align="right">70.5</td>
<td align="right">74.2</td>
<td align="right">77.6</td>
<td align="right">48.6</td>
<td align="right">77.3</td>
<td align="right">93.7</td>
<td align="right">69.9</td>
<td align="right">69.8</td>
</tr>
<tr>
<td align="left"><strong>OLMo-7B</strong></td>
<td align="right"><strong>48.5</strong></td>
<td align="right"><strong>65.4</strong></td>
<td align="right"><strong>73.4</strong></td>
<td align="right"><strong>76.4</strong></td>
<td align="right"><strong>50.4</strong></td>
<td align="right"><strong>78.4</strong></td>
<td align="right"><strong>93.8</strong></td>
<td align="right"><strong>67.9</strong></td>
<td align="right"><strong>69.3</strong></td>
</tr>
</tbody></table>
<blockquote>
<p>表 4: OLMo-7B 与同期 7B 规模模型的 zero-shot 性能对比.</p>
</blockquote>
<blockquote>
<p><strong>Thinking (Data Experiment)</strong>: OLMo-7B 的平均分 69.3 略低于 Llama 2 7B(70.5)和 Falcon-7B(70.3), 但高于 LLaMA 7B(69.6). 这一定位是「competitive 但非领先」. 作者坦诚地指出了相对弱点: arc_easy(65.4 vs Llama 2 的 69.5)和 boolq(73.4 vs 80.2)上的差距明显. 这种 self-assessment 的诚实性与一些模型报告只强调 best results 的做法形成对比. 性能差距的根源可能有多个: (1) 训练数据量: OLMo-7B 训练了 2.46T tokens, 而 Llama 2 7B 训练了 2T——数据量更多但性能略低, 说明数据质量或数据混合可能有差异; (2) 上下文长度: OLMo 的 2048 比 Llama 2 的 4096 短, 在需要长距离推理的任务上可能处于劣势; (3) 数据去污染: OLMo 的显式去污染可能移除了部分对评估任务有用的数据, 而竞争对手的去污染策略不明确.</p>
</blockquote>
<h3 id="6-2-sphxn">6.2 适配后性能</h3>
<p>经过指令微调(SFT)和 DPO 对齐后, OLMo-7B 的性能显著提升:</p>
<table>
<thead>
<tr>
<th align="left">模型</th>
<th align="right">MMLU 0-shot</th>
<th align="right">AlpacaEval %win</th>
<th align="right">ToxiGen %Toxic</th>
<th align="right">TruthfulQA %Info+True</th>
</tr>
</thead>
<tbody><tr>
<td align="left">OLMo (base)</td>
<td align="right">28.3</td>
<td align="right">-</td>
<td align="right">81.4</td>
<td align="right">31.6</td>
</tr>
<tr>
<td align="left">OLMo + SFT</td>
<td align="right">42.0</td>
<td align="right">56.0</td>
<td align="right">19.0</td>
<td align="right">40.0</td>
</tr>
<tr>
<td align="left">OLMo + SFT + DPO</td>
<td align="right">44.0</td>
<td align="right">61.0</td>
<td align="right">12.0</td>
<td align="right">45.0</td>
</tr>
<tr>
<td align="left">Tulu 2 (Llama 2 + SFT + DPO)</td>
<td align="right">50.4</td>
<td align="right">73.9</td>
<td align="right">7.0</td>
<td align="right">51.7</td>
</tr>
</tbody></table>
<blockquote>
<p>表 5: OLMo-7B 适配前后的性能变化.</p>
</blockquote>
<p>适配后, OLMo 在 MMLU 上从 28.3% 提升至 44.0%, ToxiGen 毒性率从 81.4% 降至 12.0%, 说明基础模型具有良好的适配潜力. 但与在相同后训练数据(Tulu mix)上训练的 Tulu 2(基于 Llama 2)相比, 仍有差距——作者归因于 Llama 2 可能的测试集污染以及 Tulu mix 主要为 Llama 模型设计.</p>
<hr>
<h2 id="7-styxylsdw">7. 生态影响与历史定位</h2>
<h3 id="7-1-dkfkxyddtd">7.1 对开放科学运动的推动</h3>
<blockquote>
<p><strong>Thinking (Lineage)</strong>: OLMo 的发布在开源社区产生了深远的影响. 在它之前, 虽然 Pythia 和 BLOOM 也开放了数据和代码, 但模型规模较小(最高 6.9B), 且在性能上与同期商业模型差距较大. OLMo-7B 是首个在 7B 规模上同时达到 competitive 性能并完全开放所有训练资产(权重、代码、数据、Checkpoint、日志)的模型. 这一发布直接催生了后续多个「完全开放&quot;项目, 包括 LLM360(Amber、CrystalCoder)和 OLMo 自身的后续版本(OLMo 2、OLMo 3). 更重要的是, OLMo 证明了「完全开放&quot;在技术上是可行的, 在性能上不需要做大幅妥协——这打破了「开放 = 落后&quot;的刻板印象, 为研究机构争取开放政策支持提供了实证.</p>
</blockquote>
<h3 id="7-2-olmo-jzdyj">7.2 OLMo 家族的演进</h3>
<p>OLMo 的后续版本在保持开放哲学的同时, 逐步提升性能:</p>
<ul>
<li><strong>OLMo 2 (2024.11)</strong>: 7B 和 13B 变体, 改进了训练数据混合, 在部分基准上接近 Llama 3.1 8B.</li>
<li><strong>OLMo 3 (2025.11)</strong>: 引入混合架构(线性注意力 + 标准注意力), 32B 推理专用变体.</li>
</ul>
<blockquote>
<p><strong>Thinking (Lineage)</strong>: OLMo 家族的演进轨迹很有趣: 第一代(OLMo 1)证明了完全开放的可行性; 第二代(OLMo 2)证明完全开放可以接近商业开源模型的性能; 第三代(OLMo 3)则在架构上开始探索创新(混合线性注意力). 这个演进方向反映了 AI2 的战略: 先建立开放的基线和信任, 再逐步引入技术创新. 与 DeepSeek、Qwen 等追求 SOTA 的模型家族不同, OLMo 的目标用户是学术研究者而非商业部署者, 因此其设计决策(如保持数据分离、发布中间Checkpoint)始终围绕「可研究性&quot;而非「可部署性&quot;.</p>
</blockquote>
<h3 id="7-3-jxxybj">7.3 局限性与边界</h3>
<p>OLMo 的完全开放策略虽然具有不可替代的科研价值, 但也存在明确的局限性:</p>
<ol>
<li><p><strong>性能天花板</strong>: OLMo-7B 在核心基准上落后于同期的 Llama 2 7B 和 Falcon-7B, 且差距在更大规模上可能扩大. 这反映了「完全开放&quot;与「性能领先&quot;之间的 trade-off: 当竞争对手使用专有数据、专有优化器和专有评估策略时, 完全开放的模型很难在相同计算预算下超越它们.</p>
</li>
<li><p><strong>英语主导</strong>: Dolma 数据集的构成以英语网页为主, 多语言能力不足. 这与 LLaMA 2 和后来的 Llama 3 形成了对比, 后者在多语言数据上做了显著投入.</p>
</li>
<li><p><strong>规模限制</strong>: OLMo 1 仅发布了 1B 和 7B 两个规模, 缺乏更大规模(如 13B/70B)的模型. 这使得研究者无法利用 OLMo 进行规模缩放(scaling)研究——而缩放定律正是语言模型科学的核心课题之一.</p>
</li>
</ol>
<blockquote>
<p><strong>Thinking (Limitation)</strong>: 第三个局限在 OLMo 2 中得到了部分解决(发布了 13B), 但 OLMo 家族至今没有 70B 规模的模型. 这可能有几个原因: 计算资源限制(AI2 是非营利机构, 训练预算有限)、工程复杂度(更大规模的训练需要更复杂的并行策略和故障恢复机制)、以及战略目标(OLMo 的定位是「科研基线」, 而非「最强模型&quot;). 然而, 70B 模型的缺失确实限制了 OLMo 在某些研究方向上的适用性, 如涌现能力研究、多步推理能力分析等, 这些能力通常在 10B+ 规模才开始显著出现.</p>
</blockquote>
<hr>
<h2 id="8-zj">8. 总结</h2>
<p>OLMo-1 不是一个追求 SOTA 的模型, 而是一个追求「可被完全理解」的模型. 它的架构选择(无偏置、非参数化 Layer Norm、SwiGLU、RoPE)全部跟随经过验证的最佳实践, 不追求原创但追求稳健. 它的真正创新在于<strong>开放策略</strong>: 权重、代码、数据、Checkpoint、日志全部 Apache 2.0 发布, 使得语言模型从一个黑盒产品转变为一个可研究、可审计、可复现的科学对象.</p>
<p>从工程角度看, OLMo 的训练配置(FSDP + ZeRO、BF16/FP32 混合精度、跨硬件验证)体现了对稳定性和可复现性的高度重视. 从数据科学角度看, Dolma 的来源分离设计和 Paloma 的多领域评估为「数据如何塑造模型能力&quot;这一核心问题提供了前所未有的研究工具.</p>
<p>OLMo-7B 的性能(69.3 平均分)证明了完全开放不需要以大幅牺牲性能为代价——它足够 competitive, 可以作为基线模型进行进一步研究, 同时又足够透明, 使得研究结果的因果解释成为可能. 这种「透明竞争力&quot;的组合, 使 OLMo 成为 2024 年开源语言模型领域最具影响力的发布之一, 其影响不仅限于模型本身, 更在于它为开放 AI 研究设定了一个新的标准.</p>
`;
  const toc: { level: number; id: string; text: string }[] = [{"level":2,"id":"1-sjln-kysnq-efxnjsxs","text":"1. 设计理念: 科研使能器, 而非性能竞赛选手"},{"level":2,"id":"2-jggl-wsgszjsj","text":"2. 架构概览: 务实跟随最佳实践"},{"level":3,"id":"2-1-wpzjg","text":"2.1 无偏置架构"},{"level":3,"id":"2-2-fcsh-layer-norm-ygsjdxz","text":"2.2 非参数化 Layer Norm: 一个少见的选择"},{"level":3,"id":"2-3-swi-glu-yttlyh","text":"2.3 SwiGLU 与吞吐量优化"},{"level":3,"id":"2-4-xzwzbm-rope","text":"2.4 旋转位置编码(RoPE)"},{"level":3,"id":"2-5-cbsj-c-pii-zbdyjdq","text":"2.5 词表设计: 从 PII 遮蔽到硬件对齐"},{"level":2,"id":"3-xlgc-kyjyzyjdcl","text":"3. 训练工程: 跨硬件验证与精度策略"},{"level":3,"id":"3-1-fbsxlkj","text":"3.1 分布式训练框架"},{"level":3,"id":"3-2-hhjdxldwdxcs","text":"3.2 混合精度训练的稳定性措施"},{"level":3,"id":"3-3-yhqpz","text":"3.3 优化器配置"},{"level":3,"id":"3-4-kyjptxlyz","text":"3.4 跨硬件平台训练验证"},{"level":2,"id":"4-dolma-kfsjjdkysj","text":"4. Dolma: 开放数据集的科研设计"},{"level":3,"id":"4-1-sjgc","text":"4.1 数据构成"},{"level":3,"id":"4-2-sjzllsx","text":"4.2 数据整理流水线"},{"level":2,"id":"5-pgtx-zxfxyqwr","text":"5. 评估体系: 纵向分析与去污染"},{"level":3,"id":"5-1-szpgkj","text":"5.1 双重评估框架"},{"level":3,"id":"5-2-xsqwr","text":"5.2 显式去污染"},{"level":3,"id":"5-3-zxpgqdjgjc","text":"5.3 在线评估驱动架构决策"},{"level":2,"id":"6-xndw-jzleflx","text":"6. 性能定位: 竞争力而非领先"},{"level":3,"id":"6-1-xyrwpg","text":"6.1 下游任务评估"},{"level":3,"id":"6-2-sphxn","text":"6.2 适配后性能"},{"level":2,"id":"7-styxylsdw","text":"7. 生态影响与历史定位"},{"level":3,"id":"7-1-dkfkxyddtd","text":"7.1 对开放科学运动的推动"},{"level":3,"id":"7-2-olmo-jzdyj","text":"7.2 OLMo 家族的演进"},{"level":3,"id":"7-3-jxxybj","text":"7.3 局限性与边界"},{"level":2,"id":"8-zj","text":"8. 总结"}];
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LlmGuideNav currentRoute="14-models/14.4-olmo/01-olmo/05-olmo-architecture-overview" />
      <main className="flex-1 min-w-0 px-6 pt-20 pb-12 lg:pt-12">
        <LlmGuideChapterBar currentRoute="14-models/14.4-olmo/01-olmo/05-olmo-architecture-overview" />
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">OLMo 核心架构与全开放生态剖析</h1>
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
